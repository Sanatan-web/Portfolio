/* =====================================================================
   Mode selection — runs before the side-view world starts.
   Normal Mode   → the simple scrollable portfolio page (normal/normal.js registers window.NORMAL).
   Cinematic Mode→ loads three.js + immersive/*.js on demand and hands over to window.IMM.
   (#immersive links still work and open Cinematic Mode.)
   Deep links: #normal, #immersive, #immersive/<station id>, #cinematic, #cinematic/<station id>
   ===================================================================== */
(function(){'use strict';
const de=document.documentElement;
const BASE=((document.currentScript&&document.currentScript.src)||'immersive/modes.js').replace(/modes\.js(\?.*)?$/,'');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const V='20261122a';   // bump this after changing any immersive/ file so browsers fetch the new copy
const THREE_URL='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const PREVIEW=/[?&]preview=1/.test(location.search);
if(PREVIEW){de.classList.remove('ms-wait');window.__normalIdle=false;return;}

// The Normal Mode page registers itself with this gate (see normal/normal.js).
window.__normalIdle=true;
const gate={normal:null,want:false,attach(n){this.normal=n;if(this.want)n.start();}};
window.__modeGate=gate;

let state='select',loader=null,raf=0,sel=-1,hideT=0;

// ---------- markup ----------
const ms=document.createElement('div');ms.id='ms';ms.tabIndex=-1;ms.setAttribute('role','dialog');ms.setAttribute('aria-modal','true');ms.setAttribute('aria-labelledby','msTitle');
ms.innerHTML=`<canvas class="ms-bg" aria-hidden="true"></canvas>
<div class="ms-inner">
  <div class="ms-eyebrow">NISHANT J. DIXIT · PRODUCT DESIGNER</div>
  <h1 id="msTitle">How would you like to explore my portfolio?</h1>
  <div class="ms-zl" aria-live="polite"><i></i><span>Building the world…</span></div>
  <div class="ms-cards">
    <article class="ms-card" data-mode="normal">
      <div class="ms-prev ms-phones" aria-hidden="true"><div class="mp mp1"><div class="in"><img class="scr" src="${BASE}../img/screens/peakmind-3.webp?v=2" alt="" decoding="async"><img class="fr" src="${BASE}../img/phone-frame.webp?v=${V}" alt="" decoding="async"></div></div><div class="mp mp2"><div class="in"><img class="scr" src="${BASE}../img/screens/arivihan-1.webp" alt="" decoding="async"><img class="fr" src="${BASE}../img/phone-frame.webp?v=${V}" alt="" decoding="async"></div></div><div class="mp mp3"><div class="in"><img class="scr" src="${BASE}../img/screens/edme-2.webp" alt="" decoding="async"><img class="fr" src="${BASE}../img/phone-frame.webp?v=${V}" alt="" decoding="async"></div></div></div>
      <div class="ms-title"><h2>Normal Mode</h2></div>
      <button class="ms-go" type="button" data-mode="normal">View portfolio <span class="ar" aria-hidden="true">→</span></button>
    </article>
    <article class="ms-card" data-mode="cinematic">
      <div class="ms-prev ms-dio" aria-hidden="true"><canvas></canvas></div>
      <div class="ms-title"><h2>Immersive 3D Mode</h2></div>
      <button class="ms-go" type="button" data-mode="cinematic">Experience the portfolio <span class="ar" aria-hidden="true">→</span></button>
      <div class="ms-load" aria-live="polite"><i></i><span>Lighting the set…</span></div>
      <div class="ms-err" role="alert"></div>
    </article>
  </div>
</div>`;
document.body.appendChild(ms);de.classList.remove('ms-wait');
const cards=[...ms.querySelectorAll('.ms-card')],btns=[...ms.querySelectorAll('.ms-go')],bg=ms.querySelector('.ms-bg');
const dio=ms.querySelector('.ms-dio canvas');
const MODES=['normal','cinematic'];let immCard=cards[1],errEl=immCard.querySelector('.ms-err');

function select(i,focus){sel=i;cards.forEach((c,k)=>c.classList.toggle('sel',k===i));if(focus)btns[i].focus({preventScroll:true});}
cards.forEach((c,i)=>{c.addEventListener('click',()=>choose(c.dataset.mode));c.addEventListener('pointerenter',()=>{sel=i;});c.addEventListener('pointerleave',()=>{if(sel===i&&!c.classList.contains('sel'))sel=-1;});});
btns.forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();choose(b.dataset.mode);}));
window.addEventListener('keydown',e=>{if(state!=='select'||ms.hidden)return;
  if(e.key==='1'||e.key==='2'){e.preventDefault();choose(MODES[+e.key-1]);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();select(Math.max(0,sel-1),true);}
  else if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();select(Math.min(MODES.length-1,sel+1),true);}
  else if(e.key==='Enter'&&sel>=0&&!btns.includes(document.activeElement)){e.preventDefault();choose(MODES[sel]);}},true);

