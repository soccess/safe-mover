"use strict";

let SVG_SEQ = 0;

function faceSvg(mood){
 const c={
  happy:{bg:'#fff3c6',ring:'#f0c45c',shirt1:'#ffe08a',shirt2:'#f7c85f'},
  sad:{bg:'#e2f4fc',ring:'#8cc6dd',shirt1:'#c4e7f6',shirt2:'#9fd3ea'},
  angry:{bg:'#ffe5dd',ring:'#efa78f',shirt1:'#ffc3b0',shirt2:'#f3a38e'},
  surprised:{bg:'#eee8ff',ring:'#b0a1e2',shirt1:'#d8cdff',shirt2:'#bcabee'}
 }[mood]||{bg:'#fff3c6',ring:'#f0c45c',shirt1:'#ffe08a',shirt2:'#f7c85f'};
 const id='face-'+mood;
 let weather='';
 if(mood==='happy'){
  weather=`<g><circle cx="20" cy="22" r="12" fill="#fff3b0" opacity=".7" class="pulse"/><circle cx="20" cy="22" r="9.5" fill="#ffdf7f"/><g class="spinSlow" style="transform-origin:20px 22px" stroke="#f0bf4f" stroke-width="2.2" stroke-linecap="round"><path d="M20 6v5m0 22v5M4 22h5m22 0h5M9 11l3 3m16 16 3 3m0-22-3 3M12 35l-3 3"/></g><g fill="#fff"><path d="M96 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" class="twinkle"/><path d="M106 25l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" class="twinkle2"/></g></g>`;
 }else if(mood==='sad'){
  weather=`<g><g class="bob"><path d="M79 14q0-8 9-8t9 8q7 0 7 6t-7 6H79q-7 0-7-6t7-6" fill="#fff" stroke="#a9cfe0" stroke-width="1.6"/></g><g stroke="#87c6e2" stroke-width="2.4" stroke-linecap="round"><path class="rain" d="M84 30v6m9-4v6"/><path class="rain2" d="M101 30v6m-12 2v5"/></g><path d="M18 30q3-5 6 0q-3 4-6 0" fill="#9fd6ec" class="bob2"/></g>`;
 }else if(mood==='angry'){
  weather=`<g><g class="bob"><path d="M80 12q0-8 9-8t9 8q8 0 8 6t-8 6H80q-7 0-7-6t7-6" fill="#ffe0cf" stroke="#dfa48d" stroke-width="1.6"/></g><path d="M95 30l-5 10h6l-4 9 10-13h-6l4-6z" fill="#f2a24f" stroke="#cf7f33" stroke-width="1.2" stroke-linejoin="round" class="blink"/><g stroke="#f0a58f" stroke-width="2.4" fill="none" stroke-linecap="round" class="rise"><path d="M20 20q-6 4 0 9m8-14q-6 5 0 11"/></g></g>`;
 }else{
  weather=`<g fill="#fff"><path d="M20 12l2.6 6.4L29 21l-6.4 2.6L20 30l-2.6-6.4L11 21l6.4-2.6z" class="twinkle"/><path d="M100 34l1.8 4.4L106 40l-4.2 1.8L100 46l-1.8-4.2L94 40l4.2-1.6z" class="twinkle2"/></g><g fill="none" stroke="#c9b6f2" stroke-width="2.4" stroke-linecap="round" class="drift"><path d="M24 42q8-8 16 0t16 0"/><circle cx="92" cy="18" r="3" class="pulse"/></g>`;
 }
 let eyes='',mouth='',brows='',tear='',blush=`<ellipse cx="38" cy="77" rx="6.4" ry="3.6" fill="#f6a29f" opacity=".6"/><ellipse cx="82" cy="77" rx="6.4" ry="3.6" fill="#f6a29f" opacity=".6"/>`;
 if(mood==='happy'){
  eyes=`<g class="bob"><path d="M40 64q6-8 12 0M68 64q6-8 12 0" fill="none" stroke="#4a3733" stroke-width="3.4" stroke-linecap="round"/></g>`;
  mouth=`<path d="M49 76q11 13 22 0q-11 4-22 0z" fill="#c4616a" stroke="#8d4a50" stroke-width="2" stroke-linejoin="round"/><path d="M55 84q5-3 10 0" fill="#f6a3a8"/>`;
 }else if(mood==='sad'){
  brows=`<path d="M40 55q5-4 11-1M69 54q6-3 11 1" fill="none" stroke="#4a3733" stroke-width="2.6" stroke-linecap="round"/>`;
  eyes=`<g class="eyeBlink"><ellipse cx="47" cy="66" rx="5.4" ry="6" fill="#fff"/><ellipse cx="73" cy="66" rx="5.4" ry="6" fill="#fff"/><circle cx="47" cy="67" r="3.9" fill="#7a5947"/><circle cx="73" cy="67" r="3.9" fill="#7a5947"/><circle cx="47" cy="67" r="1.9" fill="#3d2b25"/><circle cx="73" cy="67" r="1.9" fill="#3d2b25"/><circle cx="45.7" cy="65" r="1.4" fill="#fff"/><circle cx="71.7" cy="65" r="1.4" fill="#fff"/><path d="M41 61q6-2 11 0M67 61q6-2 11 0" fill="none" stroke="#4a3733" stroke-width="1.6" opacity=".55"/></g>`;
  mouth=`<path d="M54 85q6-5 12 0" fill="none" stroke="#a25f63" stroke-width="2.6" stroke-linecap="round"/>`;
  tear=`<path class="tearDrop" d="M86 78q-4 7 0 10q4-3 0-10" fill="#8ed3ee" stroke="#5eafce" stroke-width="1.1"/>`;
 }else if(mood==='angry'){
  brows=`<path d="M39 55l13 6M68 61l13-6" fill="none" stroke="#4a3733" stroke-width="3.2" stroke-linecap="round"/>`;
  eyes=`<g class="eyeBlink"><path d="M41 63q6-3 12 0" fill="none" stroke="#4a3733" stroke-width="2.4"/><path d="M67 63q6-3 12 0" fill="none" stroke="#4a3733" stroke-width="2.4"/><ellipse cx="47" cy="66" rx="4.8" ry="4.2" fill="#fff"/><ellipse cx="73" cy="66" rx="4.8" ry="4.2" fill="#fff"/><circle cx="47" cy="66" r="2.8" fill="#5d4336"/><circle cx="73" cy="66" r="2.8" fill="#5d4336"/><circle cx="46" cy="65" r="1" fill="#fff"/><circle cx="72" cy="65" r="1" fill="#fff"/></g>`;
  mouth=`<path d="M51 83q9-4 18 0" fill="none" stroke="#8d4a50" stroke-width="2.6" stroke-linecap="round"/>`;
  blush=`<ellipse cx="37" cy="76" rx="7" ry="4" fill="#f28c80" opacity=".65"/><ellipse cx="83" cy="76" rx="7" ry="4" fill="#f28c80" opacity=".65"/>`;
 }else{
  brows=`<path d="M40 54q5-5 11-4M69 50q6-1 11 4" fill="none" stroke="#4a3733" stroke-width="2.6" stroke-linecap="round"/>`;
  eyes=`<g class="eyeBlink"><ellipse cx="47" cy="66" rx="6.2" ry="7.2" fill="#fff"/><ellipse cx="73" cy="66" rx="6.2" ry="7.2" fill="#fff"/><circle cx="47" cy="67" r="3" fill="#5d4336"/><circle cx="73" cy="67" r="3" fill="#5d4336"/><circle cx="47" cy="67" r="1.4" fill="#2f211c"/><circle cx="73" cy="67" r="1.4" fill="#2f211c"/><circle cx="45.6" cy="64.6" r="1.5" fill="#fff"/><circle cx="71.6" cy="64.6" r="1.5" fill="#fff"/></g>`;
  mouth=`<ellipse cx="60" cy="84" rx="5" ry="6.4" fill="#b45c63" stroke="#8d4a50" stroke-width="1.8"/><ellipse cx="60" cy="86" rx="2.6" ry="2.6" fill="#f3a0a5"/>`;
  blush=`<ellipse cx="37" cy="77" rx="6" ry="3.4" fill="#f6a29f" opacity=".55"/><ellipse cx="83" cy="77" rx="6" ry="3.4" fill="#f6a29f" opacity=".55"/>`;
 }
 return `<svg class="svg-anim" viewBox="0 0 120 120" role="img" aria-label="${(typeof moods!=='undefined'&&moods[mood]?moods[mood].label:'')} 표정 그림" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <radialGradient id="${id}-skin" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="#ffead3"/><stop offset=".62" stop-color="#ffd9b8"/><stop offset="1" stop-color="#f6c39c"/></radialGradient>
   <linearGradient id="${id}-shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.shirt1}"/><stop offset="1" stop-color="${c.shirt2}"/></linearGradient>
   <linearGradient id="${id}-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b443d"/><stop offset="1" stop-color="#3c2c28"/></linearGradient>
   <radialGradient id="${id}-bg" cx="34%" cy="24%" r="84%"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="${c.bg}"/><stop offset="1" stop-color="${c.ring}" stop-opacity=".5"/></radialGradient>
   <filter id="${id}-sh" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#6b5a52" flood-opacity=".2"/></filter>
   <clipPath id="${id}-clip"><circle cx="60" cy="60" r="55"/></clipPath>
  </defs>
  <circle cx="60" cy="60" r="55" fill="url(#${id}-bg)"/>
  <g filter="url(#${id}-sh)">
   <circle cx="60" cy="60" r="55" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="6"/>
   <circle cx="60" cy="60" r="50" fill="none" stroke="${c.ring}" stroke-width="1.6" stroke-dasharray="2 6" opacity=".85"/>
   <circle cx="60" cy="60" r="46" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="1"/>
  </g>
  <g fill="#fff" class="svg-anim"><path d="M16 40l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" class="twinkle" opacity=".9"/><path d="M105 87l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" class="twinkle2" opacity=".85"/><circle cx="104" cy="24" r="1.8" class="twinkle" opacity=".8"/><circle cx="16" cy="92" r="1.4" class="twinkle2" opacity=".7"/></g>
  ${weather}
  <g clip-path="url(#${id}-clip)">
  <path d="M14 106q2-26 46-26t46 26v10H14z" fill="url(#${id}-shirt)" stroke="#6b5a52" stroke-width="2"/>
  <path d="M46 92q14 9 28 0" fill="none" stroke="#ffffff" stroke-width="2" opacity=".55"/>
  <path d="M52 78h16v13H52z" fill="#f8cda7" stroke="#dca87f" stroke-width="1.4"/>
  <path d="M41 100q19-10 38 0" fill="none" stroke="#6b5a52" stroke-width="1.6" opacity=".35"/>
  <ellipse cx="27" cy="66" rx="5.4" ry="7" fill="#ffd3ac" stroke="#dfa87f" stroke-width="1.4"/>
  <ellipse cx="93" cy="66" rx="5.4" ry="7" fill="#ffd3ac" stroke="#dfa87f" stroke-width="1.4"/>
  <path d="M23 70q-3-42 37-43q41 1 37 43q0 17-9 24l-3-29q-11 8-25 8t-25-8l-3 29q-9-7-9-24z" fill="url(#${id}-hair)" stroke="#33241f" stroke-width="2"/>
  <ellipse cx="60" cy="62" rx="33" ry="35" fill="url(#${id}-skin)" stroke="#e0a87f" stroke-width="1.6"/>
  <path d="M27 57q-2-35 33-36q35 1 33 36q-4-10-9-16q-1 6-7 10q-8 5-20 4q-9-1-15 3q-9-4-15-1z" fill="url(#${id}-hair)" stroke="#33241f" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 25q-9 5-13 13q-4 7-12 11" fill="none" stroke="#33241f" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M64 27q9 3 16 12" fill="none" stroke="#33241f" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
  <path d="M34 32q11-8 24-6" fill="none" stroke="#7a5f55" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
  <path d="M27 56q-4 12-1 22M93 56q4 12 1 22" fill="none" stroke="#3c2c28" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(92 35) rotate(18)"><g fill="#f8a9b8"><ellipse cx="0" cy="-5" rx="3.1" ry="4.4"/><ellipse cx="4.8" cy="-1.5" rx="3.1" ry="4.4" transform="rotate(72 4.8 -1.5)"/><ellipse cx="3" cy="4.2" rx="3.1" ry="4.4" transform="rotate(144 3 4.2)"/><ellipse cx="-3" cy="4.2" rx="3.1" ry="4.4" transform="rotate(216 -3 4.2)"/><ellipse cx="-4.8" cy="-1.5" rx="3.1" ry="4.4" transform="rotate(288 -4.8 -1.5)"/></g><circle r="2.4" fill="#ffe89a"/></g>
  ${brows}${eyes}
  <path d="M58 71q2 1 4 0" fill="none" stroke="#d79c74" stroke-width="1.6" stroke-linecap="round"/>
  ${blush}${mouth}${tear}
  <path d="M28 64q-3 10 0 16" fill="none" stroke="#33241f" stroke-width="3" stroke-linecap="round" opacity=".85"/>
  <path d="M92 64q3 10 0 16" fill="none" stroke="#33241f" stroke-width="3" stroke-linecap="round" opacity=".85"/>
  </g>
 </svg>`;
}
/* ---------- 공통 장면 ---------- */
function bgScene(mood,type){
 const p=MOOD_PAL[mood]||MOOD_PAL.happy,id='bg-'+type+'-'+mood+'-'+(++SVG_SEQ);
 let weather='';
 const sun=`<g transform="translate(210 27)"><circle r="24" fill="url(#${id}-glow)" opacity=".8" class="pulse"/><circle r="13" fill="url(#${id}-sun)"/><g class="spinSlow" stroke="#eebc4e" stroke-width="2.4" stroke-linecap="round"><path d="M0-18v-5m0 46v-5M-18 0h-5m46 0h-5M-13-13l-3-3m32 32 3 3m0-32-3 3M-16 16l-3 3"/></g></g>`;
 const cloud=(x,y,s,o,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><g class="${cls}" fill="#fff"><ellipse cx="0" cy="0" rx="16" ry="9"/><circle cx="-8" cy="-3" r="8"/><circle cx="3" cy="-7" r="10"/><circle cx="11" cy="-1" r="7"/></g></g>`;
 if(mood==='happy'){
  weather=`${sun}${cloud(40,28,.9,.92,'bob')}${cloud(150,20,.6,.7,'bob2')}<g stroke="#c9a15a" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7" class="drift"><path d="M52 44q5-6 10 0q5-6 10 0"/><path d="M142 38q4-5 8 0q4-5 8 0"/></g><g fill="#fff" opacity=".85"><path d="M186 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" class="twinkle"/><path d="M24 70l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" class="twinkle2"/><path d="M126 22l1.4 3.4 3.4 1.4-3.4 1.4L126 32l-1.4-3.4-3.4-1.4 3.4-1.4z" class="twinkle"/></g><g stroke="#c9a15a" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55" class="drift2"><path d="M172 78q6-4 12 0M182 85q5-3 10 0"/></g>`;
 }else if(mood==='sad'){
  weather=`<g>${cloud(196,30,1.15,.95,'bob')}${cloud(58,22,.7,.75,'bob2')}<g stroke="#8ecbe4" stroke-width="2.2" stroke-linecap="round"><g class="rain"><path d="M180 48l-3 8m14-6-3 9"/></g><g class="rain2"><path d="M196 46l-2 7m12-5-2 7M66 40l-2 7"/></g></g></g><g fill="#fff" opacity=".6"><circle cx="30" cy="52" r="2" class="twinkle"/><circle cx="118" cy="34" r="1.6" class="twinkle2"/><circle cx="84" cy="24" r="1.4" class="twinkle"/></g><path d="M22 60q8-7 16 0" fill="none" stroke="#a9cfe0" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
 }else if(mood==='angry'){
  weather=`<g>${cloud(198,30,1.1,.9,'bob')}${cloud(64,24,.8,.6,'bob2')}<path d="M202 44l-7 14h8l-6 14 15-19h-8l6-9z" fill="#f3a24d" stroke="#cf7e32" stroke-width="1.6" stroke-linejoin="round" class="blink"/><g stroke="#e9a28c" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"><path d="M28 34q12-9 24 0t24 0"/><path d="M40 46q10-7 20 0"/></g><g fill="#f6b48c"><circle cx="176" cy="66" r="1.8" class="rise"/><circle cx="190" cy="74" r="1.4" class="rise"/><circle cx="162" cy="78" r="1.2" class="rise"/></g></g>`;
 }else{
  weather=`<g>${cloud(190,30,.95,.75,'bob')}<g fill="#fff"><path d="M34 28l2.6 6.6 6.6 2.6-6.6 2.6L34 46l-2.6-6.2L25 37.2l6.4-2.6z" class="twinkle"/><path d="M168 58l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8z" class="twinkle2"/><path d="M120 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" class="twinkle"/></g><g fill="none" stroke="#c2aef0" stroke-width="2.2" stroke-linecap="round" class="drift"><path d="M52 34q10-9 20 0t20 0"/><circle cx="140" cy="22" r="2.6"/><circle cx="154" cy="34" r="1.8"/><path d="M24 48q6-5 12 0"/></g></g>`;
 }
 const flowers=`<g><g transform="translate(28 108)" class="sway"><g fill="#fff"><circle cx="0" cy="-5" r="3"/><circle cx="4.8" cy="-1.6" r="3"/><circle cx="3" cy="4" r="3"/><circle cx="-3" cy="4" r="3"/><circle cx="-4.8" cy="-1.6" r="3"/></g><circle r="2" fill="#ffd35e"/></g><g transform="translate(232 104) scale(.9)" class="sway2"><g fill="#ffe1ea"><circle cx="0" cy="-5" r="3"/><circle cx="4.8" cy="-1.6" r="3"/><circle cx="3" cy="4" r="3"/><circle cx="-3" cy="4" r="3"/><circle cx="-4.8" cy="-1.6" r="3"/></g><circle r="2" fill="#ffd35e"/></g><g transform="translate(15 121) scale(.8)" class="sway2"><g fill="#fff3c0"><circle cx="0" cy="-4.6" r="2.7"/><circle cx="4.4" cy="-1.4" r="2.7"/><circle cx="2.7" cy="3.7" r="2.7"/><circle cx="-2.7" cy="3.7" r="2.7"/><circle cx="-4.4" cy="-1.4" r="2.7"/></g><circle r="1.8" fill="#e8a86a"/></g><g transform="translate(226 123) scale(.75)" class="sway"><g fill="#e6ddff"><circle cx="0" cy="-4.6" r="2.7"/><circle cx="4.4" cy="-1.4" r="2.7"/><circle cx="2.7" cy="3.7" r="2.7"/><circle cx="-2.7" cy="3.7" r="2.7"/><circle cx="-4.4" cy="-1.4" r="2.7"/></g><circle r="1.8" fill="#ffd35e"/></g><g stroke="#7fae6b" stroke-width="2" stroke-linecap="round"><path d="M28 112v7m204-6v6m-217 5v5m207-4v5"/><path d="M46 118q3-5 6 0m138 0q3-5 6 0"/><path d="M8 130q2-8 4-10m4 10q-1-7-4-9"/><path d="M234 132q2-7 4-9m3 9q-1-6-3-8"/></g></g>`;
 let groundExtra='';
 if(mood==='sad'){
  groundExtra=`<g><ellipse cx="196" cy="130" rx="21" ry="4.6" fill="#a9d6e6" opacity=".5"/><ellipse cx="196" cy="130" rx="13" ry="2.8" fill="none" stroke="#d7f1fa" stroke-width="1.4" class="pulse"/><ellipse cx="36" cy="133" rx="13" ry="3" fill="#a9d6e6" opacity=".4"/></g>`;
 }else if(mood==='happy'){
  groundExtra=`<g fill="#ffd97a"><path d="M148 128l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" opacity=".9" class="twinkle"/><path d="M186 134l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" opacity=".75" class="twinkle2"/></g>`;
 }else if(mood==='angry'){
  groundExtra=`<g stroke="#d9a08d" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"><path d="M160 128q6-5 12 0m-8 5q4-3 8 0"/><path d="M30 126q5-4 10 0"/></g>`;
 }else{
  groundExtra=`<g fill="#c9d6f0" opacity=".45"><circle cx="154" cy="130" r="2.2" class="pulse"/><circle cx="162" cy="135" r="1.5"/><circle cx="204" cy="127" r="1.8"/></g>`;
 }
 return `<defs>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2=".28" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset=".58" stop-color="${p.sky2}"/><stop offset="1" stop-color="${p.horizon||p.sky2}"/></linearGradient>
  <linearGradient id="${id}-hill" x1="0" y1="0" x2=".18" y2="1"><stop offset="0" stop-color="${p.hill}"/><stop offset=".6" stop-color="${p.hill2}"/><stop offset="1" stop-color="${p.hill}"/></linearGradient>
  <linearGradient id="${id}-ground" x1="0" y1="0" x2=".12" y2="1"><stop offset="0" stop-color="${p.ground}"/><stop offset="1" stop-color="${p.edge}"/></linearGradient>
  <radialGradient id="${id}-sun"><stop offset="0" stop-color="#fffbe2"/><stop offset=".55" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffd45f"/></radialGradient>
  <radialGradient id="${id}-glow"><stop offset="0" stop-color="#fffdf0" stop-opacity=".98"/><stop offset=".55" stop-color="#fff6c4" stop-opacity=".45"/><stop offset="1" stop-color="#fffdf0" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-light" cx="14%" cy="6%" r="86%"><stop offset="0" stop-color="#ffffff" stop-opacity=".6"/><stop offset=".45" stop-color="#fffdf5" stop-opacity=".16"/><stop offset="1" stop-color="#fffdf5" stop-opacity="0"/></radialGradient>
  <pattern id="${id}-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".62" fill="#fff" opacity=".5"/></pattern>
  <radialGradient id="${id}-vig" cx="50%" cy="42%" r="76%"><stop offset=".52" stop-color="#8a6a3f" stop-opacity="0"/><stop offset="1" stop-color="#8a6a3f" stop-opacity=".2"/></radialGradient>
  <filter id="${id}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
 </defs>
 <rect width="240" height="140" fill="url(#${id}-sky)"/>
 <rect width="240" height="140" fill="url(#${id}-dots)" opacity=".35" pointer-events="none"/>
 <g opacity=".45" pointer-events="none"><path d="M-10 6L38 140h24L30-4z" fill="#fff" opacity=".5"/><path d="M66-6L108 140h18L84-6z" fill="#fff" opacity=".32"/><path d="M176-8l30 148h16L198-8z" fill="#fff" opacity=".26"/></g>
 ${weather}
 <g fill="#5f6d55" opacity=".4"><path d="M118 40q4-4 8 0q4-4 8 0" fill="none" stroke="#7c8a6d" stroke-width="1.5" stroke-linecap="round"/><path d="M132 48q3-3 6 0q3-3 6 0" fill="none" stroke="#7c8a6d" stroke-width="1.3" stroke-linecap="round"/></g>
 <ellipse cx="206" cy="98" rx="62" ry="22" fill="#fff" opacity=".22" filter="url(#${id}-soft)"/>
 <path d="M0 100q38-24 82-11t78-3q40-10 80 9v45H0z" fill="${p.hill}" opacity=".5"/>
 <path d="M0 104q40-26 84-9t76-7q42-11 80 10v42H0z" fill="url(#${id}-hill)" opacity=".95"/>
 <path d="M0 113q46-18 92-4t70-2q42-8 78 6v27H0z" fill="url(#${id}-ground)"/>
 <path d="M0 113q46-18 92-4t70-2q42-8 78 6" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.6"/>
 <path d="M110 140q8-17 25-25q13-7 18-14" fill="none" stroke="#f6e9c8" stroke-width="7" stroke-linecap="round" opacity=".4"/>
 <path d="M0 118q46-14 92-1t70-2q42-7 78 5" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="4" stroke-linecap="round"/>
 <g transform="translate(126 111)"><circle cx="-9" cy="1" r="7" fill="#a5cf8e"/><circle cx="2" cy="-3" r="8" fill="#b6da9f"/><circle cx="12" cy="1" r="6" fill="#99c785"/><circle cx="4" cy="-8" r="3.4" fill="#cae3b8"/></g>
 <g transform="translate(29 111)"><path d="M-14-8L0-19l14 11z" fill="#e8a48d" stroke="#b97c66" stroke-width="1.4" stroke-linejoin="round"/><rect x="-11" y="-8" width="22" height="11" fill="#fff4dc" stroke="#b97c66" stroke-width="1.4"/><rect x="-2" y="-4" width="6" height="7" fill="#c98f6b"/><path d="M-14 8h28" stroke="#b97c66" stroke-width="1.2" opacity=".5"/><path d="M11-14v-7" stroke="#b97c66" stroke-width="1.4" stroke-linecap="round"/><path d="M11-21q4-2 6 2q-4 3-6-2" fill="#f6a3a8" stroke="#b97c66" stroke-width="1"/></g>
 <g transform="translate(42 58) rotate(-10)"><path d="M0 0q-8-9-2-13q7-3 8 6" fill="#ffe4a8" stroke="#dfb45f" stroke-width="1"/><path d="M0 0q8-9 2-13q-6-3-8 6" fill="#ffd07a" stroke="#dfb45f" stroke-width="1"/><path d="M0-3v7" stroke="#a97f50" stroke-width="1.4" stroke-linecap="round"/></g>
 <g fill="#e6d6b8" stroke="#c2ac87" stroke-width=".9"><ellipse cx="112" cy="124" rx="4" ry="2.3"/><ellipse cx="119" cy="121" rx="2.6" ry="1.7"/><ellipse cx="102" cy="128" rx="2.2" ry="1.4"/></g>
 <g fill="#fff" opacity=".8"><path d="M58 40l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" class="twinkle"/><path d="M204 88l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z" class="twinkle2"/></g>
 <g transform="translate(22 50)" class="drift"><g class="wingFlap" fill="#fff" stroke="#e9b7c3" stroke-width=".8"><path d="M0 0q-7-9 0-9t0 9" opacity=".95"/><path d="M0 0q-11 2-8-5q4-6 8 5" opacity=".9"/><path d="M0 0q11 2 8-5q-4-6-8 5" opacity=".9"/></g><path d="M0 0v5" stroke="#c9b79b" stroke-width=".8"/></g>
 <g transform="translate(224 64) scale(.8)" class="drift2"><g class="wingFlap" fill="#fff" stroke="#e9b7c3" stroke-width=".8"><path d="M0 0q-7-9 0-9t0 9"/><path d="M0 0q-11 2-8-5q4-6 8 5"/><path d="M0 0q11 2 8-5q-4-6-8 5"/></g><path d="M0 0v5" stroke="#c9b79b" stroke-width=".8"/></g>
 ${groundExtra}
 ${flowers}
 <rect width="240" height="140" fill="url(#${id}-light)" pointer-events="none" opacity=".7"/>
 <rect width="240" height="140" fill="url(#${id}-vig)" pointer-events="none"/>`;
}

