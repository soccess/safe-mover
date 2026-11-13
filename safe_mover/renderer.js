"use strict";

/* ============================================================
   강화된 2D 캔버스 그래픽 렌더러
   - 다층 배경 (하늘 그라데이션, 해/달 광채, 원경 산/도시, 도로 연석)
   - 맞춤법 맞는 단어 아이템 (황금/초록 빛나는 카드 + 날개 + 터치 힌트)
   - 틀린 단어 적 (테마 몬스터 스프라이트 + 경고 표지판)
   - 수집 빔 & 파티클 & 컨페티
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

  function drawStageBG(ctx, W, H, S, stageIdx, animT) {
    const hy = H * 0.36;
    let g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, S.sky[0]);
    g.addColorStop(1, S.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, hy);

    if (S.night) {
      // 달/행성 글로우
      const mx = W * 0.84, my = hy * 0.32;
      const glow = ctx.createRadialGradient(mx, my, 8, mx, my, 64);
      glow.addColorStop(0, "rgba(255,249,196,0.65)");
      glow.addColorStop(1, "rgba(255,249,196,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, my, 64, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.stars ? "#EDE9FE" : "#FEF08A";
      ctx.beginPath(); ctx.arc(mx, my, S.stars ? 20 : 26, 0, Math.PI * 2); ctx.fill();

      // 반짝이는 별
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < (S.stars ? 40 : 18); i++) {
        const x = (i * 197 + animT * (S.stars ? 3 : 8)) % W;
        const y = 10 + (i * 53) % (hy - 22);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(animT * 2.2 + i));
        ctx.globalAlpha = tw;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3 === 0 ? 2.4 : 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (S.stars) {
        const pulse = 1 + Math.sin(animT * 2) * 0.08;
        ctx.fillStyle = "rgba(139,92,246,0.28)";
        ctx.beginPath(); ctx.arc(W * 0.2, hy * 0.56, 40 * pulse, 0, Math.PI * 2); ctx.fill();
        txt(ctx, "🪐", W * 0.2, hy * 0.56, 38 * pulse, "#fff", "rgba(0,0,0,.3)");
      }
    } else {
      // 태양 광채
      const sx = W * 0.84, sy = hy * 0.34;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 70);
      sg.addColorStop(0, "rgba(255,235,59,0.75)");
      sg.addColorStop(1, "rgba(255,235,59,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.sand ? "#F59E0B" : "#FDE047";
      ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();

      // 폭신한 구름
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      for (let i = 0; i < 4; i++) {
        const x = ((i * W / 3.5 + animT * (14 + i * 4)) % (W + 160)) - 80;
        const y = 34 + i * 18;
        ctx.beginPath();
        ctx.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 20, y + 4, 22, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 22, y + 3, 24, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 원경 산 / 빌딩 실루엣
    ctx.fillStyle = S.night ? "#1E1B4B" : "rgba(100,181,246,0.55)";
    ctx.beginPath();
    ctx.moveTo(0, hy);
    if (stageIdx === 5) {
      // 야간 도시 빌딩 스카이라인
      const bars = [0.08, 0.14, 0.22, 0.30, 0.42, 0.55, 0.68, 0.78, 0.88, 1.0];
      let px = 0;
      bars.forEach((b, idx) => {
        const bh = 35 + ((idx * 37) % 55);
        ctx.lineTo(px, hy - bh);
        ctx.lineTo(W * b, hy - bh);
        px = W * b;
      });
    } else if (stageIdx === 4) {
      ctx.lineTo(W * 0.1, hy - 80); ctx.lineTo(W * 0.2, hy - 22); ctx.lineTo(W * 0.35, hy - 92);
      ctx.lineTo(W * 0.5, hy - 30); ctx.lineTo(W * 0.65, hy - 85); ctx.lineTo(W * 0.8, hy - 25); ctx.lineTo(W, hy - 60);
    } else {
      ctx.lineTo(W * 0.14, hy - 60); ctx.lineTo(W * 0.28, hy - 12); ctx.lineTo(W * 0.45, hy - 78);
      ctx.lineTo(W * 0.62, hy - 18); ctx.lineTo(W * 0.8, hy - 64); ctx.lineTo(W, hy - 20);
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

    // 반딧불 / 구름 / 거품 / 파도
    if (S.fireflies) {
      for (let i = 0; i < 16; i++) {
        const x = (i * 83 + Math.sin(animT * 1.5 + i) * 24 + W) % W;
        const y = hy + 30 + (i * 47) % (H - hy - 45);
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(animT * 3 + i));
        ctx.globalAlpha = glow;
        ctx.fillStyle = i % 2 ? "#FFF59D" : "#B2FF59";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    if (S.bubbles) {
      for (let i = 0; i < 16; i++) {
        const x = (i * 71 + Math.sin(animT + i) * 18) % W;
        const y = hy + ((H - hy + 30 - (animT * (24 + (i % 4) * 7) + i * 47) % (H - hy + 30)));
        ctx.strokeStyle = "rgba(224,247,250,0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2); ctx.stroke();
      }
    }

    if (S.wave) {
      ctx.fillStyle = "rgba(2,136,209,0.35)";
      for (let i = 0; i < 3; i++) {
        const wy = hy + 16 + i * 18 + Math.sin(animT * 2 + i) * 5;
        ctx.beginPath(); ctx.ellipse(W * 0.5, wy, W * 0.62, 9, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (S.confettiBg) {
      for (let i = 0; i < 12; i++) {
        const x = (i * 97 + animT * 26) % W;
        const y = 55 + ((i * 59) % 110) + Math.sin(animT * 2 + i) * 8;
        txt(ctx, ["🎈", "🌈", "🎉", "⭐"][i % 4], x, y, 18, "#fff");
      }
    }

    txt(ctx, S.deco, W * 0.5, hy - 22, 22, "#fff", "rgba(0,0,0,.35)");
    txt(ctx, (stageIdx + 1) + "단계 · " + S.icon + " " + S.name, W * 0.5, 24, 15, "#fff", "rgba(0,0,0,.65)");
  }

  function drawRoad(ctx, W, H, S, stageIdx, totalStages, stageTime, roadScroll, finished) {
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;

    // 도로 외곽 연석
    ctx.beginPath();
    ctx.moveTo(cx - topW - 6, hy); ctx.lineTo(cx + topW + 6, hy);
    ctx.lineTo(cx + botW + 18, H); ctx.lineTo(cx - botW - 18, H);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fill();

    // 도로 본체
    ctx.beginPath();
    ctx.moveTo(cx - topW, hy); ctx.lineTo(cx + topW, hy);
    ctx.lineTo(cx + botW, H); ctx.lineTo(cx - botW, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, hy, 0, H);
    g.addColorStop(0, S.road[0]);
    g.addColorStop(1, S.road[1]);
    ctx.fillStyle = g;
    ctx.fill();

    // 원근 가로선 & 차선
    for (let i = 0; i < 12; i++) {
      const r0 = ((i + roadScroll) / 12) % 1;
      const r1 = ((i + 0.5 + roadScroll) / 12) % 1;
      const z0 = Math.pow(r0, 2.1), z1 = Math.pow(r1, 2.1);
      const y0 = hy + (H - hy) * z0, y1 = hy + (H - hy) * z1;
      const hw0 = topW + (botW - topW) * z0, hw1 = topW + (botW - topW) * z1;

      ctx.strokeStyle = "rgba(255,255,255," + (0.09 + 0.2 * z0).toFixed(2) + ")";
      ctx.lineWidth = 1.2 + 2.5 * z0;
      ctx.beginPath(); ctx.moveTo(cx - hw0, y0); ctx.lineTo(cx + hw0, y0); ctx.stroke();

      if (z1 > z0) {
        ctx.strokeStyle = "rgba(253,224,71,0.65)";
        ctx.lineWidth = 2 + 4 * z0;
        ctx.lineCap = "round";
        [-0.33, 0.33].forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(cx + hw0 * d, y0);
          ctx.lineTo(cx + hw1 * d, y1);
          ctx.stroke();
        });
      }
    }

    // 도착 게이트
    const remain = S.dur - stageTime;
    if (remain < 4 && !finished) {
      const gz = Math.min(1, Math.max(0, (4 - remain) / 4));
      const pz = Math.pow(gz, 1.8);
      const gy = hy + (H * 0.82 - hy) * pz;
      const hw = topW + (botW - topW) * pz;
      const lx = cx - hw * 0.85, rx = cx + hw * 0.85;
      const ah = 135 * (0.25 + 0.85 * pz);

      ctx.fillStyle = "#FFB300";
      ctx.fillRect(lx - 8, gy - ah, 16, ah);
      ctx.fillRect(rx - 8, gy - ah, 16, ah);
      ctx.fillStyle = stageIdx === totalStages - 1 ? "#6A1B9A" : "#2E7D32";
      rr(ctx, lx - 10, gy - ah - 30 * (0.25 + 0.85 * pz), rx - lx + 20, 36 * (0.25 + 0.85 * pz), 8);
      ctx.fill();
      txt(ctx, stageIdx === totalStages - 1 ? "🏁 최종 도착지!" : "🏁 " + (stageIdx + 1) + "단계 도착!",
        cx, gy - ah - 12, Math.max(10, 18 * (0.25 + 0.85 * pz)), "#fff");
    }
  }

  function drawCorrectWordCard(ctx, entity, sc, animT) {
    const pulse = 1 + Math.sin(animT * 7 + entity.ph) * 0.06;
    const floatY = Math.sin(animT * 5 + entity.ph) * 8;
    const wingAngle = Math.sin(animT * 14 + entity.ph) * 0.32;
    ctx.save();
    ctx.translate(0, -34 + floatY);
    ctx.scale(pulse, pulse);

    // 반짝이는 후광
    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 72);
    aura.addColorStop(0, "rgba(74, 222, 128, 0.62)");
    aura.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, 72, 0, Math.PI * 2); ctx.fill();

    // 펄럭이는 귀여운 날개
    ctx.fillStyle = "#FEF08A";
    ctx.beginPath(); ctx.ellipse(-62, -4, 17, 9, -0.35 + wingAngle, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(62, -4, 17, 9, 0.35 - wingAngle, 0, Math.PI * 2); ctx.fill();

    // 공전 반짝이 별
    for (let i = 0; i < 2; i++) {
      const a = animT * 3.5 + entity.ph + i * Math.PI;
      const sx = Math.cos(a) * 68;
      const sy = Math.sin(a) * 24 - 6;
      ctx.fillStyle = "#FDE047";
      ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();
    }

    // 단어 카드 본체
    const cardW = Math.max(116, entity.word.length * 24 + 34);
    const cardH = 54;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#16A34A";
    ctx.lineWidth = 4;
    rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // 상단 배지
    ctx.fillStyle = "#16A34A";
    rr(ctx, -44, -cardH / 2 - 14, 88, 22, 11);
    ctx.fill();
    txt(ctx, "👆 터치!", 0, -cardH / 2 - 3, 12, "#FFFFFF");

    // 바른 단어 텍스트
    txt(ctx, entity.word, 0, 2, 23, "#14532D");

    ctx.restore();
  }

  function drawEnemy(ctx, S, entity, animT) {
    const bob = Math.sin(animT * 10 + entity.ph) * 4;
    const col = S.enemyColor || "#E53935";

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 8, 46, 12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(0, bob);
    if (entity.hit) ctx.rotate(Math.sin(animT * 30) * 0.35);

    // 몬스터 뿔/귀
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-24, -46); ctx.lineTo(-34, -68); ctx.lineTo(-10, -52); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(24, -46); ctx.lineTo(34, -68); ctx.lineTo(10, -52); ctx.closePath(); ctx.fill();

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
    const signW = Math.max(114, entity.word.length * 23 + 32);
    const signH = 44;
    ctx.fillStyle = "#FEF2F2";
    ctx.strokeStyle = "#DC2626";
    ctx.lineWidth = 3.5;
    rr(ctx, -signW / 2, -108, signW, signH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#DC2626";
    rr(ctx, -40, -122, 80, 19, 9);
    ctx.fill();
    txt(ctx, "❌ 오타 피하기", 0, -112, 11, "#FFFFFF");
    txt(ctx, entity.word, 0, -86, 21, "#991B1B");

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

      // 터치 히트박스 기록 (화면 좌표)
      o.screenX = x;
      o.screenY = y - 34 * sc;
      o.screenR = Math.max(44, 68 * sc);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      if (o.kind === "correct") {
        drawCorrectWordCard(ctx, o, sc, animT);
      } else {
        drawEnemy(ctx, S, o, animT);
      }
      ctx.restore();
    }
  }

  function drawPlayer(ctx, W, H, S, lanePos, laneFlash, stumble, animT) {
    const hy = H * 0.36, cx = W * 0.5, nw = S.narrow || 1;
    const topW = W * 0.1 * nw, botW = W * 0.44 * nw;
    const hw = topW + (botW - topW) * 0.86;
    const x = cx + lanePos * (hw * 0.62);
    const y = H * 0.85;

    ctx.save();
    ctx.translate(x, y);
    const bounce = Math.sin(animT * 14 * S.speed);
    const tilt = stumble > 0 ? Math.sin(animT * 28) * 0.28 : bounce * 0.06;

    if (laneFlash > 0) {
      ctx.globalAlpha = (laneFlash / 0.24) * 0.5;
      ctx.strokeStyle = "#7DD3FC";
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        const lx = -54 + i * 54;
        ctx.beginPath(); ctx.moveTo(lx, -40); ctx.lineTo(lx - 14, -40); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.ellipse(0, 12, 44, 11, 0, 0, Math.PI * 2); ctx.fill();

    ctx.translate(0, Math.abs(bounce) * -9);
    ctx.rotate(tilt);

    // 망토
    ctx.fillStyle = "#0284C7";
    ctx.beginPath();
    ctx.moveTo(-26, -84); ctx.lineTo(26, -84);
    ctx.lineTo(38 + bounce * 4, -20); ctx.lineTo(-38 + bounce * 4, -20);
    ctx.closePath();
    ctx.fill();

    // 다리
    ctx.fillStyle = "#1E3A8A";
    rr(ctx, -24, -30 + (bounce > 0 ? -6 : 2), 18, 30, 8); ctx.fill();
    rr(ctx, 6, -30 + (bounce < 0 ? -6 : 2), 18, 30, 8); ctx.fill();

    // 신발
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath(); ctx.ellipse(-15, bounce > 0 ? -8 : 4, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, bounce < 0 ? -8 : 4, 13, 7, 0, 0, Math.PI * 2); ctx.fill();

    // 몸통 (맞춤법 수호대 조끼)
    ctx.fillStyle = "#10B981";
    rr(ctx, -30, -86, 60, 60, 16);
    ctx.fill();
    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(-26, -60, 52, 8);
    txt(ctx, "🛡️", 0, -56, 22, "#fff");

    // 팔
    ctx.fillStyle = "#34D399";
    ctx.save(); ctx.translate(-38, -76); ctx.rotate(bounce * 0.35); rr(ctx, -9, 0, 18, 32, 9); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(38, -76); ctx.rotate(-bounce * 0.35); rr(ctx, -9, 0, 18, 32, 9); ctx.fill(); ctx.restore();

    // 머리 & 헬멧
    ctx.fillStyle = "#FDE68A";
    ctx.beginPath(); ctx.arc(0, -104, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0EA5E9";
    ctx.beginPath(); ctx.arc(0, -106, 26, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#38BDF8";
    rr(ctx, -18, -112, 36, 9, 4); ctx.fill();

    // 눈
    ctx.fillStyle = "#1E293B";
    ctx.beginPath(); ctx.arc(-8, -101, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -101, 3, 0, Math.PI * 2); ctx.fill();

    if (stumble > 0) {
      for (let i = 0; i < 3; i++) {
        const a = animT * 10 + i * 2.09;
        txt(ctx, "⭐", Math.cos(a) * 34, -140 + Math.sin(a) * 10, 16, "#FFEB3B", "#000");
      }
    }
    ctx.restore();
    return { x, y: y - 70 };
  }

  function drawBeams(ctx, beams) {
    for (const b of beams) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.strokeStyle = "#4ADE80";
      ctx.lineWidth = 6 * b.life;
      ctx.shadowColor = "#22C55E";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2, Math.min(b.y1, b.y2) - 40, b.x2, b.y2);
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

  return {
    render(ctx, W, H, state) {
      ctx.clearRect(0, 0, W, H);
      const STAGES = window.SafeMoverStages;
      const S = STAGES[state.stageIdx] || STAGES[0];
      drawStageBG(ctx, W, H, S, state.stageIdx, state.animT);
      drawRoad(ctx, W, H, S, state.stageIdx, STAGES.length, state.stageTime, state.roadScroll, state.finished);
      if (!state.finished) {
        drawEntities(ctx, W, H, S, state.entities, state.animT);
      }
      drawPlayer(ctx, W, H, S, state.lanePos, state.laneFlash, state.stumble, state.animT);
      drawBeams(ctx, state.beams);
      drawParts(ctx, state.parts);
      drawConfetti(ctx, state.confetti);
      if (S.fog) {
        ctx.fillStyle = "rgba(176,190,197," + S.fog + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }
  };
})();
