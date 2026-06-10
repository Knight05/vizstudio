
// vizstudio - wire the library grid tiles to chart-doc pages
(function () {
  function wireFromIcon(scope) {
    scope.querySelectorAll('.lib-grid > *, .hero-marquee-tile, .marquee a, .lib-card').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;
      const m = img.src.match(/icons\/([^/]+)\.png$/);
      if (!m) return;
      const href = '/charts/' + m[1];
      if (el.tagName === 'A') { el.href = href; }
      else { el.style.cursor = 'pointer'; el.addEventListener('click', () => { window.location.href = href; }); }
    });
  }
  setTimeout(() => wireFromIcon(document), 50);
  setTimeout(() => wireFromIcon(document), 500);
  setTimeout(() => wireFromIcon(document), 1500);
})();
