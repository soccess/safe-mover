"use strict";

/* ============================================================
   12단계 모험 코스 데이터 (각 스테이지 고유 도로 스타일 · 장식 · 기믹)
   ============================================================ */
window.SafeMoverStages = [
  {
    name: "새싹 마을 꽃길", icon: "🌱", dur: 44, speed: 0.98, spawn: 1.4,
    sky: ["#38BDF8", "#E0F2FE"], ground: ["#A7F3D0", "#34D399"], road: ["#78716C", "#57534E"],
    roadStyle: "meadow", propTheme: "flower", enemyType: "goblin",
    deco: "🌷🌳🏡", enemyName: "오타 도깨비", enemyColor: "#E53935",
    gimmick: "goldenStart", gimmickLabel: "✨ 황금 첫걸음",
    gimmickDesc: "황금 별빛 카드(+2점)가 자주 나와요! 바른 단어를 잡으러 이동하세요.",
    bonusChance: 0.35, choiceChance: 0.2,
    msg: "황금 별빛 카드가 반짝여요! 바른 맞춤법 단어를 잡고 오타 도깨비는 피하세요!",
    mid: ["잘하고 있어요! 황금 카드는 점수가 2배예요!", "절반 왔어요! 연속으로 잡으면 콤보 반짝!", "마을 도착 게이트가 보여요!"]
  },
  {
    name: "빗방울 웅덩이 골목", icon: "🌧️", dur: 46, speed: 1.04, spawn: 1.35,
    sky: ["#475569", "#94A3B8"], ground: ["#94A3B8", "#475569"], road: ["#334155", "#0F172A"],
    roadStyle: "wet", propTheme: "lamp", enemyType: "cloud",
    deco: "☔🌧️💧", rain: true, fog: 0.08, enemyName: "먹구름 요괴", enemyColor: "#8E24AA",
    gimmick: "puddles", gimmickLabel: "💧 반짝 물웅덩이",
    gimmickDesc: "바닥 물웅덩이를 밟으면 첨벙! 물보라와 함께 옆 레인으로 톡 튀어요!",
    puddles: true, choiceChance: 0.25,
    msg: "빗물 웅덩이 주의! 물웅덩이를 밟으면 옆 레인으로 톡 튀어 오르니 조심해요!",
    mid: ["빗속에서도 글자를 또박또박 살펴봐요!", "물웅덩이를 피해 바른 단어만 쏙쏙 잡아요!", "골목 끝이 보여요! 멋지게 마무리해요!"]
  },
  {
    name: "낙엽 공원 나무길", icon: "🍂", dur: 48, speed: 1.08, spawn: 1.32,
    sky: ["#FB923C", "#FEF3C7"], ground: ["#FDE68A", "#D97706"], road: ["#92400E", "#451A03"],
    roadStyle: "wood", propTheme: "maple", enemyType: "leaf",
    deco: "🍁🍂🌳", leaves: true, sway: 0.28, enemyName: "단풍 악동", enemyColor: "#D84315",
    gimmick: "leafGust", gimmickLabel: "🍁 흔들 악동 & 단풍 바람",
    gimmickDesc: "나무 데크 위로 단풍 악동이 좌우로 흔들리며 다가와요!",
    leafGust: true, choiceChance: 0.3,
    msg: "단풍 악동이 좌우로 흔들려요! 나무 데크 위 바른 단어를 골라 잡으세요!",
    mid: ["낙엽 사이로 바른 단어가 날아와요!", "악동이 옆으로 움직이니 미리 피해요!", "공원 출구가 보여요! 힘내요!"]
  },
  {
    name: "설원 빙판 남극", icon: "❄️", dur: 48, speed: 1.12, spawn: 1.28,
    sky: ["#0284C7", "#E0F2FE"], ground: ["#FFFFFF", "#BAE6FD"], road: ["#93C5FD", "#3B82F6"],
    roadStyle: "ice", propTheme: "snowman", enemyType: "ice",
    deco: "⛄🐧🏔️", snow: true, slippery: true, enemyName: "얼음 유령", enemyColor: "#6A1B9A",
    gimmick: "iceSlide", gimmickLabel: "🧊 미끄덩 빙판 & 보호막",
    gimmickDesc: "빙판이라 살짝 미끄러져요! 얼음 거품 보호막(🫧)을 챙기세요!",
    shieldChance: 0.22, choiceChance: 0.35,
    msg: "반짝이는 빙판길! 한 박자 빨리 움직이고 거품 보호막도 챙기세요!",
    mid: ["빙판길 조심! 바른 단어 카드는 놓치지 마세요!", "얼음 유령이 다가와요! 방향을 미리 잡아요!", "설원 끝이 보여요! 마지막까지 집중!"]
  },
  {
    name: "사막 모래바람 협곡", icon: "🏜️", dur: 50, speed: 1.18, spawn: 1.24,
    sky: ["#F59E0B", "#FEF3C7"], ground: ["#FDE68A", "#B45309"], road: ["#B45309", "#78350F"],
    roadStyle: "sand", propTheme: "cactus", enemyType: "sand",
    deco: "🌵🐪☀️", sand: true, wind: true, enemyName: "모래 괴수", enemyColor: "#C62828",
    gimmick: "sandWind", gimmickLabel: "🌪️ 예고 강풍 돌풍",
    gimmickDesc: "바람 경고(🌪️)가 뜨면 사막 돌풍이 캐릭터를 옆으로 살짝 밀어요!",
    choiceChance: 0.4,
    msg: "예고 후 사막 강풍이 불어요! 중심을 잡으며 바른 단어를 모으세요!",
    mid: ["강풍 예고가 뜨면 반대 방향을 준비해요!", "모래 괴수의 틀린 글자에 속지 마세요!", "오아시스가 보여요! 협곡 탈출 직전!"]
  },
  {
    name: "네온 야간 사이버로", icon: "🌃", dur: 50, speed: 1.24, spawn: 1.18,
    sky: ["#1E1B4B", "#4C1D95"], ground: ["#1E293B", "#090D16"], road: ["#1E1B4B", "#090D16"],
    roadStyle: "neon", propTheme: "neonpost", enemyType: "bot",
    deco: "🌃💡⚡", night: true, narrow: 0.88, double: 0.28, enemyName: "네온 오타봇", enemyColor: "#EC407A",
    gimmick: "neonBoost", gimmickLabel: "⚡ 네온 부스트 & 더블 봇",
    gimmickDesc: "바닥의 네온 가속 패드(⚡)를 밟으면 무적 스피드 부스트!",
    boostPads: true, choiceChance: 0.42,
    msg: "네온 부스트 패드(⚡)를 밟고 질주하세요! 오타봇 2대가 올 수도 있어요!",
    mid: ["네온 불빛 속 바른 단어를 쏙쏙 챙겨요!", "네온 부스트 무적 질주 찬스를 노려요!", "시원한 해변이 가까워졌어요!"]
  },
  {
    name: "해변 파도 산책로", icon: "🌊", dur: 50, speed: 1.28, spawn: 1.15,
    sky: ["#06B6D4", "#CFFAFE"], ground: ["#FEF08A", "#F59E0B"], road: ["#D6D3D1", "#A8A29E"],
    roadStyle: "beach", propTheme: "palm", enemyType: "crab",
    deco: "🌊🐚🌴", sway: 0.40, wave: true, tidalWave: true, enemyName: "집게 오타몬", enemyColor: "#E11D48",
    gimmick: "tidalWave", gimmickLabel: "🌊 밀물 파도 & 옆걸음 게",
    gimmickDesc: "시원한 밀물 파도가 한쪽 레인을 스쳐가요! 집게 오타몬도 조심!",
    choiceChance: 0.45,
    msg: "해변 파도가 밀려와요! 집게 오타몬의 옆걸음을 피해 바른 단어를 잡아요!",
    mid: ["파도 소리 들으며 맞춤법 퀴즈 척척!", "밀물 파도가 오는 레인은 살짝 피해요!", "무지개 축제 불빛이 보여요!"]
  },
  {
    name: "무지개 축제 퍼레이드", icon: "🌈", dur: 52, speed: 1.32, spawn: 1.10,
    sky: ["#C084FC", "#FEF9C3"], ground: ["#BBF7D0", "#BFDBFE"], road: ["#7C3AED", "#4C1D95"],
    roadStyle: "rainbow", propTheme: "balloon", enemyType: "firework",
    deco: "🎈🎉🌈", confettiBg: true, sway: 0.30, double: 0.25, enemyName: "폭죽 악동", enemyColor: "#F43F5E",
    gimmick: "choiceParade", gimmickLabel: "🎭 양자택일 퍼레이드",
    gimmickDesc: "바른 말과 헷갈리는 틀린 말이 나란히 등장해요! 진짜 맞춤법을 고르세요!",
    choiceChance: 0.68, bonusChance: 0.32,
    msg: "무지개 퍼레이드! 나란히 오는 두 단어 중 진짜 바른 맞춤법을 골라 잡아요!",
    mid: ["뜻과 모양을 비교하며 바른 말을 골라요!", "폭죽 악동을 피해 멋진 콤보를 이어가요!", "다음은 반짝이는 반딧불 숲길!"]
  },
  {
    name: "반짝반짝 반딧불 숲길", icon: "🪲", dur: 52, speed: 1.30, spawn: 1.15,
    sky: ["#064E3B", "#34D399"], ground: ["#166534", "#052E16"], road: ["#3F6212", "#1A2E05"],
    roadStyle: "forest", propTheme: "mushroom", enemyType: "thorn",
    deco: "🌲🪲🍄", fireflies: true, sway: 0.26, enemyName: "가시 오타고슴", enemyColor: "#B91C1C",
    gimmick: "magnetForest", gimmickLabel: "🧲 반딧불 요정 자석",
    gimmickDesc: "반짝이는 단어 자석(🧲)을 먹으면 옆 레인 바른 단어까지 쏙 끌려와요!",
    magnetChance: 0.26, spotlight: true, choiceChance: 0.52,
    msg: "신비한 반딧불 숲길! 요정 자석(🧲)을 잡으면 바른 단어가 자동으로 모여요!",
    mid: ["반딧불이 바른 단어 길을 비춰줘요!", "자석 아이템으로 어려운 단어도 척척!", "숲 출구까지 얼마 안 남았어요!"]
  },
  {
    name: "구름 위 무지개 다리", icon: "☁️", dur: 52, speed: 1.34, spawn: 1.12,
    sky: ["#2563EB", "#DBEAFE"], ground: ["#E0F2FE", "#7DD3FC"], road: ["#F8FAFC", "#CBD5E1"],
    roadStyle: "cloud", propTheme: "cloudpillar", enemyType: "storm",
    deco: "☁️🌈🕊️", clouds: true, narrow: 0.90, double: 0.24, enemyName: "먹구름 악령", enemyColor: "#7C3AED",
    gimmick: "cloudJump", gimmickLabel: "☁️ 퐁당 구름 점프대",
    gimmickDesc: "바닥의 구름 점프대(☁️⬆)를 밟으면 하늘로 점프해 적을 뛰어넘어요!",
    cloudJump: true, choiceChance: 0.55,
    msg: "구름 위 다리! 구름 점프대를 밟으면 높이 뛰어 적을 피하고 보너스를 얻어요!",
    mid: ["구름 점프대로 하늘을 날아보세요!", "어려운 맞춤법도 이제 척척 맞혀요!", "무지개 끝이 보여요! 조금만 더!"]
  },
  {
    name: "산호빛 바닷속 터널", icon: "🐠", dur: 54, speed: 1.38, spawn: 1.10,
    sky: ["#0E7490", "#22D3EE"], ground: ["#67E8F9", "#0E7490"], road: ["#164E63", "#083344"],
    roadStyle: "coral", propTheme: "coral", enemyType: "puffer",
    deco: "🐠🪸🫧", bubbles: true, wave: true, sway: 0.30, enemyName: "복어 오타몬", enemyColor: "#DB2777",
    gimmick: "oceanCurrent", gimmickLabel: "🫧 바닷물 해류 & 거품 쉴드",
    gimmickDesc: "바닷속 아치 터널에서 해류가 흐르고, 거품 보호막(🫧)이 지켜줘요!",
    current: true, shieldChance: 0.28, choiceChance: 0.58,
    msg: "투명 바닷속 유리 터널! 해류를 타며 거품 보호막으로 어려운 단어를 모아요!",
    mid: ["산호초 물고기들이 응원하고 있어요!", "거품 보호막이 있으면 한 번 부딪혀도 안전!", "수면 빛이 보여요! 우주 피날레 직전!"]
  },
  {
    name: "달빛 우주 배송 피날레", icon: "🚀", dur: 56, speed: 1.44, spawn: 1.05,
    sky: ["#0F172A", "#4C1D95"], ground: ["#1E1B4B", "#020617"], road: ["#1E293B", "#090D16"],
    roadStyle: "galaxy", propTheme: "starbuoy", enemyType: "alien",
    deco: "🌙🪐🚀", night: true, stars: true, narrow: 0.88, double: 0.34, enemyName: "우주 오타외계인", enemyColor: "#E11D48",
    gimmick: "galaxyFinale", gimmickLabel: "🚀 우주 총집합 피날레",
    gimmickDesc: "네온 부스트 · 요정 자석 · 거품 보호막 · 고난도 양자택일이 모두 등장해요!",
    boostPads: true, magnetChance: 0.22, shieldChance: 0.22, bonusChance: 0.3, choiceChance: 0.65,
    msg: "마지막 우주 은하수 코스! 모든 아이템을 활용해 최고난도 맞춤법을 정복하세요!",
    mid: ["우주 정거장 통과! 맞춤법 실력이 최고예요!", "외계인 2인조와 고난도 퀴즈 러시!", "지구가 보여요! 최종 마스터까지 화이팅!"]
  }
];
