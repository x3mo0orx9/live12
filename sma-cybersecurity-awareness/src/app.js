/* ==========================================================================
   Deck engine: stage scaling, navigation, arch-door transitions, language,
   presenter tools. Interactive galleries live in sims.js and register
   themselves on window.SMA.sims.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const root = document.documentElement;

  /** Bilingual HTML: both languages are always in the DOM, CSS shows one. */
  const B = (en, ar) => `<span lang="en">${en}</span><span lang="ar">${ar}</span>`;
  const icon = (name, cls = '') => `<svg class="ic ${cls}"><use href="#i-${name}"/></svg>`;
  const pair = (s) => { const [en, ar] = String(s || '').split('||'); return B(en, ar === undefined ? en : ar); };

  /** The SMA arch: a gently pointed arch on straight jambs. */
  const n1 = (v) => +v.toFixed(1);
  const ARCH = (w, h) => {
    const c = Math.min(w * 0.55, h * 0.62);
    return `M0 ${n1(h)}V${n1(c)}C0 ${n1(c * 0.44)} ${n1(w * 0.22)} ${n1(c * 0.11)} ${n1(w / 2)} 0C${n1(w * 0.78)} ${n1(c * 0.11)} ${n1(w)} ${n1(c * 0.44)} ${n1(w)} ${n1(c)}V${n1(h)}Z`;
  };
  const archSvg = (w = 30, h = 44) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${ARCH(w, h)}"/></svg>`;

  const LIGHT = '#F3F1ED';
  const WALLS = { charcoal: LIGHT, blue: LIGHT, yellow: LIGHT, green: LIGHT, red: LIGHT, stone: LIGHT, copper: LIGHT };
  const GALLERIES = [
    ['Welcome', 'الترحيب'],
    ['Common threats', 'التهديدات الشائعة'],
    ['Phishing', 'التصيّد الاحتيالي'],
    ['Social engineering', 'الهندسة الاجتماعية'],
    ['Malware and ransomware', 'البرمجيات الخبيثة والفدية'],
    ['Passwords and MFA', 'كلمات المرور والمصادقة'],
    ['AI-powered threats', 'تهديدات الذكاء الاصطناعي'],
    ['Good habits', 'العادات الآمنة'],
    ['Recognise and report', 'الرصد والإبلاغ'],
    ['Close', 'الختام'],
  ];

  const GALLERY_ICONS = ['landmark', 'eye', 'fishing-hook', 'drama', 'file-lock', 'key-round', 'scan-face', 'shield-check', 'megaphone', 'award'];

  const stage = $('#stage');
  const slides = $$('.slide');
  const door = $('#door');
  const doorTitle = $('#doorTitle');
  const floorEl = $('.floor');
  const bottomEl = $('.bottom');
  const drawer = $('#drawer');
  const mapEl = $('#map');
  const clockEl = $('#clock');
  const nextBtn = $('.bottom [data-act="next"]');

  const state = { i: 0, step: 0, lang: 'en', scale: 1, busy: false };
  let unlock = null;

  const store = {
    get(k) { try { return localStorage.getItem('sma-cs-' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('sma-cs-' + k, v); } catch (e) { /* private mode */ } },
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- stage ------------------------------------------------------------ */
  function fit() {
    state.scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    root.style.setProperty('--s', state.scale.toFixed(5));
  }
  /** Pointer position inside `el`, in unscaled stage pixels. */
  function stageXY(e, el) {
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / state.scale, y: (e.clientY - r.top) / state.scale };
  }
  function applyArches() {
    $$('.arch,.niche,.habits>li').forEach((el) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (w && h) el.style.clipPath = `path("${ARCH(w, h)}")`;
    });
  }
  function setWall(name) {
    root.dataset.wall = name;
    floorEl.dataset.wall = name;
    bottomEl.dataset.wall = name;
  }

  /* ---- steps and navigation --------------------------------------------- */
  function applyStep(slide, step, silent) {
    slide.dataset.step = step;
    $$('[data-at]', slide).forEach((el) => el.classList.toggle('on', +el.dataset.at <= step));
    if (!silent) slide.dispatchEvent(new CustomEvent('step', { detail: step }));
  }
  function setStep(n) {
    const slide = slides[state.i];
    state.step = Math.max(0, Math.min(+slide.dataset.steps || 0, n));
    applyStep(slide, state.step, true);
  }

  function go(i, step = 0, opts = {}) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (state.busy || (i === state.i && !opts.force)) return;
    const from = slides[state.i];
    const to = slides[i];
    const fwd = i >= state.i;
    startClock(i);

    const swap = () => {
      from.classList.remove('is-current', 'is-leaving');
      if (from !== to) from.dispatchEvent(new CustomEvent('leave'));
      state.i = i;
      state.step = step === 'end' ? (+to.dataset.steps || 0) : step;
      setWall(to.dataset.wall);
      to.classList.add('is-current');
      applyStep(to, state.step);
      to.dispatchEvent(new CustomEvent('enter'));
      autoplay();
      chrome();
      if (!opts.keepHash) { try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* embedded preview */ } }
    };

    if (opts.instant || reduced()) { swap(); return; }
    state.busy = true;
    // safety net: whatever happens during a transition, navigation unlocks again
    clearTimeout(unlock);
    unlock = setTimeout(() => { state.busy = false; }, 2600);

    if (from.dataset.gallery !== to.dataset.gallery) {
      // walk through the arch into the next painted room
      const g = +to.dataset.gallery;
      from.classList.add('is-leaving');
      door.style.setProperty('--door', WALLS[to.dataset.wall]);
      door.style.visibility = 'visible';
      floorEl.dataset.wall = to.dataset.wall;
      bottomEl.dataset.wall = to.dataset.wall;
      const grow = door.animate(
        [{ transform: 'translateX(-50%) scale(0)' }, { transform: 'translateX(-50%) scale(1)' }],
        { duration: fwd ? 950 : 700, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' },
      );
      // going forward, the room's sign appears on the new wall before its first exhibit
      let sign = null;
      if (fwd) {
        doorTitle.dataset.wall = to.dataset.wall;
        doorTitle.innerHTML = `<span class="picto">${icon(GALLERY_ICONS[g])}</span><strong class="display">${B(GALLERIES[g][0], GALLERIES[g][1])}</strong>`;
        doorTitle.style.visibility = 'visible';
        sign = doorTitle.animate(
          [{ opacity: 0, translate: '0 46px' }, { opacity: 1, translate: '0 0' }],
          { duration: 650, delay: 430, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' },
        );
      }
      const arrive = () => {
        root.classList.add('no-trans');
        swap();
        if (sign) {
          const leave = doorTitle.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
          leave.onfinish = () => { doorTitle.style.visibility = 'hidden'; sign.cancel(); leave.cancel(); };
        }
        requestAnimationFrame(() => requestAnimationFrame(() => {
          door.style.visibility = 'hidden';
          grow.cancel();
          root.classList.remove('no-trans');
          state.busy = false;
        }));
      };
      grow.onfinish = () => { if (sign) setTimeout(arrive, 700); else arrive(); };
    } else {
      const dx = (fwd ? 1 : -1) * (root.dir === 'rtl' ? -1 : 1) * 70;
      const out = from.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dx * 0.5}px)` }],
        { duration: 220, easing: 'ease-in', fill: 'forwards' },
      );
      out.onfinish = () => {
        swap();
        out.cancel();
        to.animate(
          [{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'none' }],
          { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
        state.busy = false;
      };
    }
  }

  /** Each slide plays its reveals by itself, at the pace the slide sets. */
  let auto = null;
  function autoplay() {
    clearTimeout(auto);
    const slide = slides[state.i];
    if (state.step >= (+slide.dataset.steps || 0)) return;
    const pace = typeof slide.pace === 'function' ? slide.pace(state.step) : (+slide.dataset.pace || 1600);
    auto = setTimeout(() => {
      state.step += 1;
      applyStep(slide, state.step);
      autoplay();
    }, pace + (state.step === 0 ? 700 : 0));
  }
  /** Jump straight to the finished state of the current slide. */
  function finish() {
    clearTimeout(auto);
    const slide = slides[state.i];
    state.step = +slide.dataset.steps || 0;
    applyStep(slide, state.step);
  }
  function next() {
    if (state.busy) return;
    if (state.i < slides.length - 1) go(state.i + 1, 0);
  }
  function prev() {
    if (state.busy) return;
    if (state.i > 0) go(state.i - 1, 'end');
  }

  /* ---- chrome ----------------------------------------------------------- */
  const arcade = $('#arcade');
  arcade.innerHTML = GALLERIES.map((g, k) => `<button data-gallery="${k}">${archSvg(30, 44)}<span class="tip">${B(g[0], g[1])}</span></button>`).join('');
  const arcadeBtns = $$('button', arcade);

  function chrome() {
    const slide = slides[state.i];
    const g = +slide.dataset.gallery;
    const two = (v) => String(v).padStart(2, '0');
    $('#count').textContent = `${two(state.i + 1)} / ${two(slides.length)}`;
    $('#whereName').innerHTML = B(GALLERIES[g][0], GALLERIES[g][1]);
    arcadeBtns.forEach((b, k) => {
      b.classList.toggle('done', k < g);
      b.classList.toggle('now', k === g);
    });
    $$('#mapGrid button').forEach((b) => b.classList.toggle('now', +b.dataset.go === state.i));
    if (!drawer.hidden) fillNotes();
  }

  function buildMap() {
    $('#mapGrid').innerHTML = GALLERIES.map((g, k) => {
      const mine = slides.map((s, i) => [s, i]).filter(([s]) => +s.dataset.gallery === k);
      const mins = mine.reduce((a, [s]) => a + (+s.dataset.min || 0), 0);
      return `<div class="map-room" data-wall="${mine[0][0].dataset.wall}">
        <h3><span>${B(g[0], g[1])}</span><small>${B(mins + ' min', mins + ' د')}</small></h3>
        ${mine.map(([s, i]) => `<button data-go="${i}">${pair(s.dataset.title)}</button>`).join('')}
      </div>`;
    }).join('');
  }
  function fillNotes() {
    const n = $('.notes', slides[state.i]);
    $('#drawerText').innerHTML = n ? n.innerHTML : '';
  }
  function toggle(el, btnAct, fill) {
    el.hidden = !el.hidden;
    if (!el.hidden && fill) fill();
    $$(`.top [data-act="${btnAct}"]`).forEach((b) => b.setAttribute('aria-pressed', String(!el.hidden)));
  }

  /* ---- language --------------------------------------------------------- */
  function setLang(lang, animate) {
    const apply = () => {
      state.lang = lang;
      root.lang = lang;
      root.dir = lang === 'ar' ? 'rtl' : 'ltr';
      store.set('lang', lang);
      requestAnimationFrame(applyArches);
      window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    };
    if (!animate || reduced()) { apply(); return; }
    const out = stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
    out.onfinish = () => {
      apply();
      out.cancel();
      stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, easing: 'ease-out' });
    };
  }

  /* ---- presenter clock: elapsed time, flagged when behind the plan ------- */
  let t0 = null;
  let pausedAt = null;
  const planned = (idx) => slides.slice(0, idx + 1).reduce((a, s) => a + (+s.dataset.min || 0), 0) * 60;
  const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  function startClock(target) {
    if (t0 === null && target > 0) t0 = Date.now();
  }
  function tick() {
    const btn = clockEl.closest('.tool');
    if (t0 === null) { clockEl.textContent = '00:00'; btn.removeAttribute('aria-pressed'); return; }
    const elapsed = ((pausedAt === null ? Date.now() : pausedAt) - t0) / 1000;
    clockEl.textContent = mmss(elapsed);
    btn.setAttribute('aria-pressed', String(elapsed > planned(state.i) + 45 || pausedAt !== null));
    btn.title = `Plan for this point: ${mmss(planned(state.i))} · click to pause · double-click to reset`;
  }
  function toggleClock() {
    if (t0 === null) { t0 = Date.now(); return; }
    if (pausedAt === null) pausedAt = Date.now();
    else { t0 += Date.now() - pausedAt; pausedAt = null; }
  }
  setInterval(tick, 500);

  /* ---- input ------------------------------------------------------------ */
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  }
  const ACTS = {
    next, prev,
    lang: () => setLang(state.lang === 'en' ? 'ar' : 'en', true),
    timer: toggleClock,
    notes: () => toggle(drawer, 'notes', fillNotes),
    map: () => toggle(mapEl, 'map'),
    full: fullscreen,
    restart: () => { t0 = null; pausedAt = null; go(0); },
  };

  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (act && ACTS[act.dataset.act]) { ACTS[act.dataset.act](); return; }
    const jump = e.target.closest('[data-go]');
    if (jump) { mapEl.hidden = true; $$('.top [data-act="map"]').forEach((b) => b.setAttribute('aria-pressed', 'false')); go(+jump.dataset.go); return; }
    const room = e.target.closest('#arcade button');
    if (room) go(slides.findIndex((s) => s.dataset.gallery === room.dataset.gallery));
  });
  $('[data-act="timer"]').addEventListener('dblclick', () => { t0 = null; pausedAt = null; tick(); });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t.matches && t.matches('input,textarea,[contenteditable="true"]')) {
      if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); t.blur(); }
      return;
    }
    const onControl = t.matches && t.matches('button,[role=button],a');
    const k = e.key;
    let hit = true;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown') next();
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') prev();
    else if ((k === ' ' || k === 'Enter') && !onControl) next();
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'l' || k === 'L') ACTS.lang();
    else if (k === 'g' || k === 'G') ACTS.map();
    else if (k === 'n' || k === 'N') ACTS.notes();
    else if (k === 't' || k === 'T') ACTS.timer();
    else if (k === 'f' || k === 'F') ACTS.full();
    else if (k === 'Escape') { if (!mapEl.hidden) ACTS.map(); else if (!drawer.hidden) ACTS.notes(); }
    else hit = false;
    if (hit) e.preventDefault();
  });

  // swipe on touch screens
  let touch = null;
  stage.addEventListener('pointerdown', (e) => {
    touch = e.pointerType === 'touch' && !e.target.closest('button,[role=button],input,[contenteditable],.specimens,.plan') ? { x: e.clientX, y: e.clientY } : null;
  });
  stage.addEventListener('pointerup', (e) => {
    if (!touch) return;
    const dx = e.clientX - touch.x;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(e.clientY - touch.y) * 1.5) {
      const forward = (dx < 0) !== (root.dir === 'rtl');
      if (forward) next(); else prev();
    }
    touch = null;
  });

  document.addEventListener('fullscreenchange', () => {
    const use = $('[data-act="full"] use');
    if (use) use.setAttribute('href', document.fullscreenElement ? '#i-minimize' : '#i-maximize');
  });
  addEventListener('resize', fit);
  addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= slides.length && n - 1 !== state.i) go(n - 1, 0, { keepHash: true });
  });

  /* ---- boot ------------------------------------------------------------- */
  const api = { $, $$, B, icon, pair, ARCH, archSvg, state, store, go, next, prev, finish, setStep, setWall, stageXY, applyArches, reduced };
  const sims = {};

  function boot() {
    fit();
    slides.forEach((slide) => {
      const sim = sims[slide.dataset.sim];
      if (sim) sim(slide, api);
    });
    buildMap();
    const q = new URLSearchParams(location.search).get('lang');
    setLang(q === 'ar' || q === 'en' ? q : (store.get('lang') === 'ar' ? 'ar' : 'en'), false);
    const n = parseInt(location.hash.slice(1), 10);
    go(n >= 1 && n <= slides.length ? n - 1 : 0, 0, { instant: true, force: true });
    applyArches();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyArches);
    tick();
  }

  window.SMA = { api, sims, boot };
})();
