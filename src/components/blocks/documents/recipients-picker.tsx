"use client"

// @dthu/ui 0.2.0 · block-documents
import { ChevronDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ComposeField } from "./compose-parts"

export interface Recipient { id: string; name: string; unit: string }

export interface RecipientsPickerProps {
  options: Recipient[]
  value: string[]
  onChange: (ids: string[]) => void
  label?: string
}

/** Chips of chosen recipients plus a popover checklist to add more. */
export function RecipientsPicker({ options, value, onChange, label = "Người / đơn vị nhận" }: RecipientsPickerProps) {
  const chosen = options.filter((o) => value.includes(o.id))
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  return (
    <ComposeField label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <div role="combobox" aria-haspopup="listbox" aria-expanded={false} aria-label="Gõ tên hoặc mã cơ quan / đơn vị nhận để tìm" tabIndex={0}
            className="flex min-h-9 w-full cursor-pointer items-center gap-1.5 rounded-md border border-field-border bg-background py-[3px] pr-1.5 pl-[11px] text-left text-body leading-[22px] outline-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none hover:border-input focus-visible:border-primary focus-visible:shadow-focus-soft data-[state=open]:border-primary data-[state=open]:shadow-focus-soft">
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {chosen.length === 0 && <span className="truncate text-subtle-foreground">Gõ tên hoặc mã cơ quan / đơn vị nhận để tìm</span>}
              {chosen.map((r) => (
                <span key={r.id} className="inline-flex max-w-full items-center gap-1.5 truncate">
                  <span className="truncate">{r.name}</span>
                  <button type="button" aria-label={`Bỏ ${r.name}`} onClick={(e) => { e.stopPropagation(); toggle(r.id) }} className="cursor-pointer rounded-full text-subtle-foreground hover:text-destructive [&_svg]:size-3.5"><X /></button>
                </span>
              ))}
            </span>
            <ChevronDown className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <ul className="grid max-h-60 gap-1 overflow-auto">
            {options.map((o) => (
              <li key={o.id} className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent/50">
                <Checkbox id={`rcp-${o.id}`} checked={value.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
                <Label htmlFor={`rcp-${o.id}`} className="flex-1 cursor-pointer flex-col items-start gap-0">
                  <span>{o.name}</span><span className="text-xs font-normal text-muted-foreground">{o.unit}</span>
                </Label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </ComposeField>
  )
}
