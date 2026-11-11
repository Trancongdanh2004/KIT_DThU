import * as React from "react"
import menu_data, { type MenuItem } from "./menu_data"
import { Link, usePathname } from "./compat"
import {
  ArrowRight,
  Award,
  BookMarked,
  Brain,
  CalendarDays,
  Camera,
  Car,
  ChevronDown,
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

/* Bảng tra cứu Icon cho từng đường dẫn */
export const iconMap: Record<string, LucideIcon> = {
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

export const overviews: Record<string, { href: string; label: string }> = {
  "Giới thiệu": { href: "/about", label: "Tìm hiểu về Khoa" },
  "Nghiên cứu": { href: "/nghien-cuu", label: "Xem tổng quan" },
  "Sinh viên": { href: "/youth-union", label: "Hoạt động sinh viên" },
  "Tin tức": { href: "/tin-tuc-thong-bao", label: "Xem tin tức" },
}

export interface SpotlightInfo {
  badge: string
  title: string
  desc: string
  href: string
  cta: string
}

export const spotlights: Record<string, SpotlightInfo> = {
  "Giới thiệu": {
    badge: "VỀ KHOA",
    title: "Kỷ nguyên công nghệ số",
    desc: "Đào tạo kỹ sư chất lượng cao gắn kết thực tiễn, nghiên cứu ứng dụng và hội nhập quốc tế.",
    href: "/about",
    cta: "Xem hồ sơ Khoa",
  },
  "Đào tạo": {
    badge: "TUYỂN SINH 2026",
    title: "Đại học chính quy 2026",
    desc: "Đang nhận hồ sơ xét tuyển 10 ngành đào tạo công nghệ mũi nhọn tại Trường ĐH Đồng Tháp.",
    href: "/admission",
    cta: "Đăng ký xét tuyển",
  },
  "Nghiên cứu": {
    badge: "KHOA HỌC & CÔNG NGHỆ",
    title: "Công bố & Đề tài",
    desc: "Các công trình nghiên cứu ứng dụng thực tiễn, công bố ISI/Scopus và chuyển giao giải pháp số.",
    href: "/nghien-cuu",
    cta: "Khám phá đề tài",
  },
  "Sinh viên": {
    badge: "HOẠT ĐỘNG",
    title: "Đoàn - Hội năng động",
    desc: "Môi trường học tập sáng tạo, câu lạc bộ học thuật và phong trào rèn luyện sôi nổi.",
    href: "/youth-union",
    cta: "Xem hoạt động",
  },
  "Tin tức": {
    badge: "TIN MỚI",
    title: "Sự kiện & Thông báo",
    desc: "Cập nhật các hoạt động học thuật, hội thảo chuyên đề và lịch công tác của Khoa.",
    href: "/tin-tuc-thong-bao",
    cta: "Xem tất cả tin",
  },
}

export interface NavMenuProps {
  onOpenChange?: (open: boolean) => void
  onNavigate?: (href: string) => void
  pathname?: string
  /** RIS patch: menu tuỳ chỉnh (mặc định menu_data của Khoa). */
  menu?: MenuItem[]
}

type Column = { title?: string; links: { link: string; title: string }[] }

const LINKS_PER_COLUMN = 5

const buildColumns = (item: MenuItem): Column[] => {
  const regular = (item.sub_menus ?? [])
    .filter((sub) => !sub.inner_menu && !!sub.link)
    .map((sub) => ({ link: sub.link as string, title: sub.title }))
  const groups = item.sub_menus?.filter((sub) => sub.inner_menu) ?? []
  const columns: Column[] = []
  if (regular.length) columns.push({ links: regular })

  groups.forEach((group) => {
    const links = group.inner_menus ?? []
    for (let start = 0; start < links.length; start += LINKS_PER_COLUMN) {
      columns.push({
        title: start === 0 ? group.title : undefined,
        links: links.slice(start, start + LINKS_PER_COLUMN),
      })
    }
  })
  return columns
}

export const NavMenu = ({ onOpenChange, onNavigate, pathname: propPathname, menu = menu_data }: NavMenuProps) => {
  const [openMenu, setOpenMenu] = React.useState<number | null>(null)
  const navRef = React.useRef<HTMLUListElement>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const detectedPathname = usePathname()
  const pathname = propPathname ?? detectedPathname

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const close = React.useCallback(() => {
    clearCloseTimer()
    setOpenMenu(null)
  }, [clearCloseTimer])

  const open = React.useCallback(
    (index: number) => {
      clearCloseTimer()
      setOpenMenu(index)
    },
    [clearCloseTimer]
  )

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpenMenu(null), 300)
  }, [clearCloseTimer])

  React.useEffect(() => {
    onOpenChange?.(openMenu !== null)
  }, [openMenu, onOpenChange])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) close()
    }
    const handleScroll = () => close()

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)
    if (openMenu !== null) window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [close, openMenu])

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
    close()
  }

  return (
    <ul ref={navRef} className={styles.navList}>
      {menu.map((item, index) => {
        const isOpen = openMenu === index
        const overview = overviews[item.title]
        const spotlight = spotlights[item.title]
        const columns = item.has_dropdown ? buildColumns(item) : []

        return (
          <li
            key={item.id}
            className={styles.navItem}
            onMouseEnter={() => item.has_dropdown && open(index)}
            onMouseLeave={scheduleClose}
          >
            {item.has_dropdown ? (
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navBtnWithIcon} ${
                  isOpen ? styles.navBtnOpen : ""
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => (isOpen ? close() : open(index))}
              >
                {item.title}
                <ChevronDown className={styles.chev} strokeWidth={2} aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={item.link}
                className={styles.navBtn}
                onClick={(e) => handleLinkClick(e, item.link)}
              >
                {item.title}
              </Link>
            )}

            {item.has_dropdown && isOpen && (
              <div
                className={styles.panel}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
              >
                <div className={styles.panelContainer}>
                  <div className={styles.panelInner}>
                    <div className={styles.panelIntro}>
                      <h2 className={styles.panelTitle}>{item.title}</h2>
                      {overview && (
                        <Link
                          href={overview.href}
                          className={styles.panelCta}
                          onClick={(e) => handleLinkClick(e, overview.href)}
                        >
                          {overview.label}
                          <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      )}
                    </div>

                    <div className={styles.panelLinks}>
                      {columns.map((column, columnIndex) => (
                        <div
                          key={`${item.id}-${column.title ?? "links"}-${columnIndex}`}
                          className={styles.linkGroup}
                        >
                          {column.title ? (
                            <span className={styles.groupLabel}>{column.title}</span>
                          ) : columns.length > 1 ? (
                            <span className={styles.groupLabel} aria-hidden="true">
                              &nbsp;
                            </span>
                          ) : null}
                          {column.links.map((sub, subIndex) => {
                            const Icon = iconMap[sub.link]
                            const isActive = pathname === sub.link
                            return (
                              <Link
                                key={`${sub.link}-${subIndex}`}
                                href={sub.link}
                                className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                                onClick={(e) => handleLinkClick(e, sub.link)}
                              >
                                {Icon && (
                                  <Icon
                                    className={styles.linkIcon}
                                    size={16}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{sub.title}</span>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>

                    {spotlight && (
                      <div className={styles.panelSpotlight}>
                        <div>
                          <span className={styles.spotlightBadge}>{spotlight.badge}</span>
                          <h3 className={styles.spotlightTitle}>{spotlight.title}</h3>
                          <p className={styles.spotlightDesc}>{spotlight.desc}</p>
                        </div>
                        <Link
                          href={spotlight.href}
                          className={styles.spotlightLink}
                          onClick={(e) => handleLinkClick(e, spotlight.href)}
                        >
                          <span>{spotlight.cta}</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default NavMenu

