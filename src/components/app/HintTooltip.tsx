import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

/**
 * Gắn chú thích (tooltip) cho điều khiển có thể bị vô hiệu: nút disabled không nhận sự kiện chuột/bàn phím,
 * nên chú thích đặt trên vỏ bọc. `hint` rỗng thì trả nguyên nội dung, không bọc.
 */
export function HintTooltip({ hint, children }: { hint?: string | null; children: ReactNode }) {
  if (!hint) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex rounded-md outline-none focus-visible:shadow-focus">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
