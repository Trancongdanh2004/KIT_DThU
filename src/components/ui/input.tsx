import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * 1:1 with the reference text input (`do-ip` + shadcn classes): 36px, radius 6, 13.5px, padding 7/11, placeholder ink-faint.
 * Border: soft `--field-border` at rest, `--input` on hover, `--primary` + 3px tinted halo (`shadow-focus-soft`) on focus;
 * invalid = red border + red halo (`shadow-focus-soft-danger`) on focus; disabled = surface-2 fill (no opacity).
 * Border and halo ease in over 150ms (off under reduced motion). Every text field and dropdown trigger shares this look;
 * buttons and selection controls keep the solid `shadow-focus` keyboard ring.
 */
/** Ô nhập một dòng. Nhận mọi thuộc tính của thẻ `input`; đặt `aria-invalid` để hiện trạng thái lỗi. */
export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full coarse:h-11 coarse:text-base min-w-0 rounded-md border border-field-border bg-background px-[11px] py-[7px] text-control text-foreground shadow-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none outline-none enabled:hover:not-focus-visible:border-input placeholder:text-subtle-foreground file:border-0 file:bg-transparent file:text-control file:font-medium focus-visible:border-primary focus-visible:shadow-focus-soft disabled:cursor-default disabled:bg-secondary disabled:text-subtle-foreground aria-invalid:border-destructive aria-invalid:focus-visible:shadow-focus-soft-danger",
        className,
      )}
      {...props}
    />
  )
}
