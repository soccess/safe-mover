"use strict";

/* ============================================================
   넘버 아일랜드 스테이지 1~6
   1. 닌자 과일 바운스 (분류·짝짓기)
   2. 버블 합체 슈터 (1~10 수 세기·크기)
   3. 해적 시소 투석기 (크기 비교 < = >)
   4. 슬라임 합체·깨기 새총 (모으기·가르기)
   5. 로켓 10 변신 점프 (10 만들기·받아올림)
   6. 개구리 수직선 파쿠르 (뛰어 세기·점프 계산)
   ============================================================ */
window.MathStagesPart1 = [
  /* ------------------------------------------------------------
     STAGE 1: 🍎 닌자 과일 바운스 (분류 & 1:1 짝짓기)
     ------------------------------------------------------------ */
  {
    id: 1,
    icon: "🍎",
    name: "과일 바운스",
    desc: "날아오는 과일을 던져 같은 바구니에 넣고 폭탄은 베어 날려요!",
    tags: ["던지기·베기", "분류·짝짓기"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      const KINDS = [
        { id: "apple", emoji: "🍎", color: "#ef4444", bg: "#fee2e2", label: "사과" },
        { id: "lemon", emoji: "🍋", color: "#eab308", bg: "#fef9c3", label: "레몬" },
        { id: "grape", emoji: "🍇", color: "#a855f7", bg: "#f3e8ff", label: "포도" }
      ];
      let wave = 1;
      let time = 0;
      let spawnT = 0.6;
      let baskets = [];
      let items = [];
      let dragged = null;
      let trail = [];
      let doneWave = false;

      function setupWave(w) {
        wave = w;
        doneWave = false;
        items = [];
        dragged = null;
        spawnT = 0.4;
        const count = w === 1 ? 2 : 3;
        const target = w === 3 ? 4 : 3;
        const spacing = E.VW / (count + 1);
        baskets = KINDS.slice(0, count).map((k, idx) => ({
          ...k,
          x: spacing * (idx + 1),
          baseX: spacing * (idx + 1),
          y: E.VH - 78,
          w: 138,
          h: 82,
          count: 0,
          target,
          bounce: 0,
          juice: false,
          phase: idx * 1.7
        }));
        api.setWave(w, 3, 0);
        api.setMission("던지기·베기", `같은 과일을 바구니로 던지세요! (💣 폭탄은 터치해 쳐내세요)`);
        if (w === 1) A.speak("같은 과일을 바구니로 쏙! 폭탄은 피하거나 베어내세요!", true);
      }

      function spawnFalling() {
        const isBomb = Math.random() < (wave === 1 ? 0.16 : wave === 2 ? 0.24 : 0.30);
        if (isBomb) {
          items.push({
            kind: "bomb",
            x: E.rand(90, E.VW - 90),
            y: -30,
            vx: E.rand(-45, 45),
            vy: E.rand(85, 130) + wave * 18,
            r: 26,
            rot: 0,
            vr: E.rand(-3, 3)
          });
          return;
        }
        const openBaskets = baskets.filter((b) => !b.juice);
        const pool = openBaskets.length ? openBaskets : baskets;
        const chosen = E.pick(pool);
        items.push({
          kind: chosen.id,
          emoji: chosen.emoji,
          color: chosen.color,
          x: E.rand(85, E.VW - 85),
          y: -32,
          vx: E.rand(-38, 38),
          vy: E.rand(72, 112) + wave * 14,
          r: 28,
          rot: E.rand(-0.3, 0.3),
          vr: E.rand(-1.5, 1.5)
        });
      }

      function updateWaveProgress() {
        const totalNeed = baskets.reduce((s, b) => s + b.target, 0);
        const totalGot = baskets.reduce((s, b) => s + Math.min(b.count, b.target), 0);
        api.setWave(wave, 3, totalGot / Math.max(1, totalNeed));
        if (!doneWave && baskets.every((b) => b.juice)) {
          doneWave = true;
          A.play("wave");
          E.spawnConfetti(30);
          api.toast(`🎉 웨이브 ${wave} 완성! 주스 변신!`);
          setTimeout(() => {
            if (wave < 3) setupWave(wave + 1);
            else api.winStage();
          }, 950);
        }
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          for (let i = trail.length - 1; i >= 0; i--) {
            if (performance.now() - trail[i].t > 140) trail.splice(i, 1);
          }
          // 바구니 움직임 (3웨이브)
          for (const b of baskets) {
            if (wave === 3 && !b.juice) {
              b.x = b.baseX + Math.sin(time * 1.4 + b.phase) * 42;
            }
            if (b.bounce > 0) b.bounce = Math.max(0, b.bounce - dt * 4.5);
          }

          if (!doneWave) {
            spawnT -= dt;
            if (spawnT <= 0) {
              spawnFalling();
              spawnT = Math.max(0.55, 1.25 - wave * 0.18);
            }
          }

          for (let i = items.length - 1; i >= 0; i--) {
            const it = items[i];
            if (it === dragged) continue;
            it.x += it.vx * dt;
            it.y += it.vy * dt;
            it.rot += it.vr * dt;
            if (it.kind !== "bomb" && it.thrown) {
              it.vy += 480 * dt;
            }
            if (it.x < 34 || it.x > E.VW - 34) {
              it.vx *= -0.8;
              it.x = E.clamp(it.x, 34, E.VW - 34);
            }

            // 바구니 충돌 체크
            let removed = false;
            for (const b of baskets) {
              if (Math.abs(it.x - b.x) < b.w * 0.5 && Math.abs(it.y - (b.y - 6)) < b.h * 0.55) {
                if (it.kind === "bomb") {
                  items.splice(i, 1);
                  removed = true;
                  E.shake(11);
                  E.spawnParticles(it.x, it.y, "#ef4444", 18, 260);
                  A.play("hurt");
                  api.damage("💣 폭탄을 터치해서 쳐내세요!");
                  break;
                } else if (it.kind === b.id && !b.juice) {
                  items.splice(i, 1);
                  removed = true;
                  b.count += 1;
                  b.bounce = 1;
                  const combo = api.addCombo();
                  A.play("pop", combo);
                  E.spawnParticles(b.x, b.y - 25, b.color, 14, 200);
                  E.spawnRing(b.x, b.y - 10, b.color, 65);
                  api.addScore(100, b.x, b.y - 45, `${b.count}/${b.target}!`);
                  if (b.count >= b.target) {
                    b.juice = true;
                    A.play("transform");
                    E.spawnParticles(b.x, b.y - 20, "#fde047", 26, 290);
                    E.spawnPopup(b.x, b.y - 75, "🧃 주스 변신!", "#fde047", 26);
                    A.speak(`${b.label} ${b.target}개 완성!`);
                  }
                  updateWaveProgress();
                  break;
                } else {
                  // 다른 바구니면 통통 튕겨냄!
                  it.vy = -Math.max(240, Math.abs(it.vy) * 0.85);
                  it.vx = (it.x < b.x ? -1 : 1) * E.rand(120, 210);
                  it.thrown = true;
                  b.bounce = 0.45;
                  A.play("jump");
                  E.spawnPopup(it.x, it.y - 25, "튕김!", "#cbd5e1", 17);
                  break;
                }
              }
            }
            if (removed) continue;
            if (it.y > E.VH + 45) items.splice(i, 1);
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0ea5e9", "#bae6fd", time, "day");
          E.drawGround(ctx, "#4ade80", "#15803d", E.VH - 48);

          // 바구니 그리기
          for (const b of baskets) {
            const scX = 1 + b.bounce * 0.24;
            const scY = 1 - b.bounce * 0.22;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(scX, scY);

            if (b.juice) {
              // 황금 주스 팩으로 변신!
              E.roundRect(ctx, -46, -68, 92, 98, 18);
              ctx.fillStyle = "#fde047";
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#ffffff";
              ctx.stroke();
              ctx.font = "40px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🧃", 0, -24);
              ctx.font = "900 16px sans-serif";
              ctx.fillStyle = "#78350f";
              ctx.fillText(`${b.emoji} ${b.target} 완성!`, 0, 12);
            } else {
              // 트램펄린 바구니
              E.roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 20);
              ctx.fillStyle = b.bg;
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = b.color;
              ctx.stroke();

              // 안의 과일들
              ctx.font = "24px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              for (let k = 0; k < b.count; k++) {
                const ox = (k - (b.count - 1) / 2) * 24;
                ctx.fillText(b.emoji, ox, 10);
              }

              // 상단 뱃지 & 진행 점
              ctx.font = "900 18px sans-serif";
              ctx.fillStyle = "#0f172a";
              ctx.fillText(`${b.emoji} ${b.count} / ${b.target}`, 0, -18);
            }
            ctx.restore();
          }

          // 낙하 아이템
          for (const it of items) {
            if (it.kind === "bomb") {
              E.drawBomb(ctx, it.x, it.y, it.r, time);
            } else {
              ctx.save();
              ctx.translate(it.x, it.y);
              ctx.rotate(it.rot);
              ctx.beginPath();
              ctx.arc(0, 0, it.r + 4, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255,255,255,0.85)";
              ctx.fill();
              ctx.lineWidth = 3;
              ctx.strokeStyle = it.color;
              ctx.stroke();
              ctx.font = "34px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(it.emoji, 0, 2);
              ctx.restore();
            }
          }

          E.drawSwipeTrail(ctx, trail, "#fde047");

          if (wave === 1 && time < 3.4 && items.length > 0) {
            const firstFruit = items.find((x) => x.kind !== "bomb");
            if (firstFruit) {
              const targetB = baskets.find((b) => b.id === firstFruit.kind);
              if (targetB) E.drawFingerHint(ctx, firstFruit.x, firstFruit.y, targetB.x, targetB.y, time);
            }
          }
        },
        onPointerDown(x, y) {
          trail.push({ x, y, t: performance.now() });
          // 폭탄은 터치 즉시 쳐내기!
          for (let i = items.length - 1; i >= 0; i--) {
            const it = items[i];
            if (E.dist(x, y, it.x, it.y) <= it.r + 22) {
              if (it.kind === "bomb") {
                items.splice(i, 1);
                A.play("slice");
                E.spawnParticles(it.x, it.y, "#fde047", 14, 240);
                E.spawnRing(it.x, it.y, "#fff", 55);
                api.addScore(60, it.x, it.y, "💣 컷!");
                return;
              }
              dragged = it;
              it.thrown = false;
              it.vx = 0;
              it.vy = 0;
              return;
            }
          }
        },
        onPointerMove(x, y, px, py) {
          trail.push({ x, y, t: performance.now() });
          // 스와이프로도 폭탄 쳐내기!
          for (let i = items.length - 1; i >= 0; i--) {
            const it = items[i];
            if (it.kind === "bomb" && E.dist(x, y, it.x, it.y) <= it.r + 22) {
              items.splice(i, 1);
              A.play("slice");
              E.spawnParticles(it.x, it.y, "#fde047", 14, 240);
              api.addScore(60, it.x, it.y, "💣 슬라이스!");
            }
          }
          if (dragged) {
            dragged.vx = (x - px) * 26;
            dragged.vy = (y - py) * 26;
            dragged.x = x;
            dragged.y = y;
          }
        },
        onPointerUp() {
          if (dragged) {
            dragged.thrown = true;
            dragged.vx = E.clamp(dragged.vx, -650, 650);
            dragged.vy = E.clamp(Math.max(120, dragged.vy), 120, 680);
            A.play("throw");
            dragged = null;
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 2: 🫧 버블 합체 슈터 (1~10 수 세기 & 수의 크기)
     ------------------------------------------------------------ */
  {
    id: 2,
    icon: "🫧",
    name: "버블 합체 슈터",
    desc: "버블을 쏴서 1+1→2→3으로 합체하고 먹보 몬스터에게 먹이세요!",
    tags: ["조준·합체·베기", "1~10 수 세기"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      const COLORS = ["", "#38bdf8", "#22c55e", "#eab308", "#f97316", "#ec4899", "#a855f7", "#6366f1", "#14b8a6", "#f43f5e", "#f59e0b"];
      const cannon = { x: E.VW / 2, y: E.VH - 48, angle: -Math.PI / 2, ammo: 1 };
      let monster = { x: E.VW / 2, y: 76, target: 4, fed: 0, need: 2, chomp: 0 };
      let bubbles = [];
      let mines = [];
      let wave = 1;
      let time = 0;
      let aiming = false;
      let doneWave = false;
      let reloadT = 0;

      function radiusFor(val) {
        return 21 + val * 3.4;
      }

      function setupWave(w) {
        wave = w;
        doneWave = false;
        bubbles = [];
        mines = [];
        const targets = [4, 7, 10];
        monster.target = targets[w - 1];
        monster.fed = 0;
        monster.need = 2;
        cannon.ammo = w >= 2 ? E.pick([1, 2]) : 1;

        // 초기 떠다니는 버블 생성
        const initCount = w === 1 ? 5 : 6;
        for (let i = 0; i < initCount; i++) {
          const val = w === 1 ? 1 : E.pick([1, 2]);
          bubbles.push({
            val,
            x: 150 + i * 130,
            y: E.rand(185, 310),
            vx: E.rand(-55, 55),
            vy: E.rand(-35, 35),
            r: radiusFor(val),
            sx: 1, sy: 1,
            shot: false
          });
        }
        // 장애물 가시 지뢰
        const mineCount = w === 1 ? 1 : w;
        for (let i = 0; i < mineCount; i++) {
          mines.push({
            x: 220 + i * 240,
            y: E.rand(220, 350),
            vx: (i % 2 === 0 ? 1 : -1) * (55 + w * 18),
            r: 22
          });
        }
        api.setWave(w, 3, 0);
        api.setMission("조준·합체", `버블을 쏴서 합쳐 ${monster.target}을 만드세요! (커지면 터치해 반으로 쪼개기)`);
        if (w === 1) A.speak(`버블을 합쳐서 숫자 ${monster.target}을 만들어 보세요!`, true);
      }

      function feedMonster(b) {
        monster.fed += 1;
        monster.chomp = 1;
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnParticles(monster.x, monster.y + 15, "#fde047", 22, 260);
        E.spawnRing(monster.x, monster.y, "#4ade80", 90);
        api.addScore(150, monster.x, monster.y + 40, `😋 ${b.val} 먹음!`);
        api.setWave(wave, 3, monster.fed / monster.need);

        if (monster.fed >= monster.need && !doneWave) {
          doneWave = true;
          A.play("wave");
          E.spawnConfetti(32);
          api.toast(`🎉 ${monster.target} 완성! 다음 먹보 몬스터 등장!`);
          setTimeout(() => {
            if (wave < 3) setupWave(wave + 1);
            else api.winStage();
          }, 950);
        } else {
          // 보충 버블 2개 추가
          for (let k = 0; k < 2; k++) {
            const v = wave >= 2 ? E.pick([1, 2]) : 1;
            bubbles.push({
              val: v,
              x: E.rand(140, E.VW - 140),
              y: E.rand(180, 290),
              vx: E.rand(-55, 55),
              vy: E.rand(-35, 35),
              r: radiusFor(v),
              sx: 1.3, sy: 0.7,
              shot: false
            });
          }
        }
      }

      function shoot() {
        if (reloadT > 0 || doneWave) return;
        const spd = 610;
        const val = cannon.ammo;
        bubbles.push({
          val,
          x: cannon.x + Math.cos(cannon.angle) * 44,
          y: cannon.y + Math.sin(cannon.angle) * 44,
          vx: Math.cos(cannon.angle) * spd,
          vy: Math.sin(cannon.angle) * spd,
          r: radiusFor(val),
          sx: 0.8, sy: 1.25,
          shot: true
        });
        A.play("throw");
        reloadT = 0.25;
        cannon.ammo = wave >= 2 ? E.pick([1, 2]) : 1;
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          if (reloadT > 0) reloadT = Math.max(0, reloadT - dt);
          if (monster.chomp > 0) monster.chomp = Math.max(0, monster.chomp - dt * 3.5);

          // 지뢰 이동
          for (const m of mines) {
            m.x += m.vx * dt;
            if (m.x < 80 || m.x > E.VW - 80) m.vx *= -1;
          }

          // 버블 이동 & 스쿼시 복원
          for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            b.sx += (1 - b.sx) * Math.min(1, dt * 10);
            b.sy += (1 - b.sy) * Math.min(1, dt * 10);

            // 목표 숫자가 되면 몬스터 입으로 자동 빨려들어감!
            if (b.val === monster.target && !doneWave) {
              const dx = monster.x - b.x;
              const dy = monster.y - b.y;
              const d = Math.hypot(dx, dy);
              b.vx = (dx / Math.max(1, d)) * 460;
              b.vy = (dy / Math.max(1, d)) * 460;
              b.x += b.vx * dt;
              b.y += b.vy * dt;
              if (d < 48) {
                bubbles.splice(i, 1);
                feedMonster(b);
              }
              continue;
            }

            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.shot) {
              b.vx *= Math.pow(0.82, dt);
              b.vy *= Math.pow(0.82, dt);
            }
            if (b.x < b.r + 24) { b.x = b.r + 24; b.vx = Math.abs(b.vx); }
            if (b.x > E.VW - b.r - 24) { b.x = E.VW - b.r - 24; b.vx = -Math.abs(b.vx); }
            if (b.y < b.r + 130) { b.y = b.r + 130; b.vy = Math.abs(b.vy); }
            if (b.y > E.VH - 125) { b.y = E.VH - 125; b.vy = -Math.abs(b.vy); }

            // 지뢰 충돌 (내가 쏜 버블이 닿으면 폭파)
            for (const m of mines) {
              if (E.dist(b.x, b.y, m.x, m.y) < b.r + m.r - 4) {
                if (b.shot) {
                  bubbles.splice(i, 1);
                  E.shake(9);
                  E.spawnParticles(m.x, m.y, "#ef4444", 16, 220);
                  A.play("hurt");
                  api.damage("💣 가시 지뢰를 피해 쏘세요!");
                } else {
                  const ang = Math.atan2(b.y - m.y, b.x - m.x);
                  b.vx = Math.cos(ang) * 90;
                  b.vy = Math.sin(ang) * 90;
                }
                break;
              }
            }
          }

          // 버블끼리 충돌 -> 합체!
          for (let i = 0; i < bubbles.length; i++) {
            for (let j = i + 1; j < bubbles.length; j++) {
              const a = bubbles[i];
              const b = bubbles[j];
              if (!a || !b) continue;
              if (a.val === monster.target || b.val === monster.target) continue;
              if (E.dist(a.x, a.y, b.x, b.y) < a.r + b.r - 2) {
                const sum = a.val + b.val;
                if (sum <= 10 && (a.shot || b.shot || sum <= monster.target)) {
                  const nx = (a.x + b.x) / 2;
                  const ny = (a.y + b.y) / 2;
                  const merged = {
                    val: sum,
                    x: nx,
                    y: ny,
                    vx: (a.vx + b.vx) * 0.35,
                    vy: (a.vy + b.vy) * 0.35,
                    r: radiusFor(sum),
                    sx: 1.45,
                    sy: 0.65,
                    shot: false
                  };
                  bubbles.splice(j, 1);
                  bubbles.splice(i, 1, merged);
                  A.play("merge", sum);
                  E.spawnParticles(nx, ny, COLORS[sum] || "#fff", 16, 210);
                  E.spawnRing(nx, ny, COLORS[sum] || "#fff", merged.r + 28);
                  E.spawnPopup(nx, ny - merged.r - 12, `${a.val}+${b.val} → ${sum}!`, "#fde047", 22);
                  api.addScore(40 * sum, nx, ny);
                  i = bubbles.length; // 한 프레임에 1번 깔끔하게 처리
                  break;
                } else {
                  // 튕김
                  const ang = Math.atan2(b.y - a.y, b.x - a.x);
                  a.vx = -Math.cos(ang) * 70;
                  a.vy = -Math.sin(ang) * 70;
                  b.vx = Math.cos(ang) * 70;
                  b.vy = Math.sin(ang) * 70;
                }
              }
            }
          }

          // 필드에 너무 적으면 보충
          if (!doneWave && bubbles.length < 3) {
            bubbles.push({
              val: 1,
              x: E.rand(150, E.VW - 150),
              y: E.rand(180, 290),
              vx: E.rand(-45, 45),
              vy: E.rand(-30, 30),
              r: radiusFor(1),
              sx: 1.2, sy: 0.8,
              shot: false
            });
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#312e81", "#0f172a", time, "night");

          // 먹보 몬스터
          const mScale = 1 + monster.chomp * 0.2;
          ctx.save();
          ctx.translate(monster.x, monster.y);
          ctx.scale(mScale, mScale);
          E.drawCuteSlime(ctx, 0, 0, 48, "#22c55e", {
            glow: "rgba(74,222,128,0.28)",
            label: `${monster.target}`,
            dots: monster.target
          });
          // 말풍선
          E.drawBadgeBox(ctx, 64, -26, 138, 44, "rgba(15,23,42,0.88)", "#4ade80", `먹이 ${monster.fed}/${monster.need}`, "#fde047", 17);
          ctx.restore();

          // 지뢰
          for (const m of mines) E.drawBomb(ctx, m.x, m.y, m.r, time);

          // 버블들
          for (const b of bubbles) {
            const col = COLORS[b.val] || "#38bdf8";
            E.drawCuteSlime(ctx, b.x, b.y, b.r, col, {
              sx: b.sx, sy: b.sy,
              label: b.val,
              dots: b.val,
              glow: b.val === monster.target ? "rgba(253,224,71,0.65)" : null
            });
          }

          // 조준 점선 & 발사대
          ctx.save();
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(cannon.x, cannon.y);
          ctx.lineTo(cannon.x + Math.cos(cannon.angle) * 260, cannon.y + Math.sin(cannon.angle) * 260);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.translate(cannon.x, cannon.y);
          ctx.rotate(cannon.angle + Math.PI / 2);
          E.roundRect(ctx, -20, -46, 40, 56, 14);
          ctx.fillStyle = "#38bdf8";
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#fff";
          ctx.stroke();
          ctx.restore();

          // 장착된 다음 버블
          E.drawCuteSlime(ctx, cannon.x, cannon.y + 4, 24, COLORS[cannon.ammo], {
            label: cannon.ammo,
            dots: cannon.ammo
          });

          if (wave === 1 && time < 3.4 && bubbles.length > 0) {
            E.drawFingerHint(ctx, cannon.x, cannon.y - 30, bubbles[0].x, bubbles[0].y, time);
          }
        },
        onPointerDown(x, y) {
          // 너무 큰 버블을 탭하면 반으로 쪼개기!
          for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            if (b.val > 1 && E.dist(x, y, b.x, b.y) <= b.r + 8) {
              const aVal = Math.floor(b.val / 2);
              const bVal = b.val - aVal;
              bubbles.splice(i, 1,
                { val: aVal, x: b.x - 24, y: b.y, vx: -90, vy: -40, r: radiusFor(aVal), sx: 0.7, sy: 1.3, shot: false },
                { val: bVal, x: b.x + 24, y: b.y, vx: 90, vy: 40, r: radiusFor(bVal), sx: 0.7, sy: 1.3, shot: false }
              );
              A.play("slice");
              E.spawnParticles(b.x, b.y, "#fff", 12, 180);
              E.spawnPopup(b.x, b.y - 20, `${b.val} → ${aVal}+${bVal}!`, "#38bdf8", 20);
              return;
            }
          }
          aiming = true;
          cannon.angle = E.clamp(Math.atan2(y - cannon.y, x - cannon.x), -Math.PI + 0.25, -0.25);
        },
        onPointerMove(x, y) {
          if (!aiming) return;
          cannon.angle = E.clamp(Math.atan2(y - cannon.y, x - cannon.x), -Math.PI + 0.25, -0.25);
        },
        onPointerUp(x, y) {
          if (!aiming) return;
          aiming = false;
          cannon.angle = E.clamp(Math.atan2(y - cannon.y, x - cannon.x), -Math.PI + 0.25, -0.25);
          shoot();
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 3: ⚖️ 해적 시소 투석기 (수의 크기 비교 < = >)
     ------------------------------------------------------------ */
  {
    id: 3,
    icon: "⚖️",
    name: "해적 시소 투석기",
    desc: "새총으로 상자를 던져 시소를 기울이거나 균형을 맞춰 해적을 날려버려요!",
    tags: ["새총 던지기", "크기 비교 < = >"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      const sling = { x: 145, y: 365, pulling: false, px: 145, py: 365 };
      const pivot = { x: 560, y: 445 };
      let wave = 1;
      let time = 0;
      let leftCount = 0;
      let rightCount = 4;
      let goalOp = ">";
      let angle = 0;
      let angVel = 0;
      let ammoVal = 1;
      let proj = null;
      let gulls = [];
      let holdOk = 0;
      let catapulted = false;
      let pirateY = 0;
      let pirateVy = 0;

      const WAVES = [
        { right: 4, op: ">", title: "왼쪽을 더 무겁게 만드세요! ( > )" },
        { right: 5, op: "=", title: "양쪽을 똑같이 균형 맞추세요! ( = )" },
        { right: 7, op: "<", startLeft: 9, title: "왼쪽 상자를 눌러 빼서 가볍게 만드세요! ( < )" },
        { right: 8, op: "=", startLeft: 2, title: "새총으로 8을 맞춰 균형을 잡으세요! ( = )" }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        rightCount = cfg.right;
        leftCount = cfg.startLeft || 0;
        goalOp = cfg.op;
        ammoVal = w >= 3 ? E.pick([1, 2]) : 1;
        proj = null;
        holdOk = 0;
        catapulted = false;
        pirateY = 0;
        pirateVy = 0;
        angle = 0;
        angVel = 0;
        gulls = [];
        for (let i = 0; i < (w === 1 ? 1 : 2); i++) {
          gulls.push({ x: 350 + i * 190, y: 140 + i * 75, vy: 55 + i * 25, r: 22 });
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission("새총·비교", cfg.title);
        if (w === 1) A.speak("새총을 당겨 상자를 던져서 해적보다 무겁게 만드세요!", true);
      }

      function currentOp() {
        if (leftCount > rightCount) return ">";
        if (leftCount < rightCount) return "<";
        return "=";
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          // 갈매기 폭탄 순찰
          for (const g of gulls) {
            g.y += g.vy * dt;
            if (g.y < 95 || g.y > 310) g.vy *= -1;
          }

          // 투사체 물리
          if (proj) {
            proj.vy += 680 * dt;
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;

            // 갈매기 폭탄 충돌
            for (const g of gulls) {
              if (E.dist(proj.x, proj.y, g.x, g.y) < proj.r + g.r) {
                E.spawnParticles(proj.x, proj.y, "#ef4444", 16, 220);
                A.play("hurt");
                E.shake(8);
                proj = null;
                api.damage("💣 폭탄 갈매기를 피해 던지세요!");
                break;
              }
            }

            // 왼쪽 접시 착지 판정
            if (proj) {
              const lx = pivot.x - Math.cos(angle) * 195;
              const ly = pivot.y - Math.sin(angle) * 195;
              if (Math.abs(proj.x - lx) < 92 && Math.abs(proj.y - (ly - 22)) < 48 && proj.vy > 0) {
                leftCount += proj.val;
                angVel -= 0.9;
                A.play("hit");
                E.spawnParticles(lx, ly - 20, "#fde047", 14, 180);
                E.spawnPopup(lx, ly - 55, `+${proj.val}! (총 ${leftCount})`, "#fde047", 22);
                proj = null;
                ammoVal = wave >= 3 ? E.pick([1, 2]) : 1;
              } else if (proj.y > E.VH + 40 || proj.x > E.VW + 40) {
                proj = null;
              }
            }
          }

          // 시소 물리 회전
          const targetAngle = E.clamp((rightCount - leftCount) * 0.085, -0.34, 0.34);
          angVel += (targetAngle - angle) * 28 * dt;
          angVel *= Math.pow(0.08, dt);
          angle += angVel * dt;

          // 목표 달성 체크
          if (!catapulted) {
            if (currentOp() === goalOp) {
              holdOk += dt;
              api.setWave(wave, WAVES.length, Math.min(1, holdOk / 0.85));
              if (holdOk >= 0.85) {
                catapulted = true;
                pirateVy = -660;
                const combo = api.addCombo();
                A.play("transform", combo);
                E.shake(12);
                E.spawnConfetti(35);
                api.addScore(250, pivot.x + 170, pivot.y - 80, "🏴‍☠️ 투석기 발사!");
                A.speak(`${leftCount} ${goalOp === ">" ? "크다" : goalOp === "=" ? "같다" : "작다"} ${rightCount}! 성공!`);
                setTimeout(() => {
                  if (wave < WAVES.length) setupWave(wave + 1);
                  else api.winStage();
                }, 1150);
              }
            } else {
              holdOk = Math.max(0, holdOk - dt * 1.5);
              api.setWave(wave, WAVES.length, 0);
            }
          } else {
            pirateY += pirateVy * dt;
            pirateVy += 420 * dt;
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0284c7", "#bae6fd", time, "day");
          E.drawGround(ctx, "#facc15", "#ca8a04", E.VH - 64);

          // 갈매기 폭탄
          for (const g of gulls) E.drawBomb(ctx, g.x, g.y, g.r, time);

          // 시소 받침대
          ctx.save();
          ctx.fillStyle = "#78350f";
          ctx.beginPath();
          ctx.moveTo(pivot.x - 36, pivot.y + 52);
          ctx.lineTo(pivot.x + 36, pivot.y + 52);
          ctx.lineTo(pivot.x, pivot.y - 8);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#fde68a";
          ctx.lineWidth = 3;
          ctx.stroke();

          // 시소 판자
          ctx.translate(pivot.x, pivot.y);
          ctx.rotate(angle);
          E.roundRect(ctx, -250, -10, 500, 20, 10);
          ctx.fillStyle = "#b45309";
          ctx.fill();
          ctx.strokeStyle = "#fef3c7";
          ctx.lineWidth = 3;
          ctx.stroke();

          // 왼쪽 상자 스택
          for (let i = 0; i < leftCount; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const bx = -225 + col * 34;
            const by = -38 - row * 28;
            E.roundRect(ctx, bx, by, 30, 26, 6);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          // 왼쪽 총합 표시
          E.drawBadgeBox(ctx, -235, 22, 110, 36, "rgba(15,23,42,0.88)", "#38bdf8", `나: ${leftCount}`, "#fff", 18);

          // 오른쪽 해적 & 상자 스택
          for (let i = 0; i < rightCount; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const bx = 135 + col * 34;
            const by = -38 - row * 28;
            E.roundRect(ctx, bx, by, 30, 26, 6);
            ctx.fillStyle = "#f97316";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.font = "44px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🏴‍☠️", 210, -78 + pirateY);
          E.drawBadgeBox(ctx, 130, 22, 115, 36, "rgba(15,23,42,0.88)", "#f97316", `해적: ${rightCount}`, "#fff", 18);
          ctx.restore();

          // 중앙 부등호 배지
          const opNow = currentOp();
          const matched = opNow === goalOp;
          E.drawBadgeBox(
            ctx,
            pivot.x - 42,
            195,
            84,
            64,
            matched ? "#16a34a" : "rgba(15,23,42,0.88)",
            matched ? "#fde047" : "#94a3b8",
            `${leftCount} ${opNow} ${rightCount}`,
            "#fff",
            22
          );
          E.drawBadgeBox(ctx, pivot.x - 75, 145, 150, 36, "rgba(30,41,59,0.9)", "#fde047", `목표: ${goalOp}`, "#fde047", 17);

          // 새총
          ctx.save();
          ctx.strokeStyle = "#92400e";
          ctx.lineWidth = 10;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sling.x, sling.y + 130);
          ctx.lineTo(sling.x, sling.y + 35);
          ctx.lineTo(sling.x - 22, sling.y);
          ctx.moveTo(sling.x, sling.y + 35);
          ctx.lineTo(sling.x + 22, sling.y);
          ctx.stroke();

          const ballX = sling.pulling ? sling.px : sling.x;
          const ballY = sling.pulling ? sling.py : sling.y;
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(sling.x - 20, sling.y + 2);
          ctx.lineTo(ballX, ballY);
          ctx.lineTo(sling.x + 20, sling.y + 2);
          ctx.stroke();

          if (sling.pulling) {
            const vx = (sling.x - sling.px) * 7.2;
            const vy = (sling.y - sling.py) * 7.2;
            E.drawSlingshotArc(ctx, sling.px, sling.py, vx, vy, 680, "#fde047");
          }

          if (!proj) {
            E.drawCuteSlime(ctx, ballX, ballY, 24, "#38bdf8", { label: `+${ammoVal}`, dots: ammoVal });
          }
          ctx.restore();

          if (proj) {
            E.drawCuteSlime(ctx, proj.x, proj.y, proj.r, "#38bdf8", { label: `+${proj.val}` });
          }

          if (wave === 1 && time < 3.6 && !sling.pulling && leftCount === 0) {
            E.drawFingerHint(ctx, sling.x, sling.y, sling.x - 85, sling.y + 65, time);
          }
        },
        onPointerDown(x, y) {
          if (catapulted) return;
          // 왼쪽 판자 위 상자를 탭하면 1개 빼기!
          const lx = pivot.x - Math.cos(angle) * 195;
          const ly = pivot.y - Math.sin(angle) * 195;
          if (leftCount > 0 && Math.abs(x - lx) < 95 && Math.abs(y - (ly - 55)) < 85) {
            leftCount -= 1;
            A.play("pop");
            E.spawnParticles(lx, ly - 40, "#38bdf8", 10, 170);
            E.spawnPopup(lx, ly - 75, "-1 뺌!", "#f87171", 20);
            return;
          }
          if (!proj && E.dist(x, y, sling.x, sling.y) < 110) {
            sling.pulling = true;
            sling.px = x;
            sling.py = y;
          }
        },
        onPointerMove(x, y) {
          if (!sling.pulling) return;
          const dx = x - sling.x;
          const dy = y - sling.y;
          const d = Math.hypot(dx, dy);
          const maxD = 125;
          if (d > maxD) {
            sling.px = sling.x + (dx / d) * maxD;
            sling.py = sling.y + (dy / d) * maxD;
          } else {
            sling.px = x;
            sling.py = y;
          }
        },
        onPointerUp() {
          if (!sling.pulling) return;
          sling.pulling = false;
          const vx = (sling.x - sling.px) * 7.2;
          const vy = (sling.y - sling.py) * 7.2;
          if (Math.hypot(vx, vy) > 140) {
            proj = { x: sling.px, y: sling.py, vx, vy, r: 24, val: ammoVal };
            A.play("throw");
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 4: 🎯 슬라임 합체·깨기 새총 (모으기 덧셈 & 가르기 뺄셈)
     ------------------------------------------------------------ */
  {
    id: 4,
    icon: "🎯",
    name: "슬라임 합체·깨기",
    desc: "슬라임을 쏴서 더하거나(-곡괭이로 깎아서) 목표 숫자로 변신시키세요!",
    tags: ["새총·슬라이스", "모으기·가르기"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      const sling = { x: 145, y: 375, pulling: false, px: 145, py: 375 };
      let wave = 1;
      let time = 0;
      let mode = "add"; // add or sub
      let ammoVal = 3;
      let proj = null;
      let targets = [];
      let saws = [];
      let gate = { x: 830, y: 280, target: 7, open: false };
      let trail = [];

      const WAVES = [
        { mode: "add", target: 7, ammo: 3, fields: [2, 4, 5], saws: 1 },
        { mode: "sub", target: 4, ammo: -2, golem: 8, saws: 1 },
        { mode: "add", target: 9, ammo: 4, fields: [3, 5, 6], saws: 2 },
        { mode: "sub", target: 3, ammo: -3, golem: 9, saws: 2 }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        mode = cfg.mode;
        ammoVal = cfg.ammo;
        proj = null;
        gate = { x: 835, y: 270, target: cfg.target, open: false };
        targets = [];
        saws = [];

        if (mode === "add") {
          cfg.fields.forEach((v, idx) => {
            targets.push({
              val: v,
              x: 470 + (idx % 2) * 145,
              y: 155 + idx * 115,
              vy: (idx % 2 === 0 ? 1 : -1) * 45,
              r: 28 + v * 3.5,
              sx: 1, sy: 1,
              color: ["#22c55e", "#f97316", "#a855f7"][idx % 3]
            });
          });
          api.setMission("모으기 새총", `+${ammoVal} 슬라임을 맞춰 합체시켜 ${cfg.target}을 만드세요!`);
        } else {
          targets.push({
            val: cfg.golem,
            x: 560,
            y: 285,
            vy: 65,
            r: 32 + cfg.golem * 4,
            sx: 1, sy: 1,
            color: "#64748b",
            golem: true
          });
          api.setMission("가르기 타격", `거인(${cfg.golem})을 맞춰 깎아서 ${cfg.target}으로 줄이세요!`);
        }

        for (let i = 0; i < cfg.saws; i++) {
          saws.push({ x: 325 + i * 165, y: 180 + i * 130, vy: (i % 2 === 0 ? 1 : -1) * 115, r: 24 });
        }
        api.setWave(w, WAVES.length, 0);
        if (w === 1) A.speak("톱날을 피해 슬라임을 쏴서 합체시켜 보세요!", true);
      }

      function finishWave() {
        if (gate.open) return;
        gate.open = true;
        api.setWave(wave, WAVES.length, 1);
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnConfetti(34);
        api.addScore(240, gate.x - 60, gate.y, `🎯 ${gate.target} 성공!`);
        setTimeout(() => {
          if (wave < WAVES.length) setupWave(wave + 1);
          else api.winStage();
        }, 1050);
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          for (let i = trail.length - 1; i >= 0; i--) {
            if (performance.now() - trail[i].t > 140) trail.splice(i, 1);
          }

          for (const s of saws) {
            s.y += s.vy * dt;
            if (s.y < 100 || s.y > 460) s.vy *= -1;
          }

          for (const t of targets) {
            t.sx += (1 - t.sx) * Math.min(1, dt * 9);
            t.sy += (1 - t.sy) * Math.min(1, dt * 9);
            if (t.flyingToGate) {
              const dx = gate.x - t.x;
              const dy = gate.y - t.y;
              const d = Math.hypot(dx, dy);
              t.x += (dx / Math.max(1, d)) * 520 * dt;
              t.y += (dy / Math.max(1, d)) * 520 * dt;
              if (d < 46) finishWave();
            } else {
              t.y += t.vy * dt;
              if (t.y < 110 || t.y > 450) t.vy *= -1;
            }
          }

          if (proj) {
            proj.vy += 450 * dt;
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;

            // 톱날 충돌
            for (const s of saws) {
              if (E.dist(proj.x, proj.y, s.x, s.y) < proj.r + s.r - 4) {
                E.spawnParticles(proj.x, proj.y, "#ef4444", 16, 230);
                A.play("hurt");
                E.shake(9);
                proj = null;
                api.damage("⚙️ 회전 톱날을 피해서 던지세요!");
                break;
              }
            }

            // 타겟 슬라임/골렘 충돌
            if (proj) {
              for (const t of targets) {
                if (t.flyingToGate) continue;
                if (E.dist(proj.x, proj.y, t.x, t.y) < proj.r + t.r) {
                  if (mode === "add") {
                    const nextVal = t.val + proj.val;
                    if (nextVal <= 12) {
                      E.spawnPopup(t.x, t.y - t.r - 16, `${t.val}+${proj.val} → ${nextVal}!`, "#fde047", 24);
                      t.val = nextVal;
                      t.r = 28 + nextVal * 3.5;
                      t.sx = 1.45;
                      t.sy = 0.65;
                      A.play("merge", nextVal);
                      E.spawnParticles(t.x, t.y, "#fde047", 18, 240);
                      if (t.val === gate.target) {
                        t.flyingToGate = true;
                        A.speak(`${t.val} 합체 성공!`);
                      } else if (t.val > gate.target) {
                        // 목표보다 커지면 쪼개서 되돌림!
                        t.val = WAVES[wave - 1].fields[0];
                        t.r = 28 + t.val * 3.5;
                        E.spawnPopup(t.x, t.y - 45, "너무 커져서 펑!", "#f87171", 19);
                      }
                    }
                  } else {
                    // 빼기 골렘!
                    const nextVal = Math.max(1, t.val + proj.val);
                    const cut = t.val - nextVal;
                    E.spawnPopup(t.x, t.y - t.r - 16, `${t.val}-${cut} → ${nextVal}!`, "#38bdf8", 24);
                    t.val = nextVal;
                    t.r = 30 + nextVal * 4;
                    t.sx = 0.7;
                    t.sy = 1.35;
                    A.play("slice");
                    E.spawnParticles(t.x, t.y, "#94a3b8", 20, 260);
                    if (t.val === gate.target) {
                      t.flyingToGate = true;
                      A.speak(`${t.val} 완성!`);
                    } else if (t.val < gate.target) {
                      t.val = WAVES[wave - 1].golem;
                      t.r = 32 + t.val * 4;
                      E.spawnPopup(t.x, t.y - 45, "골렘 재생!", "#f87171", 19);
                    } else {
                      // 남은 뺄셈 양에 맞게 탄환 조절
                      ammoVal = -(t.val - gate.target > 3 ? 2 : t.val - gate.target);
                    }
                  }
                  proj = null;
                  break;
                }
              }
            }

            if (proj && (proj.x > E.VW + 40 || proj.y > E.VH + 40 || proj.y < -50)) {
              proj = null;
            }
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#4c1d95", "#1e1b4b", time, "night");
          E.drawGround(ctx, "#334155", "#0f172a", E.VH - 58);

          // 목표 성문
          ctx.save();
          E.roundRect(ctx, gate.x - 56, gate.y - 95, 112, 190, 28);
          ctx.fillStyle = gate.open ? "#22c55e" : "#1e293b";
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#fde047";
          ctx.stroke();
          ctx.font = "900 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#fde047";
          ctx.fillText("성문 목표", gate.x, gate.y - 52);
          ctx.font = "900 46px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(String(gate.target), gate.x, gate.y + 12);
          ctx.restore();

          // 회전 톱날
          for (const s of saws) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(time * 9);
            ctx.fillStyle = "#ef4444";
            for (let k = 0; k < 10; k++) {
              ctx.rotate((Math.PI * 2) / 10);
              ctx.beginPath();
              ctx.moveTo(-6, -s.r + 3);
              ctx.lineTo(0, -s.r - 9);
              ctx.lineTo(6, -s.r + 3);
              ctx.fill();
            }
            ctx.fillStyle = "#cbd5e1";
            ctx.beginPath();
            ctx.arc(0, 0, s.r - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 타겟들
          for (const t of targets) {
            E.drawCuteSlime(ctx, t.x, t.y, t.r, t.color, {
              sx: t.sx, sy: t.sy,
              label: t.val,
              dots: t.val,
              angry: Boolean(t.golem),
              glow: t.val === gate.target ? "rgba(74,222,128,0.5)" : null
            });
          }

          // 새총
          const bx = sling.pulling ? sling.px : sling.x;
          const by = sling.pulling ? sling.py : sling.y;
          ctx.save();
          ctx.strokeStyle = "#a16207";
          ctx.lineWidth = 10;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sling.x, sling.y + 125);
          ctx.lineTo(sling.x, sling.y + 30);
          ctx.lineTo(sling.x - 20, sling.y);
          ctx.moveTo(sling.x, sling.y + 30);
          ctx.lineTo(sling.x + 20, sling.y);
          ctx.stroke();

          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(sling.x - 20, sling.y);
          ctx.lineTo(bx, by);
          ctx.lineTo(sling.x + 20, sling.y);
          ctx.stroke();
          ctx.restore();

          if (sling.pulling) {
            const vx = (sling.x - sling.px) * 7.6;
            const vy = (sling.y - sling.py) * 7.6;
            E.drawSlingshotArc(ctx, sling.px, sling.py, vx, vy, 450, "#38bdf8");
          }

          if (!proj) {
            const label = ammoVal > 0 ? `+${ammoVal}` : `${ammoVal}`;
            E.drawCuteSlime(ctx, bx, by, 26, ammoVal > 0 ? "#38bdf8" : "#f43f5e", { label });
          } else {
            const label = proj.val > 0 ? `+${proj.val}` : `${proj.val}`;
            E.drawCuteSlime(ctx, proj.x, proj.y, proj.r, proj.val > 0 ? "#38bdf8" : "#f43f5e", { label });
          }

          E.drawSwipeTrail(ctx, trail, "#38bdf8");
          if (wave === 1 && time < 3.4 && !sling.pulling) {
            E.drawFingerHint(ctx, sling.x, sling.y, sling.x - 85, sling.y + 45, time);
          }
        },
        onPointerDown(x, y) {
          trail.push({ x, y, t: performance.now() });
          if (!proj && E.dist(x, y, sling.x, sling.y) < 115) {
            sling.pulling = true;
            sling.px = x;
            sling.py = y;
          }
        },
        onPointerMove(x, y) {
          trail.push({ x, y, t: performance.now() });
          if (!sling.pulling) return;
          const dx = x - sling.x;
          const dy = y - sling.y;
          const d = Math.hypot(dx, dy);
          const maxD = 128;
          if (d > maxD) {
            sling.px = sling.x + (dx / d) * maxD;
            sling.py = sling.y + (dy / d) * maxD;
          } else {
            sling.px = x;
            sling.py = y;
          }
        },
        onPointerUp() {
          if (!sling.pulling) return;
          sling.pulling = false;
          const vx = (sling.x - sling.px) * 7.6;
          const vy = (sling.y - sling.py) * 7.6;
          if (Math.hypot(vx, vy) > 140) {
            proj = { x: sling.px, y: sling.py, vx, vy, r: 26, val: ammoVal };
            A.play("throw");
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 5: ⚡ 로켓 10 변신 점프 (10 만들기 & 받아올림)
     ------------------------------------------------------------ */
  {
    id: 5,
    icon: "⚡",
    name: "로켓 10 변신 점프",
    desc: "점프해서 블록을 잡아 10칸 코어를 채우면 황금 로켓으로 변신해요!",
    tags: ["이동·점프·회피", "10 만들기·받아올림"],
    useTouchPad: true,
    padLabels: ["◀", "▶", "🚀 점프!"],
    create(api) {
      const { E, A } = api;
      const floorY = E.VH - 74;
      const hero = { x: E.VW / 2, y: floorY, vx: 0, vy: 0, r: 30, grounded: true, invuln: 0, rocketAnim: 0 };
      let wave = 1;
      let time = 0;
      let current = 7;
      let target = 10;
      let blocks = [];
      let spawnT = 0.4;
      let doneWave = false;
      let dragTargetX = null;

      const WAVES = [
        { start: 7, target: 10, title: "7칸이 찼어요! 3을 잡아 10 로켓 변신!" },
        { start: 6, target: 10, title: "6 + ? = 10! 빈칸 4개를 채우세요!" },
        { start: 8, target: 12, title: "받아올림! 8 + 4 → 10 로켓 + 2 스파크(12)!" },
        { start: 7, target: 13, title: "최고 난이도! 7 + 6 → 10 로켓 + 3 스파크(13)!" }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        current = cfg.start;
        target = cfg.target;
        blocks = [];
        doneWave = false;
        spawnT = 0.3;
        hero.rocketAnim = 0;
        api.setWave(w, WAVES.length, 0);
        api.setMission("점프·10변신", cfg.title);
        if (w === 1) A.speak("전기 드론을 피해 점프해서 숫자 블록을 잡으세요!", true);
      }

      function spawnItem() {
        const need = target - current;
        const isDrone = Math.random() < (0.22 + wave * 0.04);
        if (isDrone) {
          const fromLeft = Math.random() < 0.5;
          blocks.push({
            kind: "drone",
            x: fromLeft ? -30 : E.VW + 30,
            y: E.rand(floorY - 190, floorY - 30),
            vx: (fromLeft ? 1 : -1) * E.rand(170, 245),
            vy: 0,
            r: 24
          });
          return;
        }
        // 필요한 수 또는 합쳐서 만들 수 있는 작은 수 자주 등장
        let val;
        if (Math.random() < 0.52 && need > 0) val = need;
        else val = E.pick([1, 2, 3, 4, 5, 6].filter((n) => n <= Math.max(need, 3)));
        blocks.push({
          kind: "cube",
          val,
          x: E.rand(75, E.VW - 75),
          y: -30,
          vx: E.rand(-35, 35),
          vy: E.rand(110, 165),
          r: 28
        });
      }

      function jump() {
        if (hero.grounded) {
          hero.vy = -590;
          hero.grounded = false;
          A.play("jump");
          E.spawnParticles(hero.x, hero.y + 20, "#38bdf8", 8, 120);
        }
      }

      return {
        init() { setupWave(1); },
        onActionPress() { jump(); },
        update(dt, input) {
          time += dt;
          if (hero.invuln > 0) hero.invuln = Math.max(0, hero.invuln - dt);
          if (hero.rocketAnim > 0) hero.rocketAnim += dt;

          // 좌우 이동
          let move = 0;
          if (input.left) move -= 1;
          if (input.right) move += 1;
          if (dragTargetX !== null) {
            const dx = dragTargetX - hero.x;
            if (Math.abs(dx) > 12) move = Math.sign(dx);
          }
          hero.vx = move * 390;
          hero.x = E.clamp(hero.x + hero.vx * dt, 45, E.VW - 45);

          if (input.jumpJustPressed) jump();

          hero.vy += 1280 * dt;
          hero.y += hero.vy * dt;
          if (hero.y >= floorY) {
            hero.y = floorY;
            hero.vy = 0;
            hero.grounded = true;
          }

          if (!doneWave) {
            spawnT -= dt;
            if (spawnT <= 0) {
              spawnItem();
              spawnT = 0.85;
            }
          }

          for (let i = blocks.length - 1; i >= 0; i--) {
            const b = blocks[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.kind === "cube") {
              if (b.x < 40 || b.x > E.VW - 40) b.vx *= -1;
              if (b.y > floorY - 12 && b.vy > 0) {
                b.vy = -b.vy * 0.65;
                b.y = floorY - 12;
              } else {
                b.vy += 140 * dt;
              }
            }

            if (E.dist(hero.x, hero.y, b.x, b.y) < hero.r + b.r) {
              blocks.splice(i, 1);
              if (b.kind === "drone") {
                if (hero.invuln <= 0 && !doneWave) {
                  hero.invuln = 1.2;
                  E.shake(10);
                  A.play("hurt");
                  E.spawnParticles(hero.x, hero.y, "#ef4444", 16, 220);
                  api.damage("⚡ 빨간 드론을 점프해서 피하세요!");
                }
              } else if (!doneWave) {
                const next = current + b.val;
                if (next <= target) {
                  current = next;
                  const combo = api.addCombo();
                  A.play("pop", combo);
                  E.spawnParticles(hero.x, hero.y - 30, "#fde047", 14, 200);
                  api.addScore(100, hero.x, hero.y - 50, `+${b.val}!`);
                  api.setWave(wave, WAVES.length, current / target);

                  if (current === target) {
                    doneWave = true;
                    hero.rocketAnim = 0.01;
                    A.play("transform", combo + 2);
                    E.spawnConfetti(36);
                    const ones = target - 10;
                    const msg = ones > 0 ? `🚀 10 로켓 + ${ones} 스파크 = ${target}!` : "🚀 10 로켓 변신 완성!";
                    E.spawnPopup(hero.x, hero.y - 85, msg, "#fde047", 25);
                    A.speak(ones > 0 ? `10과 ${ones}, 모두 ${target}!` : "10 로켓 변신!");
                    setTimeout(() => {
                      if (wave < WAVES.length) setupWave(wave + 1);
                      else api.winStage();
                    }, 1150);
                  }
                } else {
                  A.play("hurt");
                  E.spawnPopup(hero.x, hero.y - 55, `넘쳤어요! (${next})`, "#f87171", 20);
                }
              }
              continue;
            }
            if (b.x < -80 || b.x > E.VW + 80 || b.y > E.VH + 50) blocks.splice(i, 1);
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0f172a", "#1e3a8a", time, "space");
          E.drawGround(ctx, "#38bdf8", "#0369a1", floorY + 26);

          // 상단 10칸 + 보너스 에너지 코어 시각화
          const slots = Math.max(10, target);
          const cellW = 36;
          const startX = E.VW / 2 - (slots * (cellW + 4)) / 2;
          E.roundRect(ctx, startX - 14, 58, slots * (cellW + 4) + 24, 62, 16);
          ctx.fillStyle = "rgba(15,23,42,0.82)";
          ctx.fill();
          ctx.strokeStyle = current >= 10 ? "#fde047" : "#38bdf8";
          ctx.lineWidth = 3;
          ctx.stroke();

          for (let i = 0; i < slots; i++) {
            const sx = startX + i * (cellW + 4);
            const filled = i < current;
            const isTen = i < 10;
            E.roundRect(ctx, sx, 70, cellW, 38, 8);
            ctx.fillStyle = filled ? (isTen ? "#facc15" : "#4ade80") : "rgba(255,255,255,0.12)";
            ctx.fill();
            if (i === 9) {
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
          E.drawBadgeBox(ctx, E.VW / 2 - 80, 126, 160, 32, "rgba(15,23,42,0.85)", "#fde047", `${current} / ${target}`, "#fde047", 17);

          // 블록 & 드론
          for (const b of blocks) {
            if (b.kind === "drone") {
              E.drawBomb(ctx, b.x, b.y, b.r, time);
            } else {
              E.drawCuteSlime(ctx, b.x, b.y, b.r, "#38bdf8", { label: `+${b.val}`, dots: b.val });
            }
          }

          // 로켓 봇 캐릭터
          ctx.save();
          if (hero.invuln > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.45;
          const ry = hero.rocketAnim > 0 ? hero.y - hero.rocketAnim * 280 : hero.y;
          if (hero.rocketAnim > 0) {
            ctx.font = "54px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🚀", hero.x, ry);
          } else {
            E.drawCuteSlime(ctx, hero.x, ry, hero.r, "#f59e0b", { label: current, glow: "rgba(251,191,36,0.35)" });
          }
          ctx.restore();
        },
        onPointerDown(x, y) {
          if (y < floorY - 60) jump();
          else dragTargetX = x;
        },
        onPointerMove(x) {
          if (dragTargetX !== null) dragTargetX = x;
        },
        onPointerUp() {
          dragTargetX = null;
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 6: 🐸 개구리 수직선 파쿠르 (뛰어 세기 & 수직선 점프)
     ------------------------------------------------------------ */
  {
    id: 6,
    icon: "🐸",
    name: "수직선 파쿠르",
    desc: "용암 위 숫자 섬을 폴짝 뛰어 세며 꽃게를 피해 보물섬으로 점프하세요!",
    tags: ["파쿠르 점프", "뛰어 세기·수직선"],
    useTouchPad: true,
    padLabels: ["◀ 뒤로", "▶ 앞으로", "🐸 빅점프!"],
    create(api) {
      const { E, A } = api;
      let wave = 1;
      let time = 0;
      let frog = { idx: 0, x: 100, y: 360, jumpT: 0, fromX: 100, toX: 100, arcH: 90, jumping: false, invuln: 0 };
      let pads = [];
      let crabs = [];
      let targetIdx = 10;
      let stepSize = 2;
      let camX = 0;
      let doneWave = false;

      const WAVES = [
        { max: 12, start: 0, target: 10, step: 2, title: "2씩 뛰어 세며 10 보물섬으로 점프!" },
        { max: 20, start: 0, target: 15, step: 5, title: "5씩 뛰어 세며 15 보물섬으로 점프!" },
        { max: 18, start: 14, target: 8, step: -3, title: "뒤로 -3씩 점프해 8 포탈에 도착하세요!" }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        targetIdx = cfg.target;
        stepSize = cfg.step;
        doneWave = false;
        pads = [];
        for (let i = 0; i <= cfg.max; i++) {
          pads.push({
            idx: i,
            x: 90 + i * 82,
            y: 390 + Math.sin(i * 0.7) * 18,
            lit: i === cfg.start
          });
        }
        frog = {
          idx: cfg.start,
          x: pads[cfg.start].x,
          y: pads[cfg.start].y - 34,
          fromX: pads[cfg.start].x,
          toX: pads[cfg.start].x,
          jumpT: 0,
          arcH: 100,
          jumping: false,
          invuln: 0
        };
        camX = Math.max(0, frog.x - E.VW * 0.35);

        crabs = [];
        for (let i = 3; i < cfg.max - 1; i += 4) {
          if (i === cfg.target) continue;
          crabs.push({ padIdx: i, phase: i * 1.3, active: true });
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission("수직선 점프", cfg.title);
        if (w === 1) A.speak("개구리를 점프시켜 보물섬까지 뛰어 세어 보세요!", true);
      }

      function jumpDelta(delta) {
        if (frog.jumping || doneWave) return;
        const next = E.clamp(frog.idx + delta, 0, pads.length - 1);
        if (next === frog.idx) return;
        frog.fromX = frog.x;
        frog.idx = next;
        frog.toX = pads[next].x;
        frog.jumpT = 0;
        frog.arcH = Math.abs(delta) > 1 ? 135 : 85;
        frog.jumping = true;
        A.play("jump");
        E.spawnPopup(frog.x, frog.y - 45, delta > 0 ? `+${delta}` : `${delta}`, "#fde047", 22);
      }

      return {
        init() { setupWave(1); },
        onActionPress() { jumpDelta(stepSize); },
        update(dt, input) {
          time += dt;
          if (frog.invuln > 0) frog.invuln = Math.max(0, frog.invuln - dt);

          if (!frog.jumping && !doneWave) {
            if (input.rightJustPressed) jumpDelta(1);
            else if (input.leftJustPressed) jumpDelta(-1);
            else if (input.jumpJustPressed) jumpDelta(stepSize);
          }

          if (frog.jumping) {
            frog.jumpT += dt * 3.1;
            const t = Math.min(1, frog.jumpT);
            const p = pads[frog.idx];
            frog.x = frog.fromX + (frog.toX - frog.fromX) * t;
            frog.y = p.y - 34 - Math.sin(t * Math.PI) * frog.arcH;
            if (t >= 1) {
              frog.jumping = false;
              p.lit = true;
              A.play("pop", frog.idx);
              E.spawnParticles(frog.x, p.y - 10, "#4ade80", 10, 140);

              // 꽃게 충돌 체크 (착지 순간 같은 발판에 꽃게가 올라와 있으면)
              const crab = crabs.find((c) => c.padIdx === frog.idx && Math.sin(time * 2.2 + c.phase) > 0.25);
              if (crab && frog.invuln <= 0) {
                frog.invuln = 1.2;
                E.shake(10);
                A.play("hurt");
                api.damage("🦀 꽃게가 숨었을 때 점프해 착지하세요!");
              } else {
                const start = WAVES[wave - 1].start;
                const prog = Math.abs(frog.idx - start) / Math.max(1, Math.abs(targetIdx - start));
                api.setWave(wave, WAVES.length, Math.min(1, prog));
                api.addScore(80, frog.x, frog.y - 35, `${frog.idx}!`);
              }

              if (frog.idx === targetIdx && !doneWave) {
                doneWave = true;
                const combo = api.addCombo();
                A.play("transform", combo);
                E.spawnConfetti(36);
                E.spawnPopup(frog.x, frog.y - 65, `🏆 ${targetIdx} 보물섬 도착!`, "#fde047", 26);
                A.speak(`${targetIdx} 보물섬 도착!`);
                setTimeout(() => {
                  if (wave < WAVES.length) setupWave(wave + 1);
                  else api.winStage();
                }, 1050);
              }
            }
          }

          const desiredCam = E.clamp(frog.x - E.VW * 0.36, 0, Math.max(0, pads[pads.length - 1].x - E.VW + 120));
          camX += (desiredCam - camX) * Math.min(1, dt * 6);
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0ea5e9", "#fef08a", time, "day");
          // 아래 용암/물결
          const lavaY = 475;
          ctx.fillStyle = "#ea580c";
          ctx.fillRect(0, lavaY, E.VW, E.VH - lavaY);
          ctx.fillStyle = "#fde047";
          for (let i = 0; i < 16; i++) {
            const wx = ((i * 80 - camX * 0.5 + time * 40) % (E.VW + 80)) - 40;
            ctx.beginPath();
            ctx.arc(wx, lavaY, 24, Math.PI, 0);
            ctx.fill();
          }

          ctx.save();
          ctx.translate(-camX, 0);

          // 점프 안내선 (다음 뛰어세기 칸 표시)
          const hintNext = E.clamp(frog.idx + stepSize, 0, pads.length - 1);
          if (!doneWave && hintNext !== frog.idx) {
            const a = pads[frog.idx];
            const b = pads[hintNext];
            ctx.strokeStyle = "rgba(253,224,71,0.55)";
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y - 24);
            ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 140, b.x, b.y - 24);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 숫자 섬 발판
          for (const p of pads) {
            const isTarget = p.idx === targetIdx;
            const isHint = p.idx === hintNext;
            E.roundRect(ctx, p.x - 32, p.y - 16, 64, 48, 14);
            ctx.fillStyle = isTarget ? "#fde047" : p.lit ? "#22c55e" : isHint ? "#38bdf8" : "#475569";
            ctx.fill();
            ctx.lineWidth = isTarget ? 4 : 3;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            ctx.font = "900 22px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isTarget ? "#78350f" : "#ffffff";
            ctx.fillText(String(p.idx), p.x, p.y + 8);

            if (isTarget) {
              ctx.font = "34px sans-serif";
              ctx.fillText("🏆", p.x, p.y - 42);
            }
          }

          // 꽃게 장애물 (올라왔다 내려갔다)
          for (const c of crabs) {
            const p = pads[c.padIdx];
            const up = Math.sin(time * 2.2 + c.phase);
            if (up > -0.2) {
              const cy = p.y - 28 - Math.max(0, up) * 16;
              ctx.font = "30px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🦀", p.x, cy);
            }
          }

          // 개구리 영웅
          ctx.save();
          if (frog.invuln > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.45;
          ctx.font = "46px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🐸", frog.x, frog.y);
          ctx.restore();

          ctx.restore();
        },
        onPointerDown(x, y) {
          const wx = x + camX;
          // 화면의 섬을 직접 탭하면 그 쪽으로 점프!
          for (const p of pads) {
            if (E.dist(wx, y, p.x, p.y) < 42 && p.idx !== frog.idx) {
              jumpDelta(p.idx - frog.idx);
              return;
            }
          }
          if (x > E.VW * 0.5) jumpDelta(stepSize);
          else jumpDelta(-1);
        }
      };
    }
  }
];
