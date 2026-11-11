"use client"

// @dthu/ui 0.2.0 · block-archive
import * as React from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { ArchiveTabs, archiveMono } from "./archive-shared"

export type FlowLockLevel = "fixed" | "config" | "free"
export interface FlowStep { id: string; label: string; code: string; lane: string; level: FlowLockLevel; docs?: number; hours?: number; returned?: boolean; next?: string[] }
export interface FlowLane { id: string; label: string }
export interface FlowOptions { showCounts: boolean; showCodes: boolean; showAllEdges: boolean; onlyConfigurable: boolean; showReturns: boolean }

export interface ArchiveStatusFlowPageProps {
  title?: string
  breadcrumb?: string[]
  processTabs: { value: string; label: string }[]
  process: string
  onProcessChange?: (v: string) => void
  view: "diagram" | "list"
  onViewChange?: (v: "diagram" | "list") => void
  lanes: FlowLane[]
  steps: FlowStep[]
  selectedId?: string
  onSelect?: (id: string | undefined) => void
  options: FlowOptions
  onOptionsChange?: (o: FlowOptions) => void
  layout: "lanes" | "free"
  onLayoutChange?: (l: "lanes" | "free") => void
  search?: string
  onSearchChange?: (v: string) => void
  zoom: number
  onZoomChange?: (z: number) => void
  errors?: number
  warnings?: number
  checked?: boolean
  dirty?: boolean
  canUndo?: boolean
  canRedo?: boolean
  onCheck?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onApply?: () => void
}

const LEVEL_LABEL: Record<FlowLockLevel, string> = { fixed: "CỨNG", config: "CẤU HÌNH", free: "TỰ DO" }
const LEVEL_BORDER: Record<FlowLockLevel, string> = { fixed: "border-foreground dark:border-foreground", config: "border-info dark:border-primary", free: "border-success" }

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase()

