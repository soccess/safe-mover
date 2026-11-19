"use strict";

/* ============================================================
   공통 태블릿 액션 게임 엔진 (강화된 패럴랙스 배경 · 3D 글로시 캐릭터 · 한국 화폐 벡터 렌더러)
   ============================================================ */
window.MathArcadeEngine = (() => {
  const VW = 960;
  const VH = 560;

  const fx = {
    particles: [],
    rings: [],
    popups: [],
    confetti: [],
    shake: 0,
    flashColor: "",
    flashAlpha: 0
  };

  const MONEY_META = {
    10: { type: "coin", r: 25, bg: "#d97706", rim: "#fcd34d", text: "#78350f", name: "10원", clue: "구리빛 다보탑 10원!" },
    50: { type: "coin", r: 29, bg: "#cbd5e1", rim: "#f8fafc", text: "#334155", name: "50원", clue: "벼 이삭 은색 50원!" },
    100: { type: "coin", r: 33, bg: "#e2e8f0", rim: "#ffffff", text: "#1e293b", name: "100원", clue: "이순신 장군 100원!" },
    500: { type: "coin", r: 38, bg: "#f1f5f9", rim: "#fde047", text: "#0f172a", name: "500원", clue: "날아가는 학 500원!" },
    1000: { type: "bill", w: 108, h: 54, bg: "#2563eb", light: "#dbeafe", rim: "#93c5fd", name: "1,000원", clue: "파란색 1,000원 지폐!" },
    5000: { type: "bill", w: 114, h: 56, bg: "#ea580c", light: "#ffedd5", rim: "#fdba74", name: "5,000원", clue: "주황색 5,000원 지폐!" },
    10000: { type: "bill", w: 120, h: 58, bg: "#16a34a", light: "#dcfce7", rim: "#86efac", name: "10,000원", clue: "초록색 10,000원 지폐!" }
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function rand(lo, hi) {
    return lo + Math.random() * (hi - lo);
  }

  function randInt(lo, hi) {
    return Math.floor(rand(lo, hi + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function clearFx() {
    fx.particles.length = 0;
    fx.rings.length = 0;
    fx.popups.length = 0;
    fx.confetti.length = 0;
    fx.shake = 0;
    fx.flashAlpha = 0;
  }

  function spawnParticles(x, y, color = "#fde047", count = 14, speed = 220, size = 6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(speed * 0.35, speed);
      fx.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(20, 90),
        r: rand(size * 0.5, size * 1.35),
        life: 0,
        maxLife: rand(0.4, 0.78),
        color,
        star: i % 3 === 0,
        rot: rand(0, Math.PI * 2),
        gravity: 330
      });
    }
  }

  function spawnRing(x, y, color = "#38bdf8", maxR = 75) {
    fx.rings.push({ x, y, r: 8, maxR, color, life: 0, maxLife: 0.44 });
  }

  function spawnPopup(x, y, text, color = "#fde047", size = 24) {
    fx.popups.push({ x, y, vy: -76, text: String(text), color, size, life: 0, maxLife: 0.98 });
  }

  function spawnConfetti(count = 45) {
    const colors = ["#fde047", "#38bdf8", "#4ade80", "#f472b6", "#fb923c", "#c084fc"];
    for (let i = 0; i < count; i++) {
      fx.confetti.push({
        x: rand(40, VW - 40),
        y: rand(-40, 120),
        vx: rand(-95, 95),
        vy: rand(120, 290),
        w: rand(7, 13),
        h: rand(5, 9),
        rot: rand(0, Math.PI * 2),
        vr: rand(-7, 7),
        color: pick(colors),
        life: 0,
        maxLife: rand(1.6, 2.8)
      });
    }
  }

  function shake(amount = 8) {
    fx.shake = Math.max(fx.shake, amount);
  }

  function flash(color = "#ffffff", alpha = 0.25) {
    fx.flashColor = color;
    fx.flashAlpha = Math.max(fx.flashAlpha, alpha);
  }

  function updateFx(dt) {
    if (fx.shake > 0) fx.shake = Math.max(0, fx.shake - dt * 28);
    if (fx.flashAlpha > 0) fx.flashAlpha = Math.max(0, fx.flashAlpha - dt * 1.4);

    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const p = fx.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) { fx.particles.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += dt * 5;
    }

    for (let i = fx.rings.length - 1; i >= 0; i--) {
      const r = fx.rings[i];
      r.life += dt;
      if (r.life >= r.maxLife) { fx.rings.splice(i, 1); continue; }
      r.r = 8 + (r.maxR - 8) * (1 - Math.pow(1 - r.life / r.maxLife, 2));
    }

    for (let i = fx.popups.length - 1; i >= 0; i--) {
      const pop = fx.popups[i];
      pop.life += dt;
      if (pop.life >= pop.maxLife) { fx.popups.splice(i, 1); continue; }
      pop.y += pop.vy * dt;
      pop.vy *= 0.94;
    }

    for (let i = fx.confetti.length - 1; i >= 0; i--) {
      const c = fx.confetti[i];
      c.life += dt;
      if (c.life >= c.maxLife || c.y > VH + 30) { fx.confetti.splice(i, 1); continue; }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
    }
  }

  function drawStar(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? r : r * 0.42;
      const a = (i * Math.PI) / 4;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFx(ctx) {
    for (const r of fx.rings) {
      const a = 1 - r.life / r.maxLife;
      ctx.save();
      ctx.globalAlpha = a * 0.88;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 4.5 * a + 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const p of fx.particles) {
      const a = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.star) {
        drawStar(ctx, p.x, p.y, Math.max(2, p.r * a * 1.4), p.rot);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.2, p.r * a), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const c of fx.confetti) {
      const a = Math.min(1, (1 - c.life / c.maxLife) * 1.5);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }

    for (const pop of fx.popups) {
      const t = pop.life / pop.maxLife;
      const a = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      const sc = t < 0.14 ? 0.6 + (t / 0.14) * 0.56 : 1.0;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.translate(pop.x, pop.y);
      ctx.scale(sc, sc);
      ctx.font = `900 ${pop.size}px 'Pretendard','Malgun Gothic',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(15,23,42,0.9)";
      ctx.strokeText(pop.text, 0, 0);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }
  }

  /* ---------- 강화된 벡터 배경 & 지형 ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawSkyBackdrop(ctx, cTop, cBot, time = 0, theme = "day") {
    const grad = ctx.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, cTop);
    grad.addColorStop(1, cBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VW, VH);

    if (theme === "night" || theme === "space") {
      // 성운 글로우
      ctx.save();
      const neb = ctx.createRadialGradient(VW * 0.75, 130, 10, VW * 0.75, 130, 260);
      neb.addColorStop(0, "rgba(168,85,247,0.22)");
      neb.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, VW, VH);

      for (let i = 0; i < 30; i++) {
        const sx = (i * 173 + 47) % VW;
        const sy = (i * 97 + 23) % (VH * 0.68);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 2.2 + i));
        ctx.fillStyle = `rgba(255,255,255,${tw * 0.8})`;
        if (i % 6 === 0) drawStar(ctx, sx, sy, 3.6 * tw + 1, time + i);
        else {
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 2) + 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 먼 산 실루엣
      ctx.fillStyle = "rgba(15,23,42,0.34)";
      ctx.beginPath();
      ctx.moveTo(0, VH);
      for (let x = 0; x <= VW; x += 60) {
        ctx.lineTo(x, VH - 125 - Math.sin(x * 0.012 + 1) * 32);
      }
      ctx.lineTo(VW, VH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // 따스한 태양 광선 & 구름 + 원경 언덕
      ctx.save();
      const sunX = 115;
      const sunY = 92;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 135);
      sunGlow.addColorStop(0, "rgba(254,240,138,0.65)");
      sunGlow.addColorStop(1, "rgba(254,240,138,0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 135, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.28)";
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 210 + time * (10 + i * 2.5)) % (VW + 180)) - 90;
        const cy = 62 + (i % 3) * 42;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy - 9, 30, 0, Math.PI * 2);
        ctx.arc(cx + 46, cy, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // 패럴랙스 초록/연한 언덕
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.moveTo(0, VH);
      for (let x = 0; x <= VW; x += 48) {
        ctx.lineTo(x, VH - 115 - Math.sin(x * 0.01 + 0.5) * 28);
      }
      ctx.lineTo(VW, VH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawGround(ctx, topCol, botCol, y = VH - 68) {
    const grad = ctx.createLinearGradient(0, y, 0, VH);
    grad.addColorStop(0, topCol);
    grad.addColorStop(1, botCol);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, VW, VH - y);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(0, y, VW, 5);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, y + 5, VW, 4);
  }

  function drawDotPattern(ctx, cx, cy, count, areaR, dotCol = "#ffffff") {
    const n = Math.min(10, Math.max(0, Math.round(count)));
    if (n <= 0) return;
    const positions = [];
    if (n === 1) positions.push([0, 0]);
    else if (n <= 5) {
      const r = areaR * 0.48;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
        positions.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
    } else {
      const cols = 5;
      const gap = Math.min(10, areaR * 0.36);
      for (let i = 0; i < n; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push([(col - 2) * gap, (row - 0.5) * gap * 1.1]);
      }
    }
    const dotR = clamp(areaR * 0.14, 2.4, 5.2);
    ctx.save();
    ctx.fillStyle = dotCol;
    for (const [dx, dy] of positions) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCuteSlime(ctx, x, y, r, color, opts = {}) {
    const sx = opts.sx || 1;
    const sy = opts.sy || 1;
    const label = opts.label ?? "";
    const dots = opts.dots ?? 0;
    const angry = opts.angry || false;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);

    // 부드러운 그림자
    ctx.fillStyle = "rgba(15,23,42,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.85, r * 0.72, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    if (opts.glow) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 9, 0, Math.PI * 2);
      ctx.fillStyle = opts.glow;
      ctx.fill();
    }

    // 3D 글로시 몸통
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.32, r * 0.1, 0, 0, r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.24, color);
    g.addColorStop(0.85, color);
    g.addColorStop(1, "rgba(15,23,42,0.45)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = opts.stroke || "rgba(255,255,255,0.9)";
    ctx.stroke();

    // 윗부분 광택
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.4, r * 0.28, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();

    if (!opts.noFace) {
      const eyeY = label !== "" ? -r * 0.34 : -r * 0.1;
      const eyeX = r * 0.31;
      // 볼터치
      ctx.fillStyle = "rgba(251,113,133,0.45)";
      ctx.beginPath();
      ctx.ellipse(-eyeX * 1.15, eyeY + r * 0.16, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeX * 1.15, eyeY + r * 0.16, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(-eyeX, eyeY, r * 0.105, 0, Math.PI * 2);
      ctx.arc(eyeX, eyeY, r * 0.105, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-eyeX - 1.5, eyeY - 1.5, r * 0.042, 0, Math.PI * 2);
      ctx.arc(eyeX - 1.5, eyeY - 1.5, r * 0.042, 0, Math.PI * 2);
      ctx.fill();

      if (angry) {
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-eyeX - 6, eyeY - 7);
        ctx.lineTo(-eyeX + 4, eyeY - 3);
        ctx.moveTo(eyeX + 6, eyeY - 7);
        ctx.lineTo(eyeX - 4, eyeY - 3);
        ctx.stroke();
      }
    }

    if (dots > 0 && dots <= 10) {
      drawDotPattern(ctx, 0, label !== "" ? r * 0.42 : r * 0.2, dots, r * 0.72, "rgba(255,255,255,0.92)");
    }

    if (label !== "") {
      ctx.font = `900 ${Math.max(15, Math.round(r * 0.76))}px 'Pretendard','Malgun Gothic',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = "rgba(15,23,42,0.86)";
      ctx.strokeText(String(label), 0, dots > 0 ? 0 : r * 0.08);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(label), 0, dots > 0 ? 0 : r * 0.08);
    }

    ctx.restore();
  }

  /* ---------- 한국 화폐 (동전 & 지폐) 생김새 벡터 렌더러 ---------- */
  function drawKoreanMoney(ctx, value, x, y, scale = 1, opts = {}) {
    const meta = MONEY_META[value];
    if (!meta) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (opts.glow) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = opts.glow;
      if (meta.type === "coin") {
        ctx.beginPath();
        ctx.arc(0, 0, meta.r + 9, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundRect(ctx, -meta.w / 2 - 7, -meta.h / 2 - 7, meta.w + 14, meta.h + 14, 14);
        ctx.fill();
      }
      ctx.restore();
    }

    if (meta.type === "coin") {
      const r = meta.r;
      // 동전 그림자
      ctx.fillStyle = "rgba(15,23,42,0.3)";
      ctx.beginPath();
      ctx.arc(2, 4, r, 0, Math.PI * 2);
      ctx.fill();

      // 동전 메탈 그라데이션
      const cg = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      cg.addColorStop(0, "#ffffff");
      cg.addColorStop(0.28, meta.bg);
      cg.addColorStop(1, value === 10 ? "#92400e" : "#64748b");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // 톱니 테두리 링
      ctx.lineWidth = 3;
      ctx.strokeStyle = meta.rim;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r - 4.5, 0, Math.PI * 2);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();

      // 화폐별 상징 도안 실루엣 (다보탑 / 벼이삭 / 이순신 / 학)
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      if (value === 10) {
        // 다보탑 지붕 층층 실루엣
        ctx.fillRect(-5, -r * 0.56, 10, 4);
        ctx.fillRect(-8, -r * 0.36, 16, 4);
        ctx.fillRect(-10, -r * 0.16, 20, 4);
      } else if (value === 50) {
        // 벼 이삭 곡선
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, r * 0.3);
        ctx.quadraticCurveTo(-r * 0.45, -r * 0.25, -r * 0.1, -r * 0.55);
        ctx.stroke();
      } else if (value === 100) {
        // 이순신 장군 투구/어깨 실루엣
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.25, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-r * 0.28, 2, 9, 6, 0, Math.PI, 0);
        ctx.fill();
      } else if (value === 500) {
        // 날아가는 학 날개 곡선
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-r * 0.52, -4);
        ctx.quadraticCurveTo(-r * 0.2, -r * 0.55, 4, -8);
        ctx.quadraticCurveTo(r * 0.28, -r * 0.48, r * 0.48, -12);
        ctx.stroke();
      }
      ctx.restore();

      // 금액 텍스트
      ctx.font = `900 ${Math.round(r * 0.56)}px 'Pretendard','Malgun Gothic',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.strokeText(String(value), 0, 4);
      ctx.fillStyle = meta.text;
      ctx.fillText(String(value), 0, 4);
    } else {
      // 한국 지폐 (1000 파랑 / 5000 주황 / 10000 초록)
      const w = meta.w;
      const h = meta.h;
      ctx.fillStyle = "rgba(15,23,42,0.34)";
      roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 8);
      ctx.fill();

      const bgGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      bgGrad.addColorStop(0, meta.bg);
      bgGrad.addColorStop(0.55, meta.light);
      bgGrad.addColorStop(1, meta.bg);
      roundRect(ctx, -w / 2, -h / 2, w, h, 8);
      ctx.fillStyle = bgGrad;
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = meta.rim;
      ctx.stroke();

      // 은선 홀로그램 & 좌측 창
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(-w * 0.14, -h / 2 + 3, 5, h - 6);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.ellipse(-w * 0.3, 0, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 우측 인물/문양 배지
      ctx.fillStyle = meta.bg;
      ctx.beginPath();
      ctx.arc(w * 0.26, -3, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(w * 0.26, -5, 5, 0, Math.PI * 2);
      ctx.fill();

      // 액면가 숫자
      ctx.font = "900 17px 'Pretendard','Malgun Gothic',sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(15,23,42,0.88)";
      ctx.strokeText(meta.name, -4, 1);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(meta.name, -4, 1);
    }

    ctx.restore();
  }

  function drawBomb(ctx, x, y, r, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = 1 + Math.sin(time * 10) * 0.06;
    ctx.scale(pulse, pulse);

    ctx.fillStyle = "#ef4444";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + time * 1.6;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-5, -r + 2);
      ctx.lineTo(0, -r - 9);
      ctx.lineTo(5, -r + 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#fca5a5";
    ctx.stroke();

    ctx.font = `900 ${Math.round(r * 0.78)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fde047";
    ctx.fillText("💣", 0, 2);
    ctx.restore();
  }

  function drawSlingshotArc(ctx, x0, y0, vx, vy, gravity = 680, color = "rgba(255,255,255,0.8)") {
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 1; i <= 11; i++) {
      const t = i * 0.055;
      const px = x0 + vx * t;
      const py = y0 + vy * t + 0.5 * gravity * t * t;
      if (py > VH + 10) break;
      ctx.globalAlpha = Math.max(0.15, 1 - i * 0.08);
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.5, 6 - i * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSwipeTrail(ctx, trail, color = "#38bdf8") {
    if (!trail || trail.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < trail.length; i++) {
      const a = i / trail.length;
      ctx.strokeStyle = color;
      ctx.globalAlpha = a * 0.85;
      ctx.lineWidth = 2 + a * 9;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFingerHint(ctx, x1, y1, x2, y2, time) {
    const p = (time * 0.85) % 1;
    const ease = p < 0.7 ? p / 0.7 : 1;
    const alpha = p < 0.85 ? 0.9 : ((1 - p) / 0.15) * 0.9;
    const cx = x1 + (x2 - x1) * ease;
    const cy = y1 + (y2 - y1) * ease;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(253,224,71,0.75)";
    ctx.lineWidth = 4;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👆", cx, cy + 12);
    ctx.restore();
  }

  function drawBadgeBox(ctx, x, y, w, h, bg, border, text, textCol = "#fff", fontSize = 20) {
    ctx.save();
    roundRect(ctx, x, y, w, h, 14);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = border;
    ctx.stroke();
    ctx.font = `900 ${fontSize}px 'Pretendard','Malgun Gothic',sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textCol;
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  }

  return {
    VW, VH,
    fx, MONEY_META,
    clamp, rand, randInt, pick, dist,
    clearFx, spawnParticles, spawnRing, spawnPopup, spawnConfetti, shake, flash,
    updateFx, drawFx,
    roundRect, drawSkyBackdrop, drawGround, drawDotPattern, drawCuteSlime,
    drawKoreanMoney, drawBomb, drawSlingshotArc, drawSwipeTrail, drawFingerHint, drawBadgeBox
  };
})();
