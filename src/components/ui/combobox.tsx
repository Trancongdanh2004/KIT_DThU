import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface ComboboxOption { value: string; label: string }

/** Searchable single-select. */
export function Combobox({ options, value, onChange, placeholder, searchPlaceholder, emptyText, className, disabled, loading, id, "aria-label": ariaLabel, "aria-invalid": ariaInvalid }: {
  /** Danh sách lựa chọn `{ value, label }`. */
  options: ComboboxOption[]
  /** Giá trị đang chọn (điều khiển từ ngoài). */
  value?: string
  /** Gọi khi chọn một mục, trả về `value` của mục đó. */
  onChange?: (v: string) => void
  /** Chữ hiện khi chưa chọn. @default Chọn… */
  placeholder?: string
  /** Chữ gợi ý trong ô tìm kiếm. @default Tìm… */
  searchPlaceholder?: string
  /** Chữ hiện khi không có kết quả tìm kiếm. @default Không có kết quả */
  emptyText?: string
  /** Class bổ sung cho nút mở. */
  className?: string
  /** Vô hiệu hoá. */
  disabled?: boolean
  /** Đang nạp danh sách: hiện "Đang tải…" thay cho kết quả rỗng. */
  loading?: boolean
  id?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
}) {
  const { labels } = useUiConfig()
  const [open, setOpen] = React.useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-busy={loading || undefined}
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          className={cn(
            "group/sel flex h-9 w-full coarse:h-11 coarse:text-base cursor-pointer items-center gap-1.5 rounded-md border border-field-border bg-background pr-1.5 pl-[11px] text-left text-body leading-[22px] text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none outline-none hover:border-muted-foreground focus-visible:border-primary focus-visible:shadow-focus-soft data-[state=open]:border-primary data-[state=open]:shadow-focus-soft disabled:cursor-not-allowed disabled:bg-secondary disabled:text-subtle-foreground aria-invalid:border-destructive aria-invalid:focus-visible:shadow-focus-soft-danger",
            !current && "text-subtle-foreground",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{current?.label ?? placeholder ?? labels.select}</span>
          <ChevronDown className="size-4 shrink-0 text-subtle-foreground transition-transform duration-150 group-data-[state=open]/sel:rotate-180 group-data-[state=open]/sel:text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? labels.search} />
          <CommandList>
            <CommandEmpty>{loading ? labels.loading : (emptyText ?? labels.noResults)}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.label} data-checked={o.value === value} onSelect={() => { onChange?.(o.value); setOpen(false) }}>
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
