export interface TreeLike<N> { id: string; children?: N[] }

export type DropPosition = "before" | "after" | "inside"

export function flattenTree<N extends TreeLike<N>>(nodes: N[], depth = 0): { node: N; depth: number; parentId?: string }[] {
  const out: { node: N; depth: number; parentId?: string }[] = []
  const walk = (list: N[], d: number, parentId?: string) => list.forEach((n) => { out.push({ node: n, depth: d, parentId }); walk(n.children ?? [], d + 1, n.id) })
  walk(nodes, depth)
  return out
}

export function countNodes<N extends TreeLike<N>>(nodes: N[]): number {
  return nodes.reduce((n, x) => n + 1 + countNodes(x.children ?? []), 0)
}

/** True when `id` is `ancestorId` itself or lies below it. */
export function isInSubtree<N extends TreeLike<N>>(nodes: N[], ancestorId: string, id: string): boolean {
  const anc = flattenTree(nodes).find((x) => x.node.id === ancestorId)
  return !!anc && flattenTree([anc.node]).some((x) => x.node.id === id)
}

function detach<N extends TreeLike<N>>(nodes: N[], id: string): { rest: N[]; found?: N } {
  let found: N | undefined
  const walk = (list: N[]): N[] => list.flatMap((n) => {
    if (n.id === id) { found = n; return [] }
    return n.children ? [{ ...n, children: walk(n.children) }] : [n]
  })
  return { rest: walk(nodes), found }
}

/**
 * Moves a node before/after/inside a target. Returns the original array when the move is invalid
 * (onto itself or into its own subtree) or would change nothing.
 */
export function moveTreeNode<N extends TreeLike<N>>(tree: N[], id: string, targetId: string, pos: DropPosition): N[] {
  if (id === targetId || isInSubtree(tree, id, targetId)) return tree
  const { rest, found } = detach(tree, id)
  if (!found) return tree
  const insert = (list: N[]): N[] => {
    const out: N[] = []
    for (const n of list) {
      if (n.id === targetId) {
        if (pos === "before") out.push(found, n)
        else if (pos === "after") out.push(n, found)
        else out.push({ ...n, children: [...(n.children ?? []), found] })
      } else out.push(n.children ? { ...n, children: insert(n.children) } : n)
    }
    return out
  }
  return insert(rest)
}

/** Keeps nodes whose name/code match, plus their ancestors. */
export function filterTree<N extends TreeLike<N> & { name: string; code?: string }>(nodes: N[], norm: (s: string) => string, query: string): N[] {
  const q = norm(query.trim())
  if (!q) return nodes
  const walk = (list: N[]): N[] => list.flatMap((n) => {
    const kids = walk(n.children ?? [])
    if (kids.length || norm(`${n.name} ${n.code ?? ""}`).includes(q)) return [{ ...n, children: kids }]
    return []
  })
  return walk(nodes)
}

export const normalizeVi = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase()
