"use strict";

/* ============================================================
   1. 공통 유틸 · 수학 엔진
   ============================================================ */
const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function digitsOf(v) {
  return Math.abs(Math.trunc(v)).toString().split('').reverse().map(Number);
}
function pad(arr, len) {
  if (arr.length >= len) return arr;
  return [...arr, ...new Array(len - arr.length).fill(0)];
}
function applyOp(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? null : Math.round((a / b) * 1000) / 1000;
  return null;
}
function normalizeRational(n, d) {
  if (!d) return null;
  if (d < 0) { n = -n; d = -d; }
  const factor = gcd(Math.abs(n), d) || 1;
  return { n: n / factor, d: d / factor };
}
function parseRational(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const fraction = text.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) {
    const d = Number(fraction[2]);
    if (!d) return null;
    return normalizeRational(Number(fraction[1]), d);
  }
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  const decimals = (text.split('.')[1] || '').length;
  const denominator = 10 ** Math.min(decimals, 6);
  return normalizeRational(Math.round(value * denominator), denominator);
}
function rationalValue(r) { return r ? r.n / r.d : null; }
function rationalText(r) {
  if (!r) return '계산할 수 없어요';
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`;
}
function exactFractionResult(aRaw, bRaw, op) {
  const a = parseRational(aRaw), b = parseRational(bRaw);
  if (!a || !b) return null;
  if (op === '+') return normalizeRational(a.n * b.d + b.n * a.d, a.d * b.d);
  if (op === '-') return normalizeRational(a.n * b.d - b.n * a.d, a.d * b.d);
  if (op === '×') return normalizeRational(a.n * b.n, a.d * b.d);
  if (op === '÷' && b.n !== 0) return normalizeRational(a.n * b.d, a.d * b.n);
  return null;
}
function hasFractionInput(raw) { return String(raw || '').includes('/'); }
function displayNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  return String(Number(value.toFixed(6)));
}
function divideInfo(a, b) {
  if (b === 0) return null;
  return { q: Math.floor(a / b), r: a % b };
}
function buildVertical(a, b, op) {
  const columns = Math.max(digitsOf(a).length, digitsOf(b).length, 1);
  const topDigits = pad(digitsOf(a), columns);
  const bottomDigits = pad(digitsOf(b), columns);
  const resultValue = applyOp(a, b, op);
  const layout = {
    topDigits, bottomDigits, resultDigits: [],
    carries: new Array(columns + 1).fill(null),
    borrowMarks: new Array(columns).fill(false),
    topCrossOut: new Array(columns).fill(null),
    topReduced: [...topDigits],
    partialRows: [], negativeFallback: false,
  };
  if (resultValue === null) return layout;
  if (op === '-' && resultValue < 0) { layout.negativeFallback = true; return layout; }
  layout.resultDigits = digitsOf(Math.trunc(resultValue));
  if (op === '+') {
    let carry = 0;
    for (let i = 0; i < columns; i++) {
      const sum = topDigits[i] + bottomDigits[i] + carry;
      const next = Math.floor(sum / 10);
      if (next > 0) layout.carries[i + 1] = next;
      carry = next;
    }
  }
  if (op === '-') {
    const borrowIn = new Array(columns + 1).fill(false);
    for (let i = 0; i < columns; i++) {
      const lent = borrowIn[i] ? 1 : 0;
      const available = topDigits[i] - lent;
      if (available < bottomDigits[i]) {
        borrowIn[i + 1] = true;
        layout.borrowMarks[i] = true;
        layout.topCrossOut[i] = topDigits[i];
        layout.topReduced[i] = topDigits[i] + 10 - lent;
      } else {
        layout.topReduced[i] = available;
      }
    }
  }
  if (op === '×') {
    const md = digitsOf(b);
    const rows = [];
    md.forEach((d, idx) => {
      if (d === 0) return;
      const rv = a * d * 10 ** idx;
      rows.push({ digits: pad(digitsOf(rv), idx + 1), label: `${a} × ${d * 10 ** idx}` });
    });
    layout.partialRows = rows.length > 1 ? rows : [];
  }
  return layout;
}
function gcd(x, y) { return y === 0 ? x : gcd(y, x % y); }
function simplify(f) {
  if (f.n === 0) return { n: 0, d: f.d };
  const g = gcd(Math.abs(f.n), f.d);
  return { n: f.n / g, d: f.d / g };
}
function totalOf(p) { return p.hundreds * 100 + p.tens * 10 + p.units; }
function partsFromValue(v) {
  const c = clamp(Math.trunc(v), 0, 999);
  return { hundreds: Math.floor(c / 100), tens: Math.floor((c % 100) / 10), units: c % 10 };
}

/* ---------- 한국어 수 읽기 ---------- */
const ONES = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
function countWord(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  const n = Math.trunc(Math.abs(Number(value)));
  const sign = Number(value) < 0 ? '마이너스 ' : '';
  if (n >= 1000) return sign + sinoWord(n);
  if (n < 10) return sign + ONES[n];
  if (n < 20) return sign + (n === 10 ? '열' : `열${ONES[n % 10]}`);
  if (n < 100) return sign + `${TENS[Math.floor(n / 10)]}${n % 10 ? ONES[n % 10] : ''}`;
  const h = Math.floor(n / 100), rest = n % 100;
  const hw = h === 1 ? '백' : `${ONES[h]}백`;
  return sign + (rest === 0 ? hw : `${hw} ${countWord(rest)}`);
}
function sinoWord(value) {
  const n = Math.trunc(Math.abs(Number(value)));
  if (n === 0) return '영';
  if (n < 10000) {
    const th = Math.floor(n / 1000);
    const h = Math.floor((n % 1000) / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let out = '';
    if (th) out += th === 1 ? '천' : `${SINO[th]}천`;
    if (h) out += h === 1 ? '백' : `${SINO[h]}백`;
    if (t) out += t === 1 ? '십' : `${SINO[t]}십`;
    if (o) out += SINO[o];
    return out || '영';
  }
  if (n < 100000000) {
    const man = Math.floor(n / 10000);
    const rest = n % 10000;
    return `${man === 1 ? '일' : sinoWord(man)}만${rest ? ` ${sinoWord(rest)}` : ''}`;
  }
  return String(n);
}
function lastHangulHasBatchim(text) {
  if (!text) return false;
  const code = text.charCodeAt(text.length - 1);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}
function topicParticle(value) {
  return lastHangulHasBatchim(countWord(value)) ? '은' : '는';
}
function subjectParticle(value) {
  return lastHangulHasBatchim(countWord(value)) ? '이' : '가';
}
function opWord(op) {
  return op === '+' ? '더하기' : op === '-' ? '빼기' : op === '×' ? '곱하기' : op === '÷' ? '나누기' : '';
}
function opLongWord(op) {
  return op === '+' ? '더하면' : op === '-' ? '빼면' : op === '×' ? '곱하면' : op === '÷' ? '나누면' : '';
}
function resultText(a, op, b, result) {
  if (result === null) return '나눌 수 없음';
  if (op === '÷') {
    const d = divideInfo(a, b);
    if (!d) return '나눌 수 없음';
    return d.r === 0 ? String(d.q) : `${d.q} … ${d.r}`;
  }
  return String(result);
}
function expressionWord(raw, value) {
  if (String(raw).includes('/')) return String(raw).replace('/', '분의 ');
  if (String(raw).includes('.')) return `${raw} (소수)`;
  return `${raw} (${countWord(value)})`;
}
function calcSpeech(first, op, second, result) {
  if (op === '÷') {
    const d = divideInfo(first, second);
    if (!d) return '0으로는 나눌 수 없어요';
    return `${countWord(first)} 나누기 ${countWord(second)}${topicParticle(second)} ${countWord(d.q)}${d.r ? `이고 ${countWord(d.r)}${subjectParticle(d.r)} 남아요` : ''}`;
  }
  return `${countWord(first)} ${opWord(op)} ${countWord(second)}${topicParticle(second)} ${countWord(result)}`;
}

/* ---------- 음성 & 합성 효과음 ---------- */
let mathAC = null;
function playMathTone(freq, dur = 0.14, type = 'sine', vol = 0.045, delay = 0) {
  try {
    mathAC = mathAC || new (window.AudioContext || window.webkitAudioContext)();
    if (mathAC.state === 'suspended') mathAC.resume();
    const t = mathAC.currentTime + delay;
    const o = mathAC.createOscillator();
    const g = mathAC.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(mathAC.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) { /* 오디오 미지원 환경 무시 */ }
}

function playMathSfx(kind) {
  if (state && state.settings && state.settings.lowStim) {
    if (kind === 'correct') playMathTone(523.25, 0.16, 'sine', 0.028);
    return;
  }
  if (kind === 'tap') {
    playMathTone(540, 0.07, 'sine', 0.032);
  } else if (kind === 'place') {
    playMathTone(440, 0.08, 'triangle', 0.04);
    playMathTone(660, 0.09, 'sine', 0.028, 0.04);
  } else if (kind === 'correct') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      playMathTone(f, 0.22, 'sine', 0.05, i * 0.085);
      playMathTone(f * 1.5, 0.15, 'triangle', 0.018, i * 0.085 + 0.015);
    });
  } else if (kind === 'guided') {
    playMathTone(523.25, 0.14, 'sine', 0.042);
    playMathTone(659.25, 0.18, 'sine', 0.04, 0.09);
  } else if (kind === 'hint') {
    playMathTone(392, 0.12, 'sine', 0.036);
    playMathTone(329.63, 0.16, 'sine', 0.032, 0.08);
  }
}

function speak(text) {
  if (!state.voice || !text) return;
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.9;
    u.pitch = 1.04;
    speechSynthesis.speak(u);
  } catch (e) { /* 음성 미지원 환경 무시 */ }
}

