"use client"

// @dthu/ui 0.2.0 · context-menu
import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuStyles } from "@/components/ui/dropdown-menu-extras"

/** Menu chuột phải (nhấn giữ trên cảm ứng). Bọc vùng cần gắn menu bằng `ContextMenuTrigger`. */
export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

export function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" className={cn(menuStyles.content, className)} {...props} />
    </ContextMenuPrimitive.Portal>
  )
}
export function ContextMenuItem({ className, inset, variant, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  /** `destructive` tô đỏ mục nguy hiểm. */
  variant?: "default" | "destructive"
}) {
  return <ContextMenuPrimitive.Item data-slot="context-menu-item" className={cn(menuStyles.item, inset && "pl-8", variant === "destructive" && menuStyles.destructive, className)} {...props} />
}
export function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" className={cn(menuStyles.checkable, className)} checked={checked} {...props}>
      <span className={menuStyles.indicator}><ContextMenuPrimitive.ItemIndicator><Check /></ContextMenuPrimitive.ItemIndicator></span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}
export function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(menuStyles.checkable, className)} {...props}>
      <span className={menuStyles.indicator}><ContextMenuPrimitive.ItemIndicator><Circle className="size-2 fill-current" /></ContextMenuPrimitive.ItemIndicator></span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}
export function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label className={cn(menuStyles.label, inset && "pl-8", className)} {...props} />
}
export function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator className={cn(menuStyles.separator, className)} {...props} />
}
export function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn(menuStyles.shortcut, className)} {...props} />
}
export function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" className={cn(menuStyles.item, menuStyles.subTrigger, inset && "pl-8", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}
export function ContextMenuSubContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" className={cn(menuStyles.content, className)} {...props} />
    </ContextMenuPrimitive.Portal>
  )
}
