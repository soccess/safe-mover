"use strict";

/* ============================================================
   구조적 수학 문제 자동 생성기 (21단계 조건 기반 생성)
   - 모든 문항은 학생이 오브젝트를 직접 움직여 푸는 조작형(hands-on)
   - 각 문제마다 애니메이션 시범(demo) 경로와 실시간 진행(progress) 제공
   ============================================================ */
(() => {
  const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pickDistinct = (arr, n) => shuffle(arr).slice(0, n);

  function buildProblem(stageId, roundIdx) {
    const id = `${stageId}-${roundIdx}-${Math.random().toString(36).slice(2, 6)}`;
    switch (Number(stageId)) {
      case 1: return genStage1Sort(id, roundIdx);
      case 2: return genStageCount(id, 2, 2, 5, 0, 1);
      case 3: return genStageCount(id, 3, 6, 10, 2, 5);
      case 4: return genStage4Place11_20(id);
      case 5: return genStage5Compare(id, roundIdx);
      case 6: return genStage6ComposeAdd(id);
      case 7: return genStage7ComposeSub(id);
      case 8: return genStage8MakeTen(id);
      case 9: return genStage9SkipCount(id, roundIdx);
      case 10: return genStage10NumberLineOp(id, roundIdx);
      case 11: return genStage11TwoDigitPlace(id, roundIdx);
      case 12: return genStage12ThreeDigitPlace(id, roundIdx);
      case 13: return genStage13Multiply(id);
      case 14: return genStage14Divide(id);
      case 15: return genStage15Fraction(id, roundIdx);
      case 16: return genStage16Decimal(id, roundIdx);
      case 17: return genStage17Measure(id, roundIdx);
      case 18: return genStage18Clock(id, roundIdx);
      case 19: return genStage19Money(id);
      case 20: return genStage20Shape(id, roundIdx);
      case 21: return genStage21Data(id, roundIdx);
      default: return genStage6ComposeAdd(id);
    }
  }

  /* 1단계: 같은 것끼리 분류 (조건: 2~3종 과일, 각 1~3개, 총 3~6개) */
  function genStage1Sort(id, roundIdx) {
    const kinds = roundIdx === 0 ? ["apple", "lemon"] : pickDistinct(["apple", "lemon", "grape"], randInt(2, 3));
    const emojis = { apple: "🍎", lemon: "🍋", grape: "🍇" };
    const names = { apple: "사과", lemon: "레몬", grape: "포도" };
    const items = [];
    const targetCounts = { apple: 0, lemon: 0, grape: 0 };
    kinds.forEach((k) => {
      const cnt = randInt(1, kinds.length === 2 ? 3 : 2);
      targetCounts[k] = cnt;
      for (let i = 0; i < cnt; i++) items.push({ kind: k, rid: `${k}-${i}-${Math.random().toString(36).slice(2, 5)}` });
    });
    const shuffled = shuffle(items);
    const firstKind = shuffled[0].kind;
    const goalBadges = kinds.map((k) => `${emojis[k]}×${targetCounts[k]}`);
    return {
      id,
      stageId: 1,
      goalBadges,
      prompt: "같은 과일끼리 바구니에 담아요",
      speakText: "같은 과일끼리 바구니에 끌어다 놓아요",
      okMsg: "모든 과일을 알맞은 바구니에 모았어요!",
      demo: {
        from: `[data-sort-item][data-kind="${firstKind}"]`,
        to: `[data-drop="basket:${firstKind}"]`,
        emoji: emojis[firstKind],
        hint: `${names[firstKind]} 바구니로 끌어다 놓아요`
      },
      setup: (s) => {
        s.sort = { items: shuffled.map((x) => ({ ...x })), counts: { apple: 0, lemon: 0, grape: 0 }, done: false };
      },
      check: (s) => s.sort.items.length === 0,
      progress: (s) => {
        const next = s.sort.items[0];
        const placed = Object.values(s.sort.counts).reduce((a, b) => a + b, 0);
        const total = placed + s.sort.items.length;
        return {
          current: placed,
          target: total,
          fromSelector: next ? `[data-sort-item="0"]` : null,
          toSelector: next ? `[data-drop="basket:${next.kind}"]` : null
        };
      }
    };
  }

  /* 2~3단계: 1~5 / 6~10 세기 (조건: 시작 < 목표) */
  function genStageCount(id, stageId, minT, maxT, minS, maxS) {
    const target = randInt(minT, maxT);
    const start = randInt(minS, Math.min(maxS, target - 1));
    const dots = "●".repeat(target);
    return {
      id,
      stageId,
      goalBadges: [`🎯 ${target}`, target <= 5 ? dots : `5 + ${target - 5}`],
      prompt: `점을 ${target}개 만들어요`,
      speakText: `파란 점을 끌어 ${target}개를 만들어요`,
      okMsg: `하나씩 세어 ${target}개를 완성했어요!`,
      demo: {
        from: `[data-count-token="1"]`,
        to: `[data-ten="${start}"]`,
        emoji: "🔵",
        hint: "파란 점을 칸에 끌어놓아요"
      },
      setup: (s) => {
        s.expr = { first: String(start), operator: null, second: "" };
        s.countTarget = target;
      },
      check: (s) => Number(s.expr.first) === target,
      progress: (s) => {
        const cur = Number(s.expr.first) || 0;
        return {
          current: cur,
          target,
          fromSelector: cur < target ? `[data-count-token="1"]` : `[data-cell-fill]`,
          toSelector: cur < target ? `[data-ten="${cur}"]` : `[data-drop="count-minus"]`
        };
      }
    };
  }

  /* 4단계: 11~20 세기 (조건: 십 1개 + 낱개 1~9개) */
  function genStage4Place11_20(id) {
    const u = randInt(1, 9);
    const target = 10 + u;
    return {
      id,
      stageId: 4,
      goalBadges: [`🎯 ${target}`, `🟩 1`, `🟦 ${u}`],
      prompt: `십 1개와 일 ${u}개로 ${target}을 만들어요`,
      speakText: `십 모형 한 개와 일 모형 ${u}개를 놓아 ${target}을 만들어요`,
      okMsg: `10과 ${u}를 모아 ${target}을 만들었어요!`,
      demo: {
        from: `[data-place-source="10"]`,
        to: `[data-drop="place:tens"]`,
        emoji: "🟩",
        hint: "십 모형은 십의 자리에 놓아요"
      },
      setup: (s) => {
        s.parts = { hundreds: 0, tens: 0, units: 0 };
        s.placeTarget = { hundreds: 0, tens: 1, units: u, total: target };
      },
      check: (s) => totalOf(s.parts) === target && s.parts.tens === 1 && s.parts.units === u,
      progress: (s) => {
        const needTen = s.parts.tens < 1;
        return {
          current: totalOf(s.parts),
          target,
          fromSelector: needTen ? `[data-place-source="10"]` : `[data-place-source="1"]`,
          toSelector: needTen ? `[data-drop="place:tens"]` : `[data-drop="place:units"]`
        };
      }
    };
  }

  /* 5단계: 크기 비교 (조건: 짝짓기 후 부등호/등호 끌어넣기 또는 양쪽 같게 맞추기) */
  function genStage5Compare(id, roundIdx) {
    const equalize = roundIdx % 3 === 2;
    if (equalize) {
      const target = randInt(4, 8);
      const bStart = target >= 6 ? target - randInt(2, 3) : target + randInt(1, 2);
      return {
        id,
        stageId: 5,
        mode: "equalize",
        goalBadges: [`🔵 ${target}`, `=`, `🟢 ?`],
        prompt: `오른쪽도 ${target}개로 똑같이 맞춰요`,
        speakText: `오른쪽 접시도 ${target}개로 똑같이 맞추어요`,
        okMsg: `양쪽 모두 ${target}개로 똑같아요!`,
        demo: {
          from: bStart < target ? `[data-cmp-token="b"]` : `[data-cmp-move="b"]`,
          to: bStart < target ? `[data-drop="cmp:b"]` : `[data-drop="cmp-minus"]`,
          emoji: "🟢",
          hint: "점을 끌어 양쪽 개수를 똑같이 맞춰요"
        },
        setup: (s) => {
          s.compare = { a: target, b: bStart, sign: null, expectedSign: "=" };
        },
        check: (s) => s.compare.a === target && s.compare.b === target,
        progress: (s) => ({
          current: s.compare.b,
          target,
          fromSelector: s.compare.b < target ? `[data-cmp-token="b"]` : `[data-cmp-move="b"]`,
          toSelector: s.compare.b < target ? `[data-drop="cmp:b"]` : `[data-drop="cmp-minus"]`
        })
      };
    }
    const a = randInt(2, 8);
    let b = randInt(2, 8);
    if (a === b && roundIdx % 2 === 0) b = a === 8 ? 5 : a + 2;
    const expected = a > b ? ">" : a < b ? "<" : "=";
    return {
      id,
      stageId: 5,
      mode: "sign",
      goalBadges: [`🔵 ${a}`, `❓`, `🟢 ${b}`],
      prompt: "알맞은 기호를 가운데에 놓아요",
      speakText: `${a}와 ${b}를 보고 알맞은 기호를 가운데에 끌어다 놓아요`,
      okMsg: `정답이에요! ${a} ${expected} ${b}!`,
      demo: {
        from: `[data-cmp-sign="${expected}"]`,
        to: `[data-drop="cmp-sign"]`,
        emoji: expected,
        hint: "더 큰 쪽으로 입이 벌어지는 기호를 끌어요"
      },
      setup: (s) => {
        s.compare = { a, b, sign: null, expectedSign: expected };
      },
      check: (s) => s.compare.sign === expected,
      progress: () => ({
        current: 0,
        target: 1,
        fromSelector: `[data-cmp-sign="${expected}"]`,
        toSelector: `[data-drop="cmp-sign"]`
      })
    };
  }

  /* 6단계: 두 수 모으기 (조건: a, b ∈ [1..5], 합 <= 9) */
  function genStage6ComposeAdd(id) {
    const a = randInt(1, 5);
    const b = randInt(1, Math.min(5, 9 - a));
    const total = a + b;
    return {
      id,
      stageId: 6,
      mode: "gather",
      goalBadges: [`${a} + ${b} = ?`],
      prompt: `초록 점 ${b}개를 모두 왼쪽으로 모아요`,
      speakText: `초록 점 ${b}개를 왼쪽 칸으로 끌어와 모두 몇 개인지 보아요`,
      okMsg: `${a}와 ${b}를 모으니 ${total}이에요!`,
      demo: {
        from: `[data-cell-fill][data-frame="composeB"]`,
        to: `[data-drop="composeA"]`,
        emoji: "🟢",
        hint: "오른쪽 점을 왼쪽 칸으로 끌어 모아요"
      },
      setup: (s) => {
        s.composeGather = { a, b, moved: 0 };
        s.composeRemoved = 0;
        s.composeBaseA = null;
        s.expr = { first: String(a), operator: "+", second: String(b) };
      },
      check: (s) => Boolean(s.composeGather && s.composeGather.moved >= b),
      progress: (s) => ({
        current: s.composeGather ? s.composeGather.moved : 0,
        target: b,
        fromSelector: `[data-cell-fill][data-frame="composeB"]`,
        toSelector: `[data-drop="composeA"]`
      })
    };
  }

  /* 7단계: 수 가르기 / 빼기 (조건: a ∈ [4..9], b ∈ [1..a-1]) */
  function genStage7ComposeSub(id) {
    const a = randInt(4, 9);
    const b = randInt(1, Math.min(5, a - 1));
    return {
      id,
      stageId: 7,
      mode: "subtract",
      goalBadges: [`${a} − ${b} = ?`],
      prompt: `점 ${b}개를 빨간 칸으로 덜어내요`,
      speakText: `${a}개에서 ${b}개를 빨간 칸으로 끌어 빼 보아요`,
      okMsg: `${a}에서 ${b}를 빼면 ${a - b}이 남아요!`,
      demo: {
        from: `[data-cell-fill][data-frame="composeA"]`,
        to: `[data-drop="compose-minus"]`,
        emoji: "🔵",
        hint: "점을 오른쪽 빨간 칸으로 끌어요"
      },
      setup: (s) => {
        s.composeGather = null;
        s.composeRemoved = 0;
        s.composeBaseA = a;
        s.expr = { first: String(a), operator: "-", second: String(b) };
      },
      check: (s) => s.composeRemoved === b,
      progress: (s) => ({
        current: s.composeRemoved,
        target: b,
        fromSelector: `[data-cell-fill][data-frame="composeA"]`,
        toSelector: `[data-drop="compose-minus"]`
      })
    };
  }

  /* 8단계: 10 만들어 더하기 (조건: a ∈ [6..9], b ∈ [2..9], a + b > 10) */
  function genStage8MakeTen(id) {
    const a = randInt(6, 9);
    const need = 10 - a;
    const b = randInt(need + 1, Math.min(9, need + 5));
    const total = a + b;
    return {
      id,
      stageId: 8,
      goalBadges: [`${a} + ${b}`, `🔟 + ${b - need}`],
      prompt: `점 ${need}개를 왼쪽으로 옮겨 10을 만들어요`,
      speakText: `초록 점 ${need}개를 왼쪽 빈칸으로 끌어 10을 먼저 만들어요`,
      okMsg: `10과 ${b - need}를 모아 ${total}이 되었어요!`,
      demo: {
        from: `[data-cell-fill][data-frame="mtRight"]`,
        to: `[data-drop="mtLeft"]`,
        emoji: "🟢",
        hint: "초록 점을 왼쪽 빈칸으로 끌어 10을 만들어요"
      },
      setup: (s) => {
        s.expr = { first: String(a), operator: "+", second: String(b) };
        s.makeTenTarget = total;
      },
      check: (s) => Number(s.expr.first) === 10 && Number(s.expr.first) + Number(s.expr.second) === total,
      progress: (s) => {
        const curA = Number(s.expr.first) || 0;
        return {
          current: Math.max(0, curA - a),
          target: need,
          fromSelector: `[data-cell-fill][data-frame="mtRight"]`,
          toSelector: `[data-drop="mtLeft"]`
        };
      }
    };
  }

  /* 9단계: 2씩·5씩·10씩 뛰어 세기 (조건: 0~20 수직선) */
  function genStage9SkipCount(id, roundIdx) {
    const step = [2, 5, 10][roundIdx % 3];
    const start = step === 2 ? pick([0, 2, 4]) : step === 5 ? pick([0, 5]) : 0;
    const jumps = step === 10 ? 2 : step === 5 ? randInt(2, 3) : randInt(3, 4);
    const target = Math.min(20, start + step * jumps);
    const seq = [];
    for (let v = start; v < target; v += step) seq.push(v);
    return {
      id,
      stageId: 9,
      goalBadges: [`${seq.join(" → ")} → 🎯`, `+${step}씩`],
      prompt: `개구리를 ${step}씩 뛰어 ${target}에 놓아요`,
      speakText: `개구리를 ${step}씩 뛰어 세며 ${target} 자리에 놓아요`,
      okMsg: `${step}씩 뛰어 세어 ${target}에 도착했어요!`,
      demo: {
        from: `[data-nl-marker]`,
        to: `[data-drop="nl:${Math.min(20, start + step)}"]`,
        emoji: "🐸",
        hint: "개구리를 오른쪽으로 끌어 점프해요"
      },
      setup: (s) => {
        s.strategy = "forward";
        s.nlStart = start;
        s.nlTarget = target;
        s.nlStep = step;
        s.nlBase = start;
        s.nlMarker = start;
        s.expr = { first: String(start), operator: "+", second: String(target - start) };
      },
      check: (s) => s.nlMarker === target,
      progress: (s) => ({
        current: s.nlMarker ?? start,
        target,
        fromSelector: `[data-nl-marker]`,
        toSelector: `[data-drop="nl:${target}"]`
      })
    };
  }

  /* 10단계: 수직선 점프 계산 (조건: 0~20 범위 내 + / -) */
  function genStage10NumberLineOp(id, roundIdx) {
    const isSub = roundIdx % 2 === 1;
    const a = isSub ? randInt(9, 18) : randInt(3, 12);
    const b = isSub ? randInt(2, Math.min(7, a - 1)) : randInt(2, Math.min(8, 20 - a));
    const op = isSub ? "-" : "+";
    const target = isSub ? a - b : a + b;
    return {
      id,
      stageId: 10,
      goalBadges: [`${a} ${op} ${b} = ?`],
      prompt: `${a}에서 ${isSub ? "뒤로" : "앞으로"} ${b}칸 점프해요`,
      speakText: `개구리를 ${a}에서 ${isSub ? "왼쪽으로" : "오른쪽으로"} ${b}칸 끌어 놓아요`,
      okMsg: `${a} ${op} ${b} = ${target} 자리에 정확히 도착했어요!`,
      demo: {
        from: `[data-nl-marker]`,
        to: `[data-drop="nl:${isSub ? Math.max(0, a - 2) : Math.min(20, a + 2)}"]`,
        emoji: "🐸",
        hint: `개구리를 ${isSub ? "왼쪽" : "오른쪽"}으로 끌어요`
      },
      setup: (s) => {
        s.strategy = isSub ? "back" : "forward";
        s.nlStart = a;
        s.nlTarget = target;
        s.nlStep = 1;
        s.nlBase = a;
        s.nlMarker = a;
        s.expr = { first: String(a), operator: op, second: String(b) };
      },
      check: (s) => s.nlMarker === target,
      progress: (s) => ({
        current: s.nlMarker ?? a,
        target,
        fromSelector: `[data-nl-marker]`,
        toSelector: `[data-drop="nl:${target}"]`
      })
    };
  }

  /* 11단계: 두 자리 수 십·일 묶기 (조건: 수 만들기 또는 일모형 10개→십모형 묶기) */
  function genStage11TwoDigitPlace(id, roundIdx) {
    const doBundle = roundIdx % 2 === 1;
    if (doBundle) {
      const t = randInt(1, 3);
      const u = randInt(11, 15);
      const total = t * 10 + u;
      return {
        id,
        stageId: 11,
        mode: "bundle10",
        goalBadges: [`🟦 ${u}개 → 🟩 묶기`, `총 ${total}`],
        prompt: "일모형 10개를 묶어 십모형으로 바꿔요",
        speakText: "일 모형을 10개 묶기 칸으로 끌어 십 모형으로 묶어요",
        okMsg: `일 10개를 십 1개로 묶어 ${total}을 깔끔하게 나타냈어요!`,
        demo: {
          from: `[data-place-item="units"]`,
          to: `[data-drop="place-bundle10"]`,
          emoji: "🟦",
          hint: "일모형을 10개 묶기 칸으로 끌어요"
        },
        setup: (s) => {
          s.parts = { hundreds: 0, tens: t, units: u };
        },
        check: (s) => totalOf(s.parts) === total && s.parts.units < 10,
        progress: () => ({
          current: 0,
          target: 1,
          fromSelector: `[data-place-item="units"]`,
          toSelector: `[data-drop="place-bundle10"]`
        })
      };
    }
    const t = randInt(2, 5);
    const u = randInt(1, 7);
    const target = t * 10 + u;
    return {
      id,
      stageId: 11,
      mode: "build",
      goalBadges: [`🎯 ${target}`, `🟩 ${t}`, `🟦 ${u}`],
      prompt: `십 ${t}개, 일 ${u}개로 ${target}을 만들어요`,
      speakText: `십 모형 ${t}개와 일 모형 ${u}개를 놓아 ${target}을 만들어요`,
      okMsg: `${t * 10}과 ${u}로 ${target}을 완성했어요!`,
      demo: {
        from: `[data-place-source="10"]`,
        to: `[data-drop="place:tens"]`,
        emoji: "🟩",
        hint: "수모형을 알맞은 자리 칸으로 끌어요"
      },
      setup: (s) => {
        s.parts = { hundreds: 0, tens: 0, units: 0 };
      },
      check: (s) => totalOf(s.parts) === target && s.parts.tens === t && s.parts.units === u,
      progress: (s) => {
        const needT = s.parts.tens < t;
        return {
          current: totalOf(s.parts),
          target,
          fromSelector: needT ? `[data-place-source="10"]` : `[data-place-source="1"]`,
          toSelector: needT ? `[data-drop="place:tens"]` : `[data-drop="place:units"]`
        };
      }
    };
  }

  /* 12단계: 백·십·일 세 자리 수 (조건: 세 자리 만들기 또는 십 10개→백 묶기) */
  function genStage12ThreeDigitPlace(id, roundIdx) {
    const doBundle = roundIdx % 2 === 1;
    if (doBundle) {
      const h = randInt(1, 2);
      const t = randInt(10, 13);
      const u = randInt(1, 4);
      const total = h * 100 + t * 10 + u;
      return {
        id,
        stageId: 12,
        mode: "bundle100",
        goalBadges: [`🟩 ${t}개 → 🟧 묶기`, `총 ${total}`],
        prompt: "십모형 10개를 묶어 백모형으로 바꿔요",
        speakText: "십 모형을 100개 묶기 칸으로 끌어 백 모형으로 묶어요",
        okMsg: `십 10개를 백 1개로 묶어 ${total}을 나타냈어요!`,
        demo: {
          from: `[data-place-item="tens"]`,
          to: `[data-drop="place-bundle100"]`,
          emoji: "🟩",
          hint: "십모형을 100개 묶기 칸으로 끌어요"
        },
        setup: (s) => {
          s.parts = { hundreds: h, tens: t, units: u };
        },
        check: (s) => totalOf(s.parts) === total && s.parts.tens < 10,
        progress: () => ({
          current: 0,
          target: 1,
          fromSelector: `[data-place-item="tens"]`,
          toSelector: `[data-drop="place-bundle100"]`
        })
      };
    }
    const h = randInt(1, 3);
    const t = randInt(1, 4);
    const u = randInt(1, 4);
    const target = h * 100 + t * 10 + u;
    return {
      id,
      stageId: 12,
      mode: "build3",
      goalBadges: [`🎯 ${target}`, `🟧 ${h}`, `🟩 ${t}`, `🟦 ${u}`],
      prompt: `백 ${h} · 십 ${t} · 일 ${u}로 ${target}을 만들어요`,
      speakText: `백 모형 ${h}개, 십 모형 ${t}개, 일 모형 ${u}개를 놓아 ${target}을 만들어요`,
      okMsg: `세 자리 수 ${target}을 정확히 만들었어요!`,
      demo: {
        from: `[data-place-source="100"]`,
        to: `[data-drop="place:hundreds"]`,
        emoji: "🟧",
        hint: "백모형을 백의 자리에 먼저 놓아요"
      },
      setup: (s) => {
        s.parts = { hundreds: 0, tens: 0, units: 0 };
      },
      check: (s) => s.parts.hundreds === h && s.parts.tens === t && s.parts.units === u,
      progress: (s) => {
        const sel = s.parts.hundreds < h ? ["100", "hundreds"] : s.parts.tens < t ? ["10", "tens"] : ["1", "units"];
        return {
          current: totalOf(s.parts),
          target,
          fromSelector: `[data-place-source="${sel[0]}"]`,
          toSelector: `[data-drop="place:${sel[1]}"]`
        };
      }
    };
  }

  /* 13단계: 묶음 곱셈 (조건: a ∈ [2..5], b ∈ [2..4], 곱 <= 20) */
  function genStage13Multiply(id) {
    const a = randInt(2, 5);
    const b = randInt(2, Math.min(4, Math.floor(20 / a)));
    return {
      id,
      stageId: 13,
      goalBadges: [`${a} × ${b} = ?`, `${a}개씩 ${b}묶음`],
      prompt: `${a}개씩 ${b}묶음을 모두 채워요`,
      speakText: `묶음 카드를 끌어 ${a}개씩 ${b}묶음을 채워 보아요`,
      okMsg: `${a}개씩 ${b}묶음은 모두 ${a * b}개예요!`,
      demo: {
        from: `[data-mul-bundle]`,
        to: `[data-drop="mul:0"]`,
        emoji: "🟣",
        hint: "묶음 카드를 빈 묶음 칸으로 끌어요"
      },
      setup: (s) => {
        s.mulGroups = Array(b).fill(0);
        s.mulKey = `${a}x${b}`;
        s.expr = { first: String(a), operator: "×", second: String(b) };
      },
      check: (s) => s.mulGroups.length === b && s.mulGroups.every((v) => Number(v) === a),
      progress: (s) => {
        const done = s.mulGroups.filter((v) => Number(v) >= a).length;
        const nextIdx = s.mulGroups.findIndex((v) => Number(v) < a);
        return {
          current: done,
          target: b,
          fromSelector: `[data-mul-bundle]`,
          toSelector: nextIdx >= 0 ? `[data-drop="mul:${nextIdx}"]` : null
        };
      }
    };
  }

  /* 14단계: 똑같이 나누기 (조건: 접시 2~4개, 접시당 2~4개, 나머지 0) */
  function genStage14Divide(id) {
    const plates = randInt(2, 4);
    const q = randInt(2, 4);
    const total = plates * q;
    return {
      id,
      stageId: 14,
      goalBadges: [`${total} ÷ ${plates} = ?`, `${plates}접시`],
      prompt: `${total}개를 ${plates}접시에 똑같이 나누어요`,
      speakText: `점 ${total}개를 ${plates}개의 접시에 똑같이 나누어 담아요`,
      okMsg: `한 접시에 ${q}개씩 공평하게 나누었어요!`,
      demo: {
        from: `[data-div-token]`,
        to: `[data-drop="div:0"]`,
        emoji: "🔵",
        hint: "파란 점을 접시마다 똑같이 나누어 담아요"
      },
      setup: (s) => {
        s.divPlates = Array(plates).fill(0);
        s.divRem = 0;
        s.divKey = `${total}÷${plates}`;
        s.expr = { first: String(total), operator: "÷", second: String(plates) };
      },
      check: (s) => s.divRem === 0 && s.divPlates.length === plates && s.divPlates.every((n) => n === q),
      progress: (s) => {
        const placed = s.divPlates.reduce((a, b) => a + b, 0);
        const nextIdx = s.divPlates.findIndex((v) => v < q);
        return {
          current: placed,
          target: total,
          fromSelector: `[data-div-token]`,
          toSelector: nextIdx >= 0 ? `[data-drop="div:${nextIdx}"]` : null
        };
      }
    };
  }

  /* 15단계: 분수 조각 (조건: 분모 {2,3,4,5,6}, 목표 분자 1..d-1 또는 합) */
  function genStage15Fraction(id, roundIdx) {
    const d = pick([2, 3, 4, 5, 6]);
    const isAdd = roundIdx % 2 === 1 && d >= 3;
    const n1 = isAdd ? randInt(1, Math.max(1, d - 2)) : 0;
    const addN = isAdd ? randInt(1, d - n1) : randInt(1, d - 1);
    const targetN = n1 + addN;
    return {
      id,
      stageId: 15,
      mode: "fraction",
      goalBadges: isAdd ? [`${n1}/${d} + ${addN}/${d} = ?`] : [`🎯 ${targetN}/${d}`],
      prompt: isAdd ? `${n1}/${d}에 ${addN}/${d}만큼 더 채워요` : `분수 막대에 ${targetN}/${d}를 채워요`,
      speakText: isAdd
        ? `${d}분의 ${n1}에 ${d}분의 ${addN}을 더해 ${d}분의 ${targetN}을 만들어요`
        : `분수 조각을 끌어 ${d}분의 ${targetN}을 만들어요`,
      okMsg: `${d}조각 중 ${targetN}조각! ${targetN}/${d}를 완성했어요!`,
      demo: {
        from: `[data-frac-piece="a"]`,
        to: `[data-drop="frac:a"]`,
        emoji: `1/${d}`,
        hint: "분수 조각을 파란 막대로 끌어요"
      },
      setup: (s) => {
        s.fractions = { a: { n: n1, d }, b: { n: addN, d } };
      },
      check: (s) => s.fractions.a.d === d && s.fractions.a.n === targetN,
      progress: (s) => ({
        current: s.fractions.a.n,
        target: targetN,
        fromSelector: s.fractions.a.n < targetN ? `[data-frac-piece="a"]` : null,
        toSelector: s.fractions.a.n < targetN ? `[data-drop="frac:a"]` : `[data-drop="frac-minus"]`
      })
    };
  }

  /* 16단계: 소수 0.1 단위 (조건: 분모 10 막대에 0.1 조각 채우기) */
  function genStage16Decimal(id, roundIdx) {
    const isAdd = roundIdx % 2 === 1;
    const n1 = isAdd ? randInt(2, 5) : 0;
    const addN = isAdd ? randInt(1, 9 - n1) : randInt(2, 8);
    const targetN = n1 + addN;
    const targetVal = (targetN / 10).toFixed(1);
    return {
      id,
      stageId: 16,
      mode: "decimal",
      goalBadges: isAdd ? [`0.${n1} + 0.${addN} = ?`] : [`🎯 ${targetVal}`],
      prompt: isAdd ? `0.${n1}에 0.${addN}을 더 채워요` : `0.1 조각으로 ${targetVal}을 만들어요`,
      speakText: isAdd
        ? `영 점 ${n1}에 영 점 ${addN}을 더해 ${targetVal}을 만들어요`
        : `영 점 일 조각을 끌어 ${targetVal}을 만들어요`,
      okMsg: `0.1이 ${targetN}개 모여 ${targetVal}이 되었어요!`,
      demo: {
        from: `[data-frac-piece="a"]`,
        to: `[data-drop="frac:a"]`,
        emoji: "0.1",
        hint: "0.1 조각을 막대로 끌어요"
      },
      setup: (s) => {
        s.fractions = { a: { n: n1, d: 10 }, b: { n: addN, d: 10 } };
      },
      check: (s) => s.fractions.a.d === 10 && s.fractions.a.n === targetN,
      progress: (s) => ({
        current: s.fractions.a.n,
        target: targetN,
        fromSelector: s.fractions.a.n < targetN ? `[data-frac-piece="a"]` : null,
        toSelector: s.fractions.a.n < targetN ? `[data-drop="frac:a"]` : `[data-drop="frac-minus"]`
      })
    };
  }

  /* 17단계: 길이(cm)·들이(컵)·무게(g) 재기 */
  function genStage17Measure(id, roundIdx) {
    const kind = ["length", "volume", "weight"][roundIdx % 3];
    if (kind === "length") {
      const target = randInt(4, 17);
      const start = target > 8 ? 2 : 0;
      return {
        id,
        stageId: 17,
        measureKind: "length",
        goalBadges: [`📏 ${target} cm`],
        prompt: `연필을 끌어 ${target} cm에 맞춰요`,
        speakText: `연필 손잡이를 끌어 ${target} 센티미터에 맞추어요`,
        okMsg: `길이를 정확히 ${target} cm로 재었어요!`,
        demo: {
          from: `#rulerObj`,
          to: `#rulerStage`,
          emoji: "✏️",
          dx: 90,
          hint: "연필을 좌우로 끌어 눈금에 맞춰요"
        },
        setup: (s) => {
          s.measure.tab = "length";
          s.measure.length = start;
        },
        check: (s) => s.measure.length === target,
        progress: (s) => ({ current: s.measure.length, target, fromSelector: `#rulerObj`, toSelector: `#rulerStage` })
      };
    }
    if (kind === "volume") {
      const target = randInt(3, 9);
      const start = target > 5 ? 1 : 0;
      return {
        id,
        stageId: 17,
        measureKind: "volume",
        goalBadges: [`🥤 ${target} 컵`],
        prompt: `물 높이를 끌어 ${target}컵에 맞춰요`,
        speakText: `물방울 손잡이를 위아래로 끌어 ${target}컵에 맞추어요`,
        okMsg: `물의 양을 정확히 ${target}컵 채웠어요!`,
        demo: {
          from: `#beakerHandle`,
          to: `#beaker`,
          emoji: "💧",
          dy: -60,
          hint: "물방울 손잡이를 위아래로 끌어요"
        },
        setup: (s) => {
          s.measure.tab = "volume";
          s.measure.volume = start;
        },
        check: (s) => s.measure.volume === target,
        progress: (s) => ({ current: s.measure.volume, target, fromSelector: `#beakerHandle`, toSelector: `#beaker` })
      };
    }
    const target = pick([200, 300, 400, 500, 600, 700, 800]);
    return {
      id,
      stageId: 17,
      measureKind: "weight",
      goalBadges: [`⚖️ ${target} g`],
      prompt: `무게 추를 저울에 올려 ${target}g을 만들어요`,
      speakText: `무게 추를 저울 접시로 끌어 ${target} 그램을 만들어요`,
      okMsg: `저울 무게 ${target}g을 정확히 맞췄어요!`,
      demo: {
        from: `[data-weight="${target >= 500 ? 500 : 100}"]`,
        to: `[data-drop="weight"]`,
        emoji: "⚖️",
        hint: "무게 추를 노란 저울 접시로 끌어요"
      },
      setup: (s) => {
        s.measure.tab = "weight";
        s.measure.weight = 0;
      },
      check: (s) => s.measure.weight === target,
      progress: (s) => ({
        current: s.measure.weight,
        target,
        fromSelector: `[data-weight="${target - s.measure.weight >= 500 ? 500 : target - s.measure.weight >= 200 ? 200 : 100}"]`,
        toSelector: `[data-drop="weight"]`
      })
    };
  }

  /* 18단계: 시계 읽기 (조건: 정각 또는 30분) */
  function genStage18Clock(id, roundIdx) {
    const h = randInt(1, 12);
    const m = roundIdx % 2 === 0 ? 0 : 30;
    const targetMin = (h % 12) * 60 + m;
    const startH = (h % 12) + 2 > 12 ? 1 : (h % 12) + 2;
    const startMin = startH * 60 + (m === 0 ? 30 : 0);
    const label = m === 0 ? `${h}시` : `${h}시 30분`;
    const digital = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return {
      id,
      stageId: 18,
      goalBadges: [`🕒 ${label}`, digital],
      prompt: `시계 바늘을 돌려 ${label}을 만들어요`,
      speakText: `시계 바늘을 움직여 ${label}에 맞추어요`,
      okMsg: `시계를 ${label}에 정확히 맞췄어요!`,
      demo: {
        from: `[data-clock-hand="minute"]`,
        to: `.clock`,
        emoji: "🕒",
        dx: 42,
        dy: 32,
        hint: "긴 바늘을 둥글게 끌어 시간을 맞춰요"
      },
      setup: (s) => {
        s.measure.tab = "clock";
        s.measure.minutes = startMin;
      },
      check: (s) => {
        const cur = ((s.measure.minutes % 720) + 720) % 720;
        // Allow +-2 minute tolerance when dragging analog minute hand, exact on 0/30 snap
        const diff = Math.abs(cur - targetMin);
        return Math.min(diff, 720 - diff) <= 2;
      },
      progress: () => ({ current: 0, target: 1, fromSelector: `[data-clock-hand="minute"]`, toSelector: `.clock` })
    };
  }

  /* 19단계: 동전 모으기 (조건: 10원·50원·100원·500원 조합) */
  function genStage19Money(id) {
    const c500 = pick([0, 1]);
    const c100 = randInt(0, 3);
    const c50 = pick([0, 1]);
    const c10 = randInt(0, 3);
    let target = c500 * 500 + c100 * 100 + c50 * 50 + c10 * 10;
    if (target < 60) target = 150;
    return {
      id,
      stageId: 19,
      goalBadges: [`👛 ${target}원`],
      prompt: `동전을 지갑에 넣어 ${target}원을 만들어요`,
      speakText: `동전을 노란 지갑으로 끌어 ${target}원을 만들어요`,
      okMsg: `동전을 모아 정확히 ${target}원을 만들었어요!`,
      demo: {
        from: `[data-coin-drag="${target >= 500 ? 500 : target >= 100 ? 100 : 50}"]`,
        to: `[data-drop="wallet"]`,
        emoji: "🪙",
        hint: "동전을 노란 지갑으로 끌어 넣어요"
      },
      setup: (s) => {
        s.measure.tab = "money";
        s.measure.coins = { 10: 0, 50: 0, 100: 0, 500: 0 };
      },
      check: (s) => {
        const c = s.measure.coins;
        return (c[10] * 10 + c[50] * 50 + c[100] * 100 + c[500] * 500) === target;
      },
      progress: (s) => {
        const c = s.measure.coins;
        const sum = c[10] * 10 + c[50] * 50 + c[100] * 100 + c[500] * 500;
        const rem = Math.max(0, target - sum);
        const nextCoin = rem >= 500 ? 500 : rem >= 100 ? 100 : rem >= 50 ? 50 : 10;
        return {
          current: sum,
          target,
          fromSelector: sum < target ? `[data-coin-drag="${nextCoin}"]` : null,
          toSelector: `[data-drop="wallet"]`
        };
      }
    };
  }

  /* 20단계: 도형 놓기와 반복 무늬 (조건: 도형 개수 맞추기 / 규칙 빈칸) */
  function genStage20Shape(id, roundIdx) {
    const isPattern = roundIdx % 2 === 1;
    if (isPattern) {
      const sets = [
        ["🔴", "🔵"],
        ["⭐", "🌙"],
        ["🔺", "🟦"],
        ["🍎", "🍋", "🍇"]
      ];
      const sym = pick(sets);
      let seq, answer;
      if (sym.length === 3) {
        seq = [sym[0], sym[1], sym[2], sym[0], sym[1]];
        answer = sym[2];
      } else if (roundIdx % 4 === 1) {
        seq = [sym[0], sym[1], sym[0], sym[1], sym[0]];
        answer = sym[1];
      } else {
        seq = [sym[0], sym[0], sym[1], sym[0], sym[0]];
        answer = sym[1];
      }
      const choices = sym.length === 3 ? sym.slice() : [sym[0], sym[1], "🟢"];
      return {
        id,
        stageId: 20,
        mode: "pattern",
        goalBadges: [`🔁 규칙 찾기`],
        prompt: "물음표 자리에 알맞은 모양을 끌어요",
        speakText: "반복되는 무늬를 보고 물음표 자리에 알맞은 모양을 끌어 놓아요",
        okMsg: "반복 규칙을 정확히 찾았어요!",
        demo: {
          from: `[data-pattern-drag="${answer}"]`,
          to: `[data-drop="pattern-next"]`,
          emoji: answer,
          hint: "모양을 물음표 자리로 끌어다 놓아요"
        },
        setup: (s) => {
          s.shapeTab = "pattern";
          s.customPattern = { seq, answer, choices: shuffle(choices), rule: "순서대로 반복되는 규칙이에요." };
          s.pattern = { index: 0, chosen: null, solved: false };
        },
        check: (s) => Boolean(s.pattern.solved),
        progress: () => ({ current: 0, target: 1, fromSelector: `[data-pattern-drag="${answer}"]`, toSelector: `[data-drop="pattern-next"]` })
      };
    }
    const shapePool = [
      { id: "triangle", name: "삼각형", emoji: "🔺" },
      { id: "square", name: "정사각형", emoji: "🟩" },
      { id: "circle", name: "원", emoji: "🟣" }
    ];
    const targetShape = pick(shapePool);
    const count = randInt(2, 3);
    return {
      id,
      stageId: 20,
      mode: "shape",
      goalBadges: [`${targetShape.emoji} ${targetShape.name} × ${count}`],
      prompt: `보드에 ${targetShape.name}을 ${count}개 놓아요`,
      speakText: `도형 상자에서 ${targetShape.name}을 ${count}개 끌어 보드에 놓아요`,
      okMsg: `${targetShape.name} ${count}개를 보드에 잘 놓았어요!`,
      demo: {
        from: `[data-shape-source="${targetShape.id}"]`,
        to: `[data-drop="shape-board"]`,
        emoji: targetShape.emoji,
        hint: "도형을 큰 보드로 끌어다 놓아요"
      },
      setup: (s) => {
        s.shapeTab = "shape";
        s.shapeId = targetShape.id;
        s.shapeBoard = [];
        s.shapeSelected = null;
      },
      check: (s) => s.shapeBoard.filter((x) => x.id === targetShape.id).length === count,
      progress: (s) => ({
        current: s.shapeBoard.filter((x) => x.id === targetShape.id).length,
        target: count,
        fromSelector: `[data-shape-source="${targetShape.id}"]`,
        toSelector: `[data-drop="shape-board"]`
      })
    };
  }

  /* 21단계: 그림 그래프 (조건: 과일 막대 목표 개수 채우기) */
  function genStage21Data(id, roundIdx) {
    const fruits = [
      { id: "apple", label: "사과", emoji: "🍎" },
      { id: "banana", label: "바나나", emoji: "🍌" },
      { id: "grape", label: "포도", emoji: "🍇" }
    ];
    const focus = fruits[roundIdx % 3];
    const init = { apple: randInt(1, 3), banana: randInt(1, 3), grape: randInt(1, 3) };
    const target = randInt(4, 7);
    init[focus.id] = randInt(1, target - 2);
    return {
      id,
      stageId: 21,
      goalBadges: [`${focus.emoji} ${focus.label} → ${target}개`],
      prompt: `${focus.label} 그래프를 ${target}칸으로 채워요`,
      speakText: `${focus.label} 그림을 끌어 ${focus.label} 그래프를 ${target}개로 만들어요`,
      okMsg: `${focus.label} 그래프 ${target}개를 정확히 만들었어요!`,
      demo: {
        from: `[data-data-token="${focus.id}"]`,
        to: `[data-drop="data:${focus.id}"]`,
        emoji: focus.emoji,
        hint: "과일을 그래프 막대로 끌어다 놓아요"
      },
      setup: (s) => {
        s.data = { ...init, answer: null, solved: false, wordSolved: false };
      },
      check: (s) => s.data[focus.id] === target,
      progress: (s) => ({
        current: s.data[focus.id],
        target,
        fromSelector: `[data-data-token="${focus.id}"]`,
        toSelector: `[data-drop="data:${focus.id}"]`
      })
    };
  }

  window.StepMathGenerator = {
    buildProblem
  };
})();
