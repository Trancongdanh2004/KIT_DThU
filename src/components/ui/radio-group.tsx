import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-0.5", className)} {...props} />
}

/*
 * 1:1 with the reference `do-radio__muc .o`: 16px circle, 1px line border, checked = primary fill with a 6px white dot,
 * hover (unchecked) = line-hard border, focus = primary border + 3px ring (primary @ 12%), disabled = 55% opacity.
 */
export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "relative inline-flex aspect-square size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-background p-0 transition-[background-color,border-color,box-shadow] duration-[120ms] outline-none after:absolute after:-inset-2.5 after:content-[''] md:after:-inset-1 hover:data-[state=unchecked]:border-muted-foreground focus-visible:border-primary focus-visible:shadow-focus disabled:cursor-default disabled:opacity-55 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center"><span className="block size-1.5 rounded-full bg-background" /></RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
