// app/actions.ts
'use server'

import { db } from '../db';
import { users, voters } from '../db/schema';
import { eq, or, and } from 'drizzle-orm'; // Importações novas de lógica
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginUsuario(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user && email === 'admin@conectamais.com' && senha === 'admin123') {
      const hash = await bcrypt.hash(senha, 10);
      const id = crypto.randomUUID();
      
      await db.insert(users).values({
          id,
          nome: 'Luis Barbosa',
          email,
          senha_hash: hash,
          role: 'admin'
      });

      const cookieStore = await cookies();
      cookieStore.set('conecta_session', JSON.stringify({ id, role: 'admin', nome: 'Luis Barbosa' }), { httpOnly: true, secure: true });
      redirect('/dashboard');
  }

  if (!user) return { error: 'Usuário não encontrado.' };

  const senhaValida = await bcrypt.compare(senha, user.senha_hash);
  if (!senhaValida) return { error: 'Senha incorreta.' };

  const cookieStore = await cookies();
  cookieStore.set('conecta_session', JSON.stringify({
      id: user.id,
      role: user.role,
      nome: user.nome
  }), { httpOnly: true, secure: true });

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('conecta_session');
  redirect('/');
}

export async function cadastrarLideranca(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  const [existe] = await db.select().from(users).where(eq(users.email, email));
  if (existe) return { error: 'Este e-mail já está em uso por outro usuário.' };

  const hash = await bcrypt.hash(senha, 10);
  const id = crypto.randomUUID();

  await db.insert(users).values({
      id,
      nome,
      email,
      senha_hash: hash,
      role: 'lideranca'
  });

  return { success: 'Liderança cadastrada com sucesso!' };
}

export async function cadastrarEleitor(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  if (!sessionCookie) return { error: 'Sessão expirada. Faça login novamente.' };
  
  const user = JSON.parse(sessionCookie.value);
  const lideranca_id = user.id;

  const tipo_cadastro = formData.get('tipo_cadastro') as 'eleitor_consolidado' | 'possivel_eleitor' | 'indicacao';
  
  // Pegando os dados críticos para checar duplicidade
  const whatsapp = formData.get('whatsapp') as string;
  const nome_completo = (formData.get('nome_completo') as string).trim();
  const data_nascimento = formData.get('data_nascimento') as string;

  // 1. INTELIGÊNCIA CONTRA DUPLICIDADE
  // Busca no banco se existe o mesmo WhatsApp OU (mesmo Nome + mesma Data de Nascimento)
  const [eleitorExistente] = await db
    .select({
      nome_eleitor: voters.nome_completo,
      lideranca_nome: users.nome
    })
    .from(voters)
    .leftJoin(users, eq(voters.lideranca_id, users.id))
    .where(
      or(
        eq(voters.whatsapp, whatsapp),
        and(
          eq(voters.nome_completo, nome_completo),
          eq(voters.data_nascimento, data_nascimento)
        )
      )
    );

  // Se o sistema encontrar qualquer traço de duplicidade, barra na hora!
  if (eleitorExistente) {
    return { 
      error: `⚠️ BLOQUEADO: O eleitor(a) "${eleitorExistente.nome_eleitor}" já está na base de dados. Este cadastro foi realizado pela liderança "${eleitorExistente.lideranca_nome || 'Desconhecida'}".` 
    };
  }

  // Se passar no teste, salva no banco normalmente
  try {
    await db.insert(voters).values({
      id: crypto.randomUUID(),
      lideranca_id,
      tipo_cadastro,
      
      nome_completo,
      nome_social: formData.get('nome_social') as string,
      data_nascimento,
      nacionalidade: formData.get('nacionalidade') as string,
      naturalidade: formData.get('naturalidade') as string,
      estado_civil: formData.get('estado_civil') as any,
      nome_conjuge: formData.get('nome_conjuge') as string,

      endereco_completo: formData.get('endereco_completo') as string,
      bairro: formData.get('bairro') as string,
      ponto_referencia: formData.get('ponto_referencia') as string,
      whatsapp,
      email: formData.get('email') as string,

      notificar_niver_whats: formData.get('notificar_niver_whats') === 'true',
      notificar_niver_email: formData.get('notificar_niver_email') === 'true',

      instagram_link: formData.get('instagram_link') as string,
      seguindo_redes: formData.get('seguindo_redes') === 'true',

      filiado_partido: formData.get('filiado_partido') === 'true',
      nome_partido: formData.get('nome_partido') as string,
      motivo_filiacao: formData.get('motivo_filiacao') as string,

      profissao: formData.get('profissao') as string,
      grau_instrucao: formData.get('grau_instrucao') as string,
      formacao_academica: formData.get('formacao_academica') as string,
      classe_social: formData.get('classe_social') as string,

      cargo_funcao: formData.get('cargo_funcao') as string,
      secretaria: formData.get('secretaria') as string,
      local_trabalho: formData.get('local_trabalho') as string,
    });

    return { success: 'Cadastro realizado com sucesso!' };
  } catch (error) {
    return { error: 'Ocorreu um erro ao salvar no banco de dados.' };
  }
}

