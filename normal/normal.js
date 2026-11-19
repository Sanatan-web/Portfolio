/* =====================================================================
   Normal Mode — the simple portfolio page
   · project + works data (also used by Cinematic Mode through window.PORTFOLIO)
   · a full-screen viewer for case-study slides and work galleries
   · small touches: reveal on scroll, clips that only play while visible
   ===================================================================== */
(function(){'use strict';
const de=document.documentElement;de.classList.add('js');

// ---------------- contact ----------------
const RESUME='https://drive.google.com/file/d/1zu88RbV5W2wrdhHfRWkw-3fWaN3eb-RT/view?usp=sharing';
const LINKEDIN='https://www.linkedin.com/in/nishant-j-dixit/';
const EMAIL='hello.nishantjdixit@gmail.com';

// ---------------- case studies ----------------
// slides: the folder · files: the slides in order (add a file name here when you add a slide)
const num=(a,b)=>Array.from({length:b-a+1},(_,i)=>String(a+i).padStart(2,'0')+'.png');
const P=[
  {t:'Arivihan',slides:'img/projects/arivihan',img:'img/arivihan.png',
   files:[...num(1,11),'11a.png','11b.png','11c.png',...num(12,42)],
   link:'https://www.figma.com/proto/DU9RVYMAVxiM3L72Nr9ejL/homes-site-port?node-id=3235-10544&viewport=143%2C-566%2C0.29&t=xjCfeYKdzLUluFHN-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=3235%3A10544&page-id=3234%3A10543',
   d:'Rebuilt the LLM-powered AI Ask Doubt chatbot after 15+ student interviews, lifting D30 feature retention by 83%.'},
  {t:'Peakmind',slides:'img/projects/peakmind',img:'img/peakmind.png',files:num(1,45),
   link:'https://www.figma.com/proto/DU9RVYMAVxiM3L72Nr9ejL/holmes-site?node-id=3540-11737&viewport=-3714%2C229%2C0.05&t=N1M1eB7naTy8CBFg-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3540%3A11737&show-proto-sidebar=1&page-id=3234%3A10543',
   d:'Led product design for 18 months at a student mental wellness platform, increasing average session time by 37%.'},
  {t:'EDME Insurance',slides:'img/projects/edme',img:'img/edme.png',files:num(1,28),
   link:'https://www.figma.com/proto/DU9RVYMAVxiM3L72Nr9ejL/homes-site-port?node-id=3408-13674&viewport=143%2C-566%2C0.29&t=xjCfeYKdzLUluFHN-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=3408%3A13674&page-id=3234%3A10543',
   d:'Designed mobile and web experiences across 10+ insurance modules.'}
];

// ---------------- other work ----------------
// layout:'phones' for tall phone screens, 'wide' for websites · src ending in .mp4 plays as a muted loop
const WORKS={
  motion:{title:'Motion works',layout:'phones',items:[
    {src:'immersive/media/motion-peakoo.mp4?v=4',cap:'Sleep Zone, Peakmind'},
    {src:'immersive/media/motion-gift.mp4?v=4',cap:'Peakoo Chatbot, Peakmind'},
    {src:'immersive/media/motion-peakoo2.mp4?v=4',cap:'Peakoo Chatbot, Peakmind'},
    {src:'immersive/media/motion-flash1.mp4?v=4',cap:'Practice Feature, Arivihan'},
    {src:'immersive/media/motion-flash2.mp4?v=4',cap:'Practice Feature, Arivihan'},
    {src:'immersive/media/motion-arivihan.mp4?v=4',cap:'Practice Feature, Arivihan'},
    {src:'immersive/media/motion-arivihan2.mp4?v=4',cap:'Practice Feature, Arivihan'},
    {src:'immersive/media/motion-duolingo.mp4?v=4',cap:'Personal Work'}]},
  // uniform: every phone gets this screen shape (height ÷ width); shorter screens sit centred on their own background colour
  // every screen is 393×852 (786×1704 @2x), normalised in img/screens/designs/
  designs:{title:'More designs',layout:'phones',uniform:2.168,noCaps:true,items:['dark-1','dark-2','adaptive-1','adaptive-2','atelier-1','atelier-2','atelier-3','atelier-4','atelier-5','atelier-6','atelier-7','atelier-8','bloom-1','bloom-2','bloom-3','bloom-4']
    .map(n=>({src:'img/screens/designs/'+n+'.webp',cap:''}))},
  framer:{title:'Framer works',layout:'wide',items:[
    {src:'img/framer/shop and source.png',cap:'shopandsource.com'},
    {src:'img/framer/delta optix.png',cap:'deltaoptix.com'}]},
  vibe:{title:'Vibecoding works',layout:'wide',items:[
    {src:'img/vibe/vibe 1.png',cap:'thefallenheroes.in'},
    {src:'',cap:'Adding soon'}]}
};

// ---------------- viewer ----------------
const isVid=s=>/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(s);
// size a phone outline to its screen so nothing is cropped: the outline's opening is 897×1948 of 1012×2048,
// so a screen of height/width r needs an outline of 1012 × 2048·r/2.172 (a stretch of a few percent at most)
// fill the space around a contained screen with the screen's own background (sampled from its top-left corner)
function edgeColour(im,box){const go=()=>{try{const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.drawImage(im,2,2,6,6,0,0,1,1);const d=x.getImageData(0,0,1,1).data;box.style.background=`rgb(${d[0]},${d[1]},${d[2]})`;}catch(e){}};
  if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true});}
