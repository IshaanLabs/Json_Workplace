import type { DiffDelta } from '@/types/json'
import { cn } from '@/utils/classNames'

interface DiffViewProps {
  delta: DiffDelta
}

type DeltaValue = [unknown] | [unknown, unknown] | [unknown, unknown, 0 | 2 | 3]

export function DiffView({ delta }: DiffViewProps) {
  if (!delta) return null

  return (
    <div className="font-mono text-xs space-y-1" role="list" aria-label="JSON diff">
      {renderDelta(delta as Record<string, unknown>, '')}
    </div>
  )
}

function renderDelta(delta: Record<string, unknown>, path: string): React.ReactNode[] {
  const items: React.ReactNode[] = []

  for (const key of Object.keys(delta)) {
    if (key === '_t') continue

    const val = delta[key]
    const currentPath = path ? `${path}.${key}` : key

    if (Array.isArray(val)) {
      const arr = val as DeltaValue
      if (arr.length === 1) {
        // Added
        items.push(
          <div
            key={currentPath}
            role="listitem"
            aria-label={`Added: ${currentPath}`}
            className={cn(
              'flex items-start gap-2 px-2 py-1 rounded',
              'bg-[var(--color-diff-added)] text-[var(--color-diff-added-text)]'
            )}
          >
            <span className="font-bold shrink-0">+</span>
            <span>
              <span className="opacity-70">{currentPath}: </span>
              <span>Added</span>
              {arr[0] !== undefined && (
                <span className="ml-1 opacity-90">{JSON.stringify(arr[0])}</span>
              )}
            </span>
          </div>
        )
      } else if (arr.length === 3 && arr[2] === 0) {
        // Removed
        items.push(
          <div
            key={currentPath}
            role="listitem"
            aria-label={`Removed: ${currentPath}`}
            className={cn(
              'flex items-start gap-2 px-2 py-1 rounded',
              'bg-[var(--color-diff-removed)] text-[var(--color-diff-removed-text)]'
            )}
          >
            <span className="font-bold shrink-0">−</span>
            <span>
              <span className="opacity-70">{currentPath}: </span>
              <span>Removed</span>
              {arr[0] !== undefined && (
                <span className="ml-1 opacity-90">{JSON.stringify(arr[0])}</span>
              )}
            </span>
          </div>
        )
      } else if (arr.length === 2) {
        // Changed
        items.push(
          <div
            key={currentPath}
            role="listitem"
            aria-label={`Changed: ${currentPath}`}
            className={cn(
              'flex items-start gap-2 px-2 py-1 rounded',
              'bg-[var(--color-diff-changed)] text-[var(--color-diff-changed-text)]'
            )}
          >
            <span className="font-bold shrink-0">~</span>
            <span>
              <span className="opacity-70">{currentPath}: </span>
              <span>Changed: </span>
              <span className="line-through opacity-60">{JSON.stringify(arr[0])}</span>
              <span className="mx-1">→</span>
              <span>{JSON.stringify(arr[1])}</span>
            </span>
          </div>
        )
      }
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Nested object delta — recurse
      items.push(...renderDelta(val as Record<string, unknown>, currentPath))
    }
  }

  return items
}
