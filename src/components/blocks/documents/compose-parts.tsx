"use client"

// @dthu/ui 0.2.0 · block-documents
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/*
 * Compose-page vocabulary of the reference (`.vbd-soan`): header card `.soan-dau`, numbered card `.muc` (radius 9, p-4, mb 14),
 * field `.o` (label 12.5/600 ink-dim, input 13px py 6 px 10), 2-column row `.o-doi`, segmented `.he-vb-seg`, dashed number box `.doc-thoi`.
 */
export interface ComposeOption { value: string; label: string }

/** Control overrides: the reference compose inputs are 13px with 6/10 padding (shared Input is 36px / 13.5px). */
export const composeInputClass = "h-auto px-2.5 py-1.5 text-body leading-[1.5]"
export const composeTextareaClass = "min-h-0 px-2.5 py-1.5 text-body leading-[1.625]"

export function ComposeInput({ className, ...p }: React.ComponentProps<typeof Input>) { return <Input className={cn(composeInputClass, className)} {...p} /> }
export function ComposeTextarea({ className, ...p }: React.ComponentProps<typeof Textarea>) { return <Textarea className={cn(composeTextareaClass, className)} {...p} /> }

/** Page header card (`.soan-dau`): title + description left, actions right. */
export function ComposeHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <header className="relative z-20 mb-3 flex shrink-0 flex-wrap items-start gap-x-4 gap-y-3 rounded-[9px] border border-border bg-card px-4 py-[13px] shadow-sm">
      <div className="min-w-[240px] flex-1">
        {/* h2: h1 duy nhất của trang do InternalLayout cấp (sr-only), giống PageHead. */}
        <h2 className="m-0 text-base leading-[1.3] font-semibold">{title}</h2>
        {description && <p className="mt-1 mb-0 text-small leading-[1.7] text-subtle-foreground">{description}</p>}
      </div>
      <div className="flex flex-none flex-wrap items-center gap-2">{children}</div>
    </header>
  )
}

/** Two-column layout (`.soan-cot`): fluid + 352px side panel, single column <= 1100px. */
export function ComposeColumns({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-4 min-[1101px]:grid-cols-[minmax(0,1fr)_352px]">{children}</div>
}

/** Numbered card (`.muc`). */
export function ComposeSection({ n, title, hint, required, note, label, children, className }: {
  n?: number; title: string; hint?: string; required?: boolean; note?: string; label?: string; children: React.ReactNode; className?: string
}) {
  return (
    <section aria-label={label ?? title} className={cn("mb-3.5 rounded-[9px] border border-border bg-card p-4", className)}>
      <ComposeStep n={n} title={title} required={required} note={note} hint={hint} />
      {children}
    </section>
  )
}

export function ComposeStep({ n, title, hint, required, note }: { n?: number; title: string; hint?: string; required?: boolean; note?: string }) {
  return (
    <>
      <h2 className={cn("m-0 mb-1 flex items-center gap-2 text-sm leading-[1.2] font-semibold")}>
        {n !== undefined && <i className="grid size-[21px] place-items-center rounded-full bg-primary text-caption font-bold text-primary-foreground not-italic">{n}</i>}
        {title}
        {required && <span className="font-bold text-destructive" aria-hidden>*</span>}
        {note && <em className="text-label font-normal text-subtle-foreground not-italic">{note}</em>}
      </h2>
      {hint && <p className="mt-0 mb-3 text-xs leading-[1.7] text-subtle-foreground">{hint}</p>}
    </>
  )
}

/** Field wrapper (`.o`): label row + control + optional hint / error; last child has no bottom margin. */
export function ComposeField({ label, required, htmlFor, optionalNote, error, children, className, counter, labelExtra, labelIcon }: {
  label: string; required?: boolean; htmlFor?: string; optionalNote?: string; error?: string; children: React.ReactNode; className?: string
  /** Right-aligned mono counter in the label row. */
  counter?: React.ReactNode
  /** Right-aligned extra node in the label row (segmented control, mask badge). */
  labelExtra?: React.ReactNode
  /** Small icon right after the label text. */
  labelIcon?: React.ReactNode
}) {
  const lab = (
    <Label htmlFor={htmlFor} className="mb-0 flex items-baseline gap-1.5 text-small leading-[1.5] font-semibold text-muted-foreground">
      {label}{labelIcon}{required && <span className="font-bold text-destructive" aria-hidden>*</span>}
      {optionalNote && <em className="text-label font-normal text-subtle-foreground not-italic">— {optionalNote}</em>}
      {counter && <em className="ml-auto font-mono text-caption font-medium text-subtle-foreground not-italic">{counter}</em>}
    </Label>
  )
  return (
    <div className={cn("mb-3.5 min-w-0 last:mb-0", className)}>
      {labelExtra ? <div className="mb-1 flex min-h-[26px] items-center justify-between gap-2">{lab}{labelExtra}</div> : <div className="mb-1 [&>label]:w-full">{lab}</div>}
      {children}
      {error && <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-1 mb-0 text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Helper line under a control (`.o-goi`). */
export function ComposeHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 mb-0 text-label leading-relaxed text-subtle-foreground">{children}</p>
}

/** Row of fields (`.o-doi`): auto-fit columns of min 232px, 16px column gap. */
export function ComposeRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(232px,1fr))] gap-x-4">{children}</div>
}

