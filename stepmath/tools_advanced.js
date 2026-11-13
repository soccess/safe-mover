"use strict";

/* ============================================================
   7. 단계별 교구 — 7~12단계
   ============================================================ */
function modifyParts(kind) {
  const p = { hundreds: state.parts.hundreds, tens: state.parts.tens, units: state.parts.units };
  if (kind === 'add1') p.units += 1;
  else if (kind === 'add10') p.tens += 1;
  else if (kind === 'add100') p.hundreds += 1;
  else if (kind === 'bundle') {
    if (p.units < 10) { speak('일모형이 10개 모이면 묶을 수 있어요'); return; }
    p.tens += Math.floor(p.units / 10);
    p.units %= 10;
  } else if (kind === 'bundle100') {
    if (p.tens < 10) { speak('십모형 10개가 모이면 백모형 하나로 묶을 수 있어요'); return; }
    p.hundreds += Math.floor(p.tens / 10);
    p.tens %= 10;
  } else if (kind === 'unbundle100') {
    if (p.hundreds <= 0) { speak('풀 백모형이 없어요'); return; }
    p.hundreds -= 1;
    p.tens += 10;
  } else if (kind === 'unbundle') {
    if (p.tens <= 0) { speak('풀 십모형이 없어요'); return; }
    p.tens -= 1;
    p.units += 10;
  } else if (kind === 'sub1') {
    if (p.units > 0) p.units -= 1;
    else if (p.tens > 0) { p.tens -= 1; p.units += 9; }
    else if (p.hundreds > 0) { p.hundreds -= 1; p.tens += 9; p.units += 9; }
    else return;
  } else if (kind === 'clear') {
    p.hundreds = 0; p.tens = 0; p.units = 0;
  }
  const t = totalOf(p);
  if (t < 0 || t > 999) return;
  state.parts = p;
  speak(`${countWord(t)}`);
  renderTool();
}

function renderPlace() {
  const p = state.parts;
  const total = totalOf(p);
  const body = $('toolBody');
  const flats = Array.from({ length: p.hundreds }, () => `<div class="flat" data-place-item="hundreds" role="button" tabindex="0" title="백모형 · 끌어서 풀 수 있어요">${'<span></span>'.repeat(100)}</div>`).join('');
  const rods = Array.from({ length: p.tens }, () => `<button type="button" class="rod" data-unbundle data-place-item="tens" title="십모형 · 누르거나 끌어서 일모형 10개로 풀 수 있어요">${'<span></span>'.repeat(10)}</button>`).join('');
  const units = Array.from({ length: p.units }, () => `<button type="button" class="unit" data-remove data-place-item="units" title="일모형 · 누르면 1개 줄어요"></button>`).join('');
  setToolHead('🧱 자릿값 수모형', '수모형을 끌어 자리 칸에 놓고, 10개·100개를 묶어요');
  body.innerHTML = `
    <div class="chips">
      <span class="chip" style="background:#d97706">백모형(100) <b>${p.hundreds}</b></span>
      <span class="chip" style="background:#16a34a">십모형(10) <b>${p.tens}</b></span>
      <span class="chip" style="background:#2563eb">일모형(1) <b>${p.units}</b></span>
      <span class="total-badge">${total}</span>
    </div>
    <div class="drag-tray">
      <span class="tray-label">수모형을 끌어서 자리 칸에 놓기</span>
      <div class="place-source one" data-place-source="1" role="button" tabindex="0"><span class="ps-icon">🟦</span>일 1</div>
      <div class="place-source ten" data-place-source="10" role="button" tabindex="0"><span class="ps-icon">🟩</span>십 10</div>
      <div class="place-source hundred" data-place-source="100" role="button" tabindex="0"><span class="ps-icon">🟧</span>백 100</div>
    </div>
    <div class="place-columns">
      <div class="place-col hundreds" data-drop="place:hundreds">
        <div class="pc-head"><span>🟧 백의 자리</span><span>${p.hundreds}개</span></div>
        <div class="pc-body">${flats || '<span class="muted">백모형을 놓아요</span>'}</div>
      </div>
      <div class="place-col tens" data-drop="place:tens">
        <div class="pc-head"><span>🟩 십의 자리</span><span>${p.tens}개</span></div>
        <div class="pc-body">${rods || '<span class="muted">십모형을 놓아요</span>'}</div>
      </div>
      <div class="place-col units" data-drop="place:units">
        <div class="pc-head"><span>🟦 일의 자리</span><span>${p.units}개</span></div>
        <div class="pc-body">${units || '<span class="muted">일모형을 놓아요</span>'}</div>
      </div>
    </div>
    <div class="place-bundle-zones">
      <div class="place-bundle-zone" data-drop="place-bundle10"><strong>10개 묶기</strong>일모형 10개를 여기로 끌어요</div>
      <div class="place-bundle-zone" data-drop="place-bundle100"><strong>100개 묶기</strong>십모형 10개를 여기로 끌어요</div>
      <div class="place-bundle-zone" data-drop="place-unbundle10"><strong>십 1개 풀기</strong>십모형을 여기로 끌면 일 10개</div>
      <div class="place-bundle-zone" data-drop="place-unbundle100"><strong>백 1개 풀기</strong>백모형을 여기로 끌면 십 10개</div>
    </div>
    <div class="digit-table">
      <div class="digit-col"><span class="p">백의 자리</span><span class="d">${p.hundreds}</span></div>
      <div class="digit-col"><span class="p">십의 자리</span><span class="d">${p.tens}</span></div>
      <div class="digit-col"><span class="p">일의 자리</span><span class="d">${p.units}</span></div>
    </div>
    <div class="guide"><b>${total} = ${p.hundreds * 100} + ${p.tens * 10} + ${p.units}</b> · ${countWord(total)}</div>
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-pa="bundle" ${p.units < 10 ? 'disabled' : ''}>10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-pa="bundle100" ${p.tens < 10 ? 'disabled' : ''}>100개 묶기</button>
      <button type="button" class="btn soft" data-pa="unbundle" ${p.tens <= 0 ? 'disabled' : ''}>십모형 풀기</button>
      <button type="button" class="btn soft" data-pa="unbundle100" ${p.hundreds <= 0 ? 'disabled' : ''}>백모형 풀기</button>
    </div>
    <div class="row-flex">
      <button type="button" class="btn primary" data-pa="add1">＋ 일모형 1</button>
      <button type="button" class="btn green" data-pa="add10">＋ 십모형 1</button>
      <button type="button" class="btn amber" data-pa="add100">＋ 백모형 1</button>
      <button type="button" class="btn soft" data-pa="sub1">－ 1</button>
      <button type="button" class="btn soft" data-pa="clear">비우기</button>
      <button type="button" class="btn violet" data-pa="use">계산기에 넣기</button>
    </div>`;

  const afterModify = (kind) => {
    const before = totalOf(state.parts);
    modifyParts(kind);
    if (kind === 'bundle' && before !== totalOf(state.parts)) awardToken('일 10개를 십 1개로 묶었어요!');
    if (kind === 'bundle100' && before !== totalOf(state.parts)) awardToken('십 10개를 백 1개로 묶었어요!');
  };
  body.querySelectorAll('[data-pa]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.pa === 'use') setFirstNumber(total);
      else afterModify(b.dataset.pa);
    };
  });
  body.querySelectorAll('[data-remove]').forEach((b) => { b.onclick = () => afterModify('sub1'); });
  body.querySelectorAll('[data-unbundle]').forEach((b) => { b.onclick = () => afterModify('unbundle'); });

  const placeSource = (value, zone) => {
    const drop = (zone.dataset.drop || '');
    const expected = value === 1 ? 'place:units' : value === 10 ? 'place:tens' : 'place:hundreds';
    if (drop !== expected) {
      recordTrial('error', state.promptLevel, `수모형 ${value} 자리`);
      haptic(35);
      speak(value === 1 ? '일모형은 일의 자리에 놓아요.' : value === 10 ? '십모형은 십의 자리에 놓아요.' : '백모형은 백의 자리에 놓아요.');
      showHintTarget(`[data-drop="${expected}"]`, body);
      return;
    }
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `수모형 ${value} 놓기`);
    afterModify(value === 1 ? 'add1' : value === 10 ? 'add10' : 'add100');
  };
  body.querySelectorAll('[data-place-source]').forEach((t) => {
    t.onclick = () => {
      const v = Number(t.dataset.placeSource);
      afterModify(v === 1 ? 'add1' : v === 10 ? 'add10' : 'add100');
    };
  });
  bindDrag(body, '[data-place-source]', (el) => ({ value: Number(el.dataset.placeSource) }), (p, zone) => {
    if (!zone) return;
    placeSource(p.value, zone);
  }, {
    onStart: (p) => {
      if (!state.settings.errorless) return;
      showHintTarget(`[data-drop="${p.value === 1 ? 'place:units' : p.value === 10 ? 'place:tens' : 'place:hundreds'}"]`, body);
    },
    onActivate: (p) => afterModify(p.value === 1 ? 'add1' : p.value === 10 ? 'add10' : 'add100'),
  });
  bindDrag(body, '[data-place-item]', (el) => ({ from: el.dataset.placeItem }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop === 'place-bundle10' && p.from === 'units') {
      if (state.parts.units < 10) { speak('일모형이 10개 모이면 묶을 수 있어요.'); return; }
      afterModify('bundle');
    } else if (drop === 'place-bundle100' && p.from === 'tens') {
      if (state.parts.tens < 10) { speak('십모형이 10개 모이면 묶을 수 있어요.'); return; }
      afterModify('bundle100');
    } else if (drop === 'place-unbundle10' && p.from === 'tens') {
      afterModify('unbundle');
    } else if (drop === 'place-unbundle100' && p.from === 'hundreds') {
      afterModify('unbundle100');
    } else if (drop.startsWith('place:')) {
      speak('같은 자리 안에서는 그대로 있어요.');
    }
  }, {
    onStart: (p) => {
      if (!state.settings.errorless) return;
      if (p.from === 'units') showHintTarget('[data-drop="place-bundle10"]', body);
      if (p.from === 'tens') showHintTarget('[data-drop="place-bundle100"]', body);
    },
  });
}

