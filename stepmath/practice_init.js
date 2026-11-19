"use strict";

/* ============================================================
   8. 도구 디스패처 · 초기화
   ============================================================ */
function resetStageActivity() {
  const stage = currentStage();
  switch (stage.tool) {
    case 'sort': newSortRound(); break;
    case 'count': setFirstNumber(0); return;
    case 'compare': state.compare = { a: 6, b: 4 }; break;
    case 'compose': state.composeRemoved = 0; state.composeBaseA = null; loadExpression(3, '+', 5, { quiet: true }); return;
    case 'maketen': loadExpression(7, '+', 5, { quiet: true }); return;
    case 'strategy': state.nlMarker = null; state.nlBase = null; break;
    case 'place': state.parts = { hundreds: 0, tens: 0, units: 0 }; break;
    case 'multiply': state.mulGroups = []; state.mulKey = ''; state.divPlates = []; state.divRem = 0; state.divKey = ''; break;
    case 'fraction': state.fractions = { a: { n: 1, d: 4 }, b: { n: 2, d: 4 } }; break;
    case 'measure': state.measure = { tab: 'length', length: 12, volume: 6, weight: 450, minutes: 570, coins: { 10: 0, 50: 0, 100: 0, 500: 0 } }; break;
    case 'shape': state.shapeBoard = []; state.shapeSelected = null; state.shapeTab = 'shape'; state.pattern = { index: 0, chosen: null, solved: false }; break;
    case 'data': state.data = { apple: 5, banana: 3, grape: 4, answer: null, solved: false, wordSolved: false }; state.story = { apple: 0, orange: 0 }; break;
    default: break;
  }
  renderTool();
  announce('활동을 처음부터 다시 시작해요.');
}
function preparePracticeProblem(stageId) {
  if (!window.StepMathGenerator) return;
  if (!state.activeProblem || state.activeProblem.stageId !== stageId) {
    const round = state.problemRound || 0;
    const prob = window.StepMathGenerator.buildProblem(stageId, round);
    state.activeProblem = prob;
    state.problemSolved = false;
    state.demoPlayedKey = '';
    if (prob && typeof prob.setup === 'function') prob.setup(state);
  }
}

function generateNewProblemForStage(stageId, incrementRound = true) {
  if (!window.StepMathGenerator) return;
  if (window.StepMathDemo) window.StepMathDemo.stop();
  if (incrementRound) state.problemRound = ((state.problemRound || 0) + 1) % 5;
  const prob = window.StepMathGenerator.buildProblem(stageId, state.problemRound || 0);
  state.activeProblem = prob;
  state.problemSolved = false;
  state.demoPlayedKey = '';
  if (prob && typeof prob.setup === 'function') prob.setup(state);
  renderTool();
}

function playCurrentDemo(opts = {}) {
  const prob = state.activeProblem;
  const body = $('toolBody');
  if (!prob || !prob.demo || !body || !window.StepMathDemo) return;
  state.demoPlayedKey = prob.id;
  window.StepMathDemo.play(prob.demo, body, { loops: opts.loops || 2 });
  if (!opts.quiet && prob.speakText) speak(prob.speakText);
}

function renderGoalHeader() {
  const prob = state.activeProblem;
  if (!prob) return;
  const badgesEl = $('goalBadges');
  const promptEl = $('goalPrompt');
  const dotsEl = $('goalDots');
  const solvedBar = $('goalSolvedBar');
  const solvedMsg = $('solvedMsg');
  const nextBtn = $('goalNextBtn');
  if (badgesEl) {
    badgesEl.innerHTML = (prob.goalBadges || []).map((b) => `<span class="goal-badge">${b}</span>`).join('');
  }
  if (promptEl) {
    promptEl.textContent = prob.prompt || '';
  }
  if (dotsEl) {
    const r = state.problemRound || 0;
    dotsEl.innerHTML = Array.from({ length: 5 }, (_, i) => {
      const done = i < r || (i === r && state.problemSolved);
      return `<span class="practice-dot${done ? ' done' : ''}${i === r && !state.problemSolved ? ' current' : ''}"></span>`;
    }).join('');
  }
  if (solvedBar) solvedBar.hidden = !state.problemSolved;
  if (solvedMsg) solvedMsg.textContent = `🎉 ${prob.okMsg || '참 잘했어요!'}`;
  if (nextBtn) nextBtn.textContent = (state.problemRound || 0) >= 4 ? '다음 단계로 →' : '다음 문제 →';
}

