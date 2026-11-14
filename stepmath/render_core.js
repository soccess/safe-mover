"use strict";

/* ============================================================
   5. 화면 렌더링
   ============================================================ */
const PLACE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed'];
const PLACE_NAMES = ['일의 자리', '십의 자리', '백의 자리', '천의 자리'];
const STAGE_ICONS = {
  1: '🧺', 2: '🖐️', 3: '🔟', 4: '🧱', 5: '⚖️',
  6: '➕', 7: '➖', 8: '🌟', 9: '🐇', 10: '🛣️',
  11: '🔟', 12: '💯', 13: '✖️', 14: '➗', 15: '🍕', 16: '💧',
  17: '📏', 18: '🕒', 19: '🪙', 20: '🔺', 21: '📊'
};

function renderNav() {
  const nav = $('stageNav');
  nav.innerHTML = '';
  const courseStages = state.course ? COURSES[state.course].stageIds : STAGES.map((s) => s.id);
  Object.keys(DOMAIN_META).forEach((domain) => {
    const list = STAGES.filter((s) => s.domain === domain && courseStages.includes(s.id));
    if (!list.length) return;
    const meta = DOMAIN_META[domain];
    const group = document.createElement('div');
    group.className = 'domain ' + meta.className;
    const label = document.createElement('span');
    label.className = 'domain-label';
    label.textContent = meta.label;
    const chips = document.createElement('div');
    chips.className = 'stage-chips';
    list.forEach((stage) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'stage-chip' + (stage.id === state.stage ? ' active' : '');
      b.setAttribute('aria-current', stage.id === state.stage ? 'step' : 'false');
      b.innerHTML = `<span class="n">${STAGE_ICONS[stage.id] || ''} ${stage.id}단계</span><span class="t">${stage.short}</span>`;
      b.title = `${stage.id}단계 · ${stage.title}`;
      b.onclick = () => selectStage(stage.id);
      chips.appendChild(b);
    });
    group.appendChild(label);
    group.appendChild(chips);
    nav.appendChild(group);
  });
}

function renderLessonPath() {
  const stage = currentStage();
  const lesson = (state.settings.easy && EASY_LESSONS[stage.id]) ? EASY_LESSONS[stage.id] : MICRO_LESSONS[stage.id];
  const labels = ['👀 먼저 보기', '🤝 같이 해보기', '⭐ 혼자 해보기'];
  const stepText = state.courseComplete
    ? '코스를 마쳤어요! 원하는 활동을 다시 연습하거나 위의 코스 선택 버튼으로 다른 코스를 골라 보세요.'
    : [lesson.goal, lesson.guided, lesson.try][state.lessonStep];
  $('lessonTitle').textContent = `${STAGE_ICONS[stage.id] || ''} ${stage.id}번째 놀이 · ${stage.short}`;
  const courseStages = state.course ? COURSES[state.course].stageIds : STAGES.map((s) => s.id);
  const position = Math.max(0, courseStages.indexOf(stage.id)) + 1;
  $('lessonCount').textContent = `${state.course ? COURSES[state.course].title + ' · ' : ''}${position}/${courseStages.length}단계 · 활동 ${state.lessonStep + 1}/3`;
  $('lessonSteps').innerHTML = labels.map((label, index) => `<div class="lesson-step${state.courseComplete || index < state.lessonStep ? ' done' : index === state.lessonStep ? ' current' : ''}"${!state.courseComplete && index === state.lessonStep ? ' aria-current="step"' : ''}>${state.courseComplete || index < state.lessonStep ? '✓ ' : `${index + 1}. `}${label}</div>`).join('');
  $('lessonInstruction').textContent = stepText;
  $('lessonPrevBtn').disabled = state.lessonStep === 0 || state.courseComplete;
  const lastStage = position === courseStages.length;
  const isLastActivity = state.lessonStep === 2;
  $('lessonNextBtn').textContent = state.courseComplete ? '첫 놀이 다시 하기' : state.lessonStep === 0 ? '같이 해보기 →' : state.lessonStep === 1 ? '혼자 해보기 →' : lastStage ? '코스 마치기 ✓' : '다음 놀이 →';
  $('lessonNextBtn').className = `btn ${isLastActivity ? 'green' : 'primary'}`;
  const modelButton = $('lessonModelBtn');
  if (modelButton) {
    modelButton.disabled = state.courseComplete || state.lessonStep === 2;
    modelButton.textContent = state.lessonStep === 2 ? '⭐ 혼자 해보기 중' : '👩‍🏫 같이 해보기';
  }
  const ftNow = $('ftNow');
  if (ftNow) ftNow.textContent = `${STAGE_ICONS[stage.id] || ''} ${stage.short}`;
  const ftNext = $('ftNext');
  if (ftNext) {
    const max = state.settings.tokenMax;
    ftNext.textContent = state.tokens >= max ? '🎁 보상 고르기 · 🌿 쉬는 시간' : `⭐ 칭찬 별 ${state.tokens}/${max} · 🌿 쉬는 시간`;
  }
}

