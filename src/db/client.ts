import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

export const createDb = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

export const db = createDb(process.env.DATABASE_URL!);