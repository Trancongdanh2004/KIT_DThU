"use client"

// @dthu/ui 0.2.0 · block-documents
import * as React from "react"
import { CircleAlert, ListFilter, RefreshCw, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Kbd } from "@/components/ui/kbd"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, FilterField, FilterToggle, type Column } from "@/components/blocks/shell/data-table"
import type { DocumentSort } from "./use-document-list"
import { ResponsiveFilterRow, type FilterBarItem } from "@/components/app/FilterBar"

export interface DocumentFilter {
  id: string; label: string; value: string; options: { value: string; label: string }[]
  /** Render before the search box (e.g. the status filter of the outgoing list). */
  leading?: boolean
  /** Fixed width of the field in px (reference: 190 for "Loại", 230 for "Đơn vị"…). Default 190. */
  width?: number
  /** Show the "×" button that resets the filter to "all". */
  clearable?: boolean
  /** Highlight the field as applied (soft navy fill, navy label) like the "Năm" filter of the ledgers. */
  active?: boolean
  /** Render as a dropdown button "Chặng: Tất cả ▾" (reference `dtb-fbtn`) instead of a boxed field. */
  caret?: boolean
}

export interface DocumentQuickFilter { id: string; label: string; count?: number; active?: boolean }

export interface DocumentBulkAction { id: string; label: string; icon?: React.ReactNode; destructive?: boolean; onClick: (ids: string[]) => void }

export interface DocumentListPageProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  filters?: DocumentFilter[]
  onFilterChange?: (id: string, value: string) => void
  quickFilters?: DocumentQuickFilter[]
  onQuickFilter?: (id: string) => void
  primaryAction?: { label: string; onClick?: () => void; /** No leading "+": an icon button of the regular 36px size (e.g. "Xuất sổ"). */ plain?: boolean; icon?: React.ReactNode }
  extraActions?: React.ReactNode
  /** Extra controls placed between the filters and the refresh button (e.g. a segmented scope switch). */
  toolbarExtra?: React.ReactNode
  onRefresh?: () => void
  /** Shows the "advanced filter" funnel button. */
  onAdvancedFilter?: () => void
  /** RIS: nút "Xoá bộ lọc" trong drawer bộ lọc nâng cao. */
  onResetFilters?: () => void
  onRowClick?: (row: T) => void
  loading?: boolean
  /** Replaces the table body with an error state and a retry button. */
  error?: { title?: string; description?: string; onRetry?: () => void }
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  emptyAction?: React.ReactNode
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  /** Row selection: a checkbox column (select all on the current page) and a bulk action bar. */
  selectable?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  bulkActions?: DocumentBulkAction[]
  /** Sorting: column keys listed in `sortableKeys` get a sortable header. */
  sort?: DocumentSort
  sortableKeys?: string[]
  onSortChange?: (key: string) => void
  /** Search box without the "/" hint (ledger screens). */
  hideSearchKbd?: boolean
  /** Refresh button 36px square instead of 39px. */
  compactRefresh?: boolean
  /** Icon of the refresh button (default circular arrows). */
  refreshIcon?: React.ReactNode
  rowClassName?: (row: T) => string | undefined
  minWidthClass?: string
  className?: string
}

