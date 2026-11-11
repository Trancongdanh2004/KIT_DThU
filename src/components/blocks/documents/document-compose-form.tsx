import * as React from "react"
import { ArrowLeft, CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AttachmentList, DocumentDropzone, formatFileSize } from "./document-dropzone"
import { RecipientsPicker, type Recipient } from "./recipients-picker"
import { ComposeAutoNumber, ComposeColumns, ComposeField, ComposeHeader, ComposeHint, ComposeInput, ComposeMaskBadge, ComposeRow, ComposeSection, ComposeSegmented, ComposeSelect, ComposeTextarea, type ComposeOption } from "./compose-parts"

export type { ComposeOption }

export interface DocumentComposeValues {
  fileName?: string
  summary: string
  type: string
  documentNo: string
  copies: string
  unit: string
  field: string
  priority: string
  recipients: string[]
  /** "Hệ văn bản": administrative or party documents. */
  system?: string
  /** "Mức độ bảo mật". */
  security?: string
  /** "Khối cơ quan nhận". */
  receiverBlock?: string
  /** "Cán bộ soạn". */
  author?: string
  attachments?: { id: string; name: string; size?: string }[]
  /** Publish the attachments to the notice board when the document is issued. */
  publishAttachments?: boolean
}

export type DocumentComposeErrors = Partial<Record<"file" | "summary" | "type" | "copies" | "unit" | "recipients", string>>

/** Pure validation used by the form on submit (also exported for hosts and tests). */
export function validateDocumentCompose(v: DocumentComposeValues): DocumentComposeErrors {
  const e: DocumentComposeErrors = {}
  if (!v.fileName) e.file = "Chọn tệp PDF cần trình ký."
  if (!v.summary.trim()) e.summary = "Nhập trích yếu."
  if (!v.type) e.type = "Chọn loại văn bản."
  if (!/^[1-9]\d*$/.test(v.copies.trim())) e.copies = "Số bản phải là số nguyên dương."
  if (!v.unit) e.unit = "Chọn đơn vị soạn."
  return e
}

export interface DocumentComposeFormProps {
  title?: string
  description?: string
  values: DocumentComposeValues
  onChange: (values: DocumentComposeValues) => void
  /** Archive number shown read-only in the side panel. */
  archiveNo?: string
  typeOptions: ComposeOption[]
  unitOptions: ComposeOption[]
  fieldOptions: ComposeOption[]
  priorityOptions: ComposeOption[]
  securityOptions?: ComposeOption[]
  receiverBlockOptions?: ComposeOption[]
  authorOptions?: ComposeOption[]
  recipientOptions: Recipient[]
  onBack?: () => void
  onSaveDraft?: () => void
  /** Called only when validation passes. */
  onSubmit?: () => void
  /** Called with the errors when submit is attempted with invalid values. */
  onInvalid?: (errors: DocumentComposeErrors) => void
  submitLabel?: string
  maxSummary?: number
  /** Count shown on the collapsed "Trường ít khi dùng" toggle of the side panel (default 6). */
  advancedCount?: number
  /** Rarely used fields revealed by that toggle. */
  advancedFields?: React.ReactNode
  className?: string
}

