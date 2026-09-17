(() => {
  "use strict";

  const DOMAIN_MIN = -2;
  const DOMAIN_MAX = 2;
  const DOMAIN_SIZE = DOMAIN_MAX - DOMAIN_MIN;
  const DOMAIN_AREA = DOMAIN_SIZE * DOMAIN_SIZE;
  const LINE_OFFSET_MAX = 2 * Math.SQRT2;
  const LINE_PARAMETER_AREA = Math.PI * (2 * LINE_OFFSET_MAX);
  const canvas = document.querySelector("#plot");
  const wrap = document.querySelector("#canvasWrap");
  const ctx = canvas.getContext("2d");
  const countInput = document.querySelector("#circleCount");
  const objectCountLabel = document.querySelector("#objectCountLabel");
  const objectCountLimit = document.querySelector("#objectCountLimit");
  const radiusField = document.querySelector("#radiusField");
  const radiusInput = document.querySelector("#radius");
  const radiusValue = document.querySelector("#radiusValue");
  const seedInput = document.querySelector("#seed");
  const seedModeInputs = [...document.querySelectorAll('input[name="seedMode"]')];
  const seedValueRow = document.querySelector("#seedValueRow");
  const seedExplanation = document.querySelector("#seedExplanation");
  const languageToggle = document.querySelector("#languageToggle");
  const themeToggle = document.querySelector("#themeToggle");
  const themeIcon = document.querySelector("#themeIcon");
  const themeLabel = document.querySelector("#themeLabel");
  const showObjects = document.querySelector("#showObjects");
  const showObjectsLabel = document.querySelector("#showObjectsLabel");
  const showHits = document.querySelector("#showHits");
  const runButton = document.querySelector("#runButton");
  const clearButton = document.querySelector("#clearButton");
  const emptyHint = document.querySelector("#emptyHint");
  const drawStatus = document.querySelector("#drawStatus");
  const totalHitsOutput = document.querySelector("#totalHits");
  const lengthOutput = document.querySelector("#curveLength");
  const estimateOutput = document.querySelector("#estimate");
  const errorOutput = document.querySelector("#errorRate");
  const resultHint = document.querySelector("#resultHint");
  const formulaEstimateExpression = document.querySelector("#formulaEstimateExpression");
  const circleTab = document.querySelector("#circleTab");
  const lineTab = document.querySelector("#lineTab");
  const circleTheory = document.querySelector("#circleTheory");
  const lineTheory = document.querySelector("#lineTheory");

  let points = [];
  let circles = [];
  let lines = [];
  let hitPoints = [];
  let drawing = false;
  let lastResult = null;
  let experimentMode = localStorage.getItem("crofton-experiment-mode") === "line" ? "line" : "circle";
  let currentLanguage = localStorage.getItem("crofton-language") === "en" ? "en" : "zh";
  const savedTheme = localStorage.getItem("crofton-theme");
  const deviceTheme = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  let followsDeviceTheme = savedTheme !== "light" && savedTheme !== "dark";
  let currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

  const translations = {
    zh: {
      intro: "在座標區內一筆畫出曲線，再用隨機圓或隨機直線估計它的長度。",
      circleTab: "隨機圓", lineTab: "隨機直線",
      settingsTitle: "實驗設定", circleCount: "圓的數量", circleCountLimit: "請輸入 10～50,000",
      fixedRadius: "固定半徑", radiusLimit: "範圍 0.02～1.00", randomSeed: "亂數種子",
      randomEveryTime: "每次隨機", fixedSeed: "固定種子", fixedSeedNumber: "固定種子數字",
      seedDefinition: "種子是亂數的起點。", seedExplanation: "固定同一個數字，就會產生相同的一組圓，方便重複比較。",
      showCircles: "顯示圓", showHits: "顯示交點", run: "產生圓並計算", clear: "清除曲線",
      drawCurve: "一筆畫曲線", waitingToDraw: "等待下筆", dragToDraw: "按住並拖曳", mouseOrTouch: "滑鼠或手指都可以",
      canvasNote: "座標範圍固定為 [−2, 2] × [−2, 2]。再次下筆會取代上一條曲線。",
      resultsTitle: "計算結果", totalIntersections: "交點總數", curveLength: "曲線長度",
      curveLengthNote: "依手繪資料點逐段加總", formulaEstimate: "公式估計值",
      formulaEstimateExpression: "(交點總數 ÷ 圓數) × 16 ÷ (4 × 半徑)", estimateError: "估計誤差",
      resultHint: "畫完曲線後按「產生圓並計算」。",
      lightMode: "日間模式", darkMode: "夜間模式", switchToLight: "切換到日間模式", switchToDark: "切換到夜間模式",
      theoryTitle: "Crofton 圓公式與本網站的數值方法",
      propTitle: "固定半徑圓的 Crofton 公式",
      propBody: "令 γ(s) = (x(s), y(s)) 是以弧長參數化的曲線，曲線長度為 L，C 為曲線的像。令 Sᵣ = (a, b) 表示半徑固定為 r、圓心位於 (a, b) 的圓。Crofton 公式指出，對所有可能的圓心位置積分，圓與曲線的交點數會滿足：",
      propMeaning: "其中 #(Sᵣ ∩ C) 是該圓與曲線的交點個數。這個等式把「平均交點數」和曲線長度連在一起。",
      methodTitle: "如何轉成網站上的數值計算",
      methodStep1: "你在 [−2, 2] × [−2, 2] 的區域畫出曲線，程式把手繪軌跡記錄成依序排列的資料點。",
      methodStep2: "程式在面積 A = 16 的區域內均勻抽取 m 個圓心，所有圓都使用相同的半徑 r。均勻抽取表示區域中每一塊相同大小的面積，被選到的機會都一樣。",
      methodStep3: "對每個圓計算它與資料折線的交點數，再把所有交點數加總為 N，因此每個圓的平均交點數是 N/m。",
      methodStep4: "把圓心區域切成許多很小、等面積的格子時，交點數的積分除以總面積，就是各格子交點數的平均。隨機且均勻地取很多圓心，N/m 就會接近這個區域平均：",
      averageEquation: "N/m ≈ (1/A) ∫ #(Sᵣ ∩ C) dSᵣ = 4rL/A",
      solveForLength: "把等式兩邊乘上 A，再除以 4r，就得到網站使用的曲線長度估計式：",
      estimateEquation: "(N ÷ 圓的數量) × A ÷ (4r)",
      methodNote: "圓的數量越多，抽樣通常越穩定；網站同時用手繪資料點直接計算折線長度，讓你比較理論估計值和資料值。",
      boundaryNote: "邊界提醒：Crofton 公式原本對所有圓心位置積分。本網站只在方形區域內抽樣，因此曲線若太靠近邊界，部分圓心落在區域外卻仍會與曲線相交，估計值可能偏低。",
      lineTheoryTitle: "Crofton 直線公式與本網站的數值方法",
      linePropTitle: "Crofton 直線公式",
      linePropBody: "令 C 是長度為 L 的平面曲線，G 表示平面上的直線。對所有直線積分，並計算每條直線和曲線的交點數，可得到：",
      linePropMeaning: "其中 #(G ∩ C) 是直線 G 與曲線 C 的交點個數，dG 表示對不同方向與不同位置的直線進行積分。",
      lineMethodTitle: "如何轉成網站上的數值計算",
      lineMethodStep1: "你在 [−2, 2] × [−2, 2] 的區域畫出曲線，程式把手繪軌跡記錄成依序排列的資料點。",
      lineMethodStep2: "每條直線寫成 x cos(θ) + y sin(θ) = p。程式均勻抽取方向 θ ∈ [0, π) 與位置 p ∈ [−2√2, 2√2]；這個 p 範圍涵蓋所有可能穿過畫布的直線。",
      lineMethodStep3: "對每條直線計算它與資料折線的交點數，再將所有交點數加總為 N，因此每條直線的平均交點數是 N/m。",
      lineMethodStep4: "(θ, p) 的抽樣區域大小是 π × 4√2。把參數區域切成許多相同大小的小格，交點數積分除以參數區域大小，就是各格交點數的平均；均勻抽取很多直線後，可寫成：",
      lineAverageEquation: "N/m ≈ [1/(4√2π)] ∫ #(G ∩ C) dG",
      lineSolveForLength: "配合 ½∫ #(G ∩ C) dG = L，可得到網站使用的曲線長度估計式：",
      lineEstimateEquation: "(N ÷ 直線數量) × 2√2π",
      lineMethodNote: "直線數量越多，抽樣結果通常越穩定；網站同時用手繪資料點直接計算折線長度，讓你比較公式估計值和資料值。",
      contactEmail: "聯絡信箱", siteVisits: "網站造訪數", siteVisitsNote: "同一個工作階段只計一次",
    },
    en: {
      intro: "Draw a curve in one stroke, then estimate its length using random circles or random lines.",
      circleTab: "Random circles", lineTab: "Random lines",
      settingsTitle: "Experiment settings", circleCount: "Number of circles", circleCountLimit: "Enter 10–50,000",
      fixedRadius: "Fixed radius", radiusLimit: "Range 0.02–1.00", randomSeed: "Random seed",
      randomEveryTime: "New each run", fixedSeed: "Fixed seed", fixedSeedNumber: "Seed number",
      seedDefinition: "A seed is the starting point for random generation.", seedExplanation: "Reusing the same number produces the same set of circles, making experiments easy to repeat and compare.",
      showCircles: "Show circles", showHits: "Show intersections", run: "Generate circles and calculate", clear: "Clear curve",
      drawCurve: "Draw one continuous curve", waitingToDraw: "Ready to draw", dragToDraw: "Press and drag", mouseOrTouch: "Use a mouse or your finger",
      canvasNote: "The coordinate domain is fixed at [−2, 2] × [−2, 2]. Starting a new stroke replaces the previous curve.",
      resultsTitle: "Results", totalIntersections: "Total intersections", curveLength: "Curve length",
      curveLengthNote: "Sum of distances between drawn data points", formulaEstimate: "Formula estimate",
      formulaEstimateExpression: "(total intersections ÷ number of circles) × 16 ÷ (4 × radius)", estimateError: "Estimation error",
      resultHint: "Draw a curve, then select “Generate circles and calculate.”",
      lightMode: "Light mode", darkMode: "Dark mode", switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode",
      theoryTitle: "Crofton's circle formula and our numerical method",
      propTitle: "Crofton's formula for circles of fixed radius",
      propBody: "Let γ(s) = (x(s), y(s)) be a curve parametrized by arc length, with total length L, and let C be its image. Let Sᵣ = (a, b) denote a circle of fixed radius r centered at (a, b). Integrating the number of intersections over all possible center locations gives:",
      propMeaning: "Here, #(Sᵣ ∩ C) is the number of intersections between the circle and the curve. The identity connects the average intersection count to the curve length.",
      methodTitle: "From the formula to this numerical experiment",
      methodStep1: "You draw a curve inside [−2, 2] × [−2, 2], and the program records the stroke as an ordered sequence of data points.",
      methodStep2: "The program selects m circle centers uniformly inside the region of area A = 16. Every circle has the same radius r. Uniform selection means that equal-sized parts of the region have equal chances of being selected.",
      methodStep3: "For each circle, the program counts its intersections with the data polyline and adds them to obtain N. The average number of intersections per circle is therefore N/m.",
      methodStep4: "Imagine dividing the center region into many tiny cells of equal area. The intersection-count integral divided by the total area is the average count across those cells. With many uniformly selected centers, N/m approaches this spatial average:",
      averageEquation: "N/m ≈ (1/A) ∫ #(Sᵣ ∩ C) dSᵣ = 4rL/A",
      solveForLength: "Multiply both sides by A and divide by 4r to obtain the length estimate used by the site:",
      estimateEquation: "(N ÷ number of circles) × A ÷ (4r)",
      methodNote: "More circles usually make the sample average more stable. The site also computes the polyline length directly from the drawn points so you can compare the theoretical estimate with the data value.",
      boundaryNote: "Boundary note: Crofton's formula integrates over every possible center location. This site samples only inside the square, so a curve near the boundary can be intersected by circles whose centers lie outside the sampled region, causing a low estimate.",
      lineTheoryTitle: "Crofton's line formula and our numerical method",
      linePropTitle: "Crofton's formula for lines",
      linePropBody: "Let C be a plane curve of length L, and let G denote a line in the plane. Integrating the intersection count over all lines gives:",
      linePropMeaning: "Here, #(G ∩ C) is the number of intersections between line G and curve C, while dG integrates over different line directions and positions.",
      lineMethodTitle: "From the formula to this numerical experiment",
      lineMethodStep1: "You draw a curve inside [−2, 2] × [−2, 2], and the program records the stroke as an ordered sequence of data points.",
      lineMethodStep2: "Each line is written as x cos(θ) + y sin(θ) = p. The program samples θ ∈ [0, π) and p ∈ [−2√2, 2√2] uniformly. This p range includes every line that can cross the canvas.",
      lineMethodStep3: "For each line, the program counts its intersections with the data polyline and adds them to obtain N. The average number of intersections per line is N/m.",
      lineMethodStep4: "The sampled (θ, p) parameter region has size π × 4√2. Divide it into many equal cells: the intersection-count integral divided by the parameter-region size is the average count across those cells. With many uniformly sampled lines:",
      lineAverageEquation: "N/m ≈ [1/(4√2π)] ∫ #(G ∩ C) dG",
      lineSolveForLength: "Combining this with ½∫ #(G ∩ C) dG = L gives the length estimate used by the site:",
      lineEstimateEquation: "(N ÷ number of lines) × 2√2π",
      lineMethodNote: "More lines usually make the sample result more stable. The site also computes the polyline length directly from the drawn points so you can compare the formula estimate with the data value.",
      contactEmail: "Contact", siteVisits: "Site visits", siteVisitsNote: "One count per browsing session",
    },
  };

  function t(key) {
    return translations[currentLanguage][key] ?? key;
  }

  function defaultResultHint() {
    if (experimentMode === "line") return currentLanguage === "en" ? "Draw a curve, then select “Generate lines and calculate.”" : "畫完曲線後按「產生直線並計算」。";
    return t("resultHint");
  }

  function applyLanguage() {
    document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-Hant";
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    updateModeContent();
    languageToggle.textContent = currentLanguage === "en" ? "中文" : "EN";
    languageToggle.setAttribute("aria-label", currentLanguage === "en" ? "切換成中文" : "Switch to English");
    updateThemeButton();
    if (lastResult) setResultSummary(lastResult);
    else resultHint.textContent = defaultResultHint();
    if (!drawing) {
      drawStatus.textContent = points.length > 1
        ? (currentLanguage === "en" ? `${points.length} data points` : `${points.length} 個資料點`)
        : t("waitingToDraw");
    }
  }

  function updateModeContent() {
    const isLine = experimentMode === "line";
    const en = currentLanguage === "en";
    circleTab.classList.toggle("active", !isLine);
    lineTab.classList.toggle("active", isLine);
    circleTab.setAttribute("aria-selected", String(!isLine));
    lineTab.setAttribute("aria-selected", String(isLine));
    radiusField.hidden = isLine;
    circleTheory.hidden = isLine;
    lineTheory.hidden = !isLine;
    objectCountLabel.textContent = isLine ? (en ? "Number of lines" : "直線的數量") : (en ? "Number of circles" : "圓的數量");
    objectCountLimit.textContent = en ? "Enter 10–50,000" : "請輸入 10～50,000";
    showObjectsLabel.textContent = isLine ? (en ? "Show lines" : "顯示直線") : (en ? "Show circles" : "顯示圓");
    runButton.textContent = isLine ? (en ? "Generate lines and calculate" : "產生直線並計算") : (en ? "Generate circles and calculate" : "產生圓並計算");
    formulaEstimateExpression.textContent = isLine
      ? (en ? "(total intersections ÷ number of lines) × 2√2π" : "(交點總數 ÷ 直線數) × 2√2π")
      : (en ? "(total intersections ÷ number of circles) × 16 ÷ (4 × radius)" : "(交點總數 ÷ 圓數) × 16 ÷ (4 × 半徑)");
    document.querySelector('[data-i18n="seedExplanation"]').textContent = isLine
      ? (en ? "Reusing the same number produces the same set of lines, making experiments easy to repeat and compare." : "固定同一個數字，就會產生相同的一組直線，方便重複比較。")
      : t("seedExplanation");
    document.querySelector(".workspace").setAttribute("aria-label", isLine ? (en ? "Random-line curve intersection experiment" : "隨機直線曲線交點實驗") : (en ? "Random-circle curve intersection experiment" : "隨機圓曲線交點實驗"));
  }

  function switchExperimentMode(mode) {
    if (mode === experimentMode) return;
    experimentMode = mode;
    localStorage.setItem("crofton-experiment-mode", mode);
    resetResults();
    updateModeContent();
    render();
  }

  function updateThemeButton() {
    const isLight = currentTheme === "light";
    themeIcon.textContent = isLight ? "☀" : "☾";
    themeLabel.textContent = t(isLight ? "lightMode" : "darkMode");
    themeToggle.setAttribute("aria-label", t(isLight ? "switchToDark" : "switchToLight"));
    themeToggle.setAttribute("aria-pressed", String(isLight));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = currentTheme;
    updateThemeButton();
    render();
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomSeed() {
    if (globalThis.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      globalThis.crypto.getRandomValues(value);
      return value[0];
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  function selectedSeedMode() {
    return seedModeInputs.find(input => input.checked)?.value ?? "fixed";
  }

  function updateSeedMode() {
    const isFixed = selectedSeedMode() === "fixed";
    seedValueRow.hidden = !isFixed;
    seedInput.disabled = !isFixed;
    seedExplanation.hidden = !isFixed;
  }

  function toCanvas(point) {
    return {
      x: ((point.x - DOMAIN_MIN) / DOMAIN_SIZE) * canvas.clientWidth,
      y: ((DOMAIN_MAX - point.y) / DOMAIN_SIZE) * canvas.clientHeight,
    };
  }

  function toDomain(event) {
    const rect = canvas.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const py = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    return {
      x: DOMAIN_MIN + (px / rect.width) * DOMAIN_SIZE,
      y: DOMAIN_MAX - (py / rect.height) * DOMAIN_SIZE,
    };
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.round(wrap.clientWidth * ratio);
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    render();
  }

  function drawGrid() {
    const size = canvas.clientWidth;
    const styles = getComputedStyle(document.documentElement);
    ctx.fillStyle = styles.getPropertyValue("--canvas-bg").trim();
    ctx.fillRect(0, 0, size, size);
    ctx.lineWidth = 1;
    for (let value = DOMAIN_MIN; value <= DOMAIN_MAX + 1e-9; value += 0.5) {
      const x = ((value - DOMAIN_MIN) / DOMAIN_SIZE) * size;
      const y = ((DOMAIN_MAX - value) / DOMAIN_SIZE) * size;
      const major = Math.abs(value) < 1e-9;
      ctx.strokeStyle = styles.getPropertyValue(major ? "--grid-major" : "--grid-minor").trim();
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
    }
  }

  function render() {
    drawGrid();
    const scale = canvas.clientWidth / DOMAIN_SIZE;
    const styles = getComputedStyle(document.documentElement);

    if (showObjects.checked && experimentMode === "circle" && circles.length) {
      ctx.strokeStyle = styles.getPropertyValue(circles.length > 3000 ? "--circle-faint" : "--circle-strong").trim();
      ctx.lineWidth = circles.length > 5000 ? 0.45 : 0.7;
      ctx.beginPath();
      for (const circle of circles) {
        const c = toCanvas(circle);
        ctx.moveTo(c.x + circle.r * scale, c.y);
        ctx.arc(c.x, c.y, circle.r * scale, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    if (showObjects.checked && experimentMode === "line" && lines.length) {
      ctx.strokeStyle = styles.getPropertyValue(lines.length > 3000 ? "--circle-faint" : "--circle-strong").trim();
      ctx.lineWidth = lines.length > 5000 ? 0.45 : 0.7;
      ctx.beginPath();
      for (const line of lines) {
        const segment = lineSegmentInDomain(line);
        if (!segment) continue;
        const start = toCanvas(segment[0]);
        const end = toCanvas(segment[1]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      }
      ctx.stroke();
    }

    if (points.length > 1) {
      ctx.strokeStyle = styles.getPropertyValue("--curve-color").trim();
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      const first = toCanvas(points[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < points.length; i++) {
        const p = toCanvas(points[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    if (showHits.checked && hitPoints.length) {
      ctx.fillStyle = styles.getPropertyValue("--hit-color").trim();
      for (const hit of hitPoints) {
        const p = toCanvas(hit);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function curveLength(polyline) {
    let sum = 0;
    for (let i = 1; i < polyline.length; i++) {
      sum += Math.hypot(polyline[i].x - polyline[i - 1].x, polyline[i].y - polyline[i - 1].y);
    }
    return sum;
  }

  function segmentCircleHits(p1, p2, circle, tolerance = 1e-9) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return [];
    const ux = dx / length;
    const uy = dy / length;
    const fx = p1.x - circle.x;
    const fy = p1.y - circle.y;
    const along = -(fx * ux + fy * uy);
    const distance = Math.abs(fx * uy - fy * ux);
    if (distance > circle.r + tolerance) return [];
    const offset = Math.sqrt(Math.max(0, (circle.r - distance) * (circle.r + distance)));
    const result = [];
    for (const s0 of [along - offset, along + offset]) {
      if (s0 >= -tolerance && s0 <= length + tolerance) {
        const s = Math.min(length, Math.max(0, s0));
        const hit = { x: p1.x + s * ux, y: p1.y + s * uy };
        if (!result.some(p => Math.hypot(p.x - hit.x, p.y - hit.y) <= tolerance)) result.push(hit);
      }
    }
    return result;
  }

  function intersectionsForCircle(polyline, circle) {
    const found = [];
    const tolerance = 1e-7;
    for (let i = 1; i < polyline.length; i++) {
      for (const hit of segmentCircleHits(polyline[i - 1], polyline[i], circle)) {
        if (!found.some(p => Math.hypot(p.x - hit.x, p.y - hit.y) <= tolerance)) found.push(hit);
      }
    }
    return found;
  }

  function lineSegmentInDomain(line, tolerance = 1e-9) {
    const nx = Math.cos(line.theta);
    const ny = Math.sin(line.theta);
    const candidates = [];
    const add = (x, y) => {
      if (x < DOMAIN_MIN - tolerance || x > DOMAIN_MAX + tolerance || y < DOMAIN_MIN - tolerance || y > DOMAIN_MAX + tolerance) return;
      if (!candidates.some(point => Math.hypot(point.x - x, point.y - y) <= tolerance)) candidates.push({ x, y });
    };
    if (Math.abs(ny) > tolerance) {
      add(DOMAIN_MIN, (line.offset - DOMAIN_MIN * nx) / ny);
      add(DOMAIN_MAX, (line.offset - DOMAIN_MAX * nx) / ny);
    }
    if (Math.abs(nx) > tolerance) {
      add((line.offset - DOMAIN_MIN * ny) / nx, DOMAIN_MIN);
      add((line.offset - DOMAIN_MAX * ny) / nx, DOMAIN_MAX);
    }
    if (candidates.length < 2) return null;
    let best = [candidates[0], candidates[1]];
    let bestDistance = 0;
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const distance = Math.hypot(candidates[j].x - candidates[i].x, candidates[j].y - candidates[i].y);
        if (distance > bestDistance) {
          bestDistance = distance;
          best = [candidates[i], candidates[j]];
        }
      }
    }
    return best;
  }

  function intersectionsForLine(polyline, line) {
    const found = [];
    const tolerance = 1e-7;
    const nx = Math.cos(line.theta);
    const ny = Math.sin(line.theta);
    const add = hit => {
      if (!found.some(point => Math.hypot(point.x - hit.x, point.y - hit.y) <= tolerance)) found.push(hit);
    };
    for (let i = 1; i < polyline.length; i++) {
      const p1 = polyline[i - 1];
      const p2 = polyline[i];
      const d1 = p1.x * nx + p1.y * ny - line.offset;
      const d2 = p2.x * nx + p2.y * ny - line.offset;
      const on1 = Math.abs(d1) <= tolerance;
      const on2 = Math.abs(d2) <= tolerance;
      if (on1 && on2) continue;
      if (on1) { add(p1); continue; }
      if (on2) { add(p2); continue; }
      if ((d1 < 0 && d2 > 0) || (d2 < 0 && d1 > 0)) {
        const t = d1 / (d1 - d2);
        add({ x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) });
      }
    }
    return found;
  }

  function validateSettings() {
    const count = Math.round(Number(countInput.value));
    const radius = Number(radiusInput.value);
    const seedMode = selectedSeedMode();
    const seed = seedMode === "fixed" ? Math.trunc(Number(seedInput.value)) : randomSeed();
    if (!Number.isFinite(count) || count < 10 || count > 50000) throw new Error(currentLanguage === "en" ? `Enter between 10 and 50,000 ${experimentMode === "line" ? "lines" : "circles"}.` : `${experimentMode === "line" ? "直線" : "圓"}的數量請輸入 10～50,000。`);
    if (experimentMode === "circle" && (!Number.isFinite(radius) || radius <= 0 || radius > 1)) throw new Error(currentLanguage === "en" ? "Set the radius between 0.02 and 1." : "半徑請設定在 0.02～1。");
    if (seedMode === "fixed" && !Number.isFinite(seed)) throw new Error(currentLanguage === "en" ? "The fixed seed must be an integer." : "固定種子必須是整數。");
    countInput.value = String(count);
    if (seedMode === "fixed") seedInput.value = String(seed);
    return { count, radius, seed, seedMode, mode: experimentMode };
  }

  function runExperiment(settings = validateSettings()) {
    if (points.length < 2) throw new Error(currentLanguage === "en" ? "Draw a curve on the canvas first." : "請先在畫布上畫一條曲線。");
    const random = mulberry32(settings.seed);
    circles = [];
    lines = [];
    hitPoints = [];
    let totalHits = 0;
    if (settings.mode === "line") {
      for (let i = 0; i < settings.count; i++) {
        const line = {
          theta: random() * Math.PI,
          offset: -LINE_OFFSET_MAX + random() * (2 * LINE_OFFSET_MAX),
        };
        lines.push(line);
        const hits = intersectionsForLine(points, line);
        totalHits += hits.length;
        hitPoints.push(...hits);
      }
    } else {
      for (let i = 0; i < settings.count; i++) {
        const circle = {
          x: DOMAIN_MIN + random() * DOMAIN_SIZE,
          y: DOMAIN_MIN + random() * DOMAIN_SIZE,
          r: settings.radius,
        };
        circles.push(circle);
        const hits = intersectionsForCircle(points, circle);
        totalHits += hits.length;
        hitPoints.push(...hits);
      }
    }
    const actualLength = curveLength(points);
    const estimated = settings.mode === "line"
      ? (totalHits / settings.count) * LINE_PARAMETER_AREA / 2
      : (totalHits / settings.count) * DOMAIN_AREA / (4 * settings.radius);
    const errorRate = actualLength > 0 ? Math.abs(estimated - actualLength) / actualLength * 100 : 0;
    lastResult = { totalHits, actualLength, estimated, errorRate, ...settings };
    totalHitsOutput.textContent = totalHits.toLocaleString("zh-Hant");
    lengthOutput.textContent = actualLength.toFixed(4);
    estimateOutput.textContent = estimated.toFixed(4);
    errorOutput.textContent = `${errorRate.toFixed(2)}%`;
    setResultSummary(settings);
    render();
    return lastResult;
  }

  function setResultSummary(settings) {
    const objectName = settings.mode === "line"
      ? (currentLanguage === "en" ? "lines" : "條直線")
      : (currentLanguage === "en" ? "circles" : "個圓");
    if (currentLanguage === "en") {
      const seedLabel = settings.seedMode === "random" ? `random seed for this run: ${settings.seed}` : `fixed seed: ${settings.seed}`;
      resultHint.textContent = `Used ${settings.count.toLocaleString("en")} ${objectName}; ${seedLabel}.`;
    } else {
      const seedLabel = settings.seedMode === "random" ? `本次隨機種子 ${settings.seed}` : `固定種子 ${settings.seed}`;
      resultHint.textContent = `已使用 ${settings.count.toLocaleString("zh-Hant")} ${objectName}；${seedLabel}。`;
    }
  }

  function resetResults() {
    circles = [];
    lines = [];
    hitPoints = [];
    lastResult = null;
    for (const el of [totalHitsOutput, lengthOutput, estimateOutput, errorOutput]) el.textContent = "—";
    resultHint.textContent = defaultResultHint();
  }

  function startDrawing(event) {
    if (event.button !== undefined && event.button !== 0) return;
    drawing = true;
    points = [toDomain(event)];
    resetResults();
    emptyHint.classList.add("hidden");
    drawStatus.textContent = currentLanguage === "en" ? "Drawing" : "繪製中";
    drawStatus.classList.add("ready");
    canvas.setPointerCapture(event.pointerId);
    render();
  }

  function continueDrawing(event) {
    if (!drawing) return;
    const point = toDomain(event);
    const previous = points[points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) >= 0.008) {
      points.push(point);
      render();
    }
  }

  function endDrawing(event) {
    if (!drawing) return;
    continueDrawing(event);
    drawing = false;
    drawStatus.textContent = points.length > 1
      ? (currentLanguage === "en" ? `${points.length} data points` : `${points.length} 個資料點`)
      : (currentLanguage === "en" ? "Please redraw" : "請重新繪製");
    drawStatus.classList.toggle("ready", points.length > 1);
  }

  radiusInput.addEventListener("input", () => { radiusValue.textContent = Number(radiusInput.value).toFixed(2); });
  seedModeInputs.forEach(input => input.addEventListener("change", updateSeedMode));
  languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "zh" : "en";
    localStorage.setItem("crofton-language", currentLanguage);
    applyLanguage();
  });
  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    followsDeviceTheme = false;
    localStorage.setItem("crofton-theme", currentTheme);
    applyTheme();
  });

  function handleDeviceThemeChange(event) {
    if (!followsDeviceTheme) return;
    currentTheme = event.matches ? "dark" : "light";
    applyTheme();
  }

  if (deviceTheme?.addEventListener) deviceTheme.addEventListener("change", handleDeviceThemeChange);
  else if (deviceTheme?.addListener) deviceTheme.addListener(handleDeviceThemeChange);
  showObjects.addEventListener("change", render);
  showHits.addEventListener("change", render);
  circleTab.addEventListener("click", () => switchExperimentMode("circle"));
  lineTab.addEventListener("click", () => switchExperimentMode("line"));
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", continueDrawing);
  canvas.addEventListener("pointerup", endDrawing);
  canvas.addEventListener("pointercancel", endDrawing);
  runButton.addEventListener("click", () => {
    resultHint.textContent = currentLanguage === "en" ? "Calculating…" : "計算中…";
    requestAnimationFrame(() => {
      try { runExperiment(); }
      catch (error) { resultHint.textContent = error.message; }
    });
  });
  clearButton.addEventListener("click", () => {
    points = [];
    resetResults();
    emptyHint.classList.remove("hidden");
    drawStatus.textContent = t("waitingToDraw");
    drawStatus.classList.remove("ready");
    render();
  });

  function registerWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    try {
      context.registerTool({
        name: "configure_and_run_curve_experiment",
        title: "設定並執行曲線實驗",
        description: "用目前畫布上的手繪曲線，設定隨機圓或隨機直線的數量與種子模式後執行交點實驗。",
        inputSchema: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["circle", "line"] },
            count: { type: "integer", minimum: 10, maximum: 50000 },
            radius: { type: "number", minimum: 0.02, maximum: 1 },
            seedMode: { type: "string", enum: ["random", "fixed"] },
            seed: { type: "integer" },
          },
          required: ["mode", "count", "seedMode"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || !["circle", "line"].includes(input.mode) ||
              !Number.isInteger(input.count) || input.count < 10 || input.count > 50000 ||
              (input.mode === "circle" && (!Number.isFinite(input.radius) || input.radius < 0.02 || input.radius > 1)) ||
              !["random", "fixed"].includes(input.seedMode) || (input.seedMode === "fixed" && !Number.isInteger(input.seed))) {
            throw new Error("參數格式或範圍不正確。");
          }
          if (input.mode !== experimentMode) switchExperimentMode(input.mode);
          countInput.value = String(input.count);
          const radius = input.mode === "circle" ? input.radius : Number(radiusInput.value);
          if (input.mode === "circle") {
            radiusInput.value = String(radius);
            radiusValue.textContent = Number(radius).toFixed(2);
          }
          const modeInput = seedModeInputs.find(item => item.value === input.seedMode);
          modeInput.checked = true;
          if (input.seedMode === "fixed") seedInput.value = String(input.seed);
          updateSeedMode();
          const seed = input.seedMode === "fixed" ? input.seed : randomSeed();
          return runExperiment({ count: input.count, radius, seed, seedMode: input.seedMode, mode: input.mode });
        },
      });
    } catch (error) { console.warn("WebMCP registration unavailable", error); }
  }

  window.addEventListener("resize", resizeCanvas);
  applyTheme();
  applyLanguage();
  updateSeedMode();
  resizeCanvas();
  registerWebMCP();
})();
