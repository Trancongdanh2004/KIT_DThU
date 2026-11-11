"use client"

// @dthu/ui 0.2.0 · input-group
import * as React from "react"
import { Search } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/** Ô nhập có phần phụ ở đầu/cuối (biểu tượng, chữ, nút). Đặt `InputGroupInput` hoặc `InputGroupTextarea` làm ô nhập chính. */
export function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="input-group"
      className={cn(
        "group/input-group relative flex w-full min-w-0 items-center rounded-md border border-field-border bg-background transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        "hover:border-muted-foreground has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:shadow-focus-soft",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:shadow-focus-soft-danger",
        "has-[[data-slot=input-group-control]:disabled]:bg-secondary has-[[data-slot=input-group-control]:disabled]:text-subtle-foreground",
        "[&>[data-slot=input-group-control]]:px-[11px] has-[>[data-align=inline-start]]:[&>[data-slot=input-group-control]]:pl-[9px] has-[>[data-align=inline-end]]:[&>[data-slot=input-group-control]]:pr-[9px]",
        "h-9 has-[>textarea]:h-auto has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

const addonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-control font-medium text-subtle-foreground select-none [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-[11px]",
        "inline-end": "order-last pr-[11px]",
        "block-start": "order-first w-full justify-start px-3 pt-2",
        "block-end": "order-last w-full justify-start px-3 pb-2",
      },
    },
    defaultVariants: { align: "inline-start" },
  },
)

export interface InputGroupAddonProps extends React.ComponentProps<"div">, VariantProps<typeof addonVariants> {
  /** Vị trí: inline-start, inline-end (cùng hàng) hoặc block-start, block-end (trên/dưới ô nhập, cho textarea). */
  align?: "inline-start" | "inline-end" | "block-start" | "block-end"
}

/** Phần phụ của InputGroup. Bấm vào vùng trống sẽ đưa con trỏ vào ô nhập. */
export function InputGroupAddon({ className, align = "inline-start", onClick, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(addonVariants({ align }), className)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement?.querySelector<HTMLElement>("[data-slot=input-group-control]")?.focus()
      }}
      {...props}
    />
  )
}

/** Chữ tĩnh trong InputGroupAddon (tiền tố, hậu tố như "https://", "@acme.vn"). */
export function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="input-group-text" className={cn("flex items-center gap-2 text-control text-muted-foreground [&_svg]:size-4 [&_svg]:pointer-events-none", className)} {...props} />
}

/** Nút nhỏ đặt trong InputGroupAddon. */
export function InputGroupButton({ className, variant = "ghost", size = "sm", type = "button", ...props }: React.ComponentProps<typeof Button>) {
  return <Button type={type} data-slot="input-group-button" variant={variant} size={size} className={cn("h-7 gap-1.5 px-2 text-xs shadow-none", (size === "icon" || size === "icon-sm") && "size-7 p-0", className)} {...props} />
}

/** Ô nhập một dòng không viền dùng trong InputGroup. */
export function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn("h-full flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:shadow-none focus-visible:ring-0 aria-invalid:ring-0 aria-invalid:focus-visible:shadow-none aria-invalid:focus-visible:ring-0 disabled:bg-transparent", className)}
      {...props}
    />
  )
}

/** Ô nhập nhiều dòng không viền dùng trong InputGroup. */
export function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn("flex-1 resize-none rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:shadow-none focus-visible:ring-0 aria-invalid:ring-0 aria-invalid:focus-visible:shadow-none aria-invalid:focus-visible:ring-0 disabled:bg-transparent", className)}
      {...props}
    />
  )
}

/** Chip phím tắt (vd. "/") đặt cuối ô tìm kiếm: nền surface-2, chữ mono 11px, viền line, bo 4. */
export function InputGroupKbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="input-group-kbd" className={cn("rounded-[4px] border border-border bg-secondary px-[5px] font-mono text-caption leading-[1.45] font-normal text-subtle-foreground", className)} {...props} />
}

export interface SearchInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Chip phím tắt hiển thị bên phải (mặc định "/"); đặt `false` để ẩn. */
  kbd?: React.ReactNode | false
  /** Class cho khung ngoài (độ rộng...). Class của chính ô nhập dùng `inputClassName`. */
  containerClassName?: string
}

/**
 * Ô tìm kiếm của thanh công cụ (reference `dtb-tsearch`): 36px, bo 6, viền line, kính lúp 16px, chữ 14px, chip "/" bên phải;
 * viền nhạt, hover đậm hơn, focus = viền primary + quầng mờ 3px (như `Input`). Co giãn 140–420px (basis 260).
 */
export function SearchInput({ className, containerClassName, kbd = "/", ...props }: SearchInputProps) {
  return (
    <div
      data-slot="search-input"
      className={cn("relative flex h-9 coarse:h-11 min-w-[140px] max-w-[420px] flex-[1_1_260px] items-center gap-[9px] rounded-md border border-field-border bg-background px-[11px] text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none hover:not-focus-within:border-input focus-within:border-primary focus-within:shadow-focus-soft max-[900px]:max-w-none max-[900px]:min-w-0 max-[900px]:flex-auto", containerClassName)}
    >
      <Search aria-hidden className="size-4 shrink-0 text-subtle-foreground" strokeWidth={2.2} />
      <input type="search" className={cn("min-w-[60px] flex-1 appearance-none border-0 bg-transparent p-0 text-sm text-inherit outline-none placeholder:text-subtle-foreground [&::-webkit-search-cancel-button]:hidden", className)} {...props} />
      {kbd !== false && <InputGroupKbd aria-hidden className="max-sm:hidden">{kbd}</InputGroupKbd>}
    </div>
  )
}
