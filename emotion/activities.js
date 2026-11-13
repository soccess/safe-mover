"use strict";

let taDispose=null,taAC=null;
function taTone(freq,dur=.45,kind='sine',vol=.055){
 try{
  taAC=taAC||new (window.AudioContext||window.webkitAudioContext)();
  if(taAC.state==='suspended')taAC.resume();
  const o=taAC.createOscillator(),g=taAC.createGain(),t=taAC.currentTime;
  o.type=kind;o.frequency.value=freq;
  g.gain.setValueAtTime(.0001,t);
  g.gain.linearRampToValueAtTime(vol,t+.02);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(taAC.destination);
  o.start(t);o.stop(t+dur+.03);
 }catch(e){}
}
function taSpeak(text){
 try{
  if(!('speechSynthesis' in window))return false;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='ko-KR';u.rate=.9;u.pitch=1.04;
  speechSynthesis.speak(u);
  return true;
 }catch(e){return false}
}
function taConfetti(){
 if(document.querySelector('.ta-confetti'))return;
 const box=document.createElement('div');box.className='ta-confetti';
 const cols=['#f6a3a8','#ffd97a','#a9d8a8','#a9d3e8','#c9b6f2','#ffb6c2'];
 for(let i=0;i<30;i++){
  const p=document.createElement('i');
  p.style.left=(Math.random()*100)+'%';
  p.style.background=cols[i%cols.length];
  p.style.animationDelay=(Math.random()*.45)+'s';
  p.style.animationDuration=(1.15+Math.random()*.9)+'s';
  box.append(p);
 }
 document.body.append(box);setTimeout(()=>box.remove(),2600);
}
function taStatus(stage,html){const p=stage.querySelector('.ta-status');if(p)p.innerHTML=html}
function taDone(stage,msg,party=true){
 if(stage.querySelector('.ta-done')){taStatus(stage,msg);return}
 const d=document.createElement('div');d.className='ta-done';
 d.innerHTML='<span>🌷</span><span>'+msg+'</span>';
 stage.append(d);
 const dot=document.getElementById('p3');if(dot)dot.className='dot done';
 if(party)taConfetti();
 stage.classList.add('ta-flash');setTimeout(()=>stage.classList.remove('ta-flash'),600);
}
const TABLET_ACT={
 breathe:{name:'숨 고르기',hint:'큰 원을 눌러 3번 숨 쉬어요',
  html:`<div class="ta-breathe"><button class="ta-breath-circle" type="button" aria-label="숨 고르기 시작"><span class="lbl">시작</span><span class="sub">눌러서 숨 고르기</span></button><div class="dots"><span></span><span></span><span></span></div><p class="ta-status" aria-live="polite">천천히 준비해요. 원을 눌러 주세요.</p></div>`,
  init(stage){
   const circle=stage.querySelector('.ta-breath-circle'),lbl=stage.querySelector('.lbl'),sub=stage.querySelector('.sub'),dots=[...stage.querySelectorAll('.dots span')];
   const steps=[{d:4000,label:'들이쉬어요',sub:'코로 하나, 둘, 셋',from:.74,to:1},{d:1500,label:'멈춰요',sub:'잠깐 숨을 참아요',from:1,to:1},{d:6000,label:'내쉬어요',sub:'입으로 하나, 둘, 셋, 넷',from:1,to:.74}];
   let idx=0,t0=0,cycle=0,raf=0,running=false;
   const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
   function phaseStart(){const s=steps[idx];lbl.textContent=s.label;sub.textContent=s.sub;taStatus(stage,s.label+' · '+s.sub);t0=performance.now()}
   function frame(now){
    if(!running)return;
    const s=steps[idx],p=Math.min(1,(now-t0)/s.d);
    circle.style.transform='scale('+(s.from+(s.to-s.from)*ease(p)).toFixed(3)+')';
    if(p>=1){
     idx++;
     if(idx>=steps.length){
      idx=0;cycle++;dots.forEach((d,i)=>d.classList.toggle('on',i<cycle));
      if(cycle>=3){running=false;circle.style.transform='scale(.74)';lbl.textContent='완료!';sub.textContent='마음이 조금 편안해졌어요';taDone(stage,'3번 숨을 고르며 마음을 살펴봤어요. 정말 잘했어요!');return}
      phaseStart();
     }
    }
    raf=requestAnimationFrame(frame);
   }
   circle.addEventListener('click',()=>{
    if(running){running=false;cancelAnimationFrame(raf);lbl.textContent='계속';sub.textContent='눌러서 이어서 숨 쉬어요';taStatus(stage,'잠시 멈췄어요. 준비되면 다시 눌러요.');return}
    running=true;if(cycle===0)dots.forEach(d=>d.classList.remove('on'));
    phaseStart();raf=requestAnimationFrame(frame);
   });
   return ()=>{running=false;cancelAnimationFrame(raf)};
  }},
 music:{name:'소리 따라하기',hint:'패드를 눌러 소리를 듣고 따라 해요',
  html:`<div><div class="ta-pads"><button class="ta-pad" type="button" data-note="0">♪<small>도</small></button><button class="ta-pad" type="button" data-note="1">♫<small>미</small></button><button class="ta-pad" type="button" data-note="2">♬<small>솔</small></button><button class="ta-pad" type="button" data-note="3">♪<small>높은 도</small></button></div><div class="ta-notes" aria-hidden="true"></div><div class="ta-row"><button class="ta-btn soft" type="button" data-play>▶ 따라하기 시작</button><span class="ta-status" style="margin:0">먼저 마음에 드는 소리를 눌러봐요.</span></div></div>`,
  init(stage){
   const pads=[...stage.querySelectorAll('.ta-pad')],notes=stage.querySelector('.ta-notes');
   const freqs=[523.25,659.25,783.99,1046.5],pattern=[0,2,1,3],timers=[];
   let accept=false,user=0;
   const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
   const hit=p=>{p.classList.add('hit');later(()=>p.classList.remove('hit'),150)};
   pads.forEach(p=>p.addEventListener('click',()=>{
    const n=+p.dataset.note;
    taTone(freqs[n],.7,'sine',.06);hit(p);
    notes.insertAdjacentHTML('beforeend','<span>'+['♪','♫','♬','♪'][n]+'</span>');
    while(notes.children.length>7)notes.firstElementChild.remove();
    if(!accept)return;
    if(n===pattern[user]){
     p.classList.add('ok');later(()=>p.classList.remove('ok'),520);user++;
     if(user>=pattern.length){accept=false;taDone(stage,'네 소리를 귀 기울여 듣고 잘 따라 했어요!')}
     else taStatus(stage,'좋아요! 다음 소리를 눌러봐요 ('+user+' / '+pattern.length+')');
    }else{
     p.classList.add('bad');later(()=>p.classList.remove('bad'),420);user=0;
     taStatus(stage,'괜찮아요. 다시 듣고 처음부터 눌러볼까요?');
    }
   }));
   stage.querySelector('[data-play]').addEventListener('click',()=>{
    accept=false;user=0;taStatus(stage,'잘 들어보세요. 소리가 반짝일 거예요…');
    pattern.forEach((n,i)=>later(()=>{const p=pads[n];taTone(freqs[n],.6);hit(p)},500+i*680));
    later(()=>{accept=true;taStatus(stage,'이제 들은 순서대로 눌러봐요! (0 / '+pattern.length+')')},500+pattern.length*680+250);
   });
   return ()=>timers.forEach(clearTimeout);
  }},
 walk:{name:'마음 산책 길',hint:'길을 따라 손가락을 천천히 밀어요',
  html:`<div><svg class="ta-walk-svg svg-anim" viewBox="0 0 320 124" role="img" aria-label="손가락으로 따라 걷는 산책 길"><defs><linearGradient id="walkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset="1" stop-color="#f8fbf0"/></linearGradient></defs><rect width="320" height="124" rx="14" fill="url(#walkSky)"/><g class="bob2" opacity=".9"><path d="M54 24q0-7 8-7t8 7q6 0 6 5t-6 5H54q-6 0-6-5t6-5" fill="#fff"/><path d="M236 22q0-6 7-6t7 6q5 0 5 4.5t-5 4.5h-14q-5 0-5-4.5t5-4.5" fill="#fff"/></g><circle cx="292" cy="24" r="10" fill="#ffe27a" class="pulse"/><path d="M0 102q75-24 160-8t160-10v40H0z" fill="#d9efca" opacity=".8"/><path d="M22 96C80 28 128 106 188 60S286 30 300 64" fill="none" stroke="#eadfc0" stroke-width="19" stroke-linecap="round"/><path class="walk-path" d="M22 96C80 28 128 106 188 60S286 30 300 64" fill="none" stroke="#fffdf4" stroke-width="8" stroke-linecap="round"/><path d="M22 96C80 28 128 106 188 60S286 30 300 64" fill="none" stroke="#d9c79b" stroke-width="2.4" class="dashFlow" stroke-linecap="round"/><g class="walk-items" font-size="19" text-anchor="middle" dy="7"><g class="walk-item"><circle r="13" fill="#fff" stroke="#a7d7b8" stroke-width="2"/><text dy="6">🍃</text></g><g class="walk-item"><circle r="13" fill="#fff" stroke="#a7d7b8" stroke-width="2"/><text dy="6">🌿</text></g><g class="walk-item"><circle r="13" fill="#fff" stroke="#a7d7b8" stroke-width="2"/><text dy="6">☁️</text></g></g><g class="walk-marker"><circle r="14" fill="#fff" stroke="#8d7cc4" stroke-width="2.8"/><text text-anchor="middle" dy="5" font-size="14">👣</text></g></svg><div class="ta-collect"><span>🍃 바람</span><span>🌿 나뭇잎</span><span>☁️ 하늘</span></div><p class="ta-status" aria-live="polite">길 위에 손가락을 대고 천천히 밀어봐요.</p></div>`,
  init(stage){
   const svg=stage.querySelector('.ta-walk-svg'),marker=stage.querySelector('.walk-marker'),path=stage.querySelector('.walk-path');
   const items=[...stage.querySelectorAll('.walk-item')],badges=[...stage.querySelectorAll('.ta-collect span')];
   const len=path.getTotalLength(),spots=[.28,.56,.84],collected=new Set();
   let done=false;
   spots.forEach((s,i)=>{const pt=path.getPointAtLength(len*s),g=items[i];g.setAttribute('transform','translate('+pt.x+' '+pt.y+')');g.setAttribute('opacity','.32')});
   function place(p){const pt=path.getPointAtLength(len*Math.max(0,Math.min(1,p)));marker.setAttribute('transform','translate('+pt.x+' '+pt.y+')')}
   function move(e){
    if(done)return;
    const r=svg.getBoundingClientRect();
    const p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    place(p);
    spots.forEach((s,i)=>{
     if(p>=s-.012&&!collected.has(i)){
      collected.add(i);items[i].setAttribute('opacity','1');items[i].classList.add('pop');badges[i].classList.add('on');
      taTone([659,784,1046][i]||880,.28,'sine',.03);
     }
    });
    taStatus(stage,'길을 따라 걷는 중… '+collected.size+' / 3');
    if(collected.size===3){done=true;taDone(stage,'바람·나뭇잎·하늘을 모두 만났어요. 마음이 한결 가벼워졌어요!')}
   }
   let down=false;
   svg.addEventListener('pointerdown',e=>{down=true;try{svg.setPointerCapture(e.pointerId)}catch(x){};move(e)});
   svg.addEventListener('pointermove',e=>{if(down)move(e)});
   ['pointerup','pointercancel','pointerleave'].forEach(t=>svg.addEventListener(t,()=>{down=false}));
   return ()=>{done=true};
  }},
 read:{name:'마음 그림책',hint:'책장을 넘기며 천천히 읽어요',
  html:`<div><div class="ta-book"><div class="bemoji">🌧️</div><p class="btext"></p><div class="bpage"></div></div><div class="ta-row"><button class="ta-btn soft" type="button" data-prev>← 이전</button><button class="ta-btn" type="button" data-next>다음 →</button><button class="ta-chip" type="button" data-bm>🔖 마음에 남기기</button></div><div class="ta-saved" aria-live="polite"></div><p class="ta-status">한 장씩 천천히 읽어도 괜찮아요.</p></div>`,
  init(stage){
   const book=stage.querySelector('.ta-book'),emoji=stage.querySelector('.bemoji'),text=stage.querySelector('.btext'),pageNo=stage.querySelector('.bpage'),prev=stage.querySelector('[data-prev]'),next=stage.querySelector('[data-next]'),bm=stage.querySelector('[data-bm]'),saved=stage.querySelector('.ta-saved');
   const pages=[
    {e:'🌧️',t:'오늘 마음에 빗방울이 내려도 괜찮아요. 마음 날씨는 언제나 바뀌니까요.'},
    {e:'☕',t:'나는 나를 천천히 돌볼 수 있어요. 따뜻한 차 한 모금처럼 천천히요.'},
    {e:'🤝',t:'도움이 필요하면 손을 들어요. 나는 혼자가 아니에요.'}
   ];
   let i=0,savedCount=0;
   function render(){
    const p=pages[i];emoji.textContent=p.e;text.textContent=p.t;pageNo.textContent=(i+1)+' / '+pages.length;
    prev.disabled=i===0;next.textContent=i===pages.length-1?'다 읽었어요 ✓':'다음 →';
    book.classList.remove('flip');void book.offsetWidth;book.classList.add('flip');
   }
   prev.addEventListener('click',()=>{if(i>0){i--;render()}});
   next.addEventListener('click',()=>{if(i<pages.length-1){i++;render()}else taDone(stage,'그림책을 끝까지 읽으며 마음을 쓰다듬었어요.')});
   bm.addEventListener('click',()=>{
    if(savedCount>=2){taStatus(stage,'마음에 남는 문장은 두 개까지 담을 수 있어요.');return}
    savedCount++;saved.insertAdjacentHTML('beforeend','<span>🔖 <b>'+pages[i].t+'</b></span>');
    taStatus(stage,'마음에 남는 문장을 저장했어요.');taTone(880,.25,'sine',.04);
   });
   render();
   return null;
  }},
 water:{name:'물 한 모금',hint:'버튼을 눌러 천천히 네 번 마셔요',
  html:`<div class="ta-water"><div class="ta-cup"><div class="fill" style="height:88%"></div><div class="shine"></div><i class="bub" style="left:22px;bottom:14px;animation-delay:.2s"></i><i class="bub" style="left:48px;bottom:8px;animation-delay:1s"></i></div><div><div class="ta-sips"><i>1</i><i>2</i><i>3</i><i>4</i></div><div class="ta-row"><button class="ta-btn" type="button" data-sip>한 모금 🥤</button></div><p class="ta-status" aria-live="polite">물컵을 준비하고 천천히 마셔봐요.</p></div></div>`,
  init(stage){
   const fill=stage.querySelector('.fill'),sips=[...stage.querySelectorAll('.ta-sips i')],btn=stage.querySelector('[data-sip]');
   const msgs=['입안이 촉촉해졌어요.','목으로 시원하게 넘어가요.','몸이 물을 반가워해요.','물이 몸 구석구석에 닿는 느낌이에요.'];
   let n=0;
   btn.addEventListener('click',()=>{
    if(n>=4)return;
    n++;sips[n-1].classList.add('on');
    fill.style.height=Math.max(12,88-n*19)+'%';
    taTone(520+n*70,.3,'sine',.04);
    taStatus(stage,msgs[n-1]+' ('+n+' / 4)');
    if(n===4){btn.disabled=true;taDone(stage,'네 번 천천히 물을 마시며 몸의 신호를 살펴봤어요.')}
   });
   return null;
  }},
 talk:{name:'내 마음 말하기',hint:'낱말을 골라 내 마음을 문장으로 말해요',
  html:`<div class="ta-talk"><div class="ta-bubble">지금 나는 <b>___</b>한 기분이에요</div><div class="ta-row" data-chips><button class="ta-chip" type="button">기쁜</button><button class="ta-chip" type="button">슬픈</button><button class="ta-chip" type="button">화난</button><button class="ta-chip" type="button">놀란</button><button class="ta-chip" type="button">불안한</button><button class="ta-chip" type="button">피곤한</button><button class="ta-chip" type="button">외로운</button><button class="ta-chip" type="button">편안한</button></div><div class="ta-row"><button class="ta-btn" type="button" data-speak>🗣️ 소리 내어 말하기</button><button class="ta-chip" type="button" data-reset>다시 고르기</button></div><p class="ta-status" aria-live="polite">마음과 가장 가까운 낱말을 하나 골라봐요.</p></div>`,
  init(stage){
   const bubble=stage.querySelector('.ta-bubble'),chips=[...stage.querySelectorAll('[data-chips] .ta-chip')],speak=stage.querySelector('[data-speak]'),reset=stage.querySelector('[data-reset]');
   let word='';
   chips.forEach(c=>c.addEventListener('click',()=>{
    chips.forEach(x=>x.classList.remove('on'));c.classList.add('on');word=c.textContent;
    bubble.innerHTML='지금 나는 <b>'+word+'</b>한 기분이에요';
    bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');
    taTone(700,.22,'sine',.03);
    taStatus(stage,'“지금 나는 '+word+'한 기분이에요”라고 말해볼까요?');
   }));
   speak.addEventListener('click',()=>{
    if(!word){taStatus(stage,'먼저 마음 낱말을 하나 골라요.');return}
    const says='지금 나는 '+word+'한 기분이에요';
    taStatus(stage,'말해보세요: <b>'+says+'</b>');
    speak.disabled=true;setTimeout(()=>{speak.disabled=false},900);
    taDone(stage,'내 마음을 낱말로 표현했어요. 말하는 것만으로도 마음이 조금 가벼워져요.');
    taSpeak(says);
   });
   reset.addEventListener('click',()=>{word='';chips.forEach(x=>x.classList.remove('on'));bubble.innerHTML='지금 나는 <b>___</b>한 기분이에요';taStatus(stage,'천천히 다시 골라봐요.')});
   return null;
  }},
 draw:{name:'마음 그림 그리기',hint:'손가락으로 색과 모양을 그려요',
  html:`<div class="ta-draw-wrap"><div class="ta-draw-tools"><button class="ta-swatch on" type="button" data-c="#f28c8c" style="background:#f28c8c" aria-label="분홍"></button><button class="ta-swatch" type="button" data-c="#f7c85f" style="background:#f7c85f" aria-label="노랑"></button><button class="ta-swatch" type="button" data-c="#8bc985" style="background:#8bc985" aria-label="초록"></button><button class="ta-swatch" type="button" data-c="#7cc8e6" style="background:#7cc8e6" aria-label="하늘"></button><button class="ta-swatch" type="button" data-c="#b39ddb" style="background:#b39ddb" aria-label="보라"></button><button class="ta-swatch" type="button" data-c="#6b5a52" style="background:#6b5a52" aria-label="갈색"></button><button class="ta-size on" type="button" data-s="5" aria-label="가는 붓"><i style="width:5px;height:5px"></i></button><button class="ta-size" type="button" data-s="11" aria-label="중간 붓"><i style="width:11px;height:11px"></i></button><button class="ta-size" type="button" data-s="20" aria-label="굵은 붓"><i style="width:20px;height:20px"></i></button><button class="ta-chip" type="button" data-eraser>🧽 지우개</button><button class="ta-chip" type="button" data-undo>↩ 되돌리기</button><button class="ta-chip" type="button" data-clear>🗑 지우기</button><button class="ta-chip" type="button" data-save>⬇ 저장</button></div><canvas id="drawCanvas" aria-label="손가락으로 그리는 마음 그림판"></canvas><p class="ta-status" aria-live="polite">손가락으로 자유롭게 그려보세요. 잘 그리지 않아도 괜찮아요.</p></div>`,
  init(stage){
   const canvas=stage.querySelector('#drawCanvas'),ctx=canvas.getContext('2d');
   let color='#f28c8c',size=5,eraser=false,drawing=false,last=null,strokes=0,snaps=[],w=1,h=1;
   function fit(){
    const r=canvas.getBoundingClientRect();if(!r.width)return;
    const dpr=Math.min(2,window.devicePixelRatio||1),old=canvas.width?canvas.toDataURL():'';
    w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    if(old){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,w,h);img.src=old}
   }
   const raf=requestAnimationFrame(fit);
   const pos=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
   canvas.addEventListener('pointerdown',e=>{
    e.preventDefault();try{canvas.setPointerCapture(e.pointerId)}catch(x){}
    drawing=true;snaps.push(canvas.toDataURL());if(snaps.length>10)snaps.shift();
    const p=pos(e);last=p;ctx.fillStyle=eraser?'#fff':color;
    ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill();
   });
   canvas.addEventListener('pointermove',e=>{
    if(!drawing)return;
    const p=pos(e);ctx.strokeStyle=eraser?'#fff':color;ctx.lineWidth=size;
    ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;
   });
   ['pointerup','pointercancel','pointerleave'].forEach(t=>canvas.addEventListener(t,()=>{
    if(!drawing)return;drawing=false;strokes++;
    if(strokes===3)taStatus(stage,'좋아요! 색과 모양으로 마음을 표현하고 있어요.');
   }));
   stage.querySelectorAll('.ta-swatch').forEach(b=>b.addEventListener('click',()=>{
    stage.querySelectorAll('.ta-swatch').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    color=b.dataset.c;eraser=false;stage.querySelector('[data-eraser]').classList.remove('on');
   }));
   stage.querySelectorAll('.ta-size').forEach(b=>b.addEventListener('click',()=>{
    stage.querySelectorAll('.ta-size').forEach(x=>x.classList.remove('on'));b.classList.add('on');size=+b.dataset.s;
   }));
   stage.querySelector('[data-eraser]').addEventListener('click',e=>{eraser=!eraser;e.currentTarget.classList.toggle('on',eraser)});
   stage.querySelector('[data-clear]').addEventListener('click',()=>{snaps.push(canvas.toDataURL());ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);taStatus(stage,'새 종이에 다시 그려볼까요?')});
   stage.querySelector('[data-undo]').addEventListener('click',()=>{
    const s=snaps.pop();if(!s){taStatus(stage,'되돌릴 그림이 없어요.');return}
    const img=new Image();img.onload=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h)};img.src=s;
   });
   stage.querySelector('[data-save]').addEventListener('click',()=>{
    try{const a=document.createElement('a');a.download='마음그림.png';a.href=canvas.toDataURL('image/png');a.click()}catch(e){}
    taDone(stage,'나만의 마음 그림을 저장했어요. 그림은 나를 이해하는 멋진 언어예요.');
   });
   return ()=>cancelAnimationFrame(raf);
  }},
 cozy:{name:'포근한 안아주기',hint:'하트를 2초 동안 꾹 눌러요',
  html:`<div class="ta-cozy"><button class="ta-hug" type="button" aria-label="꾹 눌러 안아주기">🧸</button><div class="ta-meter"><i></i></div><p class="ta-status" aria-live="polite">하트를 손가락으로 2초 동안 꾹 눌러 안아주세요.</p></div>`,
  init(stage){
   const btn=stage.querySelector('.ta-hug'),bar=stage.querySelector('.ta-meter i');
   let v=0,raf=0,holding=false,last=0,done=false;
   function frame(now){
    const dt=last?now-last:16;last=now;
    v=holding?Math.min(1,v+dt/2000):Math.max(0,v-dt/2600);
    bar.style.width=(v*100).toFixed(1)+'%';
    btn.classList.toggle('grow',holding);
    if(v>=1&&!done){done=true;holding=false;btn.textContent='💗';taDone(stage,'따뜻하게 안아줬어요. 나를 다정하게 돌보는 시간이었어요.');}
    if(v>0||holding)raf=requestAnimationFrame(frame);else{last=0;return}
   }
   const start=()=>{if(done)return;holding=true;last=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)};
   const end=()=>{holding=false;if(v>0&&v<1)raf=requestAnimationFrame(frame)};
   btn.addEventListener('pointerdown',e=>{e.preventDefault();start()});
   ['pointerup','pointercancel','pointerleave'].forEach(t=>btn.addEventListener(t,end));
   btn.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')start()});
   btn.addEventListener('keyup',end);
   return ()=>{holding=false;cancelAnimationFrame(raf)};
  }},
 friend:{name:'기쁨 나누기',hint:'버튼을 눌러 친구에게 기쁨을 보내요',
  html:`<div class="ta-friends"><div class="ta-figures"><div class="ta-figure"><span class="face">🧒</span><span>나</span></div><div class="ta-figure"><span class="face" data-friend>🧑</span><span>친구</span></div></div><div class="ta-heart-count">나눈 기쁨 0 / 5</div><button class="ta-btn" type="button" data-share>💛 기쁜 일 나누기</button><p class="ta-status" aria-live="polite">좋은 일은 나눌수록 커져요.</p></div>`,
  init(stage){
   const btn=stage.querySelector('[data-share]'),figures=stage.querySelector('.ta-figures'),count=stage.querySelector('.ta-heart-count'),friend=stage.querySelector('[data-friend]');
   const lines=['오늘 재미있는 일이 있었어!','네 덕분에 웃었어.','같이 놀아서 정말 좋았어!','내 기쁨을 너에게 나눌게.','함께라서 더 행복해!'];
   let n=0;
   btn.addEventListener('click',()=>{
    if(n>=5)return;
    n++;count.textContent='나눈 기쁨 '+n+' / 5';
    taStatus(stage,lines[n-1]);
    taTone(660+n*55,.3,'triangle',.04);
    const f=document.createElement('span');f.className='ta-fly';f.textContent=['💛','💗','✨','💛','💖'][n-1];figures.append(f);
    setTimeout(()=>f.remove(),1200);
    if(n>=5){
     friend.textContent='😄';friend.classList.add('happy');
     taDone(stage,'기쁨을 나누니 마음이 더 환해졌어요. 친구도 웃고 있어요!');
    }
   });
   return null;
  }},
 jar:{name:'고마움 항아리',hint:'고마운 일을 적어 항아리에 담아요',
  html:`<div class="ta-jar-wrap"><div class="ta-jar"><div class="lid"></div></div><div><div class="ta-row"><input class="ta-input" type="text" maxlength="24" placeholder="고마운 일을 적어요" aria-label="고마운 일"><button class="ta-btn" type="button" data-add>담기</button></div><div class="ta-row"><button class="ta-chip" type="button">가족</button><button class="ta-chip" type="button">친구</button><button class="ta-chip" type="button">선생님</button><button class="ta-chip" type="button">맛있는 간식</button></div><div class="ta-jarlist" aria-live="polite"></div></div></div><p class="ta-status">작은 고마움도 소중한 선물이에요.</p>`,
  init(stage){
   const jar=stage.querySelector('.ta-jar'),input=stage.querySelector('.ta-input'),list=stage.querySelector('.ta-jarlist'),add=stage.querySelector('[data-add]'),chips=[...stage.querySelectorAll('.ta-row .ta-chip')];
   let n=0;
   function put(txt){
    txt=(txt||'').trim();if(!txt){input.focus();return}
    if(n>=6){taStatus(stage,'항아리가 가득 찼어요. 마음이 따뜻해졌어요.');return}
    n++;
    const note=document.createElement('div');note.className='note';
    note.style.left=(8+(n%3)*26)+'px';note.style.bottom=(6+Math.floor((n-1)/3)*26)+'px';
    note.style.transform='rotate('+((n%2?-1:1)*(4+n*2))+'deg)';
    jar.append(note);
    list.insertAdjacentHTML('beforeend','<b>'+n+'. '+txt+'</b>');
    input.value='';input.focus();taTone(740,.3,'sine',.04);
    taStatus(stage,'고마운 마음을 '+n+'개 담았어요.');
    if(n>=2)taDone(stage,'고마운 마음을 항아리에 담았어요. 힘든 날 꺼내 읽어봐요.');
   }
   add.addEventListener('click',()=>put(input.value));
   input.addEventListener('keydown',e=>{if(e.key==='Enter')put(input.value)});
   chips.forEach(c=>c.addEventListener('click',()=>put(c.textContent+'에게 고마웠어요')));
   return null;
  }},
 dance:{name:'기분 좋은 춤',hint:'박자를 눌러 몸으로 기쁨을 표현해요',
  html:`<div class="ta-dance"><div><span class="ta-dancer" aria-hidden="true">🕺</span></div><div class="ta-beatpads"><button class="ta-beat" type="button" data-f="392">👏<small style="display:block;font-size:10px">손</small></button><button class="ta-beat" type="button" data-f="330">🦶<small style="display:block;font-size:10px">발</small></button><button class="ta-beat" type="button" data-f="523">🦘<small style="display:block;font-size:10px">점프</small></button><button class="ta-beat" type="button" data-f="440">🌀<small style="display:block;font-size:10px">돌기</small></button></div><div class="ta-meter"><i></i></div><p class="ta-status" aria-live="polite">마음이 가는 대로 박자를 눌러봐요. 8번이면 충분해요!</p></div>`,
  init(stage){
   const dancer=stage.querySelector('.ta-dancer'),bar=stage.querySelector('.ta-meter i'),pads=[...stage.querySelectorAll('.ta-beat')];
   const praise=['신나요!','리듬이 좋아요!','몸이 가벼워졌어요!','마음이 들썩들썩!'];
   let n=0;
   pads.forEach(p=>p.addEventListener('click',()=>{
    if(n>=8)return;
    n++;bar.style.width=(n/8*100)+'%';
    taTone(+p.dataset.f,.22,'triangle',.05);
    dancer.classList.remove('jump');void dancer.offsetWidth;dancer.classList.add('jump');
    setTimeout(()=>dancer.classList.remove('jump'),220);
    taStatus(stage,praise[(n-1)%praise.length]+' ('+n+' / 8)');
    if(n>=8)taDone(stage,'몸을 움직여 기쁨을 표현했어요. 마음이 한결 밝아졌죠?');
   }));
   return null;
  }},
 trophy:{name:'나의 작은 성취',hint:'별을 눌러 오늘 해낸 일을 찾아요',
  html:`<div class="ta-trophy"><div class="cup" aria-hidden="true">🏆</div><div class="ta-stars"><button class="ta-star" type="button" data-p="오늘 아침 스스로 일어났어요">⭐<small style="display:block;font-size:9px">아침</small></button><button class="ta-star" type="button" data-p="수업에 끝까지 참여했어요">⭐<small style="display:block;font-size:9px">수업</small></button><button class="ta-star" type="button" data-p="친구에게 다정하게 말했어요">⭐<small style="display:block;font-size:9px">친구</small></button></div><p class="ta-status" aria-live="polite">작은 일도 내가 해낸 멋진 일이에요.</p></div>`,
  init(stage){
   const stars=[...stage.querySelectorAll('.ta-star')],cup=stage.querySelector('.cup');
   const praise=[];
   stars.forEach(s=>s.addEventListener('click',()=>{
    if(s.classList.contains('on'))return;
    s.classList.add('on');praise.push(s.dataset.p);taTone(784+praise.length*80,.35,'sine',.05);
    taStatus(stage,'“'+s.dataset.p+'” — 참 잘했어요! ('+praise.length+' / 3)');
    cup.classList.add('lit');
    if(praise.length>=3){
     cup.classList.remove('lit');void cup.offsetWidth;cup.classList.add('lit');
     taDone(stage,'오늘 해낸 세 가지를 찾았어요. 나는 스스로를 칭찬할 수 있어요!');
    }
   }));
   return null;
  }},
 question:{name:'궁금한 점 묻기',hint:'카드를 뒤집고 어른에게 물어볼 질문을 만들어요',
  html:`<div><div class="ta-cards"><button class="ta-flipcard" type="button" aria-label="무슨 일이었나요"><i class="front">❓</i><i class="back">본 것과 들은 것을 차분히 떠올려요</i></button><button class="ta-flipcard" type="button" aria-label="내 느낌은 어떤가요"><i class="front">❓</i><i class="back">놀람·궁금함·걱정 중에서 골라요</i></button><button class="ta-flipcard" type="button" aria-label="누구에게 물어볼까요"><i class="front">❓</i><i class="back">믿을 수 있는 어른을 떠올려요</i></button></div><div class="ta-row"><input class="ta-input" type="text" maxlength="40" placeholder="어른에게 물어볼 질문" aria-label="어른에게 물어볼 질문"><button class="ta-btn" type="button" data-save>질문 저장</button></div><div class="ta-saved" aria-live="polite"></div><p class="ta-status">모르는 것을 묻는 건 좋은 용기예요.</p></div>`,
  init(stage){
   const cards=[...stage.querySelectorAll('.ta-flipcard')],input=stage.querySelector('.ta-input'),save=stage.querySelector('[data-save]'),saved=stage.querySelector('.ta-saved');
   let flipped=0;
   cards.forEach(c=>c.addEventListener('click',()=>{
    if(!c.classList.contains('flip')){flipped++;taTone(620+flipped*60,.22,'sine',.03)}
    c.classList.toggle('flip');
    taStatus(stage,'카드를 뒤집어 생각을 정리하고 있어요. ('+Math.min(flipped,3)+' / 3)');
    if(flipped>=2)taDone(stage,'생각을 정리했어요. 이제 믿을 수 있는 어른에게 물어봐요.');
   }));
   save.addEventListener('click',()=>{
    const q=input.value.trim();if(!q){taStatus(stage,'궁금한 점을 한 문장으로 적어봐요.');input.focus();return}
    saved.innerHTML='<span>🙋 <b>'+q+'</b> — 선생님께 물어볼게요.</span>';
    input.value='';taStatus(stage,'질문을 저장했어요. 물어보는 용기가 생겼어요!');
    taDone(stage,'궁금한 점을 질문으로 만들었어요. 어른에게 차분히 물어봐요.');
   });
   return null;
  }},
 write:{name:'마음 메모',hint:'오늘의 마음을 짧게 적어 남겨요',
  html:`<div class="ta-write"><textarea class="ta-textarea" maxlength="160" placeholder="오늘 마음에 남은 일을 적어보세요. 짧아도 괜찮아요." aria-label="마음 메모"></textarea><div class="ta-row" data-feels><button class="ta-chip" type="button">기쁨</button><button class="ta-chip" type="button">슬픔</button><button class="ta-chip" type="button">화남</button><button class="ta-chip" type="button">놀람</button><button class="ta-chip" type="button">평온</button></div><div class="ta-row"><button class="ta-btn" type="button" data-save>메모 저장</button><span class="ta-status" style="margin:0">0 / 160</span></div><div class="saved-wrap"></div></div>`,
  init(stage){
   const ta=stage.querySelector('.ta-textarea'),counter=stage.querySelector('.ta-row .ta-status'),save=stage.querySelector('[data-save]'),wrap=stage.querySelector('.saved-wrap'),chips=[...stage.querySelectorAll('[data-feels] .ta-chip')];
   let feel='';
   ta.addEventListener('input',()=>{counter.textContent=ta.value.length+' / 160'});
   chips.forEach(c=>c.addEventListener('click',()=>{
    chips.forEach(x=>x.classList.remove('on'));c.classList.toggle('on');feel=c.classList.contains('on')?c.textContent:'';
   }));
   save.addEventListener('click',()=>{
    const v=ta.value.trim();
    if(v.length<3){taStatus(stage,'두세 글자보다 조금 더 적어볼까요?');ta.focus();return}
    const stamp={'기쁨':'☀️','슬픔':'🌧️','화남':'🔥','놀람':'✨','평온':'🌿'}[feel]||'💛';
    wrap.innerHTML='<div class="ta-note-preview"><span class="stamp">'+stamp+'</span>'+v.replace(/[<>&]/g,'')+'<div style="margin-top:7px;font-size:11px;color:#a2946f">'+new Date().toLocaleDateString('ko-KR')+' · 나의 마음 메모</div></div>';
    taTone(880,.35,'sine',.05);
    taDone(stage,'마음을 적어 남겼어요. 메모는 나를 이해하는 작은 지도가 돼요.');
   });
   return null;
  }}
};
