import * as React from "react"

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href = "#", children, ...props }, ref) => {
    return (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    )
  }
)
Link.displayName = "Link"

export function Image({
  src,
  alt = "",
  width,
  height,
  className,
  priority: _priority,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean
  width?: number | string
  height?: number | string
}) {
  const [error, setError] = React.useState(false)

  if (error) {
    return (
      <svg
        width={width ?? 30}
        height={height ?? 30}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}

export function usePathname(): string {
  const [pathname, setPathname] = React.useState("/")
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])
  return pathname
}

