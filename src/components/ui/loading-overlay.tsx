"use client"

// @dthu/ui 0.2.0 · loading-overlay
import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

export interface LoadingOverlayProps extends React.ComponentProps<"div"> {
  /** Đang tải: hiện lớp phủ và đặt `aria-busy`. Mặc định `true`. */
  loading?: boolean
  /** Thông báo dưới biểu tượng quay. @default Đang tải... */
  message?: React.ReactNode
}

/**
 * Bọc một vùng nội dung; khi `loading` sẽ phủ mờ vùng đó kèm spinner và thông báo.
 * Nội dung bên dưới bị khóa tương tác (`inert`).
 */
export function LoadingOverlay({ loading = true, message: messageProp, className, children, ...props }: LoadingOverlayProps) {
  const { labels } = useUiConfig()
  const message = messageProp === undefined ? labels.loadingOverlay : messageProp
  return (
    <div data-slot="loading-overlay" aria-busy={loading} className={cn("relative", className)} {...props}>
      <div inert={loading ? true : undefined}>{children}</div>
      {loading && (
        <div role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-background/70 backdrop-blur-[1px]">
          <LoaderCircle aria-hidden className="size-6 animate-spin text-primary motion-reduce:animate-none" />
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      )}
    </div>
  )
}
