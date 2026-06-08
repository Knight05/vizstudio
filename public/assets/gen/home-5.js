
// ─── Library category filter ────────────────────────────────
(function () {
  const wrap = document.getElementById('libFilter');
  const grid = document.getElementById('libGrid');
  if (!wrap || !grid) return;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    wrap.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    const cat = btn.dataset.cat;
    grid.querySelectorAll('.lib-tile').forEach(t => t.classList.toggle('is-hidden', cat !== 'all' && t.dataset.cat !== cat));
  });
})();

// ─── Live D3 showcase minis ─────────────────────────────────
(function () {
  if (!window.d3) return;
  const css = getComputedStyle(document.documentElement);
  const PAL = [css.getPropertyValue('--acc').trim() || '#6366f1',
               css.getPropertyValue('--acc-2').trim() || '#8b5cf6',
               css.getPropertyValue('--acc-3').trim() || '#ec4899',
               css.getPropertyValue('--acc-4').trim() || '#22d3ee'];
  const DIM = css.getPropertyValue('--muted').trim() || '#6b718a';
  function card(parent, title, tag) {
    const d = document.createElement('div');
    d.className = 'show-card';
    d.innerHTML = `<div class="title"><span>${title}</span><span class="dim">${tag}</span></div>`;
    const svg = d3.select(d).append('svg').attr('preserveAspectRatio', 'xMidYMid meet');
    parent.appendChild(d);
    return svg;
  }
  function size(svg) { const n = svg.node().getBoundingClientRect(); const W = Math.max(n.width, 120), H = Math.max(n.height, 120); svg.attr('viewBox', `0 0 ${W} ${H}`); return [W, H]; }
  const r1 = document.getElementById('showcase-1'), r2 = document.getElementById('showcase-2');
  if (!r1 || !r2) return;
  const builders = [];

  // 1 grouped bars
  builders.push([r1, 'Grouped bars', 'hover me', (svg, W, H) => {
    const data = [[34,52,41],[48,61,55],[42,38,66],[58,72,61],[30,49,44]];
    const x = d3.scaleBand().domain(d3.range(5)).range([6, W-6]).paddingInner(0.3);
    const xi = d3.scaleBand().domain(d3.range(3)).range([0, x.bandwidth()]).padding(0.12);
    const y = d3.scaleLinear().domain([0, 80]).range([H-8, 10]);
    const g = svg.append('g');
    data.forEach((grp, gi) => grp.forEach((v, si) => {
      g.append('rect').attr('x', x(gi) + xi(si)).attr('width', xi.bandwidth())
        .attr('y', y(0)).attr('height', 0).attr('rx', 2).attr('fill', PAL[si]).attr('opacity', 0.85)
        .on('pointerenter', function(){ d3.select(this).attr('opacity', 1); })
        .on('pointerleave', function(){ d3.select(this).attr('opacity', 0.85); })
        .transition().delay(gi*90+si*45).duration(700).ease(d3.easeCubicOut)
        .attr('y', y(v)).attr('height', y(0)-y(v));
    }));
  }]);
  // 2 area trend
  builders.push([r1, 'Area trend', 'animated', (svg, W, H) => {
    const pts = d3.range(24).map(i => 30 + Math.sin(i*0.55)*12 + i*1.4 + (i%5)*2);
    const x = d3.scaleLinear().domain([0,23]).range([4, W-4]);
    const y = d3.scaleLinear().domain([0, d3.max(pts)*1.15]).range([H-6, 8]);
    const lg = svg.append('defs').append('linearGradient').attr('id','scA').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',1);
    lg.append('stop').attr('offset','0%').attr('stop-color', PAL[0]).attr('stop-opacity',0.55);
    lg.append('stop').attr('offset','100%').attr('stop-color', PAL[0]).attr('stop-opacity',0.02);
    svg.append('path').datum(pts).attr('fill','url(#scA)')
      .attr('d', d3.area().x((d,i)=>x(i)).y0(H-6).y1(d=>y(d)).curve(d3.curveCatmullRom));
    const line = svg.append('path').datum(pts).attr('fill','none').attr('stroke', PAL[0]).attr('stroke-width',2)
      .attr('d', d3.line().x((d,i)=>x(i)).y(d=>y(d)).curve(d3.curveCatmullRom));
    const len = line.node().getTotalLength();
    line.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
      .transition().duration(1400).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);
  }]);
  // 3 donut
  builders.push([r1, 'Donut', 'click slices', (svg, W, H) => {
    const R = Math.min(W,H)/2 - 8, cx = W/2, cy = H/2;
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    const arcs = d3.pie().padAngle(0.03)([38, 26, 20, 16]);
    const arc = d3.arc().innerRadius(R*0.62).outerRadius(R).cornerRadius(3);
    const big = d3.arc().innerRadius(R*0.62).outerRadius(R+5).cornerRadius(3);
    g.selectAll('path').data(arcs).join('path').attr('fill', (d,i)=>PAL[i])
      .on('pointerenter', function(){ d3.select(this).transition().duration(150).attr('d', big); })
      .on('pointerleave', function(){ d3.select(this).transition().duration(150).attr('d', arc); })
      .transition().duration(900).ease(d3.easeCubicOut)
      .attrTween('d', d => { const it = d3.interpolate({startAngle:d.startAngle, endAngle:d.startAngle}, d); return t => arc(it(t)); });
    g.append('text').text('78').attr('text-anchor','middle').attr('dy','0.05em')
      .attr('fill', css.getPropertyValue('--text').trim()).style('font-weight',700).style('font-size', R*0.42+'px');
    g.append('text').text('charts').attr('text-anchor','middle').attr('dy', R*0.38)
      .attr('fill', DIM).style('font-size', R*0.16+'px');
  }]);
  // 4 calendar heat
  builders.push([r2, 'Calendar heat', '7×12 grid', (svg, W, H) => {
    const cols = 12, rows = 7, gap = 3;
    const cw = (W - 8 - gap*(cols-1)) / cols, ch = (H - 14 - gap*(rows-1)) / rows;
    const color = d3.scaleSequential(t => d3.interpolateRgb('#1c1f31', PAL[1])(t));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const v = Math.abs(Math.sin(c*1.7 + r*0.9)) * (0.4 + 0.6*Math.random());
      svg.append('rect').attr('x', 4 + c*(cw+gap)).attr('y', 8 + r*(ch+gap))
        .attr('width', cw).attr('height', ch).attr('rx', 2).attr('fill', color(0))
        .on('pointerenter', function(){ d3.select(this).attr('stroke', PAL[3]).attr('stroke-width', 1.5); })
        .on('pointerleave', function(){ d3.select(this).attr('stroke', 'none'); })
        .transition().delay((c*rows+r)*8).duration(500).attr('fill', color(v));
    }
  }]);
  // 5 scatter + fit
  builders.push([r2, 'Scatter + fit', '60 pts', (svg, W, H) => {
    const pts = d3.range(60).map(() => { const a = Math.random()*100; return [a, a*0.7 + (Math.random()-0.5)*38 + 18]; });
    const x = d3.scaleLinear().domain([0,100]).range([8, W-8]);
    const y = d3.scaleLinear().domain([0,120]).range([H-8, 8]);
    svg.append('line').attr('x1', x(0)).attr('y1', y(18)).attr('x2', x(100)).attr('y2', y(88))
      .attr('stroke', PAL[2]).attr('stroke-width', 1.5).attr('stroke-dasharray', '5 4').attr('opacity', 0.8);
    svg.selectAll('circle').data(pts).join('circle')
      .attr('cx', d=>x(d[0])).attr('cy', d=>y(d[1])).attr('r', 0)
      .attr('fill', PAL[0]).attr('opacity', 0.7)
      .on('pointerenter', function(){ d3.select(this).attr('fill', PAL[3]).attr('opacity', 1).attr('r', 6); })
      .on('pointerleave', function(){ d3.select(this).attr('fill', PAL[0]).attr('opacity', 0.7).attr('r', 3.5); })
      .transition().delay((d,i)=>i*14).duration(350).attr('r', 3.5);
  }]);
  // 6 streamgraph
  builders.push([r2, 'Streamgraph', 'wiggle', (svg, W, H) => {
    const n = 28, k = 4;
    const series = d3.stack().keys(d3.range(k)).offset(d3.stackOffsetWiggle).order(d3.stackOrderInsideOut)(
      d3.range(n).map(i => Object.fromEntries(d3.range(k).map(j => [j, 4 + Math.abs(Math.sin(i*0.4 + j*1.8))*14 + Math.random()*3]))));
    const x = d3.scaleLinear().domain([0, n-1]).range([0, W]);
    const y = d3.scaleLinear().domain([d3.min(series, s=>d3.min(s, d=>d[0])), d3.max(series, s=>d3.max(s, d=>d[1]))]).range([H-4, 4]);
    svg.selectAll('path').data(series).join('path')
      .attr('fill', (d,i)=>PAL[i]).attr('opacity', 0.75)
      .on('pointerenter', function(){ d3.select(this).attr('opacity', 1); })
      .on('pointerleave', function(){ d3.select(this).attr('opacity', 0.75); })
      .attr('d', d3.area().x((d,i)=>x(i)).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveBasis));
  }]);
  // 7 radial bars
  builders.push([r2, 'Radial bars', '12 spokes', (svg, W, H) => {
    const R = Math.min(W,H)/2 - 6, cx = W/2, cy = H/2, inner = R*0.25;
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    const vals = d3.range(12).map(i => 0.3 + Math.abs(Math.sin(i*1.1))*0.7);
    const a = d3.scaleBand().domain(d3.range(12)).range([0, 2*Math.PI]).padding(0.18);
    g.selectAll('path').data(vals).join('path')
      .attr('fill', (d,i)=>PAL[i%4]).attr('opacity', 0.85)
      .on('pointerenter', function(){ d3.select(this).attr('opacity', 1); })
      .on('pointerleave', function(){ d3.select(this).attr('opacity', 0.85); })
      .transition().delay((d,i)=>i*60).duration(700).ease(d3.easeCubicOut)
      .attrTween('d', (d,i) => { const it = d3.interpolate(inner, inner + (R-inner)*d);
        return t => d3.arc().innerRadius(inner).outerRadius(it(t)).startAngle(a(i)).endAngle(a(i)+a.bandwidth()).cornerRadius(2)(); });
  }]);
  const seen = new WeakSet();
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting || seen.has(e.target)) return;
    seen.add(e.target);
    const b = e.target.__build; const svg = e.target.__svg;
    const [W, H] = size(svg); b(svg, W, H); io.unobserve(e.target);
  }), { threshold: 0.25 });
  builders.forEach(([row, title, tag, build]) => {
    const svg = card(row, title, tag);
    const el = svg.node().parentElement;
    el.__build = build; el.__svg = svg;
    io.observe(el);
  });
})();