function renderMultiply() {
  const { first, op, second, result } = activeCalc();
  const body = $('toolBody');
  if (op === '÷') {
    const d = second === 0 ? null : divideInfo(first, second);
    if (!d) {
      setToolHead('➗ 똑같이 나누기', '0으로는 나눌 수 없어요');
      body.innerHTML = '<div class="guide">다른 수를 골라 보세요.</div>';
      return;
    }
    const key = `${first}÷${second}`;
    if (state.divKey !== key) { state.divKey = key; state.divPlates = Array(Math.min(second, 12)).fill(0); state.divRem = 0; }
    const plateCount = Math.min(second, 12);
    if (state.divPlates.length !== plateCount) state.divPlates = Array(plateCount).fill(0);
    const totalPlaced = state.divPlates.reduce((s, v) => s + v, 0) + state.divRem;
    const finished = totalPlaced >= first;
    const platesHtml = Array.from({ length: plateCount }, (_, i) => `
      <div class="plate-slot" data-drop="div:${i}">
        <div class="ps-title">${i + 1}번 접시 · ${state.divPlates[i]}개</div>
        <div class="ps-dots">${Array.from({ length: state.divPlates[i] }, () => '<span class="ps-dot"></span>').join('') || '<span class="muted" style="font-size:10px">여기에 놓아요</span>'}</div>
      </div>`).join('');
    setToolHead('➗ 똑같이 나누기', `${first}개를 ${second}곳에 똑같이 끌어 나누어요`);
    body.innerHTML = `
      <div class="guide">전체 <b>${first}개</b>를 <b>${second}곳</b>에 똑같이 나누어요. 점을 접시로 <b>끌어다 놓으세요</b>. 남는 점은 남는 곳에 놓아요.</div>
      <div class="drag-tray"><span class="tray-label">점을 끌어서 접시에 나누기</span>
        <div class="drag-token blue" data-div-token role="button" tabindex="0"><span class="big">●</span><span class="tiny">1개</span></div>
        <div class="drop-plate" data-drop="div-rem" style="min-height:52px;padding:7px 10px;border-color:#fcd34d;background:#fffbeb;flex:1">
          <div class="plate-title" style="margin:0"><span>🟡 남는 것 · ${state.divRem}개</span></div>
        </div>
      </div>
      <div class="plate-grid">${platesHtml}</div>
      <div class="guide" style="font-size:15px"><b>${first} ÷ ${second} = ${d.q}${d.r ? ` … ${d.r}` : ''}</b> · 지금까지 놓은 점 <b>${totalPlaced}</b>개</div>
      ${finished ? `<div class="feedback" style="color:#16a34a">한 곳에 ${d.q}개씩, 남는 것 ${d.r}개예요. 나누기를 완성했어요!</div>` : ''}
      <div class="row-flex" style="margin-top:0">
        <button type="button" class="bundle-big-btn blue" data-div-bundle="ten">10개 묶기</button>
        <button type="button" class="bundle-big-btn" data-div-bundle="hundred">100개 묶기</button>
      </div>
      <div class="row-flex">
        <button type="button" class="btn green" data-div="12,3">12 ÷ 3</button>
        <button type="button" class="btn green" data-div="14,4">14 ÷ 4</button>
        <button type="button" class="btn soft" data-div="20,5">20 ÷ 5</button>
        <button type="button" class="btn soft" data-div-reset>처음부터</button>
      </div>`;
    const afterDivide = () => {
      const placed = state.divPlates.reduce((s, v) => s + v, 0) + state.divRem;
      if (placed >= first) awardToken('똑같이 나누기를 완성했어요!');
      else speak(`${placed}개를 나누었어요. ${first - placed}개 남았어요.`);
      renderTool();
    };
    body.querySelectorAll('[data-div]').forEach((b) => {
      b.onclick = () => {
        const [x, y] = b.dataset.div.split(',').map(Number);
        loadExpression(x, '÷', y);
      };
    });
    const reset = body.querySelector('[data-div-reset]');
    if (reset) reset.onclick = () => { state.divPlates = Array(plateCount).fill(0); state.divRem = 0; renderTool(); };
    body.querySelectorAll('[data-div-bundle]').forEach((b) => {
      b.onclick = () => {
        if (b.dataset.divBundle === 'ten') {
          if (first < 10) { speak('10개가 모이면 십 묶음 하나로 묶을 수 있어요.'); return; }
          awardToken('10개를 십 묶음 하나로 묶었어요!');
          speak(`10개는 십 묶음 하나예요. ${first}개는 십 ${Math.floor(first / 10)}개와 ${first % 10}개예요.`);
        } else {
          speak('100개는 십 묶음 10개예요.');
        }
      };
    });
    bindDrag(body, '[data-div-token]', () => ({ one: 1 }), (p, zone) => {
      if (!zone) return;
      const drop = zone.dataset.drop || '';
      if (drop.startsWith('div:')) {
        const i = Number(drop.split(':')[1]);
        if (state.divPlates[i] >= d.q) { speak('이 접시는 가득 찼어요. 다른 접시에 놓아 보세요.'); return; }
        if (state.divPlates[i] + state.divRem + state.divPlates.reduce((s, v, idx) => idx === i ? s : s + v, 0) >= first) { speak('이미 모든 점을 나누었어요.'); return; }
        state.divPlates[i] += 1;
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${i + 1}번 접시`);
        afterDivide();
      } else if (drop === 'div-rem') {
        if (state.divRem >= d.r) { speak('남는 것은 이만큼이에요.'); return; }
        state.divRem += 1;
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '남는 것');
        afterDivide();
      }
    }, {
      onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="div:0"]', body); },
      onActivate: () => {
        const i = state.divPlates.findIndex((v) => v < d.q);
        if (i >= 0) { state.divPlates[i] += 1; afterDivide(); }
        else if (state.divRem < d.r) { state.divRem += 1; afterDivide(); }
      },
    });
    return;
  }

  if (op !== '×') {
    setToolHead('✖️ 묶음 곱셈', '같은 수씩 여러 묶음을 만들어 보세요');
    body.innerHTML = `
      <div class="guide">계산기에서 <b>×</b>를 누르면 같은 수씩 묶는 곱셈 교구가 나타나요. <b>÷</b>는 똑같이 나누는 교구로 바뀝니다.</div>
      <div class="row-flex">
        <button type="button" class="btn primary" data-mul-ex="3,4">3 × 4</button>
        <button type="button" class="btn primary" data-mul-ex="5,3">5 × 3</button>
        <button type="button" class="btn green" data-mul-ex="12,3">12 ÷ 3</button>
        <button type="button" class="btn soft" data-mul-ex="14,4">14 ÷ 4</button>
      </div>`;
    body.querySelectorAll('[data-mul-ex]').forEach((b) => {
      b.onclick = () => {
        const [x, y] = b.dataset.mulEx.split(',').map(Number);
        loadExpression(x, b.textContent.includes('÷') ? '÷' : '×', y);
      };
    });
    return;
  }

  const a = clamp(first ?? 3, 1, 12);
  const b = clamp(second ?? 4, 1, 10);
  if (second === null) {
    setToolHead('✖️ 묶음 곱셈', '다음 수를 눌러 주세요');
    body.innerHTML = `<div class="guide">한 묶음에 몇 개씩 담을지, 모두 몇 묶음인지 숫자를 넣어 보세요.</div>
      <div class="row-flex"><button type="button" class="btn primary" data-mul-ex2="3,4">3 × 4로 연습하기</button></div>`;
    const nextEx = body.querySelector('[data-mul-ex2]');
    if (nextEx) nextEx.onclick = () => loadExpression(3, '×', 4);
    return;
  }
  if (second === 0) {
    setToolHead('✖️ 묶음 곱셈', '0묶음이면 모두 0개예요');
    body.innerHTML = `
      <div class="guide"><b>${first}개씩 0묶음</b>이면 아무것도 없어서 <b>0개</b>예요. (${first} × 0 = 0)</div>
      <div class="row-flex">
        <button type="button" class="btn primary" data-mul-ex2="3,4">3 × 4로 연습하기</button>
      </div>`;
    const zeroEx = body.querySelector('[data-mul-ex2]');
    if (zeroEx) zeroEx.onclick = () => loadExpression(3, '×', 4);
    return;
  }

  const key = `${a}x${b}`;
  if (state.mulKey !== key) { state.mulKey = key; state.mulGroups = Array(b).fill(false); }
  if (state.mulGroups.length !== b) state.mulGroups = Array(b).fill(false);
  const filled = state.mulGroups.filter(Boolean).length;
  const groupSlots = Array.from({ length: b }, (_, g) => `
    <div class="group-slot${state.mulGroups[g] ? ' filled' : ''}" data-drop="mul:${g}">
      <div class="gs-title"><span>${g + 1}묶음</span><span>${state.mulGroups[g] ? `${a}개` : '비어 있음'}</span></div>
      <div class="gs-dots">${state.mulGroups[g] ? Array.from({ length: a }, () => '<span class="gs-dot"></span>').join('') : '<span class="muted" style="font-size:10px">묶음 카드를 끌어오세요</span>'}</div>
    </div>`).join('');
  setToolHead('✖️ 묶음 곱셈', `${a}개씩 ${b}묶음 · 묶음 카드를 끌어 채워요`);
  body.innerHTML = `
    <div class="guide">한 묶음에 <b>${a}개씩</b> <b>${b}묶음</b>이면 모두 <b>${a * b}개</b>예요. 묶음 카드를 빈 자리로 <b>끌어다 놓으세요</b>.</div>
    <div class="drag-tray"><span class="tray-label">묶음 카드</span>
      <div class="drag-token violet" data-mul-bundle role="button" tabindex="0"><span class="big">${a}개</span><span class="tiny">한 묶음</span></div>
      <span class="bundle-help">카드를 한 번 끌면 ${a}개가 한 묶음으로 들어가요.</span>
    </div>
    <div class="group-grid">${groupSlots}</div>
    <div class="guide" style="font-size:15px"><b>${a} × ${b} = ${a * b}</b> · 지금 ${filled}묶음 채움 · ${Array.from({ length: filled }, () => a).join(' + ') || '0'} = ${filled * a}</div>
    ${filled === b ? `<div class="feedback" style="color:#16a34a">${a}개씩 ${b}묶음은 모두 ${a * b}개예요!</div>` : ''}
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-mul-bundle-btn="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-mul-bundle-btn="hundred">100개 묶기</button>
    </div>
    <div class="row-flex">
      <button type="button" class="btn soft" data-mul="a:-1" ${a <= 1 ? 'disabled' : ''}>한 묶음 －1</button>
      <button type="button" class="btn soft" data-mul="a:1" ${a >= 12 ? 'disabled' : ''}>한 묶음 ＋1</button>
      <button type="button" class="btn soft" data-mul="b:-1" ${b <= 1 ? 'disabled' : ''}>묶음 －1</button>
      <button type="button" class="btn soft" data-mul="b:1" ${b >= 10 ? 'disabled' : ''}>묶음 ＋1</button>
      <button type="button" class="btn primary" data-mul-ex2="3,4">3 × 4로</button>
    </div>`;

  const fillGroup = (index) => {
    if (state.mulGroups[index]) { speak('이미 채운 묶음이에요. 빈 자리에 놓아 보세요.'); return; }
    state.mulGroups[index] = true;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${index + 1}묶음 채우기`);
    const count = state.mulGroups.filter(Boolean).length;
    if (count === b) awardToken(`${a}개씩 ${b}묶음을 모두 채웠어요!`);
    else speak(`${index + 1}묶음에 ${a}개를 넣었어요. ${b - count}묶음 남았어요.`);
    renderTool();
  };
  body.querySelectorAll('[data-mul-bundle]').forEach((t) => {
    t.onclick = () => {
      const i = state.mulGroups.findIndex((v) => !v);
      if (i >= 0) fillGroup(i);
    };
  });
  bindDrag(body, '[data-mul-bundle]', () => ({ a }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('mul:')) fillGroup(Number(drop.split(':')[1]));
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="mul:0"]', body); },
    onActivate: () => {
      const i = state.mulGroups.findIndex((v) => !v);
      if (i >= 0) fillGroup(i);
    },
  });
  body.querySelectorAll('[data-mul-bundle-btn]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.mulBundleBtn === 'ten') {
        if (a < 10) { speak('한 묶음이 10개 이상일 때 10개씩 묶을 수 있어요.'); return; }
        awardToken('10개씩 묶으면 더 빨리 셀 수 있어요!');
        speak(`${a}개는 십 ${Math.floor(a / 10)}개와 ${a % 10}개예요.`);
      } else {
        speak('100개는 십 묶음 10개예요. 10개씩 먼저 묶어 보세요.');
      }
    };
  });
  body.querySelectorAll('[data-mul]').forEach((btn) => {
    btn.onclick = () => {
      const [which, delta] = btn.dataset.mul.split(':');
      if (which === 'a') loadExpression(clamp(a + Number(delta), 1, 12), '×', b);
      else loadExpression(a, '×', clamp(b + Number(delta), 1, 10));
    };
  });
  const ex = body.querySelector('[data-mul-ex2]');
  if (ex) ex.onclick = () => loadExpression(3, '×', 4);
}

