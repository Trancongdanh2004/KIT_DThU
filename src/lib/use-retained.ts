import * as React from "react"

/**
 * Keeps showing the last value seen while `active`, so an overlay keeps its content during its exit animation.
 * Overlays are often driven by `open={!!item}`; clearing `item` on close would empty the dialog at once and it would look
 * like it closed instantly. `useRetained(item)` keeps the last non-empty item; `useRetained(value, open)` freezes any prop
 * while the overlay is closed. Pass a value that keeps its identity between renders (a prop or state, not an inline object).
 */
export function useRetained<T>(value: T, active: boolean = value != null): T {
  const [kept, setKept] = React.useState(value)
  if (active && !Object.is(kept, value)) setKept(value)
  return active ? value : kept
}
