import { useEffect } from "react";
import { useBlocker } from "react-router";
import { ConfirmDialog } from "~/components/ui/alert-dialog";

/**
 * Hỏi lại khi rời trang (đổi route hoặc đóng tab) lúc còn thay đổi chưa lưu.
 * `isDirty` được gọi tại thời điểm rời đi nên luôn đọc trạng thái mới nhất, không cần render lại.
 */
export function UnsavedChangesGuard({ isDirty }: { isDirty: () => boolean }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && isDirty());

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(open) => {
        if (!open && blocker.state === "blocked") blocker.reset();
      }}
      title="Rời trang?"
      description="Thay đổi chưa lưu sẽ mất."
      confirmLabel="Rời trang"
      cancelLabel="Ở lại"
      variant="destructive"
      onConfirm={() => {
        if (blocker.state === "blocked") blocker.proceed();
      }}
    />
  );
}
