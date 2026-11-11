"use client"

// @dthu/ui 0.2.0 · block-work
import * as React from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRetained } from "@/lib/use-retained"

export interface WorkLogDetailField { label: string; value: React.ReactNode }
export interface WorkLogDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: WorkLogDetailField[]
  /** Optional raw payload shown in a monospaced block. */
  raw?: string
}

/** Right-hand drawer with key/value details of a log row. */
export function WorkLogDetailSheet({ open, onOpenChange, title: titleProp, description: descriptionProp, fields: fieldsProp, raw: rawProp }: WorkLogDetailSheetProps) {
  // Callers usually clear the record together with `open`; keep the last one on screen while the sheet slides out.
  const title = useRetained(titleProp, open)
  const description = useRetained(descriptionProp, open)
  const fields = useRetained(fieldsProp, open)
  const raw = useRetained(rawProp, open)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-auto sm:max-w-lg">
        <SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{description ?? "Chi tiết bản ghi"}</SheetDescription></SheetHeader>
        <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
          {fields.map((f) => <React.Fragment key={f.label}><dt className="text-muted-foreground">{f.label}</dt><dd className="min-w-0 [overflow-wrap:anywhere]">{f.value}</dd></React.Fragment>)}
        </dl>
        {raw && <pre className="overflow-auto rounded-md border bg-secondary p-3 font-mono text-xs whitespace-pre-wrap [overflow-wrap:anywhere]">{raw}</pre>}
      </SheetContent>
    </Sheet>
  )
}
