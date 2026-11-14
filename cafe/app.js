import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// 1. 레시피 및 특수교육(무오류 학습/과제분석) 데이터 정의
// ============================================================================
const RECIPES = {
  hot_americano: {
    name: '따뜻한 아메리카노',
    emoji: '☕',
    cupType: 'mug',
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 평평하고 단단하게 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '머그컵 놓기', emoji: '☕', prompt: '머그컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'water', label: '뜨거운 물 붓기', emoji: '💧', prompt: '물병을 눌러 머그컵에 뜨거운 물을 먼저 부어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '추출한 에스프레소 샷을 물 위에 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '따뜻한 아메리카노 완성! 손님께 드려요.' }
    ]
  },
  iced_americano: {
    name: '아이스 아메리카노',
    emoji: '🧊',
    cupType: 'glass',
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 수평으로 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 시원한 얼음을 넣어요.' },
      { target: 'water', label: '차가운 물 붓기', emoji: '💧', prompt: '물병을 눌러 차가운 물을 채워요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 얼음물 위에 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '시원한 아이스 아메리카노 완성! 손님께 드려요.' }
    ]
  },
  iced_latte: {
    name: '아이스 카페라떼',
    emoji: '🥛',
    cupType: 'glass',
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 수평으로 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 먼저 넣어요.' },
      { target: 'milk', label: '우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 고소한 우유를 부어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 우유 위에 천천히 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '부드러운 카페라떼 완성! 손님께 드려요.' }
    ]
  },
  strawberry_smoothie: {
    name: '딸기 스무디',
    emoji: '🍓',
    cupType: 'glass',
    steps: [
      { target: 'milk', label: '우유 넣기(믹서)', emoji: '🥛', prompt: '칼날이 잘 돌도록 우유팩을 눌러 믹서기에 우유를 먼저 넣어요.' },
      { target: 'strawberry', label: '딸기 넣기(믹서)', emoji: '🍓', prompt: '신선한 딸기를 눌러 믹서기에 넣어요.' },
      { target: 'ice', label: '얼음 넣기(믹서)', emoji: '🧊', prompt: '아이스박스를 눌러 믹서기에 얼음을 넣어요.' },
      { target: 'blender', label: '얼음·딸기 갈기', emoji: '🌀', prompt: '믹서기(얼음 분쇄 블렌더)를 눌러 얼음과 딸기를 곱게 갈아요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'pour_blender', label: '컵에 따르기', emoji: '🥤', prompt: '믹서기를 다시 눌러 갈린 스무디를 컵에 따라요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '시원하고 달콤한 딸기 스무디 완성! 손님께 드려요.' }
    ]
  },
  iced_lemonade: {
    name: '아이스 레몬에이드',
    emoji: '🍋',
    cupType: 'glass',
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 시원한 얼음을 넣어요.' },
      { target: 'lemon', label: '레몬 넣기', emoji: '🍋', prompt: '상큼한 레몬을 눌러 컵에 넣어요.' },
      { target: 'water', label: '시원한 물 붓기', emoji: '💧', prompt: '물병을 눌러 시원한 물을 채워요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '상큼한 레몬에이드 완성! 손님께 드려요.' }
    ]
  },
  hot_choco: {
    name: '따뜻한 핫초코',
    emoji: '🍫',
    cupType: 'mug',
    steps: [
      { target: 'cup', label: '머그컵 놓기', emoji: '☕', prompt: '머그컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'choco', label: '초코 넣기', emoji: '🍫', prompt: '초콜릿을 눌러 달콤한 초코를 넣어요.' },
      { target: 'milk', label: '따뜻한 우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 따뜻한 우유를 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 핫초코 완성! 손님께 드려요.' }
    ]
  },
  hot_tea: {
    name: '따뜻한 녹차',
    emoji: '🍵',
    cupType: 'tea',
    steps: [
      { target: 'cup', label: '찻잔 놓기', emoji: '🍵', prompt: '찻잔을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'tea', label: '녹차 티백 넣기', emoji: '🍃', prompt: '녹차 상자를 눌러 티백을 넣어요.' },
      { target: 'water', label: '뜨거운 물 붓기', emoji: '💧', prompt: '물병을 눌러 뜨거운 물을 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '향긋한 녹차 완성! 손님께 드려요.' }
    ]
  },
  strawberry_latte: {
    name: '딸기 라떼',
    emoji: '🍓',
    cupType: 'glass',
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 먼저 넣어요.' },
      { target: 'strawberry', label: '딸기 넣기', emoji: '🍓', prompt: '딸기를 눌러 달콤한 딸기청을 넣어요.' },
      { target: 'milk', label: '우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 고소한 우유를 채워요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 딸기 라떼 완성! 손님께 드려요.' }
    ]
  }
};

const TOOL_BUTTONS = [
  { id: 'grinder', label: '원두 그라인더', emoji: '🫘' },
  { id: 'tamper', label: '탬퍼 다지기', emoji: '🔨' },
  { id: 'machine', label: '머신 샷 추출', emoji: '⚙️' },
  { id: 'shot', label: '샷 붓기', emoji: '🥃' },
  { id: 'cup', label: '컵 놓기', emoji: '☕' },
  { id: 'ice', label: '얼음 넣기', emoji: '🧊' },
  { id: 'strawberry', label: '딸기 넣기', emoji: '🍓' },
  { id: 'lemon', label: '레몬 넣기', emoji: '🍋' },
  { id: 'choco', label: '초코 넣기', emoji: '🍫' },
  { id: 'tea', label: '녹차 티백', emoji: '🍃' },
  { id: 'milk', label: '우유 붓기', emoji: '🥛' },
  { id: 'water', label: '물 붓기', emoji: '💧' },
  { id: 'blender', label: '블렌더 갈기', emoji: '🌀' },
  { id: 'pour_blender', label: '스무디 따르기', emoji: '🥤' },
  { id: 'serve', label: '손님께 드리기', emoji: '😊' }
];

// ============================================================================
// 2. 상태 관리
// ============================================================================
const CAFE_COUNT_KEY = 'safe_mover.cafe.count.v1';
function loadCafeCount() {
  try {
    const n = Number(localStorage.getItem(CAFE_COUNT_KEY) || 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}
function saveCafeCount(n) {
  try { localStorage.setItem(CAFE_COUNT_KEY, String(n)); } catch {}
}

const state = {
  recipeKey: 'hot_americano',
  stepIndex: 0,
  guidedMode: true,
  autoCamera: true,
  cameraViewMode: 'step', // 'step' | 'overview'
  voiceEnabled: false,
  soundEnabled: true,
  busy: false,
  completedCount: loadCafeCount(),
  liquidLevel: 0,
  liquidColor: new THREE.Color(0x3b2314),
  hasIce: false,
  isHot: false
};

// ============================================================================
// 3. 감각 친화적 오디오 (풍부한 Web Audio 합성 효과음 + 선택적 한국어 음성 안내)
// ============================================================================
let audioCtx = null;
let noiseBuffer = null;

function getAudioCtx() {
  if (!state.soundEnabled) return null;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!noiseBuffer) {
      const len = Math.floor(audioCtx.sampleRate * 1.2);
      noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playSoftTone(freq = 523.25, duration = 0.14, type = 'sine', vol = 0.06, delay = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch { /* 오디오 미지원 환경 무시 */ }
}

function playFilteredNoise(duration = 0.5, freqStart = 600, freqEnd = 1200, q = 2.0, vol = 0.05, delay = 0) {
  const ctx = getAudioCtx();
  if (!ctx || !noiseBuffer) return;
  try {
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freqStart, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, freqEnd), t + duration);
    filter.Q.value = q;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.05);
    gain.gain.setValueAtTime(vol * 0.9, t + Math.max(0.06, duration - 0.1));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
    src.stop(t + duration + 0.03);
  } catch {}
}

function playGrindSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  playFilteredNoise(0.62, 420, 760, 1.4, 0.055);
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(135, t);
    osc.frequency.linearRampToValueAtTime(165, t + 0.3);
    osc.frequency.linearRampToValueAtTime(125, t + 0.62);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  } catch {}
}

