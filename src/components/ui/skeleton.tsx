import * as React from "react"
import { cn } from "@/lib/utils"

/** Khung chờ: reference `do-xuong` (surface-3 fill, 3px radius) with the pulse used by shadcn's skeleton. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-[3px] bg-muted motion-reduce:animate-none", className)} {...props} />
}
