(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const YT = 'https://www.youtube.com/@fern-tv';
  const SIZED = '../assets/img-sized/';
  const introState = window.__intro || { done: true, at: 0 };
  if (touch) document.documentElement.classList.add('is-touch');

  /* ---------- content: fern films + awards ---------- */
  const ITEMS = [
    { video: 'hero', t: 0, thumb: 'thumbs/reel-a.jpg', title: 'Video Journalism, Redefined', sub: 'reel / 0:10' },
    { video: 'about', t: 0, thumb: 'thumbs/about-a.jpg', title: 'Born in 2023.', sub: 'about us / 0:04' },
    { video: 'hero', t: 0, award: true, sized: '6a5795864389e378bc69d102_telly-pt', title: 'The Telly Awards 2026', sub: 'fern / Gold / People’s Telly' },
    { video: 'hero', t: 2.2, thumb: 'thumbs/reel-b.jpg', title: 'Video is the future of journalism.', sub: 'reel / 0:10' },
    { video: 'jobs', t: 0, thumb: 'thumbs/jobs-a.jpg', title: 'Working For Fern', sub: 'jobs / 0:05' },
    { video: 'hero', t: 4, award: true, sized: '6a579568790a84c9ea0921fb_shorty-doc', title: 'Shorty Awards 2026', sub: 'fern / Winner / Documentary' },
    { video: 'sponsors', t: 0, thumb: 'thumbs/spons-a.jpg', title: 'Your ad never looked this good.', sub: 'sponsors / 0:07' },
    { video: 'hero', t: 6, award: true, sized: '69c3fc1ed6d24a98b88b1f8e_DAF', title: 'DAfFNE 2024/25', sub: 'Simplicissimus / Winner / TV Journalism' },
    { video: 'about', t: 3, thumb: 'thumbs/about-b.jpg', title: 'Great Reporting, On Youtube', sub: 'about us / 0:04' },
    { video: 'hero', t: 8, thumb: 'thumbs/reel-d.jpg', title: 'This Is Fern.', sub: 'reel / 0:10' },
    { video: 'hero', t: 2, award: true, sized: '6a5795763db98c279dc16160_shorty-ah', title: 'Shorty Awards 2026', sub: 'fern / Audience Honor / Documentary' },
    { video: 'jobs', t: 2, thumb: 'thumbs/jobs-b.jpg', title: 'We are always looking for talent.', sub: 'jobs / 0:05' },
    { video: 'hero', t: 5, award: true, sized: '69c3fc33827c55f5334a7d6b_PE', title: 'Prix Europa 2024', sub: 'Simplicissimus / Nomination / Video Investigation' },
    { video: 'sponsors', t: 4.5, thumb: 'thumbs/spons-b.jpg', title: 'Do you want to collaborate?', sub: 'sponsors / 0:07' },
    { video: 'hero', t: 7, award: true, sized: '6a57958f790a84c9ea0945e3_telly-gsi', title: 'The Telly Awards 2026', sub: 'fern / Gold / General-Social Impact' },
    { video: 'hero', t: 4.6, thumb: 'thumbs/reel-c.jpg', title: '5 mil subscribers', sub: 'reel / 0:10' },
    { video: 'hero', t: 1, award: true, sized: '69c3fc3a039c2dbadc81dfd2_RDO', title: 'Rose d\'Or 2024', sub: 'Simplicissimus / Nomination / News & Current Affairs' },
  ];

  /* ---------- lottie wordmarks ---------- */
  const LOTTIE = '../assets/logos/692c6126d933cf487418969d_ferm-lottie-02-optimized.json';
  function mountLogo(el) {
    if (!el || typeof window.lottie === 'undefined') return null;
    return lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false, path: LOTTIE,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
  }
  const wordmarkEl = $('#wordmark');
  const mark = mountLogo(wordmarkEl);
  const menuMark = mountLogo($('#menuLogo'));
  const footMark = mountLogo($('#footMark'));
  let markLoaded = false;
  if (mark) mark.addEventListener('DOMLoaded', () => {
    markLoaded = true;
    // intro still running: wait at frame 0 and play on reveal; otherwise match the still logo
    if (!introState.done && !reduced) mark.goToAndStop(0, true);
    else mark.goToAndStop(mark.totalFrames - 1, true);
    wordmarkEl.classList.add('is-live');
  });
  function onReveal() {
    startHero();
    if (mark && markLoaded && !reduced) { mark.goToAndStop(0, true); mark.play(); }
  }

  /* ---------- stage videos ---------- */
  const videos = Object.fromEntries($$('.bg').map(v => [v.dataset.src, v]));
  let current = 'hero';
  const heroVid = videos.hero;
  const menu = $('#menu');
  const tryPlay = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  let stageVisible = true, heroStarted = false;
  const canPlay = () => stageVisible && !document.hidden && !menu.classList.contains('is-open');
  function syncPlayback() {
    const v = videos[current];
    if (canPlay() && (current !== 'hero' || heroStarted)) tryPlay(v); else v.pause();
  }
  function startHero() { if (!reduced) heroStarted = true; syncPlayback(); }
  new IntersectionObserver(es => { stageVisible = es[0].isIntersecting; syncPlayback(); }, { threshold: 0.05 }).observe($('#home'));
  document.addEventListener('visibilitychange', () => { syncPlayback(); syncInview(); });

  function showVideo(key, t = 0) {
    const v = videos[key];
    if (!v) return;
    if (key !== current) {
      const prev = videos[current];
      prev.classList.remove('is-on');
      setTimeout(() => { if (!prev.classList.contains('is-on')) prev.pause(); }, 750);
      current = key;
    }
    if (v.dataset.poster && !v.getAttribute('poster')) v.poster = v.dataset.poster;
    if (v.preload !== 'auto') v.preload = 'auto';
    const seek = () => { try { v.currentTime = Math.min(t, (v.duration || 99) - .2); } catch (e) {} };
    if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek, { once: true });
    // previews are user initiated, so they may play even with reduced motion
    if (key !== 'hero') heroStarted = heroStarted || !reduced;
    if (canPlay() && (key !== 'hero' || heroStarted)) tryPlay(v); else v.pause();
    v.classList.add('is-on');
  }

  /* ---------- in-section videos: play only while visible ---------- */
  const inview = $$('video.inview');
  const visibleVids = new Set();
  function syncInview() {
    inview.forEach(v => {
      if (!reduced && !document.hidden && visibleVids.has(v) && !menu.classList.contains('is-open')) { if (v.preload !== 'auto') v.preload = 'auto'; tryPlay(v); }
      else v.pause();
    });
  }
  const vio = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) visibleVids.add(e.target); else visibleVids.delete(e.target); });
    syncInview();
  }, { threshold: 0.25 });
  inview.forEach(v => vio.observe(v));

  /* ---------- strip ---------- */
  const strip = $('#strip');
  const track = $('#track');
  let active = null, leaveTimer = 0;
  function makeItem(d, i, eager) {
    const a = document.createElement('a');
    a.className = 'item' + (d.award ? ' item--award' : '');
    if (d.award) a.href = '#awards';
    else { a.href = YT; a.target = '_blank'; a.rel = 'noopener'; }
    a.draggable = false;
    a.dataset.i = i;
    const img = d.sized
      ? `src="${SIZED + d.sized}-800.webp" srcset="${SIZED + d.sized}-800.webp 800w, ${SIZED + d.sized}-1600.webp 1600w" sizes="112px" alt="${d.title} award badge"`
      : `src="${d.thumb}" alt="Still from a fern video"`;
    a.innerHTML = `<span class="item__thumb"><img ${img} width="112" height="64" draggable="false" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></span>
      <span class="item__txt"><span class="item__title"></span><span class="item__sub"></span></span>`;
    a.querySelector('.item__title').textContent = d.title;
    a.querySelector('.item__sub').textContent = d.sub;
    return a;
  }
  let setW = 0;
  function build() {
    track.innerHTML = '';
    const frag = document.createDocumentFragment();
    const firstScreen = Math.ceil(innerWidth / (innerWidth < 761 ? 252 : 352)) + 1;
    ITEMS.forEach((d, i) => frag.appendChild(makeItem(d, i, i < firstScreen)));
    track.appendChild(frag);
    setW = track.scrollWidth;
    const copies = Math.max(2, Math.ceil((innerWidth * 2) / setW) + 1);
    for (let c = 1; c < copies; c++) ITEMS.forEach((d, i) => {
      const el = makeItem(d, i, false); el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); track.appendChild(el);
    });
    if (active) {
      const i = active.dataset.i;
      $$(`.item[data-i="${i}"]`, track).forEach(n => n.classList.add('is-active'));
      active = $(`.item[data-i="${i}"]`, track);
    }
  }

  let x = 0, vel = 0, dragging = false, moved = 0, lastX = 0, lastT = 0, hovering = false;
  const auto = reduced ? 0 : -0.55;
  const wrap = v => { if (!setW) return v; v %= setW; return v > 0 ? v - setW : v; };

  // vertical wheel over the strip drives it (the reference's signature); elsewhere the page scrolls
  strip.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    vel -= d * 0.09; e.preventDefault();
  }, { passive: false });
  $('#home').addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) vel -= e.deltaX * 0.09; }, { passive: true });

  const cursorEl = $('#cursor'), labelEl = $('#cursorLabel');
  strip.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; lastX = e.clientX; lastT = performance.now(); vel = 0;
    strip.setPointerCapture(e.pointerId);
    cursorEl.classList.add('is-drag');
  });
  strip.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, now = performance.now();
    x += dx; moved += Math.abs(dx);
    vel = dx / Math.max(1, now - lastT) * 16;
    lastX = e.clientX; lastT = now;
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false; cursorEl.classList.remove('is-drag');
    if (moved < 6 && e.type === 'pointerup') {
      const it = document.elementFromPoint(e.clientX, e.clientY)?.closest('.item');
      if (it) activate(it, true);
    }
  };
  strip.addEventListener('pointerup', endDrag);
  strip.addEventListener('pointercancel', endDrag);
  // pointer clicks are handled in endDrag; keyboard activation arrives as click with detail 0
  strip.addEventListener('click', e => {
    const it = e.target.closest('.item'); if (!it) return;
    e.preventDefault();
    if (e.detail === 0) follow(it);
  });

  function follow(it) {
    if (it.classList.contains('item--award')) goTo('#awards');
    else window.open(YT, '_blank', 'noopener');
  }
  function activate(it, fromTap) {
    clearTimeout(leaveTimer);
    if (fromTap && (!touch || active?.dataset.i === it.dataset.i)) { follow(it); return; }
    $$('.item.is-active', track).forEach(n => n.classList.remove('is-active'));
    $$(`.item[data-i="${it.dataset.i}"]`, track).forEach(n => n.classList.add('is-active'));
    strip.classList.add('has-active');
    active = it;
    const d = ITEMS[+it.dataset.i];
    showVideo(d.video, d.t);
  }
  function deactivate(delay = 700) {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      $$('.item.is-active', track).forEach(n => n.classList.remove('is-active'));
      strip.classList.remove('has-active');
      active = null;
      showVideo('hero', heroVid.currentTime);
    }, delay);
  }
  function setLabel(t) { if (labelEl.textContent !== t) labelEl.textContent = t; }
  if (!touch) {
    track.addEventListener('pointerover', e => {
      const it = e.target.closest('.item');
      if (it && !dragging && it !== active) activate(it, false);
      setLabel(it ? (it.classList.contains('item--award') ? 'awards ↓' : 'watch ↗') : 'drag');
    });
    strip.addEventListener('pointerenter', () => { hovering = true; cursorEl.classList.add('is-label'); });
    strip.addEventListener('pointerleave', () => { hovering = false; cursorEl.classList.remove('is-label'); if (!dragging) deactivate(); });
  } else {
    // a tap anywhere outside the strip releases the selection
    document.addEventListener('pointerdown', e => { if (active && !e.target.closest('#strip')) deactivate(0); });
  }
  track.addEventListener('focusin', e => {
    const it = e.target.closest('.item'); if (!it) return;
    strip.scrollLeft = 0;
    const r = it.getBoundingClientRect(), pad = 24;
    if (r.left < pad) x += pad - r.left; else if (r.right > innerWidth - pad) x -= r.right - innerWidth + pad;
    vel = 0; hovering = true;
    activate(it, false);
  });
  track.addEventListener('focusout', () => { hovering = false; deactivate(); });

  /* ---------- smooth scroll + anchors ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
  const barH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 72;
  function goTo(hash, push = true) {
    const id = hash.replace('#', '');
    const el = !id || id === 'home' ? null : document.getElementById(id);
    if (id && id !== 'home' && !el) return;
    const offset = el && el.classList.contains('sec') ? 0 : -barH() - 8;
    if (lenis) lenis.start();
    if (!el) { if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
    else if (lenis) lenis.scrollTo(el, { offset, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: reduced ? 'auto' : 'smooth' });
    if (push) history.pushState({ hash: id }, '', el ? '#' + id : location.pathname + location.search);
    // move keyboard focus with the jump so the next Tab continues from there
    const target = el ? (el.querySelector('h2, h3, .label') || el) : $('#home');
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    setTimeout(() => target.focus({ preventScroll: true }), 60);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest('.strip')) return;
    e.preventDefault();
    const hash = a.getAttribute('href');
    if (menu.classList.contains('is-open')) { closeMenu(false); setTimeout(() => goTo(hash), 120); }
    else goTo(hash);
  });
  addEventListener('popstate', () => goTo(location.hash || '#home', false));
  if (location.hash.length > 1) {
    const h = location.hash;
    addEventListener('load', () => setTimeout(() => goTo(h, false), 60), { once: true });
  }

  /* ---------- active section: menu state + bar label ---------- */
  const NAV_LABEL = { home: 'home,', about: 'about,', sponsors: 'sponsors,', jobs: 'jobs,', contact: 'contact.' };
  const barNow = $('#barNow');
  let currentNav = 'home';
  function setNav(key) {
    if (key === currentNav || !NAV_LABEL[key]) return;
    currentNav = key;
    $$('[data-nav-link]', menu).forEach(a => {
      if (a.dataset.navLink === key) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    $$('span', barNow).forEach(o => { o.classList.add('is-leaving'); setTimeout(() => o.remove(), 650); });
    const next = document.createElement('span'); next.textContent = NAV_LABEL[key]; next.className = 'is-entering';
    barNow.appendChild(next);
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-entering')));
  }
  $('[data-nav-link="home"]', menu).setAttribute('aria-current', 'true');
  const navIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) setNav(e.target.dataset.nav); });
  }, { rootMargin: '-45% 0px -54% 0px' });
  $$('section[data-nav]').forEach(s => navIO.observe(s));

  // the bar flips to ink while a light section sits under it
  const bar = $('#bar');
  new IntersectionObserver(es => {
    es.forEach(e => bar.classList.toggle('is-light', e.isIntersecting));
  }, { rootMargin: '0px 0px -94% 0px' }).observe($('#sponsors'));
  const greenIO = new IntersectionObserver(es => {
    es.forEach(e => bar.classList.toggle('is-green', e.isIntersecting));
  }, { rootMargin: '0px 0px -94% 0px' });
  greenIO.observe($('#contact'));
  // scrim appears once the hero has scrolled away under the bar
  new IntersectionObserver(es => bar.classList.toggle('is-scrolled', !es[0].isIntersecting), { rootMargin: '0px 0px -99% 0px', threshold: 0 }).observe($('#heroSentinel'));

  /* ---------- reveals ---------- */
  $$('.sec__title').forEach(h => {
    const text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${w}</span></span>`).join(' ');
  });
  const revealIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => revealIO.observe(el));

  if (footMark) {
    const fIO = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      if (reduced) footMark.goToAndStop(footMark.totalFrames - 1, true); else { footMark.goToAndStop(0, true); footMark.play(); }
      fIO.disconnect();
    }, { threshold: 0.4 });
    footMark.addEventListener('DOMLoaded', () => { footMark.goToAndStop(footMark.totalFrames - 1, true); fIO.observe($('.footer__mark')); });
  }

  /* ---------- team: portrait peek on hover, inline faces on touch ---------- */
  const teamList = $('#teamList');
  const peek = $('#peek'), peekImg = $('#peekImg');
  let px = 0, py = 0, pTx = 0, pTy = 0, peekOn = false;
  if (touch) {
    $$('li[data-img]', teamList).forEach(li => {
      const txt = document.createElement('span'); txt.className = 'tm__txt';
      while (li.firstChild) txt.appendChild(li.firstChild);
      const img = new Image(); img.className = 'tm__face'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.width = 44; img.height = 44;
      img.src = SIZED + li.dataset.img + '-800.webp';
      li.append(img, txt);
    });
  } else {
    teamList.addEventListener('pointerover', e => {
      const li = e.target.closest('li'); if (!li) return;
      $$('li.is-hover', teamList).forEach(n => n !== li && n.classList.remove('is-hover'));
      li.classList.add('is-hover');
      teamList.classList.add('is-peeking');
      if (li.dataset.img) {
        const src = SIZED + li.dataset.img + '-800.webp';
        if (peekImg.getAttribute('src') !== src) { peek.classList.remove('is-on'); peekImg.src = src; }
        if (!peekOn) { px = pTx; py = pTy; }
        peekOn = true; requestAnimationFrame(() => peek.classList.add('is-on'));
      } else { peekOn = false; peek.classList.remove('is-on'); }
    });
    teamList.addEventListener('pointerleave', () => {
      peekOn = false; peek.classList.remove('is-on'); teamList.classList.remove('is-peeking');
      $$('li.is-hover', teamList).forEach(n => n.classList.remove('is-hover'));
    });
  }

  /* ---------- pointer ---------- */
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('pointermove', e => { mx = pTx = e.clientX; my = pTy = e.clientY; }, { passive: true });

  /* ---------- frame loop: strip, cursor, peek, hero scroll-out ---------- */
  const hero = $('#hero'), media = $('#media');
  let lastY = -1;
  function heroScroll(y) {
    if (reduced || y === lastY) return;
    lastY = y;
    const vh = innerHeight;
    if (y > vh * 1.1) return;
    const p = Math.min(1, y / vh);
    hero.style.transform = `translate3d(0, ${(y * 0.38).toFixed(1)}px, 0) scale(${(1 - p * 0.08).toFixed(4)})`;
    hero.style.opacity = Math.max(0, 1 - p * 1.35).toFixed(3);
    media.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
  }
  function tick(time) {
    if (lenis) lenis.raf(time);
    if (!dragging) {
      vel *= 0.92;
      const base = (touch && active) ? 0 : hovering ? auto * 0.25 : auto;
      x += vel + (introState.done && stageVisible ? base : 0);
    }
    x = wrap(x);
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    cursorEl.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    if (peekOn || peek.classList.contains('is-on')) {
      px += (pTx - px) * 0.14; py += (pTy - py) * 0.14;
      const rot = Math.max(-6, Math.min(6, (pTx - px) * 0.05));
      const ph = 250; // 200px wide at 4:5, constant to avoid a layout read per frame
      const top = Math.max(84, Math.min(innerHeight - ph - 16, py - ph - 24));
      peek.style.transform = `translate3d(${(px + 36).toFixed(1)}px,${top.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
    }
    heroScroll(lenis ? lenis.scroll : scrollY);
    requestAnimationFrame(tick);
  }

  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { build(); x = wrap(x); lastY = -1; }, 150); });

  /* ---------- menu ---------- */
  const main = $('#main'), footer = $('.footer');
  const openBtn = $('#menuOpen'), closeBtn = $('#menuClose');
  function openMenu() {
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); openBtn.setAttribute('aria-expanded', 'true');
    main.inert = true; footer.inert = true; if (lenis) lenis.stop();
    syncPlayback(); syncInview();
    if (menuMark) {
      if (reduced) menuMark.goToAndStop(menuMark.totalFrames - 1, true);
      else { menuMark.goToAndStop(0, true); setTimeout(() => menuMark.play(), 420); }
    }
    setTimeout(() => closeBtn.focus({ preventScroll: true }), reduced ? 50 : 380);
  }
  function closeMenu(refocus = true) {
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); openBtn.setAttribute('aria-expanded', 'false');
    main.inert = false; footer.inert = false; if (lenis) lenis.start();
    syncPlayback(); syncInview();
    if (refocus) openBtn.focus({ preventScroll: true });
  }
  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu());
  addEventListener('keydown', e => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      const f = $$('a, button', menu), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  build();
  if (introState.done) onReveal(); else document.addEventListener('introend', onReveal, { once: true });
  requestAnimationFrame(tick);
})();
