"use client"

// @dthu/ui 0.2.0 · spinner
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export const spinnerVariants = cva("shrink-0 animate-spin", {
  variants: {
    size: { xs: "size-3", sm: "size-4", md: "size-5", lg: "size-8", xl: "size-12" },
  },
  defaultVariants: { size: "sm" },
})

export interface SpinnerProps extends Omit<React.ComponentProps<"svg">, "ref">, VariantProps<typeof spinnerVariants> {
  /** Kích cỡ: xs, sm (mặc định), md, lg, xl. */
  size?: VariantProps<typeof spinnerVariants>["size"]
  /** Nhãn đọc cho trình đọc màn hình (mặc định "Đang tải"). @default Đang tải */
  label?: string
}

/** Biểu tượng đang tải xoay tròn. Màu theo `currentColor`, nên dùng được trong Button. */
export function Spinner({ className, size, label, ...props }: SpinnerProps) {
  const { labels } = useUiConfig()
  return (
    <LoaderCircle
      data-slot="spinner"
      role="status"
      aria-label={label ?? labels.spinner}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  )
}
