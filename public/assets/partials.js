// vizstudio — shared nav + footer partials
// Mount points expected: <div id="site-nav"></div>  and  <div id="site-footer"></div>
// Edit the templates below to change the nav/footer everywhere on the site.

// NOTE: the preview password gate and GA4 init both live in src/app/layout.tsx
// (single source of truth) — do not duplicate them here.

(function () {
  // Compute the relative root prefix from the current page's path.
  // Pages under /charts/ need "../" to reach index.html, get-started.html, etc.
  // Pages at the site root (/, /get-started, /suggest) use "".
  var path = (typeof location !== 'undefined' ? location.pathname : '') || '';
  var inCharts = /\/charts\//i.test(path);
  var root = inCharts ? '../' : '';

  // Brand mark — webp logo file (matches the site accent gradient).
  var LOGO_SVG = '<img src="/logo.webp" alt="" width="24" height="24" loading="eager" decoding="async">';
  var LOGO_FOOTER = LOGO_SVG;

  var NAV_HTML =
    '<header class="nav" id="nav">' +
      '<div class="wrap row">' +
        '<a href="/" class="logo">' +
          '<span class="logo-mark inline" aria-hidden="true">' + LOGO_SVG + '</span>' +
          ' vizstudio' +
        '</a>' +
        '<nav>' +
          '<a href="/#features">Features</a>' +
          '<a href="/#library">Charts</a>' +
          '<a href="/#how">How it works</a>' +
          '<a href="/#pricing">Pricing</a>' +
          '<a href="/#faq">FAQ</a>' +
        '</nav>' +
        '<div class="right">' +
          '<a class="btn" href="/login">Log in</a>' +
          '<a class="btn primary" href="/get-started">Get Started</a>' +
          '<button class="nav-burger" id="navBurger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-menu" id="mobileMenu">' +
        '<a href="/#features">Features</a>' +
        '<a href="/#library">Charts</a>' +
        '<a href="/#how">How it works</a>' +
        '<a href="/#pricing">Pricing</a>' +
        '<a href="/#faq">FAQ</a>' +
        '<a href="/login">Log in</a>' +
        '<a class="btn primary" href="/get-started">Get Started →</a>' +
      '</div>' +
    '</header>';

  var FOOTER_HTML =
    '<footer>' +
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div>' +
            '<a href="/" class="logo">' +
              '<span class="logo-mark inline" aria-hidden="true">' + LOGO_FOOTER + '</span>' +
              ' vizstudio' +
            '</a>' +
            '<p>The premium chart library for Data Studio teams who care about how their data looks.</p>' +
            '<form class="newsletter" novalidate>' +
              '<input type="email" name="email" placeholder="you@company.com" required>' +
              '<button type="submit">Subscribe</button>' +
            '</form>' +
          '</div>' +
          '<div>' +
            '<h4>Product</h4>' +
            '<ul>' +
              '<li><a href="/#features">Features</a></li>' +
              '<li><a href="/#library">Charts</a></li>' +
              '<li><a href="/#pricing">Pricing</a></li>' +
              '<li><a href="/#faq">FAQ</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Resources</h4>' +
            '<ul>' +
              '<li><a href="/#how">How it works</a></li>' +
              '<li><a href="/how-to-add-a-chart">Add a chart to Data Studio</a></li>' +
              '<li><a href="/#library">Chart library</a></li>' +
              '<li><a href="/suggest">Suggest a chart</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Company</h4>' +
            '<ul>' +
              '<li><a href="/get-started">Get started</a></li>' +
              '<li><a href="/login">Client login</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="foot-bot">' +
          '<span>© 2026 Viz Studio LLC · Built for data teams, by data teams.</span>' +
          '<span><a href="/terms" style="color: var(--text-dim);">Terms of Service</a> · <a href="/privacy" style="color: var(--text-dim);">Privacy Policy</a></span>' +
          '<a href="/" class="logo footer-wordmark">' +
            '<span class="logo-mark inline" aria-hidden="true">' + LOGO_FOOTER + '</span>' +
            ' vizstudio' +
          '</a>' +
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

  // Footer newsletter — real submit to /api/forms. Delegated on document so it
  // works for the injected footer and survives SPA re-injection; the window
  // flag prevents double-binding when this script re-runs.
  if (!window.__vzNewsletterBound) {
    window.__vzNewsletterBound = true;
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.classList || !form.classList.contains('newsletter')) return;
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button');
      var email = input && input.value ? input.value.trim() : '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (input) input.focus();
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: 'subscribe', email: email, source: location.pathname }),
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        if (input) input.value = '';
        if (btn) btn.textContent = '✓ thanks';
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
      });
    });
  }
})();
