import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// 1. 작업 품목 및 과제분석 데이터 정의 (한국 작업장 표준 콘센트 조립 8종)
// ============================================================================
const PRODUCT_CATEGORIES = [
  { id: 'wall_outlet', title: '🔌 벽부형 콘센트 조립' },
  { id: 'multitap', title: '⚡ 멀티탭 조립' },
  { id: 'plug_pack', title: '🔧 플러그 · 검수 포장' }
];

const CASE_LABELS = {
  wall1: '1구 벽 콘센트 케이스',
  wall2: '2구 벽 콘센트 케이스',
  wall_splash: '방우형 콘센트 케이스',
  tap2: '2구 멀티탭 케이스',
  tap3: '3구 멀티탭 케이스',
  tap4: '4구 멀티탭 케이스',
  plug: '접지 플러그 하우징',
  pack: '검수용 멀티탭 본체'
};

const RECIPES = {
  wall_1g: {
    name: '1구 접지 벽 콘센트',
    emoji: '🔌',
    category: 'wall_outlet',
    caseType: 'wall1',
    needsSwitch: false,
    needsCord: false,
    needsPacking: false,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '하단 케이스 놓기', emoji: '📦', prompt: '하단 케이스를 눌러 조립 지그 위에 올려놓아요.' },
      { target: 'terminal', label: '전원 단자 끼우기', emoji: '🟨', prompt: '황동 전원 단자를 눌러 케이스 좌우 홈에 끼워요.' },
      { target: 'ground_part', label: '접지 단자 끼우기', emoji: '🧲', prompt: '접지 단자를 눌러 가운데 접지 홈에 단단히 끼워요.' },
      { target: 'shutter', label: '안전 셔터 올리기', emoji: '🛡️', prompt: '안전 셔터를 눌러 구멍 보호막을 끼워요.' },
      { target: 'top_cover', label: '상단 덮개 씌우기', emoji: '⬜', prompt: '상단 덮개를 눌러 케이스 위를 정확히 덮어요.' },
      { target: 'screw', label: '조립 나사 끼우기', emoji: '🔩', prompt: '조립 나사를 눌러 나사 구멍에 끼워 넣어요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버를 눌러 나사를 튼튼하게 조여요.' },
      { target: 'tester', label: '통전 안전 검사', emoji: '⚡', prompt: '통전 검사기를 눌러 전기가 잘 통하는지 확인해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '1구 접지 콘센트 완성! 완성함에 정성껏 담아요.' }
    ]
  },
  wall_2g: {
    name: '2구 접지 벽 콘센트',
    emoji: '🔌',
    category: 'wall_outlet',
    caseType: 'wall2',
    needsSwitch: false,
    needsCord: false,
    needsPacking: false,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '2구 케이스 놓기', emoji: '📦', prompt: '2구 하단 케이스를 눌러 조립 지그에 올려놓아요.' },
      { target: 'terminal', label: '전원 단자 끼우기', emoji: '🟨', prompt: '2구용 황동 전원 단자를 좌우 레일에 끼워요.' },
      { target: 'ground_part', label: '접지 레일 끼우기', emoji: '🧲', prompt: '중앙 접지 연결 레일을 바르게 끼워요.' },
      { target: 'shutter', label: '2구 안전 셔터', emoji: '🛡️', prompt: '2구 안전 셔터를 양쪽 콘센트 위치에 끼워요.' },
      { target: 'top_cover', label: '2구 덮개 씌우기', emoji: '⬜', prompt: '2구 상단 덮개를 눌러 빈틈없이 닫아요.' },
      { target: 'screw', label: '조립 나사 끼우기', emoji: '🔩', prompt: '고정 나사를 중앙과 양쪽 홈에 끼워요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 나사를 꽉 조여 고정해요.' },
      { target: 'tester', label: '통전 안전 검사', emoji: '⚡', prompt: '통전 검사기로 양쪽 구멍을 차례로 검사해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '2구 접지 벽 콘센트 완성! 완성함에 담아요.' }
    ]
  },
  wall_splash: {
    name: '방우형 커버 콘센트',
    emoji: '💧',
    category: 'wall_outlet',
    caseType: 'wall_splash',
    needsSwitch: false,
    needsCord: false,
    needsPacking: true,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '방우 케이스 놓기', emoji: '📦', prompt: '방우형 하단 케이스를 조립 지그 위에 올려놓아요.' },
      { target: 'packing', label: '방수 패킹 끼우기', emoji: '🔵', prompt: '고무 방수 패킹을 테두리 홈에 꼼꼼히 끼워요.' },
      { target: 'terminal', label: '전원 단자 끼우기', emoji: '🟨', prompt: '황동 전원 단자를 안쪽 홈에 끼워요.' },
      { target: 'ground_part', label: '접지 단자 끼우기', emoji: '🧲', prompt: '접지 단자를 중앙 위치에 맞춰 끼워요.' },
      { target: 'shutter', label: '안전 셔터 올리기', emoji: '🛡️', prompt: '안전 셔터를 눌러 내부를 보호해요.' },
      { target: 'top_cover', label: '투명 방우 덮개', emoji: '⬜', prompt: '물기가 들어가지 않게 투명 방우 덮개를 닫아요.' },
      { target: 'screw', label: '조립 나사 끼우기', emoji: '🔩', prompt: '방우 고정 나사를 끼워 넣어요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 나사를 고르게 조여요.' },
      { target: 'tester', label: '통전 안전 검사', emoji: '⚡', prompt: '통전 검사기로 안전하게 작동하는지 확인해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '방우형 콘센트 완성! 완성함에 담아요.' }
    ]
  },
  tap_2g: {
    name: '2구 기본 멀티탭',
    emoji: '⚡',
    category: 'multitap',
    caseType: 'tap2',
    needsSwitch: false,
    needsCord: true,
    needsPacking: false,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '멀티탭 케이스 놓기', emoji: '📦', prompt: '2구 멀티탭 하단 케이스를 지그에 올려놓아요.' },
      { target: 'terminal', label: '통전 버스바 끼우기', emoji: '🟨', prompt: '황동 통전 버스바 2줄을 홈에 맞춰 끼워요.' },
      { target: 'ground_part', label: '접지 레일 끼우기', emoji: '🧲', prompt: '가운데 접지 레일을 길게 끼워 맞춰요.' },
      { target: 'cord', label: '전원 코드선 연결', emoji: '➰', prompt: '전원 코드선을 입구 홈에 끼우고 단자에 연결해요.' },
      { target: 'shutter', label: '안전 셔터 올리기', emoji: '🛡️', prompt: '2구 안전 셔터를 콘센트 구멍 위치에 올려요.' },
      { target: 'top_cover', label: '상단 덮개 닫기', emoji: '⬜', prompt: '상단 덮개를 눌러 딸깍 소리가 나게 닫아요.' },
      { target: 'screw', label: '고정 나사 끼우기', emoji: '🔩', prompt: '멀티탭 고정 나사를 구멍마다 끼워요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 나사를 단단히 조여요.' },
      { target: 'tester', label: '통전 안전 검사', emoji: '⚡', prompt: '통전 검사기로 모든 구멍의 전기를 확인해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '2구 멀티탭 완성! 완성함에 담아요.' }
    ]
  },
  tap_3g_switch: {
    name: '3구 일체형 스위치 멀티탭',
    emoji: '🔴',
    category: 'multitap',
    caseType: 'tap3',
    needsSwitch: true,
    needsCord: true,
    needsPacking: false,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '3구 케이스 놓기', emoji: '📦', prompt: '3구 멀티탭 하단 케이스를 작업대 지그에 놓아요.' },
      { target: 'terminal', label: '통전 버스바 끼우기', emoji: '🟨', prompt: '3구용 황동 통전 버스바를 홈에 끼워요.' },
      { target: 'ground_part', label: '접지 레일 끼우기', emoji: '🧲', prompt: '3구 접지 레일을 중앙 홈에 정확히 끼워요.' },
      { target: 'switch_part', label: '전원 스위치 끼우기', emoji: '🔴', prompt: '빨간 일체형 전원 스위치를 스위치 자리에 끼워요.' },
      { target: 'cord', label: '전원 코드선 연결', emoji: '➰', prompt: '전원 코드선을 스위치와 단자에 맞게 끼워요.' },
      { target: 'shutter', label: '3구 안전 셔터', emoji: '🛡️', prompt: '3구 안전 셔터를 구멍 위치에 맞춰 올려요.' },
      { target: 'top_cover', label: '상단 덮개 닫기', emoji: '⬜', prompt: '스위치 구멍을 맞춰 상단 덮개를 덮어요.' },
      { target: 'screw', label: '고정 나사 끼우기', emoji: '🔩', prompt: '고정 나사를 케이스 홈에 끼워요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 나사를 튼튼하게 조여요.' },
      { target: 'tester', label: '스위치·통전 검사', emoji: '⚡', prompt: '통전 검사기로 스위치와 전기 흐름을 검사해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '3구 스위치 멀티탭 완성! 완성함에 담아요.' }
    ]
  },
  tap_4g_ind: {
    name: '4구 개별 스위치 멀티탭',
    emoji: '🟢',
    category: 'multitap',
    caseType: 'tap4',
    needsSwitch: true,
    needsCord: true,
    needsPacking: false,
    needsShutter: true,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '4구 케이스 놓기', emoji: '📦', prompt: '4구 멀티탭 하단 케이스를 지그에 올려놓아요.' },
      { target: 'terminal', label: '통전 버스바 끼우기', emoji: '🟨', prompt: '4구용 긴 황동 통전 버스바를 끼워요.' },
      { target: 'ground_part', label: '접지 레일 끼우기', emoji: '🧲', prompt: '4구 접지 레일을 중앙 홈에 끼워요.' },
      { target: 'switch_part', label: '개별 스위치 4개', emoji: '🔴', prompt: '개별 스위치 모듈 4개를 각 자리에 끼워요.' },
      { target: 'cord', label: '전원 코드선 연결', emoji: '➰', prompt: '전원 코드선을 입구 고정 클립에 끼워요.' },
      { target: 'shutter', label: '4구 안전 셔터', emoji: '🛡️', prompt: '4구 안전 셔터를 모두 바르게 올려요.' },
      { target: 'top_cover', label: '상단 덮개 닫기', emoji: '⬜', prompt: '4구 상단 덮개를 빈틈없이 덮어 닫아요.' },
      { target: 'screw', label: '고정 나사 끼우기', emoji: '🔩', prompt: '고정 나사를 각 구멍에 끼워 넣어요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 모든 나사를 단단히 조여요.' },
      { target: 'tester', label: '개별 스위치 검사', emoji: '⚡', prompt: '통전 검사기로 4구와 스위치를 꼼꼼히 검사해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '4구 개별 스위치 멀티탭 완성! 완성함에 담아요.' }
    ]
  },
  plug_2p: {
    name: '2구 접지 플러그 조립',
    emoji: '🔌',
    category: 'plug_pack',
    caseType: 'plug',
    needsSwitch: false,
    needsCord: true,
    needsPacking: false,
    needsShutter: false,
    needsLabel: false,
    steps: [
      { target: 'base_case', label: '플러그 하부 놓기', emoji: '📦', prompt: '접지 플러그 하단 하우징을 지그에 놓아요.' },
      { target: 'terminal', label: '전원 핀 2개 끼우기', emoji: '🟨', prompt: '원형 전원 핀 2개를 앞쪽 홈에 끼워요.' },
      { target: 'ground_part', label: '접지 클립 끼우기', emoji: '🧲', prompt: '위아래 접지 클립을 바르게 끼워요.' },
      { target: 'cord', label: '전원선 고정하기', emoji: '➰', prompt: '전원 코드선을 넣고 선 고정 클립을 맞춰요.' },
      { target: 'top_cover', label: '플러그 덮개 닫기', emoji: '⬜', prompt: '플러그 상단 하우징을 맞춰 덮어요.' },
      { target: 'screw', label: '조립 나사 끼우기', emoji: '🔩', prompt: '가운데 고정 나사를 끼워 넣어요.' },
      { target: 'driver', label: '드라이버로 조이기', emoji: '🪛', prompt: '전동 드라이버로 나사를 단단히 조여요.' },
      { target: 'tester', label: '통전 안전 검사', emoji: '⚡', prompt: '통전 검사기로 양쪽 핀과 접지를 검사해요.' },
      { target: 'finish_box', label: '완성함 담기', emoji: '✅', prompt: '접지 플러그 완성! 완성함에 담아요.' }
    ]
  },
  tap_qc_pack: {
    name: '멀티탭 검수 · KC라벨 포장',
    emoji: '🏷️',
    category: 'plug_pack',
    caseType: 'pack',
    needsSwitch: false,
    needsCord: false,
    needsPacking: false,
    needsShutter: false,
    needsLabel: true,
    steps: [
      { target: 'base_case', label: '완제품 올리기', emoji: '📦', prompt: '검수할 멀티탭 본체를 작업대 지그에 올려요.' },
      { target: 'tester', label: '최종 통전 검사', emoji: '⚡', prompt: '통전 검사기로 누전과 전원 이상이 없는지 검사해요.' },
      { target: 'label', label: 'KC라벨 · 선 묶기', emoji: '🏷️', prompt: 'KC 안전 라벨을 붙이고 전원선을 깔끔히 묶어요.' },
      { target: 'finish_box', label: '포장 완료 담기', emoji: '✅', prompt: '검수와 포장을 마쳤어요! 출하 완성함에 담아요.' }
    ]
  }
};