function playTampSound() {
  playSoftTone(180, 0.12, 'triangle', 0.075, 0.18);
  playSoftTone(120, 0.16, 'sine', 0.08, 0.28);
  playSoftTone(620, 0.06, 'sine', 0.03, 0.30);
}

function playMachineSound() {
  playFilteredNoise(0.72, 900, 1450, 2.6, 0.04);
  playSoftTone(150, 0.7, 'sine', 0.035);
  [0.18, 0.34, 0.50].forEach((d, idx) => {
    playSoftTone(740 + idx * 70, 0.07, 'sine', 0.025, d);
  });
}

function playCupPlaceSound(cupType) {
  if (cupType === 'glass') {
    playSoftTone(1180, 0.12, 'sine', 0.045);
    playSoftTone(1760, 0.09, 'sine', 0.025, 0.02);
  } else {
    playSoftTone(420, 0.09, 'triangle', 0.055);
    playSoftTone(680, 0.08, 'sine', 0.03, 0.02);
  }
}

function playIceSound() {
  [0, 0.11, 0.22].forEach((d, i) => {
    playSoftTone(1450 + i * 240, 0.11, 'sine', 0.045, d);
    playSoftTone(2180 + i * 190, 0.08, 'triangle', 0.02, d + 0.015);
  });
}

function playPourSound(duration = 0.68, pitchStart = 520, pitchEnd = 1050) {
  playFilteredNoise(duration, pitchStart, pitchEnd, 2.4, 0.05);
  playSoftTone(340, duration * 0.5, 'sine', 0.02, 0.08);
  playSoftTone(440, duration * 0.45, 'sine', 0.02, duration * 0.45);
}

function playIngredientSound(kind) {
  if (kind === 'tea') {
    playSoftTone(520, 0.09, 'sine', 0.04);
    playSoftTone(660, 0.11, 'sine', 0.035, 0.09);
  } else {
    playSoftTone(460, 0.08, 'sine', 0.045);
    playSoftTone(780, 0.11, 'sine', 0.04, 0.07);
    playSoftTone(980, 0.09, 'triangle', 0.025, 0.14);
  }
}

function playBlenderSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  playFilteredNoise(0.76, 520, 1700, 1.8, 0.055);
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 620;
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.76);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.76);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.78);
  } catch {}
}

function playServeBell() {
  playSoftTone(1046.5, 0.35, 'sine', 0.065);
  playSoftTone(1567.98, 0.28, 'sine', 0.035, 0.02);
}

function playSuccessChime() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    playSoftTone(f, 0.28, 'sine', 0.06, i * 0.11);
    playSoftTone(f * 1.5, 0.2, 'triangle', 0.02, i * 0.11 + 0.02);
  });
}

function playGentleHintSound() {
  playSoftTone(392, 0.12, 'sine', 0.045);
  playSoftTone(329.63, 0.16, 'sine', 0.04, 0.09);
}

function speakKorean(text) {
  if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ko-KR';
  utter.rate = 0.92; // 또박또박 차분한 속도
  window.speechSynthesis.speak(utter);
}

// ============================================================================
// 4. Three.js 씬 & 차분한 카페 환경 구축
// ============================================================================
const container = document.getElementById('canvasContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4ede3);

function getResponsiveFov() {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  return aspect < 0.85 ? 48 : 42;
}

const camera = new THREE.PerspectiveCamera(getResponsiveFov(), container.clientWidth / container.clientHeight, 0.1, 50);
camera.position.set(0, 1.56, 1.72);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.02, 0.05);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.45;
controls.maxDistance = 4.8;
controls.maxPolarAngle = Math.PI / 2 - 0.08; // 바닥 아래로 내려가지 않도록 제한
controls.minPolarAngle = 0.25;

// 카메라 워킹 애니메이션 상태
let camAnimRaf = null;
function cancelCameraAnim() {
  if (camAnimRaf !== null) {
    cancelAnimationFrame(camAnimRaf);
    camAnimRaf = null;
  }
}

controls.addEventListener('start', cancelCameraAnim);

function getAspectMultiplier() {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  if (aspect < 0.65) return 1.1;
  if (aspect < 0.9) return 1.05;
  return 1.0;
}

function animateCameraTo(toPos, toTarget, duration = 520) {
  cancelCameraAnim();
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const k = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(fromPos, toPos, k);
    controls.target.lerpVectors(fromTarget, toTarget, k);
    if (t < 1) {
      camAnimRaf = requestAnimationFrame(tick);
    } else {
      camAnimRaf = null;
    }
  };
  camAnimRaf = requestAnimationFrame(tick);
}

function getOverviewPreset() {
  const mult = getAspectMultiplier();
  return {
    target: new THREE.Vector3(0, 1.02, 0.05),
    pos: new THREE.Vector3(0, 1.02 + 0.6 * mult, 1.72 * mult)
  };
}

function focusOverviewCamera(duration = 480) {
  state.cameraViewMode = 'overview';
  updateCameraModeButtons();
  const preset = getOverviewPreset();
  animateCameraTo(preset.pos, preset.target, duration);
}

function getStepCameraPreset(targetId) {
  const mult = getAspectMultiplier();
  const isSmoothie = state.recipeKey === 'strawberry_smoothie';

  // 각 단계별 밀착 클로즈업 카메라 프리셋 (전체 화면에서 3D 오브젝트가 크고 자연스럽게 보이도록)
  const presets = {
    grinder: { target: [-1.06, COUNTER_Y + 0.19, -0.08], offset: [0.12, 0.28, 0.56] },
    tamper: { target: [-0.88, COUNTER_Y + 0.1, 0.22], offset: [0.1, 0.26, 0.52] },
    machine: { target: [-0.58, COUNTER_Y + 0.22, -0.04], offset: [0.14, 0.3, 0.64] },
    cup: { target: [-0.98, COUNTER_Y + 0.12, 0.15], offset: [0.14, 0.28, 0.58] },
    water: { target: [-0.15, COUNTER_Y + 0.16, 0.0], offset: [0.04, 0.32, 0.68] },
    shot: { target: [-0.16, COUNTER_Y + 0.12, 0.16], offset: [0.05, 0.28, 0.62] },
    ice: isSmoothie
      ? { target: [0.49, COUNTER_Y + 0.18, 0.04], offset: [0.03, 0.32, 0.68] }
      : { target: [0.18, COUNTER_Y + 0.14, 0.15], offset: [0.03, 0.3, 0.64] },
    milk: isSmoothie
      ? { target: [0.48, COUNTER_Y + 0.18, -0.1], offset: [0.03, 0.32, 0.68] }
      : { target: [0.17, COUNTER_Y + 0.16, 0.02], offset: [0.04, 0.32, 0.68] },
    blender: { target: [0.62, COUNTER_Y + 0.22, -0.08], offset: [0.0, 0.3, 0.6] },
    pour_blender: { target: [0.31, COUNTER_Y + 0.18, 0.03], offset: [0.02, 0.34, 0.76] },
    strawberry: isSmoothie
      ? { target: [0.77, COUNTER_Y + 0.16, 0.0], offset: [0.03, 0.3, 0.62] }
      : { target: [0.88, COUNTER_Y + 0.12, 0.06], offset: [-0.05, 0.26, 0.54] },
    lemon: { target: [0.88, COUNTER_Y + 0.11, 0.22], offset: [-0.05, 0.24, 0.52] },
    choco: { target: [0.68, COUNTER_Y + 0.09, 0.22], offset: [-0.04, 0.22, 0.5] },
    tea: { target: [-0.62, COUNTER_Y + 0.12, 0.22], offset: [0.05, 0.25, 0.54] },
    serve: { target: [0.0, COUNTER_Y + 0.15, 0.24], offset: [0.0, 0.28, 0.58] }
  };

  const p = presets[targetId];
  if (!p) return getOverviewPreset();
  const target = new THREE.Vector3(...p.target);
  const pos = new THREE.Vector3(
    p.target[0] + p.offset[0] * mult,
    p.target[1] + p.offset[1] * mult,
    p.target[2] + p.offset[2] * mult
  );
  return { pos, target };
}

