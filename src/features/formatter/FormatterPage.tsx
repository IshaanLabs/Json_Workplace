import { useState, useCallback } from 'react'
import { useStore } from '@/store'
import { MonacoEditor } from '@/components/MonacoEditor'
import { SectionHeader } from '@/components/SectionHeader'
import { ClearButton } from '@/components/ClearButton'
import { CopyButton } from '@/components/CopyButton'
import { JsonStatusBadge } from '@/components/JsonStatusBadge'
import { jsonFormat } from '@/utils/jsonFormat'
import { jsonMinify } from '@/utils/jsonMinify'
import { jsonSortKeys } from '@/utils/jsonSortKeys'
import type { FormatMode } from '@/types/ui'
import { AlignLeft, Minimize2, ArrowDownUp, Loader2, Download } from 'lucide-react'
import { cn } from '@/utils/classNames'

const FORMAT_ACTIONS = [
  { id: 'pretty-2' as FormatMode, label: '2 spaces', icon: <AlignLeft size={14} aria-hidden="true" />, title: 'Pretty print (2-space indent)' },
  { id: 'pretty-4' as FormatMode, label: '4 spaces', icon: <AlignLeft size={14} aria-hidden="true" />, title: 'Pretty print (4-space indent)' },
  { id: 'minify'   as FormatMode, label: 'Minify',   icon: <Minimize2 size={14} aria-hidden="true" />, title: 'Remove all whitespace' },
  { id: 'sort-keys' as FormatMode, label: 'Sort Keys', icon: <ArrowDownUp size={14} aria-hidden="true" />, title: 'Sort object keys alphabetically' },
]

function downloadJson(text: string) {
  const a = document.createElement('a')
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text)
  a.download = 'output.json'
  a.click()
}

export function FormatterPage() {
  const rawInput = useStore((s) => s.rawInput)
  const setRawInput = useStore((s) => s.setRawInput)
  const isValid = useStore((s) => s.isValid)
  const setCursorPosition = useStore((s) => s.setCursorPosition)

  const output = useStore((s) => s.output)
  const setOutput = useStore((s) => s.setOutput)
  const activeMode = useStore((s) => s.activeMode)
  const setActiveMode = useStore((s) => s.setActiveMode)

  const [isProcessing, setIsProcessing] = useState(false)
  const [formatError, setFormatError] = useState<string | null>(null)

  const handleFormat = useCallback(
    async (mode: FormatMode) => {
      if (!rawInput.trim() || !isValid) return
      setIsProcessing(true)
      setFormatError(null)
      setActiveMode(mode)

      try {
        let result: { ok: true; value: string } | { ok: false; error: string }
        if (mode === 'pretty-2' || mode === 'pretty-4') {
          result = await jsonFormat(rawInput, mode === 'pretty-2' ? 2 : 4)
        } else if (mode === 'minify') {
          result = jsonMinify(rawInput)
        } else {
          result = jsonSortKeys(rawInput)
        }

        if (result.ok) {
          setOutput(result.value)
        } else {
          setFormatError(result.error)
          setOutput('')
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [rawInput, isValid, setActiveMode, setOutput]
  )

  const handleClear = useCallback(() => {
    setRawInput('')
    setOutput('')
    setActiveMode(null)
    setFormatError(null)
  }, [setRawInput, setOutput, setActiveMode])

  const canFormat = rawInput.trim().length > 0 && isValid

  return (
    <div className="flex flex-col h-full">
      {/* ── Input Panel ── */}
      <SectionHeader
        title="Input JSON"
        actions={
          <div className="flex items-center gap-2">
            {rawInput && <JsonStatusBadge isValid={isValid} />}
            <ClearButton onClick={handleClear} disabled={!rawInput} />
          </div>
        }
      />
      <div className="flex-[2] min-h-0">
        <MonacoEditor
          value={rawInput}
          onChange={setRawInput}
          onCursorChange={(line, column) => setCursorPosition({ line, column })}
          height="100%"
          aria-label="Input JSON editor"
        />
      </div>

      {/* ── Format Action Bar ── */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-t border-b border-[var(--color-border)]',
          'bg-[var(--color-surface)] shrink-0 flex-wrap'
        )}
        role="toolbar"
        aria-label="Format actions"
      >
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Format:</span>
        {FORMAT_ACTIONS.map(({ id, label, icon, title }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleFormat(id)}
            disabled={!canFormat || isProcessing}
            title={title}
            className={cn(
              'inline-flex items-center gap-1.5 rounded px-2 py-1',
              'text-xs font-medium border transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]',
              activeMode === id
                ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
              (!canFormat || isProcessing) && 'opacity-40 cursor-not-allowed'
            )}
          >
            {icon}
            {label}
            {isProcessing && activeMode === id && (
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            )}
          </button>
        ))}
        {!isValid && rawInput && (
          <span className="text-xs text-[var(--color-error)] ml-auto">
            Fix JSON errors before formatting
          </span>
        )}
      </div>

      {/* ── Output Panel ── */}
      <SectionHeader
        title="Formatted Output"
        actions={
          output
            ? <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadJson(output)}
                  title="Download as output.json"
                  aria-label="Download JSON"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded px-2 py-1',
                    'text-xs font-medium border transition-colors',
                    'bg-[var(--color-surface)] border-[var(--color-border)]',
                    'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                    'hover:bg-[var(--color-surface-hover)]'
                  )}
                >
                  <Download size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <CopyButton text={output} label="Copy" />
              </div>
            : undefined
        }
      />

      {formatError ? (
        <div className="flex-[2] min-h-0 flex items-start p-4">
          <div className="rounded p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] text-[var(--color-error)] text-xs font-mono max-w-full overflow-auto">
            {formatError}
          </div>
        </div>
      ) : !output ? (
        <div className="flex-[2] min-h-0 flex items-center justify-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            {rawInput && !isValid
              ? 'Fix the JSON errors above before formatting.'
              : 'Paste valid JSON above and choose a format action.'}
          </p>
        </div>
      ) : (
        <div className="flex-[2] min-h-0">
          <MonacoEditor value={output} readOnly height="100%" aria-label="Formatted output" />
        </div>
      )}
    </div>
  )
}
