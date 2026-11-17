"use strict";

/* ============================================================
   읽걷이의 맞춤법 모험 - 12단계별 완전 분리 단어 데이터 + 교사 사용자 단어
   - 각 1~12단계마다 중복 없는 10개씩 총 120개의 고유 맞춤법 단어 배치
   - 1단계(기초 낱말) → 12단계(심화·고난도 맞춤법)로 점진적 난이도 상승
   ============================================================ */
window.SafeMoverWords = {
  CUSTOM_KEY: "safe_mover.custom_words.v1",
  stageTopics: [
    "기초 낱말과 겹받침 없는 말",
    "기본 받침 (ㄱ·ㄴ·ㄹ·ㅁ·ㅂ·ㄷ·ㅅ)",
    "헷갈리는 모음 (ㅐ/ㅔ · 계/게 · ㅙ/ㅞ)",
    "쌍받침·겹받침·거센소리",
    "자주 헷갈리는 생활 낱말",
    "소리 나는 대로 쓰기 쉬운 말",
    "줄임말과 용언 활용",
    "뜻에 따라 구별하는 낱말",
    "사이시옷과 맞춤법 규칙",
    "어원과 형태 살리기 심화",
    "고난도 혼동 어휘",
    "맞춤법 마스터 최종 도전"
  ],
  stages: [
    // 1단계: 기초 낱말과 겹받침 없는 말
    [
      { correct: "가방", wrong: "가빵", tip: "'가방'이 바른 말이에요." },
      { correct: "사과", wrong: "사과아", tip: "짧게 '사과'라고 써요." },
      { correct: "학교", wrong: "핵교", tip: "'학교'라고 바르게 써요." },
      { correct: "우산", wrong: "우상", tip: "받침은 'ㄴ'이에요. '우산'!" },
      { correct: "나비", wrong: "나삐", tip: "된소리가 아닌 '나비'가 맞아요." },
      { correct: "바나나", wrong: "빠나나", tip: "첫 글자는 '바'! '바나나'예요." },
      { correct: "친구", wrong: "친꾸", tip: "'친구'가 바른 말이에요." },
      { correct: "자동차", wrong: "자둥차", tip: "가운데 글자는 '동'! '자동차'예요." },
      { correct: "코끼리", wrong: "코기리", tip: "쌍기역 'ㄲ'! '코끼리'예요." },
      { correct: "선생님", wrong: "선생임", tip: "끝 글자는 '님'! '선생님'이에요." }
    ],
    // 2단계: 기본 받침
    [
      { correct: "연필", wrong: "연피", tip: "받침 'ㄹ'이 꼭 있어야 해요. '연필'!" },
      { correct: "약속", wrong: "약솓", tip: "끝 받침은 'ㄱ'! '약속'이에요." },
      { correct: "안경", wrong: "앙경", tip: "첫 글자 받침은 'ㄴ'! '안경'이에요." },
      { correct: "수박", wrong: "수밬", tip: "받침 'ㄱ'을 써서 '수박'이에요." },
      { correct: "숟가락", wrong: "숫가락", tip: "'ㄷ' 받침을 써서 '숟가락'이에요." },
      { correct: "젓가락", wrong: "젖가락", tip: "'ㅅ' 받침을 써서 '젓가락'이에요." },
      { correct: "도토리", wrong: "도또리", tip: "'도토리'가 바른 말이에요." },
      { correct: "잠자리", wrong: "잠짜리", tip: "'잠자리'라고 써요." },
      { correct: "달리기", wrong: "달니기", tip: "'ㄹ'이 이어져 '달리기'예요." },
      { correct: "구름", wrong: "구르음", tip: "두 글자로 '구름'이에요." }
    ],
    // 3단계: 헷갈리는 모음
    [
      { correct: "무지개", wrong: "무지게", tip: "끝 글자는 '개'예요. '무지개'!" },
      { correct: "지우개", wrong: "지우게", tip: "도구를 뜻할 땐 '-개'! '지우개'예요." },
      { correct: "개구리", wrong: "게구리", tip: "'ㅐ'를 써서 '개구리'예요." },
      { correct: "시계", wrong: "시게", tip: "'계'를 써서 '시계'예요." },
      { correct: "내일", wrong: "네일", tip: "오늘 다음 날은 '내일'이에요." },
      { correct: "세수", wrong: "새수", tip: "얼굴을 씻는 건 '세수'예요." },
      { correct: "돼지", wrong: "뒈지", tip: "'ㅙ'를 써서 '돼지'예요." },
      { correct: "모래", wrong: "모레", tip: "바닷가 알갱이는 '모래'예요. (글피는 '모레')" },
      { correct: "노래", wrong: "노레", tip: "'ㅐ'를 써서 '노래'예요." },
      { correct: "세계", wrong: "세게", tip: "온 누리는 '세계'라고 써요." }
    ],
    // 4단계: 쌍받침·겹받침·거센소리
    [
      { correct: "떡볶이", wrong: "떡복이", tip: "쌍기역 받침 'ㄲ'! '떡볶이'예요." },
      { correct: "깍두기", wrong: "깍뚜기", tip: "가운데 글자는 '두'! '깍두기'예요." },
      { correct: "거북이", wrong: "거부기", tip: "원래 형태를 살려 '거북이'라고 써요." },
      { correct: "닭고기", wrong: "닥고기", tip: "겹받침 'ㄺ'을 써서 '닭고기'예요." },
      { correct: "맑다", wrong: "막다", tip: "하늘이 '맑다'는 겹받침 'ㄺ'이에요." },
      { correct: "읽다", wrong: "익다", tip: "책을 '읽다'는 겹받침 'ㄺ'이에요." },
      { correct: "짧다", wrong: "짤다", tip: "길이가 '짧다'는 겹받침 'ㄼ'이에요." },
      { correct: "여덟", wrong: "여덜", tip: "숫자 8은 겹받침 'ㄼ'! '여덟'이에요." },
      { correct: "흙길", wrong: "흑길", tip: "땅을 뜻하는 '흙'은 'ㄺ' 받침이에요." },
      { correct: "삶다", wrong: "삼다", tip: "음식을 '삶다'는 'ㄻ' 받침이에요." }
    ],
    // 5단계: 자주 헷갈리는 생활 낱말
    [
      { correct: "깨끗이", wrong: "깨끗히", tip: "'ㅅ' 받침 뒤에는 '이'를 써요. '깨끗이'!" },
      { correct: "일찍", wrong: "일찌기", tip: "'일찍'이 바른 표준어예요." },
      { correct: "설거지", wrong: "설겆이", tip: "'설거지'가 바른 말이에요." },
      { correct: "도서관", wrong: "도서권", tip: "책을 읽는 곳은 '도서관'이에요." },
      { correct: "김치찌개", wrong: "김치찌게", tip: "보글보글 '찌개'는 'ㅐ'를 써요." },
      { correct: "육개장", wrong: "육계장", tip: "얼큰한 국은 '육개장'이에요." },
      { correct: "떡국", wrong: "떡꾹", tip: "'떡국'이 바른 말이에요." },
      { correct: "껍질", wrong: "껍찔", tip: "과일 겉은 '껍질'이에요." },
      { correct: "고구마", wrong: "고꾸마", tip: "'고구마'가 바른 말이에요." },
      { correct: "빙수", wrong: "빙쑤", tip: "시원한 '빙수'가 바른 말이에요." }
    ],
    // 6단계: 소리 나는 대로 쓰기 쉬운 말
    [
      { correct: "부엌", wrong: "부억", tip: "끝 받침은 'ㅋ'! '부엌'이에요." },
      { correct: "바깥", wrong: "바깓", tip: "끝 받침은 'ㅌ'! '바깥'이에요." },
      { correct: "며칠", wrong: "몇일", tip: "날짜를 물을 땐 언제나 '며칠'이에요." },
      { correct: "금세", wrong: "금새", tip: "'금시에'가 줄어서 '금세'가 맞아요." },
      { correct: "꽃잎", wrong: "꼰닙", tip: "'꽃'과 '잎'이 만나 '꽃잎'이라 적어요." },
      { correct: "나뭇잎", wrong: "나문닙", tip: "'나무+ㅅ+잎'이라 '나뭇잎'이 맞아요." },
      { correct: "촛불", wrong: "촟불", tip: "'초+ㅅ+불'이라 '촛불'이 맞아요." },
      { correct: "국수", wrong: "국쑤", tip: "예사소리로 '국수'라고 써요." },
      { correct: "팥죽", wrong: "팟죽", tip: "붉은 팥은 'ㅌ' 받침! '팥죽'이에요." },
      { correct: "겉옷", wrong: "걷옷", tip: "바깥쪽에 입는 옷은 '겉옷'이에요." }
    ],
    // 7단계: 줄임말과 용언 활용
    [
      { correct: "돼요", wrong: "되요", tip: "'되어요'가 줄면 '돼요'가 맞아요." },
      { correct: "어떻게", wrong: "어떡해", tip: "'어떻게 해'처럼 뒤를 꾸밀 땐 '어떻게'예요." },
      { correct: "이따가", wrong: "있다가", tip: "잠시 뒤를 말할 땐 '이따가'예요." },
      { correct: "고마워요", wrong: "고마와요", tip: "'고맙+어요'가 바뀌어 '고마워요'예요." },
      { correct: "했어요", wrong: "헷어요", tip: "'하+였어요'의 줄임말은 '했어요'예요." },
      { correct: "왔어요", wrong: "왓어요", tip: "과거 쌍시옷 'ㅆ'! '왔어요'예요." },
      { correct: "부러워요", wrong: "부러와요", tip: "'부럽+어요'는 '부러워요'가 맞아요." },
      { correct: "예뻐요", wrong: "이뻐요", tip: "표준어는 '예뻐요'예요." },
      { correct: "달라요", wrong: "달아요", tip: "'다르+아요'는 '달라요'가 맞아요." },
      { correct: "잠갔어요", wrong: "잠궜어요", tip: "'잠그+았어요'는 '잠갔어요'예요." }
    ],
    // 8단계: 뜻에 따라 구별하는 낱말
    [
      { correct: "반드시", wrong: "반듯이", tip: "'꼭'이라는 뜻은 '반드시'예요. (바르게는 '반듯이')" },
      { correct: "문안 인사", wrong: "무난 인사", tip: "어른께 여쭙는 건 '문안'이에요." },
      { correct: "병이 낫다", wrong: "병이 낳다", tip: "아픈 게 좋아지는 건 '낫다'예요." },
      { correct: "편지 부치다", wrong: "편지 붙이다", tip: "소포나 편지를 보내는 건 '부치다'예요." },
      { correct: "정답 맞히다", wrong: "정답 맞추다", tip: "문제를 옳게 푸는 건 '맞히다'예요." },
      { correct: "손으로 가리키다", wrong: "손으로 가르치다", tip: "방향을 짚어 보이는 건 '가리키다'예요." },
      { correct: "수수께끼", wrong: "수수깨끼", tip: "어려운 문제 놀이는 '수수께끼'예요." },
      { correct: "오뚝이", wrong: "오뚜기", tip: "쓰러져도 일어나는 장난감은 '오뚝이'예요." },
      { correct: "안 된다", wrong: "안 됀다", tip: "'되다'에 '-ㄴ다'가 붙어 '된다'예요." },
      { correct: "생각이 다르다", wrong: "생각이 틀리다", tip: "서로 같지 않을 땐 '다르다'라고 해요." }
    ],
    // 9단계: 사이시옷과 맞춤법 규칙
    [
      { correct: "뒤풀이", wrong: "뒷풀이", tip: "거센소리 'ㅍ' 앞엔 사이시옷 없이 '뒤풀이'예요." },
      { correct: "머리말", wrong: "머릿말", tip: "'머리말'에는 사이시옷을 넣지 않아요." },
      { correct: "인사말", wrong: "인삿말", tip: "'인사말'은 사이시옷 없이 써요." },
      { correct: "예삿일", wrong: "예사일", tip: "보통 있는 일은 사이시옷을 넣어 '예삿일'이에요." },
      { correct: "나룻배", wrong: "나루배", tip: "'나루+ㅅ+배'라 사이시옷을 넣어 '나룻배'예요." },
      { correct: "바닷가", wrong: "바다가", tip: "바다의 가장자리는 '바닷가'예요." },
      { correct: "햇빛", wrong: "해빛", tip: "따뜻한 해의 빛은 '햇빛'이에요." },
      { correct: "전셋집", wrong: "전세집", tip: "한자어+고유어 결합이라 '전셋집'이 맞아요." },
      { correct: "윗옷", wrong: "웃옷", tip: "위아래 대립이 있는 겉옷은 '윗옷'이에요." },
      { correct: "아랫마을", wrong: "아래마을", tip: "아래쪽에 있는 마을은 '아랫마을'이에요." }
    ],
    // 10단계: 어원과 형태 살리기 심화
    [
      { correct: "오랜만에", wrong: "오랫만에", tip: "'오래간만에'의 줄임말이라 '오랜만에'예요." },
      { correct: "어이없다", wrong: "어의없다", tip: "기가 막힐 땐 '어이없다'예요." },
      { correct: "웬일", wrong: "왠일", tip: "'무슨 일'이라는 뜻은 '웬일'이에요." },
      { correct: "왠지", wrong: "웬지", tip: "'왜인지'가 줄어서 '왠지'가 맞아요." },
      { correct: "감감무소식", wrong: "깜깜무소식", tip: "소식이 전혀 없을 땐 '감감무소식'이에요." },
      { correct: "우레", wrong: "우뢰", tip: "천둥소리는 '우레'가 표준어예요." },
      { correct: "곰곰이", wrong: "곰곰히", tip: "부사 접미사 '-이'를 써서 '곰곰이'예요." },
      { correct: "꼼꼼히", wrong: "꼼꼼이", tip: "'-하다'가 붙는 말 뒤는 '꼼꼼히'예요." },
      { correct: "일일이", wrong: "일일히", tip: "하나하나 빠짐없이는 '일일이'예요." },
      { correct: "번번이", wrong: "번번히", tip: "매번이라는 뜻은 '번번이'가 맞아요." }
    ],
    // 11단계: 고난도 혼동 어휘
    [
      { correct: "내 바람", wrong: "내 바램", tip: "원하는 것은 '바라다'에서 온 '바람'이에요." },
      { correct: "설렘", wrong: "설레임", tip: "'설레다'의 명사형은 '설렘'이 맞아요." },
      { correct: "희한하다", wrong: "희안하다", tip: "신기하고 드문 것은 '희한하다'예요." },
      { correct: "굳이", wrong: "구지", tip: "고집스럽게 일부러는 '굳이'라고 써요." },
      { correct: "나 어떡해", wrong: "나 어떻게", tip: "'어떻게 해'가 줄어 문장 끝에 쓰면 '어떡해'예요." },
      { correct: "안절부절못해", wrong: "안절부절해", tip: "마음이 불안할 땐 '안절부절못하다'가 맞아요." },
      { correct: "역할", wrong: "역활", tip: "맡은 임무는 '역할'이 바른 말이에요." },
      { correct: "연애 편지", wrong: "연예 편지", tip: "사랑은 '연애', 방송·공연은 '연예'예요." },
      { correct: "무릅쓰다", wrong: "무릎쓰다", tip: "어려움을 견디며 나아가는 건 '무릅쓰다'예요." },
      { correct: "드러나다", wrong: "들어나다", tip: "숨겨진 것이 나타날 땐 '드러나다'예요." }
    ],
    // 12단계: 맞춤법 마스터 최종 도전
    [
      { correct: "통째로", wrong: "통채로", tip: "전부 그대로라는 뜻은 '통째로'예요." },
      { correct: "되뇌다", wrong: "되내다", tip: "같은 말을 자꾸 되풀이하는 건 '되뇌다'예요." },
      { correct: "삼가다", wrong: "삼가하다", tip: "조심해 하지 않는 것은 '삼가다'가 기본형이에요." },
      { correct: "내로라하는", wrong: "내노라하는", tip: "'내라 하는'이 줄어 '내로라하는'이 맞아요." },
      { correct: "눈살", wrong: "눈쌀", tip: "두 눈썹 사이는 '눈살'이에요." },
      { correct: "시치미", wrong: "시침이", tip: "모른 체하는 건 '시치미'를 떼다예요." },
      { correct: "허구한 날", wrong: "허구헌 날", tip: "매우 많은 날을 뜻할 땐 '허구한 날'이에요." },
      { correct: "풍비박산", wrong: "풍지박산", tip: "사방으로 흩어짐은 '풍비박산'이 맞아요." },
      { correct: "안성맞춤", wrong: "안성마춤", tip: "딱 들어맞는 것은 '안성맞춤'이에요." },
      { correct: "곱빼기", wrong: "곱배기", tip: "두 배로 많이 주는 것은 '곱빼기'예요." }
    ]
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
  getTierKey(stageIdx) {
    if (stageIdx < 3) return "tier1";
    if (stageIdx < 6) return "tier2";
    if (stageIdx < 9) return "tier3";
    return "tier4";
  },
  getStageWordsOnly(stageIdx) {
    const idx = Math.max(0, Math.min(this.stages.length - 1, stageIdx || 0));
    return this.stages[idx];
  },
  getForStage(stageIdx) {
    const base = this.getStageWordsOnly(stageIdx);
    const tierKey = this.getTierKey(stageIdx);
    const custom = this.getCustomWords().filter((w) => !w.tier || w.tier === "all" || w.tier === tierKey);
    if (!custom.length) return base;
    // 교사 입력 단어가 자주 등장하도록 가중치 부여
    return custom.concat(custom, base);
  }
};
