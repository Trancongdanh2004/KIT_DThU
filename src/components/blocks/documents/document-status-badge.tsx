import { DocumentPill } from "./document-list-page"

export type DocumentStatusTone = "default" | "secondary" | "info" | "success" | "warning" | "destructive" | "outline"

export type DocumentStatus =
  | "draft" | "internal-review" | "leader-review" | "signing" | "issued" | "received"
  | "processing" | "overdue" | "rejected" | "archived" | "revoked"

export const documentStatusMeta: Record<DocumentStatus, { label: string; tone: DocumentStatusTone }> = {
  draft: { label: "Nháp", tone: "secondary" },
  "internal-review": { label: "Ký / duyệt nội bộ", tone: "info" },
  "leader-review": { label: "Trình lãnh đạo", tone: "warning" },
  signing: { label: "Chờ ký số", tone: "warning" },
  issued: { label: "Đã ban hành", tone: "success" },
  received: { label: "Đã tiếp nhận", tone: "info" },
  processing: { label: "Đang xử lý", tone: "info" },
  overdue: { label: "Quá hạn", tone: "destructive" },
  rejected: { label: "Trả lại", tone: "destructive" },
  archived: { label: "Đã lưu", tone: "success" },
  revoked: { label: "Thu hồi", tone: "outline" },
}

const pillTone = { default: "navy", info: "navy", warning: "amber", success: "green", destructive: "red", secondary: "neutral", outline: "neutral" } as const

export interface DocumentStatusBadgeProps { status: DocumentStatus; label?: string; className?: string }

/** Single source of truth for how a document status is coloured and worded across every document list (reference `do-pill`). */
export function DocumentStatusBadge({ status, label, className }: DocumentStatusBadgeProps) {
  const meta = documentStatusMeta[status]
  return <DocumentPill tone={pillTone[meta.tone]} className={className}>{label ?? meta.label}</DocumentPill>
}
