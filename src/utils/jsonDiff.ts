import * as jsondiffpatch from 'jsondiffpatch'
import type { DiffDelta } from '@/types/json'
import type { DiffSummary } from '@/store/compareSlice'

/** Configured jsondiffpatch instance */
const differ = jsondiffpatch.create({
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
})

type DiffResult = { ok: true; delta: DiffDelta; summary: DiffSummary } | { ok: false; error: string }

/**
 * Compute a structural diff between two parsed JSON values.
 * Takes parsed values, not raw strings.
 */
export function jsonDiff(
  left: import('@/types/json').JsonValue,
  right: import('@/types/json').JsonValue
): DiffResult {
  try {
    const delta = differ.diff(left, right) as DiffDelta
    const summary = summariseDelta(delta)
    return { ok: true, delta, summary }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Walk the delta object and count additions, removals, and changes.
 */
function summariseDelta(delta: DiffDelta): DiffSummary {
  const summary: DiffSummary = { added: 0, removed: 0, changed: 0 }
  if (!delta) return summary
  walkDelta(delta, summary)
  return summary
}

function walkDelta(node: Record<string, unknown>, summary: DiffSummary): void {
  for (const key of Object.keys(node)) {
    if (key === '_t') continue // array indicator
    const val = node[key]
    if (Array.isArray(val)) {
      if (val.length === 1) summary.added++
      else if (val.length === 2) summary.changed++
      else if (val.length === 3 && val[2] === 0) summary.removed++
    } else if (val && typeof val === 'object') {
      walkDelta(val as Record<string, unknown>, summary)
    }
  }
}

export { differ as diffInstance }
