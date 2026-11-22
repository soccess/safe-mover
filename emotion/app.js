"use strict";

function initTablet(type, stageEl) {
  const stage = stageEl || document.getElementById("taStage");
  if (!stage) return;
  const act = TABLET_ACT[type] || TABLET_ACT.talk;
  stage.innerHTML = act.html;
  try {
    taDispose = act.init(stage) || null;
  } catch (err) {
    console.error(err);
    stage.insertAdjacentHTML("beforeend", '<p class="ta-status">활동을 준비하지 못했어요. 다른 방법을 골라볼까요?</p>');
  }
}

function disposeTablet() {
  if (taDispose) {
    try { taDispose(); } catch (_) {}
    taDispose = null;
  }
  try { if (taAC && taAC.state === "running") taAC.suspend(); } catch (_) {}
  try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (_) {}
}

const emState = {
  easyMode: false,
  step: 1,
  afterMood: "",
  mixedMoods: [],
  thermo: 50,
  studioCat: "all"
};

const STUDIO_CATALOG = [
  { type: "draw", title: "자유 마음 화실", sub: "무지개 붓과 스티커 도장으로 자유롭게 그려요.", cat: "create", mood: "happy" },
  { type: "write", title: "마음 온도 메모", sub: "오늘의 마음 온도와 생각을 글로 적어요.", cat: "create", mood: "surprised" },
  { type: "letter", title: "응원 엽서 꾸미기", sub: "스티커와 다정한 말로 나만의 엽서를 만들어요.", cat: "create", mood: "happy" },
  { type: "jar", title: "고마움 항아리", sub: "알록달록 쪽지에 고마운 일을 담아요.", cat: "create", mood: "worried" },
  { type: "music", title: "8음계 자유 멜로디", sub: "피아노·실로폰·오르골로 자유 작곡과 녹음!", cat: "calm", mood: "happy" },
  { type: "breathe", title: "숨 고르기 연습", sub: "원하는 호흡 속도를 골라 숨을 고르며 쉬어요.", cat: "calm", mood: "worried" },
  { type: "ice", title: "마음 불꽃 식히기", sub: "시원한 바람을 불어 뜨거운 마음을 식혀요.", cat: "calm", mood: "angry" },
  { type: "water", title: "물 한 모금 쉬기", sub: "천천히 물을 마시며 몸의 신호를 느껴요.", cat: "calm", mood: "tired" },
  { type: "read", title: "마음 그림책", sub: "따뜻한 그림책을 한 장씩 넘겨 읽어요.", cat: "calm", mood: "tired" },
  { type: "garden", title: "행복 꽃밭 가꾸기", sub: "원하는 꽃 씨앗을 심고 물을 주며 키워요.", cat: "play", mood: "happy" },
  { type: "bubble", title: "마음 비눗방울", sub: "내 생각을 담아 비눗방울을 불고 톡 날려요.", cat: "play", mood: "sad" },
  { type: "walk", title: "마음 산책 길", sub: "손가락으로 산책 길을 따라 걸으며 쉬어요.", cat: "play", mood: "sad" },
  { type: "dance", title: "기분 좋은 리듬 춤", sub: "박자 패드를 누르며 신나게 몸을 움직여요.", cat: "play", mood: "happy" },
  { type: "cushion", title: "쿠션 톡톡 두드리기", sub: "폭신한 쿠션을 두드리며 에너지를 풀어요.", cat: "play", mood: "angry" },
  { type: "cozy", title: "포근한 안아주기", sub: "꾹 눌러 나를 따뜻하게 안아주고 쉬어요.", cat: "play", mood: "tired" },
  { type: "radar", title: "안전 레이더 살피기", sub: "내 주변의 안전한 것들을 확인하고 안심해요.", cat: "play", mood: "worried" },
  { type: "grounding", title: "오감 감각 찾기", sub: "보고 듣고 만지는 지금 이 순간에 집중해요.", cat: "calm", mood: "surprised" },
  { type: "talk", title: "내 마음 말하기", sub: "마음 낱말을 골라 소리 내어 표현해요.", cat: "share", mood: "sad" },
  { type: "friend", title: "기쁨 나누기", sub: "친구와 좋은 마음을 나누며 함께 웃어요.", cat: "share", mood: "happy" },
  { type: "trophy", title: "나의 작은 성취", sub: "오늘 내가 해낸 멋진 일들을 칭찬해요.", cat: "share", mood: "happy" },
  { type: "question", title: "궁금한 점 묻기", sub: "카드를 뒤집어 궁금한 점을 질문으로 정리해요.", cat: "share", mood: "surprised" }
];

