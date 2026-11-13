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
// 3. 감각 친화적 오디오 (부드러운 효과음 + 선택적 한국어 음성 안내)
// ============================================================================
let audioCtx = null;
function playSoftTone(freq = 523.25, duration = 0.14, type = 'sine') {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch { /* 오디오 미지원 환경 무시 */ }
}

function playSuccessChime() {
  playSoftTone(523.25, 0.16);
  setTimeout(() => playSoftTone(659.25, 0.16), 110);
  setTimeout(() => playSoftTone(783.99, 0.28), 220);
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

const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 50);
camera.position.set(0, 2.02, 2.42);

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
controls.minDistance = 1.8;
controls.maxDistance = 5.2;
controls.maxPolarAngle = Math.PI / 2 - 0.08; // 바닥 아래로 내려가지 않도록 제한
controls.minPolarAngle = 0.25;

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

// 안내 모드 강조 링
const highlightRing = new THREE.Mesh(
  new THREE.RingGeometry(0.14, 0.19, 32),
  new THREE.MeshBasicMaterial({ color: 0xd9822b, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
);
highlightRing.rotation.x = -Math.PI / 2;
highlightRing.visible = false;
scene.add(highlightRing);

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

const liquidMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.056, 0.048, 0.14, 24),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.25, transparent: true, opacity: 0.92 })
);
liquidMesh.position.y = 0.02;
liquidMesh.scale.y = 0.01;
liquidMesh.visible = false;
drinkGroup.add(liquidMesh);

