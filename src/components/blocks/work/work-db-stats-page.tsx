import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { WorkLogDetailSheet } from "./work-log-detail-sheet"
import type { WorkStatBar } from "./work-usage-stats-page"
import { WORK_ALL, WorkFilterField, WorkPill, WorkTabBar, includesText, usePaged, useSort, type SortState } from "./work-shared"

export interface WorkDbKpi { id: string; label: string; value: string; hint: string }
export interface WorkDbIssue { id: string; title: string; severity: "info" | "warning" | "critical"; detail?: string; /** Short code shown before the title (e.g. "L05"). */ code?: string }
export interface WorkDbCapacityRow {
  id: string; name: string; docs: number; dataKb: number; indexKb: number
  /** Database the collection belongs to. */
  db?: string; /** Average document size in bytes. */ avgDocBytes?: number; /** Allocated storage in KB. */ allocatedKb?: number; indexCount?: number; freeKb?: number; growth7Kb?: number; growth30Kb?: number
}
export interface WorkDbOpRate { label: string; perSec: number }
export interface WorkDbIndex { id: string; collection: string; name: string; keys: string; sizeKb: number; accesses: number; db?: string; /** Badges such as Unique, Partial, TTL. */ props?: string[]; /** Date since which accesses are counted. */ since?: string }
export interface WorkDbSlowQuery { id: string; time: string; collection: string; op: string; durationMs: number; examined: number; returned: number; plan: "COLLSCAN" | "IXSCAN"; query: string; db?: string; /** Number of occurrences (default 1). */ count?: number }
export interface WorkDbRunningOp { id: string; op: string; namespace: string; secs: number; client: string; plan?: string; app?: string }
export interface WorkDbTopCollection { id: string; name: string; db?: string; reads: number; writes: number; readMs: number; writeMs: number }

export const workDbTabs = [
  { id: "overview", label: "Tổng quan" }, { id: "size", label: "Dung lượng" }, { id: "queries", label: "Truy xuất" }, { id: "index", label: "Index" },
  { id: "slow", label: "Query chậm" }, { id: "running", label: "Đang chạy" }, { id: "issues", label: "Vấn đề" },
]

export interface WorkDbStatsPageProps {
  tabs?: { id: string; label: string }[]
  activeTab?: string
  onTabChange?: (id: string) => void
  chips: string[]
  onRefresh?: () => void
  kpis: WorkDbKpi[]
  throughput: number[]
  throughputMax?: string
  collections: WorkStatBar[]
  formatSize?: (n: number) => string
  issues: WorkDbIssue[]
  capacity?: WorkDbCapacityRow[]
  opRates?: WorkDbOpRate[]
  indexes?: WorkDbIndex[]
  slowQueries?: WorkDbSlowQuery[]
  running?: WorkDbRunningOp[]
  /** Average latency series for the throughput tab. */
  latency?: number[]
  /** 7 x 24 heat grid for the throughput tab. */
  heat?: number[][]
  /** Most accessed collections (throughput tab). */
  topCollections?: WorkDbTopCollection[]
  onViewIssues?: () => void
  onViewQueries?: () => void
  className?: string
}

const sevPill = { info: { tone: "xam", label: "Thông tin" }, warning: { tone: "hophach", label: "Vừa" }, critical: { tone: "son", label: "Nặng" } } as const
const sevLabel = { info: "thông tin", warning: "cảnh báo", critical: "nghiêm trọng" } as const
const defaultSize = (n: number) => (n >= 1024 ? `${(n / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.round(n)} KB`)
const fmtN = (n: number) => n.toLocaleString("vi-VN")
const fmtBytes = (b: number) => (b >= 1024 ? `${(b / 1024).toFixed(2).replace(".", ",").replace(/,?0+$/, "")} KB` : `${Math.round(b)} B`)
const softBorder = "border-[color-mix(in_srgb,var(--border)_58%,var(--card))]"