/* ---------- 아이 캐릭터 ---------- */
function kid(mood,type,dx,dy,scale=1,alt=false){
 const arms={
  wide:{l:'M-14 29q-9 2-13 12',lh:[-27,41],r:'M14 29q9 2 13 12',rh:[27,41]},
  walk:{l:'M-14 29q-7 8-12 11',lh:[-26,40],r:'M14 29q8 5 13 8',rh:[27,37]},
  book:{l:'M-14 29q-5 8 2 13',lh:[-12,42],r:'M14 29q5 8-2 13',rh:[12,42]},
  cup:{l:'M-14 29q-7 8-5 15',lh:[-19,44],r:'M14 29q10 6 12 14',rh:[26,43]},
  raise:{l:'M-14 29q-12-3-15-13',lh:[-29,16],r:'M14 29q6 9 4 16',rh:[18,45]},
  draw:{l:'M-14 29q-6 9 1 14',lh:[-13,43],r:'M14 29q11 7 14 16',rh:[28,45]},
  hug:{l:'M-14 29q-1 14 10 13',lh:[8,38],r:'M14 29q1 14-10 13',rh:[-8,38]},
  hold:{l:'M-14 29q-5 12 8 14',lh:[-6,43],r:'M14 29q5 12-8 14',rh:[6,43]},
  cheer:{l:'M-14 29q-13 0-18-11',lh:[-32,18],r:'M14 29q13 0 18-11',rh:[32,18]},
  write:{l:'M-14 29q-6 10 1 15',lh:[-13,44],r:'M14 29q11 9 14 17',rh:[28,46]},
  wave:{l:'M-14 29q-8 8-9 16',lh:[-23,45],r:'M14 29q11-4 13-14',rh:[27,15]}
 };
 const pose=type==='friend'?(alt?{l:'M-14 29q-12 6-17 12',lh:[-31,41],r:'M14 29q4 9 3 15',rh:[17,44]}:{l:'M-14 29q-4 9-3 15',lh:[-17,44],r:'M14 29q12 6 17 12',rh:[31,41]}):(arms[SCENE_ARMS[type]]||arms.hold);
 const hair=alt?'#5a4038':'#46332f',hairDark=alt?'#3f2b26':'#33241f';
 const shirt=alt?'#ffc3ce':'#9fd6b8',shirtDark=alt?'#f0a8b6':'#7fbe9e';
 let face='',extra='';
 const blush=`<ellipse cx="-11" cy="10" rx="4.4" ry="2.6" fill="#f6a29f" opacity=".6"/><ellipse cx="11" cy="10" rx="4.4" ry="2.6" fill="#f6a29f" opacity=".6"/>`;
 if(mood==='happy'){
  face=`<path d="M-10 2q3.5-4.4 7 0M3 2q3.5-4.4 7 0" fill="none" stroke="#4a3733" stroke-width="2.4" stroke-linecap="round"/><path d="M-5 10q5 6 10 0q-5 2-10 0z" fill="#c4616a" stroke="#8d4a50" stroke-width="1.4" stroke-linejoin="round"/>`;
 }else if(mood==='sad'){
  face=`<path d="M-11-4q3-2 6-1M5-5q3-1 6 1" fill="none" stroke="#4a3733" stroke-width="1.7" stroke-linecap="round"/><g class="eyeBlink"><ellipse cx="-6.5" cy="3" rx="3.4" ry="4" fill="#fff"/><ellipse cx="6.5" cy="3" rx="3.4" ry="4" fill="#fff"/><circle cx="-6.5" cy="3.6" r="2.4" fill="#7a5947"/><circle cx="6.5" cy="3.6" r="2.4" fill="#7a5947"/><circle cx="-6.5" cy="3.6" r="1.1" fill="#3d2b25"/><circle cx="6.5" cy="3.6" r="1.1" fill="#3d2b25"/><circle cx="-7.4" cy="2.2" r=".9" fill="#fff"/><circle cx="5.6" cy="2.2" r=".9" fill="#fff"/></g><path d="M-4 12q4-3 8 0" fill="none" stroke="#a25f63" stroke-width="1.9" stroke-linecap="round"/><path class="tearDrop" d="M13 8q-2.6 4.6 0 6.6q2.6-2 0-6.6" fill="#8ed3ee" stroke="#5eafce" stroke-width=".8"/>`;
 }else if(mood==='angry'){
  face=`<path d="M-12-4l7 3M5-1l7-3" fill="none" stroke="#4a3733" stroke-width="2.1" stroke-linecap="round"/><path d="M-10 0q3-1.6 6 0M4 0q3-1.6 6 0" fill="none" stroke="#4a3733" stroke-width="1.5"/><g class="eyeBlink"><ellipse cx="-6.5" cy="3" rx="3" ry="2.7" fill="#fff"/><ellipse cx="6.5" cy="3" rx="3" ry="2.7" fill="#fff"/><circle cx="-6.5" cy="3" r="1.7" fill="#5d4336"/><circle cx="6.5" cy="3" r="1.7" fill="#5d4336"/></g><path d="M-5 11q5-2.6 10 0" fill="none" stroke="#8d4a50" stroke-width="1.9" stroke-linecap="round"/><path d="M-17-8q-5-3-3-8m37 8q5-3 3-8" fill="none" stroke="#f0a58f" stroke-width="1.8" stroke-linecap="round" class="rise"/>`;
 }else{
  face=`<path d="M-11-5q3-3 6-2M5-7q3-1 6 2" fill="none" stroke="#4a3733" stroke-width="1.7" stroke-linecap="round"/><g class="eyeBlink"><ellipse cx="-6.5" cy="3" rx="3.9" ry="4.5" fill="#fff"/><ellipse cx="6.5" cy="3" rx="3.9" ry="4.5" fill="#fff"/><circle cx="-6.5" cy="3" r="1.9" fill="#5d4336"/><circle cx="6.5" cy="3" r="1.9" fill="#5d4336"/><circle cx="-7.4" cy="1.8" r="1" fill="#fff"/><circle cx="5.6" cy="1.8" r="1" fill="#fff"/></g><ellipse cx="0" cy="11" rx="2.8" ry="3.6" fill="#b45c63" stroke="#8d4a50" stroke-width="1.2"/>`;
  extra=`<path d="M-20 3q-3-3 0-6" fill="none" stroke="#b8a6e6" stroke-width="1.8" stroke-linecap="round" class="bob"/>`;
 }
 if(type==='breathe'||type==='cozy'){
  face=`<path d="M-11 2q4 4 8 0M3 2q4 4 8 0" fill="none" stroke="#4a3733" stroke-width="2" stroke-linecap="round"/><path d="M-3 11q3 3 6 0" fill="none" stroke="#a25f63" stroke-width="1.8" stroke-linecap="round"/>`;
 }
 if(type==='write'){extra+=`<g transform="translate(-20 -1) rotate(-22)"><rect x="-1.3" y="-8" width="2.6" height="14" rx="1" fill="#ffd97a" stroke="#c99a45" stroke-width=".8"/><path d="M-1.3 6l1.3 3 1.3-3z" fill="#6b5a52"/></g>`}
 if(type==='draw'){extra+=`<circle cx="12" cy="13" r="2.6" fill="#f4a3a8" opacity=".4"/><circle cx="8" cy="15" r="1.4" fill="#8ed6ec" opacity=".45"/>`}
 if(type==='walk'){extra+=`<path d="M-15 33q-4 6 0 10" fill="none" stroke="#8a6a4f" stroke-width="3.2" stroke-linecap="round"/>`}
 if(type==='music'){
  extra+=`<g><path d="M-20 0q0-23 20-23t20 23" fill="none" stroke="#7c68bd" stroke-width="5" stroke-linecap="round"/><rect x="-25" y="-4" width="9" height="15" rx="4.5" fill="#a58fd8" stroke="#6b5a52" stroke-width="1.8"/><rect x="16" y="-4" width="9" height="15" rx="4.5" fill="#a58fd8" stroke="#6b5a52" stroke-width="1.8"/></g>`;
 }
 let blanket='';
 if(type==='cozy'){
  blanket=`<path d="M-20 25q20-9 40 0l5 28q-12 6-25 6t-25-6z" fill="#ffc9d2" stroke="#6b5a52" stroke-width="2"/><path d="M-17 31q17-6 34 0M-16 40q16-5 32 0M-15 49q15-4 30 0" fill="none" stroke="#fbe6e9" stroke-width="2" opacity=".9"/><g fill="#fff0f2"><path d="M-6 36l2 3 3-1-1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><circle cx="10" cy="45" r="2"/></g><path d="M-16 22q16-7 32 0l3 6q-19 6-38 0z" fill="#ffd9df" stroke="#6b5a52" stroke-width="2"/>`;
 }
 return `<g transform="translate(${dx} ${dy}) scale(${scale})" stroke-linejoin="round">
  <ellipse cx="0" cy="71" rx="17" ry="3.6" fill="#5f5136" opacity=".13"/>
  <g class="breathe">
  <g stroke="#6b5a52" stroke-width="2" stroke-linecap="round">
   <path d="M-11 46h9l1 16h-9z" fill="#8fa1d6"/>
   <path d="M2 46h9l1 16H3z" fill="#8194cc"/>
   <path d="M-12 61q0 3 3 3h7q2 0 2-3z" fill="#fffdf6"/>
   <path d="M2 61q0 3 3 3h7q2 0 2-3z" fill="#fffdf6"/>
   <path d="M-11 47l9-1M3 47l9 1" stroke="#a7b8e6" stroke-width="1.4"/>
  </g>
  <path d="M-9 62h9M4 62h9" stroke="#d9d2c4" stroke-width="1.6"/>
  <path d="M-9 64h6M4 64h6" stroke="#fff" stroke-width="1.2" opacity=".75" stroke-linecap="round"/>
  ${blanket}
  <path d="M-15 26q7-6 15-6t15 6l3 22q-9 4-18 4t-18-4z" fill="${shirt}" stroke="#6b5a52" stroke-width="2"/>
  <path d="M-15 43q15 4 30 0l0 5q-15 4-30 0z" fill="#0000000f"/>
  <path d="M-12 32q12 4 24 0" fill="none" stroke="#fff" stroke-width="1.8" opacity=".55"/>
  <path d="M-13 40q13 4 26 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".3"/>
  <path d="M-6 38h12v8h-12z" fill="${shirtDark}" stroke="#6b5a52" stroke-width="1.4"/>
  <path d="M-3 40h6v4h-6z" fill="#fff" opacity=".18"/>
  <path d="M-6 23q6 5 12 0" fill="none" stroke="#6b5a52" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="0" cy="36" r="1.2" fill="#fff" opacity=".65"/>
  <path d="M-4 25q-1 5-3 7M4 25q1 5 3 7" stroke="#fffdf2" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M-4 18h8v8h-8z" fill="#f8cda7" stroke="#dca87f" stroke-width="1.4"/>
  <path d="${pose.l}" fill="none" stroke="#6b5a52" stroke-width="7.4" stroke-linecap="round"/>
  <path d="${pose.r}" fill="none" stroke="#6b5a52" stroke-width="7.4" stroke-linecap="round"/>
  <path d="${pose.l}" fill="none" stroke="${shirt}" stroke-width="5.8" stroke-linecap="round"/>
  <path d="${pose.r}" fill="none" stroke="${shirt}" stroke-width="5.8" stroke-linecap="round"/>
  <circle cx="${pose.lh[0]}" cy="${pose.lh[1]}" r="3.4" fill="#ffd3ac" stroke="#6b5a52" stroke-width="1.7"/>
  <circle cx="${pose.rh[0]}" cy="${pose.rh[1]}" r="3.4" fill="#ffd3ac" stroke="#6b5a52" stroke-width="1.7"/>
  <path d="M-19 4q-4-22 19-24q23 2 19 24q0 10-4 15l-2-21q-6 6-13 6t-13-6l-2 21q-4-5-4-15z" fill="${hair}" stroke="${hairDark}" stroke-width="2"/>
  <ellipse cx="-16.5" cy="5" rx="3.2" ry="4" fill="#ffd3ac" stroke="#dca87f" stroke-width="1.2"/>
  <ellipse cx="16.5" cy="5" rx="3.2" ry="4" fill="#ffd3ac" stroke="#dca87f" stroke-width="1.2"/>
  <ellipse cx="0" cy="2" rx="16.5" ry="17.5" fill="#ffd9b8" stroke="#6b5a52" stroke-width="2"/>
  <path d="M-16 0q-2-18 16-19q18 1 16 19q-3-7-7-10q-3 7-10 7t-13 5q-1-1-2-2z" fill="${hair}" stroke="${hairDark}" stroke-width="1.8"/>
  <path d="M-9-13q5-4 12-3" fill="none" stroke="#7a5f55" stroke-width="2" stroke-linecap="round" opacity=".8"/>
  <path d="M0 6q1.5 1 0 2" fill="none" stroke="#dca87f" stroke-width="1.2" stroke-linecap="round"/>
  ${face}${blush}${extra}
  <g transform="translate(14 -12) rotate(16)"><g fill="#f8a9b8"><ellipse cx="0" cy="-3.4" rx="2.1" ry="3"/><ellipse cx="3.2" cy="-1" rx="2.1" ry="3" transform="rotate(72 3.2 -1)"/><ellipse cx="2" cy="2.8" rx="2.1" ry="3" transform="rotate(144 2 2.8)"/><ellipse cx="-2" cy="2.8" rx="2.1" ry="3" transform="rotate(216 -2 2.8)"/><ellipse cx="-3.2" cy="-1" rx="2.1" ry="3" transform="rotate(288 -3.2 -1)"/></g><circle r="1.6" fill="#ffe89a"/></g>
 </g>
 </g>`;
}

