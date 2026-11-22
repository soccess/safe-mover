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
    cafe: "마음카페 3D",
    outlet: "콘센트 조립 실습실",
    kiosk: "마음카페 키오스크"
  };

  const SAFE_MOVER_CUSTOM_KEY = "safe_mover.custom_words.v1";
  const STEPMATH_CUSTOM_KEY = "stepmath.custom_content.v1";
  const KIOSK_CUSTOM_MENU_KEY = "safe_mover.kiosk.custom_menu.v1";
  const GOOGLE_CSE_KEY = "safe_mover.google_cse.v1";
  const SPED_PREFS_KEY = "safe_mover.sped_prefs.v1";

  const KIOSK_DEFAULT_CATALOG = [
    { id: "hot_americano", name: "따뜻한 아메리카노", price: 3000, category: "coffee" },
    { id: "iced_americano", name: "아이스 아메리카노", price: 3500, category: "coffee" },
    { id: "hot_latte", name: "따뜻한 카페라떼", price: 4000, category: "coffee" },
    { id: "iced_latte", name: "아이스 카페라떼", price: 4500, category: "coffee" },
    { id: "iced_vanilla_latte", name: "아이스 바닐라라떼", price: 4800, category: "coffee" },
    { id: "iced_caramel_macchiato", name: "카라멜 마끼아또", price: 5200, category: "coffee" },
    { id: "iced_cafe_mocha", name: "아이스 카페모카", price: 5500, category: "coffee" },
    { id: "hot_choco", name: "따뜻한 핫초코", price: 3800, category: "latte_tea" },
    { id: "hot_tea", name: "따뜻한 녹차", price: 3000, category: "latte_tea" },
    { id: "hot_yuja_tea", name: "따뜻한 유자차", price: 3500, category: "latte_tea" },
    { id: "iced_matcha_latte", name: "아이스 말차라떼", price: 4500, category: "latte_tea" },
    { id: "strawberry_latte", name: "딸기 라떼", price: 4800, category: "latte_tea" },
    { id: "iced_lemonade", name: "아이스 레몬에이드", price: 4200, category: "ade_smoothie" },
    { id: "grapefruit_ade", name: "아이스 자몽에이드", price: 4500, category: "ade_smoothie" },
    { id: "strawberry_smoothie", name: "딸기 스무디", price: 5300, category: "ade_smoothie" },
    { id: "mango_smoothie", name: "망고 스무디", price: 5300, category: "ade_smoothie" },
    { id: "choco_frappe", name: "초코 휘핑 프라페", price: 5800, category: "ade_smoothie" },
    { id: "green_tea_frappe", name: "말차 휘핑 프라페", price: 5800, category: "ade_smoothie" },
    { id: "croissant", name: "버터 크루아상", price: 3200, category: "bakery" },
    { id: "choco_donut", name: "초코 글레이즈 도넛", price: 2800, category: "bakery" },
    { id: "choco_cake", name: "달콤 초코 브라우니", price: 4500, category: "bakery" },
    { id: "cheese_muffin", name: "촉촉 치즈 머핀", price: 3000, category: "bakery" }
  ];

  const KIOSK_SVG_PRESETS = [
    { id: "bubble_tea", label: "버블티", defaultColor: "#a16207" },
    { id: "milkshake", label: "밀크쉐이크", defaultColor: "#f472b6" },
    { id: "iced_tea", label: "복숭아 아이스티", defaultColor: "#fb923c" },
    { id: "watermelon_juice", label: "수박 주스", defaultColor: "#ef4444" },
    { id: "orange_juice", label: "오렌지 주스", defaultColor: "#f97316" },
    { id: "grape_ade", label: "청포도 에이드", defaultColor: "#84cc16" },
    { id: "einspanner", label: "아인슈페너", defaultColor: "#5c3317" },
    { id: "dalgona_latte", label: "달고나 라떼", defaultColor: "#d97706" },
    { id: "yogurt_smoothie", label: "요거트 스무디", defaultColor: "#60a5fa" },
    { id: "ice_cream", label: "아이스크림", defaultColor: "#f472b6" },
    { id: "bingsu", label: "빙수", defaultColor: "#38bdf8" },
    { id: "macaron", label: "마카롱", defaultColor: "#ec4899" },
    { id: "waffle", label: "와플", defaultColor: "#d97706" },
    { id: "sandwich", label: "샌드위치", defaultColor: "#22c55e" },
    { id: "bagel", label: "베이글", defaultColor: "#b45309" },
    { id: "cookie", label: "쿠키", defaultColor: "#92400e" },
    { id: "cake_slice", label: "딸기 케이크", defaultColor: "#fb7185" },
    { id: "milk_bottle", label: "병우유", defaultColor: "#f8fafc" }
  ];

  function renderKioskPresetSvg(presetId, color = "#f97316", size = 86) {
    const c = color || "#f97316";
    const map = {
      bubble_tea: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#fef3c7"/>
        <line x1="56" y1="10" x2="48" y2="42" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <path d="M29 33h38l-5 45c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="#fffbeb" stroke="#78350f" stroke-width="2.4"/>
        <path d="M31 44h34l-4 32c-.4 2.5-2.5 4-13 4s-12.6-1.5-13-4z" fill="${c}" opacity="0.88"/>
        <ellipse cx="48" cy="33" rx="20" ry="5" fill="#fff" stroke="#78350f" stroke-width="2.2"/>
        <circle cx="38" cy="72" r="3.6" fill="#1e1b18"/><circle cx="47" cy="74" r="3.6" fill="#1e1b18"/><circle cx="56" cy="72" r="3.6" fill="#1e1b18"/>
        <circle cx="42" cy="65" r="3.4" fill="#1e1b18"/><circle cx="52" cy="66" r="3.4" fill="#1e1b18"/>
      </svg>`,
      milkshake: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#fce7f3"/>
        <line x1="60" y1="12" x2="50" y2="38" stroke="#ec4899" stroke-width="4" stroke-linecap="round"/>
        <path d="M32 40h32l-4 38c-.4 3-3 5-12 5s-11.6-2-12-5z" fill="${c}" stroke="#831843" stroke-width="2.4"/>
        <path d="M30 40c0-10 8-16 18-16s18 6 18 16z" fill="#fffdf9" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="48" cy="21" r="5" fill="#e11d48"/><path d="M48 16c2-4 5-5 7-4" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      iced_tea: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#ffedd5"/>
        <line x1="58" y1="13" x2="49" y2="42" stroke="#ea580c" stroke-width="4.2" stroke-linecap="round"/>
        <path d="M29 34h38l-5 44c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="rgba(255,255,255,0.65)" stroke="#9a3412" stroke-width="2.3"/>
        <path d="M31 44h34l-4 32c-.4 2.8-2.5 4-13 4s-12.6-1.2-13-4z" fill="${c}" opacity="0.88"/>
        <rect x="37" y="47" width="9" height="9" rx="2" fill="rgba(255,255,255,0.55)" transform="rotate(-10 37 47)"/>
        <circle cx="63" cy="34" r="9" fill="#fda4af" stroke="#e11d48" stroke-width="1.8"/>
      </svg>`,
      watermelon_juice: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#fee2e2"/>
        <line x1="57" y1="12" x2="49" y2="40" stroke="#16a34a" stroke-width="4.2" stroke-linecap="round"/>
        <path d="M29 35h38l-5 43c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="#fff" fill-opacity="0.6" stroke="#64748b" stroke-width="2.2"/>
        <path d="M31 44h34l-4 32c-.4 2.8-2.5 4-13 4s-12.6-1.2-13-4z" fill="${c}"/>
        <circle cx="42" cy="57" r="1.8" fill="#1e293b"/><circle cx="52" cy="64" r="1.8" fill="#1e293b"/><circle cx="46" cy="70" r="1.8" fill="#1e293b"/>
        <path d="M58 34a11 11 0 0 1 16 8z" fill="#ef4444" stroke="#16a34a" stroke-width="3"/>
      </svg>`,
      orange_juice: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#ffedd5"/>
        <line x1="57" y1="12" x2="49" y2="40" stroke="#f59e0b" stroke-width="4.2" stroke-linecap="round"/>
        <path d="M30 35h36l-4 43c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="rgba(255,255,255,0.65)" stroke="#c2410c" stroke-width="2.2"/>
        <path d="M32 43h32l-3.5 33c-.4 2.8-2.5 4-12.5 4s-12.1-1.2-12.5-4z" fill="${c}"/>
        <circle cx="64" cy="35" r="9.5" fill="#fb923c" stroke="#ea580c" stroke-width="2"/>
        <circle cx="64" cy="35" r="5" fill="#ffedd5"/>
      </svg>`,
      grape_ade: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#ecfccb"/>
        <line x1="57" y1="12" x2="49" y2="40" stroke="#65a30d" stroke-width="4.2" stroke-linecap="round"/>
        <path d="M29 35h38l-5 43c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="rgba(255,255,255,0.65)" stroke="#4d7c0f" stroke-width="2.2"/>
        <path d="M31 44h34l-4 32c-.4 2.8-2.5 4-13 4s-12.6-1.2-13-4z" fill="${c}" opacity="0.86"/>
        <circle cx="41" cy="68" r="5" fill="#bef264"/><circle cx="51" cy="64" r="5" fill="#a3e635"/><circle cx="45" cy="57" r="4.5" fill="#d9f99d"/>
        <circle cx="55" cy="52" r="2.2" fill="#fff"/>
      </svg>`,
      einspanner: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#f5ebe0"/>
        <path d="M30 34h36l-4 44c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="#fff" stroke="#451a03" stroke-width="2.5"/>
        <path d="M32 50h32l-3 26c-.4 2.5-2.5 4-13 4s-12.6-1.5-13-4z" fill="${c}"/>
        <path d="M31 35h34v15H31z" fill="#fffbeb" stroke="#e2e8f0" stroke-width="1.5"/>
        <path d="M31 35c2-6 8-9 17-9s15 3 17 9z" fill="#ffffff"/>
      </svg>`,
      dalgona_latte: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#fef3c7"/>
        <path d="M29 36h38l-5 42c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="#fff" stroke="#92400e" stroke-width="2.4"/>
        <path d="M31 48h34l-4 28c-.4 2.5-2.5 4-13 4s-12.6-1.5-13-4z" fill="#fffbeb"/>
        <path d="M31 37c4-8 30-8 34 0l-2 11H33z" fill="${c}"/>
        <rect x="40" y="29" width="14" height="10" rx="3" fill="#f59e0b" stroke="#92400e" stroke-width="1.6" transform="rotate(-12 47 34)"/>
      </svg>`,
      yogurt_smoothie: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#eff6ff"/>
        <line x1="57" y1="12" x2="49" y2="38" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
        <path d="M29 36h38l-5 42c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="#ffffff" stroke="#2563eb" stroke-width="2.4"/>
        <path d="M31 44h34l-4 32c-.4 2.5-2.5 4-13 4s-12.6-1.5-13-4z" fill="${c}" opacity="0.35"/>
        <circle cx="42" cy="34" r="5" fill="#1d4ed8"/><circle cx="52" cy="33" r="5" fill="#3b82f6"/><circle cx="47" cy="28" r="4.5" fill="#1e40af"/>
      </svg>`,
      ice_cream: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#fdf2f8"/>
        <polygon points="36,52 60,52 48,86" fill="#f59e0b" stroke="#b45309" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M40 58l14 8M42 68l9 5" stroke="#fde68a" stroke-width="2"/>
        <circle cx="48" cy="40" r="16" fill="${c}" stroke="#be185d" stroke-width="2.2"/>
        <circle cx="48" cy="27" r="11" fill="#fff1f2" stroke="#fbcfe8" stroke-width="2"/>
        <circle cx="48" cy="17" r="4" fill="#e11d48"/>
      </svg>`,
      bingsu: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#e0f2fe"/>
        <path d="M22 52c0-17 12-28 26-28s26 11 26 28z" fill="#ffffff" stroke="#7dd3fc" stroke-width="2.4"/>
        <path d="M34 33c6-6 22-6 28 0" fill="${c}" opacity="0.85"/>
        <path d="M20 52h56c-2 16-12 24-28 24s-26-8-28-24z" fill="#0284c7" stroke="#0369a1" stroke-width="2.4"/>
        <rect x="42" y="74" width="12" height="7" rx="2" fill="#0369a1"/>
        <circle cx="48" cy="23" r="5" fill="#ef4444"/>
      </svg>`,
      macaron: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#fce7f3"/>
        <path d="M22 44c0-10 12-16 26-16s26 6 26 16z" fill="${c}" stroke="#9d174d" stroke-width="2.4"/>
        <rect x="20" y="44" width="56" height="10" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="2"/>
        <path d="M22 54h52c0 10-12 16-26 16s-26-6-26-16z" fill="${c}" stroke="#9d174d" stroke-width="2.4"/>
      </svg>`,
      waffle: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#fef3c7"/>
        <rect x="22" y="26" width="52" height="48" rx="12" fill="${c}" stroke="#78350f" stroke-width="2.5"/>
        <g fill="#fef3c7" opacity="0.65">
          <rect x="30" y="34" width="10" height="10" rx="2"/><rect x="43" y="34" width="10" height="10" rx="2"/><rect x="56" y="34" width="10" height="10" rx="2"/>
          <rect x="30" y="47" width="10" height="10" rx="2"/><rect x="43" y="47" width="10" height="10" rx="2"/><rect x="56" y="47" width="10" height="10" rx="2"/>
          <rect x="30" y="60" width="10" height="8" rx="2"/><rect x="43" y="60" width="10" height="8" rx="2"/><rect x="56" y="60" width="10" height="8" rx="2"/>
        </g>
        <rect x="41" y="22" width="14" height="10" rx="3" fill="#fde047" stroke="#ca8a04" stroke-width="1.8"/>
      </svg>`,
      sandwich: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#dcfce7"/>
        <polygon points="18,64 78,64 48,26" fill="#fde68a" stroke="#b45309" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M20 56h56" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/>
        <path d="M24 50h48" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
        <polygon points="24,60 72,60 48,32" fill="#fffbeb" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>
      </svg>`,
      bagel: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#ffedd5"/>
        <circle cx="48" cy="50" r="27" fill="${c}" stroke="#78350f" stroke-width="2.6"/>
        <circle cx="48" cy="50" r="9.5" fill="#ffedd5" stroke="#78350f" stroke-width="2.2"/>
        <ellipse cx="35" cy="36" rx="2.5" ry="1.4" fill="#fef3c7" transform="rotate(-25 35 36)"/>
        <ellipse cx="59" cy="36" rx="2.5" ry="1.4" fill="#fef3c7" transform="rotate(25 59 36)"/>
        <ellipse cx="48" cy="30" rx="2.5" ry="1.4" fill="#fef3c7"/>
      </svg>`,
      cookie: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#fef3c7"/>
        <circle cx="48" cy="50" r="26" fill="${c}" stroke="#78350f" stroke-width="2.6"/>
        <circle cx="38" cy="40" r="3.5" fill="#451a03"/><circle cx="57" cy="41" r="3" fill="#451a03"/>
        <circle cx="46" cy="52" r="3.8" fill="#451a03"/><circle cx="36" cy="59" r="3" fill="#451a03"/>
        <circle cx="58" cy="58" r="3.5" fill="#451a03"/>
      </svg>`,
      cake_slice: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#ffe4e6"/>
        <polygon points="22,68 74,68 74,45 22,52" fill="#fffbeb" stroke="#be123c" stroke-width="2.4" stroke-linejoin="round"/>
        <polygon points="22,52 74,45 62,28 22,42" fill="#fff" stroke="#be123c" stroke-width="2.4" stroke-linejoin="round"/>
        <line x1="23" y1="60" x2="73" y2="56" stroke="${c}" stroke-width="4"/>
        <circle cx="46" cy="32" r="6" fill="#e11d48"/><path d="M46 26l3-4" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      milk_bottle: `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#eff6ff"/>
        <path d="M38 24h20l4 14v38c0 4-3 6-14 6s-14-2-14-6V38z" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="36" y="18" width="24" height="7" rx="3" fill="${c}" stroke="#1d4ed8" stroke-width="2"/>
        <rect x="34" y="47" width="28" height="18" fill="#dbeafe"/>
        <text x="48" y="60" text-anchor="middle" font-size="10" font-weight="900" fill="#1e40af">MILK</text>
      </svg>`
    };
    return map[presetId] || map.bubble_tea;
  }

  window.D1KioskSvg = {
    PRESETS: KIOSK_SVG_PRESETS,
    renderPresetSvg: renderKioskPresetSvg
  };

  const DEFAULT_SPED_PREFS = {
    easyMode: false,     // 쉬운 말 모드 (짧고 구체적인 지시문)
    ttsAuto: false,      // 자동 음성 읽기
    slowPace: false      // 천천히 · 무오류 연습 모드
  };

  function loadSpedPrefs() {
    const prefs = { ...DEFAULT_SPED_PREFS };
    try {
      const raw = localStorage.getItem(SPED_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          prefs.easyMode = Boolean(parsed.easyMode);
          prefs.ttsAuto = Boolean(parsed.ttsAuto);
          prefs.slowPace = Boolean(parsed.slowPace);
        }
      }
    } catch (_) {}
    return prefs;
  }

  let spedPrefs = loadSpedPrefs();
  const spedListeners = new Set();

  function applySpedPrefsToDom() {
    if (!document.body) return;
    document.body.classList.remove("sped-calm", "sped-contrast");
    document.body.classList.toggle("sped-easy", Boolean(spedPrefs.easyMode));
    document.body.classList.toggle("sped-slow", Boolean(spedPrefs.slowPace));
  }

  function getSpedPrefs() {
    return { ...spedPrefs };
  }

  function setSpedPrefs(patch) {
    spedPrefs = { ...spedPrefs, ...(patch || {}) };
    try { localStorage.setItem(SPED_PREFS_KEY, JSON.stringify(spedPrefs)); } catch (_) {}
    applySpedPrefsToDom();
    spedListeners.forEach((fn) => {
      try { fn(getSpedPrefs()); } catch (_) {}
    });
    return getSpedPrefs();
  }

  function onSpedPrefsChange(fn) {
    spedListeners.add(fn);
    return () => spedListeners.delete(fn);
  }

  const TTS_DISMISS_DATE_KEY = "safe_mover.tts_guide_dismissed_date.v1";

  function isKoreanVoice(v) {
    if (!v) return false;
    return /^ko([_-]|$)/i.test(String(v.lang || "")) || /korean|한국/i.test(String(v.name || ""));
  }

  function isEdgeNaturalVoice(v) {
    if (!isKoreanVoice(v)) return false;
    const n = String(v.name || "");
    return /online/i.test(n) || /natural/i.test(n) ||
      /sunhi|injoon|hyunsu|bongjin|gookmin|jimin|seohyeon|soonbok|yujin/i.test(n);
  }

  function isWindowsDefaultVoice(v) {
    const n = String(v && v.name || "");
    return /heami|desktop|sapi/i.test(n);
  }

  function pickBestKoreanVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const ko = voices.filter(isKoreanVoice);
    if (!ko.length) return null;
    return (
      ko.find((v) => isEdgeNaturalVoice(v) && /sunhi/i.test(v.name || "")) ||
      ko.find((v) => isEdgeNaturalVoice(v) && /injoon|hyunsu/i.test(v.name || "")) ||
      ko.find(isEdgeNaturalVoice) ||
      ko.find((v) => !v.localService && !isWindowsDefaultVoice(v)) ||
      ko.find((v) => !isWindowsDefaultVoice(v)) ||
      ko[0]
    );
  }

  function detectTtsPlatform() {
    const ua = navigator.userAgent || "";
    const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    const isAndroid = /android/i.test(ua);
    const isWindows = !isAndroid && (/windows/i.test(ua) || /win/i.test(plat));
    const isEdge = /edg\//i.test(ua);
    return {
      isAndroid,
      isWindows,
      isEdge,
      platform: isAndroid ? "android" : (isWindows ? "windows" : "other")
    };
  }

  function waitForTtsVoices(timeoutMs = 1500) {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve([]);
        return;
      }
      const synth = window.speechSynthesis;
      let done = false;
      let graceTimer = null;
      let hardTimer = null;

      const finish = () => {
        if (done) return;
        done = true;
        if (graceTimer) clearTimeout(graceTimer);
        if (hardTimer) clearTimeout(hardTimer);
        try { synth.removeEventListener("voiceschanged", onVoices); } catch (_) {}
        resolve(synth.getVoices() || []);
      };

      const checkVoices = () => {
        const list = synth.getVoices() || [];
        if (list.some(isEdgeNaturalVoice)) {
          finish();
          return;
        }
        if (list.some(isKoreanVoice) && !graceTimer) {
          // On Windows Edge, local Heami often arrives before Online Natural voices
          graceTimer = setTimeout(finish, 450);
        }
      };

      const onVoices = () => checkVoices();
      try { synth.addEventListener("voiceschanged", onVoices); } catch (_) {}
      checkVoices();
      hardTimer = setTimeout(finish, timeoutMs);
    });
  }

  async function inspectTtsEnvironment(timeoutMs = 1500) {
    const info = detectTtsPlatform();
    const supported = "speechSynthesis" in window;
    const voices = await waitForTtsVoices(timeoutMs);
    const koVoices = voices.filter(isKoreanVoice);
    const bestVoice = pickBestKoreanVoice();
    const hasEdgeNatural = koVoices.some(isEdgeNaturalVoice);
    const onlyWindowsDefault = info.isWindows && koVoices.length > 0 && !hasEdgeNatural && koVoices.every(isWindowsDefaultVoice);

    let needsGuide = false;
    let reason = "ok";
    if (!supported) {
      needsGuide = true;
      reason = "unsupported";
    } else if (info.isAndroid && koVoices.length === 0) {
      needsGuide = true;
      reason = "android-no-tts";
    } else if (info.isWindows && !hasEdgeNatural) {
      needsGuide = true;
      reason = "windows-no-edgetts";
    }

    return {
      ...info,
      supported,
      voices,
      koVoices,
      bestVoice,
      hasEdgeNatural,
      onlyWindowsDefault,
      needsGuide,
      reason
    };
  }

  function speakText(text, rate, pitch) {
    try {
      if (!text || !("speechSynthesis" in window)) return false;
      const synth = window.speechSynthesis;
      synth.cancel();
      if (synth.paused) {
        try { synth.resume(); } catch (_) {}
      }
      const u = new SpeechSynthesisUtterance(String(text));
      const voice = pickBestKoreanVoice();
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang || "ko-KR";
      } else {
        u.lang = "ko-KR";
      }
      u.rate = rate || (spedPrefs.slowPace ? 0.86 : 0.94);
      u.pitch = pitch || 1.02;
      synth.speak(u);
      return true;
    } catch (_) {
      return false;
    }
  }

  function stopSpeak() {
    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch (_) {}
  }

  function detectCurrentGame() {
    const p = (location.pathname || "").toLowerCase();
    if (p.includes("safe_mover")) return "safe_mover";
    if (p.includes("stepmath")) return "stepmath";
    if (p.includes("emotion")) return "emotion";
    if (p.includes("/cafe")) return "cafe";
    if (p.includes("/outlet")) return "outlet";
    if (p.includes("/kiosk")) return "kiosk";
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

  const kioskMenuListeners = new Set();
  function loadKioskMenuConfigLocal() {
    try {
      const raw = localStorage.getItem(KIOSK_CUSTOM_MENU_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return {
        overrides: obj && obj.overrides && typeof obj.overrides === "object" ? obj.overrides : {},
        added: Array.isArray(obj && obj.added) ? obj.added : []
      };
    } catch {
      return { overrides: {}, added: [] };
    }
  }
  function onKioskMenuChange(fn) {
    kioskMenuListeners.add(fn);
    return () => kioskMenuListeners.delete(fn);
  }
  function notifyKioskMenuChange() {
    const cfg = loadKioskMenuConfigLocal();
    kioskMenuListeners.forEach((fn) => {
      try { fn(cfg); } catch {}
    });
  }
  async function saveKioskMenuConfig(cfg) {
    const clean = {
      overrides: cfg && cfg.overrides && typeof cfg.overrides === "object" ? cfg.overrides : {},
      added: Array.isArray(cfg && cfg.added) ? cfg.added : []
    };
    try { localStorage.setItem(KIOSK_CUSTOM_MENU_KEY, JSON.stringify(clean)); } catch {}
    notifyKioskMenuChange();
    const res = await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: KIOSK_CUSTOM_MENU_KEY, value: clean })
    });
    return { ok: Boolean(res && res.ok), config: clean };
  }

  function loadGoogleCseConfigLocal() {
    try {
      const raw = localStorage.getItem(GOOGLE_CSE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return { apiKey: String(obj.apiKey || ""), cx: String(obj.cx || "") };
    } catch { return { apiKey: "", cx: "" }; }
  }
  async function saveGoogleCseConfig(apiKey, cx) {
    const clean = { apiKey: String(apiKey || "").trim(), cx: String(cx || "").trim() };
    try { localStorage.setItem(GOOGLE_CSE_KEY, JSON.stringify(clean)); } catch {}
    await apiFetch("/api/kv", {
      method: "POST",
      body: JSON.stringify({ key: GOOGLE_CSE_KEY, value: clean })
    });
    return clean;
  }

  async function compressImageToMinimalWebp(source, startMaxDim = 156) {
    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
      img.src = src;
    });

    let objectUrl = null;
    let imgEl = null;
    try {
      if (typeof File !== "undefined" && (source instanceof File || source instanceof Blob)) {
        objectUrl = URL.createObjectURL(source);
        imgEl = await loadImg(objectUrl);
      } else {
        const urlStr = String(source || "").trim();
        if (!urlStr) throw new Error("이미지 주소가 비어 있습니다.");
        // 우선 Worker 이미지 프록시(CORS 우회) 시도 후 실패 시 직접 로드
        const proxyUrl = getApiBase() + "/api/image-proxy?url=" + encodeURIComponent(urlStr);
        try {
          imgEl = await loadImg(proxyUrl);
        } catch (_) {
          imgEl = await loadImg(urlStr);
        }
      }

      let maxDim = startMaxDim;
      let bestUrl = "";
      for (const quality of [0.64, 0.48, 0.34, 0.24]) {
        const ratio = Math.min(1, maxDim / Math.max(imgEl.naturalWidth || maxDim, imgEl.naturalHeight || maxDim));
        const w = Math.max(32, Math.round((imgEl.naturalWidth || maxDim) * ratio));
        const h = Math.max(32, Math.round((imgEl.naturalHeight || maxDim) * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(imgEl, 0, 0, w, h);
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        bestUrl = dataUrl;
        if (dataUrl.length <= 13500) break; // ~10KB 이하 목표
        maxDim = Math.max(96, Math.round(maxDim * 0.82));
      }

      const bytes = Math.round((bestUrl.length * 3) / 4);
      const mime = (bestUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);/) || [])[1] || "image/webp";
      return { dataUrl: bestUrl, bytes, mime };
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  async function saveMenuImageToD1(dataUrl) {
    const id = "img_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const res = await apiFetch("/api/menu-images", {
      method: "POST",
      body: JSON.stringify({ id, data_url: dataUrl })
    });
    if (res && res.ok) {
      return {
        ok: true,
        imageId: res.id || id,
        imageUrl: getApiBase() + "/api/menu-images?id=" + encodeURIComponent(res.id || id) + "&raw=1",
        dataUrl,
        bytes: res.bytes || Math.round((dataUrl.length * 3) / 4),
        storedIn: "d1-table"
      };
    }
    return {
      ok: true,
      imageId: "",
      imageUrl: "",
      dataUrl,
      bytes: Math.round((dataUrl.length * 3) / 4),
      storedIn: "d1-kv"
    };
  }

  async function searchGoogleImages(query) {
    const q = String(query || "").trim();
    if (!q) return { ok: false, error: "검색어를 입력해 주세요." };
    const cse = loadGoogleCseConfigLocal();
    const qs = new URLSearchParams({ q });
    if (cse.apiKey) qs.set("key", cse.apiKey);
    if (cse.cx) qs.set("cx", cse.cx);

    try {
      const base = getApiBase();
      const resp = await fetch(base + "/api/image-search?" + qs.toString());
      if (resp.status !== 404) {
        const data = await resp.json().catch(() => null);
        if (data) return data;
      }
    } catch (_) {}

    // Worker 미배포 시 브라우저에서 직접 Google Custom Search JSON API 호출
    if (!cse.apiKey || !cse.cx) {
      return {
        ok: false,
        needs_config: true,
        error: "Google Custom Search API Key와 검색엔진 ID(CX)를 먼저 입력해 주세요."
      };
    }
    try {
      const gUrl = new URL("https://www.googleapis.com/customsearch/v1");
      gUrl.searchParams.set("key", cse.apiKey);
      gUrl.searchParams.set("cx", cse.cx);
      gUrl.searchParams.set("q", q);
      gUrl.searchParams.set("searchType", "image");
      gUrl.searchParams.set("num", "8");
      gUrl.searchParams.set("safe", "active");
      const gRes = await fetch(gUrl.toString());
      const gJson = await gRes.json().catch(() => ({}));
      if (!gRes.ok) {
        return { ok: false, error: (gJson.error && gJson.error.message) || `HTTP ${gRes.status}` };
      }
      const items = (gJson.items || []).map((it) => ({
        title: it.title || "",
        link: it.link || "",
        thumbnail: (it.image && it.image.thumbnailLink) || it.link || "",
        width: it.image ? it.image.width : 0,
        height: it.image ? it.image.height : 0
      }));
      return { ok: true, items };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : "구글 이미지 검색 실패" };
    }
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
      const k = await apiFetch("/api/kv?key=" + encodeURIComponent(KIOSK_CUSTOM_MENU_KEY), { method: "GET" });
      if (k && k.found && k.item && k.item.v) {
        const parsed = typeof k.item.v === "string" ? JSON.parse(k.item.v) : k.item.v;
        if (parsed && typeof parsed === "object") {
          localStorage.setItem(KIOSK_CUSTOM_MENU_KEY, JSON.stringify(parsed));
          notifyKioskMenuChange();
        }
      }
      const g = await apiFetch("/api/kv?key=" + encodeURIComponent(GOOGLE_CSE_KEY), { method: "GET" });
      if (g && g.found && g.item && g.item.v) {
        const parsed = typeof g.item.v === "string" ? JSON.parse(g.item.v) : g.item.v;
        if (parsed && typeof parsed === "object") {
          localStorage.setItem(GOOGLE_CSE_KEY, JSON.stringify(parsed));
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
      .d1-float-btn.aac{background:rgba(16,185,129,.28);color:#d1fae5}
      .d1-float-btn.aac:hover{background:rgba(16,185,129,.44)}
      .d1-float-btn.sped{background:rgba(56,189,248,.24);color:#e0f2fe}
      .d1-float-btn.sped:hover{background:rgba(56,189,248,.40)}
      .d1-aac-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:12px 0}
      .d1-aac-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:92px;padding:12px 8px;border-radius:16px;border:2px solid #cbd5e1;background:#f8fafc;color:#0f172a;font:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:transform .12s,border-color .12s,background .12s}
      .d1-aac-btn:hover{border-color:#0284c7;background:#e0f2fe;transform:translateY(-2px)}
      .d1-aac-btn:active{transform:scale(.97)}
      .d1-aac-emoji{font-size:32px;line-height:1}
      .d1-aac-spoken{background:#eff6ff;border:2px solid #93c5fd;border-radius:14px;padding:12px 14px;font-size:16px;font-weight:800;color:#1e3a8a;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .d1-sped-list{display:grid;gap:10px;margin:10px 0}
      .d1-sped-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid #cbd5e1;background:#f8fafc;cursor:pointer}
      .d1-sped-item strong{display:block;font-size:15px;color:#0f172a}
      .d1-sped-item small{display:block;font-size:12.5px;color:#475569;margin-top:2px}
      .d1-sped-item input[type="checkbox"]{width:24px;height:24px;accent-color:#2563eb;flex-shrink:0;cursor:pointer}
      @media (max-width:640px){.d1-float-bar{right:8px;bottom:8px;padding:5px 8px;gap:4px;font-size:12px}.d1-float-btn{padding:4px 8px}}
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
                  <option value="outlet">콘센트 조립 실습실</option>
                  <option value="kiosk">마음카페 키오스크</option>
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

            <div class="d1-t-section" id="d1KioskEditorSection">
              <h3>5. ☕ 마음카페 키오스크 메뉴 · 가격 관리 (SVG · 구글 이미지 검색 → 초저용량 D1 저장)</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:12px">
                <div style="background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:12px">
                  <div style="font-weight:800;font-size:13.5px;color:#0f172a;margin-bottom:8px">➕ 새 메뉴 추가하기</div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <input type="text" id="d1KmName" class="d1-input" placeholder="메뉴 이름 (예: 흑당 버블티)" style="flex:1.4;min-width:130px" />
                    <input type="number" id="d1KmPrice" class="d1-input" placeholder="가격(원)" min="100" step="100" value="4500" style="width:105px" />
                  </div>
                  <div class="d1-class-row" style="margin-bottom:6px">
                    <select id="d1KmCat" class="d1-input" style="flex:1">
                      <option value="coffee">☕ 에스프레소 커피</option>
                      <option value="latte_tea">🥛 라떼 · 전통차</option>
                      <option value="ade_smoothie">🫧 에이드 · 스무디</option>
                      <option value="bakery">🥐 베이커리 · 디저트</option>
                    </select>
                    <select id="d1KmTemp" class="d1-input">
                      <option value="ICE">ICE</option>
                      <option value="HOT">HOT</option>
                      <option value="BAKERY">빵·디저트</option>
                    </select>
                    <input type="color" id="d1KmColor" value="#a16207" title="메뉴 대표 색상" style="width:38px;height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:2px;cursor:pointer" />
                  </div>
                  <div class="d1-class-row" style="margin-bottom:8px">
                    <input type="text" id="d1KmDesc" class="d1-input" placeholder="설명 (예: 달콤하고 쫀득한 버블티)" style="width:100%" />
                  </div>

                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:9px;margin-bottom:8px">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap">
                      <span style="font-size:12px;font-weight:800;color:#334155">🎨 그림 방식 선택:</span>
                      <div style="display:flex;gap:5px">
                        <button type="button" class="d1-chip active" id="d1KmTabSvg">✨ 다양한 SVG (18종)</button>
                        <button type="button" class="d1-chip" id="d1KmTabImg">🔍 구글 이미지 검색 / 사진</button>
                      </div>
                    </div>

                    <div id="d1KmSvgBox">
                      <div id="d1KmPresetGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:5px;max-height:170px;overflow:auto;padding:2px"></div>
                    </div>

                    <div id="d1KmImgBox" style="display:none">
                      <div class="d1-class-row" style="margin-bottom:6px">
                        <input type="text" id="d1KmImgQuery" class="d1-input" placeholder="구글 이미지 검색어 (예: 딸기 케이크)" style="flex:1;min-width:120px" />
                        <button type="button" class="d1-btn-sm primary" id="d1KmImgSearchBtn">🔍 검색</button>
                        <button type="button" class="d1-btn-sm" id="d1KmCseToggleBtn" title="Google API 키 설정">⚙️</button>
                      </div>
                      <div id="d1KmCseConfigBox" style="display:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:7px;margin-bottom:6px">
                        <div style="font-size:11.5px;color:#1e3a8a;font-weight:700;margin-bottom:4px">Google Custom Search API 키 설정 (1회 저장 후 D1 연동)</div>
                        <div class="d1-class-row" style="margin:0;gap:5px">
                          <input type="text" id="d1KmCseKey" class="d1-input" placeholder="Google API Key" style="flex:1;min-width:110px;font-size:11.5px" />
                          <input type="text" id="d1KmCseCx" class="d1-input" placeholder="Search Engine ID (CX)" style="flex:1;min-width:110px;font-size:11.5px" />
                          <button type="button" class="d1-btn-sm primary" id="d1KmCseSaveBtn">저장</button>
                        </div>
                      </div>
                      <div class="d1-class-row" style="margin-bottom:6px;justify-content:space-between">
                        <label class="d1-btn-sm" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
                          📁 내 사진 올리기 (자동 압축)
                          <input type="file" id="d1KmFileInput" accept="image/*" style="display:none" />
                        </label>
                        <button type="button" class="d1-btn-sm" id="d1KmClearImgBtn">이미지 지우기</button>
                      </div>
                      <div id="d1KmImgResults" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:145px;overflow:auto"></div>
                    </div>

                    <div style="display:flex;align-items:center;gap:10px;margin-top:8px;padding-top:8px;border-top:1px dashed #cbd5e1">
                      <div id="d1KmPreviewBox" style="width:60px;height:60px;border-radius:12px;border:1.5px solid #cbd5e1;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0"></div>
                      <div id="d1KmPreviewMeta" style="font-size:11.5px;color:#475569;line-height:1.4">SVG 프리셋이 선택되어 있어요.</div>
                    </div>
                  </div>

                  <div class="d1-class-row" style="margin:0">
                    <button type="button" class="d1-btn-sm primary" id="d1KmAddBtn">🛒 키오스크에 메뉴 추가</button>
                    <button type="button" class="d1-btn-sm danger" id="d1KmResetAllBtn">기본값 복원</button>
                  </div>
                </div>

                <div style="background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:12px;display:flex;flex-direction:column">
                  <div style="font-weight:800;font-size:13.5px;color:#0f172a;margin-bottom:6px">💰 전체 메뉴 가격 수정 · 숨김/삭제</div>
                  <div style="font-size:11.5px;color:#64748b;margin-bottom:6px">가격을 바꾼 뒤 [저장]을 누르면 키오스크에 바로 적용됩니다.</div>
                  <div id="d1KmMenuList" style="flex:1;max-height:360px;overflow:auto;display:flex;flex-direction:column;gap:5px"></div>
                </div>
              </div>
              <div class="d1-msg" id="d1KioskMsg"></div>
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
        await refreshTeacherDashboard();
        const modalEl = document.getElementById("d1TeacherModal");
        if (modalEl && modalEl.dataset.pendingFocus === "kiosk") {
          modalEl.dataset.pendingFocus = "";
          const sec = document.getElementById("d1KioskEditorSection");
          if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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

    // 5. 마음카페 키오스크 메뉴 · 가격 관리 이벤트
    let selectedPreset = KIOSK_SVG_PRESETS[0].id;
    let selectedImgMode = "svg"; // 'svg' | 'img'
    let pendingCompressedImg = null; // { dataUrl, bytes, mime }

    const updateKmPreview = () => {
      const box = document.getElementById("d1KmPreviewBox");
      const meta = document.getElementById("d1KmPreviewMeta");
      const color = document.getElementById("d1KmColor").value || "#f97316";
      if (!box || !meta) return;
      if (selectedImgMode === "img" && pendingCompressedImg && pendingCompressedImg.dataUrl) {
        box.innerHTML = `<img src="${pendingCompressedImg.dataUrl}" alt="메뉴 미리보기" style="width:100%;height:100%;object-fit:cover" />`;
        const kb = (pendingCompressedImg.bytes / 1024).toFixed(1);
        meta.innerHTML = `✅ <b>초저용량 압축 이미지 준비됨</b><br>용량: <b>${kb} KB</b> (${pendingCompressedImg.mime}) → D1 저장`;
      } else {
        const pInfo = KIOSK_SVG_PRESETS.find((p) => p.id === selectedPreset) || KIOSK_SVG_PRESETS[0];
        box.innerHTML = renderKioskPresetSvg(selectedPreset, color, 54);
        meta.innerHTML = `✨ <b>SVG 아이콘: ${esc(pInfo.label)}</b><br>용량 0KB 벡터 그래픽 · 색상 변경 가능`;
      }
    };

    const renderPresetGrid = () => {
      const grid = document.getElementById("d1KmPresetGrid");
      if (!grid) return;
      const color = document.getElementById("d1KmColor").value || "#f97316";
      grid.innerHTML = KIOSK_SVG_PRESETS.map((p) => `
        <button type="button" data-km-preset="${p.id}" style="border:2px solid ${selectedPreset === p.id ? "#2563eb" : "#e2e8f0"};background:${selectedPreset === p.id ? "#eff6ff" : "#fff"};border-radius:10px;padding:4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px">
          ${renderKioskPresetSvg(p.id, selectedPreset === p.id ? color : p.defaultColor, 36)}
          <span style="font-size:10px;font-weight:700;color:#334155;line-height:1.1">${esc(p.label)}</span>
        </button>
      `).join("");
      grid.querySelectorAll("[data-km-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedPreset = btn.dataset.kmPreset;
          const pInfo = KIOSK_SVG_PRESETS.find((x) => x.id === selectedPreset);
          if (pInfo && pInfo.defaultColor) {
            document.getElementById("d1KmColor").value = pInfo.defaultColor;
          }
          selectedImgMode = "svg";
          renderPresetGrid();
          updateKmPreview();
        });
      });
    };

    renderPresetGrid();
    updateKmPreview();

    document.getElementById("d1KmColor").addEventListener("input", () => {
      renderPresetGrid();
      updateKmPreview();
    });
    document.getElementById("d1KmTabSvg").addEventListener("click", () => {
      selectedImgMode = "svg";
      document.getElementById("d1KmTabSvg").classList.add("active");
      document.getElementById("d1KmTabImg").classList.remove("active");
      document.getElementById("d1KmSvgBox").style.display = "block";
      document.getElementById("d1KmImgBox").style.display = "none";
      updateKmPreview();
    });
    document.getElementById("d1KmTabImg").addEventListener("click", () => {
      selectedImgMode = "img";
      document.getElementById("d1KmTabImg").classList.add("active");
      document.getElementById("d1KmTabSvg").classList.remove("active");
      document.getElementById("d1KmSvgBox").style.display = "none";
      document.getElementById("d1KmImgBox").style.display = "block";
      const cse = loadGoogleCseConfigLocal();
      document.getElementById("d1KmCseKey").value = cse.apiKey || "";
      document.getElementById("d1KmCseCx").value = cse.cx || "";
      updateKmPreview();
    });
    document.getElementById("d1KmCseToggleBtn").addEventListener("click", () => {
      const box = document.getElementById("d1KmCseConfigBox");
      box.style.display = box.style.display === "none" ? "block" : "none";
    });
    document.getElementById("d1KmCseSaveBtn").addEventListener("click", async () => {
      const k = document.getElementById("d1KmCseKey").value;
      const cx = document.getElementById("d1KmCseCx").value;
      await saveGoogleCseConfig(k, cx);
      document.getElementById("d1KioskMsg").textContent = "Google 이미지 검색 API 키가 D1에 저장되었습니다.";
      document.getElementById("d1KmCseConfigBox").style.display = "none";
    });
    document.getElementById("d1KmClearImgBtn").addEventListener("click", () => {
      pendingCompressedImg = null;
      selectedImgMode = "svg";
      document.getElementById("d1KmTabSvg").click();
      updateKmPreview();
    });
    document.getElementById("d1KmFileInput").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const msgEl = document.getElementById("d1KioskMsg");
      msgEl.textContent = "이미지를 초저용량 WebP로 압축 중...";
      try {
        pendingCompressedImg = await compressImageToMinimalWebp(file);
        selectedImgMode = "img";
        updateKmPreview();
        msgEl.textContent = `압축 완료! (${(pendingCompressedImg.bytes / 1024).toFixed(1)} KB)`;
      } catch (err) {
        msgEl.textContent = "이미지 압축 실패: " + (err && err.message ? err.message : "");
      }
      e.target.value = "";
    });

    const runImgSearch = async () => {
      const q = document.getElementById("d1KmImgQuery").value.trim() || document.getElementById("d1KmName").value.trim();
      const msgEl = document.getElementById("d1KioskMsg");
      const resBox = document.getElementById("d1KmImgResults");
      if (!q) {
        msgEl.textContent = "검색어를 입력해 주세요.";
        return;
      }
      msgEl.textContent = `"${q}" 구글 이미지 검색 중...`;
      resBox.innerHTML = "";
      const res = await searchGoogleImages(q);
      if (!res || !res.ok) {
        msgEl.textContent = (res && res.error) || "검색 실패";
        if (res && res.needs_config) {
          document.getElementById("d1KmCseConfigBox").style.display = "block";
        }
        return;
      }
      const items = res.items || [];
      if (!items.length) {
        msgEl.textContent = "검색 결과가 없습니다. 다른 검색어를 입력해 보세요.";
        return;
      }
      msgEl.textContent = `검색 결과 ${items.length}개 · 원하는 이미지를 눌러 자동 압축하세요!`;
      resBox.innerHTML = items.map((it, idx) => `
        <button type="button" data-gimg-idx="${idx}" title="${esc(it.title)}" style="border:1.5px solid #cbd5e1;background:#fff;border-radius:8px;padding:2px;cursor:pointer;height:66px;overflow:hidden">
          <img src="${esc(it.thumbnail || it.link)}" alt="${esc(it.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />
        </button>
      `).join("");
      resBox.querySelectorAll("[data-gimg-idx]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const item = items[Number(btn.dataset.gimgIdx)];
          if (!item) return;
          msgEl.textContent = "선택한 이미지를 초저용량 WebP로 압축 중...";
          try {
            pendingCompressedImg = await compressImageToMinimalWebp(item.link || item.thumbnail);
            selectedImgMode = "img";
            updateKmPreview();
            msgEl.textContent = `선택 완료! (${(pendingCompressedImg.bytes / 1024).toFixed(1)} KB 초저용량 압축됨)`;
          } catch (_) {
            try {
              pendingCompressedImg = await compressImageToMinimalWebp(item.thumbnail);
              selectedImgMode = "img";
              updateKmPreview();
              msgEl.textContent = `썸네일 압축 완료! (${(pendingCompressedImg.bytes / 1024).toFixed(1)} KB)`;
            } catch (e2) {
              msgEl.textContent = "보안 정책으로 이 이미지는 직접 변환할 수 없어요. 다른 이미지를 고르거나 파일로 올려주세요.";
            }
          }
        });
      });
    };
    document.getElementById("d1KmImgSearchBtn").addEventListener("click", runImgSearch);
    document.getElementById("d1KmImgQuery").addEventListener("keydown", (e) => {
      if (e.key === "Enter") runImgSearch();
    });

    document.getElementById("d1KmAddBtn").addEventListener("click", async () => {
      const name = document.getElementById("d1KmName").value.trim();
      const price = Math.max(100, Number.parseInt(document.getElementById("d1KmPrice").value, 10) || 0);
      const category = document.getElementById("d1KmCat").value;
      const temp = document.getElementById("d1KmTemp").value;
      const color = document.getElementById("d1KmColor").value || "#f97316";
      const desc = document.getElementById("d1KmDesc").value.trim() || `${name} 메뉴예요.`;
      const msgEl = document.getElementById("d1KioskMsg");

      if (!name || price <= 0) {
        msgEl.textContent = "메뉴 이름과 올바른 가격을 입력해 주세요.";
        return;
      }

      let imageId = "";
      let imageUrl = "";
      let imageData = "";
      if (selectedImgMode === "img" && pendingCompressedImg && pendingCompressedImg.dataUrl) {
        msgEl.textContent = "압축 이미지를 D1 DB에 저장하는 중...";
        const savedImg = await saveMenuImageToD1(pendingCompressedImg.dataUrl);
        imageId = savedImg.imageId || "";
        imageUrl = savedImg.imageUrl || "";
        imageData = savedImg.dataUrl || "";
      }

      const cfg = loadKioskMenuConfigLocal();
      cfg.added.unshift({
        id: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        name,
        price,
        category,
        temp,
        color,
        accent: "#fef3c7",
        desc,
        easyDesc: desc,
        svgPreset: selectedPreset,
        imageId,
        imageUrl,
        imageData
      });
      await saveKioskMenuConfig(cfg);
      document.getElementById("d1KmName").value = "";
      document.getElementById("d1KmDesc").value = "";
      pendingCompressedImg = null;
      updateKmPreview();
      renderKioskMenuManagerList();
      msgEl.textContent = `"${name}" (${price.toLocaleString()}원) 메뉴가 D1에 저장되고 키오스크에 즉시 반영되었습니다!`;
    });

    document.getElementById("d1KmResetAllBtn").addEventListener("click", async () => {
      if (!confirm("교사가 추가한 메뉴와 가격 변경 사항을 모두 기본값으로 되돌릴까요?")) return;
      await saveKioskMenuConfig({ overrides: {}, added: [] });
      renderKioskMenuManagerList();
      document.getElementById("d1KioskMsg").textContent = "키오스크 메뉴와 가격이 기본값으로 복원되었습니다.";
    });
  }

  function renderKioskMenuManagerList() {
    const el = document.getElementById("d1KmMenuList");
    if (!el) return;
    const cfg = loadKioskMenuConfigLocal();
    const rows = [
      ...cfg.added.map((m) => ({ ...m, isCustom: true })),
      ...KIOSK_DEFAULT_CATALOG.map((m) => {
        const ov = cfg.overrides[m.id] || {};
        return {
          ...m,
          price: ov.price !== undefined ? Number(ov.price) : m.price,
          hidden: Boolean(ov.hidden),
          isCustom: false
        };
      })
    ];

    el.innerHTML = rows.map((m) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;background:${m.isCustom ? "#f0fdf4" : m.hidden ? "#f1f5f9" : "#f8fafc"};border:1px solid ${m.isCustom ? "#86efac" : "#e2e8f0"};border-radius:8px;padding:5px 8px;opacity:${m.hidden ? "0.6" : "1"}">
        <div style="min-width:0;flex:1">
          <div style="font-size:12px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${m.isCustom ? "🆕 " : ""}${esc(m.name)} ${m.hidden ? "(숨김)" : ""}
          </div>
        </div>
        <input type="number" class="d1-input" data-km-price="${esc(m.id)}" value="${Number(m.price || 0)}" min="100" step="100" style="width:82px;padding:3px 6px;font-size:12px" />
        <button type="button" class="d1-btn-sm primary" data-km-save="${esc(m.id)}" data-custom="${m.isCustom ? "1" : "0"}" style="padding:3px 7px;font-size:11px">저장</button>
        ${m.isCustom
          ? `<button type="button" class="d1-btn-sm danger" data-km-del="${esc(m.id)}" style="padding:3px 7px;font-size:11px">삭제</button>`
          : `<button type="button" class="d1-btn-sm" data-km-toggle="${esc(m.id)}" style="padding:3px 7px;font-size:11px">${m.hidden ? "보이기" : "숨김"}</button>`}
      </div>
    `).join("");

    el.querySelectorAll("[data-km-save]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.kmSave;
        const isCustom = btn.dataset.custom === "1";
        const inp = el.querySelector(`[data-km-price="${CSS.escape(id)}"]`);
        const newPrice = Math.max(100, Number.parseInt(inp && inp.value, 10) || 0);
        const cur = loadKioskMenuConfigLocal();
        if (isCustom) {
          const item = cur.added.find((x) => x.id === id);
          if (item) item.price = newPrice;
        } else {
          cur.overrides[id] = { ...(cur.overrides[id] || {}), price: newPrice };
        }
        await saveKioskMenuConfig(cur);
        document.getElementById("d1KioskMsg").textContent = `가격(${newPrice.toLocaleString()}원)이 저장·적용되었습니다.`;
        renderKioskMenuManagerList();
      });
    });

    el.querySelectorAll("[data-km-toggle]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.kmToggle;
        const cur = loadKioskMenuConfigLocal();
        const prevHidden = Boolean(cur.overrides[id] && cur.overrides[id].hidden);
        cur.overrides[id] = { ...(cur.overrides[id] || {}), hidden: !prevHidden };
        await saveKioskMenuConfig(cur);
        renderKioskMenuManagerList();
      });
    });

    el.querySelectorAll("[data-km-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.kmDel;
        const cur = loadKioskMenuConfigLocal();
        const target = cur.added.find((x) => x.id === id);
        cur.added = cur.added.filter((x) => x.id !== id);
        if (target && target.imageId) {
          apiFetch("/api/menu-images?id=" + encodeURIComponent(target.imageId), { method: "DELETE" });
        }
        await saveKioskMenuConfig(cur);
        renderKioskMenuManagerList();
        document.getElementById("d1KioskMsg").textContent = "추가 메뉴를 삭제했습니다.";
      });
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
    renderKioskMenuManagerList();
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

  const GLOBAL_AAC_ITEMS = [
    { id: "help", emoji: "🙋", label: "도와주세요", say: "선생님, 도와주세요." },
    { id: "break", emoji: "🌿", label: "쉬고 싶어요", say: "잠깐 쉬고 싶어요." },
    { id: "slow", emoji: "🐢", label: "천천히 해주세요", say: "조금 천천히 해주세요." },
    { id: "repeat", emoji: "🔊", label: "다시 들려주세요", say: "다시 한 번 들려주세요." },
    { id: "done", emoji: "👍", label: "다 했어요", say: "다 했어요!" },
    { id: "water", emoji: "💧", label: "물 마실래요", say: "물 한 모금 마시고 싶어요." },
    { id: "loud", emoji: "👂", label: "소리가 커요", say: "소리가 조금 커요. 조용히 해주세요." },
    { id: "again", emoji: "🔄", label: "다시 할래요", say: "처음부터 다시 해볼래요." }
  ];

  function openAacModal() {
    ensureModals();
    let modal = document.getElementById("d1AacModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "d1AacModal";
      modal.className = "d1-modal-backdrop";
      modal.innerHTML = `
        <div class="d1-modal-card" role="dialog" aria-modal="true" aria-label="도움 말판 (AAC)">
          <div class="d1-modal-head">
            <h2>💬 도움 말판 (눌러서 말해요)</h2>
            <button type="button" class="d1-close-btn" data-close-modal="d1AacModal">닫기</button>
          </div>
          <div style="font-size:13.5px;color:#475569;margin-bottom:10px">말하기 어려울 때 그림을 누르면 소리로 대신 전해드려요.</div>
          <div class="d1-aac-spoken" id="d1AacSpoken" aria-live="polite">
            <span>원하는 그림을 눌러보세요.</span>
          </div>
          <div class="d1-aac-grid" id="d1AacGrid"></div>
          <div class="d1-class-row" style="justify-content:space-between;margin-top:8px">
            <span style="font-size:12.5px;color:#64748b">보완대체의사소통(AAC) 공용 말판</span>
          </div>
        </div>
      `;
      modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
      document.body.appendChild(modal);
      modal.querySelector("[data-close-modal='d1AacModal']").addEventListener("click", () => modal.classList.remove("open"));
    }

    const grid = modal.querySelector("#d1AacGrid");
    const spoken = modal.querySelector("#d1AacSpoken");

    grid.innerHTML = GLOBAL_AAC_ITEMS.map((item) => (
      `<button type="button" class="d1-aac-btn" data-aac-id="${item.id}">
        <span class="d1-aac-emoji">${item.emoji}</span>
        <span>${esc(item.label)}</span>
      </button>`
    )).join("");

    grid.querySelectorAll("[data-aac-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = GLOBAL_AAC_ITEMS.find((x) => x.id === btn.dataset.aacId);
        if (!item) return;
        spoken.innerHTML = `<span>${item.emoji} "${esc(item.say)}"</span><button type="button" class="d1-btn-sm primary" id="d1AacRepeatBtn">🔊 다시 말하기</button>`;
        spoken.querySelector("#d1AacRepeatBtn").addEventListener("click", () => speakText(item.say));
        speakText(item.say);
        if (item.id === "slow" && !spedPrefs.slowPace) {
          setSpedPrefs({ slowPace: true });
        }
      });
    });

    modal.classList.add("open");
  }

  function openSpedSettingsModal() {
    ensureModals();
    let modal = document.getElementById("d1SpedModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "d1SpedModal";
      modal.className = "d1-modal-backdrop";
      modal.innerHTML = `
        <div class="d1-modal-card" role="dialog" aria-modal="true" aria-label="맞춤 학습 지원 설정">
          <div class="d1-modal-head">
            <h2>🛡️ 맞춤 학습 지원 설정</h2>
            <button type="button" class="d1-close-btn" data-close-modal="d1SpedModal">닫기</button>
          </div>
          <div style="font-size:13px;color:#475569;margin-bottom:8px">여기서 설정한 내용은 4개 학습 활동 전체에 바로 적용됩니다.</div>
          <div class="d1-sped-list">
            <label class="d1-sped-item">
              <div>
                <strong>📖 쉬운 말 모드</strong>
                <small>어려운 낱말을 짧고 쉬운 생활 말로 바꾸어 보여줘요.</small>
              </div>
              <input type="checkbox" id="d1PrefEasy" />
            </label>
            <label class="d1-sped-item">
              <div>
                <strong>🔊 화면 자동 읽어주기 (음성 안내)</strong>
                <small>안내 문장과 단계 설명을 또박또박 소리 내어 읽어줘요.</small>
              </div>
              <input type="checkbox" id="d1PrefTts" />
            </label>
            <label class="d1-sped-item">
              <div>
                <strong>🐢 천천히 · 무오류 연습 모드</strong>
                <small>빠른 시간 제한과 방해 요소(강풍·빙판·감점 흔들림)를 줄이고 차분히 연습해요.</small>
              </div>
              <input type="checkbox" id="d1PrefSlow" />
            </label>
          </div>
          <div class="d1-msg" id="d1SpedMsg"></div>
        </div>
      `;
      modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
      document.body.appendChild(modal);
      modal.querySelector("[data-close-modal='d1SpedModal']").addEventListener("click", () => modal.classList.remove("open"));

      const bindPref = (id, key, label) => {
        modal.querySelector(id).addEventListener("change", (e) => {
          setSpedPrefs({ [key]: e.target.checked });
          modal.querySelector("#d1SpedMsg").textContent = `${label}: ${e.target.checked ? "켜짐" : "꺼짐"} (전체 앱에 적용됨)`;
        });
      };
      bindPref("#d1PrefEasy", "easyMode", "쉬운 말 모드");
      bindPref("#d1PrefTts", "ttsAuto", "음성 안내");
      bindPref("#d1PrefSlow", "slowPace", "천천히·무오류 모드");
    }

    const p = getSpedPrefs();
    modal.querySelector("#d1PrefEasy").checked = p.easyMode;
    modal.querySelector("#d1PrefTts").checked = p.ttsAuto;
    modal.querySelector("#d1PrefSlow").checked = p.slowPace;
    modal.querySelector("#d1SpedMsg").textContent = "";
    modal.classList.add("open");
  }

  function openTeacherModal(focusSection = "") {
    ensureModals();
    const modal = document.getElementById("d1TeacherModal");
    modal.classList.add("open");
    const focusTarget = () => {
      if (focusSection === "kiosk") {
        const sec = document.getElementById("d1KioskEditorSection");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (teacherUnlocked) {
      document.getElementById("d1TeacherAuthBox").style.display = "none";
      document.getElementById("d1TeacherBody").style.display = "block";
      refreshTeacherDashboard().then(focusTarget);
    } else {
      document.getElementById("d1TeacherPinInput").value = "";
      document.getElementById("d1TeacherPinInput").focus();
      modal.dataset.pendingFocus = focusSection || "";
    }
  }

  function updateFloatingPill() {
    const btn = document.getElementById("d1FloatingStudentBtn");
    if (!btn) return;
    const ch = getCharacter();
    btn.innerHTML = `${charSvg(ch.id, 20)} <span>${esc(getClassName())} · ${esc(ch.name)}</span>`;
  }

  function mountFloatingBar() {
    applySpedPrefsToDom();
    if (window.D1_HIDE_FLOATING || document.getElementById("d1FloatBar")) return;
    injectSharedStyles();
    const bar = document.createElement("div");
    bar.id = "d1FloatBar";
    bar.className = "d1-float-bar";
    bar.innerHTML = `
      <button type="button" class="d1-float-btn aac" id="d1FloatingAacBtn" title="도움 말판 (AAC)">💬 말판</button>
      <button type="button" class="d1-float-btn sped" id="d1FloatingSpedBtn" title="맞춤 학습 지원 설정">🛡️ 지원</button>
      <button type="button" class="d1-float-btn" id="d1FloatingStudentBtn" title="캐릭터 선택 로그인"></button>
      <button type="button" class="d1-float-btn teacher" id="d1FloatingTeacherBtn" title="교사 모드 (D1 DB 관리)">👩‍🏫 교사</button>
    `;
    document.body.appendChild(bar);
    updateFloatingPill();
    document.getElementById("d1FloatingAacBtn").addEventListener("click", openAacModal);
    document.getElementById("d1FloatingSpedBtn").addEventListener("click", openSpedSettingsModal);
    document.getElementById("d1FloatingStudentBtn").addEventListener("click", openStudentLoginModal);
    document.getElementById("d1FloatingTeacherBtn").addEventListener("click", openTeacherModal);
  }

  function todayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function isTtsGuideDismissedToday() {
    try {
      return localStorage.getItem(TTS_DISMISS_DATE_KEY) === todayDateKey();
    } catch (_) {
      return false;
    }
  }

  function dismissTtsGuideToday() {
    try { localStorage.setItem(TTS_DISMISS_DATE_KEY, todayDateKey()); } catch (_) {}
  }

  function renderTtsGuideBody(env, msgEl, bodyEl, actionRow) {
    const voiceLabel = env.bestVoice ? `${env.bestVoice.name} (${env.bestVoice.lang || "ko-KR"})` : "감지된 한국어 음성 없음";
    if (!env.supported) {
      bodyEl.innerHTML = `
        <div class="d1-t-section" style="background:#fef2f2;border-color:#fca5a5">
          <h3>⚠️ 음성 읽기(TTS) 미지원 브라우저</h3>
          <p style="font-size:13.5px;color:#7f1d1d;line-height:1.55;margin:0">현재 브라우저에서는 음성 읽기 기능을 사용할 수 없습니다. 최신 Chrome 또는 Microsoft Edge 브라우저를 사용해 주세요.</p>
        </div>
      `;
      actionRow.innerHTML = `<button type="button" class="d1-btn-sm" id="d1TtsRecheckBtn">🔄 다시 확인</button>`;
    } else if (env.isAndroid && env.koVoices.length === 0) {
      bodyEl.innerHTML = `
        <div class="d1-t-section" style="background:#fffbeb;border-color:#fcd34d">
          <h3>📱 안드로이드 한국어 TTS 다운로드 안내</h3>
          <p style="font-size:13.5px;color:#78350f;line-height:1.6;margin:0 0 8px">
            현재 기기에 한국어 음성(TTS)이 설치되어 있지 않거나 꺼져 있어요.<br>
            아래 버튼을 눌러 <b>Google 음성 서비스</b>를 설치한 뒤 한국어 음성을 받아 주세요.
          </p>
          <ol style="font-size:13px;color:#334155;line-height:1.65;margin:0;padding-left:18px">
            <li><b>Google 음성 인식 및 합성</b> 앱을 설치 또는 업데이트해요.</li>
            <li>안드로이드 <b>설정 → 일반(또는 접근성) → 글자 읽어주기(TTS)</b>로 이동해요.</li>
            <li>기본 엔진을 <b>Google 음성 인식 및 합성</b>으로 고르고, <b>한국어 음성 데이터</b>를 다운로드해요.</li>
          </ol>
        </div>
        <div style="font-size:12.5px;color:#64748b">현재 감지 상태: <b>${esc(voiceLabel)}</b></div>
      `;
      actionRow.innerHTML = `
        <a class="d1-btn-sm primary" href="https://play.google.com/store/apps/details?id=com.google.android.tts" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px">📥 TTS 다운로드 (Play 스토어)</a>
        <button type="button" class="d1-btn-sm" id="d1TtsTestBtn">🔊 음성 테스트</button>
        <button type="button" class="d1-btn-sm" id="d1TtsRecheckBtn">🔄 다시 확인</button>
      `;
    } else if (env.isWindows && !env.hasEdgeNatural) {
      const canEdgeScheme = /^https?:/i.test(location.protocol || "");
      const edgeHref = `microsoft-edge:${location.href}`;
      bodyEl.innerHTML = `
        <div class="d1-t-section" style="background:#eff6ff;border-color:#93c5fd">
          <h3>🪟 윈도우 EdgeTTS(자연스러운 한국어 음성) 안내</h3>
          <p style="font-size:13.5px;color:#1e3a8a;line-height:1.6;margin:0 0 8px">
            윈도우 기본 음성(Heami 등) 대신 훨씬 자연스럽고 또박또박한 <b>Microsoft Edge 음성(EdgeTTS)</b> 사용을 권장해요.
          </p>
          <ul style="font-size:13px;color:#334155;line-height:1.65;margin:0;padding-left:18px">
            <li><b>Microsoft Edge 브라우저</b>로 이 페이지를 열면 별도 설치 없이 <b>SunHi / InJoon 자연스러운 한국어 음성</b>이 자동 연결됩니다.</li>
            <li>인터넷에 연결되어 있어야 온라인 EdgeTTS 음성을 불러올 수 있어요.</li>
          </ul>
        </div>
        <div style="font-size:12.5px;color:#475569">현재 감지된 음성: <b>${esc(voiceLabel)}</b></div>
      `;
      actionRow.innerHTML = `
        ${canEdgeScheme ? `<a class="d1-btn-sm primary" href="${esc(edgeHref)}" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px">🌐 Microsoft Edge로 열기</a>` : ""}
        <button type="button" class="d1-btn-sm" id="d1TtsTestBtn">🔊 현재 음성 테스트</button>
        <button type="button" class="d1-btn-sm" id="d1TtsRecheckBtn">🔄 다시 확인</button>
      `;
    } else {
      const tag = env.hasEdgeNatural ? "EdgeTTS 자연스러운 음성 연결됨" : "한국어 음성 준비됨";
      bodyEl.innerHTML = `
        <div class="d1-t-section" style="background:#f0fdf4;border-color:#86efac">
          <h3>✅ ${esc(tag)}</h3>
          <p style="font-size:13.5px;color:#166534;line-height:1.55;margin:0">
            현재 사용 중인 음성: <b>${esc(voiceLabel)}</b>
          </p>
        </div>
      `;
      actionRow.innerHTML = `
        <button type="button" class="d1-btn-sm primary" id="d1TtsTestBtn">🔊 음성 테스트</button>
        <button type="button" class="d1-btn-sm" id="d1TtsRecheckBtn">🔄 다시 확인</button>
      `;
    }

    const testBtn = actionRow.querySelector("#d1TtsTestBtn");
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        const ok = speakText("안녕하세요. 반갑습니다. 즐겁게 학습을 시작해 볼까요?");
        msgEl.textContent = ok
          ? `재생 요청됨: ${env.bestVoice ? env.bestVoice.name : "시스템 기본 음성"}`
          : "음성 재생을 시작하지 못했어요.";
      });
    }
    const recheckBtn = actionRow.querySelector("#d1TtsRecheckBtn");
    if (recheckBtn) {
      recheckBtn.addEventListener("click", async () => {
        msgEl.textContent = "음성 목록을 다시 확인하고 있어요...";
        const nextEnv = await inspectTtsEnvironment(1200);
        renderTtsGuideBody(nextEnv, msgEl, bodyEl, actionRow);
        msgEl.textContent = nextEnv.needsGuide
          ? "아직 권장 음성이 확인되지 않았어요."
          : "✅ 자연스러운 한국어 음성이 확인되었어요!";
      });
    }
  }

  async function openTtsGuideModal(preEnv, opts = {}) {
    ensureModals();
    let modal = document.getElementById("d1TtsGuideModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "d1TtsGuideModal";
      modal.className = "d1-modal-backdrop";
      modal.innerHTML = `
        <div class="d1-modal-card" role="dialog" aria-modal="true" aria-label="음성 안내(TTS) 설정 안내">
          <div class="d1-modal-head">
            <h2>🔊 음성 안내(TTS) 환경 확인</h2>
            <button type="button" class="d1-close-btn" data-close-modal="d1TtsGuideModal">닫기</button>
          </div>
          <div id="d1TtsGuideBody"></div>
          <div class="d1-class-row" id="d1TtsGuideActions" style="margin-top:12px"></div>
          <div class="d1-class-row" style="justify-content:space-between;margin-top:8px">
            <button type="button" class="d1-btn-sm" id="d1TtsDismissTodayBtn">오늘 다시 보지 않기</button>
            <span class="d1-msg" id="d1TtsGuideMsg" style="margin:0"></span>
          </div>
        </div>
      `;
      modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
      document.body.appendChild(modal);
      modal.querySelector("[data-close-modal='d1TtsGuideModal']").addEventListener("click", () => modal.classList.remove("open"));
      modal.querySelector("#d1TtsDismissTodayBtn").addEventListener("click", () => {
        dismissTtsGuideToday();
        modal.classList.remove("open");
      });
    }

    const bodyEl = modal.querySelector("#d1TtsGuideBody");
    const actionRow = modal.querySelector("#d1TtsGuideActions");
    const msgEl = modal.querySelector("#d1TtsGuideMsg");
    const dismissBtn = modal.querySelector("#d1TtsDismissTodayBtn");
    msgEl.textContent = "";
    const env = preEnv || await inspectTtsEnvironment(1200);
    if (dismissBtn) dismissBtn.style.display = (opts.autoOpened || env.needsGuide) ? "" : "none";
    renderTtsGuideBody(env, msgEl, bodyEl, actionRow);
    modal.classList.add("open");
    return env;
  }

  function ensureFullscreenStyles() {
    if (document.getElementById("d1FullscreenStyle")) return;
    const style = document.createElement("style");
    style.id = "d1FullscreenStyle";
    style.textContent = `
      html:fullscreen, html:-webkit-full-screen, html:-moz-full-screen {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      html:fullscreen::backdrop, html:-webkit-full-screen::backdrop {
        background: #0f172a;
      }
      html.d1-pseudo-fullscreen,
      html.d1-pseudo-fullscreen body {
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        overflow: hidden !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function isNativeFullscreen() {
    return Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function isFullscreen() {
    return isNativeFullscreen() || document.documentElement.classList.contains("d1-pseudo-fullscreen");
  }

  function dispatchResizeSoon() {
    try { window.dispatchEvent(new Event("resize")); } catch (_) {}
    setTimeout(() => { try { window.dispatchEvent(new Event("resize")); } catch (_) {} }, 120);
  }

  async function toggleFullscreen(targetEl) {
    ensureFullscreenStyles();
    const el = targetEl || document.documentElement;
    if (document.documentElement.classList.contains("d1-pseudo-fullscreen")) {
      document.documentElement.classList.remove("d1-pseudo-fullscreen");
      dispatchResizeSoon();
      return false;
    }
    try {
      if (isNativeFullscreen()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        dispatchResizeSoon();
        return false;
      }
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
      else throw new Error("Fullscreen API unavailable");

      if (!isNativeFullscreen()) {
        document.documentElement.classList.add("d1-pseudo-fullscreen");
      }
      dispatchResizeSoon();
      return isFullscreen();
    } catch (_) {
      document.documentElement.classList.toggle("d1-pseudo-fullscreen");
      dispatchResizeSoon();
      return isFullscreen();
    }
  }

  function bindFullscreenButton(btn, opts = {}) {
    if (!btn) return () => {};
    ensureFullscreenStyles();
    const enterText = opts.enterText || "⛶ 전체화면";
    const exitText = opts.exitText || "⛶ 창모드";
    const activeClass = opts.activeClass || "active";
    const sync = () => {
      const fs = isFullscreen();
      btn.textContent = fs ? exitText : enterText;
      btn.classList.toggle(activeClass, fs);
      btn.setAttribute("aria-pressed", String(fs));
    };
    btn.addEventListener("click", () => {
      toggleFullscreen(opts.target).then(sync);
    });
    const onChange = () => {
      sync();
      dispatchResizeSoon();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("mozfullscreenchange", onChange);
    document.addEventListener("MSFullscreenChange", onChange);
    sync();
    return sync;
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
    openAacModal,
    openSpedSettingsModal,
    getSpedPrefs,
    setSpedPrefs,
    onSpedPrefsChange,
    speakText,
    stopSpeak,
    pickBestKoreanVoice,
    inspectTtsEnvironment,
    openTtsGuideModal,
    isTtsGuideDismissedToday,
    isFullscreen,
    toggleFullscreen,
    bindFullscreenButton,
    checkHealth,
    saveRecord,
    getRecords,
    updateRecord,
    deleteRecord,
    deleteRecordsBulk,
    setKV,
    getKV,
    getKioskMenuConfig: loadKioskMenuConfigLocal,
    saveKioskMenuConfig,
    onKioskMenuChange,
    renderKioskPresetSvg,
    KIOSK_SVG_PRESETS
  };
})();
