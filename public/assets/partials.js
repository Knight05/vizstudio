// vizstudio — shared nav + footer partials
// Mount points expected: <div id="site-nav"></div>  and  <div id="site-footer"></div>
// Edit the templates below to change the nav/footer everywhere on the site.

// ── Preview password gate — remove before public launch ──────────────────
(function () {
  var PW = 'viz37', K = 'vz_gate_ok';
  try { if (localStorage.getItem(K) === '1') return; } catch (e) { return; }
  var p = prompt('This site is private. Enter password to view:');
  while (p !== null && p !== PW) { p = prompt('Incorrect password. Try again:'); }
  if (p === PW) { try { localStorage.setItem(K, '1'); } catch (e) {} return; }
  document.write('<body style="margin:0;background:#0b0c14;color:#e7e7f0;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h1 style="font-size:18px;margin:0 0 8px">Password required</h1><p style="opacity:.7;margin:0">Refresh the page to try again.</p></div></body>');
  if (window.stop) window.stop();
})();

// ── Google Analytics 4 (gtag.js) — loaded on every page via this shared file
(function () {
  if (window.gtag) return; // already loaded inline on this page
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-PWF1TRML22';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-PWF1TRML22');
})();

(function () {
  // Compute the relative root prefix from the current page's path.
  // Pages under /charts/ need "../" to reach index.html, get-started.html, etc.
  // Pages at the site root (index.html, get-started.html, suggest.html) use "".
  var path = (typeof location !== 'undefined' ? location.pathname : '') || '';
  var inCharts = /\/charts\//i.test(path);
  var root = inCharts ? '../' : '';

  // Brand mark — webp logo file (matches the site accent gradient).
  var LOGO_SVG = '<img src="' + root + 'logo.webp" alt="" width="24" height="24" loading="eager" decoding="async">';
  var LOGO_FOOTER = LOGO_SVG;

  var NAV_HTML =
    '<header class="nav" id="nav">' +
      '<div class="wrap row">' +
        '<a href="' + root + 'index.html" class="logo">' +
          '<span class="logo-mark inline" aria-hidden="true">' + LOGO_SVG + '</span>' +
          ' vizstudio' +
        '</a>' +
        '<nav>' +
          '<a href="' + root + 'index.html#features">Features</a>' +
          '<a href="' + root + 'index.html#library">Charts</a>' +
          '<a href="' + root + 'index.html#how">How it works</a>' +
          '<a href="' + root + 'index.html#pricing">Pricing</a>' +
          '<a href="' + root + 'index.html#faq">FAQ</a>' +
        '</nav>' +
        '<div class="right">' +
          '<a class="btn" href="/login">Log in</a>' +
          '<a class="btn primary" href="' + root + 'get-started.html">Get Started</a>' +
          '<button class="nav-burger" id="navBurger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-menu" id="mobileMenu">' +
        '<a href="' + root + 'index.html#features">Features</a>' +
        '<a href="' + root + 'index.html#library">Charts</a>' +
        '<a href="' + root + 'index.html#how">How it works</a>' +
        '<a href="' + root + 'index.html#pricing">Pricing</a>' +
        '<a href="' + root + 'index.html#faq">FAQ</a>' +
        '<a href="/login">Log in</a>' +
        '<a class="btn primary" href="' + root + 'get-started.html">Get Started →</a>' +
      '</div>' +
    '</header>';

  var FOOTER_HTML =
    '<footer>' +
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div>' +
            '<a href="' + root + 'index.html" class="logo">' +
              '<span class="logo-mark inline" aria-hidden="true">' + LOGO_FOOTER + '</span>' +
              ' vizstudio' +
            '</a>' +
            '<p>The premium chart library for Data Studio teams who care about how their data looks.</p>' +
            '<form class="newsletter" onsubmit="event.preventDefault(); this.querySelector(\'input\').value=\'\'; this.querySelector(\'button\').textContent=\'✓ thanks\';">' +
              '<input type="email" placeholder="you@company.com" required>' +
              '<button type="submit">Subscribe</button>' +
            '</form>' +
          '</div>' +
          '<div>' +
            '<h4>Product</h4>' +
            '<ul>' +
              '<li><a href="' + root + 'index.html#features">Features</a></li>' +
              '<li><a href="' + root + 'index.html#library">Charts</a></li>' +
              '<li><a href="' + root + 'index.html#pricing">Pricing</a></li>' +
              '<li><a href="' + root + 'index.html#faq">FAQ</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Resources</h4>' +
            '<ul>' +
              '<li><a href="' + root + 'index.html#how">How it works</a></li>' +
              '<li><a href="' + root + 'how-to-add-a-chart.html">Add a chart to Data Studio</a></li>' +
              '<li><a href="' + root + 'index.html#library">Chart library</a></li>' +
              '<li><a href="' + root + 'suggest.html">Suggest a chart</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Company</h4>' +
            '<ul>' +
              '<li><a href="' + root + 'get-started.html">Get started</a></li>' +
              '<li><a href="/login">Client login</a></li>' +
              '<li><a href="' + root + 'terms.html">Terms of Service</a></li>' +
              '<li><a href="' + root + 'privacy.html">Privacy Policy</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="foot-bot">' +
          '<span>© 2026 Viz Studio LLC · Built for data teams, by data teams.</span>' +
          '<span><a href="' + root + 'terms.html" style="color: var(--text-dim);">Terms of Service</a> · <a href="' + root + 'privacy.html" style="color: var(--text-dim);">Privacy Policy</a></span>' +
          '<span class="socials-note" style="color:var(--muted);font-size:12px;">vizstudio</span>' +
        '</div>' +
      '</div>' +
    '</footer>';

  function mount(id, html) {
    var el = document.getElementById(id);
    if (!el) return;
    // outerHTML replacement so the mount div disappears and the real markup lives in the DOM.
    el.outerHTML = html;
  }

  // If DOM isn't ready, queue. Otherwise mount immediately.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mount('site-nav', NAV_HTML);
      mount('site-footer', FOOTER_HTML);
    });
  } else {
    mount('site-nav', NAV_HTML);
    mount('site-footer', FOOTER_HTML);
  }
})();
