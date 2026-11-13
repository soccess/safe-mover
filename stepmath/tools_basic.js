"use strict";

/* ============================================================
   6. 단계별 교구 — 1~6단계
   ============================================================ */
const SORT_KINDS = [
  { id: 'apple', emoji: '🍎', label: '사과' },
  { id: 'lemon', emoji: '🍋', label: '레몬' },
  { id: 'grape', emoji: '🍇', label: '포도' },
];

function newSortRound() {
  let items = [];
  SORT_KINDS.forEach((kind) => {
    for (let i = 0; i < 3; i++) items.push({ kind: kind.id, rid: Math.random().toString(36).slice(2) });
  });
  state.sort = {
    items: shuffle(items),
    counts: { apple: 0, lemon: 0, grape: 0 },
    done: false,
  };
}

function setToolHead(title, sub) {
  $('toolTitle').textContent = title;
  $('toolSub').textContent = sub;
}

/* ---------- 10칸 판 ---------- */
function tenFrameHTML(total, blue, green, highlight, opts) {
  const o = opts || {};
  const totalCells = Math.max(10, Math.ceil(Math.max(total, blue + green, 10) / 10) * 10);
  const frames = Math.ceil(totalCells / 10);
  const frameId = o.frameId || 'frame';
  let html = '<div class="frames">';
  for (let f = 0; f < frames; f++) {
    html += '<div class="frame">';
    for (let r = 0; r < 2; r++) {
      html += '<div class="frow">';
      for (let c = 0; c < 5; c++) {
        const idx = f * 10 + r * 5 + c;
        const filled = idx < blue + green;
        const kind = o.forceColor || (idx < blue ? 'blue' : 'green');
        const dragAttr = filled && o.dragFilled ? ` data-cell-fill="${kind}" data-frame="${frameId}" data-value="${idx + 1}"` : '';
        html += `<button type="button" class="cell${filled ? ` filled ${kind}` : ''}${highlight === idx ? ' hl' : ''}" data-ten="${idx}" data-frame="${frameId}" data-drop="${frameId}:${idx}"${dragAttr} aria-label="${idx + 1}번째 칸${filled ? ', 채워짐' : ', 비어 있음'}">${filled ? `<span class="dot ${kind}"></span>` : '<span class="edot"></span>'}</button>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }
  return html + '</div>';
}
function bundleSummaryHTML(n, opts) {
  const o = opts || {};
  const p = partsFromValue(Math.max(0, Math.trunc(n)));
  const bits = [];
  if (p.hundreds) bits.push(`<span class="bundle-item">🟧 백 <b>${p.hundreds}</b></span>`);
  if (p.tens) bits.push(`<span class="bundle-item">🟩 십 <b>${p.tens}</b></span>`);
  if (p.units) bits.push(`<span class="bundle-item">🟦 일 <b>${p.units}</b></span>`);
  return `<div class="bundle-strip">${bits.join('') || '<span class="bundle-item">아직 없음</span>'}${o.extra || ''}</div>`;
}
function bundleActionHTML(prefix) {
  const p = prefix || 'bundle';
  return `<div class="row-flex" style="margin-top:0">
    <button type="button" class="bundle-big-btn blue" data-${p}="ten">10개 묶기</button>
    <button type="button" class="bundle-big-btn" data-${p}="hundred">100개 묶기</button>
    <button type="button" class="btn soft" data-${p}="unten">십 1개 풀기</button>
    <button type="button" class="btn soft" data-${p}="unhundred">백 1개 풀기</button>
  </div>`;
}

/* ---------- 1단계: 분류 ---------- */
function renderSort() {
  if (!state.sort.items.length && !state.sort.done) newSortRound();
  const body = $('toolBody');
  setToolHead('🧺 분류 바구니', '과일을 손가락으로 끌어서 같은 바구니에 넣어 보세요');
  const basketHtml = SORT_KINDS.map((kind) => `
    <div class="basket" data-basket="${kind.id}" data-drop="basket:${kind.id}" role="group" aria-label="${kind.label} 바구니">
      <div class="basket-title"><span>${kind.emoji} ${kind.label}</span><b>${state.sort.counts[kind.id]}개</b></div>
      <div class="basket-items">${Array.from({ length: state.sort.counts[kind.id] }, () => `<span class="sorted-item">${kind.emoji}</span>`).join('') || '<span class="muted">여기에 끌어다 놓아요</span>'}</div>
    </div>`).join('');
  const tray = state.sort.items.map((it, i) => {
    const kind = SORT_KINDS.find((k) => k.id === it.kind);
    return `<button type="button" class="sort-item" data-sort="${i}" data-sort-item="${i}" data-kind="${it.kind}" aria-label="${kind.label} 끌어서 바구니에 담기" title="${kind.label}">${kind.emoji}</button>`;
  }).join('');
  body.innerHTML = `
    <div class="guide">색과 모양을 살펴보고 <b>같은 것끼리</b> 모아 보세요. 과일을 <b>손가락으로 끌어서</b> 바구니에 놓아요. 그냥 눌러도 담을 수 있어요.</div>
    <div class="sort-baskets">${basketHtml}</div>
    <div class="sort-tray" aria-label="분류할 과일">${tray || '<b style="color:#16a34a">분류 완성! 모든 것을 바구니에 담았어요 🎉</b>'}</div>
    <div class="row-flex">
      <button type="button" class="btn soft" data-sort-reset>🔄 다시 섞기</button>
      <span class="muted">${state.sort.items.length ? `남은 것 ${state.sort.items.length}개` : '모두 분류했어요'}</span>
    </div>`;

  const place = (i) => {
    const item = state.sort.items[i];
    if (!item) return;
    const kind = SORT_KINDS.find((k) => k.id === item.kind);
    state.sort.items.splice(i, 1);
    state.sort.counts[item.kind] += 1;
    state.sort.done = state.sort.items.length === 0;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${kind.label} 분류`);
    if (state.sort.done) {
      awardToken('분류를 모두 마쳤어요. 정말 잘했어요!');
      announce('분류를 모두 마쳤어요. 같은 것끼리 모았어요.');
    } else {
      speak(`${kind.label} 바구니에 담았어요. ${countWord(state.sort.counts[item.kind])}개`);
    }
    renderTool();
  };

  body.querySelectorAll('[data-sort]').forEach((b) => {
    b.onclick = () => place(Number(b.dataset.sort));
  });
  bindDrag(body, '[data-sort-item]', (el) => ({ i: Number(el.dataset.sortItem), kind: el.dataset.kind }), (p, zone) => {
    if (!zone) return;
    const target = (zone.dataset.drop || '').split(':')[1];
    if (target === p.kind) {
      place(p.i);
    } else {
      recordTrial('error', state.promptLevel, '다른 바구니에 놓음');
      haptic(40);
      const kind = SORT_KINDS.find((k) => k.id === p.kind);
      speak(`이것은 ${kind.label}예요. ${kind.label} 바구니에 넣어요.`);
      showHintTarget(`[data-drop="basket:${p.kind}"]`, body);
    }
  }, {
    onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="basket:${p.kind}"]`, body); },
    onActivate: (p) => place(p.i),
  });

  body.querySelectorAll('[data-basket]').forEach((b) => {
    b.onclick = () => {
      const kind = SORT_KINDS.find((k) => k.id === b.dataset.basket);
      speak(`${kind.label} ${countWord(state.sort.counts[kind.id])}개`);
    };
  });
  const reset = body.querySelector('[data-sort-reset]');
  if (reset) reset.onclick = () => { newSortRound(); speak('다시 섞었어요'); renderTool(); };
}

/* ---------- 2단계: 세기 ---------- */
function renderCount() {
  const { first } = activeCalc();
  const n = clamp(Math.trunc(Number(first) || 0), 0, 100);
  const body = $('toolBody');
  setToolHead('🔢 세기 · 10칸 판', '점을 손가락으로 끌어 칸에 놓으며 하나씩 세어 보세요');
  const totalCells = Math.max(20, Math.ceil(Math.max(n, 1) / 10) * 10);
  const tray = [1, 10, 100].map((v) => `
    <div class="drag-token${v === 10 ? ' green' : v === 100 ? ' amber' : ''}" data-count-token="${v}" role="button" tabindex="0" aria-label="${v}개 끌기">
      <span class="big">${v === 1 ? '●' : v === 10 ? '▥' : '▦'}</span><span class="tiny">${v}개</span>
    </div>`).join('');
  body.innerHTML = `
    <div class="guide">점을 <b>손가락으로 끌어</b> 칸에 놓아요. 한 칸에 하나씩, 왼쪽 위부터 채워요.</div>
    <div class="drag-tray"><span class="tray-label">끌어서 놓기</span>${tray}</div>
    <div data-drop="count-add" aria-label="세기 판">${tenFrameHTML(totalCells, n, 0, state.countPlay.idx, { frameId: 'count', dragFilled: true })}</div>
    ${bundleSummaryHTML(n, { extra: `<span class="bundle-item">전체 <b>${n}</b>개</span>` })}
    <div class="row-flex">
      <div class="num-card"><span class="v">${n}</span><span class="c">${countWord(n)}</span></div>
      <div class="row-flex" style="flex:1;margin-top:0">
        <button type="button" class="btn primary" data-count="p1">＋1</button>
        <button type="button" class="btn primary" data-count="p5">＋5</button>
        <button type="button" class="btn primary" data-count="p10">＋10</button>
        <button type="button" class="btn amber" data-count="p100">＋100</button>
        <button type="button" class="btn soft" data-count="m1">－1</button>
        <button type="button" class="btn soft" data-count="reset">0으로</button>
        <button type="button" class="btn violet" data-count="play">▶ 하나씩 짚어 세기</button>
      </div>
    </div>
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-count-bundle="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-count-bundle="hundred">100개 묶기</button>
      <div class="drop-plate" data-drop="count-minus" style="min-height:52px;padding:7px 10px;border-color:#fda4af;background:#fff1f2;flex:1">
        <div class="plate-title" style="margin:0"><span>➖ 여기로 끌면 하나 빼기</span></div>
      </div>
    </div>`;

  const setCount = (value, msg) => {
    const v = clamp(Math.trunc(value), 0, 100);
    setFirstNumber(v);
    if (msg) speak(msg);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${v}까지 세기`);
  };

  body.querySelectorAll('[data-ten]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.ten) + 1;
      setCount(idx === n ? idx - 1 : idx, `${countWord(idx === n ? idx - 1 : idx)}`);
    };
  });
  body.querySelectorAll('[data-count]').forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.count;
      if (k === 'p1') setCount(n + 1, countWord(n + 1));
      else if (k === 'p5') setCount(n + 5, countWord(n + 5));
      else if (k === 'p10') setCount(n + 10, `${countWord(n + 10)}. 십 묶음이 하나 늘었어요`);
      else if (k === 'p100') setCount(n + 100, '백 묶음이 하나 늘었어요');
      else if (k === 'm1') setCount(n - 1, countWord(n - 1));
      else if (k === 'reset') setCount(0, '영');
      else if (k === 'play') playCountSequence();
    };
  });
  body.querySelectorAll('[data-count-bundle]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.countBundle === 'ten') {
        if (n < 10) { speak('10개가 모이면 묶을 수 있어요. 점을 더 놓아 보세요.'); return; }
        awardToken('10개를 십 묶음 하나로 묶었어요!');
        speak(`${n}개 안에 십 묶음이 ${Math.floor(n / 10)}개 있어요.`);
      } else {
        if (n < 100) { speak('100개가 모이면 백 묶음 하나로 묶을 수 있어요.'); return; }
        awardToken('100개를 백 묶음 하나로 묶었어요!');
        speak('100개는 백 묶음 하나예요.');
      }
    };
  });

  bindDrag(body, '[data-count-token]', (el) => ({ add: Number(el.dataset.countToken) }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop === 'count-minus') {
      setCount(n - 1, `${countWord(n - 1)}. 하나를 덜어냈어요`);
      return;
    }
    if (drop.startsWith('count:')) {
      const idx = Number(drop.split(':')[1]) + 1;
      setCount(Math.max(n, idx - 1 + p.add), `${countWord(Math.max(n, idx - 1 + p.add))}`);
    } else {
      setCount(n + p.add, `${countWord(n + p.add)}`);
    }
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="count-add"]', body); },
    onActivate: (p) => setCount(n + p.add, countWord(n + p.add)),
  });
  bindDrag(body, '[data-cell-fill]', () => ({ remove: 1 }), (p, zone) => {
    if (zone && (zone.dataset.drop === 'count-minus')) setCount(n - 1, `${countWord(n - 1)}. 하나를 덜어냈어요`);
  }, { onActivate: () => setCount(n - 1, countWord(n - 1)) });
}

