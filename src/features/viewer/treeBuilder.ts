import type { JsonValue, TreeNode } from '@/types/json'

/**
 * Build a TreeNode list from a parsed JSON value.
 * Counter is local per call so IDs are stable within a single tree render.
 */
export function buildTree(
  value: JsonValue,
  key: string | null = null,
  path = 'root',
  depth = 0,
  counter = { n: 0 }
): TreeNode[] {
  const id = `node-${++counter.n}`

  if (Array.isArray(value)) {
    return [
      {
        id,
        key,
        type: 'array',
        value,
        depth,
        path,
        children: value.map((item, idx) =>
          buildTree(item, String(idx), `${path}[${idx}]`, depth + 1, counter)[0]
        ),
      },
    ]
  }

  if (value !== null && typeof value === 'object') {
    return [
      {
        id,
        key,
        type: 'object',
        value,
        depth,
        path,
        children: Object.entries(value as Record<string, JsonValue>).map(([k, v]) =>
          buildTree(v, k, `${path}.${k}`, depth + 1, counter)[0]
        ),
      },
    ]
  }

  const type =
    value === null
      ? 'null'
      : typeof value === 'string'
        ? 'string'
        : typeof value === 'number'
          ? 'number'
          : 'boolean'

  return [{ id, key, type, value, depth, path, children: [] }]
}

export function collectAllPaths(nodes: TreeNode[]): string[] {
  const paths: string[] = []
  function walk(node: TreeNode) {
    if (node.children.length > 0) {
      paths.push(node.path)
      node.children.forEach(walk)
    }
  }
  nodes.forEach(walk)
  return paths
}

export function collectMatchingPaths(nodes: TreeNode[], query: string): string[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const matches: string[] = []
  function walk(node: TreeNode) {
    const keyMatch = node.key != null && node.key.toLowerCase().includes(normalized)
    const valueMatch =
      node.type !== 'object' &&
      node.type !== 'array' &&
      String(node.value).toLowerCase().includes(normalized)

    if (keyMatch || valueMatch) {
      matches.push(node.path)
    }

    node.children.forEach(walk)
  }

  nodes.forEach(walk)
  return matches
}
