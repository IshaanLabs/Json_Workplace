import { useEffect, useRef } from 'react'
import { TreeNodeComponent } from './TreeNode'
import type { TreeNode } from '@/types/json'

interface JsonTreeProps {
  nodes: TreeNode[]
  searchQuery?: string
  currentMatchIndex?: number
  onMatchCountChange?: (count: number) => void
  searchMatchPaths?: string[]
  selectedPath?: string | null
}

export function JsonTree({
  nodes,
  searchQuery = '',
  currentMatchIndex = 0,
  onMatchCountChange,
  searchMatchPaths = [],
  selectedPath = null,
}: JsonTreeProps) {
  const containerRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!onMatchCountChange) return
    const count = searchQuery.trim() ? searchMatchPaths.length : 0
    onMatchCountChange(count)
  }, [searchQuery, searchMatchPaths, onMatchCountChange])

  useEffect(() => {
    if (!searchQuery.trim() || !containerRef.current) return
    const id = requestAnimationFrame(() => {
      const matches = containerRef.current?.querySelectorAll<HTMLElement>('[data-node-match="true"]')
      if (!matches || matches.length === 0) return
      const targetIndex = Math.min(currentMatchIndex, matches.length - 1)
      matches[targetIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [currentMatchIndex, searchQuery, nodes])

  if (nodes.length === 0) return null

  return (
    <ul ref={containerRef} role="tree" aria-label="JSON structure" className="font-mono text-xs leading-6">
      {nodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          searchQuery={searchQuery}
          currentMatchIndex={currentMatchIndex}
          searchMatchPaths={searchMatchPaths}
          selectedPath={selectedPath}
        />
      ))}
    </ul>
  )
}
