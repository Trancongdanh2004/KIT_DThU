import { Check, Circle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type SignatureStepState = "done" | "current" | "pending" | "rejected"

export interface SignatureStep { id: string; label: string; actor: string; state: SignatureStepState; at?: string }

const stateStyle: Record<SignatureStepState, string> = {
  done: "bg-success text-primary-foreground",
  current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  pending: "bg-muted text-muted-foreground",
  rejected: "bg-destructive text-primary-foreground",
}

/** Horizontal stepper for the signing/approval chain of a document. */
export function SignatureFlowStepper({ steps, className }: { steps: SignatureStep[]; className?: string }) {
  return (
    <ol aria-label="Luồng ký duyệt" className={cn("flex items-start gap-0 overflow-x-auto pb-1", className)}>
      {steps.map((s, i) => (
        <li key={s.id} aria-current={s.state === "current" ? "step" : undefined} className="relative flex min-w-24 flex-1 flex-col items-center gap-1 text-center">
          {i > 0 && <span aria-hidden className={cn("absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2", steps[i - 1]!.state === "done" ? "bg-success" : "bg-border")} />}
          <span className={cn("relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-bold", stateStyle[s.state])}>
            {s.state === "done" ? <Check className="size-4" /> : s.state === "rejected" ? <X className="size-4" /> : s.state === "current" ? <Circle className="size-2.5 fill-current" /> : i + 1}
          </span>
          <span className="text-sm font-semibold">{s.label}</span>
          <span className="text-xs text-muted-foreground">{s.actor}</span>
          {s.at && <span className="text-caption text-muted-foreground">{s.at}</span>}
        </li>
      ))}
    </ol>
  )
}
