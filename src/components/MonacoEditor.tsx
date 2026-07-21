import { lazy, Suspense, useEffect, useRef } from 'react'
import type { editor } from 'monaco-editor'
import { useStore } from '@/store'
import { cn } from '@/utils/classNames'

const MonacoEditorLib = lazy(() => import('@monaco-editor/react'))

interface MonacoEditorProps {
  value: string
  onChange?: (value: string) => void
  onCursorChange?: (line: number, column: number) => void
  language?: string
  readOnly?: boolean
  height?: string
  className?: string
  placeholder?: string
  'aria-label'?: string
}

function EditorSkeleton({ height = '100%' }: { height?: string }) {
  return (
    <div
      role="status"
      aria-label="Editor loading"
      style={{ height }}
      className="bg-[var(--color-surface)] animate-pulse flex items-center justify-center"
    >
      <span className="text-xs text-[var(--color-text-muted)]">Loading editor…</span>
    </div>
  )
}

export function MonacoEditor({
  value,
  onChange,
  onCursorChange,
  language = 'json',
  readOnly = false,
  height = '100%',
  className,
  'aria-label': ariaLabel,
}: MonacoEditorProps) {
  const theme = useStore((s) => s.theme)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)

  // Sync Monaco theme when app theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs')
    }
  }, [theme])

  function handleMount(
    _editor: editor.IStandaloneCodeEditor,
    monacoInstance: typeof import('monaco-editor')
  ) {
    monacoRef.current = monacoInstance

    // Apply theme immediately on mount
    monacoInstance.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs')

    // Report cursor position to workspace slice
    if (onCursorChange) {
      _editor.onDidChangeCursorPosition((e) => {
        onCursorChange(e.position.lineNumber, e.position.column)
      })
    }
  }

  return (
    <div
      style={{ height }}
      className={cn('overflow-hidden', className)}
      role="region"
      aria-label={ariaLabel}
    >
      <Suspense fallback={<EditorSkeleton height={height} />}>
        <MonacoEditorLib
          height={height}
          language={language}
          value={value}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onChange={(v) => onChange?.(v ?? '')}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            fontSize: 13,
            tabSize: 2,
            insertSpaces: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: readOnly ? 'none' : 'line',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            contextmenu: true,
            folding: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </Suspense>
    </div>
  )
}
