"use strict";

/* ============================================================
   특수교육 지원 엔진
   - 시각적 일정 · 먼저-다음 · 칭찬 별 · 프롬프트 위계
   - 오류 없는 학습 · 기다림 시간 · 데이터 수집
   ============================================================ */
function loadSupportSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) Object.assign(state.settings, JSON.parse(raw));
    const sess = localStorage.getItem(SESSION_KEY);
    if (sess) {
      const parsed = JSON.parse(sess);
      if (parsed && typeof parsed === 'object') Object.assign(state.session, parsed);
      if (!Array.isArray(state.session.log)) state.session.log = [];
    }
  } catch (e) { /* 저장 불가 환경 무시 */ }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) state.settings.motion = true;
  state.settings.tokenMax = clamp(Number(state.settings.tokenMax) || 5, 3, 10);
  state.settings.wait = [0, 5, 8, 12].includes(Number(state.settings.wait)) ? Number(state.settings.wait) : 8;
}
function saveSupportSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch (e) { /* 무시 */ }
  if (window.D1Bridge) window.D1Bridge.setKV(SETTINGS_KEY, state.settings);
}
function saveSession() {
  try {
    const slim = { ...state.session, log: state.session.log.slice(0, 120) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(slim));
    if (window.D1Bridge) window.D1Bridge.setKV(SESSION_KEY, slim);
  } catch (e) { /* 무시 */ }
}
function applySettings() {
  const s = state.settings;
  document.body.classList.toggle('text-large', s.textSize === 'large');
  document.body.classList.toggle('text-xlarge', s.textSize === 'xlarge');
  document.body.classList.toggle('big-touch', s.touch === 'big');
  document.body.classList.toggle('reduce-motion', Boolean(s.motion));
  document.body.classList.toggle('high-contrast', Boolean(s.contrast));
  document.body.classList.toggle('easy-read', Boolean(s.easy));
  const set = (id, value) => { const el = $(id); if (el) el.value = value; };
  const check = (id, value) => { const el = $(id); if (el) el.checked = Boolean(value); };
  set('setTextSize', s.textSize);
  set('setTouch', s.touch);
  set('setWait', String(s.wait));
  set('setTokens', String(s.tokenMax));
  check('setMotion', s.motion);
  check('setContrast', s.contrast);
  check('setEasy', s.easy);
  check('setErrorless', s.errorless);
  check('setHaptic', s.haptic);
  updateTokenBoard();
  renderPromptMeter();
}
function announce(text) {
  if (!text) return;
  const live = $('liveRegion');
  if (live) live.textContent = text;
  speak(text);
}
function haptic(ms) {
  if (!state.settings.haptic) return;
  try { if (navigator.vibrate) navigator.vibrate(ms || 18); } catch (e) { /* 무시 */ }
}
function updateTokenBoard() {
  const wrap = $('tokenDots');
  if (!wrap) return;
  const max = state.settings.tokenMax;
  wrap.innerHTML = Array.from({ length: max }, (_, i) =>
    `<span class="token-dot${i < state.tokens ? ' on' : ''}" aria-label="${i < state.tokens ? '별을 모았어요' : '빈 별'}">${i < state.tokens ? '★' : ''}</span>`).join('');
}
function awardToken(message) {
  const max = state.settings.tokenMax;
  if (state.tokens >= max) return;
  state.tokens += 1;
  updateTokenBoard();
  haptic(22);
  announce(message || '잘했어요! 칭찬 별 하나를 모았어요.');
  if (state.tokens >= max) {
    setTimeout(() => {
      if (state.tokens >= max) openReward();
    }, 650);
  }
}
function recordTrial(outcome, promptLevel, detail) {
  const level = promptLevel === undefined ? state.promptLevel : promptLevel;
  state.session.trials += 1;
  if (outcome === 'independent') state.session.independent += 1;
  else if (outcome === 'prompted') state.session.prompted += 1;
  else if (outcome === 'error') state.session.errors += 1;
  state.session.log.unshift({
    at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    stage: currentStage() ? `${currentStage().id}단계 ${currentStage().short}` : '',
    outcome,
    prompt: ['독립', '시각 힌트', '언어 힌트', '모방', '신체적 도움'][level] || '독립',
    detail: detail || '',
  });
  state.session.log = state.session.log.slice(0, 120);
  saveSession();
  if (window.D1Bridge) {
    const stageLabel = currentStage() ? `${currentStage().id}단계 ${currentStage().short}` : '';
    window.D1Bridge.saveRecord({
      game: 'stepmath',
      stage: stageLabel,
      score: state.session.independent,
      summary: `${outcome} · ${detail || '활동 시도'} (누적 스스로 ${state.session.independent}/${state.session.trials})`,
      payload: { outcome, promptLevel: level, detail: detail || '', trials: state.session.trials, independent: state.session.independent },
    });
  }
  const note = $('progressNote');
  if (note) {
    const total = state.session.trials;
    const ok = state.session.independent;
    note.innerHTML = `오늘 <b>${total}번</b> 해 보았어요 · 스스로 <b>${ok}번</b> · 도움 받고 <b>${state.session.prompted}번</b> · 다시 해 볼 것 <b>${state.session.errors}번</b>`;
  }
}
function renderPromptMeter() {
  const meter = $('promptMeter');
  if (!meter) return;
  const labels = ['스스로', '보고', '듣고', '같이', '도움'];
  meter.innerHTML = `<span class="prompt-pill${state.promptLevel === 0 ? ' on' : ''}">도움 수준</span>` +
    labels.map((l, i) => `<span class="prompt-pill${state.promptLevel === i ? ' on' : ''}">${i === 0 ? '0 · ' : ''}${l}</span>`).join('');
}
function renderTeacher() {
  const sum = $('teacherSummary');
  if (!sum) return;
  const s = state.session;
  const rate = s.trials ? Math.round((s.independent / s.trials) * 100) : 0;
  sum.innerHTML = `
    <div class="ts-card"><b>${s.trials}</b><span>전체 시도</span></div>
    <div class="ts-card"><b>${s.independent}</b><span>스스로 성공</span></div>
    <div class="ts-card"><b>${s.prompted}</b><span>도움 받고 성공</span></div>
    <div class="ts-card"><b>${rate}%</b><span>독립 수행률</span></div>`;
  const tbody = $('teacherLog');
  if (tbody) {
    tbody.innerHTML = s.log.length
      ? s.log.map((r) => `<tr><td>${r.at}</td><td>${r.stage}</td><td>${r.outcome === 'independent' ? '스스로' : r.outcome === 'prompted' ? '도움' : r.outcome === 'error' ? '다시' : '완료'}</td><td>${r.prompt}</td><td>${r.detail || ''}</td></tr>`).join('')
      : '<tr><td colspan="5" style="color:#64748b">아직 기록이 없어요. 활동을 하면 자동으로 쌓여요.</td></tr>';
  }
  const note = $('teacherNote');
  if (note) note.textContent = `시작: ${new Date(s.started || Date.now()).toLocaleString('ko-KR')}`;
}
function downloadCSV() {
  const rows = [['시간', '단계', '결과', '도움 수준', '내용']];
  state.session.log.forEach((r) => rows.push([r.at, r.stage, r.outcome, r.prompt, r.detail || '']));
  const csv = '\ufeff' + rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stepmath-기록-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  announce('기록을 CSV 파일로 저장했어요.');
}
function setView(view) {
  state.view = view === 'calc' ? 'calc' : 'activity';
  const app = $('app');
  if (app) app.dataset.view = state.view;
  $('viewActivityBtn')?.classList.toggle('on', state.view === 'activity');
  $('viewCalcBtn')?.classList.toggle('on', state.view === 'calc');
  $('viewActivityBtn')?.setAttribute('aria-selected', state.view === 'activity' ? 'true' : 'false');
  $('viewCalcBtn')?.setAttribute('aria-selected', state.view === 'calc' ? 'true' : 'false');
  if (state.view === 'activity') setTimeout(() => $('toolCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

/* ---------- 터치·마우스 드래그 공통 엔진 ---------- */
function makeDragGhost(el) {
  const rect = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  ghost.classList.add('drag-ghost');
  ghost.style.width = `${Math.max(rect.width, 42)}px`;
  ghost.style.height = `${Math.max(rect.height, 42)}px`;
  ghost.style.transform = `translate(${rect.left + rect.width / 2}px,${rect.top + rect.height / 2}px) translate(-50%,-50%)`;
  document.body.appendChild(ghost);
  return ghost;
}
function bindDrag(root, selector, payloadFn, onDrop, opts) {
  const options = opts || {};
  root.querySelectorAll(selector).forEach((el) => {
    if (el.dataset.dragBound === '1') return;
    el.dataset.dragBound = '1';
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      if (el.disabled) return;
      const payload = payloadFn(el, ev);
      if (payload === false || payload === null || payload === undefined) return;
      startDrag(ev, el, payload, onDrop, options);
    });
    if (options.onActivate) {
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          const payload = payloadFn(el, ev);
          if (payload !== false && payload !== null && payload !== undefined) options.onActivate(payload, el);
        }
      });
    }
  });
}
let dragClickGuard = false;
document.addEventListener('click', (e) => {
  if (!dragClickGuard) return;
  e.preventDefault();
  e.stopPropagation();
}, true);
function startDrag(ev, el, payload, onDrop, opts) {
  const startX = ev.clientX;
  const startY = ev.clientY;
  const pointerId = ev.pointerId;
  let ghost = null;
  let moved = false;
  let hot = null;
  let lastEvent = ev;
  try { el.setPointerCapture(pointerId); } catch (e) { /* 무시 */ }
  const clearHot = () => {
    if (hot) hot.classList.remove('drop-hot');
    hot = null;
  };
  const onMove = (e) => {
    if (e.pointerId !== pointerId) return;
    lastEvent = e;
    if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < (opts.threshold || 8)) return;
    if (!moved) {
      moved = true;
      document.body.classList.add('is-dragging');
      ghost = makeDragGhost(el);
      el.classList.add('drag-source-active');
      if (opts.onStart) opts.onStart(payload, el);
      haptic(10);
    }
    e.preventDefault();
    ghost.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const zone = under ? under.closest(opts.zoneSelector || '[data-drop]') : null;
    if (hot !== zone) {
      clearHot();
      hot = zone;
      if (hot) hot.classList.add('drop-hot');
    }
  };
  const onUp = (e) => {
    if (e.pointerId !== pointerId) return;
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    try { el.releasePointerCapture(pointerId); } catch (err) { /* 무시 */ }
    const dropZone = hot;
    if (ghost) ghost.remove();
    document.body.classList.remove('is-dragging');
    el.classList.remove('drag-source-active');
    clearHot();
    if (moved) {
      dragClickGuard = true;
      setTimeout(() => { dragClickGuard = false; }, 300);
      if (onDrop) onDrop(payload, dropZone, el, e);
    } else if (opts.onTap) {
      opts.onTap(payload, el, e);
    }
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}
function clearHintTargets(root) {
  (root || document).querySelectorAll('.hint-target').forEach((el) => el.classList.remove('hint-target'));
}
function showHintTarget(selector, root) {
  const scope = root || document;
  clearHintTargets(scope);
  const el = scope.querySelector(selector);
  if (el) {
    el.classList.add('hint-target');
    if (!document.body.classList.contains('is-dragging')) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* 무시 */ }
    }
  }
  return el;
}
function scheduleAutoHint() {
  if (autoHintTimer) clearTimeout(autoHintTimer);
  if (!state.settings.wait) return;
  autoHintTimer = setTimeout(() => {
    if ($('app').hidden || $('helpDialog').open || $('settingsDialog').open) return;
    if (state.view !== 'activity') return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    giveHint(true);
  }, state.settings.wait * 1000);
}
function noteInteraction() {
  state.lastInteraction = Date.now();
  scheduleAutoHint();
}