function checkProblemSolved() {
  const prob = state.activeProblem;
  if (!prob) return false;
  const body = $('toolBody');
  if (!state.problemSolved && typeof prob.check === 'function' && prob.check(state)) {
    state.problemSolved = true;
    state.stageSolvedCount = (state.stageSolvedCount || 0) + 1;
    if (window.StepMathDemo) window.StepMathDemo.stop();
    clearHintTargets(body);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${prob.stageId}단계 완료`);
    awardToken(prob.okMsg || '잘했어요!');
    renderGoalHeader();
    return true;
  }
  if (!state.problemSolved && state.settings.errorless && typeof prob.progress === 'function' && window.StepMathDemo && body) {
    const prog = prob.progress(state);
    if (prog && (prog.fromSelector || prog.toSelector)) {
      window.StepMathDemo.showFollowGuide(prog.fromSelector, prog.toSelector, body);
    }
  }
  renderGoalHeader();
  return state.problemSolved;
}

function renderTool() {
  const stage = currentStage();
  preparePracticeProblem(stage.id);
  switch (stage.tool) {
    case 'sort': renderSort(); break;
    case 'count': renderCount(); break;
    case 'compare': renderCompare(); break;
    case 'compose': renderCompose(); break;
    case 'maketen': renderMakeTen(); break;
    case 'strategy': renderStrategy(); break;
    case 'place': renderPlace(); break;
    case 'multiply': renderMultiply(); break;
    case 'fraction': renderFraction(); break;
    case 'measure': renderMeasure(); break;
    case 'shape': renderShape(); break;
    case 'data': renderData(); break;
    default:
      setToolHead('단계별 교구', '단계를 골라 주세요');
      $('toolBody').innerHTML = '<div class="guide">위에서 학습 단계를 골라 보세요.</div>';
  }
  const body = $('toolBody');
  body.dataset.stage = String(stage.id);
  body.classList.remove('activity-enter');
  Array.from(body.children).forEach((child, index) => child.style.setProperty('--activity-order', index));
  void body.offsetWidth;
  body.classList.add('activity-enter');

  const solved = checkProblemSolved();
  const prob = state.activeProblem;
  if (!solved && prob && state.view === 'activity' && !$('app')?.hidden && state.demoPlayedKey !== prob.id) {
    state.demoPlayedKey = prob.id;
    setTimeout(() => {
      if (state.activeProblem && state.activeProblem.id === prob.id && !state.problemSolved && state.view === 'activity' && !$('app')?.hidden) {
        playCurrentDemo({ loops: 1, quiet: true });
      }
    }, 220);
  }
}

/* ============================================================
   9. 특수교육 지원 도구 — 묶음 · 힌트 · 보상 · 쉬는 시간 · 말판
   ============================================================ */
function openDialog(id) {
  const dlg = $(id);
  if (!dlg) return;
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}
function closeDialog(id) {
  const dlg = $(id);
  if (!dlg) return;
  if (typeof dlg.close === 'function') dlg.close();
  else dlg.removeAttribute('open');
}

function renderBundle() {
  const b = state.bundle;
  const total = b.hundreds * 100 + b.tens * 10 + b.ones;
  const cells = Array.from({ length: 100 }, (_, i) => `<div class="one-cell${i < b.ones ? ' filled' : ''}" aria-label="${i + 1}번째 칸">${i < b.ones ? '●' : ''}</div>`).join('');
  const rods = Array.from({ length: b.tens }, () => `<span class="rod" title="십 1개">${'<span></span>'.repeat(10)}</span>`).join('');
  const flats = Array.from({ length: b.hundreds }, () => `<span class="flat" title="백 1개">${'<span></span>'.repeat(100)}</span>`).join('');
  $('bundleBoard').innerHTML = `
    <div class="bundle-board">
      <div>
        <div class="guide">점을 <b>손가락으로 끌어</b> 10칸 판에 놓아요. 10개가 되면 <b>10개 묶기</b>를 눌러요.</div>
        <div class="drag-tray">
          <span class="tray-label">끌어서 놓기</span>
          <div class="drag-token" data-bundle-add="1" role="button" tabindex="0"><span class="big">●</span><span class="tiny">1개</span></div>
          <div class="drag-token green" data-bundle-add="10" role="button" tabindex="0"><span class="big">▥</span><span class="tiny">10개</span></div>
          <div class="drag-token amber" data-bundle-add="100" role="button" tabindex="0"><span class="big">▦</span><span class="tiny">100개</span></div>
        </div>
        <div data-drop="bundle-ones" aria-label="10칸 판에 점 놓기">
          <div class="ones-frame" style="grid-template-columns:repeat(10,1fr);max-width:440px">${cells}</div>
        </div>
        <div class="bundle-help">일 ${b.ones}개 · 십 ${b.tens}개 · 백 ${b.hundreds}개</div>
      </div>
      <div class="bundle-summary">
        <div class="bundle-row"><span class="br-label">일 (1)</span><div style="display:flex;flex-wrap:wrap;gap:2px">${Array.from({ length: Math.min(b.ones, 40) }, () => '<span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:block"></span>').join('') || '<span class="bundle-help">없음</span>'}</div></div>
        <div class="bundle-row"><span class="br-label">십 (10)</span><div style="display:flex;flex-wrap:wrap;gap:4px">${rods || '<span class="bundle-help">없음</span>'}</div></div>
        <div class="bundle-row"><span class="br-label">백 (100)</span><div style="display:flex;flex-wrap:wrap;gap:4px">${flats || '<span class="bundle-help">없음</span>'}</div></div>
        <div class="bundle-row" style="justify-content:center"><span class="bundle-count">${total}</span><span class="bundle-help">${countWord(total)}</span></div>
        <div class="bundle-help">10개를 묶으면 십 1개, 십 10개를 묶으면 백 1개가 돼요.</div>
      </div>
    </div>`;
  const addOnes = (n) => {
    state.bundle.ones = clamp(state.bundle.ones + n, 0, 100);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `묶음 ${n}개`);
    haptic(12);
    renderBundle();
    const totalNow = state.bundle.hundreds * 100 + state.bundle.tens * 10 + state.bundle.ones;
    speak(`${n}개를 놓았어요. 모두 ${totalNow}개예요. 10개가 되면 10개 묶기를 눌러 보세요.`);
  };
  bindDrag($('bundleBoard'), '[data-bundle-add]', (el) => ({ n: Number(el.dataset.bundleAdd) }), (p, zone) => {
    if (zone && zone.dataset.drop === 'bundle-ones') addOnes(p.n);
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="bundle-ones"]', $('bundleBoard')); },
    onTap: () => {
      if (state.settings.errorless) showHintTarget('[data-drop="bundle-ones"]', $('bundleBoard'));
      speak('점이나 묶음을 손가락으로 끌어 10칸 판에 놓아 보세요.');
    },
    onActivate: (p) => addOnes(p.n),
  });
}
function openBundle() {
  renderBundle();
  openDialog('bundleDialog');
  announce('10개 묶기와 100개 묶기 놀이를 열었어요.');
}
function bundleTen() {
  if (state.bundle.ones < 10) { speak('일이 10개 모이면 묶을 수 있어요. 점을 더 놓아 보세요.'); return; }
  state.bundle.ones -= 10;
  state.bundle.tens += 1;
  awardToken('10개를 십 묶음 하나로 묶었어요!');
  renderBundle();
}
function bundleHundred() {
  if (state.bundle.tens >= 10) {
    state.bundle.tens -= 10;
    state.bundle.hundreds += 1;
    awardToken('십 10개를 백 묶음 하나로 묶었어요!');
  } else if (state.bundle.ones >= 100) {
    state.bundle.ones -= 100;
    state.bundle.hundreds += 1;
    awardToken('일 100개를 백 묶음 하나로 묶었어요!');
  } else {
    speak('십 10개가 모이면 백 묶음 하나로 묶을 수 있어요.');
    return;
  }
  renderBundle();
}
const REWARD_CHOICES = [
  { emoji: '👏', label: '하이파이브' },
  { emoji: '🎵', label: '신나는 음악' },
  { emoji: '🌿', label: '쉬는 시간' },
  { emoji: '🎨', label: '그림 그리기' }
];
const AAC_ITEMS = [
  { emoji: '🙋', label: '도와주세요', say: '도와주세요' },
  { emoji: '➕', label: '더', say: '더 하고 싶어요' },
  { emoji: '✋', label: '그만', say: '잠깐 그만할래요' },
  { emoji: '🔁', label: '또', say: '한 번 더 할래요' },
  { emoji: '👍', label: '좋아요', say: '좋아요' },
  { emoji: '🌿', label: '쉬고 싶어요', say: '쉬고 싶어요' },
  { emoji: '👀', label: '다시 보기', say: '다시 보여 주세요' },
  { emoji: '✅', label: '다 했어요', say: '다 했어요' }
];
function openReward() {
  const wrap = $('rewardChoices');
  if (wrap) {
    wrap.innerHTML = REWARD_CHOICES.map((r) => `<button type="button" class="aac-btn" data-reward="${r.label}"><span class="aac-emoji">${r.emoji}</span><span>${r.label}</span></button>`).join('');
    wrap.querySelectorAll('[data-reward]').forEach((b) => {
      b.onclick = () => {
        announce(`${b.dataset.reward}을 골랐어요.`);
        state.tokens = 0;
        updateTokenBoard();
        closeDialog('rewardDialog');
        renderLessonPath();
      };
    });
  }
  openDialog('rewardDialog');
}
const HINTS = {
  1: { text: '과일을 손가락으로 끌어 같은 바구니에 넣어요.', target: '[data-drop="basket:apple"]' },
  2: { text: '파란 점을 손가락으로 끌어 10칸 판에 1부터 5까지 채워요.', target: '[data-drop="count-add"]' },
  3: { text: '파란 점을 끌어 10칸 판을 6부터 10까지 차례로 채워요.', target: '[data-drop="count-add"]' },
  4: { text: '수모형을 손가락으로 끌어 알맞은 자리에 놓아요.', target: '[data-drop="place:units"]' },
  5: { text: '점을 양쪽 접시로 끌어 놓고, 더 많은 쪽을 찾아요.', target: '[data-drop="cmp:a"]' },
  6: { text: '두 묶음의 점을 손가락으로 끌어 모아 보세요.', target: '[data-cell-fill]' },
  7: { text: '점을 빼는 곳으로 끌어 덜어내고 남은 수를 세어요.', target: '[data-drop="compose-minus"]' },
  8: { text: '오른쪽 초록 점을 왼쪽 빈칸으로 끌어 10을 만들어요.', target: '[data-drop="mtLeft"]' },
  9: { text: '보라색 개구리를 좌우로 끌어 2씩·5씩·10씩 뛰어 세어 봐요.', target: '[data-nl-marker]' },
  10: { text: '보라색 개구리(🐸)를 좌우로 끌어 목표 자리(🎯)에 놓아요.', target: '[data-nl-marker]' },
  11: { text: '일 모형 10개를 10개 묶기 자리로 끌어요.', target: '[data-drop="place-bundle10"]' },
  12: { text: '십 모형 10개를 100개 묶기 자리로 끌어요.', target: '[data-drop="place-bundle100"]' },
  13: { text: '동그라미(●)나 묶음 카드를 빈 묶음 자리로 끌어다 놓아요.', target: '[data-drop="mul:0"]' },
  14: { text: '파란 점을 손가락으로 끌어 접시마다 똑같이 나누어 담아요.', target: '[data-drop="div:0"]' },
  15: { text: '분수 조각을 막대로 끌어다 놓아요.', target: '[data-drop="frac:a"]' },
  16: { text: '분수·소수 조각을 막대로 끌어다 놓아 보세요.', target: '[data-drop="frac:a"]' },
  17: { text: '연필·물 높이·추를 손가락으로 끌어 움직여 보세요.', target: '.ruler-object' },
  18: { text: '시계 바늘을 손가락으로 끌어 시간을 맞혀요.', target: '.clock-grab' },
  19: { text: '동전을 손가락으로 끌어 노란 지갑에 넣어 보세요.', target: '[data-drop="wallet"]' },
  20: { text: '도형을 손가락으로 끌어 보드에 놓아요. 두 번 누르면 돌아가요.', target: '[data-drop="shape-board"]' },
  21: { text: '과일을 손가락으로 끌어 그래프 위로 놓아요.', target: '[data-drop="data:apple"]' },
};
function giveHint(auto) {
  if (auto && state.promptLevel > 0) { scheduleAutoHint(); return; }
  const stage = currentStage();
  const hint = HINTS[stage.id] || { text: MICRO_LESSONS[stage.id]?.guided || '천천히 다시 해 보세요.', target: '#toolBody' };
  if (!auto) {
    state.promptLevel = Math.min(4, state.promptLevel + 1);
    renderPromptMeter();
  } else if (state.promptLevel === 0) {
    state.promptLevel = 1;
    renderPromptMeter();
  }
  if (state.promptLevel >= 3) modelStep(stage.id);
  else {
    showHintTarget(hint.target, $('toolBody'));
    announce(hint.text);
  }
  recordTrial('prompted', state.promptLevel, auto ? '자동 힌트' : '도움 요청');
  noteInteraction();
}
function modelStep(stageId) {
  const body = $('toolBody');
  if (!body) return false;
  const activate = (sel) => {
    const el = body.querySelector(sel);
    if (!el || el.disabled) return false;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  };
  const click = (sel) => {
    const el = body.querySelector(sel);
    if (!el || el.disabled) return false;
    el.click();
    return true;
  };
  let modeled = false;
  switch (stageId) {
    case 1: modeled = activate('[data-sort-item]'); break;
    case 2:
    case 3: modeled = activate('[data-count-token]') || click('[data-count="p1"]'); break;
    case 4: modeled = activate('[data-place-source]') || click('[data-pa="add1"]'); break;
    case 5: modeled = activate('[data-cmp-token]') || click('[data-cmp="a:1"]'); break;
    case 6:
    case 7: modeled = activate('[data-cell-fill]') || click('[data-compose="b:1"]'); break;
    case 8: modeled = activate('[data-cell-fill][data-frame="mtRight"]') || click('[data-mt="7,5"]'); break;
    case 9:
    case 10: modeled = activate('[data-nl-marker]') || click('[data-st]'); break;
    case 11:
    case 12: modeled = activate('[data-place-source]') || click('[data-pa="add1"]'); break;
    case 13: modeled = activate('[data-mul-bundle]') || activate('[data-mul-dot]'); break;
    case 14: modeled = activate('[data-div-token]') || activate('[data-mul-bundle]'); break;
    case 15:
    case 16: modeled = activate('[data-frac-piece="a"]'); break;
    case 17:
      if (state.measure.tab === 'length') {
        const range = body.querySelector('#lenRange');
        if (range) {
          range.value = String(Math.min(20, Number(range.value) + 1));
          range.dispatchEvent(new Event('input', { bubbles: true }));
          range.dispatchEvent(new Event('change', { bubbles: true }));
          recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `길이 ${state.measure.length}cm`);
          modeled = true;
        }
      } else {
        modeled = click('[data-mtab="length"]');
      }
      break;
    case 18: modeled = state.measure.tab === 'clock' ? click('[data-clock="10"]') : click('[data-mtab="clock"]'); break;
    case 19: modeled = activate('[data-coin-drag]') || click('[data-mtab="money"]'); break;
    case 20: modeled = activate('[data-shape-source]') || activate('[data-pattern-drag]'); break;
    case 21: modeled = activate('[data-data-token]'); break;
    default: modeled = false;
  }
  if (modeled) announce('같이 해 보았어요. 이제 직접 해 볼까요?');
  else announce('놀이 화면을 먼저 골라 주세요.');
  return modeled;
}
function openAac() {
  const grid = $('aacGrid');
  if (grid) {
    grid.innerHTML = AAC_ITEMS.map((a) => `<button type="button" class="aac-btn" data-aac="${a.label}" data-say="${a.say}"><span class="aac-emoji">${a.emoji}</span><span>${a.label}</span></button>`).join('');
    grid.querySelectorAll('[data-aac]').forEach((b) => {
      b.onclick = () => {
        state.aacSentence.push({ label: b.dataset.aac, say: b.dataset.say });
        renderAacSentence();
        speak(b.dataset.say);
      };
    });
  }
  renderAacSentence();
  openDialog('aacDialog');
}
function renderAacSentence() {
  const strip = $('aacSentence');
  if (!strip) return;
  strip.innerHTML = state.aacSentence.length
    ? state.aacSentence.map((w) => `<span class="bundle-item">${w.label}</span>`).join('')
    : '<span class="muted">그림을 눌러 문장을 만들어 보세요.</span>';
}
function openBreak() {
  breakRemaining = 60;
  breakPaused = false;
  renderBreakTimer();
  openDialog('breakDialog');
  startBreakTimer();
  announce('쉬는 시간이에요. 천천히 숨을 쉬어요.');
}
function renderBreakTimer() {
  const el = $('breakTimer');
  if (!el) return;
  const m = Math.floor(breakRemaining / 60);
  const s = breakRemaining % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function startBreakTimer() {
  if (breakTimer) clearInterval(breakTimer);
  breakTimer = setInterval(() => {
    if (breakPaused) return;
    breakRemaining -= 1;
    renderBreakTimer();
    if (breakRemaining <= 0) {
      clearInterval(breakTimer);
      breakTimer = null;
      announce('쉬는 시간이 끝났어요. 준비되면 활동으로 돌아가요.');
    }
  }, 1000);
}

function init() {
  loadSupportSettings();
  validateState();
  if (!state.sort.items.length) newSortRound();
  state.history = readHistory();
  state.view = 'activity';
  if ($('app')) $('app').dataset.view = state.view;
  setView('activity');
  applySettings();
  updateTokenBoard();
  renderPromptMeter();

  document.querySelectorAll('[data-course]').forEach((button) => {
    button.addEventListener('click', () => chooseCourse(button.dataset.course));
  });
  $('allActivitiesBtn').onclick = () => {
    state.course = null;
    state.courseComplete = false;
    state.lessonStep = 1;
    $('courseGate').hidden = true;
    $('app').hidden = false;
    setView('activity');
    selectStage(1);
    noteInteraction();
  };
  $('gateSettingsBtn').onclick = () => { applySettings(); openDialog('settingsDialog'); };
  $('courseBtn').onclick = showCourseGate;
  $('viewActivityBtn').onclick = () => { setView('activity'); render(); };
  $('viewCalcBtn').onclick = () => {
    if (window.StepMathDemo) window.StepMathDemo.stop();
    setView('calc');
    render();
  };
  if ($('prevStageBtn')) {
    $('prevStageBtn').onclick = () => {
      const stages = state.course ? COURSES[state.course].stageIds : STAGES.map((s) => s.id);
      const idx = stages.indexOf(state.stage);
      if (idx > 0) selectStage(stages[idx - 1]);
    };
  }
  if ($('nextStageBtn')) {
    $('nextStageBtn').onclick = () => {
      const stages = state.course ? COURSES[state.course].stageIds : STAGES.map((s) => s.id);
      const idx = stages.indexOf(state.stage);
      if (idx >= 0 && idx < stages.length - 1) selectStage(stages[idx + 1]);
    };
  }
  if ($('stagePickerBtn')) {
    $('stagePickerBtn').onclick = () => {
      renderNav();
      openDialog('stagePickerDialog');
    };
  }
  if ($('closeStagePickerBtn')) {
    $('closeStagePickerBtn').onclick = () => closeDialog('stagePickerDialog');
  }
  if ($('hubBtn')) {
    $('hubBtn').onclick = () => openDialog('hubDialog');
  }
  if ($('closeHubBtn')) {
    $('closeHubBtn').onclick = () => closeDialog('hubDialog');
  }
  if ($('goalDemoBtn')) {
    $('goalDemoBtn').onclick = () => playCurrentDemo({ loops: 2 });
  }
  if ($('goalSpeakBtn')) {
    $('goalSpeakBtn').onclick = () => {
      const prob = state.activeProblem;
      if (prob) speak(prob.speakText || prob.prompt);
    };
  }
  if ($('goalNewBtn')) {
    $('goalNewBtn').onclick = () => {
      generateNewProblemForStage(state.stage, false);
      playCurrentDemo({ loops: 1 });
    };
  }
  if ($('goalNextBtn')) {
    $('goalNextBtn').onclick = () => {
      if ((state.problemRound || 0) >= 4) {
        advanceLesson();
      } else {
        generateNewProblemForStage(state.stage, true);
      }
    };
  }
  if ($('toolBody')) {
    $('toolBody').addEventListener('pointerdown', () => {
      if (window.StepMathDemo) window.StepMathDemo.stop();
    }, { passive: true });
  }
  $('bundleBtn').onclick = () => { closeDialog('hubDialog'); openBundle(); };
  $('aacBtn').onclick = () => { closeDialog('hubDialog'); openAac(); };
  $('breakBtn').onclick = () => { closeDialog('hubDialog'); openBreak(); };
  $('teacherBtn').onclick = () => { closeDialog('hubDialog'); renderTeacher(); openDialog('teacherDialog'); };
  $('settingsBtn').onclick = () => { closeDialog('hubDialog'); applySettings(); openDialog('settingsDialog'); };
  if ($('retryBtn')) $('retryBtn').onclick = resetStageActivity;
  if ($('hintBtn')) $('hintBtn').onclick = () => giveHint(false);
  if ($('independentBtn')) {
    $('independentBtn').onclick = () => {
      state.promptLevel = 0;
      recordTrial('independent', 0, '스스로 했다고 표시');
      awardToken('스스로 했어요! 아주 좋아요.');
      renderPromptMeter();
    };
  }
  if ($('helpedBtn')) {
    $('helpedBtn').onclick = () => {
      recordTrial('prompted', Math.max(1, state.promptLevel), '도움을 받고 해냄');
      announce('도움을 받았어요. 다음에는 혼자 해 볼까요?');
    };
  }
  if ($('nextTaskBtn')) $('nextTaskBtn').onclick = advanceLesson;
  $('closeBundleBtn').onclick = () => closeDialog('bundleDialog');
  $('bundleTenBtn').onclick = bundleTen;
  $('bundleHundredBtn').onclick = bundleHundred;
  $('unbundleTenBtn').onclick = () => {
    if (state.bundle.tens <= 0) { speak('풀 십 묶음이 없어요.'); return; }
    state.bundle.tens -= 1;
    state.bundle.ones += 10;
    renderBundle();
  };
  $('bundleClearBtn').onclick = () => { state.bundle = { ones: 0, tens: 0, hundreds: 0 }; renderBundle(); };
  $('closeSettingsBtn').onclick = () => closeDialog('settingsDialog');
  $('closeRewardBtn').onclick = () => {
    state.tokens = 0;
    updateTokenBoard();
    renderLessonPath();
    closeDialog('rewardDialog');
  };
  $('closeBreakBtn').onclick = () => { if (breakTimer) { clearInterval(breakTimer); breakTimer = null; } closeDialog('breakDialog'); };
  $('closeTeacherBtn').onclick = () => closeDialog('teacherDialog');
  $('closeAacBtn').onclick = () => closeDialog('aacDialog');
  $('exportCsvBtn').onclick = downloadCSV;
  $('clearSessionBtn').onclick = () => {
    state.session = { trials: 0, independent: 0, prompted: 0, errors: 0, started: Date.now(), log: [] };
    saveSession();
    renderTeacher();
    renderPromptMeter();
    announce('오늘 기록을 지웠어요.');
  };
  $('aacSpeakBtn').onclick = () => {
    if (!state.aacSentence.length) { speak('먼저 그림을 눌러 문장을 만들어요.'); return; }
    speak(state.aacSentence.map((w) => w.say).join(', '));
  };
  $('aacClearBtn').onclick = () => { state.aacSentence = []; renderAacSentence(); };
  document.querySelectorAll('[data-break-min]').forEach((b) => {
    b.onclick = () => {
      breakRemaining = Number(b.dataset.breakMin) * 60;
      breakPaused = false;
      renderBreakTimer();
      startBreakTimer();
      announce(`${b.dataset.breakMin}분 쉬는 시간을 시작해요.`);
    };
  });
  $('breakPauseBtn').onclick = () => {
    breakPaused = !breakPaused;
    $('breakPauseBtn').textContent = breakPaused ? '계속' : '멈춤';
    if (!breakTimer) startBreakTimer();
  };
  const bindSetting = (id, key, transform) => {
    const el = $(id);
    if (!el) return;
    el.onchange = () => {
      state.settings[key] = transform ? transform(el) : (el.type === 'checkbox' ? el.checked : el.value);
      if (key === 'tokenMax') {
        state.settings.tokenMax = clamp(Number(state.settings.tokenMax) || 5, 3, 10);
        state.tokens = Math.min(state.tokens, state.settings.tokenMax);
      }
      saveSupportSettings();
      applySettings();
      render();
      announce('설정을 바꾸었어요.');
    };
  };
  bindSetting('setTextSize', 'textSize');
  bindSetting('setTouch', 'touch');
  bindSetting('setWait', 'wait', (el) => Number(el.value));
  bindSetting('setTokens', 'tokenMax', (el) => Number(el.value));
  bindSetting('setEasy', 'easy');
  bindSetting('setErrorless', 'errorless');
  bindSetting('setHaptic', 'haptic');
  document.addEventListener('pointerdown', noteInteraction, { passive: true });
  document.addEventListener('keydown', noteInteraction, { passive: true });
  scheduleAutoHint();
  if ($('goToolBtn')) $('goToolBtn').onclick = () => $('toolCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if ($('lessonModelBtn')) {
    $('lessonModelBtn').onclick = () => {
      if (!modelStep(state.stage)) return;
      if (state.lessonStep === 0) state.lessonStep = 1;
      renderLessonPath();
      renderTool();
    };
  }
  if ($('lessonPrevBtn')) {
    $('lessonPrevBtn').onclick = () => {
      if (state.lessonStep > 0) {
        state.lessonStep -= 1;
        renderLessonPath();
        renderTool();
      }
    };
  }
  if ($('lessonNextBtn')) $('lessonNextBtn').onclick = advanceLesson;

  const updateVoiceBtnUI = () => {
    const b = $('voiceBtn');
    if (!b) return;
    b.classList.toggle('on', state.voice);
    b.classList.toggle('off', !state.voice);
    b.setAttribute('aria-pressed', state.voice ? 'true' : 'false');
    b.textContent = state.voice ? '🔊 음성 안내' : '🔇 음성 꺼짐';
  };
  updateVoiceBtnUI();

  $('voiceBtn').onclick = () => {
    state.voice = !state.voice;
    updateVoiceBtnUI();
    if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
      window.D1Bridge.setSpedPrefs({ ttsAuto: state.voice });
    }
    if (!state.voice) stopSpeech();
  };
  $('resetBtn').onclick = () => clearEntry();
  $('playBtnTop').onclick = () => playConcrete();
  $('decimalKey').onclick = () => appendNumberMark('.');
  $('fractionKey').onclick = () => appendNumberMark('/');
  $('calcGrouping').addEventListener('click', (e) => {
    const button = e.target.closest('[data-group-size]');
    if (!button) return;
    state.groupingSize = Number(button.dataset.groupSize) === 100 ? 100 : 10;
    renderGrouping();
    speak(`${state.groupingSize}개씩 묶어 볼게요`);
  });
  $('clearHistoryBtn').onclick = () => {
    state.history = [];
    writeHistory();
    renderHistory();
    speak('기록을 모두 지웠어요');
  };
  $('helpBtn').onclick = () => {
    closeDialog('hubDialog');
    openDialog('helpDialog');
  };
  $('closeHelpBtn').onclick = () => closeDialog('helpDialog');
  $('helpDialog').addEventListener('click', (e) => {
    if (e.target === $('helpDialog')) closeDialog('helpDialog');
  });

  window.addEventListener('keydown', (e) => {
    if ($('app').hidden) return;
    if (document.querySelector('dialog[open]')) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    if (document.activeElement && (document.activeElement.getAttribute('role') === 'button' || document.activeElement.isContentEditable)) return;
    if (e.key >= '0' && e.key <= '9') pressDigit(e.key);
    else if (e.key === '+') pressOperator('+');
    else if (e.key === '-') pressOperator('-');
    else if (e.key === '*') pressOperator('×');
    else if (e.key === '/') { e.preventDefault(); pressOperator('÷'); }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); pressEquals(); }
    else if (e.key === '.') appendNumberMark('.');
    else if (e.key === 'Backspace') { e.preventDefault(); pressBackspace(); }
    else if (e.key === 'Escape') clearEntry();
  });

  if (window.D1Bridge && window.D1Bridge.onSpedPrefsChange) {
    window.D1Bridge.onSpedPrefsChange((prefs) => {
      if (!prefs) return;
      state.settings.easy = !!prefs.easyMode;
      state.voice = !!prefs.ttsAuto;
      const vb = $('voiceBtn');
      if (vb) {
        vb.classList.toggle('on', state.voice);
        vb.classList.toggle('off', !state.voice);
        vb.setAttribute('aria-pressed', state.voice ? 'true' : 'false');
        vb.textContent = state.voice ? '🔊 음성 안내' : '🔇 음성 꺼짐';
      }
      applySettings();
      render();
    });
  }

  render();
}

init();
