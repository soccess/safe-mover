"use strict";

/* ============================================================
   Turso DB 브라우저 브리지 (turso_server.py 프록시 연동)
   - file:// 또는 정적 호스팅 환경에서는 오류 없이 조용히 건너뜁니다.
   ============================================================ */
(() => {
  const STUDENT_KEY = "safe_mover.student_name.v1";
  const isHttp = location.protocol === "http:" || location.protocol === "https:";
  let serverAvailable = null;

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

  async function apiFetch(url, options) {
    if (!isHttp) return null;
    try {
      const res = await fetch(url, {
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
    if (!isHttp) {
      serverAvailable = false;
      return { ok: false, mode: "static-file", message: "정적 파일 모드 (connect_turso.bat 실행 시 DB 연동)" };
    }
    if (!force && serverAvailable === false) {
      return { ok: false, mode: "static-only", message: "DB 서버 미연결 (connect_turso.bat 실행 필요)" };
    }
    const data = await apiFetch("/api/health", { method: "GET" });
    if (!data) {
      serverAvailable = false;
      return { ok: false, mode: "static-only", message: "DB API 응답 없음 (connect_turso.bat 으로 실행하세요)" };
    }
    serverAvailable = true;
    return data;
  }

  async function saveRecord(record) {
    if (!isHttp) return null;
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
    if (!isHttp) return [];
    const qs = new URLSearchParams();
    if (game) qs.set("game", game);
    if (limit) qs.set("limit", String(limit));
    const data = await apiFetch(`/api/records?${qs.toString()}`, { method: "GET" });
    return data && data.ok && Array.isArray(data.records) ? data.records : [];
  }

  async function setKV(key, value) {
    if (!isHttp) return null;
    return await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
  }

  async function getKV(key) {
    if (!isHttp) return null;
    const data = await apiFetch(`/api/kv?key=${encodeURIComponent(key)}`, { method: "GET" });
    if (!data || !data.ok || !data.found || !data.item) return null;
    try {
      return JSON.parse(data.item.v);
    } catch (e) {
      return data.item.v;
    }
  }

  window.TursoBridge = {
    getStudentName,
    setStudentName,
    checkHealth,
    saveRecord,
    getRecords,
    setKV,
    getKV,
  };
})();
