import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useUiConfig } from "@/lib/ui-config"

export interface StatTileProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Tên chỉ số (KPI). */
  label: React.ReactNode
  /** Giá trị chính, đã định dạng. */
  value: React.ReactNode
  /** Mức thay đổi (số, ví dụ 12.5 nghĩa là +12,5%). Dấu quyết định mũi tên. */
  delta?: number
  /** Chuỗi hiển thị cho delta; mặc định tự định dạng phần trăm. */
  deltaText?: React.ReactNode
  /** Mô tả kèm delta, ví dụ "so với tháng trước". */
  deltaLabel?: React.ReactNode
  /** Hướng nào là tốt: "up" (tăng là tốt, mặc định) hoặc "down" (giảm là tốt, ví dụ văn bản quá hạn). */
  goodDirection?: "up" | "down"
  /** Biểu tượng góc phải. */
  icon?: React.ReactNode
  /** Vùng cho sparkline / biểu đồ nhỏ (thường là `<Sparkline />`). */
  sparkline?: React.ReactNode
  /** Hiển thị khung chờ. */
  loading?: boolean
}

/** Ô chỉ số KPI: nhãn, giá trị lớn, xu hướng (mũi tên + màu theo hướng tốt/xấu) và vùng sparkline. */
export function StatTile({ label, value, delta, deltaText, deltaLabel, goodDirection = "up", icon, sparkline, loading = false, className, ...props }: StatTileProps) {
  const { locale, labels } = useUiConfig()
  const dir = delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down"
  const tone = dir === "flat" ? "text-muted-foreground" : dir === goodDirection ? "text-success" : "text-destructive"
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus
  const text = deltaText ?? (delta === undefined ? null : `${delta > 0 ? "+" : ""}${delta.toLocaleString(locale, { maximumFractionDigits: 1 })}%`)
  return (
    <div data-slot="stat-tile" aria-busy={loading || undefined} className={cn("flex min-w-0 flex-col items-start rounded-xl border border-[color-mix(in_srgb,var(--border)_67%,var(--card))] bg-card px-4 pt-[15px] pb-3.5 text-card-foreground shadow-[0_1px_2px_#2323380d,0_4px_16px_#2323380f]", className)} {...props}>
      <div className="flex w-full items-start justify-between gap-2">
        <div className="text-label font-semibold text-[color-mix(in_srgb,var(--subtle-foreground)_70%,var(--muted-foreground))]">{label}</div>
        {icon && <div aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-primary [&_svg]:size-4">{icon}</div>}
      </div>
      {loading ? <Skeleton className="mt-1.5 h-8 w-24" /> : <div className="mt-1.5 text-display leading-[1.05] font-bold tracking-[-0.035em] tabular-nums">{value}</div>}
      <div className="mt-[3px] flex w-full items-end justify-between gap-3">
        {loading ? <Skeleton className="h-4 w-28" /> : text !== null ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-label">
            <span className={cn("inline-flex items-center gap-0.5 font-medium", tone)}>
              <Arrow aria-hidden className="size-3.5" />
              <span className="sr-only">{`${dir === "up" ? labels.trendUp : dir === "down" ? labels.trendDown : labels.trendFlat} `}</span>
              {text}
            </span>
            {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
          </div>
        ) : <span />}
        {sparkline && !loading && <div className="shrink-0">{sparkline}</div>}
      </div>
    </div>
  )
}
