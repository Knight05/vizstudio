
(function(){
  const svg = document.getElementById('spot-globe');
  if (!svg || !window.d3 || !window.topojson) return;

  const W = 360, H = 360, R = 140;
  const cx = W/2, cy = H/2;

  // Country sample data - ISO numeric id → {name, code, value}
  // Values represent "Total purchasers" in arbitrary units.
  const DATA = {
    840: {name:'United States', code:'US', value: 1240}, // US - top
    124: {name:'Canada',        code:'CA', value:  680},
    826: {name:'United Kingdom',code:'GB', value:  590},
    276: {name:'Germany',       code:'DE', value:  540},
    250: {name:'France',        code:'FR', value:  470},
    724: {name:'Spain',         code:'ES', value:  310},
    380: {name:'Italy',         code:'IT', value:  340},
    528: {name:'Netherlands',   code:'NL', value:  260},
    752: {name:'Sweden',        code:'SE', value:  220},
    578: {name:'Norway',        code:'NO', value:  180},
    616: {name:'Poland',        code:'PL', value:  150},
    792: {name:'Turkey',        code:'TR', value:  210},
    818: {name:'Egypt',         code:'EG', value:  130},
    710: {name:'South Africa',  code:'ZA', value:  170},
    566: {name:'Nigeria',       code:'NG', value:  120},
    404: {name:'Kenya',         code:'KE', value:   90},
    356: {name:'India',         code:'IN', value:  520},
    156: {name:'China',         code:'CN', value:  720},
    392: {name:'Japan',         code:'JP', value:  450},
    410: {name:'South Korea',   code:'KR', value:  330},
    36 : {name:'Australia',     code:'AU', value:  290},
    554: {name:'New Zealand',   code:'NZ', value:  140},
    76 : {name:'Brazil',        code:'BR', value:  480},
    32 : {name:'Argentina',     code:'AR', value:  210},
    484: {name:'Mexico',        code:'MX', value:  310},
    152: {name:'Chile',         code:'CL', value:  160},
    643: {name:'Russia',        code:'RU', value:  380},
    608: {name:'Philippines',   code:'PH', value:  200},
    360: {name:'Indonesia',     code:'ID', value:  280},
    764: {name:'Thailand',      code:'TH', value:  240},
    784: {name:'UAE',           code:'AE', value:  190}
  };

  // The story sequence: a series of top-region pin events. The globe
  // rotates smoothly to face each one and updates the badge + side pin.
  const STORY = [840, 826, 156, 76, 36, 276, 356, 710, 124];

  const projection = d3.geoOrthographic()
    .scale(R)
    .translate([cx, cy])
    .clipAngle(90)
    .precision(0.6);
  const path = d3.geoPath(projection);

  const gCountries  = d3.select('#globe-countries');
  const gGraticule  = d3.select('#globe-graticule');
  const badge       = d3.select('#globe-badge');
  const badgeChip   = d3.select('#globe-badge-chip');
  const badgeLine   = d3.select('#globe-badge-line');
  const badgeText   = d3.select('#globe-badge-text');
  const sidePinTop  = document.getElementById('globe-top-region');
  const sidePinVal  = document.getElementById('globe-top-value');

  // graticule (longitude/latitude lines)
  const graticule = d3.geoGraticule10();
  gGraticule.append('path').attr('d', path(graticule));

  let countriesSel;        // d3 selection of country paths
  let countriesFeatures;   // array of geojson features
  let topId = STORY[0];
  let storyIdx = 0;
  let rotationLambda = 0;  // around vertical axis
  let rotationPhi = -8;    // tilt
  let dragging = false;
  let prevTs = null;
  let centroidById = new Map();

  function fillClass(id, isTop) {
    const nid = +id;
    if (isTop) return 'country top';
    const d = DATA[nid];
    if (!d) return 'country';
    if (d.value >= 600)  return 'country high';
    if (d.value >= 300)  return 'country mid';
    if (d.value >= 100)  return 'country has-data';
    return 'country';
  }
  function refillCountries() {
    if (!countriesSel) return;
    countriesSel.attr('class', d => fillClass(d.id, +d.id === topId));
  }
  function redraw() {
    projection.rotate([rotationLambda, rotationPhi, 0]);
    if (countriesSel) countriesSel.attr('d', path);
    gGraticule.select('path').attr('d', path(graticule));
    updateBadge();
  }

  function updateBadge() {
    return; // badge removed - kept as no-op so callers stay simple
  }

  function setTop(id, animate) {
    topId = id;
    const top = DATA[id];
    if (!top) return;
    if (sidePinTop) sidePinTop.textContent = top.code;
    if (sidePinVal) sidePinVal.textContent = `${(top.value/1000).toFixed(2)}M`;
    refillCountries();
    if (animate) {
      const cent = centroidById.get(id);
      if (!cent) return;
      const [lon, lat] = cent;
      const targetLambda = -lon;
      const targetPhi    = Math.max(-50, Math.min(20, -lat));
      // shortest-path interpolate lambda
      let delta = ((targetLambda - rotationLambda + 540) % 360) - 180;
      const fromL = rotationLambda, fromP = rotationPhi;
      const dur = 1400;
      const t0 = performance.now();
      autopilot = true;
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const ease = 0.5 - 0.5*Math.cos(Math.PI*k);
        rotationLambda = fromL + delta * ease;
        rotationPhi    = fromP + (targetPhi - fromP) * ease;
        redraw();
        if (k < 1) requestAnimationFrame(step);
        else { autopilot = false; }
      }
      requestAnimationFrame(step);
    }
  }

  let autopilot = false;

  // Auto-rotation re-projects ~170 country polygons per frame, so it only runs
  // while the globe is on screen, and never for reduced-motion visitors.
  let onScreen = false;
  let ticking = false;
  let acc = 0;
  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ~30fps is indistinguishable at this rotation speed and halves the cost.
  const FRAME_MS = 33;

  // tick - auto-rotate (slow) when not dragging or auto-piloting
  function tick(ts) {
    if (!onScreen || reduceMotion) { ticking = false; prevTs = null; return; }
    if (prevTs == null) prevTs = ts;
    const dt = ts - prevTs;
    prevTs = ts;
    if (!dragging && !autopilot && !document.hidden) {
      acc += dt;
      if (acc >= FRAME_MS) {
        rotationLambda = (rotationLambda + acc * 0.018) % 360;
        acc = 0;
        redraw();
      }
    }
    requestAnimationFrame(tick);
  }

  function startTicking() {
    if (ticking || reduceMotion) return;
    ticking = true;
    prevTs = null;
    requestAnimationFrame(tick);
  }

  // drag interaction
  let dragStart = null;
  function onDown(e) {
    dragging = true;
    const pt = svgPoint(e);
    dragStart = { x: pt.x, y: pt.y, lam: rotationLambda, phi: rotationPhi };
  }
  function onMove(e) {
    if (!dragging || !dragStart) return;
    const pt = svgPoint(e);
    const dx = pt.x - dragStart.x;
    const dy = pt.y - dragStart.y;
    rotationLambda = dragStart.lam + dx * 0.4;
    rotationPhi    = Math.max(-80, Math.min(80, dragStart.phi + dy * 0.4));
    redraw();
  }
  function onUp() { dragging = false; dragStart = null; }
  function svgPoint(e) {
    const r = svg.getBoundingClientRect();
    const sx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const sy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: sx * (W / r.width), y: sy * (H / r.height) };
  }
  svg.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  svg.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onUp);

  // story cycle - every ~4.5s pan to the next top region
  function cycleStory() {
    storyIdx = (storyIdx + 1) % STORY.length;
    setTop(STORY[storyIdx], true);
  }

  // load world topo
  fetch('/vendor/world-atlas-countries-110m.json')
    .then(r => r.json())
    .then(world => {
      const countries = topojson.feature(world, world.objects.countries).features;
      countriesFeatures = countries;
      // build centroid lookup for known countries
      for (const f of countries) {
        if (DATA[+f.id]) centroidById.set(+f.id, d3.geoCentroid(f));
      }
      countriesSel = gCountries.selectAll('path')
        .data(countries)
        .enter().append('path')
        .attr('class', d => fillClass(d.id, +d.id === topId))
        .attr('d', path);

      // hover tooltip + country label
      const tip = document.getElementById('globe-tip');
      countriesSel
        .on('mousemove', function(event, d){
          const rec = DATA[+d.id];
          const r = svg.getBoundingClientRect();
          const bodyR = svg.parentElement.getBoundingClientRect();
          const lx = event.clientX - bodyR.left;
          const ly = event.clientY - bodyR.top;
          d3.select(this).classed('hovered', true);
          if (tip) {
            tip.style.left = lx + 'px';
            tip.style.top  = ly + 'px';
            if (rec) {
              tip.innerHTML = '<b>' + rec.name + '</b><br><span class="tv">' + rec.value.toLocaleString() + 'K</span> <span class="tn">purchasers</span>';
            } else {
              const nm = (d.properties && d.properties.name) ? d.properties.name : 'No data';
              tip.innerHTML = '<b>' + nm + '</b><br><span class="tn">no data</span>';
            }
            tip.classList.add('on');
          }
        })
        .on('mouseleave', function(){
          d3.select(this).classed('hovered', false);
          if (tip) tip.classList.remove('on');
        });

      setTop(topId, false);
      redraw();

      let storyTimer = null;
      const startStory = () => {
        if (storyTimer == null) {
          storyTimer = setInterval(() => { if (!dragging) cycleStory(); }, 4800);
        }
      };
      const stopStory = () => {
        if (storyTimer != null) { clearInterval(storyTimer); storyTimer = null; }
      };

      if (typeof IntersectionObserver !== 'undefined') {
        new IntersectionObserver((entries) => {
          onScreen = entries.some(e => e.isIntersecting);
          if (onScreen) { startTicking(); startStory(); } else { stopStory(); }
        }, { threshold: 0.01 }).observe(svg);
      } else {
        onScreen = true;
        startTicking();
        startStory();
      }

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && onScreen) startTicking();
      });
    })
    .catch(err => {
      console.warn('Globe data failed to load', err);
    });
})();