const TOOL_BUTTONS = [
  { id: 'base_case', label: '하단 케이스', emoji: '📦' },
  { id: 'packing', label: '방수 패킹', emoji: '🔵' },
  { id: 'terminal', label: '전원 단자', emoji: '🟨' },
  { id: 'ground_part', label: '접지 단자', emoji: '🧲' },
  { id: 'switch_part', label: '스위치 모듈', emoji: '🔴' },
  { id: 'cord', label: '전원 코드선', emoji: '➰' },
  { id: 'shutter', label: '안전 셔터', emoji: '🛡️' },
  { id: 'top_cover', label: '상단 덮개', emoji: '⬜' },
  { id: 'screw', label: '조립 나사', emoji: '🔩' },
  { id: 'driver', label: '전동 드라이버', emoji: '🪛' },
  { id: 'tester', label: '통전 검사기', emoji: '⚡' },
  { id: 'label', label: 'KC라벨 · 타이', emoji: '🏷️' },
  { id: 'finish_box', label: '완성함 담기', emoji: '✅' }
];

const EASY_STEP_MAP = {
  base_case: { label: '아래 틀 놓기', prompt: '먼저 아래쪽 플라스틱 틀을 가운데 판에 올려요.' },
  packing: { label: '고무 링 끼우기', prompt: '파란 고무 링을 테두리에 꼭 맞게 끼워요.' },
  terminal: { label: '구리 판 끼우기', prompt: '노란 구리 부품을 안쪽 홈에 넣어요.' },
  ground_part: { label: '가운데 선 끼우기', prompt: '가운데 안전 부품을 홈에 맞춰 끼워요.' },
  switch_part: { label: '스위치 끼우기', prompt: '빨간 똑딱이 스위치를 자리에 끼워요.' },
  cord: { label: '전선 끼우기', prompt: '긴 검정 전선을 입구에 잘 맞춰 끼워요.' },
  shutter: { label: '안전막 올리기', prompt: '구멍을 막아주는 하얀 안전막을 올려요.' },
  top_cover: { label: '윗 뚜껑 닫기', prompt: '하얀 윗 뚜껑을 빈틈없이 덮어 닫아요.' },
  screw: { label: '나사 넣기', prompt: '작은 나사를 구멍에 하나씩 넣어요.' },
  driver: { label: '나사 돌리기', prompt: '전동 드라이버를 눌러 나사를 튼튼하게 조여요.' },
  tester: { label: '전기 검사하기', prompt: '검사기를 눌러 초록불이 켜지는지 확인해요.' },
  label: { label: '스티커 · 줄 묶기', prompt: '안전 스티커를 붙이고 전선을 예쁘게 묶어요.' },
  finish_box: { label: '완성 상자 넣기', prompt: '다 만든 콘센트를 완성 상자에 넣어요!' }
};

// ============================================================================
// 2. 상태 관리
// ============================================================================
const OUTLET_COUNT_KEY = 'safe_mover.outlet.count.v1';
function loadOutletCount() {
  try {
    const n = Number(localStorage.getItem(OUTLET_COUNT_KEY) || 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}
function saveOutletCount(n) {
  try { localStorage.setItem(OUTLET_COUNT_KEY, String(n)); } catch {}
}

function createInitialCraft() {
  return {
    casePlaced: null, // null | 'wall1' | 'wall2' | ...
    packingAdded: false,
    terminalAdded: false,
    groundAdded: false,
    switchAdded: false,
    cordAdded: false,
    shutterAdded: false,
    coverAdded: false,
    screwAdded: false,
    screwDriven: false,
    tested: false,
    testPassed: false,
    labelAdded: false,
    spilled: false,
    mistakes: [],
    log: []
  };
}

const state = {
  recipeKey: 'wall_1g',
  practiceMode: 'auto', // 'auto' | 'manual' | 'practicum'
  stepIndex: 0,
  awaitingNextChoice: false,
  manualChoices: [],
  awaitingCasePick: false,
  guidedMode: true,
  autoCamera: true,
  cameraViewMode: 'step', // 'step' | 'overview'
  voiceEnabled: false,
  soundEnabled: true,
  easyMode: false,
  slowPace: false,
  guidanceHidden: false,
  paused: false,
  busy: false,
  completedCount: loadOutletCount(),
  craft: createInitialCraft()
};

// ============================================================================
// 3. 감각 친화적 Web Audio 합성 효과음 + 한국어 음성 안내
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
  } catch {}
}

function playSnapSound() {
  playSoftTone(360, 0.07, 'triangle', 0.06);
  playSoftTone(580, 0.09, 'sine', 0.05, 0.05);
}

function playMetalClickSound() {
  playSoftTone(920, 0.07, 'triangle', 0.05);
  playSoftTone(1380, 0.08, 'sine', 0.035, 0.04);
}

function playDriverSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 540;
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.25);
    osc.frequency.linearRampToValueAtTime(175, t + 0.55);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.58);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
    // 토크 클러치 딸깍
    playSoftTone(780, 0.05, 'triangle', 0.045, 0.52);
  } catch {}
}

function playTesterSound(pass = true) {
  if (pass) {
    playSoftTone(880, 0.12, 'sine', 0.055, 0.18);
    playSoftTone(1174.66, 0.18, 'sine', 0.055, 0.31);
  } else {
    playSoftTone(330, 0.16, 'triangle', 0.05, 0.15);
    playSoftTone(277.18, 0.2, 'triangle', 0.05, 0.32);
  }
}

function playBoxCompleteSound() {
  playSoftTone(523.25, 0.14, 'sine', 0.05);
  playSoftTone(659.25, 0.14, 'sine', 0.05, 0.08);
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

function speakKorean(text, forceSpeak) {
  if (!state.voiceEnabled && !forceSpeak) return;
  const rate = state.slowPace ? 0.82 : 0.92;
  if (window.D1Bridge && typeof window.D1Bridge.speakText === 'function') {
    window.D1Bridge.speakText(text, rate, 1.02);
    return;
  }
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ko-KR';
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

// ============================================================================
// 4. Three.js 씬 & 밝고 정돈된 작업실 환경 구축
// ============================================================================
const container = document.getElementById('canvasContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef2f6);
scene.fog = new THREE.Fog(0xeef2f6, 6.2, 14.5);

function getResponsiveFov() {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  return aspect < 0.85 ? 48 : 42;
}

const camera = new THREE.PerspectiveCamera(getResponsiveFov(), container.clientWidth / container.clientHeight, 0.1, 50);
camera.position.set(0, 1.82, 2.28);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.02, 0.05);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.45;
controls.maxDistance = 4.8;
controls.maxPolarAngle = Math.PI / 2 - 0.08;
controls.minPolarAngle = 0.25;

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
    target: new THREE.Vector3(0, 1.04, 0.04),
    pos: new THREE.Vector3(0, 1.04 + 0.86 * mult, 2.52 * mult)
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
  const bounds = targetBounds[targetId];

  // 조립 동작이 일어나는 부품/공구는 중앙 지그와 트레이 사이가 보이도록 구도 조정
  if (bounds) {
    const maxSpan = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 0.22);
    const dist = Math.max(0.76, Math.min(1.22, maxSpan * 2.4)) * mult;
    const lookY = Math.max(COUNTER_Y + 0.07, bounds.center.y + 0.02);
    return {
      target: new THREE.Vector3(bounds.center.x * 0.65, lookY, bounds.center.z * 0.65),
      pos: new THREE.Vector3(
        bounds.center.x * 0.65 + 0.05 * mult,
        lookY + dist * 0.56,
        bounds.center.z * 0.65 + dist * 0.96
      )
    };
  }
  return getOverviewPreset();
}

function focusStepCamera(targetId, duration = 520) {
  state.cameraViewMode = 'step';
  updateCameraModeButtons();
  const preset = getStepCameraPreset(targetId);
  animateCameraTo(preset.pos, preset.target, duration);
}

function focusJigCamera() {
  if (!state.autoCamera || state.cameraViewMode === 'overview') return;
  const mult = getAspectMultiplier();
  animateCameraTo(
    new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.44 * mult, PREP_POS.z + 0.68 * mult),
    new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.07, PREP_POS.z),
    360
  );
}

function updateCameraModeButtons() {
  const focusBtn = document.getElementById('focusStepBtn');
  const resetBtn = document.getElementById('resetCamBtn');
  if (focusBtn) focusBtn.classList.toggle('active', state.cameraViewMode === 'step');
  if (resetBtn) resetBtn.classList.toggle('active', state.cameraViewMode === 'overview');
}

// 밝고 안정적인 작업실 3점 조명
scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 1.45));
const dirLight = new THREE.DirectionalLight(0xfffcf5, 1.45);
dirLight.position.set(3.2, 5.8, 4.2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 15;
dirLight.shadow.camera.left = -3.2;
dirLight.shadow.camera.right = 3.2;
dirLight.shadow.camera.top = 3.2;
dirLight.shadow.camera.bottom = -2.2;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
fillLight.position.set(-3.0, 3.0, 2.5);
scene.add(fillLight);

const prepSpot = new THREE.PointLight(0xffffff, 0.9, 3.5);
prepSpot.position.set(0, 1.88, 0.32);
scene.add(prepSpot);

// 바닥과 벽 (깔끔한 작업실 배경)
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 12),
  new THREE.MeshStandardMaterial({ color: 0xdbe3ec, roughness: 0.85 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 5.5),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.94 })
);
backWall.position.set(0, 2.75, -1.65);
backWall.receiveShadow = true;
scene.add(backWall);

const wallTrim = new THREE.Mesh(
  new THREE.BoxGeometry(16, 0.95, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.82 })
);
wallTrim.position.set(0, 0.475, -1.63);
wallTrim.receiveShadow = true;
scene.add(wallTrim);

// 벽면 작업 안전 및 조립 안내판
function createWorkshopBoard() {
  const cv = document.createElement('canvas');
  cv.width = 1152;
  cv.height = 512;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0f3b3a';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, cv.width - 24, cv.height - 24);
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 42px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ 콘센트 조립 작업 순서표 (8종 품목)', cv.width / 2, 70);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(64, 96); ctx.lineTo(cv.width - 64, 96); ctx.stroke();

  const guideRows = [
    '1. 하단 케이스 올리기  →  2. 전원 단자 · 접지 레일 끼우기',
    '3. 스위치 · 코드 연결  →  4. 안전 셔터 · 방수 패킹 끼우기',
    '5. 상단 덮개 닫기      →  6. 조립 나사 넣고 드라이버로 조이기',
    '7. 통전 안전 검사하기  →  8. 라벨 · 포장 후 완성함 담기'
  ];
  ctx.font = 'bold 29px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'left';
  guideRows.forEach((txt, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#e0f2fe' : '#dcfce7';
    ctx.fillText(txt, 74, 165 + idx * 66);
  });
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 24px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('안전 수칙: 덮개를 닫기 전에 내부 단자와 접지가 빠지지 않았는지 꼭 확인해요!', cv.width / 2, 456);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.94, 0.045),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })
  );
  board.position.set(0, 2.04, -1.61);
  board.castShadow = true;
  scene.add(board);
}
createWorkshopBoard();

// 천장 작업실 펜던트 조명 3개
[-0.95, 0, 0.95].forEach((lx) => {
  const lamp = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  );
  cord.position.y = 0.38;
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.11, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide })
  );
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfefce8, emissive: 0xfde68a, emissiveIntensity: 1.35, roughness: 0.2 })
  );
  bulb.position.y = -0.04;
  lamp.add(cord, shade, bulb);
  lamp.position.set(lx, 2.15, 0.06);
  scene.add(lamp);
});

// ============================================================================
// 5. GLB 에셋 재사용 로더(카페 앱 공용 가구 에셋 활용) & 정규화 유틸리티
// ============================================================================
const loader = new GLTFLoader();
const interactables = [];
const targetAnchors = {};
const targetBounds = {};

