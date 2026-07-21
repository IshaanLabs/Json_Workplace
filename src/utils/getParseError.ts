import type { ParseError } from '@/types/json'

/**
 * Extract line and column from a browser JSON.parse error message.
 * Different browser engines format this differently.
 */
export function getParseError(error: unknown): ParseError {
  if (!(error instanceof SyntaxError)) {
    return { message: String(error) }
  }

  const msg = error.message

  // Chrome/V8: "Unexpected token '}', ..."at position 42"
  // Chrome newer: "Expected ',' or '}' after property value in JSON at position 42"
  const v8PositionMatch = /at position (\d+)/i.exec(msg)
  if (v8PositionMatch) {
    const pos = parseInt(v8PositionMatch[1], 10)
    return { message: msg, raw: msg, position: pos }
  }

  // Firefox: "JSON.parse: unexpected character at line 3 column 5 of the JSON data"
  const firefoxMatch = /line (\d+) column (\d+)/i.exec(msg)
  if (firefoxMatch) {
    return {
      message: msg,
      raw: msg,
      line: parseInt(firefoxMatch[1], 10),
      column: parseInt(firefoxMatch[2], 10),
    }
  }

  // Safari: "JSON Parse error: Unexpected identifier "foo" at position 12"
  const safariPositionMatch = /at position (\d+)/i.exec(msg)
  if (safariPositionMatch) {
    const pos = parseInt(safariPositionMatch[1], 10)
    return { message: msg, raw: msg, position: pos }
  }

  return { message: msg, raw: msg }
}

/**
 * Convert a character position offset to line/column (1-based).
 */
export function positionToLineCol(
  text: string,
  position: number
): { line: number; column: number } {
  const before = text.slice(0, position)
  const lines = before.split('\n')
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  }
}