/* ---------- 기록 (localStorage 전용) ---------- */
const HISTORY_KEY = 'stepmath.single.history.v1';
function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, 12) : [];
  } catch (e) { return []; }
}
function writeHistory() {
  try {
    const sliced = state.history.slice(0, 12);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sliced));
    if (window.D1Bridge) window.D1Bridge.setKV(HISTORY_KEY, sliced);
  } catch (e) { /* 저장 불가 환경 무시 */ }
}
function pushHistory(first, op, second, result, rawFirst, rawSecond, displayResult) {
  const item = {
    id: Date.now() + Math.random(),
    first, op, second, result,
    inputA: rawFirst ?? String(first), inputB: rawSecond ?? String(second),
    displayResult: displayResult ?? displayNumber(result),
    at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    steps: (String(rawFirst).includes('/') || String(rawSecond).includes('/') || String(rawFirst).includes('.') || String(rawSecond).includes('.'))
      ? [`① ${rawFirst}와 ${rawSecond}를 그림이나 수직선으로 살펴봐요.`, `② ${rawFirst} ${op} ${rawSecond} = ${displayResult}`]
      : explainSteps(first, second, op),
  };
  state.history = [item, ...state.history.filter((h) => !((h.inputA ?? String(h.first)) === item.inputA && h.op === op && (h.inputB ?? String(h.second)) === item.inputB))].slice(0, 12);
  writeHistory();
}

