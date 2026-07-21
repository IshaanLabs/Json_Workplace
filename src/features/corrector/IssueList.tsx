import type { CorrectionIssue } from '@/types/json'
import { AlertTriangle, AlertCircle, Check, Wrench } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface IssueListProps {
  issues: CorrectionIssue[]
  onFixOne: (id: string) => void
}

const ISSUE_ICONS: Record<CorrectionIssue['type'], React.ReactNode> = {
  'trailing-comma': <AlertTriangle size={13} aria-hidden="true" />,
  'single-quoted-string': <AlertTriangle size={13} aria-hidden="true" />,
  'unquoted-key': <AlertTriangle size={13} aria-hidden="true" />,
  'missing-comma': <AlertCircle size={13} aria-hidden="true" />,
  'mismatched-bracket': <AlertCircle size={13} aria-hidden="true" />,
  comment: <AlertTriangle size={13} aria-hidden="true" />,
}

export function IssueList({ issues, onFixOne }: IssueListProps) {
  if (issues.length === 0) return null

  return (
    <ul className="space-y-1.5" role="list" aria-label="Detected issues">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className={cn(
            'flex items-start gap-2 rounded p-2 text-xs',
            'border',
            issue.autoFixable
              ? 'bg-[var(--color-warning-bg)] border-[var(--color-warning)] text-[var(--color-warning)]'
              : 'bg-[var(--color-error-bg)] border-[var(--color-error)] text-[var(--color-error)]'
          )}
          role="listitem"
        >
          <span className="mt-0.5 shrink-0">{ISSUE_ICONS[issue.type]}</span>
          <div className="flex-1 min-w-0">
            <span className="font-mono opacity-70 mr-1.5">
              L{issue.line}, C{issue.column}
            </span>
            <span>{issue.description}</span>
            {issue.suggestion !== null && (
              <div className="mt-0.5 font-mono opacity-80 truncate">
                Fix: <span className="text-[var(--color-text)]">{JSON.stringify(issue.suggestion)}</span>
              </div>
            )}
          </div>
          {issue.autoFixable && (
            <button
              type="button"
              onClick={() => onFixOne(issue.id)}
              title="Apply this fix"
              aria-label={`Fix: ${issue.description}`}
              className={cn(
                'shrink-0 p-1 rounded transition-colors',
                'hover:bg-[var(--color-surface-hover)]',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]'
              )}
            >
              <Wrench size={12} aria-hidden="true" />
            </button>
          )}
          {!issue.autoFixable && (
            <span
              title="Requires manual fix"
              aria-label="Requires manual fix"
              className="shrink-0 p-1 opacity-50"
            >
              <Check size={12} aria-hidden="true" />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
