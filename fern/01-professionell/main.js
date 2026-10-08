(() => {
  const A = '../assets/';
  const vid = (n) => A + 'video/' + n;
  const poster = (n) => A + 'video/posters/' + n + '.jpg';
  // Downscaled variants live in img-sized/<base>-800.webp and -1600.webp
  const sized = (f) => {
    const base = encodeURI(A + 'img-sized/' + f.replace(/\.[a-z0-9]+$/i, ''));
    return { src: base + '-800.webp', srcset: `${base}-800.webp 800w, ${base}-1600.webp 1600w` };
  };
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };

  /* ---------- Content ---------- */
  // a = height / width of the tile
  const TILES = [
    { file: '6977644d59608dba153ebf66_bts_1.avif', a: .62 },
    { file: '69c4125ebb83d00a4dbcdb05_fern-team-member-26.avif', a: 1.18 },
    { video: 'Sponsors-Hero-approved-SHORTENED', a: 1.25 },
    { file: '69c2b04333edb3f7a40992a4_Contact_002.avif', a: .62 },
    { file: '69f83ec37a076a7f0ee345be_fern.avif', a: 1 },
    { file: '6977644de25e1f9f2cc7cd3c_big_bts_4.avif', a: .7 },
    { file: '69f88a6c0bbd656a9214961e_fern-team-1222.avif', a: 1.2 },
    { video: 'AboutUs-Vid1-Final-approved-SHORTENED', a: .8 },
    { file: '69959341cf0f9e00393f80bd_home-2.avif', a: .72 },
    { file: '69c410ecdc64daf0ffeaf1b1_fern-team-member-11.avif', a: 1 },
    { file: '6977644dfbe196b4e4546ed0_bts_extra1.avif', a: .62 },
    { file: '69c4126d02480a3439b9e2d9_fern-team-member-28.avif', a: 1 },
    { video: 'Jobs-Hero-Approved-SHORTENED', a: 1.3 },
    { file: '69c2b043020e82663f9a9d3a_Contact_010.avif', a: .62 },
    { file: '69f88a90b2111c3751c82ba9_fern-team-3211.avif', a: 1 },
    { file: '698396b39da63915014e62d9_vlcsnap-2026-02-04-20h56m42s829.avif', a: .5 },
    { file: '69f39095be642e6f3c05f818_fern-222.avif', a: 1.12 },
    { file: '69b120c0236144310a24bb67_sponsors.avif', a: 1 },
    { file: '69c41121d1adcbc581e21e1d_fern-team-member-22.avif', a: 1.1 },
    { file: '6a042ddc75a62567cafb9cb9_fern-team-2321.avif', a: 1 },
    { file: '69c410cc801e88cb4ec5ac99_compressed_fern-team-member-9.avif', a: 1.18 },
    { file: '69f83ef0f7a3d92b1b717a70_fern-team-34.avif', a: 1 },
    { file: '69c40c158df34c3525280876_cristian kiesling.avif', a: 1 },
    { file: '69c4117dbcda107622657065_fern-team-member-15.avif', a: 1 },
    { file: '69f88a4394b0c4b7b0448de3_fernteam11.avif', a: 1 },
    { file: '69c41253305b28ee30a5bcf7_fern-team-member-24.avif', a: 1 },
    { file: '69c51ca9dafb7e91bddfc03e_fern-team-member-83.avif', a: 1 },
    { file: '69f83f6a0c0f40f1c2a1f0db_fern-team-45665.avif', a: .94 },
  ];

  const FACES = [
    '69c4124c3bed076dba5f0508_fern-team-member-23.avif',
    '69f38f31871ee33ccc90b6f5_fern1.avif',
    '69c41175648e8c0be3d37ca4_fern-team-member-14.avif',
    '69c40fbadc91dd26af6bf8be_fern-team-member-3.avif',
    '69f38f22035faa230e365e32_fern2.avif',
    '69c411bd2d206eafdaa6654b_fern-team-member-18.avif',
    '69f83f2218db148464971203_fern-team-433.avif',
  ];
  const FACES2 = [
    '69c410852f27461d6eb8bf04_fern-team-member-222.avif',
    '69f88ac8ce6bf85ea3904f9b_fern-team-11132.avif',
    '69c40f661f39e0bc3dbdedfd_fern-team-member-4.avif',
    '69c411e0ec4a365231225737_compressed_fern-team-member-20.avif',
    '69c411b06e1cd0abfc18cb57_fern-team-member-234.avif',
  ];

  // [file, name, rendered height in px] heights balance the optical weight of each mark
  const LOGOS = [
    ['6995b6b7220fd08050da1b8e_nyt.svg', 'The New York Times', 23],
    ['6995b6b753b5b6c6d7319fa1_wp.svg', 'The Washington Post', 22],
    ['6995b6b7866fc8a3445d9206_bbc.svg', 'BBC', 19],
    ['6995b6b756344bc741748c17_occrp.svg', 'OCCRP', 24],
    ['6995b6b76b85d83ace20f213_veritasium.svg', 'Veritasium', 30],
    ['6995b6b712ed6eae703aa529_dossier.svg', 'Dossier', 26],
    ['6995b6b7b71f35ee36120df8_the-examination.svg', 'The Examination', 18],
  ];

  const LAURELS = [
    ['69c3fc1ed6d24a98b88b1f8e_DAF.avif', 'Winner DAfFNE 2024/25, TV Journalism', ''],
    ['69c3fc33827c55f5334a7d6b_PE.avif', 'Nomination Prix Europa 2024', ''],
    ['69c3fc3a039c2dbadc81dfd2_RDO.avif', "Nomination Rose d'Or 2024", ''],
    ['6a579568790a84c9ea0921fb_shorty-doc.avif', 'Winner Shorty Awards 2026, Documentary', ''],
    ['6a5795763db98c279dc16160_shorty-ah.avif', 'Audience Honor Shorty Awards 2026', ''],
    ['6a57958f790a84c9ea0945e3_telly-gsi.avif', 'Gold Telly Awards 2026, General Social Impact', ''],
    ['6a5795864389e378bc69d102_telly-pt.avif', "Gold Telly Awards 2026, People's Telly", 'm-only'],
  ];

  const faces = (el, list) => {
    el.innerHTML = list.map((f) => `<img src="${sized(f).src}" width="40" height="40" alt="fern team member" decoding="async">`).join('');
  };
  faces(document.getElementById('faces'), FACES);
  faces(document.getElementById('faces2'), FACES2);

  // First set is announced, the loop copies are hidden from assistive tech
  const logoSet = (hidden) => LOGOS.map(([f, alt, h]) => `<img src="${A}logos/${f}" alt="${hidden ? '' : alt}" data-logo="${alt}" style="--h:${h}px" draggable="false" loading="lazy" decoding="async"${hidden ? ' aria-hidden="true"' : ''}>`).join('');
  const track = document.getElementById('marquee');
  track.innerHTML = logoSet(false) + logoSet(true) + logoSet(true) + logoSet(true);
  // Dossier ships as white letters on white discs; render the discs as outlines so the word reads on black
  fetch(A + 'logos/6995b6b712ed6eae703aa529_dossier.svg').then((r) => r.text()).then((svg) => {
    const fixed = svg.replace('.st0,.st1{fill:#fff;stroke:#fff;stroke-miterlimit:10}', '.st0{fill:none;stroke:#fff;stroke-miterlimit:10}.st1{fill:#fff;stroke:none}');
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fixed);
    track.querySelectorAll('img[data-logo="Dossier"]').forEach((im) => { im.src = url; im.classList.add('is-raw'); });
  }).catch(() => {});

  document.getElementById('laurels').innerHTML = LAURELS
    .map(([f, alt, c], i) => {
      const s = sized(f);
      const sz = i === 0 ? '(max-width: 720px) 92vw, 460px' : '(max-width: 720px) 46vw, 230px';
      return `<figure class="${c}"><img src="${s.src}" srcset="${s.srcset}" sizes="${sz}" width="1138" height="875" alt="${alt}" loading="lazy" decoding="async"></figure>`;
    }).join('');

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  const fine = matchMedia('(pointer: fine)').matches;
  if (window.Lenis && fine && !RM) {
    lenis = new Lenis({ lerp: .11, wheelMultiplier: .95 });
  }

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navOffset = () => (innerWidth <= 720 ? 80 : 96);
  const targetY = (el) => (el.id === 'top' ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - navOffset()));
  const scrollToEl = (el, instant) => {
    const y = targetY(el);
    if (lenis && !instant) lenis.scrollTo(y, { duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: instant || RM ? 'auto' : 'smooth' });
  };

  const closeMenu = (refocus) => {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (refocus) burger.focus();
  };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    if (open) nav.querySelector('.nav__sheet a').focus();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });
  document.addEventListener('pointerdown', (e) => { if (!nav.contains(e.target)) closeMenu(false); });

  // In-page links: smooth scroll, offset under the fixed nav, one history entry per jump
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      closeMenu(false);
      if (location.hash !== '#' + id) history.pushState({ id }, '', '#' + id);
      scrollToEl(t);
      // keyboard activation: move focus to the section without a second jump
      if (e.detail === 0 && id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });
  addEventListener('popstate', () => {
    const t = document.getElementById(location.hash.slice(1) || 'top');
    if (t) scrollToEl(t);
  });

  if (window.lottie) {
    const anim = lottie.loadAnimation({
      container: document.getElementById('logo-lottie'),
      renderer: 'svg', loop: false, autoplay: false,
      path: A + 'logos/692c6126d933cf487418969d_ferm-lottie-02-optimized.json',
    });
    anim.addEventListener('DOMLoaded', () => {
      nav.classList.add('has-lottie');
      if (RM) anim.goToAndStop(anim.totalFrames - 1, true);
      else setTimeout(() => anim.play(), 300);
    });
    const replay = () => { if (!RM) anim.goToAndPlay(0, true); };
    const logoLink = nav.querySelector('.nav__logo');
    logoLink.addEventListener('mouseenter', replay);
    logoLink.addEventListener('focus', replay);
  }

  // Active section in the nav
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  let activeId = '';
  const renderNav = () => {
    nav.classList.toggle('is-compact', scrollY > 40);
    const line = innerHeight * .4;
    let id = 'top';
    for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.dataset.section;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) id = 'contact';
    if (id === activeId) return;
    activeId = id;
    navLinks.forEach((l) => {
      const on = l.dataset.nav === id;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };

  /* ---------- Wall: masonry that gathers into one card ---------- */
  const stage = document.getElementById('stage');
  const tilesEl = document.getElementById('tiles');
  const card = document.getElementById('card');
  const halo = document.getElementById('halo');
  const caption = document.getElementById('caption');
  const wall = document.getElementById('wall');

  // Deterministic jitter so every visit looks the same
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Tile DOM pool, built once and reused across layouts
  const pool = [];
  let wallNear = false;
  const attach = (im) => {
    if (!im.dataset.src || im.getAttribute('src')) return;
    im.srcset = im.dataset.srcset;
    im.src = im.dataset.src;
  };
  const makeTile = (t) => {
    const el = document.createElement('div');
    el.className = 'tile';
    if (t.video) {
      el.innerHTML = `<video muted loop playsinline preload="none" poster="${poster(t.video)}"><source src="${vid(t.video)}.webm" type="video/webm"><source src="${vid(t.video)}.mp4" type="video/mp4"></video>`;
      el.video = el.firstChild;
    } else {
      // Sources are attached once the wall approaches the viewport (see wallIO); tiles fade in when decoded
      const s = sized(t.file);
      const im = document.createElement('img');
      im.alt = '';
      im.decoding = 'async';
      im.dataset.src = s.src;
      im.dataset.srcset = s.srcset;
      im.addEventListener('load', () => im.classList.add('is-loaded'), { once: true });
      el.appendChild(im);
      if (wallNear) attach(im);
    }
    tilesEl.appendChild(el);
    return el;
  };

  let L = null; // layout
  const layout = () => {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const mobile = vw < 720;
    const N = vw >= 1100 ? 6 : vw >= 720 ? 5 : 3;
    const gap = mobile ? 8 : 14;
    const wallW = vw * (mobile ? 1.22 : 1.1);
    const left0 = (vw - wallW) / 2;
    const colW = (wallW - gap * (N - 1)) / N;
    const offsets = [.14, .03, .19, .07, .16, .0].map((o) => o * colW * 1.4);
    const speeds = [.08, -.05, .12, -.02, .1, .02];
    const cols = Array.from({ length: N }, (_, c) => ({ h: vh * .03 + offsets[c % 6], items: [] }));
    const heroCol = Math.floor((N - 1) / 2) + (N === 6 ? 1 : 0);

    // Final card rect
    const wide = vw >= 900;
    const cardW = wide ? Math.min(vw * .47, 780) : Math.min(vw - 40, 560);
    const cardH = cardW * 9 / 16;
    const cx = wide ? vw - Math.max(56, vw * .065) - cardW / 2 : vw / 2;
    const cy = wide ? vh * .5 : Math.max(110 + cardH / 2, vh * .3);

    // Fill columns, hero lands as the second item of its column
    const items = [];
    let k = 0;
    const target = vh * 1.6;
    while (cols.some((c) => c.h < target) && k < 120) {
      const col = cols.reduce((m, c) => (c.h < m.h ? c : m), cols[0]);
      const ci = cols.indexOf(col);
      if (ci === heroCol && col.items.length === 1 && !items.some((i) => i.hero)) {
        const h = colW * 9 / 16;
        const it = { hero: true, c: ci, x: left0 + ci * (colW + gap), y: col.h, w: colW, h };
        col.items.push(it); items.push(it); col.h += h + gap;
        continue;
      }
      const t = TILES[k % TILES.length];
      const h = colW * t.a;
      const it = { t, idx: k, c: ci, x: left0 + ci * (colW + gap), y: col.h, w: colW, h };
      col.items.push(it); items.push(it); col.h += h + gap; k++;
    }

    seed = 7;
    items.filter((i) => !i.hero).forEach((it) => {
      if (!pool[it.idx]) pool[it.idx] = makeTile(it.t);
      it.el = pool[it.idx];
      it.el.style.display = '';
      it.el.style.width = it.w + 'px';
      it.el.style.height = it.h + 'px';
      const im = it.el.querySelector('img');
      if (im) im.sizes = Math.ceil(colW) + 'px';
      it.rot = (rand() - .5) * 14;
      it.jx = (rand() - .5) * cardW * .18;
      it.jy = (rand() - .5) * cardH * .2;
    });
    pool.forEach((el, i) => { if (el && !items.some((it) => it.idx === i)) el.style.display = 'none'; });

    // Stagger: tiles near the card leave last so the gather reads from the edges inward
    const hero = items.find((i) => i.hero);
    const hx = hero.x + hero.w / 2;
    const hy = hero.y + hero.h / 2;
    const maxD = Math.hypot(vw, vh * 1.2);
    items.forEach((it) => { it.d = clamp(Math.hypot(it.x + it.w / 2 - hx, it.y + it.h / 2 - hy) / maxD); });

    card.style.width = cardW + 'px';
    card.style.height = cardH + 'px';
    halo.style.width = cardW * 1.9 + 'px';
    halo.style.height = cardH * 2.1 + 'px';

    if (wide) {
      caption.style.left = Math.max(40, vw * .065) + 'px';
      caption.style.top = cy + 'px';
      caption.style.width = Math.min(440, cx - cardW / 2 - vw * .065 - 60) + 'px';
      caption.dataset.mode = 'side';
    } else {
      caption.style.left = '20px';
      caption.style.top = cy + cardH / 2 + 40 + 'px';
      caption.style.width = vw - 40 + 'px';
      caption.dataset.mode = 'below';
    }

    L = { vw, vh, mobile, wide, N, speeds, items, hero, cardW, cardH, cx, cy };
  };

  const renderWall = () => {
    if (!L) return;
    const r = wall.getBoundingClientRect();
    const { vh, speeds, items, hero, cardW, cardH, cx, cy } = L;
    if (r.bottom < -50 || r.top > vh + 50) {
      for (const it of items) if (it.el && it.el.video && !it.el.video.paused) it.el.video.pause();
      return;
    }
    const travel = r.height - vh;
    const p = clamp(-r.top / travel);
    // 0 when the wall top sits at the viewport bottom, 1 once it is pinned
    const pre = clamp(1 + r.top / vh);

    if (RM) {
      // Reduced motion: no drift, no flight, no tilt. The wall simply fades into the card.
      const tilesO = 1 - smooth(.1, .4, p);
      const cardO = smooth(.3, .55, p);
      for (const it of items) {
        if (it.hero) continue;
        it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0)`;
        it.el.style.opacity = tilesO;
        it.el.style.visibility = tilesO <= .001 ? 'hidden' : 'visible';
      }
      card.style.transform = `translate3d(${cx - cardW / 2}px, ${cy - cardH / 2}px, 0)`;
      card.style.opacity = cardO;
      card.style.visibility = cardO <= .001 ? 'hidden' : 'visible';
      card.style.setProperty('--meta', String(cardO));
      halo.style.transform = `translate3d(${cx - cardW * .95}px, ${cy - cardH * 1.05}px, 0)`;
      halo.style.opacity = String(cardO * .8);
      const capO = smooth(.4, .62, p);
      caption.style.opacity = String(capO);
      caption.style.transform = caption.dataset.mode === 'side' ? 'translateY(-50%)' : 'none';
      caption.style.pointerEvents = capO > .5 ? 'auto' : 'none';
      return;
    }

    // where the sticky stage currently sits in the viewport
    const stageTop = r.top > 0 ? r.top : Math.min(0, r.bottom - vh);
    const drift = easeOut(clamp(p / .4));
    const scaleWall = lerp(1, .94, smooth(0, .25, p));
    const heroT = easeInOut(clamp((p - .1) / .4));
    const tilt = easeInOut(clamp((p - .42) / .28));
    const capT = easeOut(clamp((p - .58) / .17));

    stage.style.setProperty('--fadeTop', String(clamp(pre * 1.2) * (1 - heroT * .8)));
    stage.style.setProperty('--amb', String(1 - smooth(0, .3, p)));

    const pos = (it) => {
      const sp = speeds[it.c % 6];
      const dy = -vh * (.22 + sp) * drift + (1 - pre) * vh * sp * .6;
      const x = it.x + it.w / 2;
      const y = it.y + it.h / 2 + dy;
      return { x: L.vw / 2 + (x - L.vw / 2) * scaleWall, y: vh / 2 + (y - vh / 2) * scaleWall, s: scaleWall };
    };

    for (const it of items) {
      if (it.hero) continue;
      const s0 = pos(it);
      const start = .06 + (1 - it.d) * .16;
      const t = clamp((p - start) / .32);
      const e = easeInOut(t);
      const tx = lerp(s0.x, cx + it.jx * (1 - e * .6), e);
      const ty = lerp(s0.y, cy + it.jy * (1 - e * .6), e);
      const sc = lerp(s0.s, (cardW * .5) / it.w, e);
      const rz = it.rot * Math.sin(e * Math.PI) * .8;
      const o = 1 - smooth(.62, .98, t);
      it.el.style.transform = `translate3d(${tx - it.w / 2}px, ${ty - it.h / 2}px, 0) scale(${sc}) rotate(${rz}deg)`;
      it.el.style.opacity = o;
      it.el.style.visibility = o <= .001 ? 'hidden' : 'visible';
      it.el.style.zIndex = String(Math.round((1 - it.d) * 100));
      if (it.el.video) {
        const vy = ty + stageTop;
        const show = o > .05 && vy + it.h * sc / 2 > vh * .1 && vy - it.h * sc / 2 < vh * .9;
        if (show && it.el.video.paused) it.el.video.play().catch(() => {});
        else if (!show && !it.el.video.paused) it.el.video.pause();
      }
    }

    const h0 = pos(hero);
    const hx = lerp(h0.x, cx, heroT);
    const hy = lerp(h0.y, cy, heroT);
    const hs = lerp((hero.w * h0.s) / cardW, 1, heroT);
    const rx = L.wide ? 9 * tilt : 14 * tilt;
    const ry = L.wide ? -17 * tilt : 0;
    const rzc = L.wide ? 1.5 * tilt : -2 * tilt;
    card.style.transform = `translate3d(${hx - cardW / 2}px, ${hy - cardH / 2}px, 0) scale(${hs}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rzc}deg)`;
    card.style.borderRadius = lerp(10 / hs, 18, heroT) + 'px';
    card.style.boxShadow = `0 0 0 1px rgba(255,255,255,${.06 + .06 * tilt}), 0 ${40 * tilt}px ${120 * tilt}px rgba(0,0,0,${.7 * tilt})`;
    card.style.setProperty('--sheen', String(tilt));
    card.style.setProperty('--meta', String(capT));

    halo.style.transform = `translate3d(${hx - cardW * .95}px, ${hy - cardH * 1.05 + 20 * tilt}px, 0)`;
    halo.style.opacity = String(heroT * .95);

    caption.style.opacity = String(capT);
    const capY = caption.dataset.mode === 'side' ? -50 : 0;
    caption.style.transform = `translate3d(0, calc(${capY}% + ${(1 - capT) * 34}px), 0)`;
    caption.style.pointerEvents = capT > .5 ? 'auto' : 'none';
  };

  /* ---------- Manifesto word reveal ---------- */
  const paras = [...document.querySelectorAll('[data-words]')];
  paras.forEach((p) => {
    p.innerHTML = p.textContent.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? w : `<span class="w">${w}</span>`)).join('');
  });
  const words = paras.map((p) => [...p.querySelectorAll('.w')]);
  const renderWords = () => {
    if (RM) return;
    const vh = innerHeight;
    paras.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) {
        if (r.bottom < 0 && !p.done) { words[i].forEach((w) => (w.style.opacity = 1)); p.done = true; }
        return;
      }
      p.done = false;
      const prog = clamp((vh * .85 - r.top) / (r.height + vh * .3));
      const n = words[i].length;
      words[i].forEach((w, j) => {
        w.style.opacity = String(.16 + .84 * clamp(prog * (n + 4) - j, 0, 1));
      });
    });
  };

  /* ---------- Scroll reveal ---------- */
  const rvs = [...document.querySelectorAll('.rv')];
  if (RM || !('IntersectionObserver' in window)) {
    rvs.forEach((el) => el.classList.add('in'));
  } else {
    // stagger siblings that enter together
    const groups = new Map();
    rvs.forEach((el) => {
      const k = el.parentElement;
      const i = groups.get(k) || 0;
      groups.set(k, i + 1);
      el.style.setProperty('--d', Math.min(i, 5) * .07 + 's');
    });
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach((el) => rio.observe(el));
  }

  /* ---------- Rail: drag + buttons, only when it overflows ---------- */
  const rail = document.getElementById('rail');
  const railCtrl = document.getElementById('railctrl');
  const [prevBtn, nextBtn] = railCtrl.querySelectorAll('.rail__btn');
  const step = () => rail.querySelector('.fcard').offsetWidth + 16;
  const updateRail = () => {
    const over = rail.scrollWidth > rail.clientWidth + 4;
    rail.classList.toggle('is-overflow', over);
    railCtrl.hidden = !over;
    prevBtn.disabled = rail.scrollLeft < 4;
    nextBtn.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
  };
  rail.addEventListener('scroll', updateRail, { passive: true });
  updateRail();
  let down = null;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || !rail.classList.contains('is-overflow')) return;
    down = { x: e.clientX, s: rail.scrollLeft, moved: false };
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 4 && !down.moved) { down.moved = true; rail.classList.add('is-drag'); }
    if (down.moved) rail.scrollLeft = down.s - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    if (down.moved) {
      const s = rail.scrollLeft;
      rail.classList.remove('is-drag');
      rail.scrollLeft = s;
      rail.scrollTo({ left: Math.round(s / step()) * step(), behavior: RM ? 'auto' : 'smooth' });
    }
    down = null;
  });
  [prevBtn, nextBtn].forEach((b) => {
    b.addEventListener('click', () => rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: RM ? 'auto' : 'smooth' }));
  });

  /* ---------- Loop: only does work when the scroll position or layout changed ---------- */
  let lastY = -1;
  let dirty = true;
  const frame = (time) => {
    if (lenis) lenis.raf(time);
    if (dirty || scrollY !== lastY) {
      lastY = scrollY;
      dirty = false;
      renderWall();
      renderWords();
      renderNav();
    }
    requestAnimationFrame(frame);
  };

  let rT;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => { layout(); updateRail(); dirty = true; }, 120);
  });
  // back to the tab: recompute once, videos are resumed by the observers
  document.addEventListener('visibilitychange', () => { if (!document.hidden) dirty = true; });

  layout();
  renderWall();
  requestAnimationFrame(frame);

  /* ---------- Lazy video play/pause ---------- */
  // Tile videos are driven by renderWall. Everything else plays only while visible.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
    });
  }, { rootMargin: '100px' });
  document.querySelectorAll('[data-autoplay]').forEach((v) => {
    if (RM) { v.controls = true; return; }
    io.observe(v);
  });

  // Attach wall image sources shortly before the wall scrolls in
  const wallIO = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    wallNear = true;
    tilesEl.querySelectorAll('img').forEach(attach);
    wallIO.disconnect();
  }, { rootMargin: '0px 0px 60% 0px' });
  wallIO.observe(wall);

  // Deep link on load: land below the nav
  if (location.hash.length > 1) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) requestAnimationFrame(() => scrollToEl(t, true));
  }
})();