function chooseCourse(courseId) {
  if (!COURSES[courseId]) return;
  state.course = courseId;
  state.courseComplete = false;
  state.lessonStep = 0;
  state.promptLevel = 0;
  $('courseGate').hidden = true;
  $('app').hidden = false;
  setView('activity');
  selectStage(COURSES[courseId].stageIds[0]);
  $('stageTitle').focus?.();
  setTimeout(() => $('toolCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
  noteInteraction();
}

function showCourseGate() {
  stopAnim();
  stopSpeech();
  $('app').hidden = true;
  $('courseGate').hidden = false;
  $('gateTitle').focus?.();
}

function advanceLesson() {
  if (state.courseComplete) {
    const firstStage = (COURSES[state.course]?.stageIds || STAGES.map((s) => s.id))[0];
    selectStage(firstStage);
    return;
  }
  if (state.lessonStep < 2) {
    state.lessonStep += 1;
    renderLessonPath();
    renderTool();
    speak(['살펴본 내용을 떠올려 보세요.', '함께 해 보았어요. 이제 직접 해 볼까요?', '마지막 활동이에요. 천천히 해 보세요.'][state.lessonStep]);
    return;
  }
  const stages = COURSES[state.course]?.stageIds || STAGES.map((s) => s.id);
  const index = stages.indexOf(state.stage);
  if (index >= 0 && index < stages.length - 1) {
    selectStage(stages[index + 1]);
    $('lessonPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    speak('좋아요. 다음 단계로 가요.');
  } else {
    state.courseComplete = true;
    renderLessonPath();
    speak('코스를 마쳤어요. 원하는 단계를 다시 연습하거나 코스를 다시 선택해 보세요.');
    return;
  }
}

function selectStage(id) {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage || (state.course && !COURSES[state.course].stageIds.includes(stage.id))) return;
  stopAnim();
  stopSpeech();
  state.stage = stage.id;
  state.courseComplete = false;
  state.lessonStep = 0;
  state.exampleIdx = 0;
  if (stage.measureTab) state.measure.tab = stage.measureTab;
  state.promptLevel = 0;
  state.practice.activeKey = '';
  state.practice.selected = null;
  state.practice.feedback = null;
  state.practice.hintShown = false;
  state.mulGroups = [];
  state.mulKey = '';
  state.divPlates = [];
  state.divRem = 0;
  state.divKey = '';
  state.nlMarker = null;
  state.nlBase = null;
  state.shapeSelected = null;
  state.sortSelected = null;
  state.composeRemoved = 0;
  state.composeBaseA = null;
  if (stage.tool === 'sort' && state.sort.items.length === 0) newSortRound();
  if (stage.preset) {
    state.expr = {
      first: String(stage.preset.first ?? ''),
      operator: stage.preset.op || null,
      second: stage.preset.second === '' || stage.preset.second === null || stage.preset.second === undefined ? '' : String(stage.preset.second),
    };
    state.resultVisible = Boolean(state.expr.first && state.expr.operator && state.expr.second);
    syncPartsFromExpr();
  }
  if (stage.tool === 'compare') {
    const c = activeCalc();
    state.compare.a = clamp(c.first ?? 6, 0, 20);
    state.compare.b = clamp(c.second ?? 4, 0, 20);
  }
  if (stage.measureTab) {
    state.measure.tab = stage.measureTab;
  }
  render();
  renderPromptMeter();
  noteInteraction();
  if (state.view === 'activity') {
    setTimeout(() => $('toolCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }
}

function renderStageHead() {
  const stage = currentStage();
  const meta = DOMAIN_META[stage.domain];
  $('stageBadge').textContent = `${state.course ? COURSES[state.course].title + ' · ' : ''}${meta.label} · ${stage.id}단계`;
  $('stageTitle').textContent = stage.title;
  $('stageSub').textContent = stage.subtitle;
  $('stageHint').textContent = (state.settings.easy && EASY_LESSONS[stage.id]) ? EASY_LESSONS[stage.id].goal : stage.hint;
}

function renderScreen() {
  const { first, op, second, result, resultText: answerText, rawFirst, rawSecond } = activeCalc();
  const stage = currentStage();
  $('screenBadge').textContent = `${stage.id}단계 · ${stage.short}`;
  $('screenLive').textContent = result !== null ? '오른쪽 공식과 연결됨' : '식을 만들어 보세요';

  let expr = '<span style="color:#64748b;font-size:22px">숫자를 눌러 보세요</span>';
  let word = '예: 3 + 5 를 누르면 오른쪽에 공식과 구체물이 나타나요';
  if (first !== null) {
    expr = `<span>${rawFirst}</span>`;
    word = expressionWord(rawFirst, first);
    if (op) {
      expr += `<span class="op">${op}</span>`;
      word += ` ${opWord(op)}`;
      if (second !== null) {
        expr += `<span>${rawSecond}</span><span class="eq">=</span>`;
        word += ` ${expressionWord(rawSecond, second)}`;
        if (result !== null) {
          expr += `<span class="res">${answerText || resultText(first, op, second, result)}</span>`;
          if (hasFractionInput(rawFirst) || hasFractionInput(rawSecond)) {
            word = `${rawFirst} ${opWord(op)} ${rawSecond}는 ${answerText}`;
          } else if (op === '÷') {
            const d = divideInfo(first, second);
            word = d.r === 0
              ? `${countWord(first)} 나누기 ${countWord(second)}${topicParticle(second)} ${countWord(d.q)}`
              : `${countWord(first)} 나누기 ${countWord(second)}${topicParticle(second)} ${countWord(d.q)}이고 ${countWord(d.r)}${subjectParticle(d.r)} 남아요`;
          } else if (String(rawFirst).includes('.') || String(rawSecond).includes('.')) {
            word = `${rawFirst} ${opWord(op)} ${rawSecond}는 ${displayNumber(result)}`;
          } else {
            word = `${countWord(first)} ${opWord(op)} ${countWord(second)}${topicParticle(second)} ${countWord(result)}`;
          }
        } else if (second === null && /^\d+\/$/.test(rawSecond)) {
          expr += '<span style="color:#64748b">?</span>';
          word = '분모를 입력해 분수를 완성해 보세요';
        } else {
          expr += '<span class="er">0으로 나눌 수 없음</span>';
          word = '0으로는 나눌 수 없어요';
        }
      } else {
        expr += '<span style="color:#64748b">?</span>';
        word += ' … 다음 숫자를 눌러 주세요';
      }
    }
  }
  $('screenExpr').innerHTML = expr;
  $('screenWord').textContent = word;
  $('screenTip').textContent = result !== null
    ? '= 를 누르면 기록에 저장되고 구체물이 하나씩 모여요'
    : '소수점 · 또는 분수선 / 버튼으로 수를 입력할 수 있어요';
}

function renderThemeRow() {
  const row = $('themeRow');
  row.innerHTML = '<span class="toolbar-label">구체물</span>';
  ITEMS.forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-btn' + (state.itemTheme === it.id ? ' active' : '');
    b.textContent = it.label;
    b.onclick = () => { state.itemTheme = it.id; render(); };
    row.appendChild(b);
  });
}

function renderExampleRow() {
  const row = $('exampleRow');
  row.innerHTML = '<span class="toolbar-label">예시</span>';
  const examples = [
    { label: '3 + 5', f: 3, op: '+', s: 5 },
    { label: '8 - 3', f: 8, op: '-', s: 3 },
    { label: '7 + 5', f: 7, op: '+', s: 5 },
    { label: '24 + 18', f: 24, op: '+', s: 18 },
    { label: '3 × 4', f: 3, op: '×', s: 4 },
    { label: '12 ÷ 3', f: 12, op: '÷', s: 3 },
    { label: '0.5 + 0.25', f: '0.5', op: '+', s: '0.25' },
    { label: '1/2 + 1/4', f: '1/2', op: '+', s: '1/4' },
    { label: '3/4 − 1/4', f: '3/4', op: '-', s: '1/4' },
  ];
  examples.forEach((ex) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-btn';
    b.textContent = ex.label;
    b.onclick = () => {
      let stageId = 5;
      if (String(ex.f).includes('/')) stageId = 13;
      else if (String(ex.f).includes('.')) stageId = 14;
      else if (ex.op === '×') stageId = 11;
      else if (ex.op === '÷') stageId = 12;
      else if (ex.op === '+' && (ex.f >= 100 || ex.s >= 100)) stageId = 10;
      else if (ex.op === '+' && (ex.f >= 10 || ex.s >= 10)) stageId = 9;
      else if (ex.op === '+' && ex.f + ex.s > 10) stageId = 7;
      else if (ex.op === '-') stageId = 6;
      state.stage = stageId;
      loadExpression(ex.f, ex.op, ex.s);
    };
    row.appendChild(b);
  });
}

function renderKeypad() {
  const kp = $('keypad');
  kp.innerHTML = '';
  const rows = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['C', '0', '⌫', '+'],
  ];
  rows.forEach((row) => {
    row.forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      let label = k;
      let cls = 'key';
      if (k === 'C') { label = '지우기'; cls += ' util'; }
      else if (k === '⌫') { label = '⌫'; cls += ' util'; }
      else if ('+−×÷'.includes(k)) {
        cls += ' op';
        if (state.expr.operator === (k === '−' ? '-' : k)) cls += ' active';
      }
      b.className = cls;
      b.textContent = label;
      b.setAttribute('aria-label', k === 'C' ? '모두 지우기' : k === '⌫' ? '한 글자 지우기' : k);
      b.onclick = () => {
        if (k === 'C') clearEntry();
        else if (k === '⌫') pressBackspace();
        else if (k === '−') pressOperator('-');
        else if ('+×÷'.includes(k)) pressOperator(k);
        else pressDigit(k);
      };
      kp.appendChild(b);
    });
  });
  const eq = document.createElement('button');
  eq.type = 'button';
  eq.className = 'key eq';
  eq.innerHTML = '<span>＝</span><span style="font-size:15px">결과 보기 · 기록 저장</span>';
  eq.onclick = pressEquals;
  kp.appendChild(eq);
}

