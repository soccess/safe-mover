"use strict";

/* ============================================================
   읽걷이의 맞춤법 모험 게임 컨트롤러
   - 12단계별 고유 단어 셔플 배그 + 스테이지별 다채로운 기믹
   - 단어 복습하기 모달 (현재 단계 / 헷갈린 단어 / 1~12단계 도감 / 미니 퀴즈)
   - 화려한 파티클 · 콤보 · 파워업(거품 보호막, 단어 자석, 네온 부스트, 구름 점프)
   ============================================================ */
(() => {
  const STAGES = window.SafeMoverStages;
  const WORDS = window.SafeMoverWords;
  const AUDIO = window.SafeMoverAudio;
  const RENDERER = window.SafeMoverRenderer;

  const cv = document.getElementById("cv");
  const ctx = cv.getContext("2d");
  const banner = document.getElementById("banner");
  const floatMsg = document.getElementById("floatMsg");
  const chipsEl = document.getElementById("chips");
  const gimmickBadge = document.getElementById("gimmickBadge");
  const buffBadges = document.getElementById("buffBadges");
  const reviewModal = document.getElementById("reviewModal");
  const reviewCard = document.getElementById("reviewCard");

  let W = 0, H = 0;
  let lastTs = 0;
  let stageTransition = null;
  let windT = 5;
  let currentT = 5.5;
  let padT = 2.6;
  let mirrorEventT = 11.0;
  let gravityEventT = 12.0;
  let bossLaserT = 5.5;
  let midIdx = 0;
  let spawnT = 1.0;
  let stepT = 0;
  let stepN = 0;
  let wordBag = [];
  let swipeStart = null;

  const state = {
    stageIdx: 0,
    stageTime: 0,
    roadScroll: 0,
    trackPhase: 0,
    hillPhase: 0,
    camTilt: 0,
    flipBlend: 0,
    lane: 0,
    lanePos: 0,
    laneFlash: 0,
    stumble: 0,
    catchAnim: 0,
    jumpTimer: 0,
    shield: 0,
    magnetTimer: 0,
    boostTimer: 0,
    railTimer: 0,
    feverTimer: 0,
    gravityTimer: 0,
    mirrorTimer: 0,
    mirrorWarn: 0,
    warpAnim: 0,
    warpInvuln: 0,
    windWarn: 0,
    nextWindDir: 1,
    bossActive: false,
    bossHp: 5,
    bossMaxHp: 5,
    bossHitFlash: 0,
    bossLaser: null,
    shake: 0,
    entities: [],
    pads: [],
    beams: [],
    rings: [],
    parts: [],
    popups: [],
    confetti: [],
    animT: 0,
    finished: false,
    paused: false,
    reviewOpen: false,
    stageClearWait: false,
    practiceMode: false,
    easyMode: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    collected: 0,
    totalCollected: 0,
    dodged: 0,
    totalDodged: 0,
    hit: 0,
    totalHit: 0,
    learnedWords: [],
    missedWords: []
  };

  const reviewState = {
    tab: "current", // current | missed | all | quiz
    browseStage: 0,
    quizPool: [],
    quizIdx: 0,
    quizChoices: [],
    quizAnswered: false,
    quizStreak: 0
  };

  function resize() {
    const r = document.getElementById("cvWrap").getBoundingClientRect();
    W = cv.width = Math.max(320, r.width);
    H = cv.height = Math.max(320, r.height);
  }
  window.addEventListener("resize", resize);

  function showFloat(t, color) {
    floatMsg.textContent = t;
    floatMsg.style.color = color || "#FFD600";
    floatMsg.style.opacity = 1;
    clearTimeout(showFloat._t);
    showFloat._t = setTimeout(() => { floatMsg.style.opacity = 0; }, 1150);
  }

  function setBanner(t, mode) {
    banner.textContent = '🗣️ "' + t + '"';
    banner.classList.remove("warn", "good");
    if (mode === "warn") banner.classList.add("warn");
    else if (mode === "good") banner.classList.add("good");
  }

  function addPopup(x, y, text, color, size) {
    state.popups.push({ x, y, text, c: color || "#FDE047", life: 1.0, size: size || 20 });
  }

  function refillWordBag(stageIdx) {
    const pool = [...WORDS.getForStage(stageIdx)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    wordBag = pool;
  }

  function nextWordPair() {
    if (!wordBag.length) refillWordBag(state.stageIdx);
    return wordBag.pop();
  }

  function buildChips() {
    chipsEl.innerHTML = "";
    STAGES.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === state.stageIdx ? " active" : "") + (i < state.stageIdx ? " done" : "");
      b.textContent = (i + 1) + "단계 " + s.icon;
      b.onclick = () => { AUDIO.tap(); startStage(i); };
      chipsEl.appendChild(b);
    });
  }

  function updateLabels() {
    const S = STAGES[state.stageIdx];
    document.getElementById("totalLabel").textContent = (state.stageIdx + 1) + " / " + STAGES.length;
    document.getElementById("stageLabel").textContent = (state.stageIdx + 1) + "단계 " + S.icon;
    if (gimmickBadge) gimmickBadge.textContent = S.gimmickLabel || "";
  }

  function updateBuffBadges() {
    if (!buffBadges) return;
    let html = "";
    if (state.feverTimer > 0) html += '<span class="buff-pill buff-fever">🔥 피버 ' + Math.ceil(state.feverTimer) + 's</span>';
    else if (state.combo >= 2) html += '<span class="buff-pill buff-combo">🔥 ' + state.combo + '콤보</span>';
    if (state.shield > 0) html += '<span class="buff-pill buff-shield">🫧 보호막</span>';
    if (state.magnetTimer > 0) html += '<span class="buff-pill buff-magnet">🧲 자석 ' + Math.ceil(state.magnetTimer) + 's</span>';
    if (state.boostTimer > 0) html += '<span class="buff-pill buff-boost">⚡ 부스트 ' + Math.ceil(state.boostTimer) + 's</span>';
    if (state.railTimer > 0) html += '<span class="buff-pill buff-rail">🛷 레일 ' + Math.ceil(state.railTimer) + 's</span>';
    if (state.gravityTimer > 0) html += '<span class="buff-pill buff-gravity">🙃 중력반전 ' + Math.ceil(state.gravityTimer) + 's</span>';
    if (state.mirrorTimer > 0) html += '<span class="buff-pill buff-mirror">🎭 거울 ' + Math.ceil(state.mirrorTimer) + 's</span>';
    buffBadges.innerHTML = html;
  }

  function syncPadButtons() {
    const padL = document.getElementById("padL");
    const padR = document.getElementById("padR");
    if (!padL || !padR) return;
    const mir = state.mirrorTimer > 0;
    padL.classList.toggle("mirrored", mir);
    padR.classList.toggle("mirrored", mir);
    padL.textContent = mir ? "🔄 오른쪽 ▶" : "◀ 왼쪽";
    padR.textContent = mir ? "◀ 왼쪽 🔄" : "오른쪽 ▶";
  }

  function spawnParts(x, y, n, colors, withHangul) {
    const glyphs = ["ㄱ", "ㄴ", "ㅎ", "ㅏ", "★", "⭕"];
    for (let i = 0; i < n; i++) {
      const isText = withHangul && i % 4 === 0;
      state.parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 290,
        vy: -90 - Math.random() * 230,
        life: 1,
        c: colors[i % colors.length],
        s: 6 + Math.random() * 7,
        text: isText ? glyphs[i % glyphs.length] : null
      });
    }
  }

  function burstConfetti(n) {
    const cols = ["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB", "#FFAB40"];
    for (let i = 0; i < n; i++) {
      state.confetti.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5 - 40,
        vx: (Math.random() - 0.5) * 220,
        vy: 60 + Math.random() * 220,
        a: Math.random() * 6.28,
        va: (Math.random() - 0.5) * 8,
        s: 10 + Math.random() * 10,
        c: cols[i % cols.length]
      });
    }
  }

  function recordLearned(pair) {
    if (!pair || !pair.correct) return;
    if (!state.learnedWords.some((p) => p.correct === pair.correct)) {
      state.learnedWords.push(pair);
    }
  }

  function recordMissed(pair) {
    if (!pair || !pair.correct) return;
    if (!state.missedWords.some((p) => p.correct === pair.correct)) {
      state.missedWords.push(pair);
    }
  }

  function syncModeButtons() {
    const pBtn = document.getElementById("btnPracticeMode");
    const vBtn = document.getElementById("btnVoice");
    const sBtn = document.getElementById("btnSound");
    if (pBtn) {
      pBtn.textContent = state.practiceMode ? "🐢 천천히 ON" : "🐢 천천히 OFF";
      pBtn.classList.toggle("on", state.practiceMode);
    }
    if (vBtn) {
      const on = AUDIO.isVoiceOn();
      vBtn.textContent = on ? "🗣️ 음성 ON" : "🔇 음성 OFF";
      vBtn.classList.toggle("off", !on);
    }
    if (sBtn) {
      const on = AUDIO.isOn();
      sBtn.textContent = on ? "🔔 효과음 ON" : "🔕 효과음 OFF";
      sBtn.classList.toggle("off", !on);
    }
  }

  function applySpedPrefsFromBridge(prefs) {
    if (!prefs) return;
    state.practiceMode = Boolean(prefs.slowPace);
    state.easyMode = Boolean(prefs.easyMode);
    AUDIO.setSlow(state.practiceMode);
    syncModeButtons();
  }

  function startStage(i, announce) {
    clearTimeout(stageTransition);
    stageTransition = null;
    state.stageIdx = i;
    state.stageTime = 0;
    state.trackPhase = 0;
    state.hillPhase = 0;
    state.camTilt = 0;
    state.flipBlend = 0;
    state.entities = [];
    state.pads = [];
    state.beams = [];
    state.rings = [];
    state.popups = [];
    state.lane = 0;
    state.lanePos = 0;
    state.stumble = 0;
    state.catchAnim = 0;
    state.jumpTimer = 0;
    state.shield = 0;
    state.magnetTimer = 0;
    state.boostTimer = 0;
    state.railTimer = 0;
    state.feverTimer = 0;
    state.gravityTimer = 0;
    state.mirrorTimer = 0;
    state.mirrorWarn = 0;
    state.warpAnim = 0;
    state.warpInvuln = 0;
    state.windWarn = 0;
    state.bossActive = false;
    state.bossHp = 5;
    state.bossMaxHp = 5;
    state.bossHitFlash = 0;
    state.bossLaser = null;
    state.shake = 0;
    state.combo = 0;
    state.finished = false;
    state.paused = false;
    state.stageClearWait = false;
    state.collected = 0;
    state.dodged = 0;
    state.hit = 0;
    spawnT = 0.85;
    windT = 4.2;
    currentT = 4.8;
    padT = 2.0;
    mirrorEventT = 11.5;
    gravityEventT = 12.5;
    bossLaserT = 5.0;
    midIdx = 0;
    refillWordBag(i);

    document.getElementById("overlay").style.display = "none";
    buildChips();
    syncPadButtons();
    const s = STAGES[i];
    const startMsg = state.easyMode
      ? (i + 1) + "단계! 바른 말을 잡아요."
      : (i + 1) + "단계 " + s.icon + " " + s.name + "! " + s.msg;
    setBanner(startMsg, "");
    if (announce !== false) AUDIO.speak(startMsg);
    updateLabels();
    updateBuffBadges();
  }

  function restart() {
    AUDIO.tap();
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.totalCollected = 0;
    state.totalDodged = 0;
    state.totalHit = 0;
    state.learnedWords = [];
    state.missedWords = [];
    state.confetti = [];
    startStage(0);
  }

  function stepLane(dir) {
    if (state.finished || state.paused || state.reviewOpen || state.stageClearWait) return;
    const next = state.lane + dir;
    if (next >= -1 && next <= 1) {
      state.lane = next;
      state.laneFlash = 0.24;
      AUDIO.lane();
    }
  }

  function goLeft() {
    stepLane(state.mirrorTimer > 0 ? 1 : -1);
  }

  function goRight() {
    stepLane(state.mirrorTimer > 0 ? -1 : 1);
  }

  function getPlayerAnchor() {
    const S = STAGES[state.stageIdx] || STAGES[0];
    if (RENDERER && RENDERER.project) {
      const pt = RENDERER.project(W, H, S, state, 0.85, state.lanePos);
      const flipped = (state.flipBlend || 0) > 0.5;
      return { x: pt.x, y: pt.y + (flipped ? 70 : -70) };
    }
    const nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const hw = topW + (botW - topW) * 0.86;
    return { x: W * 0.5 + state.lanePos * (hw * 0.62), y: H * 0.85 - 70 };
  }

  function handleCanvasTap(clientX, clientY) {
    if (state.finished || state.reviewOpen) return;
    const r = cv.getBoundingClientRect();
    const tx = (clientX - r.left) * (W / r.width);
    const ty = (clientY - r.top) * (H / r.height);

    // 1. 바른 맞춤법 단어 또는 파워업을 누르면 해당 레인으로 이동
    let bestWord = null;
    let bestDist = Infinity;
    for (const o of state.entities) {
      if ((o.kind !== "correct" && o.kind !== "shield" && o.kind !== "magnet") || o.collected || o.screenX == null) continue;
      const d = Math.hypot(tx - o.screenX, ty - o.screenY);
      if (d <= o.screenR + 18 && d < bestDist) {
        bestDist = d;
        bestWord = o;
      }
    }

    if (bestWord) {
      if (state.lane !== bestWord.lane) {
        state.lane = bestWord.lane;
        state.laneFlash = 0.24;
        AUDIO.lane();
      } else {
        AUDIO.tap();
      }
      if (bestWord.kind === "correct") {
        AUDIO.speak(bestWord.word);
        showFloat("➡️ '" + bestWord.word + "' 잡으러 이동!", "#4ADE80");
      } else {
        showFloat(bestWord.kind === "shield" ? "🫧 보호막 먹으러 이동!" : "🧲 자석 먹으러 이동!", "#38BDF8");
      }
      return;
    }

    // 2. 틀린 단어 적 터치 안내
    for (const o of state.entities) {
      if (o.kind !== "enemy" || o.hit || o.screenX == null) continue;
      const d = Math.hypot(tx - o.screenX, ty - o.screenY);
      if (d <= o.screenR + 10) {
        if (state.practiceMode) {
          AUDIO.tap();
          showFloat("💡 '" + o.pair.correct + "' 단어를 찾아요!", "#FDE047");
          setBanner("천천히 확인해요: '" + o.word + "' 대신 '" + o.pair.correct + "' (" + o.pair.tip + ")", "info");
        } else {
          AUDIO.wrongTap();
          showFloat("❌ '" + o.word + "'은 틀린 말! 피하세요!", "#FF5252");
          setBanner("'" + o.word + "'은 틀린 맞춤법! 좌우로 피하세요! (" + o.pair.tip + ")", "warn");
        }
        return;
      }
    }

    // 3. 빈 공간 터치 -> 좌/우 레인 이동
    if (tx < W / 2) goLeft();
    else goRight();
  }

  /* ------------------------------------------------------------
     웨이브 & 기믹 패드 스폰
     ------------------------------------------------------------ */
  function spawnPad(S) {
    if (state.practiceMode) return;
    const types = S.padTypes && S.padTypes.length ? S.padTypes : null;
    if (!types) return;

    const lanes = [-1, 0, 1];
    let kind = types[Math.floor(Math.random() * types.length)];
    // 보스 미활성 시 counterPad 대신 boost
    if (kind === "counterPad" && !state.bossActive) kind = "boost";

    if (kind === "portalPair") {
      const l1 = lanes[Math.floor(Math.random() * 3)];
      const others = lanes.filter((l) => l !== l1);
      const l2 = others[Math.floor(Math.random() * others.length)];
      state.pads.push({ kind: "portalPair", portalColor: "blue", lane: l1, targetLane: l2, z: 0.02, triggered: false, ph: Math.random() * 6.28 });
      state.pads.push({ kind: "portalPair", portalColor: "orange", lane: l2, targetLane: l1, z: 0.02, triggered: false, ph: Math.random() * 6.28 });
      return;
    }

    let safeLanes = lanes;
    if (kind === "bridgeGap") {
      // 바른 단어가 방금 스폰된 레인은 구멍으로 막지 않음
      const blockedByWord = new Set(
        state.entities.filter((e) => e.kind === "correct" && e.z < 0.28).map((e) => e.lane)
      );
      const avail = lanes.filter((l) => !blockedByWord.has(l));
      if (!avail.length) return;
      safeLanes = avail;
    }

    const lane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
    state.pads.push({
      kind,
      lane,
      z: 0.02,
      triggered: false,
      ph: Math.random() * 6.28
    });
  }

  function spawnWave(S) {
    const pair = nextWordPair();
    const lanes = [-1, 0, 1];
    const isGold = !!(S.bonusChance && Math.random() < S.bonusChance);

    // 특수 파워업 스폰 (거품 보호막 / 단어 자석)
    if (!state.practiceMode && S.shieldChance && state.shield <= 0 && Math.random() < S.shieldChance * 0.45) {
      state.entities.push({
        kind: "shield",
        lane: lanes[Math.floor(Math.random() * 3)],
        z: 0.02,
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
    } else if (!state.practiceMode && S.magnetChance && state.magnetTimer <= 0 && Math.random() < S.magnetChance * 0.45) {
      state.entities.push({
        kind: "magnet",
        lane: lanes[Math.floor(Math.random() * 3)],
        z: 0.02,
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
    }

    // 양자택일 대결(바른 말 vs 틀린 말 나란히) 또는 혼합 웨이브
    const choiceRate = S.choiceChance || 0.48;
    const roll = Math.random();

    if (roll < choiceRate) {
      const eLane = lanes[Math.floor(Math.random() * 3)];
      const otherLanes = lanes.filter((l) => l !== eLane);
      const wLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];

      state.entities.push({
        kind: "enemy",
        word: pair.wrong,
        pair,
        lane: eLane,
        z: 0.02,
        hit: false,
        passed: false,
        ph: Math.random() * 6.28,
        off: 0
      });
      state.entities.push({
        kind: "correct",
        word: pair.correct,
        pair,
        lane: wLane,
        z: 0.02,
        isGold,
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
      AUDIO.spawnCorrect();
    } else if (roll < choiceRate + 0.28) {
      const eLane = state.entities.length % 2 === 0 ? state.lane : lanes[Math.floor(Math.random() * 3)];
      state.entities.push({
        kind: "enemy",
        word: pair.wrong,
        pair,
        lane: eLane,
        z: 0.02,
        hit: false,
        passed: false,
        ph: Math.random() * 6.28,
        off: 0
      });
      if (!state.practiceMode && S.double && Math.random() < S.double) {
        const pair2 = nextWordPair();
        const rest = lanes.filter((l) => l !== eLane);
        state.entities.push({
          kind: "enemy",
          word: pair2.wrong,
          pair: pair2,
          lane: rest[Math.floor(Math.random() * rest.length)],
          z: 0.02,
          hit: false,
          passed: false,
          ph: Math.random() * 6.28,
          off: 0
        });
      }
    } else {
      const wLane = lanes[Math.floor(Math.random() * 3)];
      state.entities.push({
        kind: "correct",
        word: pair.correct,
        pair,
        lane: wLane,
        z: 0.02,
        isGold,
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
      AUDIO.spawnCorrect();
    }
  }

  function updateParticles(dt, S) {
    state.parts = state.parts.filter((p) => {
      p.life -= dt * 1.35;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.text ? 260 : 460) * dt;
      return p.life > 0 && p.y < H + 20;
    });
    state.beams = state.beams.filter((b) => {
      b.life -= dt * 3.5;
      return b.life > 0;
    });
    state.rings = state.rings.filter((r) => {
      r.life -= dt * 2.2;
      return r.life > 0;
    });
    state.popups = state.popups.filter((p) => {
      p.life -= dt * 1.15;
      p.y -= 52 * dt;
      return p.life > 0;
    });
    state.confetti.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 240 * dt;
      p.a += p.va * dt;
      if (p.y > H + 30) {
        p.y = -20;
        p.x = Math.random() * W;
      }
    });

    const n = S.snow ? 2 : (S.rain ? 4 : (S.leaves ? 2 : (S.sand ? 3 : 0)));
    for (let i = 0; i < n; i++) {
      state.parts.push({
        x: Math.random() * W,
        y: -10,
        vx: (S.sand ? 130 : (S.leaves ? (Math.random() - 0.5) * 90 : 0)) + (Math.random() - 0.5) * 40,
        vy: 85 + Math.random() * 165,
        life: 2.5,
        c: S.rain ? "#38BDF8" : (S.snow ? "#FFFFFF" : (S.sand ? "#FDE047" : "#FB923C")),
        s: 3 + Math.random() * 4,
        rain: !!S.rain
      });
    }
  }

  /* ------------------------------------------------------------
     단어 복습 & 미니 퀴즈 학습장 모달
     ------------------------------------------------------------ */
  function speakWordPair(pair) {
    if (!pair) return;
    AUDIO.speak(pair.correct + ". " + pair.tip);
  }

  function buildQuizList() {
    let base = [];
    if (reviewState.tab === "quiz") {
      const missed = state.missedWords;
      const cur = WORDS.getStageWordsOnly(state.stageIdx);
      base = missed.length >= 4 ? [...missed, ...cur] : [...cur];
    }
    const dedup = [];
    const seen = new Set();
    base.forEach((p) => {
      if (!seen.has(p.correct)) { seen.add(p.correct); dedup.push(p); }
    });
    for (let i = dedup.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dedup[i], dedup[j]] = [dedup[j], dedup[i]];
    }
    reviewState.quizPool = dedup;
    reviewState.quizIdx = 0;
    prepareQuizQuestion();
  }

  function prepareQuizQuestion() {
    if (!reviewState.quizPool.length) return;
    const item = reviewState.quizPool[reviewState.quizIdx % reviewState.quizPool.length];
    const swap = Math.random() < 0.5;
    reviewState.quizChoices = swap
      ? [{ text: item.wrong, ok: false }, { text: item.correct, ok: true }]
      : [{ text: item.correct, ok: true }, { text: item.wrong, ok: false }];
    reviewState.quizAnswered = false;
  }

  function renderReviewModal() {
    const curS = STAGES[state.stageIdx];
    let bodyHtml = "";

    if (reviewState.tab === "current" || reviewState.tab === "missed" || reviewState.tab === "all") {
      let list = [];
      let topicText = "";
      let stageChipsHtml = "";

      if (reviewState.tab === "current") {
        list = WORDS.getStageWordsOnly(state.stageIdx);
        topicText = (state.stageIdx + 1) + "단계 (" + curS.name + ") · 주제: " + WORDS.stageTopics[state.stageIdx];
      } else if (reviewState.tab === "missed") {
        list = state.missedWords;
        topicText = list.length
          ? "게임 중 헷갈렸던 단어 " + list.length + "개를 다시 복습해요!"
          : "아직 틀린 단어가 없어요! 정말 잘하고 있어요! 👏";
      } else {
        const bIdx = reviewState.browseStage;
        list = WORDS.getStageWordsOnly(bIdx);
        topicText = (bIdx + 1) + "단계 (" + STAGES[bIdx].name + ") · 주제: " + WORDS.stageTopics[bIdx];
        stageChipsHtml = '<div class="rv-stage-chips">' + STAGES.map((st, idx) =>
          '<button class="rv-schip' + (idx === bIdx ? " active" : "") + '" data-bstage="' + idx + '">' + (idx + 1) + '단계 ' + st.icon + '</button>'
        ).join("") + '</div>';
      }

      const cardsHtml = list.length
        ? '<div class="rv-grid">' + list.map((p, idx) =>
          '<div class="rv-word-card">' +
            '<div class="rv-word-top">' +
              '<span class="rv-correct">⭕ ' + p.correct + '</span>' +
              '<span class="rv-wrong">❌ ' + p.wrong + '</span>' +
            '</div>' +
            '<div class="rv-tip">💡 ' + p.tip + '</div>' +
            '<button class="rv-speak" data-speak-idx="' + idx + '">🔊 소리 듣기</button>' +
          '</div>'
        ).join("") + '</div>'
        : '<div style="text-align:center;padding:26px;color:#475569;font-weight:800">틀린 단어 없이 완벽해요! "현재 단계 단어"나 "맞춤법 퀴즈" 탭도 눌러보세요 ✨</div>';

      bodyHtml =
        stageChipsHtml +
        '<div class="rv-topic-bar">' +
          '<span>📚 ' + topicText + '</span>' +
          (list.length ? '<button class="rv-speak" id="rvStartQuizFromHere">🎯 이 단어로 퀴즈 풀기</button>' : '') +
        '</div>' +
        cardsHtml;
    } else if (reviewState.tab === "quiz") {
      const pool = reviewState.quizPool;
      const item = pool[reviewState.quizIdx % pool.length];
      bodyHtml =
        '<div class="rv-quiz-box">' +
          '<div style="font-size:13px;font-weight:800;color:#0284C7;margin-bottom:6px">🔥 연속 정답: ' + reviewState.quizStreak + '회 · 문제 ' + ((reviewState.quizIdx % pool.length) + 1) + ' / ' + pool.length + '</div>' +
          '<div class="rv-quiz-q">어느 쪽이 바른 맞춤법일까요? 직접 눌러보세요!</div>' +
          '<div class="rv-quiz-choices">' +
            reviewState.quizChoices.map((c, ci) =>
              '<button class="rv-choice-btn" data-choice="' + ci + '">' + c.text + '</button>'
            ).join("") +
          '</div>' +
          '<div class="rv-quiz-feedback" id="rvQuizFb"></div>' +
          '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
            '<button class="rv-speak" id="rvQuizSpeak">🔊 힌트 듣기</button>' +
            '<button class="btn" id="rvQuizNext" style="background:#2563EB;color:#fff">다음 문제 ▶</button>' +
          '</div>' +
        '</div>';
    }

    reviewCard.innerHTML =
      '<div class="rv-header">' +
        '<h2>📖 맞춤법 단어 복습하기</h2>' +
        '<button class="rv-close" id="rvCloseBtn">✕ 게임으로 돌아가기</button>' +
      '</div>' +
      '<div class="rv-tabs">' +
        '<button class="rv-tab' + (reviewState.tab === "current" ? " active" : "") + '" data-tab="current">✨ 현재 ' + (state.stageIdx + 1) + '단계 단어</button>' +
        '<button class="rv-tab' + (reviewState.tab === "missed" ? " active" : "") + '" data-tab="missed">💡 헷갈린 단어 (' + state.missedWords.length + ')</button>' +
        '<button class="rv-tab' + (reviewState.tab === "all" ? " active" : "") + '" data-tab="all">📚 1~12단계 도감</button>' +
        '<button class="rv-tab' + (reviewState.tab === "quiz" ? " active" : "") + '" data-tab="quiz">🎯 복습 퀴즈</button>' +
      '</div>' +
      bodyHtml;

    // 이벤트 바인딩
    document.getElementById("rvCloseBtn").onclick = closeReviewModal;
    reviewCard.querySelectorAll(".rv-tab").forEach((btn) => {
      btn.onclick = () => {
        AUDIO.tap();
        reviewState.tab = btn.dataset.tab;
        if (reviewState.tab === "all") reviewState.browseStage = state.stageIdx;
        if (reviewState.tab === "quiz") buildQuizList();
        renderReviewModal();
      };
    });

    reviewCard.querySelectorAll(".rv-schip").forEach((btn) => {
      btn.onclick = () => {
        AUDIO.tap();
        reviewState.browseStage = Number(btn.dataset.bstage);
        renderReviewModal();
      };
    });

    // 단어 듣기 버튼
    let activeList = [];
    if (reviewState.tab === "current") activeList = WORDS.getStageWordsOnly(state.stageIdx);
    else if (reviewState.tab === "missed") activeList = state.missedWords;
    else if (reviewState.tab === "all") activeList = WORDS.getStageWordsOnly(reviewState.browseStage);

    reviewCard.querySelectorAll("[data-speak-idx]").forEach((btn) => {
      btn.onclick = () => {
        AUDIO.tap();
        speakWordPair(activeList[Number(btn.dataset.speakIdx)]);
      };
    });

    const startQuizBtn = document.getElementById("rvStartQuizFromHere");
    if (startQuizBtn) {
      startQuizBtn.onclick = () => {
        AUDIO.tap();
        reviewState.quizPool = [...activeList];
        for (let i = reviewState.quizPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [reviewState.quizPool[i], reviewState.quizPool[j]] = [reviewState.quizPool[j], reviewState.quizPool[i]];
        }
        reviewState.quizIdx = 0;
        reviewState.tab = "quiz";
        prepareQuizQuestion();
        renderReviewModal();
      };
    }

    if (reviewState.tab === "quiz") {
      const item = reviewState.quizPool[reviewState.quizIdx % reviewState.quizPool.length];
      const fb = document.getElementById("rvQuizFb");
      reviewCard.querySelectorAll("[data-choice]").forEach((btn) => {
        btn.onclick = () => {
          if (reviewState.quizAnswered) return;
          const idx = Number(btn.dataset.choice);
          const chosen = reviewState.quizChoices[idx];
          reviewState.quizAnswered = true;
          if (chosen.ok) {
            btn.classList.add("good");
            reviewState.quizStreak++;
            AUDIO.collect(item.correct, reviewState.quizStreak);
            fb.innerHTML = '<span style="color:#15803D">⭕ 정답이에요! "' + item.correct + '" — ' + item.tip + '</span>';
          } else {
            btn.classList.add("bad");
            reviewState.quizStreak = 0;
            AUDIO.wrongTap();
            AUDIO.speak(item.correct + "이 맞아요. " + item.tip);
            reviewCard.querySelectorAll("[data-choice]").forEach((b, bi) => {
              if (reviewState.quizChoices[bi].ok) b.classList.add("good");
            });
            fb.innerHTML = '<span style="color:#DC2626">💡 아까워요! 바른 말은 <b>' + item.correct + '</b> — ' + item.tip + '</span>';
          }
        };
      });
      document.getElementById("rvQuizSpeak").onclick = () => {
        AUDIO.tap();
        AUDIO.speak(item.correct);
      };
      document.getElementById("rvQuizNext").onclick = () => {
        AUDIO.tap();
        reviewState.quizIdx++;
        prepareQuizQuestion();
        renderReviewModal();
      };
    }
  }

  function openReviewModal(defaultTab) {
    AUDIO.tap();
    state.reviewOpen = true;
    reviewState.tab = defaultTab || "current";
    reviewState.browseStage = state.stageIdx;
    if (reviewState.tab === "quiz") buildQuizList();
    renderReviewModal();
    reviewModal.style.display = "flex";
    reviewModal.setAttribute("aria-hidden", "false");
  }

  function closeReviewModal() {
    AUDIO.tap();
    state.reviewOpen = false;
    reviewModal.style.display = "none";
    reviewModal.setAttribute("aria-hidden", "true");
  }

  /* ------------------------------------------------------------
     스테이지 전환 · 휴식 · 최종 결과
     ------------------------------------------------------------ */
  function enterStageTransition(nextIdx) {
    state.stageClearWait = true;
    const curS = STAGES[state.stageIdx];
    const nextS = STAGES[nextIdx];
    document.getElementById("card").innerHTML =
      '<div style="font-size:44px;margin-bottom:6px">🎉</div>' +
      '<h2 style="margin:0 0 6px">' + (state.stageIdx + 1) + '단계 [' + curS.name + '] 완료!</h2>' +
      '<p style="margin:0 0 12px;color:#334155;font-size:15px">바른 단어 <b>' + state.collected + '개</b>를 잡았어요! (최고 ' + state.maxCombo + '콤보)</p>' +
      '<div class="reviewBox" style="text-align:left">' +
        '<h3>➡️ 다음 단계 예고: ' + (nextIdx + 1) + '단계 ' + nextS.icon + ' [' + nextS.name + ']</h3>' +
        '<div class="reviewItem"><b>기믹:</b> ' + nextS.gimmickLabel + ' — ' + nextS.gimmickDesc + '</div>' +
        '<div class="reviewItem"><b>단어 주제:</b> ' + WORDS.stageTopics[nextIdx] + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">' +
        '<button id="btnNextStage" style="background:#16a34a;color:#fff;border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:800;cursor:pointer">▶ 다음 단계 시작</button>' +
        '<button id="btnStageReview" style="background:#f59e0b;color:#fff;border:0;border-radius:12px;padding:12px 18px;font-size:15px;font-weight:800;cursor:pointer">📖 이번 단계 단어 복습</button>' +
        '<button id="btnRepeatStage" style="background:#f1f5f9;color:#1e293b;border:1px solid #cbd5e1;border-radius:12px;padding:12px 18px;font-size:15px;font-weight:700;cursor:pointer">🔁 한 번 더</button>' +
      '</div>';
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("btnNextStage").onclick = () => {
      state.stageClearWait = false;
      startStage(nextIdx);
    };
    document.getElementById("btnStageReview").onclick = () => {
      openReviewModal("current");
    };
    document.getElementById("btnRepeatStage").onclick = () => {
      state.stageClearWait = false;
      startStage(state.stageIdx);
    };
  }

  function togglePause(forcePause) {
    if (state.finished || state.stageClearWait || state.reviewOpen) return;
    state.paused = forcePause != null ? !!forcePause : !state.paused;
    syncModeButtons();
    const overlay = document.getElementById("overlay");
    if (state.paused) {
      document.getElementById("card").innerHTML =
        '<div style="font-size:44px;margin-bottom:6px">🌿</div>' +
        '<h2 style="margin:0 0 8px">잠깐 쉬고 있어요</h2>' +
        '<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.5">숨을 천천히 들이쉬고 내쉬어 보세요.<br>준비가 되면 다시 시작해요!</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button id="btnResumeGame" style="background:#2563eb;color:#fff;border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:800;cursor:pointer">▶ 이어서 하기</button>' +
          '<button id="btnPauseReview" style="background:#f59e0b;color:#fff;border:0;border-radius:12px;padding:12px 18px;font-size:15px;font-weight:800;cursor:pointer">📖 단어 복습하기</button>' +
          '<button id="btnRetryCur" style="background:#f1f5f9;color:#1e293b;border:1px solid #cbd5e1;border-radius:12px;padding:12px 18px;font-size:15px;font-weight:700;cursor:pointer">🔁 이 단계 처음부터</button>' +
        '</div>';
      overlay.style.display = "flex";
      document.getElementById("btnResumeGame").onclick = () => togglePause(false);
      document.getElementById("btnPauseReview").onclick = () => openReviewModal("current");
      document.getElementById("btnRetryCur").onclick = () => {
        state.paused = false;
        syncModeButtons();
        startStage(state.stageIdx);
      };
    } else {
      overlay.style.display = "none";
    }
  }

  function enterResult() {
    state.finished = true;
    state.paused = false;
    state.stageClearWait = false;
    AUDIO.fanfare();
    burstConfetti(150);
    AUDIO.speak("미션 완료! 읽걷이의 맞춤법 모험 대성공! 바른 맞춤법 단어를 정말 많이 잡았어요!");
    setBanner("미션 완료! 읽걷이의 맞춤법 모험 대성공!", "good");
    document.getElementById("totalBar").style.width = "100%";
    document.getElementById("stageBar").style.width = "100%";

    const reviewHtml = state.learnedWords.slice(0, 8).map((p) =>
      '<div class="reviewItem">⭕ <b>' + p.correct + '</b> (❌ ' + p.wrong + ') — ' + p.tip + '</div>'
    ).join("") || '<div class="reviewItem">바른 단어를 잡아 맞춤법을 익혀 보세요!</div>';

    const missedHtml = state.missedWords.length
      ? '<div class="reviewBox" style="background:#fff7ed;border-color:#fdba74"><h3>📖 다시 살펴볼 맞춤법 (오답 복습)</h3>' +
        state.missedWords.slice(0, 6).map((p) =>
          '<div class="reviewItem">💡 <b>' + p.correct + '</b> (헷갈린 말: ' + p.wrong + ') — ' + p.tip + '</div>'
        ).join("") + '</div>'
      : "";

    document.getElementById("card").innerHTML =
      '<div class="result-trophy-wrap">' +
        '<svg class="result-trophy-svg" viewBox="0 0 96 96" width="84" height="84" aria-hidden="true">' +
          '<circle cx="48" cy="48" r="42" fill="#fef9c3"/>' +
          '<path d="M30 22h36v22c0 12-8 20-18 20s-18-8-18-20z" fill="#fbbf24" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M30 28h-9c0 12 4 16 9 16m36-16h9c0 12-4 16-9 16" fill="none" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>' +
          '<path d="M48 64v12m-12 4h24" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M48 31l3 7 7.5.8-5.5 5 1.6 7.4L48 47.4l-6.6 3.8 1.6-7.4-5.5-5 7.5-.8z" fill="#fffbeb"/>' +
        '</svg>' +
      '</div>' +
      '<div style="background:#16A34A;color:#fff;display:inline-block;border-radius:8px;padding:4px 12px;font-weight:900;font-size:13px">💮 읽걷이의 맞춤법 마스터 스탬프!</div>' +
      "<h1>읽걷이의 맞춤법 모험 성공!</h1>" +
      '<div style="font-weight:800;color:#0D47A1;margin:6px 0">' + STAGES.length + "개 테마 코스 완주! · 총점 " + state.score + "점</div>" +
      '<div class="row"><span>⭕ 캐릭터가 잡은 바른 단어</span><span>' + state.totalCollected + "개 (최고 " + state.maxCombo + "콤보)</span></div>" +
      '<div class="row"><span>✨ 오타 적 안전 회피</span><span>' + state.totalDodged + "회</span></div>" +
      '<div class="row"><span>💫 오타 적과 부딪힘</span><span>' + state.totalHit + "회</span></div>" +
      missedHtml +
      '<div class="reviewBox"><h3>📖 오늘 익힌 맞춤법 복습</h3>' + reviewHtml + "</div>" +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">' +
        '<button id="bigBtn" style="margin-top:0">↻ 처음부터 다시 놀기</button>' +
        '<button id="btnFinalReview" style="background:#f59e0b;color:#fff;border:0;border-radius:16px;padding:14px 22px;font-size:16px;font-weight:900;cursor:pointer">📖 단어 복습 & 퀴즈</button>' +
      '</div>';

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("bigBtn").onclick = restart;
    document.getElementById("btnFinalReview").onclick = () => openReviewModal(state.missedWords.length ? "missed" : "all");

    if (window.D1Bridge) {
      window.D1Bridge.saveRecord({
        game: "safe_mover",
        stage: STAGES.length + "단계 완주",
        score: state.totalCollected,
        summary: "바른 단어 " + state.totalCollected + "개 · 점수 " + state.score + " · 회피 " + state.totalDodged + "회 · 부딪힘 " + state.totalHit + "회",
        payload: {
          score: state.score,
          maxCombo: state.maxCombo,
          collected: state.totalCollected,
          dodged: state.totalDodged,
          hit: state.totalHit,
          learnedWords: state.learnedWords.slice(0, 24),
          missedWords: state.missedWords.slice(0, 12)
        }
      });
    }
  }

  /* ------------------------------------------------------------
     메인 게임 루프 업데이트
     ------------------------------------------------------------ */
  function collectWordEntity(o, S) {
    o.collected = true;
    state.collected++;
    state.totalCollected++;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    const feverMul = state.feverTimer > 0 ? 2 : 1;
    const pts = (100 + Math.min(200, state.combo * 20)) * (o.isGold ? 2 : 1) * feverMul;
    state.score += pts;
    state.catchAnim = 0.45;
    recordLearned(o.pair);
    AUDIO.collect(o.word, state.combo);

    const anchor = getPlayerAnchor();
    const sx = o.screenX != null ? o.screenX : anchor.x;
    const sy = o.screenY != null ? o.screenY : anchor.y;
    const beamCol = state.feverTimer > 0 ? "#F43F5E" : (o.isGold ? "#FACC15" : "#4ADE80");
    state.beams.push({ x1: anchor.x, y1: anchor.y, x2: sx, y2: sy, life: 1, c: beamCol });
    state.rings.push({ x: anchor.x, y: anchor.y, rad: 24, life: 1, c: beamCol });
    spawnParts(sx, sy, o.isGold ? 34 : 24, ["#4ADE80", "#FDE047", "#FFFFFF", "#38BDF8", "#F472B6"], true);

    const comboTxt = state.combo >= 2 ? " (" + state.combo + "콤보!)" : "";
    addPopup(anchor.x, anchor.y - 45, "+" + pts + (o.isGold ? " ⭐2배!" : "") + (feverMul > 1 ? " 🔥" : "") + comboTxt, o.isGold ? "#FDE047" : "#4ADE80", 21);
    showFloat((o.isGold ? "⭐ 황금말! '" : "⭕ '") + o.word + "' +" + pts + "점!", o.isGold ? "#FDE047" : "#4ADE80");
    setBanner("잘했어요! '" + o.word + "' — " + o.pair.tip, "good");

    // 5콤보 달성 시 피버 타임 발동!
    if (state.combo > 0 && state.combo % 5 === 0 && state.feverTimer <= 0) {
      state.feverTimer = 5.0;
      AUDIO.fever();
      spawnParts(anchor.x, anchor.y, 28, ["#FDE047", "#F43F5E", "#38BDF8", "#4ADE80"]);
      showFloat("🔥 5콤보 달성! 무지개 피버 타임!", "#FDE047");
    }
    updateBuffBadges();
  }

  function triggerWarp(targetLane, label, color) {
    const oldAnchor = getPlayerAnchor();
    state.rings.push({ x: oldAnchor.x, y: oldAnchor.y, rad: 32, life: 1, c: color || "#38BDF8" });
    state.lane = targetLane;
    state.lanePos = targetLane;
    state.warpAnim = 0.65;
    state.warpInvuln = 0.95;
    state.score += 60;
    AUDIO.warp();
    const newAnchor = getPlayerAnchor();
    state.beams.push({ x1: oldAnchor.x, y1: oldAnchor.y, x2: newAnchor.x, y2: newAnchor.y, life: 1, c: color || "#38BDF8", w: 10 });
    state.rings.push({ x: newAnchor.x, y: newAnchor.y, rad: 28, life: 1, c: color || "#38BDF8" });
    spawnParts(newAnchor.x, newAnchor.y, 22, ["#38BDF8", "#C084FC", "#FDE047"]);
    addPopup(newAnchor.x, newAnchor.y - 40, label || "🌀 워프 +60!", color || "#38BDF8", 20);
  }

  function update(dt) {
    state.animT += dt;
    if (state.finished) {
      updateParticles(dt, STAGES[STAGES.length - 1]);
      return;
    }
    if (state.paused || state.stageClearWait || state.reviewOpen) {
      return;
    }

    const S = STAGES[state.stageIdx];
    const speedMul =
      (state.practiceMode ? 0.56 : 1) *
      (state.boostTimer > 0 ? 1.35 : 1) *
      (state.feverTimer > 0 ? 1.18 : 1) *
      (state.railTimer > 0 ? 1.2 : 1);
    const spawnMul = state.practiceMode ? 1.45 : 1;
    const useSlippery = state.practiceMode ? false : !!S.slippery;
    const useWind = state.practiceMode ? false : !!S.wind;
    const useCurrent = state.practiceMode ? false : !!S.current;

    state.laneFlash = Math.max(0, state.laneFlash - dt);
    state.catchAnim = Math.max(0, state.catchAnim - dt);
    state.jumpTimer = Math.max(0, state.jumpTimer - dt);
    state.magnetTimer = Math.max(0, state.magnetTimer - dt);
    state.boostTimer = Math.max(0, state.boostTimer - dt);
    state.railTimer = Math.max(0, state.railTimer - dt);
    state.feverTimer = Math.max(0, state.feverTimer - dt);
    state.warpAnim = Math.max(0, state.warpAnim - dt);
    state.warpInvuln = Math.max(0, state.warpInvuln - dt);
    state.bossHitFlash = Math.max(0, state.bossHitFlash - dt);
    state.shake = Math.max(0, state.shake - dt);

    const prevMirror = state.mirrorTimer > 0;
    state.mirrorTimer = Math.max(0, state.mirrorTimer - dt);
    if (prevMirror && state.mirrorTimer <= 0) {
      syncPadButtons();
      showFloat("✨ 좌우 방향이 원래대로 돌아왔어요!", "#4ADE80");
    }

    state.gravityTimer = Math.max(0, state.gravityTimer - dt);
    const flipTarget = state.gravityTimer > 0 ? 1 : 0;
    state.flipBlend += (flipTarget - state.flipBlend) * Math.min(1, dt * 4.5);

    const sf = state.stumble > 0 ? 0.5 : 1;
    if (state.stumble > 0) {
      state.stumble -= dt;
      if (state.stumble <= 0) {
        setBanner("전방 주시! 바른 단어는 잡아가고, 틀린 단어 적은 피해요!", "");
      }
    }

    state.stageTime += dt * sf;
    state.roadScroll = (state.roadScroll + dt * 2.5 * sf * S.speed * speedMul) % 1;
    state.trackPhase += dt * (S.curveFreq || 0.5) * sf * speedMul;
    state.hillPhase += dt * (S.hillFreq || 0.6) * sf * speedMul;

    const bankTarget =
      Math.sin(state.trackPhase) * (S.bankMul || 0.04) * (state.practiceMode ? 0.35 : 1) +
      (state.lane - state.lanePos) * 0.03;
    state.camTilt += (bankTarget - state.camTilt) * Math.min(1, dt * 6);

    const lerpK = useSlippery ? 5.2 : 10.5;
    state.lanePos += (state.lane - state.lanePos) * Math.min(1, dt * lerpK);

    // 레일 그라인드 중 스파크 파티클
    if (state.railTimer > 0 && Math.random() < 0.45) {
      const a = getPlayerAnchor();
      state.parts.push({
        x: a.x + (Math.random() - 0.5) * 26,
        y: a.y + 40,
        vx: (Math.random() - 0.5) * 140,
        vy: -40 - Math.random() * 90,
        life: 0.65,
        c: S.roadStyle === "forest" ? "#4ADE80" : "#7DD3FC",
        s: 5
      });
    }

    // 스테이지 5: 예고 후 사막 강풍 기믹
    if (useWind) {
      if (state.windWarn > 0) {
        state.windWarn -= dt * sf;
        if (state.windWarn <= 0) {
          state.lanePos = Math.max(-1.15, Math.min(1.15, state.lanePos + state.nextWindDir * 0.42));
          AUDIO.tone(180, 90, 0.4, "sawtooth", 0.16);
          showFloat("🌪️ 강풍 휘몰아침!", "#FFAB40");
        }
      } else {
        windT -= dt * sf;
        if (windT <= 0) {
          windT = 6.0 + Math.random() * 3.5;
          state.nextWindDir = Math.random() < 0.5 ? -1 : 1;
          state.windWarn = 1.5;
        }
      }
    }

    // 스테이지 8: 예고 후 거울 반전 이벤트
    if (S.mirrorEvent && !state.practiceMode) {
      if (state.mirrorWarn > 0) {
        state.mirrorWarn -= dt * sf;
        if (state.mirrorWarn <= 0) {
          state.mirrorTimer = 4.5;
          AUDIO.flip();
          syncPadButtons();
          showFloat("🎭 좌우 거울 반전 시작!", "#F472B6");
        }
      } else if (state.mirrorTimer <= 0) {
        mirrorEventT -= dt * sf;
        if (mirrorEventT <= 0) {
          mirrorEventT = 15.0 + Math.random() * 4.0;
          state.mirrorWarn = 1.5;
        }
      }
    }

    // 스테이지 11·12: 주기적 중력 반전 이벤트
    if (S.gravityFlipEvent && !state.practiceMode && state.gravityTimer <= 0) {
      gravityEventT -= dt * sf;
      if (gravityEventT <= 0) {
        gravityEventT = 16.0 + Math.random() * 5.0;
        state.gravityTimer = 5.5;
        AUDIO.flip();
        showFloat("🙃 중력 반전! 천장 질주!", "#C084FC");
      }
    }

    // 스테이지 12: 거대 오타 마왕 보스전
    if (S.bossChase && !state.practiceMode && state.stageTime > 8 && S.dur - state.stageTime > 4) {
      if (!state.bossActive) {
        state.bossActive = true;
        showFloat("👾 거대 오타 마왕 출현! 레이저를 피하세요!", "#FB7185");
      }
      if (state.bossLaser) {
        state.bossLaser.timer -= dt * sf;
        if (state.bossLaser.phase === "warn" && state.bossLaser.timer <= 0) {
          state.bossLaser.phase = "fire";
          state.bossLaser.timer = 0.65;
          state.bossLaser.resolved = false;
          AUDIO.laserBlast();
        } else if (state.bossLaser.phase === "fire") {
          if (!state.bossLaser.resolved) {
            state.bossLaser.resolved = true;
            const inDanger = state.bossLaser.lanes.includes(state.lane);
            const invuln = state.jumpTimer > 0 || state.boostTimer > 0 || state.railTimer > 0 || state.feverTimer > 0 || state.warpInvuln > 0;
            if (inDanger && !invuln) {
              if (state.shield > 0) {
                state.shield = 0;
                AUDIO.shieldBlock();
                showFloat("🫧 보호막으로 보스 레이저 방어!", "#38BDF8");
              } else {
                state.stumble = 0.85;
                state.shake = 0.32;
                state.combo = 0;
                AUDIO.hit();
                showFloat("⚡ 레이저에 스쳤어요! 빨간 레인을 피하세요!", "#EF4444");
              }
            } else {
              state.score += 80;
              state.dodged++;
              state.totalDodged++;
              const a = getPlayerAnchor();
              addPopup(a.x, a.y - 45, "⚡ 레이저 회피 +80!", "#FDE047", 18);
            }
          }
          if (state.bossLaser.timer <= 0) state.bossLaser = null;
        }
      } else {
        bossLaserT -= dt * sf;
        if (bossLaserT <= 0) {
          bossLaserT = 5.4 + Math.random() * 1.8;
          const lanes = [-1, 0, 1];
          const l1 = lanes[Math.floor(Math.random() * 3)];
          const targets = [l1];
          if (state.stageTime > 30) {
            const rest = lanes.filter((l) => l !== l1);
            targets.push(rest[Math.floor(Math.random() * rest.length)]);
          }
          state.bossLaser = { lanes: targets, phase: "warn", timer: 1.65, resolved: false };
          AUDIO.laserWarn();
        }
      }
    } else {
      state.bossLaser = null;
    }

    // 스테이지 11: 바닷속 해류 기믹
    if (useCurrent) {
      currentT -= dt * sf;
      if (currentT <= 0) {
        currentT = 5.5 + Math.random() * 3;
        const dir = Math.random() < 0.5 ? -1 : 1;
        state.lane = Math.max(-1, Math.min(1, state.lane + dir));
        showFloat(dir < 0 ? "🫧 해류에 왼쪽으로 흘러가요!" : "🫧 해류에 오른쪽으로 흘러가요!", "#38BDF8");
      }
    }

    if (S.mid) {
      const frac = state.stageTime / S.dur;
      const marks = [0.25, 0.5, 0.75];
      if (midIdx < 3 && frac >= marks[midIdx]) {
        setBanner(S.mid[midIdx], "");
        AUDIO.speak(S.mid[midIdx]);
        midIdx++;
      }
    }

    stepT += dt * sf;
    if (stepT >= 0.27) {
      stepT = 0;
      stepN++;
      if (state.stumble <= 0 && state.jumpTimer <= 0 && state.railTimer <= 0 && state.stageTime < S.dur - 0.5) AUDIO.step(stepN);
    }

    const remain = S.dur - state.stageTime;
    if (remain > 2.6) {
      spawnT -= dt * sf;
      if (spawnT <= 0) {
        spawnWave(S);
        spawnT = S.spawn * spawnMul * (0.85 + Math.random() * 0.35);
      }
      if (S.padsEnabled || S.puddles || S.boostPads || S.cloudJump || S.tidalWave) {
        padT -= dt * sf;
        if (padT <= 0) {
          spawnPad(S);
          padT = 2.6 + Math.random() * 2.0;
        }
      }
    }

    // 바닥 기믹 패드 업데이트
    for (let i = state.pads.length - 1; i >= 0; i--) {
      const p = state.pads[i];
      p.z += dt * 0.38 * sf * S.speed * speedMul;
      if (!p.triggered && state.jumpTimer <= 0 && p.z >= 0.78 && p.z <= 0.94) {
        if (Math.abs(state.lanePos - p.lane) < 0.48) {
          p.triggered = true;
          const anchor = getPlayerAnchor();
          if (p.kind === "puddle") {
            AUDIO.splash();
            spawnParts(anchor.x, anchor.y + 45, 16, ["#38BDF8", "#BAE6FD", "#FFFFFF"]);
            const hop = p.lane <= 0 ? 1 : -1;
            state.lane = Math.max(-1, Math.min(1, state.lane + hop));
            showFloat("💧 첨벙! 물웅덩이에 미끄러졌어요!", "#38BDF8");
          } else if (p.kind === "boost") {
            state.boostTimer = 3.2;
            state.score += 50;
            AUDIO.powerup();
            spawnParts(anchor.x, anchor.y + 20, 22, ["#22D3EE", "#FDE047", "#F472B6"]);
            addPopup(anchor.x, anchor.y - 30, "⚡ 부스트 +50!", "#22D3EE", 20);
            showFloat("⚡ 네온 부스트 무적 질주!", "#22D3EE");
          } else if (p.kind === "cloud" || p.kind === "spring" || p.kind === "surfRamp") {
            state.jumpTimer = p.kind === "surfRamp" ? 1.0 : 0.88;
            const bonus = p.kind === "surfRamp" ? 70 : 60;
            state.score += bonus;
            AUDIO.jump();
            spawnParts(anchor.x, anchor.y + 30, 18, ["#FFFFFF", "#BAE6FD", "#FDE047"]);
            const msg = p.kind === "spring" ? "🌸 스프링 점프 +" + bonus + "!" : (p.kind === "surfRamp" ? "🏄 서핑 점프 +" + bonus + "!" : "☁️ 퐁당 점프 +" + bonus + "!");
            addPopup(anchor.x, anchor.y - 40, msg, "#FFFFFF", 20);
            showFloat(msg, "#BAE6FD");
          } else if (p.kind === "tidal") {
            AUDIO.splash();
            const push = p.lane === 0 ? (Math.random() < 0.5 ? -1 : 1) : (p.lane < 0 ? 1 : -1);
            state.lane = Math.max(-1, Math.min(1, state.lane + push));
            spawnParts(anchor.x, anchor.y + 35, 18, ["#0EA5E9", "#E0F2FE", "#FFFFFF"]);
            showFloat("🌊 파도에 밀렸어요!", "#38BDF8");
          } else if (p.kind === "portalPair") {
            state.pads.forEach((other) => {
              if (other !== p && other.kind === "portalPair" && Math.abs(other.z - p.z) < 0.12) other.triggered = true;
            });
            triggerWarp(p.targetLane, "🌀 쌍둥이 포탈 워프!", p.portalColor === "orange" ? "#F97316" : "#38BDF8");
            showFloat("🌀 포탈 순간이동!", "#38BDF8");
          } else if (p.kind === "warp" || p.kind === "skyWarp") {
            const nextWord = state.entities.find((e) => e.kind === "correct" && !e.collected && e.z < 0.78);
            const fallback = [-1, 0, 1].filter((l) => l !== p.lane);
            const dest = nextWord ? nextWord.lane : fallback[Math.floor(Math.random() * fallback.length)];
            triggerWarp(dest, p.kind === "skyWarp" ? "✨ 천상 워프!" : "🌀 맨홀 워프!", p.kind === "skyWarp" ? "#FACC15" : "#22D3EE");
            if (p.kind === "skyWarp") { state.jumpTimer = 0.75; state.score += 40; }
            showFloat(p.kind === "skyWarp" ? "✨ 천상 워프 보너스!" : "🌀 맨홀 순간이동!", "#22D3EE");
          } else if (p.kind === "iceRail" || p.kind === "vineRail") {
            state.railTimer = 2.6;
            state.score += 70;
            AUDIO.rail();
            addPopup(anchor.x, anchor.y - 36, p.kind === "vineRail" ? "🌿 덩굴 레일 +70!" : "🛷 얼음 레일 +70!", "#4ADE80", 20);
            showFloat(p.kind === "vineRail" ? "🌿 덩굴 레일 그라인드!" : "🛷 얼음 레일 무적 서핑!", "#4ADE80");
          } else if (p.kind === "conveyorL" || p.kind === "conveyorR") {
            const dir = p.kind === "conveyorL" ? -1 : 1;
            AUDIO.conveyor();
            state.lane = Math.max(-1, Math.min(1, state.lane + dir));
            showFloat(dir < 0 ? "◀◀ 모래 컨베이어에 왼쪽 이동!" : "▶▶ 모래 컨베이어에 오른쪽 이동!", "#FBBF24");
          } else if (p.kind === "bridgeGap") {
            if (state.railTimer <= 0 && state.feverTimer <= 0 && state.boostTimer <= 0 && state.warpInvuln <= 0) {
              const safe = p.lane === 0 ? (Math.random() < 0.5 ? -1 : 1) : 0;
              state.lane = safe;
              state.stumble = 0.55;
              state.shake = 0.25;
              AUDIO.wrongTap();
              showFloat("🌉 끊어진 다리! 옆 판자로 점프!", "#FCA5A5");
            }
          } else if (p.kind === "mirrorGate") {
            state.mirrorTimer = 4.5;
            AUDIO.flip();
            syncPadButtons();
            showFloat("🎭 거울 게이트! 좌우가 반전돼요!", "#F472B6");
          } else if (p.kind === "gravityGate") {
            state.gravityTimer = state.gravityTimer > 0 ? 0 : 5.5;
            AUDIO.flip();
            showFloat(state.gravityTimer > 0 ? "🙃 중력 반전! 천장 질주!" : "✨ 중력이 돌아왔어요!", "#C084FC");
          } else if (p.kind === "counterPad") {
            AUDIO.bossHit();
            state.score += 150;
            state.bossHitFlash = 0.45;
            if (state.bossActive) {
              state.bossHp = Math.max(0, state.bossHp - 1);
              const hpPt = RENDERER.project(W, H, S, state, 0.04, 0);
              state.beams.push({ x1: anchor.x, y1: anchor.y, x2: hpPt.cx, y2: hpPt.hy - 30, life: 1, c: "#FACC15", w: 12 });
              spawnParts(hpPt.cx, hpPt.hy - 30, 26, ["#FDE047", "#FB7185", "#38BDF8"]);
              if (state.bossHp <= 0) {
                state.score += 500;
                state.bossHp = state.bossMaxHp;
                burstConfetti(40);
                addPopup(anchor.x, anchor.y - 50, "💥 보스 격파 +500!", "#FDE047", 24);
                showFloat("💥 오타 마왕 격파 보너스 +500점!", "#FDE047");
              } else {
                addPopup(anchor.x, anchor.y - 40, "⚡ 보스 반격 +150!", "#FDE047", 20);
                showFloat("⚡ 오타 마왕에게 스타 빔 명중!", "#FDE047");
              }
            }
          }
          updateBuffBadges();
        }
      }
      if (p.z > 1.2) state.pads.splice(i, 1);
    }

    // 엔티티(단어/파워업/적) 업데이트
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const o = state.entities[i];
      o.z += dt * 0.38 * sf * S.speed * speedMul;
      if (S.sway && o.kind === "enemy" && !state.practiceMode) {
        o.ph += dt * (1.1 + S.speed * 0.42);
        o.off = Math.sin(o.ph) * (S.sway || 0.3);
      }

      // 자석 또는 피버 활성화 시 바른 단어를 캐릭터 레인으로 끌어당김
      if (o.kind === "correct" && !o.collected && (state.magnetTimer > 0 || state.feverTimer > 0) && o.z >= 0.45) {
        o.lane += (state.lanePos - o.lane) * Math.min(1, dt * 6.5);
      }

      if (o.kind === "correct") {
        const oLane = o.lane + (o.off || 0);
        if (!o.collected && o.z >= 0.76 && o.z <= 0.96) {
          if (Math.abs(state.lanePos - oLane) < ((state.magnetTimer > 0 || state.feverTimer > 0) ? 0.92 : 0.56)) {
            collectWordEntity(o, S);
          }
        }
      } else if (o.kind === "shield" || o.kind === "magnet") {
        if (!o.collected && o.z >= 0.76 && o.z <= 0.96 && Math.abs(state.lanePos - o.lane) < 0.58) {
          o.collected = true;
          const anchor = getPlayerAnchor();
          AUDIO.powerup();
          if (o.kind === "shield") {
            state.shield = 1;
            spawnParts(anchor.x, anchor.y, 20, ["#38BDF8", "#BAE6FD", "#FFFFFF"]);
            addPopup(anchor.x, anchor.y - 40, "🫧 거품 보호막 획득!", "#38BDF8", 19);
            showFloat("🫧 거품 보호막! 1회 방어!", "#38BDF8");
          } else {
            state.magnetTimer = 6.5;
            spawnParts(anchor.x, anchor.y, 20, ["#EC4899", "#FDE047", "#FFFFFF"]);
            addPopup(anchor.x, anchor.y - 40, "🧲 단어 자석 작동!", "#F472B6", 19);
            showFloat("🧲 단어 자석! 바른 단어가 끌려와요!", "#F472B6");
          }
          updateBuffBadges();
        }
      } else if (o.kind === "enemy") {
        const oLane = o.lane + (o.off || 0);
        if (!o.hit && !o.passed && o.z >= 0.80 && o.z <= 0.91) {
          if (Math.abs(state.lanePos - oLane) < 0.5) {
            if (state.jumpTimer > 0) {
              o.passed = true;
              state.dodged++;
              state.totalDodged++;
              state.score += 40;
              AUDIO.dodge();
              addPopup(getPlayerAnchor().x, getPlayerAnchor().y - 40, "☁️ 뛰어넘기 +40!", "#BAE6FD", 18);
            } else if (state.feverTimer > 0 || state.boostTimer > 0 || state.railTimer > 0 || state.warpInvuln > 0) {
              o.hit = true;
              state.dodged++;
              state.totalDodged++;
              state.score += 50;
              AUDIO.dodge();
              spawnParts(o.screenX || W * 0.5, o.screenY || H * 0.75, 16, ["#22D3EE", "#FDE047"]);
              addPopup(getPlayerAnchor().x, getPlayerAnchor().y - 40, state.feverTimer > 0 ? "🔥 피버 격파 +50!" : "⚡ 무적 돌파 +50!", "#FDE047", 18);
            } else if (state.shield > 0) {
              o.hit = true;
              state.shield = 0;
              state.dodged++;
              state.totalDodged++;
              AUDIO.shieldBlock();
              spawnParts(getPlayerAnchor().x, getPlayerAnchor().y, 22, ["#38BDF8", "#FFFFFF"]);
              showFloat("🫧 보호막으로 안전 방어! (" + o.pair.correct + "이 맞아요)", "#38BDF8");
              updateBuffBadges();
            } else {
              o.hit = true;
              state.hit++;
              state.totalHit++;
              state.combo = 0;
              recordLearned(o.pair);
              recordMissed(o.pair);
              if (state.practiceMode) {
                state.stumble = 0.35;
                state.shake = 0;
                AUDIO.tap();
                setBanner("천천히 확인해요: '" + o.pair.correct + "'이 맞아요 (" + o.pair.tip + ")", "info");
                AUDIO.speak("괜찮아요. " + o.pair.correct + "이 맞는 말이에요.");
                showFloat("💡 '" + o.pair.correct + "'이 맞아요!", "#FDE047");
              } else {
                state.stumble = 1.15;
                state.shake = 0.35;
                AUDIO.hit();
                spawnParts(o.screenX || W * 0.5, o.screenY || H * 0.75, 18, ["#EF4444", "#FCA5A5", "#FDE047"]);
                setBanner("앗! '" + o.word + "'은 틀린 말! (" + o.pair.tip + ")", "warn");
                AUDIO.speak("조심! " + o.pair.tip);
                showFloat("💫 '" + o.pair.correct + "'이 맞아요!", "#FF5252");
              }
              updateBuffBadges();
            }
          }
        }
        if (!o.hit && !o.passed && o.z > 0.92) {
          o.passed = true;
          state.dodged++;
          state.totalDodged++;
          AUDIO.dodge();
        }
      }

      if (o.z > 1.22 || o.collected) {
        state.entities.splice(i, 1);
      }
    }

    updateParticles(dt, S);

    if (state.stageTime >= S.dur && !stageTransition && !state.stageClearWait) {
      if (state.stageIdx >= STAGES.length - 1) {
        enterResult();
      } else {
        if (window.D1Bridge) {
          window.D1Bridge.saveRecord({
            game: "safe_mover",
            stage: (state.stageIdx + 1) + "단계 클리어",
            score: state.collected,
            summary: S.name + " · 단어 " + state.collected + "개 · 회피 " + state.dodged + "회",
            payload: { stageIdx: state.stageIdx + 1, stageName: S.name, collected: state.collected, dodged: state.dodged, hit: state.hit, score: state.score }
          });
        }
        AUDIO.clear();
        AUDIO.speak("참 잘했어요! 버튼을 눌러 다음 코스로 가요!");
        showFloat("🎉 " + (state.stageIdx + 1) + "단계 클리어!", "#FFD600");
        enterStageTransition(state.stageIdx + 1);
      }
    }

    const p = Math.min(1, Math.max(0, state.stageTime / S.dur));
    document.getElementById("stageBar").style.width = (p * 100) + "%";
    document.getElementById("totalBar").style.width = (((state.stageIdx + p) / STAGES.length) * 100) + "%";
    const left = Math.max(0, Math.ceil(S.dur - state.stageTime));
    document.getElementById("stageStat").textContent =
      "⭐ " + state.score + "점 · ⭕ " + state.collected + "개 · 🛡️ " + state.dodged + "회 · " + left + "초";
    updateBuffBadges();
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    RENDERER.render(ctx, W, H, state);
    requestAnimationFrame(loop);
  }

  // 입력 바인딩
  document.getElementById("padL").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    goLeft();
  });
  document.getElementById("padR").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    goRight();
  });
  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state.paused || state.stageClearWait || state.finished || state.reviewOpen) return;
    swipeStart = { x: e.clientX, y: e.clientY, swiped: false };
  });
  cv.addEventListener("pointermove", (e) => {
    if (!swipeStart || swipeStart.swiped) return;
    if (state.paused || state.stageClearWait || state.finished || state.reviewOpen) return;
    const dx = e.clientX - swipeStart.x;
    if (Math.abs(dx) >= 26) {
      swipeStart.swiped = true;
      if (dx < 0) goLeft();
      else goRight();
    }
  });
  cv.addEventListener("pointerup", (e) => {
    if (!swipeStart) return;
    const s = swipeStart;
    swipeStart = null;
    if (!s.swiped && !state.paused && !state.stageClearWait && !state.finished && !state.reviewOpen) {
      handleCanvasTap(e.clientX, e.clientY);
    }
  });
  cv.addEventListener("pointercancel", () => { swipeStart = null; });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.reviewOpen) {
        closeReviewModal();
        return;
      }
      if (!state.finished && !state.stageClearWait) {
        e.preventDefault();
        togglePause();
      }
      return;
    }
    if (e.key === " ") {
      if (!state.finished && !state.stageClearWait && !state.reviewOpen) {
        e.preventDefault();
        togglePause();
      }
      return;
    }
    if (state.paused || state.stageClearWait || state.finished || state.reviewOpen) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") goLeft();
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") goRight();
    if (e.key === "r" || e.key === "R") restart();
  });

  document.getElementById("btnRestart").onclick = restart;
  document.getElementById("btnReview").onclick = () => openReviewModal("current");
  document.getElementById("btnSound").onclick = (e) => {
    const on = AUDIO.toggleSfx ? AUDIO.toggleSfx() : AUDIO.toggle();
    e.target.textContent = on ? "🔔 효과음 ON" : "🔕 효과음 OFF";
    e.target.classList.toggle("off", !on);
  };
  const btnVoice = document.getElementById("btnVoice");
  if (btnVoice) {
    btnVoice.onclick = () => {
      const on = AUDIO.toggleVoice ? AUDIO.toggleVoice() : true;
      syncModeButtons();
      if (on) AUDIO.speak("음성 안내가 켜졌어요.");
    };
  }
  const btnPractice = document.getElementById("btnPracticeMode");
  if (btnPractice) {
    btnPractice.onclick = () => {
      state.practiceMode = !state.practiceMode;
      if (state.practiceMode) {
        state.mirrorTimer = 0;
        state.mirrorWarn = 0;
        state.gravityTimer = 0;
        state.windWarn = 0;
        state.bossLaser = null;
        syncPadButtons();
      }
      AUDIO.setSlow && AUDIO.setSlow(state.practiceMode);
      if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
        window.D1Bridge.setSpedPrefs({ slowPace: state.practiceMode });
      }
      syncModeButtons();
      showFloat(state.practiceMode ? "🐢 천천히 연습 모드 ON" : "🐢 천천히 모드 OFF", "#38BDF8");
    };
  }
  const btnPause = document.getElementById("btnPause");
  if (btnPause) {
    btnPause.onclick = () => togglePause();
  }

  // 시작
  resize();
  applySpedPrefsFromBridge(window.D1Bridge && window.D1Bridge.getSpedPrefs ? window.D1Bridge.getSpedPrefs() : null);
  if (window.D1Bridge && window.D1Bridge.onSpedPrefsChange) {
    window.D1Bridge.onSpedPrefsChange(applySpedPrefsFromBridge);
  }
  syncModeButtons();
  startStage(0, false);
  setTimeout(resize, 100);
  AUDIO.speak("1단계! 읽걷이의 맞춤법 모험! 글자 요정 읽걷이를 움직여 바른 맞춤법 단어를 잡고, 틀린 단어를 든 적은 피하세요!");
  requestAnimationFrame(loop);
})();
