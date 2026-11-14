"use strict";

/* ============================================================
   2. 21단계 세분화 교육과정 + 상태
   ============================================================ */
const STAGES = [
  { id: 1, domain: "count", title: "1. 같은 것끼리 모으기", short: "같은 것 모으기", subtitle: "색과 모양으로 분류하기", hint: "색과 모양을 살펴보고 같은 것끼리 바구니에 담아 보세요.", preset: null, tool: "sort" },
  { id: 2, domain: "count", title: "2. 1부터 5까지 세기", short: "5까지 세기", subtitle: "하나씩 짚어 세기 (1~5)", hint: "10칸 판의 왼쪽부터 1개씩 눌러 5까지 세어 보세요.", preset: { first: "5", op: null, second: "" }, tool: "count" },
  { id: 3, domain: "count", title: "3. 6부터 10까지 세기", short: "10까지 세기", subtitle: "10칸 판 채우기 (6~10)", hint: "6부터 10까지 칸을 채우며 10개 묶음 감각을 익혀 보세요.", preset: { first: "8", op: null, second: "" }, tool: "count" },
  { id: 4, domain: "count", title: "4. 11부터 20까지 세기", short: "11~20 세기", subtitle: "10개 한 묶음과 낱개", hint: "10개 묶음 1개와 낱개를 합쳐 11부터 20까지 세어 보세요.", preset: { first: "10", op: "+", second: "4" }, tool: "place" },
  { id: 5, domain: "count", title: "5. 어느 쪽이 더 많을까", short: "크기 비교", subtitle: "두 수 비교하기 (>, <, =)", hint: "두 수를 나란히 놓고 하나씩 짝을 지어 비교해 보세요.", preset: { first: "6", op: "+", second: "4" }, tool: "compare" },
  { id: 6, domain: "calc", title: "6. 두 수 모으기 (더하기)", short: "수 모으기", subtitle: "한 자리 덧셈", hint: "두 묶음의 물건을 하나로 모아 모두 몇 개인지 세어 보세요.", preset: { first: "3", op: "+", second: "5" }, tool: "compose" },
  { id: 7, domain: "calc", title: "7. 수 가르기 (빼기)", short: "수 가르기", subtitle: "한 자리 뺄셈", hint: "전체에서 일부를 덜어내면 몇 개가 남는지 확인해 보세요.", preset: { first: "8", op: "-", second: "3" }, tool: "compose" },
  { id: 8, domain: "calc", title: "8. 10 만들어 더하기", short: "10 만들기", subtitle: "10칸 먼저 채우고 더하기", hint: "10칸 판의 빈칸을 먼저 채워 10을 만들고 남은 수를 더해요.", preset: { first: "7", op: "+", second: "5" }, tool: "maketen" },
  { id: 9, domain: "calc", title: "9. 2씩·5씩·10씩 뛰어 세기", short: "뛰어 세기", subtitle: "규칙대로 점프하며 세기", hint: "수직선에서 2칸, 5칸, 10칸씩 뛰어 세며 규칙을 익혀 보세요.", preset: { first: "5", op: "+", second: "5" }, tool: "strategy" },
  { id: 10, domain: "calc", title: "10. 수직선 점프 계산", short: "점프 계산", subtitle: "이어 세기 · 거꾸로 세기", hint: "수직선에서 앞으로 또는 뒤로 점프하며 계산해 보세요.", preset: { first: "8", op: "+", second: "7" }, tool: "strategy" },
  { id: 11, domain: "calc", title: "11. 십과 일 묶어 계산하기", short: "십·일 묶기", subtitle: "두 자리 수 덧셈·뺄셈", hint: "일모형 10개가 모이면 십모형 1개로 묶어요.", preset: { first: "24", op: "+", second: "18" }, tool: "place" },
  { id: 12, domain: "calc", title: "12. 백·십·일 세 자리 수", short: "백 모형 계산", subtitle: "100 묶기 · 세 자리 수", hint: "십모형 10개는 백모형 1개가 돼요. 자릿값을 맞춰 계산해요.", preset: { first: "125", op: "+", second: "143" }, tool: "place" },
  { id: 13, domain: "calc", title: "13. 같은 수씩 묶어 곱하기", short: "묶음 곱셈", subtitle: "몇씩 몇 묶음 (×)", hint: "같은 수씩 여러 묶음을 만들어 전체 개수를 구해 보세요.", preset: { first: "3", op: "×", second: "4" }, tool: "multiply" },
  { id: 14, domain: "calc", title: "14. 똑같이 나누기", short: "똑같이 나누기", subtitle: "접시에 공평하게 나누기 (÷)", hint: "전체를 여러 접시에 똑같은 개수씩 나누어 담아 보세요.", preset: { first: "12", op: "÷", second: "3" }, tool: "multiply" },
  { id: 15, domain: "calc", title: "15. 분수 조각 알아보기", short: "분수 조각", subtitle: "전체와 부분 (1/2, 1/4 등)", hint: "전체를 똑같이 나눈 조각을 분수로 나타내고 더해 보세요.", preset: { first: "1/2", op: "+", second: "1/4" }, tool: "fraction" },
  { id: 16, domain: "calc", title: "16. 소수 알아보기와 계산", short: "소수 계산", subtitle: "0.1 단위 · 소수 덧셈/뺄셈", hint: "분수 1/10은 소수 0.1과 같아요. 소수점을 맞춰 계산해요.", preset: { first: "0.4", op: "+", second: "0.3" }, tool: "fraction" },
  { id: 17, domain: "life", title: "17. 길이 · 물의 양 · 무게 재기", short: "눈금 재기", subtitle: "cm · mL · g 단위 읽기", hint: "눈금을 움직이며 길이, 물의 양, 무게를 재어 보세요.", preset: { first: "12", op: null, second: "" }, tool: "measure", measureTab: "length" },
  { id: 18, domain: "life", title: "18. 시계 읽기 (몇 시 · 몇 시 30분)", short: "시계 읽기", subtitle: "짧은 바늘과 긴 바늘", hint: "시계 바늘을 움직여 몇 시, 몇 시 30분을 읽어 보세요.", preset: { first: "9", op: null, second: "" }, tool: "measure", measureTab: "clock" },
  { id: 19, domain: "life", title: "19. 돈 세기와 물건 사기", short: "돈 계산", subtitle: "동전 모으기 · 거스름돈", hint: "동전을 더해 금액을 만들고 물건 값을 계산해 보세요.", preset: { first: "100", op: "+", second: "50" }, tool: "measure", measureTab: "money" },
  { id: 20, domain: "life", title: "20. 도형과 반복 무늬 놀이", short: "도형 · 무늬", subtitle: "변·꼭짓점 · 반복 규칙", hint: "도형의 변과 꼭짓점을 세어 보고, 반복되는 무늬 규칙을 찾아요.", preset: { first: "4", op: "+", second: "4" }, tool: "shape" },
  { id: 21, domain: "data", title: "21. 그림 그래프와 생활 문제", short: "과일 그래프", subtitle: "그림 그래프 · 가장 많은 것", hint: "과일을 그래프에 놓고 가장 많은 것과 차이를 구해 보세요.", preset: { first: "5", op: "-", second: "3" }, tool: "data" }
];

