// app/dashboard/relatorios/page.tsx
import { cookies } from 'next/headers';
import { db } from '../../../db';
import { voters, users } from '../../../db/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import BotoesAcao from './BotoesAcao';
import FiltrosRelatorio from './FiltrosRelatorio';

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  if (!sessionCookie) return <div>Acesso negado.</div>;
  
  const user = JSON.parse(sessionCookie.value);
  const isAdmin = user.role === 'admin';

  // 1. Pega os filtros da URL
  const params = await searchParams;
  const filtroBairro = params.bairro;
  const filtroTipo = params.tipo;
  const filtroLideranca = params.lideranca;

  // 2. Monta as condições do Banco de Dados dinamicamente
  const condicoes = [];
  
  if (!isAdmin) {
    condicoes.push(eq(voters.lideranca_id, user.id)); // Liderança só vê os dela
  }
  
  if (filtroBairro) condicoes.push(like(voters.bairro, `%${filtroBairro}%`));
  if (filtroTipo) condicoes.push(eq(voters.tipo_cadastro, filtroTipo as any));
  if (isAdmin && filtroLideranca) condicoes.push(like(users.nome, `%${filtroLideranca}%`));

  // Junta todas as condições com "AND"
  const queryWhere = condicoes.length > 0 ? and(...condicoes) : undefined;

  // 3. Faz a busca no banco
  const listaEleitores = await db
    .select({
      id: voters.id,
      nome: voters.nome_completo,
      whatsapp: voters.whatsapp,
      bairro: voters.bairro,
      tipo: voters.tipo_cadastro,
      lideranca: users.nome,
      data_cadastro: voters.criado_em,
    })
    .from(voters)
    .leftJoin(users, eq(voters.lideranca_id, users.id))
    .where(queryWhere)
    .orderBy(desc(voters.criado_em));

  // Link inteligente para o Excel: ele já exporta com os filtros aplicados
  const queryUrl = new URLSearchParams(params as Record<string, string>).toString();
  const linkExportar = `/api/exportar-eleitores${queryUrl ? `?${queryUrl}` : ''}`;

  const formatarTipo = (tipo: string) => {
    switch(tipo) {
      case 'eleitor_consolidado': return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">Consolidado</span>;
      case 'possivel_eleitor': return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">Possível</span>;
      case 'indicacao': return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">Indicação</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{tipo}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Relatório Geral</h1>
          <p className="text-slate-500 font-medium mt-2">
            {isAdmin ? 'Visão completa de todos os cadastros na base.' : 'Lista dos eleitores cadastrados por você.'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm flex items-center gap-2">
            <span className="text-indigo-500">📊</span> Total Filtrado: 
            <span className="text-xl text-slate-900">{listaEleitores.length}</span>
          </div>
          
          <a 
            href={linkExportar} 
            download
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">📥</span> Exportar Planilha
          </a>
        </div>
      </div>

      {/* COMPONENTE DE FILTROS ADICIONADO AQUI */}
      <FiltrosRelatorio isAdmin={isAdmin} />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">Nome do Eleitor</th>
                <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">WhatsApp</th>
                <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">Bairro (Timon)</th>
                <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">Classificação</th>
                {isAdmin && <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">Cadastrado por</th>}
                <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
              {listaEleitores.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-slate-400 font-medium">
                    <div className="text-4xl mb-3">📭</div>
                    Nenhum eleitor encontrado com esses filtros.
                  </td>
                </tr>
              ) : (
                listaEleitores.map((eleitor) => (
                  <tr key={eleitor.id} className="hover:bg-indigo-50/50 transition-colors duration-200 group">
                    <td className="p-5 font-bold text-slate-800 group-hover:text-indigo-900">{eleitor.nome}</td>
                    <td className="p-5 font-medium">{eleitor.whatsapp}</td>
                    <td className="p-5 font-medium">{eleitor.bairro}</td>
                    <td className="p-5">{formatarTipo(eleitor.tipo || '')}</td>
                    {isAdmin && (
                      <td className="p-5 font-bold text-indigo-600 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                          {eleitor.lideranca?.charAt(0)}
                        </div>
                        {eleitor.lideranca}
                      </td>
                    )}
                    <td className="p-5 text-right">
                      <BotoesAcao id={eleitor.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}