import * as React from "react"
import { FileText, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge"
import { SignatureFlowStepper, type SignatureStep } from "./signature-flow-stepper"

export interface DocumentDetail {
  title: string
  number?: string
  archiveNo: string
  kind: string
  status: DocumentStatus
  summary: string
  meta: { label: string; value: string }[]
  attachments: { id: string; name: string; size: string }[]
  steps: SignatureStep[]
}

export interface DocumentDetailViewerProps {
  doc: DocumentDetail
  /** Page preview slot; a placeholder is rendered when omitted. */
  preview?: React.ReactNode
  canSign?: boolean
  onSign?: () => void
  onOpenAttachment?: (id: string) => void
  /** Extra action buttons (return, forward…) next to the sign button. */
  actions?: React.ReactNode
}

/** Detail view of a document: preview pane, metadata, attachments and the signature-flow stepper. */
export function DocumentDetailViewer({ doc, preview, canSign, onSign, onOpenAttachment, actions }: DocumentDetailViewerProps) {
  return (
    <div className="grid h-full min-h-0 gap-2 bg-background p-2 lg:grid-cols-[1fr_22rem]">
      <section className="flex min-h-0 flex-col gap-3 overflow-auto rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><h2 className="text-base font-bold">{doc.title}</h2><DocumentStatusBadge status={doc.status} /></div>
            <p className="font-mono text-xs text-muted-foreground">{doc.number ?? "Chưa cấp số"} · {doc.archiveNo} · {doc.kind}</p>
          </div>
          <div className="flex items-center gap-2">{actions}{canSign && <Button onClick={onSign}><PenLine />Ký số</Button>}</div>
        </header>
        <SignatureFlowStepper steps={doc.steps} className="rounded-md border bg-secondary/50 p-3" />
        <div className="flex min-h-64 flex-1 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
          {preview ?? <div className="flex flex-col items-center gap-2"><FileText className="size-10" /><span className="text-sm">Xem trước tệp PDF</span></div>}
        </div>
      </section>
      <aside className="flex min-h-0 flex-col gap-3 overflow-auto rounded-lg border bg-card p-4" aria-label="Thông tin văn bản">
        <h3 className="font-semibold">Trích yếu</h3>
        <p className="text-sm">{doc.summary}</p>
        <Separator />
        <dl className="grid gap-2 text-sm">
          {doc.meta.map((m) => <div key={m.label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{m.label}</dt><dd className="text-right font-medium">{m.value}</dd></div>)}
        </dl>
        <Separator />
        <h3 className="font-semibold">Tệp đính kèm</h3>
        <ul className="grid gap-1.5">
          {doc.attachments.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => onOpenAttachment?.(a.id)} className="flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm hover:bg-accent/40">
                <FileText className="size-4 text-primary" /><span className="flex-1 truncate">{a.name}</span><span className="text-xs text-muted-foreground">{a.size}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
