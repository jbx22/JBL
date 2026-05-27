import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _client = postgres(process.env.DATABASE_URL, {
      max: 5,
      prepare: false,
      ssl: process.env.DATABASE_URL.includes('sslmode=disable')
        ? false
        : 'require',
    });
    _db = drizzle(_client, { schema });
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
