import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// 1. 레시피 및 특수교육(무오류 학습/과제분석) 데이터 정의 (한국 카페 인기 메뉴 18종)
// ============================================================================
const RECIPE_CATEGORIES = [
  { id: 'coffee', title: '☕ 에스프레소 커피' },
  { id: 'latte_tea', title: '🥛 라떼 · 전통차' },
  { id: 'ade_smoothie', title: '🫧 에이드 · 스무디 · 프라페' }
];

const RECIPES = {
  hot_americano: {
    name: '따뜻한 아메리카노',
    emoji: '☕',
    category: 'coffee',
    cupType: 'mug',
    isHot: true,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 평평하고 단단하게 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '머그컵 놓기', emoji: '☕', prompt: '머그컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'water', temp: 'hot', label: '뜨거운 물 붓기', emoji: '💧', prompt: '물병을 눌러 머그컵에 뜨거운 물을 먼저 부어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '추출한 에스프레소 샷을 물 위에 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '따뜻한 아메리카노 완성! 손님께 드려요.' }
    ]
  },
  iced_americano: {
    name: '아이스 아메리카노',
    emoji: '🧊',
    category: 'coffee',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 수평으로 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 시원한 얼음을 넣어요.' },
      { target: 'water', temp: 'cold', label: '차가운 물 붓기', emoji: '💧', prompt: '물병을 눌러 차가운 물을 채워요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 얼음물 위에 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '시원한 아이스 아메리카노 완성! 손님께 드려요.' }
    ]
  },
  hot_latte: {
    name: '따뜻한 카페라떼',
    emoji: '☕',
    category: 'coffee',
    cupType: 'mug',
    isHot: true,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 평평하게 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '머그컵 놓기', emoji: '☕', prompt: '따뜻한 머그컵을 쟁반 위에 올려놓아요.' },
      { target: 'milk', temp: 'hot', label: '따뜻한 우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 따뜻한 스팀 우유를 부어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '추출한 에스프레소 샷을 따뜻한 우유 위에 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '부드러운 따뜻한 카페라떼 완성! 손님께 드려요.' }
    ]
  },
  iced_latte: {
    name: '아이스 카페라떼',
    emoji: '🥛',
    category: 'coffee',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 포터필터에 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 수평으로 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 먼저 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 고소한 차가운 우유를 부어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 우유 위에 천천히 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '부드러운 아이스 카페라떼 완성! 손님께 드려요.' }
    ]
  },
  iced_vanilla_latte: {
    name: '아이스 바닐라라떼',
    emoji: '🌼',
    category: 'coffee',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 고르게 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신을 눌러 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 넣어요.' },
      { target: 'vanilla', label: '바닐라 시럽', emoji: '🌼', prompt: '바닐라 시럽 펌프를 눌러 달콤한 시럽을 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 차가운 우유를 채워요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 부어 향긋하게 완성해요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 아이스 바닐라라떼 완성! 손님께 드려요.' }
    ]
  },
  iced_caramel_macchiato: {
    name: '카라멜 마끼아또',
    emoji: '🍯',
    category: 'coffee',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두 가루를 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신으로 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '시원한 얼음을 컵에 넣어요.' },
      { target: 'vanilla', label: '바닐라 시럽', emoji: '🌼', prompt: '바닐라 시럽을 컵에 먼저 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '차가운 우유를 부어 층을 만들어요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '우유 위로 에스프레소 샷을 천천히 부어요.' },
      { target: 'caramel', label: '카라멜 드리즐', emoji: '🍯', prompt: '카라멜 소스를 맨 위에 달콤하게 뿌려요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 카라멜 마끼아또 완성! 손님께 드려요.' }
    ]
  },
  iced_cafe_mocha: {
    name: '아이스 카페모카',
    emoji: '🍫',
    category: 'coffee',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'grinder', label: '원두 갈기', emoji: '🫘', prompt: '그라인더를 눌러 원두를 갈아 담아요.' },
      { target: 'tamper', label: '탬핑하기', emoji: '🔨', prompt: '탬퍼를 눌러 원두를 다져요.' },
      { target: 'machine', label: '샷 추출', emoji: '⚙️', prompt: '커피 머신으로 에스프레소 샷을 추출해요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '시원한 얼음을 넣어요.' },
      { target: 'choco', label: '초코 넣기', emoji: '🍫', prompt: '달콤한 초콜릿을 컵에 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '차가운 우유를 채워요.' },
      { target: 'shot', label: '샷 붓기', emoji: '🥃', prompt: '에스프레소 샷을 부어 모카를 만들어요.' },
      { target: 'whip', label: '휘핑크림 올리기', emoji: '🍦', prompt: '휘핑크림을 풍성하게 올려 마무리해요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '진하고 달콤한 아이스 카페모카 완성! 손님께 드려요.' }
    ]
  },
  hot_choco: {
    name: '따뜻한 핫초코',
    emoji: '🍫',
    category: 'latte_tea',
    cupType: 'mug',
    isHot: true,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '머그컵 놓기', emoji: '☕', prompt: '머그컵을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'choco', label: '초코 넣기', emoji: '🍫', prompt: '초콜릿을 눌러 달콤한 초코를 넣어요.' },
      { target: 'milk', temp: 'hot', label: '따뜻한 우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 따뜻한 우유를 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 핫초코 완성! 손님께 드려요.' }
    ]
  },
  hot_tea: {
    name: '따뜻한 녹차',
    emoji: '🍵',
    category: 'latte_tea',
    cupType: 'tea',
    isHot: true,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '찻잔 놓기', emoji: '🍵', prompt: '찻잔을 클릭해서 쟁반 위에 올려놓아요.' },
      { target: 'tea', label: '녹차 티백 넣기', emoji: '🍃', prompt: '녹차 상자를 눌러 티백을 넣어요.' },
      { target: 'water', temp: 'hot', label: '뜨거운 물 붓기', emoji: '💧', prompt: '물병을 눌러 뜨거운 물을 부어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '향긋한 녹차 완성! 손님께 드려요.' }
    ]
  },
  hot_yuja_tea: {
    name: '따뜻한 유자차',
    emoji: '🍊',
    category: 'latte_tea',
    cupType: 'tea',
    isHot: true,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '찻잔 놓기', emoji: '🍵', prompt: '따뜻한 찻잔을 쟁반 위에 올려놓아요.' },
      { target: 'yuja', label: '유자청 넣기', emoji: '🍊', prompt: '달콤한 유자청 병을 눌러 찻잔에 넣어요.' },
      { target: 'water', temp: 'hot', label: '뜨거운 물 붓기', emoji: '💧', prompt: '물병을 눌러 뜨거운 물을 부어 우려내요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '향긋하고 달콤한 유자차 완성! 손님께 드려요.' }
    ]
  },
  iced_matcha_latte: {
    name: '아이스 말차라떼',
    emoji: '🌿',
    category: 'latte_tea',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '시원한 얼음을 컵에 넣어요.' },
      { target: 'matcha', label: '말차 파우더', emoji: '🌿', prompt: '진한 초록빛 말차 파우더를 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '차가운 우유를 부어 부드럽게 섞어요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '고소하고 진한 아이스 말차라떼 완성! 손님께 드려요.' }
    ]
  },
  strawberry_latte: {
    name: '딸기 라떼',
    emoji: '🍓',
    category: 'latte_tea',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 먼저 넣어요.' },
      { target: 'strawberry', label: '딸기 넣기', emoji: '🍓', prompt: '딸기를 눌러 달콤한 딸기청을 넣어요.' },
      { target: 'milk', temp: 'cold', label: '우유 붓기', emoji: '🥛', prompt: '우유팩을 눌러 고소한 우유를 채워요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤한 딸기 라떼 완성! 손님께 드려요.' }
    ]
  },
  iced_lemonade: {
    name: '아이스 레몬에이드',
    emoji: '🍋',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 클릭해서 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 시원한 얼음을 넣어요.' },
      { target: 'lemon', label: '레몬 넣기', emoji: '🍋', prompt: '상큼한 레몬을 눌러 컵에 넣어요.' },
      { target: 'sparkling', label: '탄산수 붓기', emoji: '🫧', prompt: '탄산수 병을 눌러 톡 쏘는 탄산수를 채워요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '상큼한 레몬에이드 완성! 손님께 드려요.' }
    ]
  },
  grapefruit_ade: {
    name: '아이스 자몽에이드',
    emoji: '🍊',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: false,
    steps: [
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'ice', label: '얼음 넣기', emoji: '🧊', prompt: '아이스박스를 눌러 얼음을 넣어요.' },
      { target: 'grapefruit', label: '자몽 넣기', emoji: '🍊', prompt: '상큼한 자몽 접시를 눌러 자몽청을 넣어요.' },
      { target: 'sparkling', label: '탄산수 붓기', emoji: '🫧', prompt: '탄산수 병을 눌러 톡 쏘는 탄산수를 채워요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '새콤달콤 자몽에이드 완성! 손님께 드려요.' }
    ]
  },
  strawberry_smoothie: {
    name: '딸기 스무디',
    emoji: '🍓',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: true,
    steps: [
      { target: 'milk', toBlender: true, temp: 'cold', label: '우유 넣기(믹서)', emoji: '🥛', prompt: '칼날이 잘 돌도록 우유팩을 눌러 믹서기에 우유를 먼저 넣어요.' },
      { target: 'strawberry', toBlender: true, label: '딸기 넣기(믹서)', emoji: '🍓', prompt: '신선한 딸기를 눌러 믹서기에 넣어요.' },
      { target: 'ice', toBlender: true, label: '얼음 넣기(믹서)', emoji: '🧊', prompt: '아이스박스를 눌러 믹서기에 얼음을 넣어요.' },
      { target: 'blender', label: '얼음·딸기 갈기', emoji: '🌀', prompt: '믹서기(얼음 분쇄 블렌더)를 눌러 얼음과 딸기를 곱게 갈아요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'pour_blender', label: '컵에 따르기', emoji: '🥤', prompt: '믹서기를 다시 눌러 갈린 스무디를 컵에 따라요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '시원하고 달콤한 딸기 스무디 완성! 손님께 드려요.' }
    ]
  },
  mango_smoothie: {
    name: '망고 스무디',
    emoji: '🥭',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: true,
    steps: [
      { target: 'milk', toBlender: true, temp: 'cold', label: '우유 넣기(믹서)', emoji: '🥛', prompt: '우유팩을 눌러 믹서기에 우유를 먼저 넣어요.' },
      { target: 'mango', toBlender: true, label: '망고 넣기(믹서)', emoji: '🥭', prompt: '달콤한 망고를 눌러 믹서기에 넣어요.' },
      { target: 'ice', toBlender: true, label: '얼음 넣기(믹서)', emoji: '🧊', prompt: '아이스박스를 눌러 믹서기에 얼음을 넣어요.' },
      { target: 'blender', label: '얼음·망고 갈기', emoji: '🌀', prompt: '믹서기를 눌러 망고와 얼음을 곱게 갈아요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'pour_blender', label: '컵에 따르기', emoji: '🥤', prompt: '갈린 망고 스무디를 컵에 예쁘게 따라요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤시원한 망고 스무디 완성! 손님께 드려요.' }
    ]
  },
  choco_frappe: {
    name: '초코 휘핑 프라페',
    emoji: '🍫',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: true,
    steps: [
      { target: 'milk', toBlender: true, temp: 'cold', label: '우유 넣기(믹서)', emoji: '🥛', prompt: '우유팩을 눌러 믹서기에 우유를 먼저 넣어요.' },
      { target: 'choco', toBlender: true, label: '초코 넣기(믹서)', emoji: '🍫', prompt: '진한 초콜릿을 눌러 믹서기에 넣어요.' },
      { target: 'ice', toBlender: true, label: '얼음 넣기(믹서)', emoji: '🧊', prompt: '아이스박스를 눌러 믹서기에 얼음을 넣어요.' },
      { target: 'blender', label: '얼음·초코 갈기', emoji: '🌀', prompt: '믹서기를 눌러 얼음과 초코를 시원하게 갈아요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'pour_blender', label: '컵에 따르기', emoji: '🥤', prompt: '갈린 초코 프라페를 컵에 따라요.' },
      { target: 'whip', label: '휘핑크림 올리기', emoji: '🍦', prompt: '휘핑크림을 눌러 프라페 위에 봉긋하게 올려요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '달콤바삭 초코 휘핑 프라페 완성! 손님께 드려요.' }
    ]
  },
  green_tea_frappe: {
    name: '말차 휘핑 프라페',
    emoji: '🌿',
    category: 'ade_smoothie',
    cupType: 'glass',
    isHot: false,
    usesBlender: true,
    steps: [
      { target: 'milk', toBlender: true, temp: 'cold', label: '우유 넣기(믹서)', emoji: '🥛', prompt: '우유팩을 눌러 믹서기에 우유를 먼저 넣어요.' },
      { target: 'matcha', toBlender: true, label: '말차 넣기(믹서)', emoji: '🌿', prompt: '말차 파우더를 눌러 믹서기에 넣어요.' },
      { target: 'ice', toBlender: true, label: '얼음 넣기(믹서)', emoji: '🧊', prompt: '아이스박스를 눌러 믹서기에 얼음을 넣어요.' },
      { target: 'blender', label: '얼음·말차 갈기', emoji: '🌀', prompt: '믹서기를 눌러 얼음과 말차를 곱게 갈아요.' },
      { target: 'cup', label: '투명 컵 놓기', emoji: '🥛', prompt: '투명 유리컵을 쟁반 위에 올려놓아요.' },
      { target: 'pour_blender', label: '컵에 따르기', emoji: '🥤', prompt: '갈린 말차 프라페를 컵에 따라요.' },
      { target: 'whip', label: '휘핑크림 올리기', emoji: '🍦', prompt: '휘핑크림을 올려 예쁘게 마무리해요.' },
      { target: 'serve', label: '손님께 드리기', emoji: '😊', prompt: '진하고 시원한 말차 휘핑 프라페 완성! 손님께 드려요.' }
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
  { id: 'water', label: '물 붓기', emoji: '💧' },
  { id: 'sparkling', label: '탄산수 붓기', emoji: '🫧' },
  { id: 'milk', label: '우유 붓기', emoji: '🥛' },
  { id: 'vanilla', label: '바닐라 시럽', emoji: '🌼' },
  { id: 'caramel', label: '카라멜 소스', emoji: '🍯' },
  { id: 'choco', label: '초코 넣기', emoji: '🍫' },
  { id: 'whip', label: '휘핑크림', emoji: '🍦' },
  { id: 'strawberry', label: '딸기 넣기', emoji: '🍓' },
  { id: 'mango', label: '망고 넣기', emoji: '🥭' },
  { id: 'lemon', label: '레몬 넣기', emoji: '🍋' },
  { id: 'grapefruit', label: '자몽 넣기', emoji: '🍊' },
  { id: 'yuja', label: '유자청 넣기', emoji: '🍯' },
  { id: 'tea', label: '녹차 티백', emoji: '🍃' },
  { id: 'matcha', label: '말차 파우더', emoji: '🌿' },
  { id: 'blender', label: '블렌더 갈기', emoji: '🌀' },
  { id: 'pour_blender', label: '스무디 따르기', emoji: '🥤' },
  { id: 'serve', label: '손님께 드리기', emoji: '😊' }
];

const EASY_STEP_MAP = {
  cup: { label: '컵 놓기', prompt: '먼저 컵을 쟁반 위에 올려요.' },
  grinder: { label: '커피콩 갈기', prompt: '기계를 눌러 커피콩을 곱게 갈아요.' },
  tamper: { label: '가루 꾹 누르기', prompt: '누르개로 커피 가루를 꾹 다져요.' },
  machine: { label: '진한 커피 내리기', prompt: '버튼을 눌러 따뜻한 진한 커피를 내려요.' },
  shot: { label: '커피 붓기', prompt: '진한 커피를 컵에 천천히 부어요.' },
  ice: { label: '얼음 넣기', prompt: '시원한 얼음을 넣어요.' },
  water: { label: '물 붓기', prompt: '깨끗한 물을 컵에 부어요.' },
  sparkling: { label: '탄산수 붓기', prompt: '톡 쏘는 탄산수를 컵에 부어요.' },
  milk: { label: '우유 붓기', prompt: '하얀 우유를 부어요.' },
  vanilla: { label: '바닐라 시럽', prompt: '달콤한 바닐라 시럽을 넣어요.' },
  caramel: { label: '카라멜 뿌리기', prompt: '달콤한 카라멜 소스를 뿌려요.' },
  choco: { label: '초코 넣기', prompt: '달콤한 초코를 넣어요.' },
  whip: { label: '생크림 올리기', prompt: '하얀 휘핑크림을 위에 올려요.' },
  strawberry: { label: '딸기 넣기', prompt: '달콤한 딸기를 넣어요.' },
  mango: { label: '망고 넣기', prompt: '노란 망고를 넣어요.' },
  lemon: { label: '레몬 넣기', prompt: '상큼한 레몬을 넣어요.' },
  grapefruit: { label: '자몽 넣기', prompt: '상큼한 자몽을 넣어요.' },
  yuja: { label: '유자청 넣기', prompt: '달콤한 유자청을 컵에 넣어요.' },
  tea: { label: '녹차 티백 넣기', prompt: '녹차 티백을 컵에 넣어요.' },
  matcha: { label: '말차 가루 넣기', prompt: '초록빛 말차 가루를 넣어요.' },
  blender: { label: '믹서기 돌리기', prompt: '믹서기를 눌러 재료를 부드럽게 갈아요.' },
  pour_blender: { label: '음료 따르기', prompt: '갈아진 음료를 컵에 부어요.' },
  serve: { label: '손님께 드리기', prompt: '다 만든 음료를 손님께 웃으며 드려요!' }
};

// ============================================================================
// 2. 상태 관리
// ============================================================================
const CAFE_COUNT_KEY = 'safe_mover.cafe.count.v1';
const CAFE_MADE_DRINKS_KEY = 'safe_mover.cafe.made_drinks.v1';

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

function loadMadeDrinks() {
  try {
    const raw = localStorage.getItem(CAFE_MADE_DRINKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function recordMadeDrink(recipeKey, recipe, stars = 3) {
  if (!recipeKey || !recipe) return;
  const map = loadMadeDrinks();
  const prev = map[recipeKey] || {
    id: recipeKey,
    name: recipe.name,
    emoji: recipe.emoji,
    category: recipe.category,
    cupType: recipe.cupType,
    isHot: Boolean(recipe.isHot),
    count: 0,
    bestStars: 0
  };
  map[recipeKey] = {
    ...prev,
    name: recipe.name,
    emoji: recipe.emoji,
    category: recipe.category,
    cupType: recipe.cupType,
    isHot: Boolean(recipe.isHot),
    count: (Number(prev.count) || 0) + 1,
    bestStars: Math.max(Number(prev.bestStars) || 0, Number(stars) || 0),
    lastMode: state.practiceMode,
    lastMadeAt: new Date().toISOString()
  };
  try { localStorage.setItem(CAFE_MADE_DRINKS_KEY, JSON.stringify(map)); } catch {}
  if (window.D1Bridge && typeof window.D1Bridge.setKV === 'function') {
    window.D1Bridge.setKV(CAFE_MADE_DRINKS_KEY, map);
  }
}

const KIOSK_ORDERS_KEY = 'safe_mover.kiosk.orders.v1';

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

function saveKioskOrders(list) {
  const trimmed = Array.isArray(list) ? list.slice(0, 30) : [];
  try { localStorage.setItem(KIOSK_ORDERS_KEY, JSON.stringify(trimmed)); } catch {}
  if (window.D1Bridge && typeof window.D1Bridge.setKV === 'function') {
    window.D1Bridge.setKV(KIOSK_ORDERS_KEY, trimmed);
  }
  try {
    const base = (window.D1Bridge && window.D1Bridge.getApiBase)
      ? window.D1Bridge.getApiBase()
      : 'https://safe-mover-d1-api.school-guardian.workers.dev';
    fetch(base + '/api/kv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'safe_mover.kiosk.orders.public.v1', value: trimmed })
    }).catch(() => {});
  } catch {}
}

function isDrinkOrderItem(it) {
  return Boolean(it && (RECIPES[it.itemId] || (it.category && it.category !== 'bakery')));
}

function getPendingDrinkCount(orders) {
  let pending = 0;
  for (const ord of orders || []) {
    for (const it of ord.items || []) {
      if (isDrinkOrderItem(it)) {
        const rem = Math.max(0, (Number(it.qty) || 0) - (Number(it.madeQty) || 0));
        pending += rem;
      }
    }
  }
  return pending;
}

function getInitialRecipeKey() {
  try {
    const params = new URLSearchParams(window.location.search);
    const req = params.get('drink');
    if (req && RECIPES[req]) return req;
  } catch {}
  return 'hot_americano';
}

function getInitialKioskOrder() {
  try {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    const drinkId = params.get('drink');
    if (!orderId) return null;
    const orders = loadKioskOrders();
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return null;
    const targetItem = (ord.items || []).find((it) => it.itemId === drinkId && RECIPES[it.itemId])
      || (ord.items || []).find((it) => RECIPES[it.itemId]);
    if (!targetItem) return null;
    return {
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      diningType: ord.diningType,
      itemId: targetItem.itemId,
      optionsLabel: targetItem.optionsLabel || '기본'
    };
  } catch {
    return null;
  }
}

function createInitialCraft() {
  return {
    cupPlaced: null, // null | 'mug' | 'glass' | 'tea'
    beansGround: false,
    beansTamped: false,
    shotExtracted: false,
    shotQuality: 'good', // 'good' | 'weak_untamped' | 'watery_nobeans'
    shotPoured: false,
    shotCount: 0,
    iceInCup: false,
    iceCount: 0,
    waterPoured: false,
    waterTemp: null, // 'hot' | 'cold'
    waterCount: 0,
    sparklingPoured: false,
    sparklingCount: 0,
    milkPoured: false,
    milkTemp: null, // 'hot' | 'cold'
    milkCount: 0,
    whipAdded: false,
    caramelAdded: false,
    ingredientsInCup: [],
    blenderItems: [],
    blended: false,
    smoothiePoured: false,
    smoothieColor: 0xf2849e,
    smoothieIngredients: [],
    isHotDrink: false,
    spilled: false,
    mistakes: [],
    log: []
  };
}

const state = {
  recipeKey: getInitialRecipeKey(),
  activeKioskOrder: getInitialKioskOrder(), // null | { orderId, orderNumber, diningType, itemId, optionsLabel }
  practiceMode: 'auto', // 'auto' | 'manual' | 'practicum'
  practicumTarget: 'cup', // 'cup' | 'blender'
  stepIndex: 0,
  awaitingNextChoice: false,
  manualChoices: [],
  awaitingCupPick: false,
  awaitingTempPick: null, // null | { actionId: 'water' | 'milk' }
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
  completedCount: loadCafeCount(),
  liquidLevel: 0,
  liquidColor: new THREE.Color(0x3b2314),
  hasIce: false,
  isHot: false,
  craft: createInitialCraft()
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

function playSparklingSound() {
  playFilteredNoise(0.75, 1600, 3200, 1.5, 0.048);
  [0.05, 0.14, 0.25, 0.36, 0.48].forEach((d, i) => {
    playSoftTone(1400 + i * 220, 0.06, 'sine', 0.022, d);
  });
}

function playWhipSound() {
  playFilteredNoise(0.42, 1200, 2200, 2.8, 0.052);
  playSoftTone(540, 0.14, 'sine', 0.03, 0.05);
}

function playSyrupSound() {
  playSoftTone(380, 0.11, 'triangle', 0.045);
  playSoftTone(560, 0.13, 'sine', 0.035, 0.08);
}

function playIngredientSound(kind) {
  if (kind === 'tea') {
    playSoftTone(520, 0.09, 'sine', 0.04);
    playSoftTone(660, 0.11, 'sine', 0.035, 0.09);
  } else if (kind === 'vanilla' || kind === 'caramel') {
    playSyrupSound();
  } else if (kind === 'whip') {
    playWhipSound();
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

function speakKorean(text, forceSpeak) {
  if (!state.voiceEnabled && !forceSpeak) return;
  const rate = state.slowPace ? 0.82 : 0.92; // 또박또박 차분한 속도
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
// 4. Three.js 씬 & 차분한 카페 환경 구축
// ============================================================================
const container = document.getElementById('canvasContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6efe4);
scene.fog = new THREE.Fog(0xf6efe4, 6.2, 14.5);

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
renderer.toneMappingExposure = 1.1;
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
    target: new THREE.Vector3(0, 1.04, 0.04),
    pos: new THREE.Vector3(0, 1.04 + 0.86 * mult, 2.58 * mult)
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
  const recipe = getCurrentRecipe();
  const curStep = getCurrentStep();
  const isBlenderStep = Boolean(curStep && curStep.toBlender) ||
    (recipe && recipe.usesBlender && (targetId === 'milk' || targetId === 'strawberry' || targetId === 'mango' || targetId === 'choco' || targetId === 'matcha' || targetId === 'ice'));
  const bounds = targetBounds[targetId];

  // Blender-based steps frame both the ingredient/ice and blender or blender + prep tray
  if (isBlenderStep) {
    const bBounds = targetBounds['blender'];
    if (bounds && bBounds) {
      const mid = bounds.center.clone().lerp(bBounds.center, 0.5);
      mid.y = Math.max(COUNTER_Y + 0.14, (bounds.center.y + bBounds.center.y) * 0.5);
      const span = bounds.center.distanceTo(bBounds.center) + 0.28;
      const dist = Math.max(0.88, span * 1.15) * mult;
      return {
        target: mid,
        pos: new THREE.Vector3(mid.x, mid.y + dist * 0.44, mid.z + dist * 0.92)
      };
    }
  }
  if (targetId === 'pour_blender' && bounds) {
    const mid = bounds.center.clone().lerp(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.14, PREP_POS.z), 0.5);
    const dist = 0.98 * mult;
    return {
      target: mid,
      pos: new THREE.Vector3(mid.x, mid.y + dist * 0.44, mid.z + dist * 0.94)
    };
  }

  if (bounds) {
    const maxSpan = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 0.18);
    const dist = Math.max(0.68, Math.min(1.1, maxSpan * 2.15)) * mult;
    const lookY = Math.max(COUNTER_Y + 0.08, bounds.center.y + 0.03);
    return {
      target: new THREE.Vector3(bounds.center.x, lookY, bounds.center.z),
      pos: new THREE.Vector3(
        bounds.center.x + 0.05 * mult,
        lookY + dist * 0.48,
        bounds.center.z + dist * 0.92
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

function focusPrepActionCamera(isBlender = false) {
  if (!state.autoCamera || state.cameraViewMode === 'overview') return;
  const mult = getAspectMultiplier();
  if (isBlender) {
    animateCameraTo(
      new THREE.Vector3(blenderJarBounds.x, COUNTER_Y + 0.22 + 0.28 * mult, blenderJarBounds.z + 0.62 * mult),
      new THREE.Vector3(blenderJarBounds.x, COUNTER_Y + 0.22, blenderJarBounds.z),
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

// 따뜻하고 화사한 카페 3점 조명
scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd8c3aa, 1.45));
const dirLight = new THREE.DirectionalLight(0xfff4df, 1.45);
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

const fillLight = new THREE.DirectionalLight(0xffe6cc, 0.55);
fillLight.position.set(-3.0, 3.0, 2.5);
scene.add(fillLight);

const prepSpot = new THREE.PointLight(0xfff0d4, 0.85, 3.5);
prepSpot.position.set(0, 1.85, 0.35);
scene.add(prepSpot);

// 바닥과 벽 (따뜻한 카페 배경 + 우드 몰딩)
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 12),
  new THREE.MeshStandardMaterial({ color: 0xe6d6c1, roughness: 0.86 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 5.5),
  new THREE.MeshStandardMaterial({ color: 0xfaf5ec, roughness: 0.94 })
);
backWall.position.set(0, 2.75, -1.65);
backWall.receiveShadow = true;
scene.add(backWall);

const wallTrim = new THREE.Mesh(
  new THREE.BoxGeometry(16, 0.95, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xdfcfb9, roughness: 0.82 })
);
wallTrim.position.set(0, 0.475, -1.63);
wallTrim.receiveShadow = true;
scene.add(wallTrim);

// 벽면 카페 메뉴 보드 (CanvasTexture - 18종 전체 메뉴 자동 표시)
function createMenuBoard() {
  const cv = document.createElement('canvas');
  cv.width = 1152;
  cv.height = 512;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#29372d';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#c8a97e';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, cv.width - 24, cv.height - 24);
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 44px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ 마음카페 MENU (18종)', cv.width / 2, 70);
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(64, 94); ctx.lineTo(cv.width - 64, 94); ctx.stroke();
  ctx.font = 'bold 25px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'left';
  const items = Object.values(RECIPES).map((r) => `${r.emoji} ${r.name}`);
  items.forEach((txt, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    ctx.fillStyle = col === 0 ? '#fde68a' : (col === 1 ? '#e2f2e6' : '#fed7aa');
    ctx.fillText(txt, 56 + col * 365, 148 + row * 56);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.94, 0.045),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65 })
  );
  board.position.set(0, 2.04, -1.61);
  board.castShadow = true;
  scene.add(board);
}
createMenuBoard();

// 천장 펜던트 조명 3개 (따뜻한 카페 무드)
[-0.95, 0, 0.95].forEach((lx) => {
  const lamp = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b3026, roughness: 0.7 })
  );
  cord.position.y = 0.38;
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.11, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x487555, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide })
  );
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd27d, emissiveIntensity: 1.4, roughness: 0.2 })
  );
  bulb.position.y = -0.04;
  lamp.add(cord, shade, bulb);
  lamp.position.set(lx, 2.15, 0.06);
  scene.add(lamp);
});

