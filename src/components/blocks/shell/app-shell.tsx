"use client"

// @dthu/ui 0.2.0 · block-shell
import * as React from "react"
import { ArrowRightToLine, ChevronDown, ChevronRight, CircleX, ListX, MessageSquareText, Pin, PinOff, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useMediaQuery } from "@/lib/use-media-query"

export interface ShellNavChild {
  id: string
  label: string
  href?: string
  /** Third level: turns the child into a sub-group (collapsible when expanded, a nested flyout when the rail is collapsed). */
  items?: ShellNavChild[]
}
export interface ShellNavItem {
  id: string
  label: string
  icon: React.ReactNode
  /** A section heading printed above this item in the expanded menu ("Nghiệp vụ văn bản"...). */
  section?: string
  /** Link target for items without children. */
  href?: string
  /** Children turn the item into an expandable parent (flyout when the rail is collapsed). */
  items?: ShellNavChild[]
}
export interface ShellShortcut { id: string; label: string; icon: React.ReactNode; badge?: number; href?: string }
export interface ShellTab {
  id: string
  label: string
  icon?: React.ReactNode
  closable?: boolean
  /** Show only the icon (the pinned home tab). */
  iconOnly?: boolean
  /** Pinned by the user: drawn narrower with a pin mark instead of the close button, and cannot be closed until unpinned. */
  pinned?: boolean
}
export interface ShellUser { name: string; username: string; initials: string }

export interface AppShellProps {
  /** Compact logo (36px) shown in the top bar when the menu is collapsed. */
  brand?: React.ReactNode
  /** Wide logo shown when the menu is expanded. Defaults to `brand`. */
  brandWide?: React.ReactNode
  nav: ShellNavItem[]
  /** Id of the nav item (leaf or parent) that contains the current page. */
  activeNav?: string
  /** Id of the active child (or leaf) for the highlight. */
  activeNavItem?: string
  /** Called when a leaf item is chosen. */
  onNavChange?: (id: string) => void
  /** Called when a child of a parent is chosen. */
  onNavItemSelect?: (parentId: string, childId: string) => void
  /** Expanded menu shows labels, sections and children. Controlled; toggled by the hamburger button. */
  menuExpanded?: boolean
  onMenuExpandedChange?: (expanded: boolean) => void
  /** Called when a shortcut is clicked. If provided the default link navigation is prevented. */
  onShortcutSelect?: (id: string) => void
  shortcuts?: ShellShortcut[]
  /** Top-bar actions. Use `ShellIconButton` for consistent sizing. */
  toolbar?: React.ReactNode
  /** Content of the account dropdown. When omitted the account button is not interactive. */
  userMenu?: React.ReactNode
  /** Replaces the user block pinned to the bottom of the menu. */
  railBottom?: React.ReactNode
  user: ShellUser
  tabs?: ShellTab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  onTabClose?: (id: string) => void
  /** Closes several tabs at once (right-click menu: close others / to the right / all). `nextActive` is the tab to show when the active one is among them. Without it the shell calls `onTabClose` per tab. */
  onTabsClose?: (ids: string[], nextActive?: string) => void
  /** Enables "Ghim tab" / "Bỏ ghim" in the right-click menu. */
  onTabPin?: (id: string, pinned: boolean) => void
  searchPlaceholder?: string
  /** Content of the floating chat drawer. Receives a `close` callback. When provided, a round chat button floats at the bottom right. */
  chatPanel?: (api: { close: () => void }) => React.ReactNode
  chatLabel?: string
  children: React.ReactNode
  className?: string
}

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")

/** Three bars of decreasing length that morph into an X when `open`: the toggle of the reference UI. */
export function MenuLeftIcon({ open = false, className }: { open?: boolean; className?: string }) {
  const bar = "absolute left-0 h-0.5 rounded-sm bg-current transition-[transform,width,opacity] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
  return (
    <span aria-hidden className={cn("group/bars relative block h-3.5 w-[18px]", className)}>
      <span className={cn(bar, "top-0 w-full", open && "top-1.5 rotate-45")} />
      <span className={cn(bar, "top-1.5 w-[72%] group-hover/bars:w-full", open && "opacity-0")} />
      <span className={cn(bar, "top-3 w-1/2 group-hover/bars:w-full", open && "top-1.5 w-full -rotate-45")} />
    </span>
  )
}

