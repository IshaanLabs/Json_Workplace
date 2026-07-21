import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useDebounce } from '@/hooks/useDebounce'
import { MonacoEditor } from '@/components/MonacoEditor'
import { SectionHeader } from '@/components/SectionHeader'
import { ClearButton } from '@/components/ClearButton'
import { JsonStatusBadge } from '@/components/JsonStatusBadge'
import { DiffView } from './DiffView'
import { DiffSummary } from './DiffSummary'
import { jsonParse } from '@/utils/jsonParse'
import { jsonDiff } from '@/utils/jsonDiff'
import { ArrowLeftRight, Maximize2 } from 'lucide-react'
import { cn } from '@/utils/classNames'

export function ComparePage() {
  const leftInput = useStore((s) => s.leftInput)
  const rightInput = useStore((s) => s.rightInput)
  const setLeftInput = useStore((s) => s.setLeftInput)
  const setRightInput = useStore((s) => s.setRightInput)
  const diffDelta = useStore((s) => s.diffDelta)
  const diffSummary = useStore((s) => s.diffSummary)
  const setDiffDelta = useStore((s) => s.setDiffDelta)
  const setDiffSummary = useStore((s) => s.setDiffSummary)
  const swapInputs = useStore((s) => s.swapInputs)
  const clearAll = useStore((s) => s.clearAll)

  const [fullscreenEditor, setFullscreenEditor] = useState<'left' | 'right' | null>(null)

  const debouncedLeft = useDebounce(leftInput, 400)
  const debouncedRight = useDebounce(rightInput, 400)

  const leftValid = !leftInput.trim() || jsonParse(leftInput).ok
  const rightValid = !rightInput.trim() || jsonParse(rightInput).ok

  useEffect(() => {
    if (!debouncedLeft.trim() || !debouncedRight.trim()) {
      setDiffDelta(null)
      setDiffSummary(null)
      return
    }
    const l = jsonParse(debouncedLeft)
    const r = jsonParse(debouncedRight)
    if (!l.ok || !r.ok) return

    const result = jsonDiff(l.value, r.value)
    if (result.ok) {
      setDiffDelta(result.delta)
      setDiffSummary(result.summary)
    }
  }, [debouncedLeft, debouncedRight, setDiffDelta, setDiffSummary])

  useEffect(() => {
    if (!fullscreenEditor) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreenEditor(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenEditor])

  const handleClear = useCallback(() => clearAll(), [clearAll])

  const bothHaveInput = leftInput.trim().length > 0 && rightInput.trim().length > 0
  const bothValid = leftValid && rightValid
  const compareStatus = !bothHaveInput
    ? null
    : !bothValid
      ? 'invalid'
      : diffSummary
        ? diffSummary.added === 0 && diffSummary.removed === 0 && diffSummary.changed === 0
          ? 'identical'
          : 'has-diff'
        : 'pending'

  return (
    <div className="flex h-full flex-col">
      {fullscreenEditor ? (
        <div className="fixed inset-0 z-[1200] flex flex-col bg-[var(--color-background)]">
          <SectionHeader
            title={fullscreenEditor === 'left' ? 'Original' : 'Modified'}
            actions={
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFullscreenEditor(null)} className="viewer-action-btn">
                  <Maximize2 size={13} aria-hidden="true" />
                  <span>Exit Full</span>
                </button>
              </div>
            }
          />
          <div className="flex-1 min-h-0">
            <MonacoEditor
              value={fullscreenEditor === 'left' ? leftInput : rightInput}
              onChange={fullscreenEditor === 'left' ? setLeftInput : setRightInput}
              height="100%"
              aria-label={fullscreenEditor === 'left' ? 'Original JSON' : 'Modified JSON'}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-[3] flex-col md:flex-row">
          <div className="flex min-h-0 flex-1 flex-col min-w-0">
            <SectionHeader
              title="Original"
              actions={
                <div className="flex items-center gap-2">
                  {leftInput ? <JsonStatusBadge isValid={leftValid} /> : null}
                  <button type="button" onClick={() => setFullscreenEditor('left')} className="viewer-action-btn">
                    <Maximize2 size={13} aria-hidden="true" />
                    <span>Full</span>
                  </button>
                </div>
              }
            />
            <div className="min-h-0 flex-1">
              <MonacoEditor value={leftInput} onChange={setLeftInput} height="100%" aria-label="Original JSON" />
            </div>
          </div>

          <div className="hidden w-px shrink-0 bg-[var(--color-border)] md:block" aria-hidden="true" />

          <div className="flex min-h-0 flex-1 flex-col min-w-0">
            <SectionHeader
              title="Modified"
              actions={
                <div className="flex items-center gap-2">
                  {rightInput ? <JsonStatusBadge isValid={rightValid} /> : null}
                  <button type="button" onClick={() => setFullscreenEditor('right')} className="viewer-action-btn">
                    <Maximize2 size={13} aria-hidden="true" />
                    <span>Full</span>
                  </button>
                </div>
              }
            />
            <div className="min-h-0 flex-1">
              <MonacoEditor value={rightInput} onChange={setRightInput} height="100%" aria-label="Modified JSON" />
            </div>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2 border-t border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2" role="toolbar" aria-label="Compare actions">
        <button type="button" onClick={swapInputs} disabled={!leftInput && !rightInput} title="Swap inputs" aria-label="Swap original and modified" className={cn('viewer-action-btn', !leftInput && !rightInput && 'cursor-not-allowed opacity-40')}>
          <ArrowLeftRight size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Swap</span>
        </button>

        <ClearButton onClick={handleClear} disabled={!leftInput && !rightInput} label="Clear All" />

        <div className="ml-auto flex items-center gap-2">
          {compareStatus === 'invalid' && <span className="text-xs text-[var(--color-error)]">Fix JSON errors in both editors</span>}
          {compareStatus === 'pending' && <span className="text-xs text-[var(--color-text-muted)]">Comparing…</span>}
          {diffSummary && bothValid && <DiffSummary summary={diffSummary} />}
        </div>
      </div>

      <div className="flex min-h-0 flex-[2] overflow-auto bg-[var(--color-background)] p-4" role="region" aria-label="Diff results" aria-live="polite">
        {compareStatus === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[var(--color-text-muted)]">Paste JSON into both editors — the diff updates automatically.</p>
          </div>
        ) : compareStatus === 'identical' ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[var(--color-success)]">✓ The two JSON documents are identical.</p>
          </div>
        ) : compareStatus === 'has-diff' ? (
          <DiffView delta={diffDelta} />
        ) : null}
      </div>
    </div>
  )
}
