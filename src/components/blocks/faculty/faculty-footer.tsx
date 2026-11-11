import * as React from "react"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"

export interface FacultyLink {
  label: string
  href: string
  isBold?: boolean
  isItalic?: boolean
}

export interface FacultyFooterProps {
  brandTitle?: string
  brandDescription?: string
  aboutTitle?: string
  aboutLinks?: FacultyLink[]
  coursesTitle?: string
  courses?: FacultyLink[]
  contactTitle?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  phone?: string
  phoneTel?: string
  email?: string
  consultationText?: string
  consultationHref?: string
  onConsultationClick?: () => void
  facebookUrl?: string
  youtubeUrl?: string
  linkedinUrl?: string
  sitemapHref?: string
  contactHref?: string
  className?: string
  onNavigate?: (href: string) => void
}

export function FictionalFacultyLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" className="fill-white/10" />
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2" className="text-dthu-gold" />
      <path d="M32 16L48 24.5L32 33L16 24.5L32 16Z" className="fill-dthu-gold" />
      <path d="M22 28V37C22 41.5 26.5 45 32 45C37.5 45 42 41.5 42 37V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white" />
      <path d="M48 25V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-dthu-gold" />
      <circle cx="48" cy="38" r="2" className="fill-dthu-gold" />
    </svg>
  )
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const FOOTER_LINK =
  "text-[14px] leading-6 text-white/70 no-underline transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"

const DEFAULT_ABOUT_LINKS: FacultyLink[] = [
  { label: "Tổng quan", href: "/about" },
  { label: "Đội ngũ giảng viên", href: "/instructor" },
  { label: "Cơ cấu tổ chức", href: "/organization" },
  { label: "Đoàn - Hội sinh viên", href: "/youth-union" },
  { label: "Thông tin tuyển sinh", href: "/admission", isBold: true },
]

const DEFAULT_COURSES: FacultyLink[] = [
  { label: "Công nghệ thông tin", href: "/courses/cong-nghe-thong-tin" },
  { label: "Khoa học máy tính", href: "/courses/khoa-hoc-may-tinh" },
  { label: "An ninh mạng", href: "/courses/an-ninh-mang" },
  { label: "Kỹ thuật điện, điện tử", href: "/courses/ky-thuat-dien-dien-tu" },
  { label: "Công nghệ kỹ thuật ô tô", href: "/courses/cong-nghe-ky-thuat-o-to" },
  { label: "Kỹ thuật xây dựng", href: "/courses/ky-thuat-xay-dung" },
  { label: "KT xây dựng công trình giao thông", href: "/courses/ky-thuat-xay-dung-cong-trinh-giao-thong" },
  { label: "Công nghệ sinh học", href: "/courses/cong-nghe-sinh-hoc" },
  { label: "Công nghệ thực phẩm", href: "/courses/cong-nghe-thuc-pham" },
  { label: "Công nghệ nông nghiệp", href: "/courses/cong-nghe-nong-nghiep" },
  { label: "Thạc sĩ Khoa học máy tính", href: "/courses/thac-si-khoa-hoc-may-tinh", isItalic: true },
]