function playCountSequence() {
  stopAnim();
  const n = clamp(Number(activeCalc().first) || 0, 0, 100);
  if (n <= 0) { speak('먼저 칸을 눌러 수를 만들어 보세요'); return; }
  state.countPlay = { idx: 0, token: state.countPlay.token + 1 };
  renderTool();
  speak('하나');
  let i = 0;
  countTimer = setInterval(() => {
    i++;
    if (i >= n) {
      stopAnim();
      renderTool();
      speak(`모두 ${countWord(n)}개예요`);
      return;
    }
    state.countPlay.idx = i;
    renderTool();
    speak(countWord(i + 1));
  }, 470);
}

/* ---------- 수직선 ---------- */
function numberLineSVG(config) {
  const cfg = config || {};
  const max = cfg.max || 20;
  const marks = cfg.marks || [];
  const arcs = cfg.arcs || [];
  const W = 760, H = 178, PAD = 42;
  const x = (v) => PAD + (clamp(v, 0, max) / max) * (W - PAD * 2);
  const y = 94;
  let ticks = '';
  for (let i = 0; i <= max; i++) {
    const xx = x(i);
    const major = i % 5 === 0;
    ticks += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${major ? y + 13 : y + 7}" stroke="${major ? '#334155' : '#94a3b8'}" stroke-width="${major ? 2 : 1}"/>`;
    if (i % (cfg.labelEvery || 2) === 0) {
      ticks += `<text x="${xx}" y="${y + 31}" text-anchor="middle" font-size="13" font-weight="800" fill="#475569">${i}</text>`;
    }
  }
  const arcHtml = arcs.map((a) => {
    const x1 = x(a.from), x2 = x(a.to), mx = (x1 + x2) / 2;
    const color = a.color || '#7c3aed';
    const up = a.up !== false;
    const path = `M ${x1} ${y - 6} Q ${mx} ${up ? 18 : 158} ${x2} ${y - 6}`;
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" marker-end="url(#nlArrow)"/>
      <text x="${mx}" y="${up ? 15 : 174}" text-anchor="middle" font-size="15" font-weight="900" fill="${color}">${a.label || ''}</text>`;
  }).join('');
  const markHtml = marks.map((m) => {
    const xx = x(m.value);
    const color = m.color || '#2563eb';
    return `<circle cx="${xx}" cy="${y}" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="${xx}" y="${y - 15}" text-anchor="middle" font-size="14" font-weight="900" fill="${color}">${m.label ?? m.value}</text>`;
  }).join('');
  return `<div class="numline-wrap"><svg class="numline" viewBox="0 0 ${W} ${H}" role="img" aria-label="0부터 ${max}까지의 수직선">
    <defs><marker id="nlArrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7c3aed"/></marker></defs>
    <line x1="${x(0)}" y1="${y}" x2="${x(max)}" y2="${y}" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
    <text x="${x(0)}" y="${y + 52}" text-anchor="start" font-size="12" font-weight="900" fill="#64748b">작은 수</text>
    <text x="${x(max)}" y="${y + 52}" text-anchor="end" font-size="12" font-weight="900" fill="#64748b">큰 수</text>
    ${ticks}${arcHtml}${markHtml}</svg></div>`;
}

function interactiveNumberLineHTML(start, target, op) {
  const marker = clamp(Number(state.nlMarker ?? start), 0, 20);
  const stops = Array.from({ length: 21 }, (_, i) => `
    <button type="button" class="nl-stop${i % 5 === 0 ? ' major' : ''}" data-drop="nl:${i}" aria-label="${i} 자리">
      <span class="nl-num">${i % 2 === 0 ? i : ''}</span>
    </button>`).join('');
  const pos = (v) => `calc(10px + (100% - 20px) * ${clamp(v, 0, 20) / 20})`;
  return `<div class="nl-interactive" aria-label="0부터 20까지 끌 수 있는 수직선">
    <div class="nl-target" style="left:${pos(target)}" title="목표">🎯</div>
    <div class="nl-track"><div class="nl-stops">${stops}</div></div>
    <div class="nl-marker" data-nl-marker style="left:${pos(marker)}" role="button" tabindex="0" aria-label="현재 ${marker}, 목표 ${target}. 끌어서 옮기세요">🐸</div>
    <div class="nl-caption">🐸를 손가락으로 끌어 <b>${target}</b> 자리에 놓아 보세요. (${start}에서 ${op === '+' ? '앞으로' : '뒤로'} ${Math.abs(target - start)}칸)</div>
  </div>`;
}

/* ---------- 3단계: 비교 ---------- */
function renderCompare() {
  const a = state.compare.a;
  const b = state.compare.b;
  const body = $('toolBody');
  const sign = a > b ? '>' : a < b ? '<' : '=';
  const diff = Math.abs(a - b);
  const theme = currentTheme();
  const maxLen = Math.min(Math.max(a, b, 1), 15);
  const plate = (which, value, cls) => `
    <div class="drop-plate ${cls}" data-drop="cmp:${which}" aria-label="${which === 'a' ? '첫 번째' : '두 번째'} 수 놓는 곳">
      <div class="plate-title"><span>${which === 'a' ? '🔵 첫 번째 수' : '🟢 두 번째 수'}</span><span class="plate-count">${value}</span></div>
      <div class="plate-items">${Array.from({ length: value }, (_, i) => `<span class="counter-chip${which === 'b' ? ' green' : ''}" data-cmp-move="${which}" role="button" tabindex="0" aria-label="${i + 1}번째 점">●</span>`).join('') || '<span class="muted">점을 끌어다 놓아요</span>'}</div>
    </div>`;
  let pairCols = '';
  for (let i = 0; i < maxLen; i++) {
    const hasA = i < a;
    const hasB = i < b;
    const matched = hasA && hasB;
    pairCols += `<div class="pair-col ${matched ? 'matched' : 'extra'}" style="--pair-order:${i}">
      <span class="pair-emoji">${hasA ? theme.a : '·'}</span>
      <span class="pair-state">${matched ? '짝' : hasA ? '남음' : '남음'}</span>
      <span class="pair-emoji">${hasB ? theme.b : '·'}</span>
    </div>`;
  }
  setToolHead('⚖️ 어느 쪽이 더 많을까?', '점을 끌어 양쪽에 놓고 하나씩 짝을 지어 보세요');
  body.innerHTML = `
    <div class="guide">점을 <b>양쪽 접시로 끌어다 놓아요</b>. 점을 다른 접시로 옮기면 수가 바뀌어요.</div>
    <div class="two-plates">${plate('a', a, 'first')}${plate('b', b, 'second')}</div>
    <div class="drag-tray"><span class="tray-label">점을 끌어서 놓기</span>
      <div class="drag-token" data-cmp-token="a" role="button" tabindex="0"><span class="big">●</span><span class="tiny">첫째 +1</span></div>
      <div class="drag-token green" data-cmp-token="b" role="button" tabindex="0"><span class="big">●</span><span class="tiny">둘째 +1</span></div>
      <div class="drop-plate" data-drop="cmp-minus" style="min-height:52px;padding:7px 10px;border-color:#fda4af;background:#fff1f2"><div class="plate-title" style="margin:0"><span>➖ 여기로 끌면 하나 빼기</span></div></div>
    </div>
    <div class="compare-cards">
      <div class="num-card"><span class="v">${a}</span><span class="c">첫 번째 · ${countWord(a)}</span></div>
      <div class="sign-badge">${sign}</div>
      <div class="num-card green"><span class="v">${b}</span><span class="c">두 번째 · ${countWord(b)}</span></div>
    </div>
    <div class="row-flex" style="margin-top:0;justify-content:center">
      <button type="button" class="btn soft" data-cmp="a:-1">첫째 －1</button>
      <button type="button" class="btn soft" data-cmp="a:1">첫째 ＋1</button>
      <button type="button" class="btn soft" data-cmp="b:-1">둘째 －1</button>
      <button type="button" class="btn soft" data-cmp="b:1">둘째 ＋1</button>
      <button type="button" class="btn primary" data-cmp-load>계산기에 ${a} + ${b} 넣기</button>
    </div>
    ${bundleSummaryHTML(a, { extra: `<span class="bundle-item">첫째 ${a}개</span>` })}
    ${bundleSummaryHTML(b, { extra: `<span class="bundle-item">둘째 ${b}개</span>` })}
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-cmp-bundle="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-cmp-bundle="hundred">100개 묶기</button>
    </div>
    <div class="pair-grid">${pairCols}</div>
    <div class="guide" style="text-align:center">
      ${a === b ? `두 수가 <b>${a}개</b>로 똑같아요! (${a} = ${b})`
        : a > b ? `첫 번째 수(${a})가 두 번째 수(${b})보다 <b>${diff}개 더 많아요!</b> (${a} > ${b})`
          : `두 번째 수(${b})가 첫 번째 수(${a})보다 <b>${diff}개 더 많아요!</b> (${a} < ${b})`}
    </div>
    ${numberLineSVG({ max: 20, marks: [{ value: a, label: String(a), color: '#2563eb' }, { value: b, label: String(b), color: '#16a34a' }] })}
    ${Math.max(a, b) > 15 ? '<div class="muted">15보다 큰 수는 그림 대신 수직선과 숫자로 비교해요.</div>' : ''}`;

  const setCompare = (which, value, msg) => {
    state.compare[which] = clamp(Math.trunc(value), 0, 20);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${which === 'a' ? '첫째' : '둘째'} ${state.compare[which]}개`);
    renderTool();
    if (msg) speak(msg);
  };
  body.querySelectorAll('[data-cmp]').forEach((btn) => {
    btn.onclick = () => {
      const [which, delta] = btn.dataset.cmp.split(':');
      setCompare(which, state.compare[which] + Number(delta), countWord(state.compare[which] + Number(delta)));
    };
  });
  body.querySelectorAll('[data-cmp-token]').forEach((t) => {
    t.onclick = () => {
      const which = t.dataset.cmpToken;
      setCompare(which, state.compare[which] + 1, countWord(state.compare[which] + 1));
    };
  });
  bindDrag(body, '[data-cmp-token]', (el) => ({ add: 1, which: el.dataset.cmpToken }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('cmp:')) {
      const which = drop.split(':')[1];
      setCompare(which, state.compare[which] + 1, `${countWord(state.compare[which] + 1)}`);
    }
  }, { onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="cmp:${p.which}"]`, body); } });
  bindDrag(body, '[data-cmp-move]', (el) => ({ from: el.dataset.cmpMove }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop === 'cmp-minus') {
      setCompare(p.from, state.compare[p.from] - 1, `${countWord(state.compare[p.from] - 1)}`);
      return;
    }
    if (drop.startsWith('cmp:')) {
      const to = drop.split(':')[1];
      if (to === p.from) return;
      state.compare[p.from] = Math.max(0, state.compare[p.from] - 1);
      setCompare(to, state.compare[to] + 1, `${countWord(state.compare[to] + 1)}`);
    }
  });
  body.querySelectorAll('[data-cmp-bundle]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.cmpBundle === 'ten') {
        if (Math.max(a, b) < 10) { speak('10개가 모이면 묶을 수 있어요.'); return; }
        awardToken('10개를 십 묶음 하나로 묶었어요!');
        speak(`10개는 십 묶음 하나예요. 첫째는 십 ${Math.floor(a / 10)}개, 둘째는 십 ${Math.floor(b / 10)}개예요.`);
      } else {
        speak('100개가 모이면 백 묶음 하나로 묶을 수 있어요. 10개씩 먼저 묶어 보세요.');
      }
    };
  });
  const load = body.querySelector('[data-cmp-load]');
  if (load) load.onclick = () => loadExpression(a, '+', b);
}

/* ---------- 4단계: 모으기와 가르기 ---------- */
function changeComposeSub(which, delta) {
  const calc = activeCalc();
  let a = calc.op === '-' && calc.first !== null ? calc.first : 8;
  let b = calc.op === '-' && calc.second !== null ? calc.second : 3;
  if (!Number.isFinite(a) || a < 0) a = 8;
  if (!Number.isFinite(b) || b < 0) b = 3;
  a = clamp(a + (which === 'a' ? delta : 0), 0, 10);
  b = clamp(b + (which === 'b' ? delta : 0), 0, 10);
  if (b > a) { speak('빼는 수는 처음 수보다 클 수 없어요'); return; }
  loadExpression(a, '-', b, { quiet: true });
  speak(`${countWord(a)}에서 ${countWord(b)}${subjectParticle(b)} 빼면 ${countWord(a - b)}`);
}

function renderCompose() {
  const calc = activeCalc();
  const isSub = calc.op === '-';
  const body = $('toolBody');
  let a = calc.first ?? (isSub ? 8 : 3);
  let b = calc.second ?? (isSub ? 3 : 5);
  if (!Number.isFinite(a) || a < 0) a = isSub ? 8 : 3;
  if (!Number.isFinite(b) || b < 0) b = isSub ? 3 : 5;
  a = clamp(a, 0, 10);
  b = clamp(b, 0, 10);
  if (isSub && b > a) {
    setToolHead('➖ 가르기', '빼는 수가 처음 수보다 커요');
    body.innerHTML = `
      <div class="guide">처음 수 <b>${a}</b>보다 빼는 수 <b>${b}</b>가 커서 0보다 작아져요. 이때는 가로식으로 확인해요.</div>
      <div class="row-flex">
        <button type="button" class="btn primary" data-compose-ex="8,3">8 - 3</button>
        <button type="button" class="btn green" data-compose-ex="7,2">7 - 2</button>
        <button type="button" class="btn soft" data-compose-ex="5,5">5 - 5</button>
      </div>`;
    body.querySelectorAll('[data-compose-ex]').forEach((btn) => {
      btn.onclick = () => {
        const [x, y] = btn.dataset.composeEx.split(',').map(Number);
        loadExpression(x, '-', y);
      };
    });
    return;
  }
  if (isSub) b = Math.min(b, a);
  if (isSub && state.composeBaseA !== a) { state.composeBaseA = a; state.composeRemoved = 0; }
  const removed = isSub ? clamp(state.composeRemoved, 0, b) : 0;
  const leftPart = isSub ? a - removed : a;
  const rightPart = isSub ? b : b;
  const total = isSub ? a : a + b;
  const fits = isSub || a + b <= 10;
  const headline = isSub
    ? `<b>${countWord(a)}</b>에서 <b>${countWord(b)}</b>${subjectParticle(b)} 하나씩 끌어내면 <b>${countWord(a - b)}</b>이 남아요.`
    : `<b>${countWord(a)}</b>과 <b>${countWord(b)}</b>를 모으면 <b>${countWord(a + b)}</b>이에요.`;
  setToolHead(isSub ? '➖ 가르기' : '➕ 모으기와 가르기', '점을 손가락으로 끌어 옮기며 모으고 갈라 보세요');
  const leftFrame = tenFrameHTML(10, Math.min(leftPart, 10), 0, -1, { frameId: 'composeA', dragFilled: true });
  const rightFrame = isSub
    ? `<div class="drop-plate" data-drop="compose-minus" style="border-color:#fda4af;background:#fff1f2;min-height:180px">
        <div class="plate-title"><span>➖ 빼는 곳 · ${removed}/${b}</span><span class="plate-count">${removed}</span></div>
        <div class="plate-items">${Array.from({ length: removed }, (_, i) => `<span class="counter-chip rose" role="button" tabindex="0" aria-label="${i + 1}번째 뺀 점">●</span>`).join('') || '<span class="muted">왼쪽 점을 여기로 끌어와요</span>'}</div>
      </div>`
    : tenFrameHTML(10, Math.min(rightPart, 10), 0, -1, { frameId: 'composeB', dragFilled: true, forceColor: 'green' });
  body.innerHTML = `
    <div class="guide">${headline} <b>점을 끌어다</b> 다른 칸으로 옮겨 보세요. 그냥 눌러도 돼요.</div>
    <div class="two-plates">
      <div><div class="guide" style="margin-bottom:5px"><b>${isSub ? '처음 수' : '첫 번째 수'} ${leftPart}</b></div>${leftFrame}</div>
      <div><div class="guide" style="margin-bottom:5px"><b>${isSub ? '빼는 곳' : '두 번째 수'} ${isSub ? b : rightPart}</b></div>${rightFrame}</div>
    </div>
    <div class="bond">
      <div class="bond-total">${total}</div>
      <div class="bond-lines"></div>
      <div class="bond-parts"><div class="bond-part">${leftPart}</div><div class="bond-part second">${isSub ? removed : rightPart}</div></div>
    </div>
    <div class="row-flex" style="justify-content:center;margin-top:0">
      <button type="button" class="btn soft" data-compose="a:-1">${isSub ? '처음 수' : '첫째'} －1</button>
      <button type="button" class="btn soft" data-compose="a:1">${isSub ? '처음 수' : '첫째'} ＋1</button>
      <button type="button" class="btn soft" data-compose="b:-1">${isSub ? '빼는 수' : '둘째'} －1</button>
      <button type="button" class="btn soft" data-compose="b:1">${isSub ? '빼는 수' : '둘째'} ＋1</button>
    </div>
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-compose-bundle="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-compose-bundle="hundred">100개 묶기</button>
    </div>
    <div class="guide" style="text-align:center;font-size:15px">
      ${isSub
        ? `<b>${a} - ${removed} = ${leftPart}</b>${removed === b ? ` · <b>${a} - ${b} = ${a - b}</b> 완성!` : ` · ${b}개 중 ${removed}개를 덜어냈어요.`}`
        : `<b>${a} + ${b} = ${total}</b><br/><b>${total} - ${a} = ${b}</b> · <b>${total} - ${b} = ${a}</b>`}
    </div>
    ${fits ? '' : '<div class="feedback" style="color:#b45309">10보다 커요. 10칸 판 안에서 다시 맞춰 보세요.</div>'}`;

  const transfer = (from, to) => {
    if (from === to) return;
    if (isSub) {
      if (from === 'composeA' && to === 'compose-minus' && removed < b) {
        state.composeRemoved = removed + 1;
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '하나 덜어내기');
        renderTool();
        if (state.composeRemoved >= b) awardToken('가르기를 완성했어요!');
        else speak(`${countWord(a - state.composeRemoved)}개가 남았어요`);
      }
      return;
    }
    let newA = a;
    let newB = b;
    if (from === 'composeA' && to === 'composeB') { newA = a - 1; newB = b + 1; }
    else if (from === 'composeB' && to === 'composeA') { newA = a + 1; newB = b - 1; }
    else return;
    if (newA < 0 || newB < 0 || newA > 10 || newB > 10) return;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${newA} + ${newB}`);
    loadExpression(newA, '+', newB, { quiet: true });
    if (newA === 10 || newB === 10) awardToken('10을 만들었어요!');
    else speak(`${newA}개와 ${newB}개로 나누었어요`);
  };

  body.querySelectorAll('[data-compose]').forEach((btn) => {
    btn.onclick = () => {
      const [part, delta] = btn.dataset.compose.split(':');
      if (isSub) changeComposeSub(part, Number(delta));
      else changeCompose(part, Number(delta));
    };
  });
  bindDrag(body, '[data-cell-fill]', (el) => ({ frame: el.dataset.frame, value: Number(el.dataset.value) }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    const target = drop.split(':')[0];
    if (isSub) {
      if (p.frame === 'composeA' && target === 'compose-minus') transfer('composeA', 'compose-minus');
      else if (target === 'composeA') speak('이미 처음 수 칸이에요.');
    } else {
      transfer(p.frame, target);
    }
  }, {
    onStart: (p) => {
      if (!state.settings.errorless) return;
      if (isSub) showHintTarget('[data-drop="compose-minus"]', body);
      else showHintTarget(`[data-drop="${p.frame === 'composeA' ? 'composeB' : 'composeA'}:0"]`, body);
    },
  });
  body.querySelectorAll('[data-compose-bundle]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.composeBundle === 'ten') {
        if (Math.max(a, b) < 10) { speak('10개가 모이면 십 묶음 하나로 묶을 수 있어요.'); return; }
        awardToken('10개를 십 묶음 하나로 묶었어요!');
        speak(`10개는 십 묶음 하나예요. ${a} + ${b} = ${total}이에요.`);
      } else {
        speak('100개는 십 묶음 10개예요. 10개씩 먼저 묶어 보세요.');
      }
    };
  });
  body.querySelectorAll('.bond-part, .bond-total').forEach((el) => {
    el.onclick = () => speak(countWord(Number(el.textContent)));
  });
}

