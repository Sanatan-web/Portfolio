/* =====================================================================
   IMMERSIVE MODE — engine
   First-person voxel world. Loaded on demand by immersive/modes.js and
   driven by the THREE r128 build the page already loads.
     world.js   builds the stations through the kit (K) defined here
     content.js holds the text of each station's information panel
   Public API: IMM.enter({station,onNormal,onModes}) → Promise, IMM.leave()
   ===================================================================== */
(function(){'use strict';
const THREE=window.THREE,V3=THREE.Vector3;
const BASE=((document.currentScript&&document.currentScript.src)||'immersive/engine.js').replace(/engine\.js(\?.*)?$/,'');
const LOCAL=location.protocol==='file:';   // browsers block local images in WebGL, so pictures stay as placeholders when opened from disk
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const angLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
const TOUCH=matchMedia('(hover: none) and (pointer: coarse)').matches;
const LOW=TOUCH||(navigator.hardwareConcurrency||8)<=4;
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed=9157;const rnd=()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const pick=a=>a[(rnd()*a.length)|0];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ===================== pixel textures (16×16, Minecraft-style, drawn at runtime) =====================
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function pix(fn){const c=cv(16,16),g=c.getContext('2d');fn(g);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function noise(g,r,gr,b,v){for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(rnd()-.5)*v;g.fillStyle=`rgb(${r+k|0},${gr+k|0},${b+k|0})`;g.fillRect(x,y,1,1);}}
const dots=(g,c,n,s)=>{g.fillStyle=c;for(let i=0;i<n;i++)g.fillRect(rnd()*16|0,rnd()*16|0,s||1,s||1);};
const bevel=(g,a,b)=>{g.fillStyle=`rgba(255,255,255,${a})`;g.fillRect(0,0,16,1);g.fillRect(0,0,1,16);g.fillStyle=`rgba(0,0,0,${b})`;g.fillRect(0,15,16,1);g.fillRect(15,0,1,16);};
const planks=(r,gr,b)=>pix(g=>{noise(g,r,gr,b,14);g.fillStyle='rgba(50,25,8,.42)';for(let y=3;y<16;y+=4)g.fillRect(0,y,16,1);for(let y=0;y<16;y+=4)g.fillRect((y*5+3)%14,y,1,3);g.fillStyle='rgba(255,235,200,.14)';for(let y=0;y<16;y+=4)g.fillRect(0,y,16,1);});
const leaves=(r,gr,b)=>pix(g=>{noise(g,r,gr,b,38);dots(g,'rgba(0,40,0,.32)',18,2);dots(g,'rgba(255,255,220,.25)',10);});
const logSide=(r,gr,b,line)=>pix(g=>{noise(g,r,gr,b,14);g.fillStyle=line;for(let x=1;x<16;x+=3)g.fillRect(x,0,1,16);dots(g,'rgba(0,0,0,.2)',6,2);});
const TX={
  grassTop:pix(g=>{noise(g,98,160,64,24);dots(g,'rgba(170,225,100,.45)',14);dots(g,'rgba(40,105,30,.4)',10);}),
  grassSide:pix(g=>{noise(g,134,96,64,20);dots(g,'rgba(90,60,35,.5)',10,2);for(let x=0;x<16;x++){const d=3+(rnd()*3|0);for(let y=0;y<d;y++){const k=(rnd()-.5)*22;g.fillStyle=`rgb(${96+k|0},${158+k|0},${62+k|0})`;g.fillRect(x,y,1,1);}}}),
  dirt:pix(g=>{noise(g,134,96,64,20);dots(g,'rgba(90,60,35,.5)',10,2);dots(g,'rgba(185,145,105,.3)',6);}),
  path:pix(g=>{noise(g,176,146,98,16);dots(g,'rgba(120,92,58,.45)',14,2);dots(g,'rgba(228,206,160,.35)',10);}),
  stone:pix(g=>{noise(g,130,130,132,22);dots(g,'rgba(70,70,74,.5)',8,2);dots(g,'rgba(255,255,255,.14)',6);}),
  cobble:pix(g=>{noise(g,122,122,124,26);g.fillStyle='rgba(40,40,44,.6)';[[0,4,7,1],[7,0,1,5],[3,9,9,1],[12,4,1,6],[0,13,6,1],[6,10,1,6],[11,13,5,1]].forEach(r=>g.fillRect(...r));dots(g,'rgba(255,255,255,.12)',10);}),
  stoneBrick:pix(g=>{noise(g,138,138,138,14);g.fillStyle='rgba(40,40,44,.55)';g.fillRect(0,7,16,1);g.fillRect(0,15,16,1);g.fillRect(7,0,1,7);g.fillRect(2,8,1,7);g.fillRect(12,8,1,7);bevel(g,.1,.15);}),
  oak:planks(178,134,82),birch:planks(210,194,140),spruce:planks(116,82,50),darkOak:planks(78,52,32),
  oakLog:logSide(112,84,50,'rgba(50,30,12,.5)'),
  birchLog:pix(g=>{noise(g,222,220,212,10);g.fillStyle='#2c2a26';[[2,3,3,1],[9,6,4,1],[4,11,2,1],[11,13,3,1],[0,8,2,1]].forEach(r=>g.fillRect(...r));}),
  spruceLog:logSide(76,54,32,'rgba(25,14,6,.55)'),
  leaves:leaves(80,152,52),birchLeaves:leaves(120,170,72),spruceLeaves:leaves(52,104,70),cherryLeaves:leaves(240,170,200),
  hedge:leaves(62,128,46),
  plaster:pix(g=>{noise(g,238,230,214,8);dots(g,'rgba(160,140,110,.12)',8);}),
  quartz:pix(g=>{noise(g,196,192,184,6);bevel(g,.35,.1);}),
  concrete:pix(g=>{noise(g,182,182,178,7);}),
  concreteDark:pix(g=>{noise(g,58,62,70,8);}),
  teal:pix(g=>{noise(g,24,160,152,18);g.fillStyle='rgba(140,245,230,.32)';g.fillRect(1,1,14,2);g.fillRect(1,1,2,14);dots(g,'rgba(6,90,90,.45)',8,2);bevel(g,.16,.38);}),
  brick:pix(g=>{g.fillStyle='rgb(132,58,40)';g.fillRect(0,0,16,16);for(let y=0;y<16;y+=4){const o=(y/4)%2?4:0;for(let x=-o;x<16;x+=8){const k=(rnd()-.5)*22;g.fillStyle=`rgb(${190+k|0},${84+k*.4|0},${60+k*.3|0})`;g.fillRect(x+1,y+1,7,3);}}}),
  terracotta:pix(g=>{noise(g,178,104,74,10);}),
  clay:pix(g=>{noise(g,176,70,48,14);g.fillStyle='rgba(70,20,10,.55)';for(let y=3;y<16;y+=4){g.fillRect(0,y,16,1);for(let x=(y%8===3?0:4);x<16;x+=8)g.fillRect(x,y-3,1,3);}g.fillStyle='rgba(255,200,170,.18)';for(let y=0;y<16;y+=4)g.fillRect(0,y,16,1);}),
  sand:pix(g=>{noise(g,222,206,160,14);}),
  moss:pix(g=>{noise(g,92,124,52,26);dots(g,'rgba(40,70,20,.45)',14,2);}),
  podzol:pix(g=>{noise(g,104,74,44,20);dots(g,'rgba(140,110,50,.4)',12,2);}),
  obsidian:pix(g=>{noise(g,22,16,34,10);dots(g,'rgba(120,80,180,.7)',8);}),
  shelf:pix(g=>{noise(g,170,128,78,10);g.fillStyle='rgba(60,32,12,.8)';g.fillRect(0,0,16,1);g.fillRect(0,7,16,2);g.fillRect(0,15,16,1);const C=['#b33a2e','#2e6fb3','#3b9a46','#c99a2e','#7a42aa','#2b8a8a','#d06a2a'];for(const y0 of[1,9])for(let x=1;x<15;){const w=1+(rnd()*2|0);g.fillStyle=pick(C);g.fillRect(x,y0+(rnd()<.3?1:0),w,6);x+=w+(rnd()<.2?1:0);}}),
  water:pix(g=>{noise(g,52,132,210,18);dots(g,'rgba(210,240,255,.5)',10);g.fillStyle='rgba(20,80,170,.3)';g.fillRect(0,14,16,2);}),
  glass:(()=>{const c=cv(16,16),g=c.getContext('2d');g.fillStyle='rgba(200,232,255,.16)';g.fillRect(0,0,16,16);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,0,16,1);g.fillRect(0,0,1,16);g.fillRect(0,15,16,1);g.fillRect(15,0,1,16);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(3,3,1,3);g.fillRect(4,2,2,1);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t;})()
};
TX.water.wrapS=TX.water.wrapT=THREE.RepeatWrapping;
const ML=o=>new THREE.MeshLambertMaterial(o);
const MAT={};
Object.keys(TX).forEach(k=>{if(k!=='grassTop'&&k!=='grassSide'&&k!=='glass'&&k!=='water'&&k!=='shelf')MAT[k]=ML({map:TX[k]});});
MAT.grass=[ML({map:TX.grassSide}),ML({map:TX.grassSide}),ML({map:TX.grassTop}),MAT.dirt,ML({map:TX.grassSide}),ML({map:TX.grassSide})];
const shelfM=ML({map:TX.shelf});MAT.bookshelf=[shelfM,shelfM,MAT.oak,MAT.oak,shelfM,shelfM];
MAT.glass=ML({map:TX.glass,transparent:true,depthWrite:false,side:THREE.DoubleSide});
MAT.vc=ML({vertexColors:true});
MAT.glow=new THREE.MeshBasicMaterial({vertexColors:true});
const NOCAST=new Set(['glass','water']);
const TEXUSE=[];Object.keys(MAT).forEach(k=>{const m=MAT[k];if(m&&m.map&&m.map===TX[k])TEXUSE.push({m,k});});
MAT.grass.forEach(m=>{if(m.map===TX.grassTop)TEXUSE.push({m,k:'grassTop'});else if(m.map===TX.grassSide)TEXUSE.push({m,k:'grassSide'});});

// ===================== Cinematic Mode: realistic 128px textures, drawn once on demand =====================
let RT=null;
function buildRT(){
  let sd=20251;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const S=128;
  const mk=n=>{const a=new Float32Array(n*n);for(let i=0;i<a.length;i++)a[i]=R();return a;};
  const LV=[2,4,8,16,32,64].map(n=>({n,a:mk(n)})),HT=mk(97);
  const vn=(o,x,y)=>{const n=o.n,X=x*n,Y=y*n,i=Math.floor(X),j=Math.floor(Y),fx=X-i,fy=Y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=o.a,i0=((i%n)+n)%n,j0=((j%n)+n)%n,i1=(i0+1)%n,j1=(j0+1)%n,A=a[j0*n+i0],B=a[j0*n+i1],C=a[j1*n+i0],D=a[j1*n+i1];return A+(B-A)*u+(C-A)*v+(A-B-C+D)*u*v;};
  const fbm=(x,y,o0,o1)=>{let t=0,w=0,amp=1;for(let k=o0;k<=o1;k++){t+=vn(LV[k],x,y)*amp;w+=amp;amp*=.55;}return t/w;};
  const h2=(a,b)=>HT[(((a*7+b*13)%97)+97)%97];
  const make=fn=>{const c=cv(S,S),g=c.getContext('2d'),im=g.createImageData(S,S),d=im.data;const ox=R(),oy=R();
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const col=fn(x/S,y/S,ox,oy),i=(y*S+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}
    g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t;};
  const avg=k=>{const c=TX[k].image,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<20)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++;}return[r/n,g/n,b/n];};
  const sh=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
  const edge=(x,y,w)=>{const e=Math.min(x,y,1-x,1-y);return e<w?.8+.2*(e/w):1;};
  const G={
    stone:c=>(x,y,a,b)=>{const n=fbm(x+a,y+b,1,5),cr=Math.abs(fbm(x+b,y+a,1,3)-.5);let k=.74+.46*n;if(cr<.03)k*=.6+cr*9;if(vn(LV[5],x+a,y)>.84)k*=1.12;return sh(c,k*edge(x,y,.035));},
    cobble:c=>{const pts=[];for(let i=0;i<12;i++)pts.push([R(),R(),.82+R()*.34]);return(x,y,a,b)=>{let d1=9,d2=9,id=0;pts.forEach((p,i)=>{for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const d=Math.hypot(x-p[0]-ox,y-p[1]-oy);if(d<d1){d2=d1;d1=d;id=i;}else if(d<d2)d2=d;}});
      const m=d2-d1;let k=pts[id][2]*(.78+.36*fbm(x+a,y+b,2,5))*(1.08-.5*d1);if(m<.035)k*=.4+m*12;return sh(c,k);};},
    bricks:(c,rows,cols,mort)=>(x,y,a,b)=>{const row=Math.floor(y*rows),off=row%2?.5/cols:0,bx=((x+off)%1+1)%1,col=Math.floor(bx*cols),fy=y*rows-row,fx=bx*cols-col,mm=Math.min(Math.min(fy,1-fy)/rows,Math.min(fx,1-fx)/cols);
      if(mm<.011)return sh(mort,.85+.25*fbm(x+a,y+b,3,5));let k=(.84+.3*h2(row,col))*(.8+.32*fbm(x+a,y+b,2,5));if(mm<.022)k*=.82;return sh(c,k);},
    planks:c=>(x,y,a,b)=>{const bd=Math.floor(y*4),fy=y*4-bd,seam=Math.min(fy,1-fy),jx=h2(bd,3)*.8+.1,gr=fbm(x+a+bd*.37,y*3+b,1,5);
      let k=(.78+.38*gr)*(.9+.2*h2(bd,1))*(.94+.06*Math.sin(2*Math.PI*(y*28+gr*3)));if(seam<.05)k*=.5+seam*8;if(Math.abs(x-jx)<.006)k*=.55;return sh(c,k);},
    log:c=>(x,y,a,b)=>{const v=fbm(x+a,y+b,1,5),r=Math.abs(Math.sin(2*Math.PI*(x*6+.25*fbm(x,y+a,0,2))));let k=(.6+.55*v)*(.66+.38*r);return sh(c,k);},
    birch:c=>(x,y,a,b)=>{let k=.86+.18*fbm(x+a,y+b,2,5);const mark=Math.abs(Math.sin(2*Math.PI*(y*5+.4*vn(LV[2],x,y))))>.94&&vn(LV[3],x+a,y)>.52;return mark?[54,50,46]:sh(c,k);},
    leaves:c=>(x,y,a,b)=>{const n=fbm(x+a,y+b,2,5),m=vn(LV[5],x+b,y+a);let k=.55+.8*n;if(m>.64)k*=1.2;if(n<.4)k*=.5;return sh(c,k);},
    grass:c=>(x,y,a,b)=>{const n=fbm(x+a,y+b,1,4),bl=vn(LV[5],x+b,y+a),bb=vn(LV[5],x+a*2,y+b*2);let k=(.7+.42*n)*(.82+.34*bl);if(bb>.8)k*=1.16;return[c[0]*k*(.94+.12*bb),c[1]*k,c[2]*k*.94];},
    dirt:c=>(x,y,a,b)=>{const n=fbm(x+a,y+b,1,5),p=vn(LV[5],x+b,y+a);let k=.72+.46*n;if(p>.8)k*=1.18;if(p<.16)k*=.74;return sh(c,k);},
    smooth:(c,v)=>(x,y,a,b)=>sh(c,(1-v/2+v*fbm(x+a,y+b,1,5))*edge(x,y,.03)),
    water:c=>(x,y,a,b)=>{const n=fbm(x+a,y+b,1,4),w=.5+.5*Math.sin(2*Math.PI*(x*3+n*1.6));return[c[0]*(.78+.32*n),c[1]*(.84+.26*n),c[2]*(.88+.22*w*n)];},
  };
  const out={},gc=avg('grassTop'),dc=avg('dirt');
  const pickG=k=>{const c=avg(k);
    if(/^(grassTop|moss)$/.test(k))return G.grass(c);if(/^(dirt|path|sand|podzol)$/.test(k))return G.dirt(c);if(k==='stone')return G.stone(c);if(k==='cobble')return G.cobble(c);
    if(k==='stoneBrick')return G.bricks(c,2,2,[66,66,70]);if(k==='brick')return G.bricks(c,4,2,[176,166,152]);if(k==='clay')return G.bricks(c,4,2,[70,26,16]);
    if(/^(oak|birch|spruce|darkOak)$/.test(k))return G.planks(c);if(/Log$/.test(k))return k==='birchLog'?G.birch(c):G.log(c);if(/[lL]eaves$|^hedge$/.test(k))return G.leaves(c);
    if(k==='water')return G.water([58,164,178]);if(/^(shelf|glass|grassSide)$/.test(k))return null;
    return G.smooth(c,{plaster:.12,quartz:.08,concrete:.12,concreteDark:.16,teal:.2,terracotta:.16,obsidian:.3}[k]||.2);};
  for(const k of Object.keys(TX)){const f=pickG(k);if(f)out[k]=make(f);}
  {const gf=G.grass(gc),df=G.dirt(dc);out.grassSide=make((x,y,a,b)=>y<.2+.1*vn(LV[3],x+a,.5)+.05*vn(LV[5],x+b,.2)?gf(x,y,a,b):df(x,y,a,b));}
  // grey detail maps that tint well (terrain, instanced forest)
  out.detailRock=make((x,y,a,b)=>{const bx=(x*2)%1,by=(y*2)%1,n=fbm(x+a,y+b,1,5),cr=Math.abs(fbm(x+b,y+a,2,4)-.5);let k=(.74+.36*n)*edge(bx,by,.06)*(.9+.14*h2(Math.floor(x*2),Math.floor(y*2)));if(cr<.025)k*=.75;return sh([214,207,196],k);});
  out.detailLeaf=make((x,y,a,b)=>{const n=fbm(x+a,y+b,2,5),m=vn(LV[5],x+b,y+a);let k=.62+.6*n;if(m>.66)k*=1.15;if(n<.38)k*=.55;return sh([238,238,238],k);});
  out.detailBark=G.log([235,235,235]).length?make(G.log([235,235,235])):null;
  return out;}