/* ---------- 가로식 ---------- */
function renderHorizontal() {
  const box = $('horizontalBox');
  const { first, op, second, result, resultText: answerText, rawFirst, rawSecond } = activeCalc();
  if (first === null) {
    box.innerHTML = `<span class="box-badge">가로식</span><div class="vempty">왼쪽 계산기에서 <b>3 + 5</b>처럼 숫자와 기호를 눌러 보세요.</div>`;
    return;
  }
  if (!op) {
    box.innerHTML = `<span class="box-badge">가로식</span>
      <div class="h-eq"><div class="h-term first"><span class="h-num">${rawFirst}</span><span class="h-word">${expressionWord(rawFirst, first)}</span></div></div>
      <div class="formula-note">연산 기호를 누르면 식이 이어져요.</div>`;
    return;
  }
  if (second === null) {
    box.innerHTML = `<span class="box-badge">가로식</span>
      <div class="h-eq">
        <div class="h-term first"><span class="h-num">${rawFirst}</span><span class="h-word">${expressionWord(rawFirst, first)}</span></div>
        <span class="h-op">${op}</span>
        <div class="h-term second" style="border-style:dashed"><span class="h-num" style="color:#94a3b8">?</span><span class="h-word">다음 수</span></div>
      </div>
      <div class="formula-note">다음 숫자를 누르면 결과가 나타나요.</div>`;
    return;
  }
  const specialInput = hasFractionInput(rawFirst) || hasFractionInput(rawSecond) || String(rawFirst).includes('.') || String(rawSecond).includes('.');
  const d = op === '÷' && !specialInput ? divideInfo(first, second) : null;
  const shownResult = d ? (d.r === 0 ? String(d.q) : String(d.q)) : String(answerText ?? '✕');
  const resultWord = d ? (d.r === 0 ? `${countWord(d.q)}` : `몫 ${d.q} · 나머지 ${d.r}`) : (result !== null ? (answerText || countWord(result)) : '나눌 수 없음');
  box.innerHTML = `<span class="box-badge">가로식</span>
    <div class="h-eq">
      <div class="h-term first"><span class="h-num">${rawFirst}</span><span class="h-word">${expressionWord(rawFirst, first)}</span></div>
      <span class="h-op">${op}</span>
      <div class="h-term second"><span class="h-num">${rawSecond}</span><span class="h-word">${expressionWord(rawSecond, second)}</span></div>
      <span class="h-op eq">=</span>
      <div class="h-term result"><span class="h-num">${shownResult}</span><span class="h-word">${resultWord}</span></div>
    </div>
    ${d && d.r > 0 ? `<div class="formula-note">${first} ÷ ${second} = ${d.q} … ${d.r} — 몫은 ${d.q}, 나머지는 ${d.r}이에요.</div>` : ''}`;
}