const iceGroup = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.032, 0.032),
    new THREE.MeshStandardMaterial({ color: 0xdff6ff, roughness: 0.1, transparent: true, opacity: 0.78 })
  );
  ice.position.set((i % 2 === 0 ? -0.018 : 0.018), 0.045 + Math.floor(i / 2) * 0.032, (i % 3 === 0 ? 0.014 : -0.014));
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
      new THREE.BoxGeometry(0.16, 0.24, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x3b3532, roughness: 0.4, metalness: 0.3 })
    );
    grinderBody.position.y = 0.12;
    grinderBody.castShadow = true;
    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.04, 0.14, 20),
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.3, transparent: true, opacity: 0.82 })
    );
    hopper.position.y = 0.31;
    const chute = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.06, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6, roughness: 0.25 })
    );
    chute.position.set(0, 0.16, 0.1);
    grinderModel.add(grinderBody, hopper, chute);
    grinderModel.position.set(-1.12, COUNTER_Y, -0.14);
    scene.add(grinderModel);
    registerInteractive(grinderModel, 'grinder', '원두 그라인더 (원두 갈기)', new THREE.Vector3(-1.12, COUNTER_Y + 0.01, -0.14));

    // 탬핑 매트 + 포터필터 + 탬퍼
    const tamperStation = new THREE.Group();
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.015, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x2a2725, roughness: 0.85 })
    );
    mat.position.y = 0.008;
    const pfBasket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.045, 20),
      new THREE.MeshStandardMaterial({ color: 0xb0b5b9, metalness: 0.75, roughness: 0.25 })
    );
    pfBasket.position.set(-0.04, 0.038, 0);
    const pfHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.018, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: 0x2c241e, roughness: 0.6 })
    );
    pfHandle.rotation.x = Math.PI / 2;
    pfHandle.position.set(-0.04, 0.038, 0.09);
    portafilterCoffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.012, 20),
      new THREE.MeshStandardMaterial({ color: 0x4b2e1e, roughness: 0.9 })
    );
    portafilterCoffee.position.set(-0.04, 0.056, 0);
    portafilterCoffee.visible = false;

    tamperMesh = new THREE.Group();
    const tamperBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.018, 20),
      new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 0.8, roughness: 0.2 })
    );
    const tamperGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.018, 0.065, 16),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.5 })
    );
    tamperGrip.position.y = 0.04;
    tamperMesh.add(tamperBase, tamperGrip);
    tamperMesh.position.set(0.06, 0.025, 0);

    tamperStation.add(mat, pfBasket, pfHandle, portafilterCoffee, tamperMesh);
    tamperStation.position.set(-0.88, COUNTER_Y, 0.24);
    scene.add(tamperStation);
    registerInteractive(tamperStation, 'tamper', '탬퍼 (원두 다지기)', new THREE.Vector3(-0.88, COUNTER_Y + 0.01, 0.24));

    // 에스프레소 샷잔
    shotGlassGroup = new THREE.Group();
    const shotCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.025, 0.07, 18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.1 })
    );
    shotCup.position.y = 0.035;
    shotLiquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.023, 0.048, 18),
      new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.25 })
    );
    shotLiquidMesh.position.y = 0.028;
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

    // 딸기, 레몬, 초콜릿 3D 모델
    placeModel(strawberry, 0.13, 0.92, COUNTER_Y, 0.06);
    registerInteractive(strawberry, 'strawberry', '신선한 딸기', new THREE.Vector3(0.92, COUNTER_Y + 0.01, 0.06));

    placeModel(lemon, 0.12, 0.92, COUNTER_Y, 0.24);
    registerInteractive(lemon, 'lemon', '상큼한 레몬', new THREE.Vector3(0.92, COUNTER_Y + 0.01, 0.24));

    placeModel(choco, 0.03, 0.68, COUNTER_Y, 0.24);
    registerInteractive(choco, 'choco', '달콤한 초콜릿', new THREE.Vector3(0.68, COUNTER_Y + 0.01, 0.24));

    // 녹차 티백 상자
    const teaBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.11, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x6b9e78, roughness: 0.5 })
    );
    teaBox.position.set(-0.62, COUNTER_Y + 0.055, 0.24);
    teaBox.castShadow = true;
    scene.add(teaBox);
    registerInteractive(teaBox, 'tea', '녹차 티백 상자', new THREE.Vector3(-0.62, COUNTER_Y + 0.01, 0.24));

    // 대기 중인 컵들 (클릭해서 쟁반에 올리기)
    placeModel(standCup, 0.14, -1.08, COUNTER_Y, 0.14);
    placeModel(standGlass, 0.17, -0.92, COUNTER_Y, 0.16);
    registerInteractive(standCup, 'cup', '컵 올리기', new THREE.Vector3(-1.0, COUNTER_Y + 0.01, 0.15));
    registerInteractive(standGlass, 'cup', '컵 올리기', new THREE.Vector3(-1.0, COUNTER_Y + 0.01, 0.15));

    // 얼음 통 (시각적으로 명확한 하늘색 아이스박스)
    const iceBox = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x7ec8e3, roughness: 0.35 })
    );
    boxMesh.position.y = 0.08;
    boxMesh.castShadow = true;
    iceBox.add(boxMesh);
    iceBox.position.set(0.36, COUNTER_Y, 0.16);
    scene.add(iceBox);
    registerInteractive(iceBox, 'ice', '얼음 통', new THREE.Vector3(0.36, COUNTER_Y + 0.01, 0.16));

    // 손님께 드리기 벨 (초록색 서빙 존)
    const serveBell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0x487555, roughness: 0.3 })
    );
    serveBell.position.set(0, COUNTER_Y + 0.02, 0.38);
    serveBell.castShadow = true;
    scene.add(serveBell);
    registerInteractive(serveBell, 'serve', '손님께 드리기', new THREE.Vector3(0, COUNTER_Y + 0.01, 0.38));

    // 쟁반 위 동적 컵 모델 준비 (drinkGroup 내부에 배치)
    prepDynamicCup(cupMug, 0.15);
    prepDynamicCup(cupGlass, 0.18);
    prepDynamicCup(cupTea, 0.14);
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
    playSoftTone(330, 0.1);
    showGuidance(`괜찮아요! 지금은 "${currentStep.label}" 차례예요. ${currentStep.prompt}`, '💡', true);
    speakKorean(`지금은 ${currentStep.label} 차례예요.`);
    return;
  }

  executeStep(actionId);
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
      playSoftTone(587.33, 0.12);
    }
    renderUI();
  };

  if (actionId === 'grinder') {
    playSoftTone(260, 0.25, 'triangle');
    const baseX = grinderModel.position.x;
    const start = performance.now();
    const animGrind = (now) => {
      const t = (now - start) / 650;
      if (t < 1) {
        grinderModel.position.x = baseX + Math.sin(t * 40) * 0.006;
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
    shotLiquidMesh.visible = false;
    const nextColor = state.recipeKey === 'iced_latte' ? 0xb5885c : 0x3b2314;
    animatePour(nextColor, 0.92, () => {
      if (state.recipeKey === 'hot_americano') steamGroup.visible = true;
      finishStep();
    });
  } else if (actionId === 'cup') {
    drinkGroup.visible = true;
    activeCupModels.mug.visible = recipe.cupType === 'mug';
    activeCupModels.glass.visible = recipe.cupType === 'glass';
    activeCupModels.tea.visible = recipe.cupType === 'tea';
    liquidMesh.visible = false;
    iceGroup.visible = false;
    steamGroup.visible = false;
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
    if (state.recipeKey === 'strawberry_smoothie') {
      playSoftTone(680, 0.08);
      setTimeout(finishStep, 400);
    } else {
      iceGroup.visible = true;
      state.hasIce = true;
      playSoftTone(680, 0.08);
      const start = performance.now();
      const animIce = (now) => {
        const t = Math.min((now - start) / 480, 1);
        const drop = Math.pow(1 - t, 2) * 0.16;
        iceGroup.position.y = drop;
        if (t < 1) requestAnimationFrame(animIce);
        else {
          iceGroup.position.y = 0;
          finishStep();
        }
      };
      requestAnimationFrame(animIce);
    }
  } else if (actionId === 'strawberry') {
    if (state.recipeKey === 'strawberry_smoothie') {
      playSoftTone(520, 0.1);
      setTimeout(finishStep, 400);
    } else {
      animatePour(0xd94862, 0.28, () => finishStep());
    }
  } else if (actionId === 'lemon') {
    animatePour(0xf4d03f, 0.28, () => finishStep());
  } else if (actionId === 'choco') {
    animatePour(0x4e2a14, 0.3, () => finishStep());
  } else if (actionId === 'tea') {
    animatePour(0x7fb069, 0.22, () => finishStep());
  } else if (actionId === 'milk') {
    if (state.recipeKey === 'strawberry_smoothie') {
      playSoftTone(480, 0.1);
      setTimeout(finishStep, 400);
    } else {
      const milkMixColors = {
        strawberry_latte: 0xf4b6c2,
        hot_choco: 0x6f3e22
      };
      const nextColor = milkMixColors[state.recipeKey] || (state.liquidLevel > 0 ? 0xc8a47e : 0xfaf6ee);
      animatePour(nextColor, Math.min(state.liquidLevel + 0.55, 0.72), () => {
        if (state.recipeKey === 'hot_choco') steamGroup.visible = true;
        finishStep();
      });
    }
  } else if (actionId === 'water') {
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
    });
  } else if (actionId === 'blender') {
    playSoftTone(300, 0.3, 'triangle');
    const baseZ = blenderModel.position.z;
    const start = performance.now();
    const animBlend = (now) => {
      const t = (now - start) / 750;
      if (t < 1) {
        blenderModel.position.z = baseZ + Math.sin(t * 48) * 0.008;
        requestAnimationFrame(animBlend);
      } else {
        blenderModel.position.z = baseZ;
        finishStep();
      }
    };
    requestAnimationFrame(animBlend);
  } else if (actionId === 'pour_blender') {
    animatePour(0xf2849e, 0.92, () => finishStep());
  } else if (actionId === 'serve') {
    finishStep();
  }
}

