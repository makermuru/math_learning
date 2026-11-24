/* Local progress storage. Everything stays on this device (localStorage). No accounts, no network. */
(function () {
  const KEY = 'janesMathLab.v1';
  const MAX_ATTEMPTS = 3000;

  function blank() {
    return { attempts: [], review: [], lessons: {} };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
    } catch (e) {
      return blank(); // storage blocked or corrupted: start fresh for this visit
    }
  }

  let state = load();

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Storage unavailable (private window). The app still works for this visit.
    }
  }

  function record(moduleId, level, question, ok) {
    state.attempts.push({ m: moduleId, lvl: level, ok: !!ok, t: Date.now() });
    if (state.attempts.length > MAX_ATTEMPTS) state.attempts.splice(0, state.attempts.length - MAX_ATTEMPTS);
    if (ok) {
      state.review = state.review.filter((r) => r.q.id !== question.id);
    } else if (!state.review.some((r) => r.q.id === question.id)) {
      state.review.push({ m: moduleId, lvl: level, q: question });
    }
    persist();
  }

  function markLesson(moduleId) {
    state.lessons[moduleId] = true;
    persist();
  }

  function levelStats(moduleId) {
    const s = { 1: { n: 0, ok: 0 }, 2: { n: 0, ok: 0 }, 3: { n: 0, ok: 0 }, 4: { n: 0, ok: 0 } };
    for (const a of state.attempts) {
      if (a.m === moduleId) {
        s[a.lvl].n++;
        if (a.ok) s[a.lvl].ok++;
      }
    }
    return s;
  }

  /* Mastery needs volume AND hard questions. Easy-only answers can never reach "Mastered". */
  function mastery(moduleId) {
    const s = levelStats(moduleId);
    const n = [1, 2, 3, 4].reduce((t, l) => t + s[l].n, 0);
    const ok = [1, 2, 3, 4].reduce((t, l) => t + s[l].ok, 0);
    const acc = n ? ok / n : 0;
    const a3 = s[3].n ? s[3].ok / s[3].n : 0;
    const a4 = s[4].n ? s[4].ok / s[4].n : 0;
    if (n < 15) return { key: 'early', label: 'Keep going', n, acc };
    if (acc >= 0.8 && s[3].n >= 4 && a3 >= 0.7 && s[4].n >= 3 && a4 >= 0.6) {
      return { key: 'mastered', label: 'Mastered ⭐', n, acc };
    }
    if (acc >= 0.6) return { key: 'almost', label: 'Getting there', n, acc };
    return { key: 'practice', label: 'Needs practice', n, acc };
  }

  function reset() {
    state = blank();
    persist();
  }

  window.Store = {
    state: () => state,
    record,
    markLesson,
    levelStats,
    mastery,
    reset,
  };
})();