/** Labelled select of the filter bar (reference `dtb-fo`: 36px box, inline label, borderless 13.5px/700 control) or a caret button (`dtb-fbtn`). */
export function DocumentFilterSelect({ filter, onChange }: { filter: DocumentFilter; onChange?: (value: string) => void }) {
  const items = <SelectContent>{filter.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
  if (filter.caret) {
    return (
      <Select value={filter.value} onValueChange={onChange}>
        <SelectTrigger aria-label={filter.label} className="h-9 w-auto flex-none gap-[7px] pr-[11px] pl-[11px] text-control font-semibold text-muted-foreground hover:text-foreground [&>svg]:hidden">
          <span className="shrink-0 !flex-none">{filter.label}:</span><b className="font-bold text-foreground"><SelectValue /></b><i aria-hidden className="text-micro opacity-60 not-italic">▾</i>
        </SelectTrigger>
        {items}
      </Select>
    )
  }
  return (
    <FilterField
      label={filter.label}
      title={filter.label}
      style={{ "--filter-w": `${filter.width ?? 190}px` } as React.CSSProperties}
      className={cn(
        "w-auto sm:w-[var(--filter-w)] max-w-[calc(100vw-2.5rem)]",
        filter.active && "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent [&>span:first-child]:text-primary"
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Select value={filter.value} onValueChange={onChange}>
          <SelectTrigger aria-label={filter.label} className="h-[34px] coarse:h-[42px] min-w-0 border-0 bg-transparent pr-1 pl-1.5 text-control font-bold shadow-none hover:border-0 focus-visible:shadow-none data-[state=open]:shadow-none"><SelectValue /></SelectTrigger>
          {items}
        </Select>
        {filter.clearable && (
          <button type="button" aria-label="Xoá chọn" tabIndex={-1} onClick={() => onChange?.("all")}
            className="absolute top-1/2 right-[26px] grid size-[22px] -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-subtle-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"><X /></button>
        )}
      </div>
    </FilterField>
  )
}

function SortHeader({ label, dir, onClick }: { label: React.ReactNode; dir?: "asc" | "desc"; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("cursor-pointer border-0 bg-transparent p-0 text-[length:inherit] font-[inherit] tracking-[inherit] uppercase outline-none hover:text-foreground focus-visible:text-foreground", dir && "text-primary hover:text-primary")}>
      {label}{dir && <span aria-hidden> {dir === "asc" ? "▲" : "▼"}</span>}
    </button>
  )
}
/** Search box with the "/" shortcut hint (reference `dtb-tsearch`: 36px, flex 1 1 260 within 140–420); pressing "/" outside a field focuses it. */
function SearchBox({ value, onChange, placeholder, hideKbd }: { value?: string; onChange?: (v: string) => void; placeholder: string; hideKbd?: boolean }) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest("[role=dialog],[role=menu],[role=listbox]"))) return
      e.preventDefault(); ref.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [hideKbd])
  return (
    <div className="relative flex h-9 coarse:h-11 max-w-[420px] min-w-[140px] flex-[1_1_260px] items-center gap-[9px] rounded-md border bg-card px-[11px] transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none focus-within:border-primary focus-within:shadow-focus-soft max-[900px]:max-w-none max-[900px]:min-w-0 max-[900px]:flex-auto overflow-hidden">
      <Search aria-hidden strokeWidth={2.2} className="size-4 flex-none text-subtle-foreground" />
      <input ref={ref} type="text" value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-0 placeholder:text-subtle-foreground" />
      {!hideKbd && <Kbd aria-hidden className="max-sm:hidden">/</Kbd>}
    </div>
  )
}

