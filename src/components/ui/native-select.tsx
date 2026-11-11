import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface NativeSelectProps extends Omit<React.ComponentProps<"select">, "size"> {
  /** Kích cỡ ô chọn: default (36px) hoặc sm (30px). @default default */
  size?: "default" | "sm"
}

/** Ô chọn dùng thẻ `select` gốc của trình duyệt, có kiểu dáng đồng bộ. Phù hợp trên di động (hiện bộ chọn của hệ điều hành). */
export function NativeSelect({ className, size: sizeProp, children, ...props }: NativeSelectProps) {
  const ui = useUiConfig()
  const size = sizeProp ?? (ui.size === "sm" ? "sm" : "default")
  return (
    <div data-slot="native-select-wrapper" className="relative flex w-full min-w-0 ">
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "w-full min-w-0 appearance-none coarse:text-base rounded-md border border-field-border bg-background py-0 pr-9 pl-[11px] text-control text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none outline-none hover:border-muted-foreground focus-visible:border-primary focus-visible:shadow-focus-soft disabled:cursor-not-allowed disabled:bg-secondary disabled:text-subtle-foreground aria-invalid:border-destructive aria-invalid:focus-visible:shadow-focus-soft-danger data-[size=default]:h-9 data-[size=sm]:h-[30px] data-[size=sm]:text-small",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-subtle-foreground" />
    </div>
  )
}

/** Một lựa chọn của NativeSelect. */
export function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

/** Nhóm các lựa chọn của NativeSelect. */
export function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}