// ============================================================================
// 5. 공개 CC0 GLB 에셋 로더 & 정규화 유틸리티
// ============================================================================
const loader = new GLTFLoader();
const interactables = []; // hitbox meshes
const targetAnchors = {}; // targetId -> THREE.Vector3 (강조 링 위치)
const targetBounds = {};  // targetId -> { center, size, min, max }

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

// 납작하거나 긴 오브젝트가 과도하게 커지지 않도록 가로·세로·깊이 상한을 모두 고려해 배치
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
    model.position.z + (z - center.z)
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
    new THREE.BoxGeometry(Math.max(size.x * 1.18, 0.2), Math.max(size.y * 1.18, 0.2), Math.max(size.z * 1.18, 0.2)),
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
// 6. 동적 3D 소품 (강조 링, 쟁반, 음료 액체, 얼음, 물줄기, 김)
// ============================================================================
const COUNTER_Y = 0.92;
const PREP_POS = new THREE.Vector3(0, COUNTER_Y, 0.14);

// 안내 모드 강조 링 + 상단 부유 포인터 비콘
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
highlightBeacon.rotation.x = Math.PI; // 아래를 가리키는 화살표 콘
highlightBeacon.visible = false;
scene.add(highlightBeacon);

// 작업 쟁반 (음료를 만드는 중앙 위치 - 우드 + 브라스 림)
const tray = new THREE.Group();
const trayBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.175, 0.16, 0.018, 36),
  new THREE.MeshStandardMaterial({ color: 0x7c5840, roughness: 0.55 })
);
trayBase.position.y = 0.009;
trayBase.receiveShadow = true;
const trayRim = new THREE.Mesh(
  new THREE.TorusGeometry(0.172, 0.008, 10, 36),
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.65, roughness: 0.3 })
);
trayRim.rotation.x = Math.PI / 2;
trayRim.position.y = 0.018;
tray.add(trayBase, trayRim);
tray.position.set(PREP_POS.x, COUNTER_Y, PREP_POS.z);
scene.add(tray);

// 실습모드 쟁반 흘림 / 얼음 떨어짐 3D 시각화
const spillPuddleMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.11, 0.115, 0.004, 24),
  new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.15, transparent: true, opacity: 0.82 })
);
spillPuddleMesh.position.set(0, 0.02, 0);
spillPuddleMesh.visible = false;
tray.add(spillPuddleMesh);

const spillIceGroup = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const scube = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.024, 0.024),
    new THREE.MeshStandardMaterial({ color: 0xe0f7ff, roughness: 0.12, transparent: true, opacity: 0.85 })
  );
  scube.position.set((i - 1) * 0.045, 0.03, (i % 2 === 0 ? 0.03 : -0.03));
  scube.rotation.set(i * 0.5, i * 0.8, 0.2);
  spillIceGroup.add(scube);
}
spillIceGroup.visible = false;
tray.add(spillIceGroup);

// 동적 음료 그룹 (컵 + 내부 액체 + 거품 + 얼음)
const drinkGroup = new THREE.Group();
drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
drinkGroup.visible = false;
scene.add(drinkGroup);

let activeCupModels = { mug: null, glass: null, tea: null };
// 바리스타 전용 3D 소품 참조
let tamperMesh = null;
let portafilterCoffee = null;
let shotGlassGroup = null;
let shotLiquidMesh = null;
let blenderModel = null;
let grinderModel = null;
let serveBellMesh = null;
let machineLedMat = null;
let blenderJarBounds = { baseY: COUNTER_Y + 0.13, height: 0.15, x: 0.68, z: -0.12 };
const SHOT_HOME_POS = new THREE.Vector3(-0.24, COUNTER_Y, 0.18);
const MACHINE_SPOUT_POS = new THREE.Vector3(-0.98, COUNTER_Y + 0.03, 0.02);

// 샷잔 넘침 3D 시각화
const shotOverflowMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.085, 0.09, 0.004, 24),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.2, transparent: true, opacity: 0.85 })
);
shotOverflowMesh.position.set(SHOT_HOME_POS.x, COUNTER_Y + 0.004, SHOT_HOME_POS.z);
shotOverflowMesh.visible = false;
scene.add(shotOverflowMesh);

// 믹서기 내부 스무디/액체 & 고체 알갱이(얼음·과일·초코) 시각화
const blenderMixMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.048, 0.038, 0.14, 24),
  new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.3, transparent: true, opacity: 0.9 })
);
blenderMixMesh.position.set(0.68, COUNTER_Y + 0.14, -0.12);
blenderMixMesh.scale.y = 0.01;
blenderMixMesh.visible = false;
scene.add(blenderMixMesh);

const blenderChunksGroup = new THREE.Group();
blenderChunksGroup.position.set(0.68, COUNTER_Y + 0.14, -0.12);
blenderChunksGroup.visible = false;
scene.add(blenderChunksGroup);

// 컵 내부 토핑/재료 그룹
const cupToppingGroup = new THREE.Group();
cupToppingGroup.visible = false;
drinkGroup.add(cupToppingGroup);

// 휘핑크림 3D 스월 그룹
const whipGroup = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const r = 0.044 - i * 0.01;
  const h = 0.022 - i * 0.002;
  const layer = new THREE.Mesh(
    new THREE.TorusGeometry(Math.max(r * 0.55, 0.008), Math.max(h * 0.55, 0.007), 10, 20),
    new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.48 })
  );
  layer.rotation.x = Math.PI / 2;
  layer.position.y = i * 0.014;
  whipGroup.add(layer);
}
const whipTip = new THREE.Mesh(
  new THREE.ConeGeometry(0.018, 0.028, 16),
  new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.45 })
);
whipTip.position.y = 0.056;
whipGroup.add(whipTip);
whipGroup.visible = false;
drinkGroup.add(whipGroup);

// 카라멜 드리즐 3D 그룹
const drizzleGroup = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.068, 8),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.25 })
  );
  bar.rotation.z = Math.PI / 2;
  bar.rotation.y = i * 0.65 - 0.5;
  bar.position.set(0, 0.003, (i - 1) * 0.014);
  drizzleGroup.add(bar);
}
drizzleGroup.visible = false;
drinkGroup.add(drizzleGroup);

// 탄산수 톡톡 기포 그룹
const fizzGroup = new THREE.Group();
const fizzBubbles = [];
for (let i = 0; i < 10; i++) {
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.0045, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
  );
  b.position.set((Math.sin(i * 2.1)) * 0.028, 0.04 + (i % 4) * 0.025, (Math.cos(i * 1.7)) * 0.028);
  fizzGroup.add(b);
  fizzBubbles.push(b);
}
fizzGroup.visible = false;
drinkGroup.add(fizzGroup);

// 공중 낙하 연출용 임시 아이템 그룹
const fallingItemGroup = new THREE.Group();
fallingItemGroup.visible = false;
scene.add(fallingItemGroup);

// 컵 내부 액체 (컵 종류별로 크기 동적 조정)
const liquidMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.048, 0.038, 0.16, 28),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.2, transparent: true, opacity: 0.85 })
);
liquidMesh.position.y = 0.025;
liquidMesh.scale.y = 0.01;
liquidMesh.visible = false;
drinkGroup.add(liquidMesh);

// 크레마 / 우유 거품 / 초코 거품 캡
const foamCapMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.047, 0.047, 0.012, 28),
  new THREE.MeshStandardMaterial({ color: 0xfef3e2, roughness: 0.55 })
);
foamCapMesh.visible = false;
drinkGroup.add(foamCapMesh);

// 얼음 큐브 그룹 (컵 상단에 선명히 떠 있도록 배치)
const iceGroup = new THREE.Group();
const iceCubes = [];
for (let i = 0; i < 4; i++) {
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.028, 0.028),
    new THREE.MeshStandardMaterial({ color: 0xe0f7ff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.84 })
  );
  ice.position.set(
    (i % 2 === 0 ? -0.014 : 0.014),
    0.095 + Math.floor(i / 2) * 0.028,
    (i % 3 === 0 ? 0.012 : -0.012)
  );
  ice.rotation.set(i * 0.45, i * 0.7, 0.25);
  iceGroup.add(ice);
  iceCubes.push(ice);
}
iceGroup.visible = false;
drinkGroup.add(iceGroup);

// 따르는 물줄기 애니메이션용
const pourStream = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.006, 0.26, 12),
  new THREE.MeshStandardMaterial({ color: 0x3b2314, transparent: true, opacity: 0.88 })
);
pourStream.visible = false;
scene.add(pourStream);

// 따뜻한 김 파티클
const steamGroup = new THREE.Group();
const steamPuffs = [];
for (let i = 0; i < 5; i++) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
  );
  puff.position.set((i - 2) * 0.014, 0.17 + i * 0.04, (i % 2 === 0 ? 0.01 : -0.01));
  steamGroup.add(puff);
  steamPuffs.push(puff);
}
steamGroup.visible = false;
drinkGroup.add(steamGroup);

