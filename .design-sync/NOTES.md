# FlowTrack UI — Design Sync Notes

## Setup facts

- **Shape**: package (no Storybook). Synth-entry mode — no published dist; converter synthesizes from `src/app/components/ui/`.
- **Components**: shadcn/ui components styled with a custom dark theme (indigo/violet palette). Source in `src/app/components/ui/`.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin). Theme tokens in `src/styles/theme.css` (CSS custom properties). Compiled by `npm run build` (Vite) into `dist/assets/index-*.css`, then copied to the stable path `dist/assets/ds-styles.css`.
- **Fonts**: Onest, DM Sans, JetBrains Mono — loaded at runtime via Google Fonts URL in `src/styles/fonts.css`. No font files shipped. `[FONT_REMOTE]` on validate is expected.
- **CSS hash**: `dist/assets/index-*.css` has a content-hash filename that changes on each Vite build. The `buildCmd` copies the latest to `dist/assets/ds-styles.css` (stable path for `cssEntry`).
- **No `@/` path aliases** in the UI components — all relative imports. No tsconfig.json in repo.

## Re-sync risks

- `dist/assets/ds-styles.css` must be refreshed after any component style changes: run `npm run build && cp $(ls dist/assets/index-*.css | head -1) dist/assets/ds-styles.css` before re-syncing.
- The compiled CSS only includes Tailwind utility classes that appear in the source files. If new design patterns introduce new utility class combinations, a rebuild is required.
- Compound components (Dialog, DropdownMenu, Sheet, etc.) each export many sub-components — these are all individually bundled. If sub-component APIs change, re-sync will catch them.
- `chart.tsx` depends on `recharts` — a large peer dependency. If recharts is updated, previews may need re-grading.
- `sidebar.tsx` is a complex compound component with many exports; its preview is a floor card (not in the authored 20).
