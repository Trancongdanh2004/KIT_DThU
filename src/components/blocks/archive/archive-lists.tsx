import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { ArchiveListPage, type ArchiveListPageProps } from "./archive-list-page"
import { archiveMono, type ArchiveColumn } from "./archive-shared"

type StatusTone = "success" | "warning" | "destructive" | "info" | "secondary"
export interface ArchiveStatus { label: string; tone: StatusTone }
export const archiveStatus = (s: ArchiveStatus) => <Badge variant={s.tone}>{s.label}</Badge>
const bold = (v: React.ReactNode) => <span className="font-medium">{v}</span>

type ListProps<T> = Omit<ArchiveListPageProps<T>, "columns" | "getRowId">

// ---- Borrow / return
export interface ArchiveLoan { id: string; no: string; record: string; borrower: string; form: string; due: string; unit?: string; status: ArchiveStatus }
const loanColumns: ArchiveColumn<ArchiveLoan>[] = [
  { key: "no", header: "Số phiếu", width: 140, cell: (r) => archiveMono(r.no) },
  { key: "record", header: "Hồ sơ mượn", cell: (r) => bold(r.record) },
  { key: "borrower", header: "Người mượn", width: 200, cell: (r) => r.borrower },
  { key: "form", header: "Hình thức", width: 130, cell: (r) => r.form },
  { key: "due", header: "Hạn trả", width: 128, cell: (r) => r.due },
  { key: "status", header: "Trạng thái", width: 124, cell: (r) => archiveStatus(r.status) },
]
/** Borrow/return tracking (mượn - trả). */
export function ArchiveBorrowPage(props: ListProps<ArchiveLoan>) {
  return <ArchiveListPage<ArchiveLoan> searchPlaceholder="Tìm số phiếu, người mượn, lý do…" actionLabel="Đăng ký mượn" emptyTitle="Chưa có phiếu mượn" rowLabel={(r) => r.no} {...props} columns={loanColumns} getRowId={(r) => r.id} />
}

