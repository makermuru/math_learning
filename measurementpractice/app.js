const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ---------- Theme (dark / light) ---------- */

const THEME_KEY = 'theme';
const themeToggle = $('#themeToggle');

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Storage can be blocked (private window); the toggle still works for this visit.
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(readSavedTheme() || (systemPrefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
});

/* ---------- Tabs ---------- */

const TABS = ['distance', 'decimals', 'concepts', 'practice'];

$$('nav button').forEach((button) => {
  button.addEventListener('click', () => {
    $$('nav button').forEach((b) => b.classList.toggle('active', b === button));
    TABS.forEach((id) => $('#' + id).classList.toggle('hide', id !== button.dataset.tab));
  });
});

/* ---------- Distance ---------- */

const slider = $('#distanceSlider');
const chips = $$('.chip');

function updateDistance(value) {
  const metres = Number(value);
  const km = metres / 1000;
  const left = 1000 - metres;
  const formatted = metres.toLocaleString();

  $('#metres').textContent = formatted + ' m';
  $('#kilometres').textContent = km.toFixed(2) + ' km';
  $('#sliderValue').textContent = formatted + ' metres';
  $('#distanceSentence').innerHTML =
    `${formatted} metres is ${formatted} out of 1,000 metres. That is <b>${km.toFixed(2)} of a kilometre</b>.`;

  const filled = $('#filled');
  const remaining = $('#remaining');
  filled.style.width = metres / 10 + '%';
  remaining.style.width = left / 10 + '%';
  filled.textContent = metres >= 100 ? metres + ' m' : '';
  remaining.textContent = left >= 100 ? left + ' m' : '';

  chips.forEach((chip) => chip.classList.toggle('selected', Number(chip.dataset.value) === metres));
}

slider.addEventListener('input', (event) => updateDistance(event.target.value));

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    slider.value = chip.dataset.value;
    updateDistance(slider.value);
  });
});

updateDistance(slider.value);

/* ---------- Decimals: hundred-square ---------- */

const SHADED_SQUARES = 75;
const grid = $('#hundredGrid');

for (let i = 0; i < 100; i++) {
  const square = document.createElement('div');
  if (i < SHADED_SQUARES) square.classList.add('shaded');
  grid.appendChild(square);
}

/* ---------- Practice: one question at a time, loaded from questions.json ---------- */

const quizRoot = $('#quiz');
let questions = [];
let currentIndex = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderQuestion() {
  const question = questions[currentIndex];
  quizRoot.replaceChildren();

  quizRoot.appendChild(el('div', 'quiz-progress', `Question ${currentIndex + 1} of ${questions.length}`));
  quizRoot.appendChild(el('b', 'quiz-question', question.q));

  const answers = el('div', 'answers');
  const feedback = el('div', 'feedback hide');
  const nextButton = el('button', 'next hide', currentIndex < questions.length - 1 ? 'Next →' : 'Finish 🎉');
  let answered = false;

  const buttons = question.answers.map((text, answerIndex) => {
    const button = el('button', 'answer', text);
    button.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      buttons.forEach((b) => (b.disabled = true));
      const isCorrect = answerIndex === question.correct;

      if (isCorrect) {
        button.classList.add('correct');
        feedback.className = 'feedback good';
        feedback.textContent = 'That’s it! 💙 ' + question.why;
      } else {
        button.classList.add('wrong');
        buttons[question.correct].classList.add('correct');
        feedback.className = 'feedback try';
        feedback.textContent =
          `Good try! The correct answer is ${question.answers[question.correct]}. ${question.why}`;
      }

      nextButton.classList.remove('hide');
    });
    answers.appendChild(button);
    return button;
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      renderFinished();
    }
  });

  quizRoot.appendChild(answers);
  quizRoot.appendChild(feedback);
  quizRoot.appendChild(nextButton);
}

function renderFinished() {
  quizRoot.replaceChildren();
  quizRoot.appendChild(el('b', 'quiz-question', 'You finished the mini challenge! ⭐'));

  const restart = el('button', 'next', 'Start again');
  restart.addEventListener('click', () => {
    currentIndex = 0;
    renderQuestion();
  });
  quizRoot.appendChild(restart);
}

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('No questions found');
    return data.questions;
  } catch (error) {
    console.error('Could not load questions.json:', error);
    return null;
  }
}

loadQuestions().then((loaded) => {
  if (!loaded) {
    quizRoot.replaceChildren(el('div', 'feedback try', 'Sorry, the questions could not be loaded right now.'));
    return;
  }
  questions = loaded;
  renderQuestion();
});

/* ---------- Service worker ---------- */

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
