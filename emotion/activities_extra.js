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
    name: "자유 행복 꽃밭 가꾸기",
    hint: "원하는 씨앗을 골라 화분에 심고 물을 줘서 꽃을 피워요",
    html: `
      <div class="ta-garden">
        <div class="ta-row" style="margin-top:0;margin-bottom:9px;justify-content:center" data-seeds>
          <span style="font-size:12px;color:#7a7489;font-weight:700">씨앗 고르기:</span>
          <button class="ta-chip on" type="button" data-seed="0">🌷 분홍꽃</button>
          <button class="ta-chip" type="button" data-seed="1">🌻 해바라기</button>
          <button class="ta-chip" type="button" data-seed="2">🌹 장미</button>
          <button class="ta-chip" type="button" data-seed="3">🪻 라벤더</button>
        </div>
        <div class="ta-pots">
          <button class="ta-pot" type="button" data-pot="0"><span class="plant"></span><small>1번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="1"><span class="plant"></span><small>2번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="2"><span class="plant"></span><small>3번 화분</small></button>
          <button class="ta-pot" type="button" data-pot="3"><span class="plant"></span><small>4번 화분</small></button>
        </div>
        <div class="ta-row" style="justify-content:center">
          <button class="ta-btn soft" type="button" data-waterall>🚿 전체 물 주기</button>
          <button class="ta-chip" type="button" data-replant>🌱 새 씨앗 심기</button>
        </div>
        <p class="ta-status" aria-live="polite">원하는 꽃 색깔을 고르고 화분을 눌러 키워보세요! (0 / 4)</p>
      </div>`,
    init(stage) {
      const potColors = ["#f472b6", "#fbbf24", "#fb7185", "#a78bfa"];
      let selectedColorIdx = 0;
      const potColorMap = [0, 1, 2, 3];
      const potSvg = (lv, colIdx) => {
        const col = potColors[colIdx % potColors.length];
        if (lv === 0) {
          return `<svg viewBox="0 0 64 64" width="52" height="52"><ellipse cx="32" cy="52" rx="18" ry="5" fill="#d6c5b3"/><path d="M18 38h28l-4 15H22z" fill="#e5987e" stroke="#b96d54" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="34" width="32" height="6" rx="2" fill="#f0ab93" stroke="#b96d54" stroke-width="2"/><ellipse cx="32" cy="34" rx="5" ry="3" fill="#8d6e63"/></svg>`;
        }
        if (lv === 1) {
          return `<svg class="svg-anim" viewBox="0 0 64 64" width="52" height="52"><ellipse cx="32" cy="52" rx="18" ry="5" fill="#d6c5b3"/><g class="sway"><path d="M32 35V22" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/><path d="M32 25c-7-7-12-2-7 4c3 3 7 1 7-4z" fill="#86efac" stroke="#16a34a" stroke-width="1.3"/><path d="M32 23c7-7 12-2 7 4c-3 3-7 1-7-4z" fill="#4ade80" stroke="#16a34a" stroke-width="1.3"/></g><path d="M18 38h28l-4 15H22z" fill="#e5987e" stroke="#b96d54" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="34" width="32" height="6" rx="2" fill="#f0ab93" stroke="#b96d54" stroke-width="2"/></svg>`;
        }
        if (lv === 2) {
          return `<svg class="svg-anim" viewBox="0 0 64 64" width="52" height="52"><ellipse cx="32" cy="52" rx="18" ry="5" fill="#d6c5b3"/><g class="sway"><path d="M32 35V16" stroke="#22c55e" stroke-width="3.2" stroke-linecap="round"/><path d="M32 26c-8-6-13-1-8 5c4 3 8 0 8-5z" fill="#4ade80" stroke="#16a34a" stroke-width="1.3"/><circle cx="32" cy="14" r="6" fill="${col}" stroke="#fff" stroke-width="1.5"/></g><path d="M18 38h28l-4 15H22z" fill="#e5987e" stroke="#b96d54" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="34" width="32" height="6" rx="2" fill="#f0ab93" stroke="#b96d54" stroke-width="2"/></svg>`;
        }
        return `<svg class="svg-anim" viewBox="0 0 64 64" width="52" height="52"><ellipse cx="32" cy="52" rx="18" ry="5" fill="#d6c5b3"/><g class="sway"><path d="M32 35V16" stroke="#16a34a" stroke-width="3.2" stroke-linecap="round"/><path d="M32 27c-9-6-14-1-8 5c4 3 8 0 8-5z" fill="#4ade80" stroke="#15803d" stroke-width="1.2"/><path d="M32 25c9-6 14-1 8 5c-4 3-8 0-8-5z" fill="#86efac" stroke="#15803d" stroke-width="1.2"/><g transform="translate(32 14)"><circle cx="0" cy="-7" r="5" fill="${col}"/><circle cx="6.6" cy="-2.2" r="5" fill="${col}"/><circle cx="4.1" cy="5.7" r="5" fill="${col}"/><circle cx="-4.1" cy="5.7" r="5" fill="${col}"/><circle cx="-6.6" cy="-2.2" r="5" fill="${col}"/><circle r="4" fill="#fde047"/></g></g><path d="M18 38h28l-4 15H22z" fill="#e5987e" stroke="#b96d54" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="34" width="32" height="6" rx="2" fill="#f0ab93" stroke="#b96d54" stroke-width="2"/></svg>`;
      };
      const pots = [...stage.querySelectorAll(".ta-pot")];
      const levels = [0, 0, 0, 0];
      stage.querySelectorAll("[data-seed]").forEach((sb) => {
        sb.addEventListener("click", () => {
          stage.querySelectorAll("[data-seed]").forEach((x) => x.classList.remove("on"));
          sb.classList.add("on");
          selectedColorIdx = Number(sb.dataset.seed);
        });
      });
      function growPot(idx) {
        if (levels[idx] === 0) potColorMap[idx] = selectedColorIdx;
        if (levels[idx] < 3) {
          levels[idx]++;
          const btn = pots[idx];
          btn.querySelector(".plant").innerHTML = potSvg(levels[idx], potColorMap[idx]);
          btn.classList.toggle("bloom", levels[idx] === 3);
          btn.classList.add("pop");
          setTimeout(() => btn.classList.remove("pop"), 260);
          taTone(520 + levels[idx] * 140, 0.2, "triangle", 0.05);
        }
        const doneCount = levels.filter((v) => v >= 3).length;
        taStatus(stage, "꽃이 무럭무럭 자라고 있어요! (활짝 핀 꽃 " + doneCount + " / 4)");
        if (doneCount >= 4) {
          taDone(stage, "나만의 색깔로 예쁜 행복 꽃밭을 완성했어요! 다시 심어볼 수도 있어요.");
        }
      }
      pots.forEach((btn, idx) => {
        btn.querySelector(".plant").innerHTML = potSvg(0, idx);
        btn.addEventListener("click", () => growPot(idx));
      });
      stage.querySelector("[data-waterall]").addEventListener("click", () => {
        for (let i = 0; i < 4; i++) growPot(i);
      });
      stage.querySelector("[data-replant]").addEventListener("click", () => {
        for (let i = 0; i < 4; i++) {
          levels[i] = 0;
          pots[i].classList.remove("bloom");
          pots[i].querySelector(".plant").innerHTML = potSvg(0, selectedColorIdx);
        }
        taStatus(stage, "화분을 비우고 새 씨앗을 심을 준비를 했어요!");
      });
      return null;
    }
  },

  bubble: {
    name: "마음 비눗방울 날리기",
    hint: "내 생각을 직접 적거나 골라서 비눗방울을 불고 톡톡 터뜨려요",
    html: `
      <div class="ta-bubble-wrap">
        <div class="ta-row" style="margin-top:0">
          <input class="ta-input" type="text" maxlength="16" placeholder="비눗방울에 담을 생각 적기" aria-label="비눗방울에 담을 생각">
          <button class="ta-btn" type="button" data-blow>🫧 불기</button>
          <button class="ta-btn soft" type="button" data-wind>💨 바람!</button>
        </div>
        <div class="ta-row" data-presets style="margin-top:0">
          <button class="ta-chip on" type="button">속상한 기분</button>
          <button class="ta-chip" type="button">걱정되는 일</button>
          <button class="ta-chip" type="button">서운한 마음</button>
          <button class="ta-chip" type="button">무거운 생각</button>
        </div>
        <div class="ta-bubble-sky" aria-label="비눗방울 하늘"></div>
        <p class="ta-status" style="margin:0">비눗방울을 톡톡 눌러 날려 보내요! (날린 방울 0개)</p>
      </div>`,
    init(stage) {
      const sky = stage.querySelector(".ta-bubble-sky");
      const blow = stage.querySelector("[data-blow]");
      const wind = stage.querySelector("[data-wind]");
      const input = stage.querySelector(".ta-input");
      const chips = [...stage.querySelectorAll("[data-presets] .ta-chip")];
      let label = "속상한 기분";
      let popped = 0;

      chips.forEach((c) => c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("on"));
        c.classList.add("on");
        label = c.textContent;
        input.value = "";
      }));

      function popBubble(b) {
        if (b.dataset.popped) return;
        b.dataset.popped = "1";
        b.classList.add("pop-out");
        popped++;
        taTone(740 + (popped % 8) * 55, 0.16, "sine", 0.05);
        setTimeout(() => b.remove(), 220);
        taStatus(stage, "비눗방울을 톡 날려 보냈어요! (날린 방울 " + popped + "개)");
        if (popped === 4) {
          taDone(stage, "무거운 생각을 비눗방울에 담아 하늘로 보냈어요. 더 날려도 좋아요!");
        }
      }

      function spawnBubble(customText) {
        const text = (customText || input.value.trim() || label).replace(/[<>&]/g, "");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ta-float-bub";
        b.textContent = "🫧 " + text;
        b.style.left = (8 + Math.random() * 64) + "%";
        b.style.top = (14 + Math.random() * 58) + "%";
        b.style.animationDelay = (Math.random() * 1.5).toFixed(2) + "s";
        b.addEventListener("click", () => popBubble(b));
        sky.append(b);
      }

      blow.addEventListener("click", () => {
        if (sky.children.length < 10) spawnBubble();
        if (input.value.trim()) input.value = "";
        taTone(480, 0.15, "sine", 0.04);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); blow.click(); }
      });
      wind.addEventListener("click", () => {
        const list = [...sky.querySelectorAll(".ta-float-bub")];
        if (!list.length) spawnBubble();
        list.forEach((b, idx) => setTimeout(() => popBubble(b), idx * 90));
      });
      spawnBubble("속상한 기분");
      spawnBubble("걱정되는 일");
      spawnBubble("답답한 마음");
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
        <div class="ta-flame" aria-live="polite">
          <svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88" role="img" aria-label="마음 불꽃">
            <circle cx="55" cy="54" r="36" fill="#ffedd5" class="pulse"/>
            <g class="flameFlicker" transform="translate(55 62)">
              <path d="M0-36c16 16 22 30 0 46c-22-16-16-30 0-46z" fill="#fb923c"/>
              <path d="M0-22c10 10 13 20 0 30c-13-10-10-20 0-30z" fill="#fde047"/>
              <circle cx="0" cy="-2" r="5" fill="#fffbeb"/>
            </g>
          </svg>
        </div>
        <div class="ta-row" style="justify-content:center">
          <button class="ta-btn" type="button" data-cool>🌬️ 후~ 바람 불기</button>
          <button class="ta-chip" type="button" data-relight>🔥 다시 연습</button>
        </div>
        <p class="ta-status">뜨거운 불꽃을 5번 불어 시원하게 식혀봐요! (0 / 5)</p>
      </div>`,
    init(stage) {
      const flame = stage.querySelector(".ta-flame");
      const cool = stage.querySelector("[data-cool]");
      const relight = stage.querySelector("[data-relight]");
      let count = 0;
      const svgs = [
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="36" fill="#ffedd5" class="pulse"/><g class="flameFlicker" transform="translate(55 62)"><path d="M0-36c16 16 22 30 0 46c-22-16-16-30 0-46z" fill="#fb923c"/><path d="M0-22c10 10 13 20 0 30c-13-10-10-20 0-30z" fill="#fde047"/></g></svg>`,
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="34" fill="#fef3c7" class="pulse"/><g class="flameFlicker" transform="translate(55 62) scale(.85)"><path d="M0-36c16 16 22 30 0 46c-22-16-16-30 0-46z" fill="#f59e0b"/><path d="M0-20c9 9 12 18 0 27c-12-9-9-18 0-27z" fill="#fef08a"/></g></svg>`,
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="34" fill="#fef9c3" class="pulse"/><g class="flameFlicker" transform="translate(55 64) scale(.68)"><path d="M0-34c14 14 20 26 0 40c-20-14-14-26 0-40z" fill="#facc15"/><path d="M0-18c8 8 10 15 0 22c-10-7-8-14 0-22z" fill="#fff"/></g></svg>`,
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="34" fill="#e0f2fe" class="pulse"/><path class="bob" d="M55 24c-14 20-20 32-20 42a20 20 0 0 0 40 0c0-10-6-22-20-42z" fill="#7dd3fc" stroke="#0284c7" stroke-width="2"/><path d="M46 62a6 10 0 0 0 4 10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="34" fill="#e0f7fa" class="pulse"/><g class="spinSlow" transform="translate(55 54)" stroke="#38bdf8" stroke-width="3.2" stroke-linecap="round"><path d="M0-24v48M-24 0h48M-17-17l34 34M17-17l-34 34"/><circle r="6" fill="#bae6fd" stroke="none"/></g></svg>`,
        `<svg class="svg-anim" viewBox="0 0 110 100" width="96" height="88"><circle cx="55" cy="54" r="36" fill="#dcfce7" class="pulse"/><g class="sway" transform="translate(55 68)"><path d="M0 10V-18" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/><path d="M0-10c-14-12-24-4-16 8c6 7 16 2 16-8z" fill="#4ade80" stroke="#15803d" stroke-width="1.6"/><path d="M0-16c14-12 24-4 16 8c-6 7-16 2-16-8z" fill="#86efac" stroke="#15803d" stroke-width="1.6"/></g></svg>`
      ];
      cool.addEventListener("click", () => {
        if (count >= 5) return;
        count++;
        flame.innerHTML = svgs[count] || svgs[5];
        flame.style.transform = "scale(" + (1.08 - count * 0.02) + ")";
        taTone(620 - count * 40, 0.25, "sine", 0.04);
        taStatus(stage, "시원한 바람이 불어요! (" + count + " / 5)");
        if (count >= 5) {
          taDone(stage, "뜨거웠던 마음 불꽃이 시원하고 평온하게 식었어요!");
        }
      });
      relight.addEventListener("click", () => {
        count = 0;
        flame.innerHTML = svgs[0];
        flame.style.transform = "scale(1)";
        taStatus(stage, "다시 바람을 불어 식혀볼까요? (0 / 5)");
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
    hint: "배경 색과 스티커, 나만의 응원 말을 자유롭게 담아 엽서를 만들어요",
    html: `
      <div class="ta-letter">
        <div class="ta-row" style="margin-top:0" data-stickers>
          <span style="font-size:12px;color:#7a7489;font-weight:700">스티커:</span>
          <button class="ta-chip on" type="button">🌟 반짝별</button>
          <button class="ta-chip" type="button">🌷 꽃다발</button>
          <button class="ta-chip" type="button">💛 하트</button>
          <button class="ta-chip" type="button">🌈 무지개</button>
          <button class="ta-chip" type="button">🦋 나비</button>
        </div>
        <div class="ta-row" style="margin-top:0" data-cardbg>
          <span style="font-size:12px;color:#7a7489;font-weight:700">엽서 색:</span>
          <button class="ta-chip on" type="button" data-cbg="linear-gradient(135deg,#fffef7,#fff5db)">크림</button>
          <button class="ta-chip" type="button" data-cbg="linear-gradient(135deg,#fff0f6,#ffe0ec)">분홍</button>
          <button class="ta-chip" type="button" data-cbg="linear-gradient(135deg,#effaff,#ddf2ff)">하늘</button>
          <button class="ta-chip" type="button" data-cbg="linear-gradient(135deg,#f0fdf4,#dcfce7)">연두</button>
        </div>
        <div class="ta-row" data-msgs>
          <button class="ta-chip" type="button">오늘도 정말 잘했어!</button>
          <button class="ta-chip" type="button">천천히 해도 괜찮아</button>
          <button class="ta-chip" type="button">네가 있어서 든든해</button>
        </div>
        <div class="ta-row">
          <input class="ta-input" type="text" maxlength="34" placeholder="직접 응원 한 마디 적어보기" aria-label="직접 응원 문장">
          <button class="ta-btn" type="button" data-send>💌 엽서 완성 · 보관함 저장</button>
        </div>
        <div class="ta-postcard">
          <div class="pc-sticker">🌟</div>
          <div class="pc-msg">위에서 스티커를 고르고 직접 응원 말을 적어보세요!</div>
        </div>
        <p class="ta-status" aria-live="polite">나와 친구에게 다정한 마음을 전해봐요.</p>
      </div>`,
    init(stage) {
      const sEl = stage.querySelector(".pc-sticker");
      const mEl = stage.querySelector(".pc-msg");
      const card = stage.querySelector(".ta-postcard");
      const input = stage.querySelector(".ta-input");
      const send = stage.querySelector("[data-send]");
      let chosenMsg = "";
      let chosenStickers = ["🌟"];

      stage.querySelectorAll("[data-stickers] .ta-chip").forEach((c) => {
        c.addEventListener("click", () => {
          c.classList.toggle("on");
          const active = [...stage.querySelectorAll("[data-stickers] .ta-chip.on")].map((x) => x.textContent.split(" ")[0]);
          chosenStickers = active.length ? active : ["🌟"];
          sEl.textContent = chosenStickers.join(" ");
          taTone(660, 0.14, "sine", 0.04);
        });
      });

      stage.querySelectorAll("[data-cbg]").forEach((c) => {
        c.addEventListener("click", () => {
          stage.querySelectorAll("[data-cbg]").forEach((x) => x.classList.remove("on"));
          c.classList.add("on");
          card.style.background = c.dataset.cbg;
        });
      });

      stage.querySelectorAll("[data-msgs] .ta-chip").forEach((c) => {
        c.addEventListener("click", () => {
          stage.querySelectorAll("[data-msgs] .ta-chip").forEach((x) => x.classList.remove("on"));
          c.classList.add("on");
          chosenMsg = c.textContent;
          input.value = chosenMsg;
          mEl.textContent = "“" + chosenMsg + "”";
          taTone(740, 0.14, "sine", 0.04);
        });
      });

      input.addEventListener("input", () => {
        const v = input.value.trim().replace(/[<>&]/g, "");
        chosenMsg = v;
        mEl.textContent = v ? "“" + v + "”" : "위에서 스티커를 고르고 직접 응원 말을 적어보세요!";
      });

      send.addEventListener("click", () => {
        const finalMsg = (input.value.trim() || chosenMsg || "오늘도 정말 잘했어!").replace(/[<>&]/g, "");
        mEl.textContent = "“" + finalMsg + "”";
        if (typeof taSaveCreation === "function") {
          taSaveCreation("letter", "응원 엽서", chosenStickers.join("") + " “" + finalMsg + "”");
        }
        taTone(880, 0.3, "triangle", 0.05);
        taDone(stage, "따뜻한 응원 엽서를 완성해 마음 보관함에 저장했어요!");
      });
      return null;
    }
  }
});
