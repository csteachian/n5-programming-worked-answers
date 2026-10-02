(function () {
  'use strict';

  const QUESTIONS = window.QUESTIONS;
  const STORE_KEY = 'n5-worked-answers';

  const REF_KEYWORDS = new Set(['DECLARE', 'INITIALLY', 'SET', 'TO', 'RECEIVE', 'FROM', 'KEYBOARD', 'SEND',
    'DISPLAY', 'IF', 'THEN', 'ELSE', 'END', 'WHILE', 'DO', 'FOR', 'EACH', 'REPEAT', 'UNTIL',
    'AND', 'OR', 'NOT', 'INTEGER', 'REAL', 'STRING', 'BOOLEAN', 'CHARACTER', 'TRUE', 'FALSE']);
  const REF_FUNCTIONS = new Set(['RANDOM', 'ROUND', 'LENGTH']);
  const PY_KEYWORDS = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'not', 'and', 'or',
    'import', 'True', 'False', 'def', 'return']);
  const PY_FUNCTIONS = new Set(['print', 'input', 'len', 'round', 'int', 'float', 'str', 'randint', 'random']);

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- Saved state ---------- */

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage unavailable */ }
  }
  const store = loadStore();
  store.answers = store.answers || {};
  store.marks = store.marks || {};
  store.open = store.open || {};
  store.lang = store.lang === 'py' ? 'py' : 'ref';

  const parts = QUESTIONS.flatMap(q => q.parts.map(p => Object.assign({ question: q }, p)));
  const totalMarks = parts.reduce((n, p) => n + p.marks, 0);

  /* ---------- Code rendering ---------- */

  function highlight(text, lang) {
    const keywords = lang === 'py' ? PY_KEYWORDS : REF_KEYWORDS;
    const functions = lang === 'py' ? PY_FUNCTIONS : REF_FUNCTIONS;
    const word = lang === 'py' ? /\b([A-Za-z_]\w*)\b/g : /\b([A-Z]{2,})\b/g;
    return text.split(/("[^"]*"|#.*$)/).map(part => {
      if (part.startsWith('"')) return `<span class="tok-str">${esc(part)}</span>`;
      if (part.startsWith('#')) return `<span class="tok-com">${esc(part)}</span>`;
      return esc(part)
        .replace(word, w => {
          if (keywords.has(w)) return `<span class="tok-kw">${w}</span>`;
          if (functions.has(w)) return `<span class="tok-fn">${w}</span>`;
          return w;
        })
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
    }).join('');
  }

  /** Numbered code listing. `start` sets the first line number (exam-style "Line 34"). */
  function codeBlock(lines, lang, start) {
    const first = start || 1;
    const rows = lines.map((line, i) =>
      `<span class="ln" data-i="${i}"><span class="ln-num">${start ? 'Line ' : ''}${first + i}</span><span class="ln-text">${highlight(line, lang) || ' '}</span></span>`
    ).join('');
    return `<pre class="code-block numbered${start ? ' exam' : ''}"><code>${start ? '<span class="ln ln-gap">…</span>' : ''}${rows}${start ? '<span class="ln ln-gap">…</span>' : ''}</code></pre>`;
  }

  function langName(lang) { return lang === 'py' ? 'Python' : 'SQA Reference Language'; }

  /* ---------- Question cards ---------- */

  function tableHtml(t) {
    const head = t.head ? `<thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : '';
    const body = t.rows.map(r => `<tr>${r.map((c, i) =>
      c === '?' ? '<td class="blank" aria-label="to complete"></td>' : (i === 0 && !t.head ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)
    ).join('')}</tr>`).join('');
    return `<table class="q-table">${head}<tbody>${body}</tbody></table>`;
  }

  function figureHtml(q) {
    const f = q.figure;
    if (!f) return '';
    if (f.type === 'code') return codeBlock(f.lines, 'ref', f.start);
    if (f.type === 'flow') {
      return `<div class="chart-scroll q-chart">${window.Flowchart.render(f.flow, 'Flowchart for the self-service till')}</div>`;
    }
    return '';
  }

  function partHtml(p) {
    const label = p.label ? `<span class="part-label">${p.label}</span>` : '';
    const markWord = p.marks === 1 ? 'mark' : 'marks';
    const answer = p.code
      ? `<div class="code-answer" data-part="${p.id}"></div>`
      : p.answer;
    const also = p.also ? `<details class="also"><summary>Other correct answers</summary>${p.also}</details>` : '';
    const marks = p.markPoints.map((m, i) => `
      <li><label class="mark-point">
        <input type="checkbox" data-part="${p.id}" data-i="${i}">
        <span>${m}</span>
      </label></li>`).join('');
    const watch = p.watch ? `
      <section class="block block-watch">
        <h4>Watch out</h4>
        <ul>${p.watch.map(w => `<li>${w}</li>`).join('')}</ul>
      </section>` : '';
    const tryIt = p.tryIt ? `
      <section class="block block-try">
        <h4>Try it</h4>
        <div class="widget" data-widget="${p.tryIt}"></div>
      </section>` : '';
    return `
      <section class="part" id="part-${p.id}" data-part="${p.id}">
        <div class="part-prompt">
          ${label}
          <p>${p.prompt}</p>
          <span class="part-marks" title="${p.marks} ${markWord}">${p.marks}</span>
        </div>
        ${p.table ? tableHtml(p.table) : ''}
        <label class="attempt-label" for="attempt-${p.id}">Your answer</label>
        <textarea class="attempt${p.code ? ' is-code' : ''}" id="attempt-${p.id}" data-part="${p.id}"
          rows="${p.code ? Math.min(Math.max(p.code.ref.length, 2), 8) : 2}" spellcheck="${p.code ? 'false' : 'true'}"
          placeholder="${p.code ? 'Write your code here…' : 'Write your answer here…'}"></textarea>
        <div class="part-actions">
          <button type="button" class="btn btn-primary reveal-btn" data-part="${p.id}" aria-expanded="false" aria-controls="reveal-${p.id}">Show answer</button>
          <span class="part-score" data-part="${p.id}"></span>
        </div>
        <div class="reveal" id="reveal-${p.id}" hidden>
          <section class="block block-answer">
            <h4>Model answer</h4>
            ${answer}
            ${also}
          </section>
          <section class="block block-marks">
            <h4>Mark yourself <span class="hint">(${p.marks} ${markWord})</span></h4>
            <ul class="mark-list">${marks}</ul>
          </section>
          <section class="block block-why">
            <h4>Why?</h4>
            ${p.why}
          </section>
          ${watch}
          ${tryIt}
        </div>
      </section>`;
  }

  function questionHtml(q, n) {
    const marks = q.parts.reduce((s, p) => s + p.marks, 0);
    return `
      <article class="q-card" id="${q.id}" aria-labelledby="${q.id}-title">
        <header class="q-head">
          <span class="q-num">${n}</span>
          <div class="q-title">
            <h2 id="${q.id}-title">${q.title}</h2>
            <span class="q-topic">${q.topic}</span>
          </div>
          <span class="q-total">${marks} ${marks === 1 ? 'mark' : 'marks'}</span>
        </header>
        ${q.stem || q.figure ? `<div class="q-stem">${q.stem}${figureHtml(q)}</div>` : ''}
        ${q.parts.map(partHtml).join('')}
      </article>`;
  }

  function renderNav() {
    $('q-list').innerHTML = QUESTIONS.map((q, i) => `
      <li><a class="task" href="#${q.id}" data-q="${q.id}">
        <span class="task-num">${i + 1}</span>
        <span class="task-text">
          <span class="task-title">${q.title}</span>
          <span class="task-topic">${q.topic}</span>
        </span>
        <span class="nav-score" data-q="${q.id}"></span>
      </a></li>`).join('');
  }

  function renderCodeAnswers() {
    document.querySelectorAll('.code-answer').forEach(el => {
      const p = parts.find(x => x.id === el.dataset.part);
      el.innerHTML = `<p class="lang-note">${langName(store.lang)}</p>${codeBlock(p.code[store.lang], store.lang)}`;
    });
  }

  /* ---------- Reveal and self-marking ---------- */

  function setOpen(id, open) {
    const box = $('reveal-' + id);
    const btn = document.querySelector(`.reveal-btn[data-part="${id}"]`);
    box.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Hide answer' : 'Show answer';
    btn.classList.toggle('btn-primary', !open);
    if (open) store.open[id] = true; else delete store.open[id];
  }

  function earned(id) { return (store.marks[id] || []).filter(Boolean).length; }

  function updateScores() {
    let got = 0;
    parts.forEach(p => {
      const n = earned(p.id);
      got += n;
      const el = document.querySelector(`.part-score[data-part="${p.id}"]`);
      el.textContent = store.open[p.id] ? `${n} / ${p.marks} ticked` : '';
      el.classList.toggle('is-full', n === p.marks);
    });
    QUESTIONS.forEach(q => {
      const total = q.parts.reduce((s, p) => s + p.marks, 0);
      const n = q.parts.reduce((s, p) => s + earned(p.id), 0);
      const seen = q.parts.every(p => store.open[p.id]);
      const link = document.querySelector(`.task[data-q="${q.id}"]`);
      link.classList.toggle('is-done', seen);
      document.querySelector(`.nav-score[data-q="${q.id}"]`).textContent = seen ? `${n}/${total}` : '';
    });
    $('score').textContent = `${got} / ${totalMarks}`;
    $('score-fill').style.width = `${(got / totalMarks) * 100}%`;
  }

  /* ---------- Try-it widgets ---------- */

  const W = {};

  W.round = el => {
    el.innerHTML = `
      <p>Type a value for <code>screenTime</code> and see what gets stored.</p>
      <label class="field">screenTime <input type="number" step="any" value="17.4285714" data-in></label>
      <div class="out" data-out aria-live="polite"></div>`;
    const input = el.querySelector('[data-in]');
    const out = el.querySelector('[data-out]');
    const show = () => {
      const x = parseFloat(input.value);
      if (Number.isNaN(x)) { out.innerHTML = 'Enter a number.'; return; }
      const r = Math.round((x + Number.EPSILON) * 100) / 100;
      out.innerHTML = `
        <div class="trace-row"><code>ROUND(${x}, 2)</code><span>→</span><strong>${r.toFixed(2)}</strong><span class="ok-tag">rounded to 2 places</span></div>
        <div class="trace-row"><code>ROUND(${x}, 0)</code><span>→</span><strong>${Math.round(x)}</strong><span class="muted">0 places</span></div>
        <div class="trace-row"><code>INT(${x})</code><span>→</span><strong>${Math.trunc(x)}</strong><span class="bad-tag">decimals chopped off</span></div>`;
    };
    input.addEventListener('input', show);
    show();
  };

  W.merit = el => {
    el.innerHTML = `
      <p>Change the data and the operator to see when a merit is given.</p>
      <div class="controls">
        <label class="field check"><input type="checkbox" data-pm checked> peerMentor is TRUE</label>
        <label class="field">attendance <input type="range" min="80" max="100" value="97" data-att> <output data-att-out>97</output></label>
        <span class="seg" role="group" aria-label="Logical operator">
          <button type="button" class="seg-btn" data-op="AND" aria-pressed="true">AND</button>
          <button type="button" class="seg-btn" data-op="OR" aria-pressed="false">OR</button>
        </span>
      </div>
      <div class="out" data-out aria-live="polite"></div>`;
    let op = 'AND';
    const pm = el.querySelector('[data-pm]');
    const att = el.querySelector('[data-att]');
    const out = el.querySelector('[data-out]');
    const tf = b => `<span class="${b ? 'ok-tag' : 'bad-tag'}">${b ? 'TRUE' : 'FALSE'}</span>`;
    const show = () => {
      const a = pm.checked;
      const n = +att.value;
      const b = n > 95;
      const r = op === 'AND' ? a && b : a || b;
      el.querySelector('[data-att-out]').textContent = n;
      out.innerHTML = `
        <div class="trace-row"><code>peerMentor = TRUE</code><span>→</span>${tf(a)}</div>
        <div class="trace-row"><code>attendance &gt; 95</code><span>→</span>${tf(b)}<span class="muted">(${n} &gt; 95)</span></div>
        <div class="trace-row"><code>${tf(a)} ${op} ${tf(b)}</code><span>→</span>${tf(r)}</div>
        <p class="verdict ${r ? 'is-ok' : 'is-bad'}">${r ? 'Merit: "Yes"' : 'No merit'}</p>
        <p class="muted small">${op === 'AND' ? 'AND needs <strong>both</strong> conditions to be TRUE.' : 'OR needs <strong>at least one</strong> condition to be TRUE.'}</p>`;
    };
    el.querySelectorAll('[data-op]').forEach(btn => btn.addEventListener('click', () => {
      op = btn.dataset.op;
      el.querySelectorAll('[data-op]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      show();
    }));
    pm.addEventListener('change', show);
    att.addEventListener('input', show);
    show();
  };

  W.iterative = el => {
    const stages = ['Analysis', 'Design', 'Implementation', 'Testing', 'Documentation', 'Evaluation'];
    const scenarios = [
      { name: 'Testing finds a bug', from: 3, to: 2, text: 'During testing, the total is calculated wrongly, so the programmer goes back to <strong>implementation</strong> to fix the code, then tests again.' },
      { name: 'Client changes their mind', from: 2, to: 0, text: 'While the program is being written, the client asks for a new feature, so the developer goes back to <strong>analysis</strong> to update the requirements, then redesigns.' },
      { name: 'Design does not work', from: 2, to: 1, text: 'While coding, the programmer finds a step missing from the design, so they go back to <strong>design</strong> to correct it.' },
      { name: 'Not fit for purpose', from: 5, to: 0, text: 'The evaluation shows the program does not do everything the client asked for, so the developer goes back to <strong>analysis</strong>.' }
    ];
    el.innerHTML = `
      <p>Pick a situation to see where the developer goes back to.</p>
      <div class="seg wrap" role="group" aria-label="Situation">${scenarios.map((s, i) =>
        `<button type="button" class="seg-btn" data-s="${i}" aria-pressed="${i === 0}">${s.name}</button>`).join('')}</div>
      <ol class="stages">${stages.map((s, i) => `<li data-stage="${i}">${s}</li>`).join('')}</ol>
      <p class="out" data-out aria-live="polite"></p>`;
    const show = i => {
      const s = scenarios[i];
      el.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === i)));
      el.querySelectorAll('[data-stage]').forEach(li => {
        const k = +li.dataset.stage;
        li.className = k === s.from ? 'is-from' : k === s.to ? 'is-to' : (k > s.to && k < s.from ? 'is-between' : '');
      });
      el.querySelector('[data-out]').innerHTML = `<span class="arrow-back">${stages[s.from]} ↩ ${stages[s.to]}</span> ${s.text}`;
    };
    el.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => show(+b.dataset.s)));
    show(0);
  };

  W.power = el => {
    el.innerHTML = `
      <p>Change what the user enters at Line 34.</p>
      <label class="field">xyz <input type="number" step="1" value="3" data-in></label>
      <div class="out" data-out aria-live="polite"></div>`;
    const input = el.querySelector('[data-in]');
    const out = el.querySelector('[data-out]');
    const show = () => {
      const x = parseInt(input.value, 10);
      if (Number.isNaN(x)) { out.innerHTML = 'Enter a whole number (it is received as an INTEGER).'; return; }
      out.innerHTML = `
        <table class="trace">
          <thead><tr><th>Line</th><th>Code</th><th>xyz</th><th>abc</th></tr></thead>
          <tbody>
            <tr><td>34</td><td><code>RECEIVE xyz …</code></td><td>${x}</td><td></td></tr>
            <tr><td>35</td><td><code>SET abc TO xyz ^ 2</code></td><td>${x}</td><td><strong>${x * x}</strong></td></tr>
          </tbody>
        </table>
        <p class="small">${x} ^ 2 = ${x} × ${x} = <strong>${x * x}</strong> <span class="muted">(not ${x} × 2 = ${x * 2})</span></p>`;
    };
    input.addEventListener('input', show);
    show();
  };

  W.concat = el => {
    el.innerHTML = `
      <p>Enter a name and a year to see the username that Line 13 creates.</p>
      <div class="controls">
        <label class="field">firstName <input type="text" value="Amy" data-a maxlength="20"></label>
        <label class="field">yearOfBirth <input type="text" value="2009" data-b maxlength="8"></label>
      </div>
      <div class="out" data-out aria-live="polite"></div>`;
    const a = el.querySelector('[data-a]');
    const b = el.querySelector('[data-b]');
    const out = el.querySelector('[data-out]');
    const show = () => {
      out.innerHTML = `<div class="trace-row"><code>"${esc(a.value)}" &amp; "${esc(b.value)}"</code><span>→</span><strong class="mono">"${esc(a.value + b.value)}"</strong></div>`;
    };
    a.addEventListener('input', show);
    b.addEventListener('input', show);
    show();
  };

  W.types = el => {
    const types = ['Character', 'String', 'Integer', 'Real', 'Boolean'];
    const items = [
      { v: '78', t: 'Integer', why: 'a whole number' },
      { v: 'Ullapool', t: 'String', why: 'several characters (text)' },
      { v: '12.99', t: 'Real', why: 'a number with a decimal point' },
      { v: 'TRUE', t: 'Boolean', why: 'only TRUE or FALSE' },
      { v: 'G', t: 'Character', why: 'exactly one character' },
      { v: '0141 496 0000', t: 'String', why: 'a phone number is not used for maths, has a space, and an integer would lose the leading 0' }
    ];
    el.innerHTML = `
      <p>Choose the most suitable data type for each piece of sample data.</p>
      <ul class="sort-list">${items.map((it, i) => `
        <li data-row="${i}">
          <code class="sample">${esc(it.v)}</code>
          <span class="seg" role="group" aria-label="Data type for ${esc(it.v)}">${types.map(t =>
            `<button type="button" class="seg-btn" data-t="${t}" aria-pressed="false">${t}</button>`).join('')}</span>
          <span class="sort-fb" aria-live="polite"></span>
        </li>`).join('')}</ul>`;
    el.querySelectorAll('[data-row]').forEach(li => {
      const it = items[+li.dataset.row];
      li.querySelectorAll('[data-t]').forEach(btn => btn.addEventListener('click', () => {
        li.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        const ok = btn.dataset.t === it.t;
        li.className = ok ? 'is-ok' : 'is-bad';
        li.querySelector('.sort-fb').innerHTML = ok ? `✓ ${it.why}` : '✕ try again';
      }));
    });
  };

  W.seat = el => {
    const options = [
      { label: 'RANDOM(1, 50)', lo: 1, hi: 50 },
      { label: 'RANDOM(0, 50)', lo: 0, hi: 50 },
      { label: 'random.randrange(1, 50)', lo: 1, hi: 49 }
    ];
    el.innerHTML = `
      <p>Run each line of code 2000 times and check which seat numbers it can produce.</p>
      <div class="seg wrap" role="group" aria-label="Code">${options.map((o, i) =>
        `<button type="button" class="seg-btn mono" data-o="${i}" aria-pressed="${i === 0}">${o.label}</button>`).join('')}</div>
      <div class="controls">
        <button type="button" class="btn btn-small" data-one>Allocate one seat</button>
        <button type="button" class="btn btn-small" data-many>Run 2000 times</button>
      </div>
      <div class="out" data-out aria-live="polite"></div>`;
    let pick = 0;
    const out = el.querySelector('[data-out]');
    const roll = o => o.lo + Math.floor(Math.random() * (o.hi - o.lo + 1));
    el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => {
      pick = +b.dataset.o;
      el.querySelectorAll('[data-o]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      out.innerHTML = '';
    }));
    el.querySelector('[data-one]').addEventListener('click', () => {
      const n = roll(options[pick]);
      out.innerHTML = `<p class="verdict ${n >= 1 && n <= 50 ? 'is-ok' : 'is-bad'}">seatNum = <strong>${n}</strong>${n === 0 ? ' (there is no seat 0!)' : ''}</p>`;
    });
    el.querySelector('[data-many]').addEventListener('click', () => {
      const o = options[pick];
      let lo = Infinity, hi = -Infinity;
      const seen = new Set();
      for (let i = 0; i < 2000; i++) { const n = roll(o); lo = Math.min(lo, n); hi = Math.max(hi, n); seen.add(n); }
      const ok = lo === 1 && hi === 50 && seen.size === 50;
      out.innerHTML = `
        <div class="trace-row"><span>Lowest</span><strong>${lo}</strong><span>Highest</span><strong>${hi}</strong><span>Different values</span><strong>${seen.size}</strong></div>
        <p class="verdict ${ok ? 'is-ok' : 'is-bad'}">${ok
          ? '✓ Every seat from 1 to 50 can be picked, and nothing else.'
          : o.lo === 0 ? '✕ Seat 0 can be picked, but there is no seat 0.' : '✕ Seat 50 is never picked.'}</p>`;
    });
  };

  W.belt = el => {
    const items = [['Milk', 1.2], ['Bread', 0.95], ['Apples', 2.1]];
    const steps = ['add all items to conveyor belt', 'scan item', 'add item price to total', 'is conveyor belt empty?', 'display total'];
    el.innerHTML = `
      <p>Step through the design one box at a time.</p>
      <div class="belt-grid">
        <ol class="belt-steps">${steps.map((s, i) => `<li data-step="${i}">${s}</li>`).join('')}</ol>
        <dl class="belt-state">
          <dt>Belt</dt><dd data-belt></dd>
          <dt>total</dt><dd data-total></dd>
          <dt>beltEmpty <span class="muted">(Boolean)</span></dt><dd data-empty></dd>
          <dt>Times round loop</dt><dd data-loops></dd>
        </dl>
      </div>
      <div class="controls">
        <button type="button" class="btn btn-small btn-primary" data-next>Next step</button>
        <button type="button" class="btn btn-small" data-reset>Reset</button>
      </div>
      <p class="out small" data-out aria-live="polite"></p>`;
    let s;
    const set = (k, v) => { el.querySelector(k).innerHTML = v; };
    const reset = () => {
      s = { step: -1, belt: [], total: 0, empty: null, loops: 0, done: false };
      draw('Press <strong>Next step</strong> to start.');
    };
    const draw = msg => {
      el.querySelectorAll('[data-step]').forEach(li => li.classList.toggle('is-now', +li.dataset.step === s.step));
      set('[data-belt]', s.belt.length ? s.belt.map(i => `${i[0]} £${i[1].toFixed(2)}`).join(', ') : '<span class="muted">empty</span>');
      set('[data-total]', `£${s.total.toFixed(2)}`);
      set('[data-empty]', s.empty === null ? '<span class="muted">not set yet</span>' : `<span class="${s.empty ? 'ok-tag' : 'bad-tag'}">${s.empty ? 'TRUE' : 'FALSE'}</span>`);
      set('[data-loops]', s.loops);
      set('[data-out]', msg);
      el.querySelector('[data-next]').disabled = s.done;
    };
    el.querySelector('[data-next]').addEventListener('click', () => {
      if (s.step === -1) { s.step = 0; s.belt = items.slice(); return draw('All three items are on the belt.'); }
      if (s.step === 0 || (s.step === 3 && !s.empty)) {
        s.step = 1; s.current = s.belt.shift(); s.loops++;
        return draw(s.loops > 1 ? `The answer was <strong>no</strong>, so the loop goes back round. Scanning ${s.current[0]}.` : `Scanning ${s.current[0]}.`);
      }
      if (s.step === 1) { s.step = 2; s.total += s.current[1]; return draw(`Added £${s.current[1].toFixed(2)} to the total.`); }
      if (s.step === 2) {
        s.step = 3; s.empty = s.belt.length === 0;
        return draw(`The condition is checked at the <strong>end</strong> of the loop: beltEmpty is ${s.empty ? 'TRUE' : 'FALSE'}.`);
      }
      if (s.step === 3 && s.empty) {
        s.step = 4; s.done = true;
        return draw(`The answer is <strong>yes</strong>, so the loop stops after ${s.loops} times round. The program did not know in advance it would be ${s.loops}: that is why it is a <strong>conditional</strong> loop.`);
      }
    });
    el.querySelector('[data-reset]').addEventListener('click', reset);
    reset();
  };

  W.luna = el => {
    // Lines run for each route through the model answer, by language.
    const routes = {
      ref: { education: [0, 1, 2, 3, 8, 9], charity: [0, 1, 2, 4, 5, 8, 9], other: [0, 1, 2, 4, 6, 7, 8, 9] },
      py: { education: [0, 1, 2, 7], charity: [0, 1, 3, 4, 7], other: [0, 1, 3, 5, 6, 7] }
    };
    const code = parts.find(p => p.id === 'q8').code[store.lang];
    el.innerHTML = `
      <p>Run the model answer. The highlighted lines are the ones that run.</p>
      <div class="controls">
        <label class="field">basicCost £<input type="number" min="0" step="1" value="500" data-cost></label>
        <label class="field">purpose <input type="text" value="education" data-purpose list="luna-purposes" autocomplete="off"></label>
        <datalist id="luna-purposes"><option value="education"><option value="charity"><option value="advert"><option value="Education"></datalist>
        <button type="button" class="btn btn-small btn-primary" data-run>Run</button>
      </div>
      <div class="quick">Try: ${['education', 'charity', 'advert', 'Education'].map(v => `<button type="button" class="chip-btn" data-v="${v}">${v}</button>`).join('')}</div>
      <div data-code>${codeBlock(code, store.lang)}</div>
      <div class="out" data-out aria-live="polite"></div>`;
    const cost = el.querySelector('[data-cost]');
    const purpose = el.querySelector('[data-purpose]');
    const out = el.querySelector('[data-out]');
    const run = () => {
      const c = parseFloat(cost.value) || 0;
      const p = purpose.value;
      const route = p === 'education' ? 'education' : p === 'charity' ? 'charity' : 'other';
      const ran = new Set(routes[store.lang][route]);
      el.querySelectorAll('[data-code] .ln').forEach(ln => ln.classList.toggle('is-run', ran.has(+ln.dataset.i)));
      const final = route === 'education' ? c - 20 : route === 'charity' ? c - 30 : c;
      let note = route === 'other' ? 'No discount, so the <code>ELSE</code> branch sets finalCost to the basic cost.' : `£${route === 'education' ? 20 : 30} discount applied.`;
      if (route === 'other' && p.toLowerCase().trim() !== p && ['education', 'charity'].includes(p.toLowerCase().trim())) {
        note = `<strong>"${esc(p)}" is not the same string as "${esc(p.toLowerCase().trim())}"</strong>: string comparisons are case sensitive, so no discount was given.`;
      }
      out.innerHTML = `<div class="trace-row"><span>Output</span><strong class="mono">${c - Math.floor(c) ? final.toFixed(2) : final}</strong></div><p class="small">${note}</p>`;
    };
    el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { purpose.value = b.dataset.v; run(); }));
    el.querySelector('[data-run]').addEventListener('click', run);
    purpose.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    run();
  };

  W.ipo = el => {
    const items = [
      ['Type in the username', 'Input'],
      ['Check the gift card number has not been used before', 'Process'],
      ['Display the new balance', 'Output'],
      ['Check the password is five characters long', 'Process'],
      ['Enter the gift card number', 'Input'],
      ['Add £25 to the account balance', 'Process'],
      ['Check the password matches the username', 'Process']
    ];
    el.innerHTML = `
      <p>Is each step an input, a process or an output?</p>
      <ul class="sort-list">${items.map((it, i) => `
        <li data-row="${i}">
          <span class="sample-text">${it[0]}</span>
          <span class="seg" role="group" aria-label="${it[0]}">${['Input', 'Process', 'Output'].map(t =>
            `<button type="button" class="seg-btn" data-t="${t}" aria-pressed="false">${t}</button>`).join('')}</span>
          <span class="sort-fb" aria-live="polite"></span>
        </li>`).join('')}</ul>`;
    el.querySelectorAll('[data-row]').forEach(li => {
      const it = items[+li.dataset.row];
      li.querySelectorAll('[data-t]').forEach(btn => btn.addEventListener('click', () => {
        li.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        const ok = btn.dataset.t === it[1];
        li.className = ok ? 'is-ok' : 'is-bad';
        li.querySelector('.sort-fb').textContent = ok ? '✓' : '✕';
      }));
    });
  };

  W.password = el => {
    const code = parts.find(p => p.id === 'q9b').code[store.lang];
    const lenFn = store.lang === 'py' ? 'len' : 'LENGTH';
    const ne = store.lang === 'py' ? '!=' : '&lt;&gt;';
    el.innerHTML = `
      <p>Be the user. Enter passwords and watch the validation loop.</p>
      ${codeBlock(code, store.lang)}
      <form class="controls" data-form>
        <label class="field">password <input type="text" data-pw autocomplete="off" spellcheck="false" placeholder="e.g. cat"></label>
        <button type="submit" class="btn btn-small btn-primary">Enter</button>
        <button type="button" class="btn btn-small" data-reset>Reset</button>
      </form>
      <ol class="log" data-log aria-live="polite"></ol>`;
    const form = el.querySelector('[data-form]');
    const pw = el.querySelector('[data-pw]');
    const log = el.querySelector('[data-log]');
    let done = false;
    let tries = 0;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (done) return;
      const v = pw.value;
      const n = [...v].length;
      tries++;
      const bad = n !== 5;
      const where = tries === 1 ? 'before the loop' : 'inside the loop';
      log.insertAdjacentHTML('beforeend', `<li class="${bad ? 'is-bad' : 'is-ok'}">
        <span class="muted small">Input ${where}:</span> <code>"${esc(v)}"</code>
        → <code>${lenFn}(password) = ${n}</code>
        → <code>${n} ${ne} 5</code> is <strong>${bad ? 'TRUE' : 'FALSE'}</strong>
        → ${bad ? 'loop runs: error message shown, password asked for again.' : `loop ends. Password accepted after ${tries} ${tries === 1 ? 'try' : 'tries'}.`}
      </li>`);
      pw.value = '';
      if (!bad) { done = true; pw.disabled = true; }
      pw.focus();
    });
    el.querySelector('[data-reset]').addEventListener('click', () => {
      done = false; tries = 0; log.innerHTML = ''; pw.disabled = false; pw.value = '';
    });
  };

  function mountWidgets(root) {
    (root || document).querySelectorAll('[data-widget]').forEach(el => W[el.dataset.widget](el));
  }

  /* ---------- Language toggle ---------- */

  function setLang(lang) {
    store.lang = lang;
    saveStore();
    document.querySelectorAll('.lang-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderCodeAnswers();
    document.querySelectorAll('[data-widget="luna"], [data-widget="password"]').forEach(el => W[el.dataset.widget](el));
  }

  /* ---------- Start up ---------- */

  function init() {
    renderNav();
    $('questions').innerHTML = QUESTIONS.map((q, i) => questionHtml(q, i + 1)).join('');
    renderCodeAnswers();
    mountWidgets();
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === store.lang));
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });

    document.querySelectorAll('textarea.attempt').forEach(t => {
      t.value = store.answers[t.dataset.part] || '';
      t.addEventListener('input', () => { store.answers[t.dataset.part] = t.value; saveStore(); });
      if (t.classList.contains('is-code')) {
        t.addEventListener('keydown', e => {
          if (e.key !== 'Tab' || e.shiftKey) return;
          e.preventDefault();
          t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end');
          t.dispatchEvent(new Event('input'));
        });
      }
    });

    document.querySelectorAll('.mark-point input').forEach(cb => {
      const list = store.marks[cb.dataset.part] || [];
      cb.checked = !!list[+cb.dataset.i];
      cb.addEventListener('change', () => {
        const arr = store.marks[cb.dataset.part] = store.marks[cb.dataset.part] || [];
        arr[+cb.dataset.i] = cb.checked;
        saveStore();
        updateScores();
      });
    });

    document.querySelectorAll('.reveal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.part;
        setOpen(id, !store.open[id]);
        saveStore();
        updateScores();
      });
    });
    parts.forEach(p => setOpen(p.id, !!store.open[p.id]));

    $('reveal-all').addEventListener('click', () => {
      const allOpen = parts.every(p => store.open[p.id]);
      parts.forEach(p => setOpen(p.id, !allOpen));
      $('reveal-all').textContent = allOpen ? 'Show all answers' : 'Hide all answers';
      saveStore();
      updateScores();
    });

    $('reset').addEventListener('click', () => {
      if (!confirm('Clear all your answers and marks on this page?')) return;
      store.answers = {}; store.marks = {}; store.open = {};
      saveStore();
      document.querySelectorAll('textarea.attempt').forEach(t => { t.value = ''; });
      document.querySelectorAll('.mark-point input').forEach(cb => { cb.checked = false; });
      parts.forEach(p => setOpen(p.id, false));
      $('reveal-all').textContent = 'Show all answers';
      mountWidgets();
      updateScores();
      window.scrollTo({ top: 0 });
    });

    // Collapse the question menu on small screens once a question is picked.
    $('q-list').addEventListener('click', e => {
      if (e.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) $('q-menu').open = false;
    });

    // Highlight the question currently in view.
    const links = new Map(Array.from(document.querySelectorAll('.task[data-q]')).map(a => [a.dataset.q, a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) links.forEach((a, id) => a.classList.toggle('is-current', id === en.target.id)); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.q-card').forEach(c => io.observe(c));

    updateScores();
  }

  init();
})();
