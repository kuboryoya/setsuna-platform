'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GotchiTimer({ initialDiff }: { initialDiff: number }) {
  const [seconds, setSeconds] = useState(initialDiff)
  const [isMounted, setIsMounted] = useState(false) // ハイドレーション対策
  const router = useRouter()

  // 1. 初回レンダリング完了（マウント）を検知
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 2. カウントアップ（1秒ごと）
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 3. 同期（5秒おきにサーバーに聞きに行く）
  useEffect(() => {
    const sync = setInterval(() => {
      router.refresh()
    }, 5000)
    return () => clearInterval(sync)
  }, [router])

  // 4. 親（Home）から渡ってくる initialDiff が変わったらリセット
  useEffect(() => {
    setSeconds(initialDiff)
  }, [initialDiff])

  // マウント前（サーバー側）は initialDiff を出し、
  // マウント後（ブラウザ側）は計算後の seconds を出すことでエラーを回避
  const displaySeconds = isMounted ? seconds : initialDiff
  const isDead = displaySeconds > 300

  return (
    <div>
      <div style={{ fontSize: '5rem', margin: '2rem' }}>
        {isDead ? '🪦' : '🦖'}
      </div>
      <p>{isDead ? 'ネオンくんは星になりました...' : 'ネオンくんは空腹に耐えています'}</p>
      <p>最終エサやりから: <strong suppressHydrationWarning>{displaySeconds}秒経過</strong></p>
    </div>
  )
}