function tiled(name,rx,ry,offset){const t=TX[name].clone();t.needsUpdate=true;t.repeat.set(rx,ry);const m=ML({map:t,polygonOffset:true,polygonOffsetFactor:-(offset||1),polygonOffsetUnits:-(offset||1)});if(name==='water'){m.transparent=true;m.opacity=.9;}TEXUSE.push({m,k:name,rep:true});return m;}

// ===================== geometry merging (one draw call per chunk of coloured boxes) =====================
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(0,0,0,'YXZ'),_p=new V3(),_s=new V3(),_v=new V3(),_n=new V3(),_c=new THREE.Color();
const FACE=[[1,0,0,0,0,-1,0,1,0],[-1,0,0,0,0,1,0,1,0],[0,1,0,1,0,0,0,0,-1],[0,-1,0,1,0,0,0,0,1],[0,0,1,1,0,0,0,1,0],[0,0,-1,-1,0,0,0,1,0]];
const CORN=[[-1,-1],[1,-1],[1,1],[-1,1]];
class Merge{
  constructor(){this.p=[];this.n=[];this.c=[];this.i=[];this.k=0;}
  box(color,x,y,z,sx,sy,sz,ry,rx,rz,flat){
    _c.set(color);if(!flat){const j=1+(rnd()-.5)*.06;_c.r*=j;_c.g*=j;_c.b*=j;}
    _e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_m.compose(_p.set(x,y,z),_q,_s.set(sx,sy,sz));
    for(const F of FACE){_n.set(F[0],F[1],F[2]).applyQuaternion(_q);
      for(const C of CORN){_v.set(F[0]*.5+(C[0]*F[3]+C[1]*F[6])*.5,F[1]*.5+(C[0]*F[4]+C[1]*F[7])*.5,F[2]*.5+(C[0]*F[5]+C[1]*F[8])*.5).applyMatrix4(_m);
        this.p.push(_v.x,_v.y,_v.z);this.n.push(_n.x,_n.y,_n.z);this.c.push(_c.r,_c.g,_c.b);}
      const k=this.k;this.i.push(k,k+1,k+2,k,k+2,k+3);this.k+=4;}
    return this;}
  get empty(){return this.k===0;}
  geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.setIndex(this.i);g.computeBoundingSphere();return g;}
  mesh(mat,cast){const m=new THREE.Mesh(this.geo(),mat||MAT.vc);m.castShadow=cast!==false;m.receiveShadow=true;return m;}
}