/* ---------- 계산 상태 ---------- */
function activeCalc() {
  const hasFirst = state.expr.first !== '';
  const hasSecond = state.expr.second !== '';
  const first = hasFirst ? rationalValue(parseRational(state.expr.first)) : null;
  const second = hasSecond ? rationalValue(parseRational(state.expr.second)) : null;
  const op = state.expr.operator;
  const result = first !== null && op && second !== null ? applyOp(first, second, op) : null;
  const exactResult = first !== null && op && second !== null && (hasFractionInput(state.expr.first) || hasFractionInput(state.expr.second))
    ? exactFractionResult(state.expr.first, state.expr.second, op)
    : null;
  const resultText = exactResult ? rationalText(exactResult) : (result === null ? null : displayNumber(result));
  return { first, op, second, result, exactResult, resultText, rawFirst: state.expr.first, rawSecond: state.expr.second };
}
function syncPartsFromExpr() {
  const { first, second, result } = activeCalc();
  if (result !== null && result >= 0) state.parts = partsFromValue(result);
  else if (second !== null) state.parts = partsFromValue(second);
  else if (first !== null) state.parts = partsFromValue(first);
  else state.parts = { units: 0, tens: 0, hundreds: 0 };
}
function currentTheme() {
  return ITEMS.find((it) => it.id === state.itemTheme) || ITEMS[0];
}
function currentStage() {
  return STAGES.find((s) => s.id === state.stage) || STAGES[3];
}

