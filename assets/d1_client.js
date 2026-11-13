"use strict";

/* ============================================================
   Cloudflare D1 DB 브라우저 브리지 (Workers + D1 API 연동)
   - GitHub Pages(정적 호스팅), 로컬 서버, 파일 환경 모두 지원
   ============================================================ */
(() => {
  const STUDENT_KEY = "safe_mover.student_name.v1";
  const API_OVERRIDE_KEY = "safe_mover.d1_api.v1";
  const DEFAULT_D1_API = "https://safe-mover-d1-api.school-guardian.workers.dev";
  let serverAvailable = null;

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

  function getStudentName() {
    try {
      const saved = (localStorage.getItem(STUDENT_KEY) || "").trim();
      return saved || "기본 학생";
    } catch (e) {
      return "기본 학생";
    }
  }

  function setStudentName(name) {
    const clean = String(name || "").trim() || "기본 학생";
    try {
      localStorage.setItem(STUDENT_KEY, clean);
    } catch (e) { /* 무시 */ }
    return clean;
  }

  async function apiFetch(path, options) {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function checkHealth(force) {
    if (!force && serverAvailable === false) {
      return { ok: false, mode: "offline", message: "Cloudflare D1 API 연결 대기 중" };
    }
    const data = await apiFetch("/api/health", { method: "GET" });
    if (!data || !data.ok) {
      serverAvailable = false;
      return { ok: false, mode: "offline", message: "Cloudflare D1 API 응답 없음 (네트워크 확인)" };
    }
    serverAvailable = true;
    return { ...data, api_base: getApiBase() };
  }

  async function saveRecord(record) {
    const payload = {
      game: record.game || "unknown",
      student_name: record.student_name || getStudentName(),
      stage: record.stage || "",
      score: Number(record.score || 0),
      summary: record.summary || "",
      payload: record.payload || {},
    };
    return await apiFetch("/api/records", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function getRecords(game, limit) {
    const qs = new URLSearchParams();
    if (game) qs.set("game", game);
    if (limit) qs.set("limit", String(limit));
    const data = await apiFetch(`/api/records?${qs.toString()}`, { method: "GET" });
    return data && data.ok && Array.isArray(data.records) ? data.records : [];
  }

  async function setKV(key, value) {
    return await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
  }

  async function getKV(key) {
    const data = await apiFetch(`/api/kv?key=${encodeURIComponent(key)}`, { method: "GET" });
    if (!data || !data.ok || !data.found || !data.item) return null;
    try {
      return JSON.parse(data.item.v);
    } catch (e) {
      return data.item.v;
    }
  }

  window.D1Bridge = {
    getApiBase,
    setApiBase,
    getStudentName,
    setStudentName,
    checkHealth,
    saveRecord,
    getRecords,
    setKV,
    getKV,
  };
})();
