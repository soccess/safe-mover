"use strict";

/* ============================================================
   3. 18단계 명시적 교수 교육과정 (예시 + 단계별 5문제 = 총 90문제)
   ============================================================ */
const STAGE_CURRICULUM = {
  1: {
    example: {
      title: "예시: 같은 과일끼리 바구니에 모으기",
      problem: "🍎 사과, 🍋 레몬, 🍇 포도가 섞여 있어요. 같은 모양과 색깔끼리 바구니에 담아 보세요.",
      visual: "<span>🍎 🍋 🍎</span> <span>➡️</span> <span>🧺 사과(🍎🍎) · 🧺 레몬(🍋)</span>",
      steps: [
        "과일의 색깔과 모양을 먼저 살펴봐요.",
        "빨간 사과(🍎)는 사과 바구니로, 노란 레몬(🍋)은 레몬 바구니로 보내요.",
        "정답: 같은 것끼리 모으면 사과 2개, 레몬 1개처럼 쉽게 셀 수 있어요!"
      ],
      speakText: "예시를 볼까요? 빨간 사과는 사과 바구니에, 노란 레몬은 레몬 바구니에 담으면 쉽게 셀 수 있어요."
    },
    problems: [
      { prompt: "아래 바구니에 사과(🍎) 2개와 레몬(🍋) 1개를 모두 담아 보세요! 다 담으면 확인 버튼을 눌러요.", easyPrompt: "사과 2개와 레몬 1개를 바구니에 넣어요.", hint: "사과를 눌러 사과 바구니에 2개, 레몬을 눌러 레몬 바구니에 1개 넣어 보세요.", type: "check", setup: (s) => { s.sort = { items: ["apple", "lemon", "apple"], counts: { apple: 0, lemon: 0, grape: 0 }, done: false }; }, check: (s) => s.sort.counts.apple === 2 && s.sort.counts.lemon === 1, okMsg: "잘했어요! 사과 2개, 레몬 1개를 똑같이 모았어요!" },
      { prompt: "🍎, 🍇, 🍎, 🍋, 🍇 중에서 🍇 포도는 모두 몇 개일까요?", easyPrompt: "포도(🍇)가 몇 개인지 세어요.", hint: "보라색 포도(🍇)만 손가락으로 짚어 세어 보세요.", type: "choice", choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "2", okMsg: "정답이에요! 포도(🍇)는 2개예요!" },
      { prompt: "사과(🍎) 1개, 레몬(🍋) 2개, 포도(🍇) 2개를 바구니에 모두 분류해 보세요!", easyPrompt: "과일 5개를 바구니에 나누어 담아요.", hint: "과일을 하나씩 눌러 알맞은 바구니에 담아 보세요.", type: "check", setup: (s) => { s.sort = { items: ["lemon", "grape", "apple", "lemon", "grape"], counts: { apple: 0, lemon: 0, grape: 0 }, done: false }; }, check: (s) => s.sort.counts.apple === 1 && s.sort.counts.lemon === 2 && s.sort.counts.grape === 2, okMsg: "훌륭해요! 세 가지 과일을 모두 정확히 모았어요!" },
      { prompt: "다음 중 '노란색' 과일끼리만 올바르게 모은 것은 무엇일까요?", easyPrompt: "노란색 과일끼리 모은 것을 고르세요.", hint: "노란 레몬(🍋)과 노란 바나나(🍌)가 함께 있는 것을 찾아요.", type: "choice", choices: [{ label: "🍋 🍌", value: "yellow" }, { label: "🍎 🍇", value: "red" }, { label: "🍏 🍋", value: "mix" }], answer: "yellow", okMsg: "맞아요! 레몬과 바나나는 노란색으로 묶을 수 있어요!" },
      { prompt: "🍎 🍎 🍎 🍋 🍇 중에서 가장 많이 있는 과일은 무엇일까요?", easyPrompt: "제일 많은 과일을 고르세요.", hint: "사과는 3개, 레몬은 1개, 포도는 1개예요.", type: "choice", choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍋 레몬", value: "lemon" }, { label: "🍇 포도", value: "grape" }], answer: "apple", okMsg: "정답! 사과가 3개로 가장 많아요!" }
    ]
  },

  2: {
    example: {
      title: "예시: 1부터 5까지 하나씩 세기",
      problem: "점 1개에 숫자 1개를 짝지어 5까지 세어 보세요.",
      visual: "<span>● ● ● ●</span> <span>➡️</span> <span>1, 2, 3, 4 (모두 4개)</span>",
      steps: [
        "10칸 판의 왼쪽 첫 번째 칸부터 눌러요.",
        "하나, 둘, 셋, 넷, 다섯! 소리 내어 세어요.",
        "정답: 마지막으로 센 숫자가 전체 개수(5)예요!"
      ],
      speakText: "예시를 볼까요? 왼쪽부터 하나씩 짚으며 하나, 둘, 셋, 넷, 다섯 하고 세어요."
    },
    problems: [
      { prompt: "아래 10칸 판에 점을 정확히 3개 채워 보세요!", easyPrompt: "칸 3개를 채워요.", hint: "칸을 3번 눌러 점 3개를 만든 뒤 확인 버튼을 눌러요.", type: "check", setup: (s) => { s.expr = { first: "0", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 3, okMsg: "좋아요! 하나, 둘, 셋, 모두 3개예요!" },
      { prompt: "🍎 🍎 🍎 🍎 — 사과는 모두 몇 개일까요?", easyPrompt: "사과가 몇 개인가요?", hint: "왼쪽부터 하나씩 짚어 세어 보세요.", type: "choice", choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "정답이에요! 사과가 4개예요!" },
      { prompt: "10칸 판에 점을 5개 채워 첫 번째 줄을 가득 채워 보세요!", easyPrompt: "첫 줄 5칸을 모두 채워요.", hint: "5칸을 모두 채우고 확인 버튼을 눌러요.", type: "check", setup: (s) => { s.expr = { first: "1", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 5, okMsg: "멋져요! 윗줄 5칸을 꽉 채웠어요!" },
      { prompt: "⭐ ⭐ — 별 다음으로 3개가 되려면 별을 몇 개 더 그려야 할까요?", easyPrompt: "3개가 되려면 몇 개 더 필요할까요?", hint: "2에서 하나만 더 있으면 3이 돼요.", type: "choice", choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "1", okMsg: "정답! 2개에 1개를 더하면 3개예요!" },
      { prompt: "1, 2, ( ? ), 4, 5 — 빈칸에 들어갈 숫자는 무엇일까요?", easyPrompt: "2 다음 숫자는 무엇인가요?", hint: "하나, 둘, 다음은 셋(3)이에요!", type: "choice", choices: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "6", value: "6" }], answer: "3", okMsg: "딩동댕! 2 다음은 3이에요!" }
    ]
  },

  3: {
    example: {
      title: "예시: 6부터 10까지 10칸 판으로 세기",
      problem: "윗줄 5칸이 다 차면 아랫줄로 내려가서 6, 7, 8, 9, 10을 세어요.",
      visual: "<span>5개 + 2개</span> <span>➡️</span> <span>모두 7개!</span>",
      steps: [
        "윗줄 5칸이 가득 찬 것을 먼저 확인해요.",
        "아랫줄에 1칸, 2칸 더 채우면 6, 7이 돼요.",
        "정답: 10칸이 모두 차면 10개 한 묶음이에요!"
      ],
      speakText: "윗줄 5칸에 아랫줄 2칸을 더하면 6, 7, 모두 7개가 됩니다."
    },
    problems: [
      { prompt: "10칸 판에 점을 7개 채워 보세요!", easyPrompt: "점 7개를 만들어요.", hint: "윗줄 5개와 아랫줄 2개를 채워 보세요.", type: "check", setup: (s) => { s.expr = { first: "5", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 7, okMsg: "정확해요! 5개와 2개로 7개예요!" },
      { prompt: "윗줄 5칸이 다 차고 아랫줄에 4칸이 채워져 있어요. 모두 몇 개일까요?", easyPrompt: "5개와 4개는 모두 몇 개일까요?", hint: "5 다음부터 6, 7, 8, 9로 이어 세어 보세요.", type: "choice", choices: [{ label: "8개", value: "8" }, { label: "9개", value: "9" }, { label: "10개", value: "10" }], answer: "9", okMsg: "정답이에요! 5와 4가 만나 9개예요!" },
      { prompt: "10칸 판을 10개로 가득 채워 보세요!", easyPrompt: "10칸을 모두 채워요.", hint: "빈칸이 하나도 없게 10까지 채워 보세요.", type: "check", setup: (s) => { s.expr = { first: "6", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 10, okMsg: "완벽해요! 10칸이 가득 찼어요!" },
      { prompt: "🍎🍎🍎🍎🍎 🍎🍎🍎 — 사과는 모두 몇 개일까요?", easyPrompt: "사과 개수를 세어요.", hint: "5개 묶음과 3개가 있어요.", type: "choice", choices: [{ label: "7개", value: "7" }, { label: "8개", value: "8" }, { label: "9개", value: "9" }], answer: "8", okMsg: "맞아요! 5와 3으로 모두 8개예요!" },
      { prompt: "9에서 1이 더 커지면 얼마가 될까요?", easyPrompt: "9 다음 숫자는 무엇인가요?", hint: "아홉 다음은 열(10)이에요!", type: "choice", choices: [{ label: "8", value: "8" }, { label: "10", value: "10" }, { label: "11", value: "11" }], answer: "10", okMsg: "정답! 9 다음은 10이에요!" }
    ]
  },

  4: {
    example: {
      title: "예시: 두 수의 크기 비교하기",
      problem: "왼쪽 접시에 6개, 오른쪽 접시에 4개가 있어요. 어느 쪽이 더 많을까요?",
      visual: "<span>6개</span> <span>&gt;</span> <span>4개</span>",
      steps: [
        "왼쪽 6개와 오른쪽 4개를 하나씩 짝지어요.",
        "왼쪽에 2개가 남아요. 그러므로 6이 4보다 더 커요!",
        "정답: 큰 쪽으로 입이 벌어져요 → 6 > 4"
      ],
      speakText: "6과 4를 짝지어 보면 왼쪽 6개가 2개 더 남아요. 그래서 6이 4보다 큽니다."
    },
    problems: [
      { prompt: "7과 5 중에서 더 큰 수는 무엇일까요?", easyPrompt: "7과 5 중 큰 수를 고르세요.", hint: "7이 5보다 2만큼 더 오른쪽에 있어요.", type: "choice", setup: (s) => { s.compare = { a: 7, b: 5 }; }, choices: [{ label: "7이 더 커요 (7 > 5)", value: "7" }, { label: "5가 더 커요 (5 > 7)", value: "5" }, { label: "같아요 (7 = 5)", value: "eq" }], answer: "7", okMsg: "정답! 7이 5보다 커요!" },
      { prompt: "아래 비교 도구에서 왼쪽 수를 8, 오른쪽 수를 3으로 만들어 보세요!", easyPrompt: "왼쪽 8개, 오른쪽 3개로 맞춰요.", hint: "왼쪽과 오른쪽 조절 버튼으로 8과 3을 맞춘 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.compare = { a: 4, b: 4 }; }, check: (s) => s.compare.a === 8 && s.compare.b === 3, okMsg: "잘했어요! 8은 3보다 5개 더 많아요!" },
      { prompt: "4와 9 사이에 들어갈 알맞은 기호는 무엇일까요? ( 4 □ 9 )", easyPrompt: "4와 9 중 큰 쪽으로 입이 벌어져요.", hint: "9가 더 크니까 오른쪽으로 입이 벌어져야 해요 (<).", type: "choice", setup: (s) => { s.compare = { a: 4, b: 9 }; }, choices: [{ label: ">", value: ">" }, { label: "<", value: "<" }, { label: "=", value: "=" }], answer: "<", okMsg: "정답이에요! 4 < 9 입니다!" },
      { prompt: "6과 6의 크기를 비교하면 어떤 기호가 맞을까요?", easyPrompt: "두 수가 같을 때는 어떤 기호를 쓰나요?", hint: "양쪽 개수가 똑같으면 같다는 뜻의 '='를 써요.", type: "choice", setup: (s) => { s.compare = { a: 6, b: 6 }; }, choices: [{ label: ">", value: ">" }, { label: "<", value: "<" }, { label: "=", value: "=" }], answer: "=", okMsg: "맞아요! 6 = 6 똑같아요!" },
      { prompt: "10, 4, 7 중에서 가장 작은 수는 무엇일까요?", easyPrompt: "가장 작은 수를 고르세요.", hint: "수직선에서 가장 왼쪽에 있는 수를 찾아요.", type: "choice", choices: [{ label: "10", value: "10" }, { label: "4", value: "4" }, { label: "7", value: "7" }], answer: "4", okMsg: "정답! 4가 가장 작은 수예요!" }
    ]
  },

  5: {
    example: {
      title: "예시: 두 묶음 모으기 (3 + 5)",
      problem: "사과 3개와 초록 사과 5개를 한 바구니에 모으면 모두 몇 개일까요?",
      visual: "<span>🍎🍎🍎 + 🍏🍏🍏🍏🍏</span> <span>=</span> <span>8개</span>",
      steps: [
        "첫 번째 묶음 3개를 먼저 놓아요.",
        "두 번째 묶음 5개를 함께 모아요.",
        "정답: 3 + 5 = 8! 모두 8개예요."
      ],
      speakText: "사과 3개와 초록 사과 5개를 모으면 모두 8개가 됩니다."
    },
    problems: [
      { prompt: "3 + 5 는 얼마일까요?", easyPrompt: "3과 5를 모으면 몇 개인가요?", hint: "3에서 시작해 5만큼 이어 세어 보세요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "+", second: "5" }; }, choices: [{ label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" }], answer: "8", okMsg: "정답이에요! 3 + 5 = 8!" },
      { prompt: "4 + 2 는 얼마일까요?", easyPrompt: "4와 2를 더하면 얼마인가요?", hint: "4 다음에 5, 6!", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "+", second: "2" }; }, choices: [{ label: "5", value: "5" }, { label: "6", value: "6" }, { label: "7", value: "7" }], answer: "6", okMsg: "맞아요! 4 + 2 = 6이에요!" },
      { prompt: "구슬 5개와 4개를 모으면 모두 몇 개일까요?", easyPrompt: "5 + 4 는 얼마일까요?", hint: "5에서 6, 7, 8, 9 하고 세어요.", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "+", second: "4" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "훌륭해요! 5 + 4 = 9!" },
      { prompt: "2 + 6 을 계산해 보세요.", easyPrompt: "2와 6을 모으면?", hint: "큰 수 6에서 2를 이어 세면 7, 8이에요!", type: "choice", setup: (s) => { s.expr = { first: "2", operator: "+", second: "6" }; }, choices: [{ label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" }], answer: "8", okMsg: "정답! 2 + 6 = 8이에요!" },
      { prompt: "1 + 8 은 얼마일까요?", easyPrompt: "1과 8을 더하면?", hint: "8보다 1 큰 수예요.", type: "choice", setup: (s) => { s.expr = { first: "1", operator: "+", second: "8" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "완벽해요! 1 + 8 = 9!" }
    ]
  },

  6: {
    example: {
      title: "예시: 전체에서 가르기 (8 - 3)",
      problem: "사과 8개 중에서 3개를 먹으면 몇 개가 남을까요?",
      visual: "<span>🍎🍎🍎🍎🍎🍎🍎🍎</span> <span>➖ 3개</span> <span>= 5개</span>",
      steps: [
        "처음에 사과 8개가 있어요.",
        "3개를 덜어내어 지워 봐요.",
        "정답: 남은 사과는 5개예요. 8 - 3 = 5!"
      ],
      speakText: "8개에서 3개를 덜어내면 5개가 남습니다. 8 빼기 3은 5입니다."
    },
    problems: [
      { prompt: "8 - 3 은 얼마일까요?", easyPrompt: "8에서 3을 빼면 몇 개 남나요?", hint: "8에서 거꾸로 7, 6, 5!", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "-", second: "3" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "정답! 8 - 3 = 5예요!" },
      { prompt: "7 - 2 는 얼마일까요?", easyPrompt: "7에서 2를 덜어내면?", hint: "7에서 2번 뒤로 가면 6, 5예요.", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "-", second: "2" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "맞아요! 7 - 2 = 5!" },
      { prompt: "9 - 4 는 얼마일까요?", easyPrompt: "9개 중 4개를 쓰면 몇 개가 남나요?", hint: "9를 4와 5로 가를 수 있어요.", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "-", second: "4" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "정확해요! 9 - 4 = 5!" },
      { prompt: "6 - 6 은 얼마일까요?", easyPrompt: "6개에서 6개를 모두 빼면?", hint: "가진 것을 다 쓰면 하나도 안 남아요(0).", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "-", second: "6" }; }, choices: [{ label: "0", value: "0" }, { label: "1", value: "1" }, { label: "6", value: "6" }], answer: "0", okMsg: "정답이에요! 모두 빼면 0이에요!" },
      { prompt: "10 - 3 은 얼마일까요?", easyPrompt: "10에서 3을 빼면?", hint: "10을 3과 7로 가를 수 있어요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "-", second: "3" }; }, choices: [{ label: "6", value: "6" }, { label: "7", value: "7" }, { label: "8", value: "8" }], answer: "7", okMsg: "딩동댕! 10 - 3 = 7!" }
    ]
  },

  7: {
    example: {
      title: "예시: 10 만들어 더하기 (7 + 5)",
      problem: "7에 5를 더할 때, 먼저 10을 만들어 계산해 보세요.",
      visual: "<span>7 + 3 = 10</span> <span>➡️</span> <span>10 + 2 = 12</span>",
      steps: [
        "7이 10이 되려면 3이 필요해요.",
        "5를 3과 2로 갈라서 7에 3을 먼저 주면 10이 돼요!",
        "정답: 10과 남은 2를 더하면 12예요!"
      ],
      speakText: "7에 3을 먼저 더해 10을 만들고, 남은 2를 더하면 12가 됩니다."
    },
    problems: [
      { prompt: "7 + 5 를 10을 만들어 계산하면 얼마일까요?", easyPrompt: "7 + 5 는 얼마인가요?", hint: "7 + 3 = 10, 그리고 남은 2를 더해요.", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "+", second: "5" }; }, choices: [{ label: "11", value: "11" }, { label: "12", value: "12" }, { label: "13", value: "13" }], answer: "12", okMsg: "정답! 10 + 2 = 12예요!" },
      { prompt: "8 + 4 에서 8이 10이 되려면 몇 개를 빌려와야 할까요?", easyPrompt: "8이 10이 되려면 몇 개가 필요할까요?", hint: "8 + ? = 10 이에요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "+", second: "4" }; }, choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "2", okMsg: "맞아요! 2개를 빌려오면 10이 돼요!" },
      { prompt: "9 + 6 은 얼마일까요?", easyPrompt: "9 + 6 을 계산해요.", hint: "9에 1을 주면 10이 되고 5가 남아요.", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "+", second: "6" }; }, choices: [{ label: "14", value: "14" }, { label: "15", value: "15" }, { label: "16", value: "16" }], answer: "15", okMsg: "정확해요! 10 + 5 = 15!" },
      { prompt: "6 + 7 은 얼마일까요?", easyPrompt: "6 + 7 을 계산해요.", hint: "6에 4를 더해 10을 만들고 남은 3을 더해요.", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "+", second: "7" }; }, choices: [{ label: "12", value: "12" }, { label: "13", value: "13" }, { label: "14", value: "14" }], answer: "13", okMsg: "훌륭해요! 6 + 7 = 13!" },
      { prompt: "8 + 6 은 얼마일까요?", easyPrompt: "8 + 6 은 얼마인가요?", hint: "8 + 2 = 10, 남은 4를 더하면 14!", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "+", second: "6" }; }, choices: [{ label: "13", value: "13" }, { label: "14", value: "14" }, { label: "15", value: "15" }], answer: "14", okMsg: "완벽해요! 8 + 6 = 14!" }
    ]
  },

  8: {
    example: {
      title: "예시: 수직선에서 뛰어 세기 (8 + 7)",
      problem: "8에서 시작해서 오른쪽으로 7칸 점프하면 어디에 도착할까요?",
      visual: "<span>8 → (+2) → 10 → (+5) → 15</span>",
      steps: [
        "수직선에서 시작 숫자 8을 찾아요.",
        "오른쪽으로 7칸 점프해요 (뺄셈은 왼쪽으로 점프!).",
        "정답: 도착한 자리는 15예요!"
      ],
      speakText: "8에서 오른쪽으로 7칸 점프하면 15에 도착합니다."
    },
    problems: [
      { prompt: "수직선의 보라색 표시를 끌어서 8 + 5 의 정답 위치(13)에 놓아 보세요!", easyPrompt: "8에서 5칸 오른쪽(13)에 표시를 놓아요.", hint: "수직선 위 13 눈금으로 보라색 표시를 옮긴 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.expr = { first: "8", operator: "+", second: "5" }; s.nlMarker = 8; s.nlBase = 8; }, check: (s) => s.nlMarker === 13, okMsg: "정확해요! 8에서 5칸 뛰면 13이에요!" },
      { prompt: "14에서 뒤로(왼쪽으로) 5칸 점프하면 어디에 도착할까요?", easyPrompt: "14 - 5 는 얼마일까요?", hint: "14에서 13, 12, 11, 10, 9!", type: "choice", setup: (s) => { s.expr = { first: "14", operator: "-", second: "5" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "정답! 14 - 5 = 9예요!" },
      { prompt: "9 + 8 은 얼마일까요?", easyPrompt: "9에서 8칸 오른쪽으로 가요.", hint: "9에서 1칸 가면 10, 7칸 더 가면 17!", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "+", second: "8" }; }, choices: [{ label: "16", value: "16" }, { label: "17", value: "17" }, { label: "18", value: "18" }], answer: "17", okMsg: "맞아요! 9 + 8 = 17!" },
      { prompt: "16 - 7 은 얼마일까요?", easyPrompt: "16에서 7칸 왼쪽으로 점프해요.", hint: "16에서 6칸 뒤로 가면 10, 1칸 더 뒤로 가면 9!", type: "choice", setup: (s) => { s.expr = { first: "16", operator: "-", second: "7" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "정확해요! 16 - 7 = 9!" },
      { prompt: "7 + 9 는 얼마일까요?", easyPrompt: "7 + 9 를 계산해요.", hint: "9에서 7칸 이어 세어도 같아요!", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "+", second: "9" }; }, choices: [{ label: "15", value: "15" }, { label: "16", value: "16" }, { label: "17", value: "17" }], answer: "16", okMsg: "완벽해요! 7 + 9 = 16!" }
    ]
  },

  9: {
    example: {
      title: "예시: 십과 일 자릿값 (24 + 18)",
      problem: "일의 자리 4와 8을 더하면 12가 되어 십의 자리로 10을 올려요.",
      visual: "<span>24 + 18</span> <span>➡️</span> <span>일: 4+8=12 (10 올림!) → 42</span>",
      steps: [
        "일의 자리 4 + 8 = 12 → 10은 십모형 1개로 올려주고 2만 남아요.",
        "십의 자리 2 + 1 + (올린 1) = 4가 돼요.",
        "정답: 42예요!"
      ],
      speakText: "24 더하기 18은 일의 자리 4와 8이 12가 되어 10을 올리고, 모두 42가 됩니다."
    },
    problems: [
      { prompt: "24 + 18 을 계산하면 얼마일까요?", easyPrompt: "24 + 18 은 얼마인가요?", hint: "일의 자리 4+8=12에서 10을 올려 보세요.", type: "choice", setup: (s) => { s.expr = { first: "24", operator: "+", second: "18" }; }, choices: [{ label: "32", value: "32" }, { label: "42", value: "42" }, { label: "44", value: "44" }], answer: "42", okMsg: "정답이에요! 24 + 18 = 42!" },
      { prompt: "십모형 3개와 일모형 7개가 나타내는 수는 무엇일까요?", easyPrompt: "10이 3개, 1이 7개면 얼마일까요?", hint: "30과 7을 합쳐 읽어 보세요.", type: "choice", choices: [{ label: "37", value: "37" }, { label: "73", value: "73" }, { label: "307", value: "307" }], answer: "37", okMsg: "맞아요! 십이 3개, 일이 7개면 37이에요!" },
      { prompt: "35 + 27 은 얼마일까요?", easyPrompt: "35 + 27 을 계산해요.", hint: "5+7=12, 30+20+12=62!", type: "choice", setup: (s) => { s.expr = { first: "35", operator: "+", second: "27" }; }, choices: [{ label: "52", value: "52" }, { label: "62", value: "62" }, { label: "63", value: "63" }], answer: "62", okMsg: "정확해요! 35 + 27 = 62!" },
      { prompt: "42 - 17 은 얼마일까요?", easyPrompt: "42에서 17을 빼면?", hint: "2에서 7을 못 빼므로 10을 빌려 12 - 7 = 5, 30 - 10 = 20!", type: "choice", setup: (s) => { s.expr = { first: "42", operator: "-", second: "17" }; }, choices: [{ label: "25", value: "25" }, { label: "35", value: "35" }, { label: "26", value: "26" }], answer: "25", okMsg: "훌륭해요! 42 - 17 = 25!" },
      { prompt: "53 - 28 은 얼마일까요?", easyPrompt: "53 - 28 을 계산해요.", hint: "13 - 8 = 5, 40 - 20 = 20!", type: "choice", setup: (s) => { s.expr = { first: "53", operator: "-", second: "28" }; }, choices: [{ label: "24", value: "24" }, { label: "25", value: "25" }, { label: "35", value: "35" }], answer: "25", okMsg: "정답! 53 - 28 = 25예요!" }
    ]
  },

  10: {
    example: {
      title: "예시: 백·십·일 세 자리 수 (125 + 143)",
      problem: "백의 자리, 십의 자리, 일의 자리를 맞추어 세 자리 수를 계산해요.",
      visual: "<span>백 2개 · 십 6개 · 일 8개</span> <span>=</span> <span>268</span>",
      steps: [
        "일: 5 + 3 = 8",
        "십: 2 + 4 = 6, 백: 1 + 1 = 2",
        "정답: 268이에요!"
      ],
      speakText: "125 더하기 143은 백의 자리 2, 십의 자리 6, 일의 자리 8로 268입니다."
    },
    problems: [
      { prompt: "125 + 143 은 얼마일까요?", easyPrompt: "125 + 143 을 계산해요.", hint: "일의 자리부터 차례로 더해 보세요.", type: "choice", setup: (s) => { s.expr = { first: "125", operator: "+", second: "143" }; }, choices: [{ label: "258", value: "258" }, { label: "268", value: "268" }, { label: "278", value: "278" }], answer: "268", okMsg: "정답이에요! 268!" },
      { prompt: "백모형 2개, 십모형 0개, 일모형 5개가 나타내는 수는 무엇일까요?", easyPrompt: "100이 2개, 1이 5개면?", hint: "십의 자리가 비어 있으면 0을 써요.", type: "choice", choices: [{ label: "25", value: "25" }, { label: "205", value: "205" }, { label: "250", value: "250" }], answer: "205", okMsg: "맞아요! 205 (이백오)예요!" },
      { prompt: "234 + 182 는 얼마일까요?", easyPrompt: "234 + 182 를 계산해요.", hint: "십의 자리 3+8=11이므로 백의 자리로 1 올려요.", type: "choice", setup: (s) => { s.expr = { first: "234", operator: "+", second: "182" }; }, choices: [{ label: "316", value: "316" }, { label: "416", value: "416" }, { label: "426", value: "426" }], answer: "416", okMsg: "훌륭해요! 416이에요!" },
      { prompt: "350 - 120 은 얼마일까요?", easyPrompt: "350에서 120을 빼면?", hint: "300-100=200, 50-20=30!", type: "choice", setup: (s) => { s.expr = { first: "350", operator: "-", second: "120" }; }, choices: [{ label: "220", value: "220" }, { label: "230", value: "230" }, { label: "240", value: "240" }], answer: "230", okMsg: "정확해요! 350 - 120 = 230!" },
      { prompt: "십모형 10개를 하나로 묶으면 무엇이 될까요?", easyPrompt: "10이 10개 모이면 얼마인가요?", hint: "10이 10번 있으면 100(백)이에요!", type: "choice", choices: [{ label: "10 (십)", value: "10" }, { label: "100 (백)", value: "100" }, { label: "1000 (천)", value: "1000" }], answer: "100", okMsg: "정답! 십모형 10개는 백모형 1개(100)예요!" }
    ]
  },

  11: {
    example: {
      title: "예시: 같은 수씩 묶어 곱셈 (3 × 4)",
      problem: "3개씩 4묶음이 있으면 모두 몇 개일까요?",
      visual: "<span>(●●●) × 4묶음</span> <span>=</span> <span>12개</span>",
      steps: [
        "한 묶음에 3개씩 담아요.",
        "4묶음을 나란히 놓아 세어 봐요: 3, 6, 9, 12!",
        "정답: 3 × 4 = 12예요!"
      ],
      speakText: "3개씩 4묶음은 3, 6, 9, 12, 모두 12개입니다."
    },
    problems: [
      { prompt: "3 × 4 (3개씩 4묶음)은 모두 몇 개일까요?", easyPrompt: "3개씩 4묶음은 몇 개인가요?", hint: "3 + 3 + 3 + 3 을 계산해 보세요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "×", second: "4" }; }, choices: [{ label: "7", value: "7" }, { label: "12", value: "12" }, { label: "15", value: "15" }], answer: "12", okMsg: "정답! 3 × 4 = 12예요!" },
      { prompt: "2개씩 5묶음(2 × 5)은 모두 몇 개일까요?", easyPrompt: "2 × 5 는 얼마인가요?", hint: "2, 4, 6, 8, 10!", type: "choice", setup: (s) => { s.expr = { first: "2", operator: "×", second: "5" }; }, choices: [{ label: "8", value: "8" }, { label: "10", value: "10" }, { label: "12", value: "12" }], answer: "10", okMsg: "맞아요! 2 × 5 = 10!" },
      { prompt: "5개씩 3묶음(5 × 3)은 얼마일까요?", easyPrompt: "5 × 3 을 계산해요.", hint: "5, 10, 15!", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "×", second: "3" }; }, choices: [{ label: "15", value: "15" }, { label: "18", value: "18" }, { label: "20", value: "20" }], answer: "15", okMsg: "정확해요! 5 × 3 = 15!" },
      { prompt: "4개씩 4묶음(4 × 4)은 모두 몇 개일까요?", easyPrompt: "4 × 4 는 얼마일까요?", hint: "4 + 4 = 8, 8 + 8 = 16!", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "×", second: "4" }; }, choices: [{ label: "12", value: "12" }, { label: "16", value: "16" }, { label: "20", value: "20" }], answer: "16", okMsg: "훌륭해요! 4 × 4 = 16!" },
      { prompt: "6 × 3 은 얼마일까요?", easyPrompt: "6개씩 3묶음은?", hint: "6 + 6 + 6 = 18이에요.", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "×", second: "3" }; }, choices: [{ label: "16", value: "16" }, { label: "18", value: "18" }, { label: "21", value: "21" }], answer: "18", okMsg: "완벽해요! 6 × 3 = 18!" }
    ]
  },

  12: {
    example: {
      title: "예시: 똑같이 나누기 (12 ÷ 3)",
      problem: "사과 12개를 접시 3개에 똑같이 나누어 담으면 한 접시에 몇 개씩일까요?",
      visual: "<span>12개 ÷ 3접시</span> <span>=</span> <span>한 접시에 4개씩</span>",
      steps: [
        "접시 3개를 준비해요.",
        "12개를 한 접시에 하나씩 차례로 나누어 담아요.",
        "정답: 한 접시에 4개씩! 12 ÷ 3 = 4!"
      ],
      speakText: "12개를 3접시에 똑같이 나누면 한 접시에 4개씩 들어갑니다."
    },
    problems: [
      { prompt: "12 ÷ 3 은 얼마일까요?", easyPrompt: "12개를 3곳에 똑같이 나누면 몇 개씩일까요?", hint: "3 × ? = 12 인지 생각해 보세요.", type: "choice", setup: (s) => { s.expr = { first: "12", operator: "÷", second: "3" }; }, choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "정답! 한 접시에 4개씩이에요!" },
      { prompt: "10 ÷ 2 (10개를 2명에게 똑같이 나누기)는 얼마일까요?", easyPrompt: "10 ÷ 2 는 얼마인가요?", hint: "2 × 5 = 10이에요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "÷", second: "2" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "맞아요! 10 ÷ 2 = 5!" },
      { prompt: "15 ÷ 5 는 얼마일까요?", easyPrompt: "15개를 5접시에 똑같이 담으면?", hint: "5 × 3 = 15예요.", type: "choice", setup: (s) => { s.expr = { first: "15", operator: "÷", second: "5" }; }, choices: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }], answer: "3", okMsg: "정확해요! 15 ÷ 5 = 3!" },
      { prompt: "16 ÷ 4 는 얼마일까요?", easyPrompt: "16 ÷ 4 를 계산해요.", hint: "4 × 4 = 16이에요.", type: "choice", setup: (s) => { s.expr = { first: "16", operator: "÷", second: "4" }; }, choices: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }], answer: "4", okMsg: "훌륭해요! 16 ÷ 4 = 4!" },
      { prompt: "쿠키 18개를 6명에게 똑같이 나누어 주면 한 사람당 몇 개일까요?", easyPrompt: "18 ÷ 6 은 얼마일까요?", hint: "6 × 3 = 18!", type: "choice", setup: (s) => { s.expr = { first: "18", operator: "÷", second: "6" }; }, choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "3", okMsg: "완벽해요! 한 사람당 3개씩이에요!" }
    ]
  },

  13: {
    example: {
      title: "예시: 분수의 기초 (전체와 부분)",
      problem: "피자 1판을 똑같이 4조각으로 나눈 것 중 1조각은 1/4이에요.",
      visual: "<span>1/4 + 2/4</span> <span>=</span> <span>3/4</span>",
      steps: [
        "아래 숫자(분모)는 전체를 몇 조각으로 나누었는지 알려줘요.",
        "위 숫자(분자)는 그중 몇 조각인지 나타내요.",
        "정답: 분모가 같으면 분자끼리 더해요! 1/4 + 2/4 = 3/4!"
      ],
      speakText: "전체를 4조각으로 나눈 것 중 1조각과 2조각을 더하면 4분의 3이 됩니다."
    },
    problems: [
      { prompt: "1/4 + 2/4 는 얼마일까요?", easyPrompt: "4분의 1 더하기 4분의 2는?", hint: "4조각 중 1조각 + 2조각 = 3조각!", type: "choice", setup: (s) => { s.expr = { first: "1/4", operator: "+", second: "2/4" }; s.fractions = { a: { n: 1, d: 4 }, b: { n: 2, d: 4 } }; }, choices: [{ label: "2/4", value: "2/4" }, { label: "3/4", value: "3/4" }, { label: "3/8", value: "3/8" }], answer: "3/4", okMsg: "정답! 3/4 (4분의 3)이에요!" },
      { prompt: "전체를 똑같이 2조각으로 나눈 것 중 1조각을 분수로 무엇이라고 할까요?", easyPrompt: "절반을 나타내는 분수는?", hint: "2조각 중 1조각은 1/2이에요.", type: "choice", choices: [{ label: "1/2", value: "1/2" }, { label: "1/3", value: "1/3" }, { label: "1/4", value: "1/4" }], answer: "1/2", okMsg: "맞아요! 절반은 1/2 (2분의 1)이에요!" },
      { prompt: "1/2 + 1/4 은 통분하면 2/4 + 1/4 이 됩니다. 얼마일까요?", easyPrompt: "절반(1/2)과 1/4을 더하면?", hint: "1/2은 2/4와 같아요. 2/4 + 1/4 = ?", type: "choice", setup: (s) => { s.expr = { first: "1/2", operator: "+", second: "1/4" }; s.fractions = { a: { n: 1, d: 2 }, b: { n: 1, d: 4 } }; }, choices: [{ label: "2/4", value: "2/4" }, { label: "3/4", value: "3/4" }, { label: "1", value: "1" }], answer: "3/4", okMsg: "정확해요! 3/4이에요!" },
      { prompt: "5/6 - 2/6 은 얼마일까요?", easyPrompt: "6조각 중 5조각에서 2조각을 빼면?", hint: "분자끼리 빼면 5 - 2 = 3이에요.", type: "choice", setup: (s) => { s.expr = { first: "5/6", operator: "-", second: "2/6" }; }, choices: [{ label: "2/6", value: "2/6" }, { label: "3/6", value: "3/6" }, { label: "4/6", value: "4/6" }], answer: "3/6", okMsg: "훌륭해요! 3/6 (절반 1/2과 같아요)!" },
      { prompt: "1/3 + 2/3 은 얼마일까요?", easyPrompt: "3조각 중 1조각과 2조각을 합치면?", hint: "3/3은 전체 1과 같아요!", type: "choice", setup: (s) => { s.expr = { first: "1/3", operator: "+", second: "2/3" }; }, choices: [{ label: "2/3", value: "2/3" }, { label: "1 (3/3)", value: "1" }, { label: "4/3", value: "4/3" }], answer: "1", okMsg: "완벽해요! 3/3 = 1 전체가 되었어요!" }
    ]
  },

  14: {
    example: {
      title: "예시: 소수의 이해와 계산 (0.4 + 0.3)",
      problem: "전체를 10으로 나눈 것 중 1개는 0.1이에요. 0.4와 0.3을 더해 보세요.",
      visual: "<span>0.4 + 0.3</span> <span>=</span> <span>0.7</span>",
      steps: [
        "0.4는 0.1이 4개, 0.3은 0.1이 3개예요.",
        "소수점 자리를 나란히 맞추어 더해요.",
        "정답: 0.1이 7개이므로 0.7이에요!"
      ],
      speakText: "0.4 더하기 0.3은 0.1이 모두 7개이므로 0.7입니다."
    },
    problems: [
      { prompt: "0.4 + 0.3 은 얼마일까요?", easyPrompt: "0.4 더하기 0.3은?", hint: "0.1이 4개와 3개를 합치면 7개(0.7)예요.", type: "choice", setup: (s) => { s.expr = { first: "0.4", operator: "+", second: "0.3" }; }, choices: [{ label: "0.6", value: "0.6" }, { label: "0.7", value: "0.7" }, { label: "0.8", value: "0.8" }], answer: "0.7", okMsg: "정답! 0.4 + 0.3 = 0.7이에요!" },
      { prompt: "분수 1/2 (전체의 절반)과 크기가 같은 소수는 무엇일까요?", easyPrompt: "1/2과 같은 소수를 고르세요.", hint: "1을 10조각으로 나누면 절반은 5조각(0.5)이에요.", type: "choice", choices: [{ label: "0.2", value: "0.2" }, { label: "0.5", value: "0.5" }, { label: "0.8", value: "0.8" }], answer: "0.5", okMsg: "맞아요! 1/2 = 0.5예요!" },
      { prompt: "0.9 - 0.4 는 얼마일까요?", easyPrompt: "0.9에서 0.4를 빼면?", hint: "9에서 4를 빼면 5, 소수점을 붙이면 0.5!", type: "choice", setup: (s) => { s.expr = { first: "0.9", operator: "-", second: "0.4" }; }, choices: [{ label: "0.4", value: "0.4" }, { label: "0.5", value: "0.5" }, { label: "0.6", value: "0.6" }], answer: "0.5", okMsg: "정확해요! 0.9 - 0.4 = 0.5!" },
      { prompt: "0.6 + 0.4 는 얼마일까요?", easyPrompt: "0.6과 0.4를 더하면?", hint: "0.1이 10개 모이면 1이 돼요!", type: "choice", setup: (s) => { s.expr = { first: "0.6", operator: "+", second: "0.4" }; }, choices: [{ label: "0.10", value: "0.10" }, { label: "1 (1.0)", value: "1" }, { label: "1.1", value: "1.1" }], answer: "1", okMsg: "훌륭해요! 0.6 + 0.4 = 1.0 (1)이에요!" },
      { prompt: "1.2 + 0.5 는 얼마일까요?", easyPrompt: "1.2 + 0.5 를 계산해요.", hint: "소수 첫째 자리끼리 더하면 2+5=7, 자연수는 1!", type: "choice", setup: (s) => { s.expr = { first: "1.2", operator: "+", second: "0.5" }; }, choices: [{ label: "1.6", value: "1.6" }, { label: "1.7", value: "1.7" }, { label: "1.8", value: "1.8" }], answer: "1.7", okMsg: "완벽해요! 1.7이에요!" }
    ]
  },

  15: {
    example: {
      title: "예시: 자로 길이 재기 (cm)",
      problem: "연필의 시작을 자의 0에 맞추고 끝이 가리키는 눈금을 읽어요.",
      visual: "<span>0 ──────── 12 cm</span>",
      steps: [
        "물건의 한쪽 끝을 0 눈금에 맞추어요.",
        "다른 쪽 끝의 숫자를 읽고 단위(cm)를 붙여요.",
        "정답: 연필의 길이는 12 cm예요!"
      ],
      speakText: "자의 0 눈금에 맞추고 끝 눈금을 읽으면 12센티미터입니다."
    },
    problems: [
      { prompt: "아래 길이 자의 슬라이더를 움직여 연필 길이를 15 cm 로 맞춰 보세요!", easyPrompt: "연필 길이를 15 cm로 맞춰요.", hint: "길이 탭에서 눈금을 15에 맞춘 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.measure.tab = "length"; s.measure.length = 10; }, check: (s) => s.measure.length === 15, okMsg: "정확해요! 15 cm를 정확히 맞추었어요!" },
      { prompt: "비커에 물이 600 mL 들어 있어요. 200 mL를 더 부으면 모두 몇 mL일까요?", easyPrompt: "600 mL + 200 mL 는?", hint: "6 + 2 = 8이므로 800 mL예요.", type: "choice", setup: (s) => { s.measure.tab = "volume"; }, choices: [{ label: "700 mL", value: "700" }, { label: "800 mL", value: "800" }, { label: "900 mL", value: "900" }], answer: "800", okMsg: "정답! 800 mL예요!" },
      { prompt: "저울에 올린 수박의 무게가 1000 g이라면, 이것은 몇 kg과 같을까요?", easyPrompt: "1000 g은 몇 kg인가요?", hint: "1000 g = 1 kg 이에요!", type: "choice", setup: (s) => { s.measure.tab = "weight"; }, choices: [{ label: "1 kg", value: "1" }, { label: "10 kg", value: "10" }, { label: "100 kg", value: "100" }], answer: "1", okMsg: "맞아요! 1000 g은 1 kg이에요!" },
      { prompt: "자에서 눈금 2 cm부터 시작해서 9 cm까지 잰 리본의 실제 길이는 몇 cm일까요?", easyPrompt: "2에서 9까지는 몇 cm인가요?", hint: "9 - 2 = 7 cm예요.", type: "choice", choices: [{ label: "6 cm", value: "6" }, { label: "7 cm", value: "7" }, { label: "9 cm", value: "9" }], answer: "7", okMsg: "정확해요! 9 - 2 = 7 cm!" },
      { prompt: "길이 1 m는 몇 cm와 같을까요?", easyPrompt: "1 m는 몇 cm인가요?", hint: "1 미터는 100 센티미터예요!", type: "choice", choices: [{ label: "10 cm", value: "10" }, { label: "100 cm", value: "100" }, { label: "1000 cm", value: "1000" }], answer: "100", okMsg: "완벽해요! 1 m = 100 cm!" }
    ]
  },

  16: {
    example: {
      title: "예시: 시계 읽기와 동전 계산",
      problem: "짧은 바늘은 시, 긴 바늘은 분을 나타내요. 동전은 값을 모두 더해요.",
      visual: "<span>🕘 9시 30분</span> · <span>100원 + 50원 = 150원</span>",
      steps: [
        "짧은 바늘이 9와 10 사이, 긴 바늘이 6(30분)을 가리키면 9시 30분!",
        "100원 동전 1개와 50원 동전 1개를 더하면 150원이에요.",
        "정답: 시계와 돈 탭에서 직접 눌러 확인해 보세요!"
      ],
      speakText: "짧은 바늘은 시, 긴 바늘은 분을 읽고, 동전은 값을 모두 더해 금액을 구합니다."
    },
    problems: [
      { prompt: "시계의 짧은 바늘이 3, 긴 바늘이 12를 가리키면 몇 시일까요?", easyPrompt: "긴 바늘이 12, 짧은 바늘이 3이면 몇 시인가요?", hint: "긴 바늘이 12에 있으면 정각(00분)이에요.", type: "choice", setup: (s) => { s.measure.tab = "clock"; s.measure.minutes = 180; }, choices: [{ label: "3시", value: "3" }, { label: "12시 15분", value: "12:15" }, { label: "3시 30분", value: "3:30" }], answer: "3", okMsg: "정답이에요! 3시 정각이에요!" },
      { prompt: "100원 동전 2개와 50원 동전 1개를 모으면 모두 얼마일까요?", easyPrompt: "100원 2개 + 50원 1개는 얼마인가요?", hint: "100 + 100 + 50 = 250원!", type: "choice", setup: (s) => { s.measure.tab = "money"; }, choices: [{ label: "200원", value: "200" }, { label: "250원", value: "250" }, { label: "300원", value: "300" }], answer: "250", okMsg: "맞아요! 모두 250원이에요!" },
      { prompt: "돈 탭에서 동전을 눌러 딱 600원을 만들어 보세요!", easyPrompt: "동전으로 600원을 만들어요.", hint: "500원 1개와 100원 1개를 누른 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.measure.tab = "money"; s.measure.coins = { 10: 0, 50: 0, 100: 0, 500: 0 }; }, check: (s) => { const c = s.measure.coins; return c[10]*10 + c[50]*50 + c[100]*100 + c[500]*500 === 600; }, okMsg: "완벽해요! 600원을 정확히 만들었어요!" },
      { prompt: "시계 탭에서 시간을 10시 30분(10:30)으로 맞추어 보세요!", easyPrompt: "시계를 10시 30분으로 맞춰요.", hint: "시계 탭에서 +1시간, +30분 버튼을 눌러 10:30을 맞춘 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.measure.tab = "clock"; s.measure.minutes = 540; }, check: (s) => s.measure.minutes === 630, okMsg: "정확해요! 10시 30분이에요!" },
      { prompt: "오전 9시에서 2시간이 지나면 몇 시가 될까요?", easyPrompt: "9시에서 2시간 뒤는 몇 시인가요?", hint: "9 + 2 = 11시!", type: "choice", choices: [{ label: "10시", value: "10" }, { label: "11시", value: "11" }, { label: "12시", value: "12" }], answer: "11", okMsg: "정답! 오전 11시예요!" }
    ]
  },

  17: {
    example: {
      title: "예시: 도형 특징과 반복 규칙",
      problem: "삼각형·사각형의 변과 꼭짓점을 세어 보고, 반복 무늬에서 다음 모양을 찾아요.",
      visual: "<span>🔴 🟦 🔴 🟦 🔴 ( ? )</span> <span>➡️</span> <span>🟦</span>",
      steps: [
        "삼각형은 변 3개·꼭짓점 3개, 사각형은 변 4개·꼭짓점 4개예요.",
        "무늬 🔴 🟦 이 계속 반복되고 있어요.",
        "정답: 🔴 다음에는 🟦 파란 네모가 와요!"
      ],
      speakText: "빨간 동그라미와 파란 네모가 번갈아 나오므로 다음 모양은 파란 네모입니다."
    },
    problems: [
      { prompt: "삼각형은 곧은 선(변)이 몇 개 있을까요?", easyPrompt: "삼각형의 변은 몇 개인가요?", hint: "세모는 변이 3개, 꼭짓점도 3개예요.", type: "choice", setup: (s) => { s.shapeTab = "shape"; s.shapeId = "triangle"; }, choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "3", okMsg: "정답! 삼각형은 변이 3개예요!" },
      { prompt: "사각형은 뾰족한 부분(꼭짓점)이 몇 개 있을까요?", easyPrompt: "사각형의 꼭짓점은 몇 개인가요?", hint: "네모 모서리를 세어 보세요.", type: "choice", setup: (s) => { s.shapeTab = "shape"; s.shapeId = "square"; }, choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "맞아요! 사각형은 꼭짓점이 4개예요!" },
      { prompt: "⭐ 🌙 ⭐ 🌙 ⭐ ( ? ) — 빈칸에 올 모양은 무엇일까요?", easyPrompt: "별 다음엔 무엇이 올까요?", hint: "별과 달이 번갈아 나와요.", type: "choice", setup: (s) => { s.shapeTab = "pattern"; }, choices: [{ label: "⭐", value: "star" }, { label: "🌙", value: "moon" }, { label: "☀️", value: "sun" }], answer: "moon", okMsg: "정확해요! 다음 모양은 🌙 달이에요!" },
      { prompt: "🍎 🍎 🍌 🍎 🍎 🍌 🍎 🍎 ( ? ) — 다음에 올 과일은?", easyPrompt: "사과 두 개, 바나나 한 개 규칙이에요.", hint: "사과가 2번 나왔으니 다음은 바나나예요!", type: "choice", choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍌 바나나", value: "banana" }, { label: "🍇 포도", value: "grape" }], answer: "banana", okMsg: "훌륭해요! 🍌 바나나가 와요!" },
      { prompt: "동그라미(원)는 뾰족한 꼭짓점이 몇 개 있을까요?", easyPrompt: "동그라미에 뾰족한 곳이 있나요?", hint: "둥근 모양이라 뾰족한 곳이 하나도 없어요(0개).", type: "choice", setup: (s) => { s.shapeTab = "shape"; s.shapeId = "circle"; }, choices: [{ label: "0개", value: "0" }, { label: "1개", value: "1" }, { label: "4개", value: "4" }], answer: "0", okMsg: "완벽해요! 동그라미는 꼭짓점이 0개예요!" }
    ]
  },

  18: {
    example: {
      title: "예시: 그림 그래프 보고 문제 풀기",
      problem: "우리 반 친구들이 좋아하는 과일 그래프를 보고 가장 많은 과일을 찾아요.",
      visual: "<span>🍎 5명 · 🍌 3명 · 🍇 4명</span> <span>➡️</span> <span>가장 많은 과일: 🍎</span>",
      steps: [
        "그래프 막대가 가장 높은 과일을 찾아요.",
        "사과 5명, 바나나 3명, 포도 4명이므로 사과가 가장 많아요.",
        "정답: 사과(5)와 바나나(3)의 차이는 5 - 3 = 2명이에요!"
      ],
      speakText: "그래프에서 사과가 5명으로 가장 많고, 바나나보다 2명 더 많습니다."
    },
    problems: [
      { prompt: "그래프에서 🍎 사과 5개, 🍌 바나나 3개, 🍇 포도 4개일 때 가장 많은 과일은?", easyPrompt: "제일 많은 과일을 고르세요.", hint: "5가 가장 큰 수예요.", type: "choice", setup: (s) => { s.data = { apple: 5, banana: 3, grape: 4, answer: null, solved: false, wordSolved: false }; }, choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍌 바나나", value: "banana" }, { label: "🍇 포도", value: "grape" }], answer: "apple", okMsg: "정답! 사과가 5개로 가장 많아요!" },
      { prompt: "사과(5개)는 바나나(3개)보다 몇 개 더 많을까요?", easyPrompt: "5개는 3개보다 몇 개 더 많나요?", hint: "5 - 3 = 2개예요!", type: "choice", choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "2", okMsg: "맞아요! 2개 더 많아요!" },
      { prompt: "사과 5개, 바나나 3개, 포도 4개를 모두 합하면 모두 몇 개일까요?", easyPrompt: "과일 3종류를 모두 더하면?", hint: "5 + 3 = 8, 8 + 4 = 12개!", type: "choice", choices: [{ label: "10개", value: "10" }, { label: "12개", value: "12" }, { label: "14개", value: "14" }], answer: "12", okMsg: "정확해요! 모두 12개예요!" },
      { prompt: "이야기 문제: 🍎 사과 3개와 🍊 귤 5개를 바구니에 담으면 모두 몇 개일까요?", easyPrompt: "사과 3개와 귤 5개를 모으면?", hint: "3 + 5 = 8개예요!", type: "choice", setup: (s) => { s.story = { apple: 0, orange: 0 }; }, choices: [{ label: "7개", value: "7" }, { label: "8개", value: "8" }, { label: "9개", value: "9" }], answer: "8", okMsg: "훌륭해요! 모두 8개예요!" },
      { prompt: "그래프에서 가장 적은 과일은 무엇일까요? (사과 5, 바나나 3, 포도 4)", easyPrompt: "제일 적은 과일을 고르세요.", hint: "3이 가장 작은 수예요.", type: "choice", choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍌 바나나", value: "banana" }, { label: "🍇 포도", value: "grape" }], answer: "banana", okMsg: "완벽해요! 바나나가 3개로 가장 적어요!" }
    ]
  }
};

const AAC_ITEMS = [
  { emoji: "🙋", label: "도와주세요", say: "도와주세요" },
  { emoji: "➕", label: "더", say: "더 하고 싶어요" },
  { emoji: "✋", label: "그만", say: "그만하고 싶어요" },
  { emoji: "🔁", label: "또", say: "또 하고 싶어요" },
  { emoji: "👍", label: "좋아요", say: "좋아요" },
  { emoji: "🌿", label: "쉬고 싶어요", say: "쉬고 싶어요" },
  { emoji: "💧", label: "물", say: "물 주세요" },
  { emoji: "🚻", label: "화장실", say: "화장실에 가고 싶어요" },
  { emoji: "😊", label: "기뻐요", say: "기뻐요" },
  { emoji: "😢", label: "슬퍼요", say: "슬퍼요" },
  { emoji: "😠", label: "화나요", say: "화나요" },
  { emoji: "🤗", label: "안아 주세요", say: "안아 주세요" }
];

const REWARD_CHOICES = [
  { emoji: "🌿", label: "쉬는 시간", say: "쉬는 시간을 고를게요" },
  { emoji: "💧", label: "물 마시기", say: "물을 마실게요" },
  { emoji: "🎵", label: "좋아하는 노래", say: "좋아하는 노래를 들을게요" },
  { emoji: "🧸", label: "좋아하는 장난감", say: "좋아하는 장난감을 가지고 놀게요" },
  { emoji: "🚶", label: "걷기", say: "잠깐 걸을게요" },
  { emoji: "⭐", label: "스티커", say: "스티커를 받을게요" }
];

function validateState() {
  state.stage = clamp(Number(state.stage) || 5, 1, STAGES.length);
  state.formulaMode = ["both", "horizontal", "vertical"].includes(state.formulaMode) ? state.formulaMode : "both";
  if (!ITEMS.some((it) => it.id === state.itemTheme)) state.itemTheme = "apple";
  state.parts = partsFromValue(totalOf(state.parts));
  state.compare.a = clamp(Number(state.compare.a) || 6, 0, 20);
  state.compare.b = clamp(Number(state.compare.b) || 4, 0, 20);
  state.measure.length = clamp(Number(state.measure.length) || 0, 0, 20);
  state.measure.volume = clamp(Number(state.measure.volume) || 0, 0, 10);
  state.measure.weight = clamp(Number(state.measure.weight) || 0, 0, 1000);
  state.measure.minutes = ((Number(state.measure.minutes) || 0) % 1440 + 1440) % 1440;
  state.tokens = clamp(Number(state.tokens) || 0, 0, state.settings.tokenMax);
  state.promptLevel = clamp(Number(state.promptLevel) || 0, 0, 4);
}