function loadSharedGLB(filename) {
  return new Promise((resolve, reject) => {
    loader.load(
      `../cafe/assets/models/${filename}`,
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

function placeModelFitted(model, limits, x, y, z, rotY = 0) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const sx = (limits.maxW || 99) / Math.max(size.x, 0.001);
  const sy = (limits.maxH || 99) / Math.max(size.y, 0.001);
  const sz = (limits.maxD || 99) / Math.max(size.z, 0.001);
  const scale = Math.min(sx, sy, sz);
  model.scale.setScalar(scale);
  model.rotation.y = rotY;
  model.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  model.position.set(
    model.position.x + (x - center.x),
    model.position.y + (y - scaledBox.min.y),
    model.position.z + (z - scaledBox.min.z)
  );
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
  object3D.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object3D);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(size.x * 1.18, 0.22), Math.max(size.y * 1.24, 0.22), Math.max(size.z * 1.18, 0.22)),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.copy(center);
  hitbox.userData.targetId = targetId;
  hitbox.userData.label = label;
  scene.add(hitbox);
  interactables.push(hitbox);

  targetAnchors[targetId] = ringPos || new THREE.Vector3(center.x, COUNTER_Y + 0.012, center.z);
  targetBounds[targetId] = {
    center: center.clone(),
    size: size.clone(),
    min: box.min.clone(),
    max: box.max.clone()
  };
}

// ============================================================================
// 6. 동적 3D 조립품 & 작업대 소품
// ============================================================================
const COUNTER_Y = 0.92;
const PREP_POS = new THREE.Vector3(0, COUNTER_Y, 0.12);

// 강조 링 + 상단 부유 포인터 비콘
const highlightRing = new THREE.Mesh(
  new THREE.RingGeometry(0.13, 0.19, 36),
  new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
);
highlightRing.rotation.x = -Math.PI / 2;
highlightRing.visible = false;
scene.add(highlightRing);

const highlightBeacon = new THREE.Mesh(
  new THREE.ConeGeometry(0.042, 0.088, 16),
  new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.65, roughness: 0.25 })
);
highlightBeacon.rotation.x = Math.PI;
highlightBeacon.visible = false;
scene.add(highlightBeacon);

// 중앙 조립 지그 (정전기 방지 그린 실리콘 조립 매트 + 가이드 블록)
const jigGroup = new THREE.Group();
const esdMat = new THREE.Mesh(
  new THREE.BoxGeometry(0.56, 0.014, 0.34),
  new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.65 })
);
esdMat.position.y = 0.007;
esdMat.receiveShadow = true;
const esdBorder = new THREE.Mesh(
  new THREE.BoxGeometry(0.58, 0.01, 0.36),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
);
esdBorder.position.y = 0.004;
const jigPad = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, 0.008, 0.18),
  new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.55 })
);
jigPad.position.y = 0.016;
jigGroup.add(esdBorder, esdMat, jigPad);
jigGroup.position.set(PREP_POS.x, COUNTER_Y, PREP_POS.z);
scene.add(jigGroup);

// 실습모드 작업대 흩어짐 3D 시각화
const spillPartsGroup = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const sp = new THREE.Mesh(
    i % 2 === 0 ? new THREE.BoxGeometry(0.032, 0.012, 0.018) : new THREE.CylinderGeometry(0.009, 0.009, 0.024, 10),
    new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xf59e0b : 0x94a3b8, metalness: 0.7, roughness: 0.3 })
  );
  sp.position.set((i - 1.5) * 0.08, 0.024, (i % 2 === 0 ? 0.08 : -0.08));
  sp.rotation.set(0.3 * i, 0.6 * i, 0.2);
  spillPartsGroup.add(sp);
}
spillPartsGroup.visible = false;
jigGroup.add(spillPartsGroup);

// 조립 중인 동적 콘센트/멀티탭 그룹
const assemblyGroup = new THREE.Group();
assemblyGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
assemblyGroup.visible = false;
scene.add(assemblyGroup);

const partGroups = {
  base: new THREE.Group(),
  packing: new THREE.Group(),
  terminal: new THREE.Group(),
  ground: new THREE.Group(),
  switches: new THREE.Group(),
  cord: new THREE.Group(),
  shutter: new THREE.Group(),
  cover: new THREE.Group(),
  screw: new THREE.Group(),
  label: new THREE.Group()
};
Object.values(partGroups).forEach((g) => {
  g.visible = false;
  assemblyGroup.add(g);
});

// 공중 조립 낙하 연출용 그룹
const fallingGroup = new THREE.Group();
fallingGroup.visible = false;
scene.add(fallingGroup);

// 전동 드라이버 3D 도구 참조 & 애니메이션용 클론
let driverStandTool = null;
let testerLedMat = null;
let testerScreenMat = null;
let testerProbeGroup = null;
let finishTrayPos = new THREE.Vector3(0.76, COUNTER_Y + 0.04, 0.26);
let finishDisplayGroup = new THREE.Group();
finishDisplayGroup.position.copy(finishTrayPos);
scene.add(finishDisplayGroup);

// 3D 반짝이 파티클 버스트
const sparkles3D = [];
function spawn3DSparkles(worldPos, count = 14, colorHex = 0xfbbf24) {
  const palette = [colorHex, 0xffffff, 0x34d399, 0xfde047, 0x38bdf8];
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.014, 0),
      new THREE.MeshBasicMaterial({ color: palette[i % palette.length], transparent: true, opacity: 1 })
    );
    mesh.position.copy(worldPos);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 0.45 + Math.random() * 0.55;
    scene.add(mesh);
    sparkles3D.push({
      mesh,
      vx: Math.cos(angle) * speed,
      vy: 0.5 + Math.random() * 0.65,
      vz: Math.sin(angle) * speed,
      life: 1.0
    });
  }
}

function clearGroup(g) {
  while (g.children.length > 0) g.remove(g.children[0]);
}

function getCaseSpecs(caseType) {
  const specs = {
    wall1: { holes: 1, w: 0.16, h: 0.042, d: 0.16, hasSwitch: false, hasCord: false, isPlug: false, isSplash: false },
    wall2: { holes: 2, w: 0.24, h: 0.042, d: 0.16, hasSwitch: false, hasCord: false, isPlug: false, isSplash: false },
    wall_splash: { holes: 1, w: 0.18, h: 0.046, d: 0.18, hasSwitch: false, hasCord: false, isPlug: false, isSplash: true },
    tap2: { holes: 2, w: 0.26, h: 0.04, d: 0.11, hasSwitch: false, hasCord: true, isPlug: false, isSplash: false },
    tap3: { holes: 3, w: 0.34, h: 0.042, d: 0.115, hasSwitch: 'master', hasCord: true, isPlug: false, isSplash: false },
    tap4: { holes: 4, w: 0.42, h: 0.042, d: 0.125, hasSwitch: 'individual', hasCord: true, isPlug: false, isSplash: false },
    plug: { holes: 1, w: 0.11, h: 0.036, d: 0.08, hasSwitch: false, hasCord: true, isPlug: true, isSplash: false },
    pack: { holes: 3, w: 0.34, h: 0.044, d: 0.115, hasSwitch: 'master', hasCord: true, isPlug: false, isSplash: false }
  };
  return specs[caseType] || specs.wall1;
}

function getHoleXs(spec) {
  if (spec.holes === 1) return [0];
  const step = spec.hasSwitch ? 0.078 : 0.082;
  const start = -((spec.holes - 1) * step) / 2 + (spec.hasSwitch === 'master' ? -0.025 : 0);
  return Array.from({ length: spec.holes }, (_, i) => start + i * step);
}

// 선택된 제품/케이스 형태에 맞춰 3D 조립 파츠 빌드
function buildAssemblyGeometry(caseType) {
  Object.values(partGroups).forEach((g) => {
    clearGroup(g);
    g.visible = false;
  });

  const spec = getCaseSpecs(caseType);
  const holeXs = getHoleXs(spec);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32 });
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.78, roughness: 0.25 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.75, roughness: 0.28 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38 });
  const screwMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 });

  // 1) 하단 케이스
  if (spec.isPlug) {
    const plugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.022, 24), bodyMat);
    plugBody.position.set(0.02, 0.011, 0);
    const plugNeck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.046), bodyMat);
    plugNeck.position.set(-0.025, 0.01, 0);
    partGroups.base.add(plugBody, plugNeck);
  } else {
    const trayFloor = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.012, spec.d), bodyMat);
    trayFloor.position.y = 0.006;
    trayFloor.castShadow = true;
    const wallF = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.022, 0.01), innerMat);
    wallF.position.set(0, 0.017, spec.d / 2 - 0.005);
    const wallB = wallF.clone();
    wallB.position.z = -spec.d / 2 + 0.005;
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.022, spec.d), innerMat);
    wallL.position.set(-spec.w / 2 + 0.005, 0.017, 0);
    const wallR = wallL.clone();
    wallR.position.x = spec.w / 2 - 0.005;
    partGroups.base.add(trayFloor, wallF, wallB, wallL, wallR);

    // 내부 둥근 콘센트 가이드 링
    holeXs.forEach((hx) => {
      const wellRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.004, 8, 20),
        innerMat
      );
      wellRing.rotation.x = Math.PI / 2;
      wellRing.position.set(hx, 0.013, 0);
      partGroups.base.add(wellRing);
    });
  }

  // 2) 방수 패킹 (방우형 콘센트용)
  const packRing = new THREE.Mesh(
    new THREE.TorusGeometry(Math.max(spec.w, spec.d) * 0.44, 0.006, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  packRing.rotation.x = Math.PI / 2;
  packRing.position.y = 0.026;
  partGroups.packing.add(packRing);

  // 3) 전원 단자 / 통전 버스바
  if (spec.isPlug) {
    [-0.014, 0.014].forEach((pz) => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.042, 12), brassMat);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0.048, 0.022, pz);
      partGroups.terminal.add(pin);
    });
  } else {
    const railLen = spec.holes > 1 ? (spec.w - 0.045) : 0.09;
    const offX = spec.hasSwitch === 'master' ? -0.02 : 0;
    [-0.018, 0.018].forEach((rz) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.006, 0.008), brassMat);
      bar.position.set(offX, 0.018, rz);
      partGroups.terminal.add(bar);
      holeXs.forEach((hx) => {
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.012, 0.012), brassMat);
        clip.position.set(hx, 0.022, rz);
        partGroups.terminal.add(clip);
      });
    });
  }

  // 4) 접지 단자 / 접지 레일
  if (spec.isPlug) {
    const gPlate = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.006, 0.014), copperMat);
    gPlate.position.set(0.024, 0.028, 0);
    partGroups.ground.add(gPlate);
  } else {
    const gLen = spec.holes > 1 ? (spec.w - 0.05) : 0.08;
    const offX = spec.hasSwitch === 'master' ? -0.02 : 0;
    const gBar = new THREE.Mesh(new THREE.BoxGeometry(gLen, 0.005, 0.007), copperMat);
    gBar.position.set(offX, 0.019, 0);
    partGroups.ground.add(gBar);
    holeXs.forEach((hx) => {
      [-0.024, 0.024].forEach((gz) => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.016, 0.005), copperMat);
        ear.position.set(hx, 0.028, gz);
        partGroups.ground.add(ear);
      });
    });
  }

  // 5) 스위치 모듈
  const swMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.25, roughness: 0.3 });
  if (spec.hasSwitch === 'master') {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.018, 0.028), swMat);
    sw.position.set(spec.w / 2 - 0.042, 0.028, 0);
    partGroups.switches.add(sw);
  } else if (spec.hasSwitch === 'individual') {
    holeXs.forEach((hx) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.016, 0.018), swMat);
      sw.position.set(hx, 0.028, -spec.d / 2 + 0.022);
      partGroups.switches.add(sw);
    });
  } else {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.014, 0.022), swMat);
    sw.position.set(spec.w / 2 - 0.035, 0.025, 0);
    partGroups.switches.add(sw);
  }

  // 6) 전원 코드선
  const cordMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.042, 14), cordMat);
  boot.rotation.z = Math.PI / 2;
  boot.position.set(-spec.w / 2 - 0.016, 0.02, 0);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-spec.w / 2 - 0.035, 0.02, 0),
    new THREE.Vector3(-spec.w / 2 - 0.09, 0.016, 0.05),
    new THREE.Vector3(-spec.w / 2 - 0.06, 0.012, 0.13)
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.0085, 10, false), cordMat);
  const endPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.022, 16), cordMat);
  endPlug.position.set(-spec.w / 2 - 0.06, 0.012, 0.13);
  partGroups.cord.add(boot, cable, endPlug);

  // 7) 안전 셔터
  holeXs.forEach((hx) => {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 18), shutterMat);
    sh.position.set(hx, 0.028, 0);
    partGroups.shutter.add(sh);
  });

  // 8) 상단 덮개
  if (spec.isPlug) {
    const topPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.04, 0.016, 24), bodyMat);
    topPlug.position.set(0.02, 0.03, 0);
    const topNeck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.016, 0.046), bodyMat);
    topNeck.position.set(-0.025, 0.028, 0);
    partGroups.cover.add(topPlug, topNeck);
  } else {
    const topShell = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.016, spec.d), bodyMat);
    topShell.position.y = 0.034;
    topShell.castShadow = true;
    partGroups.cover.add(topShell);

    const wellMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.42 });
    const pinHoleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    holeXs.forEach((hx) => {
      const socketRim = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 22), wellMat);
      socketRim.position.set(hx, 0.041, 0);
      const pinL = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.008, 12), pinHoleMat);
      pinL.position.set(hx - 0.012, 0.043, 0);
      const pinR = pinL.clone();
      pinR.position.x = hx + 0.012;
      partGroups.cover.add(socketRim, pinL, pinR);
    });

    if (spec.isSplash) {
      const splashLid = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w * 0.9, 0.012, spec.d * 0.9),
        new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.52, roughness: 0.1 })
      );
      splashLid.position.y = 0.052;
      partGroups.cover.add(splashLid);
    }
  }

  // 9) 조립 나사
  const screwXs = spec.isPlug ? [0] : [-spec.w / 2 + 0.022, spec.w / 2 - 0.022];
  screwXs.forEach((sx) => {
    const sc = new THREE.Group();
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 14), screwMat);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.018, 10), screwMat);
    shaft.position.y = -0.01;
    sc.add(head, shaft);
    sc.position.set(sx, 0.056, 0);
    sc.userData.baseY = 0.056;
    sc.userData.drivenY = 0.043;
    partGroups.screw.add(sc);
  });

  // 10) KC 라벨 스티커 + 선 정리 벨크로
  const kcTag = new THREE.Mesh(
    new THREE.BoxGeometry(0.042, 0.003, 0.028),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
  );
  kcTag.position.set(spec.w / 2 - 0.036, 0.044, spec.d / 2 - 0.024);
  const kcMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.004, 0.014),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  kcMark.position.set(spec.w / 2 - 0.036, 0.0445, spec.d / 2 - 0.024);
  const tie = new THREE.Mesh(
    new THREE.TorusGeometry(0.024, 0.005, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 })
  );
  tie.position.set(-spec.w / 2 - 0.07, 0.02, 0.07);
  partGroups.label.add(kcTag, kcMark, tie);

  // 검수 포장 품목(pack)은 처음부터 완제품 형태로 시작할 수 있도록 준비
  if (caseType === 'pack') {
    partGroups.terminal.visible = true;
    partGroups.ground.visible = true;
    partGroups.switches.visible = true;
    partGroups.cord.visible = true;
    partGroups.shutter.visible = true;
    partGroups.cover.visible = true;
    partGroups.screw.visible = true;
    partGroups.screw.children.forEach((sc) => { sc.position.y = sc.userData.drivenY; });
  }
}

