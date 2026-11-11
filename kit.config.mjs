// What the RIS Kit takes from the RIS web app and how each source file becomes a registry item.
export default {
  name: "ris-kit",
  homepage: "https://github.com/<owner>/ris-kit",
  version: "1.0.0",

  // RIS web/src that `npm run sync` copies from. Override with RIS_SRC=<path>.
  source: "E:/RIS_Danh2/Research-Information-System/web/src",

  // Paths relative to `source`; a trailing slash copies the whole folder.
  include: [
    "styles/theme.css",
    "styles/app.css",
    "components/ui/",
    "components/blocks/",
    "lib/utils.ts",
    "lib/ui-config.tsx",
    "lib/use-breakpoint.ts",
    "lib/use-countdown.ts",
    "lib/use-media-query.ts",
    "lib/use-retained.ts",
    "lib/initials.ts",
    "lib/errorMessages.ts",
    "lib/forms.ts",
    "hooks/useDebouncedValue.ts",
    "components/app/choice-select.tsx",
    "components/app/ConfirmAction.tsx",
    "components/app/ErrorView.tsx",
    "components/app/FilterBar.tsx",
    "components/app/HintTooltip.tsx",
    "components/app/IsoDatePicker.tsx",
    "components/app/PageShell.tsx",
    "components/app/RowActions.tsx",
    "components/app/ServerDataTable.tsx",
    "components/app/SessionTakenOverDialog.tsx",
    "components/app/UnsavedChangesGuard.tsx",
  ],

  // Item names that do not follow the default file-name rule.
  names: {
    "styles/app.css": "app-css",
    "lib/errorMessages.ts": "error-messages",
    "hooks/useDebouncedValue.ts": "use-debounced-value",
  },

  // Version ranges for npm packages the kit imports (copied from RIS web/package.json).
  packages: {
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-table": "^9.3.1",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    cmdk: "^1.1.1",
    "date-fns": "^4.4.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.5.0",
    "lucide-react": "^1.61.0",
    "radix-ui": "^1.8.1",
    "react-day-picker": "^10.0.2",
    "react-hook-form": "^7.91.0",
    "react-router": "^7.1.0",
    recharts: "^3.10.1",
    sonner: "^2.0.8",
    "tailwind-merge": "^3.7.0",
    "tw-animate-css": "^1.4.0",
    vaul: "^1.1.2",
    zod: "^4.6.7",
  },

  // Provided by every React app; never listed as item dependencies.
  peer: ["react", "react-dom"],
};