function speakEmotion(text) {
  if (!text) return;
  if (window.D1Bridge && window.D1Bridge.speakText) {
    window.D1Bridge.speakText(text, 0.9);
  } else {
    taSpeak(text);
  }
}

function updateNowNext(step) {
  emState.step = step;
  const bar = document.getElementById("emNowNextBar");
  if (!bar) return;
  if (step === 1) {
    bar.innerHTML = '🧭 <b>지금:</b> 1. 내 마음 고르기 → <b>다음:</b> 2. 돌보는 방법 선택';
  } else if (step === 2) {
    const m = moods[currentMood];
    bar.innerHTML = '🧭 <b>지금:</b> 2. ' + (m ? m.label + ' ' : '') + '돌보는 방법 고르기 → <b>다음:</b> 3. 태블릿 활동 해보기';
  } else {
    const actTitle = currentActivity ? currentActivity.title : "마음 돌보기";
    bar.innerHTML = '🧭 <b>지금:</b> 3. [' + actTitle + '] 활동하기 → <b>다음:</b> 다 한 뒤 기분 확인하기';
  }
}

function syncEmotionButtons() {
  const btnEasy = document.getElementById("btnEmotionEasy");
  if (btnEasy) {
    btnEasy.classList.toggle("on", emState.easyMode);
    btnEasy.textContent = emState.easyMode ? "📖 쉬운 말 ON" : "📖 쉬운 말";
  }
  const heroCopyP = document.querySelector(".hero-copy p");
  if (heroCopyP) {
    heroCopyP.innerHTML = emState.easyMode
      ? "지금 내 기분을 골라요.<br>마음이 편해지는 놀이를 함께 해요."
      : "마음을 알아차리는 건 나를 돌보는 첫걸음이에요.<br>지금 느끼는 감정을 골라 8가지 활동으로 함께 살펴봐요.";
  }
}

function renderMoodCards() {
  const moodCards = document.getElementById("moodCards");
  if (!moodCards) return;
  moodCards.innerHTML = "";
  Object.entries(moods).forEach(([key, m]) => {
    const easy = (typeof EASY_MOOD_COPY !== "undefined" && EASY_MOOD_COPY[key]) ? EASY_MOOD_COPY[key] : null;
    const desc = (emState.easyMode && easy) ? easy.desc : m.description;
    const card = document.createElement("button");
    card.className = "mood-card";
    card.dataset.mood = key;
    card.setAttribute("aria-label", m.label + " 선택");
    card.innerHTML =
      '<div class="mood-picture">' + faceSvg(key) + "</div>" +
      '<div class="mood-label">' + m.label + '<span class="mood-arrow">↗</span></div>' +
      '<p class="mood-desc">' + desc + "</p>" +
      '<span class="em-tts-inline" data-say="' + m.label + ". " + desc + '">🔊 듣기</span>';
    card.onclick = (e) => {
      const tts = e.target.closest(".em-tts-inline");
      if (tts) {
        e.stopPropagation();
        speakEmotion(tts.getAttribute("data-say"));
        return;
      }
      chooseMood(key);
    };
    moodCards.append(card);
  });
}

document.getElementById("heroArt").innerHTML = heroSVG();
renderMoodCards();

