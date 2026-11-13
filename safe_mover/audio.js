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

  function tone(f0, f1, dur, type, vol) {
    if (!soundOn) return;
    try {
      const c = getAC();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      const t = c.currentTime;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(vol || 0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
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
    step(n) { tone(n % 2 ? 300 : 240, n % 2 ? 430 : 330, 0.08, "triangle", 0.12); },
    lane() { tone(350, 620, 0.13, "sine", 0.18); },
    collect() {
      tone(660, 990, 0.14, "triangle", 0.22);
      setTimeout(() => tone(990, 1320, 0.18, "sine", 0.22), 70);
    },
    dodge() { tone(880, 1180, 0.15, "sine", 0.13); },
    wrongTap() { tone(340, 180, 0.24, "sawtooth", 0.2); },
    hit() { tone(680, 140, 0.36, "sawtooth", 0.26); },
    clear() {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => tone(f, f * 1.01, 0.22, "triangle", 0.24), i * 120)
      );
    },
    fanfare() {
      [392, 523, 659, 784, 659, 1047].forEach((f, i) =>
        setTimeout(() => tone(f, f, 0.28, "triangle", 0.22), i * 130)
      );
    },
    tap() { tone(440, 920, 0.08, "sine", 0.18); }
  };
})();
