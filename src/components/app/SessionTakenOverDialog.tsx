import { LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface Props {
  /** Account that signed in from another tab of this browser; null hides the dialog. */
  account: { fullName: string; email: string | null } | null;
  /** Leaves this tab only; the other account's session is kept (see AuthProvider.signOut). */
  onSignOut: () => Promise<void>;
}

/** Blocks the tab until the user reloads or signs out: the shared cookie now belongs to another account. */
export function SessionTakenOverDialog({ account, onSignOut }: Props) {
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await onSignOut();
  };

  return (
    // No onOpenChange: Escape and outside clicks must not dismiss it.
    <AlertDialog open={account !== null}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Đã có tài khoản khác đăng nhập</AlertDialogTitle>
          <AlertDialogDescription>
            Hiện đã có tài khoản <strong>{account?.fullName}</strong>
            {account?.email ? ` (${account.email})` : ""} đăng nhập vào hệ thống trên trình duyệt này. Vui lòng nhấn F5 để
            tải lại trang theo tài khoản mới, hoặc đăng xuất tài khoản hiện tại khỏi tab này (tài khoản{" "}
            {account?.fullName} vẫn giữ đăng nhập ở tab khác).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={signingOut} onClick={() => void signOut()}>
            <LogOut /> Đăng xuất
          </Button>
          <Button disabled={signingOut} onClick={() => window.location.reload()}>
            <RefreshCw /> Tải lại trang (F5)
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
