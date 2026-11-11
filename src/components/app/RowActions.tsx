import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export interface RowActionConfirm {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void | Promise<unknown>;
}

export interface RowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  to?: string;
  confirm?: RowActionConfirm;
  destructive?: boolean;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}

const MAX_INLINE = 2;

export function RowActions({ label, actions, className }: { label: string; actions: (RowAction | false | null | undefined)[]; className?: string }) {
  const items = actions.filter(Boolean) as RowAction[];
  const [confirming, setConfirming] = useState<RowAction | null>(null);
  if (items.length === 0) return null;

  const run = (a: RowAction) => {
    if (a.confirm) setConfirming(a);
    else a.onSelect?.();
  };

  const dialog = (
    <ConfirmDialog
      open={confirming !== null}
      onOpenChange={(open) => !open && setConfirming(null)}
      title={confirming?.confirm?.title}
      description={confirming?.confirm?.description}
      confirmLabel={confirming?.confirm?.confirmLabel ?? confirming?.label}
      variant={confirming?.destructive ? "destructive" : "default"}
      onConfirm={() => confirming?.confirm?.onConfirm()}
    />
  );

// Table rows are generally clickable: prevent clicks within the action column from triggering the opening of row details.
  const stop = { onClick: (e: React.MouseEvent) => e.stopPropagation(), onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation() };

  if (items.length <= MAX_INLINE) {
    return (
      <div className={cn("flex items-center justify-end gap-1", className)} {...stop}>
        {items.map((a) => {
          const look = cn(a.destructive && a.variant !== "default" && "text-destructive hover:text-destructive");
          return a.to ? (
            <Button key={a.key} asChild size="sm" variant={a.variant ?? "ghost"} className={look}>
              <Link to={a.to}>
                {a.icon}
                {a.label}
              </Link>
            </Button>
          ) : (
            <Button key={a.key} type="button" size="sm" variant={a.variant ?? "ghost"} className={look} disabled={a.disabled} onClick={() => run(a)}>
              {a.icon}
              {a.label}
            </Button>
          );
        })}
        {dialog}
      </div>
    );
  }

  return (
    <div className={cn("flex justify-end", className)} {...stop}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label={`Thao tác với ${label}`} title="Thao tác">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((a) =>
            a.to ? (
              <DropdownMenuItem key={a.key} asChild disabled={a.disabled}>
                <Link to={a.to}>
                  {a.icon}
                  {a.label}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={a.key} variant={a.destructive ? "destructive" : "default"} disabled={a.disabled} onSelect={() => run(a)}>
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </div>
  );
}
