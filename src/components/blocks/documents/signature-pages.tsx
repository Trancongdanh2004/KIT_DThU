import * as React from "react"
import { Archive, CircleHelp, CirclePlus, FileText, FileUp, FolderOpen, PenLine, ShieldCheck, SquarePen, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DocumentListPage, DocumentPill, type DocumentListPageProps } from "./document-list-page"
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge"

/* ---- Ký văn bản (thiết lập ký số) ---- */

export type SignatureStampKind = "signature" | "seal" | "initial" | "text"

export interface SignatureStamp { id: string; name: string; meta: string; kind?: SignatureStampKind }

export interface SignatureHistoryItem { id: string; fileName: string; signedAt: string; mode: string }

export interface SignatureSetupPageProps {
  mode: string
  onModeChange?: (mode: string) => void
  fileName?: string
  onFiles?: (files: File[]) => void
  signerName: string
  signerOrg: string
  reason: string
  onReasonChange?: (v: string) => void
  stamps: SignatureStamp[]
  /** Placed signature positions; the sign button needs a file and at least one. */
  positionCount?: number
  onAddPosition?: (stampId: string) => void
  history?: SignatureHistoryItem[]
  onSign?: () => void
  className?: string
}

const stampKinds: { id: SignatureStampKind; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: "signature", label: "Chữ ký", icon: <PenLine />, tone: "text-[#2563eb]" }, { id: "seal", label: "Con dấu", icon: <CirclePlus />, tone: "text-[#dc2626]" },
  { id: "initial", label: "Ký nháy", icon: <SquarePen />, tone: "text-[#4f46e5]" }, { id: "text", label: "Văn bản", icon: <Type />, tone: "text-[#d97706]" },
]