// ============================================================================
// 7. 3D 작업대, 부품 트레이 & 공구 배치
// ============================================================================
function createPartsTray(colorHex, w = 0.22, d = 0.16) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.014, d),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.48 })
  );
  base.position.y = 0.007;
  base.castShadow = true;
  base.receiveShadow = true;
  const rimF = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.026, 0.01),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.42 })
  );
  rimF.position.set(0, 0.016, d / 2 - 0.005);
  const rimB = rimF.clone();
  rimB.position.z = -d / 2 + 0.005;
  const rimL = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.026, d),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.42 })
  );
  rimL.position.set(-w / 2 + 0.005, 0.016, 0);
  const rimR = rimL.clone();
  rimR.position.x = w / 2 - 0.005;
  g.add(base, rimF, rimB, rimL, rimR);
  return g;
}

async function initWorkshopScene() {
  // 넓은 작업대 상판 (틈 없이 깔끔한 라이트 우드 & 스틸 프레임)
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.64, 0.04, 0.92),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.42, metalness: 0.06 })
  );
  counterTop.position.set(0, COUNTER_Y - 0.02, 0.04);
  counterTop.receiveShadow = true;
  counterTop.castShadow = true;
  scene.add(counterTop);

  const deskApron = new THREE.Mesh(
    new THREE.BoxGeometry(3.56, 0.88, 0.84),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 })
  );
  deskApron.position.set(0, 0.44, 0.04);
  deskApron.receiveShadow = true;
  scene.add(deskApron);

  const counterTrim = new THREE.Mesh(
    new THREE.BoxGeometry(3.66, 0.024, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45 })
  );
  counterTrim.position.set(0, COUNTER_Y - 0.026, 0.5);
  scene.add(counterTrim);

  // 카페 앱의 배경 가구 GLB 에셋 재사용 (실패해도 작업대 진행에는 영향 없음)
  try {
    const [cabL, cabR, plant, table, chair1, chair2, carton] = await Promise.all([
      loadSharedGLB('kitchenCabinet.glb'),
      loadSharedGLB('kitchenCabinetDrawer.glb'),
      loadSharedGLB('pottedPlant.glb'),
      loadSharedGLB('tableRound.glb'),
      loadSharedGLB('chairRounded.glb'),
      loadSharedGLB('chairRounded.glb'),
      loadSharedGLB('carton.glb')
    ]);
    placeModel(cabL, COUNTER_Y, -0.98, 0, -1.16);
    placeModel(cabR, COUNTER_Y, 0.98, 0, -1.16);
    placeModel(plant, 1.05, 2.18, 0, -0.82);
    placeModel(table, 0.72, 2.38, 0, 0.98);
    placeModel(chair1, 0.75, 1.85, 0, 0.98, Math.PI / 2);
    placeModel(chair2, 0.75, 2.91, 0, 0.98, -Math.PI / 2);
    placeModelFitted(carton, { maxW: 0.24, maxH: 0.2, maxD: 0.2 }, 1.24, COUNTER_Y, 0.22, -0.25);
  } catch (err) {
    console.warn('배경 가구 GLB 일부 생략(기본 작업실 환경 사용):', err);
  }

  // 1) 하단 케이스 트레이 (좌측 앞)
  const caseTray = createPartsTray(0x3b82f6, 0.26, 0.19);
  for (let i = 0; i < 2; i++) {
    const c = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.034, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
    );
    c.position.set(i === 0 ? -0.055 : 0.055, 0.031, 0);
    caseTray.add(c);
  }
  caseTray.position.set(-1.38, COUNTER_Y, 0.24);
  scene.add(caseTray);
  registerInteractive(caseTray, 'base_case', '하단 케이스 보관함', new THREE.Vector3(-1.38, COUNTER_Y + 0.012, 0.24));

  // 2) 전원 단자 · 버스바 트레이 (좌측 뒤)
  const termTray = createPartsTray(0xf59e0b, 0.22, 0.16);
  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.012, 0.016),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.78, roughness: 0.24 })
    );
    bar.position.set(0, 0.022, (i - 1) * 0.036);
    termTray.add(bar);
  }
  termTray.position.set(-1.36, COUNTER_Y, -0.16);
  scene.add(termTray);
  registerInteractive(termTray, 'terminal', '전원 단자 · 버스바함', new THREE.Vector3(-1.36, COUNTER_Y + 0.012, -0.16));

  // 3) 접지 단자 · 레일 트레이 (좌측-중앙 뒤)
  const groundTray = createPartsTray(0xd97706, 0.22, 0.16);
  for (let i = 0; i < 3; i++) {
    const gbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.012, 0.014),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.75, roughness: 0.28 })
    );
    gbar.position.set(0, 0.022, (i - 1) * 0.034);
    groundTray.add(gbar);
  }
  groundTray.position.set(-1.02, COUNTER_Y, -0.16);
  scene.add(groundTray);
  registerInteractive(groundTray, 'ground_part', '접지 단자 · 레일함', new THREE.Vector3(-1.02, COUNTER_Y + 0.012, -0.16));

  // 4) 방수 패킹 트레이 (좌측 앞 2번)
  const packTray = createPartsTray(0x0ea5e9, 0.18, 0.15);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.007, 10, 22),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set((i - 0.5) * 0.03, 0.024 + i * 0.012, 0);
    packTray.add(ring);
  }
  packTray.position.set(-1.02, COUNTER_Y, 0.24);
  scene.add(packTray);
  registerInteractive(packTray, 'packing', '방수 패킹함', new THREE.Vector3(-1.02, COUNTER_Y + 0.012, 0.24));

  // 5) 스위치 모듈 트레이 (중앙 좌측 뒤)
  const switchTray = createPartsTray(0xef4444, 0.2, 0.16);
  for (let i = 0; i < 4; i++) {
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.024, 0.024),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32 })
    );
    sw.position.set((i % 2 - 0.5) * 0.06, 0.026, (i < 2 ? -0.03 : 0.03));
    switchTray.add(sw);
  }
  switchTray.position.set(-0.68, COUNTER_Y, -0.16);
  scene.add(switchTray);
  registerInteractive(switchTray, 'switch_part', '전원 스위치 모듈함', new THREE.Vector3(-0.68, COUNTER_Y + 0.012, -0.16));

  // 6) 전원 코드선 트레이 (중앙 앞 좌측)
  const cordTray = createPartsTray(0x475569, 0.24, 0.16);
  for (let i = 0; i < 2; i++) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.044, 0.009, 10, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    coil.rotation.x = Math.PI / 2;
    coil.position.set((i - 0.5) * 0.075, 0.024, 0);
    cordTray.add(coil);
  }
  cordTray.position.set(-0.66, COUNTER_Y, 0.24);
  scene.add(cordTray);
  registerInteractive(cordTray, 'cord', '전원 코드선 보관함', new THREE.Vector3(-0.66, COUNTER_Y + 0.012, 0.24));

  // 7) 안전 셔터 트레이 (중앙 뒤)
  const shutterTray = createPartsTray(0x14b8a6, 0.2, 0.16);
  for (let i = 0; i < 3; i++) {
    const sh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.009, 18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 })
    );
    sh.position.set((i - 1) * 0.042, 0.022 + i * 0.006, 0);
    shutterTray.add(sh);
  }
  shutterTray.position.set(-0.34, COUNTER_Y, -0.18);
  scene.add(shutterTray);
  registerInteractive(shutterTray, 'shutter', '안전 셔터 보관함', new THREE.Vector3(-0.34, COUNTER_Y + 0.012, -0.18));

  // 8) 상단 덮개 트레이 (중앙 우측 뒤)
  const coverTray = createPartsTray(0x64748b, 0.24, 0.16);
  for (let i = 0; i < 2; i++) {
    const cov = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.014, 0.09),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    cov.position.set(0, 0.022 + i * 0.015, 0);
    coverTray.add(cov);
  }
  coverTray.position.set(0.02, COUNTER_Y, -0.18);
  scene.add(coverTray);
  registerInteractive(coverTray, 'top_cover', '상단 덮개 보관함', new THREE.Vector3(0.02, COUNTER_Y + 0.012, -0.18));

  // 9) 조립 나사함 (우측 뒤 1)
  const screwTray = createPartsTray(0x94a3b8, 0.18, 0.15);
  for (let i = 0; i < 6; i++) {
    const sc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.005, 0.022, 10),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    sc.rotation.z = Math.PI / 2;
    sc.position.set((i % 3 - 1) * 0.038, 0.022, (i < 3 ? -0.026 : 0.026));
    screwTray.add(sc);
  }
  screwTray.position.set(0.34, COUNTER_Y, -0.18);
  scene.add(screwTray);
  registerInteractive(screwTray, 'screw', '조립 나사함', new THREE.Vector3(0.34, COUNTER_Y + 0.012, -0.18));

  // 10) 전동 드라이버 거치대 (우측 중앙 뒤)
  driverStandTool = new THREE.Group();
  const drStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.02, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  drStand.position.y = 0.01;
  const drHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.025, 0.13, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 })
  );
  drHandle.position.set(0, 0.085, 0);
  const drMotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.11, 18),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35 })
  );
  drMotor.rotation.x = Math.PI / 2;
  drMotor.position.set(0, 0.155, 0.02);
  const drBit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.003, 0.075, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.18 })
  );
  drBit.rotation.x = Math.PI / 2;
  drBit.position.set(0, 0.155, 0.11);
  driverStandTool.add(drStand, drHandle, drMotor, drBit);
  driverStandTool.position.set(0.68, COUNTER_Y, -0.16);
  scene.add(driverStandTool);
  registerInteractive(driverStandTool, 'driver', '전동 드라이버 (나사 조이기)', new THREE.Vector3(0.68, COUNTER_Y + 0.012, -0.16));

  // 11) 통전 · 안전 검사기 (우측 뒤 끝)
  const testerGroup = new THREE.Group();
  const testerBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.18, 0.11),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42 })
  );
  testerBody.position.y = 0.09;
  testerBody.castShadow = true;
  testerScreenMat = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x0f172a, emissiveIntensity: 0.3 });
  const testerScreen = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.055, 0.008), testerScreenMat);
  testerScreen.position.set(0, 0.13, 0.056);
  testerLedMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, emissive: 0x475569, emissiveIntensity: 0.3 });
  const testerLed = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 14), testerLedMat);
  testerLed.position.set(0, 0.072, 0.056);
  testerProbeGroup = new THREE.Group();
  const probeL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.002, 0.075, 10),
    new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.3 })
  );
  probeL.position.set(-0.014, 0, 0);
  const probeR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.002, 0.075, 10),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.3 })
  );
  probeR.position.set(0.014, 0, 0);
  testerProbeGroup.add(probeL, probeR);
  testerProbeGroup.position.set(0, 0.18, 0.03);
  testerGroup.add(testerBody, testerScreen, testerLed, testerProbeGroup);
  testerGroup.position.set(1.06, COUNTER_Y, -0.14);
  scene.add(testerGroup);
  registerInteractive(testerGroup, 'tester', '통전 · 안전 검사기', new THREE.Vector3(1.06, COUNTER_Y + 0.012, -0.14));

  // 12) KC 안전 라벨 & 케이블 타이 트레이 (우측 끝 뒤)
  const labelTray = createPartsTray(0xeab308, 0.2, 0.15);
  const labelSheet = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.006, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 })
  );
  labelSheet.position.set(-0.02, 0.018, 0);
  const tieLoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.026, 0.006, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 })
  );
  tieLoop.rotation.x = Math.PI / 2;
  tieLoop.position.set(0.05, 0.02, 0);
  labelTray.add(labelSheet, tieLoop);
  labelTray.position.set(1.42, COUNTER_Y, -0.14);
  scene.add(labelTray);
  registerInteractive(labelTray, 'label', 'KC 안전 라벨 · 케이블 타이', new THREE.Vector3(1.42, COUNTER_Y + 0.012, -0.14));

  // 13) 완성함 트레이 (우측 앞)
  const finishBoxGroup = new THREE.Group();
  const finishTray = createPartsTray(0x16a34a, 0.34, 0.24);
  finishBoxGroup.add(finishTray);
  finishBoxGroup.position.set(0.76, COUNTER_Y, 0.26);
  scene.add(finishBoxGroup);
  registerInteractive(finishBoxGroup, 'finish_box', '완성함 (검수 완료)', new THREE.Vector3(0.76, COUNTER_Y + 0.012, 0.26));

  buildAssemblyGeometry(getCurrentRecipe().caseType);
  renderUI();
}