/* ---------- 방법별 소품 ---------- */
const sceneProps={
 breathe:()=>`<g>
  <g class="sway"><path d="M170 116q-4-26 1-46" fill="none" stroke="#7fa86a" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M171 98q-13-9-20-3q9 7 20 3m1 7q13-8 19-2q-9 6-19 2" fill="#a7cb85" stroke="#7fa86a" stroke-width="1.4"/>
  <g transform="translate(171 64)"><circle r="15" fill="#fffdf2" opacity=".7" class="pulse"/><g stroke="#c9b79b" stroke-width="1" fill="#fffcf2"><circle cx="0" cy="-9" r="2.2"/><circle cx="6" cy="-6" r="2.2"/><circle cx="9" cy="0" r="2.2"/><circle cx="6" cy="6" r="2.2"/><circle cx="0" cy="9" r="2.2"/><circle cx="-6" cy="6" r="2.2"/><circle cx="-9" cy="0" r="2.2"/><circle cx="-6" cy="-6" r="2.2"/><circle r="2" fill="#fff"/></g></g></g>
  <g fill="#fffdf4" stroke="#c9b79b" stroke-width=".9"><g transform="translate(188 42)" class="rise"><circle r="1.7"/><path d="M0 2l-4 7M0 9l4-3M0 9l-5 2"/></g><g transform="translate(130 30)" class="drift"><circle r="1.5"/><path d="M0 2l-3 6M0 8l4-3"/></g></g>
  <path d="M96 34q26-11 40 1t32 5" fill="none" stroke="#a9d4e6" stroke-width="2.2" class="dashFlow" stroke-linecap="round"/>
  <path d="M106 46q20-8 36-1" fill="none" stroke="#a9d4e6" stroke-width="2" class="dashFlow" stroke-linecap="round"/>
 </g>`,
 music:()=>`<g>
  <g class="bob">
   <rect x="188" y="84" width="36" height="32" rx="7" fill="#cbbcf0" stroke="#6b5a52" stroke-width="2"/>
   <circle cx="206" cy="100" r="9.5" fill="#fff8e6" stroke="#6b5a52" stroke-width="1.6" class="pulse"/><circle cx="206" cy="100" r="3.4" fill="#8a76c9"/><circle cx="197" cy="91" r="2.2" fill="#8a76c9"/>
   <path d="M226 91q10 9 0 18M230 86q14 14 0 28" fill="none" stroke="#a58fd8" stroke-width="2.2" stroke-linecap="round" class="pulse"/>
  </g>
  <g fill="#7d68c2" class="noteFloat"><ellipse cx="150" cy="36" rx="5.2" ry="4" transform="rotate(-20 150 36)"/><ellipse cx="171" cy="32" rx="5.2" ry="4" transform="rotate(-20 171 32)"/><path d="M154 36V20l21-4v16" fill="none" stroke="#7d68c2" stroke-width="2.4"/><path d="M154 26l21-4" stroke="#7d68c2" stroke-width="3"/></g>
  <g fill="#f0a4b4" class="noteFloat2"><ellipse cx="136" cy="60" rx="3.6" ry="2.8" transform="rotate(-20 136 60)"/><path d="M139 60V50" stroke="#f0a4b4" stroke-width="1.8"/></g>
  <g fill="#9fd6b8" class="sway"><path d="M32 113q0-10 9-10t9 10z"/><path d="M38 104q-2-6 3-9q4 4 3 9" fill="#7fbe9e"/></g>
 </g>`,
 walk:()=>`<g>
  <path d="M12 129q26-12 54-4t50-3t66 3" fill="none" stroke="#e6d3a4" stroke-width="9" stroke-linecap="round" opacity=".85"/>
  <path d="M12 129q26-12 54-4t50-3t66 3" fill="none" stroke="#f6e9c8" stroke-width="4" stroke-linecap="round"/>
  <g class="sway2"><g stroke="#8d6b4f" stroke-width="3"><path d="M186 116V78m-9 8 9-7 9 8"/></g>
  <circle cx="186" cy="60" r="17" fill="#7fbf7c"/><circle cx="174" cy="67" r="12" fill="#93cd8c"/><circle cx="198" cy="67" r="12" fill="#93cd8c"/><circle cx="181" cy="50" r="10" fill="#a5d69a"/></g>
  <g class="sway"><g stroke="#8d6b4f" stroke-width="2.4"><path d="M210 116V92"/></g><circle cx="210" cy="84" r="11" fill="#8bc985"/><circle cx="202" cy="88" r="8" fill="#9fd49a"/></g>
  <g fill="#d9c79b" class="pulse"><ellipse cx="155" cy="121" rx="3" ry="1.8" transform="rotate(-15 155 121)"/><ellipse cx="164" cy="118" rx="3" ry="1.8" transform="rotate(-15 164 118)"/></g>
  <g fill="#fff" opacity=".9" class="drift"><path d="M118 32q4-5 8 0q4-5 8 0" fill="none" stroke="#c9a15a" stroke-width="1.8" stroke-linecap="round"/></g>
 </g>`,
 read:()=>`<g>
  <g transform="translate(196 100)" class="bob"><rect x="-18" y="-8" width="36" height="9" rx="2" fill="#f4a3a1" stroke="#6b5a52" stroke-width="1.6"/><rect x="-16" y="-16" width="33" height="9" rx="2" fill="#a9d3e8" stroke="#6b5a52" stroke-width="1.6"/><rect x="-18" y="-24" width="35" height="9" rx="2" fill="#ffd97a" stroke="#6b5a52" stroke-width="1.6"/><path d="M-14-4h7m-9-8h7m-5-8h8" stroke="#fff" stroke-width="1.6" opacity=".8"/></g>
  <g transform="translate(148 116)" class="sway"><path d="M-12 0h24l-3 9h-18z" fill="#e8a48d" stroke="#b97c66" stroke-width="1.4"/><path d="M0-1q-3-13 3-19q7 7 3 19" fill="#8bc985" stroke="#649e62" stroke-width="1.4"/><path d="M-2-3q-9-3-13-11q10-1 14 7" fill="#a5d69a" stroke="#649e62" stroke-width="1.2"/><path d="M2-5q9-3 13-10q-9-1-14 6" fill="#a5d69a" stroke="#649e62" stroke-width="1.2"/></g>
  <path d="M160 50q9-6 14 2q-7 7-14-2z" fill="#f0b45e" stroke="#c98f3f" stroke-width="1" class="bob2"/>
  <g fill="#fff" opacity=".9"><path d="M44 40l1.8 4.4L50 46l-4.2 1.6L44 52l-1.8-4.4L38 46l4.2-1.6z" class="twinkle"/></g>
 </g>`,
 water:()=>`<g>
  <rect x="178" y="54" width="42" height="62" rx="9" fill="#e6f7fb" stroke="#5d94b3" stroke-width="2.2" opacity=".95"/>
  <path d="M180 78q10-3 19 0t19 0v28q0 8-8 8h-22q-8 0-8-8z" fill="#8ed6ec" opacity=".85" class="waveFlow"/>
  <path d="M180 78q10-3 19 0t19 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8" class="waveFlow"/>
  <g stroke="#fffdf2" stroke-width="3" stroke-linecap="round"><path d="M186 64v34"/><path d="M196 60v14"/></g>
  <g transform="translate(199 70)" class="bob"><circle r="8" fill="#ffe27a" stroke="#e0b84e" stroke-width="1.4"/><circle r="6.2" fill="#fff7cf"/><path d="M0-6v12M-5.2-3l10.4 6M5.2-3l-10.4 6" stroke="#f0c95a" stroke-width="1"/></g>
  <path d="M222 30q-8 12 0 17q8-5 0-17" fill="#8ed6ec" stroke="#5d94b3" stroke-width="1.4" class="bob2"/>
  <g fill="#fff" opacity=".85"><circle cx="190" cy="96" r="2.2" class="rise"/><circle cx="206" cy="102" r="1.8" class="rise"/></g>
  <ellipse cx="199" cy="118" rx="27" ry="4" fill="#b7d9c8" opacity=".6"/>
  <path d="M147 113q0-14 10-14t10 14z" fill="#ffd97a" stroke="#c99a45" stroke-width="1.2"/><path d="M154 100q-2-8 4-12q5 5 3 12" fill="#8bc985" stroke="#649e62" stroke-width="1.2"/>
 </g>`,
 talk:()=>`<g>
  <g transform="translate(0 10)" class="bob"><path d="M140 20q0-11 12-11h46q12 0 12 11v18q0 11-12 11h-18l-11 12 1-12h-18q-12 0-12-11z" fill="#fffdf6" stroke="#8d7cc4" stroke-width="2.2"/>
  <g fill="#8d7cc4"><circle cx="160" cy="30" r="2.4" class="dotPulse1"/><circle cx="172" cy="30" r="2.4" class="dotPulse2"/><circle cx="184" cy="30" r="2.4" class="dotPulse3"/></g>
  <path d="M198 26q4-5 9 0q-4 5-9 0" fill="#f2a3a8" class="pulse"/></g>
  <g transform="translate(194 124) scale(1.05)">
   <path d="M-30 0q0-24 30-24t30 24v20h-60z" fill="#cfe3c2" stroke="#6b5a52" stroke-width="2"/>
   <path d="M-22 2q3-12 22-12t22 12" fill="#bcd8a8" opacity=".75"/>
   <path d="M-7-27h14v11h-14z" fill="#f8cda7" stroke="#dca87f" stroke-width="1.4"/>
   <circle cy="-44" r="17.5" fill="#ffd9b8" stroke="#6b5a52" stroke-width="2"/>
   <path d="M-18-46q0-21 18-21t18 21q-5-9-11-11q-2 8-12 10q-8 1-13-1z" fill="#6b5148" stroke="#4a3733" stroke-width="1.8"/>
   <circle cx="17" cy="-58" r="7" fill="#6b5148" stroke="#4a3733" stroke-width="1.6"/>
   <circle cx="-14" cy="-44" r="2.6" fill="#ffd9b8" stroke="#dca87f" stroke-width="1"/>
   <circle cx="14" cy="-44" r="2.6" fill="#ffd9b8" stroke="#dca87f" stroke-width="1"/>
   <path d="M-11-46q3-3 6-1M5-47q3-1 6 1" fill="none" stroke="#4a3733" stroke-width="1.6" stroke-linecap="round"/>
   <g fill="none" stroke="#7b6a58" stroke-width="1.6"><circle cx="-6" cy="-42" r="5.2"/><circle cx="6.5" cy="-42" r="5.2"/><path d="M-1-42h2m9 0h3"/></g>
   <circle cx="-6" cy="-42" r="1.3" fill="#4a3733"/><circle cx="6.5" cy="-42" r="1.3" fill="#4a3733"/>
   <path d="M-4-32q4 4 9 0" fill="none" stroke="#8d4a50" stroke-width="1.8" stroke-linecap="round"/>
   <circle cx="-11" cy="-35" r="3" fill="#f6a29f" opacity=".55"/><circle cx="12" cy="-35" r="3" fill="#f6a29f" opacity=".55"/>
   <path d="M-14-21q14 5 28 0" fill="none" stroke="#fff" stroke-width="1.8" opacity=".5"/>
  </g>
  <g transform="translate(140 78)" class="rise"><path d="M0-4q-7-7-2-12q5-5 9 1q4-6 9-1q5 5-2 12l-7 6z" fill="#f2a3a8" opacity=".9" transform="scale(.8)"/></g>
  <path d="M150 90q4-5 8 0" fill="none" stroke="#cbb5e8" stroke-width="1.6"/>
 </g>`,
 draw:()=>`<g>
  <g><path d="M186 116l10-44m4 44-10-44" stroke="#b98a5c" stroke-width="4" stroke-linecap="round"/><path d="M196 92v24" stroke="#b98a5c" stroke-width="3"/></g>
  <g transform="rotate(-3 196 74)"><rect x="167" y="44" width="58" height="42" rx="3" fill="#fffdf6" stroke="#8d7a62" stroke-width="2.4"/><path d="M173 76q9-18 19-2t17-4" fill="none" stroke="#f4a3a8" stroke-width="3.4" stroke-linecap="round"/><circle cx="207" cy="58" r="6" fill="#ffd97a" stroke="#e0b84e" stroke-width="1.2" class="pulse"/><path d="M196 82q8-8 15 0" fill="none" stroke="#8d7cc4" stroke-width="2.4" stroke-linecap="round"/><path d="M181 50l2.4 5.6L189 58l-5.6 2.4L181 66l-2.4-5.6L173 58l5.6-2.4z" fill="#ffe27a" class="twinkle"/></g>
  <g transform="translate(150 112)"><ellipse rx="20" ry="10" fill="#f0d8b8" stroke="#b98a5c" stroke-width="1.8"/><circle cx="-7" cy="-2" r="3.2" fill="#f4a3a8"/><circle cx="2" cy="2" r="3.2" fill="#8ed6ec"/><circle cx="9" cy="-3" r="3.2" fill="#ffd97a"/><circle cx="0" cy="-6" r="1.8" fill="#b7d8ef"/></g>
  <g transform="translate(168 30)" class="bob"><path d="M-1 12l18-18" stroke="#c98f3f" stroke-width="3.4" stroke-linecap="round"/><path d="M-3 14l-2 3 3-1z" fill="#c98f3f"/></g>
 </g>`,
 cozy:()=>`<g>
  <g transform="translate(196 86)" class="bob"><ellipse cx="0" cy="24" rx="20" ry="4" fill="#5f5136" opacity=".12"/><circle cx="-12" cy="-14" r="5.4" fill="#d8a778" stroke="#a87b55" stroke-width="1.4"/><circle cx="12" cy="-14" r="5.4" fill="#d8a778" stroke="#a87b55" stroke-width="1.4"/><circle cx="0" cy="-4" r="15" fill="#e2b489" stroke="#a87b55" stroke-width="1.8"/><ellipse cx="0" cy="3" rx="7" ry="5.4" fill="#f6d7b4"/><circle cx="-4" cy="-2" r="1.5" fill="#4a3733"/><circle cx="4" cy="-2" r="1.5" fill="#4a3733"/><path d="M-1.4 1h2.8l-1.4 2z" fill="#a87b55"/><path d="M-2.6 4q2.6 2 5.2 0" fill="none" stroke="#a87b55" stroke-width="1.2" stroke-linecap="round"/><path d="M-17 10q17-9 34 0l2 15q-18 5-38 0z" fill="#e2b489" stroke="#a87b55" stroke-width="1.8"/><ellipse cx="0" cy="17" rx="8" ry="7" fill="#f6d7b4"/><path d="M0 13q4-4 7 0q-4 4-7 0" fill="#f2a3a8" class="pulse"/></g>
  <g transform="translate(160 106)"><path d="M-10 0h20v11q0 4-4 4h-12q-4 0-4-4z" fill="#fffdf6" stroke="#b98a5c" stroke-width="1.6"/><path d="M-8 4h16v6h-15z" fill="#c9a77f"/><g class="rise"><path d="M-6-4q-3-6 2-9m5 9q-2-5 2-8" fill="none" stroke="#d9c7b4" stroke-width="1.8" stroke-linecap="round"/></g><path d="M10 2q6 0 6 4t-6 4" fill="none" stroke="#b98a5c" stroke-width="1.8"/></g>
  <g transform="translate(139 116)"><path d="M-9 0q0-5 5-5t5 5z" fill="#f4a3a8" stroke="#c97f88" stroke-width="1.2"/><path d="M0 0q0-5 5-5t5 5z" fill="#f4a3a8" stroke="#c97f88" stroke-width="1.2"/></g>
  <g fill="#fff" opacity=".9"><path d="M224 44l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" class="twinkle"/></g>
 </g>`,
 friend:()=>`<g>
  <g fill="#f2a3a8" class="bob"><path d="M96 33q-8-8-2-15q6-5 10 1q4-6 10-1q6 7-2 15l-8 7z"/><path d="M126 45q-4-4-1-7q3-2 5 0q2-2 5 0q3 3-1 7l-4 4z" fill="#ffd07a" class="pulse"/></g>
  <g fill="#8d7cc4" opacity=".8"><circle cx="142" cy="22" r="2.2" class="twinkle"/><circle cx="154" cy="40" r="1.8" class="twinkle2"/><circle cx="72" cy="26" r="2" class="twinkle"/><path d="M120 60l1.6 4 4 1.6-4 1.6L120 71l-1.6-3.8-4-1.6 4-1.6z" class="twinkle2"/></g>
  <g stroke="#f4a3a8" stroke-width="2" fill="none" stroke-linecap="round" class="rise"><path d="M148 58q6-5 12 0"/><path d="M156 66q6-5 12 0"/></g>
  <g transform="translate(178 101)"><path d="M-17-15h34v9h-34z" fill="#e8c79b" stroke="#6b5a52" stroke-width="1.6"/><path d="M-17-6h34v6h-34z" fill="#d9a86e" stroke="#6b5a52" stroke-width="1.6"/><path d="M-15 0v13m30-13v13" stroke="#6b5a52" stroke-width="2.4" stroke-linecap="round"/><path d="M-17-6h34" stroke="#fff" stroke-width="1.2" opacity=".5"/></g>
 </g>`,
 jar:()=>`<g>
  <g transform="translate(192 76)" class="bob">
   <ellipse cx="0" cy="43" rx="25" ry="4" fill="#5f5136" opacity=".1"/>
   <path d="M-19 0h38v34q0 8-8 8h-22q-8 0-8-8z" fill="#eef9f4" stroke="#5d8f84" stroke-width="2.2"/>
   <path d="M-19 13h38v21q0 8-8 8h-22q-8 0-8-8z" fill="#ffe9a6" opacity=".55"/>
   <path d="M-14 3v33" stroke="#fff" stroke-width="2.4" opacity=".85" stroke-linecap="round"/>
   <path d="M12 5v26" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>
   <g fill="#fffdf2" stroke="#d9c7a8" stroke-width=".9">
    <rect x="-12" y="13" width="12" height="9" rx="1.5" transform="rotate(-12 -6 17)"/>
    <rect x="1" y="18" width="12" height="9" rx="1.5" transform="rotate(9 7 22)"/>
    <rect x="-6" y="4" width="12" height="9" rx="1.5" transform="rotate(5 0 8)"/>
    <rect x="-14" y="25" width="10" height="8" rx="1.5" transform="rotate(14 -9 29)"/>
   </g>
   <g fill="#f4a3a8" class="pulse"><path d="M-10 19q3-3 5 0q-2 3-5 0"/><path d="M5 23q3-3 5 0q-2 3-5 0"/><path d="M0 9q3-3 5 0q-2 3-5 0"/></g>
   <path d="M-22 0h44v7h-44z" fill="#f6c3cc" stroke="#b98a92" stroke-width="1.6"/>
   <path d="M-22 3h44" stroke="#fff" stroke-width="1.4" opacity=".65"/>
   <rect x="-14" y="-10" width="28" height="10" rx="3" fill="#d9a86e" stroke="#a87b55" stroke-width="1.6"/>
   <path d="M-14-5h28" stroke="#c08f5e" stroke-width="1.2"/>
   <path d="M20 7q7 3 6 9q-1 5-7 4" fill="none" stroke="#b98a92" stroke-width="1.4" stroke-linecap="round"/>
   <rect x="22" y="17" width="11" height="9" rx="1.5" fill="#fffdf2" stroke="#c9b79d" stroke-width="1.2" transform="rotate(8 27 21)"/>
   <path d="M25 21q2-2 4 0q-2 2-4 0" fill="#f2a3a8"/>
  </g>
  <g fill="#fff"><path d="M226 32l1.8 4.4 4.4 1.8-4.4 1.8L226 44l-1.8-4-4.4-1.8 4.4-1.8z" class="twinkle"/></g>
 </g>`,
 dance:()=>`<g>
  <g transform="translate(197 98)" class="bob"><rect x="-17" y="-13" width="34" height="30" rx="6" fill="#cbbcf0" stroke="#6b5a52" stroke-width="2"/><circle cx="0" cy="2" r="8" fill="#fff8e6" stroke="#6b5a52" stroke-width="1.4" class="pulse"/><circle cx="0" cy="2" r="2.8" fill="#8a76c9"/><circle cx="-9" cy="-6" r="1.8" fill="#8a76c9"/></g>
  <g fill="#7d68c2" class="noteFloat"><ellipse cx="150" cy="30" rx="5" ry="3.8" transform="rotate(-20 150 30)"/><path d="M154 30V16l18-3v13" fill="none" stroke="#7d68c2" stroke-width="2.2"/><ellipse cx="172" cy="26" rx="5" ry="3.8" transform="rotate(-20 172 26)"/></g>
  <g fill="#7d68c2" class="noteFloat2"><ellipse cx="220" cy="44" rx="4.4" ry="3.4" transform="rotate(-20 220 44)"/><path d="M223 44V32l10-2" fill="none" stroke="#7d68c2" stroke-width="2"/></g>
  <g fill="#f2a3a8" opacity=".85"><circle cx="134" cy="52" r="2.4" class="twinkle"/><circle cx="160" cy="58" r="1.8" class="twinkle2"/><circle cx="118" cy="34" r="1.6" class="twinkle"/><path d="M214 68l1.6 4 4 1.6-4 1.6-1.6 3.8-1.6-3.8-4-1.6 4-1.6z" fill="#ffd07a" class="twinkle2"/></g>
  <path d="M104 24q10-6 16 4t-4 18" fill="none" stroke="#c9b6f2" stroke-width="2" class="dashFlow" stroke-linecap="round"/>
 </g>`,
 trophy:()=>`<g>
  <g transform="translate(198 78)" class="bob"><circle r="32" fill="#fff4b8" opacity=".45" class="pulse"/><path d="M-15 18h30v7q0 8-8 8h-14q-8 0-8-8z" fill="#d9b34e" stroke="#8d6b2f" stroke-width="1.8"/><path d="M-17 6h34v-18q0-6-6-6h-22q-6 0-6 6z" fill="#ffd97a" stroke="#b98a3c" stroke-width="2"/><path d="M-19-14h-8q0 15 9 16m35-16h8q0 15-9 16" fill="none" stroke="#b98a3c" stroke-width="3.2"/><path d="M-2 20v7m-9 2h18" stroke="#b98a3c" stroke-width="3"/><path d="M0-12l3.4 7.6 8.6 1-6.4 5.6 2 8.4-7.6-4.4-7.6 4.4 2-8.4-6.4-5.6 8.6-1z" fill="#fff8d2" stroke="#d9b34e" stroke-width="1.2" class="pulse"/><path d="M-12-18q2-3 5-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/></g>
  <g fill="#f2a3a8"><circle cx="164" cy="30" r="2.6" class="twinkle"/><circle cx="228" cy="38" r="2" class="twinkle2"/><circle cx="150" cy="52" r="1.8" class="twinkle"/><path d="M218 22l1.6 4 4 1.6-4 1.6-1.6 3.8-1.6-3.8-4-1.6 4-1.6z" fill="#ffd07a" class="twinkle2"/></g>
  <path d="M168 56q8-8 16 0" fill="none" stroke="#c9b6f2" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/>
 </g>`,
 question:()=>`<g>
  <g transform="translate(0 10)" class="bob"><path d="M144 20q0-12 12-12h44q12 0 12 12v20q0 12-12 12h-14l-10 11 1-11h-21q-12 0-12-12z" fill="#fffdf6" stroke="#8d7cc4" stroke-width="2.2"/>
  <text x="176" y="42" font-family="'Jua','Malgun Gothic',sans-serif" font-size="30" fill="#8d7cc4" text-anchor="middle">?</text></g>
  <g transform="translate(206 80)"><circle r="16" fill="#fff3b0" opacity=".6" class="pulse"/><g stroke="#e8b45a" stroke-width="2" stroke-linecap="round" class="twinkle"><path d="M0-16v-4M-13-11l-3-3M13-11l3-3M-16 2h-4M16 2h4"/></g><circle cy="0" r="9" fill="#ffe27a" stroke="#c98f3f" stroke-width="1.4"/><path d="M-4 8h8l-1 5h-6z" fill="#b8a6e6" stroke="#6b5a52" stroke-width="1.2"/><path d="M-2 2q2-4 4 0" fill="none" stroke="#c98f3f" stroke-width="1.2"/></g>
  <g fill="#b8a6e6"><path d="M136 68q4-5 8 0q-4 4-8 0" class="twinkle"/><circle cx="222" cy="94" r="2" class="twinkle2"/></g>
  <path d="M214 74q6-4 11 0" fill="none" stroke="#b8a6e6" stroke-width="1.6"/>
 </g>`,
 write:()=>`<g>
  <g><rect x="146" y="94" width="84" height="7" rx="3" fill="#c99a6b" stroke="#8d6b4f" stroke-width="1.6"/><path d="M154 101v15m68-15v15" stroke="#8d6b4f" stroke-width="3" stroke-linecap="round"/></g>
  <g transform="rotate(-4 188 86)"><rect x="160" y="66" width="52" height="28" rx="3" fill="#fffdf6" stroke="#8d7a62" stroke-width="1.8"/><path d="M186 66v28" stroke="#cbbba2" stroke-width="1.2"/><path d="M165 74h16m-16 6h16m-16 6h11m5-12h16m-16 6h16m-16 6h12" stroke="#cdbfae" stroke-width="1.2" stroke-linecap="round"/><path d="M196 88q4-4 8 0q-4 4-8 0" fill="#f2a3a8" class="pulse"/></g>
  <g transform="translate(222 72)"><path d="M-8 0h16v22h-16z" fill="#b7d8ef" stroke="#6b5a52" stroke-width="1.6"/><path d="M-5-10l3 10m4-11-1 11m5-9-3 9" stroke="#8d7cc4" stroke-width="3" stroke-linecap="round"/><path d="M-6-11l2 2-4 1z" fill="#f2a3a8"/></g>
  <g transform="translate(132 62)" class="bob"><path d="M-1 8l12-12" stroke="#c98f3f" stroke-width="3.2" stroke-linecap="round"/><path d="M-3 10l-2 3 3-1z" fill="#8d7cc4"/></g>
 </g>`,
 garden:()=>`<g>
  <ellipse cx="185" cy="116" rx="44" ry="11" fill="#8d6e63" opacity=".35"/>
  <g class="sway"><path d="M164 114v-24" stroke="#5da86a" stroke-width="3" stroke-linecap="round"/><circle cx="164" cy="84" r="9" fill="#ffb6c1"/><circle cx="164" cy="84" r="4" fill="#ffe27a"/></g>
  <g class="sway2"><path d="M188 116v-32" stroke="#5da86a" stroke-width="3" stroke-linecap="round"/><circle cx="188" cy="78" r="11" fill="#ffd97a"/><circle cx="188" cy="78" r="4.5" fill="#f09a4a"/></g>
  <g class="sway"><path d="M210 114v-22" stroke="#5da86a" stroke-width="3" stroke-linecap="round"/><circle cx="210" cy="86" r="8" fill="#c9b6f2"/><circle cx="210" cy="86" r="3.5" fill="#fff"/></g>
  <g class="bob" transform="translate(142 62)"><rect x="0" y="0" width="16" height="12" rx="3" fill="#9dd2f1" stroke="#6b5a52" stroke-width="1.4"/><path d="M16 4l8-5v4l-8 5" fill="#9dd2f1" stroke="#6b5a52" stroke-width="1.2"/><circle cx="27" cy="5" r="1.6" fill="#7cc8e6" class="rain"/><circle cx="25" cy="11" r="1.4" fill="#7cc8e6" class="rain2"/></g>
 </g>`,
 bubble:()=>`<g>
  <g class="rise"><circle cx="170" cy="78" r="14" fill="#ffffffaa" stroke="#8fd3f4" stroke-width="2"/><path d="M163 70a8 8 0 0 1 8-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="165" cy="73" r="2.5" fill="#fff"/></g>
  <g class="rise" style="animation-delay:-1.4s"><circle cx="202" cy="64" r="18" fill="#f3e8ffaa" stroke="#b9a8ef" stroke-width="2"/><path d="M192 54a10 10 0 0 1 11-4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="196" cy="57" r="3" fill="#fff"/></g>
  <g class="rise" style="animation-delay:-2.5s"><circle cx="152" cy="52" r="10" fill="#e0f7faaa" stroke="#7dd3fc" stroke-width="1.8"/><circle cx="149" cy="48" r="2" fill="#fff"/></g>
 </g>`,
 cushion:()=>`<g>
  <g class="bob" transform="translate(184 92)">
   <rect x="-28" y="-22" width="56" height="44" rx="16" fill="#ffb8c6" stroke="#c97a8b" stroke-width="2"/>
   <rect x="-22" y="-16" width="44" height="32" rx="12" fill="none" stroke="#ffdce4" stroke-width="1.5" stroke-dasharray="3 3"/>
   <path d="M-12-6q12 10 24 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
   <g class="twinkle"><path d="M-36-26l-8-8M36-26l8-8M0-32v-10" stroke="#f09a4a" stroke-width="2.4" stroke-linecap="round"/></g>
  </g>
 </g>`,
 ice:()=>`<g>
  <g class="flameFlicker" transform="translate(184 90)">
   <path d="M0-26c13 13 17 24 0 36c-17-12-13-23 0-36z" fill="#ff9f80" opacity=".82"/>
   <path d="M0-16c8 9 10 16 0 24c-10-8-8-15 0-24z" fill="#ffe27a"/>
   <circle cx="0" cy="-2" r="4" fill="#fffbe6" opacity=".85"/>
  </g>
  <g class="rain" fill="#a9e0f3" stroke="#68b6d4" stroke-width="1.2">
   <circle cx="162" cy="48" r="4"/><circle cx="186" cy="40" r="5"/><circle cx="208" cy="50" r="4"/>
  </g>
  <g class="rain2" stroke="#fff" stroke-width="1.4" stroke-linecap="round">
   <path d="M174 34v6m-3-3h6"/><path d="M198 30v6m-3-3h6"/>
  </g>
 </g>`,
 radar:()=>`<g transform="translate(186 78)">
  <circle r="31" fill="#eef9f4" stroke="#80bfa1" stroke-width="2.2"/>
  <circle r="21" fill="none" stroke="#a9d8c0" stroke-width="1.4" stroke-dasharray="4 3"/>
  <circle r="11" fill="none" stroke="#a9d8c0" stroke-width="1.4"/>
  <g class="radarSweep">
   <path d="M0 0L24-18A30 30 0 0 1 28 10Z" fill="#4da377" opacity=".24"/>
   <path d="M0 0L24-18" stroke="#4da377" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <circle cx="0" cy="0" r="3.2" fill="#4da377"/>
  <circle class="twinkle" cx="14" cy="-10" r="3.8" fill="#f0b42e"/>
  <circle class="twinkle2" cx="-12" cy="12" r="3.8" fill="#7665c5"/>
 </g>`,
 grounding:()=>`<g transform="translate(184 80)">
  <circle class="pulse" r="32" fill="#fff6d6" stroke="#f0d990" stroke-width="1.8" opacity=".85"/>
  <circle r="22" fill="none" stroke="#e6c870" stroke-width="1.2" stroke-dasharray="3 3"/>
  <!-- 눈 (시각) -->
  <g transform="translate(-14 -12)" class="bob">
   <path d="M-8 0q8-7 16 0q-8 7-16 0z" fill="#fff" stroke="#5d4da9" stroke-width="1.5"/>
   <circle r="3.2" fill="#5d4da9"/>
   <circle cx="-1" cy="-1" r="1" fill="#fff"/>
  </g>
  <!-- 귀 (청각) -->
  <g transform="translate(14 -12)" class="bob2">
   <path d="M-3-5c4-3 9 1 7 7c-1 4-5 5-7 3c-2-2 0-5 2-6" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
  </g>
  <!-- 손 (촉각) -->
  <g transform="translate(-14 13)" class="sway">
   <rect x="-5" y="-2" width="10" height="8" rx="3" fill="#ffd9b8" stroke="#8d6b4f" stroke-width="1.3"/>
   <path d="M-4-2v-4m2.7 4v-5m2.7 5v-5m2.6 5v-4" stroke="#8d6b4f" stroke-width="1.6" stroke-linecap="round"/>
  </g>
  <!-- 꽃/향기 (후각) -->
  <g transform="translate(14 13)" class="twinkle">
   <circle cx="0" cy="-3.5" r="2.6" fill="#f4a3a8"/>
   <circle cx="3.5" cy="0" r="2.6" fill="#f4a3a8"/>
   <circle cx="0" cy="3.5" r="2.6" fill="#f4a3a8"/>
   <circle cx="-3.5" cy="0" r="2.6" fill="#f4a3a8"/>
   <circle r="2" fill="#ffe27a"/>
  </g>
 </g>`,
 letter:()=>`<g transform="translate(186 84)">
  <g class="bob">
   <rect x="-28" y="-18" width="56" height="38" rx="6" fill="#fffdf6" stroke="#c9a87c" stroke-width="2"/>
   <path d="M-28-16L0 4L28-16" fill="none" stroke="#c9a87c" stroke-width="2"/>
   <path d="M0 1c-2.5-3-7-1-7 2.5c0 3.5 7 7 7 7s7-3.5 7-7c0-3.5-4.5-5.5-7-2.5z" fill="#f795a8" class="pulse"/>
  </g>
  <path d="M214 48l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffd97a" class="twinkle" transform="translate(-186 -84)"/>
 </g>`
};

