import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// For convenience: lazy-access proxy that calls getDb() behind the scenes.
// Works for both server and serverless runtimes because getDb() is idempotent.
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const real = getDb();
    const val = (real as any)[prop];
    if (typeof val === 'function') return val.bind(real);
    return val;
  },
});
