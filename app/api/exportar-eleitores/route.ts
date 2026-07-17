// app/api/exportar-eleitores/route.ts
export const dynamic = 'force-dynamic'; // <-- Esta linha impede que a Vercel quebre na compilação

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '../../../db';
import { voters, users } from '../../../db/schema';
import { eq, desc, and, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  
  if (!sessionCookie) {
    return new NextResponse('Acesso negado', { status: 401 });
  }

  const user = JSON.parse(sessionCookie.value);
  const isAdmin = user.role === 'admin';

  const searchParams = request.nextUrl.searchParams;
  const filtroBairro = searchParams.get('bairro');
  const filtroTipo = searchParams.get('tipo');
  const filtroLideranca = searchParams.get('lideranca');

  const condicoes = [];
  if (!isAdmin) condicoes.push(eq(voters.lideranca_id, user.id));
  if (filtroBairro) condicoes.push(like(voters.bairro, `%${filtroBairro}%`));
  if (filtroTipo) condicoes.push(eq(voters.tipo_cadastro, filtroTipo as any));
  if (isAdmin && filtroLideranca) condicoes.push(like(users.nome, `%${filtroLideranca}%`));

  const queryWhere = condicoes.length > 0 ? and(...condicoes) : undefined;

  const listaEleitores = await db
    .select({
      nome: voters.nome_completo,
      whatsapp: voters.whatsapp,
      bairro: voters.bairro,
      tipo: voters.tipo_cadastro,
      lideranca: users.nome,
      data_nascimento: voters.data_nascimento,
      profissao: voters.profissao,
      cargo_funcao: voters.cargo_funcao,
    })
    .from(voters)
    .leftJoin(users, eq(voters.lideranca_id, users.id))
    .where(queryWhere)
    .orderBy(desc(voters.criado_em));

  let csv = 'Nome,WhatsApp,Bairro,Classificacao,Lideranca,Data de Nascimento,Profissao,Cargo/Funcao\n';

  listaEleitores.forEach((row) => {
    const nome = `"${row.nome}"`;
    const whatsapp = `"${row.whatsapp}"`;
    const bairro = `"${row.bairro}"`;
    const tipo = `"${row.tipo || ''}"`;
    const lideranca = `"${row.lideranca || ''}"`;
    const dataNasc = `"${row.data_nascimento.split('-').reverse().join('/')}"`;
    const profissao = `"${row.profissao || ''}"`;
    const cargo = `"${row.cargo_funcao || ''}"`;

    csv += `${nome},${whatsapp},${bairro},${tipo},${lideranca},${dataNasc},${profissao},${cargo}\n`;
  });

  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', 'attachment; filename="relatorio_conectamais_filtrado.csv"');
  const bom = '\uFEFF';

  return new NextResponse(bom + csv, { status: 200, headers });
}