// ---------- choosing ----------
let busy=false,zoomP=Promise.resolve();
// on choosing: zoom into that option's picture (everything else fades), then open the mode
function zoomInto(ci){const card=cards[ci],pv=card.querySelector('.ms-prev');if(reduce||!pv)return Promise.resolve();
  const r=pv.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,s=Math.max(vw/r.width,vh/r.height)*1.08,dx=vw/2-(r.left+r.width/2),dy=vh/2-(r.top+r.height/2);
  ms.classList.add('zooming');card.classList.add('zoomed');
  pv.style.transition='transform 1s cubic-bezier(.6,0,.2,1)';pv.style.transformOrigin='50% 50%';void pv.offsetWidth;
  pv.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${s.toFixed(3)})`;
  return new Promise(res=>setTimeout(res,1000));}
function unzoom(){ms.classList.remove('zooming','waiting');cards.forEach(c=>{c.classList.remove('zoomed');const pv=c.querySelector('.ms-prev');if(pv){pv.style.transition='none';pv.style.transform='';pv.style.transformOrigin='';}});}
function choose(mode){if(busy||state!=='select')return;busy=true;
  if(mode==='normal'){select(0);zoomP=zoomInto(0);zoomP.then(()=>{busy=false;startNormal();});}
  else{select(1);zoomP=zoomInto(1);startImmersive(null,true);}}
function startNormal(){
  state='normal';window.__normalIdle=false;
  if(window.IMM&&window.IMM.leave)window.IMM.leave();
  de.classList.remove('imm-on');
  hide();
  if(gate.normal)gate.normal.start();else gate.want=true;
}
function startImmersive(station){const ci=1,cine=true;immCard=cards[ci];errEl=immCard.querySelector('.ms-err');
  busy=true;select(ci);immCard.classList.remove('err');immCard.classList.add('loading');
  zoomP.then(()=>{if(busy)ms.classList.add('waiting');});
  load().then(()=>zoomP).then(()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,40)))).then(()=>{
    de.classList.add('imm-on');window.__normalIdle=true;
    return window.IMM.enter({station,cinematic:!!cine,onNormal:startNormal,onModes:show});
  }).then(()=>{state='immersive';busy=false;immCard.classList.remove('loading');hide();})
    .catch(e=>{console.error(e);busy=false;de.classList.remove('imm-on');fail(window.THREE?'Immersive 3D Mode could not start on this device. Normal Mode works everywhere.':'The 3D engine could not load. Check your connection and try again.');});
}
function fail(msg){unzoom();immCard.classList.remove('loading');immCard.classList.add('err');errEl.textContent=msg;}
function load(){
  if(loader)return loader;
  const css=new Promise(res=>{const l=document.createElement('link');l.rel='stylesheet';l.href=BASE+'immersive.css?v='+V;l.onload=l.onerror=res;document.head.appendChild(l);});
  const add=src=>new Promise((res,rej)=>{if(src===THREE_URL&&window.THREE)return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src));document.body.appendChild(s);});
  const js=[THREE_URL,...['content.js','engine.js','world.js'].map(f=>BASE+f+'?v='+V)].reduce((p,f)=>p.then(()=>add(f)),Promise.resolve());
  loader=Promise.all([css,js]).catch(e=>{loader=null;throw e;});
  return loader;
}

// ---------- show / hide ----------
function show(){clearTimeout(hideT);state='select';busy=false;unzoom();ms.hidden=false;de.classList.add('ms-on');ms.classList.remove('out');cards.forEach(c=>c.classList.remove('loading'));select(-1);
  if(!raf)raf=requestAnimationFrame(tick);setTimeout(()=>{if(sel>=0)btns[sel].focus({preventScroll:true});else ms.focus({preventScroll:true});},30);}
function hide(){ms.classList.add('out');de.classList.remove('ms-on');clearTimeout(hideT);hideT=setTimeout(()=>{ms.hidden=true;cancelAnimationFrame(raf);raf=0;},600);}

// ---------- vaporwave grid room behind the chooser (dark) ----------
// A box-shaped room (floor, ceiling, two walls, back wall) drawn in neon lines that recede to the centre, with a
// magenta glow at the far end. The grid drifts slowly toward you; the vanishing point leans with the pointer.
let gw=0,gh=0,gdpr=1,vx=0,vy=0,tvx=0,tvy=0;
function sizeBg(){gdpr=Math.min(2,window.devicePixelRatio||1);gw=innerWidth;gh=innerHeight;bg.width=Math.round(gw*gdpr);bg.height=Math.round(gh*gdpr);}
addEventListener('pointermove',e=>{tvx=e.clientX/innerWidth-.5;tvy=e.clientY/innerHeight-.5;},{passive:true});
function drawBg(t){const g=bg.getContext('2d');g.setTransform(gdpr,0,0,gdpr,0,0);
  vx+=(tvx-vx)*.06;vy+=(tvy-vy)*.06;
  const cx=gw/2-vx*gw*.05,cy=gh/2-vy*gh*.05,F=gw/2,W=1,H=gh/gw,Z0=.86,D=2.9,S=1/6;
  const P=(x,y,z)=>[cx+x/z*F,cy-y/z*F];
  g.fillStyle='#0a0718';g.fillRect(0,0,gw,gh);
  const back=P(W,H,D),bw2=back[0]-cx,bh2=cy-back[1];
  let gr=g.createRadialGradient(cx,cy,0,cx,cy,Math.max(bw2,bh2)*2.8);gr.addColorStop(0,'rgba(255,70,200,.38)');gr.addColorStop(.42,'rgba(120,70,255,.17)');gr.addColorStop(1,'rgba(10,7,24,0)');g.fillStyle=gr;g.fillRect(0,0,gw,gh);
  gr=g.createRadialGradient(cx,cy+bh2,0,cx,cy+bh2,bw2*2.4);gr.addColorStop(0,'rgba(60,220,255,.2)');gr.addColorStop(1,'rgba(60,220,255,0)');g.fillStyle=gr;g.fillRect(0,0,gw,gh);
  const A=z=>.05+.6*Math.pow(Math.max(0,1-(z-Z0)/(D-Z0)),1.25),C={top:'255,79,216',bot:'77,225,255',side:'164,112,255'},col=(k,a)=>`rgba(${C[k]},${a.toFixed(3)})`;
  g.lineWidth=1;
  g.strokeStyle=col('side',A(D)*.9);g.beginPath();
  for(let x=-W;x<=W+1e-6;x+=S){const a=P(x,-H,D),b=P(x,H,D);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);}
  for(let y=-H;y<=H+1e-6;y+=S){const a=P(-W,y,D),b=P(W,y,D);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);}
  g.stroke();
  const run=(x,y,k)=>{const a=P(x,y,Z0),b=P(x,y,D),l=g.createLinearGradient(a[0],a[1],b[0],b[1]);l.addColorStop(0,col(k,A(Z0)));l.addColorStop(1,col(k,A(D)));g.strokeStyle=l;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();};
  for(let x=-W;x<=W+1e-6;x+=S){run(x,-H,'bot');run(x,H,'top');}
  for(let y=-H+S;y<H-1e-6;y+=S){run(-W,y,'side');run(W,y,'side');}
  const off=reduce?0:(t*.11)%S,seg=(p,q,k,a)=>{g.strokeStyle=col(k,a);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();};
  for(let z=D-S+((S-off)%S);z>Z0-1e-6;z-=S){if(z>D-1e-6)continue;const a=P(-W,H,z),b=P(W,H,z),c=P(W,-H,z),d=P(-W,-H,z),al=A(z);
    seg(a,b,'top',al);seg(b,c,'side',al);seg(c,d,'bot',al);seg(d,a,'side',al);}
}

// ---------- Immersive 3D Mode: an animated isometric model of the real 3D world ----------
// The route as it is in Immersive 3D Mode: Arivihan (gate, school, screen tower), Peakmind (gate, stream + bridge, trees,
// screen tower), EDME (gate, glass office, screen tower), then the trestle over the canyon to the far island
// (Other Works room, Let's Connect campfire), with the lava mountain behind. The towers cycle through real app
// screens, the explorer walks the path, the cart rides the trestle.
const IMG=src=>{const i=new Image();i.decoding='async';i.src=src;return i;};
const SCRN={ariv:[1,2,3,4].map(i=>'arivihan-'+i),pm:[1,2,3,4].map(i=>'peakmind-'+i),edme:[1,2,3,4].map(i=>'edme-'+i)};
let SCRI=null,EXP=null;const loadDio=()=>{if(SCRI)return;SCRI={};for(const k in SCRN)SCRI[k]=SCRN[k].map(n=>IMG(BASE+'../img/screens/'+n+'.webp?v='+V));EXP=IMG(BASE+'../img/explorer-sprites.webp?v='+V);};
function fitCanvas(c){const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return false;const d=Math.min(2,window.devicePixelRatio||1);
  if(c._w!==w||c._h!==h||c._d!==d){c._w=w;c._h=h;c._d=d;c.width=Math.round(w*d);c.height=Math.round(h*d);c._static=null;}return true;}
const easeIO=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const iso=(u,ox,oy)=>(x,y,z)=>[ox+(x-y)*u*.866,oy+(x+y)*u*.5-z*u];
function shade(hex,k){const n=parseInt(hex.slice(1),16),f=v=>Math.min(255,Math.round(v*k));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`;}
function quad(g,p,fill){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=.6;g.stroke();}
const FACE={left:(P,b)=>{const{x,y,z,dx,dy,dz}=b;return[P(x,y+dy,z+dz),P(x+dx,y+dy,z+dz),P(x+dx,y+dy,z),P(x,y+dy,z)];},
  right:(P,b)=>{const{x,y,z,dx,dy,dz}=b;return[P(x+dx,y+dy,z+dz),P(x+dx,y,z+dz),P(x+dx,y,z),P(x+dx,y+dy,z)];}};
