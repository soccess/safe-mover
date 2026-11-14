"use strict";

/* ============================================================
   강화된 효과음 (WebAudio 다중 화음/신디사이저) + 한국어 TTS
   ============================================================ */
window.SafeMoverAudio = (() => {
  let soundOn = true;
  let AC = null;

  function getAC() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }

  function tone(f0, f1, dur, type, vol, delay) {
    if (!soundOn) return;
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
      g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  function filteredTone(f0, f1, dur, type, vol, cutoff, delay) {
    if (!soundOn) return;
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
      g.gain.linearRampToValueAtTime(vol || 0.16, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  function noiseBurst(dur, vol, cutoff, delay) {
    if (!soundOn) return;
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
      g.gain.setValueAtTime(vol || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      src.start(t);
    } catch (_) {}
  }

  function speak(text) {
    try {
      if (!soundOn || !("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = 1.04;
      u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  return {
    isOn() { return soundOn; },
    toggle() {
      soundOn = !soundOn;
      if (soundOn) this.tap();
      else { try { speechSynthesis.cancel(); } catch (_) {} }
      return soundOn;
    },
    speak,
    tone,
    step(n) {
      tone(n % 2 ? 310 : 250, n % 2 ? 430 : 340, 0.06, "triangle", 0.09);
      noiseBurst(0.03, 0.02, 900);
    },
    lane() {
      tone(360, 720, 0.11, "sine", 0.16);
      tone(540, 1040, 0.09, "triangle", 0.08, 0.02);
      noiseBurst(0.07, 0.04, 1800);
    },
    spawnCorrect() {
      // 멀리서 바른 단어가 나타날 때 주의 집중 반짝음
      tone(880, 1174, 0.10, "sine", 0.07);
      tone(1318, 1567, 0.12, "triangle", 0.05, 0.06);
    },
    collect(word) {
      // 캐릭터가 바른 단어를 잡았을 때 풍성한 화음 + 반짝 멜로디
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, f * 1.02, 0.18, "triangle", 0.19, i * 0.045);
        tone(f * 2, f * 2, 0.12, "sine", 0.06, i * 0.045 + 0.01);
      });
      tone(1567.98, 2093, 0.20, "sine", 0.09, 0.16);
      if (word) {
        setTimeout(() => speak(word), 180);
      }
    },
    dodge() {
      tone(880, 1318, 0.12, "sine", 0.13);
      tone(1318, 1760, 0.12, "triangle", 0.09, 0.05);
    },
    wrongTap() {
      filteredTone(340, 160, 0.22, "sawtooth", 0.14, 650);
      filteredTone(250, 120, 0.22, "triangle", 0.10, 500, 0.05);
    },
    hit() {
      filteredTone(520, 95, 0.36, "sawtooth", 0.22, 540);
      tone(150, 58, 0.34, "sine", 0.22);
      tone(220, 110, 0.24, "square", 0.08, 0.04);
      noiseBurst(0.16, 0.10, 420);
    },
    clear() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, f * 1.01, 0.24, "triangle", 0.2, i * 0.09);
        tone(f * 1.5, f * 1.5, 0.18, "sine", 0.08, i * 0.09 + 0.02);
        tone(f * 0.5, f * 0.5, 0.22, "sine", 0.09, i * 0.09);
      });
    },
    fanfare() {
      [392, 523.25, 659.25, 783.99, 659.25, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, f, 0.3, "triangle", 0.2, i * 0.11);
        tone(f * 0.5, f * 0.5, 0.3, "sine", 0.10, i * 0.11);
        tone(f * 1.5, f * 1.5, 0.22, "sine", 0.06, i * 0.11 + 0.02);
      });
    },
    tap() { tone(520, 960, 0.08, "sine", 0.16); }
  };
})();
