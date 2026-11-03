const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/6NBQAEVEPU';

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !/motion=1/.test(location.search);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = p => 1 - Math.pow(1 - p, 3);
  const nf = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ');

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- меню ---------- */
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? 'Закрыть' : 'Меню';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    if (burger) burger.textContent = 'Меню';
  }));

  /* ---------- плавный якорь ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const t = $(href);
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + scrollY - 64), behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- заголовки по словам ---------- */
  $$('[data-split]').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span');
      o.className = 'w';
      o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.textContent = w;
      s.style.setProperty('--i', i);
      o.appendChild(s);
      h.appendChild(o);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });
  $$('.hero__title .ln > span').forEach((s, i) => s.style.setProperty('--i', i));

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.03, rootMargin: '0px 0px -6% 0px' });
  $$('[data-split]').forEach(el => io.observe(el));
  const fio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); fio.disconnect(); } }), { threshold: 0 });
  const fb = $('.footer__big'); if (fb) fio.observe(fb);

  const rvSel = '.sec__lead, .note, .calc__field, .cost__out, .versus__col, .price__main > *, .price__side > *, .who__txt p, .qa, .contacts li, .form';
  $$(rvSel).forEach(el => {
    el.classList.add('rv');
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty('--i', Math.min(sib, 5));
    io.observe(el);
  });

  /* ---------- герой: вход, таймер, разблокировка скроллом ---------- */
  const hero = $('#hero'), status = $('#status');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));

  let sec = 0, wasOpen = false;
  const fmtT = () => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  const tickTimer = () => {
    sec++;
    const f = $('#frozenTime');
    if (f) f.textContent = fmtT();
  };
  const timer = setInterval(tickTimer, 1000);

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const FROM = [230, 236, 248], TO = [230, 245, 238];
  const root = document.documentElement;

  const progressBar = $('#progress');
  const header = $('#header');
  const fab = $('.fab');
  let lastY = 0;

  /* ---------- история процесса ---------- */
  const steps = $$('#steps .step');
  const pbar = $('#processBar');
  const stepsEl = $('#steps');

  /* ---------- причины ---------- */
  const grounds = $$('.ground');
  let lockUntil = 0, activeGround = -1;
  const setGround = i => {
    if (i === activeGround) return;
    activeGround = i;
    grounds.forEach((g, k) => {
      g.classList.toggle('is-open', k === i);
      $('.ground__head', g).setAttribute('aria-expanded', String(k === i));
    });
  };
  grounds.forEach((g, i) => $('.ground__head', g).addEventListener('click', () => {
    lockUntil = performance.now() + 3500;
    const open = g.classList.contains('is-open');
    activeGround = open ? -1 : i;
    grounds.forEach((x, k) => {
      x.classList.toggle('is-open', !open && k === i);
      $('.ground__head', x).setAttribute('aria-expanded', String(!open && k === i));
    });
  }));

  /* ---------- один цикл скролла ---------- */
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    header.classList.toggle('scrolled', y > 10);
    header.classList.toggle('hide', y > lastY && y > 520 && !nav.classList.contains('is-open'));
    lastY = y;
    fab?.classList.toggle('on', y > vh * 0.9);

    // герой
    const u = reduce ? 0 : clamp(y / (vh * 0.55));
    status.style.setProperty('--u', u.toFixed(3));
    const c = mix(FROM, TO, ease(u));
    root.style.setProperty('--field', 'rgb(' + c.join(',') + ')');
    const open = u > 0.5;
    if (open !== wasOpen) {
      wasOpen = open;
      $('#statusLabel').textContent = open ? 'Операции возобновлены' : 'Операции приостановлены';
      $('#statusTime').innerHTML = open ? 'Доступ вернулся' : 'Счёт заморожен <b id="frozenTime">' + fmtT() + '</b>';
    }

    // причины
    if (performance.now() > lockUntil && grounds.length) {
      const line = vh * 0.55;
      let idx = -1;
      grounds.forEach((g, k) => { if (g.getBoundingClientRect().top <= line) idx = k; });
      const list = $('#groundList').getBoundingClientRect();
      if (list.bottom < 0 || list.top > vh) idx = activeGround;
      setGround(idx);
    }

    // шаги
    if (stepsEl) {
      steps.forEach(s => { if (s.getBoundingClientRect().top < vh * 0.72) s.classList.add('is-on'); });
      const r = stepsEl.getBoundingClientRect();
      const p = clamp((vh * 0.72 - r.top) / (r.height - 40));
      pbar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();

  /* ---------- калькулятор простоя ---------- */
  const turn = $('#turn'), days = $('#days');
  let touched = false;
  const plural = n => (n % 10 === 1 && n % 100 !== 11) ? 'день' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'дня' : 'дней';
  let shown = 0, target = 0, raf = 0;
  const animateTo = v => {
    target = v;
    cancelAnimationFrame(raf);
    if (reduce) { shown = v; $('#lost').textContent = nf(v); return; }
    const from = shown, t0 = performance.now(), dur = 600;
    const step = t => {
      const p = clamp((t - t0) / dur);
      shown = from + (target - from) * ease(p);
      $('#lost').textContent = nf(shown);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const calc = () => {
    const t = +turn.value, d = +days.value;
    $('#turnVal').textContent = nf(t) + ' ₽';
    $('#daysVal').textContent = d + ' ' + plural(d);
    [turn, days].forEach(el => el.parentElement.style.setProperty('--p', (el.value - el.min) / (el.max - el.min)));
    const lost = t * d;
    animateTo(lost);
    const pct = 35000 / lost * 100;
    $('#cmp').textContent = lost <= 35000
      ? 'Пока простой обходится дешевле услуги. Но оборот стоит каждый день, и в конце срока банк может закрыть счёт.'
      : 'Стоимость нашей работы от 35 000 ₽ — это ' + (pct < 1 ? 'меньше 1 %' : pct.toFixed(pct < 10 ? 1 : 0).replace('.', ',') + ' %') + ' от этой суммы.';
  };
  [turn, days].forEach(el => el.addEventListener('input', () => { touched = true; calc(); }));
  calc();

  /* ---------- цена: счётчик ---------- */
  const priceEl = $('#priceNum');
  if (priceEl && !reduce) {
    const pio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      pio.disconnect();
      const t0 = performance.now(), to = 35000, dur = 1500;
      const step = t => {
        const p = clamp((t - t0) / dur);
        priceEl.textContent = nf(to * ease(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.5 });
    pio.observe(priceEl);
  }

  /* ---------- магнитные кнопки ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('[data-magnet]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- FAQ: открыт один ---------- */
  const qas = $$('.qa');
  qas.forEach(q => q.addEventListener('toggle', () => {
    if (q.open) qas.forEach(o => { if (o !== q) o.open = false; });
  }));

  /* ---------- маска телефона ---------- */
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  /* ---------- форма → Worker → Telegram ---------- */
  const form = $('#leadForm'), msg = $('#formMsg');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form);
    const orig = btn.textContent;
    const fd = new FormData(form), payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;

    $$('.fld', form).forEach(f => f.classList.remove('err'));
    const digits = (payload.phone || '').replace(/\D/g, '');
    let bad = false;
    if (!payload.name || !payload.name.trim()) { $('[name=name]', form).closest('.fld').classList.add('err'); bad = true; }
    if (digits.length < 11) { $('[name=phone]', form).closest('.fld').classList.add('err'); bad = true; }
    if (bad) { msg.className = 'form__msg bad'; msg.textContent = 'Заполните имя и телефон полностью.'; return; }
    if (!$$('.formdoc', form).every(x => x.checked)) { msg.className = 'form__msg bad'; msg.textContent = 'Отметьте все четыре документа.'; return; }
    try { sessionStorage.setItem('docs-ok', '1'); } catch (_) {}

    if (touched) {
      payload.comment = (payload.comment ? payload.comment + '\n\n' : '') +
        'Калькулятор простоя: ' + nf(+turn.value) + ' ₽ в день, ' + days.value + ' дн.';
    }
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    msg.className = 'form__msg'; msg.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      msg.className = 'form__msg ok';
      msg.textContent = 'Спасибо. Мы свяжемся с вами в ближайшее время.';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Не отправилось';
      msg.className = 'form__msg bad';
      msg.textContent = 'Не получилось отправить. Напишите нам в Telegram: @suzanna1985.';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  /* ---------- согласия перед Telegram ---------- */
  const gate = $('#gate'), go = $('#gateGo'), boxes = $$('.gatedoc');
  const okStored = () => { try { return sessionStorage.getItem('docs-ok') === '1'; } catch (_) { return false; } };
  const syncGo = () => {
    const all = boxes.every(b => b.checked);
    go.setAttribute('aria-disabled', String(!all));
    go.style.opacity = all ? '' : '.45';
    go.style.pointerEvents = all ? '' : 'none';
  };
  boxes.forEach(b => b.addEventListener('change', syncGo));
  syncGo();
  $$('[data-gate]').forEach(a => a.addEventListener('click', e => {
    if (okStored() || !gate || !gate.showModal) return;
    e.preventDefault();
    go.href = a.href;
    gate.showModal();
  }));
  go?.addEventListener('click', () => {
    try { sessionStorage.setItem('docs-ok', '1'); } catch (_) {}
    gate.close();
  });
  $('#gateX')?.addEventListener('click', () => gate.close());
})();
