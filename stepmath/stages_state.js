"use strict";

/* ============================================================
   2. 18단계 세분화 교육과정 + 상태
   ============================================================ */
const STAGES = [
  { id: 1, domain: "num", title: "1. 짝짓기와 분류", short: "같은 것 찾기", subtitle: "색과 모양으로 모으기", hint: "색과 모양을 살펴보고 같은 것끼리 바구니에 담아 보세요.", preset: null, tool: "sort" },
  { id: 2, domain: "num", title: "2. 1~5 하나씩 세기", short: "5까지 세기", subtitle: "일대일 대응 기초 (1~5)", hint: "10칸 판의 왼쪽부터 1개씩 눌러 5까지 세어 보세요.", preset: { first: "5", op: null, second: "" }, tool: "count" },
  { id: 3, domain: "num", title: "3. 6~10 하나씩 세기", short: "10까지 세기", subtitle: "10칸 판 채우기 (6~10)", hint: "6부터 10까지 칸을 채우며 10개 묶음 감각을 익혀 보세요.", preset: { first: "8", op: null, second: "" }, tool: "count" },
  { id: 4, domain: "num", title: "4. 수의 순서와 크기 비교", short: "크기 비교", subtitle: "어느 쪽이 많을까 (>, <, =)", hint: "두 수를 나란히 놓고 하나씩 짝을 지어 비교해 보세요.", preset: { first: "6", op: "+", second: "4" }, tool: "compare" },
  { id: 5, domain: "num", title: "5. 수 모으기 (한 자리 덧셈)", short: "수 모으기", subtitle: "두 묶음을 하나로 합치기", hint: "두 묶음의 물건을 하나로 모아 모두 몇 개인지 세어 보세요.", preset: { first: "3", op: "+", second: "5" }, tool: "compose" },
  { id: 6, domain: "num", title: "6. 수 가르기 (한 자리 뺄셈)", short: "수 가르기", subtitle: "한 묶음에서 덜어내기", hint: "전체에서 일부를 덜어내면 몇 개가 남는지 확인해 보세요.", preset: { first: "8", op: "-", second: "3" }, tool: "compose" },
  { id: 7, domain: "num", title: "7. 10 만들어 더하기", short: "10 만들기", subtitle: "받아올림의 기초", hint: "10칸 판의 빈칸을 먼저 채워 10을 만들고 남은 수를 더해요.", preset: { first: "7", op: "+", second: "5" }, tool: "maketen" },
  { id: 8, domain: "num", title: "8. 수직선 뛰어 세기", short: "점프 계산", subtitle: "이어 세기 · 거꾸로 세기", hint: "수직선에서 앞으로 또는 뒤로 점프하며 계산해 보세요.", preset: { first: "8", op: "+", second: "7" }, tool: "strategy" },
  { id: 9, domain: "num", title: "9. 십과 일 자릿값", short: "십·일 묶기", subtitle: "두 자리 수 받아올림·받아내림", hint: "일모형 10개가 모이면 십모형 1개로 묶어요.", preset: { first: "24", op: "+", second: "18" }, tool: "place" },
  { id: 10, domain: "num", title: "10. 백·십·일 세 자리 수", short: "백 모형 계산", subtitle: "100 묶기 · 세 자리 수 연산", hint: "십모형 10개는 백모형 1개가 돼요. 자릿값을 맞춰 계산해요.", preset: { first: "125", op: "+", second: "143" }, tool: "place" },
  { id: 11, domain: "num", title: "11. 같은 수씩 묶어 곱셈", short: "묶음 곱셈", subtitle: "몇씩 몇 묶음 (×)", hint: "같은 수씩 여러 묶음을 만들어 전체 개수를 구해 보세요.", preset: { first: "3", op: "×", second: "4" }, tool: "multiply" },
  { id: 12, domain: "num", title: "12. 똑같이 나누는 나눗셈", short: "똑같이 나누기", subtitle: "접시에 공평하게 나누기 (÷)", hint: "전체를 여러 접시에 똑같은 개수씩 나누어 담아 보세요.", preset: { first: "12", op: "÷", second: "3" }, tool: "multiply" },
  { id: 13, domain: "num", title: "13. 분수의 기초", short: "분수 조각", subtitle: "전체와 부분 (1/2, 1/4 등)", hint: "전체를 똑같이 나눈 조각을 분수로 나타내고 더해 보세요.", preset: { first: "1/2", op: "+", second: "1/4" }, tool: "fraction" },
  { id: 14, domain: "num", title: "14. 소수의 이해와 계산", short: "소수 계산", subtitle: "0.1 단위 · 소수 덧셈/뺄셈", hint: "분수 1/10은 소수 0.1과 같아요. 소수점을 맞춰 계산해요.", preset: { first: "0.4", op: "+", second: "0.3" }, tool: "fraction" },
  { id: 15, domain: "shape", title: "15. 길이 · 무게 · 들이 재기", short: "눈금 측정", subtitle: "cm · mL · g 단위 읽기", hint: "눈금을 움직이며 길이, 물의 양, 무게를 재어 보세요.", preset: { first: "12", op: null, second: "" }, tool: "measure", measureTab: "length" },
  { id: 16, domain: "shape", title: "16. 시계 읽기와 돈 계산", short: "시계 · 동전", subtitle: "시·분 읽기 · 동전 모으기", hint: "시계 바늘을 움직여 시간을 읽고, 동전을 더해 금액을 맞춰 보세요.", preset: { first: "100", op: "+", second: "50" }, tool: "measure", measureTab: "clock" },
  { id: 17, domain: "shape", title: "17. 도형과 반복 규칙", short: "도형 · 무늬", subtitle: "변·꼭짓점 · 반복 무늬", hint: "도형의 변과 꼭짓점을 세어 보고, 반복되는 무늬 규칙을 찾아요.", preset: { first: "4", op: "+", second: "4" }, tool: "shape" },
  { id: 18, domain: "data", title: "18. 자료와 그래프 문제해결", short: "과일 그래프", subtitle: "그림 그래프 · 생활 문장제", hint: "과일을 그래프에 놓고 가장 많은 것과 차이를 구해 보세요.", preset: { first: "5", op: "-", second: "3" }, tool: "data" }
];

