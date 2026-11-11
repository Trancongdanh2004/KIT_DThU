import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface BreadcrumbItem { label: React.ReactNode; href?: string }

export function Breadcrumb({ items, className, ...props }: { items: BreadcrumbItem[] } & React.ComponentProps<"nav">) {
  const { labels } = useUiConfig()
  return (
    <nav aria-label={labels.breadcrumb} className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)} {...props}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="size-3.5" />}
          {it.href && i < items.length - 1 ? <a href={it.href} className="hover:text-foreground">{it.label}</a> : <span className={i === items.length - 1 ? "text-foreground" : undefined} aria-current={i === items.length - 1 ? "page" : undefined}>{it.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  )
}
