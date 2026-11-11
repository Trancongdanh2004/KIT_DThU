"use client"

// @dthu/ui 0.2.0 · block-app-layout
import * as React from "react"
import { House } from "lucide-react"
import { AppShell, type AppShellProps } from "@/components/blocks/shell/app-shell"

export interface AppLayoutLeaf { label: string; to: string }
/** Third menu level: a titled bunch of leaves inside a group (collapsible when expanded, nested flyout when collapsed). */
export interface AppLayoutSubgroup { label: string; items: AppLayoutLeaf[] }
export interface AppLayoutGroup {
  id: string
  label: string
  icon: React.ReactNode
  /** Heading printed above this group in the expanded menu. */
  section?: string
  items: (AppLayoutLeaf | AppLayoutSubgroup)[]
}

const leavesOf = (items: AppLayoutGroup["items"]): AppLayoutLeaf[] => items.flatMap((i) => ("items" in i ? i.items : [i]))
export interface AppLayoutShortcut { to: string; label: string; icon: React.ReactNode; badge?: number }

type PassedToShell = "brand" | "brandWide" | "toolbar" | "userMenu" | "railBottom" | "user" | "searchPlaceholder" | "chatPanel" | "chatLabel" | "className"

export interface AppLayoutProps extends Pick<AppShellProps, PassedToShell> {
  nav: AppLayoutGroup[]
  /** Current route as your router reports it (the path, with its query when `to` has one). Matched exactly against `items[].to`. */
  route: string
  /** Called with a route when the user picks a menu item, shortcut or tab, and when the active tab is closed (then with the last remaining tab). Perform the navigation here. */
  onNavigate: (to: string) => void
  /** Real URL of a route, so middle-click and "open in new tab" work. Defaults to the route itself; add your router's base path here (basename, basePath). */
  href?: (to: string) => string
  shortcuts?: AppLayoutShortcut[]
  /** First tab: pinned, icon only, not closable. Read once, when the layout mounts. Defaults to "/". */
  homeRoute?: string
  homeIcon?: React.ReactNode
  /** Whether a route is a real screen that deserves a tab. Defaults to "listed in `nav`". */
  isKnown?: (route: string) => boolean
  /** Tab title for a route that is not listed in `nav`. */
  routeTitle?: (route: string) => string | undefined
  defaultMenuExpanded?: boolean
  children: React.ReactNode
}

/**
 * App frame: side menu, top bar, user menu and open-page tabs on top of AppShell. It never touches a router:
 * give it the current `route` and perform the navigation in `onNavigate`.
 */
export function AppLayout({ nav, route, onNavigate, href = (to) => to, shortcuts = [], homeRoute = "/", homeIcon = <House />, isKnown, routeTitle, defaultMenuExpanded = false, children, ...shell }: AppLayoutProps) {
  const [menuExpanded, setMenuExpanded] = React.useState(defaultMenuExpanded)
  const [tabs, setTabs] = React.useState<string[]>([homeRoute])
  const [pinned, setPinned] = React.useState<string[]>([])
  const groups = React.useMemo(() => nav
    .map((g) => ({ ...g, items: g.items.filter((i) => !("items" in i) || i.items.length > 0) }))
    .filter((g) => g.items.length > 0), [nav])
  const items = React.useMemo(() => groups.flatMap((g) => leavesOf(g.items)), [groups])
  const known = isKnown ? isKnown(route) : items.some((i) => i.to === route)
  React.useEffect(() => { if (known) setTabs((t) => (t.includes(route) ? t : [...t, route])) }, [route, known])

  const groupOf = (to: string) => groups.find((g) => leavesOf(g.items).some((i) => i.to === to))
  const titleOf = (to: string) => items.find((i) => i.to === to)?.label ?? routeTitle?.(to) ?? to
  const closeTabs = (ids: string[], nextActive?: string) => {
    const next = orderedTabs.filter((t) => !ids.includes(t))
    if (ids.includes(route)) onNavigate(nextActive && next.includes(nextActive) ? nextActive : next[next.length - 1] ?? homeRoute)
    setTabs(next.length ? next : [homeRoute])
    setPinned((p) => p.filter((t) => !ids.includes(t)))
  }
  // Tab ghim đứng ngay sau trang chủ, theo thứ tự ghim; bỏ ghim thì tab về lại chỗ cũ.
  const pinTab = (to: string, pin: boolean) => setPinned((p) => (pin ? [...p.filter((t) => t !== to), to] : p.filter((t) => t !== to)))
  const orderedTabs = [
    ...tabs.filter((t) => t === homeRoute),
    ...pinned.filter((t) => tabs.includes(t)),
    ...tabs.filter((t) => t !== homeRoute && !pinned.includes(t)),
  ]

  return (
    <AppShell
      {...shell}
      shortcuts={shortcuts.map((s) => ({ id: s.to, label: s.label, icon: s.icon, badge: s.badge, href: href(s.to) }))}
      onShortcutSelect={onNavigate}
      nav={groups.map((g) => g.items.length === 1 && !("items" in g.items[0]!)
        ? { id: g.id, label: g.label, icon: g.icon, section: g.section, href: href(g.items[0]!.to) }
        : { id: g.id, label: g.label, icon: g.icon, section: g.section, items: g.items.map((i) => ("items" in i
          ? { id: `${g.id}/${i.label}`, label: i.label, items: i.items.map((l) => ({ id: l.to, label: l.label, href: href(l.to) })) }
          : { id: i.to, label: i.label, href: href(i.to) })) })}
      menuExpanded={menuExpanded}
      onMenuExpandedChange={setMenuExpanded}
      activeNav={groupOf(route)?.id}
      activeNavItem={route}
      onNavChange={(id) => { const g = groups.find((x) => x.id === id); if (g) onNavigate(leavesOf(g.items)[0]!.to) }}
      onNavItemSelect={(_, to) => onNavigate(to)}
      tabs={orderedTabs.map((t) => ({ id: t, label: titleOf(t), icon: t === homeRoute ? homeIcon : groupOf(t)?.icon, iconOnly: t === homeRoute, closable: t !== homeRoute, pinned: pinned.includes(t) }))}
      activeTab={route}
      onTabChange={onNavigate}
      onTabClose={(to) => closeTabs([to])}
      onTabsClose={closeTabs}
      onTabPin={pinTab}
    >
      {/* Phủ cả vùng padding của <main> (rồi đệm lại y hệt) để thanh công cụ đầu trang tràn sát mép qua --page-bleed-*. */}
      <div className="-mx-(--page-bleed-x) -mt-(--page-bleed-t) -mb-(--page-bleed-b) min-h-0 flex-1 overflow-hidden px-(--page-bleed-x) pt-(--page-bleed-t) pb-(--page-bleed-b) [--page-bleed-t:--spacing(2.5)] [--page-bleed-b:--spacing(2.5)] [--page-bleed-x:--spacing(3)] max-[576px]:[--page-bleed-x:--spacing(1.5)]">{children}</div>
    </AppShell>
  )
}
