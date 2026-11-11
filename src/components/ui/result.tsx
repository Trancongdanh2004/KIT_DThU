"use client"

// @dthu/ui 0.2.0 · result
import * as React from "react"
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

/** Trạng thái của kết quả. */
export type ResultStatus = "success" | "error" | "info" | "warning" | "404" | "403" | "500"

export interface ResultProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Trạng thái: success, error, info, warning hoặc mã lỗi 404 / 403 / 500 (có hình minh họa). Mặc định "info". */
  status?: ResultStatus
  /** Tiêu đề chính, hiển thị dạng heading. */
  title?: React.ReactNode
  /** Phụ đề giải thích thêm. */
  subTitle?: React.ReactNode
  /** Vùng hành động (nút) bên dưới. */
  extra?: React.ReactNode
  /** Thay biểu tượng/hình minh họa mặc định. */
  icon?: React.ReactNode
  /** Cấp heading của tiêu đề (1-6). Mặc định 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

const iconMap = {
  success: { Icon: CircleCheck, tone: "text-success" },
  error: { Icon: CircleX, tone: "text-destructive" },
  info: { Icon: Info, tone: "text-info" },
  warning: { Icon: TriangleAlert, tone: "text-warning" },
} as const

/** Hình minh họa đơn giản cho 403/404/500, vẽ bằng currentColor. Trang trí (aria-hidden). */
function Illustration({ code }: { code: "403" | "404" | "500" }) {
  return (
    <svg data-slot="result-illustration" aria-hidden="true" viewBox="0 0 160 120" className="h-28 w-auto text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="14" width="132" height="92" rx="10" className="fill-secondary" />
      <path d="M14 36h132" />
      <circle cx="26" cy="25" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="25" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="46" cy="25" r="2.5" fill="currentColor" stroke="none" />
      <text x="80" y="82" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" stroke="none">{code}</text>
      {code === "403" && <path d="M70 52a10 10 0 0 1 20 0" />}
      {code === "404" && <path d="M62 52h36" strokeDasharray="4 5" />}
      {code === "500" && <path d="M64 54l6-6 6 6 6-6 6 6 6-6" />}
    </svg>
  )
}

/**
 * Khối kết quả toàn trang (tương đương Result của Ant Design): biểu tượng trạng thái, tiêu đề, phụ đề, nội dung và hành động.
 * Tiêu đề là heading để người dùng đọc màn hình điều hướng; hình minh họa là trang trí.
 */
export function Result({ status = "info", title, subTitle, extra, icon, headingLevel = 2, className, children, ...props }: ResultProps) {
  const Heading = `h${headingLevel}` as "h2"
  const isCode = status === "404" || status === "403" || status === "500"
  let art: React.ReactNode = icon
  if (!art) {
    if (isCode) art = <Illustration code={status} />
    else {
      const { Icon, tone } = iconMap[status]
      art = <Icon aria-hidden="true" className={cn("size-16", tone)} strokeWidth={1.6} />
    }
  }
  const { labels } = useUiConfig()
  const defaultTitle: Record<ResultStatus, string> = {
    success: labels.resultSuccess, error: labels.resultError, info: labels.resultInfo, warning: labels.resultWarning,
    "404": labels.result404, "403": labels.result403, "500": labels.result500,
  }
  const heading = title ?? defaultTitle[status]
  return (
    <div data-slot="result" data-status={status} className={cn("flex flex-col items-center px-6 py-10 text-center", className)} {...props}>
      <div data-slot="result-icon" aria-hidden="true">{art}</div>
      <Heading data-slot="result-title" className="mt-4 text-xl leading-tight font-bold text-foreground">{heading}</Heading>
      {subTitle && <p data-slot="result-subtitle" className="mt-2 max-w-md text-body leading-normal text-muted-foreground">{subTitle}</p>}
      {extra && <div data-slot="result-extra" className="mt-6 flex flex-wrap items-center justify-center gap-2">{extra}</div>}
      {children && <div data-slot="result-content" className="mt-6 w-full max-w-2xl rounded-lg bg-secondary p-4 text-left">{children}</div>}
    </div>
  )
}