export function FacultyFooter({
  brandTitle = "Khoa Công nghệ và Kỹ thuật",
  brandDescription = "Nơi đào tạo kỹ sư chất lượng cao, gắn kết thực tiễn, khơi dậy sáng tạo và ứng dụng công nghệ vì cộng đồng.",
  aboutTitle = "Về Khoa",
  aboutLinks = DEFAULT_ABOUT_LINKS,
  coursesTitle = "Đào tạo",
  courses = DEFAULT_COURSES,
  contactTitle = "Liên hệ",
  addressLine1 = "Phòng 101, Nhà C1,",
  addressLine2 = "Trường ĐH Đồng Tháp,",
  addressLine3 = "783 Phạm Hữu Lầu, P. Cao Lãnh, Đồng Tháp",
  phone = "0277 388 1518",
  phoneTel = "+842773881518",
  email = "khoacongnghe@dthu.edu.vn",
  consultationText = "Đăng ký tư vấn",
  consultationHref = "/dang-ky-tu-van",
  onConsultationClick,
  facebookUrl = "https://facebook.com",
  youtubeUrl = "https://www.youtube.com/@dongthapuni",
  linkedinUrl = "https://www.linkedin.com",
  sitemapHref = "/sitemap.xml",
  contactHref = "/contact",
  className = "",
  onNavigate,
}: FacultyFooterProps) {
  const currentYear = new Date().getFullYear()

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  return (
    <footer data-ui="footer" className={`mt-auto font-sans bg-dthu-navy text-white/90 ${className}`}>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Cột 1: Logo & Giới thiệu & Mạng xã hội (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <a
                href="/"
                onClick={(e) => handleLink(e, "/")}
                className="inline-block mb-4"
                aria-label={`Trang chủ ${brandTitle}`}
              >
                <FictionalFacultyLogo className="h-16 w-16 object-contain" />
              </a>
              <p className="text-[14px] leading-relaxed text-white/90 mb-6">
                {brandDescription}
              </p>
            </div>

            {/* Social Icons (URL rỗng = ẩn từng biểu tượng) */}
            {(facebookUrl || youtubeUrl || linkedinUrl) && <div className="flex items-center gap-3">
              {facebookUrl && <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Facebook ${brandTitle}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <FacebookIcon size={18} />
              </a>}
              {youtubeUrl && <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kênh YouTube Trường Đại học Đồng Tháp"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <YoutubeIcon size={18} />
              </a>}
              {linkedinUrl && <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn ${brandTitle}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <LinkedinIcon size={18} />
              </a>}
            </div>}
          </div>

          {/* Cột 2: Về Khoa (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-base font-bold mb-4">{aboutTitle}</h3>
            <ul className="space-y-2 p-0 m-0 list-none">
              {aboutLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleLink(e, item.href)}
                    className={
                      item.isBold
                        ? "text-[14px] leading-6 text-white font-bold no-underline hover:underline transition-colors"
                        : FOOTER_LINK
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Đào tạo (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <h3 className="text-white text-base font-bold mb-4">{coursesTitle}</h3>
            <ul className="space-y-1.5 p-0 m-0 list-none">
              {courses.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleLink(e, item.href)}
                    className={`${FOOTER_LINK} ${item.isItalic ? "italic" : ""}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-base font-bold mb-4">{contactTitle}</h3>
            <ul className="space-y-3 p-0 m-0 list-none">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-white/60 shrink-0 mt-1" aria-hidden="true" />
                <span className="text-[14px] leading-snug text-white/90">
                  {addressLine1}
                  <br />
                  {addressLine2}
                  <br />
                  {addressLine3}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-white/60 shrink-0" aria-hidden="true" />
                <a href={`tel:${phoneTel}`} className={FOOTER_LINK}>
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-white/60 shrink-0" aria-hidden="true" />
                <a href={`mailto:${email}`} className={FOOTER_LINK}>
                  {email}
                </a>
              </li>
            </ul>

            {/* Nút Đăng ký tư vấn */}
            <div className="mt-5">
              <a
                href={consultationHref}
                onClick={(e) => {
                  if (onConsultationClick) {
                    e.preventDefault()
                    onConsultationClick()
                  } else {
                    handleLink(e, consultationHref)
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-dthu-blue hover:bg-dthu-blue-hover text-white font-medium text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>{consultationText}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar — dthu-navy-dark + border-top 3px dthu-gold */}
      <div className="bg-dthu-navy-dark border-t-[3px] border-dthu-gold">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
          <p className="text-[14px] leading-5 text-white/60 text-left m-0">
            &copy; {currentYear}{" "}
            <a
              href="/"
              onClick={(e) => handleLink(e, "/")}
              className="text-white/80 hover:text-white no-underline transition-colors"
            >
              {brandTitle}
            </a>
            . Trường Đại học Đồng Tháp.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={sitemapHref}
              onClick={(e) => handleLink(e, sitemapHref)}
              className="text-[14px] text-white/60 hover:text-white no-underline transition-colors"
            >
              Sitemap
            </a>
            <a
              href={contactHref}
              onClick={(e) => handleLink(e, contactHref)}
              className="text-[14px] text-white/60 hover:text-white no-underline transition-colors"
            >
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
