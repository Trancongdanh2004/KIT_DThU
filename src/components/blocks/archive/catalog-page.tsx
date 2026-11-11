"use client"

// @dthu/ui 0.2.0 · block-archive
import * as React from "react"
import { ArrowDown, ArrowUp, ChevronLeft, GripVertical, Move, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { ArchiveRowMenu, ArchiveToolbar, withSortHeaders, type ArchiveColumn, type ArchiveSort } from "./archive-shared"
import { countNodes, filterTree, flattenTree, isInSubtree, normalizeVi, type DropPosition } from "./catalog-tree-utils"

export interface CatalogField {
  name: string
  label: string
  required?: boolean
  /** "parent" renders a select of tree nodes (tree variant); the node being edited and its descendants are excluded. */
  type?: "text" | "number" | "select" | "parent"
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Columns spanned in the 3-column form grid (default 3). */
  span?: 1 | 2 | 3
  /** Muted text after the label, e.g. "không bắt buộc". */
  note?: string
}

export type CatalogValues = Record<string, string>

export interface CatalogTreeNode { id: string; name: string; code?: string; children?: CatalogTreeNode[] }

export interface CatalogPageProps<T> {
  /** Singular noun used in titles, e.g. "cơ quan". */
  entity: string
  fields: CatalogField[]
  /** Table variant: columns (a "···" actions column is appended automatically). */
  columns?: ArchiveColumn<T>[]
  rows?: T[]
  getRowId: (row: T) => string
  /** Maps a row (or tree node) to initial form values when editing. */
  getValues: (row: T) => CatalogValues
  /** "table" edits in a dialog; "tree" edits in a side form with drag/keyboard reordering. */
  variant?: "table" | "tree"
  tree?: CatalogTreeNode[]
  /** Resolves a tree node to the row edited/deleted; defaults to looking it up in rows. */
  findRow?: (id: string) => T | undefined
  /** Tabs rendered before the search box. */
  leading?: React.ReactNode
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  onRefresh?: () => void
  addLabel?: string
  /** Trả về Promise thì hộp thoại / form giữ mở tới khi lưu xong; Promise bị từ chối → giữ mở, giữ nguyên phần đã nhập. */
  onSave?: (values: CatalogValues, editing: T | null, parentId?: string) => void | Promise<unknown>
  /** Đổi lỗi từ chối của `onSave` thành lỗi theo ô { tên ô: câu lỗi } để hiện ngay dưới ô (bỏ trống = không hiện lỗi theo ô). */
  saveErrors?: (error: unknown) => Record<string, string>
  onDelete?: (row: T) => void
  /** Tree variant: called for drag-and-drop and the move up/down buttons. */
  onMove?: (id: string, targetId: string, position: DropPosition) => void
  /** Table variant: Tailwind min-width class of the table (it scrolls horizontally below it). */
  tableMinWidthClass?: string
  sort?: ArchiveSort
  onSortChange?: (s: ArchiveSort) => void
  loading?: boolean
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (p: number) => void
  onPageSizeChange?: (n: number) => void
}

const NONE = "__none"

interface TreeCtx {
  entity: string
  selectedId?: string
  dragId: string | null
  drop: { id: string; pos: DropPosition } | null
  tree: CatalogTreeNode[]
  onSelect: (id: string) => void
  onAddChild: (id: string) => void
  onDelete: (id: string) => void
  onStep: (id: string, dir: -1 | 1, index: number, siblings: CatalogTreeNode[]) => void
  setDragId: (id: string | null) => void
  setDrop: (d: { id: string; pos: DropPosition } | null) => void
  onDropNode: (id: string, targetId: string, pos: DropPosition) => void
  canMove: boolean
}

function TreeRow({ node, depth, index, siblings, ctx }: { node: CatalogTreeNode; depth: number; index: number; siblings: CatalogTreeNode[]; ctx: TreeCtx }) {
  const [open, setOpen] = React.useState(true)
  const kids = node.children ?? []
  const selected = ctx.selectedId === node.id
  const dropHere = ctx.drop?.id === node.id ? ctx.drop.pos : null
  const invalidTarget = ctx.dragId !== null && isInSubtree(ctx.tree, ctx.dragId, node.id)
  return (
    <li role="treeitem" aria-label={node.name} aria-selected={selected} aria-expanded={kids.length ? open : undefined} aria-level={depth + 1}>
      <div
        draggable={ctx.canMove}
        onDragStart={(e) => { ctx.setDragId(node.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", node.id) }}
        onDragEnd={() => { ctx.setDragId(null); ctx.setDrop(null) }}
        onDragOver={(e) => {
          if (ctx.dragId === null || invalidTarget) return
          e.preventDefault()
          const r = e.currentTarget.getBoundingClientRect()
          const y = r.height ? (e.clientY - r.top) / r.height : 0.5
          const pos: DropPosition = y < 0.25 ? "before" : y > 0.75 ? "after" : "inside"
          if (ctx.drop?.id !== node.id || ctx.drop.pos !== pos) ctx.setDrop({ id: node.id, pos })
        }}
        onDrop={(e) => { e.preventDefault(); if (ctx.dragId !== null && ctx.drop && !invalidTarget) ctx.onDropNode(ctx.dragId, node.id, ctx.drop.pos); ctx.setDragId(null); ctx.setDrop(null) }}
        className={cn("group relative flex min-h-8 items-center gap-2 pr-3 select-none hover:bg-secondary", ctx.canMove ? "cursor-grab" : "cursor-pointer", selected && "bg-accent hover:bg-accent", ctx.dragId === node.id && "opacity-50",
          dropHere === "before" && "shadow-[0_-2px_0_0_var(--color-primary)]", dropHere === "after" && "shadow-[0_2px_0_0_var(--color-primary)]", dropHere === "inside" && "bg-accent ring-2 ring-primary/60")}
        style={{ paddingLeft: depth * 20 + 4 }}>
        <span aria-hidden className={cn("grid w-3.5 flex-none place-items-center text-base text-muted-foreground opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 max-md:hidden", !ctx.canMove && "invisible")}><GripVertical className="size-4" /></span>
        {kids.length > 0
          ? <button type="button" aria-label={open ? `Thu gọn ${node.name}` : `Mở rộng ${node.name}`} onClick={() => setOpen(!open)} className={cn("grid size-[18px] flex-none cursor-pointer place-items-center rounded-[4px] border-0 bg-transparent p-0 text-lead leading-none text-muted-foreground transition-transform duration-[120ms] hover:bg-muted hover:text-foreground", open && "rotate-90")}>▸</button>
          : <span className="size-[18px] flex-none" />}
        <button type="button" onClick={() => ctx.onSelect(node.id)} aria-label={`Sửa ${node.name}`} className="min-w-0 max-w-[520px] flex-[0_1_auto] truncate rounded text-left text-control text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">{node.name}</button>
        {node.code && <span className="mr-auto flex-none text-body text-muted-foreground">{node.code}</span>}
        {!node.code && <span className="mr-auto" />}
        {kids.length > 0 && <span className="min-w-[74px] flex-none text-right text-label tabular-nums text-subtle-foreground">{countNodes(kids)} đv con</span>}
        <span className="absolute top-0.5 right-2 flex items-center gap-0.5 rounded-md bg-secondary opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-lg:hidden">
          {ctx.canMove && <Button variant="ghost" size="icon" className="size-7" aria-label={`Chuyển ${node.name} lên`} disabled={index === 0} onClick={() => ctx.onStep(node.id, -1, index, siblings)}><ArrowUp /></Button>}
          {ctx.canMove && <Button variant="ghost" size="icon" className="size-7" aria-label={`Chuyển ${node.name} xuống`} disabled={index === siblings.length - 1} onClick={() => ctx.onStep(node.id, 1, index, siblings)}><ArrowDown /></Button>}
          <Button variant="ghost" size="icon" className="size-7" aria-label={`Thêm ${ctx.entity} con của ${node.name}`} onClick={() => ctx.onAddChild(node.id)}><Plus /></Button>
          <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label={`Xóa ${node.name}`} onClick={() => ctx.onDelete(node.id)}><Trash2 /></Button>
        </span>
      </div>
      {kids.length > 0 && open && <ul role="group">{kids.map((k, i) => <TreeRow key={k.id} node={k} depth={depth + 1} index={i} siblings={kids} ctx={ctx} />)}</ul>}
    </li>
  )
}

interface FormProps {
  fields: CatalogField[]
  values: CatalogValues
  setValues: (v: CatalogValues) => void
  touched: boolean
  parentOptions: { value: string; label: string }[]
  entity: string
  idPrefix: string
  /** Lỗi theo ô do máy chủ trả về (hiện dưới ô, ưu tiên hơn lỗi "bắt buộc" của máy khách). */
  errors?: Record<string, string>
}

function CatalogFormFields({ fields, values, setValues, touched, parentOptions, entity, idPrefix, errors }: FormProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      {fields.map((f) => {
        const id = `${idPrefix}-${f.name}`
        const serverError = errors?.[f.name]
        const invalid = !!serverError || (touched && !!f.required && !values[f.name]?.trim())
        const isSelect = f.type === "select" || f.type === "parent"
        const options = f.type === "parent" ? parentOptions : f.options
        return (
          <div key={f.name} className={cn("grid content-start gap-1.5", f.span === 1 ? "md:col-span-4" : f.span === 2 ? "md:col-span-8" : "md:col-span-12")}>
            <Label htmlFor={id} className="text-small leading-[1.4] font-semibold">{f.label}{f.required && <span className="text-destructive"> *</span>}{f.note && <span className="font-normal text-muted-foreground"> — {f.note}</span>}</Label>
            {isSelect ? (
              <Select value={values[f.name] || NONE} onValueChange={(v) => setValues({ ...values, [f.name]: v === NONE ? "" : v })}>
                <SelectTrigger id={id}><SelectValue placeholder={f.placeholder} /></SelectTrigger>
                <SelectContent>
                  {!f.required && <SelectItem value={NONE}>{f.type === "parent" ? `— Không có (${entity} gốc) —` : "— Không chọn —"}</SelectItem>}
                  {options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id={id} type={f.type === "number" ? "number" : "text"} value={values[f.name] ?? ""} placeholder={f.placeholder} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-err` : undefined}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            )}
            {invalid && <p id={`${id}-err`} role="alert" className="text-xs text-destructive">{serverError ?? `Vui lòng nhập ${f.label.toLowerCase()}.`}</p>}
          </div>
        )
      })}
    </div>
  )
}

/**
 * One generic catalog (danh mục) screen: toolbar + table (or hierarchical tree with a side form) + add/edit + delete confirmation.
 * Every catalog screen (cơ quan, đơn vị, chức vụ, lĩnh vực, ...) is this block with different fields/columns.
 */
export function CatalogPage<T>({ entity, fields, columns = [], rows = [], getRowId, getValues, variant = "table", tree = [], findRow, leading, search, onSearchChange, searchPlaceholder, filters, onRefresh, addLabel, onSave, saveErrors, onDelete, onMove, tableMinWidthClass, sort, onSortChange, loading, page, pageSize, total, onPageChange, onPageSizeChange }: CatalogPageProps<T>) {
  const isTree = variant === "tree"
  const parentField = fields.find((f) => f.type === "parent")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<T | null>(null)
  const [parentId, setParentId] = React.useState<string | undefined>()
  const [values, setValues] = React.useState<CatalogValues>({})
  const [touched, setTouched] = React.useState(false)
  const [serverErrors, setServerErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState<T | null>(null)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [drop, setDrop] = React.useState<{ id: string; pos: DropPosition } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  /** Below lg the tree and the side form are shown one at a time. */
  const [detailOpen, setDetailOpen] = React.useState(false)
  const panelRef = React.useRef<HTMLFormElement>(null)

  const lookup = (id: string) => findRow?.(id) ?? rows.find((r) => getRowId(r) === id)
  const flat = React.useMemo(() => flattenTree(tree), [tree])
  const editingId = editing ? getRowId(editing) : undefined

  const parentOptions = React.useMemo(
    () => flat.filter((x) => !editingId || !isInSubtree(tree, editingId, x.node.id)).map((x) => ({ value: x.node.id, label: `${"  ".repeat(x.depth)}${x.node.name}` })),
    [flat, tree, editingId],
  )
  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus())

  const startAdd = (parent?: string) => {
    setEditing(null)
    setParentId(parent)
    setValues(parentField && parent ? { [parentField.name]: parent } : {})
    setTouched(false)
    setServerErrors({})
    if (isTree) { setDetailOpen(true); focusPanel() } else setFormOpen(true)
  }
  const startEdit = (row: T) => {
    setEditing(row)
    setParentId(undefined)
    const id = getRowId(row)
    const parent = flat.find((x) => x.node.id === id)?.parentId
    setValues({ ...getValues(row), ...(parentField ? { [parentField.name]: parent ?? "" } : {}) })
    setTouched(false)
    setServerErrors({})
    if (isTree) { setDetailOpen(true); focusPanel() } else setFormOpen(true)
  }

  const missing = fields.filter((f) => f.required && !values[f.name]?.trim())
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (missing.length) return
    const pid = parentField ? values[parentField.name] || undefined : parentId
    const finish = () => {
      setFormOpen(false)
      if (isTree) { setEditing(null); setValues({}); setParentId(undefined); setTouched(false); setDetailOpen(false) }
    }
    const result = onSave?.(values, editing, pid)
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setSaving(true)
      setServerErrors({})
      ;(result as Promise<unknown>).then(finish, (error: unknown) => {
        const errors = saveErrors?.(error) ?? {}
        setServerErrors(errors)
        const first = Object.keys(errors)[0]
        if (first) requestAnimationFrame(() => (document.getElementById(`catalog-${first}`) ?? document.getElementById(`catalog-panel-${first}`))?.focus())
      }).finally(() => setSaving(false))
    } else finish()
  }

  const nameOf = (id: string) => flat.find((x) => x.node.id === id)?.node.name ?? id
  const move = (id: string, targetId: string, pos: DropPosition, message: string) => { onMove?.(id, targetId, pos); setAnnounce(message) }

  const editingParent = editingId ? flat.find((x) => x.node.id === editingId)?.parentId : undefined
  const siblings = editingId ? flat.filter((x) => x.parentId === editingParent).map((x) => x.node) : []
  const siblingIndex = siblings.findIndex((n) => n.id === editingId)
  const stepEditing = (dir: -1 | 1) => { if (editingId) treeCtx.onStep(editingId, dir, siblingIndex, siblings) }

  const treeCtx: TreeCtx = {
    entity, selectedId: editingId, dragId, drop, tree, canMove: !!onMove, setDragId, setDrop,
    onSelect: (id) => { const r = lookup(id); if (r) startEdit(r) },
    onAddChild: (id) => startAdd(id),
    onDelete: (id) => { const r = lookup(id); if (r) setDeleting(r) },
    onStep: (id, dir, index, siblings) => {
      const target = siblings[index + dir]
      if (!target) return
      move(id, target.id, dir < 0 ? "before" : "after", `Đã chuyển ${nameOf(id)} ${dir < 0 ? "lên" : "xuống"}, vị trí ${index + 1 + dir} trên ${siblings.length}`)
    },
    onDropNode: (id, targetId, pos) => move(id, targetId, pos, pos === "inside" ? `Đã chuyển ${nameOf(id)} vào trong ${nameOf(targetId)}` : `Đã chuyển ${nameOf(id)} ${pos === "before" ? "lên trước" : "xuống sau"} ${nameOf(targetId)}`),
  }

  const actionColumn: Column<T> = {
    key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 130, align: "right",
    cell: (row) => (
      <div className="flex justify-end">
        <ArchiveRowMenu label={`${entity} ${getRowId(row)}`} actions={[{ id: "edit", label: "Sửa", onSelect: () => startEdit(row) }, { id: "del", label: "Xóa", destructive: true, onSelect: () => setDeleting(row) }]} />
      </div>
    ),
  }

  const shownTree = isTree ? filterTree(tree, normalizeVi, search ?? "") : tree
  const add = addLabel ?? `Thêm ${entity}`
  const formTitle = editing ? `Sửa ${entity}` : `Thêm ${entity}`
  const submitLabel = editing ? "Lưu thay đổi" : add
  // Sửa ô nào thì lỗi máy chủ của ô đó không còn đúng nữa.
  const editValues = (next: CatalogValues) => {
    setValues(next)
    setServerErrors((prev) => {
      const kept = Object.fromEntries(Object.entries(prev).filter(([name]) => next[name] === values[name]))
      return Object.keys(kept).length === Object.keys(prev).length ? prev : kept
    })
  }
  const formProps = { fields, values, setValues: editValues, touched, parentOptions, entity, errors: serverErrors }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      <ArchiveToolbar leading={leading} search={search} onSearchChange={onSearchChange} searchPlaceholder={searchPlaceholder ?? `Tìm mã hoặc tên ${entity}…`} onRefresh={onRefresh}
        actions={<Button size="toolbar" onClick={() => startAdd()}>+ {add}</Button>}>
        {filters}
      </ArchiveToolbar>
      {isTree ? (
        <div className="flex min-h-0 flex-1 gap-3">
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm", detailOpen && "max-lg:hidden")}>
            <div className="flex h-[38px] flex-none items-center gap-2.5 border-b bg-secondary px-3 text-caption font-bold tracking-[0.05em] text-muted-foreground uppercase">
              <span>Cây {entity}</span>
              <span className="ml-auto text-label font-normal tracking-normal normal-case tabular-nums text-subtle-foreground">{countNodes(tree)} {entity}</span>
            </div>
            {onMove && <div className="flex flex-none items-center gap-1.5 border-b px-3 py-[7px] text-xs text-muted-foreground max-lg:hidden"><Move aria-hidden className="size-3.5 text-primary" />Kéo thả để đổi thứ tự. Thả vào giữa một dòng để đưa thành {entity} con.</div>}
            <div className="min-h-0 flex-1 overflow-auto pt-1 pb-2">
              {shownTree.length === 0
                ? <EmptyState title={search ? "Không tìm thấy kết quả" : `Chưa có ${entity}`} />
                : <ul role="tree" aria-label={`Cây ${entity}`}>{shownTree.map((n, i) => <TreeRow key={n.id} node={n} depth={0} index={i} siblings={shownTree} ctx={treeCtx} />)}</ul>}
            </div>
            <div role="status" aria-live="polite" className="sr-only">{announce}</div>
          </div>
          <aside className={cn("w-[420px] shrink-0 overflow-auto rounded-lg border bg-card px-4 pt-3.5 pb-4 shadow-sm max-lg:min-w-0 max-lg:flex-1 max-lg:self-stretch", !detailOpen && "max-lg:hidden")} aria-label={`Biểu mẫu ${entity}`}>
            <form ref={panelRef} onSubmit={submit} noValidate className="grid gap-3.5">
              <div className="border-b pb-[11px]">
                <Button type="button" variant="ghost" size="sm" className="mb-2 -ml-2 max-md:h-10 lg:hidden" onClick={() => setDetailOpen(false)}><ChevronLeft />Quay lại cây {entity}</Button>
                <h3 className="m-0 text-lead font-semibold text-foreground">{formTitle}</h3>
                <p className="m-0 mt-0.5 text-xs leading-[1.45] text-muted-foreground">{editing ? `Đang sửa “${editing && nameOf(editingId ?? "")}”.` : `${entity.charAt(0).toUpperCase()}${entity.slice(1)} mới sẽ nằm dưới ${entity} cha được chọn bên dưới.`}</p>
              </div>
              <CatalogFormFields {...formProps} idPrefix="catalog-panel" />
              {editing && (
                <div className="flex flex-wrap gap-2 lg:hidden">
                  <Button type="button" variant="outline" className="h-10" onClick={() => startAdd(editingId)}><Plus />Thêm {entity} con</Button>
                  {onMove && <Button type="button" variant="outline" className="h-10" aria-label={`Chuyển ${nameOf(editingId ?? "")} lên`} disabled={siblingIndex <= 0} onClick={() => stepEditing(-1)}><ArrowUp />Lên</Button>}
                  {onMove && <Button type="button" variant="outline" className="h-10" aria-label={`Chuyển ${nameOf(editingId ?? "")} xuống`} disabled={siblingIndex < 0 || siblingIndex >= siblings.length - 1} onClick={() => stepEditing(1)}><ArrowDown />Xuống</Button>}
                  <Button type="button" variant="outline" className="h-10 text-destructive" onClick={() => editing && setDeleting(editing)}><Trash2 />Xóa</Button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-[13px]">
                {editing && <Button type="button" variant="outline" className="max-md:h-10" onClick={() => { startAdd(); setDetailOpen(false) }}>Hủy</Button>}
                <Button type="submit" className="max-md:h-10" disabled={saving}>{submitLabel}</Button>
              </div>
            </form>
          </aside>
        </div>
      ) : (
        <DataTable columns={[...withSortHeaders(columns, sort, onSortChange), actionColumn]} rows={rows} getRowId={getRowId} loading={loading} page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} emptyTitle={`Chưa có ${entity}`} minWidthClass={tableMinWidthClass ?? (columns.length > 6 ? "min-w-[64rem]" : columns.length > 4 ? "min-w-[52rem]" : undefined)} />
      )}

      {!isTree && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="p-0">
            <form onSubmit={submit} noValidate>
              <DialogHeader>
                <DialogTitle>{formTitle}</DialogTitle>
                <DialogDescription>Các trường có dấu * là bắt buộc.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-[18px] py-4"><CatalogFormFields {...formProps} idPrefix="catalog" /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={saving}>{submitLabel}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleting !== null} onOpenChange={(o) => { if (!o) setDeleting(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa {entity}?</DialogTitle>
            <DialogDescription>Thao tác này không thể hoàn tác. Dữ liệu liên quan có thể bị ảnh hưởng.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { if (deleting) { if (isTree && editingId === getRowId(deleting)) { setEditing(null); setValues({}); setDetailOpen(false) } onDelete?.(deleting) } setDeleting(null) }}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
