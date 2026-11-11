import * as React from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import styles from "./Header.module.css"

export interface LanguageMenuProps {
  onOpen?: () => void
}

export const LanguageMenu = ({ onOpen }: LanguageMenuProps) => {
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div className={styles.langWrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.langBtn} ${open ? styles.langBtnOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Chọn ngôn ngữ"
        onClick={() => {
          if (!open) onOpen?.()
          setOpen((value) => !value)
        }}
      >
        <Globe className={styles.langGlobe} strokeWidth={1.7} aria-hidden="true" />
        <span>VI</span>
        <ChevronDown className={styles.langChev} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.langMenu} role="listbox" aria-label="Ngôn ngữ">
          <button
            type="button"
            role="option"
            aria-selected="true"
            className={`${styles.langOption} ${styles.langOptionActive}`}
            onClick={() => setOpen(false)}
          >
            <Check className={styles.langCheck} strokeWidth={2.2} aria-hidden="true" />
            <span className={styles.langLabel}>Tiếng Việt</span>
            <span className={styles.langCode}>VI</span>
          </button>
          <button
            type="button"
            role="option"
            aria-selected="false"
            className={styles.langOption}
            disabled
            title="Bản tiếng Anh đang được cập nhật"
          >
            <span className={styles.langSpacer} aria-hidden="true" />
            <span className={styles.langLabel}>English</span>
            <span className={styles.langBadge}>Sắp có</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default LanguageMenu

