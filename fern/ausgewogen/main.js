/* fern. homepage concept: page interactions
   smooth scroll, word reveal, pill nav, hero controls, lazy video, lottie, ⌘K */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineInput = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- smooth scroll (mouse and trackpad only, never with reduced motion) ---------- */
  let lenis = null;
  if (!reduce && fineInput && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
  }

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }
  const MAIL = 'fern@1up.management';
  const copyMail = () => (navigator.clipboard ? navigator.clipboard.writeText(MAIL) : Promise.reject())
    .then(() => toast('Copied ' + MAIL), () => toast(MAIL));

  /* ---------- reel: the hero video, shared by the 3D monitor and the inline chip ---------- */
  const reel = $('#reel');
  const chip = $('#reelChip');
  const chipCtx = chip.getContext('2d');
  const playBtn = $('#playBtn');
  const seen = { hero: true, chip: false };
  let userWants = null; // null = automatic, true/false = the visitor decided
  function syncReel() {
    reel.muted = true;
    const want = userWants ?? !reduce;
    if (want && !document.hidden && (seen.hero || seen.chip)) reel.play().catch(() => {});
    else reel.pause();
  }
  function playState() {
    const paused = reel.paused;
    playBtn.querySelector('span').textContent = paused ? 'Play' : 'Pause';
    playBtn.classList.toggle('is-paused', paused);
  }
  reel.addEventListener('play', playState);
  reel.addEventListener('pause', playState);
  const toggleReel = () => { userWants = reel.paused; syncReel(); };
  playBtn.addEventListener('click', toggleReel);
  const vio = new IntersectionObserver(es => {
    for (const e of es) seen[e.target === chip ? 'chip' : 'hero'] = e.isIntersecting;
    syncReel();
  }, { rootMargin: '120px 0px' });
  vio.observe($('#home'));
  vio.observe(chip);
  document.addEventListener('visibilitychange', syncReel);
  addEventListener('pointerdown', syncReel, { once: true });
  syncReel();
  playState();
  function drawChip() {
    if (seen.chip && reel.readyState >= 2 && !reel.paused) {
      try { chipCtx.drawImage(reel, 0, 0, chip.width, chip.height); } catch (e) { /* frame not ready */ }
    }
  }

  /* lamp: shared state with the 3D scene (button here, click on the lamp in the scene) */
  const lampBtn = $('#lampBtn');
  let lampOn = true;
  function setLamp(on) {
    lampOn = on;
    lampBtn.setAttribute('aria-pressed', String(on));
    lampBtn.querySelector('span').textContent = on ? 'Lamp on' : 'Lamp off';
  }
  lampBtn.addEventListener('click', () => setLamp(!lampOn));
  window.__fern = { toggleLamp: () => setLamp(!lampOn), lampOn: () => lampOn, toggleReel };

  /* other videos: load and play only while visible */
  const lio = new IntersectionObserver(es => {
    for (const e of es) {
      const v = e.target;
      if (e.isIntersecting && !reduce && !document.hidden) { v.preload = 'auto'; v.play().catch(() => {}); }
      else v.pause();
    }
  }, { threshold: 0.25 });
  $$('video.lazy-video').forEach(v => lio.observe(v));

  /* ---------- timecode ---------- */
  const tcEl = $('#timecode');
  let loops = 0, lastT = 0;
  const pad = n => String(n).padStart(2, '0');
  function timecode() {
    const t = reel.currentTime || 0;
    if (t + 0.5 < lastT) loops++;
    lastT = t;
    const total = loops * (reel.duration || 0) + t;
    const f = Math.floor((total % 1) * 25);
    const s = Math.floor(total);
    const txt = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
    if (txt !== tcEl.textContent) tcEl.textContent = txt;
  }

  /* ---------- split story into words ---------- */
  const story = $('#story');
  const units = []; // { el, key, fade: elements whose opacity follows, p, on }

  function wrapText(node, into) {
    const parts = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = part;
      frag.appendChild(s);
      into.push(s);
    }
    node.replaceWith(frag);
  }
  function walk(parent) {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === 3) {
        const words = [];
        wrapText(node, words);
        words.forEach(w => units.push({ el: w, fade: [w] }));
      } else if (node.nodeType === 1) {
        if (node.hasAttribute('data-x')) {
          units.push({ el: node, fade: [] });
        } else if (node.hasAttribute('data-word')) {
          const kids = [];
          if (node.hasAttribute('data-letters')) {
            const txt = node.textContent;
            node.textContent = '';
            const w = document.createElement('span');
            w.className = 'w';
            [...txt].forEach((ch, i) => {
              const l = document.createElement('span');
              l.className = 'l'; l.style.setProperty('--i', i); l.textContent = ch;
              w.appendChild(l);
            });
            node.appendChild(w);
            kids.push(w);
          } else {
            for (const c of [...node.childNodes]) if (c.nodeType === 3 && c.textContent.trim()) wrapText(c, kids);
          }
          units.push({ el: node, fade: kids });
        } else {
          walk(node); // links etc.
        }
      }
    }
  }
  $$('p', story).forEach(walk);

  /* reading head: words fade in over a band below it, so the edge is soft and runs line by line */
  let band = 1;
  function measureWords() {
    const sy = scrollY;
    const lh = parseFloat(getComputedStyle(story).lineHeight) || 40;
    const sl = story.getBoundingClientRect().left, sw = story.clientWidth || 1;
    for (const u of units) {
      const r = u.el.getBoundingClientRect();
      u.key = r.top + sy + ((r.left - sl) / sw) * lh * 1.4;
    }
    band = Math.max(lh * 2.2, innerHeight * 0.16);
  }
  function lightWords() {
    const head = scrollY + innerHeight * (innerWidth < 720 ? 0.78 : 0.72);
    for (const u of units) {
      const p = reduce ? 1 : clamp((head - u.key) / band);
      const q = Math.round(p * 40) / 40;
      if (q === u.p) continue;
      u.p = q;
      const o = (0.16 + 0.84 * q).toFixed(3);
      for (const f of u.fade) f.style.opacity = o;
      const on = q > 0.55;
      if (on !== u.on) {
        u.on = on;
        u.el.classList.toggle('on', on);
        for (const f of u.fade) f.classList.toggle('on', on);
      }
    }
  }

  /* ---------- sections, pill, anchors ---------- */
  const shade = $('#stageShade');
  const hud = $('.hud');
  const stage = $('#stage');
  const pill = $('#pill');
  const ind = $('#pillInd');
  const navLinks = $$('a[data-nav]', pill);
  const SECTIONS = ['home', 'about', 'sponsors', 'jobs', 'contact'];
  const tops = {};
  let docH = 0, active = 'home', hoverEl = null;

  function measureSections() {
    for (const id of SECTIONS) tops[id] = $('#' + id).getBoundingClientRect().top + scrollY;
    docH = document.documentElement.scrollHeight;
  }
  function moveInd(el) {
    if (!el) { ind.style.opacity = 0; return; }
    const pw = pill.clientWidth;
    const l = el.offsetLeft - 5, r = pw - (el.offsetLeft + el.offsetWidth) - 5;
    ind.style.opacity = 1;
    ind.style.clipPath = `inset(0 ${r}px 0 ${l}px round 999px)`;
  }
  function sectionState() {
    const y = scrollY + innerHeight * 0.45;
    let a = 'home';
    for (const id of SECTIONS) if (y >= tops[id]) a = id;
    if (scrollY + innerHeight >= docH - 4) a = 'contact';
    if (a !== active) {
      active = a;
      navLinks.forEach(l => {
        const on = l.dataset.nav === a;
        l.classList.toggle('is-active', on);
        on ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current');
      });
    }
    if (!hoverEl) moveInd(navLinks.find(l => l.dataset.nav === active));
  }
  navLinks.forEach(l => {
    l.addEventListener('pointerenter', () => { if (fineInput) { hoverEl = l; moveInd(l); } });
    l.addEventListener('pointerleave', () => { hoverEl = null; sectionState(); });
    l.addEventListener('focus', () => { hoverEl = l; moveInd(l); });
    l.addEventListener('blur', () => { hoverEl = null; sectionState(); });
  });

  // where each anchor lands; "about" shows the headline with some air above it
  function targetY(hash) {
    if (hash === '#home') return 0;
    const el = $(hash);
    if (!el) return null;
    let y = el.getBoundingClientRect().top + scrollY;
    if (hash === '#about') y = $('.name').getBoundingClientRect().top + scrollY - innerHeight * 0.16;
    else if (el.tagName !== 'SECTION') y -= 32;
    return Math.max(0, Math.round(y));
  }
  function goTo(hash) {
    const y = targetY(hash);
    if (y == null) return;
    if (lenis) lenis.scrollTo(y, { duration: 1.2, easing: t => 1 - Math.pow(1 - t, 4) });
    else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    const f = $(hash);
    if (f) { if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2 || !$(hash)) return;
    e.preventDefault();
    if (hash === '#faq') { const d = $('#faq details'); if (d) d.open = true; }
    goTo(hash);
    if (a.hasAttribute('data-top')) replayLogos();
  });

  /* ---------- per frame: only does work after a scroll or resize ---------- */
  let dirty = true;
  function update() {
    dirty = false;
    const p = scrollY / innerHeight;
    window.__fernScroll = p;
    shade.style.setProperty('--fade', clamp((p - 0.3) / 0.75).toFixed(3));
    hud.style.opacity = clamp(1 - p * 3).toFixed(3);
    hud.style.visibility = p > 0.4 ? 'hidden' : 'visible';
    stage.style.visibility = p > 1.6 ? 'hidden' : 'visible';
    lightWords();
    sectionState();
  }
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  function relayout() { measureWords(); measureSections(); dirty = true; }
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(relayout, 120); dirty = true; });
  document.fonts.ready.then(relayout);
  addEventListener('load', relayout);
  // lazy images and the details elements change the page height
  let roT;
  new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(relayout, 60); }).observe(document.body);
  relayout();
  update();

  function frame(t) {
    if (lenis) lenis.raf(t);
    if (dirty) update();
    timecode();
    drawChip();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* touch alternative for the hover zoom on the BTS photo */
  $$('[data-tap]').forEach(el => el.addEventListener('click', () => el.classList.toggle('is-big')));
  $('#copyMail').addEventListener('click', copyMail);

  /* ---------- lottie: avatar + wordmark (both are "back to top") ---------- */
  const LOGO_JSON = '../assets/logos/692c6126d933cf487418969d_ferm-lottie-02-optimized.json';
  const LOGO_SVG = '../assets/logos/691b4cb1e4fb8fcf1cf543a3_fern-logo.svg';
  const fallback = el => { el.innerHTML = `<img src="${LOGO_SVG}" alt="" width="102" height="55" style="width:100%;height:100%">`; };
  // fetch the JSON once, every instance gets its own copy (lottie mutates the data)
  const logoData = window.lottie ? fetch(LOGO_JSON).then(r => r.json()) : Promise.reject();
  const anims = [];
  function logo(el, opts = {}) {
    return logoData.then(data => {
      const anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false, animationData: structuredClone(data), rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
      // reduced motion: show the finished wordmark, never animate
      anim.addEventListener('DOMLoaded', () => reduce ? anim.goToAndStop(anim.totalFrames - 1, true) : opts.autoplay && anim.play());
      anims.push(anim);
      return anim;
    }).catch(() => { fallback(el); return null; });
  }
  const replay = a => { if (a && !reduce) a.goToAndPlay(0, true); };
  function replayLogos() { anims.forEach(replay); }
  logo($('#avatarLogo'), { autoplay: true }).then(avatar => {
    if (avatar && fineInput) $('.pill-avatar').addEventListener('pointerenter', () => replay(avatar));
  });
  logo($('#wordmark')).then(wm => {
    if (!wm) return;
    const el = $('#wordmark');
    let played = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !played) { played = true; replay(wm); }
      if (!e.isIntersecting) played = false;
    }, { threshold: 0.35 }).observe(el);
    if (fineInput) el.addEventListener('pointerenter', () => replay(wm));
  });

  /* ---------- ⌘K palette ---------- */
  const I = {
    play: '<svg viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10" rx="2.5"/><path d="M6.5 6v4l3.5-2z"/></svg>',
    copy: '<svg viewBox="0 0 16 16"><rect x="5" y="5" width="8.5" height="8.5" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
    user: '<svg viewBox="0 0 16 16"><circle cx="6" cy="5.5" r="2.5"/><path d="M1.8 13.5c.6-2.3 2.2-3.5 4.2-3.5s3.6 1.2 4.2 3.5M11 3.2a2.4 2.4 0 0 1 0 4.6M12.4 10.2c1 .5 1.6 1.6 1.9 3.3"/></svg>',
    spark: '<svg viewBox="0 0 16 16"><path d="M8 1.8 9.4 6.6 14.2 8 9.4 9.4 8 14.2 6.6 9.4 1.8 8l4.8-1.4z"/></svg>',
    page: '<svg viewBox="0 0 16 16"><path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 2v3.2h3.3"/></svg>',
    q: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.3"/><path d="M6.2 6.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.4M8 11.6v.1"/></svg>',
    leaf: '<svg viewBox="0 0 16 16"><path d="M3 13C5 8 8 5 13.5 2.5 13 8 10 12 3 13zM3 13l5-5"/></svg>',
    at: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6"/><path d="M10.6 8v1.1a1.9 1.9 0 0 0 3.8 0V8A6.4 6.4 0 1 0 12 13"/></svg>',
  };
  const go = url => () => {
    if (url.startsWith('#')) { close(false); goTo(url); }
    else { close(); window.open(url, '_blank', 'noopener'); }
  };
  const ITEMS = [
    { g: 'Suggestions', t: 'Watch', s: 'youtube', i: I.play, tag: 'Suggestion', run: go('https://www.youtube.com/@fern-tv') },
    { g: 'Suggestions', t: 'Business enquires? Send us an email', s: MAIL, i: I.copy, tag: 'Copy', run: () => { copyMail(); close(); } },
    { g: 'Suggestions', t: 'Join Us', s: 'We are always looking for talent.', i: I.user, tag: 'Suggestion', run: go('#jobs') },
    { g: 'Suggestions', t: 'Your ad never looked this good.', s: 'sponsors', i: I.spark, tag: 'Suggestion', run: go('#sponsors') },
    { g: 'Pages', t: 'home,', s: 'Video Journalism, Redefined', i: I.page, tag: 'Page', run: go('#home') },
    { g: 'Pages', t: 'about,', s: 'Born in 2023.', i: I.page, tag: 'Page', run: go('#about') },
    { g: 'Pages', t: 'sponsors,', s: 'About us and our partners', i: I.page, tag: 'Page', run: go('#sponsors') },
    { g: 'Pages', t: 'jobs,', s: 'Open Roles', i: I.page, tag: 'Page', run: go('#jobs') },
    { g: 'Pages', t: 'contact.', s: 'Get in touch.', i: I.page, tag: 'Page', run: go('#contact') },
    ...$$('#faq details').map((d, n) => ({ g: 'FAQ', t: d.querySelector('summary').textContent, s: d.querySelector('.ans').textContent.trim(), i: n ? I.q : I.leaf, tag: 'FAQ', faq: true })),
    { g: 'Socials', t: 'Instagram', s: '@fern.tv', i: I.at, tag: 'Social', run: go('https://www.instagram.com/fern.tv/') },
    { g: 'Socials', t: 'Youtube', s: '@fern-tv', i: I.play, tag: 'Social', run: go('https://www.youtube.com/@fern-tv') },
  ];
  const GROUP_LABEL = { FAQ: 'FAQ · If you’re curious' };

  const cmdk = $('#cmdk'), input = $('#cmdkInput'), list = $('#cmdkList'), trigger = $('#cmdkOpen');
  let shown = [], sel = 0, lastFocus = null;

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = ITEMS.filter(it => !q || (it.t + ' ' + it.s + ' ' + it.g).toLowerCase().includes(q));
    sel = clamp(sel, 0, Math.max(0, shown.length - 1));
    if (!shown.length) { list.innerHTML = `<div class="cmdk-empty">No results for “${input.value.replace(/[<>&]/g, '')}”</div>`; return; }
    let html = '', g = '';
    shown.forEach((it, idx) => {
      if (it.g !== g) { g = it.g; html += `<div class="cmdk-group">${GROUP_LABEL[g] || g}</div>`; }
      html += `<button class="cmdk-item${idx === sel ? ' is-sel' : ''}${it.open ? ' is-open' : ''}" data-i="${idx}" type="button"${it.faq ? ` aria-expanded="${!!it.open}"` : ''}>
        <span class="cmdk-ico">${it.i}</span>
        <span class="cmdk-txt"><b>${it.t}</b><small>${it.s}</small></span>
        <span class="cmdk-tag">${it.tag}</span></button>`;
    });
    list.innerHTML = html;
  }
  function setSel(i, scroll = true) {
    sel = i;
    $$('.cmdk-item', list).forEach(b => b.classList.toggle('is-sel', +b.dataset.i === sel));
    if (scroll) $(`.cmdk-item[data-i="${sel}"]`, list)?.scrollIntoView({ block: 'nearest' });
  }
  function run(i) {
    const it = shown[i];
    if (!it) return;
    if (it.faq) { it.open = !it.open; render(); setSel(i); return; }
    it.run();
  }
  function open() {
    if (!cmdk.hidden) return;
    lastFocus = document.activeElement;
    cmdk.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    input.value = '';
    ITEMS.forEach(it => it.open = false);
    sel = 0;
    render();
    requestAnimationFrame(() => input.focus());
    lenis?.stop();
    document.documentElement.classList.add('is-locked');
  }
  function close(restoreFocus = true) {
    if (cmdk.hidden) return;
    cmdk.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('is-locked');
    lenis?.start();
    if (restoreFocus) lastFocus?.focus?.({ preventScroll: true });
  }

  input.addEventListener('input', () => { sel = 0; render(); });
  list.addEventListener('click', e => { const b = e.target.closest('.cmdk-item'); if (b) run(+b.dataset.i); });
  list.addEventListener('pointermove', e => { const b = e.target.closest('.cmdk-item'); if (b && +b.dataset.i !== sel) setSel(+b.dataset.i, false); });
  cmdk.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) close(); });
  trigger.addEventListener('click', () => open());

  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.hidden ? open() : close(); return; }
    if (cmdk.hidden) {
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((sel + 1) % Math.max(1, shown.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((sel - 1 + shown.length) % Math.max(1, shown.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
  });
})();
