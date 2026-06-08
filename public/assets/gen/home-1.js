
// ═══════════════════════════════════════════════════════════════
// vizstudio landing — motion & charts (vanilla, no deps)
// ═══════════════════════════════════════════════════════════════

// ─── Mobile menu ────────────────────────────────────────────
// Burger / mobile menu — nav is injected by partials.js, so try a few times
// after load until the elements appear.
function wireBurger() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return false;
  if (burger._wired) return true;
  burger._wired = true;
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  };
  burger.addEventListener('click', () => set(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 960) set(false); });
  return true;
}
if (!wireBurger()) {
  setTimeout(wireBurger, 50);
  setTimeout(wireBurger, 500);
}

// ─── Sticky nav shrink ──────────────────────────────────────
// Nav is now injected by partials.js on DOMContentLoaded, so look it up live.
const onScroll = () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ─── IntersectionObserver reveal ────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0, rootMargin: '0px 0px -80px 0px' }); // threshold 0: elements taller than the viewport (e.g. the chart grid on mobile) can never reach a 10% ratio, which left the grid stuck at opacity:0 on iPhone
document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));

// ─── Feature card mouse-follow glow ─────────────────────────
document.querySelectorAll('.feat').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ─── Animated counters ──────────────────────────────────────
const fmt = (n) => {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return Math.round(n/100)/10 + 'K';
  return Math.round(n).toString();
};
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const dur = 1800;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const v = target * ease(t);
      el.textContent = (target >= 1000 ? fmt(v) : Math.round(v)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

// ─── Hero stat counters (loop small delta) ─────────────────
function animateStat(id, base, variance) {
  const el = document.getElementById(id);
  if (!el) return;
  let shown = 0;
  const animate = (target) => {
    const from = shown, start = performance.now(), dur = 900;
    const tick = now => {
      const t = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      shown = from + (target - from) * ease;
      el.textContent = Math.round(shown).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  animate(base);
  setInterval(() => animate(base + Math.round((Math.random() - 0.3) * variance)), 3400);
}
animateStat('c-users', 42831, 1400);
animateStat('c-rev', 128, 8);

// ─── (Marquee removed) ──────────────────────────────────────
/*
const brands = ['Fable', 'Stagepost', 'Portico', 'Klarmark', 'Northwind', 'Perihelion', 'Arclight', 'Maven & Co', 'Helix Labs', 'Cartesia', 'Merit Bank', 'Soundwell'];
const shapes = [
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 22,20 2,20"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L22 12 L12 22 L2 12 Z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 18 L10 6 L16 18 L20 10"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 12 a10 10 0 1 1 20 0 M12 2 L12 22"/></svg>'
];
const makeLogoItem = (name, i) => `<div class="logo-item">${shapes[i % shapes.length]}<span>${name}</span></div>`;
*/

// ═══════════════════════════════════════════════════════════
// CHARTS — vanilla SVG + small deterministic data
// ═══════════════════════════════════════════════════════════
const PAL = ['#6366f1', '#8b5cf6', '#ec4899', '#22d3ee', '#f59e0b', '#10b981'];
function svgNS(n, attrs = {}, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', n);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  for (const c of children) el.appendChild(c);
  return el;
}
function makeSvg(host, w, h) {
  host.innerHTML = '';
  const svg = svgNS('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'none', style: 'width:100%;height:100%' });
  host.appendChild(svg);
  return svg;
}
const rand = (seed) => { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; };

// — hero main: stacked area (animated values)
const heroData = {
  series: [
    Array.from({length: 14}, (_, i) => 20 + Math.sin(i * 0.5) * 8 + i),
    Array.from({length: 14}, (_, i) => 14 + Math.cos(i * 0.4) * 6 + i * 0.6),
    Array.from({length: 14}, (_, i) => 10 + Math.sin(i * 0.7 + 1) * 4 + i * 0.4),
  ]
};
function renderHeroMain() {
  const host = document.getElementById('hero-main');
  if (!host) return;
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(renderHeroMain, 50);
  const svg = makeSvg(host, W, H);
  const defs = svgNS('defs');
  for (let i = 0; i < 3; i++) {
    const lg = svgNS('linearGradient', { id: `hg${i}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    lg.appendChild(svgNS('stop', { offset: '0%', 'stop-color': PAL[i], 'stop-opacity': '0.7' }));
    lg.appendChild(svgNS('stop', { offset: '100%', 'stop-color': PAL[i], 'stop-opacity': '0.04' }));
    defs.appendChild(lg);
  }
  svg.appendChild(defs);
  // grid lines
  for (let i = 1; i < 4; i++) {
    const y = H * i / 4;
    svg.appendChild(svgNS('line', { x1: 0, x2: W, y1: y, y2: y, stroke: 'rgba(255,255,255,0.04)', 'stroke-dasharray': '2 4' }));
  }
  const N = heroData.series[0].length;
  const max = 180;
  const x = i => (i / (N - 1)) * W;
  const y = v => H - (v / max) * H * 0.9 - 8;
  // stack
  const stacked = heroData.series.reduce((acc, s) => {
    const layer = s.map((v, i) => (acc.cum[i] = (acc.cum[i] || 0) + v));
    acc.layers.push({ values: layer.slice(), prev: [...(acc.prevCum || layer.map(() => 0))] });
    acc.prevCum = acc.cum.slice();
    return acc;
  }, { cum: [], layers: [], prevCum: null });
  [0, 1, 2].reverse().forEach(i => {
    const l = stacked.layers[i];
    const prev = stacked.layers[i].prev;
    let d = `M ${x(0)} ${y(prev[0])} `;
    for (let j = 0; j < N; j++) d += `L ${x(j)} ${y(l.values[j])} `;
    for (let j = N - 1; j >= 0; j--) d += `L ${x(j)} ${y(prev[j])} `;
    d += 'Z';
    const p = svgNS('path', { d, fill: `url(#hg${i})`, stroke: PAL[i], 'stroke-width': 1.5, 'stroke-opacity': 0.9 });
    svg.appendChild(p);
  });
}
renderHeroMain();
addEventListener('resize', renderHeroMain);

// animate hero data slowly
setInterval(() => {
  heroData.series.forEach(s => s.forEach((_, i) => {
    s[i] = Math.max(4, s[i] + (Math.random() - 0.5) * 3);
  }));
  renderHeroMain();
}, 2800);

// — hero side: donut
function renderHeroSide() {
  const host = document.getElementById('hero-side');
  if (!host) return;
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(renderHeroSide, 50);
  const svg = makeSvg(host, W, H);
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 6, ir = r * 0.58;
  const vals = [38, 26, 18, 12, 6];
  const total = vals.reduce((a, b) => a + b, 0);
  let ang = -Math.PI / 2;
  vals.forEach((v, i) => {
    const a2 = ang + (v / total) * Math.PI * 2;
    const large = (a2 - ang) > Math.PI ? 1 : 0;
    const x1 = cx + Math.cos(ang) * r, y1 = cy + Math.sin(ang) * r;
    const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
    const xi1 = cx + Math.cos(a2) * ir, yi1 = cy + Math.sin(a2) * ir;
    const xi2 = cx + Math.cos(ang) * ir, yi2 = cy + Math.sin(ang) * ir;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi2} ${yi2} Z`;
    svg.appendChild(svgNS('path', { d, fill: PAL[i % PAL.length] }));
    ang = a2;
  });
  // center label
  svg.appendChild(svgNS('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: '#eef0f7', 'font-size': 13, 'font-weight': 700, 'font-family': 'Inter' })).textContent = '68%';
  svg.appendChild(svgNS('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', fill: '#9aa0b4', 'font-size': 9, 'font-family': 'Inter' })).textContent = 'converted';
}
renderHeroSide();
addEventListener('resize', renderHeroSide);

// ─── Hero variant F — dashboard mockup charts ─────────────────
function renderHeroDash() {
  // Main: stacked area
  const main = document.getElementById('hd-chart-main');
  if (main) {
    main.innerHTML = '';
    const W = 400, H = 240;
    const N = 30;
    const colors = ['#6366f1', '#8b5cf6', '#ec4899'];
    const series = [0,1,2].map((s, si) =>
      Array.from({length: N}, (_, i) => 40 + Math.sin(i * 0.4 + si) * 12 + Math.cos(i * 0.2 + si * 2) * 8 + si * 8 + Math.random() * 4)
    );
    const stack = series[0].map((_, i) => series.map(s => s[i]));
    const totals = stack.map(v => v.reduce((a,b) => a+b, 0));
    const maxT = Math.max(...totals);
    const xs = i => (i / (N - 1)) * W;
    const ys = v => H - (v / maxT) * (H - 8) - 4;
    const ns = 'http://www.w3.org/2000/svg';
    // stacked paths from top to bottom
    let cum = Array(N).fill(0);
    for (let si = series.length - 1; si >= 0; si--) {
      const top = stack.map((vs, i) => vs.slice(0, si + 1).reduce((a,b) => a+b, 0));
      const pts = top.map((v, i) => `${xs(i)},${ys(v)}`).join(' L');
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', `M${pts} L${W},${H} L0,${H} Z`);
      p.setAttribute('fill', colors[si]);
      p.setAttribute('opacity', 0.85);
      main.appendChild(p);
    }
    // grid lines
    for (let g = 1; g < 4; g++) {
      const y = (g / 4) * H;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', 0); l.setAttribute('x2', W);
      l.setAttribute('y1', y); l.setAttribute('y2', y);
      l.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      main.appendChild(l);
    }
  }

  // Donut
  const donut = document.getElementById('hd-chart-donut');
  if (donut) {
    donut.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    const cx = 50, cy = 50, rOut = 34, rIn = 22;
    const segs = [{v: 42, c: '#6366f1'}, {v: 28, c: '#8b5cf6'}, {v: 18, c: '#ec4899'}, {v: 12, c: '#22d3ee'}];
    const total = segs.reduce((a,b) => a + b.v, 0);
    let a0 = -Math.PI / 2;
    for (const s of segs) {
      const a1 = a0 + (s.v / total) * Math.PI * 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + rOut * Math.cos(a0), y0 = cy + rOut * Math.sin(a0);
      const x1 = cx + rOut * Math.cos(a1), y1 = cy + rOut * Math.sin(a1);
      const x2 = cx + rIn  * Math.cos(a1), y2 = cy + rIn  * Math.sin(a1);
      const x3 = cx + rIn  * Math.cos(a0), y3 = cy + rIn  * Math.sin(a0);
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', `M${x0},${y0} A${rOut},${rOut} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${rIn},${rIn} 0 ${large} 0 ${x3},${y3} Z`);
      p.setAttribute('fill', s.c);
      donut.appendChild(p);
      a0 = a1;
    }
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', 50); t.setAttribute('y', 53); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', 'white'); t.setAttribute('font-size', 11); t.setAttribute('font-weight', 600);
    t.textContent = '4 seg';
    donut.appendChild(t);
  }

  // Gauge
  const gauge = document.getElementById('hd-chart-gauge');
  if (gauge) {
    gauge.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    const cx = 50, cy = 50, r = 36;
    const bg = document.createElementNS(ns, 'path');
    bg.setAttribute('d', `M${cx-r},${cy} A${r},${r} 0 0 1 ${cx+r},${cy}`);
    bg.setAttribute('stroke', 'rgba(255,255,255,0.08)'); bg.setAttribute('stroke-width', 8);
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke-linecap', 'round');
    gauge.appendChild(bg);
    const pct = 0.72;
    const ang = Math.PI * (1 - pct);
    const endX = cx + r * Math.cos(Math.PI - pct * Math.PI);
    const endY = cy - r * Math.sin(Math.PI - pct * Math.PI);
    // draw gradient arc using stroke-dasharray
    const arc = document.createElementNS(ns, 'path');
    const len = Math.PI * r; // half-circle length
    arc.setAttribute('d', `M${cx-r},${cy} A${r},${r} 0 0 1 ${cx+r},${cy}`);
    arc.setAttribute('stroke', 'url(#gg)'); arc.setAttribute('stroke-width', 8);
    arc.setAttribute('fill', 'none'); arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('stroke-dasharray', `${len * pct} ${len}`);
    gauge.innerHTML = `<defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>` + gauge.innerHTML;
    gauge.appendChild(arc);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', 50); t.setAttribute('y', 50); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', 'white'); t.setAttribute('font-size', 14); t.setAttribute('font-weight', 700);
    t.textContent = '72';
    gauge.appendChild(t);
  }

  // Sparkline
  const spark = document.getElementById('hd-chart-spark');
  if (spark) {
    spark.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    const W = 400, H = 70, N = 80;
    const vals = Array.from({length: N}, (_, i) => 0.5 + 0.35 * Math.sin(i * 0.25) + 0.2 * Math.cos(i * 0.12) + (i / N) * 0.3);
    const max = Math.max(...vals), min = Math.min(...vals);
    const xs = i => (i / (N - 1)) * W;
    const ys = v => H - ((v - min) / (max - min)) * (H - 6) - 3;
    const pts = vals.map((v, i) => `${xs(i)},${ys(v)}`).join(' L');
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', `M${pts} L${W},${H} L0,${H} Z`);
    area.setAttribute('fill', 'url(#spk)'); area.setAttribute('opacity', 0.35);
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', `M${pts}`);
    line.setAttribute('stroke', '#8b5cf6'); line.setAttribute('stroke-width', 1.5);
    line.setAttribute('fill', 'none');
    spark.innerHTML = `<defs><linearGradient id="spk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient></defs>`;
    spark.appendChild(area); spark.appendChild(line);
  }
}

// ─── Hero variant G — marquee rows ────────────────────────────
const MARQUEE_ICONS = [
  'timeseries-viz','sunburstChart','waffle-viz','streamgraph-viz','bubble-viz','choropleth-viz',
  'npsgauge-viz','hexbin-viz','venn-viz','radialtree-viz','ridgeplot-viz','dualdonut-viz',
  'stackedarea-viz','beeswarm-viz','forcenet-viz','calendarHeatmap','flowmap-viz','bump-viz',
  'windrose-viz','treemapzoom-viz','barbell-viz','scattertrend-viz','parallelcoords-viz','curvedcol-static-viz',
];
function buildHeroMarquee() {
  const make = (el, list, reverse) => {
    if (!el) return;
    if (el.querySelector('.hero-marquee-track')) return; // already built
    const track = document.createElement('div');
    track.className = 'hero-marquee-track' + (reverse ? ' reverse' : '');
    const tiles = [...list, ...list].map(k =>
      `<a class="hero-marquee-tile" href="#library"><img src="/icons/${k}.png" alt="" loading="lazy"/></a>`
    ).join('');
    track.innerHTML = tiles;
    el.appendChild(track);
  };
  const half = MARQUEE_ICONS.length / 2;
  make(document.getElementById('heroMarquee1'), MARQUEE_ICONS.slice(0, half * 2), false);
  make(document.getElementById('heroMarquee2'), [...MARQUEE_ICONS.slice(half)].reverse().concat(MARQUEE_ICONS.slice(0, half)), true);
}


// ─── Showcase gallery ───────────────────────────────────────
const CHARTS = [
  { cat: 'TREND', title: 'area-stream',   type: 'area' },
  { cat: 'BARS',  title: 'bar-grouped',   type: 'bars' },
  { cat: 'DIST',  title: 'donut',         type: 'donut' },
  { cat: 'GEO',   title: 'heat-cal',      type: 'heat' },
  { cat: 'FUNNEL',title: 'funnel',        type: 'funnel' },
  { cat: 'FLOW',  title: 'sankey',        type: 'sankey' },
  { cat: 'DIST',  title: 'gauge',         type: 'gauge' },
  { cat: 'TREND', title: 'sparkgrid',     type: 'spark' }
];
function render(card, spec) {
  const titleHtml = `<div class="title"><span>${spec.title}</span><span class="cat">${spec.cat}</span></div>`;
  card.innerHTML = titleHtml + `<div class="viz"></div>`;
  const host = card.querySelector('.viz');
  setTimeout(() => draw(host, spec), 50); // layout settle
}
function draw(host, spec) {
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(() => draw(host, spec), 80);
  const svg = makeSvg(host, W, H);
  const r = rand(spec.title.charCodeAt(0) * 101);
  switch (spec.type) {
    case 'area': {
      const defs = svgNS('defs');
      const lg = svgNS('linearGradient', { id: `gA${spec.title}`, x1: '0', x2: '0', y1: '0', y2: '1' });
      lg.appendChild(svgNS('stop', { offset: '0%', 'stop-color': PAL[0], 'stop-opacity': 0.6 }));
      lg.appendChild(svgNS('stop', { offset: '100%', 'stop-color': PAL[0], 'stop-opacity': 0.02 }));
      defs.appendChild(lg); svg.appendChild(defs);
      const pts = Array.from({length: 28}, (_, i) => ({ x: i * W/27, y: H * 0.25 + Math.sin(i * 0.5) * H*0.18 + r() * H*0.12 }));
      let d = `M 0 ${H} `;
      pts.forEach(p => d += `L ${p.x} ${p.y} `);
      d += `L ${W} ${H} Z`;
      svg.appendChild(svgNS('path', { d, fill: `url(#gA${spec.title})`, stroke: PAL[0], 'stroke-width': 1.5 }));
      return;
    }
    case 'bars': {
      const N = 8;
      for (let i = 0; i < N; i++) {
        const bw = W / N - 4;
        const bh = H * (0.25 + r() * 0.65);
        svg.appendChild(svgNS('rect', { x: i * (W/N) + 2, y: H - bh, width: bw, height: bh, rx: 3, fill: PAL[i % 3 === 0 ? 1 : 0], 'fill-opacity': 0.85 }));
      }
      return;
    }
    case 'donut': {
      const cx = W/2, cy = H/2;
      const R = Math.min(W, H)/2 - 4, IR = R * 0.55;
      const vals = [34, 26, 18, 12, 10];
      let a = -Math.PI/2, tot = 100;
      vals.forEach((v, i) => {
        const a2 = a + (v/tot) * Math.PI * 2;
        const large = (a2 - a) > Math.PI ? 1 : 0;
        const d = `M ${cx + Math.cos(a)*R} ${cy + Math.sin(a)*R} A ${R} ${R} 0 ${large} 1 ${cx + Math.cos(a2)*R} ${cy + Math.sin(a2)*R} L ${cx + Math.cos(a2)*IR} ${cy + Math.sin(a2)*IR} A ${IR} ${IR} 0 ${large} 0 ${cx + Math.cos(a)*IR} ${cy + Math.sin(a)*IR} Z`;
        svg.appendChild(svgNS('path', { d, fill: PAL[i % PAL.length] }));
        a = a2;
      });
      return;
    }
    case 'heat': {
      const cols = 14, rows = 7;
      const cw = W/cols, ch = H/rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const v = (Math.sin(x * 0.6) + Math.cos(y * 0.8) + r() + 1) / 4;
        svg.appendChild(svgNS('rect', { x: x*cw + 1, y: y*ch + 1, width: cw - 2, height: ch - 2, rx: 2, fill: PAL[0], 'fill-opacity': 0.08 + v * 0.8 }));
      }
      return;
    }
    case 'funnel': {
      const N = 4, stages = [100, 72, 48, 28];
      stages.forEach((v, i) => {
        const stepH = H/N - 4;
        const w = (v/100) * W;
        svg.appendChild(svgNS('rect', { x: (W - w)/2, y: i * H/N + 2, width: w, height: stepH, rx: 4, fill: PAL[i % PAL.length], 'fill-opacity': 0.85 }));
      });
      return;
    }
    case 'sankey': {
      const nodesL = 3, nodesR = 4;
      for (let i = 0; i < nodesL; i++) {
        const y = i * H/nodesL + 4, h = H/nodesL - 8;
        svg.appendChild(svgNS('rect', { x: 2, y, width: 8, height: h, rx: 2, fill: PAL[i % PAL.length] }));
      }
      for (let i = 0; i < nodesR; i++) {
        const y = i * H/nodesR + 4, h = H/nodesR - 8;
        svg.appendChild(svgNS('rect', { x: W - 10, y, width: 8, height: h, rx: 2, fill: PAL[(i + 2) % PAL.length] }));
      }
      for (let i = 0; i < nodesL; i++) for (let j = 0; j < nodesR; j++) {
        const y1 = i * H/nodesL + H/(nodesL*2);
        const y2 = j * H/nodesR + H/(nodesR*2);
        const midX = W/2;
        svg.appendChild(svgNS('path', { d: `M 10 ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${W-10} ${y2}`, stroke: PAL[i % PAL.length], 'stroke-width': 4 + r() * 5, 'stroke-opacity': 0.25, fill: 'none' }));
      }
      return;
    }
    case 'gauge': {
      const cx = W/2, cy = H * 0.78;
      const R = Math.min(W * 0.42, H * 0.7), IR = R * 0.58;
      // background
      svg.appendChild(svgNS('path', { d: arcPath(cx, cy, R, IR, -Math.PI, 0), fill: 'rgba(255,255,255,0.06)' }));
      // fill 0.72
      svg.appendChild(svgNS('path', { d: arcPath(cx, cy, R, IR, -Math.PI, -Math.PI + Math.PI * 0.72), fill: PAL[0] }));
      // needle
      const ang = -Math.PI + Math.PI * 0.72;
      const tx = cx + Math.cos(ang) * (R - 4), ty = cy + Math.sin(ang) * (R - 4);
      svg.appendChild(svgNS('line', { x1: cx, y1: cy, x2: tx, y2: ty, stroke: '#eef0f7', 'stroke-width': 2, 'stroke-linecap': 'round' }));
      svg.appendChild(svgNS('circle', { cx, cy, r: 4, fill: '#eef0f7' }));
      return;
    }
    case 'spark': {
      const rows = 3, cols = 2;
      const cw = W/cols, ch = H/rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const N = 18;
        const basex = x * cw + 6, basey = y * ch + 8, w = cw - 12, h = ch - 16;
        const pts = [];
        for (let i = 0; i < N; i++) {
          pts.push([basex + (i / (N-1)) * w, basey + (0.5 + Math.sin(i * 0.8 + r() * 2) * 0.35) * h]);
        }
        let d = `M ${pts[0][0]} ${pts[0][1]} `;
        for (let i = 1; i < N; i++) d += `L ${pts[i][0]} ${pts[i][1]} `;
        svg.appendChild(svgNS('path', { d, stroke: PAL[(x + y) % PAL.length], 'stroke-width': 1.5, fill: 'none' }));
        svg.appendChild(svgNS('circle', { cx: pts[N-1][0], cy: pts[N-1][1], r: 3, fill: PAL[(x + y) % PAL.length] }));
      }
      return;
    }
  }
}
function arcPath(cx, cy, R, IR, a1, a2) {
  const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
  return `M ${cx + Math.cos(a1)*R} ${cy + Math.sin(a1)*R} A ${R} ${R} 0 ${large} 1 ${cx + Math.cos(a2)*R} ${cy + Math.sin(a2)*R} L ${cx + Math.cos(a2)*IR} ${cy + Math.sin(a2)*IR} A ${IR} ${IR} 0 ${large} 0 ${cx + Math.cos(a1)*IR} ${cy + Math.sin(a1)*IR} Z`;
}

function buildShowcase() {
  const g1 = document.getElementById('showcase-1');
  const g2 = document.getElementById('showcase-2');
  g1.innerHTML = ''; g2.innerHTML = '';
  // first row: featured (wide) + 3 + 4 below
  CHARTS.slice(0, 4).forEach(spec => {
    const div = document.createElement('div');
    div.className = 'show-card reveal';
    render(div, spec);
    g1.appendChild(div);
    io.observe(div);
  });
  CHARTS.slice(4).forEach(spec => {
    const div = document.createElement('div');
    div.className = 'show-card reveal';
    render(div, spec);
    g2.appendChild(div);
    io.observe(div);
  });
}
/* buildShowcase() disabled — live D3 showcase script renders these cards */

// ─── Library grid (real chart icons) ────────────────────────
const LIBRARY = [
  // Trend / time
  { src: 'timeseries-viz', name: 'Time series', cat: 'trend' },
  { src: 'stackedarea-viz', name: 'Stacked area', cat: 'trend' },
  { src: 'streamgraph-viz', name: 'Streamgraph', cat: 'trend' },
  { src: 'streamwave-viz', name: 'Stream wave', cat: 'trend' },
  { src: 'rollingavg-viz', name: 'Rolling average', cat: 'trend' },
  { src: 'retentioncurve-viz', name: 'Retention curve', cat: 'trend' },
  { src: 'yoyline-viz', name: 'YoY line', cat: 'trend' },
  { src: 'cycleplot-viz', name: 'Cycle plot', cat: 'trend' },
  { src: 'bump-viz', name: 'Bump chart', cat: 'trend' },
  { src: 'kpisparkline-viz', name: 'KPI sparkline', cat: 'trend' },
  { src: 'ridgeplot-viz', name: 'Ridge plot', cat: 'trend' },
  { src: 'pyramidarea-viz', name: 'Pyramid area', cat: 'trend' },
  // Comparison (bars, columns)
  { src: 'simplecol-viz', name: 'Simple column', cat: 'compare' },
  { src: 'stackedbar-viz', name: 'Stacked bar', cat: 'compare' },
  { src: 'groupedbar-viz', name: 'Grouped bar', cat: 'compare' },
  { src: 'stackedneg-viz', name: 'Stacked with negatives', cat: 'compare' },
  { src: 'stackedneg-animated-viz', name: 'Animated stacked', cat: 'compare' },
  { src: 'curvedcol-static-viz', name: 'Curved column', cat: 'compare' },
  { src: 'curvedcol-animated-viz', name: 'Animated curved column', cat: 'compare' },
  { src: 'mirrorbar-viz', name: 'Mirror bar', cat: 'compare' },
  { src: 'barbell-viz', name: 'Barbell', cat: 'compare' },
  { src: 'dumbbell-viz', name: 'Dumbbell', cat: 'compare' },
  { src: 'dotstrip-viz', name: 'Dot strip', cat: 'compare' },
  { src: 'barrace-viz', name: 'Bar race', cat: 'compare' },
  { src: 'lollipopchart', name: 'Lollipop', cat: 'compare' },
  { src: 'variancebar-viz', name: 'Variance bar', cat: 'compare' },
  { src: 'comparison-viz', name: 'Comparison', cat: 'compare' },
  { src: 'dualaxis-viz', name: 'Dual axis', cat: 'compare' },
  // Part-to-whole
  { src: 'sunburstChart', name: 'Sunburst', cat: 'part' },
  { src: 'multiring-viz', name: 'Multi-ring', cat: 'part' },
  { src: 'dualdonut-viz', name: 'Dual donut', cat: 'part' },
  { src: 'vardonut-viz', name: 'Variable donut', cat: 'part' },
  { src: 'varradiuspie-viz', name: 'Variable radius pie', cat: 'part' },
  { src: 'semicirclepie-viz', name: 'Semicircle pie', cat: 'part' },
  { src: 'waffle-viz', name: 'Waffle', cat: 'part' },
  { src: 'treemapzoom-viz', name: 'Zoomable treemap', cat: 'part' },
  { src: 'piebarcode-viz', name: 'Pie barcode', cat: 'part' },
  { src: 'portfoliobarcode-viz', name: 'Portfolio barcode', cat: 'part' },
  { src: 'portfoliopiebarcode-viz', name: 'Portfolio pie barcode', cat: 'part' },
  { src: 'revenuebreakdown-viz', name: 'Revenue breakdown', cat: 'part' },
  { src: 'venn-viz', name: 'Venn', cat: 'part' },
  { src: 'parallelsets-viz', name: 'Parallel sets', cat: 'part' },
  // Distribution / relationship
  { src: 'bubble-viz', name: 'Bubble', cat: 'distrib' },
  { src: 'bubblegrid', name: 'Bubble grid', cat: 'distrib' },
  { src: 'scattertrend-viz', name: 'Scatter with trend', cat: 'distrib' },
  { src: 'roiscatter-viz', name: 'ROI scatter', cat: 'distrib' },
  { src: 'quadrant-viz', name: 'Quadrant', cat: 'distrib' },
  { src: 'xybubble-animated-viz', name: 'Animated XY bubble', cat: 'distrib' },
  { src: 'beeswarm-viz', name: 'Beeswarm', cat: 'distrib' },
  { src: 'violin-viz', name: 'Violin', cat: 'distrib' },
  { src: 'stemleaf-viz', name: 'Stem-and-leaf', cat: 'distrib' },
  { src: 'qq-viz', name: 'Q–Q plot', cat: 'distrib' },
  { src: 'hexbin-viz', name: 'Hex bin', cat: 'distrib' },
  { src: 'hexbindensity-viz', name: 'Hex density', cat: 'distrib' },
  { src: 'densityheat-viz', name: 'Density heatmap', cat: 'distrib' },
  { src: 'parallelcoords-viz', name: 'Parallel coordinates', cat: 'distrib' },
  { src: 'pareto-viz', name: 'Pareto', cat: 'distrib' },
  // Maps
  { src: 'choropleth-viz', name: 'Choropleth', cat: 'geo' },
  { src: 'bubblemap-viz', name: 'Bubble map', cat: 'geo' },
  { src: 'flowmap-viz', name: 'Flow map', cat: 'geo' },
  { src: 'connmap-viz', name: 'Connection map', cat: 'geo' },
  { src: 'globe-viz', name: 'Globe', cat: 'geo' },
  { src: 'interactiveGlobe-viz', name: 'Interactive globe', cat: 'geo' },
  // Heatmaps & matrices
  { src: 'calendarHeatmap', name: 'Calendar heatmap', cat: 'heatmap' },
  { src: 'bigcalendar-viz', name: 'Big calendar', cat: 'heatmap' },
  { src: 'engageheatmap-viz', name: 'Engagement heatmap', cat: 'heatmap' },
  { src: 'convheatmap-viz', name: 'Conversion heatmap', cat: 'heatmap' },
  { src: 'matrixchart-viz', name: 'Matrix', cat: 'heatmap' },
  { src: 'smallmultiples-viz', name: 'Small multiples', cat: 'heatmap' },
  // Gauges & progress
  { src: 'solidgauge-viz', name: 'Solid gauge', cat: 'gauge' },
  { src: 'semicirclegauge-viz', name: 'Semicircle gauge', cat: 'gauge' },
  { src: 'npsgauge-viz', name: 'NPS gauge', cat: 'gauge' },
  { src: 'progressring-viz', name: 'Progress ring', cat: 'gauge' },
  { src: 'progresscircles-viz', name: 'Progress circles', cat: 'gauge' },
  { src: 'progressbar-viz', name: 'Progress bar', cat: 'gauge' },
  { src: 'verticalprogress-viz', name: 'Vertical progress', cat: 'gauge' },
  { src: 'bulletchart-viz', name: 'Bullet', cat: 'gauge' },
  { src: 'trafficlight-viz', name: 'Traffic light', cat: 'gauge' },
  // Flow / network / hierarchy
  { src: 'arcdiagram-viz', name: 'Arc diagram', cat: 'flow' },
  { src: 'depwheel-viz', name: 'Dependency wheel', cat: 'flow' },
  { src: 'forcenet-viz', name: 'Force network', cat: 'flow' },
  { src: 'bipartite-viz', name: 'Bipartite', cat: 'flow' },
  { src: 'radialtree-viz', name: 'Radial tree', cat: 'flow' },
  { src: 'storyflow-viz', name: 'Storyflow', cat: 'flow' },
  { src: 'oppositediagram', name: 'Opposite diagram', cat: 'flow' },
  // Finance / business
  { src: 'cashflow-viz', name: 'Cash flow', cat: 'finance' },
  { src: 'breakeven-viz', name: 'Break-even', cat: 'finance' },
  { src: 'annotwaterfall-viz', name: 'Annotated waterfall', cat: 'finance' },
  { src: 'annotgantt-viz', name: 'Annotated Gantt', cat: 'finance' },
  { src: 'resgant-viz', name: 'Resource Gantt', cat: 'finance' },
  { src: 'earningsdot-viz', name: 'Earnings dot', cat: 'finance' },
  { src: 'analystratings-viz', name: 'Analyst ratings', cat: 'finance' },
  // Specialty
  { src: 'abtest-viz', name: 'A/B test', cat: 'special' },
  { src: 'campaignradar-viz', name: 'Campaign radar', cat: 'special' },
  { src: 'radartable-viz', name: 'Radar table', cat: 'special' },
  { src: 'windrose-viz', name: 'Wind rose', cat: 'special' },
  { src: 'wordcloud-viz', name: 'Word cloud', cat: 'special' },
  { src: 'trafficsrc-viz', name: 'Traffic sources', cat: 'special' },
  { src: 'audioverlap-viz', name: 'Audio overlap', cat: 'special' },
  { src: 'datatable-viz', name: 'Data table', cat: 'special' },
];

const LIB_CATS = [
  { k: 'all',      label: 'All' },
  { k: 'trend',    label: 'Trend' },
  { k: 'compare',  label: 'Compare' },
  { k: 'part',     label: 'Part of whole' },
  { k: 'distrib',  label: 'Distribution' },
  { k: 'geo',      label: 'Maps' },
  { k: 'heatmap',  label: 'Heatmap' },
  { k: 'gauge',    label: 'Gauges & progress' },
  { k: 'flow',     label: 'Flow & network' },
  { k: 'finance',  label: 'Finance' },
  { k: 'special',  label: 'Specialty' },
];

function buildLibrary() {
  const filterEl = document.getElementById('libFilter');
  const gridEl = document.getElementById('libGrid');
  if (!filterEl || !gridEl) return;

  // count per cat
  const counts = {};
  LIBRARY.forEach(c => { counts[c.cat] = (counts[c.cat] || 0) + 1; });
  counts.all = LIBRARY.length;

  filterEl.innerHTML = LIB_CATS
    .filter(c => c.k === 'all' || counts[c.k])
    .map(c => `<button data-cat="${c.k}" class="${c.k==='all'?'on':''}">${c.label}${c.k==='all' ? '' : `<span class="cnt">${counts[c.k]||0}</span>`}</button>`)
    .join('');

  gridEl.innerHTML = LIBRARY.map((c, i) => `
    <a class="lib-tile" href="#library" data-cat="${c.cat}" style="animation-delay: ${Math.min(i * 12, 600)}ms">
      <img src="/icons/${c.src}.png" alt="${c.name} chart preview" loading="lazy" decoding="async"/>
      <div class="name">${c.name}</div>
    </a>
  `).join('');

  filterEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    filterEl.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const cat = b.dataset.cat;
    gridEl.querySelectorAll('.lib-tile').forEach(t => {
      t.classList.toggle('is-hidden', cat !== 'all' && t.dataset.cat !== cat);
    });
  });
}
/* buildLibrary() disabled — library grid is server-rendered static HTML now */

// ─── Featured 16 (documented charts) ────────────────────────
const FEATURED = [
  {
    slug: 'datatable-viz',
    name: 'Row Over Row',
    cat: 'Comparison',
    diff: 'Easy',
    img: 'screenshots/data-studio-row-over-row-data-table-vizstudio.png',
    what: 'A period-over-period comparison table — DoD, MoM or YoY — with absolute deltas, % change, and per-metric formatting baked in.',
    why:  'Beats every default Data Studio table the moment your exec asks "compared to what?". Saves the analyst from rebuilding the same view weekly.',
  },
  {
    slug: 'timeseries-viz',
    name: 'Time Series with Annotations',
    cat: 'Time series',
    diff: 'Easy',
    img: 'screenshots/data-studio-time-series-annotations-vizstudio.png',
    what: 'A line chart that lets you mark launches, incidents, campaigns, and milestones directly on the timeline with first-class event icons.',
    why:  'Spikes are meaningless without context. Annotations turn "what happened on Mar 11?" into a one-glance answer.',
  },
  {
    slug: 'bigcalendar-viz',
    name: 'Big Calendar',
    cat: 'Time',
    diff: 'Intermediate',
    img: 'screenshots/data-studio-big-calendar-events-vizstudio.png',
    what: 'A full month or year calendar grid, every day tinted by your metric. Hover for tooltips, click to cross-filter.',
    why:  'Time-of-week and seasonal patterns leap out — the Tuesday slump, the Black Friday spike, the December lull.',
  },
  {
    slug: 'calendarHeatmap',
    name: 'Mini Calendar',
    cat: 'Time',
    diff: 'Easy',
    img: 'screenshots/data-studio-mini-calendar-heatmap-vizstudio.png',
    what: 'A compact monthly calendar tile that fits into a dashboard corner, day cells tinted by metric, with tooltips and cross-filter.',
    why:  'Same day-of-week story as Big Calendar, sized for the slot you actually have on the page.',
  },
];
const FNS = ' xmlns="http://www.w3.org/2000/svg"';
function FT(kind, w, h){
  const C = ['#6366f1','#8b5cf6','#ec4899','#22d3ee','#10b981','#f59e0b'];
  const rng = (s) => () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let svg = `<svg viewBox="0 0 ${w} ${h}"${FNS}>`;
  if (kind === 'bump') {
    const series = 5, steps = 8, rr = rng(7);
    const ranks = Array.from({length: series}, (_, s) => Array.from({length: steps}, () => 0));
    for (let i = 0; i < steps; i++) {
      const order = [0,1,2,3,4].sort(() => rr() - 0.5);
      order.forEach((s, j) => ranks[s][i] = j);
    }
    for (let s = 0; s < series; s++) {
      const pts = ranks[s].map((r, i) => `${i*(w/(steps-1))},${10 + r*(h-20)/(series-1)}`).join(' L');
      svg += `<path d="M${pts}" fill="none" stroke="${C[s]}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
  } else if (kind === 'cal') {
    const cw = w/7, ch = h/5, rr = rng(11);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const v = rr();
      const fill = v > 0.6 ? C[Math.floor(rr()*4)] : 'rgba(255,255,255,0.05)';
      const op = v > 0.6 ? 0.5 + rr()*0.5 : 1;
      svg += `<rect x="${c*cw+1}" y="${r*ch+1}" width="${cw-2}" height="${ch-2}" rx="2" fill="${fill}" fill-opacity="${op}"/>`;
    }
  } else if (kind === 'abtest') {
    for (let i = 0; i < 4; i++) {
      const y = h*(0.18 + i*0.22);
      const cx = w*(0.4 + i*0.1), ci = 28;
      svg += `<line x1="${cx-ci}" x2="${cx+ci}" y1="${y}" y2="${y}" stroke="${C[i]}" stroke-width="2.5"/>`;
      svg += `<line x1="${cx-ci}" x2="${cx-ci}" y1="${y-5}" y2="${y+5}" stroke="${C[i]}" stroke-width="1.5"/>`;
      svg += `<line x1="${cx+ci}" x2="${cx+ci}" y1="${y-5}" y2="${y+5}" stroke="${C[i]}" stroke-width="1.5"/>`;
      svg += `<rect x="${cx-4}" y="${y-4}" width="8" height="8" fill="${C[i]}" rx="1"/>`;
    }
    svg += `<line x1="${w*0.55}" x2="${w*0.55}" y1="0" y2="${h}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="3,3"/>`;
  } else if (kind === 'funnel') {
    const steps = 5, sh = h/steps, pad = 4;
    for (let i = 0; i < steps; i++) {
      const sw = w * (1 - i*0.16), sx = (w - sw)/2;
      svg += `<rect x="${sx}" y="${i*sh + pad}" width="${sw}" height="${sh - pad*2}" rx="3" fill="${C[i % C.length]}" fill-opacity="${0.85 - i*0.08}"/>`;
    }
  } else if (kind === 'radar') {
    const cx = w/2, cy = h/2, R = Math.min(w,h)/2 - 8, axes = 6;
    for (let r = 1; r <= 3; r++) {
      const pts = [];
      for (let a = 0; a < axes; a++) {
        const ang = a*Math.PI*2/axes - Math.PI/2;
        pts.push(`${cx + Math.cos(ang)*R*r/3},${cy + Math.sin(ang)*R*r/3}`);
      }
      svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>`;
    }
    const series = [[0.7,0.5,0.85,0.4,0.65,0.55],[0.5,0.8,0.4,0.7,0.45,0.75]];
    series.forEach((s, si) => {
      const pts = s.map((v, a) => {
        const ang = a*Math.PI*2/axes - Math.PI/2;
        return `${cx + Math.cos(ang)*R*v},${cy + Math.sin(ang)*R*v}`;
      }).join(' ');
      svg += `<polygon points="${pts}" fill="${C[si]}" fill-opacity="0.25" stroke="${C[si]}" stroke-width="1.6"/>`;
    });
  } else if (kind === 'choro') {
    const rr = rng(13);
    const states = [
      [0,0],[1,0],[3,0],[4,0],[5,0],[6,0],[7,0],
      [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
      [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],
      [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4]
    ];
    const cw = w/9, ch = h/5;
    states.forEach(([c,r]) => {
      const v = rr();
      svg += `<rect x="${c*cw + 1}" y="${r*ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="2" fill="${C[0]}" fill-opacity="${0.15 + v*0.85}"/>`;
    });
  } else if (kind === 'cohort' || kind === 'heatmap') {
    const cols = kind === 'cohort' ? 10 : 12, rows = kind === 'cohort' ? 8 : 7;
    const cw = w/cols, ch = h/rows, rr = rng(kind === 'cohort' ? 17 : 19);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = kind === 'cohort' ? Math.max(0.05, 1 - c*0.1 + (rr()-0.5)*0.2) : rr();
      svg += `<rect x="${c*cw}" y="${r*ch}" width="${cw - 0.5}" height="${ch - 0.5}" fill="${C[2]}" fill-opacity="${0.08 + v*0.85}"/>`;
    }
  } else if (kind === 'bigcal') {
    const cw = w/7, ch = h/5;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      svg += `<rect x="${c*cw}" y="${r*ch}" width="${cw - 1}" height="${ch - 1}" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)"/>`;
    }
    const events = [
      {r:0,c:1,len:3,col:0},{r:1,c:0,len:2,col:1},{r:1,c:4,len:3,col:2},
      {r:2,c:2,len:4,col:3},{r:3,c:1,len:2,col:0},{r:3,c:5,len:2,col:4},
      {r:4,c:0,len:3,col:1},{r:4,c:4,len:2,col:2}
    ];
    events.forEach(e => {
      svg += `<rect x="${e.c*cw + 2}" y="${e.r*ch + ch*0.3}" width="${e.len*cw - 4}" height="${ch*0.4}" rx="2" fill="${C[e.col]}" fill-opacity="0.85"/>`;
    });
  } else if (kind === 'bubble') {
    const rr = rng(23);
    const bubbles = [];
    for (let i = 0; i < 18; i++) {
      bubbles.push({ x: rr()*w, y: rr()*h, r: 4 + rr()*16, c: Math.floor(rr()*C.length) });
    }
    bubbles.forEach(b => svg += `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${C[b.c]}" fill-opacity="0.7"/>`);
  } else if (kind === 'sankey') {
    const cols = 3, gap = w*0.18, cw = (w - gap*2)/cols;
    for (let c = 0; c < cols; c++) {
      const x = c*(cw+gap);
      const nodes = c === 1 ? 4 : 3;
      const nh = h/nodes - 4;
      for (let n = 0; n < nodes; n++) {
        svg += `<rect x="${x}" y="${n*(nh+4) + 2}" width="${cw}" height="${nh}" rx="2" fill="${C[n%C.length]}" fill-opacity="0.85"/>`;
      }
    }
    // ribbons
    for (let r = 0; r < 6; r++) {
      const y1 = (r%3) * h/3 + h/6 + (Math.random()-0.5)*8;
      const y2 = ((r+1)%4) * h/4 + h/8 + (Math.random()-0.5)*8;
      const y3 = ((r+2)%3) * h/3 + h/6 + (Math.random()-0.5)*8;
      const cw2 = cw, gp = gap;
      const x1 = cw2, x2 = cw2+gp, x3 = cw2+gp+cw2, x4 = cw2*2+gp*2;
      svg += `<path d="M${x1},${y1} C${x1+gp/2},${y1} ${x2-gp/2},${y2} ${x2},${y2} L${x3},${y2} C${x3+gp/2},${y2} ${x4-gp/2},${y3} ${x4},${y3}" fill="none" stroke="${C[r%C.length]}" stroke-opacity="0.45" stroke-width="${5 + Math.random()*4}"/>`;
    }
  } else if (kind === 'race') {
    const rows = 6, rh = (h-6)/rows, rr = rng(29);
    for (let i = 0; i < rows; i++) {
      const v = 0.95 - i*0.13 + (rr()-0.5)*0.05;
      svg += `<rect x="0" y="${i*rh + 3}" width="${v*w}" height="${rh - 4}" rx="3" fill="${C[i%C.length]}" fill-opacity="0.9"/>`;
      svg += `<text x="${v*w - 4}" y="${i*rh + rh/2 + 5}" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="white">${(v*1000).toFixed(0)}</text>`;
    }
  } else if (kind === 'waterfall') {
    const n = 7, bw = w/n - 4; let y = h*0.85;
    const ds = [-1, 0.18, 0.12, -0.08, 0.22, -0.15, -1];
    for (let i = 0; i < n; i++) {
      const x = i*(bw+4) + 2;
      if (ds[i] === -1) {
        const v = i === 0 ? h*0.5 : h*0.65;
        svg += `<rect x="${x}" y="${h - v}" width="${bw}" height="${v}" rx="2" fill="${C[3]}" fill-opacity="0.9"/>`;
        if (i === 0) y = h - v;
        else y = h*0.85;
      } else {
        const dh = Math.abs(ds[i])*h*0.6;
        const isPositive = ds[i] > 0;
        const newY = y - (isPositive ? dh : -dh);
        const top = Math.min(y, newY);
        svg += `<rect x="${x}" y="${top}" width="${bw}" height="${dh}" rx="2" fill="${isPositive ? C[4] : C[2]}" fill-opacity="0.85"/>`;
        if (i < n-1) svg += `<line x1="${x+bw}" y1="${newY}" x2="${x+bw+4}" y2="${newY}" stroke="rgba(255,255,255,0.3)" stroke-dasharray="2,2"/>`;
        y = newY;
      }
    }
  } else if (kind === 'dualaxis') {
    const n = 9, bw = w/n - 2, rr = rng(31);
    const lpts = [];
    for (let i = 0; i < n; i++) {
      const v = 0.4 + rr()*0.5;
      svg += `<rect x="${i*(bw+2)+1}" y="${h - v*h*0.85}" width="${bw}" height="${v*h*0.85}" rx="1.5" fill="${C[0]}" fill-opacity="0.9"/>`;
      lpts.push(`${i*(bw+2) + bw/2 + 1},${15 + Math.sin(i/2)*12 + h*0.2}`);
    }
    svg += `<path d="M${lpts.join(' L')}" fill="none" stroke="${C[2]}" stroke-width="2.2"/>`;
    lpts.forEach(p => { const [x,y] = p.split(','); svg += `<circle cx="${x}" cy="${y}" r="2.5" fill="${C[2]}"/>`; });
  } else if (kind === 'table') {
    const rows = 6, rh = h/rows;
    svg += `<rect x="0" y="0" width="${w}" height="${rh}" fill="rgba(255,255,255,0.04)"/>`;
    for (let r = 0; r < rows; r++) {
      svg += `<line x1="0" x2="${w}" y1="${r*rh}" y2="${r*rh}" stroke="rgba(255,255,255,0.06)"/>`;
      if (r === 0) continue;
      svg += `<rect x="${w*0.05}" y="${r*rh + rh*0.3}" width="${w*0.35}" height="${rh*0.35}" rx="2" fill="rgba(255,255,255,0.1)"/>`;
      svg += `<rect x="${w*0.45}" y="${r*rh + rh*0.3}" width="${w*0.18}" height="${rh*0.35}" rx="2" fill="rgba(255,255,255,0.08)"/>`;
      const up = (r % 2) === 1;
      svg += `<rect x="${w*0.7}" y="${r*rh + rh*0.3}" width="${w*0.22}" height="${rh*0.35}" rx="2" fill="${up ? C[4] : C[2]}" fill-opacity="0.4"/>`;
    }
  } else if (kind === 'yoy') {
    const n = 24;
    let p1 = '', p2 = '', area = '';
    for (let i = 0; i < n; i++) {
      const x = i*w/(n-1);
      const y1 = h*0.5 + Math.sin(i/3)*h*0.18 + Math.cos(i/2)*h*0.06;
      const y2 = h*0.45 + Math.sin(i/3 + 0.4)*h*0.22 + Math.cos(i/2 + 0.5)*h*0.07 - 8;
      p1 += (i ? ' L' : 'M') + x + ',' + y1;
      p2 += (i ? ' L' : 'M') + x + ',' + y2;
    }
    // delta band
    let band = '';
    for (let i = 0; i < n; i++) {
      const x = i*w/(n-1);
      const y2 = h*0.45 + Math.sin(i/3 + 0.4)*h*0.22 + Math.cos(i/2 + 0.5)*h*0.07 - 8;
      band += (i ? ' L' : 'M') + x + ',' + y2;
    }
    for (let i = n-1; i >= 0; i--) {
      const x = i*w/(n-1);
      const y1 = h*0.5 + Math.sin(i/3)*h*0.18 + Math.cos(i/2)*h*0.06;
      band += ' L' + x + ',' + y1;
    }
    svg += `<path d="${band} Z" fill="${C[4]}" fill-opacity="0.18"/>`;
    svg += `<path d="${p1}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.6" stroke-dasharray="3,2"/>`;
    svg += `<path d="${p2}" fill="none" stroke="${C[0]}" stroke-width="2.2"/>`;
  }
  svg += '</svg>';
  return svg;
}
function buildFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = FEATURED.map(f => `
    <a class="featured-card" href="/charts/${f.slug}">
      <div class="fc-shot"><img src="${f.img}" alt="${f.name}" loading="lazy"></div>
      <div class="fc-body">
        <div class="fc-cat"><span>${f.cat}</span><span class="pill">${f.diff}</span></div>
        <div class="fc-name">${f.name}</div>
        <div class="fc-block"><div class="fc-label">What it is</div><div class="fc-copy">${f.what}</div></div>
        <div class="fc-block"><div class="fc-label">Why use it</div><div class="fc-copy">${f.why}</div></div>
        <div class="fc-arrow">Read the docs <span>→</span></div>
      </div>
    </a>
  `).join('');
}
/* buildFeatured() disabled — featured cards are server-rendered static HTML now */

