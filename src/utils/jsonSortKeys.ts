import type { JsonValue } from '@/types/json'
import { jsonParse } from './jsonParse'

type SortResult = { ok: true; value: string } | { ok: false; error: string }

/**
 * Recursively sort all object keys alphabetically and return a formatted JSON string.
 * Arrays retain their original order; only object keys are sorted.
 */
export function jsonSortKeys(text: string, indentWidth: 2 | 4 = 2): SortResult {
  const parsed = jsonParse(text)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error.message }
  }
  const sorted = sortValue(parsed.value)
  return { ok: true, value: JSON.stringify(sorted, null, indentWidth) }
}

function sortValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortValue)
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, JsonValue> = {}
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortValue((value as Record<string, JsonValue>)[key])
    }
    return sorted
  }
  return value
}
