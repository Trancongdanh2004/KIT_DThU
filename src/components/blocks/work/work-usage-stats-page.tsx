"use client"

// @dthu/ui 0.2.0 · block-work
import * as React from "react"
import { CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, Download, RefreshCw, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu-extras"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { FilterButton } from "@/components/blocks/shell/page-chrome"
import { WORK_ALL, WorkFilterField, WorkPill, WorkTabBar, includesText, usePaged, useSort, workInitials } from "./work-shared"

export interface WorkStatKpi { id: string; label: string; value: string; hint: string; delta?: string; highlight?: boolean; /** Colour of the left accent when `highlight` (default primary). */ tone?: "primary" | "success" }
export interface WorkStatPoint { label: string; current: number; previous?: number }
export interface WorkStatBar { label: string; value: number }
export interface WorkStatFilter { id: string; label: string; value: string; options: string[] }
export interface WorkUsageFeature { id: string; name: string; module: string; uses: number; users: number; successRate: number; /** Technical code shown under the name (e.g. `tab.mo`). */ code?: string; /** Failed uses; defaults to the share implied by `successRate`. */ errors?: number; /** Change versus the previous period, e.g. "+12%" or "mới". */ delta?: string; /** Daily uses for the sparkline. */ trend?: number[] }
export interface WorkUsageUser { id: string; name: string; unit: string; role: string; sessions: number; events: number; lastSeen: string; /** Account name shown under the name. */ account?: string; /** Most used features (chips). */ topFeatures?: string[] }
export interface WorkUsageFlowStep { label: string; count: number; /** Technical code shown after the label. */ code?: string; /** Number of events at the step (defaults to `count`). */ events?: number; /** Median time to reach the next step, e.g. "410 ms". */ median?: string }
export interface WorkUsageStuck { id: string; step: string; waited: string }
export interface WorkUsageFlow { id: string; name: string; module: string; steps: WorkUsageFlowStep[]; /** Objects that have waited longest at a step. */ stuck?: WorkUsageStuck[]; /** Caption of the funnel, e.g. "đếm theo VanBanDi". */ caption?: string }
export interface WorkUsageRejected { id: string; action: string; code: string; result: string; reason: string; count: number }
export interface WorkUsageSlowApi { id: string; name: string; calls: number; p50: number; p95: number }
export interface WorkUsageExport { id: string; created: string; status: string; sessions: number }
export interface WorkUsageCollector { enabled: boolean; store: string; events: string; queue: string; dropped: number; rollup: string; mapping: string; unmatched: string[] }
export interface WorkUsageError { id: string; time: string; module: string; message: string; count: number; level: "error" | "warning" }
export interface WorkUsageTrainItem { id: string; question: string; intent: string; status: "approved" | "pending" | "rejected"; hits: number }

export const workUsageTabs: { id: string; label: string; count?: number }[] = [
  { id: "overview", label: "Tổng quan" }, { id: "features", label: "Tính năng" }, { id: "users", label: "Người dùng" },
  { id: "flows", label: "Quy trình" }, { id: "errors", label: "Lỗi" }, { id: "train", label: "Dữ liệu train" },
]

export interface WorkUsageStatsPageProps {
  tabs?: { id: string; label: string; count?: number }[]
  activeTab?: string
  onTabChange?: (id: string) => void
  filters: WorkStatFilter[]
  onFilterChange?: (id: string, value: string) => void
  onRefresh?: () => void
  online?: number
  /** Label of the reporting date shown next to the tabs. */
  asOf?: string
  kpis: WorkStatKpi[]
  series: WorkStatPoint[]
  modules: WorkStatBar[]
  sources: WorkStatBar[]
  /** 7 rows (T2..CN) x 24 hourly buckets. */
  heatmap?: number[][]
  features?: WorkUsageFeature[]
  users?: WorkUsageUser[]
  flows?: WorkUsageFlow[]
  errors?: WorkUsageError[]
  /** @deprecated The training tab is the export form of the reference; the review list is no longer rendered. */
  trainData?: WorkUsageTrainItem[]
  /** Actions rejected most often (errors tab, left table). */
  rejected?: WorkUsageRejected[]
  /** Slowest endpoints with p50 / p95 in ms (errors tab). */
  slowApis?: WorkUsageSlowApi[]
  /** Recent training-data exports (train tab). */
  exports?: WorkUsageExport[]
  /** Collector state (train tab). */
  collector?: WorkUsageCollector
  /** Fired by "Xuất JSONL" with the chosen options. */
  onExport?: (options: { from?: Date; to?: Date; source: string; minEvents: number; anonymize: boolean; dropUnit: boolean; writeOnly: boolean }) => void
  className?: string
}

const fmtN = (n: number) => n.toLocaleString("vi-VN")

/** Block of the reference (`tksd-khoi`): card with 12/14 padding and a baseline-aligned heading row. */
function Panel({ title, note, aside, flush, className, children, ...props }: { title?: React.ReactNode; note?: React.ReactNode; aside?: React.ReactNode; flush?: boolean } & Omit<React.ComponentProps<"section">, "title">) {
  return (
    <section className={cn("min-w-0 rounded-lg border bg-card shadow-sm", flush ? "overflow-hidden" : "px-3.5 py-3", className)} {...props}>
      {title !== undefined && (
        <div className={cn("mb-2.5 flex items-baseline justify-between gap-2", flush && "px-3.5 pt-3")}>
          <h5 className="m-0 text-sm leading-[1.2] font-bold text-foreground">{title}{note !== undefined && <> <small className="text-xs font-normal text-subtle-foreground">{note}</small></>}</h5>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

const mono = "font-mono text-label text-subtle-foreground"
const legend = "flex gap-3 text-meta text-muted-foreground"

/** Line chart of the reference (`bd-duong`): measured width, 220px high, five grid lines with integer ticks, dashed previous period. */
export function WorkLineChart({ data, className }: { data: WorkStatPoint[]; className?: string }) {
  const box = React.useRef<HTMLDivElement>(null)
  const [W, setW] = React.useState(0)
  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setW(el.clientWidth)
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const width = W || 600, H = 220, L = 40, R = 12, T = 12, B = 24
  const peak = Math.max(1, ...data.flatMap((d) => [d.current, d.previous ?? 0]))
  const top = peak <= 4 ? 4 : Math.ceil(peak / 4) * 4
  const n = data.length
  const x = (i: number) => L + (n <= 1 ? 0 : (i * (width - L - R)) / (n - 1))
  const y = (v: number) => H - B - (v / top) * (H - T - B)
  const path = (key: "current" | "previous") => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d[key] ?? 0).toFixed(1)}`).join(" ")
  const every = Math.max(1, Math.ceil(46 / Math.max(1, n <= 1 ? 46 : (width - L - R) / (n - 1))))
  return (
    <div ref={box} className={cn("relative w-full", className)}>
      <svg width={width} height={H} role="img" aria-label="Biểu đồ đường người dùng hoạt động theo ngày" className="block overflow-visible">
        {[0, 1, 2, 3, 4].map((t) => (
          <g key={t}>
            <line x1={L} x2={width - R} y1={y((top * t) / 4)} y2={y((top * t) / 4)} className="stroke-[color-mix(in_srgb,var(--border)_58%,var(--card))]" strokeWidth="1" />
            <text x={L - 6} y={y((top * t) / 4) + 4} textAnchor="end" className="fill-subtle-foreground text-caption tabular-nums">{Math.round((top * t) / 4)}</text>
          </g>
        ))}
        {data.map((d, i) => i % every === 0 && <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-subtle-foreground text-caption tabular-nums">{d.label}</text>)}
        {n > 0 && <path d={`${path("current")} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`} className="fill-primary opacity-[.08]" />}
        {data.some((d) => d.previous !== undefined) && <path d={path("previous")} fill="none" strokeDasharray="4 4" strokeWidth="1.5" className="stroke-subtle-foreground" />}
        <path d={path("current")} fill="none" strokeWidth="2" strokeLinejoin="round" className="stroke-primary" />
      </svg>
    </div>
  )
}

/** Horizontal bar list (reference `bd-cot`): label 38% | 8px track | value. */
export function WorkBarList({ items, format = fmtN, tone = "primary" }: { items: WorkStatBar[]; format?: (n: number) => string; tone?: "primary" | "success" }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul aria-label="Biểu đồ cột" className="m-0 list-none p-0">
      {items.map((i) => (
        <li key={i.label} title={`${i.label}: ${format(i.value)}`} className="grid grid-cols-[minmax(90px,38%)_1fr_auto] items-center gap-2.5 py-1 text-small">
          <span className="truncate text-foreground">{i.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted" role="presentation"><span className={cn("block h-full rounded-full transition-[width] duration-300", tone === "primary" ? "bg-primary" : "bg-success")} style={{ width: `${Math.max(1.5, (i.value / max) * 100)}%` }} /></span>
          <span className="min-w-12 text-right text-muted-foreground tabular-nums">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  )
}

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const heat = (v: number, max: number) => (v <= 0 ? "var(--muted)" : `color-mix(in srgb, var(--primary) ${Math.round((0.28 + 0.72 * (v / max)) * 100)}%, transparent)`)

function Heatmap({ rows }: { rows: number[][] }) {
  const max = Math.max(1, ...rows.flat())
  return (
    <div role="img" aria-label="Bản đồ nhiệt sự kiện theo giờ và thứ">
      <div className="grid items-center gap-0.5" style={{ gridTemplateColumns: "32px repeat(24, 1fr)" }}>
        <span />
        {Array.from({ length: 24 }, (_, h) => <span key={h} className="text-caption whitespace-nowrap text-subtle-foreground">{h % 3 === 0 ? `${h}h` : ""}</span>)}
        {rows.map((row, r) => (
          <React.Fragment key={r}>
            <span className="text-caption text-subtle-foreground">{DAYS[r]}</span>
            {row.map((v, h) => <span key={h} title={`${DAYS[r]} ${h}h: ${v}`} className="block h-[18px] cursor-default rounded-[3px] hover:outline-2 hover:-outline-offset-1 hover:outline-accent-foreground" style={{ background: heat(v, max) }} />)}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-caption text-subtle-foreground">
        Ít {[0, 0.56, 0.74, 0.88, 1].map((a) => <span key={a} className="h-2.5 w-3.5 rounded-sm" style={{ background: a === 0 ? "var(--muted)" : `color-mix(in srgb, var(--primary) ${a * 100}%, transparent)` }} />)} Nhiều
      </div>
    </div>
  )
}

const matchFilters = (filters: WorkStatFilter[], row: { unit?: string; role?: string; module?: string }) =>
  filters.every((f) => {
    if (f.value === WORK_ALL || f.value === "Tất cả") return true
    if (f.id === "unit" && row.unit !== undefined) return row.unit === f.value
    if (f.id === "role" && row.role !== undefined) return row.role === f.value
    if (f.id === "module" && row.module !== undefined) return row.module === f.value
    return true
  })

const jitter = (seed: string, n: number) => { let h = 7; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; return i === n - 1 || h % 5 === 0 ? 1 + (h % 6) : 0 }) }

/** 80x22 sparkline of the "Xu hướng" column (reference `tksd-spark`). */
function Spark({ values }: { values: number[] }) {
  const max = Math.max(1, ...values)
  const d = values.map((v, i) => `${i ? "L" : "M"}${((i / Math.max(1, values.length - 1)) * 78 + 1).toFixed(1)} ${(21 - (v / max) * 19).toFixed(1)}`).join(" ")
  return <svg width="80" height="22" viewBox="0 0 80 22" aria-hidden className="block"><path d={d} className="fill-none stroke-primary" strokeWidth="1.5" /></svg>
}

/** Table of the tabs (reference `dtb-density-compact`) inside a panel; the number of rows comes from the page size. */
const tableCls = "rounded-lg"
const nameCls = "font-semibold text-foreground"

function Pager({ page, pages, from, to, total, onPage }: { page: number; pages: number; from: number; to: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-1.5 border-t border-[color-mix(in_srgb,var(--border)_58%,var(--card))] pt-2 text-xs text-muted-foreground">
      <span className="mr-auto tabular-nums">{from}–{to} / {total}</span>
      <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 hover:bg-secondary disabled:cursor-default disabled:opacity-50"><ChevronLeft className="size-3.5" /></button>
      <span className="tabular-nums">{page}/{pages}</span>
      <button type="button" aria-label="Trang sau" disabled={page >= pages} onClick={() => onPage(page + 1)} className="inline-grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 hover:bg-secondary disabled:cursor-default disabled:opacity-50"><ChevronRight className="size-3.5" /></button>
    </div>
  )
}

function FilterSearch({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={cn("relative flex h-9 min-w-[160px] max-w-full items-center gap-[9px] rounded-md border bg-card px-[11px] transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none focus-within:border-primary focus-within:shadow-focus-soft", className)}>
      <Search aria-hidden className="size-4 flex-none text-subtle-foreground" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-auto min-w-[60px] flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none placeholder:text-subtle-foreground" />
    </div>
  )
}

function FeaturesTab({ rows }: { rows: WorkUsageFeature[] }) {
  const [q, setQ] = React.useState("")
  const filtered = React.useMemo(() => rows.filter((r) => includesText([r.name, r.module, r.code], q)), [rows, q])
  const { sorted } = useSort(filtered, { uses: (r) => r.uses }, { key: "uses", dir: "desc" })
  const paged = usePaged(sorted, 25)
  const rare = React.useMemo(() => [...rows].filter((r) => r.users < 3).sort((a, b) => a.uses - b.uses), [rows])
  const [rp, setRp] = React.useState(1)
  const rareRows = rare.slice((rp - 1) * 10, rp * 10)
  const columns: Column<WorkUsageFeature>[] = [
    { key: "n", header: "#", width: 44, align: "right", cell: (_, i) => <span className="tabular-nums">{i + 1}</span> },
    { key: "name", header: "Tính năng", cell: (r) => <><div className={nameCls}>{r.name}</div><div><span className={mono}>{r.code ?? r.id}</span></div></> },
    { key: "module", header: "Module", width: 130, cell: (r) => r.module },
    { key: "uses", header: "Lượt", width: 90, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.uses)}</span> },
    { key: "users", header: "Người", width: 80, align: "right", cell: (r) => <span className="tabular-nums">{r.users}</span> },
    { key: "err", header: "Lỗi", width: 76, align: "right", cell: (r) => { const e = r.errors ?? Math.round((r.uses * (100 - r.successRate)) / 100); return <span className="text-subtle-foreground tabular-nums">{(r.uses ? (e / r.uses) * 100 : 0).toFixed(1).replace(".", ",")}%</span> } },
    { key: "delta", header: "So kỳ trước", width: 104, align: "right", cell: (r) => <span className="text-xs font-semibold text-success tabular-nums">{r.delta ?? "mới"}</span> },
    { key: "trend", header: "Xu hướng", width: 100, cell: (r) => <Spark values={r.trend ?? jitter(r.id, 24)} /> },
  ]
  return (
    <div className="grid items-start gap-2.5 min-[992px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel flush title="Xếp hạng tính năng" note="bấm một dòng để xem xu hướng" aside={<FilterSearch className="w-[260px] max-w-1/2" value={q} onChange={(v) => { setQ(v); paged.reset() }} placeholder="Lọc theo tên hoặc mã…" />}>
        <DataTable label="Xếp hạng tính năng" density="compact" minWidthClass="table-fixed min-w-[844px]" className={cn(tableCls, "max-h-[603px] min-h-[160px]")} columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có tính năng phù hợp" />
      </Panel>
      <div className="grid content-start gap-2.5">
        <Panel title="Ít dùng / chưa ai dùng" aside={<small className="text-xs text-subtle-foreground">dưới 3 người</small>}>
          <ul className="m-0 list-none p-0">
            {rareRows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 border-b border-dashed border-[color-mix(in_srgb,var(--border)_58%,var(--card))] py-[7px] text-small last:border-b-0">
                <span><span className={nameCls}>{r.name}</span><br /><span className={mono}>{r.code ?? r.id}</span></span>
                <WorkPill small={false} className="flex-shrink-0 whitespace-nowrap">{r.uses} lượt</WorkPill>
              </li>
            ))}
            {rareRows.length === 0 && <li className="px-2 py-[18px] text-center text-small text-subtle-foreground">Mọi tính năng đều có người dùng.</li>}
          </ul>
          {rare.length > 0 && <Pager page={rp} pages={Math.max(1, Math.ceil(rare.length / 10))} from={(rp - 1) * 10 + 1} to={Math.min(rare.length, rp * 10)} total={rare.length} onPage={setRp} />}
        </Panel>
        <Panel title="Mã chưa khai báo" note="0"><div className="px-2 py-[18px] text-center text-small text-subtle-foreground">Không có mã lạ.</div></Panel>
      </div>
    </div>
  )
}

function UsersTab({ rows, q }: { rows: WorkUsageUser[]; q: string }) {
  const filtered = React.useMemo(() => rows.filter((r) => includesText([r.name, r.unit, r.role, r.account], q)), [rows, q])
  const { sorted } = useSort(filtered, { events: (r) => r.events }, { key: "events", dir: "desc" })
  const paged = usePaged(sorted, 25)
  const columns: Column<WorkUsageUser>[] = [
    { key: "name", header: "Người dùng", cell: (r) => (
      <div className="flex items-center gap-[9px]">
        <span aria-hidden className="inline-flex size-[30px] flex-none items-center justify-center rounded-full bg-accent text-label font-bold text-primary">{workInitials(r.name)}</span>
        <span><span className={nameCls}>{r.name}</span><br /><span className={mono}>{r.account ?? r.id}</span></span>
      </div>
    ) },
    { key: "unit", header: "Đơn vị", cell: (r) => r.unit },
    { key: "last", header: "Lần cuối", width: 140, cell: (r) => <span className="tabular-nums">{r.lastSeen}</span> },
    { key: "sessions", header: "Phiên", width: 72, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.sessions)}</span> },
    { key: "events", header: "Sự kiện", width: 84, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.events)}</span> },
    { key: "avg", header: "TB/phiên", width: 84, align: "right", cell: (r) => <span className="tabular-nums">{(r.sessions ? r.events / r.sessions : 0).toFixed(1).replace(".", ",")}</span> },
    { key: "top", header: "Dùng nhiều nhất", cell: (r) => <span className="inline-flex flex-wrap gap-1">{(r.topFeatures ?? [r.role]).map((f) => <WorkPill key={f} small>{f}</WorkPill>)}</span> },
  ]
  return <DataTable label="Người dùng" minWidthClass="table-fixed min-w-[1020px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(r) => r.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có người dùng phù hợp" />
}

function FlowsTab({ rows }: { rows: WorkUsageFlow[] }) {
  const [sel, setSel] = React.useState(rows[0]?.id)
  const flow = rows.find((f) => f.id === sel) ?? rows[0]
  if (!flow) return <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu quy trình.</p>
  const first = Math.max(1, flow.steps[0]?.count ?? 1)
  const stuck = flow.stuck ?? []
  const stuckCols: Column<WorkUsageStuck>[] = [
    { key: "o", header: "Đối tượng", width: 130, cell: (r) => <span className={mono} title={r.id}>…{r.id.slice(-8)}</span> },
    { key: "s", header: "Đang ở bước", cell: (r) => r.step },
    { key: "w", header: "Đã chờ", width: 130, align: "right", cell: (r) => <span className="text-destructive tabular-nums">{r.waited}</span> },
  ]
  return (
    <div className="grid items-start gap-2.5 min-[992px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel title="Phễu quy trình" note={flow.caption ?? `đếm theo ${flow.name.replace(/\s+/g, "")}`} aside={<WorkTabBar label="Chọn quy trình" tabs={rows.map((f) => ({ id: f.id, label: f.name }))} value={flow.id} onChange={setSel} />}>
        <ol className="m-0 list-none p-0">
          {flow.steps.map((st, i) => {
            const prev = flow.steps[i - 1]
            const drop = prev && prev.count > 0 ? Math.round(((prev.count - st.count) / prev.count) * 100) : 0
            return (
              <li key={st.label}>
                {prev && <div className="flex gap-1.5 py-[3px] pl-9 text-meta"><span className={cn("font-semibold tabular-nums", drop > 0 ? "text-destructive" : "text-subtle-foreground")}>↓ rơi {drop}%</span>{(prev.median ?? st.median) && <span className="text-subtle-foreground">· trung vị {prev.median ?? st.median}</span>}</div>}
                <div className="grid grid-cols-[26px_1fr_110px] items-center gap-2.5 py-1.5">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">{i + 1}</span>
                  <div>
                    <div className="mb-1 text-body font-semibold text-foreground">{st.label}{st.code && <> <span className={mono}>{st.code}</span></>}</div>
                    <div className="h-3.5 overflow-hidden rounded bg-muted"><span className="block h-full rounded bg-primary transition-[width] duration-300" style={{ width: `${(st.count / first) * 100}%` }} /></div>
                  </div>
                  <div className="text-right text-meta"><b className="mr-[3px] text-base text-foreground tabular-nums">{st.count}</b><span className="text-subtle-foreground">đối tượng</span><div className="text-subtle-foreground tabular-nums">{st.events ?? st.count} lượt</div></div>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
      <Panel flush title="Kẹt lâu nhất" note="đối tượng chưa qua bước kế">
        <DataTable label="Kẹt lâu nhất" density="compact" minWidthClass="table-fixed min-w-[420px]" className={cn(tableCls, "max-h-[460px] min-h-[160px] [&>div:last-child]:hidden")} columns={stuckCols} rows={stuck} getRowId={(r) => r.id} page={1} pageSize={10} total={stuck.length} pageSizeOptions={[10, 25]} emptyTitle="Không có đối tượng kẹt" />
      </Panel>
    </div>
  )
}

function ErrorsTab({ errors, rejected, slowApis }: { errors: WorkUsageError[]; rejected: WorkUsageRejected[]; slowApis: WorkUsageSlowApi[] }) {
  const pr = usePaged(rejected, 10)
  const pe = usePaged(React.useMemo(() => [...errors].sort((a, b) => b.count - a.count), [errors]), 10)
  const rejCols: Column<WorkUsageRejected>[] = [
    { key: "a", header: "Hành động", cell: (r) => <><div className={nameCls}>{r.action}</div><div className={mono}>{r.code}</div></> },
    { key: "r", header: "Kết quả", width: 100, cell: (r) => <WorkPill small tone="hophach">{r.result}</WorkPill> },
    { key: "why", header: "Lý do phổ biến", cell: (r) => <span className="block max-w-[320px] truncate text-xs text-muted-foreground" title={r.reason}>{r.reason}</span> },
    { key: "c", header: "Lần", width: 70, align: "right", cell: (r) => <span className="tabular-nums">{r.count}</span> },
  ]
  const errCols: Column<WorkUsageError>[] = [
    { key: "p", header: "Trang", width: 170, cell: (r) => <span className={mono}>{r.module}</span> },
    { key: "e", header: "Lỗi", cell: (r) => <><div><WorkPill small tone={r.level === "error" ? "son" : "hophach"}>{r.level === "error" ? "Lỗi JS" : "Lỗi mạng"}</WorkPill></div><span className="block max-w-[320px] truncate text-xs text-muted-foreground" title={r.message}>{r.message}</span></> },
    { key: "c", header: "Lần", width: 64, align: "right", cell: (r) => <span className="tabular-nums">{r.count}</span> },
    { key: "u", header: "Người", width: 70, align: "right", cell: () => <span className="tabular-nums">1</span> },
  ]
  const maxP95 = Math.max(1, ...slowApis.map((a) => a.p95))
  const fit = "min-h-[calc(100vh-290px)] max-h-[615px]"
  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2.5 min-[992px]:grid-cols-2">
        <section className="flex min-w-0 flex-col">
          <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5"><h5 className="m-0 text-sm leading-[1.2] font-bold text-foreground">Thao tác bị từ chối / lỗi nhiều nhất</h5></div>
          <DataTable label="Thao tác bị từ chối" density="compact" minWidthClass="table-fixed min-w-[500px]" className={cn(fit)} columns={rejCols} rows={pr.pageRows} total={pr.total} getRowId={(r) => r.id} page={pr.page} pageSize={pr.size} onPageChange={pr.setPage} onPageSizeChange={pr.setSize} pageSizeOptions={[10, 25, 50]} emptyTitle="Không có thao tác bị từ chối" emptyDescription="Hệ thống hoạt động ổn định trong kỳ này." />
        </section>
        <section className="flex min-w-0 flex-col">
          <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5"><h5 className="m-0 text-sm leading-[1.2] font-bold text-foreground">Lỗi phía trình duyệt theo trang</h5></div>
          <DataTable label="Lỗi phía trình duyệt" density="compact" minWidthClass="table-fixed min-w-[484px]" className={cn(fit)} columns={errCols} rows={pe.pageRows} total={pe.total} getRowId={(r) => r.id} page={pe.page} pageSize={pe.size} onPageChange={pe.setPage} onPageSizeChange={pe.setSize} pageSizeOptions={[10, 25, 50]} emptyTitle="Không có lỗi nào" emptyDescription="Hệ thống hoạt động ổn định trong kỳ này." />
        </section>
      </div>
      {slowApis.length > 0 && (
        <Panel title="API chậm nhất" note="p50 / p95 thời gian xử lý" aside={<div className={legend}><span><i className="mr-1 inline-block h-2 w-3 bg-primary align-middle" />p50</span><span><i className="mr-1 inline-block h-2 w-3 bg-[color-mix(in_srgb,var(--primary)_22%,var(--card))] align-middle" />p95</span></div>}>
          <ul className="m-0 list-none p-0">
            {slowApis.map((a) => (
              <li key={a.id} title={`${a.name} · ${a.calls} lượt · p50 ${a.p50} ms · p95 ${a.p95} ms`} className="grid grid-cols-[minmax(140px,32%)_1fr_150px] items-center gap-2.5 py-[5px] text-small">
                <span className="truncate text-foreground">{a.name} <span className={mono}>{a.calls} lượt</span></span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-muted"><span className="absolute inset-y-0 left-0 rounded-full bg-[color-mix(in_srgb,var(--primary)_22%,var(--card))]" style={{ width: `${(a.p95 / maxP95) * 100}%` }} /><span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${Math.max(1, (a.p50 / maxP95) * 100)}%` }} /></span>
                <span className="text-right text-muted-foreground tabular-nums">{a.p50} ms / <b className="text-foreground">{a.p95} ms</b></span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

const fieldLabel = "text-small leading-[1.4] font-semibold text-foreground"
/** Option button group of the form (reference `do-seg`). */
function Seg({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-9 max-w-full overflow-hidden rounded-md border">
      {options.map((o) => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={cn("inline-flex cursor-pointer items-center border-0 border-r px-[13px] text-control font-semibold whitespace-nowrap outline-none last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary", value === o.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground")}>{o.label}</button>)}
    </div>
  )
}
function CheckRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-[9px] py-1">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} aria-describedby={`${id}-hint`} className="mt-[1.1px]" />
      <label htmlFor={id} className="flex-1 cursor-pointer"><span className="block font-medium text-foreground">{label}</span><span id={`${id}-hint`} className="mt-0.5 block text-label leading-[1.45] text-subtle-foreground">{hint}</span></label>
    </div>
  )
}

const SAMPLE = `{"phien": "01JB3Q…", "user": "h:ab12…", "donVi": "h:3c9d…", "vaiTro": ["LANH_DAO"], "batDau": "2026-09-21T01:02:03Z", "nguon": "web", "dinhDang": 1,
 "buoc": [
  {"t": 0, "loai": "trang", "ma": "van-ban-di"},
  {"t": 4200, "loai": "hanhdong", "ma": "vanbandi.loc", "thamSo": {"trangThai": "cho-ky"}},
  {"t": 7800, "loai": "trang", "ma": "van-ban-di-ky", "doiTuong": {"loai": "VanBanDi", "id": "h:9f…"}},
  {"t": 9100, "loai": "api", "ma": "vanbandi.ky", "ketQua": "ok", "ms": 830}]}`

function TrainTab({ exports, collector, onExport }: { exports: WorkUsageExport[]; collector?: WorkUsageCollector; onExport?: WorkUsageStatsPageProps["onExport"] }) {
  const today = new Date()
  const [from, setFrom] = React.useState<Date | undefined>(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29))
  const [to, setTo] = React.useState<Date | undefined>(today)
  const [source, setSource] = React.useState("all")
  const [min, setMin] = React.useState("3")
  const [anon, setAnon] = React.useState(true)
  const [dropUnit, setDropUnit] = React.useState(false)
  const [writeOnly, setWriteOnly] = React.useState(false)
  const cols: Column<WorkUsageExport>[] = [
    { key: "t", header: "Lúc tạo", width: 130, cell: (r) => r.created },
    { key: "s", header: "Trạng thái", cell: (r) => r.status },
    { key: "n", header: "Phiên", width: 80, align: "right", cell: (r) => <span className="tabular-nums">{fmtN(r.sessions)}</span> },
    { key: "a", header: <span className="sr-only">Tải về</span>, width: 56, align: "center", cell: () => null },
  ]
  const link = "text-small font-semibold text-primary"
  return (
    <div className="grid items-start gap-2.5 min-[992px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid content-start gap-2.5">
        <Panel title="Xuất dữ liệu huấn luyện" note="JSONL · mỗi dòng một phiên">
          <div className="grid gap-x-3 gap-y-1 max-[767px]:grid-cols-1 min-[768px]:grid-cols-2">
            <div className="min-w-0"><label className={cn(fieldLabel, "mb-[5px] block")} htmlFor="work-train-from">Từ ngày<em className="ml-[3px] text-destructive not-italic">*</em></label><DatePicker aria-label="Từ ngày" value={from} onChange={setFrom} placeholder="" /></div>
            <div className="min-w-0"><label className={cn(fieldLabel, "mb-[5px] block")}>Đến ngày<em className="ml-[3px] text-destructive not-italic">*</em></label><DatePicker aria-label="Đến ngày" value={to} onChange={setTo} placeholder="" /></div>
            <div className="min-w-0"><div className={cn(fieldLabel, "mb-[5px]")}>Nguồn</div><Seg label="Nguồn" value={source} onChange={setSource} options={[{ id: "all", label: "Tất cả nguồn" }, { id: "web", label: "Web" }, { id: "desktop", label: "Ứng dụng máy tính" }, { id: "mobile", label: "Mobile" }]} /></div>
            <div className="min-w-0"><div className="mb-[5px] flex flex-wrap items-center gap-[5px]"><span className={fieldLabel}>Đơn vị</span><span className="text-small text-subtle-foreground">— không bắt buộc</span></div>
              <button type="button" aria-label="Tất cả đơn vị" className="flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-md border bg-card pr-1.5 pl-[11px] text-left text-body leading-[22px] hover:border-border-strong"><span className="min-w-0 flex-1 truncate text-subtle-foreground">Tất cả đơn vị</span><ChevronDown className="size-4 flex-none text-subtle-foreground" /></button></div>
            <div className="min-w-0 col-span-full"><div className={cn(fieldLabel, "mb-[5px]")}>Bỏ phiên ít hơn</div><Seg label="Bỏ phiên ít hơn" value={min} onChange={setMin} options={[{ id: "1", label: "1 sự kiện" }, { id: "3", label: "3 sự kiện" }, { id: "5", label: "5 sự kiện" }, { id: "10", label: "10 sự kiện" }]} /></div>
          </div>
          <div className="mt-1.5 mb-3 grid gap-2">
            <CheckRow id="work-train-anon" label="Ẩn danh người dùng và đối tượng" hint="Băm SHA-256 kèm salt cấu hình — vẫn nối được các bước cùng người, cùng văn bản." checked={anon} onChange={setAnon} />
            <CheckRow id="work-train-unit" label="Bỏ đơn vị" hint="Không xuất trường donVi." checked={dropUnit} onChange={setDropUnit} />
            <CheckRow id="work-train-write" label="Chỉ phiên có thao tác ghi" hint="Giữ phiên có ít nhất một sự kiện api — bỏ phiên chỉ xem." checked={writeOnly} onChange={setWriteOnly} />
          </div>
          <div className="flex items-center gap-3.5">
            <Button size="toolbar" onClick={() => { onExport?.({ from, to, source, minEvents: Number(min), anonymize: anon, dropUnit, writeOnly }); toast.success("Đã tạo yêu cầu xuất JSONL") }}><Download aria-hidden /> Xuất JSONL</Button>
            <a href="#trung-tam-xuat-file" onClick={(e) => e.preventDefault()} className={link}>Trung tâm xuất file →</a>
          </div>
        </Panel>
        <Panel title="Mẫu một dòng" note="phien.jsonl"><pre className="m-0 rounded-md border border-[color-mix(in_srgb,var(--border)_58%,var(--card))] bg-secondary px-3 py-2.5 font-mono text-label leading-[1.55] break-all whitespace-pre-wrap text-foreground">{SAMPLE}</pre></Panel>
      </div>
      <div className="grid content-start gap-2.5">
        <Panel flush title="Lần xuất gần đây" aside={<a href="#trung-tam-xuat-file" onClick={(e) => e.preventDefault()} className={link}>Trung tâm xuất file →</a>}>
          <DataTable label="Lần xuất gần đây" density="compact" minWidthClass="table-fixed min-w-[376px]" className={cn(tableCls, "max-h-[320px] min-h-[320px] [&>div:last-child]:hidden")} columns={cols} rows={exports} getRowId={(r) => r.id} page={1} pageSize={10} total={exports.length} pageSizeOptions={[10, 25]} emptyTitle="Chưa có lần xuất" emptyDescription="Dữ liệu sẽ hiện ở đây khi có." />
        </Panel>
        {collector && (
          <Panel title="Tình trạng thu thập" note="chỉ đọc — đổi trong appsettings.json">
            <ul className="m-0 list-none p-0 [&>li]:flex [&>li]:items-center [&>li]:justify-between [&>li]:gap-2 [&>li]:border-b [&>li]:border-dashed [&>li]:border-[color-mix(in_srgb,var(--border)_58%,var(--card))] [&>li]:py-[7px] [&>li]:text-small [&>li:last-child]:border-b-0">
              <li><span>Trạng thái</span><WorkPill tone={collector.enabled ? "xanh" : "xam"}>● {collector.enabled ? "Đang bật" : "Đang tắt"}</WorkPill></li>
              <li><span>Kho lưu</span><span className={mono}>{collector.store}</span></li>
              <li><span>Tổng sự kiện</span><span className="tabular-nums">{collector.events}</span></li>
              <li><span>Hàng đợi</span><span className="tabular-nums">{collector.queue} · <b className={collector.dropped ? "text-destructive" : undefined}>{collector.dropped} bị bỏ</b></span></li>
              <li><span>Tổng hợp ngày gần nhất</span><span className="tabular-nums">{collector.rollup}</span></li>
              <li><span>Bảng ánh xạ API</span><span className="tabular-nums">{collector.mapping}</span></li>
              {collector.unmatched.map((u) => <li key={u} className="!pl-3"><span className={mono}>{u}</span></li>)}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  )
}

/** KPI tile (reference `do-so`): 3px left accent, mono value 22/700, text values (e.g. durations) use the sans 17px style. */
function Kpi({ k }: { k: WorkStatKpi }) {
  const text = !/^[\d.,%\s/]+$/.test(k.value)
  return (
    <div className={cn("min-w-0 rounded-lg border border-l-[3px] bg-card px-3.5 pt-[11px] pb-3 text-left shadow-sm", k.highlight && (k.tone === "success" ? "border-l-success" : "border-l-primary"))}>
      <div className="text-label font-bold tracking-[0.04em] text-subtle-foreground uppercase">{k.label}</div>
      <div className={cn("mt-1 font-bold text-foreground", text ? "text-title leading-[1.6]" : "font-mono text-heading leading-[1.25]")}>{k.value}</div>
      <div className="mt-[3px] text-meta text-muted-foreground">{k.delta ? <><span className="text-meta font-semibold whitespace-nowrap text-success tabular-nums">{k.delta}</span><span className="text-meta text-subtle-foreground"> {k.hint}</span></> : k.hint}</div>
    </div>
  )
}

function OverviewTab({ kpis, series, modules, sources, heatmap }: Pick<WorkUsageStatsPageProps, "kpis" | "series" | "modules" | "sources" | "heatmap">) {
  return (
    <>
      <div className="mb-2.5 grid grid-cols-4 gap-2.5 max-[767px]:grid-cols-2">{kpis.map((k) => <Kpi key={k.id} k={k} />)}</div>
      <div className="mb-2.5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2.5 max-[991px]:grid-cols-1">
        <Panel title="Người dùng hoạt động theo ngày" aside={<div className={legend}><span><i className="mr-1 inline-block h-0.5 w-3 bg-primary align-middle" />Kỳ này</span><span><i className="mr-1 inline-block h-0.5 w-3 bg-subtle-foreground align-middle" />Kỳ trước</span></div>}><WorkLineChart data={series} /></Panel>
        <div className="grid content-start gap-2.5">
          <Panel title="Module dùng nhiều" note="theo lượt"><WorkBarList items={modules} /></Panel>
          <Panel title="Nguồn truy cập"><WorkBarList items={sources} tone="success" /></Panel>
        </div>
      </div>
      {heatmap && <Panel title="Giờ cao điểm" note="số sự kiện theo giờ × thứ"><Heatmap rows={heatmap} /></Panel>}
    </>
  )
}

/** Usage statistics dashboard with six tabs: overview (KPIs, line chart, bar lists, heatmap), features, users, flows, errors and the training-data export. */
export function WorkUsageStatsPage({ tabs = workUsageTabs, activeTab, onTabChange, filters, onFilterChange, onRefresh, online, asOf, kpis, series, modules, sources, heatmap, features = [], users = [], flows = [], errors = [], rejected = [], slowApis = [], exports = [], collector, onExport, className }: WorkUsageStatsPageProps) {
  const [innerTab, setInnerTab] = React.useState(tabs[0]?.id ?? "overview")
  const tab = activeTab ?? innerTab
  const changeTab = (id: string) => { setInnerTab(id); onTabChange?.(id) }
  const [userQuery, setUserQuery] = React.useState("")
  const fFeatures = React.useMemo(() => features.filter((r) => matchFilters(filters, r)), [features, filters])
  const fUsers = React.useMemo(() => users.filter((r) => matchFilters(filters, r)), [users, filters])
  const fFlows = React.useMemo(() => flows.filter((r) => matchFilters(filters, r)), [flows, filters])
  const fErrors = React.useMemo(() => errors.filter((r) => matchFilters(filters, r)), [errors, filters])
  const shownTabs = tabs.map((t) => (t.id === "errors" && tab === "errors" && t.count === undefined && errors.length ? { ...t, count: errors.reduce((s, e) => s + e.count, 0) } : t))
  const fill = tab === "users"
  const range = filters.find((f) => f.id === "range")
  const fields = filters.filter((f) => f !== range)
  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-auto", fill ? "overflow-hidden pb-0" : "pb-4", className)}>
      <div className="mb-2 flex flex-none flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <WorkTabBar tabs={shownTabs} value={tab} onChange={changeTab} />
        <div className="ml-auto flex flex-wrap gap-1.5">
          {asOf && <span title="Ngày tổng hợp gần nhất" className="inline-flex h-[26px] items-center gap-[5px] rounded-full border bg-card px-[9px] text-xs whitespace-nowrap text-muted-foreground"><CalendarCheck aria-hidden className="size-3.5 flex-none" /> {asOf}</span>}
          {online !== undefined && <span title="Đang online" className="inline-flex h-[26px] items-center gap-[5px] rounded-full border border-[color-mix(in_srgb,var(--success)_25%,var(--card))] bg-[color-mix(in_srgb,var(--success)_10%,var(--card))] px-[9px] text-xs font-semibold whitespace-nowrap text-success"><b className="size-[7px] rounded-full bg-success" aria-hidden />{online} online</span>}
        </div>
      </div>
      {tab !== "train" && <div className="mb-1.5 flex-none overflow-hidden rounded-lg border bg-card px-2.5 py-[9px] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto max-[900px]:gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tab === "users" && <FilterSearch className="w-[260px] min-w-[160px] flex-[0_1_260px]" value={userQuery} onChange={setUserQuery} placeholder="Tìm theo tên, tài khoản… (Enter)" />}
          {range && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><FilterButton aria-label={range.label} className="gap-1.5 px-3 max-[900px]:px-[9px]"><span>{range.label}:</span><b className="font-bold text-foreground">{range.value}</b><ChevronDown className="!size-3.5 ml-0.5 text-subtle-foreground" /></FilterButton></DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={range.value} onValueChange={(v) => onFilterChange?.(range.id, v)}>{range.options.map((o) => <DropdownMenuRadioItem key={o} value={o}>{o}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {fields.map((f, i) => <WorkFilterField key={f.id} label={f.label} width={i === fields.length - 1 ? 180 : 200} value={f.value === "Tất cả" ? WORK_ALL : f.value} options={f.options.filter((o) => o !== "Tất cả")} onChange={(v) => onFilterChange?.(f.id, v === WORK_ALL ? "Tất cả" : v)} />)}
          <Button variant="outline" size="toolbar-icon" className="ml-auto flex-none text-muted-foreground hover:text-foreground" aria-label="Làm mới" title="Tải lại" onClick={() => { onRefresh?.(); toast.success("Đã làm mới số liệu") }}><RefreshCw /></Button>
        </div>
      </div>}
      {tab === "overview" && <OverviewTab kpis={kpis} series={series} modules={modules} sources={sources} heatmap={heatmap} />}
      {tab === "features" && <FeaturesTab rows={fFeatures} />}
      {tab === "users" && <div className="flex min-h-0 flex-1 flex-col"><UsersTab rows={fUsers} q={userQuery} /></div>}
      {tab === "flows" && <FlowsTab rows={fFlows} />}
      {tab === "errors" && <ErrorsTab errors={fErrors} rejected={rejected} slowApis={slowApis} />}
      {tab === "train" && <TrainTab exports={exports} collector={collector} onExport={onExport} />}
    </div>
  )
}
