"use client"

// @dthu/ui 0.2.0 · scroll-area
import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/** Scrollbar as the reference `dtb-scroll`: 10px track, pill thumb black 12% (22% on hover) with a 2px transparent inset. */
export function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="flex w-2.5 touch-none p-0.5 select-none">
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-black/12 hover:bg-black/22 dark:bg-white/15 dark:hover:bg-white/25" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
}
