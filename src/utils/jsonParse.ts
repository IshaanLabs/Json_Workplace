import type { ParseResult, ParseError } from '@/types/json'
import { getParseError, positionToLineCol } from './getParseError'

/**
 * Safe JSON.parse wrapper that returns a typed result instead of throwing.
 */
export function jsonParse(text: string): ParseResult {
  if (!text.trim()) {
    return { ok: false, error: { message: 'Input is empty' } }
  }

  try {
    const value = JSON.parse(text) as import('@/types/json').JsonValue
    return { ok: true, value }
  } catch (err) {
    const parseError = getParseError(err)

    // If we have a char position but no line/col, resolve it
    let enriched: ParseError = parseError
    if (parseError.position !== undefined && !parseError.line) {
      const loc = positionToLineCol(text, parseError.position)
      enriched = { ...parseError, line: loc.line, column: loc.column }
    }

    return { ok: false, error: enriched }
  }
}
