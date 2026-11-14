"use strict";

/* ============================================================
   Cloudflare D1 DB 브라우저 브리지 + 학생 캐릭터 로그인 & 교사 모드
   - GitHub Pages(정적 호스팅), 로컬 서버, 파일 환경 모두 지원
   - 학생은 캐릭터로만 표현하며, 교사는 반명 입력 및 D1 DB 조작 가능
   ============================================================ */
(() => {
  const CLASS_KEY = "safe_mover.class_name.v1";
  const CHAR_KEY = "safe_mover.character_id.v1";
  const PIN_KEY = "safe_mover.teacher_pin.v1";
  const API_OVERRIDE_KEY = "safe_mover.d1_api.v1";
  const DEFAULT_D1_API = "https://safe-mover-d1-api.school-guardian.workers.dev";
  const DEFAULT_PIN = "1234";

  let serverAvailable = null;
  let teacherUnlocked = false;

  const CHARACTERS = [
    { id: "bunny", name: "토끼", emoji: "🐰", bg: "#ffe4e6", accent: "#fb7185" },
    { id: "bear", name: "곰돌이", emoji: "🐻", bg: "#fef3c7", accent: "#d97706" },
    { id: "fox", name: "여우", emoji: "🦊", bg: "#ffedd5", accent: "#ea580c" },
    { id: "cat", name: "고양이", emoji: "🐱", bg: "#f3e8ff", accent: "#9333ea" },
    { id: "panda", name: "판다", emoji: "🐼", bg: "#e2e8f0", accent: "#334155" },
    { id: "chick", name: "병아리", emoji: "🐥", bg: "#fef9c3", accent: "#eab308" },
    { id: "dino", name: "공룡", emoji: "🦕", bg: "#dcfce7", accent: "#16a34a" },
    { id: "penguin", name: "펭귄", emoji: "🐧", bg: "#dbeafe", accent: "#2563eb" }
  ];

  const GAME_LABELS = {
    safe_mover: "읽걷이의 맞춤법 모험",
    stepmath: "수학 공책",
    emotion: "마음 날씨 연구소",
    cafe: "마음카페 3D"
  };

  const SAFE_MOVER_CUSTOM_KEY = "safe_mover.custom_words.v1";
  const STEPMATH_CUSTOM_KEY = "stepmath.custom_content.v1";

  function detectCurrentGame() {
    const p = (location.pathname || "").toLowerCase();
    if (p.includes("safe_mover")) return "safe_mover";
    if (p.includes("stepmath")) return "stepmath";
    if (p.includes("emotion")) return "emotion";
    if (p.includes("/cafe")) return "cafe";
    return "";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[ch]));
  }

  function charSvg(id, size = 38) {
    const c = getCharacter(id);
    const faceMap = {
      bunny: `<ellipse cx="18" cy="12" rx="4.5" ry="10" fill="#fff" stroke="#fda4af" stroke-width="1.8"/><ellipse cx="30" cy="12" rx="4.5" ry="10" fill="#fff" stroke="#fda4af" stroke-width="1.8"/><circle cx="24" cy="28" r="12" fill="#fff" stroke="#fda4af" stroke-width="1.8"/><circle cx="19.5" cy="26" r="1.8" fill="#334155"/><circle cx="28.5" cy="26" r="1.8" fill="#334155"/><ellipse cx="24" cy="29.5" rx="2.2" ry="1.5" fill="#fb7185"/>`,
      bear: `<circle cx="14" cy="16" r="5" fill="#b45309"/><circle cx="34" cy="16" r="5" fill="#b45309"/><circle cx="24" cy="26" r="12.5" fill="#d97706"/><ellipse cx="24" cy="29" rx="5" ry="4" fill="#fde68a"/><circle cx="19.5" cy="24" r="1.8" fill="#1e293b"/><circle cx="28.5" cy="24" r="1.8" fill="#1e293b"/><circle cx="24" cy="28" r="2" fill="#451a03"/>`,
      fox: `<polygon points="12,22 14,10 22,18" fill="#ea580c"/><polygon points="36,22 34,10 26,18" fill="#ea580c"/><circle cx="24" cy="27" r="12" fill="#f97316"/><path d="M13 28q11 9 22 0q-11 11-22 0z" fill="#fff7ed"/><circle cx="19.5" cy="25" r="1.8" fill="#1e293b"/><circle cx="28.5" cy="25" r="1.8" fill="#1e293b"/><circle cx="24" cy="30" r="1.8" fill="#1e293b"/>`,
      cat: `<polygon points="13,22 14,11 21,18" fill="#a855f7"/><polygon points="35,22 34,11 27,18" fill="#a855f7"/><circle cx="24" cy="27" r="12" fill="#e9d5ff" stroke="#a855f7" stroke-width="1.6"/><circle cx="19.5" cy="25.5" r="1.8" fill="#3b0764"/><circle cx="28.5" cy="25.5" r="1.8" fill="#3b0764"/><path d="M22 29.5q2 2 4 0" fill="none" stroke="#9333ea" stroke-width="1.6" stroke-linecap="round"/>`,
      panda: `<circle cx="14" cy="16" r="4.8" fill="#1e293b"/><circle cx="34" cy="16" r="4.8" fill="#1e293b"/><circle cx="24" cy="26" r="12.5" fill="#fff" stroke="#334155" stroke-width="1.6"/><ellipse cx="19" cy="25" rx="3.4" ry="2.8" fill="#1e293b"/><ellipse cx="29" cy="25" rx="3.4" ry="2.8" fill="#1e293b"/><circle cx="19" cy="25" r="1.1" fill="#fff"/><circle cx="29" cy="25" r="1.1" fill="#fff"/><circle cx="24" cy="29.5" r="1.8" fill="#1e293b"/>`,
      chick: `<path d="M22 13q2-5 5-2" fill="none" stroke="#eab308" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="27" r="12.5" fill="#fde047" stroke="#eab308" stroke-width="1.6"/><circle cx="19.5" cy="25" r="1.8" fill="#1e293b"/><circle cx="28.5" cy="25" r="1.8" fill="#1e293b"/><polygon points="21,28 27,28 24,32" fill="#f97316"/>`,
      dino: `<circle cx="24" cy="27" r="12" fill="#4ade80" stroke="#16a34a" stroke-width="1.6"/><circle cx="19" cy="14" r="2.6" fill="#22c55e"/><circle cx="25" cy="13" r="2.6" fill="#22c55e"/><circle cx="31" cy="15" r="2.4" fill="#22c55e"/><circle cx="19.5" cy="25" r="1.8" fill="#14532d"/><circle cx="28.5" cy="25" r="1.8" fill="#14532d"/><path d="M19 30q5 4 10 0" fill="none" stroke="#14532d" stroke-width="1.8" stroke-linecap="round"/>`,
      penguin: `<circle cx="24" cy="26" r="12.5" fill="#1d4ed8"/><path d="M15 27c0-6 4-9 9-9s9 3 9 9c0 6-4 9-9 9s-9-3-9-9z" fill="#fff"/><circle cx="20" cy="24" r="1.7" fill="#0f172a"/><circle cx="28" cy="24" r="1.7" fill="#0f172a"/><polygon points="21.5,27 26.5,27 24,30.5" fill="#f59e0b"/>`
    };
    return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="${c.bg}" stroke="${c.accent}" stroke-width="2"/>${faceMap[c.id] || faceMap.bunny}</svg>`;
  }

  function getApiBase() {
    try {
      const qs = new URLSearchParams(location.search);
      const fromQuery = (qs.get("d1_api") || "").trim();
      if (fromQuery) {
        const clean = fromQuery.replace(/\/+$/, "");
        localStorage.setItem(API_OVERRIDE_KEY, clean);
        return clean;
      }
      if (typeof window.D1_API_BASE === "string" && window.D1_API_BASE.trim()) {
        return window.D1_API_BASE.trim().replace(/\/+$/, "");
      }
      const saved = (localStorage.getItem(API_OVERRIDE_KEY) || "").trim();
      if (saved) return saved.replace(/\/+$/, "");
    } catch (e) { /* 무시 */ }
    return DEFAULT_D1_API;
  }

  function setApiBase(url) {
    const clean = String(url || "").trim().replace(/\/+$/, "");
    try {
      if (clean) localStorage.setItem(API_OVERRIDE_KEY, clean);
      else localStorage.removeItem(API_OVERRIDE_KEY);
    } catch (e) { /* 무시 */ }
    serverAvailable = null;
    return getApiBase();
  }

  function getClassName() {
    try {
      const saved = (localStorage.getItem(CLASS_KEY) || "").trim();
      return saved || "기본반";
    } catch (e) {
      return "기본반";
    }
  }

  function setClassName(name) {
    const clean = String(name || "").trim().slice(0, 40) || "기본반";
    try { localStorage.setItem(CLASS_KEY, clean); } catch (e) { /* 무시 */ }
    notifyProfileChange();
    return clean;
  }

  function getCharacterId() {
    try {
      const saved = (localStorage.getItem(CHAR_KEY) || "").trim();
      if (CHARACTERS.some((c) => c.id === saved)) return saved;
    } catch (e) { /* 무시 */ }
    return CHARACTERS[0].id;
  }

  function getCharacter(id) {
    const target = id || getCharacterId();
    return CHARACTERS.find((c) => c.id === target) || CHARACTERS[0];
  }

  function setCharacterId(id) {
    const charObj = getCharacter(id);
    try { localStorage.setItem(CHAR_KEY, charObj.id); } catch (e) { /* 무시 */ }
    notifyProfileChange();
    return charObj;
  }

  // 학생은 캐릭터로만 표현
  function getStudentName() {
    const c = getCharacter();
    return `${c.emoji} ${c.name}`;
  }

  function setStudentName(idOrName) {
    const found = CHARACTERS.find((c) => c.id === idOrName || c.name === idOrName || `${c.emoji} ${c.name}` === idOrName);
    if (found) setCharacterId(found.id);
    return getStudentName();
  }

  async function apiFetch(path, options) {
    const base = getApiBase();
    try {
      const res = await fetch(base + path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...((options && options.headers) || {})
        }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function checkHealth(force) {
    if (!force && serverAvailable === false) {
      return { ok: false, error: "offline" };
    }
    const data = await apiFetch("/api/health", { method: "GET" });
    if (data && data.ok) {
      serverAvailable = true;
      return data;
    }
    serverAvailable = false;
    return data || { ok: false, error: "Cloudflare D1 API 연결 불가" };
  }

  async function getClasses() {
    const data = await apiFetch("/api/classes", { method: "GET" });
    if (data && data.ok && Array.isArray(data.classes)) {
      return data.classes;
    }
    return [{ name: getClassName(), created_at: "" }];
  }

  async function saveClass(name) {
    const clean = String(name || "").trim().slice(0, 40);
    if (!clean) return { ok: false, error: "반명을 입력하세요." };
    setClassName(clean);
    const res = await apiFetch("/api/classes", {
      method: "POST",
      body: JSON.stringify({ name: clean })
    });
    return res || { ok: false, error: "D1 저장 실패" };
  }

  async function deleteClass(name) {
    const clean = String(name || "").trim();
    if (!clean || clean === "기본반") return { ok: false, error: "기본반은 삭제할 수 없습니다." };
    const res = await apiFetch("/api/classes?name=" + encodeURIComponent(clean), { method: "DELETE" });
    if (getClassName() === clean) setClassName("기본반");
    return res || { ok: false };
  }

  async function saveRecord(record) {
    const charObj = getCharacter(record.character_id);
    const body = {
      game: record.game || "unknown",
      class_name: record.class_name || getClassName(),
      character_id: charObj.id,
      student_name: record.student_name || `${charObj.emoji} ${charObj.name}`,
      stage: record.stage || "",
      score: Number(record.score || 0),
      summary: record.summary || "",
      payload: record.payload || {}
    };
    return await apiFetch("/api/records", {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  async function getRecords(gameOrOpts = "", limit = 50) {
    const qs = new URLSearchParams();
    if (typeof gameOrOpts === "object" && gameOrOpts !== null) {
      if (gameOrOpts.game) qs.set("game", gameOrOpts.game);
      if (gameOrOpts.class_name) qs.set("class_name", gameOrOpts.class_name);
      if (gameOrOpts.character_id) qs.set("character_id", gameOrOpts.character_id);
      qs.set("limit", String(gameOrOpts.limit || 50));
    } else {
      if (gameOrOpts) qs.set("game", gameOrOpts);
      qs.set("limit", String(limit));
    }
    const data = await apiFetch("/api/records?" + qs.toString(), { method: "GET" });
    return (data && data.ok && Array.isArray(data.records)) ? data.records : [];
  }

  async function updateRecord(id, fields) {
    return await apiFetch("/api/records", {
      method: "PATCH",
      body: JSON.stringify({ id, ...fields })
    });
  }

  async function deleteRecord(id) {
    return await apiFetch("/api/records?id=" + encodeURIComponent(String(id)), {
      method: "DELETE"
    });
  }

  async function deleteRecordsBulk(opts = {}) {
    const qs = new URLSearchParams();
    if (opts.game) qs.set("game", opts.game);
    if (opts.class_name) qs.set("class_name", opts.class_name);
    if (opts.all) qs.set("all", "1");
    return await apiFetch("/api/records?" + qs.toString(), {
      method: "DELETE"
    });
  }

  async function setKV(key, value) {
    const scopedKey = `${getClassName()}::${getCharacterId()}::${key}`;
    return await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: scopedKey, value })
    });
  }

  async function getKV(key) {
    const scopedKey = `${getClassName()}::${getCharacterId()}::${key}`;
    const data = await apiFetch("/api/kv?key=" + encodeURIComponent(scopedKey), { method: "GET" });
    if (!data || !data.found || !data.item) return null;
    try { return JSON.parse(data.item.v); } catch (e) { return data.item.v; }
  }

  async function getTeacherPin() {
    const data = await apiFetch("/api/kv?key=" + encodeURIComponent(PIN_KEY), { method: "GET" });
    if (data && data.found && data.item && data.item.v) {
      try {
        const parsed = JSON.parse(data.item.v);
        if (parsed) return String(parsed);
      } catch {
        return String(data.item.v);
      }
    }
    try {
      return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  }

  async function setTeacherPin(newPin) {
    const clean = String(newPin || "").trim() || DEFAULT_PIN;
    try { localStorage.setItem(PIN_KEY, clean); } catch {}
    await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: PIN_KEY, value: clean })
    });
    return clean;
  }

  function loadCustomWordsLocal() {
    try {
      const raw = localStorage.getItem(SAFE_MOVER_CUSTOM_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  async function saveCustomWords(list) {
    const clean = Array.isArray(list) ? list : [];
    try { localStorage.setItem(SAFE_MOVER_CUSTOM_KEY, JSON.stringify(clean)); } catch {}
    await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: SAFE_MOVER_CUSTOM_KEY, value: clean })
    });
    return clean;
  }

  function loadCustomMathLocal() {
    try {
      const raw = localStorage.getItem(STEPMATH_CUSTOM_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return {
        examples: obj && obj.examples ? obj.examples : {},
        problems: obj && obj.problems ? obj.problems : {}
      };
    } catch { return { examples: {}, problems: {} }; }
  }

  async function saveCustomMath(obj) {
    const clean = {
      examples: obj && obj.examples ? obj.examples : {},
      problems: obj && obj.problems ? obj.problems : {}
    };
    try { localStorage.setItem(STEPMATH_CUSTOM_KEY, JSON.stringify(clean)); } catch {}
    await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: STEPMATH_CUSTOM_KEY, value: clean })
    });
    if (typeof window.applyCurriculumToApp === "function") {
      window.applyCurriculumToApp();
    }
    return clean;
  }

  async function syncCustomContentFromD1() {
    try {
      const w = await apiFetch("/api/kv?key=" + encodeURIComponent(SAFE_MOVER_CUSTOM_KEY), { method: "GET" });
      if (w && w.found && w.item && w.item.v) {
        const parsed = typeof w.item.v === "string" ? JSON.parse(w.item.v) : w.item.v;
        if (Array.isArray(parsed)) localStorage.setItem(SAFE_MOVER_CUSTOM_KEY, JSON.stringify(parsed));
      }
      const m = await apiFetch("/api/kv?key=" + encodeURIComponent(STEPMATH_CUSTOM_KEY), { method: "GET" });
      if (m && m.found && m.item && m.item.v) {
        const parsed = typeof m.item.v === "string" ? JSON.parse(m.item.v) : m.item.v;
        if (parsed && typeof parsed === "object") {
          localStorage.setItem(STEPMATH_CUSTOM_KEY, JSON.stringify(parsed));
          if (typeof window.applyCurriculumToApp === "function") window.applyCurriculumToApp();
        }
      }
    } catch (_) {}
  }

  // ============================================================
  // 공용 UI: 학생 캐릭터 로그인 모달 + 교사 모드(D1 DB 조작) 모달
  // ============================================================
  const listeners = new Set();
  function onProfileChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function notifyProfileChange() {
    updateFloatingPill();
    listeners.forEach((fn) => {
      try { fn({ className: getClassName(), character: getCharacter() }); } catch {}
    });
  }

  function injectSharedStyles() {
    if (document.getElementById("d1SharedModalStyles")) return;
    const st = document.createElement("style");
    st.id = "d1SharedModalStyles";
    st.textContent = `
      .d1-float-bar{position:fixed;right:14px;bottom:14px;z-index:9990;display:flex;align-items:center;gap:6px;background:rgba(15,23,42,.88);backdrop-filter:blur(8px);color:#f8fafc;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);box-shadow:0 8px 24px rgba(0,0,0,.22);font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;font-size:13px}
      .d1-float-btn{display:inline-flex;align-items:center;gap:6px;border:0;background:rgba(255,255,255,.12);color:#fff;padding:5px 10px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;transition:background .15s}
      .d1-float-btn:hover{background:rgba(255,255,255,.22)}
      .d1-float-btn.teacher{background:rgba(245,158,11,.24);color:#fde68a}
      .d1-float-btn.teacher:hover{background:rgba(245,158,11,.36)}
      .d1-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.58);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:16px;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif}
      .d1-modal-backdrop.open{display:flex}
      .d1-modal-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:#ffffff;color:#0f172a;border-radius:22px;padding:22px;box-shadow:0 24px 60px rgba(15,23,42,.35);border:1px solid #e2e8f0}
      .d1-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e2e8f0}
      .d1-modal-head h2{margin:0;font-size:19px;display:flex;align-items:center;gap:8px}
      .d1-close-btn{border:1px solid #cbd5e1;background:#f8fafc;color:#334155;border-radius:10px;padding:6px 12px;font-weight:700;cursor:pointer}
      .d1-char-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px;margin:12px 0}
      .d1-char-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:16px;border:2px solid #e2e8f0;background:#f8fafc;cursor:pointer;transition:transform .15s,border-color .15s,background .15s;font:inherit;font-weight:800;color:#1e293b}
      .d1-char-card:hover{transform:translateY(-2px);border-color:#93c5fd;background:#eff6ff}
      .d1-char-card.active{border-color:#2563eb;background:#dbeafe;box-shadow:0 4px 12px rgba(37,99,235,.18)}
      .d1-class-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
      .d1-chip{border:1px solid #cbd5e1;background:#f1f5f9;color:#1e293b;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;font-size:13px}
      .d1-chip.active{background:#0284c7;border-color:#0284c7;color:#fff}
      .d1-t-section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:12px}
      .d1-t-section h3{margin:0 0 8px;font-size:14px;color:#334155}
      .d1-input{border:1px solid #cbd5e1;border-radius:10px;padding:7px 11px;font:inherit;font-size:13px;background:#fff;color:#0f172a}
      .d1-btn-sm{border:1px solid #cbd5e1;background:#fff;color:#1e293b;border-radius:10px;padding:7px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
      .d1-btn-sm.primary{background:#2563eb;border-color:#2563eb;color:#fff}
      .d1-btn-sm.danger{background:#fee2e2;border-color:#fca5a5;color:#b91c1c}
      .d1-table-wrap{max-height:280px;overflow:auto;border:1px solid #e2e8f0;border-radius:12px;background:#fff}
      .d1-table{width:100%;border-collapse:collapse;font-size:12.5px}
      .d1-table th,.d1-table td{padding:8px 8px;border-bottom:1px solid #f1f5f9;text-align:left;vertical-align:middle}
      .d1-table th{background:#f8fafc;position:sticky;top:0;font-weight:800;color:#475569}
      .d1-msg{font-size:12.5px;color:#0369a1;font-weight:700;margin-top:6px;min-height:18px}
    `;
    document.head.appendChild(st);
  }

  function ensureModals() {
    injectSharedStyles();
    if (!document.getElementById("d1StudentModal")) {
      const m = document.createElement("div");
      m.id = "d1StudentModal";
      m.className = "d1-modal-backdrop";
      m.innerHTML = `
        <div class="d1-modal-card" role="dialog" aria-modal="true" aria-label="학생 캐릭터 로그인">
          <div class="d1-modal-head">
            <h2>🎨 내 캐릭터 선택 로그인</h2>
            <button type="button" class="d1-close-btn" data-close-modal="d1StudentModal">닫기</button>
          </div>
          <div style="font-size:13px;color:#475569;margin-bottom:6px">선생님이 만든 반을 고르고, 내 캐릭터를 눌러 로그인해요!</div>
          <div class="d1-class-row" id="d1StudentClassChips"></div>
          <div class="d1-char-grid" id="d1StudentCharGrid"></div>
          <div class="d1-msg" id="d1StudentMsg"></div>
        </div>
      `;
      m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("open"); });
      document.body.appendChild(m);
    }

    if (!document.getElementById("d1TeacherModal")) {
      const t = document.createElement("div");
      t.id = "d1TeacherModal";
      t.className = "d1-modal-backdrop";
      t.innerHTML = `
        <div class="d1-modal-card" role="dialog" aria-modal="true" aria-label="교사 모드 DB 관리">
          <div class="d1-modal-head">
            <h2>👩‍🏫 교사 모드 · Cloudflare D1 DB 관리</h2>
            <button type="button" class="d1-close-btn" data-close-modal="d1TeacherModal">닫기</button>
          </div>
          <div id="d1TeacherAuthBox" class="d1-t-section">
            <h3>교사 확인 (기본 PIN: 1234)</h3>
            <div class="d1-class-row">
              <input type="password" id="d1TeacherPinInput" class="d1-input" placeholder="교사 PIN 입력" maxlength="12" />
              <button type="button" class="d1-btn-sm primary" id="d1TeacherPinBtn">확인</button>
            </div>
            <div class="d1-msg" id="d1TeacherAuthMsg"></div>
          </div>
          <div id="d1TeacherBody" style="display:none">
            <div class="d1-t-section">
              <h3>1. 반명 입력 및 D1 등록 (학생 화면에 반 선택으로 표시)</h3>
              <div class="d1-class-row">
                <input type="text" id="d1NewClassInput" class="d1-input" placeholder="예: 해바라기반" maxlength="40" />
                <button type="button" class="d1-btn-sm primary" id="d1SaveClassBtn">반 저장 및 적용</button>
                <span style="font-size:12px;color:#64748b">현재 반: <b id="d1CurrentClassLabel"></b></span>
              </div>
              <div class="d1-class-row" id="d1TeacherClassList"></div>
            </div>

            <div class="d1-t-section">
              <h3>2. D1 학습 기록 조회 및 조작</h3>
              <div class="d1-class-row">
                <select id="d1FilterGame" class="d1-input">
                  <option value="">전체 앱</option>
                  <option value="safe_mover">읽걷이의 맞춤법 모험</option>
                  <option value="stepmath">수학 공책</option>
                  <option value="emotion">마음 날씨 연구소</option>
                  <option value="cafe">마음카페 3D</option>
                </select>
                <select id="d1FilterClass" class="d1-input"><option value="">전체 반</option></select>
                <select id="d1FilterChar" class="d1-input"><option value="">전체 캐릭터</option></select>
                <button type="button" class="d1-btn-sm primary" id="d1ReloadRecordsBtn">조회</button>
                <button type="button" class="d1-btn-sm" id="d1ExportCsvBtn">CSV 저장</button>
                <button type="button" class="d1-btn-sm danger" id="d1BulkDeleteBtn">선택 조건 일괄 삭제</button>
              </div>
              <div class="d1-table-wrap">
                <table class="d1-table">
                  <thead>
                    <tr><th>ID</th><th>반</th><th>캐릭터</th><th>앱</th><th>단계</th><th>점수</th><th>요약</th><th>조작</th></tr>
                  </thead>
                  <tbody id="d1TeacherRecordsBody"></tbody>
                </table>
              </div>
              <div class="d1-msg" id="d1TeacherMsg"></div>
            </div>

            <div class="d1-t-section">
              <h3>3. 교사 PIN 변경</h3>
              <div class="d1-class-row">
                <input type="password" id="d1ChangePinInput" class="d1-input" placeholder="새 PIN (4자리 이상)" maxlength="12" />
                <button type="button" class="d1-btn-sm" id="d1ChangePinBtn">PIN 변경</button>
              </div>
            </div>

            <div class="d1-t-section">
              <h3>4. 수업 자료 직접 입력 · 적용 (맞춤법 단어 / 수학 공책 예제·문제)</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px">
                  <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:6px">📖 1번: 읽걷이의 맞춤법 모험 단어 추가</div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <input type="text" id="d1CwCorrect" class="d1-input" placeholder="바른 단어 (예: 고구마)" style="flex:1;min-width:110px" />
                    <input type="text" id="d1CwWrong" class="d1-input" placeholder="틀린 단어 (예: 고꾸마)" style="flex:1;min-width:110px" />
                  </div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <input type="text" id="d1CwTip" class="d1-input" placeholder="짧은 설명 (예: '고구마'가 맞아요)" style="flex:1;min-width:140px" />
                    <select id="d1CwTier" class="d1-input">
                      <option value="all">전체 단계</option>
                      <option value="tier1">1~3단계</option>
                      <option value="tier2">4~6단계</option>
                      <option value="tier3">7~9단계</option>
                      <option value="tier4">10~12단계</option>
                    </select>
                  </div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <button type="button" class="d1-btn-sm primary" id="d1CwAddBtn">단어 추가 및 적용</button>
                    <button type="button" class="d1-btn-sm danger" id="d1CwClearBtn">모두 지우기</button>
                  </div>
                  <div id="d1CwList" style="max-height:130px;overflow:auto;font-size:12px;display:flex;flex-direction:column;gap:4px"></div>
                </div>

                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px">
                  <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:6px">🧮 2번: 수학 공책 예제 · 문제 추가</div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <select id="d1CmStage" class="d1-input" style="flex:1"></select>
                    <select id="d1CmType" class="d1-input">
                      <option value="problem">문제 추가</option>
                      <option value="example">예제 추가</option>
                    </select>
                  </div>
                  <div id="d1CmProblemBox">
                    <div class="d1-class-row" style="margin-bottom:5px">
                      <input type="text" id="d1CmPrompt" class="d1-input" placeholder="문제 내용 (예: 사과 4개와 3개를 모으면?)" style="width:100%" />
                    </div>
                    <div class="d1-class-row" style="margin-bottom:5px">
                      <input type="text" id="d1CmC1" class="d1-input" placeholder="보기 1" style="flex:1;min-width:70px" />
                      <input type="text" id="d1CmC2" class="d1-input" placeholder="보기 2" style="flex:1;min-width:70px" />
                      <input type="text" id="d1CmC3" class="d1-input" placeholder="보기 3" style="flex:1;min-width:70px" />
                      <select id="d1CmAns" class="d1-input">
                        <option value="0">정답: 보기1</option>
                        <option value="1">정답: 보기2</option>
                        <option value="2">정답: 보기3</option>
                      </select>
                    </div>
                    <div class="d1-class-row" style="margin-bottom:6px">
                      <input type="text" id="d1CmHint" class="d1-input" placeholder="힌트 (선택)" style="flex:1" />
                      <input type="text" id="d1CmOk" class="d1-input" placeholder="정답 칭찬 말 (선택)" style="flex:1" />
                    </div>
                  </div>
                  <div id="d1CmExampleBox" style="display:none">
                    <div class="d1-class-row" style="margin-bottom:5px">
                      <input type="text" id="d1CmExTitle" class="d1-input" placeholder="예제 제목 (예: 사탕 모으기)" style="flex:1" />
                      <input type="text" id="d1CmExVisual" class="d1-input" placeholder="식/그림 (예: 3 + 2 = 5)" style="flex:1" />
                    </div>
                    <div class="d1-class-row" style="margin-bottom:5px">
                      <input type="text" id="d1CmExProblem" class="d1-input" placeholder="예제 문제 설명" style="width:100%" />
                    </div>
                    <div class="d1-class-row" style="margin-bottom:6px">
                      <input type="text" id="d1CmExSteps" class="d1-input" placeholder="풀이 순서 (쉼표 , 로 구분)" style="width:100%" />
                    </div>
                  </div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <button type="button" class="d1-btn-sm primary" id="d1CmAddBtn">추가 및 적용</button>
                    <button type="button" class="d1-btn-sm danger" id="d1CmClearBtn">모두 지우기</button>
                  </div>
                  <div id="d1CmList" style="max-height:130px;overflow:auto;font-size:12px;display:flex;flex-direction:column;gap:4px"></div>
                </div>
              </div>
              <div class="d1-msg" id="d1CustomMsg"></div>
            </div>
          </div>
        </div>
      `;
      t.addEventListener("click", (e) => { if (e.target === t) t.classList.remove("open"); });
      document.body.appendChild(t);
      bindTeacherEvents();
    }

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.closeModal);
        if (target) target.classList.remove("open");
      });
    });
  }

  async function openStudentLoginModal() {
    ensureModals();
    const modal = document.getElementById("d1StudentModal");
    modal.classList.add("open");
    const classWrap = document.getElementById("d1StudentClassChips");
    const grid = document.getElementById("d1StudentCharGrid");
    const msg = document.getElementById("d1StudentMsg");
    msg.textContent = "반 목록을 불러오는 중...";

    const classes = await getClasses();
    const curClass = getClassName();
    classWrap.innerHTML = classes.map((c) => (
      `<button type="button" class="d1-chip ${c.name === curClass ? "active" : ""}" data-cls="${esc(c.name)}">${esc(c.name)}</button>`
    )).join("");
    classWrap.querySelectorAll("[data-cls]").forEach((b) => {
      b.addEventListener("click", () => {
        setClassName(b.dataset.cls);
        classWrap.querySelectorAll(".d1-chip").forEach((x) => x.classList.toggle("active", x === b));
        msg.textContent = `${b.dataset.cls}이(가) 선택되었습니다.`;
      });
    });

    const curChar = getCharacterId();
    grid.innerHTML = CHARACTERS.map((ch) => (
      `<button type="button" class="d1-char-card ${ch.id === curChar ? "active" : ""}" data-chid="${ch.id}">
        ${charSvg(ch.id, 46)}
        <span>${ch.emoji} ${ch.name}</span>
      </button>`
    )).join("");
    grid.querySelectorAll("[data-chid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = setCharacterId(btn.dataset.chid);
        grid.querySelectorAll(".d1-char-card").forEach((x) => x.classList.toggle("active", x === btn));
        msg.textContent = `${getClassName()} · ${chosen.emoji} ${chosen.name} 캐릭터로 로그인되었어요!`;
        setTimeout(() => modal.classList.remove("open"), 480);
      });
    });
    msg.textContent = `현재: ${getClassName()} · ${getStudentName()}`;
  }

  function bindTeacherEvents() {
    const pinBtn = document.getElementById("d1TeacherPinBtn");
    const pinInput = document.getElementById("d1TeacherPinInput");
    const authMsg = document.getElementById("d1TeacherAuthMsg");

    const checkPin = async () => {
      const expected = await getTeacherPin();
      if (pinInput.value.trim() === expected) {
        teacherUnlocked = true;
        document.getElementById("d1TeacherAuthBox").style.display = "none";
        document.getElementById("d1TeacherBody").style.display = "block";
        authMsg.textContent = "";
        refreshTeacherDashboard();
      } else {
        authMsg.textContent = "PIN 번호가 맞지 않습니다. (기본 PIN: 1234)";
      }
    };
    pinBtn.addEventListener("click", checkPin);
    pinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkPin(); });

    document.getElementById("d1SaveClassBtn").addEventListener("click", async () => {
      const inp = document.getElementById("d1NewClassInput");
      const name = inp.value.trim();
      if (!name) return;
      const res = await saveClass(name);
      inp.value = "";
      document.getElementById("d1TeacherMsg").textContent = res && res.ok
        ? `"${name}" 반이 D1 DB에 저장되고 적용되었습니다.`
        : "로컬 반명으로 적용되었습니다 (D1 오프라인).";
      refreshTeacherDashboard();
    });

    document.getElementById("d1ReloadRecordsBtn").addEventListener("click", loadTeacherRecords);
    document.getElementById("d1BulkDeleteBtn").addEventListener("click", async () => {
      const game = document.getElementById("d1FilterGame").value;
      const className = document.getElementById("d1FilterClass").value;
      if (!game && !className) {
        if (!confirm("전체 앱과 전체 반의 모든 학습 기록을 D1 DB에서 삭제할까요?")) return;
        await deleteRecordsBulk({ all: true });
      } else {
        const desc = `${className || "전체 반"} / ${GAME_LABELS[game] || "전체 앱"}`;
        if (!confirm(`[${desc}] 조건의 학습 기록을 D1 DB에서 삭제할까요?`)) return;
        await deleteRecordsBulk({ game, class_name: className });
      }
      document.getElementById("d1TeacherMsg").textContent = "선택한 조건의 D1 기록을 삭제했습니다.";
      loadTeacherRecords();
    });

    document.getElementById("d1ExportCsvBtn").addEventListener("click", async () => {
      const game = document.getElementById("d1FilterGame").value;
      const className = document.getElementById("d1FilterClass").value;
      const charId = document.getElementById("d1FilterChar").value;
      const rows = await getRecords({ game, class_name: className, character_id: charId, limit: 200 });
      const header = ["ID", "반명", "캐릭터", "앱", "단계", "점수", "요약", "일시"];
      const lines = [header.join(",")].concat(rows.map((r) => [
        r.id, r.class_name || "기본반", r.student_name, GAME_LABELS[r.game] || r.game,
        r.stage, r.score, r.summary, r.created_at
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")));
      const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `d1_records_${className || "all"}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });

    document.getElementById("d1ChangePinBtn").addEventListener("click", async () => {
      const val = document.getElementById("d1ChangePinInput").value.trim();
      if (val.length < 4) {
        document.getElementById("d1TeacherMsg").textContent = "PIN은 4자리 이상으로 입력해주세요.";
        return;
      }
      await setTeacherPin(val);
      document.getElementById("d1ChangePinInput").value = "";
      document.getElementById("d1TeacherMsg").textContent = "교사 PIN이 D1 DB에 저장되었습니다.";
    });

    // 4. 교사 직접 입력 자료 (맞춤법 단어 / 수학 공책 예제·문제)
    const stageSel = document.getElementById("d1CmStage");
    if (stageSel && stageSel.options.length === 0) {
      const stageNames = [
        "1. 같은 것끼리 모으기", "2. 1부터 5까지 세기", "3. 6부터 10까지 세기", "4. 11부터 20까지 세기",
        "5. 어느 쪽이 더 많을까", "6. 두 수 모으기 (더하기)", "7. 수 가르기 (빼기)", "8. 10 만들어 더하기",
        "9. 2·5·10씩 뛰어 세기", "10. 수직선 점프 계산", "11. 십과 일 묶어 계산", "12. 백·십·일 세 자리 수",
        "13. 같은 수씩 묶어 곱하기", "14. 똑같이 나누기", "15. 분수 조각", "16. 소수 알아보기",
        "17. 길이·들이·무게", "18. 시계 읽기", "19. 돈 세기와 물건 사기", "20. 도형과 무늬", "21. 그림 그래프"
      ];
      stageSel.innerHTML = stageNames.map((n, idx) => `<option value="${idx + 1}">${n}</option>`).join("");
    }

    document.getElementById("d1CmType").addEventListener("change", (e) => {
      const isEx = e.target.value === "example";
      document.getElementById("d1CmProblemBox").style.display = isEx ? "none" : "block";
      document.getElementById("d1CmExampleBox").style.display = isEx ? "block" : "none";
    });

    document.getElementById("d1CwAddBtn").addEventListener("click", async () => {
      const correct = document.getElementById("d1CwCorrect").value.trim();
      const wrong = document.getElementById("d1CwWrong").value.trim();
      const tip = document.getElementById("d1CwTip").value.trim() || `'${correct}'이(가) 바른 말이에요.`;
      const tier = document.getElementById("d1CwTier").value;
      if (!correct || !wrong) {
        document.getElementById("d1CustomMsg").textContent = "바른 단어와 틀린 단어를 모두 입력해주세요.";
        return;
      }
      const list = loadCustomWordsLocal();
      list.unshift({ correct, wrong, tip, tier });
      await saveCustomWords(list);
      document.getElementById("d1CwCorrect").value = "";
      document.getElementById("d1CwWrong").value = "";
      document.getElementById("d1CwTip").value = "";
      document.getElementById("d1CustomMsg").textContent = `맞춤법 단어 '${correct} / ${wrong}'이(가) 저장·적용되었습니다!`;
      renderCustomWordsList();
    });

    document.getElementById("d1CwClearBtn").addEventListener("click", async () => {
      if (!confirm("교사가 추가한 맞춤법 단어를 모두 삭제할까요?")) return;
      await saveCustomWords([]);
      document.getElementById("d1CustomMsg").textContent = "추가한 맞춤법 단어를 모두 삭제했습니다.";
      renderCustomWordsList();
    });

    document.getElementById("d1CmAddBtn").addEventListener("click", async () => {
      const stg = document.getElementById("d1CmStage").value;
      const mode = document.getElementById("d1CmType").value;
      const data = loadCustomMathLocal();
      if (mode === "example") {
        const title = document.getElementById("d1CmExTitle").value.trim() || "선생님 예시";
        const visual = document.getElementById("d1CmExVisual").value.trim() || "함께 살펴보아요!";
        const problem = document.getElementById("d1CmExProblem").value.trim();
        const stepsRaw = document.getElementById("d1CmExSteps").value.trim();
        if (!problem) {
          document.getElementById("d1CustomMsg").textContent = "예제 문제 설명을 입력해주세요.";
          return;
        }
        const steps = stepsRaw ? stepsRaw.split(",").map((s) => s.trim()).filter(Boolean) : ["문제를 천천히 읽어요.", "정답을 확인해요."];
        if (!Array.isArray(data.examples[stg])) data.examples[stg] = [];
        data.examples[stg].unshift({ title, problem, visual: `<span>${esc(visual)}</span>`, steps, speakText: problem });
        await saveCustomMath(data);
        document.getElementById("d1CmExTitle").value = "";
        document.getElementById("d1CmExVisual").value = "";
        document.getElementById("d1CmExProblem").value = "";
        document.getElementById("d1CmExSteps").value = "";
        document.getElementById("d1CustomMsg").textContent = `${stg}단계에 새 예제가 저장·적용되었습니다!`;
      } else {
        const prompt = document.getElementById("d1CmPrompt").value.trim();
        const c1 = document.getElementById("d1CmC1").value.trim();
        const c2 = document.getElementById("d1CmC2").value.trim();
        const c3 = document.getElementById("d1CmC3").value.trim();
        const ansIdx = Number(document.getElementById("d1CmAns").value || 0);
        const hint = document.getElementById("d1CmHint").value.trim() || "문제를 다시 천천히 읽어 보세요.";
        const okMsg = document.getElementById("d1CmOk").value.trim() || "정답이에요! 정말 잘했어요!";
        if (!prompt || !c1 || !c2) {
          document.getElementById("d1CustomMsg").textContent = "문제 내용과 보기 1, 보기 2를 입력해주세요.";
          return;
        }
        const rawChoices = [c1, c2].concat(c3 ? [c3] : []);
        const choices = rawChoices.map((label, idx) => ({ label, value: String(idx) }));
        const answer = String(Math.min(ansIdx, choices.length - 1));
        if (!Array.isArray(data.problems[stg])) data.problems[stg] = [];
        data.problems[stg].unshift({ prompt, choices, answer, hint, okMsg });
        await saveCustomMath(data);
        document.getElementById("d1CmPrompt").value = "";
        document.getElementById("d1CmC1").value = "";
        document.getElementById("d1CmC2").value = "";
        document.getElementById("d1CmC3").value = "";
        document.getElementById("d1CmHint").value = "";
        document.getElementById("d1CmOk").value = "";
        document.getElementById("d1CustomMsg").textContent = `${stg}단계에 새 문제가 저장·적용되었습니다!`;
      }
      renderCustomMathList();
    });

    document.getElementById("d1CmClearBtn").addEventListener("click", async () => {
      if (!confirm("교사가 추가한 수학 공책 예제/문제를 모두 삭제할까요?")) return;
      await saveCustomMath({ examples: {}, problems: {} });
      document.getElementById("d1CustomMsg").textContent = "추가한 수학 공책 자료를 모두 삭제했습니다.";
      renderCustomMathList();
    });
  }

  function renderCustomWordsList() {
    const el = document.getElementById("d1CwList");
    if (!el) return;
    const list = loadCustomWordsLocal();
    if (!list.length) {
      el.innerHTML = `<div style="color:#64748b">추가된 단어가 없습니다. (기본 단어 40쌍 사용 중)</div>`;
      return;
    }
    el.innerHTML = list.map((w, idx) => (
      `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px">
        <span>⭕ <b>${esc(w.correct)}</b> / ❌ ${esc(w.wrong)} <span style="color:#64748b">(${esc(w.tier || "all")})</span></span>
        <button type="button" class="d1-btn-sm danger" data-del-cw="${idx}" style="padding:2px 6px;font-size:11px">삭제</button>
      </div>`
    )).join("");
    el.querySelectorAll("[data-del-cw]").forEach((b) => {
      b.addEventListener("click", async () => {
        const cur = loadCustomWordsLocal();
        cur.splice(Number(b.dataset.delCw), 1);
        await saveCustomWords(cur);
        renderCustomWordsList();
      });
    });
  }

  function renderCustomMathList() {
    const el = document.getElementById("d1CmList");
    if (!el) return;
    const data = loadCustomMathLocal();
    const items = [];
    Object.keys(data.examples || {}).forEach((stg) => {
      (data.examples[stg] || []).forEach((ex, idx) => {
        items.push({ kind: "example", stg, idx, label: `[${stg}단계 예시] ${ex.title || ex.problem}` });
      });
    });
    Object.keys(data.problems || {}).forEach((stg) => {
      (data.problems[stg] || []).forEach((pr, idx) => {
        items.push({ kind: "problem", stg, idx, label: `[${stg}단계 문제] ${pr.prompt}` });
      });
    });
    if (!items.length) {
      el.innerHTML = `<div style="color:#64748b">추가된 예제·문제가 없습니다.</div>`;
      return;
    }
    el.innerHTML = items.map((it) => (
      `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.label)}</span>
        <button type="button" class="d1-btn-sm danger" data-del-cm="${it.kind}:${it.stg}:${it.idx}" style="padding:2px 6px;font-size:11px;flex-shrink:0">삭제</button>
      </div>`
    )).join("");
    el.querySelectorAll("[data-del-cm]").forEach((b) => {
      b.addEventListener("click", async () => {
        const [kind, stg, idx] = b.dataset.delCm.split(":");
        const cur = loadCustomMathLocal();
        const bucket = kind === "example" ? cur.examples : cur.problems;
        if (Array.isArray(bucket[stg])) bucket[stg].splice(Number(idx), 1);
        await saveCustomMath(cur);
        renderCustomMathList();
      });
    });
  }

  async function refreshTeacherDashboard() {
    document.getElementById("d1CurrentClassLabel").textContent = getClassName();
    const classes = await getClasses();
    const listWrap = document.getElementById("d1TeacherClassList");
    const cur = getClassName();
    listWrap.innerHTML = classes.map((c) => (
      `<span class="d1-chip ${c.name === cur ? "active" : ""}" data-tcls="${esc(c.name)}">${esc(c.name)}${c.name !== "기본반" ? ` <b data-delcls="${esc(c.name)}" title="반 삭제" style="margin-left:4px;opacity:.75">✕</b>` : ""}</span>`
    )).join("");
    listWrap.querySelectorAll("[data-tcls]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.dataset.delcls) return;
        setClassName(el.dataset.tcls);
        refreshTeacherDashboard();
      });
    });
    listWrap.querySelectorAll("[data-delcls]").forEach((del) => {
      del.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm(`"${del.dataset.delcls}" 반을 삭제할까요?`)) return;
        await deleteClass(del.dataset.delcls);
        refreshTeacherDashboard();
      });
    });

    const fCls = document.getElementById("d1FilterClass");
    const prevCls = fCls.value;
    fCls.innerHTML = `<option value="">전체 반</option>` + classes.map((c) => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("");
    if (prevCls) fCls.value = prevCls;

    const fChar = document.getElementById("d1FilterChar");
    if (fChar.options.length <= 1) {
      fChar.innerHTML = `<option value="">전체 캐릭터</option>` + CHARACTERS.map((ch) => `<option value="${ch.id}">${ch.emoji} ${ch.name}</option>`).join("");
    }

    const curGame = detectCurrentGame();
    const fGame = document.getElementById("d1FilterGame");
    if (curGame && !fGame.dataset.init) {
      fGame.value = curGame;
      fGame.dataset.init = "1";
    }
    await loadTeacherRecords();
    renderCustomWordsList();
    renderCustomMathList();
  }

  async function loadTeacherRecords() {
    const tbody = document.getElementById("d1TeacherRecordsBody");
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#64748b">D1 DB에서 불러오는 중...</td></tr>`;
    const game = document.getElementById("d1FilterGame").value;
    const className = document.getElementById("d1FilterClass").value;
    const charId = document.getElementById("d1FilterChar").value;
    const rows = await getRecords({ game, class_name: className, character_id: charId, limit: 100 });
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#64748b">조건에 맞는 학습 기록이 없습니다.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr data-rid="${r.id}">
        <td>${r.id}</td>
        <td>${esc(r.class_name || "기본반")}</td>
        <td>${esc(r.student_name)}</td>
        <td>${esc(GAME_LABELS[r.game] || r.game)}</td>
        <td><input type="text" class="d1-input" data-edit-stage value="${esc(r.stage)}" style="width:110px;padding:3px 6px"></td>
        <td><input type="number" class="d1-input" data-edit-score value="${Number(r.score || 0)}" style="width:62px;padding:3px 6px"></td>
        <td><input type="text" class="d1-input" data-edit-summary value="${esc(r.summary)}" style="width:160px;padding:3px 6px"></td>
        <td style="white-space:nowrap">
          <button type="button" class="d1-btn-sm" data-save-row="${r.id}">저장</button>
          <button type="button" class="d1-btn-sm danger" data-del-row="${r.id}">삭제</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-save-row]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const tr = btn.closest("tr");
        const id = Number(btn.dataset.saveRow);
        await updateRecord(id, {
          stage: tr.querySelector("[data-edit-stage]").value,
          score: Number(tr.querySelector("[data-edit-score]").value || 0),
          summary: tr.querySelector("[data-edit-summary]").value
        });
        document.getElementById("d1TeacherMsg").textContent = `기록 #${id}이(가) D1 DB에 수정 저장되었습니다.`;
      });
    });

    tbody.querySelectorAll("[data-del-row]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.delRow);
        if (!confirm(`기록 #${id}을(를) D1 DB에서 삭제할까요?`)) return;
        await deleteRecord(id);
        document.getElementById("d1TeacherMsg").textContent = `기록 #${id}이(가) 삭제되었습니다.`;
        loadTeacherRecords();
      });
    });
  }

  function openTeacherModal() {
    ensureModals();
    const modal = document.getElementById("d1TeacherModal");
    modal.classList.add("open");
    if (teacherUnlocked) {
      document.getElementById("d1TeacherAuthBox").style.display = "none";
      document.getElementById("d1TeacherBody").style.display = "block";
      refreshTeacherDashboard();
    } else {
      document.getElementById("d1TeacherPinInput").value = "";
      document.getElementById("d1TeacherPinInput").focus();
    }
  }

  function updateFloatingPill() {
    const btn = document.getElementById("d1FloatingStudentBtn");
    if (!btn) return;
    const ch = getCharacter();
    btn.innerHTML = `${charSvg(ch.id, 20)} <span>${esc(getClassName())} · ${esc(ch.name)}</span>`;
  }

  function mountFloatingBar() {
    if (window.D1_HIDE_FLOATING || document.getElementById("d1FloatBar")) return;
    injectSharedStyles();
    const bar = document.createElement("div");
    bar.id = "d1FloatBar";
    bar.className = "d1-float-bar";
    bar.innerHTML = `
      <button type="button" class="d1-float-btn" id="d1FloatingStudentBtn" title="캐릭터 선택 로그인"></button>
      <button type="button" class="d1-float-btn teacher" id="d1FloatingTeacherBtn" title="교사 모드 (D1 DB 관리)">👩‍🏫 교사</button>
    `;
    document.body.appendChild(bar);
    updateFloatingPill();
    document.getElementById("d1FloatingStudentBtn").addEventListener("click", openStudentLoginModal);
    document.getElementById("d1FloatingTeacherBtn").addEventListener("click", openTeacherModal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      mountFloatingBar();
      syncCustomContentFromD1();
    });
  } else {
    mountFloatingBar();
    syncCustomContentFromD1();
  }

  window.D1Bridge = {
    CHARACTERS,
    charSvg,
    getApiBase,
    setApiBase,
    getClassName,
    setClassName,
    getClasses,
    saveClass,
    deleteClass,
    getCharacterId,
    setCharacterId,
    getCharacter,
    getStudentName,
    setStudentName,
    onProfileChange,
    openStudentLoginModal,
    openTeacherModal,
    checkHealth,
    saveRecord,
    getRecords,
    updateRecord,
    deleteRecord,
    deleteRecordsBulk,
    setKV,
    getKV
  };
})();
