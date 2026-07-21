import { useStore } from '@/store'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Braces, List } from 'lucide-react'
import type { TreeNode } from '@/types/json'
import { cn } from '@/utils/classNames'

interface TreeNodeProps {
  node: TreeNode
  searchQuery?: string
  currentMatchIndex?: number
  searchMatchPaths?: string[]
  selectedPath?: string | null
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const parts: React.ReactNode[] = []
  let cursor = 0
  let idx: number

  while ((idx = lower.indexOf(q, cursor)) !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx))
    parts.push(
      <mark
        key={`${text}-${idx}`}
        data-match=""
        className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800"
      >
        {text.slice(idx, idx + query.length)}
      </mark>
    )
    cursor = idx + query.length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts.length > 0 ? <>{parts}</> : text
}

const VALUE_COLOURS: Record<string, string> = {
  string: 'text-[var(--color-json-string)]',
  number: 'text-[var(--color-json-number)]',
  boolean: 'text-[var(--color-json-boolean)]',
  null: 'text-[var(--color-json-null)]',
  key: 'text-[var(--color-json-key)]',
}

export function TreeNodeComponent({
  node,
  searchQuery = '',
  currentMatchIndex,
  searchMatchPaths = [],
  selectedPath = null,
}: TreeNodeProps) {
  const expandedPaths = useStore((s) => s.expandedPaths)
  const togglePath = useStore((s) => s.togglePath)
  const setSelectedNode = useStore((s) => s.setSelectedNode)

  const isExpanded = expandedPaths[node.path] ?? false
  const isBranch = node.children.length > 0
  const indentStyle = { paddingLeft: `${node.depth * 16 + 6}px` }

  const matchesSearch = (n: TreeNode): boolean => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const keyMatch = n.key != null && n.key.toLowerCase().includes(q)
    const valMatch =
      n.type !== 'object' && n.type !== 'array' && String(n.value).toLowerCase().includes(q)
    return keyMatch || valMatch || n.children.some(matchesSearch)
  }

  if (!matchesSearch(node)) return null

  const isMatchNode =
    !!searchQuery &&
    searchMatchPaths.includes(node.path) &&
    ((node.key != null && node.key.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (node.type !== 'object' && node.type !== 'array' && String(node.value).toLowerCase().includes(searchQuery.toLowerCase())))

  const isSelected = selectedPath === node.path

  function renderValue() {
    if (node.type === 'object') {
      const keyCount = Object.keys(node.value as Record<string, unknown>).length
      return (
        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
          <span className="text-[var(--color-text)]">{isExpanded ? '{' : '{ … }'}</span>
          <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.25 text-[10px] text-[var(--color-text-muted)]">
            {keyCount} key{keyCount !== 1 ? 's' : ''}
          </span>
        </span>
      )
    }
    if (node.type === 'array') {
      const length = Array.isArray(node.value) ? node.value.length : 0
      return (
        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
          <span className="text-[var(--color-text)]">{isExpanded ? '[' : `[ ${length} item${length !== 1 ? 's' : ''} ]`}</span>
          <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.25 text-[10px] text-[var(--color-text-muted)]">
            {length} item{length !== 1 ? 's' : ''}
          </span>
        </span>
      )
    }
    if (node.type === 'string') {
      return (
        <span className={VALUE_COLOURS.string}>
          &quot;{highlight(String(node.value), searchQuery)}&quot;
        </span>
      )
    }
    if (node.type === 'null') {
      return <span className={VALUE_COLOURS.null}>null</span>
    }
    return (
      <span className={VALUE_COLOURS[node.type] ?? 'text-[var(--color-text)]'}>
        {highlight(String(node.value), searchQuery)}
      </span>
    )
  }

  const handleSelect = () => {
    setSelectedNode(node.path, typeof node.value === 'string' ? node.value : JSON.stringify(node.value))
  }

  return (
    <li role="treeitem" aria-expanded={isBranch ? isExpanded : undefined}>
      <div
        style={indentStyle}
        onClick={() => {
          handleSelect()
          if (isBranch) togglePath(node.path)
        }}
        className={cn(
          'flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1',
          'transition-colors hover:bg-[var(--color-surface-hover)]',
          isBranch && 'cursor-pointer',
          isSelected && 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10',
          isMatchNode && 'ring-1 ring-[var(--color-warning)]/40'
        )}
        role={isBranch ? 'button' : undefined}
        tabIndex={isBranch ? 0 : undefined}
        data-node-match={isMatchNode ? 'true' : 'false'}
        data-node-path={node.path}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelect()
            if (isBranch) togglePath(node.path)
          }
        }}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0 text-[var(--color-text-muted)]">
          {isBranch ? (
            isExpanded ? (
              <ChevronDown size={12} aria-hidden="true" />
            ) : (
              <ChevronRight size={12} aria-hidden="true" />
            )
          ) : null}
        </span>

        <span className="flex h-4 w-4 items-center justify-center text-[var(--color-text-muted)]">
          {node.type === 'object' ? (
            isExpanded ? <FolderOpen size={12} aria-hidden="true" /> : <Folder size={12} aria-hidden="true" />
          ) : node.type === 'array' ? (
            <List size={12} aria-hidden="true" />
          ) : (
            <Braces size={12} aria-hidden="true" />
          )}
        </span>

        {node.key !== null && (
          <>
            <span className={VALUE_COLOURS.key}>{highlight(node.key, searchQuery)}</span>
            <span className="text-[var(--color-text-muted)]">:</span>
          </>
        )}

        {renderValue()}
      </div>

      {isBranch && isExpanded && (
        <ul role="group" className="mt-0.5">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              searchQuery={searchQuery}
              currentMatchIndex={currentMatchIndex}
              searchMatchPaths={searchMatchPaths}
              selectedPath={selectedPath}
            />
          ))}
          <li aria-hidden="true">
            <div style={{ paddingLeft: `${node.depth * 16 + 6}px` }} className="px-2 py-0.5">
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                {node.type === 'object' ? '}' : ']'}
              </span>
            </div>
          </li>
        </ul>
      )}
    </li>
  )
}
