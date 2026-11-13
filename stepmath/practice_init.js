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
  if (state.lessonStep === 0) return;
  const cur = STAGE_CURRICULUM[stageId];
  if (!cur || !cur.problems || !cur.problems.length) return;
  const idx = clamp(state.practice.idxByStage[stageId] ?? 0, 0, cur.problems.length - 1);
  state.practice.idxByStage[stageId] = idx;
  const key = `${stageId}:${idx}`;
  if (state.practice.activeKey !== key) {
    state.practice.activeKey = key;
    state.practice.selected = null;
    state.practice.feedback = null;
    state.practice.hintShown = false;
    const prob = cur.problems[idx];
    if (prob && typeof prob.setup === 'function') prob.setup(state);
  }
}

function renderLessonStageOverlay(stageId) {
  const cur = STAGE_CURRICULUM[stageId];
  const body = $('toolBody');
  if (!cur || !body) return;

  const isExample = state.lessonStep === 0;
  const pIdx = clamp(state.practice.idxByStage[stageId] ?? 0, 0, cur.problems.length - 1);
  const prob = cur.problems[pIdx];
  const key = `${stageId}:${pIdx}`;
  const isSolved = Boolean(state.practice.solved[key]);

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '12px';

  const modeBarHTML = `
    <div class="lesson-mode-bar" role="tablist" aria-label="학습 순서 선택">
      <button type="button" class="lesson-mode-tab example${isExample ? ' active' : ''}" data-lmode="example" role="tab" aria-selected="${isExample}">👀 1. 예시 문제 보기</button>
      <button type="button" class="lesson-mode-tab practice${!isExample ? ' active' : ''}" data-lmode="practice" role="tab" aria-selected="${!isExample}">✏️ 2. 직접 문제 풀기 (${pIdx + 1}/${cur.problems.length})</button>
    </div>`;

  if (isExample) {
    const ex = cur.example;
    wrapper.innerHTML = `${modeBarHTML}
      <section class="example-card" aria-label="선생님 예시 문제">
        <span class="example-badge">👩‍🏫 먼저 예시를 보아요 · I Do</span>
        <div class="example-problem">${ex.problem}</div>
        <div class="example-visual">${ex.visual}</div>
        <div class="example-steps">${ex.steps.map((st, i) => `<div class="example-step"><span class="step-num">${i + 1}</span><span>${st}</span></div>`).join('')}</div>
        <div class="example-actions">
          <button type="button" class="btn amber" data-ex-speak>🔊 예시 설명 듣기</button>
          <button type="button" class="btn green" data-go-practice>✏️ 이제 내가 풀어볼까요? →</button>
        </div>
      </section>
      <div class="tool-sandbox-label">👇 아래 교구도 직접 만져 볼 수 있어요</div>`;
  } else {
    const promptText = (state.settings.easy && prob.easyPrompt) ? prob.easyPrompt : prob.prompt;
    const dotsHTML = cur.problems.map((_, i) => {
      const done = Boolean(state.practice.solved[`${stageId}:${i}`]);
      return `<span class="practice-dot${done ? ' done' : ''}${i === pIdx ? ' current' : ''}" title="문제 ${i + 1}"></span>`;
    }).join('');
    const fb = state.practice.feedback;
    const isLastProb = pIdx === cur.problems.length - 1;
    let answerAreaHTML = '';
    if (prob.type === 'choice') {
      answerAreaHTML = `<div class="practice-choices">${prob.choices.map((c) => {
        let cls = 'practice-choice';
        if (state.practice.selected === c.value) cls += (c.value === prob.answer ? ' correct' : ' wrong');
        return `<button type="button" class="${cls}" data-pchoice="${c.value}">${c.label}</button>`;
      }).join('')}</div>`;
    } else {
      answerAreaHTML = `<div class="row-flex" style="margin-top:0">
        <button type="button" class="btn primary" data-pcheck>✓ 다 했어요! 정답 확인</button>
      </div>`;
    }
    wrapper.innerHTML = `${modeBarHTML}
      <section class="practice-card" aria-label="직접 문제 풀기">
        <div class="practice-head">
          <span class="practice-badge">✏️ 직접 풀기 · 문제 ${pIdx + 1} / ${cur.problems.length}</span>
          <div class="practice-progress" aria-label="문제 진행 상태">${dotsHTML}</div>
        </div>
        <div class="practice-prompt">${promptText}</div>
        ${state.practice.hintShown ? `<div class="practice-hint-box">💡 힌트: ${prob.hint}</div>` : ''}
        ${answerAreaHTML}
        ${fb ? `<div class="practice-feedback ${fb.ok ? 'ok' : 'retry'}">${fb.text}</div>` : ''}
        <div class="practice-actions">
          <div class="row-flex" style="margin-top:0">
            <button type="button" class="btn soft" data-p-speak>🔊 문제 듣기</button>
            <button type="button" class="btn amber" data-p-hint>💡 힌트</button>
            <button type="button" class="btn soft" data-back-example>👀 예시 다시 보기</button>
          </div>
          ${(isSolved || (fb && fb.ok))
            ? `<button type="button" class="btn green" data-p-next>${isLastProb ? '다음 놀이로 →' : `다음 문제 (${pIdx + 2}/${cur.problems.length}) →`}</button>`
            : ''}
        </div>
      </section>
      <div class="tool-sandbox-label">👇 아래 교구를 움직여 문제를 풀어 보세요</div>`;
  }

  body.prepend(wrapper);

  wrapper.querySelectorAll('[data-lmode]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.lmode === 'example') {
        state.lessonStep = 0;
        state.practice.activeKey = '';
      } else {
        state.lessonStep = Math.max(1, state.lessonStep);
      }
      renderLessonPath();
      renderTool();
      speak(state.lessonStep === 0 ? '예시 문제를 먼저 살펴보아요.' : '이제 직접 문제를 풀어 볼까요?');
    };
  });

  const exSpeak = wrapper.querySelector('[data-ex-speak]');
  if (exSpeak) exSpeak.onclick = () => speak(cur.example.speakText);

  const goPractice = wrapper.querySelector('[data-go-practice]');
  if (goPractice) {
    goPractice.onclick = () => {
      state.lessonStep = 1;
      state.practice.activeKey = '';
      renderLessonPath();
      renderTool();
      speak('좋아요! 이제 직접 문제를 풀어 볼까요?');
    };
  }

  const backEx = wrapper.querySelector('[data-back-example]');
  if (backEx) {
    backEx.onclick = () => {
      state.lessonStep = 0;
      state.practice.activeKey = '';
      renderLessonPath();
      renderTool();
      speak('예시 문제를 다시 보아요.');
    };
  }

  const pSpeak = wrapper.querySelector('[data-p-speak]');
  if (pSpeak) pSpeak.onclick = () => speak((state.settings.easy && prob.easyPrompt) ? prob.easyPrompt : prob.prompt);

  const pHint = wrapper.querySelector('[data-p-hint]');
  if (pHint) {
    pHint.onclick = () => {
      state.practice.hintShown = !state.practice.hintShown;
      if (state.practice.hintShown) {
        recordTrial('prompted', Math.max(1, state.promptLevel), `${stageId}단계 문제 힌트`);
        speak(prob.hint);
      }
      renderTool();
    };
  }

  wrapper.querySelectorAll('[data-pchoice]').forEach((btn) => {
    btn.onclick = () => {
      const val = btn.dataset.pchoice;
      state.practice.selected = val;
      const ok = val === prob.answer;
      if (ok) {
        state.practice.solved[key] = true;
        state.practice.feedback = { ok: true, text: `🎉 ${prob.okMsg}` };
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${stageId}단계 문제 ${pIdx + 1} 정답`);
        awardToken(prob.okMsg);
      } else {
        state.practice.hintShown = true;
        state.practice.feedback = { ok: false, text: `괜찮아요! 다시 한 번 살펴볼까요? 💡 ${prob.hint}` };
        recordTrial('error', state.promptLevel, `${stageId}단계 문제 ${pIdx + 1} 오답`);
        haptic(40);
        speak(`괜찮아요. ${prob.hint}`);
      }
      renderTool();
    };
  });

  const pCheck = wrapper.querySelector('[data-pcheck]');
  if (pCheck) {
    pCheck.onclick = () => {
      const ok = typeof prob.check === 'function' ? prob.check(state) : false;
      if (ok) {
        state.practice.solved[key] = true;
        state.practice.feedback = { ok: true, text: `🎉 ${prob.okMsg}` };
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${stageId}단계 교구 문제 ${pIdx + 1} 정답`);
        awardToken(prob.okMsg);
      } else {
        state.practice.hintShown = true;
        state.practice.feedback = { ok: false, text: `조금만 더 맞춰 볼까요? 💡 ${prob.hint}` };
        recordTrial('error', state.promptLevel, `${stageId}단계 교구 문제 ${pIdx + 1} 미완성`);
        haptic(40);
        speak(prob.hint);
      }
      renderTool();
    };
  }

  const pNext = wrapper.querySelector('[data-p-next]');
  if (pNext) {
    pNext.onclick = () => {
      if (pIdx < cur.problems.length - 1) {
        state.practice.idxByStage[stageId] = pIdx + 1;
        state.practice.activeKey = '';
        state.practice.selected = null;
        state.practice.feedback = null;
        state.practice.hintShown = false;
        state.lessonStep = 2;
        renderLessonPath();
        renderTool();
        speak(`문제 ${pIdx + 2}번이에요. 천천히 풀어 보세요.`);
      } else {
        state.lessonStep = 2;
        advanceLesson();
      }
    };
  }
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
  renderLessonStageOverlay(stage.id);
  const body = $('toolBody');
  body.dataset.stage = String(stage.id);
  body.classList.remove('activity-enter');
  Array.from(body.children).forEach((child, index) => child.style.setProperty('--activity-order', index));
  void body.offsetWidth;
  body.classList.add('activity-enter');
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
  $('bundleBoard').querySelectorAll('[data-bundle-add]').forEach((t) => { t.onclick = () => addOnes(Number(t.dataset.bundleAdd)); });
  bindDrag($('bundleBoard'), '[data-bundle-add]', (el) => ({ n: Number(el.dataset.bundleAdd) }), (p, zone) => {
    if (zone && zone.dataset.drop === 'bundle-ones') addOnes(p.n);
  }, { onActivate: (p) => addOnes(p.n) });
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
  1: { text: '같은 과일끼리 모아요. 사과는 사과 바구니에 넣어요.', target: '[data-drop="basket:apple"]' },
  2: { text: '점을 칸 위로 눌러 1부터 5까지 하나씩 채워요.', target: '[data-drop="count-add"]' },
  3: { text: '10칸 판을 6부터 10까지 차례로 채워요.', target: '[data-drop="count-add"]' },
  4: { text: '점을 양쪽 접시에 나누어 놓고, 더 많은 쪽을 찾아요.', target: '[data-drop="cmp:a"]' },
  5: { text: '두 묶음을 하나로 모아 모두 몇 개인지 세어요.', target: '[data-cell-fill]' },
  6: { text: '전체에서 빼는 수만큼 덜어내어 남은 수를 세어요.', target: '[data-cell-fill]' },
  7: { text: '오른쪽 점을 왼쪽 빈칸으로 끌어 10을 만들어요.', target: '[data-drop="mtLeft:0"]' },
  8: { text: '보라색 개구리를 끌어 목표 자리에 놓아요.', target: '[data-nl-marker]' },
  9: { text: '일 모형 10개를 10개 묶기 자리로 끌어요.', target: '[data-drop="place-bundle10"]' },
  10: { text: '십 모형 10개를 100개 묶기 자리로 끌어요.', target: '[data-drop="place-bundle100"]' },
  11: { text: '묶음 카드를 빈 자리로 끌어다 놓아요.', target: '[data-drop="mul:0"]' },
  12: { text: '접시마다 똑같은 개수가 되도록 나누어 담아요.', target: '[data-drop="mul:0"]' },
  13: { text: '분수 조각을 막대로 끌어다 놓아요.', target: '[data-drop="frac:a"]' },
  14: { text: '소수점(.) 버튼을 눌러 소수 식을 만들어 보세요.', target: '[data-drop="frac:a"]' },
  15: { text: '자·비커·저울 눈금을 손가락으로 움직여 보세요.', target: '.ruler-object' },
  16: { text: '시계 바늘을 돌리거나 동전을 눌러 금액을 맞혀요.', target: '.clock-grab' },
  17: { text: '도형을 보드로 끌어다 놓아요. 두 번 누르면 돌아가요.', target: '[data-drop="shape-board"]' },
  18: { text: '과일을 그래프 위로 끌어다 놓아요.', target: '[data-drop="data:apple"]' },
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
  const click = (sel) => {
    const el = body.querySelector(sel);
    if (!el || el.disabled) return false;
    el.click();
    return true;
  };
  let modeled = false;
  switch (stageId) {
    case 1: modeled = click('[data-sort-item]'); break;
    case 2: modeled = click('[data-count="p1"]'); break;
    case 3: modeled = click('[data-cmp="a:1"]'); break;
    case 4: modeled = click('[data-compose="b:1"]'); break;
    case 5: modeled = click('[data-mt="7,5"]'); break;
    case 6: modeled = click('[data-st]'); break;
    case 7: modeled = click('[data-pa="add1"]'); break;
    case 8: modeled = click('[data-mul-bundle]'); break;
    case 9: modeled = click('[data-frac-piece="a"]'); break;
    case 10:
      modeled = click('[data-mtab="length"]');
      if (modeled) {
        const range = body.querySelector('#lenRange');
        if (range) {
          range.value = String(Math.min(20, Number(range.value) + 1));
          range.dispatchEvent(new Event('input', { bubbles: true }));
          range.dispatchEvent(new Event('change', { bubbles: true }));
          recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `길이 ${state.measure.length}cm`);
        }
      }
      break;
    case 11: modeled = click('[data-shape-source]'); break;
    case 12: modeled = click('[data-data-token]'); break;
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
    state.lessonStep = 0;
    $('courseGate').hidden = true;
    $('app').hidden = false;
    setView('activity');
    selectStage(1);
    noteInteraction();
  };
  $('gateSettingsBtn').onclick = () => { applySettings(); openDialog('settingsDialog'); };
  $('courseBtn').onclick = showCourseGate;
  $('viewActivityBtn').onclick = () => { setView('activity'); render(); };
  $('viewCalcBtn').onclick = () => { setView('calc'); render(); };
  $('bundleBtn').onclick = openBundle;
  $('aacBtn').onclick = openAac;
  $('breakBtn').onclick = openBreak;
  $('teacherBtn').onclick = () => { renderTeacher(); openDialog('teacherDialog'); };
  $('settingsBtn').onclick = () => { applySettings(); openDialog('settingsDialog'); };
  $('retryBtn').onclick = resetStageActivity;
  $('hintBtn').onclick = () => giveHint(false);
  $('independentBtn').onclick = () => {
    state.promptLevel = 0;
    recordTrial('independent', 0, '스스로 했다고 표시');
    awardToken('스스로 했어요! 아주 좋아요.');
    renderPromptMeter();
  };
  $('helpedBtn').onclick = () => {
    recordTrial('prompted', Math.max(1, state.promptLevel), '도움을 받고 해냄');
    announce('도움을 받았어요. 다음에는 혼자 해 볼까요?');
  };
  $('nextTaskBtn').onclick = advanceLesson;
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
  bindSetting('setMotion', 'motion');
  bindSetting('setContrast', 'contrast');
  bindSetting('setEasy', 'easy');
  bindSetting('setErrorless', 'errorless');
  bindSetting('setHaptic', 'haptic');
  document.addEventListener('pointerdown', noteInteraction, { passive: true });
  document.addEventListener('keydown', noteInteraction, { passive: true });
  scheduleAutoHint();
  $('goToolBtn').onclick = () => $('toolCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  $('lessonModelBtn').onclick = () => {
    if (!modelStep(state.stage)) return;
    if (state.lessonStep === 0) state.lessonStep = 1;
    renderLessonPath();
    renderTool();
  };
  $('lessonPrevBtn').onclick = () => {
    if (state.lessonStep > 0) {
      state.lessonStep -= 1;
      if (state.lessonStep === 0) state.practice.activeKey = '';
      renderLessonPath();
      renderTool();
      speak(['살펴보기로 돌아왔어요.', '함께 해보기로 돌아왔어요.'][state.lessonStep]);
    }
  };
  $('lessonNextBtn').onclick = advanceLesson;

  $('voiceBtn').onclick = () => {
    state.voice = !state.voice;
    const b = $('voiceBtn');
    b.classList.toggle('on', state.voice);
    b.classList.toggle('off', !state.voice);
    b.setAttribute('aria-pressed', state.voice ? 'true' : 'false');
    b.textContent = state.voice ? '🔊 음성 안내' : '🔇 음성 꺼짐';
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
    const dlg = $('helpDialog');
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  };
  $('closeHelpBtn').onclick = () => {
    const dlg = $('helpDialog');
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  };
  $('helpDialog').addEventListener('click', (e) => {
    if (e.target === $('helpDialog')) {
      if (typeof $('helpDialog').close === 'function') $('helpDialog').close();
    }
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

  render();
}

init();
