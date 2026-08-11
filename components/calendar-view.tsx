'use client'

import { useMemo, useState } from 'react'
import {
  useStore,
  todayKey,
  colorVar,
  COLORS,
  type Subject,
} from '@/lib/store'
import { cn } from '@/lib/utils'
import { SubjectManager } from '@/components/subject-manager'

const WEEK = ['日', '月', '火', '水', '木', '金', '土']
const ICONS = ['📚', '✏️', '🔤', '📐', '🧪', '🎨', '🎵', '⚽', '💻', '🌏', '📝', '⭐']

export function CalendarView({
  onOpenTimer,
}: {
  onOpenTimer: (subjectId: string) => void
}) {
  const { data, ready, addEvent, removeEvent } = useStore()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState<string>(() => todayKey())
  const [showSubjects, setShowSubjects] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newSubjectId, setNewSubjectId] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const subjectMap = useMemo(() => {
    const m = new Map<string, Subject>()
    data.subjects.forEach((s) => m.set(s.id, s))
    return m
  }, [data.subjects])

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1)
    const startPad = first.getDay()
    const daysInMonth = new Date(
      cursor.year,
      cursor.month + 1,
      0,
    ).getDate()
    const arr: (string | null)[] = []
    for (let i = 0; i < startPad; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      arr.push(key)
    }
    return arr
  }, [cursor])

  const eventsByDate = useMemo(() => {
    const m = new Map<string, typeof data.events>()
    data.events.forEach((e) => {
      const list = m.get(e.date) ?? []
      list.push(e)
      m.set(e.date, list)
    })
    return m
  }, [data.events])

  const selectedEvents = eventsByDate.get(selected) ?? []
  const today = todayKey()

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const handleAdd = () => {
    const sid = newSubjectId || data.subjects[0]?.id
    if (!sid) return
    addEvent({ date: selected, subjectId: sid, title: newTitle.trim() })
    setNewTitle('')
    setAdding(false)
  }

  if (!ready) return <LoadingCard />

  return (
    <div className="flex flex-col gap-4">
      {/* 月ナビ */}
      <div className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-sm">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="前の月"
          className="flex size-10 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          ‹
        </button>
        <h2 className="font-display text-xl font-bold text-foreground">
          {cursor.year}年 {cursor.month + 1}月
        </h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="次の月"
          className="flex size-10 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          ›
        </button>
      </div>

      {/* カレンダー */}
      <div className="rounded-3xl bg-card p-3 shadow-sm">
        <div className="mb-1 grid grid-cols-7">
          {WEEK.map((w, i) => (
            <div
              key={w}
              className={cn(
                'py-1 text-center text-xs font-semibold',
                i === 0 && 'text-destructive/80',
                i === 6 && 'text-chart-5',
                i > 0 && i < 6 && 'text-muted-foreground',
              )}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, idx) => {
            if (!key) return <div key={`pad-${idx}`} />
            const day = Number(key.slice(-2))
            const evs = eventsByDate.get(key) ?? []
            const isToday = key === today
            const isSelected = key === selected
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  'flex min-h-[3.5rem] flex-col items-center gap-1 rounded-2xl p-1 pt-1.5 transition-colors',
                  isSelected
                    ? 'bg-primary/12 ring-2 ring-primary/40'
                    : 'hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground',
                  )}
                >
                  {day}
                </span>
                <span className="flex flex-wrap justify-center gap-0.5 leading-none">
                  {evs.slice(0, 3).map((e) => (
                    <span key={e.id} className="text-[0.6rem]" aria-hidden>
                      {subjectMap.get(e.subjectId)?.icon ?? '•'}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択日の予定 */}
      <div className="rounded-3xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-foreground">
            {selected.replace(/-/g, '/')} の予定
          </h3>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-transform active:scale-95"
          >
            {adding ? 'とじる' : '＋ 追加'}
          </button>
        </div>

        {adding && (
          <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-muted/60 p-3">
            <div className="flex flex-wrap gap-1.5">
              {data.subjects.map((s) => {
                const active =
                  (newSubjectId || data.subjects[0]?.id) === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setNewSubjectId(s.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-all',
                      active ? 'ring-2' : 'opacity-70',
                    )}
                    style={{
                      backgroundColor: `color-mix(in oklch, ${colorVar(s.color)} 20%, var(--card))`,
                      color: colorVar(s.color),
                      // @ts-expect-error css var for ring
                      '--tw-ring-color': colorVar(s.color),
                    }}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {s.name}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="メモ（例: p.20〜30）"
                className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  )
                    handleAdd()
                }}
              />
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {selectedEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            まだ予定がないよ。追加してみよう
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedEvents.map((e) => {
              const s = subjectMap.get(e.subjectId)
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl p-3"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${colorVar(s?.color ?? 'chart-1')} 14%, var(--card))`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => s && onOpenTimer(s.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-full text-lg"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${colorVar(s?.color ?? 'chart-1')} 30%, var(--card))`,
                      }}
                      aria-hidden
                    >
                      {s?.icon ?? '•'}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: colorVar(s?.color ?? 'chart-1') }}
                      >
                        {s?.name ?? '科目'}
                      </span>
                      {e.title && (
                        <span className="text-xs text-muted-foreground">
                          {e.title}
                        </span>
                      )}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      タイマーへ ›
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEvent(e.id)}
                    aria-label="予定を削除"
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 科目管理 */}
      <button
        type="button"
        onClick={() => setShowSubjects((v) => !v)}
        className="rounded-3xl bg-card px-4 py-3 text-left text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        ⚙️ 科目とテーマカラーを{showSubjects ? 'とじる' : '編集する'}
      </button>

      {showSubjects && <SubjectManager icons={ICONS} colors={COLORS} />}
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-3xl bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
      よみこみ中…
    </div>
  )
}
