"use client"

// @dthu/ui 0.2.0 · block-system
import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface LegalSection { id: string; title: string; body: React.ReactNode }

export interface LegalPageProps {
  /** "Điều khoản sử dụng", "Chính sách bảo mật"... */
  title: string
  /** Display text such as "Có hiệu lực từ 01/10/2026". */
  effective?: string
  version?: string
  /** Short intro under the title. */
  intro?: React.ReactNode
  sections: LegalSection[]
  /** Brand block at the top of the page. */
  brand?: React.ReactNode
  onBack?: () => void
  /** Consent mode: shows "Tôi đã đọc và đồng ý" and calls this when pressed. */
  onAccept?: () => void
  /** Label of the consent button. */
  acceptLabel?: string
  className?: string
}

/** Terms / privacy / policy page: sticky table of contents (anchors), numbered sections, and an optional consent footer. */
export function LegalPage({ title, effective, version, intro, sections, brand, onBack, onAccept, acceptLabel = "Tôi đã đọc và đồng ý", className }: LegalPageProps) {
  const [agree, setAgree] = React.useState(false)
  return (
    <div data-slot="legal-page" className={className ?? "h-full min-h-0 w-full overflow-y-auto bg-background text-foreground"}>
      <div className="mx-auto grid max-w-[1040px] grid-cols-[220px_minmax(0,1fr)] gap-x-12 px-6 py-8 max-md:grid-cols-1 max-sm:px-4">
        <header className="col-span-full mb-6 border-b border-border pb-5">
          {brand && <div className="mb-4">{brand}</div>}
          {onBack && <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={onBack}><ArrowLeft />Quay lại</Button>}
          <h1 className="m-0 text-[28px] font-bold tracking-[-0.01em]">{title}</h1>
          {(effective || version) && <p className="m-0 mt-1 text-small text-muted-foreground">{[effective, version && `Phiên bản ${version}`].filter(Boolean).join(" · ")}</p>}
          {intro && <p className="m-0 mt-3 max-w-[68ch] text-body text-muted-foreground">{intro}</p>}
        </header>
        <nav aria-label="Mục lục" className="sticky top-4 self-start max-md:hidden">
          <ol className="m-0 grid list-none gap-0.5 border-l border-border p-0">
            {sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-small text-muted-foreground no-underline outline-none hover:border-primary hover:text-foreground focus-visible:shadow-focus">{i + 1}. {s.title}</a></li>)}
          </ol>
        </nav>
        <article className="min-w-0">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mb-8 scroll-mt-4">
              <h2 id={`${s.id}-h`} className="m-0 mb-2 text-xl font-bold">{i + 1}. {s.title}</h2>
              <div className="grid max-w-[72ch] gap-3 text-body leading-relaxed text-foreground [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5">{s.body}</div>
            </section>
          ))}
          {onAccept && (
            <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-1 py-4">
              <label className="m-0 flex cursor-pointer items-center gap-2 text-body"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="m-0 size-4 accent-primary" />{acceptLabel}</label>
              <Button disabled={!agree} onClick={onAccept}>Tiếp tục</Button>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