/** Compose / edit form for an outgoing document: file, content, recipients, attachments and a metadata side panel. */
export function DocumentComposeForm({
  title = "Soạn văn bản đi", description = "Điền tệp và nội dung, lưu nháp bất cứ lúc nào, trình ký khi đã đủ.", values, onChange, archiveNo, typeOptions, unitOptions, fieldOptions, priorityOptions,
  securityOptions = [], receiverBlockOptions = [], authorOptions = [], recipientOptions,
  onBack, onSaveDraft, onSubmit, onInvalid, submitLabel = "Lưu & trình ký / duyệt nội bộ", maxSummary = 500, advancedCount = 6, advancedFields, className,
}: DocumentComposeFormProps) {
  const [submitted, setSubmitted] = React.useState(false)
  const errors = submitted ? validateDocumentCompose(values) : {}
  const set = <K extends keyof DocumentComposeValues>(k: K, v: DocumentComposeValues[K]) => onChange({ ...values, [k]: v })
  const submit = () => {
    setSubmitted(true)
    const e = validateDocumentCompose(values)
    if (Object.keys(e).length > 0) onInvalid?.(e)
    else onSubmit?.()
  }
  const attachments = values.attachments ?? []
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }} className={cn("h-full min-h-0 overflow-auto pb-[26px] text-body text-foreground", className)}>
      <ComposeHeader title={title} description={description}>
        <Button type="button" variant="outline" onClick={onBack}><ArrowLeft />Trở về</Button>
        <Button type="button" variant="outline" onClick={onSaveDraft}>Lưu nháp</Button>
        <div className="relative flex max-w-full min-w-0">
          <Button type="button" className="min-w-0 rounded-r-none px-4 text-body font-medium max-sm:truncate" onClick={submit}>{submitLabel}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button type="button" className="w-[30px] rounded-l-none border-l-white/30 px-0 text-caption" aria-label="Tùy chọn lưu">▾</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onSaveDraft?.()}>Chỉ lưu nháp</DropdownMenuItem>
              <DropdownMenuItem onSelect={submit}>Lưu &amp; trình lãnh đạo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ComposeHeader>
      <ComposeColumns>
        <div className="min-w-0">
          <ComposeSection n={1} title="Tệp văn bản trình ký" required label="Tệp văn bản trình ký" hint="Không có tệp thì không ký số được · chỉ nhận .pdf">
            <DocumentDropzone fileName={values.fileName} onFiles={(f) => set("fileName", f[0]?.name)} hint="Chỉ nhận tệp .pdf (tối đa 100MB). Bản Word cần đổi sang PDF trước — hệ thống ký số được trên PDF." />
            {errors.file && <p role="alert" className="mt-1 text-xs text-destructive">{errors.file}</p>}
          </ComposeSection>
          <ComposeSection n={2} title="Nội dung" label="Nội dung">
            <ComposeField label="Trích yếu" required htmlFor="cmp-summary" error={errors.summary} counter={`${values.summary.length} / ${maxSummary}`}>
              <ComposeTextarea id="cmp-summary" rows={4} className="mb-[9.5px]" maxLength={maxSummary} value={values.summary} onChange={(e) => set("summary", e.target.value)} aria-invalid={errors.summary ? true : undefined} aria-describedby={errors.summary ? "cmp-summary-error" : undefined} placeholder="Một đoạn văn xuôi mô tả văn bản nói về cái gì…" />
              <ComposeHint>Một đoạn văn xuôi, không định dạng. Đây là dòng người khác đọc để biết văn bản nói về cái gì, nên viết đủ ý trong một câu.</ComposeHint>
            </ComposeField>
            <ComposeRow>
              <ComposeField label="Loại văn bản" required htmlFor="cmp-type" error={errors.type}
                labelExtra={<ComposeSegmented label="Hệ văn bản" value={values.system ?? "admin"} onChange={(v) => set("system", v)} options={[{ value: "admin", label: "Hành chính" }, { value: "party", label: "Đảng" }]} />}>
                <ComposeSelect id="cmp-type" value={values.type} onChange={(v) => set("type", v)} options={typeOptions} placeholder="Chọn loại văn bản" invalid={Boolean(errors.type)} />
              </ComposeField>
              <ComposeField label="Số CV đi" labelIcon={<CircleHelp className="size-3.5 shrink-0 self-center text-subtle-foreground" aria-hidden />} htmlFor="cmp-no" labelExtra={<ComposeMaskBadge>Mẫu: {"{Số}/{Loại}-{ĐV}"}</ComposeMaskBadge>}>
                <ComposeInput id="cmp-no" value={values.documentNo} onChange={(e) => set("documentNo", e.target.value)} placeholder="VD: 123/QĐ-ACME hoặc 566/ACME-HC" />
              </ComposeField>
            </ComposeRow>
            <ComposeRow>
              <RecipientsPicker label="Nơi nhận văn bản" options={recipientOptions} value={values.recipients} onChange={(r) => set("recipients", r)} />
              <ComposeField label="Số bản" required htmlFor="cmp-copies" error={errors.copies}>
                <ComposeInput id="cmp-copies" inputMode="numeric" value={values.copies} onChange={(e) => set("copies", e.target.value)} aria-invalid={errors.copies ? true : undefined} aria-describedby={errors.copies ? "cmp-copies-error" : undefined} />
              </ComposeField>
            </ComposeRow>
            <ComposeField label="Khối cơ quan nhận" optionalNote="không bắt buộc" htmlFor="cmp-block">
              <ComposeSelect id="cmp-block" value={values.receiverBlock ?? ""} onChange={(v) => set("receiverBlock", v)} options={receiverBlockOptions} placeholder="Chọn khối cơ quan" />
            </ComposeField>
          </ComposeSection>
          <ComposeSection n={3} title="Hồ sơ kèm theo" note="Không bắt buộc" label="Hồ sơ đính kèm">
            <DocumentDropzone
              multiple accept="*/*" aria-label="Chọn hoặc kéo thả hồ sơ đính kèm" title={<>Kéo thả tệp vào đây hoặc <span className="font-semibold text-primary group-hover/dz:underline">chọn từ máy tính</span></>}
              hint=".pdf .doc .docx .xls .xlsx .rar .zip (tối đa 100MB)"
              onFiles={(files) => set("attachments", [...attachments, ...files.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, size: formatFileSize(f.size) }))])}
            />
            <AttachmentList items={attachments} onRemove={(id) => set("attachments", attachments.filter((a) => a.id !== id))} />
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-body leading-[1.4] font-semibold">Gửi kèm hồ sơ này khi ban hành ra mục thông báo</span>
                <span className="mt-0.5 block text-label leading-[1.45] text-subtle-foreground">Bỏ chọn nếu hồ sơ chỉ dùng để trình ký nội bộ.</span>
              </span>
              <Switch checked={Boolean(values.publishAttachments)} onCheckedChange={(c) => set("publishAttachments", c)} />
            </label>
          </ComposeSection>
        </div>
        <aside className="min-w-0" aria-label="Đơn vị và phân loại">
          <ComposeSection title="Đơn vị & phân loại" label="Đơn vị và phân loại">
            <ComposeField label="Số lưu CV" optionalNote="hệ thống cấp"><ComposeAutoNumber>{archiveNo ?? "—"}</ComposeAutoNumber></ComposeField>
            <ComposeField label="Đơn vị soạn" required htmlFor="cmp-unit" error={errors.unit}><ComposeSelect id="cmp-unit" value={values.unit} onChange={(v) => set("unit", v)} options={unitOptions} placeholder="Chọn đơn vị" invalid={Boolean(errors.unit)} /></ComposeField>
            <ComposeField label="Cán bộ soạn" htmlFor="cmp-author"><ComposeSelect id="cmp-author" value={values.author ?? ""} onChange={(v) => set("author", v)} options={authorOptions} placeholder="Chọn cán bộ soạn" /></ComposeField>
            <ComposeField label="Lĩnh vực" htmlFor="cmp-field"><ComposeSelect id="cmp-field" value={values.field} onChange={(v) => set("field", v)} options={fieldOptions} placeholder="Chọn lĩnh vực" /></ComposeField>
            <ComposeField label="Mức độ tính chất" htmlFor="cmp-priority"><ComposeSelect id="cmp-priority" value={values.priority} onChange={(v) => set("priority", v)} options={priorityOptions} placeholder="Chọn mức độ" clearable /></ComposeField>
            <ComposeField label="Mức độ bảo mật" htmlFor="cmp-security"><ComposeSelect id="cmp-security" value={values.security ?? ""} onChange={(v) => set("security", v)} options={securityOptions} placeholder="Chọn mức độ bảo mật" clearable /></ComposeField>
            <button type="button" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen((o) => !o)} className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-left text-small text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Trường ít khi dùng <span className="rounded-full bg-muted px-1.5 font-mono text-tiny">{advancedCount}</span><span className="ml-auto text-tiny text-subtle-foreground">▾</span>
            </button>
            {advancedOpen && advancedFields && <div className="mt-3.5">{advancedFields}</div>}
          </ComposeSection>
        </aside>
      </ComposeColumns>
    </form>
  )
}
