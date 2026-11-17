"use strict";

/* ============================================================
   화려한 2D 캔버스 그래픽 렌더러 (12단계 고유 도로 · 기믹 · 맞춤법 요정 캐릭터)
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
     1. 스테이지별 다층 하늘 & 원경 배경
     ------------------------------------------------------------ */
  function drawStageBG(ctx, W, H, S, stageIdx, animT) {
    const hy = H * 0.36;
    let g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, S.sky[0]);
    g.addColorStop(1, S.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, hy);

    // 지평선 대기 글로우
    const horizonGlow = ctx.createLinearGradient(0, hy * 0.4, 0, hy);
    horizonGlow.addColorStop(0, "rgba(255,255,255,0)");
    horizonGlow.addColorStop(1, S.night ? "rgba(167,139,250,0.28)" : "rgba(255,255,255,0.42)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, hy * 0.4, W, hy * 0.6);

    // 무지개 아치 (구름/축제 스테이지)
    if (S.roadStyle === "rainbow" || S.roadStyle === "cloud") {
      const cols = ["#FCA5A5", "#FDBA74", "#FDE047", "#86EFAC", "#7DD3FC", "#C4B5FD"];
      ctx.save();
      ctx.globalAlpha = 0.35;
      cols.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(W * 0.5, hy + 18, Math.min(W, H) * 0.42 - idx * 7, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 야간/우주/숲 하늘
    if (S.night || S.roadStyle === "forest") {
      const mx = W * 0.84, my = hy * 0.32;
      const glow = ctx.createRadialGradient(mx, my, 8, mx, my, 80);
      glow.addColorStop(0, "rgba(255,249,196,0.82)");
      glow.addColorStop(0.5, "rgba(196,181,253,0.28)");
      glow.addColorStop(1, "rgba(255,249,196,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, my, 80, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.stars ? "#EDE9FE" : "#FEF08A";
      ctx.beginPath(); ctx.arc(mx, my, S.stars ? 20 : 25, 0, Math.PI * 2); ctx.fill();

      // 반짝이는 별 & 유성
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < (S.stars ? 48 : 24); i++) {
        const x = (i * 197 + animT * (S.stars ? 4 : 8)) % W;
        const y = 10 + (i * 53) % (hy - 22);
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(animT * 2.6 + i));
        ctx.globalAlpha = tw;
        ctx.beginPath();
        ctx.arc(x, y, i % 4 === 0 ? 2.6 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (S.stars) {
        const pulse = 1 + Math.sin(animT * 2) * 0.08;
        ctx.fillStyle = "rgba(167,139,250,0.28)";
        ctx.beginPath(); ctx.arc(W * 0.18, hy * 0.54, 44 * pulse, 0, Math.PI * 2); ctx.fill();
        txt(ctx, "🪐", W * 0.18, hy * 0.54, 38 * pulse, "#fff", "rgba(0,0,0,.3)");
        // 유성우
        const mProg = (animT * 0.45) % 1;
        if (mProg < 0.35) {
          const sx = W * 0.7 - mProg * 420;
          const sy = 20 + mProg * 160;
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 38, sy - 14); ctx.stroke();
        }
      }
    } else {
      // 낮 태양 광채
      const sx = W * 0.84, sy = hy * 0.32;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 86);
      sg.addColorStop(0, "rgba(255,245,157,0.9)");
      sg.addColorStop(0.55, "rgba(253,186,116,0.28)");
      sg.addColorStop(1, "rgba(255,235,59,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 86, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.sand ? "#F59E0B" : "#FDE047";
      ctx.beginPath(); ctx.arc(sx, sy, 25, 0, Math.PI * 2); ctx.fill();

      // 폭신한 구름
      ctx.fillStyle = S.rain ? "rgba(226,232,240,0.65)" : "rgba(255,255,255,0.88)";
      for (let i = 0; i < 4; i++) {
        const x = ((i * W / 3.4 + animT * (14 + i * 4)) % (W + 160)) - 80;
        const y = 30 + i * 16;
        ctx.beginPath();
        ctx.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 20, y + 4, 22, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 22, y + 3, 24, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 원경 스카이라인 / 산맥
    ctx.fillStyle = S.night ? "#1E1B4B" : (S.roadStyle === "coral" ? "rgba(14,116,144,0.5)" : "rgba(100,181,246,0.45)");
    ctx.beginPath();
    ctx.moveTo(0, hy);
    if (S.roadStyle === "neon") {
      const bars = [0.07, 0.14, 0.22, 0.31, 0.41, 0.54, 0.66, 0.77, 0.88, 1.0];
      let px = 0;
      bars.forEach((b, idx) => {
        const bh = 32 + ((idx * 41) % 62);
        ctx.lineTo(px, hy - bh);
        ctx.lineTo(W * b, hy - bh);
        px = W * b;
      });
    } else if (S.roadStyle === "sand") {
      ctx.lineTo(W * 0.1, hy - 82); ctx.lineTo(W * 0.22, hy - 22); ctx.lineTo(W * 0.36, hy - 94);
      ctx.lineTo(W * 0.52, hy - 30); ctx.lineTo(W * 0.68, hy - 86); ctx.lineTo(W * 0.84, hy - 26); ctx.lineTo(W, hy - 62);
    } else {
      ctx.lineTo(W * 0.14, hy - 56); ctx.lineTo(W * 0.28, hy - 14); ctx.lineTo(W * 0.46, hy - 74);
      ctx.lineTo(W * 0.62, hy - 18); ctx.lineTo(W * 0.8, hy - 62); ctx.lineTo(W, hy - 22);
    }
    ctx.lineTo(W, hy);
    ctx.closePath();
    ctx.fill();

    // 지상 그라데이션
    g = ctx.createLinearGradient(0, hy, 0, H);
    g.addColorStop(0, S.ground[0]);
    g.addColorStop(1, S.ground[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, hy, W, H - hy);

    // 바닷속 커스틱스 빛기둥
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
        const y = hy + 26 + (i * 47) % (H - hy - 45);
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(animT * 3 + i));
        ctx.globalAlpha = glow;
        ctx.fillStyle = i % 2 ? "#FEF08A" : "#A3E635";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    // 바닷속 거품
    if (S.bubbles) {
      for (let i = 0; i < 18; i++) {
        const x = (i * 71 + Math.sin(animT + i) * 18) % W;
        const y = hy + ((H - hy + 30 - (animT * (26 + (i % 4) * 8) + i * 47) % (H - hy + 30)));
        ctx.strokeStyle = "rgba(224,247,250,0.68)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 3.5 + (i % 4), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // 해변 파도 라인
    if (S.wave && S.roadStyle === "beach") {
      ctx.fillStyle = "rgba(2,136,209,0.32)";
      for (let i = 0; i < 3; i++) {
        const wy = hy + 14 + i * 20 + Math.sin(animT * 2 + i) * 5;
        ctx.beginPath(); ctx.ellipse(W * 0.5, wy, W * 0.65, 9, 0, 0, Math.PI * 2); ctx.fill();
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

    txt(ctx, S.deco, W * 0.5, hy - 22, 22, "#fff", "rgba(0,0,0,.35)");
    txt(ctx, (stageIdx + 1) + "단계 · " + S.icon + " " + S.name, W * 0.5, 22, 15, "#fff", "rgba(0,0,0,.7)");
  }

  /* ------------------------------------------------------------
     2. 도로 양옆 3D 원근 장식물 (스테이지별 고유 프롭)
     ------------------------------------------------------------ */
  function drawRoadsideProp(ctx, theme, x, y, sc, side, animT, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    if (theme === "flower") {
      // 나무 & 꽃덤불
      ctx.fillStyle = "#15803D";
      ctx.beginPath(); ctx.arc(0, -28, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#22C55E";
      ctx.beginPath(); ctx.arc(-8, -32, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#78350F";
      ctx.fillRect(-5, -10, 10, 14);
      drawStar(ctx, side * 14, -2, 6, 5, seed % 2 ? "#F472B6" : "#FACC15");
    } else if (theme === "lamp") {
      // 빗속 가로등
      ctx.fillStyle = "#334155";
      ctx.fillRect(-3, -56, 6, 60);
      ctx.fillStyle = "#FDE047";
      ctx.shadowColor = "#FACC15"; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(side * -4, -56, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    } else if (theme === "maple") {
      // 단풍나무
      ctx.fillStyle = "#78350F";
      ctx.fillRect(-4, -18, 8, 22);
      ctx.fillStyle = seed % 2 ? "#EA580C" : "#F59E0B";
      ctx.beginPath(); ctx.arc(0, -34, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#DC2626";
      ctx.beginPath(); ctx.arc(side * 8, -40, 12, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "snowman") {
      // 눈사람 & 얼음 결정
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(0, -10, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -28, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#EF4444";
      ctx.fillRect(-10, -21, 20, 4);
      ctx.fillStyle = "#F97316";
      ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(side * 8, -26); ctx.lineTo(0, -24); ctx.fill();
    } else if (theme === "cactus") {
      // 사막 선인장
      ctx.fillStyle = "#15803D";
      rr(ctx, -6, -46, 12, 50, 6); ctx.fill();
      rr(ctx, -18, -34, 12, 7, 3); ctx.fill();
      rr(ctx, -18, -44, 7, 16, 3); ctx.fill();
      rr(ctx, 6, -28, 12, 7, 3); ctx.fill();
      rr(ctx, 11, -38, 7, 16, 3); ctx.fill();
    } else if (theme === "neonpost") {
      // 네온 기둥
      const nc = seed % 2 ? "#22D3EE" : "#F472B6";
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(-4, -62, 8, 66);
      ctx.fillStyle = nc;
      ctx.shadowColor = nc; ctx.shadowBlur = 18;
      rr(ctx, -7, -62, 14, 24, 5); ctx.fill();
      ctx.shadowBlur = 0;
    } else if (theme === "palm") {
      // 해변 야자수
      ctx.strokeStyle = "#92400E"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(side * -6, -26, side * -10, -52); ctx.stroke();
      ctx.fillStyle = "#16A34A";
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.ellipse(side * -10 + k * 9, -52 + Math.abs(k) * 3, 14, 5, k * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === "balloon") {
      // 축제 풍선 기둥
      const bc = ["#F43F5E", "#FACC15", "#38BDF8", "#A855F7"][seed % 4];
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -34); ctx.stroke();
      ctx.fillStyle = bc;
      ctx.beginPath(); ctx.ellipse(0, -46 + Math.sin(animT * 3 + seed) * 3, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "mushroom") {
      // 빛나는 숲 버섯
      ctx.fillStyle = "#FEF3C7";
      ctx.fillRect(-4, -18, 8, 22);
      ctx.fillStyle = seed % 2 ? "#A855F7" : "#EC4899";
      ctx.beginPath(); ctx.arc(0, -18, 16, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#FEF08A";
      ctx.beginPath(); ctx.arc(-6, -24, 3, 0, Math.PI * 2); ctx.arc(5, -26, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (theme === "cloudpillar") {
      // 구름 기둥 + 작은 별
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(0, -14, 16, 0, Math.PI * 2); ctx.arc(-10, -8, 11, 0, Math.PI * 2); ctx.arc(10, -8, 11, 0, Math.PI * 2); ctx.fill();
      drawStar(ctx, 0, -36 + Math.sin(animT * 3 + seed) * 3, 8, 5, "#FDE047");
    } else if (theme === "coral") {
      // 바닷속 산호초
      ctx.strokeStyle = seed % 2 ? "#FB7185" : "#2DD4BF";
      ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -34); ctx.moveTo(0, -18); ctx.lineTo(-12, -32); ctx.moveTo(0, -22); ctx.lineTo(12, -36); ctx.stroke();
    } else {
      // 우주 별 부표
      ctx.fillStyle = "#334155";
      ctx.fillRect(-3, -38, 6, 42);
      ctx.shadowColor = "#38BDF8"; ctx.shadowBlur = 16;
      drawStar(ctx, 0, -44, 13, 4, seed % 2 ? "#38BDF8" : "#FDE047");
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------
     3. 스테이지별 고유 도로 & 도착 게이트
     ------------------------------------------------------------ */
  function drawRoad(ctx, W, H, S, stageIdx, totalStages, stageTime, roadScroll, finished, animT) {
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const style = S.roadStyle || "meadow";

    // 도로 외곽 연석 (테마별 색상)
    ctx.beginPath();
    ctx.moveTo(cx - topW - 7, hy); ctx.lineTo(cx + topW + 7, hy);
    ctx.lineTo(cx + botW + 22, H); ctx.lineTo(cx - botW - 22, H);
    ctx.closePath();
    if (style === "neon") ctx.fillStyle = "rgba(34, 211, 238, 0.55)";
    else if (style === "rainbow") ctx.fillStyle = "rgba(253, 224, 71, 0.72)";
    else if (style === "ice") ctx.fillStyle = "rgba(224, 242, 254, 0.78)";
    else if (style === "cloud") ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    else if (style === "galaxy") ctx.fillStyle = "rgba(167, 139, 250, 0.55)";
    else ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.fill();

    // 도로 본체
    ctx.beginPath();
    ctx.moveTo(cx - topW, hy); ctx.lineTo(cx + topW, hy);
    ctx.lineTo(cx + botW, H); ctx.lineTo(cx - botW, H);
    ctx.closePath();

    if (style === "rainbow") {
      // 무지개 3레인 카펫!
      ctx.save();
      ctx.clip();
      const rbCols = ["#FB7185", "#FACC15", "#4ADE80", "#38BDF8", "#C084FC"];
      for (let b = 0; b < 5; b++) {
        const f0 = -1 + b * 0.4;
        const f1 = f0 + 0.4;
        ctx.fillStyle = rbCols[b];
        ctx.globalAlpha = 0.86;
        ctx.beginPath();
        ctx.moveTo(cx + topW * f0, hy); ctx.lineTo(cx + topW * f1, hy);
        ctx.lineTo(cx + botW * f1, H); ctx.lineTo(cx + botW * f0, H);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    } else {
      const g = ctx.createLinearGradient(0, hy, 0, H);
      g.addColorStop(0, S.road[0]);
      g.addColorStop(1, S.road[1]);
      ctx.fillStyle = g;
      ctx.fill();
    }

    // 도로 위 특수 질감 (얼음 빛반사, 네온 레인 글로우, 물광 등)
    if (style === "ice" || style === "wet") {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - topW, hy); ctx.lineTo(cx + topW, hy);
      ctx.lineTo(cx + botW, H); ctx.lineTo(cx - botW, H);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = style === "ice" ? "rgba(255,255,255,0.22)" : "rgba(56,189,248,0.14)";
      const sheenX = cx + Math.sin(animT * 1.2) * W * 0.14;
      ctx.beginPath();
      ctx.moveTo(sheenX - 30, hy); ctx.lineTo(sheenX + 30, hy);
      ctx.lineTo(sheenX + 120, H); ctx.lineTo(sheenX - 60, H);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // 원근 가로선 & 차선
    for (let i = 0; i < 12; i++) {
      const r0 = ((i + roadScroll) / 12) % 1;
      const r1 = ((i + 0.5 + roadScroll) / 12) % 1;
      const z0 = Math.pow(r0, 2.1), z1 = Math.pow(r1, 2.1);
      const y0 = hy + (H - hy) * z0, y1 = hy + (H - hy) * z1;
      const hw0 = topW + (botW - topW) * z0, hw1 = topW + (botW - topW) * z1;

      if (style === "neon") {
        ctx.strokeStyle = "rgba(236, 72, 153, " + (0.18 + 0.35 * z0).toFixed(2) + ")";
      } else if (style === "wood" || style === "beach") {
        ctx.strokeStyle = "rgba(69, 26, 3, " + (0.22 + 0.25 * z0).toFixed(2) + ")";
      } else if (style === "galaxy") {
        ctx.strokeStyle = "rgba(196, 181, 253, " + (0.14 + 0.3 * z0).toFixed(2) + ")";
      } else {
        ctx.strokeStyle = "rgba(255,255,255," + (0.1 + 0.24 * z0).toFixed(2) + ")";
      }
      ctx.lineWidth = (style === "wood" ? 2 : 1.2) + 2.8 * z0;
      ctx.beginPath(); ctx.moveTo(cx - hw0, y0); ctx.lineTo(cx + hw0, y0); ctx.stroke();

      if (z1 > z0) {
        if (style === "neon") ctx.strokeStyle = "rgba(34,211,238,0.85)";
        else if (style === "ice") ctx.strokeStyle = "rgba(255,255,255,0.75)";
        else if (style === "galaxy") ctx.strokeStyle = "rgba(250,204,21,0.75)";
        else if (style === "rainbow") ctx.strokeStyle = "rgba(255,255,255,0.65)";
        else ctx.strokeStyle = "rgba(253,224,71,0.7)";
        ctx.lineWidth = 2 + 4 * z0;
        ctx.lineCap = "round";
        [-0.33, 0.33].forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(cx + hw0 * d, y0);
          ctx.lineTo(cx + hw1 * d, y1);
          ctx.stroke();
        });
      }

      // 바닷속 터널 유리 아치 링
      if (style === "coral" && i % 3 === 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(165, 243, 252, " + (0.2 + 0.45 * z0).toFixed(2) + ")";
        ctx.lineWidth = 2 + 4 * z0;
        ctx.beginPath();
        ctx.ellipse(cx, y0, hw0 * 1.04, hw0 * 0.56, 0, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 도로 양옆 3D 스크롤 프롭 (원근 순서대로 그리기)
    for (let i = 0; i < 6; i++) {
      const r = ((i + roadScroll) / 6) % 1;
      const pz = Math.pow(r, 2.0);
      const py = hy + (H - hy) * pz;
      const hw = topW + (botW - topW) * pz;
      const sc = 0.28 + 0.95 * pz;
      const offset = hw + 28 * sc;
      drawRoadsideProp(ctx, S.propTheme || "flower", cx - offset, py, sc, -1, animT, i);
      drawRoadsideProp(ctx, S.propTheme || "flower", cx + offset, py, sc, 1, animT, i + 1);
    }

    // 도착 게이트
    const remain = S.dur - stageTime;
    if (remain < 4.5 && !finished) {
      const gz = Math.min(1, Math.max(0, (4.5 - remain) / 4.5));
      const pz = Math.pow(gz, 1.8);
      const gy = hy + (H * 0.82 - hy) * pz;
      const hw = topW + (botW - topW) * pz;
      const lx = cx - hw * 0.88, rx = cx + hw * 0.88;
      const ah = 135 * (0.25 + 0.85 * pz);

      ctx.fillStyle = "#FFB300";
      ctx.fillRect(lx - 8, gy - ah, 16, ah);
      ctx.fillRect(rx - 8, gy - ah, 16, ah);
      ctx.fillStyle = stageIdx === totalStages - 1 ? "#6A1B9A" : "#16A34A";
      rr(ctx, lx - 10, gy - ah - 32 * (0.25 + 0.85 * pz), rx - lx + 20, 38 * (0.25 + 0.85 * pz), 10);
      ctx.fill();
      txt(ctx, stageIdx === totalStages - 1 ? "🏁 최종 도착지!" : "🏁 " + (stageIdx + 1) + "단계 도착!",
        cx, gy - ah - 13, Math.max(11, 18 * (0.25 + 0.85 * pz)), "#fff");
    }
  }

  /* ------------------------------------------------------------
     4. 바닥 기믹 패드 (물웅덩이, 네온 부스트, 구름 점프대, 밀물 파도)
     ------------------------------------------------------------ */
  function drawPads(ctx, W, H, S, pads, animT) {
    if (!pads || !pads.length) return;
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const sorted = [...pads].sort((a, b) => a.z - b.z);

    for (const p of sorted) {
      const pz = Math.pow(Math.min(1.2, Math.max(0, p.z)), 2);
      const y = hy + (H * 0.85 - hy) * pz;
      const hw = topW + (botW - topW) * pz;
      const x = cx + p.lane * (hw * 0.62);
      const sc = Math.max(0.24, 0.24 + 0.88 * pz);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);

      if (p.kind === "puddle") {
        // 빗물 웅덩이
        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
        ctx.strokeStyle = "rgba(224, 242, 254, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 56, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const rip = (animT * 1.8 + p.ph) % 1;
        ctx.strokeStyle = "rgba(255,255,255," + (1 - rip).toFixed(2) + ")";
        ctx.beginPath(); ctx.ellipse(0, 0, 18 + rip * 32, 6 + rip * 11, 0, 0, Math.PI * 2); ctx.stroke();
        txt(ctx, "💧미끄덩", 0, -14, 13, "#E0F2FE", "#0369A1");
      } else if (p.kind === "boost") {
        // 네온 부스트 패드
        ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
        ctx.strokeStyle = "#22D3EE";
        ctx.lineWidth = 3.5;
        rr(ctx, -46, -18, 92, 36, 10); ctx.fill(); ctx.stroke();
        const glow = 0.6 + 0.4 * Math.sin(animT * 12);
        ctx.strokeStyle = "rgba(250, 204, 21, " + glow.toFixed(2) + ")";
        ctx.lineWidth = 4;
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath();
          ctx.moveTo(-16, k * 8 + 4); ctx.lineTo(0, k * 8 - 6); ctx.lineTo(16, k * 8 + 4);
          ctx.stroke();
        }
        txt(ctx, "⚡부스트", 0, -24, 13, "#FDE047", "#0F172A");
      } else if (p.kind === "cloud") {
        // 구름 점프대
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -4, 28, 0, Math.PI * 2);
        ctx.arc(-26, 2, 18, 0, Math.PI * 2);
        ctx.arc(26, 2, 18, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        txt(ctx, "☁️점프!", 0, -24 + Math.sin(animT * 8) * 3, 14, "#0284C7", "#fff");
      } else if (p.kind === "tidal") {
        // 해변 밀물 파도
        ctx.fillStyle = "rgba(14, 165, 233, 0.72)";
        ctx.beginPath();
        ctx.ellipse(0, 0, 62, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -4, 42, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        txt(ctx, "🌊파도!", 0, -18, 13, "#fff", "#0369A1");
      }
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------
     5. 바른 맞춤법 카드 · 파워업 · 스테이지별 오타 몬스터
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

    // 반짝이는 후광
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

    // 펄럭이는 날개
    ctx.fillStyle = isGold ? "#FDE047" : "#FEF08A";
    ctx.beginPath(); ctx.ellipse(-64, -4, 19, 9, -0.35 + wingAngle, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(64, -4, 19, 9, 0.35 - wingAngle, 0, Math.PI * 2); ctx.fill();

    // 공전 반짝이 별
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
    ctx.fill();
    ctx.stroke();

    // 상단 배지
    ctx.fillStyle = isGold ? "#D97706" : "#16A34A";
    rr(ctx, -52, -cardH / 2 - 14, 104, 22, 11);
    ctx.fill();
    txt(ctx, isGold ? "⭐ 2배 황금말!" : "⭕ 바른 말!", 0, -cardH / 2 - 3, 12, "#FFFFFF");

    // 단어 텍스트
    txt(ctx, entity.word, 0, 2, entity.word.length >= 6 ? 20 : 24, isGold ? "#78350F" : "#14532D");

    // 가이드 화살표
    const arrowBob = Math.sin(animT * 9 + entity.ph) * 7;
    ctx.save();
    ctx.translate(0, -cardH / 2 - 40 + arrowBob);
    ctx.fillStyle = "#FACC15";
    ctx.strokeStyle = "#15803D";
    ctx.lineWidth = 3;
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

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 8, 46, 12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(0, bob);
    if (entity.hit) ctx.rotate(Math.sin(animT * 30) * 0.35);

    // 스테이지별 몬스터 실루엣 장식
    ctx.fillStyle = col;
    if (etype === "bot" || etype === "alien") {
      // 안테나
      ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-12, -55); ctx.lineTo(-18, -74); ctx.moveTo(12, -55); ctx.lineTo(18, -74); ctx.stroke();
      ctx.fillStyle = "#FDE047";
      ctx.beginPath(); ctx.arc(-18, -74, 5, 0, Math.PI * 2); ctx.arc(18, -74, 5, 0, Math.PI * 2); ctx.fill();
    } else if (etype === "crab") {
      // 집게발
      ctx.fillStyle = "#FB7185";
      ctx.beginPath(); ctx.arc(-44, -36, 12, 0.3, Math.PI * 1.7); ctx.fill();
      ctx.beginPath(); ctx.arc(44, -36, 12, Math.PI * 1.3, Math.PI * 0.7); ctx.fill();
    } else if (etype === "puffer" || etype === "thorn") {
      // 가시
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
      // 기본 뿔/귀
      ctx.beginPath(); ctx.moveTo(-24, -46); ctx.lineTo(-34, -68); ctx.lineTo(-10, -52); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, -46); ctx.lineTo(34, -68); ctx.lineTo(10, -52); ctx.closePath(); ctx.fill();
    }

    // 몬스터 몸통
    ctx.fillStyle = col;
    rr(ctx, -34, -56, 68, 56, 22);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 장난꾸러기 눈
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.arc(-13, -34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath(); ctx.arc(-11, -33, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -33, 4.5, 0, Math.PI * 2); ctx.fill();

    // 찡그린 눈썹
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-22, -45); ctx.lineTo(-6, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, -45); ctx.lineTo(6, -40); ctx.stroke();

    // 틀린 단어 경고 표지판
    const signW = Math.max(122, entity.word.length * 22 + 34);
    const signH = 46;
    ctx.fillStyle = "#FEF2F2";
    ctx.strokeStyle = "#DC2626";
    ctx.lineWidth = 3.5;
    rr(ctx, -signW / 2, -110, signW, signH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#DC2626";
    rr(ctx, -44, -124, 88, 19, 9);
    ctx.fill();
    txt(ctx, "❌ 오타 적!", 0, -114, 11, "#FFFFFF");
    txt(ctx, entity.word, 0, -87, entity.word.length >= 6 ? 18 : 21, "#991B1B");

    // 깜빡이는 X 표시
    const blinkVal = (Math.sin(animT * 8 + entity.ph) + 1) * 0.5;
    if (blinkVal > 0.34) {
      const alpha = Math.min(1, (blinkVal - 0.34) / 0.45);
      ctx.save();
      ctx.translate(0, -87);
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-22, -16); ctx.lineTo(22, 16);
      ctx.moveTo(22, -16); ctx.lineTo(-22, 16);
      ctx.stroke();
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(-22, -16); ctx.lineTo(22, 16);
      ctx.moveTo(22, -16); ctx.lineTo(-22, 16);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawEntities(ctx, W, H, S, entities, animT) {
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const sorted = [...entities].sort((a, b) => a.z - b.z);

    for (const o of sorted) {
      if (o.collected) continue;
      const pz = Math.pow(Math.min(1.2, Math.max(0, o.z)), 2);
      const y = hy + (H * 0.84 - hy) * pz;
      const hw = topW + (botW - topW) * pz;
      const oLane = o.lane + (o.off || 0);
      const x = cx + oLane * (hw * 0.62);
      const sc = Math.min(1.32, Math.max(0.24, 0.24 + 0.88 * pz));

      o.screenX = x;
      o.screenY = y - 34 * sc;
      o.screenR = Math.max(44, 68 * sc);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      if (o.kind === "correct") {
        drawCorrectWordCard(ctx, o, animT);
      } else if (o.kind === "shield" || o.kind === "magnet") {
        drawPowerup(ctx, o, animT);
      } else {
        drawEnemy(ctx, S, o, animT);
      }
      ctx.restore();
    }
  }

  function drawLaneGuides(ctx, W, H, S, entities, animT) {
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    for (const o of entities) {
      if (o.collected || o.hit) continue;
      if (o.kind === "correct" && o.z >= 0.02 && o.z < 0.92) {
        const pulse = 0.2 + 0.16 * Math.sin(animT * 8 + o.ph);
        const oLane = o.lane + (o.off || 0);
        const pz = Math.pow(Math.min(1, Math.max(0.02, o.z)), 2);
        const yEnd = hy + (H * 0.86 - hy) * pz;
        const hwEnd = topW + (botW - topW) * pz;
        const xTop = cx + oLane * (topW * 0.62);
        const xBot = cx + oLane * (botW * 0.62);
        const xNow = cx + oLane * (hwEnd * 0.62);
        ctx.save();
        ctx.strokeStyle = o.isGold
          ? "rgba(250, 204, 21, " + (pulse + 0.12).toFixed(2) + ")"
          : "rgba(74, 222, 128, " + pulse.toFixed(2) + ")";
        ctx.lineWidth = 10 + 10 * pz;
        ctx.lineCap = "round";
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = -animT * 80;
        ctx.beginPath();
        ctx.moveTo(xTop, hy + 4);
        ctx.lineTo(xNow, yEnd);
        ctx.lineTo(xBot, H * 0.92);
        ctx.stroke();
        ctx.restore();
      } else if (o.kind === "enemy" && o.z > 0.52 && o.z < 0.92) {
        const oLane = o.lane + (o.off || 0);
        const pz = Math.pow(Math.min(1, o.z), 2);
        const hwEnd = topW + (botW - topW) * pz;
        const xNow = cx + oLane * (hwEnd * 0.62);
        const yNow = hy + (H * 0.84 - hy) * pz;
        ctx.save();
        ctx.fillStyle = "rgba(239, 68, 68, " + (0.16 + 0.16 * Math.sin(animT * 14)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(xNow, yNow + 4, 46 * pz + 16, 14 * pz + 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ------------------------------------------------------------
     6. 귀여운 맞춤법 요정 캐릭터 "글자 요정 읽걷이"
     (연필 고깔 모자 + 지우개 방울 + 마법 연필 지팡이 + 한글 반짝이)
     ------------------------------------------------------------ */
  function drawPlayer(ctx, W, H, S, state) {
    const { lanePos, laneFlash, stumble, catchAnim, jumpTimer, shield, magnetTimer, boostTimer, combo, animT, entities } = state;
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const hw = topW + (botW - topW) * 0.86;
    const x = cx + lanePos * (hw * 0.62);
    const y = H * 0.85;

    ctx.save();
    ctx.translate(x, y);
    const bounce = Math.sin(animT * 14 * S.speed);
    const cloudJumpY = jumpTimer > 0 ? Math.sin((jumpTimer / 0.85) * Math.PI) * -96 : 0;
    const catchJumpY = catchAnim > 0 ? Math.sin((catchAnim / 0.45) * Math.PI) * -28 : 0;
    const totalJumpY = Math.min(cloudJumpY, catchJumpY);
    const tilt = stumble > 0 ? Math.sin(animT * 28) * 0.28 : (state.lane - lanePos) * 0.25 + bounce * 0.05;

    // 콤보 피버 / 부스트 무지개 아우라
    if (boostTimer > 0 || combo >= 3) {
      ctx.save();
      const feverCol = boostTimer > 0 ? "#22D3EE" : "#FACC15";
      ctx.globalAlpha = 0.32 + 0.15 * Math.sin(animT * 12);
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
      ctx.strokeStyle = "#EC4899";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(0, -64 + totalJumpY, mr, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // 레인 이동 잔상
    if (laneFlash > 0 || boostTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = boostTimer > 0 ? "#FDE047" : "#7DD3FC";
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        const lx = -52 + i * 52;
        ctx.beginPath(); ctx.moveTo(lx, -36); ctx.lineTo(lx - 14, -22); ctx.stroke();
      }
      ctx.restore();
    }

    // 잡기 성공 반짝 원형 후광
    if (catchAnim > 0) {
      const ratio = catchAnim / 0.45;
      ctx.save();
      ctx.globalAlpha = ratio * 0.7;
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, -64 + totalJumpY, 52 + (1 - ratio) * 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 그림자 (점프 높이에 따라 작아짐)
    const shScale = Math.max(0.45, 1 + totalJumpY / 160);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 12, 42 * shScale, 10 * shScale, 0, 0, Math.PI * 2); ctx.fill();

    ctx.translate(0, Math.abs(bounce) * -8 + totalJumpY);
    ctx.rotate(tilt);

    // 펄럭이는 책갈피 망토 (민트-골드 그라데이션)
    const capeGrad = ctx.createLinearGradient(0, -84, 0, -18);
    capeGrad.addColorStop(0, "#0EA5E9");
    capeGrad.addColorStop(1, "#38BDF8");
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(-24, -84); ctx.lineTo(24, -84);
    ctx.lineTo(38 + bounce * 5, -18); ctx.lineTo(0, -24); ctx.lineTo(-38 + bounce * 5, -18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#BAE6FD"; ctx.lineWidth = 2; ctx.stroke();

    // 귀여운 요정 날개 (연한 노랑 반투명)
    const fw = Math.sin(animT * 16) * 0.25;
    ctx.save();
    ctx.fillStyle = "rgba(254, 249, 195, 0.82)";
    ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-34, -70, 16, 9, -0.5 + fw, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(34, -70, 16, 9, 0.5 - fw, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    // 다리 & 노란 꼬마 신발
    ctx.fillStyle = "#334155";
    rr(ctx, -20, -28 + (bounce > 0 ? -6 : 2), 14, 26, 7); ctx.fill();
    rr(ctx, 6, -28 + (bounce < 0 ? -6 : 2), 14, 26, 7); ctx.fill();
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath(); ctx.ellipse(-13, bounce > 0 ? -6 : 4, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, bounce < 0 ? -6 : 4, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

    // 몸통 (귀여운 민트 튜닉 + 바른말 ⭕ 배지)
    const bodyGrad = ctx.createLinearGradient(0, -88, 0, -28);
    bodyGrad.addColorStop(0, "#34D399");
    bodyGrad.addColorStop(1, "#059669");
    ctx.fillStyle = bodyGrad;
    rr(ctx, -28, -86, 56, 56, 20);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.5; ctx.stroke();

    // 가슴 ⭕ 맞춤법 배지
    ctx.fillStyle = "#FEF08A";
    ctx.beginPath(); ctx.arc(0, -56, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#16A34A"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -56, 8, 0, Math.PI * 2); ctx.stroke();

    // 왼팔 (작은 펼친 책 들기) & 오른팔 (마법 연필 지휘봉!)
    const armL = catchAnim > 0 ? -2.2 : bounce * 0.3;
    const armR = catchAnim > 0 ? 2.2 : -bounce * 0.3;

    ctx.save();
    ctx.translate(-32, -74);
    ctx.rotate(armL);
    ctx.fillStyle = "#6EE7B7";
    rr(ctx, -8, 0, 15, 28, 7.5); ctx.fill();
    // 미니 공책
    ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#0284C7"; ctx.lineWidth = 2;
    rr(ctx, -12, 22, 18, 14, 3); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(32, -74);
    ctx.rotate(armR);
    ctx.fillStyle = "#6EE7B7";
    rr(ctx, -7, 0, 15, 28, 7.5); ctx.fill();
    // 마법 연필 지휘봉!
    ctx.save();
    ctx.translate(4, 24);
    ctx.rotate(-0.55);
    ctx.fillStyle = "#FACC15";
    rr(ctx, -3, -24, 6, 28, 2); ctx.fill();
    ctx.fillStyle = "#FDE68A";
    ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(3, -24); ctx.lineTo(0, -32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath(); ctx.moveTo(-1.2, -29); ctx.lineTo(1.2, -29); ctx.lineTo(0, -32); ctx.closePath(); ctx.fill();
    drawStar(ctx, 0, -36, 5.5, 4, "#FEF08A");
    ctx.restore();
    ctx.restore();

    // 동글동글 얼굴
    ctx.fillStyle = "#FDE68A";
    ctx.beginPath(); ctx.arc(0, -106, 25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2; ctx.stroke();

    // 핑크 볼터치
    ctx.fillStyle = "rgba(251, 113, 133, 0.55)";
    ctx.beginPath(); ctx.ellipse(-13, -98, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -98, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // 연필 고깔 모자 (노란 연필 몸체 + 은색 띠 + 핑크 지우개 방울!)
    // 은색 모자 테두리
    ctx.fillStyle = "#E2E8F0";
    rr(ctx, -25, -124, 50, 9, 4); ctx.fill();
    ctx.strokeStyle = "#94A3B8"; ctx.lineWidth = 1.8; ctx.stroke();
    // 노란 연필 고깔
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.moveTo(-22, -124); ctx.lineTo(22, -124); ctx.lineTo(10, -158); ctx.lineTo(-10, -158);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#CA8A04"; ctx.lineWidth = 2; ctx.stroke();
    // 연필 모자 위 한글 배지 'ㅎ'
    txt(ctx, "ㄱ", 0, -138, 12, "#92400E");
    // 핑크 지우개 폼폼
    ctx.fillStyle = "#F472B6";
    rr(ctx, -11, -170, 22, 13, 6); ctx.fill();
    ctx.strokeStyle = "#DB2777"; ctx.lineWidth = 2; ctx.stroke();

    // 반짝이는 큰 눈 (깜빡임 애니메이션!)
    const isBlink = (animT % 3.6) > 3.45;
    if (stumble > 0) {
      // >< 표정
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

    // 귀여운 입
    ctx.strokeStyle = "#B45309";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    if (stumble > 0) ctx.arc(0, -91, 4.5, Math.PI, 0);
    else if (catchAnim > 0) {
      ctx.fillStyle = "#FB7185";
      ctx.arc(0, -95, 5.5, 0, Math.PI);
      ctx.fill();
    } else ctx.arc(0, -96, 5.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 주변을 맴도는 작은 한글 자모 반짝이
    const jamo = ["ㄱ", "ㅏ", "ㅎ"];
    for (let j = 0; j < 3; j++) {
      const a = animT * 2.2 + j * 2.09;
      const jx = Math.cos(a) * 44;
      const jy = -82 + Math.sin(a * 1.4) * 14;
      ctx.globalAlpha = 0.78;
      txt(ctx, jamo[j], jx, jy, 12, "#FEF08A", "#0284C7");
    }
    ctx.globalAlpha = 1;

    // 부딪혔을 때 어지러운 별
    if (stumble > 0) {
      for (let i = 0; i < 3; i++) {
        const a = animT * 10 + i * 2.09;
        txt(ctx, "⭐", Math.cos(a) * 34, -182 + Math.sin(a) * 10, 16, "#FFEB3B", "#000");
      }
    }
    ctx.restore();

    // 거품 보호막 쉴드 렌더링
    if (shield > 0) {
      ctx.save();
      const sb = ctx.createRadialGradient(-12, -88 + totalJumpY, 8, 0, -72 + totalJumpY, 68);
      sb.addColorStop(0, "rgba(255,255,255,0.05)");
      sb.addColorStop(0.75, "rgba(56,189,248,0.22)");
      sb.addColorStop(1, "rgba(186,230,253,0.75)");
      ctx.fillStyle = sb;
      ctx.strokeStyle = "#7DD3FC";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -72 + totalJumpY, 66 + Math.sin(animT * 6) * 2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // 가장 가까운 바른 단어가 다른 레인에 있으면 방향 가이드 화살표 표시
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
      const gy = y - 64;
      ctx.save();
      ctx.fillStyle = "#FACC15";
      ctx.strokeStyle = "#15803D";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx + dir * 18, gy);
      ctx.lineTo(gx - dir * 8, gy - 15);
      ctx.lineTo(gx - dir * 8, gy + 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    return { x, y: y - 70 + totalJumpY };
  }

  /* ------------------------------------------------------------
     7. 이펙트 레이어 (링, 빛줄기, 파티클, 캔버스 팝업, 스테이지 인트로 배너)
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
      ctx.lineWidth = 6 * b.life;
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
        ctx.strokeStyle = p.c;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y + 12); ctx.stroke();
      } else if (p.text) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        txt(ctx, p.text, p.x, p.y, p.s * 2.1, p.c, "rgba(0,0,0,0.45)");
        ctx.restore();
      } else {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 0.55, 0, Math.PI * 2);
        ctx.fill();
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
      ctx.translate(p.x, p.y);
      ctx.scale(sc, sc);
      txt(ctx, p.text, 0, 0, p.size || 20, p.c || "#FDE047", "rgba(15,23,42,0.88)");
      ctx.restore();
    }
  }

  function drawConfetti(ctx, confetti) {
    for (const p of confetti) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      rr(ctx, -p.s / 2, -p.s * 0.3, p.s, p.s * 0.6, 3);
      ctx.fill();
      ctx.restore();
    }
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
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#FDE047";
    ctx.lineWidth = 3;
    rr(ctx, -bw / 2, -46, bw, 92, 20);
    ctx.fill();
    ctx.stroke();

    txt(ctx, (state.stageIdx + 1) + "단계 " + S.icon + " " + S.name, 0, -16, 20, "#FFFFFF");
    txt(ctx, "기믹: " + S.gimmickLabel, 0, 14, 14, "#FDE047");
    ctx.restore();
  }

  function drawWindWarning(ctx, W, H, state) {
    if (state.windWarn > 0) {
      ctx.save();
      const alpha = 0.5 + 0.5 * Math.sin(state.animT * 18);
      ctx.globalAlpha = alpha;
      const dirTxt = state.nextWindDir < 0 ? "🌪️ 왼쪽으로 강풍 예고! → 오른쪽 버티기!" : "🌪️ 오른쪽으로 강풍 예고! ← 왼쪽 버티기!";
      txt(ctx, dirTxt, W * 0.5, H * 0.44, 18, "#FEF08A", "#B45309");
      ctx.restore();
    }
    if (state.combo >= 3 && !state.finished) {
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, " + (0.28 + 0.2 * Math.sin(state.animT * 10)).toFixed(2) + ")";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      ctx.restore();
    }
  }

  return {
    render(ctx, W, H, state) {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (state.shake > 0) {
        const mag = state.shake * 16;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }
      const STAGES = window.SafeMoverStages;
      const S = STAGES[state.stageIdx] || STAGES[0];
      drawStageBG(ctx, W, H, S, state.stageIdx, state.animT);
      drawRoad(ctx, W, H, S, state.stageIdx, STAGES.length, state.stageTime, state.roadScroll, state.finished, state.animT);
      if (!state.finished) {
        drawPads(ctx, W, H, S, state.pads, state.animT);
        drawLaneGuides(ctx, W, H, S, state.entities, state.animT);
        drawEntities(ctx, W, H, S, state.entities, state.animT);
      }
      drawPlayer(ctx, W, H, S, state);
      drawRings(ctx, state.rings || []);
      drawBeams(ctx, state.beams);
      drawParts(ctx, state.parts);
      drawPopups(ctx, state.popups);
      drawConfetti(ctx, state.confetti);
      drawWindWarning(ctx, W, H, state);
      drawStageIntroOverlay(ctx, W, H, S, state);
      if (S.fog) {
        ctx.fillStyle = "rgba(176,190,197," + S.fog + ")";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
  };
})();
