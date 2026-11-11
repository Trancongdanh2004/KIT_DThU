import React, { useCallback, useEffect, useRef, useState } from "react"
import { Image, Link, usePathname } from "./compat"
import NavMenu from "./NavMenu"
import MobileMenu from "./MobileMenu"
import LanguageMenu from "./LanguageMenu"
import type { MenuItem } from "./menu_data"
import { ArrowRight, ChevronDown, GraduationCap, Menu, X } from "lucide-react"
import styles from "./Header.module.css"

const BANNER_KEY = "faculty-announcement-2026"

export interface HeaderProps {
  brandName?: string
  brandSubname?: string
  logoSrc?: string
  pathname?: string
  showAnnouncement?: boolean
  announcementText?: string
  admissionHref?: string
  onAdmissionClick?: () => void
  onNavigate?: (href: string) => void
  hideOnScroll?: boolean
  fixed?: boolean
  transparent?: boolean
  /* RIS patch: menu tuỳ chỉnh, nhãn nút CTA, ẩn chọn ngôn ngữ */
  menu?: MenuItem[]
  ctaLabel?: string
  showLanguage?: boolean
  className?: string
}

export const Header = ({
  brandName = "Khoa Công nghệ và Kỹ thuật",
  brandSubname = "Trường Đại học Đồng Tháp",
  logoSrc,
  pathname: propPathname,
  showAnnouncement = true,
  announcementText = "Tuyển sinh đại học chính quy 2026 đang nhận hồ sơ xét tuyển tại Khoa Công nghệ và Kỹ thuật",
  admissionHref = "/admission",
  onAdmissionClick,
  onNavigate,
  hideOnScroll = false,
  fixed = false,
  transparent,
  menu,
  ctaLabel = "Tuyển sinh",
  showLanguage = true,
  className = "",
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const detectedPathname = usePathname()
  const pathname = propPathname ?? detectedPathname

  // Restore the visitor's dismissal choice once on mount.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage?.getItem(BANNER_KEY) === "1") {
        setBannerOpen(false)
      }
    } catch {
      /* storage can be unavailable in private mode */
    }
  }, [])

  // Offset document only when header is fixed at the top of the viewport
  useEffect(() => {
    if (!fixed) return
    const root = document.documentElement
    if (pathname === "/") {
      root.style.setProperty("--site-header-offset", "0px")
    } else {
      root.style.setProperty("--site-header-offset", bannerOpen ? "92px" : "52px")
    }
  }, [bannerOpen, pathname, fixed])

  // Antigravity auto-hide behaviour: only active in fixed navbar mode with hideOnScroll enabled.
  useEffect(() => {
    if (!hideOnScroll) {
      setHidden(false)
      return
    }

    const handleScroll = () => {
      const y = window.scrollY
      const threshold = pathname === "/" ? 60 : 8
      setScrolled(y > threshold)

      if (y < 80) {
        setHidden(false)
      } else if (y > lastScrollY.current + 4) {
        setHidden(true)
      } else if (y < lastScrollY.current - 4) {
        setHidden(false)
      }

      lastScrollY.current = y
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname, hideOnScroll])

  // Any open surface keeps the bar visible.
  useEffect(() => {
    if (mobileOpen || dropdownOpen) setHidden(false)
  }, [mobileOpen, dropdownOpen])

  // Close every menu when navigating.
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  // Lock the page while the full mobile sheet is open in fixed mode.
  useEffect(() => {
    if (!fixed) return
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen, fixed])

  // Never leave the mobile sheet open after resizing to the desktop nav.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1080) setMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const dismissBanner = useCallback(() => {
    setBannerOpen(false)
    try {
      window.localStorage?.setItem(BANNER_KEY, "1")
    } catch {
      /* ignore */
    }
  }, [])

  const isHome = transparent ?? (pathname === "/")
  const isTransparent = isHome && !scrolled && !dropdownOpen && !mobileOpen
  const solid = !isHome || scrolled || dropdownOpen || mobileOpen
  const showBanner = showAnnouncement && bannerOpen && !mobileOpen && !isHome

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  const handleAdmissionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onAdmissionClick) {
      e.preventDefault()
      onAdmissionClick()
    } else if (onNavigate) {
      e.preventDefault()
      onNavigate(admissionHref)
    }
  }

  return (
    <div className={`${styles.headerRoot} ${fixed ? styles.headerRootFixed : styles.headerRootEmbedded}`}>
      <header
        data-ui="header"
        className={`${styles.header} ${fixed ? styles.headerFixed : ""} ${
          isTransparent ? styles.transparent : ""
        } ${scrolled ? styles.scrolled : ""} ${solid ? styles.opaque : ""} ${
          hidden ? styles.headerHidden : ""
        } ${className}`}
      >
        <div className={styles.bar}>
          <div className={styles.grid}>
            <div className={styles.main}>
              <div className={styles.logo}>
                <Link
                  href="/"
                  className={styles.logoLink}
                  aria-label={`Trang chủ - ${brandName}`}
                  onClick={(e) => handleLinkClick(e, "/")}
                >
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={brandName}
                      width={30}
                      height={30}
                      className={styles.logoImg}
                      priority
                    />
                  ) : (
                    <div className={styles.logoBadge}>
                      <GraduationCap className={styles.logoCapIcon} size={19} strokeWidth={2} aria-hidden="true" />
                    </div>
                  )}
                  <span className={styles.brandText}>
                    <span className={styles.brandName}>{brandName}</span>
                    <span className={styles.brandSub}>{brandSubname}</span>
                  </span>
                </Link>
              </div>

              <div className={styles.actions}>
                <nav className={styles.nav} aria-label="Điều hướng chính">
                  <NavMenu
                    onOpenChange={setDropdownOpen}
                    onNavigate={onNavigate}
                    pathname={pathname}
                    menu={menu}
                  />
                </nav>

                <div className={styles.right}>
                  <Link
                    href={admissionHref}
                    className={styles.cta}
                    onClick={handleAdmissionClick}
                  >
                    {ctaLabel}
                    <ChevronDown className={styles.ctaChev} strokeWidth={2} aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    className={styles.menuToggle}
                    onClick={() => setMobileOpen((value) => !value)}
                    aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                    aria-expanded={mobileOpen}
                    aria-controls="site-mobile-menu"
                  >
                    {mobileOpen ? (
                      <X size={20} strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Menu size={20} strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>

                  {showLanguage && <LanguageMenu onOpen={closeMobile} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showBanner && (
          <div className={styles.announcement} role="region" aria-label="Thông báo mới">
            <Link
              href={admissionHref}
              className={styles.pillLink}
              onClick={handleAdmissionClick}
            >
              <span className={styles.pillBadge}>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path
                    d="M8 0.5C8.5 4.6 11.4 7.5 15.5 8C11.4 8.5 8.5 11.4 8 15.5C7.5 11.4 4.6 8.5 0.5 8C4.6 7.5 7.5 4.6 8 0.5Z"
                    fill="currentColor"
                  />
                </svg>
                <span className={styles.pillBadgeLabel}>Tuyển sinh</span>
              </span>
              <span className={styles.pillText}>{announcementText}</span>
              <span className={styles.pillCta}>
                <span className={styles.pillCtaLabel}>Tìm hiểu thêm</span>
                <ArrowRight className={styles.pillArrow} size={13} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </Link>
            <button
              type="button"
              className={styles.pillDismiss}
              onClick={dismissBanner}
              aria-label="Đóng thông báo"
              title="Đóng thông báo"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {dropdownOpen && <div className={styles.overlay} aria-hidden="true" />}

      <MobileMenu
        id="site-mobile-menu"
        isOpen={mobileOpen}
        onClose={closeMobile}
        onNavigate={onNavigate}
        menu={menu}
        ctaLabel={ctaLabel}
        ctaHref={admissionHref}
        embedded={!fixed}
        offset={showBanner ? 92 : 52}
      />
    </div>
  )
}

export default Header
