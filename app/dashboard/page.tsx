// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { db } from '../../db';
import { voters } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  if (!sessionCookie) return null;
  const user = JSON.parse(sessionCookie.value);
  const isAdmin = user.role === 'admin';

  const eleitores = isAdmin 
    ? await db.select().from(voters) 
    : await db.select().from(voters).where(eq(voters.lideranca_id, user.id));

  const totalEleitores = eleitores.length;
  const mesAtual = new Date().getMonth() + 1;
  const mesFormatado = mesAtual < 10 ? `0${mesAtual}` : `${mesAtual}`;

  const aniversariantesDoMes = eleitores.filter((eleitor) => {
    if (!eleitor.data_nascimento) return false;
    const mesNascimento = eleitor.data_nascimento.split('-')[1];
    return mesNascimento === mesFormatado;
  });

  const contagemBairros = eleitores.reduce((acc, eleitor) => {
    const bairro = eleitor.bairro.toUpperCase().trim();
    acc[bairro] = (acc[bairro] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBairros = Object.entries(contagemBairros)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      <div className="flex justify-between items-end animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 font-medium mt-1">Inteligência de dados em tempo real.</p>
        </div>
      </div>

      {/* CARDS DE RESUMO (Gradients e Hover Lift) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-2 transition-all duration-300">
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">📊 Total na Base</p>
          <h2 className="text-5xl font-black">{totalEleitores}</h2>
          <p className="text-blue-100 text-sm mt-3 font-medium">Eleitores cadastrados</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-2 transition-all duration-300">
          <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">📍 Expansão</p>
          <h2 className="text-5xl font-black">{Object.keys(contagemBairros).length}</h2>
          <p className="text-emerald-100 text-sm mt-3 font-medium">Bairros de Timon mapeados</p>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-rose-500 text-white p-8 rounded-3xl shadow-lg hover:shadow-rose-500/40 hover:-translate-y-2 transition-all duration-300">
          <p className="text-orange-100 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">🎂 Aniversariantes</p>
          <h2 className="text-5xl font-black">{aniversariantesDoMes.length}</h2>
          <p className="text-orange-100 text-sm mt-3 font-medium">Felicitações no mês atual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* GRÁFICO DE BAIRROS (Barras Animadas) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">🗺️</span> Mapa de Força (Timon)
          </h3>
          <div className="space-y-5">
            {topBairros.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 font-medium">Aguardando cadastros para gerar o mapa...</p>
            ) : (
              topBairros.map(([bairro, quantidade]) => {
                const porcentagem = Math.round((quantidade / totalEleitores) * 100);
                return (
                  <div key={bairro} className="group">
                    <div className="flex justify-between text-sm mb-2 text-slate-600 font-bold">
                      <span className="group-hover:text-indigo-600 transition-colors">{bairro}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{quantidade} ({porcentagem}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${porcentagem}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LISTA DE ANIVERSARIANTES (Cards Modernos) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">🎁</span> Parabéns do Mês
          </h3>
          <div className="overflow-y-auto max-h-[400px] pr-2 space-y-3">
            {aniversariantesDoMes.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 font-medium">Nenhum aniversário registrado para este mês.</p>
            ) : (
              <ul className="space-y-3">
                {aniversariantesDoMes.map((aniv) => (
                  <li key={aniv.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 transition-colors duration-300">
                    <div>
                      <p className="font-black text-slate-800">{aniv.nome_completo}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Data: {aniv.data_nascimento.split('-').reverse().join('/')}</p>
                    </div>
                    <a 
                      href={`https://wa.me/55${aniv.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>💬</span> Chamar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}