/** Top-bar icon button: 44x56 hit area, 22px icon, optional red count badge. */
export function ShellIconButton({ label, badge, className, children, ...props }: React.ComponentProps<"button"> & { label: string; badge?: number }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn("relative isolate inline-flex h-14 w-11 shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 text-muted-foreground transition-colors before:absolute before:inset-x-1 before:inset-y-3 before:-z-10 before:rounded-lg before:transition-colors before:content-[''] hover:text-foreground hover:before:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary max-[576px]:w-9 [&_svg]:size-5", className)} {...props}>
      {children}
      {badge ? <span className="absolute top-2.5 right-1 min-w-[17px] rounded-full bg-destructive px-[5px] py-0.5 text-center text-micro leading-none font-semibold text-white ring-2 ring-background max-[576px]:right-0">{badge}</span> : null}
    </button>
  )
}

/**
 * Decorative digital-transformation motif for the bottom of the side menu: a honeycomb grid that fades in towards the
 * bottom, circuit traces ending in nodes, and a soft glow. White strokes at low opacity, so it works on any menu colour.
 */
function SidebarArt() {
  const id = React.useId().replace(/:/g, "")
  const hex = (cx: number, cy: number) => `M${cx} ${cy - 14}l12.12 7v14L${cx} ${cy + 14}l-12.12-7v-14Z`
  return (
    <svg aria-hidden viewBox="0 0 256 360" preserveAspectRatio="xMinYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[360px] max-h-[62%] w-full">
      <defs>
        <pattern id={`${id}h`} width="24.24" height="42" patternUnits="userSpaceOnUse">
          <path d={`${hex(12.12, 14)}${hex(0, 35)}${hex(24.24, 35)}`} fill="none" stroke="#fff" strokeWidth="1" />
        </pattern>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0.05" stopColor="#fff" stopOpacity="0" /><stop offset="0.6" stopColor="#fff" stopOpacity="1" /></linearGradient>
        <mask id={`${id}m`}><rect width="256" height="360" fill={`url(#${id}f)`} /></mask>
        <radialGradient id={`${id}g`} cx="0.15" cy="1" r="0.75"><stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.55" /><stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="256" height="360" fill={`url(#${id}g)`} />
      <rect width="256" height="360" fill={`url(#${id}h)`} mask={`url(#${id}m)`} opacity="0.16" />
      <g fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.34" mask={`url(#${id}m)`}>
        <path d="M22 360v-58l24-24h44" /><circle cx="93" cy="278" r="3" />
        <path d="M58 360v-30h62" /><circle cx="123" cy="330" r="3" />
        <path d="M150 360v-40h40l16-16v-36" /><circle cx="206" cy="265" r="3" />
        <path d="M236 360V244l-22-22v-40" /><circle cx="214" cy="179" r="3" />
        <path d="M112 360v-14" /><path d="M180 360v-22h26" /><circle cx="209" cy="338" r="2.2" />
      </g>
      <g fill="#fff" opacity="0.5">
        <circle cx="93" cy="278" r="1.2" /><circle cx="206" cy="265" r="1.2" /><circle cx="214" cy="179" r="1.2" /><circle cx="46" cy="300" r="1.4" /><circle cx="170" cy="300" r="1" /><circle cx="130" cy="250" r="1" />
      </g>
    </svg>
  )
}

/**
 * Top bar + side menu + multi-tab workspace, reproducing the reference UI.
 * <=992px: off-canvas menu and no tab bar. 993px and up: collapsed (70px) or expanded (256px) menu.
 */
