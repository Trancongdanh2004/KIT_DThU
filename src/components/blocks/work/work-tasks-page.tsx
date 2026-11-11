"use client"

// @dthu/ui 0.2.0 · block-work
import * as React from "react"
import { CalendarClock, Check, GripVertical, ListChecks, MoreHorizontal, Plus, RefreshCw, ListFilter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRetained } from "@/lib/use-retained"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/components/ui/toaster"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { FilterToggle, PageHead } from "@/components/blocks/shell/page-chrome"
import { includesText, parseVnDate, useControllable, usePaged } from "./work-shared"

export type WorkTaskStatus = "todo" | "doing" | "review" | "done"
export type WorkTaskPriority = "low" | "normal" | "high" | "urgent"
export type WorkTasksView = "table" | "kanban"

export interface WorkTask {
  id: string
  code: string
  title: string
  source: string
  assignee?: string
  /** dd/MM/yyyy */
  due?: string
  priority: WorkTaskPriority
  progress: number
  status: WorkTaskStatus
  description?: string
  projectId?: string
}
export interface WorkProject { id: string; code: string; name: string; progress: number }

const priorityMeta: Record<WorkTaskPriority, { label: string; variant: "secondary" | "info" | "warning" | "destructive" }> = {
  low: { label: "Thấp", variant: "secondary" },
  normal: { label: "Trung bình", variant: "info" },
  high: { label: "Cao", variant: "warning" },
  urgent: { label: "Khẩn", variant: "destructive" },
}
const statusMeta: Record<WorkTaskStatus, string> = { todo: "Chưa làm", doing: "Đang làm", review: "Chờ duyệt", done: "Hoàn thành" }
const statusOrder: WorkTaskStatus[] = ["todo", "doing", "review", "done"]
const priorityOrder: WorkTaskPriority[] = ["low", "normal", "high", "urgent"]

export interface WorkTasksPageProps {
  projects: WorkProject[]
  tasks: WorkTask[]
  /** Name of the signed-in user, used by the "Việc của tôi" filter. */
  currentUser?: string
  /** Reference date for the "Quá hạn" filter. Defaults to now. */
  today?: Date
  activeProjectId?: string | null
  onProjectChange?: (id: string | null) => void
  view?: WorkTasksView
  onViewChange?: (v: WorkTasksView) => void
  search?: string
  onSearchChange?: (v: string) => void
  selectedTaskId?: string | null
  onSelectTask?: (id: string | null) => void
  /** Fired after a task is created or moved; the block already updates its own copy of the list. */
  onTasksChange?: (tasks: WorkTask[]) => void
  className?: string
}

const initials = (name?: string) => (name ? name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() : "–")

function Assignee({ name }: { name?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden className="inline-grid size-[27px] flex-none place-items-center rounded-full border border-border bg-accent text-tiny leading-none font-bold text-primary uppercase select-none dark:border-border">{initials(name)}</span>
      <span className="block truncate text-body font-semibold">{name ?? "Chưa phân công"}</span>
    </span>
  )
}

const sideItem = "flex w-full cursor-pointer items-center gap-[9px] border-0 border-l-[3px] border-transparent bg-transparent py-[9px] pr-3 pl-[11px] text-left text-body text-foreground outline-none hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
const sideItemOn = "border-primary bg-accent"
const sideName = "line-clamp-2 font-medium leading-[1.35]"

const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

