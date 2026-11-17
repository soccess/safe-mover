"use strict";

/* ============================================================
   화려한 2.5D 커브 · 언덕 · 중력 반전 · 보스전 캔버스 렌더러
   ============================================================ */
window.SafeMoverRenderer = (() => {
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  }

  function txt(ctx, s, x, y, size, color, stroke) {
    ctx.font = "900 " + size + 'px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (stroke) {
      ctx.lineWidth = Math.max(2, size / 6);
      ctx.lineJoin = "round";
      ctx.strokeStyle = stroke;
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
  }

  function drawStar(ctx, x, y, r, spikes, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = i * step - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     통합 2.5D 트랙 투영 함수 (커브 · 언덕 · 중력 반전 일원화)
     ------------------------------------------------------------ */
  function project(W, H, S, state, z, laneOffset) {
    const nw = S.narrow || 1;
    const topW = W * 0.1 * nw;
    const botW = W * 0.44 * nw;
    const zClamped = Math.min(1.25, Math.max(0, z));
    const pz = Math.pow(zClamped, 2);

    const practiceMul = state && state.practiceMode ? 0.35 : 1;
    const curveAmp = (S.curveAmp || 0) * practiceMul;
    const hillAmp = (S.hillAmp || 0) * practiceMul;
    const trackPhase = state ? (state.trackPhase || 0) : 0;
    const hillPhase = state ? (state.hillPhase || 0) : 0;
    const flipBlend = state ? (state.flipBlend || 0) : 0;

    const curveShift = Math.sin(trackPhase) * curveAmp * W * Math.pow(Math.max(0, 1 - zClamped * 0.92), 1.85);
    const horizonWave = Math.sin(hillPhase) * hillAmp * H;
    const hyBase = H * 0.36 + horizonWave;
    const hillWave = Math.sin(hillPhase + (1 - zClamped) * 2.5) * hillAmp * H * Math.max(0, 1 - zClamped * 0.85);

    const yBase = hyBase + (H * 0.85 - hyBase) * pz + hillWave * 0.55;
    const y = yBase * (1 - flipBlend) + (H - yBase) * flipBlend;
    const hy = hyBase * (1 - flipBlend) + (H - hyBase) * flipBlend;
    const hw = topW + (botW - topW) * pz;
    const cx = W * 0.5 + curveShift;
    const x = cx + (laneOffset || 0) * (hw * 0.62);
    const sc = Math.max(0.22, 0.24 + 0.88 * pz);

    return { x, y, sc, cx, hw, hy, yBase, pz, flipBlend };
  }

  /* ------------------------------------------------------------
     1. 스테이지별 다층 하늘 & 원경 배경 (중력 반전 대응)
     ------------------------------------------------------------ */
  function drawStageBG(ctx, W, H, S, state) {
    const { stageIdx, animT, flipBlend = 0 } = state;
    const horizonPt = project(W, H, S, state, 0, 0);
    const hy = horizonPt.hy;
    const flipped = flipBlend > 0.5;

    // 하늘 영역과 지상 영역
    const skyTop = flipped ? hy : 0;
    const skyBot = flipped ? H : hy;
    const gndTop = flipped ? 0 : hy;
    const gndBot = flipped ? hy : H;

    let g = ctx.createLinearGradient(0, skyTop, 0, skyBot);
    g.addColorStop(0, S.sky[0]);
    g.addColorStop(1, S.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.min(skyTop, skyBot), W, Math.abs(skyBot - skyTop) + 2);

    // 지평선 대기 글로우
    const horizonGlow = ctx.createLinearGradient(0, flipped ? hy + 80 : hy - 80, 0, hy);
    horizonGlow.addColorStop(0, "rgba(255,255,255,0)");
    horizonGlow.addColorStop(1, S.night ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.42)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, flipped ? hy : Math.max(0, hy - 80), W, 80);

    // 무지개 아치
    if (S.roadStyle === "rainbow" || S.roadStyle === "cloud") {
      const cols = ["#FCA5A5", "#FDBA74", "#FDE047", "#86EFAC", "#7DD3FC", "#C4B5FD"];
      ctx.save();
      ctx.globalAlpha = 0.35;
      cols.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(horizonPt.cx, hy + (flipped ? -18 : 18), Math.min(W, H) * 0.42 - idx * 7, flipped ? 0 : Math.PI, flipped ? Math.PI : 0);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 야간/우주/숲 별빛 또는 낮 태양/구름
    const celestialY = flipped ? H - Math.min(H * 0.25, 90) : Math.max(42, hy * 0.32);
    if (S.night || S.roadStyle === "forest") {
      const mx = W * 0.84;
      const glow = ctx.createRadialGradient(mx, celestialY, 8, mx, celestialY, 80);
      glow.addColorStop(0, "rgba(255,249,196,0.82)");
      glow.addColorStop(0.5, "rgba(196,181,253,0.28)");
      glow.addColorStop(1, "rgba(255,249,196,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, celestialY, 80, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.stars ? "#EDE9FE" : "#FEF08A";
      ctx.beginPath(); ctx.arc(mx, celestialY, S.stars ? 20 : 25, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < (S.stars ? 48 : 24); i++) {
        const x = (i * 197 + animT * (S.stars ? 4 : 8)) % W;
        const y = Math.min(skyTop, skyBot) + 10 + (i * 53) % Math.max(30, Math.abs(skyBot - skyTop) - 22);
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(animT * 2.6 + i));
        ctx.globalAlpha = tw;
        ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 2.6 : 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (S.stars) {
        const pulse = 1 + Math.sin(animT * 2) * 0.08;
        ctx.fillStyle = "rgba(167,139,250,0.28)";
        ctx.beginPath(); ctx.arc(W * 0.18, celestialY + 20, 44 * pulse, 0, Math.PI * 2); ctx.fill();
        txt(ctx, "🪐", W * 0.18, celestialY + 20, 38 * pulse, "#fff", "rgba(0,0,0,.3)");
      }
    } else {
      const sx = W * 0.84;
      const sg = ctx.createRadialGradient(sx, celestialY, 10, sx, celestialY, 86);
      sg.addColorStop(0, "rgba(255,245,157,0.9)");
      sg.addColorStop(0.55, "rgba(253,186,116,0.28)");
      sg.addColorStop(1, "rgba(255,235,59,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, celestialY, 86, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.sand ? "#F59E0B" : "#FDE047";
      ctx.beginPath(); ctx.arc(sx, celestialY, 25, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = S.rain ? "rgba(226,232,240,0.65)" : "rgba(255,255,255,0.88)";
      for (let i = 0; i < 4; i++) {
        const x = ((i * W / 3.4 + animT * (14 + i * 4)) % (W + 160)) - 80;
        const y = (flipped ? hy + 26 : 30) + i * 16;
        ctx.beginPath();
        ctx.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 20, y + 4, 22, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 22, y + 3, 24, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 원경 스카이라인 / 산맥 (커브 위상과 약하게 패럴랙스 연동)
    const paraX = Math.sin(state.trackPhase || 0) * -28;
    const dirY = flipped ? 1 : -1;
    ctx.fillStyle = S.night ? "#1E1B4B" : (S.roadStyle === "coral" ? "rgba(14,116,144,0.5)" : "rgba(100,181,246,0.45)");
    ctx.beginPath();
    ctx.moveTo(0, hy);
    if (S.roadStyle === "neon") {
      const bars = [0.07, 0.14, 0.22, 0.31, 0.41, 0.54, 0.66, 0.77, 0.88, 1.0];
      let px = 0;
      bars.forEach((b, idx) => {
        const bh = 32 + ((idx * 41) % 62);
        ctx.lineTo(px + paraX * 0.2, hy + dirY * bh);
        ctx.lineTo(W * b + paraX * 0.2, hy + dirY * bh);
        px = W * b;
      });
    } else if (S.roadStyle === "sand") {
      ctx.lineTo(W * 0.1 + paraX, hy + dirY * 82); ctx.lineTo(W * 0.22 + paraX, hy + dirY * 22);
      ctx.lineTo(W * 0.36 + paraX, hy + dirY * 94); ctx.lineTo(W * 0.52 + paraX, hy + dirY * 30);
      ctx.lineTo(W * 0.68 + paraX, hy + dirY * 86); ctx.lineTo(W * 0.84 + paraX, hy + dirY * 26);
      ctx.lineTo(W, hy + dirY * 62);
    } else {
      ctx.lineTo(W * 0.14 + paraX, hy + dirY * 56); ctx.lineTo(W * 0.28 + paraX, hy + dirY * 14);
      ctx.lineTo(W * 0.46 + paraX, hy + dirY * 74); ctx.lineTo(W * 0.62 + paraX, hy + dirY * 18);
      ctx.lineTo(W * 0.8 + paraX, hy + dirY * 62); ctx.lineTo(W, hy + dirY * 22);
    }
    ctx.lineTo(W, hy);
    ctx.closePath();
    ctx.fill();

    // 지상 그라데이션
    g = ctx.createLinearGradient(0, gndTop, 0, gndBot);
    g.addColorStop(0, S.ground[0]);
    g.addColorStop(1, S.ground[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.min(gndTop, gndBot), W, Math.abs(gndBot - gndTop) + 2);

    // 바닷속 빛기둥
    if (S.roadStyle === "coral") {
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const rx = W * (0.14 + i * 0.18) + Math.sin(animT * 1.4 + i) * 18;
        const rg = ctx.createLinearGradient(rx, 0, rx + 30, H * 0.85);
        rg.addColorStop(0, "rgba(165,243,252,0.22)");
        rg.addColorStop(1, "rgba(165,243,252,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.moveTo(rx - 18, 0); ctx.lineTo(rx + 24, 0);
        ctx.lineTo(rx + 85, H); ctx.lineTo(rx - 45, H);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // 반딧불
    if (S.fireflies) {
      for (let i = 0; i < 20; i++) {
        const x = (i * 83 + Math.sin(animT * 1.5 + i) * 26 + W) % W;
        const y = 40 + (i * 47) % Math.max(80, H - 80);
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(animT * 3 + i));
        ctx.globalAlpha = glow;
        ctx.fillStyle = i % 2 ? "#FEF08A" : "#A3E635";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    // 바닷속 거품
    if (S.bubbles) {
      for (let i = 0; i < 18; i++) {
        const x = (i * 71 + Math.sin(animT + i) * 18) % W;
        const y = (H - ((animT * (26 + (i % 4) * 8) + i * 47) % H));
        ctx.strokeStyle = "rgba(224,247,250,0.68)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 3.5 + (i % 4), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // 축제 하늘 풍선
    if (S.confettiBg) {
      for (let i = 0; i < 10; i++) {
        const x = (i * 113 + animT * 26) % W;
        const y = 48 + ((i * 59) % 90) + Math.sin(animT * 2 + i) * 8;
        txt(ctx, ["🎈", "🌈", "🎉", "⭐"][i % 4], x, y, 18, "#fff");
      }
    }

    txt(ctx, S.deco, horizonPt.cx, hy + (flipped ? 24 : -22), 22, "#fff", "rgba(0,0,0,.35)");
    txt(ctx, (stageIdx + 1) + "단계 · " + S.icon + " " + S.name, W * 0.5, 22, 15, "#fff", "rgba(0,0,0,.7)");
  }

  /* ------------------------------------------------------------
     2. 도로 양옆 3D 원근 장식물
     ------------------------------------------------------------ */
  function drawRoadsideProp(ctx, theme, x, y, sc, side, animT, seed, flipped) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, flipped ? -sc : sc);
    if (theme === "flower") {
      ctx.fillStyle = "#15803D"; ctx.beginPath(); ctx.arc(0, -28, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#22C55E"; ctx.beginPath(); ctx.arc(-8, -32, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#78350F"; ctx.fillRect(-5, -10, 10, 14);
      drawStar(ctx, side * 14, -2, 6, 5, seed % 2 ? "#F472B6" : "#FACC15");
    } else if (theme === "lamp") {
      ctx.fillStyle = "#334155"; ctx.fillRect(-3, -56, 6, 60);
      ctx.fillStyle = "#FDE047"; ctx.shadowColor = "#FACC15"; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(side * -4, -56, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    } else if (theme === "maple") {
      ctx.fillStyle = "#78350F"; ctx.fillRect(-4, -18, 8, 22);
      ctx.fillStyle = seed % 2 ? "#EA580C" : "#F59E0B"; ctx.beginPath(); ctx.arc(0, -34, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#DC2626"; ctx.beginPath(); ctx.arc(side * 8, -40, 12, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "snowman") {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(0, -10, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -28, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#EF4444"; ctx.fillRect(-10, -21, 20, 4);
      ctx.fillStyle = "#F97316"; ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(side * 8, -26); ctx.lineTo(0, -24); ctx.fill();
    } else if (theme === "cactus") {
      ctx.fillStyle = "#15803D";
      rr(ctx, -6, -46, 12, 50, 6); ctx.fill();
      rr(ctx, -18, -34, 12, 7, 3); ctx.fill(); rr(ctx, -18, -44, 7, 16, 3); ctx.fill();
      rr(ctx, 6, -28, 12, 7, 3); ctx.fill(); rr(ctx, 11, -38, 7, 16, 3); ctx.fill();
    } else if (theme === "neonpost") {
      const nc = seed % 2 ? "#22D3EE" : "#F472B6";
      ctx.fillStyle = "#1E293B"; ctx.fillRect(-4, -62, 8, 66);
      ctx.fillStyle = nc; ctx.shadowColor = nc; ctx.shadowBlur = 18;
      rr(ctx, -7, -62, 14, 24, 5); ctx.fill(); ctx.shadowBlur = 0;
    } else if (theme === "palm") {
      ctx.strokeStyle = "#92400E"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(side * -6, -26, side * -10, -52); ctx.stroke();
      ctx.fillStyle = "#16A34A";
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.ellipse(side * -10 + k * 9, -52 + Math.abs(k) * 3, 14, 5, k * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (theme === "balloon") {
      const bc = ["#F43F5E", "#FACC15", "#38BDF8", "#A855F7"][seed % 4];
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -34); ctx.stroke();
      ctx.fillStyle = bc;
      ctx.beginPath(); ctx.ellipse(0, -46 + Math.sin(animT * 3 + seed) * 3, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "mushroom") {
      ctx.fillStyle = "#FEF3C7"; ctx.fillRect(-4, -18, 8, 22);
      ctx.fillStyle = seed % 2 ? "#A855F7" : "#EC4899"; ctx.beginPath(); ctx.arc(0, -18, 16, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#FEF08A"; ctx.beginPath(); ctx.arc(-6, -24, 3, 0, Math.PI * 2); ctx.arc(5, -26, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "cloudpillar") {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(0, -14, 16, 0, Math.PI * 2); ctx.arc(-10, -8, 11, 0, Math.PI * 2); ctx.arc(10, -8, 11, 0, Math.PI * 2); ctx.fill();
      drawStar(ctx, 0, -36 + Math.sin(animT * 3 + seed) * 3, 8, 5, "#FDE047");
    } else if (theme === "coral") {
      ctx.strokeStyle = seed % 2 ? "#FB7185" : "#2DD4BF";
      ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -34); ctx.moveTo(0, -18); ctx.lineTo(-12, -32); ctx.moveTo(0, -22); ctx.lineTo(12, -36); ctx.stroke();
    } else {
      ctx.fillStyle = "#334155"; ctx.fillRect(-3, -38, 6, 42);
      ctx.shadowColor = "#38BDF8"; ctx.shadowBlur = 16;
      drawStar(ctx, 0, -44, 13, 4, seed % 2 ? "#38BDF8" : "#FDE047"); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------
     3. 커브 & 언덕 슬라이스 도로 + 터널 링 + 보스 레이저 + 도착 게이트
     ------------------------------------------------------------ */
  function drawRoad(ctx, W, H, S, state) {
    const { stageIdx, stageTime, roadScroll, finished, animT, flipBlend = 0, feverTimer = 0, boostTimer = 0 } = state;
    const totalStages = window.SafeMoverStages.length;
    const style = S.roadStyle || "meadow";
    const flipped = flipBlend > 0.5;
    const SLICES = 18;

    // 1) 슬라이스 단위 커브 도로 & 연석
    const pts = [];
    for (let i = 0; i <= SLICES; i++) {
      const z = (i / SLICES) * 1.14;
      pts.push(project(W, H, S, state, z, 0));
    }

    const curbCol =
      feverTimer > 0 ? "rgba(250, 204, 21, 0.85)" :
      style === "neon" ? "rgba(34, 211, 238, 0.58)" :
      style === "rainbow" ? "rgba(253, 224, 71, 0.72)" :
      style === "ice" ? "rgba(224, 242, 254, 0.8)" :
      style === "cloud" ? "rgba(255, 255, 255, 0.86)" :
      style === "galaxy" ? "rgba(167, 139, 250, 0.58)" : "rgba(255,255,255,0.36)";

    const rbCols = ["#FB7185", "#FACC15", "#4ADE80", "#38BDF8", "#C084FC"];

    for (let i = 0; i < SLICES; i++) {
      const a = pts[i], b = pts[i + 1];
      const padA = 7 + 15 * (i / SLICES);
      const padB = 7 + 15 * ((i + 1) / SLICES);

      // 연석
      ctx.fillStyle = curbCol;
      ctx.beginPath();
      ctx.moveTo(a.cx - a.hw - padA, a.y); ctx.lineTo(a.cx + a.hw + padA, a.y);
      ctx.lineTo(b.cx + b.hw + padB, b.y); ctx.lineTo(b.cx - b.hw - padB, b.y);
      ctx.closePath(); ctx.fill();

      // 도로 본체
      if (style === "rainbow" || feverTimer > 0) {
        for (let band = 0; band < 5; band++) {
          const f0 = -1 + band * 0.4, f1 = f0 + 0.4;
          ctx.fillStyle = rbCols[band];
          ctx.globalAlpha = feverTimer > 0 ? 0.92 : 0.85;
          ctx.beginPath();
          ctx.moveTo(a.cx + a.hw * f0, a.y); ctx.lineTo(a.cx + a.hw * f1, a.y);
          ctx.lineTo(b.cx + b.hw * f1, b.y); ctx.lineTo(b.cx + b.hw * f0, b.y);
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        const tFrac = i / SLICES;
        ctx.fillStyle = tFrac < 0.45 ? S.road[0] : S.road[1];
        ctx.beginPath();
        ctx.moveTo(a.cx - a.hw, a.y); ctx.lineTo(a.cx + a.hw, a.y);
        ctx.lineTo(b.cx + b.hw, b.y); ctx.lineTo(b.cx - b.hw, b.y);
        ctx.closePath(); ctx.fill();
      }
    }

    // 2) 커브를 따라 흐르는 원근 가로선 & 차선
    for (let i = 0; i < 12; i++) {
      const r0 = ((i + roadScroll) / 12) % 1;
      const r1 = ((i + 0.52 + roadScroll) / 12) % 1;
      const p0 = project(W, H, S, state, r0 * 1.1, 0);
      const p1 = project(W, H, S, state, r1 * 1.1, 0);

      if (style === "neon") ctx.strokeStyle = "rgba(236, 72, 153, " + (0.18 + 0.35 * r0).toFixed(2) + ")";
      else if (style === "wood" || style === "beach") ctx.strokeStyle = "rgba(69, 26, 3, " + (0.22 + 0.25 * r0).toFixed(2) + ")";
      else if (style === "galaxy") ctx.strokeStyle = "rgba(196, 181, 253, " + (0.16 + 0.3 * r0).toFixed(2) + ")";
      else ctx.strokeStyle = "rgba(255,255,255," + (0.12 + 0.24 * r0).toFixed(2) + ")";

      ctx.lineWidth = (style === "wood" ? 2.2 : 1.2) + 2.8 * r0;
      ctx.beginPath(); ctx.moveTo(p0.cx - p0.hw, p0.y); ctx.lineTo(p0.cx + p0.hw, p0.y); ctx.stroke();

      if (r1 > r0) {
        ctx.strokeStyle =
          style === "neon" ? "rgba(34,211,238,0.88)" :
          style === "ice" ? "rgba(255,255,255,0.78)" :
          style === "galaxy" ? "rgba(250,204,21,0.78)" :
          style === "rainbow" ? "rgba(255,255,255,0.68)" : "rgba(253,224,71,0.74)";
        ctx.lineWidth = 2 + 4 * r0;
        ctx.lineCap = "round";
        [-0.33, 0.33].forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(p0.cx + p0.hw * d, p0.y);
          ctx.lineTo(p1.cx + p1.hw * d, p1.y);
          ctx.stroke();
        });
      }

      // 스피드 터널 / 바닷속 터널 아치 링
      if ((S.tunnel || boostTimer > 0) && i % 2 === 0) {
        ctx.save();
        const ringCol =
          style === "coral" ? "rgba(165, 243, 252, " :
          style === "neon" ? "rgba(34, 211, 238, " :
          "rgba(192, 132, 252, ";
        ctx.strokeStyle = ringCol + (0.2 + 0.48 * r0).toFixed(2) + ")";
        ctx.lineWidth = 2 + 4.5 * r0;
        ctx.beginPath();
        const startA = flipped ? 0 : Math.PI;
        const endA = flipped ? Math.PI : 0;
        ctx.ellipse(p0.cx, p0.y, p0.hw * 1.06, p0.hw * 0.62, 0, startA, endA);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3) 보스 레이저 경고 / 발사 레인 렌더링 (Stage 12)
    if (state.bossLaser && state.bossLaser.lanes && state.bossLaser.lanes.length) {
      const bl = state.bossLaser;
      const isFiring = bl.phase === "fire";
      for (const lane of bl.lanes) {
        ctx.save();
        for (let i = 0; i < SLICES; i++) {
          const z0 = (i / SLICES) * 1.05;
          const z1 = ((i + 1) / SLICES) * 1.05;
          const a = project(W, H, S, state, z0, lane);
          const b = project(W, H, S, state, z1, lane);
          const w0 = a.hw * 0.28, w1 = b.hw * 0.28;
          ctx.fillStyle = isFiring
            ? "rgba(239, 68, 68, " + (0.55 + 0.35 * Math.sin(animT * 36)).toFixed(2) + ")"
            : "rgba(251, 146, 60, " + (0.25 + 0.28 * Math.sin(animT * 18)).toFixed(2) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x - w0, a.y); ctx.lineTo(a.x + w0, a.y);
          ctx.lineTo(b.x + w1, b.y); ctx.lineTo(b.x - w1, b.y);
          ctx.closePath(); ctx.fill();
        }
        if (!isFiring) {
          const midPt = project(W, H, S, state, 0.56, lane);
          txt(ctx, "⚠️ 레이저!", midPt.x, midPt.y - 24, 15, "#FEF08A", "#991B1B");
        }
        ctx.restore();
      }
    }

    // 4) 도로 양옆 3D 스크롤 프롭 (커브 따라 배치)
    for (let i = 0; i < 6; i++) {
      const r = ((i + roadScroll) / 6) % 1;
      const pt = project(W, H, S, state, r * 1.06, 0);
      const offset = pt.hw + 28 * pt.sc;
      drawRoadsideProp(ctx, S.propTheme || "flower", pt.cx - offset, pt.y, pt.sc, -1, animT, i, flipped);
      drawRoadsideProp(ctx, S.propTheme || "flower", pt.cx + offset, pt.y, pt.sc, 1, animT, i + 1, flipped);
    }

    // 5) 도착 게이트
    const remain = S.dur - stageTime;
    if (remain < 4.5 && !finished) {
      const gz = Math.min(1, Math.max(0, (4.5 - remain) / 4.5));
      const gp = project(W, H, S, state, gz * 0.95, 0);
      const lx = gp.cx - gp.hw * 0.88, rx = gp.cx + gp.hw * 0.88;
      const ah = 135 * (0.25 + 0.85 * gp.pz) * (flipped ? -1 : 1);

      ctx.fillStyle = "#FFB300";
      ctx.fillRect(lx - 8, Math.min(gp.y, gp.y - ah), 16, Math.abs(ah));
      ctx.fillRect(rx - 8, Math.min(gp.y, gp.y - ah), 16, Math.abs(ah));
      const signY = flipped ? gp.y - ah : gp.y - ah - 32 * gp.sc;
      ctx.fillStyle = stageIdx === totalStages - 1 ? "#6A1B9A" : "#16A34A";
      rr(ctx, lx - 10, signY, rx - lx + 20, 38 * gp.sc, 10);
      ctx.fill();
      txt(ctx, stageIdx === totalStages - 1 ? "🏁 최종 도착지!" : "🏁 " + (stageIdx + 1) + "단계 도착!",
        gp.cx, signY + 19 * gp.sc, Math.max(11, 18 * gp.sc), "#fff");
    }
  }

  /* ------------------------------------------------------------
     4. 바닥 역동 기믹 패드 · 포탈 · 레일 · 컨베이어 · 끊어진 다리
     ------------------------------------------------------------ */
  function drawPads(ctx, W, H, S, state) {
    const pads = state.pads;
    if (!pads || !pads.length) return;
    const animT = state.animT;
    const sorted = [...pads].sort((a, b) => a.z - b.z);

    for (const p of sorted) {
      const pt = project(W, H, S, state, p.z, p.lane);
      const { x, y, sc } = pt;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);

      if (p.kind === "puddle") {
        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
        ctx.strokeStyle = "rgba(224, 242, 254, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 56, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const rip = (animT * 1.8 + p.ph) % 1;
        ctx.strokeStyle = "rgba(255,255,255," + (1 - rip).toFixed(2) + ")";
        ctx.beginPath(); ctx.ellipse(0, 0, 18 + rip * 32, 6 + rip * 11, 0, 0, Math.PI * 2); ctx.stroke();
        txt(ctx, "💧미끄덩", 0, -16, 13, "#E0F2FE", "#0369A1");
      } else if (p.kind === "boost" || p.kind === "counterPad") {
        const isCounter = p.kind === "counterPad";
        ctx.fillStyle = isCounter ? "rgba(250, 204, 21, 0.38)" : "rgba(6, 182, 212, 0.35)";
        ctx.strokeStyle = isCounter ? "#FACC15" : "#22D3EE";
        ctx.lineWidth = 3.5;
        rr(ctx, -48, -19, 96, 38, 11); ctx.fill(); ctx.stroke();
        const glow = 0.6 + 0.4 * Math.sin(animT * 12);
        ctx.strokeStyle = isCounter ? "rgba(244, 63, 94, " + glow.toFixed(2) + ")" : "rgba(250, 204, 21, " + glow.toFixed(2) + ")";
        ctx.lineWidth = 4;
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath(); ctx.moveTo(-16, k * 8 + 4); ctx.lineTo(0, k * 8 - 6); ctx.lineTo(16, k * 8 + 4); ctx.stroke();
        }
        txt(ctx, isCounter ? "⚡보스반격!" : "⚡부스트", 0, -25, 13, "#FDE047", "#0F172A");
      } else if (p.kind === "cloud" || p.kind === "spring") {
        const isSpring = p.kind === "spring";
        const bounceY = Math.sin(animT * 10 + p.ph) * 3;
        if (isSpring) {
          ctx.fillStyle = "#F472B6"; ctx.strokeStyle = "#FDF2F8"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(0, 4, 42, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#FACC15";
          ctx.beginPath(); ctx.ellipse(0, -6 + bounceY, 34, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          txt(ctx, "🌸스프링!", 0, -24 + bounceY, 13, "#FEF08A", "#9D174D");
        } else {
          ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#38BDF8"; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -4, 28, 0, Math.PI * 2); ctx.arc(-26, 2, 18, 0, Math.PI * 2); ctx.arc(26, 2, 18, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          txt(ctx, "☁️점프!", 0, -24 + bounceY, 14, "#0284C7", "#fff");
        }
      } else if (p.kind === "tidal") {
        ctx.fillStyle = "rgba(14, 165, 233, 0.72)";
        ctx.beginPath(); ctx.ellipse(0, 0, 62, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, -4, 42, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        txt(ctx, "🌊파도!", 0, -18, 13, "#fff", "#0369A1");
      } else if (p.kind === "surfRamp") {
        ctx.fillStyle = "#06B6D4"; ctx.strokeStyle = "#ECFEFF"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-46, 14); ctx.lineTo(46, 14); ctx.lineTo(36, -18); ctx.lineTo(-36, -18); ctx.closePath();
        ctx.fill(); ctx.stroke();
        txt(ctx, "🏄점프램프!", 0, -26, 13, "#FEF08A", "#0E7490");
      } else if (p.kind === "warp" || p.kind === "portalPair" || p.kind === "skyWarp" || p.kind === "gravityGate" || p.kind === "mirrorGate") {
        const col =
          p.kind === "portalPair" ? (p.portalColor === "orange" ? "#F97316" : "#38BDF8") :
          p.kind === "skyWarp" ? "#FACC15" :
          p.kind === "gravityGate" ? "#A855F7" :
          p.kind === "mirrorGate" ? "#EC4899" : "#22D3EE";
        const spin = animT * 4.5 + p.ph;
        const grad = ctx.createRadialGradient(0, -28, 6, 0, -28, 46);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.45, col);
        grad.addColorStop(1, "rgba(15,23,42,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, -28, 46, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3.5;
        ctx.save(); ctx.translate(0, -28); ctx.rotate(spin);
        ctx.setLineDash([12, 8]);
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        const label =
          p.kind === "portalPair" ? (p.portalColor === "orange" ? "🟠워프출구" : "🔵워프입구") :
          p.kind === "skyWarp" ? "✨하늘워프!" :
          p.kind === "gravityGate" ? "🙃중력반전!" :
          p.kind === "mirrorGate" ? "🎭거울반전!" : "🌀워프!";
        txt(ctx, label, 0, -68, 13, "#FEF08A", "#0F172A");
      } else if (p.kind === "bridgeGap") {
        // 끊어진 나무다리 구멍 (어두운 심연 + 경고 줄무늬)
        ctx.fillStyle = "#090D16";
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3.5;
        rr(ctx, -48, -22, 96, 44, 10); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#EF4444"; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-36, -14); ctx.lineTo(36, 14);
        ctx.moveTo(36, -14); ctx.lineTo(-36, 14);
        ctx.stroke();
        txt(ctx, "⚠️빈틈피해!", 0, -32, 13, "#FCA5A5", "#450A0A");
      } else if (p.kind === "iceRail" || p.kind === "vineRail") {
        const isVine = p.kind === "vineRail";
        const rc = isVine ? "#4ADE80" : "#7DD3FC";
        ctx.strokeStyle = isVine ? "#14532D" : "#0369A1";
        ctx.lineWidth = 14; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -56); ctx.stroke();
        ctx.strokeStyle = rc; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -56); ctx.stroke();
        drawStar(ctx, Math.sin(animT * 9 + p.ph) * 10, -24, 7, 4, "#FEF08A");
        txt(ctx, isVine ? "🌿덩굴레일" : "🛷얼음레일", 0, -68, 13, "#FFFFFF", isVine ? "#14532D" : "#0369A1");
      } else if (p.kind === "conveyorL" || p.kind === "conveyorR") {
        const dir = p.kind === "conveyorL" ? -1 : 1;
        ctx.fillStyle = "rgba(217, 119, 6, 0.85)";
        ctx.strokeStyle = "#FEF08A"; ctx.lineWidth = 3;
        rr(ctx, -50, -18, 100, 36, 9); ctx.fill(); ctx.stroke();
        const shift = ((animT * 50) % 24) * dir;
        ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3.5;
        for (let k = -1; k <= 1; k++) {
          const cx0 = k * 24 + shift * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx0 - dir * 8, -8); ctx.lineTo(cx0 + dir * 6, 0); ctx.lineTo(cx0 - dir * 8, 8);
          ctx.stroke();
        }
        txt(ctx, dir < 0 ? "◀◀왼쪽밀림" : "오른쪽밀림▶▶", 0, -28, 12, "#FEF08A", "#78350F");
      }

      ctx.restore();
    }
  }

  /* ------------------------------------------------------------
     5. 바른 맞춤법 카드 · 파워업 · 스테이지별 오타 몬스터 · 보스
     ------------------------------------------------------------ */
  function drawCorrectWordCard(ctx, entity, animT) {
    const pulse = 1 + Math.sin(animT * 7 + entity.ph) * 0.06;
    const floatY = Math.sin(animT * 5 + entity.ph) * 8;
    const wingAngle = Math.sin(animT * 14 + entity.ph) * 0.34;
    const popIn = Math.min(1, Math.max(0.45, (entity.z || 0.1) * 7));
    const isGold = !!entity.isGold;

    ctx.save();
    ctx.translate(0, -34 + floatY);
    ctx.scale(pulse * popIn, pulse * popIn);

    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 86);
    aura.addColorStop(0, isGold ? "rgba(250, 204, 21, 0.9)" : "rgba(74, 222, 128, 0.8)");
    aura.addColorStop(0.55, isGold ? "rgba(251, 146, 60, 0.4)" : "rgba(253, 224, 71, 0.32)");
    aura.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.rotate(animT * 1.8 + entity.ph);
    ctx.strokeStyle = isGold ? "rgba(251, 191, 36, 0.85)" : "rgba(253, 224, 71, 0.58)";
    ctx.lineWidth = 3;
    for (let r = 0; r < 6; r++) {
      const ang = (Math.PI / 3) * r;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 44, Math.sin(ang) * 44);
      ctx.lineTo(Math.cos(ang) * 72, Math.sin(ang) * 72);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = isGold ? "#FDE047" : "#FEF08A";
    ctx.beginPath(); ctx.ellipse(-64, -4, 19, 9, -0.35 + wingAngle, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(64, -4, 19, 9, 0.35 - wingAngle, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 3; i++) {
      const a = animT * 3.8 + entity.ph + i * (Math.PI * 2 / 3);
      drawStar(ctx, Math.cos(a) * 72, Math.sin(a) * 26 - 6, 5, 4, i % 2 ? "#FDE047" : "#6EE7B7");
    }

    const cardW = Math.max(126, entity.word.length * 24 + 38);
    const cardH = 58;
    const cardGrad = ctx.createLinearGradient(0, -cardH / 2, 0, cardH / 2);
    cardGrad.addColorStop(0, isGold ? "#FEF9C3" : "#FFFFFF");
    cardGrad.addColorStop(1, isGold ? "#FDE047" : "#DCFCE7");
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = isGold ? "#D97706" : "#16A34A";
    ctx.lineWidth = 4.5;
    rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 16);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = isGold ? "#D97706" : "#16A34A";
    rr(ctx, -52, -cardH / 2 - 14, 104, 22, 11); ctx.fill();
    txt(ctx, isGold ? "⭐ 2배 황금말!" : "⭕ 바른 말!", 0, -cardH / 2 - 3, 12, "#FFFFFF");
    txt(ctx, entity.word, 0, 2, entity.word.length >= 6 ? 20 : 24, isGold ? "#78350F" : "#14532D");

    const arrowBob = Math.sin(animT * 9 + entity.ph) * 7;
    ctx.save();
    ctx.translate(0, -cardH / 2 - 40 + arrowBob);
    ctx.fillStyle = "#FACC15"; ctx.strokeStyle = "#15803D"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -20); ctx.lineTo(9, -20); ctx.lineTo(9, -5);
    ctx.lineTo(19, -5); ctx.lineTo(0, 14); ctx.lineTo(-19, -5); ctx.lineTo(-9, -5);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawPowerup(ctx, entity, animT) {
    const floatY = Math.sin(animT * 6 + entity.ph) * 8;
    const isShield = entity.kind === "shield";
    ctx.save();
    ctx.translate(0, -38 + floatY);

    const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 56);
    glow.addColorStop(0, isShield ? "rgba(56,189,248,0.85)" : "rgba(236,72,153,0.85)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = isShield ? "#E0F2FE" : "#FCE7F3";
    ctx.strokeStyle = isShield ? "#0284C7" : "#DB2777";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    txt(ctx, isShield ? "🫧" : "🧲", 0, -2, 28, "#fff");
    ctx.fillStyle = isShield ? "#0284C7" : "#DB2777";
    rr(ctx, -40, 22, 80, 20, 10); ctx.fill();
    txt(ctx, isShield ? "거품 보호막" : "단어 자석", 0, 32, 11, "#fff");
    ctx.restore();
  }

  function drawEnemy(ctx, S, entity, animT) {
    const bob = Math.sin(animT * 10 + entity.ph) * 4;
    const col = S.enemyColor || "#E53935";
    const etype = S.enemyType || "goblin";

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 8, 46, 12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(0, bob);
    if (entity.hit) ctx.rotate(Math.sin(animT * 30) * 0.35);

    ctx.fillStyle = col;
    if (etype === "bot" || etype === "alien") {
      ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-12, -55); ctx.lineTo(-18, -74); ctx.moveTo(12, -55); ctx.lineTo(18, -74); ctx.stroke();
      ctx.fillStyle = "#FDE047";
      ctx.beginPath(); ctx.arc(-18, -74, 5, 0, Math.PI * 2); ctx.arc(18, -74, 5, 0, Math.PI * 2); ctx.fill();
    } else if (etype === "crab") {
      ctx.fillStyle = "#FB7185";
      ctx.beginPath(); ctx.arc(-44, -36, 12, 0.3, Math.PI * 1.7); ctx.fill();
      ctx.beginPath(); ctx.arc(44, -36, 12, Math.PI * 1.3, Math.PI * 0.7); ctx.fill();
    } else if (etype === "puffer" || etype === "thorn") {
      ctx.fillStyle = col;
      for (let a = 0; a < 8; a++) {
        const ang = (Math.PI * 2 / 8) * a;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 30, -28 + Math.sin(ang) * 26);
        ctx.lineTo(Math.cos(ang) * 46, -28 + Math.sin(ang) * 42);
        ctx.lineTo(Math.cos(ang + 0.25) * 30, -28 + Math.sin(ang + 0.25) * 26);
        ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.beginPath(); ctx.moveTo(-24, -46); ctx.lineTo(-34, -68); ctx.lineTo(-10, -52); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, -46); ctx.lineTo(34, -68); ctx.lineTo(10, -52); ctx.closePath(); ctx.fill();
    }

    ctx.fillStyle = col;
    rr(ctx, -34, -56, 68, 56, 22); ctx.fill();
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3; ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.arc(-13, -34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath(); ctx.arc(-11, -33, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -33, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "#1E293B"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-22, -45); ctx.lineTo(-6, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, -45); ctx.lineTo(6, -40); ctx.stroke();

    const signW = Math.max(122, entity.word.length * 22 + 34);
    const signH = 46;
    ctx.fillStyle = "#FEF2F2"; ctx.strokeStyle = "#DC2626"; ctx.lineWidth = 3.5;
    rr(ctx, -signW / 2, -110, signW, signH, 12); ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#DC2626";
    rr(ctx, -44, -124, 88, 19, 9); ctx.fill();
    txt(ctx, "❌ 오타 적!", 0, -114, 11, "#FFFFFF");
    txt(ctx, entity.word, 0, -87, entity.word.length >= 6 ? 18 : 21, "#991B1B");

    const blinkVal = (Math.sin(animT * 8 + entity.ph) + 1) * 0.5;
    if (blinkVal > 0.34) {
      const alpha = Math.min(1, (blinkVal - 0.34) / 0.45);
      ctx.save(); ctx.translate(0, -87); ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(22, 16); ctx.moveTo(22, -16); ctx.lineTo(-22, 16); ctx.stroke();
      ctx.strokeStyle = "#EF4444"; ctx.lineWidth = 5.5;
      ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(22, 16); ctx.moveTo(22, -16); ctx.lineTo(-22, 16); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawBoss(ctx, W, H, S, state) {
    if (!S.bossChase || !state.bossActive || state.finished) return;
    const pt = project(W, H, S, state, 0.04, 0);
    const flipped = (state.flipBlend || 0) > 0.5;
    const bx = pt.cx + Math.sin(state.animT * 1.8) * 34;
    const by = pt.hy + (flipped ? 44 : -48) + Math.cos(state.animT * 2.7) * 8;
    const flash = state.bossHitFlash > 0;

    ctx.save();
    ctx.translate(bx, by);

    // 위협 오라
    const aura = ctx.createRadialGradient(0, 0, 14, 0, 0, 74);
    aura.addColorStop(0, flash ? "rgba(250,204,21,0.9)" : "rgba(225,29,72,0.75)");
    aura.addColorStop(1, "rgba(225,29,72,0)");
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2); ctx.fill();

    // 거대 오타 마왕 몸통
    ctx.fillStyle = flash ? "#FEF08A" : "#BE123C";
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3;
    rr(ctx, -48, -34, 96, 66, 24); ctx.fill(); ctx.stroke();

    // 왕관/뿔
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.moveTo(-30, -34); ctx.lineTo(-20, -54); ctx.lineTo(-6, -36);
    ctx.lineTo(0, -58); ctx.lineTo(6, -36); ctx.lineTo(20, -54); ctx.lineTo(30, -34);
    ctx.closePath(); ctx.fill();

    // 눈
    ctx.fillStyle = "#FEF08A";
    ctx.beginPath(); ctx.arc(-18, -6, 9, 0, Math.PI * 2); ctx.arc(18, -6, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0F172A";
    ctx.beginPath(); ctx.arc(-18, -6, 4, 0, Math.PI * 2); ctx.arc(18, -6, 4, 0, Math.PI * 2); ctx.fill();

    // HP 바
    const hpFrac = Math.max(0, (state.bossHp || 0) / (state.bossMaxHp || 5));
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    rr(ctx, -50, 38, 100, 12, 6); ctx.fill();
    ctx.fillStyle = "#FB7185";
    rr(ctx, -48, 40, 96 * hpFrac, 8, 4); ctx.fill();
    txt(ctx, "👾 오타 마왕", 0, 58, 12, "#FECDD3", "#4C0519");

    ctx.restore();
  }

  function drawEntities(ctx, W, H, S, state) {
    const { entities, animT } = state;
    const sorted = [...entities].sort((a, b) => a.z - b.z);

    for (const o of sorted) {
      if (o.collected) continue;
      const oLane = o.lane + (o.off || 0);
      const pt = project(W, H, S, state, o.z, oLane);

      o.screenX = pt.x;
      o.screenY = pt.y - 34 * pt.sc * ((state.flipBlend || 0) > 0.5 ? -1 : 1);
      o.screenR = Math.max(44, 68 * pt.sc);

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.scale(pt.sc, pt.sc);
      if (o.kind === "correct") drawCorrectWordCard(ctx, o, animT);
      else if (o.kind === "shield" || o.kind === "magnet") drawPowerup(ctx, o, animT);
      else drawEnemy(ctx, S, o, animT);
      ctx.restore();
    }
  }

  function drawLaneGuides(ctx, W, H, S, state) {
    const { entities, animT } = state;
    for (const o of entities) {
      if (o.collected || o.hit) continue;
      if (o.kind === "correct" && o.z >= 0.02 && o.z < 0.92) {
        const pulse = 0.2 + 0.16 * Math.sin(animT * 8 + o.ph);
        const oLane = o.lane + (o.off || 0);
        const pTop = project(W, H, S, state, 0.02, oLane);
        const pMid = project(W, H, S, state, o.z * 0.5, oLane);
        const pNow = project(W, H, S, state, o.z, oLane);
        const pBot = project(W, H, S, state, 1.04, oLane);

        ctx.save();
        ctx.strokeStyle = o.isGold
          ? "rgba(250, 204, 21, " + (pulse + 0.12).toFixed(2) + ")"
          : "rgba(74, 222, 128, " + pulse.toFixed(2) + ")";
        ctx.lineWidth = 10 + 10 * pNow.pz;
        ctx.lineCap = "round";
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = -animT * 80;
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pMid.x, pMid.y);
        ctx.lineTo(pNow.x, pNow.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();
        ctx.restore();
      } else if (o.kind === "enemy" && o.z > 0.52 && o.z < 0.92) {
        const oLane = o.lane + (o.off || 0);
        const pt = project(W, H, S, state, o.z, oLane);
        ctx.save();
        ctx.fillStyle = "rgba(239, 68, 68, " + (0.16 + 0.16 * Math.sin(animT * 14)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 4, 46 * pt.pz + 16, 14 * pt.pz + 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ------------------------------------------------------------
     6. 맞춤법 요정 "읽걷이" (중력 반전 · 레일 서핑 · 워프 · 피버 대응)
     ------------------------------------------------------------ */
  function drawPlayer(ctx, W, H, S, state) {
    const {
      lanePos, laneFlash, stumble, catchAnim, jumpTimer, shield,
      magnetTimer, boostTimer, railTimer, feverTimer, warpAnim,
      combo, animT, entities, flipBlend = 0
    } = state;

    const anchor = project(W, H, S, state, 0.85, lanePos);
    const x = anchor.x;
    const y = anchor.y;
    const flipped = flipBlend > 0.5;
    const charRotFlip = flipBlend * Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(charRotFlip);

    const bounce = Math.sin(animT * 14 * S.speed);
    const cloudJumpY = jumpTimer > 0 ? Math.sin((jumpTimer / 0.9) * Math.PI) * -98 : 0;
    const catchJumpY = catchAnim > 0 ? Math.sin((catchAnim / 0.45) * Math.PI) * -28 : 0;
    const totalJumpY = Math.min(cloudJumpY, catchJumpY);
    const tilt = stumble > 0 ? Math.sin(animT * 28) * 0.28 : (state.lane - lanePos) * 0.25 + bounce * 0.05;

    // 워프 포탈 잔상
    if (warpAnim > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, warpAnim * 1.4);
      ctx.strokeStyle = "#38BDF8"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, -64 + totalJumpY, 76 * (1 - warpAnim * 0.4), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // 콤보 피버 / 부스트 / 레일 아우라
    if (feverTimer > 0 || boostTimer > 0 || railTimer > 0 || combo >= 3) {
      ctx.save();
      const feverCol = feverTimer > 0 ? "#F43F5E" : (railTimer > 0 ? "#4ADE80" : (boostTimer > 0 ? "#22D3EE" : "#FACC15"));
      ctx.globalAlpha = 0.35 + 0.16 * Math.sin(animT * 12);
      ctx.strokeStyle = feverCol;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, -64 + totalJumpY, 64 + Math.sin(animT * 10) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 자석 오라
    if (magnetTimer > 0) {
      ctx.save();
      const mr = 50 + ((animT * 40) % 28);
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#EC4899"; ctx.lineWidth = 3.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(0, -64 + totalJumpY, mr, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // 레인 이동 / 부스트 잔상
    if (laneFlash > 0 || boostTimer > 0 || railTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.48;
      ctx.strokeStyle = railTimer > 0 ? "#4ADE80" : (boostTimer > 0 ? "#FDE047" : "#7DD3FC");
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        const lx = -52 + i * 52;
        ctx.beginPath(); ctx.moveTo(lx, -36); ctx.lineTo(lx - 14, -22); ctx.stroke();
      }
      ctx.restore();
    }

    // 그림자
    const shScale = Math.max(0.45, 1 + totalJumpY / 160);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 12, 42 * shScale, 10 * shScale, 0, 0, Math.PI * 2); ctx.fill();

    // 레일 그라인드 보드
    if (railTimer > 0) {
      ctx.save();
      ctx.translate(0, totalJumpY - 6);
      ctx.fillStyle = "#FACC15"; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.5;
      rr(ctx, -38, 0, 76, 12, 6); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    ctx.translate(0, Math.abs(bounce) * -8 + totalJumpY);
    ctx.rotate(tilt);

    // 망토
    const capeGrad = ctx.createLinearGradient(0, -84, 0, -18);
    capeGrad.addColorStop(0, feverTimer > 0 ? "#EC4899" : "#0EA5E9");
    capeGrad.addColorStop(1, feverTimer > 0 ? "#FACC15" : "#38BDF8");
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(-24, -84); ctx.lineTo(24, -84);
    ctx.lineTo(38 + bounce * 5, -18); ctx.lineTo(0, -24); ctx.lineTo(-38 + bounce * 5, -18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#BAE6FD"; ctx.lineWidth = 2; ctx.stroke();

    // 요정 날개
    const fw = Math.sin(animT * 16) * 0.25;
    ctx.save();
    ctx.fillStyle = "rgba(254, 249, 195, 0.82)";
    ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-34, -70, 16, 9, -0.5 + fw, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(34, -70, 16, 9, 0.5 - fw, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    // 다리 & 신발
    ctx.fillStyle = "#334155";
    rr(ctx, -20, -28 + (bounce > 0 ? -6 : 2), 14, 26, 7); ctx.fill();
    rr(ctx, 6, -28 + (bounce < 0 ? -6 : 2), 14, 26, 7); ctx.fill();
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath(); ctx.ellipse(-13, bounce > 0 ? -6 : 4, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, bounce < 0 ? -6 : 4, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

    // 몸통
    const bodyGrad = ctx.createLinearGradient(0, -88, 0, -28);
    bodyGrad.addColorStop(0, "#34D399");
    bodyGrad.addColorStop(1, "#059669");
    ctx.fillStyle = bodyGrad;
    rr(ctx, -28, -86, 56, 56, 20); ctx.fill();
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.5; ctx.stroke();

    // 가슴 ⭕ 배지
    ctx.fillStyle = "#FEF08A"; ctx.beginPath(); ctx.arc(0, -56, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#16A34A"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -56, 8, 0, Math.PI * 2); ctx.stroke();

    // 양팔
    const armL = catchAnim > 0 ? -2.2 : bounce * 0.3;
    const armR = catchAnim > 0 ? 2.2 : -bounce * 0.3;
    ctx.save(); ctx.translate(-32, -74); ctx.rotate(armL);
    ctx.fillStyle = "#6EE7B7"; rr(ctx, -8, 0, 15, 28, 7.5); ctx.fill();
    ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#0284C7"; ctx.lineWidth = 2;
    rr(ctx, -12, 22, 18, 14, 3); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.save(); ctx.translate(32, -74); ctx.rotate(armR);
    ctx.fillStyle = "#6EE7B7"; rr(ctx, -7, 0, 15, 28, 7.5); ctx.fill();
    ctx.save(); ctx.translate(4, 24); ctx.rotate(-0.55);
    ctx.fillStyle = "#FACC15"; rr(ctx, -3, -24, 6, 28, 2); ctx.fill();
    ctx.fillStyle = "#FDE68A"; ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(3, -24); ctx.lineTo(0, -32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1E293B"; ctx.beginPath(); ctx.moveTo(-1.2, -29); ctx.lineTo(1.2, -29); ctx.lineTo(0, -32); ctx.closePath(); ctx.fill();
    drawStar(ctx, 0, -36, 5.5, 4, "#FEF08A");
    ctx.restore(); ctx.restore();

    // 얼굴
    ctx.fillStyle = "#FDE68A";
    ctx.beginPath(); ctx.arc(0, -106, 25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = "rgba(251, 113, 133, 0.55)";
    ctx.beginPath(); ctx.ellipse(-13, -98, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -98, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // 연필 고깔 모자
    ctx.fillStyle = "#E2E8F0"; rr(ctx, -25, -124, 50, 9, 4); ctx.fill();
    ctx.strokeStyle = "#94A3B8"; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = "#FACC15";
    ctx.beginPath(); ctx.moveTo(-22, -124); ctx.lineTo(22, -124); ctx.lineTo(10, -158); ctx.lineTo(-10, -158); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#CA8A04"; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, "ㄱ", 0, -138, 12, "#92400E");
    ctx.fillStyle = "#F472B6"; rr(ctx, -11, -170, 22, 13, 6); ctx.fill();
    ctx.strokeStyle = "#DB2777"; ctx.lineWidth = 2; ctx.stroke();

    // 눈
    const isBlink = (animT % 3.6) > 3.45;
    if (stumble > 0) {
      ctx.strokeStyle = "#1E293B"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(-12, -108); ctx.lineTo(-6, -104); ctx.lineTo(-12, -100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -108); ctx.lineTo(6, -104); ctx.lineTo(12, -100); ctx.stroke();
    } else if (isBlink) {
      ctx.strokeStyle = "#1E293B"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-13, -104); ctx.lineTo(-5, -104); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, -104); ctx.lineTo(13, -104); ctx.stroke();
    } else {
      ctx.fillStyle = "#1E293B";
      ctx.beginPath(); ctx.arc(-9, -105, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(9, -105, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(-10, -106.5, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(8, -106.5, 1.6, 0, Math.PI * 2); ctx.fill();
    }

    // 입
    ctx.strokeStyle = "#B45309"; ctx.lineWidth = 2.4; ctx.beginPath();
    if (stumble > 0) ctx.arc(0, -91, 4.5, Math.PI, 0);
    else if (catchAnim > 0) { ctx.fillStyle = "#FB7185"; ctx.arc(0, -95, 5.5, 0, Math.PI); ctx.fill(); }
    else ctx.arc(0, -96, 5.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    if (stumble > 0) {
      for (let i = 0; i < 3; i++) {
        const a = animT * 10 + i * 2.09;
        txt(ctx, "⭐", Math.cos(a) * 34, -182 + Math.sin(a) * 10, 16, "#FFEB3B", "#000");
      }
    }
    ctx.restore();

    // 보호막 쉴드
    if (shield > 0) {
      ctx.save();
      const syOff = (flipped ? 72 : -72) + (flipped ? -totalJumpY : totalJumpY);
      const sb = ctx.createRadialGradient(x - 12, y + syOff - 16, 8, x, y + syOff, 68);
      sb.addColorStop(0, "rgba(255,255,255,0.05)");
      sb.addColorStop(0.75, "rgba(56,189,248,0.22)");
      sb.addColorStop(1, "rgba(186,230,253,0.75)");
      ctx.fillStyle = sb; ctx.strokeStyle = "#7DD3FC"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y + syOff, 66 + Math.sin(animT * 6) * 2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // 방향 가이드 화살표
    let nextCorrect = null;
    for (const o of entities) {
      if (o.kind === "correct" && !o.collected && o.z >= 0.05 && o.z < 0.84) {
        if (!nextCorrect || o.z > nextCorrect.z) nextCorrect = o;
      }
    }
    if (nextCorrect && Math.abs(nextCorrect.lane - lanePos) > 0.45) {
      const dir = nextCorrect.lane < lanePos ? -1 : 1;
      const pulse = Math.sin(animT * 10) * 6;
      const gx = x + dir * (70 + pulse);
      const gy = y + (flipped ? 64 : -64);
      ctx.save();
      ctx.fillStyle = "#FACC15"; ctx.strokeStyle = "#15803D"; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx + dir * 18, gy); ctx.lineTo(gx - dir * 8, gy - 15); ctx.lineTo(gx - dir * 8, gy + 15);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    return { x, y: y + (flipped ? 70 : -70) };
  }

  /* ------------------------------------------------------------
     7. 이펙트 · 스피드라인 · 특수 상태 배너 · 스테이지 인트로
     ------------------------------------------------------------ */
  function drawRings(ctx, rings) {
    for (const r of rings) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, r.life);
      ctx.strokeStyle = r.c || "#4ADE80";
      ctx.lineWidth = 6 * r.life;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.rad + (1 - r.life) * 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBeams(ctx, beams) {
    for (const b of beams) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.strokeStyle = b.c || "#4ADE80";
      ctx.lineWidth = (b.w || 6) * b.life;
      ctx.shadowColor = b.c || "#22C55E";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2, Math.min(b.y1, b.y2) - 42, b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParts(ctx, parts) {
    for (const p of parts) {
      if (p.rain) {
        ctx.strokeStyle = p.c; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y + 12); ctx.stroke();
      } else if (p.text) {
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life);
        txt(ctx, p.text, p.x, p.y, p.s * 2.1, p.c, "rgba(0,0,0,0.45)");
        ctx.restore();
      } else {
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawPopups(ctx, popups) {
    if (!popups) return;
    for (const p of popups) {
      ctx.save();
      const sc = p.life > 0.8 ? 1 + (1 - p.life) * 1.4 : 1;
      ctx.globalAlpha = Math.min(1, p.life * 1.6);
      ctx.translate(p.x, p.y); ctx.scale(sc, sc);
      txt(ctx, p.text, 0, 0, p.size || 20, p.c || "#FDE047", "rgba(15,23,42,0.88)");
      ctx.restore();
    }
  }

  function drawConfetti(ctx, confetti) {
    for (const p of confetti) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.c; rr(ctx, -p.s / 2, -p.s * 0.3, p.s, p.s * 0.6, 3); ctx.fill();
      ctx.restore();
    }
  }

  function drawSpeedLines(ctx, W, H, state) {
    if (state.feverTimer <= 0 && state.boostTimer <= 0 && state.railTimer <= 0) return;
    ctx.save();
    const isFever = state.feverTimer > 0;
    ctx.strokeStyle = isFever ? "rgba(250, 204, 21, 0.34)" : "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 3;
    const cx = W * 0.5, cy = H * 0.42;
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 / 14) * i + state.animT * 1.6;
      const r0 = 160 + ((state.animT * 420 + i * 40) % 140);
      const r1 = r0 + 70;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStageIntroOverlay(ctx, W, H, S, state) {
    if (state.stageTime > 2.8 || state.finished) return;
    const t = state.stageTime;
    const alpha = t < 0.35 ? t / 0.35 : (t > 2.2 ? Math.max(0, (2.8 - t) / 0.6) : 1);
    const slideY = t < 0.35 ? (1 - t / 0.35) * -28 : 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(W * 0.5, H * 0.25 + slideY);

    const bw = Math.min(460, W - 40);
    const grad = ctx.createLinearGradient(-bw / 2, -40, bw / 2, 40);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.88)");
    grad.addColorStop(1, "rgba(30, 58, 138, 0.88)");
    ctx.fillStyle = grad; ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 3;
    rr(ctx, -bw / 2, -46, bw, 92, 20); ctx.fill(); ctx.stroke();

    txt(ctx, (state.stageIdx + 1) + "단계 " + S.icon + " " + S.name, 0, -16, 20, "#FFFFFF");
    txt(ctx, "기믹: " + S.gimmickLabel, 0, 14, 14, "#FDE047");
    ctx.restore();
  }

  function drawModeOverlays(ctx, W, H, state) {
    if (state.windWarn > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(state.animT * 18);
      const dirTxt = state.nextWindDir < 0 ? "🌪️ 왼쪽으로 강풍 예고! → 오른쪽 버티기!" : "🌪️ 오른쪽으로 강풍 예고! ← 왼쪽 버티기!";
      txt(ctx, dirTxt, W * 0.5, H * 0.44, 18, "#FEF08A", "#B45309");
      ctx.restore();
    }
    if (state.mirrorWarn > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(state.animT * 20);
      txt(ctx, "🎭 곧 좌우 거울 반전! 침착하게 보세요!", W * 0.5, H * 0.44, 18, "#FBCFE8", "#831843");
      ctx.restore();
    }
    if (state.mirrorTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(236, 72, 153, 0.55)"; ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      txt(ctx, "🎭 거울 반전 중 (" + Math.ceil(state.mirrorTimer) + "초)", W * 0.5, 58, 16, "#FBCFE8", "#831843");
      ctx.restore();
    }
    if (state.gravityTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(168, 85, 247, 0.5)"; ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      txt(ctx, "🙃 중력 반전! 천장 질주 (" + Math.ceil(state.gravityTimer) + "초)", W * 0.5, H - 48, 16, "#E9D5FF", "#4C1D95");
      ctx.restore();
    }
    if (state.feverTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, " + (0.45 + 0.3 * Math.sin(state.animT * 14)).toFixed(2) + ")";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, W - 14, H - 14);
      txt(ctx, "🔥 FEVER TIME! 점수 2배 · 무적 돌진!", W * 0.5, 82, 17, "#FEF08A", "#B45309");
      ctx.restore();
    } else if (state.combo >= 3 && !state.finished) {
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, " + (0.28 + 0.2 * Math.sin(state.animT * 10)).toFixed(2) + ")";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      ctx.restore();
    }
  }

  return {
    project,
    render(ctx, W, H, state) {
      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // 카메라 흔들림 & 커브 뱅킹 틸트
      if (state.shake > 0) {
        const mag = state.shake * 16;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }
      const STAGES = window.SafeMoverStages;
      const S = STAGES[state.stageIdx] || STAGES[0];
      const bank = state.camTilt || 0;
      if (Math.abs(bank) > 0.001) {
        ctx.translate(W * 0.5, H * 0.5);
        ctx.rotate(bank);
        ctx.translate(-W * 0.5, -H * 0.5);
      }

      drawStageBG(ctx, W, H, S, state);
      drawRoad(ctx, W, H, S, state);
      drawBoss(ctx, W, H, S, state);
      if (!state.finished) {
        drawPads(ctx, W, H, S, state);
        drawLaneGuides(ctx, W, H, S, state);
        drawEntities(ctx, W, H, S, state);
      }
      drawPlayer(ctx, W, H, S, state);
      drawSpeedLines(ctx, W, H, state);
      drawRings(ctx, state.rings || []);
      drawBeams(ctx, state.beams);
      drawParts(ctx, state.parts);
      drawPopups(ctx, state.popups);
      drawConfetti(ctx, state.confetti);
      drawModeOverlays(ctx, W, H, state);
      drawStageIntroOverlay(ctx, W, H, S, state);
      if (S.fog) {
        ctx.fillStyle = "rgba(176,190,197," + S.fog + ")";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
  };
})();