let currentMood = "";
let currentActivity = null;

function chooseMood(key, autoSpeak) {
  disposeTablet();
  currentMood = key;
  const m = moods[key];
  const easy = (typeof EASY_MOOD_COPY !== "undefined" && EASY_MOOD_COPY[key]) ? EASY_MOOD_COPY[key] : null;
  const tagline = (emState.easyMode && easy) ? easy.tagline : m.tagline;
  const moodLine = (emState.easyMode && easy) ? easy.moodLine : m.moodLine;
  showOnlyStage("methodStage");

  const banner = document.getElementById("chosenBanner");
  banner.style.background = m.color;
  banner.innerHTML =
    faceSvg(key) +
    '<div><h2>나는 지금 ' + m.adj + ' 마음이에요</h2><p>' + tagline + " " + moodLine + '</p><button type="button" class="em-tts-inline" id="btnBannerSpeak">🔊 마음 말로 듣기</button></div>' +
    '<span class="badge">' + m.face + " " + m.label + " 마음 날씨</span>";
  const btnBannerSpeak = document.getElementById("btnBannerSpeak");
  if (btnBannerSpeak) {
    btnBannerSpeak.onclick = () => speakEmotion("나는 지금 " + m.adj + " 마음이에요. " + tagline + " " + moodLine);
  }

  const cards = document.getElementById("methodCards");
  cards.innerHTML = "";
  document.getElementById("detail").className = "detail";

  m.methods.forEach((item, i) => {
    const [type, title, sub] = item;
    const b = document.createElement("button");
    b.className = "method-card";
    b.dataset.type = type;
    b.dataset.mood = key;
    b.setAttribute("aria-label", title + " — 태블릿 활동 열기");
    b.style.setProperty("--wash", m.color);
    b.innerHTML =
      '<div class="method-art"><span class="tap-badge">✋ 태블릿</span>' + sceneSVG(type, key) + "</div>" +
      '<div class="method-title">' + title + "</div>" +
      '<p class="method-sub">' + sub + "</p>" +
      '<div class="go">태블릿 활동 열기 →</div>';
    b.onclick = () => showDetail(item, i);
    cards.append(b);
  });

  document.getElementById("p1").className = "dot done";
  document.getElementById("p2").className = "dot active";
  document.getElementById("p3").className = "dot";
  updateNowNext(2);
  if (autoSpeak) speakEmotion(m.label + " 마음을 골랐어요. 돌보는 방법을 골라봐요.");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDetail(item, index) {
  const [type, title, sub, tip] = item;
  currentActivity = { type, title, index };
  emState.afterMood = "";
  const m = moods[currentMood];
  const easySteps = (typeof EASY_ACTION_STEPS !== "undefined" && EASY_ACTION_STEPS[type]) ? EASY_ACTION_STEPS[type] : null;
  const steps = (emState.easyMode && easySteps) ? easySteps : (ACTION_STEPS[type] || ACTION_STEPS.talk);
  const detail = document.getElementById("detail");
  detail.style.gridTemplateColumns = "";
  detail.innerHTML =
    '<div class="detail-art">' + sceneSVG(type, currentMood, true) + "</div>" +
    '<div class="detail-copy">' +
      '<div class="detail-kicker">' + m.face + " " + m.adj + " 마음 돌보기 · 방법 " + (index + 1) + "</div>" +
      "<h3>" + title + "</h3>" +
      '<p class="intro">' + sub + "</p>" +
      '<button type="button" class="em-tts-inline" id="btnDetailSpeak">🔊 순서 읽어주기</button>' +
      '<ol class="steps">' + steps.map((s, i) => '<li><span class="step-no">' + (i + 1) + "</span><span>" + s + "</span></li>").join("") + "</ol>" +
      '<div class="say-box">💬 ' + tip + "</div>" +
      '<div id="donePanel" class="done-panel">' +
        '<div>🌷 잘했어요! 내 마음을 돌보는 멋진 연습을 했어요.</div>' +
        '<div class="checkout-box">' +
          '<p class="checkout-title">활동 후 지금 내 마음은 어떤가요? (눌러서 알려줘요)</p>' +
          '<div class="checkout-btns">' +
            '<button type="button" class="checkout-btn" data-after="calm_better">😌 한결 편안해졌어요</button>' +
            '<button type="button" class="checkout-btn" data-after="little_better">🙂 조금 나아졌어요</button>' +
            '<button type="button" class="checkout-btn help" data-after="need_help">🙋 선생님 도움이 필요해요</button>' +
          '</div>' +
          '<div class="checkout-saved" id="checkoutSaved"></div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-actions">' +
        '<button class="action primary" onclick="markDone()">이 방법 해봤어요 ✓</button>' +
        '<button class="action secondary" onclick="closeDetail()">다른 방법 보기</button>' +
      "</div>" +
    "</div>" +
    '<div class="tablet-activity">' +
      '<div class="ta-head">' +
        '<span class="ta-badge">✋ 태블릿 활동</span>' +
        "<strong>" + (TABLET_ACT[type] || TABLET_ACT.talk).name + "</strong>" +
        '<span class="ta-hint">☝️ 손가락으로 직접 해봐요</span>' +
      "</div>" +
      '<div class="ta-stage" id="taStage"></div>' +
    "</div>";

  const btnDetailSpeak = document.getElementById("btnDetailSpeak");
  if (btnDetailSpeak) {
    btnDetailSpeak.onclick = () => speakEmotion(title + ". " + steps.map((s, idx) => (idx + 1) + "번, " + s).join(" "));
  }
  detail.querySelectorAll(".checkout-btn").forEach((btn) => {
    btn.onclick = () => saveCheckoutMood(btn.getAttribute("data-after"), btn.textContent.trim());
  });

  detail.classList.add("open");
  disposeTablet();
  initTablet(type);
  document.getElementById("p3").className = "dot active";
  updateNowNext(3);
  setTimeout(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

function saveCheckoutMood(afterKey, label) {
  emState.afterMood = afterKey;
  document.querySelectorAll(".checkout-btn").forEach((b) => {
    b.classList.toggle("on", b.getAttribute("data-after") === afterKey);
  });
  const savedEl = document.getElementById("checkoutSaved");
  if (savedEl) {
    savedEl.textContent = afterKey === "need_help"
      ? "🙋 괜찮아요! 선생님께 화면을 보여주거나 오른쪽 아래 💬 말판을 눌러 말해요."
      : "💛 기록되었어요: " + label;
  }
  speakEmotion(label);
  if (window.D1Bridge && currentMood) {
    const m = moods[currentMood] || { label: currentMood };
    const title = currentActivity ? currentActivity.title : "마음 돌보기";
    window.D1Bridge.saveRecord({
      game: "emotion",
      stage: m.label + " 마음 사후 점검",
      score: 1,
      summary: title + " 후 기분: " + label,
      payload: { mood: currentMood, moodLabel: m.label, activity: currentActivity, afterMood: afterKey, afterLabel: label }
    });
  }
}

function markDone() {
  document.getElementById("donePanel").classList.add("show");
  document.getElementById("p3").className = "dot done";
  taConfetti();
  if (window.D1Bridge && currentMood) {
    const m = moods[currentMood] || { label: currentMood };
    const title = currentActivity ? currentActivity.title : "마음 돌보기";
    window.D1Bridge.saveRecord({
      game: "emotion",
      stage: m.label + " 마음",
      score: 1,
      summary: title + " 활동 완료",
      payload: { mood: currentMood, moodLabel: m.label, activity: currentActivity }
    });
  }
}

function closeDetail() {
  disposeTablet();
  document.getElementById("detail").className = "detail";
  document.getElementById("p3").className = "dot";
  updateNowNext(2);
  document.getElementById("methodCards").scrollIntoView({ behavior: "smooth", block: "start" });
}

function goHome() {
  disposeTablet();
  ["methodStage", "freeStage", "galleryStage"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("visible");
  });
  document.getElementById("homeStage").classList.add("visible");
  document.getElementById("p1").className = "dot active";
  document.getElementById("p2").className = "dot";
  document.getElementById("p3").className = "dot";
  updateNowNext(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showOnlyStage(stageId) {
  disposeTablet();
  ["homeStage", "methodStage", "freeStage", "galleryStage"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("visible", id === stageId);
  });
}

function renderFreeMixer() {
  const box = document.getElementById("mixerMoodChips");
  const thermo = document.getElementById("homeThermo");
  const thermoVal = document.getElementById("homeThermoVal");
  const resEl = document.getElementById("mixerResultText");
  if (!box || !resEl) return;

  box.innerHTML = "";
  Object.entries(moods).forEach(([k, m]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ta-chip" + (emState.mixedMoods.includes(k) ? " on" : "");
    b.textContent = m.face + " " + m.label;
    b.onclick = () => {
      if (emState.mixedMoods.includes(k)) {
        emState.mixedMoods = emState.mixedMoods.filter((x) => x !== k);
      } else {
        if (emState.mixedMoods.length >= 2) emState.mixedMoods.shift();
        emState.mixedMoods.push(k);
      }
      renderFreeMixer();
    };
    box.appendChild(b);
  });

  if (thermo && !thermo._bound) {
    thermo._bound = true;
    thermo.addEventListener("input", () => {
      emState.thermo = Number(thermo.value);
      if (thermoVal) thermoVal.textContent = String(emState.thermo);
      renderFreeMixer();
    });
  }

  if (!emState.mixedMoods.length) {
    resEl.innerHTML = '마음을 1~2개 눌러 섞어보거나 바로 자유 활동을 골라보세요!';
  } else {
    const names = emState.mixedMoods.map((k) => moods[k].face + " " + moods[k].label).join(" + ");
    const firstMood = moods[emState.mixedMoods[0]];
    const rec = firstMood ? firstMood.methods[0] : null;
    resEl.innerHTML =
      '<span>오늘 내 마음: <b>' + names + '</b> (' + emState.thermo + '%)</span> ' +
      (rec ? '<button type="button" class="ta-chip on" id="btnMixerTry">✨ 추천 활동 [' + rec[1] + '] 해보기 →</button>' : '');
    const tryBtn = document.getElementById("btnMixerTry");
    if (tryBtn && rec) {
      tryBtn.onclick = () => {
        openFreeStudio("all");
        openFreeActivity(rec[0]);
      };
    }
  }
}

function openFreeStudio(cat) {
  emState.studioCat = cat || emState.studioCat || "all";
  showOnlyStage("freeStage");
  document.getElementById("p1").className = "dot done";
  document.getElementById("p2").className = "dot active";
  document.getElementById("p3").className = "dot";
  const bar = document.getElementById("emNowNextBar");
  if (bar) bar.innerHTML = '🎨 <b>자유 활동실:</b> 원하는 놀이를 마음껏 골라 자유롭게 해보세요!';
  renderFreeStudio();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFreeStudio() {
  const catsEl = document.getElementById("studioCats");
  const cardsEl = document.getElementById("freeMethodCards");
  const detailEl = document.getElementById("freeDetail");
  if (!cardsEl) return;
  if (detailEl) detailEl.className = "detail";

  if (catsEl) {
    catsEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.cat === emState.studioCat);
      if (!btn._bound) {
        btn._bound = true;
        btn.addEventListener("click", () => {
          emState.studioCat = btn.dataset.cat;
          renderFreeStudio();
        });
      }
    });
  }

  const filtered = emState.studioCat === "all"
    ? STUDIO_CATALOG
    : STUDIO_CATALOG.filter((item) => item.cat === emState.studioCat);

  cardsEl.innerHTML = "";
  filtered.forEach((item) => {
    const m = moods[item.mood] || moods.happy;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "method-card";
    b.style.setProperty("--wash", m.color);
    b.innerHTML =
      '<div class="method-art"><span class="tap-badge">🎨 자유 활동</span>' + sceneSVG(item.type, item.mood) + '</div>' +
      '<div class="method-title">' + item.title + '</div>' +
      '<p class="method-sub">' + item.sub + '</p>' +
      '<div class="go">바로 열기 →</div>';
    b.onclick = () => openFreeActivity(item.type);
    cardsEl.appendChild(b);
  });
}

function openFreeActivity(type) {
  const item = STUDIO_CATALOG.find((x) => x.type === type) || STUDIO_CATALOG[0];
  const detail = document.getElementById("freeDetail");
  if (!detail) return;
  const act = TABLET_ACT[item.type] || TABLET_ACT.talk;
  detail.style.gridTemplateColumns = "1fr";
  detail.style.gridTemplateAreas = '"act"';
  detail.innerHTML =
    '<div class="tablet-activity" style="border-top:none;padding-top:0;margin-top:0">' +
      '<div class="ta-head">' +
        '<span class="ta-badge">🎨 자유 활동실</span>' +
        '<strong>' + act.name + '</strong>' +
        '<span class="ta-hint">' + (act.hint || '') + '</span>' +
        '<button type="button" class="ta-chip" id="btnCloseFreeAct" style="margin-left:auto">← 다른 놀이 고르기</button>' +
      '</div>' +
      '<div class="ta-stage" id="freeTaStage"></div>' +
    '</div>';
  detail.classList.add("open");
  disposeTablet();
  initTablet(item.type, document.getElementById("freeTaStage"));
  document.getElementById("p3").className = "dot active";
  document.getElementById("btnCloseFreeAct").onclick = () => {
    disposeTablet();
    detail.className = "detail";
    document.getElementById("p3").className = "dot";
  };
  setTimeout(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

function refreshMindGalleryBadge() {
  const badge = document.getElementById("galleryCountBadge");
  if (!badge || typeof taLoadCreations !== "function") return;
  const count = taLoadCreations().length;
  badge.textContent = count > 0 ? `(${count})` : "";
}
window.refreshMindGalleryBadge = refreshMindGalleryBadge;

function openMindGallery() {
  showOnlyStage("galleryStage");
  const bar = document.getElementById("emNowNextBar");
  if (bar) bar.innerHTML = '🗂️ <b>내 마음 보관함:</b> 내가 만든 마음 그림, 엽서, 쪽지, 메모를 모아봤어요!';
  const listEl = document.getElementById("galleryList");
  if (!listEl || typeof taLoadCreations !== "function") return;
  const items = taLoadCreations();
  if (!items.length) {
    listEl.innerHTML = '<div class="gallery-empty">아직 저장된 작품이 없어요. 🎨 자유 활동실에서 그림이나 엽서, 메모를 만들어 저장해 보세요!</div>';
  } else {
    const kindIcons = { draw: "🎨 그림", jar: "🫙 고마움", letter: "💌 엽서", write: "📝 메모" };
    listEl.innerHTML = items.map((it) =>
      '<article class="gallery-card">' +
        '<div class="gallery-card-head"><span>' + (kindIcons[it.kind] || "💛 기록") + '</span><small>' + (it.date || '') + '</small></div>' +
        '<h4>' + it.title + '</h4>' +
        '<div class="gallery-body">' + it.body + '</div>' +
      '</article>'
    ).join("");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyEmotionPrefs(prefs) {
  if (!prefs) return;
  emState.easyMode = !!prefs.easyMode;
  syncEmotionButtons();
  renderMoodCards();
  if (currentMood && document.getElementById("methodStage").classList.contains("visible")) {
    const openAct = document.getElementById("detail").classList.contains("open") ? currentActivity : null;
    chooseMood(currentMood, false);
    if (openAct) {
      const m = moods[currentMood];
      if (m && m.methods[openAct.index]) showDetail(m.methods[openAct.index], openAct.index);
    }
  }
}

(function bindEmotionToolbar() {
  const btnSpeak = document.getElementById("btnEmotionSpeak");
  const btnEasy = document.getElementById("btnEmotionEasy");
  const btnBreathe = document.getElementById("btnQuickBreathe");
  const btnFullscreen = document.getElementById("btnEmotionFullscreen");
  const btnStudio = document.getElementById("btnFreeStudio");
  const btnStudioHome = document.getElementById("btnOpenStudioFromHome");
  const btnGallery = document.getElementById("btnMindGallery");
  const btnRand = document.getElementById("btnRandomAct");
  const btnClearGal = document.getElementById("btnClearGallery");

  if (btnStudio) btnStudio.onclick = () => openFreeStudio("all");
  if (btnStudioHome) btnStudioHome.onclick = () => openFreeStudio("all");
  if (btnGallery) btnGallery.onclick = () => openMindGallery();
  if (btnRand) {
    btnRand.onclick = () => {
      const pick = STUDIO_CATALOG[Math.floor(Math.random() * STUDIO_CATALOG.length)];
      openFreeActivity(pick.type);
    };
  }
  if (btnClearGal) {
    btnClearGal.onclick = () => {
      try { localStorage.removeItem(EM_GALLERY_KEY); } catch (e) {}
      refreshMindGalleryBadge();
      openMindGallery();
    };
  }
  renderFreeMixer();
  refreshMindGalleryBadge();

  if (btnSpeak) {
    btnSpeak.onclick = () => {
      if (emState.step === 1) {
        speakEmotion("지금 내 마음을 골라봐요. 기쁨, 슬픔, 화남, 놀람 중에서 고를 수 있어요.");
      } else if (emState.step === 2) {
        const m = moods[currentMood];
        speakEmotion((m ? m.adj + " 마음이에요. " : "") + "아래에서 마음을 돌보는 방법을 하나 골라봐요.");
      } else if (currentActivity) {
        const steps = (emState.easyMode && EASY_ACTION_STEPS[currentActivity.type]) ? EASY_ACTION_STEPS[currentActivity.type] : (ACTION_STEPS[currentActivity.type] || []);
        speakEmotion(currentActivity.title + ". " + steps.join(" "));
      }
    };
  }
  if (btnEasy) {
    btnEasy.onclick = () => {
      emState.easyMode = !emState.easyMode;
      if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
        window.D1Bridge.setSpedPrefs({ easyMode: emState.easyMode });
      } else {
        applyEmotionPrefs({ easyMode: emState.easyMode });
      }
    };
  }
  if (btnBreathe) {
    btnBreathe.onclick = () => {
      chooseMood(currentMood || "angry", false);
      showDetail(["breathe", "천천히 숨 쉬기", "코로 천천히 들이쉬고 입으로 길게 내쉬어요.", "숨이 길어지면 마음이 한결 편안해져요."], 0);
      speakEmotion("천천히 숨을 쉬어요. 코로 들이쉬고 입으로 길게 내쉬어요.");
    };
  }
  if (btnFullscreen && window.D1Bridge && window.D1Bridge.bindFullscreenButton) {
    window.D1Bridge.bindFullscreenButton(btnFullscreen, {
      enterText: "⛶ 전체화면",
      exitText: "⛶ 창모드",
      activeClass: "on"
    });
  }

  if (window.D1Bridge && window.D1Bridge.getSpedPrefs) {
    applyEmotionPrefs(window.D1Bridge.getSpedPrefs());
  } else {
    syncEmotionButtons();
  }
  if (window.D1Bridge && window.D1Bridge.onSpedPrefsChange) {
    window.D1Bridge.onSpedPrefsChange(applyEmotionPrefs);
  }
  updateNowNext(1);
})();
