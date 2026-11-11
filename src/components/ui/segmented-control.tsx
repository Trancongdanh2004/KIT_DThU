import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface SegmentedControlOption {
  /** Giá trị trả về khi chọn. */
  value: string
  /** Nội dung hiển thị. */
  label: React.ReactNode
  /** Vô hiệu hóa riêng lựa chọn này. */
  disabled?: boolean
}

export interface SegmentedControlProps extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "onChange"> {
  /** Danh sách lựa chọn. */
  options: SegmentedControlOption[]
  /** Kích cỡ: `sm` (32px), `default` (40px), `lg` (44px). @default default */
  size?: "sm" | "default" | "lg"
  /** Cho các lựa chọn chia đều chiều ngang. */
  fullWidth?: boolean
  /** Gọi khi đổi lựa chọn (cùng nghĩa với `onValueChange`). */
  onChange?: (value: string) => void
}

const sizes = { sm: "h-6 px-2.5 text-xs", default: "h-7 px-3 text-control", lg: "h-8 px-4 text-control" }

/** Nhóm nút phân đoạn kiểu iOS, dựa trên ngữ nghĩa radio-group (mũi tên để đổi lựa chọn). Cần `aria-label`. */
export function SegmentedControl({ options, size: sizeProp, fullWidth, className, onChange, onValueChange, ...props }: SegmentedControlProps) {
  const ui = useUiConfig()
  const size = sizeProp ?? ui.size
  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented-control"
      orientation="horizontal"
      onValueChange={(v) => { onValueChange?.(v); onChange?.(v) }}
      className={cn("inline-flex items-center gap-0.5 rounded-lg bg-muted p-1", fullWidth && "flex w-full", className)}
      {...props}
    >
      {options.map((o) => (
        <RadioGroupPrimitive.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,border-color,box-shadow,opacity,transform] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm",
            sizes[size],
            fullWidth && "flex-1",
          )}
        >
          {o.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}
