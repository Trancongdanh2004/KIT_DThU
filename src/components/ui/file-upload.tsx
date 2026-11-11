"use client"

// @dthu/ui 0.2.0 · file-upload
import * as React from "react"
import { CircleAlert, File as FileIcon, UploadCloud, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface FileUploadItem {
  /** Mã định danh duy nhất của mục. */
  id: string
  file: File
  /** Tiến độ tải lên 0–100. Bỏ trống nếu không hiển thị thanh tiến độ. */
  progress?: number
  /** Thông báo lỗi riêng của tệp (ví dụ tải lên thất bại). */
  error?: string
}

export interface FileUploadProps {
  /** Danh sách tệp (điều khiển từ ngoài, dùng để cập nhật `progress`). */
  value?: FileUploadItem[]
  /** Danh sách tệp ban đầu (không điều khiển). */
  defaultValue?: FileUploadItem[]
  /** Gọi khi danh sách thay đổi (thêm/xóa tệp). */
  onValueChange?: (items: FileUploadItem[]) => void
  /** Gọi với các tệp hợp lệ vừa thêm, thường để bắt đầu tải lên. */
  onFilesAdded?: (items: FileUploadItem[]) => void
  /** Định dạng chấp nhận, như thuộc tính `accept` của input: ".pdf,.docx,image/*". */
  accept?: string
  /** Dung lượng tối đa mỗi tệp (byte). */
  maxSize?: number
  /** Số tệp tối đa. */
  maxFiles?: number
  /** Cho chọn nhiều tệp. Mặc định bật. */
  multiple?: boolean
  disabled?: boolean
  /** Tiêu đề trong vùng thả. @default Kéo thả tệp vào đây hoặc bấm để chọn */
  title?: string
  /** Chữ hành động nổi bật (xanh, in đậm) nối sau tiêu đề, vd. "chọn từ máy tính". */
  actionLabel?: string
  /** Dòng mô tả giới hạn, tự sinh từ `accept`/`maxSize` nếu bỏ trống. */
  description?: string
  className?: string
  "aria-label"?: string
}

const KB = 1024
export function formatBytes(n: number) {
  if (n < KB) return `${n} B`
  if (n < KB * KB) return `${(n / KB).toFixed(n < 10 * KB ? 1 : 0)} KB`
  return `${(n / KB / KB).toFixed(1)} MB`
}

function matches(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).some((t) =>
    t.startsWith(".") ? file.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? file.type.toLowerCase().startsWith(t.slice(0, -1)) : file.type.toLowerCase() === t,
  )
}

let seq = 0

/** Vùng kéo thả tệp (kéo thả, bấm hoặc Enter/Space), kiểm tra loại/dung lượng/số lượng, danh sách tệp có xem trước ảnh, thanh tiến độ và nút xóa. */
export function FileUpload({ value, defaultValue, onValueChange, onFilesAdded, accept, maxSize, maxFiles, multiple = true, disabled, title, actionLabel, description, className, ...rest }: FileUploadProps) {
  const { labels } = useUiConfig()
  const [inner, setInner] = React.useState<FileUploadItem[]>(defaultValue ?? [])
  const items = value ?? inner
  const [errors, setErrors] = React.useState<string[]>([])
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const descId = React.useId()
  const set = (next: FileUploadItem[]) => { if (value === undefined) setInner(next); onValueChange?.(next) }
  const desc = description ?? [accept && labels.uploadFormats(accept.split(",").map((s) => s.trim().replace(/^\./, "").toUpperCase()).join(", ")), maxSize && labels.uploadMaxSize(formatBytes(maxSize)), maxFiles && labels.uploadMaxFiles(maxFiles)].filter(Boolean).join(" · ")

  const add = (list: File[]) => {
    const errs: string[] = []
    const ok: FileUploadItem[] = []
    let room = maxFiles === undefined ? Infinity : maxFiles - items.length
    const files = multiple ? list : list.slice(0, 1)
    for (const f of files) {
      if (!matches(f, accept)) errs.push(labels.uploadBadType(f.name))
      else if (maxSize !== undefined && f.size > maxSize) errs.push(labels.uploadTooLarge(f.name, formatBytes(maxSize)))
      else if (room <= 0) errs.push(labels.uploadTooMany(f.name, maxFiles!))
      else { ok.push({ id: `f${++seq}`, file: f }); room-- }
    }
    setErrors(errs)
    if (ok.length) { set(multiple ? [...items, ...ok] : ok); onFilesAdded?.(ok) }
  }
  const open = () => { if (!disabled) inputRef.current?.click() }

  return (
    <div className={cn("w-full space-y-3", className)} data-slot="file-upload">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={rest["aria-label"] ?? title}
        aria-describedby={desc ? descId : undefined}
        data-dragging={dragging || undefined}
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open() } }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) add(Array.from(e.dataTransfer.files)) }}
        className={cn("group/dz relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[color-mix(in_srgb,var(--primary)_22%,var(--background))] bg-secondary px-4 py-5 text-center transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 ease-in-out outline-none hover:border-primary hover:bg-accent focus-visible:border-primary focus-visible:shadow-focus data-[dragging]:border-primary data-[dragging]:bg-accent aria-disabled:cursor-not-allowed aria-disabled:opacity-50", errors.length > 0 && "border-destructive/60")}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 group-hover/dz:-translate-y-0.5 group-hover/dz:bg-[color-mix(in_srgb,var(--primary)_22%,var(--background))] group-data-[dragging]/dz:-translate-y-0.5">
          <UploadCloud className="size-[22px]" aria-hidden />
        </span>
        <p className="text-body font-medium text-foreground">{title ?? labels.uploadTitle}{actionLabel && <> <span className="font-semibold text-primary group-hover/dz:underline">{actionLabel}</span></>}</p>
        {desc && <p id={descId} className="-mt-1.5 text-label text-subtle-foreground">{desc}</p>}
        <input ref={inputRef} type="file" hidden tabIndex={-1} aria-label={rest["aria-label"] ?? title} accept={accept} multiple={multiple} disabled={disabled} data-testid="file-input" onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = "" }} />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 text-xs text-destructive">
          {errors.map((m) => <li key={m} className="flex items-start gap-1.5"><CircleAlert className="mt-0.5 size-3.5 shrink-0" />{m}</li>)}
        </ul>
      )}

      {items.length > 0 && (
        <ul className="space-y-2" aria-label={labels.uploadList}>
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5">
              <Thumb file={it.file} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-control font-medium">{it.file.name}</p>
                <p className={cn("text-xs", it.error ? "text-destructive" : "text-muted-foreground")}>{it.error ?? formatBytes(it.file.size)}</p>
                {it.progress !== undefined && !it.error && (
                  <Progress value={it.progress} aria-label={labels.uploadProgress(it.file.name)} className="mt-1.5 h-1.5" />
                )}
              </div>
              <button type="button" aria-label={labels.removeItem(it.file.name)} onClick={() => set(items.filter((x) => x.id !== it.id))} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:shadow-focus [&_svg]:size-4"><X /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Thumb({ file }: { file: File }) {
  const [url, setUrl] = React.useState<string>()
  React.useEffect(() => {
    if (!file.type.startsWith("image/") || typeof URL.createObjectURL !== "function") return
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted text-muted-foreground">
      {url ? <img src={url} alt="" className="size-full object-cover" /> : <FileIcon className="size-5" aria-hidden />}
    </span>
  )
}
