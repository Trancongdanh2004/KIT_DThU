"use client"

// @dthu/ui 0.2.0 · block-archive
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateRangePicker, type DateRange } from "@/components/ui/date-picker"
import { ArchiveListPage, type ArchiveListPageProps } from "./archive-list-page"
import { archiveMono, type ArchiveColumn } from "./archive-shared"

export interface ArchiveSearchResult { id: string; code: string; title: string; date: string; retention: string; form: string; status: string }

export interface ArchiveSearchCriteria { query: string; signNo: string; range?: DateRange }

export interface ArchiveSearchPageProps extends Omit<ArchiveListPageProps<ArchiveSearchResult>, "columns" | "getRowId" | "rows" | "tabs" | "tab" | "onTabChange" | "search" | "onSearchChange" | "advanced" | "actionLabel"> {
  mode: string
  onModeChange?: (v: string) => void
  counts?: { records: number; documents: number }
  criteria: ArchiveSearchCriteria
  onCriteriaChange?: (c: ArchiveSearchCriteria) => void
  results: ArchiveSearchResult[]
}

const columns: ArchiveColumn<ArchiveSearchResult>[] = [
  { key: "code", header: "Mã hồ sơ", width: 170, cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Tiêu đề", cell: (r) => <span className="font-medium">{r.title}</span> },
  { key: "date", header: "Thời gian", width: 190, cell: (r) => r.date },
  { key: "retention", header: "Thời hạn", width: 120, cell: (r) => r.retention },
  { key: "form", header: "Dạng", width: 100, cell: (r) => r.form },
  { key: "status", header: "Trạng thái", width: 150, cell: (r) => <Badge variant="success">{r.status}</Badge> },
]

/** Search (tìm kiếm): scope tabs, keyword, filters, collapsible advanced criteria and a results table. */
export function ArchiveSearchPage({ mode, onModeChange, counts, criteria, onCriteriaChange, results, ...list }: ArchiveSearchPageProps) {
  const set = (patch: Partial<ArchiveSearchCriteria>) => onCriteriaChange?.({ ...criteria, ...patch })
  return (
    <ArchiveListPage<ArchiveSearchResult>
      searchPlaceholder="Số ký hiệu, tiêu đề, trích yếu, nội dung…" emptyTitle="Không có hồ sơ" rowLabel={(r) => r.code}
      {...list} columns={columns} rows={results} getRowId={(r) => r.id}
      tabs={[{ value: "records", label: "Hồ sơ", count: counts?.records }, { value: "documents", label: "Tài liệu", count: counts?.documents }, { value: "ocr", label: "Nội dung (OCR)" }]}
      tab={mode} onTabChange={onModeChange} search={criteria.query} onSearchChange={(query) => set({ query })}
      advanced={(
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5"><Label htmlFor="arch-sign">Số ký hiệu</Label><Input id="arch-sign" value={criteria.signNo} onChange={(e) => set({ signNo: e.target.value })} placeholder="Ví dụ: 12/QĐ-ACME" /></div>
          <div className="grid gap-1.5"><Label>Khoảng thời gian</Label><DateRangePicker value={criteria.range} onChange={(range) => set({ range })} placeholder="Chọn khoảng thời gian" /></div>
        </div>
      )} />
  )
}
