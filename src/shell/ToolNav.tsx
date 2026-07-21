import { NavLink } from 'react-router-dom'
import {
  Eye,
  AlignLeft,
  GitCompare,
  CheckCircle,
  Wrench,
} from 'lucide-react'
import { cn } from '@/utils/classNames'

const tools = [
  { id: 'viewer', label: 'Viewer', path: '/viewer', Icon: Eye },
  { id: 'formatter', label: 'Formatter', path: '/formatter', Icon: AlignLeft },
  { id: 'compare', label: 'Compare', path: '/compare', Icon: GitCompare },
  { id: 'validator', label: 'Validator', path: '/validator', Icon: CheckCircle },
  { id: 'corrector', label: 'Corrector', path: '/corrector', Icon: Wrench },
]

export function ToolNav() {
  return (
    <nav
      aria-label="Tool navigation"
      className={cn(
        'flex items-end px-2 shrink-0',
        'bg-[var(--color-surface)] border-b border-[var(--color-border)]'
      )}
      style={{ height: 'var(--height-toolnav)' }}
    >
      {tools.map(({ id, label, path, Icon }) => (
        <NavLink
          key={id}
          to={path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium',
              'border-b-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset',
              isActive
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
            )
          }
          aria-label={label}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
