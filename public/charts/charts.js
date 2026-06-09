// ─────────────────────────────────────────────────────────────
// vizstudio.io - live chart renderers for detail pages
// ─────────────────────────────────────────────────────────────
// Each function takes { mount, width, height, data? } and renders
// directly into the mount element. Color palette is OKLCH-based
// for perceptual uniformity.
//
// This file covers a curated set of "hero" chart types. The other
// 100+ charts fall back to a clean placeholder in <LiveChart/>,
// which is the expected state until the full runtime ships.
// ─────────────────────────────────────────────────────────────

window.CHARTS = (function () {
  const PALETTE = [
    "oklch(0.78 0.18 145)",
    "oklch(0.72 0.17 240)",
    "oklch(0.80 0.16 75)",
    "oklch(0.70 0.17 295)",
    "oklch(0.72 0.17 15)",
    "oklch(0.70 0.15 190)",
  ];
  const M = { top: 20, right: 24, bottom: 36, left: 48 };

  function setup({ mount, width, height }) {
    mount.innerHTML = "";
    const svg = d3
      .select(mount)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("font-family", "var(--mono)")
      .style("font-size", "10px");
    return svg;
  }

  function addAxisStyle(svg) {
    svg.selectAll(".axis text").attr("fill", "var(--text-dim)");
    svg.selectAll(".axis line, .axis path").attr("stroke", "var(--border)");
    svg.selectAll(".gridline")
      .attr("stroke", "var(--border)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2,3");
  }

  function bar(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["bar-chart"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.feature))
      .range([M.left, W - M.right])
      .padding(0.22);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.users) * 1.1])
      .nice()
      .range([H - M.bottom, M.top]);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${M.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-(W - M.left - M.right))
          .tickFormat(d3.format(".2s")),
      )
      .selectAll(".tick line")
      .attr("class", "gridline");

    svg
      .selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.feature))
      .attr("y", H - M.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", PALETTE[0])
      .attr("rx", 2)
      .transition()
      .duration(650)
      .delay((_, i) => i * 35)
      .attr("y", (d) => y(d.users))
      .attr("height", (d) => H - M.bottom - y(d.users));

    addAxisStyle(svg);
  }

  function line(ctx) {
    const data = (ctx.data || window.VZ_SAMPLE["line-chart"]).map((d) => ({
      ...d,
      date: new Date(d.date),
    }));
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([M.left, W - M.right]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue) * 1.1])
      .range([H - M.bottom, M.top]);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x).ticks(6));
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${M.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-(W - M.left - M.right))
          .tickFormat(d3.format("~s")),
      )
      .selectAll(".tick line")
      .attr("class", "gridline");

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(H - M.bottom)
      .y1((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    const l = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    const grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "lg")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 1);
    grad.append("stop").attr("offset", "0%").attr("stop-color", PALETTE[1]).attr("stop-opacity", 0.35);
    grad.append("stop").attr("offset", "100%").attr("stop-color", PALETTE[1]).attr("stop-opacity", 0);

    svg.append("path").datum(data).attr("fill", "url(#lg)").attr("d", area);
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", PALETTE[1])
      .attr("stroke-width", 2)
      .attr("d", l);

    addAxisStyle(svg);
  }

  function area(ctx) {
    // Reuse line renderer but using "area-chart" sample
    const d = (ctx.data || window.VZ_SAMPLE["area-chart"]).map((r) => ({
      date: new Date(r.date),
      revenue: r.active,
    }));
    line({ ...ctx, data: d });
  }

  function stackedBar(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["stacked-bar"];
    const keys = Object.keys(data[0]).filter((k) => k !== "q");
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;

    const stacked = d3.stack().keys(keys)(data);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.q))
      .range([M.left, W - M.right])
      .padding(0.3);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(stacked[stacked.length - 1], (d) => d[1]) * 1.1])
      .nice()
      .range([H - M.bottom, M.top]);
    const color = d3.scaleOrdinal().domain(keys).range(PALETTE);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${M.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-(W - M.left - M.right))
          .tickFormat(d3.format("~s")),
      )
      .selectAll(".tick line")
      .attr("class", "gridline");

    svg
      .append("g")
      .selectAll("g")
      .data(stacked)
      .enter()
      .append("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.data.q))
      .attr("width", x.bandwidth())
      .attr("y", H - M.bottom)
      .attr("height", 0)
      .attr("rx", 1.5)
      .transition()
      .duration(650)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]));

    addAxisStyle(svg);
  }

  function pie(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["pie-chart"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const r = Math.min(W, H) / 2 - 30;
    const g = svg.append("g").attr("transform", `translate(${W / 2},${H / 2})`);
    const arcs = d3.pie().value((d) => d.value).sort(null)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(r);
    const labelArc = d3.arc().innerRadius(r * 0.55).outerRadius(r * 0.55);

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("fill", (_, i) => PALETTE[i % PALETTE.length])
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .each(function (d) { this._current = { startAngle: 0, endAngle: 0 }; })
      .transition()
      .duration(700)
      .attrTween("d", function (d) {
        const i = d3.interpolate(this._current, d);
        this._current = i(1);
        return (t) => arc(i(t));
      });

    g.selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "oklch(0.18 0.01 260)")
      .attr("font-weight", 600)
      .attr("font-size", 11)
      .style("opacity", 0)
      .text((d) => `${d.data.label} ${d.data.value}%`)
      .transition()
      .delay(600)
      .style("opacity", 1);
  }

  function donut(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["donut-chart"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const r = Math.min(W, H) / 2 - 30;
    const g = svg.append("g").attr("transform", `translate(${W / 2},${H / 2})`);
    const arcs = d3.pie().value((d) => d.value).sort(null)(data);
    const arc = d3.arc().innerRadius(r * 0.58).outerRadius(r);

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("fill", (_, i) => PALETTE[i])
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5)
      .attr("d", arc);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text)")
      .attr("font-family", "var(--mono)")
      .attr("font-size", 28)
      .attr("font-weight", 600)
      .attr("y", 4)
      .text(d3.sum(data, (d) => d.value).toLocaleString());
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted)")
      .attr("font-size", 10)
      .attr("letter-spacing", "0.12em")
      .attr("y", 22)
      .text("TOTAL");
  }

  function scatter(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["scatter-plot"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const x = d3.scaleLinear().domain([0, 100]).range([M.left, W - M.right]);
    const y = d3.scaleLinear().domain([0, 100]).range([H - M.bottom, M.top]);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x).ticks(6));
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${M.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-(W - M.left - M.right)),
      )
      .selectAll(".tick line")
      .attr("class", "gridline");

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", H - M.bottom)
      .attr("r", 0)
      .attr("fill", (_, i) => PALETTE[i % PALETTE.length])
      .attr("opacity", 0.7)
      .transition()
      .duration(700)
      .delay((_, i) => i * 4)
      .attr("cy", (d) => y(d.y))
      .attr("r", (d) => d.r / 1.5);

    addAxisStyle(svg);
  }

  function heatmap(ctx) {
    const data = ctx.data || window.VZ_SAMPLE["heatmap"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const xS = d3
      .scaleBand()
      .domain(d3.range(24))
      .range([M.left, W - M.right])
      .padding(0.05);
    const yS = d3.scaleBand().domain(d3.range(7)).range([M.top, H - M.bottom]).padding(0.05);
    const col = d3.scaleSequential(d3.interpolateViridis).domain([0, 130]);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xS(d.hour))
      .attr("y", (d) => yS(d.day))
      .attr("width", xS.bandwidth())
      .attr("height", yS.bandwidth())
      .attr("fill", "var(--bg-1)")
      .attr("rx", 2)
      .transition()
      .duration(650)
      .delay((d) => d.hour * 8 + d.day * 20)
      .attr("fill", (d) => col(d.v));

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${M.left - 6},0)`)
      .selectAll("text")
      .data(days)
      .enter()
      .append("text")
      .attr("y", (_, i) => yS(i) + yS.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "var(--text-dim)")
      .text((d) => d);
  }

  function treemap(ctx) {
    const raw = ctx.data || window.VZ_SAMPLE["treemap-chart"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const root = d3.hierarchy(raw).sum((d) => d.value);
    d3.treemap().size([W, H]).padding(3)(root);

    const nodes = svg
      .selectAll("g.cell")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("rx", 3)
      .attr("fill", (_, i) => PALETTE[i % PALETTE.length])
      .transition()
      .duration(600)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    nodes
      .append("text")
      .attr("x", 8)
      .attr("y", 18)
      .attr("fill", "oklch(0.18 0.01 260)")
      .attr("font-weight", 600)
      .attr("font-size", 11)
      .text((d) => d.data.name)
      .style("opacity", 0)
      .transition()
      .delay(500)
      .style("opacity", 1);
    nodes
      .append("text")
      .attr("x", 8)
      .attr("y", 32)
      .attr("fill", "oklch(0.18 0.01 260)")
      .attr("opacity", 0.7)
      .attr("font-size", 10)
      .text((d) => `$${d.value.toLocaleString()}`)
      .style("opacity", 0)
      .transition()
      .delay(600)
      .style("opacity", 0.8);
  }

  function kpi(ctx) {
    const d = ctx.data || window.VZ_SAMPLE["kpi-card"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const g = svg.append("g").attr("transform", `translate(${W / 2},${H / 2 - 20})`);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted)")
      .attr("font-size", 10)
      .attr("letter-spacing", "0.14em")
      .attr("y", -40)
      .text(d.label.toUpperCase());

    const t = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text)")
      .attr("font-family", "var(--mono)")
      .attr("font-size", 58)
      .attr("font-weight", 700)
      .attr("y", 10);
    const final = d.value;
    t.transition()
      .duration(1100)
      .tween("text", function () {
        const i = d3.interpolateNumber(0, final);
        return function (tt) {
          this.textContent = `${d.unit || ""}${Math.round(i(tt)).toLocaleString()}`;
        };
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 44)
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", d.delta >= 0 ? "oklch(0.78 0.18 145)" : "oklch(0.72 0.17 15)")
      .text(`${d.delta >= 0 ? "▲" : "▼"} ${(Math.abs(d.delta) * 100).toFixed(1)}% MoM`);
  }

  function sankey(ctx) {
    // Sankey needs d3-sankey which we don't load here; render a simplified flow.
    const graph = ctx.data || window.VZ_SAMPLE["sankey-diagram"];
    const svg = setup(ctx);
    const { width: W, height: H } = ctx;
    const colsCount = 3;
    const colNodes = [[], [], []];
    const colMap = { 0: 0, 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 };
    graph.nodes.forEach((n, i) => colNodes[colMap[i]].push({ name: n.name, idx: i }));

    const colX = d3
      .scaleLinear()
      .domain([0, colsCount - 1])
      .range([M.left + 40, W - M.right - 40]);

    colNodes.forEach((col, ci) => {
      const step = (H - M.top - M.bottom) / (col.length + 1);
      col.forEach((n, ri) => {
        n.x = colX(ci);
        n.y = M.top + step * (ri + 1);
      });
    });
    const idxToNode = {};
    colNodes.flat().forEach((n) => (idxToNode[n.idx] = n));

    // Links
    svg
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("stroke", (_, i) => PALETTE[i % PALETTE.length])
      .attr("stroke-opacity", 0.4)
      .attr("fill", "none")
      .attr("stroke-width", (d) => Math.max(3, d.value / 25))
      .attr("d", (d) => {
        const s = idxToNode[d.source];
        const t = idxToNode[d.target];
        const mx = (s.x + t.x) / 2;
        return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
      });

    // Nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(colNodes.flat())
      .enter()
      .append("g");
    node
      .append("rect")
      .attr("x", (d) => d.x - 8)
      .attr("y", (d) => d.y - 14)
      .attr("width", 16)
      .attr("height", 28)
      .attr("rx", 3)
      .attr("fill", (_, i) => PALETTE[i % PALETTE.length]);
    node
      .append("text")
      .attr("x", (d) => d.x + 14)
      .attr("y", (d) => d.y + 4)
      .attr("fill", "var(--text-dim)")
      .attr("font-size", 11)
      .text((d) => d.name);
  }

  // Map: chart slug → renderer.
  // Several manifest slugs share a visual family (e.g. all bar variants
  // get the `bar` demo). Unknown slugs fall through to the LiveChart
  // placeholder.
  const MAP = {
    "bar-chart": bar,
    "bar": bar,
    "horizontal-bar": bar,
    "stacked-bar": stackedBar,
    "grouped-bar": stackedBar,
    "line-chart": line,
    "line": line,
    "multiline": line,
    "area-chart": area,
    "area": area,
    "stream": area,
    "pie-chart": pie,
    "pie": pie,
    "donut-chart": donut,
    "donut": donut,
    "scatter-plot": scatter,
    "scatter": scatter,
    "bubble-viz": scatter,
    "heatmap": heatmap,
    "calendar-heatmap": heatmap,
    "treemap-chart": treemap,
    "treemap": treemap,
    "kpi-card": kpi,
    "kpi": kpi,
    "sankey-diagram": sankey,
    "sankey": sankey,
    "alluvial-viz": sankey,
  };

  return MAP;
})();
