import * as React from "react"
import { Timer } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useCountdown } from "@/lib/use-countdown"

export interface SessionTimeoutDialogProps {
  open: boolean
  /** Seconds shown to the user before automatic sign-out. Default 60. */
  warnSeconds?: number
  /** Keep working: the app refreshes the token and closes the dialog. */
  onExtend: () => void
  /** Sign out now. */
  onSignOut: () => void
  /** Called once when the countdown reaches 0 (the app should sign out and show `SignedOutPage reason="idle"`). */
  onTimeout?: () => void
}

function Countdown({ seconds, onTimeout }: { seconds: number; onTimeout?: () => void }) {
  const [left] = useCountdown(seconds)
  const fired = React.useRef(false)
  React.useEffect(() => { if (left === 0 && !fired.current) { fired.current = true; onTimeout?.() } }, [left, onTimeout])
  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, "0")
  return (
    <>
      <p className="m-0 text-center text-[40px] leading-none font-extrabold text-primary tabular-nums" aria-hidden>{mm}:{ss}</p>
      {/* announced at the start and every 10 s, not every second */}
      <p role="timer" aria-live="off" className="sr-only">Còn {left} giây</p>
      <p aria-live="polite" className="sr-only">{left > 0 && left % 10 === 0 ? `Còn ${left} giây trước khi đăng xuất` : ""}</p>
    </>
  )
}

/** "Phiên sắp hết hạn" warning with a live countdown and Keep-working / Sign-out buttons. The countdown restarts every time the dialog opens. */
export function SessionTimeoutDialog({ open, warnSeconds = 60, onExtend, onSignOut, onTimeout }: SessionTimeoutDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Timer aria-hidden className="size-5 text-warning" />Phiên làm việc sắp hết hạn</AlertDialogTitle>
          <AlertDialogDescription>Bạn sẽ bị đăng xuất tự động do không hoạt động. Chọn "Tiếp tục làm việc" để giữ phiên.</AlertDialogDescription>
        </AlertDialogHeader>
        {open && <div className="grid gap-1 py-2"><Countdown seconds={warnSeconds} onTimeout={onTimeout} /></div>}
        <AlertDialogFooter>
          <Button variant="outline" onClick={onSignOut}>Đăng xuất</Button>
          <Button autoFocus onClick={onExtend}>Tiếp tục làm việc</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
