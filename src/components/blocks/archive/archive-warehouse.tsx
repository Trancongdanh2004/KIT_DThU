import * as React from "react"
import { Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EmptyState } from "@/components/ui/empty-state"
import { ArchiveListPage, type ArchiveListPageProps } from "./archive-list-page"
import { archiveMono, type ArchiveColumn } from "./archive-shared"

export interface ArchiveFonds { id: string; name: string; count: number }
export interface ArchiveRecord { id: string; code: string; title: string; year: number; retention: string; form: string; location?: string; status: string }
export interface ArchiveShelf { id: string; label: string; used: number; capacity: number }

export interface ArchiveWarehousePageProps extends Omit<ArchiveListPageProps<ArchiveRecord>, "columns" | "getRowId" | "rows" | "sidebar" | "body" | "tabs" | "tab" | "onTabChange"> {
  fonds: ArchiveFonds[]
  activeFonds?: string
  onFondsChange?: (id: string | undefined) => void
  /** Records of the current page. */
  records: ArchiveRecord[]
  /** Total number of records matching the filters, for the "Hồ sơ" tab count. */
  recordCount?: number
  shelves?: ArchiveShelf[]
  view?: "records" | "map"
  onViewChange?: (v: "records" | "map") => void
  onRecordClick?: (r: ArchiveRecord) => void
}

const columns: ArchiveColumn<ArchiveRecord>[] = [
  { key: "code", header: "Mã hồ sơ", width: 160, cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Tiêu đề", cell: (r) => <span className="font-medium">{r.title}</span> },
  { key: "year", header: "Năm", width: 66, align: "center", cell: (r) => r.year },
  { key: "retention", header: "Thời hạn", width: 110, cell: (r) => r.retention },
  { key: "form", header: "Dạng", width: 96, cell: (r) => r.form },
  { key: "location", header: "Vị trí", width: 176, cell: (r) => r.location ?? <span className="text-muted-foreground">Chưa có vị trí</span> },
  { key: "status", header: "Trạng thái", width: 136, cell: (r) => <Badge variant="success">{r.status}</Badge> },
]

/** Warehouse (kho lưu trữ): one toolbar over a fonds/catalog side panel and the record list or shelf map. */
export function ArchiveWarehousePage({ fonds, activeFonds, onFondsChange, records, recordCount, shelves = [], view = "records", onViewChange, onRecordClick, ...list }: ArchiveWarehousePageProps) {
  const total = fonds.reduce((n, f) => n + f.count, 0)
  const item = (on: boolean) => cn("block w-full cursor-pointer rounded-md border px-2.5 py-[7px] text-left text-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring max-md:w-auto max-md:shrink-0 max-md:whitespace-nowrap", on ? "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent" : "border-transparent")
  const pill = "flex-none rounded-[9px] bg-muted px-1.5 font-mono text-caption font-semibold text-muted-foreground"
  const sidebar = (
    <aside className="max-h-full w-full flex-none overflow-y-auto rounded-[9px] border bg-card shadow-sm md:w-[250px] max-md:max-h-[260px]" aria-label="Phòng và mục lục">
      <div className="px-4 pt-[13px]"><h3 className="m-0 flex items-center gap-1.5 text-sm leading-4 font-bold text-foreground">Phòng · Mục lục</h3></div>
      <div className="px-4 pt-3 pb-3.5">
        <nav className="flex flex-col gap-0.5 max-md:flex-row max-md:overflow-x-auto">
          <button type="button" aria-pressed={!activeFonds} aria-current={!activeFonds || undefined} onClick={() => onFondsChange?.(undefined)} className={item(!activeFonds)}>
            <span className="flex items-center gap-2 text-control"><Archive className={cn("size-4 flex-none", !activeFonds ? "text-primary" : "text-muted-foreground")} /><span className={cn("min-w-0 flex-1 truncate", !activeFonds && "font-bold text-primary")}>Tất cả hồ sơ</span><span className={pill}>{total}</span></span>
          </button>
          {fonds.map((f) => (
            <button key={f.id} type="button" aria-pressed={activeFonds === f.id} aria-current={activeFonds === f.id || undefined} onClick={() => onFondsChange?.(f.id)} className={item(activeFonds === f.id)}>
              <span className="flex items-center gap-2 text-control"><span className={cn("min-w-0 flex-1 truncate", activeFonds === f.id && "font-bold text-primary")}>{f.name}</span><span className={pill}>{f.count}</span></span>
            </button>
          ))}
        </nav>
        {fonds.length === 0 && <div className="mt-2 text-xs text-subtle-foreground">Chưa có hồ sơ nào trong kho.</div>}
      </div>
    </aside>
  )
  const map = (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-card p-4">
      {shelves.length === 0 ? <EmptyState title="Chưa có sơ đồ kho" description="Thêm giá, kệ để theo dõi sức chứa." /> : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3" aria-label="Sơ đồ kho">
          {shelves.map((s) => {
            const pct = Math.round((s.used / Math.max(1, s.capacity)) * 100)
            return (
              <li key={s.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{s.label}</span><Badge variant={pct >= 90 ? "destructive" : pct >= 70 ? "warning" : "success"}>{pct}%</Badge></div>
                <Progress value={pct} className="mt-2" aria-label={`Sức chứa ${s.label}`} />
                <div className="mt-1.5 text-xs text-muted-foreground">{s.used} / {s.capacity} hộp</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
  return (
    <ArchiveListPage<ArchiveRecord>
      searchPlaceholder="Tìm mã, tiêu đề, đơn vị…" tableMinWidthClass="min-w-[60rem]" emptyTitle="Không có hồ sơ" rowLabel={(r) => r.code}
      actionsColumn {...list} columns={columns} rows={records} getRowId={(r) => r.id} onRowClick={onRecordClick} sidebar={sidebar} body={view === "map" ? map : undefined}
      tabs={[{ value: "records", label: "Hồ sơ", count: recordCount ?? records.length }, { value: "map", label: "Sơ đồ kho" }]} tab={view} onTabChange={(v) => onViewChange?.(v as "records" | "map")} />
  )
}
