// vizstudio.io — landing-page interactions
(function () {
  // ── count-up stats ──
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      el.textContent = (v >= 10000 ? Math.round(v).toLocaleString() : (target >= 100 ? Math.round(v) : v.toFixed(1))) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = (target >= 10000 ? target.toLocaleString() : target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.dataset.done) {
          animateCount(e.target);
          e.target.dataset.done = '1';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach((c) => io.observe(c));
  }

  // ── pricing toggle ──
  const toggle = document.getElementById('lp-price-toggle');
  if (toggle) {
    const buttons = toggle.querySelectorAll('button');
    const grid = document.getElementById('lp-price-grid');
    buttons.forEach((b) => {
      b.addEventListener('click', () => {
        buttons.forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        const p = b.dataset.p;
        toggle.classList.toggle('annual', p === 'annual');
        if (grid) grid.dataset.period = p;
        // swap text
        document.querySelectorAll('.val-monthly').forEach((el) => el.style.display = p === 'monthly' ? '' : 'none');
        document.querySelectorAll('.val-annual').forEach((el) => el.style.display = p === 'annual' ? '' : 'none');
        document.querySelectorAll('.period-monthly').forEach((el) => el.style.display = p === 'monthly' ? '' : 'none');
        document.querySelectorAll('.period-annual').forEach((el) => el.style.display = p === 'annual' ? '' : 'none');
      });
    });
    // init
    document.querySelectorAll('.val-annual,.period-annual').forEach((el) => el.style.display = 'none');
  }

  // ── testimonial carousel ──
  const tdots = document.querySelectorAll('#lp-tdots button');
  const tquotes = document.querySelectorAll('.lp-tquote');
  let activeT = 0;
  const setT = (i) => {
    tquotes.forEach((q, j) => q.classList.toggle('on', i === j));
    tdots.forEach((d, j) => d.classList.toggle('on', i === j));
    activeT = i;
  };
  tdots.forEach((d) => d.addEventListener('click', () => setT(parseInt(d.dataset.i, 10))));
  if (tquotes.length > 1) setInterval(() => setT((activeT + 1) % tquotes.length), 5500);

  // ── library filter ──
  const filterBtns = document.querySelectorAll('.lp-lib-filter [data-cat]');
  const libTiles = document.querySelectorAll('.lp-lib-tile[data-cat]');
  filterBtns.forEach((b) => {
    b.addEventListener('click', () => {
      filterBtns.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      const c = b.dataset.cat;
      libTiles.forEach((t) => {
        t.style.display = (c === 'all' || t.dataset.cat === c) ? '' : 'none';
      });
    });
  });

  // ── search ──
  const q = document.getElementById('lp-q');
  if (q) {
    q.addEventListener('input', () => {
      const v = q.value.trim().toLowerCase();
      libTiles.forEach((t) => {
        const n = (t.dataset.name || '').toLowerCase();
        const tag = (t.dataset.desc || '').toLowerCase();
        t.style.display = (!v || n.includes(v) || tag.includes(v)) ? '' : 'none';
      });
    });
  }

  // ── inject dashboard mini-charts (decorative SVG) ──
  const ns = 'http://www.w3.org/2000/svg';
  const grad = (id, c1, c2) => {
    const def = document.createElementNS(ns, 'defs');
    const lg = document.createElementNS(ns, 'linearGradient');
    lg.setAttribute('id', id); lg.setAttribute('x1', 0); lg.setAttribute('y1', 0); lg.setAttribute('x2', 0); lg.setAttribute('y2', 1);
    const s1 = document.createElementNS(ns, 'stop'); s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', c1); s1.setAttribute('stop-opacity', '0.9');
    const s2 = document.createElementNS(ns, 'stop'); s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', c2); s2.setAttribute('stop-opacity', '0.1');
    lg.append(s1, s2); def.append(lg); return def;
  };

  // Hero dashboard: bar+line
  const main = document.getElementById('hd-main');
  if (main) {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 320 160');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.append(grad('hgmain', '#6366f1', '#0a0b14'));
    const vals = [40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 90, 110];
    const max = Math.max(...vals);
    vals.forEach((v, i) => {
      const bw = 320 / vals.length - 4;
      const x = i * (bw + 4) + 2;
      const bh = (v / max) * 130;
      const y = 145 - bh;
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', bw); r.setAttribute('height', bh); r.setAttribute('rx', '2');
      r.setAttribute('fill', 'url(#hgmain)');
      svg.append(r);
    });
    // line over
    let path = '';
    vals.forEach((v, i) => {
      const bw = 320 / vals.length;
      const x = i * bw + bw / 2;
      const y = 145 - (v / max) * 130 - 6;
      path += (i ? 'L' : 'M') + x + ',' + y + ' ';
    });
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path); p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#ec4899'); p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    svg.append(p);
    main.append(svg);
  }

  // donut
  const donut = document.getElementById('hd-donut');
  if (donut) {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    const segs = [{ v: 0.42, c: '#6366f1' }, { v: 0.28, c: '#8b5cf6' }, { v: 0.18, c: '#ec4899' }, { v: 0.12, c: '#22d3ee' }];
    let a0 = -Math.PI / 2;
    const cx = 30, cy = 30, rOut = 26, rIn = 16;
    segs.forEach((s) => {
      const a1 = a0 + s.v * Math.PI * 2;
      const x1 = cx + rOut * Math.cos(a0), y1 = cy + rOut * Math.sin(a0);
      const x2 = cx + rOut * Math.cos(a1), y2 = cy + rOut * Math.sin(a1);
      const x3 = cx + rIn * Math.cos(a1), y3 = cy + rIn * Math.sin(a1);
      const x4 = cx + rIn * Math.cos(a0), y4 = cy + rIn * Math.sin(a0);
      const d = `M${x1},${y1} A${rOut},${rOut} 0 0 1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 0 0 ${x4},${y4} Z`;
      const pe = document.createElementNS(ns, 'path');
      pe.setAttribute('d', d); pe.setAttribute('fill', s.c);
      svg.append(pe);
      a0 = a1;
    });
    donut.append(svg);
  }

  // sparkline
  const spark = document.getElementById('hd-spark');
  if (spark) {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 320 60');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.append(grad('gspark', '#22d3ee', '#0a0b14'));
    const pts = [];
    let y = 30;
    for (let i = 0; i < 40; i++) {
      y += (Math.random() - 0.45) * 8; y = Math.max(8, Math.min(50, y));
      pts.push([(i / 39) * 320, y]);
    }
    const linePath = 'M' + pts.map(p => p.join(',')).join(' L');
    const areaPath = `M${pts[0][0]},60 L` + pts.map(p => p.join(',')).join(' L') + ` L${pts[pts.length-1][0]},60 Z`;
    const a = document.createElementNS(ns, 'path');
    a.setAttribute('d', areaPath); a.setAttribute('fill', 'url(#gspark)');
    const l = document.createElementNS(ns, 'path');
    l.setAttribute('d', linePath); l.setAttribute('fill', 'none'); l.setAttribute('stroke', '#22d3ee'); l.setAttribute('stroke-width', '1.6'); l.setAttribute('stroke-linecap', 'round'); l.setAttribute('stroke-linejoin', 'round');
    svg.append(a); svg.append(l);
    spark.append(svg);
  }
})();
