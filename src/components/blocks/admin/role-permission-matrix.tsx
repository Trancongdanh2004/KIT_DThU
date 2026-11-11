"use client"

// @dthu/ui 0.2.0 · block-admin
import * as React from "react"
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MatrixRole { id: string; name: string; code: string; userCount: number }
export interface MatrixPermission { code: string; label: string }
export interface MatrixGroup { id: string; label: string; permissions: MatrixPermission[] }

export interface RolePermissionMatrixProps {
  roles: MatrixRole[]
  groups: MatrixGroup[]
  /** role id -> granted permission codes */
  granted: Record<string, string[]>
  totalPermissions?: number
  onToggle?: (roleId: string, permissionCode: string, value: boolean) => void
  className?: string
}

/** Avatar fills of the reference role cards (`qp-chip-avatar`), cycled by position. */
const mono = "font-[SFMono-Regular,Menlo,Consolas,monospace]"
const shadow = "shadow-[0_0_13px_0_rgba(236,236,241,.44)]"

/** Role cards on top and a permission x role switch matrix below (reference `qp-*`). The shell's <main> pads the page. */
export function RolePermissionMatrix({ roles, groups, granted, totalPermissions, onToggle, className }: RolePermissionMatrixProps) {
  const total = totalPermissions ?? groups.reduce((n, g) => n + g.permissions.length, 0)
  // Collapsed permission groups (RIS): only the group header row stays; click it to expand again.
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const toggleGroup = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed.has(g.id))
  const toggleAll = () => setCollapsed(allCollapsed ? new Set() : new Set(groups.map((g) => g.id)))
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {/* One compact line per role: the role code is already in the table column header, so it only shows on hover. */}
      <div className="mb-2 flex-none">
        <div className="flex gap-2.5 overflow-x-auto px-0.5 pt-0.5 pb-1.5 [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 hover:[&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-track]:bg-transparent" aria-label="Danh sách vai trò" role="list">
          {roles.map((r) => (
            <div key={r.id} role="listitem" title={r.code} className={cn("flex flex-none items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-2.5 text-control", shadow)}>
              <span className="max-w-[200px] truncate font-bold text-primary">{r.name}</span>
              <span className="font-semibold text-foreground tabular-nums">{granted[r.id]?.length ?? 0}/{total}<span className="font-normal text-muted-foreground"> quyền</span></span>
              <span className="flex items-center gap-1 text-muted-foreground tabular-nums"><Users className="size-4" aria-hidden />{r.userCount}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={cn("min-h-[200px] flex-1 overflow-auto rounded-lg border border-border bg-card [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 hover:[&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-track]:bg-transparent", shadow)}>
        <div className="relative min-h-full w-max min-w-full">
          <table className="w-full border-separate border-spacing-0 text-control">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-[6] w-[280px] min-w-[280px] border-r border-b-2 border-b-border bg-secondary px-3.5 py-2.5 text-left font-semibold text-muted-foreground shadow-[2px_0_4px_rgba(0,0,0,.04)]"><div className="flex items-center justify-between gap-2"><span>Tên quyền / Mã</span><button type="button" onClick={toggleAll} title={allCollapsed ? "Mở tất cả nhóm" : "Thu gọn tất cả nhóm"} aria-label={allCollapsed ? "Mở tất cả nhóm quyền" : "Thu gọn tất cả nhóm quyền"} className="inline-grid size-7 shrink-0 cursor-pointer place-items-center rounded border border-border bg-card text-primary outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">{allCollapsed ? <ChevronsUpDown aria-hidden className="size-4" /> : <ChevronsDownUp aria-hidden className="size-4" />}</button></div></th>
                {roles.map((r) => (
                  <th key={r.id} className="sticky top-0 z-[4] w-[130px] min-w-[130px] border-b-2 border-b-border bg-secondary px-3.5 py-2.5 text-center font-semibold text-muted-foreground"><div className="truncate font-semibold text-foreground">{r.name}</div><div className={cn("mt-0.5 text-caption text-muted-foreground", mono)}>{r.code}</div></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <GroupRows key={g.id} group={g} roles={roles} granted={granted} onToggle={onToggle} open={!collapsed.has(g.id)} onToggleOpen={() => toggleGroup(g.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** Reference `qp-switch`: 34x20 track, 16px thumb; hidden native checkbox keeps it accessible. */
function MatrixSwitch({ checked, onChange, label }: { checked: boolean; onChange?: (v: boolean) => void; label: string }) {
  return (
    <label className="relative inline-block h-5 w-[34px] cursor-pointer align-middle">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange?.(e.target.checked)} className="peer absolute m-0 size-full cursor-pointer opacity-0" />
      <span aria-hidden className="absolute inset-0 rounded-[10px] bg-[#ced4da] transition-colors duration-150 peer-checked:bg-primary peer-focus-visible:shadow-focus peer-disabled:opacity-50" />
      <span aria-hidden className="absolute top-0.5 left-0.5 size-4 rounded-full bg-card shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-transform duration-150 peer-checked:translate-x-3.5" />
    </label>
  )
}

function GroupRows({ group, roles, granted, onToggle, open, onToggleOpen }: { group: MatrixGroup; roles: MatrixRole[]; granted: Record<string, string[]>; onToggle?: RolePermissionMatrixProps["onToggle"]; open: boolean; onToggleOpen: () => void }) {
  return (
    <>
      <tr>
        <td colSpan={roles.length + 1} className="bg-secondary px-3.5 py-[7px] text-label font-bold tracking-[0.4px] text-primary uppercase"><button type="button" aria-expanded={open} onClick={onToggleOpen} title={open ? "Thu gọn nhóm" : "Mở rộng nhóm"} className="sticky left-3.5 -ml-1 inline-flex max-w-fit cursor-pointer items-center gap-1.5 rounded border-0 bg-transparent px-1 py-0.5 text-inherit uppercase outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"><ChevronDown aria-hidden className={cn("size-4 transition-transform duration-150", !open && "-rotate-90")} />{group.label}<span className="ml-1 inline-block rounded-[9px] border border-border bg-card px-[7px] text-tiny font-bold">{group.permissions.length}</span></button></td>
      </tr>
      {open && group.permissions.map((p) => (
        <tr key={p.code} className="group/row">
          <td className="sticky left-0 z-[3] w-[280px] min-w-[280px] border-r border-b border-b-border/60 bg-card px-3.5 py-2 shadow-[2px_0_4px_rgba(0,0,0,.04)] group-hover/row:bg-secondary"><div className="font-semibold text-foreground">{p.label}</div><div className={cn("mt-px text-caption text-muted-foreground", mono)}>{p.code}</div></td>
          {roles.map((r) => (
            <td key={r.id} className="border-b border-b-border/60 bg-card text-center align-middle group-hover/row:bg-secondary"><MatrixSwitch label={`${p.label} – ${r.name}`} checked={granted[r.id]?.includes(p.code) ?? false} onChange={(v) => onToggle?.(r.id, p.code, v)} /></td>
          ))}
        </tr>
      ))}
    </>
  )
}
