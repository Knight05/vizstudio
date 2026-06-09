
// Kinetic icon marquee - two scrolling rows
(function () {
  const ICONS = ['timeseries-viz','sunburstChart','waffle-viz','streamgraph-viz','bubble-viz','choropleth-viz','hexbin-viz','venn-viz','radialtree-viz','dualdonut-viz','stackedarea-viz','beeswarm-viz','forcenet-viz','calendarHeatmap','flowmap-viz','bump-viz','windrose-viz','treemapzoom-viz','scattertrend-viz','parallelcoords-viz','curvedcol-static-viz','bigcalendar-viz','chord-viz','interactiveGlobe-viz'];
  const build = (el, list, reverse) => {
    if (!el || el.querySelector('.hero-marquee-track')) return;
    const track = document.createElement('div');
    track.className = 'hero-marquee-track' + (reverse ? ' reverse' : '');
    track.innerHTML = [...list, ...list].map(k =>
      `<a class="hero-marquee-tile" href="/charts/${k}"><img src="/icons/${k}.png" alt="" loading="lazy" onerror="this.style.opacity=.2"/></a>`
    ).join('');
    el.appendChild(track);
  };
  const half = Math.ceil(ICONS.length / 2);
  build(document.getElementById('heroMarquee1'), ICONS.slice(0, half * 2), false);
  build(document.getElementById('heroMarquee2'), [...ICONS.slice(half)].reverse().concat(ICONS.slice(0, half)), true);
})();