// ===================== state =====================
let renderer=null,scene=null,cam=null,root=null,canvas=null,built=false,active=false,raf=0,last=0,T=0;
let hemi,sun,sky,skyU,dust;
const chunks=[],items=[],zones=[],solids=[],always=[],screens=[],signDraws=[];
let CH=null,amb=[];
const P={x:0,z:10,yaw:0,pitch:-.03,vx:0,vz:0,speed:0,bob:0,eye:1.62,stop:0};
let view=(()=>{try{return localStorage.getItem('imm-view')==='third'?'third':'first';}catch(e){return'first';}})(),avatar=null;
let ride=null,CINE=false;const LOOKS=[];
const baseFov=()=>CINE?60:70;
let state='off',cb={},target=null,curZone=null,travel=null,intro=null,first=true,lastZone=null,panelId=null;
let VIEW=95;const RAD=.3;
const fontsReady=document.fonts&&document.fonts.load?Promise.race([Promise.all([document.fonts.load('800 64px Rubik'),document.fonts.load('700 40px Rubik'),document.fonts.load('16px "Press Start 2P"')]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{}):Promise.resolve();

// ===================== kit for world.js =====================
const UB=new THREE.BoxGeometry(1,1,1);
function chunk(name,zA,zB){const c={name,z0:Math.min(zA,zB),z1:Math.max(zA,zB),group:new THREE.Group(),b:{},m:new Merge(),gl:new Merge(),anims:[],vis:true};c.group.name=name;scene.add(c.group);chunks.push(c);CH=c;return c;}
function blk(type,x,y,z,sx,sy,sz,ry){const b=CH.b[type]||(CH.b[type]=[]);_e.set(0,ry||0,0,'YXZ');_q.setFromEuler(_e);_m.compose(_p.set(x,y,z),_q,_s.set(sx||1,sy||1,sz||1));for(let i=0;i<16;i++)b.push(_m.elements[i]);}
const cube=(color,x,y,z,sx,sy,sz,ry,rx,rz)=>CH.m.box(color,x,y,z,sx,sy,sz,ry,rx,rz);
const lit=(color,x,y,z,sx,sy,sz,ry,rx,rz)=>CH.gl.box(color,x,y,z,sx,sy,sz,ry,rx,rz,true);
function flush(c){
  for(const type in c.b){const arr=c.b[type],n=arr.length/16;let mat,cast=true;
    if(type.indexOf('roof-')===0){mat=MAT[type.slice(5)];cast=false;}else mat=MAT[type];
    if(!mat){console.warn('Immersive: unknown block',type);continue;}
    const m=new THREE.InstancedMesh(UB,mat,n);m.instanceMatrix.array.set(arr);m.instanceMatrix.needsUpdate=true;
    if(type!=='glass'&&type!=='water'){for(let i=0;i<n;i++){const j=.86+rnd()*.16;m.setColorAt(i,_c.setRGB(j,j,j));}m.instanceColor.needsUpdate=true;}
    m.castShadow=cast&&!NOCAST.has(type);m.receiveShadow=true;m.frustumCulled=false;c.group.add(m);}
  if(!c.m.empty)c.group.add(c.m.mesh(MAT.vc));
  if(!c.gl.empty){const g=c.gl.mesh(MAT.glow,false);g.receiveShadow=false;c.group.add(g);}
  c.b={};c.m=new Merge();c.gl=new Merge();}
function plane(mt,w,h,x,y,z,ry,rx,o){o=o||{};let mat=mt;
  if(!mt.isMaterial)mat=o.basic?new THREE.MeshBasicMaterial({map:mt,transparent:!!o.transparent,side:o.double?THREE.DoubleSide:THREE.FrontSide,toneMapped:false}):ML({map:mt,transparent:!!o.transparent,side:o.double?THREE.DoubleSide:THREE.FrontSide});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0,'YXZ');m.receiveShadow=!o.basic;m.castShadow=!!o.cast;(o.parent||CH.group).add(m);return m;}
const FLOORS=[];
function floor(name,x0,z0,x1,z1,y,layer){const w=Math.abs(x1-x0),d=Math.abs(z1-z0);FLOORS.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1),name]);return plane(tiled(name,w,d,layer||1),w,d,(x0+x1)/2,y==null?.03:y,(z0+z1)/2,0,-Math.PI/2);}
const solid=(cx,cz,w,d)=>solids.push([cx-w/2,cz-d/2,cx+w/2,cz+d/2]);
const solidBox=(x0,z0,x1,z1)=>solids.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
const anim=fn=>CH.anims.push(fn);
function sign(o){const c=cv(o.w||512,o.h||128),g=c.getContext('2d');const t=new THREE.CanvasTexture(c);t.anisotropy=8;const draw=()=>{g.clearRect(0,0,c.width,c.height);o.draw(g,c.width,c.height);t.needsUpdate=true;};draw();signDraws.push(draw);return t;}
function fit(g,txt,max,size,weight,fam){let s=size;g.font=`${weight} ${s}px ${fam}`;while(g.measureText(txt).width>max&&s>10){s-=2;g.font=`${weight} ${s}px ${fam}`;}return s;}
const HF='Rubik,"Segoe UI",system-ui,sans-serif',PF='"Press Start 2P",monospace';
function woodSign(txt,o){o=o||{};return sign({w:1024,h:256,draw(g,w,h){g.fillStyle='#4e2a10';g.fillRect(0,0,w,h);g.fillStyle='#c07a34';g.fillRect(12,12,w-24,h-24);g.fillStyle='#93562a';g.fillRect(26,26,w-52,h-52);g.fillStyle='rgba(0,0,0,.12)';for(let y=70;y<h-26;y+=44)g.fillRect(26,y,w-52,5);g.fillStyle='#e8bc6a';[[36,36],[w-52,36],[36,h-52],[w-52,h-52]].forEach(([a,b])=>g.fillRect(a,b,16,16));
  let tx=w/2,max=w-140;if(o.icon){o.icon(g,150,h/2);tx=w/2+70;max=w-330;}
  fit(g,txt,max,o.sub?112:124,800,HF);g.textAlign='center';g.textBaseline='middle';const ty=o.sub?h/2-22:h/2+6;g.fillStyle='#3a1c06';g.fillText(txt,tx+5,ty+8);g.fillStyle='#fbeccb';g.fillText(txt,tx,ty);
  if(o.sub){fit(g,o.sub,max,30,400,PF);g.fillStyle='#f6d28a';g.fillText(o.sub,tx,h/2+58);}}});}
function darkSign(txt,o){o=o||{};return sign({w:o.w||1024,h:o.h||256,draw(g,w,h){g.fillStyle=o.bg||'#14171d';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(10,10,w-20,h-20);g.fillStyle=o.bg||'#14171d';g.fillRect(16,16,w-32,h-32);g.fillStyle=o.accent||'#19b3a1';g.fillRect(16,16,w-32,10);
  let tx=w/2,max=w-120;if(o.icon){o.icon(g,140,h/2+6);tx=w/2+60;max=w-300;}
  g.textAlign='center';g.textBaseline='middle';fit(g,txt,max,o.size||110,800,HF);g.fillStyle=o.color||'#ffffff';g.fillText(txt,tx,o.sub?h/2-16:h/2+8);
  if(o.sub){fit(g,o.sub,max,28,400,PF);g.fillStyle=o.accent||'#19b3a1';g.fillText(o.sub,tx,h/2+62);}}});}
function screen(w,h,draw,fps){const c=cv(w,h),g=c.getContext('2d');const t=new THREE.CanvasTexture(c);t.anisotropy=4;const s={g,t,w,h,draw,step:1/(fps||8),next:0,chunk:CH};draw(g,0,w,h);t.needsUpdate=true;screens.push(s);return t;}
// ---- pictures: real images on screens/frames, drawn into a canvas (cover-fit), loaded on demand ----
function picture(name,w,h,o){o=o||{};const c=cv(w,h),g=c.getContext('2d');const t=new THREE.CanvasTexture(c);t.anisotropy=8;
  g.fillStyle=o.bg||'#16181d';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.28)';g.font='600 '+Math.round(Math.min(w,h)/10)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.label||'',w/2,h/2);
  let started=false;const p={tex:t,img:null,load(){if(started||LOCAL||!name)return;started=true;const im=new Image();im.decoding='async';
    im.onload=()=>{p.img=im;const s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;g.fillStyle=o.bg||'#16181d';g.fillRect(0,0,w,h);g.drawImage(im,(w-dw)/2,o.top?0:(h-dh)/2,dw,dh);t.needsUpdate=true;};
    im.src=BASE+'media/'+name;}};return p;}
// ---- videos: muted looping MP4s on screens; they play only while their station is in view ----
const videos=[];
function video(name,o){o=o||{};const c=cv(64,128),g=c.getContext('2d');g.fillStyle='#14161b';g.fillRect(0,0,64,128);g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(24,50);g.lineTo(44,64);g.lineTo(24,78);g.closePath();g.fill();
  const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),toneMapped:false});
  const v={mat,el:null,ready:false,want:false,chunk:CH,
    load(){if(this.el||LOCAL||!name)return;const e=document.createElement('video');e.muted=true;e.defaultMuted=true;e.loop=true;e.playsInline=true;e.setAttribute('playsinline','');e.setAttribute('muted','');e.preload='auto';
      e.addEventListener('loadeddata',()=>{const t=new THREE.VideoTexture(e);t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;
        if(o.cover){const vr=e.videoHeight/e.videoWidth,sr=o.cover;if(vr<sr){t.repeat.set(vr/sr,1);t.offset.set((1-vr/sr)/2,0);}else{t.repeat.set(1,sr/vr);t.offset.set(0,1-sr/vr);}}   // fill a screen of height/width sr, cropping the sides (or the bottom)
        mat.map=t;mat.needsUpdate=true;this.ready=true;if(this.want)this.play();},{once:true});
      e.src=BASE+'media/'+name;this.el=e;e.load();},
    play(){this.want=true;if(!this.el)this.load();if(this.el&&this.ready&&this.el.paused){const r=this.el.play();if(r&&r.catch)r.catch(()=>{});}},
    pause(){this.want=false;if(this.el&&!this.el.paused)this.el.pause();}};
  videos.push(v);return v;}
