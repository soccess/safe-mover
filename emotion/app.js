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

document.getElementById("heroArt").innerHTML = heroSVG();
const moodCards = document.getElementById("moodCards");
Object.entries(moods).forEach(([key, m]) => {
  const card = document.createElement("button");
  card.className = "mood-card";
  card.dataset.mood = key;
  card.setAttribute("aria-label", m.label + " 선택");
  card.innerHTML =
    '<div class="mood-picture">' + faceSvg(key) + "</div>" +
    '<div class="mood-label">' + m.label + '<span class="mood-arrow">↗</span></div>' +
    '<p class="mood-desc">' + m.description + "</p>";
  card.onclick = () => chooseMood(key);
  moodCards.append(card);
});

let currentMood = "";
let currentActivity = null;

function chooseMood(key) {
  disposeTablet();
  currentMood = key;
  const m = moods[key];
  document.getElementById("homeStage").classList.remove("visible");
  document.getElementById("methodStage").classList.add("visible");

  const banner = document.getElementById("chosenBanner");
  banner.style.background = m.color;
  banner.innerHTML =
    faceSvg(key) +
    "<div><h2>나는 지금 " + m.adj + " 마음이에요</h2><p>" + m.tagline + " " + m.moodLine + "</p></div>" +
    '<span class="badge">' + m.face + " " + m.label + " 마음 날씨</span>";

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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDetail(item, index) {
  const [type, title, sub, tip] = item;
  currentActivity = { type, title, index };
  const m = moods[currentMood];
  const steps = ACTION_STEPS[type] || ACTION_STEPS.talk;
  const detail = document.getElementById("detail");
  detail.style.gridTemplateColumns = "";
  detail.innerHTML =
    '<div class="detail-art">' + sceneSVG(type, currentMood, true) + "</div>" +
    '<div class="detail-copy">' +
      '<div class="detail-kicker">' + m.face + " " + m.adj + " 마음 돌보기 · 방법 " + (index + 1) + "</div>" +
      "<h3>" + title + "</h3>" +
      '<p class="intro">' + sub + "</p>" +
      '<ol class="steps">' + steps.map((s, i) => '<li><span class="step-no">' + (i + 1) + "</span><span>" + s + "</span></li>").join("") + "</ol>" +
      '<div class="say-box">💬 ' + tip + "</div>" +
      '<div id="donePanel" class="done-panel">🌷 잘했어요! 내 마음을 돌보는 멋진 연습을 했어요.</div>' +
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

  detail.classList.add("open");
  disposeTablet();
  initTablet(type);
  document.getElementById("p3").className = "dot active";
  setTimeout(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

function markDone() {
  document.getElementById("donePanel").classList.add("show");
  document.getElementById("p3").className = "dot done";
  taConfetti();
  if (window.TursoBridge && currentMood) {
    const m = moods[currentMood] || { label: currentMood };
    const title = currentActivity ? currentActivity.title : "마음 돌보기";
    window.TursoBridge.saveRecord({
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
  document.getElementById("methodCards").scrollIntoView({ behavior: "smooth", block: "start" });
}

function goHome() {
  disposeTablet();
  document.getElementById("methodStage").classList.remove("visible");
  document.getElementById("homeStage").classList.add("visible");
  document.getElementById("p1").className = "dot active";
  document.getElementById("p2").className = "dot";
  document.getElementById("p3").className = "dot";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
