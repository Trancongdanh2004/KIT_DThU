import * as React from "react"
import { RefreshCw, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker, type DateRange } from "@/components/ui/date-picker"
import { SearchInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { WorkLogDetailSheet } from "./work-log-detail-sheet"
import { WorkPill, includesText, inDateRange, parseVnDate, usePaged } from "./work-shared"

/** `time` starts with a dd/MM/yyyy date. */
export interface WorkAuditEntry { id: string; time: string; actor?: string; table: string; action: string; success: boolean; content: string }

export interface WorkAuditLogPageProps {
  entries: WorkAuditEntry[]
  onSearch?: (filters: { search: string; range?: DateRange }) => void
  onRefresh?: () => void
  className?: string
}

/** "Loggings": data-change audit viewer. Text and date range are applied with the Tìm kiếm button (or Enter). */
export function WorkAuditLogPage({ entries, onSearch, onRefresh, className }: WorkAuditLogPageProps) {
  const [draftSearch, setDraftSearch] = React.useState("")
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()
  const [applied, setApplied] = React.useState<{ search: string; range?: DateRange }>({ search: "" })
  const [openId, setOpenId] = React.useState<string | null>(null)
  const rows = React.useMemo(() => entries.filter((e) => inDateRange(parseVnDate(e.time), applied.range) && includesText([e.actor, e.table, e.action, e.content], applied.search)), [entries, applied])
  const paged = usePaged(rows, 25)
  const current = entries.find((e) => e.id === openId)
  const apply = () => { setApplied({ search: draftSearch, range: draftRange }); paged.reset(); onSearch?.({ search: draftSearch, range: draftRange }) }
  const columns: Column<WorkAuditEntry>[] = [
    { key: "stt", header: "STT", width: 60, align: "center", cell: (_, i) => <span className="text-xs whitespace-nowrap tabular-nums">{i + 1}</span> },
    { key: "time", header: "Thời điểm", width: 150, cell: (e) => <span className="text-xs whitespace-nowrap tabular-nums">{e.time}</span> },
    { key: "actor", header: "Người thao tác", width: 170, cell: (e) => <span className="block truncate">{e.actor ?? ""}</span> },
    { key: "table", header: "Bảng dữ liệu", width: 170, cell: (e) => <span className="block truncate">{e.table}</span> },
    { key: "action", header: "Thao tác", width: 130, cell: (e) => <span className="block truncate">{e.action}</span> },
    { key: "result", header: "Kết quả", width: 130, align: "center", cell: (e) => <WorkPill small tone={e.success ? "xanh" : "son"}>{e.success ? "Thành công" : "Thất bại"}</WorkPill> },
    { key: "content", header: "Nội dung", cell: (e) => <span className="block truncate" title={e.content}>{e.content}</span> },
  ]
  const clear = () => { setDraftSearch(""); setDraftRange(undefined); setApplied({ search: "" }); paged.reset() }
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      <div onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") apply() }} className="-mx-(--page-bleed-x) -mt-(--page-bleed-t) flex-none border-b bg-card px-[calc(var(--page-bleed-x,0px)+--spacing(2.5))] py-[9px]">
        <div className="flex items-center gap-2 max-[900px]:gap-1.5">
          <SearchInput value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Tìm theo người thao tác, bảng dữ liệu, nội dung…" aria-label="Tìm theo người thao tác, bảng dữ liệu, nội dung…" />
          <div className="mr-[7px] flex flex-none items-center gap-1.5 max-[900px]:hidden">
            <div className="w-[148px] flex-none"><DatePicker aria-label="Từ ngày" placeholder="Từ ngày" value={draftRange?.from} onChange={(d) => setDraftRange({ from: d, to: draftRange?.to })} /></div>
            <span aria-hidden className="flex-none text-body font-semibold text-subtle-foreground">–</span>
            <div className="w-[148px] flex-none"><DatePicker aria-label="Đến ngày" placeholder="Đến ngày" value={draftRange?.to} onChange={(d) => setDraftRange({ from: draftRange?.from, to: d })} /></div>
          </div>
          <Button variant="outline" size="toolbar-icon" aria-label="Làm mới" title="Tải lại" className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => { clear(); onRefresh?.(); toast.success("Đã làm mới nhật ký") }}><RefreshCw /></Button>
          <Button size="toolbar" onClick={apply}><Search /> Tìm kiếm</Button>
        </div>
      </div>
      <DataTable label="Nhật ký thao tác" minWidthClass="table-fixed min-w-[1090px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(e) => e.id} onRowClick={(e) => setOpenId(e.id)} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} pageSizeOptions={[10, 25, 50, 100]} emptyTitle="Không có bản ghi" emptyDescription="Thử mở rộng khoảng ngày hoặc đổi từ khóa." />
      <WorkLogDetailSheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current ? `${current.table} · ${current.action}` : ""} fields={current ? [
        { label: "Thời điểm", value: current.time }, { label: "Người thao tác", value: current.actor ?? "—" }, { label: "Bảng dữ liệu", value: current.table },
        { label: "Thao tác", value: current.action }, { label: "Kết quả", value: current.success ? "Thành công" : "Thất bại" }, { label: "Nội dung", value: current.content },
      ] : []} />
    </div>
  )
}