export async function atualizarEleitor(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  if (!sessionCookie) return { error: 'Sessão expirada.' };

  const user = JSON.parse(sessionCookie.value);
  const isAdmin = user.role === 'admin';
  const id = formData.get('id') as string;

  try {
    const [eleitorAtual] = await db.select().from(voters).where(eq(voters.id, id));
    if (!eleitorAtual) return { error: 'Eleitor não encontrado.' };
    
    if (!isAdmin && eleitorAtual.lideranca_id !== user.id) {
      return { error: 'Você não tem permissão para editar esta ficha.' };
    }

    // Validação na hora da EDIÇÃO também!
    const whatsapp = formData.get('whatsapp') as string;
    const nome_completo = (formData.get('nome_completo') as string).trim();
    const data_nascimento = formData.get('data_nascimento') as string;

    const [eleitorExistente] = await db
      .select({ id: voters.id, nome_eleitor: voters.nome_completo, lideranca_nome: users.nome })
      .from(voters)
      .leftJoin(users, eq(voters.lideranca_id, users.id))
      .where(
        or(
          eq(voters.whatsapp, whatsapp),
          and(
            eq(voters.nome_completo, nome_completo),
            eq(voters.data_nascimento, data_nascimento)
          )
        )
      );

    // Se achou uma duplicidade e NÃO é o próprio eleitor que estamos editando
    if (eleitorExistente && eleitorExistente.id !== id) {
      return { error: `⚠️ ESTES DADOS JÁ EXISTEM: Pertencem ao eleitor "${eleitorExistente.nome_eleitor}", sob responsabilidade de "${eleitorExistente.lideranca_nome}".` };
    }

    await db.update(voters).set({
      tipo_cadastro: formData.get('tipo_cadastro') as any,
      nome_completo,
      nome_social: formData.get('nome_social') as string,
      data_nascimento,
      nacionalidade: formData.get('nacionalidade') as string,
      naturalidade: formData.get('naturalidade') as string,
      estado_civil: formData.get('estado_civil') as any,
      nome_conjuge: formData.get('nome_conjuge') as string,

      endereco_completo: formData.get('endereco_completo') as string,
      bairro: formData.get('bairro') as string,
      ponto_referencia: formData.get('ponto_referencia') as string,
      whatsapp,
      email: formData.get('email') as string,

      notificar_niver_whats: formData.get('notificar_niver_whats') === 'true',
      notificar_niver_email: formData.get('notificar_niver_email') === 'true',

      instagram_link: formData.get('instagram_link') as string,
      seguindo_redes: formData.get('seguindo_redes') === 'true',

      filiado_partido: formData.get('filiado_partido') === 'true',
      nome_partido: formData.get('nome_partido') as string,
      motivo_filiacao: formData.get('motivo_filiacao') as string,

      profissao: formData.get('profissao') as string,
      grau_instrucao: formData.get('grau_instrucao') as string,
      formacao_academica: formData.get('formacao_academica') as string,
      classe_social: formData.get('classe_social') as string,

      cargo_funcao: formData.get('cargo_funcao') as string,
      secretaria: formData.get('secretaria') as string,
      local_trabalho: formData.get('local_trabalho') as string,
    }).where(eq(voters.id, id));

    revalidatePath('/dashboard/relatorios');
    return { success: 'Ficha atualizada com sucesso!' };
  } catch (error) {
    return { error: 'Ocorreu um erro ao atualizar a ficha.' };
  }
}

export async function deletarEleitor(id: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  if (!sessionCookie) return { error: 'Não autorizado.' };

  const user = JSON.parse(sessionCookie.value);
  const isAdmin = user.role === 'admin';

  try {
    if (!isAdmin) {
      const [eleitor] = await db.select().from(voters).where(eq(voters.id, id));
      if (eleitor.lideranca_id !== user.id) {
        return { error: 'Você não tem permissão para excluir este eleitor.' };
      }
    }

    await db.delete(voters).where(eq(voters.id, id));
    
    revalidatePath('/dashboard/relatorios');
    return { success: true };
  } catch (error) {
    return { error: 'Erro ao excluir no banco de dados.' };
  }
}