// ─── Pricing toggle ─────────────────────────────────────────
const toggle = document.getElementById('toggle');
const priceGrid = document.getElementById('priceGrid');
toggle.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    toggle.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    toggle.classList.toggle('annual', btn.dataset.p === 'annual');
    priceGrid.dataset.period = btn.dataset.p;
  });
});


// ─── How-it-works mini animations ──────────────────────────
function step1() {
  const host = document.getElementById('anim-1');
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(step1, 60);
  const svg = makeSvg(host, W, H);
  // email form mock
  const g = svgNS('g', { transform: `translate(${W*0.1}, ${H*0.3})` });
  g.appendChild(svgNS('rect', { width: W*0.55, height: H*0.4, rx: 6, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.12)' }));
  const text = svgNS('text', { x: 10, y: H*0.25, fill: '#9aa0b4', 'font-size': 11, 'font-family': 'Inter' });
  text.textContent = '';
  g.appendChild(text);
  svg.appendChild(g);
  const btn = svgNS('rect', { x: W*0.72, y: H*0.3, width: W*0.22, height: H*0.4, rx: 6, fill: '#6366f1' });
  svg.appendChild(btn);
  const btnT = svgNS('text', { x: W*0.83, y: H*0.58, fill: 'white', 'font-size': 11, 'font-weight': 600, 'text-anchor': 'middle', 'font-family': 'Inter' });
  btnT.textContent = 'Subscribe';
  svg.appendChild(btnT);
  // type animation
  const str = 'you@company.com';
  let i = 0;
  clearInterval(window.__s1);
  window.__s1 = setInterval(() => {
    text.textContent = str.slice(0, i);
    i = (i + 1) % (str.length + 8);
  }, 150);
}
function step2() {
  const host = document.getElementById('anim-2');
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(step2, 60);
  const svg = makeSvg(host, W, H);
  // 3 chart cards floating in
  for (let i = 0; i < 3; i++) {
    const x = 10 + i * (W - 20) / 3;
    const rect = svgNS('rect', { x: x, y: 16, width: (W - 30) / 3, height: H - 32, rx: 6, fill: 'rgba(255,255,255,0.06)', stroke: PAL[i], 'stroke-opacity': 0.5 });
    svg.appendChild(rect);
    const mini = svgNS('rect', { x: x + 8, y: 28, width: ((W-30)/3) - 16, height: 6, rx: 2, fill: PAL[i], 'fill-opacity': 0.7 });
    svg.appendChild(mini);
    // a pulsing "add" check
    if (i === 1) {
      const c = svgNS('circle', { cx: x + (W - 30)/6, cy: H - 20, r: 5, fill: '#22d3ee' });
      const anim = svgNS('animate', { attributeName: 'r', values: '5;10;5', dur: '1.6s', repeatCount: 'indefinite' });
      c.appendChild(anim);
      svg.appendChild(c);
    }
  }
}
function step3() {
  const host = document.getElementById('anim-3');
  const { width: W, height: H } = host.getBoundingClientRect();
  if (!W) return setTimeout(step3, 60);
  const svg = makeSvg(host, W, H);
  // line that draws in
  const N = 20;
  const pts = Array.from({length: N}, (_, i) => [i * W / (N-1), 10 + Math.sin(i * 0.6) * (H*0.2) + H*0.4]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < N; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  const path = svgNS('path', { d, stroke: PAL[0], 'stroke-width': 2, fill: 'none' });
  svg.appendChild(path);
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1600, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(.4,0,.2,1)' });
  // dot follower
  const dot = svgNS('circle', { r: 4, fill: PAL[2] });
  svg.appendChild(dot);
  let tStart = performance.now();
  (function loop() {
    const elapsed = (performance.now() - tStart) % 3200;
    const t = elapsed < 1600 ? elapsed/1600 : 1 - (elapsed - 1600)/1600;
    const pt = path.getPointAtLength(len * t);
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
    requestAnimationFrame(loop);
  })();
}
// init steps when they scroll into view
const stepIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    if (id === 'anim-1') step1();
    if (id === 'anim-2') step2();
    if (id === 'anim-3') step3();
    stepIO.unobserve(e.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.step-anim').forEach(el => stepIO.observe(el));

// ═══════════════════════════════════════════════════════════
// LOGO VARIANTS — paint inline SVG into each .logo-mark based on data-logo
// ═══════════════════════════════════════════════════════════
const LOGO_SVGS = {
  a: ``, // gradient square w/ css corner — no SVG needed
  b: `<svg viewBox="0 0 24 24" fill="none" stroke="url(#gradB)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <defs><linearGradient id="gradB" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <polyline points="3 17 9 11 13 15 21 5"/>
        <circle cx="21" cy="5" r="2" fill="url(#gradB)"/>
      </svg>`,
  c: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradC" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <rect x="3" y="14" width="4" height="7" rx="1" fill="url(#gradC)"/>
        <rect x="10" y="8" width="4" height="13" rx="1" fill="url(#gradC)" opacity="0.75"/>
        <rect x="17" y="3" width="4" height="18" rx="1" fill="url(#gradC)" opacity="0.5"/>
      </svg>`,
  d: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradD" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <circle cx="12" cy="12" r="9" stroke="url(#gradD)" stroke-width="2"/>
        <path d="M3 12 a9 9 0 0 1 18 0" fill="url(#gradD)" opacity="0.25"/>
        <circle cx="12" cy="12" r="2.5" fill="url(#gradD)"/>
      </svg>`,
  e: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradE" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <path d="M3 3 L12 3 L21 12 L12 21 L3 21 Z" fill="url(#gradE)"/>
        <path d="M8 8 L12 12 L8 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
  f: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradF" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <circle cx="7" cy="7" r="3" fill="url(#gradF)"/>
        <circle cx="17" cy="7" r="3" fill="url(#gradF)" opacity="0.6"/>
        <circle cx="7" cy="17" r="3" fill="url(#gradF)" opacity="0.6"/>
        <circle cx="17" cy="17" r="3" fill="url(#gradF)"/>
        <line x1="7" y1="7" x2="17" y2="17" stroke="url(#gradF)" stroke-width="1.4"/>
        <line x1="17" y1="7" x2="7" y2="17" stroke="url(#gradF)" stroke-width="1.4"/>
      </svg>`,
  g: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradG" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <path d="M3 21 L8 13 L13 17 L21 4" stroke="url(#gradG)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M3 21 L8 13 L13 17 L21 4 L21 21 Z" fill="url(#gradG)" opacity="0.22"/>
      </svg>`,
  h: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradH" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" stroke="url(#gradH)" stroke-width="2" fill="url(#gradH)" fill-opacity="0.18"/>
        <path d="M12 2 L12 12 L22 7 M12 12 L2 7 M12 12 L12 22" stroke="url(#gradH)" stroke-width="1.4" opacity="0.7"/>
      </svg>`,
  i: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradI" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <rect x="3" y="3" width="6" height="6" rx="1" fill="url(#gradI)"/>
        <rect x="11" y="3" width="6" height="6" rx="1" fill="url(#gradI)" opacity="0.35"/>
        <rect x="3" y="11" width="6" height="6" rx="1" fill="url(#gradI)" opacity="0.55"/>
        <rect x="11" y="11" width="6" height="6" rx="1" fill="url(#gradI)"/>
        <rect x="3" y="19" width="6" height="2" rx="1" fill="url(#gradI)" opacity="0.7"/>
        <rect x="11" y="19" width="6" height="2" rx="1" fill="url(#gradI)" opacity="0.3"/>
      </svg>`,
  j: `<svg viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="gradJ" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="var(--acc)"/><stop offset="100%" stop-color="var(--acc-3)"/></linearGradient></defs>
        <path d="M4 12 A8 8 0 1 1 20 12" stroke="url(#gradJ)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="4" cy="12" r="2" fill="url(#gradJ)"/>
        <circle cx="20" cy="12" r="2" fill="url(#gradJ)"/>
        <path d="M12 4 L12 18" stroke="url(#gradJ)" stroke-width="1.6" opacity="0.55"/>
        <circle cx="12" cy="18" r="2.5" fill="url(#gradJ)"/>
      </svg>`
};
function paintLogos(variant) {
  document.querySelectorAll('.logo-mark').forEach(el => {
    el.setAttribute('data-logo', variant);
    el.innerHTML = LOGO_SVGS[variant] || '';
  });
}

// ═══════════════════════════════════════════════════════════
// HERO TICKER — build items
// ═══════════════════════════════════════════════════════════
const TICKER = [
  { k: 'MRR',          v: '$412K',    d: '+4.8%', dir: 'up' },
  { k: 'Active seats', v: '10,284',   d: '+127',  dir: 'up' },
  { k: 'P95 render',   v: '42ms',     d: '−3ms',  dir: 'up' },
  { k: 'Charts/sec',   v: '1,842',    d: '+12%',  dir: 'up' },
  { k: 'Trial→Paid',   v: '32.4%',    d: '+2.1pp',dir: 'up' },
  { k: 'Queue',        v: '3 / 200',  d: 'ok',    dir: 'up' },
  { k: 'Uptime 7d',    v: '100%',     d: 'ok',    dir: 'up' },
  { k: 'Errors/1K',    v: '0.03',     d: '−0.01', dir: 'up' },
  { k: 'Signups/hr',   v: '48',       d: '+6',    dir: 'up' },
];
const tickerTrack = document.getElementById('tickerTrack');
const tickerHTML = [...TICKER, ...TICKER].map((t, i) => `
  <span class="tk-item">
    <span>${t.k}</span><span class="n">${t.v}</span><span class="${t.dir}">${t.d}</span>
    ${i < TICKER.length * 2 - 1 ? '<span class="sep"></span>' : ''}
  </span>`).join('');
tickerTrack.innerHTML = tickerHTML;

