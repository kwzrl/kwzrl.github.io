/* fern. desktop: interactions */
(() => {
  'use strict';

  const A = '../assets/';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqMobile = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* ---------- menu bar clock ---------- */
  const clock = $('#clock');
  const tick = () => {
    const d = new Date();
    const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    clock.textContent = `${day}  ${time}`;
    clock.dateTime = d.toISOString();
  };
  tick();
  setInterval(tick, 1000);

  /* ---------- mobile menu ---------- */
  const toggle = $('#menuToggle'), menu = $('#mobileMenu');
  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
  const closeMenu = (focusToggle) => { if (menu.hidden) return; menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); if (focusToggle) toggle.focus(); };
  toggle.addEventListener('click', () => { if (!menu.hidden) { const first = menu.querySelector('a'); if (first) first.focus(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('#mobileMenu, #menuToggle')) closeMenu(false); });

  /* active nav item follows the section in view */
  const navLinks = $$('.mb-nav a');
  const navTargets = navLinks.map(a => $(a.getAttribute('href')));
  const setActive = () => {
    /* the section whose top most recently passed 40% of the viewport wins */
    let idx = 0, best = -Infinity;
    navTargets.forEach((t, i) => {
      if (!t || i === 0) return;
      const top = t.getBoundingClientRect().top;
      if (top < innerHeight * 0.4 && top > best) { best = top; idx = i; }
    });
    const mob = $$('.mb-menu a');
    navLinks.forEach((a, i) => { a.classList.toggle('is-active', i === idx); a.toggleAttribute('aria-current', i === idx); if (mob[i]) mob[i].classList.toggle('is-active', i === idx); });
  };

  /* ---------- lottie wordmark (recoloured to ink) ---------- */
  const recolor = node => {
    if (Array.isArray(node)) { node.forEach(recolor); return; }
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      const v = node[key];
      if ((key === 'c' || key === 'sc' || key === 'fc') && v && Array.isArray(v.k) && v.k.length >= 3 && typeof v.k[0] === 'number') {
        v.k = [0, 0, 0, v.k[3] ?? 1];
      } else recolor(v);
    }
  };
  const logoFallback = el => { el.innerHTML = `<img src="${A}logos/691b4cb1e4fb8fcf1cf543a3_fern-logo.svg" alt="fern." style="width:100%;height:100%;filter:brightness(0)">`; };
  const lotties = {};
  fetch(A + 'logos/692c6126d933cf487418969d_ferm-lottie-02-optimized.json')
    .then(r => r.json())
    .then(data => {
      if (!window.lottie) throw new Error('no lottie');
      recolor(data);
      const make = (el, autoplay) => window.lottie.loadAnimation({
        container: el, renderer: 'svg', loop: false, autoplay,
        animationData: JSON.parse(JSON.stringify(data)),
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
      const wm = $('#wordmark');
      lotties.hero = make(wm, false);
      if (reduced) lotties.hero.addEventListener('DOMLoaded', () => lotties.hero.goToAndStop(lotties.hero.totalFrames - 1, true));
      else setTimeout(() => lotties.hero.play(), 350);
      wm.addEventListener('mouseenter', () => lotties.hero.goToAndPlay(0, true));
      wm.addEventListener('click', () => lotties.hero.goToAndPlay(0, true));
      lotties.sig = make($('#sigMark'), false);
      if (reduced) lotties.sig.addEventListener('DOMLoaded', () => lotties.sig.goToAndStop(lotties.sig.totalFrames - 1, true));
    })
    .catch(() => { logoFallback($('#wordmark')); logoFallback($('#sigMark')); });

  /* ---------- loading: window bodies show a skeleton until their media is there ---------- */
  const markReady = body => body.classList.add('ready');
  const wireBody = body => {
    const img = body.querySelector('img'), vid = body.querySelector('video');
    if (vid) {
      const done = () => markReady(body);
      if (vid.poster) { const pi = new Image(); pi.onload = pi.onerror = done; pi.src = vid.poster; } else done();
      vid.addEventListener('loadeddata', done, { once: true });
    } else if (img) {
      if (img.complete && img.naturalWidth) markReady(body);
      else { img.addEventListener('load', () => markReady(body), { once: true }); img.addEventListener('error', () => markReady(body), { once: true }); }
    }
  };
  $$('.win-body').forEach(wireBody);
  const fadeImg = img => {
    if (img.closest('.win-body') || img.closest('.menubar')) return;
    if (img.complete && img.naturalWidth) return;
    img.classList.add('fade');
    const done = () => img.classList.add('is-loaded');
    img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true });
  };
  $$('img').forEach(fadeImg);

  /* ---------- hero entry ---------- */
  $$('.scatter > *').forEach((el, i) => el.style.setProperty('--d', (0.25 + (i % 9) * 0.07 + Math.floor(i / 9) * 0.05).toFixed(2) + 's'));
  if (reduced) document.body.classList.add('is-ready');
  else requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-ready'), 80));

  /* timecode sticker, 25 fps */
  const tc = $('#tc');
  const t0 = performance.now();
  const pad = n => String(n).padStart(2, '0');
  const tcLoop = () => {
    const f = Math.floor((performance.now() - t0) / 40);
    const s = Math.floor(f / 25);
    tc.textContent = `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % 25)}`;
  };
  setInterval(tcLoop, 40);

  /* ---------- lazy videos: attach sources near viewport, play only while visible ---------- */
  const lazyVids = $$('video[data-src]');
  const attach = v => {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    const name = v.dataset.src;
    v.innerHTML = `<source src="${A}video/${name}.webm" type="video/webm"><source src="${A}video/${name}.mp4" type="video/mp4">`;
    v.load();
  };
  /* only the hero reel loads right away; the small desktop windows wait until it is playing */
  let heroGateOpen = false;
  const visible = new Set();
  const start = v => {
    if (reduced) return;                       /* reduced motion: posters only, play on request */
    if (v.closest('.scatter') && !heroGateOpen) return;
    attach(v);
    const p = v.play(); if (p) p.catch(() => {});
  };
  const vidIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { visible.add(v); start(v); }
      else { visible.delete(v); if (v.dataset.loaded) v.pause(); }
    });
  }, { rootMargin: '100px 0px' });
  lazyVids.forEach(v => vidIO.observe(v));
  const openGate = () => {
    if (heroGateOpen) return;
    heroGateOpen = true;
    visible.forEach(v => { if (v.closest('.scatter')) start(v); });
  };
  const reelEl = $('#reelVideo');
  /* desktop windows start once the reel is fully playable, plus a pause so the first impression stays light */
  const gateLater = () => setTimeout(openGate, 4500);
  if (reelEl.readyState >= 4) gateLater(); else reelEl.addEventListener('canplaythrough', gateLater, { once: true });
  setTimeout(openGate, 10000);
  /* the reel itself: pause when off screen, never autoplay with reduced motion */
  if (reduced) { reelEl.removeAttribute('autoplay'); reelEl.pause(); reelEl.preload = 'metadata'; }
  new IntersectionObserver(es => es.forEach(e => {
    if (reduced) return;
    if (e.isIntersecting) { const p = reelEl.play(); if (p) p.catch(() => {}); } else reelEl.pause();
  })).observe(reelEl);

  /* progress bars on every playing window */
  const scrubs = $$('.scrub').map(s => ({ bar: s.firstElementChild, v: s.parentElement.querySelector('video') })).filter(s => s.v);

  /* sound toggles */
  const reelV = $('#reelVideo'), reelBtn = $('#reelSound');
  const allVideos = $$('video');
  const muteOthers = except => allVideos.forEach(v => { if (v !== except) v.muted = true; });
  const syncButtons = () => {
    reelBtn.setAttribute('aria-pressed', String(!reelV.muted));
    reelBtn.querySelector('span').textContent = reelV.muted || reelV.paused ? (reduced ? 'play video' : 'play with sound') : 'mute';
    $$('.mute').forEach(b => b.classList.toggle('on', !b.parentElement.querySelector('video').muted));
  };
  syncButtons();
  reelBtn.addEventListener('click', () => {
    if (reduced && reelV.paused) { reelV.muted = false; muteOthers(reelV); reelV.play().catch(() => {}); syncButtons(); return; }
    reelV.muted = !reelV.muted;
    if (!reelV.muted) { muteOthers(reelV); reelV.currentTime = 0; reelV.play().catch(() => {}); }
    syncButtons();
  });
  const ICON_MUTED = '<path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
  const ICON_SOUND = '<path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.6a6 6 0 0 1 0 8.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
  $$('.mute').forEach(b => b.addEventListener('click', () => {
    const v = b.parentElement.querySelector('video');
    if (v.paused) { attach(v); v.muted = false; v.play().catch(() => {}); }
    else v.muted = !v.muted;
    if (!v.muted) muteOthers(v);
    syncButtons();
    $$('.mute').forEach(m => { m.querySelector('svg').innerHTML = m.classList.contains('on') ? ICON_SOUND : ICON_MUTED; });
  }));

  /* ---------- dragging (mouse / pen only so touch scrolling stays native) ---------- */
  let zTop = 20;
  $$('.drag').forEach(el => {
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' || e.button !== 0 || e.target.closest('button, a')) return;
      e.preventDefault();
      const startX = e.clientX, startY = e.clientY;
      const left = el.offsetLeft, top = el.offsetTop;
      let moved = false;
      el.style.zIndex = ++zTop;
      el.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) < 3) return;
        if (!moved) { moved = true; el.classList.add('is-dragging'); el.style.right = 'auto'; el.style.bottom = 'auto'; }
        el.style.left = left + dx + 'px';
        el.style.top = top + dy + 'px';
      };
      const up = () => {
        if (moved) { el.dataset.dragged = '1'; setTimeout(() => { delete el.dataset.dragged; }, 0); }
        el.classList.remove('is-dragging');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  });

  /* ---------- dock magnification ---------- */
  const dock = $('#dock');
  const dockItems = $$('.dock-item', dock);
  /* magnification with transforms only: each item scales from its bottom edge,
     neighbours slide aside by the extra width so nothing overlaps */
  const dockKids = [...dock.children];
  if (finePointer) {
    const gain = .5, reach = 170;
    let rest = null, raf = 0, mouseX = 0;
    const measure = () => {
      /* layout positions (offset*) are not affected by the running transforms */
      rest = dockKids.map(k => ({ c: k.offsetParent.getBoundingClientRect().left - (k.offsetParent.scrollLeft || 0) + k.offsetLeft + k.offsetWidth / 2, w: k.offsetWidth, item: k.classList.contains('dock-item') }));
    };
    const apply = () => {
      raf = 0;
      const scales = rest.map(r => r.item ? 1 + gain * Math.exp(-((mouseX - r.c) ** 2) / (2 * (reach / 2.2) ** 2)) : 1);
      const extras = rest.map((r, i) => r.w * (scales[i] - 1));
      const total = extras.reduce((a, b) => a + b, 0);
      let acc = 0;
      dockKids.forEach((k, i) => {
        const dx = acc + extras[i] / 2 - total / 2;
        acc += extras[i];
        k.style.transform = `translateX(${dx.toFixed(1)}px) scale(${scales[i].toFixed(3)})`;
        k.style.setProperty('--inv', (1 / scales[i]).toFixed(3));
      });
    };
    dock.addEventListener('mouseenter', () => { if (mqMobile.matches) return; dock.style.transform = ''; dockKids.forEach(k => { k.style.transform = ''; }); measure(); setTimeout(() => dock.classList.add('is-live'), 180); });
    dock.addEventListener('mousemove', e => { if (mqMobile.matches || !rest) return; mouseX = e.clientX; if (!raf) raf = requestAnimationFrame(apply); });
    dock.addEventListener('mouseleave', () => { dock.classList.remove('is-live'); rest = null; dockKids.forEach(k => { k.style.transform = ''; k.style.removeProperty('--inv'); }); });
  }
  /* touch: a tap shows the partner's name for a moment */
  dockItems.forEach(it => it.addEventListener('click', () => {
    if (finePointer) return;
    dockItems.forEach(o => o.classList.remove('show-name'));
    it.classList.add('show-name');
    clearTimeout(it._t); it._t = setTimeout(() => it.classList.remove('show-name'), 1600);
  }));

  /* ---------- typing helper ---------- */
  const typeInto = (el, text, speed = 42) => new Promise(res => {
    if (reduced) { el.textContent = text; res(); return; }
    let i = 0;
    el.textContent = '';
    const step = () => {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) { res(); return; }
      const ch = text[i - 1];
      setTimeout(step, speed + (ch === ' ' ? 30 : 0) + (ch === ',' || ch === '.' ? 160 : 0) + Math.random() * 40);
    };
    step();
  });

  /* ---------- feature sections: reveal, then "speak" ---------- */
  const BARS = 15;
  const waves = [];
  $$('[data-feat]').forEach(feat => {
    const bars = $('.bars', feat);
    for (let i = 0; i < BARS; i++) {
      const b = document.createElement('i');
      const edge = Math.min(i, BARS - 1 - i);
      b.style.opacity = edge === 0 ? .25 : edge === 1 ? .5 : 1;
      bars.appendChild(b);
    }
    waves.push({ feat, bars: [...bars.children], live: false, t0: 0, clock: $('.wave-rec b', feat), seed: Math.random() * 10 });
  });
  const featIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const feat = e.target;
      featIO.unobserve(feat);
      feat.classList.add('in');
      const w = waves.find(w => w.feat === feat);
      const typed = $('.typed', feat);
      setTimeout(() => {
        feat.classList.add('typing', 'live');
        w.live = !reduced; w.t0 = performance.now();
        typeInto(typed, typed.dataset.text, 48).then(() => {
          setTimeout(() => { w.live = false; feat.classList.remove('live'); }, 500);
          setTimeout(() => feat.classList.remove('typing'), 2600);
        });
      }, reduced ? 0 : 750);
    });
  }, { threshold: 0.3 });
  $$('[data-feat]').forEach(f => featIO.observe(f));

  const waveLoop = now => {
    for (const w of waves) {
      if (w.live) {
        const t = (now - w.t0) / 1000;
        w.bars.forEach((b, i) => {
          const edge = Math.min(i, BARS - 1 - i) / ((BARS - 1) / 2);
          const n = Math.sin(t * 11 + i * 1.7 + w.seed) * .5 + Math.sin(t * 17.3 + i * .6) * .35 + Math.sin(t * 5.1 + i * 2.9 + w.seed) * .3;
          const h = 5 + Math.max(0, n + .25) * 30 * (.35 + edge * .65);
          b.style.transform = `scaleY(${Math.min(1.2, h / 30).toFixed(3)})`;
        });
        w.clock.textContent = '00:' + pad(Math.floor(t));
        w.idle = false;
      } else if (!w.idle) {
        w.bars.forEach(b => { b.style.transform = ''; });
        w.idle = true;
      }
    }
    requestAnimationFrame(waveLoop);
  };
  requestAnimationFrame(waveLoop);

  /* ---------- team data ---------- */
  const IMG = A + 'img-sized/';
  const sized = (file, sizes = '(max-width: 760px) 90vw, 300px') => {
    const base = IMG + file.replace(/\.(avif|webp|png)$/, '');
    return `src="${base}-800.webp" srcset="${base}-800.webp 800w, ${base}-1600.webp 1600w" sizes="${sizes}" loading="lazy" decoding="async"`;
  };
  const TEAM = [
    ['David', 'Co-Founder', '69cb65b3ee985a26af100a75_fern-avatar.png'],
    ['Jonas', 'Also Co-Founder', '69cb65b3ee985a26af100a75_fern-avatar.png'],
    ['Cristian Kiesling', 'Executive Producer', '69c40c158df34c3525280876_cristian%20kiesling.avif'],
    ['Chris Varga', 'Senior Editor-in-Chief', '69f83ec37a076a7f0ee345be_fern.avif'],
    ['Jonas Rump', 'Senior Editor-in-Chief', '69f39095be642e6f3c05f818_fern-222.avif'],
    ['Lucie Schöner', 'Junior Editor-in-Chief', '69f38f31871ee33ccc90b6f5_fern1.avif'],
    ['Pascale Müller', 'Head of Fact-Checking', '69f83f2218db148464971203_fern-team-433.avif'],
    ['Aaron Mucke', 'Senior Writer', '6a042ddc75a62567cafb9cb9_fern-team-2321.avif'],
    ['Lenz Schöler', 'Senior 3D Animator', '69c41253305b28ee30a5bcf7_fern-team-member-24.avif'],
    ['Bao-My Nguyen', 'Writer', '69f83ef0f7a3d92b1b717a70_fern-team-34.avif'],
    ['Mel Wagner', '3D Animator', '69f38f68968436a28700e37b_fern4.avif'],
    ['Alex López Castro', 'Translator & Writer', '69c40fbadc91dd26af6bf8be_fern-team-member-3.avif'],
    ['Lisa Victoria Peter', 'Fact-checker', '69f88a90b2111c3751c82ba9_fern-team-3211.avif'],
    ['Suraj Chandran', 'Video Editor', '69c410cc801e88cb4ec5ac99_compressed_fern-team-member-9.avif'],
    ['Mathias Hawk', '2D Motion Designer', '69c410852f27461d6eb8bf04_fern-team-member-222.avif'],
    ['Kristina', 'Translator', '69f88ac8ce6bf85ea3904f9b_fern-team-11132.avif'],
    ['Timo Sell', 'Video Editor', '69c4125ebb83d00a4dbcdb05_fern-team-member-26.avif'],
    ['Long Huy Dao', '2D Motion Designer', '69f38f91328e8ecb7de30ecf_fern22.avif'],
    ['Leo Wang', 'Sound Designer', '6a9eb0f2405b1afcf2dacf58_fern-teammmember2.avif'],
    ['Tom Büscher', 'Video Editor', '69c4124c3bed076dba5f0508_fern-team-member-23.avif'],
    ['Nil Tomm', '3D Animator', '69c41121d1adcbc581e21e1d_fern-team-member-22.avif'],
    ['Killian van Basten', '3D Animator', '69c4121e650d76822575dee6_fern-team-member-1113.avif'],
    ['Maurice Demandt', 'Video Editor', '69c4126d02480a3439b9e2d9_fern-team-member-28.avif'],
    ['Lucas Göhr', '3D Animator', '69c40faf9ee0ff08de1e307f_fern-team-member-2.avif'],
  ];
  const dept = role =>
    /Fact/i.test(role) ? 'fact-checking' :
    /Animator|Motion/i.test(role) ? 'animation' :
    /Video Editor/i.test(role) ? 'edit' :
    /Sound/i.test(role) ? 'sound' :
    /Writer|Translator/i.test(role) ? 'writing' :
    /Founder/i.test(role) ? 'founders' : 'editorial';
  const TINTS = { 'fact-checking': '#f1e7d0', animation: '#d6ecdc', edit: '#d9e3ee', sound: '#e7def0', writing: '#e8eccf', founders: '#c9f5d6', editorial: '#dde7e2' };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* Photo Booth grid in the jobs window */
  const booth = $('#booth');
  const pool = TEAM.slice(2).map(t => IMG + t[2].replace(/\.(avif|webp|png)$/, '') + '-800.webp');
  const cells = [];
  for (let i = 0; i < 8; i++) {
    const im = document.createElement('img');
    im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.width = 400; im.height = 400; im.src = pool[i];
    booth.appendChild(im); cells.push(im);
  }
  wireBody(booth);
  let poolIdx = 8;
  setInterval(() => {
    if (document.hidden || !$('#jobs').classList.contains('in')) return;
    const c = cells[Math.floor(Math.random() * cells.length)];
    c.src = pool[poolIdx++ % pool.length];
    if (!reduced) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }
  }, 1800);

  /* team cards: a masonry of little windows */
  const cardsEl = $('#cards');
  TEAM.forEach(([name, role, img], i) => {
    const d = dept(role);
    const photo = i > 1 && (i % 4 === 2);
    const card = document.createElement('article');
    card.className = 'win card' + (photo ? ' photo-card' : '');
    card.style.setProperty('--tb', TINTS[d]);
    card.style.setProperty('--d', ((i % 3) * 0.08).toFixed(2) + 's');
    card.innerHTML =
      `<div class="win-bar"><span class="lights"><i></i><i></i><i></i></span><span class="win-title">${d}</span><span class="x">×</span></div>` +
      (photo ? `<div class="win-body"><img class="card-photo${i % 8 === 6 ? ' wide' : ''}" ${sized(img)} alt="${esc(name)}"></div>` : '') +
      `<div class="card-body"><div class="card-head">${photo ? '' : `<img ${sized(img, '38px')} width="38" height="38" alt="">`}<div><b>${esc(name)}</b><span>${esc(role)}</span></div></div>` +
      (i === 0 ? `<p class="card-text">The channel was originally founded by the team behind Simplicissimus and Hoog.</p>` : '') +
      `<p class="card-meta">fern. · ${d}</p></div>`;
    cardsEl.appendChild(card);
    const body = card.querySelector('.win-body');
    if (body) wireBody(body);
  });
  const cardIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); cardIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.card').forEach(c => cardIO.observe(c));

  /* ---------- marquee with a highlighted centre phrase ---------- */
  const track = $('#marquee');
  const PHRASE = 'Great Reporting, On Youtube';
  for (let i = 0; i < 8; i++) { const s = document.createElement('span'); s.textContent = PHRASE; track.appendChild(s); }
  const mSpans = [...track.children];
  let mx = 0, mPrev = performance.now();
  let marqueeOn = false, marqueeRun = false;
  const marqueeLoop = now => {
    if (!marqueeOn) { marqueeRun = false; return; }
    const dt = Math.min(64, now - mPrev); mPrev = now;
    const unit = mSpans[1].offsetLeft - mSpans[0].offsetLeft;
    mx -= dt * 0.035;
    if (unit > 0 && -mx >= unit) mx += unit;
    track.style.transform = `translate3d(${mx}px,0,0)`;
    const cx = innerWidth / 2;
    let best = null, bd = 1e9;
    mSpans.forEach(s => { const r = s.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - cx); if (d < bd) { bd = d; best = s; } });
    mSpans.forEach(s => s.classList.toggle('hl', s === best));
    requestAnimationFrame(marqueeLoop);
  };
  /* centre the first highlighted phrase before starting */
  requestAnimationFrame(() => {
    const unit = mSpans[1].offsetLeft - mSpans[0].offsetLeft;
    const m = $('.marquee').getBoundingClientRect();
    mx = -((mSpans[2].offsetLeft + mSpans[2].offsetWidth / 2) - (innerWidth / 2 - m.left)) % unit;
    if (reduced) { track.style.transform = `translate3d(${mx}px,0,0)`; mSpans[2].classList.add('hl'); return; }
    new IntersectionObserver(es => es.forEach(e => {
      marqueeOn = e.isIntersecting;
      if (marqueeOn && !marqueeRun) { marqueeRun = true; mPrev = performance.now(); requestAnimationFrame(marqueeLoop); }
    })).observe($('.marquee'));
  });

  /* starburst sticker */
  (() => {
    const pts = [], n = 16;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 46 : 57;
      pts.push((60 + Math.cos(a) * r).toFixed(1) + ' ' + (60 + Math.sin(a) * r).toFixed(1));
    }
    $('#burstPath').setAttribute('d', 'M' + pts.join('L') + 'Z');
  })();

  /* ---------- window trail behind the notes (scroll-linked) ---------- */
  const notesSec = $('#about'), trail = $('#trail'), notesWin = $('#notesWin');
  let trailItems = [];
  const lerpColor = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const STOPS = [[1, 255, 71], [11, 138, 60], [117, 134, 150], [200, 214, 226]];
  const colorAt = t => {
    const s = t * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(s));
    const c = lerpColor(STOPS[i], STOPS[i + 1], s - i);
    return `rgb(${c})`;
  };
  const buildTrail = () => {
    trail.innerHTML = '';
    const W = notesSec.clientWidth, H = notesSec.clientHeight;
    const mobile = mqMobile.matches;
    const N = mobile ? 34 : 64;
    const tw = mobile ? 46 : 74;
    trailItems = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const x = -tw + t * (W + tw);
      const y = H * (mobile ? .52 : .5) + Math.sin(t * Math.PI * 2.2 + .6) * H * (mobile ? .26 : .3) - 27;
      const el = document.createElement('i');
      el.style.left = x.toFixed(1) + 'px';
      el.style.top = y.toFixed(1) + 'px';
      el.style.setProperty('--c', colorAt(t));
      el.style.zIndex = i;
      trail.appendChild(el);
      trailItems.push(el);
    }
  };
  const updateTrail = () => {
    const r = notesSec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height * .85)));
    const show = reduced ? trailItems.length : Math.round(p * trailItems.length * 1.05);
    trailItems.forEach((el, i) => el.classList.toggle('on', i < show));
  };
  const notesIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { notesWin.classList.add('in'); if (lotties.sig) setTimeout(() => lotties.sig.play(), 900); notesIO.disconnect(); }
  }), { threshold: 0.35 });
  notesIO.observe(notesWin);

  /* ---------- outlet counters & terminal ---------- */
  const counterIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    counterIO.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix;
    if (reduced) return;
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * ease).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('.o-num').forEach(n => counterIO.observe(n));

  const term = $('#awards');
  const termIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    termIO.disconnect();
    const t = $('.typed', term);
    term.classList.add('typing');
    setTimeout(() => typeInto(t, t.dataset.text, 90).then(() => term.querySelector('.caret').classList.add('on')), 400);
  }), { threshold: .4 });
  termIO.observe(term);

  /* ---------- fern. built from tiny windows (footer) ---------- */
  const cv = $('#tileMark'), ctx = cv.getContext('2d');
  let tiles = [], tileStart = 0, tileVisible = false, tileMouse = { x: -1e4, y: -1e4 }, cssW = 0, cssH = 0, cell = 12;
  const logoImg = new Image();
  logoImg.src = A + 'logos/691b4cb1e4fb8fcf1cf543a3_fern-logo.svg';
  const TILE_COLS = ['#0b8a3c', '#119a46', '#16a34f', '#0d7a37', '#1fb85b', '#2a9d5c'];
  const buildTiles = () => {
    if (!logoImg.complete || !logoImg.naturalWidth) return;
    cssW = cv.parentElement.clientWidth;
    cell = mqMobile.matches ? 7 : 13;
    const cols = Math.floor(cssW / cell);
    const rows = Math.round(cols * 55 / 102);
    cssH = rows * cell + 12;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = cssW * dpr; cv.height = cssH * dpr; cv.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const o = off.getContext('2d');
    o.drawImage(logoImg, 0, 0, cols, rows);
    const px = o.getImageData(0, 0, cols, rows).data;
    tiles = [];
    const ox = (cssW - cols * cell) / 2;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (px[(y * cols + x) * 4 + 3] > 110) {
        tiles.push({ x: ox + x * cell, y: 8 + y * cell, d: x / cols * 900 + Math.random() * 260, c: TILE_COLS[(x * 7 + y * 3) % TILE_COLS.length], lift: 0 });
        const t = tiles[tiles.length - 1]; t.rgb = [1, 3, 5].map(j => parseInt(t.c.slice(j, j + 2), 16));
      }
    }
  };
  const roundRect = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const drawTiles = now => {
    if (!tileVisible) return;
    const el = reduced ? 1e6 : now - tileStart;
    ctx.clearRect(0, 0, cssW, cssH);
    const s = cell - 2;
    for (const t of tiles) {
      const k = Math.min(1, Math.max(0, (el - t.d) / 420));
      if (k <= 0) continue;
      const ease = 1 - Math.pow(1 - k, 3);
      const dx = t.x + s / 2 - tileMouse.x, dy = t.y + s / 2 - tileMouse.y;
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / 70);
      t.lift += (near - t.lift) * 0.18;
      const yy = t.y - (1 - ease) * 26 - t.lift * 5;
      ctx.globalAlpha = ease;
      roundRect(t.x, yy, s, s, Math.max(1.5, s * .18));
      ctx.fillStyle = t.lift > .05 ? `rgb(${lerpColor(t.rgb, [1, 255, 71], t.lift)})` : t.c;
      ctx.fill();
      if (s > 8) {
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        ctx.fillRect(t.x + 1, yy + 1, s - 2, Math.max(1.5, s * .2));
        ctx.fillStyle = 'rgba(255,95,87,.9)';
        ctx.fillRect(t.x + 2, yy + 1.5, 1.6, 1.6);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawTiles);
  };
  logoImg.onload = buildTiles;
  const tileIO = new IntersectionObserver(es => es.forEach(e => {
    const was = tileVisible;
    tileVisible = e.isIntersecting;
    if (tileVisible && !was) { if (!tileStart) tileStart = performance.now(); requestAnimationFrame(drawTiles); }
  }), { threshold: .15 });
  tileIO.observe(cv);
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); tileMouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  cv.addEventListener('pointerleave', () => { tileMouse = { x: -1e4, y: -1e4 }; });
  /* touch: a tap lifts the tiles around the finger for a moment */
  let tapT;
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const r = cv.getBoundingClientRect(); tileMouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    clearTimeout(tapT); tapT = setTimeout(() => { tileMouse = { x: -1e4, y: -1e4 }; }, 700);
  });

  /* ---------- scroll-linked: parallax, reel scale, trail, nav, scrub bars ---------- */
  const parItems = $$('.scatter .par');
  const reel = $('#reel');
  let ticking = false, parTarget = 0, parNow = 0, parRaf = 0;
  /* parallax eases toward the scroll position instead of jumping with it */
  const parLoop = () => {
    parNow += (parTarget - parNow) * 0.18;
    if (Math.abs(parTarget - parNow) < 0.3) parNow = parTarget;
    parItems.forEach(el => { if (!el.classList.contains('is-dragging')) el.style.translate = `0 ${(parNow * parseFloat(el.dataset.speed)).toFixed(1)}px`; });
    parRaf = parNow === parTarget ? 0 : requestAnimationFrame(parLoop);
  };
  const onScroll = () => {
    const y = scrollY;
    if (!reduced) {
      const k = mqMobile.matches ? .5 : 1;
      parTarget = y < innerHeight * 1.8 ? y * k : innerHeight * 1.8 * k;
      if (!parRaf) parRaf = requestAnimationFrame(parLoop);
      const r = reel.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .75)));
      reel.style.transform = `scale(${(.9 + p * .1).toFixed(4)})`;
    }
    updateTrail();
    setActive();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  const scrubLoop = () => {
    for (const s of scrubs) if (s.v.duration && !s.v.paused) s.bar.style.transform = `scaleX(${(s.v.currentTime / s.v.duration).toFixed(4)})`;
    requestAnimationFrame(scrubLoop);
  };
  requestAnimationFrame(scrubLoop);

  /* ---------- lightbox: open a desktop window big ---------- */
  const lb = $('#lightbox'), lbWin = $('#lbWin'), lbBody = $('#lbBody'), lbTitle = $('#lbTitle');
  let lbOrigin = null, lbClosing = false;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const flipFrom = rect => {
    const to = lbWin.getBoundingClientRect();
    return `translate(${rect.left - to.left}px, ${rect.top - to.top}px) scale(${rect.width / to.width}, ${rect.height / to.height})`;
  };
  const openLightbox = (src, kind, title, originEl) => {
    lbTitle.textContent = title;
    lbBody.innerHTML = kind === 'video'
      ? `<video controls playsinline autoplay poster="${A}video/posters/${src}.jpg"><source src="${A}video/${src}.webm" type="video/webm"><source src="${A}video/${src}.mp4" type="video/mp4"></video>`
      : `<img src="${src}" alt="${esc(title)}">`;
    const v = lbBody.querySelector('video');
    if (v) { muteOthers(v); allVideos.forEach(o => { if (o !== reelV) o.pause(); }); v.play().catch(() => {}); }
    lbOrigin = originEl;
    lb.showModal();
    lb.classList.add('open');
    if (!reduced && originEl) lbWin.animate([{ transform: flipFrom(originEl.getBoundingClientRect()), opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 460, easing: EASE });
    else lbWin.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    $('#lbClose').focus();
  };
  const closeLightbox = () => {
    if (lbClosing || !lb.open) return;
    lbClosing = true;
    lb.classList.remove('open');
    const end = () => { lb.close(); lbBody.innerHTML = ''; lbClosing = false; if (lbOrigin) lbOrigin.focus({ preventScroll: true }); };
    const anim = !reduced && lbOrigin && lbOrigin.getClientRects().length
      ? lbWin.animate([{ transform: 'none', opacity: 1 }, { transform: flipFrom(lbOrigin.getBoundingClientRect()), opacity: .4 }], { duration: 320, easing: EASE })
      : lbWin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
    anim.onfinish = end;
  };
  $('#lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('cancel', e => { e.preventDefault(); closeLightbox(); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  const openFromWindow = win => {
    if (win.dataset.dragged) return;
    const v = win.querySelector('video'), img = win.querySelector('img');
    const title = win.querySelector('.win-title').textContent;
    if (v) openLightbox(v.dataset.src, 'video', title, win);
    else if (img) openLightbox((img.currentSrc || img.src).replace('-800.webp', '-1600.webp'), 'img', title, win);
  };
  $$('[data-open]').forEach(win => {
    win.setAttribute('aria-label', 'Open ' + win.querySelector('.win-title').textContent);
    win.addEventListener('click', () => openFromWindow(win));
    win.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFromWindow(win); } });
  });

  /* desktop icons do something, like on a real desktop */
  const iconAct = icon => {
    if (icon.dataset.dragged) return;
    const act = icon.dataset.act;
    if (act === 'trash') { icon.classList.remove('wobble'); void icon.offsetWidth; icon.classList.add('wobble'); }
    else if (act === 'reel') openLightbox('hero-reel', 'video', 'hero-reel.mp4', icon);
    else if (act === 'voice') {
      reel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      if (reelV.muted || reelV.paused) { reelV.muted = false; muteOthers(reelV); reelV.play().catch(() => {}); syncButtons(); }
    } else if (act && act[0] === '#') $(act).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('.icon[data-act]').forEach(icon => {
    icon.addEventListener('click', () => iconAct(icon));
    icon.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); iconAct(icon); } });
  });

  let rT;
  const onResize = () => { buildTrail(); updateTrail(); buildTiles(); onScroll(); };
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(onResize, 150); });
  addEventListener('load', onResize);
  buildTrail();
  onScroll();
})();
