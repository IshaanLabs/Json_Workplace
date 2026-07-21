import { Trash2 } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface ClearButtonProps {
  onClick: () => void
  className?: string
  label?: string
  disabled?: boolean
}

export function ClearButton({ onClick, className, label = 'Clear', disabled }: ClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Clear input"
      aria-label="Clear input"
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-1',
        'text-xs font-medium transition-colors',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'text-[var(--color-text-muted)] hover:text-[var(--color-error)]',
        'hover:bg-[var(--color-error-bg)] hover:border-[var(--color-error)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      <Trash2 size={14} aria-hidden="true" />
      {label && <span>{label}</span>}
    </button>
  )
}
