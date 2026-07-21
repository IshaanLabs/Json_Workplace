/**
 * Shared TypeScript types for JSON values and processing results.
 */

/** Any valid JSON scalar or composite value */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

/** The result of a parse operation — either success or failure */
export type ParseResult =
  | { ok: true; value: JsonValue }
  | { ok: false; error: ParseError }

/** Structured parse error with optional location metadata */
export interface ParseError {
  message: string
  line?: number
  column?: number
  /** Character offset from V8 error messages */
  position?: number
  raw?: string
}

/** A jsondiffpatch diff delta */
export type DiffDelta = Record<string, unknown> | null | undefined

/** A single node in the JSON tree view */
export interface TreeNode {
  id: string
  key: string | null
  type: JsonNodeType
  value: JsonValue
  children: TreeNode[]
  depth: number
  path: string
}

export type JsonNodeType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'

/** An issue detected by the corrector */
export interface CorrectionIssue {
  id: string
  type: IssueType
  line: number
  column: number
  description: string
  suggestion: string | null
  autoFixable: boolean
  /** Start offset in the raw string */
  offset?: number
  /** Length of the problematic slice */
  length?: number
}

export type IssueType =
  | 'trailing-comma'
  | 'single-quoted-string'
  | 'unquoted-key'
  | 'missing-comma'
  | 'mismatched-bracket'
  | 'comment'

/** Result of a correction run */
export interface CorrectionResult {
  issues: CorrectionIssue[]
  corrected: string | null
}