// ============================================================================
// 8. 상호작용 및 단계 실행 (무오류 학습 / 수동연습 / 실습모드)
// ============================================================================
function getCurrentRecipe() {
  return RECIPES[state.recipeKey];
}

function getCurrentStep() {
  const recipe = getCurrentRecipe();
  return recipe.steps[state.stepIndex] || null;
}

function handleAction(actionId, sourceOpts = {}) {
  if (state.busy || state.paused) return;

  if (state.practiceMode === 'practicum') {
    handlePracticumAction(actionId, { from3D: Boolean(sourceOpts.from3D) });
    return;
  }

  const currentStep = getCurrentStep();
  if (!currentStep) return;

  if (state.practiceMode === 'manual' && state.awaitingNextChoice) {
    if (actionId === currentStep.target) {
      state.awaitingNextChoice = false;
      state.manualChoices = [];
      playSoftTone(784, 0.12, 'sine', 0.05);
      showGuidance(`좋아요! "${currentStep.label}"을(를) 직접 골랐어요!`, currentStep.emoji, false);
      executeStep(actionId, { step: currentStep });
    } else {
      playGentleHintSound();
      const reason = getManualMismatchReason(actionId, currentStep);
      showGuidance(reason, '🧭', true);
      speakKorean(reason);
    }
    return;
  }

  if (actionId !== currentStep.target) {
    playGentleHintSound();
    const curDisp = getStepDisplay(currentStep);
    showGuidance(`괜찮아요! 지금은 "${curDisp.label}" 차례예요. ${curDisp.prompt}`, '💡', true);
    speakKorean(`지금은 ${curDisp.label} 차례예요.`);
    return;
  }

  executeStep(actionId, { step: currentStep });
}

function getManualMismatchReason(pickedId, expectedStep) {
  const pickedBtn = TOOL_BUTTONS.find((b) => b.id === pickedId);
  const pickedLabel = pickedBtn ? pickedBtn.label : pickedId;
  if (expectedStep.target === 'base_case') {
    return `아직 작업대에 하단 케이스가 없어요! 먼저 케이스를 올려놓고 "${pickedLabel}"을(를) 해야 해요.`;
  }
  if (pickedId === 'top_cover' && ['terminal', 'ground_part', 'switch_part', 'cord', 'shutter', 'packing'].includes(expectedStep.target)) {
    return `아직 내부 부품을 다 끼우지 않았어요! 덮개를 먼저 닫으면 안쪽 조립을 할 수 없어요.`;
  }
  if (pickedId === 'driver' && expectedStep.target === 'screw') {
    return `나사를 먼저 끼운 다음에 전동 드라이버로 조여야 해요!`;
  }
  if (pickedId === 'screw' && expectedStep.target !== 'screw') {
    return `상단 덮개를 닫기 전에는 나사를 끼워도 고정되지 않아요!`;
  }
  if (pickedId === 'finish_box') {
    return `아직 조립과 통전 검사가 끝나지 않아서 완성함에 담을 수 없어요!`;
  }
  return `"${pickedLabel}"은(는) 지금 순서가 아니에요. 방금 전 단계 다음에 무엇이 필요할지 다시 골라봐요!`;
}

function buildManualChoices(recipe, nextIdx) {
  const nextStep = recipe.steps[nextIdx];
  if (!nextStep) return [];
  const nextTool = TOOL_BUTTONS.find((b) => b.id === nextStep.target) || { id: nextStep.target, label: nextStep.label, emoji: nextStep.emoji };
  const distractorIds = [...new Set(recipe.steps.map((s) => s.target))].filter((id) => id !== nextStep.target);
  const extraPool = TOOL_BUTTONS.map((b) => b.id).filter((id) => id !== nextStep.target && !distractorIds.includes(id));
  const pool = [...distractorIds, ...extraPool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picks = [nextStep.target, ...pool.slice(0, 3)];
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }
  return picks.map((id) => {
    const tb = TOOL_BUTTONS.find((b) => b.id === id) || nextTool;
    const dispLabel = (state.easyMode && EASY_STEP_MAP[id]) ? EASY_STEP_MAP[id].label : tb.label;
    return { id, label: dispLabel, emoji: tb.emoji };
  });
}

function recordMistake(code, msg, emoji = '⚠️') {
  state.craft.mistakes.push({ code, msg });
  playGentleHintSound();
  showGuidance(`${emoji} ${msg}`, emoji, true, true);
  speakKorean(msg);
  renderPracticumStatus();
}

function triggerBenchSpill(msg) {
  state.craft.spilled = true;
  spillPartsGroup.visible = true;
  playGentleHintSound();
  recordMistake('no_case_spill', msg, '🧩');
}

function clearWorkbench() {
  if (state.busy) return;
  resetAssembly();
  showGuidance('🧹 작업대를 깨끗이 정리하고 새로 준비했어요! 처음부터 다시 조립해 보세요.', '✨', false);
}

function handlePracticumAction(actionId, extra = {}) {
  const recipe = getCurrentRecipe();
  const craft = state.craft;

  if (actionId === 'base_case') {
    if (craft.casePlaced) {
      showGuidance('이미 작업대 지그에 케이스가 올라가 있어요! 바꾸려면 🧹 작업대 정리를 눌러요.', '📦', true);
      return;
    }
    const chosenCase = extra.caseType || (recipe.caseType === 'pack' ? 'pack' : null);
    if (!chosenCase) {
      state.awaitingCasePick = true;
      renderUI();
      showGuidance(`작업 지시에 맞는 케이스를 골라보세요! (지시: ${recipe.name})`, '📦', false);
      return;
    }
    state.awaitingCasePick = false;
    craft.casePlaced = chosenCase;
    craft.log.push(`case:${chosenCase}`);
    if (chosenCase !== recipe.caseType) {
      recordMistake(
        'wrong_case',
        `앗! 작업 지시는 "${CASE_LABELS[recipe.caseType]}"인데 "${CASE_LABELS[chosenCase]}"를 올렸어요!`
      );
    }
    buildAssemblyGeometry(chosenCase);
    executeStep('base_case', { skipAdvance: true, caseType: chosenCase });
    return;
  }

  state.awaitingCasePick = false;

  if (!craft.casePlaced) {
    triggerBenchSpill('하단 케이스가 없어서 부품이 작업대 위로 흩어졌어요! 먼저 케이스를 올려놓으세요.');
    return;
  }

  if (actionId === 'packing') {
    if (craft.coverAdded) {
      recordMistake('packing_after_cover', '상단 덮개를 이미 닫아서 방수 패킹을 안쪽에 끼울 수 없어요!');
      return;
    }
    craft.packingAdded = true;
    craft.log.push('packing');
    if (!recipe.needsPacking) {
      recordMistake('unnecessary_packing', `${recipe.name}에는 고무 방수 패킹이 들어가지 않아요.`);
    }
    executeStep('packing', { skipAdvance: true });
    return;
  }

  if (actionId === 'terminal') {
    if (craft.coverAdded) {
      recordMistake('terminal_after_cover', '상단 덮개가 닫혀 있어 전원 단자를 끼울 수 없어요! 덮개를 닫기 전에 끼워야 해요.');
      return;
    }
    if (craft.terminalAdded) {
      recordMistake('dup_terminal', '전원 단자가 이미 끼워져 있어요.');
    }
    craft.terminalAdded = true;
    craft.log.push('terminal');
    executeStep('terminal', { skipAdvance: true });
    return;
  }

  if (actionId === 'ground_part') {
    if (craft.coverAdded) {
      recordMistake('ground_after_cover', '상단 덮개가 닫혀 있어 접지 단자를 끼울 수 없어요!');
      return;
    }
    if (craft.groundAdded) {
      recordMistake('dup_ground', '접지 단자가 이미 끼워져 있어요.');
    }
    craft.groundAdded = true;
    craft.log.push('ground_part');
    executeStep('ground_part', { skipAdvance: true });
    return;
  }

  if (actionId === 'switch_part') {
    if (craft.coverAdded) {
      recordMistake('switch_after_cover', '상단 덮개를 이미 닫아서 스위치를 끼울 수 없어요!');
      return;
    }
    craft.switchAdded = true;
    craft.log.push('switch_part');
    if (!recipe.needsSwitch) {
      recordMistake('unnecessary_switch', `${recipe.name}에는 전원 스위치가 들어가지 않아요!`);
    }
    executeStep('switch_part', { skipAdvance: true });
    return;
  }

  if (actionId === 'cord') {
    if (craft.coverAdded) {
      recordMistake('cord_after_cover', '상단 덮개가 닫혀 있어 전원 코드선을 연결할 수 없어요!');
      return;
    }
    craft.cordAdded = true;
    craft.log.push('cord');
    if (!recipe.needsCord) {
      recordMistake('unnecessary_cord', `${recipe.name}은(는) 벽부형/완제품이라 전원 코드선을 끼우지 않아요!`);
    }
    executeStep('cord', { skipAdvance: true });
    return;
  }

  if (actionId === 'shutter') {
    if (craft.coverAdded) {
      recordMistake('shutter_after_cover', '상단 덮개를 이미 닫아서 안전 셔터를 안에 넣을 수 없어요!');
      return;
    }
    craft.shutterAdded = true;
    craft.log.push('shutter');
    if (!recipe.needsShutter) {
      recordMistake('unnecessary_shutter', `${recipe.name}에는 안전 셔터가 필요하지 않아요.`);
    }
    executeStep('shutter', { skipAdvance: true });
    return;
  }

  if (actionId === 'top_cover') {
    if (craft.coverAdded) {
      showGuidance('이미 상단 덮개가 닫혀 있어요!', '⬜', true);
      return;
    }
    const missing = [];
    if (recipe.caseType !== 'pack') {
      if (!craft.terminalAdded) missing.push('전원 단자');
      if (!craft.groundAdded) missing.push('접지 단자');
      if (recipe.needsSwitch && !craft.switchAdded) missing.push('스위치');
      if (recipe.needsCord && !craft.cordAdded) missing.push('전원 코드선');
      if (recipe.needsShutter && !craft.shutterAdded) missing.push('안전 셔터');
      if (recipe.needsPacking && !craft.packingAdded) missing.push('방수 패킹');
    }
    if (missing.length > 0) {
      recordMistake('cover_too_early', `아직 [${missing.join(', ')}]이(가) 빠진 채로 상단 덮개를 닫았어요!`);
    }
    craft.coverAdded = true;
    craft.log.push('top_cover');
    executeStep('top_cover', { skipAdvance: true });
    return;
  }

  if (actionId === 'screw') {
    if (!craft.coverAdded && recipe.caseType !== 'pack') {
      recordMistake('screw_no_cover', '상단 덮개를 덮지 않고 나사를 끼워서 고정되지 않았어요!');
    }
    craft.screwAdded = true;
    craft.log.push('screw');
    executeStep('screw', { skipAdvance: true });
    return;
  }

  if (actionId === 'driver') {
    if (!craft.screwAdded && recipe.caseType !== 'pack') {
      recordMistake('driver_no_screw', '나사를 끼우지 않고 드라이버만 돌려서 조립이 고정되지 않았어요!');
      return;
    }
    craft.screwDriven = true;
    craft.log.push('driver');
    executeStep('driver', { skipAdvance: true });
    return;
  }

  if (actionId === 'tester') {
    craft.tested = true;
    craft.log.push('tester');
    const isPack = recipe.caseType === 'pack';
    const hasCore = isPack || (
      craft.terminalAdded &&
      craft.groundAdded &&
      (!recipe.needsSwitch || craft.switchAdded) &&
      (!recipe.needsCord || craft.cordAdded) &&
      craft.coverAdded &&
      craft.screwDriven
    );
    craft.testPassed = hasCore;
    if (!hasCore) {
      recordMistake('test_fail', '통전 검사 불합격! 단자·접지·코드·덮개·나사 조립이 빠진 부분이 있어요.', '🔴');
    }
    executeStep('tester', { skipAdvance: true, testPass: hasCore });
    return;
  }

  if (actionId === 'label') {
    if (!craft.tested && recipe.caseType === 'pack') {
      recordMistake('label_before_test', '통전 안전 검사를 통과한 뒤에 KC 라벨을 붙여야 해요!');
    }
    craft.labelAdded = true;
    craft.log.push('label');
    executeStep('label', { skipAdvance: true });
    return;
  }

  if (actionId === 'finish_box') {
    executeStep('finish_box', { skipAdvance: true, isPracticumFinish: true });
  }
}

