/* ==========================================================================
   Interactive galleries. Each function receives its slide element and the
   engine api, builds its exhibit, and resets itself when the slide is left.
   All content is bilingual: B(english, arabic).
   ========================================================================== */
(() => {
  'use strict';

  const { sims, api, boot } = window.SMA;
  const { $, $$, B, icon } = api;
  const on = (el, ev, fn, opts) => el.addEventListener(ev, fn, opts);
  const wait = (ms) => new Promise((r) => setTimeout(r, api.reduced() ? 0 : ms));
  const isCurrent = (slide) => slide.classList.contains('is-current');
  /** Space / Enter activate role=button spans the same way a click does. */
  const keyClick = (root, sel) => on(root, 'keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches(sel)) { e.preventDefault(); e.target.click(); }
  });

  /* ---- 1 · cover: the doorways shift with the pointer -------------------- */
  sims.cover = (slide) => {
    const enfilade = $('.enfilade', slide);
    on(document, 'pointermove', (e) => {
      if (isCurrent(slide)) enfilade.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
    });
  };

  /* ---- 3 · threat gallery ------------------------------------------------ */
  const THREATS = [
    { ic: 'fishing-hook', name: ['Phishing', 'التصيّد الاحتيالي'],
      what: ['A fake message that looks genuine, written to steal your password or make you click.', 'رسالة مزيّفة تبدو حقيقية، هدفها سرقة كلمة المرور أو دفعكم إلى النقر.'],
      via: ['Email · SMS · WhatsApp · QR codes', 'البريد · الرسائل النصية · واتساب · رموز QR'],
      tell: ['Urgency, plus a link.', 'استعجال… ومعه رابط.'] },
    { ic: 'drama', name: ['Social engineering', 'الهندسة الاجتماعية'],
      what: ['Manipulating a person instead of hacking a machine: a caller, a visitor, a “manager”.', 'خداع الإنسان بدل اختراق الآلة: متصل، أو زائر، أو «مدير».'],
      via: ['Phone · chat · in person', 'الهاتف · المحادثات · وجهاً لوجه'],
      tell: ['Someone pushing you to skip the procedure.', 'شخص يدفعكم إلى تجاوز الإجراءات.'] },
    { ic: 'bug', name: ['Malware', 'البرمجيات الخبيثة'],
      what: ['Software that spies, steals or damages, hidden inside attachments, downloads and USB sticks.', 'برامج تتجسس أو تسرق أو تُتلف، مخبّأة في المرفقات والتنزيلات وذواكر USB.'],
      via: ['Attachments · downloads · USB', 'المرفقات · التنزيلات · ذواكر USB'],
      tell: ['A file that asks you to “enable” something.', 'ملف يطلب منكم «تمكين» شيء ما.'] },
    { ic: 'file-lock', name: ['Ransomware', 'برمجيات الفدية'],
      what: ['Malware that locks every file it can reach, then demands payment to release them.', 'برمجية خبيثة تقفل كل ملف تصل إليه ثم تطلب فدية لفكّه.'],
      via: ['One infected device, then the shared drives', 'جهاز مصاب واحد، ثم المجلدات المشتركة'],
      tell: ['Files renamed overnight that will not open.', 'ملفات تغيّرت أسماؤها ولا تُفتح.'] },
    { ic: 'key-round', name: ['Password attacks', 'هجمات كلمات المرور'],
      what: ['Guessing weak passwords, or reusing ones leaked from other websites.', 'تخمين كلمات المرور الضعيفة، أو استخدام كلمات تسرّبت من مواقع أخرى.'],
      via: ['Leaked lists · automated guessing', 'قوائم مسرّبة · تخمين آلي'],
      tell: ['Sign-in alerts you did not cause.', 'تنبيهات تسجيل دخول لم تقوموا به.'] },
    { ic: 'scan-face', name: ['AI deception', 'الخداع بالذكاء الاصطناعي'],
      what: ['Cloned voices, generated faces and flawless messages, produced in seconds.', 'أصوات مستنسخة ووجوه مولَّدة ورسائل بلا أخطاء، تُنتج في ثوانٍ.'],
      via: ['Voice notes · video calls · email', 'الرسائل الصوتية · المكالمات المرئية · البريد'],
      tell: ['A familiar voice with an unusual request.', 'صوت مألوف يحمل طلباً غير مألوف.'] },
  ];

  sims.threats = (slide) => {
    const wall = $('.niches', slide);
    wall.innerHTML = THREATS.map((t, i) => `<button class="niche" role="tab" data-i="${i}" aria-selected="false"><span class="picto">${icon(t.ic)}</span><b>${B(t.name[0], t.name[1])}</b></button>`).join('');
    const select = (i) => {
      const t = THREATS[i];
      $$('.niche', wall).forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
      $('.placard-title', slide).innerHTML = B(t.name[0], t.name[1]);
      $('.placard-what', slide).innerHTML = B(t.what[0], t.what[1]);
      $('.placard-via', slide).innerHTML = B(t.via[0], t.via[1]);
      $('.placard-tell', slide).innerHTML = B(t.tell[0], t.tell[1]);
    };
    on(wall, 'click', (e) => {
      const b = e.target.closest('.niche');
      if (!b) return;
      select(+b.dataset.i);
      api.setStep(+b.dataset.i);
    });
    on(slide, 'step', (e) => select(e.detail));
    select(0);
  };

  /* ---- 4 · the loupe ----------------------------------------------------- */
  sims.loupe = (slide) => {
    const specimens = $('.specimens', slide);
    const lens = $('.lens', slide);
    const inner = $('.lens-in', slide);
    const ZOOM = 2.5, HALF = 150, RADIUS = 140;

    const sync = () => {
      const copy = specimens.cloneNode(true);
      copy.classList.remove('rise');
      copy.style.cssText = `width:${specimens.offsetWidth}px;animation:none`;
      $$('button', copy).forEach((b) => { b.tabIndex = -1; });
      inner.replaceChildren(copy);
    };
    const reveal = (state) => { specimens.classList.toggle('revealed', state); sync(); };

    on(specimens, 'pointermove', (e) => {
      const p = api.stageXY(e, specimens);
      lens.classList.add('on');
      lens.style.left = `${specimens.offsetLeft + p.x - HALF}px`;
      lens.style.top = `${specimens.offsetTop + p.y - HALF}px`;
      inner.style.transform = `translate(${RADIUS - p.x * ZOOM}px, ${RADIUS - p.y * ZOOM}px) scale(${ZOOM})`;
    });
    on(specimens, 'pointerleave', () => lens.classList.remove('on'));
    on(specimens, 'click', (e) => {
      const s = e.target.closest('.spec');
      if (!s) return;
      $$('.spec', specimens).forEach((x) => x.classList.toggle('picked', x === s));
      reveal(true);
    });
    on($('[data-do="reveal"]', slide), 'click', () => {
      const showing = specimens.classList.contains('revealed');
      if (showing) $$('.spec', specimens).forEach((x) => x.classList.remove('picked'));
      reveal(!showing);
    });
    on(slide, 'enter', sync);
    on(window, 'langchange', () => requestAnimationFrame(sync));
  };

  /* ---- 5 · inspect the email --------------------------------------------- */
  sims.inspect = (slide) => {
    const TOTAL = 6;
    const found = new Set();
    const status = $('.mail-status', slide);
    const verdict = $('.inspect-verdict', slide);
    const countBox = $('.inspect-count', slide);

    const mark = (id) => {
      if (found.has(id)) return;
      found.add(id);
      $$(`.clue[data-clue="${id}"]`, slide).forEach((c) => c.classList.add('found'));
      $(`.clues li[data-clue="${id}"]`, slide).classList.add('found');
      $('#clueCount').textContent = `${found.size}/${TOTAL}`;
      api.setStep(found.size);
      if (found.size === TOTAL) { countBox.hidden = true; verdict.hidden = false; }
    };

    on(slide, 'click', (e) => {
      const clue = e.target.closest('.clue');
      if (clue) { mark(+clue.dataset.clue); return; }
      const decoy = e.target.closest('.decoy');
      if (decoy) {
        decoy.classList.remove('shake');
        void decoy.offsetWidth;
        decoy.classList.add('shake');
        status.innerHTML = `<bdi>${B('Nothing wrong with this part. Keep looking.', 'لا مشكلة في هذا الجزء. واصلوا البحث.')}</bdi>`;
      }
      const v = e.target.closest('[data-v]');
      if (v) {
        const out = {
          report: B('Right. One report lets IT block the sender and warn everyone else who received it.', 'صحيح. بلاغ واحد يتيح لتقنية المعلومات حظر المرسل وتحذير كل من وصلته الرسالة.'),
          delete: B('Safer for you, but the colleague at the next desk still has it. Report first, then delete.', 'أكثر أماناً لكم، لكن الرسالة ما زالت لدى زميلكم. أبلغوا أولاً ثم احذفوا.'),
          click: B('This is how it starts. Never test a suspicious link, not even “just to see”.', 'هكذا يبدأ الاختراق. لا تختبروا رابطاً مريباً ولو «للتأكد فقط».'),
        };
        $('.verdict-out', slide).innerHTML = out[v.dataset.v];
      }
    });
    keyClick(slide, '.clue');

    const cta = $('.mail-cta', slide);
    const showUrl = () => { status.textContent = cta.dataset.url; };
    on(cta, 'pointerenter', showUrl);
    on(cta, 'focus', showUrl);
    on(cta, 'pointerleave', () => { status.textContent = ''; });

    // Next reveals the clues in order when the room goes quiet
    on(slide, 'step', (e) => {
      for (let id = 1; id <= TOTAL && found.size < e.detail; id += 1) mark(id);
    });
  };

  /* ---- 6 · triage: authentic or forgery ---------------------------------- */
  const qrSvg = (seed) => {
    const N = 21;
    let s = seed;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    let d = '';
    for (let y = 0; y < N; y += 1) for (let x = 0; x < N; x += 1) if (!inFinder(x, y) && rnd() > 0.52) d += `M${x} ${y}h1v1h-1z`;
    const finder = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
    return `<svg class="qr" viewBox="-1 -1 23 23" aria-hidden="true"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><path fill="#191919" fill-rule="evenodd" d="${d}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}"/></svg>`;
  };

  const TRIAGE = [
    { ok: false, ic: 'smartphone', chan: ['SMS', 'رسالة نصية'], from: ['AE-PARCEL', 'AE-PARCEL'], addr: '+971 5X XXX 0931',
      body: ['Your parcel is on hold: unpaid customs fee of AED 12.50. Pay within 24 hours or it will be returned: <span dir="ltr">parcel-ae.fee-pay.co/track</span>',
        'شحنتكم محتجزة بسبب رسوم جمركية غير مدفوعة بقيمة 12.50 درهماً. ادفعوا خلال 24 ساعة وإلا أُعيدت: <span dir="ltr">parcel-ae.fee-pay.co/track</span>'],
      why: ['A small fee, a deadline and a link: the classic delivery scam. The amount is tiny because the card details are the prize.', 'رسم بسيط ومهلة ورابط: خدعة الشحنات المعروفة. المبلغ صغير لأن الهدف هو بيانات البطاقة.'] },
    { ok: true, ic: 'mail', chan: ['Email', 'بريد إلكتروني'], from: ['Human Resources', 'الموارد البشرية'], addr: 'hr@sma.gov.ae',
      subj: ['Reminder: annual leave plans', 'تذكير: خطط الإجازات السنوية'],
      body: ['Please enter your remaining 2026 leave in the HR self-service portal by the end of the month, in the usual way. Nothing needs to be sent by email.',
        'يرجى إدخال رصيد إجازاتكم المتبقي لعام 2026 في بوابة الخدمة الذاتية للموارد البشرية قبل نهاية الشهر كالمعتاد. لا حاجة لإرسال أي شيء عبر البريد.'],
      why: ['The right domain, no link, no pressure, nothing to send back, and expected at this time of year. If in doubt, open the portal yourself.', 'النطاق صحيح، بلا رابط ولا ضغط ولا طلب بيانات، والتوقيت متوقع. وعند الشك افتحوا البوابة بأنفسكم.'] },
    { ok: false, ic: 'message-circle', chan: ['WhatsApp', 'واتساب'], from: ['~ IT Support', '~ الدعم الفني'], addr: '+971 5X XXX 4471',
      body: ['Hello, IT here. While fixing your account we sent a 6-digit code to your phone by mistake. Please send it to me now so we can finish.',
        'مرحباً، معكم الدعم الفني. أثناء إصلاح حسابكم أرسلنا رمزاً من 6 أرقام إلى هاتفكم بالخطأ. يرجى إرساله لي الآن لإكمال العمل.'],
      why: ['That code is the key to your account. Nobody genuine will ever ask you to read a code back to them.', 'هذا الرمز هو مفتاح حسابكم. لا جهة حقيقية تطلب منكم إعادة إرسال رمز تحقق.'] },
    { ok: true, ic: 'users', chan: ['Teams · internal', 'تيمز · داخلي'], from: ['A colleague, Projects team', 'زميل من فريق المشاريع'], addr: 'sma.gov.ae',
      body: ['As agreed in this morning’s meeting, the project plan is in our team’s shared folder, same place as last week.', 'كما اتفقنا في اجتماع هذا الصباح، خطة المشروع موجودة في المجلد المشترك للفريق، في المكان نفسه كالأسبوع الماضي.'],
      why: ['A known colleague, on the internal channel, about something you were expecting, with no link to click.', 'زميل معروف، عبر القناة الداخلية، في موضوع تتوقعونه، وبلا رابط للنقر.'] },
    { ok: false, ic: 'mail', chan: ['Email', 'بريد إلكتروني'], from: ['Accounts, supplier', 'الحسابات، المورّد'], addr: 'accounts@supplier-payments-desk.com',
      subj: ['Updated bank details for invoice 2291', 'تحديث بيانات الحساب البنكي للفاتورة 2291'],
      body: ['Please note that our bank account has changed. Kindly settle the attached invoice to the new account today to avoid a late fee.', 'نود إعلامكم بتغيير حسابنا البنكي. يرجى سداد الفاتورة المرفقة إلى الحساب الجديد اليوم تفادياً لرسوم التأخير.'],
      why: ['New bank details by email are the signature of invoice fraud. Call the supplier on the number you already hold before anything is paid.', 'تغيير الحساب البنكي عبر البريد هو بصمة احتيال الفواتير. اتصلوا بالمورّد على الرقم المسجّل لديكم قبل أي سداد.'] },
    { ok: false, ic: 'qr-code', chan: ['Email', 'بريد إلكتروني'], from: ['Account Security', 'أمن الحسابات'], addr: 'no-reply@account-security-alerts.net', qr: 41,
      body: ['Your two-step verification expires today. Scan this code with your phone to keep access to your account.',
        'تنتهي صلاحية التحقق بخطوتين اليوم. امسحوا هذا الرمز بهاتفكم للحفاظ على الوصول إلى حسابكم.'],
      why: ['A QR code hides the link and moves you to your personal phone, away from SMA’s protection. Do not scan codes from unexpected messages.', 'رمز QR يُخفي الرابط وينقلكم إلى هاتفكم الشخصي بعيداً عن حماية الهيئة. لا تمسحوا رموزاً من رسائل غير متوقعة.'] },
  ];

  sims.triage = (slide) => {
    const card = $('.msg', slide);
    const actions = $('.triage-actions', slide);
    const why = $('.triage-why', slide);
    const dots = $('.triage-dots', slide);
    let i = 0;
    let right = 0;
    dots.innerHTML = TRIAGE.map(() => '<i></i>').join('');
    const dot = (k) => dots.children[k];

    const show = () => {
      const m = TRIAGE[i];
      card.className = 'msg paper';
      void card.offsetWidth;
      card.classList.add('swap');
      const body = `<p>${B(m.body[0], m.body[1])}</p>`;
      card.innerHTML = `<div class="msg-top"><span class="picto">${icon(m.ic)}</span>
          <div class="msg-who"><b>${B(m.from[0], m.from[1])}</b><small dir="ltr">${m.addr}</small></div>
          <span class="caps msg-chan">${B(m.chan[0], m.chan[1])}</span></div>
        ${m.subj ? `<h3>${B(m.subj[0], m.subj[1])}</h3>` : ''}
        ${m.qr ? `<div class="msg-qr">${qrSvg(m.qr)}${body}</div>` : body}`;
      actions.hidden = false;
      why.hidden = true;
      $$('i', dots).forEach((d, k) => d.classList.toggle('now', k === i));
    };
    const finish = () => {
      actions.hidden = true;
      why.hidden = true;
      card.className = 'msg paper triage-end swap';
      card.innerHTML = `<span class="big" dir="ltr">${right}/${TRIAGE.length}</span>
        <p>${B('Two were genuine. Judgement beats suspicion: check the sender, the request and the channel.', 'رسالتان كانتا أصليتين. حسن التقدير أهم من الشك: تحققوا من المرسل والطلب والقناة.')}</p>
        <button class="btn" data-again>${icon('rotate-ccw')}${B('Play again', 'إعادة المحاولة')}</button>`;
    };
    const reset = () => { i = 0; right = 0; $$('i', dots).forEach((d) => { d.className = ''; }); show(); };

    on(actions, 'click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const m = TRIAGE[i];
      const good = (b.dataset.a === '1') === m.ok;
      if (good) right += 1;
      dot(i).className = good ? 'ok' : 'no';
      actions.hidden = true;
      why.hidden = false;
      why.className = `triage-why ${good ? 'good' : 'bad'}`;
      const label = m.ok ? B('Genuine.', 'حقيقية.') : B('Fake.', 'مزيّفة.');
      const last = i === TRIAGE.length - 1;
      why.innerHTML = `${icon(good ? 'circle-check' : 'circle-x')}<p><b>${label}</b>${B(m.why[0], m.why[1])}</p>
        <button class="btn" data-next>${last ? B('Result', 'النتيجة') : B('Next', 'التالي')}${icon('arrow-right', 'flip')}</button>`;
    });
    on(slide, 'click', (e) => {
      if (e.target.closest('[data-next]')) { i += 1; if (i >= TRIAGE.length) finish(); else show(); }
      if (e.target.closest('[data-again]')) reset();
    });
    show();
  };

  /* ---- shared: reply buttons + outcome panel ----------------------------- */
  const renderReplies = (box, options, pick) => {
    box.innerHTML = options.map((o, k) => `<button class="reply ${o.act ? 'act' : ''}" data-k="${k}" style="--i:${k}">${icon(o.act ? 'hand' : 'reply')}<span>${B(o.t[0], o.t[1])}</span></button>`).join('');
    $$('.reply', box).forEach((b) => on(b, 'click', () => pick(options[+b.dataset.k])));
  };
  const renderOutcome = (box, title, text, again) => {
    box.innerHTML = `<div class="outcome"><b>${B(title[0], title[1])}</b>${B(text[0], text[1])}<br>
      <button class="btn" data-again>${icon('rotate-ccw')}${B('Play again', 'إعادة المحاولة')}</button></div>`;
    on($('[data-again]', box), 'click', again);
  };

  /* ---- 7 · social engineering: both sides of the glass ------------------- */
  const CON = {
    start: {
      say: [
        { t: ['Good morning. This is the Director’s office. I am in a meeting with a delegation and cannot take calls.', 'صباح الخير. معكم مكتب المدير. أنا في اجتماع مع وفد ولا أستطيع الرد على الاتصالات.'], lev: ['authority'] },
        { t: ['I need your help with something urgent and confidential.', 'أحتاج مساعدتكم في أمر عاجل وسرّي.'], lev: ['urgency', 'secrecy'] },
      ],
      opts: [
        { t: ['“Of course. How can I help?”', '«بالتأكيد. كيف أساعدكم؟»'], to: 'ask' },
        { t: ['“This number is not in the staff directory. Who is this, please?”', '«هذا الرقم غير موجود في دليل الموظفين. من معي لو سمحتم؟»'], to: 'push' },
        { t: ['Stop replying. Call the Director’s office on the number in the directory.', 'التوقف عن الرد والاتصال بمكتب المدير على الرقم المسجّل في الدليل.'], to: 'win', act: true },
      ],
    },
    push: {
      say: [{ t: ['I am on my personal phone, the office line is busy with the delegation. We do not have time for this.', 'أستخدم هاتفي الشخصي فخط المكتب مشغول بالوفد. لا وقت لدينا لهذا.'], lev: ['pressure', 'urgency'] }],
      opts: [
        { t: ['“Sorry. What do you need?”', '«أعتذر. ما المطلوب؟»'], to: 'ask' },
        { t: ['Stop replying. Call the office on the number you already know.', 'التوقف عن الرد والاتصال بالمكتب على الرقم المعروف لديكم.'], to: 'win', act: true },
      ],
    },
    ask: {
      say: [
        { t: ['The supplier for tomorrow’s event must be paid today. Transfer AED 18,500 to the account I am sending. I will sign the paperwork later.', 'مورّد فعالية الغد يجب أن تُدفع مستحقاته اليوم. حوّلوا 18,500 درهم إلى الحساب الذي سأرسله، وسأوقّع الأوراق لاحقاً.'], lev: ['authority', 'urgency'] },
        { t: ['Keep this between us for now.', 'ليبقَ الأمر بيننا في الوقت الحالي.'], lev: ['secrecy'] },
      ],
      opts: [
        { t: ['“Understood. Transferring now.”', '«مفهوم. سأحوّل المبلغ الآن.»'], to: 'lose' },
        { t: ['“I have to follow the payment procedure and get approval first.”', '«عليّ اتباع إجراءات الدفع والحصول على الموافقة أولاً.»'], to: 'squeeze' },
        { t: ['Stop. Verify by phone on the known number, then report it.', 'التوقف، والتحقق هاتفياً عبر الرقم المعروف، ثم الإبلاغ.'], to: 'win', act: true },
      ],
    },
    squeeze: {
      say: [{ t: ['There is no time for procedure. The delegation arrives at four. Do you want to be the reason the event fails?', 'لا وقت للإجراءات. الوفد يصل في الرابعة. هل تريدون أن تكونوا سبب فشل الفعالية؟'], lev: ['pressure'] }],
      opts: [
        { t: ['“All right… sending it.”', '«حسناً… سأرسل المبلغ.»'], to: 'lose' },
        { t: ['Stop. Verify on the known number, then report it.', 'التوقف، والتحقق عبر الرقم المعروف، ثم الإبلاغ.'], to: 'win', act: true },
      ],
    },
  };
  const CON_END = {
    win: { cls: 'good',
      sys: ['You called the real office. They sent nothing.', 'اتصلتم بالمكتب الحقيقي، ولم يرسلوا شيئاً.'],
      title: ['Pause. Verify. Report.', 'تمهّل. تحقّق. أبلِغ.'],
      text: ['You checked on a channel you already trusted, then reported it. IT warned everyone else the same morning.', 'تحققتم عبر قناة تثقون بها أصلاً ثم أبلغتم. وحذّرت تقنية المعلومات بقية الزملاء في الصباح نفسه.'],
      out: ['Every lever needs you to stay inside the chat. The moment you step outside it and verify, the con collapses.', 'كل عنصر في الخطة يحتاج إلى بقائكم داخل المحادثة. وما إن تخرجوا منها للتحقق حتى تنهار الخدعة.'] },
    lose: { cls: 'bad',
      sys: ['AED 18,500 sent to a stranger with a profile photo.', 'تم تحويل 18,500 درهم إلى غريب يملك صورة ملف شخصي.'],
      title: ['The money is gone.', 'ضاع المبلغ.'],
      text: ['There was no delegation and no supplier. A real request survives a phone call; this one could not.', 'لم يكن هناك وفد ولا مورّد. الطلب الحقيقي يصمد أمام اتصال هاتفي، وهذا الطلب لم يكن ليصمد.'],
      out: ['Four levers, one goal: keep you moving and keep you alone. Any pause would have broken it.', 'أربعة عناصر وهدف واحد: أن تواصلوا التنفيذ وأنتم وحدكم. أي توقف كان سيُفشل الخطة.'] },
  };

  sims.con = (slide) => {
    const chat = $('.chat', slide);
    const replies = $('.replies', slide);
    const out = $('.playbook-out', slide);
    let run = 0;

    const bubble = (cls, html) => {
      const b = document.createElement('div');
      b.className = `bub ${cls}`;
      b.innerHTML = html;
      chat.append(b);
      return b;
    };
    const play = async (id) => {
      const mine = run;
      replies.innerHTML = '';
      if (CON_END[id]) {
        const end = CON_END[id];
        await wait(500);
        if (mine !== run) return;
        bubble(`sys ${end.cls}`, B(end.sys[0], end.sys[1]));
        out.innerHTML = B(end.out[0], end.out[1]);
        if (id === 'lose') $$('.levers li', slide).forEach((l) => l.classList.add('on'));
        renderOutcome(replies, end.title, end.text, start);
        return;
      }
      const node = CON[id];
      for (const line of node.say) {
        const typing = bubble('typing', '<i></i><i></i><i></i>');
        await wait(1100);
        typing.remove();
        if (mine !== run) return;
        bubble('', B(line.t[0], line.t[1]));
        line.lev.forEach((l) => $(`.levers [data-lever="${l}"]`, slide).classList.add('on'));
        await wait(450);
        if (mine !== run) return;
      }
      renderReplies(replies, node.opts, (o) => {
        if (!o.act) bubble('me', B(o.t[0], o.t[1]));
        play(o.to);
      });
    };
    function start() {
      run += 1;
      chat.innerHTML = '';
      replies.innerHTML = '';
      out.innerHTML = '';
      $$('.levers li', slide).forEach((l) => l.classList.remove('on'));
      play('start');
    }
    on(slide, 'enter', start);
    on(slide, 'leave', () => { run += 1; });
  };

  /* ---- 8 · a day at the museum ------------------------------------------- */
  const PLAN = `<svg viewBox="0 0 1010 610" aria-hidden="true">
    <rect class="room" x="5" y="5" width="615" height="355"/><rect class="room-alt" x="620" y="5" width="385" height="225"/>
    <rect class="room" x="620" y="230" width="385" height="190"/><rect class="room-alt" x="620" y="420" width="385" height="185"/>
    <rect class="room-alt" x="5" y="360" width="325" height="245"/><rect class="room" x="330" y="360" width="290" height="245"/>
    <g fill="none" stroke="#fff" stroke-width="3" opacity=".3">
      <rect x="70" y="120" width="46" height="46"/><rect x="190" y="250" width="46" height="46"/><rect x="430" y="110" width="46" height="46"/><rect x="520" y="240" width="46" height="46"/>
      <rect x="690" y="150" width="110" height="34"/><rect x="900" y="80" width="46" height="46"/>
      <rect x="680" y="300" width="70" height="40"/><rect x="900" y="300" width="70" height="40"/><rect x="900" y="365" width="70" height="34"/>
      <path d="M680 500h270M680 540h270M680 580h270"/>
      <rect x="40" y="440" width="150" height="40"/><circle cx="400" cy="520" r="26"/><circle cx="560" cy="460" r="26"/><circle cx="560" cy="560" r="20"/>
    </g>
    <path class="wall" d="M250 605H1005V5H5V605H140M620 5V96M620 164V292M620 350V476M620 536V605M5 360H116M200 360H436M512 360H620M330 360V448M330 522V605M620 230H1005M620 420H1005"/>
    <text x="312" y="52" lang="en">OPEN OFFICE</text><text x="312" y="56" lang="ar">المكاتب المفتوحة</text>
    <text x="812" y="52" lang="en">MEETING ROOMS</text><text x="812" y="56" lang="ar">قاعات الاجتماعات</text>
    <text x="812" y="270" lang="en">MANAGEMENT</text><text x="812" y="274" lang="ar">الإدارة</text>
    <text x="812" y="462" lang="en">SERVER ROOM</text><text x="812" y="466" lang="ar">غرفة الخوادم</text>
    <text x="167" y="402" lang="en">RECEPTION</text><text x="167" y="406" lang="ar">الاستقبال</text>
    <text x="475" y="402" lang="en">BREAK AREA</text><text x="475" y="406" lang="ar">الاستراحة</text>
    <text x="195" y="596" lang="en" style="font-size:13px">ENTRANCE</text><text x="195" y="597" lang="ar" style="font-size:15px">المدخل</text>
  </svg>`;

  const DAY = [
    { x: 240, y: 520, ic: 'id-card-lanyard', title: ['The technician', 'الفنّي'],
      text: ['A man in a hi-vis vest says he is here to service the cameras and asks you to open the server room. He is not on today’s visitor list.', 'رجل يرتدي سترة عاكسة يقول إنه جاء لصيانة الكاميرات ويطلب فتح غرفة الخوادم. اسمه غير مدرج في قائمة زوار اليوم.'],
      opts: [
        { t: ['Let him in. He looks the part and he is in a hurry.', 'السماح له بالدخول، فمظهره مقنع وهو مستعجل.'], why: ['A vest and a toolbox are the cheapest disguise there is.', 'السترة وحقيبة العدّة أرخص تنكّر على الإطلاق.'] },
        { ok: true, t: ['Ask him to wait, confirm with Facilities, issue a badge and escort him.', 'الطلب منه الانتظار، والتأكد من إدارة المرافق، ثم إصدار بطاقة زائر ومرافقته.'], why: ['Verify, badge, escort. Every time, however confident they seem.', 'تحقّق، بطاقة، مرافقة. في كل مرة، مهما بدا واثقاً.'] },
        { t: ['Point him to the room and get on with your work.', 'إرشاده إلى الغرفة ومتابعة العمل.'], why: ['Unescorted access to systems is how break-ins begin.', 'الوصول إلى الأنظمة دون مرافقة هو بداية الاختراق.'] },
      ] },
    { x: 330, y: 205, ic: 'usb', title: ['The lost USB stick', 'ذاكرة USB المفقودة'],
      text: ['In the corridor you find a USB stick labelled “Salaries 2026”.', 'تجدون في الممر ذاكرة USB كُتب عليها «رواتب 2026».'],
      opts: [
        { t: ['Plug it into your computer to find out whose it is.', 'توصيلها بحاسوبكم لمعرفة صاحبها.'], why: ['That label was written for you. Curiosity is what installs the malware.', 'هذه العبارة كُتبت لكم تحديداً. الفضول هو ما يثبّت البرمجية الخبيثة.'] },
        { ok: true, t: ['Hand it to IT or Security, unopened.', 'تسليمها لتقنية المعلومات أو الأمن دون فتحها.'], why: ['They can examine it safely. You have just stopped an attack with one short walk.', 'هم قادرون على فحصها بأمان. لقد أوقفتم هجوماً بمشوار قصير.'] },
        { t: ['Take it home and check it on your own laptop.', 'أخذها إلى المنزل وفحصها على حاسوبكم الشخصي.'], why: ['Now your home, your bank and your family photos are the target.', 'الآن أصبح منزلكم وحسابكم البنكي وصوركم العائلية هي الهدف.'] },
      ] },
    { x: 812, y: 345, ic: 'phone-call', title: ['The helpful caller', 'المتصل المتعاون'],
      text: ['“This is IT. We have detected a virus on your computer. Read me the code we just sent to your phone and I will remove it.”', '«معكم تقنية المعلومات. اكتشفنا فيروساً على حاسوبكم. اقرؤوا لي الرمز الذي أرسلناه إلى هاتفكم الآن وسأزيله.»'],
      opts: [
        { t: ['Read out the code. He is trying to help.', 'قراءة الرمز له، فهو يحاول المساعدة.'], why: ['That code was the last lock on your account.', 'ذلك الرمز كان آخر قفل على حسابكم.'] },
        { ok: true, t: ['Hang up and call the IT Service Desk on the number you know.', 'إنهاء المكالمة والاتصال بمكتب خدمات تقنية المعلومات على الرقم المعروف.'], why: ['Real IT never needs your code. Calling back is the test a fake cannot pass.', 'تقنية المعلومات الحقيقية لا تحتاج رمزكم. ومعاودة الاتصال اختبار لا ينجح فيه المحتال.'] },
        { t: ['Ask for his employee number first, then read the code.', 'طلب رقمه الوظيفي أولاً ثم قراءة الرمز.'], why: ['Anyone can invent a number. Verify by calling back, not by asking.', 'أي شخص يستطيع اختلاق رقم. التحقق يكون بمعاودة الاتصال لا بالسؤال.'] },
      ] },
    { x: 812, y: 130, ic: 'qr-code', title: ['The sticker', 'الملصق'],
      text: ['A QR code on a notice-board poster is peeling at the corner. There is a different QR code printed underneath it.', 'رمز QR على ملصق في لوحة الإعلانات بدأ ينفصل من زاويته، وتحته رمز آخر مختلف مطبوع.'],
      opts: [
        { t: ['Press it back down so the poster looks tidy.', 'إعادة لصقه ليبدو الملصق مرتباً.'], why: ['You have just repaired the attacker’s trap.', 'لقد أصلحتم فخّ المهاجم للتو.'] },
        { ok: true, t: ['Remove it, keep it, and report it to Security and IT.', 'نزعه والاحتفاظ به وإبلاغ الأمن وتقنية المعلومات.'], why: ['Fake QR stickers send people to sites that steal payment details, in SMA’s name.', 'ملصقات QR المزيّفة تقود الناس إلى مواقع تسرق بيانات الدفع… باسم الهيئة.'] },
        { t: ['Scan it with your phone to see where it leads.', 'مسحه بهاتفكم لمعرفة وجهته.'], why: ['Never test a suspicious link on your own device.', 'لا تختبروا رابطاً مريباً على أجهزتكم.'] },
      ] },
    { x: 475, y: 500, ic: 'wifi', title: ['The free Wi-Fi', 'الشبكة المجانية'],
      text: ['You are working from a café and must send a contract. A network called “Office_Guest_Free” needs no password.', 'تعملون من مقهى وعليكم إرسال عقد. وهناك شبكة باسم «Office_Guest_Free» لا تتطلب كلمة مرور.'],
      opts: [
        { t: ['Connect. It will only take a minute.', 'الاتصال بها، فالأمر لن يستغرق سوى دقيقة.'], why: ['Anyone can name a hotspot. On an open network, others can watch what you send.', 'أي شخص يستطيع تسمية شبكة. وفي الشبكات المفتوحة يمكن للآخرين مراقبة ما ترسلونه.'] },
        { ok: true, t: ['Use your phone’s hotspot or the approved VPN.', 'استخدام نقطة اتصال الهاتف أو الشبكة الافتراضية المعتمدة.'], why: ['Your own connection, or SMA’s protected tunnel. Nothing in between.', 'اتصالكم الخاص أو النفق المحمي للهيئة. ولا شيء بينهما.'] },
        { t: ['Email the file to your personal account and send it from there.', 'إرسال الملف إلى بريدكم الشخصي ثم إرساله من هناك.'], why: ['Work files never travel through personal email.', 'ملفات العمل لا تمرّ عبر البريد الشخصي أبداً.'] },
      ] },
  ];

  sims.day = (slide) => {
    const plan = $('.plan', slide);
    const scene = $('.scene', slide);
    plan.innerHTML = PLAN + DAY.map((d, k) => `<button class="pin" data-k="${k}" style="left:${(d.x / 1010 * 100).toFixed(2)}%;top:${(d.y / 610 * 100).toFixed(2)}%" aria-label="${d.title[0]}">${icon(d.ic)}</button>`).join('');
    const pins = $$('.pin', plan);
    const done = new Set();

    const empty = () => {
      scene.innerHTML = `<div class="scene-empty"><span class="picto">${icon('map-pin')}</span>
        <h3>${B('Five places. Five decisions.', 'خمسة أماكن. خمسة قرارات.')}</h3>
        <p>${B('Choose a pin on the plan to step into the moment.', 'اختاروا موقعاً على المخطط لتعيشوا الموقف.')}</p></div>`;
    };
    const open = (k) => {
      const d = DAY[k];
      pins.forEach((p, n) => p.classList.toggle('now', n === k));
      scene.classList.remove('swap');
      void scene.offsetWidth;
      scene.classList.add('swap');
      scene.innerHTML = `<h3>${B(d.title[0], d.title[1])}</h3><p>${B(d.text[0], d.text[1])}</p>
        <div class="opts">${d.opts.map((o, n) => `<button class="opt" data-n="${n}">${icon(o.ok ? 'circle-check' : 'circle-x')}<span>${B(o.t[0], o.t[1])}</span></button>`).join('')}</div>`;
      on($('.opts', scene), 'click', (e) => {
        const b = e.target.closest('.opt');
        if (!b) return;
        const o = d.opts[+b.dataset.n];
        const box = $('.opts', scene);
        box.classList.add('locked');
        b.classList.add(o.ok ? 'good' : 'bad');
        $$('.opt', box).forEach((x, n) => { if (d.opts[n].ok) x.classList.add('good'); });
        const w = document.createElement('p');
        w.className = 'why';
        w.innerHTML = `<b>${o.ok ? B('Exactly.', 'بالضبط.') : B('Not this one.', 'ليس هذا الخيار.')}</b>${B(o.why[0], o.why[1])}`;
        scene.append(w);
        done.add(k);
        pins[k].classList.add('done');
      });
    };
    pins.forEach((p) => on(p, 'click', () => open(+p.dataset.k)));
    empty();
  };

  /* ---- 9 · ransomware: one click, lights out ----------------------------- */
  const FILES = ['Budget_2026.xlsx', 'Contract_0412.pdf', 'Annual_Plan.pptx', 'Meeting_Minutes_117.docx',
    'Statistics_Q3.xlsx', 'Supplier_Invoices.pdf', 'Office_Floorplan.dwg', 'Event_Photos.zip',
    'Staff_Rota.xlsx', 'Policy_Draft.docx', 'HR_Records.pdf', 'Report_Draft_AR-EN.docx'];
  const FILE_ICON = { xlsx: 'file-spreadsheet', pdf: 'file-text', docx: 'file-text', pptx: 'presentation', dwg: 'file-image', zip: 'archive' };
  const STAGES = [
    { n: ['Email arrives', 'وصول الرسالة'], save: true, locked: 0,
      tip: ['<b>You can stop it here.</b> An invoice you were not expecting: check the sender and report it.', '<b>يمكن إيقافه هنا.</b> فاتورة لم تكونوا تتوقعونها: تحققوا من المرسل وأبلغوا.'] },
    { n: ['Attachment opened', 'فتح المرفق'], save: true, locked: 0,
      tip: ['<b>You can stop it here.</b> Do not open what you did not expect. Close it and report.', '<b>يمكن إيقافه هنا.</b> لا تفتحوا ما لم تتوقعوه. أغلقوه وأبلغوا.'] },
    { n: ['Content enabled', 'تمكين المحتوى'], save: true, locked: 1,
      tip: ['<b>The last chance.</b> A document that asks you to enable something is asking you to run its code.', '<b>الفرصة الأخيرة.</b> المستند الذي يطلب «التمكين» يطلب في الحقيقة تشغيل شيفرته.'] },
    { n: ['It spreads', 'الانتشار'], locked: 6,
      tip: ['Now it is a race. <b>Disconnect and call IT:</b> every minute saves folders.', 'الآن بدأ السباق. <b>افصلوا الاتصال واتصلوا بتقنية المعلومات:</b> كل دقيقة تنقذ مجلدات.'] },
    { n: ['Files locked', 'قفل الملفات'], locked: 12,
      tip: ['Backups and updates decide what is lost. <b>Report through official channels. Paying guarantees nothing.</b>', 'النسخ الاحتياطية والتحديثات تحدد حجم الخسارة. <b>أبلغوا عبر القنوات الرسمية، فالدفع لا يضمن شيئاً.</b>'] },
  ];

  sims.ransom = (slide) => {
    const list = $('.files', slide);
    const note = $('.ransom-note', slide);
    const rewind = $('.rewind', slide);
    const msg = $('.ransom-msg', slide);
    const choice = $('.ransom-choice', slide);
    const countEl = $('.drive-count', slide);
    const tip = $('.stage-tip', slide);
    const stages = $('.stages', slide);
    let run = 0;
    let ticker = null;

    const order = [3, 0, 7, 10, 1, 5, 8, 2, 11, 4, 9, 6];
    const scramble = (len) => Array.from({ length: len }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('');
    const draw = () => {
      list.innerHTML = FILES.map((f, k) => `<li class="file" data-k="${k}">${icon(FILE_ICON[f.split('.').pop()])}<span>${f}</span></li>`).join('');
    };
    const setLocked = (n) => {
      $$('.file', list).forEach((el) => {
        const k = +el.dataset.k;
        const lock = order.indexOf(k) < n;
        if (lock === el.classList.contains('locked')) return;
        el.classList.toggle('locked', lock);
        $('use', el).setAttribute('href', `#i-${lock ? 'lock' : FILE_ICON[FILES[k].split('.').pop()]}`);
        $('span', el).textContent = lock ? `${scramble(10)}.locked` : FILES[k];
      });
      countEl.textContent = `${12 - n} / 12`;
    };
    const wall = (name) => { slide.dataset.wall = name; api.setWall(name); };
    const stopClock = () => { clearInterval(ticker); ticker = null; };
    const startClock = () => {
      let left = 72 * 3600 - 1;
      const paint = () => {
        const h = String(Math.floor(left / 3600)).padStart(2, '0');
        const m = String(Math.floor(left % 3600 / 60)).padStart(2, '0');
        const s = String(left % 60).padStart(2, '0');
        $$('.ransom-clock', slide).forEach((c) => { c.textContent = `${h}:${m}:${s}`; });
      };
      paint();
      stopClock();
      ticker = setInterval(() => { left -= 1; paint(); }, 1000);
    };

    const reset = () => {
      run += 1;
      stopClock();
      wall('charcoal');
      draw();
      setLocked(0);
      note.hidden = true;
      rewind.hidden = true;
      choice.hidden = false;
      msg.innerHTML = '';
    };
    const attack = async () => {
      const mine = run;
      choice.hidden = true;
      msg.innerHTML = B('The macro is running. Nothing on screen has changed, yet.', 'الماكرو يعمل الآن. لم يتغيّر شيء على الشاشة… بعد.');
      await wait(1300);
      for (let n = 1; n <= 12; n += 1) {
        if (mine !== run) return;
        setLocked(n);
        if (n === 5) wall('red');
        await wait(n < 4 ? 420 : 170);
      }
      if (mine !== run) return;
      msg.innerHTML = B('Twelve files in under ten seconds. On a real network: every drive you can reach.', 'اثنا عشر ملفاً في أقل من عشر ثوانٍ. وفي الشبكة الحقيقية: كل مجلد تصلون إليه.');
      await wait(700);
      if (mine !== run) return;
      note.hidden = false;
      startClock();
    };
    const showStage = (k) => {
      const st = STAGES[k];
      $$('button', stages).forEach((b, n) => b.classList.toggle('now', n === k));
      setLocked(st.locked);
      wall(k >= 3 ? 'red' : 'charcoal');
      tip.innerHTML = B(st.tip[0], st.tip[1]);
    };

    stages.innerHTML = STAGES.map((st, k) => `<li><button class="${st.save ? 'save' : ''}" data-k="${k}"><i>${k + 1}</i><span>${B(st.n[0], st.n[1])}</span></button></li>`).join('');
    on(stages, 'click', (e) => { const b = e.target.closest('button'); if (b) showStage(+b.dataset.k); });

    on(slide, 'click', (e) => {
      const b = e.target.closest('[data-do]');
      if (!b) return;
      const what = b.dataset.do;
      if (what === 'enable' || what === 'anyway') attack();
      if (what === 'refuse') {
        choice.hidden = true;
        msg.innerHTML = `${B('Stopped at step two. Nothing ran, nothing was lost. Reporting it lets IT block the sender for everyone.', 'توقف الهجوم عند الخطوة الثانية. لم يعمل شيء ولم يُفقد شيء. والإبلاغ يتيح لتقنية المعلومات حظر المرسل عن الجميع.')}
          <br><button class="btn btn-ghost" data-do="anyway" style="margin-top:14px">${B('Show what would have happened', 'اعرضوا ما كان سيحدث')}</button>`;
      }
      if (what === 'rewind') {
        stopClock();
        note.hidden = true;
        rewind.hidden = false;
        msg.innerHTML = B('Rewind. Click each step: three of the five could be stopped by one person.', 'عودوا بالمشهد إلى الوراء. انقروا على كل خطوة: ثلاث من الخمس كان يمكن لشخص واحد إيقافها.');
        showStage(4);
      }
    });
    on(slide, 'leave', reset);
    reset();
  };

  /* ---- 10 · password lab ------------------------------------------------- */
  const COMMON = ['password', 'sharjah', 'museum', 'museums', 'welcome', 'admin', 'qwerty', 'letmein', 'dubai', 'emirates', 'login', 'master',
    'hello', 'iloveyou', 'summer', 'winter', 'monday', 'guest', 'changeme', 'secret', 'abc', 'uae', 'sma', 'user', 'test'];
  const SPANS = [
    [1, ['Instantly', 'فوراً'], 0], [60, ['Seconds', 'ثوانٍ'], 1], [3600, ['Minutes', 'دقائق'], 1], [86400, ['Hours', 'ساعات'], 2],
    [2592000, ['Days', 'أيام'], 2], [31536000, ['Months', 'أشهر'], 3], [3153600000, ['Years', 'سنوات'], 4], [Infinity, ['Centuries', 'قرون'], 5],
  ];

  function crackTime(pw) {
    const notes = [];
    const lower = pw.toLowerCase();
    // every swap is one character for one character, so positions line up with `lower`
    const plain = lower.replace(/@/g, 'a').replace(/0/g, 'o').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/[$5]/g, 's').replace(/7/g, 't');
    const leet = COMMON.find((w) => w.length >= 4 && plain.includes(w) && !lower.includes(w));
    const cut = leet ? plain.indexOf(leet) : -1;
    const src = leet ? `${lower.slice(0, cut)} ${lower.slice(cut + leet.length)}` : lower;
    const tokens = src.match(/[a-z\u0600-\u06FF]+|\d+|[^a-z\u0600-\u06FF\d\s]+/g) || [];
    const words = tokens.filter((t) => /^[a-z\u0600-\u06FF]{3,}$/.test(t));
    let guesses;

    if (!leet && !words.some((w) => w.length >= 4 || COMMON.includes(w))) {
      let pool = 0;
      if (/[a-z]/.test(pw)) pool += 26;
      if (/[A-Z]/.test(pw)) pool += 26;
      if (/\d/.test(pw)) pool += 10;
      if (/[\u0600-\u06FF]/.test(pw)) pool += 36;
      if (/[^A-Za-z0-9\u0600-\u06FF]/.test(pw)) pool += 33;
      guesses = Math.pow(pool || 1, pw.length) / 2;
    } else {
      guesses = 1;
      tokens.forEach((t) => {
        if (/^\d+$/.test(t)) {
          if (/^(19|20)\d\d$/.test(t)) { guesses *= 100; notes.push(B('A year is the first thing a guesser adds.', 'السنة أول ما يضيفه برنامج التخمين.')); }
          else if ('01234567890 09876543210'.includes(t) || /^(\d)\1+$/.test(t)) { guesses *= 10; notes.push(B('Number runs such as 123 add nothing.', 'تسلسل الأرقام مثل 123 لا يضيف شيئاً.')); }
          else guesses *= Math.pow(10, t.length);
        } else if (/^[a-z\u0600-\u06FF]+$/.test(t)) {
          const hit = COMMON.find((w) => t.includes(w));
          if (hit) { guesses *= 1000; notes.push(B(`Contains a word every guesser tries first: “${hit}”.`, `تتضمن كلمة يجرّبها أي برنامج تخمين أولاً: «${hit}».`)); }
          else guesses *= t.length >= 3 ? 1e5 : Math.pow(26, t.length);
        } else guesses *= Math.pow(33, t.length);
      });
      if (/[A-Z]/.test(pw)) guesses *= 2;
      if (leet) { guesses *= 10000; notes.push(B(`“${leet}” with symbols swapped in is still “${leet}”.`, `«${leet}» بعد استبدال حروفها برموز تبقى «${leet}».`)); }
      if (words.length >= 4 && !notes.length) notes.push(B('Four or more unrelated words: this is a passphrase.', 'أربع كلمات غير مترابطة أو أكثر: هذه عبارة مرور حقيقية.'));
      guesses /= 2;
    }
    if (pw.length < 12) notes.unshift(B(`Only ${pw.length} characters. Aim for 14 or more.`, `${pw.length} خانات فقط. استهدفوا 14 أو أكثر.`));
    const seconds = guesses / 1e10;
    const span = SPANS.find((s) => seconds < s[0]);
    if (span[2] >= 4 && notes.length === 0) notes.push(B('Long and hard to predict. Keep it unique to one account.', 'طويلة ويصعب توقّعها. اجعلوها خاصة بحساب واحد فقط.'));
    if (span[2] <= 2 && notes.length === 0) notes.push(B('Built on one predictable word or pattern.', 'مبنية على كلمة أو نمط واحد يسهل توقّعه.'));
    return { label: span[1], gates: span[2], notes: [...new Set(notes)].slice(0, 3) };
  }

  sims.pass = (slide) => {
    const input = $('#pw');
    const gates = $('.gates', slide);
    const time = $('#pwTime');
    const findings = $('.pass-findings', slide);
    gates.innerHTML = Array.from({ length: 5 }, () => api.archSvg(58, 88)).join('');
    $('.pass-presets', slide).innerHTML = ['Sharjah2026', 'P@ssw0rd!', 'Museum@123', 'falcon-coffee-lantern-tide']
      .map((p) => `<button class="chip" data-pw="${p}">${p}</button>`).join('');

    const update = () => {
      const pw = input.value;
      if (!pw) {
        time.textContent = '—';
        findings.innerHTML = '';
        $$('svg', gates).forEach((g) => g.classList.remove('lit'));
        return;
      }
      const r = crackTime(pw);
      time.innerHTML = B(r.label[0], r.label[1]);
      const colour = r.gates <= 1 ? '#A32A2A' : r.gates <= 3 ? '#9A5F33' : '#2E6B45';
      gates.style.setProperty('--gate', colour);
      $$('svg', gates).forEach((g, k) => g.classList.toggle('lit', k < Math.max(r.gates, 1)));
      findings.innerHTML = r.notes.map((n) => `<li>${icon(r.gates >= 4 ? 'circle-check' : 'circle-alert')}<span>${n}</span></li>`).join('');
    };
    on(input, 'input', update);
    on(slide, 'click', (e) => {
      const chip = e.target.closest('[data-pw]');
      if (chip) { input.value = chip.dataset.pw; update(); }
    });
    on(slide, 'leave', () => { input.value = ''; update(); });
  };

  /* ---- 11 · the second lock (MFA fatigue) -------------------------------- */
  sims.mfa = (slide) => {
    const pushes = $('.pushes', slide);
    const replies = $('.replies', slide);
    const out = $('.playbook-out', slide);
    const factor = $('[data-mfa]', slide);
    const stateEl = $('.mfa-state', slide);
    const clock = $('.lock-time', slide);
    let run = 0;

    const push = (kind, title, text) => {
      $$('.push', pushes).forEach((p) => p.classList.add('old'));
      const p = document.createElement('div');
      p.className = `push ${kind === 'chat' ? 'chat-push' : ''}`;
      p.innerHTML = `<span class="app">${icon(kind === 'chat' ? 'message-circle' : 'shield-check')}</span><div><b>${B(title[0], title[1])}</b><span>${B(text[0], text[1])}</span></div>`;
      pushes.append(p);
      while (pushes.children.length > 3) pushes.firstChild.remove();
    };
    const signIn = (n) => push('auth', ['Approve sign-in?', 'الموافقة على تسجيل الدخول؟'],
      [`SMA account · new device · location unknown${n > 1 ? ` · request ${n}` : ''}`, `حساب الهيئة · جهاز جديد · موقع غير معروف${n > 1 ? ` · الطلب ${n}` : ''}`]);
    const setFactor = (cls, ic, text) => {
      factor.className = cls;
      $('use', factor).setAttribute('href', `#i-${ic}`);
      stateEl.innerHTML = B(text[0], text[1]);
    };
    const end = (kind) => {
      const E = {
        lose: { f: ['ok', 'check', ['Approved by you. They are in: mailbox, shared drives, HR portal.', 'وافقتم أنتم على الطلب. أصبحوا في الداخل: البريد والمجلدات المشتركة وبوابة الموارد البشرية.']],
          title: ['Access granted.', 'تم منح الوصول.'],
          text: ['MFA only protects us if we refuse requests we did not start. Report it immediately: speed limits the damage.', 'المصادقة متعددة العوامل لا تحمينا إلا إذا رفضنا الطلبات التي لم نبدأها. أبلغوا فوراً، فالسرعة تحدّ من الضرر.'] },
        half: { f: ['wait', 'hourglass', ['Blocked for tonight. They still hold the password and will try again.', 'تم الصدّ الليلة. لكنهم ما زالوا يملكون كلمة المرور وسيحاولون مجدداً.']],
          title: ['Blocked. Not finished.', 'تم الصدّ… ولم ينتهِ الأمر.'],
          text: ['A stranger still has your password. Report it and change it, or tomorrow’s prompts will arrive when you are tired.', 'ما زالت كلمة مروركم بيد غريب. أبلغوا وغيّروها، وإلا وصلت طلبات الغد وأنتم متعبون.'] },
        win: { f: ['blocked', 'lock', ['Denied and reported. The password was changed. Locked out for good.', 'تم الرفض والإبلاغ وتغيير كلمة المرور. أُغلق الباب نهائياً.']],
          title: ['Pause. Verify. Report.', 'تمهّل. تحقّق. أبلِغ.'],
          text: ['A request you did not start is an attack in progress. You treated it as one.', 'كل طلب لم تبدؤوه هو هجوم جارٍ، وهكذا تعاملتم معه.'] },
      }[kind];
      setFactor(...E.f);
      out.innerHTML = B('The same rule covers UAE PASS requests and one-time codes: if you did not start it, reject it and tell someone.', 'القاعدة نفسها تنطبق على طلبات الهوية الرقمية UAE PASS ورموز التحقق: إن لم تبدؤوا الطلب فارفضوه وأبلغوا.');
      renderOutcome(replies, E.title, E.text, start);
    };
    const round = async (n) => {
      const mine = run;
      replies.innerHTML = '';
      await wait(n === 1 ? 900 : 1200);
      if (mine !== run) return;
      clock.textContent = `03:1${n + 1}`;
      if (n === 3) {
        push('chat', ['IT Support', 'الدعم الفني'], ['We are fixing a sync error on your account. Please approve the next request.', 'نعالج خطأ مزامنة في حسابكم. يرجى الموافقة على الطلب القادم.']);
        await wait(1400);
        if (mine !== run) return;
      }
      signIn(n);
      const approve = { t: ['Approve, so that it stops.', 'الموافقة كي يتوقف الإزعاج.'], go: () => end('lose') };
      const options = n < 3
        ? [approve, { t: ['Deny.', 'الرفض.'], go: () => round(n + 1) }]
        : [approve,
          { t: ['Deny, and go back to sleep.', 'الرفض ثم العودة إلى النوم.'], go: () => end('half') },
          { t: ['Deny, report it, and change the password.', 'الرفض، ثم الإبلاغ وتغيير كلمة المرور.'], go: () => end('win'), act: true }];
      renderReplies(replies, options, (o) => o.go());
    };
    function start() {
      run += 1;
      pushes.innerHTML = '';
      out.innerHTML = '';
      clock.textContent = '03:12';
      setFactor('wait', 'hourglass', ['Waiting for you to approve…', 'بانتظار موافقتكم…']);
      round(1);
    }
    on(slide, 'enter', start);
    on(slide, 'leave', () => { run += 1; });
  };

  /* ---- 12 · the perfect copy (deepfake call) ----------------------------- */
  sims.fake = (slide) => {
    const call = $('.call', slide);
    const caption = $('.call-caption', slide);
    const replies = $('.replies', slide);
    const stamp = $('.call-stamp', slide);
    const tells = $('.fake-tells', slide);
    const clock = $('.call-clock', slide);
    let run = 0;
    let ticker = null;
    $('.call-wave', slide).innerHTML = Array.from({ length: 16 }, (_, k) => `<i style="animation-duration:${(0.5 + (k * 37 % 9) / 12).toFixed(2)}s;animation-delay:-${(k * 53 % 10) / 10}s"></i>`).join('');

    const LINES = [
      ['“Hi, I am between flights so I will be quick. We are closing a contract and the deposit must go out within thirty minutes.”', '«مرحباً، أنا بين رحلتين فسأختصر. نحن بصدد إبرام عقد ويجب تحويل الدفعة المقدّمة خلال ثلاثين دقيقة.»'],
      ['“I have emailed you the account details. Please process it now, and keep it quiet until the announcement.”', '«أرسلت لكم بيانات الحساب بالبريد. نفّذوا التحويل الآن، وأبقوا الأمر طيّ الكتمان حتى الإعلان.»'],
    ];
    const OPTIONS = [
      { t: ['Process it. The face, the voice, even the office behind them are right.', 'تنفيذ التحويل، فالوجه والصوت وحتى المكتب في الخلفية كلها صحيحة.'], kind: 'bad',
        title: ['Everything you trusted was generated.', 'كل ما وثقتم به كان مُولَّداً.'],
        text: ['Face, voice and background can all be produced from public videos. Seeing is no longer proof.', 'الوجه والصوت والخلفية يمكن توليدها من مقاطع منشورة. الرؤية لم تعد دليلاً.'] },
      { t: ['Say “I will call you straight back on your office number”, and do it.', 'القول: «سأعاود الاتصال بكم فوراً على رقم مكتبكم»، ثم تنفيذ ذلك.'], kind: 'good', act: true,
        title: ['Pause. Verify. Report.', 'تمهّل. تحقّق. أبلِغ.'],
        text: ['A real colleague will understand. A fake one pushes back, and that is your answer.', 'الزميل الحقيقي سيتفهّم. أما المحتال فسيعترض، وذلك هو الجواب.'] },
      { t: ['Ask them to confirm by email first.', 'الطلب منه تأكيد الأمر بالبريد أولاً.'], kind: 'bad',
        title: ['An email proves nothing.', 'البريد لا يثبت شيئاً.'],
        text: ['The attacker already sent you one. Verify on a second channel that you chose, not one they offer.', 'المهاجم أرسل لكم بريداً بالفعل. تحققوا عبر قناة ثانية تختارونها أنتم لا قناة يقترحها هو.'] },
    ];

    const say = async (line, mine) => {
      const words = { en: line[0].split(' '), ar: line[1].split(' ') };
      const count = Math.max(words.en.length, words.ar.length);
      for (let k = 1; k <= count; k += 1) {
        if (mine !== run) return;
        caption.innerHTML = B(words.en.slice(0, k).join(' '), words.ar.slice(0, k).join(' '));
        await wait(95);
      }
    };
    function start() {
      run += 1;
      const mine = run;
      call.classList.remove('exposed');
      stamp.hidden = true;
      tells.hidden = true;
      replies.innerHTML = '';
      caption.innerHTML = '';
      clearInterval(ticker);
      let sec = 0;
      clock.textContent = '00:00';
      ticker = setInterval(() => { sec += 1; clock.textContent = `00:${String(sec % 60).padStart(2, '0')}`; }, 1000);
      (async () => {
        await wait(700);
        await say(LINES[0], mine);
        await wait(1300);
        await say(LINES[1], mine);
        if (mine !== run) return;
        renderReplies(replies, OPTIONS, (o) => {
          call.classList.add('exposed');
          stamp.hidden = false;
          tells.hidden = false;
          renderOutcome(replies, o.title, o.text, start);
        });
      })();
    }
    on(slide, 'enter', start);
    on(slide, 'leave', () => { run += 1; clearInterval(ticker); });
  };

  /* ---- 15 · recognise and report ----------------------------------------- */
  const SIGNALS = [
    ['A sign-in prompt I did not request', 'طلب تسجيل دخول لم أقم به'],
    ['My password stopped working', 'كلمة مروري توقفت عن العمل'],
    ['An email from a colleague that does not sound like them', 'بريد من زميل لا يشبه أسلوبه'],
    ['Files renamed, or that will not open', 'ملفات تغيّرت أسماؤها أو لا تُفتح'],
    ['The cursor moved by itself', 'المؤشر يتحرك من تلقاء نفسه'],
    ['A website asked me to install an “update”', 'موقع طلب مني تثبيت «تحديث»'],
    ['A stranger in a staff-only area', 'شخص غريب في منطقة مخصصة للموظفين'],
    ['I clicked a link and nothing happened', 'نقرت على رابط ولم يحدث شيء'],
  ];

  sims.report = (slide) => {
    const box = $('.signals', slide);
    const chips = $('.signal-chips', slide);
    const out = $('.signal-out', slide);
    chips.innerHTML = SIGNALS.map((s) => `<button class="signal" aria-pressed="false">${icon('flag')}<span>${B(s[0], s[1])}</span></button>`).join('');
    on(chips, 'click', (e) => {
      const b = e.target.closest('.signal');
      if (b) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    });
    on($('[data-do="check"]', slide), 'click', () => {
      const picked = $$('.signal[aria-pressed="true"]', chips).length;
      box.classList.add('checked');
      out.innerHTML = picked === SIGNALS.length
        ? B('All eight. Exactly right.', 'الثماني كلها. إجابة صحيحة تماماً.')
        : B(`You chose ${picked}. The answer is all eight: if it feels wrong, it is worth a two-minute call.`, `اخترتم ${picked}. والجواب: الثماني كلها. ما دام الأمر مريباً فهو يستحق اتصالاً من دقيقتين.`);
    });
    on(slide, 'leave', () => {
      box.classList.remove('checked');
      out.innerHTML = '';
      $$('.signal', chips).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    });

    // the IT Service Desk line is typed once by the presenter and remembered on this computer
    const contact = $('#contact');
    contact.textContent = api.store.get('contact') || '';
    on(contact, 'input', () => api.store.set('contact', contact.textContent.trim()));
    on(contact, 'blur', () => { if (!contact.textContent.trim()) contact.textContent = ''; });
  };

  /* ---- 16 · quiz --------------------------------------------------------- */
  const QUIZ = [
    { q: ['An email from “IT” says your mailbox closes in two hours unless you confirm your password. What is your first move?', 'رسالة من «تقنية المعلومات» تقول إن بريدكم سيُغلق خلال ساعتين ما لم تؤكدوا كلمة المرور. ما أول تصرّف؟'],
      a: [['Confirm quickly, before the deadline', 'التأكيد سريعاً قبل انتهاء المهلة'], ['Check the sender’s real address and report it', 'التحقق من عنوان المرسل الحقيقي والإبلاغ'], ['Forward it to colleagues and ask', 'إعادة توجيهها للزملاء للسؤال'], ['Reply and ask whether it is genuine', 'الرد عليها والسؤال إن كانت حقيقية']], ok: 1,
      why: ['Urgency plus a password request is the signature of phishing. Replying or forwarding only spreads it.', 'الاستعجال مع طلب كلمة المرور بصمة التصيّد. والرد أو إعادة التوجيه ينشرها فقط.'] },
    { q: ['At 3 am your phone asks you to approve a sign-in. You are not signing in.', 'في الثالثة فجراً يطلب هاتفكم الموافقة على تسجيل دخول، وأنتم لا تسجّلون الدخول.'],
      a: [['Approve, so the alerts stop', 'الموافقة كي تتوقف التنبيهات'], ['Ignore it', 'تجاهل الطلب'], ['Deny, report it and change the password', 'الرفض ثم الإبلاغ وتغيير كلمة المرور']], ok: 2,
      why: ['Someone already has the password. Denying stops tonight’s attempt; reporting and changing it stops the next one.', 'أحدهم يملك كلمة المرور بالفعل. الرفض يوقف محاولة الليلة، والإبلاغ والتغيير يوقفان المحاولة التالية.'] },
    { q: ['A “manager” on WhatsApp asks for an urgent, confidential payment.', '«مدير» على واتساب يطلب دفعة عاجلة وسرّية.'],
      a: [['Pay, then inform Finance', 'الدفع ثم إبلاغ المالية'], ['Call them on the number in the staff directory', 'الاتصال به على الرقم المسجّل في دليل الموظفين'], ['Ask for a voice note as proof', 'طلب رسالة صوتية كدليل']], ok: 1,
      why: ['Verify on a channel you already trust. A voice note can be cloned; the directory number cannot be redirected.', 'تحققوا عبر قناة تثقون بها أصلاً. الرسالة الصوتية قابلة للاستنساخ، أما رقم الدليل فلا يمكن تحويله.'] },
    { q: ['A document says: “Click Enable Content to view this invoice.”', 'مستند يقول: «انقروا تمكين المحتوى لعرض هذه الفاتورة».'],
      a: [['Enable it. It is only an invoice', 'التمكين، فهي مجرد فاتورة'], ['Close it and report it', 'إغلاقه والإبلاغ عنه'], ['Open it on a colleague’s computer instead', 'فتحه على حاسوب زميل']], ok: 1,
      why: ['Enabling content runs the document’s hidden code. That single click is how most ransomware begins.', 'تمكين المحتوى يشغّل الشيفرة المخفية في المستند. وبهذه النقرة تبدأ معظم هجمات الفدية.'] },
    { q: ['A director on a video call asks for an immediate transfer. The face and voice match.', 'مدير في مكالمة مرئية يطلب تحويلاً فورياً. الوجه والصوت مطابقان.'],
      a: [['Process it. You saw them yourself', 'تنفيذ التحويل، فقد رأيتموه بأنفسكم'], ['Hang up and call back on a known number', 'إنهاء المكالمة ومعاودة الاتصال على رقم معروف'], ['Ask them to email the request', 'الطلب منه إرسال الطلب بالبريد']], ok: 1,
      why: ['Faces and voices can be generated live. A call back that you start is the one thing a deepfake cannot answer.', 'الوجوه والأصوات تُولَّد لحظياً. ومعاودة الاتصال التي تبدؤونها أنتم هي ما لا يستطيع التزييف الرد عليه.'] },
    { q: ['You clicked a suspicious link. Nothing seemed to happen.', 'نقرتم على رابط مريب، ولم يبدُ أن شيئاً حدث.'],
      a: [['Say nothing. No harm done', 'عدم إخبار أحد، فلا ضرر'], ['Restart the computer and carry on', 'إعادة تشغيل الحاسوب ومتابعة العمل'], ['Report it now', 'الإبلاغ الآن']], ok: 2,
      why: ['Malware is built to look like nothing happened. An early report is never a mistake, and nobody is blamed for it.', 'البرمجيات الخبيثة مصمَّمة لتبدو كأن شيئاً لم يحدث. والبلاغ المبكر ليس خطأ أبداً، ولا يُلام عليه أحد.'] },
  ];

  sims.quiz = (slide) => {
    const body = $('.quiz-body', slide);
    const meter = $('.quiz-meter', slide);
    let i = 0;
    let score = 0;
    meter.innerHTML = QUIZ.map(() => api.archSvg(40, 60)).join('');
    const pips = $$('svg', meter);

    const ask = () => {
      const q = QUIZ[i];
      pips.forEach((p, k) => p.classList.toggle('now', k === i));
      body.innerHTML = `<h3 class="quiz-q">${B(q.q[0], q.q[1])}</h3>
        <div class="opts quiz-opts">${q.a.map((a, k) => `<button class="opt" data-k="${k}" style="--i:${k}">${icon(k === q.ok ? 'circle-check' : 'circle-x')}<span>${B(a[0], a[1])}</span></button>`).join('')}</div>`;
    };
    const finish = () => {
      pips.forEach((p) => p.classList.remove('now'));
      const rank = score === QUIZ.length ? [['Excellent', 'ممتاز'], ['A perfect round. SMA is in safe hands.', 'جولة كاملة بلا خطأ. الهيئة في أيدٍ أمينة.']]
        : score >= 4 ? [['Well done', 'أحسنتم'], ['Strong instincts. Revisit the topics where you hesitated.', 'حدس قوي. راجعوا المواضيع التي تردّدتم فيها.']]
          : [['A good start', 'بداية جيدة'], ['Go through the slides once more and try again.', 'راجعوا الشرائح مرة أخرى وأعيدوا المحاولة.']];
      body.innerHTML = `<div class="quiz-end"><span class="quiz-score" dir="ltr">${score}/${QUIZ.length}</span>
        <div><h3>${B(rank[0][0], rank[0][1])}</h3><p>${B(rank[1][0], rank[1][1])}</p>
        <div class="row"><button class="btn btn-hi" data-act="next">${B('Take the pledge', 'أداء التعهّد')}${icon('arrow-right', 'flip')}</button>
        <button class="btn btn-ghost" data-again>${icon('rotate-ccw')}${B('Try again', 'إعادة المحاولة')}</button></div></div></div>`;
    };
    const reset = () => { i = 0; score = 0; pips.forEach((p) => { p.setAttribute('class', ''); }); ask(); };

    on(body, 'click', (e) => {
      if (e.target.closest('[data-again]')) { reset(); return; }
      if (e.target.closest('[data-next]')) { i += 1; if (i >= QUIZ.length) finish(); else ask(); return; }
      const b = e.target.closest('.opt');
      const box = $('.quiz-opts', body);
      if (!b || !box || box.classList.contains('locked')) return;
      const q = QUIZ[i];
      const good = +b.dataset.k === q.ok;
      if (good) score += 1;
      box.classList.add('locked');
      b.classList.add(good ? 'good' : 'bad');
      $$('.opt', box)[q.ok].classList.add('good');
      pips[i].classList.remove('now');
      pips[i].classList.add(good ? 'ok' : 'no');
      const why = document.createElement('div');
      why.className = 'quiz-why';
      why.innerHTML = `<span>${B(q.why[0], q.why[1])}</span><button class="btn" data-next>${i === QUIZ.length - 1 ? B('Result', 'النتيجة') : B('Next', 'التالي')}${icon('arrow-right', 'flip')}</button>`;
      body.append(why);
    });
    reset();
  };

  /* ---- 17 · the pledge: press and hold ----------------------------------- */
  sims.pledge = (slide) => {
    const btn = $('.hold', slide);
    const arch = $('.pledge-arch', slide);
    const done = $('.pledge-done', slide);
    const HOLD_MS = 1900;
    let p = 0;
    let holding = false;
    let signed = false;
    let last = 0;
    let raf = null;

    const paint = () => {
      btn.style.setProperty('--p', p.toFixed(3));
      arch.style.setProperty('--p', p.toFixed(3));
    };
    const frame = (now) => {
      const dt = now - last;
      last = now;
      p = Math.max(0, Math.min(1, p + (holding ? dt / HOLD_MS : -dt / 500)));
      paint();
      if (p >= 1 && !signed) {
        signed = true;
        holding = false;
        arch.classList.add('signed');
        btn.hidden = true;
        done.hidden = false;
        const fmt = (loc) => new Date().toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
        $('.pledge-date', slide).innerHTML = B(fmt('en-GB'), fmt('ar-AE-u-nu-latn'));
        return;
      }
      raf = (holding || p > 0) && !signed ? requestAnimationFrame(frame) : null;
    };
    const press = () => { if (signed) return; holding = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); };
    const release = () => { holding = false; };

    on(btn, 'pointerdown', (e) => { btn.setPointerCapture(e.pointerId); press(); });
    on(btn, 'pointerup', release);
    on(btn, 'pointercancel', release);
    on(btn, 'keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(); });
    on(btn, 'keyup', release);
    on(btn, 'contextmenu', (e) => e.preventDefault());
    on(slide, 'leave', () => {
      signed = false; holding = false; p = 0; paint();
      arch.classList.remove('signed');
      btn.hidden = false;
      done.hidden = true;
    });
  };

  boot();
})();
