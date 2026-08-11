'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useStore,
  colorVar,
  elapsedSeconds,
  type Subject,
} from '@/lib/store'
import { cn } from '@/lib/utils'

function fmt(total: number) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const SPARKLES = [
  { top: '6%', left: '12%', size: 22, delay: '0s' },
  { top: '14%', left: '82%', size: 18, delay: '0.4s' },
  { top: '78%', left: '8%', size: 20, delay: '0.9s' },
  { top: '86%', left: '76%', size: 24, delay: '0.2s' },
  { top: '40%', left: '92%', size: 16, delay: '0.7s' },
  { top: '48%', left: '2%', size: 16, delay: '1.1s' },
]

export function TimerView({
  initialSubject,
  onConsumeInitial,
}: {
  initialSubject: string | null
  onConsumeInitial: () => void
}) {
  const { data, ready, setTimer, saveSession, setCustomImage } = useStore()
  const [subjectId, setSubjectId] = useState<string>('')
  const [display, setDisplay] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const timer = data.timer
  const running = !!timer?.running

  // 初回: カレンダーから来た科目を反映
  useEffect(() => {
    if (initialSubject) {
      setSubjectId(initialSubject)
      onConsumeInitial()
    }
  }, [initialSubject, onConsumeInitial])

  // 起動時に科目を決める（実行中タイマー優先）
  useEffect(() => {
    if (!ready) return
    if (timer) setSubjectId(timer.subjectId)
    else if (!subjectId && data.subjects[0])
      setSubjectId(data.subjects[0].id)
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // 表示更新（バックグラウンド復帰でも Date.now から再計算）
  useEffect(() => {
    setDisplay(elapsedSeconds(timer))
    if (!running) return
    const id = setInterval(() => setDisplay(elapsedSeconds(timer)), 500)
    const onVisible = () => setDisplay(elapsedSeconds(timer))
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [timer, running])

  if (!ready) {
    return (
      <div className="rounded-3xl bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
        よみこみ中…
      </div>
    )
  }

  const activeSubject: Subject | undefined =
    data.subjects.find((s) => s.id === (timer?.subjectId ?? subjectId)) ??
    data.subjects[0]
  const accent = colorVar(activeSubject?.color ?? 'chart-1')

  const start = () => {
    const sid = timer?.subjectId ?? subjectId ?? data.subjects[0]?.id
    if (!sid) return
    setTimer({
      subjectId: sid,
      startedAt: Date.now(),
      baseSeconds: timer && timer.subjectId === sid ? timer.baseSeconds : 0,
      running: true,
    })
  }

  const stop = () => {
    if (!timer) return
    const secs = elapsedSeconds(timer)
    setTimer({ ...timer, baseSeconds: secs, running: false })
    setDisplay(secs)
  }

  const reset = () => {
    if (timer) {
      const secs = elapsedSeconds(timer)
      if (secs > 0) saveSession(timer.subjectId, secs)
    }
    setTimer(null)
    setDisplay(0)
  }

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCustomImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 科目選択 */}
      <div className="rounded-3xl bg-card p-3 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {data.subjects.map((s) => {
            const active = (timer?.subjectId ?? subjectId) === s.id
            return (
              <button
                key={s.id}
                type="button"
                disabled={running}
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-all disabled:cursor-not-allowed',
                  active ? 'ring-2' : 'opacity-60',
                  running && !active && 'hidden',
                )}
                style={{
                  backgroundColor: `color-mix(in oklch, ${colorVar(s.color)} 20%, var(--card))`,
                  color: colorVar(s.color),
                  // @ts-expect-error css var
                  '--tw-ring-color': colorVar(s.color),
                }}
              >
                <span aria-hidden>{s.icon}</span>
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* タイマー本体 */}
      <div className="relative overflow-hidden rounded-[2rem] bg-card p-6 shadow-sm">
        {/* 背景ハロー */}
        {running && (
          <div
            className="animate-halo pointer-events-none absolute inset-0 -z-0"
            style={{
              background: `radial-gradient(circle at 50% 42%, color-mix(in oklch, ${accent} 30%, transparent), transparent 62%)`,
            }}
          />
        )}

        <div className="relative flex flex-col items-center gap-5">
          {/* 画像エリア */}
          <div className="relative flex h-56 w-56 items-center justify-center">
            {/* キラキラ */}
            {running &&
              SPARKLES.map((sp, i) => (
                <span
                  key={i}
                  className="animate-sparkle pointer-events-none absolute select-none"
                  style={{
                    top: sp.top,
                    left: sp.left,
                    fontSize: sp.size,
                    animationDelay: sp.delay,
                  }}
                  aria-hidden
                >
                  ✨
                </span>
              ))}

            {/* 回転リング */}
            <div
              className={cn(
                'absolute inset-0 rounded-full border-4 border-dashed',
                running && 'animate-gentle-spin',
              )}
              style={{
                borderColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
              }}
            />

            {data.customImage ? (
              <img
                src={data.customImage || '/placeholder.svg'}
                alt="お気に入りの写真"
                className={cn(
                  'size-44 rounded-full object-cover shadow-md',
                  running && 'animate-soft-float',
                )}
                crossOrigin="anonymous"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'flex size-44 flex-col items-center justify-center gap-2 rounded-full text-center text-sm text-muted-foreground',
                  running && 'animate-soft-float',
                )}
                style={{
                  backgroundColor: `color-mix(in oklch, ${accent} 16%, var(--card))`,
                }}
              >
                <span className="text-3xl" aria-hidden>
                  🖼️
                </span>
                推しの画像を
                <br />
                えらんでね
              </button>
            )}
          </div>

          {/* 時間表示 */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-muted-foreground">
              {activeSubject?.icon} {activeSubject?.name}
            </span>
            <span
              className="font-display text-6xl font-bold tabular-nums"
              style={{ color: accent }}
            >
              {fmt(display)}
            </span>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-3">
            {!running ? (
              <button
                type="button"
                onClick={start}
                className="rounded-full px-8 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: accent }}
              >
                {timer ? 'つづける' : 'スタート'}
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="rounded-full bg-foreground/80 px-8 py-3 text-base font-semibold text-background shadow-sm transition-transform active:scale-95"
              >
                ストップ
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-muted px-6 py-3 text-base font-medium text-muted-foreground transition-transform active:scale-95"
            >
              リセット
            </button>
          </div>
          {timer && (
            <p className="text-center text-xs text-muted-foreground">
              「リセット」で今の時間を記録して保存するよ
            </p>
          )}
        </div>
      </div>

      {/* 画像変更 */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-3xl bg-card px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        🖼️ 表示する画像を{data.customImage ? '変更する' : 'アップロードする'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPickImage}
        className="hidden"
      />
    </div>
  )
}
