(() => {
  const A = '../assets/';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mobile = () => matchMedia('(max-width: 720px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // responsive variants from img-sized (800w / 1600w webp)
  const sized = (file, sizes, w, h, alt = '') => {
    const base = `${A}img-sized/${file.replace(/\.[a-z]+$/, '')}`;
    return `<img data-src="${base}-800.webp" data-srcset="${base}-800.webp 800w, ${base}-1600.webp 1600w" sizes="${sizes}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async" draggable="false">`;
  };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
  };

  /* ---------- content ---------- */
  const PARTNERS = [
    ['nyt', '6995b6b7220fd08050da1b8e_nyt.svg', 'The New York Times'],
    ['wp', '6995b6b753b5b6c6d7319fa1_wp.svg', 'The Washington Post'],
    ['bbc', '6995b6b7866fc8a3445d9206_bbc.svg', 'BBC'],
    ['occrp', '6995b6b756344bc741748c17_occrp.svg', 'OCCRP'],
    ['veritasium', '6995b6b76b85d83ace20f213_veritasium.svg', 'Veritasium'],
    ['dossier', '6995b6b712ed6eae703aa529_dossier.svg', 'Dossier'],
    ['examination', '6995b6b7b71f35ee36120df8_the-examination.svg', 'The Examination']
  ];
  // award laurels, captions transcribed from the images themselves
  const AWARDS = [
    ['69c3fc1ed6d24a98b88b1f8e_DAF.avif', 'Winner', 'DAfFNE 2024/25', 'TV Journalism'],
    ['6a579568790a84c9ea0921fb_shorty-doc.avif', 'Winner', 'Shorty Awards 2026', 'Documentary'],
    ['6a5795864389e378bc69d102_telly-pt.avif', 'Gold', 'The Telly Awards 2026', 'People’s Telly'],
    ['6a57958f790a84c9ea0945e3_telly-gsi.avif', 'Gold', 'The Telly Awards 2026', 'General-Social Impact'],
    ['6a5795763db98c279dc16160_shorty-ah.avif', 'Audience Honor', 'Shorty Awards 2026', 'Documentary'],
    ['69c3fc33827c55f5334a7d6b_PE.avif', 'Nomination', 'Prix Europa 2024', 'Video Investigation'],
    ['69c3fc3a039c2dbadc81dfd2_RDO.avif', 'Nomination', 'Rose d’Or 2024', 'News & Current Affairs']
  ];
  const TEAM = [["David", "Co-Founder"], ["Jonas", "Also Co-Founder"], ["Paul Lühnsdorf", "Executive Producer"], ["Cristian Kiesling", "Executive Producer"], ["Chris Varga", "Senior Editor-in-Chief"], ["Jonas Rump", "Senior Editor-in-Chief"], ["Lucie Schöner", "Junior Editor-in-Chief"], ["Mona Schier", "Senior Producer"], ["Elmer", "Narrator"], ["Nora Friese", "Art Director"], ["Thomas Overbeeke", "Art Director & Senior 3D Animator"], ["Marcel Becker-Neu", "Art Director & Video Editor"], ["Lucas Bardic", "Art Director"], ["Philipp", "Art Director"], ["Nikki Zeinar", "Head of Design"], ["Julia", "Senior Writer"], ["Marcel", "Senior Writer & Narrator (Simpli)"], ["Aaron Mucke", "Senior Writer"], ["Nina", "Senior Writer"], ["Marlon", "Writer"], ["Don", "Writer & Narrator"], ["Bao-My Nguyen", "Writer"], ["Alex López Castro", "Translator & Writer"], ["Gereon Wahle", "Writer & Set Designer"], ["Brian Doose", "Writer"], ["Finn Walter", "Writer"], ["Yannic", "Researcher"], ["Lisa Ossenbrink", "Writer"], ["Kristina", "Translator"], ["Valentin Macke", "Reporter"], ["Pascale Müller", "Head of Fact-Checking"], ["Marlene Halser", "Fact-checker"], ["Franziska Wunderlich", "Fact-checker"], ["Sabina Zollner", "Fact-checker"], ["Lisa Victoria Peter", "Fact-checker"], ["Vera Hartlieb", "Production Coordinator"], ["Alejandro Camacho Díaz", "Video Editor"], ["Suraj Chandran", "Video Editor"], ["Simon Voppmann", "Video Editor"], ["Timo Sell", "Video Editor"], ["Tom Büscher", "Video Editor"], ["Bernd MSC Schroers", "Video Editor"], ["Aron Krause-Arlt", "Video Editor"], ["Fabian Bien", "Video Editor"], ["Maurice Demandt", "Video Editor"], ["Max Weis", "Video Editor"], ["Lenz Schöler", "Senior 3D Animator"], ["Mel Wagner", "3D Animator"], ["Leonard Flohr", "3D Animator"], ["Sidney Heaney", "3D Animator"], ["Aziz Dereli", "3D Animator"], ["Lucas Göhr", "3D Animator"], ["Nil Tomm", "3D Animator"], ["Nikolai Nordmann", "3D Animator"], ["Ben Sommerhäuser", "3D Animator"], ["Killian van Basten", "3D Animator"], ["Victor Schroers", "3D Animator"], ["Mathias Hawk", "2D Motion Designer"], ["Marlene Sandmann", "2D Motion Designer"], ["Long Huy Dao", "2D Motion Designer"], ["Jakob Werner", "2D Motion Designer"], ["Dennis Gajdek", "2D Motion Designer"], ["Konne Fuchs", "2D Motion Designer"], ["Leo Sebastian Jung", "2D Motion Designer"], ["Lex Mittermiller", "2D Motion Designer"], ["Max Pregler", "2D Motion Designer"], ["Eddy Klaus", "2D Motion Designer"], ["Jakob Schöne", "2D Motion Designer"], ["Tim Verhaert", "2D Motion Designer"], ["Leo Wang", "Sound Designer"], ["Studio Soma", "Audio Engineers"], ["Alejandro Castellanos Paz", "3D Thumbnail Designer"], ["Anna Milkovic", "Brand Partnerships Senior Manager"], ["Yvonne Zimmer", "Finance Operations Manager"], ["John-Dustin Martin", "1UP Management"]];
  const FACES = ["69c40f661f39e0bc3dbdedfd_fern-team-member-4.avif", "69c40f9c6d7c0d7657ccfad9_fern-team-member-1.avif", "69f38f22035faa230e365e32_fern2.avif", "69c40faf9ee0ff08de1e307f_fern-team-member-2.avif", "69f38f31871ee33ccc90b6f5_fern1.avif", "69c40fbadc91dd26af6bf8be_fern-team-member-3.avif", "69f38f68968436a28700e37b_fern4.avif", "69c410852f27461d6eb8bf04_fern-team-member-222.avif", "69f38f91328e8ecb7de30ecf_fern22.avif", "69c41091990db1c059b2e9a1_fern-team-member-7.avif", "69f83f2218db148464971203_fern-team-433.avif", "69c410a19a0825f4e4d34fd5_fern-team-member-8.avif", "69f83f6a0c0f40f1c2a1f0db_fern-team-45665.avif", "69c410cc801e88cb4ec5ac99_compressed_fern-team-member-9.avif", "6a9eb0f2405b1afcf2dacf58_fern-teammmember2.avif", "69c410ecdc64daf0ffeaf1b1_fern-team-member-11.avif", "69f88ac8ce6bf85ea3904f9b_fern-team-11132.avif", "69c41121d1adcbc581e21e1d_fern-team-member-22.avif", "69c411469a0825f4e4d3857a_team-member-fern-111.avif", "69c41175648e8c0be3d37ca4_fern-team-member-14.avif", "69c4117dbcda107622657065_fern-team-member-15.avif", "69c411b06e1cd0abfc18cb57_fern-team-member-234.avif", "69c411bd2d206eafdaa6654b_fern-team-member-18.avif", "69c411e0ec4a365231225737_compressed_fern-team-member-20.avif", "69c4121e650d76822575dee6_fern-team-member-1113.avif", "69c4124c3bed076dba5f0508_fern-team-member-23.avif", "69c41253305b28ee30a5bcf7_fern-team-member-24.avif", "69c4125ebb83d00a4dbcdb05_fern-team-member-26.avif", "69c412639900fe13f3265b37_fern-team-member-27.avif", "69c4126d02480a3439b9e2d9_fern-team-member-28.avif", "69c51ca9dafb7e91bddfc03e_fern-team-member-83.avif"];

  /* ---------- wordmark (lottie, svg fallback) ---------- */
  // the static svg is visible from the first frame; lottie takes over once its json is in
  const wm = $('#wordmark'), wmLink = $('.wordmark');
  if (window.lottie) {
    const anim = lottie.loadAnimation({ container: wm, renderer: 'svg', loop: false, autoplay: false, path: `${A}logos/692c6126d933cf487418969d_ferm-lottie-02-optimized.json` });
    anim.addEventListener('DOMLoaded', () => {
      wmLink.classList.add('is-live');
      // reduced motion: no intro, show the finished wordmark
      reduced ? anim.goToAndStop(anim.totalFrames - 1, true) : anim.goToAndPlay(0, true);
    });
    if (!reduced) wmLink.addEventListener('mouseenter', () => anim.goToAndPlay(0, true));
  }

  /* ---------- reel sound ---------- */
  const reel = $('#reel'), snd = $('#sound');
  let reelVisible = true;
  snd.addEventListener('click', () => {
    reel.muted = !reel.muted;
    if (!reel.muted) reel.play().catch(() => {});
    snd.setAttribute('aria-pressed', String(!reel.muted));
  });
  // hero reel: autoplay only while visible, never with reduced motion (sound button still starts it)
  new IntersectionObserver(([en]) => {
    reelVisible = en.isIntersecting;
    if (reelVisible && (!reduced || !reel.muted)) reel.play().catch(() => {});
    else if (!reelVisible) reel.pause();
  }, { threshold: .25 }).observe(reel);

  /* ---------- subscriber meter: bars grow once, values count up to exactly what Fern writes ---------- */
  const meter = $('#meter');
  const meterRows = $$('.meter__row', meter);
  const easeOut = t => 1 - Math.pow(1 - t, 4); // close to the css ease-out curve
  const fmt = (num, unit, k) => {
    const n = parseFloat(num) * k;
    if (unit === 'k') return `${Math.round(n)}k`;
    // during the count one decimal, at rest exactly the source string ("5 mil", "2.3 Mil")
    return k >= 1 ? `${num} ${unit}` : `${n.toFixed(1)} ${unit}`;
  };
  function growMeter() {
    meter.classList.add('is-in');
    if (reduced) return;
    meterRows.forEach((row, i) => {
      const out = $('.meter__val', row), { num, unit } = row.dataset;
      const t0 = performance.now() + i * 90, dur = 900;
      out.textContent = fmt(num, unit, 0);
      const tick = now => {
        const t = Math.min(1, Math.max(0, (now - t0) / dur));
        out.textContent = fmt(num, unit, t >= 1 ? 1 : easeOut(t));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const logo = ([k, f, n]) => `<img data-src="${A}logos/${f}" alt="${n}" title="${n}" width="74" height="13" loading="lazy" decoding="async">`;
  $('#chips').innerHTML = PARTNERS.map(p => `<span>${logo(p)}</span>`).join('');

  /* ---------- awards clothesline ---------- */
  const track = $('#lineTrack'), vp = $('#lineViewport');
  track.innerHTML = AWARDS.map(([img, kick, title, cat], i) => `
    <li class="hang" style="--tilt:${[-2.2, 1.6, -1, 2.4, -1.8, 1.2, -2][i]}deg;--sd:${4 + (i % 3) * .7}s;--sdl:${-i * .9}s">
      <span class="peg" aria-hidden="true"></span>
      <div class="hang__card">
        <div class="hang__img">${sized(img, '236px', 800, 615, `${kick}, ${title}, ${cat}`)}</div>
        <p class="hang__kicker${kick === 'Nomination' ? ' is-nom' : ''}">${kick}</p>
        <h3>${title}</h3>
        <p>${cat}</p>
      </div>
    </li>`).join('');
  let x = 0;
  const maxX = () => Math.max(0, track.scrollWidth - vp.clientWidth);
  const step = () => { const h = $('.hang', track); return h ? h.offsetWidth + parseFloat(getComputedStyle(track).gap) : 260; };
  const prev = $('#linePrev'), next = $('#lineNext'), dots = $('#lineDots');
  const perPage = () => Math.max(1, Math.floor(vp.clientWidth / step()) - 1);
  // snap positions: one per page, the last one flush with the end
  const stops = () => {
    const out = [], s = step() * perPage(), m = maxX();
    for (let v = 0; v < m - 4; v += s) out.push(v);
    out.push(m);
    return out;
  };
  function buildDots() {
    dots.innerHTML = stops().map((_, i) => `<button class="dot" aria-label="Awards page ${i + 1}"></button>`).join('');
    $$('.dot', dots).forEach((d, i) => d.addEventListener('click', () => setX(stops()[i])));
  }
  function setX(v) {
    x = Math.max(0, Math.min(maxX(), v));
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    prev.disabled = x <= 1; next.disabled = x >= maxX() - 1;
    const st = stops();
    let cur = 0; st.forEach((s, i) => { if (x >= s - 4) cur = i; });
    $$('.dot', dots).forEach((d, i) => { d.classList.toggle('is-on', i === cur); d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
  }
  const go = dir => {
    const st = stops();
    let cur = 0; st.forEach((s, i) => { if (x >= s - 4) cur = i; });
    setX(st[Math.max(0, Math.min(st.length - 1, cur + dir))]);
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  vp.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setX(0); }
    else if (e.key === 'End') { e.preventDefault(); setX(maxX()); }
  });
  addEventListener('resize', () => { buildDots(); setX(x); });
  buildDots(); setX(0);
  // drag / swipe
  let dragX = null, startX = 0, moved = false;
  vp.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragX = e.clientX; startX = x; moved = false;
    track.classList.add('is-drag'); vp.classList.add('is-drag');
  });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const d = e.clientX - dragX;
    if (Math.abs(d) > 4) moved = true;
    if (moved) setX(startX - d);
  });
  addEventListener('pointerup', () => {
    if (dragX === null) return;
    dragX = null; track.classList.remove('is-drag'); vp.classList.remove('is-drag');
    // settle on the nearest page stop
    const st = stops(); setX(st.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a, 0));
  });

  /* ---------- timeline + team ---------- */
  $$('.tl__toggle:not(.roster__toggle)').forEach(b => b.addEventListener('click', () => {
    const more = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') === 'true';
    more.hidden = open;
    b.setAttribute('aria-expanded', String(!open));
    b.textContent = open ? 'Show more' : 'Show less';
    refreshLayout();
  }));
  $('#faces').innerHTML = FACES.map(f => sized(f, '42px', 42, 42)).join('');
  const roster = $('#roster'), rt = $('#rosterToggle');
  const SHOWN = 12;
  roster.innerHTML = TEAM.map(([n, r], i) => `<li${i >= SHOWN ? ' class="is-hidden"' : ''}>${n}<span>${r}</span></li>`).join('');
  rt.addEventListener('click', () => {
    const open = rt.getAttribute('aria-expanded') === 'true';
    $$('li', roster).forEach((li, i) => li.classList.toggle('is-hidden', open && i >= SHOWN));
    rt.setAttribute('aria-expanded', String(!open));
    rt.textContent = open ? 'Show more' : 'Show less';
    refreshLayout();
  });

  /* ---------- section videos: muted loops run only while on screen (preload none until then) ---------- */
  const loops = $$('video:not(#reel)');
  const inView = new Set();
  const vidIO = new IntersectionObserver(ents => ents.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) { inView.add(v); if (!reduced && !document.hidden) v.play().catch(() => {}); }
    else { inView.delete(v); v.pause(); }
  }), { threshold: .4 });
  loops.forEach(v => vidIO.observe(v));
  // tab switch: pause everything, resume what is on screen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { loops.forEach(v => v.pause()); reel.pause(); return; }
    if (!reduced) inView.forEach(v => v.play().catch(() => {}));
    if (reelVisible && (!reduced || !reel.muted)) reel.play().catch(() => {});
  });

  /* ---------- deferred media: data-src / data-srcset / data-poster are attached shortly before they scroll in ---------- */
  const lazyIO = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    if (el.dataset.srcset) el.srcset = el.dataset.srcset;
    if (el.dataset.src) el.src = el.dataset.src;
    if (el.dataset.poster) el.poster = el.dataset.poster;
    lazyIO.unobserve(el);
  }), { rootMargin: '400px 0px' });
  $$('[data-src], [data-poster]').forEach(el => lazyIO.observe(el));

  /* ---------- nav ---------- */
  const pill = $('.pill'), navLinks = $$('.pill a');
  const navOrder = ['top', 'story', 'sponsors', 'jobs', 'contact'].map(k => [k, document.getElementById(k)]);
  const setActive = k => navLinks.forEach(a => { const on = a.dataset.nav === k; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'); });
  // active = last section whose top passed 40% of the viewport; page end always means contact
  let navTick = 0;
  function updateNav() {
    navTick = 0;
    pill.classList.toggle('is-scrolled', scrollY > 30);
    const line = innerHeight * .4;
    let cur = 'top';
    navOrder.forEach(([k, el]) => { if (k !== 'top' && el.getBoundingClientRect().top <= line) cur = k; });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) cur = 'contact';
    setActive(cur);
  }
  addEventListener('scroll', () => { if (!navTick) navTick = requestAnimationFrame(updateNav); }, { passive: true });
  updateNav();

  /* ---------- reveals ---------- */
  // note + grid are part of the intro (CSS); everything below fades up once it scrolls in
  const revealEls = [$('.awards'), $('.story'), ...$$('.pin'), $('.jobs'), $('.contact__card'), ...$$('.qnote')];
  revealEls.forEach(el => el.setAttribute('data-reveal', ''));
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('is-in');
    // once faded in, hand the element back its own hover transitions
    if (el.hasAttribute('data-reveal')) setTimeout(() => el.removeAttribute('data-reveal'), 900 + (parseFloat(el.style.getPropertyValue('--rd')) || 0));
    if (el.classList.contains('gridcard')) setTimeout(growMeter, reduced ? 0 : 450);
    io.unobserve(el);
  }), { threshold: .15 });
  // reduced motion keeps the same observer, CSS turns the reveal into a plain fade
  [...revealEls, $('.note'), $('.gridcard')].forEach(el => io.observe(el));
  [...$$('.pin'), ...$$('.qnote')].forEach((p, i) => { p.style.setProperty('--rd', `${(i % 3) * 90}ms`); });

  /* ---------- stickers: placed relative to sections, draggable, remembered ---------- */
  const desk = $('.desk');
  const stickers = $$('.sticker');
  stickers.forEach((s, i) => s.style.setProperty('--i', i));
  const layer = $('#stickers');
  stickers.forEach(s => s.insertAdjacentHTML('beforeend', `<span class="sticker__label">${s.dataset.label}</span>`));
  // wide screens use the page margins; narrower ones the compact spots next to the cards
  const compact = () => innerWidth < 1240;
  function placeStickers() {
    const d = desk.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    const lx = layer.getBoundingClientRect().left;
    stickers.forEach(s => {
      const c = compact();
      const pos = c ? s.dataset.mx : s.dataset.x;
      s.hidden = c && pos === 'none';
      if (s.hidden) return;
      const a = $(s.dataset.anchor).getBoundingClientRect();
      const at = parseFloat(c ? s.dataset.mat : s.dataset.at);
      const w = s.offsetWidth * (mobile() ? .7 : 1);
      const xPx = d.left + d.width * parseFloat(pos) / 100;
      s.style.top = `${Math.round(a.top - d.top + a.height * at)}px`;
      s.style.left = `${Math.round(Math.max(8, Math.min(vw - w - 8, xPx)) - lx)}px`;
    });
  }
  const saved = store.get('fern-05-locker-stickers') || {};
  stickers.forEach(s => {
    const p = saved[s.dataset.id];
    if (p) { s.style.setProperty('--dx', `${p[0]}px`); s.style.setProperty('--dy', `${p[1]}px`); }
    let sx, sy, ox, oy, id = null;
    s.addEventListener('pointerdown', e => {
      id = e.pointerId; s.setPointerCapture(id);
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(s.style.getPropertyValue('--dx')) || 0; oy = parseFloat(s.style.getPropertyValue('--dy')) || 0;
      s.classList.add('is-drag'); s.classList.remove('is-back');
      s.parentNode.appendChild(s);
    });
    s.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      s.style.setProperty('--dx', `${ox + e.clientX - sx}px`);
      s.style.setProperty('--dy', `${oy + e.clientY - sy}px`);
    });
    const end = e => {
      if (e.pointerId !== id) return;
      id = null; s.classList.remove('is-drag');
      saved[s.dataset.id] = [parseFloat(s.style.getPropertyValue('--dx')) || 0, parseFloat(s.style.getPropertyValue('--dy')) || 0];
      store.set('fern-05-locker-stickers', saved);
    };
    s.addEventListener('pointerup', end); s.addEventListener('pointercancel', end);
  });
  $('#resetStickers').addEventListener('click', () => {
    stickers.forEach(s => { s.classList.add('is-back'); s.style.setProperty('--dx', '0px'); s.style.setProperty('--dy', '0px'); delete saved[s.dataset.id]; });
    store.del('fern-05-locker-stickers');
  });

  /* ---------- drafting mat: page height, ruler labels, construction lines ---------- */
  const mat = $('.mat'), top = $('.ruler--top'), left = $('.ruler--left'), con = $('#construct');
  function drawMat() {
    const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight;
    mat.style.height = `${H}px`;
    // grid aligned to the page center, so rulers share its origin
    const ox = ((W / 2) % 120);
    mat.style.backgroundPosition = `center top, 0 0, ${ox}px 0, 0 0, ${ox % 24}px 0`;
    top.style.backgroundPosition = `${ox}px 0, ${ox % 24}px 0`;
    let t = '';
    for (let px = ox, n = 0; px < W; px += 120, n++) t += `<span style="left:${px}px">${n * 5}</span>`;
    top.innerHTML = t;
    let l = '';
    for (let py = 120, n = 1; py < H; py += 120, n++) l += `<span style="top:${py}px">${n * 5}</span>`;
    left.innerHTML = l;
    // big construction geometry, the drafting-table layer
    const cx = W * .08, cy = Math.min(H * .32, 1300);
    const rays = [15, 30, 45, 60].map(a => {
      const r = Math.PI * a / 180, L = 1400;
      const x2 = cx + Math.cos(r) * L, y2 = cy - Math.sin(r) * L;
      const lx = cx + Math.cos(r) * 640, ly = cy - Math.sin(r) * 640;
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/><text x="${lx + 6}" y="${ly}">${a}°</text>`;
    }).join('');
    const bx = W * .94, by = H * .62;
    con.setAttribute('viewBox', `0 0 ${W} ${H}`);
    con.innerHTML = `
      <g fill="none" stroke="rgba(117,134,150,.22)" stroke-width="1">
        <circle cx="${cx}" cy="${cy}" r="640" stroke-dasharray="6 7"/>
        <circle cx="${cx}" cy="${cy}" r="420"/>
        <g stroke-dasharray="3 6">${rays.replace(/<text[^>]*>[^<]*<\/text>/g, '')}</g>
        <circle cx="${bx}" cy="${by}" r="520" stroke-dasharray="6 7"/>
        <circle cx="${bx}" cy="${by}" r="300"/>
        <line x1="0" y1="${by}" x2="${W}" y2="${by}" stroke-dasharray="2 8"/>
        <line x1="${W * .5}" y1="${H - 900}" x2="${W}" y2="${H - 1500}" stroke-dasharray="3 6"/>
      </g>
      <g>${(rays.match(/<text[^>]*>[^<]*<\/text>/g) || []).join('')}
        <text x="${bx - 300 - 30}" y="${by - 8}">r 300</text>
        <text x="${cx + 8}" y="${cy + 16}">0°</text>
      </g>`;
    placeStickers();
  }
  let raf = 0;
  function refreshLayout() { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawMat); }
  new ResizeObserver(refreshLayout).observe(desk);
  addEventListener('resize', refreshLayout);
  addEventListener('load', refreshLayout);
  drawMat();
  // stickers stay invisible until fonts have settled the layout, then pop in at their final spot
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => requestAnimationFrame(() => {
    drawMat();
    layer.classList.add('is-placed');
  }));
})();
