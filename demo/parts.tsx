import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PageShell } from "@/components/app/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export const KIT_BASE_URL = __KIT_BASE_URL__;
export const itemUrl = (name: string) => `${KIT_BASE_URL}/r/${name}.json`;
export const addCommand = (names: string[]) => `npx shadcn@latest add ${names.map(itemUrl).join(" ")}`;

/** Shell command with a copy button. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Không sao chép được, hãy chọn và sao chép thủ công");
    }
  };
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-md border bg-secondary py-1 pr-1 pl-3", className)}>
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-meta whitespace-nowrap text-foreground [scrollbar-width:thin]">{command}</code>
      <Button size="icon-sm" variant="ghost" aria-label="Sao chép lệnh" onClick={() => void copy()}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

/** One showcase card: live preview on top, install command for the items it uses below. */
export function Example({ id, title, description, items, children, className }: {
  id?: string;
  title: string;
  description?: ReactNode;
  items: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card id={id} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4", className)}>{children}</div>
        <CommandLine command={addCommand(items)} />
      </CardContent>
    </Card>
  );
}

/** Page frame of the showcase: kit page head + vertical stack. */
export function DemoPage({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <PageShell title={title} description={description} actions={actions}>
      <div className="flex flex-col gap-4 pb-8">{children}</div>
    </PageShell>
  );
}
