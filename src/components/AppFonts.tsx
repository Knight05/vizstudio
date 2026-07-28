/**
 * Typography for the authenticated app shell (dashboard, login, admin) — the
 * fonts `globals.css` refers to via `--mono` / `--sans`.
 *
 * This deliberately does NOT live in the root layout. The marketing pages
 * (home, pricing, charts, docs...) render their own Google Fonts set, so a
 * root-level link made every one of them download a second render-blocking
 * stylesheet plus woff2 files they never painted with — roughly a second of
 * mobile FCP for nothing. Render it from the app-shell routes instead.
 *
 * React hoists these into <head>.
 */
export function AppFonts() {
  return (
    <>
      <link
        rel="stylesheet"
        href="/assets/fonts/app.css"
      />
    </>
  );
}

export default AppFonts;