function evaluatePracticumAssembly(recipe) {
  const c = state.craft;
  const checks = [];
  let issues = c.mistakes.length;

  // 1. 케이스 선택
  if (c.casePlaced === recipe.caseType) {
    checks.push({ ok: true, text: `작업 지시에 맞는 ${CASE_LABELS[recipe.caseType]}를 사용했어요.` });
  } else {
    checks.push({ ok: false, text: `${CASE_LABELS[recipe.caseType]} 대신 다른 케이스를 사용했어요.` });
    issues++;
  }

  if (recipe.caseType !== 'pack') {
    if (c.terminalAdded) checks.push({ ok: true, text: '전원 단자(버스바)를 정확히 끼웠어요.' });
    else { checks.push({ ok: false, text: '전원 단자가 빠졌어요!' }); issues++; }

    if (c.groundAdded) checks.push({ ok: true, text: '접지 단자(레일)를 안전하게 끼웠어요.' });
    else { checks.push({ ok: false, text: '접지 단자가 빠졌어요!' }); issues++; }

    if (recipe.needsPacking) {
      if (c.packingAdded) checks.push({ ok: true, text: '고무 방수 패킹을 꼼꼼히 끼웠어요.' });
      else { checks.push({ ok: false, text: '고무 방수 패킹이 빠졌어요!' }); issues++; }
    }
    if (recipe.needsSwitch) {
      if (c.switchAdded) checks.push({ ok: true, text: '전원 스위치 모듈을 바르게 끼웠어요.' });
      else { checks.push({ ok: false, text: '전원 스위치가 빠졌어요!' }); issues++; }
    }
    if (recipe.needsCord) {
      if (c.cordAdded) checks.push({ ok: true, text: '전원 코드선을 단단히 연결했어요.' });
      else { checks.push({ ok: false, text: '전원 코드선이 빠졌어요!' }); issues++; }
    }
    if (recipe.needsShutter) {
      if (c.shutterAdded) checks.push({ ok: true, text: '안전 셔터를 구멍에 맞게 올렸어요.' });
      else { checks.push({ ok: false, text: '안전 셔터가 빠졌어요!' }); issues++; }
    }

    if (c.coverAdded) checks.push({ ok: true, text: '상단 덮개를 빈틈없이 닫았어요.' });
    else { checks.push({ ok: false, text: '상단 덮개를 닫지 않았어요!' }); issues++; }

    if (c.screwAdded && c.screwDriven) checks.push({ ok: true, text: '조립 나사를 드라이버로 튼튼하게 조였어요.' });
    else { checks.push({ ok: false, text: '조립 나사 끼우기 및 드라이버 조이기가 빠졌어요!' }); issues++; }
  }

  if (recipe.needsLabel) {
    if (c.labelAdded) checks.push({ ok: true, text: 'KC 안전 라벨과 전선 정리를 마쳤어요.' });
    else { checks.push({ ok: false, text: 'KC 안전 라벨과 선 정리가 빠졌어요!' }); issues++; }
  }

  if (c.tested && c.testPassed) {
    checks.push({ ok: true, text: '통전 안전 검사를 통과(초록불)했어요.' });
  } else {
    checks.push({ ok: false, text: '통전 안전 검사 통과가 완료되지 않았어요!' });
    issues++;
  }

  const seenMsg = new Set();
  c.mistakes.forEach((m) => {
    if (!seenMsg.has(m.msg)) {
      seenMsg.add(m.msg);
      checks.push({ ok: false, text: m.msg });
    }
  });

  const stars = issues === 0 ? 3 : (issues <= 2 ? 2 : 1);
  return { stars, issues, checks };
}

function animatePartDrop(targetPartGroup, colorHex, soundFn, onDone) {
  focusJigCamera();
  if (soundFn) soundFn();
  targetPartGroup.visible = true;
  const origY = targetPartGroup.position.y;
  targetPartGroup.position.y = origY + 0.22;
  const start = performance.now();
  const dur = 420;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    targetPartGroup.position.y = origY + (1 - ease) * 0.22;
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      targetPartGroup.position.y = origY;
      spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), 10, colorHex);
      onDone();
    }
  }
  requestAnimationFrame(tick);
}

function executeStep(actionId, opts = {}) {
  state.busy = true;
  const recipe = getCurrentRecipe();
  const craft = state.craft;
  const isGuided = state.practiceMode !== 'practicum';

  if (isGuided) {
    if (actionId === 'base_case') craft.casePlaced = opts.caseType || recipe.caseType;
    else if (actionId === 'packing') craft.packingAdded = true;
    else if (actionId === 'terminal') craft.terminalAdded = true;
    else if (actionId === 'ground_part') craft.groundAdded = true;
    else if (actionId === 'switch_part') craft.switchAdded = true;
    else if (actionId === 'cord') craft.cordAdded = true;
    else if (actionId === 'shutter') craft.shutterAdded = true;
    else if (actionId === 'top_cover') craft.coverAdded = true;
    else if (actionId === 'screw') craft.screwAdded = true;
    else if (actionId === 'driver') craft.screwDriven = true;
    else if (actionId === 'tester') { craft.tested = true; craft.testPassed = true; }
    else if (actionId === 'label') craft.labelAdded = true;
  }

  const finishStep = () => {
    state.busy = false;
    if (opts.skipAdvance) {
      if (opts.isPracticumFinish) {
        const evalRes = evaluatePracticumAssembly(recipe);
        state.completedCount++;
        saveOutletCount(state.completedCount);
        if (window.D1Bridge) {
          window.D1Bridge.saveRecord({
            game: 'outlet',
            stage: `${recipe.name} (실습 ${evalRes.stars}성)`,
            score: evalRes.stars,
            summary: `${recipe.name} 실습 완료 · 별 ${evalRes.stars}개 (실수 ${evalRes.issues}건)`,
            payload: {
              mode: 'practicum',
              recipeKey: state.recipeKey,
              recipeName: recipe.name,
              stars: evalRes.stars,
              issues: evalRes.issues,
              mistakes: state.craft.mistakes
            }
          });
          window.D1Bridge.setKV(OUTLET_COUNT_KEY, state.completedCount);
        }
        spawn3DSparkles(new THREE.Vector3(finishTrayPos.x, COUNTER_Y + 0.14, finishTrayPos.z), evalRes.stars === 3 ? 24 : 12, 0x10b981);
        playSuccessChime();
        speakKorean(evalRes.stars === 3 ? `${recipe.name} 완벽하게 조립했어요!` : `${recipe.name} 조립을 마쳤어요. 결과를 살펴봐요.`);
        showCompletionModal(recipe, evalRes);
      } else {
        playSoftTone(659.25, 0.11, 'sine', 0.04);
      }
      renderUI();
      return;
    }

    state.stepIndex++;
    if (state.stepIndex >= recipe.steps.length) {
      state.awaitingNextChoice = false;
      state.manualChoices = [];
      state.completedCount++;
      saveOutletCount(state.completedCount);
      if (window.D1Bridge) {
        window.D1Bridge.saveRecord({
          game: 'outlet',
          stage: recipe.name,
          score: state.completedCount,
          summary: `${recipe.name} 완성 (${state.practiceMode} · 누적 ${state.completedCount}개)`,
          payload: {
            mode: state.practiceMode,
            recipeKey: state.recipeKey,
            recipeName: recipe.name,
            steps: recipe.steps.length,
            completedCount: state.completedCount
          }
        });
        window.D1Bridge.setKV(OUTLET_COUNT_KEY, state.completedCount);
      }
      spawn3DSparkles(new THREE.Vector3(finishTrayPos.x, COUNTER_Y + 0.14, finishTrayPos.z), 24, 0x10b981);
      playSuccessChime();
      speakKorean(`${recipe.name} 조립이 완성되었어요! 정말 잘했어요.`);
      showCompletionModal(recipe);
    } else {
      playSoftTone(659.25, 0.11, 'sine', 0.04);
      if (state.practiceMode === 'manual') {
        state.awaitingNextChoice = true;
        state.manualChoices = buildManualChoices(recipe, state.stepIndex);
      }
    }
    renderUI();
  };

  if (actionId === 'base_case') {
    focusJigCamera();
    playSnapSound();
    assemblyGroup.visible = true;
    assemblyGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
    partGroups.base.visible = true;
    const start = performance.now();
    const animBase = (now) => {
      const t = Math.min((now - start) / 420, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      assemblyGroup.position.y = COUNTER_Y + 0.02 + (1 - ease) * 0.16;
      const s = 0.72 + 0.28 * ease;
      assemblyGroup.scale.set(s, s, s);
      if (t < 1) requestAnimationFrame(animBase);
      else {
        assemblyGroup.position.y = COUNTER_Y + 0.02;
        assemblyGroup.scale.set(1, 1, 1);
        spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), 10, 0x3b82f6);
        finishStep();
      }
    };
    requestAnimationFrame(animBase);
  } else if (actionId === 'packing') {
    animatePartDrop(partGroups.packing, 0x0ea5e9, playSnapSound, finishStep);
  } else if (actionId === 'terminal') {
    animatePartDrop(partGroups.terminal, 0xeab308, playMetalClickSound, finishStep);
  } else if (actionId === 'ground_part') {
    animatePartDrop(partGroups.ground, 0xd97706, playMetalClickSound, finishStep);
  } else if (actionId === 'switch_part') {
    animatePartDrop(partGroups.switches, 0xef4444, playSnapSound, finishStep);
  } else if (actionId === 'cord') {
    animatePartDrop(partGroups.cord, 0x475569, playSnapSound, finishStep);
  } else if (actionId === 'shutter') {
    animatePartDrop(partGroups.shutter, 0x14b8a6, playSnapSound, finishStep);
  } else if (actionId === 'top_cover') {
    animatePartDrop(partGroups.cover, 0x38bdf8, playSnapSound, finishStep);
  } else if (actionId === 'screw') {
    partGroups.screw.children.forEach((sc) => {
      sc.position.y = sc.userData.baseY;
    });
    animatePartDrop(partGroups.screw, 0x94a3b8, playMetalClickSound, finishStep);
  } else if (actionId === 'driver') {
    focusJigCamera();
    playDriverSound();
    const startPos = new THREE.Vector3(0.68, COUNTER_Y, -0.16);
    const overPos = new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.16, PREP_POS.z);
    const start = performance.now();
    const animDriver = (now) => {
      const t = Math.min((now - start) / 720, 1);
      if (t < 0.25) {
        const k = t / 0.25;
        driverStandTool.position.lerpVectors(startPos, overPos, k);
        driverStandTool.rotation.x = k * 0.7;
      } else if (t < 0.75) {
        const k = (t - 0.25) / 0.5;
        driverStandTool.position.set(PREP_POS.x, COUNTER_Y + 0.14 - Math.sin(k * Math.PI) * 0.04, PREP_POS.z);
        driverStandTool.rotation.y = k * Math.PI * 6;
        partGroups.screw.children.forEach((sc) => {
          sc.position.y = sc.userData.baseY + (sc.userData.drivenY - sc.userData.baseY) * k;
        });
      } else {
        const k = (t - 0.75) / 0.25;
        driverStandTool.position.lerpVectors(overPos, startPos, k);
        driverStandTool.rotation.set((1 - k) * 0.7, 0, 0);
      }
      if (t < 1) {
        requestAnimationFrame(animDriver);
      } else {
        driverStandTool.position.copy(startPos);
        driverStandTool.rotation.set(0, 0, 0);
        partGroups.screw.children.forEach((sc) => { sc.position.y = sc.userData.drivenY; });
        spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.1, PREP_POS.z), 12, 0xf59e0b);
        finishStep();
      }
    };
    requestAnimationFrame(animDriver);
  } else if (actionId === 'tester') {
    focusJigCamera();
    const pass = opts.testPass !== undefined ? opts.testPass : true;
    playTesterSound(pass);
    const start = performance.now();
    const animTest = (now) => {
      const t = Math.min((now - start) / 620, 1);
      if (testerProbeGroup) {
        testerProbeGroup.position.y = 0.18 + Math.sin(t * Math.PI) * 0.05;
      }
      if (t > 0.35 && testerLedMat && testerScreenMat) {
        if (pass) {
          testerLedMat.color.setHex(0x22c55e);
          testerLedMat.emissive.setHex(0x16a34a);
          testerLedMat.emissiveIntensity = 1.6;
          testerScreenMat.color.setHex(0x14532d);
          testerScreenMat.emissive.setHex(0x22c55e);
          testerScreenMat.emissiveIntensity = 0.55;
        } else {
          testerLedMat.color.setHex(0xef4444);
          testerLedMat.emissive.setHex(0xdc2626);
          testerLedMat.emissiveIntensity = 1.6;
          testerScreenMat.color.setHex(0x7f1d1d);
          testerScreenMat.emissive.setHex(0xef4444);
          testerScreenMat.emissiveIntensity = 0.55;
        }
      }
      if (t < 1) requestAnimationFrame(animTest);
      else {
        if (testerProbeGroup) testerProbeGroup.position.y = 0.18;
        spawn3DSparkles(new THREE.Vector3(1.06, COUNTER_Y + 0.18, -0.14), 12, pass ? 0x22c55e : 0xef4444);
        finishStep();
      }
    };
    requestAnimationFrame(animTest);
  } else if (actionId === 'label') {
    animatePartDrop(partGroups.label, 0xfacc15, playSnapSound, finishStep);
  } else if (actionId === 'finish_box') {
    playBoxCompleteSound();
    const startPos = assemblyGroup.position.clone();
    const endPos = new THREE.Vector3(finishTrayPos.x, COUNTER_Y + 0.036, finishTrayPos.z);
    const start = performance.now();
    const animFinish = (now) => {
      const t = Math.min((now - start) / 560, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      assemblyGroup.position.lerpVectors(startPos, endPos, ease);
      assemblyGroup.position.y += Math.sin(t * Math.PI) * 0.12;
      if (t < 1) requestAnimationFrame(animFinish);
      else {
        assemblyGroup.position.copy(endPos);
        spawn3DSparkles(new THREE.Vector3(endPos.x, COUNTER_Y + 0.14, endPos.z), 16, 0x10b981);
        finishStep();
      }
    };
    requestAnimationFrame(animFinish);
  }
}