function drawBox(g,P,b,glow){const{x,y,z,dx,dy,dz}=b,X=x+dx,Y=y+dy,Z=z+dz,j=glow||b.j||1,lerp=(p,q,f)=>[p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f];
  const top=[P(x,y,Z),P(X,y,Z),P(X,Y,Z),P(x,Y,Z)],left=[P(x,Y,Z),P(X,Y,Z),P(X,Y,z),P(x,Y,z)],right=[P(X,y,Z),P(X,Y,Z),P(X,Y,z),P(X,y,z)];
  const side=b.k==='grass'?'#86593a':b.c;quad(g,left,shade(side,.74*j));quad(g,right,shade(side,.58*j));
  if(b.k==='grass'){for(const[f,k]of[[left,.74],[right,.58]])quad(g,[f[0],f[1],lerp(f[1],f[2],.3),lerp(f[0],f[3],.3)],shade(b.c,k*j));}
  quad(g,top,shade(b.c,j));}
// draw an image or text flat onto a face (four corners: top-left, top-right, bottom-right, bottom-left as seen)
function onFace(g,f,w,h,draw){const[o,a,,c]=f;g.save();g.transform((a[0]-o[0])/w,(a[1]-o[1])/w,(c[0]-o[0])/h,(c[1]-o[1])/h,o[0],o[1]);draw(g);g.restore();}
const DIO=(()=>{const B=[],box=(x,y,z,dx,dy,dz,c,k)=>{const b={x,y,z,dx,dy,dz,c,k};B.push(b);return b;},cube=(x,y,z,c,k)=>box(x,y,z,1,1,1,c,k);
  const hs=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);};
  // the land the three stations stand on; the stream crosses at x=6 under a plank bridge
  for(let x=0;x<13;x++)for(let y=0;y<5;y++){if(x===6&&y!==2)cube(x,y,-1.25,'#4aa8c9','water');else cube(x,y,-1,y===2?(x===6?'#8a5a32':'#c9a46a'):'#6cb04a',y===2&&x!==6?'grass':x===6?'':'grass');cube(x,y,-2,'#86593a');}
  for(let x=1;x<12;x++)for(let y=1;y<4;y++)cube(x,y,-3,'#7a5034');for(let x=3;x<10;x++)cube(x,2,-4,'#6e472e');
  // gates are tall enough that the explorer (about 2 blocks) passes well under the name board
  const gate=(x,ac,name)=>{box(x,1.05,0,.3,.3,3.1,'#6b4423');box(x,3.65,0,.3,.3,3.1,'#6b4423','occ');const b=box(x-.05,.9,2.9,.4,3.2,.6,'#4e2a10','occ');b.sign={name,ac};box(x-.06,.88,3.5,.42,3.24,.08,ac,'occ');};
  const tower=(x,key,ac)=>{const b=box(x,4.05,0,.8,.8,2.3,'#1b1e26','tower');b.scr=key;box(x-.07,3.98,2.3,.94,.94,.12,'#2b2f38','occ');box(x-.1,3.95,-.02,1,1,.1,ac,'occ');};
  // 01 Arivihan: school with a clay roof and bell tower
  gate(1.4,'#19b3a1','ARIVIHAN');
  const sch=box(2.2,0,0,2.7,1.3,1.5,'#efe6d2');sch.win='#7fc6ec';box(2.05,-.1,1.5,3,1.5,.32,'#b4432c');box(3.25,.3,1.82,.6,.6,.7,'#efe6d2');box(3.17,.22,2.52,.76,.76,.2,'#b4432c');
  tower(3.5,'ariv','#19b3a1');
  // 02 Peakmind: trees on the far bank, a meditation mat
  gate(5.4,'#5fb36a','PEAKMIND');
  const tree=(x,y,c1,c2)=>{box(x+.35,y+.35,0,.3,.3,1,'#6b4423');box(x,y,1,1,1,.9,c1);box(x+.2,y+.2,1.9,.6,.6,.4,c2);};
  tree(7,.1,'#f2a7c3','#f7c4d8');tree(8.4,.4,'#3f8f2e','#4c9d36');box(7.3,1.25,0,1,.6,.06,'#b07cff');
  tower(7.8,'pm','#5fb36a');
  // 03 EDME: glass office
  gate(9.6,'#f0a01c','EDME');
  const off=box(10.2,0,0,2.5,1.4,2.2,'#d9dbe0');off.glass='#9fc6e6';box(10.1,-.1,2.2,2.7,1.6,.15,'#3b3f48');box(10.2,1.38,1.05,2.5,.04,.12,'#f0a01c');
  tower(11.8,'edme','#f0a01c');
  // the canyon: trestle out to the far island; the lava mountain floats behind
  for(let x=13;x<19;x++)box(x,2,-.2,1,1,.2,'#8a5a32');
  for(const x of[13.35,15.35,17.35])for(const y of[2.1,2.6])box(x,y,-6,.3,.3,5.8,'#6b4423','post');
  for(let x=14;x<18;x++)for(let y=-5;y<-2;y++)cube(x,y,-1,'#8b8780');
  [[14,-5,2],[15,-5,4],[16,-5,3],[15,-4,3],[16,-4,2],[14,-4,1],[17,-4,1],[15,-3,1]].forEach(([x,y,n])=>{for(let z=0;z<n;z++)cube(x,y,z,'#8b8780');});
  [[15,-5,4],[15,-4,3],[16,-4,2]].forEach(([x,y,z])=>cube(x,y,z,'#ff6a1a','lava'));
  for(let x=19;x<22;x++)for(let y=1;y<4;y++){cube(x,y,-1,'#6cb04a','grass');cube(x,y,-2,'#86593a');}cube(20,2,-3,'#7a5034');
  const room=box(19.2,1.05,0,1.5,1.2,1.25,'#2a2233');room.win='#c79bff';box(19.1,.95,1.25,1.7,1.4,.2,'#b07cff');
  box(20.85,2.85,0,.5,.12,.12,'#5a3a1e');box(21,2.75,0,.12,.5,.12,'#5a3a1e');
  B.forEach(b=>{b.o=(b.x+b.dx/2)+(b.y+b.dy/2);b.j=.93+hs(b.x,b.y+b.z*3)*.12;});B.sort((a,b)=>a.o-b.o||a.z-b.z);return B;})();
