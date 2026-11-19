"use strict";

/* ============================================================
   강화된 아케이드 사운드 엔진 (레이어드 SFX + 화이트노이즈 + 경쾌한 BGM + 음성 리액션)
   ============================================================ */
window.MathArcadeAudio = (() => {
  let ctx = null;
  let noiseBuf = null;
  let sfxOn = true;
  let musicOn = true;
  let voiceOn = true;
  let lastSpeakAt = 0;
  let bgmTimer = null;
  let bgmStep = 0;

  // 경쾌한 5음계 마림바/아케이드 멜로디 (Hz)
  const MELODY = [
    523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
    523.25, 587.33, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25
  ];
  const BASS = [
    130.81, 0, 196.0, 0, 174.61, 0, 196.0, 0,
    130.81, 0, 164.81, 0, 196.0, 0, 146.83, 0
  ];

  function ensureCtx() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") ctx.resume();
      if (ctx && !noiseBuf) {
        const len = Math.floor(ctx.sampleRate * 0.25);
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      }
    } catch (_) {}
    return ctx;
  }

  function tone(freq, dur, type = "sine", vol = 0.14, slideTo = null, delay = 0) {
    const c = ensureCtx();
    if (!c) return;
    try {
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (_) {}
  }

  function noise(dur = 0.1, filterFreq = 1200, vol = 0.09, delay = 0) {
    const c = ensureCtx();
    if (!c || !noiseBuf) return;
    try {
      const t0 = c.currentTime + delay;
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(filterFreq, t0);
      filter.Q.setValueAtTime(1.4, t0);
      const g = c.createGain();
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(c.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.01);
    } catch (_) {}
  }

  function play(name, combo = 1) {
    if (!sfxOn) return;
    const boost = Math.min(1.55, 1 + (combo - 1) * 0.06);
    switch (name) {
      case "pop":
        tone(360 * boost, 0.09, "sine", 0.16, 680 * boost);
        tone(720 * boost, 0.08, "triangle", 0.08, 960 * boost, 0.03);
        break;
      case "merge":
        tone(392 * boost, 0.1, "triangle", 0.16, 587 * boost);
        tone(587 * boost, 0.14, "sine", 0.15, 880 * boost, 0.05);
        tone(1174 * boost, 0.12, "sine", 0.08, null, 0.09);
        break;
      case "throw":
        noise(0.11, 900, 0.07);
        tone(250, 0.12, "triangle", 0.13, 540);
        break;
      case "jump":
        tone(240, 0.14, "sine", 0.15, 640);
        tone(480, 0.1, "triangle", 0.07, 820, 0.04);
        break;
      case "slice":
        noise(0.09, 2600, 0.12);
        tone(980, 0.08, "sawtooth", 0.08, 220);
        break;
      case "hit":
        noise(0.11, 520, 0.13);
        tone(160, 0.14, "square", 0.13, 75);
        tone(520 * boost, 0.11, "triangle", 0.12, 780 * boost, 0.02);
        break;
      case "coin":
        tone(1046.5, 0.07, "sine", 0.13);
        tone(1318.5, 0.15, "sine", 0.14, null, 0.06);
        tone(2093, 0.12, "triangle", 0.06, null, 0.08);
        break;
      case "chaching":
      case "exchange":
        noise(0.07, 3400, 0.08);
        tone(1046.5, 0.07, "triangle", 0.14);
        tone(1318.5, 0.08, "triangle", 0.14, null, 0.06);
        tone(1567.98, 0.1, "sine", 0.15, null, 0.12);
        tone(2093.0, 0.24, "sine", 0.16, null, 0.18);
        break;
      case "transform":
        tone(440, 0.1, "triangle", 0.15);
        tone(554.37, 0.1, "triangle", 0.15, null, 0.06);
        tone(659.25, 0.12, "triangle", 0.16, null, 0.12);
        tone(880, 0.25, "sine", 0.18, 1174, 0.18);
        noise(0.14, 1800, 0.06, 0.16);
        break;
      case "hurt":
        noise(0.14, 340, 0.12);
        tone(210, 0.18, "sawtooth", 0.12, 95);
        break;
      case "wave":
        tone(523.25, 0.09, "triangle", 0.14);
        tone(659.25, 0.09, "triangle", 0.14, null, 0.07);
        tone(783.99, 0.18, "sine", 0.16, null, 0.14);
        break;
      case "clear":
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
          tone(f, i === 4 ? 0.4 : 0.12, "triangle", 0.15, null, i * 0.08);
        });
        break;
      default:
        break;
    }
  }

  function startBgm() {
    if (bgmTimer || !musicOn) return;
    bgmTimer = setInterval(() => {
      if (!musicOn || !ctx || ctx.state !== "running") return;
      const m = MELODY[bgmStep % MELODY.length];
      const b = BASS[bgmStep % BASS.length];
      if (m) tone(m, 0.14, "sine", 0.032);
      if (b) tone(b, 0.18, "triangle", 0.042);
      bgmStep = (bgmStep + 1) % MELODY.length;
    }, 210);
  }

  function stopBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function unlock() {
    ensureCtx();
    if (musicOn) startBgm();
  }

  function speak(text, force = false) {
    if (!voiceOn || !text) return;
    const now = Date.now();
    if (!force && now - lastSpeakAt < 1100) return;
    lastSpeakAt = now;
    try {
      if (window.D1Bridge && typeof window.D1Bridge.speakText === "function") {
        window.D1Bridge.speakText(text, 1.04, 1.05);
      } else if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.lang = "ko-KR";
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    } catch (_) {}
  }

  return {
    unlock,
    play,
    speak,
    setSfx(v) { sfxOn = Boolean(v); },
    setMusic(v) {
      musicOn = Boolean(v);
      if (musicOn) { ensureCtx(); startBgm(); }
      else stopBgm();
    },
    setVoice(v) { voiceOn = Boolean(v); },
    isSfx() { return sfxOn; },
    isMusic() { return musicOn; },
    isVoice() { return voiceOn; }
  };
})();
