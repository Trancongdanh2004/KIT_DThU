"use client"

// @dthu/ui 0.2.0 · multi-select
import * as React from "react"
import { Check, ChevronDown, LoaderCircle, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface MultiSelectOption {
  value: string
  label: string
  /** Vô hiệu hóa riêng lựa chọn này. */
  disabled?: boolean
}

export interface MultiSelectProps {
  /** Danh sách lựa chọn. */
  options: MultiSelectOption[]
  /** Các giá trị đang chọn (điều khiển từ ngoài). */
  value?: string[]
  /** Các giá trị chọn ban đầu (không điều khiển). */
  defaultValue?: string[]
  /** Gọi khi tập giá trị thay đổi. */
  onValueChange?: (value: string[]) => void
  /** Chữ hiện khi chưa chọn gì. @default Chọn… */
  placeholder?: string
  /** Chữ gợi ý trong ô tìm kiếm. @default Tìm… */
  searchPlaceholder?: string
  /** Chữ hiện khi tìm không ra. @default Không có kết quả */
  emptyText?: string
  /** Số thẻ hiển thị tối đa trên nút; phần còn lại gộp thành "+N". Mặc định 3. */
  maxDisplay?: number
  /** Số lựa chọn tối đa được chọn. */
  maxSelected?: number
  /** Hiện mục "Chọn tất cả". Mặc định bật (tắt khi có `maxSelected`). */
  selectAll?: boolean
  /** Hiện nút xóa tất cả. Mặc định bật. */
  clearable?: boolean
  /** Đang tải danh sách: hiện biểu tượng quay và chặn chọn. */
  loading?: boolean
  disabled?: boolean
  /** Nhãn cho trình đọc màn hình. */
  "aria-label"?: string
  className?: string
}

/** Chọn nhiều có tìm kiếm (Popover + Command), hiển thị thẻ đã chọn, chọn tất cả, xóa hết, giới hạn số thẻ hiển thị. */
export function MultiSelect({
  options, value, defaultValue, onValueChange, placeholder: placeholderProp, searchPlaceholder, emptyText,
  maxDisplay = 3, maxSelected, selectAll = true, clearable = true, loading, disabled, className, ...rest
}: MultiSelectProps) {
  const { labels } = useUiConfig()
  const placeholder = placeholderProp ?? labels.select
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const selected = value ?? inner
  const [open, setOpen] = React.useState(false)
  const set = (next: string[]) => { if (value === undefined) setInner(next); onValueChange?.(next) }
  const toggle = (v: string) => {
    if (selected.includes(v)) set(selected.filter((x) => x !== v))
    else if (maxSelected === undefined || selected.length < maxSelected) set([...selected, v])
  }
  const enabled = options.filter((o) => !o.disabled)
  const allOn = enabled.length > 0 && enabled.every((o) => selected.includes(o.value))
  const chips = selected.map((v) => options.find((o) => o.value === v)).filter((o): o is MultiSelectOption => !!o)
  const shown = chips.slice(0, maxDisplay)
  const off = disabled || loading
  const showAll = selectAll && maxSelected === undefined
  return (
    <div className={cn("relative w-full", className)} data-slot="multi-select">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={rest["aria-label"] ?? placeholder}
            aria-busy={loading || undefined}
            disabled={disabled}
            data-state={open ? "open" : "closed"}
            className={cn("group/sel flex min-h-9 w-full coarse:min-h-11 coarse:text-base cursor-pointer items-center gap-1.5 rounded-md border border-field-border bg-background py-1 pl-[11px] text-left text-body text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none outline-none hover:border-muted-foreground focus-visible:border-primary focus-visible:shadow-focus-soft data-[state=open]:border-primary data-[state=open]:shadow-focus-soft disabled:cursor-not-allowed disabled:bg-secondary disabled:text-subtle-foreground", clearable && selected.length > 0 ? "pr-14" : "pr-8")}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {chips.length === 0 && <span className="text-subtle-foreground">{placeholder}</span>}
              {shown.map((o) => (
                <span key={o.value} className="inline-flex h-6 max-w-40 min-w-0 items-center gap-0.5 rounded-full bg-accent pr-0.5 pl-[9px] text-small leading-6 font-medium text-primary">
                  <span className="truncate">{o.label}</span>
                  <span
                    aria-hidden
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); if (!disabled) toggle(o.value) }}
                    className="inline-grid size-5 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-[color-mix(in_srgb,var(--primary)_22%,var(--background))] [&_svg]:size-3"
                  ><X /></span>
                </span>
              ))}
              {chips.length > shown.length && <span className="inline-flex h-6 items-center rounded-full bg-secondary px-2 text-small font-medium text-muted-foreground">+{chips.length - shown.length}</span>}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder ?? labels.search} />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-2.5 text-body text-subtle-foreground"><LoaderCircle className="size-4 animate-spin" />{labels.loading}</div>
              ) : (
                <>
                  <CommandEmpty>{emptyText ?? labels.noResults}</CommandEmpty>
                  <CommandGroup>
                    {showAll && enabled.length > 0 && (
                      <CommandItem value="__all__" data-checked={allOn} keywords={[labels.selectAll]} onSelect={() => set(allOn ? selected.filter((v) => options.find((o) => o.value === v)?.disabled) : [...new Set([...selected, ...enabled.map((o) => o.value)])])}>
                        <Mark on={allOn} />
                        <span className="font-medium">{allOn ? labels.deselectAll : labels.selectAll}</span>
                      </CommandItem>
                    )}
                    {options.map((o) => {
                      const on = selected.includes(o.value)
                      return (
                        <CommandItem key={o.value} value={o.value} data-checked={on} keywords={[o.label]} disabled={o.disabled || (!on && maxSelected !== undefined && selected.length >= maxSelected)} onSelect={() => toggle(o.value)}>
                          <Mark on={on} />
                          <span className="truncate">{o.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <span className="absolute inset-y-0 right-1.5 flex items-center gap-1">
        {clearable && selected.length > 0 && !off && (
          <button type="button" aria-label={labels.clearSelection} onClick={() => set([])} className="inline-grid size-[22px] place-items-center rounded-md text-subtle-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus [&_svg]:size-3.5"><X /></button>
        )}
        {loading ? <LoaderCircle className="pointer-events-none size-4 animate-spin text-subtle-foreground" /> : <ChevronDown className="pointer-events-none size-4 text-subtle-foreground transition-transform duration-150 group-data-[state=open]/sel:rotate-180" />}
      </span>
    </div>
  )
}

/* Checkbox box = reference `do-sel-hop`: 16px, radius 4, line-hard border; on = primary fill + 12px white tick. */
function Mark({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={cn("inline-grid size-4 shrink-0 place-items-center rounded-[4px] border border-input bg-background text-primary-foreground transition-colors duration-[120ms]", on && "border-primary bg-primary")}>
      {on && <Check className="size-3" strokeWidth={3} />}
    </span>
  )
}
