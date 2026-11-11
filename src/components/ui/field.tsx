import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

/** Nhóm các Field (khoảng cách chuẩn giữa các trường). */
export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("flex w-full flex-col gap-3", className)} {...props} />
}

/** Khối trường có tiêu đề: `fieldset` ngữ nghĩa, dùng với FieldLegend. */
export function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset data-slot="field-set" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
}

/** Tiêu đề của FieldSet. `variant="label"` cho cỡ chữ nhỏ hơn. */
export function FieldLegend({ className, variant = "legend", ...props }: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn("mb-1 font-medium data-[variant=legend]:text-base data-[variant=label]:text-body", className)}
      {...props}
    />
  )
}

export const fieldVariants = cva("group/field flex w-full gap-[5px] data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col [&>*]:w-full",
      horizontal: "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
      responsive: "flex-col [&>*]:w-full md:flex-row md:items-center md:[&>*]:w-auto md:[&>[data-slot=field-label]]:flex-auto",
    },
  },
  defaultVariants: { orientation: "vertical" },
})

export interface FieldProps extends React.ComponentProps<"div"> {
  /** Cách xếp nhãn và điều khiển: vertical (mặc định), horizontal, responsive (dọc trên di động, ngang từ md). */
  orientation?: "vertical" | "horizontal" | "responsive"
  /** Đánh dấu trường đang lỗi (đổi màu nhãn). */
  invalid?: boolean
}

/** Một trường biểu mẫu: gom nhãn, điều khiển, mô tả và lỗi. */
export function Field({ className, orientation = "vertical", invalid, ...props }: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid || undefined}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

/** Vùng nội dung (tiêu đề + mô tả) cạnh điều khiển trong Field ngang. */
export function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-content" className={cn("flex flex-1 flex-col gap-1 leading-snug", className)} {...props} />
}

/** Nhãn của Field. */
export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("group-data-[invalid=true]/field:text-destructive", className)} {...props} />
}

/** Tiêu đề (không phải thẻ label) trong Field. */
export function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-title" className={cn("flex w-fit items-center gap-2 text-small leading-[1.4] font-semibold", className)} {...props} />
}

/** Mô tả phụ dưới điều khiển. */
export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-label leading-[1.45] font-normal text-subtle-foreground", className)} {...props} />
}

/** Vạch ngăn giữa các trường, có thể kèm chữ ở giữa (vd. "hoặc"). */
export function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-separator" className={cn("relative -my-1 h-5 text-body", className)} {...props}>
      <Separator className="absolute inset-x-0 top-1/2" />
      {children ? <span className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground">{children}</span> : null}
    </div>
  )
}

export interface FieldErrorProps extends React.ComponentProps<"div"> {
  /** Danh sách lỗi (tương thích kết quả của react-hook-form / zod). Bỏ trống thì dùng `children`. */
  errors?: Array<{ message?: string } | undefined>
}

/** Thông báo lỗi của Field (role="alert"). Không render gì nếu không có lỗi. */
export function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  const content = React.useMemo(() => {
    if (children) return children
    const messages = [...new Set((errors ?? []).map((e) => e?.message).filter(Boolean))]
    if (messages.length === 0) return null
    if (messages.length === 1) return messages[0]
    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((m) => <li key={m}>{m}</li>)}
      </ul>
    )
  }, [children, errors])
  if (!content) return null
  return (
    <div role="alert" data-slot="field-error" className={cn("text-label leading-[1.45] font-normal text-destructive", className)} {...props}>
      {content}
    </div>
  )
}
