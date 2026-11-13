"use strict";

/* ============================================================
   추가 태블릿 마음 돌보기 활동 7종
   - garden: 행복 꽃밭 가꾸기
   - bubble: 마음 비눗방울 날리기
   - cushion: 폭신한 쿠션 톡톡 두드리기
   - ice: 마음 불꽃 식히기
   - radar: 안전 레이더 살피기
   - grounding: 오감 감각 찾기
   - letter: 응원 엽서 꾸미기
   ============================================================ */
Object.assign(TABLET_ACT, {
  garden: {
    name: "행복 꽃밭 가꾸기",
    hint: "화분을 눌러 씨앗을 심고 꽃을 피워요",
    html: `
      <div class="ta-garden">
        <div class="ta-pots">
          <button class="ta-pot" type="button" data-pot="0"><span class="plant">🕳️</span><small>1번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="1"><span class="plant">🕳️</span><small>2번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="2"><span class="plant">🕳️</span><small>3번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="3"><span class="plant">🕳️</span><small>4번 화분</small></button>
        </div>
        <p class="ta-status" aria-live="polite">화분을 눌러 씨앗 → 새싹 → 꽃으로 키워보세요! (0 / 4)</p>
      </div>`,
    init(stage) {
      const stages = ["🕳️", "🌱", "🌷", "🌻", "🌸"];
      const blooms = ["🌸", "🌻", "🌷", "🌺"];
      const pots = [...stage.querySelectorAll(".ta-pot")];
      const levels = [0, 0, 0, 0];
      pots.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
          if (levels[idx] < 3) {
            levels[idx]++;
            const icon = levels[idx] === 3 ? blooms[idx] : stages[levels[idx]];
            btn.querySelector(".plant").textContent = icon;
            btn.classList.toggle("bloom", levels[idx] === 3);
            btn.classList.add("pop");
            setTimeout(() => btn.classList.remove("pop"), 260);
            taTone(520 + levels[idx] * 140, 0.2, "triangle", 0.05);
          }
          const doneCount = levels.filter((v) => v >= 3).length;
          taStatus(stage, "꽃이 피어나고 있어요! (활짝 핀 꽃 " + doneCount + " / 4)");
          if (doneCount >= 4) {
            taDone(stage, "예쁜 행복 꽃밭을 완성했어요! 기쁜 마음이 가득 피어났어요.");
          }
        });
      });
      return null;
    }
  },

  bubble: {
    name: "마음 비눗방울 날리기",
    hint: "속상한 마음을 담아 비눗방울을 톡 터뜨려요",
    html: `
      <div class="ta-bubble-wrap">
        <div class="ta-row" data-presets>
          <button class="ta-chip" type="button">속상한 기분</button>
          <button class="ta-chip" type="button">걱정되는 일</button>
          <button class="ta-chip" type="button">서운한 마음</button>
        </div>
        <div class="ta-bubble-sky" aria-label="비눗방울 하늘"></div>
        <div class="ta-row">
          <button class="ta-btn" type="button" data-blow>🫧 비눗방울 불기</button>
          <p class="ta-status" style="margin:0">버튼을 눌러 비눗방울을 띄우고 톡 눌러 날려 보내요! (0 / 4)</p>
        </div>
      </div>`,
    init(stage) {
      const sky = stage.querySelector(".ta-bubble-sky");
      const blow = stage.querySelector("[data-blow]");
      const chips = [...stage.querySelectorAll("[data-presets] .ta-chip")];
      let label = "속상함";
      let popped = 0;

      chips.forEach((c) => c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("on"));
        c.classList.add("on");
        label = c.textContent;
      }));

      function spawnBubble() {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ta-float-bub";
        b.textContent = "🫧 " + label;
        b.style.left = (12 + Math.random() * 62) + "%";
        b.style.top = (16 + Math.random() * 52) + "%";
        b.addEventListener("click", () => {
          b.classList.add("pop-out");
          popped++;
          taTone(740 + popped * 60, 0.16, "sine", 0.05);
          setTimeout(() => b.remove(), 220);
          taStatus(stage, "비눗방울을 톡 날려 보냈어요! (" + popped + " / 4)");
          if (popped >= 4) {
            taDone(stage, "무거운 생각을 비눗방울에 담아 하늘로 보냈어요. 한결 가벼워졌죠?");
          }
        });
        sky.append(b);
      }

      blow.addEventListener("click", () => {
        if (sky.children.length < 6) spawnBubble();
        taTone(480, 0.15, "sine", 0.04);
      });
      spawnBubble();
      spawnBubble();
      return null;
    }
  },

  cushion: {
    name: "폭신한 쿠션 톡톡 두드리기",
    hint: "쿠션을 톡톡 눌러 화 에너지를 안전하게 풀어요",
    html: `
      <div class="ta-cozy">
        <button class="ta-cushion-btn" type="button" aria-label="폭신한 쿠션">🛋️</button>
        <div class="ta-meter"><i style="background:linear-gradient(90deg,#ff9f80,#8cd19d)"></i></div>
        <p class="ta-status" aria-live="polite">쿠션을 톡톡 눌러 답답한 에너지를 내보내요! (0 / 8)</p>
      </div>`,
    init(stage) {
      const btn = stage.querySelector(".ta-cushion-btn");
      const bar = stage.querySelector(".ta-meter i");
      let hits = 0;
      btn.addEventListener("click", () => {
        hits++;
        btn.classList.add("squish");
        setTimeout(() => btn.classList.remove("squish"), 140);
        const pct = Math.min(100, (hits / 8) * 100);
        bar.style.width = pct + "%";
        taTone(280 + hits * 35, 0.12, "triangle", 0.05);
        taStatus(stage, "안전하게 에너지를 풀고 있어요! (" + Math.min(hits, 8) + " / 8)");
        if (hits >= 8) {
          taDone(stage, "쿠션 두드리기로 답답한 마음을 안전하게 풀었어요! 이제 숨을 고를 수 있어요.");
        }
      });
      return null;
    }
  },

  ice: {
    name: "마음 불꽃 식히기",
    hint: "시원한 바람 버튼을 눌러 불꽃을 식혀요",
    html: `
      <div class="ta-ice-wrap">
        <div class="ta-flame" aria-live="polite">🔥</div>
        <div class="ta-row" style="justify-content:center">
          <button class="ta-btn" type="button" data-cool>🌬️ 후~ 바람 불기</button>
        </div>
        <p class="ta-status">뜨거운 불꽃을 5번 불어 시원하게 식혀봐요! (0 / 5)</p>
      </div>`,
    init(stage) {
      const flame = stage.querySelector(".ta-flame");
      const cool = stage.querySelector("[data-cool]");
      let count = 0;
      const icons = ["🔥", "🟠", "🟡", "💧", "❄️", "🌿"];
      cool.addEventListener("click", () => {
        if (count >= 5) return;
        count++;
        flame.textContent = icons[count] || "🌿";
        flame.style.transform = "scale(" + (1.15 - count * 0.06) + ")";
        taTone(620 - count * 40, 0.25, "sine", 0.04);
        taStatus(stage, "시원한 바람이 불어요! (" + count + " / 5)");
        if (count >= 5) {
          taDone(stage, "뜨거웠던 마음 불꽃이 시원하고 평온하게 식었어요!");
        }
      });
      return null;
    }
  },

  radar: {
    name: "안전 레이더 살피기",
    hint: "주변의 안전한 것 4가지를 모두 눌러 확인해요",
    html: `
      <div class="ta-radar">
        <div class="ta-radar-grid">
          <button class="ta-radar-item" type="button">👩‍🏫<small>선생님</small></button>
          <button class="ta-radar-item" type="button">🪑<small>내 자리</small></button>
          <button class="ta-radar-item" type="button">🪟<small>밝은 창문</small></button>
          <button class="ta-radar-item" type="button">🧸<small>포근한 인형</small></button>
        </div>
        <p class="ta-status" aria-live="polite">놀랐을 땐 주변의 안전한 것들을 하나씩 눌러 확인해요. (0 / 4)</p>
      </div>`,
    init(stage) {
      const items = [...stage.querySelectorAll(".ta-radar-item")];
      let found = 0;
      items.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.classList.contains("on")) return;
          btn.classList.add("on");
          found++;
          taTone(540 + found * 90, 0.2, "sine", 0.05);
          taStatus(stage, "안전한 곳을 확인했어요! (" + found + " / 4)");
          if (found >= 4) {
            taDone(stage, "내 주변이 안전하다는 걸 확인했어요. 마음이 한결 편안해졌어요!");
          }
        });
      });
      return null;
    }
  },

  grounding: {
    name: "오감 감각 찾기",
    hint: "지금 느껴지는 감각 4가지를 차례로 눌러요",
    html: `
      <div class="ta-ground">
        <div class="ta-ground-list">
          <button class="ta-chip" type="button">👀 지금 보이는 색깔 하나 찾기</button>
          <button class="ta-chip" type="button">👂 지금 들리는 작은 소리 듣기</button>
          <button class="ta-chip" type="button">✋ 책상이나 옷의 촉감 느끼기</button>
          <button class="ta-chip" type="button">🦶 바닥에 닿은 내 발 느끼기</button>
        </div>
        <p class="ta-status" aria-live="polite">해본 감각을 하나씩 눌러 체크해요. (0 / 4)</p>
      </div>`,
    init(stage) {
      const chips = [...stage.querySelectorAll(".ta-ground-list .ta-chip")];
      let done = 0;
      chips.forEach((c) => {
        c.addEventListener("click", () => {
          if (c.classList.contains("on")) return;
          c.classList.add("on");
          done++;
          taTone(500 + done * 80, 0.2, "triangle", 0.05);
          taStatus(stage, "지금 이 순간의 감각을 느꼈어요! (" + done + " / 4)");
          if (done >= 4) {
            taDone(stage, "오감으로 지금 여기를 잘 살펴봤어요. 정말 차분해졌어요!");
          }
        });
      });
      return null;
    }
  },

  letter: {
    name: "응원 엽서 꾸미기",
    hint: "스티커와 응원 문장을 골라 엽서를 완성해요",
    html: `
      <div class="ta-letter">
        <div class="ta-row" data-stickers>
          <button class="ta-chip" type="button">🌟 반짝별</button>
          <button class="ta-chip" type="button">🌷 꽃다발</button>
          <button class="ta-chip" type="button">💛 하트</button>
          <button class="ta-chip" type="button">🌈 무지개</button>
        </div>
        <div class="ta-row" data-msgs>
          <button class="ta-chip" type="button">오늘도 정말 잘했어!</button>
          <button class="ta-chip" type="button">천천히 해도 괜찮아</button>
          <button class="ta-chip" type="button">네가 있어서 든든해</button>
        </div>
        <div class="ta-postcard">
          <div class="pc-sticker">🌟</div>
          <div class="pc-msg">위에서 스티커와 응원 문장을 골라보세요!</div>
        </div>
        <button class="ta-btn" type="button" data-send>💌 응원 엽서 완성하기</button>
        <p class="ta-status" aria-live="polite">나와 친구에게 다정한 마음을 전해봐요.</p>
      </div>`,
    init(stage) {
      const sEl = stage.querySelector(".pc-sticker");
      const mEl = stage.querySelector(".pc-msg");
      const send = stage.querySelector("[data-send]");
      let chosenMsg = false;

      stage.querySelectorAll("[data-stickers] .ta-chip").forEach((c) => {
        c.addEventListener("click", () => {
          stage.querySelectorAll("[data-stickers] .ta-chip").forEach((x) => x.classList.remove("on"));
          c.classList.add("on");
          sEl.textContent = c.textContent.split(" ")[0];
          taTone(660, 0.14, "sine", 0.04);
        });
      });

      stage.querySelectorAll("[data-msgs] .ta-chip").forEach((c) => {
        c.addEventListener("click", () => {
          stage.querySelectorAll("[data-msgs] .ta-chip").forEach((x) => x.classList.remove("on"));
          c.classList.add("on");
          mEl.textContent = "“" + c.textContent + "”";
          chosenMsg = true;
          taTone(740, 0.14, "sine", 0.04);
        });
      });

      send.addEventListener("click", () => {
        if (!chosenMsg) {
          mEl.textContent = "“오늘도 정말 잘했어!”";
        }
        taTone(880, 0.3, "triangle", 0.05);
        taDone(stage, "따뜻한 응원 엽서를 완성했어요! 마음이 포근해져요.");
      });
      return null;
    }
  }
});
