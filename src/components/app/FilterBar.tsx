import { Children, Fragment, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";

export interface FilterBarItem {
  id: string;
  /** Nhãn hiện trong drawer "Bộ lọc nâng cao". */
  label: string;
  node: ReactNode;
  /** Bộ lọc đang áp dụng (tính vào số trên nút "Bộ lọc"). */
  active?: boolean;
  /** Control đã tự có nhãn (vd SelectTrigger label) thì không in nhãn lặp trong drawer. */
  selfLabelled?: boolean;
  /** Đứng trước ô tìm kiếm khi còn trên thanh (vd nhóm chọn hàng đợi). */
  lead?: boolean;
}

interface FilterBarProps {
  className?: string;
  /** Ô tìm kiếm — luôn hiện, co giãn. */
  search?: ReactNode;
  /** Bộ lọc theo thứ tự ưu tiên: thiếu chỗ thì bộ lọc cuối vào drawer trước. */
  filters?: FilterBarItem[];
  /** Nút hành động bên phải — luôn hiện. */
  actions?: ReactNode;
  onReset?: () => void;
  /** Cách viết cũ: tự sắp con bên trong (không tự đẩy vào drawer). */
  children?: ReactNode;
}

const GAP = 8;
const SEARCH_MIN = 220;
const MOBILE = 576;

/**
 * Thanh lọc của màn danh sách: luôn một hàng, sát mép trên vùng nội dung.
 * Bộ lọc không vừa chỗ chuyển vào drawer "Bộ lọc nâng cao"; đủ chỗ thì tự quay lại.
 */
export function FilterBar({ className, search, filters, actions, onReset, children }: FilterBarProps) {
  const frame = "-mx-3 -mt-2.5 border-b bg-card px-3 py-2.5 max-[576px]:-mx-1.5 max-[576px]:px-1.5";

  if (!filters) {
    return <div className={cn(frame, "flex flex-wrap items-center gap-2", className)}>{children}</div>;
  }

  return <ResponsiveFilterRow frame={cn(frame, className)} search={search} filters={filters} actions={actions} onReset={onReset} />;
}

/** Hàng lọc tự co: dùng chung cho FilterBar và AdminFilterBar của kit. */
export function ResponsiveFilterRow({ frame, search, filters, actions, onReset }: { frame: string; search?: ReactNode; filters: FilterBarItem[]; actions?: ReactNode; onReset?: () => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [inlineCount, setInlineCount] = useState(filters.length);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const recompute = () => {
      const style = getComputedStyle(row);
      const width = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (window.innerWidth < 640) {
        setInlineCount(filters.length);
        return;
      }
      const itemWidths = Array.from(measureRef.current?.children ?? []).map((el) => (el as HTMLElement).offsetWidth);
      const actionsWidth = actionsRef.current?.offsetWidth ?? 0;
      const triggerWidth = triggerRef.current?.offsetWidth ?? 110;
      const fixed = (search ? SEARCH_MIN + GAP : 0) + (actionsWidth ? actionsWidth + GAP : 0);
      const fits = (count: number, withTrigger: boolean) => {
        const used = itemWidths.slice(0, count).reduce((sum, w) => sum + w + GAP, 0);
        return fixed + used + (withTrigger ? triggerWidth + GAP : 0) <= width;
      };
      if (fits(itemWidths.length, false)) {
        setInlineCount(itemWidths.length);
        return;
      }
      let count = itemWidths.length - 1;
      while (count > 0 && !fits(count, true)) count--;
      setInlineCount(count);
    };
    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(row);
    if (actionsRef.current) observer.observe(actionsRef.current);
    return () => observer.disconnect();
  }, [filters.length, search]);

  const inline = filters.slice(0, inlineCount);
  const hidden = filters.slice(inlineCount);
  const hiddenActive = hidden.filter((f) => f.active).length;

  // Put lead items (menu/category) first for the horizontal scroller
  const orderedFilters = [...filters].sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0));

  return (
    <div ref={rowRef} className={cn(frame, "relative overflow-hidden")}>
      {/* Mobile layout (< 640px): menus/filters become a smooth horizontal scroller */}
      <div className="flex flex-col gap-2 sm:hidden w-full">
        {filters.length > 0 && (
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5 pr-8">
            {orderedFilters.map((f) => (
              <div key={f.id} className="shrink-0 max-w-[calc(100vw-2.5rem)]">
                {f.node}
              </div>
            ))}
          </div>
        )}
        {(search || actions) && (
          <div className="flex w-full min-w-0 flex-col gap-2">
            {search && (
              <div className="w-full min-w-0 [&>*]:w-full! [&>*]:max-w-none!">
                {search}
              </div>
            )}
            {actions && (
              <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop layout (>= 640px): one flexible row as before */}
      <div className="hidden sm:flex sm:w-full sm:flex-nowrap sm:items-center sm:gap-2 sm:overflow-hidden">
        {search && <div className="min-w-0 max-w-[420px] flex-[1_1_220px] [&>*]:w-full! [&>*]:max-w-none!">{search}</div>}
        {inline.map((f) => (
          <div key={f.id} className={cn("shrink-0", f.lead && "order-first")}>{f.node}</div>
        ))}
        {hidden.length > 0 && (
          <div ref={triggerRef} className="shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" aria-label={hiddenActive ? `Bộ lọc nâng cao, ${hiddenActive} đang áp dụng` : "Bộ lọc nâng cao"}>
                  <ListFilter />
                  Bộ lọc
                  {hiddenActive > 0 && <Badge className="ml-0.5 h-5 min-w-5 px-1.5">{hiddenActive}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-[400px]">
                <SheetHeader>
                  <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                  <SheetDescription>Các bộ lọc không vừa trên thanh lọc.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4">
                  {hidden.map((f) => (
                    <div key={f.id} className="flex flex-col gap-1.5">
                      {!f.selfLabelled && <span className="text-label font-medium text-muted-foreground">{f.label}</span>}
                      <div className="[&>*]:w-full! [&>*]:max-w-none!">{f.node}</div>
                    </div>
                  ))}
                </div>
                {onReset && (
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={onReset}>Xoá bộ lọc</Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        )}
        <div ref={actionsRef} className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
      </div>

      {/* Measuring layer: renders the filters off-screen to get their real width on desktop */}
      <div ref={measureRef} aria-hidden inert className="pointer-events-none invisible absolute left-0 top-0 max-sm:hidden flex flex-nowrap gap-2 overflow-hidden w-0 h-0 max-w-0 max-h-0">
        {filters.map((f) => (
          <div key={f.id} className="shrink-0">{f.node}</div>
        ))}
      </div>
    </div>
  );
}

function flattenNodes(node: ReactNode, prefix = ""): { id: string; el: ReactElement }[] {
  return Children.toArray(node).flatMap((child, i) => {
    if (!isValidElement(child)) return [];
    const id = `${prefix}${String(child.key ?? i)}`;
    if (child.type === Fragment) return flattenNodes((child.props as { children?: ReactNode }).children, `${id}/`);
    return [{ id, el: child }];
  });
}

/**
 * Chuyển các bộ lọc viết dạng JSX (block kit) thành mục của thanh lọc tự co.
 * `needsLabel`: control không tự hiện nhãn (vd nhóm nút) thì in nhãn trong drawer.
 */
export function toFilterItems(node: ReactNode, needsLabel?: (el: ReactElement) => boolean): FilterBarItem[] {
  return flattenNodes(node).map(({ id, el }) => {
    const props = el.props as { label?: unknown; value?: unknown; pressed?: unknown; className?: unknown };
    const labelled = needsLabel?.(el) ?? false;
    const label = typeof props.label === "string" ? props.label : "Bộ lọc";
    const active = props.pressed === true || (!labelled && typeof props.value === "string" && props.value !== "" && props.value !== "all");
    const lead = typeof props.className === "string" && props.className.includes("order-first");
    return { id, label, node: el, active, selfLabelled: !labelled, lead };
  });
}
