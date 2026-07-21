import { jsonParse } from './jsonParse'
import type { JsonValue } from '@/types/json'

type AsyncFormatResult = { ok: true; value: string } | { ok: false; error: string }

/**
 * Format JSON using Prettier. Loads Prettier asynchronously on first call.
 * Callers receive either a formatted string or a structured error.
 */
export async function jsonFormat(
  text: string,
  indentWidth: 2 | 4 = 2
): Promise<AsyncFormatResult> {
  // Validate first
  const parsed = jsonParse(text)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error.message }
  }

  try {
    const prettier = await import('prettier/standalone')
    const parserBabel = await import('prettier/plugins/babel')
    const parserEstree = await import('prettier/plugins/estree')

    const formatted = await prettier.format(text, {
      parser: 'json',
      tabWidth: indentWidth,
      plugins: [parserBabel.default, parserEstree.default],
    })

    return { ok: true, value: formatted }
  } catch (err) {
    // Fallback to native JSON.stringify if Prettier fails
    try {
      const val = JSON.parse(text) as JsonValue
      return { ok: true, value: JSON.stringify(val, null, indentWidth) }
    } catch {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}
