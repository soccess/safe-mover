"use strict";

/* ============================================================
   넘버 아일랜드 메인 아케이드 컨트롤러
   ============================================================ */
(() => {
  const E = window.MathArcadeEngine;
  const A = window.MathArcadeAudio;
  const STAGES = [...(window.MathStagesPart1 || []), ...(window.MathStagesPart2 || [])];

  const STARS_KEY = "stepmath.arcade.stars.v1";
  const cv = document.getElementById("gameCanvas");
  const ctx = cv.getContext("2d");

  const mapOverlay = document.getElementById("mapOverlay");
  const worldGrid = document.getElementById("worldGrid");
  const totalStarsPill = document.getElementById("totalStarsPill");
  const resultOverlay = document.getElementById("resultOverlay");
  const missionChip = document.getElementById("missionChip");
  const missionTag = document.getElementById("missionTag");
  const missionText = document.getElementById("missionText");
  const floatBanner = document.getElementById("floatBanner");
  const touchPad = document.getElementById("touchPad");
  const padLeft = document.getElementById("padLeft");
  const padRight = document.getElementById("padRight");
  const padAction = document.getElementById("padAction");

  const hudStageIcon = document.getElementById("hudStageIcon");
  const hudStageName = document.getElementById("hudStageName");
  const hudWaveTxt = document.getElementById("hudWaveTxt");
  const hudWaveFill = document.getElementById("hudWaveFill");
  const hudHearts = document.getElementById("hudHearts");
  const hudScore = document.getElementById("hudScore");
  const hudCombo = document.getElementById("hudCombo");

  const btnSlow = document.getElementById("btnSlow");
  const btnMusic = document.getElementById("btnMusic");
  const btnSfx = document.getElementById("btnSfx");
  const btnVoice = document.getElementById("btnVoice");
  const btnFullscreen = document.getElementById("btnFullscreen");

  let viewScale = 1;
  let viewOffX = 0;
  let viewOffY = 0;
  let canvasW = 960;
  let canvasH = 560;

  let currentIdx = 0;
  let activeStage = null;
  let playing = false;
  let slowMode = false;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let hearts = 3;
  let lastTs = 0;
  let toastTimer = null;
  let starsMap = {};

  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    leftJustPressed: false,
    rightJustPressed: false,
    upJustPressed: false,
    downJustPressed: false,
    jumpJustPressed: false,
    pointerDown: false,
    pointerId: null,
    px: 0,
    py: 0
  };

  function loadStars() {
    try {
      const raw = localStorage.getItem(STARS_KEY);
      if (raw) starsMap = JSON.parse(raw) || {};
    } catch (_) { starsMap = {}; }
  }

  function saveStars() {
    try { localStorage.setItem(STARS_KEY, JSON.stringify(starsMap)); } catch (_) {}
  }

  function resizeCanvas() {
    const rect = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = Math.max(320, Math.floor(rect.width));
    canvasH = Math.max(240, Math.floor(rect.height));
    cv.width = Math.floor(canvasW * dpr);
    cv.height = Math.floor(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    viewScale = Math.min(canvasW / E.VW, canvasH / E.VH);
    viewOffX = (canvasW - E.VW * viewScale) / 2;
    viewOffY = (canvasH - E.VH * viewScale) / 2;
  }

  function toWorld(clientX, clientY) {
    const rect = cv.getBoundingClientRect();
    const x = (clientX - rect.left - viewOffX) / viewScale;
    const y = (clientY - rect.top - viewOffY) / viewScale;
    return {
      x: E.clamp(x, 0, E.VW),
      y: E.clamp(y, 0, E.VH)
    };
  }

  function updateHud() {
    const st = STAGES[currentIdx];
    if (st) {
      hudStageIcon.textContent = st.icon;
      hudStageName.textContent = `${st.id}단계 ${st.name}`;
    }
    hudHearts.textContent = "❤️".repeat(Math.max(0, hearts)) + "🤍".repeat(Math.max(0, 3 - hearts));
    hudScore.textContent = String(score);
    if (combo >= 2) {
      hudCombo.hidden = false;
      hudCombo.textContent = `🔥 x${combo}`;
    } else {
      hudCombo.hidden = true;
    }
  }

  function renderWorldMap() {
    let totalStars = 0;
    worldGrid.innerHTML = STAGES.map((st, idx) => {
      const s = starsMap[st.id] || 0;
      totalStars += s;
      const starStr = "⭐".repeat(s) + "☆".repeat(3 - s);
      return `
        <button type="button" class="world-card${idx === currentIdx ? " current" : ""}" data-stage-idx="${idx}">
          <div class="wc-top">
            <span class="wc-icon">${st.icon}</span>
            <span class="wc-stars">${starStr}</span>
          </div>
          <span class="wc-num">STAGE ${st.id}</span>
          <div class="wc-title">${st.name}</div>
          <div class="wc-desc">${st.desc}</div>
          <div class="wc-tags">
            <span class="wc-tag">${st.tags[0]}</span>
            <span class="wc-tag math">${st.tags[1]}</span>
          </div>
        </button>`;
    }).join("");
    totalStarsPill.textContent = `⭐ ${totalStars} / ${STAGES.length * 3}`;
  }

  function openMap() {
    playing = false;
    missionChip.hidden = true;
    touchPad.hidden = true;
    resultOverlay.hidden = true;
    renderWorldMap();
    mapOverlay.hidden = false;
  }

  function showToast(msg) {
    floatBanner.textContent = msg;
    floatBanner.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { floatBanner.hidden = true; }, 1650);
  }

  function createStageApi() {
    return {
      E,
      A,
      setMission(tag, text) {
        missionTag.textContent = tag;
        missionText.textContent = text;
        missionChip.hidden = false;
      },
      setWave(w, total, prog01) {
        hudWaveTxt.textContent = `WAVE ${w}/${total}`;
        hudWaveFill.style.width = `${Math.round(E.clamp(prog01, 0, 1) * 100)}%`;
      },
      addScore(pts, x, y, label) {
        const mult = Math.max(1, Math.min(3, 1 + Math.floor(combo / 3)));
        const add = pts * mult;
        score += add;
        updateHud();
        if (label) E.spawnPopup(x, y, label, "#fde047", 21);
        else if (x !== undefined) E.spawnPopup(x, y, `+${add}`, "#4ade80", 18);
      },
      addCombo() {
        combo += 1;
        if (combo > maxCombo) maxCombo = combo;
        updateHud();
        return combo;
      },
      resetCombo() {
        combo = 0;
        updateHud();
      },
      damage(msg) {
        if (!playing) return;
        hearts = Math.max(0, hearts - 1);
        combo = 0;
        updateHud();
        if (msg) showToast(msg);
        if (hearts <= 0) {
          finishStage(false);
        }
      },
      toast: showToast,
      winStage() {
        finishStage(true);
      }
    };
  }

  function saveD1Record(cleared, earnedStars) {
    const st = STAGES[currentIdx];
    if (!window.D1Bridge || !st) return;
    try {
      window.D1Bridge.saveRecord({
        game: "stepmath",
        stage: `${st.id}단계 ${st.name}`,
        score,
        summary: cleared
          ? `클리어 ⭐${earnedStars} · ${score}점 (최고 ${maxCombo}콤보)`
          : `도전 종료 · ${score}점`,
        payload: {
          stageId: st.id,
          cleared,
          stars: earnedStars,
          score,
          maxCombo,
          heartsLeft: hearts
        }
      });
    } catch (_) {}
  }

  function finishStage(cleared) {
    if (!playing) return;
    playing = false;
    missionChip.hidden = true;
    touchPad.hidden = true;

    const st = STAGES[currentIdx];
    const earned = cleared ? Math.max(1, hearts) : 0;
    if (cleared) {
      A.play("clear");
      E.spawnConfetti(60);
      starsMap[st.id] = Math.max(starsMap[st.id] || 0, earned);
      saveStars();
    } else {
      A.play("hurt");
    }
    saveD1Record(cleared, earned);

    document.getElementById("resStars").textContent = cleared
      ? "⭐".repeat(earned) + "☆".repeat(3 - earned)
      : "💥 다시 도전!";
    document.getElementById("resTitle").textContent = cleared
      ? `${st.icon} ${st.name} 클리어!`
      : `${st.icon} 하트가 모두 떨어졌어요!`;
    document.getElementById("resSub").textContent = cleared
      ? `멋진 액션으로 [${st.tags[1]}] 마스터!`
      : `조금만 더 피하고 맞히면 바로 클리어할 수 있어요!`;
    document.getElementById("resStats").innerHTML = `
      <div class="res-stat"><b>${score}</b><span>최종 점수</span></div>
      <div class="res-stat"><b>x${maxCombo}</b><span>최고 콤보</span></div>
      <div class="res-stat"><b>${"❤️".repeat(hearts) || "0"}</b><span>남은 하트</span></div>`;
    document.getElementById("btnResNext").hidden = currentIdx >= STAGES.length - 1;
    resultOverlay.hidden = false;
  }

  function startStage(idx) {
    A.unlock();
    currentIdx = E.clamp(idx, 0, STAGES.length - 1);
    const st = STAGES[currentIdx];
    E.clearFx();
    score = 0;
    combo = 0;
    maxCombo = 0;
    hearts = 3;
    playing = true;
    mapOverlay.hidden = true;
    resultOverlay.hidden = true;
    floatBanner.hidden = true;

    // 터치패드 설정
    if (st.useTouchPad) {
      const labels = st.padLabels || ["◀", "▶", "⬆️ 점프!"];
      padLeft.textContent = labels[0];
      padRight.textContent = labels[1];
      padAction.textContent = labels[2];
      touchPad.hidden = false;
    } else {
      touchPad.hidden = true;
    }

    updateHud();
    const api = createStageApi();
    activeStage = st.create(api);
    if (activeStage && typeof activeStage.init === "function") activeStage.init();
  }

  /* ---------- 입력 이벤트 바인딩 ---------- */
  cv.addEventListener("pointerdown", (ev) => {
    A.unlock();
    if (!playing || !activeStage) return;
    cv.setPointerCapture(ev.pointerId);
    const pt = toWorld(ev.clientX, ev.clientY);
    input.pointerDown = true;
    input.pointerId = ev.pointerId;
    input.px = pt.x;
    input.py = pt.y;
    if (activeStage.onPointerDown) activeStage.onPointerDown(pt.x, pt.y);
  });

  cv.addEventListener("pointermove", (ev) => {
    if (!playing || !activeStage || !input.pointerDown || ev.pointerId !== input.pointerId) return;
    const pt = toWorld(ev.clientX, ev.clientY);
    if (activeStage.onPointerMove) activeStage.onPointerMove(pt.x, pt.y, input.px, input.py);
    input.px = pt.x;
    input.py = pt.y;
  });

  function endPointer(ev) {
    if (!input.pointerDown || ev.pointerId !== input.pointerId) return;
    const pt = toWorld(ev.clientX, ev.clientY);
    input.pointerDown = false;
    input.pointerId = null;
    if (playing && activeStage && activeStage.onPointerUp) activeStage.onPointerUp(pt.x, pt.y);
  }
  cv.addEventListener("pointerup", endPointer);
  cv.addEventListener("pointercancel", endPointer);

  // 키보드 입력
  window.addEventListener("keydown", (ev) => {
    if (!playing) return;
    if (ev.code === "ArrowLeft" || ev.code === "KeyA") {
      if (!input.left) input.leftJustPressed = true;
      input.left = true;
    } else if (ev.code === "ArrowRight" || ev.code === "KeyD") {
      if (!input.right) input.rightJustPressed = true;
      input.right = true;
    } else if (ev.code === "ArrowUp" || ev.code === "KeyW") {
      if (!input.up) input.upJustPressed = true;
      input.up = true;
      input.jumpJustPressed = true;
    } else if (ev.code === "ArrowDown" || ev.code === "KeyS") {
      if (!input.down) input.downJustPressed = true;
      input.down = true;
    } else if (ev.code === "Space") {
      ev.preventDefault();
      input.jumpJustPressed = true;
      if (activeStage && activeStage.onActionPress) activeStage.onActionPress();
    }
  });

  window.addEventListener("keyup", (ev) => {
    if (ev.code === "ArrowLeft" || ev.code === "KeyA") input.left = false;
    else if (ev.code === "ArrowRight" || ev.code === "KeyD") input.right = false;
    else if (ev.code === "ArrowUp" || ev.code === "KeyW") input.up = false;
    else if (ev.code === "ArrowDown" || ev.code === "KeyS") input.down = false;
  });

  // 태블릿 터치패드 버튼 바인딩
  function bindPadHold(btn, prop, justProp) {
    const down = (e) => {
      e.preventDefault();
      A.unlock();
      if (!input[prop]) input[justProp] = true;
      input[prop] = true;
      btn.classList.add("active");
    };
    const up = (e) => {
      e.preventDefault();
      input[prop] = false;
      btn.classList.remove("active");
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  }
  bindPadHold(padLeft, "left", "leftJustPressed");
  bindPadHold(padRight, "right", "rightJustPressed");
  padAction.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    A.unlock();
    input.jumpJustPressed = true;
    padAction.classList.add("active");
    if (playing && activeStage && activeStage.onActionPress) activeStage.onActionPress();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((evName) => {
    padAction.addEventListener(evName, () => padAction.classList.remove("active"));
  });

  /* ---------- HUD & 오버레이 버튼 ---------- */
  document.getElementById("btnMap").addEventListener("click", openMap);
  document.getElementById("btnStageInfo").addEventListener("click", openMap);
  document.getElementById("btnPrevStage").addEventListener("click", () => {
    startStage((currentIdx - 1 + STAGES.length) % STAGES.length);
  });
  document.getElementById("btnNextStage").addEventListener("click", () => {
    startStage((currentIdx + 1) % STAGES.length);
  });
  document.getElementById("btnRestart").addEventListener("click", () => startStage(currentIdx));
  document.getElementById("btnQuickPlay").addEventListener("click", () => startStage(currentIdx));
  document.getElementById("btnResMap").addEventListener("click", openMap);
  document.getElementById("btnResRetry").addEventListener("click", () => startStage(currentIdx));
  document.getElementById("btnResNext").addEventListener("click", () => startStage(currentIdx + 1));

  worldGrid.addEventListener("click", (ev) => {
    const card = ev.target.closest("[data-stage-idx]");
    if (!card) return;
    startStage(Number(card.dataset.stageIdx) || 0);
  });

  btnSlow.addEventListener("click", () => {
    slowMode = !slowMode;
    btnSlow.classList.toggle("on", slowMode);
    btnSlow.textContent = slowMode ? "🐢 천천히 ON" : "🐢 천천히 OFF";
  });

  btnMusic.addEventListener("click", () => {
    const next = !A.isMusic();
    A.setMusic(next);
    btnMusic.classList.toggle("on", next);
    btnMusic.textContent = next ? "🎵 음악 ON" : "🔇 음악 OFF";
  });

  btnSfx.addEventListener("click", () => {
    const next = !A.isSfx();
    A.setSfx(next);
    btnSfx.classList.toggle("on", next);
    btnSfx.textContent = next ? "🔔 소리 ON" : "🔕 소리 OFF";
  });

  btnVoice.addEventListener("click", () => {
    const next = !A.isVoice();
    A.setVoice(next);
    btnVoice.classList.toggle("on", next);
    btnVoice.textContent = next ? "🗣️ 음성 ON" : "🤫 음성 OFF";
  });

  if (btnFullscreen && window.D1Bridge && window.D1Bridge.bindFullscreenButton) {
    window.D1Bridge.bindFullscreenButton(btnFullscreen, {
      enterText: "⛶ 전체화면",
      exitText: "⛶ 창모드",
      activeClass: "on"
    });
  }

  /* ---------- 메인 60fps 게임 루프 ---------- */
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    const dt = rawDt * (slowMode ? 0.62 : 1.0);

    if (playing && activeStage) {
      activeStage.update(dt, input);
    }
    E.updateFx(rawDt);

    // 1프레임 플래그 초기화
    input.leftJustPressed = false;
    input.rightJustPressed = false;
    input.upJustPressed = false;
    input.downJustPressed = false;
    input.jumpJustPressed = false;

    // 캔버스 전체 배경 채우기 (레터박스 공간도 자연스럽게)
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.save();
    const sx = E.fx.shake ? (Math.random() - 0.5) * E.fx.shake : 0;
    const sy = E.fx.shake ? (Math.random() - 0.5) * E.fx.shake : 0;
    ctx.translate(viewOffX + sx, viewOffY + sy);
    ctx.scale(viewScale, viewScale);

    // 가상 뷰포트 클리핑
    ctx.beginPath();
    ctx.rect(0, 0, E.VW, E.VH);
    ctx.clip();

    if (activeStage && activeStage.draw) {
      activeStage.draw(ctx);
    } else {
      E.drawSkyBackdrop(ctx, "#1e3a8a", "#0f172a", ts * 0.001, "space");
    }
    E.drawFx(ctx);

    if (E.fx.flashAlpha > 0) {
      ctx.fillStyle = E.fx.flashColor;
      ctx.globalAlpha = E.fx.flashAlpha;
      ctx.fillRect(0, 0, E.VW, E.VH);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    requestAnimationFrame(loop);
  }

  /* ---------- 초기화 ---------- */
  loadStars();
  if (window.D1Bridge && typeof window.D1Bridge.getSpedPrefs === "function") {
    const sp = window.D1Bridge.getSpedPrefs();
    if (sp && sp.slowPace) {
      slowMode = true;
      btnSlow.classList.add("on");
      btnSlow.textContent = "🐢 천천히 ON";
    }
    if (sp && typeof sp.ttsAuto === "boolean") {
      A.setVoice(sp.ttsAuto);
      btnVoice.classList.toggle("on", sp.ttsAuto);
      btnVoice.textContent = sp.ttsAuto ? "🗣️ 음성 ON" : "🤫 음성 OFF";
    }
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  renderWorldMap();
  openMap();
  requestAnimationFrame(loop);
})();
