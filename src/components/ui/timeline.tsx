import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

type TimelineLayout = "left" | "alternate"
const LayoutContext = React.createContext<TimelineLayout>("left")
const IndexContext = React.createContext(0)

export interface TimelineProps extends React.ComponentProps<"ol"> {
  /** `left`: một cột; `alternate`: xen kẽ hai bên từ màn hình `md` trở lên (điện thoại vẫn một cột). */
  layout?: TimelineLayout
}

/** Dòng thời gian dọc cho lịch sử / nhật ký xử lý. Là danh sách có thứ tự (`ol`) chứa các `TimelineItem`. */
export function Timeline({ layout = "left", className, children, ...props }: TimelineProps) {
  const items = React.Children.toArray(children)
  return (
    <LayoutContext value={layout}>
      <ol data-slot="timeline" data-layout={layout} className={cn("flex flex-col", className)} {...props}>
        {items.map((child, i) => <IndexContext key={React.isValidElement(child) && child.key != null ? child.key : i} value={i}>{child}</IndexContext>)}
      </ol>
    </LayoutContext>
  )
}

const markerVariants = cva("relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card [&_svg]:size-4", {
  variants: {
    status: {
      default: "border-border text-muted-foreground",
      primary: "border-primary bg-primary text-primary-foreground",
      success: "border-success bg-success text-success-foreground",
      warning: "border-warning bg-warning text-warning-foreground",
      destructive: "border-destructive bg-destructive text-destructive-foreground",
      info: "border-primary bg-accent text-accent-foreground",
    },
  },
  defaultVariants: { status: "default" },
})

export type TimelineStatus = "default" | "primary" | "success" | "warning" | "destructive" | "info"

export interface TimelineItemProps extends Omit<React.ComponentProps<"li">, "title"> {
  /** Biểu tượng trong chấm mốc; bỏ trống thì chỉ là chấm tròn nhỏ. */
  icon?: React.ReactNode
  /** Thời điểm hiển thị (chuỗi đã định dạng hoặc node). */
  time?: React.ReactNode
  /** Giá trị `dateTime` (ISO) cho thẻ `time`. */
  dateTime?: string
  /** Tiêu đề sự kiện. */
  title: React.ReactNode
  /** Mô tả / chi tiết. */
  description?: React.ReactNode
  /** Màu trạng thái của mốc. */
  status?: TimelineStatus
  /** Nội dung thêm bên dưới mô tả (tệp đính kèm, nút...). */
  children?: React.ReactNode
}

/** Một sự kiện trong `Timeline`: mốc có biểu tượng, thời gian, tiêu đề, mô tả, màu trạng thái. */
export function TimelineItem({ icon, time, dateTime, title, description, status = "default", className, children, ...props }: TimelineItemProps) {
  const layout = React.useContext(LayoutContext)
  const index = React.useContext(IndexContext)
  const alt = layout === "alternate"
  const bodyOnStart = alt && index % 2 === 0
  const timeEl = time != null && (dateTime ? <time dateTime={dateTime}>{time}</time> : <span>{time}</span>)
  return (
    <li
      data-slot="timeline-item"
      className={cn("group/item relative grid grid-cols-[2rem_1fr] gap-x-3", alt && "md:grid-cols-[1fr_2rem_1fr] md:gap-x-4", className)}
      {...props}
    >
      <div data-slot="timeline-marker" className={cn("relative row-span-1 flex flex-col items-center", alt && "md:col-start-2")}>
        <span className={markerVariants({ status })} aria-hidden={icon ? undefined : true}>
          {icon ?? <span className="size-2 rounded-full bg-current" />}
        </span>
        <span aria-hidden className="-mt-px w-px flex-1 bg-border group-last/item:hidden" />
      </div>
      <div
        data-slot="timeline-body"
        className={cn("min-w-0 pb-6 group-last/item:pb-0", alt && (bodyOnStart ? "md:col-start-1 md:row-start-1 md:text-right" : "md:col-start-3 md:row-start-1"))}
      >
        <div className="flex min-h-8 flex-col justify-center">
          <div className="text-control font-semibold">{title}</div>
          {timeEl && <div className="text-xs text-muted-foreground">{timeEl}</div>}
        </div>
        {description && <div className="mt-1 text-body text-muted-foreground">{description}</div>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </li>
  )
}