function fitPhone(m){const box=m.closest('.pf,.np-ph.bare');if(!box)return;const set=(w,h)=>{if(w&&h)box.style.aspectRatio='1012 / '+(2048*(h/w)/2.172).toFixed(1);};
  if(m.tagName==='VIDEO'){if(m.videoWidth)set(m.videoWidth,m.videoHeight);else m.addEventListener('loadedmetadata',()=>set(m.videoWidth,m.videoHeight),{once:true});}
  else if(m.complete&&m.naturalWidth)set(m.naturalWidth,m.naturalHeight);else m.addEventListener('load',()=>set(m.naturalWidth,m.naturalHeight),{once:true});}
const NV=(()=>{
  const el=document.createElement('div');el.className='nv';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','nvT');el.hidden=true;
  el.innerHTML='<div class="nv-bar"><div class="nv-bar-in"><h2 class="nv-t" id="nvT"></h2><div class="nv-r"><span class="nv-n" aria-live="polite"></span><a class="nv-a" target="_blank" rel="noopener" hidden>Prototype ↗</a><button class="nv-x" type="button" aria-label="Close">×</button></div></div></div><div class="nv-body"></div>';
  document.body.appendChild(el);
  const T=el.querySelector('.nv-t'),N=el.querySelector('.nv-n'),A=el.querySelector('.nv-a'),X=el.querySelector('.nv-x'),B=el.querySelector('.nv-body');
  let open=false,back=null,io=null,hideT=0,total=0,raf=0;
  // the counter follows the slide at the top of the view
  el.addEventListener('scroll',()=>{if(!total||raf)return;raf=requestAnimationFrame(()=>{raf=0;const f=B.querySelectorAll('.nv-slides figure'),top=el.scrollTop+el.querySelector('.nv-bar').offsetHeight+14;let i=0;
    for(let k=0;k<f.length;k++){if(f[k].offsetTop+f[k].offsetHeight*.5>top){i=k;break;}}if(el.scrollTop+el.clientHeight>=el.scrollHeight-4)i=f.length-1;N.textContent=(i+1)+' / '+total;});},{passive:true});
  const media=(src,alt,eager)=>{if(isVid(src)){const v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='metadata';v.src=src;v.setAttribute('aria-label',alt);return v;}
    const m=document.createElement('img');m.src=src;m.alt=alt;m.decoding='async';if(!eager)m.loading='lazy';return m;};
  function show(title,body,count,link,from){clearTimeout(hideT);back=from||document.activeElement;T.textContent=title;B.replaceChildren(body);N.textContent=count||'';
    A.hidden=!link;if(link)A.href=link;el.hidden=false;el.scrollTop=0;de.classList.add('nv-lock');open=true;
    requestAnimationFrame(()=>el.classList.add('on'));setTimeout(()=>X.focus({preventScroll:true}),40);
    io=new IntersectionObserver(es=>es.forEach(e=>{const t=e.target;
      if(e.isIntersecting){const p=t.play();if(p&&p.catch)p.catch(()=>{});}else t.pause();}),{root:el,threshold:.5});
    B.querySelectorAll('video').forEach(n=>io.observe(n));total=count?+count.split(' / ')[1]:0;}
  function slides(i,from){const p=P[i];if(!p)return;const wrap=document.createElement('div');wrap.className='nv-slides';
    p.files.forEach((f,k)=>{const fig=document.createElement('figure');fig.dataset.i=k+1;fig.appendChild(media(p.slides+'/'+f,p.t+' case study, slide '+(k+1),k<2));wrap.appendChild(fig);});
    show(p.t,wrap,'1 / '+p.files.length,p.link,from);}
  function works(k,from){const W=WORKS[k];if(!W)return;const g=document.createElement('div');g.className='nv-grid '+W.layout;
    W.items.forEach((it,j)=>{const f=document.createElement('figure');
      // websites: inside a desktop Mac
      if(W.layout==='wide'){const mac=document.createElement('div');mac.className='mac';mac.innerHTML='<div class="mac-body"><div class="mac-bez"><div class="mac-scr"></div></div></div><i class="mac-neck"></i><i class="mac-foot"></i>';
        const scr=mac.querySelector('.mac-scr');if(it.src)scr.appendChild(media(it.src,it.cap||W.title+' '+(j+1),true));else{const s=document.createElement('span');s.className='soon';s.textContent='COMING SOON';scr.appendChild(s);}
        f.appendChild(mac);if(it.cap){const c=document.createElement('figcaption');c.textContent=it.cap;f.appendChild(c);}g.appendChild(f);return;}
      const m=document.createElement('div');m.className='m';
      // phone screens sit inside the phone outline
      let box=m;if(W.layout==='phones'){m.classList.add('pf');box=document.createElement('div');box.className='pf-s';m.appendChild(box);}
      if(it.src){const md=media(it.src,it.cap||W.title+' '+(j+1),j<8);box.appendChild(md);
        if(box!==m&&W.uniform){m.style.aspectRatio='1012 / '+(2048*W.uniform/2.172).toFixed(1);md.classList.add('fit');edgeColour(md,box);}else if(box!==m)fitPhone(md);}else{const s=document.createElement('span');s.className='soon';s.textContent='COMING SOON';box.appendChild(s);}
      f.appendChild(m);if(it.cap&&!W.noCaps){const c=document.createElement('figcaption');c.textContent=it.cap;f.appendChild(c);}g.appendChild(f);});
    show(W.title,g,'',null,from);}
  function close(){if(!open)return;open=false;total=0;el.classList.remove('on');de.classList.remove('nv-lock');if(io){io.disconnect();io=null;}
    B.querySelectorAll('video').forEach(v=>v.pause());hideT=setTimeout(()=>{el.hidden=true;B.replaceChildren();},300);
    if(back&&back.isConnected&&back.focus)back.focus({preventScroll:true});}
  X.addEventListener('click',close);
  // Escape closes (before Cinematic Mode's own keys see it); Tab stays inside the viewer
  addEventListener('keydown',e=>{if(!open)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}
    else if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.altKey&&!e.metaKey){const f=[...B.querySelectorAll('.nv-slides figure')];if(!f.length)return;e.preventDefault();e.stopImmediatePropagation();
      const bar=el.querySelector('.nv-bar').offsetHeight,y=el.scrollTop+bar+14;let t=null;
      if(e.key==='ArrowRight')t=f.find(x=>x.offsetTop>y+40);else for(const x of f)if(x.offsetTop<y-40)t=x;
      if(t)el.scrollTo({top:t.offsetTop-bar-14,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
    else if(e.key==='Tab'){const f=[...el.querySelectorAll('button,a[href]:not([hidden])')];if(!f.length)return;const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}},true);
  return{slides,works,close,isOpen:()=>open};
})();


// ---------------- case-study player: one full-screen slide at a time, arrows in the bottom-right corner ----------------
const CS=(()=>{
  const chev=d=>`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const el=document.createElement('div');el.className='cs';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Case study');
  el.innerHTML='<div class="cs-stage"></div><div class="cs-prog" aria-hidden="true"><i></i></div>'
    +'<div class="cs-top"><span class="cs-t"></span><span class="cs-n" aria-live="polite"></span></div>'
    +'<button class="cs-x" type="button" aria-label="Close case study">×</button><p class="cs-rot">Turn your phone sideways for a bigger view</p>'
    +'<div class="cs-nav"><button class="cs-prev" type="button" aria-label="Previous slide">'+chev('M15 5l-7 7 7 7')+'</button><button class="cs-next" type="button" aria-label="Next slide">'+chev('M9 5l7 7-7 7')+'</button></div>';
  document.body.appendChild(el);
  const stage=el.querySelector('.cs-stage'),bar=el.querySelector('.cs-prog i'),T=el.querySelector('.cs-t'),N=el.querySelector('.cs-n'),
    X=el.querySelector('.cs-x'),prev=el.querySelector('.cs-prev'),next=el.querySelector('.cs-next');
  let p=null,i=0,open=false,back=null,hideT=0,cur=null;
  const src=k=>p.slides+'/'+p.files[k];
  const warm=k=>{if(k>=0&&k<p.files.length){const im=new Image();im.decoding='async';im.src=src(k);}};
  function slide(k){const f=document.createElement('figure');f.className='cs-s';
    const bg=document.createElement('img'),fg=document.createElement('img');bg.className='bg';bg.alt='';bg.setAttribute('aria-hidden','true');fg.className='fg';
    bg.src=fg.src=src(k);fg.alt=p.t+' case study, slide '+(k+1)+' of '+p.files.length;f.append(bg,fg);return f;}
  function go(k,dir){if(!p)return;k=Math.max(0,Math.min(p.files.length-1,k));if(cur&&k===i)return;
    const f=slide(k),old=cur;f.classList.add(dir<0?'from-l':'from-r');stage.appendChild(f);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{f.classList.remove('from-l','from-r');if(old){old.classList.add(dir<0?'out-r':'out-l');setTimeout(()=>old.remove(),600);}}));
    cur=f;i=k;const n=p.files.length;bar.style.width=((k+1)/n*100)+'%';N.textContent=(k+1)+' / '+n;
    prev.disabled=k===0;next.disabled=k===n-1;next.classList.toggle('hint',k===0);warm(k+1);warm(k+2);warm(k-1);}
  function show(idx,from){p=P[idx];if(!p)return;clearTimeout(hideT);back=from||document.activeElement;stage.replaceChildren();cur=null;i=0;
    T.textContent=p.t;el.hidden=false;de.classList.add('nv-lock');open=true;go(0,1);
    requestAnimationFrame(()=>el.classList.add('on'));setTimeout(()=>next.focus({preventScroll:true}),60);}
  function close(){if(!open)return;open=false;el.classList.remove('on');de.classList.remove('nv-lock');
    hideT=setTimeout(()=>{el.hidden=true;stage.replaceChildren();cur=null;},320);if(back&&back.isConnected&&back.focus)back.focus({preventScroll:true});}
  prev.addEventListener('click',()=>go(i-1,-1));next.addEventListener('click',()=>go(i+1,1));X.addEventListener('click',close);
  // swipe on touch screens
  let sx=null,sy=0;stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){sx=e.clientX;sy=e.clientY;}});
  stage.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go(i+(dx<0?1:-1),dx<0?1:-1);});
  // keys win over everything else on the page (and over Cinematic Mode's own keys) while open
  addEventListener('keydown',e=>{if(!open)return;const k=e.key;let h=true;
    if(k==='ArrowRight'||k==='PageDown'||k===' ')go(i+1,1);
    else if(k==='ArrowLeft'||k==='PageUp')go(i-1,-1);else if(k==='Home')go(0,-1);else if(k==='End')go(p.files.length-1,1);
    else if(k==='Escape')close();
    else if(k==='Tab'){const f=[...el.querySelectorAll('button:not(:disabled)')];const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}h=false;}
    else h=false;
    if(h){e.preventDefault();e.stopImmediatePropagation();}},true);
  return{open:show,close,isOpen:()=>open};
})();

// Cinematic Mode reuses the same data and viewer
window.PORTFOLIO={projects:P,works:WORKS,resume:RESUME,linkedin:LINKEDIN,email:EMAIL,
  openSlides:(i,from)=>CS.open(i,from),openWorks:(k,from)=>NV.works(k,from),viewerOpen:()=>NV.isOpen()||CS.isOpen()};

// inside the mode chooser's preview the page tours itself quickly, so load every image up front
if(de.classList.contains('np-preview'))document.querySelectorAll('img[loading="lazy"]').forEach(i=>{i.loading='eager';});

// ---------------- page wiring ----------------
document.querySelectorAll('[data-case]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();CS.open(+a.dataset.case,a);}));
document.querySelectorAll('[data-works]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();NV.works(a.dataset.works,a);}));
document.querySelectorAll('[data-3d]').forEach(b=>b.addEventListener('click',()=>{if(window.MODES)window.MODES.cinematic();else{location.hash='cinematic';location.reload();}}));
document.querySelectorAll('[data-modes]').forEach(b=>b.addEventListener('click',()=>{if(window.MODES)window.MODES.show();}));

// reveal sections as they scroll in; clips in the cards play only while on screen
const rv=[...document.querySelectorAll('.np-rv')];
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  rv.forEach(n=>io.observe(n));
  const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting&&!document.hidden){const p=v.play();if(p&&p.catch)p.catch(()=>{});}else v.pause();}),{threshold:.25});
  document.querySelectorAll('.np-card video').forEach(v=>vio.observe(v));
}else rv.forEach(n=>n.classList.add('in'));

// stats count up the first time they scroll into view
(function(){const vs=[...document.querySelectorAll('.np-stat .v[data-to]')];if(!vs.length||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const fmt=(v,el)=>(+el.dataset.dec?v.toFixed(+el.dataset.dec):Math.round(v))+(el.dataset.suf||'');
  vs.forEach(el=>{el.textContent=fmt(0,el);});
  const io=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;io.disconnect();const t0=performance.now(),D=1400;
    const f=now=>{const u=Math.min(1,(now-t0)/D),e=1-Math.pow(1-u,3);vs.forEach(el=>{el.textContent=fmt(e*(+el.dataset.to),el);});if(u<1)requestAnimationFrame(f);};requestAnimationFrame(f);},{threshold:.4});
  io.observe(vs[0].closest('.np-glance'));})();

// thumbnails: three screens trade places like a carousel. Every few seconds the left one sweeps round behind the
// centre to the far right (picking up a new screen on the way, if there are more), and the others slide over.
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
function carousel(box){const ph=[...box.querySelectorAll(':scope>.np-ph')];if(ph.length!==3)return;
  if(box.classList.contains('fit'))return;   // Other work cards: the three screens only drift (CSS), they don't trade places
  const fit=box.classList.contains('fit'),list=box.dataset.screens?box.dataset.screens.split(','):null;
  const SPOT=fit?[[-162,6,-5,.9],[-50,0,0,1],[62,6,5,.9]]:[[-165,15,-4,.92],[-50,7,0,1],[65,15,4,.92]],BEHIND=fit?[-50,14,0,.7]:[-50,24,0,.72];
  const tf=([x,y,r,s])=>`translate(${x}%,${y}%) rotate(${r}deg) scale(${s})`;
  const at=[0,1,2];let nextImg=3,t=0,vis=false,busy=false;
  ph.forEach((p,i)=>{p.style.transform=tf(SPOT[i]);p.style.zIndex=i===1?3:1;});
  if(REDUCED||!ph[0].animate)return;
  const swap=(p)=>{if(!list||list.length<=3)return;const slot=p.querySelector('.np-slot');if(!slot)return;const cur=slot.querySelector('img.on'),im=new Image();im.alt='';im.decoding='async';im.src=list[nextImg%list.length];nextImg++;
    (im.decode?im.decode().catch(()=>{}):Promise.resolve()).then(()=>{slot.appendChild(im);fitPhone(im);requestAnimationFrame(()=>requestAnimationFrame(()=>{im.classList.add('on');if(cur)cur.classList.remove('on');}));setTimeout(()=>{if(cur&&cur.parentNode)cur.remove();},1800);});};
  const step=()=>{if(busy)return;busy=true;let left=3;
    ph.forEach((p,i)=>{const from=at[i],to=(from+2)%3,wrap=from===0;
      p.style.zIndex=wrap?0:to===1?3:2;
      const kf=wrap?[{transform:tf(SPOT[0])},{transform:tf(BEHIND),offset:.5},{transform:tf(SPOT[2])}]:[{transform:tf(SPOT[from])},{transform:tf(SPOT[to])}];
      const an=p.animate(kf,{duration:wrap?1500:1250,easing:'cubic-bezier(.65,0,.3,1)',fill:'forwards'});
      if(wrap)setTimeout(()=>swap(p),520);
      an.onfinish=()=>{p.style.transform=tf(SPOT[to]);an.cancel();p.style.zIndex=to===1?3:1;at[i]=to;if(--left===0)busy=false;};});};
  const run=on=>{clearInterval(t);t=0;if(on&&!document.hidden)t=setInterval(step,3400);};
  if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(e=>{vis=e.isIntersecting;run(vis);}),{threshold:.3}).observe(box);
  document.addEventListener('visibilitychange',()=>run(vis));}
document.querySelectorAll('.np-ph.bare img,.np-ph.bare video').forEach(fitPhone);
document.querySelectorAll('.np-show').forEach(carousel);


// ---------------- the explorer from Immersive 3D Mode, living on top of the 3D button ----------------
// img/explorer-sprites.webp: 21 frames (286×390 each, eye-level camera; the walk is drawn side-on) rendered from the 3D world's own character and lights.
// On arrival he peeks out from behind the button, jumps up onto it, waves and hops; after that he walks, hops,
// shadow-boxes, waves, looks around, points and sits on the edge. Hovering the button makes him cheer.
(function(){
  const fab=document.querySelector('.np-fab'),cv=fab&&fab.querySelector('.np-me');if(!cv||de.classList.contains('np-preview'))return;
  const NAMES=['stand','walk0','walk1','walk2','walk3','walk4','walk5','walk6','walk7','jump','wave1','wave2','point','sit','lookL','lookR','turn','guard','punchR','punchL','kick'];
  const FW=286,FH=390,FEET=363,HIP=294,SC=.5,CW=FW*SC,CH=FH*SC,dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr);cv.style.width=CW+'px';cv.style.height=CH+'px';cv.style.bottom=`calc(100% - ${((FH-FEET)*SC+2).toFixed(1)}px)`;
  const g=cv.getContext('2d'),sheet=new Image();sheet.decoding='async';sheet.src='img/explorer-sprites.webp';
  const HOME=-1;   // when he isn't walking he faces into the page (left), not off the edge of the screen
  const st={cx:0,y:0,rot:0,face:HOME,frame:'stand',sit:0,squash:1,behind:0};
  const minC=()=>30,maxC=()=>Math.max(minC(),fab.clientWidth-30);
  function render(){if(sheet.complete&&sheet.naturalWidth){g.clearRect(0,0,cv.width,cv.height);g.drawImage(sheet,NAMES.indexOf(st.frame)*FW,0,FW,FH,0,0,cv.width,cv.height);}
    const ty=(st.sit?(FEET-HIP)*SC:0)-st.y;
    // while he's behind the button, hide everything below its top edge
    const clip=st.behind?`inset(0 0 ${Math.max(0,CH-(FEET*SC-ty)).toFixed(1)}px 0)`:'none';cv.style.clipPath=clip;cv.style.webkitClipPath=clip;
    cv.style.transformOrigin=st.rot?'50% 55%':`50% ${(FEET/FH*100).toFixed(1)}%`;   // flips spin round the middle; squashes press into the feet
    cv.style.transform=`translate(${(st.cx-CW/2).toFixed(1)}px,${ty.toFixed(1)}px) rotate(${st.rot.toFixed(1)}deg) scale(${st.face},${st.squash})`;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  st.cx=fab.clientWidth*.62||90;if(!reduced){st.behind=1;st.y=-CH;}
  sheet.addEventListener('load',render);render();
  if(reduced)return;
  const live=()=>!document.hidden&&!de.classList.contains('ms-on')&&!de.classList.contains('imm-on')&&!de.classList.contains('nv-lock');
  // run fn(u,t) each frame for ms of visible time (the clock stops while the button is hidden)
  const run=(ms,fn)=>new Promise(res=>{let t=0,last=performance.now();const f=now=>{const dt=Math.min(50,now-last);last=now;if(!live()){requestAnimationFrame(f);return;}
    t+=dt;const u=Math.min(1,t/ms);if(fn)fn(u,t);render();if(u>=1)res();else requestAnimationFrame(f);};requestAnimationFrame(f);});
  const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const rest=()=>{st.frame='stand';st.y=0;st.rot=0;st.squash=1;};
  const idle=ms=>run(ms,()=>{st.frame='stand';});
  async function walkTo(c){c=Math.max(minC(),Math.min(maxC(),c));const c0=st.cx,d=Math.abs(c-c0);if(d<6)return;st.face=c>c0?1:-1;
    await run(90,()=>{st.frame='turn';});
    await run(d/70*1000,(u,t)=>{st.cx=c0+(c-c0)*u;st.frame='walk'+(Math.floor(t/95)%8);});
    await run(90,()=>{st.frame='turn';});rest();st.face=HOME;}
  async function hop(h,flip){await run(110,()=>{st.squash=.9;});st.squash=1;st.frame='jump';const f=st.face;
    await run(flip?660:420,u=>{st.y=4*h*u*(1-u);st.rot=flip?360*u*f:0;});rest();await run(120,()=>{st.squash=.92;});st.squash=1;}
  async function wave(ms){st.face=HOME;await run(ms||1800,(u,t)=>{st.frame=Math.floor(t/240)%2?'wave2':'wave1';});rest();}
  async function look(){await run(700,()=>{st.frame='lookL';});await run(250,()=>{st.frame='stand';});await run(700,()=>{st.frame='lookR';});rest();}
  async function point(){st.face=HOME;await run(1400,()=>{st.frame='point';});rest();}
  async function sit(){await walkTo(minC());const c0=st.cx,cs=2;st.face=HOME;await run(240,u=>{st.cx=c0+(cs-c0)*u;st.frame='jump';st.y=50*u*(1-u);});st.y=0;st.sit=1;
    await run(3400,(u,t)=>{st.frame='sit';st.y=Math.sin(t/420)*1.4;});st.sit=0;rest();await hop(18,false);st.cx=Math.max(st.cx,minC());}
  // shadow boxing: guard, jab, cross, jab, kick, with a little bounce and a step on every hit
  async function fight(){st.face=HOME;const c0=st.cx,f=st.face;
    const beat=(frame,ms,step)=>run(ms,(u,t)=>{st.frame=frame;st.y=Math.abs(Math.sin(t/95))*3;st.cx=c0+f*(step||0)*Math.sin(Math.PI*u);});
    await beat('guard',420);await beat('punchR',150,8);await beat('guard',130);await beat('punchL',150,8);await beat('guard',130);await beat('punchR',150,10);
    await beat('guard',260);await beat('kick',380,6);await beat('guard',320);st.cx=c0;rest();}
  // arrival: peek from behind the button, look around, duck, then jump up onto it
  async function arrive(){const peekY=-(FEET-128)*SC;   // eyes just above the edge
    await run(1700,()=>{});
    await run(650,u=>{st.frame='stand';st.y=-CH+(CH+peekY)*ease(u);});
    await run(700,()=>{st.frame='lookL';});await run(700,()=>{st.frame='lookR';});
    await run(160,u=>{st.frame='stand';st.y=peekY-18*u;});await run(260,u=>{st.y=peekY-18+18*ease(u);});await idle(350);
    await run(150,u=>{st.y=peekY-22*u;});
    st.frame='jump';const y0=st.y;await run(520,u=>{st.y=y0+(0-y0)*u+70*Math.sin(Math.PI*u);if(st.y>4)st.behind=0;});
    st.behind=0;rest();await run(140,()=>{st.squash=.88;});st.squash=1;
    await wave(1600);await hop(26,false);await hop(18,false);}
  let cheer=false;fab.addEventListener('pointerenter',()=>{cheer=true;});
  (async function life(){await arrive();await idle(700);await fight();await idle(900);
    for(;;){if(cheer){cheer=false;await hop(30,false);await hop(30,false);await wave();continue;}
      const r=Math.random();
      if(r<.20)await walkTo(minC()+Math.random()*(maxC()-minC()));
      else if(r<.32){await hop(24,false);await hop(16,false);}
      else if(r<.42){await hop(38,false);}
      else if(r<.56)await fight();
      else if(r<.66)await wave();
      else if(r<.76)await sit();
      else if(r<.88)await look();
      else await point();
      await idle(900+Math.random()*1500);}})();
})();

// header height feeds the first-screen layout (photo + intro centred above the fold, stats half visible)
(function(){const h=document.querySelector('.np-head');if(!h)return;const set=()=>de.style.setProperty('--head-h',h.offsetHeight+'px');set();addEventListener('resize',set);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(set);})();

// the mode screen starts this page when Normal Mode is chosen
window.NORMAL={start(){const m=document.getElementById('np-main');if(m&&!de.classList.contains('np-preview'))setTimeout(()=>m.focus({preventScroll:true}),60);},stop(){}};
if(window.__modeGate)window.__modeGate.attach(window.NORMAL);else window.NORMAL.start();
})();
