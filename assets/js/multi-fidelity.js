(function () {
  const svg = document.getElementById("mf-chart");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const plot = { left: 82, top: 50, width: 830, height: 430 };
  const controls = {
    caseCount: document.getElementById("case-count"),
    designPoints: document.getElementById("design-points"),
    designIters: document.getElementById("design-iters"),
    cfdScale: document.getElementById("cfd-scale"),
    trainingCost: document.getElementById("training-cost"),
    mfSolveCost: document.getElementById("mf-solve-cost"),
  };
  const outputs = {
    caseCount: document.getElementById("case-count-out"),
    designPoints: document.getElementById("design-points-out"),
    designIters: document.getElementById("design-iters-out"),
    cfdScale: document.getElementById("cfd-scale-out"),
    trainingCost: document.getElementById("training-cost-out"),
    mfSolveCost: document.getElementById("mf-solve-cost-out"),
    region: document.getElementById("region-pill"),
    complexity: document.getElementById("summary-complexity"),
    bep: document.getElementById("summary-bep"),
    cfd: document.getElementById("summary-cfd"),
    mf: document.getElementById("summary-mf"),
    delta: document.getElementById("summary-delta"),
    required: document.getElementById("summary-required"),
    conclusion: document.getElementById("conclusion"),
  };

  function fmt(value, digits) {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: digits == null ? 0 : digits,
      minimumFractionDigits: digits || 0,
    });
  }

  function make(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    (parent || svg).appendChild(node);
    return node;
  }

  function text(x, y, value, attrs, parent) {
    const node = make("text", Object.assign({ x, y, fill: "#182131", "font-size": "14" }, attrs || {}), parent);
    node.textContent = value;
    return node;
  }

  function state() {
    const caseCount = Number(controls.caseCount.value);
    const designPoints = Number(controls.designPoints.value);
    const designIters = Number(controls.designIters.value);
    const cfdScale = Number(controls.cfdScale.value);
    const trainingCost = Number(controls.trainingCost.value) * 1000;
    const mfSolveCost = Number(controls.mfSolveCost.value) * 1000;
    const complexityPerCase = designPoints * Math.log(designIters);
    const complexity = caseCount * complexityPerCase;
    const cfdCost = cfdScale * complexity;
    const mfCost = trainingCost + mfSolveCost * caseCount;
    const perCaseGain = cfdScale * complexityPerCase - mfSolveCost;
    const requiredCases = perCaseGain > 0 ? Math.ceil(trainingCost / perCaseGain) : ">200";
    const bepComplexity = perCaseGain > 0 ? requiredCases * complexityPerCase : Infinity;
    return {
      caseCount,
      designPoints,
      designIters,
      cfdScale,
      trainingCost,
      mfSolveCost,
      complexityPerCase,
      complexity,
      cfdCost,
      mfCost,
      delta: cfdCost - mfCost,
      requiredCases,
      bepComplexity,
    };
  }

  function xScale(value, max) {
    return plot.left + (value / max) * plot.width;
  }

  function yScale(value, max) {
    return plot.top + plot.height - (value / max) * plot.height;
  }

  function path(points) {
    return points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)},${point[1].toFixed(1)}`).join(" ");
  }

  function drawAxes(xMax, yMax) {
    for (let i = 0; i <= 5; i += 1) {
      const x = plot.left + (plot.width * i) / 5;
      const y = plot.top + plot.height - (plot.height * i) / 5;
      make("line", { x1: x, y1: plot.top, x2: x, y2: plot.top + plot.height, stroke: "#edf2f4" });
      make("line", { x1: plot.left, y1: y, x2: plot.left + plot.width, y2: y, stroke: "#edf2f4" });
      text(x, plot.top + plot.height + 26, fmt((xMax * i) / 5), { "text-anchor": "middle", fill: "#52656f", "font-size": "12" });
      text(plot.left - 14, y + 4, fmt((yMax * i) / 5), { "text-anchor": "end", fill: "#52656f", "font-size": "12" });
    }
    make("line", { x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.top + plot.height, stroke: "#182131", "stroke-width": "1.5" });
    make("line", { x1: plot.left, y1: plot.top + plot.height, x2: plot.left + plot.width, y2: plot.top + plot.height, stroke: "#182131", "stroke-width": "1.5" });
    text(plot.left + plot.width / 2, 594, "Problem complexity C = Ncases x Npoints x log(Niters)", { "text-anchor": "middle", "font-size": "16", "font-weight": "800" });
    text(24, plot.top + plot.height / 2, "Computational cost (core-hours)", { transform: `rotate(-90 24 ${plot.top + plot.height / 2})`, "text-anchor": "middle", "font-size": "16", "font-weight": "800" });
  }

  function drawChart(s) {
    svg.replaceChildren();
    const finiteBep = Number.isFinite(s.bepComplexity) ? s.bepComplexity : s.complexity * 1.5;
    const xMax = Math.max(6000, s.complexity * 1.28, finiteBep * 1.35);
    const yMax = Math.max(s.cfdCost, s.mfCost, s.cfdScale * xMax) * 1.12;
    drawAxes(xMax, yMax);

    const bepX = Math.min(xMax, finiteBep);
    const bepY = s.cfdScale * bepX;
    make("rect", {
      x: plot.left,
      y: yScale(s.trainingCost, yMax),
      width: Math.max(0, xScale(bepX, xMax) - plot.left),
      height: plot.top + plot.height - yScale(s.trainingCost, yMax),
      fill: "#dce9ff",
      opacity: "0.85",
    });
    make("rect", {
      x: xScale(bepX, xMax),
      y: plot.top,
      width: Math.max(0, plot.left + plot.width - xScale(bepX, xMax)),
      height: plot.height,
      fill: "#ffe7ad",
      opacity: "0.55",
    });
    text(plot.left + 120, yScale(s.trainingCost, yMax) + 58, "Loss", { fill: "#5d8fe8", "font-size": "28", "font-weight": "800" });
    text(xScale(bepX, xMax) + 0.38 * (plot.left + plot.width - xScale(bepX, xMax)), plot.top + 170, "Profit", { fill: "#f2a000", "font-size": "28", "font-weight": "800" });

    const red = [];
    const blue = [];
    for (let x = 0; x <= xMax; x += xMax / 90) {
      const casesAtX = x / Math.max(1, s.complexityPerCase);
      red.push([xScale(x, xMax), yScale(s.cfdScale * x, yMax)]);
      blue.push([xScale(x, xMax), yScale(s.trainingCost + s.mfSolveCost * casesAtX, yMax)]);
    }
    make("path", { d: path(red), fill: "none", stroke: "#e01943", "stroke-width": "3", "stroke-dasharray": "8 6" });
    make("path", { d: path(blue), fill: "none", stroke: "#07178f", "stroke-width": "3" });

    make("circle", { cx: xScale(bepX, xMax), cy: yScale(bepY, yMax), r: "7", fill: "#111827", stroke: "#fff", "stroke-width": "2" });
    text(xScale(bepX, xMax) - 70, yScale(bepY, yMax) - 20, "BEP", { "font-size": "15", "font-weight": "900" });

    const currentX = xScale(s.complexity, xMax);
    const currentCfdY = yScale(s.cfdCost, yMax);
    const currentMfY = yScale(s.mfCost, yMax);
    make("line", { x1: currentX, y1: plot.top, x2: currentX, y2: plot.top + plot.height, stroke: "#172033", "stroke-dasharray": "7 7" });
    make("line", { x1: currentX, y1: currentCfdY, x2: currentX, y2: currentMfY, stroke: "#64748b", "stroke-dasharray": "4 5" });
    make("circle", { cx: currentX, cy: currentCfdY, r: "6", fill: "#e01943" });
    make("rect", { x: currentX - 6, y: currentMfY - 6, width: "12", height: "12", fill: "#07178f" });
    text(currentX + 12, plot.top + 25, `Current C = ${fmt(s.complexity)}`, { "font-weight": "900" });

    const legend = make("g", {});
    make("line", { x1: 118, y1: 74, x2: 160, y2: 74, stroke: "#e01943", "stroke-width": "3", "stroke-dasharray": "8 6" }, legend);
    make("line", { x1: 118, y1: 102, x2: 160, y2: 102, stroke: "#07178f", "stroke-width": "3" }, legend);
    text(174, 79, "CFD-driven", { "font-size": "14", "font-weight": "800" }, legend);
    text(174, 107, "Data-driven multifidelity", { "font-size": "14", "font-weight": "800" }, legend);
  }

  function update() {
    const s = state();
    outputs.caseCount.textContent = fmt(s.caseCount);
    outputs.designPoints.textContent = fmt(s.designPoints);
    outputs.designIters.textContent = fmt(s.designIters);
    outputs.cfdScale.textContent = `${fmt(s.cfdScale)} core-hours / C`;
    outputs.trainingCost.textContent = `${fmt(s.trainingCost / 1000)}k core-hours`;
    outputs.mfSolveCost.textContent = `${fmt(s.mfSolveCost / 1000, 1)}k core-hours`;
    outputs.region.textContent = s.delta >= 0 ? "Profit region" : "Loss region";
    outputs.region.dataset.state = s.delta >= 0 ? "profit" : "loss";
    outputs.complexity.textContent = fmt(s.complexity);
    outputs.bep.textContent = Number.isFinite(s.bepComplexity) ? fmt(s.bepComplexity) : ">200";
    outputs.cfd.textContent = fmt(s.cfdCost);
    outputs.mf.textContent = fmt(s.mfCost);
    outputs.delta.textContent = `${s.delta >= 0 ? "+" : "-"}${fmt(Math.abs(s.delta))}`;
    outputs.required.textContent = s.requiredCases;
    outputs.conclusion.textContent = s.delta >= 0
      ? `The current setting is beyond the break-even point. Reusing one multifidelity surrogate saves ${fmt(s.delta)} core-hours compared with repeated high-fidelity CFD-driven optimization.`
      : `The current setting is still before the break-even point. Increase the number of optimization cases, reduce MF training cost, or increase the CFD cost scale to make the multifidelity model cost-effective.`;
    drawChart(s);
  }

  Object.values(controls).forEach((control) => control.addEventListener("input", update));
  const copyButton = document.getElementById("copy-bibtex");
  const bibtexEntry = document.getElementById("bibtex-entry");
  if (copyButton && bibtexEntry) {
    copyButton.addEventListener("click", async () => {
      const text = bibtexEntry.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(bibtexEntry);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        selection.removeAllRanges();
      }
      copyButton.textContent = "Copied";
      copyButton.dataset.copied = "true";
      window.setTimeout(() => {
        copyButton.textContent = "Copy BibTeX";
        copyButton.dataset.copied = "false";
      }, 1600);
    });
  }
  update();
})();
