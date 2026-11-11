import * as React from "react"
import menu_data, { type MenuItem } from "./menu_data"
import { Link, usePathname } from "./compat"
import {
  Award,
  BookMarked,
  Brain,
  CalendarDays,
  Camera,
  Car,
  ChevronDown,
  ChevronRight,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  GraduationCap,
  HardHat,
  Heart,
  Landmark,
  LucideIcon,
  Microscope,
  Monitor,
  Newspaper,
  PartyPopper,
  Phone,
  ShieldCheck,
  Sprout,
  TrainTrack,
  Users,
} from "lucide-react"
import styles from "./Header.module.css"

const overviews: Record<string, { href: string; label: string }> = {
  "Giới thiệu": { href: "/about", label: "Tìm hiểu về Khoa" },
  "Nghiên cứu": { href: "/nghien-cuu", label: "Xem tổng quan" },
  "Sinh viên": { href: "/youth-union", label: "Hoạt động sinh viên" },
  "Tin tức": { href: "/tin-tuc-thong-bao", label: "Xem tin tức" },
}

const iconMap: Record<string, LucideIcon> = {
  "/about": GraduationCap,
  "/instructor": Users,
  "/organization-structure": Landmark,
  "/organization": Award,
  "/trade-union": Users,
  "/department/cong-nghe-thong-tin": Monitor,
  "/department/khoa-hoc-may-tinh": Brain,
  "/department/ky-thuat": Cpu,
  "/department/cong-nghe-sinh-hoc": FlaskConical,
  "/courses/cong-nghe-thong-tin": Monitor,
  "/courses/khoa-hoc-may-tinh": Brain,
  "/courses/an-ninh-mang": ShieldCheck,
  "/courses/ky-thuat-dien-dien-tu": Cpu,
  "/courses/cong-nghe-ky-thuat-o-to": Car,
  "/courses/ky-thuat-xay-dung": HardHat,
  "/courses/ky-thuat-xay-dung-cong-trinh-giao-thong": TrainTrack,
  "/courses/cong-nghe-sinh-hoc": Dna,
  "/courses/cong-nghe-thuc-pham": FlaskConical,
  "/courses/cong-nghe-nong-nghiep": Sprout,
  "/courses/thac-si-khoa-hoc-may-tinh": GraduationCap,
  "/nghien-cuu": Microscope,
  "/nghien-cuu/de-tai": FileText,
  "/nghien-cuu/cong-bo": BookMarked,
  "/tin-tuc-thong-bao": Newspaper,
  "/event": CalendarDays,
  "/hinh-anh": Camera,
  "/youth-union": Heart,
  "/welcome-freshers": PartyPopper,
  "/contact": Phone,
}

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  id?: string
  onNavigate?: (href: string) => void
  /** RIS patch */
  menu?: MenuItem[]
  ctaLabel?: string
  ctaHref?: string
  embedded?: boolean
  offset?: number
}

const MobileMenuLink = ({
  href,
  label,
  onClick,
  onNavigate,
}: {
  href: string
  label: string
  onClick: () => void
  onNavigate?: (href: string) => void
}) => {
  const pathname = usePathname()
  const isActive = pathname === href
  const Icon = iconMap[href]
  return (
    <Link
      href={href}
      className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault()
          onNavigate(href)
        }
        onClick()
      }}
    >
      {Icon && <Icon className={styles.mobileLinkIcon} size={17} strokeWidth={1.8} aria-hidden="true" />}
      <span>{label}</span>
    </Link>
  )
}

const MobileMenuSection = ({
  item,
  expanded,
  onToggle,
  onClose,
  onNavigate,
}: {
  item: MenuItem
  expanded: boolean
  onToggle: () => void
  onClose: () => void
  onNavigate?: (href: string) => void
}) => {
  const regular = (item.sub_menus ?? [])
    .filter((sub) => !sub.inner_menu && !!sub.link)
    .map((sub) => ({ link: sub.link as string, title: sub.title }))
  const groups = item.sub_menus?.filter((sub) => sub.inner_menu) ?? []

  if (!item.has_dropdown) {
    return (
      <Link
        href={item.link}
        className={styles.mobileRow}
        onClick={(e) => {
          if (onNavigate) {
            e.preventDefault()
            onNavigate(item.link)
          }
          onClose()
        }}
      >
        <span>{item.title}</span>
        <ChevronRight className={styles.mobileRowChev} strokeWidth={1.8} aria-hidden="true" />
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        className={`${styles.mobileRow} ${expanded ? styles.mobileRowOpen : ""}`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span>{item.title}</span>
        <ChevronDown className={styles.mobileRowChev} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {expanded && (
        <div className={styles.mobileSub}>
          {regular.map((sub, index) => (
            <MobileMenuLink
              key={`${sub.link}-${index}`}
              href={sub.link}
              label={sub.title}
              onClick={onClose}
              onNavigate={onNavigate}
            />
          ))}

          {groups.map((group, groupIndex) => (
            <div key={`${group.title}-${groupIndex}`}>
              <div className={styles.mobileGroupLabel}>{group.title}</div>
              {group.inner_menus?.map((sub, index) => (
                <MobileMenuLink
                  key={`${sub.link}-${index}`}
                  href={sub.link}
                  label={sub.title}
                  onClick={onClose}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}

          {(() => {
            const overview = overviews[item.title]
            if (!overview || regular.some((r) => r.link === overview.href)) return null
            return (
              <Link
                href={overview.href}
                className={styles.mobileSubCta}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault()
                    onNavigate(overview.href)
                  }
                  onClose()
                }}
              >
                {overview.label}
              </Link>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export const MobileMenu = ({
  isOpen,
  onClose,
  id,
  onNavigate,
  menu = menu_data,
  ctaLabel = "Tuyển sinh 2026",
  ctaHref = "/admission",
  embedded = false,
  offset = 52,
}: MobileMenuProps) => {
  const [expanded, setExpanded] = React.useState<number | null>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return

    setExpanded(null)

    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    panel?.focus()

    const getFocusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.offsetParent !== null)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key !== "Tab") return

      const focusable = getFocusable()
      if (focusable.length === 0) {
        event.preventDefault()
        panel?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (first && last) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className={`${styles.mobileBackdrop} ${embedded ? styles.mobileBackdropEmbedded : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id={id}
        ref={panelRef}
        className={`${styles.mobileMenu} ${embedded ? styles.mobileMenuEmbedded : ""} focus:outline-none`}
        style={embedded && offset ? ({ "--mobile-menu-top": `${offset}px` } as React.CSSProperties) : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        tabIndex={-1}
      >
        {menu.map((item) => (
          <MobileMenuSection
            key={item.id}
            item={item}
            expanded={expanded === item.id}
            onToggle={() => setExpanded((current) => (current === item.id ? null : item.id))}
            onClose={onClose}
            onNavigate={onNavigate}
          />
        ))}

        <div className={styles.mobileFooter}>
          <Link
            href={ctaHref}
            className={styles.mobileCta}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate(ctaHref)
              }
              onClose()
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  )
}

export default MobileMenu