const DOMAIN_META = {
  num: { label: "숫자 놀이", className: "num" },
  shape: { label: "도형·생활 놀이", className: "shape" },
  data: { label: "그래프 놀이", className: "data" }
};

const COURSES = {
  number: { title: "숫자·연산 놀이 (1~14단계)", stageIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
  daily: { title: "측정·도형 놀이 (15~17단계)", stageIds: [15, 16, 17] },
  data: { title: "그래프 놀이 (18단계)", stageIds: [18] }
};

const MICRO_LESSONS = {
  1: { goal: "같은 모양이나 종류끼리 모으면 수를 세기 쉬워져요.", guided: "과일을 알맞은 바구니로 보내 보세요.", try: "남은 과일도 분류한 뒤 바구니마다 몇 개인지 세어 보세요." },
  2: { goal: "1부터 5까지 물건 하나에 숫자 하나를 연결해 세어요.", guided: "10칸 판의 점을 왼쪽부터 5칸까지 하나씩 눌러 보세요.", try: "다섯 칸을 채워 보고 숫자로 나타내 보세요." },
  3: { goal: "6부터 10까지 10칸 판을 채우며 수 감각을 키워요.", guided: "빈칸을 눌러 8칸, 10칸까지 채워 보세요.", try: "10칸이 가득 차면 10개 묶음을 눌러 확인해 보세요." },
  4: { goal: "두 수를 비교해 더 많은 쪽과 같은 양을 찾아요.", guided: "두 묶음의 물건을 하나씩 짝지어 보세요.", try: "큰 수를 가리키고 수직선 위치를 확인하세요." },
  5: { goal: "두 묶음을 하나로 합치며 덧셈을 이해해요.", guided: "첫 번째 묶음과 두 번째 묶음을 모아 모두 몇 개인지 세어요.", try: "다른 수를 넣어 모으기 식을 만들어 보세요." },
  6: { goal: "전체 묶음에서 일부를 덜어내며 뺄셈을 이해해요.", guided: "전체 개수에서 빼는 수만큼 덜어내 보세요.", try: "남은 개수가 몇 개인지 세어 식을 확인하세요." },
  7: { goal: "10칸을 먼저 채우면 받아올림 덧셈이 쉬워져요.", guided: "7칸이 채워진 판에 몇 개를 옮기면 10이 되는지 확인하세요.", try: "10을 만들고 남은 수가 몇 개인지 더해 보세요." },
  8: { goal: "수직선에서 앞뒤로 점프하며 덧셈과 뺄셈을 풀어요.", guided: "시작 수에서 더할 때는 앞으로, 뺄 때는 뒤로 점프해요.", try: "수직선 표시를 끌어서 정답 자리에 놓아 보세요." },
  9: { goal: "일모형 10개는 십모형 1개로 묶을 수 있어요.", guided: "일모형 10개를 10개 묶음으로 바꾸어 보세요.", try: "24 + 18처럼 받아올림이 있는 계산을 해 보세요." },
  10: { goal: "십모형 10개는 백모형 1개가 되어 세 자리 수를 만들어요.", guided: "백·십·일 자리를 맞추어 세 자리 수를 표현해 보세요.", try: "100 모형을 이용해 큰 수의 덧셈을 확인하세요." },
  11: { goal: "같은 수씩 여러 묶음으로 놓아 곱셈을 익혀요.", guided: "3개씩 4묶음처럼 같은 개수로 묶어 보세요.", try: "전체가 모두 몇 개인지 세어 곱셈식을 확인하세요." },
  12: { goal: "전체를 여러 곳에 공평하게 나누는 나눗셈을 경험해요.", guided: "12개를 3개의 접시에 하나씩 나누어 담아 보세요.", try: "접시 한 개에 몇 개씩 들어갔는지 확인하세요." },
  13: { goal: "전체를 똑같이 나눈 조각을 분수로 나타내요.", guided: "분수 막대와 원 그림으로 1/2, 1/4 크기를 비교해요.", try: "분모가 같은 분수나 간단한 분수를 더해 보세요." },
  14: { goal: "전체를 10조각으로 나눈 0.1 단위로 소수를 이해해요.", guided: "계산기에서 소수점(.)을 눌러 0.4 + 0.3을 계산해요.", try: "0.5가 1/2과 같은 크기인지 확인해 보세요." },
  15: { goal: "길이(cm), 들이(mL), 무게(g)를 눈금으로 재어요.", guided: "측정 탭에서 길이·들이·무게를 골라 눈금을 움직여 보세요.", try: "눈금이 가리키는 숫자와 단위를 함께 읽어 보세요." },
  16: { goal: "시계의 시·분을 읽고 동전을 더해 금액을 계산해요.", guided: "시계 탭이나 돈 탭을 눌러 바늘과 동전을 움직여 보세요.", try: "동전 몇 개를 합쳐 목표 금액을 만들어 보세요." },
  17: { goal: "도형의 변과 꼭짓점을 세고 반복 무늬 규칙을 찾아요.", guided: "도형을 눌러 변의 수를 세고 무늬의 다음 모양을 골라 보세요.", try: "반복되는 마디가 무엇인지 찾아보세요." },
  18: { goal: "자료를 그래프로 나타내고 가장 많은 항목을 찾아요.", guided: "과일을 그래프 위로 끌어 막대를 만들어 보세요.", try: "가장 많은 과일과 가장 적은 과일의 차이를 구해 보세요." }
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
  stage: 5,
  lessonStep: 0,
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
  4: { goal: "어느 쪽이 더 많은지 봐요.", guided: "점을 양쪽 접시에 나누어 놓아요.", try: "더 많은 쪽을 가리켜요." },
  5: { goal: "두 수를 모아요.", guided: "두 묶음을 하나로 합쳐요.", try: "모두 몇 개인지 세어요." },
  6: { goal: "수를 갈라요.", guided: "전체에서 몇 개를 덜어내요.", try: "남은 개수를 세어요." },
  7: { goal: "먼저 10을 만들어요.", guided: "오른쪽 점을 왼쪽 빈칸으로 끌어요.", try: "10이 되면 남은 점을 세어요." },
  8: { goal: "수직선에서 점프해요.", guided: "보라색 표시를 수직선 위에 놓아요.", try: "정답 자리에 놓아요." },
  9: { goal: "10개씩 묶어요.", guided: "일 모형 10개를 10개 묶기 자리에 끌어요.", try: "십과 일을 읽어요." },
  10: { goal: "100개씩 묶어요.", guided: "십 모형 10개를 100개 묶기 자리에 끌어요.", try: "세 자리 수를 만들어요." },
  11: { goal: "같은 수씩 묶어요.", guided: "묶음 카드를 빈 자리로 끌어요.", try: "모든 자리를 채워요." },
  12: { goal: "똑같이 나누어요.", guided: "접시마다 같은 개수로 담아요.", try: "한 접시 개수를 세어요." },
  13: { goal: "분수 조각을 옮겨요.", guided: "조각을 막대로 끌어요.", try: "분수끼리 더해요." },
  14: { goal: "소수를 계산해요.", guided: "소수점을 눌러 수를 입력해요.", try: "소수 덧셈을 해요." },
  15: { goal: "길이와 무게를 재요.", guided: "눈금을 손가락으로 끌어요.", try: "값을 읽고 말해요." },
  16: { goal: "시계와 돈을 계산해요.", guided: "시계 바늘이나 동전을 눌러요.", try: "시간과 금액을 맞춰요." },
  17: { goal: "도형을 옮기고 돌려요.", guided: "도형을 보드로 끌어요.", try: "규칙을 찾아요." },
  18: { goal: "그래프를 만들어요.", guided: "과일을 그래프 위로 끌어요.", try: "가장 많은 과일을 찾아요." }
};
