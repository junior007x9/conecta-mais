// db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  // O "|| 'file:./local.db'" impede o erro de URL_INVALID durante o build da Vercel
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export const db = drizzle(client, { schema });