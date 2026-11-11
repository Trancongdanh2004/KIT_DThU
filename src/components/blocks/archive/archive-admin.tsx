import * as React from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArchiveStat } from "./archive-shared"
import type { ArchiveKpi } from "./archive-report"

export interface ArchiveAdminNavItem { id: string; label: string; icon?: React.ReactNode }
export interface ArchiveAdminNavGroup { heading: string; items: ArchiveAdminNavItem[] }

export interface ArchiveAdminPageProps {
  nav: ArchiveAdminNavGroup[]
  active: string
  onActiveChange?: (id: string) => void
  title: string
  kpis?: ArchiveKpi[]
  /** Section content, usually an `ArchiveAuditPage`/`ArchiveAdminListPage` with `bare`. */
  children: React.ReactNode
}

/** Administration (quản trị): grouped side navigation, section title, KPI tiles and the section content. */
export function ArchiveAdminPage({ nav, active, onActiveChange, title, kpis, children }: ArchiveAdminPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 max-md:overflow-y-auto md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-4">
      <Select value={active} onValueChange={(v) => onActiveChange?.(v)}>
        <SelectTrigger aria-label="Quản trị lưu trữ" className="w-full shrink-0 bg-card md:hidden"><SelectValue /></SelectTrigger>
        <SelectContent>
          {nav.flatMap((g) => g.items.map((it) => <SelectItem key={it.id} value={it.id}>{it.label}</SelectItem>))}
        </SelectContent>
      </Select>
      <nav aria-label="Quản trị lưu trữ" className="sticky top-0 hidden flex-col gap-2.5 rounded-[9px] border bg-card p-2 shadow-sm md:flex">
        {nav.map((g) => (
          <div key={g.heading} className="flex flex-col gap-0.5">
            <div className="px-2.5 pt-1 pb-1.5 text-caption font-bold tracking-[0.05em] text-subtle-foreground uppercase">{g.heading}</div>
            {g.items.map((it) => (
              <button key={it.id} type="button" aria-current={it.id === active ? "page" : undefined} onClick={() => onActiveChange?.(it.id)}
                className={cn("flex w-full cursor-pointer items-center gap-2 rounded-md border px-2.5 py-[7px] text-left text-control outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground", it.id === active ? "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent font-bold text-primary [&_svg]:text-primary" : "border-transparent text-foreground")}>
                {it.icon}<span className="min-w-0 flex-1 truncate">{it.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <section className="flex h-full min-h-0 min-w-0 flex-col" aria-label={title}>
        <h2 className="mx-0 mt-0.5 mb-3 text-title font-bold text-foreground">{title}</h2>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {kpis && <div className="grid shrink-0 grid-cols-2 gap-2.5 lg:grid-cols-5">{kpis.map((k) => <ArchiveStat key={k.label} {...k} />)}</div>}
          <div className="min-h-0 flex-1 max-md:min-h-[28rem]">{children}</div>
        </div>
      </section>
    </div>
  )
}
