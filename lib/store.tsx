'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/* ---------- 型定義 ---------- */

export type Subject = {
  id: string
  name: string
  icon: string
  color: string // chart トークン名: 'chart-1' など
}

export type StudyEvent = {
  id: string
  date: string // YYYY-MM-DD
  subjectId: string
  title: string
}

export type Session = {
  id: string
  date: string // YYYY-MM-DD
  subjectId: string
  seconds: number
}

export type RunningTimer = {
  subjectId: string
  startedAt: number // epoch ms
  baseSeconds: number // 一時停止までに溜まった秒数
  running: boolean
}

export type AppData = {
  subjects: Subject[]
  events: StudyEvent[]
  sessions: Session[]
  timer: RunningTimer | null
  customImage: string | null // dataURL
}

/* ---------- 初期データ ---------- */

const COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: '数学', icon: '📐', color: 'chart-1' },
  { id: 'jp', name: '国語', icon: '✏️', color: 'chart-2' },
  { id: 'en', name: '英語', icon: '🔤', color: 'chart-3' },
  { id: 'sci', name: '理科', icon: '🧪', color: 'chart-4' },
  { id: 'soc', name: '社会', icon: '📚', color: 'chart-5' },
]

const DEFAULT_DATA: AppData = {
  subjects: DEFAULT_SUBJECTS,
  events: [],
  sessions: [],
  timer: null,
  customImage: null,
}

const STORAGE_KEY = 'study-time-data-v1'

/* ---------- ユーティリティ ---------- */

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function colorVar(color: string): string {
  return `var(--${color})`
}

/* 経過秒数を計算（バックグラウンド継続対応） */
export function elapsedSeconds(timer: RunningTimer | null): number {
  if (!timer) return 0
  if (!timer.running) return timer.baseSeconds
  return timer.baseSeconds + Math.floor((Date.now() - timer.startedAt) / 1000)
}

/* ---------- Context ---------- */

type StoreContextType = {
  data: AppData
  ready: boolean
  setData: (updater: (prev: AppData) => AppData) => void
  addSubject: (s: Omit<Subject, 'id'>) => void
  updateSubject: (id: string, patch: Partial<Subject>) => void
  removeSubject: (id: string) => void
  addEvent: (e: Omit<StudyEvent, 'id'>) => void
  removeEvent: (id: string) => void
  saveSession: (subjectId: string, seconds: number) => void
  setTimer: (t: RunningTimer | null) => void
  setCustomImage: (img: string | null) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(DEFAULT_DATA)
  const [ready, setReady] = useState(false)
  const firstLoad = useRef(true)

  // 読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppData>
        setDataState({
          subjects: parsed.subjects?.length
            ? parsed.subjects
            : DEFAULT_SUBJECTS,
          events: parsed.events ?? [],
          sessions: parsed.sessions ?? [],
          timer: parsed.timer ?? null,
          customImage: parsed.customImage ?? null,
        })
      }
    } catch (e) {
      console.log('[v0] load error', e)
    }
    setReady(true)
  }, [])

  // 保存
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.log('[v0] save error', e)
    }
  }, [data, ready])

  const setData = (updater: (prev: AppData) => AppData) =>
    setDataState((prev) => updater(prev))

  const api = useMemo<StoreContextType>(
    () => ({
      data,
      ready,
      setData,
      addSubject: (s) =>
        setDataState((prev) => ({
          ...prev,
          subjects: [...prev.subjects, { ...s, id: uid() }],
        })),
      updateSubject: (id, patch) =>
        setDataState((prev) => ({
          ...prev,
          subjects: prev.subjects.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      removeSubject: (id) =>
        setDataState((prev) => ({
          ...prev,
          subjects: prev.subjects.filter((x) => x.id !== id),
          events: prev.events.filter((e) => e.subjectId !== id),
        })),
      addEvent: (e) =>
        setDataState((prev) => ({
          ...prev,
          events: [...prev.events, { ...e, id: uid() }],
        })),
      removeEvent: (id) =>
        setDataState((prev) => ({
          ...prev,
          events: prev.events.filter((e) => e.id !== id),
        })),
      saveSession: (subjectId, seconds) =>
        setDataState((prev) => {
          if (seconds <= 0) return prev
          const date = todayKey()
          const existing = prev.sessions.find(
            (s) => s.date === date && s.subjectId === subjectId,
          )
          if (existing) {
            return {
              ...prev,
              sessions: prev.sessions.map((s) =>
                s.id === existing.id
                  ? { ...s, seconds: s.seconds + seconds }
                  : s,
              ),
            }
          }
          return {
            ...prev,
            sessions: [
              ...prev.sessions,
              { id: uid(), date, subjectId, seconds },
            ],
          }
        }),
      setTimer: (t) => setDataState((prev) => ({ ...prev, timer: t })),
      setCustomImage: (img) =>
        setDataState((prev) => ({ ...prev, customImage: img })),
    }),
    [data, ready],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { COLORS, DEFAULT_SUBJECTS }
