import type { CorrectionResult, CorrectionIssue, IssueType } from '@/types/json'

let issueCounter = 0
function nextId(): string {
  return `issue-${++issueCounter}`
}

/**
 * Heuristic scan of a raw JSON string to identify and suggest fixes for
 * common JSON syntax mistakes authored by humans.
 *
 * Returns an issue list and, where possible, a corrected string.
 */
export function jsonCorrect(text: string): CorrectionResult {
  const issues: CorrectionIssue[] = []
  let working = text

  // 1. Strip // and /* */ comments
  working = stripComments(working, text, issues)

  // 2. Fix single-quoted strings
  working = fixSingleQuotes(working, issues)

  // 3. Fix unquoted keys
  working = fixUnquotedKeys(working, issues)

  // 4. Remove trailing commas
  working = fixTrailingCommas(working, issues)

  // 5. Try to parse; if still failing, attempt bracket repair
  let corrected: string | null = null
  try {
    JSON.parse(working)
    corrected = working
  } catch {
    const repaired = attemptBracketRepair(working, issues)
    if (repaired !== null) {
      try {
        JSON.parse(repaired)
        corrected = repaired
      } catch {
        corrected = null
      }
    }
  }

  return { issues, corrected }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function offsetToLineCol(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset)
  const lines = before.split('\n')
  return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 }
}

function stripComments(
  text: string,
  original: string,
  issues: CorrectionIssue[]
): string {
  let result = text
  // Block comments: /* ... */
  result = result.replace(/\/\*[\s\S]*?\*\//g, (match, offset: number) => {
    const loc = offsetToLineCol(original, offset)
    issues.push({
      id: nextId(),
      type: 'comment' as IssueType,
      line: loc.line,
      column: loc.column,
      description: 'Block comment found — JSON does not support comments.',
      suggestion: '',
      autoFixable: true,
      offset,
      length: match.length,
    })
    return ''
  })

  // Line comments: // ...
  result = result.replace(/\/\/[^\n]*/g, (match, offset: number) => {
    const loc = offsetToLineCol(original, offset)
    issues.push({
      id: nextId(),
      type: 'comment' as IssueType,
      line: loc.line,
      column: loc.column,
      description: 'Line comment found — JSON does not support comments.',
      suggestion: '',
      autoFixable: true,
      offset,
      length: match.length,
    })
    return ''
  })

  return result
}

function fixSingleQuotes(text: string, issues: CorrectionIssue[]): string {
  // Replace 'value' with "value" — only outside existing double-quoted strings
  // Simple heuristic: replace single-quoted tokens that look like string values
  return text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, inner: string, offset: number) => {
    const loc = offsetToLineCol(text, offset)
    const fixed = `"${inner.replace(/"/g, '\\"')}"`
    issues.push({
      id: nextId(),
      type: 'single-quoted-string',
      line: loc.line,
      column: loc.column,
      description: `Single-quoted string found: ${match} — JSON requires double quotes.`,
      suggestion: fixed,
      autoFixable: true,
      offset,
      length: match.length,
    })
    return fixed
  })
}

function fixUnquotedKeys(text: string, issues: CorrectionIssue[]): string {
  // Match: { key: or , key: where key is a bare identifier
  return text.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    (match, prefix: string, key: string, offset: number) => {
      const loc = offsetToLineCol(text, offset)
      const fixed = `${prefix}"${key}":`
      issues.push({
        id: nextId(),
        type: 'unquoted-key',
        line: loc.line,
        column: loc.column,
        description: `Unquoted object key: ${key} — JSON requires keys to be double-quoted strings.`,
        suggestion: `"${key}"`,
        autoFixable: true,
        offset,
        length: match.length,
      })
      return fixed
    }
  )
}

function fixTrailingCommas(text: string, issues: CorrectionIssue[]): string {
  // Trailing comma before } or ]
  return text.replace(/,(\s*[}\]])/g, (match, tail: string, offset: number) => {
    const loc = offsetToLineCol(text, offset)
    issues.push({
      id: nextId(),
      type: 'trailing-comma',
      line: loc.line,
      column: loc.column,
      description: 'Trailing comma before closing bracket — not valid in JSON.',
      suggestion: tail.trim(),
      autoFixable: true,
      offset,
      length: match.length,
    })
    return tail
  })
}

function attemptBracketRepair(text: string, issues: CorrectionIssue[]): string | null {
  // Count open vs closed braces and brackets
  const stack: string[] = []
  let inString = false
  let escape = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue

    if (ch === '{' || ch === '[') stack.push(ch)
    else if (ch === '}' || ch === ']') {
      if (stack.length === 0) {
        // Extra closing bracket — flag it
        const loc = offsetToLineCol(text, i)
        issues.push({
          id: nextId(),
          type: 'mismatched-bracket',
          line: loc.line,
          column: loc.column,
          description: `Extra closing '${ch}' with no matching opening bracket.`,
          suggestion: null,
          autoFixable: false,
        })
        return null
      }
      stack.pop()
    }
  }

  if (stack.length === 0) return text

  // Close unclosed brackets
  let repaired = text
  const loc = offsetToLineCol(text, text.length)
  for (let i = stack.length - 1; i >= 0; i--) {
    const close = stack[i] === '{' ? '}' : ']'
    issues.push({
      id: nextId(),
      type: 'mismatched-bracket',
      line: loc.line,
      column: loc.column,
      description: `Unclosed '${stack[i]}' — missing closing '${close}'.`,
      suggestion: close,
      autoFixable: true,
    })
    repaired += close
  }
  return repaired
}
