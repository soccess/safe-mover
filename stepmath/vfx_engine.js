"use strict";

/* ============================================================
   고성능 게임 VFX 엔진 (60fps Canvas 파티클 · 충격파 · 플로팅 팝업)
   - 코인 샤워, 별 폭발, 물방울 튀김, 번개 스파크, 플로팅 점수
   ============================================================ */
(function (global) {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let rings = [];
  let rafId = null;

  function reducedMotion() {
    return Boolean(global.state && global.state.settings && global.state.settings.lowStim);
  }
  if (document.body) ensureCanvas();
  else document.addEventListener('DOMContentLoaded', ensureCanvas);

  function ensureCanvas() {
    if (canvas && document.body.contains(canvas)) return canvas;
    canvas = document.createElement('canvas');
    canvas.className = 'sm-vfx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return canvas;
  }

  function tick() {
    if (!ctx || (!particles.length && !rings.length)) {
      if (ctx && canvas) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rafId = null;
      return;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.radius += (r.maxRadius - r.radius) * 0.16;
      r.alpha -= 0.045;
      if (r.alpha <= 0) { rings.splice(i, 1); continue; }
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = r.lineWidth || 4;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.rot += p.vrot;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = p.size;
          if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'coin') {
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#854d0e';
        ctx.font = `900 ${Math.max(8, Math.round(p.size * 0.95))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₩', 0, 1);
      } else if (p.shape === 'rect') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    ensureCanvas();
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function centerOf(target) {
    if (target && typeof target.getBoundingClientRect === 'function') {
      const r = target.getBoundingClientRect();
      if (r.width || r.height) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: window.innerWidth / 2, y: Math.min(window.innerHeight * 0.45, 360) };
  }

  function burst(target, opts = {}) {
    if (reducedMotion()) return;
    const { x, y } = (typeof target?.x === 'number') ? target : centerOf(target);
    const count = opts.count || 22;
    const colors = opts.colors || ['#facc15', '#38bdf8', '#f472b6', '#4ade80', '#a855f7', '#fb923c'];
    const shape = opts.shape || 'star';
    const power = opts.power || 7.5;

    rings.push({ x, y, radius: 10, maxRadius: opts.ringRadius || 76, alpha: 0.9, color: colors[0], lineWidth: 5 });
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const spd = power * (0.45 + Math.random() * 0.85);
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (opts.lift || 2.5),
        gravity: opts.gravity ?? 0.24,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.22,
        size: (opts.size || 7) * (0.75 + Math.random() * 0.6),
        color: colors[i % colors.length],
        shape: shape === 'mix' ? ['star', 'rect', 'circle'][i % 3] : shape,
        life: 1,
        decay: 0.02 + Math.random() * 0.014,
      });
    }
    startLoop();
  }

  function celebrateWin(target) {
    if (reducedMotion()) return;
    const pt = centerOf(target);
    burst(pt, { count: 42, shape: 'mix', power: 10, ringRadius: 130, size: 9 });
    setTimeout(() => burst({ x: pt.x - 110, y: pt.y - 30 }, { count: 24, shape: 'coin', power: 8, ringRadius: 90, size: 9 }), 110);
    setTimeout(() => burst({ x: pt.x + 110, y: pt.y - 30 }, { count: 24, shape: 'star', power: 8, ringRadius: 90, size: 9 }), 200);
  }

  function coinShower(target) {
    if (reducedMotion()) return;
    const pt = centerOf(target);
    burst(pt, { count: 28, shape: 'coin', power: 9, lift: 5, gravity: 0.32, ringRadius: 110, size: 9 });
  }

  function floatText(target, text, cls = '') {
    const pt = (typeof target?.x === 'number') ? target : centerOf(target);
    const el = document.createElement('div');
    el.className = `sm-float-popup ${cls}`.trim();
    el.textContent = text;
    el.style.left = `${pt.x}px`;
    el.style.top = `${Math.max(50, pt.y - 16)}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  function pulseEl(el, cls = 'sm-fx-pop') {
    if (!el || reducedMotion()) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function shakeEl(el) {
    pulseEl(el, 'sm-fx-shake');
  }

  global.SM_VFX = {
    burst,
    celebrateWin,
    coinShower,
    floatText,
    pulseEl,
    shakeEl,
  };
})(window);