/** Task management: project sidebar, toolbar with table/kanban toggle (drag & drop between columns), create dialog and a detail sheet. */
export function WorkTasksPage({ projects: initialProjects, tasks: initialTasks, currentUser, today, activeProjectId: activeProp, onProjectChange, view: viewProp, onViewChange, search: searchProp, onSearchChange, selectedTaskId: selProp, onSelectTask, onTasksChange, className }: WorkTasksPageProps) {
  const [tasks, setTasks] = React.useState<WorkTask[]>(initialTasks)
  const [projects, setProjects] = React.useState<WorkProject[]>(initialProjects)
  const [view, setView] = useControllable<WorkTasksView>(viewProp, "table", onViewChange)
  const [search, setSearch] = useControllable<string>(searchProp, "", onSearchChange)
  const [selectedId, setSelectedId] = useControllable<string | null>(selProp, null, onSelectTask)
  const [activeProject, setActiveProject] = useControllable<string | null>(activeProp, null, onProjectChange)
  const [mine, setMine] = React.useState(false)
  const [overdue, setOverdue] = React.useState(false)
  const [priority, setPriority] = React.useState<WorkTaskPriority | null>(null)
  const [projectQuery, setProjectQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [projectOpen, setProjectOpen] = React.useState(false)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overCol, setOverCol] = React.useState<WorkTaskStatus | null>(null)
  const now = today ?? new Date()

  const commit = (next: WorkTask[]) => { setTasks(next); onTasksChange?.(next) }
  const moveTask = (id: string, status: WorkTaskStatus) => {
    const t = tasks.find((x) => x.id === id)
    if (!t || t.status === status) return
    commit(tasks.map((x) => (x.id === id ? { ...x, status, progress: status === "done" ? 100 : x.progress } : x)))
    toast.success(`Đã chuyển ${t.code} sang "${statusMeta[status]}"`)
  }

  const isOverdue = (t: WorkTask) => {
    const d = parseVnDate(t.due)
    return !!d && t.status !== "done" && d.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  }
  const visible = React.useMemo(() => tasks.filter((t) =>
    (activeProject === null || t.projectId === activeProject) &&
    (!mine || (!!currentUser && t.assignee === currentUser)) &&
    (!overdue || isOverdue(t)) &&
    (priority === null || t.priority === priority) &&
    includesText([t.code, t.title, t.description, t.source, t.assignee], search),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [tasks, activeProject, mine, overdue, priority, search, currentUser, now.getTime()])
  const paged = usePaged(visible, 20)
  const selected = tasks.find((t) => t.id === selectedId) ?? null
  // Keep the last task in the sheet while it slides out after `selectedId` is cleared.
  const shownTask = useRetained(selected)
  const visibleProjects = projects.filter((p) => includesText([p.name, p.code], projectQuery))
  const activeName = activeProject ? projects.find((p) => p.id === activeProject)?.name : null

  const rowMenu = (t: WorkTask) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground max-md:size-9" aria-label={`Thao tác ${t.code}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => setSelectedId(t.id)}>Xem chi tiết</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Chuyển trạng thái</DropdownMenuLabel>
        {statusOrder.filter((s) => s !== t.status).map((s) => <DropdownMenuItem key={s} onSelect={() => moveTask(t.id, s)}>{statusMeta[s]}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const numCls = "font-mono text-body font-semibold tabular-nums"
  const columns: Column<WorkTask>[] = [
    { key: "stt", header: "STT", width: 45, align: "center", cell: (_, i) => <span className="text-xs whitespace-nowrap text-foreground tabular-nums">{i + 1}</span> },
    { key: "title", header: "Tên công việc", cell: (t) => <div className="flex min-w-0 items-baseline gap-[9px]"><span className="font-mono text-body leading-[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-primary">{t.code}</span><span className="block truncate text-sm leading-[1.35] font-medium tracking-[-0.005em] text-foreground">{t.title}</span></div> },
    { key: "source", header: "Nguồn", width: 140, cell: (t) => <Badge variant="outline">{t.source}</Badge> },
    { key: "assignee", header: "Người thực hiện", width: 175, cell: (t) => <Assignee name={t.assignee} /> },
    { key: "due", header: "Hạn chót", width: 115, className: "whitespace-nowrap", cell: (t) => t.due ? <span className={cn(isOverdue(t) && "font-semibold text-destructive")}>{t.due}</span> : <span className="text-subtle-foreground">—</span> },
    { key: "priority", header: "Mức ưu tiên", width: 110, cell: (t) => <Badge variant={priorityMeta[t.priority].variant}>{priorityMeta[t.priority].label}</Badge> },
    { key: "progress", header: "Tiến độ", width: 125, cell: (t) => (
      <div role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${t.code}`}>
        <div className={cn(numCls, "leading-[1.2]", t.progress === 0 && "text-subtle-foreground")}>{t.progress}%</div>
        <div className="mt-[5px] h-[3px] overflow-hidden rounded-[2px] bg-[color-mix(in_srgb,var(--border)_58%,var(--card))]"><i className={cn("block h-full rounded-[2px]", t.progress === 0 ? "bg-border-strong" : "bg-primary")} style={{ width: `${t.progress}%` }} /></div>
      </div>
    ) },
    { key: "status", header: "Trạng thái", width: 125, cell: (t) => <Badge variant="outline" dot>{statusMeta[t.status]}</Badge> },
    { key: "__actions", header: <span className="sr-only">Thao tác</span>, width: 45, cell: rowMenu },
  ]

  return (
    <div className={cn("flex h-full min-h-0 gap-2", className)}>
      <aside className="hidden w-[300px] flex-none flex-col overflow-hidden rounded-lg border bg-card md:flex" aria-label="Dự án">
        <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--border)_58%,var(--card))] p-2">
          <SearchInput kbd={false} value={projectQuery} onChange={(e) => setProjectQuery(e.target.value)} placeholder="Tìm dự án…" aria-label="Tìm dự án" containerClassName="min-w-0 max-w-none flex-auto" />
          <Button variant="outline" size="toolbar-icon" className="text-muted-foreground hover:text-foreground" aria-label="Thêm dự án" title="Thêm mới dự án" onClick={() => setProjectOpen(true)}><Plus /></Button>
        </div>
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto pt-1.5 pb-2">
          <li>
            <button type="button" onClick={() => setActiveProject(null)} aria-pressed={activeProject === null} className={cn(sideItem, activeProject === null && sideItemOn)}>
              <ListChecks className="size-[17px] flex-none text-primary" aria-hidden />
              <span className={cn(sideName, activeProject === null && "font-[650] text-accent-foreground")}>Tất cả công việc</span>
            </button>
          </li>
          <li className="flex items-center justify-between px-3.5 pt-2.5 pb-1 text-caption font-bold tracking-[0.04em] text-subtle-foreground uppercase"><span>Dự án</span><span className="rounded-[10px] bg-[color-mix(in_srgb,var(--border)_58%,var(--card))] px-1.5 font-mono text-tiny font-normal text-muted-foreground">{projects.length}</span></li>
          {visibleProjects.map((p) => (
            <li key={p.id}>
              <button type="button" title={p.name} onClick={() => setActiveProject(p.id)} aria-pressed={activeProject === p.id} className={cn(sideItem, activeProject === p.id && sideItemOn)}>
                <span className={cn("size-2 flex-none rounded-full", p.progress >= 100 ? "bg-success" : "bg-border-strong")} aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className={cn(sideName, activeProject === p.id && "font-[650] text-accent-foreground")}>{p.name}</span>
                  <span className="flex items-center gap-2 text-label"><span className="font-mono text-body leading-[1.3] font-semibold tracking-[-0.01em] text-primary">{p.code}</span><span className="text-subtle-foreground">{p.progress}%</span></span>
                  <span className="block h-1 w-[120px] overflow-hidden rounded-[2px] bg-[color-mix(in_srgb,var(--border)_58%,var(--card))]" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${p.name}`}><i className="block h-full rounded-[2px] bg-info" style={{ width: `${p.progress}%` }} /></span>
                </span>
              </button>
            </li>
          ))}
          {visibleProjects.length === 0 && <li className="px-3.5 py-2 text-sm text-muted-foreground">Không có dự án phù hợp.</li>}
        </ul>
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 md:hidden">
          <Select value={activeProject ?? "__all"} onValueChange={(v) => setActiveProject(v === "__all" ? null : v)}>
            <SelectTrigger className="h-10 flex-1" aria-label="Chọn dự án"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả công việc</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="size-10 shrink-0" aria-label="Thêm dự án" onClick={() => setProjectOpen(true)}><Plus /></Button>
        </div>
        <PageHead className="max-md:hidden" title={activeName ?? "Tất cả công việc"} description={activeName ? "Công việc thuộc dự án này" : "Công việc của mọi dự án và các việc chưa thuộc dự án nào"} />
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <div className="flex-none rounded-lg border bg-card px-2.5 py-[9px] shadow-sm">
          <div className="flex items-center gap-2 max-[900px]:gap-1.5">
            <FilterToggle pressed={mine} title="Lọc công việc được giao cho tôi" className="max-[900px]:hidden" onClick={() => setMine((v) => !v)}>Việc của tôi</FilterToggle>
            <FilterToggle pressed={overdue} title="Lọc công việc đã quá hạn chót" className="max-[900px]:hidden" onClick={() => setOverdue((v) => !v)}>Quá hạn</FilterToggle>
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo mã, tên, nội dung…" aria-label="Tìm theo mã, tên, nội dung" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="toolbar" aria-label="Bộ lọc" title="Bộ lọc" className={cn("min-w-9 justify-center px-[9px] text-muted-foreground hover:text-foreground [&_svg]:size-[17px]", priority && "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent text-primary hover:text-primary")}><ListFilter /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mức ưu tiên</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setPriority(null)}>Tất cả {priority === null && <Check className="ml-auto" />}</DropdownMenuItem>
                {priorityOrder.map((p) => <DropdownMenuItem key={p} onSelect={() => setPriority(p)}>{priorityMeta[p].label}{priority === p && <Check className="ml-auto" />}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="toolbar-icon" aria-label="Làm mới" title="Tải lại danh sách" className="ml-auto text-muted-foreground hover:text-foreground max-[900px]:hidden" onClick={() => { setSearch(""); setMine(false); setOverdue(false); setPriority(null); toast.success("Đã làm mới danh sách công việc") }}><RefreshCw /></Button>
            <Button variant="outline" size="toolbar" aria-label="Nhắc việc" title="Bảng nhắc việc & hạn chót" className="text-muted-foreground hover:text-foreground max-[900px]:px-[9px]" onClick={() => toast.info("Đã gửi nhắc việc tới người thực hiện")}><CalendarClock /><span className="max-[900px]:hidden">Nhắc việc</span></Button>
            <div role="group" aria-label="Chế độ xem" className="inline-flex h-9 flex-none overflow-hidden rounded-md border max-[900px]:hidden">
              {(["table", "kanban"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("inline-flex cursor-pointer items-center border-0 border-r px-[13px] text-control font-semibold whitespace-nowrap outline-none last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary", view === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground")}>{v === "table" ? "Bảng dữ liệu" : "Bảng Kanban"}</button>
              ))}
            </div>
            <Button size="toolbar" className="flex-none max-[900px]:px-[11px]" onClick={() => setCreateOpen(true)}>+ Tạo công việc</Button>
          </div>
        </div>
        {view === "table" ? (
          <DataTable minWidthClass="table-fixed min-w-[1200px]" columns={columns} rows={paged.pageRows} total={paged.total} getRowId={(t) => t.id} onRowClick={(t) => setSelectedId(t.id)} page={paged.page} pageSize={paged.size} onPageChange={paged.setPage} onPageSizeChange={paged.setSize} emptyTitle="Không có công việc" emptyDescription="Thử đổi bộ lọc hoặc tạo công việc mới." />
        ) : (
          <div className="grid min-h-0 flex-1 auto-cols-[85%] snap-x snap-mandatory grid-flow-col gap-3 overflow-auto md:auto-cols-[minmax(14rem,1fr)] md:snap-none" role="list" aria-label="Bảng Kanban">
            {statusOrder.map((s) => {
              const items = visible.filter((t) => t.status === s)
              return (
                <div
                  key={s} role="listitem" aria-label={statusMeta[s]}
                  onDragOver={(e) => { if (dragId) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOverCol(s) } }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverCol((c) => (c === s ? null : c)) }}
                  onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain") || dragId; setOverCol(null); setDragId(null); if (id) moveTask(id, s) }}
                  className={cn("flex min-w-0 snap-start flex-col gap-2 overflow-auto rounded-lg border bg-secondary/60 p-2 transition-colors", overCol === s && "border-primary bg-accent/60")}
                >
                  <div className="flex items-center justify-between px-1 text-sm font-semibold">{statusMeta[s]}<Badge variant="secondary">{items.length}</Badge></div>
                  {items.map((t) => (
                    <article
                      key={t.id} draggable aria-label={`Thẻ ${t.code}`}
                      onDragStart={(e) => { setDragId(t.id); e.dataTransfer.setData("text/plain", t.id); e.dataTransfer.effectAllowed = "move" }}
                      onDragEnd={() => { setDragId(null); setOverCol(null) }}
                      className={cn("grid cursor-grab gap-2 rounded-md border bg-card p-3 text-sm shadow-xs active:cursor-grabbing", dragId === t.id && "opacity-50")}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1"><GripVertical className="size-3.5 text-muted-foreground" aria-hidden /><span className="font-mono text-xs font-bold text-primary">{t.code}</span></span>
                        <span className="flex items-center gap-1">
                          <Badge variant={priorityMeta[t.priority].variant}>{priorityMeta[t.priority].label}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-6 text-muted-foreground max-md:size-9" aria-label={`Chuyển ${t.code} tới cột khác`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Chuyển tới</DropdownMenuLabel>
                              {statusOrder.filter((x) => x !== t.status).map((x) => <DropdownMenuItem key={x} onSelect={() => moveTask(t.id, x)}>{statusMeta[x]}</DropdownMenuItem>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      </div>
                      <button type="button" onClick={() => setSelectedId(t.id)} className="rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{t.title}</button>
                      <Progress value={t.progress} className="h-1" aria-label={`Tiến độ ${t.code}`} />
                      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><Assignee name={t.assignee} />{t.due}</span>
                    </article>
                  ))}
                  {items.length === 0 && <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">Kéo thẻ vào đây</p>}
                </div>
              )
            })}
          </div>
        )}
        </div>
      </section>

      <Sheet open={selected !== null} onOpenChange={(o) => { if (!o) setSelectedId(null) }}>
        <SheetContent>
          {shownTask && (
            <>
              <SheetHeader>
                <span className="font-mono text-xs font-bold text-primary">{shownTask.code}</span>
                <SheetTitle>{shownTask.title}</SheetTitle>
                <SheetDescription>{shownTask.description ?? "Chưa có mô tả."}</SheetDescription>
              </SheetHeader>
              <dl className="grid grid-cols-[120px_1fr] items-center gap-x-3 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd>
                  <Select value={shownTask.status} onValueChange={(v) => moveTask(shownTask.id, v as WorkTaskStatus)}>
                    <SelectTrigger className="h-8 w-40 max-md:h-10" aria-label="Trạng thái"><SelectValue /></SelectTrigger>
                    <SelectContent>{statusOrder.map((s) => <SelectItem key={s} value={s}>{statusMeta[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </dd>
                <dt className="text-muted-foreground">Mức ưu tiên</dt><dd><Badge variant={priorityMeta[shownTask.priority].variant}>{priorityMeta[shownTask.priority].label}</Badge></dd>
                <dt className="text-muted-foreground">Nguồn</dt><dd>{shownTask.source}</dd>
                <dt className="text-muted-foreground">Người thực hiện</dt><dd><Assignee name={shownTask.assignee} /></dd>
                <dt className="text-muted-foreground">Hạn chót</dt><dd>{shownTask.due ?? "—"}</dd>
                <dt className="text-muted-foreground">Tiến độ</dt><dd className="flex items-center gap-2"><Progress value={shownTask.progress} aria-label="Tiến độ" />{shownTask.progress}%</dd>
              </dl>
            </>
          )}
        </SheetContent>
      </Sheet>

      <WorkCreateTaskDialog
        open={createOpen} onOpenChange={setCreateOpen}
        onCreate={(draft) => {
          const n = tasks.length + 1
          const t: WorkTask = { id: `new-${n}-${draft.title}`, code: `CV-${String(n).padStart(4, "0")}`, title: draft.title, source: "Nội bộ", priority: draft.priority, progress: 0, status: "todo", due: draft.due ? fmtDate(draft.due) : undefined, projectId: activeProject ?? undefined }
          commit([...tasks, t])
          toast.success(`Đã tạo công việc ${t.code}`)
        }}
      />
      <WorkCreateProjectDialog
        open={projectOpen} onOpenChange={setProjectOpen}
        onCreate={(name) => {
          const n = projects.length + 1
          setProjects([...projects, { id: `np-${n}-${name}`, code: `DA-${String(n).padStart(4, "0")}`, name, progress: 0 }])
          toast.success(`Đã thêm dự án "${name}"`)
        }}
      />
    </div>
  )
}

function WorkCreateTaskDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (d: { title: string; priority: WorkTaskPriority; due?: Date }) => void }) {
  const [title, setTitle] = React.useState("")
  const [priority, setPriority] = React.useState<WorkTaskPriority>("normal")
  const [due, setDue] = React.useState<Date | undefined>()
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => { if (open) { setTitle(""); setPriority("normal"); setDue(undefined); setError(null) } }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <form noValidate onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) { setError("Vui lòng nhập tên công việc"); return }
          onCreate({ title: title.trim(), priority, due }); onOpenChange(false)
        }}>
          <DialogHeader><DialogTitle>Tạo công việc</DialogTitle><DialogDescription>Công việc mới được thêm vào cột "Chưa làm".</DialogDescription></DialogHeader>
          <div className="grid gap-4 px-[18px] py-4">
          <div className="grid gap-1.5">
            <Label htmlFor="work-task-title">Tên công việc</Label>
            <Input id="work-task-title" value={title} onChange={(e) => { setTitle(e.target.value); setError(null) }} aria-invalid={!!error} aria-describedby={error ? "work-task-title-error" : undefined} />
            {error && <p id="work-task-title-error" role="alert" className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="work-task-priority">Mức ưu tiên</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as WorkTaskPriority)}>
                <SelectTrigger id="work-task-priority"><SelectValue /></SelectTrigger>
                <SelectContent>{priorityOrder.map((p) => <SelectItem key={p} value={p}>{priorityMeta[p].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Hạn chót</Label><DatePicker value={due} onChange={setDue} aria-label="Hạn chót" placeholder="Chọn hạn chót" /></div>
          </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit">Tạo công việc</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function WorkCreateProjectDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (name: string) => void }) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => { if (open) { setName(""); setError(null) } }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <form noValidate onSubmit={(e) => { e.preventDefault(); if (!name.trim()) { setError("Vui lòng nhập tên dự án"); return } onCreate(name.trim()); onOpenChange(false) }}>
          <DialogHeader><DialogTitle>Thêm dự án</DialogTitle><DialogDescription>Mã dự án được tạo tự động.</DialogDescription></DialogHeader>
          <div className="grid gap-1.5 px-[18px] py-4">
            <Label htmlFor="work-project-name">Tên dự án</Label>
            <Input id="work-project-name" value={name} onChange={(e) => { setName(e.target.value); setError(null) }} aria-invalid={!!error} aria-describedby={error ? "work-project-name-error" : undefined} />
            {error && <p id="work-project-name-error" role="alert" className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit">Thêm dự án</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
