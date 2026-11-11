import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter, MoreHorizontal, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Column } from "@/components/blocks/shell/data-table"
import { FilterToggle } from "@/components/blocks/shell/page-chrome"
import { ResponsiveFilterRow, toFilterItems } from "@/components/app/FilterBar"

export interface ArchiveTabItem { value: string; label: React.ReactNode; count?: number; /** Leading icon (pill variant). */ icon?: React.ReactNode }

/** Segmented tabs with optional count pill (reference `do-seg`): 36px, 1px border, radius 6, buttons 13.5/600 padding 0 13, active = primary fill. */
export function ArchiveTabs({ items, value, onValueChange, label = "Chế độ xem", className, variant = "segmented" }: { items: ArchiveTabItem[]; value: string; onValueChange?: (v: string) => void; label?: string; className?: string; /** `pill` = grey track with a white active tab and icons (reference `dgh-tabs`). */ variant?: "segmented" | "pill" }) {
  if (variant === "pill") {
    return (
      <div role="tablist" aria-label={label} className={cn("inline-flex h-9 coarse:h-11 flex-none gap-0.5 rounded-lg bg-muted p-[3px] max-[900px]:flex-[1_1_100%]", className)}>
        {items.map((t) => {
          const active = t.value === value
          return (
            <button key={t.value} type="button" role="tab" aria-selected={active} onClick={() => onValueChange?.(t.value)}
              className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 text-body whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary max-[900px]:min-w-0 max-[900px]:flex-1 max-[900px]:justify-center max-[900px]:px-2 max-[900px]:text-small [&>svg]:size-[15px] max-[480px]:[&>svg]:hidden",
                active ? "bg-card font-semibold text-primary shadow-[0_1px_2px_rgba(16,28,44,.12)]" : "font-medium text-muted-foreground hover:text-foreground")}>
              {t.icon}{t.label}
              {t.count !== undefined && <span className="rounded-[9px] bg-muted px-1.5 font-mono text-caption font-normal text-muted-foreground">{t.count}</span>}
            </button>
          )
        })}
      </div>
    )
  }
  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex h-9 coarse:h-11 max-w-full flex-none overflow-x-auto overflow-y-hidden rounded-md border bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      {items.map((t) => {
        const active = t.value === value
        return (
          <button key={t.value} type="button" role="tab" aria-selected={active} onClick={() => onValueChange?.(t.value)}
            className={cn("inline-flex flex-none cursor-pointer items-center gap-1.5 border-r px-[13px] text-control font-semibold whitespace-nowrap outline-none last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring", active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            {t.label}
            {t.count !== undefined && <span className={cn("rounded-[9px] px-1.5 font-mono text-caption font-normal", active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")}>{t.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export interface ArchiveSelectProps { label: string; value: string; options: { value: string; label: string }[]; onValueChange?: (v: string) => void; className?: string; /** Fixed width in px (the reference sizes each filter). */ width?: number }

/** Toolbar filter select "Label: value" (reference `dtb-fo`), fixed width on desktop, auto on mobile. */
export function ArchiveSelect({ label, value, options, onValueChange, className, width = 180 }: ArchiveSelectProps) {
  const current = options.find((o) => o.value === value)
  const set = value !== "" && value !== "all"
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        label={label}
        active={set}
        className={cn("flex-none w-auto sm:w-[var(--select-w)] max-w-[calc(100vw-2.5rem)]", className)}
        style={{ "--select-w": `${width}px` } as React.CSSProperties}
      >
        <span className="min-w-0 flex-1 truncate text-left"><SelectValue>{current?.label}</SelectValue></span>
      </SelectTrigger>
      <SelectContent className="min-w-48">{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  )
}

/** Toggle chip of the filter row (reference `dtb-tgl`). */
export function ArchiveChip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return <FilterToggle pressed={!!active} onClick={onClick}>{children}</FilterToggle>
}

export function ArchiveStat({ label, value, hint, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-[9px] border border-l-[3px] bg-card px-3.5 pt-[11px] pb-3 shadow-sm", className)}>
      <div className="text-label font-bold tracking-[0.04em] text-subtle-foreground uppercase">{label}</div>
      <div className="mt-1 text-heading leading-[1.25] font-bold text-foreground">{value}</div>
      {hint && <div className="mt-[3px] text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

export interface ArchiveToolbarProps {
  /** Rendered before the search box (tabs). */
  leading?: React.ReactNode
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  /** Chips and selects. */
  children?: React.ReactNode
  advancedOpen?: boolean
  onAdvancedOpenChange?: (open: boolean) => void
  /** Show the advanced-filter toggle. */
  hasAdvanced?: boolean
  onRefresh?: () => void
  actions?: React.ReactNode
  className?: string
}

/** Toolbar row of archive screens: tabs, search ("/" focuses it), chips, selects, advanced toggle, refresh, actions. */
export function ArchiveToolbar({ leading, search, onSearchChange, searchPlaceholder = "Tìm kiếm…", children, advancedOpen, onAdvancedOpenChange, hasAdvanced, onRefresh, actions, className }: ArchiveToolbarProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (!ref.current?.offsetParent) return
      e.preventDefault()
      ref.current.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
// RIS: clear an entire row at once; filters that don't fit are moved to the "Advanced Filters" drawer.
  return (
    <ResponsiveFilterRow
      frame={cn("-mx-(--page-bleed-x) -mt-(--page-bleed-t) flex-none border-b bg-card px-[calc(var(--page-bleed-x,0px)+--spacing(2.5))] py-[9px]", className)}
      search={<SearchInput ref={ref} value={search ?? ""} onChange={(e) => onSearchChange?.(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} aria-keyshortcuts="/" />}
      filters={[...toFilterItems(leading).map((item) => ({ ...item, id: `leading-${item.id}`, active: false, lead: true })), ...toFilterItems(children)]}
      actions={<>
        {hasAdvanced && <Button type="button" variant="outline" size="toolbar-icon" aria-label="Bộ lọc nâng cao" title="Bộ lọc" aria-expanded={!!advancedOpen} className={cn("w-9 min-w-9 text-muted-foreground hover:text-foreground", advancedOpen && "border-primary text-primary")} onClick={() => onAdvancedOpenChange?.(!advancedOpen)}><ListFilter /></Button>}
        {onRefresh && <Button type="button" variant="outline" size="toolbar-icon" className="text-muted-foreground hover:text-foreground" aria-label="Làm mới" title="Tải lại" onClick={onRefresh}><RefreshCw /></Button>}
        {actions}
      </>}
    />
  )
}

// ---- Sorting
export type ArchiveSort = { key: string; dir: "asc" | "desc" } | null
/** asc -> desc -> none. */
export function nextArchiveSort(cur: ArchiveSort, key: string): ArchiveSort {
  if (!cur || cur.key !== key) return { key, dir: "asc" }
  return cur.dir === "asc" ? { key, dir: "desc" } : null
}

export interface ArchiveColumn<T> extends Column<T> {
  /** Makes the header a sort button; the value is reported through onSortChange under `key`. */
  sortable?: boolean
}

export function ArchiveSortHeader({ label, columnKey, sort, onSort }: { label: React.ReactNode; columnKey: string; sort?: ArchiveSort; onSort?: (key: string) => void }) {
  const active = sort?.key === columnKey ? sort.dir : null
  const Icon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown
  return (
    <button type="button" onClick={() => onSort?.(columnKey)} className={cn("-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", active && "text-foreground")}
      aria-label={`Sắp xếp theo ${typeof label === "string" ? label.toLowerCase() : columnKey}${active ? (active === "asc" ? ", đang tăng dần" : ", đang giảm dần") : ""}`}>
      {label}<Icon className={cn("size-3", !active && "opacity-50")} aria-hidden />
    </button>
  )
}

/** Turns sortable columns into sort-button headers. */
export function withSortHeaders<T>(columns: ArchiveColumn<T>[], sort: ArchiveSort | undefined, onSortChange?: (s: ArchiveSort) => void): Column<T>[] {
  return columns.map((c) => {
    if (!c.sortable) return c
    return { ...c, header: <ArchiveSortHeader label={c.header} columnKey={c.key} sort={sort} onSort={(k) => onSortChange?.(nextArchiveSort(sort ?? null, k))} /> }
  })
}

// ---- Row actions
export interface ArchiveRowAction { id: string; label: string; onSelect: () => void; destructive?: boolean }

/** "···" menu at the end of a row. */
export function ArchiveRowMenu({ label, actions }: { label: string; actions: ArchiveRowAction[] }) {
  if (actions.length === 0) return null
  // RIS: tối đa 2 thao tác thì hiện nút ngay trên dòng, từ 3 trở lên mới gom vào menu ⋯ (giống RowActions).
  if (actions.length <= 2)
    return (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        {actions.map((a) => <Button key={a.id} type="button" size="sm" variant="ghost" className={cn(a.destructive && "text-destructive hover:text-destructive")} aria-label={`${a.label} ${label}`} onClick={a.onSelect}>{a.label}</Button>)}
      </div>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-[30px] text-subtle-foreground hover:text-foreground" aria-label={`Thao tác cho ${label}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {actions.map((a) => <DropdownMenuItem key={a.id} variant={a.destructive ? "destructive" : "default"} onSelect={a.onSelect}>{a.label}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const archiveMono = (v: React.ReactNode) => <span className="font-mono text-xs font-bold whitespace-nowrap text-primary">{v}</span>
