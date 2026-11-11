import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface TagInputProps {
  /** Danh sách thẻ hiện tại (điều khiển từ ngoài). */
  value?: string[]
  /** Danh sách thẻ ban đầu (không điều khiển). */
  defaultValue?: string[]
  /** Gọi khi danh sách thẻ thay đổi. */
  onValueChange?: (tags: string[]) => void
  /** Số thẻ tối đa. */
  max?: number
  /** Hàm kiểm tra thẻ mới; trả về chuỗi lỗi để từ chối, hoặc `true`/`undefined` để chấp nhận. */
  validate?: (tag: string) => string | boolean | undefined
  /** Cho phép thẻ trùng nhau (mặc định không). */
  allowDuplicates?: boolean
  /** Các ký tự phân tách ngoài Enter. Mặc định `[","]`. */
  delimiters?: string[]
  /** @default Nhập rồi nhấn Enter */
  placeholder?: string
  disabled?: boolean
  /** Hiện trạng thái lỗi (viền đỏ). */
  invalid?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

/** Ô nhập nhiều thẻ tự do: Enter hoặc dấu phẩy để thêm, Backspace để xóa thẻ cuối, dán chuỗi sẽ tự tách thẻ. */
export function TagInput({ value, defaultValue, onValueChange, max, validate, allowDuplicates = false, delimiters = [","], placeholder: placeholderProp, disabled, invalid, id, className, ...rest }: TagInputProps) {
  const { labels } = useUiConfig()
  const placeholder = placeholderProp ?? labels.tagInputPlaceholder
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const tags = value ?? inner
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string>()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const errId = React.useId()
  const set = (next: string[]) => { if (value === undefined) setInner(next); onValueChange?.(next) }

  /** Thêm nhiều thẻ một lần; trả về true nếu mọi thẻ được nhận. */
  const addMany = (raw: string[]) => {
    let list = tags
    let err: string | undefined
    for (const r of raw) {
      const t = r.trim()
      if (!t) continue
      if (max !== undefined && list.length >= max) { err = labels.tagMax(max); break }
      if (!allowDuplicates && list.some((x) => x.toLowerCase() === t.toLowerCase())) { err = labels.tagDuplicate(t); continue }
      const v = validate?.(t)
      if (typeof v === "string") { err = v; continue }
      if (v === false) { err = labels.tagInvalid(t); continue }
      list = [...list, t]
    }
    if (list !== tags) set(list)
    setError(err)
    return !err
  }
  const sepRe = new RegExp(`[${delimiters.map((d) => d.replace(/[\]\\^-]/g, "\\$&")).join("")}\\n\\t;]`)
  const split = (s: string) => s.split(sepRe)
  const remove = (i: number) => { set(tags.filter((_, j) => j !== i)); setError(undefined); inputRef.current?.focus() }

  return (
    <div className={cn("w-full", className)}>
      <div
        data-slot="tag-input"
        onClick={() => inputRef.current?.focus()}
        className={cn("flex min-h-9 max-md:min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-field-border bg-background px-2 py-1.5 shadow-xs transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none hover:not-focus-within:border-input focus-within:border-primary focus-within:shadow-focus-soft", (invalid || error) && "border-destructive hover:not-focus-within:border-destructive focus-within:border-destructive focus-within:shadow-focus-soft-danger", disabled && "cursor-not-allowed opacity-50")}
      >
        {tags.map((t, i) => (
          <Badge key={t + i} variant="secondary" className="gap-1 py-1 pr-1 pl-2.5">
            {t}
            <button type="button" disabled={disabled} aria-label={labels.removeItem(t)} onClick={(e) => { e.stopPropagation(); remove(i) }} className="inline-flex size-5 items-center justify-center rounded-full outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"><X /></button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={text}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : undefined}
          aria-label={rest["aria-label"]}
          aria-invalid={invalid || !!error || undefined}
          aria-describedby={error ? errId : undefined}
          onChange={(e) => {
            const v = e.target.value
            if (delimiters.some((d) => v.includes(d))) {
              const parts = split(v)
              const rest = parts.pop() ?? ""
              const ok = addMany(parts)
              setText(ok ? rest : parts.join(", ") + rest)
            } else { setText(v); if (error) setError(undefined) }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (text.trim() && addMany([text])) setText("") }
            else if (e.key === "Backspace" && text === "" && tags.length) { set(tags.slice(0, -1)); setError(undefined) }
          }}
          onBlur={() => { if (text.trim() && addMany([text])) setText("") }}
          onPaste={(e) => {
            const data = e.clipboardData.getData("text")
            if (!sepRe.test(data)) return
            e.preventDefault()
            addMany(split(text + data))
            setText("")
          }}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-control coarse:text-base outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
        />
      </div>
      {error && <p id={errId} role="alert" className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}
