import * as React from "react"
import { ArrowLeft, Copy, Check, House, LifeBuoy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Result, type ResultStatus } from "@/components/ui/result"

export type ErrorPageStatus = Extract<ResultStatus, "403" | "404" | "500">

export interface ErrorPageProps {
  status: ErrorPageStatus
  /** Override the default title / description of the status. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** Requested path, shown for 404 / 403 so the user can spot a typo. */
  path?: string
  /** Support reference of a server error (500); shown with a copy button so users can quote it. */
  errorId?: string
  onHome?: () => void
  onBack?: () => void
  /** 500: try the same request again. */
  onRetry?: () => void
  /** 403: ask for access (opens a request form in the app). */
  onRequestAccess?: () => void
  /** Contact / report a problem. */
  onSupport?: () => void
  className?: string
}

const text = {
  "404": { title: "Không tìm thấy trang", description: "Địa chỉ có thể đã sai, hoặc trang đã được chuyển hoặc xóa." },
  "403": { title: "Bạn chưa có quyền truy cập", description: "Tài khoản hiện tại không được phép xem nội dung này. Nếu cần, hãy gửi yêu cầu cấp quyền." },
  "500": { title: "Hệ thống đang gặp sự cố", description: "Đã có lỗi ở phía máy chủ. Hãy thử lại sau ít phút; nếu vẫn lỗi, báo cho bộ phận hỗ trợ kèm mã lỗi." },
} as const

/** Full-page 403 / 404 / 500 with the recovery actions that make sense for each: home, back, retry, request access, contact support. */
export function ErrorPage({ status, title, description, path, errorId, onHome, onBack, onRetry, onRequestAccess, onSupport, className }: ErrorPageProps) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(errorId ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard not available */ }
  }
  return (
    <main data-slot="error-page" data-status={status} className={className ?? "grid h-full min-h-0 w-full place-items-center overflow-y-auto bg-background px-4 py-10"}>
      <Result
        status={status}
        headingLevel={1}
        title={title ?? text[status].title}
        subTitle={<>{description ?? text[status].description}{path && <span className="mt-2 block text-small">Địa chỉ: <code className="font-mono text-foreground">{path}</code></span>}</>}
        extra={<>
          {onHome && <Button onClick={onHome}><House />Về trang chủ</Button>}
          {status === "500" && onRetry && <Button variant="outline" onClick={onRetry}><RefreshCw />Thử lại</Button>}
          {status === "403" && onRequestAccess && <Button variant="outline" onClick={onRequestAccess}>Yêu cầu cấp quyền</Button>}
          {onBack && <Button variant="ghost" onClick={onBack}><ArrowLeft />Quay lại</Button>}
          {onSupport && <Button variant="ghost" onClick={onSupport}><LifeBuoy />Liên hệ hỗ trợ</Button>}
        </>}
      >
        {errorId && (
          <div className="flex items-center justify-between gap-3 text-small">
            <span className="text-muted-foreground">Mã lỗi: <code className="font-mono text-foreground">{errorId}</code></span>
            <Button variant="ghost" size="sm" onClick={copy} aria-label="Sao chép mã lỗi">{copied ? <Check /> : <Copy />}{copied ? "Đã chép" : "Sao chép"}</Button>
          </div>
        )}
      </Result>
    </main>
  )
}
