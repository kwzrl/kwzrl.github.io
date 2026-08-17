// ============================================================
//  THE FIELD
// ============================================================
//  The field from lab.html, lifted out to sit behind the page. Everything that shaped
//  it around a reading column is gone — the column mask, the 720px strip it protected,
//  the "no gutter worth filling, don't bother" width gate — and what is left is the
//  field itself: four travelling waves, thresholded against a blue-noise tile, with a
//  wake the cursor clears through it and a ring every click lets go.
//
//  The canvas is fixed to the viewport and sits at z-index -1, so it stays put while
//  the text scrolls over it. That only works while body keeps no background of its
//  own: give body a colour and it paints straight over the field.
//
//  Shaping now comes from one envelope at the four edges instead of a mask down the
//  middle. It is deliberately isotropic (a fixed px falloff, not a fraction of the
//  dimension) so the texture meets a wide edge the same way it meets a tall one.
//
//  Knobs worth touching: INK, MAXD and the edge envelope for the resting texture;
//  REACH, NT, CLEAR and RING for the cursor; R_* for the click; the four
//  frequency/speed pairs inside frame().
// ============================================================
(function () {
  const cv = document.getElementById("dither");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MAXD  = 0.24;      // resting coverage at full envelope
  const FEDGE = 220;       // px over which the envelope climbs in from each edge
  // The cursor clears a wake, not a disc. The cleared zone is the union of the last
  // NT cursor positions, each with its own radius, so its shape is drawn by how you
  // moved: a long streak when you sweep, a blob when you stop. That is what stops it
  // reading as a compass circle — the outline comes from your movement, not a radius.
  const REACH = 300;       // px radius at the head of the wake
  const NT    = 16;        // trail length in samples — at 60fps, about 0.27s of history
  const TAIL  = 0.42;      // radius at the oldest end, as a fraction of REACH
  const FADE_T = 0.55;     // strength at the oldest end
  const CLEAR = 1.0;       // how much density the wake removes at its core
  const RING  = 0.13;      // dots piling up along the edge of the wake.
                           // Without it the clearing is invisible: white on almost-white.
  const WOB   = 0.42;      // coarse wander of the edge
  const WOB2  = 0.18;      // finer roughness on top

  // The click ring. It is not born at the cursor: the rim sits where the wake's
  // falloff crosses the RING peak — 0.866 of REACH out — so that is where the ring
  // starts, and the pixel you actually hit stays empty. Anything else looks like a
  // circle drawn on top of the texture rather than the texture letting go.
  const RMAX  = 3;         // concurrent rings; a fourth click drops the oldest
  const R_LIFE = 1.05;     // seconds from release to gone
  const R_R0  = REACH * 0.866;   // birth radius — the rim's own radius
  const R_RUN = 340;       // px travelled over that life
  const R_HW0 = 22, R_HW1 = 72;  // band half-width, birth → death. It disperses.
  // Crest density at birth. Not picked by eye: the rim it replaces is RING over a
  // 1-s² profile ~44px to either side of its peak, and the ring is a (1-s²)² profile
  // R_HW0 wide, so 0.13·44·4/3 = R_AMP·22·16/15 conserves the pile exactly. The pile
  // compacts as it lets go, which is why the crest lands well above MAXD.
  const R_AMP = RING * 44 * (4 / 3) / (R_HW0 * (16 / 15));
  const RW1   = 20, RW2 = 8;     // px of edge warp, from the wake's own two noise fields

  // Three travelling waves, each deliberately off-axis. Plain sin(x) + sin(y) terms
  // put the field's own structure on the horizontal and vertical, which is what made
  // the earlier version read as banding. Frequency is folded into the vector.
  const W1X =  1.60 * 0.94, W1Y = 1.60 *  0.34;   //  ~20°
  const W2X =  1.15 * -0.42, W2Y = 1.15 * 0.91;   // ~115°
  const W3X =  0.85 * 0.62, W3Y = 0.85 * -0.78;   //  ~-51°

  // 64x64 blue-noise threshold tile (void-and-cluster, generated offline).
  // An ordered Bayer matrix is the wrong tool at these densities: only the lowest
  // thresholds of each 8x8 cell ever fire, so every dot lands on the same lattice
  // position and the texture reads as a 32px grid. Blue noise has no lattice --
  // the dots stay evenly spaced without ever lining up. Measured on this tile at
  // one-tenth coverage: mean nearest-neighbour 2.60 cells, minimum 2.00; white
  // noise manages 1.71 / 1.00, i.e. it clumps.
  const NOISE_B64 = "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";
  const TILE = 64, TMASK = TILE - 1;
  const THR = (() => {
    const bin = atob(NOISE_B64), a = new Float32Array(bin.length);
    for (let i = 0; i < bin.length; i++) a[i] = (bin.charCodeAt(i) + 0.5) / 256;
    return a;
  })();

  // sine lookup — four sines per cell over a full screen of cells is exactly where
  // Math.sin would start costing real milliseconds
  const N = 2048, LUT = new Float32Array(N);
  for (let i = 0; i < N; i++) LUT[i] = Math.sin(i / N * Math.PI * 2);
  const S = a => LUT[((a * (N / (Math.PI * 2))) | 0) & (N - 1)];

  // pack the ink into a little-endian RGBA word: A<<24 | B<<16 | G<<8 | R
  function packInk(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return (0xff000000 | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0;
  }
  const css = p => getComputedStyle(document.documentElement).getPropertyValue(p).trim();
  const readInk = () => css("--ink") || "#f5f5f5";
  // A number off :root, with a floor and a fallback — the guards are only here to
  // survive a missing or malformed property, not to veto legitimate settings.
  // `>= 0` on the gain, not `> 0`: zero means "no texture at all", and treating it as
  // invalid handed the slider's far left end the loudest field instead of an empty one.
  const num = (p, dflt, min, max) => {
    const v = parseFloat(css(p));
    return Number.isFinite(v) && v >= min && v <= max ? v : dflt;
  };
  let DOT  = packInk(readInk());
  let GAIN = num("--dgain", 1.04, 0, 4);   // straight multiplier on the whole field
  let EDGE = num("--dedge", 0, 0, 1);      // density surviving at the very edge
  let PIX  = num("--dpix", 3, 1, 16) | 0;  // one cell, in CSS px

  let cols = 0, rows = 0, img = null, buf = null, hE = null, vE = null, rad = null, raf = 0, last = 0;

  // cursor: `near` fades the whole effect in and out.
  const OFF = -1e6;
  let mx = OFF, my = OFF, tx = OFF, ty = OFF, near = 0, tnear = 0;
  // the wake: recent positions, newest first, with per-point radius and strength
  // tapering towards the tail. Flat typed arrays, so the inner loop only touches those.
  const tX = new Float32Array(NT), tY = new Float32Array(NT);
  const tIR = new Float32Array(NT), tW = new Float32Array(NT), tDY = new Float32Array(NT);
  const tR2 = new Float32Array(NT);   // padded radius², for the per-row span test
  const PAD = 1.25;                   // the edge noise can push the outline out this far
  for (let n = 0; n < NT; n++) {
    const u = NT === 1 ? 0 : n / (NT - 1);
    const r = REACH * (1 - (1 - TAIL) * u);
    tIR[n] = 1 / (r * r);
    tR2[n] = (r * PAD) * (r * PAD);
    tW[n] = 1 - (1 - FADE_T) * u;
  }
  let filled = false;

  // the click rings: origin and birth time, oldest first. -1 as a birth time means
  // "the next frame decides" — the handler has no clock the field agrees with.
  const rpX = new Float32Array(RMAX), rpY = new Float32Array(RMAX), rpT = new Float64Array(RMAX);
  let nrip = 0;
  // per-frame geometry, derived from the above; per-row spans, derived from those
  const gCX = new Float32Array(RMAX), gCY = new Float32Array(RMAX), gR = new Float32Array(RMAX),
        gPAD = new Float32Array(RMAX), gIHW = new Float32Array(RMAX), gA = new Float32Array(RMAX);
  const sCX = new Float32Array(RMAX), sDY = new Float32Array(RMAX), sR = new Float32Array(RMAX),
        sIHW = new Float32Array(RMAX), sA = new Float32Array(RMAX),
        sLO = new Float32Array(RMAX), sHI = new Float32Array(RMAX),
        sGLO = new Float32Array(RMAX), sGHI = new Float32Array(RMAX);
  let nact = 0;
  let rimG = 1;            // the wake's rim, knocked to 0 by a click and rebuilding

  addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY; tnear = 1;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { tnear = 0; });
  addEventListener("blur", () => { tnear = 0; });

  // A click releases the rim. The dots piled along the edge of the wake stop being a
  // rim and leave as a ring — same radius, same density, now travelling — while the
  // wake grows a new one over the next half second. Both outlines are warped by the
  // same two noise fields, so the ring arrives as part of the texture instead of as a
  // circle laid over it. Nothing here touches the page: the canvas is
  // pointer-events:none and the handler is passive, so a click on a link or a slider
  // still does whatever it was going to do — it just does not also throw a ring out of
  // the control. Links are exempted for the same reason: leaving the page mid-ripple
  // looks like the click misfired.
  addEventListener("pointerdown", e => {
    if (reduce || e.pointerType === "touch" || e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest("a,.dock,.ctrlpanel")) return;
    if (nrip === RMAX) {
      for (let n = 1; n < RMAX; n++) { rpX[n - 1] = rpX[n]; rpY[n - 1] = rpY[n]; rpT[n - 1] = rpT[n]; }
      nrip--;
    }
    rpX[nrip] = e.clientX; rpY[nrip] = e.clientY; rpT[nrip] = -1; nrip++;
    rimG = 0;
    start();                 // a click on a tab that just came back still gets its ring
  }, { passive: true });

  function layout() {
    const w = innerWidth, h = innerHeight;
    cols = Math.ceil(w / PIX); rows = Math.ceil(h / PIX);
    cv.width = cols; cv.height = rows;
    cv.style.width = w + "px"; cv.style.height = h + "px";
    img = ctx.createImageData(cols, rows);
    buf = new Uint32Array(img.data.buffer);      // one 32-bit write per cell

    // The envelope, as two raw 0..1 ramps — one per axis, smoothstepped over the same
    // number of pixels on both. They are stored unscaled and combined per cell with
    // min(), not with a product: a product would square the falloff in the corners and
    // pull them noticeably thinner than the edges they meet at. Keeping EDGE and GAIN
    // out of them is also what lets those two sliders move without a relayout.
    hE = new Float32Array(cols);
    for (let i = 0; i < cols; i++) {
      const x = i * PIX + PIX / 2;
      const t = Math.min(1, Math.min(x, w - x) / FEDGE);
      hE[i] = t * t * (3 - 2 * t);
    }
    vE = new Float32Array(rows);
    for (let j = 0; j < rows; j++) {
      const y = j * PIX + PIX / 2;
      const t = Math.min(1, Math.min(y, h - y) / FEDGE);
      vE[j] = t * t * (3 - 2 * t);
    }
    // radius per cell for the ripple term — constant until the next resize
    rad = new Float32Array(cols * rows);
    const cx = w / 2, cy = h * 0.34;
    for (let j = 0, k = 0; j < rows; j++) {
      const dy = (j * PIX - cy) / 260;
      for (let i = 0; i < cols; i++, k++) {
        const dx = (i * PIX - cx) / 260;
        rad[k] = Math.sqrt(dx * dx + dy * dy);
      }
    }
  }

  function frame(ms) {
    const T = ms / 1000;
    // the envelope's two ends, folded together once a frame rather than per cell
    const gE = GAIN * EDGE, gI = GAIN * (1 - EDGE);

    // The head of the wake sits exactly on the pointer — no smoothing. Smoothing the
    // position here and *then* building a trail from it lagged twice over, which is
    // what made the whole thing feel like it was being dragged along behind.
    mx = tx; my = ty;
    near += (tnear - near) * 0.08;

    const live = near > 0.003 && mx !== OFF;
    let loY = 0, hiY = 0;
    if (live) {
      if (!filled) {
        for (let n = 0; n < NT; n++) { tX[n] = mx; tY[n] = my; }
        filled = true;
      } else {
        // Shift rather than ring-buffer, so slot 0 is always the newest and the radius
        // and strength tapers line up with actual age. With a rotating head they did
        // not, and the wake's shape was reshuffling itself every single frame.
        const ox0 = tX[0], oy0 = tY[0], jx = mx - ox0, jy = my - oy0;
        // a fast sweep gets intermediate samples, otherwise the wake breaks into beads
        let steps = Math.sqrt(jx * jx + jy * jy) / (REACH * 0.40);
        steps = steps < 1 ? 1 : (steps > 4 ? 4 : Math.ceil(steps));
        for (let s = 1; s <= steps; s++) {
          for (let n = NT - 1; n > 0; n--) { tX[n] = tX[n - 1]; tY[n] = tY[n - 1]; }
          const f = s / steps;
          tX[0] = ox0 + jx * f; tY[0] = oy0 + jy * f;
        }
      }
      loY = my; hiY = my;
      for (let n = 0; n < NT; n++) { const v = tY[n]; if (v < loY) loY = v; if (v > hiY) hiY = v; }
      loY -= REACH * PAD; hiY += REACH * PAD;
    } else { filled = false; }

    // Age the rings and drop the finished ones, compacting in place. Radius eases out
    // — an impulse against drag, most of the travel in the first third — and the crest
    // thins both with age and with its own circumference, which is why it fades from
    // the middle of its life rather than switching off at the end of it.
    nact = 0;
    let keep = 0;
    for (let n = 0; n < nrip; n++) {
      if (rpT[n] < 0) rpT[n] = T;
      const u = (T - rpT[n]) / R_LIFE;
      if (u >= 1) continue;
      const k1 = 1 - u;
      const r = R_R0 + R_RUN * (1 - k1 * k1);
      const hw = R_HW0 + (R_HW1 - R_HW0) * u;
      gCX[nact] = rpX[n]; gCY[nact] = rpY[n];
      gR[nact]  = r;
      gPAD[nact] = hw + RW1 + RW2;      // outer reach once the warp has had its say
      gIHW[nact] = 1 / hw;
      gA[nact]  = R_AMP * k1 * Math.sqrt(R_R0 / r);
      nact++;
      rpX[keep] = rpX[n]; rpY[keep] = rpY[n]; rpT[keep] = rpT[n]; keep++;
    }
    nrip = keep;
    rimG += (1 - rimG) * 0.045;         // ~0.4s to half, about as long as the ring lives

    const rpl = CLEAR * near, rng = RING * near * rimG;

    for (let j = 0, k = 0; j < rows; j++) {
      const y = j * PIX / 150, ve = vE[j];
      const q1 = W1Y * y, q2 = W2Y * y, q3 = W3Y * y;   // the row-constant half of each wave
      const wq = W2Y * 1.9 * y, wr = 3.3 * y;           // …and of the two edge-warp terms
      const trow = (j & TMASK) << 6;
      // whole rows sit outside the wake — test once, not a thousand times, and
      // pre-square the vertical distance to each trail point while we are here
      const py = j * PIX + PIX / 2;
      let rowLive = live && py > loY && py < hiY, xlo = 0, xhi = -1;
      if (rowLive) {
        // …and narrow it to the horizontal span the wake actually covers on this row,
        // otherwise the sixteen-point search runs across the whole width for nothing
        xlo = 1e9; xhi = -1e9;
        for (let n = 0; n < NT; n++) {
          const q = py - tY[n], dq = q * q; tDY[n] = dq;
          const rem = tR2[n] - dq;
          if (rem > 0) {
            const w = Math.sqrt(rem);
            if (tX[n] - w < xlo) xlo = tX[n] - w;
            if (tX[n] + w > xhi) xhi = tX[n] + w;
          }
        }
        if (xlo > xhi) rowLive = false;
      }
      // …same idea for the rings, except a ring is a band, not a disc: rows keep the
      // hole in the middle as an explicit gap to skip, or the interior of a 700px ring
      // costs more per frame than the entire rest of the screen.
      let nr = 0;
      for (let n = 0; n < nact; n++) {
        const dy = py - gCY[n], dq = dy * dy, ro = gR[n] + gPAD[n];
        if (dq >= ro * ro) continue;
        const out = Math.sqrt(ro * ro - dq);
        sCX[nr] = gCX[n]; sDY[nr] = dq; sR[nr] = gR[n]; sIHW[nr] = gIHW[n]; sA[nr] = gA[n];
        sLO[nr] = gCX[n] - out; sHI[nr] = gCX[n] + out;
        const ri = gR[n] - gPAD[n];
        if (ri > 0 && dq < ri * ri) {
          const inn = Math.sqrt(ri * ri - dq);
          sGLO[nr] = gCX[n] - inn; sGHI[nr] = gCX[n] + inn;
        } else { sGLO[nr] = 1e9; sGHI[nr] = -1e9; }
        nr++;
      }
      for (let i = 0; i < cols; i++, k++) {
        const he = hE[i], e = he < ve ? he : ve;
        const m = gE + gI * e;
        if (m <= 0) { buf[k] = 0; continue; }        // gain at zero: nothing at all
        const x = i * PIX / 150;

        const v = (S(W1X * x + q1 + T * 0.16) +
                   S(W2X * x + q2 - T * 0.11) +
                   S(W3X * x + q3 + T * 0.20) +
                   S(rad[k] * 3.10 - T * 0.25)) * 0.25;
        const g = v * 0.5 + 0.5;                      // → 0..1
        // cubed: density collects in the bright folds of the field and leaves the
        // rest genuinely white, instead of spreading an even grain everywhere
        let d = MAXD * g * g * g;

        const px = i * PIX + PIX / 2;
        // the two noise fields that roughen every outline in here. Computed at most
        // once per cell and shared by the wake and the rings — separate noise would
        // let the ring leave along an edge the wake never had.
        let nz1 = 0, nz2 = 0, nz = false;
        if (rowLive && px >= xlo && px <= xhi) {
          // the wake is the union of the trail points — whichever one reaches this
          // cell hardest wins, which is what welds them into one flowing shape
          let t = 0;
          for (let n = 0; n < NT; n++) {
            const q = px - tX[n];
            const u = (1 - (q * q + tDY[n]) * tIR[n]) * tW[n];
            if (u > t) t = u;
          }
          if (t > 0) {
            // roughen the outline so even a standing cursor is not a clean disc
            nz1 = S(W2X * 1.9 * x + wq + T * 0.13); nz2 = S(4.7 * x + wr - T * 0.45); nz = true;
            t += WOB * nz1 + WOB2 * nz2;
            if (t > 0) {
              if (t > 1) t = 1;
              const b = t * t;
              d *= (1 - rpl * b);
              const s = (t - 0.25) * 4, rim = 1 - s * s;   // dots shoved to the edge
              if (rim > 0) d += rng * rim;
            }
          }
        }
        // the rings add, and add after the wake's clearing: a ring is born inside the
        // hole it was released from and has to survive crossing it
        for (let n = 0; n < nr; n++) {
          if (px < sLO[n] || px > sHI[n] || (px > sGLO[n] && px < sGHI[n])) continue;
          if (!nz) { nz1 = S(W2X * 1.9 * x + wq + T * 0.13); nz2 = S(4.7 * x + wr - T * 0.45); nz = true; }
          const q = px - sCX[n];
          const s = (Math.sqrt(q * q + sDY[n]) - sR[n] - RW1 * nz1 - RW2 * nz2) * sIHW[n];
          if (s > -1 && s < 1) { const b = 1 - s * s; d += sA[n] * b * b; }
        }
        buf[k] = (d * m) > THR[trow | (i & TMASK)] ? DOT : 0;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // 60fps while the pointer is engaged — at 30 the wake is always one step behind your
  // hand no matter how little it lags. Back to 30 when nobody is pointing at it.
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - last < (near > 0.01 || nrip ? 15 : 32)) return;
    last = ts; frame(ts);
  }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }

  function apply() {
    layout();
    if (reduce) { stop(); frame(0); return; }        // one static frame, no motion
    start();
  }

  // A running loop picks new ink up on its next frame; a stopped one (reduced motion,
  // or a hidden tab that comes back) needs to be redrawn by hand. Gain and edge are
  // read straight into the next frame; only the cell size costs a relayout, because it
  // is the one that changes how many cells there are.
  addEventListener("themechange", () => {
    DOT  = packInk(readInk());
    GAIN = num("--dgain", 1.04, 0, 4);
    EDGE = num("--dedge", 0, 0, 1);
    const p = num("--dpix", 3, 1, 16) | 0;
    if (p !== PIX) { PIX = p; if (img) layout(); }
    if (!raf && img) frame(last);
  });

  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(apply, 120); });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : apply());
  apply();
})();