function focusStepCamera(targetId, duration = 520) {
  state.cameraViewMode = 'step';
  updateCameraModeButtons();
  const preset = getStepCameraPreset(targetId);
  animateCameraTo(preset.pos, preset.target, duration);
}

function focusPrepActionCamera(isBlender = false) {
  if (!state.autoCamera || state.cameraViewMode === 'overview') return;
  const mult = getAspectMultiplier();
  if (isBlender) {
    animateCameraTo(
      new THREE.Vector3(0.62, COUNTER_Y + 0.22 + 0.28 * mult, -0.08 + 0.6 * mult),
      new THREE.Vector3(0.62, COUNTER_Y + 0.22, -0.08),
      360
    );
  } else {
    animateCameraTo(
      new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.14 + 0.26 * mult, PREP_POS.z + 0.56 * mult),
      new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.14, PREP_POS.z),
      360
    );
  }
}

function updateCameraModeButtons() {
  const focusBtn = document.getElementById('focusStepBtn');
  const resetBtn = document.getElementById('resetCamBtn');
  if (focusBtn) focusBtn.classList.toggle('active', state.cameraViewMode === 'step');
  if (resetBtn) resetBtn.classList.toggle('active', state.cameraViewMode === 'overview');
}

// 차분하고 따뜻한 조명 (과도한 대비/번쩍임 배제)
scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd7c7b5, 1.35));
const dirLight = new THREE.DirectionalLight(0xfff5e4, 1.3);
dirLight.position.set(3.5, 5.5, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 15;
scene.add(dirLight);

// 바닥과 벽 (정돈된 카페 배경)
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 10),
  new THREE.MeshStandardMaterial({ color: 0xe6d9c8, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 5),
  new THREE.MeshStandardMaterial({ color: 0xf9f5ee, roughness: 0.95 })
);
backWall.position.set(0, 2.5, -1.6);
backWall.receiveShadow = true;
scene.add(backWall);

// ============================================================================
// 5. 공개 CC0 GLB 에셋 로더 & 정규화 유틸리티
// ============================================================================
const loader = new GLTFLoader();
const interactables = []; // { targetId, label, group }
const targetAnchors = {}; // targetId -> THREE.Vector3 (강조 링 위치)

function loadGLB(filename) {
  return new Promise((resolve, reject) => {
    loader.load(
      `./assets/models/${filename}`,
      (gltf) => {
        gltf.scene.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });
}

// 모델의 밑면을 y=0으로 맞추고 목표 높이에 맞게 스케일 조정
function placeModel(model, targetHeight, x, y, z, rotY = 0) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  model.position.set(x - center.x, y - scaledBox.min.y, z - center.z);
  model.rotation.y = rotY;
  scene.add(model);
  return model;
}

function registerInteractive(object3D, targetId, label, ringPos) {
  object3D.userData.targetId = targetId;
  object3D.userData.label = label;
  object3D.traverse((child) => {
    if (child.isMesh) {
      child.userData.targetId = targetId;
      child.userData.label = label;
    }
  });
  // 터치/클릭이 쉽도록 넉넉한 투명 히트박스 추가
  const box = new THREE.Box3().setFromObject(object3D);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(size.x * 1.25, 0.24), Math.max(size.y * 1.2, 0.24), Math.max(size.z * 1.25, 0.24)),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.copy(center);
  hitbox.userData.targetId = targetId;
  hitbox.userData.label = label;
  scene.add(hitbox);
  interactables.push(hitbox);

  targetAnchors[targetId] = ringPos || new THREE.Vector3(center.x, COUNTER_Y + 0.01, center.z);
}

// ============================================================================
// 6. 동적 3D 소품 (강조 링, 쟁반, 음료 액체, 얼음, 물줄기, 김)
// ============================================================================
const COUNTER_Y = 0.92;
const PREP_POS = new THREE.Vector3(0, COUNTER_Y, 0.14);

// 안내 모드 강조 링 + 상단 부유 포인터 비콘
const highlightRing = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.21, 32),
  new THREE.MeshBasicMaterial({ color: 0xd9822b, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
);
highlightRing.rotation.x = -Math.PI / 2;
highlightRing.visible = false;
scene.add(highlightRing);

const highlightBeacon = new THREE.Mesh(
  new THREE.ConeGeometry(0.045, 0.09, 16),
  new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.45, roughness: 0.3 })
);
highlightBeacon.rotation.x = Math.PI; // 아래를 가리키는 화살표 콘
highlightBeacon.visible = false;
scene.add(highlightBeacon);

// 작업 쟁반 (음료를 만드는 중앙 위치)
const tray = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.2, 0.02, 32),
  new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 })
);
tray.position.set(PREP_POS.x, COUNTER_Y + 0.01, PREP_POS.z);
tray.receiveShadow = true;
scene.add(tray);

// 동적 음료 그룹 (컵 + 내부 액체 + 얼음)
const drinkGroup = new THREE.Group();
drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
drinkGroup.visible = false;
scene.add(drinkGroup);

let activeCupModels = { mug: null, glass: null, tea: null };
// 바리스타 전용 3D 소품 참조 (그라인더, 탬퍼, 포터필터, 샷잔)
let tamperMesh = null;
let portafilterCoffee = null;
let shotGlassGroup = null;
let shotLiquidMesh = null;
let blenderModel = null;
let grinderModel = null;
let serveBellMesh = null;

// 믹서기 내부 스무디/재료 시각화 메쉬
const blenderMixMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.062, 0.048, 0.14, 20),
  new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.3, transparent: true, opacity: 0.92 })
);
blenderMixMesh.position.set(0.62, COUNTER_Y + 0.14, -0.08);
blenderMixMesh.scale.y = 0.01;
blenderMixMesh.visible = false;
scene.add(blenderMixMesh);

// 컵 내부 토핑/재료(레몬 슬라이스, 딸기, 초콜릿, 녹차 티백) 그룹
const cupToppingGroup = new THREE.Group();
cupToppingGroup.visible = false;
drinkGroup.add(cupToppingGroup);

// 공중 낙하 연출용 임시 아이템 그룹
const fallingItemGroup = new THREE.Group();
fallingItemGroup.visible = false;
scene.add(fallingItemGroup);

const liquidMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.068, 0.056, 0.17, 24),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.25, transparent: true, opacity: 0.92 })
);
liquidMesh.position.y = 0.025;
liquidMesh.scale.y = 0.01;
liquidMesh.visible = false;
drinkGroup.add(liquidMesh);

const iceGroup = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(0.038, 0.038, 0.038),
    new THREE.MeshStandardMaterial({ color: 0xdff6ff, roughness: 0.1, transparent: true, opacity: 0.78 })
  );
  ice.position.set((i % 2 === 0 ? -0.02 : 0.02), 0.055 + Math.floor(i / 2) * 0.038, (i % 3 === 0 ? 0.016 : -0.016));
  ice.rotation.set(i * 0.4, i * 0.6, 0.2);
  iceGroup.add(ice);
}
iceGroup.visible = false;
drinkGroup.add(iceGroup);

// 따르는 물줄기 애니메이션용
const pourStream = new THREE.Mesh(
  new THREE.CylinderGeometry(0.01, 0.01, 0.3, 12),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, transparent: true, opacity: 0.85 })
);
pourStream.visible = false;
scene.add(pourStream);

// 따뜻한 김 파티클
const steamGroup = new THREE.Group();
const steamPuffs = [];
for (let i = 0; i < 4; i++) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })
  );
  puff.position.set((i - 1.5) * 0.015, 0.2 + i * 0.05, 0);
  steamGroup.add(puff);
  steamPuffs.push(puff);
}
steamGroup.visible = false;
drinkGroup.add(steamGroup);

