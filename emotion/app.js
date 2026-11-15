"use strict";

function initTablet(type) {
  const stage = document.getElementById("taStage");
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
  afterMood: ""
};

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
  document.getElementById("homeStage").classList.remove("visible");
  document.getElementById("methodStage").classList.add("visible");

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
  document.getElementById("methodStage").classList.remove("visible");
  document.getElementById("homeStage").classList.add("visible");
  document.getElementById("p1").className = "dot active";
  document.getElementById("p2").className = "dot";
  document.getElementById("p3").className = "dot";
  updateNowNext(1);
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
