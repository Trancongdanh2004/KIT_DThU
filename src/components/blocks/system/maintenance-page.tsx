import * as React from "react"
import { Mail, Phone, RefreshCw, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Result } from "@/components/ui/result"

export interface MaintenancePageProps {
  title?: React.ReactNode
  message?: React.ReactNode
  /** Display text such as "22:00, 24/10/2026". */
  startsAt?: string
  endsAt?: string
  /** 0-100. Shows a progress bar while maintenance is running. */
  progress?: number
  /** Support contacts. */
  phone?: string
  email?: string
  /** "Kiểm tra lại" - the app re-checks the health endpoint. */
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

/** Planned-maintenance screen: window, optional progress, contacts and a re-check button. Serve it from the gateway so it works when the app is down. */
export function MaintenancePage({ title = "Hệ thống đang bảo trì", message = "Chúng tôi đang nâng cấp để phục vụ tốt hơn. Dữ liệu của bạn vẫn được giữ nguyên.", startsAt, endsAt, progress, phone, email, onRetry, retrying, className }: MaintenancePageProps) {
  return (
    <main data-slot="maintenance-page" className={className ?? "grid h-full min-h-0 w-full place-items-center overflow-y-auto bg-background px-4 py-10"}>
      <Result status="info" headingLevel={1} icon={<span aria-hidden className="grid size-20 place-items-center rounded-full bg-accent text-primary"><Wrench className="size-9" strokeWidth={1.6} /></span>} title={title} subTitle={message}
        extra={onRetry && <Button onClick={onRetry} disabled={retrying}><RefreshCw className={retrying ? "animate-spin" : undefined} />{retrying ? "Đang kiểm tra..." : "Kiểm tra lại"}</Button>}>
        <div className="grid gap-3 text-body">
          {(startsAt || endsAt) && (
            <dl className="m-0 grid gap-2">
              {startsAt && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Bắt đầu</dt><dd className="m-0 font-medium">{startsAt}</dd></div>}
              {endsAt && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Dự kiến xong</dt><dd className="m-0 font-medium">{endsAt}</dd></div>}
            </dl>
          )}
          {progress != null && <div className="grid gap-1.5"><div className="flex justify-between"><span className="text-muted-foreground">Tiến độ</span><span className="font-medium tabular-nums">{Math.round(progress)}%</span></div><Progress value={progress} aria-label="Tiến độ bảo trì" /></div>}
          {(phone || email) && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-small text-muted-foreground">
              {phone && <a className="inline-flex items-center gap-1.5 text-primary hover:underline" href={`tel:${phone.replace(/\s/g, "")}`}><Phone aria-hidden className="size-3.5" />{phone}</a>}
              {email && <a className="inline-flex items-center gap-1.5 text-primary hover:underline" href={`mailto:${email}`}><Mail aria-hidden className="size-3.5" />{email}</a>}
            </div>
          )}
        </div>
      </Result>
    </main>
  )
}
