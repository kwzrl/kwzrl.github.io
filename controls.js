// ============================================================
//  CONTROL DRAWER
// ============================================================
//  Runs after the field so its first apply() already has a listener to talk to. It
//  never touches the canvas directly: it writes custom properties on :root and fires
//  the event the canvas already listens for. That is the whole coupling.
//
//  Contrast is the one control that is not a raw variable. It interpolates the ink
//  between the page colour (0 = the dot is the page, i.e. gone) and the skin's own ink
//  (1 = the default), and keeps extrapolating past 1. Both endpoints are per-theme, so
//  the slider means the same thing in both skins and has to be recomputed when the
//  theme flips — which is what the guarded themechange listener at the bottom is for.
//  Without that guard it would answer its own event forever.
// ============================================================
(function () {
  const root = document.documentElement;
  const panel = document.getElementById("ctrlPanel");
  const tog = document.getElementById("ctrlTog"), dock = document.getElementById("dock");

  // per-skin endpoints for the contrast slider: [page, ink at full strength]
  const INK = { light: ["#ffffff", "#b4b4b4"], dark: ["#0e0e0e", "#343434"] };
  // Tuned in the drawer, then written back here. The endpoints above are untouched by
  // that: contrast still means "all the way to the site's ink", the default just no
  // longer sits at the far end of it.
  const DEF = { density: 1.04, contrast: 0.14, cell: 3, edge: 0 };
  const S = { ...DEF };
  let applying = false;

  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16));
  const hex = c => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function inkFor(theme, t) {
    const [bg, full] = INK[theme] || INK.light, a = rgb(bg), b = rgb(full);
    return hex(a.map((v, i) => v + (b[i] - v) * t));   // t may exceed 1 — it extrapolates
  }

  const el = id => document.getElementById(id);
  const rows = [
    { k: "density",  inp: el("cDensity"),  out: el("oDensity"),  fmt: v => v.toFixed(2) },
    { k: "contrast", inp: el("cContrast"), out: el("oContrast"), fmt: v => v.toFixed(2) },
    { k: "cell",     inp: el("cCell"),     out: el("oCell"),     fmt: v => v + "px" },
    { k: "edge",     inp: el("cEdge"),     out: el("oEdge"),     fmt: v => v.toFixed(2) },
  ];

  function apply() {
    const theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    root.style.setProperty("--dgain", String(S.density));
    root.style.setProperty("--ink", inkFor(theme, S.contrast));
    root.style.setProperty("--dpix", String(S.cell));
    root.style.setProperty("--dedge", String(S.edge));

    for (const r of rows) { if (r.inp) { r.inp.value = S[r.k]; r.out.textContent = r.fmt(S[r.k]); } }

    applying = true;
    dispatchEvent(new CustomEvent("themechange", { detail: "control" }));
    applying = false;
    try { localStorage.setItem("kwzrl:field", JSON.stringify(S)); } catch (e) {}
  }

  for (const r of rows) {
    if (!r.inp) continue;
    r.inp.addEventListener("input", () => { S[r.k] = parseFloat(r.inp.value); apply(); });
  }
  el("ctrlReset").addEventListener("click", () => { Object.assign(S, DEF); apply(); });

  // the values in the shape the real constants take
  const report = () =>
    `--dgain: ${S.density}\n--ink:   ${inkFor("light", S.contrast)} / ${inkFor("dark", S.contrast)}\n` +
    `--dpix:  ${S.cell}px\n--dedge: ${S.edge}`;

  el("ctrlCopy").addEventListener("click", async () => {
    const btn = el("ctrlCopy"), was = btn.textContent;
    try { await navigator.clipboard.writeText(report()); btn.textContent = "copied"; }
    catch (e) { btn.textContent = "blocked"; console.log(report()); }
    setTimeout(() => { btn.textContent = was; }, 1100);
  });

  // open / close. The drawer's bottom is measured off the dock rather than written
  // down: the dock's height is whatever its padding and its 11px glyph make it, and
  // the -1 lands the two hairlines on each other instead of stacking them into a 2px
  // rule. Both are positioned from the same corner, so the two share an origin.
  function place() {
    panel.style.bottom = (24 + dock.offsetHeight - 1) + "px";
  }
  function open(v) {
    panel.classList.toggle("is-on", v);
    tog.classList.toggle("is-on", v);
    tog.setAttribute("aria-expanded", v ? "true" : "false");
    if (v) place();
  }
  tog.addEventListener("click", e => { e.stopPropagation(); open(!panel.classList.contains("is-on")); });
  document.addEventListener("click", e => {
    if (panel.classList.contains("is-on") && !panel.contains(e.target)) open(false);
  });
  addEventListener("keydown", e => { if (e.key === "Escape") open(false); });
  addEventListener("resize", () => { if (panel.classList.contains("is-on")) place(); });

  // the theme square changes what "contrast 1" resolves to, so the ink has to be
  // recomputed — but only for a real theme flip, or this reacts to its own events
  addEventListener("themechange", e => {
    if (applying || e.detail === "control") return;
    apply();
  });

  try { Object.assign(S, JSON.parse(localStorage.getItem("kwzrl:field") || "{}")); } catch (e) {}
  apply();
})();
