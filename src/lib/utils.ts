import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/* Z-index layers (`z-chrome` … `z-tooltip`) are declared in theme.css; font-size tokens too.
 * Font-size tokens declared in packages/tokens/src/theme.css (`--text-*`). Registered so twMerge
 * treats `text-body` as a size (not a colour) and keeps `text-foreground` alongside it. Focus shadows (`shadow-focus*`)
 * are registered as shadows so `focus-visible:shadow-none` can override them. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      z: [{ z: ["chrome", "chrome-top", "fixed", "overlay", "tooltip"] }],
      shadow: [{ shadow: ["focus", "focus-soft", "focus-soft-danger"] }],
      "font-size": [{ text: ["micro", "tiny", "caption", "label", "meta", "small", "body", "control", "base", "emph", "lead", "title", "heading", "display"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
