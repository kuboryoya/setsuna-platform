import { neon } from '@neondatabase/serverless';
import { feedNeonGotchi } from './action';
import { unstable_cache } from 'next/cache';
import GotchiTimer from './GotchiTimer';

// 1. キャッシュ化されたデータ取得関数
const getGotchiData = unstable_cache(
  async () => {
    console.log("--- ⚡ DBを叩き起こしました！ ---");
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT * FROM neon_gotchi WHERE id = 1`;
    return result[0];
  },
  ['gotchi-key'],
  { tags: ['gotchi'] }
);

// ログ取得用の関数（これもキャッシュ化しておくとNeonに優しい）
const getGotchiLogs = unstable_cache(
  async () => {
    const sql = neon(process.env.DATABASE_URL!);
    return await sql`SELECT * FROM gotchi_logs ORDER BY created_at DESC LIMIT 5`;
  },
  ['gotchi-logs-key'],
  { tags: ['gotchi'] } // 同じタグにしておけばエサやり時に一緒に更新される
);

export default async function Home() {
  // 2. キャッシュからデータを取得（タグ 'gotchi' が有効な間はDBへ行かない）
  const gotchi = await getGotchiData();
  const logs = await getGotchiLogs(); // ログ取得

  // 3. 現在時刻との差分を計算
  const lastFed = new Date(gotchi.last_fed_at).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - lastFed) / 1000);

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
      <h1>Neon-gotchi 2026</h1>

      {/* ここでブラウザ側のタイマーに初期値を渡す */}
      <GotchiTimer key={Date.now()} initialDiff={diffInSeconds} />

      {/* 5分(300秒)経つ前だけボタンを出す */}
      {diffInSeconds <= 300 ? (
        <form action={feedNeonGotchi}>
          <button
            type="submit"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'white',
              background: '#6c5ce7',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
            }}
          >
            エサをあげる
          </button>
        </form>
      ) : (
        <form action={feedNeonGotchi}>
          <button type="submit" style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: '#6c5ce7',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
          }}>
            新しく飼い直す（転生）
          </button>
        </form>
      )}

      <hr style={{ margin: '2rem 0', opacity: 0.2 }} />

      <h3>生存記録（最新5件）</h3>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', display: 'inline-block' }}>
        {logs.map((log: any) => (
          <li key={log.id} style={{ marginBottom: '0.5rem' }}>
            <small>
              [{new Date(log.created_at).toLocaleTimeString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}]
            </small> {log.message}
          </li>
        ))}
      </ul>
    </main>
  )
}