/* ---------- 9단계: 분수 ---------- */
function renderFraction() {
  const fa = state.fractions.a;
  const fb = state.fractions.b;
  const same = fa.d === fb.d;
  const lcm = (fa.d * fb.d) / gcd(fa.d, fb.d);
  const rawSum = same ? { n: fa.n + fb.n, d: fa.d } : null;
  const simp = rawSum ? simplify(rawSum) : null;
  const bar = (f, color, target, label) => `
    <div class="fgroup">
      <div class="row-flex" style="margin:0;justify-content:space-between">
        <b style="font-size:13px">${label}</b>
        <span class="num-card" style="min-width:0;padding:4px 10px;border-color:${color}"><span class="v" style="font-size:20px;color:${color}">${f.n}/${f.d}</span></span>
      </div>
      <div class="fbar frac-bar-drop" data-drop="frac:${target}" aria-label="${label} 막대">${Array.from({ length: f.d }, (_, i) =>
        `<button type="button" class="fslice" data-f="${target}:${i}" style="background:${i < f.n ? color : '#fff'}" aria-label="${i + 1}조각"></button>`).join('')}</div>
      <div class="denom-row">${[2, 3, 4, 5, 6, 8, 10].map((d) =>
        `<button type="button" class="denom${f.d === d ? ' active' : ''}" data-d="${target}:${d}" ${f.d === d ? `style="background:${color};border-color:${color}"` : ''}>${d}조각</button>`).join('')}</div>
    </div>`;
  setToolHead('🍕 분수 막대', '조각을 손가락으로 끌어 막대에 놓아 분수를 만들어요');
  $('toolBody').innerHTML = `
    <div class="fcols">${bar(fa, '#2563eb', 'a', '첫 번째 분수')}${bar(fb, '#16a34a', 'b', '두 번째 분수')}</div>
    <div class="frac-shelf" aria-label="분수 조각 상자">
      <span class="tray-label" style="align-self:center;font-size:11px;font-weight:950;color:#6d28d9">조각을 끌어다 놓기</span>
      ${Array.from({ length: 10 }, (_, i) => `<div class="frac-piece" data-frac-piece="a" role="button" tabindex="0" aria-label="첫 번째 분수에 조각 하나">${i < fa.d ? `${i + 1}/${fa.d}` : '＋'}</div>`).join('')}
      ${Array.from({ length: 10 }, (_, i) => `<div class="frac-piece" data-frac-piece="b" role="button" tabindex="0" aria-label="두 번째 분수에 조각 하나" style="border-color:#86efac;background:#dcfce7;color:#166534">${i < fb.d ? `${i + 1}/${fb.d}` : '＋'}</div>`).join('')}
      <div class="drop-plate" data-drop="frac-minus" style="min-height:44px;padding:6px 10px;border-color:#fda4af;background:#fff1f2"><div class="plate-title" style="margin:0"><span>➖ 조각 빼기</span></div></div>
    </div>
    <div class="fresult">
      <div class="guide">${same ? '조각 크기가 같아서 분자끼리 더할 수 있어요.' : `조각 크기가 달라요. <b>${lcm}조각</b>으로 맞추면 더할 수 있어요.`}</div>
      <div class="guide" style="margin-top:6px">분수를 소수로 읽으면 <b>${fa.n}/${fa.d} = ${displayNumber(fa.n / fa.d)}</b>, <b>${fb.n}/${fb.d} = ${displayNumber(fb.n / fb.d)}</b>예요.</div>
      ${same
        ? `<div class="rv" style="font-size:24px;font-weight:900;margin-top:5px">${fa.n}/${fa.d} + ${fb.n}/${fb.d} = ${rawSum.n}/${rawSum.d}${simp && (simp.n !== rawSum.n || simp.d !== rawSum.d) ? ` = ${simp.n}/${simp.d}` : ''}</div>
           ${rawSum.n >= rawSum.d ? `<div class="guide">가분수예요. 자연수 ${Math.floor(rawSum.n / rawSum.d)}과 ${rawSum.n % rawSum.d}/${rawSum.d}로 나타낼 수 있어요.</div>` : ''}`
        : `<div class="guide">통분하면 <b>${fa.n * (lcm / fa.d)}/${lcm} + ${fb.n * (lcm / fb.d)}/${lcm}</b>이 돼요.</div>`}
    </div>
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-frac-bundle="ten">10조각으로 보기</button>
      <button type="button" class="bundle-big-btn" data-frac-bundle="hundred">100칸으로 보기</button>
    </div>
    <div class="row-flex">
      <button type="button" class="btn violet" data-fa="lcm">조각 크기 같게 (${lcm}조각)</button>
      <button type="button" class="btn primary" data-fa="send">계산기에 보내기</button>
      <button type="button" class="btn soft" data-fa="swap">두 분수 바꾸기</button>
      <button type="button" class="btn soft" data-fa="reset">처음으로</button>
    </div>`;
  const body = $('toolBody');
  const addPiece = (which, delta) => {
    const cur = state.fractions[which];
    cur.n = clamp(cur.n + delta, 0, cur.d);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${which} ${cur.n}/${cur.d}`);
    if (cur.n === cur.d) awardToken('전체를 가득 채웠어요!');
    else speak(`${cur.d}조각 중 ${countWord(cur.n)}조각`);
    renderTool();
  };
  body.querySelectorAll('[data-frac-piece]').forEach((t) => { t.onclick = () => addPiece(t.dataset.fracPiece, 1); });
  bindDrag(body, '[data-frac-piece]', (el) => ({ which: el.dataset.fracPiece }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('frac:')) addPiece(drop.split(':')[1], 1);
    else if (drop === 'frac-minus') addPiece(p.which, -1);
  }, {
    onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="frac:${p.which}"]`, body); },
    onActivate: (p) => addPiece(p.which, 1),
  });
  body.querySelectorAll('[data-frac-bundle]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.fracBundle === 'ten') {
        state.fractions = { a: { n: Math.min(3, 10), d: 10 }, b: { n: Math.min(4, 10), d: 10 } };
        awardToken('10조각 분수로 바꾸었어요!');
        renderTool();
      } else {
        state.fractions = { a: { n: 25, d: 100 }, b: { n: 30, d: 100 } };
        awardToken('100칸 분수로 바꾸었어요! 0.25 + 0.30을 살펴보세요.');
        renderTool();
      }
    };
  });
  body.querySelectorAll('[data-f]').forEach((btn) => {
    btn.onclick = () => {
      const [which, idx] = btn.dataset.f.split(':');
      const cur = state.fractions[which];
      const i = Number(idx);
      cur.n = cur.n === i + 1 ? i : i + 1;
      speak(`${cur.d}조각 중 ${countWord(cur.n)}조각`);
      renderTool();
    };
  });
  $('toolBody').querySelectorAll('[data-d]').forEach((btn) => {
    btn.onclick = () => {
      const [which, d] = btn.dataset.d.split(':');
      const cur = state.fractions[which];
      cur.d = Number(d);
      cur.n = Math.min(cur.n, cur.d);
      renderTool();
    };
  });
  $('toolBody').querySelectorAll('[data-fa]').forEach((btn) => {
    btn.onclick = () => {
      const action = btn.dataset.fa;
      if (action === 'send') {
        loadExpression(`${fa.n}/${fa.d}`, '+', `${fb.n}/${fb.d}`);
        return;
      } else if (action === 'lcm') {
        if (same) { speak('이미 조각 크기가 같아요'); return; }
        state.fractions = {
          a: { n: fa.n * (lcm / fa.d), d: lcm },
          b: { n: fb.n * (lcm / fb.d), d: lcm },
        };
      } else if (action === 'swap') {
        state.fractions = { a: { ...fb }, b: { ...fa } };
      } else {
        state.fractions = { a: { n: 1, d: 4 }, b: { n: 2, d: 4 } };
      }
      renderTool();
    };
  });
}

