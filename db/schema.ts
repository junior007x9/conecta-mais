// db/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// TABELA 1: USUÁRIOS (Admin e Lideranças)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Gerado via UUID
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha_hash: text('senha_hash').notNull(),
  role: text('role', { enum: ['admin', 'lideranca'] }).notNull().default('lideranca'),
  criado_em: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// TABELA 2: ELEITORES / INDICAÇÕES / POSSÍVEIS ELEITORES
export const voters = sqliteTable('voters', {
  id: text('id').primaryKey(), // Gerado via UUID
  lideranca_id: text('lideranca_id').notNull().references(() => users.id), // Quem cadastrou
  
  // Classificação
  tipo_cadastro: text('tipo_cadastro', { 
    enum: ['eleitor_consolidado', 'possivel_eleitor', 'indicacao'] 
  }).notNull(),

  // Dados Pessoais
  nome_completo: text('nome_completo').notNull(),
  nome_social: text('nome_social'),
  data_nascimento: text('data_nascimento').notNull(), // Formato YYYY-MM-DD
  nacionalidade: text('nacionalidade'), // Opcional
  naturalidade: text('naturalidade'), // Opcional
  estado_civil: text('estado_civil', { enum: ['solteiro', 'casado', 'divorciado', 'viuvo'] }),
  nome_conjuge: text('nome_conjuge'),

  // Contato e Endereço
  endereco_completo: text('endereco_completo').notNull(),
  bairro: text('bairro').notNull(), // Crucial para o mapa de Timon
  ponto_referencia: text('ponto_referencia'),
  whatsapp: text('whatsapp').notNull().unique(), // Evita duplicidade de contato
  email: text('email'),

  // Alertas de Aniversário
  notificar_niver_whats: integer('notificar_niver_whats', { mode: 'boolean' }).default(false),
  notificar_niver_email: integer('notificar_niver_email', { mode: 'boolean' }).default(false),

  // Redes Sociais
  instagram_link: text('instagram_link'),
  seguindo_redes: integer('seguindo_redes', { mode: 'boolean' }).default(false),

  // Dados Políticos
  filiado_partido: integer('filiado_partido', { mode: 'boolean' }).default(false),
  nome_partido: text('nome_partido'),
  motivo_filiacao: text('motivo_filiacao'),

  // Formação e Profissão
  profissao: text('profissao'),
  grau_instrucao: text('grau_instrucao'),
  formacao_academica: text('formacao_academica'),
  classe_social: text('classe_social'),

  // Abas Específicas: Indicação (Todos obrigatórios se tipo_cadastro == 'indicacao')
  cargo_funcao: text('cargo_funcao'),
  secretaria: text('secretaria'),
  local_trabalho: text('local_trabalho'),

 // Auditoria
  criado_em: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizado_em: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  liderancaIdx: index('lideranca_idx').on(table.lideranca_id),
  bairroIdx: index('bairro_idx').on(table.bairro),
}));