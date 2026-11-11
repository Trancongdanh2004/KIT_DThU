import * as React from "react"
import { cn } from "@/lib/utils"

/** Ô nhập nhiều dòng; cùng kiểu với `Input` (viền nhạt, hover đậm hơn, focus viền primary + quầng mờ 3px, lỗi đỏ), co giãn theo chiều dọc. */
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full resize-y coarse:text-base rounded-md border border-field-border bg-background px-[11px] py-[7px] text-control leading-relaxed text-foreground shadow-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none outline-none enabled:hover:not-focus-visible:border-input placeholder:text-subtle-foreground focus-visible:border-primary focus-visible:shadow-focus-soft disabled:cursor-default disabled:bg-secondary disabled:text-subtle-foreground aria-invalid:border-destructive aria-invalid:focus-visible:shadow-focus-soft-danger",
        className,
      )}
      {...props}
    />
  )
}
