import type { ParseError, TreeNode } from '@/types/json'
import type { CursorPosition } from '@/types/ui'
import { jsonParse } from '@/utils/jsonParse'
import { buildTree } from '@/features/viewer/treeBuilder'
import type { CorrectionIssue } from '@/types/json'
import { jsonCorrect } from '@/utils/jsonCorrect'

export interface WorkspaceState {
  // ── Core input ──
  rawInput: string
  isValid: boolean
  parseError: ParseError | null
  byteCount: number
  cursorPosition: CursorPosition

  // ── Derived: viewer tree (kept here so ALL tabs share it) ──
  tree: TreeNode[]

  // ── Derived: corrector analysis ──
  correctorIssues: CorrectionIssue[]
  correctorOutput: string // the auto-corrected string (null → empty string)

  // ── Actions ──
  /**
   * Primary setter — parses, validates, rebuilds tree, and re-runs corrector
   * in one atomic update. Every module that changes the JSON calls this.
   */
  setRawInput: (input: string) => void
  setIsValid: (isValid: boolean) => void
  setParseError: (error: ParseError | null) => void
  setCursorPosition: (position: CursorPosition) => void
  setCorrectorResults: (issues: CorrectionIssue[], output: string) => void
}

export const createWorkspaceSlice = (
  set: (fn: (state: WorkspaceState) => Partial<WorkspaceState>) => void
): WorkspaceState => ({
  rawInput: '',
  isValid: true,
  parseError: null,
  byteCount: 0,
  cursorPosition: { line: 1, column: 1 },
  tree: [],
  correctorIssues: [],
  correctorOutput: '',

  setRawInput: (rawInput) =>
    set(() => {
      const byteCount = new TextEncoder().encode(rawInput).length

      if (!rawInput.trim()) {
        return {
          rawInput,
          byteCount,
          isValid: true,
          parseError: null,
          tree: [],
          correctorIssues: [],
          correctorOutput: '',
        }
      }

      // Parse → validate
      const parsed = jsonParse(rawInput)
      const isValid = parsed.ok
      const parseError = parsed.ok ? null : parsed.error

      // Rebuild tree from parsed value (only when valid)
      let tree: TreeNode[] = []
      if (parsed.ok) {
        tree = buildTree(parsed.value)
      }

      // Run corrector analysis (always — it catches pre-parse issues)
      const { issues: correctorIssues, corrected } = jsonCorrect(rawInput)
      const correctorOutput = corrected ?? ''

      return {
        rawInput,
        byteCount,
        isValid,
        parseError,
        tree,
        correctorIssues,
        correctorOutput,
      }
    }),

  setIsValid: (isValid) => set(() => ({ isValid })),
  setParseError: (parseError) => set(() => ({ parseError })),
  setCursorPosition: (cursorPosition) => set(() => ({ cursorPosition })),
  setCorrectorResults: (correctorIssues, correctorOutput) =>
    set(() => ({ correctorIssues, correctorOutput })),
})