/* ---------- 세로식 ---------- */
function renderVertical() {
  const box = $('verticalBox');
  const { first, op, second, result, rawFirst, rawSecond, resultText: answerText } = activeCalc();
  if (first === null) {
    box.innerHTML = `<span class="box-badge">세로식</span><div class="vempty">숫자를 입력하면 자릿값에 맞춰 세로식이 만들어집니다.</div>`;
    return;
  }
  if (!op || second === null) {
    box.innerHTML = `<span class="box-badge">세로식</span>
      <div class="vwrap">
        <div class="vrow"><div class="vcell"><span class="vdigit" style="color:${PLACE_COLORS[0]}">${first}</span></div></div>
        ${op ? `<div class="vrow"><span class="vop">${op}</span><div class="vcell"><span style="font-size:30px;color:#94a3b8;font-weight:900">?</span></div></div>` : ''}
      </div>`;
    return;
  }

  if (String(state.expr.first).includes('/') || String(state.expr.first).includes('.') || String(state.expr.second).includes('/') || String(state.expr.second).includes('.')) {
    box.innerHTML = `<span class="box-badge">세로식 · 수 표현</span>
      <div class="vempty">분수와 소수는 자릿값 세로식 대신 <b>${rawFirst} ${op} ${rawSecond} = ${answerText || '…'}</b>로 나타내요.<br/>왼쪽 계산기의 그림 모델에서 크기도 확인해 보세요.</div>`;
    return;
  }
  if (op === '÷') {
    const d = divideInfo(first, second);
    if (!d) {
      box.innerHTML = `<span class="box-badge">세로식</span><div class="vempty">0으로는 나눌 수 없어요.<br/>다른 수를 골라 보세요.</div>`;
      return;
    }
    box.innerHTML = `<span class="box-badge">세로식 · 나눗셈</span>
      <div class="longdiv">
        <div class="ld-q">${d.q}</div>
        <div class="ld-row"><span class="ld-divisor">${second}</span><span class="ld-bracket"><span class="ld-dividend">${first}</span></span></div>
        <div class="ld-sub">- ${second * d.q}</div>
        <div class="ld-rule"></div>
        <div class="ld-rem">${d.r} <small>(나머지)</small></div>
      </div>
      <div class="formula-note">몫 ${d.q}${d.r ? `, 나머지 ${d.r}` : ''} — ${second} × ${d.q} = ${second * d.q}${d.r ? `, ${second * d.q} + ${d.r} = ${first}` : ''}</div>`;
    return;
  }

  const layout = buildVertical(first, second, op);
  if (layout.negativeFallback) {
    box.innerHTML = `<span class="box-badge">세로식</span>
      <div class="vempty">${first} ${op} ${second} = ${result}<br/>빼는 수가 더 클 때는 가로식으로 확인해요.</div>`;
    return;
  }
  const n = Math.max(layout.topDigits.length, layout.bottomDigits.length, layout.resultDigits.length, 1);
  const cols = [];
  for (let i = 0; i < n; i++) {
    const top = layout.topDigits[i] ?? null;
    const reduced = layout.topReduced[i] ?? top ?? 0;
    const topChanged = top !== null && reduced !== top;
    cols.push({
      place: i,
      top,
      hasTop: i < layout.topDigits.length,
      bottom: layout.bottomDigits[i] ?? null,
      hasBottom: i < layout.bottomDigits.length,
      result: layout.resultDigits[i] ?? null,
      hasResult: i < layout.resultDigits.length,
      carry: layout.carries[i] ?? null,
      topChanged,
      reduced,
    });
  }
  cols.reverse();
  const cell = (inner) => `<div class="vcell">${inner}</div>`;
  const placeHeader = `<div class="vplace-row">${cols.map((c) =>
    `<div class="vplace" style="color:${PLACE_COLORS[c.place] ?? '#0f172a'}">${PLACE_NAMES[c.place] || ''}</div>`).join('')}</div>`;
  const markerRow = cols.some((c) => c.carry !== null)
    ? `<div class="vrow">${cols.map((c) => cell(c.carry !== null ? `<span class="vmarker" title="받아올림">+${c.carry}</span>` : '')).join('')}</div>`
    : '';
  const topRow = `<div class="vrow">${cols.map((c) => {
    if (!c.hasTop) return cell('');
    const color = PLACE_COLORS[c.place] ?? '#0f172a';
    if (c.topChanged) {
      return `<div class="vcell" style="flex-direction:column;gap:0"><span style="font-size:16px;font-weight:900;color:#94a3b8;text-decoration:line-through;line-height:1">${c.top}</span><span class="vdigit" style="color:${color}">${c.reduced}</span></div>`;
    }
    return cell(`<span class="vdigit" style="color:${color}">${c.top}</span>`);
  }).join('')}</div>`;
  const botRow = `<div class="vrow"><span class="vop">${op}</span>${cols.map((c) =>
    cell(c.hasBottom ? `<span class="vdigit" style="color:${PLACE_COLORS[c.place] ?? '#0f172a'}">${c.bottom}</span>` : '')).join('')}</div>`;
  const partials = layout.partialRows.map((r) => {
    const ds = [...r.digits];
    const originalLength = ds.length;
    while (ds.length < n) ds.push(0);
    ds.reverse();
    return `<div class="vrow"><span class="vpartial">${r.label}</span>${ds.map((d, i) =>
      cell(i < n - originalLength ? '' : `<span class="vdigit" style="font-size:28px;color:${PLACE_COLORS[n - 1 - i] ?? '#0f172a'}">${d}</span>`)).join('')}</div>`;
  }).join('');
  const resRow = `<div class="vrow">${cols.map((c) =>
    cell(c.hasResult ? `<span class="vresult">${c.result}</span>` : '')).join('')}</div>`;

  box.innerHTML = `<span class="box-badge">세로식 · 자릿값</span>
    <div class="vwrap">${placeHeader}${markerRow}${topRow}${botRow}${partials}<div class="vrule"></div>${resRow}</div>`;
}

function renderFormula() {
  const tabs = $('formulaTabs');
  tabs.innerHTML = '';
  const modes = [
    { id: 'both', label: '둘 다' },
    { id: 'horizontal', label: '가로식' },
    { id: 'vertical', label: '세로식' },
  ];
  modes.forEach((m) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab' + (state.formulaMode === m.id ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', state.formulaMode === m.id ? 'true' : 'false');
    b.textContent = m.label;
    b.onclick = () => { state.formulaMode = m.id; renderFormula(); };
    tabs.appendChild(b);
  });
  const grid = $('formulaGrid');
  grid.className = 'formula-grid mode-' + state.formulaMode;
  $('horizontalBox').style.display = state.formulaMode === 'vertical' ? 'none' : 'flex';
  $('verticalBox').style.display = state.formulaMode === 'horizontal' ? 'none' : 'flex';
  renderHorizontal();
  renderVertical();

  const { first, op, second } = activeCalc();
  const banner = $('stepsBanner');
  if (first !== null && op && second !== null && (hasFractionInput(state.expr.first) || hasFractionInput(state.expr.second) || String(state.expr.first).includes('.') || String(state.expr.second).includes('.'))) {
    const calc = activeCalc();
    banner.innerHTML = `<div class="step-line">① <b>${state.expr.first}</b>와 <b>${state.expr.second}</b>를 각각 수로 살펴봐요.</div><div class="step-line">② ${state.expr.first} ${op} ${state.expr.second} = <b>${calc.resultText}</b></div><div class="step-line">③ 그림 모델과 계산기 결과를 비교해 보세요.</div>`;
  } else if (first !== null && op && second !== null) {
    banner.innerHTML = explainSteps(first, second, op).map((line) => `<div class="step-line">${line}</div>`).join('');
  } else if (first !== null) {
    banner.innerHTML = `<div class="step-line">지금 입력한 수는 <b>${first} (${countWord(first)})</b>이에요. 연산 기호와 다음 숫자를 눌러 보세요.</div>`;
  } else {
    banner.innerHTML = '<div class="step-line">계산기에서 수식을 입력하면 이곳에 단계별 풀이가 나타납니다.</div>';
  }
}

