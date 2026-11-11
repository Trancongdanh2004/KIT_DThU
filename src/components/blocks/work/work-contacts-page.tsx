"use client"

// @dthu/ui 0.2.0 · block-work
import * as React from "react"
import { Building2, Copy, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toaster"
import { DataTable, FilterBar, type Column } from "@/components/blocks/shell/data-table"
import { WORK_ALL, WorkAvatar, WorkFilterField, copyText, includesText, useControllable, usePaged, workInitials } from "./work-shared"

export interface WorkContact { id: string; name: string; code: string; phone?: string; email: string; unit: string; position: string }

export interface WorkContactsPageProps {
  contacts: WorkContact[]
  units: string[]
  positions: string[]
  search?: string
  onSearchChange?: (v: string) => void
  unit?: string
  onUnitChange?: (v: string) => void
  position?: string
  onPositionChange?: (v: string) => void
  onCopyEmail?: (email: string) => void
  onRefresh?: () => void
  className?: string
}

/** Contact directory: search, unit and position filters (applied to the rows), pagination, copy-email action. */
export function WorkContactsPage({ contacts, units, positions, search: searchProp, onSearchChange, unit: unitProp, onUnitChange, position: positionProp, onPositionChange, onCopyEmail, onRefresh, className }: WorkContactsPageProps) {
  const [search, setSearch] = useControllable<string>(searchProp, "", onSearchChange)
  const [unit, setUnit] = useControllable<string>(unitProp, WORK_ALL, onUnitChange)
  const [position, setPosition] = useControllable<string>(positionProp, WORK_ALL, onPositionChange)
  const rows = React.useMemo(() => contacts.filter((c) =>
    (unit === WORK_ALL || c.unit === unit) && (position === WORK_ALL || c.position === position) &&
    includesText([c.name, c.email, c.phone, c.code], search)), [contacts, unit, position, search])
  const paged = usePaged(rows, 20)
  const copy = (value: string, what: string) => { void copyText(value); onCopyEmail?.(value); toast.success(`Đã sao chép ${what}`) }
  const columns: Column<WorkContact>[] = [
    { key: "stt", header: "STT", width: 45, align: "center", cell: (_, i) => <span className="text-xs whitespace-nowrap text-foreground tabular-nums">{i + 1}</span> },
    { key: "name", header: "Cán bộ / viên chức", cell: (c) => (
      <div className="flex min-w-0 items-center gap-2">
        <WorkAvatar>{workInitials(c.name)}</WorkAvatar>
        <span className="block min-w-0"><span className="block truncate text-body font-semibold">{c.name}</span><span className="mt-[3px] flex text-meta text-subtle-foreground"><span className="font-mono text-label font-medium whitespace-nowrap">Mã: {c.code}</span></span></span>
      </div>
    ) },
    { key: "phone", header: "Số điện thoại", width: 160, className: "whitespace-nowrap", cell: (c) => c.phone ?? <span className="text-subtle-foreground">—</span> },
    { key: "email", header: "Email", cell: (c) => (
      <div className="group/mail flex min-w-0 items-center">
        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="mr-2 inline-flex min-w-0 items-center gap-1 text-primary no-underline"><Mail className="size-3.5 shrink-0" aria-hidden /><span className="truncate">{c.email}</span></a>
        <button type="button" className="inline-grid shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-0 text-muted-foreground opacity-35 transition-opacity group-hover/row:opacity-80 hover:!text-primary hover:!opacity-100" aria-label={`Sao chép ${c.email}`} title="Sao chép email" onClick={(e) => { e.stopPropagation(); copy(c.email, "email") }}><Copy className="size-3.5" /></button>
      </div>
    ) },
    { key: "unit", header: "Đơn vị / Phòng ban", width: 220, cell: (c) => <div className="flex min-w-0 items-center gap-1"><Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /><span className="block truncate text-sm leading-[1.35] font-medium tracking-[-0.005em]" title={c.unit}>{c.unit}</span></div> },
    { key: "position", header: "Chức vụ", width: 160, cell: (c) => <Badge variant="info">{c.position}</Badge> },
    { key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 51, cell: (c) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button type="button" className="grid size-[30px] cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-title leading-none text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground" aria-label={`Thao tác ${c.name}`} title="Thao tác khác">⋯</button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => copy(c.email, "email")}>Sao chép email</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copy(c.code, "mã cán bộ")}>Sao chép mã cán bộ</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ]
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); paged.reset() }} searchPlaceholder="Tìm theo họ tên, email, SĐT, mã cán bộ…"
        onRefresh={() => { setSearch(""); setUnit(WORK_ALL); setPosition(WORK_ALL); paged.reset(); onRefresh?.(); toast.success("Đã làm mới danh bạ") }}
        filters={<><WorkFilterField label="Đơn vị" width={250} value={unit} options={units} onChange={(v) => { setUnit(v); paged.reset() }} /><WorkFilterField label="Chức vụ" width={210} value={position} options={positions} onChange={(v) => { setPosition(v); paged.reset() }} /></>} />
      <DataTable minWidthClass="table-fixed min-w-[1056px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(c) => c.id} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} emptyTitle="Không tìm thấy liên hệ" emptyDescription="Thử đổi từ khóa hoặc bộ lọc." />
    </div>
  )
}
