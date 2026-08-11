'use client'

import { useState } from 'react'
import { StoreProvider } from '@/lib/store'
import { CalendarView } from '@/components/calendar-view'
import { TimerView } from '@/components/timer-view'
import { ReportView } from '@/components/report-view'
import { cn } from '@/lib/utils'

type Tab = 'calendar' | 'timer' | 'report'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'calendar', label: 'カレンダー', icon: '🗓️' },
  { id: 'timer', label: 'タイマー', icon: '⏰' },
  { id: 'report', label: 'きろく', icon: '📊' },
]

export default function Page() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [timerSubject, setTimerSubject] = useState<string | null>(null)

  const goTimer = (subjectId: string) => {
    setTimerSubject(subjectId)
    setTab('timer')
  }

  return (
    <StoreProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
        <header className="px-6 pt-8 pb-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Study Time
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            きょうも こつこつ、いっしょに がんばろう
          </p>
        </header>

        <main className="flex-1 px-4 pb-28">
          {tab === 'calendar' && <CalendarView onOpenTimer={goTimer} />}
          {tab === 'timer' && (
            <TimerView
              initialSubject={timerSubject}
              onConsumeInitial={() => setTimerSubject(null)}
            />
          )}
          {tab === 'report' && <ReportView />}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-card/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-stretch justify-around px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-colors',
                    active
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'text-xl transition-transform',
                      active && 'scale-110',
                    )}
                    aria-hidden
                  >
                    {t.icon}
                  </span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </StoreProvider>
  )
}
