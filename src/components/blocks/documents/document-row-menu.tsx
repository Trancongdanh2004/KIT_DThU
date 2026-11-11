import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface DocumentRowMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  destructive?: boolean
  separatorBefore?: boolean
  onSelect?: () => void
}

/** "⋯" actions menu for a list row. Stops click propagation so it never triggers the row's own click (detail viewer). */
export function DocumentRowMenu({ items, label = "Thao tác khác" }: { items: DocumentRowMenuItem[]; label?: string }) {
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button type="button" aria-label={label} title={label} className="grid size-[30px] cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-title leading-none text-subtle-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary data-[state=open]:bg-muted data-[state=open]:text-foreground">⋯</button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {items.map((it) => (
            <React.Fragment key={it.id}>
              {it.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem variant={it.destructive ? "destructive" : "default"} onSelect={() => it.onSelect?.()}>{it.icon}{it.label}</DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  )
}
