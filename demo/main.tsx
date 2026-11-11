import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { UiProvider } from "@/lib/ui-config";
import { App } from "./App";
import "./demo.css";

// Hash routes keep the site working on any static host, including a sub-path. A data router is
// required by UnsavedChangesGuard (useBlocker).
const router = createHashRouter([{ path: "*", element: <App /> }]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiProvider locale="vi-VN">
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </UiProvider>
  </StrictMode>,
);
