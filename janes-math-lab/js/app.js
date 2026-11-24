/* Jane's Math Lab — app: routing, lessons, practice sessions, review and progress. */
(function () {
  const C = window.Content;
  const S = window.Store;
  const root = document.getElementById('app');
  const byId = Object.fromEntries(C.MODULES.map((m) => [m.id, m]));
  const LEVEL_NAMES = { 1: 'Basic', 2: 'Intermediate', 3: 'Upper Intermediate', 4: 'Advanced Challenge' };
  const LEVEL_HINTS = {
    1: 'Fundamental ideas and simple calculations',
    2: 'Apply ideas on your own, with two steps',
    3: 'Multi-step and unfamiliar problems',
    4: 'Reasoning, reverse thinking and explaining',
  };
  const TIMED_SECONDS = 20;
  const QUESTIONS_PER_SESSION = 10;

  let session = null;
  let timerId = null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const randomId = () => Math.random().toString(36).slice(2, 10);
  const pickLevel = () => 1 + Math.floor(Math.random() * 4);
  const pickModule = () => C.MODULES[Math.floor(Math.random() * C.MODULES.length)];

  const TAG_LABELS = { core: 'Grade 3 core', extension: 'Extension', challenge: 'Challenge' };
  const tagBadge = (tag) => `<span class="tag ${tag}">${TAG_LABELS[tag] || 'Grade 3 core'}</span>`;

  function makeQuestion(moduleId, level) {
    const module = byId[moduleId];
    const q = module.levels[level - 1]();
    q.id = randomId();
    q.m = moduleId;
    q.lvl = level;
    q.tag = q.tag || (level === 4 ? 'challenge' : module.defaultTag || 'core');
    return q;
  }

  function answerText(q) {
    return q.kind === 'mc' ? q.choices[q.answer] : String(q.answer);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function view(html) {
    stopTimer();
    root.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* One question: renders it into `box` and calls onResult(ok) once answered or timed out. */
  function askQuestion(box, q, onResult) {
    let done = false;
    box.innerHTML =
      `<div class="qprompt">${esc(q.prompt)}</div>${q.visual || ''}` +
      `<div class="answers"></div><div class="fb" hidden></div>`;
    const answers = box.querySelector('.answers');
    const fb = box.querySelector('.fb');

    function finish(ok, timedOut) {
      if (done) return;
      done = true;
      stopTimer();
      box.querySelectorAll('button, input').forEach((el) => (el.disabled = true));
      fb.hidden = false;
      fb.className = 'fb ' + (ok ? 'good' : 'try');
      if (ok) {
        fb.innerHTML = `<b>That’s it! 🎉</b> ${esc(q.explain)}`;
      } else {
        const lead = timedOut ? 'Time is up!' : 'Good try!';
        const mistake = byId[q.m].misconception;
        fb.innerHTML =
          `<b>${lead}</b> The answer is <b>${esc(answerText(q))}</b>. ${esc(q.explain)}` +
          (mistake ? `<p class="misc"><b>Watch out:</b> a common mix-up is ${esc(mistake)}</p>` : '');
      }
      onResult(ok);
    }

    if (q.kind === 'mc') {
      q.choices.forEach((text, i) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.type = 'button';
        b.textContent = text;
        b.addEventListener('click', () => {
          if (done) return;
          b.classList.add(i === q.answer ? 'correct' : 'wrong');
          answers.children[q.answer].classList.add('correct');
          finish(i === q.answer, false);
        });
        answers.appendChild(b);
      });
    } else {
      answers.innerHTML =
        `<div class="numrow"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer">` +
        `<button type="button" class="primary check">Check</button></div>`;
      const input = answers.querySelector('input');
      const check = () => {
        if (done) return;
        const value = parseFloat(input.value.trim().replace(',', '.'));
        if (Number.isNaN(value)) {
          input.classList.add('shake');
          input.placeholder = 'Type a number';
          return;
        }
        finish(Math.abs(value - q.answer) < 0.0005, false);
      };
      answers.querySelector('.check').addEventListener('click', check);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
      setTimeout(() => input.focus(), 50);
    }

    return { timeout: () => finish(false, true) };
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const cards = C.MODULES.map((m) => {
      const mast = S.mastery(m.id);
      const lesson = S.state().lessons[m.id] ? ' · lesson ✓' : '';
      return `<article class="tile module">
        <div class="tile-emoji">${m.emoji}</div>
        <h2>${m.name}</h2>
        <p class="muted small">${esc(m.core)}</p>
        <span class="badge ${mast.key}">${mast.label}${lesson}</span>
        <div class="tile-actions">
          <a class="ghost" href="#/lesson/${m.id}">Learn</a>
          <a class="primary" href="#/practice/${m.id}">Practice</a>
        </div>
      </article>`;
    }).join('');
    const reviewCount = S.state().review.length;
    view(`
      <header class="hero">
        <h1>Jane’s Math Lab ✨</h1>
        <p class="muted">Learn the idea, play with it, then practise. Choose a topic to begin.</p>
      </header>
      <section class="grid">${cards}</section>
      <section class="grid extras">
        <a class="tile link" href="#/practice/mixed"><div class="tile-emoji">🎲</div><h2>Mixed practice</h2><p class="muted small">Topics mixed together</p></a>
        <a class="tile link" href="#/review"><div class="tile-emoji">🔁</div><h2>Review</h2><p class="muted small">${reviewCount} to revisit</p></a>
        <a class="tile link" href="#/progress"><div class="tile-emoji">📊</div><h2>My progress</h2><p class="muted small">Scores and mastery</p></a>
      </section>
      <p class="footer muted small">Works offline on this iPad. Progress is saved on this device only.</p>`);
  }

  /* ---------- Lesson ---------- */
  function renderLesson(id) {
    const m = byId[id];
    if (!m) return renderHome();
    const cards = m.cards.map((c) =>
      `<section class="card"><h2>${c.title}</h2><p>${c.text}</p>${c.visual || ''}</section>`).join('');
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a><span class="pill">${m.emoji} ${m.name}</span></nav>
      <h1>${m.name}</h1>
      <p class="muted small">${esc(m.core)}</p>
      <section class="card"><h2>1 · Big idea</h2></section>
      ${cards}
      <section class="card"><h2>Common mix-up</h2><p>Many students make this mistake: ${esc(m.misconception)}</p></section>
      <section class="card">
        <h2>2 · Play with it</h2>
        <p class="muted">${esc(m.interactive.label)}</p>
        <input id="slider" class="slider" type="range" min="${m.interactive.min}" max="${m.interactive.max}" step="${m.interactive.step}" value="${m.interactive.value}" aria-label="${esc(m.interactive.label)}">
        <div id="playout" class="playout"></div>
      </section>
      <section class="card">
        <h2>3 · Worked example</h2>
        <p>${m.example}</p>
      </section>
      <div class="actions">
        <a class="primary big-btn" id="toPractice" href="#/practice/${m.id}">4 · Practice ➜</a>
      </div>`);
    const slider = document.getElementById('slider');
    const out = document.getElementById('playout');
    const update = () => { out.innerHTML = m.interactive.render(Number(slider.value)); };
    slider.addEventListener('input', update);
    update();
    document.getElementById('toPractice').addEventListener('click', () => S.markLesson(id));
  }

  /* ---------- Practice ---------- */
  function renderPracticeSelect(id) {
    const isMixed = id === 'mixed';
    const m = byId[id];
    if (!isMixed && !m) return renderHome();
    const title = isMixed ? '🎲 Mixed practice' : `${m.emoji} ${m.name} practice`;
    const levelButtons = [1, 2, 3, 4].map((lvl) => {
      const st = isMixed ? null : S.levelStats(id)[lvl];
      const info = st && st.n ? `${Math.round((st.ok / st.n) * 100)}% correct over ${st.n}` : 'Not tried yet';
      return `<button class="level lvl${lvl}" data-lvl="${lvl}">
        <span class="lvl-num">Level ${lvl}</span>
        <b>${LEVEL_NAMES[lvl]}</b>
        <span class="muted small">${LEVEL_HINTS[lvl]}${isMixed ? '' : ' · ' + info}</span>
      </button>`;
    }).join('');
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
      <h1>${title}</h1>
      <p class="muted">Pick a level. Each session has ${QUESTIONS_PER_SESSION} questions.</p>
      <section class="levels">${levelButtons}</section>
      <label class="toggle"><input type="checkbox" id="timed"> Timed practice (${TIMED_SECONDS} seconds per question, optional)</label>
      ${isMixed ? '' : `<div class="actions"><a class="ghost" href="#/lesson/${id}">Back to the lesson</a></div>`}`);
    root.querySelectorAll('.level').forEach((btn) => {
      btn.addEventListener('click', () => {
        const timed = document.getElementById('timed').checked ? 1 : 0;
        go(`#/play/${id}/${btn.dataset.lvl}/${timed}`);
      });
    });
  }

  function startPractice(id, level, timed) {
    if (id !== 'mixed' && !byId[id]) return renderHome();
    session = {
      mixed: id === 'mixed',
      moduleId: id,
      level: id === 'mixed' ? null : level,
      timed,
      n: 0,
      score: 0,
      total: QUESTIONS_PER_SESSION,
      results: [],
    };
    nextQuestion();
  }

  function nextQuestion() {
    if (session.n >= session.total) return renderSummary();
    session.n++;
    const moduleId = session.mixed ? pickModule().id : session.moduleId;
    const level = session.mixed ? pickLevel() : session.level;
    renderPracticeQuestion(makeQuestion(moduleId, level));
  }

  function renderPracticeQuestion(q) {
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a>
        <span class="pill">${byId[q.m].emoji} ${byId[q.m].name} · Level ${q.lvl}</span></nav>
      <div>${tagBadge(q.tag)}</div>
      <div class="progressline"><span>Question ${session.n} of ${session.total}</span><span>⭐ ${session.score}</span></div>
      ${session.timed ? `<div class="timer" id="timer" aria-live="polite">${TIMED_SECONDS}</div>` : ''}
      <section class="card qbox" id="qbox"></section>
      <div id="after"></div>`);

    const box = document.getElementById('qbox');
    const after = document.getElementById('after');

    const handle = askQuestion(box, q, (ok) => {
      stopTimer();
      S.record(q.m, q.lvl, q, ok);
      session.results.push({ ok, m: q.m, lvl: q.lvl });
      if (ok) session.score++;
      const isLast = session.n >= session.total;
      after.innerHTML =
        `<div class="actions">` +
        (ok ? '' : `<button type="button" class="ghost" id="warm">Warm-up: an easier one</button>`) +
        `<button type="button" class="primary big-btn" id="next">${isLast ? 'See my score 🎉' : 'Next ➜'}</button></div>` +
        `<div id="warmbox"></div>`;
      document.getElementById('next').addEventListener('click', nextQuestion);
      const warm = document.getElementById('warm');
      if (warm) {
        warm.addEventListener('click', () => {
          const w = makeQuestion(q.m, 1);
          const wb = document.getElementById('warmbox');
          wb.innerHTML = `<section class="card warm"><p class="muted small">Warm-up · not counted in your score</p><div class="qbox2"></div></section>`;
          askQuestion(wb.querySelector('.qbox2'), w, () => {});
          warm.disabled = true;
        });
      }
    });

    if (session.timed) {
      let left = TIMED_SECONDS;
      const timerEl = document.getElementById('timer');
      timerId = setInterval(() => {
        left -= 1;
        timerEl.textContent = left;
        timerEl.classList.toggle('urgent', left <= 5);
        if (left <= 0) {
          stopTimer();
          handle.timeout();
        }
      }, 1000);
    }
  }

  function renderSummary() {
    const pct = Math.round((session.score / session.total) * 100);
    const message = pct >= 90 ? 'Amazing work! 🌟' : pct >= 70 ? 'Great job! 💙' : 'Good effort! Keep practising. 🌱';
    const topics = session.mixed
      ? ''
      : (() => {
          const mast = S.mastery(session.moduleId);
          return `<p>Topic status: <span class="badge ${mast.key}">${mast.label}</span></p>`;
        })();
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
      <section class="card hero">
        <h1>${message}</h1>
        <div class="big"><b>${session.score}</b> / ${session.total}</div>
        <p class="muted">${pct}% correct</p>
        ${topics}
      </section>
      <div class="actions">
        <button class="primary big-btn" id="again" type="button">Practise again</button>
        <a class="ghost big-btn" href="#/review">Review wrong answers</a>
        <a class="ghost big-btn" href="#/">Home</a>
      </div>`);
    document.getElementById('again').addEventListener('click', () => {
      startPractice(session.moduleId, session.level, session.timed);
    });
  }

  /* ---------- Review ---------- */
  function renderReview() {
    const items = S.state().review;
    if (!items.length) {
      return view(`
        <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
        <section class="card hero"><h1>Nothing to review 🎉</h1><p class="muted">Every question you tried is answered correctly. Keep going!</p></section>`);
    }
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
      <h1>Review</h1>
      <p class="muted">Try these again. A correct answer removes the question from this list.</p>
      <div id="reviewlist"></div>`);
    const list = document.getElementById('reviewlist');
    items.forEach((item) => {
      const card = document.createElement('section');
      card.className = 'card qbox';
      card.innerHTML = `<p class="muted small">${byId[item.m].emoji} ${byId[item.m].name} · Level ${item.lvl}</p>${tagBadge(item.q.tag)}<div class="qbox2"></div>`;
      list.appendChild(card);
      askQuestion(card.querySelector('.qbox2'), item.q, (ok) => S.record(item.m, item.lvl, item.q, ok));
    });
  }

  /* ---------- Progress ---------- */
  function renderProgress() {
    const st = S.state();
    const rows = C.MODULES.map((m) => {
      const mast = S.mastery(m.id);
      const s = S.levelStats(m.id);
      const levelCells = [1, 2, 3, 4].map((l) =>
        `<td>${s[l].n ? Math.round((s[l].ok / s[l].n) * 100) + '%' : '–'} <span class="muted small">(${s[l].n})</span></td>`).join('');
      const acc = mast.n ? Math.round(mast.acc * 100) + '%' : '–';
      return `<tr>
        <th>${m.emoji} ${m.name}</th>
        <td>${st.lessons[m.id] ? '✓' : '–'}</td>
        <td>${acc} <span class="muted small">(${mast.n})</span></td>
        ${levelCells}
        <td><span class="badge ${mast.key}">${mast.label}</span></td>
      </tr>`;
    }).join('');
    const totalAttempts = st.attempts.length;
    const totalOk = st.attempts.filter((a) => a.ok).length;
    const overall = totalAttempts ? Math.round((totalOk / totalAttempts) * 100) + '%' : '–';
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
      <h1>My progress</h1>
      <section class="card">
        <p>Questions tried: <b>${totalAttempts}</b> · Correct: <b>${totalOk}</b> · Accuracy: <b>${overall}</b></p>
        <p>Incorrect questions to review: <b>${st.review.length}</b></p>
      </section>
      <div class="table-wrap"><table class="progress">
        <thead><tr><th>Topic</th><th>Lesson</th><th>Accuracy</th>
          <th>L1</th><th>L2</th><th>L3</th><th>L4</th><th>Mastery</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="muted small">Mastery needs at least 15 questions, 80% accuracy, and proof on hard questions: Level 3 at 70% and Level 4 at 60%.</p>
      <div class="actions"><button type="button" class="ghost" id="reset">Reset progress</button></div>`);
    document.getElementById('reset').addEventListener('click', () => {
      if (confirm('Erase all progress saved on this device?')) {
        S.reset();
        renderProgress();
      }
    });
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    const T = window.Theme;
    const modeNames = { auto: 'Auto', light: 'Light', dark: 'Dark' };
    const modeButtons = ['auto', 'light', 'dark'].map((m) =>
      `<button type="button" class="opt${T.mode() === m ? ' on' : ''}" data-mode="${m}">${modeNames[m]}</button>`).join('');
    view(`
      <nav class="topbar"><a class="back" href="#/">← Home</a></nav>
      <h1>Settings</h1>
      <section class="card">
        <h2>Appearance</h2>
        <p class="muted">Mode: Auto follows this device’s setting.</p>
        <div class="seg-btns" id="modes">${modeButtons}</div>
        <label class="custom">
          <span class="custom-label">Accent color</span>
          <input type="color" id="customColor" value="${T.accent()}" aria-label="Accent color">
        </label>
        <div class="actions"><button type="button" class="ghost" id="resetColour">Reset color</button></div>
      </section>`);
    document.querySelectorAll('#modes .opt').forEach((b) => b.addEventListener('click', () => {
      T.setMode(b.dataset.mode);
      renderSettings();
    }));
    document.getElementById('customColor').addEventListener('input', (e) => T.setAccent(e.target.value));
    document.getElementById('resetColour').addEventListener('click', () => {
      T.setAccent(T.DEFAULT_ACCENT);
      renderSettings();
    });
  }

  /* ---------- Router ---------- */
  function route() {
    stopTimer();
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const [a, b, c, d] = parts;
    if (!a) return renderHome();
    if (a === 'settings') return renderSettings();
    if (a === 'lesson') return renderLesson(b);
    if (a === 'practice') return renderPracticeSelect(b);
    if (a === 'play') return startPractice(b, Number(c), d === '1');
    if (a === 'review') return renderReview();
    if (a === 'progress') return renderProgress();
    renderHome();
  }

  window.addEventListener('hashchange', route);
  route();
})();
