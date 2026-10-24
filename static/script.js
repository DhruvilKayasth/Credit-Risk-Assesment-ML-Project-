(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const form = $('#form');
  const panel = $('#panel');
  const formView = $('#formView');
  const resultView = $('#resultView');
  const banner = $('#banner');
  const submitBtn = $('#submitBtn');
  const btnLabel = $('#btnLabel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const numberOf = (name) => {
    const v = form.elements[name].value;
    return v === '' ? NaN : Number(v);
  };
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- Server status ---------- */
  const status = $('#status');
  const statusText = $('#statusText');

  function setStatus(state, text) {
    status.dataset.state = state;
    statusText.textContent = text;
  }

  fetch('/health')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => (d.model_loaded ? setStatus('ok', 'Model online') : setStatus('down', 'Model not loaded')))
    .catch(() => setStatus('down', 'Server unreachable'));

  /* ---------- Sliders linked to number inputs ---------- */
  function paintRange(range) {
    const min = Number(range.min);
    const max = Number(range.max);
    const v = Math.min(Math.max(Number(range.value), min), max);
    range.style.setProperty('--pct', ((v - min) / (max - min)) * 100 + '%');
  }

  const ranges = $$('input[type="range"][data-sync]');

  ranges.forEach((range) => {
    const num = form.elements[range.dataset.sync];

    range.addEventListener('input', () => {
      num.value = range.value;
      paintRange(range);
      clearError(num.name);
      updateLti();
    });

    num.addEventListener('input', () => {
      if (num.value !== '') range.value = num.value;
      paintRange(range);
    });

    paintRange(range);
  });

  /* ---------- Loan as share of income (auto-calculated) ---------- */
  function updateLti() {
    const income = numberOf('person_income');
    const loan = numberOf('loan_amnt');
    const value = $('#ltiValue');
    const bar = $('#ltiBar');
    const note = $('#ltiNote');

    if (income > 0 && loan >= 0 && Number.isFinite(loan)) {
      const ratio = loan / income;
      value.textContent = Math.round(ratio * 100) + '%';
      bar.style.width = Math.min(ratio, 1) * 100 + '%';
      note.textContent = `${money(loan)} borrowed against ${money(income)} of income a year.`;
    } else {
      value.textContent = '—';
      bar.style.width = '0%';
      note.textContent = 'Calculated from the loan amount and annual income.';
    }
  }

  ['person_income', 'loan_amnt'].forEach((n) => form.elements[n].addEventListener('input', updateLti));
  updateLti();

  /* ---------- Samples ---------- */
  const SAMPLES = [
    {
      person_age: 41, person_emp_length: 12, person_income: 96000, person_home_ownership: 'MORTGAGE',
      loan_intent: 'HOMEIMPROVEMENT', loan_grade: 'A', loan_amnt: 9000, loan_int_rate: 7.5,
      cb_person_default_on_file: 'N', cb_person_cred_hist_length: 15,
    },
    {
      person_age: 24, person_emp_length: 1, person_income: 36000, person_home_ownership: 'RENT',
      loan_intent: 'MEDICAL', loan_grade: 'E', loan_amnt: 18000, loan_int_rate: 17.5,
      cb_person_default_on_file: 'Y', cb_person_cred_hist_length: 2,
    },
  ];
  let sampleIndex = 0;

  function applyValues(values) {
    Object.entries(values).forEach(([name, value]) => {
      const el = form.elements[name];
      el.value = value; // works for inputs and radio groups
      if (typeof el.dispatchEvent === 'function') el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    updateLti();
  }

  $('#sampleBtn').addEventListener('click', () => {
    clearAllErrors();
    applyValues(SAMPLES[sampleIndex]);
    sampleIndex = (sampleIndex + 1) % SAMPLES.length;
  });

  /* ---------- Validation ---------- */
  const RULES = {
    person_age: { min: 18, max: 100, int: true },
    person_emp_length: { min: 0, max: 60 },
    person_income: { min: 1, msg: 'Enter an income greater than 0.' },
    loan_amnt: { min: 1, msg: 'Enter a loan amount greater than 0.' },
    loan_int_rate: { min: 0.1, max: 40 },
    cb_person_cred_hist_length: { min: 0, max: 60, int: true },
  };

  function fieldOf(name) {
    return form.elements[name].closest('.field');
  }

  function setError(name, message) {
    const field = fieldOf(name);
    field.classList.add('invalid');
    $('.err', field).textContent = message;
    field.classList.remove('shake');
    void field.offsetWidth; // restart the shake animation
    field.classList.add('shake');
  }

  function clearError(name) {
    const el = form.elements[name];
    if (!el || !el.closest) return;
    const field = el.closest('.field');
    if (!field) return;
    field.classList.remove('invalid', 'shake');
    const err = $('.err', field);
    if (err) err.textContent = '';
  }

  function clearAllErrors() {
    $$('.field.invalid').forEach((f) => {
      f.classList.remove('invalid', 'shake');
      const err = $('.err', f);
      if (err) err.textContent = '';
    });
    hideBanner();
  }

  form.addEventListener('input', (e) => {
    if (e.target.name) clearError(e.target.name);
  });

  function collect() {
    let ok = true;
    let firstBad = null;

    const fail = (name, msg) => {
      setError(name, msg);
      ok = false;
      if (!firstBad) firstBad = form.elements[name];
    };

    Object.entries(RULES).forEach(([name, rule]) => {
      const v = numberOf(name);
      if (!Number.isFinite(v)) return fail(name, 'Enter a number.');
      if (rule.int && !Number.isInteger(v)) return fail(name, 'Use a whole number.');
      if (v < rule.min || (rule.max !== undefined && v > rule.max)) {
        return fail(name, rule.msg || `Enter a value from ${rule.min} to ${rule.max}.`);
      }
    });

    if (ok) {
      const age = numberOf('person_age');
      if (numberOf('person_emp_length') > age - 14) {
        fail('person_emp_length', 'This is longer than the applicant could have worked at this age.');
      }
      if (numberOf('cb_person_cred_hist_length') > age - 16) {
        fail('cb_person_cred_hist_length', 'This is longer than the applicant could have held credit at this age.');
      }
    }

    if (firstBad) firstBad.focus();
    if (!ok) return { ok };

    const income = numberOf('person_income');
    const loan = numberOf('loan_amnt');

    return {
      ok,
      payload: {
        person_age: numberOf('person_age'),
        person_income: income,
        person_home_ownership: form.elements.person_home_ownership.value,
        person_emp_length: numberOf('person_emp_length'),
        loan_intent: form.elements.loan_intent.value,
        loan_grade: form.elements.loan_grade.value,
        loan_amnt: loan,
        loan_int_rate: numberOf('loan_int_rate'),
        loan_percent_income: Math.round((loan / income) * 100) / 100,
        cb_person_default_on_file: form.elements.cb_person_default_on_file.value,
        cb_person_cred_hist_length: numberOf('cb_person_cred_hist_length'),
      },
    };
  }

  /* ---------- Banner & loading ---------- */
  function showBanner(message) {
    banner.textContent = message;
    banner.hidden = false;
  }
  function hideBanner() {
    banner.hidden = true;
    banner.textContent = '';
  }

  function setLoading(isLoading) {
    submitBtn.setAttribute('aria-busy', String(isLoading));
    btnLabel.textContent = isLoading ? 'Scoring application…' : 'Check default risk';
  }

  async function describeError(res) {
    try {
      const body = await res.json();
      if (Array.isArray(body.detail)) {
        return 'Check your inputs: ' + body.detail.map((d) => `${(d.loc || []).slice(1).join('.') || 'input'} ${d.msg}`).join('; ');
      }
      if (typeof body.detail === 'string') return body.detail;
    } catch (_) { /* ignore */ }
    return `The server returned an error (${res.status}). Try again in a moment.`;
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner();

    const { ok, payload } = collect();
    if (!ok) return;

    setLoading(true);
    const slowTimer = setTimeout(() => {
      btnLabel.textContent = 'Still working. The server may be waking up…';
    }, 5000);

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await describeError(res));

      const data = await res.json();
      setStatus('ok', 'Model online');
      showResult(data);
    } catch (err) {
      const offline = err instanceof TypeError;
      showBanner(offline ? 'Could not reach the server. Check your connection and try again.' : err.message);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
    }
  });

  /* ---------- Views ---------- */
  function showView(which) {
    formView.hidden = which !== 'form';
    resultView.hidden = which !== 'result';
    const top = panel.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  $('#editBtn').addEventListener('click', () => showView('form'));

  $('#againBtn').addEventListener('click', () => {
    form.reset();
    ranges.forEach(paintRange);
    updateLti();
    clearAllErrors();
    showView('form');
  });

  /* ---------- Gauge ---------- */
  const CX = 130;
  const CY = 130;
  const needle = $('#needle');
  const pctValue = $('#pctValue');
  let rafId = null;

  // Point on the semicircle for a fraction t (0 = far left, 1 = far right)
  const polar = (r, t) => {
    const a = Math.PI * (1 - t);
    return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  };

  const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
  const easeOutBack = (k) => {
    const c1 = 1.1;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
  };

  function setNeedle(p) {
    needle.setAttribute('transform', `rotate(${-90 + p * 180} ${CX} ${CY})`);
  }

  function drawGauge(p, t) {
    // Colour the zones either side of the cut-off
    $('#arcSafe').style.strokeDasharray = `${t * 100} 100`;
    $('#arcRisk').style.strokeDasharray = `0 ${t * 100} ${(1 - t) * 100} 100`;

    const [x1, y1] = polar(80, t);
    const [x2, y2] = polar(104, t);
    const tick = $('#thrTick');
    tick.setAttribute('x1', x1);
    tick.setAttribute('y1', y1);
    tick.setAttribute('x2', x2);
    tick.setAttribute('y2', y2);

    cancelAnimationFrame(rafId);

    if (reduceMotion) {
      setNeedle(p);
      pctValue.textContent = (p * 100).toFixed(1);
      return;
    }

    setNeedle(0);
    pctValue.textContent = '0.0';
    const start = performance.now() + 250; // short pause so the view settles first
    const duration = 1500;

    const frame = (now) => {
      const k = Math.min(Math.max((now - start) / duration, 0), 1);
      setNeedle(Math.min(Math.max(p * easeOutBack(k), 0), 1.03));
      pctValue.textContent = (p * easeOutCubic(k) * 100).toFixed(1);
      if (k < 1) rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
  }

  /* ---------- Result ---------- */
  const ICON_OK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_WARN = '<svg viewBox="0 0 24 24"><path d="M12 6.5v7"/><path d="M12 17.5h.01"/></svg>';

  function showResult(data) {
    const p = Math.min(Math.max(Number(data.default_probability), 0), 1);
    const t = Math.min(Math.max(Number(data.threshold ?? 0.5), 0), 1);
    const high = Number(data.default_prediction) === 1;
    const diff = Math.abs(p - t) * 100;
    const risk = high ? 'high' : 'low';

    $('#gaugeBox').dataset.risk = risk;
    $('#verdict').dataset.risk = risk;
    $('#vIcon').innerHTML = high ? ICON_WARN : ICON_OK;

    $('#verdictTitle').textContent = high ? 'High risk' : 'Low risk';
    $('#verdictText').textContent = high
      ? `${diff.toFixed(1)} points above the cut-off. Review this application closely before approving.`
      : `${diff.toFixed(1)} points below the cut-off. The model sees this loan as likely to be repaid.`;

    $('#factProb').textContent = (p * 100).toFixed(1) + '%';
    $('#factThr').textContent = (t * 100).toFixed(1) + '%';
    $('#factMargin').textContent = `${diff.toFixed(1)} pts ${high ? 'above' : 'below'}`;
    $('#legendThr').textContent = `Cut-off ${(t * 100).toFixed(1)}%`;

    showView('result');
    drawGauge(p, t);
  }
})();