// ============================================================================
// 9. UI 렌더링 & 레이캐스팅
// ============================================================================
function getStepDisplay(step) {
  if (state.easyMode && step && EASY_STEP_MAP[step.target]) {
    return EASY_STEP_MAP[step.target];
  }
  return step ? { label: step.label, prompt: step.prompt } : { label: '', prompt: '' };
}

function renderPracticumStatus() {
  const bar = document.getElementById('practicumStatusBar');
  if (!bar) return;
  if (state.practiceMode !== 'practicum') {
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  const c = state.craft;
  const caseTxt = c.casePlaced ? CASE_LABELS[c.casePlaced] : '없음';
  const wireTxt = (c.terminalAdded && c.groundAdded) ? '단자·접지✓' : (c.terminalAdded ? '전원단자만' : '미장착');
  const coverTxt = c.coverAdded ? (c.screwDriven ? '닫고 조임✓' : '덮개 닫힘') : '열림';
  const testTxt = c.tested ? (c.testPassed ? '합격✓' : '불량⚠️') : '미검사';

  bar.innerHTML =
    `<span class="prac-pill">📦 케이스: ${caseTxt}</span>` +
    `<span class="prac-pill">🟨 내부: ${wireTxt}</span>` +
    `<span class="prac-pill">⬜ 덮개: ${coverTxt}</span>` +
    `<span class="prac-pill">⚡ 검사: ${testTxt}</span>` +
    (c.spilled ? `<span class="prac-pill warn">🧩 부품 흩어짐!</span>` : '') +
    (c.mistakes.length ? `<span class="prac-pill warn">⚠️ 실수 ${c.mistakes.length}건</span>` : '') +
    `<button type="button" class="prac-reset-btn" id="pracClearBenchBtn">🧹 작업대 정리하고 다시 조립</button>`;

  const clr = document.getElementById('pracClearBenchBtn');
  if (clr) clr.addEventListener('click', clearWorkbench);
}

function renderManualChoiceBar() {
  const bar = document.getElementById('manualChoiceBar');
  if (!bar) return;

  // 실습모드 케이스 선택 팝업
  if (state.practiceMode === 'practicum' && state.awaitingCasePick) {
    const recipe = getCurrentRecipe();
    const casePool = ['wall1', 'wall2', 'wall_splash', 'tap2', 'tap3', 'tap4', 'plug'].filter((k) => k !== recipe.caseType);
    for (let i = casePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [casePool[i], casePool[j]] = [casePool[j], casePool[i]];
    }
    const opts = [recipe.caseType, ...casePool.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    bar.classList.remove('hidden');
    bar.innerHTML =
      `<div class="manual-choice-title">📦 작업 지시(${recipe.name})에 알맞은 하단 케이스를 골라보세요!</div>` +
      `<div class="manual-choice-grid">` +
        opts.map((ct) => `<button type="button" class="manual-choice-btn" data-case="${ct}">📦 ${CASE_LABELS[ct]}</button>`).join('') +
      `</div>`;
    bar.querySelectorAll('[data-case]').forEach((b) => {
      b.addEventListener('click', () => handlePracticumAction('base_case', { caseType: b.dataset.case }));
    });
    return;
  }

  // 수동연습모드 다음 단계 선택
  if (state.practiceMode === 'manual' && state.awaitingNextChoice && state.manualChoices.length) {
    const prevStep = getCurrentRecipe().steps[state.stepIndex - 1];
    bar.classList.remove('hidden');
    bar.innerHTML =
      `<div class="manual-choice-title">🧭 ${prevStep ? `"${prevStep.label}" 완료! ` : ''}다음엔 어떤 부품을 조립할까요?</div>` +
      `<div class="manual-choice-grid">` +
        state.manualChoices.map((ch) =>
          `<button type="button" class="manual-choice-btn" data-choice="${ch.id}"><span>${ch.emoji}</span><span>${ch.label}</span></button>`
        ).join('') +
      `</div>`;
    bar.querySelectorAll('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expected = getCurrentStep();
        if (expected && btn.dataset.choice !== expected.target) {
          btn.classList.remove('wrong-shake');
          void btn.offsetWidth;
          btn.classList.add('wrong-shake');
        }
        handleAction(btn.dataset.choice);
      });
    });
    return;
  }

  bar.classList.add('hidden');
}

function renderRecipeDrawer() {
  const drawer = document.getElementById('recipeDrawer');
  if (!drawer) return;
  drawer.innerHTML = PRODUCT_CATEGORIES.map((cat) => {
    const entries = Object.entries(RECIPES).filter(([, r]) => r.category === cat.id);
    if (!entries.length) return '';
    return (
      `<div class="recipe-cat-group">` +
        `<div class="recipe-cat-title">${cat.title}</div>` +
        `<div class="recipe-cat-grid">` +
          entries.map(([key, r]) =>
            `<button type="button" class="recipe-btn ${key === state.recipeKey ? 'active' : ''}" data-recipe="${key}">${r.emoji} ${r.name}</button>`
          ).join('') +
        `</div>` +
      `</div>`
    );
  }).join('');

  drawer.querySelectorAll('.recipe-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.recipeKey = btn.dataset.recipe;
      drawer.classList.add('hidden');
      recipePickerBtn.setAttribute('aria-expanded', 'false');
      renderRecipeDrawer();
      resetAssembly();
    });
  });
}

