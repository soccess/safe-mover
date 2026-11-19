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
  let html = `<div class="frames" data-drop="${frameId}">`;
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
    const kId = typeof it === 'string' ? it : it.kind;
    const kind = SORT_KINDS.find((k) => k.id === kId);
    if (!kind) return '';
    return `<button type="button" class="sort-item" data-sort="${i}" data-sort-item="${i}" data-kind="${kId}" aria-label="${kind.label} 끌어서 바구니에 담기" title="${kind.label}">${kind.emoji}</button>`;
  }).join('');
  body.innerHTML = `
    <div class="sort-baskets">${basketHtml}</div>
    <div class="sort-tray" aria-label="분류할 과일">${tray || '<b style="color:#16a34a">모두 담았어요! 🎉</b>'}</div>
    <div class="row-flex" style="justify-content:flex-end">
      <button type="button" class="btn soft sm" data-sort-reset>🔄 다시 섞기</button>
    </div>`;

  const place = (i) => {
    const item = state.sort.items[i];
    if (!item) return;
    const kId = typeof item === 'string' ? item : item.kind;
    const kind = SORT_KINDS.find((k) => k.id === kId);
    if (!kind) return;
    state.sort.items.splice(i, 1);
    state.sort.counts[kId] = (state.sort.counts[kId] || 0) + 1;
    state.sort.done = state.sort.items.length === 0;
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${kind.label} 분류`);
    if (state.sort.done) {
      awardToken('분류를 모두 마쳤어요. 정말 잘했어요!');
      announce('분류를 모두 마쳤어요. 같은 것끼리 모았어요.');
    } else {
      speak(`${kind.label} 바구니에 담았어요. ${countWord(state.sort.counts[kId])}개`);
    }
    renderTool();
  };

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
    onTap: (p) => {
      const kind = SORT_KINDS.find((k) => k.id === p.kind);
      if (state.settings.errorless) showHintTarget(`[data-drop="basket:${p.kind}"]`, body);
      speak(`${kind.label}을 손가락으로 끌어 ${kind.label} 바구니에 놓아 보세요.`);
    },
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
  const isSmallStage = state.stage <= 3;
  setToolHead('🔢 세기 · 10칸 판', '점을 손가락으로 끌어 칸에 놓으며 하나씩 세어 보세요');
  const totalCells = isSmallStage ? 10 : Math.max(20, Math.ceil(Math.max(n, 1) / 10) * 10);
  const tokenSizes = isSmallStage ? [1] : [1, 10, 100];
  const tray = tokenSizes.map((v) => `
    <div class="drag-token${v === 10 ? ' green' : v === 100 ? ' amber' : ''}" data-count-token="${v}" role="button" tabindex="0" aria-label="${v}개 끌기">
      <span class="big">${v === 1 ? '●' : v === 10 ? '▥' : '▦'}</span><span class="tiny">${v}개</span>
    </div>`).join('');
  body.innerHTML = `
    <div class="drag-tray">
      <span class="tray-label">끌어서 놓기</span>
      ${tray}
      <div class="drop-plate" data-drop="count-minus" style="min-height:52px;padding:7px 12px;border-color:#fda4af;background:#fff1f2;margin-left:auto">
        <div class="plate-title" style="margin:0"><span>➖ 하나 빼기</span></div>
      </div>
    </div>
    <div data-drop="count-add" aria-label="세기 판">${tenFrameHTML(totalCells, n, 0, state.countPlay.idx, { frameId: 'count', dragFilled: true })}</div>
    <div class="row-flex" style="align-items:center;justify-content:space-between">
      <div class="num-card"><span class="v">${n}</span><span class="c">${countWord(n)}</span></div>
      <div class="row-flex" style="margin-top:0">
        <button type="button" class="btn primary" data-count="p1">＋1</button>
        ${isSmallStage ? '' : '<button type="button" class="btn primary" data-count="p10">＋10</button>'}
        <button type="button" class="btn soft" data-count="m1">－1</button>
        <button type="button" class="btn soft" data-count="reset">0으로</button>
        <button type="button" class="btn violet" data-count="play">▶ 세기</button>
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
      if (b.dataset.cellFill) return;
      if (state.settings.errorless) showHintTarget('[data-count-token="1"]', body);
      speak('아래 파란 점(●)을 손가락으로 끌어 10칸 판에 놓아 보세요.');
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
    onTap: () => {
      if (state.settings.errorless) showHintTarget('[data-drop="count-add"]', body);
      speak('점을 손가락으로 끌어 10칸 판에 놓아 보세요.');
    },
    onActivate: (p) => setCount(n + p.add, countWord(n + p.add)),
  });
  bindDrag(body, '[data-cell-fill]', () => ({ remove: 1 }), (p, zone) => {
    if (zone && (zone.dataset.drop === 'count-minus')) setCount(n - 1, `${countWord(n - 1)}. 하나를 덜어냈어요`);
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="count-minus"]', body); },
    onTap: () => {
      if (state.settings.errorless) showHintTarget('[data-drop="count-minus"]', body);
      speak('채워진 점을 빨간 빼기 상자로 끌어놓으면 하나 뺄 수 있어요.');
    },
    onActivate: () => setCount(n - 1, countWord(n - 1)),
  });
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
  const arcHtml = arcs.map((a, idx) => {
    const x1 = x(a.from), x2 = x(a.to), mx = (x1 + x2) / 2;
    const color = a.color || '#7c3aed';
    const up = a.up !== false;
    const path = `M ${x1} ${y - 6} Q ${mx} ${up ? 16 : 158} ${x2} ${y - 6}`;
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="3.8" stroke-linecap="round" class="nl-arc" style="animation-delay:${idx * 140}ms" marker-end="url(#nlArrow)"/>
      <rect x="${mx - 20}" y="${up ? 3 : 158}" width="40" height="20" rx="10" fill="#fff" stroke="${color}" stroke-width="1.8"/>
      <text x="${mx}" y="${up ? 17 : 172}" text-anchor="middle" font-size="13" font-weight="900" fill="${color}">${a.label || ''}</text>`;
  }).join('');
  const markHtml = marks.map((m, idx) => {
    const xx = x(m.value);
    const color = m.color || '#2563eb';
    return `<g class="nl-mark" style="animation-delay:${idx * 80}ms">
      <circle cx="${xx}" cy="${y}" r="12" fill="${color}" opacity="0.22" class="nl-mark-ring"/>
      <circle cx="${xx}" cy="${y}" r="8" fill="${color}" stroke="#fff" stroke-width="2.4"/>
      <text x="${xx}" y="${y - 16}" text-anchor="middle" font-size="14" font-weight="900" fill="${color}">${m.label ?? m.value}</text>
    </g>`;
  }).join('');
  return `<div class="numline-wrap"><svg class="numline" viewBox="0 0 ${W} ${H}" role="img" aria-label="0부터 ${max}까지의 수직선">
    <defs>
      <linearGradient id="nlTrack" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#60a5fa"/><stop offset="50%" stop-color="#334155"/><stop offset="100%" stop-color="#16a34a"/></linearGradient>
      <marker id="nlArrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7c3aed"/></marker>
    </defs>
    <line x1="${x(0)}" y1="${y}" x2="${x(max)}" y2="${y}" stroke="url(#nlTrack)" stroke-width="5" stroke-linecap="round"/>
    <text x="${x(0)}" y="${y + 52}" text-anchor="start" font-size="12" font-weight="900" fill="#2563eb">◀ 작은 수</text>
    <text x="${x(max)}" y="${y + 52}" text-anchor="end" font-size="12" font-weight="900" fill="#16a34a">큰 수 ▶</text>
    ${ticks}${arcHtml}${markHtml}</svg></div>`;
}

function interactiveNumberLineHTML(start, target, op) {
  const marker = clamp(Number(state.nlMarker ?? start), 0, 20);
  const stops = Array.from({ length: 21 }, (_, i) => `
    <button type="button" class="nl-stop${i % 5 === 0 ? ' major' : ''}" data-drop="nl:${i}" aria-label="${i} 자리">
      <span class="nl-num">${i % 2 === 0 ? i : ''}</span>
    </button>`).join('');
  const pos = (v) => `${((clamp(v, 0, 20) + 0.5) / 21) * 100}%`;
  const diff = marker - start;
  const stepJump = state.nlStep || 1;
  return `<div class="nl-interactive" aria-label="0부터 20까지 끌 수 있는 수직선">
    <div class="nl-track" data-nl-track>
      <div class="nl-stops">${stops}</div>
      <div class="nl-start-flag" style="left:${pos(start)}" title="출발">🚩</div>
      <div class="nl-marker" data-nl-marker style="left:${pos(marker)}" role="button" tabindex="0" aria-label="현재 ${marker}. 좌우로 끌어서 옮기세요">🐸</div>
    </div>
    <div class="nl-step-actions">
      <button type="button" class="btn soft" data-nl-step="-${stepJump}">◀ -${stepJump}</button>
      <span class="nl-pos-badge" data-nl-badge>현재 ${marker} (${diff >= 0 ? `+${diff}` : diff}칸)</span>
      <button type="button" class="btn soft" data-nl-step="${stepJump}">+${stepJump} ▶</button>
    </div>
  </div>`;
}

/* ---------- 3단계: 비교 ---------- */
function renderCompare() {
  const a = state.compare.a;
  const b = state.compare.b;
  const body = $('toolBody');
  const prob = state.activeProblem && state.activeProblem.stageId === 5 ? state.activeProblem : null;
  const signMode = Boolean(prob && prob.mode === 'sign');
  const sign = signMode ? (state.compare.sign || '?') : (a > b ? '>' : a < b ? '<' : '=');
  const theme = currentTheme();
  const maxLen = Math.min(Math.max(a, b, 1), 15);
  const plate = (which, value, cls) => `
    <div class="drop-plate ${cls}" data-drop="cmp:${which}" aria-label="${which === 'a' ? '첫 번째' : '두 번째'} 수 놓는 곳">
      <div class="plate-title"><span>${which === 'a' ? '🔵 왼쪽' : '🟢 오른쪽'}</span><span class="plate-count">${value}</span></div>
      <div class="plate-items">${Array.from({ length: value }, (_, i) => `<span class="counter-chip${which === 'b' ? ' green' : ''}" data-cmp-move="${which}" role="button" tabindex="0" aria-label="${i + 1}번째 점">●</span>`).join('') || '<span class="muted">점을 끌어다 놓아요</span>'}</div>
    </div>`;
  let pairCols = '';
  for (let i = 0; i < maxLen; i++) {
    const hasA = i < a;
    const hasB = i < b;
    const matched = hasA && hasB;
    pairCols += `<div class="pair-col ${matched ? 'matched' : 'extra'}" style="--pair-order:${i}">
      <span class="pair-emoji">${hasA ? theme.a : '·'}</span>
      <span class="pair-state">${matched ? '짝' : '남음'}</span>
      <span class="pair-emoji">${hasB ? theme.b : '·'}</span>
    </div>`;
  }
  setToolHead('⚖️ 어느 쪽이 더 많을까?', '점을 끌어 놓거나 알맞은 기호를 넣어 비교해요');
  const signTrayHTML = signMode ? `
    <div class="drag-tray" style="justify-content:center">
      <span class="tray-label">기호 끌어서 넣기</span>
      ${['>', '=', '<'].map((s) => `<div class="drag-token violet${state.compare.sign === s ? ' green' : ''}" data-cmp-sign="${s}" role="button" tabindex="0"><span class="big">${s}</span></div>`).join('')}
    </div>` : `
    <div class="drag-tray"><span class="tray-label">점을 끌어서 맞추기</span>
      <div class="drag-token" data-cmp-token="a" role="button" tabindex="0"><span class="big">●</span><span class="tiny">왼쪽 +1</span></div>
      <div class="drag-token green" data-cmp-token="b" role="button" tabindex="0"><span class="big">●</span><span class="tiny">오른쪽 +1</span></div>
      <div class="drop-plate" data-drop="cmp-minus" style="min-height:52px;padding:7px 12px;border-color:#fda4af;background:#fff1f2;margin-left:auto"><div class="plate-title" style="margin:0"><span>➖ 하나 빼기</span></div></div>
    </div>`;
  body.innerHTML = `
    <div class="two-plates">${plate('a', a, 'first')}${plate('b', b, 'second')}</div>
    ${signTrayHTML}
    <div class="compare-cards">
      <div class="num-card"><span class="v">${a}</span><span class="c">${countWord(a)}</span></div>
      <div class="sign-badge${signMode ? ' sign-drop' : ''}" ${signMode ? 'data-drop="cmp-sign"' : ''}>${sign}</div>
      <div class="num-card green"><span class="v">${b}</span><span class="c">${countWord(b)}</span></div>
    </div>
    <div class="pair-grid">${pairCols}</div>`;

  const setCompare = (which, value, msg) => {
    state.compare[which] = clamp(Math.trunc(value), 0, 20);
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${which === 'a' ? '첫째' : '둘째'} ${state.compare[which]}개`);
    renderTool();
    if (msg) speak(msg);
  };
  const pickSign = (s) => {
    state.compare.sign = s;
    const ok = s === state.compare.expectedSign;
    recordTrial(ok ? 'independent' : 'error', state.promptLevel, `비교 기호 ${s}`);
    if (!ok) {
      haptic(35);
      speak('더 많은 쪽으로 입이 벌어져요. 다시 골라 볼까요?');
    }
    renderTool();
  };
  bindDrag(body, '[data-cmp-sign]', (el) => ({ sign: el.dataset.cmpSign }), (p, zone) => {
    if (zone && zone.dataset.drop === 'cmp-sign') pickSign(p.sign);
  }, {
    onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="cmp-sign"]', body); },
    onTap: (p) => pickSign(p.sign),
    onActivate: (p) => pickSign(p.sign),
  });
  bindDrag(body, '[data-cmp-token]', (el) => ({ add: 1, which: el.dataset.cmpToken }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    if (drop.startsWith('cmp:')) {
      const which = drop.split(':')[1];
      setCompare(which, state.compare[which] + 1, `${countWord(state.compare[which] + 1)}`);
    }
  }, {
    onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="cmp:${p.which}"]`, body); },
    onTap: (p) => {
      if (state.settings.errorless) showHintTarget(`[data-drop="cmp:${p.which}"]`, body);
      speak('점을 손가락으로 끌어 위쪽 접시에 놓아 보세요.');
    },
    onActivate: (p) => setCompare(p.which, state.compare[p.which] + 1, countWord(state.compare[p.which] + 1)),
  });
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
  const gather = state.composeGather;
  const isGather = Boolean(gather && !calc.op || (gather && calc.op === '+'));
  const isSub = !isGather && calc.op === '-';
  const body = $('toolBody');
  let a = isGather ? gather.a : (calc.first ?? (isSub ? 8 : 3));
  let b = isGather ? gather.b : (calc.second ?? (isSub ? 3 : 5));
  if (!Number.isFinite(a) || a < 0) a = isSub ? 8 : 3;
  if (!Number.isFinite(b) || b < 0) b = isSub ? 3 : 5;
  a = clamp(a, 0, 10);
  b = clamp(b, 0, 10);
  if (isSub && b > a) {
    setToolHead('➖ 가르기', '빼는 수가 처음 수보다 커요');
    body.innerHTML = `<div class="row-flex"><button type="button" class="btn primary" data-compose-ex="8,3">8 - 3</button></div>`;
    body.querySelectorAll('[data-compose-ex]').forEach((btn) => {
      btn.onclick = () => { const [x, y] = btn.dataset.composeEx.split(',').map(Number); loadExpression(x, '-', y); };
    });
    return;
  }
  if (isSub) b = Math.min(b, a);
  if (isSub && state.composeBaseA !== a) { state.composeBaseA = a; state.composeRemoved = 0; }
  const removed = isSub ? clamp(state.composeRemoved, 0, b) : 0;
  const moved = isGather ? clamp(gather.moved, 0, b) : 0;
  const leftBlue = isSub ? a - removed : a;
  const leftGreen = isGather ? moved : 0;
  const rightCount = isGather ? b - moved : b;
  const total = isSub ? a : a + b;
  setToolHead(isSub ? '➖ 가르기' : '➕ 모으기', '점을 손가락으로 끌어 옮겨요');
  const leftFrame = tenFrameHTML(10, leftBlue, leftGreen, -1, { frameId: 'composeA', dragFilled: true });
  const rightFrame = isSub
    ? `<div class="drop-plate" data-drop="compose-minus" style="border-color:#fda4af;background:#fff1f2;min-height:176px">
        <div class="plate-title"><span>➖ 덜어낸 곳 · ${removed}/${b}</span><span class="plate-count">${removed}</span></div>
        <div class="plate-items">${Array.from({ length: removed }, (_, i) => `<span class="counter-chip rose" data-compose-restore="1" role="button" tabindex="0" aria-label="${i + 1}번째 뺀 점">●</span>`).join('') || '<span class="muted">왼쪽 점을 여기로 끌어와요</span>'}</div>
      </div>`
    : tenFrameHTML(10, rightCount, 0, -1, { frameId: 'composeB', dragFilled: true, forceColor: 'green' });
  body.innerHTML = `
    <div class="two-plates">
      <div><div class="plate-head-mini"><b>${isSub ? `남은 수 ${leftBlue}` : `모은 칸 ${leftBlue + leftGreen}`}</b></div>${leftFrame}</div>
      <div><div class="plate-head-mini"><b>${isSub ? `덜어낼 수 ${b}` : `더할 수 ${rightCount}`}</b></div>${rightFrame}</div>
    </div>
    <div class="bond">
      <div class="bond-total">${isGather ? (moved === b ? total : `${leftBlue + leftGreen}`) : total}</div>
      <div class="bond-lines"></div>
      <div class="bond-parts"><div class="bond-part">${leftBlue}</div><div class="bond-part second">${isSub ? removed : (isGather ? moved : rightCount)}</div></div>
    </div>`;

  const transfer = (from, to) => {
    if (from === to) return;
    if (isGather) {
      if (from === 'composeB' && to === 'composeA' && gather.moved < gather.b) {
        gather.moved += 1;
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '모으기');
        renderTool();
        if (gather.moved < gather.b) speak(`${countWord(a + gather.moved)}`);
      }
      return;
    }
    if (isSub) {
      if (from === 'composeA' && to === 'compose-minus' && removed < b) {
        state.composeRemoved = removed + 1;
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '하나 덜어내기');
        renderTool();
        if (state.composeRemoved < b) speak(`${countWord(a - state.composeRemoved)}개 남음`);
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
  };

  bindDrag(body, '[data-cell-fill]', (el) => ({ frame: el.dataset.frame, value: Number(el.dataset.value) }), (p, zone) => {
    if (!zone) return;
    const drop = zone.dataset.drop || '';
    const target = drop.split(':')[0];
    if (isSub) {
      if (p.frame === 'composeA' && target === 'compose-minus') transfer('composeA', 'compose-minus');
    } else {
      transfer(p.frame, target);
    }
  }, {
    onStart: (p) => {
      if (!state.settings.errorless) return;
      if (isSub) showHintTarget('[data-drop="compose-minus"]', body);
      else showHintTarget(`[data-drop="${p.frame === 'composeA' && !isGather ? 'composeB' : 'composeA'}"]`, body);
    },
    onTap: (p) => {
      if (isSub) {
        if (state.settings.errorless) showHintTarget('[data-drop="compose-minus"]', body);
        speak('점을 오른쪽 빨간 칸으로 끌어와 보세요.');
      } else {
        if (state.settings.errorless) showHintTarget('[data-drop="composeA"]', body);
        speak('초록 점을 왼쪽 칸으로 끌어 모아 보세요.');
      }
    },
    onActivate: (p) => {
      if (isSub) transfer('composeA', 'compose-minus');
      else transfer(p.frame, isGather ? 'composeA' : (p.frame === 'composeA' ? 'composeB' : 'composeA'));
    },
  });
  bindDrag(body, '[data-compose-restore]', () => ({ restore: 1 }), (p, zone) => {
    if (!zone) return;
    const target = (zone.dataset.drop || '').split(':')[0];
    if (target === 'composeA' && state.composeRemoved > 0) {
      state.composeRemoved = Math.max(0, state.composeRemoved - 1);
      renderTool();
    }
  });
}

/* ---------- 5단계: 10 만들기 ---------- */
function renderMakeTen() {
  const calc = activeCalc();
  if (calc.op && calc.op !== '+') {
    setToolHead('🔟 10 만들기', '10 만들기는 더하기 활동이에요');
    $('toolBody').innerHTML = `<div class="row-flex"><button type="button" class="btn green" data-mt="7,5">7 + 5</button></div>`;
    $('toolBody').querySelectorAll('[data-mt]').forEach((btn) => {
      btn.onclick = () => { const [x, y] = btn.dataset.mt.split(',').map(Number); loadExpression(x, '+', y); };
    });
    return;
  }
  const body = $('toolBody');
  let a = calc.op === '+' && calc.first !== null ? calc.first : 7;
  let b = calc.op === '+' && calc.second !== null ? calc.second : 5;
  a = clamp(Math.trunc(a), 0, 10);
  b = clamp(Math.trunc(b), 0, 20);
  const need = Math.max(0, 10 - a);
  const moved = Math.min(b, need);
  const rest = Math.max(0, b - moved);
  const total = a + b;
  const equation = a === 10
    ? `<b>🔟 10 + ${b} = ${total}</b>`
    : `<b>${a} + ${b} → (${a} + ${moved}) + ${rest} = 10 + ${rest}</b>`;
  setToolHead('🔟 10을 먼저 만들기', '오른쪽 초록 점을 왼쪽 빈칸으로 끌어요');
  body.innerHTML = `
    <div class="two-plates">
      <div><div class="plate-head-mini"><b>10칸 판 · ${a}개</b></div>${tenFrameHTML(10, a, 0, -1, { frameId: 'mtLeft', dragFilled: true })}</div>
      <div><div class="plate-head-mini"><b>남은 수 · ${b}개</b></div>${tenFrameHTML(Math.max(10, Math.ceil(Math.max(b, 1) / 10) * 10), b, 0, -1, { frameId: 'mtRight', dragFilled: true, forceColor: 'green' })}</div>
    </div>
    <div class="guide" style="text-align:center;font-size:17px">${equation}</div>`;

  bindDrag(body, '[data-cell-fill]', (el) => ({ frame: el.dataset.frame, value: Number(el.dataset.value) }), (p, zone) => {
    if (!zone) return;
    const target = (zone.dataset.drop || '').split(':')[0];
    if (p.frame === 'mtRight' && target === 'mtLeft' && b > 0 && a < 10) {
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '10 만들기');
      loadExpression(a + 1, '+', b - 1, { quiet: true });
      if (a + 1 < 10) speak(`${a + 1}개`);
    }
  }, {
    onStart: (p) => { if (state.settings.errorless && p.frame === 'mtRight') showHintTarget('[data-drop="mtLeft"]', body); },
    onTap: (p) => {
      if (p.frame === 'mtRight') {
        if (state.settings.errorless) showHintTarget('[data-drop="mtLeft"]', body);
        speak('오른쪽 초록 점을 왼쪽 빈칸으로 끌어와 10을 만들어요.');
      }
    },
    onActivate: (p) => {
      if (p.frame === 'mtRight' && b > 0 && a < 10) {
        recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, '10 만들기');
        loadExpression(a + 1, '+', b - 1, { quiet: true });
      }
    },
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
  if (state.nlBase !== a || state.nlMarker == null) { state.nlBase = a; state.nlMarker = a; }
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
  setToolHead('🛣️ 수직선 점프', '🐸를 손가락으로 끌어 목표 자리에 놓아 보세요');
  $('toolBody').innerHTML = `${line}`;
  const body = $('toolBody');
  const moveMarker = (value) => {
    const v = clamp(Math.trunc(value), 0, 20);
    state.nlMarker = v;
    if (v === total) {
      recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `수직선 ${v}`);
    } else {
      speak(`${countWord(v)}`);
    }
    renderTool();
  };
  body.querySelectorAll('.nl-stop').forEach((stop) => {
    stop.onclick = () => {
      const idx = Number((stop.dataset.drop || 'nl:0').split(':')[1]);
      if (state.settings.errorless) showHintTarget(`[data-drop="nl:${total}"]`, body);
      speak(`${countWord(idx)}`);
    };
  });
  body.querySelectorAll('[data-nl-step]').forEach((btn) => {
    btn.onclick = () => moveMarker((state.nlMarker ?? a) + Number(btn.dataset.nlStep));
  });
  const nlMarkerEl = body.querySelector('[data-nl-marker]');
  const nlTrackEl = body.querySelector('[data-nl-track]');
  const nlBadgeEl = body.querySelector('[data-nl-badge]');
  if (nlMarkerEl && nlTrackEl) {
    let curVal = clamp(Number(state.nlMarker ?? a), 0, 20);
    const valueFromClientX = (clientX) => {
      const r = nlTrackEl.getBoundingClientRect();
      if (!r.width) return curVal;
      return clamp(Math.floor(((clientX - r.left) / r.width) * 21), 0, 20);
    };
    const previewMarker = (val) => {
      curVal = val;
      const diff = val - a;
      nlMarkerEl.style.left = `${((val + 0.5) / 21) * 100}%`;
      nlMarkerEl.setAttribute('aria-label', `현재 ${val}. 좌우로 끌어서 옮기세요`);
      if (nlBadgeEl) nlBadgeEl.textContent = `현재 ${val} (${diff >= 0 ? `+${diff}` : diff}칸)`;
    };
    nlMarkerEl.onpointerdown = (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      noteInteraction();
      const pointerId = ev.pointerId;
      const startX = ev.clientX;
      const startY = ev.clientY;
      let moved = false;
      try { nlMarkerEl.setPointerCapture(pointerId); } catch (e) { /* 무시 */ }
      const onMove = (e) => {
        if (e.pointerId !== pointerId) return;
        if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < 6) return;
        moved = true;
        previewMarker(valueFromClientX(e.clientX));
      };
      const onUp = (e) => {
        if (e.pointerId !== pointerId) return;
        nlMarkerEl.removeEventListener('pointermove', onMove);
        nlMarkerEl.removeEventListener('pointerup', onUp);
        nlMarkerEl.removeEventListener('pointercancel', onUp);
        try { nlMarkerEl.releasePointerCapture(pointerId); } catch (err) { /* 무시 */ }
        if (moved) {
          moveMarker(valueFromClientX(e.clientX));
        } else {
          if (state.settings.errorless) showHintTarget(`[data-drop="nl:${total}"]`, body);
          announce(`개구리를 손가락으로 좌우로 끌어 ${total} 자리에 놓아 보세요.`);
        }
      };
      nlMarkerEl.addEventListener('pointermove', onMove);
      nlMarkerEl.addEventListener('pointerup', onUp);
      nlMarkerEl.addEventListener('pointercancel', onUp);
    };
    nlMarkerEl.onkeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); moveMarker(curVal + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); moveMarker(curVal - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moveMarker(total); }
    };
  }
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