// 3D 반짝이 파티클 버스트 (단계 성공 / 완성 시)
const sparkles3D = [];
function spawn3DSparkles(worldPos, count = 14, colorHex = 0xfbbf24) {
  const palette = [colorHex, 0xffffff, 0x6ee7b7, 0xfde047, 0xf9a8d4];
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

// ============================================================================
// 7. 모든 CC0 3D 에셋 배치
// ============================================================================
async function initCafeScene() {
  try {
    // 1) 카페 카운터 & 배경 가구
    const [
      barCenter, barLeft, barRight, barEndL, barEndR, cabinetLeft, cabinetRight,
      fridge, plant, table, chair1, chair2, croissant, donut
    ] = await Promise.all([
      loadGLB('kitchenBar.glb'),
      loadGLB('kitchenBar.glb'),
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

    placeModel(barLeft, COUNTER_Y - 0.03, -1.08, 0, 0);
    placeModel(barCenter, COUNTER_Y - 0.03, 0, 0, 0);
    placeModel(barRight, COUNTER_Y - 0.03, 1.08, 0, 0);
    placeModel(barEndL, COUNTER_Y - 0.03, -1.68, 0, 0);
    placeModel(barEndR, COUNTER_Y - 0.03, 1.68, 0, 0, Math.PI);

    // 틈 없이 넓고 매끈한 우드·크림 카운터 상판 (x: -1.82..+1.82, z: -0.40..+0.48)
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.64, 0.038, 0.88),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.42, metalness: 0.04 })
    );
    counterTop.position.set(0, COUNTER_Y - 0.019, 0.04);
    counterTop.receiveShadow = true;
    counterTop.castShadow = true;
    scene.add(counterTop);

    const counterFrontTrim = new THREE.Mesh(
      new THREE.BoxGeometry(3.66, 0.022, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x8d6346, roughness: 0.5 })
    );
    counterFrontTrim.position.set(0, COUNTER_Y - 0.026, 0.48);
    scene.add(counterFrontTrim);

    placeModel(cabinetLeft, COUNTER_Y, -0.98, 0, -1.16);
    placeModel(cabinetRight, COUNTER_Y, 0.98, 0, -1.16);
    placeModel(fridge, 1.48, -2.18, 0, -0.78, 0.22);
    placeModel(plant, 1.05, 2.18, 0, -0.82);

    // 손님 테이블 & 의자 (배경 분위기)
    placeModel(table, 0.72, 2.38, 0, 0.98);
    placeModel(chair1, 0.75, 1.85, 0, 0.98, Math.PI / 2);
    placeModel(chair2, 0.75, 2.91, 0, 0.98, -Math.PI / 2);

    // 진열용 빵 유리 돔 (카운터 오른쪽 끝)
    const pastryStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.13, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0x9c7252, roughness: 0.55 })
    );
    pastryStand.position.set(1.66, COUNTER_Y + 0.01, 0.20);
    pastryStand.receiveShadow = true;
    scene.add(pastryStand);
    placeModelFitted(croissant, { maxW: 0.13, maxH: 0.09, maxD: 0.15 }, 1.64, COUNTER_Y + 0.02, 0.14, 0.4);
    placeModelFitted(donut, { maxW: 0.12, maxH: 0.08, maxD: 0.12 }, 1.67, COUNTER_Y + 0.02, 0.27, -0.3);

    // 2) 상호작용 도구들 (바리스타 작업대 위 — 겹침 없이 깔끔하게 배치)
    const [
      machine, blender, milk, strawberry, lemon, choco, sodaBottle,
      standCup, standGlass, standTea, cupMug, cupGlass, cupTea
    ] = await Promise.all([
      loadGLB('kitchenCoffeeMachine.glb'),
      loadGLB('kitchenBlender.glb'),
      loadGLB('carton.glb'),
      loadGLB('strawberry.glb'),
      loadGLB('lemon.glb'),
      loadGLB('chocolate.glb'),
      loadGLB('soda-bottle.glb'),
      loadGLB('cup-coffee.glb'),
      loadGLB('glass.glb'),
      loadGLB('cup-tea.glb'),
      loadGLB('cup-coffee.glb'),
      loadGLB('glass.glb'),
      loadGLB('cup-tea.glb')
    ]);

    // 커피 머신 (뒷줄 좌측)
    placeModelFitted(machine, { maxW: 0.35, maxH: 0.35, maxD: 0.35 }, -0.98, COUNTER_Y, -0.14);
    machineLedMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.8 });
    const machineLed = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 12), machineLedMat);
    machineLed.position.set(-0.98, COUNTER_Y + 0.27, 0.02);
    scene.add(machineLed);
    registerInteractive(machine, 'machine', '커피 머신 (샷 추출)', new THREE.Vector3(-0.98, COUNTER_Y + 0.012, -0.12));

    // 원두 그라인더 (뒷줄 맨 왼쪽 - 메탈 베이스 + 투명 호퍼 + 원두 알갱이)
    grinderModel = new THREE.Group();
    const gBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.03, 0.21),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.7, roughness: 0.28 })
    );
    gBase.position.y = 0.015;
    const grinderBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.22, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x3b2f2a, roughness: 0.38, metalness: 0.25 })
    );
    grinderBody.position.y = 0.14;
    grinderBody.castShadow = true;
    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.042, 0.14, 24),
      new THREE.MeshStandardMaterial({ color: 0x5c3c28, roughness: 0.18, transparent: true, opacity: 0.65 })
    );
    hopper.position.y = 0.32;
    const hopperLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.092, 0.016, 24),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.4 })
    );
    hopperLid.position.y = 0.395;
    for (let b = 0; b < 10; b++) {
      const bean = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x3e2214, roughness: 0.55 })
      );
      const ang = b * 1.1;
      bean.position.set(Math.cos(ang) * 0.028, 0.28 + (b % 3) * 0.022, Math.sin(ang) * 0.028);
      bean.scale.set(1.2, 0.85, 0.9);
      grinderModel.add(bean);
    }
    const chute = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.06, 0.075),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.75, roughness: 0.22 })
    );
    chute.position.set(0, 0.18, 0.1);
    const dial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.018, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.35 })
    );
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0.045, 0.11, 0.095);
    grinderModel.add(gBase, grinderBody, hopper, hopperLid, chute, dial);
    grinderModel.position.set(-1.46, COUNTER_Y, -0.14);
    scene.add(grinderModel);
    registerInteractive(grinderModel, 'grinder', '원두 그라인더 (원두 갈기)', new THREE.Vector3(-1.46, COUNTER_Y + 0.012, -0.14));

    // 탬핑 매트 + 포터필터 + 탬퍼 (앞줄 좌측-중앙)
    const tamperStation = new THREE.Group();
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.016, 0.17),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 })
    );
    mat.position.y = 0.008;
    const pfBasket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.042, 0.048, 22),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.22 })
    );
    pfBasket.position.set(-0.045, 0.04, 0);
    const pfHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.019, 0.14, 14),
      new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.55 })
    );
    pfHandle.rotation.x = Math.PI / 2;
    pfHandle.position.set(-0.045, 0.04, 0.09);
    portafilterCoffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.014, 22),
      new THREE.MeshStandardMaterial({ color: 0x4b2e1e, roughness: 0.9 })
    );
    portafilterCoffee.position.set(-0.045, 0.059, 0);
    portafilterCoffee.visible = false;

    tamperMesh = new THREE.Group();
    const tamperBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.022, 22),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.18 })
    );
    const tamperGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.018, 0.08, 18),
      new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.45 })
    );
    tamperGrip.position.y = 0.048;
    tamperMesh.add(tamperBase, tamperGrip);
    tamperMesh.position.set(0.06, 0.026, 0);

    tamperStation.add(mat, pfBasket, pfHandle, portafilterCoffee, tamperMesh);
    tamperStation.position.set(-0.98, COUNTER_Y, 0.24);
    scene.add(tamperStation);
    registerInteractive(tamperStation, 'tamper', '탬퍼 (원두 다지기)', new THREE.Vector3(-0.98, COUNTER_Y + 0.012, 0.24));

    // 에스프레소 샷잔 (눈금 + 손잡이 있는 투명 유리 샷잔)
    shotGlassGroup = new THREE.Group();
    const shotSaucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.048, 0.01, 20),
      new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.35 })
    );
    shotSaucer.position.y = 0.005;
    const shotCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.032, 0.095, 22),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, roughness: 0.08, depthWrite: false })
    );
    shotCup.position.y = 0.052;
    const shotHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.005, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.75 })
    );
    shotHandle.rotation.z = -Math.PI / 2;
    shotHandle.position.set(0.038, 0.056, 0);
    shotLiquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.028, 0.065, 20),
      new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.22 })
    );
    shotLiquidMesh.position.y = 0.038;
    shotLiquidMesh.visible = false;
    shotGlassGroup.add(shotSaucer, shotCup, shotHandle, shotLiquidMesh);
    shotGlassGroup.position.copy(SHOT_HOME_POS);
    scene.add(shotGlassGroup);
    registerInteractive(shotGlassGroup, 'shot', '에스프레소 샷잔 (샷 붓기)', new THREE.Vector3(SHOT_HOME_POS.x, COUNTER_Y + 0.012, SHOT_HOME_POS.z));

    // 믹서기 (얼음 분쇄 블렌더)
    blenderModel = blender;
    placeModelFitted(blender, { maxW: 0.22, maxH: 0.38, maxD: 0.22 }, 0.68, COUNTER_Y, -0.12);
    blender.updateMatrixWorld(true);
    const bBox = new THREE.Box3().setFromObject(blender);
    const bSize = new THREE.Vector3();
    bBox.getSize(bSize);
    blenderJarBounds = {
      baseY: bBox.min.y + bSize.y * 0.36,
      height: bSize.y * 0.38,
      x: 0.68,
      z: -0.12
    };
    blenderMixMesh.position.set(0.68, blenderJarBounds.baseY, -0.12);
    blenderChunksGroup.position.set(0.68, blenderJarBounds.baseY + 0.02, -0.12);
    registerInteractive(blender, 'blender', '얼음 분쇄 블렌더 (믹서기)', new THREE.Vector3(0.68, COUNTER_Y + 0.012, -0.12));
    targetAnchors['pour_blender'] = targetAnchors['blender'];
    targetBounds['pour_blender'] = targetBounds['blender'];

    // 우유팩 (뒷줄 중앙 우측)
    placeModelFitted(milk, { maxW: 0.15, maxH: 0.26, maxD: 0.15 }, 0.30, COUNTER_Y, -0.18);
    registerInteractive(milk, 'milk', '신선한 우유', new THREE.Vector3(0.30, COUNTER_Y + 0.012, -0.18));

    // 투명 유리 물병 / 워터 피처
    const waterPitcher = new THREE.Group();
    const pitcherGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.064, 0.22, 24),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.45, roughness: 0.08, depthWrite: false })
    );
    pitcherGlass.position.y = 0.11;
    const pitcherWater = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.056, 0.15, 22),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.15 })
    );
    pitcherWater.position.y = 0.08;
    const pitcherLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    pitcherLid.position.y = 0.225;
    const pitcherHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.044, 0.008, 10, 18, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.72 })
    );
    pitcherHandle.rotation.z = -Math.PI / 2;
    pitcherHandle.position.set(0.058, 0.125, 0);
    waterPitcher.add(pitcherWater, pitcherGlass, pitcherLid, pitcherHandle);
    waterPitcher.position.set(-0.50, COUNTER_Y, -0.18);
    scene.add(waterPitcher);
    registerInteractive(waterPitcher, 'water', '깨끗한 물병', new THREE.Vector3(-0.50, COUNTER_Y + 0.012, -0.18));

    // 탄산수 병 (soda-bottle.glb + 시원한 하늘색 캡 받침)
    const sparklingGroup = new THREE.Group();
    const sparkCoaster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.052, 0.01, 20),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 })
    );
    sparkCoaster.position.y = 0.005;
    sparklingGroup.add(sparkCoaster);
    placeModelFitted(sodaBottle, { maxW: 0.095, maxH: 0.24, maxD: 0.095 }, 0, 0.01, 0);
    scene.remove(sodaBottle);
    sparklingGroup.add(sodaBottle);
    sparklingGroup.position.set(-0.30, COUNTER_Y, -0.18);
    scene.add(sparklingGroup);
    registerInteractive(sparklingGroup, 'sparkling', '톡 쏘는 탄산수', new THREE.Vector3(-0.30, COUNTER_Y + 0.012, -0.18));

    // 시럽 & 소스 받침대 (뒷줄 중앙)
    const syrupRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.018, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x8d6346, roughness: 0.5 })
    );
    syrupRack.position.set(-0.01, COUNTER_Y + 0.009, -0.24);
    syrupRack.receiveShadow = true;
    scene.add(syrupRack);

    // 바닐라 시럽 펌프 병
    const vanillaGroup = new THREE.Group();
    const vanBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.038, 0.17, 20),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.25, transparent: true, opacity: 0.9 })
    );
    vanBottle.position.y = 0.085;
    const vanLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.07, 20),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.5 })
    );
    vanLabel.position.y = 0.085;
    const vanNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.016, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 })
    );
    vanNeck.position.y = 0.19;
    const vanPump = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.012, 0.014),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.3 })
    );
    vanPump.position.set(0.012, 0.212, 0);
    vanillaGroup.add(vanBottle, vanLabel, vanNeck, vanPump);
    vanillaGroup.position.set(-0.10, COUNTER_Y + 0.018, -0.24);
    scene.add(vanillaGroup);
    registerInteractive(vanillaGroup, 'vanilla', '바닐라 시럽', new THREE.Vector3(-0.10, COUNTER_Y + 0.024, -0.24));

    // 카라멜 소스 스퀴즈 보틀
    const caramelGroup = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.036, 0.15, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.24 })
    );
    carBody.position.y = 0.075;
    const carLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.055, 20),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
    );
    carLabel.position.y = 0.078;
    const carNozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.052, 16),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35 })
    );
    carNozzle.position.y = 0.175;
    caramelGroup.add(carBody, carLabel, carNozzle);
    caramelGroup.position.set(0.08, COUNTER_Y + 0.018, -0.24);
    scene.add(caramelGroup);
    registerInteractive(caramelGroup, 'caramel', '카라멜 소스', new THREE.Vector3(0.08, COUNTER_Y + 0.024, -0.24));

    // 신선한 딸기 그릇
    const berryGroup = new THREE.Group();
    const berryBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.098, 0.068, 0.052, 24),
      new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.3 })
    );
    berryBowl.position.y = 0.026;
    berryBowl.castShadow = true;
    berryGroup.add(berryBowl);
    placeModelFitted(strawberry, { maxW: 0.125, maxH: 0.135, maxD: 0.125 }, 0, 0.038, 0);
    scene.remove(strawberry);
    berryGroup.add(strawberry);
    berryGroup.position.set(1.06, COUNTER_Y, -0.16);
    scene.add(berryGroup);
    registerInteractive(berryGroup, 'strawberry', '신선한 딸기', new THREE.Vector3(1.06, COUNTER_Y + 0.012, -0.16));

    // 달콤한 망고 그릇
    const mangoGroup = new THREE.Group();
    const mangoBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.065, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.3 })
    );
    mangoBowl.position.y = 0.025;
    mangoBowl.castShadow = true;
    mangoGroup.add(mangoBowl);
    for (let m = 0; m < 6; m++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.028, 0.034),
        new THREE.MeshStandardMaterial({ color: m % 2 === 0 ? 0xfbbf24 : 0xf59e0b, roughness: 0.32 })
      );
      const ang = (m / 6) * Math.PI * 2;
      cube.position.set(Math.cos(ang) * 0.032, 0.055 + (m % 2) * 0.015, Math.sin(ang) * 0.032);
      cube.rotation.set(m * 0.4, m * 0.7, 0.25);
      mangoGroup.add(cube);
    }
    mangoGroup.position.set(1.36, COUNTER_Y, -0.16);
    scene.add(mangoGroup);
    registerInteractive(mangoGroup, 'mango', '달콤한 망고', new THREE.Vector3(1.36, COUNTER_Y + 0.012, -0.16));

    // 황금 유자청 유리병
    const yujaGroup = new THREE.Group();
    const yujaJar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.13, 22),
      new THREE.MeshStandardMaterial({ color: 0xfef9c3, transparent: true, opacity: 0.48, roughness: 0.12, depthWrite: false })
    );
    yujaJar.position.y = 0.065;
    const yujaJam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.095, 20),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22 })
    );
    yujaJam.position.y = 0.052;
    const yujaLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.057, 0.057, 0.022, 22),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 })
    );
    yujaLid.position.y = 0.138;
    yujaGroup.add(yujaJam, yujaJar, yujaLid);
    yujaGroup.position.set(1.62, COUNTER_Y, -0.16);
    scene.add(yujaGroup);
    registerInteractive(yujaGroup, 'yuja', '달콤한 유자청', new THREE.Vector3(1.62, COUNTER_Y + 0.012, -0.16));

    // 상큼한 레몬 접시
    const lemonGroup = new THREE.Group();
    const lemonPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.078, 0.016, 24),
      new THREE.MeshStandardMaterial({ color: 0xc2956b, roughness: 0.55 })
    );
    lemonPlate.position.y = 0.008;
    lemonGroup.add(lemonPlate);
    placeModelFitted(lemon, { maxW: 0.13, maxH: 0.14, maxD: 0.13 }, 0, 0.016, 0);
    scene.remove(lemon);
    lemonGroup.add(lemon);
    lemonGroup.position.set(1.14, COUNTER_Y, 0.24);
    scene.add(lemonGroup);
    registerInteractive(lemonGroup, 'lemon', '상큼한 레몬', new THREE.Vector3(1.14, COUNTER_Y + 0.012, 0.24));

    // 루비 자몽 접시
    const grapefruitGroup = new THREE.Group();
    const gfPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.078, 0.016, 24),
      new THREE.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.38 })
    );
    gfPlate.position.y = 0.008;
    grapefruitGroup.add(gfPlate);
    for (let g = 0; g < 3; g++) {
      const slice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.044, 0.014, 20),
        new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.3 })
      );
      const rind = new THREE.Mesh(
        new THREE.TorusGeometry(0.044, 0.005, 8, 20),
        new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.45 })
      );
      rind.rotation.x = Math.PI / 2;
      const sliceUnit = new THREE.Group();
      sliceUnit.add(slice, rind);
      sliceUnit.position.set((g - 1) * 0.026, 0.025 + g * 0.008, (g % 2 === 0 ? 0.012 : -0.012));
      sliceUnit.rotation.set(0.25 * g, 0.3, 0.2);
      grapefruitGroup.add(sliceUnit);
    }
    grapefruitGroup.position.set(1.40, COUNTER_Y, 0.24);
    scene.add(grapefruitGroup);
    registerInteractive(grapefruitGroup, 'grapefruit', '상큼한 자몽', new THREE.Vector3(1.40, COUNTER_Y + 0.012, 0.24));

    // 달콤한 초콜릿
    const chocoGroup = new THREE.Group();
    const chocoPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.096, 0.082, 0.016, 24),
      new THREE.MeshStandardMaterial({ color: 0xfff8f0, roughness: 0.35 })
    );
    chocoPlate.position.y = 0.008;
    chocoGroup.add(chocoPlate);
    placeModelFitted(choco, { maxW: 0.155, maxH: 0.075, maxD: 0.11 }, 0, 0.022, 0);
    scene.remove(choco);
    choco.rotation.x = 0.42;
    choco.position.y += 0.018;
    chocoGroup.add(choco);
    chocoGroup.position.set(0.66, COUNTER_Y, 0.24);
    scene.add(chocoGroup);
    registerInteractive(chocoGroup, 'choco', '달콤한 초콜릿', new THREE.Vector3(0.66, COUNTER_Y + 0.012, 0.24));

    // 휘핑크림 디스펜서
    const whipDispenser = new THREE.Group();
    const whipCan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.042, 0.15, 22),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.55, roughness: 0.22 })
    );
    whipCan.position.y = 0.075;
    const whipBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.041, 0.041, 0.036, 22),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    whipBand.position.y = 0.085;
    const whipNozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.055, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    whipNozzle.position.y = 0.175;
    whipDispenser.add(whipCan, whipBand, whipNozzle);
    whipDispenser.position.set(0.90, COUNTER_Y, 0.22);
    scene.add(whipDispenser);
    registerInteractive(whipDispenser, 'whip', '부드러운 휘핑크림', new THREE.Vector3(0.90, COUNTER_Y + 0.012, 0.22));

    // 녹차 티백 상자
    const teaBox = new THREE.Group();
    const teaBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.135, 0.105, 0.11),
      new THREE.MeshStandardMaterial({ color: 0x4d8b55, roughness: 0.48 })
    );
    teaBody.position.y = 0.0525;
    teaBody.castShadow = true;
    const teaLid = new THREE.Mesh(
      new THREE.BoxGeometry(0.142, 0.02, 0.118),
      new THREE.MeshStandardMaterial({ color: 0x2e6036, roughness: 0.4 })
    );
    teaLid.position.y = 0.11;
    const teaLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.006),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.6 })
    );
    teaLabel.position.set(0, 0.058, 0.056);
    const teaLeaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    teaLeaf.scale.set(1.3, 0.7, 0.4);
    teaLeaf.position.set(0, 0.058, 0.061);
    teaBox.add(teaBody, teaLid, teaLabel, teaLeaf);
    teaBox.position.set(-0.66, COUNTER_Y, 0.24);
    scene.add(teaBox);
    registerInteractive(teaBox, 'tea', '녹차 티백 상자', new THREE.Vector3(-0.66, COUNTER_Y + 0.012, 0.24));

    // 말차 파우더 틴 + 스푼
    const matchaGroup = new THREE.Group();
    const matchaTin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.085, 22),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35 })
    );
    matchaTin.position.y = 0.0425;
    const matchaPowder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.012, 20),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 })
    );
    matchaPowder.position.y = 0.084;
    const matchaScoop = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.008, 0.085),
      new THREE.MeshStandardMaterial({ color: 0xd6b07c, roughness: 0.6 })
    );
    matchaScoop.position.set(0.018, 0.095, 0.015);
    matchaScoop.rotation.y = 0.4;
    matchaGroup.add(matchaTin, matchaPowder, matchaScoop);
    matchaGroup.position.set(-0.44, COUNTER_Y, 0.24);
    scene.add(matchaGroup);
    registerInteractive(matchaGroup, 'matcha', '진한 말차 파우더', new THREE.Vector3(-0.44, COUNTER_Y + 0.012, 0.24));

    // 대기 중인 컵들 (머그컵 + 유리컵 + 찻잔 3종)
    const cupRackGroup = new THREE.Group();
    const cupRackBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.016, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xa67c52, roughness: 0.55 })
    );
    cupRackBase.position.y = 0.008;
    cupRackBase.receiveShadow = true;
    cupRackGroup.add(cupRackBase);

    placeModelFitted(standCup, { maxW: 0.11, maxH: 0.12, maxD: 0.12 }, -0.115, 0.016, 0);
    placeModelFitted(standGlass, { maxW: 0.095, maxH: 0.16, maxD: 0.095 }, 0, 0.016, 0);
    placeModelFitted(standTea, { maxW: 0.11, maxH: 0.11, maxD: 0.12 }, 0.115, 0.016, 0);
    scene.remove(standCup);
    scene.remove(standGlass);
    scene.remove(standTea);
    cupRackGroup.add(standCup, standGlass, standTea);
    cupRackGroup.position.set(-1.42, COUNTER_Y, 0.24);
    scene.add(cupRackGroup);
    registerInteractive(cupRackGroup, 'cup', '컵 올리기', new THREE.Vector3(-1.42, COUNTER_Y + 0.012, 0.24));

    // 얼음 통 (실버 림 + 투명 얼음 큐브가 보이는 하늘색 아이스 버킷)
    const iceBox = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, 0.14, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x67bfe3, roughness: 0.32 })
    );
    boxMesh.position.y = 0.07;
    boxMesh.castShadow = true;
    const iceRim = new THREE.Mesh(
      new THREE.BoxGeometry(0.21, 0.016, 0.17),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.25 })
    );
    iceRim.position.y = 0.14;
    iceBox.add(boxMesh, iceRim);
    for (let k = 0; k < 6; k++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.034, 0.034),
        new THREE.MeshStandardMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.85, roughness: 0.1 })
      );
      cube.position.set(-0.048 + (k % 3) * 0.048, 0.155, (k < 3 ? -0.024 : 0.028));
      cube.rotation.set(k * 0.4, k * 0.7, 0.2);
      iceBox.add(cube);
    }
    iceBox.position.set(0.36, COUNTER_Y, 0.22);
    scene.add(iceBox);
    registerInteractive(iceBox, 'ice', '얼음 통', new THREE.Vector3(0.36, COUNTER_Y + 0.012, 0.22));

    // 손님께 드리기 벨
    const serveGroup = new THREE.Group();
    const bellBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.084, 0.018, 28),
      new THREE.MeshStandardMaterial({ color: 0x3b6346, roughness: 0.35 })
    );
    bellBase.position.y = 0.009;
    const bellDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.78, roughness: 0.2 })
    );
    bellDome.position.y = 0.018;
    const bellBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.016, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.18 })
    );
    bellBtn.position.y = 0.078;
    serveGroup.add(bellBase, bellDome, bellBtn);
    serveGroup.position.set(0, COUNTER_Y, 0.38);
    scene.add(serveGroup);
    serveBellMesh = serveGroup;
    registerInteractive(serveGroup, 'serve', '손님께 드리기', new THREE.Vector3(0, COUNTER_Y + 0.012, 0.38));

    // 쟁반 위 동적 컵 모델 준비 (glass만 반투명, mug/tea는 불투명 도자기!)
    prepDynamicCup(cupMug, { maxW: 0.18, maxH: 0.16, maxD: 0.20 }, false);
    prepDynamicCup(cupGlass, { maxW: 0.13, maxH: 0.21, maxD: 0.14 }, true);
    prepDynamicCup(cupTea, { maxW: 0.17, maxH: 0.14, maxD: 0.19 }, false);
    activeCupModels.mug = cupMug;
    activeCupModels.glass = cupGlass;
    activeCupModels.tea = cupTea;
    drinkGroup.add(cupMug);
    drinkGroup.add(cupGlass);
    drinkGroup.add(cupTea);

    state.practicumTarget = getCurrentRecipe().usesBlender ? 'blender' : 'cup';
    renderUI();
  } catch (err) {
    console.error('3D 모델 로딩 오류:', err);
    document.getElementById('guidanceText').textContent = '3D 에셋을 불러오는 중 문제가 발생했어요. 로컬 서버로 실행했는지 확인해주세요.';
  }
}

