import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** Gốc của nhóm tab. Dùng `value`/`onValueChange` hoặc `defaultValue`; `orientation` đổi hướng phím mũi tên. */
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-3", className)} {...props} />
}

/**
 * Three looks, all from the reference:
 * - `segmented` (default): a 3px-padded tray, active = solid primary pill ('Bảng dữ liệu | Bảng Kanban').
 * - `contained`: `do-tabs--vien`, 3px padded secondary tray, active = white chip with primary text.
 * - `line`: `do-tabs--gach`, underline tabs on a 1px rule.
 */
const tabsListVariants = cva("group/tabs-list inline-flex max-w-full items-center text-muted-foreground data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch", {
  variants: {
    variant: {
      segmented: "h-10 coarse:h-12 gap-1 overflow-x-auto overflow-y-hidden rounded-lg border bg-secondary p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      contained: "h-auto gap-0.5 overflow-x-auto rounded-lg bg-secondary p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      line: "w-full gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    },
  },
  defaultVariants: { variant: "segmented" },
})

export function TabsList({ className, variant = "segmented", ...props }: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props} />
}

/** Nút chuyển tab; `value` phải khớp với `TabsContent` tương ứng. */
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 text-control font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        // segmented
        "group-data-[variant=segmented]/tabs-list:h-8 group-data-[variant=segmented]/tabs-list:coarse:h-10 group-data-[variant=segmented]/tabs-list:rounded-md group-data-[variant=segmented]/tabs-list:px-3.5 group-data-[variant=segmented]/tabs-list:font-semibold group-data-[variant=segmented]/tabs-list:transition-[color,background-color,box-shadow] group-data-[variant=segmented]/tabs-list:hover:bg-card/80 group-data-[variant=segmented]/tabs-list:focus-visible:shadow-focus group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-primary group-data-[variant=segmented]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=segmented]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=segmented]/tabs-list:data-[state=active]:hover:bg-primary",
        // contained (do-tabs--vien)
        "group-data-[variant=contained]/tabs-list:h-8 group-data-[variant=contained]/tabs-list:rounded-md group-data-[variant=contained]/tabs-list:px-3 group-data-[variant=contained]/tabs-list:focus-visible:shadow-focus group-data-[variant=contained]/tabs-list:data-[state=active]:bg-card group-data-[variant=contained]/tabs-list:data-[state=active]:text-primary group-data-[variant=contained]/tabs-list:data-[state=active]:shadow-sm",
        // line (do-tabs--gach)
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:rounded-t-md group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:focus-visible:shadow-focus group-data-[variant=line]/tabs-list:data-[state=active]:border-primary group-data-[variant=line]/tabs-list:data-[state=active]:text-primary",
        // vertical lists (e.g. in dialogs)
        "group-data-[orientation=vertical]/tabs-list:py-2",
        className,
      )}
      {...props}
    />
  )
}
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none focus-visible:rounded-md focus-visible:shadow-focus", className)} {...props} />
}
