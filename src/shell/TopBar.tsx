import { Github, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/classNames'

export function TopBar() {
  const { theme, toggle } = useTheme()

  return (
    <header
      className={cn(
        'flex items-center justify-between px-4 shrink-0',
        'bg-[var(--color-surface)] border-b border-[var(--color-border)]'
      )}
      style={{ height: 'var(--height-topbar)' }}
      role="banner"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-sm font-semibold text-[var(--color-text)]">JSON Workspace</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <a
          href="https://github.com/IshaanLabs/Json_Workplace"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          aria-label="View source on GitHub"
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5 rounded px-2 py-1',
            'text-xs font-medium text-[var(--color-text-muted)]',
            'hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
            'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]'
          )}
        >
          <Github size={14} aria-hidden="true" />
          <span>GitHub</span>
        </a>

        <button
          type="button"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={cn(
            'rounded p-1.5 text-[var(--color-text-muted)]',
            'hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
            'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]'
          )}
        >
          {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