function prepDynamicCup(model, limits, isGlass) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const sx = limits.maxW / Math.max(size.x, 0.001);
  const sy = limits.maxH / Math.max(size.y, 0.001);
  const sz = limits.maxD / Math.max(size.z, 0.001);
  const scale = Math.min(sx, sy, sz);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  model.position.set(-center.x, -scaledBox.min.y, -center.z);
  model.visible = false;

  if (isGlass) {
    model.traverse((c) => {
      if (c.isMesh && c.material) {
        c.material = c.material.clone();
        c.material.transparent = true;
        c.material.opacity = 0.44;
        c.material.depthWrite = false;
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

function handleAction(actionId, sourceOpts = {}) {
  if (state.busy || state.paused) return;

  if (state.practiceMode === 'practicum') {
    handlePracticumAction(actionId, { from3D: Boolean(sourceOpts.from3D) });
    return;
  }

  const currentStep = getCurrentStep();
  if (!currentStep) return;

  // 믹서기 3D 클릭으로 '블렌더 갈기'와 '컵에 따르기' 모두 처리
  if (actionId === 'blender' && currentStep.target === 'pour_blender') {
    actionId = 'pour_blender';
  }

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
    // 무오류 학습: 벌칙이나 불쾌한 소리 없이 차분하고 부드러운 안내만 제공
    playGentleHintSound();
    showGuidance(`괜찮아요! 지금은 "${currentStep.label}" 차례예요. ${currentStep.prompt}`, '💡', true);
    speakKorean(`지금은 ${currentStep.label} 차례예요.`);
    return;
  }

  executeStep(actionId, { step: currentStep });
}

function getManualMismatchReason(pickedId, expectedStep) {
  const pickedBtn = TOOL_BUTTONS.find((b) => b.id === pickedId);
  const pickedLabel = pickedBtn ? pickedBtn.label : pickedId;
  if (expectedStep.target === 'tamper' && pickedId === 'machine') {
    return `"${pickedLabel}" 전에 먼저 방금 간 원두를 탬퍼로 다져야 샷이 맛있게 추출돼요!`;
  }
  if (['water', 'sparkling', 'milk', 'shot', 'ice', 'whip', 'caramel'].includes(pickedId) && expectedStep.target === 'cup') {
    return `아직 컵이 쟁반에 없어서 "${pickedLabel}"를 하면 바닥에 쏟아져요! 먼저 컵을 놓아볼까요?`;
  }
  if (pickedId === 'serve') {
    return `아직 음료가 다 만들어지지 않아 손님께 드릴 수 없어요! 다음 순서를 골라봐요.`;
  }
  if (pickedId === 'pour_blender' && expectedStep.target === 'blender') {
    return `아직 재료를 갈지 않았어요! 먼저 블렌더로 갈아야 스무디/프라페가 돼요.`;
  }
  if (pickedId === 'whip' && expectedStep.target !== 'whip') {
    return `휘핑크림은 음료를 모두 채운 뒤 맨 마지막에 올려야 예쁘게 올라가요!`;
  }
  return `"${pickedLabel}"는 지금 순서가 아니에요. 방금 전 단계 다음에 무엇이 필요할지 다시 골라봐요!`;
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

const INGREDIENT_META = {
  ice: { name: '얼음', color: 0xdff6ff },
  milk: { name: '우유', color: 0xfaf6ee },
  water: { name: '물', color: 0xbfdbfe },
  sparkling: { name: '탄산수', color: 0xbae6fd },
  shot: { name: '에스프레소 샷', color: 0x3b2314 },
  vanilla: { name: '바닐라 시럽', color: 0xfde68a },
  caramel: { name: '카라멜 소스', color: 0xd97706 },
  choco: { name: '초코', color: 0x4e2a14 },
  whip: { name: '휘핑크림', color: 0xfffdf8 },
  strawberry: { name: '딸기', color: 0xe11d48 },
  mango: { name: '망고', color: 0xf59e0b },
  lemon: { name: '레몬', color: 0xfacc15 },
  grapefruit: { name: '자몽', color: 0xfb7185 },
  yuja: { name: '유자청', color: 0xfacc15 },
  tea: { name: '녹차 티백', color: 0x4d8b55 },
  matcha: { name: '말차 파우더', color: 0x4ade80 }
};

function computeBlenderVisuals(items, blended = false) {
  const hasMilk = items.includes('milk');
  const hasWater = items.includes('water') || items.includes('sparkling');
  const hasShot = items.includes('shot');
  const hasIce = items.includes('ice');
  const hasLiquid = hasMilk || hasWater || hasShot;

  let colorHex = 0xfaf6ee;
  let foamHex = 0xffffff;
  if (items.includes('choco')) {
    colorHex = hasMilk ? 0x6b3f24 : 0x4a2511;
    foamHex = 0x8d5524;
  } else if (items.includes('matcha')) {
    colorHex = hasMilk ? 0x65a30d : 0x3f6212;
    foamHex = 0xd9f99d;
  } else if (items.includes('strawberry')) {
    colorHex = hasMilk ? (blended ? 0xf2849e : 0xf7b2c4) : 0xe11d48;
    foamHex = 0xfbcfe8;
  } else if (items.includes('mango')) {
    colorHex = hasMilk ? 0xfbbf24 : 0xf59e0b;
    foamHex = 0xfef08a;
  } else if (items.includes('grapefruit')) {
    colorHex = hasMilk ? 0xfda4af : 0xfb7185;
    foamHex = 0xffe4e6;
  } else if (items.includes('yuja') || items.includes('lemon')) {
    colorHex = hasMilk ? 0xfef08a : 0xfacc15;
    foamHex = 0xfef9c3;
  } else if (hasShot) {
    colorHex = hasMilk ? 0xa67b5b : 0x3b2314;
    foamHex = 0xe7d3bd;
  } else if (hasMilk) {
    colorHex = 0xfaf6ee;
    foamHex = 0xffffff;
  } else if (hasWater) {
    colorHex = 0xd9ecff;
    foamHex = 0xe0f2fe;
  } else if (hasIce) {
    colorHex = 0xdbeafe;
    foamHex = 0xf0f9ff;
  }

  const levelScale = Math.min(0.24 + items.length * 0.2, 0.92);
  return { colorHex, foamHex, levelScale, hasLiquid, hasIce };
}

function syncBlenderChunks3D(items, blended) {
  while (blenderChunksGroup.children.length > 0) {
    blenderChunksGroup.remove(blenderChunksGroup.children[0]);
  }
  if (blended || items.length === 0) {
    blenderChunksGroup.visible = false;
    return;
  }
  const solidItems = items.filter((id) => !['milk', 'water', 'sparkling', 'shot', 'vanilla'].includes(id));
  if (solidItems.length === 0) {
    blenderChunksGroup.visible = false;
    return;
  }
  solidItems.forEach((id, idx) => {
    const copies = id === 'ice' ? 3 : 2;
    for (let c = 0; c < copies; c++) {
      let geo;
      if (id === 'strawberry') geo = new THREE.SphereGeometry(0.014, 10, 10);
      else if (id === 'matcha') geo = new THREE.CylinderGeometry(0.018, 0.022, 0.008, 12);
      else geo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
      const col = (INGREDIENT_META[id] && INGREDIENT_META[id].color) || 0xffffff;
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: id === 'ice' ? 0.12 : 0.4,
        transparent: id === 'ice',
        opacity: id === 'ice' ? 0.85 : 1
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = (idx * 2.1 + c * 1.9);
      m.position.set(
        Math.cos(ang) * 0.018,
        Math.min(0.015 + (idx * 0.02 + c * 0.012), 0.10),
        Math.sin(ang) * 0.018
      );
      m.rotation.set(ang * 0.5, ang, 0.3);
      blenderChunksGroup.add(m);
    }
  });
  blenderChunksGroup.visible = true;
}

function computeCupVisuals(craft, recipe) {
  const ing = craft.ingredientsInCup || [];
  const hasChoco = ing.includes('choco');
  const hasMatcha = ing.includes('matcha');
  const hasStrawberry = ing.includes('strawberry');
  const hasMango = ing.includes('mango');
  const hasLemon = ing.includes('lemon');
  const hasGrapefruit = ing.includes('grapefruit');
  const hasYuja = ing.includes('yuja');
  const hasTea = ing.includes('tea');
  const hasVanilla = ing.includes('vanilla');

  const hasMilk = craft.milkPoured;
  const hasWater = craft.waterPoured;
  const hasSparkling = craft.sparklingPoured;
  const hasShot = craft.shotPoured;
  const hasSmoothie = craft.smoothiePoured;

  let rawLevel = 0;
  if (hasSmoothie) rawLevel += 0.88;
  rawLevel += (craft.waterCount || (hasWater ? 1 : 0)) * (recipe && recipe.steps.some((s) => s.target === 'shot') ? 0.58 : 0.82);
  rawLevel += (craft.sparklingCount || (hasSparkling ? 1 : 0)) * 0.78;
  rawLevel += (craft.milkCount || (hasMilk ? 1 : 0)) * (hasShot ? 0.58 : 0.76);
  rawLevel += (craft.shotCount || (hasShot ? 1 : 0)) * 0.28;
  rawLevel += Math.min(ing.length * 0.08, 0.26);

  const overflow = rawLevel > 1.32;
  const level = Math.min(Math.max(rawLevel, 0), 0.94);

  let colorHex = 0x3b2314;
  let foamHex = 0xfef3e2;
  let showFoam = false;

  if (hasSmoothie && !hasShot && !hasWater && !hasMilk) {
    colorHex = craft.smoothieColor || 0xf2849e;
    foamHex = 0xfbcfe8;
    showFoam = true;
  } else if (hasChoco && hasShot && hasMilk) {
    colorHex = 0x5b3420;
    foamHex = 0x9a6b4c;
    showFoam = true;
  } else if (hasChoco && hasMilk) {
    colorHex = 0x6f3e22;
    foamHex = 0x8d5524;
    showFoam = true;
  } else if (hasChoco && hasShot) {
    colorHex = 0x3f2010;
    foamHex = 0x8d5524;
    showFoam = true;
  } else if (hasChoco) {
    colorHex = 0x4e2a14;
  } else if (hasMatcha && hasMilk) {
    colorHex = 0x65a30d;
    foamHex = 0xd9f99d;
    showFoam = true;
  } else if (hasMatcha) {
    colorHex = 0x3f6212;
  } else if (hasStrawberry && hasMilk) {
    colorHex = 0xf4b6c2;
    foamHex = 0xfce7f3;
    showFoam = true;
  } else if (hasStrawberry) {
    colorHex = 0xd94862;
  } else if (hasMango && hasMilk) {
    colorHex = 0xfcd34d;
    foamHex = 0xfef9c3;
    showFoam = true;
  } else if (hasMango) {
    colorHex = 0xf59e0b;
  } else if (hasShot && hasMilk) {
    colorHex = hasVanilla ? 0xc8a47e : 0xb5885c;
    foamHex = 0xf5e6d3;
    showFoam = true;
  } else if (hasShot && hasWater) {
    colorHex = craft.shotQuality === 'good' ? 0x3b2314 : 0x8f6f52;
    foamHex = 0xc68b59;
    showFoam = true;
  } else if (hasShot) {
    colorHex = craft.shotQuality === 'good' ? 0x2b180e : 0x9c7a5b;
    foamHex = 0xc68b59;
    showFoam = true;
  } else if (hasGrapefruit && (hasSparkling || hasWater)) {
    colorHex = 0xfb7185;
  } else if (hasGrapefruit) {
    colorHex = 0xf43f5e;
  } else if (hasYuja && (hasWater || hasSparkling)) {
    colorHex = 0xf4c430;
  } else if (hasYuja) {
    colorHex = 0xeab308;
  } else if (hasLemon && (hasSparkling || hasWater)) {
    colorHex = 0xf7e98e;
  } else if (hasLemon) {
    colorHex = 0xf4d03f;
  } else if (hasTea && (hasWater || hasMilk)) {
    colorHex = hasMilk ? 0xa3c987 : 0x84b868;
  } else if (hasTea) {
    colorHex = 0x7fb069;
  } else if (hasSmoothie) {
    colorHex = craft.smoothieColor || 0xf2849e;
    foamHex = 0xfbcfe8;
    showFoam = true;
  } else if (hasMilk) {
    colorHex = 0xfaf6ee;
    foamHex = 0xffffff;
    showFoam = true;
  } else if (hasWater || hasSparkling) {
    colorHex = 0xd9ecff;
  } else if (hasVanilla) {
    colorHex = 0xfde68a;
  }

  return {
    colorHex,
    foamHex,
    showFoam,
    level,
    overflow,
    isHot: Boolean(craft.isHotDrink && !craft.iceInCup && level > 0.18),
    showFizz: Boolean(hasSparkling && !craft.isHotDrink && level > 0.18)
  };
}

function syncCupToppingsPosition(level) {
  const maxH = drinkGroup.userData.liquidMaxH || 0.145;
  const topY = 0.022 + maxH * Math.max(level, 0.25);
  if (whipGroup.visible) {
    whipGroup.position.y = state.liquidLevel < 0.22 ? 0.025 : topY + 0.008;
  }
  if (drizzleGroup.visible) {
    drizzleGroup.position.y = whipGroup.visible ? whipGroup.position.y + 0.056 : topY + 0.014;
  }
}

function recordMistake(code, msg, emoji = '⚠️') {
  state.craft.mistakes.push({ code, msg });
  playGentleHintSound();
  showGuidance(`${emoji} ${msg}`, emoji, true, true);
  speakKorean(msg);
  renderPracticumStatus();
}

function triggerTraySpill(colorHex, withIce = false) {
  state.craft.spilled = true;
  if (withIce) {
    spillIceGroup.visible = true;
    playIceSound();
  } else {
    spillPuddleMesh.material.color.setHex(colorHex);
    spillPuddleMesh.visible = true;
    playPourSound(0.45, 320, 480);
  }
  renderPracticumStatus();
}

function clearTraySpillAndCup() {
  if (state.busy) return;
  resetDrink();
  showGuidance('🧽 쟁반과 블렌더를 깨끗이 정리하고 새로 준비했어요! 다시 제조해 보세요.', '✨', false);
}

function handlePracticumAction(actionId, extra = {}) {
  const recipe = getCurrentRecipe();
  const craft = state.craft;

  // 3D 믹서기 직접 클릭 시: 이미 갈렸고 아직 안 따랐으면 따르기, 아니면 갈기
  if (actionId === 'blender' && extra.from3D && craft.blended && !craft.smoothiePoured) {
    actionId = 'pour_blender';
  }

  if (actionId === 'cup') {
    state.awaitingTempPick = null;
    if (craft.cupPlaced) {
      showGuidance('이미 컵이 쟁반 위에 올라가 있어요! 바꾸려면 🧽 쟁반 닦기를 눌러요.', '☕', true);
      return;
    }
    const chosenCupType = extra.cupType || null;
    if (!chosenCupType) {
      state.awaitingCupPick = true;
      renderUI();
      showGuidance('어울리는 컵을 직접 골라보세요! (뜨거운 음료는 머그컵/찻잔, 차가운 음료는 투명 유리컵)', '☕', false);
      return;
    }
    state.awaitingCupPick = false;
    craft.cupPlaced = chosenCupType;
    craft.log.push(`cup:${chosenCupType}`);
    if (chosenCupType !== recipe.cupType) {
      const cupNames = { mug: '머그컵', glass: '투명 유리컵', tea: '찻잔' };
      recordMistake(
        'wrong_cup',
        `앗! ${recipe.name}에는 보통 ${cupNames[recipe.cupType]}을 쓰는데 ${cupNames[chosenCupType]}을 놓았어요!`
      );
    }
    executeStep('cup', { skipAdvance: true, cupType: chosenCupType });
    return;
  }

  state.awaitingCupPick = false;
  if (actionId !== 'water' && actionId !== 'milk') {
    state.awaitingTempPick = null;
  }

  if (actionId === 'grinder') {
    if (craft.beansGround) {
      recordMistake('double_grind', '원두를 두 번 갈아서 포터필터에 가루가 넘쳤어요!');
    }
    craft.beansGround = true;
    craft.beansTamped = false;
    craft.log.push('grinder');
    executeStep('grinder', { skipAdvance: true });
    return;
  }

  if (actionId === 'tamper') {
    if (!craft.beansGround) {
      recordMistake('tamp_empty', '아직 원두가 없는데 빈 포터필터를 눌렀어요! 먼저 원두를 갈아야 해요.');
    } else if (craft.beansTamped) {
      recordMistake('double_tamp', '이미 다져진 원두를 또 세게 눌렀어요!');
    } else {
      craft.beansTamped = true;
    }
    craft.log.push('tamper');
    executeStep('tamper', { skipAdvance: true });
    return;
  }

  if (actionId === 'machine') {
    if (craft.shotExtracted) {
      shotOverflowMesh.visible = true;
      recordMistake('shot_overflow', '샷잔이 이미 가득 차 있는데 또 추출해서 커피가 넘쳤어요!', '💦');
    }
    if (!craft.beansGround) {
      craft.shotQuality = 'watery_nobeans';
      craft.shotExtracted = true;
      recordMistake('extract_no_beans', '원두를 갈지 않고 추출해서 맹물 같은 연한 물만 나왔어요!');
    } else if (!craft.beansTamped) {
      craft.shotQuality = 'weak_untamped';
      craft.shotExtracted = true;
      recordMistake('extract_untamped', '탬핑으로 다지지 않아 물이 너무 빨리 빠져 연한 샷이 됐어요!');
    } else {
      craft.shotQuality = 'good';
      craft.shotExtracted = true;
    }
    craft.log.push('machine');
    executeStep('machine', { skipAdvance: true, shotColor: craft.shotQuality === 'good' ? 0x3b2314 : 0xa17c5b });
    return;
  }

  if (actionId === 'shot') {
    if (!craft.shotExtracted) {
      recordMistake('pour_empty_shot', '샷 잔이 비어 있어요! 먼저 커피 머신으로 에스프레소를 추출해야 해요.');
      return;
    }
    const toBlender = state.practicumTarget === 'blender';
    if (toBlender) {
      craft.blenderItems.push('shot');
      craft.blended = false;
      craft.shotExtracted = false;
      craft.log.push('shot_blender');
      if (!recipe.usesBlender) {
        recordMistake('unnecessary_blender', `${recipe.name}은(는) 믹서기를 쓰지 않고 컵에 바로 만드는 음료예요!`);
      } else if (!recipe.steps.some((s) => s.target === 'shot')) {
        recordMistake('wrong_shot', `${recipe.name}에는 에스프레소 샷이 들어가지 않아요!`);
      }
      executeStep('shot', { skipAdvance: true, toBlender: true });
      return;
    }
    if (!craft.cupPlaced) {
      shotLiquidMesh.visible = false;
      craft.shotExtracted = false;
      triggerTraySpill(0x3b2314, false);
      recordMistake('spill_shot', '컵을 놓지 않고 샷을 부어서 쟁반에 커피를 쏟았어요! (행주로 닦아요)', '💦');
      return;
    }
    craft.shotPoured = true;
    craft.shotCount = (craft.shotCount || 0) + 1;
    craft.shotExtracted = false;
    craft.log.push('shot');
    const expectsShot = recipe.steps.some((s) => s.target === 'shot');
    if (!expectsShot) {
      recordMistake('wrong_shot', `${recipe.name}에는 커피 샷이 들어가지 않는데 에스프레소가 섞였어요!`);
    }
    executeStep('shot', { skipAdvance: true });
    return;
  }

  if (actionId === 'ice') {
    const toBlender = state.practicumTarget === 'blender';
    if (toBlender) {
      craft.blenderItems.push('ice');
      craft.blended = false;
      craft.log.push('ice_blender');
      if (!recipe.usesBlender) {
        recordMistake('unnecessary_blender', `${recipe.name}은(는) 얼음을 믹서기로 갈지 않고 컵에 바로 넣어요!`);
      }
      executeStep('ice', { skipAdvance: true, toBlender: true });
      return;
    }
    if (!craft.cupPlaced) {
      triggerTraySpill(0xe0f7ff, true);
      recordMistake('spill_ice', '컵이 없어서 얼음이 쟁반 위로 우르르 굴러떨어졌어요!', '🧊');
      return;
    }
    if (craft.iceInCup) {
      recordMistake('duplicate_ice', '컵에 이미 얼음이 들어있는데 얼음을 또 넣었어요!');
    }
    craft.iceInCup = true;
    craft.iceCount = (craft.iceCount || 0) + 1;
    craft.isHotDrink = false;
    craft.log.push('ice');
    if (recipe.isHot) {
      steamGroup.visible = false;
      recordMistake('ice_in_hot', `따뜻한 ${recipe.name}에 얼음이 들어가 미지근해졌어요!`);
    } else if (recipe.usesBlender && !craft.smoothiePoured) {
      recordMistake('ice_in_cup_smoothie', `${recipe.name}의 얼음은 컵이 아니라 🌀 블렌더에 넣고 갈아야 해요!`);
    }
    executeStep('ice', { skipAdvance: true, toBlender: false });
    return;
  }

  if (actionId === 'water' || actionId === 'milk') {
    const toBlender = state.practicumTarget === 'blender';
    const isWater = actionId === 'water';
    const labelKr = isWater ? '물' : '우유';
    if (toBlender) {
      craft.blenderItems.push(actionId);
      craft.blended = false;
      craft.log.push(`${actionId}_blender`);
      if (!recipe.usesBlender) {
        recordMistake('unnecessary_blender', `${recipe.name}은(는) 믹서기를 쓰지 않고 컵에 바로 부어야 해요!`);
      } else if (!recipe.steps.some((s) => s.target === actionId)) {
        recordMistake(`wrong_${actionId}_blender`, `${recipe.name} 스무디/프라페에는 ${labelKr} 대신 알맞은 재료를 넣어야 해요!`);
      }
      executeStep(actionId, { skipAdvance: true, toBlender: true, temp: 'cold' });
      return;
    }
    if (!craft.cupPlaced) {
      state.awaitingTempPick = null;
      triggerTraySpill(isWater ? 0xbfdbfe : 0xfaf6ee, false);
      recordMistake(`spill_${actionId}`, `컵을 놓지 않고 ${labelKr}를 부어 쟁반에 쏟아졌어요!`, '💦');
      return;
    }
    if (!extra.temp) {
      state.awaitingTempPick = { actionId };
      renderUI();
      showGuidance(`${isWater ? '💧 뜨거운 물과 차가운 물 중 어느 것을 부을까요?' : '🥛 따뜻한 스팀 우유와 차가운 우유 중 어느 것을 부을까요?'}`, isWater ? '💧' : '🥛', false);
      return;
    }
    state.awaitingTempPick = null;
    const chosenTemp = extra.temp;
    if (isWater) {
      craft.waterPoured = true;
      craft.waterTemp = chosenTemp;
      craft.waterCount = (craft.waterCount || 0) + 1;
    } else {
      craft.milkPoured = true;
      craft.milkTemp = chosenTemp;
      craft.milkCount = (craft.milkCount || 0) + 1;
    }
    craft.log.push(`${actionId}:${chosenTemp}`);

    const objParticle = isWater ? '을' : '를';
    const subjParticle = isWater ? '이' : '가';
    if (chosenTemp === 'hot') {
      craft.isHotDrink = true;
      if (craft.iceInCup) {
        craft.iceInCup = false;
        iceGroup.visible = false;
        recordMistake('hot_melted_ice', `얼음 위에 뜨거운 ${labelKr}${objParticle} 부어서 얼음이 녹고 미지근해졌어요!`);
      } else if (!recipe.isHot) {
        recordMistake('hot_in_cold', `시원한 ${recipe.name}에 뜨거운 ${labelKr}${objParticle} 부어서 미지근해졌어요!`);
      }
    } else {
      if (recipe.isHot) {
        craft.isHotDrink = false;
        recordMistake('cold_in_hot', `따뜻한 ${recipe.name}에 차가운 ${labelKr}${objParticle} 부어서 음료가 식어버렸어요!`);
      }
    }

    const expectsThis = recipe.steps.some((s) => s.target === actionId && (!s.toBlender));
    if (!expectsThis) {
      if (isWater && recipe.steps.some((s) => s.target === 'sparkling')) {
        recordMistake('water_instead_sparkling', `${recipe.name}에는 일반 물 대신 🫧 탄산수를 넣어야 톡 쏘고 상큼해요!`);
      } else if (recipe.usesBlender) {
        recordMistake(`cup_${actionId}_in_smoothie`, `${recipe.name}의 ${labelKr}는 컵이 아니라 🌀 블렌더에 넣어야 해요!`);
      } else {
        recordMistake(`wrong_${actionId}`, `${recipe.name}에는 ${labelKr}${subjParticle} 들어가지 않아요!`);
      }
    }
    executeStep(actionId, { skipAdvance: true, toBlender: false, temp: chosenTemp });
    return;
  }

  if (actionId === 'sparkling') {
    const toBlender = state.practicumTarget === 'blender';
    if (toBlender) {
      craft.blenderItems.push('sparkling');
      craft.blended = false;
      craft.log.push('sparkling_blender');
      recordMistake('sparkling_in_blender', '탄산수는 믹서기에 넣고 돌리면 김이 빠져 넘칠 수 있어요!');
      executeStep('sparkling', { skipAdvance: true, toBlender: true });
      return;
    }
    if (!craft.cupPlaced) {
      triggerTraySpill(0xbae6fd, false);
      recordMistake('spill_sparkling', '컵을 놓지 않고 탄산수를 부어 쟁반에 쏟아졌어요!', '💦');
      return;
    }
    craft.sparklingPoured = true;
    craft.sparklingCount = (craft.sparklingCount || 0) + 1;
    craft.isHotDrink = false;
    craft.log.push('sparkling');
    if (recipe.isHot) {
      recordMistake('sparkling_in_hot', `따뜻한 ${recipe.name}에 차가운 탄산수를 넣어 이상해졌어요!`);
    } else if (!recipe.steps.some((s) => s.target === 'sparkling')) {
      recordMistake('wrong_sparkling', `${recipe.name}에는 탄산수가 들어가지 않아요!`);
    }
    executeStep('sparkling', { skipAdvance: true });
    return;
  }

  if (actionId === 'whip') {
    if (state.practicumTarget === 'blender') {
      recordMistake('whip_in_blender', '휘핑크림은 블렌더에 갈지 않고 완성된 음료 위에 올려요!');
      return;
    }
    if (!craft.cupPlaced) {
      triggerTraySpill(0xfffdf8, false);
      recordMistake('spill_whip', '컵이 없어서 휘핑크림을 쟁반에 짜버렸어요!', '💦');
      return;
    }
    if (state.liquidLevel < 0.22) {
      recordMistake('whip_too_early', '음료를 담기 전에 휘핑크림을 먼저 짜서 바닥에 가라앉았어요!');
    }
    craft.whipAdded = true;
    craft.ingredientsInCup.push('whip');
    craft.log.push('whip');
    if (!recipe.steps.some((s) => s.target === 'whip')) {
      recordMistake('wrong_whip', `${recipe.name}에는 휘핑크림이 올라가지 않아요!`);
    }
    executeStep('whip', { skipAdvance: true });
    return;
  }

  if (['strawberry', 'mango', 'lemon', 'grapefruit', 'yuja', 'choco', 'tea', 'matcha', 'vanilla', 'caramel'].includes(actionId)) {
    const meta = INGREDIENT_META[actionId] || { name: actionId, color: 0xffffff };
    const toBlender = state.practicumTarget === 'blender';
    if (toBlender) {
      craft.blenderItems.push(actionId);
      craft.blended = false;
      craft.log.push(`${actionId}_blender`);
      if (actionId === 'tea') {
        recordMistake('tea_in_blender', '녹차 티백은 믹서기에 갈지 않고 따뜻한 물에 우려내야 해요!');
      } else if (!recipe.usesBlender) {
        recordMistake('unnecessary_blender', `${recipe.name}은(는) 믹서기를 쓰지 않고 컵에 바로 넣어요!`);
      } else if (!recipe.steps.some((s) => s.target === actionId)) {
        recordMistake(`wrong_${actionId}`, `${recipe.name}에는 ${meta.name}이(가) 들어가지 않아요!`);
      }
      executeStep(actionId, { skipAdvance: true, toBlender: true });
      return;
    }

    if (!craft.cupPlaced) {
      triggerTraySpill(meta.color, false);
      recordMistake(`spill_${actionId}`, `컵이 없어서 ${meta.name}이(가) 쟁반에 떨어졌어요!`, '💦');
      return;
    }
    if (actionId === 'caramel') {
      if (state.liquidLevel < 0.22) {
        recordMistake('caramel_too_early', '카라멜 소스는 음료를 채운 뒤 맨 위에 뿌려야 예쁜 드리즐이 돼요!');
      }
      craft.caramelAdded = true;
    }
    craft.ingredientsInCup.push(actionId);
    craft.log.push(actionId);
    if (!recipe.steps.some((s) => s.target === actionId)) {
      if (['lemon', 'grapefruit', 'yuja'].includes(actionId) && craft.milkPoured) {
        recordMistake('citrus_milk', `우유에 상큼한 ${meta.name}을(를) 넣어서 몽글몽글 뭉쳐버렸어요!`);
      } else {
        recordMistake(`wrong_${actionId}`, `${recipe.name}에는 ${meta.name}이(가) 들어가지 않아요!`);
      }
    } else if (recipe.usesBlender && !craft.smoothiePoured) {
      recordMistake(`cup_${actionId}_in_smoothie`, `${recipe.name}의 ${meta.name}은(는) 컵이 아니라 🌀 블렌더에 넣고 갈아야 해요!`);
    }
    executeStep(actionId, { skipAdvance: true });
    return;
  }

  if (actionId === 'blender') {
    if (craft.blenderItems.length === 0) {
      recordMistake('empty_blender', '믹서기가 텅 비어 있어요! 우유나 물, 얼음, 과일을 먼저 넣고 갈아야 해요.');
      playBlenderSound();
      const baseZ = blenderModel.position.z;
      const s0 = performance.now();
      const shakeEmpty = (now) => {
        const t = (now - s0) / 360;
        if (t < 1) {
          blenderModel.position.z = baseZ + Math.sin(t * 42) * 0.006;
          requestAnimationFrame(shakeEmpty);
        } else {
          blenderModel.position.z = baseZ;
        }
      };
      requestAnimationFrame(shakeEmpty);
      return;
    }
    const vis = computeBlenderVisuals(craft.blenderItems, true);
    if (!vis.hasLiquid) {
      recordMistake('dry_blender', '우유(액체) 없이 얼음/재료만 갈려다 칼날이 거칠게 헛돌았어요! 액체를 꼭 함께 넣어요.');
    }
    if (recipe.usesBlender && !vis.hasIce) {
      recordMistake('no_ice_blender', '얼음 없이 갈아서 시원하고 걸쭉한 스무디/프라페가 되지 않았어요!');
    }
    if (!recipe.usesBlender) {
      recordMistake('unnecessary_blender', `${recipe.name}은(는) 믹서기를 돌릴 필요가 없는 음료예요!`);
    }
    craft.blended = true;
    craft.log.push('blender');
    executeStep('blender', { skipAdvance: true });
    return;
  }

  if (actionId === 'pour_blender') {
    if (craft.blenderItems.length === 0) {
      recordMistake('pour_empty_blender', '믹서기 안에 담긴 재료가 없어요!');
      return;
    }
    const vis = computeBlenderVisuals(craft.blenderItems, craft.blended);
    if (!craft.cupPlaced) {
      blenderMixMesh.visible = false;
      blenderChunksGroup.visible = false;
      while (blenderChunksGroup.children.length > 0) blenderChunksGroup.remove(blenderChunksGroup.children[0]);
      if (!craft.blended && vis.hasIce && !vis.hasLiquid) {
        triggerTraySpill(0xdbeafe, true);
      } else {
        triggerTraySpill(vis.colorHex, false);
      }
      craft.blenderItems = [];
      craft.blended = false;
      recordMistake('spill_smoothie', '컵을 놓지 않고 믹서기 음료를 따라 쟁반에 쏟아졌어요!', '💦');
      return;
    }
    if (!craft.blended) {
      recordMistake('pour_unblended', '블렌더로 갈지 않고 부어서 얼음과 재료 덩어리가 그대로 컵에 떨어졌어요!');
      // 갈지 않고 부은 경우에도 3D로 덩어리가 컵에 들어가도록 반영
      if (craft.blenderItems.includes('ice')) craft.iceInCup = true;
      craft.blenderItems.forEach((it) => {
        if (['strawberry', 'mango', 'lemon', 'grapefruit', 'yuja', 'choco', 'matcha'].includes(it)) {
          craft.ingredientsInCup.push(it);
        }
      });
    }
    craft.smoothiePoured = true;
    craft.smoothieColor = vis.colorHex;
    craft.smoothieIngredients = [...craft.blenderItems];
    if (craft.blenderItems.includes('milk')) craft.milkCount = Math.max(craft.milkCount, 0);
    craft.blenderItems = [];
    craft.blended = false;
    state.practicumTarget = 'cup';
    craft.log.push('pour_blender');
    if (!recipe.usesBlender) {
      recordMistake('wrong_smoothie_in_cup', `${recipe.name}에는 블렌더에서 갈아 만든 음료를 붓지 않아요!`);
    }
    executeStep('pour_blender', { skipAdvance: true, pourColor: vis.colorHex, foamColor: vis.foamHex });
    return;
  }

  if (actionId === 'serve') {
    if (!craft.cupPlaced) {
      recordMistake('serve_no_cup', '아직 컵이 없어서 손님께 드릴 수 없어요! 컵을 먼저 놓아보세요.');
      return;
    }
    executeStep('serve', { skipAdvance: true, isPracticumServe: true });
  }
}

function evaluatePracticumDrink(recipe) {
  const c = state.craft;
  const checks = [];
  let issues = c.mistakes.length;

  // 1. 컵 확인
  const cupNames = { mug: '머그컵', glass: '투명 유리컵', tea: '찻잔' };
  if (c.cupPlaced === recipe.cupType) {
    checks.push({ ok: true, text: `알맞은 ${cupNames[recipe.cupType]}에 예쁘게 담았어요.` });
  } else {
    checks.push({ ok: false, text: `${cupNames[recipe.cupType]} 대신 ${cupNames[c.cupPlaced] || '다른 컵'}을 사용했어요.` });
    issues++;
  }

  // 2. 온도 확인 (뜨거운 음료 vs 차가운 음료)
  if (recipe.isHot) {
    if (!c.iceInCup && c.isHotDrink) {
      checks.push({ ok: true, text: '따뜻한 온도를 알맞게 유지했어요.' });
    } else {
      checks.push({ ok: false, text: '따뜻한 음료인데 온도가 차갑거나 식었어요!' });
      issues++;
    }
  } else {
    if (!c.isHotDrink) {
      checks.push({ ok: true, text: '시원한 음료 온도에 맞게 만들었어요.' });
    } else {
      checks.push({ ok: false, text: '차가운 음료인데 뜨거운 물/우유가 들어갔어요!' });
      issues++;
    }
  }

  // 3. 레시피별 필수 단계/재료 확인 (데이터 기반 범용 검사)
  const stepTargets = recipe.steps.map((s) => s.target);
  const blenderSource = c.smoothiePoured ? c.smoothieIngredients : c.blenderItems;

  if (stepTargets.includes('shot')) {
    if (c.shotPoured && c.shotQuality === 'good') {
      checks.push({ ok: true, text: '원두 갈기 → 탬핑 → 추출 순서로 진한 샷을 잘 내렸어요.' });
    } else if (!c.shotPoured) {
      checks.push({ ok: false, text: '에스프레소 샷이 음료에 들어가지 않았어요!' });
      issues++;
    }
  }

  if (stepTargets.includes('ice')) {
    const hasIce = recipe.usesBlender ? blenderSource.includes('ice') : c.iceInCup;
    if (hasIce) checks.push({ ok: true, text: '시원한 얼음을 알맞게 넣었어요.' });
    else { checks.push({ ok: false, text: '시원한 얼음이 빠졌어요!' }); issues++; }
  }

  if (stepTargets.includes('water')) {
    if (c.waterPoured) checks.push({ ok: true, text: '물의 양과 온도를 알맞게 채웠어요.' });
    else { checks.push({ ok: false, text: '물을 붓지 않았어요!' }); issues++; }
  }

  if (stepTargets.includes('sparkling')) {
    if (c.sparklingPoured) checks.push({ ok: true, text: '톡 쏘는 탄산수를 알맞게 부었어요.' });
    else { checks.push({ ok: false, text: '탄산수가 빠졌어요!' }); issues++; }
  }

  if (stepTargets.includes('milk')) {
    const hasMilk = recipe.usesBlender ? blenderSource.includes('milk') : c.milkPoured;
    if (hasMilk) checks.push({ ok: true, text: '우유를 알맞게 넣었어요.' });
    else { checks.push({ ok: false, text: '우유가 빠졌어요!' }); issues++; }
  }

  ['strawberry', 'mango', 'lemon', 'grapefruit', 'yuja', 'choco', 'tea', 'matcha', 'vanilla', 'caramel', 'whip'].forEach((ing) => {
    if (stepTargets.includes(ing)) {
      const stepObj = recipe.steps.find((s) => s.target === ing);
      const ok = (recipe.usesBlender && stepObj && stepObj.toBlender)
        ? blenderSource.includes(ing)
        : c.ingredientsInCup.includes(ing);
      const n = (INGREDIENT_META[ing] && INGREDIENT_META[ing].name) || ing;
      if (ok) checks.push({ ok: true, text: `${n} 재료를 빠짐없이 넣었어요.` });
      else { checks.push({ ok: false, text: `${n} 재료가 빠졌어요!` }); issues++; }
    }
  });

  if (stepTargets.includes('pour_blender')) {
    if (c.smoothiePoured && !c.mistakes.some((m) => m.code === 'pour_unblended')) {
      checks.push({ ok: true, text: '블렌더로 곱게 갈아 컵에 잘 따랐어요.' });
    } else {
      checks.push({ ok: false, text: '블렌더로 갈아 컵에 따르는 과정이 완성되지 않았어요!' });
      issues++;
    }
  }

  // 4. 실습 중 발생한 실수 내역 추가
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

function addCupTopping(kind) {
  if (kind === 'lemon' || kind === 'grapefruit') {
    const col = kind === 'lemon' ? 0xf7dc6f : 0xfb7185;
    const slice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.01, 18),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
    );
    slice.position.set(0.012, 0.085, 0.008);
    slice.rotation.set(0.45, 0.2, 0.35);
    cupToppingGroup.add(slice);
  } else if (kind === 'strawberry' || kind === 'mango') {
    const col = kind === 'strawberry' ? 0xd9385a : 0xf59e0b;
    for (let i = 0; i < 3; i++) {
      const piece = new THREE.Mesh(
        kind === 'strawberry' ? new THREE.SphereGeometry(0.017, 12, 12) : new THREE.BoxGeometry(0.022, 0.022, 0.022),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.38 })
      );
      piece.position.set((i - 1) * 0.022, 0.035 + (i % 2) * 0.014, (i % 2 === 0 ? 0.012 : -0.012));
      cupToppingGroup.add(piece);
    }
  } else if (kind === 'yuja') {
    for (let i = 0; i < 4; i++) {
      const peel = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.008, 0.012),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
      );
      peel.position.set((i - 1.5) * 0.014, 0.03 + (i % 2) * 0.018, (i % 2 ? 0.01 : -0.01));
      peel.rotation.set(0.3 * i, 0.6 * i, 0.2);
      cupToppingGroup.add(peel);
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
  } else if (kind === 'matcha') {
    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.018, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 })
    );
    mound.position.set(0, 0.032, 0);
    cupToppingGroup.add(mound);
  }
  cupToppingGroup.visible = true;
}