/* ---------- 구체물 ---------- */
function itemHTML(emoji, idx, cls, extraStyle) {
  return `<div class="citem ${cls || ''}" ${extraStyle ? `style="${extraStyle}"` : ''} data-speak="${idx}" role="button" tabindex="0" aria-label="${idx}번째 구체물">
    <span class="cemoji">${emoji}</span><span class="cidx">${idx}</span></div>`;
}
function bindSpeakItems(root) {
  root.querySelectorAll('[data-speak]').forEach((el) => {
    const fn = () => speak(countWord(Number(el.dataset.speak)));
    el.onclick = fn;
    el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
  });
}
function bindPlayButtons(root) {
  root.querySelectorAll('[data-play]').forEach((b) => { b.onclick = () => playConcrete(); });
}
function placeSummaryHTML(n) {
  const p = partsFromValue(n);
  const bits = [];
  if (p.hundreds) bits.push(`백 ${p.hundreds}개`);
  if (p.tens) bits.push(`십 ${p.tens}개`);
  if (p.units) bits.push(`일 ${p.units}개`);
  return `<div class="guide">수모형으로 보면 <b>${bits.join(' + ') || '0'}</b> = <b>${n}</b></div>`;
}

function groupIconSVG(size, index) {
  const color = index % 2 ? '#16a34a' : '#2563eb';
  const light = index % 2 ? '#dcfce7' : '#dbeafe';
  const bg = size === 10 ? (index % 2 ? '#f0fdf4' : '#eff6ff') : '#fffbeb';
  const gid = `grp-${size}-${index}`;
  const parts = size === 10
    ? Array.from({ length: 10 }, (_, i) => `<circle cx="${13 + (i % 5) * 7.5}" cy="${18 + Math.floor(i / 5) * 18}" r="3.2" fill="${color}" stroke="#fff" stroke-width="0.8"/>`).join('')
    : Array.from({ length: 100 }, (_, i) => `<rect x="${7 + (i % 10) * 4.2}" y="${7 + Math.floor(i / 10) * 4.2}" width="3.4" height="3.4" rx="0.8" fill="${color}" opacity="0.9"/>`).join('');
  return `<svg viewBox="0 0 56 56" role="img" aria-label="${size}개 묶음" class="group-unit" style="--d:${Math.min(index * 70, 420)}ms">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="${bg}"/></linearGradient></defs>
    <rect x="2" y="2" width="52" height="52" rx="11" fill="url(#${gid})" stroke="${color}" stroke-width="2.4"/>
    <rect x="4" y="4" width="48" height="12" rx="8" fill="${light}" opacity="0.45"/>
    ${parts}
  </svg>`;
}

function renderGrouping() {
  const calc = activeCalc();
  const value = state.resultVisible && calc.result !== null ? calc.result : calc.second !== null ? calc.second : calc.first;
  const label = $('groupingValue');
  const visual = $('groupingVisual');
  if (value === null) {
    label.textContent = '수를 입력해 보세요';
    visual.innerHTML = '<span class="guide">예: 347을 입력하면 백·십·일 묶음으로 볼 수 있어요.</span>';
    return;
  }
  if (value < 0 || !Number.isInteger(value) || hasFractionInput(calc.rawFirst) || hasFractionInput(calc.rawSecond)) {
    label.textContent = `${calc.rawFirst || ''}${calc.op || ''}${calc.rawSecond || ''}`;
    visual.innerHTML = '<span class="guide">10개·100개 묶음은 자연수에서 살펴볼 수 있어요. 정수를 입력해 보세요.</span>';
    return;
  }
  const size = state.groupingSize;
  const groups = Math.floor(value / size);
  const rest = value % size;
  label.textContent = `${value}개를 ${size}개씩 묶어요`;
  const shown = Math.min(groups, 6);
  const icons = Array.from({ length: shown }, (_, i) => groupIconSVG(size, i)).join('');
  const more = groups > shown ? `<span class="grouping-count">+ ${groups - shown}묶음</span>` : '';
  const remainder = `<span class="grouping-count">${groups}묶음 × ${size}개${rest ? ` + ${rest}개` : ''} = ${value}개</span>`;
  visual.innerHTML = `${icons || '<span class="guide">아직 묶음이 없어요.</span>'}${more}${remainder}`;
}

