"use strict";

/* ============================================================================
   마음카페 키오스크 - 일반 키오스크 + 화폐 짝짓기 · 거스름돈 계산 실습
   - 카페 메뉴 데이터 기반 22종(음료 18종 + 베이커리 4종)
   - Web Audio API 다층 신스 음향 + 선택형 카페 BGM
   - Canvas VFX(파티클·링·컨페티·팝업 텍스트) + 장바구니 비행 애니메이션
   - 현금 계산 시 [상품별 화폐 짝짓기] / [거스름돈 계산 & 금고 꺼내기] 활동
   ============================================================================ */

(() => {
  // ==========================================================================
  // 1. 메뉴 데이터 (마음카페 18종 음료 + 4종 베이커리)
  // ==========================================================================
  const CATEGORIES = [
    { id: "all", label: "✨ 전체" },
    { id: "crafted", label: "🏅 실습에서 만든 음료" },
    { id: "coffee", label: "☕ 에스프레소 커피" },
    { id: "latte_tea", label: "🥛 라떼 · 전통차" },
    { id: "ade_smoothie", label: "🫧 에이드 · 스무디 · 프라페" },
    { id: "bakery", label: "🥐 베이커리 · 디저트" }
  ];

  const MENU_ITEMS = [
    // 에스프레소 커피 (7종)
    { id: "hot_americano", name: "따뜻한 아메리카노", price: 3000, category: "coffee", temp: "HOT", best: true, color: "#5c3317", accent: "#8d5524", desc: "향긋한 원두를 깊게 추출한 클래식 아메리카노", easyDesc: "따뜻하고 구수한 기본 커피예요." },
    { id: "iced_americano", name: "아이스 아메리카노", price: 3500, category: "coffee", temp: "ICE", best: true, color: "#4a2511", accent: "#93c5fd", desc: "얼음 가득 시원하고 깔끔한 한국 카페 대표 메뉴", easyDesc: "얼음이 들어간 시원한 커피예요." },
    { id: "hot_latte", name: "따뜻한 카페라떼", price: 4000, category: "coffee", temp: "HOT", best: false, color: "#b07d56", accent: "#fff7ed", desc: "부드러운 스팀 우유와 에스프레소의 조화", easyDesc: "따뜻한 우유가 들어간 부드러운 커피예요." },
    { id: "iced_latte", name: "아이스 카페라떼", price: 4500, category: "coffee", temp: "ICE", best: true, color: "#c2926b", accent: "#fef3c7", desc: "고소한 찬 우유 위로 에스프레소가 어우러진 라떼", easyDesc: "차가운 우유를 넣은 고소한 커피예요." },
    { id: "iced_vanilla_latte", name: "아이스 바닐라라떼", price: 4800, category: "coffee", temp: "ICE", best: false, color: "#d6a87c", accent: "#fde68a", desc: "달콤한 바닐라 시럽이 들어간 향긋한 라떼", easyDesc: "달콤한 바닐라 향이 나는 차가운 커피예요." },
    { id: "iced_caramel_macchiato", name: "카라멜 마끼아또", price: 5200, category: "coffee", temp: "ICE", best: false, color: "#c68b59", accent: "#d97706", desc: "진한 카라멜 소스가 듬뿍 올라간 달콤한 커피", easyDesc: "달콤한 카라멜 시럽이 올라간 커피예요." },
    { id: "iced_cafe_mocha", name: "아이스 카페모카", price: 5500, category: "coffee", temp: "ICE", best: false, color: "#6d3f26", accent: "#fef9c3", whip: true, desc: "초콜릿과 휘핑크림이 어우러진 진한 모카", easyDesc: "초콜릿과 생크림이 올라간 달콤한 커피예요." },

    // 라떼 · 전통차 (5종)
    { id: "hot_choco", name: "따뜻한 핫초코", price: 3800, category: "latte_tea", temp: "HOT", best: true, color: "#5d3420", accent: "#d97706", desc: "진하고 달콤한 코코아와 따뜻한 우유", easyDesc: "커피 없이 달콤하게 마시는 초코 우유예요." },
    { id: "hot_tea", name: "따뜻한 녹차", price: 3000, category: "latte_tea", temp: "HOT", best: false, color: "#84a955", accent: "#bbf7d0", isTea: true, desc: "은은하고 깔끔하게 우려낸 따뜻한 녹차", easyDesc: "몸이 따뜻해지는 향긋한 녹차예요." },
    { id: "hot_yuja_tea", name: "따뜻한 유자차", price: 3500, category: "latte_tea", temp: "HOT", best: false, color: "#f59e0b", accent: "#fef08a", isTea: true, desc: "새콤달콤한 유자청을 듬뿍 넣은 전통차", easyDesc: "달콤상큼한 노란 유자차예요." },
    { id: "iced_matcha_latte", name: "아이스 말차라떼", price: 4500, category: "latte_tea", temp: "ICE", best: false, color: "#4d7c0f", accent: "#ecfccb", desc: "진한 제주 말차와 고소한 우유의 만남", easyDesc: "초록색 말차와 우유가 섞인 음료예요." },
    { id: "strawberry_latte", name: "딸기 라떼", price: 4800, category: "latte_tea", temp: "ICE", best: true, color: "#fb7185", accent: "#ffe4e6", garnish: "strawberry", desc: "달콤한 수제 딸기청과 신선한 우유", easyDesc: "달콤한 딸기가 가득 들어간 분홍 우유예요." },

    // 에이드 · 스무디 · 프라페 (6종)
    { id: "iced_lemonade", name: "아이스 레몬에이드", price: 4200, category: "ade_smoothie", temp: "ICE", best: false, color: "#facc15", accent: "#fef9c3", garnish: "lemon", desc: "톡 쏘는 탄산수와 상큼한 레몬의 청량함", easyDesc: "톡 쏘고 상큼한 노란 레몬 음료예요." },
    { id: "grapefruit_ade", name: "아이스 자몽에이드", price: 4500, category: "ade_smoothie", temp: "ICE", best: false, color: "#fb923c", accent: "#ffedd5", garnish: "grapefruit", desc: "새콤달콤 붉은 자몽이 톡톡 터지는 에이드", easyDesc: "새콤달콤한 주황색 자몽 음료예요." },
    { id: "strawberry_smoothie", name: "딸기 스무디", price: 5300, category: "ade_smoothie", temp: "ICE", best: true, color: "#f43f5e", accent: "#fecdd3", smoothie: true, desc: "얼음과 딸기를 곱게 갈아 만든 시원한 스무디", easyDesc: "얼음과 딸기를 같이 간 시원한 음료예요." },
    { id: "mango_smoothie", name: "망고 스무디", price: 5300, category: "ade_smoothie", temp: "ICE", best: false, color: "#f59e0b", accent: "#fef3c7", smoothie: true, desc: "달콤한 열대 망고를 부드럽게 갈아낸 스무디", easyDesc: "달콤한 망고와 얼음을 간 노란 음료예요." },
    { id: "choco_frappe", name: "초코 휘핑 프라페", price: 5800, category: "ade_smoothie", temp: "ICE", best: false, color: "#6b3e26", accent: "#fffbeb", smoothie: true, whip: true, desc: "진한 초코 스무디 위에 달콤한 휘핑크림 듬뿍", easyDesc: "초코 얼음 음료 위에 생크림이 올라가요." },
    { id: "green_tea_frappe", name: "말차 휘핑 프라페", price: 5800, category: "ade_smoothie", temp: "ICE", best: false, color: "#3f6212", accent: "#f0fdf4", smoothie: true, whip: true, desc: "시원한 말차 프라페와 부드러운 휘핑크림", easyDesc: "초록 말차 음료 위에 생크림이 올라가요." },

    // 베이커리 · 디저트 (4종)
    { id: "croissant", name: "버터 크루아상", price: 3200, category: "bakery", temp: "BAKERY", best: true, color: "#d97706", accent: "#fde68a", bakeryType: "croissant", desc: "겹겹이 바삭하고 고소한 프랑스 정통 크루아상", easyDesc: "바삭하고 고소한 초승달 모양 빵이에요." },
    { id: "choco_donut", name: "초코 글레이즈 도넛", price: 2800, category: "bakery", temp: "BAKERY", best: true, color: "#5c3317", accent: "#f472b6", bakeryType: "donut", desc: "달콤한 초콜릿 코팅이 올라간 폭신한 도넛", easyDesc: "동그란 구멍이 있는 달콤한 초코 도넛이에요." },
    { id: "choco_cake", name: "달콤 초코 브라우니", price: 4500, category: "bakery", temp: "BAKERY", best: false, color: "#451a03", accent: "#f59e0b", bakeryType: "cake", desc: "꾸덕하고 진한 다크 초콜릿 조각 케이크", easyDesc: "진하고 부드러운 초콜릿 케이크예요." },
    { id: "cheese_muffin", name: "촉촉 치즈 머핀", price: 3000, category: "bakery", temp: "BAKERY", best: false, color: "#eab308", accent: "#fef9c3", bakeryType: "muffin", desc: "고소한 체다 치즈가 들어간 부드러운 머핀", easyDesc: "고소한 치즈 맛이 나는 작은 빵이에요." }
  ];

  // 한국 화폐 메타데이터 (동전·지폐 직접 입력 & 짝짓기 & 거스름돈 공용)
  const BILL_DENOMS = [50000, 10000, 5000, 1000];
  const COIN_DENOMS = [500, 100, 50, 10];
  const DENOMINATIONS = [10000, 5000, 1000, 500, 100, 50, 10];
  const MONEY_INFO = {
    50000: { label: "50,000원", type: "bill", bg: "#ca8a04", light: "#fef9c3", border: "#eab308", person: "신사임당" },
    10000: { label: "10,000원", type: "bill", bg: "#15803d", light: "#dcfce7", border: "#22c55e", person: "세종대왕" },
    5000:  { label: "5,000원",  type: "bill", bg: "#c2410c", light: "#ffedd5", border: "#f97316", person: "율곡 이이" },
    1000:  { label: "1,000원",  type: "bill", bg: "#1d4ed8", light: "#dbeafe", border: "#3b82f6", person: "퇴계 이황" },
    500:   { label: "500원",    type: "coin", bg: "#e2e8f0", rim: "#94a3b8", text: "#0f172a", size: 54 },
    100:   { label: "100원",    type: "coin", bg: "#f1f5f9", rim: "#cbd5e1", text: "#1e293b", size: 48 },
    50:    { label: "50원",     type: "coin", bg: "#f8fafc", rim: "#94a3b8", text: "#334155", size: 44 },
    10:    { label: "10원",     type: "coin", bg: "#fdba74", rim: "#c2410c", text: "#7c2d12", size: 40 }
  };

  const MISSION_CUSTOMERS = [
    { avatar: "🐰", name: "토끼 손님" },
    { avatar: "🐻", name: "곰돌이 손님" },
    { avatar: "🦊", name: "여우 손님" },
    { avatar: "🐱", name: "고양이 손님" },
    { avatar: "🐼", name: "판다 손님" },
    { avatar: "🐥", name: "병아리 손님" }
  ];

  // ==========================================================================
  // 2. 강력한 Web Audio API 신스 음향 엔진 + 선택형 BGM
  // ==========================================================================
  const SoundFX = (() => {
    let ctx = null;
    let bgmTimer = null;
    let bgmStep = 0;

    function getCtx() {
      if (!state.soundEnabled && !state.bgmEnabled) return null;
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function tone(freq, dur, type = "sine", vol = 0.08, delay = 0, endFreq = null) {
      if (!state.soundEnabled) return;
      const c = getCtx();
      if (!c) return;
      const t = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t + dur);
      }
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    function noiseBurst(dur, filterFreq, vol = 0.08, delay = 0) {
      if (!state.soundEnabled) return;
      const c = getCtx();
      if (!c) return;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);

      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = filterFreq;
      filter.Q.value = 1.4;

      const gain = c.createGain();
      const t = c.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      src.start(t);
    }

    function touchPop() {
      tone(520, 0.09, "sine", 0.075, 0, 780);
      tone(1040, 0.05, "triangle", 0.03, 0.01);
    }

    function categorySwipe() {
      tone(440, 0.07, "triangle", 0.06, 0, 620);
      noiseBurst(0.05, 1600, 0.03);
    }

    function optionSelect() {
      tone(587.33, 0.1, "triangle", 0.07, 0);
      tone(880, 0.12, "sine", 0.05, 0.04);
    }

    function flyToCart() {
      tone(380, 0.18, "sine", 0.08, 0, 980);
      tone(784, 0.14, "triangle", 0.06, 0.12);
      tone(1046.5, 0.18, "sine", 0.07, 0.2);
    }

    function billSnap() {
      // 지폐가 찰싹! 붙는 바삭한 소리
      noiseBurst(0.085, 2400, 0.11, 0);
      tone(240, 0.08, "triangle", 0.07, 0, 140);
      tone(660, 0.09, "sine", 0.045, 0.03);
    }

    function coinClink(value) {
      // 금속 동전 짤랑! (500원 더 묵직, 100원 더 높고 맑게)
      const base = value >= 500 ? 1850 : 2450;
      tone(base, 0.18, "sine", 0.075, 0);
      tone(base * 1.48, 0.14, "triangle", 0.05, 0.012);
      tone(base * 2.1, 0.11, "sine", 0.03, 0.035);
    }

    function comboDing(step = 0) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      const f = scale[Math.min(scale.length - 1, Math.max(0, step))];
      tone(f, 0.16, "triangle", 0.065, 0);
      tone(f * 1.5, 0.14, "sine", 0.035, 0.03);
    }

    function acceptorMotor() {
      // 지폐 투입기 위이잉-삐빅!
      tone(170, 0.36, "sawtooth", 0.045, 0, 260);
      noiseBurst(0.28, 900, 0.05, 0.02);
      tone(1174.66, 0.1, "sine", 0.08, 0.42);
      tone(1567.98, 0.14, "sine", 0.08, 0.54);
    }

    function cardBeep() {
      // 카드 단말기 삐빅! + 승인 멜로디
      tone(1480, 0.09, "square", 0.045, 0);
      tone(1480, 0.09, "square", 0.045, 0.13);
      tone(783.99, 0.14, "triangle", 0.07, 0.32);
      tone(1046.5, 0.2, "triangle", 0.08, 0.45);
    }

    function registerChaChing() {
      // 금고 열림 차르릉-땡!
      noiseBurst(0.12, 3200, 0.08, 0);
      tone(1318.5, 0.25, "sine", 0.09, 0.06);
      tone(2093.0, 0.45, "sine", 0.08, 0.14);
      tone(2637.0, 0.38, "triangle", 0.05, 0.18);
    }

    function receiptPrint() {
      // 감열지 영수증 지이잉-틱!
      for (let i = 0; i < 6; i++) {
        noiseBurst(0.06, 1800 + i * 140, 0.045, i * 0.09);
      }
      tone(880, 0.08, "triangle", 0.06, 0.58);
    }

    function fanfare() {
      // 웅장하고 신나는 아케이드 팡파레
      const notes = [
        [523.25, 0, 0.14],
        [659.25, 0.1, 0.14],
        [783.99, 0.2, 0.14],
        [1046.5, 0.32, 0.38],
        [783.99, 0.48, 0.12],
        [1046.5, 0.6, 0.45]
      ];
      notes.forEach(([f, d, len]) => {
        tone(f, len, "triangle", 0.085, d);
        tone(f * 0.5, len, "sine", 0.05, d);
        tone(f * 1.5, len * 0.7, "sine", 0.03, d + 0.02);
      });
    }

    function gentleBoing() {
      tone(310, 0.14, "sine", 0.07, 0, 220);
      tone(230, 0.18, "triangle", 0.05, 0.08, 170);
    }

    function startBgm() {
      stopBgm();
      if (!state.bgmEnabled) return;
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ];
      const melody = [523.25, 659.25, 587.33, 523.25, 440, 523.25, 587.33, 659.25];
      bgmTimer = setInterval(() => {
        if (!state.bgmEnabled) return;
        const c = getCtx();
        if (!c) return;
        const chord = chords[Math.floor(bgmStep / 4) % chords.length];
        const beat = bgmStep % 4;
        const t = c.currentTime;
        if (beat === 0) {
          chord.forEach((f) => {
            const osc = c.createOscillator();
            const g = c.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(0.014, t + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
            osc.connect(g);
            g.connect(c.destination);
            osc.start(t);
            osc.stop(t + 1.15);
          });
        }
        const mFreq = melody[bgmStep % melody.length];
        const mOsc = c.createOscillator();
        const mGain = c.createGain();
        mOsc.type = "triangle";
        mOsc.frequency.setValueAtTime(mFreq, t);
        mGain.gain.setValueAtTime(0.0001, t);
        mGain.gain.linearRampToValueAtTime(0.018, t + 0.02);
        mGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        mOsc.connect(mGain);
        mGain.connect(c.destination);
        mOsc.start(t);
        mOsc.stop(t + 0.3);
        bgmStep++;
      }, 420);
    }

    function stopBgm() {
      if (bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      }
    }

    return {
      touchPop,
      categorySwipe,
      optionSelect,
      flyToCart,
      billSnap,
      coinClink,
      comboDing,
      acceptorMotor,
      cardBeep,
      registerChaChing,
      receiptPrint,
      fanfare,
      gentleBoing,
      startBgm,
      stopBgm
    };
  })();

  // ==========================================================================
  // 3. 풀스크린 Canvas VFX 엔진 (파티클 · 링 · 컨페티 · 팝업 텍스트)
  // ==========================================================================
  const VFX = (() => {
    const canvas = document.getElementById("vfxCanvas");
    const ctx = canvas.getContext("2d");
    const particles = [];
    const rings = [];
    const popups = [];
    const confetti = [];
    let rafId = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function ensureLoop() {
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function burst(x, y, colors = ["#fbbf24", "#10b981", "#38bdf8", "#fb7185"], count = 18) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const spd = 110 + Math.random() * 210;
        particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 45,
          size: 4 + Math.random() * 5,
          color: colors[i % colors.length],
          alpha: 1,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.3,
          star: i % 3 === 0
        });
      }
      rings.push({ x, y, r: 8, maxR: 75, color: colors[0], alpha: 0.85 });
      ensureLoop();
    }

    function floatText(x, y, text, color = "#059669") {
      popups.push({
        x, y,
        vy: -75,
        text,
        color,
        life: 0,
        maxLife: 0.95
      });
      ensureLoop();
    }

    function launchConfetti(count = 75) {
      const palette = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#eab308", "#8b5cf6"];
      const w = window.innerWidth;
      for (let i = 0; i < count; i++) {
        confetti.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 140,
          vx: (Math.random() - 0.5) * 180,
          vy: 160 + Math.random() * 260,
          w: 8 + Math.random() * 7,
          h: 5 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 10,
          color: palette[i % palette.length],
          life: 0,
          maxLife: 2.3 + Math.random() * 1.1
        });
      }
      ensureLoop();
    }

    function shakeScreen() {
      const shell = document.getElementById("app");
      shell.classList.remove("shake-hit");
      void shell.offsetWidth;
      shell.classList.add("shake-hit");
    }

    let lastTime = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += (r.maxR - r.r) * 0.16;
        r.alpha -= dt * 2.2;
        if (r.alpha <= 0.02) {
          rings.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.vy += 420 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        if (p.star) {
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const a1 = (k * 2 * Math.PI) / 5 - Math.PI / 2;
            const a2 = a1 + Math.PI / 5;
            ctx.lineTo(Math.cos(a1) * p.size * 1.4, Math.sin(a1) * p.size * 1.4);
            ctx.lineTo(Math.cos(a2) * p.size * 0.6, Math.sin(a2) * p.size * 0.6);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.life += dt;
        if (c.life >= c.maxLife || c.y > window.innerHeight + 40) {
          confetti.splice(i, 1);
          continue;
        }
        c.vy += 260 * dt;
        c.x += c.vx * dt + Math.sin(c.life * 6) * 0.8;
        c.y += c.vy * dt;
        c.rot += c.vRot * dt;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, c.life - 1.6) / 1.5);
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      for (let i = popups.length - 1; i >= 0; i--) {
        const t = popups[i];
        t.life += dt;
        if (t.life >= t.maxLife) {
          popups.splice(i, 1);
          continue;
        }
        t.y += t.vy * dt;
        t.vy *= 0.94;
        const alpha = Math.min(1, (1 - t.life / t.maxLife) * 1.4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = "900 18px 'Pretendard','Malgun Gothic',sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      }

      if (particles.length || rings.length || popups.length || confetti.length) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    function elementCenter(el) {
      if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    return { burst, floatText, launchConfetti, shakeScreen, elementCenter };
  })();

  // ==========================================================================
  // 4. SVG 일러스트 생성기 (메뉴 22종 + 한국 화폐 6종)
  // ==========================================================================
  function renderItemSvg(item, size = 88) {
    if (item.category === "bakery") {
      if (item.bakeryType === "croissant") {
        return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
          <circle cx="48" cy="50" r="38" fill="#fef3c7"/>
          <path d="M20 56c8-18 22-26 28-26s20 8 28 26c-8 10-18 13-28 13s-20-3-28-13z" fill="#d97706" stroke="#92400e" stroke-width="2.5"/>
          <path d="M34 36c3 9 3 22 0 30M48 31v38M62 36c-3 9-3 22 0 30" stroke="#fef3c7" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        </svg>`;
      }
      if (item.bakeryType === "donut") {
        return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
          <circle cx="48" cy="50" r="38" fill="#fce7f3"/>
          <circle cx="48" cy="50" r="28" fill="#d97706" stroke="#78350f" stroke-width="2.5"/>
          <path d="M22 46c4-14 14-24 26-24s22 10 26 24c-5 4-10 1-14 4-4 3-7-2-12 0-5 2-8-3-13-1-5 2-9-1-13-3z" fill="#5c3317"/>
          <circle cx="48" cy="50" r="9.5" fill="#fce7f3" stroke="#78350f" stroke-width="2.2"/>
          <rect x="35" y="33" width="6" height="2.5" rx="1" fill="#f472b6" transform="rotate(-20 35 33)"/>
          <rect x="55" y="32" width="6" height="2.5" rx="1" fill="#fde047" transform="rotate(25 55 32)"/>
          <rect x="47" y="27" width="6" height="2.5" rx="1" fill="#38bdf8" transform="rotate(10 47 27)"/>
        </svg>`;
      }
      if (item.bakeryType === "cake") {
        return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
          <circle cx="48" cy="50" r="38" fill="#ffedd5"/>
          <polygon points="22,68 74,68 74,44 22,52" fill="#5c3317" stroke="#2a1608" stroke-width="2.4" stroke-linejoin="round"/>
          <polygon points="22,52 74,44 62,28 22,42" fill="#7c4a2d" stroke="#2a1608" stroke-width="2.4" stroke-linejoin="round"/>
          <line x1="23" y1="60" x2="73" y2="56" stroke="#f59e0b" stroke-width="3"/>
          <circle cx="44" cy="36" r="5" fill="#fde047"/>
        </svg>`;
      }
      return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="50" r="38" fill="#fef9c3"/>
        <path d="M30 48h36l-5 24H35z" fill="#b45309" stroke="#78350f" stroke-width="2.4"/>
        <path d="M25 48c0-13 10-22 23-22s23 9 23 22z" fill="#facc15" stroke="#ca8a04" stroke-width="2.4"/>
        <circle cx="41" cy="37" r="3" fill="#fffbeb"/>
        <circle cx="56" cy="40" r="2.5" fill="#fffbeb"/>
      </svg>`;
    }

    // 음료: HOT vs ICE
    if (item.temp === "HOT") {
      return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
        <circle cx="48" cy="52" r="37" fill="#f5ebe0"/>
        <path d="M36 27c-3-4 3-8 0-12M48 25c-3-5 3-8 0-13M60 27c-3-4 3-8 0-12" fill="none" stroke="#a88b73" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="48" cy="77" rx="26" ry="5" fill="#d6c5b3"/>
        <path d="M67 44h6c4.5 0 7.5 3 7.5 7.5S77.5 59 73 59h-6" fill="none" stroke="#487555" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M27 38h42v21c0 10-7 15-21 15s-21-5-21-15z" fill="#fff" stroke="#487555" stroke-width="2.8" stroke-linejoin="round"/>
        <ellipse cx="48" cy="38" rx="21" ry="5.5" fill="${item.color}" stroke="#487555" stroke-width="2"/>
        ${item.isTea
          ? `<line x1="58" y1="38" x2="65" y2="56" stroke="#64748b" stroke-width="1.5"/><rect x="61" y="54" width="8" height="9" rx="2" fill="#84cc16" stroke="#3f6212" stroke-width="1.2"/>`
          : `<path d="M48 36.5c-1.5-1.8-4-.7-4 1.3 0 2 4 4 4 4s4-2 4-4c0-2-2.5-3.1-4-1.3z" fill="#fff7ed" opacity="0.9"/>`}
      </svg>`;
    }

    // ICE 컵 (투명 아이스컵 + 빨대 + 얼음 + 휘핑/과일 토핑)
    return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">
      <circle cx="48" cy="52" r="37" fill="#eef6ff"/>
      <line x1="56" y1="12" x2="49" y2="42" stroke="#10b981" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M29 34h38l-5 44c-.5 3.5-3 5-14 5s-13.5-1.5-14-5z" fill="rgba(255,255,255,0.65)" stroke="#64748b" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M31 44h34l-4 32c-.4 2.8-2.5 4-13 4s-12.6-1.2-13-4z" fill="${item.color}" opacity="0.9"/>
      <rect x="36" y="45" width="9" height="9" rx="2" fill="rgba(255,255,255,0.55)" transform="rotate(-12 36 45)"/>
      <rect x="49" y="47" width="9" height="9" rx="2" fill="rgba(255,255,255,0.5)" transform="rotate(14 49 47)"/>
      ${item.whip
        ? `<path d="M31 34c0-9 8-14 17-14s17 5 17 14z" fill="#fffdf9" stroke="#cbd5e1" stroke-width="2"/><path d="M36 28c4-3 20-3 24 0" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>`
        : `<ellipse cx="48" cy="34" rx="19" ry="4.5" fill="#ffffff" fill-opacity="0.8" stroke="#64748b" stroke-width="2"/>`}
      ${item.id === "iced_caramel_macchiato" ? `<path d="M34 45q7 5 14 0t14 0" fill="none" stroke="#d97706" stroke-width="2.6" stroke-linecap="round"/>` : ""}
      ${item.garnish === "lemon" ? `<circle cx="64" cy="34" r="8" fill="#facc15" stroke="#ca8a04" stroke-width="1.8"/>` : ""}
      ${item.garnish === "grapefruit" ? `<circle cx="64" cy="34" r="8" fill="#fb923c" stroke="#c2410c" stroke-width="1.8"/>` : ""}
      ${item.garnish === "strawberry" ? `<circle cx="38" cy="67" r="5" fill="#e11d48"/><circle cx="54" cy="64" r="4.5" fill="#e11d48"/>` : ""}
    </svg>`;
  }

  // 선택한 수량만큼 음료·빵 그림을 1:1로 늘려 그려주는 헬퍼 (×2, ×4 대신 실제 그림 여러 개)
  function renderVisualItemStack(item, qty, context = "cart") {
    const count = Math.max(1, Number(qty) || 1);
    const sizeMap = {
      modal:   count === 1 ? 68 : count <= 4 ? 52 : count <= 10 ? 38 : count <= 20 ? 28 : 22,
      cart:    count === 1 ? 42 : count <= 4 ? 30 : count <= 10 ? 23 : count <= 20 ? 19 : 16,
      match:   count === 1 ? 42 : count <= 4 ? 28 : count <= 12 ? 21 : 17,
      card:    count <= 4 ? 22 : count <= 12 ? 17 : 14,
      receipt: count <= 6 ? 22 : count <= 20 ? 16 : 13
    };
    const iconSize = sizeMap[context] || 24;
    const svgOnce = renderItemSvg(item, iconSize);
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `<span class="visual-cup-unit" title="${item.name} (${i + 1}/${count})">${svgOnce}</span>`;
    }
    return html;
  }

  function renderMoneySvg(value, scale = 1) {
    const info = MONEY_INFO[value];
    if (!info) return "";
    if (info.type === "coin") {
      const s = Math.round(info.size * scale);
      const strokeColor = value === 10 ? "#9a3412" : "#64748b";
      const subColor = value === 10 ? "#9a3412" : "#475569";
      return `<svg viewBox="0 0 60 60" width="${s}" height="${s}" aria-label="${info.label}">
        <defs>
          <radialGradient id="coinGrad${value}" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="${info.bg}"/>
            <stop offset="100%" stop-color="${info.rim}"/>
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="27" fill="url(#coinGrad${value})" stroke="${strokeColor}" stroke-width="2.4"/>
        <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="30" y="34" text-anchor="middle" font-size="${value >= 100 ? 15 : 16}" font-weight="900" fill="${info.text}">${value}</text>
        <text x="30" y="46" text-anchor="middle" font-size="8.5" font-weight="800" fill="${subColor}">원</text>
      </svg>`;
    }
    const w = Math.round(108 * scale);
    const h = Math.round(54 * scale);
    return `<svg viewBox="0 0 116 58" width="${w}" height="${h}" aria-label="${info.label}">
      <rect x="2" y="2" width="112" height="54" rx="7" fill="${info.light}" stroke="${info.border}" stroke-width="2.6"/>
      <rect x="6" y="6" width="104" height="46" rx="4" fill="none" stroke="${info.bg}" stroke-opacity="0.32" stroke-width="1.5"/>
      <rect x="44" y="5" width="4" height="48" fill="rgba(255,255,255,0.7)"/>
      <circle cx="90" cy="29" r="14" fill="${info.bg}" fill-opacity="0.16"/>
      <circle cx="90" cy="24" r="5" fill="${info.bg}" fill-opacity="0.55"/>
      <path d="M81 39c2-5 16-5 18 0" fill="${info.bg}" fill-opacity="0.55"/>
      <text x="12" y="24" font-size="13.5" font-weight="900" fill="${info.bg}">${value.toLocaleString()}</text>
      <text x="12" y="41" font-size="10" font-weight="800" fill="${info.bg}">${info.label}</text>
    </svg>`;
  }

  // ==========================================================================
  // 5. 앱 상태
  // ==========================================================================
  const KIOSK_COUNT_KEY = "safe_mover.kiosk.count.v1";
  const KIOSK_ORDERS_KEY = "safe_mover.kiosk.orders.v1";
  const CAFE_MADE_DRINKS_KEY = "safe_mover.cafe.made_drinks.v1";
  const MAX_ITEM_QTY = 50;

  function loadKioskOrders() {
    try {
      const raw = localStorage.getItem(KIOSK_ORDERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function saveKioskOrder(order) {
    const list = loadKioskOrders();
    list.unshift(order);
    const trimmed = list.slice(0, 30);
    try { localStorage.setItem(KIOSK_ORDERS_KEY, JSON.stringify(trimmed)); } catch {}
    if (window.D1Bridge && typeof window.D1Bridge.setKV === "function") {
      window.D1Bridge.setKV(KIOSK_ORDERS_KEY, trimmed);
    }
  }

  function loadCount() {
    try { return Math.max(0, Number(localStorage.getItem(KIOSK_COUNT_KEY) || 0) || 0); } catch { return 0; }
  }
  function saveCount(n) {
    try { localStorage.setItem(KIOSK_COUNT_KEY, String(n)); } catch {}
  }
  function loadMadeDrinks() {
    try {
      const raw = localStorage.getItem(CAFE_MADE_DRINKS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  const state = {
    screen: "welcome", // 'welcome' | 'menu' | 'receipt'
    playMode: "free",  // 'free' | 'mission'
    diningType: "dine_in", // 'dine_in' | 'take_out'
    category: "all",
    cart: [], // { uid, itemId, name, basePrice, unitPrice, qty, optionsLabel, temp, category }
    madeDrinks: loadMadeDrinks(),
    completedCount: loadCount(),
    orderNumber: 101 + (loadCount() % 80),
    soundEnabled: true,
    bgmEnabled: false,
    voiceEnabled: false,
    easyMode: false,

    // 옵션 모달 상태
    optionItem: null,
    optSelections: { size: 0, extra: 0 },
    optQty: 1,

    // 미션 상태
    mission: null,

    // 카드 결제 상태 (올바른 방향 맞추기 + 삽입 + 결제 버튼)
    card: {
      face: "front", // 'front' | 'back'
      rotation: 180, // 0 | 90 | 180 | 270
      inserted: false,
      paying: false
    },

    // 현금 결제 활동 상태
    cashMode: "direct", // 'direct' | 'match' | 'change'
    directCashPlaced: [], // [denom...]
    directChangeBreakdown: [],
    matchSlots: [], // [{ uid, itemId, name, qty, targetAmount, placed: [denom...] }]
    selectedSlotUid: null,
    matchCombo: 0,

    // 거스름돈 계산 상태
    changeCustomPlaced: [],
    changeTender: 0,
    changeTarget: 0,
    changeQuizSolved: false,
    changePlaced: [],
    blindSum: false
  };

  // ==========================================================================
  // 6. DOM 요소 및 유틸리티
  // ==========================================================================
  const $ = (id) => document.getElementById(id);
  const formatWon = (n) => `${Number(n || 0).toLocaleString("ko-KR")}원`;

  function speakKorean(text, force = false) {
    if (!state.voiceEnabled && !force) return;
    if (window.D1Bridge && typeof window.D1Bridge.speakText === "function") {
      window.D1Bridge.speakText(text, 0.92, 1.03);
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  }

  function getCartTotals() {
    let totalQty = 0;
    let totalPrice = 0;
    for (const line of state.cart) {
      totalQty += line.qty;
      totalPrice += line.unitPrice * line.qty;
    }
    return { totalQty, totalPrice };
  }

  function setStepTracker(stepName) {
    const order = ["welcome", "menu", "pay", "receipt"];
    const idx = order.indexOf(stepName);
    document.querySelectorAll(".step-pill").forEach((pill) => {
      const pIdx = order.indexOf(pill.dataset.step);
      pill.classList.toggle("active", pIdx === idx);
      pill.classList.toggle("done", pIdx < idx);
    });
  }

  function showScreen(screenName) {
    state.screen = screenName;
    $("welcomeScreen").classList.toggle("active", screenName === "welcome");
    $("kioskScreen").classList.toggle("active", screenName === "menu");
    $("receiptScreen").classList.toggle("active", screenName === "receipt");
    setStepTracker(screenName === "menu" ? "menu" : screenName === "receipt" ? "receipt" : "welcome");
  }

  function updateScoreBadge(pop = false) {
    const badge = $("scoreBadge");
    badge.textContent = `★ ${state.completedCount}`;
    if (pop) {
      badge.classList.remove("pop");
      void badge.offsetWidth;
      badge.classList.add("pop");
    }
  }

  // ==========================================================================
  // 7. 미션 생성 및 체크
  // ==========================================================================
  function generateMission() {
    const customer = MISSION_CUSTOMERS[Math.floor(Math.random() * MISSION_CUSTOMERS.length)];
    const drinks = MENU_ITEMS.filter((m) => m.category !== "bakery");
    const bakeries = MENU_ITEMS.filter((m) => m.category === "bakery");
    const pick1 = drinks[Math.floor(Math.random() * drinks.length)];
    const wantSecond = Math.random() < 0.72;
    const pool2 = wantSecond ? bakeries : drinks.filter((d) => d.id !== pick1.id);
    const pick2 = pool2[Math.floor(Math.random() * pool2.length)];
    const cashActivity = Math.random() < 0.5 ? "match" : "change";

    const targets = [{ itemId: pick1.id, name: pick1.name, qty: 1 }];
    if (wantSecond && pick2) {
      targets.push({ itemId: pick2.id, name: pick2.name, qty: 1 });
    }
    state.mission = {
      customer,
      targets,
      cashActivity,
      text: wantSecond
        ? `"안녕하세요! ${pick1.name} 1개랑 ${pick2.name} 1개 주문할게요. ${cashActivity === "match" ? "현금으로 상품별 화폐 짝짓기" : "현금으로 거스름돈 계산"} 해주세요!"`
        : `"안녕하세요! ${pick1.name} 1잔 주문하고 싶어요. ${cashActivity === "match" ? "상품에 맞는 화폐를 짝지어" : "현금을 넣고 거스름돈을 계산해"} 주세요!"`
    };
    renderMissionBanner();
  }

  function renderMissionBanner() {
    const banner = $("missionBanner");
    if (state.playMode !== "mission" || !state.mission) {
      banner.classList.add("hidden");
      return;
    }
    banner.classList.remove("hidden");
    $("missionAvatar").textContent = state.mission.customer.avatar;
    $("missionCustomerName").textContent = state.mission.customer.name;
    $("missionText").textContent = state.mission.text;

    const listEl = $("missionChecklist");
    listEl.innerHTML = state.mission.targets.map((t) => {
      const inCart = state.cart
        .filter((c) => c.itemId === t.itemId)
        .reduce((acc, c) => acc + c.qty, 0);
      const ok = inCart >= t.qty;
      return `<span class="mission-chip ${ok ? "done" : ""}">${ok ? "✅" : "⬜"} ${t.name} (${Math.min(inCart, t.qty)}/${t.qty})</span>`;
    }).join("") + `<span class="mission-chip">${state.mission.cashActivity === "match" ? "🪙 현금: 화폐 짝짓기" : "💰 현금: 거스름돈 계산"}</span>`;
  }

  // ==========================================================================
  // 8. 카페실습 연동 + 카테고리 & 메뉴 그리드 렌더링 + 비행 애니메이션
  // ==========================================================================
  function getMadeStats() {
    const entries = Object.values(state.madeDrinks || {}).filter((d) => d && d.count > 0 && MENU_ITEMS.some((m) => m.id === d.id));
    const totalCups = entries.reduce((acc, d) => acc + (Number(d.count) || 0), 0);
    return { kinds: entries.length, totalCups, entries };
  }

  function renderCafeSyncStatus() {
    const stats = getMadeStats();
    const welcomeBadge = $("welcomeCafeSyncBadge");
    if (welcomeBadge) {
      welcomeBadge.innerHTML = stats.kinds > 0
        ? `🏅 카페실습에서 만든 음료 <strong>${stats.kinds}종 (${stats.totalCups}잔)</strong>이 키오스크에 연동되었어요!`
        : `☕ 3D 카페실습에서 음료를 만들면 키오스크에 <strong>내가 만든 음료</strong>로 바로 나타나요!`;
    }
    const syncText = $("cafeSyncText");
    const filterBtn = $("btnFilterCrafted");
    if (syncText) {
      syncText.innerHTML = stats.kinds > 0
        ? `카페실습 제작 음료 <strong>${stats.kinds}종 (총 ${stats.totalCups}잔)</strong>이 연동되어 있어요!`
        : `아직 카페실습에서 완성한 음료가 없어요. 3D 카페에서 음료를 만들면 여기에 표시돼요!`;
    }
    if (filterBtn) {
      filterBtn.classList.toggle("active", state.category === "crafted");
      filterBtn.textContent = state.category === "crafted"
        ? "✨ 전체 메뉴 보기"
        : `🏅 만든 음료만 보기 (${stats.kinds})`;
    }
  }

  function renderCategories() {
    const bar = $("categoryBar");
    const madeStats = getMadeStats();
    renderCafeSyncStatus();

    bar.innerHTML = CATEGORIES.map((c) => {
      let cnt = 0;
      if (c.id === "all") cnt = MENU_ITEMS.length;
      else if (c.id === "crafted") cnt = madeStats.kinds;
      else cnt = MENU_ITEMS.filter((m) => m.category === c.id).length;

      return `<button type="button" class="cat-tab ${state.category === c.id ? "active" : ""}" data-cat="${c.id}" role="tab" aria-selected="${state.category === c.id}">
        <span>${c.label}</span>
        <span class="cat-cnt">${cnt}</span>
      </button>`;
    }).join("");

    bar.querySelectorAll(".cat-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        SoundFX.categorySwipe();
        const pt = VFX.elementCenter(btn);
        VFX.burst(pt.x, pt.y, ["#487555", "#fde047"], 10);
        renderCategories();
        renderMenuGrid();
      });
    });
  }

  function getItemCartQty(itemId) {
    return state.cart.filter((c) => c.itemId === itemId).reduce((acc, c) => acc + c.qty, 0);
  }

  function renderMenuGrid() {
    const grid = $("menuGrid");
    let items = [];
    if (state.category === "all") {
      items = [...MENU_ITEMS].sort((a, b) => {
        const ma = state.madeDrinks[a.id]?.count ? 1 : 0;
        const mb = state.madeDrinks[b.id]?.count ? 1 : 0;
        return mb - ma;
      });
    } else if (state.category === "crafted") {
      items = MENU_ITEMS
        .filter((m) => state.madeDrinks[m.id]?.count > 0)
        .sort((a, b) => String(state.madeDrinks[b.id]?.lastMadeAt || "").localeCompare(String(state.madeDrinks[a.id]?.lastMadeAt || "")));
    } else {
      items = MENU_ITEMS.filter((m) => m.category === state.category);
    }

    if (state.category === "crafted" && !items.length) {
      grid.innerHTML = `<div class="crafted-empty-state">
        <div class="ces-icon">☕</div>
        <h3>아직 3D 카페실습에서 만든 음료가 없어요!</h3>
        <p>3D 바리스타 연습실에서 음료를 1잔 완성하면<br>여기에 내가 직접 만든 음료가 바로 나타납니다.</p>
        <div class="ces-actions">
          <a class="primary-big-btn" href="../cafe/index.html">☕ 3D 카페에서 음료 만들기</a>
          <button type="button" id="btnShowAllFromEmpty" class="secondary-big-btn">✨ 전체 메뉴 먼저 보기</button>
        </div>
      </div>`;
      const showAllBtn = $("btnShowAllFromEmpty");
      if (showAllBtn) {
        showAllBtn.addEventListener("click", () => {
          state.category = "all";
          renderCategories();
          renderMenuGrid();
        });
      }
      return;
    }

    const missionIds = new Set(
      state.playMode === "mission" && state.mission
        ? state.mission.targets.map((t) => t.itemId)
        : []
    );

    grid.innerHTML = items.map((item, idx) => {
      const tempBadge = item.temp === "HOT"
        ? `<span class="item-badge hot">HOT</span>`
        : item.temp === "ICE"
          ? `<span class="item-badge ice">ICE</span>`
          : `<span class="item-badge dessert">빵·디저트</span>`;
      const madeInfo = state.madeDrinks[item.id];
      const madeBadge = madeInfo && madeInfo.count > 0
        ? `<span class="item-badge crafted" title="카페실습에서 완성한 음료">🏅 실습 ${madeInfo.count}잔</span>`
        : "";
      const bestBadge = item.best && !madeBadge ? `<span class="item-badge best">인기</span>` : "";
      const isMission = missionIds.has(item.id);
      const cartQty = getItemCartQty(item.id);
      const cartCupsHtml = cartQty > 0
        ? `<div class="menu-cart-cups" aria-label="담긴 수량 ${cartQty}개">
            ${renderVisualItemStack(item, cartQty, "card")}
          </div>`
        : "";

      return `<article class="menu-card ${isMission ? "mission-target" : ""} ${madeBadge ? "is-crafted" : ""}" data-item-id="${item.id}" style="animation-delay:${Math.min(idx * 24, 240)}ms">
        <div class="menu-badges">${tempBadge}${madeBadge}${bestBadge}</div>
        <div class="menu-illust">${renderItemSvg(item, 86)}</div>
        <div class="menu-name">${item.name}</div>
        <div class="menu-price">${formatWon(item.price)}</div>
        ${cartCupsHtml}
        <div class="menu-card-actions">
          <button type="button" class="btn-quick-add" data-quick="${item.id}">＋ 1개 담기</button>
          <button type="button" class="btn-opt-open" data-opt="${item.id}" title="수량·옵션 고르기">수량·옵션</button>
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll(".menu-card").forEach((card) => {
      const id = card.dataset.itemId;
      const item = MENU_ITEMS.find((m) => m.id === id);
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-quick]")) {
          e.stopPropagation();
          addItemToCart(item, 1, [], 0, card);
          return;
        }
        SoundFX.touchPop();
        openOptionModal(item);
      });
    });
  }

  function animateFlyToCart(sourceEl, item) {
    const cartPanel = document.querySelector(".cart-panel");
    const badgeEl = $("cartCountBadge");
    if (!sourceEl || !badgeEl) return;

    const fromRect = sourceEl.getBoundingClientRect();
    const toRect = badgeEl.getBoundingClientRect();

    const clone = document.createElement("div");
    clone.className = "flying-clone";
    clone.innerHTML = renderItemSvg(item, 68);
    clone.style.left = `${fromRect.left + fromRect.width / 2 - 34}px`;
    clone.style.top = `${fromRect.top + fromRect.height / 2 - 34}px`;
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.left = `${toRect.left - 14}px`;
        clone.style.top = `${toRect.top - 14}px`;
        clone.style.transform = "scale(0.32) rotate(22deg)";
        clone.style.opacity = "0.2";
      });
    });

    setTimeout(() => {
      clone.remove();
      cartPanel.classList.remove("bump");
      void cartPanel.offsetWidth;
      cartPanel.classList.add("bump");
      const pt = VFX.elementCenter(badgeEl);
      VFX.burst(pt.x, pt.y, ["#f59e0b", "#10b981", "#fde047"], 14);
    }, 520);
  }

  function addItemToCart(item, qty = 1, optLabels = [], extraPrice = 0, sourceEl = null) {
    const unitPrice = item.price + extraPrice;
    const optionsLabel = optLabels.length ? optLabels.join(" · ") : "기본";
    const existing = state.cart.find((c) => c.itemId === item.id && c.optionsLabel === optionsLabel);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({
        uid: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        itemId: item.id,
        name: item.name,
        basePrice: item.price,
        unitPrice,
        qty,
        optionsLabel,
        temp: item.temp,
        category: item.category
      });
    }

    SoundFX.flyToCart();
    if (sourceEl) {
      const pt = VFX.elementCenter(sourceEl);
      VFX.floatText(pt.x, pt.y - 24, `+ ${item.name}!`, "#487555");
      animateFlyToCart(sourceEl, item);
    }
    speakKorean(`${item.name} ${qty}개를 장바구니에 담았어요.`);
    renderCart();
    renderMenuGrid();
    renderMissionBanner();
  }

  // ==========================================================================
  // 9. 장바구니 렌더링 (×2 대신 음료 그림 2개, 3개, 34개 1:1 표시!)
  // ==========================================================================
  function renderCart() {
    const list = $("cartList");
    const { totalQty, totalPrice } = getCartTotals();
    $("cartCountBadge").textContent = String(totalQty);
    $("cartTotalQty").textContent = `${totalQty}개`;
    $("cartTotalPrice").textContent = formatWon(totalPrice);
    $("toggleDiningBtn").textContent = state.diningType === "dine_in" ? "🍽️ 매장" : "🛍️ 포장";

    const disabled = state.cart.length === 0;
    $("btnPayCard").disabled = disabled;
    $("btnPayCash").disabled = disabled;

    if (!state.cart.length) {
      list.innerHTML = `<div class="cart-empty">
        <div class="cart-empty-icon">☕</div>
        <p>메뉴를 터치하면<br>여기에 쏙! 담겨요</p>
      </div>`;
      return;
    }

    list.innerHTML = state.cart.map((line) => {
      const item = MENU_ITEMS.find((m) => m.id === line.itemId);
      return `<div class="cart-item" data-uid="${line.uid}">
        <div class="ci-top-row">
          <div class="ci-info">
            <div class="ci-name">${line.name} <span class="ci-qty-pill">${line.qty}개</span></div>
            <div class="ci-opts">${line.optionsLabel} · 개당 ${formatWon(line.unitPrice)}</div>
          </div>
          <div class="ci-price">${formatWon(line.unitPrice * line.qty)}</div>
        </div>
        <div class="ci-visual-cups" aria-label="${line.name} 그림 ${line.qty}개">
          ${renderVisualItemStack(item, line.qty, "cart")}
        </div>
        <div class="ci-controls">
          <button type="button" class="ci-qty-btn" data-act="minus" data-uid="${line.uid}" aria-label="1개 빼기">−</button>
          <span class="ci-qty">${line.qty}개</span>
          <button type="button" class="ci-qty-btn" data-act="plus" data-uid="${line.uid}" aria-label="1개 더하기">＋</button>
          <button type="button" class="ci-del-btn" data-act="del" data-uid="${line.uid}" title="삭제">🗑️</button>
        </div>
      </div>`;
    }).join("");

    list.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.uid;
        const act = btn.dataset.act;
        const idx = state.cart.findIndex((c) => c.uid === uid);
        if (idx < 0) return;
        SoundFX.touchPop();
        if (act === "plus") {
          if (state.cart[idx].qty < MAX_ITEM_QTY) state.cart[idx].qty++;
        } else if (act === "minus") {
          state.cart[idx].qty--;
          if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        } else if (act === "del") {
          state.cart.splice(idx, 1);
        }
        renderCart();
        renderMenuGrid();
        renderMissionBanner();
      });
    });
  }

  // ==========================================================================
  // 10. 옵션 모달
  // ==========================================================================
  function openOptionModal(item) {
    state.optionItem = item;
    state.optSelections = { size: 0, extra: 0 };
    state.optQty = 1;

    $("optPreviewSvg").innerHTML = renderItemSvg(item, 86);
    $("optModalTitle").textContent = item.name;
    $("optModalDesc").textContent = state.easyMode ? item.easyDesc : item.desc;
    $("optBasePrice").textContent = formatWon(item.price);

    const badge = $("optBadge");
    badge.className = `item-badge ${item.temp === "HOT" ? "hot" : item.temp === "ICE" ? "ice" : "dessert"}`;
    badge.textContent = item.temp === "BAKERY" ? "베이커리" : item.temp;

    renderOptionGroups();
    updateOptionPrice();
    $("optionModal").classList.remove("hidden");
  }

  function getOptionDefs(item) {
    if (item.category === "bakery") {
      return [
        {
          key: "size",
          title: "준비 방법",
          choices: [
            { label: "그대로 포장/제공", delta: 0 },
            { label: "따뜻하게 데우기", delta: 0 }
          ]
        },
        {
          key: "extra",
          title: "추가 토핑",
          choices: [
            { label: "기본", delta: 0 },
            { label: "생크림 곁들이기", delta: 500 }
          ]
        }
      ];
    }
    return [
      {
        key: "size",
        title: "컵 크기 (사이즈)",
        choices: [
          { label: "보통 (M)", delta: 0 },
          { label: "크게 (L)", delta: 500 }
        ]
      },
      {
        key: "extra",
        title: item.category === "coffee" ? "커피 추가" : "토핑 추가",
        choices: item.category === "coffee"
          ? [
              { label: "기본", delta: 0 },
              { label: "샷 추가", delta: 500 },
              { label: "연하게", delta: 0 }
            ]
          : [
              { label: "기본", delta: 0 },
              { label: "휘핑크림 추가", delta: 500 }
            ]
      }
    ];
  }

  function renderOptionGroups() {
    const item = state.optionItem;
    const defs = getOptionDefs(item);
    $("optGroups").innerHTML = defs.map((g) => `
      <div>
        <div class="opt-group-title">${g.title}</div>
        <div class="opt-choices">
          ${g.choices.map((ch, idx) => `
            <button type="button" class="opt-choice-btn ${state.optSelections[g.key] === idx ? "active" : ""}" data-okey="${g.key}" data-oidx="${idx}">
              <span>${ch.label}</span>
              <small>${ch.delta > 0 ? `+${formatWon(ch.delta)}` : "+0원"}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `).join("");

    $("optGroups").querySelectorAll(".opt-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.optSelections[btn.dataset.okey] = Number(btn.dataset.oidx);
        SoundFX.optionSelect();
        renderOptionGroups();
        updateOptionPrice();
      });
    });
  }

  function updateOptionPrice() {
    const item = state.optionItem;
    const defs = getOptionDefs(item);
    let delta = 0;
    const labels = [];
    defs.forEach((g) => {
      const ch = g.choices[state.optSelections[g.key]] || g.choices[0];
      delta += ch.delta;
      if (ch.label !== "기본" && ch.label !== "보통 (M)" && ch.label !== "그대로 포장/제공") {
        labels.push(ch.label);
      }
    });
    const final = (item.price + delta) * state.optQty;
    $("optQtyValue").textContent = `${state.optQty}개`;
    $("optFinalPrice").textContent = formatWon(final);

    // 1:1 음료 그림 수량 미리보기 업데이트 (2개, 3개, 34개 등)
    const gallery = $("optPreviewGallery");
    const countBadge = $("optVisualCountBadge");
    if (gallery) {
      gallery.innerHTML = renderVisualItemStack(item, state.optQty, "modal");
    }
    if (countBadge) {
      countBadge.textContent = `그림 ${state.optQty}개`;
    }
    return { delta, labels };
  }

  // ==========================================================================
  // 11. 카드 결제 모달 (카드 모양·방향 맞추기 + 단말기 삽입 + 결제 버튼)
  // ==========================================================================
  const INITIAL_WRONG_CARDS = [
    { face: "back", rotation: 0 },
    { face: "front", rotation: 180 },
    { face: "front", rotation: 90 },
    { face: "front", rotation: 270 },
    { face: "back", rotation: 180 }
  ];

  function isCardOrientedCorrectly() {
    return state.card.face === "front" && (state.card.rotation % 360) === 0;
  }

  function updateCardPayUI() {
    const { totalPrice } = getCartTotals();
    const cardEl = $("interactiveCard");
    const statusEl = $("cardOrientationStatus");
    const screenEl = $("terminalScreenText");
    const payBtn = $("btnConfirmCardPay");
    const insertBtn = $("btnInsertCard");
    const ejectBtn = $("btnEjectCard");
    const rotateBtn = $("btnRotateCard");
    const flipBtn = $("btnFlipCard");
    const slotCard = $("insertedCardInSlot");
    const led = $("terminalLed");

    if (cardEl) {
      const flipY = state.card.face === "back" ? 180 : 0;
      cardEl.style.transform = `rotate(${state.card.rotation}deg) rotateY(${flipY}deg)`;
      cardEl.classList.toggle("inserted-hidden", state.card.inserted);
      cardEl.classList.toggle("ready-glow", !state.card.inserted && isCardOrientedCorrectly());
    }
    if (slotCard) slotCard.classList.toggle("hidden", !state.card.inserted);
    if (insertBtn) insertBtn.classList.toggle("hidden", state.card.inserted);
    if (ejectBtn) ejectBtn.classList.toggle("hidden", !state.card.inserted || state.card.paying);
    if (rotateBtn) rotateBtn.disabled = state.card.inserted || state.card.paying;
    if (flipBtn) flipBtn.disabled = state.card.inserted || state.card.paying;

    if (state.card.inserted) {
      if (led) led.className = "slot-led ready";
      if (!state.card.paying) {
        screenEl.innerHTML = "✅ 카드 인식 완료!<br><small>아래 [결제하기] 버튼을 눌러 주세요</small>";
        screenEl.classList.add("success");
      }
      statusEl.className = "card-status-banner ok";
      statusEl.textContent = "✅ 카드가 올바르게 들어갔어요! 이제 [결제하기] 버튼을 눌러 결제를 완료하세요.";
      payBtn.disabled = state.card.paying;
      payBtn.textContent = state.card.paying
        ? "⏳ 결제 승인 중..."
        : `💳 결제하기 (${formatWon(totalPrice)})`;
    } else {
      if (led) led.className = "slot-led";
      screenEl.innerHTML = "카드를 올바로 넣어주세요<br><small>금색 IC칩이 앞면 위쪽(▲)</small>";
      screenEl.classList.remove("success");
      payBtn.disabled = true;
      payBtn.textContent = "💳 카드를 먼저 올바로 넣어주세요";

      if (isCardOrientedCorrectly()) {
        statusEl.className = "card-status-banner ready";
        statusEl.textContent = "👍 카드 방향이 올바르게 맞춰졌어요! [단말기에 카드 넣기]를 누르거나 위로 끌어놓으세요.";
      } else if (state.card.face === "back") {
        statusEl.className = "card-status-banner warn";
        statusEl.textContent = "⚠️ 지금은 카드 뒷면이에요! [앞/뒤 뒤집기]를 눌러 금색 IC칩이 보이게 해주세요.";
      } else {
        statusEl.className = "card-status-banner warn";
        statusEl.textContent = "🧭 금색 IC칩이 위쪽(▲)을 향하도록 [90° 돌리기]를 눌러 방향을 맞춰 주세요!";
      }
    }
  }

  function openCardPayModal() {
    const { totalPrice } = getCartTotals();
    setStepTracker("pay");
    $("cardPayAmount").textContent = formatWon(totalPrice);
    const pick = INITIAL_WRONG_CARDS[Math.floor(Math.random() * INITIAL_WRONG_CARDS.length)];
    state.card = {
      face: pick.face,
      rotation: pick.rotation,
      inserted: false,
      paying: false
    };
    updateCardPayUI();
    $("cardPayModal").classList.remove("hidden");
    speakKorean(`총 ${totalPrice.toLocaleString()}원입니다. 금색 IC칩이 앞면 위쪽을 향하도록 카드를 맞춘 뒤 단말기에 넣어 주세요.`);
  }

  function tryInsertCard() {
    if (state.card.inserted || state.card.paying) return;
    if (!isCardOrientedCorrectly()) {
      SoundFX.gentleBoing();
      const cardEl = $("interactiveCardScene");
      if (cardEl) {
        cardEl.classList.remove("card-shake");
        void cardEl.offsetWidth;
        cardEl.classList.add("card-shake");
      }
      const led = $("terminalLed");
      if (led) led.className = "slot-led error";
      const pt = VFX.elementCenter($("terminalSlotDrop"));
      if (state.card.face === "back") {
        VFX.floatText(pt.x, pt.y - 16, "뒷면이에요! 앞면으로 뒤집어요", "#e11d48");
        speakKorean("카드가 뒷면이에요. 앞뒤 뒤집기 버튼을 눌러 금색 IC칩이 보이게 해주세요.", true);
      } else {
        VFX.floatText(pt.x, pt.y - 16, "IC칩이 위쪽(▲)을 향해야 해요!", "#e11d48");
        speakKorean("금색 IC칩이 위쪽을 향하도록 돌리기 버튼을 눌러 주세요.", true);
      }
      updateCardPayUI();
      return;
    }

    state.card.inserted = true;
    SoundFX.optionSelect();
    const pt = VFX.elementCenter($("terminalSlotDrop"));
    VFX.burst(pt.x, pt.y, ["#22c55e", "#38bdf8", "#fde047"], 18);
    VFX.floatText(pt.x, pt.y - 20, "카드 인식 완료! 💳", "#15803d");
    updateCardPayUI();
    speakKorean("카드가 올바르게 들어갔어요. 아래 결제하기 버튼을 눌러 주세요.");
  }

  function triggerCardApproval() {
    if (!state.card.inserted || state.card.paying) return;
    state.card.paying = true;
    updateCardPayUI();
    SoundFX.cardBeep();

    const pt = VFX.elementCenter($("terminalUnit"));
    VFX.burst(pt.x, pt.y, ["#38bdf8", "#6366f1", "#4ade80"], 24);
    $("terminalScreenText").innerHTML = "승인 확인 중...<br><small>잠시만 기다려 주세요</small>";

    setTimeout(() => {
      $("terminalScreenText").innerHTML = "✅ 결제 승인 완료!<br><small>감사합니다</small>";
      $("terminalScreenText").classList.add("success");
      VFX.floatText(pt.x, pt.y - 40, "결제 승인 완료! 💳", "#16a34a");
    }, 480);

    setTimeout(() => {
      state.card.paying = false;
      $("cardPayModal").classList.add("hidden");
      completeOrder({
        methodLabel: "신용·체크카드",
        methodCode: "card",
        paidAmount: getCartTotals().totalPrice,
        changeAmount: 0
      });
    }, 1150);
  }

  // ==========================================================================
  // 12. 현금 결제 모달 (1: 동전·지폐 직접 입력 / 2: 상품별 화폐 짝짓기 / 3: 거스름돈 계산)
  // ==========================================================================
  function breakdownKoreanCurrency(amount) {
    let rem = Math.max(0, Math.round(amount));
    const list = [];
    const order = [50000, 10000, 5000, 1000, 500, 100, 50, 10];
    for (const d of order) {
      while (rem >= d) {
        list.push(d);
        rem -= d;
      }
    }
    return list;
  }

  function openCashPayModal() {
    const { totalPrice } = getCartTotals();
    setStepTracker("pay");
    $("cashTotalPill").textContent = `총 ${formatWon(totalPrice)}`;

    // 미션 모드면 미션 추천 활동 탭으로, 자유 주문이면 기본 동전·지폐 직접 입력 탭으로 진입
    const initialMode = (state.playMode === "mission" && state.mission)
      ? state.mission.cashActivity
      : "direct";

    initDirectCashActivity();
    initMatchActivity();
    initChangeActivity();
    switchCashTab(initialMode);
    $("cashPayModal").classList.remove("hidden");
    speakKorean(
      initialMode === "direct"
        ? "현금 결제입니다. 지폐와 동전을 선택해서 주문 금액을 입력해 주세요."
        : initialMode === "match"
          ? "현금 계산입니다. 장바구니 상품과 알맞은 지폐와 동전을 짝지어 올려 보세요."
          : "현금 계산입니다. 주문 금액보다 큰 돈을 넣고 거스름돈을 계산해 보세요."
    );
  }

  function switchCashTab(mode) {
    state.cashMode = mode;
    document.querySelectorAll(".cash-tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.cashmode === mode);
    });
    $("cashDirectView").classList.toggle("active", mode === "direct");
    $("cashMatchView").classList.toggle("active", mode === "match");
    $("cashChangeView").classList.toggle("active", mode === "change");
  }

  // ---------- 활동 1: 동전·지폐 선택해서 금액 입력 결제 ----------
  function initDirectCashActivity() {
    state.directCashPlaced = [];
    state.directChangeBreakdown = [];
    $("directChangePanel").classList.add("hidden");
    $("btnConfirmDirectCash").classList.remove("hidden");
    renderDirectCashActivity();
  }

  function addDirectCash(denom, sourceEl = null) {
    state.directCashPlaced.push(denom);
    if (denom >= 1000) SoundFX.billSnap();
    else SoundFX.coinClink(denom);

    const { totalPrice } = getCartTotals();
    const sum = state.directCashPlaced.reduce((a, b) => a + b, 0);
    const pt = VFX.elementCenter(sourceEl || $("directTrayBox"));
    VFX.burst(pt.x, pt.y, denom >= 1000 ? ["#10b981", "#fde047"] : ["#f59e0b", "#38bdf8"], 10);
    VFX.floatText(pt.x, pt.y - 16, `+${formatWon(denom)}`, "#047857");

    if (sum === totalPrice) {
      SoundFX.comboDing(4);
      speakKorean("금액을 딱 맞게 입력했어요! 현금 결제하기 버튼을 눌러 주세요.");
    }
    $("directChangePanel").classList.add("hidden");
    $("btnConfirmDirectCash").classList.remove("hidden");
    renderDirectCashActivity();
  }

  function renderDirectCashActivity() {
    const { totalPrice } = getCartTotals();
    const paid = state.directCashPlaced.reduce((a, b) => a + b, 0);
    const diff = paid - totalPrice;
    const billCnt = state.directCashPlaced.filter((v) => v >= 1000).length;
    const coinCnt = state.directCashPlaced.filter((v) => v < 1000).length;

    $("directDueAmount").textContent = formatWon(totalPrice);
    $("directPaidAmount").textContent = formatWon(paid);
    $("directCountSummary").textContent = `지폐 ${billCnt}장 · 동전 ${coinCnt}개`;

    const diffBox = $("directDiffBox");
    const diffLabel = $("directDiffLabel");
    const diffAmount = $("directDiffAmount");
    diffBox.classList.remove("lack", "exact", "change");

    if (diff < 0) {
      diffBox.classList.add("lack");
      diffLabel.textContent = "더 필요한 금액";
      diffAmount.textContent = formatWon(Math.abs(diff));
    } else if (diff === 0) {
      diffBox.classList.add("exact");
      diffLabel.textContent = "딱 맞음!";
      diffAmount.textContent = "거스름돈 0원";
    } else {
      diffBox.classList.add("change");
      diffLabel.textContent = "돌려받을 거스름돈";
      diffAmount.textContent = formatWon(diff);
    }

    const pct = Math.min(100, Math.round((paid / Math.max(1, totalPrice)) * 100));
    $("directProgressFill").style.width = `${pct}%`;

    const trayEl = $("directPlacedTray");
    if (!state.directCashPlaced.length) {
      trayEl.innerHTML = `<span class="tray-placeholder">아래 지폐와 동전을 눌러 금액을 입력해 주세요!</span>`;
    } else {
      trayEl.innerHTML = state.directCashPlaced.map((val, idx) => `
        <button type="button" class="placed-money-chip" data-dir-rem="${idx}" title="${MONEY_INFO[val].label} 빼기">
          ${renderMoneySvg(val, val >= 1000 ? 0.68 : 0.78)}
        </button>
      `).join("");
      trayEl.querySelectorAll("[data-dir-rem]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.directCashPlaced.splice(Number(btn.dataset.dirRem), 1);
          SoundFX.touchPop();
          $("directChangePanel").classList.add("hidden");
          $("btnConfirmDirectCash").classList.remove("hidden");
          renderDirectCashActivity();
        });
      });
    }

    const billsEl = $("directWalletBills");
    const coinsEl = $("directWalletCoins");
    billsEl.innerHTML = BILL_DENOMS.map((d) => `
      <button type="button" class="money-btn money-btn-labeled" draggable="true" data-dir-denom="${d}" title="${MONEY_INFO[d].label}">
        ${renderMoneySvg(d, 0.86)}
        <span class="money-sub-lbl">${MONEY_INFO[d].label}</span>
      </button>
    `).join("");
    coinsEl.innerHTML = COIN_DENOMS.map((d) => `
      <button type="button" class="money-btn money-btn-labeled" draggable="true" data-dir-denom="${d}" title="${MONEY_INFO[d].label}">
        ${renderMoneySvg(d, 0.96)}
        <span class="money-sub-lbl">${MONEY_INFO[d].label}</span>
      </button>
    `).join("");

    document.querySelectorAll("#cashDirectView [data-dir-denom]").forEach((btn) => {
      const denom = Number(btn.dataset.dirDenom);
      btn.addEventListener("click", () => addDirectCash(denom, btn));
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", String(denom));
      });
    });

    const payBtn = $("btnConfirmDirectCash");
    payBtn.disabled = paid < totalPrice;
    if (paid < totalPrice) {
      payBtn.textContent = `💵 ${formatWon(totalPrice - paid)} 더 넣어주세요`;
    } else if (diff === 0) {
      payBtn.textContent = `✨ ${formatWon(paid)} 딱 맞게 현금 결제하기!`;
    } else {
      payBtn.textContent = `💵 ${formatWon(paid)} 내고 결제하기 (거스름돈 ${formatWon(diff)})`;
    }
  }

  function showDirectCashHint() {
    const { totalPrice } = getCartTotals();
    const paid = state.directCashPlaced.reduce((a, b) => a + b, 0);
    const rem = totalPrice - paid;
    if (rem <= 0) {
      SoundFX.optionSelect();
      speakKorean("결제할 금액이 충분해요! 아래 현금 결제하기 버튼을 눌러 주세요.", true);
      return;
    }
    const allDenoms = [50000, 10000, 5000, 1000, 500, 100, 50, 10];
    const rec = allDenoms.find((d) => d <= rem) || 100;
    const btn = document.querySelector(`#cashDirectView [data-dir-denom="${rec}"]`);
    if (btn) {
      document.querySelectorAll("#cashDirectView .money-btn").forEach((b) => b.classList.remove("hint-glow"));
      btn.classList.add("hint-glow");
      setTimeout(() => btn.classList.remove("hint-glow"), 2400);
    }
    SoundFX.optionSelect();
    speakKorean(`${rec.toLocaleString()}원을 눌러 넣어 보세요.`, true);
  }

  function confirmDirectCashPayment(sourceEl) {
    const { totalPrice } = getCartTotals();
    const paid = state.directCashPlaced.reduce((a, b) => a + b, 0);
    if (paid < totalPrice) return;

    const change = paid - totalPrice;
    SoundFX.registerChaChing();
    const pt = VFX.elementCenter(sourceEl);
    VFX.burst(pt.x, pt.y, ["#10b981", "#fde047", "#38bdf8"], 28);

    if (change === 0) {
      $("cashPayModal").classList.add("hidden");
      completeOrder({
        methodLabel: "현금 (동전·지폐 직접 입력)",
        methodCode: "cash_direct",
        paidAmount: paid,
        changeAmount: 0
      });
      return;
    }

    // 초과 금액이면 거스름돈 화폐 구성을 눈으로 보여주고 영수증 출력
    state.directChangeBreakdown = breakdownKoreanCurrency(change);
    $("directChangeBadge").textContent = formatWon(change);
    $("directChangeMoneyList").innerHTML = state.directChangeBreakdown.map((val) => `
      <span class="placed-money-chip">${renderMoneySvg(val, val >= 1000 ? 0.68 : 0.78)}</span>
    `).join("");
    $("directChangePanel").classList.remove("hidden");
    $("btnConfirmDirectCash").classList.add("hidden");
    speakKorean(`결제 완료! 거스름돈 ${change.toLocaleString()}원을 확인하고 받아 주세요.`);
  }

  // ---------- 활동 2: 상품별 화폐 짝짓기 ----------
  function initMatchActivity() {
    state.matchCombo = 0;
    state.matchSlots = state.cart.map((line) => ({
      uid: line.uid,
      itemId: line.itemId,
      name: line.name,
      qty: line.qty,
      sub: line.qty > 1 ? `${line.qty}개 · 개당 ${formatWon(line.unitPrice)}` : line.optionsLabel,
      targetAmount: line.unitPrice * line.qty,
      placed: []
    }));
    state.selectedSlotUid = state.matchSlots[0]?.uid || null;
    renderMatchActivity();
  }

  function getSlotSum(slot) {
    return slot.placed.reduce((acc, v) => acc + v, 0);
  }

  function placeMoneyOnSlot(slotUid, denom, sourceEl = null) {
    const slot = state.matchSlots.find((s) => s.uid === slotUid);
    if (!slot) return;
    slot.placed.push(denom);

    if (denom >= 1000) SoundFX.billSnap();
    else SoundFX.coinClink(denom);

    const sum = getSlotSum(slot);
    const slotEl = document.querySelector(`.match-slot-card[data-slot-uid="${slotUid}"]`);
    const pt = VFX.elementCenter(slotEl || sourceEl);

    if (sum === slot.targetAmount) {
      state.matchCombo++;
      SoundFX.comboDing(state.matchCombo);
      VFX.burst(pt.x, pt.y, ["#22c55e", "#fde047", "#10b981"], 24);
      VFX.floatText(pt.x, pt.y - 20, "✨ 딱 맞아요!", "#15803d");
      speakKorean(`${slot.name} 금액을 정확히 맞추었어요!`);
      // 다음 미완료 상품으로 자동 이동
      const next = state.matchSlots.find((s) => getSlotSum(s) !== s.targetAmount);
      if (next) state.selectedSlotUid = next.uid;
    } else if (sum > slot.targetAmount) {
      SoundFX.gentleBoing();
      VFX.floatText(pt.x, pt.y - 20, `${formatWon(sum - slot.targetAmount)} 넘었어요!`, "#e11d48");
    } else {
      VFX.burst(pt.x, pt.y, ["#fde047", "#38bdf8"], 10);
      VFX.floatText(pt.x, pt.y - 16, `+${formatWon(denom)}`, "#0369a1");
    }

    renderMatchActivity();
  }

  function removeMoneyFromSlot(slotUid, index) {
    const slot = state.matchSlots.find((s) => s.uid === slotUid);
    if (!slot) return;
    slot.placed.splice(index, 1);
    SoundFX.touchPop();
    state.selectedSlotUid = slotUid;
    renderMatchActivity();
  }

  function renderMatchActivity() {
    const grid = $("matchSlotsGrid");
    let matchedCount = 0;

    grid.innerHTML = state.matchSlots.map((slot) => {
      const item = MENU_ITEMS.find((m) => m.id === slot.itemId);
      const sum = getSlotSum(slot);
      const isMatched = sum === slot.targetAmount;
      const isOver = sum > slot.targetAmount;
      const isSelected = state.selectedSlotUid === slot.uid;
      if (isMatched) matchedCount++;

      const pct = Math.min(100, Math.round((sum / Math.max(1, slot.targetAmount)) * 100));
      let statusText = `${formatWon(sum)} / ${formatWon(slot.targetAmount)}`;
      if (isMatched) statusText = "✅ 짝짓기 완료!";
      else if (isOver) statusText = `⚠️ ${formatWon(sum - slot.targetAmount)} 초과 (눌러서 빼기)`;

      const placedHtml = slot.placed.length
        ? slot.placed.map((val, i) => `
            <button type="button" class="placed-money-chip" data-remove-slot="${slot.uid}" data-remove-idx="${i}" title="눌러서 빼기">
              ${renderMoneySvg(val, val >= 1000 ? 0.56 : 0.62)}
            </button>
          `).join("")
        : `<span class="ms-placeholder">여기에 ${formatWon(slot.targetAmount)}을 올려 주세요</span>`;

      return `<div class="match-slot-card ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""} ${isOver ? "overpaid" : ""}" data-slot-uid="${slot.uid}">
        <div class="ms-top">
          <div class="ms-info">
            <div class="ms-title">${slot.name} <span class="ci-qty-pill">${slot.qty}개</span></div>
            <div class="ms-target">가격: ${formatWon(slot.targetAmount)}</div>
          </div>
          <span class="ms-status-pill">${statusText}</span>
        </div>
        <div class="ms-visual-cups" aria-label="${slot.name} 그림 ${slot.qty}개">
          ${renderVisualItemStack(item, slot.qty, "match")}
        </div>
        <div class="ms-progress-track">
          <div class="ms-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="ms-money-dropzone">${placedHtml}</div>
      </div>`;
    }).join("");

    // 카드 선택 & 드래그앤드롭 바인딩
    grid.querySelectorAll(".match-slot-card").forEach((card) => {
      const uid = card.dataset.slotUid;
      card.addEventListener("click", (e) => {
        const remBtn = e.target.closest("[data-remove-slot]");
        if (remBtn) {
          e.stopPropagation();
          removeMoneyFromSlot(remBtn.dataset.removeSlot, Number(remBtn.dataset.removeIdx));
          return;
        }
        state.selectedSlotUid = uid;
        SoundFX.touchPop();
        renderMatchActivity();
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.classList.add("drag-over");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("drag-over");
        const denom = Number(e.dataTransfer.getData("text/plain"));
        if (MONEY_INFO[denom]) {
          state.selectedSlotUid = uid;
          placeMoneyOnSlot(uid, denom, card);
        }
      });
    });

    // 지갑 트레이 렌더링 (상품 합이 5만원 이상이면 5만원권도 포함)
    const maxTarget = Math.max(...state.matchSlots.map((s) => s.targetAmount), 0);
    const walletDenoms = maxTarget >= 20000 ? [50000, ...DENOMINATIONS] : DENOMINATIONS;
    const tray = $("matchWalletTray");
    tray.innerHTML = walletDenoms.map((d) => `
      <button type="button" class="money-btn" draggable="true" data-wallet-denom="${d}" title="${MONEY_INFO[d].label}">
        ${renderMoneySvg(d, d >= 1000 ? 0.88 : 0.96)}
      </button>
    `).join("");

    tray.querySelectorAll(".money-btn").forEach((btn) => {
      const denom = Number(btn.dataset.walletDenom);
      btn.addEventListener("click", () => {
        if (!state.selectedSlotUid && state.matchSlots[0]) {
          state.selectedSlotUid = state.matchSlots[0].uid;
        }
        placeMoneyOnSlot(state.selectedSlotUid, denom, btn);
      });
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", String(denom));
      });
    });

    $("matchProgressBadge").textContent = `${matchedCount} / ${state.matchSlots.length} 상품 완료`;
    const allDone = state.matchSlots.length > 0 && matchedCount === state.matchSlots.length;
    $("btnConfirmMatchPay").disabled = !allDone;
    if (allDone) {
      $("matchGuideText").innerHTML = "🎉 <strong>모든 상품의 화폐 짝짓기를 완료했어요!</strong> 아래 결제하기 버튼을 눌러 영수증을 받으세요!";
    } else {
      $("matchGuideText").innerHTML = "아래 <strong>상품 카드</strong>를 고른 뒤, 지갑에서 알맞은 <strong>지폐·동전</strong>을 눌러 짝지어 올려 주세요! (드래그도 가능해요)";
    }
  }

  function showMatchHint() {
    const slot = state.matchSlots.find((s) => s.uid === state.selectedSlotUid)
      || state.matchSlots.find((s) => getSlotSum(s) !== s.targetAmount);
    if (!slot) return;
    state.selectedSlotUid = slot.uid;
    const diff = slot.targetAmount - getSlotSum(slot);
    if (diff < 0) {
      SoundFX.gentleBoing();
      speakKorean("금액이 조금 넘었어요. 올라간 화폐를 눌러서 빼보세요.");
      return;
    }
    if (diff === 0) return;

    const walletDenoms = [50000, 10000, 5000, 1000, 500, 100, 50, 10];
    const rec = walletDenoms.find((d) => d <= diff) || 100;
    const btn = document.querySelector(`#matchWalletTray .money-btn[data-wallet-denom="${rec}"]`);
    if (btn) {
      document.querySelectorAll("#matchWalletTray .money-btn").forEach((b) => b.classList.remove("hint-glow"));
      btn.classList.add("hint-glow");
      setTimeout(() => btn.classList.remove("hint-glow"), 2400);
    }
    SoundFX.optionSelect();
    speakKorean(`${slot.name}에 ${rec.toLocaleString()}원을 먼저 올려 보세요.`);
  }

  // ---------- 활동 3: 거스름돈 계산 & 금고에서 꺼내기 ----------
  function renderChangeCustomWallet() {
    const { totalPrice } = getCartTotals();
    const sum = state.changeCustomPlaced.reduce((a, b) => a + b, 0);
    const sumEl = $("changeCustomSum");
    const submitBtn = $("btnChangeCustomSubmit");
    if (sumEl) sumEl.textContent = formatWon(sum);
    if (submitBtn) {
      submitBtn.disabled = sum <= totalPrice;
      submitBtn.textContent = sum <= totalPrice
        ? `💵 ${formatWon(totalPrice)}보다 크게 넣어주세요`
        : `💵 ${formatWon(sum)} 내고 거스름돈 계산하기`;
    }

    const walletEl = $("changeCustomWallet");
    if (!walletEl) return;
    const allDenoms = [50000, 10000, 5000, 1000, 500, 100, 50, 10];
    walletEl.innerHTML = allDenoms.map((d) => `
      <button type="button" class="money-btn" data-cc-denom="${d}" title="${MONEY_INFO[d].label}">
        ${renderMoneySvg(d, d >= 1000 ? 0.68 : 0.8)}
      </button>
    `).join("");

    walletEl.querySelectorAll("[data-cc-denom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = Number(btn.dataset.ccDenom);
        state.changeCustomPlaced.push(d);
        if (d >= 1000) SoundFX.billSnap();
        else SoundFX.coinClink(d);
        const pt = VFX.elementCenter(btn);
        VFX.floatText(pt.x, pt.y - 12, `+${formatWon(d)}`, "#047857");
        renderChangeCustomWallet();
      });
    });
  }

  function initChangeActivity() {
    state.changeCustomPlaced = [];
    state.changeTender = 0;
    state.changeTarget = 0;
    state.changeQuizSolved = false;
    state.changePlaced = [];
    $("changeInsertPhase").classList.add("active");
    $("changeCalcPhase").classList.remove("active");
    $("insertedBillAnim").classList.add("hidden");

    const { totalPrice } = getCartTotals();
    $("acceptorDueAmount").textContent = formatWon(totalPrice);

    // 주문 금액보다 큰 현실적인 지불 후보 3~4개 생성 (거스름돈이 반드시 존재하도록)
    const candidates = new Set();
    const nextThousand = Math.ceil((totalPrice + 100) / 1000) * 1000;
    const nextFiveThousand = Math.ceil((totalPrice + 100) / 5000) * 5000;
    const nextTenThousand = Math.ceil((totalPrice + 100) / 10000) * 10000;
    if (nextThousand > totalPrice) candidates.add(nextThousand);
    if (nextFiveThousand > totalPrice) candidates.add(nextFiveThousand);
    if (nextTenThousand > totalPrice) candidates.add(nextTenThousand);
    if (totalPrice < 5000) candidates.add(5000);
    if (totalPrice < 10000) candidates.add(10000);
    if (totalPrice < 20000) candidates.add(20000);
    candidates.add(50000);

    const tenders = [...candidates].filter((v) => v > totalPrice).sort((a, b) => a - b).slice(0, 4);

    const choicesEl = $("tenderChoices");
    choicesEl.innerHTML = tenders.map((amt) => {
      const iconSvg = amt === 50000 || amt === 10000 || amt === 5000
        ? renderMoneySvg(amt, 0.85)
        : `<div style="display:flex;gap:3px;align-items:center">${renderMoneySvg(amt >= 20000 ? 10000 : 1000, 0.78)}<span style="font-size:12px;color:#059669">${formatWon(amt)}</span></div>`;
      return `<button type="button" class="tender-btn" data-tender="${amt}">
        ${iconSvg}
        <span>💵 ${formatWon(amt)} 내기</span>
      </button>`;
    }).join("");

    choicesEl.querySelectorAll(".tender-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const amt = Number(btn.dataset.tender);
        insertCashTender(amt);
      });
    });

    renderChangeCustomWallet();
  }

  function insertCashTender(tenderAmt) {
    const { totalPrice } = getCartTotals();
    state.changeTender = tenderAmt;
    state.changeTarget = tenderAmt - totalPrice;
    state.changeQuizSolved = false;
    state.changePlaced = [];

    SoundFX.acceptorMotor();
    const animEl = $("insertedBillAnim");
    const billKind = tenderAmt >= 50000 ? 50000 : tenderAmt >= 10000 ? 10000 : tenderAmt >= 5000 ? 5000 : 1000;
    animEl.innerHTML = renderMoneySvg(billKind, 0.9);
    animEl.classList.remove("hidden");
    const pt = VFX.elementCenter($("acceptorMachine"));
    VFX.burst(pt.x, pt.y, ["#22c55e", "#fde047"], 18);
    VFX.floatText(pt.x, pt.y - 20, `${formatWon(tenderAmt)} 투입!`, "#10b981");

    setTimeout(() => {
      $("changeInsertPhase").classList.remove("active");
      $("changeCalcPhase").classList.add("active");
      renderChangeCalcPhase();
      speakKorean(`${tenderAmt.toLocaleString()}원을 냈어요. 거스름돈은 얼마일까요?`);
    }, 760);
  }

  function renderChangeCalcPhase() {
    const { totalPrice } = getCartTotals();
    $("eqPaidText").textContent = formatWon(state.changeTender);
    $("eqCostText").textContent = formatWon(totalPrice);

    const eqChangeBox = $("eqChangeBox");
    if (state.changeQuizSolved) {
      $("eqChangeText").textContent = formatWon(state.changeTarget);
      eqChangeBox.style.background = "#dcfce7";
      $("changeQuizStep").classList.add("hidden");
      $("changeTrayStep").classList.remove("hidden");
      renderChangeRegister();
    } else {
      $("eqChangeText").textContent = "? 원";
      eqChangeBox.style.background = "#ecfdf5";
      $("changeQuizStep").classList.remove("hidden");
      $("changeTrayStep").classList.add("hidden");
      renderChangeQuizChoices();
    }
  }

  function renderChangeQuizChoices() {
    const ans = state.changeTarget;
    const set = new Set([ans]);
    const offsets = [-1000, 1000, -500, 500, -200, 200, 2000, -2000];
    for (const off of offsets) {
      if (set.size >= 4) break;
      const cand = ans + off;
      if (cand > 0 && cand < state.changeTender) set.add(cand);
    }
    let bump = 100;
    while (set.size < 4) {
      set.add(ans + bump * 100);
      bump++;
    }
    const options = [...set].sort((a, b) => a - b);

    const wrap = $("changeQuizChoices");
    wrap.innerHTML = options.map((val) => `
      <button type="button" class="quiz-choice-btn" data-qval="${val}">${formatWon(val)}</button>
    `).join("");

    wrap.querySelectorAll(".quiz-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.dataset.qval);
        const pt = VFX.elementCenter(btn);
        if (val === ans) {
          btn.classList.add("correct");
          SoundFX.registerChaChing();
          VFX.burst(pt.x, pt.y, ["#22c55e", "#fde047", "#38bdf8"], 26);
          VFX.floatText(pt.x, pt.y - 20, "정답! 금고가 열려요! 🗄️", "#15803d");
          speakKorean(`정답이에요! 거스름돈 ${ans.toLocaleString()}원을 금고에서 꺼내 주세요.`);
          setTimeout(() => {
            state.changeQuizSolved = true;
            renderChangeCalcPhase();
          }, 550);
        } else {
          btn.classList.add("wrong");
          SoundFX.gentleBoing();
          VFX.floatText(pt.x, pt.y - 16, "다시 계산해 봐요!", "#e11d48");
          speakKorean("조금 달라요. 낸 돈에서 주문 금액을 빼 보세요.");
        }
      });
    });
  }

  function renderChangeRegister() {
    $("targetChangeBadge").textContent = formatWon(state.changeTarget);
    const sum = state.changePlaced.reduce((a, b) => a + b, 0);
    const matched = sum === state.changeTarget;
    const over = sum > state.changeTarget;

    $("currentTraySum").textContent = state.blindSum
      ? `동전·지폐 ${state.changePlaced.length}장/개`
      : `현재: ${formatWon(sum)}`;
    $("currentTraySum").style.background = over ? "#ffe4e6" : matched ? "#22c55e" : "#ecfdf5";
    $("currentTraySum").style.color = over ? "#be123c" : matched ? "#fff" : "#047857";
    $("changeTrayBox").classList.toggle("matched", matched);

    const placedWrap = $("changePlacedMoney");
    if (!state.changePlaced.length) {
      placedWrap.innerHTML = `<span class="tray-placeholder">아래 금고에서 지폐와 동전을 눌러 거스름돈을 올려 주세요!</span>`;
    } else {
      placedWrap.innerHTML = state.changePlaced.map((val, idx) => `
        <button type="button" class="placed-money-chip" data-ch-rem="${idx}" title="눌러서 금고로 돌려놓기">
          ${renderMoneySvg(val, val >= 1000 ? 0.68 : 0.76)}
        </button>
      `).join("");
      placedWrap.querySelectorAll("[data-ch-rem]").forEach((b) => {
        b.addEventListener("click", () => {
          state.changePlaced.splice(Number(b.dataset.chRem), 1);
          SoundFX.touchPop();
          renderChangeRegister();
        });
      });
    }

    const regDenoms = state.changeTarget >= 20000 ? [50000, ...DENOMINATIONS] : DENOMINATIONS;
    const regTray = $("changeRegisterTray");
    regTray.innerHTML = regDenoms.map((d) => `
      <button type="button" class="money-btn" data-reg-denom="${d}" title="${MONEY_INFO[d].label}">
        ${renderMoneySvg(d, d >= 1000 ? 0.88 : 0.96)}
      </button>
    `).join("");

    regTray.querySelectorAll(".money-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const denom = Number(btn.dataset.regDenom);
        state.changePlaced.push(denom);
        if (denom >= 1000) SoundFX.billSnap();
        else SoundFX.coinClink(denom);

        const newSum = state.changePlaced.reduce((a, b) => a + b, 0);
        const pt = VFX.elementCenter($("changeTrayBox"));
        if (newSum === state.changeTarget) {
          SoundFX.comboDing(5);
          VFX.burst(pt.x, pt.y, ["#22c55e", "#fde047", "#10b981"], 28);
          VFX.floatText(pt.x, pt.y - 18, "🎉 거스름돈 완벽!", "#15803d");
          speakKorean("거스름돈을 정확히 맞추었어요! 영수증 받기를 눌러 주세요.");
        } else if (newSum > state.changeTarget) {
          SoundFX.gentleBoing();
          VFX.floatText(pt.x, pt.y - 16, "거스름돈이 넘쳤어요!", "#e11d48");
        } else {
          VFX.burst(pt.x, pt.y, ["#38bdf8", "#fde047"], 10);
          if (!state.blindSum) VFX.floatText(pt.x, pt.y - 14, `+${formatWon(denom)}`, "#1d4ed8");
        }
        renderChangeRegister();
      });
    });

    $("btnConfirmChangePay").disabled = !matched;
  }

  function showChangeHint() {
    if (!state.changeQuizSolved) {
      const { totalPrice } = getCartTotals();
      const tK = Math.floor(state.changeTender / 1000);
      const cK = Math.floor(totalPrice / 1000);
      const rem = totalPrice % 1000;
      SoundFX.optionSelect();
      const hintMsg = rem === 0
        ? `${tK}천원에서 ${cK}천원을 빼면 ${tK - cK}천원(${formatWon(state.changeTarget)})이에요!`
        : `${formatWon(state.changeTender)}에서 ${formatWon(totalPrice)}을 빼면 ${formatWon(state.changeTarget)}이에요!`;
      speakKorean(hintMsg, true);
      const pt = VFX.elementCenter($("changeQuizStep"));
      VFX.floatText(pt.x, pt.y - 10, `💡 ${hintMsg}`, "#b45309");
      return;
    }

    const sum = state.changePlaced.reduce((a, b) => a + b, 0);
    const diff = state.changeTarget - sum;
    if (diff <= 0) {
      SoundFX.gentleBoing();
      speakKorean("올라간 돈을 눌러 조금 빼 보세요.");
      return;
    }
    const rec = [50000, 10000, 5000, 1000, 500, 100, 50, 10].find((d) => d <= diff) || 100;
    const btn = document.querySelector(`#changeRegisterTray .money-btn[data-reg-denom="${rec}"]`);
    if (btn) {
      btn.classList.add("hint-glow");
      setTimeout(() => btn.classList.remove("hint-glow"), 2400);
    }
    SoundFX.optionSelect();
    speakKorean(`금고에서 ${rec.toLocaleString()}원을 꺼내 올려 보세요.`);
  }

  // ==========================================================================
  // 13. 주문 완료 · 영수증 출력 · D1 저장
  // ==========================================================================
  function completeOrder(payInfo) {
    const { totalQty, totalPrice } = getCartTotals();
    state.completedCount++;
    state.orderNumber = 100 + state.completedCount;
    saveCount(state.completedCount);
    updateScoreBadge(true);

    // 미션 성공 여부 평가
    let missionResultText = "";
    if (state.playMode === "mission" && state.mission) {
      const allMatched = state.mission.targets.every((t) => {
        const cnt = state.cart.filter((c) => c.itemId === t.itemId).reduce((a, c) => a + c.qty, 0);
        return cnt >= t.qty;
      });
      missionResultText = allMatched ? "🎯 손님 미션 완벽 성공!" : "🛍️ 주문 완료 (미션 일부 다름)";
    }

    // 영수증 화면 채우기
    $("orderNumberText").textContent = String(state.orderNumber);
    $("orderStatusChip").textContent = missionResultText || `✨ ${payInfo.methodLabel} 완료`;
    const nowStr = new Date().toLocaleString("ko-KR", { hour12: false });
    $("receiptMeta").textContent = `${state.diningType === "dine_in" ? "매장 식사" : "포장 주문"} · ${nowStr}`;

    $("receiptItems").innerHTML = state.cart.map((line) => {
      const item = MENU_ITEMS.find((m) => m.id === line.itemId);
      return `<div class="rc-item-block">
        <div class="rc-row">
          <span>${line.name} (${line.qty}개) <small style="color:#64748b">(${line.optionsLabel})</small></span>
          <strong>${formatWon(line.unitPrice * line.qty)}</strong>
        </div>
        <div class="rc-visual-cups">${item ? renderVisualItemStack(item, line.qty, "receipt") : ""}</div>
      </div>`;
    }).join("");

    $("receiptTotals").innerHTML = `
      <div class="rc-row big"><span>합계 (${totalQty}개)</span><span>${formatWon(totalPrice)}</span></div>
      <div class="rc-row"><span>결제 수단</span><span>${payInfo.methodLabel}</span></div>
      <div class="rc-row"><span>받은 금액</span><span>${formatWon(payInfo.paidAmount)}</span></div>
      <div class="rc-row"><span>거스름돈</span><span>${formatWon(payInfo.changeAmount)}</span></div>
    `;

    // 키오스크 주문 데이터 저장 (카페실습에서 불러와 제조할 수 있도록 연동)
    const savedOrder = {
      id: `ord_${Date.now()}_${state.orderNumber}`,
      orderNumber: state.orderNumber,
      diningType: state.diningType,
      methodLabel: payInfo.methodLabel,
      methodCode: payInfo.methodCode,
      totalPrice,
      createdAt: new Date().toISOString(),
      items: state.cart.map((c) => ({
        itemId: c.itemId,
        name: c.name,
        qty: c.qty,
        madeQty: 0,
        optionsLabel: c.optionsLabel,
        category: c.category,
        unitPrice: c.unitPrice
      }))
    };
    saveKioskOrder(savedOrder);

    // 카페 3D 연습실 연동 (주문한 음료 바로 만들기 + 주문서 연결)
    const firstDrink = state.cart.find((c) => c.category !== "bakery");
    const baristaBtn = $("btnGoBarista");
    if (firstDrink) {
      baristaBtn.href = `../cafe/index.html?drink=${encodeURIComponent(firstDrink.itemId)}&order=${encodeURIComponent(savedOrder.id)}`;
      baristaBtn.textContent = `☕ 3D 카페에서 '${firstDrink.name}' 만들어보기`;
      baristaBtn.classList.remove("hidden");
    } else {
      baristaBtn.href = `../cafe/index.html?order=${encodeURIComponent(savedOrder.id)}`;
      baristaBtn.textContent = `☕ 3D 카페 주문서 보러가기`;
      baristaBtn.classList.remove("hidden");
    }

    showScreen("receipt");
    SoundFX.receiptPrint();
    setTimeout(() => {
      SoundFX.fanfare();
      VFX.launchConfetti(90);
      VFX.shakeScreen();
    }, 320);

    speakKorean(`주문이 완료되었습니다. 대기번호는 ${state.orderNumber}번입니다. 감사합니다!`);

    // Cloudflare D1 학습 기록 저장
    if (window.D1Bridge) {
      const itemSummary = state.cart.map((c) => `${c.name}(${c.qty}개)`).join(", ");
      window.D1Bridge.saveRecord({
        game: "kiosk",
        stage: `${payInfo.methodLabel} (${state.playMode === "mission" ? "미션" : "자유주문"})`,
        score: state.completedCount,
        summary: `${itemSummary} · ${formatWon(totalPrice)} (${payInfo.methodLabel})`,
        payload: {
          playMode: state.playMode,
          diningType: state.diningType,
          methodCode: payInfo.methodCode,
          totalPrice,
          paidAmount: payInfo.paidAmount,
          changeAmount: payInfo.changeAmount,
          items: state.cart.map((c) => ({ itemId: c.itemId, name: c.name, qty: c.qty, unitPrice: c.unitPrice, optionsLabel: c.optionsLabel, category: c.category }))
        }
      });
      window.D1Bridge.setKV(KIOSK_COUNT_KEY, state.completedCount);
    }
  }

  // ==========================================================================
  // 14. 이벤트 바인딩 & 초기화
  // ==========================================================================
  function bindEvents() {
    // 주문 방식 선택 (자유 vs 미션)
    document.querySelectorAll(".play-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.playMode = btn.dataset.playmode;
        document.querySelectorAll(".play-mode-btn").forEach((b) => b.classList.toggle("active", b === btn));
        $("modeBadge").textContent = state.playMode === "mission" ? "🎯 손님 미션" : "🛒 자유 주문";
        SoundFX.optionSelect();
        const pt = VFX.elementCenter(btn);
        VFX.burst(pt.x, pt.y, ["#f59e0b", "#fde047"], 12);
      });
    });

    // 매장 / 포장 시작 버튼
    function startOrdering(diningType, btn) {
      state.diningType = diningType;
      state.cart = [];
      SoundFX.flyToCart();
      const pt = VFX.elementCenter(btn);
      VFX.burst(pt.x, pt.y, ["#487555", "#f59e0b", "#fde047"], 24);
      if (state.playMode === "mission") {
        generateMission();
      } else {
        $("missionBanner").classList.add("hidden");
      }
      renderCategories();
      renderMenuGrid();
      renderCart();
      showScreen("menu");
      speakKorean(
        state.playMode === "mission" && state.mission
          ? `${diningType === "dine_in" ? "매장 식사" : "포장 주문"}입니다. ${state.mission.customer.name}의 주문을 담아 보세요.`
          : `${diningType === "dine_in" ? "매장 식사" : "포장 주문"}입니다. 원하시는 메뉴를 골라 주세요.`
      );
    }

    $("btnDineIn").addEventListener("click", (e) => startOrdering("dine_in", e.currentTarget));
    $("btnTakeOut").addEventListener("click", (e) => startOrdering("take_out", e.currentTarget));

    // 미션 버튼
    $("speakMissionBtn").addEventListener("click", () => {
      SoundFX.touchPop();
      if (state.mission) speakKorean(state.mission.text, true);
    });
    $("newMissionBtn").addEventListener("click", () => {
      SoundFX.optionSelect();
      generateMission();
      renderMenuGrid();
      const pt = VFX.elementCenter($("newMissionBtn"));
      VFX.burst(pt.x, pt.y, ["#f59e0b", "#fb7185"], 16);
      if (state.mission) speakKorean(state.mission.text);
    });

    // 장바구니 도구
    $("toggleDiningBtn").addEventListener("click", () => {
      state.diningType = state.diningType === "dine_in" ? "take_out" : "dine_in";
      SoundFX.touchPop();
      renderCart();
    });
    $("clearCartBtn").addEventListener("click", () => {
      if (!state.cart.length) return;
      state.cart = [];
      SoundFX.gentleBoing();
      renderCart();
      renderMenuGrid();
      renderMissionBanner();
    });

    // 카페실습 만든 음료만 보기 토글
    const filterCraftedBtn = $("btnFilterCrafted");
    if (filterCraftedBtn) {
      filterCraftedBtn.addEventListener("click", () => {
        state.category = state.category === "crafted" ? "all" : "crafted";
        SoundFX.categorySwipe();
        renderCategories();
        renderMenuGrid();
      });
    }

    // 옵션 모달
    $("closeOptionModal").addEventListener("click", () => {
      SoundFX.touchPop();
      $("optionModal").classList.add("hidden");
    });
    function adjustOptQty(delta) {
      const next = Math.max(1, Math.min(MAX_ITEM_QTY, state.optQty + delta));
      if (next !== state.optQty) {
        state.optQty = next;
        SoundFX.touchPop();
        updateOptionPrice();
      }
    }
    $("optQtyMinus5").addEventListener("click", () => adjustOptQty(-5));
    $("optQtyMinus").addEventListener("click", () => adjustOptQty(-1));
    $("optQtyPlus").addEventListener("click", () => adjustOptQty(1));
    $("optQtyPlus5").addEventListener("click", () => adjustOptQty(5));
    $("optQtyPlus10").addEventListener("click", () => adjustOptQty(10));
    $("btnAddToCartConfirm").addEventListener("click", (e) => {
      const { delta, labels } = updateOptionPrice();
      const item = state.optionItem;
      $("optionModal").classList.add("hidden");
      addItemToCart(item, state.optQty, labels, delta, e.currentTarget);
    });

    // 결제 버튼
    $("btnPayCard").addEventListener("click", () => {
      SoundFX.touchPop();
      openCardPayModal();
    });
    $("btnPayCash").addEventListener("click", () => {
      SoundFX.touchPop();
      openCashPayModal();
    });

    // 카드 결제 모달 (방향 맞추기 + 단말기 삽입 + 결제하기 버튼)
    $("closeCardModal").addEventListener("click", () => {
      SoundFX.touchPop();
      $("cardPayModal").classList.add("hidden");
      setStepTracker("menu");
    });
    $("btnRotateCard").addEventListener("click", () => {
      if (state.card.inserted || state.card.paying) return;
      state.card.rotation = (state.card.rotation + 90) % 360;
      SoundFX.touchPop();
      updateCardPayUI();
    });
    $("btnFlipCard").addEventListener("click", () => {
      if (state.card.inserted || state.card.paying) return;
      state.card.face = state.card.face === "front" ? "back" : "front";
      SoundFX.optionSelect();
      updateCardPayUI();
    });
    $("btnInsertCard").addEventListener("click", tryInsertCard);
    $("btnEjectCard").addEventListener("click", () => {
      if (state.card.paying) return;
      state.card.inserted = false;
      SoundFX.touchPop();
      updateCardPayUI();
    });
    $("terminalSlotDrop").addEventListener("click", tryInsertCard);
    $("interactiveCard").addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", "kiosk-card");
    });
    $("terminalSlotDrop").addEventListener("dragover", (e) => {
      e.preventDefault();
      $("terminalSlotDrop").classList.add("drag-over");
    });
    $("terminalSlotDrop").addEventListener("dragleave", () => {
      $("terminalSlotDrop").classList.remove("drag-over");
    });
    $("terminalSlotDrop").addEventListener("drop", (e) => {
      e.preventDefault();
      $("terminalSlotDrop").classList.remove("drag-over");
      tryInsertCard();
    });
    $("btnConfirmCardPay").addEventListener("click", triggerCardApproval);

    // 현금 결제 모달
    $("closeCashModal").addEventListener("click", () => {
      SoundFX.touchPop();
      $("cashPayModal").classList.add("hidden");
      setStepTracker("menu");
    });
    document.querySelectorAll(".cash-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        SoundFX.categorySwipe();
        switchCashTab(btn.dataset.cashmode);
      });
    });

    // 활동 1: 동전·지폐 직접 입력 이벤트
    const directTrayBox = $("directTrayBox");
    if (directTrayBox) {
      directTrayBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        directTrayBox.classList.add("drag-over");
      });
      directTrayBox.addEventListener("dragleave", () => directTrayBox.classList.remove("drag-over"));
      directTrayBox.addEventListener("drop", (e) => {
        e.preventDefault();
        directTrayBox.classList.remove("drag-over");
        const denom = Number(e.dataTransfer.getData("text/plain"));
        if (MONEY_INFO[denom]) addDirectCash(denom, directTrayBox);
      });
    }
    $("btnDirectHint").addEventListener("click", showDirectCashHint);
    $("btnDirectReset").addEventListener("click", () => {
      SoundFX.touchPop();
      initDirectCashActivity();
    });
    $("btnConfirmDirectCash").addEventListener("click", (e) => confirmDirectCashPayment(e.currentTarget));
    $("btnFinishDirectChange").addEventListener("click", (e) => {
      const { totalPrice } = getCartTotals();
      const paid = state.directCashPlaced.reduce((a, b) => a + b, 0);
      const change = Math.max(0, paid - totalPrice);
      const pt = VFX.elementCenter(e.currentTarget);
      VFX.burst(pt.x, pt.y, ["#10b981", "#fde047", "#38bdf8"], 30);
      $("cashPayModal").classList.add("hidden");
      completeOrder({
        methodLabel: "현금 (동전·지폐 직접 입력)",
        methodCode: "cash_direct",
        paidAmount: paid,
        changeAmount: change
      });
    });
    $("btnPracticeChangeWithPaid").addEventListener("click", () => {
      const paid = state.directCashPlaced.reduce((a, b) => a + b, 0);
      const { totalPrice } = getCartTotals();
      if (paid <= totalPrice) return;
      SoundFX.categorySwipe();
      switchCashTab("change");
      insertCashTender(paid);
    });

    // 활동 2: 상품별 화폐 짝짓기 이벤트
    $("btnMatchHint").addEventListener("click", showMatchHint);
    $("btnMatchReset").addEventListener("click", () => {
      SoundFX.touchPop();
      initMatchActivity();
    });
    $("btnConfirmMatchPay").addEventListener("click", (e) => {
      const { totalPrice } = getCartTotals();
      SoundFX.registerChaChing();
      const pt = VFX.elementCenter(e.currentTarget);
      VFX.burst(pt.x, pt.y, ["#10b981", "#fde047", "#38bdf8"], 30);
      $("cashPayModal").classList.add("hidden");
      completeOrder({
        methodLabel: "현금 (화폐 짝짓기)",
        methodCode: "cash_match",
        paidAmount: totalPrice,
        changeAmount: 0
      });
    });

    // 활동 3: 거스름돈 계산 이벤트
    $("btnChangeCustomReset").addEventListener("click", () => {
      state.changeCustomPlaced = [];
      SoundFX.touchPop();
      renderChangeCustomWallet();
    });
    $("btnChangeCustomSubmit").addEventListener("click", () => {
      const { totalPrice } = getCartTotals();
      const sum = state.changeCustomPlaced.reduce((a, b) => a + b, 0);
      if (sum > totalPrice) insertCashTender(sum);
    });
    $("btnChangeHint").addEventListener("click", showChangeHint);
    $("btnChangeReset").addEventListener("click", () => {
      SoundFX.touchPop();
      initChangeActivity();
    });
    $("blindSumToggle").addEventListener("change", (e) => {
      state.blindSum = e.target.checked;
      SoundFX.touchPop();
      renderChangeRegister();
    });
    $("btnConfirmChangePay").addEventListener("click", (e) => {
      const pt = VFX.elementCenter(e.currentTarget);
      VFX.burst(pt.x, pt.y, ["#10b981", "#fde047", "#f59e0b"], 30);
      $("cashPayModal").classList.add("hidden");
      completeOrder({
        methodLabel: "현금 (거스름돈 계산)",
        methodCode: "cash_change",
        paidAmount: state.changeTender,
        changeAmount: state.changeTarget
      });
    });

    // 새 주문
    $("btnNewOrder").addEventListener("click", () => {
      SoundFX.touchPop();
      state.cart = [];
      showScreen("welcome");
    });

    // 상단 설정 토글
    $("soundBtn").addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      $("soundBtn").classList.toggle("active", state.soundEnabled);
      $("soundBtn").textContent = state.soundEnabled ? "🔔 효과음: 켜짐" : "🔕 효과음: 꺼짐";
      if (state.soundEnabled) SoundFX.touchPop();
    });

    $("bgmBtn").addEventListener("click", () => {
      state.bgmEnabled = !state.bgmEnabled;
      $("bgmBtn").classList.toggle("active", state.bgmEnabled);
      $("bgmBtn").textContent = state.bgmEnabled ? "🎵 배경음: 켜짐" : "🎵 배경음: 꺼짐";
      if (state.bgmEnabled) SoundFX.startBgm();
      else SoundFX.stopBgm();
    });

    $("voiceBtn").addEventListener("click", () => {
      state.voiceEnabled = !state.voiceEnabled;
      $("voiceBtn").classList.toggle("active", state.voiceEnabled);
      $("voiceBtn").textContent = state.voiceEnabled ? "🔊 음성: 켜짐" : "🔊 음성: 꺼짐";
      if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
        window.D1Bridge.setSpedPrefs({ ttsAuto: state.voiceEnabled });
      }
      if (state.voiceEnabled) speakKorean("음성 안내가 켜졌어요.");
    });

    $("easyBtn").addEventListener("click", () => {
      state.easyMode = !state.easyMode;
      $("easyBtn").classList.toggle("active", state.easyMode);
      SoundFX.touchPop();
      if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
        window.D1Bridge.setSpedPrefs({ easyMode: state.easyMode });
      }
      $("welcomeSubText").innerHTML = state.easyMode
        ? "마시고 싶은 음료를 고르고, <strong>돈을 맞춰 내거나 거스름돈</strong>을 받아 보세요!"
        : "메뉴를 고르고 장바구니에 담은 뒤, <strong>카드 결제</strong>나 <strong>현금(화폐 짝짓기 · 거스름돈 계산)</strong>을 체험해 보세요.";
    });
  }

  function applySpedPrefs(prefs) {
    if (!prefs) return;
    state.voiceEnabled = Boolean(prefs.ttsAuto);
    state.easyMode = Boolean(prefs.easyMode);
    $("voiceBtn").classList.toggle("active", state.voiceEnabled);
    $("voiceBtn").textContent = state.voiceEnabled ? "🔊 음성: 켜짐" : "🔊 음성: 꺼짐";
    $("easyBtn").classList.toggle("active", state.easyMode);
  }

  function syncCafeDrinksFromAllSources() {
    state.madeDrinks = loadMadeDrinks();
    renderCafeSyncStatus();
    if (state.screen === "menu") {
      renderCategories();
      renderMenuGrid();
    }
  }

  function init() {
    updateScoreBadge(false);
    bindEvents();
    renderCafeSyncStatus();

    // 다른 탭에서 카페실습을 완료했을 때 실시간 반영
    window.addEventListener("storage", (e) => {
      if (e.key === CAFE_MADE_DRINKS_KEY) syncCafeDrinksFromAllSources();
    });

    if (window.D1Bridge) {
      if (window.D1Bridge.bindFullscreenButton) {
        window.D1Bridge.bindFullscreenButton($("fullscreenBtn"), { enterText: "⛶", exitText: "⛶ 창" });
      }
      if (window.D1Bridge.getSpedPrefs) {
        applySpedPrefs(window.D1Bridge.getSpedPrefs());
      }
      if (window.D1Bridge.onSpedPrefsChange) {
        window.D1Bridge.onSpedPrefsChange(applySpedPrefs);
      }
      if (window.D1Bridge.getKV) {
        window.D1Bridge.getKV(CAFE_MADE_DRINKS_KEY).then((remote) => {
          if (remote && typeof remote === "object") {
            const local = loadMadeDrinks();
            const merged = { ...local };
            for (const [k, v] of Object.entries(remote)) {
              if (!merged[k] || (v && v.count > (merged[k].count || 0))) {
                merged[k] = v;
              }
            }
            try { localStorage.setItem(CAFE_MADE_DRINKS_KEY, JSON.stringify(merged)); } catch {}
            syncCafeDrinksFromAllSources();
          }
        }).catch(() => {});
      }
    }

    // 카페실습에서 넘어온 경우 (?from=cafe&drink=...) 바로 메뉴 화면으로 연결
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      const drinkId = params.get("drink");
      if (from === "cafe" || (drinkId && MENU_ITEMS.some((m) => m.id === drinkId))) {
        state.category = getMadeStats().kinds > 0 ? "crafted" : "all";
        renderCategories();
        renderMenuGrid();
        renderCart();
        showScreen("menu");
        if (drinkId) {
          const item = MENU_ITEMS.find((m) => m.id === drinkId);
          if (item) setTimeout(() => openOptionModal(item), 220);
        }
        return;
      }
    } catch {}

    showScreen("welcome");
  }

  init();
})();