function animateDropIntoTarget(kind, targetPos, onDone) {
  while (fallingItemGroup.children.length > 0) {
    fallingItemGroup.remove(fallingItemGroup.children[0]);
  }
  const meta = INGREDIENT_META[kind] || { color: 0xffffff };
  const count = (kind === 'tea' || kind === 'lemon' || kind === 'grapefruit') ? 1 : 3;
  for (let i = 0; i < count; i++) {
    let geo;
    if (kind === 'lemon' || kind === 'grapefruit') geo = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16);
    else if (kind === 'strawberry') geo = new THREE.SphereGeometry(0.02, 12, 12);
    else if (kind === 'tea') geo = new THREE.BoxGeometry(0.034, 0.038, 0.012);
    else if (kind === 'matcha') geo = new THREE.ConeGeometry(0.018, 0.016, 10);
    else geo = new THREE.BoxGeometry(0.024, 0.022, 0.024);
    const mat = new THREE.MeshStandardMaterial({
      color: meta.color,
      roughness: kind === 'ice' ? 0.15 : 0.42,
      transparent: kind === 'ice',
      opacity: kind === 'ice' ? 0.82 : 1
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set((i - (count - 1) / 2) * 0.026, i * 0.018, 0);
    m.rotation.set(i * 0.4, i * 0.5, 0.3);
    fallingItemGroup.add(m);
  }
  fallingItemGroup.visible = true;
  const startPos = new THREE.Vector3(targetPos.x, targetPos.y + 0.34, targetPos.z);
  const endPos = new THREE.Vector3(targetPos.x, targetPos.y + 0.04, targetPos.z);
  const start = performance.now();
  const dur = 440;
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

function animateBlenderFill(hexColor, targetScaleY, onDone, showStream = true, streamColor = null) {
  const startY = blenderMixMesh.visible ? blenderMixMesh.scale.y : 0.01;
  const endY = Math.max(startY, targetScaleY);
  if (showStream) {
    pourStream.material.color.setHex(streamColor || hexColor);
    pourStream.position.set(blenderJarBounds.x, COUNTER_Y + 0.36, blenderJarBounds.z);
    pourStream.visible = true;
  }
  blenderMixMesh.visible = true;
  blenderMixMesh.material.color.setHex(hexColor);
  const start = performance.now();
  const dur = 480;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const cur = startY + (endY - startY) * t;
    blenderMixMesh.scale.y = Math.max(cur, 0.01);
    blenderMixMesh.position.y = blenderJarBounds.baseY + (blenderJarBounds.height * cur) / 2;
    if (t < 1) requestAnimationFrame(tick);
    else {
      pourStream.visible = false;
      spawn3DSparkles(new THREE.Vector3(blenderJarBounds.x, blenderJarBounds.baseY + blenderJarBounds.height * 0.7, blenderJarBounds.z), 10, hexColor);
      onDone();
    }
  }
  requestAnimationFrame(tick);
}

function configureCupLiquidProfile(cupType) {
  const profiles = {
    mug: { xz: 0.92, maxH: 0.135 },
    tea: { xz: 0.88, maxH: 0.12 },
    glass: { xz: 0.98, maxH: 0.155 }
  };
  const profile = profiles[cupType] || profiles.glass;
  drinkGroup.userData.liquidMaxH = profile.maxH;
  liquidMesh.scale.x = profile.xz;
  liquidMesh.scale.z = profile.xz;
  foamCapMesh.scale.set(profile.xz, 1, profile.xz);
}

function applyComputedCupVisuals(craft, recipe, streamColor, finishCb, skipAudio = false) {
  const vis = computeCupVisuals(craft, recipe);
  if (vis.overflow && state.practiceMode === 'practicum') {
    triggerTraySpill(vis.colorHex, false);
    recordMistake('cup_overflow', '컵이 가득 차서 음료가 쟁반으로 넘쳐흘렀어요!', '💦');
  }
  animatePour(vis.colorHex, vis.level, () => {
    foamCapMesh.material.color.setHex(vis.foamHex);
    foamCapMesh.visible = vis.showFoam && vis.level > 0.15;
    steamGroup.visible = vis.isHot;
    fizzGroup.visible = vis.showFizz;
    iceGroup.visible = craft.iceInCup;
    syncCupToppingsPosition(vis.level);
    finishCb();
  }, skipAudio, streamColor);
}

function executeStep(actionId, opts = {}) {
  state.busy = true;
  const recipe = getCurrentRecipe();
  const craft = state.craft;
  const isGuided = state.practiceMode !== 'practicum';
  const curStep = opts.step || null;

  // 자동/수동 연습에서도 3D 계산을 위해 state.craft 동기화
  if (isGuided) {
    if (actionId === 'cup') craft.cupPlaced = opts.cupType || recipe.cupType;
    else if (actionId === 'grinder') craft.beansGround = true;
    else if (actionId === 'tamper') craft.beansTamped = true;
    else if (actionId === 'machine') { craft.shotExtracted = true; craft.shotQuality = 'good'; }
    else if (actionId === 'shot') { craft.shotPoured = true; craft.shotCount++; craft.shotExtracted = false; }
    else if (actionId === 'ice') {
      const toB = opts.toBlender !== undefined ? opts.toBlender : Boolean((curStep && curStep.toBlender) || recipe.usesBlender);
      if (toB) craft.blenderItems.push('ice');
      else { craft.iceInCup = true; craft.iceCount++; }
    } else if (actionId === 'water') {
      const temp = (curStep && curStep.temp) || (recipe.isHot ? 'hot' : 'cold');
      craft.waterPoured = true; craft.waterTemp = temp; craft.waterCount++;
      if (temp === 'hot') craft.isHotDrink = true;
    } else if (actionId === 'sparkling') {
      craft.sparklingPoured = true; craft.sparklingCount++;
    } else if (actionId === 'milk') {
      const toB = opts.toBlender !== undefined ? opts.toBlender : Boolean((curStep && curStep.toBlender) || (recipe.usesBlender && !craft.smoothiePoured));
      const temp = (curStep && curStep.temp) || (recipe.isHot ? 'hot' : 'cold');
      if (toB) craft.blenderItems.push('milk');
      else {
        craft.milkPoured = true; craft.milkTemp = temp; craft.milkCount++;
        if (temp === 'hot') craft.isHotDrink = true;
      }
    } else if (['strawberry', 'mango', 'lemon', 'grapefruit', 'yuja', 'choco', 'tea', 'matcha', 'vanilla', 'caramel', 'whip'].includes(actionId)) {
      const toB = opts.toBlender !== undefined ? opts.toBlender : Boolean(curStep && curStep.toBlender);
      if (toB) craft.blenderItems.push(actionId);
      else {
        craft.ingredientsInCup.push(actionId);
        if (actionId === 'whip') craft.whipAdded = true;
        if (actionId === 'caramel') craft.caramelAdded = true;
      }
    } else if (actionId === 'blender') {
      craft.blended = true;
    } else if (actionId === 'pour_blender') {
      const bv = computeBlenderVisuals(craft.blenderItems, true);
      craft.smoothiePoured = true;
      craft.smoothieColor = bv.colorHex;
      craft.smoothieIngredients = [...craft.blenderItems];
      craft.blenderItems = [];
      craft.blended = false;
    }
  }

  const finishStep = () => {
    state.busy = false;
    if (opts.skipAdvance) {
      if (opts.isPracticumServe) {
        const evalRes = evaluatePracticumDrink(recipe);
        state.completedCount++;
        saveCafeCount(state.completedCount);
        recordMadeDrink(state.recipeKey, recipe, evalRes.stars);
        const orderMsg = completeActiveKioskOrderItem(state.recipeKey);
        if (window.D1Bridge) {
          window.D1Bridge.saveRecord({
            game: 'cafe',
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
          window.D1Bridge.setKV(CAFE_COUNT_KEY, state.completedCount);
        }
        spawn3DSparkles(new THREE.Vector3(0, COUNTER_Y + 0.18, 0.28), evalRes.stars === 3 ? 26 : 12, 0xfbbf24);
        playSuccessChime();
        speakKorean(evalRes.stars === 3 ? `${recipe.name} 완벽하게 제조했어요!` : `${recipe.name} 제조를 마쳤어요. 결과를 살펴봐요.`);
        showCompletionModal(recipe, evalRes, orderMsg);
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
      saveCafeCount(state.completedCount);
      recordMadeDrink(state.recipeKey, recipe, 3);
      const orderMsg = completeActiveKioskOrderItem(state.recipeKey);
      if (window.D1Bridge) {
        window.D1Bridge.saveRecord({
          game: 'cafe',
          stage: recipe.name,
          score: state.completedCount,
          summary: `${recipe.name} 완성 (${state.practiceMode} · 누적 ${state.completedCount}잔)`,
          payload: {
            mode: state.practiceMode,
            recipeKey: state.recipeKey,
            recipeName: recipe.name,
            steps: recipe.steps.length,
            completedCount: state.completedCount
          }
        });
        window.D1Bridge.setKV(CAFE_COUNT_KEY, state.completedCount);
      }
      spawn3DSparkles(new THREE.Vector3(0, COUNTER_Y + 0.18, 0.28), 26, 0xfbbf24);
      playSuccessChime();
      speakKorean(`${recipe.name}가 완성되었어요! 정말 잘했어요.`);
      showCompletionModal(recipe, null, orderMsg);
    } else {
      playSoftTone(659.25, 0.11, 'sine', 0.04);
      if (state.practiceMode === 'manual') {
        state.awaitingNextChoice = true;
        state.manualChoices = buildManualChoices(recipe, state.stepIndex);
      }
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
        spawn3DSparkles(new THREE.Vector3(-1.26, COUNTER_Y + 0.22, -0.10), 10, 0xd97706);
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
        spawn3DSparkles(new THREE.Vector3(-0.98, COUNTER_Y + 0.12, 0.24), 10, 0xf59e0b);
        finishStep();
      }
    };
    requestAnimationFrame(animTamp);
  } else if (actionId === 'machine') {
    playMachineSound();
    portafilterCoffee.visible = false;
    shotLiquidMesh.visible = true;
    shotLiquidMesh.scale.y = 0.05;
    if (machineLedMat) {
      machineLedMat.color.setHex(0xf97316);
      machineLedMat.emissive.setHex(0xea580c);
      machineLedMat.emissiveIntensity = 1.5;
    }
    const moveStart = performance.now();
    const slideToSpout = (now) => {
      const mt = Math.min((now - moveStart) / 180, 1);
      shotGlassGroup.position.lerpVectors(SHOT_HOME_POS, MACHINE_SPOUT_POS, mt);
      if (mt < 1) {
        requestAnimationFrame(slideToSpout);
        return;
      }
      pourStream.material.color.setHex(opts.shotColor || 0x3b2314);
      pourStream.position.set(MACHINE_SPOUT_POS.x, COUNTER_Y + 0.16, MACHINE_SPOUT_POS.z);
      pourStream.visible = true;
      shotLiquidMesh.material.color.setHex(opts.shotColor || 0x3b2314);
      const start = performance.now();
      const animExtract = (n2) => {
        const t = Math.min((n2 - start) / 680, 1);
        shotLiquidMesh.scale.y = Math.max(t, 0.05);
        shotLiquidMesh.position.y = 0.012 + 0.024 * t;
        if (t < 1) {
          requestAnimationFrame(animExtract);
        } else {
          pourStream.visible = false;
          if (machineLedMat) {
            machineLedMat.color.setHex(0x22c55e);
            machineLedMat.emissive.setHex(0x16a34a);
            machineLedMat.emissiveIntensity = 0.8;
          }
          const backStart = performance.now();
          const slideBack = (n3) => {
            const bt = Math.min((n3 - backStart) / 180, 1);
            shotGlassGroup.position.lerpVectors(MACHINE_SPOUT_POS, SHOT_HOME_POS, bt);
            if (bt < 1) requestAnimationFrame(slideBack);
            else {
              shotGlassGroup.position.copy(SHOT_HOME_POS);
              spawn3DSparkles(new THREE.Vector3(SHOT_HOME_POS.x, COUNTER_Y + 0.08, SHOT_HOME_POS.z), 12, 0x92400e);
              finishStep();
            }
          };
          requestAnimationFrame(slideBack);
        }
      };
      requestAnimationFrame(animExtract);
    };
    requestAnimationFrame(slideToSpout);
  } else if (actionId === 'shot') {
    const toBlender = Boolean(opts.toBlender);
    focusPrepActionCamera(toBlender);
    playPourSound(0.7, 500, 960);
    const originPos = shotGlassGroup.position.clone();
    const targetDest = toBlender
      ? new THREE.Vector3(blenderJarBounds.x - 0.06, COUNTER_Y + 0.36, blenderJarBounds.z)
      : new THREE.Vector3(PREP_POS.x - 0.07, COUNTER_Y + 0.28, PREP_POS.z);
    const startMove = performance.now();
    const moveShot = (now) => {
      const t = Math.min((now - startMove) / 220, 1);
      shotGlassGroup.position.lerpVectors(originPos, targetDest, t);
      shotGlassGroup.rotation.z = -t * 0.65;
      if (t < 1) {
        requestAnimationFrame(moveShot);
      } else {
        shotLiquidMesh.visible = false;
        const shotCol = craft.shotQuality === 'good' ? 0x3b2314 : 0x9c7a5b;
        const afterPour = () => {
          const backStart = performance.now();
          const returnShot = (n2) => {
            const bt = Math.min((n2 - backStart) / 220, 1);
            shotGlassGroup.position.lerpVectors(targetDest, originPos, bt);
            shotGlassGroup.rotation.z = -(1 - bt) * 0.65;
            if (bt < 1) requestAnimationFrame(returnShot);
            else {
              shotGlassGroup.position.copy(originPos);
              shotGlassGroup.rotation.z = 0;
              finishStep();
            }
          };
          requestAnimationFrame(returnShot);
        };
        if (toBlender) {
          const bv = computeBlenderVisuals(craft.blenderItems, false);
          syncBlenderChunks3D(craft.blenderItems, false);
          animateBlenderFill(bv.colorHex, bv.levelScale, afterPour, true, shotCol);
        } else {
          applyComputedCupVisuals(craft, recipe, shotCol, afterPour, true);
        }
      }
    };
    requestAnimationFrame(moveShot);
  } else if (actionId === 'cup') {
    focusPrepActionCamera(false);
    const placedType = opts.cupType || recipe.cupType;
    playCupPlaceSound(placedType);
    drinkGroup.visible = true;
    drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
    activeCupModels.mug.visible = placedType === 'mug';
    activeCupModels.glass.visible = placedType === 'glass';
    activeCupModels.tea.visible = placedType === 'tea';
    configureCupLiquidProfile(placedType);
    liquidMesh.visible = false;
    foamCapMesh.visible = false;
    iceGroup.visible = false;
    steamGroup.visible = false;
    fizzGroup.visible = false;
    whipGroup.visible = false;
    drizzleGroup.visible = false;
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
        spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.14, PREP_POS.z), 10, 0x38bdf8);
        finishStep();
      }
    };
    requestAnimationFrame(animCup);
  } else if (actionId === 'ice') {
    const toBlender = opts.toBlender !== undefined ? opts.toBlender : Boolean((curStep && curStep.toBlender) || recipe.usesBlender);
    focusPrepActionCamera(toBlender);
    playIceSound();
    if (toBlender) {
      animateDropIntoTarget('ice', new THREE.Vector3(blenderJarBounds.x, COUNTER_Y + 0.28, blenderJarBounds.z), () => {
        const bv = computeBlenderVisuals(craft.blenderItems, false);
        syncBlenderChunks3D(craft.blenderItems, false);
        animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, false);
      });
    } else {
      iceGroup.visible = true;
      state.hasIce = true;
      steamGroup.visible = false;
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
          spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.16, PREP_POS.z), 10, 0x7dd3fc);
          finishStep();
        }
      };
      requestAnimationFrame(animIce);
    }
  } else if (['strawberry', 'mango', 'lemon', 'grapefruit', 'yuja', 'choco', 'tea', 'matcha'].includes(actionId)) {
    const toBlender = opts.toBlender !== undefined ? opts.toBlender : Boolean(curStep && curStep.toBlender);
    focusPrepActionCamera(toBlender);
    playIngredientSound(actionId);
    if (toBlender) {
      animateDropIntoTarget(actionId, new THREE.Vector3(blenderJarBounds.x, COUNTER_Y + 0.28, blenderJarBounds.z), () => {
        const bv = computeBlenderVisuals(craft.blenderItems, false);
        syncBlenderChunks3D(craft.blenderItems, false);
        animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, false);
      });
    } else {
      animateDropIntoTarget(actionId, new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.08, PREP_POS.z), () => {
        addCupTopping(actionId);
        const meta = INGREDIENT_META[actionId] || { color: 0xffffff };
        applyComputedCupVisuals(craft, recipe, meta.color, finishStep, true);
      });
    }
  } else if (actionId === 'vanilla' || actionId === 'caramel') {
    const toBlender = opts.toBlender !== undefined ? opts.toBlender : Boolean(curStep && curStep.toBlender);
    focusPrepActionCamera(toBlender);
    playIngredientSound(actionId);
    const meta = INGREDIENT_META[actionId];
    if (toBlender) {
      const bv = computeBlenderVisuals(craft.blenderItems, false);
      syncBlenderChunks3D(craft.blenderItems, false);
      animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, true, meta.color);
    } else if (actionId === 'caramel') {
      pourStream.material.color.setHex(meta.color);
      pourStream.position.set(PREP_POS.x, COUNTER_Y + 0.28, PREP_POS.z);
      pourStream.visible = true;
      setTimeout(() => {
        pourStream.visible = false;
        drizzleGroup.visible = true;
        syncCupToppingsPosition(state.liquidLevel);
        spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.18, PREP_POS.z), 12, meta.color);
        finishStep();
      }, 420);
    } else {
      applyComputedCupVisuals(craft, recipe, meta.color, finishStep, true);
    }
  } else if (actionId === 'whip') {
    focusPrepActionCamera(false);
    playWhipSound();
    whipGroup.visible = true;
    syncCupToppingsPosition(state.liquidLevel);
    whipGroup.scale.set(0.2, 0.2, 0.2);
    const start = performance.now();
    const animWhip = (now) => {
      const t = Math.min((now - start) / 420, 1);
      const ease = 1 + 1.6 * Math.pow(t - 1, 3) + 0.8 * Math.pow(t - 1, 2);
      const s = Math.min(Math.max(ease, 0.2), 1.08);
      whipGroup.scale.set(s, s, s);
      if (t < 1) requestAnimationFrame(animWhip);
      else {
        whipGroup.scale.set(1, 1, 1);
        syncCupToppingsPosition(state.liquidLevel);
        spawn3DSparkles(new THREE.Vector3(PREP_POS.x, COUNTER_Y + 0.22, PREP_POS.z), 12, 0xffffff);
        finishStep();
      }
    };
    requestAnimationFrame(animWhip);
  } else if (actionId === 'milk') {
    const toBlender = opts.toBlender !== undefined ? opts.toBlender : Boolean((curStep && curStep.toBlender) || (recipe.usesBlender && !craft.smoothiePoured));
    focusPrepActionCamera(toBlender);
    playPourSound(0.66, 480, 920);
    if (toBlender) {
      const bv = computeBlenderVisuals(craft.blenderItems, false);
      syncBlenderChunks3D(craft.blenderItems, false);
      animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, true, 0xfaf6ee);
    } else {
      applyComputedCupVisuals(craft, recipe, 0xfaf6ee, finishStep, true);
    }
  } else if (actionId === 'water') {
    const toBlender = Boolean(opts.toBlender);
    focusPrepActionCamera(toBlender);
    playPourSound(0.7, 560, 1120);
    if (toBlender) {
      const bv = computeBlenderVisuals(craft.blenderItems, false);
      syncBlenderChunks3D(craft.blenderItems, false);
      animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, true, 0xd9ecff);
    } else {
      applyComputedCupVisuals(craft, recipe, 0xd9ecff, finishStep, true);
    }
  } else if (actionId === 'sparkling') {
    const toBlender = Boolean(opts.toBlender);
    focusPrepActionCamera(toBlender);
    playSparklingSound();
    if (toBlender) {
      const bv = computeBlenderVisuals(craft.blenderItems, false);
      syncBlenderChunks3D(craft.blenderItems, false);
      animateBlenderFill(bv.colorHex, bv.levelScale, finishStep, true, 0xbae6fd);
    } else {
      applyComputedCupVisuals(craft, recipe, 0xbae6fd, finishStep, true);
    }
  } else if (actionId === 'blender') {
    focusPrepActionCamera(true);
    playBlenderSound();
    const baseZ = blenderModel.position.z;
    const start = performance.now();
    const bv = computeBlenderVisuals(craft.blenderItems, true);
    blenderMixMesh.visible = true;
    blenderMixMesh.material.color.setHex(bv.colorHex);
    if (blenderMixMesh.scale.y < bv.levelScale) {
      blenderMixMesh.scale.y = bv.levelScale;
      blenderMixMesh.position.y = blenderJarBounds.baseY + (blenderJarBounds.height * bv.levelScale) / 2;
    }
    const animBlend = (now) => {
      const t = (now - start) / 820;
      if (t < 1) {
        blenderModel.position.z = baseZ + Math.sin(t * 52) * 0.008;
        blenderMixMesh.rotation.y += 0.36;
        blenderMixMesh.scale.x = 1 + Math.sin(t * 28) * 0.06;
        blenderMixMesh.scale.z = 1 + Math.cos(t * 28) * 0.06;
        if (blenderChunksGroup.visible) {
          blenderChunksGroup.rotation.y += 0.48;
          const shrink = Math.max(1 - t * 1.15, 0.05);
          blenderChunksGroup.scale.set(shrink, shrink, shrink);
        }
        requestAnimationFrame(animBlend);
      } else {
        blenderModel.position.z = baseZ;
        blenderMixMesh.scale.x = 1;
        blenderMixMesh.scale.z = 1;
        blenderChunksGroup.rotation.y = 0;
        blenderChunksGroup.scale.set(1, 1, 1);
        syncBlenderChunks3D(craft.blenderItems, true);
        spawn3DSparkles(new THREE.Vector3(blenderJarBounds.x, blenderJarBounds.baseY + blenderJarBounds.height * 0.85, blenderJarBounds.z), 14, bv.colorHex);
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
      blenderMixMesh.position.y = blenderJarBounds.baseY + (blenderJarBounds.height * cur) / 2;
      if (t < 1) requestAnimationFrame(animEmpty);
      else {
        blenderMixMesh.visible = false;
        syncBlenderChunks3D([], true);
      }
    };
    requestAnimationFrame(animEmpty);
    const streamCol = opts.pourColor || craft.smoothieColor || 0xf2849e;
    applyComputedCupVisuals(craft, recipe, streamCol, finishStep, true);
  } else if (actionId === 'serve') {
    playServeBell();
    const startPos = drinkGroup.position.clone();
    const servePos = new THREE.Vector3(0, COUNTER_Y + 0.04, 0.30);
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
        spawn3DSparkles(new THREE.Vector3(servePos.x, COUNTER_Y + 0.16, servePos.z), 16, 0xfbbf24);
        finishStep();
      }
    };
    requestAnimationFrame(animServe);
  }
}