/** Generic document list screen: filter bar + DataTable. Every document list (outgoing, incoming, internal, archive…) is a configuration of this. */
export function DocumentListPage<T>({
  columns, rows, getRowId, search, onSearchChange, searchPlaceholder = "Tìm kiếm…", filters = [], onFilterChange, quickFilters = [], onQuickFilter,
  primaryAction, extraActions, toolbarExtra, onRefresh, onAdvancedFilter, onResetFilters, onRowClick, loading, error, emptyTitle = "Không có văn bản", emptyDescription, emptyAction,
  page, pageSize, total, onPageChange, onPageSizeChange, selectable, selectedIds = [], onSelectedIdsChange, bulkActions = [], sort, sortableKeys = [], onSortChange, hideSearchKbd, compactRefresh, refreshIcon, rowClassName, minWidthClass, className,
}: DocumentListPageProps<T>) {
  const ids = rows.map(getRowId)
  const selected = new Set(selectedIds)
  const allOn = ids.length > 0 && ids.every((i) => selected.has(i))
  const someOn = !allOn && ids.some((i) => selected.has(i))
  const toggleAll = () => onSelectedIdsChange?.(allOn ? selectedIds.filter((i) => !ids.includes(i)) : Array.from(new Set([...selectedIds, ...ids])))
  const toggleOne = (id: string) => onSelectedIdsChange?.(selected.has(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])

  const cols: Column<T>[] = columns.map((c) => sortableKeys.includes(c.key)
    ? { ...c, header: <SortHeader label={c.header} dir={sort?.key === c.key ? sort.dir : undefined} onClick={() => onSortChange?.(c.key)} /> }
    : c)
  if (selectable) {
    cols.unshift({
      key: "__select", className: "w-10 !pr-0",
      header: <Checkbox aria-label="Chọn tất cả dòng trong trang" checked={allOn ? true : someOn ? "indeterminate" : false} onCheckedChange={toggleAll} />,
      cell: (row) => { const id = getRowId(row); return <span onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Chọn dòng ${id}`} checked={selected.has(id)} onCheckedChange={() => toggleOne(id)} /></span> },
    })
  }

  const filterNode = (f: DocumentFilter) => <DocumentFilterSelect key={f.id} filter={f} onChange={(v) => onFilterChange?.(f.id, v)} />
  const count = total ?? rows.length
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      {/* RIS: thanh lọc luôn một hàng; bộ lọc không vừa chỗ chuyển vào drawer "Bộ lọc nâng cao". */}
      <ResponsiveFilterRow
        frame="-mx-(--page-bleed-x) -mt-(--page-bleed-t) flex-none border-b bg-card px-[calc(var(--page-bleed-x,0px)+--spacing(2.5))] py-[9px]"
        onReset={onResetFilters}
        search={<SearchBox value={search} onChange={onSearchChange} placeholder={searchPlaceholder} hideKbd={hideSearchKbd} />}
        filters={[
          ...quickFilters.map((q): FilterBarItem => ({
            id: `q-${q.id}`, label: q.label, active: q.active, selfLabelled: true, lead: true,
            node: <FilterToggle pressed={q.active ?? false} onClick={() => onQuickFilter?.(q.id)}>{q.label}{q.count !== undefined && <span className="rounded-[9px] bg-muted px-1.5 py-px font-mono text-label text-muted-foreground tabular-nums">{q.count}</span>}</FilterToggle>,
          })),
          ...filters.map((f): FilterBarItem => ({ id: f.id, label: f.label, active: f.active ?? (f.value !== "" && f.value !== "all"), selfLabelled: true, lead: f.leading, node: filterNode(f) })),
        ]}
        actions={<>
          {toolbarExtra}
          {onAdvancedFilter && <Button variant="outline" size="toolbar-icon" className="w-9 min-w-9 px-[9px] text-muted-foreground hover:text-foreground" aria-label="Bộ lọc nâng cao" title="Bộ lọc" onClick={onAdvancedFilter}><ListFilter /></Button>}
          {onRefresh && <Button variant="outline" size="toolbar-icon" className={cn("text-muted-foreground hover:text-foreground", compactRefresh && "w-9")} aria-label="Làm mới" title="Tải lại" onClick={onRefresh}>{refreshIcon ?? <RefreshCw />}</Button>}
          {extraActions}
          {primaryAction && <Button size={primaryAction.plain ? "default" : "toolbar"} onClick={primaryAction.onClick}>{primaryAction.plain ? primaryAction.icon : "+ "}{primaryAction.label}</Button>}
        </>}
      />
      {selectable && selectedIds.length > 0 && (
        <div role="region" aria-label="Thao tác hàng loạt" className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-accent px-3 py-1.5 text-sm text-accent-foreground">
          <span className="font-semibold">Đã chọn {selectedIds.length} văn bản</span>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          {bulkActions.map((a) => (
            <Button key={a.id} size="sm" className="max-md:h-10" variant={a.destructive ? "destructive" : "outline"} onClick={() => a.onClick(selectedIds)}>{a.icon}{a.label}</Button>
          ))}
          <Button size="sm" variant="ghost" className="ml-auto max-md:h-10" onClick={() => onSelectedIdsChange?.([])}><X />Bỏ chọn</Button>
        </div>
      )}
      {error ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border bg-card text-center" role="alert">
          <div className="mb-1 flex size-14 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 text-destructive"><CircleAlert className="size-6" /></div>
          <div className="font-semibold">{error.title ?? "Không tải được danh sách"}</div>
          <div className="text-sm text-muted-foreground">{error.description ?? "Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."}</div>
          <Button variant="outline" className="mt-2" onClick={error.onRetry}><RefreshCw />Thử lại</Button>
        </div>
      ) : (
        <DataTable columns={cols} rows={rows} getRowId={getRowId} loading={loading} emptyTitle={emptyTitle} rowClassName={rowClassName} minWidthClass={minWidthClass}
          emptyDescription={emptyAction ? <>{emptyDescription}<div className="mt-3">{emptyAction}</div></> : emptyDescription}
          page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRowClick={onRowClick} />
      )}
      <span className="sr-only" aria-live="polite">{loading ? "Đang tải" : `${count} văn bản`}</span>
    </div>
  )
}

/* ---- Shared cells (reference `dtb-*` vocabulary) ---- */

/** Row class for the red 3px left marker of rows held by the current user (`is-mark`). */
export const documentRowMark = "[&>td:first-child]:shadow-[inset_3px_0_0_var(--destructive)]"

export interface DocumentSummary {
  id: string
  title: string
  /** Issued number, e.g. "1/QĐ-HCTH". Empty means not yet numbered. */
  number?: string
  /** Internal archive number, e.g. "ACME-HC-0004/2026". */
  archiveNo: string
  kind: string
  priority?: "Cao" | "Trung bình" | "Thấp"
}

/** Row number (`dtb-num dtb-muted`, 12px). */
export function DocumentIndexCell({ n }: { n: number }) {
  return <span className="text-xs whitespace-nowrap tabular-nums">{n}</span>
}

/** Two-line date/time (`dtb-num` + `dtb-muted`). Accepts "14/10/2026 10:28". */
export function DocumentDateCell({ value }: { value: string }) {
  const [d, t] = value.split(" ")
  return <><div className="text-xs whitespace-nowrap tabular-nums">{d}</div>{t && <div className="text-subtle-foreground">{t}</div>}</>
}

/** Pill used for document statuses: bordered 11.5px / 500 with the soft tint of its tone. */
export function DocumentPill({ tone = "neutral", className, children }: { tone?: "neutral" | "navy" | "amber" | "green" | "red"; className?: string; children: React.ReactNode }) {
  const t = {
    neutral: "border-border bg-card text-muted-foreground",
    navy: "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent text-primary",
    amber: "border-[color-mix(in_srgb,var(--warning)_30%,var(--card))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--card))] text-warning",
    green: "border-[color-mix(in_srgb,var(--success)_30%,var(--card))] bg-[color-mix(in_srgb,var(--success)_10%,var(--card))] text-success",
    red: "border-[color-mix(in_srgb,var(--destructive)_28%,var(--card))] bg-[color-mix(in_srgb,var(--destructive)_9%,var(--card))] text-destructive",
  }[tone]
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-px text-label leading-[1.5] font-medium whitespace-nowrap", t, className)}>{children}</span>
}

/** Stage chip with a dot (`dtb-chip`). */
export function DocumentChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-[5px] border bg-secondary px-2 py-[3px] text-small font-semibold text-foreground"><span aria-hidden className="size-1.5 flex-none rounded-full bg-info" />{children}</span>
}

/** Waiting time (`dtb-age`): "+2.6 ngày" with a thin bar. */
export function DocumentAgeCell({ days, late = true }: { days: number; late?: boolean }) {
  return (
    <div className="w-full">
      <span className={cn("font-mono text-body leading-[1.2] font-semibold tabular-nums", late && "text-destructive")}>+{days}</span><span className="text-label text-subtle-foreground">ngày</span>
      <div className="mt-[5px] h-[3px] overflow-hidden rounded-sm bg-muted"><i className={cn("block h-full rounded-sm", late ? "bg-destructive" : "bg-primary")} style={{ width: "100%" }} /></div>
    </div>
  )
}

/** Small primary action inside a row (`dtb-cta`: 29px, 12.5px / 600). */
export function DocumentCta({ className, ...props }: React.ComponentProps<"button">) {
  return <button type="button" className={cn("inline-flex h-[29px] cursor-pointer items-center justify-center gap-[7px] rounded-md border border-transparent bg-primary px-[11px] text-small font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-accent-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
}

export function DocumentTitleCell({ doc }: { doc: DocumentSummary }) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-baseline gap-[9px]">
        {doc.number
          ? <span className="font-mono text-body leading-[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-primary">{doc.number}</span>
          : <span className="inline-block rounded-[4px] border border-dashed border-border-strong px-1.5 py-px font-mono text-xs leading-[1.3] whitespace-nowrap text-subtle-foreground">Chưa cấp số</span>}
        <span className="block truncate text-sm leading-[1.35] font-[550] tracking-[-0.005em] text-foreground">{doc.title}</span>
      </div>
      <div className="mt-[3px] flex flex-wrap gap-[7px] text-xs text-subtle-foreground">
        {doc.priority && <span className="rounded-[3px] border border-[#efc5c1] bg-[#fbebea] px-[5px] py-px text-tiny font-bold tracking-[0.03em] whitespace-nowrap text-destructive uppercase">{doc.priority}</span>}
        <span className="font-mono text-label font-medium whitespace-nowrap">{doc.archiveNo}</span>
        <span className="before:mr-[7px] before:content-['·']">{doc.kind}</span>
      </div>
    </div>
  )
}

export interface DocumentHolder { name: string; role: string; initials: string; isMe?: boolean }

export function DocumentHolderCell({ holder, note }: { holder: DocumentHolder; note?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={cn("inline-grid size-[27px] flex-none place-items-center rounded-full border text-tiny leading-none font-bold uppercase select-none", holder.isMe ? "border-destructive bg-destructive text-primary-foreground" : "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent text-primary")}>{holder.initials}</span>
      <span className="block min-w-0">
        <span className={cn("block truncate text-body font-semibold whitespace-nowrap", holder.isMe && "text-destructive")}>{holder.isMe ? "Bạn đang giữ" : holder.name}</span>
        <span className="block truncate text-label whitespace-nowrap text-subtle-foreground">{note ?? holder.role}</span>
      </span>
    </div>
  )
}
