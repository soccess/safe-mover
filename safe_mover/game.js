"use strict";

/* ============================================================
   맞춤법 수호대 게임 컨트롤러
   - 바른 맞춤법 단어: 직접 터치(클릭)해서 수집!
   - 틀린 맞춤법 적: 좌/우 이동으로 피하기!
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

  let W = 0, H = 0;
  let lastTs = 0;
  let stageTransition = null;
  let windT = 4;
  let midIdx = 0;
  let spawnT = 1.0;
  let stepT = 0;
  let stepN = 0;

  const state = {
    stageIdx: 0,
    stageTime: 0,
    roadScroll: 0,
    lane: 0,
    lanePos: 0,
    laneFlash: 0,
    stumble: 0,
    entities: [],
    beams: [],
    parts: [],
    confetti: [],
    animT: 0,
    finished: false,
    collected: 0,
    totalCollected: 0,
    dodged: 0,
    totalDodged: 0,
    hit: 0,
    totalHit: 0,
    learnedWords: [] // { correct, wrong, tip }
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
    document.getElementById("totalLabel").textContent = (state.stageIdx + 1) + " / " + STAGES.length;
    document.getElementById("stageLabel").textContent = (state.stageIdx + 1) + "단계 " + STAGES[state.stageIdx].icon;
  }

  function spawnParts(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      state.parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 260,
        vy: -70 - Math.random() * 210,
        life: 1,
        c: colors[i % colors.length],
        s: 6 + Math.random() * 7
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
    if (!state.learnedWords.some((p) => p.correct === pair.correct)) {
      state.learnedWords.push(pair);
    }
  }

  function startStage(i, announce) {
    clearTimeout(stageTransition);
    stageTransition = null;
    state.stageIdx = i;
    state.stageTime = 0;
    state.entities = [];
    state.beams = [];
    state.lane = 0;
    state.lanePos = 0;
    state.stumble = 0;
    state.finished = false;
    state.collected = 0;
    state.dodged = 0;
    state.hit = 0;
    spawnT = 0.85;
    windT = 4;
    midIdx = 0;

    document.getElementById("overlay").style.display = "none";
    buildChips();
    const s = STAGES[i];
    setBanner((i + 1) + "단계 " + s.icon + " " + s.name + "! " + s.msg, "");
    if (announce !== false) AUDIO.speak((i + 1) + "단계! " + s.msg);
    updateLabels();
  }

  function restart() {
    AUDIO.tap();
    state.totalCollected = 0;
    state.totalDodged = 0;
    state.totalHit = 0;
    state.learnedWords = [];
    state.confetti = [];
    startStage(0);
  }

  function goLeft() {
    if (state.finished) return;
    if (state.lane > -1) {
      state.lane--;
      state.laneFlash = 0.24;
      AUDIO.lane();
    }
  }

  function goRight() {
    if (state.finished) return;
    if (state.lane < 1) {
      state.lane++;
      state.laneFlash = 0.24;
      AUDIO.lane();
    }
  }

  function getPlayerAnchor() {
    const S = STAGES[state.stageIdx] || STAGES[0];
    const nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const hw = topW + (botW - topW) * 0.86;
    return { x: W * 0.5 + state.lanePos * (hw * 0.62), y: H * 0.85 - 70 };
  }

  function handleCanvasTap(clientX, clientY) {
    if (state.finished) return;
    const r = cv.getBoundingClientRect();
    const tx = (clientX - r.left) * (W / r.width);
    const ty = (clientY - r.top) * (H / r.height);

    // 1. 바른 맞춤법 단어 터치 수집 확인 (가장 가까운 것 우선)
    let bestWord = null;
    let bestDist = Infinity;
    for (const o of state.entities) {
      if (o.kind !== "correct" || o.collected || o.screenX == null) continue;
      const d = Math.hypot(tx - o.screenX, ty - o.screenY);
      if (d <= o.screenR + 18 && d < bestDist) {
        bestDist = d;
        bestWord = o;
      }
    }

    if (bestWord) {
      bestWord.collected = true;
      state.collected++;
      state.totalCollected++;
      recordLearned(bestWord.pair);
      AUDIO.collect();
      const anchor = getPlayerAnchor();
      state.beams.push({ x1: anchor.x, y1: anchor.y, x2: bestWord.screenX, y2: bestWord.screenY, life: 1 });
      spawnParts(bestWord.screenX, bestWord.screenY, 20, ["#4ADE80", "#FDE047", "#FFFFFF", "#38BDF8"]);
      showFloat("⭕ '" + bestWord.word + "' 획득! +1", "#4ADE80");
      setBanner("잘했어요! '" + bestWord.word + "' — " + bestWord.pair.tip, "good");
      return;
    }

    // 2. 틀린 단어 적을 실수로 터치했는지 확인
    for (const o of state.entities) {
      if (o.kind !== "enemy" || o.hit || o.screenX == null) continue;
      const d = Math.hypot(tx - o.screenX, ty - o.screenY);
      if (d <= o.screenR + 10) {
        AUDIO.wrongTap();
        showFloat("❌ '" + o.word + "'은 틀린 말! 피하세요!", "#FF5252");
        setBanner("'" + o.word + "'은 틀린 맞춤법! 좌우로 피하세요! (" + o.pair.tip + ")", "warn");
        return;
      }
    }

    // 3. 빈 공간 터치 -> 좌/우 레인 이동
    if (tx < W / 2) goLeft();
    else goRight();
  }

  function spawnWave(S) {
    const pool = WORDS.getForStage(state.stageIdx);
    const pair = pool[Math.floor(Math.random() * pool.length)];
    const lanes = [-1, 0, 1];

    // 48% 확률로 바른 단어 + 적 함께 등장, 또는 번갈아 등장
    const roll = Math.random();
    if (roll < 0.48) {
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
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
    } else if (roll < 0.78) {
      // 틀린 단어 적 등장 (일부 스테이지는 2명 동시)
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
      if (S.double && Math.random() < S.double) {
        const pair2 = pool[Math.floor(Math.random() * pool.length)];
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
      // 바른 단어 단독 등장
      const wLane = lanes[Math.floor(Math.random() * 3)];
      state.entities.push({
        kind: "correct",
        word: pair.correct,
        pair,
        lane: wLane,
        z: 0.02,
        collected: false,
        ph: Math.random() * 6.28,
        off: 0
      });
    }
  }

  function updateParticles(dt, S) {
    state.parts = state.parts.filter((p) => {
      p.life -= dt * 1.4;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 460 * dt;
      return p.life > 0 && p.y < H + 20;
    });
    state.beams = state.beams.filter((b) => {
      b.life -= dt * 3.5;
      return b.life > 0;
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
        vx: (S.sand ? 120 : 0) + (Math.random() - 0.5) * 40,
        vy: 80 + Math.random() * 160,
        life: 2.5,
        c: S.rain ? "#4FC3F7" : (S.snow ? "#FFFFFF" : (S.sand ? "#FFD54F" : "#FF8A65")),
        s: 3 + Math.random() * 4,
        rain: !!S.rain
      });
    }
  }

  function enterResult() {
    state.finished = true;
    AUDIO.fanfare();
    burstConfetti(120);
    AUDIO.speak("미션 완료! 바른 맞춤법 단어를 정말 많이 모았어요!");
    setBanner("미션 완료! 맞춤법 수호대 대성공!", "good");
    document.getElementById("totalBar").style.width = "100%";
    document.getElementById("stageBar").style.width = "100%";

    const reviewHtml = state.learnedWords.slice(0, 8).map((p) =>
      '<div class="reviewItem">⭕ <b>' + p.correct + '</b> (❌ ' + p.wrong + ') — ' + p.tip + '</div>'
    ).join("") || '<div class="reviewItem">바른 단어를 터치해 맞춤법을 익혀 보세요!</div>';

    document.getElementById("card").innerHTML =
      '<div style="font-size:52px">🏆</div>' +
      '<div style="background:#16A34A;color:#fff;display:inline-block;border-radius:8px;padding:4px 12px;font-weight:900;font-size:13px">💮 맞춤법 수호대 마스터 스탬프!</div>' +
      "<h1>맞춤법 대작전 성공!</h1>" +
      '<div style="font-weight:800;color:#0D47A1;margin:6px 0">' + STAGES.length + "개 테마 코스 완주!</div>" +
      '<div class="row"><span>⭕ 터치해서 모은 바른 단어</span><span>' + state.totalCollected + "개</span></div>" +
      '<div class="row"><span>✨ 오타 적 안전 회피</span><span>' + state.totalDodged + "회</span></div>" +
      '<div class="row"><span>💫 오타 적과 부딪힘</span><span>' + state.totalHit + "회</span></div>" +
      '<div class="reviewBox"><h3>📖 오늘 익힌 맞춤법 복습</h3>' + reviewHtml + "</div>" +
      '<button id="bigBtn">↻ 처음부터 다시 놀기</button>';

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("bigBtn").onclick = restart;

    if (window.TursoBridge) {
      window.TursoBridge.saveRecord({
        game: "safe_mover",
        stage: STAGES.length + "단계 완주",
        score: state.totalCollected,
        summary: "바른 단어 " + state.totalCollected + "개 · 회피 " + state.totalDodged + "회 · 부딪힘 " + state.totalHit + "회",
        payload: {
          collected: state.totalCollected,
          dodged: state.totalDodged,
          hit: state.totalHit,
          learnedWords: state.learnedWords.slice(0, 20)
        }
      });
    }
  }

  function update(dt) {
    state.animT += dt;
    if (state.finished) {
      updateParticles(dt, STAGES[STAGES.length - 1]);
      return;
    }

    const S = STAGES[state.stageIdx];
    state.laneFlash = Math.max(0, state.laneFlash - dt);
    const sf = state.stumble > 0 ? 0.5 : 1;
    if (state.stumble > 0) {
      state.stumble -= dt;
      if (state.stumble <= 0) {
        setBanner("전방 주시! 바른 단어는 터치하고, 오타 적은 피해요!", "");
      }
    }

    state.stageTime += dt * sf;
    state.roadScroll = (state.roadScroll + dt * 2.4 * sf * S.speed) % 1;
    const lerpK = S.slippery ? 5.5 : 10;
    state.lanePos += (state.lane - state.lanePos) * Math.min(1, dt * lerpK);

    if (S.wind) {
      windT -= dt * sf;
      if (windT <= 0) {
        windT = 5.5 + Math.random() * 4;
        const dir = Math.random() < 0.5 ? -1 : 1;
        state.lanePos += dir * 0.35;
        AUDIO.tone(180, 90, 0.45, "sawtooth", 0.18);
        showFloat(dir < 0 ? "🌪️ 강풍! → 버텨요!" : "🌪️ 강풍! ← 버텨요!", "#FFAB40");
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
      if (state.stumble <= 0 && state.stageTime < S.dur - 0.5) AUDIO.step(stepN);
    }

    const remain = S.dur - state.stageTime;
    if (remain > 2.5) {
      spawnT -= dt * sf;
      if (spawnT <= 0) {
        spawnWave(S);
        spawnT = S.spawn * (0.85 + Math.random() * 0.35);
      }
    }

    for (let i = state.entities.length - 1; i >= 0; i--) {
      const o = state.entities[i];
      o.z += dt * 0.38 * sf * S.speed;
      if (S.sway && o.kind === "enemy") {
        o.ph += dt * (1.1 + S.speed * 0.45);
        o.off = Math.sin(o.ph) * (S.sway || 0.3);
      }

      if (o.kind === "enemy") {
        const oLane = o.lane + (o.off || 0);
        if (!o.hit && !o.passed && o.z >= 0.80 && o.z <= 0.91) {
          if (Math.abs(state.lanePos - oLane) < 0.5) {
            o.hit = true;
            state.hit++;
            state.totalHit++;
            state.stumble = 1.2;
            recordLearned(o.pair);
            AUDIO.hit();
            setBanner("앗! '" + o.word + "'은 틀린 말! (" + o.pair.tip + ")", "warn");
            AUDIO.speak("조심! " + o.pair.tip);
            showFloat("💫 '" + o.pair.correct + "'이 맞아요!", "#FF5252");
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

    if (state.stageTime >= S.dur && !stageTransition) {
      if (state.stageIdx >= STAGES.length - 1) {
        enterResult();
      } else {
        if (window.TursoBridge) {
          window.TursoBridge.saveRecord({
            game: "safe_mover",
            stage: (state.stageIdx + 1) + "단계 클리어",
            score: state.collected,
            summary: S.name + " · 단어 " + state.collected + "개 · 회피 " + state.dodged + "회",
            payload: { stageIdx: state.stageIdx + 1, stageName: S.name, collected: state.collected, dodged: state.dodged, hit: state.hit }
          });
        }
        AUDIO.clear();
        AUDIO.speak("참 잘했어요! 다음 코스로 갑니다!");
        showFloat("🎉 " + (state.stageIdx + 1) + "단계 클리어!", "#FFD600");
        stageTransition = setTimeout(() => {
          if (!state.finished) startStage(state.stageIdx + 1);
        }, 1350);
      }
    }

    const p = Math.min(1, Math.max(0, state.stageTime / S.dur));
    document.getElementById("stageBar").style.width = (p * 100) + "%";
    document.getElementById("totalBar").style.width = (((state.stageIdx + p) / STAGES.length) * 100) + "%";
    const left = Math.max(0, Math.ceil(S.dur - state.stageTime));
    document.getElementById("stageStat").textContent =
      "⭕ 단어 " + state.collected + "개 · 🛡️ 회피 " + state.dodged + "회 · " + left + "초";
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
  document.getElementById("padL").addEventListener("pointerdown", (e) => { e.preventDefault(); goLeft(); });
  document.getElementById("padR").addEventListener("pointerdown", (e) => { e.preventDefault(); goRight(); });
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); handleCanvasTap(e.clientX, e.clientY); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") goLeft();
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") goRight();
    if (e.key === "r" || e.key === "R") restart();
  });
  document.getElementById("btnRestart").onclick = restart;
  document.getElementById("btnSound").onclick = (e) => {
    const on = AUDIO.toggle();
    e.target.textContent = on ? "🔊 효과음 ON" : "🔇 효과음 OFF";
  };

  // 시작
  resize();
  startStage(0, false);
  setTimeout(resize, 100);
  AUDIO.speak("1단계! 바른 맞춤법 단어는 터치해서 모으고, 틀린 단어를 든 적은 피하세요!");
  requestAnimationFrame(loop);
})();