// ---- characters: blocky people built from merged boxes (torso, head and each limb are one mesh) ----
const SKIN=['#c8916a','#b97f58','#d9a67e','#9a6444','#e3b48e','#a8714d','#8a5638'];
const HAIR=['#17110c','#24180f','#33200f','#4a2c16','#0f0b08','#5a3a1e'];
function person(o){
  o=Object.assign({skin:pick(SKIN),hair:pick(HAIR),style:'short',shirt:'#e9e7e1',pants:'#2c3446',shoe:'#24211f',pose:'stand',x:0,y:0,z:0,ry:0},o);
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);g.position.set(o.x,o.y,o.z);g.rotation.y=o.ry;
  const tm=new Merge(),sleeve=o.sleeve||o.jacket||o.shirt;
  tm.box(o.shirt,0,1.11,0,.52,.72,.3);
  if(o.jacket){tm.box(o.jacket,-.165,1.11,0,.2,.73,.32);tm.box(o.jacket,.165,1.11,0,.2,.73,.32);tm.box(o.jacket,0,.8,0,.53,.12,.31);}
  if(o.over){tm.box(o.over,0,.93,0,.54,.38,.32);tm.box(o.over,-.17,1.26,0,.08,.32,.32);tm.box(o.over,.17,1.26,0,.08,.32,.32);}
  if(o.tie)tm.box(o.tie,0,1.16,.155,.08,.44,.02);
  if(o.lanyard){tm.box(o.lanyard,-.08,1.3,.155,.03,.28,.02);tm.box(o.lanyard,.08,1.3,.155,.03,.28,.02);tm.box('#f4f4f2',0,1.08,.16,.14,.17,.02);}
  if(o.scarf)tm.box(o.scarf,0,1.42,0,.4,.12,.34);
  if(o.apron)tm.box(o.apron,0,.98,.155,.44,.5,.02);
  let legL=null,legR=null;
  const legBox=(m,s,dx)=>{m.box(o.pants,s+dx,.44,0,.24,.62,.26);m.box(o.shoe,s+dx,.07,.03,.25,.14,.3);};
  if(o.pose==='stand'||o.pose==='walk'){const leg=s=>{const m=new Merge();m.box(o.pants,0,-.31,0,.24,.62,.26);m.box(o.shoe,0,-.68,.03,.25,.14,.3);const p=new THREE.Group();p.position.set(s,.75,0);p.add(m.mesh());body.add(p);return p;};legL=leg(-.13);legR=leg(.13);if(o.skirt)tm.box(o.skirt,0,.66,0,.56,.36,.34);}
  else if(o.pose==='sit'){for(const s of[-.13,.13]){tm.box(o.pants,s,.75,.2,.24,.26,.46);tm.box(o.pants,s,.5,.4,.24,.5,.24);tm.box(o.shoe,s,.3,.46,.25,.12,.32);}body.position.y=(o.seat==null?.46:o.seat)-.75;}
  else if(o.pose==='cross'){tm.box(o.pants,-.2,.73,.2,.24,.22,.5,.75);tm.box(o.pants,.2,.73,.2,.24,.22,.5,-.75);tm.box(o.pants,0,.71,.42,.66,.2,.24);tm.box(o.shoe,-.34,.71,.44,.14,.16,.2);tm.box(o.shoe,.34,.71,.44,.14,.16,.2);body.position.y=-.6+(o.base||0);}
  else if(o.pose==='lie'){legBox(tm,-.13,0);legBox(tm,.13,0);body.rotation.x=-Math.PI/2;body.position.y=(o.base||0)+.16;}
  if(o.dress)tm.box(o.dress,0,.78,0,.56,.4,.34);
  body.add(tm.mesh());
  const arm=s=>{const m=new Merge();m.box(sleeve,0,-.18,0,.18,.4,.22);m.box(o.skin,0,-.52,0,.16,.32,.2);if(o.watch&&s>0)m.box('#222',0,-.42,0,.17,.05,.21);const p=new THREE.Group();p.position.set(s*.36,1.42,0);p.add(m.mesh());body.add(p);return p;};
  const armL=arm(-1),armR=arm(1);
  const head=new THREE.Group();head.position.set(0,1.47,0);body.add(head);
  const hm=new Merge();hm.box(o.skin,0,.25,0,.5,.5,.5);
  if(o.hijab){hm.box(o.hijab,0,.53,-.02,.56,.12,.56);hm.box(o.hijab,0,.25,-.25,.56,.6,.08);hm.box(o.hijab,-.27,.25,0,.06,.6,.54);hm.box(o.hijab,.27,.25,0,.06,.6,.54);hm.box(o.hijab,0,-.02,.05,.58,.1,.5);}
  else if(o.style!=='bald'){const H=o.hair;hm.box(H,0,.53,0,.54,.12,.54);hm.box(H,0,.33,-.22,.54,.42,.12);hm.box(H,-.25,.41,-.02,.06,.26,.5);hm.box(H,.25,.41,-.02,.06,.26,.5);hm.box(H,0,.45,.235,.46,.1,.06);
    if(o.style==='long'){hm.box(H,0,.1,-.24,.56,.66,.14);hm.box(H,-.27,.2,-.04,.1,.52,.42);hm.box(H,.27,.2,-.04,.1,.52,.42);}
    if(o.style==='pony')hm.box(H,0,.3,-.36,.16,.4,.16);
    if(o.style==='bun')hm.box(H,0,.62,-.2,.22,.2,.22);}
  if(o.cap){hm.box(o.cap,0,.56,0,.56,.14,.56);hm.box(o.cap,0,.5,.32,.5,.05,.2);}
  if(o.closed){hm.box('#2a1d16',-.11,.27,.252,.12,.03,.02);hm.box('#2a1d16',.11,.27,.252,.12,.03,.02);}
  else{for(const s of[-1,1]){hm.box('#ffffff',s*.11,.27,.252,.1,.09,.02,0,0,0,true);hm.box('#1f2430',s*.1,.27,.258,.05,.08,.02,0,0,0,true);hm.box(o.hijab?o.skin:o.hair,s*.11,.35,.252,.13,.03,.02);}}
  hm.box('#a5574a',0,.12,.252,.14,.035,.02,0,0,0,true);
  if(o.glasses)for(const s of[-1,1]){hm.box('#141414',s*.11,.33,.264,.16,.03,.02);hm.box('#141414',s*.11,.21,.264,.16,.03,.02);hm.box('#141414',s*.18,.27,.264,.03,.13,.02);hm.box('#141414',s*.035,.27,.264,.03,.13,.02);}
  if(o.headset){hm.box('#1d1f24',0,.58,0,.6,.06,.1);for(const s of[-1,1])hm.box('#1d1f24',s*.29,.28,0,.08,.2,.2);hm.box('#1d1f24',-.22,.12,.18,.03,.03,.2,.5);}
  if(o.earphones){hm.box('#f4f4f2',-.26,.25,.04,.05,.06,.06);hm.box('#f4f4f2',.26,.25,.04,.05,.06,.06);}
  head.add(hm.mesh());
  g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
  (o.parent||CH.group).add(g);
  return{g,body,head,armL,armR,legL,legR,o,ph:rnd()*6.28};}
function walkPose(p,phase,amt){const s=Math.sin(phase)*amt;if(p.legL){p.legL.rotation.x=s*.6;p.legR.rotation.x=-s*.6;}p.armL.rotation.x=-s*.45;p.armR.rotation.x=s*.45;p.body.position.y=Math.abs(Math.sin(phase))*.04*amt;}
// ---- nature ----
function tree(x,z,kind,h,r){kind=kind||'oak';h=h||4+(rnd()*2|0);r=r||2;
  const lg={oak:'oakLog',birch:'birchLog',spruce:'spruceLog',cherry:'oakLog'}[kind],lf={oak:'leaves',birch:'birchLeaves',spruce:'spruceLeaves',cherry:'cherryLeaves'}[kind];
  for(let i=0;i<h;i++)blk(lg,x,i+.5,z);
  if(kind==='spruce'){for(let L=0;L<h+1;L++){const y=h+1-L,rr=L===0?0:Math.min(r,1+((L-1)>>1)+(L%2?0:-1));for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){if(Math.abs(dx)+Math.abs(dz)>rr+(rr>1?1:0))continue;if(dx===0&&dz===0&&L>0&&y<h)continue;blk(lf,x+dx,y+.5,z+dz);}}}
  else{const top=h;for(let dy=-1;dy<=2;dy++){const rr=dy<=0?r:dy===1?r-1:Math.max(1,r-2);for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){if(Math.abs(dx)===rr&&Math.abs(dz)===rr&&(dy>0||rnd()<.65))continue;if(dy===2&&Math.abs(dx)+Math.abs(dz)>rr)continue;if(dx===0&&dz===0&&dy<0)continue;blk(lf,x+dx,top+dy+.5,z+dz);}}}
  solid(x,z,.9,.9);}
function flower(x,z,c){c=c||pick(['#f8f8f2','#ffcf1a','#ff6a5a','#c86bff','#ff9ad5','#6ab8ff']);cube('#3c9e22',x,.22,z,.07,.44,.07);cube(c,x,.5,z,.22,.16,.22);cube('#f5a300',x,.52,z,.1,.12,.1);}
function tuft(x,z){[['#7ccb3c',.42,-.12],['#5aae2a',.3,-.02],['#94dc4a',.48,.08],['#5aae2a',.28,.16]].forEach(([c,h,o])=>cube(c,x+o,h/2,z+(rnd()-.5)*.1,.07,h,.07));}
function bush(x,z,s,type){s=s||1;blk(type||'hedge',x,s*.45,z,s*1.1,s*.9,s*1.1);blk(type||'hedge',x+.2*s,s*.95,z-.1*s,s*.7,s*.4,s*.7);}
// ---- interaction / zones / ambience ----
const markGeo=new THREE.OctahedronGeometry(.12,0);
const haloTex=(()=>{const c=cv(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,230,140,.9)');r.addColorStop(.4,'rgba(255,214,90,.25)');r.addColorStop(1,'rgba(255,214,90,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
function interact(o){const it=Object.assign({r:3.4,y:1.4,verb:'Explore',label:'',chunk:CH},o);
  if(o.marker!==false){const m=new THREE.Mesh(markGeo,new THREE.MeshBasicMaterial({color:o.color||'#ffd65a',fog:false}));m.position.set(it.x,it.my!=null?it.my:it.y+.8,it.z);CH.group.add(m);
    const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,depthWrite:false,opacity:.7,fog:false}));h.scale.setScalar(.7);m.add(h);it.m=m;it.h=h;it.my0=m.position.y;}
  items.push(it);return it;}
const zone=o=>{zones.push(Object.assign({},o));};
const ambience=list=>{amb=list.map(a=>Object.assign({},a,{c:{}})).sort((a,b)=>b.z-a.z);for(const a of amb)for(const k of['top','hor','bot','fog','hs','hg','sc'])if(a[k])a.c[k]=new THREE.Color(a[k]);};

// ===================== actions shown to visitors =====================
const content=()=>(window.IMM_CONTENT&&window.IMM_CONTENT.stations)||[];
const PF_=()=>window.PORTFOLIO||null;
function openSlides(i,from){const pf=PF_();if(!pf||i==null){toast('Case study coming soon');return;}unlock(true);pf.openSlides(i,from||null);}
function openLink(url,label){if(!url)return;unlock(true);window.open(url,'_blank','noopener');toast('Opening '+(label||'link')+' in a new tab');}
function openMail(){const pf=PF_();if(!pf)return;unlock(true);window.location.href='mailto:'+pf.email;toast('Opening your mail app');}
function openWorks(k){const pf=PF_();if(!pf)return;unlock(true);pf.openWorks(k,null);}

