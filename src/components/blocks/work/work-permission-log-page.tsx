import * as React from "react"
import { ListFilter, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker, type DateRange } from "@/components/ui/date-picker"
import { SearchInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { FilterButton, FilterToggle } from "@/components/blocks/shell/page-chrome"
import { WorkLogDetailSheet } from "./work-log-detail-sheet"
import { WORK_ALL, WorkFilterField, includesText, inDateRange, parseVnDate, usePaged } from "./work-shared"

/** `date` is dd/MM/yyyy. */
export interface WorkPermissionLogEntry { id: string; time: string; date: string; actor: string; username: string; capacity: string; proxy?: string; form?: string; object: string; objectKind: string; action: string; allowed: boolean; reason?: string; ip?: string }

export interface WorkPermissionLogPageProps {
  entries: WorkPermissionLogEntry[]
  onRefresh?: () => void
  className?: string
}

/** Permission audit log: denied-only toggle, text search, date range, user, capacity and object-kind filters. */
export function WorkPermissionLogPage({ entries, onRefresh, className }: WorkPermissionLogPageProps) {
  const [deniedOnly, setDeniedOnly] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [user, setUser] = React.useState(WORK_ALL)
  const [capacity, setCapacity] = React.useState(WORK_ALL)
  const [kind, setKind] = React.useState(WORK_ALL)
  const [advanced, setAdvanced] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const uniq = (f: (e: WorkPermissionLogEntry) => string) => [...new Set(entries.map(f))].sort()
  const rows = React.useMemo(() => entries.filter((e) =>
    (!deniedOnly || !e.allowed) && (user === WORK_ALL || e.username === user) && (capacity === WORK_ALL || e.capacity === capacity) && (kind === WORK_ALL || e.objectKind === kind) &&
    inDateRange(parseVnDate(e.date), range) && includesText([e.actor, e.username, e.object, e.action, e.reason, e.proxy], search)), [entries, deniedOnly, user, capacity, kind, range, search])
  const paged = usePaged(rows, 50)
  const current = entries.find((e) => e.id === openId)
  const active = (user !== WORK_ALL ? 1 : 0) + (capacity !== WORK_ALL ? 1 : 0) + (kind !== WORK_ALL ? 1 : 0) + (range?.from ? 1 : 0)
  const dash = <span className="text-subtle-foreground">—</span>
  const sub = "mt-0.5 block text-label leading-[1.35] text-muted-foreground"
  const columns: Column<WorkPermissionLogEntry>[] = [
    { key: "time", header: "Thời điểm", width: 112, cell: (e) => <><span className="text-xs whitespace-nowrap tabular-nums"><b>{e.time}</b></span><span className={cn(sub, "text-xs tabular-nums", "text-label")}>{e.date}</span></> },
    { key: "actor", header: "Người thực hiện", cell: (e) => <><span className="block truncate text-body font-semibold">{e.actor}</span><span className={cn(sub, "truncate")}>{e.username}</span></> },
    { key: "capacity", header: "Tư cách", width: 124, cell: (e) => <Badge variant="outline">{e.capacity}</Badge> },
    { key: "proxy", header: "Thay mặt", cell: (e) => e.proxy ? <span className="block truncate">{e.proxy}</span> : dash },
    { key: "form", header: "Hình thức", width: 90, cell: (e) => e.form ?? dash },
    { key: "object", header: "Đối tượng", cell: (e) => <><span className="block truncate" title={e.object}>{e.object}</span><span className={sub}>{e.objectKind}</span></> },
    { key: "action", header: "Hành động", cell: (e) => <span className="block truncate" title={e.action}>{e.action}</span> },
    { key: "result", header: "Kết quả", width: 104, cell: (e) => <Badge variant={e.allowed ? "success" : "destructive"}>{e.allowed ? "Cho phép" : "Từ chối"}</Badge> },
    { key: "reason", header: "Lý do", cell: (e) => <span className="block truncate">{e.reason ?? "—"}</span> },
    { key: "ip", header: "IP", width: 124, cell: (e) => <span className="font-mono text-label font-medium whitespace-nowrap text-subtle-foreground">{e.ip ?? "—"}</span> },
  ]
  const reset = () => { setDeniedOnly(false); setSearch(""); setRange(undefined); setUser(WORK_ALL); setCapacity(WORK_ALL); setKind(WORK_ALL); paged.reset() }
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      <div className="-mx-(--page-bleed-x) -mt-(--page-bleed-t) flex-none border-b bg-card px-[calc(var(--page-bleed-x,0px)+--spacing(2.5))] py-[9px]">
        <div className="flex items-center gap-2 max-[900px]:gap-1.5">
          <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); paged.reset() }} placeholder="Người, đối tượng, hành động, lý do…" aria-label="Người, đối tượng, hành động, lý do…" />
          <FilterToggle pressed={deniedOnly} title="Chỉ các lần bị từ chối" onClick={() => { setDeniedOnly((v) => !v); paged.reset() }}>Bị từ chối</FilterToggle>
          <Button variant="outline" size="toolbar-icon" aria-label="Làm mới" title="Tải lại" className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => { reset(); onRefresh?.(); toast.success("Đã làm mới nhật ký phân quyền") }}><RefreshCw /></Button>
          <FilterButton aria-expanded={advanced} title="Bộ lọc" className="min-w-9 justify-center px-[9px] [&_svg]:size-[17px]" onClick={() => setAdvanced((v) => !v)}><ListFilter />Bộ lọc{active > 0 && <span className="rounded-[9px] bg-accent px-1.5 text-label text-primary">{active}</span>}</FilterButton>
        </div>
      </div>
      {advanced && (
        <div className="flex flex-none flex-wrap items-center gap-2 rounded-lg border bg-card px-2.5 py-[9px] shadow-sm" role="group" aria-label="Bộ lọc nâng cao">
          <div className="w-[148px] flex-none"><DatePicker aria-label="Từ ngày" placeholder="Từ ngày" value={range?.from} onChange={(d) => { setRange({ from: d, to: range?.to }); paged.reset() }} /></div>
          <span aria-hidden className="flex-none text-body font-semibold text-subtle-foreground">–</span>
          <div className="w-[148px] flex-none"><DatePicker aria-label="Đến ngày" placeholder="Đến ngày" value={range?.to} onChange={(d) => { setRange({ from: range?.from, to: d }); paged.reset() }} /></div>
          <WorkFilterField label="Người dùng" width={230} className="max-[900px]:flex" value={user} options={uniq((e) => e.username)} onChange={(v) => { setUser(v); paged.reset() }} />
          <WorkFilterField label="Tư cách" width={200} className="max-[900px]:flex" value={capacity} options={uniq((e) => e.capacity)} onChange={(v) => { setCapacity(v); paged.reset() }} />
          <WorkFilterField label="Đối tượng" width={200} className="max-[900px]:flex" value={kind} options={uniq((e) => e.objectKind)} onChange={(v) => { setKind(v); paged.reset() }} />
          <Button variant="ghost" size="toolbar" onClick={reset}>Xóa bộ lọc</Button>
        </div>
      )}
      <DataTable label="Nhật ký phân quyền" minWidthClass="table-fixed min-w-[1454px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(e) => e.id} onRowClick={(e) => setOpenId(e.id)} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có bản ghi" emptyDescription="Thử bỏ bớt bộ lọc." />
      <WorkLogDetailSheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current?.action ?? ""} description={current ? `${current.time} ${current.date}` : undefined} fields={current ? [
        { label: "Người thực hiện", value: `${current.actor} (${current.username})` }, { label: "Tư cách", value: current.capacity }, { label: "Thay mặt", value: current.proxy ?? "—" },
        { label: "Đối tượng", value: `${current.object} · ${current.objectKind}` }, { label: "Kết quả", value: current.allowed ? "Cho phép" : "Từ chối" }, { label: "Lý do", value: current.reason ?? "—" }, { label: "IP", value: current.ip ?? "—" },
      ] : []} />
    </div>
  )
}
