import { jsonParse } from './jsonParse'

type MinifyResult = { ok: true; value: string } | { ok: false; error: string }

/**
 * Minify JSON by parsing and re-serialising with no whitespace.
 */
export function jsonMinify(text: string): MinifyResult {
  const parsed = jsonParse(text)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error.message }
  }
  return { ok: true, value: JSON.stringify(parsed.value) }
}