/* ============================================================
   3. 계산기 액션
   ============================================================ */
function stopAnim() {
  if (animTimer) { clearInterval(animTimer); animTimer = null; }
  if (countTimer) { clearInterval(countTimer); countTimer = null; }
  state.anim.playing = false;
  state.anim.shown = Infinity;
  state.countPlay.idx = -1;
}
function stopSpeech() {
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
}

function pressDigit(d) {
  stopAnim();
  if (state.resultVisible && state.expr.operator && state.expr.second !== '') {
    state.expr = { first: '', operator: null, second: '' };
    state.resultVisible = false;
  }
  const isFirst = state.expr.operator === null;
  const target = isFirst ? state.expr.first : state.expr.second;
  const next = (target === '0' ? '' : target) + d;
  if (next.length > 9) return;
  if (isFirst) state.expr.first = next;
  else state.expr.second = next;
  syncPartsFromExpr();
  speak(countWord(Number(next)));
  render();
}

function appendNumberMark(mark) {
  stopAnim();
  if (state.resultVisible && state.expr.operator && state.expr.second !== '') {
    state.expr = { first: '', operator: null, second: '' };
    state.resultVisible = false;
  }
  const isFirst = state.expr.operator === null;
  let target = isFirst ? state.expr.first : state.expr.second;
  if (!target && mark === '.') target = '0';
  if (!target || target.length >= 9) return;
  if (mark === '.' && (target.includes('.') || target.includes('/'))) return;
  if (mark === '/' && (target.includes('/') || target.includes('.'))) return;
  if (mark === '/' && !/^\d+$/.test(target)) return;
  if (mark === '.' && !/^\d+$/.test(target)) return;
  const next = target + mark;
  if (isFirst) state.expr.first = next;
  else state.expr.second = next;
  state.resultVisible = false;
  syncPartsFromExpr();
  render();
}

function pressOperator(op) {
  stopAnim();
  if (!state.expr.first) state.expr.first = '0';
  state.expr.operator = op;
  state.resultVisible = false;
  syncPartsFromExpr();
  speak(opWord(op));
  render();
}

function pressBackspace() {
  stopAnim();
  if (state.expr.second !== '') state.expr.second = state.expr.second.slice(0, -1);
  else if (state.expr.operator !== null) state.expr.operator = null;
  else if (state.expr.first !== '') state.expr.first = state.expr.first.slice(0, -1);
  state.resultVisible = false;
  syncPartsFromExpr();
  render();
}

