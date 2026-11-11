"use client"

// @dthu/ui 0.2.0 · block-auth
import * as React from "react"
import { ArrowLeft, KeyRound, MailCheck, User } from "lucide-react"
import { AuthError, AuthField, AuthLayout, AuthLink, AuthSubmit, useCountdown, type AuthBrandProps } from "./parts"

export interface ForgotPasswordPageProps extends AuthBrandProps {
  /** Label of the field. Default "Tài khoản hoặc email". */
  identifierLabel?: string
  submitting?: boolean
  error?: string
  /** Show the "link sent" state. Leave undefined to let the page switch itself after `onSubmit` returns. */
  sent?: boolean
  /** Seconds before "Gửi lại" is enabled. Default 60. */
  resendAfter?: number
  /** Called with the trimmed account or email. May be async; a rejection keeps the form and shows nothing, so set `error` yourself. */
  onSubmit?: (identifier: string) => void | Promise<void>
  onResend?: (identifier: string) => void | Promise<void>
  onBack?: () => void
  /** "Không nhận được thư?" support link. */
  onSupport?: () => void
}

/**
 * Forgot-password screen: asks for the account or email, then confirms that a reset link was sent (with a resend cool-down).
 * The confirmation never says whether the account exists, so the page cannot be used to probe for accounts.
 */
export function ForgotPasswordPage({ identifierLabel = "Tài khoản hoặc email", submitting, error, sent, resendAfter = 60, onSubmit, onResend, onBack, onSupport, ...brand }: ForgotPasswordPageProps) {
  const [identifier, setIdentifier] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [localSent, setLocalSent] = React.useState(false)
  const [left, restart] = useCountdown(resendAfter, false)
  const done = sent ?? localSent
  const err = touched && !identifier.trim() ? "Vui lòng nhập tài khoản hoặc email" : undefined

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!identifier.trim()) return
    try {
      await onSubmit?.(identifier.trim())
      setLocalSent(true)
      restart(resendAfter)
    } catch { /* the caller reports the failure through `error` */ }
  }

  if (done) {
    return (
      <AuthLayout {...brand} icon={<MailCheck />} tone="success" title="Kiểm tra hộp thư" subtitle={<>Nếu <b className="font-semibold text-foreground">{identifier.trim() || "tài khoản"}</b> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Liên kết có hiệu lực trong thời gian ngắn.</>}>
        <div className="grid gap-3.5">
          <p className="m-0 text-body text-muted-foreground">Không thấy thư? Kiểm tra mục thư rác, hoặc gửi lại sau khi hết thời gian chờ.</p>
          <AuthSubmit type="button" variant="outline" disabled={left > 0 || submitting} onClick={async () => { await onResend?.(identifier.trim()); restart(resendAfter) }}>
            {left > 0 ? `Gửi lại sau ${left}s` : "Gửi lại liên kết"}
          </AuthSubmit>
          <div className="flex items-center justify-between gap-3">
            <AuthLink onClick={onBack} className="inline-flex items-center gap-1.5"><ArrowLeft aria-hidden className="size-4" />Quay lại đăng nhập</AuthLink>
            {onSupport && <AuthLink onClick={onSupport}>Cần hỗ trợ?</AuthLink>}
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout {...brand} icon={<KeyRound />} title="Quên mật khẩu" subtitle="Nhập tài khoản hoặc email, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.">
      <form noValidate onSubmit={submit} className="grid gap-[15px]">
        <AuthError>{error}</AuthError>
        <AuthField id="forgot-identifier" label={identifierLabel} icon={<User />} autoComplete="username" placeholder="Nhập tài khoản hoặc email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={err} />
        <AuthSubmit disabled={submitting}>{submitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}</AuthSubmit>
        <div className="text-center"><AuthLink onClick={onBack} className="inline-flex items-center gap-1.5"><ArrowLeft aria-hidden className="size-4" />Quay lại đăng nhập</AuthLink></div>
      </form>
    </AuthLayout>
  )
}
