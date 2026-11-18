"use strict";

/* ============================================================
   SVG 아트 에셋 라이브러리 (태블릿 수학 게임 전용)
   - 한국 화폐(10원·50원·100원·500원·1000원 + 1원 칩) SVG
   - 마트 물건·과일·문구·간식·동물 친구 캐릭터 SVG
   - 천칭 저울·금고·비커·자·시계·피자·보물상자·축하 폭죽 SVG
   ============================================================ */
(function (global) {
  let svgUid = 0;
  function uid(prefix) {
    svgUid += 1;
    return `${prefix || 'svg'}_${svgUid}`;
  }

  function coinSVG(denom, size = 64, opts = {}) {
    const v = Number(denom);
    const id = uid(`coin${v}`);
    const label = opts.label || `${v}원`;
    if (v === 1000) {
      const w = Math.round(size * 1.65);
      const h = Math.round(size * 0.88);
      return `<svg viewBox="0 0 132 70" width="${w}" height="${h}" class="sm-svg-bill" aria-label="1000원 지폐">
        <defs>
          <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="50%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#7dd3fc"/>
          </linearGradient>
        </defs>
        <rect x="2" y="3" width="128" height="64" rx="10" fill="url(#${id}bg)" stroke="#0284c7" stroke-width="2.6"/>
        <rect x="8" y="9" width="116" height="52" rx="6" fill="none" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="4 3"/>
        <circle cx="34" cy="35" r="17" fill="#fff" stroke="#0284c7" stroke-width="2"/>
        <circle cx="34" cy="31" r="6" fill="#0369a1"/>
        <path d="M23 45c2-6 20-6 22 0" fill="#0369a1"/>
        <rect x="58" y="16" width="60" height="38" rx="6" fill="rgba(255,255,255,0.72)"/>
        <text x="88" y="36" text-anchor="middle" font-size="16" font-weight="900" fill="#0c4a6e">1,000</text>
        <text x="88" y="49" text-anchor="middle" font-size="9.5" font-weight="900" fill="#0284c7">천 원</text>
        <circle cx="114" cy="18" r="4" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
      </svg>`;
    }

    const palette = {
      1: { outer: '#fde68a', inner: '#fef3c7', rim: '#b45309', text: '#78350f', motif: 'dot', num: '1' },
      10: { outer: '#f59e0b', inner: '#fed7aa', rim: '#b45309', text: '#7c2d12', motif: 'pagoda', num: '10' },
      50: { outer: '#e2e8f0', inner: '#fef9c3', rim: '#64748b', text: '#334155', motif: 'rice', num: '50' },
      100: { outer: '#cbd5e1', inner: '#f8fafc', rim: '#475569', text: '#1e293b', motif: 'crown', num: '100' },
      500: { outer: '#94a3b8', inner: '#f1f5f9', rim: '#334155', text: '#0f172a', motif: 'crane', num: '500' },
    }[v] || { outer: '#fde047', inner: '#fef9c3', rim: '#ca8a04', text: '#713f12', motif: 'dot', num: String(v) };

    const motifSvg = palette.motif === 'pagoda'
      ? `<path d="M26 20h12M23 24h18M28 24v4M36 24v4M25 28h14" stroke="${palette.rim}" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>`
      : palette.motif === 'rice'
        ? `<path d="M18 38q-4-10 3-18M46 38q4-10-3-18" fill="none" stroke="#ca8a04" stroke-width="2.2" stroke-linecap="round" opacity="0.65"/>`
        : palette.motif === 'crown'
          ? `<path d="M22 22l4-5 6 4 6-4 4 5z" fill="${palette.rim}" opacity="0.28"/>`
          : palette.motif === 'crane'
            ? `<path d="M17 24q15-10 30 0" fill="none" stroke="${palette.rim}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`
            : '';

    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-coin" aria-label="${label}">
      <defs>
        <radialGradient id="${id}g" cx="35%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="${palette.inner}"/>
          <stop offset="100%" stop-color="${palette.outer}"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="34" r="28" fill="rgba(15,23,42,0.16)"/>
      <circle cx="32" cy="31" r="28" fill="url(#${id}g)" stroke="${palette.rim}" stroke-width="3"/>
      <circle cx="32" cy="31" r="22" fill="none" stroke="${palette.rim}" stroke-width="1.4" stroke-dasharray="3 2.5" opacity="0.55"/>
      ${motifSvg}
      <text x="32" y="${v >= 100 ? 37 : 36}" text-anchor="middle" font-size="${v >= 100 ? 15 : 17}" font-weight="900" fill="${palette.text}">${palette.num}</text>
      <text x="32" y="48" text-anchor="middle" font-size="9" font-weight="900" fill="${palette.rim}">원</text>
      <ellipse cx="22" cy="18" rx="7" ry="3.2" transform="rotate(-28 22 18)" fill="#fff" opacity="0.55"/>
    </svg>`;
  }

  function itemSVG(kind, size = 54) {
    const id = uid('it');
    const wrap = (inner, label) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-item" aria-label="${label}">${inner}</svg>`;
    switch (kind) {
      case 'apple':
        return wrap(`
          <defs><radialGradient id="${id}" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="45%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/></radialGradient></defs>
          <path d="M32 15c0-5 4-9 8-10" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M33 14c5-7 15-6 16 1-6 4-12 3-16-1z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M32 19c-9-4-20 3-20 17 0 13 9 22 16 22 2.5 0 3.5-1.5 4-1.5s1.5 1.5 4 1.5c7 0 16-9 16-22 0-14-11-21-20-17z" fill="url(#${id})" stroke="#991b1b" stroke-width="2"/>
          <ellipse cx="22" cy="28" rx="4" ry="7" transform="rotate(-20 22 28)" fill="#fff" opacity="0.45"/>`, '사과');
      case 'greenApple':
        return wrap(`
          <path d="M32 15c0-5 4-9 8-10" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M33 14c5-7 15-6 16 1-6 4-12 3-16-1z" fill="#16a34a"/>
          <path d="M32 19c-9-4-20 3-20 17 0 13 9 22 16 22 2.5 0 3.5-1.5 4-1.5s1.5 1.5 4 1.5c7 0 16-9 16-22 0-14-11-21-20-17z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
          <ellipse cx="22" cy="28" rx="4" ry="7" transform="rotate(-20 22 28)" fill="#fff" opacity="0.45"/>`, '초록 사과');
      case 'lemon':
        return wrap(`
          <path d="M12 35c0-11 10-18 20-18s20 7 20 18-10 18-20 18-20-7-20-18z" fill="#fde047" stroke="#ca8a04" stroke-width="2.2"/>
          <circle cx="11" cy="35" r="4" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
          <circle cx="53" cy="35" r="4" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
          <path d="M32 17c4-7 13-7 15 0-5 3-11 3-15 0z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <ellipse cx="24" cy="27" rx="6" ry="3" transform="rotate(-18 24 27)" fill="#fff" opacity="0.55"/>`, '레몬');
      case 'grape':
        return wrap(`
          <path d="M32 8v10" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
          <path d="M32 14c6-6 14-4 15 2-6 3-11 2-15-2z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <g fill="#9333ea" stroke="#6b21a8" stroke-width="1.6">
            <circle cx="24" cy="24" r="7.5"/><circle cx="32" cy="24" r="7.5"/><circle cx="40" cy="24" r="7.5"/>
            <circle cx="27" cy="34" r="7.5"/><circle cx="37" cy="34" r="7.5"/>
            <circle cx="32" cy="44" r="7.5"/><circle cx="32" cy="52" r="6.5"/>
          </g>
          <circle cx="22" cy="22" r="2" fill="#fff" opacity="0.5"/><circle cx="30" cy="22" r="2" fill="#fff" opacity="0.5"/>`, '포도');
      case 'banana':
        return wrap(`
          <path d="M14 44c12 8 33 1 39-22 2-5 5-4 4 2-4 22-24 33-42 25-4-2-4-7-1-5z" fill="#facc15" stroke="#ca8a04" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M51 17l3-4" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
          <path d="M22 46c10 1 20-5 26-16" fill="none" stroke="#fef9c3" stroke-width="2.5" stroke-linecap="round"/>`, '바나나');
      case 'orange':
        return wrap(`
          <circle cx="32" cy="35" r="20" fill="#fb923c" stroke="#c2410c" stroke-width="2.2"/>
          <path d="M32 15c3-6 11-7 14-1-5 3-10 3-14 1z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <ellipse cx="24" cy="26" rx="5" ry="3.5" transform="rotate(-25 24 26)" fill="#fff" opacity="0.45"/>
          <circle cx="39" cy="39" r="1.3" fill="#c2410c" opacity="0.5"/><circle cx="35" cy="44" r="1.3" fill="#c2410c" opacity="0.5"/>`, '귤');
      case 'strawberry':
        return wrap(`
          <path d="M16 25c0-6 7-10 16-10s16 4 16 10c0 13-10 28-16 28S16 38 16 25z" fill="#f43f5e" stroke="#be123c" stroke-width="2.2"/>
          <path d="M20 17l6-5 6 4 6-4 6 5-12 3z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <g fill="#fef08a"><circle cx="25" cy="27" r="1.5"/><circle cx="32" cy="29" r="1.5"/><circle cx="39" cy="27" r="1.5"/><circle cx="28" cy="37" r="1.5"/><circle cx="36" cy="37" r="1.5"/><circle cx="32" cy="45" r="1.5"/></g>`, '딸기');
      case 'cookie':
        return wrap(`
          <circle cx="32" cy="32" r="22" fill="#f59e0b" stroke="#92400e" stroke-width="2.4"/>
          <circle cx="32" cy="32" r="18" fill="#fbbf24"/>
          <circle cx="23" cy="25" r="3.2" fill="#78350f"/><circle cx="38" cy="23" r="2.8" fill="#78350f"/>
          <circle cx="26" cy="39" r="3.3" fill="#78350f"/><circle cx="40" cy="37" r="3" fill="#78350f"/><circle cx="32" cy="31" r="2.6" fill="#78350f"/>`, '쿠키');
      case 'candy':
        return wrap(`
          <polygon points="10,24 20,32 10,40" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <polygon points="54,24 44,32 54,40" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <rect x="18" y="20" width="28" height="24" rx="12" fill="#fb7185" stroke="#be123c" stroke-width="2.2"/>
          <path d="M26 21v22M38 21v22" stroke="#fff" stroke-width="4" opacity="0.65"/>`, '사탕');
      case 'milk':
        return wrap(`
          <polygon points="20,18 32,9 44,18" fill="#dbeafe" stroke="#2563eb" stroke-width="2.2" stroke-linejoin="round"/>
          <rect x="20" y="18" width="24" height="36" rx="4" fill="#fff" stroke="#2563eb" stroke-width="2.2"/>
          <rect x="20" y="30" width="24" height="16" fill="#60a5fa"/>
          <text x="32" y="42" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">우유</text>`, '우유');
      case 'bread':
        return wrap(`
          <path d="M12 38c0-13 9-22 20-22s20 9 20 22c0 8-5 12-12 12H24c-7 0-12-4-12-12z" fill="#fbbf24" stroke="#b45309" stroke-width="2.2"/>
          <path d="M22 24l4 8M32 21l2 9M42 24l-4 8" stroke="#92400e" stroke-width="2.2" stroke-linecap="round"/>`, '빵');
      case 'icecream':
        return wrap(`
          <polygon points="22,33 42,33 32,57" fill="#fcd34d" stroke="#b45309" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="32" cy="24" r="12" fill="#f9a8d4" stroke="#db2777" stroke-width="2"/>
          <circle cx="25" cy="28" r="7" fill="#fbcfe8"/><circle cx="39" cy="28" r="7" fill="#fbcfe8"/>
          <circle cx="32" cy="11" r="4" fill="#ef4444"/>`, '아이스크림');
      case 'pencil':
        return wrap(`
          <g transform="rotate(-30 32 32)">
            <rect x="25" y="10" width="14" height="36" rx="2" fill="#facc15" stroke="#a16207" stroke-width="2"/>
            <rect x="25" y="8" width="14" height="8" rx="3" fill="#fda4af" stroke="#be123c" stroke-width="1.8"/>
            <polygon points="25,46 39,46 32,58" fill="#fde68a" stroke="#a16207" stroke-width="2"/>
            <polygon points="30,54 34,54 32,58" fill="#1e293b"/>
          </g>`, '연필');
      case 'eraser':
        return wrap(`
          <rect x="14" y="20" width="36" height="24" rx="5" fill="#fff" stroke="#334155" stroke-width="2.2"/>
          <rect x="26" y="20" width="24" height="24" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
          <line x1="32" y1="26" x2="44" y2="26" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`, '지우개');
      case 'ball':
        return wrap(`
          <circle cx="32" cy="32" r="22" fill="#fff" stroke="#2563eb" stroke-width="2.4"/>
          <path d="M32 10a22 22 0 0 1 0 44M14 22c10 4 26 4 36 0M14 42c10-4 26-4 36 0" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
          <circle cx="25" cy="24" r="4" fill="#fde047"/>`, '공');
      case 'box':
        return wrap(`
          <rect x="14" y="18" width="36" height="32" rx="5" fill="#fed7aa" stroke="#ea580c" stroke-width="2.4"/>
          <rect x="11" y="14" width="42" height="10" rx="4" fill="#fdba74" stroke="#ea580c" stroke-width="2"/>
          <line x1="32" y1="14" x2="32" y2="50" stroke="#ef4444" stroke-width="4"/>`, '상자');
      case 'puppy':
        return wrap(`
          <ellipse cx="16" cy="30" rx="7" ry="13" fill="#b45309"/>
          <ellipse cx="48" cy="30" rx="7" ry="13" fill="#b45309"/>
          <circle cx="32" cy="33" r="17" fill="#fde68a" stroke="#92400e" stroke-width="2.2"/>
          <circle cx="26" cy="30" r="2.8" fill="#1e293b"/><circle cx="38" cy="30" r="2.8" fill="#1e293b"/>
          <ellipse cx="32" cy="36" rx="4" ry="3" fill="#1e293b"/>
          <path d="M27 41q5 4 10 0" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>`, '강아지');
      case 'gem':
        return wrap(`
          <polygon points="20,16 44,16 54,28 32,52 10,28" fill="#38bdf8" stroke="#0284c7" stroke-width="2.4" stroke-linejoin="round"/>
          <polygon points="20,16 44,16 39,28 25,28" fill="#bae6fd"/>
          <polygon points="25,28 39,28 32,52" fill="#0ea5e9"/>`, '보석');
      case 'star':
      default:
        return wrap(`
          <polygon points="32,7 39,22 56,24 44,36 47,53 32,45 17,53 20,36 8,24 25,22" fill="#facc15" stroke="#ca8a04" stroke-width="2.4" stroke-linejoin="round"/>
          <circle cx="27" cy="28" r="2.2" fill="#854d0e"/><circle cx="37" cy="28" r="2.2" fill="#854d0e"/>
          <path d="M28 34q4 4 8 0" fill="none" stroke="#854d0e" stroke-width="2" stroke-linecap="round"/>`, '별');
    }
  }

  function mascotSVG(type = 'bunny', mood = 'happy', size = 66) {
    const face = mood === 'cheer'
      ? `<path d="M22 33q3-4 6 0M36 33q3-4 6 0" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round"/>
         <path d="M25 41q7 7 14 0z" fill="#f43f5e" stroke="#0f172a" stroke-width="1.6"/>`
      : mood === 'think'
        ? `<circle cx="25" cy="33" r="2.8" fill="#0f172a"/><circle cx="39" cy="33" r="2.8" fill="#0f172a"/>
           <line x1="27" y1="43" x2="37" y2="41" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>`
        : `<circle cx="25" cy="33" r="2.8" fill="#0f172a"/><circle cx="39" cy="33" r="2.8" fill="#0f172a"/>
           <path d="M27 41q5 5 10 0" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>`;

    if (type === 'frog') {
      return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-mascot" aria-hidden="true">
        <circle cx="21" cy="18" r="8" fill="#4ade80" stroke="#15803d" stroke-width="2.2"/>
        <circle cx="43" cy="18" r="8" fill="#4ade80" stroke="#15803d" stroke-width="2.2"/>
        <circle cx="21" cy="18" r="4" fill="#fff"/><circle cx="43" cy="18" r="4" fill="#fff"/>
        <circle cx="21" cy="18" r="2" fill="#0f172a"/><circle cx="43" cy="18" r="2" fill="#0f172a"/>
        <ellipse cx="32" cy="38" rx="22" ry="17" fill="#4ade80" stroke="#15803d" stroke-width="2.4"/>
        <ellipse cx="32" cy="43" rx="15" ry="9" fill="#dcfce7"/>
        <circle cx="19" cy="38" r="3.5" fill="#fda4af" opacity="0.7"/><circle cx="45" cy="38" r="3.5" fill="#fda4af" opacity="0.7"/>
        <path d="M23 41q9 6 18 0" fill="none" stroke="#14532d" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`;
    }
    if (type === 'bear') {
      return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-mascot" aria-hidden="true">
        <circle cx="17" cy="18" r="8" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
        <circle cx="47" cy="18" r="8" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
        <circle cx="32" cy="35" r="21" fill="#f59e0b" stroke="#78350f" stroke-width="2.4"/>
        <ellipse cx="32" cy="41" rx="10" ry="8" fill="#fef3c7"/>
        <ellipse cx="32" cy="38" rx="4" ry="2.8" fill="#78350f"/>
        ${face}
      </svg>`;
    }
    if (type === 'fox') {
      return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-mascot" aria-hidden="true">
        <polygon points="13,10 26,22 14,30" fill="#fb923c" stroke="#c2410c" stroke-width="2.2" stroke-linejoin="round"/>
        <polygon points="51,10 38,22 50,30" fill="#fb923c" stroke="#c2410c" stroke-width="2.2" stroke-linejoin="round"/>
        <ellipse cx="32" cy="37" rx="21" ry="18" fill="#fb923c" stroke="#c2410c" stroke-width="2.4"/>
        <path d="M13 40q19 14 38 0-8 14-19 15-11-1-19-15z" fill="#fff7ed"/>
        <ellipse cx="32" cy="44" rx="3.5" ry="2.5" fill="#1e293b"/>
        ${face}
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="sm-svg-mascot" aria-hidden="true">
      <ellipse cx="22" cy="15" rx="6" ry="13" fill="#fff" stroke="#cbd5e1" stroke-width="2.2"/>
      <ellipse cx="42" cy="15" rx="6" ry="13" fill="#fff" stroke="#cbd5e1" stroke-width="2.2"/>
      <ellipse cx="22" cy="15" rx="3" ry="8" fill="#fbcfe8"/>
      <ellipse cx="42" cy="15" rx="3" ry="8" fill="#fbcfe8"/>
      <circle cx="32" cy="38" r="20" fill="#fff" stroke="#94a3b8" stroke-width="2.4"/>
      <circle cx="19" cy="39" r="3.5" fill="#fda4af" opacity="0.7"/><circle cx="45" cy="39" r="3.5" fill="#fda4af" opacity="0.7"/>
      ${face}
    </svg>`;
  }

  function basketSVG(color = '#ef4444', bg = '#fee2e2', size = 54) {
    return `<svg viewBox="0 0 64 56" width="${size}" height="${Math.round(size * 0.87)}" aria-hidden="true">
      <path d="M18 22l8-14M46 22l-8-14" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      <polygon points="8,22 56,22 50,50 14,50" fill="${bg}" stroke="${color}" stroke-width="2.8" stroke-linejoin="round"/>
      <line x1="12" y1="31" x2="52" y2="31" stroke="${color}" stroke-width="2" opacity="0.5"/>
      <line x1="14" y1="40" x2="50" y2="40" stroke="${color}" stroke-width="2" opacity="0.5"/>
      <line x1="25" y1="22" x2="27" y2="50" stroke="${color}" stroke-width="2" opacity="0.45"/>
      <line x1="39" y1="22" x2="37" y2="50" stroke="${color}" stroke-width="2" opacity="0.45"/>
    </svg>`;
  }

  function balanceBeamSVG(leftVal, rightVal) {
    const diff = clamp(rightVal - leftVal, -8, 8);
    const angle = diff * 2.2;
    const sign = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';
    return `<svg viewBox="0 0 320 120" class="sm-scale-svg" role="img" aria-label="천칭 저울 왼쪽 ${leftVal}, 오른쪽 ${rightVal}">
      <polygon points="145,112 175,112 164,52 156,52" fill="#475569"/>
      <rect x="116" y="108" width="88" height="10" rx="5" fill="#334155"/>
      <g transform="rotate(${angle} 160 48)">
        <rect x="44" y="44" width="232" height="8" rx="4" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
        <line x1="58" y1="52" x2="40" y2="80" stroke="#64748b" stroke-width="2"/>
        <line x1="58" y1="52" x2="76" y2="80" stroke="#64748b" stroke-width="2"/>
        <path d="M32 80h52q-4 14-26 14t-26-14z" fill="#dbeafe" stroke="#2563eb" stroke-width="2.4"/>
        <text x="58" y="75" text-anchor="middle" font-size="16" font-weight="900" fill="#1e40af">${leftVal}</text>
        <line x1="262" y1="52" x2="244" y2="80" stroke="#64748b" stroke-width="2"/>
        <line x1="262" y1="52" x2="280" y2="80" stroke="#64748b" stroke-width="2"/>
        <path d="M236 80h52q-4 14-26 14t-26-14z" fill="#dcfce7" stroke="#16a34a" stroke-width="2.4"/>
        <text x="262" y="75" text-anchor="middle" font-size="16" font-weight="900" fill="#166534">${rightVal}</text>
      </g>
      <circle cx="160" cy="48" r="15" fill="#fff" stroke="#d97706" stroke-width="3"/>
      <text x="160" y="54" text-anchor="middle" font-size="19" font-weight="900" fill="#b45309">${sign}</text>
    </svg>`;
  }

  function pizzaSVG(n, d, color = '#f97316', size = 128) {
    const pieces = Math.max(1, d);
    const id = uid('pz');
    let slices = '';
    for (let i = 0; i < pieces; i++) {
      const a0 = (i / pieces) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / pieces) * Math.PI * 2 - Math.PI / 2;
      const x1 = 60 + 48 * Math.cos(a0), y1 = 60 + 48 * Math.sin(a0);
      const x2 = 60 + 48 * Math.cos(a1), y2 = 60 + 48 * Math.sin(a1);
      const path = pieces === 1
        ? 'M60 60 m-48 0 a48 48 0 1 0 96 0 a48 48 0 1 0 -96 0'
        : `M60 60 L${x1} ${y1} A48 48 0 0 1 ${x2} ${y2} Z`;
      const on = i < n;
      const mid = (a0 + a1) / 2;
      const px = 60 + 28 * Math.cos(mid);
      const py = 60 + 28 * Math.sin(mid);
      slices += `<path d="${path}" fill="${on ? color : '#f8fafc'}" stroke="#b45309" stroke-width="2.2" class="sm-pizza-slice${on ? ' on' : ''}" data-pz-idx="${i}"/>`;
      if (on) {
        slices += `<circle cx="${px}" cy="${py}" r="4.5" fill="#ef4444" opacity="0.85" pointer-events="none"/>`;
      }
    }
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="sm-pizza-svg" role="img" aria-label="${d}조각 중 ${n}조각">
      <defs><radialGradient id="${id}" cx="50%" cy="50%" r="50%"><stop offset="82%" stop-color="#fde68a"/><stop offset="100%" stop-color="#d97706"/></radialGradient></defs>
      <circle cx="60" cy="60" r="54" fill="url(#${id})" stroke="#b45309" stroke-width="2.5"/>
      ${slices}
      <circle cx="60" cy="60" r="5" fill="#fff" stroke="#b45309" stroke-width="2"/>
    </svg>`;
  }

  function potionBeakerSVG(tenths, maxTenths = 10, color = '#3b82f6', size = 140) {
    const id = uid('pot');
    const ratio = clamp(tenths / maxTenths, 0, 1);
    const fillH = Math.round(ratio * 100);
    const yTop = 122 - fillH;
    const isFull = tenths >= maxTenths;
    const liqColor = isFull ? '#f59e0b' : color;
    let ticks = '';
    for (let i = 1; i <= maxTenths; i++) {
      const y = 122 - (i / maxTenths) * 100;
      ticks += `<line x1="36" y1="${y}" x2="${i % 5 === 0 ? 52 : 45}" y2="${y}" stroke="#475569" stroke-width="${i % 5 === 0 ? 2 : 1.3}"/>
        ${i % 2 === 0 ? `<text x="29" y="${y + 3.5}" text-anchor="end" font-size="9.5" font-weight="800" fill="#475569">${(i / 10).toFixed(1)}</text>` : ''}`;
    }
    const bubbles = tenths > 0 ? `
      <circle cx="52" cy="${Math.min(115, yTop + 18)}" r="3.2" fill="#fff" opacity="0.65" class="svg-bounce-1"/>
      <circle cx="72" cy="${Math.min(116, yTop + 26)}" r="2.4" fill="#fff" opacity="0.55" class="svg-bounce-2"/>
      <circle cx="63" cy="${Math.min(112, yTop + 10)}" r="2" fill="#fff" opacity="0.7" class="svg-pulse-x"/>` : '';
    return `<svg viewBox="0 0 120 144" width="${size}" height="${Math.round(size * 1.2)}" role="img" aria-label="물약 눈금 ${(tenths / 10).toFixed(1)}">
      <defs><clipPath id="${id}cp"><rect x="36" y="20" width="58" height="104" rx="8"/></clipPath></defs>
      <rect x="36" y="20" width="58" height="104" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
      <g clip-path="url(#${id}cp)">
        <rect x="36" y="${yTop}" width="58" height="${fillH + 4}" fill="${liqColor}" opacity="0.86"/>
        <path d="M36 ${yTop} Q50 ${yTop - 4} 65 ${yTop} T94 ${yTop}" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.7"/>
        ${bubbles}
      </g>
      ${ticks}
      <path d="M30 20h70" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
      <text x="65" y="139" text-anchor="middle" font-size="13" font-weight="900" fill="#1e293b">${(tenths / 10).toFixed(1)}${isFull ? ' ✨' : ''}</text>
    </svg>`;
  }

  function tugOfWarSVG(leftLabel, rightLabel, shift = 0) {
    const knotX = 160 + clamp(shift, -48, 48);
    return `<svg viewBox="0 0 320 112" class="sm-scale-svg" role="img" aria-label="줄다리기 ${leftLabel} 대 ${rightLabel}">
      <rect x="10" y="88" width="300" height="14" rx="7" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>
      <line x1="160" y1="18" x2="160" y2="92" stroke="#cbd5e1" stroke-width="2.5" stroke-dasharray="4 4"/>
      <polygon points="160,16 176,23 160,30" fill="#f59e0b"/>
      <line x1="46" y1="62" x2="274" y2="62" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${knotX}" cy="62" r="9" fill="#ef4444" stroke="#fff" stroke-width="2.5"/>
      <g transform="translate(26,34)">
        <circle cx="20" cy="20" r="18" fill="#dbeafe" stroke="#2563eb" stroke-width="2.6"/>
        <text x="20" y="26" text-anchor="middle" font-size="15" font-weight="900" fill="#1e3a8a">${leftLabel}</text>
      </g>
      <g transform="translate(254,34)">
        <circle cx="20" cy="20" r="18" fill="#dcfce7" stroke="#16a34a" stroke-width="2.6"/>
        <text x="20" y="26" text-anchor="middle" font-size="15" font-weight="900" fill="#14532d">${rightLabel}</text>
      </g>
    </svg>`;
  }

  function rocketSVG(size = 44) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
      <path d="M12 38l-8 8 10 2-2 10 8-8z" fill="#f97316" class="svg-pulse-x"/>
      <path d="M18 36l-4 12 12-4z" fill="#facc15"/>
      <path d="M22 42c10 4 24-6 30-26-20 6-30 20-26 30z" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.8" stroke-linejoin="round"/>
      <circle cx="38" cy="26" r="5.5" fill="#38bdf8" stroke="#0369a1" stroke-width="2"/>
      <path d="M22 28l-9-3 6-8zM36 42l3 9 8-6z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>`;
  }

  function bowlingPinSVG(knocked = false, size = 48) {
    return `<svg viewBox="0 0 40 68" width="${Math.round(size * 0.6)}" height="${size}" class="sm-pin-svg${knocked ? ' knocked' : ''}" aria-hidden="true">
      <path d="M20 6c-4 0-6 4-5 10 1 5-6 14-6 26 0 11 4 20 11 20s11-9 11-20c0-12-7-21-6-26 1-6-1-10-5-10z" fill="#fff" stroke="#334155" stroke-width="2.6"/>
      <rect x="14" y="20" width="12" height="4" rx="2" fill="#ef4444"/>
      <rect x="14" y="26" width="12" height="3" rx="1.5" fill="#ef4444"/>
    </svg>`;
  }

  function skyBackdropSVG(minutes) {
    const h = Math.floor((((minutes % 1440) + 1440) % 1440) / 60);
    const isNight = h >= 19 || h < 6;
    const isSunset = h >= 17 && h < 19;
    const bg = isNight ? '#1e1b4b' : isSunset ? '#ffedd5' : '#e0f2fe';
    const orb = isNight
      ? `<circle cx="46" cy="24" r="11" fill="#fde047"/><circle cx="51" cy="21" r="9" fill="${bg}"/><circle cx="20" cy="18" r="2" fill="#fff" class="svg-twinkle"/><circle cx="82" cy="16" r="2.2" fill="#fff" class="svg-twinkle-2"/>`
      : `<circle cx="52" cy="24" r="12" fill="${isSunset ? '#f97316' : '#facc15'}" class="svg-pulse-x"/>`;
    const label = isNight ? '🌙 밤' : isSunset ? '🌇 저녁' : h < 12 ? '🌅 아침' : '☀️ 낮';
    return `<svg viewBox="0 0 104 48" width="104" height="48" style="border-radius:12px;border:2px solid #cbd5e1" aria-hidden="true">
      <rect width="104" height="48" fill="${bg}"/>
      ${orb}
      <text x="52" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="${isNight ? '#f8fafc' : '#0f172a'}">${label}</text>
    </svg>`;
  }

  function confettiSVG() {
    return `<svg viewBox="0 0 260 80" class="sm-confetti-svg" aria-hidden="true">
      <circle cx="30" cy="30" r="6" fill="#facc15" class="svg-bounce-1"/>
      <rect x="65" y="16" width="10" height="10" rx="2" transform="rotate(20 70 21)" fill="#3b82f6" class="svg-bounce-2"/>
      <polygon points="110,12 117,26 103,26" fill="#ec4899" class="svg-bounce-1"/>
      <circle cx="150" cy="22" r="5" fill="#22c55e" class="svg-bounce-2"/>
      <rect x="188" y="18" width="10" height="10" rx="2" transform="rotate(-25 193 23)" fill="#a855f7" class="svg-bounce-1"/>
      <polygon points="230,14 236,28 224,28" fill="#f97316" class="svg-bounce-2"/>
    </svg>`;
  }

  global.SM_SVG = {
    coinSVG,
    itemSVG,
    mascotSVG,
    basketSVG,
    balanceBeamSVG,
    pizzaSVG,
    potionBeakerSVG,
    tugOfWarSVG,
    rocketSVG,
    bowlingPinSVG,
    skyBackdropSVG,
    confettiSVG,
  };
})(window);
