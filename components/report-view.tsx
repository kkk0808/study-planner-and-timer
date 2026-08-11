'use client'

import { useMemo } from 'react'
import { useStore, todayKey, colorVar, type Subject } from '@/lib/store'

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}時間${m}分`
  if (m > 0) return `${m}分`
  return `${sec}秒`
}

export function ReportView() {
  const { data, ready } = useStore()
  const today = todayKey()

  const subjectMap = useMemo(() => {
    const m = new Map<string, Subject>()
    data.subjects.forEach((s) => m.set(s.id, s))
    return m
  }, [data.subjects])

  const todaySessions = useMemo(
    () => data.sessions.filter((s) => s.date === today),
    [data.sessions, today],
  )

  const todayTotal = todaySessions.reduce((a, s) => a + s.seconds, 0)
  const maxToday = Math.max(1, ...todaySessions.map((s) => s.seconds))

  // 直近7日間の合計
  const last7 = useMemo(() => {
    const days: { date: string; label: string; seconds: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = todayKey(d)
      const seconds = data.sessions
        .filter((s) => s.date === key)
        .reduce((a, s) => a + s.seconds, 0)
      days.push({
        date: key,
        label: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
        seconds,
      })
    }
    return days
  }, [data.sessions])

  const max7 = Math.max(1, ...last7.map((d) => d.seconds))
  const weekTotal = last7.reduce((a, d) => a + d.seconds, 0)

  if (!ready) {
    return (
      <div className="rounded-3xl bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
        よみこみ中…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 今日の合計 */}
      <div className="flex flex-col items-center gap-1 rounded-[2rem] bg-primary/12 p-7 text-center shadow-sm">
        <span className="text-sm font-medium text-primary/80">
          きょうの勉強時間
        </span>
        <span className="font-display text-5xl font-bold text-primary">
          {fmtDuration(todayTotal)}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {todayTotal > 0 ? 'えらい！このちょうしで ✨' : 'タイマーで記録してみよう'}
        </span>
      </div>

      {/* 科目別（今日） */}
      <div className="rounded-3xl bg-card p-4 shadow-sm">
        <h3 className="mb-3 font-display text-base font-bold text-foreground">
          科目べつ（きょう）
        </h3>
        {todaySessions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            まだ記録がないよ
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {todaySessions
              .slice()
              .sort((a, b) => b.seconds - a.seconds)
              .map((s) => {
                const subj = subjectMap.get(s.subjectId)
                const c = colorVar(subj?.color ?? 'chart-1')
                return (
                  <li key={s.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <span aria-hidden>{subj?.icon ?? '•'}</span>
                        {subj?.name ?? '科目'}
                      </span>
                      <span className="text-muted-foreground">
                        {fmtDuration(s.seconds)}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(s.seconds / maxToday) * 100}%`,
                          backgroundColor: c,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {/* 7日間グラフ */}
      <div className="rounded-3xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-foreground">
            この7日間
          </h3>
          <span className="text-xs text-muted-foreground">
            合計 {fmtDuration(weekTotal)}
          </span>
        </div>
        <div className="flex h-40 items-end justify-between gap-2">
          {last7.map((d) => {
            const h = (d.seconds / max7) * 100
            const isToday = d.date === today
            return (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-8 rounded-t-xl transition-all"
                    style={{
                      height: `${Math.max(d.seconds > 0 ? 6 : 2, h)}%`,
                      backgroundColor: isToday
                        ? 'var(--primary)'
                        : 'color-mix(in oklch, var(--primary) 35%, var(--muted))',
                    }}
                    title={fmtDuration(d.seconds)}
                  />
                </div>
                <span
                  className={
                    isToday
                      ? 'text-xs font-bold text-primary'
                      : 'text-xs text-muted-foreground'
                  }
                >
                  {d.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