function animatePour(hexColor, targetLevel, onDone, skipAudio = false, streamColor = null) {
  if (!skipAudio) playPourSound(0.68, 520, 1020);
  pourStream.material.color.setHex(streamColor || hexColor);
  pourStream.position.set(PREP_POS.x, COUNTER_Y + 0.28, PREP_POS.z);
  pourStream.visible = true;

  liquidMesh.visible = true;
  liquidMesh.material.color.setHex(hexColor);

  const maxH = drinkGroup.userData.liquidMaxH || 0.145;
  const startLevel = state.liquidLevel;
  const startTime = performance.now();
  const duration = 640;

  function stepAnim(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const cur = startLevel + (targetLevel - startLevel) * t;
    liquidMesh.scale.y = Math.max(cur * (maxH / 0.16), 0.01);
    liquidMesh.position.y = 0.022 + (maxH * cur) / 2;
    if (foamCapMesh.visible) {
      foamCapMesh.position.y = 0.022 + maxH * cur + 0.004;
    }
    syncCupToppingsPosition(cur);
    if (t < 1) {
      requestAnimationFrame(stepAnim);
    } else {
      state.liquidLevel = targetLevel;
      if (foamCapMesh.visible) {
        foamCapMesh.position.y = 0.022 + maxH * targetLevel + 0.004;
      }
      syncCupToppingsPosition(targetLevel);
      pourStream.visible = false;
      onDone();
    }
  }
  requestAnimationFrame(stepAnim);
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
  const cupLabel = { mug: '머그컵', glass: '유리컵', tea: '찻잔' }[c.cupPlaced] || '없음';
  const beanTxt = c.beansGround ? (c.beansTamped ? '갈고 다짐✓' : '갈림(미다짐)') : '안 갈림';
  const shotTxt = c.shotPoured ? '컵에 부음✓' : (c.shotExtracted ? '추출됨' : '대기');
  const blendTxt = c.smoothiePoured
    ? '컵에 따름✓'
    : (c.blenderItems.length > 0 ? (c.blended ? `갈림✓ (${c.blenderItems.length}종)` : `재료 ${c.blenderItems.length}개`) : '비어 있음');

  bar.innerHTML =
    `<div class="prac-dest-group" role="group" aria-label="재료 담는 위치">` +
      `<span class="prac-dest-label">담는 곳</span>` +
      `<button type="button" class="prac-dest-btn ${state.practicumTarget === 'cup' ? 'active' : ''}" data-ptarget="cup">🥛 컵</button>` +
      `<button type="button" class="prac-dest-btn ${state.practicumTarget === 'blender' ? 'active' : ''}" data-ptarget="blender">🌀 블렌더</button>` +
    `</div>` +
    `<span class="prac-pill">☕ 컵: ${cupLabel}</span>` +
    `<span class="prac-pill">🫘 원두: ${beanTxt}</span>` +
    `<span class="prac-pill">🥃 샷: ${shotTxt}</span>` +
    `<span class="prac-pill">🌀 믹서: ${blendTxt}</span>` +
    (c.spilled ? `<span class="prac-pill warn">💦 쟁반 흘림!</span>` : '') +
    (c.mistakes.length ? `<span class="prac-pill warn">⚠️ 실수 ${c.mistakes.length}건</span>` : '') +
    `<button type="button" class="prac-reset-btn" id="pracClearTrayBtn">🧽 쟁반 닦고 다시 담기</button>`;

  bar.querySelectorAll('[data-ptarget]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.practicumTarget = btn.dataset.ptarget;
      state.awaitingTempPick = null;
      playSoftTone(620, 0.08, 'sine', 0.035);
      showGuidance(
        state.practicumTarget === 'blender'
          ? '🌀 이제 얼음·우유·재료를 누르면 블렌더(믹서기)로 들어가요!'
          : '🥛 이제 얼음·물·우유·재료를 누르면 쟁반 위 컵으로 들어가요!',
        state.practicumTarget === 'blender' ? '🌀' : '🥛',
        false
      );
      renderUI();
    });
  });

  const clr = document.getElementById('pracClearTrayBtn');
  if (clr) clr.addEventListener('click', clearTraySpillAndCup);
}

