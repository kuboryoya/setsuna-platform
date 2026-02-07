// app/action.ts
'use server'

import { neon } from '@neondatabase/serverless';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function feedNeonGotchi() {
  const sql = neon(process.env.DATABASE_URL!);

  // 1. 今の状態を確認（生きているか？）
  const [current] = await sql`SELECT last_fed_at, is_alive FROM neon_gotchi WHERE id = 1`;
  const diff = (Date.now() - new Date(current.last_fed_at).getTime()) / 1000;
  const wasDead = diff > 300 || !current.is_alive;

  // 2. 本体を更新
  await sql`
    UPDATE neon_gotchi 
    SET last_fed_at = NOW(), is_alive = TRUE 
    WHERE id = 1
  `;

  // 3. ログを刻む
  const actionType = wasDead ? 'REBIRTH' : 'FEED';
  const message = wasDead ? 'ネオンくんが奇跡の復活を遂げた！' : 'ネオンくんにエサが与えられた。';

  await sql`
    INSERT INTO gotchi_logs (action_type, message) 
    VALUES (${actionType}, ${message})
  `;

  revalidateTag('gotchi', 'max');
  revalidatePath('/');
}