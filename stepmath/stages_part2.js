"use strict";

/* ============================================================
   넘버 아일랜드 스테이지 7~12
   7. 블록 메카 대시 러너 (십·일·백 자릿값 진화)
   8. 묶음 대포 & 드래곤 파티 (곱셈·나눗셈)
   9. 닌자 분수 슬라이스 & 물약 블래스터 (분수·소수)
   10. 시계 톱니 점프 & 측정 대포 (길이·무게·시계)
   11. 코인 대시 & 도형 포탈 디펜스 (돈·도형·규칙)
   12. 수학 마왕성 최종 보스전! (그래프·올스타 액션)
   ============================================================ */
window.MathStagesPart2 = [
  /* ------------------------------------------------------------
     STAGE 7: 🤖 블록 메카 대시 러너 (십·일·백 자릿값 진화)
     ------------------------------------------------------------ */
  {
    id: 7,
    icon: "🤖",
    name: "블록 메카 러너",
    desc: "레인을 바꾸고 점프하며 블록 10개를 10막대로, 100판으로 진화시키세요!",
    tags: ["3레인 러너", "십·일·백 자릿값"],
    useTouchPad: true,
    padLabels: ["▲ 위 레인", "▼ 아래 레인", "⚡ 대시!"],
    create(api) {
      const { E, A } = api;
      const LANES = [195, 310, 425];
      let wave = 1;
      let time = 0;
      let lane = 1;
      let heroY = LANES[1];
      let totalVal = 0;
      let targetVal = 24;
      let objs = [];
      let spawnT = 0.4;
      let gate = null;
      let gateDist = 0;
      let doneWave = false;
      let invuln = 0;

      const WAVES = [
        { target: 24, start: 0, title: "10막대(🟩)와 1블록(🟦)을 모아 24를 맞춰 성문을 부수세요!" },
        { target: 132, start: 0, title: "100판(🟧) + 10막대(🟩) + 1블록(🟦)으로 132 변신!" },
        { target: 215, start: 100, title: "최고속 질주! 자릿값을 맞춰 215 게이트를 돌파하세요!" }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        targetVal = cfg.target;
        totalVal = cfg.start;
        objs = [];
        gate = null;
        gateDist = 0;
        doneWave = false;
        spawnT = 0.35;
        api.setWave(w, WAVES.length, 0);
        api.setMission("3레인 러너", cfg.title);
        if (w === 1) A.speak("레인을 위아래로 움직여 자릿값 블록을 모아 보세요!", true);
      }

      function changeVal(delta) {
        const prevT = Math.floor(totalVal / 10);
        const prevH = Math.floor(totalVal / 100);
        totalVal = Math.max(0, totalVal + delta);
        const nextT = Math.floor(totalVal / 10);
        const nextH = Math.floor(totalVal / 100);

        if (delta > 0 && nextH > prevH) {
          A.play("transform", 4);
          E.spawnParticles(170, heroY, "#f97316", 24, 260);
          E.spawnPopup(170, heroY - 58, "🟧 100 메카 진화!", "#fb923c", 24);
          A.speak("백 모형으로 변신!");
        } else if (delta > 0 && nextT > prevT && delta < 10) {
          A.play("transform", 2);
          E.spawnParticles(170, heroY, "#22c55e", 18, 220);
          E.spawnPopup(170, heroY - 54, "🟩 10개 합체! 십 모형!", "#4ade80", 22);
        } else {
          A.play("pop");
          E.spawnPopup(170, heroY - 42, delta > 0 ? `+${delta}` : `${delta}`, delta > 0 ? "#38bdf8" : "#f87171", 20);
        }

        const prog = Math.min(1, 1 - Math.abs(targetVal - totalVal) / Math.max(1, targetVal));
        api.setWave(wave, WAVES.length, Math.max(0, prog));
      }

      function spawnRow() {
        const diff = targetVal - totalVal;
        const chosenLane = E.randInt(0, 2);
        // 장애물 레이저 또는 필요한 자릿값 블록 생성
        if (Math.random() < 0.28) {
          objs.push({ kind: "laser", lane: chosenLane, x: E.VW + 60, r: 30 });
        } else {
          let val = 1;
          if (diff >= 100) val = 100;
          else if (diff >= 10) val = E.pick([10, 10, 1]);
          else if (diff > 0) val = E.pick([1, 1, 5, 10]);
          else if (diff <= -10) val = -10;
          else if (diff < 0) val = -1;
          else val = E.pick([1, -1]);

          objs.push({
            kind: "block",
            val,
            lane: chosenLane,
            x: E.VW + 60,
            r: 28
          });
        }

        // 보조 아이템 하나 더 배치
        const otherLane = (chosenLane + E.randInt(1, 2)) % 3;
        const altVal = diff >= 10 ? 1 : diff < 0 ? -1 : 10;
        objs.push({ kind: "block", val: altVal, lane: otherLane, x: E.VW + 60, r: 26 });
      }

      return {
        init() { setupWave(1); },
        onActionPress() {
          // 게이트 근처면 대시 / 평상시엔 다음 레인 순환
          lane = (lane + 1) % 3;
          A.play("jump");
        },
        update(dt, input) {
          time += dt;
          if (invuln > 0) invuln = Math.max(0, invuln - dt);

          if (input.leftJustPressed || input.upJustPressed) {
            lane = Math.max(0, lane - 1);
            A.play("jump");
          } else if (input.rightJustPressed || input.downJustPressed) {
            lane = Math.min(2, lane + 1);
            A.play("jump");
          } else if (input.jumpJustPressed) {
            lane = (lane + 1) % 3;
            A.play("jump");
          }
          heroY += (LANES[lane] - heroY) * Math.min(1, dt * 16);

          const speed = 265 + wave * 28;
          if (!doneWave) {
            spawnT -= dt;
            if (spawnT <= 0) {
              spawnRow();
              spawnT = 0.85;
            }
            // 목표와 같아지면 보스 게이트 등장!
            if (totalVal === targetVal && !gate) {
              gate = { x: E.VW + 80 };
              api.toast(`⚡ ${targetVal} 딱 맞췄다! 게이트 돌파!`);
            }
          }

          if (gate) {
            gate.x -= speed * dt;
            if (gate.x <= 185 && !doneWave) {
              if (totalVal === targetVal) {
                doneWave = true;
                const combo = api.addCombo();
                A.play("transform", combo + 2);
                E.shake(12);
                E.spawnConfetti(38);
                api.addScore(300, 220, heroY, `💥 ${targetVal} 돌파!`);
                A.speak(`${targetVal} 게이트 돌파!`);
                setTimeout(() => {
                  if (wave < WAVES.length) setupWave(wave + 1);
                  else api.winStage();
                }, 1050);
              } else {
                gate = null;
                A.play("hurt");
                E.spawnPopup(200, heroY - 40, "숫자가 달라요!", "#f87171", 20);
              }
            }
          }

          for (let i = objs.length - 1; i >= 0; i--) {
            const o = objs[i];
            o.x -= speed * dt;
            if (Math.abs(o.x - 165) < 42 && Math.abs(LANES[o.lane] - heroY) < 40) {
              objs.splice(i, 1);
              if (o.kind === "laser") {
                if (invuln <= 0 && !doneWave) {
                  invuln = 1.1;
                  E.shake(10);
                  A.play("hurt");
                  api.damage("⚡ 레이저 장벽을 피해 다른 레인으로 이동하세요!");
                }
              } else if (!doneWave) {
                changeVal(o.val);
                api.addScore(50, 165, heroY);
              }
              continue;
            }
            if (o.x < -60) objs.splice(i, 1);
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0f172a", "#1e293b", time, "space");

          // 3레인 트랙
          for (let i = 0; i < 3; i++) {
            const ly = LANES[i];
            E.roundRect(ctx, 20, ly - 38, E.VW - 40, 76, 16);
            ctx.fillStyle = i === lane ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.05)";
            ctx.fill();
            ctx.strokeStyle = i === lane ? "rgba(56,189,248,0.5)" : "rgba(148,163,184,0.18)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // 상단 자릿값 변신 계기판 (백 / 십 / 일)
          const h = Math.floor(totalVal / 100);
          const t = Math.floor((totalVal % 100) / 10);
          const u = totalVal % 10;
          E.drawBadgeBox(ctx, 220, 62, 140, 52, "rgba(249,115,22,0.22)", "#fb923c", `🟧 백: ${h}`, "#fed7aa", 19);
          E.drawBadgeBox(ctx, 375, 62, 140, 52, "rgba(34,197,94,0.22)", "#4ade80", `🟩 십: ${t}`, "#bbf7d0", 19);
          E.drawBadgeBox(ctx, 530, 62, 140, 52, "rgba(56,189,248,0.22)", "#38bdf8", `🟦 일: ${u}`, "#bae6fd", 19);
          E.drawBadgeBox(ctx, 690, 62, 155, 52, "rgba(15,23,42,0.88)", "#fde047", `목표: ${targetVal}`, "#fde047", 20);

          // 게이트
          if (gate) {
            ctx.save();
            E.roundRect(ctx, gate.x - 26, 145, 52, 340, 14);
            ctx.fillStyle = "rgba(34,197,94,0.35)";
            ctx.fill();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.font = "900 28px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#fde047";
            ctx.fillText(`⚡ ${targetVal}`, gate.x, 315);
            ctx.restore();
          }

          // 오브젝트
          for (const o of objs) {
            const oy = LANES[o.lane];
            if (o.kind === "laser") {
              E.drawBomb(ctx, o.x, oy, o.r, time);
            } else {
              const col = o.val === 100 ? "#f97316" : o.val === 10 ? "#22c55e" : o.val > 0 ? "#38bdf8" : "#ef4444";
              E.drawCuteSlime(ctx, o.x, oy, o.r, col, { label: o.val > 0 ? `+${o.val}` : `${o.val}` });
            }
          }

          // 메카 로봇 + 장착된 백/십/일 시각화
          ctx.save();
          if (invuln > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.45;
          // 뒤에 붙은 100판과 10막대
          for (let i = 0; i < Math.min(3, h); i++) {
            E.roundRect(ctx, 84 - i * 12, heroY - 30, 26, 60, 6);
            ctx.fillStyle = "#f97316";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          for (let i = 0; i < Math.min(5, t); i++) {
            E.roundRect(ctx, 114 - i * 7, heroY - 26, 10, 52, 4);
            ctx.fillStyle = "#22c55e";
            ctx.fill();
          }
          E.drawCuteSlime(ctx, 165, heroY, 34, "#6366f1", { label: totalVal, glow: "rgba(99,102,241,0.4)" });
          ctx.restore();
        },
        onPointerDown(x, y) {
          // 레인 직접 터치로 즉시 이동!
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i < 3; i++) {
            const d = Math.abs(y - LANES[i]);
            if (d < bestD) { bestD = d; best = i; }
          }
          if (best !== lane) {
            lane = best;
            A.play("jump");
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 8: 🚀 묶음 대포 & 드래곤 파티 (곱셈·나눗셈)
     ------------------------------------------------------------ */
  {
    id: 8,
    icon: "🚀",
    name: "묶음 대포·드래곤",
    desc: "로켓 묶음 대포로 방패를 깨고 아기 드래곤에게 먹이를 공평하게 던져요!",
    tags: ["연발 대포·던지기", "곱셈·나눗셈"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      let wave = 1;
      let time = 0;
      let mode = "mul";
      let doneWave = false;

      // 곱셈 상태
      let bundle = 3;
      let groups = 4;
      let hits = 0;
      let rockets = [];
      let drones = [];
      let droneT = 1.0;

      // 나눗셈 상태
      let dragons = [];
      let totalTreats = 12;
      let leftTreats = 12;
      let draggedTreat = null;
      let platter = { x: E.VW / 2, y: E.VH - 82, r: 44 };

      const WAVES = [
        { mode: "mul", bundle: 3, groups: 4, title: "3발씩 묶음 대포를 4번 쏴서 12 방패를 깨세요!" },
        { mode: "div", dragons: 3, total: 9, title: "먹이 9개를 아기 드래곤 3마리에게 똑같이 던져주세요!" },
        { mode: "mul", bundle: 4, groups: 3, title: "4발씩 묶음 대포! 4×3 = 12 방패 돌파!" },
        { mode: "div", dragons: 4, total: 12, title: "먹이 12개를 드래곤 4마리에게 공평하게 나누어 주세요!" }
      ];

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        mode = cfg.mode;
        doneWave = false;
        rockets = [];
        drones = [];
        draggedTreat = null;

        if (mode === "mul") {
          bundle = cfg.bundle;
          groups = cfg.groups;
          hits = 0;
          droneT = 1.1;
        } else {
          totalTreats = cfg.total;
          leftTreats = cfg.total;
          dragons = Array.from({ length: cfg.dragons }, (_, i) => ({
            x: (E.VW / (cfg.dragons + 1)) * (i + 1),
            baseX: (E.VW / (cfg.dragons + 1)) * (i + 1),
            y: 165,
            got: 0,
            need: cfg.total / cfg.dragons,
            phase: i * 1.4,
            bounce: 0
          }));
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission(mode === "mul" ? "묶음 대포" : "공평 던지기", cfg.title);
        if (w === 1) A.speak("화면을 눌러 묶음 로켓을 발사해 방패를 깨뜨리세요!", true);
      }

      function nextWaveSoon() {
        doneWave = true;
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnConfetti(36);
        setTimeout(() => {
          if (wave < WAVES.length) setupWave(wave + 1);
          else api.winStage();
        }, 1050);
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          if (mode === "mul") {
            if (!doneWave) {
              droneT -= dt;
              if (droneT <= 0) {
                drones.push({ x: 640, y: E.rand(140, 420), vx: -165 - wave * 20, r: 24 });
                droneT = 1.6;
              }
            }
            for (let i = drones.length - 1; i >= 0; i--) {
              const d = drones[i];
              d.x += d.vx * dt;
              if (d.x < 130) {
                drones.splice(i, 1);
                E.shake(9);
                A.play("hurt");
                api.damage("💣 드론을 터치하거나 로켓으로 맞추세요!");
              }
            }
            for (let i = rockets.length - 1; i >= 0; i--) {
              const r = rockets[i];
              r.x += r.vx * dt;
              r.y += r.vy * dt;
              // 드론 요격
              let hitDrone = false;
              for (let j = drones.length - 1; j >= 0; j--) {
                if (E.dist(r.x, r.y, drones[j].x, drones[j].y) < 34) {
                  E.spawnParticles(drones[j].x, drones[j].y, "#fde047", 14, 210);
                  A.play("hit");
                  api.addScore(70, drones[j].x, drones[j].y, "요격!");
                  drones.splice(j, 1);
                  rockets.splice(i, 1);
                  hitDrone = true;
                  break;
                }
              }
              if (hitDrone) continue;

              // 보스 방패 타격
              if (r.x >= 740) {
                rockets.splice(i, 1);
                if (!doneWave && hits < groups) {
                  hits += 1;
                  const nowSum = hits * bundle;
                  A.play("hit", hits);
                  E.shake(7);
                  E.spawnParticles(760, r.y, "#38bdf8", 16, 220);
                  api.addScore(110, 720, r.y - 25, `${bundle}×${hits} = ${nowSum}!`);
                  api.setWave(wave, WAVES.length, hits / groups);
                  if (hits >= groups) {
                    E.spawnPopup(720, 220, `💥 ${bundle}×${groups}=${nowSum} 격파!`, "#fde047", 26);
                    A.speak(`${bundle} 곱하기 ${groups}는 ${nowSum}! 격파!`);
                    nextWaveSoon();
                  }
                }
              } else if (r.x > E.VW + 40 || r.y < -30 || r.y > E.VH + 30) {
                rockets.splice(i, 1);
              }
            }
          } else {
            for (const d of dragons) {
              d.x = d.baseX + Math.sin(time * 1.4 + d.phase) * 34;
              if (d.bounce > 0) d.bounce = Math.max(0, d.bounce - dt * 4);
            }
            if (draggedTreat && draggedTreat.flying) {
              draggedTreat.x += draggedTreat.vx * dt;
              draggedTreat.y += draggedTreat.vy * dt;
              draggedTreat.vy += 380 * dt;
              for (const d of dragons) {
                if (E.dist(draggedTreat.x, draggedTreat.y, d.x, d.y) < 54) {
                  if (d.got < d.need) {
                    d.got += 1;
                    d.bounce = 1;
                    leftTreats -= 1;
                    draggedTreat = null;
                    const combo = api.addCombo();
                    A.play("pop", combo);
                    E.spawnParticles(d.x, d.y, "#4ade80", 14, 190);
                    api.addScore(90, d.x, d.y - 45, `${d.got}개!`);
                    api.setWave(wave, WAVES.length, (totalTreats - leftTreats) / totalTreats);
                    if (leftTreats === 0 && dragons.every((dr) => dr.got === dr.need) && !doneWave) {
                      E.spawnPopup(E.VW / 2, 270, `🐉 모두 ${d.need}개씩 황금 진화!`, "#fde047", 27);
                      A.speak(`모두 ${d.need}개씩 똑같이 나누었어요!`);
                      nextWaveSoon();
                    }
                  } else {
                    // 너무 많이 주면 튕겨 되돌려 줌!
                    draggedTreat.vy = 220;
                    draggedTreat.vx = -draggedTreat.vx * 0.5;
                    A.play("jump");
                    E.spawnPopup(d.x, d.y - 50, "배불러요! 다른 친구에게!", "#fb923c", 18);
                  }
                  break;
                }
              }
              if (draggedTreat && (draggedTreat.y > E.VH + 40 || draggedTreat.x < -40 || draggedTreat.x > E.VW + 40)) {
                draggedTreat = null;
              }
            }
          }
        },
        draw(ctx) {
          if (mode === "mul") {
            E.drawSkyBackdrop(ctx, "#1e1b4b", "#312e81", time, "space");
            // 보스 방패 & 쌓인 묶음 표시
            E.roundRect(ctx, 760, 120, 145, 340, 22);
            ctx.fillStyle = "rgba(30,41,59,0.9)";
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#38bdf8";
            ctx.stroke();

            ctx.font = "44px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("👾", 832, 168);
            ctx.font = "900 24px sans-serif";
            ctx.fillStyle = "#fde047";
            ctx.fillText(`${hits * bundle} / ${bundle * groups}`, 832, 225);

            // 묶음 시각 칸
            for (let g = 0; g < groups; g++) {
              const gy = 258 + g * 46;
              E.roundRect(ctx, 776, gy, 112, 34, 9);
              ctx.fillStyle = g < hits ? "#22c55e" : "rgba(255,255,255,0.12)";
              ctx.fill();
              ctx.font = "900 15px sans-serif";
              ctx.fillStyle = "#fff";
              ctx.fillText(`${bundle}발 묶음`, 832, gy + 18);
            }

            // 드론
            for (const d of drones) E.drawBomb(ctx, d.x, d.y, d.r, time);

            // 묶음 로켓 발사체
            for (const r of rockets) {
              for (let k = 0; k < bundle; k++) {
                const oy = (k - (bundle - 1) / 2) * 18;
                ctx.font = "24px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("🚀", r.x, r.y + oy);
              }
            }

            // 왼쪽 대포
            E.drawCuteSlime(ctx, 110, E.VH / 2, 42, "#38bdf8", { label: `×${bundle}` });
            E.drawBadgeBox(ctx, 38, E.VH / 2 + 56, 145, 36, "rgba(15,23,42,0.88)", "#fde047", "화면 터치 발사!", "#fde047", 15);
          } else {
            E.drawSkyBackdrop(ctx, "#065f46", "#34d399", time, "day");
            E.drawGround(ctx, "#4ade80", "#15803d", E.VH - 64);

            // 아기 드래곤들
            for (const d of dragons) {
              const sc = 1 + d.bounce * 0.22;
              const full = d.got === d.need;
              ctx.save();
              ctx.translate(d.x, d.y);
              ctx.scale(sc, sc);
              E.drawCuteSlime(ctx, 0, 0, 44 + d.got * 3, full ? "#eab308" : "#22c55e", {
                glow: full ? "rgba(253,224,71,0.55)" : null
              });
              ctx.font = "34px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(full ? "🐲" : "🦖", 0, -56);
              E.drawBadgeBox(ctx, -45, 52, 90, 32, "rgba(15,23,42,0.88)", full ? "#fde047" : "#fff", `${d.got}개`, "#fff", 17);
              ctx.restore();
            }

            // 중앙 고기/보석 접시
            E.roundRect(ctx, platter.x - 105, platter.y - 36, 210, 72, 24);
            ctx.fillStyle = "rgba(15,23,42,0.86)";
            ctx.fill();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.font = "30px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🍖", platter.x - 45, platter.y);
            ctx.font = "900 22px sans-serif";
            ctx.fillStyle = "#fde047";
            ctx.fillText(`남은 먹이: ${leftTreats}`, platter.x + 25, platter.y);

            if (draggedTreat) {
              ctx.font = "38px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🍖", draggedTreat.x, draggedTreat.y);
            }

            if (wave === 2 && time < 3.4 && !draggedTreat && dragons[0]) {
              E.drawFingerHint(ctx, platter.x, platter.y, dragons[0].x, dragons[0].y, time);
            }
          }
        },
        onPointerDown(x, y) {
          if (doneWave) return;
          if (mode === "mul") {
            // 드론 직접 터치해도 요격!
            for (let i = drones.length - 1; i >= 0; i--) {
              if (E.dist(x, y, drones[i].x, drones[i].y) < drones[i].r + 22) {
                E.spawnParticles(drones[i].x, drones[i].y, "#fde047", 14, 210);
                A.play("slice");
                drones.splice(i, 1);
                api.addScore(70, x, y, "컷!");
                return;
              }
            }
            const ang = Math.atan2(y - E.VH / 2, Math.max(80, x - 110));
            rockets.push({ x: 145, y: E.VH / 2, vx: Math.cos(ang) * 580, vy: Math.sin(ang) * 580 });
            A.play("throw");
          } else if (leftTreats > 0 && !draggedTreat) {
            draggedTreat = { x, y, vx: 0, vy: 0, flying: false };
          }
        },
        onPointerMove(x, y, px, py) {
          if (mode === "div" && draggedTreat && !draggedTreat.flying) {
            draggedTreat.vx = (x - px) * 28;
            draggedTreat.vy = (y - py) * 28;
            draggedTreat.x = x;
            draggedTreat.y = y;
          }
        },
        onPointerUp(x, y) {
          if (mode === "div" && draggedTreat && !draggedTreat.flying) {
            // 위로 튕기거나 드래곤 쪽을 탭하면 날아감
            if (Math.hypot(draggedTreat.vx, draggedTreat.vy) < 120 && y < platter.y - 40) {
              const dx = x - platter.x;
              const dy = y - platter.y;
              draggedTreat.vx = dx * 2.2;
              draggedTreat.vy = Math.min(-320, dy * 2.2);
            }
            draggedTreat.flying = true;
            A.play("throw");
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 9: 🍕 닌자 분수 슬라이스 & 물약 블래스터 (분수·소수)
     ------------------------------------------------------------ */
  {
    id: 9,
    icon: "🍕",
    name: "분수 슬라이스·물약",
    desc: "피자를 쓱 베어 분수 조각으로 나누고 물총으로 0.1씩 물약을 채우세요!",
    tags: ["베기·물총조준", "분수·소수 0.1"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      let wave = 1;
      let time = 0;
      let mode = "frac";
      let doneWave = false;
      let trail = [];

      // 분수 상태
      let pizza = { x: E.VW / 2, y: 345, r: 108, parts: 1, targetParts: 4, wantNum: 3, sent: 0, slices: [] };
      let ufo = { x: E.VW / 2, y: 92 };
      let flies = [];
      let flyT = 1.6;
      let draggingSlice = null;

      // 소수 비커 상태
      let beaker = { x: E.VW / 2, y: 295, w: 170, h: 245, fill: 0, target: 0.7 };
      let bubbles = [];
      let inkT = 1.2;

      const WAVES = [
        { mode: "frac", parts: 2, want: 1, title: "피자를 한 번 베어 1/2 조각을 UFO로 던지세요!" },
        { mode: "dec", target: 0.6, title: "0.1 / 0.2 물방울을 눌러 0.6 물약을 만드세요! (💣 먹물 피하기)" },
        { mode: "frac", parts: 4, want: 3, title: "피자를 두 번 베어 4조각으로 만든 뒤 3/4을 UFO로 던지세요!" },
        { mode: "dec", target: 0.8, title: "잉크 폭탄을 피해 정확히 0.8 물약을 완성하세요!" }
      ];

      function buildPizzaSlices(parts) {
        pizza.parts = parts;
        pizza.slices = Array.from({ length: parts }, (_, i) => ({
          idx: i,
          a0: (i * Math.PI * 2) / parts - Math.PI / 2,
          a1: ((i + 1) * Math.PI * 2) / parts - Math.PI / 2,
          x: pizza.x,
          y: pizza.y,
          sent: false
        }));
      }

      function setupWave(w) {
        wave = w;
        const cfg = WAVES[w - 1];
        mode = cfg.mode;
        doneWave = false;
        flies = [];
        bubbles = [];
        draggingSlice = null;

        if (mode === "frac") {
          pizza.targetParts = cfg.parts;
          pizza.wantNum = cfg.want;
          pizza.sent = 0;
          buildPizzaSlices(1);
          flyT = 1.8;
        } else {
          beaker.fill = 0;
          beaker.target = cfg.target;
          inkT = 1.0;
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission(mode === "frac" ? "분수 슬라이스" : "소수 물약", cfg.title);
        if (w === 1) A.speak("피자를 손가락으로 쓱 베어 반으로 나눈 뒤 위로 던져 보세요!", true);
      }

      function finishWave(msg) {
        if (doneWave) return;
        doneWave = true;
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnConfetti(36);
        E.spawnPopup(E.VW / 2, 230, msg, "#fde047", 26);
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

          if (mode === "frac") {
            ufo.x = E.VW / 2 + Math.sin(time * 1.4) * 140;
            if (!doneWave) {
              flyT -= dt;
              if (flyT <= 0) {
                flies.push({ x: Math.random() < 0.5 ? -20 : E.VW + 20, y: E.rand(180, 400), spd: 120, r: 22 });
                flyT = 2.4;
              }
            }
            for (let i = flies.length - 1; i >= 0; i--) {
              const f = flies[i];
              const ang = Math.atan2(pizza.y - f.y, pizza.x - f.x);
              f.x += Math.cos(ang) * f.spd * dt;
              f.y += Math.sin(ang) * f.spd * dt;
              if (E.dist(f.x, f.y, pizza.x, pizza.y) < 55) {
                flies.splice(i, 1);
                E.shake(8);
                A.play("hurt");
                api.damage("🪰 파리가 피자를 훔치기 전에 터치해 쫓아내세요!");
              }
            }
          } else {
            if (!doneWave) {
              inkT -= dt;
              if (inkT <= 0) {
                const isBomb = Math.random() < 0.34;
                bubbles.push({
                  kind: isBomb ? "ink" : "drop",
                  val: isBomb ? 0 : E.pick([0.1, 0.1, 0.2, 0.3]),
                  x: E.rand(140, E.VW - 140),
                  y: -28,
                  vy: E.rand(95, 145) + wave * 12,
                  r: isBomb ? 24 : 30
                });
                inkT = 0.72;
              }
            }
            for (let i = bubbles.length - 1; i >= 0; i--) {
              const b = bubbles[i];
              b.y += b.vy * dt;
              // 먹물 폭탄이 비커에 떨어지면 감점
              if (b.kind === "ink" && Math.abs(b.x - beaker.x) < beaker.w * 0.48 && b.y > beaker.y - beaker.h * 0.45) {
                bubbles.splice(i, 1);
                beaker.fill = Math.max(0, Math.round((beaker.fill - 0.1) * 10) / 10);
                E.shake(8);
                A.play("hurt");
                api.damage("💣 먹물 방울은 터치해서 없애세요!");
                continue;
              }
              if (b.y > E.VH + 40) bubbles.splice(i, 1);
            }
          }
        },
        draw(ctx) {
          if (mode === "frac") {
            E.drawSkyBackdrop(ctx, "#312e81", "#4c1d95", time, "night");
            // UFO
            ctx.save();
            ctx.font = "54px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🛸", ufo.x, ufo.y);
            E.drawBadgeBox(
              ctx, ufo.x - 75, ufo.y + 34, 150, 36,
              "rgba(15,23,42,0.88)", "#fde047",
              `목표: ${pizza.sent}/${pizza.wantNum} (${pizza.wantNum}/${pizza.targetParts})`, "#fde047", 15
            );
            ctx.restore();

            // 피자 도마
            ctx.beginPath();
            ctx.arc(pizza.x, pizza.y, pizza.r + 18, 0, Math.PI * 2);
            ctx.fillStyle = "#92400e";
            ctx.fill();
            ctx.strokeStyle = "#fde68a";
            ctx.lineWidth = 4;
            ctx.stroke();

            // 피자 조각들
            for (const s of pizza.slices) {
              if (s.sent) continue;
              const mid = (s.a0 + s.a1) / 2;
              const off = pizza.parts > 1 ? 6 : 0;
              ctx.save();
              ctx.translate(s.x + Math.cos(mid) * off, s.y + Math.sin(mid) * off);
              ctx.beginPath();
              if (pizza.parts === 1) {
                ctx.arc(0, 0, pizza.r, 0, Math.PI * 2);
              } else {
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, pizza.r, s.a0, s.a1);
                ctx.closePath();
              }
              ctx.fillStyle = "#fbbf24";
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#b45309";
              ctx.stroke();

              // 치즈/페퍼로니 느낌
              ctx.fillStyle = "#ef4444";
              ctx.beginPath();
              ctx.arc(Math.cos(mid) * pizza.r * 0.52, Math.sin(mid) * pizza.r * 0.52, 10, 0, Math.PI * 2);
              ctx.fill();

              if (pizza.parts > 1) {
                ctx.font = "900 18px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#0f172a";
                ctx.fillText(`1/${pizza.parts}`, Math.cos(mid) * pizza.r * 0.65, Math.sin(mid) * pizza.r * 0.65);
              }
              ctx.restore();
            }

            if (pizza.parts < pizza.targetParts) {
              E.drawBadgeBox(ctx, pizza.x - 115, pizza.y + pizza.r + 32, 230, 38, "rgba(15,23,42,0.88)", "#38bdf8", `피자를 쓱 베어 ${pizza.targetParts}조각으로!`, "#38bdf8", 16);
              if (time < 3.6) E.drawFingerHint(ctx, pizza.x - 110, pizza.y, pizza.x + 110, pizza.y, time);
            }

            for (const f of flies) {
              ctx.font = "34px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🪰", f.x, f.y);
            }
          } else {
            E.drawSkyBackdrop(ctx, "#0f172a", "#1e3a8a", time, "space");
            // 물약 비커
            const bx = beaker.x - beaker.w / 2;
            const by = beaker.y - beaker.h / 2;
            E.roundRect(ctx, bx, by, beaker.w, beaker.h, 22);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fill();

            // 채워진 액체
            const fillH = beaker.h * Math.min(1, beaker.fill);
            if (fillH > 2) {
              ctx.save();
              E.roundRect(ctx, bx + 4, by + beaker.h - fillH, beaker.w - 8, fillH - 4, 16);
              ctx.fillStyle = "rgba(56,189,248,0.82)";
              ctx.fill();
              ctx.restore();
            }

            // 0.1 단위 눈금 + 목표선
            for (let i = 1; i <= 10; i++) {
              const ly = by + beaker.h - (beaker.h * i) / 10;
              const isGoal = Math.abs(i / 10 - beaker.target) < 0.01;
              ctx.strokeStyle = isGoal ? "#fde047" : "rgba(255,255,255,0.45)";
              ctx.lineWidth = isGoal ? 4 : 2;
              ctx.beginPath();
              ctx.moveTo(bx + 10, ly);
              ctx.lineTo(bx + (isGoal ? beaker.w - 10 : 38), ly);
              ctx.stroke();
              if (isGoal) {
                E.drawBadgeBox(ctx, bx + beaker.w + 14, ly - 18, 108, 36, "#16a34a", "#fde047", `목표 ${beaker.target}`, "#fff", 17);
              }
            }
            E.roundRect(ctx, bx, by, beaker.w, beaker.h, 22);
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 4;
            ctx.stroke();
            E.drawBadgeBox(ctx, beaker.x - 65, by + beaker.h + 16, 130, 38, "rgba(15,23,42,0.88)", "#38bdf8", `현재: ${beaker.fill.toFixed(1)}`, "#fff", 18);

            // 떨어지는 물방울 / 먹물
            for (const b of bubbles) {
              if (b.kind === "ink") E.drawBomb(ctx, b.x, b.y, b.r, time);
              else E.drawCuteSlime(ctx, b.x, b.y, b.r, "#38bdf8", { label: `+${b.val}` });
            }
          }

          E.drawSwipeTrail(ctx, trail, "#fde047");
        },
        onPointerDown(x, y) {
          trail.push({ x, y, t: performance.now() });
          if (doneWave) return;
          if (mode === "frac") {
            // 파리 쫓아내기
            for (let i = flies.length - 1; i >= 0; i--) {
              if (E.dist(x, y, flies[i].x, flies[i].y) < flies[i].r + 22) {
                flies.splice(i, 1);
                A.play("slice");
                E.spawnParticles(x, y, "#fde047", 12, 180);
                api.addScore(60, x, y, "파리 컷!");
                return;
              }
            }
            if (pizza.parts >= pizza.targetParts) {
              const s = pizza.slices.find((sl) => !sl.sent && E.dist(x, y, sl.x, sl.y) < pizza.r + 18);
              if (s) draggingSlice = s;
            }
          } else {
            // 소수 물방울 / 먹물 터치
            for (let i = bubbles.length - 1; i >= 0; i--) {
              const b = bubbles[i];
              if (E.dist(x, y, b.x, b.y) <= b.r + 16) {
                bubbles.splice(i, 1);
                if (b.kind === "ink") {
                  A.play("slice");
                  E.spawnParticles(b.x, b.y, "#fde047", 12, 180);
                  api.addScore(50, b.x, b.y, "방어!");
                } else {
                  const next = Math.round((beaker.fill + b.val) * 10) / 10;
                  if (next <= beaker.target + 0.001) {
                    beaker.fill = next;
                    const combo = api.addCombo();
                    A.play("pop", combo);
                    E.spawnParticles(beaker.x, beaker.y, "#38bdf8", 14, 190);
                    api.addScore(100, b.x, b.y, `+${b.val}!`);
                    api.setWave(wave, WAVES.length, beaker.fill / beaker.target);
                    if (Math.abs(beaker.fill - beaker.target) < 0.01) {
                      A.speak(`${beaker.target} 물약 완성!`);
                      finishWave(`🧪 ${beaker.target} 물약 완성!`);
                    }
                  } else {
                    beaker.fill = Math.max(0, Math.round((beaker.fill - 0.1) * 10) / 10);
                    A.play("hurt");
                    E.spawnPopup(beaker.x, beaker.y - 80, "넘쳤어요! -0.1", "#f87171", 20);
                  }
                }
                return;
              }
            }
          }
        },
        onPointerMove(x, y, px, py) {
          trail.push({ x, y, t: performance.now() });
          if (doneWave) return;
          if (mode === "frac") {
            // 스와이프로 피자 자르기!
            if (pizza.parts < pizza.targetParts) {
              const dBefore = E.dist(px, py, pizza.x, pizza.y);
              const dNow = E.dist(x, y, pizza.x, pizza.y);
              if ((dBefore < pizza.r || dNow < pizza.r) && Math.hypot(x - px, y - py) > 12 && !pizza.cutCooldown) {
                pizza.cutCooldown = true;
                setTimeout(() => { pizza.cutCooldown = false; }, 320);
                const nextParts = pizza.parts === 1 ? 2 : pizza.targetParts;
                buildPizzaSlices(nextParts);
                A.play("slice");
                E.spawnParticles(pizza.x, pizza.y, "#fde047", 18, 220);
                E.spawnPopup(pizza.x, pizza.y - 80, `🍕 ${nextParts}조각 변신!`, "#fde047", 24);
              }
            } else if (draggingSlice) {
              draggingSlice.x = x;
              draggingSlice.y = y;
            }
          }
        },
        onPointerUp(x, y) {
          if (mode === "frac" && draggingSlice) {
            if (y < 210) {
              draggingSlice.sent = true;
              pizza.sent += 1;
              const combo = api.addCombo();
              A.play("coin", combo);
              E.spawnParticles(ufo.x, ufo.y + 15, "#4ade80", 16, 210);
              api.addScore(120, ufo.x, ufo.y + 40, `${pizza.sent}/${pizza.targetParts}!`);
              api.setWave(wave, WAVES.length, pizza.sent / pizza.wantNum);
              if (pizza.sent >= pizza.wantNum) {
                A.speak(`${pizza.targetParts}분의 ${pizza.wantNum} 배달 완료!`);
                finishWave(`🛸 ${pizza.wantNum}/${pizza.targetParts} 배달 완료!`);
              }
            } else {
              draggingSlice.x = pizza.x;
              draggingSlice.y = pizza.y;
            }
            draggingSlice = null;
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 10: ⏰ 시계 톱니 점프 & 측정 대포 (측정·시계)
     ------------------------------------------------------------ */
  {
    id: 10,
    icon: "⏰",
    name: "시계·측정 대포",
    desc: "레이저 다리 길이를 쏘고 시계 바늘 타이밍을 맞춰 보스를 멈추세요!",
    tags: ["차지샷·타이밍", "길이·무게·시계"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      let wave = 1;
      let time = 0;
      let doneWave = false;

      // Wave 1: 길이 차지 다리, Wave 2: 시계 톱니 타이밍, Wave 3: 무게추 던지기
      let charging = false;
      let bridgeCm = 0;
      let goalCm = 8;

      let clockMin = 0; // 분 단위
      let goalMin = 180; // 3:00

      let scaleW = 0;
      let goalW = 250;
      let weights = [100, 50, 10];
      let flungW = null;

      const WAVES = [
        { type: "len", goal: 8, title: "화면을 길게 눌러 다리 길이를 8cm에 딱 맞춰 떼세요!" },
        { type: "clock", goal: 210, title: "+30분 / +1시간 버튼을 눌러 시계를 3시 30분에 맞추세요!" },
        { type: "weight", goal: 260, title: "100g · 50g · 10g 추를 위로 던져 260g을 만드세요!" }
      ];

      function setupWave(w) {
        wave = w;
        doneWave = false;
        charging = false;
        bridgeCm = 0;
        goalCm = 8;
        clockMin = 120; // 2:00에서 시작
        goalMin = 210;  // 3:30 목표
        scaleW = 0;
        goalW = 260;
        flungW = null;
        api.setWave(w, WAVES.length, 0);
        api.setMission("측정 액션", WAVES[w - 1].title);
        if (w === 1) A.speak("화면을 꾹 눌러 레이저 다리를 목표 눈금까지 늘려 보세요!", true);
      }

      function passWave(msg) {
        if (doneWave) return;
        doneWave = true;
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnConfetti(34);
        E.spawnPopup(E.VW / 2, 210, msg, "#fde047", 26);
        setTimeout(() => {
          if (wave < WAVES.length) setupWave(wave + 1);
          else api.winStage();
        }, 1050);
      }

      return {
        init() { setupWave(1); },
        update(dt) {
          time += dt;
          if (wave === 1 && charging && !doneWave) {
            bridgeCm = Math.min(14, bridgeCm + dt * 5.2);
            api.setWave(1, 3, Math.min(1, bridgeCm / goalCm));
          }
          if (wave === 3 && flungW) {
            flungW.y += flungW.vy * dt;
            flungW.vy += 450 * dt;
            if (flungW.y < 305 && Math.abs(flungW.x - E.VW / 2) < 130) {
              const next = scaleW + flungW.val;
              if (next <= goalW) {
                scaleW = next;
                A.play("hit");
                E.spawnParticles(E.VW / 2, 290, "#fde047", 14, 200);
                api.addScore(100, E.VW / 2, 250, `+${flungW.val}g`);
                api.setWave(3, 3, scaleW / goalW);
                if (scaleW === goalW) {
                  A.speak("260그램 딱 맞췄어요!");
                  passWave("⚖️ 260g 완벽한 균형!");
                }
              } else {
                scaleW = Math.max(0, scaleW - 50);
                A.play("hurt");
                E.spawnPopup(E.VW / 2, 230, "무거워요! -50g", "#f87171", 20);
              }
              flungW = null;
            } else if (flungW.y > E.VH + 40) {
              flungW = null;
            }
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0369a1", "#bae6fd", time, "day");
          if (wave === 1) {
            E.drawGround(ctx, "#22c55e", "#15803d", 390);
            // 절벽 틈
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(190, 390, 560, 170);

            // 자 눈금 (0 ~ 12cm)
            const ox = 190;
            const pxPerCm = 46;
            for (let cm = 0; cm <= 12; cm++) {
              const gx = ox + cm * pxPerCm;
              const isGoal = cm === goalCm;
              ctx.strokeStyle = isGoal ? "#fde047" : "#fff";
              ctx.lineWidth = isGoal ? 4 : 2;
              ctx.beginPath();
              ctx.moveTo(gx, 390);
              ctx.lineTo(gx, 412);
              ctx.stroke();
              ctx.font = `900 ${isGoal ? 20 : 14}px sans-serif`;
              ctx.textAlign = "center";
              ctx.fillStyle = isGoal ? "#fde047" : "#cbd5e1";
              ctx.fillText(`${cm}`, gx, 430);
              if (isGoal) {
                ctx.font = "34px sans-serif";
                ctx.fillText("🚩", gx, 360);
              }
            }

            // 레이저 다리
            if (bridgeCm > 0) {
              E.roundRect(ctx, ox, 376, bridgeCm * pxPerCm, 18, 8);
              ctx.fillStyle = Math.abs(bridgeCm - goalCm) <= 0.65 ? "#4ade80" : "#38bdf8";
              ctx.fill();
            }
            ctx.font = "46px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🏃", doneWave ? ox + goalCm * pxPerCm : 145, 362);
            E.drawBadgeBox(ctx, E.VW / 2 - 125, 110, 250, 48, "rgba(15,23,42,0.88)", "#fde047", `현재 길이: ${bridgeCm.toFixed(1)} cm / 목표 ${goalCm} cm`, "#fff", 18);
          } else if (wave === 2) {
            // 시계 보스
            const cx = E.VW / 2;
            const cy = 260;
            ctx.beginPath();
            ctx.arc(cx, cy, 138, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#f59e0b";
            ctx.stroke();

            for (let h = 1; h <= 12; h++) {
              const a = (h * Math.PI) / 6 - Math.PI / 2;
              ctx.font = "900 22px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#0f172a";
              ctx.fillText(String(h), cx + Math.cos(a) * 108, cy + Math.sin(a) * 108);
            }
            const hAng = ((clockMin / 60) * Math.PI) / 6 - Math.PI / 2;
            const mAng = ((clockMin % 60) * Math.PI) / 30 - Math.PI / 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 9;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(hAng) * 66, cy + Math.sin(hAng) * 66); ctx.stroke();
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(mAng) * 96, cy + Math.sin(mAng) * 96); ctx.stroke();

            const curH = Math.floor(clockMin / 60) || 12;
            const curM = clockMin % 60;
            E.drawBadgeBox(ctx, cx - 110, 62, 220, 42, "rgba(15,23,42,0.88)", "#fde047", `현재 ${curH}시 ${curM === 0 ? "" : curM + "분"} → 목표 3시 30분`, "#fde047", 17);

            // 터치 톱니 버튼
            E.drawBadgeBox(ctx, cx - 190, 435, 165, 58, "#2563eb", "#93c5fd", "⚙️ +30분 돌리기", "#fff", 18);
            E.drawBadgeBox(ctx, cx + 25, 435, 165, 58, "#16a34a", "#86efac", "⚙️ +1시간 돌리기", "#fff", 18);
          } else {
            E.drawGround(ctx, "#334155", "#0f172a", E.VH - 64);
            // 저울 접시
            E.roundRect(ctx, E.VW / 2 - 125, 290, 250, 24, 10);
            ctx.fillStyle = "#fde047";
            ctx.fill();
            E.drawBadgeBox(ctx, E.VW / 2 - 115, 210, 230, 56, "rgba(15,23,42,0.9)", "#38bdf8", `${scaleW}g / 목표 ${goalW}g`, "#fff", 22);

            // 무게추 발사 버튼들
            weights.forEach((wVal, idx) => {
              const bx = 280 + idx * 200;
              E.drawCuteSlime(ctx, bx, 455, 38, ["#f97316", "#22c55e", "#38bdf8"][idx], { label: `${wVal}g` });
            });
            if (flungW) E.drawCuteSlime(ctx, flungW.x, flungW.y, 30, "#fde047", { label: `${flungW.val}g` });
          }
        },
        onPointerDown(x, y) {
          if (doneWave) return;
          if (wave === 1) {
            charging = true;
            bridgeCm = 0;
          } else if (wave === 2) {
            const cx = E.VW / 2;
            if (y >= 425 && y <= 505) {
              if (x < cx) clockMin = (clockMin + 30) % 720;
              else clockMin = (clockMin + 60) % 720;
              A.play("pop");
              const prog = 1 - Math.abs(clockMin - goalMin) / 180;
              api.setWave(2, 3, E.clamp(prog, 0, 1));
              if (clockMin === goalMin) {
                A.speak("3시 30분 정확해요!");
                passWave("⏰ 3시 30분 시계 정지!");
              }
            }
          } else if (wave === 3 && !flungW) {
            weights.forEach((wVal, idx) => {
              const bx = 280 + idx * 200;
              if (E.dist(x, y, bx, 455) < 48) {
                flungW = { val: wVal, x: bx, y: 430, vy: -540 };
                A.play("throw");
              }
            });
          }
        },
        onPointerUp() {
          if (wave === 1 && charging && !doneWave) {
            charging = false;
            if (Math.abs(bridgeCm - goalCm) <= 0.7) {
              A.speak("8센티미터 다리 완성!");
              passWave("🌉 8cm 다리 건너기 성공!");
            } else {
              A.play("hurt");
              E.spawnPopup(190 + bridgeCm * 46, 330, `${bridgeCm.toFixed(1)}cm! 다시 맞춰요!`, "#f87171", 20);
              bridgeCm = 0;
            }
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 11: 🏦 화폐 대모험 & 환전 슬링샷 (화폐 생김새 · 동전↔지폐 교환 · 거스름돈)
     ------------------------------------------------------------ */
  {
    id: 11,
    icon: "🏦",
    name: "화폐·환전 대모험",
    desc: "동전과 지폐 생김새를 보고 쏘며, 작은 동전을 모아 큰 돈으로 환전·거스름돈을 맞히세요!",
    tags: ["사격·환전새총·점프", "화폐 생김새·교환"],
    useTouchPad: true,
    padLabels: ["◀", "▶", "⬆️ 점프!"],
    create(api) {
      const { E, A } = api;
      const floorY = E.VH - 74;
      let wave = 1;
      let time = 0;
      let doneWave = false;

      // Wave 1: 화폐 도감 슈터 (생김새·색깔·그림 보고 쏘기 + 폭탄 커트)
      const CLUES = [
        { val: 10, label: "구리빛 다보탑 10원!" },
        { val: 50, label: "벼 이삭 은색 50원!" },
        { val: 100, label: "이순신 장군 100원!" },
        { val: 500, label: "날아가는 학 500원!" },
        { val: 1000, label: "파란색 1,000원 지폐!" },
        { val: 5000, label: "주황색 5,000원 지폐!" },
        { val: 10000, label: "초록색 10,000원 지폐!" }
      ];
      let clueIdx = 0;
      let clueOrder = [];
      let floatMoneys = [];
      let spawnMoneyT = 0.2;

      // Wave 2: 동전↔지폐 자동 합체 진화 대시 (10->50->100->500->1000원!)
      const hero = { x: E.VW / 2, y: floorY, vy: 0, grounded: true, invuln: 0 };
      let pocket = 0;
      let pocketGoal = 1000;
      let drops = [];
      let dropT = 0.4;
      let dragX = null;

      // Wave 3: 환전 새총 대결 (상인 500원/1000원 <-> 내 작은 돈 여러 개)
      const sling = { x: 150, y: 380, pulling: false, px: 150, py: 380 };
      let merchantGoal = 500;
      let panCoins = [];
      let panSum = 0;
      let ammoCoin = 100;
      let proj = null;
      let bats = [];
      let exchangeStep = 1;

      // Wave 4: 거스름돈 블래스터
      let payAmt = 1000;
      let itemPrice = 700;
      let changeNeed = 300;
      let changeGiven = 0;
      let changeBtns = [100, 500, 1000];
      let flungChange = null;

      const WAVES = [
        { type: "id", title: "상점 부엉이가 찾는 화폐의 생김새를 보고 맞혀 쏘세요! (💣 폭탄은 피하기)" },
        { type: "evolve", title: "동전을 잡아 10×5→50원, 100×5→500원, 500×2→1,000원 파란 지폐로 진화!" },
        { type: "exchange", title: "새총으로 동전을 던져 상인의 큰 돈과 똑같이 환전하세요!" },
        { type: "change", title: "손님이 낸 돈에서 물건 값을 뺀 거스름돈을 쏴서 보내세요!" }
      ];

      function breakdownMoney(amount) {
        const denoms = [10000, 5000, 1000, 500, 100, 50, 10];
        let rem = amount;
        const out = [];
        for (const d of denoms) {
          const c = Math.floor(rem / d);
          if (c > 0) {
            out.push({ val: d, count: c });
            rem -= c * d;
          }
        }
        return out;
      }

      function spawnClueWave() {
        floatMoneys = [];
        const target = clueOrder[clueIdx];
        const allVals = [10, 50, 100, 500, 1000, 5000, 10000];
        const decoys = E.clamp ? allVals.filter((v) => v !== target.val) : [];
        const picked = [target.val, decoys[0], decoys[2], decoys[4], "bomb"];
        picked.forEach((v, i) => {
          floatMoneys.push({
            val: v,
            x: 130 + i * 175,
            y: E.rand(190, 390),
            vx: E.rand(-75, 75),
            vy: E.rand(-55, 55),
            r: v === "bomb" ? 26 : (v >= 1000 ? 52 : 38)
          });
        });
      }

      function setupExchangeRound(step) {
        exchangeStep = step;
        merchantGoal = step === 1 ? 500 : 1000;
        ammoCoin = step === 1 ? 100 : 500;
        panCoins = [];
        panSum = 0;
        proj = null;
        bats = [{ x: 455, y: 200, vy: 115, r: 24 }];
      }

      function setupWave(w) {
        wave = w;
        doneWave = false;
        drops = [];
        floatMoneys = [];
        if (w === 1) {
          clueOrder = [CLUES[0], CLUES[3], CLUES[4], CLUES[6]];
          clueIdx = 0;
          spawnClueWave();
        } else if (w === 2) {
          pocket = 0;
          pocketGoal = 1000;
          dropT = 0.25;
        } else if (w === 3) {
          setupExchangeRound(1);
        } else {
          payAmt = 1000;
          itemPrice = 700;
          changeNeed = 300;
          changeGiven = 0;
          flungChange = null;
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission(["화폐 생김새", "동전 합체진화", "환전 새총", "거스름돈"][w - 1], WAVES[w - 1].title);
        if (w === 1) A.speak("부엉이가 찾는 동전이나 지폐의 색깔과 그림을 보고 맞혀 보세요!", true);
      }

      function passWave(msg) {
        if (doneWave) return;
        doneWave = true;
        const combo = api.addCombo();
        A.play("chaching", combo);
        E.spawnConfetti(42);
        E.spawnPopup(E.VW / 2, 220, msg, "#fde047", 27);
        setTimeout(() => {
          if (wave < WAVES.length) setupWave(wave + 1);
          else api.winStage();
        }, 1150);
      }

      function jump() {
        if (wave === 2 && hero.grounded) {
          hero.vy = -580;
          hero.grounded = false;
          A.play("jump");
        }
      }

      return {
        init() { setupWave(1); },
        onActionPress() {
          if (wave === 2) jump();
        },
        update(dt, input) {
          time += dt;
          if (wave === 1) {
            for (const m of floatMoneys) {
              m.x += m.vx * dt;
              m.y += m.vy * dt;
              if (m.x < 75 || m.x > E.VW - 75) m.vx *= -1;
              if (m.y < 165 || m.y > 460) m.vy *= -1;
            }
            return;
          }

          if (wave === 2) {
            if (hero.invuln > 0) hero.invuln = Math.max(0, hero.invuln - dt);
            let mv = 0;
            if (input.left) mv -= 1;
            if (input.right) mv += 1;
            if (dragX !== null && Math.abs(dragX - hero.x) > 12) mv = Math.sign(dragX - hero.x);
            hero.x = E.clamp(hero.x + mv * 395 * dt, 50, E.VW - 50);
            if (input.jumpJustPressed) jump();

            hero.vy += 1260 * dt;
            hero.y += hero.vy * dt;
            if (hero.y >= floorY) { hero.y = floorY; hero.vy = 0; hero.grounded = true; }

            if (!doneWave) {
              dropT -= dt;
              if (dropT <= 0) {
                const isGhost = Math.random() < 0.22;
                const val = pocket < 100 ? E.pick([10, 10, 50]) : pocket < 500 ? E.pick([50, 100, 100]) : E.pick([100, 500]);
                drops.push({ kind: isGhost ? "ghost" : "coin", val, x: E.rand(70, E.VW - 70), y: -32, vy: E.rand(125, 180), r: 28 });
                dropT = 0.56;
              }
            }

            for (let i = drops.length - 1; i >= 0; i--) {
              const d = drops[i];
              d.y += d.vy * dt;
              if (E.dist(hero.x, hero.y, d.x, d.y) < 58) {
                drops.splice(i, 1);
                if (d.kind === "ghost") {
                  if (hero.invuln <= 0 && !doneWave) {
                    hero.invuln = 1.1;
                    pocket = Math.max(0, pocket - 50);
                    E.shake(9);
                    A.play("hurt");
                    api.damage("👻 세금 유령을 피해 점프하세요!");
                  }
                } else if (!doneWave) {
                  const prev = pocket;
                  pocket = Math.min(pocketGoal, pocket + d.val);
                  const crossed1000 = prev < 1000 && pocket >= 1000;
                  const crossed500 = Math.floor(prev / 500) < Math.floor(pocket / 500);
                  const crossed100 = Math.floor(prev / 100) < Math.floor(pocket / 100);
                  const crossed50 = Math.floor(prev / 50) < Math.floor(pocket / 50);

                  if (crossed1000) {
                    A.play("chaching", 4);
                    E.spawnParticles(hero.x, hero.y - 30, "#38bdf8", 28, 260);
                    E.spawnPopup(hero.x, hero.y - 68, "💵 500원×2 → 1,000원 지폐 변신!", "#60a5fa", 24);
                  } else if (crossed500) {
                    A.play("transform", 3);
                    E.spawnParticles(hero.x, hero.y - 25, "#fde047", 20, 230);
                    E.spawnPopup(hero.x, hero.y - 60, "🪙 100원×5 → 500원 학 변신!", "#fde047", 22);
                  } else if (crossed100) {
                    A.play("merge", 2);
                    E.spawnPopup(hero.x, hero.y - 52, "🪙 50원×2 → 100원 이순신!", "#e2e8f0", 20);
                  } else if (crossed50) {
                    A.play("merge", 1);
                    E.spawnPopup(hero.x, hero.y - 50, "🪙 10원×5 → 50원 벼이삭!", "#cbd5e1", 19);
                  } else {
                    A.play("coin");
                  }
                  api.addScore(90, hero.x, hero.y - 30);
                  api.setWave(2, WAVES.length, pocket / pocketGoal);
                  if (pocket >= pocketGoal) {
                    A.speak("동전이 모여 파란색 천원 지폐로 변신했어요!");
                    passWave("💵 1,000원 파란 지폐 진화 완료!");
                  }
                }
                continue;
              }
              if (d.y > E.VH + 40) drops.splice(i, 1);
            }
            return;
          }

          if (wave === 3) {
            for (const b of bats) {
              b.y += b.vy * dt;
              if (b.y < 105 || b.y > 380) b.vy *= -1;
            }
            if (proj) {
              proj.vy += 650 * dt;
              proj.x += proj.vx * dt;
              proj.y += proj.vy * dt;
              for (const b of bats) {
                if (E.dist(proj.x, proj.y, b.x, b.y) < proj.r + b.r) {
                  E.spawnParticles(proj.x, proj.y, "#ef4444", 16, 220);
                  A.play("hurt");
                  E.shake(8);
                  proj = null;
                  api.damage("🦇 박쥐를 피해서 환전 접시에 던지세요!");
                  break;
                }
              }
              if (proj && Math.abs(proj.x - 540) < 125 && Math.abs(proj.y - 345) < 62 && proj.vy > 0) {
                panCoins.push(proj.val);
                panSum += proj.val;
                A.play("coin", panCoins.length);
                E.spawnParticles(540, 325, "#fde047", 14, 190);
                E.spawnPopup(540, 285, `+${proj.val}원 (${panSum}원)`, "#fde047", 21);
                proj = null;
                api.setWave(3, WAVES.length, Math.min(1, panSum / merchantGoal));
                if (panSum === merchantGoal) {
                  A.play("chaching", 3);
                  if (exchangeStep === 1) {
                    E.spawnPopup(620, 220, "🔄 100원×5 = 500원 환전 성공!", "#4ade80", 24);
                    A.speak("100원 다섯 개가 500원 한 개와 똑같아요!");
                    setTimeout(() => setupExchangeRound(2), 950);
                  } else {
                    A.speak("500원 두 개가 천원 지폐 한 장과 똑같아요!");
                    passWave("🏦 동전 ↔ 지폐 환전 마스터!");
                  }
                } else if (panSum > merchantGoal) {
                  A.play("hurt");
                  E.spawnPopup(540, 260, "너무 많아요! 접시 탭해서 빼기", "#f87171", 19);
                }
              } else if (proj && (proj.y > E.VH + 40 || proj.x > E.VW + 40)) {
                proj = null;
              }
            }
            return;
          }

          if (wave === 4 && flungChange) {
            flungChange.y += flungChange.vy * dt;
            if (flungChange.y < 235) {
              const next = changeGiven + flungChange.val;
              if (next <= changeNeed) {
                changeGiven = next;
                A.play("coin", api.addCombo());
                E.spawnParticles(E.VW / 2, 200, "#fde047", 16, 200);
                api.addScore(120, E.VW / 2, 230, `+${flungChange.val}원!`);
                api.setWave(4, WAVES.length, changeGiven / changeNeed);
                if (changeGiven === changeNeed) {
                  if (payAmt === 1000) {
                    A.play("chaching");
                    E.spawnPopup(E.VW / 2, 165, "🚀 300원 거스름돈 완료! 다음 손님!", "#4ade80", 24);
                    payAmt = 5000;
                    itemPrice = 3500;
                    changeNeed = 1500;
                    changeGiven = 0;
                  } else {
                    A.speak("거스름돈까지 완벽하게 계산했어요!");
                    passWave("🛒 로켓 마켓 거스름돈 마스터!");
                  }
                }
              } else {
                changeGiven = 0;
                A.play("hurt");
                E.spawnPopup(E.VW / 2, 220, "거스름돈이 넘쳤어요! 다시!", "#f87171", 20);
              }
              flungChange = null;
            }
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#0f766e", "#134e4a", time, "day");
          if (wave === 1) {
            const target = clueOrder[clueIdx];
            ctx.font = "48px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🦉", E.VW / 2, 82);
            E.drawBadgeBox(ctx, E.VW / 2 - 195, 112, 390, 44, "rgba(15,23,42,0.9)", "#fde047", `찾는 화폐: ${target.label} (${clueIdx + 1}/${clueOrder.length})`, "#fde047", 19);

            for (const m of floatMoneys) {
              if (m.val === "bomb") E.drawBomb(ctx, m.x, m.y, m.r, time);
              else E.drawKoreanMoney(ctx, m.val, m.x, m.y, 1.12);
            }
            return;
          }

          if (wave === 2) {
            E.drawGround(ctx, "#f59e0b", "#b45309", floorY + 26);
            // 실시간 화폐 교환 진화 표시줄
            const parts = breakdownMoney(pocket);
            E.roundRect(ctx, 130, 56, E.VW - 260, 74, 18);
            ctx.fillStyle = "rgba(15,23,42,0.84)";
            ctx.fill();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3;
            ctx.stroke();

            E.drawBadgeBox(ctx, 146, 68, 175, 48, "#1e293b", "#38bdf8", `${pocket}원 / 1,000원`, "#fde047", 18);
            let bx = 365;
            for (const pt of parts) {
              for (let k = 0; k < Math.min(4, pt.count); k++) {
                E.drawKoreanMoney(ctx, pt.val, bx, 92, 0.56);
                bx += pt.val >= 1000 ? 68 : 42;
              }
            }

            for (const d of drops) {
              if (d.kind === "ghost") {
                ctx.font = "40px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("👻", d.x, d.y);
              } else {
                E.drawKoreanMoney(ctx, d.val, d.x, d.y, 0.95);
              }
            }

            ctx.save();
            if (hero.invuln > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.45;
            E.drawCuteSlime(ctx, hero.x, hero.y, 34, "#f59e0b", { label: "🐷" });
            ctx.restore();
            return;
          }

          if (wave === 3) {
            E.drawGround(ctx, "#334155", "#0f172a", E.VH - 64);
            // 상인의 목표 화폐
            E.drawBadgeBox(ctx, 710, 125, 195, 42, "rgba(15,23,42,0.9)", "#4ade80", `상인 돈: ${merchantGoal}원`, "#4ade80", 19);
            E.drawKoreanMoney(ctx, merchantGoal, 808, 225, 1.35, { glow: "#fde047" });

            // 내 환전 접시
            E.roundRect(ctx, 425, 340, 230, 26, 12);
            ctx.fillStyle = panSum === merchantGoal ? "#4ade80" : "#fde047";
            ctx.fill();
            E.drawBadgeBox(ctx, 445, 376, 190, 38, "rgba(15,23,42,0.9)", "#38bdf8", `내 접시: ${panSum}원 (탭=빼기)`, "#fff", 16);
            panCoins.forEach((cVal, idx) => {
              E.drawKoreanMoney(ctx, cVal, 455 + (idx % 4) * 54, 308 - Math.floor(idx / 4) * 44, 0.72);
            });

            // 박쥐 방해꾼
            for (const b of bats) {
              ctx.font = "36px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🦇", b.x, b.y);
            }

            // 새총
            const bx = sling.pulling ? sling.px : sling.x;
            const by = sling.pulling ? sling.py : sling.y;
            ctx.strokeStyle = "#a16207";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(sling.x, sling.y + 115);
            ctx.lineTo(sling.x, sling.y + 25);
            ctx.lineTo(sling.x - 20, sling.y);
            ctx.moveTo(sling.x, sling.y + 25);
            ctx.lineTo(sling.x + 20, sling.y);
            ctx.stroke();
            if (sling.pulling) {
              E.drawSlingshotArc(ctx, sling.px, sling.py, (sling.x - sling.px) * 7.2, (sling.y - sling.py) * 7.2, 650, "#fde047");
            }
            if (!proj) E.drawKoreanMoney(ctx, ammoCoin, bx, by, 0.85);
            else E.drawKoreanMoney(ctx, proj.val, proj.x, proj.y, 0.85);
            return;
          }

          // Wave 4: 거스름돈 블래스터
          E.drawGround(ctx, "#1e293b", "#0f172a", E.VH - 64);
          E.roundRect(ctx, E.VW / 2 - 210, 82, 420, 145, 22);
          ctx.fillStyle = "rgba(15,23,42,0.88)";
          ctx.fill();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 3;
          ctx.stroke();

          E.drawKoreanMoney(ctx, payAmt, E.VW / 2 - 125, 145, 0.92);
          ctx.font = "900 21px sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.fillText(`낸 돈 ${payAmt}원 - 물건 ${itemPrice}원`, E.VW / 2 + 52, 125);
          ctx.fillStyle = "#fde047";
          ctx.fillText(`거스름돈: ${changeGiven} / ${changeNeed}원`, E.VW / 2 + 52, 170);

          changeBtns.forEach((val, i) => {
            const x = 260 + i * 220;
            E.drawKoreanMoney(ctx, val, x, 435, 1.1, { glow: "rgba(56,189,248,0.45)" });
          });
          if (flungChange) E.drawKoreanMoney(ctx, flungChange.val, flungChange.x, flungChange.y, 1.0);
        },
        onPointerDown(x, y) {
          if (doneWave) return;
          if (wave === 1) {
            const target = clueOrder[clueIdx];
            for (let i = floatMoneys.length - 1; i >= 0; i--) {
              const m = floatMoneys[i];
              if (E.dist(x, y, m.x, m.y) <= m.r + 14) {
                if (m.val === "bomb") {
                  floatMoneys.splice(i, 1);
                  A.play("slice");
                  E.spawnParticles(m.x, m.y, "#fde047", 14, 210);
                  api.addScore(60, m.x, m.y, "💣 컷!");
                } else if (m.val === target.val) {
                  A.play("chaching", api.addCombo());
                  E.spawnParticles(m.x, m.y, "#fde047", 22, 240);
                  api.addScore(150, m.x, m.y, `✨ ${E.MONEY_META[m.val].name}!`);
                  clueIdx += 1;
                  api.setWave(1, WAVES.length, clueIdx / clueOrder.length);
                  if (clueIdx >= clueOrder.length) {
                    A.speak("모든 한국 돈의 생김새를 다 맞혔어요!");
                    passWave("🏅 한국 화폐 도감 마스터!");
                  } else {
                    spawnClueWave();
                  }
                } else {
                  A.play("hurt");
                  E.spawnPopup(m.x, m.y - 30, "다른 돈이에요!", "#f87171", 19);
                }
                return;
              }
            }
            return;
          }
          if (wave === 2) {
            if (y < floorY - 55) jump();
            else dragX = x;
            return;
          }
          if (wave === 3) {
            if (panCoins.length > 0 && Math.abs(x - 540) < 120 && Math.abs(y - 335) < 65) {
              const popped = panCoins.pop();
              panSum -= popped;
              A.play("pop");
              return;
            }
            if (!proj && E.dist(x, y, sling.x, sling.y) < 110) {
              sling.pulling = true;
              sling.px = x;
              sling.py = y;
            }
            return;
          }
          if (wave === 4 && !flungChange) {
            changeBtns.forEach((val, i) => {
              const bx = 260 + i * 220;
              if (E.dist(x, y, bx, 435) < 62) {
                flungChange = { val, x: bx, y: 410, vy: -560 };
                A.play("throw");
              }
            });
          }
        },
        onPointerMove(x, y) {
          if (wave === 2 && dragX !== null) dragX = x;
          if (wave === 3 && sling.pulling) {
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
          }
        },
        onPointerUp() {
          dragX = null;
          if (wave === 3 && sling.pulling) {
            sling.pulling = false;
            const vx = (sling.x - sling.px) * 7.2;
            const vy = (sling.y - sling.py) * 7.2;
            if (Math.hypot(vx, vy) > 140) {
              proj = { x: sling.px, y: sling.py, vx, vy, r: 28, val: ammoCoin };
              A.play("throw");
            }
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 12: 🔷 도형 포탈 & 무늬 기차 (도형 회전·슬라이스·규칙)
     ------------------------------------------------------------ */
  {
    id: 12,
    icon: "🔷",
    name: "도형 포탈·무늬 기차",
    desc: "도형을 회전해 포탈에 던지고, 네모를 잘라 세모 2개로 만들어 기차를 완성하세요!",
    tags: ["회전·던지기·베기", "도형·반복 규칙"],
    useTouchPad: false,
    create(api) {
      const { E, A } = api;
      const SHAPES = [
        { id: "tri", icon: "▲", name: "세모", color: "#f97316" },
        { id: "sq", icon: "■", name: "네모", color: "#38bdf8" },
        { id: "cir", icon: "●", name: "동그라미", color: "#22c55e" }
      ];
      let wave = 1;
      let time = 0;
      let doneWave = false;
      let trail = [];

      let portalSlots = [];
      let ammoShape = { x: E.VW / 2, y: 445, shapeIdx: 0, flying: false, vx: 0, vy: 0 };

      // Wave 2: 무늬 기차
      let trainX = 0;
      let trainPattern = [0, 2, 0, 2]; // ▲ ● ▲ ● ? -> ▲(0)

      // Wave 3: 도형 자르기 (네모 -> 세모 2개!)
      let cutSquare = { x: E.VW / 2, y: 345, split: false, tris: [] };
      let locks = [
        { x: 300, y: 145, filled: false },
        { x: 660, y: 145, filled: false }
      ];
      let draggingTri = null;

      const WAVES = [
        { title: "도형을 탭해 모양을 바꾸고 맞는 회전 포탈로 던지세요!" },
        { title: "무늬 기차(▲ ● ▲ ● ?)의 빈 칸에 들어갈 도형을 던지세요!" },
        { title: "네모(■)를 스와이프로 베어 세모(▲) 2개로 나눈 뒤 양쪽 자물쇠에 넣으세요!" }
      ];

      function setupWave(w) {
        wave = w;
        doneWave = false;
        ammoShape = { x: E.VW / 2, y: 445, shapeIdx: 0, flying: false, vx: 0, vy: 0 };
        if (w === 1) {
          portalSlots = [
            { x: 240, y: 155, want: 0, filled: false },
            { x: 480, y: 155, want: 1, filled: false },
            { x: 720, y: 155, want: 2, filled: false }
          ];
        } else if (w === 2) {
          trainX = 160;
          trainPattern = [0, 2, 0, 2];
          ammoShape.shapeIdx = 1;
        } else {
          cutSquare = { x: E.VW / 2, y: 345, split: false, tris: [] };
          locks = [
            { x: 300, y: 145, filled: false },
            { x: 660, y: 145, filled: false }
          ];
        }
        api.setWave(w, WAVES.length, 0);
        api.setMission("도형·규칙", WAVES[w - 1].title);
        if (w === 1) A.speak("도형을 눌러 모양을 바꾼 뒤 같은 포탈로 던져 보세요!", true);
      }

      function passWave(msg) {
        if (doneWave) return;
        doneWave = true;
        const combo = api.addCombo();
        A.play("transform", combo);
        E.spawnConfetti(36);
        E.spawnPopup(E.VW / 2, 220, msg, "#fde047", 26);
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

          if (wave <= 2 && ammoShape.flying) {
            ammoShape.x += ammoShape.vx * dt;
            ammoShape.y += ammoShape.vy * dt;
            if (wave === 1) {
              for (const s of portalSlots) {
                if (!s.filled && E.dist(ammoShape.x, ammoShape.y, s.x, s.y) < 58) {
                  if (ammoShape.shapeIdx === s.want) {
                    s.filled = true;
                    A.play("coin", 2);
                    E.spawnParticles(s.x, s.y, SHAPES[s.want].color, 18, 220);
                    const doneCnt = portalSlots.filter((p) => p.filled).length;
                    api.setWave(1, 3, doneCnt / 3);
                    api.addScore(150, s.x, s.y + 40, "포탈 장착!");
                    if (doneCnt >= 3) passWave("🔷 도형 포탈 완성!");
                  } else {
                    A.play("hurt");
                    E.spawnPopup(s.x, s.y + 45, "모양이 달라요!", "#f87171", 19);
                  }
                  ammoShape = { x: E.VW / 2, y: 445, shapeIdx: (ammoShape.shapeIdx + 1) % 3, flying: false, vx: 0, vy: 0 };
                  break;
                }
              }
            } else if (wave === 2) {
              const slotX = 720;
              const slotY = 200;
              if (E.dist(ammoShape.x, ammoShape.y, slotX, slotY) < 62) {
                if (ammoShape.shapeIdx === 0) {
                  api.setWave(2, 3, 1);
                  api.addScore(200, slotX, slotY, "🚂 규칙 완성!");
                  A.speak("세모 동그라미 세모 동그라미, 다음은 세모!");
                  passWave("🚂 무늬 기차 출발!");
                } else {
                  A.play("hurt");
                  E.spawnPopup(slotX, slotY + 45, "규칙을 다시 봐요!", "#f87171", 19);
                }
                ammoShape = { x: E.VW / 2, y: 445, shapeIdx: ammoShape.shapeIdx, flying: false, vx: 0, vy: 0 };
              }
            }
            if (ammoShape.flying && (ammoShape.y < -40 || ammoShape.x < -40 || ammoShape.x > E.VW + 40)) {
              ammoShape = { x: E.VW / 2, y: 445, shapeIdx: ammoShape.shapeIdx, flying: false, vx: 0, vy: 0 };
            }
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#3b0764", "#1e1b4b", time, "night");

          if (wave === 1) {
            for (const s of portalSlots) {
              const sh = SHAPES[s.want];
              ctx.beginPath();
              ctx.arc(s.x, s.y, 54, 0, Math.PI * 2);
              ctx.fillStyle = s.filled ? sh.color : "rgba(255,255,255,0.1)";
              ctx.fill();
              ctx.lineWidth = 5;
              ctx.strokeStyle = sh.color;
              ctx.stroke();
              ctx.font = "48px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = s.filled ? "#fff" : sh.color;
              ctx.fillText(sh.icon, s.x, s.y);
            }
            const cur = SHAPES[ammoShape.shapeIdx];
            E.drawCuteSlime(ctx, ammoShape.x, ammoShape.y, 40, cur.color, { label: cur.icon });
            E.drawBadgeBox(ctx, E.VW / 2 - 145, 500, 290, 36, "rgba(15,23,42,0.88)", "#fde047", "도형 탭=모양 변경 · 위로 던지기!", "#fde047", 15);
          } else if (wave === 2) {
            E.drawGround(ctx, "#475569", "#1e293b", 252);
            trainPattern.forEach((sIdx, i) => {
              const cx = 200 + i * 130;
              const sh = SHAPES[sIdx];
              E.roundRect(ctx, cx - 48, 152, 96, 92, 16);
              ctx.fillStyle = "#1e293b";
              ctx.fill();
              ctx.strokeStyle = sh.color;
              ctx.lineWidth = 4;
              ctx.stroke();
              ctx.font = "44px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = sh.color;
              ctx.fillText(sh.icon, cx, 198);
            });
            // 빈 칸 (?)
            E.roundRect(ctx, 672, 152, 96, 92, 16);
            ctx.fillStyle = "rgba(253,224,71,0.22)";
            ctx.fill();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.font = "900 36px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fde047";
            ctx.fillText("?", 720, 198);

            const cur = SHAPES[ammoShape.shapeIdx];
            E.drawCuteSlime(ctx, ammoShape.x, ammoShape.y, 40, cur.color, { label: cur.icon });
            E.drawBadgeBox(ctx, E.VW / 2 - 150, 500, 300, 36, "rgba(15,23,42,0.88)", "#fde047", "도형 탭=모양 변경 · ? 칸으로 던지기!", "#fde047", 15);
          } else {
            for (const lk of locks) {
              ctx.beginPath();
              ctx.arc(lk.x, lk.y, 52, 0, Math.PI * 2);
              ctx.fillStyle = lk.filled ? "#f97316" : "rgba(255,255,255,0.12)";
              ctx.fill();
              ctx.strokeStyle = "#f97316";
              ctx.lineWidth = 4;
              ctx.stroke();
              ctx.font = "48px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = lk.filled ? "#fff" : "#f97316";
              ctx.fillText("▲", lk.x, lk.y);
            }

            if (!cutSquare.split) {
              E.roundRect(ctx, cutSquare.x - 66, cutSquare.y - 66, 132, 132, 16);
              ctx.fillStyle = "#38bdf8";
              ctx.fill();
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = 4;
              ctx.stroke();
              ctx.font = "900 26px sans-serif";
              ctx.textAlign = "center";
              ctx.fillStyle = "#fff";
              ctx.fillText("✂️ 대각선 베기!", cutSquare.x, cutSquare.y + 100);
              if (time < 3.6) E.drawFingerHint(ctx, cutSquare.x - 75, cutSquare.y - 75, cutSquare.x + 75, cutSquare.y + 75, time);
            } else {
              for (const t of cutSquare.tris) {
                if (t.used) continue;
                E.drawCuteSlime(ctx, t.x, t.y, 44, "#f97316", { label: "▲" });
              }
            }
          }

          E.drawSwipeTrail(ctx, trail, "#fde047");
        },
        onPointerDown(x, y) {
          trail.push({ x, y, t: performance.now() });
          if (doneWave) return;
          if (wave <= 2) {
            if (!ammoShape.flying && E.dist(x, y, ammoShape.x, ammoShape.y) < 58) {
              ammoShape.dragging = true;
            } else if (!ammoShape.flying && y < 270) {
              const ang = Math.atan2(y - ammoShape.y, x - ammoShape.x);
              ammoShape.vx = Math.cos(ang) * 650;
              ammoShape.vy = Math.sin(ang) * 650;
              ammoShape.flying = true;
              A.play("throw");
            }
          } else if (cutSquare.split) {
            draggingTri = cutSquare.tris.find((t) => !t.used && E.dist(x, y, t.x, t.y) < 52) || null;
          }
        },
        onPointerMove(x, y, px, py) {
          trail.push({ x, y, t: performance.now() });
          if (doneWave) return;
          if (wave <= 2 && ammoShape.dragging) {
            ammoShape.vx = (x - px) * 28;
            ammoShape.vy = (y - py) * 28;
            ammoShape.x = x;
            ammoShape.y = y;
          } else if (wave === 3) {
            if (!cutSquare.split && E.dist(x, y, cutSquare.x, cutSquare.y) < 82 && Math.hypot(x - px, y - py) > 12) {
              cutSquare.split = true;
              cutSquare.tris = [
                { x: cutSquare.x - 65, y: cutSquare.y, used: false },
                { x: cutSquare.x + 65, y: cutSquare.y, used: false }
              ];
              A.play("slice");
              E.spawnParticles(cutSquare.x, cutSquare.y, "#fde047", 20, 220);
              E.spawnPopup(cutSquare.x, cutSquare.y - 70, "■ → ▲ + ▲ 변신!", "#fde047", 24);
            } else if (draggingTri) {
              draggingTri.x = x;
              draggingTri.y = y;
            }
          }
        },
        onPointerUp() {
          if (wave <= 2 && ammoShape.dragging) {
            ammoShape.dragging = false;
            if (Math.hypot(ammoShape.vx, ammoShape.vy) > 150 || ammoShape.y < 380) {
              if (ammoShape.vy > -120) ammoShape.vy = -520;
              ammoShape.flying = true;
              A.play("throw");
            } else {
              ammoShape.x = E.VW / 2;
              ammoShape.y = 445;
              ammoShape.shapeIdx = (ammoShape.shapeIdx + 1) % 3;
              A.play("pop");
            }
          } else if (wave === 3 && draggingTri) {
            for (const lk of locks) {
              if (!lk.filled && E.dist(draggingTri.x, draggingTri.y, lk.x, lk.y) < 62) {
                lk.filled = true;
                draggingTri.used = true;
                A.play("coin", 2);
                E.spawnParticles(lk.x, lk.y, "#f97316", 16, 200);
                const cnt = locks.filter((l) => l.filled).length;
                api.setWave(3, 3, cnt / 2);
                if (cnt >= 2) {
                  A.speak("네모를 잘라 세모 두 개를 완성했어요!");
                  passWave("✂️ 도형 분할 마스터!");
                }
                break;
              }
            }
            draggingTri = null;
          }
        }
      };
    }
  },

  /* ------------------------------------------------------------
     STAGE 13: 👑 수학 마왕성 최종 보스전! (그래프 타워·올스타)
     ------------------------------------------------------------ */
  {
    id: 13,
    icon: "👑",
    name: "마왕성 최종 보스전",
    desc: "그래프 대포로 성벽을 부수고 마왕의 숫자 방패를 맞혀 물리치세요!",
    tags: ["보스전·대포", "그래프·올스타"],
    useTouchPad: true,
    padLabels: ["◀", "▶", "⚡ 점프!"],
    create(api) {
      const { E, A } = api;
      const floorY = E.VH - 74;
      let wave = 1;
      let time = 0;
      let doneWave = false;

      // Wave 1: 그림 그래프 타워 맞추기
      const cols = [
        { emoji: "🍎", color: "#ef4444", cur: 1, goal: 4, x: 260 },
        { emoji: "🍌", color: "#eab308", cur: 1, goal: 2, x: 480 },
        { emoji: "🍇", color: "#a855f7", cur: 1, goal: 5, x: 700 }
      ];

      // Wave 2: 최종 보스전
      const hero = { x: E.VW / 2, y: floorY, vy: 0, grounded: true, invuln: 0 };
      const boss = { x: E.VW / 2, y: 115, hp: 4, maxHp: 4, flash: 0 };
      const QUESTIONS = [
        { q: "6 + ? = 10", ans: 4, opts: [3, 4, 5] },
        { q: "3 × 4 = ?", ans: 12, opts: [9, 12, 14] },
        { q: "10 - 3 = ?", ans: 7, opts: [6, 7, 8] },
        { q: "5 + 5 = ?", ans: 10, opts: [8, 10, 12] }
      ];
      let qIdx = 0;
      let orbs = [];
      let hazards = [];
      let hazT = 1.2;
      let dragX = null;

      function setupBossQuestion() {
        const curQ = QUESTIONS[qIdx % QUESTIONS.length];
        orbs = curQ.opts.map((val, i) => ({
          val,
          x: 240 + i * 240,
          y: 310,
          r: 36,
          ok: val === curQ.ans
        }));
      }

      function setupWave(w) {
        wave = w;
        doneWave = false;
        hazards = [];
        if (w === 1) {
          cols[0].cur = 1;
          cols[1].cur = 1;
          cols[2].cur = 1;
          api.setMission("그래프 타워", "과일을 눌러 막대 그래프를 목표(🍎4, 🍌2, 🍇5) 높이로 쌓으세요!");
          A.speak("과일 그래프 높이를 목표에 맞춰 마왕의 성벽을 여세요!", true);
        } else {
          boss.hp = boss.maxHp;
          qIdx = 0;
          setupBossQuestion();
          api.setMission("최종 보스전!", "불덩이를 점프해 피하고 정답 파워 오브를 터치해 마왕을 공격하세요!");
          A.speak("수학 마왕 등장! 정답 오브를 눌러 공격하세요!", true);
        }
        api.setWave(w, 2, 0);
      }

      function jump() {
        if (hero.grounded && wave === 2) {
          hero.vy = -590;
          hero.grounded = false;
          A.play("jump");
        }
      }

      return {
        init() { setupWave(1); },
        onActionPress() { jump(); },
        update(dt, input) {
          time += dt;
          if (wave === 1) return;

          if (hero.invuln > 0) hero.invuln = Math.max(0, hero.invuln - dt);
          if (boss.flash > 0) boss.flash = Math.max(0, boss.flash - dt);
          boss.x = E.VW / 2 + Math.sin(time * 1.3) * 180;

          let mv = 0;
          if (input.left) mv -= 1;
          if (input.right) mv += 1;
          if (dragX !== null && Math.abs(dragX - hero.x) > 12) mv = Math.sign(dragX - hero.x);
          hero.x = E.clamp(hero.x + mv * 390 * dt, 45, E.VW - 45);
          if (input.jumpJustPressed) jump();

          hero.vy += 1260 * dt;
          hero.y += hero.vy * dt;
          if (hero.y >= floorY) { hero.y = floorY; hero.vy = 0; hero.grounded = true; }

          if (!doneWave) {
            hazT -= dt;
            if (hazT <= 0) {
              hazards.push({ x: boss.x, y: boss.y + 35, vx: E.rand(-110, 110), vy: 220, r: 22 });
              hazT = 1.45;
            }
          }

          for (let i = hazards.length - 1; i >= 0; i--) {
            const h = hazards[i];
            h.x += h.vx * dt;
            h.y += h.vy * dt;
            if (E.dist(hero.x, hero.y, h.x, h.y) < 46) {
              hazards.splice(i, 1);
              if (hero.invuln <= 0 && !doneWave) {
                hero.invuln = 1.1;
                E.shake(10);
                A.play("hurt");
                api.damage("🔥 마왕의 불덩이를 피해 점프하세요!");
              }
              continue;
            }
            if (h.y > E.VH + 40) hazards.splice(i, 1);
          }
        },
        draw(ctx) {
          E.drawSkyBackdrop(ctx, "#450a0a", "#1e1b4b", time, "night");

          if (wave === 1) {
            E.drawGround(ctx, "#475569", "#0f172a", 470);
            for (const c of cols) {
              // 목표 점선
              const goalY = 470 - c.goal * 56;
              ctx.strokeStyle = "#fde047";
              ctx.lineWidth = 3;
              ctx.setLineDash([7, 6]);
              ctx.beginPath();
              ctx.moveTo(c.x - 62, goalY);
              ctx.lineTo(c.x + 62, goalY);
              ctx.stroke();
              ctx.setLineDash([]);
              E.drawBadgeBox(ctx, c.x - 45, goalY - 36, 90, 28, "rgba(15,23,42,0.9)", "#fde047", `목표 ${c.goal}`, "#fde047", 15);

              // 과일 블록 스택
              for (let k = 0; k < c.cur; k++) {
                const by = 470 - (k + 1) * 56 + 6;
                E.roundRect(ctx, c.x - 46, by, 92, 48, 14);
                ctx.fillStyle = c.color;
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.font = "28px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(c.emoji, c.x, by + 24);
              }

              E.drawBadgeBox(ctx, c.x - 55, 486, 110, 44, "#1e293b", c.color, `+ ${c.emoji} (${c.cur})`, "#fff", 18);
            }
            return;
          }

          E.drawGround(ctx, "#7c2d12", "#431407", floorY + 26);

          // 수학 마왕
          ctx.save();
          ctx.translate(boss.x, boss.y);
          E.drawCuteSlime(ctx, 0, 0, 56, boss.flash > 0 ? "#ffffff" : "#dc2626", {
            angry: true,
            label: QUESTIONS[qIdx % QUESTIONS.length].q,
            glow: "rgba(239,68,68,0.45)"
          });
          ctx.font = "36px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("👑", 0, -64);
          // HP 바
          E.roundRect(ctx, -70, 62, 140, 14, 7);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          E.roundRect(ctx, -70, 62, (140 * boss.hp) / boss.maxHp, 14, 7);
          ctx.fillStyle = "#4ade80";
          ctx.fill();
          ctx.restore();

          // 공격 오브
          for (const o of orbs) {
            const oy = o.y + Math.sin(time * 3 + o.x) * 10;
            E.drawCuteSlime(ctx, o.x, oy, o.r, "#38bdf8", { label: o.val, glow: "rgba(56,189,248,0.35)" });
          }

          // 불덩이
          for (const h of hazards) E.drawBomb(ctx, h.x, h.y, h.r, time);

          // 영웅
          ctx.save();
          if (hero.invuln > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.45;
          E.drawCuteSlime(ctx, hero.x, hero.y, 32, "#22c55e", { label: "★" });
          ctx.restore();
        },
        onPointerDown(x, y) {
          if (doneWave) return;
          if (wave === 1) {
            for (const c of cols) {
              if (Math.abs(x - c.x) < 75) {
                c.cur = c.cur >= 6 ? 1 : c.cur + 1;
                A.play("pop");
                E.spawnParticles(c.x, 470 - c.cur * 56, c.color, 12, 180);
                const matched = cols.filter((k) => k.cur === k.goal).length;
                api.setWave(1, 2, matched / 3);
                if (matched === 3) {
                  doneWave = true;
                  A.play("wave");
                  E.spawnConfetti(32);
                  api.addScore(250, E.VW / 2, 220, "📊 성벽 돌파!");
                  setTimeout(() => setupWave(2), 950);
                }
                return;
              }
            }
            return;
          }

          // 보스전 오브 터치 발사!
          for (const o of orbs) {
            if (E.dist(x, y, o.x, o.y) <= o.r + 16) {
              if (o.ok) {
                boss.hp -= 1;
                boss.flash = 0.25;
                const combo = api.addCombo();
                A.play("hit", combo);
                E.shake(11);
                E.spawnParticles(boss.x, boss.y, "#fde047", 24, 260);
                E.spawnRing(boss.x, boss.y, "#fde047", 95);
                api.addScore(200, boss.x, boss.y + 45, "⚡ 명중!");
                api.setWave(2, 2, (boss.maxHp - boss.hp) / boss.maxHp);
                if (boss.hp <= 0) {
                  doneWave = true;
                  A.play("transform", 5);
                  E.spawnConfetti(60);
                  E.spawnPopup(boss.x, boss.y, "👑 수학 마왕 대격파!!", "#fde047", 30);
                  A.speak("수학 마왕을 물리쳤어요! 최고예요!", true);
                  setTimeout(() => api.winStage(), 1200);
                } else {
                  qIdx += 1;
                  setupBossQuestion();
                }
              } else {
                A.play("hurt");
                E.spawnPopup(o.x, o.y - 40, "빗나갔어요!", "#f87171", 19);
              }
              return;
            }
          }

          if (y < floorY - 55) jump();
          else dragX = x;
        },
        onPointerMove(x) {
          if (dragX !== null) dragX = x;
        },
        onPointerUp() {
          dragX = null;
        }
      };
    }
  }
];
