import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '@/store'
import { JsonStatusBadge } from '@/components/JsonStatusBadge'
import { cn } from '@/utils/classNames'

const toolLabels: Record<string, string> = {
  '/viewer': 'Viewer',
  '/formatter': 'Formatter',
  '/compare': 'Compare',
  '/validator': 'Validator',
  '/corrector': 'Corrector',
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return ''
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export function StatusBar() {
  const location = useLocation()
  const isValid = useStore((s) => s.isValid)
  const byteCount = useStore((s) => s.byteCount)
  const cursorPosition = useStore((s) => s.cursorPosition)
  const rawInput = useStore((s) => s.rawInput)
  const tree = useStore((s) => s.tree)
  const issueCount = useStore((s) => s.correctorIssues.length)

  const toolLabel = toolLabels[location.pathname] ?? 'JSON Workspace'

  const stats = useMemo(() => {
    if (!rawInput.trim()) return null

    let objectCount = 0
    let arrayCount = 0
    let keyCount = 0
    let lineCount = rawInput.split(/\r?\n/).length
    let charCount = rawInput.length

    const walk = (value: unknown) => {
      if (Array.isArray(value)) {
        arrayCount += 1
        value.forEach(walk)
        return
      }

      if (value !== null && typeof value === 'object') {
        objectCount += 1
        const entries = Object.entries(value as Record<string, unknown>)
        keyCount += entries.length
        entries.forEach(([, child]) => walk(child))
      }
    }

    if (isValid) {
      walk(tree.length > 0 ? tree[0].value : rawInput)
    }

    return { objectCount, arrayCount, keyCount, lineCount, charCount }
  }, [isValid, rawInput, tree])

  return (
    <footer
      role="contentinfo"
      aria-label="Status bar"
      className={cn(
        'sticky bottom-0 z-20 flex items-center justify-between gap-3 px-3 shrink-0',
        'bg-[var(--color-surface)] border-t border-[var(--color-border)]',
        'text-[10px] text-[var(--color-text-muted)]'
      )}
      style={{ height: 'var(--height-statusbar)' }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-medium">{toolLabel}</span>
        {rawInput && (
          <JsonStatusBadge isValid={isValid} showLabel={false} className="h-4 py-0 text-[10px]" />
        )}
      </div>

      <div className="flex items-center gap-3 overflow-hidden">
        {issueCount > 0 && !isValid && (
          <span className="shrink-0 text-[var(--color-warning)]">{issueCount} fixable</span>
        )}
        {stats && (
          <>
            <span className="shrink-0">Objects {stats.objectCount}</span>
            <span className="shrink-0">Arrays {stats.arrayCount}</span>
            <span className="shrink-0">Keys {stats.keyCount}</span>
            <span className="shrink-0">Lines {stats.lineCount}</span>
            <span className="shrink-0">Chars {stats.charCount}</span>
          </>
        )}
        {byteCount > 0 && (
          <span className="shrink-0" aria-label="File size">{formatBytes(byteCount)}</span>
        )}
        <span className="shrink-0" aria-label="Cursor position">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        {rawInput && <span className="shrink-0">{isValid ? '✓ Valid' : '✗ Invalid'}</span>}
      </div>
    </footer>
  )
}