function pressEquals() {
  stopAnim();
  const { first, op, second, result } = activeCalc();
  if (first === null || !op || second === null) {
    speak('먼저 숫자와 연산 기호를 눌러 주세요');
    return;
  }
  if (result === null) {
    speak('0으로는 나눌 수 없어요');
    return;
  }
  state.resultVisible = true;
  syncPartsFromExpr();
  const exact = exactFractionResult(state.expr.first, state.expr.second, op);
  const isFraction = hasFractionInput(state.expr.first) || hasFractionInput(state.expr.second);
  const isDecimal = String(state.expr.first).includes('.') || String(state.expr.second).includes('.');
  const shownResult = isFraction ? rationalText(exact) : displayNumber(result);
  pushHistory(first, op, second, result, state.expr.first, state.expr.second, shownResult);
  speak(isFraction
    ? `${state.expr.first} ${opWord(op)} ${state.expr.second}는 ${rationalText(exact)}예요`
    : isDecimal
      ? `${state.expr.first} ${opWord(op)} ${state.expr.second}는 ${displayNumber(result)}예요`
      : calcSpeech(first, op, second, result));
  render();
  if ((op === '+' || op === '-') && !hasFractionInput(state.expr.first) && !hasFractionInput(state.expr.second) && !String(state.expr.first).includes('.') && !String(state.expr.second).includes('.') && Number.isInteger(first) && Number.isInteger(second)) {
    setTimeout(() => playConcrete(), 250);
  }
}

function clearEntry() {
  stopAnim();
  stopSpeech();
  state.expr = { first: '', operator: null, second: '' };
  state.parts = { units: 0, tens: 0, hundreds: 0 };
  state.resultVisible = false;
  render();
}

function loadExpression(first, op, second, options) {
  const opts = options || {};
  stopAnim();
  state.expr = {
    first: String(first === null || first === undefined ? '' : first),
    operator: op || null,
    second: second === null || second === undefined || second === '' ? '' : String(second),
  };
  state.resultVisible = Boolean(state.expr.first && state.expr.operator && state.expr.second);
  syncPartsFromExpr();
  if (!opts.quiet) {
    const calc = activeCalc();
    if (calc.result !== null) {
      const exact = exactFractionResult(state.expr.first, state.expr.second, calc.op);
      if (hasFractionInput(state.expr.first) || hasFractionInput(state.expr.second)) speak(`${state.expr.first} ${opWord(calc.op)} ${state.expr.second}는 ${rationalText(exact)}예요`);
      else if (String(state.expr.first).includes('.') || String(state.expr.second).includes('.')) speak(`${state.expr.first} ${opWord(calc.op)} ${state.expr.second}는 ${displayNumber(calc.result)}예요`);
      else speak(calcSpeech(calc.first, calc.op, calc.second, calc.result));
    } else if (calc.first !== null) {
      speak(countWord(calc.first));
    }
  }
  render();
}

function setFirstNumber(n) {
  stopAnim();
  const v = clamp(Math.trunc(n), 0, 999);
  state.expr = { first: String(v), operator: null, second: '' };
  state.resultVisible = false;
  syncPartsFromExpr();
  speak(countWord(v));
  render();
}

function changeCompose(part, delta) {
  const calc = activeCalc();
  let a = calc.op === '+' && calc.first !== null ? calc.first : 3;
  let b = calc.op === '+' && calc.second !== null ? calc.second : 5;
  if (part === 'a') a = clamp(a + delta, 0, 10);
  else b = clamp(b + delta, 0, 10);
  if (a + b > 10) {
    speak('10보다 커요. 10칸 판 안에서 맞춰 보세요');
    return;
  }
  loadExpression(a, '+', b, { quiet: true });
  speak(`${countWord(a)}과 ${countWord(b)}로 ${countWord(a + b)}을 만들었어요`);
}

/* ============================================================
   4. 단계별 풀이 설명
   ============================================================ */