/* ---------- 10단계: 측정 ---------- */
function clockSVG(minutes) {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60) % 12;
  const m = total % 60;
  const hourAngle = (h + m / 60) * 30;
  const minuteAngle = m * 6;
  const pt = (angle, len) => {
    const rad = (angle - 90) * Math.PI / 180;
    return [100 + len * Math.cos(rad), 100 + len * Math.sin(rad)];
  };
  const [hx, hy] = pt(hourAngle, 44);
  const [mx, my] = pt(minuteAngle, 68);
  let numbers = '';
  for (let i = 1; i <= 12; i++) {
    const rad = (i * 30 - 90) * Math.PI / 180;
    numbers += `<text x="${100 + 72 * Math.cos(rad)}" y="${100 + 72 * Math.sin(rad) + 4}" text-anchor="middle" class="clock-num">${i}</text>`;
  }
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const rad = (i * 6 - 90) * Math.PI / 180;
    const major = i % 5 === 0;
    const r1 = major ? 84 : 88;
    ticks += `<line x1="${100 + r1 * Math.cos(rad)}" y1="${100 + r1 * Math.sin(rad)}" x2="${100 + 92 * Math.cos(rad)}" y2="${100 + 92 * Math.sin(rad)}" class="clock-tick${major ? ' major' : ''}"/>`;
  }
  return `<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="시계" data-drop="clock">
    <defs>
      <radialGradient id="clkFace" cx="40%" cy="35%" r="75%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f1f5f9"/></radialGradient>
      <linearGradient id="clkRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#clkFace)" stroke="url(#clkRim)" stroke-width="6"/>
    <circle cx="100" cy="100" r="52" fill="none" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="3 4"/>
    ${ticks}${numbers}
    <line x1="100" y1="100" x2="${hx}" y2="${hy}" class="clock-hand hour" data-hand="hour"/>
    <line x1="100" y1="100" x2="${mx}" y2="${my}" class="clock-hand minute" data-hand="minute"/>
    <circle cx="100" cy="100" r="7" class="clock-center" stroke="#fff" stroke-width="2"/>
    <circle cx="${hx}" cy="${hy}" r="13" class="clock-grab" data-clock-hand="hour" aria-label="시침 끌기"/>
    <circle cx="${mx}" cy="${my}" r="13" class="clock-grab" data-clock-hand="minute" aria-label="분침 끌기"/>
  </svg>`;
}
function timeText(minutes) {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h24 < 12 ? '오전' : '오후';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${ampm} ${h12}시 ${m}분`;
}

function renderMeasure() {
  const m = state.measure;
  const body = $('toolBody');
  const tabs = [
    { id: 'length', label: '📏 길이' },
    { id: 'volume', label: '🥤 들이' },
    { id: 'weight', label: '⚖️ 무게' },
    { id: 'clock', label: '🕘 시계' },
    { id: 'money', label: '🪙 화폐' },
  ];
  if (!tabs.some((t) => t.id === m.tab)) m.tab = 'length';
  const tabHtml = tabs.map((t) => `<button type="button" class="tab${m.tab === t.id ? ' active' : ''}" data-mtab="${t.id}">${t.label}</button>`).join('');
  let panel = '';
  if (m.tab === 'length') {
    const pct = (m.length / 20) * 100;
    const ticks = Array.from({ length: 21 }, (_, i) => `<div class="ruler-tick${i % 5 === 0 ? ' major' : ''}"><span>${i % 5 === 0 ? i : ''}</span></div>`).join('');
    panel = `
      <div class="measure-panel">
        <div class="measure-line"><span class="guide">자를 보고 길이를 재어 보세요.</span><span class="measure-value" id="lenVal">${m.length} cm</span></div>
        <input type="range" id="lenRange" min="0" max="20" step="1" value="${m.length}" aria-label="길이 조절" />
        <div class="ruler" id="ruler" data-drop="ruler" aria-label="자를 끌어 길이 재기">
          <div class="ruler-ticks">${ticks}</div>
          <div class="ruler-fill" id="rulerFill" style="width:${pct}%"></div>
          <div class="ruler-object" id="rulerObj" style="left:${pct}%" role="button" tabindex="0" aria-label="연필을 끌어 길이 재기">✏️</div>
        </div>
        <div class="guide">연필을 <b>손가락으로 끌어</b> 길이를 재어 보세요. 자는 <b>0 cm</b>부터 시작해요. <b>${m.length} cm = ${m.length}센티미터</b></div>
      </div>`;
  } else if (m.tab === 'volume') {
    const pct = (m.volume / 10) * 100;
    panel = `
      <div class="measure-panel">
        <div class="measure-line"><span class="guide">컵에 담긴 양을 재어 보세요.</span><span class="measure-value" id="volVal">${m.volume}컵</span></div>
        <input type="range" id="volRange" min="0" max="10" step="1" value="${m.volume}" aria-label="들이 조절" />
        <div class="beaker" id="beaker" data-drop="beaker" aria-label="컵의 물 높이를 끌어 조절">
          <div class="beaker-fill" id="beakerFill" style="height:${pct}%"></div>
          <span class="beaker-mark" style="bottom:49%">5</span>
          <span class="beaker-mark" style="bottom:98%">10</span>
        </div>
        <div class="guide">컵 안의 물을 <b>위아래로 끌어</b> 양을 맞춰 보세요. <b>${m.volume}컵</b>은 눈금으로 <b>${m.volume}</b>만큼 채운 것이에요.</div>
      </div>`;
  } else if (m.tab === 'weight') {
    panel = `
      <div class="measure-panel">
        <div class="scale">
          <span class="num" id="scaleVal">${m.weight}</span>
          <span class="u">g (그램)</span>
        </div>
        <input type="range" id="wtRange" min="0" max="1000" step="50" value="${m.weight}" aria-label="무게 조절" />
        <div class="weight-tray" aria-label="무게 추를 끌어 저울에 놓기">
          <div class="weight-token" data-weight="100" role="button" tabindex="0">100g</div>
          <div class="weight-token" data-weight="200" role="button" tabindex="0">200g</div>
          <div class="weight-token w500" data-weight="500" role="button" tabindex="0">500g</div>
          <div class="drop-plate" data-drop="weight" style="min-height:52px;padding:7px 10px;border-color:#fcd34d;background:#fffbeb;flex:1">
            <div class="plate-title" style="margin:0"><span>⚖️ 저울 접시 · 여기로 끌어요</span></div>
          </div>
        </div>
        <div class="row-flex" style="margin-top:0">
          <button type="button" class="bundle-big-btn blue" data-weight-bundle="ten">100g 10개 묶기 = 1kg</button>
          <button type="button" class="bundle-big-btn" data-weight-bundle="hundred">10g 100개 묶기 = 1kg</button>
        </div>
        <div class="guide" style="text-align:center"><b>${m.weight} g</b> · 1 kg은 1000 g이에요. ${m.weight === 1000 ? '가득 1 kg!' : ''}</div>
      </div>`;
  } else if (m.tab === 'clock') {
    panel = `
      <div class="measure-panel">
        <div class="clock-wrap">
          ${clockSVG(m.minutes)}
          <div>
            <div class="digital">${timeText(m.minutes)}</div>
            <div class="digital" style="font-size:16px;color:#64748b;margin-top:4px">${String(Math.floor(m.minutes / 60) % 24).padStart(2, '0')}:${String(m.minutes % 60).padStart(2, '0')}</div>
            <div class="row-flex" style="justify-content:center">
              <button type="button" class="btn soft" data-clock="-10">－10분</button>
              <button type="button" class="btn primary" data-clock="10">＋10분</button>
              <button type="button" class="btn soft" data-clock="60">＋1시간</button>
              <button type="button" class="btn soft" data-clock="0">9시로</button>
            </div>
          </div>
        </div>
        <div class="guide" style="text-align:center">시계의 <b>짧은바늘(시)</b>과 <b>긴바늘(분)</b>을 손가락으로 끌어 시간을 맞춰 보세요.</div>
      </div>`;
  } else {
    const coins = [
      { v: 10, label: '10원', cls: 'c10' },
      { v: 50, label: '50원', cls: 'c50' },
      { v: 100, label: '100원', cls: 'c100' },
      { v: 500, label: '500원', cls: 'c500' },
    ];
    let totalMoney = 0;
    coins.forEach((c) => { totalMoney += c.v * m.coins[c.v]; });
    const breakdown = coins.filter((c) => m.coins[c.v] > 0).map((c) => `${c.label} × ${m.coins[c.v]}`).join(' + ');
    panel = `
      <div class="measure-panel">
        <div class="guide">동전을 <b>손가락으로 끌어 지갑에 넣어</b> 돈을 모아 보세요. 그냥 눌러도 돼요.</div>
        <div class="coins">${coins.map((c) => `<button type="button" class="coin ${c.cls}" data-coin="${c.v}" data-coin-drag="${c.v}" aria-label="${c.label} 끌어서 넣기">${c.label}</button>`).join('')}</div>
        <div class="wallet-drop" data-drop="wallet">
          <span class="wd-label">👛 지갑</span>
          <span class="guide" style="flex:1">${breakdown || '동전을 여기로 끌어오세요'}</span>
          <span class="measure-value" id="moneyVal">${totalMoney}원</span>
        </div>
        <div class="row-flex" style="margin-top:0">
          <button type="button" class="bundle-big-btn blue" data-money-bundle="ten">10원 10개 = 100원</button>
          <button type="button" class="bundle-big-btn" data-money-bundle="hundred">100원 10개 = 1,000원</button>
          <button type="button" class="btn soft" data-coin-clear>비우기</button>
        </div>
      </div>`;
  }
  setToolHead('📏 측정 실험실', '연필·물·시계바늘·동전을 손가락으로 끌어 재어요');
  body.innerHTML = `<div class="tabs measure-tabs">${tabHtml}</div>${panel}`;
  body.querySelectorAll('[data-mtab]').forEach((b) => {
    b.onclick = () => { state.measure.tab = b.dataset.mtab; renderTool(); };
  });

  const len = $('lenRange');
  if (len) {
    len.oninput = () => {
      const v = Number(len.value);
      state.measure.length = v;
      const pct = (v / 20) * 100;
      $('lenVal').textContent = `${v} cm`;
      $('rulerFill').style.width = `${pct}%`;
      $('rulerObj').style.left = `${pct}%`;
    };
    len.onchange = () => speak(`${state.measure.length} 센티미터`);
  }
  const vol = $('volRange');
  if (vol) {
    vol.oninput = () => {
      const v = Number(vol.value);
      state.measure.volume = v;
      $('volVal').textContent = `${v}컵`;
      $('beakerFill').style.height = `${(v / 10) * 100}%`;
    };
    vol.onchange = () => speak(`${state.measure.volume}컵`);
  }
  const wt = $('wtRange');
  if (wt) {
    wt.oninput = () => {
      const v = Number(wt.value);
      state.measure.weight = v;
      $('scaleVal').textContent = String(v);
    };
    wt.onchange = () => speak(`${state.measure.weight} 그램`);
  }
  body.querySelectorAll('[data-clock]').forEach((b) => {
    b.onclick = () => {
      const v = Number(b.dataset.clock);
      if (v === 0) state.measure.minutes = 9 * 60;
      else state.measure.minutes = (state.measure.minutes + v + 1440) % 1440;
      renderTool();
      speak(timeText(state.measure.minutes));
    };
  });
  const addCoin = (v) => {
    state.measure.coins[v] = (state.measure.coins[v] || 0) + 1;
    let sum = 0;
    Object.keys(state.measure.coins).forEach((k) => { sum += Number(k) * state.measure.coins[k]; });
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${v}원`);
    speak(`${v}원을 넣었어요. 모두 ${countWord(sum)}원`);
    renderTool();
  };
  body.querySelectorAll('[data-coin]').forEach((b) => {
    b.onclick = () => addCoin(Number(b.dataset.coin));
  });
  bindDrag(body, '[data-coin-drag]', (el) => ({ v: Number(el.dataset.coinDrag) }), (p, zone) => {
    if (zone && zone.dataset.drop === 'wallet') addCoin(p.v);
  }, { onActivate: (p) => addCoin(p.v) });
  body.querySelectorAll('[data-money-bundle]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.moneyBundle === 'ten') {
        state.measure.coins[10] = (state.measure.coins[10] || 0) + 10;
        awardToken('10원 10개를 100원 하나로 묶었어요!');
      } else {
        state.measure.coins[100] = (state.measure.coins[100] || 0) + 10;
        awardToken('100원 10개를 1,000원으로 묶었어요!');
      }
      renderTool();
    };
  });
  const cc = body.querySelector('[data-coin-clear]');
  if (cc) cc.onclick = () => { state.measure.coins = { 10: 0, 50: 0, 100: 0, 500: 0 }; renderTool(); };

  /* 길이: 연필 끌기 */
  const ruler = $('ruler');
  const pencil = $('rulerObj');
  if (ruler && pencil) {
    let dragging = false;
    const updateLen = (clientX) => {
      const r = ruler.getBoundingClientRect();
      const v = clamp(Math.round(((clientX - r.left) / r.width) * 20), 0, 20);
      state.measure.length = v;
      $('lenVal').textContent = `${v} cm`;
      $('rulerFill').style.width = `${(v / 20) * 100}%`;
      pencil.style.left = `${(v / 20) * 100}%`;
      const range = $('lenRange');
      if (range) range.value = String(v);
    };
    ruler.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { ruler.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
      updateLen(e.clientX);
      noteInteraction();
    });
    ruler.addEventListener('pointermove', (e) => { if (dragging) updateLen(e.clientX); });
    ruler.addEventListener('pointerup', (e) => {
      dragging = false;
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `길이 ${state.measure.length}cm`);
      speak(`${state.measure.length} 센티미터`);
    });
    ruler.addEventListener('pointercancel', () => { dragging = false; });
  }

  /* 들이: 물 높이 끌기 */
  const beaker = $('beaker');
  if (beaker) {
    let dragging = false;
    const updateVol = (clientY) => {
      const r = beaker.getBoundingClientRect();
      const v = clamp(Math.round(((r.bottom - clientY) / r.height) * 10), 0, 10);
      state.measure.volume = v;
      $('volVal').textContent = `${v}컵`;
      $('beakerFill').style.height = `${(v / 10) * 100}%`;
      const range = $('volRange');
      if (range) range.value = String(v);
    };
    beaker.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { beaker.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
      updateVol(e.clientY);
      noteInteraction();
    });
    beaker.addEventListener('pointermove', (e) => { if (dragging) updateVol(e.clientY); });
    beaker.addEventListener('pointerup', () => {
      dragging = false;
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `들이 ${state.measure.volume}컵`);
      speak(`${state.measure.volume}컵`);
    });
    beaker.addEventListener('pointercancel', () => { dragging = false; });
  }

  /* 무게: 추 끌기 */
  const addWeight = (v) => {
    state.measure.weight = clamp(state.measure.weight + v, 0, 1000);
    const range = $('wtRange');
    if (range) range.value = String(state.measure.weight);
    const scale = $('scaleVal');
    if (scale) scale.textContent = String(state.measure.weight);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `무게 ${state.measure.weight}g`);
    if (state.measure.weight >= 1000) awardToken('1킬로그램을 가득 채웠어요!');
    else speak(`${state.measure.weight} 그램`);
  };
  body.querySelectorAll('[data-weight]').forEach((t) => { t.onclick = () => addWeight(Number(t.dataset.weight)); });
  bindDrag(body, '[data-weight]', (el) => ({ v: Number(el.dataset.weight) }), (p, zone) => {
    if (zone && zone.dataset.drop === 'weight') addWeight(p.v);
  }, { onActivate: (p) => addWeight(p.v) });
  body.querySelectorAll('[data-weight-bundle]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.weightBundle === 'ten') { state.measure.weight = 1000; awardToken('100g 10개는 1kg이에요!'); }
      else { state.measure.weight = 1000; awardToken('10g 100개는 1kg이에요!'); }
      renderTool();
    };
  });

  /* 시계: 바늘 끌기 */
  const clock = body.querySelector('.clock');
  if (clock) {
    let hand = null;
    const setFromPointer = (e) => {
      const r = clock.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      const current = state.measure.minutes;
      const h24 = Math.floor(current / 60);
      const m = current % 60;
      if (hand === 'minute') {
        const minute = Math.round(angle / 6) % 60;
        state.measure.minutes = ((h24 * 60 + minute) % 1440 + 1440) % 1440;
      } else if (hand === 'hour') {
        const hour = Math.round(angle / 30) % 12;
        state.measure.minutes = ((hour * 60 + m) % 1440 + 1440) % 1440;
      }
      const digital = body.querySelector('.digital');
      if (digital) digital.textContent = timeText(state.measure.minutes);
      const small = body.querySelector('.digital[style]');
      if (small) small.textContent = `${String(Math.floor(state.measure.minutes / 60) % 24).padStart(2, '0')}:${String(state.measure.minutes % 60).padStart(2, '0')}`;
    };
    clock.addEventListener('pointerdown', (e) => {
      const grab = e.target.closest('[data-clock-hand]');
      hand = grab ? grab.dataset.clockHand : 'minute';
      try { clock.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
      setFromPointer(e);
      noteInteraction();
    });
    clock.addEventListener('pointermove', (e) => { if (hand) setFromPointer(e); });
    clock.addEventListener('pointerup', () => {
      hand = null;
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, timeText(state.measure.minutes));
      speak(timeText(state.measure.minutes));
      renderTool();
    });
    clock.addEventListener('pointercancel', () => { hand = null; });
  }
}