export function AppShell({ brand, brandWide, nav, activeNav, activeNavItem, onNavChange, onNavItemSelect, menuExpanded = false, onMenuExpandedChange, onShortcutSelect, shortcuts = [], toolbar, userMenu, railBottom, user, tabs = [], activeTab, onTabChange, onTabClose, onTabsClose, onTabPin, searchPlaceholder = "Tìm chức năng", chatPanel, chatLabel = "Tin nhắn nội bộ", children, className }: AppShellProps) {
  const [chatOpen, setChatOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 993px)", true)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(activeNav ? [activeNav] : []))
  const searchRef = React.useRef<HTMLInputElement>(null)
  // Tab đóng được qua menu chuột phải: bỏ tab cố định (trang chủ) và tab đã ghim.
  const closableTabs = tabs.filter((t) => t.closable && !t.pinned)
  const closeTabs = (ids: string[], nextActive?: string) => {
    if (ids.length === 0) return
    if (onTabsClose) onTabsClose(ids, nextActive)
    else ids.forEach((id) => onTabClose?.(id))
  }
  const focusSearch = React.useRef(false)
  React.useEffect(() => { if (isDesktop) setDrawerOpen(false) }, [isDesktop])
  React.useEffect(() => { if (activeNav) setOpen((s) => (s.has(activeNav) ? s : new Set(s).add(activeNav))) }, [activeNav])
  // Mở sẵn nhóm cấp 3 đang chứa trang hiện tại.
  const activeSub = React.useMemo(() => nav.flatMap((n) => n.items ?? []).find((c) => c.items?.some((g) => g.id === activeNavItem))?.id, [nav, activeNavItem])
  React.useEffect(() => { if (activeSub) setOpen((s) => (s.has(activeSub) ? s : new Set(s).add(activeSub))) }, [activeSub])
  const expanded = isDesktop ? menuExpanded : true
  React.useEffect(() => { if (expanded && focusSearch.current) { focusSearch.current = false; searchRef.current?.focus() } }, [expanded])

  const q = fold(query.trim())
  const view = React.useMemo(() => nav.map((n) => {
    if (!q) return { n, show: true, children: n.items }
    const self = fold(n.label).includes(q)
    const kids = n.items?.flatMap((c) => {
      if (self || fold(c.label).includes(q)) return [c]
      const sub = c.items?.filter((g) => fold(g.label).includes(q))
      return sub?.length ? [{ ...c, items: sub }] : []
    })
    return { n, show: self || (kids?.length ?? 0) > 0, children: kids }
  }), [nav, q])
  const closeDrawer = () => { if (!isDesktop) setDrawerOpen(false) }
  const toggle = (id: string) => setOpen((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x })

  const bar = "relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 py-[7px] text-left text-sm leading-[1.35] font-medium text-sidebar-foreground transition-colors"
  const iconCls = "shrink-0 text-sidebar-foreground/70 transition-colors [&_svg]:size-[17px]"
  const childCls = "my-px flex w-full items-center gap-2 rounded-md px-2.5 py-[5px] text-body leading-[1.35] text-sidebar-foreground/70 no-underline hover:bg-white/[0.07] hover:text-white"
  const childLink = (parentId: string, c: ShellNavChild) => {
    const on = c.id === activeNavItem
    return (
      <a href={c.href ?? `#${c.id}`} aria-current={on ? "page" : undefined}
        onClick={onNavItemSelect ? (e) => { e.preventDefault(); onNavItemSelect(parentId, c.id); closeDrawer() } : undefined}
        className={cn(childCls, on && "bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
        <span className="min-w-0 flex-1 truncate">{c.label}</span>
      </a>
    )
  }

  const expandedList = (
    <ul className="m-0 list-none p-0 px-2.5 pb-2.5">
      {view.filter((v) => v.show).map(({ n, children }, i, arr) => {
        const isOpen = !!q || open.has(n.id)
        const active = n.id === activeNav
        const showSection = n.section && (i === 0 || arr[i - 1]!.n.section !== n.section)
        return (
          <React.Fragment key={n.id}>
            {showSection && (
              <li className="flex items-center gap-2 px-2.5 pt-4 pb-1.5 text-tiny font-semibold text-sidebar-foreground/70">
                <span>{n.section}</span>
              </li>
            )}
            <li>
              {n.items?.length ? (
                <div data-state={isOpen ? "open" : "closed"}>
                  <button type="button" aria-expanded={isOpen} title={n.label} onClick={() => toggle(n.id)} className={cn(bar, "my-px hover:bg-white/[0.07] hover:text-white", isOpen && "text-white", (isOpen || active) && "[&_.ic]:text-white")}>
                    <span className={cn(iconCls, "ic")}>{n.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{n.label}</span>
                    <ChevronRight className={cn("size-3.5 shrink-0 opacity-55 transition-transform duration-150", isOpen && "rotate-90")} aria-hidden />
                  </button>
                  {isOpen && (
                    <ul className="m-0 list-none pt-0.5 pr-0 pb-1.5 pl-7">
                      {children?.map((c) => {
                        if (!c.items?.length) return <li key={c.id}>{childLink(n.id, c)}</li>
                        const subOpen = !!q || open.has(c.id)
                        const holdsActive = c.items.some((g) => g.id === activeNavItem)
                        return (
                          <li key={c.id}>
                            <button type="button" aria-expanded={subOpen} title={c.label} onClick={() => toggle(c.id)}
                              className={cn(childCls, "cursor-pointer border-0 bg-transparent text-left", (subOpen || holdsActive) && "text-white")}>
                              <span className="min-w-0 flex-1 truncate">{c.label}</span>
                              <ChevronRight className={cn("size-3.5 shrink-0 opacity-55 transition-transform duration-150", subOpen && "rotate-90")} aria-hidden />
                            </button>
                            {subOpen && (
                              <ul className="my-0.5 ml-2.5 list-none border-l border-white/[0.14] p-0 pl-2">
                                {c.items.map((g) => <li key={g.id}>{childLink(n.id, g)}</li>)}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                <a href={n.href ?? `#${n.id}`} title={n.label} aria-current={active ? "page" : undefined}
                  onClick={onNavChange ? (e) => { e.preventDefault(); onNavChange(n.id); closeDrawer() } : undefined}
                  className={cn(bar, "my-px no-underline hover:bg-white/[0.07] hover:text-white [&:hover_.ic]:text-white", active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_.ic]:text-sidebar-accent-foreground [&:hover_.ic]:text-sidebar-accent-foreground")}>
                  <span className={cn(iconCls, "ic")}>{n.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{n.label}</span>
                </a>
              )}
            </li>
          </React.Fragment>
        )
      })}
    </ul>
  )

  const railBtn = "relative mx-[11px] my-0.5 flex h-11 w-12 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent p-0 text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring [&_svg]:size-[19px] no-underline"
  const flyPanel = "relative w-auto max-w-[280px] min-w-56 overflow-visible rounded-xl border border-white/[0.1] bg-sidebar p-0 text-sidebar-foreground shadow-[0_18px_44px_rgba(0,0,0,0.42)] before:absolute before:inset-y-0 before:right-full before:w-6 before:content-['']"
  const flyItem = "flex h-[34px] w-full items-center gap-2 rounded-lg px-3 text-control text-sidebar-foreground/90 no-underline transition-colors hover:bg-white/[0.08] hover:text-white"
  const flyBody = (parentId: string, title: string, items: ShellNavChild[]): React.ReactNode => (
    <div className="max-h-[calc(100vh-24px)] overflow-y-auto p-1.5">
      <div className="mb-1.5 border-b border-white/[0.12] px-3 pt-1.5 pb-2.5 text-small leading-[1.3] font-semibold text-white">{title}</div>
      <ul className="m-0 list-none p-0">
        {items.map((c) => {
          const on = c.id === activeNavItem
          if (c.items?.length) {
            const holdsActive = c.items.some((g) => g.id === activeNavItem)
            return (
              <li key={c.id} className="[&+li]:mt-0.5">
                <HoverCard openDelay={60} closeDelay={160}>
                  <HoverCardTrigger asChild>
                    <button type="button" aria-haspopup="menu" className={cn(flyItem, "cursor-pointer border-0 bg-transparent text-left data-[state=open]:bg-white/[0.08] data-[state=open]:text-white", holdsActive && "font-medium text-white")}>
                      <span className="min-w-0 flex-1 truncate">{c.label}</span>
                      <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" sideOffset={10} alignOffset={-6} className={cn(flyPanel, "before:w-3")}>
                    {flyBody(parentId, c.label, c.items)}
                  </HoverCardContent>
                </HoverCard>
              </li>
            )
          }
          return (
            <li key={c.id} className="[&+li]:mt-0.5">
              <a href={c.href ?? `#${c.id}`} aria-current={on ? "page" : undefined}
                onClick={onNavItemSelect ? (e) => { e.preventDefault(); onNavItemSelect(parentId, c.id) } : undefined}
                className={cn(flyItem, on && "bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
  const collapsedList = (
    <ul className="m-0 list-none p-0 pt-1 pb-2.5">
      {nav.map((n) => {
        const active = n.id === activeNav
        const cls = cn(railBtn, active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
        return (
          <li key={n.id} className="relative">
            {active && <span aria-hidden className="absolute top-[13px] bottom-[13px] left-0 w-[3px] rounded-r-[3px] bg-sidebar-ring" />}
            {n.items?.length ? (
              <HoverCard openDelay={80} closeDelay={160}>
                <HoverCardTrigger asChild>
                  <button type="button" aria-label={n.label} aria-expanded="false" className={cls}>{n.icon}</button>
                </HoverCardTrigger>
                {/* Lệch 20px để thoát khỏi mép thanh menu; dải `before:` lấp khoảng hở để rê chuột sang không bị đóng. */}
                <HoverCardContent side="right" align="start" sideOffset={20} alignOffset={-6} className={flyPanel}>
                  {flyBody(n.id, n.label, n.items)}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <a href={n.href ?? `#${n.id}`} aria-label={n.label} title={n.label} aria-current={active ? "page" : undefined}
                onClick={onNavChange ? (e) => { e.preventDefault(); onNavChange(n.id) } : undefined} className={cls}>{n.icon}</a>
            )}
          </li>
        )
      })}
    </ul>
  )

  const menuBody = (isExpanded: boolean) => (
    <>
      <div
        className={cn("mx-2.5 mt-2.5 mb-2 flex h-8 shrink-0 items-center gap-2 rounded-lg bg-white/[0.07] px-2.5 text-small text-sidebar-foreground/70 focus-within:bg-white/[0.11] focus-within:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]", !isExpanded && "cursor-pointer justify-center p-0")}
        onClick={!isExpanded ? () => { focusSearch.current = true; onMenuExpandedChange?.(true) } : undefined}
      >
        <Search className="size-[15px] shrink-0" aria-hidden />
        {isExpanded
          ? <input ref={searchRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} aria-label="Tìm chức năng trong menu" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sidebar-foreground outline-0 placeholder:text-sidebar-foreground/70" />
          : <span className="sr-only">Tìm chức năng</span>}
        {isExpanded && query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery("")} className="rounded p-0.5 hover:bg-white/10"><X className="size-3.5" /></button>}
      </div>
      <nav aria-label="Chức năng" className="min-h-0 flex-1 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:rgba(255,255,255,0.22)_transparent] overflow-x-hidden overflow-y-auto">
        {isExpanded ? expandedList : collapsedList}
        {isExpanded && q && view.every((v) => !v.show) && <p className="px-5 py-4 text-small text-sidebar-foreground/70">Không có chức năng phù hợp</p>}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-1.5">
        {railBottom ?? (
          <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5", !isExpanded && "justify-center p-1.5")}>
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-caption font-semibold text-white ring-1 ring-white/15" aria-hidden>{user.initials}</span>
            {isExpanded && <span className="min-w-0 truncate text-small leading-tight font-medium text-white">{user.name}<small className="block text-caption font-normal text-sidebar-foreground/70">{user.username}</small></span>}
          </div>
        )}
      </div>
    </>
  )

  const accountButton = (
    <button type="button" aria-label="Tài khoản" className="group/acc relative inline-flex h-14 w-auto cursor-pointer items-center justify-center border-0 bg-transparent px-1.5 text-foreground outline-none focus-visible:[&>span]:shadow-focus max-[576px]:px-1">
      <span className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1 pr-1 pl-1 text-left shadow-[0_1px_2px_rgba(35,35,56,0.05)] transition-colors group-hover/acc:border-border-strong group-hover/acc:bg-secondary min-[1200px]:pr-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs leading-3 font-semibold text-primary-foreground">{user.initials}</span>
        <span className="hidden max-w-40 flex-col justify-center leading-tight min-[1200px]:flex">
          <span className="truncate text-small font-semibold text-foreground" title={user.name}>{user.name}</span>
          <span className="truncate text-tiny text-subtle-foreground">@{user.username}</span>
        </span>
        <ChevronDown className="hidden size-3.5 text-subtle-foreground min-[1200px]:block" aria-hidden />
      </span>
    </button>
  )

  const tabCount = tabs.length
  return (
    <div className={cn("bg-page flex h-full min-h-0 flex-col text-foreground", className)}>
      {/* The bottom hairline is an inset shadow, so the brand cell (same colour as the side menu) paints over it and joins the menu. */}
      <header className="relative z-chrome-top flex h-14 shrink-0 items-center justify-between bg-background pr-3 shadow-[inset_0_-1px_0_var(--border)] max-[576px]:pr-1">
        <div className="flex h-full min-w-0 items-center max-[992px]:flex-1">
          <button type="button" aria-label={isDesktop ? (menuExpanded ? "Thu gọn menu" : "Mở rộng menu") : "Mở menu"} aria-expanded={isDesktop ? menuExpanded : drawerOpen}
            onClick={() => (isDesktop ? onMenuExpandedChange?.(!menuExpanded) : setDrawerOpen(true))}
            className="order-2 ml-1 inline-flex h-full w-[50px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary max-[992px]:order-[-1] max-[992px]:w-auto max-[992px]:pr-2.5 max-[992px]:pl-3.5">
            <MenuLeftIcon open={isDesktop && menuExpanded} />
          </button>
          <div className={cn("order-1 flex h-full shrink-0 items-center overflow-hidden transition-[width] duration-[240ms] ease-in-out min-[993px]:border-r min-[993px]:border-sidebar-border min-[993px]:bg-sidebar-from min-[993px]:text-sidebar-foreground max-[992px]:w-auto max-[992px]:min-w-0 max-[992px]:justify-start max-[992px]:px-2 max-[576px]:px-1", menuExpanded && isDesktop ? "w-64 justify-start px-4" : "w-[70px] justify-center px-3")}>
            {menuExpanded && isDesktop ? (brandWide ?? brand) : brand}
          </div>
          <nav aria-label="Lối tắt" className="order-3 ml-2 flex items-center gap-0.5 max-[992px]:hidden">
            {shortcuts.map((s) => (
              <a key={s.id} href={s.href ?? `#${s.id}`} aria-label={s.label} title={s.label} onClick={onShortcutSelect ? (e) => { e.preventDefault(); onShortcutSelect(s.id) } : undefined}
                className="group/sc relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-body leading-[1.4] font-medium whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-secondary hover:text-foreground max-[1199px]:px-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
                <span className="opacity-75 group-hover/sc:opacity-100 [&_svg]:size-[17px] max-[1199px]:[&_svg]:size-[19px]">{s.icon}</span>
                <span className="max-[1199px]:hidden">{s.label}</span>
                {s.badge ? <span className="ml-px min-w-[17px] rounded-full bg-destructive px-[5px] py-px text-center text-micro leading-normal font-semibold text-white">{s.badge}</span> : null}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex h-full min-w-0 items-center text-muted-foreground">
          {tabCount > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" title={`${tabCount} tab đang mở`} aria-label={`${tabCount} tab đang mở`} className="relative hidden h-14 w-10 cursor-pointer items-center justify-center bg-transparent p-0 text-muted-foreground hover:text-foreground max-[992px]:inline-flex max-[768px]:w-9">
                  <span className="flex size-[22px] items-center justify-center rounded-md border-[1.75px] border-current bg-primary/[0.04] text-caption leading-none font-bold tracking-[-0.2px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">{tabCount}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-1">
                <ul role="list" className="m-0 list-none p-0">
                  {tabs.map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => onTabChange?.(t.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-body hover:bg-accent", t.id === activeTab && "font-semibold text-primary")}>
                        <span className="[&_svg]:size-3.5">{t.icon}</span><span className="min-w-0 flex-1 truncate">{t.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}
          {toolbar}
          <span className="mx-1 h-[22px] w-px shrink-0 bg-border max-[576px]:hidden" aria-hidden />
          {userMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{accountButton}</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">{userMenu}</DropdownMenuContent>
            </DropdownMenu>
          ) : accountButton}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        {isDesktop && (
          <aside aria-label="Menu chức năng" className={cn("relative isolate z-chrome flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar-gradient text-sidebar-foreground transition-[width] duration-[240ms] ease-in-out", menuExpanded ? "w-64" : "w-[70px]")}>
            <SidebarArt />
            {menuBody(menuExpanded)}
          </aside>
        )}
        {!isDesktop && (
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent side="left" aria-label="Menu chức năng" className="isolate top-14 h-[calc(100dvh-3.5rem)] w-64 max-w-[85vw] gap-0 overflow-hidden border-sidebar-border bg-sidebar-gradient p-0 text-sidebar-foreground shadow-[10px_0_34px_rgba(35,35,56,0.34)] sm:max-w-64 [&>button]:hidden">
              <SheetTitle className="sr-only">Menu chức năng</SheetTitle>
              <SheetDescription className="sr-only">Danh sách chức năng của hệ thống</SheetDescription>
              <SidebarArt />
              {menuBody(true)}
            </SheetContent>
          </Sheet>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {tabs.length > 0 && (
            <div role="tablist" aria-label="Các trang đang mở" className="flex h-9 shrink-0 items-center gap-1 bg-muted pr-1.5 pl-1 max-[992px]:hidden">
              <div className="flex h-full min-w-0 flex-1 items-end overflow-x-auto overflow-y-hidden px-2 pt-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((t, i) => {
                  const on = t.id === activeTab
                  const prevOn = tabs[i - 1]?.id === activeTab
                  const canClose = !!t.closable && !t.pinned
                  // Icon tab thường là icon nhóm, nhiều tab trùng nhau, nên tab ghim vẫn giữ tên.
                  const compact = !!t.iconOnly
                  const others = closableTabs.filter((x) => x.id !== t.id).map((x) => x.id)
                  const right = closableTabs.filter((x) => tabs.indexOf(x) > i).map((x) => x.id)
                  return (
                    <ContextMenu key={t.id}>
                      <ContextMenuTrigger asChild>
                        <div role="tab" aria-selected={on} aria-label={compact ? t.label : undefined} title={compact ? t.label : undefined} tabIndex={0}
                          onClick={() => onTabChange?.(t.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") onTabChange?.(t.id); else if (e.key === "Delete" && canClose) onTabClose?.(t.id) }}
                          // Chuột giữa đóng tab như trình duyệt; chặn mousedown để không bật chế độ cuộn tự động.
                          onMouseDown={(e) => { if (e.button === 1) e.preventDefault() }}
                          onAuxClick={(e) => { if (e.button === 1 && canClose) { e.preventDefault(); onTabClose?.(t.id) } }}
                          className={cn(
                            "group/tab relative flex h-full cursor-pointer items-center gap-1.5 rounded-t-[10px] text-small leading-none text-muted-foreground transition-colors select-none hover:bg-background/60 hover:text-foreground data-[state=open]:bg-background/60",
                            compact ? "w-10 min-w-0 flex-none justify-center p-0" : t.pinned ? "max-w-[160px] min-w-0 flex-none px-[11px]" : "max-w-[210px] min-w-[110px] flex-[0_1_190px] pr-[5px] pl-[11px]",
                            i > 0 && !on && "before:absolute before:top-1/2 before:left-0 before:-mt-[7px] before:h-3.5 before:w-px before:bg-border-strong before:content-[''] hover:before:opacity-0 [&:hover+div]:before:opacity-0",
                            prevOn && !on && "before:opacity-0",
                            on && "z-[1] bg-frame font-semibold text-foreground hover:bg-frame hover:text-foreground data-[state=open]:bg-frame before:pointer-events-none before:absolute before:bottom-0 before:-left-2 before:size-2 before:bg-[radial-gradient(circle_at_0_0,transparent_7.5px,var(--frame)_8px)] before:content-[''] after:pointer-events-none after:absolute after:-right-2 after:bottom-0 after:size-2 after:bg-[radial-gradient(circle_at_100%_0,transparent_7.5px,var(--frame)_8px)] after:content-['']",
                          )}>
                          {t.icon && <span className={cn("inline-flex w-3.5 shrink-0 items-center justify-center text-sm leading-none [&_svg]:size-3.5", on ? "opacity-100" : "opacity-85")}>{t.icon}</span>}
                          {!compact && <span className="min-w-0 flex-1 truncate">{t.label}</span>}
                          {t.pinned && !compact && <Pin className="size-3 shrink-0 opacity-60" aria-label="Đã ghim" />}
                          {canClose && <button type="button" aria-label={`Đóng ${t.label}`} onClick={(e) => { e.stopPropagation(); onTabClose?.(t.id) }} className={cn("grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-micro leading-none text-inherit transition-[opacity,background-color] hover:bg-foreground/10 focus-visible:opacity-100 group-hover/tab:opacity-100", on ? "opacity-100" : "opacity-0")}><X className="size-3" /></button>}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="min-w-56">
                        {onTabPin && (t.closable || t.pinned) && (
                          <>
                            <ContextMenuItem onSelect={() => onTabPin(t.id, !t.pinned)}>{t.pinned ? <PinOff /> : <Pin />}{t.pinned ? "Bỏ ghim tab" : "Ghim tab"}</ContextMenuItem>
                            <ContextMenuSeparator />
                          </>
                        )}
                        <ContextMenuItem disabled={!canClose} onSelect={() => onTabClose?.(t.id)}><X />Đóng tab<ContextMenuShortcut className="font-sans tracking-normal">Chuột giữa</ContextMenuShortcut></ContextMenuItem>
                        <ContextMenuItem disabled={others.length === 0} onSelect={() => closeTabs(others, t.id)}><ListX />Đóng các tab khác</ContextMenuItem>
                        <ContextMenuItem disabled={right.length === 0} onSelect={() => closeTabs(right, t.id)}><ArrowRightToLine />Đóng các tab bên phải</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive" disabled={closableTabs.length === 0} onSelect={() => closeTabs(closableTabs.map((x) => x.id))}><CircleX />Đóng tất cả tab</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
              </div>
            </div>
          )}
          <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto px-3 py-2.5 max-[576px]:px-1.5">{children}</main>
        </div>
      </div>
      {chatPanel && (
        <>
          <button type="button" aria-label="Mở tin nhắn" aria-expanded={chatOpen} title={`${chatLabel} (kéo để di chuyển)`} onClick={() => setChatOpen(true)}
            className="fixed right-4 bottom-6 z-fixed grid size-[52px] cursor-pointer touch-none place-items-center rounded-2xl border-0 bg-primary text-white shadow-[0_10px_28px_-6px_rgba(0,73,152,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background,box-shadow] duration-[180ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none hover:scale-[1.08] hover:bg-accent-foreground hover:shadow-[0_14px_32px_-6px_rgba(0,73,152,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-95 max-[576px]:bottom-4">
            <MessageSquareText className="size-[22px]" aria-hidden />
          </button>
          <Sheet open={chatOpen} onOpenChange={setChatOpen}>
            <SheetContent side="right" hideClose aria-label={chatLabel} overlayClassName="bg-[rgba(35,35,56,0.28)] backdrop-blur-[3px]" className="w-[min(100%,400px)] p-0 sm:max-w-[400px]">
              <SheetTitle className="sr-only">{chatLabel}</SheetTitle>
              <SheetDescription className="sr-only">Danh sách cuộc trò chuyện nội bộ</SheetDescription>
              {chatPanel({ close: () => setChatOpen(false) })}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  )
}
