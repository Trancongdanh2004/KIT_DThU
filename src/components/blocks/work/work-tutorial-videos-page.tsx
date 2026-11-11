import * as React from "react"
import { ArrowRight, Clock, Play, Search, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { includesText, useControllable } from "./work-shared"

export interface WorkVideoCategory { id: string; title: string; description: string; videoCount: number; duration: string; progress: number; icon: React.ReactNode; tone: "primary" | "info" | "success" | "warning" | "destructive" }
export interface WorkVideoResume { title: string; remaining: string; progress: number }

export interface WorkTutorialVideosPageProps {
  categories: WorkVideoCategory[]
  suggestions: string[]
  resume?: WorkVideoResume
  groupTitle?: string
  query?: string
  onQueryChange?: (v: string) => void
  onSuggestion?: (s: string) => void
  onOpenCategory?: (id: string) => void
  onResume?: () => void
  className?: string
}

/** Hue (`--h`) of each tone, as the reference tints every category card from one HSL hue. */
const toneHue: Record<WorkVideoCategory["tone"], number> = { primary: 210, info: 255, destructive: 285, success: 165, warning: 30 }
const hueStyle = (h: number, i?: number) => ({ "--h": h, "--i": i } as React.CSSProperties)
const ease = "ease-[cubic-bezier(0.2,0.75,0.2,1)]"

/** Tutorial gallery: search hero, continue-watching banner, category cards, and a player placeholder dialog. */
export function WorkTutorialVideosPage({ categories, suggestions, resume, groupTitle = "Dành cho bạn", query: queryProp, onQueryChange, onSuggestion, onOpenCategory, onResume, className }: WorkTutorialVideosPageProps) {
  const [playing, setPlaying] = React.useState(false)
  const [query, setQuery] = useControllable<string>(queryProp, "", onQueryChange)
  const [order, setOrder] = React.useState<"mine" | "name" | "count">("mine")
  const shown = React.useMemo(() => {
    const f = categories.filter((c) => includesText([c.title, c.description], query))
    if (order === "name") return [...f].sort((a, b) => a.title.localeCompare(b.title, "vi"))
    if (order === "count") return [...f].sort((a, b) => b.videoCount - a.videoCount)
    return f
  }, [categories, query, order])
  return (
    <div className={cn("h-full overflow-auto pt-1 pb-7", className)}>
      <section className="relative isolate mb-[18px] flex flex-col items-center overflow-hidden rounded-[20px] border border-[#dfe7f1] bg-[linear-gradient(#f0f7ff_0%,#f7f6fe_55%,#fff_100%)] px-5 pt-[38px] pb-[30px] text-center max-[640px]:px-3.5 max-[640px]:pt-7 max-[640px]:pb-[22px] dark:border-border dark:bg-none dark:bg-card">
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
          <i className="absolute top-[-90px] left-[4%] size-[260px] rounded-full bg-[#88c2fc] opacity-55 blur-[46px]" />
          <i className="absolute top-[-110px] right-[2%] size-[300px] rounded-full bg-[#deaaf8] opacity-55 blur-[46px]" />
          <i className="absolute bottom-[-120px] left-[42%] size-[200px] rounded-full bg-[#9df1dc] opacity-55 blur-[46px]" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6d9f5] bg-white/80 px-[13px] py-[5px] text-label font-bold tracking-[0.08em] text-[#343eb2] uppercase backdrop-blur-[6px] [&>svg]:size-3.5 dark:border-border dark:bg-card dark:text-primary"><Sparkles /> Video hướng dẫn</span>
        <h2 className="mt-3.5 mb-5 bg-[linear-gradient(100deg,#14213d_20%,#313dc4_100%)] bg-clip-text text-[32px] leading-[1.15] font-extrabold tracking-[-0.025em] text-transparent max-[640px]:text-[25px] dark:bg-none dark:text-foreground">Bạn muốn làm gì hôm nay?</h2>
        <div className="w-full max-w-[640px]">
          <div className="relative flex h-[52px] min-w-[180px] flex-1 items-center gap-[9px] rounded-[14px] border border-[#d1dae6] bg-white px-[18px] text-lead shadow-[0_8px_24px_-12px_rgba(30,50,110,.35)] transition-[box-shadow,border-color,transform] duration-200 focus-within:-translate-y-px focus-within:border-[#5a66e2] focus-within:shadow-[0_0_0_4px_rgba(110,121,247,.18),0_12px_28px_-12px_rgba(30,50,140,.45)] motion-reduce:transition-none dark:border-border dark:bg-background">
            <Search aria-hidden className="size-4 flex-none text-subtle-foreground" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: soạn văn bản đi, ký số, giao việc…" aria-label="Tìm video hướng dẫn" className="h-auto min-w-[60px] flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none placeholder:text-subtle-foreground" />
          </div>
        </div>
        <div role="group" aria-label="Gợi ý" className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-small text-subtle-foreground">Thử:</span>
          {suggestions.map((s) => <button key={s} type="button" onClick={() => { setQuery(s); onSuggestion?.(s) }} className="h-[30px] cursor-pointer rounded-full border border-[#d4d6ed] bg-white/75 px-[13px] text-small font-medium text-[#333b99] outline-none transition-[background,border-color,transform,color] duration-150 hover:-translate-y-0.5 hover:border-[#3544e9] hover:bg-[#3544e9] hover:text-white focus-visible:shadow-focus motion-reduce:transition-none dark:border-border dark:bg-card dark:text-primary">{s}</button>)}
        </div>
      </section>
      {resume && (
        <button type="button" onClick={() => { setPlaying(true); onResume?.() }} style={hueStyle(210)} className={cn("relative flex w-full cursor-pointer items-center justify-between gap-6 overflow-hidden rounded-2xl border-0 bg-[linear-gradient(115deg,hsl(var(--h)_62%_30%)_0%,hsl(calc(var(--h)+35)_58%_22%)_100%)] px-[26px] py-[22px] text-left text-white shadow-[0_10px_28px_-12px_hsl(var(--h)_70%_25%/.6)] outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-12px_hsl(var(--h)_70%_25%/.7)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--h)_90%_75%)] motion-reduce:transition-none max-[720px]:flex-col-reverse max-[720px]:items-stretch max-[720px]:p-[18px] group/bn", ease)}>
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#fff_1.2px,transparent_1.4px)] bg-[length:22px_22px] opacity-[.14] [mask-image:linear-gradient(90deg,#000_0%,transparent_70%)]" />
          <span className="relative flex min-w-0 flex-col items-start gap-1.5">
            <span className="rounded-full bg-white/16 px-2.5 py-[3px] text-caption font-bold tracking-[0.1em] uppercase">Tiếp tục xem</span>
            <span className="text-heading leading-[1.25] font-bold tracking-[-0.01em]">{resume.title}</span>
            <span className="text-body opacity-80">Bắt đầu · còn {resume.remaining}</span>
            <span role="progressbar" aria-valuenow={resume.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ xem" title={`Đã xem ${resume.progress}%`} className="mt-1 block h-[5px] w-[220px] max-w-full overflow-hidden rounded-full bg-white/22"><i className="block h-full rounded-full bg-white" style={{ width: `${resume.progress}%` }} /></span>
            <span className="mt-2.5 inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-white px-[18px] text-control font-bold text-[hsl(var(--h)_60%_24%)] transition-transform duration-150 group-hover/bn:translate-x-[3px] [&>svg]:size-4 [&>svg]:fill-current"><Play /> Xem tiếp</span>
          </span>
          <span aria-hidden className="relative aspect-video w-[250px] flex-none overflow-hidden rounded-xl bg-[repeating-linear-gradient(135deg,#ffffff0f_0_12px,transparent_12px_24px),linear-gradient(135deg,hsl(var(--h)_70%_45%),hsl(calc(var(--h)+40)_65%_30%))] shadow-[0_0_0_1px_rgba(255,255,255,.18),0_10px_24px_-8px_rgba(0,0,0,.5)] max-[720px]:w-full">
            <span className="absolute top-1/2 left-1/2 -mt-[23px] -ml-[23px] grid size-[46px] place-items-center rounded-full bg-white text-[hsl(var(--h)_60%_28%)] [&>svg]:size-5 [&>svg]:fill-current"><Play /></span>
          </span>
        </button>
      )}
      <div className="mt-[26px] mb-3.5 flex items-center justify-between gap-3">
        <h2 className="m-0 text-title font-bold text-foreground">{groupTitle}</h2>
        <label className="flex items-center gap-2 text-small text-subtle-foreground">
          <span>Xem theo</span>
          <Select value={order} onValueChange={(v) => setOrder(v as typeof order)}>
            <SelectTrigger aria-label="Xem video theo nhóm người dùng" className="h-8 w-auto gap-2 text-small"><SelectValue /></SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="mine">Dành cho tôi</SelectItem><SelectItem value="name">Tên A–Z</SelectItem><SelectItem value="count">Nhiều video nhất</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      {shown.length === 0 && <EmptyState title="Không tìm thấy video" description="Thử một từ khóa khác hoặc chọn gợi ý phía trên." />}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {shown.map((c, i) => (
          <button key={c.id} type="button" onClick={() => onOpenCategory?.(c.id)} style={hueStyle(toneHue[c.tone], i)} className={cn("group/cd relative flex min-h-[196px] flex-col gap-1.5 overflow-hidden rounded-[14px] border border-border bg-card px-[18px] pt-[18px] pb-3.5 text-left text-inherit no-underline outline-none transition-[transform,box-shadow,border-color] duration-[220ms] before:pointer-events-none before:absolute before:-top-10 before:-right-10 before:size-[130px] before:rounded-full before:bg-[radial-gradient(circle,hsl(var(--h)_85%_95%)_0%,transparent_70%)] before:opacity-90 before:transition-transform before:duration-[400ms] before:content-[''] hover:-translate-y-1 hover:border-[hsl(var(--h)_55%_82%)] hover:shadow-[0_14px_30px_-10px_hsl(var(--h)_60%_40%/.35),0_2px_6px_#2323380f] hover:before:scale-[1.35] focus-visible:shadow-focus motion-reduce:transition-none motion-reduce:hover:transform-none dark:before:opacity-20", ease)}>
            <span aria-hidden className="absolute top-0 left-0 h-[3px] w-[34%] rounded-r-[3px] bg-[hsl(var(--h)_68%_48%)] transition-[width] duration-[350ms] group-hover/cd:w-full group-focus-visible/cd:w-full" />
            <span className="relative flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(145deg,hsl(var(--h)_85%_95%),hsl(var(--h)_80%_90%))] text-[hsl(var(--h)_60%_34%)] shadow-[inset_0_0_0_1px_hsl(var(--h)_55%_82%)] transition-transform duration-[280ms] group-hover/cd:-rotate-[8deg] group-hover/cd:scale-[1.08] motion-reduce:transition-none dark:bg-none dark:bg-accent dark:text-primary [&>svg]:size-5">{c.icon}</span>
              <span className="rounded-full bg-[hsl(var(--h)_85%_95%)] px-2.5 py-[3px] text-label font-bold text-[hsl(var(--h)_60%_34%)] dark:bg-accent dark:text-primary">{c.videoCount} video</span>
            </span>
            <span className="relative mt-2 block text-lead leading-[1.3] font-bold text-foreground">{c.title}</span>
            <span className="relative line-clamp-2 text-small leading-normal text-muted-foreground">{c.description}</span>
            <span className="relative mt-auto flex items-center justify-between pt-2.5 text-xs text-subtle-foreground">
              <span className="inline-flex items-center gap-[5px]"><Clock className="size-3.5" aria-hidden />{c.duration}</span>
              <span className="inline-flex -translate-x-1.5 items-center gap-1 font-bold text-[hsl(var(--h)_60%_34%)] opacity-0 transition-[opacity,transform] duration-200 group-hover/cd:translate-x-0 group-hover/cd:opacity-100 group-focus-visible/cd:translate-x-0 group-focus-visible/cd:opacity-100 dark:text-primary">Xem <ArrowRight className="size-3.5" aria-hidden /></span>
            </span>
            <span role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${c.title}`} title={`Đã xem ${c.progress}%`} className="relative mt-0.5 block h-1 overflow-hidden rounded-full bg-[hsl(var(--h)_30%_94%)] dark:bg-muted"><i className="block h-full rounded-full bg-[hsl(var(--h)_68%_48%)]" style={{ width: `${c.progress}%` }} /></span>
          </button>
        ))}
      </div>
      <Dialog open={playing} onOpenChange={setPlaying}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>{resume?.title ?? "Video hướng dẫn"}</DialogTitle>
          <DialogDescription className="sr-only">Trình phát video</DialogDescription>
          <div className="grid aspect-video place-items-center rounded-lg bg-primary text-primary-foreground"><Play className="size-12" aria-hidden /><span className="sr-only">Khung phát video</span></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