// ============================================================================
// 7. 모든 CC0 3D 에셋 배치
// ============================================================================
async function initCafeScene() {
  try {
    // 1) 카페 카운터 & 배경 가구
    const [
      barCenter, barLeft, barRight, cabinetLeft, cabinetRight,
      fridge, plant, table, chair1, chair2, croissant, donut
    ] = await Promise.all([
      loadGLB('kitchenBar.glb'),
      loadGLB('kitchenBarEnd.glb'),
      loadGLB('kitchenBarEnd.glb'),
      loadGLB('kitchenCabinet.glb'),
      loadGLB('kitchenCabinetDrawer.glb'),
      loadGLB('kitchenFridgeSmall.glb'),
      loadGLB('pottedPlant.glb'),
      loadGLB('tableRound.glb'),
      loadGLB('chairRounded.glb'),
      loadGLB('chairRounded.glb'),
      loadGLB('croissant.glb'),
      loadGLB('donut-chocolate.glb')
    ]);

    placeModel(barCenter, COUNTER_Y, 0, 0, 0);
    placeModel(barLeft, COUNTER_Y, -1.0, 0, 0);
    placeModel(barRight, COUNTER_Y, 1.0, 0, 0, Math.PI);
    placeModel(cabinetLeft, COUNTER_Y, -0.8, 0, -1.05);
    placeModel(cabinetRight, COUNTER_Y, 0.8, 0, -1.05);
    placeModel(fridge, 1.45, -1.85, 0, -0.75, 0.2);
    placeModel(plant, 0.95, 1.95, 0, -0.8);

    // 손님 테이블 & 의자 (배경 분위기)
    placeModel(table, 0.72, 2.1, 0, 0.9);
    placeModel(chair1, 0.75, 1.55, 0, 0.9, Math.PI / 2);
    placeModel(chair2, 0.75, 2.65, 0, 0.9, -Math.PI / 2);

    // 진열용 빵 (카운터 한쪽)
    placeModel(croissant, 0.08, 1.15, COUNTER_Y, 0.1);
    placeModel(donut, 0.07, 1.32, COUNTER_Y, 0.14);

    // 2) 상호작용 도구들 (바리스타 작업대 위)
    const [
      machine, blender, milk, water, strawberry, lemon, choco,
      standCup, standGlass, cupMug, cupGlass, cupTea
    ] = await Promise.all([
      loadGLB('kitchenCoffeeMachine.glb'),
      loadGLB('kitchenBlender.glb'),
      loadGLB('carton.glb'),
      loadGLB('soda-bottle.glb'),
      loadGLB('strawberry.glb'),
      loadGLB('lemon.glb'),
      loadGLB('chocolate.glb'),
      loadGLB('cup-coffee.glb'),
      loadGLB('glass.glb'),
      loadGLB('cup-coffee.glb'),
      loadGLB('glass.glb'),
      loadGLB('cup-tea.glb')
    ]);

    // 커피 머신
    placeModel(machine, 0.44, -0.62, COUNTER_Y, -0.08);
    registerInteractive(machine, 'machine', '커피 머신 (샷 추출)', new THREE.Vector3(-0.62, COUNTER_Y + 0.01, -0.08));

    // 원두 그라인더 (본체 + 투명 원두 호퍼 + 원두)
    grinderModel = new THREE.Group();
    const grinderBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.26, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x3b3532, roughness: 0.4, metalness: 0.3 })
    );
    grinderBody.position.y = 0.13;
    grinderBody.castShadow = true;
    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.045, 0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.3, transparent: true, opacity: 0.82 })
    );
    hopper.position.y = 0.34;
    const chute = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.065, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6, roughness: 0.25 })
    );
    chute.position.set(0, 0.18, 0.11);
    grinderModel.add(grinderBody, hopper, chute);
    grinderModel.position.set(-1.12, COUNTER_Y, -0.14);
    scene.add(grinderModel);
    registerInteractive(grinderModel, 'grinder', '원두 그라인더 (원두 갈기)', new THREE.Vector3(-1.12, COUNTER_Y + 0.01, -0.14));

    // 탬핑 매트 + 포터필터 + 탬퍼
    const tamperStation = new THREE.Group();
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.016, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2a2725, roughness: 0.85 })
    );
    mat.position.y = 0.008;
    const pfBasket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.046, 0.05, 20),
      new THREE.MeshStandardMaterial({ color: 0xb0b5b9, metalness: 0.75, roughness: 0.25 })
    );
    pfBasket.position.set(-0.045, 0.042, 0);
    const pfHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.02, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: 0x2c241e, roughness: 0.6 })
    );
    pfHandle.rotation.x = Math.PI / 2;
    pfHandle.position.set(-0.045, 0.042, 0.1);
    portafilterCoffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.014, 20),
      new THREE.MeshStandardMaterial({ color: 0x4b2e1e, roughness: 0.9 })
    );
    portafilterCoffee.position.set(-0.045, 0.062, 0);
    portafilterCoffee.visible = false;

    tamperMesh = new THREE.Group();
    const tamperBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 0.8, roughness: 0.2 })
    );
    const tamperGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.02, 0.075, 16),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.5 })
    );
    tamperGrip.position.y = 0.045;
    tamperMesh.add(tamperBase, tamperGrip);
    tamperMesh.position.set(0.065, 0.028, 0);

    tamperStation.add(mat, pfBasket, pfHandle, portafilterCoffee, tamperMesh);
    tamperStation.position.set(-0.88, COUNTER_Y, 0.24);
    scene.add(tamperStation);
    registerInteractive(tamperStation, 'tamper', '탬퍼 (원두 다지기)', new THREE.Vector3(-0.88, COUNTER_Y + 0.01, 0.24));

    // 에스프레소 샷잔
    shotGlassGroup = new THREE.Group();
    const shotCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.032, 0.088, 18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.1 })
    );
    shotCup.position.y = 0.044;
    shotLiquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.029, 0.06, 18),
      new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.25 })
    );
    shotLiquidMesh.position.y = 0.034;
    shotLiquidMesh.visible = false;
    shotGlassGroup.add(shotCup, shotLiquidMesh);
    shotGlassGroup.position.set(-0.36, COUNTER_Y, 0.18);
    scene.add(shotGlassGroup);
    registerInteractive(shotGlassGroup, 'shot', '에스프레소 샷잔 (샷 붓기)', new THREE.Vector3(-0.36, COUNTER_Y + 0.01, 0.18));

    // 믹서기 (얼음 분쇄 블렌더)
    blenderModel = blender;
    placeModel(blender, 0.4, 0.62, COUNTER_Y, -0.08);
    registerInteractive(blender, 'blender', '얼음 분쇄 블렌더 (믹서기)', new THREE.Vector3(0.62, COUNTER_Y + 0.01, -0.08));
    targetAnchors['pour_blender'] = targetAnchors['blender'];

    // 우유팩
    placeModel(milk, 0.24, 0.34, COUNTER_Y, -0.15);
    registerInteractive(milk, 'milk', '신선한 우유', new THREE.Vector3(0.34, COUNTER_Y + 0.01, -0.15));

    // 물병
    placeModel(water, 0.26, -0.32, COUNTER_Y, -0.16);
    registerInteractive(water, 'water', '깨끗한 물', new THREE.Vector3(-0.32, COUNTER_Y + 0.01, -0.16));

    // 딸기, 레몬, 초콜릿 3D 모델 (작은 화면에서도 잘 보이도록 크기 확대)
    placeModel(strawberry, 0.19, 0.92, COUNTER_Y, 0.06);
    registerInteractive(strawberry, 'strawberry', '신선한 딸기', new THREE.Vector3(0.92, COUNTER_Y + 0.01, 0.06));

    placeModel(lemon, 0.18, 0.92, COUNTER_Y, 0.24);
    registerInteractive(lemon, 'lemon', '상큼한 레몬', new THREE.Vector3(0.92, COUNTER_Y + 0.01, 0.24));

    placeModel(choco, 0.095, 0.68, COUNTER_Y, 0.24);
    registerInteractive(choco, 'choco', '달콤한 초콜릿', new THREE.Vector3(0.68, COUNTER_Y + 0.01, 0.24));

    // 녹차 티백 상자
    const teaBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.13, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x6b9e78, roughness: 0.5 })
    );
    teaBox.position.set(-0.62, COUNTER_Y + 0.065, 0.24);
    teaBox.castShadow = true;
    scene.add(teaBox);
    registerInteractive(teaBox, 'tea', '녹차 티백 상자', new THREE.Vector3(-0.62, COUNTER_Y + 0.01, 0.24));

    // 대기 중인 컵들 (클릭해서 쟁반에 올리기)
    placeModel(standCup, 0.19, -1.08, COUNTER_Y, 0.14);
    placeModel(standGlass, 0.22, -0.92, COUNTER_Y, 0.16);
    registerInteractive(standCup, 'cup', '컵 올리기', new THREE.Vector3(-1.0, COUNTER_Y + 0.01, 0.15));
    registerInteractive(standGlass, 'cup', '컵 올리기', new THREE.Vector3(-1.0, COUNTER_Y + 0.01, 0.15));

    // 얼음 통 (시각적으로 명확한 하늘색 아이스박스)
    const iceBox = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.18, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x7ec8e3, roughness: 0.35 })
    );
    boxMesh.position.y = 0.09;
    boxMesh.castShadow = true;
    iceBox.add(boxMesh);
    iceBox.position.set(0.36, COUNTER_Y, 0.16);
    scene.add(iceBox);
    registerInteractive(iceBox, 'ice', '얼음 통', new THREE.Vector3(0.36, COUNTER_Y + 0.01, 0.16));

    // 손님께 드리기 벨 (초록색 서빙 존)
    const serveBell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.105, 0.045, 24),
      new THREE.MeshStandardMaterial({ color: 0x487555, roughness: 0.3 })
    );
    serveBell.position.set(0, COUNTER_Y + 0.022, 0.38);
    serveBell.castShadow = true;
    scene.add(serveBell);
    serveBellMesh = serveBell;
    registerInteractive(serveBell, 'serve', '손님께 드리기', new THREE.Vector3(0, COUNTER_Y + 0.01, 0.38));

    // 쟁반 위 동적 컵 모델 준비 (drinkGroup 내부에 배치)
    prepDynamicCup(cupMug, 0.20);
    prepDynamicCup(cupGlass, 0.23);
    prepDynamicCup(cupTea, 0.19);
    activeCupModels.mug = cupMug;
    activeCupModels.glass = cupGlass;
    activeCupModels.tea = cupTea;
    drinkGroup.add(cupMug);
    drinkGroup.add(cupGlass);
    drinkGroup.add(cupTea);

    renderUI();
  } catch (err) {
    console.error('3D 모델 로딩 오류:', err);
    document.getElementById('guidanceText').textContent = '3D 에셋을 불러오는 중 문제가 발생했어요. 로컬 서버로 실행했는지 확인해주세요.';
  }
}