function renderManualChoiceBar() {
  const bar = document.getElementById('manualChoiceBar');
  if (!bar) return;

  // 실습모드 컵 선택 팝업
  if (state.practiceMode === 'practicum' && state.awaitingCupPick) {
    bar.classList.remove('hidden');
    bar.innerHTML =
      `<div class="manual-choice-title">☕ 어떤 컵을 쟁반에 올릴까요?</div>` +
      `<div class="manual-choice-grid">` +
        `<button type="button" class="manual-choice-btn" data-cup="mug">☕ 머그컵</button>` +
        `<button type="button" class="manual-choice-btn" data-cup="glass">🥛 투명 유리컵</button>` +
        `<button type="button" class="manual-choice-btn" data-cup="tea">🍵 찻잔</button>` +
      `</div>`;
    bar.querySelectorAll('[data-cup]').forEach((b) => {
      b.addEventListener('click', () => handlePracticumAction('cup', { cupType: b.dataset.cup }));
    });
    return;
  }

  // 실습모드 물/우유 온도 선택 팝업
  if (state.practiceMode === 'practicum' && state.awaitingTempPick) {
    const kind = state.awaitingTempPick.actionId;
    const isWater = kind === 'water';
    bar.classList.remove('hidden');
    bar.innerHTML =
      `<div class="manual-choice-title">${isWater ? '💧 어떤 온도의 물을 부을까요?' : '🥛 어떤 우유를 부을까요?'}</div>` +
      `<div class="manual-choice-grid">` +
        `<button type="button" class="manual-choice-btn" data-temp="hot">🔥 ${isWater ? '뜨거운 물' : '따뜻한 스팀 우유'}</button>` +
        `<button type="button" class="manual-choice-btn" data-temp="cold">❄️ ${isWater ? '차가운 물' : '차가운 우유'}</button>` +
      `</div>`;
    bar.querySelectorAll('[data-temp]').forEach((b) => {
      b.addEventListener('click', () => handlePracticumAction(kind, { temp: b.dataset.temp }));
    });
    return;
  }

  // 수동연습모드 다음 단계 선택
  if (state.practiceMode === 'manual' && state.awaitingNextChoice && state.manualChoices.length) {
    const prevStep = getCurrentRecipe().steps[state.stepIndex - 1];
    bar.classList.remove('hidden');
    bar.innerHTML =
      `<div class="manual-choice-title">🧭 ${prevStep ? `"${prevStep.label}" 완료! ` : ''}다음엔 어떤 것을 해야 할까요?</div>` +
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

function renderActiveOrderBanner() {
  const banner = document.getElementById('activeOrderBanner');
  if (!banner) return;
  const ao = state.activeKioskOrder;
  if (!ao) {
    banner.classList.add('hidden');
    return;
  }
  const recipe = RECIPES[ao.itemId];
  const diningLabel = ao.diningType === 'take_out' ? '🛍️ 포장' : '🍽️ 매장';
  const optsText = ao.optionsLabel && ao.optionsLabel !== '기본' ? ` · ${ao.optionsLabel}` : '';
  banner.classList.remove('hidden');
  banner.innerHTML =
    `<span>🧾 대기번호 <strong>${ao.orderNumber}번</strong> (${diningLabel}) · ${recipe ? recipe.emoji : '☕'} ${recipe ? recipe.name : ao.itemId}${optsText} 제조 중</span>` +
    `<button type="button" id="clearActiveOrderBtn" class="aob-clear-btn" title="주문 연동 해제">✕ 해제</button>`;
  const clearBtn = document.getElementById('clearActiveOrderBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.activeKioskOrder = null;
      renderActiveOrderBanner();
    });
  }
}

function updateKioskOrderBadge(orders = null) {
  const list = orders || loadKioskOrders();
  const pending = getPendingDrinkCount(list);
  const badge = document.getElementById('kioskOrderCountBadge');
  const btn = document.getElementById('kioskOrdersBtn');
  if (badge) badge.textContent = String(pending);
  if (btn) btn.classList.toggle('has-pending', pending > 0);
}

function completeActiveKioskOrderItem(recipeKey) {
  const orders = loadKioskOrders();
  let updated = false;
  let msg = '';
  let orderRef = null;

  if (state.activeKioskOrder && state.activeKioskOrder.itemId === recipeKey) {
    orderRef = orders.find((o) => o.id === state.activeKioskOrder.orderId);
  }
  if (!orderRef) {
    // 선택된 주문이 없어도 대기 중인 동일 음료 주문이 있으면 순서대로 완료 처리 가능하게 하되, 명시적 주문 연동 시 우선 갱신
    return '';
  }

  const targetItem = (orderRef.items || []).find((it) => it.itemId === recipeKey && (Number(it.madeQty) || 0) < (Number(it.qty) || 1))
    || (orderRef.items || []).find((it) => it.itemId === recipeKey);

  if (targetItem) {
    const qty = Number(targetItem.qty) || 1;
    const prevMade = Number(targetItem.madeQty) || 0;
    if (prevMade < qty) {
      targetItem.madeQty = prevMade + 1;
      updated = true;
    }
    const remaining = Math.max(0, qty - (Number(targetItem.madeQty) || 0));
    msg = remaining > 0
      ? `🧾 대기번호 ${orderRef.orderNumber}번 손님 · ${targetItem.name} (${targetItem.madeQty}/${qty}잔 완성, ${remaining}잔 남음)`
      : `🧾 대기번호 ${orderRef.orderNumber}번 손님 · ${targetItem.name} 제조 완료!`;
    if (remaining === 0) {
      // 같은 주문 내 다음 미완성 음료를 자동으로 찾거나 활성 주문 해제
      const nextUnfinished = (orderRef.items || []).find((it) => RECIPES[it.itemId] && (Number(it.madeQty) || 0) < (Number(it.qty) || 1));
      if (!nextUnfinished) {
        state.activeKioskOrder = null;
      }
    }
  }

  if (updated) {
    saveKioskOrders(orders);
    updateKioskOrderBadge(orders);
    renderKioskOrderDrawer(orders);
  }
  renderActiveOrderBanner();
  return msg;
}

function startKioskOrderDrink(orderId, itemId) {
  const orders = loadKioskOrders();
  const ord = orders.find((o) => o.id === orderId);
  if (!ord || !RECIPES[itemId]) return;
  const targetItem = (ord.items || []).find((it) => it.itemId === itemId);
  state.activeKioskOrder = {
    orderId: ord.id,
    orderNumber: ord.orderNumber,
    diningType: ord.diningType,
    itemId,
    optionsLabel: targetItem ? (targetItem.optionsLabel || '기본') : '기본'
  };
  state.recipeKey = itemId;
  const orderDrawer = document.getElementById('kioskOrderDrawer');
  const orderBtn = document.getElementById('kioskOrdersBtn');
  if (orderDrawer) orderDrawer.classList.add('hidden');
  if (orderBtn) orderBtn.setAttribute('aria-expanded', 'false');
  renderRecipeDrawer();
  resetDrink();
  playSoftTone(659.25, 0.14, 'triangle', 0.05);
  speakKorean(`대기번호 ${ord.orderNumber}번 손님의 ${RECIPES[itemId].name} 주문을 불러왔어요. 순서대로 만들어 보세요.`);
}

async function syncKioskOrdersFromAllSources() {
  let local = loadKioskOrders();
  let remote = null;
  try {
    const base = (window.D1Bridge && window.D1Bridge.getApiBase)
      ? window.D1Bridge.getApiBase()
      : 'https://safe-mover-d1-api.school-guardian.workers.dev';
    const resp = await fetch(base + '/api/kv?key=' + encodeURIComponent('safe_mover.kiosk.orders.public.v1'));
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.found && json.item && json.item.v) {
        const parsed = typeof json.item.v === 'string' ? JSON.parse(json.item.v) : json.item.v;
        if (Array.isArray(parsed)) remote = parsed;
      }
    }
  } catch {}
  if (remote === null && window.D1Bridge && typeof window.D1Bridge.getKV === 'function') {
    try {
      const scoped = await window.D1Bridge.getKV(KIOSK_ORDERS_KEY);
      if (Array.isArray(scoped)) remote = scoped;
    } catch {}
  }
  if (Array.isArray(remote)) {
    const byId = new Map();
    for (const o of remote) {
      if (o && o.id) byId.set(o.id, o);
    }
    for (const o of local) {
      if (!o || !o.id) continue;
      if (!byId.has(o.id)) continue;
      const prev = byId.get(o.id);
      const prevMade = (prev.items || []).reduce((a, it) => a + (Number(it.madeQty) || 0), 0);
      const curMade = (o.items || []).reduce((a, it) => a + (Number(it.madeQty) || 0), 0);
      if (curMade > prevMade) byId.set(o.id, o);
    }
    local = [...byId.values()]
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 30);
    try { localStorage.setItem(KIOSK_ORDERS_KEY, JSON.stringify(local)); } catch {}
  }
  if (!state.activeKioskOrder) {
    const recovered = getInitialKioskOrder();
    if (recovered) {
      state.activeKioskOrder = recovered;
      if (RECIPES[recovered.itemId] && state.recipeKey !== recovered.itemId) {
        state.recipeKey = recovered.itemId;
        renderRecipeDrawer();
        resetDrink();
      }
      renderActiveOrderBanner();
    }
  }
  updateKioskOrderBadge(local);
  renderKioskOrderDrawer(local);
  return local;
}

