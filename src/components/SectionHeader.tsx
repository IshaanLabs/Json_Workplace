import { cn } from '@/utils/classNames'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, actions, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-2 border-b',
        'border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-[var(--color-text)]">{title}</h2>
        {subtitle && (
          <p className="truncate text-xs text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