function prepDynamicCup(model, targetHeight) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  model.position.set(-center.x, -scaledBox.min.y, -center.z);
  model.visible = false;

  // 투명 유리컵 느낌을 위해 glass일 경우 반투명 처리
  if (targetHeight > 0.16) {
    model.traverse((c) => {
      if (c.isMesh && c.material) {
        c.material = c.material.clone();
        c.material.transparent = true;
        c.material.opacity = 0.55;
      }
    });
  }
}

// ============================================================================
// 8. 상호작용 및 단계 실행 (무오류 학습)
// ============================================================================
function getCurrentRecipe() {
  return RECIPES[state.recipeKey];
}

function getCurrentStep() {
  const recipe = getCurrentRecipe();
  return recipe.steps[state.stepIndex] || null;
}

function handleAction(actionId) {
  if (state.busy) return;
  const currentStep = getCurrentStep();
  if (!currentStep) return;

  // 믹서기 3D 클릭으로 '블렌더 갈기'와 '컵에 따르기' 모두 처리
  if (actionId === 'blender' && currentStep.target === 'pour_blender') {
    actionId = 'pour_blender';
  }

  if (actionId !== currentStep.target) {
    // 무오류 학습: 벌칙이나 불쾌한 소리 없이 차분하고 부드러운 안내만 제공
    playGentleHintSound();
    showGuidance(`괜찮아요! 지금은 "${currentStep.label}" 차례예요. ${currentStep.prompt}`, '💡', true);
    speakKorean(`지금은 ${currentStep.label} 차례예요.`);
    return;
  }

  executeStep(actionId);
}

function addCupTopping(kind) {
  if (kind === 'lemon') {
    const slice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.01, 18),
      new THREE.MeshStandardMaterial({ color: 0xf7dc6f, roughness: 0.35 })
    );
    slice.position.set(0.012, 0.085, 0.008);
    slice.rotation.set(0.45, 0.2, 0.35);
    cupToppingGroup.add(slice);
  } else if (kind === 'strawberry') {
    for (let i = 0; i < 3; i++) {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.017, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xd9385a, roughness: 0.4 })
      );
      berry.position.set((i - 1) * 0.022, 0.035 + (i % 2) * 0.014, (i % 2 === 0 ? 0.012 : -0.012));
      cupToppingGroup.add(berry);
    }
  } else if (kind === 'choco') {
    for (let i = 0; i < 3; i++) {
      const chunk = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.016, 0.024),
        new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 0.45 })
      );
      chunk.position.set((i - 1) * 0.018, 0.032, (i % 2 ? 0.012 : -0.012));
      chunk.rotation.set(0.3 * i, 0.5 * i, 0.2);
      cupToppingGroup.add(chunk);
    }
  } else if (kind === 'tea') {
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.036, 0.01),
      new THREE.MeshStandardMaterial({ color: 0x4d8b55, roughness: 0.7 })
    );
    bag.position.set(0.01, 0.055, 0);
    bag.rotation.z = 0.22;
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.002, 0.002, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f4 })
    );
    string.position.set(0.032, 0.095, 0.015);
    string.rotation.z = -0.35;
    cupToppingGroup.add(bag, string);
  }
  cupToppingGroup.visible = true;
}

function animateDropIntoTarget(kind, targetPos, onDone) {
  while (fallingItemGroup.children.length > 0) {
    fallingItemGroup.remove(fallingItemGroup.children[0]);
  }
  const colors = {
    strawberry: 0xe11d48,
    lemon: 0xfacc15,
    choco: 0x4e2a14,
    tea: 0x4d8b55,
    ice: 0xdff6ff
  };
  const count = kind === 'tea' || kind === 'lemon' ? 1 : 3;
  for (let i = 0; i < count; i++) {
    let geo;
    if (kind === 'lemon') geo = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16);
    else if (kind === 'strawberry') geo = new THREE.SphereGeometry(0.02, 12, 12);
    else if (kind === 'tea') geo = new THREE.BoxGeometry(0.034, 0.038, 0.012);
    else geo = new THREE.BoxGeometry(0.026, 0.022, 0.026);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[kind] || 0xffffff,
      roughness: kind === 'ice' ? 0.15 : 0.45,
      transparent: kind === 'ice',
      opacity: kind === 'ice' ? 0.8 : 1
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set((i - (count - 1) / 2) * 0.028, i * 0.02, 0);
    m.rotation.set(i * 0.4, i * 0.5, 0.3);
    fallingItemGroup.add(m);
  }
  fallingItemGroup.visible = true;
  const startPos = new THREE.Vector3(targetPos.x, targetPos.y + 0.34, targetPos.z);
  const endPos = new THREE.Vector3(targetPos.x, targetPos.y + 0.04, targetPos.z);
  const start = performance.now();
  const dur = 460;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = t * t;
    fallingItemGroup.position.lerpVectors(startPos, endPos, ease);
    fallingItemGroup.position.y += Math.sin(t * Math.PI) * 0.05;
    fallingItemGroup.rotation.y = t * Math.PI;
    if (t < 1) requestAnimationFrame(tick);
    else {
      fallingItemGroup.visible = false;
      onDone();
    }
  }
  requestAnimationFrame(tick);
}

