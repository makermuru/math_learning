# Jane’s Math Lab

An interactive Ontario Grade 3 maths practice app. It is a static web app (HTML, CSS and JavaScript) that works offline after the first visit and needs no account, backend or internet connection.

## What’s inside

| Topic | Core (Grade 3) | Extension |
| --- | --- | --- |
| 📏 Length | cm and m | mm and km |
| ⚖️ Mass | g and kg | converting between them |
| 🥛 Capacity | mL and L | converting between them |
| 🔢 Decimals | (to be confirmed against the curriculum) | tenths and hundredths |
| 🍕 Fractions | parts of a whole | equivalent fractions |
| ✖️ Multiplication | equal groups, facts 2–10 | factor pairs, reasoning |

Each topic has a **Learn** page (big idea, a common mix-up, a slider to play with, a worked example) and a **Practice** page with four levels:

1. Basic
2. Intermediate
3. Upper Intermediate
4. Advanced Challenge

Each question is labelled **Grade 3 core**, **Extension** or **Challenge**. Practice sessions have 10 questions. Timed practice (20 seconds per question) is optional. Wrong answers show the explanation, a “Watch out” note about a common mix-up, and an optional easier warm-up question.

Progress is stored in the browser’s `localStorage` on this device only. Mastery needs at least 15 questions, 80% accuracy, and proof on hard questions (Level 3 at 70%+, Level 4 at 60%+).

## Project structure

```
index.html          app shell
css/styles.css      styles (iPad-friendly, large touch targets)
js/content.js       lessons, visuals and question generators
js/storage.js       local progress and mastery rules
js/app.js           routing, lessons, practice, review, progress
sw.js               service worker (offline cache)
manifest.webmanifest
icons/              app icons
tests/validate.js   checks every generator (run with Node)
```

Questions are generated from templates, and every answer is calculated by code, not typed by hand. To add a topic, add a module object to `js/content.js` with four level functions, then run the validator.

## Run locally

Any static server works. Service workers need `http://localhost` or `https`, so do not open the file directly.

```bash
cd janes-math-lab
python3 -m http.server 8000
# open http://localhost:8000
```

Check the questions:

```bash
node tests/validate.js
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In **Settings → Pages**, choose the `main` branch and the root folder (`/`).
3. Open the Pages URL. All paths are relative, so the app also works in a subfolder such as `/janes-math-lab/`.

## Install on an iPad

1. Open the app link in **Safari**.
2. Tap the **Share** button, then **Add to Home Screen**.
3. Open it from the home screen. After the first visit, it works offline.

Note: the progress is kept on the iPad. Clearing Safari’s website data will erase it.

## Known limits

- Questions are template-based, so some repeat the same skill with different numbers.
- Curriculum alignment should be checked against the Ontario Grade 3 (2020) document before relying on it. The Decimals topic is labelled as extension until that is confirmed.
- Matching activities, drag-and-drop number lines and base-ten blocks are not built yet.
- Progress cannot be shared between devices.
