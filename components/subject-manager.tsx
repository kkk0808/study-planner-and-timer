'use client'

import { useState } from 'react'
import { useStore, colorVar } from '@/lib/store'
import { cn } from '@/lib/utils'

export function SubjectManager({
  icons,
  colors,
}: {
  icons: string[]
  colors: string[]
}) {
  const { data, addSubject, updateSubject, removeSubject } = useStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(icons[0])
  const [color, setColor] = useState(colors[0])

  const handleAdd = () => {
    if (!name.trim()) return
    addSubject({ name: name.trim(), icon, color })
    setName('')
    setIcon(icons[0])
    setColor(colors[0])
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-sm">
      <ul className="flex flex-col gap-2">
        {data.subjects.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-2xl bg-muted/50 p-2.5"
          >
            <span
              className="flex size-9 items-center justify-center rounded-full text-lg"
              style={{
                backgroundColor: `color-mix(in oklch, ${colorVar(s.color)} 28%, var(--card))`,
              }}
              aria-hidden
            >
              {s.icon}
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">
              {s.name}
            </span>
            <div className="flex gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${s.name}の色を変更`}
                  onClick={() => updateSubject(s.id, { color: c })}
                  className={cn(
                    'size-5 rounded-full transition-transform',
                    s.color === c && 'ring-2 ring-offset-1 ring-foreground/40',
                  )}
                  style={{ backgroundColor: colorVar(c) }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeSubject(s.id)}
              aria-label="科目を削除"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* 新規追加 */}
      <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground">
          新しい科目
        </p>
        <div className="flex flex-wrap gap-1">
          {icons.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-base transition-colors',
                icon === ic ? 'bg-primary/15 ring-2 ring-primary/40' : 'bg-card',
              )}
            >
              {ic}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label="色を選択"
              onClick={() => setColor(c)}
              className={cn(
                'size-7 rounded-full transition-transform',
                color === c && 'ring-2 ring-offset-1 ring-foreground/40',
              )}
              style={{ backgroundColor: colorVar(c) }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="科目名（例: 音楽）"
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
            追加
          </button>
        </div>
      </div>
    </div>
  )
}