// ---- Destruction review
export interface ArchiveDestruction { id: string; code: string; title: string; year: number; records: number; step: string; status: ArchiveStatus }
const destructionColumns: ArchiveColumn<ArchiveDestruction>[] = [
  { key: "code", header: "Mã đợt", width: 150, cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Tiêu đề", cell: (r) => bold(r.title) },
  { key: "year", header: "Năm", width: 66, align: "center", cell: (r) => r.year },
  { key: "records", header: "Số hồ sơ", width: 90, align: "right", cell: (r) => r.records },
  { key: "step", header: "Bước", width: 210, cell: (r) => r.step },
  { key: "status", header: "Trạng thái", width: 160, cell: (r) => archiveStatus(r.status) },
]
/** Destruction review (xét hủy): batches. */
export function ArchiveDestructionPage(props: ListProps<ArchiveDestruction>) {
  return <ArchiveListPage<ArchiveDestruction> searchPlaceholder="Tìm mã đợt, tiêu đề, số quyết định…" actionLabel="Lập đợt xét hủy" emptyTitle="Chưa có đợt xét hủy" rowLabel={(r) => r.code} {...props} columns={destructionColumns} getRowId={(r) => r.id} />
}

/** Records whose retention period is over (second tab of the destruction screen). */
export interface ArchiveDueRecord { id: string; code: string; title: string; year: number; retention: string; expired: string }
const dueColumns: ArchiveColumn<ArchiveDueRecord>[] = [
  { key: "code", header: "Mã hồ sơ", cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Tiêu đề", cell: (r) => bold(r.title) },
  { key: "year", header: "Năm", cell: (r) => r.year },
  { key: "retention", header: "Thời hạn", cell: (r) => r.retention },
  { key: "expired", header: "Hết hạn từ", cell: (r) => r.expired },
]
export function ArchiveDueRecordsPage(props: ListProps<ArchiveDueRecord>) {
  return <ArchiveListPage<ArchiveDueRecord> searchPlaceholder="Tìm mã, tiêu đề…" emptyTitle="Chưa có hồ sơ đến hạn xét hủy" rowLabel={(r) => r.code} {...props} columns={dueColumns} getRowId={(r) => r.id} />
}

// ---- Submission (nộp lưu)
export interface ArchiveSubmission { id: string; no: string; title: string; records: number; date: string; unit?: string; status: ArchiveStatus }
const submissionColumns: ArchiveColumn<ArchiveSubmission>[] = [
  { key: "no", header: "Số phiếu", width: 150, cell: (r) => archiveMono(r.no) },
  { key: "title", header: "Tiêu đề đợt nộp", cell: (r) => bold(r.title) },
  { key: "records", header: "Hồ sơ", width: 110, align: "center", cell: (r) => r.records },
  { key: "date", header: "Ngày lập", width: 104, cell: (r) => r.date },
  { key: "status", header: "Trạng thái", width: 150, cell: (r) => archiveStatus(r.status) },
]
/** Submission slips (nộp lưu). */
export function ArchiveSubmissionPage(props: ListProps<ArchiveSubmission>) {
  return <ArchiveListPage<ArchiveSubmission> searchPlaceholder="Tìm số phiếu, tiêu đề, người giao, đơn vị…" actionLabel="Lập phiếu nộp lưu" emptyTitle="Không có phiếu nộp lưu" rowLabel={(r) => r.no} {...props} columns={submissionColumns} getRowId={(r) => r.id} />
}

// ---- Submission deadlines (nộp lưu lịch sử)
export interface ArchiveDeadline { id: string; code: string; title: string; year: number; form: string; due: string; slip?: string }
const deadlineColumns: ArchiveColumn<ArchiveDeadline>[] = [
  { key: "code", header: "Mã hồ sơ", width: 170, cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Tiêu đề", cell: (r) => bold(r.title) },
  { key: "year", header: "Năm", width: 66, align: "center", cell: (r) => r.year },
  { key: "form", header: "Dạng", width: 100, cell: (r) => r.form },
  { key: "due", header: "Hạn nộp", width: 180, cell: (r) => r.due },
  { key: "slip", header: "Phiếu", width: 150, cell: (r) => r.slip ? archiveMono(r.slip) : <span className="text-muted-foreground">Chưa có phiếu</span> },
]
/** Records due for submission with registration slips. */
export function ArchiveDeadlinePage(props: ListProps<ArchiveDeadline>) {
  return <ArchiveListPage<ArchiveDeadline> searchPlaceholder="Tìm mã, tiêu đề, đơn vị…" actionLabel="Lập phiếu đăng ký" emptyTitle="Chưa có hồ sơ đến hạn" rowLabel={(r) => r.code} actionsColumn {...props} columns={deadlineColumns} getRowId={(r) => r.id} />
}

/** Registration slips (second tab of the submission-history screen). */
export interface ArchiveRegistration { id: string; no: string; title: string; records: number; date: string; status: ArchiveStatus }
const registrationColumns: ArchiveColumn<ArchiveRegistration>[] = [
  { key: "no", header: "Số phiếu", cell: (r) => archiveMono(r.no) },
  { key: "title", header: "Tiêu đề", cell: (r) => bold(r.title) },
  { key: "records", header: "Hồ sơ", cell: (r) => r.records },
  { key: "date", header: "Ngày lập", cell: (r) => r.date },
  { key: "status", header: "Trạng thái", cell: (r) => archiveStatus(r.status) },
]
export function ArchiveRegistrationPage(props: ListProps<ArchiveRegistration>) {
  return <ArchiveListPage<ArchiveRegistration> searchPlaceholder="Tìm mã, tiêu đề, đơn vị…" actionLabel="Lập phiếu đăng ký" emptyTitle="Chưa có phiếu đăng ký" rowLabel={(r) => r.no} {...props} columns={registrationColumns} getRowId={(r) => r.id} />
}

// ---- Fonds (danh mục phòng)
export interface ArchiveFondsRow { id: string; code: string; name: string; description?: string; period?: string; stages: number; status: ArchiveStatus }
const fondsColumns: ArchiveColumn<ArchiveFondsRow>[] = [
  { key: "code", header: "Mã phòng", width: 140, cell: (r) => archiveMono(r.code) },
  { key: "name", header: "Tên phòng", cell: (r) => (<div><div className="font-medium">{r.name}</div>{r.description && <div className="max-w-xl truncate text-xs text-muted-foreground">{r.description}</div>}</div>) },
  { key: "period", header: "Thời gian", width: 150, cell: (r) => r.period ?? <span className="text-muted-foreground">—</span> },
  { key: "stages", header: "Giai đoạn", width: 100, align: "center", cell: (r) => r.stages },
  { key: "status", header: "Trạng thái", width: 120, cell: (r) => archiveStatus(r.status) },
]
/** Fonds admin list (danh mục phòng). Tabs for TOC / retention periods / topic types are supplied by the caller. */
export function ArchiveFondsPage(props: ListProps<ArchiveFondsRow>) {
  return <ArchiveListPage<ArchiveFondsRow> searchPlaceholder="Tìm mã, tên phòng…" actionLabel="Thêm phòng" emptyTitle="Chưa có phòng" rowLabel={(r) => r.name} {...props} columns={fondsColumns} getRowId={(r) => r.id} />
}

/** Generic name/code/note row for the fonds sub-tabs (mục lục, thời hạn bảo quản, loại hồ sơ chuyên đề). */
export interface ArchiveRefRow { id: string; code: string; name: string; note?: string }
const refColumns: ArchiveColumn<ArchiveRefRow>[] = [
  { key: "code", header: "Mã", cell: (r) => archiveMono(r.code) },
  { key: "name", header: "Tên", cell: (r) => bold(r.name) },
  { key: "note", header: "Ghi chú", cell: (r) => r.note ?? <span className="text-muted-foreground">—</span> },
]
export function ArchiveRefPage(props: ListProps<ArchiveRefRow> & { addLabel?: string }) {
  const { addLabel = "Thêm mới", ...rest } = props
  return <ArchiveListPage<ArchiveRefRow> searchPlaceholder="Tìm mã, tên…" actionLabel={addLabel} emptyTitle="Chưa có dữ liệu" rowLabel={(r) => r.name} {...rest} columns={refColumns} getRowId={(r) => r.id} />
}

// ---- Access log (quản trị)
export interface ArchiveAuditRow { id: string; date: string; actor: string; action: string; detail: string; result: ArchiveStatus; hash: string }
const auditColumns: ArchiveColumn<ArchiveAuditRow>[] = [
  { key: "date", header: "Ngày", width: 104, cell: (r) => r.date },
  { key: "actor", header: "Người thực hiện", width: 220, cell: (r) => r.actor },
  { key: "action", header: "Thao tác", width: 160, cell: (r) => r.action },
  { key: "detail", header: "Chi tiết", cell: (r) => r.detail },
  { key: "result", header: "Kết quả", width: 120, cell: (r) => archiveStatus(r.result) },
  { key: "hash", header: "Mã băm", width: 130, cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.hash}</span> },
]
/** Access log list (embed inside ArchiveAdminPage with `bare`). */
export function ArchiveAuditPage(props: ListProps<ArchiveAuditRow>) {
  return <ArchiveListPage<ArchiveAuditRow> searchPlaceholder="Tìm chi tiết, người, đơn vị…" emptyTitle="Không có bản ghi" {...props} columns={auditColumns} getRowId={(r) => r.id} />
}

/** Generic administrative rows (integrity checks, change orders, incidents, media, backups). */
export interface ArchiveAdminRow { id: string; code: string; title: string; owner: string; date: string; status: ArchiveStatus }
const adminColumns: ArchiveColumn<ArchiveAdminRow>[] = [
  { key: "code", header: "Mã", cell: (r) => archiveMono(r.code) },
  { key: "title", header: "Nội dung", cell: (r) => bold(r.title) },
  { key: "owner", header: "Phụ trách", cell: (r) => r.owner },
  { key: "date", header: "Ngày", width: 104, cell: (r) => r.date },
  { key: "status", header: "Trạng thái", cell: (r) => archiveStatus(r.status) },
]
export function ArchiveAdminListPage(props: ListProps<ArchiveAdminRow>) {
  return <ArchiveListPage<ArchiveAdminRow> searchPlaceholder="Tìm mã, nội dung…" emptyTitle="Không có bản ghi" rowLabel={(r) => r.code} {...props} columns={adminColumns} getRowId={(r) => r.id} />
}