/* ---------- 11단계: 도형과 규칙성 ---------- */
const SHAPES = [
  { id: 'triangle', name: '삼각형', sides: 3, corners: 3, svg: '<polygon points="50,10 92,86 8,86" fill="#dbeafe" stroke="#2563eb" stroke-width="5" stroke-linejoin="round"/><polygon points="50,24 76,78 24,78" fill="#fff" opacity="0.35"/><circle cx="50" cy="10" r="4.5" fill="#2563eb" class="shape-vertex"/><circle cx="92" cy="86" r="4.5" fill="#2563eb" class="shape-vertex"/><circle cx="8" cy="86" r="4.5" fill="#2563eb" class="shape-vertex"/>', fact: '뾰족한 꼭짓점이 3개예요.' },
  { id: 'square', name: '정사각형', sides: 4, corners: 4, svg: '<rect x="14" y="14" width="72" height="72" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="5"/><rect x="22" y="22" width="56" height="22" rx="3" fill="#fff" opacity="0.4"/><circle cx="14" cy="14" r="4.5" fill="#16a34a" class="shape-vertex"/><circle cx="86" cy="14" r="4.5" fill="#16a34a" class="shape-vertex"/><circle cx="86" cy="86" r="4.5" fill="#16a34a" class="shape-vertex"/><circle cx="14" cy="86" r="4.5" fill="#16a34a" class="shape-vertex"/>', fact: '네 변의 길이가 모두 같아요.' },
  { id: 'rect', name: '직사각형', sides: 4, corners: 4, svg: '<rect x="8" y="24" width="84" height="52" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="5"/><rect x="14" y="30" width="72" height="16" rx="3" fill="#fff" opacity="0.45"/><circle cx="8" cy="24" r="4.5" fill="#d97706" class="shape-vertex"/><circle cx="92" cy="24" r="4.5" fill="#d97706" class="shape-vertex"/><circle cx="92" cy="76" r="4.5" fill="#d97706" class="shape-vertex"/><circle cx="8" cy="76" r="4.5" fill="#d97706" class="shape-vertex"/>', fact: '마주 보는 변의 길이가 같아요.' },
  { id: 'circle', name: '원', sides: 0, corners: 0, svg: '<circle cx="50" cy="50" r="40" fill="#ede9fe" stroke="#7c3aed" stroke-width="5"/><path d="M26 34a26 26 0 0 1 36-8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>', fact: '둥글어서 굴러가요. 꼭짓점이 없어요.' },
  { id: 'pentagon', name: '오각형', sides: 5, corners: 5, svg: '<polygon points="50,8 90,37 75,86 25,86 10,37" fill="#ffe4e6" stroke="#e11d48" stroke-width="5" stroke-linejoin="round"/><polygon points="50,20 75,40 66,76 34,76 25,40" fill="#fff" opacity="0.35"/><circle cx="50" cy="8" r="4.2" fill="#e11d48" class="shape-vertex"/><circle cx="90" cy="37" r="4.2" fill="#e11d48" class="shape-vertex"/><circle cx="75" cy="86" r="4.2" fill="#e11d48" class="shape-vertex"/><circle cx="25" cy="86" r="4.2" fill="#e11d48" class="shape-vertex"/><circle cx="10" cy="37" r="4.2" fill="#e11d48" class="shape-vertex"/>', fact: '변과 꼭짓점이 5개씩 있어요.' },
  { id: 'hexagon', name: '육각형', sides: 6, corners: 6, svg: '<polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="#cffafe" stroke="#0891b2" stroke-width="5" stroke-linejoin="round"/><polygon points="50,20 74,34 74,66 50,80 26,66 26,34" fill="#fff" opacity="0.35"/><circle cx="50" cy="8" r="4" fill="#0891b2" class="shape-vertex"/><circle cx="86" cy="29" r="4" fill="#0891b2" class="shape-vertex"/><circle cx="86" cy="71" r="4" fill="#0891b2" class="shape-vertex"/><circle cx="50" cy="92" r="4" fill="#0891b2" class="shape-vertex"/><circle cx="14" cy="71" r="4" fill="#0891b2" class="shape-vertex"/><circle cx="14" cy="29" r="4" fill="#0891b2" class="shape-vertex"/>', fact: '벌집 모양처럼 변이 6개예요.' },
];
const PATTERNS = [
  { seq: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', choices: ['🔴', '🔵', '🟢'], rule: '빨강과 파랑이 번갈아 나와요.' },
  { seq: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', choices: ['⭐', '🌙', '☀️'], rule: '별, 별, 달이 반복돼요.' },
  { seq: ['🟦', '🟨', '🟩', '🟦', '🟨'], answer: '🟩', choices: ['🟦', '🟨', '🟩'], rule: '파랑, 노랑, 초록이 반복돼요.' },
  { seq: ['🍎', '🍋', '🍋', '🍎', '🍋'], answer: '🍋', choices: ['🍎', '🍋', '🍇'], rule: '사과, 레몬, 레몬이 반복돼요.' },
];

function renderShape() {
  const tab = state.shapeTab === 'pattern' ? 'pattern' : 'shape';
  const body = $('toolBody');
  const tabs = `<div class="tabs">${[{ id: 'shape', label: '🔺 도형' }, { id: 'pattern', label: '🔁 규칙' }].map((t) => `<button type="button" class="tab${tab === t.id ? ' active' : ''}" data-stab="${t.id}">${t.label}</button>`).join('')}</div>`;
  if (tab === 'shape') {
    const selected = SHAPES.find((s) => s.id === state.shapeId) || SHAPES[0];
    const palette = SHAPES.map((s) => `<div class="shape-tile" data-shape-source="${s.id}" role="button" tabindex="0" aria-label="${s.name} 끌어서 보드에 놓기"><svg viewBox="0 0 100 100">${s.svg}</svg><span>${s.name}</span></div>`).join('');
    const boardShapes = state.shapeBoard.map((inst, i) => {
      const s = SHAPES.find((x) => x.id === inst.id) || SHAPES[0];
      return `<button type="button" class="shape-instance${state.shapeSelected === i ? ' selected' : ''}" data-shape-instance="${i}" style="left:${inst.x}%;top:${inst.y}%;transform:translate(-50%,-50%) rotate(${inst.rot || 0}deg)" aria-label="${s.name} ${i + 1}번째, 두 번 누르면 돌아가요"><svg viewBox="0 0 100 100">${s.svg}</svg><span class="si-badge">${i + 1}</span></button>`;
    }).join('');
    setToolHead('🔺 도형 탐험', '도형을 손가락으로 끌어 보드에 놓고, 두 번 눌러 돌려 보세요');
    body.innerHTML = `${tabs}
      <div class="shape-board-wrap">
        <div class="shape-board" data-drop="shape-board" aria-label="도형 놀이 보드">
          ${boardShapes || '<div class="board-hint">도형을 여기로 끌어다 놓아요.<br/>여러 도형으로 그림을 만들어 보세요.</div>'}
        </div>
        <div>
          <div class="shape-palette" aria-label="도형 상자">${palette}</div>
          <div class="row-flex" style="margin-top:8px">
            <button type="button" class="btn soft" data-shape-rotate ${state.shapeSelected === null ? 'disabled' : ''}>↻ 돌리기</button>
            <button type="button" class="btn soft" data-shape-remove ${state.shapeSelected === null ? 'disabled' : ''}>🗑 빼기</button>
            <button type="button" class="btn soft" data-shape-clear>모두 지우기</button>
          </div>
          <div class="drop-plate" data-drop="shape-trash" style="margin-top:8px;min-height:48px;padding:7px 9px;border-color:#fda4af;background:#fff1f2"><div class="plate-title" style="margin:0"><span>🗑 여기로 끌면 빼기</span></div></div>
        </div>
      </div>
      <div class="shape-detail">
        <svg viewBox="0 0 100 100">${selected.svg}</svg>
        <div class="shape-info">
          <div class="name" style="color:${selected.id === 'triangle' || selected.id === 'circle' || selected.id === 'pentagon' ? '#7c3aed' : '#16a34a'}">${selected.name}</div>
          <div class="shape-fact">변: <b>${selected.sides}개</b> · 꼭짓점: <b>${selected.corners}개</b></div>
          <div class="shape-fact">${selected.fact}</div>
        </div>
      </div>
      <div class="guide">도형을 눌러 이름과 특징을 확인해 보세요. 보드에 놓은 도형을 <b>두 번 누르면</b> 돌아가요. 주변에서 같은 모양도 찾아보세요.</div>`;

    const addShape = (id, x, y) => {
      state.shapeBoard.push({ id, x: clamp(x ?? 50, 8, 92), y: clamp(y ?? 50, 10, 90), rot: 0 });
      state.shapeSelected = state.shapeBoard.length - 1;
      state.shapeId = id;
      const s = SHAPES.find((z) => z.id === id);
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${s.name} 놓기`);
      if (state.shapeBoard.length === 1 || state.shapeBoard.length % 5 === 0) awardToken(`${s.name}을 놓았어요!`);
      else speak(`${s.name}. 변 ${countWord(s.sides)}개, 꼭짓점 ${countWord(s.corners)}개`);
      renderTool();
    };
    body.querySelectorAll('[data-shape-source]').forEach((tile) => {
      tile.onclick = () => addShape(tile.dataset.shapeSource, 50, 50);
    });
    bindDrag(body, '[data-shape-source]', (el) => ({ id: el.dataset.shapeSource }), (p, zone, el, ev) => {
      if (!zone) return;
      if (zone.dataset.drop === 'shape-board') {
        const board = body.querySelector('.shape-board');
        const r = board.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width) * 100;
        const y = ((ev.clientY - r.top) / r.height) * 100;
        addShape(p.id, x, y);
      }
    }, {
      onStart: (p) => { if (state.settings.errorless) showHintTarget('[data-drop="shape-board"]', body); },
      onActivate: (p) => addShape(p.id, 50, 50),
    });
    bindDrag(body, '[data-shape-instance]', (el) => ({ i: Number(el.dataset.shapeInstance) }), (p, zone, el, ev) => {
      if (!zone) return;
      if (zone.dataset.drop === 'shape-trash') {
        state.shapeBoard.splice(p.i, 1);
        state.shapeSelected = null;
        speak('도형을 뺐어요.');
        renderTool();
        return;
      }
      if (zone.dataset.drop === 'shape-board') {
        const board = body.querySelector('.shape-board');
        const r = board.getBoundingClientRect();
        const inst = state.shapeBoard[p.i];
        if (!inst) return;
        inst.x = clamp(((ev.clientX - r.left) / r.width) * 100, 8, 92);
        inst.y = clamp(((ev.clientY - r.top) / r.height) * 100, 10, 90);
        state.shapeSelected = p.i;
        renderTool();
      }
    }, {
      onActivate: (p) => {
        const inst = state.shapeBoard[p.i];
        if (!inst) return;
        inst.rot = ((inst.rot || 0) + 45) % 360;
        state.shapeSelected = p.i;
        renderTool();
      },
    });
    body.querySelectorAll('[data-shape-instance]').forEach((el) => {
      el.ondblclick = () => {
        const i = Number(el.dataset.shapeInstance);
        const inst = state.shapeBoard[i];
        if (!inst) return;
        inst.rot = ((inst.rot || 0) + 45) % 360;
        state.shapeSelected = i;
        speak('도형을 돌렸어요');
        renderTool();
      };
    });
    const rotate = body.querySelector('[data-shape-rotate]');
    if (rotate) rotate.onclick = () => {
      if (state.shapeSelected === null) return;
      const inst = state.shapeBoard[state.shapeSelected];
      if (inst) inst.rot = ((inst.rot || 0) + 45) % 360;
      renderTool();
    };
    const remove = body.querySelector('[data-shape-remove]');
    if (remove) remove.onclick = () => {
      if (state.shapeSelected === null) return;
      state.shapeBoard.splice(state.shapeSelected, 1);
      state.shapeSelected = null;
      renderTool();
    };
    const clear = body.querySelector('[data-shape-clear]');
    if (clear) clear.onclick = () => { state.shapeBoard = []; state.shapeSelected = null; renderTool(); };
  } else {
    const p = PATTERNS[state.pattern.index] || PATTERNS[0];
    const seqHtml = p.seq.map((s) => `<div class="pattern-box">${s}</div>`).join('') + '<div class="pattern-box q" data-drop="pattern-next" aria-label="다음에 올 모양을 놓는 곳">?</div>';
    const choices = p.choices.map((c) => {
      const cls = state.pattern.chosen === c ? (state.pattern.solved ? ' good' : ' bad') : '';
      return `<button type="button" class="choice-btn${cls}" data-choice="${c}">${c}</button>`;
    }).join('');
    setToolHead('🔁 반복 규칙 찾기', '다음에 올 모양을 골라 ? 자리로 끌어다 놓아요');
    body.innerHTML = `${tabs}
      <div class="guide" style="text-align:center">규칙을 보고 <b>?</b>에 들어갈 모양을 골라 보세요. 모양을 <b>끌어다 놓아도</b> 돼요.</div>
      <div class="pattern-row">${seqHtml}</div>
      <div class="drag-tray" style="justify-content:center">
        ${p.choices.map((c) => `<div class="drag-token violet" data-pattern-drag="${c}" role="button" tabindex="0"><span class="big">${c}</span><span class="tiny">끌어서 놓기</span></div>`).join('')}
      </div>
      <div class="pattern-choices">${choices}</div>
      <div class="feedback ${state.pattern.chosen ? (state.pattern.solved ? 'good' : 'bad') : ''}" style="color:${state.pattern.chosen ? (state.pattern.solved ? '#16a34a' : '#e11d48') : '#64748b'}">
        ${state.pattern.chosen ? (state.pattern.solved ? '정답이에요! ' + p.rule : '다시 한 번 규칙을 살펴보세요.') : '차례대로 어떤 모양이 반복되는지 보세요.'}
      </div>
      <div class="row-flex" style="justify-content:center">
        <button type="button" class="btn violet" data-next-pattern>다음 문제 →</button>
      </div>`;
    const choose = (choice) => {
      state.pattern.chosen = choice;
      state.pattern.solved = choice === p.answer;
      recordTrial(state.pattern.solved ? (state.promptLevel ? 'prompted' : 'independent') : 'error', state.promptLevel, `규칙 ${choice}`);
      if (state.pattern.solved) awardToken('규칙을 찾았어요!');
      else speak('다시 한 번 규칙을 살펴보세요.');
      renderTool();
    };
    body.querySelectorAll('[data-choice]').forEach((b) => { b.onclick = () => choose(b.dataset.choice); });
    body.querySelectorAll('[data-pattern-drag]').forEach((t) => { t.onclick = () => choose(t.dataset.patternDrag); });
    bindDrag(body, '[data-pattern-drag]', (el) => ({ choice: el.dataset.patternDrag }), (p, zone) => {
      if (zone && zone.dataset.drop === 'pattern-next') choose(p.choice);
    }, {
      onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="pattern-next"]', body); },
      onActivate: (p) => choose(p.choice),
    });
    const next = body.querySelector('[data-next-pattern]');
    if (next) next.onclick = () => {
      state.pattern.index = (state.pattern.index + 1) % PATTERNS.length;
      state.pattern.chosen = null;
      state.pattern.solved = false;
      renderTool();
    };
  }
  body.querySelectorAll('[data-stab]').forEach((b) => {
    b.onclick = () => { state.shapeTab = b.dataset.stab; renderTool(); };
  });
}

/* ---------- 12단계: 자료 ---------- */
function renderData() {
  const d = state.data;
  const body = $('toolBody');
  if (d.wordSolved === undefined) d.wordSolved = false;
  const kinds = [
    { id: 'apple', label: '🍎 사과', color: '#2563eb' },
    { id: 'banana', label: '🍌 바나나', color: '#d97706' },
    { id: 'grape', label: '🍇 포도', color: '#7c3aed' },
  ];
  const max = Math.max(d.apple, d.banana, d.grape, 1);
  const maxCount = Math.max(d.apple, d.banana, d.grape);
  const winners = kinds.filter((k) => d[k.id] === maxCount);
  const rows = kinds.map((k) => `<div class="data-row">
      <span class="data-label">${k.label}</span>
      <div class="data-track" data-drop="data:${k.id}" aria-label="${k.label} 그래프에 놓기"><div class="data-fill" style="width:${(d[k.id] / max) * 100}%;background:${k.color}">${d[k.id]}</div></div>
      <div class="data-stepper"><button type="button" class="step-btn" data-data="${k.id}:-1" aria-label="${k.label} 줄이기">－</button><button type="button" class="step-btn" data-data="${k.id}:1" aria-label="${k.label} 늘리기">＋</button></div>
    </div>`).join('');
  const choices = kinds.map((k) => `<button type="button" class="btn soft" data-answer="${k.id}" style="${d.answer === k.id ? `background:${d.solved ? '#dcfce7' : '#ffe4e6'}` : ''}">${k.label} ${d[k.id]}개</button>`).join('');
  const tray = kinds.map((k) => `<div class="drag-token ${k.id === 'banana' ? 'amber' : k.id === 'grape' ? 'violet' : ''}" data-data-token="${k.id}" role="button" tabindex="0"><span class="big">${k.label.split(' ')[0]}</span><span class="tiny">${k.label.split(' ')[1]} +1</span></div>`).join('');
  setToolHead('📊 자료와 문제해결', '과일을 그래프로 끌어다 놓고 가장 많은 것을 찾아요');
  body.innerHTML = `
    <div class="guide">과일을 <b>손가락으로 끌어</b> 그래프 위에 놓아 보세요. 막대가 길어지는 것을 볼 수 있어요.</div>
    <div class="drag-tray"><span class="tray-label">과일을 끌어서 그래프에 놓기</span>${tray}</div>
    <div class="data-chart">${rows}</div>
    ${bundleSummaryHTML(d.apple, { extra: `<span class="bundle-item">🍎 사과 ${d.apple}개</span>` })}
    ${bundleSummaryHTML(d.banana, { extra: `<span class="bundle-item">🍌 바나나 ${d.banana}개</span>` })}
    ${bundleSummaryHTML(d.grape, { extra: `<span class="bundle-item">🍇 포도 ${d.grape}개</span>` })}
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-data-bundle="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-data-bundle="hundred">100개 묶기</button>
    </div>
    <div class="data-question">
      <div class="guide">가장 많은 과일은 무엇일까요? 그래프의 길이를 비교해 보세요.</div>
      <div class="data-choices">${choices}</div>
      ${d.answer ? `<div class="feedback" style="color:${d.solved ? '#16a34a' : '#e11d48'};margin-top:7px">${d.solved ? `정답! ${winners.map((k) => k.label).join(', ')}가 ${maxCount}개로 가장 많아요.` : '다시 세어 보세요. 막대가 가장 긴 것을 찾아요.'}</div>` : ''}
    </div>
    <div class="word-problem">
      <div class="q">🍎 사과 3개와 🍊 귤 5개가 있어요. 모두 몇 개일까요?</div>
      <div class="drag-tray" style="margin-top:8px">
        <div class="drag-token" data-story-token="apple" role="button" tabindex="0"><span class="big">🍎</span><span class="tiny">사과</span></div>
        <div class="drag-token amber" data-story-token="orange" role="button" tabindex="0"><span class="big">🍊</span><span class="tiny">귤</span></div>
        <div class="drop-plate" data-drop="story" style="min-height:52px;padding:7px 10px;flex:1">
          <div class="plate-title" style="margin:0"><span>🧺 바구니 · 사과 ${state.story.apple}개, 귤 ${state.story.orange}개</span></div>
        </div>
      </div>
      <div class="row-flex" style="margin-top:8px">
        <button type="button" class="btn primary" data-word>계산기에 3 + 5 넣기</button>
        <button type="button" class="btn soft" data-word-answer>정답 확인</button>
      </div>
      ${d.wordSolved ? '<div class="a">3 + 5 = 8 · 모두 8개예요!</div>' : ''}
    </div>`;

  const setCount = (kind, value, msg) => {
    d[kind] = clamp(Math.trunc(value), 0, 100);
    d.answer = null;
    d.solved = false;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${kind} ${d[kind]}개`);
    renderTool();
    if (msg) speak(msg);
  };
  body.querySelectorAll('[data-data]').forEach((b) => {
    b.onclick = () => {
      const [kind, delta] = b.dataset.data.split(':');
      setCount(kind, d[kind] + Number(delta), `${d[kind] + Number(delta)}개`);
    };
  });
  body.querySelectorAll('[data-data-token]').forEach((t) => { t.onclick = () => setCount(t.dataset.dataToken, d[t.dataset.dataToken] + 1, `${d[t.dataset.dataToken] + 1}개`); });
  bindDrag(body, '[data-data-token]', (el) => ({ kind: el.dataset.dataToken }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('data:')) {
      const kind = drop.split(':')[1];
      setCount(kind, d[kind] + 1, `${d[kind] + 1}개`);
    }
  }, {
    onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="data:${p.kind}"]`, body); },
    onActivate: (p) => setCount(p.kind, d[p.kind] + 1, `${d[p.kind] + 1}개`),
  });
  body.querySelectorAll('[data-data-bundle]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.dataBundle === 'ten') {
        if (maxCount < 10) { speak('10개가 모이면 십 묶음 하나로 묶을 수 있어요.'); return; }
        awardToken('10개를 십 묶음 하나로 묶었어요!');
        speak(`가장 많은 과일은 ${maxCount}개예요. 십 묶음이 ${Math.floor(maxCount / 10)}개 있어요.`);
      } else {
        speak('100개는 십 묶음 10개예요. 10개씩 먼저 묶어 보세요.');
      }
    };
  });
  body.querySelectorAll('[data-answer]').forEach((b) => {
    b.onclick = () => {
      d.answer = b.dataset.answer;
      d.solved = winners.some((k) => k.id === d.answer);
      recordTrial(d.solved ? (state.promptLevel ? 'prompted' : 'independent') : 'error', state.promptLevel, `가장 많은 과일 ${b.dataset.answer}`);
      if (d.solved) awardToken('가장 많은 과일을 찾았어요!');
      renderTool();
      speak(d.solved ? '정답이에요' : '다시 세어 보세요');
    };
  });
  const addStory = (kind) => {
    state.story[kind] += 1;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `이야기 ${kind}`);
    if (state.story.apple + state.story.orange === 8) awardToken('모두 8개를 모았어요!');
    else speak(`${kind === 'apple' ? '사과' : '귤'} ${state.story[kind]}개`);
    renderTool();
  };
  body.querySelectorAll('[data-story-token]').forEach((t) => { t.onclick = () => addStory(t.dataset.storyToken); });
  bindDrag(body, '[data-story-token]', (el) => ({ kind: el.dataset.storyToken }), (p, zone) => {
    if (zone && zone.dataset.drop === 'story') addStory(p.kind);
  }, { onActivate: (p) => addStory(p.kind) });
  const word = body.querySelector('[data-word]');
  if (word) word.onclick = () => loadExpression(3, '+', 5);
  const wordAnswer = body.querySelector('[data-word-answer]');
  if (wordAnswer) wordAnswer.onclick = () => { d.wordSolved = true; renderTool(); speak('사과 3개와 귤 5개를 모으면 8개예요'); };
}

