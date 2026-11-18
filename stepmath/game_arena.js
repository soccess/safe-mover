"use strict";

/* ============================================================
   태블릿 SVG 게임 아레나 (21단계 화폐계산 선수지식 게임화)
   - 근거 기반 설계:
     1) NeurekaNUM (2025/2026): 멘탈 수직선 추정, 서비타이징, 10진 변환
     2) Ronit Bird Dyscalculia Toolkit (Archive.org): 점 패턴, 10칸 보수, 10 거쳐 더하기, 공평 나누기
     3) Functional Math & Touchscreen SEG (2024-2026): 직접 터치 조작, 화폐 계산 선수지식 연결
   ============================================================ */
(function (global) {
  const STAGE_MONEY_META = {
    1: { gameTitle: "🧺 마트 진열대 & 동전 분류 게임", moneyLink: "10원·50원·100원 동전과 물건을 종류별로 구분하는 기초예요.", mascot: "bunny" },
    2: { gameTitle: "✨ 1원 보물 팡팡! 한눈에 세기", moneyLink: "동전을 하나씩 짚어 세고 한눈에 개수를 알아보는 힘이에요.", mascot: "bear" },
    3: { gameTitle: "🔟 10칸 보물상자 채우기 게임", moneyLink: "10개가 모이면 다음 큰 단위(10원×10=100원)가 되는 기초예요.", mascot: "bunny" },
    4: { gameTitle: "🪙 10원 묶음 + 1원 낱개 상점", moneyLink: "10원 1개와 낱개로 11원~20원 금액을 만드는 연습이에요.", mascot: "fox" },
    5: { gameTitle: "⚖️ 천칭 저울 가격 비교 게임", moneyLink: "어느 물건이 더 비싼지, 돈이 충분한지 비교하는 힘이에요.", mascot: "bear" },
    6: { gameTitle: "🛒 장바구니 쏙쏙 합체 게임", moneyLink: "물건 두 개의 값을 하나로 더해 총액을 구하는 기초예요.", mascot: "bunny" },
    7: { gameTitle: "🎈 거스름돈 덜어내기 팡팡!", moneyLink: "가진 돈에서 물건 값을 빼고 남은 거스름돈을 세는 기초예요.", mascot: "fox" },
    8: { gameTitle: "⚡ 10칸 터보 부스터 게임", moneyLink: "70원+50원=120원처럼 10(100)을 먼저 채워 암산하는 기술이에요.", mascot: "frog" },
    9: { gameTitle: "🐸 개구리 동전 연못 점프", moneyLink: "50원(5씩)·10원·100원(10씩) 동전을 빠르게 뛰어 세는 힘이에요.", mascot: "frog" },
    10: { gameTitle: "🚀 수직선 점프 타겟 게임", moneyLink: "부족한 돈이나 거스름돈 차이를 수직선에서 앞뒤로 찾아요.", mascot: "frog" },
    11: { gameTitle: "🏦 10원·1원 환전소 게임", moneyLink: "10개가 모이면 다음 자리(10원→100원)로 받아올림하는 핵심이에요.", mascot: "bear" },
    12: { gameTitle: "🔐 100원·10원·1원 마트 금고", moneyLink: "백·십·일 자릿값을 맞춰 100원~999원 금액을 계산해요.", mascot: "fox" },
    13: { gameTitle: "🎁 간식·동전 묶음 포장 공장", moneyLink: "같은 가격 물건을 여러 개 살 때(100원×4) 묶어 세는 힘이에요.", mascot: "bear" },
    14: { gameTitle: "🐾 동물 친구 공평한 파티 게임", moneyLink: "전체 금액이나 간식을 여러 친구와 똑같이 나누는 힘이에요.", mascot: "bunny" },
    15: { gameTitle: "🍕 셰프의 피자 반값 나누기", moneyLink: "반(1/2)·4분의 1(1/4) 개념으로 반값·나눔 계산을 익혀요.", mascot: "bear" },
    16: { gameTitle: "🧪 마법 물약 0.1 눈금 게임", moneyLink: "전체를 10등분해 10진법 크기 감각을 탄탄히 다져요.", mascot: "fox" },
    17: { gameTitle: "📏 문방구·주방 달인 측정 게임", moneyLink: "무게(g)·들이(mL)·길이(cm) 단위를 보고 값을 비교해요.", mascot: "fox" },
    18: { gameTitle: "🕒 마트 오픈·일과 시계 게임", moneyLink: "가게 여는 시간과 하루 일과 시각을 정확히 읽어요.", mascot: "bunny" },
    19: { gameTitle: "🪙 꿈의 마트 계산대 & 거스름돈", moneyLink: "10원·50원·100원·500원으로 물건을 사고 거스름돈을 내줘요!", mascot: "bunny" },
    20: { gameTitle: "🤖 도형 로봇 & 보석 팔찌 게임", moneyLink: "동전·지폐의 모양을 구분하고 반복 규칙으로 묶음을 찾아요.", mascot: "fox" },
    21: { gameTitle: "📊 우리 반 마트 그래프 게임", moneyLink: "팔린 물건 그래프를 보고 합계와 차이를 계산해요.", mascot: "bear" },
  };

  const gameSession = {
    score: 0,
    combo: 0,
    sandboxMode: false,
    missionKey: "",
    mState: null,
  };

  function getArenaRoot() {
    return $('toolBody');
  }

  function svgItemTile(kind, label, countBadge) {
    const svg = global.SM_SVG ? global.SM_SVG.itemSVG(kind, 48) : '';
    return `<div class="gm-svg-chip">${svg}${label ? `<span>${label}</span>` : ''}${countBadge ? `<b>${countBadge}</b>` : ''}</div>`;
  }

  function getMissionsForStage(stageId) {
    const s = Number(stageId);
    const cur = typeof getStageCurriculum === 'function' ? getStageCurriculum(s) : null;
    const customProbs = (cur && Array.isArray(cur.problems)) ? cur.problems.filter((p) => p._isCustom) : [];
    const builtIn = BUILTIN_MISSIONS[s] || [];
    return customProbs.map((p, idx) => ({
      kind: 'choice_cards',
      title: p.prompt,
      easyTitle: p.easyPrompt || p.prompt,
      hint: p.hint || '차근차근 살펴보고 알맞은 보물 카드를 눌러 보세요.',
      choices: (p.choices || []).map((c) => ({ label: c.label, value: c.value, icon: 'star' })),
      answer: p.answer,
      okMsg: p.okMsg || '정답이에요! 정말 잘했어요!',
      speak: p.prompt,
      _customIdx: idx,
    })).concat(builtIn);
  }

  /* ============================================================
     21단계 × 6미션 = 126개 인터랙티브 SVG 미니게임 미션 정의
     ============================================================ */
  const BUILTIN_MISSIONS = {
    1: [
      { kind: 'sort_drag', title: '🍎 사과 2개와 🍋 레몬 1개를 알맞은 진열 바구니에 끌어 담아요!', easyTitle: '사과와 레몬을 바구니에 넣어요.', hint: '빨간 사과는 사과 바구니, 노란 레몬은 레몬 바구니로 끌어 놓으세요.', baskets: ['apple', 'lemon'], items: ['apple', 'lemon', 'apple'], okMsg: '우와! 마트 진열대에 딱 맞게 분류했어요!' },
      { kind: 'sort_pick', title: '진열대에서 🍇 보라색 포도 2개만 찾아 바구니에 끌어 담아요!', easyTitle: '포도 2개만 바구니에 담아요.', hint: '사과와 레몬은 두고, 보라색 포도만 바구니로 끌어 보세요.', targetKind: 'grape', targetCount: 2, items: ['apple', 'grape', 'apple', 'lemon', 'grape'], okMsg: '포도 2개를 정확히 골라 담았어요!' },
      { kind: 'sort_drag', title: '과일 5개(사과·레몬·포도)를 모두 자기 바구니로 옮겨요!', easyTitle: '과일 5개를 바구니에 나누어요.', hint: '과일을 하나씩 끌어 같은 그림 바구니에 넣으세요.', baskets: ['apple', 'lemon', 'grape'], items: ['lemon', 'grape', 'apple', 'lemon', 'grape'], okMsg: '세 가지 과일을 모두 완벽하게 진열했어요!' },
      { kind: 'sort_pick', title: '💛 노란색 과일 코너! 노란 과일(레몬·바나나)만 노란 바구니에 담아요!', easyTitle: '노란 과일만 바구니에 넣어요.', hint: '색깔이 노란 레몬과 바나나를 찾아 끌어 놓으세요.', targetKinds: ['lemon', 'banana'], targetCount: 3, targetLabel: '노란 과일 바구니', targetColor: '#eab308', items: ['lemon', 'apple', 'banana', 'grape', 'lemon'], okMsg: '노란색 과일끼리 멋지게 모았어요!' },
      { kind: 'sort_pick', title: '🪙 동전 분류 연습! 섞인 동전 중에서 100원 동전만 은색 저금통에 넣어요!', easyTitle: '100원 동전만 저금통에 넣어요.', hint: '동전에 적힌 숫자 100을 보고 은색 저금통으로 끌어 보세요.', targetKind: 'coin100', targetCount: 3, targetLabel: '100원 저금통', targetColor: '#475569', items: ['coin10', 'coin100', 'coin50', 'coin100', 'coin100'], okMsg: '최고! 100원 동전을 한눈에 구분했어요!' },
      { kind: 'sort_pick', title: '⚽ 동그란 모양 찾기! 둥근 물건만 동그라미 상자에 끌어 넣어요!', easyTitle: '동그란 물건만 상자에 넣어요.', hint: '모서리가 없는 둥근 공과 귤, 동전을 찾아보세요.', targetKinds: ['ball', 'orange', 'coin100'], targetCount: 3, targetLabel: '동그란 상자', targetColor: '#2563eb', items: ['ball', 'box', 'orange', 'eraser', 'coin100'], okMsg: '둥근 모양 물건을 척척 찾아냈어요!' },
    ],

    2: [
      { kind: 'tenframe_fill', title: '보석 상자에 반짝이는 1원 보석 3개를 끌어 채워요!', easyTitle: '보석 3개를 채워요.', hint: '아래 보석(1원)을 손가락으로 끌어 5칸 판에 3개 놓으세요.', maxSlots: 5, start: 0, target: 3, itemKind: 'gem', okMsg: '하나, 둘, 셋! 보석 3개를 채웠어요!' },
      { kind: 'polka_pair', title: '✨ Tiny Polka Dot! 점 무늬 카드와 같은 숫자 카드를 짝지어 터뜨려요! (2, 4, 5)', easyTitle: '점 개수와 같은 숫자를 짝지어요.', hint: '점 카드 1장과 같은 숫자가 적힌 카드 1장을 차례로 눌러 짝지으세요.', nums: [2, 4, 5], itemKind: 'apple', okMsg: '와! 점 무늬와 숫자를 완벽하게 짝지었어요!' },
      { kind: 'tenframe_fill', title: '1개 있는 보물판에 보석을 더 끌어 5칸을 꽉 채워요!', easyTitle: '5칸을 꽉 채워요.', hint: '보석 4개를 더 끌어 5칸 모두 채워 보세요.', maxSlots: 5, start: 1, target: 5, itemKind: 'coin1', okMsg: '5칸 한 줄이 가득 찼어요!' },
      { kind: 'tenframe_fill', title: '별이 2개 있어요! 별을 더 끌어 모두 3개로 만들어요!', easyTitle: '별 3개로 만들어요.', hint: '별 1개를 더 끌어 놓으면 3개가 돼요.', maxSlots: 5, start: 2, target: 3, itemKind: 'star', okMsg: '2개에 1개를 더해 3개가 되었어요!' },
      { kind: 'stone_bridge', title: '징검다리 빈 돌에 알맞은 숫자 돌을 끌어 놓아요! (1 - 2 - ? - 4 - 5)', easyTitle: '2 다음 숫자 돌을 놓아요.', hint: '하나, 둘, 다음은 셋(3)이에요!', seq: [1, 2, null, 4, 5], answer: 3, choices: [2, 3, 4, 5], okMsg: '딩동댕! 1, 2, 3, 4, 5 징검다리 완성!' },
      { kind: 'tap_count', title: '강아지 5마리를 왼쪽부터 차례대로 눌러 번호를 달아줘요!', easyTitle: '강아지를 차례로 눌러 세어요.', hint: '강아지를 1번부터 5번까지 모두 터치해 보세요.', itemKind: 'puppy', count: 5, okMsg: '1, 2, 3, 4, 5! 다섯 마리를 모두 세었어요!' },
    ],

    3: [
      { kind: 'tenframe_fill', title: '윗줄 5칸이 찼어요! 아랫줄에 10원 동전을 끌어 모두 7개로 만들어요!', easyTitle: '7개가 되도록 채워요.', hint: '5 다음 6, 7! 2칸을 더 채우면 7개예요.', maxSlots: 10, start: 5, target: 7, itemKind: 'coin10', okMsg: '5개와 2개로 7개를 만들었어요!' },
      { kind: 'polka_pair', title: '✨ YouCubed 도트 스냅! 10칸 점 무늬와 숫자(7, 8, 9)를 짝지어 터뜨려요!', easyTitle: '점 개수와 숫자 카드를 짝지어요.', hint: '윗줄 5개 + 아랫줄 개수를 세어 같은 숫자 카드와 짝지으세요.', nums: [7, 8, 9], tenFrameMode: true, okMsg: '한눈에 7, 8, 9를 찾아냈어요!' },
      { kind: 'tenframe_fill', title: '6개 채워진 판을 10개로 꽉 채워 10묶음을 완성해요!', easyTitle: '10칸을 모두 채워요.', hint: '빈칸 4개를 채우면 10개 한 묶음이 돼요!', maxSlots: 10, start: 6, target: 10, itemKind: 'coin10', okMsg: '와! 10원 10개면 100원 준비 완료!' },
      { kind: 'subitize_match', title: '사과가 5개 묶음과 3개 있어요! 모두 몇 개일까요?', easyTitle: '사과 개수를 맞혀 보세요.', hint: '5에서 6, 7, 8 하고 이어 세어 보세요.', showKind: 'apple', count: 8, groupFive: true, choices: [6, 7, 8, 9], okMsg: '정확해요! 5와 3으로 모두 8개예요!' },
      { kind: 'tenframe_fill', title: '9개에서 1이 더 커지면 얼마가 될까요? 마지막 1개를 끌어 채워요!', easyTitle: '9에 1을 더해 10을 만들어요.', hint: '마지막 빈칸에 코인 1개를 끌어 넣으세요.', maxSlots: 10, start: 9, target: 10, itemKind: 'gem', okMsg: '9 다음은 10! 10칸 보물상자 완성!' },
      { kind: 'make10_pairs', title: '⚡ Math for Love 10 짝꿍 스냅! 합쳐서 10이 되는 두 카드를 차례로 눌러 합체해요!', easyTitle: '더해서 10이 되는 카드 두 장을 눌러요.', hint: '4+6=10, 1+9=10, 5+5=10! 짝꿍 두 장을 연속으로 눌러 보세요.', cards: [4, 1, 5, 6, 9, 5], okMsg: '번개 합체! 10의 보수 짝꿍을 모두 찾았어요!' },
    ],

    4: [
      { kind: 'teen_shop', title: '손님 주문 13원! 10원 동전 1개와 1원 동전 3개를 계산대에 올려요!', easyTitle: '10원 1개와 1원 3개를 올려요.', hint: '10원 코인 1개, 1원 코인 3개를 계산대 매트로 끌어 놓으세요.', target: 13, okMsg: '딱 13원! 10과 3이 만나 13이에요!' },
      { kind: 'teen_shop', title: '손님 주문 16원! 10원 묶음과 1원 낱개로 16을 만들어요!', easyTitle: '10과 6으로 16을 만들어요.', hint: '10원 1개와 1원 6개를 계산대에 끌어 올리세요.', target: 16, okMsg: '완벽해요! 10 + 6 = 16!' },
      { kind: 'stone_bridge', title: '숫자 다리 빈칸을 채워요! (14 - 15 - ? - 17)', easyTitle: '15 다음 숫자를 놓아요.', hint: '14, 15 다음에 오는 숫자 돌을 끌어 넣으세요.', seq: [14, 15, null, 17], answer: 16, choices: [13, 16, 18, 19], okMsg: '정답! 15 다음은 16이에요!' },
      { kind: 'teen_shop', title: '사탕 10개 봉지와 낱개 8개! 10원 1개와 1원 8개로 18을 만들어요!', easyTitle: '10과 8로 18을 만들어요.', hint: '10원 1개 + 1원 8개를 올려 18을 만들어 보세요.', target: 18, okMsg: '멋져요! 10과 8이 만나 18이에요!' },
      { kind: 'teen_shop', title: '19보다 1 큰 수는? 10원 2개(20원)로 20을 만들어 봐요!', easyTitle: '10원 2개로 20을 만들어요.', hint: '10원 동전 2개를 올리면 20원이 돼요!', target: 20, okMsg: '딩동댕! 19 다음은 10묶음 2개인 20이에요!' },
      { kind: 'tug_of_war', title: '🚩 줄다리기 대결! 12와 15 중 더 힘이 센 큰 수 팀을 당겨 이겨요!', easyTitle: '12와 15 중 큰 팀을 눌러요.', hint: '십의 자리는 1로 같고, 낱개 2와 5 중 5가 커서 15가 더 커요!', left: 12, right: 15, pick: 'larger', okMsg: '영차! 15가 12보다 더 커요 (12 < 15)!' },
    ],

    5: [
      { kind: 'tug_of_war', title: '🚩 NRICH 줄다리기 대결! 7팀과 5팀 중 더 큰 팀을 눌러 줄을 당겨 이겨요!', easyTitle: '더 큰 수 팀을 눌러 줄다리기를 이겨요.', hint: '7이 5보다 커서 왼쪽 7팀이 더 힘이 세요!', left: 7, right: 5, pick: 'larger', okMsg: '영차! 7팀 승리 (7 > 5)!' },
      { kind: 'scale_build', title: '양쪽 저울 접시에 구슬을 끌어 왼쪽 8개, 오른쪽 3개로 맞춰요!', easyTitle: '왼쪽 8개, 오른쪽 3개로 맞춰요.', hint: '구슬을 왼쪽 접시에 8개, 오른쪽 접시에 3개가 되도록 놓으세요.', startLeft: 4, startRight: 4, targetLeft: 8, targetRight: 3, okMsg: '완성! 8이 3보다 5개 더 많아서 왼쪽이 기울었어요!' },
      { kind: 'scale_sign', title: '4와 9 사이에 들어갈 알맞은 악어 입 기호를 끌어 넣어요!', easyTitle: '4와 9 사이에 기호를 넣어요.', hint: '입이 더 큰 수(9) 쪽으로 벌어져야 해요!', left: 4, right: 9, answer: '<', okMsg: '정답이에요! 4 < 9!' },
      { kind: 'scale_sign', title: '왼쪽 6개, 오른쪽 6개! 저울이 똑같을 때 쓰는 기호를 넣어요!', easyTitle: '두 수가 같을 때 기호를 넣어요.', hint: '양쪽 무게가 같으면 같다(=) 기호를 끌어 넣어요.', left: 6, right: 6, answer: '=', okMsg: '맞아요! 6 = 6 똑같아요!' },
      { kind: 'order_pick', title: '할인 코너! 세 가격(10원, 4원, 7원) 중 가장 작은 수를 찾아요!', easyTitle: '가장 작은 수를 누르세요.', hint: '수가 가장 적은 4를 찾아 눌러 보세요.', items: [10, 4, 7], pick: 'min', okMsg: '정답! 4가 가장 작은 수예요!' },
      { kind: 'tug_of_war', title: '🚩 결승 줄다리기! 12팀과 15팀 중 더 힘이 센 큰 팀을 눌러요!', easyTitle: '12와 15 중 더 큰 팀을 눌러요.', hint: '15가 12보다 3만큼 더 커요!', left: 12, right: 15, pick: 'larger', okMsg: '와아! 15팀이 줄을 당겨 우승했어요 (12 < 15)!' },
    ],

    6: [
      { kind: 'cart_combine', title: '장바구니 합치기! 사과 3개와 초록 사과 5개를 모두 큰 장바구니에 끌어 모아요!', easyTitle: '3개와 5개를 장바구니에 모아요.', hint: '두 접시의 사과를 모두 가운데 큰 장바구니로 끌어 담으세요.', a: 3, b: 5, kindA: 'apple', kindB: 'greenApple', okMsg: '3 + 5 = 8! 모두 8개를 모았어요!' },
      { kind: 'cart_combine', title: '쿠키 4개와 2개를 접시로 모두 모아 4 + 2를 완성해요!', easyTitle: '4개와 2개를 모아요.', hint: '쿠키를 모두 가운데 접시로 끌어 놓으세요.', a: 4, b: 2, kindA: 'cookie', kindB: 'cookie', okMsg: '4 + 2 = 6! 쿠키가 모두 6개예요!' },
      { kind: 'cart_combine', title: '구슬 5개와 4개를 보석함에 모두 끌어 담아 5 + 4를 완성해요!', easyTitle: '5개와 4개를 모아요.', hint: '두 묶음의 구슬을 모두 가운데 함으로 끌어 보세요.', a: 5, b: 4, kindA: 'gem', kindB: 'star', okMsg: '훌륭해요! 5 + 4 = 9!' },
      { kind: 'bubble_merge', title: '🫧 Sumoku 방울 합체! 둥실둥실 떠있는 방울 중 두 개를 눌러 8을 만들어요!', easyTitle: '두 방울을 눌러 8을 만들어요.', hint: '2와 6 (또는 3과 5) 방울을 차례로 눌러 보세요!', target: 8, bubbles: [2, 6, 1, 9, 4], okMsg: '펑! 방울 두 개가 합쳐져 8이 되었어요!' },
      { kind: 'cart_combine', title: '1개와 8개를 모두 장바구니에 담아 1 + 8을 완성해요!', easyTitle: '1개와 8개를 모아요.', hint: '모두 가운데 바구니로 끌어 놓으세요.', a: 1, b: 8, kindA: 'orange', kindB: 'apple', okMsg: '완벽해요! 1 + 8 = 9!' },
      { kind: 'bubble_merge', title: '🫧 문방구 방울 합체! 연필(3)과 지우개(4)처럼 두 방울을 합쳐 7을 만들어요!', easyTitle: '두 방울을 합쳐 7을 만들어요.', hint: '3과 4 방울을 차례로 눌러 7을 완성하세요!', target: 7, bubbles: [3, 4, 1, 8, 2], okMsg: '정답! 3 + 4 = 모두 7개예요!' },
    ],

    7: [
      { kind: 'take_away', title: '사과 8개 중 3개를 손님 봉투로 끌어 덜어내요! (8 - 3)', easyTitle: '8개에서 3개를 봉투에 넣어요.', hint: '사과 3개를 손가락으로 끌어 오른쪽 손님 봉투에 넣으세요.', total: 8, remove: 3, itemKind: 'apple', okMsg: '8 - 3 = 5! 접시에 5개가 남았어요!' },
      { kind: 'take_away', title: '7개에서 2개를 덜어내어 7 - 2를 완성해요!', easyTitle: '7개에서 2개를 빼요.', hint: '2개를 오른쪽 봉투로 끌어 덜어내세요.', total: 7, remove: 2, itemKind: 'orange', okMsg: '잘했어요! 7 - 2 = 5!' },
      { kind: 'bowling_sub', title: '🎳 볼링 핀 빼기 게임! 핀 9개 중 4개를 눌러 쓰러뜨려요! (9 - 4)', easyTitle: '핀 4개를 쓰러뜨려요.', hint: '볼링 핀 4개를 눌러 쓰러뜨리고 남은 5개를 확인하세요!', total: 9, remove: 4, okMsg: '스트라이크! 9 - 4 = 5개가 남았어요!' },
      { kind: 'take_away', title: '6개에서 6개를 모두 상자에 담으면 몇 개가 남을까요? (6 - 6)', easyTitle: '6개를 모두 빼요.', hint: '6개를 전부 오른쪽 상자로 옮겨 보세요.', total: 6, remove: 6, itemKind: 'candy', okMsg: '맞아요! 6 - 6 = 0개예요!' },
      { kind: 'take_away', title: '10원 동전 10개 중 물건 값 3원을 계산대에 내요! (10 - 3)', easyTitle: '10개에서 3개를 빼요.', hint: '동전 3개를 계산대 상자로 끌어 거스름돈 7원을 확인해요.', total: 10, remove: 3, itemKind: 'coin1', okMsg: '훌륭해요! 10 - 3 = 7원이 남았어요!' },
      { kind: 'bowling_sub', title: '🎳 볼링 핀 빼기! 핀 8개 중 5개를 쓰러뜨려 8 - 5를 완성해요!', easyTitle: '핀 5개를 쓰러뜨려요.', hint: '핀 5개를 눌러 쓰러뜨리면 3개가 남아요!', total: 8, remove: 5, okMsg: '딩동댕! 8 - 5 = 3개가 남았어요!' },
    ],

    8: [
      { kind: 'make_ten_game', title: '7칸이 채워졌어요! 오른쪽에서 3개를 끌어 먼저 10을 완성해요!', easyTitle: '빈칸 3개를 채워 10을 만들어요.', hint: '오른쪽 초록 점을 왼쪽 빈칸으로 3번 끌어 놓으세요.', a: 7, b: 5, stopAtTen: true, okMsg: '성공! 7 + 3 = 10 완성!' },
      { kind: 'make_ten_game', title: '7 + 5 터보 계산! 먼저 10을 만든 뒤 정답 12 버튼을 눌러요!', easyTitle: '10을 만들고 7 + 5 정답을 눌러요.', hint: '오른쪽 점 3개를 왼쪽으로 끌어 10을 만들고, 10 + 2 = 12를 확인하세요.', a: 7, b: 5, okMsg: '멋져요! 7 + 5 = 10 + 2 = 12!' },
      { kind: 'make_ten_game', title: '8 + 4 터보 계산! 8에 2를 채워 10을 만들고 합계를 완성해요!', easyTitle: '8에서 10을 만들고 8 + 4를 풀어요.', hint: '오른쪽에서 2개를 왼쪽 빈칸으로 끌어 10을 만들어 보세요.', a: 8, b: 4, okMsg: '정답이에요! 8 + 4 = 12!' },
      { kind: 'make_ten_game', title: '9 + 6 터보 계산! 9에 딱 1개만 옮겨 10 + 5를 만들어요!', easyTitle: '9에 1개를 옮겨 10을 만들어요.', hint: '오른쪽에서 1개를 끌어 10을 만든 뒤 15를 선택하세요.', a: 9, b: 6, okMsg: '완벽해요! 9 + 6 = 15!' },
      { kind: 'make_ten_game', title: '6 + 5 터보 계산! 6에 4개를 채워 10을 만들고 남은 1을 더해요!', easyTitle: '6에 4개를 옮겨 10을 만들어요.', hint: '오른쪽에서 4개를 왼쪽 빈칸으로 끌어 10을 만들어 보세요.', a: 6, b: 5, okMsg: '딩동댕! 6 + 5 = 11!' },
      { kind: 'make_ten_game', title: '8 + 6 터보 계산! 8을 10으로 먼저 변신시켜요!', easyTitle: '8을 10으로 만들고 8 + 6을 풀어요.', hint: '오른쪽 점 2개를 왼쪽으로 옮겨 10 + 4 = 14를 만들어요.', a: 8, b: 6, okMsg: '정답! 8 + 6 = 14예요!' },
    ],

    9: [
      { kind: 'pond_jump', title: '2씩 뛰어 세기! 개구리 연못의 빈 연잎에 알맞은 숫자를 끌어 놓아요!', easyTitle: '2, 4, ? , 8 빈칸을 채워요.', hint: '2씩 커져요. 4 다음은 6이에요!', step: 2, seq: [2, 4, null, 8], answer: 6, choices: [5, 6, 7], okMsg: '개굴! 2, 4, 6, 8 뛰어 세기 성공!' },
      { kind: 'pond_jump', title: '50원 동전처럼 5씩 뛰어 세기! 5, 10, ?, 20 빈칸을 채워요!', easyTitle: '5, 10, ? , 20 빈칸을 채워요.', hint: '10에서 5만큼 더 가면 15예요!', step: 5, seq: [5, 10, null, 20], answer: 15, choices: [12, 15, 18], coinMode: 50, okMsg: '잘했어요! 5, 10, 15, 20!' },
      { kind: 'pond_jump', title: '10원·100원처럼 10씩 뛰어 세기! 10, 20, 30, ? 다음 수를 놓아요!', easyTitle: '10, 20, 30 다음 수를 놓아요.', hint: '30에 10을 더하면 40이에요!', step: 10, seq: [10, 20, 30, null], answer: 40, choices: [35, 40, 50], coinMode: 100, okMsg: '정답! 10, 20, 30, 40!' },
      { kind: 'pond_jump', title: '양말이 2짝씩 4묶음! 개구리를 4번째 연잎(8)까지 점프시켜요!', easyTitle: '2, 4, 6, ? 네 번째 수를 채워요.', hint: '2, 4, 6 다음은 8짝이에요!', step: 2, seq: [2, 4, 6, null], answer: 8, choices: [6, 8, 10], okMsg: '멋져요! 2씩 4번이면 모두 8짝!' },
      { kind: 'pond_jump', title: '5씩 3번 뛰어 세기! 5, 10 다음에 도착할 숫자를 채워요!', easyTitle: '5, 10 다음 수를 채워요.', hint: '10 + 5 = 15예요!', step: 5, seq: [5, 10, null], answer: 15, choices: [15, 20, 25], coinMode: 50, okMsg: '정답! 5씩 3번은 15예요!' },
      { kind: 'pond_jump', title: '10, 20, 30, 40, ? — 10씩 뛰어 세기 마지막 연잎을 채워요!', easyTitle: '40 다음 10 큰 수를 놓아요.', hint: '40에 10을 더하면 50이에요.', step: 10, seq: [10, 20, 30, 40, null], answer: 50, choices: [45, 50, 60], coinMode: 100, okMsg: '완벽해요! 50까지 점프 골인!' },
    ],

    10: [
      { kind: 'nl_jump', rocket: true, title: '🚀 로켓 수직선! 8에서 앞으로 4칸 비행해 8 + 4 행성(12)에 착륙해요!', easyTitle: '로켓을 12 자리에 착륙시켜요.', hint: '로켓을 오른쪽으로 끌어 12 깃발에 놓으세요.', start: 8, op: '+', delta: 4, target: 12, okMsg: '정확해요! 8 + 4 = 12 행성 착륙!' },
      { kind: 'nl_jump', rocket: true, title: '🚀 15에서 왼쪽으로 6칸 역추진! 15 - 6 행성(9)에 착륙해요!', easyTitle: '로켓을 뒤로 6칸 끌어 9에 놓아요.', hint: '15에서 왼쪽으로 6칸 가면 9예요.', start: 15, op: '-', delta: 6, target: 9, okMsg: '정답이에요! 15 - 6 = 9!' },
      { kind: 'strike_it_out', title: '⚡ NRICH Strike It Out! 수직선에서 두 숫자를 눌러 더해 목표(13)를 만들어요!', easyTitle: '두 숫자를 눌러 합쳐서 13을 만들어요.', hint: '6과 7을 차례로 누르면 6 + 7 = 13이 완성돼요!', nums: [3, 6, 7, 10, 13], target: 13, op: '+', okMsg: '스트라이크 아웃! 6 + 7 = 13 명중!' },
      { kind: 'nl_jump', rocket: true, title: '🚀 12에서 뒤로 5칸 점프! 12 - 5 타겟(7)에 착륙해요!', easyTitle: '로켓을 7 자리에 놓아요.', hint: '12에서 2칸 빼면 10, 3칸 더 빼면 7이에요.', start: 12, op: '-', delta: 5, target: 7, okMsg: '맞아요! 12 - 5 = 7!' },
      { kind: 'nl_jump', rocket: true, title: '🚀 9에서 앞으로 8칸 부스트! 9 + 8 타겟(17)에 착륙해요!', easyTitle: '로켓을 17 자리에 놓아요.', hint: '9에서 1칸 가면 10, 7칸 더 가면 17!', start: 9, op: '+', delta: 8, target: 17, okMsg: '훌륭해요! 9 + 8 = 17!' },
      { kind: 'strike_it_out', title: '⚡ NRICH Strike It Out! 두 숫자를 빼서 목표(10)를 만들어요! (14 - 4)', easyTitle: '큰 수에서 작은 수를 빼서 10을 만들어요.', hint: '14와 4를 차례로 누르면 14 - 4 = 10이 돼요!', nums: [4, 5, 9, 14], target: 10, op: '-', okMsg: '완벽해요! 14 - 4 = 10 명중!' },
    ],

    11: [
      { kind: 'place_exchange', title: '십(10원) 2개와 일(1원) 5개를 환전대에 끌어 올려 25를 만들어요!', easyTitle: '모형으로 25를 만들어요.', hint: '10원(십) 2개와 1원(일) 5개를 알맞은 자리 칸에 끌어 놓으세요.', startT: 0, startU: 0, target: 25, mode: 'build', okMsg: '정답! 20 + 5 = 25예요!' },
      { kind: 'place_exchange', title: '24 + 18 받아올림! 먼저 42개 모형 중 일 10개를 십 1개로 묶어 환전해요!', easyTitle: '일 10개를 십 1개로 묶어 42를 만들어요.', hint: '일 12개 중 10개를 "⚡ 10개 묶기" 버튼으로 십모형 1개로 바꿔 42를 완성하세요.', startT: 3, startU: 12, target: 42, mode: 'bundle', okMsg: '와! 일 10개를 십 1개로 바꿔 24 + 18 = 42 완성!' },
      { kind: 'place_exchange', title: '35 - 12 덜어내기! 35에서 십 1개와 일 2개를 빼서 23을 남기세요!', easyTitle: '35에서 12를 빼서 23을 만들어요.', hint: '십의 자리에서 1개, 일의 자리에서 2개를 빼기 상자로 끌어 보세요.', startT: 3, startU: 5, target: 23, mode: 'sub', okMsg: '잘했어요! 35 - 12 = 23!' },
      { kind: 'place_exchange', title: '동전 환전 미션! 일모형(1원) 10개를 십모형(10원) 1개로 바꾸어요!', easyTitle: '일 10개를 십 1개로 바꾸어요.', hint: '"⚡ 10개 묶기"를 누르거나 일모형을 묶음 칸으로 끌어 보세요.', startT: 0, startU: 10, target: 10, requireTens: 1, mode: 'bundle', okMsg: '맞아요! 1원 10개 = 10원 1개와 같아요!' },
      { kind: 'place_exchange', title: '41 - 15 받아내림! 일 1개에서 5개를 뺄 수 없어요. 십 1개를 풀고 15를 빼요!', easyTitle: '십 1개를 풀어서 41 - 15 = 26을 만들어요.', hint: '먼저 "십 1개 풀기"로 일 11개를 만든 뒤, 십 1개와 일 5개를 빼서 26을 만들어요.', startT: 4, startU: 1, target: 26, mode: 'unbundle_sub', okMsg: '훌륭해요! 41 - 15 = 26!' },
      { kind: 'place_exchange', title: '16 + 23 합치기! 16에서 시작해 십 2개, 일 3개를 더해 39를 만들어요!', easyTitle: '16에 23을 더해 39를 만들어요.', hint: '십의 자리에 2개, 일의 자리에 3개를 더 끌어 놓아 39를 만드세요.', startT: 1, startU: 6, target: 39, mode: 'build', okMsg: '정답! 16 + 23 = 39!' },
    ],

    12: [
      { kind: 'vault_hundreds', title: '100원 금고 열기! 십(10원) 10개를 "100개 묶기"로 백(100원) 1개로 변신시켜요!', easyTitle: '십 10개를 백 1개로 묶어요.', hint: '"⚡ 100개 묶기" 버튼을 눌러 십 10개를 백모형 1개로 바꾸세요.', startH: 0, startT: 10, startU: 0, target: 100, requireH: 1, okMsg: '성공! 10원 10개 = 100원 1개!' },
      { kind: 'vault_hundreds', title: '125 + 143 금고 열기! 백 2개, 십 6개, 일 8개를 넣어 268을 만들어요!', easyTitle: '금고에 268을 채워요.', hint: '백의 자리 +1, 십의 자리 +4, 일의 자리 +3을 더해 268을 만드세요.', startH: 1, startT: 2, startU: 5, target: 268, okMsg: '금고 열림! 125 + 143 = 268!' },
      { kind: 'vault_hundreds', title: '비밀번호 234! 백 2개, 십 3개, 일 4개를 금고 칸에 채워요!', easyTitle: '백 2, 십 3, 일 4로 234를 만들어요.', hint: '백모형 2개, 십모형 3개, 일모형 4개를 끌어 놓으세요.', startH: 0, startT: 0, startU: 0, target: 234, okMsg: '딱 맞았어요! 234!' },
      { kind: 'vault_hundreds', title: '250 - 120 계산! 250에서 백 1개, 십 2개를 빼서 130을 남기세요!', easyTitle: '250에서 120을 빼서 130을 만들어요.', hint: '백의 자리에서 1개, 십의 자리에서 2개를 빼기(-) 하세요.', startH: 2, startT: 5, startU: 0, target: 130, okMsg: '잘했어요! 250 - 120 = 130!' },
      { kind: 'vault_hundreds', title: '100이 3개, 10이 0개, 1이 7개인 수 307을 금고에 채워요!', easyTitle: '금고에 307을 만들어요.', hint: '백 3개와 일 7개를 놓아요. 십의 자리는 0개예요!', startH: 0, startT: 0, startU: 0, target: 307, okMsg: '정확해요! 307!' },
      { kind: 'vault_hundreds', title: '312 + 105! 312에서 백 1개, 일 5개를 더해 417을 만들어요!', easyTitle: '312에 105를 더해 417을 만들어요.', hint: '백 +1, 일 +5를 놓아 417을 완성하세요.', startH: 3, startT: 1, startU: 2, target: 417, okMsg: '딩동댕! 312 + 105 = 417!' },
    ],

    13: [
      { kind: 'mul_factory', title: '3개씩 4묶음 선물 상자 포장하기! (3 × 4)', easyTitle: '3개 묶음 카드를 4곳에 채워요.', hint: '3개 묶음 카드(또는 낱개)를 끌어 빈 상자 4곳을 모두 채워요.', perGroup: 3, groups: 4, itemKind: 'apple', okMsg: '3개씩 4묶음 = 12개! 포장 완성!' },
      { kind: 'youcubed_array', title: '🟦 YouCubed 땅따먹기! 격자판에 "가로 5 × 세로 2" 직사각형을 찍어 10칸을 차지해요!', easyTitle: '2 × 5 땅따먹기 도장을 찍어요.', hint: '격자판의 아무 칸이나 누르면 2줄 × 5칸 블록이 멋지게 찍혀요!', rows: 2, cols: 5, okMsg: '대단해요! 2 × 5 = 10칸 땅을 차지했어요!' },
      { kind: 'mul_factory', title: '사탕 5개씩 3봉지! 5개 묶음을 3봉지에 채워요! (5 × 3)', easyTitle: '5개씩 3봉지를 채워요.', hint: '5개 묶음을 봉지 3곳에 모두 끌어 채우세요.', perGroup: 5, groups: 3, itemKind: 'candy', okMsg: '훌륭해요! 5 × 3 = 15개!' },
      { kind: 'youcubed_array', title: '🟦 YouCubed 땅따먹기! 격자판에 "가로 4 × 세로 2" 직사각형(8칸)을 찍어요!', easyTitle: '2 × 4 땅따먹기 도장을 찍어요.', hint: '격자판을 눌러 2줄 × 4칸 직사각형을 완성하세요!', rows: 2, cols: 4, okMsg: '정답이에요! 4 × 2 = 8칸!' },
      { kind: 'mul_factory', title: '5원(5개)씩 4묶음 동전 상자 채우기! (5 × 4)', easyTitle: '5개씩 4묶음을 채워요.', hint: '5개 묶음을 4곳에 모두 채우면 20이 돼요.', perGroup: 5, groups: 4, itemKind: 'coin10', okMsg: '완벽해요! 5 × 4 = 20!' },
      { kind: 'youcubed_array', title: '🟦 YouCubed 땅따먹기! "가로 3 × 세로 3" 정사각형(9칸)을 완성해요!', easyTitle: '3 × 3 정사각형 도장을 찍어요.', hint: '격자판을 눌러 3 × 3 = 9칸을 차지해 보세요!', rows: 3, cols: 3, okMsg: '딩동댕! 3 × 3 = 9칸 정복!' },
    ],

    14: [
      { kind: 'div_party', title: '사과 12개를 동물 친구 3명의 접시에 공평하게 나누어 줘요! (12 ÷ 3)', easyTitle: '12개를 3접시에 똑같이 나누어요.', hint: '사과를 끌어 3명의 접시에 각각 4개씩 똑같이 담으세요.', total: 12, plates: 3, itemKind: 'apple', okMsg: '공평해요! 한 친구당 4개씩 받았어요!' },
      { kind: 'div_party', title: '딸기 10개를 친구 2명에게 똑같이 나누어 줘요! (10 ÷ 2)', easyTitle: '10개를 2접시에 똑같이 나누어요.', hint: '두 접시에 각각 5개씩 똑같이 담아 보세요.', total: 10, plates: 2, itemKind: 'strawberry', okMsg: '정답! 10 ÷ 2 = 5개씩이에요!' },
      { kind: 'div_party', title: '쿠키 8개를 친구 4명에게 똑같이 나누어요! (8 ÷ 4)', easyTitle: '8개를 4접시에 똑같이 나누어요.', hint: '4접시에 2개씩 똑같이 나누어 담으세요.', total: 8, plates: 4, itemKind: 'cookie', okMsg: '맞아요! 한 접시에 2개씩이에요!' },
      { kind: 'div_party', title: '사탕 15개를 접시 5개에 똑같이 나누어요! (15 ÷ 5)', easyTitle: '15개를 5접시에 똑같이 나누어요.', hint: '5접시에 3개씩 똑같이 담으면 15개가 돼요.', total: 15, plates: 5, itemKind: 'candy', okMsg: '잘했어요! 15 ÷ 5 = 3개씩!' },
      { kind: 'div_party', title: '귤 6개를 친구 3명에게 똑같이 나누어 줘요! (6 ÷ 3)', easyTitle: '6개를 3접시에 똑같이 나누어요.', hint: '3접시에 2개씩 나누어 담아 보세요.', total: 6, plates: 3, itemKind: 'orange', okMsg: '훌륭해요! 6 ÷ 3 = 2!' },
      { kind: 'div_party', title: '별 16개를 친구 4명에게 공평하게 나누어 줘요! (16 ÷ 4)', easyTitle: '16개를 4접시에 똑같이 나누어요.', hint: '4접시에 4개씩 똑같이 담아 보세요.', total: 16, plates: 4, itemKind: 'star', okMsg: '정답! 16 ÷ 4 = 4개씩이에요!' },
    ],

    15: [
      { kind: 'pizza_game', title: '피자 4조각 중 1조각만 채워 1/4 피자를 서빙해요!', easyTitle: '피자 4조각 중 1조각을 채워요.', hint: '피자 1조각을 눌러 1/4을 만든 뒤 서빙 버튼을 누르세요.', denom: 4, start: 0, target: 1, okMsg: '정답! 4조각 중 1조각은 1/4이에요!' },
      { kind: 'pizza_game', title: '1/4 + 2/4 피자 합치기! 1조각이 있는 판에 2조각을 더 채워 3/4을 만들어요!', easyTitle: '1조각에 2조각을 더해 3/4을 만들어요.', hint: '피자 조각 2개를 더 눌러 3/4로 채워 보세요.', denom: 4, start: 1, target: 3, okMsg: '정답이에요! 1/4 + 2/4 = 3/4!' },
      { kind: 'frac_compare', title: '반 값 피자(1/2)와 1/4 피자 중 더 큰 쪽 피자를 골라 손님께 드려요!', easyTitle: '1/2과 1/4 중 더 큰 피자를 누르세요.', hint: '피자 1판의 딱 절반(1/2)이 1/4보다 훨씬 커요!', a: { n: 1, d: 2 }, b: { n: 1, d: 4 }, pick: 'larger', okMsg: '맞아요! 1/2은 2/4와 같아서 1/4보다 커요!' },
      { kind: 'pizza_game', title: '5조각 피자 중 3조각(3/5)에서 1조각(1/5)을 빼서 2/5를 만들어요!', easyTitle: '3/5에서 1조각을 빼서 2/5를 만들어요.', hint: '색칠된 피자 조각 1개를 눌러 덜어내면 2/5가 돼요.', denom: 5, start: 3, target: 2, okMsg: '잘했어요! 3/5 - 1/5 = 2/5!' },
      { kind: 'frac_compare', title: '2/4와 크기가 똑같은 반쪽 피자는 어느 것일까요?', easyTitle: '2/4와 같은 크기의 피자를 고르세요.', hint: '4조각 중 2조각은 딱 절반(1/2)과 똑같아요!', matchTarget: { n: 2, d: 4 }, choices: [{ n: 1, d: 2 }, { n: 1, d: 3 }, { n: 1, d: 4 }], answerIdx: 0, okMsg: '완벽해요! 2/4는 1/2과 크기가 똑같아요!' },
      { kind: 'pizza_game', title: '1/3 + 1/3 피자! 1조각이 있는 3조각 피자에 1조각을 더 채워 2/3을 만들어요!', easyTitle: '1/3에 1조각을 더해 2/3을 만들어요.', hint: '빈 조각 1개를 눌러 2/3을 만들어 보세요.', denom: 3, start: 1, target: 2, okMsg: '딩동댕! 1/3 + 1/3 = 2/3!' },
    ],

    16: [
      { kind: 'potion_game', title: '10칸 물약병에 0.1 방울 1개를 넣어 0.1 눈금을 채워요!', easyTitle: '물약병에 0.1을 채워요.', hint: '+0.1 버튼을 누르거나 방울을 끌어 0.1을 만들어 보세요.', start: 0, target: 1, okMsg: '정답! 10분의 1은 소수 0.1이에요!' },
      { kind: 'potion_game', title: '0.4 물약에 0.3 물약을 부어 0.7을 만들어요! (0.4 + 0.3)', easyTitle: '0.4에서 0.3을 더 부어 0.7을 만들어요.', hint: '+0.1을 3번(또는 +0.3) 부어서 0.7 눈금에 맞추세요.', start: 4, target: 7, stepChoice: 3, okMsg: '정답이에요! 0.4 + 0.3 = 0.7!' },
      { kind: 'potion_game', title: '0.8 물약에서 0.5를 덜어내어 0.3을 남겨요! (0.8 - 0.5)', easyTitle: '0.8에서 0.5를 빼서 0.3을 남기세요.', hint: '-0.1 버튼으로 5칸을 빼서 0.3 눈금을 맞추세요.', start: 8, target: 3, stepChoice: -5, okMsg: '잘했어요! 0.8 - 0.5 = 0.3!' },
      { kind: 'potion_compare', title: '0.5 물약병과 0.2 물약병 중 양이 더 많은 병을 눌러요!', easyTitle: '더 많은 물약병을 누르세요.', hint: '10칸 중 5칸(0.5)이 2칸(0.2)보다 많아요!', left: 5, right: 2, pick: 'larger', okMsg: '맞아요! 0.5가 0.2보다 더 커요!' },
      { kind: 'potion_game', title: '0.6 물약에 0.4를 더 부어 10칸(자연수 1) 황금 물약을 완성해요!', easyTitle: '0.6을 1.0까지 가득 채워요.', hint: '0.4만큼 더 채워 1.0(10칸)을 꽉 채우세요.', start: 6, target: 10, stepChoice: 4, okMsg: '와! 0.6 + 0.4 = 1.0 (자연수 1)!' },
      { kind: 'potion_game', title: '0.9 물약에서 0.3을 덜어내어 0.6을 만들어요! (0.9 - 0.3)', easyTitle: '0.9에서 0.3을 빼서 0.6을 만들어요.', hint: '3칸을 덜어내어 0.6 눈금을 맞추세요.', start: 9, target: 6, stepChoice: -3, okMsg: '딩동댕! 0.9 - 0.3 = 0.6!' },
    ],

    17: [
      { kind: 'measure_length', title: '문방구 자 달인! 연필 끝을 끌어 정확히 15cm에 맞춰요!', easyTitle: '연필을 15cm에 맞춰요.', hint: '연필 손잡이를 오른쪽으로 끌어 15 눈금에 놓으세요.', start: 10, target: 15, okMsg: '정확해요! 15cm를 딱 맞췄어요!' },
      { kind: 'measure_length_read', title: '자의 0cm부터 9cm까지 놓인 지우개의 길이는 몇 cm일까요?', easyTitle: '지우개 길이 눈금을 읽고 고르세요.', hint: '지우개 오른쪽 끝이 가리키는 숫자를 읽어 보세요.', value: 9, choices: [8, 9, 10], okMsg: '정답! 9cm예요!' },
      { kind: 'measure_volume', title: '주스 가게! 비커의 물 높이를 위아래로 끌어 800mL(8컵)를 따라요!', easyTitle: '물을 800mL(8컵)로 맞춰요.', hint: '비커 안의 물 높이를 8칸(800mL)까지 끌어 올리세요.', start: 4, target: 8, okMsg: '잘했어요! 주스 800mL를 정확히 채웠어요!' },
      { kind: 'measure_weight', title: '저울 달인! 무게 추를 저울 접시에 끌어 올려 정확히 500g을 맞춰요!', easyTitle: '저울 무게를 500g으로 맞춰요.', hint: '추(100g, 200g, 500g)를 끌어 저울 접시에 500g을 맞추세요.', start: 300, target: 500, okMsg: '정확해요! 저울이 딱 500g이에요!' },
      { kind: 'scale_pick', title: '사과(200g)와 배(350g) 중 어느 것이 더 무거울까요? 무거운 과일을 눌러요!', easyTitle: '더 무거운 과일을 누르세요.', hint: '저울이 더 아래로 내려간 350g 배가 더 무거워요.', left: 200, right: 350, leftLabel: '사과 200g', rightLabel: '배 350g', leftKind: 'apple', rightKind: 'orange', pick: 'larger', okMsg: '정답! 배가 350g으로 더 무거워요!' },
      { kind: 'measure_volume_add', title: '물 300mL(3컵)와 400mL(4컵)를 큰 비커에 모두 부어 합계를 만들어요!', easyTitle: '300mL와 400mL를 합쳐요.', hint: '두 물컵을 눌러 큰 비커에 모두 부으면 700mL가 돼요.', a: 3, b: 4, okMsg: '딩동댕! 300mL + 400mL = 700mL!' },
    ],

    18: [
      { kind: 'clock_set', title: '마트 문 여는 시간! 시계 바늘을 움직여 10시 00분으로 맞춰요!', easyTitle: '시계를 10시로 맞춰요.', hint: '바늘을 돌리거나 +시간/+10분 버튼으로 10:00을 만드세요.', startMin: 540, targetMin: 600, okMsg: '정확해요! 마트 오픈 10시 정각이에요!' },
      { kind: 'clock_read', title: '짧은 바늘이 3, 긴 바늘이 12를 가리켜요! 지금 몇 시일까요?', easyTitle: '시계가 가리키는 시간을 고르세요.', hint: '긴 바늘이 12에 있으면 정각이에요.', showMin: 180, choices: [{ label: '3시 00분', value: '3' }, { label: '6시 00분', value: '6' }, { label: '12시 00분', value: '12' }], answer: '3', okMsg: '정답! 3시 정각이에요!' },
      { kind: 'clock_set', title: '달콤한 간식 시간! 시계를 4시 30분으로 맞춰요!', easyTitle: '시계를 4시 30분으로 맞춰요.', hint: '긴 바늘이 6에 오도록 +30분 버튼을 누르거나 분침을 돌리세요.', startMin: 240, targetMin: 270, okMsg: '잘했어요! 4시 30분이에요!' },
      { kind: 'clock_read', title: '긴 바늘이 아래 숫자 6을 가리킬 때는 몇 분일까요?', easyTitle: '긴 바늘이 6에 있으면 몇 분인가요?', hint: '시계의 반 바퀴는 30분이에요!', showMin: 150, choices: [{ label: '00분', value: '0' }, { label: '15분', value: '15' }, { label: '30분', value: '30' }], answer: '30', okMsg: '맞아요! 긴 바늘이 6이면 30분이에요!' },
      { kind: 'clock_scene', title: '해가 반짝! 아침에 일어나 학교에 가는 시각은 언제일까요?', easyTitle: '아침 등교 시간을 고르세요.', hint: '아침 8시 30분쯤 학교에 가요.', choices: [{ label: '아침 8시 30분', value: '830', min: 510 }, { label: '밤 11시 00분', value: '2300', min: 1380 }, { label: '새벽 3시 00분', value: '300', min: 180 }], answer: '830', okMsg: '정답! 아침 8시 30분이에요!' },
      { kind: 'clock_set', title: '점심시간 12시에서 1시간 뒤로 시계 바늘을 돌려 1시로 맞춰요!', easyTitle: '12시에서 1시간 뒤(1시)로 맞춰요.', hint: '+1시간 버튼이나 시침을 돌려 1시 00분을 만드세요.', startMin: 720, targetMin: 780, okMsg: '완벽해요! 12시에서 1시간 뒤는 1시예요!' },
    ],

    19: [
      { kind: 'mart_pay', title: '150원 사탕 사기! 동전을 계산대 접시에 끌어 딱 150원을 내요!', easyTitle: '동전으로 150원을 만들어요.', hint: '100원 동전 1개와 50원 동전 1개를 계산대에 끌어 놓으세요.', itemKind: 'candy', itemName: '달콤 사탕', price: 150, okMsg: '딱 150원! 달콤 사탕을 샀어요!' },
      { kind: 'mart_count', title: '100원 동전이 3개 있어요! 모두 얼마인지 계산대 금액을 눌러요!', easyTitle: '100원 3개는 얼마인가요?', hint: '100, 200, 300원! 300원 카드를 눌러 보세요.', showCoins: [100, 100, 100], choices: [200, 300, 500], answer: 300, okMsg: '정답! 100원 3개는 300원이에요!' },
      { kind: 'mart_pay', title: '620원 아이스크림 사기! 동전을 끌어 620원을 정확히 내요!', easyTitle: '동전으로 620원을 내요.', hint: '500원 1개 + 100원 1개 + 10원 2개를 계산대에 끌어 놓으세요.', itemKind: 'icecream', itemName: '딸기 아이스크림', price: 620, okMsg: '대단해요! 620원을 척척 냈어요!' },
      { kind: 'mart_change', title: '거스름돈 내어주기! 손님이 500원을 내고 200원 지우개를 샀어요. 거스름돈을 드려요!', easyTitle: '500원 - 200원 거스름돈을 만들어요.', hint: '거스름돈 접시에 100원 동전 3개(300원)를 끌어 담아 주세요.', paid: 500, price: 200, change: 300, itemKind: 'eraser', itemName: '파랑 지우개', okMsg: '완벽한 점원! 거스름돈 300원을 정확히 드렸어요!' },
      { kind: 'mart_exchange', title: '동전 환전! 50원 동전 2개를 환전기에 끌어 100원 동전 1개로 바꾸어요!', easyTitle: '50원 2개로 100원을 만들어요.', hint: '50원 동전 2개를 환전 접시에 끌어 놓으세요.', targetCoin: 100, needDenom: 50, needCount: 2, okMsg: '정답! 50원 + 50원 = 100원 동전 1개!' },
      { kind: 'mart_pay', title: '우유(300원) + 빵(400원) 세트 사기! 모두 얼마인지 계산해 동전으로 내요!', easyTitle: '300원 + 400원 = 700원을 내요.', hint: '300원 + 400원 = 700원! 500원 1개 + 100원 2개를 끌어 놓으세요.', itemKind: 'milk', itemKind2: 'bread', itemName: '우유 + 빵 세트', price: 700, okMsg: '최고의 마트 왕! 700원 계산 완료!' },
    ],

    20: [
      { kind: 'shape_count', title: '삼각형의 반짝이는 꼭짓점 3개를 손가락으로 하나씩 눌러 세어 봐요!', easyTitle: '삼각형 꼭짓점 3개를 눌러요.', hint: '삼각형의 뾰족한 모서리 점 3개를 모두 터치해 보세요.', shapeId: 'triangle', okMsg: '정답! 삼각형은 변과 꼭짓점이 3개씩이에요!' },
      { kind: 'shape_count', title: '정사각형의 반짝이는 꼭짓점 4개를 하나씩 눌러 세어 봐요!', easyTitle: '정사각형 꼭짓점 4개를 눌러요.', hint: '네모의 뾰족한 귀퉁이 4개를 모두 눌러 보세요.', shapeId: 'square', okMsg: '맞아요! 사각형은 꼭짓점이 4개예요!' },
      { kind: 'shape_build', title: '도형 로봇 스튜디오! 원하는 도형 3개 이상을 보드로 끌어 멋진 작품을 만들어요!', easyTitle: '도형을 보드로 3개 끌어 놓아요.', hint: '오른쪽 도형을 왼쪽 보드로 3개 이상 끌어 놓으세요. 두 번 누르면 돌아가요!', minCount: 3, okMsg: '멋진 도형 작품이 완성되었어요!' },
      { kind: 'pattern_game', title: '보석 팔찌 규칙! 🔴 → 🟦 → 🔴 → 🟦 → [ ? ] 빈칸에 알맞은 보석을 끌어요!', easyTitle: '빈칸에 들어갈 보석을 끌어요.', hint: '동그라미와 네모가 번갈아 나와요!', seq: ['🔴', '🟦', '🔴', '🟦'], answer: '🔴', choices: ['🔴', '🟦', '🔺'], okMsg: '정답이에요! 🔴 동그라미 차례예요!' },
      { kind: 'pattern_game', title: '별빛 목걸이! 🔺 → 🔺 → ⭐ → 🔺 → 🔺 → [ ? ] 빈칸을 채워요!', easyTitle: '세모, 세모, 별 다음 모양을 끌어요.', hint: '세모 2개 다음에 별 1개가 반복돼요.', seq: ['🔺', '🔺', '⭐', '🔺', '🔺'], answer: '⭐', choices: ['🔺', '⭐', '🔴'], okMsg: '잘했어요! ⭐ 별 차례예요!' },
      { kind: 'shape_pick', title: '동전처럼 둥글어서 뾰족한 꼭짓점이 0개인 도형을 마법 상자에 넣어요!', easyTitle: '꼭짓점이 없는 동그란 도형을 고르세요.', hint: '원(동그라미)은 뾰족한 꼭짓점이 없어요!', targetId: 'circle', choices: ['triangle', 'square', 'circle'], okMsg: '정답! 동그라미(원)는 꼭짓점이 0개예요!' },
    ],

    21: [
      { kind: 'graph_pick', title: '과일 가게 그래프(사과 5, 바나나 3, 포도 4)! 가장 높고 많은 과일에 왕관을 줘요!', easyTitle: '가장 많은 과일을 누르세요.', hint: '막대가 5칸으로 가장 긴 과일을 찾아 눌러 보세요.', counts: { apple: 5, banana: 3, grape: 4 }, pick: 'max', okMsg: '정답! 사과가 5개로 가장 많아요!' },
      { kind: 'graph_diff', title: '사과(5개)와 바나나(3개)는 몇 개 차이일까요? 그래프를 보고 맞춰요!', easyTitle: '5개와 3개의 차이를 고르세요.', hint: '5 - 3 = 2칸 차이가 나요!', counts: { apple: 5, banana: 3, grape: 4 }, a: 'apple', b: 'banana', choices: [1, 2, 3], answer: 2, okMsg: '정확해요! 5 - 3 = 2개 차이예요!' },
      { kind: 'graph_sum', title: '바나나(3개)와 포도(4개)를 함께 사면 모두 몇 개일까요?', easyTitle: '3개 + 4개는 모두 몇 개일까요?', hint: '3 + 4 = 7개예요!', counts: { apple: 5, banana: 3, grape: 4 }, a: 'banana', b: 'grape', choices: [6, 7, 8], answer: 7, okMsg: '잘했어요! 3 + 4 = 모두 7개예요!' },
      { kind: 'graph_build', title: '사과 진열! 사과 SVG를 그래프 위로 끌어 올려 사과 막대를 6개로 만들어요!', easyTitle: '사과를 끌어 6칸으로 만들어요.', hint: '아래 사과를 그래프의 사과 줄로 3번 더 끌어 6개를 맞추세요.', start: { apple: 3, banana: 3, grape: 4 }, targetKind: 'apple', targetVal: 6, okMsg: '완벽해요! 사과 막대가 6칸이 되었어요!' },
      { kind: 'graph_pick', title: '그래프에서 개수가 가장 적은 과일은 무엇일까요?', easyTitle: '가장 적은 과일을 누르세요.', hint: '막대가 3칸으로 가장 짧은 과일을 눌러 보세요.', counts: { apple: 5, banana: 3, grape: 4 }, pick: 'min', okMsg: '딩동댕! 바나나가 3개로 가장 적어요!' },
      { kind: 'story_basket', title: '장바구니 미션! 사과 4개와 오렌지 3개를 장바구니에 끌어 모두 7개를 담아요!', easyTitle: '사과 4개와 오렌지 3개를 담아요.', hint: '사과 4개, 오렌지 3개를 손가락으로 끌어 장바구니에 넣으세요.', needA: 4, needB: 3, okMsg: '정답! 4 + 3 = 모두 7개를 담았어요!' },
    ],
  };

  function markWin(stageId, pIdx, okMsg) {
    const key = `${stageId}:${pIdx}`;
    if (!state.practice.solved[key]) {
      gameSession.combo += 1;
      gameSession.score += 100 + Math.min(gameSession.combo * 10, 50);
    }
    state.practice.solved[key] = true;
    state.practice.feedback = { ok: true, text: `🎉 ${okMsg}` };
    recordTrial(state.promptLevel ? 'prompted' : 'independent', state.promptLevel, `${stageId}단계 게임 미션 ${pIdx + 1} 클리어`);
    awardToken(okMsg);
    playMathSfx('fanfare');
    if (global.SM_VFX) {
      const target = $('gmStage') || $('toolBody');
      global.SM_VFX.celebrateWin(target);
      global.SM_VFX.floatText(target, gameSession.combo >= 2 ? `🔥 ${gameSession.combo}연속 +${100 + Math.min(gameSession.combo * 10, 50)}!` : '✨ +100점!', 'win');
    }
  }

  function markMiss(stageId, pIdx, hintText) {
    gameSession.combo = 0;
    state.practice.hintShown = true;
    state.practice.feedback = { ok: false, text: `괜찮아요! 다시 도전해 볼까요? 💡 ${hintText}` };
    recordTrial('error', state.promptLevel, `${stageId}단계 게임 미션 ${pIdx + 1} 재시도`);
    haptic(35);
    playMathSfx('boing');
    if (global.SM_VFX) global.SM_VFX.shakeEl($('gmStage'));
    speak(`괜찮아요. ${hintText}`);
  }

  function fxHit(target, label, sfx = 'place', extra) {
    playMathSfx(sfx, extra);
    if (global.SM_VFX) {
      global.SM_VFX.burst(target, { count: 14, shape: sfx === 'coin' ? 'coin' : 'star', power: 5.5, ringRadius: 56, size: 6 });
      if (label) global.SM_VFX.floatText(target, label);
    }
  }

  function initMissionState(stageId, pIdx, m) {
    const key = `${stageId}:${pIdx}:${m.kind}`;
    if (gameSession.missionKey === key && gameSession.mState) return gameSession.mState;
    gameSession.missionKey = key;
    const ms = { cleared: Boolean(state.practice.solved[`${stageId}:${pIdx}`]) };

    switch (m.kind) {
      case 'sort_drag':
      case 'sort_pick':
        ms.items = m.items.map((k, idx) => ({ id: idx, kind: k }));
        ms.counts = { apple: 0, lemon: 0, grape: 0, target: 0 };
        break;
      case 'tenframe_fill':
        ms.count = m.start || 0;
        break;
      case 'polka_pair':
        ms.matched = [];
        ms.pickedDot = null;
        ms.pickedNum = null;
        ms.shuffledNums = shuffle(m.nums);
        break;
      case 'make10_pairs':
        ms.matched = [];
        ms.firstIdx = null;
        break;
      case 'tug_of_war':
        ms.selected = null;
        ms.shift = 0;
        break;
      case 'bubble_merge':
        ms.picked = [];
        break;
      case 'bowling_sub':
        ms.knocked = [];
        break;
      case 'strike_it_out':
        ms.picked = [];
        break;
      case 'youcubed_array':
        ms.stamped = false;
        ms.anchor = null;
        break;
      case 'subitize_match':
      case 'subitize_frame':
      case 'stone_bridge':
      case 'compare_cards':
      case 'scale_pick':
      case 'order_pick':
      case 'pond_jump':
      case 'frac_compare':
      case 'potion_compare':
      case 'measure_length_read':
      case 'clock_read':
      case 'clock_scene':
      case 'mart_count':
      case 'shape_pick':
      case 'graph_pick':
      case 'graph_diff':
      case 'graph_sum':
      case 'choice_cards':
        ms.selected = null;
        break;
      case 'tap_count':
        ms.tapped = [];
        break;
      case 'teen_shop':
        ms.tens = 0;
        ms.ones = 0;
        break;
      case 'scale_build':
        ms.left = m.startLeft || 0;
        ms.right = m.startRight || 0;
        break;
      case 'scale_sign':
        ms.sign = null;
        break;
      case 'cart_combine':
        ms.placedA = 0;
        ms.placedB = 0;
        break;
      case 'cart_pick_sum':
        ms.selected = null;
        break;
      case 'take_away':
        ms.removed = 0;
        break;
      case 'make_ten_game':
        ms.left = m.a;
        ms.right = m.b;
        break;
      case 'nl_jump':
        ms.pos = m.start;
        break;
      case 'place_exchange':
        ms.t = m.startT || 0;
        ms.u = m.startU || 0;
        break;
      case 'vault_hundreds':
        ms.h = m.startH || 0;
        ms.t = m.startT || 0;
        ms.u = m.startU || 0;
        break;
      case 'mul_factory':
        ms.groups = Array(m.groups).fill(0);
        break;
      case 'div_party':
        ms.plates = Array(m.plates).fill(0);
        break;
      case 'pizza_game':
        ms.n = m.start || 0;
        break;
      case 'potion_game':
        ms.tenths = m.start || 0;
        break;
      case 'measure_length':
        ms.val = m.start || 0;
        break;
      case 'measure_volume':
        ms.val = m.start || 0;
        break;
      case 'measure_volume_add':
        ms.aAdded = false;
        ms.bAdded = false;
        break;
      case 'measure_weight':
        ms.val = m.start || 0;
        break;
      case 'clock_set':
        ms.minutes = m.startMin ?? 540;
        break;
      case 'mart_pay':
      case 'mart_change':
        ms.coins = { 10: 0, 50: 0, 100: 0, 500: 0 };
        break;
      case 'mart_exchange':
        ms.inserted = 0;
        break;
      case 'shape_count':
        ms.corners = [];
        break;
      case 'shape_build':
        ms.board = [];
        ms.selectedIdx = null;
        break;
      case 'pattern_game':
        ms.placed = null;
        break;
      case 'graph_build':
        ms.counts = { ...(m.start || { apple: 3, banana: 3, grape: 4 }) };
        break;
      case 'story_basket':
        ms.a = 0;
        ms.b = 0;
        break;
      default:
        break;
    }
    gameSession.mState = ms;
    return ms;
  }

  function renderTokenAsset(kind, size = 46) {
    if (!global.SM_SVG) return kind;
    if (kind === 'coin1') return global.SM_SVG.coinSVG(1, size);
    if (kind === 'coin10') return global.SM_SVG.coinSVG(10, size);
    if (kind === 'coin50') return global.SM_SVG.coinSVG(50, size);
    if (kind === 'coin100') return global.SM_SVG.coinSVG(100, size);
    if (kind === 'coin500') return global.SM_SVG.coinSVG(500, size);
    if (kind === 'coin1000') return global.SM_SVG.coinSVG(1000, size);
    return global.SM_SVG.itemSVG(kind, size);
  }

  function tokenLabel(kind) {
    const map = {
      apple: '사과', greenApple: '초록 사과', lemon: '레몬', grape: '포도',
      banana: '바나나', orange: '귤', strawberry: '딸기', cookie: '쿠키',
      candy: '사탕', milk: '우유', bread: '빵', icecream: '아이스크림',
      pencil: '연필', eraser: '지우개', ball: '공', box: '상자',
      puppy: '강아지', gem: '보석', star: '별',
      coin1: '1원', coin10: '10원', coin50: '50원', coin100: '100원', coin500: '500원',
    };
    return map[kind] || kind;
  }

  /* ============================================================
     메인 게임 아레나 렌더러
     ============================================================ */
  function renderGameArena(stageId) {
    const body = getArenaRoot();
    if (!body) return false;
    const s = Number(stageId);
    const meta = STAGE_MONEY_META[s] || { gameTitle: '수학 게임', moneyLink: '화폐 계산을 위한 기초 수 감각을 길러요.', mascot: 'bunny' };
    const cur = typeof getStageCurriculum === 'function' ? getStageCurriculum(s) : STAGE_CURRICULUM[s];
    const missions = getMissionsForStage(s);
    const isTutorial = state.lessonStep === 0 && !gameSession.sandboxMode;

    // 자유 교구 모드일 때는 기존 교구 위에 "🎮 게임으로 돌아가기" 바만 얹음
    if (gameSession.sandboxMode) {
      const backBar = document.createElement('div');
      backBar.className = 'gm-sandbox-banner';
      backBar.innerHTML = `
        <div><strong>🎨 자유 탐험 교구</strong> <span>원하는 만큼 자유롭게 끌어 놓고 실험해 보세요.</span></div>
        <button type="button" class="btn primary" data-gm-exit-sandbox>🎮 미션 게임으로 돌아가기</button>`;
      body.prepend(backBar);
      backBar.querySelector('[data-gm-exit-sandbox]').onclick = () => {
        gameSession.sandboxMode = false;
        renderTool();
      };
      return true;
    }

    const pIdx = clamp(state.practice.idxByStage[s] ?? 0, 0, Math.max(0, missions.length - 1));
    state.practice.idxByStage[s] = pIdx;
    const mission = missions[pIdx] || missions[0];
    const isCleared = Boolean(state.practice.solved[`${s}:${pIdx}`]);

    // 튜토리얼 화면 (lessonStep === 0)
    if (isTutorial && cur) {
      const examples = Array.isArray(cur.examples) && cur.examples.length ? cur.examples : [cur.example];
      const exIdx = clamp(state.exampleIdx || 0, 0, examples.length - 1);
      state.exampleIdx = exIdx;
      const ex = examples[exIdx];
      const mascot = global.SM_SVG ? global.SM_SVG.mascotSVG(meta.mascot, 'happy', 68) : '';
      const coinBadge = global.SM_SVG ? global.SM_SVG.coinSVG(s >= 19 ? 500 : s >= 11 ? 100 : 10, 34) : '';
      const exTabsHTML = examples.length > 1
        ? `<div class="ex-tabs" role="tablist">${examples.map((_, i) => `<button type="button" class="ex-tab${i === exIdx ? ' active' : ''}" data-ex-tab="${i}">규칙 ${i + 1}</button>`).join('')}</div>`
        : '';

      body.innerHTML = `
        <div class="gm-shell gm-tutorial">
          <div class="gm-hud">
            <div class="gm-hud-left">
              <div class="gm-mascot-pill">${mascot}</div>
              <div>
                <div class="gm-title">${meta.gameTitle}</div>
                <div class="gm-money-pill">${coinBadge}<span><b>화폐 연결:</b> ${meta.moneyLink}</span></div>
              </div>
            </div>
            <div class="gm-hud-right">
              <button type="button" class="btn soft" data-gm-sandbox>🎨 자유 교구</button>
            </div>
          </div>

          <section class="gm-tutorial-card" aria-label="게임 방법 미리보기">
            <div class="example-top-row">
              <span class="example-badge">👀 게임 방법 · ${ex.title || `규칙 ${exIdx + 1}`}</span>
              ${exTabsHTML}
            </div>
            <div class="example-problem">${ex.problem}</div>
            <div class="example-anim-wrap">${typeof renderExampleAnimatedSvg === 'function' ? renderExampleAnimatedSvg(s, exIdx) : ''}</div>
            <div class="example-visual">${ex.visual}</div>
            <div class="example-steps">${(ex.steps || []).map((st, i) => `<div class="example-step"><span class="step-num">${i + 1}</span><span>${st}</span></div>`).join('')}</div>
            <div class="gm-tutorial-actions">
              <button type="button" class="btn amber" data-ex-speak>🔊 규칙 듣기</button>
              <button type="button" class="gm-start-btn" data-gm-start>🎮 게임 시작하기! (미션 ${missions.length}개) →</button>
            </div>
          </section>
        </div>`;

      body.querySelectorAll('[data-ex-tab]').forEach((b) => {
        b.onclick = () => {
          state.exampleIdx = Number(b.dataset.exTab) || 0;
          renderTool();
          const chosen = examples[state.exampleIdx];
          if (chosen) speak(chosen.speakText || chosen.problem);
        };
      });
      body.querySelector('[data-ex-speak]').onclick = () => speak(ex.speakText || ex.problem);
      body.querySelector('[data-gm-start]').onclick = () => {
        state.lessonStep = 1;
        state.practice.feedback = null;
        state.practice.hintShown = false;
        gameSession.missionKey = '';
        renderLessonPath();
        renderTool();
        speak('게임 시작! 첫 번째 미션을 해 보아요.');
      };
      body.querySelector('[data-gm-sandbox]').onclick = () => {
        gameSession.sandboxMode = true;
        renderTool();
      };
      return true;
    }

    // 실제 게임 플레이 화면 (lessonStep >= 1)
    const ms = initMissionState(s, pIdx, mission);
    const mood = isCleared ? 'cheer' : (state.practice.feedback && !state.practice.feedback.ok ? 'think' : 'happy');
    const mascot = global.SM_SVG ? global.SM_SVG.mascotSVG(meta.mascot, mood, 62) : '';
    const coinBadge = global.SM_SVG ? global.SM_SVG.coinSVG(s >= 19 ? 500 : s >= 11 ? 100 : 10, 30) : '';
    const promptText = (state.settings.easy && mission.easyTitle) ? mission.easyTitle : mission.title;
    const isLast = pIdx === missions.length - 1;

    const starTrack = missions.map((_, i) => {
      const done = Boolean(state.practice.solved[`${s}:${i}`]);
      const curCls = i === pIdx ? ' current' : '';
      return `<button type="button" class="gm-star-btn${done ? ' done' : ''}${curCls}" data-gm-jump="${i}" aria-label="미션 ${i + 1}${done ? ' 완료' : ''}">${done ? '★' : i + 1}</button>`;
    }).join('');

    const fb = state.practice.feedback;
    const confetti = isCleared && global.SM_SVG ? global.SM_SVG.confettiSVG() : '';

    body.innerHTML = `
      <div class="gm-shell">
        <div class="gm-hud">
          <div class="gm-hud-left">
            <div class="gm-mascot-pill">${mascot}</div>
            <div>
              <div class="gm-title">${meta.gameTitle}</div>
              <div class="gm-money-pill">${coinBadge}<span>${meta.moneyLink}</span></div>
            </div>
          </div>
          <div class="gm-hud-stats">
            <span class="gm-stat score">🏆 ${gameSession.score}점</span>
            ${gameSession.combo >= 2 ? `<span class="gm-stat combo">🔥 ${gameSession.combo}연속</span>` : ''}
            <button type="button" class="btn soft gm-mini-btn" data-gm-howto>❓ 방법</button>
          </div>
        </div>

        <div class="gm-mission-bar">
          <div class="gm-mission-stars" role="navigation" aria-label="미션 진행">${starTrack}</div>
          <div class="gm-mission-controls">
            <button type="button" class="btn soft gm-mini-btn" data-gm-speak>🔊 듣기</button>
            <button type="button" class="btn amber gm-mini-btn" data-gm-hint>💡 힌트</button>
            <button type="button" class="btn soft gm-mini-btn" data-gm-reset>🔄 다시</button>
          </div>
        </div>

        <div class="gm-quest-banner">
          <span class="gm-quest-badge">미션 ${pIdx + 1}/${missions.length}</span>
          <div class="gm-quest-text">${promptText}</div>
        </div>
        ${state.practice.hintShown ? `<div class="practice-hint-box">💡 <b>도움 힌트:</b> ${mission.hint}</div>` : ''}

        <div class="gm-stage" id="gmStage"></div>

        ${(fb || isCleared) ? `
          <div class="gm-result-bar ${isCleared ? 'ok' : 'retry'}">
            ${confetti}
            <div class="gm-result-msg">${fb ? fb.text : `🎉 ${mission.okMsg}`}</div>
            ${isCleared ? `<button type="button" class="gm-next-btn" data-gm-next>${isLast ? '다음 단계 게임으로! →' : `다음 미션 (${pIdx + 2}/${missions.length}) →`}</button>` : ''}
          </div>` : ''}
      </div>`;

    // 공통 HUD 바인딩
    body.querySelectorAll('[data-gm-jump]').forEach((b) => {
      b.onclick = () => {
        state.practice.idxByStage[s] = Number(b.dataset.gmJump);
        state.practice.feedback = null;
        state.practice.hintShown = false;
        gameSession.missionKey = '';
        renderTool();
      };
    });
    const howtoBtn = body.querySelector('[data-gm-howto]');
    if (howtoBtn) howtoBtn.onclick = () => {
      state.lessonStep = 0;
      renderLessonPath();
      renderTool();
    };
    const sandboxBtn = body.querySelector('[data-gm-sandbox]');
    if (sandboxBtn) sandboxBtn.onclick = () => {
      gameSession.sandboxMode = true;
      renderTool();
    };
    body.querySelector('[data-gm-speak]').onclick = () => speak(mission.speak || promptText);
    body.querySelector('[data-gm-hint]').onclick = () => {
      state.practice.hintShown = !state.practice.hintShown;
      if (state.practice.hintShown) {
        recordTrial('prompted', Math.max(1, state.promptLevel), `${s}단계 게임 힌트`);
        speak(mission.hint);
      }
      renderTool();
    };
    body.querySelector('[data-gm-reset]').onclick = () => {
      gameSession.missionKey = '';
      state.practice.feedback = null;
      renderTool();
      speak('미션을 처음부터 다시 시작해요.');
    };
    const nextBtn = body.querySelector('[data-gm-next]');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (pIdx < missions.length - 1) {
          state.practice.idxByStage[s] = pIdx + 1;
          state.practice.feedback = null;
          state.practice.hintShown = false;
          gameSession.missionKey = '';
          state.lessonStep = 2;
          renderLessonPath();
          renderTool();
          speak(`미션 ${pIdx + 2}번이에요!`);
        } else {
          state.lessonStep = 2;
          advanceLesson();
        }
      };
    }

    const stageEl = $('gmStage');
    renderMissionBoard(stageEl, s, pIdx, mission, ms);
    return true;
  }

  /* ============================================================
     미션 종류별 SVG 게임 보드 렌더링 & 인터랙션 바인딩
     ============================================================ */
  function renderMissionBoard(el, stageId, pIdx, m, ms) {
    const win = (msg) => {
      if (!ms.cleared) {
        ms.cleared = true;
        markWin(stageId, pIdx, msg || m.okMsg);
      }
      renderTool();
    };
    const miss = (hint) => {
      markMiss(stageId, pIdx, hint || m.hint);
      renderTool();
    };

    /* 1) 과일/동전/물건 분류 드래그 게임 */
    if (m.kind === 'sort_drag') {
      const basketsHtml = m.baskets.map((k) => {
        const bg = k === 'apple' ? '#fee2e2' : k === 'lemon' ? '#fef3c7' : '#f3e8ff';
        const col = k === 'apple' ? '#ef4444' : k === 'lemon' ? '#d97706' : '#7c3aed';
        const inside = Array.from({ length: ms.counts[k] || 0 }, () => renderTokenAsset(k, 38)).join('');
        return `<div class="gm-basket" data-drop="gmb:${k}" style="border-color:${col};background:${bg}">
          <div class="gm-basket-head">${global.SM_SVG.basketSVG(col, '#fff', 44)}<span>${tokenLabel(k)} 바구니</span><b>${ms.counts[k] || 0}개</b></div>
          <div class="gm-basket-items">${inside || '<span class="gm-drop-hint">여기로 끌어요</span>'}</div>
        </div>`;
      }).join('');
      const trayHtml = ms.items.map((it) => `<div class="gm-drag-card" data-gmsort="${it.id}" data-kind="${it.kind}" role="button" tabindex="0">${renderTokenAsset(it.kind, 52)}<span>${tokenLabel(it.kind)}</span></div>`).join('');
      el.innerHTML = `<div class="gm-baskets-row">${basketsHtml}</div><div class="gm-tray">${trayHtml || '<div class="gm-tray-done">모두 바구니에 넣었어요! 🎉</div>'}</div>`;
      const place = (id, kind) => {
        const idx = ms.items.findIndex((x) => x.id === id);
        if (idx < 0) return;
        ms.items.splice(idx, 1);
        ms.counts[kind] = (ms.counts[kind] || 0) + 1;
        playMathSfx('place');
        if (ms.items.length === 0) win();
        else { speak(`${tokenLabel(kind)} 넣었어요!`); renderTool(); }
      };
      bindDrag(el, '[data-gmsort]', (n) => ({ id: Number(n.dataset.gmsort), kind: n.dataset.kind }), (p, zone) => {
        if (!zone) return;
        const target = (zone.dataset.drop || '').split(':')[1];
        if (target === p.kind) place(p.id, p.kind);
        else miss(`${tokenLabel(p.kind)} 바구니에 넣어 보세요!`);
      }, {
        onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="gmb:${p.kind}"]`, el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="gmb:${p.kind}"]`, el); speak(`${tokenLabel(p.kind)}을 끌어 ${tokenLabel(p.kind)} 바구니에 넣으세요.`); },
        onActivate: (p) => place(p.id, p.kind),
      });
      return;
    }

    /* 1-B) 목표 종류만 골라 담기 (포도/노란색/100원/둥근모양) */
    if (m.kind === 'sort_pick') {
      const validSet = new Set(m.targetKinds || [m.targetKind]);
      const color = m.targetColor || '#7c3aed';
      const inside = (ms.picked || []).map((k) => renderTokenAsset(k, 40)).join('');
      const trayHtml = ms.items.map((it) => `<div class="gm-drag-card" data-gmpick="${it.id}" data-kind="${it.kind}" role="button" tabindex="0">${renderTokenAsset(it.kind, 52)}<span>${tokenLabel(it.kind)}</span></div>`).join('');
      el.innerHTML = `
        <div class="gm-basket solo" data-drop="gmpick-zone" style="border-color:${color};background:#faf5ff">
          <div class="gm-basket-head">${global.SM_SVG.basketSVG(color, '#fff', 48)}<span>${m.targetLabel || `${tokenLabel(m.targetKind)} 바구니`}</span><b>${(ms.picked || []).length} / ${m.targetCount}개</b></div>
          <div class="gm-basket-items">${inside || '<span class="gm-drop-hint">알맞은 것만 여기로 끌어오세요!</span>'}</div>
        </div>
        <div class="gm-tray">${trayHtml}</div>`;
      const pickItem = (id, kind) => {
        if (!validSet.has(kind)) { miss(`이것은 ${tokenLabel(kind)}예요. 다시 살펴볼까요?`); return; }
        const idx = ms.items.findIndex((x) => x.id === id);
        if (idx < 0) return;
        ms.items.splice(idx, 1);
        ms.picked = ms.picked || [];
        ms.picked.push(kind);
        playMathSfx('place');
        if (ms.picked.length >= m.targetCount) win();
        else { speak(`${ms.picked.length}개 모았어요!`); renderTool(); }
      };
      bindDrag(el, '[data-gmpick]', (n) => ({ id: Number(n.dataset.gmpick), kind: n.dataset.kind }), (p, zone) => {
        if (zone && zone.dataset.drop === 'gmpick-zone') pickItem(p.id, p.kind);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="gmpick-zone"]', el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget('[data-drop="gmpick-zone"]', el); speak(`${tokenLabel(p.kind)}을 손가락으로 끌어 바구니에 놓으세요.`); },
        onActivate: (p) => pickItem(p.id, p.kind),
      });
      return;
    }

    /* 2, 3) 5칸/10칸 보물상자 채우기 */
    if (m.kind === 'tenframe_fill') {
      const cols = m.maxSlots <= 5 ? 5 : 5;
      const cells = Array.from({ length: m.maxSlots }, (_, i) => {
        const on = i < ms.count;
        return `<div class="gm-tf-cell${on ? ' on' : ''}" data-drop="tf:${i}">${on ? renderTokenAsset(m.itemKind, 44) : `<span class="gm-tf-num">${i + 1}</span>`}</div>`;
      }).join('');
      el.innerHTML = `
        <div class="gm-tf-board">
          <div class="gm-tf-grid" style="grid-template-columns:repeat(${cols},1fr)" data-drop="tf-board">${cells}</div>
          <div class="gm-tf-counter">현재 <b>${ms.count}</b>개 / 목표 <b>${m.target}</b>개</div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card big" data-tf-add role="button" tabindex="0">${renderTokenAsset(m.itemKind, 56)}<span>끌어서 채우기 +1</span></div>
          ${ms.count > 0 ? `<button type="button" class="btn soft" data-tf-minus>－1 빼기</button>` : ''}
        </div>`;
      const addOne = () => {
        if (ms.count >= m.maxSlots) return;
        ms.count += 1;
        fxHit(el.querySelector('[data-drop="tf-board"]'), `+1 (${ms.count})`, m.itemKind && m.itemKind.startsWith('coin') ? 'coin' : 'place');
        if (ms.count === m.target) win();
        else { speak(countWord(ms.count)); renderTool(); }
      };
      bindDrag(el, '[data-tf-add]', () => ({ add: 1 }), (p, zone) => {
        if (zone && (zone.dataset.drop === 'tf-board' || (zone.dataset.drop || '').startsWith('tf:'))) addOne();
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="tf-board"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="tf-board"]', el); speak('손가락으로 끌어 위쪽 칸에 놓으세요.'); },
        onActivate: addOne,
      });
      const mb = el.querySelector('[data-tf-minus]');
      if (mb) mb.onclick = () => { ms.count = Math.max(0, ms.count - 1); renderTool(); };
      return;
    }

    /* 2, 3) Math for Love Tiny Polka Dot / YouCubed 도트 스냅 매칭 */
    if (m.kind === 'polka_pair') {
      const dotCard = (n) => {
        if (m.tenFrameMode) {
          const cells = Array.from({ length: 10 }, (_, i) => `<span class="gm-mini-dot${i < n ? ' on' : ''}"></span>`).join('');
          return `<div class="gm-mini-tf">${cells}</div>`;
        }
        const dots = Array.from({ length: n }, () => `<span class="gm-polka-dot"></span>`).join('');
        return `<div class="gm-polka-cluster">${dots}</div>`;
      };
      const dotCards = m.nums.map((n) => {
        const done = ms.matched.includes(n);
        const sel = ms.pickedDot === n;
        return `<button type="button" class="gm-match-card dot${done ? ' matched' : ''}${sel ? ' picked' : ''}" data-pp-dot="${n}" ${done ? 'disabled' : ''}>${dotCard(n)}<small>점 카드</small></button>`;
      }).join('');
      const numCards = ms.shuffledNums.map((n) => {
        const done = ms.matched.includes(n);
        const sel = ms.pickedNum === n;
        return `<button type="button" class="gm-match-card num${done ? ' matched' : ''}${sel ? ' picked' : ''}" data-pp-num="${n}" ${done ? 'disabled' : ''}><b>${n}</b><small>${countWord(n)}</small></button>`;
      }).join('');
      el.innerHTML = `
        <div class="gm-vault-status">짝꿍 완성: <b>${ms.matched.length}</b> / ${m.nums.length}쌍</div>
        <div class="gm-pair-arena">
          <div class="gm-pair-col">${dotCards}</div>
          <div class="gm-pair-col">${numCards}</div>
        </div>`;
      const tryMatch = (btnEl) => {
        if (ms.pickedDot !== null && ms.pickedNum !== null) {
          if (ms.pickedDot === ms.pickedNum) {
            ms.matched.push(ms.pickedDot);
            fxHit(btnEl, `✨ ${ms.pickedDot} 짝꿍!`, 'zap');
            ms.pickedDot = null;
            ms.pickedNum = null;
            if (ms.matched.length >= m.nums.length) win();
            else renderTool();
          } else {
            ms.pickedDot = null;
            ms.pickedNum = null;
            miss('점의 개수와 같은 숫자를 골라 보세요!');
          }
        } else {
          playMathSfx('tap');
          renderTool();
        }
      };
      el.querySelectorAll('[data-pp-dot]').forEach((b) => {
        b.onclick = () => { ms.pickedDot = Number(b.dataset.ppDot); tryMatch(b); };
      });
      el.querySelectorAll('[data-pp-num]').forEach((b) => {
        b.onclick = () => { ms.pickedNum = Number(b.dataset.ppNum); tryMatch(b); };
      });
      return;
    }

    /* 3) Math for Love Make 10 짝꿍 스냅 */
    if (m.kind === 'make10_pairs') {
      const cardsHtml = m.cards.map((v, idx) => {
        const done = ms.matched.includes(idx);
        const sel = ms.firstIdx === idx;
        return `<button type="button" class="gm-snap-card${done ? ' matched' : ''}${sel ? ' picked' : ''}" data-m10-idx="${idx}" ${done ? 'disabled' : ''}>
          ${global.SM_SVG.coinSVG(10, 40)}<b>${v}</b>
        </button>`;
      }).join('');
      el.innerHTML = `
        <div class="gm-vault-status">⚡ 합쳐서 <b>10</b>이 되는 두 카드를 차례로 누르세요! (${ms.matched.length / 2} / ${m.cards.length / 2}쌍)</div>
        <div class="gm-snap-grid">${cardsHtml}</div>`;
      el.querySelectorAll('[data-m10-idx]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.dataset.m10Idx);
          if (ms.firstIdx === null) {
            ms.firstIdx = idx;
            playMathSfx('tap');
            renderTool();
          } else if (ms.firstIdx === idx) {
            ms.firstIdx = null;
            renderTool();
          } else {
            const a = m.cards[ms.firstIdx];
            const bVal = m.cards[idx];
            if (a + bVal === 10) {
              ms.matched.push(ms.firstIdx, idx);
              fxHit(b, `⚡ ${a}+${bVal}=10!`, 'zap');
              ms.firstIdx = null;
              if (ms.matched.length >= m.cards.length) win();
              else renderTool();
            } else {
              ms.firstIdx = null;
              miss(`${a} + ${bVal} = ${a + bVal}이에요. 합쳐서 10이 되는 짝꿍을 찾아요!`);
            }
          }
        };
      });
      return;
    }

    /* 2, 3) 서비타이징 (그림 보고 숫자 코인 고르기) */
    if (m.kind === 'subitize_match' || m.kind === 'subitize_frame') {
      let visual = '';
      if (m.kind === 'subitize_frame') {
        const dots = Array.from({ length: 10 }, (_, i) => `<div class="gm-tf-cell${i < m.filled ? ' on' : ''}">${i < m.filled ? renderTokenAsset('coin10', 38) : ''}</div>`).join('');
        visual = `<div class="gm-tf-grid" style="grid-template-columns:repeat(5,1fr);max-width:340px">${dots}</div>`;
      } else if (m.groupFive) {
        const g1 = Array.from({ length: 5 }, () => renderTokenAsset(m.showKind, 42)).join('');
        const g2 = Array.from({ length: m.count - 5 }, () => renderTokenAsset(m.showKind, 42)).join('');
        visual = `<div class="gm-subitize-groups"><div class="gm-sub-box">${g1}</div><span class="gm-plus">+</span><div class="gm-sub-box">${g2}</div></div>`;
      } else {
        visual = `<div class="gm-sub-box">${Array.from({ length: m.count }, () => renderTokenAsset(m.showKind, 50)).join('')}</div>`;
      }
      const targetAns = m.kind === 'subitize_frame' ? m.filled : m.count;
      const choicesHtml = m.choices.map((c) => {
        const cls = ms.selected === c ? (c === targetAns ? ' correct' : ' wrong') : '';
        return `<button type="button" class="gm-num-coin-btn${cls}" data-sub-ans="${c}"><span>${c}</span><small>${countWord(c)}</small></button>`;
      }).join('');
      el.innerHTML = `<div class="gm-center-stage">${visual}</div><div class="gm-choice-row">${choicesHtml}</div>`;
      el.querySelectorAll('[data-sub-ans]').forEach((b) => {
        b.onclick = () => {
          const v = Number(b.dataset.subAns);
          ms.selected = v;
          if (v === targetAns) win();
          else miss();
        };
      });
      return;
    }

    /* 2, 4) 징검다리 빈 숫자 돌 끌어 채우기 */
    if (m.kind === 'stone_bridge') {
      const stones = m.seq.map((v) => v === null
        ? `<div class="gm-stone blank" data-drop="stone-blank">${ms.cleared ? m.answer : '?'}</div>`
        : `<div class="gm-stone">${v}</div>`).join('<span class="gm-arrow">→</span>');
      const tray = m.choices.map((c) => `<div class="gm-drag-card num" data-stone="${c}" role="button" tabindex="0"><b>${c}</b><span>끌어서 ?에 놓기</span></div>`).join('');
      el.innerHTML = `<div class="gm-bridge">${stones}</div><div class="gm-tray">${tray}</div>`;
      const pick = (v) => {
        if (v === m.answer) win();
        else miss();
      };
      bindDrag(el, '[data-stone]', (n) => ({ v: Number(n.dataset.stone) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'stone-blank') pick(p.v);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="stone-blank"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="stone-blank"]', el); speak('숫자 돌을 끌어 ? 자리에 놓으세요.'); },
        onActivate: (p) => pick(p.v),
      });
      return;
    }

    /* 2) 차례대로 눌러 세기 */
    if (m.kind === 'tap_count') {
      const cards = Array.from({ length: m.count }, (_, i) => {
        const done = ms.tapped.includes(i);
        return `<button type="button" class="gm-tap-item${done ? ' done' : ''}" data-tap-i="${i}">${renderTokenAsset(m.itemKind, 56)}<span class="gm-tap-badge">${done ? i + 1 : '?'}</span></button>`;
      }).join('');
      el.innerHTML = `<div class="gm-center-stage"><div class="gm-tap-row">${cards}</div><div class="gm-tf-counter">지금까지 센 수: <b>${ms.tapped.length}</b> / ${m.count}</div></div>`;
      el.querySelectorAll('[data-tap-i]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.dataset.tapI);
          if (ms.tapped.includes(idx)) return;
          ms.tapped.push(idx);
          playMathSfx('place');
          if (ms.tapped.length >= m.count) win();
          else { speak(countWord(ms.tapped.length)); renderTool(); }
        };
      });
      return;
    }

    /* 4) 10원 묶음 + 1원 낱개 상점 */
    if (m.kind === 'teen_shop') {
      const sum = ms.tens * 10 + ms.ones;
      const placedTens = Array.from({ length: ms.tens }, () => `<span class="gm-placed-coin" data-rm-teen="10">${global.SM_SVG.coinSVG(10, 44)}</span>`).join('');
      const placedOnes = Array.from({ length: ms.ones }, () => `<span class="gm-placed-coin" data-rm-teen="1">${global.SM_SVG.coinSVG(1, 36)}</span>`).join('');
      el.innerHTML = `
        <div class="gm-shop-desk" data-drop="teen-desk">
          <div class="gm-shop-order">목표 금액: <b>${m.target}원</b> · 현재 올린 돈: <b style="color:${sum === m.target ? '#16a34a' : '#2563eb'}">${sum}원</b></div>
          <div class="gm-shop-mat">${placedTens}${placedOnes}${sum === 0 ? '<span class="gm-drop-hint">여기로 10원과 1원 동전을 끌어 올리세요! (누르면 빼기)</span>' : ''}</div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-add-teen="10" role="button" tabindex="0">${global.SM_SVG.coinSVG(10, 52)}<span>10원 (+10)</span></div>
          <div class="gm-drag-card" data-add-teen="1" role="button" tabindex="0">${global.SM_SVG.coinSVG(1, 48)}<span>1원 (+1)</span></div>
        </div>`;
      const addCoin = (v) => {
        if (v === 10) ms.tens += 1;
        else ms.ones += 1;
        const now = ms.tens * 10 + ms.ones;
        playMathSfx('place');
        if (now === m.target) win();
        else {
          if (now > m.target) speak('조금 넘었어요! 위 동전을 누르면 뺄 수 있어요.');
          else speak(`${now}원`);
          renderTool();
        }
      };
      bindDrag(el, '[data-add-teen]', (n) => ({ v: Number(n.dataset.addTeen) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'teen-desk') addCoin(p.v);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="teen-desk"]', el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget('[data-drop="teen-desk"]', el); speak(`${p.v}원 동전을 위 계산대 매트로 끌어 올리세요.`); },
        onActivate: (p) => addCoin(p.v),
      });
      el.querySelectorAll('[data-rm-teen]').forEach((c) => {
        c.onclick = () => {
          if (Number(c.dataset.rmTeen) === 10 && ms.tens > 0) ms.tens -= 1;
          else if (ms.ones > 0) ms.ones -= 1;
          if (ms.tens * 10 + ms.ones === m.target) win();
          else renderTool();
        };
      });
      return;
    }

    /* 5) NRICH Tug of War (줄다리기 대결!) */
    if (m.kind === 'tug_of_war') {
      const ans = m.pick === 'larger' ? (m.left > m.right ? 'left' : 'right') : (m.left < m.right ? 'left' : 'right');
      const shift = ms.selected === 'left' ? -44 : ms.selected === 'right' ? 44 : 0;
      el.innerHTML = `
        <div class="gm-center-stage">${global.SM_SVG.tugOfWarSVG(`${m.left}`, `${m.right}`, shift)}</div>
        <div class="gm-two-pick">
          <button type="button" class="gm-pick-card tug-left${ms.selected === 'left' ? (ans === 'left' ? ' correct' : ' wrong') : ''}" data-tug="left">
            ${global.SM_SVG.mascotSVG('bear', ms.selected === 'left' && ans === 'left' ? 'cheer' : 'happy', 52)}
            <strong>🔵 ${m.left}팀 당기기!</strong>
          </button>
          <button type="button" class="gm-pick-card tug-right${ms.selected === 'right' ? (ans === 'right' ? ' correct' : ' wrong') : ''}" data-tug="right">
            ${global.SM_SVG.mascotSVG('frog', ms.selected === 'right' && ans === 'right' ? 'cheer' : 'happy', 52)}
            <strong>🟢 ${m.right}팀 당기기!</strong>
          </button>
        </div>`;
      el.querySelectorAll('[data-tug]').forEach((b) => {
        b.onclick = () => {
          ms.selected = b.dataset.tug;
          if (ms.selected === ans) { fxHit(b, '🚩 영차 승리!', 'zap'); win(); }
          else miss();
        };
      });
      return;
    }
    /* 4, 5) 두 수 비교 카드 / 천칭 저울 고르기 */
    if (m.kind === 'compare_cards' || m.kind === 'scale_pick') {
      const leftItem = m.leftKind ? renderTokenAsset(m.leftKind, 48) : renderTokenAsset('gem', 44);
      const rightItem = m.rightKind ? renderTokenAsset(m.rightKind, 48) : renderTokenAsset('star', 44);
      const ans = m.pick === 'larger' ? (m.left > m.right ? 'left' : 'right') : (m.left < m.right ? 'left' : 'right');
      el.innerHTML = `
        <div class="gm-center-stage">${global.SM_SVG.balanceBeamSVG(m.left, m.right)}</div>
        <div class="gm-two-pick">
          <button type="button" class="gm-pick-card${ms.selected === 'left' ? (ans === 'left' ? ' correct' : ' wrong') : ''}" data-pick="left">
            ${leftItem}<strong>${m.leftLabel || m.left}</strong>
          </button>
          <button type="button" class="gm-pick-card${ms.selected === 'right' ? (ans === 'right' ? ' correct' : ' wrong') : ''}" data-pick="right">
            ${rightItem}<strong>${m.rightLabel || m.right}</strong>
          </button>
        </div>`;
      el.querySelectorAll('[data-pick]').forEach((b) => {
        b.onclick = () => {
          ms.selected = b.dataset.pick;
          if (ms.selected === ans) win();
          else miss();
        };
      });
      return;
    }

    /* 5) 천칭 저울 직접 맞추기 */
    if (m.kind === 'scale_build') {
      el.innerHTML = `
        <div class="gm-center-stage">${global.SM_SVG.balanceBeamSVG(ms.left, ms.right)}</div>
        <div class="gm-two-pick">
          <div class="gm-drop-pan" data-drop="pan:left">
            <div class="gm-pan-head">🔵 왼쪽 접시 <b>${ms.left}</b> / 목표 ${m.targetLeft}</div>
            <div class="gm-pan-dots">${Array.from({ length: ms.left }, () => renderTokenAsset('gem', 28)).join('')}</div>
            <button type="button" class="btn soft" data-pan-sub="left">－1 빼기</button>
          </div>
          <div class="gm-drop-pan" data-drop="pan:right">
            <div class="gm-pan-head">🟢 오른쪽 접시 <b>${ms.right}</b> / 목표 ${m.targetRight}</div>
            <div class="gm-pan-dots">${Array.from({ length: ms.right }, () => renderTokenAsset('star', 28)).join('')}</div>
            <button type="button" class="btn soft" data-pan-sub="right">－1 빼기</button>
          </div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-pan-add="left" role="button" tabindex="0">${renderTokenAsset('gem', 44)}<span>왼쪽 +1</span></div>
          <div class="gm-drag-card" data-pan-add="right" role="button" tabindex="0">${renderTokenAsset('star', 44)}<span>오른쪽 +1</span></div>
        </div>`;
      const checkDone = () => {
        if (ms.left === m.targetLeft && ms.right === m.targetRight) win();
        else renderTool();
      };
      bindDrag(el, '[data-pan-add]', (n) => ({ side: n.dataset.panAdd }), (p, zone) => {
        if (!zone) return;
        const drop = (zone.dataset.drop || '').split(':')[1];
        if (drop === 'left') ms.left = clamp(ms.left + 1, 0, 15);
        else if (drop === 'right') ms.right = clamp(ms.right + 1, 0, 15);
        playMathSfx('place');
        checkDone();
      }, {
        onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="pan:${p.side}"]`, el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="pan:${p.side}"]`, el); speak('구슬을 저울 접시로 끌어 놓으세요.'); },
        onActivate: (p) => { ms[p.side] = clamp(ms[p.side] + 1, 0, 15); checkDone(); },
      });
      el.querySelectorAll('[data-pan-sub]').forEach((b) => {
        b.onclick = () => { ms[b.dataset.panSub] = Math.max(0, ms[b.dataset.panSub] - 1); checkDone(); };
      });
      return;
    }

    /* 5) 천칭 저울 사이에 >, <, = 기호 끌어 끼우기 */
    if (m.kind === 'scale_sign') {
      el.innerHTML = `
        <div class="gm-sign-arena">
          <div class="gm-sign-box">${m.left}</div>
          <div class="gm-sign-slot" data-drop="sign-slot">${ms.sign || '?'}</div>
          <div class="gm-sign-box green">${m.right}</div>
        </div>
        <div class="gm-tray">
          ${['>', '<', '='].map((sg) => `<div class="gm-drag-card num" data-sign="${sg}" role="button" tabindex="0"><b>${sg}</b><span>끌어서 ?에 놓기</span></div>`).join('')}
        </div>`;
      const pick = (sg) => {
        ms.sign = sg;
        if (sg === m.answer) win();
        else miss();
      };
      bindDrag(el, '[data-sign]', (n) => ({ sg: n.dataset.sign }), (p, zone) => {
        if (zone && zone.dataset.drop === 'sign-slot') pick(p.sg);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="sign-slot"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="sign-slot"]', el); speak('크기 비교 기호를 끌어 ? 칸에 놓으세요.'); },
        onActivate: (p) => pick(p.sg),
      });
      return;
    }

    /* 5) 3개 중 보물상자(최소/최대) 고르기 */
    if (m.kind === 'order_pick') {
      const target = m.pick === 'min' ? Math.min(...m.items) : Math.max(...m.items);
      el.innerHTML = `<div class="gm-choice-row">${m.items.map((v) => `
        <button type="button" class="gm-chest-btn${ms.selected === v ? (v === target ? ' correct' : ' wrong') : ''}" data-opick="${v}">
          <span class="chest-icon">🧰</span>
          ${global.SM_SVG.itemSVG('star', 34)}
          <span class="chest-val">${v}원</span>
        </button>`).join('')}</div>`;
      el.querySelectorAll('[data-opick]').forEach((b) => {
        b.onclick = () => {
          ms.selected = Number(b.dataset.opick);
          if (ms.selected === target) win();
          else miss();
        };
      });
      return;
    }

    /* 6) 장바구니 합치기 */
    if (m.kind === 'cart_combine') {
      const remA = m.a - ms.placedA;
      const remB = m.b - ms.placedB;
      const totalNow = ms.placedA + ms.placedB;
      const itemsA = Array.from({ length: remA }, (_, i) => `<div class="gm-drag-card" data-cart-add="a" role="button" tabindex="0">${renderTokenAsset(m.kindA, 46)}</div>`).join('');
      const itemsB = Array.from({ length: remB }, (_, i) => `<div class="gm-drag-card" data-cart-add="b" role="button" tabindex="0">${renderTokenAsset(m.kindB, 46)}</div>`).join('');
      const cartInside = Array.from({ length: ms.placedA }, () => renderTokenAsset(m.kindA, 38)).join('') + Array.from({ length: ms.placedB }, () => renderTokenAsset(m.kindB, 38)).join('');
      el.innerHTML = `
        <div class="gm-cart-layout">
          <div class="gm-tray-group">
            <div class="gm-sub-tray"><span>첫 번째 묶음 (${remA}개 남음)</span><div>${itemsA || '✓'}</div></div>
            <div class="gm-sub-tray"><span>두 번째 묶음 (${remB}개 남음)</span><div>${itemsB || '✓'}</div></div>
          </div>
          <div class="gm-basket solo" data-drop="cart-drop">
            <div class="gm-basket-head">${global.SM_SVG.basketSVG('#2563eb', '#dbeafe', 48)}<span>모두 모은 장바구니</span><b>${totalNow} / ${m.a + m.b}개</b></div>
            <div class="gm-basket-items">${cartInside || '<span class="gm-drop-hint">양쪽 물건을 모두 여기로 끌어 모아요!</span>'}</div>
          </div>
        </div>`;
      const addOne = (which) => {
        if (which === 'a' && ms.placedA < m.a) ms.placedA += 1;
        else if (which === 'b' && ms.placedB < m.b) ms.placedB += 1;
        else return;
        playMathSfx('place');
        if (ms.placedA === m.a && ms.placedB === m.b) win();
        else { speak(`${ms.placedA + ms.placedB}개 모았어요!`); renderTool(); }
      };
      bindDrag(el, '[data-cart-add]', (n) => ({ w: n.dataset.cartAdd }), (p, zone) => {
        if (zone && zone.dataset.drop === 'cart-drop') addOne(p.w);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="cart-drop"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="cart-drop"]', el); speak('물건을 손가락으로 끌어 장바구니에 넣으세요.'); },
        onActivate: (p) => addOne(p.w),
      });
      return;
    }

    /* 6) Sumoku 방울 합체 게임 */
    if (m.kind === 'bubble_merge') {
      const pickedSum = ms.picked.reduce((s, idx) => s + m.bubbles[idx], 0);
      const bubblesHtml = m.bubbles.map((v, i) => {
        const on = ms.picked.includes(i);
        return `<button type="button" class="gm-bubble-btn${on ? ' picked' : ''}" data-bm="${i}"><span>${v}</span></button>`;
      }).join('');
      el.innerHTML = `
        <div class="gm-bubble-cauldron">
          <div class="gm-vault-status">목표 숫자: <b>${m.target}</b> · 선택한 방울 합: <b>${ms.picked.map((i) => m.bubbles[i]).join(' + ') || 0} = ${pickedSum}</b></div>
          <div class="gm-bubble-pond">${bubblesHtml}</div>
        </div>`;
      el.querySelectorAll('[data-bm]').forEach((b) => {
        b.onclick = () => {
          const i = Number(b.dataset.bm);
          if (ms.picked.includes(i)) {
            ms.picked = ms.picked.filter((x) => x !== i);
            playMathSfx('tap');
            renderTool();
            return;
          }
          ms.picked.push(i);
          fxHit(b, `${m.bubbles[i]}`, 'pop');
          if (ms.picked.length === 2) {
            const sum = m.bubbles[ms.picked[0]] + m.bubbles[ms.picked[1]];
            if (sum === m.target) win();
            else {
              ms.picked = [];
              miss(`합이 ${sum}이에요. 합쳐서 ${m.target}이 되는 방울 두 개를 골라 보세요!`);
            }
          } else {
            renderTool();
          }
        };
      });
      return;
    }

    /* 7) 볼링 핀 쓰러뜨리기 뺄셈 게임 */
    if (m.kind === 'bowling_sub') {
      const remain = m.total - ms.knocked.length;
      const pinsHtml = Array.from({ length: m.total }, (_, i) => {
        const down = ms.knocked.includes(i);
        return `<button type="button" class="gm-pin-btn${down ? ' down' : ''}" data-bpin="${i}" ${down ? 'disabled' : ''}>${global.SM_SVG.bowlingPinSVG(down, 58)}<span>${i + 1}</span></button>`;
      }).join('');
      el.innerHTML = `
        <div class="gm-bowling-lane">
          <div class="gm-pins-row">${pinsHtml}</div>
          <div class="gm-vault-status">🎳 쓰러뜨린 핀: <b>${ms.knocked.length} / ${m.remove}개</b> · 남은 핀: <b>${remain}개</b></div>
        </div>`;
      el.querySelectorAll('[data-bpin]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.dataset.bpin);
          if (ms.knocked.includes(idx) || ms.knocked.length >= m.remove) return;
          ms.knocked.push(idx);
          fxHit(b, '💥 쾅!', 'pop');
          if (ms.knocked.length === m.remove) win();
          else { speak(`${m.total - ms.knocked.length}개 남았어요!`); renderTool(); }
        };
      });
      return;
    }

    /* 7) 덜어내기 (거스름돈 빼기 게임) */
    if (m.kind === 'take_away') {
      const remain = m.total - ms.removed;
      const trayItems = Array.from({ length: remain }, (_, i) => `<div class="gm-drag-card" data-ta-item="${i}" role="button" tabindex="0">${renderTokenAsset(m.itemKind, 48)}</div>`).join('');
      const bagItems = Array.from({ length: ms.removed }, () => renderTokenAsset(m.itemKind, 36)).join('');
      el.innerHTML = `
        <div class="gm-two-pick">
          <div class="gm-sub-tray" style="min-height:150px">
            <span>남아 있는 것: <b>${remain}개</b></span>
            <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${trayItems || '<span class="gm-drop-hint">모두 덜어냈어요!</span>'}</div>
          </div>
          <div class="gm-basket solo" data-drop="ta-bag" style="border-color:#f43f5e;background:#fff1f2">
            <div class="gm-basket-head">${global.SM_SVG.basketSVG('#e11d48', '#ffe4e6', 44)}<span>덜어내는 봉투</span><b>${ms.removed} / ${m.remove}개</b></div>
            <div class="gm-basket-items">${bagItems || '<span class="gm-drop-hint">여기로 ${m.remove}개를 끌어 넣으세요</span>'}</div>
          </div>
        </div>`;
      const takeOne = () => {
        if (ms.removed >= m.remove) return;
        ms.removed += 1;
        playMathSfx('place');
        if (ms.removed === m.remove) win();
        else { speak(`${m.total - ms.removed}개 남았어요`); renderTool(); }
      };
      bindDrag(el, '[data-ta-item]', () => ({ one: 1 }), (p, zone) => {
        if (zone && zone.dataset.drop === 'ta-bag') takeOne();
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="ta-bag"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="ta-bag"]', el); speak('오른쪽 빨간 봉투로 끌어 덜어내세요.'); },
        onActivate: takeOne,
      });
      return;
    }

    /* 8) 10 만들어 더하기 게임 */
    if (m.kind === 'make_ten_game') {
      const total = m.a + m.b;
      const tenDone = ms.left === 10;
      const leftCells = Array.from({ length: 10 }, (_, i) => {
        const on = i < ms.left;
        return `<div class="gm-tf-cell${on ? ' on' : ''}">${on ? renderTokenAsset(i < m.a ? 'gem' : 'star', 34) : ''}</div>`;
      }).join('');
      const rightCells = Array.from({ length: ms.right }, (_, i) => `<div class="gm-drag-card" data-mt-dot="${i}" role="button" tabindex="0">${renderTokenAsset('star', 38)}</div>`).join('');
      const choices = [total - 1, total, total + 1];
      el.innerHTML = `
        <div class="gm-two-pick">
          <div class="gm-tf-board${tenDone ? ' gold' : ''}" data-drop="mt-left">
            <div class="gm-tf-counter">10칸 판: <b>${ms.left}</b>/10 ${tenDone ? '🔟 완성!' : ''}</div>
            <div class="gm-tf-grid" style="grid-template-columns:repeat(5,1fr)">${leftCells}</div>
          </div>
          <div class="gm-sub-tray">
            <span>더할 별: <b>${ms.right}개</b></span>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${rightCells || '모두 옮겼어요!'}</div>
          </div>
        </div>
        ${tenDone && !m.stopAtTen ? `
          <div class="gm-quest-sub">🔟 10을 만들었어요! <b>10 + ${ms.right}</b>은 얼마일까요?</div>
          <div class="gm-choice-row">${choices.map((c) => `<button type="button" class="gm-num-coin-btn" data-mt-ans="${c}"><span>${c}</span></button>`).join('')}</div>` : ''}`;
      const moveOne = () => {
        if (ms.left >= 10 || ms.right <= 0) return;
        ms.left += 1;
        ms.right -= 1;
        playMathSfx('place');
        if (ms.left === 10 && m.stopAtTen) win();
        else {
          if (ms.left === 10) speak(`10을 만들었어요! 이제 10 더하기 ${ms.right}을 골라 보세요.`);
          renderTool();
        }
      };
      bindDrag(el, '[data-mt-dot]', () => ({ one: 1 }), (p, zone) => {
        if (zone && zone.dataset.drop === 'mt-left') moveOne();
      }, {
        onStart: () => { if (state.settings.errorless && !tenDone) showHintTarget('[data-drop="mt-left"]', el); },
        onTap: () => { if (!tenDone) { if (state.settings.errorless) showHintTarget('[data-drop="mt-left"]', el); speak('오른쪽 별을 왼쪽 10칸 판으로 끌어 10을 채우세요.'); } },
        onActivate: moveOne,
      });
      el.querySelectorAll('[data-mt-ans]').forEach((b) => {
        b.onclick = () => {
          if (Number(b.dataset.mtAns) === total) win();
          else miss();
        };
      });
      return;
    }

    /* 9) 개구리 연못 뛰어 세기 게임 */
    if (m.kind === 'pond_jump') {
      const pads = m.seq.map((v, i) => v === null
        ? `<div class="gm-lily blank" data-drop="lily-blank">${ms.cleared ? m.answer : '?'}</div>`
        : `<div class="gm-lily">${m.coinMode ? global.SM_SVG.coinSVG(m.coinMode, 32) : ''}<span>${v}</span></div>`).join('<span class="gm-jump-arc">↷</span>');
      const frog = global.SM_SVG.mascotSVG('frog', ms.cleared ? 'cheer' : 'happy', 52);
      const tray = m.choices.map((c) => `<div class="gm-drag-card num" data-lily="${c}" role="button" tabindex="0"><b>${c}</b><span>끌어서 ?에 놓기</span></div>`).join('');
      el.innerHTML = `<div class="gm-pond"><div class="gm-pond-frog">${frog}</div><div class="gm-pond-pads">${pads}</div></div><div class="gm-tray">${tray}</div>`;
      const pick = (v) => {
        if (v === m.answer) win();
        else miss();
      };
      bindDrag(el, '[data-lily]', (n) => ({ v: Number(n.dataset.lily) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'lily-blank') pick(p.v);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="lily-blank"]', el); },
        onTap: () => { if (state.settings.errorless) showHintTarget('[data-drop="lily-blank"]', el); speak('숫자 연잎을 끌어 ? 자리에 놓으세요.'); },
        onActivate: (p) => pick(p.v),
      });
      return;
    }

    /* 10) NRICH Strike It Out 수직선 전략 게임 */
    if (m.kind === 'strike_it_out') {
      const pickedVals = ms.picked.map((idx) => m.nums[idx]);
      el.innerHTML = `
        <div class="gm-strike-board">
          <div class="gm-vault-status">⚡ 목표 <b>${m.target}</b>! 두 숫자를 골라 <b>[ ? ${m.op} ? = ${m.target} ]</b> 식을 완성하세요!</div>
          <div class="gm-strike-eq">
            <span class="gm-sign-box">${pickedVals[0] ?? '?'}</span>
            <span class="gm-plus">${m.op}</span>
            <span class="gm-sign-box green">${pickedVals[1] ?? '?'}</span>
            <span class="gm-plus">=</span>
            <span class="gm-sign-slot">${m.target}</span>
          </div>
          <div class="gm-choice-row">${m.nums.map((v, i) => `<button type="button" class="gm-num-coin-btn${ms.picked.includes(i) ? ' picked-strike' : ''}" data-sio="${i}"><span>${v}</span></button>`).join('')}</div>
        </div>`;
      el.querySelectorAll('[data-sio]').forEach((b) => {
        b.onclick = () => {
          const i = Number(b.dataset.sio);
          if (ms.picked.includes(i)) { ms.picked = ms.picked.filter((x) => x !== i); renderTool(); return; }
          ms.picked.push(i);
          fxHit(b, `${m.nums[i]}`, 'tap');
          if (ms.picked.length === 2) {
            const a = m.nums[ms.picked[0]], bVal = m.nums[ms.picked[1]];
            const res = m.op === '+' ? a + bVal : Math.max(a, bVal) - Math.min(a, bVal);
            if (res === m.target) { fxHit(el.querySelector('.gm-strike-eq'), '⚡ 명중!', 'zap'); win(); }
            else { ms.picked = []; miss(`${a} ${m.op} ${bVal}은 ${m.target}이 아니에요. 다른 숫자 짝을 눌러 보세요!`); }
          } else {
            renderTool();
          }
        };
      });
      return;
    }

    /* 10) 수직선 점프 게임 (NeurekaNUM 멘탈 수직선 + 로켓) */
    if (m.kind === 'nl_jump') {
      const posPct = (v) => `${((clamp(v, 0, 20) + 0.5) / 21) * 100}%`;
      const stops = Array.from({ length: 21 }, (_, i) => `<button type="button" class="nl-stop${i % 5 === 0 ? ' major' : ''}" data-nl-stop="${i}" aria-label="${i}"><span class="nl-num">${i % 2 === 0 ? i : ''}</span></button>`).join('');
      const markerIcon = m.rocket ? global.SM_SVG.rocketSVG(34) : '🐸';
      el.innerHTML = `
        <div class="nl-interactive gm-nl${m.rocket ? ' space' : ''}">
          <div class="nl-track" data-gmnl-track>
            <div class="nl-stops">${stops}</div>
            <div class="nl-target" style="left:${posPct(m.target)}">🪐 ${m.target}</div>
            <div class="nl-marker" data-gmnl-marker style="left:${posPct(ms.pos)}" role="button" tabindex="0">${markerIcon}</div>
          </div>
          <div class="nl-step-actions">
            <button type="button" class="btn soft" data-gmnl-step="-5">◀ -5</button>
            <button type="button" class="btn soft" data-gmnl-step="-1">◀ -1</button>
            <span class="nl-pos-badge">현재 <b>${ms.pos}</b> · 목표 <b>${m.target}</b></span>
            <button type="button" class="btn soft" data-gmnl-step="1">+1 ▶</button>
            <button type="button" class="btn soft" data-gmnl-step="5">+5 ▶</button>
          </div>
        </div>`;
      const move = (val) => {
        ms.pos = clamp(Math.round(val), 0, 20);
        fxHit(el.querySelector('[data-gmnl-marker]'), `${ms.pos}`, m.rocket ? 'rocket' : 'place');
        if (ms.pos === m.target) win();
        else { speak(`${ms.pos} 자리예요.`); renderTool(); }
      };
      el.querySelectorAll('[data-gmnl-step]').forEach((b) => {
        b.onclick = () => move(ms.pos + Number(b.dataset.gmnlStep));
      });
      const marker = el.querySelector('[data-gmnl-marker]');
      const track = el.querySelector('[data-gmnl-track]');
      if (marker && track) {
        marker.onpointerdown = (ev) => {
          ev.preventDefault();
          const pid = ev.pointerId;
          const sx = ev.clientX;
          let moved = false;
          let cur = ms.pos;
          try { marker.setPointerCapture(pid); } catch (_) {}
          const calcV = (cx) => {
            const r = track.getBoundingClientRect();
            return clamp(Math.floor(((cx - r.left) / r.width) * 21), 0, 20);
          };
          const onMove = (e) => {
            if (e.pointerId !== pid) return;
            if (!moved && Math.hypot(e.clientX - sx, e.clientY - ev.clientY) < 5) return;
            moved = true;
            cur = calcV(e.clientX);
            marker.style.left = posPct(cur);
          };
          const onUp = (e) => {
            if (e.pointerId !== pid) return;
            marker.removeEventListener('pointermove', onMove);
            marker.removeEventListener('pointerup', onUp);
            marker.removeEventListener('pointercancel', onUp);
            try { marker.releasePointerCapture(pid); } catch (_) {}
            if (moved) move(calcV(e.clientX));
            else speak('개구리를 좌우로 끌어 목표 깃발 자리에 놓으세요.');
          };
          marker.addEventListener('pointermove', onMove);
          marker.addEventListener('pointerup', onUp);
          marker.addEventListener('pointercancel', onUp);
        };
      }
      return;
    }

    /* 11) 십과 일 환전소 게임 */
    if (m.kind === 'place_exchange') {
      const total = ms.t * 10 + ms.u;
      const rods = Array.from({ length: ms.t }, () => `<button type="button" class="rod" data-ex-sub="t" title="십 1개 빼기">${'<span></span>'.repeat(10)}</button>`).join('');
      const units = Array.from({ length: ms.u }, () => `<button type="button" class="unit" data-ex-sub="u" title="일 1개 빼기"></button>`).join('');
      el.innerHTML = `
        <div class="gm-vault-status">현재 <b>${total}</b> (십 ${ms.t}개 · 일 ${ms.u}개) → 목표 <b>${m.target}</b></div>
        <div class="place-columns">
          <div class="place-col tens" data-drop="ex:t"><div class="pc-head"><span>🟩 십의 자리 (10원)</span><span>${ms.t}개</span></div><div class="pc-body">${rods || '<span class="muted">십모형</span>'}</div></div>
          <div class="place-col units" data-drop="ex:u"><div class="pc-head"><span>🟦 일의 자리 (1원)</span><span>${ms.u}개</span></div><div class="pc-body">${units || '<span class="muted">일모형</span>'}</div></div>
        </div>
        <div class="gm-tray">
          <div class="place-source ten" data-ex-add="t" role="button" tabindex="0">${global.SM_SVG.coinSVG(10, 36)}<span>십 +1</span></div>
          <div class="place-source one" data-ex-add="u" role="button" tabindex="0">${global.SM_SVG.coinSVG(1, 32)}<span>일 +1</span></div>
          <div class="drop-plate" data-drop="ex-trash" style="min-height:54px;padding:7px 12px;border-color:#fda4af;background:#fff1f2"><div class="plate-title" style="margin:0"><span>➖ 빼기 (누르거나 끌기)</span></div></div>
          <button type="button" class="bundle-big-btn blue" data-ex-act="bundle" ${ms.u < 10 ? 'disabled' : ''}>⚡ 10개 묶기 → 십 1</button>
          <button type="button" class="btn soft" data-ex-act="unbundle" ${ms.t <= 0 ? 'disabled' : ''}>🔓 십 1개 풀기</button>
        </div>`;
      const checkEx = () => {
        const curTotal = ms.t * 10 + ms.u;
        const okTens = m.requireTens ? ms.t === m.requireTens && ms.u === 0 : true;
        const okBundle = m.mode === 'bundle' ? ms.u < 10 : true;
        if (curTotal === m.target && okTens && okBundle) win();
        else renderTool();
      };
      bindDrag(el, '[data-ex-add]', (n) => ({ kind: n.dataset.exAdd }), (p, zone) => {
        if (!zone) return;
        const drop = (zone.dataset.drop || '').split(':')[1];
        if (drop === p.kind) { ms[p.kind] += 1; playMathSfx('place'); checkEx(); }
        else miss('알맞은 자리 칸에 놓아 보세요!');
      }, {
        onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="ex:${p.kind}"]`, el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="ex:${p.kind}"]`, el); speak('모형을 끌어 알맞은 자리에 놓으세요.'); },
        onActivate: (p) => { ms[p.kind] += 1; checkEx(); },
      });
      bindDrag(el, '[data-ex-sub]', (n) => ({ k: n.dataset.exSub }), (p, zone) => {
        if (zone && zone.dataset.drop === 'ex-trash' && ms[p.k] > 0) {
          ms[p.k] -= 1;
          playMathSfx('tap');
          checkEx();
        }
      }, {
        onTap: (p) => {
          if (ms[p.k] > 0) { ms[p.k] -= 1; playMathSfx('tap'); checkEx(); }
        },
      });
      el.querySelectorAll('[data-ex-act]').forEach((b) => {
        b.onclick = () => {
          if (b.dataset.exAct === 'bundle' && ms.u >= 10) { ms.u -= 10; ms.t += 1; playMathSfx('guided'); checkEx(); }
          else if (b.dataset.exAct === 'unbundle' && ms.t >= 1) { ms.t -= 1; ms.u += 10; playMathSfx('guided'); checkEx(); }
        };
      });
      return;
    }

    /* 12) 백·십·일 마트 금고 게임 */
    if (m.kind === 'vault_hundreds') {
      const total = ms.h * 100 + ms.t * 10 + ms.u;
      const flats = Array.from({ length: ms.h }, () => `<button type="button" class="flat" data-vh-sub="h" title="백 1개 빼기">${'<span></span>'.repeat(100)}</button>`).join('');
      const rods = Array.from({ length: ms.t }, () => `<button type="button" class="rod" data-vh-sub="t" title="십 1개 빼기">${'<span></span>'.repeat(10)}</button>`).join('');
      const units = Array.from({ length: ms.u }, () => `<button type="button" class="unit" data-vh-sub="u" title="일 1개 빼기"></button>`).join('');
      el.innerHTML = `
        <div class="gm-vault-status">🔐 금고 현재: <b>${total}</b> → 목표: <b>${m.target}</b></div>
        <div class="place-columns">
          <div class="place-col hundreds" data-drop="vh:h"><div class="pc-head"><span>🟧 백(100원)</span><span>${ms.h}개</span></div><div class="pc-body">${flats || '<span class="muted">백모형</span>'}</div></div>
          <div class="place-col tens" data-drop="vh:t"><div class="pc-head"><span>🟩 십(10원)</span><span>${ms.t}개</span></div><div class="pc-body">${rods || '<span class="muted">십모형</span>'}</div></div>
          <div class="place-col units" data-drop="vh:u"><div class="pc-head"><span>🟦 일(1원)</span><span>${ms.u}개</span></div><div class="pc-body">${units || '<span class="muted">일모형</span>'}</div></div>
        </div>
        <div class="gm-tray">
          <div class="place-source hundred" data-vh-add="h" role="button" tabindex="0">${global.SM_SVG.coinSVG(100, 34)}<span>백 +1</span></div>
          <div class="place-source ten" data-vh-add="t" role="button" tabindex="0">${global.SM_SVG.coinSVG(10, 32)}<span>십 +1</span></div>
          <div class="place-source one" data-vh-add="u" role="button" tabindex="0">${global.SM_SVG.coinSVG(1, 30)}<span>일 +1</span></div>
          <div class="drop-plate" data-drop="vh-trash" style="min-height:54px;padding:7px 12px;border-color:#fda4af;background:#fff1f2"><div class="plate-title" style="margin:0"><span>➖ 빼기 (누르거나 끌기)</span></div></div>
          <button type="button" class="bundle-big-btn" data-vh-bundle100 ${ms.t < 10 ? 'disabled' : ''}>⚡ 100개 묶기 → 백 1</button>
        </div>`;
      const checkVh = () => {
        const curT = ms.h * 100 + ms.t * 10 + ms.u;
        const okH = m.requireH ? ms.h === m.requireH && ms.t === 0 : true;
        if (curT === m.target && okH) win();
        else renderTool();
      };
      bindDrag(el, '[data-vh-add]', (n) => ({ k: n.dataset.vhAdd }), (p, zone) => {
        if (!zone) return;
        const drop = (zone.dataset.drop || '').split(':')[1];
        if (drop === p.k) { ms[p.k] += 1; playMathSfx('place'); checkVh(); }
        else miss('백·십·일 알맞은 자리 칸에 놓으세요!');
      }, {
        onStart: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="vh:${p.k}"]`, el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget(`[data-drop="vh:${p.k}"]`, el); speak('모형을 끌어 알맞은 자리에 놓으세요.'); },
        onActivate: (p) => { ms[p.k] += 1; checkVh(); },
      });
      bindDrag(el, '[data-vh-sub]', (n) => ({ k: n.dataset.vhSub }), (p, zone) => {
        if (zone && zone.dataset.drop === 'vh-trash' && ms[p.k] > 0) {
          ms[p.k] -= 1;
          playMathSfx('tap');
          checkVh();
        }
      }, {
        onTap: (p) => {
          if (ms[p.k] > 0) { ms[p.k] -= 1; playMathSfx('tap'); checkVh(); }
        },
      });
      const b100 = el.querySelector('[data-vh-bundle100]');
      if (b100) b100.onclick = () => {
        if (ms.t >= 10) { ms.t -= 10; ms.h += 1; playMathSfx('guided'); checkVh(); }
      };
      return;
    }

    /* 13) Jo Boaler YouCubed "How Close to 100?" 영역 땅따먹기 */
    if (m.kind === 'youcubed_array') {
      const gridSize = 6;
      let cells = '';
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const hit = ms.stamped && r < m.rows && c < m.cols;
          cells += `<button type="button" class="gm-yc-cell${hit ? ' on' : ''}" data-yc-r="${r}" data-yc-c="${c}">${hit ? (r * m.cols + c + 1) : ''}</button>`;
        }
      }
      el.innerHTML = `
        <div class="gm-center-stage">
          <div class="gm-vault-status">🟦 목표 직사각형: <b>세로 ${m.rows} × 가로 ${m.cols} = ${m.rows * m.cols}칸</b> · 격자판을 눌러 도장을 찍으세요!</div>
          <div class="gm-yc-grid" style="grid-template-columns:repeat(${gridSize},1fr)">${cells}</div>
        </div>`;
      el.querySelectorAll('[data-yc-r]').forEach((b) => {
        b.onclick = () => {
          if (ms.stamped) return;
          ms.stamped = true;
          fxHit(el.querySelector('.gm-yc-grid'), `🟦 ${m.rows}×${m.cols}=${m.rows * m.cols}!`, 'zap');
          win();
        };
      });
      return;
    }

    /* 13) 묶음 곱셈 포장 공장 */
    if (m.kind === 'mul_factory') {
      const slots = ms.groups.map((cnt, g) => {
        const full = cnt >= m.perGroup;
        const inside = Array.from({ length: cnt }, () => renderTokenAsset(m.itemKind, 30)).join('');
        return `<div class="group-slot${full ? ' filled' : ''}" data-drop="gmul:${g}">
          <div class="gs-title"><span>${g + 1}상자</span><b>${cnt}/${m.perGroup}</b></div>
          <div class="gs-dots">${inside || '<span class="gm-drop-hint">여기로!</span>'}</div>
        </div>`;
      }).join('');
      const packDots = Array.from({ length: m.perGroup }, () => renderTokenAsset(m.itemKind, 24)).join('');
      const total = ms.groups.reduce((s, v) => s + v, 0);
      el.innerHTML = `
        <div class="group-grid">${slots}</div>
        <div class="gm-vault-status">지금 <b>${total}개</b> (${m.perGroup}개 × ${m.groups}상자 = ${m.perGroup * m.groups}개)</div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-gmul-pack role="button" tabindex="0"><div style="display:flex;gap:2px">${packDots}</div><span>${m.perGroup}개 한 묶음</span></div>
          <div class="gm-drag-card" data-gmul-one role="button" tabindex="0">${renderTokenAsset(m.itemKind, 42)}<span>낱개 1개</span></div>
        </div>`;
      const checkMul = () => {
        if (ms.groups.every((v) => v === m.perGroup)) win();
        else renderTool();
      };
      const nextSlot = () => {
        const i = ms.groups.findIndex((v) => v < m.perGroup);
        return i >= 0 ? i : 0;
      };
      bindDrag(el, '[data-gmul-pack]', () => ({ pack: m.perGroup }), (p, zone) => {
        if (!zone) return;
        const drop = zone.dataset.drop || '';
        if (drop.startsWith('gmul:')) {
          const idx = Number(drop.split(':')[1]);
          ms.groups[idx] = m.perGroup;
          playMathSfx('place');
          checkMul();
        }
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget(`[data-drop="gmul:${nextSlot()}"]`, el); },
        onTap: () => { if (state.settings.errorless) showHintTarget(`[data-drop="gmul:${nextSlot()}"]`, el); speak('묶음을 끌어 빈 상자에 넣으세요.'); },
        onActivate: () => { ms.groups[nextSlot()] = m.perGroup; checkMul(); },
      });
      bindDrag(el, '[data-gmul-one]', () => ({ one: 1 }), (p, zone) => {
        if (!zone) return;
        const drop = zone.dataset.drop || '';
        if (drop.startsWith('gmul:')) {
          const idx = Number(drop.split(':')[1]);
          if (ms.groups[idx] < m.perGroup) { ms.groups[idx] += 1; playMathSfx('place'); checkMul(); }
        }
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget(`[data-drop="gmul:${nextSlot()}"]`, el); },
        onActivate: () => { const i = nextSlot(); if (ms.groups[i] < m.perGroup) { ms.groups[i] += 1; checkMul(); } },
      });
      return;
    }

    /* 14) 동물 친구 공평하게 나누기 파티 */
    if (m.kind === 'div_party') {
      const each = Math.floor(m.total / m.plates);
      const placed = ms.plates.reduce((s, v) => s + v, 0);
      const rem = m.total - placed;
      const friends = ['bunny', 'bear', 'fox', 'frog', 'bunny'];
      const platesHtml = ms.plates.map((cnt, i) => `
        <div class="gm-party-plate${cnt === each ? ' happy' : ''}" data-drop="gdiv:${i}">
          ${global.SM_SVG.mascotSVG(friends[i % friends.length], cnt === each ? 'cheer' : 'happy', 46)}
          <div class="gm-pan-head">${i + 1}번 친구 · <b>${cnt}</b>/${each}</div>
          <div class="gm-pan-dots">${Array.from({ length: cnt }, () => renderTokenAsset(m.itemKind, 26)).join('') || '<span class="gm-drop-hint">여기로!</span>'}</div>
        </div>`).join('');
      el.innerHTML = `
        <div class="plate-grid">${platesHtml}</div>
        <div class="gm-tray">
          <div class="gm-drag-card big" data-gdiv-one role="button" tabindex="0">${renderTokenAsset(m.itemKind, 50)}<span>남은 것 ${rem}개 (끌어 나누기)</span></div>
        </div>`;
      const give = (idx) => {
        if (rem <= 0) return;
        if (ms.plates[idx] >= each) { speak('이 친구는 이미 다 받았어요! 다른 접시에 놓으세요.'); return; }
        ms.plates[idx] += 1;
        playMathSfx('place');
        if (ms.plates.every((v) => v === each)) win();
        else renderTool();
      };
      const nextP = () => {
        const i = ms.plates.findIndex((v) => v < each);
        return i >= 0 ? i : 0;
      };
      bindDrag(el, '[data-gdiv-one]', () => ({ one: 1 }), (p, zone) => {
        if (!zone) return;
        const drop = zone.dataset.drop || '';
        if (drop.startsWith('gdiv:')) give(Number(drop.split(':')[1]));
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget(`[data-drop="gdiv:${nextP()}"]`, el); },
        onTap: () => { if (state.settings.errorless) showHintTarget(`[data-drop="gdiv:${nextP()}"]`, el); speak('간식을 끌어 친구 접시에 똑같이 나누어 주세요.'); },
        onActivate: () => give(nextP()),
      });
      return;
    }

    /* 15) 피자 분수 게임 */
    if (m.kind === 'pizza_game') {
      el.innerHTML = `
        <div class="gm-center-stage">
          <div class="gm-pizza-wrap">${global.SM_SVG.pizzaSVG(ms.n, m.denom, '#f97316', 180)}</div>
          <div class="gm-vault-status">현재 피자: <b>${ms.n}/${m.denom}</b> → 목표: <b>${m.target}/${m.denom}</b></div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-pz-add role="button" tabindex="0">🍕 <span>1/${m.denom} 조각 추가</span></div>
          <button type="button" class="btn soft" data-pz-sub>－ 1조각 빼기</button>
        </div>`;
      const checkPz = () => {
        if (ms.n === m.target) win();
        else renderTool();
      };
      bindDrag(el, '[data-pz-add]', () => ({ add: 1 }), (p, zone) => {
        if (zone) { ms.n = clamp(ms.n + 1, 0, m.denom); playMathSfx('place'); checkPz(); }
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('.gm-pizza-wrap', el); },
        onActivate: () => { ms.n = clamp(ms.n + 1, 0, m.denom); checkPz(); },
      });
      el.querySelectorAll('[data-pz-idx]').forEach((sl) => {
        sl.onclick = () => {
          const idx = Number(sl.dataset.pzIdx);
          ms.n = ms.n === idx + 1 ? idx : idx + 1;
          playMathSfx('place');
          checkPz();
        };
      });
      el.querySelector('[data-pz-sub]').onclick = () => {
        ms.n = Math.max(0, ms.n - 1);
        playMathSfx('tap');
        checkPz();
      };
      return;
    }

    if (m.kind === 'frac_compare') {
      const list = m.choices || [m.a, m.b];
      const ansIdx = m.answerIdx !== undefined ? m.answerIdx : ((m.a.n / m.a.d) > (m.b.n / m.b.d) ? 0 : 1);
      el.innerHTML = `
        ${m.matchTarget ? `<div class="gm-center-stage">기준 피자: <b>${m.matchTarget.n}/${m.matchTarget.d}</b> ${global.SM_SVG.pizzaSVG(m.matchTarget.n, m.matchTarget.d, '#2563eb', 120)}</div>` : ''}
        <div class="gm-choice-row">${list.map((f, i) => `
          <button type="button" class="gm-pizza-choice${ms.selected === i ? (i === ansIdx ? ' correct' : ' wrong') : ''}" data-fc="${i}">
            ${global.SM_SVG.pizzaSVG(f.n, f.d, i === 0 ? '#f97316' : '#16a34a', 110)}
            <b>${f.n}/${f.d}</b>
          </button>`).join('')}</div>`;
      el.querySelectorAll('[data-fc]').forEach((b) => {
        b.onclick = () => {
          ms.selected = Number(b.dataset.fc);
          if (ms.selected === ansIdx) win();
          else miss();
        };
      });
      return;
    }

    /* 16) 마법 물약 소수 게임 */
    if (m.kind === 'potion_game') {
      el.innerHTML = `
        <div class="gm-center-stage">
          <div data-drop="pot-drop">${global.SM_SVG.potionBeakerSVG(ms.tenths, 10, '#38bdf8', 150)}</div>
          <div class="gm-vault-status">물약 양: <b>${(ms.tenths / 10).toFixed(1)}</b> → 목표: <b>${(m.target / 10).toFixed(1)}</b></div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-pot-add="1" role="button" tabindex="0">💧 <span>+0.1 방울 끌기</span></div>
          <button type="button" class="btn primary" data-pot-btn="1">＋0.1</button>
          <button type="button" class="btn soft" data-pot-btn="-1">－0.1</button>
        </div>`;
      const upd = (delta) => {
        ms.tenths = clamp(ms.tenths + delta, 0, 10);
        playMathSfx('place');
        if (ms.tenths === m.target) win();
        else { speak(`${(ms.tenths / 10).toFixed(1)}`); renderTool(); }
      };
      bindDrag(el, '[data-pot-add]', () => ({ d: 1 }), (p, zone) => {
        if (zone && zone.dataset.drop === 'pot-drop') upd(1);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="pot-drop"]', el); },
        onActivate: () => upd(1),
      });
      el.querySelectorAll('[data-pot-btn]').forEach((b) => {
        b.onclick = () => upd(Number(b.dataset.potBtn));
      });
      return;
    }

    if (m.kind === 'potion_compare') {
      const ans = m.left > m.right ? 'left' : 'right';
      el.innerHTML = `<div class="gm-two-pick">
        <button type="button" class="gm-pick-card${ms.selected === 'left' ? (ans === 'left' ? ' correct' : ' wrong') : ''}" data-pc="left">
          ${global.SM_SVG.potionBeakerSVG(m.left, 10, '#3b82f6', 110)}<strong>${(m.left / 10).toFixed(1)}</strong>
        </button>
        <button type="button" class="gm-pick-card${ms.selected === 'right' ? (ans === 'right' ? ' correct' : ' wrong') : ''}" data-pc="right">
          ${global.SM_SVG.potionBeakerSVG(m.right, 10, '#16a34a', 110)}<strong>${(m.right / 10).toFixed(1)}</strong>
        </button>
      </div>`;
      el.querySelectorAll('[data-pc]').forEach((b) => {
        b.onclick = () => { ms.selected = b.dataset.pc; if (ms.selected === ans) win(); else miss(); };
      });
      return;
    }

    /* 17) 측정 3종 게임 */
    if (m.kind === 'measure_length') {
      const pct = (ms.val / 20) * 100;
      const ticks = Array.from({ length: 21 }, (_, i) => `<div class="ruler-tick${i % 5 === 0 ? ' major' : ''}" style="left:${(i / 20) * 100}%"><span>${i % 5 === 0 ? i : ''}</span></div>`).join('');
      el.innerHTML = `
        <div class="measure-panel">
          <div class="measure-line"><span>목표 길이: <b>${m.target} cm</b></span><span class="measure-value" id="gmLenVal">${ms.val} cm</span></div>
          <input type="range" id="gmLenRange" min="0" max="20" step="1" value="${ms.val}"/>
          <div class="ruler-wrap">
            <div class="ruler-stage" id="gmRulerStage">
              <div class="ruler-fill" style="width:${pct}%"></div>
              <div class="ruler-object" style="left:${pct}%">✏️<span>${ms.val}cm</span></div>
            </div>
            <div class="ruler" id="gmRuler"><div class="ruler-ticks">${ticks}</div></div>
          </div>
          <div class="nl-step-actions" style="margin-top:10px">
            <button type="button" class="btn soft" data-gl-step="-1">◀ -1cm</button>
            <button type="button" class="btn primary" data-gl-step="1">+1cm ▶</button>
          </div>
        </div>`;
      const rng = $('gmLenRange');
      const applyLen = (v, finalize) => {
        ms.val = clamp(Math.round(v), 0, 20);
        rng.value = String(ms.val);
        $('gmLenVal').textContent = `${ms.val} cm`;
        el.querySelector('.ruler-fill').style.width = `${(ms.val / 20) * 100}%`;
        const obj = el.querySelector('.ruler-object');
        obj.style.left = `${(ms.val / 20) * 100}%`;
        obj.innerHTML = `✏️<span>${ms.val}cm</span>`;
        if (finalize) {
          fxHit(obj, `${ms.val}cm`, 'tap');
          if (ms.val === m.target) win();
          else speak(`${ms.val} 센티미터`);
        }
      };
      el.querySelectorAll('[data-gl-step]').forEach((b) => {
        b.onclick = () => applyLen(ms.val + Number(b.dataset.glStep), true);
      });
      rng.oninput = () => applyLen(Number(rng.value), false);
      rng.onchange = () => applyLen(Number(rng.value), true);
      const rStage = $('gmRulerStage');
      const rBar = $('gmRuler');
      [rStage, rBar].forEach((target) => {
        if (!target) return;
        target.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          const pid = ev.pointerId;
          try { target.setPointerCapture(pid); } catch (_) {}
          const calc = (cx) => {
            const rect = rStage.getBoundingClientRect();
            return ((cx - rect.left) / rect.width) * 20;
          };
          applyLen(calc(ev.clientX), false);
          const onM = (e) => { if (e.pointerId === pid) applyLen(calc(e.clientX), false); };
          const onU = (e) => {
            if (e.pointerId !== pid) return;
            target.removeEventListener('pointermove', onM);
            target.removeEventListener('pointerup', onU);
            target.removeEventListener('pointercancel', onU);
            applyLen(calc(e.clientX), true);
          };
          target.addEventListener('pointermove', onM);
          target.addEventListener('pointerup', onU);
          target.addEventListener('pointercancel', onU);
        });
      });
      return;
    }

    if (m.kind === 'measure_length_read') {
      const pct = (m.value / 20) * 100;
      const ticks = Array.from({ length: 21 }, (_, i) => `<div class="ruler-tick${i % 5 === 0 ? ' major' : ''}" style="left:${(i / 20) * 100}%"><span>${i % 5 === 0 ? i : ''}</span></div>`).join('');
      el.innerHTML = `
        <div class="measure-panel">
          <div class="ruler-wrap">
            <div class="ruler-stage"><div class="ruler-fill" style="width:${pct}%"></div><div class="ruler-object" style="left:${pct}%">${global.SM_SVG.itemSVG('eraser', 34)}</div></div>
            <div class="ruler"><div class="ruler-ticks">${ticks}</div></div>
          </div>
          <div class="gm-choice-row">${m.choices.map((c) => `<button type="button" class="gm-num-coin-btn${ms.selected === c ? (c === m.value ? ' correct' : ' wrong') : ''}" data-mlr="${c}"><span>${c}cm</span></button>`).join('')}</div>
        </div>`;
      el.querySelectorAll('[data-mlr]').forEach((b) => {
        b.onclick = () => { ms.selected = Number(b.dataset.mlr); if (ms.selected === m.value) win(); else miss(); };
      });
      return;
    }

    if (m.kind === 'measure_volume') {
      const pct = (ms.val / 10) * 100;
      el.innerHTML = `
        <div class="measure-panel">
          <div class="measure-line"><span>목표 양: <b>${m.target * 100}mL (${m.target}컵)</b></span><span class="measure-value" id="gmVolVal">${ms.val * 100} mL</span></div>
          <input type="range" id="gmVolRange" min="0" max="10" step="1" value="${ms.val}"/>
          <div class="beaker" id="gmBeaker"><div class="beaker-fill" style="height:${pct}%"></div><div class="beaker-handle" style="bottom:${pct}%">💧 ${ms.val * 100}mL</div></div>
          <div class="nl-step-actions" style="margin-top:10px">
            <button type="button" class="btn soft" data-gv-step="-1">💧 -100mL</button>
            <button type="button" class="btn primary" data-gv-step="1">💧 +100mL</button>
          </div>
        </div>`;
      const rng = $('gmVolRange');
      const applyVol = (v, finalize) => {
        ms.val = clamp(Math.round(v), 0, 10);
        rng.value = String(ms.val);
        $('gmVolVal').textContent = `${ms.val * 100} mL`;
        el.querySelector('.beaker-fill').style.height = `${(ms.val / 10) * 100}%`;
        const h = el.querySelector('.beaker-handle');
        h.style.bottom = `${(ms.val / 10) * 100}%`;
        h.textContent = `💧 ${ms.val * 100}mL`;
        if (finalize) {
          fxHit(el.querySelector('#gmBeaker'), `${ms.val * 100}mL`, 'pop');
          if (ms.val === m.target) win();
          else speak(`${ms.val * 100} 밀리리터`);
        }
      };
      el.querySelectorAll('[data-gv-step]').forEach((b) => {
        b.onclick = () => applyVol(ms.val + Number(b.dataset.gvStep), true);
      });
      rng.oninput = () => applyVol(Number(rng.value), false);
      rng.onchange = () => applyVol(Number(rng.value), true);
      const bk = $('gmBeaker');
      if (bk) {
        bk.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          const pid = ev.pointerId;
          try { bk.setPointerCapture(pid); } catch (_) {}
          const calc = (cy) => {
            const r = bk.getBoundingClientRect();
            return ((r.bottom - cy) / r.height) * 10;
          };
          applyVol(calc(ev.clientY), false);
          const onM = (e) => { if (e.pointerId === pid) applyVol(calc(e.clientY), false); };
          const onU = (e) => {
            if (e.pointerId !== pid) return;
            bk.removeEventListener('pointermove', onM);
            bk.removeEventListener('pointerup', onU);
            bk.removeEventListener('pointercancel', onU);
            applyVol(calc(e.clientY), true);
          };
          bk.addEventListener('pointermove', onM);
          bk.addEventListener('pointerup', onU);
          bk.addEventListener('pointercancel', onU);
        });
      }
      return;
    }

    if (m.kind === 'measure_volume_add') {
      const curSum = (ms.aAdded ? m.a : 0) + (ms.bAdded ? m.b : 0);
      el.innerHTML = `
        <div class="gm-center-stage">
          ${global.SM_SVG.potionBeakerSVG(curSum, 10, '#0ea5e9', 140)}
          <div class="gm-vault-status">큰 비커: <b>${curSum * 100} mL</b></div>
        </div>
        <div class="gm-tray">
          <button type="button" class="btn primary" data-va="a" ${ms.aAdded ? 'disabled' : ''}>🥤 ${m.a * 100}mL 붓기</button>
          <button type="button" class="btn green" data-va="b" ${ms.bAdded ? 'disabled' : ''}>🥤 ${m.b * 100}mL 붓기</button>
        </div>`;
      el.querySelectorAll('[data-va]').forEach((b) => {
        b.onclick = () => {
          if (b.dataset.va === 'a') ms.aAdded = true;
          else ms.bAdded = true;
          playMathSfx('place');
          if (ms.aAdded && ms.bAdded) win();
          else renderTool();
        };
      });
      return;
    }

    if (m.kind === 'measure_weight') {
      el.innerHTML = `
        <div class="measure-panel">
          <div class="scale"><span class="num">${ms.val}</span><span class="u">g (목표 ${m.target}g)</span></div>
          <div class="weight-tray">
            ${[100, 200, 500].map((w) => `<div class="weight-token${w === 500 ? ' w500' : ''}" data-gw="${w}" role="button" tabindex="0">+${w}g</div>`).join('')}
            <div class="drop-plate" data-drop="gw-drop" style="min-height:52px;padding:7px 10px;border-color:#fcd34d;background:#fffbeb;flex:1"><div class="plate-title" style="margin:0"><span>⚖️ 저울 접시 · 여기로 끌어요</span></div></div>
            <button type="button" class="btn soft" data-gw-clear>0g으로</button>
          </div>
        </div>`;
      const addW = (w) => {
        ms.val = clamp(ms.val + w, 0, 1000);
        playMathSfx('place');
        if (ms.val === m.target) win();
        else { if (ms.val > m.target) speak('무게가 넘었어요! 0g으로를 눌러 다시 맞춰 보세요.'); renderTool(); }
      };
      bindDrag(el, '[data-gw]', (n) => ({ w: Number(n.dataset.gw) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'gw-drop') addW(p.w);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="gw-drop"]', el); },
        onActivate: (p) => addW(p.w),
      });
      el.querySelector('[data-gw-clear]').onclick = () => { ms.val = 0; renderTool(); };
      return;
    }

    /* 18) 시계 게임 */
    if (m.kind === 'clock_set') {
      el.innerHTML = `
        <div class="clock-wrap">
          ${clockSVG(ms.minutes)}
          <div>
            <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px">
              ${global.SM_SVG.skyBackdropSVG(ms.minutes)}
              <div class="digital">${timeText(ms.minutes)}</div>
            </div>
            <div class="row-flex" style="justify-content:center;margin-top:10px">
              <button type="button" class="btn soft" data-gc="-30">－30분</button>
              <button type="button" class="btn primary" data-gc="30">＋30분</button>
              <button type="button" class="btn green" data-gc="60">＋1시간</button>
            </div>
          </div>
        </div>`;
      const checkClk = () => {
        const norm = (x) => ((x % 720) + 720) % 720;
        if (norm(ms.minutes) === norm(m.targetMin)) win();
        else { speak(timeText(ms.minutes)); renderTool(); }
      };
      el.querySelectorAll('[data-gc]').forEach((b) => {
        b.onclick = () => { ms.minutes = (ms.minutes + Number(b.dataset.gc) + 1440) % 1440; checkClk(); };
      });
      const clk = el.querySelector('.clock');
      if (clk) {
        let hand = null;
        const setFromPt = (e) => {
          const r = clk.getBoundingClientRect();
          let ang = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
          if (ang < 0) ang += 360;
          const h24 = Math.floor(ms.minutes / 60);
          const min = ms.minutes % 60;
          if (hand === 'hour') {
            const h12 = Math.round(ang / 30) % 12;
            ms.minutes = ((h12 * 60 + min) % 1440 + 1440) % 1440;
          } else {
            const snapped = (Math.round(ang / 30) * 5) % 60;
            ms.minutes = ((h24 * 60 + snapped) % 1440 + 1440) % 1440;
          }
          const dig = el.querySelector('.digital');
          if (dig) dig.textContent = timeText(ms.minutes);
        };
        clk.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          const grab = ev.target.closest('[data-clock-hand]');
          hand = grab ? grab.dataset.clockHand : 'minute';
          const pid = ev.pointerId;
          try { clk.setPointerCapture(pid); } catch (_) {}
          const onM = (e) => { if (e.pointerId === pid) setFromPt(e); };
          const onU = (e) => {
            if (e.pointerId !== pid) return;
            clk.removeEventListener('pointermove', onM);
            clk.removeEventListener('pointerup', onU);
            clk.removeEventListener('pointercancel', onU);
            setFromPt(e);
            checkClk();
          };
          clk.addEventListener('pointermove', onM);
          clk.addEventListener('pointerup', onU);
          clk.addEventListener('pointercancel', onU);
        });
      }
      return;
    }

    if (m.kind === 'clock_read' || m.kind === 'clock_scene') {
      el.innerHTML = `
        ${m.showMin !== undefined ? `<div class="gm-center-stage">${clockSVG(m.showMin)}</div>` : ''}
        <div class="gm-choice-row">${m.choices.map((c) => `
          <button type="button" class="gm-num-coin-btn${ms.selected === c.value ? (c.value === m.answer ? ' correct' : ' wrong') : ''}" data-cr="${c.value}">
            ${c.min !== undefined ? clockSVG(c.min) : ''}
            <span>${c.label}</span>
          </button>`).join('')}</div>`;
      el.querySelectorAll('[data-cr]').forEach((b) => {
        b.onclick = () => { ms.selected = b.dataset.cr; if (ms.selected === m.answer) win(); else miss(); };
      });
      return;
    }

    /* 19) 꿈의 마트 계산대 & 거스름돈 게임 */
    if (m.kind === 'mart_pay' || m.kind === 'mart_change') {
      const isChange = m.kind === 'mart_change';
      const target = isChange ? m.change : m.price;
      const sum = ms.coins[10] * 10 + ms.coins[50] * 50 + ms.coins[100] * 100 + ms.coins[500] * 500;
      const trayCoins = [10, 50, 100, 500].map((v) =>
        `<div class="gm-coin-drag" data-mc-add="${v}" role="button" tabindex="0">${global.SM_SVG.coinSVG(v, 58)}<span>+${v}원</span></div>`).join('');
      const placed = [500, 100, 50, 10].flatMap((v) =>
        Array.from({ length: ms.coins[v] }, () => `<button type="button" class="gm-placed-coin" data-mc-rm="${v}" title="${v}원 빼기">${global.SM_SVG.coinSVG(v, 44)}</button>`)).join('');
      el.innerHTML = `
        <div class="gm-mart-counter">
          <div class="gm-mart-product">
            <div style="display:flex;gap:6px">${renderTokenAsset(m.itemKind, 56)}${m.itemKind2 ? renderTokenAsset(m.itemKind2, 56) : ''}</div>
            <div>
              <div class="gm-mart-name">${m.itemName}</div>
              <div class="gm-mart-price">${isChange ? `낸 돈 ${m.paid}원 - 값 ${m.price}원 = 거스름돈 <b>${target}원</b>` : `가격: <b>${target}원</b>`}</div>
            </div>
          </div>
          <div class="gm-register-tray" data-drop="mc-tray">
            <div class="gm-register-head"><span>${isChange ? '🪙 거스름돈 접시' : '💳 계산대 동전 접시'}</span><b>현재 ${sum}원 / 목표 ${target}원</b></div>
            <div class="gm-register-coins">${placed || '<span class="gm-drop-hint">아래 동전을 손가락으로 끌어 놓으세요! (누르면 빼기)</span>'}</div>
          </div>
          <div class="gm-tray">${trayCoins}</div>
        </div>`;
      const addCoin = (v) => {
        ms.coins[v] = (ms.coins[v] || 0) + 1;
        const now = ms.coins[10] * 10 + ms.coins[50] * 50 + ms.coins[100] * 100 + ms.coins[500] * 500;
        fxHit(el.querySelector('[data-drop="mc-tray"]'), `+${v}원`, 'coin');
        if (now === target) {
          if (global.SM_VFX) global.SM_VFX.coinShower(el.querySelector('[data-drop="mc-tray"]'));
          win();
        } else {
          if (now > target) speak(`${now}원! 조금 넘었어요. 접시 위 동전을 누르면 뺄 수 있어요.`);
          else speak(`${now}원`);
          renderTool();
        }
      };
      bindDrag(el, '[data-mc-add]', (n) => ({ v: Number(n.dataset.mcAdd) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'mc-tray') addCoin(p.v);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="mc-tray"]', el); },
        onTap: (p) => { if (state.settings.errorless) showHintTarget('[data-drop="mc-tray"]', el); speak(`${p.v}원 동전을 계산대 접시로 끌어 놓으세요.`); },
        onActivate: (p) => addCoin(p.v),
      });
      el.querySelectorAll('[data-mc-rm]').forEach((b) => {
        b.onclick = () => {
          const v = Number(b.dataset.mcRm);
          if (ms.coins[v] > 0) ms.coins[v] -= 1;
          const now = ms.coins[10] * 10 + ms.coins[50] * 50 + ms.coins[100] * 100 + ms.coins[500] * 500;
          if (now === target) win();
          else renderTool();
        };
      });
      return;
    }

    if (m.kind === 'mart_count') {
      el.innerHTML = `
        <div class="gm-center-stage"><div class="gm-sub-box">${m.showCoins.map((v) => global.SM_SVG.coinSVG(v, 58)).join('')}</div></div>
        <div class="gm-choice-row">${m.choices.map((c) => `<button type="button" class="gm-num-coin-btn${ms.selected === c ? (c === m.answer ? ' correct' : ' wrong') : ''}" data-mco="${c}"><span>${c}원</span></button>`).join('')}</div>`;
      el.querySelectorAll('[data-mco]').forEach((b) => {
        b.onclick = () => { ms.selected = Number(b.dataset.mco); if (ms.selected === m.answer) win(); else miss(); };
      });
      return;
    }

    if (m.kind === 'mart_exchange') {
      el.innerHTML = `
        <div class="gm-center-stage">
          <div class="gm-register-tray" data-drop="mex-slot" style="min-width:260px">
            <div class="gm-register-head"><span>🔄 동전 환전기 (목표: ${global.SM_SVG.coinSVG(m.targetCoin, 26)} ${m.targetCoin}원)</span><b>${ms.inserted}/${m.needCount}개</b></div>
            <div class="gm-register-coins">${Array.from({ length: ms.inserted }, () => global.SM_SVG.coinSVG(m.needDenom, 48)).join('') || `<span class="gm-drop-hint">${m.needDenom}원 동전을 끌어 넣으세요</span>`}</div>
          </div>
          <div class="gm-tray">
            ${[10, 50, 100].map((v) => `<div class="gm-coin-drag" data-mex="${v}" role="button" tabindex="0">${global.SM_SVG.coinSVG(v, 54)}<span>${v}원</span></div>`).join('')}
          </div>
        </div>`;
      const put = (v) => {
        if (v !== m.needDenom) { miss(`${m.needDenom}원 동전을 넣어 보세요!`); return; }
        ms.inserted += 1;
        playMathSfx('place');
        if (ms.inserted >= m.needCount) win();
        else renderTool();
      };
      bindDrag(el, '[data-mex]', (n) => ({ v: Number(n.dataset.mex) }), (p, zone) => {
        if (zone && zone.dataset.drop === 'mex-slot') put(p.v);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="mex-slot"]', el); },
        onActivate: (p) => put(p.v),
      });
      return;
    }

    /* 20) 도형·무늬 게임 */
    if (m.kind === 'shape_count') {
      const sh = SHAPES.find((x) => x.id === m.shapeId) || SHAPES[0];
      const pts = m.shapeId === 'triangle'
        ? [[50, 10], [92, 86], [8, 86]]
        : [[14, 14], [86, 14], [86, 86], [14, 86]];
      let laserLines = '';
      for (let i = 0; i < ms.corners.length - 1; i++) {
        const p1 = pts[ms.corners[i]], p2 = pts[ms.corners[i + 1]];
        laserLines += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/>`;
      }
      if (ms.corners.length === pts.length && pts.length > 2) {
        const pLast = pts[ms.corners[ms.corners.length - 1]], pFirst = pts[ms.corners[0]];
        laserLines += `<line x1="${pLast[0]}" y1="${pLast[1]}" x2="${pFirst[0]}" y2="${pFirst[1]}" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/>`;
      }
      const dots = pts.map(([x, y], i) => {
        const hit = ms.corners.includes(i);
        return `<circle cx="${x}" cy="${y}" r="11" fill="${hit ? '#22c55e' : '#f59e0b'}" stroke="#fff" stroke-width="2.5" class="gm-vertex-btn" data-vtx="${i}"/>
          <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" pointer-events="none">${hit ? ms.corners.indexOf(i) + 1 : '?'}</text>`;
      }).join('');
      el.innerHTML = `<div class="gm-center-stage"><svg viewBox="0 0 100 100" width="180" height="180">${sh.svg}${laserLines}${dots}</svg><div class="gm-vault-status">찾은 꼭짓점: <b>${ms.corners.length}</b> / ${pts.length}개</div></div>`;
      el.querySelectorAll('[data-vtx]').forEach((c) => {
        c.onclick = () => {
          const i = Number(c.dataset.vtx);
          if (ms.corners.includes(i)) return;
          ms.corners.push(i);
          fxHit(c, `${ms.corners.length}`, 'note', ms.corners.length - 1);
          if (ms.corners.length >= pts.length) win();
          else { speak(countWord(ms.corners.length)); renderTool(); }
        };
      });
      return;
    }

    if (m.kind === 'shape_build') {
      const palette = SHAPES.map((x) => `<div class="shape-tile" data-gsb-add="${x.id}" role="button" tabindex="0"><svg viewBox="0 0 100 100">${x.svg}</svg><span>${x.name}</span></div>`).join('');
      const placed = ms.board.map((inst, i) => {
        const x = SHAPES.find((q) => q.id === inst.id) || SHAPES[0];
        return `<button type="button" class="shape-instance" data-gsb-inst="${i}" style="left:${inst.x}%;top:${inst.y}%;transform:translate(-50%,-50%) rotate(${inst.rot}deg)"><svg viewBox="0 0 100 100">${x.svg}</svg><span class="si-badge">${i + 1}</span></button>`;
      }).join('');
      el.innerHTML = `
        <div class="shape-board-wrap">
          <div class="shape-board" data-drop="gsb-board">${placed || '<div class="board-hint">도형을 여기로 3개 이상 끌어 멋진 그림을 만들어요!</div>'}</div>
          <div><div class="shape-palette">${palette}</div><div class="gm-vault-status" style="margin-top:8px">놓은 도형: <b>${ms.board.length} / ${m.minCount}개</b></div></div>
        </div>`;
      const add = (id, x, y) => {
        ms.board.push({ id, x: clamp(x ?? 50, 12, 88), y: clamp(y ?? 50, 12, 88), rot: 0 });
        playMathSfx('place');
        if (ms.board.length >= m.minCount) win();
        else renderTool();
      };
      bindDrag(el, '[data-gsb-add]', (n) => ({ id: n.dataset.gsbAdd }), (p, zone, _el, ev) => {
        if (zone && zone.dataset.drop === 'gsb-board') {
          const r = el.querySelector('.shape-board').getBoundingClientRect();
          add(p.id, ((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100);
        }
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="gsb-board"]', el); },
        onActivate: (p) => add(p.id, 30 + ms.board.length * 20, 50),
      });
      return;
    }

    if (m.kind === 'pattern_game') {
      const seqHtml = m.seq.map((s, idx) => `<button type="button" class="pattern-box gm-pat-note" data-pat-note="${idx}">${s}</button>`).join('') + `<div class="pattern-box q" data-drop="pat-slot">${ms.placed || '?'}</div>`;
      const tray = m.choices.map((c) => `<div class="gm-drag-card num" data-pat-c="${c}" role="button" tabindex="0"><b style="font-size:28px">${c}</b><span>끌어서 ?에 놓기</span></div>`).join('');
      el.innerHTML = `<div class="pattern-row">${seqHtml}</div><div class="gm-tray">${tray}</div>`;
      el.querySelectorAll('[data-pat-note]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.dataset.patNote);
          fxHit(b, '🎵', 'note', m.choices.indexOf(m.seq[idx]));
        };
      });
      const pick = (c) => { ms.placed = c; if (c === m.answer) win(); else miss(); };
      bindDrag(el, '[data-pat-c]', (n) => ({ c: n.dataset.patC }), (p, zone) => {
        if (zone && zone.dataset.drop === 'pat-slot') pick(p.c);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="pat-slot"]', el); },
        onActivate: (p) => pick(p.c),
      });
      return;
    }

    if (m.kind === 'shape_pick') {
      el.innerHTML = `<div class="gm-choice-row">${m.choices.map((id) => {
        const sh = SHAPES.find((q) => q.id === id);
        return `<button type="button" class="gm-pizza-choice${ms.selected === id ? (id === m.targetId ? ' correct' : ' wrong') : ''}" data-shp="${id}"><svg viewBox="0 0 100 100" width="90" height="90">${sh.svg}</svg><b>${sh.name}</b></button>`;
      }).join('')}</div>`;
      el.querySelectorAll('[data-shp]').forEach((b) => {
        b.onclick = () => { ms.selected = b.dataset.shp; if (ms.selected === m.targetId) win(); else miss(); };
      });
      return;
    }

    /* 21) 그래프 & 이야기 장바구니 게임 */
    if (m.kind === 'graph_pick' || m.kind === 'graph_diff' || m.kind === 'graph_sum') {
      const c = m.counts;
      const max = Math.max(c.apple, c.banana, c.grape, 1);
      const bars = ['apple', 'banana', 'grape'].map((k) => {
        const col = k === 'apple' ? '#2563eb' : k === 'banana' ? '#d97706' : '#7c3aed';
        const icons = Array.from({ length: c[k] }, () => renderTokenAsset(k, 28)).join('');
        return `<div class="data-row"><span class="data-label">${renderTokenAsset(k, 28)} ${tokenLabel(k)}</span><div class="data-track"><div class="data-fill" style="width:${(c[k] / max) * 100}%;background:${col}">${icons} <b>${c[k]}</b></div></div></div>`;
      }).join('');
      let actionHtml = '';
      const keys = Object.keys(c);
      const targetK = m.pick === 'max'
        ? keys.reduce((best, k) => (c[k] > c[best] ? k : best), keys[0])
        : keys.reduce((best, k) => (c[k] < c[best] ? k : best), keys[0]);
      if (m.kind === 'graph_pick') {
        actionHtml = `<div class="gm-choice-row">${['apple', 'banana', 'grape'].map((k) => `<button type="button" class="gm-num-coin-btn${ms.selected === k ? (k === targetK ? ' correct' : ' wrong') : ''}" data-gp="${k}">${renderTokenAsset(k, 40)}<span>${tokenLabel(k)} (${c[k]}개)</span></button>`).join('')}</div>`;
      } else {
        actionHtml = `<div class="gm-choice-row">${m.choices.map((v) => `<button type="button" class="gm-num-coin-btn${ms.selected === v ? (v === m.answer ? ' correct' : ' wrong') : ''}" data-ga="${v}"><span>${v}개</span></button>`).join('')}</div>`;
      }
      el.innerHTML = `<div class="data-chart">${bars}</div>${actionHtml}`;
      el.querySelectorAll('[data-gp]').forEach((b) => {
        b.onclick = () => {
          ms.selected = b.dataset.gp;
          if (ms.selected === targetK) win();
          else miss();
        };
      });
      el.querySelectorAll('[data-ga]').forEach((b) => {
        b.onclick = () => {
          ms.selected = Number(b.dataset.ga);
          if (ms.selected === m.answer) win();
          else miss();
        };
      });
      return;
    }

    if (m.kind === 'graph_build') {
      const c = ms.counts;
      const max = Math.max(c.apple, c.banana, c.grape, m.targetVal, 1);
      const bars = ['apple', 'banana', 'grape'].map((k) => {
        const col = k === 'apple' ? '#2563eb' : k === 'banana' ? '#d97706' : '#7c3aed';
        return `<div class="data-row"><span class="data-label">${renderTokenAsset(k, 28)} ${tokenLabel(k)}</span><div class="data-track" data-drop="gb:${k}"><div class="data-fill" style="width:${(c[k] / max) * 100}%;background:${col}">${c[k]}개</div></div></div>`;
      }).join('');
      el.innerHTML = `<div class="data-chart">${bars}</div><div class="gm-tray"><div class="gm-drag-card" data-gb-add="apple" role="button" tabindex="0">${renderTokenAsset('apple', 48)}<span>사과 +1 끌기</span></div></div>`;
      const addG = () => {
        c.apple = clamp(c.apple + 1, 0, 10);
        playMathSfx('place');
        if (c.apple === m.targetVal) win();
        else renderTool();
      };
      bindDrag(el, '[data-gb-add]', () => ({ k: 'apple' }), (p, zone) => {
        if (zone && zone.dataset.drop === 'gb:apple') addG();
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="gb:apple"]', el); },
        onActivate: addG,
      });
      return;
    }

    if (m.kind === 'story_basket') {
      const inside = Array.from({ length: ms.a }, () => renderTokenAsset('apple', 36)).join('') + Array.from({ length: ms.b }, () => renderTokenAsset('orange', 36)).join('');
      el.innerHTML = `
        <div class="gm-basket solo" data-drop="sb-drop">
          <div class="gm-basket-head">${global.SM_SVG.basketSVG('#16a34a', '#dcfce7', 48)}<span>과일 바구니 (사과 ${ms.a}/${m.needA} · 귤 ${ms.b}/${m.needB})</span><b>모두 ${ms.a + ms.b}개</b></div>
          <div class="gm-basket-items">${inside || '<span class="gm-drop-hint">사과 4개와 귤 3개를 여기로 끌어 담아요!</span>'}</div>
        </div>
        <div class="gm-tray">
          <div class="gm-drag-card" data-sb-add="a" role="button" tabindex="0">${renderTokenAsset('apple', 48)}<span>사과 +1</span></div>
          <div class="gm-drag-card" data-sb-add="b" role="button" tabindex="0">${renderTokenAsset('orange', 48)}<span>귤 +1</span></div>
        </div>`;
      const addS = (w) => {
        if (w === 'a' && ms.a < m.needA) ms.a += 1;
        else if (w === 'b' && ms.b < m.needB) ms.b += 1;
        else { speak('필요한 개수를 모두 담았어요!'); return; }
        playMathSfx('place');
        if (ms.a === m.needA && ms.b === m.needB) win();
        else renderTool();
      };
      bindDrag(el, '[data-sb-add]', (n) => ({ w: n.dataset.sbAdd }), (p, zone) => {
        if (zone && zone.dataset.drop === 'sb-drop') addS(p.w);
      }, {
        onStart: () => { if (state.settings.errorless) showHintTarget('[data-drop="sb-drop"]', el); },
        onActivate: (p) => addS(p.w),
      });
      return;
    }

    /* 교사 사용자 추가 문제 */
    if (m.kind === 'choice_cards') {
      el.innerHTML = `<div class="gm-choice-row">${m.choices.map((c) => `
        <button type="button" class="gm-num-coin-btn${ms.selected === c.value ? (c.value === m.answer ? ' correct' : ' wrong') : ''}" data-cc="${c.value}">
          ${global.SM_SVG.itemSVG('star', 34)}<span>${c.label}</span>
        </button>`).join('')}</div>`;
      el.querySelectorAll('[data-cc]').forEach((b) => {
        b.onclick = () => { ms.selected = b.dataset.cc; if (ms.selected === m.answer) win(); else miss(); };
      });
    }
  }

  global.SM_GAME = {
    STAGE_MONEY_META,
    renderGameArena,
    resetMission: () => { gameSession.missionKey = ''; gameSession.sandboxMode = false; },
    isSandbox: () => gameSession.sandboxMode,
  };
})(window);
