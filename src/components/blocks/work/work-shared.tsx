"use client"

// @dthu/ui 0.2.0 · block-work
import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterField } from "@/components/blocks/shell/page-chrome"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DateRange } from "@/components/ui/date-picker"

export const WORK_ALL = "__all"

/** State that can be driven by a prop or left to the component. */
export function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void): [T, (v: T) => void] {
  const [inner, setInner] = React.useState<T>(initial)
  const current = value !== undefined ? value : inner
  const set = React.useCallback((v: T) => { setInner(v); onChange?.(v) }, [onChange])
  return [current, set]
}

/** Client-side pagination over an already filtered list. */
export function usePaged<T>(rows: T[], initialSize: number) {
  const [page, setPage] = React.useState(1)
  const [size, setSize] = React.useState(initialSize)
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const safePage = Math.min(page, pageCount)
  const pageRows = React.useMemo(() => rows.slice((safePage - 1) * size, safePage * size), [rows, safePage, size])
  return { page: safePage, setPage, size, setSize: (n: number) => { setSize(n); setPage(1) }, pageRows, total: rows.length, reset: () => setPage(1) }
}

export type SortDir = "asc" | "desc"
export interface SortState { key: string; dir: SortDir }

/** Sort rows by an accessor map; clicking the same key flips direction. */
export function useSort<T>(rows: T[], accessors: Record<string, (r: T) => string | number>, initial?: SortState) {
  const [sort, setSort] = React.useState<SortState | undefined>(initial)
  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const get = accessors[sort.key]
    if (!get) return rows
    const m = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b)
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "vi")) * m
    })
    // accessors are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort])
  const toggle = (key: string) => setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
  return { sorted, sort, toggle }
}

/** Column header button with a sort indicator. */
export function WorkSortHeader({ label, sortKey, sort, onToggle, className }: { label: string; sortKey: string; sort?: SortState; onToggle: (key: string) => void; className?: string }) {
  const active = sort?.key === sortKey
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
  return (
    <button type="button" onClick={() => onToggle(sortKey)} aria-label={`Sắp xếp theo ${label}`} className={cn("inline-flex items-center gap-1 rounded-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring", active && "text-foreground", className)}>
      {label}<Icon className={cn("size-3", !active && "opacity-50")} aria-hidden />
    </button>
  )
}

/** Compact "Label: value" select, sized to its content like the toolbars of the original screens. */
export function WorkFilterSelect({ label, value, options, onChange, withAll = true, className }: { label: string; value: string; options: string[]; onChange: (v: string) => void; withAll?: boolean; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-auto min-w-36 shrink-0 gap-1.5 [&>span:last-of-type]:font-semibold", className)} aria-label={label}>
        <span className="text-muted-foreground">{label}:</span><SelectValue />
      </SelectTrigger>
      <SelectContent>
        {withAll && <SelectItem value={WORK_ALL}>Tất cả</SelectItem>}
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/** Segmented tab bar (reference `do-seg`): bordered 36px group, active tab filled with the primary colour; `count` adds the small mono chip (`.c`). */
export function WorkTabBar({ tabs, value, onChange, label = "Nhóm số liệu" }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange?: (id: string) => void; label?: string }) {
  return (
    <Tabs value={value} onValueChange={onChange} className="min-w-0 max-w-full gap-0">
      <TabsList aria-label={label}>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="group/tab border-r bg-card px-[13px] font-semibold last:border-r-0 hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary">
            {t.label}
            {t.count !== undefined && <span className="rounded-[9px] bg-muted px-1.5 font-mono text-caption font-normal text-muted-foreground group-data-[state=active]/tab:bg-white/25 group-data-[state=active]/tab:text-white">{t.count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Empty panels keep aria-controls valid; the page renders the real content below the bar. */}
      {tabs.map((t) => <TabsContent key={t.id} value={t.id} forceMount hidden />)}
    </Tabs>
  )
}

const pillTone = {
  xam: "border-border-strong bg-muted text-muted-foreground",
  son: "border-[color-mix(in_srgb,var(--destructive)_28%,var(--card))] bg-[color-mix(in_srgb,var(--destructive)_9%,var(--card))] text-destructive",
  hophach: "border-[color-mix(in_srgb,var(--warning)_28%,var(--card))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--card))] text-warning",
  xanh: "border-[color-mix(in_srgb,var(--success)_28%,var(--card))] bg-[color-mix(in_srgb,var(--success)_10%,var(--card))] text-success",
} as const
/** Soft pill of the reference (`do-pill nhat`): grey / red / amber / teal; `small` is the in-table size (11.5px, 1px 8px). */
export function WorkPill({ tone = "xam", small, className, ...props }: React.ComponentProps<"span"> & { tone?: keyof typeof pillTone; small?: boolean }) {
  return <span className={cn("inline-flex max-w-full items-center rounded-full border", small ? "gap-1 px-2 py-px text-label leading-normal font-medium whitespace-nowrap" : "gap-1.5 px-[11px] py-[3px] text-small leading-[1.4]", pillTone[tone], className)} {...props} />
}

/** dd/MM/yyyy (optionally followed by a time) to a local Date at midnight, or undefined. */
export function parseVnDate(s: string | undefined): Date | undefined {
  const m = s?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : undefined
}

/** True when the date lies inside the (possibly open-ended) range; no range means everything matches. */
export function inDateRange(d: Date | undefined, range: DateRange | undefined): boolean {
  if (!range?.from) return true
  if (!d) return false
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime()
  const toD = range.to ?? range.from
  const to = new Date(toD.getFullYear(), toD.getMonth(), toD.getDate()).getTime()
  return t >= from && t <= to
}

export const includesText = (haystack: (string | number | undefined)[], q: string) => {
  const n = q.trim().toLowerCase()
  return !n || haystack.some((h) => String(h ?? "").toLowerCase().includes(n))
}

export async function copyText(text: string) {
  try { await navigator.clipboard?.writeText(text) } catch { /* clipboard may be unavailable */ }
}

/** Toolbar filter "Đơn vị: **Tất cả** ▾" (reference `dtb-fo` + borderless `do-sel-o`): boxed field with a fixed width. */
export function WorkFilterField({ label, value, options, onChange, withAll = true, width = 210, className }: { label: string; value: string; options: string[]; onChange: (v: string) => void; withAll?: boolean; width?: number; className?: string }) {
  return (
    <FilterField label={label} style={{ width }} className={cn("max-[900px]:hidden", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="h-[34px] coarse:h-[42px] min-w-0 flex-1 border-0 bg-transparent pr-1 pl-1.5 text-control font-bold shadow-none hover:border-0 focus-visible:shadow-none data-[state=open]:shadow-none [&>span:not([data-slot])]:flex-1"><SelectValue /></SelectTrigger>
        <SelectContent>
          {withAll && <SelectItem value={WORK_ALL}>Tất cả</SelectItem>}
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </FilterField>
  )
}

/** Initials for an avatar chip. */
export const workInitials = (name?: string) => (name ? name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() : "–")

/** Round initials chip of the list screens (reference `dtb-avatar`: 27px, accent-soft fill, accent-line border). */
export function WorkAvatar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span aria-hidden className={cn("inline-grid size-[27px] flex-none place-items-center rounded-full border border-border bg-accent text-tiny leading-none font-bold text-primary uppercase select-none dark:border-border", className)}>{children}</span>
}
