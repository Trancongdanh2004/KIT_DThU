import * as React from "react"
import { ArrowLeft, Check, FileClock, Save, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { AttachmentList, DocumentDropzone, formatFileSize } from "./document-dropzone"
import { CardField, ComposeCard, ComposeColumns, ComposeHeader, ComposeSegmented, ComposeSelect, type ComposeOption } from "./compose-parts"

export interface IncomingDocumentValues {
  attachments: { id: string; name: string; size?: string }[]
  system: string
  type: string
  /** "Số văn bản đến (Số đến)" — the symbol on the received document. */
  incomingNo: string
  summary: string
  issuedOn?: Date
  receivedOn?: Date
  senderBlock: string
  sender: string
  field: string
  priority: string
  security: string
  /** Right panel: registration. */
  archiveNo: string
  receiveStatus: string
  level: string
  dueOn?: Date
  forwardedOn?: Date
  note: string
  folder: string
  paperLocation: string
  /** "Hình thức nhận" (e.g. electronic, paper). */
  receiveMethod?: string
}

export type IncomingDocumentErrors = Partial<Record<"attachments" | "type" | "incomingNo" | "summary" | "issuedOn" | "receivedOn" | "receiveStatus" | "level", string>>

export function validateIncomingDocument(v: IncomingDocumentValues): IncomingDocumentErrors {
  const e: IncomingDocumentErrors = {}
  if (v.attachments.length === 0) e.attachments = "Tải lên ít nhất một tệp văn bản đến."
  if (!v.type) e.type = "Chọn loại văn bản."
  if (!v.incomingNo.trim()) e.incomingNo = "Nhập số văn bản đến."
  if (!v.summary.trim()) e.summary = "Nhập trích yếu nội dung."
  if (!v.issuedOn) e.issuedOn = "Chọn ngày ban hành."
  if (!v.receivedOn) e.receivedOn = "Chọn ngày nhận văn bản."
  if (!v.receiveStatus) e.receiveStatus = "Chọn trạng thái tiếp nhận."
  if (!v.level) e.level = "Chọn cấp văn bản."
  return e
}

export interface DocumentIncomingFormProps {
  values: IncomingDocumentValues
  onChange: (v: IncomingDocumentValues) => void
  typeOptions: ComposeOption[]
  senderBlockOptions: ComposeOption[]
  senderOptions: ComposeOption[]
  fieldOptions: ComposeOption[]
  priorityOptions: ComposeOption[]
  securityOptions: ComposeOption[]
  receiveStatusOptions: ComposeOption[]
  levelOptions: ComposeOption[]
  receiveMethodOptions?: ComposeOption[]
  folderOptions: ComposeOption[]
  onBack?: () => void
  onDrafts?: () => void
  onSaveDraft?: () => void
  /** Called only when validation passes. */
  onSubmit?: () => void
  onInvalid?: (errors: IncomingDocumentErrors) => void
  maxSummary?: number
  className?: string
}

/** "Đăng ký văn bản đến": register an incoming document — attachments, document info, sender & classification, and the registration panel. */
export function DocumentIncomingForm({
  values, onChange, typeOptions, senderBlockOptions, senderOptions, fieldOptions, priorityOptions, receiveStatusOptions, levelOptions, receiveMethodOptions = [], folderOptions,
  onBack, onDrafts, onSaveDraft, onSubmit, onInvalid, maxSummary = 1000, className,
}: DocumentIncomingFormProps) {
  const [submitted, setSubmitted] = React.useState(false)
  const errors = submitted ? validateIncomingDocument(values) : {}
  const set = <K extends keyof IncomingDocumentValues>(k: K, v: IncomingDocumentValues[K]) => onChange({ ...values, [k]: v })
  const submit = () => {
    setSubmitted(true)
    const e = validateIncomingDocument(values)
    if (Object.keys(e).length > 0) onInvalid?.(e)
    else onSubmit?.()
  }
  const err = (id: string, m?: string) => (m ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {})
  const sectionRow = "grid grid-cols-1 gap-3.5 md:grid-cols-2"
  return (
    <div className={cn("h-full min-h-0 overflow-auto pb-[26px] text-body text-foreground", className)}>
      <ComposeHeader title="Đăng ký văn bản đến">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft />Quay lại</Button>
        <Button variant="outline" size="sm" onClick={onDrafts}><FileClock />Bản nháp</Button>
        <Button variant="outline" size="sm" onClick={onSaveDraft}><Save />Lưu nháp</Button>
        <Button size="sm" onClick={submit}><Check />Lưu &amp; Vào số</Button>
      </ComposeHeader>
      <ComposeColumns>
        <div className="min-w-0">
          <ComposeCard n={1} title="Tệp đính kèm văn bản đến" required label="Tệp đính kèm" hint="Tải lên văn bản gốc (PDF, scan) và các tệp phụ lục đính kèm">
            <DocumentDropzone
              multiple accept="*/*" aria-label="Chọn hoặc kéo thả tệp văn bản đến" title={<>Kéo thả tệp vào đây hoặc bấm để chọn <span className="font-semibold text-primary group-hover/dz:underline">chọn từ máy tính</span></>}
              hint="Nhận PDF, Word, Excel, hình ảnh, file nén (tối đa 100MB)"
              onFiles={(files) => set("attachments", [...values.attachments, ...files.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, size: formatFileSize(f.size) }))])}
            />
            <AttachmentList items={values.attachments} onRemove={(id) => set("attachments", values.attachments.filter((a) => a.id !== id))} />
            {errors.attachments && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.attachments}</p>}
          </ComposeCard>
          <ComposeCard n={2} title="Thông tin văn bản đến" required label="Thông tin văn bản đến" hint="Số văn bản, trích yếu và thời gian tiếp nhận">
            <div className="mb-3 flex items-center gap-3"><Label className="mb-0">Hệ văn bản</Label><ComposeSegmented size="md" label="Hệ văn bản" value={values.system} onChange={(v) => set("system", v)} options={[{ value: "admin", label: "Hành chính" }, { value: "party", label: "Đảng" }]} /></div>
            <div className={cn(sectionRow, "mb-3")}>
              <CardField label="Loại văn bản" required htmlFor="inc-type" error={errors.type} last><ComposeSelect id="inc-type" value={values.type} onChange={(v) => set("type", v)} options={typeOptions} placeholder="Chọn loại văn bản" invalid={Boolean(errors.type)} /></CardField>
              <CardField label="Số văn bản đến (Số đến)" required htmlFor="inc-no" error={errors.incomingNo} last>
                <Input id="inc-no" value={values.incomingNo} onChange={(e) => set("incomingNo", e.target.value)} placeholder="Nhập số văn bản đến..." {...err("inc-no", errors.incomingNo)} />
              </CardField>
            </div>
            <div className="mb-3 flow-root">
              <div className="mb-1 flex items-baseline justify-between"><Label htmlFor="inc-summary" className="mb-0">Trích yếu nội dung <span className="font-bold text-destructive" aria-hidden>*</span></Label><span className="text-caption text-subtle-foreground">{values.summary.length} / {maxSummary}</span></div>
              <Textarea id="inc-summary" rows={3} maxLength={maxSummary} value={values.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Nhập hoặc dán trích yếu nội dung văn bản đến..." className="mb-[5.8px] min-h-[62px] leading-normal" {...err("inc-summary", errors.summary)} />
              {errors.summary && <p id="inc-summary-error" role="alert" className="mt-1 mb-0 text-xs text-destructive">{errors.summary}</p>}
            </div>
            <div className={sectionRow}>
              <CardField label="Ngày ban hành" required last error={errors.issuedOn}>
                <DatePicker aria-label="Ngày ban hành" placeholder="Chọn ngày ban hành" value={values.issuedOn} onChange={(d) => set("issuedOn", d)} />
              </CardField>
              <CardField label="Ngày nhận văn bản" required last error={errors.receivedOn}>
                <DatePicker aria-label="Ngày nhận văn bản" placeholder="Chọn ngày nhận" value={values.receivedOn} onChange={(d) => set("receivedOn", d)} />
              </CardField>
            </div>
          </ComposeCard>
          <ComposeCard n={3} title="Cơ quan gửi & Phân loại" label="Cơ quan gửi và phân loại" hint="Thông tin nguồn gửi, lĩnh vực chuyên môn và mức độ tính chất">
            <div className={cn(sectionRow, "mb-3")}>
              <CardField label="Cơ quan gửi" required htmlFor="inc-sender" last>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1"><ComposeSelect id="inc-sender" value={values.sender} onChange={(v) => set("sender", v)} options={senderOptions} placeholder="Gõ tên hoặc mã cơ quan gửi để tìm" /></div>
                  <Button type="button" variant="outline"><Search />Tìm / thêm</Button>
                </div>
              </CardField>
              <CardField label="Khối cơ quan gửi" htmlFor="inc-block" last><ComposeSelect id="inc-block" value={values.senderBlock} onChange={(v) => set("senderBlock", v)} options={senderBlockOptions} placeholder="Chọn khối cơ quan" /></CardField>
            </div>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              <CardField label="Lĩnh vực" htmlFor="inc-field" last><ComposeSelect id="inc-field" value={values.field} onChange={(v) => set("field", v)} options={fieldOptions} placeholder="Chọn lĩnh vực" /></CardField>
              <CardField label="Hình thức nhận" required htmlFor="inc-method" last><ComposeSelect id="inc-method" clearable value={values.receiveMethod ?? ""} onChange={(v) => set("receiveMethod", v)} options={receiveMethodOptions} placeholder="Chọn hình thức nhận" /></CardField>
              <CardField label="Mức độ khẩn / Tính chất" required htmlFor="inc-priority" last><ComposeSelect id="inc-priority" clearable value={values.priority} onChange={(v) => set("priority", v)} options={priorityOptions} placeholder="Chọn mức độ" /></CardField>
            </div>
          </ComposeCard>
        </div>
        <aside className="min-w-0" aria-label="Đăng ký và cấp số">
          <ComposeCard n={4} title="Đăng ký & Cấp số" label="Đăng ký và cấp số" hint="Thông tin lưu trữ và vào sổ">
            <CardField label="Số lưu Công văn (Tự động)" htmlFor="inc-archive"><Input id="inc-archive" readOnly value={values.archiveNo} placeholder="Tự động sinh số lưu..." className="font-mono" /></CardField>
            <CardField label="Trạng thái tiếp nhận" required htmlFor="inc-status" error={errors.receiveStatus}><ComposeSelect id="inc-status" clearable value={values.receiveStatus} onChange={(v) => set("receiveStatus", v)} options={receiveStatusOptions} placeholder="Chọn trạng thái" invalid={Boolean(errors.receiveStatus)} /></CardField>
            <CardField label="Cấp văn bản" required htmlFor="inc-level" error={errors.level}><ComposeSelect id="inc-level" clearable value={values.level} onChange={(v) => set("level", v)} options={levelOptions} placeholder="Chọn cấp văn bản" invalid={Boolean(errors.level)} /></CardField>
            <CardField label="Thời hạn xử lý"><DatePicker aria-label="Thời hạn xử lý" placeholder="Chọn thời hạn xử lý" value={values.dueOn} onChange={(d) => set("dueOn", d)} /></CardField>
            <CardField label="Ngày chuyển"><DatePicker aria-label="Ngày chuyển" placeholder="Chọn ngày chuyển" value={values.forwardedOn} onChange={(d) => set("forwardedOn", d)} /></CardField>
            <CardField label="Ghi chú sổ đăng ký" htmlFor="inc-note" className="flow-root"><Textarea id="inc-note" rows={2} value={values.note} onChange={(e) => set("note", e.target.value)} placeholder="Ghi chú vào sổ văn bản đến..." className="mb-[5.8px] min-h-[62px] leading-normal" /></CardField>
            <CardField label="Hồ sơ công việc" note="không bắt buộc" htmlFor="inc-folder">
              <ComposeSelect id="inc-folder" value={values.folder} onChange={(v) => set("folder", v)} options={folderOptions} placeholder="Chọn hồ sơ công việc (không bắt buộc)" />
              <p className="mt-1 mb-0 text-xs leading-4 text-muted-foreground">{folderOptions.length === 0 ? "Chưa có hồ sơ đang lập nào dành cho bạn." : `${folderOptions.length} hồ sơ đang lập dành cho bạn.`} <a href="#" onClick={(e) => e.preventDefault()} className="text-primary underline">Mở hồ sơ mới</a></p>
            </CardField>
            <CardField label="Nơi lưu trữ" className="mb-2" last>
              <p className="m-0 rounded-md border border-border bg-muted px-2.5 py-2 text-body leading-[1.7]">{values.folder ? (folderOptions.find((o) => o.value === values.folder)?.label ?? "") : "Chưa vào hồ sơ"}</p>
              <Label htmlFor="inc-paper" className="mt-2.5 mb-1.5">Vị trí bản giấy tại đơn vị<em className="ml-1 text-label font-normal text-subtle-foreground not-italic">— nếu có</em></Label>
              <Input id="inc-paper" value={values.paperLocation} onChange={(e) => set("paperLocation", e.target.value)} placeholder="VD: Tủ 3, kệ B" />
            </CardField>
          </ComposeCard>
        </aside>
      </ComposeColumns>
    </div>
  )
}
