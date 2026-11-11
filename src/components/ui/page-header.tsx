import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends Omit<React.ComponentProps<"header">, "title"> {
  /** Tiêu đề trang. */
  title: React.ReactNode
  /** Mô tả ngắn dưới tiêu đề. */
  description?: React.ReactNode
  /** Vùng đường dẫn (thường là `<Breadcrumb />`) phía trên tiêu đề. */
  breadcrumb?: React.ReactNode
  /** Vùng nút hành động bên phải (xuống dòng dưới tiêu đề trên mobile). */
  actions?: React.ReactNode
  /** Hàng tab (thường là `<Tabs><TabsList>...`) dưới cùng, có đường kẻ đáy. */
  tabs?: React.ReactNode
}

/** Đầu trang: breadcrumb, tiêu đề, mô tả, hành động và hàng tab tùy chọn. Responsive. */
export function PageHeader({ title, description, breadcrumb, actions, tabs, className, ...props }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("flex flex-col gap-3 border-b bg-background px-4 pt-4 sm:px-6", !tabs && "pb-4", className)} {...props}>
      {breadcrumb && <div data-slot="page-header-breadcrumb" className="min-w-0 overflow-x-auto">{breadcrumb}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{title}</h1>
          {description && <p className="text-control text-muted-foreground">{description}</p>}
        </div>
        {actions && <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && <div data-slot="page-header-tabs" className="-mb-px overflow-x-auto">{tabs}</div>}
    </header>
  )
}