/** Block of the reference (`csdl-khoi`). `flush` removes the padding for blocks that hold a table. */
function Block({ title, note, aside, flush, className, children }: { title?: React.ReactNode; note?: React.ReactNode; aside?: React.ReactNode; flush?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-lg border bg-card shadow-sm", flush ? "overflow-hidden" : "px-3.5 py-3", className)}>
      {title !== undefined && (
        <div className={cn("mb-2.5 flex flex-wrap items-center justify-between gap-2", flush && "px-3.5 pt-3")}>
          <h5 className="m-0 text-sm leading-[1.2] font-bold text-foreground">{title}{note !== undefined && <small className="ml-1.5 text-xs font-normal text-subtle-foreground">{note}</small>}</h5>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

const linkBtn = "cursor-pointer border-0 bg-transparent p-0 text-small text-primary hover:underline"
const csvBtn = "inline-flex h-6 cursor-pointer items-center rounded-full border border-transparent bg-transparent px-[9px] text-label font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"

function Seg({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-9 max-w-full overflow-hidden rounded-md border">
      {options.map((o) => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={cn("inline-flex cursor-pointer items-center border-0 border-r px-[13px] text-control font-semibold whitespace-nowrap outline-none last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary", value === o.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground")}>{o.label}</button>)}
    </div>
  )
}

/** Sortable header cell: chevrons on hover, active arrow in primary. */
function SortLabel({ label, k, sort, onToggle, right }: { label: string; k: string; sort?: SortState; onToggle: (k: string) => void; right?: boolean }) {
  const active = sort?.key === k
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
  return (
    <button type="button" aria-label={`Sắp xếp theo ${label}`} onClick={() => onToggle(k)} className={cn("group/sort inline-flex cursor-pointer items-center gap-[5px] border-0 bg-transparent p-0 font-[inherit] tracking-[inherit] text-inherit uppercase outline-none focus-visible:shadow-focus hover:text-muted-foreground", right && "flex-row-reverse", active && "text-primary hover:text-primary")}>
      {label}<Icon aria-hidden className={cn("size-[13px] flex-none transition-opacity", active ? "opacity-100" : "opacity-0 group-hover/sort:opacity-50")} />
    </button>
  )
}

/** Thin 100x24-style line/area chart with `preserveAspectRatio="none"` like the reference `csdl-bd`. */
function Trend({ values, label, height, area, className }: { values: number[]; label: string; height: number; area?: boolean; className?: string }) {
  const W = 600, H = 100
  const max = Math.max(1, ...values)
  const pt = (v: number, i: number) => `${((i * W) / Math.max(1, values.length - 1)).toFixed(1)} ${(H - 2 - (v / max) * (H - 6)).toFixed(1)}`
  const d = values.map((v, i) => `${i ? "L" : "M"}${pt(v, i)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} style={{ height }} className={cn("block w-full", className)}>
      {[25, 50, 75].map((y) => <line key={y} x1="0" x2={W} y1={y} y2={y} className="stroke-[color-mix(in_srgb,var(--border)_58%,var(--card))]" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />)}
      {area && <path d={`${d} L${W} ${H} L0 ${H} Z`} className="fill-primary opacity-[.18]" />}
      <path d={d} fill="none" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="stroke-primary" />
    </svg>
  )
}

function Heat({ rows }: { rows: number[][] }) {
  const max = Math.max(1, ...rows.flat())
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
  return (
    <div role="img" aria-label="Giờ cao điểm theo thứ và giờ">
      <div className="grid items-center gap-0.5" style={{ gridTemplateColumns: "28px repeat(24, 1fr)" }}>
        <span />
        {Array.from({ length: 24 }, (_, h) => <span key={h} className="text-tiny whitespace-nowrap text-subtle-foreground">{h % 3 === 0 ? h : ""}</span>)}
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <span className="text-tiny text-subtle-foreground">{days[i]}</span>
            {r.map((v, h) => <span key={h} title={`${days[i]} ${h}h: ${v}`} className="block h-3.5 rounded-sm" style={{ background: v <= 0 ? "var(--muted)" : `color-mix(in srgb, var(--primary) ${Math.round((0.22 + 0.78 * (v / max)) * 100)}%, transparent)` }} />)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/** Database statistics: seven tabs (overview, capacity, throughput, indexes, slow queries, running operations, issues). */
export function WorkDbStatsPage({ tabs = workDbTabs, activeTab, onTabChange, chips, onRefresh, kpis, throughput, throughputMax, collections, formatSize = defaultSize, issues, capacity = [], opRates = [], indexes = [], slowQueries = [], running: runningProp = [], latency, heat, topCollections = [], onViewIssues, onViewQueries, className }: WorkDbStatsPageProps) {
  const [innerTab, setInnerTab] = React.useState(tabs[0]?.id ?? "overview")
  const tab = activeTab ?? innerTab
  const go = (id: string) => { setInnerTab(id); onTabChange?.(id) }
  const [db, setDb] = React.useState(WORK_ALL)
  const dbs = React.useMemo(() => [...new Set([...capacity.map((r) => r.db), ...indexes.map((r) => r.db), ...slowQueries.map((r) => r.db)].filter((d): d is string => !!d))].sort(), [capacity, indexes, slowQueries])
  const filterBar = (tab === "size" || tab === "index" || tab === "slow") && (
    <div className="rounded-lg border bg-card px-2.5 py-[9px] shadow-sm"><div className="flex items-center gap-2"><WorkFilterField label="CSDL" width={200} value={db} options={dbs} onChange={setDb} className="max-[900px]:flex" /></div></div>
  )
  const sev = (["critical", "warning", "info"] as const).filter((s) => issues.some((i) => i.severity === s))
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3 overflow-auto", className)}>
      <div className="flex flex-none flex-wrap items-center justify-between gap-2">
        <WorkTabBar tabs={tabs} value={tab} onChange={go} />
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => <span key={c} className="inline-flex h-[26px] items-center gap-1 rounded-full border bg-card px-2.5 text-xs whitespace-nowrap text-muted-foreground">{c}</span>)}
          <button type="button" aria-label="Tải lại" title="Tải lại" onClick={() => { onRefresh?.(); toast.success("Đã làm mới số liệu CSDL") }} className="inline-flex size-[30px] cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&_svg]:size-4"><RefreshCw /></button>
        </div>
      </div>
      {filterBar}
      {tab === "overview" && (<>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {kpis.map((k) => (
            <div key={k.id} className="flex min-w-0 flex-col gap-0.5 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm"><span className="text-xs text-muted-foreground">{k.label}</span><span className="text-heading font-bold text-foreground tabular-nums">{k.value}</span><span className="text-xs text-subtle-foreground">{k.hint}</span></div>
          ))}
        </div>
        <Block title="Lượt thao tác 24 giờ" note="lượt/giây, bước 5 phút" aside={<button type="button" onClick={() => { go("queries"); onViewQueries?.() }} className={linkBtn}>Xem tab Truy xuất →</button>}>
          <div className="relative flex min-w-0 flex-col" style={{ height: 110 }}>
            <Trend values={throughput} label="Biểu đồ lượt thao tác 24 giờ" height={96} />
            {throughputMax && <div className="mt-1 flex justify-between text-label text-subtle-foreground"><span>tối đa {throughputMax}</span></div>}
          </div>
        </Block>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3 max-[900px]:grid-cols-1">
          <Block title="Collection lớn nhất" note="phần nhạt là index"><SizeBars items={collections} format={formatSize} /></Block>
          <Block title="Vấn đề nặng nhất" aside={<span className="inline-flex flex-wrap gap-1">{sev.map((s) => <WorkPill key={s} tone={sevPill[s].tone}>{issues.filter((i) => i.severity === s).length} {sevPill[s].label.toLowerCase() === "vừa" ? "vừa" : sevLabel[s]}</WorkPill>)}</span>}>
            {issues.length === 0 ? <p className="my-2 text-small text-muted-foreground">Không có vấn đề nào.</p> : issues.slice(0, 2).map((i, n) => (
              <article key={i.id} className={cn("py-2.5", n > 0 && cn("border-t", softBorder))}>
                <p className="m-0 text-small text-muted-foreground">{i.title}</p>
              </article>
            ))}
            <button type="button" onClick={() => { go("issues"); onViewIssues?.() }} className={cn(linkBtn, "mt-1")}>Xem tất cả {issues.length} vấn đề →</button>
          </Block>
        </div>
      </>)}
      {tab === "size" && <SizeTab rows={capacity} fmt={formatSize} db={db} />}
      {tab === "queries" && <QueriesTab throughput={throughput} throughputMax={throughputMax} opRates={opRates} latency={latency} heat={heat} top={topCollections} />}
      {tab === "index" && <IndexTab rows={indexes} fmt={formatSize} db={db} />}
      {tab === "slow" && <SlowTab rows={slowQueries} db={db} />}
      {tab === "running" && <RunningTab initial={runningProp} />}
      {tab === "issues" && <IssuesTab rows={issues} onGo={() => go("slow")} />}
    </div>
  )
}

/** Collection bars (reference `csdl-thanh`): data in primary, index in the light primary tone. */
function SizeBars({ items, format }: { items: WorkStatBar[]; format: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul aria-label="Biểu đồ cột" className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[150px_minmax(0,1fr)_auto] items-center gap-2 text-body">
          <span className="truncate text-foreground" title={i.label}>{i.label}</span>
          <span className="flex h-2.5 overflow-hidden rounded-[3px] bg-[color-mix(in_srgb,var(--border)_58%,var(--card))]"><span className="bg-primary" style={{ width: `${Math.max(0.5, ((i.value * 0.46) / max) * 100)}%` }} /><span className="bg-[color-mix(in_srgb,var(--primary)_22%,var(--card))]" style={{ width: `${Math.max(0.5, ((i.value * 0.54) / max) * 100)}%` }} /></span>
          <span className="whitespace-nowrap text-muted-foreground tabular-nums">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  )
}

function SizeTab({ rows, fmt, db }: { rows: WorkDbCapacityRow[]; fmt: (n: number) => string; db: string }) {
  const filtered = React.useMemo(() => rows.filter((r) => db === WORK_ALL || r.db === db), [rows, db])
  const { sorted, sort, toggle } = useSort(filtered, { name: (r) => r.name, docs: (r) => r.docs, data: (r) => r.dataKb, index: (r) => r.indexKb, total: (r) => r.dataKb + r.indexKb }, { key: "total", dir: "desc" })
  const paged = usePaged(sorted, 50)
  const total = rows.reduce((s, r) => s + r.dataKb + r.indexKb, 0)
  const h = (label: string, k: string, right = true) => <SortLabel label={label} k={k} sort={sort} onToggle={toggle} right={right && false} />
  const num = "tabular-nums"
  const columns: Column<WorkDbCapacityRow>[] = [
    { key: "name", header: h("Collection", "name"), width: 240, cell: (r) => <><div className="font-semibold text-foreground">{r.name}</div><div className="text-xs text-subtle-foreground">{r.db ?? "—"}</div></> },
    { key: "docs", header: h("Số document", "docs"), width: 130, align: "right", cell: (r) => <span className={num}>{fmtN(r.docs)}</span> },
    { key: "avg", header: "TB / doc", width: 110, align: "right", cell: (r) => <span className={num}>{r.avgDocBytes !== undefined ? fmtBytes(r.avgDocBytes) : "—"}</span> },
    { key: "data", header: h("Dữ liệu", "data"), width: 120, align: "right", cell: (r) => <span className={num}>{fmt(r.dataKb)}</span> },
    { key: "alloc", header: "Đã cấp", width: 120, align: "right", cell: (r) => <span className={num}>{r.allocatedKb !== undefined ? fmt(r.allocatedKb) : "—"}</span> },
    { key: "index", header: h("Index", "index"), width: 130, align: "right", cell: (r) => <><span className={num}>{fmt(r.indexKb)}</span>{r.indexCount !== undefined && <span className="text-xs text-subtle-foreground"> · {r.indexCount}</span>}</> },
    { key: "free", header: "Trống", width: 110, align: "right", cell: (r) => <span className={num}>{r.freeKb !== undefined ? fmt(r.freeKb) : "—"}</span> },
    { key: "g7", header: "Tăng 7 ngày", width: 120, align: "right", cell: (r) => <span className={cn(num, r.growth7Kb ? "text-warning" : undefined)}>{r.growth7Kb === undefined ? "—" : r.growth7Kb ? `+${fmt(r.growth7Kb)}` : "0 B"}</span> },
    { key: "g30", header: "Tăng 30 ngày", width: 120, align: "right", cell: (r) => <span className={num}>{r.growth30Kb ? `+${fmt(r.growth30Kb)}` : "—"}</span> },
    { key: "total", header: h("Tổng", "total"), width: 150, align: "right", cell: (r) => <><span className={num}><b>{fmt(r.dataKb + r.indexKb)}</b></span> <span className="text-xs text-subtle-foreground">{(((r.dataKb + r.indexKb) / Math.max(1, total)) * 100).toFixed(1).replace(".", ",")}%</span></> },
  ]
  return (
    <Block flush title="Dung lượng theo collection" note={`tổng ${fmt(total)}`} aside={<button type="button" className={csvBtn} onClick={() => toast.info("Đã xuất CSV")}>Xuất CSV</button>}>
      <DataTable label="Dung lượng theo collection" density="compact" minWidthClass="table-fixed min-w-[1350px]" className="min-h-[160px] max-h-[640px] rounded-lg" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có collection" />
    </Block>
  )
}

const RANGES = [{ id: "24h", label: "24 giờ" }, { id: "7d", label: "7 ngày" }, { id: "30d", label: "30 ngày" }, { id: "90d", label: "90 ngày" }]

function QueriesTab({ throughput, throughputMax, opRates, latency, heat, top }: { throughput: number[]; throughputMax?: string; opRates: WorkDbOpRate[]; latency?: number[]; heat?: number[][]; top: WorkDbTopCollection[] }) {
  const [range, setRange] = React.useState("24h")
  const tone = ["bg-primary", "bg-[color-mix(in_srgb,var(--primary)_22%,var(--card))]", "bg-success", "bg-info", "bg-destructive", "bg-border-strong"]
  const paged = usePaged(top, 10)
  const cols: Column<WorkDbTopCollection>[] = [
    { key: "n", header: "Collection", cell: (r) => <><div className="font-semibold text-foreground">{r.name}</div><div className="text-xs text-subtle-foreground">{r.db ?? "—"}</div></> },
    { key: "r", header: "Lượt đọc", width: 130, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.reads)}</span> },
    { key: "w", header: "Lượt ghi", width: 130, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.writes)}</span> },
    { key: "rm", header: "Trễ đọc TB", width: 120, align: "right", cell: (r) => <span className="tabular-nums">{r.readMs.toFixed(2).replace(".", ",")} ms</span> },
    { key: "wm", header: "Trễ ghi TB", width: 120, align: "right", cell: (r) => <span className="tabular-nums">{r.writeMs.toFixed(2).replace(".", ",")} ms</span> },
  ]
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2"><Seg label="Khoảng thời gian" options={RANGES} value={range} onChange={setRange} /><span className="text-xs text-subtle-foreground">Bước 5 phút</span></div>
      <Block title="Lượt thao tác" note="lượt/giây, xếp chồng theo loại">
        <Trend values={throughput} label="Biểu đồ chi tiết lượt thao tác" height={180} area />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-label text-subtle-foreground"><span>{throughputMax && `tối đa ${throughputMax}`}</span>
          <span className="flex flex-wrap gap-3">{opRates.map((o, i) => <span key={o.label} className="inline-flex items-center gap-1"><i className={cn("size-2 rounded-[2px]", tone[i % tone.length])} />{o.label}</span>)}</span></div>
      </Block>
      <div className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
        <Block title="Độ trễ trung bình" note="ms">{latency ? <Trend values={latency} label="Biểu đồ độ trễ trung bình" height={120} /> : <p className="my-6 text-center text-small text-subtle-foreground">Chưa có dữ liệu.</p>}</Block>
        <Block title="Giờ cao điểm" note="thứ × giờ">{heat ? <Heat rows={heat} /> : <p className="my-6 text-center text-small text-subtle-foreground">Chưa có dữ liệu.</p>}</Block>
      </div>
      <Block flush title="Collection được truy xuất nhiều nhất" note="trong khoảng đã chọn">
        <DataTable label="Collection được truy xuất nhiều nhất" density="compact" minWidthClass="table-fixed min-w-[640px]" className="rounded-lg" columns={cols} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50]} emptyTitle="Chưa có dữ liệu truy xuất" />
      </Block>
    </>
  )
}

function IndexTab({ rows, fmt, db }: { rows: WorkDbIndex[]; fmt: (n: number) => string; db: string }) {
  const [mode, setMode] = React.useState("all")
  const [q] = React.useState("")
  const filtered = React.useMemo(() => rows.filter((r) => (db === WORK_ALL || r.db === db) && (mode !== "unused" || r.accesses < 10) && includesText([r.collection, r.name, r.keys], q)), [rows, mode, q, db])
  const { sorted, sort, toggle } = useSort(filtered, { collection: (r) => r.collection, size: (r) => r.sizeKb, accesses: (r) => r.accesses }, mode === "big" ? { key: "size", dir: "desc" } : undefined)
  const paged = usePaged(sorted, 50)
  const columns: Column<WorkDbIndex>[] = [
    { key: "collection", header: <SortLabel label="Collection" k="collection" sort={sort} onToggle={toggle} />, width: 200, cell: (r) => <><div className="font-semibold text-foreground">{r.collection}</div><div className="text-xs text-subtle-foreground">{r.db ?? "—"}</div></> },
    { key: "name", header: "Index", cell: (r) => <><code className="font-mono text-xs">{r.name}</code><div className="font-mono text-xs break-words text-subtle-foreground">{r.keys}</div></> },
    { key: "props", header: "Thuộc tính", width: 220, cell: (r) => <span className="inline-flex flex-wrap gap-1">{(r.props ?? (r.accesses < 10 ? ["Ít dùng"] : [])).map((p, i) => <WorkPill key={p} small tone={i === 0 && p !== "Partial" && p !== "Ít dùng" ? "xam" : "xam"} className={p === "Unique" ? "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent text-primary" : undefined}>{p}</WorkPill>)}</span> },
    { key: "size", header: <SortLabel label="Cỡ" k="size" sort={sort} onToggle={toggle} />, width: 110, align: "right", cell: (r) => <span className="tabular-nums">{fmt(r.sizeKb)}</span> },
    { key: "accesses", header: <SortLabel label="Lượt dùng" k="accesses" sort={sort} onToggle={toggle} />, width: 140, align: "right", cell: (r) => <><span className="tabular-nums">{fmtN(r.accesses)}</span>{r.since && <div className="text-xs text-subtle-foreground">từ {r.since}</div>}</> },
  ]
  return (
    <Block flush title="Index" note={`${rows.length} index · 0 trùng tiền tố`} aside={<div className="flex flex-wrap items-center gap-1.5"><Seg label="Lọc index" value={mode} onChange={(v) => { setMode(v); paged.reset() }} options={[{ id: "all", label: "Tất cả" }, { id: "unused", label: "Ít dùng" }, { id: "big", label: "Lớn nhất" }]} /><button type="button" className={csvBtn} onClick={() => toast.info("Đã xuất CSV")}>Xuất CSV</button></div>}>
      <DataTable label="Index" density="compact" minWidthClass="table-fixed min-w-[930px]" className="min-h-[160px] max-h-[640px] rounded-lg" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có index phù hợp" />
    </Block>
  )
}

function SlowTab({ rows, db }: { rows: WorkDbSlowQuery[]; db: string }) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [collscan, setCollscan] = React.useState(false)
  const [view, setView] = React.useState("shape")
  const [range, setRange] = React.useState("7d")
  const filtered = React.useMemo(() => rows.filter((r) => (!collscan || r.plan === "COLLSCAN") && (db === WORK_ALL || r.db === db)), [rows, collscan, db])
  const { sorted, sort, toggle } = useSort(filtered, { total: (r) => r.durationMs * (r.count ?? 1), count: (r) => r.count ?? 1, avg: (r) => r.durationMs }, { key: "total", dir: "desc" })
  const paged = usePaged(sorted, 25)
  const current = rows.find((r) => r.id === openId)
  const columns: Column<WorkDbSlowQuery>[] = [
    { key: "collection", header: "Collection", width: 200, cell: (r) => <><div className="font-semibold text-foreground">{r.collection}</div><div className="text-xs text-subtle-foreground">{r.op} · {r.time}</div></> },
    { key: "plan", header: "Plan", width: 200, cell: (r) => <WorkPill small tone={r.plan === "COLLSCAN" ? "son" : "xam"}>{r.plan}</WorkPill> },
    { key: "shape", header: "Hình dạng (đã che giá trị)", cell: (r) => <code className="block max-h-[72px] overflow-hidden font-mono text-label leading-normal break-words text-muted-foreground">{r.query}</code> },
    { key: "count", header: <SortLabel label="Số lần" k="count" sort={sort} onToggle={toggle} />, width: 90, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.count ?? 1)}</span> },
    { key: "total", header: <SortLabel label="Tổng" k="total" sort={sort} onToggle={toggle} />, width: 110, align: "right", cell: (r) => <b className="tabular-nums">{fmtN(r.durationMs * (r.count ?? 1))} ms</b> },
    { key: "avg", header: <SortLabel label="TB / lần" k="avg" sort={sort} onToggle={toggle} />, width: 130, align: "right", cell: (r) => <><span className="tabular-nums">{fmtN(r.durationMs)} ms</span></> },
    { key: "ratio", header: "Quét / trả", width: 110, align: "right", cell: (r) => <span className="tabular-nums">{r.returned > 0 ? fmtN(Math.round(r.examined / r.returned)) : "—"}</span> },
  ]
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Seg label="Kiểu nhóm" value={view} onChange={setView} options={[{ id: "shape", label: "Theo hình dạng" }, { id: "endpoint", label: "Theo endpoint" }]} />
        <div className="flex flex-wrap items-center gap-2.5">
          <Seg label="Khoảng thời gian" value={range} onChange={setRange} options={[{ id: "today", label: "Hôm nay" }, { id: "7d", label: "7 ngày" }, { id: "30d", label: "30 ngày" }]} />
          <label className="inline-flex cursor-pointer items-center gap-2 text-body font-semibold text-foreground">Chỉ COLLSCAN<Switch aria-label="Chỉ COLLSCAN" checked={collscan} onCheckedChange={(v) => { setCollscan(v); paged.reset() }} /></label>
          <span className="inline-flex h-[26px] items-center rounded-full border bg-card px-2.5 text-xs whitespace-nowrap text-muted-foreground">slowms = 100 ms</span>
        </div>
      </div>
      <Block flush>
        <DataTable label="Query chậm" density="compact" minWidthClass="table-fixed min-w-[1000px]" className="min-h-[160px] max-h-[640px] rounded-lg" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} onRowClick={(r) => setOpenId(r.id)} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có query chậm" emptyDescription="Chưa ghi nhận truy vấn vượt ngưỡng." />
      </Block>
      <WorkLogDetailSheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current ? `${current.op} · ${current.collection}` : ""} description={current?.time} raw={current?.query}
        fields={current ? [{ label: "Thời gian", value: `${current.durationMs} ms` }, { label: "Đã quét", value: fmtN(current.examined) }, { label: "Trả về", value: fmtN(current.returned) }, { label: "Kế hoạch", value: current.plan }] : []} />
    </>
  )
}

function RunningTab({ initial }: { initial: WorkDbRunningOp[] }) {
  const [rows, setRows] = React.useState(initial)
  const [target, setTarget] = React.useState<WorkDbRunningOp | null>(null)
  const [auto, setAuto] = React.useState(false)
  const columns: Column<WorkDbRunningOp>[] = [
    { key: "secs", header: "Đã chạy", width: 90, align: "right", cell: (r) => <span className={cn("font-semibold tabular-nums", r.secs > 30 && "text-warning")}>{r.secs} s</span> },
    { key: "ns", header: "Collection", width: 220, cell: (r) => <><div className="text-body font-semibold text-foreground">{r.namespace}</div><div className="text-xs text-subtle-foreground">{r.op} · {r.id}</div></> },
    { key: "plan", header: "Plan", width: 160, cell: (r) => r.plan ? <WorkPill small>{r.plan}</WorkPill> : null },
    { key: "cmd", header: "Lệnh (đã che giá trị)", cell: (r) => <code className="block font-mono text-label leading-normal break-words text-muted-foreground">{`{ "${r.op}" : "${r.namespace.split(".").pop()}" }`}</code> },
    { key: "client", header: "Ứng dụng", width: 160, cell: (r) => <><div>{r.app ?? "—"}</div><div className="text-xs text-subtle-foreground">{r.client}</div></> },
    { key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 96, cell: (r) => <Button size="sm" variant="outline" aria-label={`Dừng ${r.id}`} onClick={() => setTarget(r)}>Dừng</Button> },
  ]
  return (
    <>
      <Block flush title="Lệnh đang chạy" note={`${rows.length} lệnh · đã che giá trị`} aside={<label className="inline-flex cursor-pointer items-center gap-2 text-body font-semibold text-foreground">Tự làm mới 10 giây<Switch aria-label="Tự làm mới 10 giây" checked={auto} onCheckedChange={setAuto} /></label>}>
        <DataTable label="Lệnh đang chạy" density="compact" minWidthClass="table-fixed min-w-[900px]" className="rounded-lg [&>div:last-child]:hidden" columns={columns} rows={rows} getRowId={(r) => r.id} page={1} pageSize={50} total={rows.length} emptyTitle="Không có thao tác đang chạy" emptyDescription="Hệ thống đang rảnh." />
      </Block>
      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dừng thao tác {target?.id}?</DialogTitle><DialogDescription>Thao tác {target?.op} trên {target?.namespace} sẽ bị hủy ngay lập tức.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setTarget(null)}>Hủy</Button><Button variant="destructive" onClick={() => { if (target) { setRows((p) => p.filter((x) => x.id !== target.id)); toast.success(`Đã dừng ${target.id}`) } setTarget(null) }}>Dừng thao tác</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function IssuesTab({ rows, onGo }: { rows: WorkDbIssue[]; onGo?: () => void }) {
  const groups = (["critical", "warning", "info"] as const).map((s) => ({ s, items: rows.filter((r) => r.severity === s) })).filter((g) => g.items.length > 0)
  if (groups.length === 0) return <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">Không có vấn đề nào.</p>
  const gl = { critical: "Nghiêm trọng", warning: "Vừa", info: "Thông tin" } as const
  return (
    <>
      {groups.map(({ s, items }) => (
        <Block key={s} title={<>{gl[s]}<small className="ml-1.5 text-xs font-normal text-subtle-foreground">{items.length} vấn đề</small></>}>
          {items.map((i, n) => (
            <article key={i.id} className={cn("py-2.5", n > 0 && cn("border-t", softBorder))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-accent px-1.5 py-[3px] font-mono text-caption leading-none font-semibold text-primary">{i.code ?? `L${String(n + 1).padStart(2, "0")}`}</span>
                <b className="min-w-0 flex-1 text-body text-foreground">{i.title}</b>
                <WorkPill tone={sevPill[s].tone}>{sevPill[s].label}</WorkPill>
              </div>
              {i.detail && <p className="mt-1.5 mb-0 text-small text-muted-foreground">{i.detail}</p>}
              {s !== "info" && <button type="button" onClick={onGo} className={cn(linkBtn, "mt-1")}>Xem số liệu →</button>}
            </article>
          ))}
        </Block>
      ))}
    </>
  )
}
