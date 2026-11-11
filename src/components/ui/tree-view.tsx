"use client"

// @dthu/ui 0.2.0 · tree-view
import * as React from "react"
import { Check, ChevronRight, LoaderCircle, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

/** Một nút của cây. */
export interface TreeNode {
  /** Mã duy nhất. */
  id: string
  /** Nhãn hiển thị (chuỗi dùng cho gõ-để-tìm). */
  label: string
  /** Biểu tượng đứng trước nhãn. */
  icon?: React.ReactNode
  /** Nút con. Bỏ trống kèm `hasChildren` nếu nạp lười qua `loadChildren`. */
  children?: TreeNode[]
  /** Đánh dấu có con nhưng chưa nạp (nạp lười). */
  hasChildren?: boolean
  /** Vô hiệu hoá nút. */
  disabled?: boolean
  /** Nội dung phụ bên phải (số lượng, badge...). */
  meta?: React.ReactNode
}

export interface TreeViewProps extends Omit<React.ComponentProps<"ul">, "onSelect" | "defaultValue" | "children" | "defaultChecked" | "checked"> {
  /** Dữ liệu cây. */
  nodes: TreeNode[]
  /** Chế độ chọn: một, nhiều hoặc không chọn. */
  selectionMode?: "single" | "multiple" | "none"
  /** Mã các nút đang chọn (điều khiển từ ngoài). */
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (ids: string[]) => void
  /** Mã các nút đang mở (điều khiển từ ngoài). */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Hiện checkbox từng nút; chọn cha sẽ chọn mọi con (trạng thái hỗn hợp cho cha). Thay cho `selected`. */
  checkboxes?: boolean
  /** Mã các nút đã tích (khi `checkboxes`). Chỉ chứa nút lá. */
  checked?: string[]
  defaultChecked?: string[]
  onCheckedChange?: (ids: string[]) => void
  /** Nạp con khi mở một nút có `hasChildren`; trả về danh sách con. Kết quả được lưu trong cây. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>
  /** Gọi khi kích hoạt (Enter / nhấp đúp) một nút. */
  onActivate?: (node: TreeNode) => void
  /** Nhãn truy cập của cây. */
  "aria-label": string
}

interface Flat { node: TreeNode; level: number; parent?: string; setSize: number; pos: number }

function useCtl<V>(controlled: V | undefined, initial: V, onChange?: (v: V) => void): [V, (v: V) => void] {
  const [inner, setInner] = React.useState(initial)
  const value = controlled !== undefined ? controlled : inner
  return [value, (v) => { if (controlled === undefined) setInner(v); onChange?.(v) }]
}

function leaves(node: TreeNode): string[] {
  return node.children?.length ? node.children.flatMap(leaves) : node.disabled ? [] : [node.id]
}

/**
 * Cây phân cấp truy cập được (role tree / treeitem): mở-đóng, phím mũi tên, Home / End, gõ để tìm, chọn một / nhiều,
 * checkbox tuỳ chọn, biểu tượng, nạp con lười và trạng thái mở / chọn điều khiển từ ngoài.
 */
export function TreeView({
  nodes, selectionMode = "single", selected: selectedProp, defaultSelected, onSelectedChange, expanded: expandedProp, defaultExpanded, onExpandedChange,
  checkboxes = false, checked: checkedProp, defaultChecked, onCheckedChange, loadChildren, onActivate, className, ...props
}: TreeViewProps) {
  const [selected, setSelected] = useCtl<string[]>(selectedProp, defaultSelected ?? [], onSelectedChange)
  const [expanded, setExpanded] = useCtl<string[]>(expandedProp, defaultExpanded ?? [], onExpandedChange)
  const [checked, setChecked] = useCtl<string[]>(checkedProp, defaultChecked ?? [], onCheckedChange)
  const [loaded, setLoaded] = React.useState<Record<string, TreeNode[]>>({})
  const [loading, setLoading] = React.useState<string[]>([])
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const typeahead = React.useRef({ buf: "", t: 0 })
  const refs = React.useRef(new Map<string, HTMLLIElement>())

  const withLoaded = React.useCallback((n: TreeNode): TreeNode => {
    const kids = loaded[n.id] ?? n.children
    return kids ? { ...n, children: kids.map(withLoaded) } : n
  }, [loaded])
  const tree = React.useMemo(() => nodes.map(withLoaded), [nodes, withLoaded])

  const flat = React.useMemo(() => {
    const out: Flat[] = []
    const walk = (list: TreeNode[], level: number, parent?: string) => list.forEach((node, i) => {
      out.push({ node, level, parent, setSize: list.length, pos: i + 1 })
      if (node.children?.length && expanded.includes(node.id)) walk(node.children, level + 1, node.id)
    })
    walk(tree, 1)
    return out
  }, [tree, expanded])

  const tabId = focusId && flat.some((f) => f.node.id === focusId) ? focusId : (flat.find((f) => !f.node.disabled)?.node.id ?? null)
  const focusNode = (id: string) => { setFocusId(id); refs.current.get(id)?.focus() }

  const isExpandable = (n: TreeNode) => Boolean(n.children?.length) || Boolean(n.hasChildren && loadChildren)
  const expand = async (n: TreeNode) => {
    if (!isExpandable(n) || expanded.includes(n.id)) return
    if (!n.children?.length && loadChildren) {
      setLoading((l) => [...l, n.id])
      try {
        const kids = await loadChildren(n)
        setLoaded((m) => ({ ...m, [n.id]: kids }))
      } finally { setLoading((l) => l.filter((x) => x !== n.id)) }
    }
    setExpanded([...expanded, n.id])
  }
  const collapse = (n: TreeNode) => setExpanded(expanded.filter((x) => x !== n.id))

  const select = (n: TreeNode) => {
    if (n.disabled) return
    if (checkboxes) { toggleCheck(n); return }
    if (selectionMode === "none") return
    if (selectionMode === "single") setSelected([n.id])
    else setSelected(selected.includes(n.id) ? selected.filter((x) => x !== n.id) : [...selected, n.id])
  }
  const checkState = (n: TreeNode): boolean | "mixed" => {
    const l = leaves(n)
    if (!l.length) return false
    const c = l.filter((id) => checked.includes(id)).length
    return c === 0 ? false : c === l.length ? true : "mixed"
  }
  const toggleCheck = (n: TreeNode) => {
    const l = leaves(n)
    const all = checkState(n) === true
    setChecked(all ? checked.filter((id) => !l.includes(id)) : [...new Set([...checked, ...l])])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const idx = flat.findIndex((f) => f.node.id === tabId)
    const cur = flat[idx]
    if (!cur) return
    const enabled = (from: number, step: 1 | -1) => { for (let i = from; i >= 0 && i < flat.length; i += step) if (!flat[i]?.node.disabled) return flat[i]; return undefined }
    const go = (f?: Flat) => { if (f) { e.preventDefault(); focusNode(f.node.id) } }
    switch (e.key) {
      case "ArrowDown": return go(enabled(idx + 1, 1))
      case "ArrowUp": return go(enabled(idx - 1, -1))
      case "Home": return go(enabled(0, 1))
      case "End": return go(enabled(flat.length - 1, -1))
      case "ArrowRight":
        e.preventDefault()
        if (isExpandable(cur.node)) { if (!expanded.includes(cur.node.id)) void expand(cur.node); else go(enabled(idx + 1, 1)) }
        return
      case "ArrowLeft":
        e.preventDefault()
        if (expanded.includes(cur.node.id)) collapse(cur.node)
        else if (cur.parent) focusNode(cur.parent)
        return
      case "Enter": e.preventDefault(); select(cur.node); onActivate?.(cur.node); return
      case " ":
        if (typeahead.current.buf) break
        e.preventDefault(); select(cur.node); return
      case "*": e.preventDefault(); flat.filter((f) => f.level === cur.level && isExpandable(f.node)).forEach((f) => void expand(f.node)); return
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ta = typeahead.current
      window.clearTimeout(ta.t)
      ta.buf += e.key.toLowerCase()
      ta.t = window.setTimeout(() => { ta.buf = "" }, 500)
      const order = [...flat.slice(idx + (ta.buf.length === 1 ? 1 : 0)), ...flat.slice(0, idx + (ta.buf.length === 1 ? 1 : 0))]
      go(order.find((f) => !f.node.disabled && f.node.label.toLowerCase().startsWith(ta.buf)))
    }
  }

  return (
    <ul role="tree" data-slot="tree" aria-multiselectable={selectionMode === "multiple" || checkboxes ? true : undefined} onKeyDown={onKeyDown} className={cn("flex flex-col text-control", className)} {...props}>
      {flat.map(({ node, level, setSize, pos }) => {
        const expandable = isExpandable(node)
        const isOpen = expanded.includes(node.id)
        const isSel = checkboxes ? undefined : selectionMode === "none" ? undefined : selected.includes(node.id)
        const cs = checkboxes ? checkState(node) : undefined
        return (
          <li
            key={node.id} ref={(el) => { if (el) refs.current.set(node.id, el); else refs.current.delete(node.id) }}
            role="treeitem" aria-level={level} aria-setsize={setSize} aria-posinset={pos}
            aria-expanded={expandable ? isOpen : undefined} aria-selected={isSel} aria-checked={cs === undefined ? undefined : cs === "mixed" ? "mixed" : cs}
            aria-disabled={node.disabled || undefined} aria-busy={loading.includes(node.id) || undefined}
            tabIndex={node.id === tabId ? 0 : -1} data-selected={isSel || undefined}
            onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(node.id) }}
            onClick={(e) => { e.stopPropagation(); if (node.disabled) return; setFocusId(node.id); select(node) }}
            onDoubleClick={() => onActivate?.(node)}
            className={cn("group/ti flex min-h-9 cursor-default items-center gap-1.5 rounded-md pr-2 outline-none select-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring data-[selected]:bg-accent data-[selected]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 max-md:min-h-10")}
            style={{ paddingLeft: `${(level - 1) * 1.25 + 0.25}rem` }}
          >
            <span
              aria-hidden
              className={cn("flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground", expandable && "hover:bg-muted")}
              onClick={expandable ? (e) => { e.stopPropagation(); setFocusId(node.id); if (isOpen) collapse(node); else void expand(node) } : undefined}
            >
              {loading.includes(node.id) ? <LoaderCircle className="size-4 animate-spin" /> : expandable ? <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} /> : null}
            </span>
            {checkboxes && (
              <span aria-hidden className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border", cs ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background")}>
                {cs === "mixed" ? <Minus className="size-3.5" /> : cs ? <Check className="size-3.5" /> : null}
              </span>
            )}
            {node.icon && <span aria-hidden className="flex shrink-0 text-muted-foreground group-data-[selected]/ti:text-primary [&_svg]:size-4">{node.icon}</span>}
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            {node.meta && <span className="shrink-0 text-xs text-muted-foreground">{node.meta}</span>}
          </li>
        )
      })}
    </ul>
  )
}
