"use strict";

/* ============================================================
   애니메이션 시범 코치 (Show-Then-Do · 따라하기 가이드)
   - 텍스트 설명 대신 실제 교구 위에서 손가락(👆) + 잔상 오브젝트가
     출발 위치 → 목표 위치로 부드럽게 이동하며 푸는 방법을 보여줍니다.
   - 학생이 아무 곳이나 터치/클릭하면 즉시 시범을 멈추고 조작을 넘겨줍니다.
   ============================================================ */
(() => {
  let layer = null;
  let rafId = null;
  let playToken = 0;

  function stop() {
    playToken += 1;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (layer) {
      layer.remove();
      layer = null;
    }
    document.querySelectorAll(".demo-follow-src, .demo-follow-dst").forEach((el) => {
      el.classList.remove("demo-follow-src", "demo-follow-dst");
    });
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r };
  }

  function showFollowGuide(fromSelector, toSelector, root) {
    const scope = root || document;
    document.querySelectorAll(".demo-follow-src, .demo-follow-dst").forEach((el) => {
      el.classList.remove("demo-follow-src", "demo-follow-dst");
    });
    if (fromSelector) {
      const s = scope.querySelector(fromSelector);
      if (s) s.classList.add("demo-follow-src");
    }
    if (toSelector) {
      const d = scope.querySelector(toSelector);
      if (d) d.classList.add("demo-follow-dst");
    }
  }

  function play(demoSpec, root, opts = {}) {
    stop();
    if (!demoSpec || !demoSpec.from) return false;
    const scope = root || document;
    const fromEl = scope.querySelector(demoSpec.from);
    const toEl = demoSpec.to ? scope.querySelector(demoSpec.to) : null;
    if (!fromEl) return false;

    const token = ++playToken;
    const p1 = centerOf(fromEl);
    let p2 = toEl ? centerOf(toEl) : { x: p1.x + (demoSpec.dx || 90), y: p1.y + (demoSpec.dy || 0) };
    if (demoSpec.dx !== undefined || demoSpec.dy !== undefined) {
      p2 = { x: p1.x + (demoSpec.dx || 0), y: p1.y + (demoSpec.dy || 0) };
    }
    if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < 12) {
      p2 = { x: p1.x + 80, y: p1.y - 30 };
    }

    // Highlight follow-along source & destination
    showFollowGuide(demoSpec.from, demoSpec.to, scope);

    // Control point for gentle arc
    const cx = (p1.x + p2.x) / 2;
    const cy = Math.min(p1.y, p2.y) - 46;

    layer = document.createElement("div");
    layer.className = "demo-coach-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <svg class="demo-coach-svg" viewBox="0 0 ${window.innerWidth} ${window.innerHeight}">
        <defs>
          <marker id="demoArrowHead" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b"/>
          </marker>
        </defs>
        <path class="demo-coach-path" d="M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}" marker-end="url(#demoArrowHead)"/>
        <circle class="demo-coach-ring" cx="${p2.x}" cy="${p2.y}" r="24"/>
      </svg>
      <div class="demo-coach-token">${demoSpec.emoji || "●"}</div>
      <div class="demo-coach-hand">👆</div>
      ${demoSpec.hint ? `<div class="demo-coach-pill" style="left:${cx}px;top:${Math.max(58, cy - 18)}px">${demoSpec.hint}</div>` : ""}
    `;
    document.body.appendChild(layer);

    const tokenEl = layer.querySelector(".demo-coach-token");
    const handEl = layer.querySelector(".demo-coach-hand");
    const ringEl = layer.querySelector(".demo-coach-ring");

    const loops = opts.loops || 2;
    const moveMs = 1350;
    const holdMs = 450;
    const totalPerLoop = moveMs + holdMs;
    const t0 = performance.now();

    const quadBezier = (t, a, b, c) => {
      const u = 1 - t;
      return u * u * a + 2 * u * t * b + t * t * c;
    };
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const frame = (now) => {
      if (token !== playToken || !layer) return;
      const elapsed = now - t0;
      const loopIdx = Math.floor(elapsed / totalPerLoop);
      if (loopIdx >= loops) {
        if (layer) {
          layer.classList.add("fade-out");
          setTimeout(() => {
            if (token === playToken && layer) {
              layer.remove();
              layer = null;
            }
          }, 260);
        }
        return;
      }
      const local = elapsed - loopIdx * totalPerLoop;
      const rawT = Math.min(1, local / moveMs);
      const t = easeInOut(rawT);
      const x = quadBezier(t, p1.x, cx, p2.x);
      const y = quadBezier(t, p1.y, cy, p2.y);

      const scale = rawT < 0.12 ? 1.08 : rawT > 0.92 ? 0.94 : 1.0;
      tokenEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
      tokenEl.style.opacity = local > moveMs + 220 ? "0.2" : "0.95";
      handEl.style.transform = `translate(${x + 12}px, ${y + 18}px) translate(-50%, -50%) scale(${rawT > 0.92 ? 0.88 : 1})`;
      if (ringEl) {
        ringEl.setAttribute("r", String(rawT > 0.88 ? 30 : 20));
        ringEl.style.opacity = rawT > 0.88 ? "0.9" : "0.35";
      }
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    return true;
  }

  window.StepMathDemo = {
    play,
    stop,
    showFollowGuide
  };
})();
