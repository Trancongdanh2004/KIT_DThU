"use client"

// @dthu/ui 0.2.0 · block-system
import * as React from "react"
import { RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Result } from "@/components/ui/result"

/** `navigator.onLine` as state, updated on the `online` / `offline` events. Use it to swap the app for `OfflinePage` or show a banner. */
export function useOnlineStatus() {
  const [online, setOnline] = React.useState(() => (typeof navigator === "undefined" ? true : navigator.onLine))
  React.useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off) }
  }, [])
  return online
}

export interface OfflinePageProps {
  /** Cannot reach the server (as opposed to the device being offline). */
  reason?: "offline" | "server-unreachable"
  /** Display text of the last successful sync, e.g. "10:42". */
  lastSync?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

/** Connection-lost screen with a retry button and the usual checks. `aria-live` so it is announced when it replaces the app. */
export function OfflinePage({ reason = "offline", lastSync, onRetry, retrying, className }: OfflinePageProps) {
  return (
    <main data-slot="offline-page" aria-live="polite" className={className ?? "grid h-full min-h-0 w-full place-items-center overflow-y-auto bg-background px-4 py-10"}>
      <Result status="warning" headingLevel={1} icon={<span aria-hidden className="grid size-20 place-items-center rounded-full bg-warning/15 text-warning"><WifiOff className="size-9" strokeWidth={1.6} /></span>}
        title={reason === "offline" ? "Mất kết nối mạng" : "Không kết nối được máy chủ"}
        subTitle={reason === "offline" ? "Thiết bị đang ngoại tuyến. Hệ thống sẽ tự thử lại khi có mạng." : "Máy chủ chưa phản hồi. Mạng của bạn vẫn hoạt động, hãy thử lại sau ít phút."}
        extra={<Button onClick={onRetry} disabled={retrying}><RefreshCw className={retrying ? "animate-spin" : undefined} />{retrying ? "Đang thử lại..." : "Thử lại ngay"}</Button>}>
        <ul className="m-0 grid list-disc gap-1 pl-5 text-small text-muted-foreground">
          <li>Kiểm tra Wi-Fi hoặc cáp mạng.</li>
          <li>Thử mở một trang web khác để biết mạng có hoạt động không.</li>
          {lastSync && <li>Dữ liệu đồng bộ lần cuối lúc <b className="font-semibold text-foreground">{lastSync}</b>. Thay đổi chưa lưu được giữ lại trên máy.</li>}
        </ul>
      </Result>
    </main>
  )
}