function animateBlenderFill(hexColor, targetScaleY, onDone) {
  const startY = blenderMixMesh.visible ? blenderMixMesh.scale.y : 0.01;
  pourStream.material.color.setHex(hexColor);
  pourStream.position.set(0.62, COUNTER_Y + 0.36, -0.08);
  pourStream.visible = true;
  blenderMixMesh.visible = true;
  blenderMixMesh.material.color.setHex(hexColor);
  const start = performance.now();
  const dur = 520;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const cur = startY + (targetScaleY - startY) * t;
    blenderMixMesh.scale.y = Math.max(cur, 0.01);
    blenderMixMesh.position.y = COUNTER_Y + 0.14 + (0.14 * cur) / 2;
    if (t < 1) requestAnimationFrame(tick);
    else {
      pourStream.visible = false;
      onDone();
    }
  }
  requestAnimationFrame(tick);
}

function executeStep(actionId) {
  state.busy = true;
  const recipe = getCurrentRecipe();

  const finishStep = () => {
    state.busy = false;
    state.stepIndex++;
    if (state.stepIndex >= recipe.steps.length) {
      state.completedCount++;
      saveCafeCount(state.completedCount);
      if (window.D1Bridge) {
        window.D1Bridge.saveRecord({
          game: 'cafe',
          stage: recipe.name,
          score: state.completedCount,
          summary: `${recipe.name} 완성 (누적 ${state.completedCount}잔)`,
          payload: {
            recipeKey: state.recipeKey,
            recipeName: recipe.name,
            steps: recipe.steps.length,
            completedCount: state.completedCount
          }
        });
        window.D1Bridge.setKV(CAFE_COUNT_KEY, state.completedCount);
      }
      playSuccessChime();
      speakKorean(`${recipe.name}가 완성되었어요! 정말 잘했어요.`);
      showCompletionModal(recipe);
    } else {
      playSoftTone(659.25, 0.11, 'sine', 0.04);
    }
    renderUI();
  };

  if (actionId === 'grinder') {
    playGrindSound();
    const baseX = grinderModel.position.x;
    const start = performance.now();
    const animGrind = (now) => {
      const t = (now - start) / 650;
      if (t < 1) {
        grinderModel.position.x = baseX + Math.sin(t * 44) * 0.007;
        requestAnimationFrame(animGrind);
      } else {
        grinderModel.position.x = baseX;
        portafilterCoffee.visible = true;
        portafilterCoffee.scale.y = 1.4;
        finishStep();
      }
    };
    requestAnimationFrame(animGrind);
  } else if (actionId === 'tamper') {
    playTampSound();
    const start = performance.now();
    const animTamp = (now) => {
      const t = Math.min((now - start) / 650, 1);
      if (t < 0.5) {
        const k = t * 2;
        tamperMesh.position.set(0.06 - k * 0.1, 0.025 + Math.sin(k * Math.PI) * 0.11, 0);
      } else {
        const k = (t - 0.5) * 2;
        tamperMesh.position.set(-0.04 + k * 0.1, 0.025 + (1 - Math.abs(k - 0.5) * 2) * 0.03, 0);
        portafilterCoffee.scale.y = 0.8;
      }
      if (t < 1) requestAnimationFrame(animTamp);
      else {
        tamperMesh.position.set(0.06, 0.025, 0);
        finishStep();
      }
    };
    requestAnimationFrame(animTamp);
  } else if (actionId === 'machine') {
    playMachineSound();
    portafilterCoffee.visible = false;
    shotLiquidMesh.visible = true;
    shotLiquidMesh.scale.y = 0.05;
    pourStream.material.color.setHex(0x3b2314);
    pourStream.position.set(-0.36, COUNTER_Y + 0.14, 0.18);
    pourStream.visible = true;
    const start = performance.now();
    const animExtract = (now) => {
      const t = Math.min((now - start) / 750, 1);
      shotLiquidMesh.scale.y = Math.max(t, 0.05);
      shotLiquidMesh.position.y = 0.008 + 0.02 * t;
      if (t < 1) requestAnimationFrame(animExtract);
      else {
        pourStream.visible = false;
        finishStep();
      }
    };
    requestAnimationFrame(animExtract);
  } else if (actionId === 'shot') {
    focusPrepActionCamera(false);
    playPourSound(0.7, 500, 960);
    const originPos = shotGlassGroup.position.clone();
    const overCupPos = new THREE.Vector3(PREP_POS.x - 0.06, COUNTER_Y + 0.28, PREP_POS.z);
    const startMove = performance.now();
    const moveShot = (now) => {
      const t = Math.min((now - startMove) / 220, 1);
      shotGlassGroup.position.lerpVectors(originPos, overCupPos, t);
      shotGlassGroup.rotation.z = -t * 0.65;
      if (t < 1) {
        requestAnimationFrame(moveShot);
      } else {
        shotLiquidMesh.visible = false;
        const nextColor = state.recipeKey === 'iced_latte' ? 0xb5885c : 0x3b2314;
        animatePour(nextColor, 0.92, () => {
          const backStart = performance.now();
          const returnShot = (n2) => {
            const bt = Math.min((n2 - backStart) / 220, 1);
            shotGlassGroup.position.lerpVectors(overCupPos, originPos, bt);
            shotGlassGroup.rotation.z = -(1 - bt) * 0.65;
            if (bt < 1) requestAnimationFrame(returnShot);
            else {
              shotGlassGroup.position.copy(originPos);
              shotGlassGroup.rotation.z = 0;
              if (state.recipeKey === 'hot_americano') steamGroup.visible = true;
              finishStep();
            }
          };
          requestAnimationFrame(returnShot);
        }, true);
      }
    };
    requestAnimationFrame(moveShot);
  } else if (actionId === 'cup') {
    focusPrepActionCamera(false);
    playCupPlaceSound(recipe.cupType);
    drinkGroup.visible = true;
    drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
    activeCupModels.mug.visible = recipe.cupType === 'mug';
    activeCupModels.glass.visible = recipe.cupType === 'glass';
    activeCupModels.tea.visible = recipe.cupType === 'tea';
    liquidMesh.visible = false;
    iceGroup.visible = false;
    steamGroup.visible = false;
    cupToppingGroup.visible = false;
    while (cupToppingGroup.children.length > 0) cupToppingGroup.remove(cupToppingGroup.children[0]);
    state.liquidLevel = 0;
    const baseY = COUNTER_Y + 0.02;
    const start = performance.now();
    const animCup = (now) => {
      const t = Math.min((now - start) / 420, 1);
      const easeOutBack = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
      drinkGroup.position.y = baseY + (1 - Math.min(easeOutBack, 1.08)) * 0.14;
      const s = 0.6 + 0.4 * Math.min(easeOutBack, 1.08);
      drinkGroup.scale.set(s, s, s);
      if (t < 1) requestAnimationFrame(animCup);
      else {
        drinkGroup.position.y = baseY;
        drinkGroup.scale.set(1, 1, 1);
        finishStep();
      }
    };
    requestAnimationFrame(animCup);
  } else if (actionId === 'ice') {
    focusPrepActionCamera(state.recipeKey === 'strawberry_smoothie');
    playIceSound();
    if (state.recipeKey === 'strawberry_smoothie') {
      animateDropIntoTarget('ice', new THREE.Vector3(0.62, COUNTER_Y + 0.22, -0.08), () => {
        animateBlenderFill(0xf7b2c4, 0.85, finishStep);
      });
    } else {
      iceGroup.visible = true;
      state.hasIce = true;
      const start = performance.now();
      const animIce = (now) => {
        const t = Math.min((now - start) / 480, 1);
        const drop = Math.pow(1 - t, 2) * 0.18;
        iceGroup.position.y = drop;
        iceGroup.rotation.y = (1 - t) * 0.5;
        if (t < 1) requestAnimationFrame(animIce);
        else {
          iceGroup.position.y = 0;
          iceGroup.rotation.y = 0;
          finishStep();
        }
      };
      requestAnimationFrame(animIce);
    }
  } else if (actionId === 'strawberry') {
    focusPrepActionCamera(state.recipeKey === 'strawberry_smoothie');
    playIngredientSound('strawberry');
    if (state.recipeKey === 'strawberry_smoothie') {
      animateDropIntoTarget('strawberry', new THREE.Vector3(0.62, COUNTER_Y + 0.22, -0.08), () => {
        animateBlenderFill(0xf48fb1, 0.65, finishStep);
      });
    } else {
      animateDropIntoTarget('strawberry', new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), () => {
        addCupTopping('strawberry');
        animatePour(0xd94862, 0.28, () => finishStep(), true);
      });
    }
  } else if (actionId === 'lemon') {
    focusPrepActionCamera(false);
    playIngredientSound('lemon');
    animateDropIntoTarget('lemon', new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), () => {
      addCupTopping('lemon');
      animatePour(0xf4d03f, 0.28, () => finishStep(), true);
    });
  } else if (actionId === 'choco') {
    focusPrepActionCamera(false);
    playIngredientSound('choco');
    animateDropIntoTarget('choco', new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), () => {
      addCupTopping('choco');
      animatePour(0x4e2a14, 0.3, () => finishStep(), true);
    });
  } else if (actionId === 'tea') {
    focusPrepActionCamera(false);
    playIngredientSound('tea');
    animateDropIntoTarget('tea', new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), () => {
      addCupTopping('tea');
      animatePour(0x7fb069, 0.22, () => finishStep(), true);
    });
  } else if (actionId === 'milk') {
    focusPrepActionCamera(state.recipeKey === 'strawberry_smoothie');
    playPourSound(0.66, 480, 920);
    if (state.recipeKey === 'strawberry_smoothie') {
      animateBlenderFill(0xfaf6ee, 0.38, finishStep);
    } else {
      const milkMixColors = {
        strawberry_latte: 0xf4b6c2,
        hot_choco: 0x6f3e22
      };
      const nextColor = milkMixColors[state.recipeKey] || (state.liquidLevel > 0 ? 0xc8a47e : 0xfaf6ee);
      animatePour(nextColor, Math.min(state.liquidLevel + 0.55, 0.72), () => {
        if (state.recipeKey === 'hot_choco') steamGroup.visible = true;
        finishStep();
      }, true);
    }
  } else if (actionId === 'water') {
    focusPrepActionCamera(false);
    playPourSound(0.7, 560, 1120);
    const waterColors = {
      iced_lemonade: 0xf7e98e,
      hot_tea: 0x98c379,
      hot_americano: 0xd9ecff,
      iced_americano: 0xd9ecff
    };
    const nextColor = waterColors[state.recipeKey] || 0x4a2c18;
    const targetLvl = (state.recipeKey === 'hot_americano' || state.recipeKey === 'iced_americano') ? 0.68 : 0.92;
    animatePour(nextColor, targetLvl, () => {
      if (state.recipeKey === 'hot_americano' || state.recipeKey === 'hot_tea') steamGroup.visible = true;
      finishStep();
    }, true);
  } else if (actionId === 'blender') {
    playBlenderSound();
    const baseZ = blenderModel.position.z;
    const start = performance.now();
    blenderMixMesh.material.color.setHex(0xf2849e);
    const animBlend = (now) => {
      const t = (now - start) / 780;
      if (t < 1) {
        blenderModel.position.z = baseZ + Math.sin(t * 52) * 0.008;
        blenderMixMesh.rotation.y += 0.35;
        blenderMixMesh.scale.x = 1 + Math.sin(t * 28) * 0.05;
        blenderMixMesh.scale.z = 1 + Math.cos(t * 28) * 0.05;
        requestAnimationFrame(animBlend);
      } else {
        blenderModel.position.z = baseZ;
        blenderMixMesh.scale.x = 1;
        blenderMixMesh.scale.z = 1;
        finishStep();
      }
    };
    requestAnimationFrame(animBlend);
  } else if (actionId === 'pour_blender') {
    focusPrepActionCamera(false);
    playPourSound(0.72, 420, 820);
    const startBlenderScale = blenderMixMesh.scale.y || 0.85;
    const startTime = performance.now();
    const animEmpty = (now) => {
      const t = Math.min((now - startTime) / 680, 1);
      const cur = startBlenderScale * (1 - t);
      blenderMixMesh.scale.y = Math.max(cur, 0.01);
      blenderMixMesh.position.y = COUNTER_Y + 0.14 + (0.14 * cur) / 2;
      if (t < 1) requestAnimationFrame(animEmpty);
      else blenderMixMesh.visible = false;
    };
    requestAnimationFrame(animEmpty);
    animatePour(0xf2849e, 0.92, () => finishStep(), true);
  } else if (actionId === 'serve') {
    playServeBell();
    const startPos = drinkGroup.position.clone();
    const servePos = new THREE.Vector3(0, COUNTER_Y + 0.04, 0.32);
    const start = performance.now();
    const animServe = (now) => {
      const t = Math.min((now - start) / 560, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      drinkGroup.position.lerpVectors(startPos, servePos, ease);
      drinkGroup.position.y += Math.sin(t * Math.PI) * 0.06;
      if (serveBellMesh) {
        serveBellMesh.position.y = COUNTER_Y + 0.02 - Math.sin(Math.min(t * 3, 1) * Math.PI) * 0.012;
      }
      if (t < 1) requestAnimationFrame(animServe);
      else {
        if (serveBellMesh) serveBellMesh.position.y = COUNTER_Y + 0.02;
        finishStep();
      }
    };
    requestAnimationFrame(animServe);
  }
}

