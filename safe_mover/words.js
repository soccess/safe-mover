"use strict";

/* ============================================================
   읽걷이의 맞춤법 모험 - 단어 데이터 (12단계 난이도별 + 교사 사용자 단어)
   - correct: 맞춤법에 맞는 바른 단어 (캐릭터가 이동해서 잡기)
   - wrong: 틀린 맞춤법 단어 (적이 들고 나타남 → 피하기)
   - tip: 왜 맞는지/틀리는지 짧은 설명
   ============================================================ */
window.SafeMoverWords = {
  CUSTOM_KEY: "safe_mover.custom_words.v1",
  // 1~3단계: 기초 낱말과 받침
  tier1: [
    { correct: "가방", wrong: "가빵", tip: "'가방'이 바른 말이에요." },
    { correct: "사과", wrong: "사과아", tip: "'사과'가 바른 말이에요." },
    { correct: "학교", wrong: "핵교", tip: "'학교'라고 써요." },
    { correct: "우산", wrong: "우상", tip: "받침은 'ㄴ'이에요. '우산'!" },
    { correct: "나비", wrong: "나삐", tip: "'나비'가 바른 말이에요." },
    { correct: "바나나", wrong: "빠나나", tip: "'바나나'가 맞아요." },
    { correct: "선생님", wrong: "선생임", tip: "'선생님'이라고 써요." },
    { correct: "친구", wrong: "친꾸", tip: "'친구'가 바른 말이에요." },
    { correct: "자동차", wrong: "자둥차", tip: "'자동차'가 맞아요." },
    { correct: "코끼리", wrong: "코기리", tip: "쌍기역 'ㄲ'! '코끼리'예요." }
  ],
  // 4~6단계: 헷갈리는 모음·받침
  tier2: [
    { correct: "무지개", wrong: "무지게", tip: "끝 글자는 '개'예요. '무지개'!" },
    { correct: "도서관", wrong: "도서권", tip: "'도서관'이 바른 말이에요." },
    { correct: "약속", wrong: "약솓", tip: "받침은 'ㄱ'! '약속'이에요." },
    { correct: "연필", wrong: "연피", tip: "받침 'ㄹ'이 있어요. '연필'!" },
    { correct: "지우개", wrong: "지우게", tip: "'지우개'가 맞아요." },
    { correct: "개구리", wrong: "게구리", tip: "'ㅐ'를 써서 '개구리'예요." },
    { correct: "거북이", wrong: "거부기", tip: "'거북이'라고 적어야 해요." },
    { correct: "떡볶이", wrong: "떡복이", tip: "쌍기역 받침 'ㄲ'! '떡볶이'예요." },
    { correct: "안경", wrong: "앙경", tip: "받침 'ㄴ'을 써서 '안경'이에요." },
    { correct: "시계", wrong: "시게", tip: "'계'를 써서 '시계'예요." }
  ],
  // 7~9단계: 자주 틀리는 생활 맞춤법
  tier3: [
    { correct: "깨끗이", wrong: "깨끗히", tip: "'ㅅ' 받침 뒤에는 '이'를 써요. '깨끗이'!" },
    { correct: "일찍", wrong: "일찌기", tip: "'일찍'이 바른 말이에요." },
    { correct: "금세", wrong: "금새", tip: "'금시에'가 줄어든 말이라 '금세'가 맞아요." },
    { correct: "돼요", wrong: "되요", tip: "'되어요'가 줄면 '돼요'가 돼요." },
    { correct: "어떻게", wrong: "어떡해", tip: "'어떻게 해'처럼 꾸밀 땐 '어떻게'예요." },
    { correct: "며칠", wrong: "몇일", tip: "날짜를 물을 땐 언제나 '며칠'이에요." },
    { correct: "문안", wrong: "무난", tip: "안부를 여쭙는 건 '문안'이에요." },
    { correct: "반드시", wrong: "반듯이", tip: "'꼭'이라는 뜻은 '반드시'예요." },
    { correct: "설거지", wrong: "설겆이", tip: "'설거지'가 바른 표준어예요." },
    { correct: "깍두기", wrong: "깍뚜기", tip: "'깍두기'라고 써요." }
  ],
  // 10~12단계: 심화 맞춤법
  tier4: [
    { correct: "오랜만에", wrong: "오랫만에", tip: "'오래간만에'의 준말은 '오랜만에'예요." },
    { correct: "어이없다", wrong: "어의없다", tip: "'어이없다'가 바른 말이에요." },
    { correct: "병이 낫다", wrong: "병이 낳다", tip: "아픈 게 좋아지는 건 '낫다'예요." },
    { correct: "이따가", wrong: "있다가", tip: "잠시 뒤를 말할 땐 '이따가'예요." },
    { correct: "웬일", wrong: "왠일", tip: "'웬'을 써서 '웬일'이라고 해요." },
    { correct: "왠지", wrong: "웬지", tip: "'왜인지'가 줄면 '왠지'예요." },
    { correct: "감감무소식", wrong: "깜깜무소식", tip: "'감감무소식'이 바른 말이에요." },
    { correct: "우레", wrong: "우뢰", tip: "천둥소리는 '우레'가 표준어예요." },
    { correct: "뒤풀이", wrong: "뒷풀이", tip: "거센소리 앞이라 '뒤풀이'가 맞아요." },
    { correct: "고마워요", wrong: "고마와요", tip: "'고마워요'가 바른 말이에요." }
  ],
  getCustomWords() {
    try {
      const raw = localStorage.getItem(this.CUSTOM_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((x) => x && x.correct && x.wrong) : [];
    } catch (_) {
      return [];
    }
  },
  getForStage(stageIdx) {
    let base = this.tier4;
    let tierKey = "tier4";
    if (stageIdx < 3) { base = this.tier1; tierKey = "tier1"; }
    else if (stageIdx < 6) { base = this.tier2; tierKey = "tier2"; }
    else if (stageIdx < 9) { base = this.tier3; tierKey = "tier3"; }

    const custom = this.getCustomWords().filter((w) => !w.tier || w.tier === "all" || w.tier === tierKey);
    if (!custom.length) return base;
    // 교사 입력 단어가 자주 등장하도록 가중치 부여
    return custom.concat(custom, base);
  }
};