function StepCard({ step, o, selected, related, dim, onSelect }: { step: FlowStep; o: FlowOptions; selected: boolean; related: "next" | "prev" | null; dim: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`${step.label}, ${LEVEL_LABEL[step.level]}`}
      className={cn("relative block w-full cursor-pointer rounded-md border-[1.6px] bg-card px-2.5 py-1.5 text-left outline-none transition-opacity focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        step.returned ? "border-destructive" : LEVEL_BORDER[step.level], selected && "border-[3px] border-primary bg-accent", related === "next" && "ring-2 ring-primary", related === "prev" && "ring-2 ring-warning", dim && "opacity-30")}>
      <div className="truncate pr-4 text-small leading-tight font-semibold text-foreground">{step.label}</div>
      {o.showCodes && <div className="mt-0.5 font-mono text-tiny leading-tight text-muted-foreground">{step.code}</div>}
      <div className="mt-0.5 flex items-center gap-1.5 text-micro font-bold tracking-[0.04em] text-muted-foreground">
        {LEVEL_LABEL[step.level]}{step.hours !== undefined && <span className="inline-flex items-center gap-0.5 font-medium tracking-normal"><Clock aria-hidden className="size-2.5" />{step.hours} giờ</span>}
      </div>
      {o.showCounts && step.docs !== undefined && <span aria-label={`${step.docs} văn bản`} className="absolute top-1.5 right-2 font-mono text-tiny leading-none font-bold text-primary">{step.docs}</span>}
    </button>
  )
}

const OPTION_LABELS: { key: keyof FlowOptions; label: string }[] = [
  { key: "showCounts", label: "Số văn bản ở mỗi bước" },
  { key: "showCodes", label: "Mã trạng thái" },
  { key: "showAllEdges", label: "Hiện tất cả đường nối" },
  { key: "onlyConfigurable", label: "Chỉ cạnh cấu hình được" },
  { key: "showReturns", label: "Hiện đủ đường trả lại" },
]

const LEGEND: { label: string; swatch: string }[] = [
  { label: "Cứng — mã, vai trò, cạnh do code quyết định", swatch: "h-[11px] w-[18px] rounded-[3px] border-2 border-foreground dark:border-foreground" },
  { label: "Cấu hình — sửa cạnh / bật-tắt được", swatch: "h-[11px] w-[18px] rounded-[3px] border-2 border-info dark:border-primary" },
  { label: "Tự do — quản trị tự tạo, tự xóa", swatch: "h-[11px] w-[18px] rounded-[3px] border-2 border-success" },
  { label: "cạnh khóa", swatch: "w-[18px] border-b-2 border-foreground dark:border-foreground" },
  { label: "cạnh cấu hình được", swatch: "w-[18px] border-b-2 border-info dark:border-primary" },
  { label: "cạnh ngầm (code ghi thẳng)", swatch: "w-[18px] border-b-2 border-dashed border-subtle-foreground" },
  { label: "đường trả lại", swatch: "w-[18px] border-b-2 border-dashed border-destructive" },
]

const sectionTitle = "mt-3 mb-1 text-tiny font-bold tracking-[0.07em] text-muted-foreground uppercase"
const ctl = "h-[30px] px-2.5 text-small font-semibold"

/** Process & status designer (trạng thái): lane diagram of workflow steps with display options, legend and validation footer. */
export function ArchiveStatusFlowPage(p: ArchiveStatusFlowPageProps) {
  // The options panel starts collapsed on phones, where it overlays the diagram.
  const [panelOpen, setPanelOpen] = React.useState(() => typeof window === "undefined" || typeof window.matchMedia !== "function" || window.matchMedia("(min-width: 768px)").matches)
  const { steps, lanes, options: o } = p
  const q = norm(p.search ?? "")
  const matches = (s: FlowStep) => !q || norm(`${s.label} ${s.code}`).includes(q)
  const selected = steps.find((s) => s.id === p.selectedId)
  const nextIds = new Set(selected?.next ?? [])
  const prevIds = new Set(selected ? steps.filter((s) => s.next?.includes(selected.id)).map((s) => s.id) : [])
  const mainSteps = steps.filter((s) => !s.returned)
  const returned = steps.filter((s) => s.returned)
  const labelOf = (id: string) => steps.find((s) => s.id === id)?.label ?? id

  const listColumns: Column<FlowStep>[] = [
    { key: "label", header: "Bước", cell: (s) => <span className="font-medium">{s.label}</span> },
    { key: "code", header: "Mã", cell: (s) => archiveMono(s.code) },
    { key: "lane", header: "Chặng", cell: (s) => lanes.find((l) => l.id === s.lane)?.label ?? s.lane },
    { key: "level", header: "Mức khóa", cell: (s) => <Badge variant={s.level === "fixed" ? "secondary" : s.level === "config" ? "info" : "success"}>{LEVEL_LABEL[s.level]}</Badge> },
    { key: "hours", header: "SLA (giờ)", align: "right", cell: (s) => s.hours ?? "—" },
    { key: "next", header: "Đi tới", cell: (s) => s.next?.length ? s.next.map(labelOf).join(", ") : <span className="text-muted-foreground">—</span> },
  ]
  const lvlRows = o.onlyConfigurable ? steps.filter((s) => s.level !== "fixed") : steps

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <header className="flex shrink-0 flex-wrap items-center gap-2.5 border-b px-3 py-2.5">
        <div className="mr-1.5">
          <h2 className="m-0 text-base leading-tight font-bold text-foreground">{p.title ?? "Quy trình & Trạng thái"}</h2>
          <p className="m-0 text-xs text-muted-foreground">{(p.breadcrumb ?? ["Danh mục"]).join(" › ")}</p>
        </div>
        <ArchiveTabs label="Quy trình" items={p.processTabs} value={p.process} onValueChange={p.onProcessChange} />
        <ArchiveTabs label="Kiểu xem" items={[{ value: "diagram", label: "Sơ đồ" }, { value: "list", label: "Danh sách" }]} value={p.view} onValueChange={(v) => p.onViewChange?.(v as "diagram" | "list")} />
        <div className="flex flex-wrap items-center gap-2.5 md:ml-auto">
          <Button size="sm" variant="outline" className={cn(ctl, "text-muted-foreground hover:text-foreground disabled:text-subtle-foreground")} onClick={p.onCheck}>Kiểm tra</Button>
          <Button size="sm" variant="outline" className={cn(ctl, "text-muted-foreground hover:text-foreground disabled:text-subtle-foreground disabled:opacity-100")} disabled={!p.canUndo} onClick={p.onUndo}>Hoàn tác</Button>
          <Button size="sm" variant="outline" className={cn(ctl, "text-muted-foreground hover:text-foreground disabled:text-subtle-foreground disabled:opacity-100")} disabled={!p.canRedo} onClick={p.onRedo}>Làm lại</Button>
          <Button size="sm" className={cn(ctl, "disabled:border-border-strong disabled:bg-border-strong disabled:opacity-100")} disabled={!p.dirty} onClick={p.onApply}>Áp dụng</Button>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-1">
        {panelOpen && (
          <aside aria-label="Tùy chọn sơ đồ" className="relative w-[236px] shrink-0 overflow-x-hidden overflow-y-auto border-r bg-card max-md:absolute max-md:inset-0 max-md:z-20 max-md:w-full max-md:border-r-0">
            <Button variant="outline" size="icon" className="absolute top-3 right-2.5 z-[2] size-8 bg-[color-mix(in_srgb,var(--secondary)_60%,var(--card))] text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-primary" aria-label="Thu gọn bảng tùy chọn" onClick={() => setPanelOpen(false)}><ChevronLeft className="size-[18px] stroke-[2.25]" /></Button>
            <div className="px-3.5 pt-2.5 pb-4">
              <div className="mt-1.5 mb-1.5 w-[calc(100%-38px)] min-w-0">
                <SearchInput kbd={false} containerClassName="min-w-0 max-w-none basis-auto" value={p.search ?? ""} onChange={(e) => p.onSearchChange?.(e.target.value)} placeholder="Tìm mã hoặc tên…" aria-label="Tìm bước" />
              </div>
              <h3 className={sectionTitle}>Hiển thị</h3>
              <ul className="m-0 list-none p-0">
                {OPTION_LABELS.map((it) => (
                  <li key={it.key} className="flex items-center justify-between gap-2 py-[5px]">
                    <span id={`flow-opt-${it.key}`} className="text-small font-medium">{it.label}</span>
                    <Switch aria-labelledby={`flow-opt-${it.key}`} checked={o[it.key]} onCheckedChange={(v) => p.onOptionsChange?.({ ...o, [it.key]: v })} />
                  </li>
                ))}
              </ul>
              <h3 className={cn(sectionTitle, "mt-4")}>Bố cục</h3>
              <ArchiveTabs variant="pill" label="Bố cục" items={[{ value: "lanes", label: "Theo chặng" }, { value: "free", label: "Tự do" }]} value={p.layout} onValueChange={(v) => p.onLayoutChange?.(v as "lanes" | "free")} />
              <h3 className={sectionTitle}>Mức khóa</h3>
              <ul className="m-0 list-none p-0 text-label text-muted-foreground">
                {LEGEND.map((l) => <li key={l.label} className="flex items-center gap-[7px] py-0.5"><span aria-hidden className={cn("shrink-0", l.swatch)} />{l.label}</li>)}
              </ul>
              <h3 className={sectionTitle}>Thêm trạng thái</h3>
              <Button size="sm" variant="outline" className="h-[30px] px-2.5 text-small font-semibold" disabled>+ Thêm bước</Button>
              <p className="mt-1.5 mb-0 text-label leading-[1.45] text-subtle-foreground">Quy trình này do hệ thống điều khiển: không thêm được bước mới.</p>
            </div>
          </aside>
        )}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {!panelOpen && <Button variant="outline" size="icon" className="absolute top-3 left-2.5 z-10 size-8 text-muted-foreground" aria-label="Mở bảng tùy chọn" onClick={() => setPanelOpen(true)}><ChevronRight className="size-[18px] stroke-[2.25]" /></Button>}
          {p.view === "list" ? (
            <div className="flex min-h-0 flex-1 flex-col p-3"><DataTable columns={listColumns} rows={lvlRows.filter(matches)} getRowId={(s) => s.id} onRowClick={(s) => p.onSelect?.(s.id)} emptyTitle="Không có bước nào" /></div>
          ) : (
            <div className="relative min-h-0 flex-1 overflow-auto bg-secondary bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:18px_18px]">
              <div className="pointer-events-none absolute top-2.5 left-1/2 z-[1] -translate-x-1/2">
                <p aria-live="polite" className="m-0 rounded-full border bg-card/90 px-3 py-[3px] text-center text-xs whitespace-nowrap text-muted-foreground max-md:whitespace-normal max-md:rounded-2xl">
                  {selected ? <>Bước <b className="text-foreground">{selected.label}</b>: vào từ {prevIds.size ? [...prevIds].map(labelOf).join(", ") : "—"}; đi ra {nextIds.size ? [...nextIds].map(labelOf).join(", ") : "—"}</> : "Rê chuột hoặc bấm vào một bước để xem luồng đi vào / đi ra"}
                </p>
              </div>
              <div className="origin-top-left px-10 pt-[190px] pb-24" style={{ transform: `scale(${p.zoom / 100})`, width: `${10000 / p.zoom}%` }}>
                {p.layout === "lanes" ? (
                  <div className="flex gap-4">
                    {lanes.map((l) => {
                      const items = mainSteps.filter((s) => s.lane === l.id && (!o.onlyConfigurable || s.level !== "fixed" || s.id === p.selectedId))
                      return (
                        <section key={l.id} aria-label={l.label} className="min-h-[394px] min-w-[150px] flex-1 rounded-md border border-border bg-card/70 px-[14px] pt-3 pb-4 dark:border-border">
                          <h3 className="m-0 mb-[14px] text-center text-xs font-bold tracking-[0.02em] text-muted-foreground">{l.label}</h3>
                          <div className="grid gap-[42px]">
                            {items.map((s) => <StepCard key={s.id} step={s} o={o} selected={s.id === p.selectedId} related={nextIds.has(s.id) ? "next" : prevIds.has(s.id) ? "prev" : null} dim={!matches(s)} onSelect={() => p.onSelect?.(s.id === p.selectedId ? undefined : s.id)} />)}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                ) : (
                  <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
                    {mainSteps.map((s) => <li key={s.id} className="w-40"><StepCard step={s} o={o} selected={s.id === p.selectedId} related={nextIds.has(s.id) ? "next" : prevIds.has(s.id) ? "prev" : null} dim={!matches(s)} onSelect={() => p.onSelect?.(s.id === p.selectedId ? undefined : s.id)} /></li>)}
                  </ul>
                )}
                {returned.length > 0 && (
                  <section aria-label="Bị trả lại" className="mt-6 rounded-md border border-dashed border-[#efc5c1] bg-destructive/[.03] px-4 pt-2 pb-4 dark:border-destructive/50">
                    <h3 className="m-0 mb-3 text-xs font-bold text-muted-foreground">Bị trả lại</h3>
                    <div className="flex flex-wrap gap-4">{returned.map((s) => <div key={s.id} className="w-40"><StepCard step={s} o={o} selected={s.id === p.selectedId} related={nextIds.has(s.id) ? "next" : prevIds.has(s.id) ? "prev" : null} dim={!matches(s)} onSelect={() => p.onSelect?.(s.id === p.selectedId ? undefined : s.id)} /></div>)}</div>
                  </section>
                )}
              </div>
              <div className="sticky bottom-3 left-3 ml-3 inline-flex items-center gap-0.5 rounded-md border bg-card p-0.5 shadow-[0_1px_2px_rgba(22,32,43,.08)]">
                <button type="button" className="h-[26px] min-w-7 cursor-pointer rounded text-sm text-foreground hover:bg-muted disabled:opacity-40" aria-label="Thu nhỏ" title="Thu nhỏ" disabled={p.zoom <= 50} onClick={() => p.onZoomChange?.(Math.max(50, p.zoom - 10))}>−</button>
                <span className="min-w-[38px] text-center font-mono text-label text-muted-foreground" aria-live="polite">{p.zoom}%</span>
                <button type="button" className="h-[26px] min-w-7 cursor-pointer rounded text-sm text-foreground hover:bg-muted disabled:opacity-40" aria-label="Phóng to" title="Phóng to" disabled={p.zoom >= 150} onClick={() => p.onZoomChange?.(Math.min(150, p.zoom + 10))}>+</button>
                <button type="button" className="h-[26px] cursor-pointer rounded px-2 text-small text-foreground hover:bg-muted" title="Đưa cả sơ đồ vào khung" onClick={() => p.onZoomChange?.(100)}>⤢ Vừa</button>
              </div>
            </div>
          )}
          <footer className="flex min-h-9 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t bg-card px-3 py-1.5 text-small">
            <span className="font-bold text-success">✔ {p.errors ?? 0} lỗi</span>
            <span className="font-semibold text-warning">⚠ {p.warnings ?? 0} cảnh báo</span>
            <span className="text-muted-foreground">{p.checked ? "Đã kiểm tra" : "Chưa kiểm tra"}</span>
            <span className="text-muted-foreground md:ml-auto">{p.dirty ? "Có thay đổi chưa áp dụng" : "Không có thay đổi"}</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
