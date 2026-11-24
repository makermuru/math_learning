/* Jane's Math Lab — content: lessons, visuals and question generators.
 * Every generator computes its own answer, so answers are correct by construction.
 * tests/validate.js checks the output (uniqueness, valid choices, no NaN, variety).
 * Levels: 1 Basic · 2 Intermediate · 3 Upper Intermediate · 4 Advanced Challenge.
 * Ontario Grade 3 core topics are marked in each module; extension topics are noted in the lesson. */
(function () {
  const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const round = (x) => Math.round(x * 1000) / 1000;
  const ext = (q) => ({ ...q, tag: 'extension' });

  function num(prompt, answer, explain, visual) {
    return { kind: 'num', prompt, answer: round(answer), explain, visual: visual || '' };
  }
  function mc(prompt, correct, wrong, explain, visual) {
    const choices = shuffle([correct, ...wrong]);
    return { kind: 'mc', prompt, choices, answer: choices.indexOf(correct), explain, visual: visual || '' };
  }

  /* ---------- Visual helpers (return HTML strings) ---------- */
  const bar = (parts, shaded) =>
    `<div class="fbar" role="img" aria-label="${shaded} of ${parts} equal parts shaded">` +
    Array.from({ length: parts }, (_, i) => `<span class="seg${i < shaded ? ' on' : ''}"></span>`).join('') +
    `</div>`;
  const ruler = (cm, max) =>
    `<div class="ruler" role="img" aria-label="${cm} centimetres long">` +
    `<div class="ruler-fill" style="width:${Math.min(100, (cm / max) * 100)}%"></div>` +
    `<span class="ruler-label">${cm} cm</span></div>`;
  const jug = (ml, max) =>
    `<div class="jug"><div class="water" style="height:${Math.min(100, (ml / max) * 100)}%"></div>` +
    `<span class="jug-label">${ml} mL</span></div>`;
  const grid100 = (n) =>
    `<div class="grid100" role="img" aria-label="${n} of 100 squares shaded">` +
    Array.from({ length: 100 }, (_, i) => `<span class="${i < n ? 'on' : ''}"></span>`).join('') +
    `</div>`;
  const dots = (rows, cols) =>
    `<div class="dots" style="grid-template-columns:repeat(${cols},1fr)" role="img" aria-label="${rows} rows of ${cols}">` +
    Array.from({ length: rows * cols }, () => '<span></span>').join('') +
    `</div>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const simplify = (n, d) => {
    if (n === 0) return '0';
    if (n === d) return '1 whole';
    const g = gcd(n, d);
    return `${n / g}/${d / g}`;
  };

  /* ---------- LENGTH (core: cm, m; extension: mm, km) ---------- */
  const length = {
    id: 'length', name: 'Length', emoji: '📏', core: 'Core: cm and m · Extension: mm and km',
    misconception: 'thinking 1 m is only 10 cm (it is 100 cm), or that 750 cm is 750 m. Ask: "Is this unit bigger or smaller than a metre?"',
    cards: [
      { title: 'Metres and centimetres', text: 'Length can be measured in millimetres (mm), centimetres (cm), metres (m) and kilometres (km). Think of it like money: 100 cents make 1 dollar, and 100 cm make 1 metre.', visual: ruler(100, 100) },
      { title: '1 m = 100 cm', text: 'A metre stick has 100 centimetre marks, so 1 m = 100 cm. A door is about 2 m tall, which is about 200 cm. Also 1 cm = 10 mm (extension).' },
      { title: '1 km = 1,000 m (extension)', text: 'A kilometre is 1,000 metres. A walk to the park might be about 1 km. Kilometres are for long distances, like the distance between two towns.' },
    ],
    interactive: {
      label: 'Slide to choose a length in centimetres.', min: 0, max: 500, step: 5, value: 250,
      render: (v) => `${ruler(v, 500)}<p class="big"><b>${v} cm</b> = <b>${round(v / 100)} m</b> = <b>${v * 10} mm</b></p>`,
    },
    example: '750 cm = 750 ÷ 100 = <b>7.5 m</b>. Dividing by 100 moves the decimal point two places to the left.',
    levels: [
      () => {
        if (Math.random() < 0.5) {
          const m = int(2, 25);
          return num(`How many centimetres is ${m} metres?`, m * 100, `1 m = 100 cm. ${m} × 100 = ${m * 100} cm.`);
        }
        const cm = int(2, 40);
        return ext(num(`How many millimetres is ${cm} centimetres?`, cm * 10, `1 cm = 10 mm. ${cm} × 10 = ${cm * 10} mm.`));
      },
      () => {
        if (Math.random() < 0.5) {
          const m = int(1, 4);
          const cm = m * 100 + (Math.random() < 0.5 ? -1 : 1) * int(5, 60);
          const a = `${m} m`, b = `${cm} cm`;
          const longer = cm > m * 100 ? b : a;
          const shorter = cm > m * 100 ? a : b;
          return mc(`Which is longer: ${a} or ${b}?`, longer, [shorter],
            `${m} m = ${m * 100} cm, so ${longer} is longer.`);
        }
        const cm = int(1, 40) * 10;
        return num(`${cm} cm is how many metres?`, cm / 100, `100 cm = 1 m, so ${cm} ÷ 100 = ${round(cm / 100)} m.`);
      },
      () => {
        if (Math.random() < 0.5) {
          const m = int(2, 5), cut = int(1, 9) * 5;
          return num(`A rope is ${m} m long. Mia cuts off ${cut} cm. How many centimetres are left?`,
            m * 100 - cut, `${m} m = ${m * 100} cm. ${m * 100} − ${cut} = ${m * 100 - cut} cm.`);
        }
        // Reasoning: compare a total against a need, using two steps and no keyword shortcut.
        const pieces = int(2, 4), each = int(5, 12) * 10;
        const total = pieces * each;
        let need = int(3, 6) * 100 + (Math.random() < 0.5 ? -1 : 1) * int(1, 9) * 10;
        if (need === total) need += 10;
        const enough = total >= need;
        return mc(`Ruby needs at least ${need} cm of string for a craft. She has ${pieces} pieces, each ${each} cm long. Does she have enough?`,
          enough ? 'Yes, she has enough' : 'No, she does not have enough',
          [enough ? 'No, she does not have enough' : 'Yes, she has enough'],
          `First find the total: ${pieces} × ${each} = ${total} cm. Then compare: ${total} cm is ${enough ? 'at least' : 'less than'} ${need} cm.`);
      },
      () => {
        const n = int(3, 6), p = int(10, 40), r = int(1, 9) * 10;
        const total = n * p + r;
        return num(`Liam cut a ribbon into ${n} equal pieces, each ${p} cm long. ${r} cm of ribbon is left over. How long was the whole ribbon, in metres?`,
          total / 100, `${n} × ${p} = ${n * p} cm. Add the leftover: ${n * p} + ${r} = ${total} cm. ${total} cm = ${round(total / 100)} m.`);
      },
    ],
  };

  /* ---------- MASS (core: g, kg; extension: converting) ---------- */
  const mass = {
    id: 'mass', name: 'Mass', emoji: '⚖️', core: 'Core: g and kg · Extension: converting between them',
    misconception: 'thinking 1 kg is 100 g (it is 1,000 g), or that a bigger number of grams is always lighter. Ask: "Is 1 kg more or fewer than 100 g?"',
    cards: [
      { title: 'Grams and kilograms', text: 'Grams (g) measure small things, like a paperclip (about 1 g). Kilograms (kg) measure heavy things, like a bag of rice (about 1 kg). Always check which unit a label uses before you compare.' },
      { title: '1 kg = 1,000 g', text: '1,000 g makes 1 kg. So 2 kg = 2,000 g. A bag of 500 g is half a kilogram, or 0.5 kg.' },
    ],
    interactive: {
      label: 'Slide to choose a mass in grams.', min: 0, max: 5000, step: 50, value: 1500,
      render: (v) => `<p class="big"><b>${v} g</b> = <b>${round(v / 1000)} kg</b></p>`,
    },
    example: '2,350 g = 2,350 ÷ 1,000 = <b>2.35 kg</b>. A bag of 1,000 g is the same as 1 kg.',
    levels: [
      () => {
        if (Math.random() < 0.5) {
          const a = int(1, 30);
          return num(`How many grams is ${a} kg?`, a * 1000, `1 kg = 1,000 g. ${a} × 1,000 = ${a * 1000} g.`);
        }
        const a = int(1, 30);
        return num(`${(a * 1000).toLocaleString('en-CA')} g is how many kilograms?`, a,
          `1,000 g = 1 kg. ${(a * 1000).toLocaleString('en-CA')} ÷ 1,000 = ${a} kg.`);
      },
      () => {
        if (Math.random() < 0.5) {
          const a = int(1, 4);
          const g = a * 1000 + (Math.random() < 0.5 ? -1 : 1) * int(1, 40) * 50;
          const kg = `${a} kg`, gg = `${g} g`;
          const heavier = g > a * 1000 ? gg : kg;
          const lighter = g > a * 1000 ? kg : gg;
          return mc(`Which is heavier: ${kg} or ${gg}?`, heavier, [lighter],
            `${a} kg = ${a * 1000} g, so ${heavier} is heavier.`);
        }
        const g = int(1, 99) * 50;
        return num(`${g} g is how many kilograms?`, g / 1000, `1,000 g = 1 kg, so ${g} ÷ 1,000 = ${round(g / 1000)} kg.`);
      },
      () => {
        if (Math.random() < 0.5) {
          const a = int(1, 3), b = int(1, 9) * 50, c = int(1, 9) * 50;
          const total = a * 1000 + b + c;
          return num(`A bag has ${a} kg ${b} g of rice. Ali adds ${c} g more. How many grams is the total?`,
            total, `${a} kg ${b} g = ${a * 1000 + b} g. Add ${c} g: ${a * 1000 + b} + ${c} = ${total} g.`);
        }
        // Reasoning: a claim about a weight must be checked after converting units.
        const a = int(1, 3), b = int(1, 9) * 50;
        const weight = a * 1000 + b;
        const claim = weight + (Math.random() < 0.5 ? -1 : 1) * int(1, 9) * 50;
        const correct = weight > claim ? 'Yes, Mia is correct' : 'No, Mia is not correct';
        const wrong = weight > claim ? 'No, Mia is not correct' : 'Yes, Mia is correct';
        return mc(`A parcel weighs ${a} kg ${b} g. Mia says it is heavier than ${claim} g. Is she correct?`, correct, [wrong],
          `Convert first: ${a} kg ${b} g = ${weight} g. ${weight} g is ${weight > claim ? 'more' : 'less'} than ${claim} g.`);
      },
      () => {
        const total = int(15, 30) * 100, e = int(2, 9) * 50;
        return num(`A basket of apples weighs ${round(total / 1000)} kg altogether. The empty basket weighs ${e} g. How many grams do the apples weigh?`,
          total - e, `${round(total / 1000)} kg = ${total} g. ${total} − ${e} = ${total - e} g.`);
      },
    ],
  };

  /* ---------- CAPACITY (core: mL, L; extension: converting) ---------- */
  const capacity = {
    id: 'capacity', name: 'Capacity', emoji: '🥛', core: 'Core: mL and L · Extension: converting between them',
    misconception: 'thinking 1 L is 100 mL (it is 1,000 mL), or that a wide container always holds more. Ask: "How many small cups would fill this?"',
    cards: [
      { title: 'Millilitres and litres', text: 'A spoon holds about 5 mL. A large milk jug holds about 1 L. Millilitres (mL) measure small amounts, and litres (L) measure big amounts. Capacity is how much a container can hold.', visual: jug(500, 1000) },
      { title: '1 L = 1,000 mL', text: 'To change litres into millilitres, multiply by 1,000. To change millilitres into litres, divide by 1,000.' },
    ],
    interactive: {
      label: 'Slide to fill the measuring jug.', min: 0, max: 2000, step: 50, value: 500,
      render: (v) => `${jug(v, 2000)}<p class="big"><b>${v} mL</b> = <b>${round(v / 1000)} L</b></p>`,
    },
    example: '3 L = 3 × 1,000 = <b>3,000 mL</b>. Then 3,000 − 450 = 2,550 mL left after pouring 450 mL.',
    levels: [
      () => {
        if (Math.random() < 0.5) {
          const a = int(1, 30);
          return num(`How many millilitres is ${a} L?`, a * 1000, `1 L = 1,000 mL. ${a} × 1,000 = ${a * 1000} mL.`);
        }
        const a = int(1, 30);
        return num(`${(a * 1000).toLocaleString('en-CA')} mL is how many litres?`, a,
          `1,000 mL = 1 L. ${(a * 1000).toLocaleString('en-CA')} ÷ 1,000 = ${a} L.`);
      },
      () => {
        if (Math.random() < 0.5) {
          const a = int(1, 4);
          const ml = a * 1000 + (Math.random() < 0.5 ? -1 : 1) * int(1, 40) * 50;
          const L = `${a} L`, M = `${ml} mL`;
          const more = ml > a * 1000 ? M : L;
          const less = ml > a * 1000 ? L : M;
          return mc(`Which holds more: ${L} or ${M}?`, more, [less],
            `${a} L = ${a * 1000} mL, so ${more} holds more.`);
        }
        const ml = int(1, 40) * 50;
        return num(`${ml} mL is how many litres?`, ml / 1000, `1,000 mL = 1 L, so ${ml} ÷ 1,000 = ${round(ml / 1000)} L.`);
      },
      () => {
        const a = int(1, 3), b = int(1, 9) * 50, c = int(1, 9) * 50;
        const total = a * 1000 + b + c;
        return num(`A bottle has ${a} L ${b} mL of water. Ben pours in ${c} mL more. How many millilitres is the total?`,
          total, `${a} L ${b} mL = ${a * 1000 + b} mL. Add ${c} mL: ${total} mL.`);
      },
      () => {
        const n = int(2, 5), per = int(2, 9) * 50, r = int(1, 9) * 10;
        const total = n * per + r;
        return num(`A jug had ${total} mL of juice. Sara poured ${n} equal cups, and ${r} mL was left. How many millilitres were in each cup?`,
          per, `(${total} − ${r}) ÷ ${n} = ${per} mL.`);
      },
    ],
  };

  /* ---------- DECIMALS (core: tenths, hundredths; extension: decimal number lines) ---------- */
  const decimals = {
    id: 'decimals', name: 'Decimals', emoji: '🔢', core: 'Extension: decimals (check your school’s Grade 3 expectations)', defaultTag: 'extension',
    misconception: 'thinking 0.65 is bigger than 0.7 because 65 is bigger than 7, or that a longer decimal is always bigger. Compare the tenths first, then the hundredths.',
    cards: [
      { title: 'Tenths and hundredths', text: 'A whole can be split into 10 equal tenths, or 100 equal hundredths. 0.7 is 7 tenths. 0.07 is 7 hundredths. Think of money: $0.70 is 70 cents, which is 7 dimes.', visual: grid100(70) },
      { title: '0.5 and 0.50 are equal', text: 'A zero at the end of a decimal does not change its value: 0.5 = 0.50. Both mean half of one whole.' },
    ],
    interactive: {
      label: 'Slide to shade hundredths.', min: 0, max: 100, step: 1, value: 75,
      render: (v) => `${grid100(v)}<p class="big"><b>${v < 100 ? '0.' + String(v).padStart(2, '0') : '1.00'}</b> = ${v} hundredths</p>`,
    },
    example: 'In 3.47, the 4 is in the tenths place and the 7 is in the hundredths place.',
    levels: [
      () => {
        const d = int(1, 9), t = int(0, 9), h = int(0, 9);
        if (Math.random() < 0.5) {
          return num(`In the number ${d}.${t}${h}, what digit is in the tenths place?`, t,
            `The first digit after the decimal point is in the tenths place. The tenths digit is ${t}.`);
        }
        return num(`In the number ${d}.${t}${h}, what digit is in the hundredths place?`, h,
          `The second digit after the decimal point is in the hundredths place. The hundredths digit is ${h}.`);
      },
      () => {
        if (Math.random() < 0.5) {
          const a = int(100, 999), b = int(100, 999);
          if (a === b) return mc('Which is equal to 0.5?', '0.50', ['0.05', '0.005'], '0.5 and 0.50 are equal. Adding a zero at the end does not change the value.');
          const big = (Math.max(a, b) / 100).toFixed(2), small = (Math.min(a, b) / 100).toFixed(2);
          return mc(`Which decimal is bigger: ${(a / 100).toFixed(2)} or ${(b / 100).toFixed(2)}?`, big, [small],
            `Compare the tenths first. If they match, compare the hundredths. ${big} is bigger.`);
        }
        return mc('Which is equal to 0.5?', '0.50', ['0.05', '0.005'], '0.5 and 0.50 are equal. Adding a zero at the end does not change the value.');
      },
      () => {
        const a = int(10, 499) / 100, b = int(10, 499) / 100;
        return num(`What is ${a.toFixed(2)} + ${b.toFixed(2)}?`, a + b,
          `Line up the decimal points and add: ${a.toFixed(2)} + ${b.toFixed(2)} = ${round(a + b)}.`);
      },
      () => {
        const s = int(100, 400) / 100, b = int(10, 90) / 100;
        return num(`What number, plus ${b.toFixed(2)}, makes ${s.toFixed(2)}?`, s - b,
          `${s.toFixed(2)} − ${b.toFixed(2)} = ${round(s - b)}. Check: ${round(s - b)} + ${b.toFixed(2)} = ${s.toFixed(2)}.`);
      },
    ],
  };

  /* ---------- FRACTIONS (core: halves, thirds, quarters; extension: equivalent fractions) ---------- */
  const fractions = {
    id: 'fractions', name: 'Fractions', emoji: '🍕', core: 'Core: parts of a whole · Extension: equivalent fractions',
    misconception: 'thinking a bigger bottom number means a bigger fraction (1/8 is smaller than 1/4, because the pizza is cut into more pieces). Ask: "Are the pieces bigger or smaller?"',
    cards: [
      { title: 'Parts of a whole', text: 'Think of a pizza cut into equal slices. The bottom number (denominator) says how many equal parts there are. The top number (numerator) says how many are shaded or eaten.', visual: bar(4, 3) + '<p class="caption">3 of 4 parts shaded = 3/4</p>' },
      { title: 'Equal fractions', text: '1/2 = 2/4 = 4/8. Multiply the top and bottom by the same number to make an equal fraction.', visual: bar(4, 2) + '<p class="caption">2/4 = 1/2</p>' },
    ],
    interactive: {
      label: 'Slide to shade eighths of a bar.', min: 0, max: 8, step: 1, value: 3,
      render: (v) => `${bar(8, v)}<p class="big"><b>${v}/8</b> = <b>${simplify(v, 8)}</b></p>`,
    },
    example: 'What is 3/4 of 8? Split 8 into 4 equal parts: each part is 2. Three of those parts make 2 + 2 + 2 = <b>6</b>.',
    levels: [
      () => {
        const n = pick([2, 3, 4, 6, 8]), k = int(1, n - 1);
        const correct = `${k}/${n}`;
        const candidates = [`${n - k}/${n}`, `${k}/${n + 1}`, `${k + 1}/${n}`, `${n}/${k}`];
        const wrong = [...new Set(candidates.filter((c) => c !== correct))].slice(0, 3);
        return mc('What fraction of the bar is shaded?', correct, wrong,
          `There are ${n} equal parts and ${k} are shaded, so the fraction is ${k}/${n}.`, bar(n, k));
      },
      () => {
        const d = pick([3, 4, 5, 6, 8]);
        let a = int(1, d - 1), b = int(1, d - 1);
        if (a === b) b = (a % (d - 1)) + 1;
        const big = Math.max(a, b), small = Math.min(a, b);
        return mc('Which fraction is greater?', `${big}/${d}`, [`${small}/${d}`],
          `Both fractions have ${d} equal parts, so the one with more shaded parts is greater.`,
          bar(d, a) + bar(d, b));
      },
      () => {
        if (Math.random() < 0.5) {
          const d1 = pick([2, 3, 4]), m = pick([2, 3, 4]), n1 = int(1, d1 - 1);
          return ext(num(`${n1}/${d1} = ?/${d1 * m}`, n1 * m,
            `Multiply the top and bottom by ${m}: ${n1} × ${m} = ${n1 * m}, and ${d1} × ${m} = ${d1 * m}.`));
        }
        // Reasoning: which part is bigger, when pieces are different sizes?
        let d1, d2, a, b, left, right;
        do {
          d1 = pick([4, 6, 8]); d2 = pick([2, 3]);
          a = int(1, d1 - 1); b = int(1, d2 - 1);
          left = a / d1; right = b / d2;
        } while (left === right);
        const bigger = left > right ? `${a}/${d1}` : `${b}/${d2}`;
        const smaller = left > right ? `${b}/${d2}` : `${a}/${d1}`;
        return mc(`Which is more of a pizza: ${a}/${d1} or ${b}/${d2}?`, bigger, [smaller],
          `Compare the sizes: ${a}/${d1} = ${round(left)} and ${b}/${d2} = ${round(right)} of a pizza. The bigger one is ${bigger}.`);
      },
      () => {
        const b = pick([2, 3, 4, 5, 6, 7, 8]), a = int(1, b - 1), k = int(2, 5);
        return ext(num(`A fraction equal to ${a}/${b} has a denominator of ${b * k}. What is its numerator?`, a * k,
          `Multiply the top and bottom by ${k}: ${a} × ${k} = ${a * k}, and ${b} × ${k} = ${b * k}.`));
      },
    ],
  };

  /* ---------- MULTIPLICATION (core: equal groups, facts 2–10; extension: missing factors) ---------- */
  const multiplication = {
    id: 'multiplication', name: 'Multiplication', emoji: '✖️', core: 'Core: equal groups, facts 2–10 · Extension: factor pairs',
    misconception: 'adding instead of multiplying (3 × 4 means 3 groups of 4, which is 12, not 3 + 4 = 7). Ask: "How many equal groups are there, and how many in each?"',
    cards: [
      { title: 'Equal groups', text: '3 groups of 4 is 3 × 4 = 12. Count the dots in the array below. Each row is one equal group.', visual: dots(3, 4) },
      { title: 'Missing numbers', text: 'If ? × 5 = 20, then ? = 4, because 4 × 5 = 20. Multiplication and division are linked.' },
    ],
    interactive: {
      label: 'Slide to add rows of 5.', min: 1, max: 10, step: 1, value: 3,
      render: (v) => `${dots(v, 5)}<p class="big">${v} rows of 5 = <b>${v * 5}</b></p>`,
    },
    example: '6 × 7 = 6 groups of 7 = 7 + 7 + 7 + 7 + 7 + 7 = <b>42</b>. Use a fact you know to help: 6 × 7 = 5 × 7 + 7 = 35 + 7.',
    levels: [
      () => {
        const a = int(2, 10), b = int(2, 10);
        return num(`${a} × ${b} = ?`, a * b, `${a} groups of ${b} is ${a} × ${b} = ${a * b}.`);
      },
      () => {
        const g = int(2, 9), p = int(2, 9);
        return num(`There are ${g} bags. Each bag has ${p} apples. How many apples are there altogether?`, g * p,
          `${g} equal groups of ${p}: ${g} × ${p} = ${g * p} apples.`, dots(g, p));
      },
      () => {
        const branch = int(0, 2);
        if (branch === 0) {
          const x = int(2, 10), b = int(3, 9);
          return num(`? × ${b} = ${x * b}`, x, `Think: what number times ${b} is ${x * b}? ${x} × ${b} = ${x * b}, so ? = ${x}.`);
        }
        if (branch === 1) {
          const g = int(3, 6), p = int(3, 9), give = int(1, g * p - 1);
          return num(`A box has ${g} packs of ${p} crayons. ${give} crayons are given away. How many crayons are left?`,
            g * p - give, `${g} × ${p} = ${g * p} crayons. ${g * p} − ${give} = ${g * p - give} crayons left.`);
        }
        // Two steps with a hidden step: total first, then the giveaways (each friend gets the same amount).
        const g = int(3, 5), p = int(4, 8), f = int(2, 3), x = int(2, 3);
        return num(`Sam has ${g} bags with ${p} marbles in each bag. He gives ${x} marbles to each of ${f} friends. How many marbles does Sam have left?`,
          g * p - f * x,
          `Step 1: ${g} × ${p} = ${g * p} marbles in total. Step 2: ${f} × ${x} = ${f * x} marbles given away. ${g * p} − ${f * x} = ${g * p - f * x} left.`);
      },
      () => {
        if (Math.random() < 0.5) {
          // Reasoning: check someone else's claim and justify it.
          const a = int(3, 9), b = int(3, 9);
          const offset = pick([-1, 1, -2, 2, a, -a]);
          const claimed = a * b + offset;
          const correct = claimed === a * b;
          const yes = 'Yes, Ben is correct', no = 'No, Ben is not correct';
          return mc(`Ben says ${a} × ${b} = ${claimed}. Is he correct?`, correct ? yes : no, [correct ? no : yes],
            `${a} × ${b} = ${a * b}. Ben’s answer ${claimed} is ${correct ? 'the same' : 'different'}, so he is ${correct ? 'correct' : 'not correct'}.`);
        }
        let N, pairs;
        do {
          N = int(12, 80);
          pairs = [];
          for (let a = 2; a * a <= N; a++) if (N % a === 0) pairs.push(`${a} × ${N / a}`);
        } while (pairs.length < 2);
        return num(`How many different ways can you write ${N} as a × b, where a and b are whole numbers bigger than 1 and a ≤ b?`,
          pairs.length, `The ways are ${pairs.join(', ')}. That is ${pairs.length} ways.`);
      },
    ],
  };

  window.Content = {
    MODULES: [length, mass, capacity, decimals, fractions, multiplication],
  };
})();