function explainSteps(a, b, op) {
  const total = applyOp(a, b, op);
  if (total === null) return ['0으로는 나눌 수 없어요. 다른 수를 골라 보세요.'];
  const steps = [];
  const aOnes = a % 10;
  const bOnes = b % 10;
  const aTens = Math.floor(a / 10);
  const bTens = Math.floor(b / 10);

  if (op === '+') {
    const onesSum = aOnes + bOnes;
    if (a < 10 && b < 10 && total <= 10) {
      steps.push(`① ${a}개에 ${b}개를 이어서 세면 ${total}개가 됩니다.`);
      steps.push(`② 숫자로 쓰면 ${a} + ${b} = ${total}`);
      return steps;
    }
    steps.push(
      onesSum >= 10
        ? `① 일의 자리: ${aOnes} + ${bOnes} = ${onesSum} → 10개를 십의 자리로 올리고 ${onesSum % 10}개가 남아요.`
        : `① 일의 자리끼리: ${aOnes} + ${bOnes} = ${onesSum}`,
    );
    const carry = Math.floor(onesSum / 10);
    steps.push(`② 십의 자리끼리: ${aTens} + ${bTens}${carry ? ` + 올림 ${carry}` : ''} = ${aTens + bTens + carry}`);
    steps.push(`③ ${a} + ${b} = ${total}`);
    return steps;
  }

  if (op === '-') {
    if (total < 0) {
      steps.push(`① ${a}개에서 ${b}개를 덜어낼 수 없어요.`);
      steps.push(`② 0보다 작은 수가 되므로 ${a} - ${b} = ${total}이에요.`);
      return steps;
    }
    if (a < 10 && b < 10) {
      steps.push(`① ${a}개에서 ${b}개를 하나씩 덜어냅니다.`);
      steps.push(`② 남은 것을 세면 ${total}개예요. (${a} - ${b} = ${total})`);
      return steps;
    }
    if (aOnes >= bOnes) {
      steps.push(`① 일의 자리끼리: ${aOnes} - ${bOnes} = ${aOnes - bOnes}`);
      steps.push(`② 십의 자리끼리: ${aTens * 10} - ${bTens * 10} = ${(aTens - bTens) * 10}`);
      steps.push(`③ 남은 수를 합치면 ${total}`);
      return steps;
    }
    const layout = buildVertical(a, b, '-');
    const borrowed = layout.topReduced.some((v, i) => v !== layout.topDigits[i]);
    if (borrowed) {
      steps.push('① 자릿값을 맞추고, 뺄 수 없는 자리는 윗자리에서 10을 빌려옵니다.');
      steps.push(`② 빌려온 수로 각 자리를 계산하면 ${total}이 됩니다.`);
      steps.push(`③ ${a} - ${b} = ${total}`);
      return steps;
    }
    steps.push(`① 일의 자리 ${aOnes}에서 ${bOnes}를 뺄 수 없어요. 십의 자리에서 10을 빌려옵니다.`);
    steps.push(`② ${aOnes} + 10 = ${aOnes + 10}, ${aOnes + 10} - ${bOnes} = ${aOnes + 10 - bOnes}`);
    steps.push(`③ 십의 자리는 10을 빌려주어 ${aTens - 1 - bTens}이 남아요.`);
    steps.push(`④ ${total}이 됩니다. (${a} - ${b} = ${total})`);
    return steps;
  }

  if (op === '×') {
    if (b <= 10 && a <= 12) {
      steps.push(`① 한 묶음에 ${a}개씩 ${b}묶음이 있어요.`);
      steps.push(`② ${a}를 ${b}번 더하면 ${total}개가 됩니다.`);
      steps.push(`③ ${a} × ${b} = ${total}`);
      return steps;
    }
    steps.push(`① ${b}를 자릿값으로 나누어 계산합니다.`);
    let acc = 0;
    digitsOf(b).slice().reverse().forEach((digit, index) => {
      if (digit === 0) return;
      const value = a * digit * 10 ** index;
      acc += value;
      steps.push(`${'②③④⑤⑥'[index] || '·'} ${a} × ${digit * 10 ** index} = ${value}`);
    });
    steps.push(`마지막으로 모두 더하면 ${acc}`);
    return steps;
  }

  if (op === '÷') {
    const d = divideInfo(a, b);
    if (!d) return ['0으로는 나눌 수 없어요. 다른 수를 골라 보세요.'];
    steps.push(`① 전체 ${a}개를 ${b}곳에 똑같이 나누어 담습니다.`);
    if (d.r === 0) {
      steps.push(`② 한 곳에 ${d.q}개씩 들어가고 남는 것이 없어요.`);
      steps.push(`③ ${a} ÷ ${b} = ${d.q}`);
    } else {
      steps.push(`② 한 곳에 ${d.q}개씩 들어가고 ${d.r}개가 남아요.`);
      steps.push(`③ ${a} ÷ ${b} = ${d.q} … ${d.r} (몫 ${d.q}, 나머지 ${d.r})`);
    }
    return steps;
  }
  return [`${a} ${op} ${b} = ${total}`];
}

