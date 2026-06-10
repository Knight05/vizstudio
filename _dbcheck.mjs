import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const t = setTimeout(()=>{console.error('QUERY TIMEOUT (12s) — connection hung');process.exit(2);},12000);
try {
  const rows = await p.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
  clearTimeout(t);
  console.log('TABLES:', rows.map(r=>r.tablename).join(', ') || '(none)');
  try { const u = await p.$queryRaw`SELECT count(*)::int AS n FROM users`; console.log('users rows:', u[0].n); } catch(e){ console.log('users query error:', e.message.split('\n')[0]); }
} catch(e){ clearTimeout(t); console.error('DB ERROR:', e.message.split('\n')[0]); process.exit(1);} 
process.exit(0);
