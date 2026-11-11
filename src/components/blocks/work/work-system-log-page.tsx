import * as React from "react"
import { ListFilter, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu-extras"
import { SearchInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { FilterButton, FilterToggle } from "@/components/blocks/shell/page-chrome"
import { WorkLogDetailSheet } from "./work-log-detail-sheet"
import { WORK_ALL, WorkFilterField, includesText, usePaged } from "./work-shared"

export type WorkLogLevel = "Error" | "Warning" | "Information" | "Business"
export interface WorkSystemLogEntry { id: string; time: string; /** Timestamp used by the date-range filter. */ at?: Date; level: WorkLogLevel; title?: string; message: string; user?: string; endpoint?: string; http?: number; ref: string }

export interface WorkSystemLogPageProps {
  entries: WorkSystemLogEntry[]
  onRefresh?: () => void
  className?: string
}

const levelVariant: Record<WorkLogLevel, "destructive" | "warning" | "info" | "secondary"> = { Error: "destructive", Warning: "warning", Information: "info", Business: "secondary" }
const HTTP_CLASSES = ["2xx", "3xx", "4xx", "5xx"]

const TIME_OPTIONS = [{ id: "all", label: "Tất cả thời gian" }, { id: "24h", label: "24 giờ qua" }, { id: "7d", label: "7 ngày qua" }] as const
type TimeOption = (typeof TIME_OPTIONS)[number]["id"]
const SPAN_MS: Record<TimeOption, number> = { all: Infinity, "24h": 24 * 3600e3, "7d": 7 * 24 * 3600e3 }

/** System log viewer: level toggles, free-text/reference search, time window, user and HTTP class filters, table and detail drawer. */
export function WorkSystemLogPage({ entries, onRefresh, className }: WorkSystemLogPageProps) {
  const [levels, setLevels] = React.useState<WorkLogLevel[]>([])
  const [search, setSearch] = React.useState("")
  const [user, setUser] = React.useState(WORK_ALL)
  const [time, setTime] = React.useState<TimeOption>("24h")
  const [httpClass, setHttpClass] = React.useState(WORK_ALL)
  const [advanced, setAdvanced] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const users = React.useMemo(() => [...new Set(entries.map((e) => e.user).filter((u): u is string => !!u))].sort(), [entries])
  const latest = React.useMemo(() => Math.max(0, ...entries.map((e) => e.at?.getTime() ?? 0)), [entries])
  const rows = React.useMemo(() => entries.filter((e) =>
    (levels.length === 0 || levels.includes(e.level)) && (user === WORK_ALL || e.user === user) &&
    (httpClass === WORK_ALL || (e.http !== undefined && `${Math.floor(e.http / 100)}xx` === httpClass)) &&
    (time === "all" || !e.at || !latest || e.at.getTime() >= latest - SPAN_MS[time]) &&
    includesText([e.message, e.title, e.ref, e.user, e.endpoint], search)), [entries, levels, user, httpClass, time, latest, search])
  const paged = usePaged(rows, 50)
  const current = entries.find((e) => e.id === openId)
  const count = (l: WorkLogLevel) => entries.filter((e) => e.level === l).length
  const active = (user !== WORK_ALL ? 1 : 0) + (httpClass !== WORK_ALL ? 1 : 0)
  const toggle = (l: WorkLogLevel) => { setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l])); paged.reset() }
  const reset = () => { setLevels([]); setSearch(""); setUser(WORK_ALL); setTime("24h"); setHttpClass(WORK_ALL); paged.reset() }
  const columns: Column<WorkSystemLogEntry>[] = [
    { key: "time", header: "Thời gian", width: 160, cell: (e) => <span className="text-xs whitespace-nowrap tabular-nums">{e.time}</span> },
    { key: "level", header: "Mức", width: 112, cell: (e) => <Badge variant={levelVariant[e.level]} dot>{e.level}</Badge> },
    { key: "msg", header: "Sự kiện / thông điệp", cell: (e) => <>{e.title && <div className="flex min-w-0 items-baseline gap-[9px]"><span className="font-mono text-body leading-[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-primary">{e.title}</span></div>}<div className="block truncate text-sm leading-[1.35] font-medium tracking-[-0.005em] text-foreground" title={e.message}>{e.message}</div></> },
    { key: "user", header: "Người dùng", width: 150, cell: (e) => <span>{e.user ?? ""}</span> },
    { key: "endpoint", header: "Endpoint", width: 220, cell: (e) => <span className="block truncate" title={e.endpoint}>{e.endpoint ?? ""}</span> },
    { key: "http", header: "HTTP", width: 76, align: "center", cell: (e) => <span className="text-xs whitespace-nowrap tabular-nums">{e.http ?? ""}</span> },
    { key: "ref", header: "Mã tham chiếu", width: 164, cell: (e) => <span className="font-mono text-label font-medium whitespace-nowrap text-subtle-foreground">{e.ref}</span> },
  ]
  const levelBtn = (l: WorkLogLevel, label: string, n?: number) => (
    <FilterToggle pressed={levels.includes(l)} className="max-[900px]:hidden" onClick={() => toggle(l)}>{label}{n !== undefined && n > 0 && <span className="rounded-[9px] bg-muted px-1.5 py-px font-mono text-label font-normal text-muted-foreground tabular-nums">{n}</span>}</FilterToggle>
  )
  const timeLabel = TIME_OPTIONS.find((o) => o.id === time)!.label
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      <div className="-mx-(--page-bleed-x) -mt-(--page-bleed-t) flex-none border-b bg-card px-[calc(var(--page-bleed-x,0px)+--spacing(2.5))] py-[9px]">
        <div className="flex items-center gap-2 max-[900px]:gap-1.5">
          {levelBtn("Error", "Lỗi", count("Error"))}{levelBtn("Warning", "Cảnh báo", count("Warning"))}{levelBtn("Business", "Lỗi nghiệp vụ")}
          <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); paged.reset() }} placeholder="Dán mã tham chiếu hoặc tìm trong nội dung log…" aria-label="Dán mã tham chiếu hoặc tìm trong nội dung log…" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><FilterButton label="Thời gian" value={timeLabel} className="max-[900px]:hidden" /></DropdownMenuTrigger>
            <DropdownMenuContent align="start"><DropdownMenuRadioGroup value={time} onValueChange={(v) => { setTime(v as TimeOption); paged.reset() }}>{TIME_OPTIONS.map((o) => <DropdownMenuRadioItem key={o.id} value={o.id}>{o.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
          </DropdownMenu>
          <FilterButton aria-expanded={advanced} onClick={() => setAdvanced((v) => !v)}><ListFilter />Bộ lọc{active > 0 && <span className="rounded-[9px] bg-accent px-1.5 text-label text-primary">{active}</span>}<i className="text-micro opacity-60 not-italic">▾</i></FilterButton>
          <Button variant="outline" size="toolbar-icon" aria-label="Làm mới" title="Tải lại" className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => { reset(); onRefresh?.(); toast.success("Đã làm mới nhật ký hệ thống") }}><RefreshCw /></Button>
        </div>
      </div>
      {advanced && (
        <div className="flex flex-none flex-wrap items-center gap-2 rounded-lg border bg-card px-2.5 py-[9px] shadow-sm" role="group" aria-label="Bộ lọc nâng cao">
          <WorkFilterField label="Người dùng" width={230} value={user} options={users} onChange={(v) => { setUser(v); paged.reset() }} className="max-[900px]:flex" />
          <WorkFilterField label="HTTP" width={160} value={httpClass} options={HTTP_CLASSES} onChange={(v) => { setHttpClass(v); paged.reset() }} className="max-[900px]:flex" />
          <Button variant="ghost" size="toolbar" onClick={reset}>Xóa bộ lọc</Button>
        </div>
      )}
      <DataTable label="Nhật ký hệ thống" minWidthClass="table-fixed min-w-[1222px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(e) => e.id} onRowClick={(e) => setOpenId(e.id)} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có bản ghi log" emptyDescription="Thử bỏ bớt bộ lọc." />
      <WorkLogDetailSheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current?.title ?? current?.level ?? ""} description={current?.time} raw={current?.message} fields={current ? [
        { label: "Mức", value: <Badge variant={levelVariant[current.level]}>{current.level}</Badge> }, { label: "Người dùng", value: current.user ?? "—" },
        { label: "Endpoint", value: current.endpoint ?? "—" }, { label: "HTTP", value: current.http ?? "—" }, { label: "Mã tham chiếu", value: <span className="font-mono">{current.ref}</span> },
      ] : []} />
    </div>
  )
}
