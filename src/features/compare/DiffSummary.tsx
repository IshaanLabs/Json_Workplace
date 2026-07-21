import type { DiffSummary as DiffSummaryType } from '@/store/compareSlice'
import { Plus, Minus, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface DiffSummaryProps {
  summary: DiffSummaryType
}

export function DiffSummary({ summary }: DiffSummaryProps) {
  const { added, removed, changed } = summary

  if (added === 0 && removed === 0 && changed === 0) return null

  return (
    <div
      className="flex items-center gap-2 ml-auto"
      role="status"
      aria-label={`Diff: ${added} added, ${removed} removed, ${changed} changed`}
    >
      {added > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            'text-[var(--color-diff-added-text)]'
          )}
        >
          <Plus size={12} aria-hidden="true" />
          {added} added
        </span>
      )}
      {removed > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            'text-[var(--color-diff-removed-text)]'
          )}
        >
          <Minus size={12} aria-hidden="true" />
          {removed} removed
        </span>
      )}
      {changed > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            'text-[var(--color-diff-changed-text)]'
          )}
        >
          <RefreshCw size={12} aria-hidden="true" />
          {changed} changed
        </span>
      )}
    </div>
  )
}
