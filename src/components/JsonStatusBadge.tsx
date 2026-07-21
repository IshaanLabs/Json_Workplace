import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface JsonStatusBadgeProps {
  isValid: boolean
  className?: string
  showLabel?: boolean
}

export function JsonStatusBadge({ isValid, className, showLabel = true }: JsonStatusBadgeProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={isValid ? 'Valid JSON' : 'Invalid JSON'}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isValid
          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
          : 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
        className
      )}
    >
      {isValid ? (
        <CheckCircle2 size={12} aria-hidden="true" />
      ) : (
        <XCircle size={12} aria-hidden="true" />
      )}
      {showLabel && <span>{isValid ? 'Valid' : 'Invalid'}</span>}
    </span>
  )
}
