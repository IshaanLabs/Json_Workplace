import { useCallback } from 'react'
import { useStore } from '@/store'
import { MonacoEditor } from '@/components/MonacoEditor'
import { SectionHeader } from '@/components/SectionHeader'
import { ClearButton } from '@/components/ClearButton'
import { CopyButton } from '@/components/CopyButton'
import { JsonStatusBadge } from '@/components/JsonStatusBadge'
import { IssueList } from './IssueList'
import { Download, Wrench } from 'lucide-react'
import { cn } from '@/utils/classNames'

function downloadJson(text: string) {
  const a = document.createElement('a')
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text)
  a.download = 'corrected.json'
  a.click()
}

export function CorrectorPage() {
  // All corrector state now lives in workspaceSlice — derived from rawInput
  const rawInput = useStore((s) => s.rawInput)
  const setRawInput = useStore((s) => s.setRawInput)
  const isValid = useStore((s) => s.isValid)
  const setCursorPosition = useStore((s) => s.setCursorPosition)

  const issueList = useStore((s) => s.correctorIssues)
  const correctedOutput = useStore((s) => s.correctorOutput)
  const addNotification = useStore((s) => s.addNotification)

  /**
   * Fix All: write the corrected string back to rawInput.
   * This triggers setRawInput which re-parses, rebuilds tree, re-runs corrector —
   * all derived state updates automatically.
   */
  const handleFixAll = useCallback(() => {
    if (!correctedOutput) return
    const autoFixable = issueList.filter((i) => i.autoFixable).length
    setRawInput(correctedOutput)
    addNotification({
      type: 'success',
      message: `Applied ${autoFixable} fix${autoFixable !== 1 ? 'es' : ''}. Editor updated.`,
    })
  }, [correctedOutput, issueList, setRawInput, addNotification])

  /**
   * Fix One: apply a single issue's fix to the raw input by replacing the
   * specific offset range and writing back to rawInput.
   */
  const handleFixOne = useCallback(
    (id: string) => {
      const issue = issueList.find((i) => i.id === id)
      if (!issue || !issue.autoFixable || issue.suggestion === null) return
      if (issue.offset == null || issue.length == null) {
        // Fallback: just apply the full corrected output
        if (correctedOutput) {
          setRawInput(correctedOutput)
          addNotification({ type: 'success', message: `Fix applied: ${issue.description}` })
        }
        return
      }
      const before = rawInput.slice(0, issue.offset)
      const after = rawInput.slice(issue.offset + issue.length)
      const patched = before + issue.suggestion + after
      setRawInput(patched)
      addNotification({ type: 'success', message: `Fixed: ${issue.description}` })
    },
    [issueList, rawInput, correctedOutput, setRawInput, addNotification]
  )

  const handleClear = useCallback(() => setRawInput(''), [setRawInput])

  const autoFixableCount = issueList.filter((i) => i.autoFixable).length
  const hasInput = rawInput.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      {/* ── Input editor ── */}
      <SectionHeader
        title="Input JSON"
        subtitle={issueList.length > 0 ? `${issueList.length} issue${issueList.length !== 1 ? 's' : ''} detected` : undefined}
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
          aria-label="Input JSON editor"
        />
      </div>

      {/* ── Issue Panel ── */}
      {hasInput && (
        <div
          className={cn(
            'shrink-0 border-t border-[var(--color-border)]',
            'bg-[var(--color-surface)] px-4 py-3 max-h-52 overflow-y-auto'
          )}
          role="region"
          aria-label="Detected issues"
          aria-live="polite"
        >
          {issueList.length === 0 ? (
            <p className="text-xs text-[var(--color-success)]">
              ✓ No common JSON errors detected.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--color-text)]">
                  {issueList.length} Issue{issueList.length !== 1 ? 's' : ''} Detected
                </span>
                {autoFixableCount > 0 && correctedOutput && (
                  <button
                    type="button"
                    onClick={handleFixAll}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded px-2.5 py-1',
                      'text-xs font-medium border transition-colors',
                      'bg-[var(--color-accent)] border-[var(--color-accent)] text-white',
                      'hover:bg-[var(--color-accent-hover)]',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]'
                    )}
                  >
                    <Wrench size={12} aria-hidden="true" />
                    Fix All {autoFixableCount} Issue{autoFixableCount !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
              <IssueList issues={issueList} onFixOne={handleFixOne} />
            </>
          )}
        </div>
      )}

      {/* ── Corrected Output (read-only preview before applying) ── */}
      {correctedOutput && correctedOutput !== rawInput && issueList.length > 0 && (
        <>
          <SectionHeader
            title="Preview Corrected Output"
            subtitle="Click 'Fix All' above to apply, or copy/download directly"
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadJson(correctedOutput)}
                  title="Download corrected JSON"
                  aria-label="Download corrected JSON"
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
                <CopyButton text={correctedOutput} label="Copy" />
              </div>
            }
          />
          <div className="flex-1 min-h-0">
            <MonacoEditor
              value={correctedOutput}
              readOnly
              height="100%"
              aria-label="Corrected JSON preview"
            />
          </div>
        </>
      )}

      {!hasInput && (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Paste potentially broken JSON above — common errors will be detected and fix previews shown.
          </p>
        </div>
      )}
    </div>
  )
}
