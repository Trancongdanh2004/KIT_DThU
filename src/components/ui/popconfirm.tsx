"use client"

// @dthu/ui 0.2.0 · popconfirm
import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CircleHelp, LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useUiConfig } from "@/lib/ui-config"

/** Vị trí popup theo kiểu Ant Design: top/bottom/left/right kèm Left/Right/Top/Bottom để căn lệch. */
export type PopconfirmPlacement =
  | "top" | "topLeft" | "topRight"
  | "bottom" | "bottomLeft" | "bottomRight"
  | "left" | "leftTop" | "leftBottom"
  | "right" | "rightTop" | "rightBottom"

/** Đổi tên placement kiểu antd sang `side`/`align` của Radix. */
export function parsePlacement(p: string): { side: "top" | "bottom" | "left" | "right"; align: "start" | "center" | "end" } {
  const m = /^(top|bottom|left|right)(Left|Right|Top|Bottom)?$/.exec(p)
  const side = (m?.[1] ?? "top") as "top" | "bottom" | "left" | "right"
  const a = m?.[2]
  const align = a === "Left" || a === "Top" ? "start" : a === "Right" || a === "Bottom" ? "end" : "center"
  return { side, align }
}

export interface PopconfirmProps {
  /** Phần tử kích hoạt (một phần tử duy nhất, nhận ref và onClick). */
  children: React.ReactElement
  /** Tiêu đề câu hỏi xác nhận; dùng làm nhãn của hộp thoại. */
  title: React.ReactNode
  /** Mô tả bổ sung hậu quả của hành động. */
  description?: React.ReactNode
  /** Nhãn nút xác nhận. Mặc định "Đồng ý". @default Đồng ý */
  okText?: React.ReactNode
  /** Nhãn nút hủy. Mặc định "Hủy". @default Hủy */
  cancelText?: React.ReactNode
  /** Kiểu nút xác nhận; `destructive` cho hành động xóa. Mặc định "default". */
  okVariant?: ButtonProps["variant"]
  /** Props bổ sung cho nút xác nhận (vd. `disabled`). */
  okButtonProps?: Omit<ButtonProps, "children" | "onClick">
  /** Props bổ sung cho nút hủy. */
  cancelButtonProps?: Omit<ButtonProps, "children" | "onClick">
  /** Biểu tượng đầu tiêu đề. Mặc định dấu hỏi; truyền `null` để ẩn. */
  icon?: React.ReactNode
  /** Ẩn nút hủy (chỉ còn nút xác nhận). */
  showCancel?: boolean
  /** Gọi khi xác nhận. Nếu trả về Promise, nút hiện loading tới khi xong rồi tự đóng; nếu Promise lỗi thì giữ mở. */
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>
  /** Gọi khi bấm hủy. */
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Vị trí popup so với phần tử kích hoạt. Mặc định "top". */
  placement?: PopconfirmPlacement
  /** Trạng thái mở (controlled). */
  open?: boolean
  /** Trạng thái mở ban đầu (uncontrolled). */
  defaultOpen?: boolean
  /** Gọi khi trạng thái mở thay đổi. */
  onOpenChange?: (open: boolean) => void
  /** Vô hiệu hóa: bấm vào phần tử kích hoạt không mở popup. */
  disabled?: boolean
  /** Class bổ sung cho khung popup. */
  className?: string
}

/**
 * Hộp xác nhận nhỏ neo vào phần tử kích hoạt (tương đương Popconfirm của Ant Design).
 * Dùng `role="alertdialog"` có nhãn là tiêu đề, focus chuyển vào popup, Esc đóng và trả focus về phần tử kích hoạt.
 */
export function Popconfirm({
  children, title, description, okText, cancelText, okVariant = "default", okButtonProps, cancelButtonProps,
  icon, showCancel = true, onConfirm, onCancel, placement = "top", open: openProp, defaultOpen = false, onOpenChange, disabled, className,
}: PopconfirmProps) {
  const { labels } = useUiConfig()
  const [inner, setInner] = React.useState(defaultOpen)
  const [pending, setPending] = React.useState(false)
  const open = openProp ?? inner
  const id = React.useId()
  const { side, align } = parsePlacement(placement)

  function setOpen(next: boolean) {
    if (pending && !next) return
    if (next && disabled) return
    if (openProp === undefined) setInner(next)
    onOpenChange?.(next)
  }

  async function handleConfirm(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      const r = onConfirm?.(e)
      if (r && typeof (r as Promise<unknown>).then === "function") {
        setPending(true)
        await r
      }
      setPending(false)
      setOpen(false)
    } catch {
      setPending(false) // giữ popup mở để thử lại
    }
  }

  return (
    <PopoverPrimitive.Root open={open && !disabled} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="popconfirm"
          role="alertdialog"
          aria-labelledby={`${id}-t`}
          aria-describedby={description ? `${id}-d` : undefined}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          className={cn("anim-popup z-overlay w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[0_3px_12px_#101c2c1a,0_1px_3px_#101c2c12] focus:outline-none", className)}
        >
          <div className="flex items-start gap-2">
            {icon !== null && <span aria-hidden="true" className="mt-0.5 shrink-0 text-warning [&_svg]:size-4">{icon ?? <CircleHelp />}</span>}
            <div className="grid gap-1">
              <div id={`${id}-t`} className="text-control leading-tight font-semibold text-foreground">{title}</div>
              {description && <div id={`${id}-d`} className="text-body leading-normal text-muted-foreground">{description}</div>}
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            {showCancel && (
              <Button size="sm" variant="outline" disabled={pending} {...cancelButtonProps} onClick={(e) => { onCancel?.(e); setOpen(false) }}>{cancelText ?? labels.cancel}</Button>
            )}
            <Button size="sm" variant={okVariant} {...okButtonProps} disabled={pending || okButtonProps?.disabled} aria-busy={pending || undefined} onClick={handleConfirm}>
              {pending && <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {okText ?? labels.confirm}
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
