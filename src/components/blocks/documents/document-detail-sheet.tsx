"use client"

// @dthu/ui 0.2.0 · block-documents
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { DocumentDetailViewer, type DocumentDetailViewerProps } from "./document-detail-viewer"

export interface DocumentDetailSheetProps extends DocumentDetailViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Right-hand sheet that opens the document viewer from a list row click. */
export function DocumentDetailSheet({ open, onOpenChange, ...viewer }: DocumentDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[94vw] gap-0 p-0 sm:max-w-5xl">
        <SheetTitle className="sr-only">{viewer.doc.title}</SheetTitle>
        <SheetDescription className="sr-only">Chi tiết văn bản, luồng ký duyệt và tệp đính kèm</SheetDescription>
        <div className="min-h-0 flex-1 pt-10"><DocumentDetailViewer {...viewer} /></div>
      </SheetContent>
    </Sheet>
  )
}
