"use strict";

/* ============================================================
   3. 21단계 기초 수학 교육과정 (단계별 다중 예시 + 풍부한 문제 6~7문항 + 교사 입력 연동)
   ============================================================ */
const STAGE_CURRICULUM = {
  1: {
    examples: [
      {
        title: "예시 1: 같은 과일끼리 바구니에 모으기",
        problem: "🍎 사과, 🍋 레몬, 🍇 포도가 섞여 있어요. 같은 모양과 색깔끼리 바구니에 담아 보세요.",
        visual: "<span>🍎 🍋 🍎</span> <span>➡️</span> <span>🧺 사과(🍎🍎) · 🧺 레몬(🍋)</span>",
        steps: [
          "과일의 색깔과 모양을 먼저 살펴봐요.",
          "빨간 사과(🍎)는 사과 바구니로, 노란 레몬(🍋)은 레몬 바구니로 보내요.",
          "정답: 같은 것끼리 모으면 사과 2개, 레몬 1개처럼 쉽게 셀 수 있어요!"
        ],
        speakText: "예시 1번이에요. 빨간 사과는 사과 바구니에, 노란 레몬은 레몬 바구니에 담으면 쉽게 셀 수 있어요."
      },
      {
        title: "예시 2: 색깔이 같은 것끼리 묶기",
        problem: "노란색 과일(🍋, 🍌)과 빨간색 과일(🍎, 🍓)이 있어요. 같은 색깔끼리 모아 볼까요?",
        visual: "<span>🍋 🍎 🍌 🍓</span> <span>➡️</span> <span>💛 노랑(🍋🍌) · ❤️ 빨강(🍎🍓)</span>",
        steps: [
          "모양이 달라도 색깔이 같은지 살펴봐요.",
          "노란 레몬과 노란 바나나를 한쪽에 모아요.",
          "정답: 노란색 2개, 빨간색 2개로 똑같이 나눌 수 있어요!"
        ],
        speakText: "예시 2번이에요. 모양이 달라도 색깔이 같은 노란 레몬과 바나나를 한 곳에 모을 수 있어요."
      }
    ],
    problems: [
      { prompt: "아래 바구니에 사과(🍎) 2개와 레몬(🍋) 1개를 모두 담아 보세요! 다 담으면 확인 버튼을 눌러요.", easyPrompt: "사과 2개와 레몬 1개를 바구니에 넣어요.", hint: "사과를 눌러 사과 바구니에 2개, 레몬을 눌러 레몬 바구니에 1개 넣어 보세요.", type: "check", setup: (s) => { s.sort = { items: ["apple", "lemon", "apple"], counts: { apple: 0, lemon: 0, grape: 0 }, done: false }; }, check: (s) => s.sort.counts.apple === 2 && s.sort.counts.lemon === 1, okMsg: "잘했어요! 사과 2개, 레몬 1개를 똑같이 모았어요!" },
      { prompt: "🍎, 🍇, 🍎, 🍋, 🍇 중에서 🍇 포도는 모두 몇 개일까요?", easyPrompt: "포도(🍇)가 몇 개인지 세어요.", hint: "보라색 포도(🍇)만 손가락으로 짚어 세어 보세요.", type: "choice", choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "2", okMsg: "정답이에요! 포도(🍇)는 2개예요!" },
      { prompt: "사과(🍎) 1개, 레몬(🍋) 2개, 포도(🍇) 2개를 바구니에 모두 분류해 보세요!", easyPrompt: "과일 5개를 바구니에 나누어 담아요.", hint: "과일을 하나씩 눌러 알맞은 바구니에 담아 보세요.", type: "check", setup: (s) => { s.sort = { items: ["lemon", "grape", "apple", "lemon", "grape"], counts: { apple: 0, lemon: 0, grape: 0 }, done: false }; }, check: (s) => s.sort.counts.apple === 1 && s.sort.counts.lemon === 2 && s.sort.counts.grape === 2, okMsg: "훌륭해요! 세 가지 과일을 모두 정확히 모았어요!" },
      { prompt: "다음 중 '노란색' 과일끼리만 올바르게 모은 것은 무엇일까요?", easyPrompt: "노란색 과일끼리 모은 것을 고르세요.", hint: "노란 레몬(🍋)과 노란 바나나(🍌)가 함께 있는 것을 찾아요.", type: "choice", choices: [{ label: "🍋 🍌", value: "yellow" }, { label: "🍎 🍇", value: "red" }, { label: "🍏 🍋", value: "mix" }], answer: "yellow", okMsg: "맞아요! 레몬과 바나나는 노란색으로 묶을 수 있어요!" },
      { prompt: "🍎 🍎 🍎 🍋 🍇 중에서 가장 많이 있는 과일은 무엇일까요?", easyPrompt: "제일 많은 과일을 고르세요.", hint: "사과는 3개, 레몬은 1개, 포도는 1개예요.", type: "choice", choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍋 레몬", value: "lemon" }, { label: "🍇 포도", value: "grape" }], answer: "apple", okMsg: "정답! 사과가 3개로 가장 많아요!" },
      { prompt: "둥근 모양 물건(⚽, 🍊, 🏀)과 네모 모양 물건 중 '둥근 모양'만 있는 것은?", easyPrompt: "동그란 모양만 모은 것을 고르세요.", hint: "모서리가 없는 동그라미 모양을 찾아요.", type: "choice", choices: [{ label: "⚽ 🍊", value: "round" }, { label: "📦 🍎", value: "mix" }, { label: "🧱 📘", value: "sq" }], answer: "round", okMsg: "딩동댕! 공과 귤은 모두 동그란 모양이에요!" }
    ]
  },

  2: {
    examples: [
      {
        title: "예시 1: 1부터 5까지 하나씩 세기",
        problem: "점 1개에 숫자 1개를 짝지어 5까지 세어 보세요.",
        visual: "<span>● ● ● ●</span> <span>➡️</span> <span>1, 2, 3, 4 (모두 4개)</span>",
        steps: [
          "10칸 판의 왼쪽 첫 번째 칸부터 눌러요.",
          "하나, 둘, 셋, 넷, 다섯! 소리 내어 세어요.",
          "정답: 마지막으로 센 숫자가 전체 개수(5)예요!"
        ],
        speakText: "왼쪽부터 하나씩 짚으며 하나, 둘, 셋, 넷, 다섯 하고 세어요."
      },
      {
        title: "예시 2: 빠진 숫자 찾기 (1~5)",
        problem: "1, 2, ( ? ), 4, 5 에서 빈칸에 들어갈 숫자를 찾아볼까요?",
        visual: "<span>1️⃣ → 2️⃣ → ❓ → 4️⃣ → 5️⃣</span>",
        steps: [
          "1부터 차례대로 소리 내어 세어 봐요.",
          "1 다음은 2, 2 다음은 3이에요.",
          "정답: 빈칸에는 3이 들어가요!"
        ],
        speakText: "1부터 세어 보면 1, 2, 3, 4, 5! 빈칸에 들어갈 수는 3이에요."
      }
    ],
    problems: [
      { prompt: "아래 10칸 판에 점을 정확히 3개 채워 보세요!", easyPrompt: "칸 3개를 채워요.", hint: "칸을 3번 눌러 점 3개를 만든 뒤 확인 버튼을 눌러요.", type: "check", setup: (s) => { s.expr = { first: "0", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 3, okMsg: "좋아요! 하나, 둘, 셋, 모두 3개예요!" },
      { prompt: "🍎 🍎 🍎 🍎 — 사과는 모두 몇 개일까요?", easyPrompt: "사과가 몇 개인가요?", hint: "왼쪽부터 하나씩 짚어 세어 보세요.", type: "choice", choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "정답이에요! 사과가 4개예요!" },
      { prompt: "10칸 판에 점을 5개 채워 첫 번째 줄을 가득 채워 보세요!", easyPrompt: "첫 줄 5칸을 모두 채워요.", hint: "5칸을 모두 채우고 확인 버튼을 눌러요.", type: "check", setup: (s) => { s.expr = { first: "1", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 5, okMsg: "멋져요! 윗줄 5칸을 꽉 채웠어요!" },
      { prompt: "⭐ ⭐ — 별이 3개가 되려면 몇 개를 더 그려야 할까요?", easyPrompt: "3개가 되려면 몇 개 더 필요할까요?", hint: "2에서 하나만 더 있으면 3이 돼요.", type: "choice", choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "1", okMsg: "정답! 2개에 1개를 더하면 3개예요!" },
      { prompt: "1, 2, ( ? ), 4, 5 — 빈칸에 들어갈 숫자는 무엇일까요?", easyPrompt: "2 다음 숫자는 무엇인가요?", hint: "하나, 둘, 다음은 셋(3)이에요!", type: "choice", choices: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "6", value: "6" }], answer: "3", okMsg: "딩동댕! 2 다음은 3이에요!" },
      { prompt: "🐶 🐶 🐶 🐶 🐶 — 강아지는 모두 몇 마리일까요?", easyPrompt: "강아지를 하나씩 세어 보세요.", hint: "다섯 마리예요. 숫자 5를 골라요.", type: "choice", choices: [{ label: "4마리", value: "4" }, { label: "5마리", value: "5" }, { label: "2마리", value: "2" }], answer: "5", okMsg: "잘했어요! 강아지가 모두 5마리예요!" }
    ]
  },

  3: {
    examples: [
      {
        title: "예시 1: 6부터 10까지 10칸 판으로 세기",
        problem: "윗줄 5칸이 다 차면 아랫줄로 내려가서 6, 7, 8, 9, 10을 세어요.",
        visual: "<span>5개 + 2개</span> <span>➡️</span> <span>모두 7개!</span>",
        steps: [
          "윗줄 5칸이 가득 찬 것을 먼저 확인해요.",
          "아랫줄에 1칸, 2칸 더 채우면 6, 7이 돼요.",
          "정답: 10칸이 모두 차면 10개 한 묶음이에요!"
        ],
        speakText: "윗줄 5칸에 아랫줄 2칸을 더하면 6, 7, 모두 7개가 됩니다."
      },
      {
        title: "예시 2: 10을 채우려면 몇 개가 더 필요할까?",
        problem: "점이 8개 있을 때, 10칸을 다 채우려면 몇 칸이 비어 있을까요?",
        visual: "<span>8개 + ⬜⬜</span> <span>=</span> <span>10개!</span>",
        steps: [
          "10칸 판에 8개를 놓으면 빈칸이 2칸 남아요.",
          "8 다음 9, 10! 두 칸을 더 채우면 10이 돼요.",
          "정답: 8에 2를 더하면 10이에요!"
        ],
        speakText: "8개에서 10칸을 채우려면 빈칸 2개를 더 채우면 됩니다."
      }
    ],
    problems: [
      { prompt: "10칸 판에 점을 7개 채워 보세요!", easyPrompt: "점 7개를 만들어요.", hint: "윗줄 5개와 아랫줄 2개를 채워 보세요.", type: "check", setup: (s) => { s.expr = { first: "5", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 7, okMsg: "정확해요! 5개와 2개로 7개예요!" },
      { prompt: "윗줄 5칸이 다 차고 아랫줄에 4칸이 채워져 있어요. 모두 몇 개일까요?", easyPrompt: "5개와 4개는 모두 몇 개일까요?", hint: "5 다음부터 6, 7, 8, 9로 이어 세어 보세요.", type: "choice", choices: [{ label: "8개", value: "8" }, { label: "9개", value: "9" }, { label: "10개", value: "10" }], answer: "9", okMsg: "정답이에요! 5와 4가 만나 9개예요!" },
      { prompt: "10칸 판을 10개로 가득 채워 보세요!", easyPrompt: "10칸을 모두 채워요.", hint: "빈칸이 하나도 없게 10까지 채워 보세요.", type: "check", setup: (s) => { s.expr = { first: "6", operator: null, second: "" }; }, check: (s) => Number(s.expr.first) === 10, okMsg: "완벽해요! 10칸이 가득 찼어요!" },
      { prompt: "🍎🍎🍎🍎🍎 🍎🍎🍎 — 사과는 모두 몇 개일까요?", easyPrompt: "사과 개수를 세어요.", hint: "5개 묶음과 3개가 있어요.", type: "choice", choices: [{ label: "7개", value: "7" }, { label: "8개", value: "8" }, { label: "9개", value: "9" }], answer: "8", okMsg: "맞아요! 5와 3으로 모두 8개예요!" },
      { prompt: "9에서 1이 더 커지면 얼마가 될까요?", easyPrompt: "9 다음 숫자는 무엇인가요?", hint: "아홉 다음은 열(10)이에요!", type: "choice", choices: [{ label: "8", value: "8" }, { label: "10", value: "10" }, { label: "11", value: "11" }], answer: "10", okMsg: "정답! 9 다음은 10이에요!" },
      { prompt: "점이 6개 있어요. 10개가 되려면 몇 개가 더 필요할까요?", easyPrompt: "6에서 10이 되려면 몇 개 더 필요할까요?", hint: "6에서 7, 8, 9, 10! 4칸이 비어 있어요.", type: "choice", choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "훌륭해요! 6과 4가 만나면 10이에요!" }
    ]
  },

  4: {
    examples: [
      {
        title: "예시 1: 10개 한 묶음과 낱개로 14 만들기",
        problem: "10개 한 묶음(십모형 1개)과 낱개 4개(일모형 4개)를 합치면 얼마일까요?",
        visual: "<span>🔟 (10) + 🟦🟦🟦🟦 (4)</span> <span>=</span> <span>14 (십사)</span>",
        steps: [
          "10개 한 묶음은 숫자 '10'이에요.",
          "여기에 낱개 4개를 더하면 11, 12, 13, 14가 돼요.",
          "정답: 10과 4가 만나면 14예요!"
        ],
        speakText: "10개 묶음 하나와 낱개 4개를 모으면 14가 됩니다."
      },
      {
        title: "예시 2: 11부터 20까지 순서대로 세기",
        problem: "17 다음 숫자는 무엇이고, 19 다음 숫자는 무엇일까요?",
        visual: "<span>17 → 18 → 19 → 20</span>",
        steps: [
          "10다음 11, 12, 13, 14, 15, 16, 17, 18, 19, 20으로 커져요.",
          "19에서 1이 더 커지면 10개 묶음이 2개가 되어 20이 돼요.",
          "정답: 17 다음은 18, 19 다음은 20이에요!"
        ],
        speakText: "17 다음은 18이고, 19에서 하나 더 세면 20이 돼요."
      }
    ],
    problems: [
      { prompt: "십모형 1개와 일모형 3개를 합치면 얼마일까요?", easyPrompt: "10과 3을 모으면 얼마인가요?", hint: "10에 3을 더하면 13이에요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "+", second: "3" }; }, choices: [{ label: "12", value: "12" }, { label: "13", value: "13" }, { label: "14", value: "14" }], answer: "13", okMsg: "정답! 10과 3은 13이에요!" },
      { prompt: "10개 묶음 1개와 낱개 6개를 아래 모형으로 만들어 보세요! (16)", easyPrompt: "모형으로 16을 만들어요.", hint: "계산 결과나 모형이 16이 되도록 맞춰 보세요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "+", second: "6" }; }, choices: [{ label: "15", value: "15" }, { label: "16", value: "16" }, { label: "17", value: "17" }], answer: "16", okMsg: "멋져요! 10과 6은 16이에요!" },
      { prompt: "14, 15, ( ? ), 17 — 빈칸에 들어갈 숫자는?", easyPrompt: "15 다음 숫자를 고르세요.", hint: "14, 15 다음에 오는 수예요.", type: "choice", choices: [{ label: "13", value: "13" }, { label: "16", value: "16" }, { label: "18", value: "18" }], answer: "16", okMsg: "정답이에요! 15 다음은 16이에요!" },
      { prompt: "사탕이 10개 한 봉지와 낱개 8개 있어요. 모두 몇 개일까요?", easyPrompt: "10개와 8개는 모두 몇 개일까요?", hint: "10 + 8을 생각해 봐요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "+", second: "8" }; }, choices: [{ label: "17개", value: "17" }, { label: "18개", value: "18" }, { label: "19개", value: "19" }], answer: "18", okMsg: "딩동댕! 모두 18개예요!" },
      { prompt: "19보다 1 큰 수는 무엇일까요?", easyPrompt: "19 다음 숫자는 무엇인가요?", hint: "10개 묶음이 2개가 되는 수예요.", type: "choice", choices: [{ label: "18", value: "18" }, { label: "20", value: "20" }, { label: "21", value: "21" }], answer: "20", okMsg: "정답! 19 다음은 20이에요!" },
      { prompt: "12와 15 중에서 더 큰 수는 무엇일까요?", easyPrompt: "12와 15 중 큰 수를 고르세요.", hint: "10개 묶음은 같고 낱개가 2개와 5개예요.", type: "choice", choices: [{ label: "12", value: "12" }, { label: "15", value: "15" }, { label: "같아요", value: "eq" }], answer: "15", okMsg: "맞아요! 15가 12보다 더 커요!" }
    ]
  },

  5: {
    examples: [
      {
        title: "예시 1: 두 수의 크기 비교하기",
        problem: "왼쪽 접시에 6개, 오른쪽 접시에 4개가 있어요. 어느 쪽이 더 많을까요?",
        visual: "<span>6개</span> <span>&gt;</span> <span>4개</span>",
        steps: [
          "왼쪽 6개와 오른쪽 4개를 하나씩 짝지어요.",
          "왼쪽에 2개가 남아요. 그러므로 6이 4보다 더 커요!",
          "정답: 큰 쪽으로 입이 벌어져요 → 6 > 4"
        ],
        speakText: "6과 4를 짝지어 보면 왼쪽 6개가 2개 더 남아요. 그래서 6이 4보다 큽니다."
      },
      {
        title: "예시 2: 두 수의 개수가 똑같을 때 (=)",
        problem: "왼쪽 접시에 5개, 오른쪽 접시에도 5개가 있어요. 어떻게 나타낼까요?",
        visual: "<span>5개</span> <span>=</span> <span>5개</span>",
        steps: [
          "하나씩 짝지어 보니 남는 것이 하나도 없어요.",
          "양쪽의 크기가 똑같다는 기호는 '=' 예요.",
          "정답: 5 = 5"
        ],
        speakText: "양쪽 개수가 똑같을 때는 같다 표시인 등호를 써서 5는 5와 같다고 나타냅니다."
      }
    ],
    problems: [
      { prompt: "7과 5 중에서 더 큰 수는 무엇일까요?", easyPrompt: "7과 5 중 큰 수를 고르세요.", hint: "7이 5보다 2만큼 더 오른쪽에 있어요.", type: "choice", setup: (s) => { s.compare = { a: 7, b: 5 }; }, choices: [{ label: "7이 더 커요 (7 > 5)", value: "7" }, { label: "5가 더 커요 (5 > 7)", value: "5" }, { label: "같아요 (7 = 5)", value: "eq" }], answer: "7", okMsg: "정답! 7이 5보다 커요!" },
      { prompt: "아래 비교 도구에서 왼쪽 수를 8, 오른쪽 수를 3으로 만들어 보세요!", easyPrompt: "왼쪽 8개, 오른쪽 3개로 맞춰요.", hint: "왼쪽과 오른쪽 조절 버튼으로 8과 3을 맞춘 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.compare = { a: 4, b: 4 }; }, check: (s) => s.compare.a === 8 && s.compare.b === 3, okMsg: "잘했어요! 8은 3보다 5개 더 많아요!" },
      { prompt: "4와 9 사이에 들어갈 알맞은 기호는 무엇일까요? ( 4 □ 9 )", easyPrompt: "4와 9 중 큰 쪽으로 입이 벌어져요.", hint: "9가 더 크니까 오른쪽으로 입이 벌어져야 해요 (<).", type: "choice", setup: (s) => { s.compare = { a: 4, b: 9 }; }, choices: [{ label: ">", value: ">" }, { label: "<", value: "<" }, { label: "=", value: "=" }], answer: "<", okMsg: "정답이에요! 4 < 9 입니다!" },
      { prompt: "6과 6의 크기를 비교하면 어떤 기호가 맞을까요?", easyPrompt: "두 수가 같을 때는 어떤 기호를 쓰나요?", hint: "양쪽 개수가 똑같으면 같다는 뜻의 '='를 써요.", type: "choice", setup: (s) => { s.compare = { a: 6, b: 6 }; }, choices: [{ label: ">", value: ">" }, { label: "<", value: "<" }, { label: "=", value: "=" }], answer: "=", okMsg: "맞아요! 6 = 6 똑같아요!" },
      { prompt: "10, 4, 7 중에서 가장 작은 수는 무엇일까요?", easyPrompt: "가장 작은 수를 고르세요.", hint: "수직선에서 가장 왼쪽에 있는 수를 찾아요.", type: "choice", choices: [{ label: "10", value: "10" }, { label: "4", value: "4" }, { label: "7", value: "7" }], answer: "4", okMsg: "정답! 4가 가장 작은 수예요!" },
      { prompt: "12, 9, 15 중에서 가장 큰 수는 무엇일까요?", easyPrompt: "가장 큰 수를 고르세요.", hint: "가장 많이 세어야 나오는 수예요.", type: "choice", choices: [{ label: "12", value: "12" }, { label: "9", value: "9" }, { label: "15", value: "15" }], answer: "15", okMsg: "정답! 15가 가장 큰 수예요!" }
    ]
  },

  6: {
    examples: [
      {
        title: "예시 1: 두 묶음 모으기 (3 + 5)",
        problem: "사과 3개와 초록 사과 5개를 한 바구니에 모으면 모두 몇 개일까요?",
        visual: "<span>🍎🍎🍎 + 🍏🍏🍏🍏🍏</span> <span>=</span> <span>8개</span>",
        steps: [
          "첫 번째 묶음 3개를 먼저 놓아요.",
          "두 번째 묶음 5개를 함께 모아요.",
          "정답: 3 + 5 = 8! 모두 8개예요."
        ],
        speakText: "사과 3개와 초록 사과 5개를 모으면 모두 8개가 됩니다."
      },
      {
        title: "예시 2: 큰 수에서 이어 세어 더하기 (2 + 6)",
        problem: "2 + 6 을 쉽게 계산하려면 어떻게 세면 좋을까요?",
        visual: "<span>6에서 7, 8!</span> <span>➡️</span> <span>2 + 6 = 8</span>",
        steps: [
          "2와 6 중에서 더 큰 수인 6을 먼저 머리에 넣어요.",
          "6 다음부터 2번 이어 세면 7, 8이에요!",
          "정답: 2 + 6 = 8!"
        ],
        speakText: "2 더하기 6은 큰 수 6에서 7, 8 하고 2칸 이어 세면 금방 8이 됩니다."
      }
    ],
    problems: [
      { prompt: "3 + 5 는 얼마일까요?", easyPrompt: "3과 5를 모으면 몇 개인가요?", hint: "3에서 시작해 5만큼 이어 세어 보세요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "+", second: "5" }; }, choices: [{ label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" }], answer: "8", okMsg: "정답이에요! 3 + 5 = 8!" },
      { prompt: "4 + 2 는 얼마일까요?", easyPrompt: "4와 2를 더하면 얼마인가요?", hint: "4 다음에 5, 6!", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "+", second: "2" }; }, choices: [{ label: "5", value: "5" }, { label: "6", value: "6" }, { label: "7", value: "7" }], answer: "6", okMsg: "맞아요! 4 + 2 = 6이에요!" },
      { prompt: "구슬 5개와 4개를 모으면 모두 몇 개일까요?", easyPrompt: "5 + 4 는 얼마일까요?", hint: "5에서 6, 7, 8, 9 하고 세어요.", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "+", second: "4" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "훌륭해요! 5 + 4 = 9!" },
      { prompt: "2 + 6 을 계산해 보세요.", easyPrompt: "2와 6을 모으면?", hint: "큰 수 6에서 2를 이어 세면 7, 8이에요!", type: "choice", setup: (s) => { s.expr = { first: "2", operator: "+", second: "6" }; }, choices: [{ label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" }], answer: "8", okMsg: "정답! 2 + 6 = 8이에요!" },
      { prompt: "1 + 8 은 얼마일까요?", easyPrompt: "1과 8을 더하면?", hint: "8보다 1 큰 수예요.", type: "choice", setup: (s) => { s.expr = { first: "1", operator: "+", second: "8" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "완벽해요! 1 + 8 = 9!" },
      { prompt: "연필 3자루와 지우개 4개가 있어요. 모두 몇 개일까요?", easyPrompt: "3 + 4 는 얼마일까요?", hint: "3에서 4, 5, 6, 7 하고 세어 봐요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "+", second: "4" }; }, choices: [{ label: "6개", value: "6" }, { label: "7개", value: "7" }, { label: "8개", value: "8" }], answer: "7", okMsg: "정답! 모두 7개예요!" }
    ]
  },

  7: {
    examples: [
      {
        title: "예시 1: 전체에서 가르기 (8 - 3)",
        problem: "사과 8개 중에서 3개를 먹으면 몇 개가 남을까요?",
        visual: "<span>🍎🍎🍎🍎🍎🍎🍎🍎</span> <span>➖ 3개</span> <span>= 5개</span>",
        steps: [
          "처음에 사과 8개가 있어요.",
          "3개를 덜어내어 지워 봐요.",
          "정답: 남은 사과는 5개예요. 8 - 3 = 5!"
        ],
        speakText: "사과 8개에서 3개를 덜어내면 5개가 남아요. 8 빼기 3은 5입니다."
      },
      {
        title: "예시 2: 두 수의 차이 구하기 (9 - 4)",
        problem: "구슬 9개 중 4개를 친구에게 주면 몇 개가 남을까요?",
        visual: "<span>9개 → 4개 덜어내기</span> <span>➡️</span> <span>5개 남음</span>",
        steps: [
          "9에서 거꾸로 4칸 세어 봐요: 8, 7, 6, 5!",
          "또는 4와 몇을 모으면 9가 되는지 생각해요.",
          "정답: 9 - 4 = 5!"
        ],
        speakText: "9에서 거꾸로 4칸 세면 8, 7, 6, 5! 5개가 남습니다."
      }
    ],
    problems: [
      { prompt: "8 - 3 은 얼마일까요?", easyPrompt: "8개에서 3개를 빼면?", hint: "8개에서 3개를 덜어내어 남은 수를 세어요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "-", second: "3" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "정답! 8 - 3 = 5예요!" },
      { prompt: "7 - 2 는 얼마일까요?", easyPrompt: "7에서 2를 빼면?", hint: "7에서 거꾸로 6, 5!", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "-", second: "2" }; }, choices: [{ label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }], answer: "5", okMsg: "잘했어요! 7 - 2 = 5!" },
      { prompt: "쿠키 9개 중 4개를 먹었어요. 남은 쿠키는 몇 개일까요?", easyPrompt: "9 - 4 는 얼마인가요?", hint: "9에서 4개를 덜어내 보세요.", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "-", second: "4" }; }, choices: [{ label: "4개", value: "4" }, { label: "5개", value: "5" }, { label: "6개", value: "6" }], answer: "5", okMsg: "정답이에요! 5개가 남아요!" },
      { prompt: "6 - 6 은 얼마일까요?", easyPrompt: "6개에서 6개를 다 빼면?", hint: "가진 것을 모두 빼면 0이 돼요.", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "-", second: "6" }; }, choices: [{ label: "0", value: "0" }, { label: "1", value: "1" }, { label: "6", value: "6" }], answer: "0", okMsg: "맞아요! 모두 덜어내면 0이에요!" },
      { prompt: "10 - 3 은 얼마일까요?", easyPrompt: "10에서 3을 빼면?", hint: "10칸 판에서 3칸을 빼 보세요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "-", second: "3" }; }, choices: [{ label: "6", value: "6" }, { label: "7", value: "7" }, { label: "8", value: "8" }], answer: "7", okMsg: "훌륭해요! 10 - 3 = 7!" },
      { prompt: "풍선 8개 중 5개가 날아갔어요. 남은 풍선은 몇 개일까요?", easyPrompt: "8 - 5 는 얼마인가요?", hint: "8에서 5를 덜어내면 3이 남아요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "-", second: "5" }; }, choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "3", okMsg: "딩동댕! 3개가 남아요!" }
    ]
  },

  8: {
    examples: [
      {
        title: "예시 1: 10을 먼저 만들어 더하기 (7 + 5)",
        problem: "7 + 5 를 계산할 때, 7을 먼저 10으로 만들면 아주 쉬워요!",
        visual: "<span>7 + (3 + 2)</span> <span>➡️</span> <span>(7 + 3) + 2 = 12</span>",
        steps: [
          "7이 10이 되려면 3이 필요해요.",
          "5에서 3을 빌려와 7에 주면 10이 되고, 2가 남아요.",
          "정답: 10과 2를 합쳐서 12!"
        ],
        speakText: "7에 3을 먼저 더해 10을 만들고, 남은 2를 더하면 12가 됩니다."
      },
      {
        title: "예시 2: 9에 더할 때는 1만 빌려오기 (9 + 4)",
        problem: "9 + 4 는 어떻게 10을 만들까요?",
        visual: "<span>9 + 1 = 10</span> <span>➡️</span> <span>10 + 3 = 13</span>",
        steps: [
          "9가 10이 되려면 딱 1개만 필요해요.",
          "4에서 1을 옮기면 10이 되고, 3이 남아요.",
          "정답: 10 + 3 = 13!"
        ],
        speakText: "9에 1을 더해 10을 만들면 남은 3과 합쳐 13이 됩니다."
      }
    ],
    problems: [
      { prompt: "7이 10이 되려면 몇 개를 더 채워야 할까요?", easyPrompt: "7 + □ = 10", hint: "10칸 판에서 7칸을 채우면 빈칸은 3칸이에요.", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "+", second: "5" }; }, choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "3", okMsg: "정답! 7에 3을 더하면 10이에요!" },
      { prompt: "7 + 5 는 얼마일까요?", easyPrompt: "10을 먼저 만들고 남은 2를 더해요.", hint: "10 + 2 = 12예요!", type: "choice", setup: (s) => { s.expr = { first: "7", operator: "+", second: "5" }; }, choices: [{ label: "11", value: "11" }, { label: "12", value: "12" }, { label: "13", value: "13" }], answer: "12", okMsg: "멋져요! 7 + 5 = 12!" },
      { prompt: "8 + 4 는 얼마일까요?", easyPrompt: "8에서 2를 채워 10을 만들어요.", hint: "4에서 2를 주면 10이 되고 2가 남아요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "+", second: "4" }; }, choices: [{ label: "11", value: "11" }, { label: "12", value: "12" }, { label: "13", value: "13" }], answer: "12", okMsg: "정답이에요! 8 + 4 = 12!" },
      { prompt: "9 + 6 은 얼마일까요?", easyPrompt: "9에 1을 더해 10을 만들어요.", hint: "10과 5를 모으면 15예요!", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "+", second: "6" }; }, choices: [{ label: "14", value: "14" }, { label: "15", value: "15" }, { label: "16", value: "16" }], answer: "15", okMsg: "완벽해요! 9 + 6 = 15!" },
      { prompt: "6 + 5 는 얼마일까요?", easyPrompt: "6을 10으로 만들면 몇 개가 남나요?", hint: "6 + 4 = 10, 남은 1을 더하면 11!", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "+", second: "5" }; }, choices: [{ label: "10", value: "10" }, { label: "11", value: "11" }, { label: "12", value: "12" }], answer: "11", okMsg: "딩동댕! 6 + 5 = 11!" },
      { prompt: "8 + 6 은 얼마일까요?", easyPrompt: "8 + 2 = 10, 그리고 남은 4를 더해요.", hint: "10과 4를 합쳐 보세요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "+", second: "6" }; }, choices: [{ label: "13", value: "13" }, { label: "14", value: "14" }, { label: "15", value: "15" }], answer: "14", okMsg: "정답! 8 + 6 = 14예요!" }
    ]
  },

  9: {
    examples: [
      {
        title: "예시 1: 2씩 뛰어 세기 (2, 4, 6, 8, 10)",
        problem: "신발을 한 켤레(2짝)씩 세어 볼까요?",
        visual: "<span>2 → 4 → 6 → 8 → 10</span>",
        steps: [
          "2에서 시작해 2칸씩 앞으로 점프해요.",
          "2, 4, 6, 8, 10! 하나씩 건너뛰며 세어요.",
          "정답: 6 다음으로 2씩 뛰어 세면 8이에요!"
        ],
        speakText: "2씩 뛰어 세면 2, 4, 6, 8, 10이 됩니다."
      },
      {
        title: "예시 2: 5씩·10씩 뛰어 세기",
        problem: "손가락 5개씩, 또는 10원 동전처럼 10씩 뛰어 세어 볼까요?",
        visual: "<span>5 → 10 → 15 → 20</span> &nbsp;|&nbsp; <span>10 → 20 → 30</span>",
        steps: [
          "5씩 뛰어 세면 5, 10, 15, 20처럼 끝자리가 5와 0이 번갈아 나와요.",
          "10씩 뛰어 세면 10, 20, 30, 40처럼 십의 자리가 1씩 커져요.",
          "정답: 큰 수를 빠르고 정확하게 셀 수 있어요!"
        ],
        speakText: "5씩 뛰어 세면 5, 10, 15, 20이 되고, 10씩 뛰어 세면 10, 20, 30이 됩니다."
      }
    ],
    problems: [
      { prompt: "2씩 뛰어 셀 때 빈칸에 들어갈 수는?  2, 4, ( ? ), 8", easyPrompt: "4에서 2칸 뛰어 세면 얼마일까요?", hint: "4 다음에 5를 건너뛰고 6!", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "+", second: "2" }; }, choices: [{ label: "5", value: "5" }, { label: "6", value: "6" }, { label: "7", value: "7" }], answer: "6", okMsg: "정답! 2, 4, 6, 8이에요!" },
      { prompt: "5씩 뛰어 셀 때 빈칸에 들어갈 수는?  5, 10, ( ? ), 20", easyPrompt: "10에서 5만큼 더 세면 얼마인가요?", hint: "10에 5를 더하면 15예요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "+", second: "5" }; }, choices: [{ label: "12", value: "12" }, { label: "15", value: "15" }, { label: "18", value: "18" }], answer: "15", okMsg: "잘했어요! 5, 10, 15, 20!" },
      { prompt: "10씩 뛰어 셀 때 30 다음 숫자는 무엇일까요?", easyPrompt: "10, 20, 30 다음은?", hint: "30에 10을 더하면 40이에요.", type: "choice", setup: (s) => { s.expr = { first: "30", operator: "+", second: "10" }; }, choices: [{ label: "35", value: "35" }, { label: "40", value: "40" }, { label: "50", value: "50" }], answer: "40", okMsg: "정답이에요! 10, 20, 30, 40!" },
      { prompt: "양말이 2짝씩 4묶음 있어요. 양말은 모두 몇 짝일까요?", easyPrompt: "2, 4, 6, ... 4번째 수는?", hint: "2씩 4번 뛰어 세어 봐요: 2, 4, 6, 8!", type: "choice", choices: [{ label: "6짝", value: "6" }, { label: "8짝", value: "8" }, { label: "10짝", value: "10" }], answer: "8", okMsg: "멋져요! 모두 8짝이에요!" },
      { prompt: "5씩 3번 뛰어 세면 얼마가 될까요? (5, 10, ? )", easyPrompt: "5, 10 다음 수는?", hint: "10 + 5 = 15!", type: "choice", choices: [{ label: "15", value: "15" }, { label: "20", value: "20" }, { label: "25", value: "25" }], answer: "15", okMsg: "정답! 15예요!" },
      { prompt: "10, 20, 30, 40, ( ? ) — 다음 숫자는 무엇일까요?", easyPrompt: "40에서 10을 더하면?", hint: "40 다음 10 큰 수예요.", type: "choice", choices: [{ label: "45", value: "45" }, { label: "50", value: "50" }, { label: "60", value: "60" }], answer: "50", okMsg: "완벽해요! 50이에요!" }
    ]
  },

  10: {
    examples: [
      {
        title: "예시 1: 수직선에서 앞으로 점프하기 (8 + 7)",
        problem: "8에서 시작해 오른쪽으로 7칸 점프하면 어디에 도착할까요?",
        visual: "<span>8 ➡️ (+2) ➡️ 10 ➡️ (+5) ➡️ 15</span>",
        steps: [
          "수직선의 8 위치에서 출발해요.",
          "오른쪽으로 7칸 점프해 보세요.",
          "정답: 도착한 자리는 15예요!"
        ],
        speakText: "수직선에서 8부터 오른쪽으로 7칸 점프하면 15에 도착합니다."
      },
      {
        title: "예시 2: 수직선에서 뒤로 점프하기 (13 - 5)",
        problem: "13에서 왼쪽으로 5칸 뒤로 점프하면 어디일까요?",
        visual: "<span>13 ⬅️ (-3) ⬅️ 10 ⬅️ (-2) ⬅️ 8</span>",
        steps: [
          "13에서 시작해요.",
          "왼쪽으로 5칸(12, 11, 10, 9, 8) 뒤로 점프해요.",
          "정답: 13 - 5 = 8!"
        ],
        speakText: "13에서 왼쪽으로 5칸 거꾸로 점프하면 8에 도착합니다."
      }
    ],
    problems: [
      { prompt: "수직선에서 보라색 표시를 끌어서 '8 + 4'의 정답 자리에 놓아 보세요!", easyPrompt: "8에서 4칸 점프한 자리에 놓아요.", hint: "8에서 오른쪽으로 4칸 이동하면 12예요.", type: "check", setup: (s) => { s.nlMarker = null; s.expr = { first: "8", operator: "+", second: "4" }; }, check: (s) => s.nlMarker === 12, okMsg: "정확해요! 8 + 4 = 12 자리에 놓았어요!" },
      { prompt: "15 - 6 을 수직선에서 거꾸로 점프해 구하면 얼마일까요?", easyPrompt: "15에서 왼쪽으로 6칸 가면?", hint: "15에서 5를 빼면 10, 1을 더 빼면 9예요!", type: "choice", setup: (s) => { s.expr = { first: "15", operator: "-", second: "6" }; }, choices: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }], answer: "9", okMsg: "정답이에요! 15 - 6 = 9!" },
      { prompt: "수직선에서 보라색 표시를 '6 + 7'의 정답 자리에 놓아 보세요!", easyPrompt: "6 + 7 위치에 놓아요.", hint: "6에서 7칸 오른쪽으로 가면 13이에요.", type: "check", setup: (s) => { s.nlMarker = null; s.expr = { first: "6", operator: "+", second: "7" }; }, check: (s) => s.nlMarker === 13, okMsg: "잘했어요! 6 + 7 = 13!" },
      { prompt: "12 - 5 는 얼마일까요?", easyPrompt: "12에서 뒤로 5칸 점프해요.", hint: "12에서 2를 빼면 10, 3을 더 빼면 7!", type: "choice", setup: (s) => { s.expr = { first: "12", operator: "-", second: "5" }; }, choices: [{ label: "6", value: "6" }, { label: "7", value: "7" }, { label: "8", value: "8" }], answer: "7", okMsg: "맞아요! 12 - 5 = 7!" },
      { prompt: "9 + 8 은 얼마일까요?", easyPrompt: "9에서 8칸 앞으로 가요.", hint: "9에서 1을 가면 10, 7을 더 가면 17이에요!", type: "choice", setup: (s) => { s.expr = { first: "9", operator: "+", second: "8" }; }, choices: [{ label: "16", value: "16" }, { label: "17", value: "17" }, { label: "18", value: "18" }], answer: "17", okMsg: "훌륭해요! 9 + 8 = 17!" },
      { prompt: "14 - 4 는 얼마일까요?", easyPrompt: "14에서 4칸 뒤로 가면?", hint: "낱개 4개가 빠지면 10이 돼요.", type: "choice", setup: (s) => { s.expr = { first: "14", operator: "-", second: "4" }; }, choices: [{ label: "9", value: "9" }, { label: "10", value: "10" }, { label: "11", value: "11" }], answer: "10", okMsg: "정답! 14 - 4 = 10이에요!" }
    ]
  },

  11: {
    examples: [
      {
        title: "예시 1: 두 자리 수 덧셈 (24 + 18)",
        problem: "십모형과 일모형을 이용해 24 + 18 을 계산해 볼까요?",
        visual: "<span>십모형 3개 + 일모형 12개</span> <span>➡️</span> <span>십모형 4개 + 일모형 2개 = 42</span>",
        steps: [
          "십모형끼리 모으면 2 + 1 = 3개(30)예요.",
          "일모형끼리 모으면 4 + 8 = 12개! 10개를 십모형 1개로 묶어 올려요.",
          "정답: 십모형 4개와 일모형 2개로 42예요!"
        ],
        speakText: "일모형 4와 8을 더하면 12가 되어 10개를 십모형 1개로 올려 42가 됩니다."
      },
      {
        title: "예시 2: 두 자리 수 뺄셈 (35 - 12)",
        problem: "35에서 12를 빼면 얼마가 남을까요?",
        visual: "<span>십모형 3-1 = 2개</span> &nbsp;|&nbsp; <span>일모형 5-2 = 3개</span> <span>➡️ 23</span>",
        steps: [
          "일의 자리끼리 5 - 2 = 3을 빼요.",
          "십의 자리끼리 3 - 1 = 2를 빼요.",
          "정답: 35 - 12 = 23!"
        ],
        speakText: "일의 자리 5에서 2를 빼면 3, 십의 자리 3에서 1을 빼면 2, 정답은 23입니다."
      }
    ],
    problems: [
      { prompt: "십모형 2개와 일모형 5개가 나타내는 수는 무엇일까요?", easyPrompt: "십 2개, 일 5개는 얼마인가요?", hint: "20과 5를 합치면 25예요.", type: "choice", setup: (s) => { s.expr = { first: "25", operator: null, second: "" }; }, choices: [{ label: "25", value: "25" }, { label: "52", value: "52" }, { label: "20", value: "20" }], answer: "25", okMsg: "정답! 25예요!" },
      { prompt: "24 + 18 은 얼마일까요?", easyPrompt: "24와 18을 더하면?", hint: "4 + 8 = 12에서 10을 십의 자리로 올리면 42예요!", type: "choice", setup: (s) => { s.expr = { first: "24", operator: "+", second: "18" }; }, choices: [{ label: "32", value: "32" }, { label: "42", value: "42" }, { label: "44", value: "44" }], answer: "42", okMsg: "정답이에요! 24 + 18 = 42!" },
      { prompt: "35 - 12 는 얼마일까요?", easyPrompt: "35에서 12를 빼면?", hint: "십의 자리는 3-1=2, 일의 자리는 5-2=3이에요.", type: "choice", setup: (s) => { s.expr = { first: "35", operator: "-", second: "12" }; }, choices: [{ label: "21", value: "21" }, { label: "23", value: "23" }, { label: "27", value: "27" }], answer: "23", okMsg: "잘했어요! 35 - 12 = 23!" },
      { prompt: "일모형 10개가 모이면 무엇 1개로 바꿀 수 있을까요?", easyPrompt: "일모형 10개는 무엇과 같나요?", hint: "10개가 모이면 '십모형' 1개가 돼요.", type: "choice", choices: [{ label: "십모형 1개", value: "ten" }, { label: "백모형 1개", value: "hundred" }, { label: "일모형 1개", value: "one" }], answer: "ten", okMsg: "맞아요! 일모형 10개는 십모형 1개예요!" },
      { prompt: "41 - 15 는 얼마일까요?", easyPrompt: "41에서 15를 빼면?", hint: "십모형 1개를 빌려 11 - 5 = 6, 남은 30 - 10 = 20!", type: "choice", setup: (s) => { s.expr = { first: "41", operator: "-", second: "15" }; }, choices: [{ label: "26", value: "26" }, { label: "34", value: "34" }, { label: "36", value: "36" }], answer: "26", okMsg: "훌륭해요! 41 - 15 = 26!" },
      { prompt: "16 + 23 은 얼마일까요?", easyPrompt: "16과 23을 더하면?", hint: "일의 자리 6+3=9, 십의 자리 1+2=3이에요.", type: "choice", setup: (s) => { s.expr = { first: "16", operator: "+", second: "23" }; }, choices: [{ label: "38", value: "38" }, { label: "39", value: "39" }, { label: "49", value: "49" }], answer: "39", okMsg: "정답! 16 + 23 = 39!" }
    ]
  },

  12: {
    examples: [
      {
        title: "예시 1: 세 자리 수 덧셈 (125 + 143)",
        problem: "백모형, 십모형, 일모형으로 125 + 143 을 계산해 봐요.",
        visual: "<span>백 2개(200) + 십 6개(60) + 일 8개(8)</span> <span>=</span> <span>268</span>",
        steps: [
          "일의 자리: 5 + 3 = 8",
          "십의 자리: 2 + 4 = 6",
          "백의 자리: 1 + 1 = 2 → 정답은 268이에요!"
        ],
        speakText: "일의 자리 8, 십의 자리 6, 백의 자리 2를 모으면 268이 됩니다."
      },
      {
        title: "예시 2: 100이 되는 십모형 묶음",
        problem: "십모형 10개가 모이면 어떤 수가 될까요?",
        visual: "<span>🔟 × 10개</span> <span>➡️</span> <span>💯 백모형 1개 (100)</span>",
        steps: [
          "10씩 10번 뛰어 세어 봐요: 10, 20, ..., 90, 100!",
          "십모형 10개는 백모형 1개와 크기가 똑같아요.",
          "정답: 100 (백)!"
        ],
        speakText: "십모형 10개가 모이면 백모형 1개, 즉 100이 됩니다."
      }
    ],
    problems: [
      { prompt: "십모형 10개가 모이면 어떤 모형 1개가 될까요?", easyPrompt: "10개씩 10묶음은 얼마인가요?", hint: "10이 10개 모이면 100(백모형)이에요.", type: "choice", choices: [{ label: "백모형 (100)", value: "100" }, { label: "십모형 (10)", value: "10" }, { label: "일모형 (1)", value: "1" }], answer: "100", okMsg: "정답! 10이 10개 모이면 100이에요!" },
      { prompt: "125 + 143 은 얼마일까요?", easyPrompt: "백·십·일 자리끼리 더해요.", hint: "백: 1+1=2, 십: 2+4=6, 일: 5+3=8!", type: "choice", setup: (s) => { s.expr = { first: "125", operator: "+", second: "143" }; }, choices: [{ label: "258", value: "258" }, { label: "268", value: "268" }, { label: "278", value: "278" }], answer: "268", okMsg: "정답이에요! 125 + 143 = 268!" },
      { prompt: "백모형 2개, 십모형 3개, 일모형 4개가 나타내는 수는?", easyPrompt: "200 + 30 + 4 는?", hint: "백 자리 2, 십 자리 3, 일 자리 4를 차례로 적어요.", type: "choice", choices: [{ label: "234", value: "234" }, { label: "243", value: "243" }, { label: "324", value: "324" }], answer: "234", okMsg: "맞아요! 234예요!" },
      { prompt: "250 - 120 은 얼마일까요?", easyPrompt: "250에서 120을 빼면?", hint: "200-100=100, 50-20=30이에요.", type: "choice", setup: (s) => { s.expr = { first: "250", operator: "-", second: "120" }; }, choices: [{ label: "120", value: "120" }, { label: "130", value: "130" }, { label: "140", value: "140" }], answer: "130", okMsg: "잘했어요! 250 - 120 = 130!" },
      { prompt: "100이 3개, 10이 0개, 1이 7개이면 어떤 수일까요?", easyPrompt: "300과 7을 합치면?", hint: "십의 자리가 비어 있으니 0을 써서 307이에요.", type: "choice", choices: [{ label: "37", value: "37" }, { label: "307", value: "307" }, { label: "370", value: "370" }], answer: "307", okMsg: "정확해요! 307이에요!" },
      { prompt: "312 + 105 는 얼마일까요?", easyPrompt: "312에 105를 더하면?", hint: "백: 3+1=4, 십: 1+0=1, 일: 2+5=7!", type: "choice", setup: (s) => { s.expr = { first: "312", operator: "+", second: "105" }; }, choices: [{ label: "417", value: "417" }, { label: "427", value: "427" }, { label: "407", value: "407" }], answer: "417", okMsg: "딩동댕! 312 + 105 = 417!" }
    ]
  },

  13: {
    examples: [
      {
        title: "예시 1: 같은 수씩 묶어 곱셈하기 (3 × 4)",
        problem: "사과가 3개씩 4묶음 있어요. 모두 몇 개일까요?",
        visual: "<span>(🍎🍎🍎) × 4묶음</span> <span>=</span> <span>3+3+3+3 = 12</span>",
        steps: [
          "한 묶음에 사과가 3개씩 있어요.",
          "이런 묶음이 4개 있으니 3 × 4라고 써요.",
          "정답: 모두 세어 보면 12개예요!"
        ],
        speakText: "3개씩 4묶음은 3 곱하기 4로 나타내고, 모두 12개입니다."
      },
      {
        title: "예시 2: 2개씩 묶어 세기 (2 × 5)",
        problem: "과자가 한 접시에 2개씩 5접시 있어요. 모두 몇 개일까요?",
        visual: "<span>🍪🍪 × 5접시</span> <span>➡️</span> <span>2, 4, 6, 8, 10 (10개)</span>",
        steps: [
          "한 접시에 2개씩 들어 있어요.",
          "5접시를 2씩 뛰어 세면 2, 4, 6, 8, 10이에요.",
          "정답: 2 × 5 = 10!"
        ],
        speakText: "2개씩 5접시는 2씩 5번 뛰어 세면 모두 10개가 됩니다."
      }
    ],
    problems: [
      { prompt: "3개씩 4묶음을 아래 빈 자리에 모두 채워 보세요! (3 × 4)", easyPrompt: "3개 묶음 카드를 4곳에 놓아요.", hint: "3개 묶음 카드를 빈 자리 4곳에 모두 놓은 뒤 확인하세요.", type: "check", setup: (s) => { s.mulGroups = []; s.mulKey = ""; s.expr = { first: "3", operator: "×", second: "4" }; }, check: (s) => s.mulGroups.length === 4 && s.mulGroups.every(Boolean), okMsg: "잘했어요! 3개씩 4묶음은 모두 12개예요!" },
      { prompt: "2 × 5 는 얼마일까요?", easyPrompt: "2개씩 5묶음은 모두 몇 개인가요?", hint: "2, 4, 6, 8, 10! 모두 10개예요.", type: "choice", setup: (s) => { s.expr = { first: "2", operator: "×", second: "5" }; }, choices: [{ label: "8", value: "8" }, { label: "10", value: "10" }, { label: "12", value: "12" }], answer: "10", okMsg: "정답! 2 × 5 = 10!" },
      { prompt: "사탕이 한 봉지에 5개씩 3봉지 있어요. 모두 몇 개일까요?", easyPrompt: "5 × 3 은 얼마인가요?", hint: "5 + 5 + 5 = 15예요!", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "×", second: "3" }; }, choices: [{ label: "10개", value: "10" }, { label: "15개", value: "15" }, { label: "20개", value: "20" }], answer: "15", okMsg: "훌륭해요! 모두 15개예요!" },
      { prompt: "4 × 2 는 얼마일까요?", easyPrompt: "4개씩 2묶음은?", hint: "4와 4를 더하면 8이에요.", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "×", second: "2" }; }, choices: [{ label: "6", value: "6" }, { label: "8", value: "8" }, { label: "10", value: "10" }], answer: "8", okMsg: "정답이에요! 4 × 2 = 8!" },
      { prompt: "5 × 4 는 얼마일까요?", easyPrompt: "5개씩 4묶음은?", hint: "5, 10, 15, 20으로 세어 봐요.", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "×", second: "4" }; }, choices: [{ label: "15", value: "15" }, { label: "20", value: "20" }, { label: "25", value: "25" }], answer: "20", okMsg: "완벽해요! 5 × 4 = 20!" },
      { prompt: "3 × 3 은 얼마일까요?", easyPrompt: "3개씩 3묶음은?", hint: "3 + 3 + 3 = 9예요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "×", second: "3" }; }, choices: [{ label: "6", value: "6" }, { label: "9", value: "9" }, { label: "12", value: "12" }], answer: "9", okMsg: "딩동댕! 3 × 3 = 9!" }
    ]
  },

  14: {
    examples: [
      {
        title: "예시 1: 접시에 똑같이 나누기 (12 ÷ 3)",
        problem: "사과 12개를 접시 3개에 똑같이 나누어 담으면 한 접시에 몇 개씩일까요?",
        visual: "<span>12개 ÷ 3접시</span> <span>➡️</span> <span>접시당 4개씩!</span>",
        steps: [
          "접시 3개에 사과를 1개씩 번갈아 담아요.",
          "남은 사과도 똑같이 1개씩 더 담아요.",
          "정답: 모든 접시에 4개씩 들어가요! 12 ÷ 3 = 4"
        ],
        speakText: "12개를 3개의 접시에 하나씩 공평하게 나누어 담으면 한 접시에 4개씩 들어갑니다."
      },
      {
        title: "예시 2: 두 친구에게 공평하게 나누기 (10 ÷ 2)",
        problem: "딸기 10개를 두 친구에게 똑같이 나누어 주면 한 명당 몇 개일까요?",
        visual: "<span>🍓 10개 ÷ 2명</span> <span>=</span> <span>한 명당 5개!</span>",
        steps: [
          "한 명에게 하나씩 번갈아 줘 봐요.",
          "다 나누어 주면 양쪽 다 5개씩 갖게 돼요.",
          "정답: 10 ÷ 2 = 5!"
        ],
        speakText: "딸기 10개를 2명에게 똑같이 나누면 한 명당 5개씩 받습니다."
      }
    ],
    problems: [
      { prompt: "사과 12개를 접시 3개에 똑같이 나누어 담아 보세요! (남은 것 0개)", easyPrompt: "12개를 접시 3개에 똑같이 나누어요.", hint: "접시를 눌러 한 접시에 4개씩 들어가도록 나누어 보세요.", type: "check", setup: (s) => { s.divPlates = []; s.divRem = 0; s.divKey = ""; s.expr = { first: "12", operator: "÷", second: "3" }; }, check: (s) => s.divRem === 0 && s.divPlates.length === 3 && s.divPlates.every((n) => n === 4), okMsg: "공평해요! 한 접시에 4개씩 똑같이 나누었어요!" },
      { prompt: "10 ÷ 2 는 얼마일까요?", easyPrompt: "10개를 2명에게 똑같이 나누면?", hint: "10을 반으로 나누면 5개씩이에요.", type: "choice", setup: (s) => { s.expr = { first: "10", operator: "÷", second: "2" }; }, choices: [{ label: "4개", value: "4" }, { label: "5개", value: "5" }, { label: "6개", value: "6" }], answer: "5", okMsg: "정답! 10 ÷ 2 = 5!" },
      { prompt: "쿠키 8개를 접시 4개에 똑같이 나누면 한 접시에 몇 개일까요?", easyPrompt: "8 ÷ 4 는 얼마인가요?", hint: "4접시에 2개씩 담으면 2×4=8이에요.", type: "choice", setup: (s) => { s.expr = { first: "8", operator: "÷", second: "4" }; }, choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "2", okMsg: "맞아요! 한 접시에 2개씩이에요!" },
      { prompt: "15 ÷ 5 는 얼마일까요?", easyPrompt: "15개를 5곳에 똑같이 나누면?", hint: "5 × 3 = 15이므로 한 곳에 3개씩 들어가요.", type: "choice", setup: (s) => { s.expr = { first: "15", operator: "÷", second: "5" }; }, choices: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }], answer: "3", okMsg: "잘했어요! 15 ÷ 5 = 3!" },
      { prompt: "6 ÷ 3 은 얼마일까요?", easyPrompt: "6개를 3명에게 나누어 주면?", hint: "한 명당 2개씩 주면 2+2+2=6이에요.", type: "choice", setup: (s) => { s.expr = { first: "6", operator: "÷", second: "3" }; }, choices: [{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }], answer: "2", okMsg: "훌륭해요! 6 ÷ 3 = 2!" },
      { prompt: "16 ÷ 4 는 얼마일까요?", easyPrompt: "16개를 4접시에 똑같이 나누면?", hint: "4 × 4 = 16이에요.", type: "choice", setup: (s) => { s.expr = { first: "16", operator: "÷", second: "4" }; }, choices: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }], answer: "4", okMsg: "정답! 16 ÷ 4 = 4!" }
    ]
  },

  15: {
    examples: [
      {
        title: "예시 1: 전체와 부분 — 분수 1/4과 2/4",
        problem: "피자 1판을 똑같이 4조각으로 나누었어요. 1조각과 2조각을 합치면 얼마일까요?",
        visual: "<span>1/4 + 2/4</span> <span>=</span> <span>3/4 (4조각 중 3조각)</span>",
        steps: [
          "전체 4조각 중 1조각은 1/4이에요.",
          "여기에 2조각(2/4)을 더하면 모두 3조각이 돼요.",
          "정답: 분모 4는 그대로 두고 분자끼리 더해 3/4이에요!"
        ],
        speakText: "4분의 1에 4분의 2를 더하면 4조각 중 3조각인 4분의 3이 됩니다."
      },
      {
        title: "예시 2: 반을 나타내는 분수 1/2",
        problem: "피자 1판을 똑같이 2조각으로 나눈 것 중 1조각은 얼마일까요?",
        visual: "<span>🍕 전체 2조각 중 1조각</span> <span>➡️</span> <span>1/2 (반)</span>",
        steps: [
          "전체를 2개로 똑같이 나누면 분모는 2예요.",
          "그중 1조각을 색칠하면 분자는 1이에요.",
          "정답: 1/2 (이분의 일)!"
        ],
        speakText: "전체를 똑같이 2로 나눈 것 중 1개는 2분의 1이라고 읽습니다."
      }
    ],
    problems: [
      { prompt: "피자 1판을 똑같이 4조각으로 나눈 것 중 1조각을 분수로 어떻게 쓸까요?", easyPrompt: "4조각 중 1조각은 무엇인가요?", hint: "아래(분모)가 4, 위(분자)가 1이에요.", type: "choice", choices: [{ label: "1/2", value: "1/2" }, { label: "1/4", value: "1/4" }, { label: "3/4", value: "3/4" }], answer: "1/4", okMsg: "정답! 4조각 중 1조각은 1/4이에요!" },
      { prompt: "1/4 + 2/4 는 얼마일까요?", easyPrompt: "4분의 1과 4분의 2를 더하면?", hint: "조각 수(분자) 1 + 2 = 3이에요.", type: "choice", setup: (s) => { s.fractions = { a: { n: 1, d: 4 }, b: { n: 2, d: 4 } }; }, choices: [{ label: "2/4", value: "2/4" }, { label: "3/4", value: "3/4" }, { label: "4/4", value: "4/4" }], answer: "3/4", okMsg: "정답이에요! 1/4 + 2/4 = 3/4!" },
      { prompt: "1/2 과 1/4 중에서 더 큰 분수는 무엇일까요?", easyPrompt: "반(1/2)과 1/4 중 큰 쪽은?", hint: "피자 1판의 절반(1/2)이 1/4보다 훨씬 커요!", type: "choice", setup: (s) => { s.fractions = { a: { n: 1, d: 2 }, b: { n: 1, d: 4 } }; }, choices: [{ label: "1/2", value: "1/2" }, { label: "1/4", value: "1/4" }, { label: "같아요", value: "eq" }], answer: "1/2", okMsg: "맞아요! 1/2은 2/4와 같아서 1/4보다 커요!" },
      { prompt: "3/5 - 1/5 은 얼마일까요?", easyPrompt: "5분의 3에서 5분의 1을 빼면?", hint: "3조각에서 1조각을 빼면 2조각이 남아요.", type: "choice", setup: (s) => { s.fractions = { a: { n: 3, d: 5 }, b: { n: 1, d: 5 } }; }, choices: [{ label: "1/5", value: "1/5" }, { label: "2/5", value: "2/5" }, { label: "4/5", value: "4/5" }], answer: "2/5", okMsg: "잘했어요! 3/5 - 1/5 = 2/5!" },
      { prompt: "2/4 는 어떤 분수와 크기가 똑같을까요?", easyPrompt: "4조각 중 2조각은 전체의 얼마인가요?", hint: "4조각 중 2조각은 딱 절반(반)이에요!", type: "choice", choices: [{ label: "1/2", value: "1/2" }, { label: "1/3", value: "1/3" }, { label: "1/4", value: "1/4" }], answer: "1/2", okMsg: "완벽해요! 2/4는 1/2과 같아요!" },
      { prompt: "1/3 + 1/3 은 얼마일까요?", easyPrompt: "3분의 1과 3분의 1을 더하면?", hint: "분모 3은 그대로, 1 + 1 = 2예요.", type: "choice", setup: (s) => { s.fractions = { a: { n: 1, d: 3 }, b: { n: 1, d: 3 } }; }, choices: [{ label: "2/3", value: "2/3" }, { label: "1/3", value: "1/3" }, { label: "3/3", value: "3/3" }], answer: "2/3", okMsg: "딩동댕! 1/3 + 1/3 = 2/3!" }
    ]
  },

  16: {
    examples: [
      {
        title: "예시 1: 0.1 단위와 소수 덧셈 (0.4 + 0.3)",
        problem: "전체를 10칸으로 나눈 것 중 4칸(0.4)과 3칸(0.3)을 합치면 얼마일까요?",
        visual: "<span>0.4 + 0.3</span> <span>=</span> <span>0.7 (10칸 중 7칸)</span>",
        steps: [
          "10칸 중 1칸은 분수로 1/10, 소수로 0.1이에요.",
          "0.1이 4개면 0.4, 3개면 0.3이에요.",
          "정답: 소수점을 맞춰 더하면 0.4 + 0.3 = 0.7!"
        ],
        speakText: "0.4와 0.3은 0.1이 4개와 3개이므로 합치면 0.7이 됩니다."
      },
      {
        title: "예시 2: 소수의 크기 비교 (0.6 vs 0.4)",
        problem: "물컵에 물이 0.6L와 0.4L 있어요. 어느 쪽이 더 많을까요?",
        visual: "<span>0.6</span> <span>&gt;</span> <span>0.4</span>",
        steps: [
          "0.6은 0.1이 6개, 0.4는 0.1이 4개예요.",
          "6이 4보다 크므로 0.6이 더 커요.",
          "정답: 0.6 > 0.4!"
        ],
        speakText: "0.6은 0.1이 6개이고 0.4는 4개이므로 0.6이 더 큽니다."
      }
    ],
    problems: [
      { prompt: "전체를 10칸으로 나눈 것 중 1칸(1/10)을 소수로 어떻게 쓸까요?", easyPrompt: "10분의 1은 소수로 무엇인가요?", hint: "0 다음에 점(.)을 찍고 1을 써요.", type: "choice", choices: [{ label: "0.1", value: "0.1" }, { label: "0.5", value: "0.5" }, { label: "1.0", value: "1.0" }], answer: "0.1", okMsg: "정답! 1/10 = 0.1이에요!" },
      { prompt: "0.4 + 0.3 은 얼마일까요?", easyPrompt: "0.1이 4개와 3개를 합치면?", hint: "4 + 3 = 7이므로 0.7이에요.", type: "choice", setup: (s) => { s.expr = { first: "0.4", operator: "+", second: "0.3" }; }, choices: [{ label: "0.6", value: "0.6" }, { label: "0.7", value: "0.7" }, { label: "0.8", value: "0.8" }], answer: "0.7", okMsg: "정답이에요! 0.4 + 0.3 = 0.7!" },
      { prompt: "0.8 - 0.5 는 얼마일까요?", easyPrompt: "0.8에서 0.5를 빼면?", hint: "0.1이 8개에서 5개를 빼면 3개(0.3)가 남아요.", type: "choice", setup: (s) => { s.expr = { first: "0.8", operator: "-", second: "0.5" }; }, choices: [{ label: "0.2", value: "0.2" }, { label: "0.3", value: "0.3" }, { label: "0.4", value: "0.4" }], answer: "0.3", okMsg: "잘했어요! 0.8 - 0.5 = 0.3!" },
      { prompt: "0.5 와 0.2 중에서 더 큰 소수는 무엇일까요?", easyPrompt: "0.5와 0.2 중 큰 수는?", hint: "5칸(0.5)이 2칸(0.2)보다 더 크죠!", type: "choice", choices: [{ label: "0.5", value: "0.5" }, { label: "0.2", value: "0.2" }, { label: "같아요", value: "eq" }], answer: "0.5", okMsg: "맞아요! 0.5가 더 커요!" },
      { prompt: "0.6 + 0.4 는 얼마일까요?", easyPrompt: "0.6과 0.4를 더하면?", hint: "10칸이 모두 차면 자연수 1이 돼요!", type: "choice", setup: (s) => { s.expr = { first: "0.6", operator: "+", second: "0.4" }; }, choices: [{ label: "0.9", value: "0.9" }, { label: "1", value: "1" }, { label: "1.1", value: "1.1" }], answer: "1", okMsg: "훌륭해요! 0.6 + 0.4 = 1이에요!" },
      { prompt: "0.9 - 0.3 은 얼마일까요?", easyPrompt: "0.9에서 0.3을 빼면?", hint: "9 - 3 = 6이므로 0.6이에요.", type: "choice", setup: (s) => { s.expr = { first: "0.9", operator: "-", second: "0.3" }; }, choices: [{ label: "0.5", value: "0.5" }, { label: "0.6", value: "0.6" }, { label: "0.7", value: "0.7" }], answer: "0.6", okMsg: "딩동댕! 0.9 - 0.3 = 0.6!" }
    ]
  },

  17: {
    examples: [
      {
        title: "예시 1: 자로 길이 재기 (cm)",
        problem: "연필의 왼쪽 끝을 자의 숫자 0에 맞추고 오른쪽 끝 눈금을 읽어요.",
        visual: "<span>0 ──────── 12cm</span> <span>➡️</span> <span>길이 12cm</span>",
        steps: [
          "물건의 시작을 반드시 눈금 0에 맞춰요.",
          "물건의 끝이 가리키는 숫자를 읽고 단위 'cm'를 붙여요.",
          "정답: 끝이 12에 닿았으므로 12cm예요!"
        ],
        speakText: "자의 눈금 0부터 시작해 연필 끝이 12에 닿으면 12센티미터입니다."
      },
      {
        title: "예시 2: 비커와 저울로 들이(mL)·무게(g) 재기",
        problem: "물컵 눈금이 600mL를 가리키고, 저울 바늘이 400g을 가리키면 어떻게 읽을까요?",
        visual: "<span>🥛 600mL</span> &nbsp;|&nbsp; <span>⚖️ 400g</span>",
        steps: [
          "물의 양(들이)은 눈금을 평평하게 보고 'mL'로 읽어요.",
          "저울의 바늘이 가리키는 숫자를 보고 'g'으로 읽어요.",
          "정답: 각각 600mL, 400g이에요!"
        ],
        speakText: "물의 양은 밀리리터, 무게는 그램 단위로 눈금을 읽어 줍니다."
      }
    ],
    problems: [
      { prompt: "측정 도구의 '📏 길이' 탭에서 길이를 정확히 15cm로 맞춰 보세요!", easyPrompt: "길이를 15cm로 맞춰요.", hint: "길이 슬라이더나 조절 버튼으로 15cm를 만든 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.measure.tab = "length"; s.measure.length = 10; }, check: (s) => s.measure.length === 15, okMsg: "정확해요! 15cm를 딱 맞췄어요!" },
      { prompt: "자의 0cm에서 시작해 9cm까지 이어진 지우개의 길이는?", easyPrompt: "0부터 9까지 길이는 몇 cm인가요?", hint: "끝 눈금 9에 단위 cm를 붙여 읽어요.", type: "choice", choices: [{ label: "8cm", value: "8" }, { label: "9cm", value: "9" }, { label: "10cm", value: "10" }], answer: "9", okMsg: "정답! 9cm예요!" },
      { prompt: "측정 도구의 '🥛 들이' 탭에서 물의 양을 800mL(8칸)로 맞춰 보세요!", easyPrompt: "비커 물을 800mL로 맞춰요.", hint: "들이 탭으로 바꾼 뒤 800mL가 되게 조절하세요.", type: "check", setup: (s) => { s.measure.tab = "volume"; s.measure.volume = 4; }, check: (s) => s.measure.volume === 8, okMsg: "잘했어요! 물 800mL를 정확히 채웠어요!" },
      { prompt: "측정 도구의 '⚖️ 무게' 탭에서 무게를 500g으로 맞춰 보세요!", easyPrompt: "저울 무게를 500g으로 맞춰요.", hint: "무게 탭에서 슬라이더를 움직여 500g을 맞춘 뒤 확인을 누르세요.", type: "check", setup: (s) => { s.measure.tab = "weight"; s.measure.weight = 300; }, check: (s) => s.measure.weight === 500, okMsg: "정확해요! 500g이에요!" },
      { prompt: "사과 1개는 200g, 배 1개는 350g이에요. 어느 것이 더 무거울까요?", easyPrompt: "200g과 350g 중 더 무거운 것은?", hint: "숫자가 더 큰 350g이 더 무거워요.", type: "choice", choices: [{ label: "사과 (200g)", value: "apple" }, { label: "배 (350g)", value: "pear" }, { label: "같아요", value: "eq" }], answer: "pear", okMsg: "정답! 배가 350g으로 더 무거워요!" },
      { prompt: "물 300mL와 400mL를 한 컵에 합치면 모두 몇 mL일까요?", easyPrompt: "300 + 400 은 얼마인가요?", hint: "3 + 4 = 7이므로 700mL예요.", type: "choice", choices: [{ label: "600mL", value: "600" }, { label: "700mL", value: "700" }, { label: "800mL", value: "800" }], answer: "700", okMsg: "딩동댕! 모두 700mL예요!" }
    ]
  },

  18: {
    examples: [
      {
        title: "예시 1: 정각 읽기 (몇 시)",
        problem: "짧은 바늘이 9를, 긴 바늘이 12를 가리킬 때는 몇 시일까요?",
        visual: "<span>🕒 짧은 바늘 9 · 긴 바늘 12</span> <span>➡️</span> <span>9시 00분</span>",
        steps: [
          "짧은 바늘은 '시'를 알려 주고, 긴 바늘은 '분'을 알려 줘요.",
          "긴 바늘이 12에 있으면 정각(00분)이에요.",
          "정답: 9시!"
        ],
        speakText: "짧은 바늘이 9를, 긴 바늘이 12를 가리키면 9시 정각입니다."
      },
      {
        title: "예시 2: 30분 읽기 (몇 시 30분)",
        problem: "짧은 바늘이 2와 3 사이, 긴 바늘이 6을 가리키면 몇 시 몇 분일까요?",
        visual: "<span>🕝 짧은 바늘 2~3 · 긴 바늘 6</span> <span>➡️</span> <span>2시 30분</span>",
        steps: [
          "긴 바늘이 6을 가리키면 한 바퀴의 반인 30분이에요.",
          "짧은 바늘이 2를 지나 3으로 가고 있으니 2시예요.",
          "정답: 2시 30분!"
        ],
        speakText: "긴 바늘이 6에 있으면 30분이에요. 짧은 바늘이 2와 3 사이에 있으면 2시 30분입니다."
      }
    ],
    problems: [
      { prompt: "시계 도구에서 시계를 '10시 00분'으로 맞춰 보세요!", easyPrompt: "시계를 10시로 맞춰요.", hint: "시계 탭에서 '10시'나 +30분 버튼을 이용해 10:00으로 맞추세요.", type: "check", setup: (s) => { s.measure.tab = "clock"; s.measure.minutes = 540; }, check: (s) => s.measure.minutes === 600, okMsg: "정확해요! 10시 정각이에요!" },
      { prompt: "짧은 바늘이 3, 긴 바늘이 12에 있을 때는 몇 시일까요?", easyPrompt: "짧은 바늘 3, 긴 바늘 12는 몇 시?", hint: "긴 바늘이 12면 정각이에요.", type: "choice", choices: [{ label: "3시", value: "3" }, { label: "12시", value: "12" }, { label: "6시", value: "6" }], answer: "3", okMsg: "정답! 3시예요!" },
      { prompt: "시계 도구에서 시계를 '4시 30분'으로 맞춰 보세요!", easyPrompt: "시계를 4시 30분으로 맞춰요.", hint: "4시에서 +30분 버튼을 눌러 4:30을 만들어 보세요.", type: "check", setup: (s) => { s.measure.tab = "clock"; s.measure.minutes = 240; }, check: (s) => s.measure.minutes === 270, okMsg: "잘했어요! 4시 30분이에요!" },
      { prompt: "긴 바늘이 숫자 6을 가리키고 있을 때는 몇 분일까요?", easyPrompt: "긴 바늘이 6에 있으면 몇 분인가요?", hint: "한 시간(60분)의 반인 30분이에요.", type: "choice", choices: [{ label: "00분", value: "0" }, { label: "30분", value: "30" }, { label: "15분", value: "15" }], answer: "30", okMsg: "맞아요! 30분이에요!" },
      { prompt: "아침에 일어나 학교에 갈 시간은 보통 몇 시일까요?", easyPrompt: "아침 등교 시간에 알맞은 시각은?", hint: "아침 8시~9시쯤 학교에 가요.", type: "choice", choices: [{ label: "아침 8시 30분", value: "830" }, { label: "밤 11시", value: "2300" }, { label: "새벽 3시", value: "300" }], answer: "830", okMsg: "정답! 아침 8시 30분이에요!" },
      { prompt: "점심시간인 12시에서 1시간 뒤는 몇 시일까요?", easyPrompt: "12시에서 1시간 뒤는?", hint: "12시 다음은 다시 1시가 돼요.", type: "choice", choices: [{ label: "1시", value: "1" }, { label: "2시", value: "2" }, { label: "11시", value: "11" }], answer: "1", okMsg: "완벽해요! 1시예요!" }
    ]
  },

  19: {
    examples: [
      {
        title: "예시 1: 동전 모으기 (100원 + 50원 + 10원)",
        problem: "100원 동전 1개와 50원 동전 1개를 모으면 모두 얼마일까요?",
        visual: "<span>🪙 100원 + 🪙 50원</span> <span>=</span> <span>150원</span>",
        steps: [
          "큰 동전인 100원부터 먼저 세어요.",
          "여기에 50원을 더하면 150원이 돼요.",
          "정답: 150원!"
        ],
        speakText: "큰 동전 100원에 50원을 더하면 150원이 됩니다."
      },
      {
        title: "예시 2: 물건 사고 거스름돈 계산하기",
        problem: "500원을 내고 300원짜리 사탕을 사면 거스름돈은 얼마일까요?",
        visual: "<span>500원 - 300원</span> <span>=</span> <span>200원</span>",
        steps: [
          "내가 낸 돈 500원에서 물건 값 300원을 빼요.",
          "500 - 300 = 200이에요.",
          "정답: 거스름돈은 200원이에요!"
        ],
        speakText: "500원을 내고 300원짜리 사탕을 사면 거스름돈으로 200원을 받습니다."
      }
    ],
    problems: [
      { prompt: "동전 도구에서 동전을 눌러 정확히 '150원'을 모아 보세요!", easyPrompt: "동전으로 150원을 만들어요.", hint: "100원 동전 1개와 50원 동전 1개를 눌러 보세요.", type: "check", setup: (s) => { s.measure.tab = "money"; s.measure.coins = { 10: 0, 50: 0, 100: 0, 500: 0 }; }, check: (s) => (s.measure.coins[10] * 10 + s.measure.coins[50] * 50 + s.measure.coins[100] * 100 + s.measure.coins[500] * 500) === 150, okMsg: "정확해요! 150원을 잘 모았어요!" },
      { prompt: "100원 동전이 3개 있으면 모두 얼마일까요?", easyPrompt: "100원 3개는 얼마인가요?", hint: "100, 200, 300원이에요!", type: "choice", choices: [{ label: "200원", value: "200" }, { label: "300원", value: "300" }, { label: "500원", value: "500" }], answer: "300", okMsg: "정답! 300원이에요!" },
      { prompt: "동전 도구에서 동전을 눌러 '620원'을 만들어 보세요!", easyPrompt: "동전으로 620원을 만들어요.", hint: "500원 1개 + 100원 1개 + 10원 2개를 눌러 보세요.", type: "check", setup: (s) => { s.measure.tab = "money"; s.measure.coins = { 10: 0, 50: 0, 100: 0, 500: 0 }; }, check: (s) => (s.measure.coins[10] * 10 + s.measure.coins[50] * 50 + s.measure.coins[100] * 100 + s.measure.coins[500] * 500) === 620, okMsg: "대단해요! 620원을 정확히 만들었어요!" },
      { prompt: "500원을 내고 200원짜리 지우개를 사면 거스름돈은 얼마일까요?", easyPrompt: "500 - 200 은 얼마인가요?", hint: "500에서 200을 빼면 300원이에요.", type: "choice", choices: [{ label: "200원", value: "200" }, { label: "300원", value: "300" }, { label: "400원", value: "400" }], answer: "300", okMsg: "맞아요! 거스름돈은 300원이에요!" },
      { prompt: "50원 동전 2개를 모으면 어떤 동전 1개와 금액이 같을까요?", easyPrompt: "50원 + 50원 은 얼마인가요?", hint: "50 + 50 = 100원이에요!", type: "choice", choices: [{ label: "10원", value: "10" }, { label: "100원", value: "100" }, { label: "500원", value: "500" }], answer: "100", okMsg: "정답! 100원 동전과 같아요!" },
      { prompt: "300원짜리 우유와 400원짜리 빵을 사려면 모두 얼마가 필요할까요?", easyPrompt: "300원 + 400원 은 얼마인가요?", hint: "300 + 400 = 700원이에요.", type: "choice", choices: [{ label: "600원", value: "600" }, { label: "700원", value: "700" }, { label: "800원", value: "800" }], answer: "700", okMsg: "완벽해요! 모두 700원이 필요해요!" }
    ]
  },

  20: {
    examples: [
      {
        title: "예시 1: 도형의 변과 꼭짓점 세기",
        problem: "세모(삼각형)와 네모(사각형)는 변과 꼭짓점이 각각 몇 개일까요?",
        visual: "<span>🔺 변 3개 · 꼭짓점 3개</span> &nbsp;|&nbsp; <span>🟦 변 4개 · 꼭짓점 4개</span>",
        steps: [
          "도형의 곧은 선을 '변', 뾰족하게 만나는 점을 '꼭짓점'이라고 해요.",
          "세모(🔺)는 변이 3개, 꼭짓점이 3개예요.",
          "정답: 네모(🟦)는 변과 꼭짓점이 모두 4개예요!"
        ],
        speakText: "세모는 변과 꼭짓점이 3개씩, 네모는 변과 꼭짓점이 4개씩 있습니다."
      },
      {
        title: "예시 2: 반복되는 무늬 규칙 찾기",
        problem: "🔴 → 🟦 → 🔴 → 🟦 → ( ? ) 다음에 올 모양은 무엇일까요?",
        visual: "<span>🔴 🟦 | 🔴 🟦 | ❓</span>",
        steps: [
          "무늬가 '동그라미, 네모' 순서로 2개씩 반복돼요.",
          "네모(🟦) 다음에는 다시 동그라미(🔴)가 나와야 해요.",
          "정답: 🔴 동그라미!"
        ],
        speakText: "동그라미와 네모가 번갈아 나오므로 네모 다음에는 동그라미가 옵니다."
      }
    ],
    problems: [
      { prompt: "삼각형(🔺)의 변과 꼭짓점은 각각 몇 개일까요?", easyPrompt: "세모의 변은 몇 개인가요?", hint: "곧은 선 3개가 만나 삼각형을 만들어요.", type: "choice", choices: [{ label: "2개", value: "2" }, { label: "3개", value: "3" }, { label: "4개", value: "4" }], answer: "3", okMsg: "정답! 삼각형은 변과 꼭짓점이 3개씩이에요!" },
      { prompt: "사각형(🟦)의 꼭짓점은 모두 몇 개일까요?", easyPrompt: "네모의 뾰족한 꼭짓점은 몇 개인가요?", hint: "네 귀퉁이를 하나씩 세어 보세요.", type: "choice", choices: [{ label: "3개", value: "3" }, { label: "4개", value: "4" }, { label: "5개", value: "5" }], answer: "4", okMsg: "맞아요! 사각형은 꼭짓점이 4개예요!" },
      { prompt: "도형 보드에 도형을 3개 이상 놓아 멋진 그림을 만들어 보세요!", easyPrompt: "도형을 보드로 3개 끌어요.", hint: "도형 탭에서 원하는 도형을 눌러 보드에 3개 이상 놓은 뒤 확인하세요.", type: "check", setup: (s) => { s.shapeTab = "shape"; s.shapeBoard = []; }, check: (s) => s.shapeBoard.length >= 3, okMsg: "멋진 도형 작품이 완성되었어요!" },
      { prompt: "🔴 → 🟦 → 🔴 → 🟦 → ( ? ) — 다음에 올 모양은 무엇일까요?", easyPrompt: "빈칸에 들어갈 모양을 고르세요.", hint: "동그라미와 네모가 번갈아 나와요.", type: "choice", choices: [{ label: "🔴 동그라미", value: "circle" }, { label: "🟦 네모", value: "square" }, { label: "🔺 세모", value: "tri" }], answer: "circle", okMsg: "정답이에요! 🔴 동그라미 차례예요!" },
      { prompt: "🔺 → 🔺 → ⭐ → 🔺 → 🔺 → ( ? ) — 다음에 올 모양은?", easyPrompt: "세모, 세모, 별 다음은?", hint: "세모 2개 다음에 별 1개가 반복돼요.", type: "choice", choices: [{ label: "🔺 세모", value: "tri" }, { label: "⭐ 별", value: "star" }, { label: "🔴 동그라미", value: "circle" }], answer: "star", okMsg: "잘했어요! ⭐ 별 차례예요!" },
      { prompt: "다음 중 뾰족한 꼭짓점이 하나도 없는 도형은 무엇일까요?", easyPrompt: "둥글어서 꼭짓점이 없는 도형은?", hint: "동그란 원(🔴)은 뾰족한 부분이 없어요.", type: "choice", choices: [{ label: "🔺 세모", value: "tri" }, { label: "🟦 네모", value: "sq" }, { label: "🔴 동그라미", value: "circle" }], answer: "circle", okMsg: "정답! 동그라미는 꼭짓점이 없어요!" }
    ]
  },

  21: {
    examples: [
      {
        title: "예시 1: 그림 그래프 읽기와 차이 구하기",
        problem: "사과 5개, 바나나 3개, 포도 4개가 있어요. 가장 많은 과일과 적은 과일의 차이는?",
        visual: "<span>🍎 5개 · 🍇 4개 · 🍌 3개</span> <span>➡️</span> <span>5 - 3 = 2개 차이</span>",
        steps: [
          "막대가 가장 긴 과일은 사과(5개), 가장 짧은 과일은 바나나(3개)예요.",
          "차이를 구할 때는 큰 수에서 작은 수를 빼요.",
          "정답: 5 - 3 = 2개 차이!"
        ],
        speakText: "가장 많은 사과는 5개, 가장 적은 바나나는 3개이므로 5 빼기 3은 2개 차이입니다."
      },
      {
        title: "예시 2: 전체 개수 구하기",
        problem: "사과 2개, 바나나 3개, 포도 4개가 있다면 과일은 모두 몇 개일까요?",
        visual: "<span>2 + 3 + 4</span> <span>=</span> <span>모두 9개!</span>",
        steps: [
          "각 칸의 숫자를 모두 모아요.",
          "2 + 3 = 5, 여기에 4를 더하면 9예요.",
          "정답: 모두 9개!"
        ],
        speakText: "2개와 3개와 4개를 모두 더하면 과일은 총 9개가 됩니다."
      }
    ],
    problems: [
      { prompt: "그래프에서 사과가 5개, 바나나가 3개, 포도가 4개라면 가장 많은 과일은?", easyPrompt: "제일 개수가 많은 과일을 고르세요.", hint: "5개가 가장 큰 수예요.", type: "choice", setup: (s) => { s.data = { apple: 5, banana: 3, grape: 4, answer: null, solved: false, wordSolved: false }; }, choices: [{ label: "🍎 사과 (5개)", value: "apple" }, { label: "🍌 바나나 (3개)", value: "banana" }, { label: "🍇 포도 (4개)", value: "grape" }], answer: "apple", okMsg: "정답! 사과가 5개로 가장 많아요!" },
      { prompt: "사과 5개와 바나나 3개의 차이는 몇 개일까요?", easyPrompt: "5 - 3 은 얼마인가요?", hint: "가장 많은 수 5에서 3을 빼 보세요.", type: "choice", setup: (s) => { s.expr = { first: "5", operator: "-", second: "3" }; }, choices: [{ label: "1개", value: "1" }, { label: "2개", value: "2" }, { label: "3개", value: "3" }], answer: "2", okMsg: "정확해요! 5 - 3 = 2개 차이예요!" },
      { prompt: "바나나(3개)와 포도(4개)를 합치면 모두 몇 개일까요?", easyPrompt: "3 + 4 는 얼마인가요?", hint: "3과 4를 모으면 7이에요.", type: "choice", setup: (s) => { s.expr = { first: "3", operator: "+", second: "4" }; }, choices: [{ label: "6개", value: "6" }, { label: "7개", value: "7" }, { label: "8개", value: "8" }], answer: "7", okMsg: "잘했어요! 모두 7개예요!" },
      { prompt: "아래 과일 그래프에서 🍎 사과 막대를 6개로 만들어 보세요!", easyPrompt: "그래프의 사과를 6개로 만들어요.", hint: "과일 그래프의 사과 '+' 버튼을 눌러 6개로 맞춘 뒤 확인하세요.", type: "check", setup: (s) => { s.data = { apple: 3, banana: 3, grape: 4, answer: null, solved: false, wordSolved: false }; }, check: (s) => s.data.apple === 6, okMsg: "완벽해요! 사과 막대가 6칸이 되었어요!" },
      { prompt: "사과 5개, 바나나 3개, 포도 4개 중에서 가장 적은 과일은 무엇일까요?", easyPrompt: "제일 개수가 적은 과일은?", hint: "3개가 가장 작은 수예요.", type: "choice", choices: [{ label: "🍎 사과", value: "apple" }, { label: "🍌 바나나", value: "banana" }, { label: "🍇 포도", value: "grape" }], answer: "banana", okMsg: "딩동댕! 바나나가 3개로 가장 적어요!" },
      { prompt: "과일 바구니에 사과 4개와 오렌지 3개를 담으면 모두 몇 개일까요?", easyPrompt: "4 + 3 은 얼마인가요?", hint: "4에서 5, 6, 7 하고 세어 보세요.", type: "choice", setup: (s) => { s.expr = { first: "4", operator: "+", second: "3" }; }, choices: [{ label: "6개", value: "6" }, { label: "7개", value: "7" }, { label: "8개", value: "8" }], answer: "7", okMsg: "정답! 모두 7개예요!" }
    ]
  }
};

