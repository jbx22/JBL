import { readFileSync } from 'fs';
import postgres from 'postgres';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL not set');
  
  const sql = postgres(dbUrl, { prepare: false, ssl: dbUrl.includes('sslmode=disable') ? false : 'require' });
  const migration = readFileSync('./drizzle/0000_real_marrow.sql', 'utf-8');
  const statements = migration.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
  
  console.log(`Found ${statements.length} SQL statements to execute...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.slice(0, 60).replace(/\n/g, ' ');
    try {
      await sql.unsafe(stmt);
      console.log(`  [${i+1}/${statements.length}] OK: ${preview}`);
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        console.log(`  [${i+1}/${statements.length}] SKIP: ${preview}`);
      } else {
        console.error(`  [${i+1}/${statements.length}] ERROR: ${preview} -- ${err.message}`);
      }
    }
  }
  
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log(`\nTables created (${tables.length}):`);
  for (const t of tables as any[]) console.log(`  - ${t.table_name}`);
  console.log('\nMigration complete!');
  await sql.end();
}

main().catch(console.error);
