import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso', // A MÁGICA ACONTECE AQUI: Mudamos de sqlite para turso diretamente
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});