function renderKioskOrderDrawer(ordersArg = null) {
  const listEl = document.getElementById('kioskOrderList');
  const summaryEl = document.getElementById('kodSummaryText');
  if (!listEl) return;

  const orders = ordersArg || loadKioskOrders();
  updateKioskOrderBadge(orders);
  const pendingDrinks = getPendingDrinkCount(orders);

  if (summaryEl) {
    summaryEl.textContent = orders.length
      ? `총 ${orders.length}건의 키오스크 주문 · 제조 대기 음료 ${pendingDrinks}잔`
      : '키오스크에서 주문·결제한 음료를 불러와 바로 제조해요';
  }

  if (!orders.length) {
    listEl.innerHTML = `<div class="kod-empty">
      <div>아직 키오스크에서 들어온 주문이 없어요!</div>
      <div>키오스크에서 음료를 주문하고 결제하면 여기에 주문서가 나타납니다.</div>
      <a href="../kiosk/index.html">🖥️ 마음카페 키오스크에서 주문하기</a>
    </div>`;
    return;
  }

  listEl.innerHTML = orders.map((ord) => {
    const items = ord.items || [];
    const drinkItems = items.filter((it) => isDrinkOrderItem(it));
    const allDone = drinkItems.length > 0 && drinkItems.every((it) => (Number(it.madeQty) || 0) >= (Number(it.qty) || 1));
    const diningTxt = ord.diningType === 'take_out' ? '🛍️ 포장' : '🍽️ 매장';
    const timeStr = ord.createdAt
      ? new Date(ord.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      : '';

    const itemsHtml = items.map((it, itemIdx) => {
      const recipe = RECIPES[it.itemId];
      const qty = Number(it.qty) || 1;
      const madeQty = Number(it.madeQty) || 0;
      const done = madeQty >= qty;
      const opts = it.optionsLabel && it.optionsLabel !== '기본' ? ` · ${it.optionsLabel}` : '';
      if (!recipe && it.category === 'bakery') {
        return `<div class="kod-item-row">
          <div class="kod-item-info">
            <span class="kod-item-name">🥐 ${it.name} (${qty}개${opts})</span>
            <span class="kod-item-sub">진열대에서 바로 꺼내 드리는 베이커리 메뉴예요</span>
          </div>
          <span class="kod-bakery-pill">🥐 베이커리</span>
        </div>`;
      }
      if (!recipe) {
        return `<div class="kod-item-row">
          <div class="kod-item-info">
            <span class="kod-item-name">🥤 ${it.name} (${qty}잔${opts})</span>
            <span class="kod-item-sub">${done ? `✅ ${qty}잔 준비 완료!` : `키오스크 추가 음료 · 준비: ${madeQty} / ${qty}잔`}</span>
          </div>
          <button type="button" class="kod-make-btn ${done ? 'done' : ''}" data-custom-done="${ord.id}" data-item-idx="${itemIdx}">
            ${done ? '✅ 준비 완료' : '🥤 1잔 완료 체크'}
          </button>
        </div>`;
      }
      const isCurrent = state.activeKioskOrder && state.activeKioskOrder.orderId === ord.id && state.activeKioskOrder.itemId === it.itemId;
      return `<div class="kod-item-row">
        <div class="kod-item-info">
          <span class="kod-item-name">${recipe.emoji} ${recipe.name} (${qty}잔${opts})</span>
          <span class="kod-item-sub">${done ? `✅ ${qty}잔 제조 완료!` : `제조 진행: ${madeQty} / ${qty}잔 완료`}</span>
        </div>
        <button type="button" class="kod-make-btn ${done ? 'done' : ''}" data-order-id="${ord.id}" data-item-id="${it.itemId}">
          ${done ? '✅ 다시 만들기' : isCurrent ? '🔄 제조 계속하기' : '☕ 이 음료 제조하기'}
        </button>
      </div>`;
    }).join('');

    return `<article class="kod-order-card ${allDone ? 'all-done' : ''}">
      <div class="kod-order-top">
        <div class="kod-order-meta">
          <span class="kod-order-num">대기번호 #${ord.orderNumber}</span>
          <span>${diningTxt}</span>
          <span>${ord.methodLabel || '결제 완료'}</span>
          ${timeStr ? `<span>${timeStr}</span>` : ''}
        </div>
        <span class="kod-order-status ${allDone ? 'done' : ''}">${allDone ? '✅ 제조 완료' : '⏳ 제조 대기'}</span>
      </div>
      <div class="kod-items">${itemsHtml}</div>
    </article>`;
  }).join('');

  listEl.querySelectorAll('.kod-make-btn[data-order-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      startKioskOrderDrink(btn.dataset.orderId, btn.dataset.itemId);
    });
  });

  listEl.querySelectorAll('[data-custom-done]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ordId = btn.dataset.customDone;
      const idx = Number(btn.dataset.itemIdx);
      const list = loadKioskOrders();
      const ord = list.find((o) => o.id === ordId);
      const target = ord && ord.items && ord.items[idx];
      if (!target) return;
      const qty = Number(target.qty) || 1;
      const prev = Number(target.madeQty) || 0;
      if (prev < qty) {
        target.madeQty = prev + 1;
        saveKioskOrders(list);
        playSoftTone(880, 0.14, 'triangle', 0.05);
        renderKioskOrderDrawer(list);
      }
    });
  });
}

function renderRecipeDrawer() {
  const drawer = document.getElementById('recipeDrawer');
  if (!drawer) return;
  drawer.innerHTML = RECIPE_CATEGORIES.map((cat) => {
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
      resetDrink();
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
  renderActiveOrderBanner();
  updateKioskOrderBadge();

  // 모드 버튼 active 동기화
  document.querySelectorAll('.pmode-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.pmode === state.practiceMode);
  });

  // 시각적 과제 분석표 (실습모드에서는 순서를 가리고 목표 음료 안내)
  const strip = document.getElementById('scheduleStrip');
  strip.innerHTML = '';
  if (isPracticum) {
    const cupHint = { mug: '머그컵', glass: '투명 유리컵', tea: '찻잔' }[recipe.cupType] || '컵';
    const tempHint = recipe.isHot ? '따뜻하게' : '차갑게';
    const blendHint = recipe.usesBlender ? ' · 🌀 블렌더 사용' : '';
    strip.innerHTML =
      `<div class="step-card current"><span class="step-num">🧪</span><span>실전 주문: ${recipe.emoji} ${recipe.name} (${cupHint} · ${tempHint}${blendHint}) · 순서와 실수까지 직접 체험해 보세요!</span></div>`;
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

  // 지금 -> 다음 한눈에 보기 바
  const ftBar = document.getElementById('firstThenBar');
  if (ftBar) {
    if (isPracticum) {
      ftBar.innerHTML =
        `<span class="ft-pill now">🧪 자유 실습 중: ${recipe.emoji} ${recipe.name}</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">완료 후 🔔 손님께 드리기</span>`;
    } else if (isManual && state.awaitingNextChoice) {
      ftBar.innerHTML =
        `<span class="ft-pill now">🧭 방금 단계 완료!</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">아래에서 다음 행동을 직접 골라요!</span>`;
    } else if (currentStep) {
      const curDisp = getStepDisplay(currentStep);
      const nextDisp = nextStep ? getStepDisplay(nextStep) : null;
      ftBar.innerHTML =
        `<span class="ft-pill now">지금: ${currentStep.emoji} ${curDisp.label}</span>` +
        `<span>→</span>` +
        `<span class="ft-pill next">${isManual ? '다음: 직접 선택하기 🧭' : `다음: ${nextStep ? `${nextStep.emoji} ${nextDisp.label}` : '🎉 음료 완성!'}`}</span>`;
    } else {
      ftBar.innerHTML = '<span class="ft-pill next">🎉 음료가 완성되었어요!</span>';
    }
  }

  // 현재 단계 배너
  if (isPracticum) {
    if (state.craft.log.length === 0 && !state.craft.spilled && !state.awaitingCupPick && !state.awaitingTempPick) {
      const startTip = recipe.usesBlender
        ? `실습모드! ${recipe.name} 주문을 받았어요. 현재 담는 곳이 '🌀 블렌더'로 맞춰져 있으니 재료를 넣고 갈아보세요!`
        : `실습모드! ${recipe.name} 주문을 받았어요. 아래 도구와 3D 기구를 자유롭게 눌러 직접 만들어보세요!`;
      showGuidance(startTip, '🧪', false);
    }
  } else if (isManual && state.awaitingNextChoice) {
    showGuidance('방금 단계를 완료했어요! 아래 선택지나 3D 카운터에서 다음에 할 일을 골라보세요.', '🧭', false);
  } else if (currentStep) {
    const curDisp = getStepDisplay(currentStep);
    showGuidance(curDisp.prompt, currentStep.emoji, false);
    if (state.guidedMode) speakKorean(curDisp.prompt);
  }

  // 하단 큰 동작 버튼 (실습모드에서는 전체 23종 도구 표시, 자동/수동에서는 레시피 도구 표시)
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

  // 3D 강조 링 & 부유 비콘 위치 업데이트 (자동모드 또는 수동모드 선택 완료 후에만 표시)
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
  if (state.autoCamera && !state.awaitingCupPick && !state.awaitingTempPick) {
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

function showCompletionModal(recipe, evalRes = null, orderMsg = '') {
  document.getElementById('completeEmoji').textContent = recipe.emoji;
  const orderStatusEl = document.getElementById('completeOrderStatus');
  const nextOrderBtn = document.getElementById('nextOrderDrinkBtn');
  if (orderStatusEl) {
    if (orderMsg) {
      orderStatusEl.textContent = orderMsg;
      orderStatusEl.classList.remove('hidden');
    } else {
      orderStatusEl.classList.add('hidden');
    }
  }
  if (nextOrderBtn) {
    const hasPending = getPendingDrinkCount(loadKioskOrders()) > 0;
    nextOrderBtn.classList.toggle('hidden', !hasPending);
  }
  const reportEl = document.getElementById('practicumReport');
  if (evalRes) {
    const starStr = '⭐'.repeat(evalRes.stars) + '☆'.repeat(3 - evalRes.stars);
    document.getElementById('completeTitle').textContent =
      evalRes.stars === 3 ? `${recipe.name} 완벽 제조!` : `${recipe.name} 실습 결과`;
    document.getElementById('completeDesc').textContent =
      evalRes.stars === 3
        ? '실수 없이 진짜 바리스타처럼 훌륭하게 만들었어요!'
        : '직접 만들면서 겪은 경험을 확인하고 한 번 더 도전해봐요.';
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
    document.getElementById('completeDesc').textContent = '차분하게 순서대로 정말 잘 만들었어요.';
    if (reportEl) reportEl.classList.add('hidden');
  }
  const goKioskBtn = document.getElementById('goKioskBtn');
  if (goKioskBtn) {
    goKioskBtn.href = `../kiosk/index.html?from=cafe&drink=${encodeURIComponent(state.recipeKey)}`;
  }
  document.getElementById('completeModal').classList.remove('hidden');
}

function resetDrink() {
  const recipe = getCurrentRecipe();
  state.stepIndex = 0;
  state.busy = false;
  state.awaitingNextChoice = false;
  state.manualChoices = [];
  state.awaitingCupPick = false;
  state.awaitingTempPick = null;
  state.practicumTarget = recipe.usesBlender ? 'blender' : 'cup';
  state.liquidLevel = 0;
  state.hasIce = false;
  state.craft = createInitialCraft();
  drinkGroup.visible = false;
  drinkGroup.position.set(PREP_POS.x, COUNTER_Y + 0.02, PREP_POS.z);
  drinkGroup.scale.set(1, 1, 1);
  liquidMesh.visible = false;
  liquidMesh.scale.y = 0.01;
  foamCapMesh.visible = false;
  iceGroup.visible = false;
  steamGroup.visible = false;
  fizzGroup.visible = false;
  whipGroup.visible = false;
  whipGroup.scale.set(1, 1, 1);
  drizzleGroup.visible = false;
  cupToppingGroup.visible = false;
  while (cupToppingGroup.children.length > 0) cupToppingGroup.remove(cupToppingGroup.children[0]);
  fallingItemGroup.visible = false;
  blenderMixMesh.visible = false;
  blenderMixMesh.scale.y = 0.01;
  syncBlenderChunks3D([], true);
  pourStream.visible = false;
  spillPuddleMesh.visible = false;
  spillIceGroup.visible = false;
  shotOverflowMesh.visible = false;
  if (portafilterCoffee) portafilterCoffee.visible = false;
  if (shotLiquidMesh) shotLiquidMesh.visible = false;
  if (shotGlassGroup) {
    shotGlassGroup.position.copy(SHOT_HOME_POS);
    shotGlassGroup.rotation.set(0, 0, 0);
  }
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

// 상단 음료 선택 드로어 & 키오스크 주문서 드로어 & 버튼 이벤트 연결
const recipePickerBtn = document.getElementById('recipePickerBtn');
const recipeDrawer = document.getElementById('recipeDrawer');
const kioskOrdersBtn = document.getElementById('kioskOrdersBtn');
const kioskOrderDrawer = document.getElementById('kioskOrderDrawer');
const initRecipe = getCurrentRecipe();
const initRecipeLabelEl = document.getElementById('currentRecipeLabel');
if (initRecipeLabelEl && initRecipe) {
  initRecipeLabelEl.textContent = `${initRecipe.emoji} ${initRecipe.name}`;
}
renderRecipeDrawer();
renderKioskOrderDrawer();
renderActiveOrderBanner();

recipePickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = recipeDrawer.classList.toggle('hidden');
  recipePickerBtn.setAttribute('aria-expanded', String(!isHidden));
  if (!isHidden) {
    settingsPopover.classList.add('hidden');
    settingsToggleBtn.setAttribute('aria-expanded', 'false');
    if (kioskOrderDrawer) kioskOrderDrawer.classList.add('hidden');
    if (kioskOrdersBtn) kioskOrdersBtn.setAttribute('aria-expanded', 'false');
  }
});

if (kioskOrdersBtn && kioskOrderDrawer) {
  kioskOrdersBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = kioskOrderDrawer.classList.toggle('hidden');
    kioskOrdersBtn.setAttribute('aria-expanded', String(!isHidden));
    if (!isHidden) {
      syncKioskOrdersFromAllSources();
      recipeDrawer.classList.add('hidden');
      recipePickerBtn.setAttribute('aria-expanded', 'false');
      settingsPopover.classList.add('hidden');
      settingsToggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

const refreshKioskOrdersBtn = document.getElementById('refreshKioskOrdersBtn');
if (refreshKioskOrdersBtn) {
  refreshKioskOrdersBtn.addEventListener('click', () => {
    playSoftTone(660, 0.1, 'sine', 0.045);
    syncKioskOrdersFromAllSources();
  });
}

const clearDoneOrdersBtn = document.getElementById('clearDoneOrdersBtn');
if (clearDoneOrdersBtn) {
  clearDoneOrdersBtn.addEventListener('click', () => {
    const orders = loadKioskOrders();
    const filtered = orders.filter((ord) => {
      const drinkItems = (ord.items || []).filter((it) => isDrinkOrderItem(it));
      if (!drinkItems.length) return false;
      return drinkItems.some((it) => (Number(it.madeQty) || 0) < (Number(it.qty) || 1));
    });
    saveKioskOrders(filtered);
    renderKioskOrderDrawer(filtered);
    playSoftTone(520, 0.1, 'sine', 0.04);
  });
}

const closeKioskOrdersBtn = document.getElementById('closeKioskOrdersBtn');
if (closeKioskOrdersBtn && kioskOrderDrawer) {
  closeKioskOrdersBtn.addEventListener('click', () => {
    kioskOrderDrawer.classList.add('hidden');
    if (kioskOrdersBtn) kioskOrdersBtn.setAttribute('aria-expanded', 'false');
  });
}

const nextOrderDrinkBtn = document.getElementById('nextOrderDrinkBtn');
if (nextOrderDrinkBtn && kioskOrderDrawer) {
  nextOrderDrinkBtn.addEventListener('click', () => {
    document.getElementById('completeModal').classList.add('hidden');
    resetDrink();
    kioskOrderDrawer.classList.remove('hidden');
    if (kioskOrdersBtn) kioskOrdersBtn.setAttribute('aria-expanded', 'true');
    syncKioskOrdersFromAllSources();
  });
}

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
    if (kioskOrderDrawer) kioskOrderDrawer.classList.add('hidden');
    if (kioskOrdersBtn) kioskOrdersBtn.setAttribute('aria-expanded', 'false');
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
  if (kioskOrderDrawer && !kioskOrderDrawer.classList.contains('hidden') && !kioskOrderDrawer.contains(e.target) && !kioskOrdersBtn.contains(e.target)) {
    kioskOrderDrawer.classList.add('hidden');
    kioskOrdersBtn.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('.pmode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const nextMode = btn.dataset.pmode;
    if (!nextMode || state.practiceMode === nextMode) return;
    state.practiceMode = nextMode;
    playSoftTone(680, 0.12, 'sine', 0.045);
    resetDrink();
    const modeNames = {
      auto: '자동연습모드로 시작해요. 순서대로 안내해 드릴게요.',
      manual: '수동연습모드예요. 단계가 끝나면 다음 행동을 직접 골라보세요.',
      practicum: '실습모드예요. 실제 카페처럼 자유롭게 음료를 만들어 보세요.'
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

document.getElementById('voiceBtn').addEventListener('click', (e) => {
  state.voiceEnabled = !state.voiceEnabled;
  if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
    window.D1Bridge.setSpedPrefs({ ttsAuto: state.voiceEnabled });
  }
  syncCafeSettingButtons();
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

const easyCafeBtn = document.getElementById('easyCafeBtn');
if (easyCafeBtn) {
  easyCafeBtn.addEventListener('click', () => {
    state.easyMode = !state.easyMode;
    if (window.D1Bridge && window.D1Bridge.setSpedPrefs) {
      window.D1Bridge.setSpedPrefs({ easyMode: state.easyMode });
    }
    syncCafeSettingButtons();
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
    const text = shownText || (step ? getStepDisplay(step).prompt : '음료가 완성되었어요!');
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
const cafeBreakModal = document.getElementById('cafeBreakModal');
const resumeCafeBtn = document.getElementById('resumeCafeBtn');
if (quickBreakBtn && cafeBreakModal) {
  quickBreakBtn.addEventListener('click', () => {
    state.paused = true;
    cafeBreakModal.classList.remove('hidden');
  });
}
if (resumeCafeBtn && cafeBreakModal) {
  resumeCafeBtn.addEventListener('click', () => {
    state.paused = false;
    cafeBreakModal.classList.add('hidden');
  });
}

function syncCafeSettingButtons() {
  const voiceEl = document.getElementById('voiceBtn');
  if (voiceEl) {
    voiceEl.textContent = `🔊 음성 안내: ${state.voiceEnabled ? '켜짐' : '꺼짐'}`;
    voiceEl.classList.toggle('active', state.voiceEnabled);
  }
  const easyEl = document.getElementById('easyCafeBtn');
  if (easyEl) {
    easyEl.textContent = `📖 쉬운 말: ${state.easyMode ? '켜짐' : '꺼짐'}`;
    easyEl.classList.toggle('active', state.easyMode);
  }
}

function applyCafeSpedPrefs(prefs) {
  if (!prefs) return;
  const needRender = state.easyMode !== !!prefs.easyMode;
  state.easyMode = !!prefs.easyMode;
  state.voiceEnabled = !!prefs.ttsAuto;
  state.slowPace = !!prefs.slowPace;
  syncCafeSettingButtons();
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

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn && window.D1Bridge && window.D1Bridge.bindFullscreenButton) {
  window.D1Bridge.bindFullscreenButton(fullscreenBtn, {
    enterText: '⛶ 전체화면',
    exitText: '⛶ 창모드'
  });
}

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

  if (iceGroup.visible && iceCubes.length > 0) {
    iceCubes.forEach((cube, i) => {
      cube.rotation.x += dt * (0.25 + i * 0.05);
      cube.rotation.z = 0.25 + Math.sin(t * 2.1 + i) * 0.08;
    });
  }

  if (steamGroup.visible) {
    steamPuffs.forEach((puff, i) => {
      const cycle = (t * 0.14 + i * 0.15) % 0.28;
      puff.position.y = 0.18 + cycle;
      puff.material.opacity = 0.52 * (1 - cycle / 0.28);
    });
  }

  if (fizzGroup.visible) {
    fizzBubbles.forEach((b, i) => {
      const cycle = (t * 0.16 + i * 0.09) % 0.12;
      b.position.y = 0.03 + cycle;
      b.material.opacity = 0.85 * (1 - cycle / 0.12);
    });
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

initCafeScene();
syncKioskOrdersFromAllSources();
window.addEventListener('focus', () => syncKioskOrdersFromAllSources());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncKioskOrdersFromAllSources();
});
window.addEventListener('storage', (e) => {
  if (e.key === KIOSK_ORDERS_KEY) {
    updateKioskOrderBadge();
    renderKioskOrderDrawer();
  }
});
if (window.D1Bridge && window.D1Bridge.getSpedPrefs) {
  applyCafeSpedPrefs(window.D1Bridge.getSpedPrefs());
}
if (window.D1Bridge && window.D1Bridge.onSpedPrefsChange) {
  window.D1Bridge.onSpedPrefsChange(applyCafeSpedPrefs);
}
animate();
