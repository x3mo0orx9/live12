/* SMA · Cyber awareness 2026 — navigation, language, motion, presenter tools.
   No dependencies and no network: everything runs from this one file. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var slides = [].slice.call(doc.querySelectorAll('.slide'));
  var total = slides.length, cur = 0;
  var bar = doc.getElementById('bar'), count = doc.getElementById('count'), prog = doc.getElementById('prog');
  var toc = doc.getElementById('toc'), sheet = doc.getElementById('sheet');
  var np = doc.getElementById('np'), npText = doc.getElementById('np-text');
  var contact = doc.getElementById('contact');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  /* Storage and history can be blocked (private windows, embedded previews). */
  function keep(k, v) {
    try {
      if (v === undefined) return window.localStorage.getItem(k);
      window.localStorage.setItem(k, v);
    } catch (e) { /* carry on without it */ }
    return null;
  }

  /* Scale the 1920x1080 stage to the window; make room for the notes panel when it is open. */
  function fit() {
    var h = window.innerHeight - (np.classList.contains('open') ? np.offsetHeight : 0);
    root.style.setProperty('--s', Math.min(window.innerWidth / 1920, h / 1080));
    root.style.setProperty('--cy', (h / 2) + 'px');
  }

  function titleOf(s, lang) {
    var t = s.getAttribute('data-title-' + lang);
    if (t) return t;
    var el = s.querySelector('.title [lang=' + lang + '], h2 [lang=' + lang + ']');
    return el ? el.textContent : '';
  }

  /* ---- numbers that count up when their slide opens ---------------------- */
  function fmt(v, dec) {
    var s = v.toFixed(dec), p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return p.join('.');
  }
  var timers = [];
  function stopCounts() { timers.forEach(function (t) { clearTimeout(t); cancelAnimationFrame(t); }); timers = []; }
  function runCounts(s, instant) {
    stopCounts();
    [].forEach.call(s.querySelectorAll('[data-count]'), function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var from = parseFloat(el.getAttribute('data-from') || '0');
      var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
      var wait = parseFloat(el.getAttribute('data-wait') || '0') * 1000;
      var dur = parseFloat(el.getAttribute('data-dur') || '1.4') * 1000;
      if (instant || calm) { el.textContent = fmt(to, dec); return; }
      el.textContent = fmt(from, dec);
      timers.push(setTimeout(function () {
        var t0 = null;
        function step(now) {
          if (t0 === null) t0 = now;
          var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt(from + (to - from) * e, dec);
          if (k < 1) timers.push(requestAnimationFrame(step));
        }
        timers.push(requestAnimationFrame(step));
      }, wait));
    });
  }

  function refresh() {
    var s = slides[cur], lang = root.lang;
    count.textContent = (cur + 1) + ' / ' + total;
    prog.style.width = ((cur + 1) / total * 100) + '%';
    root.setAttribute('data-tone', s.classList.contains('dark') ? 'dark' : 'light');
    var n = s.querySelector('.notes [lang=' + lang + ']');
    npText.textContent = n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
    npText.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (np.classList.contains('open')) fit();
    [].forEach.call(toc.children, function (b, i) {
      b.setAttribute('aria-current', i === cur ? 'true' : 'false');
      b.lastChild.textContent = titleOf(slides[i], lang);
    });
    doc.title = titleOf(s, lang) + ' · ' + (lang === 'ar' ? 'هيئة الشارقة للمتاحف' : 'Sharjah Museums Authority');
    try { window.history.replaceState(null, '', '#' + (cur + 1)); } catch (e) { /* file previews may refuse */ }
  }

  var underTimer;
  function go(n, instant) {
    n = Math.max(0, Math.min(total - 1, n));
    var old = slides[cur], next = slides[n];
    var wipe = !instant && !calm && n !== cur && old.classList.contains('dark') !== next.classList.contains('dark');
    root.classList.toggle('instant', !!instant);
    clearTimeout(underTimer);
    slides.forEach(function (s) { s.classList.remove('active', 'under', 'wipe'); s.setAttribute('aria-hidden', 'true'); });
    if (wipe) {
      /* keep the old wall underneath while the new one wipes across it */
      old.classList.add('under');
      next.classList.add('wipe');
      underTimer = setTimeout(function () { old.classList.remove('under'); }, 900);
    }
    void next.offsetWidth;            /* restart the slide's animations from the top */
    next.classList.add('active');
    next.setAttribute('aria-hidden', 'false');
    cur = n;
    runCounts(next, instant);
    refresh();
  }
  function next() { if (cur < total - 1) go(cur + 1); }
  function prev() { if (cur > 0) go(cur - 1, true); }
  function replay() { go(cur); }

  function setLang(l) {
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    keep('sma-cyber-lang', l);
    if (contact) contact.setAttribute('data-ph', contact.getAttribute('data-ph-' + l));
    refresh();
  }
  function toggleLang() { root.classList.add('instant'); setLang(root.lang === 'ar' ? 'en' : 'ar'); }

  function toggleSheet(open) {
    var on = open === undefined ? !sheet.classList.contains('open') : open;
    sheet.classList.toggle('open', on);
    doc.getElementById('b-list').setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function toggleNotes() {
    var on = !np.classList.contains('open');
    np.classList.toggle('open', on);
    doc.getElementById('b-notes').setAttribute('aria-pressed', on ? 'true' : 'false');
    fit();
  }
  function toggleFull() {
    try {
      if (doc.fullscreenElement) doc.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen();
    } catch (e) { /* not available here */ }
  }

  /* slide numbers and the slide list */
  slides.forEach(function (s, i) {
    var pg = s.querySelector('.pg');
    if (pg) pg.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + total;
    var b = doc.createElement('button');
    b.type = 'button';
    if (s.classList.contains('divider')) b.className = 'part';
    var n = doc.createElement('span');
    n.className = 'n';
    n.textContent = i + 1;
    b.appendChild(n);
    b.appendChild(doc.createTextNode(''));
    b.addEventListener('click', function () { toggleSheet(false); go(i, true); });
    toc.appendChild(b);
  });

  /* controls */
  doc.getElementById('b-prev').addEventListener('click', prev);
  doc.getElementById('b-next').addEventListener('click', next);
  doc.getElementById('b-replay').addEventListener('click', replay);
  doc.getElementById('b-lang').addEventListener('click', toggleLang);
  doc.getElementById('b-list').addEventListener('click', function () { toggleSheet(); });
  doc.getElementById('b-notes').addEventListener('click', toggleNotes);
  doc.getElementById('b-full').addEventListener('click', toggleFull);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) toggleSheet(false); });

  doc.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); t.blur(); }
      return;
    }
    var k = e.key;
    if (k === 'Escape') { toggleSheet(false); return; }
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0, true); }
    else if (k === 'End') { e.preventDefault(); go(total - 1, true); }
    else if (k === 'l' || k === 'L' || k === 'م') toggleLang();
    else if (k === 'g' || k === 'G' || k === 'ل') toggleSheet();
    else if (k === 'n' || k === 'N' || k === 'ى') toggleNotes();
    else if (k === 'f' || k === 'F' || k === 'ب') toggleFull();
    else if (k === 'r' || k === 'R' || k === 'ق') replay();
  });

  /* touch: swipe towards the reading direction to go on */
  var x0 = null;
  doc.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  doc.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) < 60) return;
    var forward = root.dir === 'rtl' ? dx > 0 : dx < 0;
    if (forward) next(); else prev();
  }, { passive: true });

  /* the control bar steps aside while presenting */
  var idle;
  function wake() {
    bar.classList.remove('idle');
    clearTimeout(idle);
    idle = setTimeout(function () { if (!bar.matches(':hover')) bar.classList.add('idle'); }, 3200);
  }
  doc.addEventListener('mousemove', wake);
  doc.addEventListener('touchstart', wake, { passive: true });
  doc.addEventListener('fullscreenchange', function () { root.classList.toggle('fs', !!doc.fullscreenElement); fit(); });

  /* the IT contact line is typed once and remembered on this computer */
  if (contact) {
    var saved = keep('sma-cyber-contact');
    if (saved && !contact.textContent.trim()) contact.textContent = saved;
    contact.addEventListener('blur', function () {
      var v = contact.textContent.replace(/\s+/g, ' ').trim();
      contact.textContent = v;
      keep('sma-cyber-contact', v);
    });
  }

  window.addEventListener('resize', fit);
  fit();
  var start = parseInt((window.location.hash || '').slice(1), 10);
  setLang(keep('sma-cyber-lang') === 'en' ? 'en' : 'ar');
  go(start >= 1 && start <= total ? start - 1 : 0, false);
  wake();
})();