/* ---------- 장면 합성 ---------- */
function sceneSVG(type,mood){
 const prop=(sceneProps[type]||sceneProps.breathe)();
 const extra={water:-10,music:-8,trophy:-8,draw:-6,write:-10}[type]||0;
 const propShift=-16+extra;
 const akid=kid(mood,type,type==='friend'?72:80,46,1.06);
 let front='';
 if(type==='read'){
  front=`<g transform="translate(80 88)"><path d="M-25-8q25-12 50 0v24q-25-11-50 0z" fill="#fffaf0" stroke="#8d7a62" stroke-width="1.8"/><path d="M0-8v24" stroke="#cbbba2" stroke-width="1.2"/><path d="M-18-2h13m-13 5h13m5-5h13m-13 5h13" stroke="#cdbfae" stroke-width="1.2" stroke-linecap="round"/><path d="M9 10q4-4 8 0q-4 4-8 0" fill="#f2a3a8"/></g>`;
 }else if(type==='draw'){
  front=`<g transform="translate(104 92) rotate(-24)"><path d="M0 0l17-4" stroke="#c98f3f" stroke-width="3.2" stroke-linecap="round"/><path d="M17-4q4-1 3 2" fill="#f2a3a8"/></g>`;
 }else if(type==='write'){
  front=`<g transform="translate(104 92) rotate(14)"><path d="M0 0l48-10" stroke="#f0bd57" stroke-width="4" stroke-linecap="round"/><path d="M44-9l8-2-4 6z" fill="#f4d9a6" stroke="#c99f63" stroke-width="1"/><path d="M0 2l6-2" stroke="#c98f3f" stroke-width="2.6" stroke-linecap="round"/></g>`;
 }else if(type==='friend'){
  front=`${kid(mood,'friend',132,46,1.02,true)}<g transform="translate(102 89)"><circle r="4.6" fill="#ffd9b8" stroke="#6b5a52" stroke-width="1.8"/></g>`;
 }else if(type==='jar'){
  front=`<g transform="translate(107 86) rotate(-12)"><rect x="0" y="-5" width="13" height="10" rx="1.5" fill="#fffdf2" stroke="#c9b79d" stroke-width="1.2"/><path d="M3-2h7M3 2h5" stroke="#d9c7a8" stroke-width="1.1"/></g><path d="M122 82q38-14 58-20" fill="none" stroke="#c9b6f2" stroke-width="1.4" stroke-dasharray="3 4" stroke-linecap="round"/>`;
 }else if(type==='water'){
  front=`<path d="M96 88q8-3 10 2" fill="none" stroke="#6b5a52" stroke-width="2"/>`;
 }
 return `<svg class="svg-anim" viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${(typeof sceneLabels!=='undefined'?sceneLabels[type]:'')||'마음 돌보기'} 장면 그림" xmlns="http://www.w3.org/2000/svg">
  ${bgScene(mood,type)}
  ${type==='friend'?prop:`<g transform="translate(${propShift} 0)">${prop}</g>`}
  ${akid}
  ${front}
  <g opacity=".55"><path d="M12 16q3-6 6 0q-3 5-6 0" fill="#fff"/><path d="M226 122q3-6 6 0q-3 5-6 0" fill="#fff"/></g>
 </svg>`;
}

