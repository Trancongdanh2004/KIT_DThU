import * as React from "react"
import { cn } from "@/lib/utils"

export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /** Số cột ở màn hình rộng (mặc định 2). Trên màn hình hẹp luôn 1 cột. */
  columns?: 1 | 2 | 3
  /** `stacked`: nhãn trên giá trị; `inline`: nhãn bên trái, giá trị bên phải. */
  layout?: "stacked" | "inline"
  /** Kẻ đường phân cách giữa các mục. */
  divided?: boolean
}

const colClass = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" } as const

/** Danh sách mô tả (thẻ `dl`) cho cặp nhãn / giá trị; 1 cột trên điện thoại, 2 cột (hoặc 3) từ màn hình rộng. */
export function DescriptionList({ columns = 2, layout = "stacked", divided = false, className, ...props }: DescriptionListProps) {
  return <dl data-slot="description-list" data-layout={layout} data-divided={divided || undefined} className={cn("group/dl grid grid-cols-1 gap-x-8 gap-y-4 text-body", colClass[columns], className)} {...props} />
}

export interface DescriptionItemProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Nhãn (thẻ `dt`). */
  term: React.ReactNode
  /** Chiếm hết hàng (mọi cột). */
  span?: boolean
}

/** Một mục nhãn / giá trị; nội dung `children` là giá trị (thẻ `dd`). */
export function DescriptionItem({ term, span = false, className, children, ...props }: DescriptionItemProps) {
  return (
    <div
      data-slot="description-item"
      className={cn(
        "min-w-0 group-data-[divided]/dl:border-b group-data-[divided]/dl:pb-4",
        "group-data-[layout=inline]/dl:flex group-data-[layout=inline]/dl:items-baseline group-data-[layout=inline]/dl:gap-4",
        span && "sm:col-span-full", className,
      )}
      {...props}
    >
      <dt className="text-muted-foreground group-data-[layout=inline]/dl:w-36 group-data-[layout=inline]/dl:shrink-0">{term}</dt>
      <dd className="mt-0.5 min-w-0 font-medium break-words group-data-[layout=inline]/dl:mt-0">{children ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}
