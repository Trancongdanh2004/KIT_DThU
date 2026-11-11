"use client"

// @dthu/ui 0.2.0 · label
import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * Nhãn trường (reference `do-f-nhan`: 12.5px / 600 / ink). Dấu sao bắt buộc là `<em className="bb">*</em>`
 * hoặc dùng `required` để tự thêm dấu sao đỏ.
 */
export function Label({ className, children, required, ...props }: React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** Thêm dấu sao đỏ sau nhãn (chỉ hiển thị, không đặt thuộc tính required lên điều khiển). */
  required?: boolean
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("block text-small leading-[1.4] font-semibold text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 [&_.bb]:ml-[3px] [&_.bb]:text-destructive [&_.bb]:not-italic", className)}
      {...props}
    >
      {children}
      {required && <em aria-hidden className="bb">*</em>}
    </LabelPrimitive.Root>
  )
}