function animatePour(hexColor, targetLevel, onDone, skipAudio = false) {
  if (!skipAudio) playPourSound(0.68, 520, 1020);
  pourStream.material.color.setHex(hexColor);
  pourStream.position.set(PREP_POS.x, COUNTER_Y + 0.28, PREP_POS.z);
  pourStream.visible = true;

  liquidMesh.visible = true;
  liquidMesh.material.color.setHex(hexColor);

  const startLevel = state.liquidLevel;
  const startTime = performance.now();
  const duration = 700;

  function stepAnim(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const cur = startLevel + (targetLevel - startLevel) * t;
    liquidMesh.scale.y = Math.max(cur, 0.01);
    liquidMesh.position.y = 0.02 + (0.14 * cur) / 2;
    if (t < 1) {
      requestAnimationFrame(stepAnim);
    } else {
      state.liquidLevel = targetLevel;
      pourStream.visible = false;
      onDone();
    }
  }
  requestAnimationFrame(stepAnim);
}

// ============================================================================
// 9. UI 렌더링 & 레이캐스팅
// ============================================================================
function renderUI() {
  const recipe = getCurrentRecipe();
  const currentStep = getCurrentStep();

  document.getElementById('scoreBadge').textContent = `★ ${state.completedCount}`;
  const recipeLabelEl = document.getElementById('currentRecipeLabel');
  if (recipeLabelEl) recipeLabelEl.textContent = `${recipe.emoji} ${recipe.name}`;

  // 시각적 과제 분석표 (상단 순서 카드)
  const strip = document.getElementById('scheduleStrip');
  strip.innerHTML = '';
  let currentCardEl = null;
  recipe.steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    if (idx < state.stepIndex) card.classList.add('done');
    else if (idx === state.stepIndex) {
      card.classList.add('current');
      currentCardEl = card;
    }
    card.innerHTML = `<span class="step-num">${idx < state.stepIndex ? '✓' : idx + 1}</span><span>${step.emoji} ${step.label}</span>`;
    strip.appendChild(card);

    if (idx < recipe.steps.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'step-arrow';
      arrow.textContent = '→';
      strip.appendChild(arrow);
    }
  });
  if (currentCardEl) {
    currentCardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // 현재 단계 배너
  if (currentStep) {
    showGuidance(currentStep.prompt, currentStep.emoji, false);
    if (state.guidedMode) speakKorean(currentStep.prompt);
  }

  // 하단 큰 동작 버튼 (현재 레시피에 필요한 도구들만 깔끔하게 표시하여 인지 부하 감소)
  const neededIds = [...new Set(recipe.steps.map((s) => s.target))];
  const actionBar = document.getElementById('actionBar');
  actionBar.innerHTML = '';
  let highlightedBtnEl = null;
  TOOL_BUTTONS.filter((b) => neededIds.includes(b.id)).forEach((btnInfo) => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    if (state.guidedMode && currentStep && currentStep.target === btnInfo.id) {
      btn.classList.add('highlighted');
      highlightedBtnEl = btn;
    }
    btn.innerHTML = `<span>${btnInfo.emoji}</span><span>${btnInfo.label}</span>`;
    btn.addEventListener('click', () => handleAction(btnInfo.id));
    actionBar.appendChild(btn);
  });
  if (highlightedBtnEl) {
    highlightedBtnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // 3D 강조 링 & 부유 비콘 위치 업데이트
  if (state.guidedMode && currentStep && targetAnchors[currentStep.target]) {
    const anchor = targetAnchors[currentStep.target];
    highlightRing.position.copy(anchor);
    highlightRing.visible = true;
    highlightBeacon.position.set(anchor.x, anchor.y + 0.44, anchor.z);
    highlightBeacon.visible = true;
  } else {
    highlightRing.visible = false;
    highlightBeacon.visible = false;
  }

  // 단계별 자동 카메라 워킹 (작은 화면에서도 대상 오브젝트를 크게 클로즈업)
  if (state.autoCamera && currentStep) {
    focusStepCamera(currentStep.target, 540);
  }
}

