import { useMemo, useCallback } from 'react'
import { useStore } from '@/store'
import { useDebounce } from '@/hooks/useDebounce'
import { MonacoEditor } from '@/components/MonacoEditor'
import { ClearButton } from '@/components/ClearButton'
import { CopyButton } from '@/components/CopyButton'
import { JsonStatusBadge } from '@/components/JsonStatusBadge'
import { SectionHeader } from '@/components/SectionHeader'
import { toFriendlyMessage } from '@/store/validatorSlice'
import type { ValidationError } from '@/store/validatorSlice'
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { jsonParse } from '@/utils/jsonParse'

/** Count keys and values in a parsed JSON object */
function countStats(input: string): { keys: number; depth: number } | null {
  const r = jsonParse(input)
  if (!r.ok) return null
  let keys = 0
  let maxDepth = 0
  function walk(v: unknown, d: number) {
    if (d > maxDepth) maxDepth = d
    if (Array.isArray(v)) { v.forEach((i) => walk(i, d + 1)) }
    else if (v !== null && typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>)
      keys += entries.length
      entries.forEach(([, val]) => walk(val, d + 1))
    }
  }
  walk(r.value, 0)
  return { keys, depth: maxDepth }
}

export function ValidatorPage() {
  const rawInput = useStore((s) => s.rawInput)
  const setRawInput = useStore((s) => s.setRawInput)
  const isValid = useStore((s) => s.isValid)
  const parseError = useStore((s) => s.parseError)
  const setCursorPosition = useStore((s) => s.setCursorPosition)

  // Debounce only for the displayed error output — rawInput is always live
  const debouncedInput = useDebounce(rawInput, 250)

  const errors = useMemo((): ValidationError[] => {
    if (!debouncedInput.trim() || isValid) return []
    if (!parseError) return []
    const { friendly, hint } = toFriendlyMessage(parseError.message)
    return [{
      message: parseError.message,
      friendlyMessage: friendly,
      hint,
      line: parseError.line,
      column: parseError.column,
    }]
  }, [debouncedInput, isValid, parseError])

  const stats = useMemo(() => {
    if (!rawInput.trim() || !isValid) return null
    return countStats(rawInput)
  }, [rawInput, isValid])

  const handleClear = useCallback(() => setRawInput(''), [setRawInput])

  const isEmpty = !rawInput.trim()

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Input JSON"
        actions={
          <div className="flex items-center gap-2">
            {rawInput && <JsonStatusBadge isValid={isValid} />}
            {rawInput && <CopyButton text={rawInput} label="Copy" />}
            <ClearButton onClick={handleClear} disabled={!rawInput} />
          </div>
        }
      />
      <div className="flex-1 min-h-0">
        <MonacoEditor
          value={rawInput}
          onChange={setRawInput}
          onCursorChange={(line, column) => setCursorPosition({ line, column })}
          height="100%"
          aria-label="JSON input editor"
        />
      </div>

      <ValidationOutput
        isValid={isValid}
        errors={errors}
        isEmpty={isEmpty}
        stats={stats}
        rawInput={rawInput}
      />
    </div>
  )
}

interface ValidationOutputProps {
  isValid: boolean
  errors: ValidationError[]
  isEmpty: boolean
  stats: { keys: number; depth: number } | null
  rawInput: string
}

function ValidationOutput({ isValid, errors, isEmpty, stats }: ValidationOutputProps) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-[var(--color-border)]',
        'bg-[var(--color-surface)] px-4 py-3',
        'max-h-52 overflow-y-auto'
      )}
      role="region"
      aria-label="Validation results"
      aria-live="polite"
    >
      {isEmpty ? (
        <p className="text-xs text-[var(--color-text-muted)] text-center py-2">
          Paste JSON above to validate it.
        </p>
      ) : isValid ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-success)]">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Valid JSON</span>
          </div>
          {stats && (
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>{stats.keys} key{stats.keys !== 1 ? 's' : ''}</span>
              <span>max depth: {stats.depth}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded p-2.5 border',
                'bg-[var(--color-error-bg)] border-[var(--color-error)]'
              )}
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="text-[var(--color-error)] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0 space-y-1">
                  {(err.line != null || err.column != null) && (
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">
                      {err.line != null && `Line ${err.line}`}
                      {err.column != null && `, Col ${err.column}`}
                    </span>
                  )}
                  <p className="text-xs text-[var(--color-error)] font-semibold">
                    {err.friendlyMessage}
                  </p>
                  {err.hint && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <Lightbulb size={12} className="text-[var(--color-warning)] mt-0.5 shrink-0" aria-hidden="true" />
                      <p className="text-xs text-[var(--color-text-muted)]">{err.hint}</p>
                    </div>
                  )}
                  {err.friendlyMessage !== err.message && (
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 break-all opacity-70">
                      {err.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
