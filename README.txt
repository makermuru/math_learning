# Jane's Math Lab

A small, installable web app for an iPad. The child-facing content is in English, with visual explanations and short practice questions.

## Put it online (free option: Netlify Drop)
1. On a computer, unzip `janes_math_lab.zip`.
2. Open https://app.netlify.com/drop in a browser.
3. Drag the whole `janes_math_lab` folder onto the page (not just `index.html`).
4. Netlify will publish it and give you a website address ending in `netlify.app`.
5. Open that address on Jane's iPad in **Safari**.
6. Tap Share (square with arrow) → **Add to Home Screen**.
7. If shown, turn on **Open as Web App**, then tap **Add**.

## Notes
- The site must be served over HTTPS for installation/offline caching. Netlify provides HTTPS.
- The first visit needs an internet connection. After the app has loaded once, the service worker caches the core files for offline use.
- If you update the files later, change the cache name in `sw.js` (for example, `janes-math-lab-v2`) so devices refresh the cached version.
- This is a static website; it does not collect or send Jane's answers anywhere.