function renderUI() {
  const recipe = getCurrentRecipe();
  const currentStep = getCurrentStep();
  const nextStep = recipe.steps[state.stepIndex + 1] || null;
  const isAuto = state.practiceMode === 'auto';
  const isManual = state.practiceMode === 'manual';
  const isPracticum = state.practiceMode === 'practicum';
  const showStepGuide = isAuto || (isManual && !state.awaitingNextChoice);

  document.getElementById('scoreBadge').textContent = `★ ${state.completedCount}`;
  const recipeLabelEl = document.getElementById('currentRecipeLabel');
  if (recipeLabelEl) recipeLabelEl.textContent = `${recipe.emoji} ${recipe.name}`;

  document.querySelectorAll('.pmode-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.pmode === state.practiceMode);
  });

  // 시각적 과제 분석표
  const strip = document.getElementById('scheduleStrip');
  strip.innerHTML = '';
  if (isPracticum) {
    const reqs = [];
    if (recipe.needsPacking) reqs.push('방수패킹');
    if (recipe.needsSwitch) reqs.push('스위치');
    if (recipe.needsCord) reqs.push('전원코드');
    if (recipe.needsShutter) reqs.push('안전셔터');
    if (recipe.needsLabel) reqs.push('KC라벨');
    const reqTxt = reqs.length ? ` (${reqs.join('·')} 포함)` : '';
    strip.innerHTML =
      `<div class="step-card current"><span class="step-num">🧪</span><span>실전 작업 지시: ${recipe.emoji} ${recipe.name}${reqTxt} · 올바른 순서로 조립하고 통전 검사까지 마쳐 보세요!</span></div>`;
  } else {
    let currentCardEl = null;
    recipe.steps.forEach((step, idx) => {
      const disp = getStepDisplay(step);
      const card = document.createElement('div');
      card.className = 'step-card';
      if (idx < state.stepIndex) card.classList.add('done');
      else if (idx === state.stepIndex && !state.awaitingNextChoice) {
        card.classList.add('current');
        currentCardEl = card;
      }
      const label = (isManual && idx > state.stepIndex) ? '❓ 다음 단계' : `${step.emoji} ${disp.label}`;
      card.innerHTML = `<span class="step-num">${idx < state.stepIndex ? '✓' : idx + 1}</span><span>${label}</span>`;
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
  }

  // 지금 -> 다음 바
  const ftBar = document.getElementById('firstThenBar');
  if (ftBar) {
    if (isPracticum) {
      ftBar.innerHTML =
        `<span class="ft-pill now">🧪 자유 조립 중: ${recipe.emoji} ${recipe.name}</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">통전 검사 후 ✅ 완성함 담기</span>`;
    } else if (isManual && state.awaitingNextChoice) {
      ftBar.innerHTML =
        `<span class="ft-pill now">🧭 방금 단계 완료!</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">아래에서 다음 부품을 직접 골라요!</span>`;
    } else if (currentStep) {
      const curDisp = getStepDisplay(currentStep);
      const nextDisp = nextStep ? getStepDisplay(nextStep) : null;
      ftBar.innerHTML =
        `<span class="ft-pill now">지금: ${currentStep.emoji} ${curDisp.label}</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">${isManual ? '다음: 직접 선택하기 🧭' : `다음: ${nextStep ? `${nextStep.emoji} ${nextDisp.label}` : '🎉 조립 완성!'}`}</span>`;
    } else {
      ftBar.innerHTML = '<span class="ft-pill next">🎉 조립이 완성되었어요!</span>';
    }
  }

  // 안내 배너
  if (isPracticum) {
    if (state.craft.log.length === 0 && !state.craft.spilled && !state.awaitingCasePick) {
      showGuidance(`실습모드! "${recipe.name}" 작업 지시를 받았어요. 아래 부품함과 3D 작업대를 눌러 순서대로 조립해 보세요!`, '🧪', false);
    }
  } else if (isManual && state.awaitingNextChoice) {
    showGuidance('방금 단계를 완료했어요! 아래 선택지나 3D 작업대에서 다음에 할 일을 골라보세요.', '🧭', false);
  } else if (currentStep) {
    const curDisp = getStepDisplay(currentStep);
    showGuidance(curDisp.prompt, currentStep.emoji, false);
    if (state.guidedMode) speakKorean(curDisp.prompt);
  }

  // 하단 부품/공구 버튼 도크
  const neededIds = isPracticum
    ? TOOL_BUTTONS.map((b) => b.id)
    : [...new Set(recipe.steps.map((s) => s.target))];
  const actionBar = document.getElementById('actionBar');
  actionBar.innerHTML = '';
  let highlightedBtnEl = null;
  TOOL_BUTTONS.filter((b) => neededIds.includes(b.id)).forEach((btnInfo) => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    if (showStepGuide && state.guidedMode && currentStep && currentStep.target === btnInfo.id) {
      btn.classList.add('highlighted');
      highlightedBtnEl = btn;
    }
    const labelText = (state.easyMode && EASY_STEP_MAP[btnInfo.id]) ? EASY_STEP_MAP[btnInfo.id].label : btnInfo.label;
    btn.innerHTML = `<span>${btnInfo.emoji}</span><span>${labelText}</span>`;
    btn.addEventListener('click', () => handleAction(btnInfo.id));
    actionBar.appendChild(btn);
  });
  if (highlightedBtnEl) {
    highlightedBtnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  renderManualChoiceBar();
  renderPracticumStatus();

  // 3D 강조 링 & 부유 비콘 위치 업데이트
  if (showStepGuide && state.guidedMode && currentStep && targetAnchors[currentStep.target]) {
    const anchor = targetAnchors[currentStep.target];
    highlightRing.position.copy(anchor);
    highlightRing.visible = true;
    const bound = targetBounds[currentStep.target];
    const beaconBaseY = bound ? Math.min(bound.max.y + 0.13, COUNTER_Y + 0.56) : anchor.y + 0.34;
    highlightBeacon.userData.baseY = beaconBaseY;
    highlightBeacon.position.set(anchor.x, beaconBaseY, anchor.z);
    highlightBeacon.visible = true;
  } else {
    highlightRing.visible = false;
    highlightBeacon.visible = false;
  }

  // 단계별 자동 카메라 워킹
  if (state.autoCamera && !state.awaitingCasePick) {
    if (isPracticum || (isManual && state.awaitingNextChoice)) {
      if (state.cameraViewMode !== 'overview' || (isPracticum && state.craft.log.length === 0)) {
        focusOverviewCamera(520);
      }
    } else if (currentStep) {
      focusStepCamera(currentStep.target, 540);
    }
  }
}

function showGuidance(text, emoji, isGentleHint, isMistake = false) {
  const banner = document.getElementById('guidanceBanner');
  document.getElementById('guidanceEmoji').textContent = emoji;
  document.getElementById('guidanceText').textContent = text;
  banner.classList.toggle('gentle-hint', Boolean(isGentleHint));
  banner.classList.toggle('mistake-hint', Boolean(isMistake));
}

function showCompletionModal(recipe, evalRes = null) {
  document.getElementById('completeEmoji').textContent = recipe.emoji;
  const reportEl = document.getElementById('practicumReport');
  if (evalRes) {
    const starStr = '⭐'.repeat(evalRes.stars) + '☆'.repeat(3 - evalRes.stars);
    document.getElementById('completeTitle').textContent =
      evalRes.stars === 3 ? `${recipe.name} 완벽 조립!` : `${recipe.name} 실습 결과`;
    document.getElementById('completeDesc').textContent =
      evalRes.stars === 3
        ? '실수 없이 안전 기준에 맞춰 정확하게 조립했어요!'
        : '조립 과정에서 확인이 필요한 부분을 살펴보고 다시 도전해 봐요.';
    if (reportEl) {
      reportEl.classList.remove('hidden');
      reportEl.innerHTML =
        `<div class="prac-stars">${starStr}</div>` +
        evalRes.checks.map((c) =>
          `<div class="prac-item ${c.ok ? 'ok' : 'warn'}">${c.ok ? '✅' : '⚠️'} ${c.text}</div>`
        ).join('');
    }
  } else {
    document.getElementById('completeTitle').textContent = `${recipe.name} 완성!`;
    document.getElementById('completeDesc').textContent = '차분하게 순서대로 정말 잘 조립했어요.';
    if (reportEl) reportEl.classList.add('hidden');
  }
  document.getElementById('completeModal').classList.remove('hidden');
}

function resetAssembly() {
  const recipe = getCurrentRecipe();
  state.stepIndex = 0;
  state.busy = false;
  state.awaitingNextChoice = false;
  state.manualChoices = [];
  state.awaitingCasePick = false;
  state.craft = createInitialCraft();
  assemblyGroup.visible = false;
  assemblyGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
  assemblyGroup.scale.set(1, 1, 1);
  spillPartsGroup.visible = false;
  if (testerLedMat) {
    testerLedMat.color.setHex(0x94a3b8);
    testerLedMat.emissive.setHex(0x475569);
    testerLedMat.emissiveIntensity = 0.3;
  }
  if (testerScreenMat) {
    testerScreenMat.color.setHex(0x334155);
    testerScreenMat.emissive.setHex(0x0f172a);
    testerScreenMat.emissiveIntensity = 0.3;
  }
  buildAssemblyGeometry(recipe.caseType);
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
  if (dist > 8) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  if (hits.length > 0) {
    handleAction(hits[0].object.userData.targetId, { from3D: true });
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

// 상단 품목 선택 드로어 & 버튼 이벤트 연결
const recipePickerBtn = document.getElementById('recipePickerBtn');
const recipeDrawer = document.getElementById('recipeDrawer');
renderRecipeDrawer();
recipePickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = recipeDrawer.classList.toggle('hidden');
  recipePickerBtn.setAttribute('aria-expanded', String(!isHidden));
  if (!isHidden) {
    settingsPopover.classList.add('hidden');
    settingsToggleBtn.setAttribute('aria-expanded', 'false');
  }
});

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

document.querySelectorAll('.pmode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const nextMode = btn.dataset.pmode;
    if (!nextMode || state.practiceMode === nextMode) return;
    state.practiceMode = nextMode;
    playSoftTone(680, 0.12, 'sine', 0.045);
    resetAssembly();
    const modeNames = {
      auto: '자동연습모드로 시작해요. 순서대로 안내해 드릴게요.',
      manual: '수동연습모드예요. 단계가 끝나면 다음 부품을 직접 골라보세요.',
      practicum: '실습모드예요. 실제 작업대처럼 자유롭게 콘센트를 조립해 보세요.'
    };
    speakKorean(modeNames[nextMode] || '');
  });
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

document.getElementById('voiceBtn').addEventListener('click', () => {
  state.voiceEnabled = !state.voiceEnabled;
  if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
    window.D1Bridge.setSpedPrefs({ ttsAuto: state.voiceEnabled });
  }
  syncSettingButtons();
  if (state.voiceEnabled) {
    const step = getCurrentStep();
    if (step) speakKorean(getStepDisplay(step).prompt, true);
  }
});

document.getElementById('soundBtn').addEventListener('click', (e) => {
  state.soundEnabled = !state.soundEnabled;
  e.target.textContent = `🔔 효과음: ${state.soundEnabled ? '켜짐' : '꺼짐'}`;
  e.target.classList.toggle('active', state.soundEnabled);
});

const easyOutletBtn = document.getElementById('easyOutletBtn');
if (easyOutletBtn) {
  easyOutletBtn.addEventListener('click', () => {
    state.easyMode = !state.easyMode;
    if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
      window.D1Bridge.setSpedPrefs({ easyMode: state.easyMode });
    }
    syncSettingButtons();
    renderUI();
  });
}

function setGuidanceVisible(visible) {
  state.guidanceHidden = !visible;
  const banner = document.getElementById('guidanceBanner');
  const reopenBtn = document.getElementById('reopenGuidanceBtn');
  if (banner) banner.classList.toggle('hidden', !visible);
  if (reopenBtn) reopenBtn.classList.toggle('hidden', visible);
}

const speakStepBtn = document.getElementById('speakStepBtn');
if (speakStepBtn) {
  speakStepBtn.addEventListener('click', () => {
    const shownText = document.getElementById('guidanceText')?.textContent?.trim();
    const step = getCurrentStep();
    const text = shownText || (step ? getStepDisplay(step).prompt : '조립이 완성되었어요!');
    speakKorean(text, true);
  });
}

const closeGuidanceBtn = document.getElementById('closeGuidanceBtn');
if (closeGuidanceBtn) {
  closeGuidanceBtn.addEventListener('click', () => {
    setGuidanceVisible(false);
    if (window.D1Bridge && typeof window.D1Bridge.stopSpeak === 'function') {
      window.D1Bridge.stopSpeak();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  });
}

const reopenGuidanceBtn = document.getElementById('reopenGuidanceBtn');
if (reopenGuidanceBtn) {
  reopenGuidanceBtn.addEventListener('click', () => {
    setGuidanceVisible(true);
  });
}

const quickBreakBtn = document.getElementById('quickBreakBtn');
const breakModal = document.getElementById('breakModal');
const resumeBreakBtn = document.getElementById('resumeBreakBtn');
if (quickBreakBtn && breakModal) {
  quickBreakBtn.addEventListener('click', () => {
    state.paused = true;
    breakModal.classList.remove('hidden');
  });
}
if (resumeBreakBtn && breakModal) {
  resumeBreakBtn.addEventListener('click', () => {
    state.paused = false;
    breakModal.classList.add('hidden');
  });
}

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn && window.D1Bridge && window.D1Bridge.bindFullscreenButton) {
  window.D1Bridge.bindFullscreenButton(fullscreenBtn, {
    enterText: '⛶ 전체화면',
    exitText: '⛶ 창모드'
  });
}

function syncSettingButtons() {
  const voiceEl = document.getElementById('voiceBtn');
  if (voiceEl) {
    voiceEl.textContent = `🔊 음성 안내: ${state.voiceEnabled ? '켜짐' : '꺼짐'}`;
    voiceEl.classList.toggle('active', state.voiceEnabled);
  }
  const easyEl = document.getElementById('easyOutletBtn');
  if (easyEl) {
    easyEl.textContent = `📖 쉬운 말: ${state.easyMode ? '켜짐' : '꺼짐'}`;
    easyEl.classList.toggle('active', state.easyMode);
  }
}

function applyPrefs(prefs) {
  if (!prefs) return;
  const needRender = state.easyMode !== !!prefs.easyMode;
  state.easyMode = !!prefs.easyMode;
  state.voiceEnabled = !!prefs.ttsAuto;
  state.slowPace = !!prefs.slowPace;
  syncSettingButtons();
  if (needRender) renderUI();
}

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

document.getElementById('nextProductBtn').addEventListener('click', resetAssembly);

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
let lastFrameTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  const t = clock.getElapsedTime();

  if (highlightRing.visible) {
    const pulse = 1 + Math.sin(t * 3.4) * 0.14;
    highlightRing.scale.set(pulse, pulse, 1);
  }

  if (highlightBeacon.visible && highlightRing.visible) {
    const baseY = highlightBeacon.userData.baseY || (highlightRing.position.y + 0.34);
    highlightBeacon.position.y = baseY + Math.sin(t * 3.8) * 0.04;
    highlightBeacon.rotation.y = t * 2.1;
  }

  for (let i = sparkles3D.length - 1; i >= 0; i--) {
    const sp = sparkles3D[i];
    sp.life -= dt * 1.45;
    if (sp.life <= 0) {
      scene.remove(sp.mesh);
      sparkles3D.splice(i, 1);
      continue;
    }
    sp.vy -= dt * 1.6;
    sp.mesh.position.x += sp.vx * dt;
    sp.mesh.position.y += sp.vy * dt;
    sp.mesh.position.z += sp.vz * dt;
    sp.mesh.rotation.x += dt * 5;
    sp.mesh.rotation.y += dt * 6;
    sp.mesh.material.opacity = sp.life;
    const s = Math.max(sp.life, 0.05);
    sp.mesh.scale.set(s, s, s);
  }

  controls.update();
  renderer.render(scene, camera);
}

initWorkshopScene();
if (window.D1Bridge && window.D1Bridge.getSpedPrefs) {
  applyPrefs(window.D1Bridge.getSpedPrefs());
}
if (window.D1Bridge && window.D1Bridge.onSpedPrefsChange) {
  window.D1Bridge.onSpedPrefsChange(applyPrefs);
}
animate();