window.STEPMATH_CUSTOM_KEY = "stepmath.custom_content.v1";

function getCustomStepMathContent() {
  try {
    const raw = localStorage.getItem(window.STEPMATH_CUSTOM_KEY);
    if (!raw) return { examples: {}, problems: {} };
    const parsed = JSON.parse(raw);
    return {
      examples: parsed && parsed.examples ? parsed.examples : {},
      problems: parsed && parsed.problems ? parsed.problems : {}
    };
  } catch (_) {
    return { examples: {}, problems: {} };
  }
}

function getStageCurriculum(stageId) {
  const base = STAGE_CURRICULUM[stageId];
  if (!base) return null;
  const custom = getCustomStepMathContent();
  const cExamples = Array.isArray(custom.examples[stageId]) ? custom.examples[stageId] : [];
  const cProblems = Array.isArray(custom.problems[stageId]) ? custom.problems[stageId] : [];
  const baseExamples = Array.isArray(base.examples) ? base.examples : (base.example ? [base.example] : []);
  const examples = cExamples.concat(baseExamples);
  const problems = cProblems.map((p) => ({
    prompt: p.prompt,
    easyPrompt: p.easyPrompt || p.prompt,
    hint: p.hint || "차근차근 다시 생각해 보아요.",
    type: "choice",
    choices: Array.isArray(p.choices) ? p.choices : [],
    answer: p.answer,
    okMsg: p.okMsg || "정답이에요! 정말 잘했어요!"
  })).concat(base.problems || []);
  return { examples, example: examples[0], problems };
}

function applyCurriculumToApp() {
  state.stage = clamp(Number(state.stage) || 6, 1, STAGES.length);
  if (typeof renderNav === "function") renderNav();
  if (typeof renderLessonPath === "function") renderLessonPath();
  if (typeof renderTool === "function") renderTool();
}