const drawSign=(g,P,b)=>onFace(g,FACE.right(P,b),320,60,x=>{x.fillStyle='#fbeccb';x.font='800 36px Rubik,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(b.sign.name,160,32);});
// the whole world is drawn once, large; each frame the camera follows the explorer, then the cart
function buildDio(c){const W=c._w,d=c._d,u=W/12.5,P1=iso(1,0,0);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const b of DIO){if(b.k==='post')continue;for(const X of[b.x,b.x+b.dx])for(const Y of[b.y,b.y+b.dy])for(const Z of[b.z,b.z+b.dz]){const[p,q]=P1(X,Y,Z);x0=Math.min(x0,p);x1=Math.max(x1,p);y0=Math.min(y0,q);y1=Math.max(y1,q);}}
  const pad=u*1.5,OW=Math.ceil((x1-x0)*u+pad*2),OH=Math.ceil((y1-y0)*u+pad*2+u*4),Ox=-x0*u+pad,Oy=-y0*u+pad;
  const o=document.createElement('canvas');o.width=Math.round(OW*d);o.height=Math.round(OH*d);const g=o.getContext('2d');g.setTransform(d,0,0,d,0,0);const P=iso(u,Ox,Oy);
  for(const b of DIO){drawBox(g,P,b);
    if(b.sign)drawSign(g,P,b);
    if(b.win)onFace(g,FACE.left(P,b),100,50,x=>{x.fillStyle=b.win;for(let i=0;i<4;i++)x.fillRect(10+i*23,14,14,18);});
    if(b.glass)onFace(g,FACE.left(P,b),100,90,x=>{x.fillStyle=b.glass;for(let r=0;r<3;r++)for(let i=0;i<5;i++)x.fillRect(6+i*19.5,8+r*27,15,20);});}
  g.lineCap='round';g.strokeStyle='#6b4423';g.lineWidth=Math.max(1.2,u*.07);for(let x=12.6;x<19.4;x+=.5){const a=P(x,2.1,0),b=P(x,2.9,0);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  g.strokeStyle='#3a3f48';g.lineWidth=Math.max(1,u*.05);for(const y of[2.28,2.72]){const a=P(12.4,y,0),b=P(19.5,y,0);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  c._static={o,u,Ox,Oy,OW,OH};}
// one loop (22s): walk Arivihan → Peakmind → EDME with a pause at each tower, board the cart, ride to the far island
const TOUR=(()=>{const walk=[[.6,3.9],[3.9,8.1],[8.1,12.3]],SP=1.05,PAUSE=1,seq=[];let t=0;
  for(const[a,b]of walk){const d=(b-a)/SP;seq.push({t0:t,t1:t+d,a,b,k:'walk'});t+=d;seq.push({t0:t,t1:t+PAUSE,a:b,b,k:'pause'});t+=PAUSE;}
  seq.push({t0:t,t1:t+.6,a:12.3,b:12.8,k:'board'});t+=.6;seq.push({t0:t,t1:t+4.6,a:12.8,b:19.2,k:'cart'});t+=4.6;seq.push({t0:t,t1:t+1.8,a:19.2,b:19.2,k:'hold'});t+=1.8;
  return{seq,len:t+.6};})();
function tourAt(t){const L=TOUR.len,tt=((t%L)+L)%L;let s=TOUR.seq[TOUR.seq.length-1];for(const q of TOUR.seq)if(tt>=q.t0&&tt<q.t1){s=q;break;}
  const f=Math.min(1,Math.max(0,(tt-s.t0)/(s.t1-s.t0))),x=s.a+(s.b-s.a)*(s.k==='walk'||s.k==='cart'?easeIO(f):f);
  const fade=tt<.4?tt/.4:tt>L-.6?Math.max(0,(L-tt)/.6):1;return{k:s.k,x,f,fade};}
function drawDio(c,t){if(!c||!fitCanvas(c))return;loadDio();if(!c._static)buildDio(c);const g=c.getContext('2d'),W=c._w,H=c._h,{o,u,Ox,Oy,OW,OH}=c._static,m=reduce?0:1;
  const tt=m?t:5.2,st=tourAt(tt),riding=st.k==='cart'||st.k==='hold'||(st.k==='board'&&st.f>.5);
  g.setTransform(c._d,0,0,c._d,0,0);g.clearRect(0,0,W,H);g.globalAlpha=st.fade;
  // camera: keep the focus (explorer or cart) at the same spot in the frame
  const P1=iso(u,0,0),fp=P1(st.x,2.5,0),ox=W*.47-fp[0],oy=H*.6-fp[1]+Math.sin(tt*.8)*u*.06,P=iso(u,ox,oy);
  g.drawImage(o,ox-Ox,oy-Oy,OW,OH);
  let gr;const pulse=.85+.15*Math.sin(tt*3),lp=P(15.6,-4.4,4.4);g.globalCompositeOperation='lighter';gr=g.createRadialGradient(lp[0],lp[1],0,lp[0],lp[1],u*2.4);gr.addColorStop(0,`rgba(255,120,40,${(.45*pulse*st.fade).toFixed(2)})`);gr.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=gr;g.fillRect(lp[0]-u*3,lp[1]-u*3,u*6,u*6);g.globalCompositeOperation='source-over';
  if(m)for(let i=0;i<8;i++){const ph=(t*.4+i/8)%1,p=P(15.5+Math.sin(i*7.1+t*.8)*.35,-4.5+Math.cos(i*3.3)*.3,5+ph*3);g.globalAlpha=(1-ph)*.9*st.fade;g.fillStyle=i%2?'#ffb347':'#ff7a2a';const s=Math.max(1.4,u*.07)*(1-ph*.5);g.fillRect(p[0]-s/2,p[1]-s/2,s,s);}g.globalAlpha=st.fade;
  const fpp=P(21.1,3.05,.1),fl=.8+.2*Math.sin(t*11)*Math.sin(t*7.3);g.globalCompositeOperation='lighter';gr=g.createRadialGradient(fpp[0],fpp[1],0,fpp[0],fpp[1],u*1.3);gr.addColorStop(0,`rgba(255,160,60,${(.55*fl*st.fade).toFixed(2)})`);gr.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gr;g.fillRect(fpp[0]-u*1.5,fpp[1]-u*1.5,u*3,u*3);g.globalCompositeOperation='source-over';
  g.fillStyle='#ffb347';g.beginPath();g.moveTo(fpp[0]-u*.16,fpp[1]);g.quadraticCurveTo(fpp[0],fpp[1]-u*.55*fl,fpp[0]+u*.16,fpp[1]);g.fill();g.fillStyle='#ffe08a';g.beginPath();g.moveTo(fpp[0]-u*.07,fpp[1]);g.quadraticCurveTo(fpp[0],fpp[1]-u*.3*fl,fpp[0]+u*.07,fpp[1]);g.fill();
  const items=[];for(const b of DIO)if(b.k==='tower'||b.k==='occ')items.push({o:b.o,z:b.z,draw:()=>{drawBox(g,P,b);if(b.scr)towerScreens(g,P,b,tt);if(b.sign)drawSign(g,P,b);}});   // towers, gate beams and front posts are depth-sorted with the explorer
  if(!riding&&EXP&&EXP.complete&&EXP.naturalWidth){const walking=st.k==='walk'||st.k==='board',frame=walking&&m?1+Math.floor(t*10)%8:(st.k==='pause'&&st.f<.15?16:0),ex=st.x;
    items.push({o:ex+2.5,z:0,draw:()=>{const s=u/150,p=P(ex,2.5,0);g.drawImage(EXP,frame*286,0,286,390,p[0]-143*s,p[1]-363*s,286*s,390*s);}});}
  {const cx=st.k==='cart'||st.k==='hold'?st.x:12.8;
    items.push({o:cx+2.5,z:0,draw:()=>{drawBox(g,P,{x:cx-.4,y:2.12,z:.03,dx:.8,dy:.76,dz:.42,c:'#b8462f',j:1});if(riding){drawBox(g,P,{x:cx-.12,y:2.35,z:.45,dx:.28,dy:.28,dz:.32,c:'#3a6bd8',j:1});
      drawBox(g,P,{x:cx-.14,y:2.33,z:.77,dx:.32,dy:.32,dz:.28,c:'#c8916a',j:1});drawBox(g,P,{x:cx-.15,y:2.32,z:1.05,dx:.34,dy:.34,dz:.07,c:'#1f150e',j:1});}}});}
  items.sort((a,b)=>a.o-b.o||a.z-b.z).forEach(it=>it.draw());g.globalAlpha=1;
}
// a tower shows a real app screen on each of its two visible sides; every few seconds it turns to the next pair
function towerScreens(g,P,b,tt){const imgs=SCRI&&SCRI[b.scr];if(!imgs)return;const N=imgs.length,per=3.2,ph=tt/per,k=Math.floor(ph),f=ph-k,turn=f>.86?(f-.86)/.14:0,sq=turn<.5?1-turn*2:(turn-.5)*2,idx=turn<.5?k:k+1;
  const inset={x:b.x,y:b.y,z:b.z+.12,dx:b.dx,dy:b.dy,dz:b.dz-.24};
  [[FACE.left,0],[FACE.right,1]].forEach(([F,off])=>{const im=imgs[(idx+off)%N];if(!im.complete||!im.naturalWidth)return;const f4=F(P,inset),mid=(p,q)=>[p[0]+(q[0]-p[0])*(1-sq)/2,p[1]+(q[1]-p[1])*(1-sq)/2];
    const pad=.1,g4=[mid(f4[0],f4[1]),mid(f4[1],f4[0]),mid(f4[2],f4[3]),mid(f4[3],f4[2])];
    if(sq<.02)return;onFace(g,[[g4[0][0]+(g4[1][0]-g4[0][0])*pad,g4[0][1]+(g4[1][1]-g4[0][1])*pad],[g4[1][0]-(g4[1][0]-g4[0][0])*pad,g4[1][1]-(g4[1][1]-g4[0][1])*pad],null,[g4[3][0]+(g4[2][0]-g4[3][0])*pad,g4[3][1]+(g4[2][1]-g4[3][1])*pad]],300,634,x=>x.drawImage(im,0,0,300,634));});}

let last=0;
function tick(now){raf=requestAnimationFrame(tick);if(now-last<1000/30)return;last=now;const t=now/1000;
  drawBg(t);drawDio(dio,t);}

// ---------- hooks for the Normal Mode page ----------
window.MODES={show,cinematic(){if(busy)return;if(state!=='select')show();startImmersive(null);}};

addEventListener('resize',()=>{if(!ms.hidden)sizeBg();});
sizeBg();

// ---------- start ----------
const h=(location.hash||'').replace(/^#/,'').toLowerCase();
if(h==='normal'){ms.hidden=true;startNormal();}
else{show();if(h.indexOf('immersive')===0||h.indexOf('cinematic')===0)startImmersive(h.split('/')[1]||null);}
})();
