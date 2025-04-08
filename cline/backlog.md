# Technical Debt Backlog

## Font Optimization (Quicksand) - 2025-04-07

*   **Issue:** The standard `next/font/google` approach (importing font, using CSS variable in layout and Tailwind config) failed to apply the 'Quicksand' font correctly to headings, despite multiple attempts and server restarts.
*   **Workaround:** Implemented a workaround using direct `<link>` tags in `src/app/layout.tsx` and a direct CSS rule (`.font-heading { font-family: 'Quicksand', sans-serif; }`) in `src/app/globals.css`.
*   **Debt:** Revisit this implementation to debug the `next/font` CSS variable issue and utilize Next.js's built-in font optimization features for better performance and maintainability.

## Deprecated Supabase Server Client Usage - 2025-04-08

*   **Issue:** The `createServerClient` function imported from `@supabase/ssr` in `src/lib/supabase/server.ts` is marked as deprecated by VSCode/TypeScript.
*   **Debt:** Investigate the recommended replacement function or approach provided by `@supabase/ssr` documentation and update the implementation in `src/lib/supabase/server.ts` accordingly to avoid using deprecated code and ensure future compatibility.
