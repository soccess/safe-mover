"use strict";

/* ============================================================
   효과음 (WebAudio) + 한국어 TTS
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
    step(n) { tone(n % 2 ? 290 : 230, n % 2 ? 410 : 320, 0.08, "triangle", 0.11); },
    lane() {
      tone(340, 640, 0.12, "sine", 0.16);
      tone(510, 960, 0.10, "triangle", 0.06, 0.02);
    },
    collect() {
      tone(660, 990, 0.13, "triangle", 0.19);
      tone(990, 1320, 0.16, "sine", 0.18, 0.06);
      tone(1320, 1760, 0.14, "sine", 0.08, 0.11);
    },
    dodge() {
      tone(880, 1240, 0.14, "sine", 0.12);
      tone(1320, 1760, 0.10, "triangle", 0.06, 0.04);
    },
    wrongTap() {
      filteredTone(320, 170, 0.22, "sawtooth", 0.15, 650);
      filteredTone(240, 130, 0.22, "triangle", 0.10, 500, 0.05);
    },
    hit() {
      filteredTone(580, 110, 0.34, "sawtooth", 0.22, 520);
      tone(140, 65, 0.32, "sine", 0.18);
    },
    clear() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, f * 1.01, 0.22, "triangle", 0.2, i * 0.11);
        tone(f * 1.5, f * 1.5, 0.18, "sine", 0.07, i * 0.11 + 0.02);
      });
    },
    fanfare() {
      [392, 523.25, 659.25, 783.99, 659.25, 1046.5].forEach((f, i) => {
        tone(f, f, 0.28, "triangle", 0.2, i * 0.12);
        tone(f * 0.5, f * 0.5, 0.28, "sine", 0.09, i * 0.12);
      });
    },
    tap() { tone(480, 920, 0.08, "sine", 0.16); }
  };
})();
