import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@/store'
import { MonacoEditor } from '@/components/MonacoEditor'
import { ClearButton } from '@/components/ClearButton'
import { CopyButton } from '@/components/CopyButton'
import { JsonTree } from './JsonTree'
import { collectAllPaths, collectMatchingPaths } from './treeBuilder'
import { jsonFormat } from '@/utils/jsonFormat'
import { jsonMinify } from '@/utils/jsonMinify'
import {
  Search,
  ChevronsUpDown,
  ChevronsDown,
  AlignLeft,
  Minimize2,
  ChevronUp,
  ChevronDown,
  X,
  Copy,
  Download,
  Upload,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/utils/classNames'

function downloadJson(text: string) {
  const a = document.createElement('a')
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text)
  a.download = 'document.json'
  a.click()
}

export function ViewerPage() {
  const rawInput = useStore((s) => s.rawInput)
  const setRawInput = useStore((s) => s.setRawInput)
  const isValid = useStore((s) => s.isValid)
  const tree = useStore((s) => s.tree)
  const setCursorPosition = useStore((s) => s.setCursorPosition)
  const parseError = useStore((s) => s.parseError)

  const expandAll = useStore((s) => s.expandAll)
  const collapseAll = useStore((s) => s.collapseAll)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const searchMatchCount = useStore((s) => s.searchMatchCount)
  const searchCurrentIndex = useStore((s) => s.searchCurrentIndex)
  const navigateSearchMatch = useStore((s) => s.navigateSearchMatch)
  const setSearchMatchCount = useStore((s) => s.setSearchMatchCount)
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const selectedNodePath = useStore((s) => s.selectedNodePath)
  const selectedNodeValue = useStore((s) => s.selectedNodeValue)
  const clearSelectedNode = useStore((s) => s.clearSelectedNode)

  const addNotification = useStore((s) => s.addNotification)
  const setOutput = useStore((s) => s.setOutput)
  const setActiveMode = useStore((s) => s.setActiveMode)

  const searchRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (tree.length > 0) {
      const topPaths = tree.map((n) => n.path)
      expandAll(topPaths)
    }
  }, [tree, expandAll])

  useEffect(() => {
    if (!searchQuery.trim() || tree.length === 0) return
    expandAll(collectAllPaths(tree))
  }, [searchQuery, tree, expandAll])

  const searchMatchPaths = useMemo(() => collectMatchingPaths(tree, searchQuery), [tree, searchQuery])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatchCount(0)
      return
    }
    setSearchMatchCount(searchMatchPaths.length)
  }, [searchMatchPaths, searchQuery, setSearchMatchCount])

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleClear = useCallback(() => {
    setRawInput('')
    setSearchQuery('')
    clearSelectedNode()
  }, [clearSelectedNode, setRawInput, setSearchQuery])

  const handleExpandAll = useCallback(() => {
    expandAll(collectAllPaths(tree))
  }, [tree, expandAll])

  const handlePrettyPrint = useCallback(async () => {
    if (!rawInput.trim() || !isValid) return
    const result = await jsonFormat(rawInput, 2)
    if (result.ok) {
      setRawInput(result.value)
      setOutput(result.value)
      setActiveMode('pretty-2')
    } else {
      addNotification({ type: 'error', message: result.error })
    }
  }, [addNotification, isValid, rawInput, setActiveMode, setOutput, setRawInput])

  const handleMinify = useCallback(() => {
    if (!rawInput.trim() || !isValid) return
    const result = jsonMinify(rawInput)
    if (result.ok) {
      setRawInput(result.value)
      setOutput(result.value)
      setActiveMode('minify')
    } else {
      addNotification({ type: 'error', message: result.error })
    }
  }, [addNotification, isValid, rawInput, setActiveMode, setOutput, setRawInput])

  const handleDownload = useCallback(() => {
    if (!rawInput.trim()) return
    downloadJson(rawInput)
    addNotification({ type: 'success', message: 'Downloaded JSON document.' })
  }, [addNotification, rawInput])

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setRawInput(text)
    setSearchQuery('')
    clearSelectedNode()
    addNotification({ type: 'success', message: `Loaded ${file.name}.` })
    event.target.value = ''
  }, [addNotification, clearSelectedNode, setRawInput, setSearchQuery])

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      navigateSearchMatch(event.shiftKey ? 'prev' : 'next')
    } else if (event.key === 'Escape') {
      setSearchQuery('')
      searchRef.current?.blur()
    }
  }, [navigateSearchMatch, setSearchQuery])

  const handleCopyPath = useCallback(() => {
    if (!selectedNodePath) return
    navigator.clipboard.writeText(selectedNodePath)
    addNotification({ type: 'success', message: 'Copied JSON path.' })
  }, [addNotification, selectedNodePath])

  const handleCopyValue = useCallback(() => {
    if (!selectedNodeValue) return
    navigator.clipboard.writeText(selectedNodeValue)
    addNotification({ type: 'success', message: 'Copied selected value.' })
  }, [addNotification, selectedNodeValue])

  return (
    <div className={cn('flex h-full flex-col', isFullscreen && 'viewer-fullscreen fixed inset-0 z-[1200] bg-[var(--color-background)]')}>
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] p-1">
            {(['editor', 'tree', 'split'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                  viewMode === mode
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {rawInput && (
              <span className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-[11px] text-[var(--color-text-muted)]">
                {isValid ? <CheckCircle2 size={12} className="text-[var(--color-success)]" /> : <AlertTriangle size={12} className="text-[var(--color-error)]" />}
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            )}
            {rawInput && isValid && (
              <>
                <button type="button" onClick={handlePrettyPrint} title="Pretty print" className="viewer-action-btn">
                  <AlignLeft size={13} aria-hidden="true" />
                  <span>Pretty</span>
                </button>
                <button type="button" onClick={handleMinify} title="Minify" className="viewer-action-btn">
                  <Minimize2 size={13} aria-hidden="true" />
                  <span>Minify</span>
                </button>
              </>
            )}
            {rawInput && <CopyButton text={rawInput} label="Copy" />}
            <button type="button" onClick={handleDownload} title="Download JSON" className="viewer-action-btn">
              <Download size={13} aria-hidden="true" />
              <span>Download</span>
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload JSON" className="viewer-action-btn">
              <Upload size={13} aria-hidden="true" />
              <span>Upload</span>
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleUpload} />
            <button type="button" onClick={() => setIsFullscreen((prev) => !prev)} title="Toggle fullscreen" className="viewer-action-btn">
              <Maximize2 size={13} aria-hidden="true" />
              <span>{isFullscreen ? 'Exit' : 'Full'}</span>
            </button>
            <ClearButton onClick={handleClear} disabled={!rawInput} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'editor' ? (
          <div className="h-full">
            <MonacoEditor value={rawInput} onChange={setRawInput} onCursorChange={(line, column) => setCursorPosition({ line, column })} height="100%" aria-label="Input JSON editor" />
          </div>
        ) : viewMode === 'tree' ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
              <div className="flex flex-1 items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1">
                <Search size={12} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                <input ref={searchRef} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder="Search keys and values…" aria-label="Search JSON tree" className="flex-1 bg-transparent text-xs outline-none" />
                {searchQuery && (
                  <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                    <span>{searchMatchCount === 0 ? 'No matches' : `${searchCurrentIndex + 1}/${searchMatchCount}`}</span>
                    <button type="button" onClick={() => navigateSearchMatch('prev')} disabled={searchMatchCount === 0} className="rounded p-0.5 hover:bg-[var(--color-surface-hover)] disabled:opacity-30" aria-label="Previous match">
                      <ChevronUp size={11} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => navigateSearchMatch('next')} disabled={searchMatchCount === 0} className="rounded p-0.5 hover:bg-[var(--color-surface-hover)] disabled:opacity-30" aria-label="Next match">
                      <ChevronDown size={11} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setSearchQuery('')} className="rounded p-0.5 hover:bg-[var(--color-surface-hover)]" aria-label="Clear search">
                      <X size={11} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={handleExpandAll} title="Expand all" className="viewer-action-btn">
                  <ChevronsUpDown size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">Expand</span>
                </button>
                <button type="button" onClick={() => collapseAll()} title="Collapse all" className="viewer-action-btn">
                  <ChevronsDown size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">Collapse</span>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-[var(--color-background)]" role="region" aria-label="JSON tree view">
              {!rawInput.trim() ? (
                <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[var(--color-text-muted)]">Paste JSON above to view the tree.</div>
              ) : parseError ? (
                <div className="p-4">
                  <div className="rounded border border-[var(--color-error)] bg-[var(--color-error-bg)] p-3 font-mono text-xs text-[var(--color-error)]">
                    {parseError.message}
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <JsonTree nodes={tree} searchQuery={searchQuery} currentMatchIndex={searchCurrentIndex} onMatchCountChange={setSearchMatchCount} searchMatchPaths={searchMatchPaths} selectedPath={selectedNodePath} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 lg:grid-cols-2">
            <div className="flex min-h-0 flex-col border-r border-[var(--color-border)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">Editor</span>
                <button type="button" onClick={() => setIsFullscreen(true)} className="viewer-action-btn">
                  <Maximize2 size={13} aria-hidden="true" />
                  <span>Full</span>
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <MonacoEditor value={rawInput} onChange={setRawInput} onCursorChange={(line, column) => setCursorPosition({ line, column })} height="100%" aria-label="Input JSON editor" />
              </div>
            </div>
            <div className="flex min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">Tree</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => collapseAll()} title="Collapse all" className="viewer-action-btn">
                    <ChevronsDown size={13} aria-hidden="true" />
                    <span className="hidden sm:inline">Collapse</span>
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-[var(--color-background)]">
                {parseError ? (
                  <div className="p-4">
                    <div className="rounded border border-[var(--color-error)] bg-[var(--color-error-bg)] p-3 font-mono text-xs text-[var(--color-error)]">
                      {parseError.message}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    <JsonTree nodes={tree} searchQuery={searchQuery} currentMatchIndex={searchCurrentIndex} onMatchCountChange={setSearchMatchCount} searchMatchPaths={searchMatchPaths} selectedPath={selectedNodePath} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedNodePath && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-text-muted)]">Selected path:</span>
            <code className="rounded bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-[var(--color-text)]">{selectedNodePath}</code>
            <button type="button" onClick={handleCopyPath} className="viewer-action-btn">
              <Copy size={12} aria-hidden="true" />
              <span>Copy Path</span>
            </button>
            <button type="button" onClick={handleCopyValue} className="viewer-action-btn">
              <Copy size={12} aria-hidden="true" />
              <span>Copy Value</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
