"use strict";

/* ============================================================
   12단계 역동적 모험 코스 데이터
   - 커브 트랙(curveAmp/curveFreq) · 언덕(hillAmp/hillFreq) · 카메라 뱅킹(bankMul)
   - 워프 포탈 · 레일 그라인드 · 컨베이어 · 끊어진 다리 · 거울 반전 · 중력 반전 · 보스전
   ============================================================ */
window.SafeMoverStages = [
  {
    name: "새싹 마을 꽃길", icon: "🌱", dur: 44, speed: 0.98, spawn: 1.36,
    sky: ["#38BDF8", "#E0F2FE"], ground: ["#A7F3D0", "#34D399"], road: ["#78716C", "#57534E"],
    roadStyle: "meadow", propTheme: "flower", enemyType: "goblin",
    deco: "🌷🌳🏡", enemyName: "오타 도깨비", enemyColor: "#E53935",
    curveAmp: 0.08, curveFreq: 0.55, hillAmp: 0.025, hillFreq: 0.6, bankMul: 0.04,
    padTypes: ["spring"], padsEnabled: true,
    gimmick: "goldenStart", gimmickLabel: "🌸 꽃 스프링 & 피버 콤보",
    gimmickDesc: "살랑살랑 굽이치는 꽃길! 바닥 🌸 스프링을 밟으면 폴짝 점프하고, 5콤보 시 피버 타임!",
    bonusChance: 0.36, choiceChance: 0.24,
    msg: "굽이치는 꽃길 모험 시작! 🌸 스프링을 밟고 5연속으로 잡아 피버 타임을 켜보세요!",
    mid: ["살랑살랑 커브길을 따라 바른 단어를 잡아요!", "5콤보를 채우면 무지개 피버 타임이 열려요!", "마을 도착 게이트가 보여요!"]
  },
  {
    name: "빗방울 웅덩이 골목", icon: "🌧️", dur: 46, speed: 1.04, spawn: 1.32,
    sky: ["#475569", "#94A3B8"], ground: ["#94A3B8", "#475569"], road: ["#334155", "#0F172A"],
    roadStyle: "wet", propTheme: "lamp", enemyType: "cloud",
    deco: "☔🌧️💧", rain: true, fog: 0.07, enemyName: "먹구름 요괴", enemyColor: "#8E24AA",
    curveAmp: 0.11, curveFreq: 0.62, hillAmp: 0.02, hillFreq: 0.7, bankMul: 0.05,
    puddles: true, padTypes: ["puddle", "warp"], padsEnabled: true,
    gimmick: "puddles", gimmickLabel: "💧 물웅덩이 & 🌀 워프 맨홀",
    gimmickDesc: "물웅덩이는 첨벙 튕기고, 파란 🌀 워프 맨홀을 밟으면 다른 레인으로 순간이동해요!",
    choiceChance: 0.28,
    msg: "반짝이는 🌀 워프 맨홀을 밟으면 순간이동! 빗물 웅덩이는 첨벙 옆으로 튀어요!",
    mid: ["워프 맨홀로 순간이동하면 잠깐 무적이 돼요!", "빗속에서도 글자를 또박또박 살펴봐요!", "골목 끝이 보여요! 멋지게 마무리해요!"]
  },
  {
    name: "낙엽 공원 나무길", icon: "🍂", dur: 48, speed: 1.08, spawn: 1.30,
    sky: ["#FB923C", "#FEF3C7"], ground: ["#FDE68A", "#D97706"], road: ["#92400E", "#451A03"],
    roadStyle: "wood", propTheme: "maple", enemyType: "leaf",
    deco: "🍁🍂🌳", leaves: true, sway: 0.28, enemyName: "단풍 악동", enemyColor: "#D84315",
    curveAmp: 0.14, curveFreq: 0.68, hillAmp: 0.04, hillFreq: 0.8, bankMul: 0.06,
    padTypes: ["bridgeGap", "spring"], padsEnabled: true,
    gimmick: "bridgeSplit", gimmickLabel: "🌉 끊어진 나무다리 분기",
    gimmickDesc: "중간중간 ⚠️ 끊어진 다리 구멍이 나타나요! 튼튼한 나무 판자 레인으로 좌우 이동!",
    leafGust: true, choiceChance: 0.32,
    msg: "흔들리는 커브 나무다리! ⚠️ 끊어진 구멍 레인을 피해 튼튼한 길로 건너세요!",
    mid: ["구멍이 보이면 좌우로 쏙 피해 안전 레인으로!", "🌸 단풍 스프링을 밟으면 구멍도 훌쩍 넘어요!", "공원 출구가 보여요! 힘내요!"]
  },
  {
    name: "설원 빙판 남극", icon: "❄️", dur: 48, speed: 1.12, spawn: 1.26,
    sky: ["#0284C7", "#E0F2FE"], ground: ["#FFFFFF", "#BAE6FD"], road: ["#93C5FD", "#3B82F6"],
    roadStyle: "ice", propTheme: "snowman", enemyType: "ice",
    deco: "⛄🐧🏔️", snow: true, slippery: true, enemyName: "얼음 유령", enemyColor: "#6A1B9A",
    curveAmp: 0.18, curveFreq: 0.72, hillAmp: 0.045, hillFreq: 0.85, bankMul: 0.08,
    padTypes: ["iceRail", "spring"], padsEnabled: true,
    gimmick: "iceRail", gimmickLabel: "🛷 얼음 레일 그라인드 & 빙판",
    gimmickDesc: "가파른 커브 설원! 🛷 얼음 레일을 타면 눈꽃을 뿌리며 무적 서핑을 해요!",
    shieldChance: 0.22, choiceChance: 0.36,
    msg: "굽이치는 얼음 언덕! 🛷 반짝이는 얼음 레일을 타면 적을 뚫고 시원하게 미끄러져요!",
    mid: ["커브 빙판길에서 한 박자 빠르게 좌우 이동!", "얼음 레일 서핑 중에는 오타 유령도 거뜬!", "설원 끝이 보여요! 마지막까지 집중!"]
  },
  {
    name: "사막 모래바람 협곡", icon: "🏜️", dur: 50, speed: 1.18, spawn: 1.22,
    sky: ["#F59E0B", "#FEF3C7"], ground: ["#FDE68A", "#B45309"], road: ["#B45309", "#78350F"],
    roadStyle: "sand", propTheme: "cactus", enemyType: "sand",
    deco: "🌵🐪☀️", sand: true, wind: true, enemyName: "모래 괴수", enemyColor: "#C62828",
    curveAmp: 0.16, curveFreq: 0.65, hillAmp: 0.055, hillFreq: 0.9, bankMul: 0.07,
    padTypes: ["conveyorL", "conveyorR"], padsEnabled: true,
    gimmick: "sandConveyor", gimmickLabel: "🔄 모래 컨베이어 & 🌪️ 강풍",
    gimmickDesc: "흐르는 모래 컨베이어(◀◀/▶▶)가 캐릭터를 옆 레인으로 밀어내요! 강풍도 조심!",
    choiceChance: 0.4,
    msg: "흐르는 모래 컨베이어와 사막 돌풍! 화살표 방향을 보고 영리하게 움직여요!",
    mid: ["모래 컨베이어를 타고 원하는 레인으로 쏙 이동!", "강풍 예고가 뜨면 반대 방향을 준비해요!", "오아시스가 보여요! 협곡 탈출 직전!"]
  },
  {
    name: "네온 야간 사이버로", icon: "🌃", dur: 50, speed: 1.24, spawn: 1.18,
    sky: ["#1E1B4B", "#4C1D95"], ground: ["#1E293B", "#090D16"], road: ["#1E1B4B", "#090D16"],
    roadStyle: "neon", propTheme: "neonpost", enemyType: "bot",
    deco: "🌃💡⚡", night: true, narrow: 0.88, double: 0.28, enemyName: "네온 오타봇", enemyColor: "#EC407A",
    curveAmp: 0.20, curveFreq: 0.78, hillAmp: 0.035, hillFreq: 0.95, bankMul: 0.09,
    tunnel: true, boostPads: true, padTypes: ["portalPair", "boost"], padsEnabled: true,
    gimmick: "cyberPortal", gimmickLabel: "🌀 사이버 워프 포탈 & ⚡ 터널",
    gimmickDesc: "스피드 터널 속 🔵↔🟠 쌍둥이 워프 포탈! 들어가면 반대쪽 출구 레인으로 워프해요!",
    choiceChance: 0.44,
    msg: "사이버 스피드 터널 진입! 🔵↔🟠 포탈 워프와 ⚡ 네온 부스트로 쾌속 질주!",
    mid: ["포탈을 통과하면 순간이동과 함께 잠시 무적이 돼요!", "네온 부스트 무적 질주 찬스를 노려요!", "시원한 해변이 가까워졌어요!"]
  },
  {
    name: "해변 파도 산책로", icon: "🌊", dur: 50, speed: 1.28, spawn: 1.15,
    sky: ["#06B6D4", "#CFFAFE"], ground: ["#FEF08A", "#F59E0B"], road: ["#D6D3D1", "#A8A29E"],
    roadStyle: "beach", propTheme: "palm", enemyType: "crab",
    deco: "🌊🐚🌴", sway: 0.40, wave: true, tidalWave: true, enemyName: "집게 오타몬", enemyColor: "#E11D48",
    curveAmp: 0.16, curveFreq: 0.70, hillAmp: 0.055, hillFreq: 0.85, bankMul: 0.07,
    padTypes: ["surfRamp", "tidal"], padsEnabled: true,
    gimmick: "surfRamp", gimmickLabel: "🏄 서핑 점프 램프 & 🌊 밀물",
    gimmickDesc: "🏄 서핑 램프를 밟으면 파도 위로 높게 날아오르고, 🌊 밀물 파도는 옆으로 밀어내요!",
    choiceChance: 0.46,
    msg: "울렁이는 해변 길! 🏄 서핑 램프로 공중 점프하고 밀물 파도와 집게몬을 피해요!",
    mid: ["서핑 램프로 날아오르면 적도 훌쩍 뛰어넘어요!", "파도 소리 들으며 맞춤법 퀴즈 척척!", "무지개 축제 불빛이 보여요!"]
  },
  {
    name: "무지개 축제 퍼레이드", icon: "🌈", dur: 52, speed: 1.32, spawn: 1.10,
    sky: ["#C084FC", "#FEF9C3"], ground: ["#BBF7D0", "#BFDBFE"], road: ["#7C3AED", "#4C1D95"],
    roadStyle: "rainbow", propTheme: "balloon", enemyType: "firework",
    deco: "🎈🎉🌈", confettiBg: true, sway: 0.30, double: 0.25, enemyName: "폭죽 악동", enemyColor: "#F43F5E",
    curveAmp: 0.18, curveFreq: 0.75, hillAmp: 0.045, hillFreq: 0.9, bankMul: 0.08,
    mirrorEvent: true, padTypes: ["mirrorGate", "warp"], padsEnabled: true,
    gimmick: "mirrorParade", gimmickLabel: "🎭 거울 반전 게이트 & 양자택일",
    gimmickDesc: "🎭 거울 게이트를 지나면 잠시 좌/우 버튼이 거꾸로 바뀌어요! 헷갈리지 마세요!",
    choiceChance: 0.68, bonusChance: 0.32,
    msg: "무지개 축제! 두 단어 중 바른 말을 고르고, 🎭 거울 반전 이벤트가 오면 침착하게!",
    mid: ["거울 모드일 땐 버튼 글자를 잘 보고 움직여요!", "뜻과 모양을 비교하며 바른 말을 골라요!", "다음은 반짝이는 반딧불 숲길!"]
  },
  {
    name: "반짝반짝 반딧불 숲길", icon: "🪲", dur: 52, speed: 1.30, spawn: 1.14,
    sky: ["#064E3B", "#34D399"], ground: ["#166534", "#052E16"], road: ["#3F6212", "#1A2E05"],
    roadStyle: "forest", propTheme: "mushroom", enemyType: "thorn",
    deco: "🌲🪲🍄", fireflies: true, sway: 0.26, enemyName: "가시 오타고슴", enemyColor: "#B91C1C",
    curveAmp: 0.21, curveFreq: 0.80, hillAmp: 0.05, hillFreq: 0.95, bankMul: 0.09,
    padTypes: ["vineRail", "portalPair"], padsEnabled: true,
    gimmick: "vineRail", gimmickLabel: "🌿 덩굴 레일 그라인드 & 🧲 자석",
    gimmickDesc: "구불구불 숲길 속 🌿 빛나는 덩굴 레일을 타면 무적 활주 + 🧲 자석으로 단어가 모여요!",
    magnetChance: 0.26, spotlight: true, choiceChance: 0.52,
    msg: "구불구불 반딧불 숲! 🌿 덩굴 레일 그라인드와 🌀 숲속 워프로 신나게 달려요!",
    mid: ["덩굴 레일 위에서 반짝반짝 미끄러지며 단어를 쓸어 담아요!", "자석 아이템으로 어려운 단어도 척척!", "숲 출구까지 얼마 안 남았어요!"]
  },
  {
    name: "구름 위 무지개 다리", icon: "☁️", dur: 52, speed: 1.34, spawn: 1.12,
    sky: ["#2563EB", "#DBEAFE"], ground: ["#E0F2FE", "#7DD3FC"], road: ["#F8FAFC", "#CBD5E1"],
    roadStyle: "cloud", propTheme: "cloudpillar", enemyType: "storm",
    deco: "☁️🌈🕊️", clouds: true, narrow: 0.90, double: 0.24, enemyName: "먹구름 악령", enemyColor: "#7C3AED",
    curveAmp: 0.18, curveFreq: 0.72, hillAmp: 0.075, hillFreq: 1.05, bankMul: 0.08,
    cloudJump: true, padTypes: ["cloud", "skyWarp", "bridgeGap"], padsEnabled: true,
    gimmick: "skyHills", gimmickLabel: "☁️ 롤러코스터 구름 & 🌀 천상 워프",
    gimmickDesc: "오르락내리락 구름 언덕! ☁️ 점프대와 🌀 천상 워프 게이트로 하늘을 날아다녀요!",
    choiceChance: 0.55,
    msg: "롤러코스터처럼 오르내리는 구름 다리! ☁️ 점프대와 🌀 천상 워프를 타보세요!",
    mid: ["구름 점프대로 하늘을 날며 적을 뛰어넘어요!", "천상 워프를 타면 황금 별빛 보너스!", "무지개 끝이 보여요! 조금만 더!"]
  },
  {
    name: "산호빛 바닷속 터널", icon: "🐠", dur: 54, speed: 1.38, spawn: 1.10,
    sky: ["#0E7490", "#22D3EE"], ground: ["#67E8F9", "#0E7490"], road: ["#164E63", "#083344"],
    roadStyle: "coral", propTheme: "coral", enemyType: "puffer",
    deco: "🐠🪸🫧", bubbles: true, wave: true, sway: 0.30, enemyName: "복어 오타몬", enemyColor: "#DB2777",
    curveAmp: 0.19, curveFreq: 0.82, hillAmp: 0.04, hillFreq: 0.95, bankMul: 0.09,
    tunnel: true, current: true, gravityFlipEvent: true,
    padTypes: ["gravityGate", "conveyorL", "conveyorR"], padsEnabled: true,
    gimmick: "gravityTunnel", gimmickLabel: "🙃 중력 반전 소용돌이 & 해류",
    gimmickDesc: "바닷속 유리 터널에서 🙃 중력 반전 게이트가 열리면 천장 도로를 거꾸로 달려요!",
    shieldChance: 0.28, choiceChance: 0.58,
    msg: "유리 해저 터널! 🙃 중력 반전이 일어나면 천장으로 뒤집혀 달려도 당황하지 마세요!",
    mid: ["천장으로 뒤집혀도 좌/우 방향은 그대로예요!", "거품 보호막이 있으면 한 번 부딪혀도 안전!", "수면 빛이 보여요! 우주 피날레 직전!"]
  },
  {
    name: "달빛 우주 배송 피날레", icon: "🚀", dur: 58, speed: 1.44, spawn: 1.04,
    sky: ["#0F172A", "#4C1D95"], ground: ["#1E1B4B", "#020617"], road: ["#1E293B", "#090D16"],
    roadStyle: "galaxy", propTheme: "starbuoy", enemyType: "alien",
    deco: "🌙🪐🚀", night: true, stars: true, narrow: 0.88, double: 0.34, enemyName: "우주 오타외계인", enemyColor: "#E11D48",
    curveAmp: 0.23, curveFreq: 0.88, hillAmp: 0.06, hillFreq: 1.1, bankMul: 0.11,
    tunnel: true, boostPads: true, gravityFlipEvent: true, bossChase: true,
    padTypes: ["counterPad", "portalPair", "boost", "gravityGate"], padsEnabled: true,
    gimmick: "bossFinale", gimmickLabel: "👾 오타 마왕 보스전 & 우주 총집합",
    gimmickDesc: "거대 오타 마왕의 ⚠️ 레이저를 좌우로 피하고, ⚡ 별 반격 패드를 밟아 보스를 공격하세요!",
    magnetChance: 0.22, shieldChance: 0.22, bonusChance: 0.3, choiceChance: 0.65,
    msg: "최종 우주 피날레! 거대 오타 마왕의 레이저를 피하고 ⚡ 반격 패드로 물리치세요!",
    mid: ["오타 마왕이 레이저를 조준해요! 빨간 경고를 보고 피하세요!", "⚡ 별 반격 패드를 밟아 오타 마왕에게 스타 빔 발사!", "지구 귀환 직전! 맞춤법 마스터까지 화이팅!"]
  }
];
