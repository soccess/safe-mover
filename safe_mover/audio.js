"use strict";

/* ============================================================
   강화된 효과음 (WebAudio 다중 화음/신디사이저) + 한국어 TTS
   ============================================================ */
window.SafeMoverAudio = (() => {
  let sfxOn = true;
  let voiceOn = true;
  let slowMode = false;
  let AC = null;

  function getAC() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }

  function volScale(v) {
    return v || 0.2;
  }

  function tone(f0, f1, dur, type, vol, delay) {
    if (!sfxOn) return;
    try {
      const c = getAC();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      const t = c.currentTime + (delay || 0);
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(volScale(vol), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  function filteredTone(f0, f1, dur, type, vol, cutoff, delay) {
    if (!sfxOn) return;
    try {
      const c = getAC();
      if (!c) return;
      const o = c.createOscillator();
      const flt = c.createBiquadFilter();
      const g = c.createGain();
      o.type = type || "sawtooth";
      flt.type = "lowpass";
      flt.frequency.value = cutoff || 700;
      const t = c.currentTime + (delay || 0);
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(volScale(vol || 0.16), t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  function noiseBurst(dur, vol, cutoff, delay) {
    if (!sfxOn) return;
    try {
      const c = getAC();
      if (!c) return;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const flt = c.createBiquadFilter();
      flt.type = "bandpass";
      flt.frequency.value = cutoff || 1200;
      const g = c.createGain();
      const t = c.currentTime + (delay || 0);
      g.gain.setValueAtTime(volScale(vol || 0.08), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      src.start(t);
    } catch (_) {}
  }

  function speak(text) {
    try {
      if (!voiceOn || !("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = slowMode ? 0.88 : 0.98;
      u.pitch = 1.06;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  return {
    isOn() { return sfxOn; },
    isVoiceOn() { return voiceOn; },
    setSlow(v) { slowMode = Boolean(v); },
    setVoice(v) {
      voiceOn = Boolean(v);
      if (!voiceOn) { try { speechSynthesis.cancel(); } catch (_) {} }
      return voiceOn;
    },
    setSfx(v) {
      sfxOn = Boolean(v);
      return sfxOn;
    },
    toggle() {
      sfxOn = !sfxOn;
      if (sfxOn) this.tap();
      return sfxOn;
    },
    toggleSfx() {
      return this.toggle();
    },
    toggleVoice() {
      voiceOn = !voiceOn;
      if (voiceOn) this.tap();
      else { try { speechSynthesis.cancel(); } catch (_) {} }
      return voiceOn;
    },
    speak,
    tone,
    step(n) {
      tone(n % 2 ? 310 : 250, n % 2 ? 430 : 340, 0.06, "triangle", 0.07);
      noiseBurst(0.03, 0.02, 900);
    },
    lane() {
      tone(360, 720, 0.11, "sine", 0.14);
      tone(540, 1040, 0.09, "triangle", 0.07, 0.02);
      noiseBurst(0.07, 0.04, 1800);
    },
    spawnCorrect() {
      tone(784, 988, 0.10, "sine", 0.05);
      tone(1174, 1318, 0.11, "triangle", 0.04, 0.05);
    },
    collect(word, comboN) {
      const pitchShift = 1 + Math.min(8, Math.max(0, (comboN || 1) - 1)) * 0.045;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const freq = f * pitchShift;
        tone(freq, freq * 1.03, 0.16, "triangle", 0.16, i * 0.04);
      });
      if (word) {
        setTimeout(() => speak(word), 150);
      }
    },
    powerup() {
      [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
        tone(f, f * 1.08, 0.14, "sine", 0.15, i * 0.045);
      });
    },
    jump() {
      tone(290, 860, 0.22, "sine", 0.16);
      tone(440, 1120, 0.18, "triangle", 0.1, 0.03);
    },
    splash() {
      noiseBurst(0.18, 0.12, 1600);
      tone(480, 260, 0.16, "sine", 0.11);
    },
    shieldBlock() {
      tone(660, 990, 0.15, "triangle", 0.16);
      tone(990, 1320, 0.18, "sine", 0.14, 0.06);
    },
    dodge() {
      tone(784, 1046, 0.10, "sine", 0.10);
    },
    wrongTap() {
      tone(392, 311, 0.18, "sine", 0.10);
      tone(330, 262, 0.18, "triangle", 0.08, 0.07);
    },
    hit() {
      filteredTone(420, 140, 0.28, "triangle", 0.16, 540);
      tone(196, 130, 0.24, "sine", 0.14);
    },
    clear() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, f * 1.01, 0.22, "triangle", 0.16, i * 0.09);
      });
    },
    fanfare() {
      [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, f, 0.26, "triangle", 0.16, i * 0.09);
      });
    },
    tap() { tone(520, 780, 0.07, "sine", 0.12); }
  };
})();