const DOMAIN_META = {
  count: { label: "🔢 하나둘 숫자 세기", className: "num" },
  calc: { label: "➕ 더하기·빼기·곱하기·나누기", className: "num" },
  life: { label: "🕒 시계·돈·길이·도형 놀이", className: "shape" },
  data: { label: "📊 그림 그래프 놀이", className: "data" }
};

const COURSES = {
  count: { title: "하나둘 숫자 세기 (1~5단계)", stageIds: [1, 2, 3, 4, 5] },
  calc: { title: "더하기·빼기·곱하기·나누기 (6~16단계)", stageIds: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  life: { title: "시계·돈·길이·도형 놀이 (17~20단계)", stageIds: [17, 18, 19, 20] },
  data: { title: "그림 그래프 놀이 (21단계)", stageIds: [21] }
};

const MICRO_LESSONS = {
  1: { goal: "같은 모양이나 색깔끼리 모으면 수를 세기 쉬워져요.", guided: "과일을 알맞은 바구니로 보내 보세요.", try: "남은 과일도 분류한 뒤 바구니마다 몇 개인지 세어 보세요." },
  2: { goal: "1부터 5까지 물건 하나에 숫자 하나를 연결해 세어요.", guided: "10칸 판의 점을 왼쪽부터 5칸까지 하나씩 눌러 보세요.", try: "다섯 칸을 채워 보고 숫자로 나타내 보세요." },
  3: { goal: "6부터 10까지 10칸 판을 채우며 수 감각을 키워요.", guided: "빈칸을 눌러 8칸, 10칸까지 채워 보세요.", try: "10칸이 가득 차면 10개 묶음을 눌러 확인해 보세요." },
  4: { goal: "10개 한 묶음과 낱개로 11부터 20까지 세어요.", guided: "십모형 1개와 일모형을 놓아 14, 17을 만들어 보세요.", try: "10보다 몇 개 더 많은지 세어 보세요." },
  5: { goal: "두 수를 비교해 더 많은 쪽과 같은 양을 찾아요.", guided: "두 묶음의 물건을 하나씩 짝지어 보세요.", try: "큰 수를 가리키고 수직선 위치를 확인하세요." },
  6: { goal: "두 묶음을 하나로 합치며 덧셈을 이해해요.", guided: "첫 번째 묶음과 두 번째 묶음을 모아 모두 몇 개인지 세어요.", try: "다른 수를 넣어 모으기 식을 만들어 보세요." },
  7: { goal: "전체 묶음에서 일부를 덜어내며 뺄셈을 이해해요.", guided: "전체 개수에서 빼는 수만큼 덜어내 보세요.", try: "남은 개수가 몇 개인지 세어 식을 확인하세요." },
  8: { goal: "10칸을 먼저 채우면 받아올림 덧셈이 쉬워져요.", guided: "7칸이 채워진 판에 몇 개를 옮기면 10이 되는지 확인하세요.", try: "10을 만들고 남은 수가 몇 개인지 더해 보세요." },
  9: { goal: "2씩, 5씩, 10씩 뛰어 세면 큰 수도 빠르게 셀 수 있어요.", guided: "수직선에서 2칸, 5칸, 10칸씩 점프해 보세요.", try: "다음에 도착할 숫자를 맞혀 보세요." },
  10: { goal: "수직선에서 앞뒤로 점프하며 덧셈과 뺄셈을 풀어요.", guided: "시작 수에서 더할 때는 앞으로, 뺄 때는 뒤로 점프해요.", try: "수직선 표시를 끌어서 정답 자리에 놓아 보세요." },
  11: { goal: "일모형 10개는 십모형 1개로 묶을 수 있어요.", guided: "일모형 10개를 10개 묶음으로 바꾸어 보세요.", try: "24 + 18처럼 받아올림이 있는 계산을 해 보세요." },
  12: { goal: "십모형 10개는 백모형 1개가 되어 세 자리 수를 만들어요.", guided: "백·십·일 자리를 맞추어 세 자리 수를 표현해 보세요.", try: "100 모형을 이용해 큰 수의 덧셈을 확인하세요." },
  13: { goal: "같은 수씩 여러 묶음으로 놓아 곱셈을 익혀요.", guided: "3개씩 4묶음처럼 같은 개수로 묶어 보세요.", try: "전체가 모두 몇 개인지 세어 곱셈식을 확인하세요." },
  14: { goal: "전체를 여러 곳에 공평하게 나누는 나눗셈을 경험해요.", guided: "12개를 3개의 접시에 하나씩 나누어 담아 보세요.", try: "접시 한 개에 몇 개씩 들어갔는지 확인하세요." },
  15: { goal: "전체를 똑같이 나눈 조각을 분수로 나타내요.", guided: "분수 막대와 원 그림으로 1/2, 1/4 크기를 비교해요.", try: "분모가 같은 분수나 간단한 분수를 더해 보세요." },
  16: { goal: "전체를 10조각으로 나눈 0.1 단위로 소수를 이해해요.", guided: "계산기에서 소수점(.)을 눌러 0.4 + 0.3을 계산해요.", try: "0.5가 1/2과 같은 크기인지 확인해 보세요." },
  17: { goal: "길이(cm), 들이(mL), 무게(g)를 눈금으로 재어요.", guided: "측정 탭에서 길이·들이·무게를 골라 눈금을 움직여 보세요.", try: "눈금이 가리키는 숫자와 단위를 함께 읽어 보세요." },
  18: { goal: "시계의 짧은 바늘과 긴 바늘을 보고 시간을 읽어요.", guided: "시계 바늘을 움직여 몇 시, 몇 시 30분을 만들어 보세요.", try: "하루 일과와 어울리는 시각을 찾아보세요." },
  19: { goal: "동전을 모아 금액을 세고 물건을 사 보아요.", guided: "10원, 50원, 100원, 500원 동전을 눌러 금액을 만들어요.", try: "목표 금액에 맞게 동전을 모아 보세요." },
  20: { goal: "도형의 변과 꼭짓점을 세고 반복 무늬 규칙을 찾아요.", guided: "도형을 눌러 변의 수를 세고 무늬의 다음 모양을 골라 보세요.", try: "반복되는 마디가 무엇인지 찾아보세요." },
  21: { goal: "자료를 그래프로 나타내고 가장 많은 항목을 찾아요.", guided: "과일을 그래프 위로 끌어 막대를 만들어 보세요.", try: "가장 많은 과일과 가장 적은 과일의 차이를 구해 보세요." }
};

const ITEMS = [
  { id: "apple", label: "🍎 사과", a: "🍎", b: "🍏" },
  { id: "star", label: "⭐ 별", a: "⭐", b: "🌟" },
  { id: "ball", label: "🔵 구슬", a: "🔵", b: "🟢" },
  { id: "block", label: "🧱 블록", a: "🟦", b: "🟩" }
];

const state = {
  course: null,
  courseComplete: false,
  stage: 6,
  lessonStep: 0,
  exampleIdx: 0,
  expr: { first: "3", operator: "+", second: "5" },
  resultVisible: true,
  formulaMode: "both",
  itemTheme: "apple",
  voice: true,
  parts: { hundreds: 0, tens: 0, units: 8 },
  anim: { playing: false, shown: Infinity, mode: "add", token: 0 },
  countPlay: { idx: -1, token: 0 },
  compare: { a: 6, b: 4 },
  strategy: "forward",
  fractions: { a: { n: 1, d: 4 }, b: { n: 2, d: 4 } },
  groupingSize: 10,
  measure: { tab: "length", length: 12, volume: 6, weight: 450, minutes: 570, coins: { 10: 0, 50: 0, 100: 0, 500: 0 } },
  pattern: { index: 0, chosen: null, solved: false },
  shapeTab: "shape",
  shapeId: "triangle",
  data: { apple: 5, banana: 3, grape: 4, answer: null, solved: false, wordSolved: false },
  sort: { items: [], counts: { apple: 0, lemon: 0, grape: 0 }, done: false },
  history: [],
  view: "activity",
  tokens: 0,
  promptLevel: 0,
  lastInteraction: Date.now(),
  settings: {
    textSize: "normal",
    touch: "normal",
    wait: 8,
    tokenMax: 5,
    motion: false,
    contrast: false,
    easy: false,
    errorless: true,
    haptic: true
  },
  session: { trials: 0, independent: 0, prompted: 0, errors: 0, started: Date.now(), log: [] },
  bundle: { ones: 0, tens: 0, hundreds: 0 },
  mulGroups: [],
  mulKey: "",
  divPlates: [],
  divRem: 0,
  divKey: "",
  shapeBoard: [],
  shapeSelected: null,
  nlMarker: null,
  nlBase: null,
  composeRemoved: 0,
  composeBaseA: null,
  story: { apple: 0, orange: 0 },
  sortSelected: null,
  aacSentence: [],
  practice: { idxByStage: {}, activeKey: "", selected: null, solved: {}, feedback: null, hintShown: false }
};

const SETTINGS_KEY = "stepmath.support.settings.v1";
const SESSION_KEY = "stepmath.support.session.v1";
let animTimer = null;
let countTimer = null;
let autoHintTimer = null;
let breakTimer = null;
let breakRemaining = 60;
let breakPaused = false;

const EASY_LESSONS = {
  1: { goal: "같은 것끼리 모아요.", guided: "과일을 같은 바구니에 넣어요.", try: "다른 과일도 모두 넣어요." },
  2: { goal: "1부터 5까지 세어요.", guided: "점을 하나씩 눌러 5칸을 채워요.", try: "모두 몇 개인지 세어요." },
  3: { goal: "6부터 10까지 세어요.", guided: "점을 눌러 10칸을 채워요.", try: "10개 묶기를 눌러요." },
  4: { goal: "11부터 20까지 세어요.", guided: "10개 묶음 1개와 낱개를 놓아요.", try: "모두 몇 개인지 읽어요." },
  5: { goal: "어느 쪽이 더 많은지 봐요.", guided: "점을 양쪽 접시에 나누어 놓아요.", try: "더 많은 쪽을 가리켜요." },
  6: { goal: "두 수를 모아요.", guided: "두 묶음을 하나로 합쳐요.", try: "모두 몇 개인지 세어요." },
  7: { goal: "수를 갈라요.", guided: "전체에서 몇 개를 덜어내요.", try: "남은 개수를 세어요." },
  8: { goal: "먼저 10을 만들어요.", guided: "오른쪽 점을 왼쪽 빈칸으로 끌어요.", try: "10이 되면 남은 점을 세어요." },
  9: { goal: "2씩, 5씩, 10씩 뛰어 세어요.", guided: "수직선에서 칸을 뛰어 점프해요.", try: "다음 숫자를 찾아요." },
  10: { goal: "수직선에서 점프해요.", guided: "보라색 표시를 수직선 위에 놓아요.", try: "정답 자리에 놓아요." },
  11: { goal: "10개씩 묶어요.", guided: "일 모형 10개를 10개 묶기 자리에 끌어요.", try: "십과 일을 읽어요." },
  12: { goal: "100개씩 묶어요.", guided: "십 모형 10개를 100개 묶기 자리에 끌어요.", try: "세 자리 수를 만들어요." },
  13: { goal: "같은 수씩 묶어요.", guided: "묶음 카드를 빈 자리로 끌어요.", try: "모든 자리를 채워요." },
  14: { goal: "똑같이 나누어요.", guided: "접시마다 같은 개수로 담아요.", try: "한 접시 개수를 세어요." },
  15: { goal: "분수 조각을 옮겨요.", guided: "조각을 막대로 끌어요.", try: "분수끼리 더해요." },
  16: { goal: "소수를 계산해요.", guided: "소수점을 눌러 수를 입력해요.", try: "소수 덧셈을 해요." },
  17: { goal: "길이와 무게를 재요.", guided: "눈금을 손가락으로 끌어요.", try: "값을 읽고 말해요." },
  18: { goal: "시계를 읽어요.", guided: "시계 바늘을 움직여 시간을 맞혀요.", try: "몇 시인지 말해요." },
  19: { goal: "동전을 세어요.", guided: "동전을 눌러 금액을 만들어요.", try: "목표 금액을 맞혀요." },
  20: { goal: "도형을 옮기고 돌려요.", guided: "도형을 보드로 끌어요.", try: "규칙을 찾아요." },
  21: { goal: "그래프를 만들어요.", guided: "과일을 그래프 위로 끌어요.", try: "가장 많은 과일을 찾아요." }
};