/* ---------- 히어로 ---------- */
function heroSVG(){
 const hid='hero'+(++SVG_SEQ);
 return `<svg class="svg-anim" viewBox="0 0 200 165" role="img" aria-label="무지개 아래에서 마음 풍선을 든 아이" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="${hid}-hill" x1="0" y1="0" x2=".15" y2="1"><stop offset="0" stop-color="#d9f0c2"/><stop offset=".55" stop-color="#b7de9e"/><stop offset="1" stop-color="#8fc47a"/></linearGradient>
   <radialGradient id="${hid}-sun"><stop offset="0" stop-color="#fffbe2"/><stop offset=".55" stop-color="#ffe582"/><stop offset="1" stop-color="#ffd35d"/></radialGradient>
   <radialGradient id="${hid}-glow"><stop offset="0" stop-color="#fff8c9" stop-opacity=".95"/><stop offset=".6" stop-color="#fff3b0" stop-opacity=".35"/><stop offset="1" stop-color="#fff8c9" stop-opacity="0"/></radialGradient>
   <linearGradient id="${hid}-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc7d0"/><stop offset=".5" stop-color="#f795a8"/><stop offset="1" stop-color="#ee7c94"/></linearGradient>
   <linearGradient id="${hid}-heart2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3ecff"/><stop offset="1" stop-color="#9dd2f1"/></linearGradient>
   <linearGradient id="${hid}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".84" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
   <pattern id="${hid}-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1.4" cy="1.4" r=".7" fill="#fff" opacity=".55"/></pattern>
   <mask id="${hid}-mask"><rect width="200" height="165" fill="url(#${hid}-fade)"/></mask>
   <filter id="${hid}-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2"/></filter>
  </defs>
  <rect width="200" height="165" fill="url(#${hid}-dots)" opacity=".5"/>
  <g fill="none" stroke-width="9" stroke-linecap="round" opacity=".32" filter="url(#${hid}-soft)">
   <path d="M30 132a72 72 0 0 1 144 0" stroke="#f6a3a8"/>
   <path d="M41 132a61 61 0 0 1 122 0" stroke="#ffcf7a"/>
   <path d="M52 132a50 50 0 0 1 100 0" stroke="#a9d8a8"/>
   <path d="M63 132a39 39 0 0 1 78 0" stroke="#a9d3e8"/>
   <path d="M74 132a28 28 0 0 1 56 0" stroke="#c9b6f2"/>
  </g>
  <g fill="none" stroke-width="8" stroke-linecap="round" opacity=".62">
   <path d="M30 132a72 72 0 0 1 144 0" stroke="#f6a3a8"/>
   <path d="M41 132a61 61 0 0 1 122 0" stroke="#ffcf7a"/>
   <path d="M52 132a50 50 0 0 1 100 0" stroke="#a9d8a8"/>
   <path d="M63 132a39 39 0 0 1 78 0" stroke="#a9d3e8"/>
   <path d="M74 132a28 28 0 0 1 56 0" stroke="#c9b6f2"/>
  </g>
  <path d="M30 132a72 72 0 0 1 144 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 10" opacity=".75"/>
  <g transform="translate(38 42)"><circle r="27" fill="url(#${hid}-glow)" class="pulse"/><circle r="17" fill="url(#${hid}-sun)"/><g class="spinSlow" stroke="#eebc4e" stroke-width="2.8" stroke-linecap="round"><path d="M0-24v-7m0 55v-7M-24 0h-7m55 0h-7M-17-17l-5-5m44 44 5 5m0-44-5 5M-22 22l-5 5"/></g><g class="eyeBlink"><path d="M-6-2q2.4-3 5 0M2-2q2.4-3 5 0" fill="none" stroke="#7a5a33" stroke-width="1.8" stroke-linecap="round"/></g><path d="M-5 5q5 5 10 0" fill="none" stroke="#7a5a33" stroke-width="1.8" stroke-linecap="round"/><circle cx="-10" cy="4" r="2.4" fill="#f6a29f" opacity=".7"/><circle cx="11" cy="4" r="2.4" fill="#f6a29f" opacity=".7"/></g>
  <g class="bob"><g transform="translate(168 36)" fill="#fff" opacity=".95"><path d="M0 0q0-9 10-9t10 9q8 0 8 7t-8 7H0q-8 0-8-7t8-7"/><path d="M-2 6q10 4 20 0" fill="none" stroke="#eef6ff" stroke-width="2"/></g></g>
  <g class="bob2"><g transform="translate(18 92) scale(.72)" fill="#fff" opacity=".82"><path d="M0 0q0-9 10-9t10 9q8 0 8 7t-8 7H0q-8 0-8-7t8-7"/></g></g>
  <g stroke="#8ecbe4" stroke-width="2.2" stroke-linecap="round" opacity=".9" class="rain"><path d="M166 55l-2 6m11-4-2 6"/></g>
  <g fill="none" stroke="#c9a15a" stroke-width="1.6" stroke-linecap="round" opacity=".7" class="drift"><path d="M96 32q5-5 10 0q5-5 10 0"/><path d="M112 40q4-4 8 0q4-4 8 0"/></g>
  <g transform="translate(150 24)" class="drift2"><g class="wingFlap" fill="#fff" stroke="#e9b7c3" stroke-width=".8"><path d="M0 0q-8-10 0-10t0 10"/><path d="M0 0q-12 2-9-6q4-7 9 6"/><path d="M0 0q12 2 9-6q-4-7-9 6"/></g><path d="M0 0v6" stroke="#c9b79b" stroke-width=".8"/></g>
  <path d="M0 142q42-18 100-3t100-4v30H0z" fill="url(#${hid}-hill)" mask="url(#${hid}-mask)"/>
  <path d="M0 149q46-13 96-1t104-3v20H0z" fill="#a9d38e" opacity=".55"/>
  <path d="M0 156q50-9 100-1t100-2v12H0z" fill="#8ec277" opacity=".5"/>
  <g class="sway"><g transform="translate(31 144)"><g fill="#fff"><circle cx="0" cy="-4" r="2.4"/><circle cx="3.8" cy="-1.2" r="2.4"/><circle cx="2.4" cy="3.2" r="2.4"/><circle cx="-2.4" cy="3.2" r="2.4"/><circle cx="-3.8" cy="-1.2" r="2.4"/></g><circle r="1.6" fill="#ffd35e"/></g></g>
  <g class="sway2"><g transform="translate(170 150) scale(.85)"><g fill="#ffe1ea"><circle cx="0" cy="-4" r="2.4"/><circle cx="3.8" cy="-1.2" r="2.4"/><circle cx="2.4" cy="3.2" r="2.4"/><circle cx="-2.4" cy="3.2" r="2.4"/><circle cx="-3.8" cy="-1.2" r="2.4"/></g><circle r="1.6" fill="#ffd35e"/></g></g>
  <g class="sway"><g transform="translate(148 156) scale(.7)"><g fill="#fff5c8"><circle cx="0" cy="-4" r="2.4"/><circle cx="3.8" cy="-1.2" r="2.4"/><circle cx="2.4" cy="3.2" r="2.4"/><circle cx="-2.4" cy="3.2" r="2.4"/><circle cx="-3.8" cy="-1.2" r="2.4"/></g><circle r="1.6" fill="#e8a86a"/></g></g>
  <g stroke="#7fae6b" stroke-width="2" stroke-linecap="round"><path d="M14 162q2-9 5-12m4 12q-1-8-4-11"/><path d="M188 163q2-8 5-11m3 11q-1-7-3-10"/><path d="M60 164q2-7 4-9"/></g>
  <g fill="#e6d6b8" stroke="#c2ac87" stroke-width=".9"><ellipse cx="132" cy="160" rx="3.4" ry="1.9"/><ellipse cx="138" cy="158" rx="2.2" ry="1.4"/></g>
  ${kid('happy','hero',96,61,1.12)}
  <path d="M138 42q-3 20-12 36" fill="none" stroke="#b98a5c" stroke-width="1.6" stroke-dasharray="3 3"/>
  <g class="bob"><g transform="translate(140 34)"><path d="M0-6q-11-12-4-22q8-8 14 0q6-8 14 0q7 10-4 22l-10 9z" fill="url(#${hid}-heart)" stroke="#c96a7c" stroke-width="1.6"/><path d="M-1-24q2-6 8-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M-6-14q4-4 8-2" fill="none" stroke="#ffd9df" stroke-width="1.8" stroke-linecap="round" opacity=".8"/></g></g>
  <path d="M166 56q-2 14-8 24" fill="none" stroke="#b98a5c" stroke-width="1.4" stroke-dasharray="3 3"/>
  <g class="bob2"><g transform="translate(166 48) scale(.78)"><path d="M0-6q-11-12-4-22q8-8 14 0q6-8 14 0q7 10-4 22l-10 9z" fill="url(#${hid}-heart2)" stroke="#6fa9c7" stroke-width="1.8"/><path d="M-1-24q2-6 8-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g></g>
  <g fill="#fff" opacity=".95"><path d="M176 66l2.2 5.4 5.4 2.2-5.4 2.2L176 81l-2.2-5.2-5.4-2.2 5.4-2.2z" class="twinkle"/><path d="M14 116l1.8 4.4 4.4 1.8-4.4 1.8L14 128l-1.8-4.4-4.4-1.8 4.4-1.8z" class="twinkle2"/><path d="M118 14l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" class="twinkle" opacity=".8"/></g>
 </svg>`;
}
