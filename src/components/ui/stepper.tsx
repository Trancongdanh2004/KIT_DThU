import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type StepStatus = "complete" | "current" | "upcoming" | "error"

export interface StepperStep {
  /** Mã bước (duy nhất). */
  id: string
  /** Tiêu đề bước. */
  label: React.ReactNode
  /** Mô tả ngắn dưới tiêu đề. */
  description?: React.ReactNode
  /** Ghi đè trạng thái tự tính (vd. "error" để báo bước lỗi). */
  status?: StepStatus
  /** Vô hiệu hóa bước (không bấm được). */
  disabled?: boolean
  /** Nội dung bước; chỉ hiện ở bước đang chọn (dưới bước khi dọc, dưới thanh khi ngang). */
  content?: React.ReactNode
}

export interface StepperProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** Danh sách các bước. */
  steps: StepperStep[]
  /** Chỉ số bước hiện tại (bắt đầu từ 0). */
  activeStep: number
  /** Gọi khi bấm vào một bước (cần `clickable`). */
  onStepChange?: (index: number) => void
  /** Hướng: horizontal (mặc định) hoặc vertical. */
  orientation?: "horizontal" | "vertical"
  /** Cho phép bấm vào bước để chuyển (bước vô hiệu bị bỏ qua). */
  clickable?: boolean
  /** Nhãn truy cập cho danh sách bước. */
  "aria-label"?: string
}

/* Ngưỡng bề ngang (container query) để hiện nhãn mọi bước; hẹp hơn thì chỉ hiện nhãn bước hiện tại. Tăng theo số bước. */
const labelBreakpoint = (count: number) => (count <= 3 ? "@md:flex" : count === 4 ? "@xl:flex" : count === 5 ? "@3xl:flex" : "@5xl:flex")

function statusOf(step: StepperStep, index: number, active: number): StepStatus {
  return step.status ?? (index < active ? "complete" : index === active ? "current" : "upcoming")
}

function Marker({ status, index }: { status: StepStatus; index: number }) {
  return (
    <span
      data-slot="stepper-marker"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-body font-semibold transition-colors",
        status === "complete" && "border-primary bg-primary text-primary-foreground",
        status === "current" && "border-primary bg-background text-primary",
        status === "upcoming" && "border-input bg-background text-muted-foreground",
        status === "error" && "border-destructive bg-destructive text-destructive-foreground",
      )}
    >
      {status === "complete" ? <Check aria-hidden className="size-4" /> : status === "error" ? <X aria-hidden className="size-4" /> : index + 1}
    </span>
  )
}

/**
 * Bộ chỉ dẫn các bước (wizard). Trạng thái từng bước tự tính từ `activeStep`
 * (hoàn thành / hiện tại / chưa tới), có thể ghi đè bằng `status` ("error").
 * Khi bề ngang của stepper hẹp (theo container, kể cả trong ngăn trượt / hộp thoại), chỉ bước hiện tại hiện nhãn.
 */
export function Stepper({ steps, activeStep, onStepChange, orientation = "horizontal", clickable = false, className, ...props }: StepperProps) {
  const vertical = orientation === "vertical"
  const current = steps[activeStep]
  const showLabel = labelBreakpoint(steps.length)
  return (
    <div data-slot="stepper" data-orientation={orientation} className={cn("@container w-full min-w-0", className)} {...props}>
      <ol className={cn("flex", vertical ? "flex-col" : "items-start")}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, activeStep)
          const last = i === steps.length - 1
          const canClick = clickable && !step.disabled && !!onStepChange
          const inner = (
            <>
              <Marker status={status} index={i} />
              <span className={cn("flex min-w-0 flex-col text-left", !vertical && status !== "current" && cn("hidden", showLabel))}>
                <span className={cn("truncate text-control font-semibold", status === "upcoming" && "text-muted-foreground", status === "error" && "text-destructive")}>{step.label}</span>
                {step.description ? <span className={cn("text-xs text-muted-foreground", !vertical && "hidden @md:block")}>{step.description}</span> : null}
              </span>
            </>
          )
          const itemClass = "flex min-w-0 items-center gap-3 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          return (
            <li
              key={step.id}
              data-slot="stepper-step"
              data-status={status}
              aria-current={status === "current" ? "step" : undefined}
              className={cn(
                vertical ? "relative flex flex-col" : "flex min-w-0 items-center",
                !vertical && !last && (status === "current" ? "flex-[2_1_0%] sm:flex-1" : "flex-1"),
                !vertical && last && "flex-none",
              )}
            >
              <div className={cn(!vertical && "flex w-full items-center gap-2", vertical && "flex flex-col")}>
                {canClick ? (
                  <button type="button" onClick={() => onStepChange?.(i)} className={cn(itemClass, "cursor-pointer hover:bg-accent min-h-10")}>{inner}</button>
                ) : (
                  <div className={cn(itemClass, step.disabled && "opacity-50")} aria-disabled={step.disabled || undefined}>{inner}</div>
                )}
                {!vertical && !last ? (
                  <span aria-hidden className={cn("h-0.5 min-w-3 flex-1 rounded-full", status === "complete" ? "bg-primary" : "bg-border")} />
                ) : null}
              </div>
              {vertical ? (
                <div className={cn("ml-[1.125rem] flex gap-4 border-l-2 pl-6", last ? "border-transparent" : status === "complete" ? "border-primary" : "border-border")}>
                  <div className={cn("min-w-0 flex-1", (i === activeStep && step.content) ? "py-3" : "min-h-4")}>{i === activeStep ? step.content : null}</div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
      {!vertical && current?.content ? <div data-slot="stepper-content" className="mt-6">{current.content}</div> : null}
    </div>
  )
}