export function ComposeSelect({ id, value, onChange, options, placeholder, invalid, disabled, clearable }: {
  id: string; value: string; onChange: (v: string) => void; options: ComposeOption[]; placeholder: string; invalid?: boolean; disabled?: boolean
  /** Show the reference's "×" clear button while a value is chosen. */
  clearable?: boolean
}) {
  return (
    <div className="relative min-w-0">
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
      {clearable && value && !disabled && (
        <button type="button" aria-label="Xoá chọn" tabIndex={-1} onClick={() => onChange("")}
          className="absolute top-1/2 right-[30px] grid size-[22px] -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-subtle-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"><X /></button>
      )}
    </div>
  )
}

/** Two-way pill toggle ("Hành chính | Đảng") — `.he-vb-seg`. */
export function ComposeSegmented({ value, onChange, options, label, size = "sm" }: { value: string; onChange: (v: string) => void; options: ComposeOption[]; label: string; size?: "sm" | "md" }) {
  const md = size === "md"
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center gap-0.5", md ? "h-[30px] rounded-lg bg-muted p-[3px]" : "rounded-md bg-muted p-0.5")}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn("cursor-pointer border-0 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            md ? "rounded-md px-3 text-body" : "rounded-[4px] px-[9px] py-0.5 text-label leading-[1.4]",
            value === o.value ? "bg-background font-semibold text-primary shadow-sm" : cn("bg-transparent font-medium text-muted-foreground hover:text-foreground", md && "hover:bg-white/60"))}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Small pill (`.so-vb-mask-badge.hc`). */
export function ComposeMaskBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex shrink-0 items-center rounded-[4px] bg-accent px-2 py-0.5 text-caption leading-[1.3] font-medium whitespace-nowrap text-primary">{children}</span>
}

/** Dashed read-only box (`.doc-thoi`), e.g. the auto archive number. */
export function ComposeAutoNumber({ children, note = "tự động" }: { children: React.ReactNode; note?: string }) {
  return <div className="flex items-baseline rounded-md border border-dashed border-border bg-secondary px-2.5 py-1.5 font-mono text-small text-primary">{children}<em className="ml-1.5 text-caption text-subtle-foreground not-italic">{note}</em></div>
}

/** Section card of the incoming-registration page (`.muc` + `.muc-dau`): numbered title with subtitle and a bottom rule. */
export function ComposeCard({ n, title, hint, required, label, children, className }: { n: number; title: string; hint: string; required?: boolean; label: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={label} className={cn("mb-3.5 rounded-[9px] border border-border bg-card p-4", className)}>
      <div className="mb-3.5 flex items-start gap-2.5 border-b border-border pb-2.5">
        <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-primary text-caption font-bold text-primary-foreground">{n}</span>
        <div>
          <h3 className="m-0 text-sm leading-[1.2] font-bold">{title}{required && <> <span className="font-bold text-destructive" aria-hidden>*</span></>}</h3>
          <p className="mt-0.5 mb-0 text-xs leading-[1.7] text-subtle-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

/** Field of the incoming page: label (12.5/600 ink, mb 6) + control, 12px bottom margin unless `last`. */
export function CardField({ label, required, note, htmlFor, error, children, className, last }: { label: string; required?: boolean; note?: string; htmlFor?: string; error?: string; children: React.ReactNode; className?: string; last?: boolean }) {
  return (
    <div className={cn("min-w-0", !last && "mb-3", className)}>
      <Label htmlFor={htmlFor} className="mb-1.5">{label}{required && <> <span className="font-bold text-destructive" aria-hidden>*</span></>}{note && <em className="ml-1 text-label font-normal text-subtle-foreground not-italic">— {note}</em>}</Label>
      {children}
      {error && <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-1 mb-0 text-xs text-destructive">{error}</p>}
    </div>
  )
}