function animatePour(hexColor, targetLevel, onDone) {
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

  document.getElementById('scoreBadge').textContent = `★ 만든 음료: ${state.completedCount}잔`;

  // 시각적 과제 분석표 (상단 순서 카드)
  const strip = document.getElementById('scheduleStrip');
  strip.innerHTML = '';
  recipe.steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    if (idx < state.stepIndex) card.classList.add('done');
    else if (idx === state.stepIndex) card.classList.add('current');
    card.innerHTML = `<span class="step-num">${idx < state.stepIndex ? '✓' : idx + 1}</span><span>${step.emoji} ${step.label}</span>`;
    strip.appendChild(card);

    if (idx < recipe.steps.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'step-arrow';
      arrow.textContent = '→';
      strip.appendChild(arrow);
    }
  });

  // 현재 단계 배너
  if (currentStep) {
    showGuidance(currentStep.prompt, currentStep.emoji, false);
    if (state.guidedMode) speakKorean(currentStep.prompt);
  }

  // 하단 큰 동작 버튼 (현재 레시피에 필요한 도구들만 깔끔하게 표시하여 인지 부하 감소)
  const neededIds = [...new Set(recipe.steps.map((s) => s.target))];
  const actionBar = document.getElementById('actionBar');
  actionBar.innerHTML = '';
  TOOL_BUTTONS.filter((b) => neededIds.includes(b.id)).forEach((btnInfo) => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    if (state.guidedMode && currentStep && currentStep.target === btnInfo.id) {
      btn.classList.add('highlighted');
    }
    btn.innerHTML = `<span>${btnInfo.emoji}</span><span>${btnInfo.label}</span>`;
    btn.addEventListener('click', () => handleAction(btnInfo.id));
    actionBar.appendChild(btn);
  });

  // 3D 강조 링 위치 업데이트
  if (state.guidedMode && currentStep && targetAnchors[currentStep.target]) {
    highlightRing.position.copy(targetAnchors[currentStep.target]);
    highlightRing.visible = true;
  } else {
    highlightRing.visible = false;
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
  liquidMesh.visible = false;
  iceGroup.visible = false;
  steamGroup.visible = false;
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

// 상단 버튼 이벤트 연결
document.querySelectorAll('.recipe-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.recipe-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.recipeKey = btn.dataset.recipe;
    resetDrink();
  });
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

document.getElementById('resetCamBtn').addEventListener('click', () => {
  const fromPos = camera.position.clone();
  const toPos = new THREE.Vector3(0, 2.02, 2.42);
  const fromTarget = controls.target.clone();
  const toTarget = new THREE.Vector3(0, 1.02, 0.05);
  const start = performance.now();
  const animCam = (now) => {
    const t = Math.min((now - start) / 420, 1);
    const k = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(fromPos, toPos, k);
    controls.target.lerpVectors(fromTarget, toTarget, k);
    if (t < 1) requestAnimationFrame(animCam);
  };
  requestAnimationFrame(animCam);
});

document.getElementById('nextDrinkBtn').addEventListener('click', resetDrink);

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// 렌더 루프
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (highlightRing.visible) {
    const pulse = 1 + Math.sin(t * 3.2) * 0.1;
    highlightRing.scale.set(pulse, pulse, 1);
  }

  if (steamGroup.visible) {
    steamPuffs.forEach((puff, i) => {
      puff.position.y = 0.18 + ((t * 0.12 + i * 0.15) % 0.25);
      puff.material.opacity = 0.45 * (1 - ((t * 0.12 + i * 0.15) % 0.25) / 0.25);
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

initCafeScene();
animate();