/* ---------- 5단계: 10 만들기 ---------- */
function renderMakeTen() {
  const calc = activeCalc();
  if (calc.op && calc.op !== '+') {
    setToolHead('🔟 10 만들기', '10 만들기는 더하기 활동이에요');
    $('toolBody').innerHTML = `
      <div class="guide">지금 식은 <b>${calc.first ?? ''} ${calc.op} ${calc.second ?? ''}</b>이에요. 10 만들기는 더하기에서 사용하는 전략이에요.</div>
      <div class="row-flex">
        <button type="button" class="btn primary" data-mt-go="4">4단계 가르기로 확인하기</button>
        <button type="button" class="btn green" data-mt="7,5">7 + 5로 연습하기</button>
      </div>`;
    $('toolBody').querySelectorAll('[data-mt]').forEach((btn) => {
      btn.onclick = () => {
        const [x, y] = btn.dataset.mt.split(',').map(Number);
        loadExpression(x, '+', y);
      };
    });
    const go = $('toolBody').querySelector('[data-mt-go]');
    if (go) go.onclick = () => { state.stage = 4; render(); };
    return;
  }
  const body = $('toolBody');
  let a = calc.op === '+' && calc.first !== null ? calc.first : 7;
  let b = calc.op === '+' && calc.second !== null ? calc.second : 5;
  a = clamp(Math.trunc(a), 0, 9);
  b = clamp(Math.trunc(b), 0, 20);
  const need = Math.max(0, 10 - a);
  const moved = Math.min(b, need);
  const rest = Math.max(0, b - moved);
  const total = a + b;
  const tenMade = a === 10 || a + moved === 10;
  const canMakeTen = total >= 10 && tenMade && b > 0;
  const intro = a === 10
    ? `10칸 판이 가득 찼어요! 남은 <b>${b}</b>개를 더하면 <b>${total}</b>이에요.`
    : canMakeTen
      ? (rest > 0
        ? `① <b>${a}</b>에 <b>${moved}</b>개를 채워 <b>10</b>을 만들고, ② 남은 <b>${rest}</b>개를 더하면 <b>${total}</b>!`
        : `① <b>${a}</b>에 <b>${moved}</b>개를 채우면 <b>10</b>! 남은 수가 없어서 그대로 <b>${total}</b>이에요.`)
      : `두 수를 그냥 모으면 <b>${total}</b>이에요. 10을 만들 필요가 없어요.`;
  const equation = canMakeTen && rest > 0
    ? `<b>${a} + ${b} = (${a} + ${moved}) + ${rest} = 10 + ${rest} = ${total}</b>`
    : `<b>${a} + ${b} = ${total}</b>`;
  setToolHead('🔟 10을 먼저 만들기', '오른쪽 점을 왼쪽 빈칸으로 끌어 10을 만들어요');
  body.innerHTML = `
    <div class="guide">${intro}</div>
    <div class="two-plates">
      <div><div class="guide" style="margin-bottom:5px"><b>10칸 판 · ${a}개</b></div>${tenFrameHTML(10, a, 0, -1, { frameId: 'mtLeft', dragFilled: true })}</div>
      <div><div class="guide" style="margin-bottom:5px"><b>더할 수 · ${b}개</b></div>${tenFrameHTML(Math.max(10, Math.ceil(Math.max(b, 1) / 10) * 10), b, 0, -1, { frameId: 'mtRight', dragFilled: true, forceColor: 'green' })}</div>
    </div>
    <div class="guide" style="text-align:center;font-size:15px">${equation}</div>
    ${canMakeTen ? '' : '<div class="feedback" style="color:#b45309">두 수의 합이 10보다 작아요. 4단계에서 모으기로 확인해 보세요.</div>'}
    <div class="row-flex" style="margin-top:0">
      <button type="button" class="bundle-big-btn blue" data-mt-bundle="ten">10개 묶기</button>
      <button type="button" class="bundle-big-btn" data-mt-bundle="hundred">100개 묶기</button>
    </div>
    <div class="row-flex">
      <button type="button" class="btn primary" data-mt="7,5">7 + 5</button>
      <button type="button" class="btn green" data-mt="8,4">8 + 4</button>
      <button type="button" class="btn amber" data-mt="9,6">9 + 6</button>
      <button type="button" class="btn soft" data-mt="6,7">6 + 7</button>
      <button type="button" class="btn soft" data-mt="5,8">5 + 8</button>
    </div>`;

  body.querySelectorAll('[data-mt]').forEach((btn) => {
    btn.onclick = () => {
      const [x, y] = btn.dataset.mt.split(',').map(Number);
      loadExpression(x, '+', y);
    };
  });
  bindDrag(body, '[data-cell-fill]', (el) => ({ frame: el.dataset.frame, value: Number(el.dataset.value) }), (p, zone) => {
    if (!zone) return;
    const target = (zone.dataset.drop || '').split(':')[0];
    if (p.frame === 'mtRight' && target === 'mtLeft' && b > 0 && a < 10) {
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '10 만들기');
      loadExpression(a + 1, '+', b - 1, { quiet: true });
      if (a + 1 === 10) awardToken('10을 만들었어요! 남은 수를 더해 보세요.');
      else speak(`${a + 1}개. 10이 되려면 ${9 - a}개 더 필요해요.`);
    } else if (target === 'mtRight' && p.frame === 'mtLeft') {
      speak('왼쪽 10칸 판에서 오른쪽으로 옮기면 10을 만들 수 없어요.');
    }
  }, {
    onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="${p.frame === 'mtRight' ? 'mtLeft' : 'mtRight'}:0"]`, body); },
  });
  body.querySelectorAll('[data-mt-bundle]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.mtBundle === 'ten') {
        if (a < 10) { speak('왼쪽 10칸 판을 먼저 가득 채워요.'); return; }
        awardToken('10개를 십 묶음 하나로 묶었어요!');
        speak('10개는 십 묶음 하나예요.');
      } else {
        speak('100개는 십 묶음 10개예요. 10개씩 먼저 묶어 보세요.');
      }
    };
  });
}

/* ---------- 6단계: 전략 ---------- */
function renderStrategy() {
  const calc = activeCalc();
  if (!calc.op || calc.second === null) {
    setToolHead('🛣️ 계산 전략 고르기', '계산기에서 + 또는 -를 눌러 보세요');
    $('toolBody').innerHTML = `
      <div class="guide">두 수와 연산 기호를 넣으면 수직선에서 전략을 골라 볼 수 있어요.</div>
      <div class="row-flex">
        <button type="button" class="btn primary" data-st="8,+,7">8 + 7</button>
        <button type="button" class="btn green" data-st="9,+,4">9 + 4</button>
        <button type="button" class="btn amber" data-st="13,-,5">13 - 5</button>
        <button type="button" class="btn soft" data-st="15,-,8">15 - 8</button>
      </div>`;
    $('toolBody').querySelectorAll('[data-st]').forEach((b) => {
      b.onclick = () => {
        const [x, o, y] = b.dataset.st.split(',');
        loadExpression(Number(x), o, Number(y));
      };
    });
    return;
  }
  let a = calc.first ?? 8;
  let b = calc.second ?? 7;
  let op = calc.op === '-' ? '-' : '+';
  const total = applyOp(a, b, op);
  const inRange = a >= 0 && a <= 20 && b >= 0 && b <= 20 && total >= 0 && total <= 20;
  const strategies = [
    { id: 'count', label: '모두 세기' },
    { id: 'forward', label: '이어 세기' },
    { id: 'maketen', label: '10 만들기' },
    { id: 'back', label: '거꾸로 세기' },
  ];
  if (!strategies.some((s) => s.id === state.strategy)) state.strategy = 'forward';
  if (state.nlBase !== a) { state.nlBase = a; state.nlMarker = a; }
  let explain = '';
  let line = '';
  if (!inRange) {
    explain = '수를 0~20 사이로 맞추면 수직선에서 전략을 볼 수 있어요.';
    line = numberLineSVG({ max: 20, marks: [{ value: clamp(a, 0, 20), label: String(a), color: '#2563eb' }] });
  } else if (state.strategy === 'count') {
    const chips = Array.from({ length: Math.max(0, total) }, (_, i) => `<span class="chip" style="background:${i < a ? '#2563eb' : '#16a34a'}">${i + 1}</span>`).join('');
    explain = op === '+'
      ? `1부터 하나씩 세어 <b>${total}</b>까지 갑니다. ${a}개 뒤에 ${b}개를 이어 놓고 전부 세어 보세요.`
      : `${a}개에서 ${b}개를 덜어내고, 남은 것을 1부터 하나씩 세면 <b>${total}</b>개예요.`;
    line = `<div class="chips" style="gap:5px">${chips || '<span class="muted">0</span>'}</div>`;
  } else if (state.strategy === 'forward') {
    explain = op === '+'
      ? `<b>${a}</b>에서 시작해 <b>${b}</b>만큼 앞으로 점프하면 <b>${total}</b>이에요. (이어 세기)`
      : `<b>${a}</b>에서 시작해 <b>${b}</b>만큼 뒤로 점프하면 <b>${total}</b>이에요.`;
    line = interactiveNumberLineHTML(a, total, op);
  } else if (state.strategy === 'maketen') {
    if (op === '+' && a < 10 && total > 10) {
      const need = 10 - a;
      const rest = b - need;
      explain = `<b>${a}</b>에 <b>${need}</b>를 더해 <b>10</b>을 만들고, 남은 <b>${rest}</b>를 더하면 <b>${total}</b>이에요.`;
      line = numberLineSVG({
        max: 20,
        marks: [{ value: a, label: String(a), color: '#2563eb' }, { value: 10, label: '10', color: '#d97706' }, { value: total, label: String(total), color: '#16a34a' }],
        arcs: [
          { from: a, to: 10, label: `+${need}`, color: '#d97706' },
          { from: 10, to: total, label: `+${rest}`, color: '#16a34a' },
        ],
      });
    } else {
      explain = op === '+' && a >= 10
        ? `10 만들기는 한 자리 수끼리 더할 때 편리해요. ${a} + ${b}는 자릿값을 맞추어 계산해 보세요.`
        : op === '+' ? `이미 10보다 작거나 같아요. 10을 만들 필요 없이 바로 더할 수 있어요.` : `10 만들기는 더하기에서 특히 편리해요.`;
      line = numberLineSVG({
        max: 20,
        marks: [{ value: a, label: String(a), color: '#2563eb' }, { value: total, label: String(total), color: '#d97706' }],
      });
    }
  } else {
    if (op === '-') {
      explain = `<b>${a}</b>에서 <b>${b}</b>만큼 거꾸로 세면 <b>${total}</b>이에요. (거꾸로 세기)`;
    } else {
      explain = `더하기에서는 <b>${total}</b>에서 <b>${b}</b>만큼 거꾸로 가면 <b>${a}</b>가 되는지 확인할 수 있어요.`;
    }
    line = interactiveNumberLineHTML(a, total, op);
  }
  setToolHead('🛣️ 계산 전략 고르기', '🐸를 손가락으로 끌어 목표 자리에 놓아 보세요');
  $('toolBody').innerHTML = `
    <div class="tabs" style="background:#eef3f9">${strategies.map((s) => `<button type="button" class="tab${state.strategy === s.id ? ' active' : ''}" data-strategy="${s.id}">${s.label}</button>`).join('')}</div>
    <div class="guide" style="font-size:14px">${explain}</div>
    ${line}
    <div class="row-flex">
      <button type="button" class="btn primary" data-st="8,+,7">8 + 7</button>
      <button type="button" class="btn green" data-st="9,+,4">9 + 4</button>
      <button type="button" class="btn amber" data-st="13,-,5">13 - 5</button>
      <button type="button" class="btn soft" data-st="15,-,8">15 - 8</button>
    </div>`;
  const body = $('toolBody');
  const moveMarker = (value) => {
    const v = clamp(Math.trunc(value), 0, 20);
    state.nlMarker = v;
    if (v === total) {
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `수직선 ${v}`);
      awardToken('목표 자리에 정확히 놓았어요!');
      announce(`${a}에서 ${v}까지 왔어요. 정답은 ${total}이에요.`);
    } else {
      recordTrial('error', state.promptLevel, `수직선 ${v}`);
      speak(`${v} 자리예요. 목표 ${total}까지 ${Math.abs(total - v)}칸 남았어요.`);
      haptic(35);
    }
    renderTool();
  };
  body.querySelectorAll('.nl-stop').forEach((stop) => {
    stop.onclick = () => moveMarker(Number((stop.dataset.drop || 'nl:0').split(':')[1]));
  });
  bindDrag(body, '[data-nl-marker]', () => ({ value: state.nlMarker ?? a }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('nl:')) moveMarker(Number(drop.split(':')[1]));
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget(`[data-drop="nl:${total}"]`, body); },
    onActivate: () => moveMarker(total),
  });
  body.querySelectorAll('[data-strategy]').forEach((b) => {
    b.onclick = () => { state.strategy = b.dataset.strategy; renderTool(); };
  });
  body.querySelectorAll('[data-st]').forEach((b) => {
    b.onclick = () => {
      const [x, o, y] = b.dataset.st.split(',');
      loadExpression(Number(x), o, Number(y));
    };
  });
}

