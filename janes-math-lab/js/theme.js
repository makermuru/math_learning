/* Theme: mode (Auto / Light / Dark) and accent colour, saved on this device only.
 * Auto follows the device setting. The attributes are set as early as possible to avoid a flash. */
(function () {
  const MODE_KEY = 'janesMathLab.theme';
  const ACCENT_KEY = 'janesMathLab.accent';
  const ORDER = ['auto', 'light', 'dark'];
  const LABEL = { auto: '🌓 Auto', light: '☀️ Light', dark: '🌙 Dark' };
  const DEFAULT_ACCENT = '#3f8fb8';

  function readMode() {
    try {
      const v = localStorage.getItem(MODE_KEY);
      return ORDER.includes(v) ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function readAccent() {
    try {
      const v = localStorage.getItem(ACCENT_KEY);
      return /^#[0-9a-f]{6}$/i.test(v || '') ? v : DEFAULT_ACCENT;
    } catch (e) {
      return DEFAULT_ACCENT;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage blocked: the choice still works for this visit.
    }
  }

  let mode = readMode();
  let accent = readAccent();

  // Soft tint of the accent colour, used for highlights and badges.
  function softOf(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function applyAccent() {
    const root = document.documentElement.style;
    root.setProperty('--accent', accent);
    root.setProperty('--accent-soft', softOf(accent, 0.16));
  }

  function applyMode() {
    const root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    const btn = document.getElementById('themeBtn');
    if (btn) {
      btn.textContent = LABEL[mode];
      btn.setAttribute('aria-label', `Colour mode: ${mode}. Tap to change.`);
    }
  }

  function setMode(next) {
    mode = ORDER.includes(next) ? next : 'auto';
    save(MODE_KEY, mode);
    applyMode();
  }

  function setAccent(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    accent = hex.toLowerCase();
    save(ACCENT_KEY, accent);
    applyAccent();
  }

  applyMode();
  applyAccent();

  window.Theme = {
    DEFAULT_ACCENT,
    mode: () => mode,
    accent: () => accent,
    setMode,
    setAccent,
    cycleMode: () => setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]),
  };


  document.addEventListener('DOMContentLoaded', () => {
    applyMode();
    applyAccent();
    const btn = document.getElementById('themeBtn');
    if (btn) btn.addEventListener('click', () => window.Theme.cycleMode());
  });
})();