function fractionPieSVG(n, d, color) {
  const pieces = Math.min(Math.max(d, 1), 12);
  const filled = Math.round(Math.min(Math.max(n / d, 0), 1) * pieces);
  const fid = `fpie-${n}-${d}-${color.replace('#', '')}`;
  const slices = Array.from({ length: pieces }, (_, i) => {
    const start = (i / pieces) * Math.PI * 2 - Math.PI / 2;
    const end = ((i + 1) / pieces) * Math.PI * 2 - Math.PI / 2;
    const x1 = 50 + 42 * Math.cos(start), y1 = 50 + 42 * Math.sin(start);
    const x2 = 50 + 42 * Math.cos(end), y2 = 50 + 42 * Math.sin(end);
    const path = pieces === 1 ? 'M50 50 m-42 0 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0' : `M50 50 L${x1} ${y1} A42 42 0 0 1 ${x2} ${y2} Z`;
    return `<path d="${path}" fill="${i < filled ? `url(#${fid})` : '#f1f5f9'}" class="fraction-slice" style="animation-delay:${i * 35}ms"/>`;
  }).join('');
  return `<svg class="fraction-visual" viewBox="0 0 100 100" role="img" aria-label="${n}/${d}만큼 색칠한 원">
    <defs><radialGradient id="${fid}" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff" stop-opacity="0.35"/><stop offset="35%" stop-color="${color}"/><stop offset="100%" stop-color="${color}"/></radialGradient></defs>
    <circle cx="50" cy="52" r="43" fill="#e2e8f0" opacity="0.6"/>
    ${slices}
    <circle cx="50" cy="50" r="42" fill="none" stroke="#64748b" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="5" fill="#fff" stroke="#64748b" stroke-width="2"/>
  </svg>`;
}

function fractionModelHTML(raw, value, color) {
  const r = parseRational(raw) || normalizeRational(Math.round(value * 100), 100);
  return `<div class="fraction-model">${fractionPieSVG(Math.abs(r.n), r.d, color)}<span class="fraction-model-label"><b>${raw}</b>${r.d === 1 ? '하나 전체와 같아요' : `${r.d}조각 중 ${Math.abs(r.n)}조각`}</span></div>`;
}

function decimalModelHTML(raw, value, color) {
  const whole = Math.floor(Math.abs(value));
  const hundredths = Math.round((Math.abs(value) - whole) * 100);
  const grid = Array.from({ length: 100 }, (_, i) => `<i class="${i < hundredths ? 'on' : ''}" style="${i < hundredths ? `background:${color};border-color:${color};animation-delay:${Math.min(i * 4, 300)}ms` : ''}"></i>`).join('');
  return `<div class="decimal-model"><div class="decimal-grid" role="img" aria-label="${raw}의 소수 부분을 100칸으로 나타낸 그림">${grid}</div><span class="decimal-copy"><b>${raw}</b><br/>${whole ? `온전한 수 ${whole} + ` : ''}100칸 중 ${hundredths}칸</span></div>`;
}

function renderConcrete() {
  const box = $('concreteStage');
  const { first, op, second, result, resultText: answerText, rawFirst, rawSecond, exactResult } = activeCalc();
  const theme = currentTheme();
  const sub = $('concreteSub');
  const MAX = 30;

  if (first !== null && (String(rawFirst).includes('/') || String(rawFirst).includes('.') || String(rawSecond).includes('/') || String(rawSecond).includes('.'))) {
    const fractionMode = hasFractionInput(rawFirst) || hasFractionInput(rawSecond);
    const model = (raw, value, color) => String(raw).includes('/')
      ? fractionModelHTML(raw, value, color)
      : decimalModelHTML(raw, value, color);
    sub.textContent = fractionMode ? '같은 전체를 나눈 조각을 분수로 살펴보세요' : '소수점 아래의 크기를 100칸 그림으로 살펴보세요';
    const equation = op && second !== null ? `<div class="guide" style="font-size:16px"><b>${rawFirst} ${op} ${rawSecond} = ${exactResult ? rationalText(exactResult) : answerText || '…'}</b></div>` : '';
    box.innerHTML = `${equation}<div class="concrete-flow">${model(rawFirst, first, '#2563eb')}${second !== null ? `<div class="csign">${op}</div>${model(rawSecond, second, '#16a34a')}` : ''}${result !== null ? `<div class="csign">=</div><div class="fraction-model"><span class="fraction-model-label"><b>${exactResult ? rationalText(exactResult) : answerText}</b>계산 결과</span></div>` : ''}</div><div class="cmovehint">분수는 전체를 똑같이 나눈 수이고, 소수는 1보다 작은 부분을 십분의 일·백분의 일로 나타낸 수예요.</div>`;
    return;
  }

  if (first === null) {
    sub.textContent = '계산기에 숫자를 넣으면 구체물이 나타나요';
    box.innerHTML = `<div class="vempty">왼쪽 계산기에서 숫자를 누르면 <b>${theme.a}</b> 구체물이 나타납니다.</div>`;
    return;
  }

  if (!op || second === null) {
    const count = Math.min(first, MAX);
    const items = Array.from({ length: count }, (_, i) => itemHTML(theme.a, i + 1, 'first', `--d:${Math.min(i * 22, 500)}ms`)).join('');
    sub.textContent = `${first}개를 하나씩 세어 보세요`;
    box.innerHTML = `<div class="cgroup first">
      <div class="cgroup-head"><span>입력한 수</span><span class="cbadge first">${first}개 · ${countWord(first)}</span></div>
      <div class="citems">${items || '<span class="guide">0개 (비어 있어요)</span>'}</div>
      ${first > MAX ? `<div class="cmovehint">화면에는 ${MAX}개까지만 보여요. 큰 수는 7단계 수모형으로 확인해 보세요.</div>` : ''}
    </div>`;
    bindSpeakItems(box);
    return;
  }

  if (op === '+') {
    const total = Math.max(0, result ?? 0);
    const drawTotal = Math.min(total, 40);
    const shown = state.anim.playing ? Math.min(state.anim.shown, drawTotal) : drawTotal;
    const firstItems = Array.from({ length: Math.min(first, MAX) }, (_, i) =>
      itemHTML(theme.a, i + 1, 'first', `--d:${Math.min(i * 22, 450)}ms`)).join('');
    const secondItems = Array.from({ length: Math.min(second, MAX) }, (_, i) => {
      const moved = state.anim.playing && shown >= first + i + 1;
      return itemHTML(theme.b, i + 1, 'second' + (moved ? ' moved' : ''), `--d:${Math.min(i * 22, 450)}ms`);
    }).join('');
    const resultItems = Array.from({ length: shown }, (_, i) => {
      const fromFirst = i < first;
      const cls = (fromFirst ? 'first' : 'second') + (state.anim.playing && i === shown - 1 ? ' pop' : '');
      return itemHTML(fromFirst ? theme.a : theme.b, i + 1, cls, `--d:${state.anim.playing ? 0 : Math.min(i * 24, 700)}ms`);
    }).join('');
    sub.textContent = `${first}개와 ${second}개를 모으면 ${total}개`;
    box.innerHTML = `
      <div class="row-flex" style="justify-content:space-between">
        <div class="guide"><b>${theme.a} ${first}개</b>와 <b>${theme.b} ${second}개</b>를 한곳에 모으면 <b>${total}개 (${countWord(total)})</b>가 됩니다. 구체물을 눌러 수를 읽어 보세요.</div>
        <button type="button" class="btn violet" data-play style="min-height:40px">▶ 하나씩 세며 합치기</button>
      </div>
      <div class="concrete-flow">
        <div class="cgroup first">
          <div class="cgroup-head"><span>첫 번째 수</span><span class="cbadge first">${first}개 · ${countWord(first)}</span></div>
          <div class="citems">${firstItems || '<span class="guide">0개</span>'}</div>
          ${first > MAX ? `<div class="cmovehint">${MAX}개까지만 표시</div>` : ''}
        </div>
        <div class="csign">+</div>
        <div class="cgroup second">
          <div class="cgroup-head"><span>두 번째 수</span><span class="cbadge second">${second}개 · ${countWord(second)}</span></div>
          <div class="citems">${secondItems || '<span class="guide">0개</span>'}</div>
          ${second > MAX ? `<div class="cmovehint">${MAX}개까지만 표시</div>` : ''}
        </div>
        <div class="csign">=</div>
        <div class="cgroup result">
          <div class="cgroup-head"><span>모두 모은 결과</span><span class="cbadge result">${total}개 · ${countWord(total)}</span></div>
          <div class="citems">${resultItems || `<span class="guide">${state.anim.playing ? '하나씩 모으는 중이에요…' : '▶ 버튼을 눌러 하나씩 모아 보세요'}</span>`}</div>
          ${total > 40 ? placeSummaryHTML(total) : ''}
        </div>
      </div>`;
    bindSpeakItems(box);
    bindPlayButtons(box);
    return;
  }

  if (op === '-') {
    const negative = result !== null && result < 0;
    const remain = Math.max(0, result ?? 0);
    const removedAll = Math.min(second, first);
    const removed = state.anim.playing ? Math.min(state.anim.shown, removedAll) : removedAll;
    const drawFirst = Math.min(first, MAX);
    const beforeItems = Array.from({ length: drawFirst }, (_, i) => {
      const isRemoved = i >= first - removed;
      return itemHTML(theme.a, i + 1, isRemoved ? 'removed' : 'first', `--d:${Math.min(i * 22, 450)}ms`);
    }).join('');
    const afterItems = Array.from({ length: Math.min(Math.max(first - removed, 0), MAX) }, (_, i) =>
      itemHTML(theme.a, i + 1, 'first', `--d:${Math.min(i * 22, 450)}ms`)).join('');
    sub.textContent = negative
      ? `${first}개보다 ${second}개가 더 많아요`
      : `${first}개에서 ${second}개를 덜어내면 ${remain}개`;
    box.innerHTML = `
      <div class="row-flex" style="justify-content:space-between">
        <div class="guide">${negative
          ? `<b>${first}개</b>에서 <b>${second}개</b>를 덜어낼 수 없어요. 0보다 작은 수는 세로식 대신 가로식으로 확인해요.`
          : `처음 <b>${first}개</b>에서 <b>${second}개</b>를 덜어내면(✕) <b>${remain}개 (${countWord(remain)})</b>가 남습니다.`}</div>
        <button type="button" class="btn violet" data-play style="min-height:40px">▶ 하나씩 덜어내기</button>
      </div>
      <div class="concrete-flow">
        <div class="cgroup first">
          <div class="cgroup-head"><span>처음 ${first}개</span><span class="cbadge first">${first} - ${second}</span></div>
          <div class="citems">${beforeItems || '<span class="guide">0개</span>'}</div>
          ${first > MAX ? `<div class="cmovehint">화면에는 ${MAX}개까지만 표시돼요.</div>` : ''}
        </div>
        <div class="csign">=</div>
        <div class="cgroup result">
          <div class="cgroup-head"><span>남은 구체물</span><span class="cbadge result">${remain}개 · ${countWord(remain)}</span></div>
          <div class="citems">${afterItems || `<span class="guide">${state.anim.playing ? '하나씩 덜어내는 중이에요…' : '남은 것이 없어요 (0개)'}</span>`}</div>
        </div>
      </div>`;
    bindSpeakItems(box);
    bindPlayButtons(box);
    return;
  }

  if (op === '×') {
    const groups = Math.min(second, 10);
    const per = Math.min(first, 12);
    let idx = 1;
    let bundles = '';
    for (let g = 0; g < groups; g++) {
      let inner = '';
      for (let i = 0; i < per; i++) {
        inner += itemHTML(g % 2 === 0 ? theme.a : theme.b, idx, g % 2 === 0 ? 'first' : 'second', `--d:${Math.min(idx * 18, 500)}ms`);
        idx++;
      }
      bundles += `<div class="bundle"><div class="bundle-title">${g + 1}묶음 · ${first}개</div><div class="citems" style="min-height:52px">${inner || '<span class="guide">0개</span>'}</div></div>`;
    }
    sub.textContent = `${first}개씩 ${second}묶음 = ${result}개`;
    box.innerHTML = `
      <div class="guide">한 묶음에 <b>${first}개씩 ${second}묶음</b>을 모으면 모두 <b>${result}개 (${countWord(result)})</b>가 됩니다.</div>
      <div class="guide">${Array.from({ length: Math.min(second, 10) }, () => first).join(' + ')} = <b>${result}</b>${second > 10 ? ' …' : ''}</div>
      <div class="bundle-grid">${bundles || '<div class="guide">0묶음입니다</div>'}</div>
      ${second > 10 || first > 12 ? '<div class="cmovehint">화면에는 일부 묶음만 표시됩니다. 큰 수는 8단계 교구로 확인해 보세요.</div>' : ''}`;
    bindSpeakItems(box);
    return;
  }

  if (op === '÷') {
    if (second === 0) {
      sub.textContent = '0으로는 나눌 수 없어요';
      box.innerHTML = '<div class="vempty">0개의 곳으로는 나눌 수 없어요. 다른 숫자를 골라 보세요.</div>';
      return;
    }
    const d = divideInfo(first, second);
    const plates = Math.min(second, 10);
    const per = Math.min(d.q, 12);
    let platesHtml = '';
    for (let p = 0; p < plates; p++) {
      const inner = Array.from({ length: per }, (_, i) => itemHTML(theme.a, i + 1, 'first')).join('');
      platesHtml += `<div class="bundle"><div class="bundle-title">${p + 1}번 접시 · ${d.q}개씩</div><div class="citems" style="min-height:52px">${inner || '<span class="guide">0개</span>'}</div></div>`;
    }
    const remHtml = d.r > 0
      ? `<div class="bundle" style="border-color:#d97706"><div class="bundle-title" style="color:#b45309">남은 것 · ${d.r}개</div><div class="citems" style="min-height:52px">${Array.from({ length: Math.min(d.r, 12) }, (_, i) => itemHTML(theme.b, i + 1, 'second')).join('')}</div></div>`
      : '';
    sub.textContent = `${first}개를 ${second}곳에 나누면 한 곳에 ${d.q}개`;
    box.innerHTML = `
      <div class="guide">전체 <b>${first}개</b>를 <b>${second}곳</b>에 똑같이 나누면 한 곳에 <b>${d.q}개씩</b> 들어가고 <b>${d.r}개</b>가 남습니다.</div>
      <div class="bundle-grid">${platesHtml}${remHtml}</div>
      ${second > 10 || d.q > 12 ? '<div class="cmovehint">화면에는 일부 접시만 표시돼요. 큰 수는 8단계 교구로 확인해 보세요.</div>' : ''}`;
    bindSpeakItems(box);
  }
}

function playConcrete() {
  stopAnim();
  const { first, op, second, result } = activeCalc();
  if (first === null || !op || second === null) return;
  if (!Number.isInteger(first) || !Number.isInteger(second) || hasFractionInput(state.expr.first) || hasFractionInput(state.expr.second) || String(state.expr.first).includes('.') || String(state.expr.second).includes('.')) return;
  if (op === '+' && result !== null) {
    const total = Math.min(Math.max(result, 0), 40);
    if (total <= 0) return;
    state.anim = { playing: true, shown: 0, mode: 'add', token: state.anim.token + 1 };
    renderConcrete();
    speak('하나');
    let n = 0;
    animTimer = setInterval(() => {
      n++;
      if (n >= total) {
        stopAnim();
        renderConcrete();
        speak(`모두 ${countWord(total)}개! ${countWord(first)} 더하기 ${countWord(second)}${topicParticle(second)} ${countWord(result)}`);
        return;
      }
      state.anim.shown = n;
      renderConcrete();
      speak(countWord(n + 1));
    }, 560);
    return;
  }
  if (op === '-' && result !== null) {
    const removals = Math.min(second, first);
    if (removals <= 0) { speak('덜어낼 것이 없어요'); return; }
    state.anim = { playing: true, shown: 0, mode: 'sub', token: state.anim.token + 1 };
    renderConcrete();
    speak(`${countWord(first)}개에서 하나씩 덜어내요`);
    let n = 0;
    animTimer = setInterval(() => {
      n++;
      if (n >= removals) {
        stopAnim();
        renderConcrete();
        speak(result < 0
          ? `${countWord(first)}개보다 ${countWord(second)}개가 더 많아서 0보다 작아져요`
          : `${countWord(removals)}개를 덜어내면 ${countWord(result)}개가 남아요`);
        return;
      }
      state.anim.shown = n;
      renderConcrete();
      speak(countWord(first - n));
    }, 560);
    return;
  }
  if (op === '×') {
    speak(`${countWord(first)}개씩 ${countWord(second)}묶음이면 모두 ${countWord(result)}개예요`);
    return;
  }
  if (op === '÷') {
    const d = divideInfo(first, second);
    if (d) speak(`${countWord(first)}개를 ${countWord(second)}곳에 나누면 한 곳에 ${countWord(d.q)}개씩이고 ${countWord(d.r)}개가 남아요`);
  }
}

/* ---------- 기록 ---------- */
function renderHistory() {
  const list = $('historyList');
  if (!list) return;
  if (!state.history.length) {
    list.innerHTML = '<div class="muted" style="padding:10px">계산기에서 ＝ 를 누르면 풀이 기록이 여기에 저장됩니다.</div>';
    return;
  }
  list.innerHTML = '';
  state.history.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'hitem';
    div.innerHTML = `<div class="hitem-top">
        <span>${item.at || ''} · ${item.inputA ?? item.first} ${item.op} ${item.inputB ?? item.second} = ${item.displayResult ?? resultText(item.first, item.op, item.second, item.result)}</span>
        <span class="ops"><button type="button" class="mini" data-load>불러오기</button><button type="button" class="mini" data-speak>🔊</button><button type="button" class="mini del" data-del>삭제</button></span>
      </div>
      <div class="hitem-steps">${(item.steps || []).join('<br/>')}</div>`;
    div.querySelector('[data-load]').onclick = (e) => {
      e.stopPropagation();
      loadExpression(item.inputA ?? item.first, item.op, item.inputB ?? item.second);
    };
    div.querySelector('[data-speak]').onclick = (e) => {
      e.stopPropagation();
      if (String(item.inputA || '').includes('/') || String(item.inputB || '').includes('/')) speak(`${item.inputA} ${opWord(item.op)} ${item.inputB}는 ${item.displayResult}예요`);
      else if (String(item.inputA || '').includes('.') || String(item.inputB || '').includes('.')) speak(`${item.inputA} ${opWord(item.op)} ${item.inputB}는 ${item.displayResult}예요`);
      else speak(calcSpeech(item.first, item.op, item.second, item.result));
    };
    div.querySelector('[data-del]').onclick = (e) => {
      e.stopPropagation();
      state.history = state.history.filter((h) => h.id !== item.id);
      writeHistory();
      renderHistory();
    };
    div.onclick = () => loadExpression(item.inputA ?? item.first, item.op, item.inputB ?? item.second);
    list.appendChild(div);
  });
}

/* ---------- 전체 렌더 ---------- */
function render() {
  applySettings();
  renderNav();
  renderStageHead();
  renderLessonPath();
  renderScreen();
  renderGrouping();
  renderThemeRow();
  renderExampleRow();
  renderKeypad();
  renderFormula();
  renderConcrete();
  renderTool();
  renderHistory();
  renderPromptMeter();
  if ($('teacherDialog')?.open) renderTeacher();
}