function showGuidance(text, emoji, isGentleHint) {
  const banner = document.getElementById('guidanceBanner');
  document.getElementById('guidanceEmoji').textContent = emoji;
  document.getElementById('guidanceText').textContent = text;
  banner.classList.toggle('gentle-hint', Boolean(isGentleHint));
}

function showCompletionModal(recipe) {
  document.getElementById('completeEmoji').textContent = recipe.emoji;
  document.getElementById('completeTitle').textContent = `${recipe.name} 완성!`;
  document.getElementById('completeModal').classList.remove('hidden');
}

function resetDrink() {
  state.stepIndex = 0;
  state.busy = false;
  state.liquidLevel = 0;
  state.hasIce = false;
  drinkGroup.visible = false;
  drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
  drinkGroup.scale.set(1, 1, 1);
  liquidMesh.visible = false;
  liquidMesh.scale.y = 0.01;
  iceGroup.visible = false;
  steamGroup.visible = false;
  cupToppingGroup.visible = false;
  while (cupToppingGroup.children.length > 0) cupToppingGroup.remove(cupToppingGroup.children[0]);
  fallingItemGroup.visible = false;
  blenderMixMesh.visible = false;
  blenderMixMesh.scale.y = 0.01;
  pourStream.visible = false;
  if (portafilterCoffee) portafilterCoffee.visible = false;
  if (shotLiquidMesh) shotLiquidMesh.visible = false;
  document.getElementById('completeModal').classList.add('hidden');
  renderUI();
}

// 마우스/터치 3D 클릭 & 호버
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const hoverLabel = document.getElementById('hoverLabel');
let downPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  if (dist > 8) return; // 카메라 회전 드래그와 클릭 구분
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  if (hits.length > 0) {
    handleAction(hits[0].object.userData.targetId);
  }
});

renderer.domElement.addEventListener('pointermove', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  if (hits.length > 0) {
    hoverLabel.textContent = hits[0].object.userData.label;
    hoverLabel.style.left = `${e.clientX - rect.left}px`;
    hoverLabel.style.top = `${e.clientY - rect.top}px`;
    hoverLabel.classList.remove('hidden');
    container.style.cursor = 'pointer';
  } else {
    hoverLabel.classList.add('hidden');
    container.style.cursor = 'grab';
  }
});

// 상단 음료 선택 드로어 & 버튼 이벤트 연결
const recipePickerBtn = document.getElementById('recipePickerBtn');
const recipeDrawer = document.getElementById('recipeDrawer');
recipePickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = recipeDrawer.classList.toggle('hidden');
  recipePickerBtn.setAttribute('aria-expanded', String(!isHidden));
  if (!isHidden) {
    settingsPopover.classList.add('hidden');
    settingsToggleBtn.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('.recipe-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.recipe-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.recipeKey = btn.dataset.recipe;
    recipeDrawer.classList.add('hidden');
    recipePickerBtn.setAttribute('aria-expanded', 'false');
    resetDrink();
  });
});

// 설정 팝오버 토글
const settingsToggleBtn = document.getElementById('settingsToggleBtn');
const settingsPopover = document.getElementById('settingsPopover');
settingsToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = settingsPopover.classList.toggle('hidden');
  settingsToggleBtn.setAttribute('aria-expanded', String(!isHidden));
  if (!isHidden) {
    recipeDrawer.classList.add('hidden');
    recipePickerBtn.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('pointerdown', (e) => {
  if (!settingsPopover.classList.contains('hidden') && !settingsPopover.contains(e.target) && e.target !== settingsToggleBtn) {
    settingsPopover.classList.add('hidden');
    settingsToggleBtn.setAttribute('aria-expanded', 'false');
  }
  if (!recipeDrawer.classList.contains('hidden') && !recipeDrawer.contains(e.target) && !recipePickerBtn.contains(e.target)) {
    recipeDrawer.classList.add('hidden');
    recipePickerBtn.setAttribute('aria-expanded', 'false');
  }
});

document.getElementById('autoCamBtn').addEventListener('click', (e) => {
  state.autoCamera = !state.autoCamera;
  e.target.textContent = `🎬 자동 카메라: ${state.autoCamera ? '켜짐' : '꺼짐'}`;
  e.target.classList.toggle('active', state.autoCamera);
  if (state.autoCamera) {
    const step = getCurrentStep();
    if (step) focusStepCamera(step.target, 500);
  }
});

document.getElementById('modeBtn').addEventListener('click', (e) => {
  state.guidedMode = !state.guidedMode;
  e.target.textContent = `🧭 안내 모드: ${state.guidedMode ? '켜짐' : '꺼짐'}`;
  e.target.classList.toggle('active', state.guidedMode);
  renderUI();
});

document.getElementById('voiceBtn').addEventListener('click', (e) => {
  state.voiceEnabled = !state.voiceEnabled;
  e.target.textContent = `🔊 음성 안내: ${state.voiceEnabled ? '켜짐' : '꺼짐'}`;
  e.target.classList.toggle('active', state.voiceEnabled);
  if (state.voiceEnabled) {
    const step = getCurrentStep();
    if (step) speakKorean(step.prompt);
  }
});

document.getElementById('soundBtn').addEventListener('click', (e) => {
  state.soundEnabled = !state.soundEnabled;
  e.target.textContent = `🔔 효과음: ${state.soundEnabled ? '켜짐' : '꺼짐'}`;
  e.target.classList.toggle('active', state.soundEnabled);
});

document.getElementById('focusStepBtn').addEventListener('click', () => {
  const step = getCurrentStep();
  if (step) {
    focusStepCamera(step.target, 480);
  } else {
    focusOverviewCamera(480);
  }
});

document.getElementById('resetCamBtn').addEventListener('click', () => {
  focusOverviewCamera(480);
});

document.getElementById('nextDrinkBtn').addEventListener('click', resetDrink);

window.addEventListener('resize', () => {
  camera.fov = getResponsiveFov();
  camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  if (state.cameraViewMode === 'overview') {
    focusOverviewCamera(250);
  } else {
    const step = getCurrentStep();
    if (step) focusStepCamera(step.target, 250);
  }
});

// 렌더 루프
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (highlightRing.visible) {
    const pulse = 1 + Math.sin(t * 3.2) * 0.12;
    highlightRing.scale.set(pulse, pulse, 1);
  }

  if (highlightBeacon.visible && highlightRing.visible) {
    highlightBeacon.position.y = highlightRing.position.y + 0.44 + Math.sin(t * 3.6) * 0.045;
    highlightBeacon.rotation.y = t * 1.8;
  }

  if (steamGroup.visible) {
    steamPuffs.forEach((puff, i) => {
      puff.position.y = 0.22 + ((t * 0.12 + i * 0.15) % 0.25);
      puff.material.opacity = 0.45 * (1 - ((t * 0.12 + i * 0.15) % 0.25) / 0.25);
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

initCafeScene();
animate();
