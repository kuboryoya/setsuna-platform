import { neon } from '@neondatabase/serverless';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  // ネオンごっちの生存確認クエリ（仮）
  const result = await sql`SELECT NOW(), 'alive' as status`;

  return Response.json(result);
}

