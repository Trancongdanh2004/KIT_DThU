"use client"

// @dthu/ui 0.2.0 · block-documents
import * as React from "react"
import { CloudUpload, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DocumentDropzoneProps {
  title?: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  /** `accept` attribute of the hidden input; use a wildcard type for any file. */
  accept?: string
  multiple?: boolean
  "aria-label"?: string
  fileName?: string
  onFiles?: (files: File[]) => void
  className?: string
}

/** Dashed drag-and-drop area; also operable by keyboard/click via a hidden file input. */
export function DocumentDropzone({ title, hint, icon, accept = "application/pdf", multiple, fileName, onFiles, className, ...rest }: DocumentDropzoneProps) {
  const input = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  return (
    <div
      role="button" tabIndex={0} aria-label={rest["aria-label"] ?? "Chọn hoặc kéo thả tệp"}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click() } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles?.(Array.from(e.dataTransfer.files)) }}
      className={cn("group/dz relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[color-mix(in_srgb,var(--primary)_22%,var(--background))] bg-secondary px-4 py-5 text-center transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 ease-in-out outline-none hover:border-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring", over && "border-primary bg-accent", className)}
    >
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => onFiles?.(Array.from(e.target.files ?? []))} />
      <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 group-hover/dz:-translate-y-0.5 group-hover/dz:bg-[color-mix(in_srgb,var(--primary)_22%,var(--background))] [&_svg]:size-[22px]">{icon ?? <CloudUpload />}</div>
      <div className="flex flex-col">
        <span className="text-body font-medium text-foreground">{fileName ?? title ?? <>Kéo thả tệp PDF vào đây hoặc <span className="font-semibold text-primary group-hover/dz:underline">chọn từ máy tính</span></>}</span>
        {hint && <span className="mt-0.5 text-label text-subtle-foreground">{hint}</span>}
      </div>
    </div>
  )
}

export interface AttachmentItem { id: string; name: string; size?: string }

/** Removable list of files chosen through a dropzone. */
export function AttachmentList({ items, onRemove, label = "Tệp đã chọn" }: { items: AttachmentItem[]; onRemove?: (id: string) => void; label?: string }) {
  if (items.length === 0) return null
  return (
    <ul aria-label={label} className="grid gap-1.5">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm">
          <Paperclip className="size-4 text-primary" aria-hidden /><span className="flex-1 truncate">{a.name}</span>
          {a.size && <span className="text-xs text-muted-foreground">{a.size}</span>}
          <button type="button" aria-label={`Bỏ tệp ${a.name}`} onClick={() => onRemove?.(a.id)} className="rounded-full text-muted-foreground outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" /></button>
        </li>
      ))}
    </ul>
  )
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