// ===================== DOM / HUD =====================
let el={};
function buildDOM(){
  root=document.createElement('div');root.id='imm';root.hidden=true;if(TOUCH)root.classList.add('touch');
  root.innerHTML=`<div class="im-vig"></div><div class="im-film" aria-hidden="true"><i class="gr"></i></div>
<div class="im-hud">
  <div class="im-brand"><span class="px">IMMERSIVE MODE</span><span class="im-zone">Welcome</span></div>
  <nav class="im-track" aria-label="Jump to a station"><div class="im-line"><i class="im-you"></i></div></nav>
  <div class="im-tr"><button class="im-btn im-b-st" type="button" aria-label="Stations"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1a5 5 0 0 0-5 5c0 3.6 5 9 5 9s5-5.4 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg><span class="lbl">Stations</span> <kbd>M</kbd></button><button class="im-btn im-b-view" type="button" aria-label="Change view"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 3C4.4 3 1.6 5.4.5 8c1.1 2.6 3.9 5 7.5 5s6.4-2.4 7.5-5C14.4 5.4 11.6 3 8 3zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg><span class="lbl im-view-l">1st person</span> <kbd>V</kbd></button><button class="im-btn im-b-back" type="button" aria-label="Back to choosing a mode"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10 3 5 8l5 5"/></svg><span class="lbl">Back</span> <kbd>B</kbd></button></div>
  <div class="im-cross"></div>
  <div class="im-prompt" aria-live="polite"><kbd>E</kbd><span></span></div>
  <div class="im-help off"><span class="k"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Move</span><span class="k"><kbd>↑</kbd><kbd>←</kbd><kbd>→</kbd></span><span>Walk and turn</span><span class="k"><kbd>SHIFT</kbd></span><span>Run</span><span class="k"><kbd>E</kbd></span><span>Interact</span><span class="k"><kbd>M</kbd></span><span>Stations</span><span class="k"><kbd>V</kbd></span><span>Change view</span><span class="k"><kbd>B</kbd></span><span>Back</span><span class="k"><kbd>H</kbd></span><span>Hide this</span></div>
  <div class="im-hint"></div>
  <div class="im-toast" role="status"></div>
</div>
<div class="im-touch"><div class="im-joy"><i></i></div><button class="im-act" type="button">TAP</button></div>
<div class="im-start" role="dialog" aria-modal="true" aria-labelledby="imStartT"><div class="im-card">
  <div class="im-eb">IMMERSIVE MODE</div><h2 id="imStartT">Walk through my work</h2>
  <p>Follow the path from station to station. Each project has its own environment, and the glowing markers open its story.</p>
  <div class="im-keys">${TOUCH?
    '<div><span class="k"><kbd>PAD</kbd></span>Left thumb pad to walk</div><div><span class="k"><kbd>DRAG</kbd></span>Drag anywhere to look</div><div><span class="k"><kbd>TAP</kbd></span>Interact with markers</div><div><span class="k"><kbd>BACK</kbd></span>Back to choosing a mode</div>':
    '<div><span class="k"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>Move</div><div><span class="k"><kbd>MOUSE</kbd></span>Look around</div><div><span class="k"><kbd>E</kbd></span>Interact</div><div><span class="k"><kbd>M</kbd></span>Jump to a station</div><div><span class="k"><kbd>SHIFT</kbd></span>Run</div><div><span class="k"><kbd>V</kbd></span>First or third person</div><div><span class="k"><kbd>B</kbd></span>Back to choosing a mode</div>'}</div>
  <div class="im-row"><button class="im-primary im-go" type="button">Start exploring</button><button class="im-ghost im-b-normal" type="button">Switch to Normal Mode</button></div>
</div></div>
<div class="im-menu" role="dialog" aria-modal="true" aria-labelledby="imMenuT"><div class="im-card">
  <div class="im-eb">MENU</div><h2 id="imMenuT">Where to next?</h2>
  <div class="im-list"></div>
  <div class="im-row"><button class="im-primary im-resume" type="button">Resume</button><button class="im-ghost im-b-normal" type="button">Normal Mode</button><button class="im-ghost im-b-modes" type="button">Choose mode</button><button class="im-ghost im-b-view2" type="button">Third-person view</button></div>
</div></div>
<aside class="im-panel" aria-hidden="true" aria-labelledby="imPanelT"><div class="im-ph"><div class="im-eb"></div><h2 id="imPanelT"></h2><button class="im-x" type="button" aria-label="Close">✕</button></div><div class="im-pb"></div><div class="im-pf"></div></aside>
<div class="im-fade"></div>`;
  document.body.appendChild(root);
  const q=s=>root.querySelector(s);
  el={zone:q('.im-zone'),track:q('.im-track'),you:q('.im-you'),prompt:q('.im-prompt'),promptT:q('.im-prompt span'),help:q('.im-help'),
    hint:q('.im-hint'),toast:q('.im-toast'),start:q('.im-start'),menu:q('.im-menu'),list:q('.im-list'),panel:q('.im-panel'),pEb:q('.im-ph .im-eb'),pT:q('.im-ph h2'),pB:q('.im-pb'),pF:q('.im-pf'),fade:q('.im-fade'),joy:q('.im-joy'),knob:q('.im-joy i'),act:q('.im-act')};
  q('.im-go').addEventListener('click',()=>{lock();closeStart();});
  root.querySelectorAll('.im-b-normal').forEach(b=>b.addEventListener('click',goNormal));
  q('.im-b-modes').addEventListener('click',goModes);
  q('.im-resume').addEventListener('click',()=>{lock();closeMenu();});
  q('.im-b-st').addEventListener('click',()=>openMenu());
  q('.im-b-back').addEventListener('click',goModes);   // back to the mode chooser (Esc still opens the in-world menu)
  {const gc=cv(160,160),gg=gc.getContext('2d'),gi=gg.createImageData(160,160);for(let i=0;i<gi.data.length;i+=4){const v=Math.random()*255|0;gi.data[i]=gi.data[i+1]=gi.data[i+2]=v;gi.data[i+3]=255;}gg.putImageData(gi,0,0);q('.im-film .gr').style.backgroundImage=`url(${gc.toDataURL()})`;}
  q('.im-b-view').addEventListener('click',()=>setView(view==='first'?'third':'first',true));
  q('.im-b-view2').addEventListener('click',()=>{setView(view==='first'?'third':'first',true);lock();closeMenu();});
  q('.im-x').addEventListener('click',()=>{closePanel();lock();});
  el.act.addEventListener('click',()=>{if(state==='ride')skipRide();else if(target)activate(target);});
  el.menu.addEventListener('click',e=>{if(e.target===el.menu){lock();closeMenu();}});
}
const STOP_ICONS={"start": "<path d=\"M3.5 11.5 12 4.5l8.5 7\"/><path d=\"M6 10v9.5h12V10\"/><path d=\"M10 19.5v-5h4v5\"/>", "arivihan": "<path d=\"M4 5.5h16v10.5H10l-4.5 3.5V16H4z\"/><path d=\"M10 9.4a2 2 0 1 1 2.9 1.8c-.6.3-.9.7-.9 1.3\"/><path d=\"M12 14.2v.1\"/>", "peakmind": "<path d=\"M2.5 19.5 9 8.5l4 6.5 2.5-3.5 6 8z\"/><circle cx=\"17\" cy=\"6\" r=\"2\"/>", "edme": "<path d=\"M12 3.2 5 6v5.6c0 4.1 2.9 7.6 7 9.2 4.1-1.6 7-5.1 7-9.2V6z\"/><path d=\"m8.9 12 2.2 2.2 4-4.2\"/>", "works": "<rect x=\"3.8\" y=\"3.8\" width=\"7\" height=\"7\" rx=\"1.6\"/><rect x=\"13.2\" y=\"3.8\" width=\"7\" height=\"7\" rx=\"1.6\"/><rect x=\"3.8\" y=\"13.2\" width=\"7\" height=\"7\" rx=\"1.6\"/><path d=\"m14.6 13.8 5 3-5 3z\"/>", "connect": "<path d=\"M21 3.5 3 10.8l7.2 2.6 2.6 7.1z\"/><path d=\"M10.2 13.4 21 3.5\"/>"};
let navOn=null;
function buildNav(){
  const all=zones;
  all.forEach((z,i)=>{const b=document.createElement('button');b.type='button';b.className='im-stop';b.style.setProperty('--c',z.accent||'#fff');b.dataset.tip=(z.num?z.num+' · ':'')+z.name;
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${STOP_ICONS[z.id]||STOP_ICONS.start}</svg><span class="nm">${esc(z.name)}</span>`;b.setAttribute('aria-label','Go to '+z.name);
    b.addEventListener('click',()=>{lock();travelTo(z.id);});el.track.appendChild(b);z.dot=b;
    const m=document.createElement('button');m.type='button';m.style.setProperty('--c',z.accent||'#ffd65a');m.innerHTML=`<span class="n">${esc(z.num||'·')}</span><span class="t"><b>${esc(z.name)}</b><small>${esc(z.blurb||'')}</small></span><span class="go">${i<9?'Press '+(i+1):''}</span>`;
    m.addEventListener('click',()=>{lock();travelTo(z.id);});el.list.appendChild(m);z.item=m;});}
function setView(v,announce){view=v;try{localStorage.setItem('imm-view',v);}catch(e){}root.classList.toggle('third',v==='third');
  const l=root.querySelector('.im-view-l');if(l)l.textContent=v==='third'?'3rd person':'1st person';const b=root.querySelector('.im-b-view2');if(b)b.textContent=v==='third'?'First-person view':'Third-person view';
  if(announce)toast(v==='third'?'Third-person view':'First-person view');}
let toastT=0;function toast(msg){el.toast.textContent=msg;el.toast.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.toast.classList.remove('on'),2200);}
let helpT=0;function help(on){el.help.classList.toggle('off',!on);clearTimeout(helpT);if(on)helpT=setTimeout(()=>el.help.classList.add('off'),16000);}

// ===================== info panel =====================
function openPanel(id,focus){const d=content().find(s=>s.id===id);if(!d)return;panelId=id;
  el.panel.style.setProperty('--ac',d.accent||'#19b3a1');el.pEb.textContent=`STATION ${d.num||''} · ${(d.kicker||'').toUpperCase()}`;el.pT.textContent=d.name;
  const sec=(k,t,body,cls)=>`<section class="im-sec ${cls||''}" data-s="${k}"><h3>${t}</h3>${body}</section>`;
  let h=d.summary?`<p class="im-sum">${esc(d.summary)}</p>`:'';
  const meta=[['MY ROLE',d.role],['DURATION',d.duration],['PLATFORM',d.platform]].filter(m=>m[1]);
  if(meta.length)h+=`<div class="im-meta">${meta.map(m=>`<div><small>${m[0]}</small><b>${esc(m[1])}</b></div>`).join('')}</div>`;
  if(d.outcomes&&d.outcomes.length)h+=sec('outcomes','OUTCOMES',`<div class="im-stats">${d.outcomes.map(o=>`<div class="im-stat"><b>${esc(o.value)}</b><span>${esc(o.label)}</span></div>`).join('')}</div>`);
  if(d.challenges&&d.challenges.length)h+=sec('challenges','KEY CHALLENGES',`<ul class="im-ul">${d.challenges.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`);
  if(d.decisions&&d.decisions.length)h+=sec('decisions','KEY DESIGN DECISIONS',`<ol class="im-ul num">${d.decisions.map(c=>`<li>${esc(c)}</li>`).join('')}</ol>`);
  if(d.works&&d.works.length)h+=sec('works','COLLECTIONS',`<div class="im-works">${d.works.map(w=>`<button type="button" class="im-work" data-k="${esc(w.key)}" style="--c:${esc(w.color||d.accent)}"><b>${esc(w.label)}</b><span>${esc(w.desc||'')}</span><i>Open →</i></button>`).join('')}</div>`);
  if(!(d.outcomes&&d.outcomes.length)&&!(d.decisions&&d.decisions.length)&&!(d.works&&d.works.length))h+=`<div class="im-soon">The full story of this project is on its way. Meanwhile, say hello at the Connect station at the end of the path.</div>`;
  el.pB.innerHTML=h;el.pB.scrollTop=0;el.pB.querySelectorAll('.im-work').forEach(b=>b.addEventListener('click',()=>openWorks(b.dataset.k)));
  const pf=PF_(),proj=pf&&d.project!=null?pf.projects[d.project]:null;
  el.pF.innerHTML='';el.pF.hidden=!proj;
  if(proj){const a=document.createElement('button');a.type='button';a.className='im-primary';a.textContent='View case study →';a.addEventListener('click',()=>openSlides(d.project,a));el.pF.appendChild(a);
    if(proj.link){const b=document.createElement('button');b.type='button';b.className='im-ghost';b.textContent='Open prototype ↗';b.addEventListener('click',()=>openLink(proj.link,'the prototype'));el.pF.appendChild(b);}}
  unlock(true);setState('panel');el.panel.classList.add('on');el.panel.setAttribute('aria-hidden','false');
  if(focus){const s=el.pB.querySelector(`[data-s="${focus}"]`);if(s){s.classList.add('hl');setTimeout(()=>el.pB.scrollTo({top:s.offsetTop-12,behavior:'smooth'}),350);}}
  setTimeout(()=>root.querySelector('.im-x').focus({preventScroll:true}),60);}
function closePanel(silent){if(!el.panel.classList.contains('on'))return;el.panel.classList.remove('on');el.panel.setAttribute('aria-hidden','true');panelId=null;if(!silent)setState('play');}
function openMenu(){if(state==='off'||state==='intro')return;closePanel(true);unlock(true);
  zones.forEach(z=>z.item&&z.item.classList.toggle('on',z===curZone));setState('menu');el.menu.classList.add('on');setTimeout(()=>{const f=el.list.querySelector('.on')||el.list.querySelector('button');if(f)f.focus({preventScroll:true});},60);}
function closeMenu(silent){if(!el.menu.classList.contains('on'))return;el.menu.classList.remove('on');if(!silent)setState(ride?'ride':'play');}
function openStart(resume){el.start.querySelector('h2').textContent=resume?'Welcome back':'Walk through my work';el.start.querySelector('.im-go').textContent=resume?'Resume exploring':'Start exploring';setState('start');el.start.classList.add('on');setTimeout(()=>el.start.querySelector('.im-go').focus({preventScroll:true}),80);}
function closeStart(){el.start.classList.remove('on');setState('play');help(true);}
function setState(s){state=s;root.classList.toggle('ui-off',s==='intro'||s==='start');updateHint();}
function goNormal(){closePanel(true);closeMenu(true);el.start.classList.remove('on');if(cb.onNormal)cb.onNormal();}
function goModes(){pause();if(cb.onModes)cb.onModes();}

// ===================== input =====================
const keys={};let locked=false,expectUnlock=false,lockOK=!TOUCH&&!!(Element.prototype.requestPointerLock);
function lock(){if(!lockOK||!canvas||locked)return;try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(e){}}
function unlock(expected){if(document.pointerLockElement===canvas){expectUnlock=!!expected;document.exitPointerLock();}}
function updateHint(){if(!el.hint)return;const show=active&&(state==='play'||state==='ride')&&!TOUCH&&!locked;el.hint.textContent=lockOK?'Click to look around':'Drag to look around';el.hint.classList.toggle('on',show);}
const viewerOpen=()=>{const pf=PF_();return!!(pf&&pf.viewerOpen&&pf.viewerOpen());};
function onKey(e,down){if(!active||viewerOpen()||(down&&e.defaultPrevented))return;const c=e.code;
  const map={KeyW:'f',ArrowUp:'f',KeyS:'b',ArrowDown:'b',KeyA:'l',KeyD:'r',ArrowLeft:'tl',ArrowRight:'tr',ShiftLeft:'run',ShiftRight:'run'};
  if(map[c]){keys[map[c]]=down;if(state==='play'){e.preventDefault();}return;}
  if(!down)return;
  if(c==='Escape'){if(state==='panel'){e.preventDefault();closePanel();}else if(state==='menu'){e.preventDefault();closeMenu();}else if(state==='play'||state==='ride'){e.preventDefault();openMenu();}return;}
  if(state==='start'&&(c==='Enter'||c==='Space')){e.preventDefault();lock();closeStart();return;}
  if(state==='panel'||state==='menu'){if(c==='KeyM'&&state==='menu'){closeMenu();lock();}return;}
  if(state==='ride'){if(c==='KeyE'||c==='Enter'||c==='Space'){e.preventDefault();skipRide();}else if(c==='KeyB'){e.preventDefault();goModes();}else if(c==='KeyM'){e.preventDefault();openMenu();}else if(c==='KeyV'){setView(view==='first'?'third':'first',true);}
    else if(/^Digit[1-9]$/.test(c)){const z=zones[+c.slice(5)-1];if(z)travelTo(z.id);}return;}
  if(state!=='play')return;
  if(c==='KeyE'||c==='Enter'||c==='Space'){e.preventDefault();if(target)activate(target);}
  else if(c==='KeyM'){e.preventDefault();openMenu();}
  else if(c==='KeyB'){e.preventDefault();goModes();}
  else if(c==='KeyH'){help(el.help.classList.contains('off'));}
  else if(c==='KeyV'){setView(view==='first'?'third':'first',true);}
  else if(/^Digit[1-9]$/.test(c)){const z=zones[+c.slice(5)-1];if(z)travelTo(z.id);}}
addEventListener('keydown',e=>onKey(e,true));addEventListener('keyup',e=>onKey(e,false));
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
document.addEventListener('pointerlockchange',()=>{const was=locked;locked=document.pointerLockElement===canvas;if(was&&!locked&&active&&(state==='play'||state==='ride')&&!expectUnlock)openMenu();expectUnlock=false;updateHint();});
document.addEventListener('pointerlockerror',()=>{lockOK=false;updateHint();});
let drag=null;const joy={x:0,y:0,id:null};
function look(dx,dy,k){P.yaw-=dx*k;P.pitch=clamp(P.pitch-dy*k,-1.35,1.35);}
function bindPointer(){
  canvas.addEventListener('mousemove',e=>{if(state!=='play'&&state!=='ride')return;if(locked)look(e.movementX,e.movementY,.0022);});
  canvas.addEventListener('pointerdown',e=>{if(!active)return;
    if(e.pointerType==='mouse'){if(state==='panel'){closePanel();lock();return;}if(state!=='play'&&state!=='ride')return;if(locked){if(state==='play'&&target&&e.button===0)activate(target);return;}if(lockOK){lock();return;}drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);return;}
    if(state!=='play'&&state!=='ride')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,t:performance.now()};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||(state!=='play'&&state!=='ride'))return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);look(dx,dy,e.pointerType==='mouse'?.004:.006);});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;if(e.pointerType!=='mouse'&&drag.moved<10&&target&&performance.now()-drag.t<350)activate(target);drag=null;};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  const J=el.joy,R=46;
  const setJ=e=>{const r=J.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}joy.x=dx/R;joy.y=-dy/R;el.knob.style.transform=`translate(${dx}px,${dy}px)`;};
  J.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();joy.id=e.pointerId;J.setPointerCapture(e.pointerId);setJ(e);});
  J.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)setJ(e);});
  const jEnd=e=>{if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;el.knob.style.transform='';};
  J.addEventListener('pointerup',jEnd);J.addEventListener('pointercancel',jEnd);}
function activate(it){if(!it||!it.act)return;help(false);it.act(it);}

// ===================== movement, collision, travel =====================
function collide(nx,nz,ox,oz){let x=nx,z=oz;
  for(const s of solids)if(x+RAD>s[0]&&x-RAD<s[2]&&z+RAD>s[1]&&z-RAD<s[3]){if(ox+RAD<=s[0]+1e-3)x=s[0]-RAD-1e-3;else if(ox-RAD>=s[2]-1e-3)x=s[2]+RAD+1e-3;else x=ox;}
  z=nz;for(const s of solids)if(x+RAD>s[0]&&x-RAD<s[2]&&z+RAD>s[1]&&z-RAD<s[3]){if(oz+RAD<=s[1]+1e-3)z=s[1]-RAD-1e-3;else if(oz-RAD>=s[3]-1e-3)z=s[3]+RAD+1e-3;else z=oz;}
  return[x,z];}
function move(dt){
  if(keys.tl)P.yaw+=2.1*dt;if(keys.tr)P.yaw-=2.1*dt;
  let f=(keys.f?1:0)-(keys.b?1:0)+joy.y,s=(keys.r?1:0)-(keys.l?1:0)+joy.x;const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}
  if(P.stop>0){P.stop-=dt;f=s=0;}
  const sp=(keys.run||Math.hypot(joy.x,joy.y)>.96?7.4:4.5),fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  const tvx=(fx*f+rx*s)*sp,tvz=(fz*f+rz*s)*sp,a=1-Math.exp(-dt*(len>.05?9:11));P.vx+=(tvx-P.vx)*a;P.vz+=(tvz-P.vz)*a;
  const ox=P.x,oz=P.z,[x,z]=collide(P.x+P.vx*dt,P.z+P.vz*dt,ox,oz);P.x=x;P.z=z;
  P.speed=Math.hypot(x-ox,z-oz)/Math.max(dt,1e-4);if(P.speed<.05){P.vx*=.5;P.vz*=.5;}P.bob+=dt*P.speed*2.1;}
function travelTo(id){const z=zones.find(q=>q.id===id);if(!z||state==='intro')return;closePanel(true);closeMenu(true);el.start.classList.remove('on');
  const wasRiding=!!ride;if(ride)dropRide();
  const to=z.spawn,dist=Math.hypot(to.x-P.x,to.z-P.z),far=dist>70||wasRiding;
  travel={zone:z,t:0,to,far,stage:far?'out':'glide',from:{x:P.x,z:P.z,yaw:P.yaw,pitch:P.pitch},dur:clamp(dist/26,.7,2.4)};
  if(travel.far){el.fade.style.transition='opacity .35s ease';el.fade.classList.remove('off');}
  setState('travel');}
function stepTravel(dt){const tr=travel;tr.t+=dt;
  if(tr.stage==='out'){if(tr.t>=.38){const back=14;tr.from={x:tr.to.x*.3,z:tr.to.z+back,yaw:0,pitch:-.04};P.x=tr.from.x;P.z=tr.from.z;P.yaw=0;P.pitch=-.04;tr.stage='glide';tr.t=0;tr.dur=1.25;el.fade.classList.add('off');}return;}
  const u=sm(tr.t/tr.dur),f=tr.from,to=tr.to;P.x=lerp(f.x,to.x,u);P.z=lerp(f.z,to.z,u);
  const head=Math.abs(to.x-f.x)+Math.abs(to.z-f.z)>.5?Math.atan2(-(to.x-f.x),-(to.z-f.z)):to.yaw;
  P.yaw=u<.55?angLerp(f.yaw,head,sm(u/.55)):angLerp(head,to.yaw,sm((u-.55)/.45));P.pitch=lerp(f.pitch,to.pitch==null?-.06:to.pitch,u);P.bob+=dt*9*Math.sin(Math.PI*u);
  cam.fov=baseFov()+(REDUCE?0:9*Math.sin(Math.PI*u));cam.updateProjectionMatrix();
  if(tr.t>=tr.dur){cam.fov=baseFov();cam.updateProjectionMatrix();P.vx=P.vz=0;travel=null;setState('play');lastZone=null;}}
// ---- rides: sit in a cart that follows a curve (world.js supplies the curve, the cart and where you step out) ----
const _rp=new V3(),_rt=new V3();
function setLook(c){c=!!c;if(c&&!RT)RT=buildRT();CINE=c;VIEW=c?(LOW?110:130):95;
  for(const u of TEXUSE){const rt=RT&&RT[u.k];if(!rt)continue;if(!u.orig)u.orig=u.m.map;let t=u.orig;
    if(c){if(u.rep){if(!u.rt){u.rt=rt.clone();u.rt.needsUpdate=true;u.rt.repeat.copy(u.orig.repeat);}u.rt.offset.copy(u.m.map.offset);t=u.rt;}else t=rt;}
    else if(u.rep)u.orig.offset.copy(u.m.map.offset);
    u.m.map=t;u.m.needsUpdate=true;}
  if(renderer){renderer.toneMapping=c?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;renderer.toneMappingExposure=c?.98:1;
    scene.traverse(o=>{const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.needsUpdate=true);});
    const ms=c&&!LOW?4096:(LOW?1024:2048);if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
    const sc=sun.shadow.camera,e=c?46:34;sc.left=-e;sc.right=e;sc.top=e;sc.bottom=-e;sc.updateProjectionMatrix();
    if(!ride&&!travel){cam.fov=baseFov();cam.updateProjectionMatrix();}}
  if(root){root.classList.toggle('cine',c);const px=root.querySelector('.im-brand .px');if(px)px.textContent=c?'IMMERSIVE 3D MODE':'IMMERSIVE MODE';
    const eb=root.querySelector('.im-start .im-eb');if(eb)eb.textContent=c?'IMMERSIVE 3D MODE':'IMMERSIVE MODE';const b=root.querySelector('.im-b-cine');if(b)b.textContent=c?'Cinematic look: on':'Cinematic look: off';}
  for(const f of LOOKS)f(c);}
function startRide(o){if(ride||state==='off'||state==='intro'||state==='travel')return;closePanel(true);closeMenu(true);help(false);
  ride={o,L:o.curve.getLength(),s:o.s0,dir:o.s1>=o.s0?1:-1,v:0,t:0,phase:'board',on:false,yaw:null,pitch:0,y:0};
  el.fade.style.transition='opacity .3s ease';el.fade.classList.remove('off');setState('ride');
  target=null;root.classList.remove('target');el.promptT.innerHTML='Skip the ride <span class="im-dim">· hold <b>Shift</b> to go faster</span>';el.prompt.classList.add('on');
  el.act.textContent='SKIP';el.act.classList.add('on');el.zone.textContent=o.label||'On the line';root.classList.add('riding');}
function poseRide(){const r=ride,o=r.o,u=clamp(r.s/r.L,0,1);o.curve.getPointAt(u,_rp);o.curve.getTangentAt(u,_rt);if(r.dir<0)_rt.multiplyScalar(-1);
  const yaw=Math.atan2(-_rt.x,-_rt.z),pitch=Math.asin(clamp(_rt.y,-1,1));
  if(r.yaw!=null)P.yaw+=Math.atan2(Math.sin(yaw-r.yaw),Math.cos(yaw-r.yaw));
  r.yaw=yaw;r.pitch=pitch;r.y=_rp.y;P.x=_rp.x;P.z=_rp.z;o.cart.position.copy(_rp);o.cart.rotation.set(pitch,yaw,0,'YXZ');}
function stepRide(dt){const r=ride;r.t+=dt;
  if(r.phase==='board'){if(r.t>=.32){r.on=true;r.yaw=null;poseRide();P.yaw=r.yaw;P.pitch=-.12;P.vx=P.vz=0;P.speed=0;el.fade.classList.add('off');r.phase='go';r.t=0;if(r.o.depart)toast(r.o.depart);}return;}
  if(r.phase==='go'){const rem=Math.abs(r.o.s1-r.s);
    if(r.t>.6){const br=r.o.brake||6.5,ac=r.o.acc||6.5,vmax=(r.o.vmax||24)*(keys.run?1.5:1),tgt=Math.min(vmax,Math.sqrt(2*br*rem)+1);r.v+=clamp(tgt-r.v,-(br+8)*dt,(keys.run?ac*1.6:ac)*dt);}
    const step=Math.min(rem,r.v*dt);r.s+=r.dir*step;poseRide();
    if(rem-step<=.001){r.phase='stop';r.t=0;r.v=0;}return;}
  if(r.phase==='stop'&&r.t<.6)return;
  if(!r.fading){r.fading=true;r.ft=0;el.fade.style.transition='opacity .3s ease';el.fade.classList.remove('off');}
  r.ft+=dt;if(r.ft>=.34)finishRide();}
function skipRide(){if(!ride||ride.phase==='board'||ride.fading)return;ride.phase='skip';ride.t=0;}
function rideUI(off){cam.fov=baseFov();cam.updateProjectionMatrix();if(off){el.prompt.classList.remove('on');el.act.classList.remove('on');root.classList.remove('riding');}target=null;root.classList.remove('target');curZone=undefined;}
function finishRide(){const r=ride;if(!r)return;if(r.on){r.s=r.o.s1;poseRide();}const ex=r.o.exit;P.x=ex.x;P.z=ex.z;P.yaw=ex.yaw||0;P.pitch=-.05;P.vx=P.vz=0;P.speed=0;
  ride=null;rideUI(true);if(r.o.onEnd)r.o.onEnd();el.fade.classList.add('off');lastZone=null;if(state==='ride'||state==='menu')setState('play');if(r.o.arrive)toast(r.o.arrive);}
function dropRide(){const r=ride;ride=null;rideUI(true);if(r&&r.o.onEnd)r.o.onEnd();}
const _cp=new V3(),_cl=new V3();
function rideCam(third){const r=ride,y=r.y,k=REDUCE?0:clamp(r.v/26,0,1.3),movie=CINE&&!REDUCE&&r.o.shots;
  if(movie){avatar.g.visible=true;third=true;}
  if(third){avatar.g.position.set(P.x,y,P.z);avatar.g.rotation.set(-r.pitch,r.yaw+Math.PI,0,'YXZ');avatar.body.position.y=-.34;
    if(avatar.legL){avatar.legL.rotation.x=-1.45;avatar.legR.rotation.x=-1.45;}avatar.armL.rotation.x=-.55;avatar.armR.rotation.x=-.55-.5*k*Math.max(0,Math.sin(T*1.1));
    const p=clamp(P.pitch-.3,-1.1,.6),dx=-Math.sin(P.yaw)*Math.cos(p),dy=Math.sin(p),dz=-Math.cos(P.yaw)*Math.cos(p),d=4.8;
    if(movie){const o=r.o,pr=clamp(Math.abs(r.s-o.s0)/Math.abs(o.s1-o.s0),0,1),sh=o.shots.find(q=>pr<=q.until)||o.shots[o.shots.length-1],fx=-Math.sin(r.yaw),fz=-Math.cos(r.yaw);
      if(sh.type==='chase'){const b=sh.back||6.5;_cp.set(P.x-fx*b,y+(sh.up||2.4)+Math.sin(T*29)*.02*k,P.z-fz*b);_cl.set(P.x+fx*14,y+(sh.look||.5),P.z+fz*14);}
      else{_cp.set(sh.pos[0],sh.pos[1],sh.pos[2]);if(sh.move){const f=clamp((pr-(sh.from||0))/((sh.until-(sh.from||0))||1),0,1);_cp.x+=sh.move[0]*f;_cp.y+=sh.move[1]*f;_cp.z+=sh.move[2]*f;}_cl.set(P.x,y+(sh.look==null?.9:sh.look),P.z);}
      cam.position.copy(_cp);cam.lookAt(_cl);const f=sh.fov||56;if(Math.abs(cam.fov-f)>.05){cam.fov=f;cam.updateProjectionMatrix();}return;}
    cam.position.set(P.x-dx*d,y+2.35-dy*d,P.z-dz*d);cam.rotation.set(p,P.yaw,0,'YXZ');}
  else{const sh=(Math.sin(T*37)*.011+Math.sin(T*23.7)*.007)*k,bx=Math.sin(r.yaw)*.42,bz=Math.cos(r.yaw)*.42;cam.position.set(P.x+bx,y+1.72+sh,P.z+bz);cam.rotation.set(P.pitch,P.yaw,Math.sin(T*1.3)*.005*k,'YXZ');}
  const f=baseFov()+(REDUCE?0:12*clamp(r.v/26,0,1));if(Math.abs(cam.fov-f)>.05){cam.fov=f;cam.updateProjectionMatrix();}}
function stepIntro(dt){const it=intro;it.t+=dt;const u=sm(it.t/it.dur);
  const a=it.a,b=it.b;P.x=lerp(a.x,b.x,u);P.z=lerp(a.z,b.z,u);it.y=lerp(a.y,P.eye,u);P.yaw=lerp(a.yaw,b.yaw,u);P.pitch=lerp(a.pitch,b.pitch,sm(u*1.1));
  if(it.t>=it.dur){intro=null;openStart(false);}}

// ===================== per-frame world update =====================
const _col=new THREE.Color();
function applyAmbience(){if(!amb.length)return;let i=0;while(i<amb.length-1&&P.z<amb[i+1].z)i++;const A=amb[i],B=amb[Math.min(i+1,amb.length-1)];const u=A===B?0:sm((A.z-P.z)/(A.z-B.z));
  const C=k=>_col.copy(A.c[k]).lerp(B.c[k],u);
  skyU.top.value.copy(C('top'));skyU.hor.value.copy(C('hor'));skyU.bot.value.copy(C('bot'));scene.fog.color.copy(C('fog'));scene.fog.near=lerp(A.near,B.near,u);scene.fog.far=lerp(A.far,B.far,u);
  hemi.color.copy(C('hs'));hemi.groundColor.copy(C('hg'));hemi.intensity=lerp(A.hi,B.hi,u);sun.color.copy(C('sc'));sun.intensity=lerp(A.si,B.si,u);
  skyU.sunDir.value.set(lerp(A.sd[0],B.sd[0],u),lerp(A.sd[1],B.sd[1],u),lerp(A.sd[2],B.sd[2],u)).normalize();skyU.sunCol.value.copy(sun.color);
  if(CINE){sun.intensity*=1.4;hemi.intensity*=.64;scene.fog.near*=.9;scene.fog.far*=LOW?1.25:1.7;skyU.top.value.lerp(_col.set('#2a6fd4'),.55);skyU.hor.value.lerp(_col.set('#e2ecf2'),.4);sun.color.lerp(_col.set('#ffd29a'),.3);}}
function update(dt){T+=dt;
  if(state==='intro')stepIntro(dt);else if(state==='travel')stepTravel(dt);else if(state==='play')move(dt);else if(state==='ride')stepRide(dt);
  // camera
  const walk=REDUCE?0:Math.min(1,P.speed/4.5),by=state==='intro'?intro?intro.y:P.eye:P.eye+Math.sin(P.bob*2)*.04*walk;
  const third=view==='third'&&state!=='intro'&&avatar;
  if(avatar)avatar.g.visible=!!third;
  if(ride&&ride.on)rideCam(third);
  else if(third){avatar.g.position.set(P.x,0,P.z);avatar.g.rotation.set(0,P.yaw+Math.PI,0);walkPose(avatar,P.bob*1.1,REDUCE?0:Math.min(1,P.speed/4.5));
    const p=clamp(P.pitch-.34,-1.1,.6),dx=-Math.sin(P.yaw)*Math.cos(p),dy=Math.sin(p),dz=-Math.cos(P.yaw)*Math.cos(p),tx=P.x,ty=2.15,tz=P.z;let dist=3.7;
    for(let s2=.5;s2<=3.7;s2+=.2){const cx=tx-dx*s2,cz=tz-dz*s2;if(solids.some(q=>q[2]-q[0]>1.2&&q[3]-q[1]>1.2&&cx>q[0]-.15&&cx<q[2]+.15&&cz>q[1]-.15&&cz<q[3]+.15)){dist=Math.max(.8,s2-.35);break;}}
    cam.position.set(tx-dx*dist,Math.max(.4,ty-dy*dist),tz-dz*dist);cam.rotation.set(p,P.yaw,0,'YXZ');}
  else{cam.position.set(P.x,by,P.z);cam.rotation.set(P.pitch,P.yaw,Math.sin(P.bob)*.006*walk,'YXZ');}
  // zones: title card + a short stop as you arrive at a station
  let z=null;for(const q of zones)if(P.z<=q.z0&&P.z>=q.z1){z=q;break;}
  if(z!==curZone&&!ride){curZone=z;el.zone.textContent=z?z.name:'On the path';
    if(z&&z!==lastZone&&z.station&&(state==='play'||state==='travel'))z.seen=T;if(z)lastZone=z;}
  if(zones.length>1){const n=zones.length-1;let u=P.z>=zones[0].z?0:1;for(let i=0;i<n;i++){const a=zones[i].z,b=zones[i+1].z;if(P.z<=a&&P.z>=b){u=(i+(a-P.z)/(a-b))/n;break;}}el.you.style.width=(u*100).toFixed(2)+'%';}
  {let nz=null,nd=1e9;for(const q of zones){const d=Math.abs(P.z-q.z);if(d<nd){nd=d;nz=q;}}if(nz!==navOn){navOn=nz;zones.forEach(q=>{if(q.dot){q.dot.classList.toggle('on',q===nz);if(q===nz)q.dot.setAttribute('aria-current','location');else q.dot.removeAttribute('aria-current');}});}}
  // chunk culling + animations
  for(const c of chunks){const d=P.z<c.z0?c.z0-P.z:P.z>c.z1?P.z-c.z1:0;const v=d<VIEW;if(v!==c.vis){c.vis=v;c.group.visible=v;}if(v)for(const f of c.anims)f(T,dt);}
  for(const f of always)f(T,dt);
  for(const v of videos)if(v.want&&!v.chunk.vis)v.pause();
  for(const s of screens)if(s.chunk.vis&&T>=s.next){s.next=T+s.step;s.draw(s.g,T,s.w,s.h);s.t.needsUpdate=true;}
  // interaction target
  let best=null,bs=1e9;if(state==='play'){const hx=-Math.sin(P.yaw),hz=-Math.cos(P.yaw);
    for(const it of items){if(!it.chunk.vis)continue;const dx=it.x-P.x,dz=it.z-P.z,d=Math.hypot(dx,dz);if(d>it.r)continue;const fd=(dx*hx+dz*hz)/(d||1);if(d>1.2&&fd<.74)continue;const sc=d*(2-fd);if(sc<bs){bs=sc;best=it;}}}
  if(best!==target){target=best;root.classList.toggle('target',!!best);el.prompt.classList.toggle('on',!!best);el.act.classList.toggle('on',!!best);
    if(best){el.promptT.innerHTML=`${esc(best.verb)} <b>${esc(best.label)}</b>`;el.act.textContent=best.short||best.verb.toUpperCase().slice(0,7);}}
  for(const it of items){if(!it.m||!it.chunk.vis)continue;const on=it===target;it.m.position.y=it.my0+Math.sin(T*2.2+it.x)*.08;it.m.rotation.y=T*1.6;const s=lerp(it.m.scale.x,on?1.5:1,.15);it.m.scale.setScalar(s);it.h.material.opacity=on?.95:.55+.15*Math.sin(T*3+it.z);}
  // environment
  applyAmbience();
  sky.position.copy(cam.position);
  const sd=skyU.sunDir.value,sx=Math.round(P.x),sz=Math.round(P.z);sun.target.position.set(sx,0,sz-6);sun.position.set(sx+sd.x*90,sd.y*90,sz-6+sd.z*90);sun.target.updateMatrixWorld();
  if(dust){const a=dust.geometry.attributes.position,arr=a.array;for(let i=0;i<arr.length;i+=3){arr[i]+=Math.sin(T*.3+i)*.004;arr[i+1]+=.02*dt*(1+(i%7));arr[i+2]+=Math.cos(T*.27+i)*.004;
    let dx=arr[i]-P.x,dz=arr[i+2]-P.z;if(dx>16)arr[i]-=32;else if(dx<-16)arr[i]+=32;if(dz>16)arr[i+2]-=32;else if(dz<-16)arr[i+2]+=32;if(arr[i+1]>7)arr[i+1]=.2;}a.needsUpdate=true;}
}
let manual=false;   // debug: frames are stepped by hand (used to record the chooser's preview clip)
function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(manual||document.hidden||viewerOpen())return;update(dt);renderer.render(scene,cam);}
function resize(){if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}

// ===================== build =====================
function build(){
  buildDOM();
  renderer=new THREE.WebGLRenderer({antialias:!LOW,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,LOW?1.25:1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  canvas=renderer.domElement;canvas.className='im-cv';canvas.tabIndex=0;canvas.setAttribute('aria-label','Immersive portfolio world');root.insertBefore(canvas,root.firstChild);
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#e8dcc6',30,110);
  cam=new THREE.PerspectiveCamera(70,1,.05,900);
  skyU={top:{value:new THREE.Color('#5a9be3')},hor:{value:new THREE.Color('#f1dcc2')},bot:{value:new THREE.Color('#bba98a')},sunDir:{value:new V3(.5,.6,.6).normalize()},sunCol:{value:new THREE.Color('#fff0d0')}};
  sky=new THREE.Mesh(new THREE.SphereGeometry(500,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 bot;uniform vec3 sunDir;uniform vec3 sunCol;varying vec3 vP;void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=h>0.0?mix(hor,top,pow(clamp(h,0.0,1.0),0.5)):mix(hor,bot,clamp(-h*4.0,0.0,1.0));float s=max(dot(d,sunDir),0.0);c+=sunCol*(smoothstep(0.9993,0.9997,s)*1.2+pow(s,32.0)*0.22+pow(s,5.0)*0.1);gl_FragColor=vec4(c,1.0);}'}));
  sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
  hemi=new THREE.HemisphereLight('#e7f0ff','#7a6a4c',.8);scene.add(hemi);
  sun=new THREE.DirectionalLight('#fff0d6',.95);sun.castShadow=true;sun.shadow.mapSize.set(LOW?1024:2048,LOW?1024:2048);
  const sc=sun.shadow.camera;sc.left=-34;sc.right=34;sc.top=34;sc.bottom=-34;sc.near=1;sc.far=220;sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;scene.add(sun);scene.add(sun.target);
  // floating dust motes
  const n=LOW?120:240,pa=new Float32Array(n*3);for(let i=0;i<n;i++){pa[i*3]=(rnd()-.5)*32;pa[i*3+1]=rnd()*7;pa[i*3+2]=10+(rnd()-.5)*32;}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(pa,3));
  dust=new THREE.Points(dg,new THREE.PointsMaterial({color:'#fff1c8',size:.045,transparent:true,opacity:.55,depthWrite:false}));dust.frustumCulled=false;scene.add(dust);
  // world
  const K={THREE,scene,rnd,pick,clamp,lerp,sm,Merge,MAT,TX,chunk,blk,cube,lit,plane,floor,tiled,solid,solidBox,anim,always:f=>always.push(f),screen,picture,video,sign,woodSign,darkSign,fit,HF,PF,person,walkPose,tree,flower,tuft,bush,interact,zone,ambience,
    openPanel,openSlides,openLink,openMail,openWorks,toast,goNormal,player:P,BASE,LOCAL_FILE:LOCAL,startRide,floors:FLOORS,solids,onLook:f=>LOOKS.push(f),rt:k=>{if(!RT)RT=buildRT();return RT[k];},get cine(){return CINE;},get riding(){return!!ride;},get state(){return state;},get group(){return CH.group;},get t(){return T;}};
  if(typeof window.IMM_WORLD!=='function')throw new Error('world.js missing');
  window.IMM_WORLD(K);
  for(const c of chunks)flush(c);
  fontsReady.then(()=>signDraws.forEach(d=>d()));
  CH=chunks[0];avatar=person({parent:scene,shirt:'#3a6bd8',sleeve:'#3a6bd8',pants:'#2e3446',shoe:'#f4f4f2',skin:'#c8916a',hair:'#1f150e',style:'short',pose:'stand'});
  const bp=new Merge();bp.box('#8a5a2a',0,1.12,-.27,.44,.52,.22);bp.box('#6b4423',0,1.36,-.27,.46,.08,.24);bp.box('#5a3a1e',-.16,1.12,-.16,.04,.5,.04);bp.box('#5a3a1e',.16,1.12,-.16,.04,.5,.04);avatar.body.add(bp.mesh());avatar.g.visible=false;
  setView(view,false);
  buildNav();bindPointer();
  addEventListener('resize',resize);resize();
  built=true;}

// ===================== lifecycle =====================
function placeAt(z){const s=z.spawn;P.x=s.x;P.z=s.z;P.yaw=s.yaw||0;P.pitch=s.pitch==null?-.04:s.pitch;P.vx=P.vz=0;curZone=null;lastZone=z;}
function pause(){active=false;cancelAnimationFrame(raf);raf=0;unlock(true);for(const k in keys)keys[k]=false;for(const v of videos)v.pause();}
const IMM=window.IMM={
  enter(opts){opts=opts||{};cb=opts;
    try{if(!built)build();if(!CINE)setLook(opts.cinematic!==false);}catch(e){return Promise.reject(e);}
    root.hidden=false;active=true;last=performance.now();if(!raf)raf=requestAnimationFrame(frame);
    const st=opts.station&&zones.find(z=>z.id===opts.station);
    if(first){first=false;el.fade.classList.remove('off');
      if(st){placeAt(st);setTimeout(()=>{el.fade.classList.add('off');openStart(false);},120);}
      else{const sp=zones[0].spawn;placeAt(zones[0]);intro={t:0,dur:REDUCE?.01:3.6,a:{x:sp.x,z:sp.z+26,y:20,yaw:sp.yaw,pitch:-.5},b:{x:sp.x,z:sp.z,yaw:sp.yaw,pitch:-.03},y:20};setState('intro');setTimeout(()=>el.fade.classList.add('off'),120);}}
    else{if(st)placeAt(st);openStart(true);}
    updateHint();
    return new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>res())));},
  leave(){if(!root)return;if(ride)finishRide();pause();closePanel(true);closeMenu(true);el.start.classList.remove('on');root.hidden=true;state='off';},
  travelTo,
  debug:()=>({P,cam,scene,renderer,collide,videos,solids,items,closeStart,openPanel,openMenu,help,zones,state:()=>state,ride:()=>ride,skipRide,chunks,setLook,keys,setView,
    manual:on=>{manual=!!on;},step:(dt,draw)=>{update(dt);if(draw!==false)renderer.render(scene,cam);}})
};
})();
