const map = {
  'A': 'σ', 'a': 'σ', 'B': '£', 'b': '£', 'C': 'Ǝ', 'c': 'Ǝ', 'Ç': 'ǝ', 'ç': 'ǝ', 'D': '₳', 'd': '₳', 'E': 'ε', 'e': 'ε', 
  'F': '╛', 'f': '╛', 'G': 'Γ', 'g': 'Γ', 'H': 'µ', 'h': 'µ', 'I': '∩', 'i': '∩', 'J': '⌠', 'j': '⌠', 'K': '≡', 'k': '≡', 
  'L': 'Œ', 'l': 'Œ', 'M': 'β', 'm': 'β', 'N': 'þ', 'n': 'þ', 'Ñ': 'Þ', 'ñ': 'Þ', 'O': '⌐', 'o': '⌐', 'P': 'Æ', 'p': 'Æ', 
  'Q': '¶', 'q': '¶', 'R': 'Ω', 'r': 'Ω', 'S': 'Φ', 's': 'Φ', 'T': '╪', 't': '╪', 'U': '↨', 'u': '↨', 'V': 'ǂ', 'v': 'ǂ', 
  'W': 'w', 'w': 'w', 'X': '⋛', 'x': '⋛', 'Y': '¥', 'y': '¥', 'Z': '√', 'z': '√', 
  '1': '●', '2': '▬', '3': '▲', '4': '■', '5': '▱', '6': '◈', '7': '▩', '8': '▣', '9': '▶', '0': '◀'
};

const inverseMap = Object.fromEntries(
  Object.entries(map).map(([k, v]) => [v, k.toLowerCase()])
);

const latinText = document.getElementById("latin");
const symbolText = document.getElementById("latex");
const zalgoRange = document.getElementById('zalgoRange');
const removeZalgoCheckbox = document.getElementById('removeZalgoCheckbox');
const latinCountEl = document.getElementById('latinCount');
const latexCountEl = document.getElementById('latexCount');

function updateCounter(el, count) {
  if (!el) return;
  el.textContent = count;
  el.classList.remove('count-warning', 'count-danger', 'count-normal');
  if (count >= 4000) el.classList.add('count-danger');
  else if (count >= 2000) el.classList.add('count-warning');
  else el.classList.add('count-normal');
}

function updateAllCounts() {
  if (latinCountEl) updateCounter(latinCountEl, Array.from(latinText.value).length);
  if (latexCountEl) updateCounter(latexCountEl, Array.from(symbolText.value).length);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function translateText(text, activeMap) {
  return Array.from(text).map(ch => {
    if (activeMap[ch] !== undefined) return activeMap[ch];
    const base = ch.normalize && ch.normalize('NFD')
      ? ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : ch;
    if (activeMap[base] !== undefined) return activeMap[base];
    if (activeMap[base.toLowerCase()] !== undefined) return activeMap[base.toLowerCase()];
    if (activeMap[base.toUpperCase()] !== undefined) return activeMap[base.toUpperCase()];
    return ch;
  }).join('');
}

function stripZalgoMarks(str) {
  return str.replace(/[\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\ufe20-\ufe2f]/g, '');
}

function applyZalgo(text, intensity) {
  const i = Number(intensity) || 0;
  if (i <= 0) return text;

  const up = ['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307'];
  const mid = ['\u0334','\u0335','\u0336','\u0315','\u031b','\u0340','\u0341','\u0358','\u0321','\u0322'];
  const down = ['\u0316','\u0317','\u0318','\u0319','\u031c','\u0320','\u0323','\u0324','\u0325','\u0326','\u0327'];

  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  return Array.from(text).map(ch => {
    if (ch.trim() === '') return ch;
    let result = ch;
    const max = Math.max(1, Math.round(i));
    const upCount = Math.floor(Math.random() * (max + 1));
    const midCount = Math.floor(Math.random() * (Math.ceil(max/2) + 1));
    const downCount = Math.floor(Math.random() * (max + 1));

    for (let u = 0; u < upCount; u++) result += pick(up);
    for (let m = 0; m < midCount; m++) result += pick(mid);
    for (let d = 0; d < downCount; d++) result += pick(down);

    return result;
  }).join('');
}

function translateSymbolsToLatin(text) {
  const clusterRe = /(.)([\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\ufe20-\ufe2f]*)/gu;
  let out = '';
  let m;
  while ((m = clusterRe.exec(text)) !== null) {
    const base = m[1];
    const marks = m[2] || '';
    const mapped = inverseMap[base] !== undefined ? inverseMap[base] : base;
    if (removeZalgoCheckbox && !removeZalgoCheckbox.checked) {
      out += mapped + marks;
    } else {
      out += mapped;
    }
  }
  return out;
}

function setupLinks() {
  let lockedLT = false;
  let lockedSL = false;

  function updateLatinToSymbol() {
    if (lockedLT) return;
    lockedLT = true;
    const translated = translateText(latinText.value, map);
    const withZalgo = applyZalgo(translated, zalgoRange ? zalgoRange.value : 0);
    symbolText.value = withZalgo;
    updateAllCounts();
    lockedLT = false;
  }

  function updateSymbolToLatin() {
    if (lockedSL) return;
    lockedSL = true;
    const translated = translateSymbolsToLatin(symbolText.value);
    latinText.value = translated;
    updateAllCounts();
    lockedSL = false;
  }

  latinText.addEventListener('input', updateLatinToSymbol);
  latinText.addEventListener('input', () => {
    if (latinCountEl) updateCounter(latinCountEl, Array.from(latinText.value).length);
  });
  if (zalgoRange) zalgoRange.addEventListener('input', updateLatinToSymbol);

  symbolText.addEventListener('input', updateSymbolToLatin);
  symbolText.addEventListener('input', () => {
    if (latexCountEl) updateCounter(latexCountEl, Array.from(symbolText.value).length);
  });
  if (removeZalgoCheckbox) removeZalgoCheckbox.addEventListener('change', updateSymbolToLatin);

  updateLatinToSymbol();
  updateAllCounts();
}

function syncScroll(a, b) {
  a.addEventListener('scroll', () => b.scrollTop = a.scrollTop);
  b.addEventListener('scroll', () => a.scrollTop = b.scrollTop);
}

setupLinks();
syncScroll(latinText, symbolText);

document.querySelectorAll(".button[data-target]").forEach(btn => {
  const originalText = btn.textContent;
  let timeoutId;

  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const textarea = document.getElementById(targetId);

    if (!textarea) return;

    navigator.clipboard.writeText(textarea.value)
      .then(() => {
        clearTimeout(timeoutId);
        btn.textContent = "[ ✔ ]";
        timeoutId = setTimeout(() => btn.textContent = originalText, 1200);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        btn.textContent = "[ ERROR ]";
        timeoutId = setTimeout(() => btn.textContent = originalText, 1200);
      });
  });
});