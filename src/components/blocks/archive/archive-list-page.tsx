"use client"

// @dthu/ui 0.2.0 · block-archive
import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import {
  ArchiveChip, ArchiveRowMenu, ArchiveSelect, ArchiveTabs, ArchiveToolbar, withSortHeaders,
  type ArchiveColumn, type ArchiveRowAction, type ArchiveSelectProps, type ArchiveSort, type ArchiveTabItem,
} from "./archive-shared"

export interface ArchiveListChip { id: string; label: string }
export interface ArchiveBulkAction { id: string; label: string; onSelect: (ids: string[]) => void; destructive?: boolean }

export interface ArchiveListPageProps<T> {
  tabs?: ArchiveTabItem[]
  tab?: string
  onTabChange?: (v: string) => void
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  chips?: ArchiveListChip[]
  activeChips?: string[]
  onChipToggle?: (id: string) => void
  selects?: (ArchiveSelectProps & { id: string })[]
  /** Content of the collapsible advanced-filter panel; enables the toggle button. */
  advanced?: React.ReactNode
  advancedOpen?: boolean
  onAdvancedOpenChange?: (open: boolean) => void
  actionLabel?: string
  onAction?: () => void
  onRefresh?: () => void
  /** Extra toolbar buttons placed before the primary action. */
  extraActions?: React.ReactNode
  columns: ArchiveColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  sort?: ArchiveSort
  onSortChange?: (s: ArchiveSort) => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
  bulkActions?: ArchiveBulkAction[]
  rowActions?: (row: T) => ArchiveRowAction[]
  /** Accessible name of a row for its action menu. */
  rowLabel?: (row: T) => string
  loading?: boolean
  error?: { title: string; description?: string; onRetry?: () => void }
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (p: number) => void
  onPageSizeChange?: (n: number) => void
  onRowClick?: (row: T) => void
  /** Panel shown left of the table (below the toolbar). */
  sidebar?: React.ReactNode
  /** Replaces the table (e.g. map view). */
  body?: React.ReactNode
  /** Tailwind min-width class of the table (it scrolls horizontally below it). */
  tableMinWidthClass?: string
  /** Kept for backward compatibility (the page never adds its own padding any more). */
  bare?: boolean
  className?: string
  /** Reserve the blank 51px trailing column the reference keeps even without row actions. */
  actionsColumn?: boolean
}

/** Toolbar (tabs, search, chips, filters, primary action) + DataTable with sort, selection, row menu, error/loading states. */
export function ArchiveListPage<T>(p: ArchiveListPageProps<T>) {
  const { tabs, tab, chips, activeChips = [], selects, selectedIds = [], rowActions, rowLabel, selectable, bulkActions, columns, rows, getRowId } = p
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(getRowId(r)))
  const someSelected = rows.some((r) => selectedIds.includes(getRowId(r)))

  const cols: Column<T>[] = []
  if (selectable) {
    cols.push({
      key: "__select", className: "w-10",
      header: <Checkbox aria-label="Chọn tất cả" checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={(v) => p.onSelectedChange?.(v === true ? Array.from(new Set([...selectedIds, ...rows.map(getRowId)])) : selectedIds.filter((id) => !rows.some((r) => getRowId(r) === id)))} />,
      cell: (r) => {
        const id = getRowId(r)
        return <span onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Chọn ${rowLabel?.(r) ?? id}`} checked={selectedIds.includes(id)} onCheckedChange={(v) => p.onSelectedChange?.(v === true ? [...selectedIds, id] : selectedIds.filter((x) => x !== id))} /></span>
      },
    })
  }
  cols.push(...withSortHeaders(columns, p.sort, p.onSortChange))
  if (rowActions) cols.push({ key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 120, align: "right", cell: (r) => <div className="flex justify-end"><ArchiveRowMenu label={rowLabel?.(r) ?? getRowId(r)} actions={rowActions(r)} /></div> })

  else if (p.actionsColumn) cols.push({ key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 51, cell: () => null })

  const table = p.error ? (
    <div className="flex min-h-0 flex-1 items-start justify-center rounded-lg border bg-card p-8">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle />
        <AlertTitle>{p.error.title}</AlertTitle>
        <AlertDescription>{p.error.description}{p.error.onRetry && <div className="mt-3"><Button size="sm" variant="outline" className="bg-background text-foreground" onClick={p.error.onRetry}>Thử lại</Button></div>}</AlertDescription>
      </Alert>
    </div>
  ) : (
    <DataTable columns={cols} rows={rows} getRowId={getRowId} loading={p.loading} emptyTitle={p.emptyTitle} emptyDescription={p.emptyDescription}
      page={p.page} pageSize={p.pageSize} total={p.total} onPageChange={p.onPageChange} onPageSizeChange={p.onPageSizeChange} onRowClick={p.onRowClick} minWidthClass={p.tableMinWidthClass ?? (cols.length >= 8 ? "min-w-[64rem]" : cols.length >= 5 ? "min-w-[54rem]" : undefined)} />
  )

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5 max-md:overflow-y-auto", p.className)}>
      <ArchiveToolbar
        leading={tabs && tab !== undefined ? <ArchiveTabs items={tabs} value={tab} onValueChange={p.onTabChange} /> : undefined}
        search={p.search} onSearchChange={p.onSearchChange} searchPlaceholder={p.searchPlaceholder}
        hasAdvanced={p.advanced !== undefined} advancedOpen={p.advancedOpen} onAdvancedOpenChange={p.onAdvancedOpenChange} onRefresh={p.onRefresh}
        actions={<>{p.extraActions}{p.actionLabel && <Button size="toolbar" onClick={p.onAction}>+ {p.actionLabel}</Button>}</>}>
        {chips?.map((c) => <ArchiveChip key={c.id} active={activeChips.includes(c.id)} onClick={() => p.onChipToggle?.(c.id)}>{c.label}</ArchiveChip>)}
        {selects?.map(({ id, ...s }) => <ArchiveSelect key={id} {...s} />)}
      </ArchiveToolbar>
      {p.advanced !== undefined && p.advancedOpen && <div className="shrink-0 rounded-lg border bg-card p-3">{p.advanced}</div>}
      {selectable && selectedIds.length > 0 && (
        <div role="region" aria-label="Thao tác hàng loạt" className="flex shrink-0 items-center gap-2 rounded-lg border border-primary/40 bg-accent px-3 py-2 text-sm">
          <span className="font-semibold text-accent-foreground" aria-live="polite">Đã chọn {selectedIds.length}</span>
          {bulkActions?.map((a) => <Button key={a.id} size="sm" variant={a.destructive ? "destructive" : "outline"} onClick={() => a.onSelect(selectedIds)}>{a.label}</Button>)}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => p.onSelectedChange?.([])}>Bỏ chọn</Button>
        </div>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col gap-3.5 max-md:min-h-[26rem] md:flex-row", p.sidebar && "md:items-start")}>
        {p.sidebar}
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col max-md:min-h-[24rem]", p.sidebar && "md:self-stretch")}>{p.body ?? table}</div>
      </div>
    </div>
  )
}
