// vizstudio.io - lightweight inline D3 sample renderers per chart-page
// Each preview is a small, deliberately decorative SVG generated from a tiny
// sample dataset. They give the page a "this is what it looks like" hero
// without requiring the actual Data Studio script.

(function () {
  const wrap = document.getElementById('preview-svg');
  if (!wrap) return;
  const id = document.body.dataset.chartId;
  const w = 720, h = 420;
  const pad = 28;
  const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#22d3ee', '#a3e635', '#f59e0b', '#10b981', '#f97316'];

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('preview-svg');
  wrap.appendChild(svg);

  const el = (name, attrs = {}, parent = svg) => {
    const e = document.createElementNS(ns, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };

  const rand = (seed) => {
    let x = seed || 1;
    return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  };
  const r = rand(id ? id.charCodeAt(0) + (id.charCodeAt(id.length - 1) || 1) : 7);

  // ── chart-type renderers ─────────────────────────────────────────────
  const TYPE_MAP = {
    // bars / columns
    bar: ['simplecol-viz','groupedbar-viz','stackedbar-viz','stackedneg-viz','stackedneg-animated-viz','mirrorbar-viz','variancebar-viz','revenuebreakdown-viz','cashflow-viz','barrace-viz','curvedcol-animated-viz','curvedcol-static-viz','abtest-viz','tornado-viz','windrose-viz','pareto-viz','pyramidarea-viz'],
    line: ['timeseries-viz','yoyline-viz','bump-viz','stackedarea-viz','streamgraph-viz','streamwave-viz','dualaxis-viz','breakeven-viz'],
    pie:  ['dualdonut-viz','multiring-viz','semicirclepie-viz','varradiuspie-viz','vardonut-viz','analystratings-viz','progresscircles-viz','solidgauge-viz','semicirclegauge-viz'],
    scat: ['bubble-viz','bubblemap-viz','bubblegrid','quadrant-viz','scattertrend-viz','beeswarm-viz','hexbin-viz','hexbindensity-viz','qq-viz'],
    heat: ['convheatmap-viz','engageheatmap-viz','calendarHeatmap','bigcalendar-viz','choropleth-viz','smallmultiples-viz'],
    flow: ['chord-viz','depwheel-viz','arcdiagram-viz','forcenet-viz','bipartite-viz','matrixchart-viz','parallelsets-viz','parallelcoords-viz','sankey-viz','trafficsrc-viz','storyflow-viz','connmap-viz','flowmap-viz','radialtree-viz','oppositediagram'],
    map:  ['interactiveGlobe-viz'],
    tree: ['slicedice-viz','treemapzoom-viz','sunburstChart'],
    misc: ['waffle-viz','dumbbell-viz','lollipopchart','bulletchart-viz','radartable-viz','earningsdot-viz','kpisparkline-viz','wordcloud-viz','datatable-viz','resgant-viz','trafficlight-viz','portfoliobarcode-viz','portfoliopiebarcode-viz','verticalprogress-viz','audioverlap-viz'],
  };
  let kind = 'bar';
  for (const k in TYPE_MAP) if (TYPE_MAP[k].includes(id)) { kind = k; break; }

  const drawGrid = () => {
    for (let i = 1; i < 5; i++) {
      el('line', { x1: pad, x2: w - pad, y1: pad + i * (h - pad * 2) / 5, y2: pad + i * (h - pad * 2) / 5, stroke: '#1f2330', 'stroke-width': 1, 'stroke-dasharray': '2,4' });
    }
  };

  if (kind === 'bar') {
    drawGrid();
    const n = 9;
    const bw = (w - pad * 2) / n - 8;
    for (let i = 0; i < n; i++) {
      const v = 0.25 + r() * 0.7;
      const bh = v * (h - pad * 2 - 30);
      const x = pad + i * (bw + 8);
      const y = h - pad - bh;
      const grad = `g${i}`;
      const d = el('defs');
      const lg = el('linearGradient', { id: grad, x1: '0', y1: '0', x2: '0', y2: '1' }, d);
      el('stop', { offset: '0%', 'stop-color': palette[i % palette.length], 'stop-opacity': '0.95' }, lg);
      el('stop', { offset: '100%', 'stop-color': palette[i % palette.length], 'stop-opacity': '0.45' }, lg);
      el('rect', { x, y, width: bw, height: bh, fill: `url(#${grad})`, rx: 3 });
    }
  } else if (kind === 'line') {
    drawGrid();
    for (let s = 0; s < 2; s++) {
      const pts = [];
      let y = 0.4 + r() * 0.2;
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        y += (r() - 0.5) * 0.12;
        y = Math.max(0.1, Math.min(0.9, y));
        const px = pad + (i / steps) * (w - pad * 2);
        const py = pad + (1 - y) * (h - pad * 2);
        pts.push([px, py]);
      }
      // area
      const apath = `M${pts[0][0]},${h - pad} L` + pts.map(p => p.join(',')).join(' L') + ` L${pts[pts.length - 1][0]},${h - pad} Z`;
      el('path', { d: apath, fill: palette[s], opacity: '0.16' });
      const lpath = `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]},${p[1]}`).join(' ');
      el('path', { d: lpath, fill: 'none', stroke: palette[s], 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      pts.forEach((p, i) => i % 4 === 0 && el('circle', { cx: p[0], cy: p[1], r: 3, fill: palette[s] }));
    }
  } else if (kind === 'pie') {
    const cx = w / 2, cy = h / 2 + 8, rOut = 140, rIn = 70;
    const parts = [0.32, 0.24, 0.18, 0.14, 0.08, 0.04];
    let a0 = -Math.PI / 2;
    parts.forEach((p, i) => {
      const a1 = a0 + p * Math.PI * 2;
      const large = p > 0.5 ? 1 : 0;
      const x1 = cx + rOut * Math.cos(a0), y1 = cy + rOut * Math.sin(a0);
      const x2 = cx + rOut * Math.cos(a1), y2 = cy + rOut * Math.sin(a1);
      const x3 = cx + rIn * Math.cos(a1), y3 = cy + rIn * Math.sin(a1);
      const x4 = cx + rIn * Math.cos(a0), y4 = cy + rIn * Math.sin(a0);
      const d = `M${x1},${y1} A${rOut},${rOut} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 ${large} 0 ${x4},${y4} Z`;
      el('path', { d, fill: palette[i % palette.length], opacity: 0.92 - i * 0.06 });
      a0 = a1;
    });
    el('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', fill: '#eef0f7', 'font-family': "'Bricolage Grotesque', sans-serif", 'font-weight': '700', 'font-size': '32' }).textContent = '74';
    el('text', { x: cx, y: cy + 26, 'text-anchor': 'middle', fill: '#9aa0b4', 'font-family': "'JetBrains Mono', monospace", 'font-size': '11' }).textContent = 'CHARTS';
  } else if (kind === 'scat') {
    drawGrid();
    for (let i = 0; i < 80; i++) {
      const x = pad + r() * (w - pad * 2);
      const y = pad + r() * (h - pad * 2);
      const rad = 3 + r() * 9;
      const col = palette[Math.floor(r() * palette.length)];
      el('circle', { cx: x, cy: y, r: rad, fill: col, opacity: 0.55 });
    }
  } else if (kind === 'heat') {
    const cols = 16, rows = 7;
    const cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const v = r();
      const c = palette[2]; // base
      el('rect', { x: pad + j * cw + 1, y: pad + i * ch + 1, width: cw - 2, height: ch - 2, fill: c, opacity: 0.15 + v * 0.85, rx: 2 });
    }
  } else if (kind === 'flow' || kind === 'map') {
    // chord / network - circular nodes + arcs
    const cx = w / 2, cy = h / 2, R = 150;
    const n = 8;
    const nodes = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), c: palette[i % palette.length] });
    }
    for (let i = 0; i < 14; i++) {
      const a = nodes[Math.floor(r() * n)];
      const b = nodes[Math.floor(r() * n)];
      if (a === b) continue;
      el('path', { d: `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`, fill: 'none', stroke: a.c, 'stroke-width': 1 + r() * 3, opacity: 0.5 });
    }
    nodes.forEach(p => el('circle', { cx: p.x, cy: p.y, r: 9, fill: p.c, stroke: '#0a0b14', 'stroke-width': 2 }));
  } else if (kind === 'tree') {
    // treemap
    const rects = [
      [pad, pad, 320, 240, 0],
      [pad + 322, pad, 200, 140, 1],
      [pad + 322, pad + 142, 200, 98, 2],
      [pad, pad + 242, 160, 130, 3],
      [pad + 162, pad + 242, 160, 130, 4],
      [pad + 324, pad + 242, 198, 130, 5],
    ];
    rects.forEach(([x, y, ww, hh, i]) => {
      el('rect', { x, y, width: ww, height: hh, fill: palette[i % palette.length], opacity: 0.85 - i * 0.08, rx: 4 });
    });
  } else {
    // misc: KPI cards
    drawGrid();
    for (let i = 0; i < 4; i++) {
      const cw = (w - pad * 2) / 4 - 12;
      const x = pad + i * (cw + 12);
      el('rect', { x, y: pad + 40, width: cw, height: h - pad * 2 - 80, rx: 8, fill: palette[i % palette.length], opacity: 0.18 });
      el('text', { x: x + 16, y: pad + 80, fill: '#9aa0b4', 'font-family': "'JetBrains Mono', monospace", 'font-size': '10' }).textContent = 'METRIC ' + (i + 1);
      el('text', { x: x + 16, y: pad + 130, fill: '#eef0f7', 'font-family': "'Bricolage Grotesque', sans-serif", 'font-weight': '700', 'font-size': '36' }).textContent = Math.floor(40 + r() * 600).toLocaleString();
    }
  }
})();