/** Bordered segmented group of the reference (`do-seg`, 36px; active = navy fill). */
function SegSolid({ value, onChange, options, label, className, compact }: { value: string; onChange?: (v: string) => void; options: { value: string; label: string }[]; label: string; className?: string; compact?: boolean }) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex h-9 max-w-full flex-none overflow-x-auto overflow-y-hidden rounded-md border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange?.(o.value)}
          className={cn("inline-flex flex-none cursor-pointer items-center justify-center gap-1.5 border-0 border-r border-border whitespace-nowrap outline-none last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info",
            compact ? "flex-auto px-1.5 text-body font-semibold" : "px-[13px] text-control font-semibold",
            value === o.value ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Checklist item before the sign button: circle icon + 12.5px text in the faint grey of the reference (`sab-dk`). */
function StepCheck({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("inline-flex items-center gap-[5px] text-small", done ? "text-success" : "text-[#8b96a3]")}>
      <span aria-hidden className={cn("flex size-[15px] flex-none items-center justify-center rounded-full border", done ? "border-success bg-success text-primary-foreground" : "border-current")}>{done && <Check2 />}</span>
      {children}<span className="sr-only">{done ? " (đã xong)" : " (chưa)"}</span>
    </li>
  )
}
const Check2 = () => <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>

const section = "border-b border-border px-5 py-4"

/** "Ký văn bản" screen: PDF drop area on the left, a tabbed signing panel (setup / positions / history / verify) with the signature library on the right. */
export function SignatureSetupPage({ mode, onModeChange, fileName, onFiles, signerName, signerOrg, reason, onReasonChange, stamps, positionCount = 0, onAddPosition, history = [], onSign, className }: SignatureSetupPageProps) {
  const ready = Boolean(fileName) && positionCount > 0
  const [panel, setPanel] = React.useState("setup")
  const [kind, setKind] = React.useState<SignatureStampKind>("signature")
  const [over, setOver] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const shown = stamps.filter((s) => (s.kind ?? "signature") === kind)
  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-muted", className)}>
      <header className="flex h-[52px] flex-none items-center gap-4 border-b bg-card px-4 max-[640px]:min-h-0 max-[640px]:gap-1.5 max-[640px]:px-2 max-[640px]:py-1.5">
        <div className="flex min-w-[140px] items-center gap-2.5 max-[640px]:min-w-0">
          <span className="flex size-7 items-center justify-center rounded-[7px] bg-primary text-primary-foreground max-[640px]:hidden"><PenLine className="size-4" /></span>
          <h2 className="m-0 text-sm font-bold whitespace-nowrap text-primary">Ký văn bản</h2>
        </div>
        <div className="flex flex-1 justify-center max-[900px]:hidden">
          <SegSolid label="Hình thức ký" value={mode} onChange={onModeChange} options={[{ value: "internal", label: "Ký nội bộ" }, { value: "legal", label: "Ký pháp lý" }, { value: "org", label: "Ký Ban cơ yếu" }]} />
        </div>
        <div className="min-w-[140px] max-[640px]:min-w-0" />
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden max-[900px]:flex-col max-[900px]:overflow-y-auto">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden bg-muted max-[900px]:min-h-[40vh]">
          <div
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); onFiles?.(Array.from(e.dataTransfer.files)) }}
            className={cn("group/vd m-5 flex min-h-0 flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-card transition-[background,border-color,box-shadow] duration-200 outline-none hover:border-primary hover:bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))] focus-visible:border-primary", over && "border-primary bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))]")}
          >
            <input ref={input} type="file" accept="application/pdf" aria-label="Chọn tệp PDF cần ký" className="sr-only" tabIndex={-1} onChange={(e) => onFiles?.(Array.from(e.target.files ?? []))} />
            <div className="max-w-[360px] px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-accent text-primary transition-[transform,background] duration-200 group-hover/vd:-translate-y-[3px] group-hover/vd:bg-[color-mix(in_srgb,var(--primary)_16%,var(--card))] [&_svg]:size-7"><FileUp /></div>
              <h2 className="m-0 mb-1 text-base font-semibold text-foreground dark:text-foreground">{fileName ?? "Kéo thả file PDF vào đây"}</h2>
              <p className="m-0 mb-4 text-body text-muted-foreground">hoặc chọn file từ máy tính của bạn</p>
              <Button type="button" className="mx-auto" onClick={(e) => { e.stopPropagation(); input.current?.click() }}><FolderOpen />Chọn file PDF</Button>
              <div className="mt-4 flex justify-center gap-2 text-caption text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-[3px] dark:bg-muted"><FileText className="size-[13px]" />.pdf</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-[3px] dark:bg-muted"><Archive className="size-[13px]" />Tối đa 50 MB</span>
              </div>
            </div>
          </div>
        </div>
        <aside className="z-[5] flex w-[380px] min-w-[380px] flex-none flex-col border-l bg-card max-[900px]:w-full max-[900px]:min-w-0 max-[900px]:border-t max-[900px]:border-l-0" aria-label="Thiết lập ký">
          <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-border max-[640px]:px-3 max-[640px]:pb-4">
            <div className="flex-none border-b px-5 py-3 max-[640px]:px-0">
              <SegSolid className="flex w-full" compact label="Bảng điều khiển" value={panel} onChange={setPanel} options={[{ value: "setup", label: "Thiết lập" }, { value: "pos", label: "Vị trí" }, { value: "history", label: "Lịch sử" }, { value: "verify", label: "Xác thực" }]} />
            </div>
            {panel === "setup" && (
              <div>
                <section className={cn(section, "bg-secondary")}>
                  <ul className="m-0 mb-3 flex list-none flex-wrap gap-x-3.5 gap-y-1.5 p-0"><StepCheck done={Boolean(fileName)}>File PDF</StepCheck><StepCheck done={positionCount > 0}>Vị trí ký ({positionCount})</StepCheck></ul>
                  <Button disabled={!ready} onClick={onSign} className="h-10 w-full text-sm max-[640px]:hidden"><PenLine />Ký số nội bộ</Button>
                </section>
                <section className={section}>
                  <div className="mb-3 flex items-center gap-2.5 rounded-md border border-[color-mix(in_srgb,var(--success)_25%,var(--card))] bg-[color-mix(in_srgb,var(--success)_11%,var(--card))] px-3 py-2.5">
                    <span aria-hidden className="size-2 flex-none rounded-full bg-success" />
                    <div className="min-w-0"><div className="text-body font-semibold text-[color-mix(in_srgb,var(--success)_78%,#000)] dark:text-success">{signerName}</div><div className="truncate text-label text-muted-foreground">{signerOrg}</div></div>
                  </div>
                  <label htmlFor="sig-reason" className="mt-3 mb-1 block text-xs font-semibold text-muted-foreground">Lý do ký</label>
                  <input id="sig-reason" value={reason} onChange={(e) => onReasonChange?.(e.target.value)} placeholder="Ví dụ: Xác nhận văn bản / Phê duyệt" className="w-full rounded-md border bg-card px-2.5 py-[7px] text-body outline-none placeholder:text-subtle-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none focus:border-primary focus:shadow-focus-soft" />
                </section>
                <section className={cn(section, "border-b-0")}>
                  <div className="mb-2">
                    <div className="mb-2.5 flex flex-col gap-0.5"><span className="text-body font-bold text-foreground dark:text-foreground">Thư viện Chữ ký &amp; Mộc dấu</span><span className="text-caption text-muted-foreground">Chọn mẫu hoặc kéo thả vào trang tài liệu PDF</span></div>
                    <div role="tablist" aria-label="Loại mẫu" className="mb-3 grid w-full grid-cols-4 gap-0.5 rounded-lg bg-muted p-[3px] dark:bg-muted">
                      {stampKinds.map((k) => (
                        <button key={k.id} role="tab" type="button" aria-selected={kind === k.id} onClick={() => setKind(k.id)}
                          className={cn("flex min-w-0 cursor-pointer items-center justify-center gap-[3px] overflow-hidden rounded-md border-0 px-0.5 py-[5px] text-tiny font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring", kind === k.id ? "bg-card text-[#1d4ed8] shadow-[0_1px_3px_rgba(0,0,0,.08)] dark:text-primary" : "bg-transparent text-muted-foreground hover:bg-white/50 hover:text-foreground")}>
                          <span className={cn("flex flex-none items-center justify-center [&_svg]:size-3", k.tone)}>{k.icon}</span>
                          <span className="truncate text-micro whitespace-nowrap">{k.label}</span>
                          <span className={cn("flex-none rounded-lg px-1 text-micro leading-[1.3] font-bold", kind === k.id ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-muted text-[#475569]")}>{stamps.filter((st) => (st.kind ?? "signature") === k.id).length}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mb-2.5 rounded-lg border border-border bg-card p-3 shadow-[0_1px_3px_rgba(0,0,0,.02)] dark:border-border">
                      <div className="mb-2.5 text-tiny leading-[1.35] text-muted-foreground">Nhấp để đặt, kéo thả, chuột phải (⋮) để cấu hình</div>
                      <ul className="m-0 mb-3 grid list-none grid-cols-2 gap-2.5 p-0">
                        {shown.map((st) => (
                          <li key={st.id} className="min-w-0">
                            <button type="button" onClick={() => onAddPosition?.(st.id)} aria-label={`Đặt ${st.name} vào tài liệu`}
                              className="flex w-full min-w-0 cursor-pointer flex-col items-center overflow-hidden rounded-lg border-[1.5px] border-border bg-[#fafcff] px-1.5 py-2 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 outline-none hover:-translate-y-0.5 hover:border-[#3b82f6] hover:bg-card hover:shadow-[0_4px_12px_rgba(37,99,235,.12)] focus-visible:ring-2 focus-visible:ring-ring dark:bg-secondary">
                              <div className="mb-1.5 flex h-[60px] w-full items-center justify-center rounded-md border border-border bg-card p-1 text-primary dark:border-border"><PenLine className="size-6" aria-hidden /></div>
                              <div className="w-full min-w-0 text-center"><span className="block max-w-full truncate text-caption font-semibold text-foreground dark:text-foreground">{st.name}</span><span className="mt-0.5 block max-w-full truncate text-micro text-muted-foreground">{st.meta}</span></div>
                            </button>
                          </li>
                        ))}
                        {shown.length === 0 && <li className="col-span-2 py-4 text-center text-xs text-muted-foreground">Chưa có mẫu nào</li>}
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            )}
            {panel === "pos" && <div className="p-5 text-sm">{positionCount === 0 ? <p className="py-6 text-center text-muted-foreground">Chưa đặt vị trí ký nào. Chọn mẫu trong thư viện để đặt lên trang PDF.</p> : <p>Đã đặt {positionCount} vị trí ký.</p>}</div>}
            {panel === "history" && (
              <div className="p-5 text-sm">
                {history.length === 0 ? <p className="py-6 text-center text-muted-foreground">Chưa có lịch sử ký.</p> : (
                  <ul className="grid gap-2">{history.map((h) => <li key={h.id} className="rounded-md border p-2"><div className="font-semibold">{h.fileName}</div><div className="text-xs text-muted-foreground">{h.signedAt} · {h.mode}</div></li>)}</ul>
                )}
              </div>
            )}
            {panel === "verify" && <div className="p-5 text-sm"><p className="py-6 text-center text-muted-foreground">Tải tệp đã ký lên để xác thực chữ ký số.</p></div>}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ---- Xác nhận chữ ký số ---- */

export interface SignatureCheck { id: string; signer: string; signedAt: string; valid: boolean; modifiedAfter: boolean }

export interface SignatureVerifyPageProps {
  onFiles?: (files: File[]) => void
  fileName?: string
  results?: SignatureCheck[]
  className?: string
}

/** "Xác nhận chữ ký số": drop a PDF, see who signed, when, and whether it was altered afterwards. */
export function SignatureVerifyPage({ onFiles, fileName, results, className }: SignatureVerifyPageProps) {
  const input = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  return (
    <div className={cn("flex h-[calc(100%-34px)] min-h-[480px] flex-col overflow-hidden rounded-[10px] border border-[#e5eaf0] bg-[#f4f6f9] text-[#1f2a37] dark:border-border dark:bg-secondary dark:text-foreground max-[900px]:h-auto", className)}>
      <header className="flex h-14 flex-none items-center gap-3.5 border-b border-[#e5eaf0] bg-card px-5 dark:border-border max-[640px]:h-auto max-[640px]:flex-wrap max-[640px]:px-3.5 max-[640px]:py-2.5"><h1 className="m-0 text-base font-bold whitespace-nowrap text-accent-foreground dark:text-primary">Xác nhận chữ ký số</h1></header>
      <input ref={input} type="file" accept=".pdf,application/pdf" hidden onChange={(e) => onFiles?.(Array.from(e.target.files ?? []))} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto p-6">
        <div
          role="button" tabIndex={0} aria-label="Chọn hoặc kéo thả tệp PDF" onClick={() => input.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click() } }}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); onFiles?.(Array.from(e.dataTransfer.files)) }}
          className={cn("flex w-full max-w-[560px] cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-[#b9c6d3] bg-card px-8 py-14 text-center transition-[border-color,background-color] duration-150 outline-none hover:border-primary hover:bg-[#f0f6fb] focus-visible:border-primary dark:hover:bg-accent", over && "border-primary bg-[#f0f6fb] dark:bg-accent")}
        >
          <ShieldCheck className="size-12 text-[#295a7a] dark:text-primary" aria-hidden strokeWidth={2} />
          <strong className="text-base text-accent-foreground dark:text-primary">{fileName ?? "Kéo thả tệp PDF vào đây hoặc bấm để chọn"}</strong>
          <span className="max-w-[420px] text-body text-[#6b7785] dark:text-muted-foreground">Hệ thống đọc các chữ ký số trong tệp và cho biết ai ký, ký lúc nào, có bị sửa sau khi ký không. Tối đa 10MB.</span>
        </div>
        {results && (
          <ul className="grid w-full max-w-[560px] gap-2" aria-label="Kết quả xác nhận">
            {results.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border bg-card p-3 text-sm">
                <div><div className="font-semibold">{r.signer}</div><div className="text-xs text-muted-foreground">Ký lúc {r.signedAt}</div></div>
                <div className="flex gap-1.5">
                  <DocumentPill tone={r.valid ? "green" : "red"}>{r.valid ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ"}</DocumentPill>
                  <DocumentPill tone={r.modifiedAfter ? "amber" : "neutral"}>{r.modifiedAfter ? "Đã sửa sau khi ký" : "Không bị sửa"}</DocumentPill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

/* ---- Quản trị phân công ký ---- */

export interface SignatureAssignment {
  id: string; code: string; delegator: string; delegate: string; unit: string
  kind: string; from: string; to: string; status: DocumentStatus; reason: string
}

export interface SignatureAssignmentPageProps extends Omit<DocumentListPageProps<SignatureAssignment>, "columns" | "getRowId" | "primaryAction"> {
  scope: string
  onScopeChange?: (scope: string) => void
  onCreate?: () => void
  onHelp?: () => void
}

/** Admin list of signing delegations, with a "standing / all" scope switch. */
export function SignatureAssignmentPage({ scope, onScopeChange, onCreate, onHelp, ...rest }: SignatureAssignmentPageProps) {
  const columns = [
    { key: "code", header: "Mã", width: 120, cell: (r: SignatureAssignment) => <span className="font-mono text-body font-semibold text-primary">{r.code}</span> },
    { key: "delegator", header: "Người ủy quyền", width: 187, cell: (r: SignatureAssignment) => r.delegator },
    { key: "delegate", header: "Người nhận", width: 188, cell: (r: SignatureAssignment) => r.delegate },
    { key: "unit", header: "Đơn vị", width: 187, cell: (r: SignatureAssignment) => r.unit },
    { key: "kind", header: "Loại · Hình thức", width: 150, cell: (r: SignatureAssignment) => r.kind },
    { key: "range", header: "Từ – Đến", width: 180, cell: (r: SignatureAssignment) => <span className="text-xs whitespace-nowrap">{r.from} – {r.to}</span> },
    { key: "status", header: "Trạng thái", width: 130, cell: (r: SignatureAssignment) => <DocumentStatusBadge status={r.status} /> },
    { key: "reason", header: "Lý do", cell: (r: SignatureAssignment) => r.reason },
  ]
  return (
    <DocumentListPage
      searchPlaceholder="Mã, người ủy quyền, người nhận, đơn vị…" emptyTitle="Chưa có phân công ký" emptyDescription="Dữ liệu sẽ hiện ở đây khi có."
      emptyAction={<Button size="sm" onClick={onCreate}>Tạo phân công</Button>}
      pageSize={50} hideSearchKbd
      {...rest} columns={columns} getRowId={(r) => r.id} primaryAction={{ label: "Tạo phân công ký", onClick: onCreate }}
      toolbarExtra={<SegSolid label="Phạm vi" value={scope} onChange={onScopeChange} options={[{ value: "standing", label: "Phân công thường trực" }, { value: "all", label: "Tất cả ủy quyền" }]} />}
      extraActions={<Button variant="outline" size="toolbar-icon" className="text-muted-foreground hover:text-foreground" aria-label="Trợ giúp" onClick={onHelp}><CircleHelp /></Button>}
    />
  )
}
