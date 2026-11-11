"use client"

// @dthu/ui 0.2.0 · number-input
import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface NumberInputProps extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step" | "size"> {
  /** Giá trị điều khiển từ ngoài; `undefined` nghĩa là để trống khi dùng kèm `onValueChange`. */
  value?: number | null
  /** Giá trị ban đầu (không điều khiển). */
  defaultValue?: number
  /** Gọi khi giá trị đổi; `undefined` khi ô để trống. */
  onValueChange?: (value: number | undefined) => void
  /** Giá trị nhỏ nhất. */
  min?: number
  /** Giá trị lớn nhất. */
  max?: number
  /** Bước tăng/giảm khi bấm nút hoặc phím mũi tên. Mặc định 1. */
  step?: number
  /** Số chữ số thập phân tối đa khi hiển thị. Mặc định lấy theo `step`. */
  precision?: number
  /** Tùy chọn định dạng (`Intl.NumberFormat`) áp dụng khi rời ô, ví dụ đơn vị tiền tệ. */
  formatOptions?: Intl.NumberFormatOptions
  /** Ngôn ngữ định dạng. Mặc định lấy từ `UiProvider` (`vi-VN`: dấu chấm ngăn nghìn, dấu phẩy thập phân). @default vi-VN */
  locale?: string
  /** Kích cỡ nút: ô cao 40px (`default`) hoặc 32px (`sm`). @default default */
  inputSize?: "default" | "sm"
}

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length

/** Chuyển chuỗi người dùng gõ (kiểu Việt hoặc kiểu Mỹ) thành số. */
function parse(text: string): number | undefined {
  let t = text.trim().replace(/\s/g, "")
  if (t === "" || t === "-") return undefined
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".")
  else if ((t.match(/\./g) ?? []).length > 1) t = t.replace(/\./g, "")
  const n = Number(t)
  return Number.isFinite(n) ? n : undefined
}

/** Ô nhập số có nút +/-, giới hạn min/max, bước step, phím mũi tên/Home/End/PageUp/PageDown, ngữ nghĩa `spinbutton`. */
export function NumberInput({ value, defaultValue, onValueChange, min, max, step = 1, precision, formatOptions, locale: localeProp, inputSize: inputSizeProp, className, disabled, readOnly, id, "aria-label": ariaLabel, ...props }: NumberInputProps) {
  const ui = useUiConfig()
  const locale = localeProp ?? ui.locale
  const inputSize = inputSizeProp ?? (ui.size === "sm" ? "sm" : "default")
  const prec = precision ?? Math.max(decimals(step), decimals(min ?? 0))
  const fmt = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: prec, ...formatOptions }), [locale, prec, formatOptions])
  const controlled = value !== undefined
  const [inner, setInner] = React.useState<number | undefined>(defaultValue)
  const num = controlled ? (value ?? undefined) : inner
  const [text, setText] = React.useState<string | null>(null) // not null while the user is typing
  const clamp = (n: number) => {
    const c = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
    return Number(c.toFixed(prec))
  }
  const commit = (n: number | undefined) => { if (!controlled) setInner(n); if (n !== num) onValueChange?.(n) }
  const bump = (dir: 1 | -1, mult = 1) => {
    if (disabled || readOnly) return
    const base = num ?? (dir === 1 ? (min !== undefined ? min - step : 0) : (max !== undefined ? max + step : 0))
    commit(clamp(base + dir * step * mult))
    setText(null)
  }
  const display = text ?? (num === undefined ? "" : fmt.format(num))
  const atMin = num !== undefined && min !== undefined && num <= min
  const atMax = num !== undefined && max !== undefined && num >= max
  const btn = cn("inline-flex shrink-0 items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4", inputSize === "sm" ? "w-7" : "w-9")
  return (
    <div
      data-slot="number-input"
      className={cn("flex w-full min-w-0 items-stretch overflow-hidden rounded-md border border-field-border bg-background shadow-xs transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none hover:not-focus-within:border-input focus-within:border-primary focus-within:shadow-focus-soft has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:focus-within:shadow-focus-soft-danger", disabled && "opacity-50", inputSize === "sm" ? "h-7" : "h-9 max-md:h-10", className)}
    >
      <button type="button" tabIndex={-1} aria-label={ui.labels.decrease} disabled={disabled || readOnly || atMin} onClick={() => bump(-1)} className={cn(btn, "border-r border-field-border")}><Minus /></button>
      <input
        id={id}
        role="spinbutton"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-valuenow={num}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={num === undefined ? undefined : fmt.format(num)}
        disabled={disabled}
        readOnly={readOnly}
        value={display}
        onFocus={() => setText(num === undefined ? "" : String(num).replace(".", ","))}
        onChange={(e) => {
          const raw = e.target.value
          if (!/^-?[\d.,\s]*$/.test(raw)) return
          setText(raw)
          const n = parse(raw)
          if (raw.trim() === "") commit(undefined)
          else if (n !== undefined && !/[.,]$/.test(raw)) commit(n)
        }}
        onBlur={() => {
          const n = text === null ? num : parse(text)
          commit(n === undefined ? undefined : clamp(n))
          setText(null)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); bump(1) }
          else if (e.key === "ArrowDown") { e.preventDefault(); bump(-1) }
          else if (e.key === "PageUp") { e.preventDefault(); bump(1, 10) }
          else if (e.key === "PageDown") { e.preventDefault(); bump(-1, 10) }
          else if (e.key === "Home" && min !== undefined && !disabled && !readOnly) { e.preventDefault(); commit(min); setText(null) }
          else if (e.key === "End" && max !== undefined && !disabled && !readOnly) { e.preventDefault(); commit(max); setText(null) }
        }}
        className="min-w-0 flex-1 bg-transparent px-3 text-center text-control coarse:text-base tabular-nums outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
        {...props}
      />
      <button type="button" tabIndex={-1} aria-label={ui.labels.increase} disabled={disabled || readOnly || atMax} onClick={() => bump(1)} className={cn(btn, "border-l border-field-border")}><Plus /></button>
    </div>
  )
}
