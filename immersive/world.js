/* =====================================================================
   IMMERSIVE MODE — the world
   One path (toward -z) through six areas:
   Welcome → 01 Arivihan → 02 Peakmind → 03 EDME → (cart ride across the canyon) → 04 Other Works → Let's Connect
   Each station is one function below. To add a station: write a builder,
   give it a centre on the path, register a zone, and add its panel copy
   to content.js.
   ===================================================================== */
window.IMM_WORLD=function(K){'use strict';
const {THREE,rnd,pick,blk,cube,lit,plane,floor,tiled,solid,solidBox,anim,screen,sign,woodSign,darkSign,fit,HF,PF,person,walkPose,tree,flower,tuft,bush,interact,zone,ambience,chunk,Merge,MAT}=K;
const PI=Math.PI,HP=PI/2,sin=Math.sin,cos=Math.cos;
const C={start:6,arivihan:-34,peakmind:-92,edme:-150,works:-432,connect:-492};
const EA=-186,EB=-386;
const TUNZ=-305,TZ0=TUNZ+11,TZ1=TUNZ-12;   // the rock pillar the cart tunnels through, mid-canyon   // the canyon between the projects (land A) and the far side (land B)
const XW=25.5,ZMAX=26,CLIFF=C.connect-15;
const AC={start:'#ffd65a',arivihan:'#19b3a1',peakmind:'#5fb36a',edme:'#f0a01c',works:'#b07cff',connect:'#ff7a59'};
const PFo=()=>window.PORTFOLIO||{};
const UNI={shirt:'#f4f4ee',over:'#2f5fba',pants:'#2f5fba'};

// ---------- small helpers ----------
// local frame: (lx,lz) relative to an origin, rotated by ry (local +z = the way things face)
function F(ox,oz,ry){const c=cos(ry),s=sin(ry),W=(lx,lz)=>[ox+lx*c+lz*s,oz-lx*s+lz*c],sw=Math.abs(Math.round(s))===1;
  return{W,ry,
    cube:(col,lx,y,lz,sx,sy,sz,r,rx,rz)=>{const[x,z]=W(lx,lz);cube(col,x,y,z,sx,sy,sz,ry+(r||0),rx,rz);},
    lit:(col,lx,y,lz,sx,sy,sz,r,rx)=>{const[x,z]=W(lx,lz);lit(col,x,y,z,sx,sy,sz,ry+(r||0),rx);},
    blk:(t,lx,y,lz,sx,sy,sz)=>{const[x,z]=W(lx,lz);blk(t,x,y,z,sx,sy,sz,ry);},
    plane:(m,w,h,lx,y,lz,r,rx,o)=>{const[x,z]=W(lx,lz);return plane(m,w,h,x,y,z,ry+(r||0),rx,o);},
    person:(o,lx,lz,r)=>{const[x,z]=W(lx,lz);return person(Object.assign({},o,{x,z,ry:ry+(r||0)}));},
    solid:(lx,lz,w,d)=>{const[x,z]=W(lx,lz);solid(x,z,sw?d:w,sw?w:d);}};}
const box=(color,basic)=>new THREE.Mesh(new THREE.BoxGeometry(1,1,1),basic?new THREE.MeshBasicMaterial({color}):new THREE.MeshLambertMaterial({color}));
function bulb(color,x,y,z,s,parent){const m=box(color,true);m.scale.setScalar(s);m.position.set(x,y,z);(parent||K.group).add(m);return m;}
function grp(x,y,z,parent){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);(parent||K.group).add(g);return g;}
function addM(m,parent,glow){const mesh=m.mesh(glow?MAT.glow:MAT.vc,!glow);(parent||K.group).add(mesh);return mesh;}
function slab(color,x,y,z,sx,sy,sz){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);m.receiveShadow=true;K.group.add(m);return m;}
function spr(draw,w,h,scale,x,y,z,parent){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(scale*w/h,scale,1);s.position.set(x,y,z);(parent||K.group).add(s);return s;}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function wrap(g,txt,max){const out=[];let line='';for(const w of txt.split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>max&&line){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out;}
const SYS='system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
function lantern(x,y,z,hang){if(hang)cube('#2b2420',x,y+.5,z,.05,.5,.05);cube('#2b2420',x,y+.24,z,.36,.08,.36);cube('#2b2420',x,y-.22,z,.36,.08,.36);for(const a of[-.15,.15])for(const b of[-.15,.15])cube('#2b2420',x+a,y,z+b,.05,.4,.05);lit('#ffcf6a',x,y,z,.24,.32,.24);}
function lamppost(x,z){cube('#2b2420',x,1.5,z,.16,3,.16);cube('#2b2420',x,.1,z,.4,.2,.4);cube('#2b2420',x+.32,2.95,z,.7,.08,.08);lantern(x+.62,2.6,z,true);solid(x,z,.4,.4);}
function bench(x,z,ry){const f=F(x,z,ry);f.cube('#9a6a3a',0,.45,0,1.8,.08,.45);f.cube('#9a6a3a',0,.75,-.2,1.8,.32,.06);for(const a of[-.75,.75]){f.cube('#3a3f48',a,.22,0,.07,.44,.42);f.cube('#3a3f48',a,.6,-.2,.07,.4,.07);}f.solid(0,0,1.9,.6);}
function rock(x,z,s){s=s||1;blk('stone',x,.3*s,z,1.2*s,.6*s,s);blk('cobble',x+.3*s,.6*s,z-.1*s,.6*s,.4*s,.6*s);solid(x,z,1.2*s,s);}
function flowersAround(x0,z0,x1,z1,n){for(let i=0;i<n;i++){const x=x0+rnd()*(x1-x0),z=z0+rnd()*(z1-z0);if(rnd()<.55)flower(x,z);else tuft(x,z);}}
function fence(x0,z0,x1,z1,y){const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/1.5));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;cube('#9a6a3a',x,.55,z,.16,1.1,.16);}
  const mx=(x0+x1)/2,mz=(z0+z1)/2,len=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0);for(const h of[.45,.85])cube('#a8763f',mx,h,mz,.07,.09,len,ry);}
function windowedGlass(x,y,z,w,h,ry){plane(MAT.glass,w,h,x,y,z,ry,0);}
function gableRoof(xm,z0,z1,y0,hw0,steps,mat,end){const dy=.62;for(let k=0;k<steps;k++){const hw=hw0-k*(hw0/steps),hn=k+1<steps?hw0-(k+1)*(hw0/steps):-1,y=y0+k*dy+dy/2;
  for(let x=Math.ceil(xm-hw);x<=xm+hw;x++){const outer=Math.abs(x-xm)>hn;for(let z=z0;z<=z1;z++){if(outer||k===steps-1)blk('roof-'+mat,x,y,z,1,dy,1);else if(z===z0||z===z1)blk(end,x,y,z,1,dy,1);}}}}

// ---------- shared textures ----------
// the project billboard at the centre of each station: title, short description, metrics, and a "view case study" button
const STN=id=>((window.IMM_CONTENT&&window.IMM_CONTENT.stations)||[]).find(q=>q.id===id)||{};
function billboardTex(id,o){const d=STN(id),acc=o.accent;return sign({w:1024,h:640,draw(g,w,h){
  g.fillStyle=o.bg||'#12151c';g.fillRect(0,0,w,h);const gr=g.createRadialGradient(0,0,10,0,0,w);gr.addColorStop(0,acc+'50');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle=acc;g.fillRect(0,0,w,12);g.textBaseline='alphabetic';g.textAlign='left';
  g.font='20px '+PF;g.fillStyle=acc;g.fillText(`STATION ${d.num||''} · ${(d.kicker||'').toUpperCase()}`,56,70);
  fit(g,d.name||'',w-112,96,800,HF);g.fillStyle='#ffffff';g.fillText(d.name||'',52,166);
  g.font='500 29px '+SYS;g.fillStyle='rgba(255,255,255,.84)';const desc=d.short||String(d.summary||'').split('. ')[0];wrap(g,desc,w-112).slice(0,2).forEach((l,i)=>g.fillText(l,56,222+i*40));
  const top=292,th=172,gap=16;
  if(d.works&&d.works.length){const n=d.works.length,tw=(w-112-gap*(n-1))/n;d.works.forEach((x,i)=>{const tx=56+i*(tw+gap);rr(g,tx,top,tw,th,16);g.fillStyle=x.color+'33';g.fill();g.strokeStyle=x.color;g.lineWidth=3;g.stroke();g.fillStyle=x.color;g.fillRect(tx+20,top+24,40,40);g.fillStyle='#fff';g.font='800 30px '+HF;wrap(g,x.label,tw-40).slice(0,2).forEach((l,k)=>g.fillText(l,tx+20,top+108+k*34));});}
  else if(d.outcomes&&d.outcomes.length){const m=d.outcomes.slice(0,3),n=m.length,tw=(w-112-gap*(n-1))/n;m.forEach((x,i)=>{const tx=56+i*(tw+gap);rr(g,tx,top,tw,th,16);g.fillStyle=acc+'26';g.fill();g.strokeStyle=acc+'99';g.lineWidth=3;g.stroke();
      g.fillStyle=acc;fit(g,x.value,tw-40,n===1?96:68,800,HF);g.fillText(x.value,tx+22,top+(n===1?100:82));g.fillStyle='rgba(255,255,255,.86)';g.font='500 '+(n===1?28:23)+'px '+SYS;wrap(g,x.label,tw-44).slice(0,2).forEach((l,k)=>g.fillText(l,tx+22,top+(n===1?142:120)+k*28));});}
  const cta=o.cta||'VIEW CASE STUDY ▶';g.font='22px '+PF;const bw=g.measureText(cta).width+64;rr(g,56,h-122,bw,70,14);g.fillStyle=acc;g.fill();g.fillStyle='#0b0d12';g.fillText(cta,88,h-77);}});}
// a turning four-sided tower with one real product screen on each face, a ring of orbiting lights, and an Explore marker
// outline: colour of a thin frame round each screen, or leave it out for none
function screenTower(x,z,ac,names,label,act,outline){const holo=grp(x,0,z);blk('quartz',x,.3,z,1.8,.6,1.8);lit(ac,x,.62,z,1.9,.04,1.9);solid(x,z,1.9,1.9);
  const tw=new Merge();tw.box('#14171d',0,2.55,0,1.5,3.5,1.5);tw.box('#2b2f36',0,4.36,0,1.7,.1,1.7);tw.box('#2b2f36',0,.74,0,1.7,.1,1.7);holo.add(tw.mesh());
  const pics=names.map(n=>K.picture(n,300,650,{top:true,label}));   // 393×852 screens (786×1704 exports)
  const SW=1.31,SH=2.84,Y=2.55,T=.04,D=.766,edge=new Merge();
  pics.forEach((p,i)=>{const a=i*HP,ca=cos(a),sa=sin(a),at=(lx,lz)=>[lx*ca+lz*sa,-lx*sa+lz*ca];
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),new THREE.MeshBasicMaterial({map:p.tex,toneMapped:false}));const[px,pz]=at(0,.755);pl.position.set(px,Y,pz);pl.rotation.y=a;holo.add(pl);
    if(outline)for(const[lx,y,w,h]of[[0,Y+SH/2+T/2,SW+2*T,T],[0,Y-SH/2-T/2,SW+2*T,T],[-(SW/2+T/2),Y,T,SH],[SW/2+T/2,Y,T,SH]]){const[x,z]=at(lx,D);edge.box(outline,x,y,z,w,h,.012,a,0,0,true);}
    const bz=new Merge();const[bx,bzz]=at(0,.76);bz.box('#0b0d12',bx,4.24,bzz,.5,.07,.02,a);holo.add(bz.mesh());});
  if(!edge.empty)addM(edge,holo,true);
  let loaded=false;anim(()=>{if(!loaded){loaded=true;pics.forEach(p=>p.load());}});
  const orb=[];for(let i=0;i<8;i++)orb.push(bulb(i%2?ac:'#f4f6f8',x,1,z,.09));const ph=x*.37+z*.11;
  anim(t=>{holo.position.y=.12+.08*sin(t*1.4+ph);holo.rotation.y=t*.28+ph;orb.forEach((o,i)=>{const a=t*.9+i*PI/4+ph;o.position.set(x+cos(a)*1.25,1.3+.6*sin(t*1.3+i)+i*.25,z+sin(a)*1.25);});});
  interact({x:x-.8*Math.sign(x||1),z,y:2.3,my:4.75,r:4.2,verb:'Explore',label,color:ac,act});}
function kiosk(c,id,o){const z=c,acc=o.accent,post=o.post||'#2b2e36',W=4.2,H=2.62,Y=2.78;
  blk('stoneBrick',0,.25,z,W+.9,.5,1.3);cube(post,-(W/2+.13),1.78,z,.24,3.56,.24);cube(post,W/2+.13,1.78,z,.24,3.56,.24);
  cube(post,0,Y,z,W+.3,H+.3,.16);cube(o.cap||post,0,Y+H/2+.27,z,W+.7,.16,.55);lit(acc,0,Y-H/2-.22,z+.1,W,.06,.02);lit(acc,0,Y-H/2-.22,z-.1,W,.06,.02);
  plane(o.tex,W,H,0,Y,z+.085,0);plane(o.tex,W,H,0,Y,z-.085,PI);solid(0,z,W+1.1,1.4);
  interact({x:0,z:z+.3,y:1.7,my:Y+H/2+.7,r:4.8,verb:o.verb||'Explore',label:o.label||o.name,color:acc,act:o.act||(()=>K.openPanel(id))});}
function gateTex(name,num){return woodSign(name,{sub:num?'STATION '+num:'',icon:null});}
function lectureVideo(){return screen(256,160,(g,t,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1c2a44');gr.addColorStop(1,'#0e1626');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#e9efe6';g.fillRect(24,18,140,80);g.fillStyle='#2b4c3a';g.font='600 14px '+SYS;g.fillText('a² + b² = c²',38,48);g.strokeStyle='#2b4c3a';g.lineWidth=2;g.beginPath();g.moveTo(40,86);g.lineTo(120,86);g.lineTo(120,58);g.closePath();g.stroke();
  const sw=sin(t*1.3)*4;g.fillStyle='#f2c9a0';g.beginPath();g.arc(196+sw,52,13,0,7);g.fill();g.fillStyle='#14a094';g.fillRect(180+sw,66,32,46);g.fillStyle='#2e333c';g.fillRect(183+sw,112,26,28);
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,h-22,w,22);const p=(t*.04)%1;g.fillStyle='rgba(255,255,255,.3)';g.fillRect(10,h-12,w-20,3);g.fillStyle='#ff4d4d';g.fillRect(10,h-12,(w-20)*p,3);g.beginPath();g.arc(10+(w-20)*p,h-10.5,5,0,7);g.fill();},6);}

// ---------- reusable furniture ----------
function studentDesk(f,o){o=o||{};const lc=o.legs||'#3a3f48',ch=o.chair||'#2f5fba',dk=o.desk||'#c89a5e';
  f.cube(ch,0,.44,-.04,.5,.07,.48);f.cube(ch,0,.8,-.27,.5,.6,.06);for(const a of[-.2,.2])for(const b of[-.22,.18])f.cube(lc,a,.21,b,.05,.42,.05);
  f.cube(dk,0,.74,.66,1.1,.06,.56);for(const a of[-.5,.5])for(const b of[.44,.88])f.cube(lc,a,.36,b,.05,.72,.05);
  f.solid(0,.3,1.2,1.3);
  const p=f.person(Object.assign({pose:'sit'},o.p||{}),0,-.04);p.armL.rotation.x=p.armR.rotation.x=-.95;return p;}
function onDesk(f,kind,o){o=o||{};
  if(kind==='notebook'){f.cube('#f6f3ea',-.05,.775,.6,.34,.02,.26,.08);f.cube(pick(['#d8342a','#2e7ad8','#2fa848','#f09a12']),.3,.79,.68,.22,.05,.3,-.2);f.cube('#2b2b2b',.06,.79,.6,.02,.02,.16,.6);}
  if(kind==='book'){f.cube('#f6f3ea',-.12,.78,.6,.22,.03,.3);f.cube('#f1ede2',.12,.78,.6,.22,.03,.3);f.cube(pick(['#d8342a','#2e7ad8','#2fa848']),0,.77,.6,.48,.02,.32);}
  if(kind==='laptop'){f.cube('#c9ced6',0,.785,.62,.46,.025,.32);f.cube('#2b2f36',0,.95,.47,.46,.3,.02,0,-.18);f.plane(o.tex,.42,.26,0,.95,.457,PI,-.18,{basic:true});}
  if(kind==='sheet'){f.plane(o.tex,.3,.4,0,.778,.6,PI,-HP);f.cube('#e9b13c',.2,.79,.62,.02,.02,.18,.5);}
  if(kind==='tablet'){f.cube('#20232a',0,.78,.62,.42,.02,.3);f.plane(o.tex,.38,.26,0,.792,.62,PI,-HP,{basic:true});}}
function held(p,kind,tex){const m=new Merge();
  if(kind==='phone'){m.box('#1b1d22',0,1.12,.5,.17,.3,.03);p.armL.rotation.set(-1.15,0,.32);p.armR.rotation.set(-1.15,0,-.32);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.14,.25),new THREE.MeshBasicMaterial({map:tex}));pl.position.set(0,1.12,.483);pl.rotation.y=PI;p.body.add(pl);}
  if(kind==='book'){m.box('#2e7ad8',0,1.0,.42,.42,.04,.3,0,-.9);m.box('#f6f3ea',0,1.02,.42,.38,.04,.28,0,-.9);p.armL.rotation.set(-1.1,0,.3);p.armR.rotation.set(-1.1,0,-.3);}
  if(!m.empty)p.body.add(m.mesh());}

// ===================================================================
// GLOBAL: ground, path, rails, horizon, sky details
// ===================================================================
function buildGlobal(){
  chunk('world',ZMAX+80,C.connect-400);
  for(const[a,b]of[[ZMAX+60,EA],[EB,CLIFF]])floor('grassTop',-300,a,300,b,0,1);
  for(const[a,b]of[[ZMAX,EA],[EB,CLIFF+2]]){floor('path',-2.5,Math.min(a,ZMAX),2.5,b,.02,2);floor('stoneBrick',-2.9,Math.min(a,ZMAX),-2.5,b,.03,3);floor('stoneBrick',2.5,Math.min(a,ZMAX),2.9,b,.03,3);}
  // the end of the line: cliff and sea
  plane(tiled('stone',300,14),300,14,0,-7,CLIFF-.02,PI);
  const sea=tiled('water',220,120);sea.polygonOffset=false;plane(sea,900,500,0,-12,CLIFF-250,0,-HP);K.always((t,dt)=>{sea.map.offset.x=(sea.map.offset.x+dt*.03)%1;sea.map.offset.y=(sea.map.offset.y+dt*.01)%1;});
  // distant voxel mountains (pre-hazed colours, no fog so they read against the sky)
  const mm=new Merge(),mat=new THREE.MeshLambertMaterial({vertexColors:true,fog:false});
  const ridge=(cx,cz,lv,hw,b,ax)=>{for(let k=0;k<lv;k++){const w=hw*(1-k/lv)+(rnd()-.5)*b;const y=-2+k*b;for(let s=-w;s<=w;s+=b){const st=k>lv*.62,snow=k>lv*.84;const c=snow?'#eef1f4':st?pick(['#b3bfcc','#a9b6c4']):pick(['#9db7b4','#93afad','#a6c0bb']);if(ax==='x')mm.box(c,cx+s,y+b/2,cz+(rnd()-.5)*2,b,b,b);else mm.box(c,cx+(rnd()-.5)*2,y+b/2,cz+s,b,b,b);}}};
  for(let z=80;z>C.connect-80;z-=52){const o=z<EA+30&&z>EB-30?320:190;ridge(-o-rnd()*50,z+rnd()*20,7+(rnd()*5|0),30,5,'z');ridge(o+rnd()*50,z+rnd()*20,7+(rnd()*5|0),30,5,'z');}
  for(let x=-260;x<=260;x+=75)ridge(x,170+rnd()*40,7+(rnd()*4|0),34,5,'x');
  for(const x of[-210,-60,90,230])ridge(x,CLIFF-330-rnd()*60,6+(rnd()*3|0),30,5,'x');
  const mms=mm.mesh(mat,false);mms.receiveShadow=false;K.group.add(mms);K.onLook(c=>{mms.visible=!c;});
  // clouds
  const cm=new Merge();for(let i=0;i<70;i++){const cx=-160+rnd()*320,cz=ZMAX+40-rnd()*(ZMAX-C.connect+200),cy=48+rnd()*14,n=3+(rnd()*4|0);for(let k=0;k<n;k++){cm.box('#ffffff',cx+k*5,cy,cz,5,4,8+rnd()*6);if(rnd()<.6)cm.box('#ffffff',cx+k*5+2,cy+3,cz,5,3,6);}}
  const clouds=cm.mesh(new THREE.MeshBasicMaterial({vertexColors:true,fog:false,transparent:true,opacity:.92}),false);K.group.add(clouds);
  const cumulus=()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d'),bl=[];
    for(let i=0;i<22;i++){const x=34+rnd()*188,k=1-Math.abs(x-128)/150,r=12+rnd()*24*k,y=94-r*.55-rnd()*20*k;bl.push([x,y,r]);}
    for(const[x,y,r]of bl){const gr=g.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,'rgba(226,232,242,1)');gr.addColorStop(.86,'rgba(220,228,240,.95)');gr.addColorStop(1,'rgba(214,223,236,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    for(const[x,y,r]of bl){const gr=g.createRadialGradient(x-r*.25,y-r*.5,1,x-r*.1,y-r*.25,r*.88);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.68,'rgba(250,251,253,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y-r*.1,r*.88,0,7);g.fill();}
    g.globalCompositeOperation='destination-out';const fb=g.createLinearGradient(0,96,0,110);fb.addColorStop(0,'rgba(0,0,0,0)');fb.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fb;g.fillRect(0,96,256,32);g.globalCompositeOperation='source-over';
    return new THREE.CanvasTexture(c);};
  const puffs=[cumulus(),cumulus(),cumulus()],puff=puffs[0];
  // far horizon: a painted backdrop of snow-capped ranges (stepped, blocky silhouettes), like a film matte painting
  const range=()=>{const c=document.createElement('canvas');c.width=1024;c.height=320;const g=c.getContext('2d');
    const layer=(base,amp,peaks,col,shade,snow,haze)=>{const pts=[];let pk=[];for(let i=0;i<peaks;i++)pk.push([rnd()*1024,amp*(.45+.55*rnd()),60+rnd()*140]);
      for(let x=0;x<=1024;x+=8){let h=0;for(const[px,ph,pw]of pk)h=Math.max(h,ph*(1-Math.abs(x-px)/pw));h+=10*Math.sin(x*.05+base)+8*rnd();pts.push([x,Math.round((320-base-h)/6)*6]);}
      g.beginPath();g.moveTo(0,320);for(const[x,y]of pts){g.lineTo(x,y);g.lineTo(x+8,y);}g.lineTo(1024,320);g.closePath();
      const gr=g.createLinearGradient(0,320-base-amp,0,320);gr.addColorStop(0,col);gr.addColorStop(1,haze);g.fillStyle=gr;g.fill();
      if(snow)for(const[x,y]of pts){const top=320-base-amp*.62;if(y<top){g.fillStyle=snow;g.fillRect(x,y,8,Math.min(top-y+6,40));}}};
    layer(150,150,5,'#a9bccd','','rgba(246,248,251,.95)','rgba(214,226,236,.0)');
    layer(105,120,6,'#7f93a8','','rgba(238,242,247,.97)','rgba(200,214,226,.0)');
    layer(60,70,7,'#5f7486','',null,'rgba(190,205,215,.0)');
    const t=new THREE.CanvasTexture(c);return t;};
  const bd=new THREE.Group();bd.visible=false;K.group.add(bd);const tex3=[range(),range(),range()];
  const panel=(x,z,ry,w)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3125),new THREE.MeshBasicMaterial({map:pick(tex3),transparent:true,depthWrite:false,fog:false}));m.position.set(x,w*.3125/2-30,z);m.rotation.y=ry;m.renderOrder=-5;bd.add(m);};
  for(let z=ZMAX+200;z>CLIFF-300;z-=560){panel(-470,z,HP,620);panel(470,z,-HP,620);}
  panel(0,ZMAX+560,PI,1100);panel(0,CLIFF-620,0,1100);
  K.onLook(c=>{bd.visible=c;});
  const soft=new THREE.Group();soft.visible=false;K.group.add(soft);for(let i=0;i<30;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:pick(puffs),transparent:true,depthWrite:false,fog:false,opacity:.97}));const w=50+rnd()*70;sp.scale.set(w*(rnd()<.5?-1:1),w*.48,1);sp.position.set(-220+rnd()*440,70+rnd()*40,ZMAX+40-rnd()*(ZMAX-C.connect+220));soft.add(sp);}
  K.onLook(c=>{clouds.visible=!c;soft.visible=c;});K.always(t=>{soft.position.x=sin(t*.02)*25;});K.always(t=>{clouds.position.x=sin(t*.02)*25;});
  // world bounds
  solidBox(-XW-3,ZMAX,-XW,CLIFF-2);solidBox(XW,ZMAX,XW+3,CLIFF-2);solidBox(-XW,ZMAX,XW,ZMAX+3);solidBox(-XW,CLIFF+.5,XW,CLIFF-4);solidBox(-XW,EA+.6,XW,EB-.6);
}

// segment scenery: hedges, outer forest and lamps for one stretch of the path
function scenery(zA,zB,skip){
  for(let z=Math.floor(zA);z>zB;z--){blk('hedge',-XW,.7,z,1,1.4,1);blk('hedge',XW,.7,z,1,1.4,1);}
  for(let z=zA-2;z>zB;z-=4.5+rnd()*2){tree(-(28+rnd()*4|0),Math.round(z),pick(['oak','spruce','birch','oak']),4+(rnd()*2|0),2);tree(28+rnd()*4|0,Math.round(z-2),pick(['oak','spruce','birch','oak']),4+(rnd()*2|0),2);}
  for(let z=zA-6;z>zB;z-=7+rnd()*3){tree(-(35+rnd()*4|0),Math.round(z),pick(['spruce','oak']),5,2);tree(35+rnd()*4|0,Math.round(z),pick(['spruce','oak']),5,2);}
  for(let z=zA-3;z>zB;z-=12){if(skip&&skip.some(([a,b])=>z<a&&z>b))continue;lamppost(-3.5,z);}}
// the stretch between two stations
function gap(zA,zB,nextName,nextNum){
  const mid=(zA+zB)/2;
  for(let i=0;i<7;i++){const s=rnd()<.5?-1:1,x=s*(7+rnd()*15),z=zA-2-rnd()*(zA-zB-4);tree(Math.round(x),Math.round(z),pick(['oak','birch','oak','cherry']),4+(rnd()*2|0),2);}
  flowersAround(-24,zA,-3.4,zB,40);flowersAround(5.6,zA,24,zB,40);
  for(let i=0;i<3;i++)rock((rnd()<.5?-1:1)*(8+rnd()*14),zA-3-rnd()*(zA-zB-6),.7+rnd()*.6);
  bench(-4.6,mid+3,HP);bush(-5,mid-1,1.1);bush(-5.2,mid+6,.9);
  // signpost to the next station
  const t=woodSign(nextName,{sub:nextNum?'STATION '+nextNum+' AHEAD':'AHEAD'});cube('#6b4423',-3.6,1.2,mid-6,.16,2.4,.16);cube('#3b2414',-3.6,2.05,mid-6,1.9,.55,.06);plane(t,1.8,.45,-3.6,2.05,mid-6+.035,0);solid(-3.6,mid-6,.3,.3);}

// ===================================================================
// WELCOME
// ===================================================================
function buildStart(){
  const c=C.start;chunk('start',ZMAX+40,-14);
  scenery(ZMAX,-14);
  // welcome arch
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('stoneBrick',x,y+.5,c-4);solid(x,c-4,1,1);}
  blk('darkOak',0,5.4,c-4,7.6,.6,.8);
  const wt=woodSign('NISHANT J. DIXIT',{sub:'PRODUCT DESIGNER · AI PRODUCTS'});cube('#3b2414',0,4.2,c-4,5.2,1.35,.05);plane(wt,5,1.25,0,4.2,c-4+.03,0);plane(wt,5,1.25,0,4.2,c-4-.03,PI);
  for(const x of[-1.9,1.9])cube('#2b2420',x,4.95,c-4,.05,.25,.05);
  lantern(-3.2,5.95,c-4);lantern(3.2,5.95,c-4);
  // portal back to Normal Mode
  const px=-7.5,pz=c+4;for(let i=-2;i<=2;i++){blk('obsidian',px,.5,pz+i);blk('obsidian',px,5.5,pz+i);}for(let y=1;y<=4;y++){blk('obsidian',px,y+.5,pz-2);blk('obsidian',px,y+.5,pz+2);}
  const portal=screen(64,128,(g,t,w,h)=>{g.fillStyle='#4a12a8';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){const y=((i*37+t*40*(1+i%3))%h),x=(i*53+sin(t+i)*6)%w;g.fillStyle=i%2?'rgba(210,140,255,.75)':'rgba(30,0,80,.6)';g.fillRect(x|0,y|0,2+(i%3),5+(i%4));}},12);
  plane(portal,3,4,px+.02,3,pz,HP,0,{basic:true,double:true,transparent:true});solidBox(px-.5,pz-2.5,px+.5,pz+2.5);
  const ps=darkSign('NORMAL MODE',{sub:'STEP BACK ONTO THE RAILWAY',accent:'#b866ff',bg:'#1a1022'});plane(ps,3,.75,px+.55,6.5,pz,HP);cube('#120b18',px+.5,6.5,pz,.06,.85,3.1);
  interact({x:px+.8,z:pz,y:2.6,my:5,r:4,verb:'Switch to',label:'Normal Mode',color:'#c98cff',act:()=>K.goNormal()});
  // station board
  const board=sign({w:512,h:640,draw(g,w,h){g.fillStyle='#4e2a10';g.fillRect(0,0,w,h);g.fillStyle='#93562a';g.fillRect(14,14,w-28,h-28);g.fillStyle='#fbeccb';g.font='28px '+PF;g.textAlign='left';g.fillText('STATIONS',40,72);
    [['01','ARIVIHAN',AC.arivihan],['02','PEAKMIND',AC.peakmind],['03','EDME',AC.edme],['04','OTHER WORKS',AC.works],['∞',"LET'S CONNECT",AC.connect]].forEach(([n,s,col],i)=>{const y=140+i*98;g.fillStyle=col;g.fillRect(40,y-38,56,56);g.fillStyle='#1a1408';g.font='20px '+PF;g.textAlign='center';g.fillText(n,68,y-2);g.textAlign='left';g.fillStyle='#fbeccb';fit(g,s,330,40,800,HF);g.fillText(s,118,y);});
    g.font='16px '+PF;g.fillStyle='#f6d28a';g.fillText('PRESS M TO JUMP',40,h-40);}});
  cube('#6b4423',5.9,1.3,c-1,.16,2.6,.16);cube('#6b4423',8.1,1.3,c-1,.16,2.6,.16);cube('#3b2414',7,2,c-1,2.3,2.8,.08);plane(board,2.1,2.62,7,2,c-1+.05,0);solidBox(5.7,c-1.3,8.3,c-.7);
  // garden
  tree(-9,c+10,'oak',5,2);tree(10,c+12,'cherry',5,2);tree(-14,c-3,'birch',5,2);tree(14,c-6,'oak',4,2);tree(-18,c+8,'spruce',6,2);tree(19,c+4,'birch',5,2);
  flowersAround(-24,c+14,-3.5,c-12,60);flowersAround(5.6,c+14,24,c-12,60);bench(5.6,c+8,-HP);bench(-4.8,c-9,HP);rock(-12,c+3,1);rock(13,c-10,.8);
  for(let i=0;i<6;i++)bush(-20+i*1.3,c-11,.9+rnd()*.3);
  gap(-10,-22,'ARIVIHAN','01');
}

// ===================================================================
// 01 ARIVIHAN — a school with a live classroom (left) + a self-study library (right)
// ===================================================================
function buildArivihan(){
  const c=C.arivihan,ac=AC.arivihan;chunk('arivihan',-14,-62);
  scenery(-14,-62,[[c+12,c-12]]);
  floor('cobble',-5.5,c+7,5.5,c-7,.025,2);
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('stoneBrick',x,y+.5,c+10);solid(x,c+10,1,1);}blk('roof-teal',0,5.3,c+10,8,.6,1);
  const gt=gateTex('ARIVIHAN','01');cube('#3b2414',0,4.2,c+10,4.6,1.2,.05);plane(gt,4.4,1.1,0,4.2,c+10+.03,0);plane(gt,4.4,1.1,0,4.2,c+10-.03,PI);
  // ---------- info totem ----------
  kiosk(c,'arivihan',{name:'Arivihan',accent:ac,tex:billboardTex('arivihan',{accent:ac}),verb:'View',label:'the Arivihan case study',act:()=>K.openSlides(0)});

  // ---------- LIVE CLASSROOM (left) ----------
  const X0=-22,X1=-6,ZA=c-11,ZB=c+11;
  floor('oak',X0+.5,ZA+.5,X1-.5,ZB-.5,.035,3);
  for(let y=0;y<5;y++){const base=y===0?'brick':y===4?'quartz':'plaster';
    for(let z=ZA;z<=ZB;z++)blk((z===ZA||z===ZB)?'quartz':base,X0,y+.5,z);
    for(let x=X0+1;x<=X1;x++)for(const zz of[ZA,ZB]){const post=(x-X0)%4===0||x===X1;const win=!post&&y>=1&&y<=3;blk(post?'quartz':win?'glass':base,x,y+.5,zz);}
    for(let z=ZA+1;z<=ZB-1;z++){const door=Math.abs(z-c)<=2&&y<=3;if(door)continue;const post=Math.abs(z-c)===3||(z-ZA)%4===0;const win=!post&&y>=1&&y<=3&&Math.abs(z-c)>=4;blk(post?'quartz':win?'glass':base,X1,y+.5,z);}}
  solidBox(X0-.5,ZA-.5,X0+.5,ZB+.5);solidBox(X0-.5,ZA-.5,X1+.5,ZA+.5);solidBox(X0-.5,ZB-.5,X1+.5,ZB+.5);solidBox(X1-.5,ZA,X1+.5,c-2.5);solidBox(X1-.5,c+2.5,X1+.5,ZB);
  gableRoof(-14,ZA-1,ZB+1,5,9.5,6,'clay','plaster');
  plane(tiled('darkOak',16,22),16,22,-14,4.98,c,0,HP);
  for(const x of[-17,-13,-9])for(const z of[c-6,c,c+6])lit('#fff3d6',x,4.94,z,1.6,.04,.5);
  floor('path',-5.5,c+2,-2.9,c-2,.028,2);
  // school entrance porch: two columns, a sign, and a small clay-tiled gable over the door
  for(const z of[c-2.7,c+2.7]){blk('stoneBrick',-4.2,.2,z,.95,.4,.95);for(let y=0;y<4;y++)blk('quartz',-4.2,y+.9,z,.7,1,.7);solid(-4.2,z,.8,.8);}
  blk('quartz',-4.85,4.55,c,2.3,.7,6.9);
  const ls=darkSign('LIVE CLASSES',{accent:'#ff4d4d',sub:'● ON AIR NOW'});plane(ls,2.7,.67,-3.68,4.55,c,HP);
  const onair=bulb('#ff3b3b',-3.66,4.55,c+1.75,.18);
  for(let k=0;k<4;k++){const hw=3.5-k*.875,y=5.11+k*.42;if(k<3){for(const sg of[-1,1])blk('roof-clay',-4.85,y,c+sg*(hw-.44),2.5,.42,.88);plane(MAT.plaster,2*(hw-.88),.42,-3.68,y,c,HP);}else blk('roof-clay',-4.85,y,c,2.5,.42,1.8);}
  // a flag by the school
  cube('#d9dbe0',-5,3,c+8.2,.1,6,.1);cube('#b8bcc4',-5,6.05,c+8.2,.18,.1,.18);
  const flagT=sign({w:256,h:160,draw(g,w,h){g.fillStyle='#19b3a1';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();g.moveTo(128,52);g.lineTo(70,40);g.lineTo(70,112);g.lineTo(128,124);g.lineTo(186,112);g.lineTo(186,40);g.closePath();g.fill();g.fillStyle='#19b3a1';g.fillRect(126,52,4,72);}});
  const flag=grp(-5,5.45,c+8.2);const fpl=plane(flagT,1.3,.8,0,0,.68,HP,0,{parent:flag});fpl.material.side=THREE.DoubleSide;anim(t=>{flag.rotation.y=.35*sin(t*1.7)+.15*sin(t*4.3);});
  // blackboard
  const boardTx=screen(1024,320,(g,t,w,h)=>{g.fillStyle='#22382d';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<26;i++)g.fillRect((i*137)%w,(i*71)%h,70,24);
    const cyc=(t%20)/20;let left=Math.floor(cyc*20*16);g.fillStyle='#f3f1e6';g.textBaseline='middle';g.textAlign='left';
    for(const[s,y,f]of[['Live class · Laws of Motion',44,'700 40px'],['F = m × a',112,'600 50px'],['v = u + at',178,'600 50px'],['s = ut + ½at²',244,'600 50px']]){if(left<=0)break;g.font=f+' "Comic Sans MS","Chalkboard SE",cursive';g.fillText(s.slice(0,Math.min(s.length,left)),46,y);left-=s.length+5;}
    if(cyc>.6){const k=Math.min(1,(cyc-.6)/.2);g.strokeStyle='#f3f1e6';g.lineWidth=4;g.beginPath();g.moveTo(560,280);g.lineTo(560+380*k,280);g.lineTo(560+380*k,280-170*k);g.closePath();g.stroke();
      if(k>=1){g.save();g.translate(760,204);g.rotate(-Math.atan2(170,380));g.strokeRect(-36,-58,72,58);g.restore();g.beginPath();g.moveTo(752,186);g.lineTo(752,262);g.moveTo(742,250);g.lineTo(752,264);g.lineTo(762,250);g.stroke();g.font='600 30px "Comic Sans MS",cursive';g.fillText('mg',770,256);}}
    if(Math.floor(t*1.6)%2){g.fillStyle='#ff4d4d';g.beginPath();g.arc(w-118,40,10,0,7);g.fill();}g.fillStyle='#ff9a8a';g.font='700 26px '+SYS;g.fillText('LIVE',w-100,41);},5);
  cube('#3b2414',X0+.56,2.65,c,.1,3.1,9.5);plane(boardTx,9.1,2.84,X0+.63,2.65,c,HP,0,{basic:true});cube('#6b4423',X0+.7,1.1,c,.2,.08,9);
  interact({x:X0+1.4,z:c,y:2.6,my:4.4,r:5.4,verb:'View',label:'the Arivihan case study',act:()=>K.openSlides(0),color:ac});
  // wall clock + posters + live TV
  const clock=screen(128,128,(g)=>{const d=new Date(),w=128;g.clearRect(0,0,w,w);g.fillStyle='#fdfaf2';g.beginPath();g.arc(64,64,60,0,7);g.fill();g.lineWidth=6;g.strokeStyle='#2b2420';g.stroke();for(let i=0;i<12;i++){const a=i*PI/6;g.fillStyle='#2b2420';g.fillRect(64+sin(a)*48-2,64-cos(a)*48-2,4,4);}
    const hand=(a,l,wd)=>{g.lineWidth=wd;g.beginPath();g.moveTo(64,64);g.lineTo(64+sin(a)*l,64-cos(a)*l);g.stroke();};hand((d.getHours()%12+d.getMinutes()/60)*PI/6,28,6);hand(d.getMinutes()*PI/30,42,4);g.strokeStyle='#d8342a';hand(d.getSeconds()*PI/30,46,2);},1);
  plane(clock,.9,.9,X0+.62,4.35,c+6.2,HP,0,{transparent:true,basic:true});
  const periodic=sign({w:512,h:320,draw(g,w,h){g.fillStyle='#f7f3e8';g.fillRect(0,0,w,h);g.fillStyle='#2b2420';g.font='700 26px '+SYS;g.fillText('Periodic Table',20,36);const cols=['#ff8a80','#ffd180','#a7ffeb','#82b1ff','#b388ff','#ccff90'];for(let r=0;r<7;r++)for(let k=0;k<18;k++){if(r===0&&k>0&&k<17)continue;if(r<3&&k>1&&k<12&&r>0)continue;g.fillStyle=cols[(k+r)%6];g.fillRect(14+k*27,56+r*36,24,32);}}});
  plane(periodic,2.4,1.5,-16,2.8,ZA+.52,0);
  const atom=sign({w:256,h:320,draw(g,w,h){g.fillStyle='#2e6a42';g.fillRect(0,0,w,h);g.strokeStyle='#eef6e8';g.lineWidth=5;for(let k=0;k<3;k++){g.save();g.translate(128,150);g.rotate(k*PI/3);g.beginPath();g.ellipse(0,0,90,30,0,0,7);g.stroke();g.restore();}g.fillStyle='#ffc94a';g.beginPath();g.arc(128,150,16,0,7);g.fill();g.fillStyle='#eef6e8';g.font='700 26px '+SYS;g.textAlign='center';g.fillText('ATOMS',128,290);}});
  plane(atom,1.1,1.4,-11,2.8,ZA+.52,0);
  const tv=screen(512,288,(g,t,w,h)=>{g.fillStyle='#0d1422';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#27416b');gr.addColorStop(1,'#16243d');g.fillStyle=gr;g.fillRect(8,8,350,h-16);
    g.fillStyle='#22382d';g.fillRect(40,40,200,120);g.fillStyle='#f3f1e6';g.font='600 22px "Comic Sans MS",cursive';g.fillText('F = m × a',62,100);const sw=sin(t*.8)*14;g.fillStyle='#f2c9a0';g.beginPath();g.arc(282+sw,110,22,0,7);g.fill();g.fillStyle='#14a094';g.fillRect(256+sw,134,52,90);
    g.fillStyle='#ff3b3b';rr(g,18,18,86,30,6);g.fill();g.fillStyle='#fff';g.font='700 18px '+SYS;g.fillText('● LIVE',28,40);
    g.fillStyle='#111827';g.fillRect(366,8,138,h-16);const sc=(t*24)%60;for(let i=0;i<7;i++){const y=h-30-i*40+sc;if(y<14||y>h-20)continue;g.fillStyle=['#19b3a1','#ffd65a','#82b1ff','#ff8a80'][i%4];g.beginPath();g.arc(384,y,8,0,7);g.fill();g.fillStyle='rgba(255,255,255,.75)';rr(g,398,y-9,52+(i*29)%50,18,9);g.fill();}},6);
  cube('#15181e',-14,3.05,ZB-.56,4.2,2.4,.1);plane(tv,4,2.25,-14,3.05,ZB-.62,PI,0,{basic:true});
  for(let y=0;y<2;y++)for(const z of[c-9.4,c-8.4])blk('bookshelf',X0+1,y+.5,z);solidBox(X0+.5,c-10,X0+1.5,c-7.9);
  // teacher, desk and the class
  const tdF=F(-18.5,c+4.6,HP);tdF.cube('#8a5a2a',0,.76,0,1.8,.08,.7);for(const a of[-.8,.8])tdF.cube('#5a3a1e',a,.38,0,.08,.76,.6);tdF.cube('#c9ced6',.3,.81,0,.42,.02,.3);tdF.cube('#2b2f36',.3,.96,-.15,.42,.28,.02,0,-.2);tdF.cube('#f2efe6',-.5,.85,.1,.12,.14,.12);tdF.cube('#d8342a',-.2,.83,.15,.3,.06,.22);
  solidBox(-21.5,c-5.4,-17.9,c+5.6);
  const te=person({shirt:'#f2f2ee',scarf:'#14a094',pants:'#2e333c',shoe:'#2a2420',hair:'#24180f',glasses:true,style:'bun',pose:'walk',x:-19.8,z:c,ry:HP,skin:'#c8916a'});
  const ptr=new Merge();ptr.box('#7a4a22',0,-.95,.02,.04,.75,.04);te.armR.add(ptr.mesh());
  anim(t=>{const T=t%16;let z=c,ry=HP,ar=-.25,al=-.15,mv=0;
    if(T<4){const u=T/4;z=c-3+6*u;ry=HP*.55;mv=1;}else if(T<7.5){z=c+3;ry=-HP*.9;ar=-2.3+.15*sin(t*3);}else if(T<11.5){const u=(T-7.5)/4;z=c+3-6*u;ry=PI-HP*.55;mv=1;}else{z=c-3;ry=HP;ar=-1.3+.4*sin(t*2.2);al=-1.1+.3*sin(t*1.7+1);}
    te.g.position.z=z;te.g.rotation.y+=(ry-te.g.rotation.y)*.08;if(mv){walkPose(te,t*7,1);}else{walkPose(te,0,0);te.armR.rotation.x+=(ar-te.armR.rotation.x)*.1;te.armL.rotation.x+=(al-te.armL.rotation.x)*.1;}te.head.rotation.y=.2*sin(t*.6);});
  const kids=[];let k=0;
  for(const x of[-15.6,-12.6,-9.6])for(const z of[c-7.5,c-4,c+4,c+7.5]){const f=F(x,z,-HP);const girl=k%3===1;const p=studentDesk(f,{p:Object.assign({},UNI,{style:girl?pick(['long','pony']):'short',hair:pick(['#17110c','#24180f','#33200f'])})});onDesk(f,k%4===2?'book':'notebook');kids.push(p);k++;}
  const hand=kids[5],hand2=kids[10];
  anim(t=>{for(let i=0;i<kids.length;i++){const p=kids[i];p.head.rotation.x=.18+.08*sin(t*1.4+p.ph);p.head.rotation.y=.12*sin(t*.5+p.ph);p.armR.rotation.x=-.95+.07*sin(t*8+p.ph*3);}
    const T=t%10;hand.armL.rotation.x=T>2&&T<5?-2.95+.08*sin(t*9):-.95;const T2=(t+5)%12;hand2.armL.rotation.x=T2>3&&T2<5.5?-2.9:-.95;});
  // live-stream camera on a tripod
  const cam=grp(-8.6,0,c+8.6);cam.rotation.y=-2.2;const cmm=new Merge();for(const a of[0,2.1,4.2])cmm.box('#1b1d22',sin(a)*.25,.7,cos(a)*.25,.04,1.45,.04,0,cos(a)*.18,-sin(a)*.18);cmm.box('#1b1d22',0,1.45,0,.3,.24,.42);cmm.box('#0e0f12',0,1.45,.28,.16,.16,.16);cam.add(cmm.mesh());const tally=bulb('#ff3b3b',0,1.62,-.1,.06,cam);solid(-8.6,c+8.6,.8,.8);
  const ring=grp(-8.4,1.6,c+9.6);for(let i=0;i<10;i++){const a=i/10*PI*2;bulb('#fff8e8',0,sin(a)*.32,cos(a)*.32,.07,ring);}ring.rotation.y=-.6;
  anim(t=>{tally.visible=onair.visible=Math.floor(t*1.5)%2===0;});
  // ceiling fan
  const fan=grp(-12.5,4.7,c);const fm=new Merge();fm.box('#3a3f48',0,.15,0,.06,.3,.06);fm.box('#3a3f48',0,0,0,.24,.1,.24);for(let i=0;i<4;i++){const a=i*HP;fm.box('#8a5a2a',sin(a)*.55,-.02,cos(a)*.55,.18,.03,.8,a);}fan.add(fm.mesh());anim((t,dt)=>{fan.rotation.y+=dt*5;});
  for(const z of[c-3,c+3])bush(X1-1.2,z,.6,'leaves');
  // the school bell tower on the ridge, with clocks and a bell that rings now and then
  const BT=-14,BY=8.72;blk('plaster',BT,BY+.62,c,1.9,1.24,1.9);cube('#f2efe6',BT,BY+1.3,c,2.1,.12,2.1);for(const a of[-.8,.8])for(const b of[-.8,.8])cube('#f2efe6',BT+a,BY+1.95,c+b,.22,1.2,.22);cube('#f2efe6',BT,BY+2.6,c,2.1,.12,2.1);
  for(let k=0;k<4;k++){const sz2=2.2-k*.52;blk('roof-clay',BT,BY+2.82+k*.34,c,sz2,.34,sz2);}cube('#2b2420',BT,BY+4.6,c,.05,.8,.05);cube('#2b2420',BT+.18,BY+4.85,c,.36,.05,.05);
  plane(clock,.95,.95,BT+.96,BY+.62,c,HP,0,{transparent:true,basic:true});plane(clock,.95,.95,BT-.96,BY+.62,c,-HP,0,{transparent:true,basic:true});
  const bell=grp(BT,BY+2.45,c);const bm=new Merge();bm.box('#d9a42b',0,-.3,0,.44,.44,.44);bm.box('#c08a1e',0,-.56,0,.6,.12,.6);bm.box('#3a2a1a',0,-.02,0,.1,.12,.1);bell.add(bm.mesh());
  anim(t=>{const T=t%14;bell.rotation.z=T<2.5?.45*sin(T*7)*(1-T/2.5):0;});

  // ---------- SELF-LEARNING GARDEN (right) ----------
  // ---------- SELF-STUDY LIBRARY (right): stone walls, tall windows, a colonnade, a pediment and a copper dome ----------
  const SX0=6,SX1=23,LZA=c-11,LZB=c+11;floor('birch',SX0,LZB,SX1,LZA,.035,3);
  for(let y=0;y<5;y++){for(let z=LZA;z<=LZB;z++)blk(y===0?'stoneBrick':'quartz',SX1,y+.5,z);
    for(let x=SX0+1;x<SX1;x++)for(const zz of[LZA,LZB]){const pil=(x-SX0)%3===0;const win=!pil&&y>=1&&y<=3;blk(win?'glass':y===0?'stoneBrick':'quartz',x,y+.5,zz);}}
  solidBox(SX1-.5,LZA-.5,SX1+.5,LZB+.5);solidBox(SX0+.5,LZA-.5,SX1+.5,LZA+.5);solidBox(SX0+.5,LZB-.5,SX1+.5,LZB+.5);
  for(const z of[LZA,c-7.4,c-3.7,c+3.7,c+7.4,LZB]){blk('stoneBrick',SX0+.4,.2,z,1.1,.4,1.1);for(let y=0;y<4;y++)blk('quartz',SX0+.4,y+.9,z,.72,1,.72);blk('quartz',SX0+.4,4.75,z,1.05,.3,1.05);solid(SX0+.4,z,.9,.9);}
  blk('quartz',SX0+.4,5.35,c,1.2,.9,LZB-LZA+1.2);
  for(let k=0;k<4;k++){const hw=4.8-k*1.2;blk('quartz',SX0+.4,6.0+k*.42,c,1.1,.42,hw*2);blk('roof-teal',SX0+.3,6.2+k*.42,c,1.3,.08,hw*2+.3);}
  const libT=sign({w:1024,h:128,draw(g,w,h){g.fillStyle='#e9e4d8';g.fillRect(0,0,w,h);g.fillStyle='#cfc8b8';g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);g.textAlign='center';g.textBaseline='middle';g.font='600 70px Georgia,"Times New Roman",serif';g.fillStyle='#5a5246';g.fillText('L I B R A R Y',w/2,h/2+4);g.font='16px '+PF;g.fillStyle='#19b3a1';g.fillText('SELF STUDY',112,h/2+2);g.fillText('SELF STUDY',w-112,h/2+2);}});
  plane(libT,8,1,SX0-.22,5.35,c,-HP);
  const book=sign({w:256,h:256,draw(g,w,h){g.fillStyle='#e9e4d8';g.fillRect(0,0,w,h);g.fillStyle='#19b3a1';g.beginPath();g.moveTo(128,86);g.lineTo(52,66);g.lineTo(52,182);g.lineTo(128,202);g.lineTo(204,182);g.lineTo(204,66);g.closePath();g.fill();g.fillStyle='#e9e4d8';g.fillRect(125,86,6,116);}});
  plane(book,.9,.9,SX0-.17,6.45,c,-HP);
  slab('#ddd7ca',(SX0+SX1)/2+.3,5.82,c,SX1-SX0+1.2,.36,LZB-LZA+1.2);plane(tiled('oak',17,22),17,22,14.5,5.62,c,0,HP);
  const DX=15.5,DY=6;for(let a=0;a<30;a++){const t=a/30*PI*2;blk('quartz',DX+cos(t)*4.3,DY+.5,c+sin(t)*4.3,1,1,1);}
  for(let x=-5;x<=5;x++)for(let y=0;y<=5;y++)for(let z=-5;z<=5;z++){const d=Math.hypot(x,y*1.08,z);if(d<=4.6&&d>3.5)blk('roof-teal',DX+x,DY+1.5+y,c+z);}
  blk('quartz',DX,DY+7.1,c,.9,.9,.9);lit('#f2c23a',DX,DY+7.85,c,.4,.4,.4);
  for(const z of[c-7.4,c,c+7.4])lantern(10.5,4.5,z,true),lantern(18.5,4.5,z,true);
  for(let y=0;y<2;y++)for(let z=c-10;z<=c+10;z++)blk('bookshelf',22,y+.5,z);solidBox(21.4,c-11,23.4,c+11);
  for(let x=9;x<=17;x++)for(const z of[LZA+1,LZB-1])blk('bookshelf',x,.5,z);solidBox(8.5,LZA+.5,17.5,LZA+1.5);solidBox(8.5,LZB-1.5,17.5,LZB-.5);
  const vid=lectureVideo();
  const sheet=sign({w:256,h:340,draw(g,w,h){g.fillStyle='#fbfaf5';g.fillRect(0,0,w,h);g.fillStyle='#2b2420';g.font='700 20px '+SYS;g.fillText('Practice · Q1–Q6',16,34);for(let i=0;i<6;i++){const y=70+i*44;g.font='16px '+SYS;g.fillStyle='#555';g.fillText((i+1)+'.',16,y+6);for(let k=0;k<4;k++){g.strokeStyle='#888';g.lineWidth=2;g.beginPath();g.arc(70+k*42,y,11,0,7);g.stroke();if(k===(i*3+1)%4&&i<4){g.fillStyle='#2b2420';g.beginPath();g.arc(70+k*42,y,8,0,7);g.fill();}}}}});
  const notes=sign({w:256,h:180,draw(g,w,h){g.fillStyle='#fffdf6';g.fillRect(0,0,w,h);g.fillStyle='#19b3a1';g.fillRect(0,0,w,26);g.fillStyle='#fff';g.font='700 16px '+SYS;g.fillText('My notes · Optics',10,19);g.strokeStyle='#cfd8e3';for(let y=46;y<h;y+=22){g.beginPath();g.moveTo(10,y);g.lineTo(w-10,y);g.stroke();}g.fillStyle='#2b2420';g.font='15px "Comic Sans MS",cursive';['Refraction: light bends','n = c / v','Lens: 1/f = 1/v − 1/u'].forEach((s,i)=>g.fillText(s,12,42+i*22));}});
  const pods=[[13,c-6.8,'phone'],[13,c,'laptop'],[13,c+6.8,'sheet'],[18.6,c-6.8,'book'],[18.6,c,'tablet'],[18.6,c+6.8,'notes']];
  const learners=[];
  pods.forEach(([x,z,kind],i)=>{const f=F(x,z,x<15?HP:-HP);f.cube('#d7c39a',-.82,.7,.5,.06,1.4,1.4);f.cube('#d7c39a',.82,.7,.5,.06,1.4,1.4);
    const p=studentDesk(f,{chair:'#19b3a1',desk:'#e7d6b0',p:Object.assign({},UNI,{style:i%2?'long':'short',earphones:kind==='phone'||kind==='laptop'})});
    f.cube('#2b2420',.42,.95,.86,.04,.4,.04);f.lit('#ffe7a8',.42,1.15,.78,.14,.08,.14);
    if(kind==='phone')held(p,'phone',vid);
    else if(kind==='laptop')onDesk(f,'laptop',{tex:vid});
    else if(kind==='sheet')onDesk(f,'sheet',{tex:sheet});
    else if(kind==='book')onDesk(f,'book');
    else if(kind==='tablet')onDesk(f,'tablet',{tex:notes});
    else{onDesk(f,'notebook');f.cube('#1b1d22',-.25,.88,.72,.14,.26,.02,0,-.3);f.plane(vid,.12,.22,-.25,.88,.708,PI,-.3,{basic:true});}
    p.kind=kind;learners.push(p);});
  const ticks=learners[2];const tick=spr((g,w,h)=>{g.fillStyle='#19b3a1';g.beginPath();g.arc(32,32,30,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=8;g.beginPath();g.moveTo(17,33);g.lineTo(28,44);g.lineTo(47,22);g.stroke();},64,64,.32,13.8,1.9,c+6.8);
  anim(t=>{for(const p of learners){p.head.rotation.x=p.kind==='phone'?.05:.32+.05*sin(t*1.1+p.ph);if(p.kind==='sheet'||p.kind==='notes')p.armR.rotation.x=-.95+.1*sin(t*9+p.ph);if(p.kind==='book'&&Math.floor(t/6+p.ph)%2)p.head.rotation.y=.15*sin(t*2);}
    const T=t%4;tick.visible=T<1.4;tick.position.y=1.9+T*.25;tick.material.opacity=1-T/1.4;});
  // bean-bag corner
  for(const [z,col] of[[c-9.2,'#ff8a5b'],[c+9.2,'#7c6cff']]){cube('#e7dcc6',20,.04,z,2.4,.04,1.8);cube(col,20,.32,z,1.1,.6,1.1);cube(col,20.2,.55,z,.8,.5,.9);const p=person(Object.assign({},UNI,{pose:'cross',base:.46,x:20,z,ry:-HP,style:z<c?'long':'short'}));held(p,'phone',vid);solid(20,z,1.4,1.4);learners.push(Object.assign(p,{kind:'phone'}));}
  // AI Ask Doubt: a slowly turning tower with a real screen on each side
  screenTower(8.9,c,ac,['../../img/screens/arivihan-1.webp','../../img/screens/arivihan-2.webp','../../img/screens/arivihan-3.webp','../../img/screens/arivihan-4.webp'],'the AI Ask Doubt redesign',()=>K.openPanel('arivihan','decisions'),'#000000');
  // garden dressing
  gap(-48,-76,'PEAKMIND','02');bush(5.2,c+10,1);bush(5.2,c-10,1);flowersAround(5.6,c+14,24,c+11.6,16);flowersAround(-24,c-11.6,-3.4,c-16,16);
}

// ===================================================================
// 02 PEAKMIND — wellness forest: a meditation class + three students in their own nooks
// ===================================================================
function buildPeakmind(){
  const c=C.peakmind,ac=AC.peakmind;chunk('peakmind',-62,-120);
  scenery(-62,-120,[[c+12,c-12]]);
  floor('moss',-25,c+11,25,c-20,.012,1);floor('path',-2.5,c+11,2.5,c-20,.02,2);
  floor('cobble',-5.5,c+7,5.5,c-7,.025,2);
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('spruceLog',x,y+.5,c+10);solid(x,c+10,1,1);}blk('roof-spruce',0,5.3,c+10,8,.6,1);for(let i=-4;i<=4;i++)blk('leaves',i,5.75,c+10,1,.5,1.2);
  const gt=gateTex('PEAKMIND','02');cube('#3b2414',0,4.2,c+10,4.6,1.2,.05);plane(gt,4.4,1.1,0,4.2,c+10+.03,0);plane(gt,4.4,1.1,0,4.2,c+10-.03,PI);
  // stream with a footbridge
  const wz=c+13;const water=tiled('water',50,2.4,3);plane(water,50,2.4,0,.04,wz,0,-HP);anim((t,dt)=>{water.map.offset.x=(water.map.offset.x+dt*.18)%1;});
  for(let x=-25;x<=25;x++){if(Math.abs(x)<3)continue;blk('stone',x,.12,wz-1.45,1,.24,.5);blk('stone',x,.12,wz+1.45,1,.24,.5);if(rnd()<.18)cube('#3c8a2e',x+rnd()*.6,.07,wz+(rnd()-.5)*1.6,.5,.03,.5);}
  solidBox(-XW,wz-1.4,-2.75,wz+1.4);solidBox(2.75,wz-1.4,XW,wz+1.4);
  floor('spruce',-2.75,wz+1.7,2.75,wz-1.7,.09,4);for(const x of[-2.65,2.65]){for(let z=wz-1.6;z<=wz+1.61;z+=.8)cube('#6b4423',x,.55,z,.12,.9,.12);cube('#8a5a2a',x,.95,wz,.1,.1,3.4);}
  // info totem: a tree-stump stand with a wooden board
  screenTower(4.6,c-4.5,ac,['../../img/screens/peakmind-1.webp?v=2','../../img/screens/peakmind-2.webp?v=2','../../img/screens/peakmind-3.webp?v=2','../../img/screens/peakmind-4.webp?v=2'],'the Peakoo and Peakmind app redesign',()=>K.openPanel('peakmind','decisions'));
  kiosk(c,'peakmind',{name:'Peakmind',accent:ac,post:'#5a3a1e',cap:'#3c7a32',tex:billboardTex('peakmind',{accent:ac,bg:'#13201a'}),verb:'View',label:'the Peakmind case study',act:()=>K.openSlides(1)});
  // ---------- MEDITATION CLASS (left): an open timber pavilion, a teacher and nine students ----------
  const PX0=-21,PX1=-7,PZA=c-15,PZB=c+5;floor('spruce',PX0,PZB,PX1,PZA,.2,4);
  for(const [a,b,w,d] of[[-14,PZB,14.2,.2],[-14,PZA,14.2,.2],[PX0,c-5,.2,20.2],[PX1,c-5,.2,20.2]])cube('#5a3a1e',a,.1,b,w,.2,d);
  for(const x of[PX0,PX1])for(const z of[PZA,c-5,PZB]){cube('#5a3a1e',x,1.95,z,.36,3.7,.36);solid(x,z,.5,.5);}
  gableRoof(-14,PZA-1,PZB+1,3.8,8,4,'darkOak','spruce');plane(tiled('spruce',14,20),14,20,-14,3.78,c-5,0,HP);
  const ms=darkSign('MEDITATION CLASS',{accent:ac,bg:'#13201a',sub:'BREATHE · FOCUS · RESET'});cube('#13201a',PX1+.25,3.25,c-5,.06,1.15,4.6);plane(ms,4.4,1.1,PX1+.3,3.25,c-5,HP);
  // teacher on a low platform, a screen behind, a glowing lotus and candles in front
  cube('#7a5230',-14,.35,c-12.6,2.2,.3,1.6);solid(-14,c-12.6,2.4,1.8);
  cube('#efe9dc',-14,1.55,c-14.4,5.6,2.7,.12);for(let i=-2;i<=2;i++)cube('#5a3a1e',-14+i*1.1,1.55,c-14.33,.05,2.7,.04);for(const y of[.6,1.5,2.4])cube('#5a3a1e',-14,y,c-14.33,5.6,.05,.04);solidBox(-16.9,c-14.6,-11.1,c-14.2);
  const teacher=person({pose:'cross',base:.52,x:-14,z:c-12.6,ry:0,closed:true,shirt:'#f4efe4',pants:'#5a6a5a',style:'bun',hair:'#2a1b12'});
  const orbM=new THREE.Mesh(new THREE.IcosahedronGeometry(.26,1),new THREE.MeshBasicMaterial({color:'#bff3c4'}));orbM.position.set(-14,1.2,c-11.2);K.group.add(orbM);
  const lotus=new Merge();for(let i=0;i<8;i++){const a=i*PI/4;lotus.box('#f6b6cf',-14+sin(a)*.3,.3,c-11.2+cos(a)*.3,.15,.08,.32,a,.4);}lotus.box('#ffe27a',-14,.3,c-11.2,.16,.1,.16);addM(lotus,null,true);
  for(const x of[-15.6,-12.4]){cube('#c9a46a',x,.26,c-11.6,.3,.12,.3);lit('#ffd27a',x,.42,c-11.6,.08,.18,.08);}
  const smoke=[0,1,2].map(i=>spr((g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);r.addColorStop(0,'rgba(240,240,240,.55)');r.addColorStop(1,'rgba(240,240,240,0)');g.fillStyle=r;g.fillRect(0,0,w,h);},64,64,.4,-15.6,.6,c-11.6));
  const mats=['#7c6cff','#ff8a80','#82b1ff','#ffd180','#a7ffeb','#f6b6cf','#b388ff','#ccff90','#ffab91'];const students=[];let si=0;
  for(const z of[c-8.6,c-5.2,c-1.8])for(const x of[-17,-14,-11]){cube(mats[si],x,.23,z,1,.06,1.3);const p=person({pose:'cross',base:.24,x,z,ry:PI,closed:si%3!==1,shirt:pick(['#f4efe4','#cfe9d4','#f6d7c3','#d8d4f2','#e3ecff']),pants:pick(['#4a5a6a','#6b5a7a','#3d5a48','#5a4a6a']),style:pick(['short','long','pony','bun'])});p.armL.rotation.set(-.6,0,-.35);p.armR.rotation.set(-.6,0,.35);students.push(p);solid(x,z,.8,.8);si++;}
  const breath=spr((g,w,h)=>{g.fillStyle='rgba(19,32,26,.8)';rr(g,0,0,w,h,30);g.fill();g.fillStyle='#bff3c4';g.font='700 34px '+SYS;g.textAlign='center';g.fillText('breathe in · breathe out',w/2,h/2+12);},520,80,.4,-14,3.15,c-6);
  anim(t=>{const b=sin(t*.9),u=(b+1)/2;orbM.scale.setScalar(1+.2*b);orbM.position.y=1.2+.08*b;breath.material.opacity=.55+.45*b;
    teacher.armL.rotation.set(-.6-1.6*u,0,-.35-.5*u);teacher.armR.rotation.set(-.6-1.6*u,0,.35+.5*u);teacher.body.scale.y=1+.02*b;
    for(const p of students){p.body.scale.y=1+.018*sin(t*.9+.3);p.head.rotation.x=.12+.04*b;}
    smoke.forEach((s,i)=>{const k=((t*.25+i/3)%1);s.position.set(-15.6+sin(t+i)*.1,.6+k*1.6,c-11.6);s.material.opacity=.7*(1-k);s.scale.setScalar(.25+k*.4);});});
  for(const z of[c-12,c-5,c+2])lantern(-17.5,3.1,z,true),lantern(-10.5,3.1,z,true);
  for(const[x,z]of[[-20.3,PZB-.7],[-7.7,PZB-.7],[-20.3,PZA+.7],[-7.7,PZA+.7]]){cube('#eeeeea',x,.5,z,.5,.6,.5);blk('leaves',x,1.1,z,.7,.7,.7);}

  // ---------- THREE STUDENTS, EACH IN THEIR OWN NOOK (right): studying, meditating, exercising ----------
  const NX0=8.6,NX1=21.4;
  for(let x=Math.ceil(NX0);x<=NX1;x++)for(const z of[c-1.5,c-8.7])blk('hedge',x,.55,z,1,1.1,.7);
  for(let z=Math.floor(c+5.4);z>=c-15.6;z--)blk('hedge',22,.55,z,.8,1.1,1);
  solidBox(NX0,c-1.85,NX1+.5,c-1.15);solidBox(NX0,c-9.05,NX1+.5,c-8.35);solidBox(21.6,c-15.8,22.4,c+5.6);
  const nookSign=(txt,z)=>{const t=woodSign(txt,{});cube('#6b4423',NX0+.2,.8,z,.12,1.6,.12);cube('#3b2414',NX0+.2,1.55,z,.06,.5,1.8);plane(t,1.7,.42,NX0+.14,1.55,z,-HP);solid(NX0+.2,z,.3,.3);};
  // 1 · studying
  const s1=c+2.1;floor('oak',NX0,c+5.4,NX1,c-1.2,.03,3);cube('#c98a5a',15,.05,s1,4.4,.04,3.4);nookSign('STUDY',c+4.4);
  const sf=F(15.4,s1,-HP);const reader=studentDesk(sf,{chair:'#5fb36a',desk:'#d9c7a2',p:{shirt:'#ffd27a',pants:'#3d4f7a',style:'long',hair:'#24180f'}});onDesk(sf,'notebook');
  sf.cube('#2b2420',.42,.95,.86,.04,.4,.04);sf.lit('#ffe7a8',.42,1.15,.78,.14,.08,.14);for(let i=0;i<4;i++)sf.cube(['#d8342a','#2e7ad8','#2fa848','#f09a12'][i],-.42,.8+i*.07,.75,.3,.07,.22,(i%2)*.2);
  blk('bookshelf',20.6,.5,s1+2.2,.8,1,1);blk('bookshelf',20.6,1.5,s1+2.2,.8,1,1);solid(20.6,s1+2.2,.9,1.1);cube('#eeeeea',20.6,.3,s1-2.2,.5,.6,.5);blk('leaves',20.6,.95,s1-2.2,.7,.7,.7);
  anim(t=>{reader.head.rotation.x=.38+.04*sin(t*1.1);reader.armR.rotation.x=-.95+.1*sin(t*9);reader.head.rotation.y=Math.floor(t/7)%2?.25*sin(t*.8):0;});
  // 2 · meditating in a little zen garden
  const s2=c-5.1;floor('sand',NX0,c-1.8,NX1,c-8.4,.03,3);nookSign('MEDITATE',c-2.9);
  for(let i=0;i<5;i++)cube('#cdbb8c',15.5,.045,s2-2.4+i*1.2,8,.02,.12);
  for(const[x,z,sc]of[[12,s2-2.2,.7],[19.4,s2+1.8,.9],[18.6,s2-2.4,.5]]){blk('stone',x,.25*sc,z,sc,.5*sc,sc*.8);solid(x,z,sc,sc);}
  cube('#5a3a1e',11,.32,s2+2,.6,.3,.6);cube('#6b4423',11,.7,s2+2,.08,.6,.08);for(const[a,b]of[[-.2,0],[.2,.1],[0,-.2],[.1,.2]])blk('cherryLeaves',11+a,1.05,s2+2+b,.45,.35,.45);solid(11,s2+2,.7,.7);
  cube('#7c6cff',15.5,.12,s2,1.1,.2,1.1);const calm=person({pose:'cross',base:.22,x:15.5,z:s2,ry:-HP,closed:true,shirt:'#cfe9d4',pants:'#4a5a6a',style:'short'});calm.armL.rotation.set(-.6,0,-.35);calm.armR.rotation.set(-.6,0,.35);solid(15.5,s2,1,1);
  const aura=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),new THREE.MeshBasicMaterial({color:'#e9ff9a'}));aura.position.set(15.5,2.5,s2);K.group.add(aura);
  anim(t=>{const b=sin(t*.8);calm.body.scale.y=1+.02*b;calm.head.rotation.x=.1+.04*b;aura.scale.setScalar(1+.3*b);aura.position.y=2.45+.1*b;});
  // 3 · exercising
  const s3=c-12.3;cube('#3a4250',15,.03,s3,12,.04,6);nookSign('MOVE',c-10.1);
  cube('#ff8a80',15.5,.06,s3,1,.04,2.2);const mover=person({pose:'stand',x:15.5,z:s3,ry:-HP,shirt:'#82b1ff',pants:'#2e3446',shoe:'#f4f4f2',style:'pony',hair:'#24180f'});solid(15.5,s3,.9,.9);
  for(const dz of[-1.6,-2,-2.4]){cube('#2b2f36',19.6,.12,s3+dz,.5,.12,.12);for(const sg of[-1,1])cube('#1b1d22',19.6+sg*.22,.12,s3+dz,.1,.24,.24);}
  cube('#2b2f36',19.4,.22,s3+1.8,.34,.34,.34);cube('#2b2f36',19.4,.46,s3+1.8,.24,.08,.08);cube('#5ad1ff',19.6,.25,s3+2.6,.16,.5,.16);solid(19.6,s3,1.2,6);
  anim(t=>{const u=(sin(t*4.2)+1)/2;mover.armL.rotation.set(0,0,-.3-2.5*u);mover.armR.rotation.set(0,0,.3+2.5*u);if(mover.legL){mover.legL.rotation.z=-.32*u;mover.legR.rotation.z=.32*u;}mover.body.position.y=.12*Math.abs(sin(t*4.2));});

  // ---------- by the path: Peakmind's chatbot check-in, with Peakoo napping next to it ----------
  const mood=screen(512,512,(g,t,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#eaf6ee');gr.addColorStop(1,'#d7ece0');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='#5fb36a';g.beginPath();g.arc(70,76,36,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(58,70,6,0,7);g.arc(82,70,6,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.arc(70,80,14,.2,PI-.2);g.stroke();
    rr(g,122,40,354,78,24);g.fillStyle='#fff';g.fill();g.fillStyle='#1f3326';g.font='600 28px '+SYS;g.fillText('Hi! How are you',146,76);g.fillText('feeling today?',146,108);
    const faces=['#e46a6a','#f09a5a','#f2c94c','#9bd36a','#5fb36a'],sel=Math.floor(t/1.3)%5;
    faces.forEach((col,i)=>{const x=72+i*92,y=228,s=i===sel?1.18:1;g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.beginPath();g.arc(0,0,34,0,7);g.fill();g.fillStyle='#1f3326';g.beginPath();g.arc(-11,-8,4.5,0,7);g.arc(11,-8,4.5,0,7);g.fill();g.strokeStyle='#1f3326';g.lineWidth=4;g.beginPath();const k=(i-2)/2;g.moveTo(-13,14-k*6);g.quadraticCurveTo(0,14+k*12,13,14-k*6);g.stroke();if(i===sel){g.strokeStyle='#1f3326';g.lineWidth=3;g.beginPath();g.arc(0,0,40,0,7);g.stroke();}g.restore();});
    rr(g,40,310,432,72,22);g.fillStyle='#5fb36a';g.fill();g.fillStyle='#fff';g.font='600 26px '+SYS;g.fillText(["I'm here to listen.","Let's try a breathing exercise.","Want to talk about it?","Sleep tips for tonight?","Great! Keep it going."][sel],62,355);
    rr(g,40,410,432,62,31);g.fillStyle='#fff';g.fill();g.fillStyle='#8aa596';g.font='24px '+SYS;g.fillText('Type a message…',70,449);},3);
  cube('#5a3a1e',-5.6,1,c+7.6,.14,2,.14);cube('#2b2420',-5.6,2.3,c+7.6,.08,1.5,1.5);plane(mood,1.38,1.38,-5.55,2.3,c+7.6,HP*.999,0,{basic:true});solid(-5.6,c+7.6,.5,.5);
  interact({x:-4.9,z:c+7.6,y:2,my:3.5,r:4,verb:'Explore',label:'the chatbot redesign',color:ac,act:()=>K.openPanel('peakmind','decisions')});
  const pk=grp(-6.9,0,c+8.8);pk.rotation.y=2.2;const pm=new Merge();pm.box('#6b4fd8',0,.08,0,1,.16,.8);pm.box('#7d63e6',0,.17,0,.86,.06,.66);
  pm.box('#e8762c',0,.36,0,.62,.3,.4);pm.box('#f6efe6',.14,.33,.17,.3,.2,.08);pm.box('#e8762c',-.42,.33,.1,.34,.22,.24,.6);pm.box('#f6efe6',-.56,.33,.24,.14,.18,.16,.6);
  pm.box('#e8762c',.38,.42,.02,.32,.28,.32);pm.box('#f6efe6',.55,.38,.04,.12,.12,.18);pm.box('#2b1d16',.62,.4,.04,.04,.05,.06);
  for(const sg of[-1,1]){pm.box('#e8762c',.36,.6,.02+sg*.1,.08,.12,.08);pm.box('#2b1d16',.36,.68,.02+sg*.1,.06,.05,.06);pm.box('#2b1d16',.5,.46,.04+sg*.07,.05,.02,.02);}
  pk.add(pm.mesh());solid(-6.9,c+8.8,1.1,1);
  const pz=spr((g,w,h)=>{g.fillStyle='#ffe7a8';g.font='700 40px '+SYS;g.textAlign='center';g.fillText('z',w/2,h-12);},64,64,.28,-6.9,1,c+8.8);
  anim(t=>{pk.scale.y=1+.03*sin(t*1.4);const u=(t*.4)%1;pz.position.set(-6.9+u*.2,.9+u*1.1,c+8.8);pz.material.opacity=1-u;});
  // case-study board
  const cork=sign({w:512,h:384,draw(g,w,h){g.fillStyle='#c79a63';g.fillRect(0,0,w,h);for(let i=0;i<300;i++){g.fillStyle=`rgba(${100+rnd()*60|0},${70+rnd()*40|0},40,.35)`;g.fillRect(rnd()*w,rnd()*h,3,3);}
    [[30,40,'#fff6c8',-.06],[200,30,'#d6f0dc',.05],[360,60,'#fbe0e6',-.04],[60,210,'#e3ecff',.04],[250,200,'#fff',-.03]].forEach(([x,y,col,r],i)=>{g.save();g.translate(x+60,y+60);g.rotate(r);g.fillStyle=col;g.fillRect(-60,-60,120,120);g.fillStyle='#d8342a';g.beginPath();g.arc(0,-50,7,0,7);g.fill();g.fillStyle='rgba(0,0,0,.35)';for(let k=0;k<4;k++)g.fillRect(-46,-22+k*18,70+((i+k)%3)*10,6);g.restore();});
    g.fillStyle='#13201a';rr(g,0,h-64,w,64,0);g.fill();g.fillStyle='#bff3c4';g.font='22px '+PF;g.fillText('CASE STUDY ▶',24,h-24);}});
  cube('#5a3a1e',6.4,1.2,c+8.6,.14,2.4,.14);cube('#5a3a1e',6.4,1.2,c+6.4,.14,2.4,.14);cube('#3b2414',6.4,1.8,c+7.5,.1,1.7,2.4);plane(cork,2.24,1.68,6.33,1.8,c+7.5,-HP);solidBox(6.1,c+6.2,6.7,c+8.8);
  interact({x:5.6,z:c+7.5,y:1.8,my:3.2,r:4,verb:'View',label:'the Peakmind case study',color:ac,act:()=>K.openSlides(1)});
  // trees, flowers, fireflies, petals
  for(const[x,z,k]of[[-23.6,c+8,'birch'],[-11,c+9,'oak'],[-24,c-6,'spruce'],[24,c+8,'cherry'],[24,c-6,'birch'],[7.5,c-19,'oak'],[24,c-13,'spruce'],[-7,c-18.5,'spruce'],[13,c-19.5,'cherry'],[-13,c-18.5,'birch']])tree(x,z,k,4+(rnd()*2|0),2);
  flowersAround(-24,c+10.5,-7,c+6,30);flowersAround(-24,c-16,-6,c-19,14);flowersAround(6,c-16.5,22,c-19.5,12);for(const[x,z]of[[-23,c+2],[-23.4,c-2],[-22.8,c-10],[-23.2,c-14]])bush(x,z,.8,'leaves');
  const FN=46,fly=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.07,.07),new THREE.MeshBasicMaterial({color:'#e9ff9a'}),FN);fly.frustumCulled=false;K.group.add(fly);const fp=[...Array(FN)].map(()=>({x:-24+rnd()*48,z:c+10-rnd()*28,y:.4+rnd()*2.4,p:rnd()*6}));const _o=new THREE.Object3D();
  const PN=40,pet=new THREE.InstancedMesh(new THREE.PlaneGeometry(.12,.12),new THREE.MeshBasicMaterial({color:'#f6b6cf',side:THREE.DoubleSide}),PN);pet.frustumCulled=false;K.group.add(pet);const pp=[...Array(PN)].map(()=>({x:-24+rnd()*48,z:c+10-rnd()*28,y:rnd()*6,p:rnd()*6,s:.3+rnd()*.4}));
  anim((t,dt)=>{fp.forEach((f,i)=>{_o.position.set(f.x+sin(t*.4+f.p)*.8,f.y+sin(t*.9+f.p)*.3,f.z+cos(t*.35+f.p)*.8);_o.scale.setScalar(.4+.6*Math.max(0,sin(t*2.2+f.p*3)));_o.rotation.set(0,0,0);_o.updateMatrix();fly.setMatrixAt(i,_o.matrix);});fly.instanceMatrix.needsUpdate=true;
    pp.forEach((f,i)=>{f.y-=dt*f.s;if(f.y<0){f.y=6;f.x=-24+rnd()*48;}_o.position.set(f.x+sin(t+f.p)*.6,f.y,f.z+cos(t*.8+f.p)*.4);_o.rotation.set(t*f.s*3+f.p,t*2+f.p,0);_o.scale.setScalar(1);_o.updateMatrix();pet.setMatrixAt(i,_o.matrix);});pet.instanceMatrix.needsUpdate=true;});
  gap(-113,-138,'EDME','03');
  // butterflies
  const bfs=[...Array(6)].map((_,i)=>{const g=grp(0,0,0);const col=pick(['#ffd65a','#ff8ab8','#8ad2ff','#ffffff']);const w1=box(col,true),w2=box(col,true);w1.scale.set(.16,.01,.12);w2.scale.set(.16,.01,.12);w1.position.x=.08;w2.position.x=-.08;g.add(w1,w2);return{g,w1,w2,p:rnd()*6,cx:pick([-15,-10,12,17]),cz:c-6+rnd()*14,cy:pick([1.4,4.8])};});
  anim(t=>{for(const b of bfs){const a=t*.5+b.p;b.g.position.set(b.cx+sin(a)*3,b.cy+.5*sin(t*1.7+b.p),b.cz+cos(a*1.3)*3);b.g.rotation.y=-a;const f=sin(t*18+b.p)*.9;b.w1.rotation.z=f;b.w2.rotation.z=-f;}});
}

// ===================================================================
// 03 EDME — insurance office (left) + customer care (right)
// ===================================================================
function buildEdme(){
  const c=C.edme,ac=AC.edme;chunk('edme',-120,-178);
  scenery(-120,-178,[[c+12,c-12]]);
  floor('concrete',-5.5,c+7,5.5,c-7,.025,2);
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('concreteDark',x,y+.5,c+10);solid(x,c+10,1,1);}blk('roof-concreteDark',0,5.3,c+10,8,.6,1);lit(ac,0,4.95,c+10.5,7.4,.06,.04);
  const edmeLogo=(g,x,y,s)=>{const sh=(cx,cy,k,fill)=>{g.beginPath();g.moveTo(cx-48*k,cy-58*k);g.lineTo(cx+48*k,cy-58*k);g.lineTo(cx+48*k,cy-6*k);g.quadraticCurveTo(cx+44*k,cy+44*k,cx,cy+66*k);g.quadraticCurveTo(cx-44*k,cy+44*k,cx-48*k,cy-6*k);g.closePath();g.fillStyle=fill;g.fill();};sh(x,y,s,'#f0a01c');sh(x,y,s*.74,'#e0501c');};
  const gt=darkSign('EDME',{accent:ac,sub:'STATION 03',icon:(g,x,y)=>edmeLogo(g,x,y,.9)});cube('#14171d',0,4.2,c+10,4.6,1.2,.05);plane(gt,4.4,1.1,0,4.2,c+10+.03,0);plane(gt,4.4,1.1,0,4.2,c+10-.03,PI);
  screenTower(4.6,c-4.5,ac,['../../img/screens/edme-1.webp','../../img/screens/edme-2.webp','../../img/screens/edme-3.webp','../../img/screens/edme-4.webp'],'the EDME insurance app',()=>K.openPanel('edme','decisions'));
  kiosk(c,'edme',{name:'EDME Insurance',accent:ac,tex:billboardTex('edme',{accent:ac}),verb:'View',label:'the EDME case study',act:()=>K.openSlides(2)});
  // floating data chart above the totem
  const bars=[];for(let i=0;i<6;i++){const m=box(i%2?ac:'#ffd27a',true);m.position.set(-1.25+i*.5,4.4,c);K.group.add(m);bars.push(m);}
  const dots=new THREE.InstancedMesh(new THREE.BoxGeometry(.06,.06,.06),new THREE.MeshBasicMaterial({color:'#ffd27a'}),30);dots.frustumCulled=false;K.group.add(dots);const dp=[...Array(30)].map(()=>({x:(rnd()-.5)*3,z:(rnd()-.5)*1.2,y:rnd()*2,s:.4+rnd()*.6}));const _o=new THREE.Object3D();
  anim((t,dt)=>{bars.forEach((m,i)=>{const h=.4+.9*(.5+.5*sin(t*.9+i*1.1));m.scale.set(.32,h,.32);m.position.y=4.5+h/2;});dp.forEach((d,i)=>{d.y+=dt*d.s;if(d.y>2.2)d.y=0;_o.position.set(d.x,4.4+d.y,c+d.z);_o.scale.setScalar(1-d.y/2.2);_o.updateMatrix();dots.setMatrixAt(i,_o.matrix);});dots.instanceMatrix.needsUpdate=true;});
  // ---------- OFFICE (left) ----------
  const X0=-23,X1=-6,ZA=c-12,ZB=c+12;floor('concrete',X0,ZB,X1,ZA,.035,3);floor('concrete',-24,c+12.5,-5.5,c+13.5,.03,3);
  for(let y=0;y<5;y++)for(let z=ZA;z<=ZB;z++)blk('concrete',X0,y+.5,z);
  for(const zz of[ZA,ZB]){windowedGlass((X0+X1)/2,2.35,zz,X1-X0,4.7,0);for(let x=X0;x<=X1;x+=2)cube('#2a2d33',x,2.35,zz,.14,4.7,.14);cube('#2a2d33',(X0+X1)/2,4.75,zz,X1-X0,.16,.18);}
  for(const[za,zb]of[[ZA,c-1.6],[c+1.6,ZB]]){windowedGlass(X1,2.35,(za+zb)/2,zb-za,4.7,HP);for(let z=za;z<=zb;z+=2)cube('#2a2d33',X1,2.35,z,.14,4.7,.14);}cube('#2a2d33',X1,4.4,c,.18,.7,3.4);
  solidBox(X0-.5,ZA,X0+.5,ZB);solidBox(X0,ZA-.15,X1,ZA+.15);solidBox(X0,ZB-.15,X1,ZB+.15);solidBox(X1-.15,ZA,X1+.15,c-1.6);solidBox(X1-.15,c+1.6,X1+.15,ZB);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(X1-X0+1,.4,ZB-ZA+1),new THREE.MeshLambertMaterial({color:'#e2e2de'}));roof.position.set((X0+X1)/2,4.95,c);K.group.add(roof);
  for(const x of[-19,-14.5,-10])for(const z of[c-7,c,c+7])lit('#f4f8ff',x,4.72,z,2.4,.04,.3);
  const es=sign({w:1024,h:200,draw(g,w,h){g.fillStyle='#24262a';g.fillRect(0,0,w,h);edmeLogo(g,110,100,1);g.textAlign='left';g.textBaseline='middle';g.font='800 92px '+HF;g.fillStyle='#f4f4f4';g.fillText('EDME',200,70);fit(g,'(Aditya Birla) Insurance',w-230,44,700,HF);g.fillStyle='#e6e6e6';g.fillText('(Aditya Birla) Insurance',202,150);}});
  plane(es,5,.98,X1+.12,4.3,c+6,HP);
  // dashboard video wall
  const wall=screen(1024,384,(g,t,w,h)=>{g.fillStyle='#07090d';g.fillRect(0,0,w,h);const pw=w/3,ph=h/2;
    const panel=(i,title,fn)=>{const x=(i%3)*pw,y=Math.floor(i/3)*ph;g.fillStyle='#121722';g.fillRect(x+6,y+6,pw-12,ph-12);g.fillStyle='#8b97ab';g.font='600 16px '+SYS;g.fillText(title,x+20,y+32);fn(x+20,y+44,pw-40,ph-64);};
    panel(0,'Policies · this quarter',(x,y,W,H)=>{g.strokeStyle='#f0a01c';g.lineWidth=3;g.beginPath();for(let k=0;k<=24;k++){const v=.5+.3*sin(k*.5+t*.6)+.12*sin(k*1.3);g.lineTo(x+k*W/24,y+H-v*H);}g.stroke();});
    panel(1,'Claims by stage',(x,y,W,H)=>{for(let k=0;k<6;k++){const v=.3+.6*(.5+.5*sin(t*.8+k));g.fillStyle=k%2?'#f0a01c':'#ffd27a';g.fillRect(x+k*W/6+6,y+H-v*H,W/6-12,v*H);}});
    panel(2,'Renewal rate',(x,y,W,H)=>{const v=.62+.06*sin(t*.5);g.lineWidth=16;g.strokeStyle='#2a3242';g.beginPath();g.arc(x+70,y+H/2+4,48,0,7);g.stroke();g.strokeStyle='#f0a01c';g.beginPath();g.arc(x+70,y+H/2+4,48,-HP,-HP+v*PI*2);g.stroke();g.fillStyle='#fff';g.font='800 30px '+HF;g.fillText(Math.round(v*100)+'%',x+150,y+H/2+14);});
    panel(3,'Modules',(x,y,W,H)=>{const n=['Motor','Health','Life','Travel','Home','Claims'];n.forEach((s,k)=>{g.fillStyle='#1d2433';g.fillRect(x+(k%3)*(W/3),y+Math.floor(k/3)*(H/2),W/3-8,H/2-8);g.fillStyle='#d9e0ec';g.font='600 15px '+SYS;g.fillText(s,x+(k%3)*(W/3)+10,y+Math.floor(k/3)*(H/2)+28);});});
    panel(4,'Response time',(x,y,W,H)=>{g.fillStyle='#fff';g.font='800 54px '+HF;g.fillText((2.1+.3*sin(t*.4)).toFixed(1)+'h',x,y+70);g.fillStyle='#5fd38a';g.font='600 18px '+SYS;g.fillText('▼ trending down',x,y+H-6);});
    panel(5,'Regions',(x,y,W,H)=>{for(let r=0;r<4;r++)for(let k=0;k<10;k++){const v=.5+.5*sin(k*.9+r*1.7+t*.7);g.fillStyle=`rgba(240,160,28,${(.15+v*.75).toFixed(2)})`;g.fillRect(x+k*W/10,y+r*H/4,W/10-4,H/4-4);}});},3);
  cube('#101216',X0+.56,2.6,c,.12,3.1,8.2);plane(wall,7.8,2.92,X0+.64,2.6,c,HP,0,{basic:true});
  interact({x:X0+3.4,z:c,y:2.4,my:4.5,r:4.4,verb:'Explore',label:'the EDME dashboards',color:ac,act:()=>K.openPanel('edme','decisions')});
  // meeting table + presenter
  cube('#3a3f48',-18.2,.74,c,1.3,.06,3.6);cube('#3a3f48',-18.2,.37,c,.2,.74,2.6);solidBox(-19.6,c-2.5,-16.8,c+2.5);
  const meet=[];for(const[x,z,ry]of[[-17.1,c-1.1,-HP],[-17.1,c+1.1,-HP],[-19.3,c+1.1,HP]]){cube('#2a4892',x,.47,z,.5,.08,.5);const p=person({pose:'sit',x,z,ry,shirt:pick(['#f4f4f2','#dce8f6','#f2e6d8']),pants:'#2e3340',lanyard:'#2a6ad0',jacket:rnd()<.4?'#2f3640':null,style:pick(['short','long','short'])});p.armL.rotation.x=p.armR.rotation.x=-.9;meet.push(p);}
  const pres=person({pose:'stand',x:-20.6,z:c-2.4,ry:HP*.4,shirt:'#f4f4f2',jacket:'#22324a',pants:'#22324a',tie:'#f0a01c',lanyard:'#2a6ad0',style:'short'});solid(-20.6,c-2.4,.7,.7);
  anim(t=>{pres.armR.rotation.x=-1.6+.5*sin(t*.9);pres.armR.rotation.z=-.4;pres.head.rotation.y=-.6+.5*sin(t*.5);for(const p of meet)p.head.rotation.y=-.5+.15*sin(t*.7+p.ph);});
  // desk clusters with employees
  const mon=[0,1].map(v=>screen(256,160,(g,t,w,h)=>{g.fillStyle='#f4f6f9';g.fillRect(0,0,w,h);g.fillStyle='#24262a';g.fillRect(0,0,52,h);g.fillStyle='#f0a01c';g.fillRect(12,14,28,8);for(let k=0;k<5;k++){g.fillStyle='#4a4f58';g.fillRect(12,40+k*20,28,6);}
    if(v){g.strokeStyle='#e0501c';g.lineWidth=3;g.beginPath();for(let k=0;k<=12;k++)g.lineTo(64+k*15,120-40*(.5+.5*sin(k*.7+t)));g.stroke();}else for(let k=0;k<6;k++){const hh=20+60*(.5+.5*sin(t*.9+k));g.fillStyle=k%2?'#f0a01c':'#ffd27a';g.fillRect(70+k*28,140-hh,18,hh);}
    g.fillStyle='#24262a';g.font='600 13px '+SYS;g.fillText(v?'Claims trend':'Policy issuance',64,22);},3));
  const staff=[];
  for(const cz of[c-6.5,c+6.5])for(const x of[-14.5,-11.5])for(const s of[-1,1]){const f=F(x,cz+s*1.3,s<0?0:PI);f.cube('#e9e6df',0,.74,.66,1.2,.06,.7);f.cube('#3a3f48',0,.37,.66,.08,.74,.5);f.cube('#24262a',0,.47,0,.5,.08,.5);f.cube('#24262a',0,.8,-.24,.5,.6,.06);
    f.cube('#20232a',0,1.12,.86,.62,.38,.04);f.cube('#20232a',0,.86,.86,.08,.2,.06);f.plane(mon[(x+cz)>c?1:0],.58,.34,0,1.12,.835,PI,0,{basic:true});f.cube('#d9dde3',0,.785,.48,.4,.02,.14);
    const p=f.person({pose:'sit',shirt:pick(['#f4f4f2','#dce8f6','#e9f2e9','#f6e6e0']),pants:pick(['#2e3340','#3a4250','#4a3f35']),lanyard:'#2a6ad0',glasses:rnd()<.35,style:pick(['short','long','bun','short'])},0,0);p.armL.rotation.x=p.armR.rotation.x=-1.05;staff.push(p);f.solid(0,.4,1.3,1.6);}
  anim(t=>{for(const p of staff){p.armL.rotation.x=-1.05+.05*sin(t*14+p.ph);p.armR.rotation.x=-1.05+.05*sin(t*13+p.ph*2);p.head.rotation.y=.12*sin(t*.4+p.ph);}});
  for(const[x,z]of[[-7,c-10.8],[-7,c+10.8],[-21.8,c-10.8],[-21.8,c+10.8]]){cube('#eeeeea',x,.3,z,.5,.6,.5);blk('leaves',x,.95,z,.7,.7,.7);blk('leaves',x,1.4,z,.4,.5,.4);solid(x,z,.6,.6);}
  // ---------- CUSTOMER CARE (right) ----------
  floor('quartz',6,c+9.5,23,c-9.5,.036,3);
  for(const x of[6.5,22.5])for(const z of[c-9,c+9]){cube('#d7d7d2',x,2.1,z,.4,4.2,.4);solid(x,z,.5,.5);}
  const canopy=new THREE.Mesh(new THREE.BoxGeometry(17.4,.35,19.4),new THREE.MeshLambertMaterial({color:'#e6e3dc'}));canopy.position.set(14.5,4.35,c);canopy.castShadow=true;K.group.add(canopy);lit(ac,5.78,4.35,c,.05,.36,19.4);
  const cc=darkSign('CUSTOMER CARE',{accent:ac,sub:'POLICIES · CLAIMS · RENEWALS'});plane(cc,4.6,1.15,5.75,3.45,c-4.5,-HP);
  for(const z of[c-6,c,c+6])lit('#f4f8ff',14.5,4.16,z,10,.04,.3);
  // counter with agents
  cube('#f2f0ea',18.4,.55,c,.7,1.1,12);cube(ac,18.03,.55,c,.04,.9,12);cube('#2a2d33',18.4,1.12,c,.8,.06,12.2);solidBox(18,c-6.1,18.8,c+6.1);
  const agents=[];for(const z of[c-4,c,c+4]){cube('#24262a',19.6,.47,z,.5,.08,.5);const p=person({pose:'sit',seat:.62,x:19.6,z,ry:-HP,shirt:'#f4f4f2',pants:'#2e3340',headset:true,lanyard:ac,style:pick(['short','long','bun'])});p.armL.rotation.x=p.armR.rotation.x=-.9;agents.push(p);
    cube('#20232a',18.9,1.42,z+.3,.04,.36,.6);plane(mon[1],.56,.32,18.86,1.42,z+.3,HP,0,{basic:true});solidBox(19.2,z-.4,20.1,z+.4);}
  const cust=person({pose:'stand',x:17.3,z:c-4,ry:HP,shirt:'#7ab0d8',pants:'#3a4250',style:'short'});solid(17.3,c-4,.7,.7);
  const cust2=person({pose:'stand',x:17.3,z:c+4,ry:HP,shirt:'#e9a6a6',pants:'#2e3340',style:'long'});solid(17.3,c+4,.7,.7);
  anim(t=>{agents.forEach((p,i)=>{p.head.rotation.x=.08*sin(t*2+i);p.armR.rotation.x=-.9+.2*Math.max(0,sin(t*1.6+i*2));});cust.armR.rotation.x=-.4-.4*Math.max(0,sin(t*1.3));cust.head.rotation.x=.06*sin(t*2);cust2.head.rotation.y=.2*sin(t*.6);});
  // waiting area
  for(let i=0;i<5;i++){const z=c-4.8+i*2.4;cube('#2a4892',11.2,.46,z,.55,.08,.55);cube('#2a4892',10.95,.75,z,.06,.5,.55);cube('#3a3f48',11.2,.22,z,.4,.44,.4);if(i!==2){const p=person({pose:'sit',x:11.2,z,ry:HP,shirt:pick(['#f6d7c3','#cfe9d4','#dce8f6','#ffd27a']),pants:pick(['#3a4250','#4a5a6a']),style:pick(['short','long'])});if(i===3)held(p,'phone',mon[0]);else{p.armL.rotation.x=p.armR.rotation.x=-.5;}}}
  solidBox(10.6,c-5.3,11.8,c+5.3);
  const queue=screen(512,192,(g,t,w,h)=>{g.fillStyle='#0b0d12';g.fillRect(0,0,w,h);g.fillStyle=ac;g.font='22px '+PF;g.fillText('NOW SERVING',30,52);const n=40+Math.floor(t/5)%30;g.fillStyle='#fff';g.font='800 84px '+HF;g.fillText('A-0'+n,30,152);g.fillStyle='#8b97ab';g.font='600 26px '+SYS;g.fillText('COUNTER',330,90);g.fillStyle=ac;g.font='800 70px '+HF;g.fillText(String(1+n%3),370,160);},1);
  cube('#101216',16.2,3.3,c,.1,1.1,2.9);plane(queue,2.8,1.05,16.14,3.3,c,-HP,0,{basic:true});cube('#2a2d33',16.2,3.95,c,.04,.4,.04);
  // self-service kiosk = case study
  const kio=screen(256,384,(g,t,w,h)=>{g.fillStyle='#f6f7f9';g.fillRect(0,0,w,h);g.fillStyle='#24262a';g.fillRect(0,0,w,70);edmeLogo(g,40,36,.36);g.fillStyle='#fff';g.font='800 30px '+HF;g.fillText('EDME',70,46);
    const sel=Math.floor(t/1.4)%3;['Buy a policy','File a claim','Track a claim'].forEach((s,i)=>{rr(g,20,96+i*86,w-40,68,14);g.fillStyle=i===sel?'#f0a01c':'#ffffff';g.fill();g.strokeStyle='#dde1e7';g.lineWidth=2;g.stroke();g.fillStyle=i===sel?'#1a1206':'#24262a';g.font='700 22px '+SYS;g.fillText(s,40,138+i*86);});
    g.fillStyle='#8b97ab';g.font='600 15px '+SYS;g.fillText('Tap to start',90,h-20);},2);
  cube('#2a2d33',7.6,.6,c+6.5,.5,1.2,.5);cube('#2a2d33',7.6,1.55,c+6.5,.12,.9,.9,0,0,0);cube('#20232a',7.55,1.95,c+6.5,.06,1.1,.78);plane(kio,.7,1.05,7.51,1.95,c+6.5,-HP,0,{basic:true});solid(7.6,c+6.5,.7,.7);
  interact({x:6.9,z:c+6.5,y:1.8,my:3.1,r:3.8,verb:'View',label:'the EDME case study',color:ac,act:()=>K.openSlides(2)});
  for(const[x,z]of[[7.4,c-8.2],[21.6,c-8.2],[21.6,c+8.2]]){cube('#eeeeea',x,.3,z,.5,.6,.5);blk('leaves',x,.95,z,.7,.7,.7);solid(x,z,.6,.6);}
  for(const[x,z,k]of[[-8,c+15,'birch'],[9,c+15,'oak'],[-14,c-16,'oak'],[15,c-15,'birch'],[22,c+15,'spruce'],[-21,c+16,'birch']])tree(x,z,k,5,2);
  flowersAround(-24,c+16,-6,c+13.6,20);flowersAround(6,c-10,24,c-17,24);
}

// ===================================================================
// THE CANYON LINE — after the three projects you sit in a cart and ride a
// tall trestle across a canyon (forest walls, a river far below, a mesa with
// a lava fall) to the far side, where Other Works and Let's Connect wait.
// ===================================================================
function buildCanyon(){
  chunk('canyon',EA+8,EB-8);
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  // ---------- the route (rail-top height), land A → trestle → land B ----------
  const _tv=new THREE.Vector3();
  const curve=new THREE.CatmullRomCurve3([V(0,.2,-173),V(0,.2,-180),V(0,.2,EA),V(2,2,-203),V(9,4,-228),V(12,5.5,-255),V(8,6,-282),V(0,5,-308),V(-6,3.5,-334),V(-7,2,-356),V(-6,.6,-374),V(-6,.2,EB+3),V(-6,.2,EB-2),V(-6,.2,EB-22)],false,'centripetal');
  const L=curve.getLength(),N=Math.ceil(L),SP=curve.getSpacedPoints(N);
  const sAtZ=z=>{for(let i=1;i<=N;i++)if(SP[i].z<=z){const a=SP[i-1],b=SP[i];return(i-1+(a.z-z)/((a.z-b.z)||1))*L/N;}return L;};
  const atZ=(z,k)=>{if(z>=SP[0].z)return SP[0][k];for(let i=1;i<=N;i++)if(SP[i].z<=z){const a=SP[i-1],b=SP[i];return a[k]+(b[k]-a[k])*(a.z-z)/((a.z-b.z)||1);}return SP[N][k];},xAtZ=z=>atZ(z,'x'),yAtZ=z=>atZ(z,'y');
  // ---------- terrain: a heightmap of 4-block columns ----------
  const hash=(i,j)=>{let h=Math.imul(i,374761393)+Math.imul(j,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;};
  const vn=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  const fbm=(x,z)=>vn(x,z)*.55+vn(x*2.1+17,z*2.1+5)*.3+vn(x*4.3+3,z*4.3+11)*.15;
  const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const FLOOR=-40,WATER=-36.7,CS=4,X0=-300,NX=150,NZ=Math.round((EA-EB)/CS);
  const MX=-112,MZ=-322,MR=72,M2X=150,M2Z=-292,M2R=60;
  const mesa=(x,z)=>{const dx=x-MX,dz=z-MZ,r=Math.hypot(dx,dz),a=Math.atan2(dz,dx),rr=r/(MR*(1+.16*sin(a*3+1.3)+.08*sin(a*7+.4)+.24*(fbm(x*.035,z*.035)-.5)));
    if(rr>1.3)return[-99,0];const foot=46*(1-ss(.5,1.3,rr))+6*fbm(x*.08,z*.08),cl=102*(1-ss(.4,.64,rr))+12*fbm(x*.06+9,z*.06)-10*ss(.1,.4,rr)*fbm(x*.1,z*.1+3);return cl>foot+3?[cl,1]:[foot,0];};
  const peak=(x,z)=>{const r=Math.hypot(x-M2X,z-M2Z)/(M2R*(1+.3*(fbm(x*.04+40,z*.04)-.5)));if(r>1.25)return[-99,0];const h=84*Math.pow(1-ss(0,1.25,r),1.4)+16*fbm(x*.09,z*.09);return[h,h>30?1:0];};
  function H(x,z){const d=Math.abs(x-xAtZ(z)),n=fbm(x*.02+3,z*.02+7),e=ss(8,60,Math.min(EA-z,z-EB));
    const rim=10+22*n+40*ss(150,260,Math.abs(x))*fbm(x*.012+50,z*.012),fw=18+8*fbm(z*.03,1.7),W=100+40*fbm(x*.01,z*.025+4);let h,rock=0;
    if(d<fw)h=FLOOR+(d>fw-4?2:0);else{const u=ss(0,1,(d-fw)/W);h=FLOOR+(rim-FLOOR)*Math.pow(u,1.25);h=Math.round(h/6)*6+4*(fbm(x*.13,z*.13)-.5);}
    h=h*e+Math.min(h,-14+8*n)*(1-e);                       // both lands stand above the valley
    const k=ss(40,95,d);for(const f of[mesa,peak]){const[m,r]=f(x,z);const mm=m*k+FLOOR*(1-k);if(mm>h){h=mm;rock=r;}}
    h=Math.min(h,yAtZ(z)-10+Math.max(0,d-14)*.8);          // keep the line clear
    return[Math.round(h/2)*2,rock];}
  const hg=new Float32Array(NX*NZ),ty=new Uint8Array(NX*NZ),cxw=i=>X0+(i+.5)*CS,czw=j=>EA-(j+.5)*CS;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const[h,r]=H(cxw(i),czw(j));hg[j*NX+i]=h;ty[j*NX+i]=r;}
  const hAt=(i,j)=>(i<0||i>=NX)?-60:(j<0||j>=NZ)?0:hg[j*NX+i];
  const cellOf=(x,z)=>[Math.floor((x-X0)/CS),Math.floor((EA-z)/CS)];
  const ground=(x,z)=>{const[i,j]=cellOf(x,z);return hAt(i,j);};
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,h=hg[k];let sl=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])sl=Math.max(sl,Math.abs(h-hAt(i+a,j+b)));
    ty[k]=h<=FLOOR+2?0:(ty[k]===1||sl>=10||h>=62)?1:2;}
  // mesh: top of every column, plus the exposed sides (striped like layered rock)
  const pos=[],nor=[],col=[],idx=[];let vi=0;const ca=new THREE.Color(),cb2=new THREE.Color(),ct=new THREE.Color();
  const STRATA=['#8f8b83','#7d7972','#9b958a','#86817a','#a39b8d','#77736c','#8a847a'].map(c=>new THREE.Color(c));
  const GR=[new THREE.Color('#5c9b34'),new THREE.Color('#7cb646'),new THREE.Color('#4d8a2d')],ROCKT=new THREE.Color('#9d988e'),BED=new THREE.Color('#a59b80'),GSIDE=new THREE.Color('#5a8f31');
  const uvs=[];const push4=(v,n,c0,c1)=>{for(let q=0;q<4;q++){const X=v[q*3],Y=v[q*3+1],Z=v[q*3+2];if(n[1])uvs.push(X*.5,Z*.5);else if(n[0])uvs.push(Z*.5,Y*.5);else uvs.push(X*.5,Y*.5);pos.push(X,Y,Z);nor.push(n[0],n[1],n[2]);const c=(q===0||q===3)?c0:c1;col.push(c.r,c.g,c.b);}idx.push(vi,vi+1,vi+2,vi,vi+2,vi+3);vi+=4;};
  const topCol=(i,j)=>{const k=j*NX+i,t=ty[k],x=cxw(i),z=czw(j);if(t===0)return ct.copy(BED);if(t===1)return ct.copy(ROCKT).multiplyScalar(.9+.18*hash(i,j));
    const n=fbm(x*.05,z*.05);ct.copy(GR[0]).lerp(n>.5?GR[1]:GR[2],Math.abs(n-.5)*1.6);return ct.multiplyScalar(.92+.14*hash(j,i)*(hg[k]<-10?.7:1));};
  // one vertical face between heights lo..hi, split into 4-block bands; o = which side, f = the four corners in xz
  function side(i,j,lo,hi,grassy,quadXZ,n){let y=lo;while(y<hi-.01){const y2=Math.min(hi,(Math.floor(y/4)+1)*4);const band=Math.floor(y/4)+((hash(i>>2,j>>2)*3)|0);
      const top=grassy&&y2>hi-1.3;ca.copy(top?GSIDE:STRATA[((band%STRATA.length)+STRATA.length)%STRATA.length]);if(!top)ca.multiplyScalar(.94+.1*hash(i,band));cb2.copy(ca).multiplyScalar(.84);
      const[ax,az,bx,bz]=quadXZ;push4([ax,y,az,ax,y2,az,bx,y2,bz,bx,y,bz],n,cb2,ca);y=y2;}}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const h=hg[j*NX+i],x0=X0+i*CS,x1=x0+CS,zA=EA-j*CS,zB=zA-CS;
    const c=topCol(i,j);push4([x0,h,zB,x0,h,zA,x1,h,zA,x1,h,zB],[0,1,0],c,c);
    // +x neighbour
    const hx=hAt(i+1,j);if(hx!==h){if(h>hx)side(i,j,hx,h,ty[j*NX+i]===2,[x1,zB,x1,zA],[1,0,0]);else if(i+1<NX)side(i+1,j,h,hx,ty[j*NX+i+1]===2,[x1,zA,x1,zB],[-1,0,0]);else side(i,j,h,hx,false,[x1,zA,x1,zB],[-1,0,0]);}
    if(i===0&&h>-60)side(i,j,-60,h,false,[x0,zA,x0,zB],[-1,0,0]);
    // the row behind (towards -z) and the land edges
    const hz=j+1<NZ?hg[(j+1)*NX+i]:0;
    if(hz!==h){if(h>hz)side(i,j,hz,h,ty[j*NX+i]===2,[x0,zB,x1,zB],[0,0,-1]);else side(i,j,h,hz,j+1<NZ&&ty[(j+1)*NX+i]===2,[x1,zB,x0,zB],[0,0,1]);}
    if(j===0){const ha=0;if(ha!==h){if(h>ha)side(i,j,ha,h,ty[i]===2,[x1,zA,x0,zA],[0,0,1]);else side(i,j,h,ha,true,[x0,zA,x1,zA],[0,0,-1]);}}}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));tg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));tg.setIndex(idx);tg.computeBoundingSphere();
  const terr=new THREE.Mesh(tg,MAT.vc);terr.receiveShadow=true;terr.castShadow=false;terr.frustumCulled=false;K.group.add(terr);
  // river along the canyon floor
  const riv=tiled('water',NX,NZ);riv.polygonOffset=false;const river=plane(riv,NX*CS,NZ*CS,0,WATER,(EA+EB)/2,0,-HP);river.receiveShadow=false;
  anim((t,dt)=>{riv.map.offset.y=(riv.map.offset.y+dt*.12)%1;riv.map.offset.x=(riv.map.offset.x+dt*.02)%1;});
  // ---------- forest on the slopes and plateaus ----------
  const LOWQ=matchMedia('(hover: none) and (pointer: coarse)').matches||(navigator.hardwareConcurrency||8)<=4,MAXT=LOWQ?1900:5500,canM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),MAXT),trM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:'#5a3b22'}),MAXT);
  const TC=['#3f7a2a','#4a8a30','#5b9a38','#356b25','#6aa63e','#2f5e2a'].map(c=>new THREE.Color(c));let nt=0;const _mm=new THREE.Matrix4(),_qq=new THREE.Quaternion(),_ps=new THREE.Vector3(),_sc=new THREE.Vector3();
  for(let j=0;j<NZ&&nt<MAXT;j++)for(let i=0;i<NX&&nt<MAXT;i++){const k=j*NX+i,x=cxw(i),z=czw(j);if(ty[k]===1&&hg[k]<96&&rnd()<.22){const h=hg[k],w=1.3+rnd()*1.4,th=.9+rnd()*1.1;_mm.compose(_ps.set(x+(rnd()-.5)*2,h+th/2,z+(rnd()-.5)*2),_qq,_sc.set(w,th,w));canM.setMatrixAt(nt,_mm);canM.setColorAt(nt,ct.copy(TC[(rnd()*5)|0]).multiplyScalar(.85+rnd()*.2));_mm.compose(_ps.set(x,h,z),_qq,_sc.set(.01,.01,.01));trM.setMatrixAt(nt,_mm);nt++;continue;}
    if(ty[k]!==2)continue;if(Math.abs(x-xAtZ(z))<12)continue;
    const p=.3+.62*vn(x*.045+9,z*.045);if(rnd()>p)continue;const h=hg[k],spruce=rnd()<.3||h>30,w=spruce?1.8+rnd()*.9:2.6+rnd()*1.8,th=spruce?4+rnd()*3:2.6+rnd()*2,tr=1.1+rnd()*.6;
    const px=x+(rnd()-.5)*(CS-w*.6),pz=z+(rnd()-.5)*(CS-w*.6);
    _mm.compose(_ps.set(px,h+tr+th/2,pz),_qq,_sc.set(w,th,w));canM.setMatrixAt(nt,_mm);canM.setColorAt(nt,ct.copy(TC[spruce?5:(rnd()*5|0)]).multiplyScalar(.9+rnd()*.2));
    _mm.compose(_ps.set(px,h+tr/2,pz),_qq,_sc.set(.55,tr,.55));trM.setMatrixAt(nt,_mm);nt++;}
  for(const[za,zb]of[[EA+70,EA+1],[EB-1,EB-70]])for(let k=0;k<(LOWQ?260:620)&&nt<MAXT;k++){const sd=rnd()<.5?-1:1,x=sd*(42+rnd()*200),z=zb+rnd()*(za-zb),spruce=rnd()<.35,w=spruce?1.8+rnd()*.9:2.8+rnd()*1.8,th=spruce?4+rnd()*3:2.8+rnd()*2,tr=1.2+rnd()*.7;
    _mm.compose(_ps.set(x,tr+th/2,z),_qq,_sc.set(w,th,w));canM.setMatrixAt(nt,_mm);canM.setColorAt(nt,ct.copy(TC[spruce?5:(rnd()*5|0)]).multiplyScalar(.9+rnd()*.2));
    _mm.compose(_ps.set(x,tr/2,z),_qq,_sc.set(.55,tr,.55));trM.setMatrixAt(nt,_mm);nt++;}
  canM.count=trM.count=nt;canM.instanceMatrix.needsUpdate=trM.instanceMatrix.needsUpdate=true;if(canM.instanceColor)canM.instanceColor.needsUpdate=true;
  for(const m of[canM,trM]){m.castShadow=false;m.receiveShadow=true;m.frustumCulled=false;K.group.add(m);}
  // Cinematic Mode: textured rock and foliage instead of flat colour
  const base={terr:terr.material,can:canM.material,tr:trM.material};let cineM=null;
  K.onLook(c=>{if(c&&!cineM){cineM={terr:new THREE.MeshLambertMaterial({vertexColors:true,map:K.rt('detailRock')}),can:new THREE.MeshLambertMaterial({map:K.rt('detailLeaf'),color:new THREE.Color(.86,.9,.84)}),tr:new THREE.MeshLambertMaterial({map:K.rt('detailBark'),color:'#7a5534'})};}
    terr.material=c?cineM.terr:base.terr;canM.material=c?cineM.can:base.can;trM.material=c?cineM.tr:base.tr;});
  // ---------- lava pouring down the mesa's face, towards the line ----------
  const lav=new Merge(),LC=['#ff3d0a','#ff5a12','#ff7a1a','#ffa024'],glowAt=[];
  const flow=(a0,r0,r1,wob)=>{let last=null;for(let r=r0;r<=r1;r+=1.6){const a=a0+wob*sin(r*.09),x=MX+cos(a)*r,z=MZ+sin(a)*r,[i,j]=cellOf(x,z);if(i<0||j<0||i>=NX||j>=NZ)continue;const key=i+','+j;if(key===last)continue;last=key;
      const h=hg[j*NX+i];let lo=h;for(const[a2,b2]of[[1,0],[-1,0],[0,1],[0,-1]])lo=Math.min(lo,hAt(i+a2,j+b2));lo=Math.max(lo,-60);
      lav.box(pick(LC),cxw(i),(lo+h)/2+.2,czw(j),CS+.3,h-lo+.5,CS+.3,0,0,0,true);if(rnd()<.35)glowAt.push([cxw(i),h+1,czw(j)]);}};
  flow(.62,MR*.22,MR*1.02,.5);flow(.69,MR*.3,MR*1.0,.45);flow(.95,MR*.48,MR*.96,.35);
  const lavaMat=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});const lavaMesh=new THREE.Mesh(lav.geo(),lavaMat);K.group.add(lavaMesh);
  const lg=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,170,60,.85)');r.addColorStop(.45,'rgba(255,90,20,.3)');r.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const glows=glowAt.slice(0,30).map(([x,y,z])=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:lg,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.6}));s.position.set(x,y,z);s.scale.setScalar(16);K.group.add(s);return s;});
  anim(t=>{lavaMat.color.setRGB(1,.86+.14*sin(t*2.1),.8+.2*sin(t*1.3+1));glows.forEach((s,i)=>{s.material.opacity=(K.cine?.6:.45)+.2*sin(t*1.7+i);});});
  const smk=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(120,112,104,.7)');r.addColorStop(1,'rgba(120,112,104,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const top0=glowAt.length?glowAt[0]:[MX,100,MZ];const smoke=[];for(let k=0;k<9;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smk,transparent:true,depthWrite:false,opacity:0}));sp.visible=false;K.group.add(sp);smoke.push(sp);}
  K.onLook(c=>smoke.forEach(sp=>sp.visible=c));
  anim(t=>{if(!K.cine)return;smoke.forEach((sp,i)=>{const u=((t*.05+i/smoke.length)%1);sp.position.set(top0[0]+u*26+sin(i*3.1)*4,top0[1]+6+u*46,top0[2]+u*14);sp.scale.setScalar(14+u*34);sp.material.opacity=.42*Math.sin(Math.PI*u);});});
  // haze drifting in the canyon
  const hz=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const mists=[];for(let k=0;k<8;k++){const z=EA-22-k*22,s=new THREE.Sprite(new THREE.SpriteMaterial({map:hz,transparent:true,depthWrite:false,opacity:.32}));s.position.set(xAtZ(z)+(rnd()-.5)*30,-22+rnd()*10,z);s.scale.set(70+rnd()*30,22,1);K.group.add(s);mists.push(s);}
  anim(t=>{mists.forEach((s,i)=>{s.position.x+=sin(t*.1+i)*.01;});});
  // ---------- waterfalls down the canyon walls ----------
  const fall=(zf,dir)=>{const [i0,j]=cellOf(xAtZ(zf),zf);let prev=hAt(i0,j);for(let i=i0+dir*6;i>0&&i<NX-1;i+=dir){const h=hAt(i,j);if(h>-24&&h-prev>=8){const xf=X0+(dir>0?i:i+1)*CS-dir*.3,H=h-WATER;
        const wm=tiled('water',1,Math.max(2,H/5));wm.polygonOffset=false;wm.opacity=.88;const pl=plane(wm,5,H,xf,(h+WATER)/2,zf,dir>0?-HP:HP);pl.receiveShadow=false;
        anim((t,dt)=>{wm.map.offset.y=(wm.map.offset.y+dt*.9)%1;});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:hz,transparent:true,depthWrite:false,opacity:.75}));sp.position.set(xf-dir*3,WATER+3,zf);sp.scale.set(16,8,1);K.group.add(sp);return;}prev=h;}};
  // ---------- a tall rock pillar in the middle of the canyon; the line tunnels straight through it ----------
  const tp=(()=>{curve.getPointAt(sAtZ(TUNZ)/L,_tv);return _tv.clone();})(),B=2.5,PY=tp.y,TOP=PY+17;
  const pr=(y,a)=>(12+2.4*sin(a*3+y*.07)+1.4*sin(a*5+1))*(1-.22*ss(PY,TOP,y))+5*(1-ss(-40,-14,y));
  for(let y=FLOOR-1.25;y<TOP;y+=B)for(let gx=-22;gx<=22;gx+=B)for(let gz=-22;gz<=22;gz+=B){const x=tp.x+gx,z=TUNZ+gz,d=Math.hypot(gx,gz),a=Math.atan2(gz,gx),R=pr(y,a);if(d>R)continue;
    const band=y>PY-3.5&&y<PY+8.5,cap=y+B>=TOP;if(!band&&!cap&&d<R-B*1.3)continue;
    const lat=x-xAtZ(z),vy=y-yAtZ(z);if(Math.abs(lat)<3.5&&vy>-1.7&&vy<5.4)continue;
    blk(rnd()<.18?'cobble':'stone',x,y,z,B,B,B);
    if((cap||d>pr(y+B,a)-.4)&&rnd()<.38)blk(rnd()<.5?'leaves':'hedge',x,y+B*.8,z,B*.95,B*.6,B*.95);}
  // torches along the tunnel walls and at both mouths
  const torchT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,200,110,.95)');r.addColorStop(.4,'rgba(255,140,50,.35)');r.addColorStop(1,'rgba(255,110,30,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const torches=[];for(let z=TZ0+3,k=0;z>TZ1-4;z-=3.6,k++){const sd=k%2?1:-1,x=xAtZ(z)+sd*3.05,y=yAtZ(z)+2.1;cube('#4a2e18',x,y,z,.12,.55,.12,0,0,sd*.35);lit('#ffcf6a',x+sd*.08,y+.36,z,.18,.22,.18);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:torchT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));sp.position.set(x,y+.4,z);sp.scale.setScalar(2.6);K.group.add(sp);torches.push(sp);}
  anim(t=>{torches.forEach((sp,i)=>{const f=.78+.22*sin(t*13+i*2.1)*sin(t*7.3+i);sp.material.opacity=f;sp.scale.setScalar(2.3+.5*f);});});
  // ---------- the trestle: lattice girders on tall lattice piers ----------
  const bm=new Merge(),bl=new Merge(),WD=['#7a4f2c','#6b4423','#835634'],WD2='#5c3a1f',IRON='#3a3f48';
  fall(-246,1);fall(-266,-1);
  const segs=Math.ceil(L/2),SQ=curve.getSpacedPoints(segs);
  for(let i=0;i<segs;i++){const a=SQ[i],b=SQ[i+1],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,hl=Math.hypot(dx,dz),len=Math.hypot(hl,dy),ry=Math.atan2(dx,dz),rx=-Math.asin(dy/len),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,mz=(a.z+b.z)/2;
    const cr=cos(ry),sr=sin(ry),at=(lx,y)=>[mx+lx*cr,my+y,mz-lx*sr];const onLand=mz>EA-.5||mz<EB+.5;
    for(const lx of[-.55,.55]){const[x,y,z]=at(lx,-.06);bm.box(IRON,x,y,z,.11,.12,len+.06,ry,rx);}
    for(const o of[-.5,.5]){const[x,y,z]=at(0,-.16);bm.box(pick(WD),x+dx*o*.5,y+dy*o*.5,z+dz*o*.5,1.75,.1,.28,ry,rx);}
    if(onLand)continue;
    {const[x,y,z]=at(0,-.36);bm.box(pick(WD),x,y,z,3.3,.24,len+.04,ry,rx);}
    for(const s of[-1,1]){let p=at(s*1.55,-.62);bm.box(WD2,p[0],p[1],p[2],.3,.3,len+.04,ry,rx);p=at(s*1.55,-2.02);bm.box(WD2,p[0],p[1],p[2],.3,.3,len+.04,ry,rx);
      p=at(s*1.55,-1.32);bm.box(pick(WD),p[0],p[1],p[2],.22,.16,len+.04,ry,rx);p=at(s*1.55,-1.32);bm.box(pick(WD),p[0],p[1],p[2],.24,1.4,.24,ry,rx);
      if(i%6===0){p=at(s*1.62,.25);bm.box(WD2,p[0],p[1],p[2],.14,1.1,.14,ry);p=at(s*1.62,.86);bl.box(s<0?'#ff3b2a':'#ffb347',p[0],p[1],p[2],.22,.22,.22,ry,0,0,true);}}}
  // piers every 12 blocks wherever the deck is high above the ground
  for(let s=14;s<L-10;s+=12){const p=curve.getPointAt(s/L),t=curve.getTangentAt(s/L);if(p.z>EA-3||p.z<EB+3)continue;const g=ground(p.x,p.z),top=p.y-2.2;if(top-g<3||Math.hypot(p.x-tp.x,p.z-TUNZ)<17)continue;
    const ry=Math.atan2(t.x,t.z),cr=cos(ry),sr=sin(ry),W=(lx,lz)=>[p.x+lx*cr+lz*sr,p.z-lx*sr+lz*cr],hh=top-g,E=1.05;
    bm.box('#7d7a72',p.x,g+.5,p.z,3.4,1.4,3.4,ry);
    for(const a of[-1,1])for(const b of[-1,1]){const[x,z]=W(a*E,b*E);bm.box(WD2,x,g+hh/2,z,.5,hh,.5,ry);}
    for(let y=g+2.4;y<top-.3;y+=3.1){for(const b of[-1,1]){let[x,z]=W(0,b*E);bm.box(pick(WD),x,y,z,2.5,.34,.34,ry);[x,z]=W(b*E,0);bm.box(pick(WD),x,y,z,.34,.34,2.5,ry);}
      const yb=y+1.55;if(yb<top-.6)for(const b of[-1,1]){let[x,z]=W(0,b*E);bm.box(WD2,x,yb,z,.26,3.1,.26,ry);[x,z]=W(b*E,0);bm.box(WD2,x,yb,z,.26,3.1,.26,ry);}}
    bm.box(pick(WD),p.x,top-.3,p.z,2.9,.5,2.9,ry);bm.box(WD2,p.x,top+.12,p.z,3.5,.36,2.2,ry);}
  const bridge=bm.mesh(MAT.vc,false);bridge.frustumCulled=false;K.group.add(bridge);K.group.add(bl.mesh(MAT.glow,false));
  // ---------- carts ----------
  function makeCart(body,trim){const g=new THREE.Group(),m=new Merge();
    m.box('#4a3020',0,.3,0,1.45,.1,1.95);for(const s of[-1,1]){m.box(body,s*.69,.6,0,.1,.6,1.95);m.box(body,0,.6,s*.94,1.45,.6,.1);m.box(trim,s*.7,.93,0,.16,.08,2.02);m.box(trim,0,.93,s*.95,1.5,.08,.16);
      for(const z of[-.5,.5])m.box(trim,s*.745,.6,z,.03,.6,.1);for(const z of[-.6,.6])m.box('#1d1f24',s*.62,.2,z,.12,.34,.34);}
    m.box('#6b4423',0,.46,.55,1.25,.2,.55);m.box('#1d1f24',0,.2,0,1.2,.06,.08);g.add(m.mesh(MAT.vc,true));
    m.box('#4a2e18',-.62,1.2,-.84,.08,.66,.08);const gl=new Merge();gl.box('#ffd27a',0,.7,-1.0,.26,.18,.04,0,0,0,true);gl.box('#ffc35a',-.62,1.6,-.84,.16,.2,.16,0,0,0,true);g.add(gl.mesh(MAT.glow,false));
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:tTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));fl.position.set(-.62,1.66,-.84);fl.scale.setScalar(1.6);g.add(fl);
    g.userData.flame=fl;
    g.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});K.group.add(g);return g;}
  const tTex=torchT;const cartA=makeCart('#a8412f','#3a3f48'),cartB=makeCart('#a8412f','#3a3f48');
  K.always(t=>{const P=K.player,inT=K.riding&&P.z<TZ0+4&&P.z>TZ1-4;for(const c of[cartA,cartB]){const f=.85+.15*sin(t*14+c.id)*sin(t*6.1);c.userData.flame.scale.setScalar((inT&&c===rideCart?1.9:1.4)+.4*f);}});
  const sA=sAtZ(-180.2),sB=L-2.4,_v=new THREE.Vector3(),_t=new THREE.Vector3();
  const park=(c,s,flip)=>{curve.getPointAt(s/L,_v);curve.getTangentAt(s/L,_t);if(flip)_t.multiplyScalar(-1);c.position.copy(_v);c.rotation.set(Math.asin(_t.y),Math.atan2(-_t.x,-_t.z),0,'YXZ');c.userData=Object.assign(c.userData||{},{home:s,flip,away:false});};
  park(cartA,sA,false);park(cartB,sB,true);
  let rideCart=null;
  const zEnd=(()=>{curve.getPointAt((L-5.8)/L,_v);return _v.z;})();
  const at=z=>{const s2=sAtZ(z);curve.getPointAt(s2/L,_v);return _v.clone();};
  const lowP=at(-336),lowY=Math.max(ground(lowP.x-17,lowP.z)+3,lowP.y-8),ARRB=at(EB-12),ARRA=at(-178);
  const prog=(s0,s1,s)=>Math.abs(s-s0)/Math.abs(s1-s0),sIn=sAtZ(TZ0+1),sOut=sAtZ(TZ1-1),fIn=prog(sA,L-5.8,sIn),fOut=prog(sA,L-5.8,sOut),nIn=prog(sB,sA+4.4,sOut),nOut=prog(sB,sA+4.4,sIn);
  const tunnelShot=(a,b)=>({from:a,until:b,type:'chase',back:4.4,up:1.75,look:.9,fov:66});
  const shotsFar=[{until:.16,type:'chase'},{from:.16,until:fIn-.015,type:'fixed',pos:[80,16,-250],move:[-4,3,-30],look:13,fov:50},tunnelShot(fIn-.015,fOut+.03),{from:fOut+.03,until:.82,type:'fixed',pos:[lowP.x-17,lowY,lowP.z+6],look:1.2,fov:58},{from:.82,until:1,type:'fixed',pos:[ARRB.x+4.2,2.1,ARRB.z-8],look:1,fov:48}];
  const shotsNear=[{until:.2,type:'chase'},{from:.2,until:nIn-.015,type:'fixed',pos:[lowP.x-17,lowY,lowP.z-14],look:1.2,fov:58},tunnelShot(nIn-.015,nOut+.03),{from:nOut+.03,until:.82,type:'fixed',pos:[84,15,-290],move:[-6,4,40],look:13,fov:50},{from:.82,until:1,type:'fixed',pos:[ARRA.x+3.4,2.1,ARRA.z+7],look:1,fov:48}];
  const toFar={curve,cart:cartA,s0:sA,s1:L-5.8,label:'Canyon Line',vmax:30,acc:10,brake:9,shots:shotsFar,exit:{x:-1.1,z:zEnd+.3,yaw:0},depart:'All aboard! Next stop: Other Works',arrive:'Welcome to the far side · Other Works is just ahead',onEnd:()=>{cartA.userData.away=true;rideCart=null;}};
  const toNear={curve,cart:cartB,s0:sB,s1:sA+4.4,label:'Canyon Line',vmax:30,acc:10,brake:9,shots:shotsNear,exit:{x:2.3,z:-182.4,yaw:PI},depart:'All aboard! Heading back to the projects',arrive:'Back with the projects · EDME is just behind you',onEnd:()=>{cartB.userData.away=true;rideCart=null;}};
  const board=r=>{if(K.riding||r.cart.userData.away)return;rideCart=r.cart;K.startRide(r);};
  K.always(()=>{const P=K.player;for(const c of[cartA,cartB]){const u=c.userData;
      if(u.away&&c!==rideCart&&Math.hypot(P.x-c.position.x,P.z-c.position.z)>30)park(c,u.home,u.flip);
      else if(!u.away&&K.state==='play'&&Math.abs(P.x-c.position.x)<.8&&Math.abs(P.z-c.position.z)<1.1)board(c===cartA?toFar:toNear);}});
  interact({x:cartA.position.x,z:cartA.position.z,y:1.2,my:2.4,r:3.8,verb:'Ride',label:"the cart to Other Works & Let's Connect",color:AC.works,short:'RIDE',act:()=>board(toFar)});
  interact({x:cartB.position.x,z:cartB.position.z,y:1.2,my:2.4,r:3.8,verb:'Ride',label:'the cart back to the projects',color:AC.edme,short:'RIDE',act:()=>board(toNear)});
}
// the station after EDME: the end of the path, a cart waiting at the cliff edge
function buildDepot(){
  chunk('depot',-166,EA-4);scenery(-178,EA);
  floor('oak',-2.5,-173.5,2.5,EA+.3,.035,3);
  // buffer stop behind the cart
  cube('#5c3a1f',0,.42,-172.9,1.9,.5,.4);for(const x of[-.6,0,.6])cube(x?'#d8342a':'#f4f1ea',x,.42,-172.68,.5,.48,.02);lit('#ff3b2a',-.7,.78,-172.8,.14,.14,.14);lit('#ff3b2a',.7,.78,-172.8,.14,.14,.14);
  // the arch over the end of the path
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('oakLog',x,y+.5,-174.5);solid(x,-174.5,1,1);}blk('roof-teal',0,5.3,-174.5,8,.6,1);
  const arch=woodSign('CANYON LINE',{sub:"CART TO OTHER WORKS · LET'S CONNECT"});cube('#3b2414',0,4.2,-174.5,4.6,1.2,.05);plane(arch,4.4,1.1,0,4.2,-174.5+.03,0);plane(arch,4.4,1.1,0,4.2,-174.5-.03,PI);
  // fence along the cliff edge (open only where the track leaves)
  for(let x=-24.5;x<=24.5;x+=1.5){if(Math.abs(x)<1.8)continue;cube('#9a6a3a',x,.55,EA+.35,.16,1.1,.16);}for(const s of[-1,1])for(const h of[.45,.85])cube('#a8763f',s*13.2,h,EA+.35,22.6,.09,.07);
  solidBox(-XW,EA+.6,-1.75,EA-1);solidBox(1.75,EA+.6,XW,EA-1);solidBox(-1.75,-182.3,1.75,EA-1);
  // a bench and a coin telescope for the view
  bench(-8,EA+2.2,PI);bench(8,EA+2.2,PI);
  cube('#3a3f48',5,.55,EA+1.2,.14,1.1,.14);cube('#3a3f48',5,1.12,EA+1.2,.4,.3,.3);cube('#2b2f36',5,1.32,EA+1.05,.18,.18,.6,0,-.2);solid(5,EA+1.2,.5,.5);
  // conductor
  const cd=person({pose:'stand',x:2.5,z:-178.2,ry:-HP+.5,shirt:'#2f3a5a',sleeve:'#2f3a5a',pants:'#232a3a',cap:'#2f3a5a',style:'short'});solid(2.5,-178.2,.7,.7);
  anim(t=>{cd.armR.rotation.x=-2.6+.35*sin(t*4);cd.armR.rotation.z=.2;cd.head.rotation.y=.4*sin(t*.5);});
  // a sign by the path
  const info=woodSign('ACROSS THE CANYON',{sub:"OTHER WORKS · LET'S CONNECT"});cube('#6b4423',-4.4,1.2,-170,.16,2.4,.16);cube('#3b2414',-4.4,2.05,-170,2.1,.6,.06);plane(info,2,.5,-4.4,2.05,-170+.035,0);solid(-4.4,-170,.3,.3);
  for(const[x,z,k]of[[-9,-170,'oak'],[10,-171,'birch'],[-17,-176,'cherry'],[18,-177,'oak'],[-22,-170,'spruce']])tree(x,z,k,5,2);
  flowersAround(-24,-168,-5,EA+3,26);flowersAround(5,-168,24,EA+3,26);
}
// the far side: the cart pulls in beside the path
function buildArrival(){
  const zW=C.works+28,Z=d=>EB-d;chunk('arrive',EB+4,zW-2);scenery(EB,zW,[[EB+1,zW-1]]);
  floor('spruce',-8.4,EB-.3,-3.6,Z(23),.035,3);
  cube('#5c3a1f',-6,.42,Z(23.1),1.9,.5,.4);for(const x of[-.6,0,.6])cube(x?'#d8342a':'#f4f1ea',-6+x,.42,Z(22.88),.5,.48,.02);lit('#ff3b2a',-6.7,.78,Z(23),.14,.14,.14);lit('#ff3b2a',-5.3,.78,Z(23),.14,.14,.14);
  // a canopy over the platform, posts on the far side only so the walkway stays clear
  for(const d of[5,12,19]){cube('#5c3a1f',-8.9,1.6,Z(d),.3,3.2,.3);solid(-8.9,Z(d),.4,.4);}
  slab('#2b6f68',-7.1,3.5,Z(12),4.4,.25,16);cube('#3b2414',-8.9,3.1,Z(12),.3,.3,15);
  const st=woodSign('CANYON LINE',{sub:'ARRIVALS · OTHER WORKS AHEAD'});cube('#3b2414',-4.2,2.65,Z(12),.06,.62,2.1);plane(st,2,.5,-4.17,2.65,Z(12),HP);plane(st,2,.5,-4.23,2.65,Z(12),-HP);
  // fence along the cliff edge, open where the track arrives
  for(let x=-24.5;x<=24.5;x+=1.5){if(x>-7.9&&x<-4.1)continue;cube('#9a6a3a',x,.55,EB-.35,.16,1.1,.16);}
  cube('#a8763f',-16.2,.45,EB-.35,16.6,.09,.07);cube('#a8763f',-16.2,.85,EB-.35,16.6,.09,.07);cube('#a8763f',10.2,.45,EB-.35,28.6,.09,.07);cube('#a8763f',10.2,.85,EB-.35,28.6,.09,.07);
  solidBox(-XW,EB-.6,-7.85,EB+1);solidBox(-4.15,EB-.6,XW,EB+1);solidBox(-7.85,EB-.6,-4.15,Z(4.2));
  for(const[x,d,k]of[[-14,6,'oak'],[13,7,'cherry'],[19,14,'birch'],[-20,15,'oak']])tree(x,Z(d),k,5,2);
  flowersAround(-24,EB-2,-10,zW,22);flowersAround(4,EB-2,24,zW,26);bench(6,EB-2.4,PI);
}

// ===================================================================
// 04 OTHER WORKS — motion (screening room) · more designs (gallery) · Framer (web studio) · vibecoding (code den)
// ===================================================================
// a room with a back wall, two side walls and an open front facing the path; flat roof that doesn't shade the inside
function room(xb,xf,zA,zB,mat,h,roof){const sg=Math.sign(xf-xb);
  for(let y=0;y<h;y++){for(let z=zA;z<=zB;z++)blk(mat,xb,y+.5,z);for(let x=xb+sg;x!==xf+sg;x+=sg)for(const zz of[zA,zB])blk(mat,x,y+.5,zz);}
  solidBox(xb-.5,zA-.5,xb+.5,zB+.5);solidBox(Math.min(xb,xf)-.5,zA-.5,Math.max(xb,xf)+.5,zA+.5);solidBox(Math.min(xb,xf)-.5,zB-.5,Math.max(xb,xf)+.5,zB+.5);
  slab(roof||'#2a2d33',(xb+xf)/2,h+.2,(zA+zB)/2,Math.abs(xf-xb)+1.2,.4,zB-zA+1.2);}
// a big browser window on a wall showing a real website screenshot
function browser(x,y,z,ry,w,h,tex,url,dark){const f=F(x,z,ry);f.cube(dark?'#0d0f13':'#20232a',0,y,0,w+.2,h+.55,.12);
  const bar=sign({w:1024,h:64,draw(g,W,H){g.fillStyle=dark?'#15181e':'#e8eaee';g.fillRect(0,0,W,H);['#ff5f57','#febc2e','#28c840'].forEach((cc,i)=>{g.fillStyle=cc;g.beginPath();g.arc(30+i*28,H/2,9,0,7);g.fill();});rr(g,130,12,W-160,H-24,10);g.fillStyle=dark?'#22262e':'#ffffff';g.fill();g.fillStyle=dark?'#9aa3b2':'#5a6170';g.font='600 24px '+SYS;g.fillText(url,154,H/2+8);}});
  f.plane(bar,w,.3,0,y+h/2+.12,.07,0,0,{basic:true});f.plane(tex,w,h,0,y-.05,.07,0,0,{basic:true});}
function buildWorks(){
  const c=C.works,ac=AC.works;chunk('works',c+28,c-34);
  scenery(c+28,c-34,[[c+12,c-26]]);
  floor('stoneBrick',-5.5,c+7,5.5,c-7,.025,2);
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('concreteDark',x,y+.5,c+10);solid(x,c+10,1,1);}blk('roof-concreteDark',0,5.3,c+10,8,.6,1);
  const WC=['#ff6a5a','#b07cff','#3a8bff','#3ee08a'];WC.forEach((col,i)=>{lit(col,-2.85+i*1.9,4.97,c+10.52,1.9,.08,.04);lit(col,-2.85+i*1.9,4.97,c+9.48,1.9,.08,.04);});
  const gt=darkSign('OTHER WORKS',{accent:ac,bg:'#17121f',sub:'STATION 04'});cube('#17121f',0,4.2,c+10,4.6,1.2,.05);plane(gt,4.4,1.1,0,4.2,c+10+.03,0);plane(gt,4.4,1.1,0,4.2,c+10-.03,PI);
  // a direction board at the centre: what's on each side, and Let's Connect straight on
  const arrowTex=(dir,col,title,sub)=>sign({w:1024,h:200,draw(g,w,h){g.clearRect(0,0,w,h);const tip=84,m=8;g.beginPath();
      if(dir<0){g.moveTo(m,h/2);g.lineTo(tip,m);g.lineTo(w-m,m);g.lineTo(w-m,h-m);g.lineTo(tip,h-m);}else if(dir>0){g.moveTo(w-m,h/2);g.lineTo(w-tip,m);g.lineTo(m,m);g.lineTo(m,h-m);g.lineTo(w-tip,h-m);}else{g.rect(m,m,w-2*m,h-2*m);}
      g.closePath();g.fillStyle='#17121f';g.fill();g.lineWidth=10;g.strokeStyle=col;g.stroke();
      const x0=dir<0?tip+30:56;g.fillStyle=col;if(dir===0){g.beginPath();g.moveTo(x0+18,h/2-48);g.lineTo(x0+50,h/2+2);g.lineTo(x0-14,h/2+2);g.closePath();g.fill();g.fillRect(x0+8,h/2,20,48);}else g.fillRect(x0,h/2-46,26,92);
      g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#ffffff';fit(g,title,w-x0-(dir>0?tip+80:90),76,800,HF);g.fillText(title,x0+60,h/2+10);g.fillStyle=col;g.font='21px '+PF;g.fillText(sub,x0+62,h/2+58);}});
  const board=(x,y,dir,col,title,sub,backTitle,backSub,bw)=>{bw=bw||3;const bh=bw*200/1024;
    for(const[side,d,t,st]of[[1,dir,title,sub],[-1,-dir,backTitle||title,backSub||sub]]){const m=plane(arrowTex(d,col,t,st),bw,bh,x,y,c+side*.16,side>0?0:PI,0,{transparent:true});m.material.transparent=false;m.material.alphaTest=.5;}
    if(dir)cube('#17121f',x-dir*(bw/2-.1),y,c,.12,bh*.8,.36);};
  cube('#3a3346',0,.22,c,.8,.44,.8);cube('#2a2233',0,2.3,c,.26,4.2,.26);solid(0,c,.8,.8);
  board(0,4.62,0,ac,"LET'S CONNECT",'STRAIGHT ON','CANYON LINE','BACK TO THE CART',2.6);lit(ac,0,4.32,c,.3,.1,.3);
  board(-1.68,3.6,-1,WC[0],'Motion works','SCREENING ROOM · FIRST LEFT','Motion works','SCREENING ROOM');board(-1.68,2.9,-1,WC[1],'More designs','GALLERY · FURTHER LEFT','More designs','GALLERY');
  board(1.68,3.35,1,WC[2],'Framer works','WEB STUDIO · FIRST RIGHT','Framer works','WEB STUDIO');board(1.68,2.65,1,WC[3],'Vibecoding','CODE DEN · FURTHER RIGHT','Vibecoding','CODE DEN');
  // real work, as small thumbnails, loaded once this station comes into view
  const pics=[];const pic=(n,w,h,o)=>{const p=K.picture(n,w,h,o);pics.push(p);return p;};let loaded=false;anim(()=>{if(!loaded){loaded=true;pics.forEach(p=>p.load());}});

  // the phone outline (img/phone-frame.webp) around every screen in these two rooms; its opening is 88.6% × 95.1% of the frame
  const PHONE=K.LOCAL_FILE?null:(()=>{const t=new THREE.TextureLoader().load(K.BASE+'../img/phone-frame.webp?v=2');t.anisotropy=8;return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false});})(),SR=2.172;
  const phone=(f,W,Hh,y,z)=>{if(PHONE)f.plane(PHONE,W/.886,Hh/.951,0,y,z,0,0);};
  // little name plates under screens and prints
  const plates={};const plate=txt=>plates[txt]||(plates[txt]=sign({w:512,h:72,draw(g,w,h){g.fillStyle='#14161b';g.fillRect(0,0,w,h);g.fillStyle='#e9e4d8';g.font='600 30px '+SYS;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+2);}}));

  // ---------- MOTION WORKS (left, front): a dark screening room, every motion piece playing on the walls ----------
  const MZA=c-12,MZB=c-2,MZ=c-7;room(-22,-7,MZA,MZB,'concreteDark',5,'#1d1f25');
  floor('darkOak',-21.5,MZB-.5,-7,MZA+.5,.035,3);cube('#7a1f2a',-14,.05,MZ,14,.04,1.4);
  const clips=[['motion-peakoo.mp4?v=4',2,'Sleep Zone, Peakmind'],['motion-gift.mp4?v=4',2,'Peakoo Chatbot, Peakmind'],['motion-peakoo2.mp4?v=4',2.17,'Peakoo Chatbot, Peakmind'],
    ['motion-flash1.mp4?v=4',1.98,'Practice Feature, Arivihan'],['motion-flash2.mp4?v=4',1.98,'Practice Feature, Arivihan'],
    ['motion-arivihan.mp4?v=4',2,'Practice Feature, Arivihan'],['motion-arivihan2.mp4?v=4',2.17,'Practice Feature, Arivihan'],['motion-duolingo.mp4?v=4',2,'Personal Work']];
  const mspots=[[-21.42,MZ-2.7,HP],[-21.42,MZ,HP],[-21.42,MZ+2.7,HP],[-18.6,MZA+.56,0],[-15.2,MZA+.56,0],[-11.8,MZA+.56,0],[-16.9,MZB-.56,PI],[-13.5,MZB-.56,PI]];
  const vids=clips.map(([n,ratio,cap],i)=>{const [x,z,ry]=mspots[i],f=F(x,z,ry),W=1.3,Hh=W*SR,v=K.video(n,{cover:SR});
    f.cube('#0b0c0f',0,2.45,0,W+(PHONE?.06:.16),Hh+(PHONE?.06:.16),.08);f.plane(v.mat,W,Hh,0,2.45,.05,0,0);phone(f,W,Hh,2.45,.062);f.lit('#ff6a5a',0,2.45-Hh/2-.14,.05,W,.03,.02);f.plane(plate(cap),W+.2,.28,0,2.45-Hh/2-.38,.05,0,0);return v;});
  anim(()=>{const near=Math.hypot(K.player.x+14.5,K.player.z-MZ)<30;vids.forEach(v=>near?v.play():v.pause());});
  bench(-14,MZ,-HP);const watcher=person({pose:'sit',seat:.5,x:-14,z:MZ,ry:-HP,shirt:'#ffd27a',pants:'#2e3446',style:'long'});watcher.armL.rotation.x=watcher.armR.rotation.x=-.5;
  const stander=person({pose:'stand',x:-16.4,z:MZB-2.4,ry:PI,shirt:'#82b1ff',pants:'#2e3446',style:'short'});solid(-16.4,MZB-2.4,.7,.7);
  anim(t=>{watcher.head.rotation.y=.6*sin(t*.25);stander.head.rotation.y=.3*sin(t*.4+1);});
  const marquee=screen(1024,160,(g,t,w,h)=>{g.fillStyle='#1a0d10';g.fillRect(0,0,w,h);g.fillStyle='#2a1418';g.fillRect(14,14,w-28,h-28);const on=Math.floor(t*6);
    for(let i=0;i<46;i++){const x=24+i*21.8;g.fillStyle=(i+on)%3?'#ffcf6a':'#5a3a20';g.beginPath();g.arc(x,10,5,0,7);g.arc(x,h-10,5,0,7);g.fill();}
    g.textAlign='center';g.textBaseline='middle';g.font='800 76px '+HF;g.fillStyle='#ff6a5a';g.fillText('MOTION WORKS',w/2,h/2+4);},6);
  cube('#1a0d10',-6.6,4.45,MZ,.3,1.2,7.6);plane(marquee,7.4,1.16,-6.43,4.45,MZ,HP,0,{basic:true});

  // ---------- MORE DESIGNS (left, back): a gallery, all sixteen screens hung on the walls ----------
  const GZA=c-25,GZB=c-14,GZ=c-19.5;room(-22,-7,GZA,GZB,'quartz',5,'#e2ded4');floor('birch',-21.5,GZB-.5,-7,GZA+.5,.035,3);
  const shots=[['dark-1','Dark'],['dark-2','Dark'],['adaptive-1','Adaptive Practice'],['adaptive-2','Adaptive Practice'],['atelier-1','Atelier'],['atelier-2','Atelier'],['atelier-3','Atelier'],['atelier-4','Atelier'],['atelier-5','Atelier'],['atelier-6','Atelier'],['atelier-7','Atelier'],['atelier-8','Atelier'],['bloom-1','Bloom'],['bloom-2','Bloom'],['bloom-3','Bloom'],['bloom-4','Bloom']];
  const SX=[-20.2,-17.9,-15.6,-13.3,-11,-8.7],gspots=[...[GZ-3.45,GZ-1.15,GZ+1.15,GZ+3.45].map(z=>[-21.42,z,HP]),...SX.map(x=>[x,GZA+.56,0]),...SX.map(x=>[x,GZB-.56,PI])];
  shots.forEach(([n,label],i)=>{const [x,z,ry]=gspots[i],f=F(x,z,ry),W=1.15,Hh=W*SR,p=pic('../../img/screens/designs/'+n+'.webp',360,780,{top:true});
    f.cube('#16181d',0,2.55,0,W+(PHONE?.06:.14),Hh+(PHONE?.06:.14),.06);f.plane(p.tex,W,Hh,0,2.55,.04,0,0,{basic:true});phone(f,W,Hh,2.55,.052);f.lit('#fff8e6',0,4.4,.35,.5,.05,.18);f.plane(plate(label),W+.1,.24,0,2.55-Hh/2-.3,.04,0,0);});
  const gb=F(-13.6,GZ,HP);gb.cube('#3a3f48',0,.42,0,2.2,.12,.6);for(const a of[-.9,.9])gb.cube('#3a3f48',a,.2,0,.08,.4,.5);gb.solid(0,0,2.3,.7);
  const viewers=[person({pose:'stand',x:-17.9,z:GZA+2.3,ry:PI,shirt:'#f4f4f2',pants:'#2e3446',style:'long',glasses:true}),person({pose:'stand',x:-12.4,z:GZB-2.3,ry:0,shirt:'#2f3640',pants:'#d9cbb0',style:'short'})];viewers.forEach(p=>solid(p.g.position.x,p.g.position.z,.7,.7));
  anim(t=>{viewers.forEach((p,i)=>{p.head.rotation.y=.25*sin(t*.4+i*2);p.armR.rotation.x=i?-.5-.3*Math.max(0,sin(t*.9)):-.2;});});
  const gs=darkSign('MORE DESIGNS',{accent:WC[1],bg:'#f4f1ea',color:'#16181d',sub:'INTERFACE EXPLORATIONS'});cube('#f4f1ea',-6.6,4.45,GZ,.3,1.2,7);plane(gs,4.6,1.15,-6.43,4.45,GZ,HP);

  // ---------- FRAMER WORKS (right, front): a web studio ----------
  const FZA=c-12,FZB=c-2,FZ=c-7;room(22,7,FZA,FZB,'concrete',5,'#d9dbe0');floor('concrete',7,FZB-.5,21.5,FZA+.5,.035,3);
  const shop=pic('framer-shop.jpg',1024,640,{label:'shopandsource.com'}),delta=pic('framer-delta.jpg',1024,640,{label:'deltaoptix.com'});
  browser(21.35,2.6,FZ,-HP,6.4,3.95,shop.tex,'shopandsource.com');
  const df=F(14,FZ-1.6,HP);df.cube('#e9e6df',0,.74,.66,1.6,.06,.8);for(const a of[-.7,.7])df.cube('#3a3f48',a,.37,.66,.06,.74,.6);df.cube('#24262a',0,.47,0,.5,.08,.5);df.cube('#24262a',0,.8,-.24,.5,.6,.06);
  df.cube('#c9ced6',0,1.25,.95,1.3,.82,.06);df.cube('#c9ced6',0,.86,.95,.1,.26,.08);df.plane(delta.tex,1.22,.74,0,1.27,.918,PI,0,{basic:true});df.cube('#d9dde3',0,.785,.5,.5,.02,.16);df.solid(0,.4,1.7,1.7);
  const dsg=df.person({pose:'sit',shirt:'#3a8bff',pants:'#2e3446',style:'bun',hair:'#24180f',glasses:true},0,0);dsg.armL.rotation.x=dsg.armR.rotation.x=-1.05;
  anim(t=>{dsg.armR.rotation.x=-1.05+.06*sin(t*12);dsg.armL.rotation.x=-1.05+.05*sin(t*11+1);dsg.head.rotation.y=.15*sin(t*.5);});
  for(const z of[FZA+.56,FZB-.56])lit('#3a8bff',14.5,1.0,z,14,.06,.04);
  const flogo=sign({w:512,h:512,draw(g,w,h){g.fillStyle='#f4f6fa';g.fillRect(0,0,w,h);g.fillStyle='#3a8bff';const x=176,y=96,k=1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+100*k,y);g.lineTo(x+100*k,y+64*k);g.lineTo(x+50*k,y+64*k);g.fill();g.beginPath();g.moveTo(x,y+64*k);g.lineTo(x+50*k,y+64*k);g.lineTo(x+100*k,y+128*k);g.lineTo(x,y+128*k);g.fill();g.beginPath();g.moveTo(x,y+128*k);g.lineTo(x+50*k,y+128*k);g.lineTo(x+50*k,y+192*k);g.fill();}});
  plane(flogo,2.2,2.2,17,2.6,FZA+.53,0);
  for(const x of[11,14,17]){cube('#2b2420',x,4.6,FZ+2.2,.03,.8,.03);lit('#fff3d6',x,4.12,FZ+2.2,.42,.2,.42);}
  const so=F(11.4,FZB-1.4,PI);so.cube('#3a8bff',0,.3,0,2.2,.35,.8);so.cube('#3a8bff',0,.7,-.36,2.2,.6,.16);for(const a of[-1.05,1.05])so.cube('#2f74d6',a,.5,0,.16,.55,.8);so.solid(0,0,2.3,.9);
  cube('#e9e6df',11.4,.4,FZB-2.8,1.2,.06,.6);for(const a of[-.5,.5])cube('#3a3f48',11.4+a,.2,FZB-2.8,.05,.4,.5);cube('#2b2f36',11.5,.45,FZB-2.8,.4,.02,.28);solid(11.4,FZB-2.8,1.3,.7);
  for(const[x,z]of[[20.6,FZA+1],[20.6,FZB-1]]){cube('#eeeeea',x,.3,z,.5,.6,.5);blk('leaves',x,.95,z,.7,.7,.7);blk('leaves',x,1.4,z,.4,.5,.4);solid(x,z,.6,.6);}
  const fs=sign({w:1024,h:256,draw(g,w,h){g.fillStyle='#0d1a33';g.fillRect(0,0,w,h);g.fillStyle='#3a8bff';g.fillRect(0,0,w,10);const lx=110,ly=60;g.fillStyle='#ffffff';g.beginPath();g.moveTo(lx,ly);g.lineTo(lx+70,ly);g.lineTo(lx+70,ly+45);g.lineTo(lx+35,ly+45);g.fill();g.beginPath();g.moveTo(lx,ly+45);g.lineTo(lx+35,ly+45);g.lineTo(lx+70,ly+90);g.lineTo(lx,ly+90);g.fill();g.beginPath();g.moveTo(lx,ly+90);g.lineTo(lx+35,ly+90);g.lineTo(lx+35,ly+135);g.fill();
    g.textAlign='left';g.textBaseline='middle';fit(g,'FRAMER WORKS',w-300,100,800,HF);g.fillStyle='#fff';g.fillText('FRAMER WORKS',240,h/2-14);g.font='26px '+PF;g.fillStyle='#7fb2ff';g.fillText('WEBSITES BUILT IN FRAMER',244,h/2+58);}});
  cube('#0d1a33',6.6,4.45,FZ,.3,1.2,7);plane(fs,4.6,1.15,6.43,4.45,FZ,-HP);
  interact({x:6.2,z:FZ,y:1.6,my:3.4,r:4.4,verb:'Browse',label:'Framer works',color:WC[2],act:()=>K.openWorks('framer')});

  // ---------- VIBECODING WORKS (right, back): a code den ----------
  const VZA=c-25,VZB=c-14,VZ=c-19.5;room(22,7,VZA,VZB,'concreteDark',5,'#15171c');floor('darkOak',7,VZB-.5,21.5,VZA+.5,.035,3);
  for(const z of[VZA+.56,VZB-.56])lit('#3ee08a',14.5,4.7,z,14,.06,.06);lit('#3ee08a',21.44,4.7,VZ,.06,.06,10.4);
  const heroes=pic('vibe-heroes.jpg',1024,640,{label:'thefallenheroes.in',bg:'#0b0d10'});browser(21.35,2.6,VZ,-HP,6.4,3.95,heroes.tex,'thefallenheroes.in',true);
  const code=screen(512,320,(g,t,w,h)=>{g.fillStyle='#0b0f0c';g.fillRect(0,0,w,h);g.font='20px "Courier New",monospace';const L=['$ npm run dev','> ready on localhost:3000','','const vibe = async () => {','  const idea = await think()','  const app  = build(idea)','  return ship(app)','}','','// shipped ✓'];const n=Math.floor(t*14)%220;let left=n;
    L.forEach((l,i)=>{if(left<=0)return;g.fillStyle=i<2?'#8ad2ff':i===9?'#3ee08a':'#c8f7d6';g.fillText(l.slice(0,left),18,34+i*28);left-=l.length+2;});},8);
  const cf=F(14,VZ+1.2,HP);cf.cube('#1b1d22',0,.74,.66,2.2,.06,.8);for(const a of[-1,1])cf.cube('#2b2f36',a,.37,.66,.06,.74,.6);cf.cube('#1d1f24',0,.47,0,.55,.08,.55);cf.cube('#3ee08a',0,.62,-.28,.55,.04,.04);cf.cube('#1d1f24',0,.85,-.27,.55,.7,.06);
  for(const[a,r]of[[-.72,.35],[0,0],[.72,-.35]]){cf.cube('#0d0f13',a,1.25,.98,.7,.46,.05,r);cf.plane(code,.64,.4,a,1.25,.95,PI+r,0,{basic:true});}
  cf.cube('#1d1f24',0,.785,.48,.62,.03,.18);cf.lit('#ff4fd8',0,.8,.4,.62,.01,.03);cf.cube('#ffd65a',.95,.86,.5,.1,.22,.1);cf.solid(0,.4,2.3,1.7);
  const coder=cf.person({pose:'sit',shirt:'#1f2a24',pants:'#2e3446',headset:true,style:'short',hair:'#17110c'},0,0);coder.armL.rotation.x=coder.armR.rotation.x=-1.05;
  anim(t=>{coder.armR.rotation.x=-1.05+.07*sin(t*15);coder.armL.rotation.x=-1.05+.07*sin(t*14+1);coder.head.rotation.x=.08*sin(t*2.4);});
  cube('#3ee08a',10.5,.32,VZ-3.6,1,.6,1);cube('#3ee08a',10.7,.55,VZ-3.6,.7,.5,.8);solid(10.5,VZ-3.6,1.1,1.1);
  const vs=screen(1024,256,(g,t,w,h)=>{g.fillStyle='#07100b';g.fillRect(0,0,w,h);const f=.75+.25*Math.abs(sin(t*2.3))*(Math.floor(t*7)%13?1:.4);g.shadowColor='#3ee08a';g.shadowBlur=26*f;g.textAlign='center';g.textBaseline='middle';g.font='800 96px '+HF;g.fillStyle=`rgba(120,255,170,${f})`;g.fillText('VIBECODING',w/2,h/2-12);g.shadowBlur=0;g.font='24px '+PF;g.fillStyle='#3ee08a';g.fillText('BUILT WITH AI · SHIPPED FAST',w/2,h/2+66);},8);
  cube('#07100b',6.6,4.45,VZ,.3,1.2,7);plane(vs,4.6,1.15,6.43,4.45,VZ,-HP,0,{basic:true});
  interact({x:6.2,z:VZ,y:1.6,my:3.4,r:4.4,verb:'Explore',label:'Vibecoding works',color:WC[3],act:()=>K.openWorks('vibe')});
  for(const[x,z,k]of[[-8,c+15,'oak'],[9,c+15,'birch'],[-14,c+8.5,'cherry'],[15,c+8.5,'cherry'],[-11,c+2.5,'birch'],[12,c+2.5,'oak'],[23,c+15,'birch'],[-22,c+16,'oak']])tree(x,z,k,5,2);
  flowersAround(-24,c+16,-6,c+13.6,20);flowersAround(-24,c+5.8,-6.5,c+9.5,18);flowersAround(6.5,c+5.8,24,c+9.5,18);flowersAround(-24,c+5,-6.5,c-1,16);flowersAround(6.5,c+5,24,c-1,16);bench(-6.2,c+3.5,HP);bench(6.2,c+3.5,-HP);
  gap(c-28,c-48,"LET'S CONNECT",'');
}

// ===================================================================
// LET'S CONNECT — campfire plaza, contact points, the sea
// ===================================================================
function buildConnect(){
  const c=C.connect,pf=PFo();chunk('connect',C.works-34,C.connect-400);
  scenery(C.works-34,CLIFF,[[C.connect+12,CLIFF]]);
  floor('cobble',-15,c+10,15,CLIFF+.5,.026,2);
  for(const x of[-3.2,3.2]){for(let y=0;y<5;y++)blk('oakLog',x,y+.5,c+10);solid(x,c+10,1,1);}blk('roof-teal',0,5.3,c+10,8,.6,1);
  const gt=woodSign("LET'S CONNECT",{sub:'THE END OF THE LINE'});cube('#3b2414',0,4.2,c+10,4.6,1.2,.05);plane(gt,4.4,1.1,0,4.2,c+10+.03,0);plane(gt,4.4,1.1,0,4.2,c+10-.03,PI);
  // ---------- pavilion (left, open toward the path; teal roof like the side-view Connect station) ----------
  const PX0=-15,PX1=-7,PZ0=c-8,PZ1=c+2,XM=-11,ZM=c-3;
  floor('spruce',PX0,PZ1+.5,PX1+.5,PZ0-.5,.03,3);
  for(const[x,z]of[[PX1,PZ0],[PX1,PZ1],[PX0,PZ0],[PX0,PZ1]]){for(let y=0;y<4;y++)blk('oakLog',x,y+.5,z,.8,1,.8);solid(x,z,.8,.8);}
  for(let z=PZ0;z<=PZ1;z++)for(let y=0;y<4;y++)blk('darkOak',PX0-.4,y+.5,z,.4,1,1);solidBox(PX0-.7,PZ0-.5,PX0-.1,PZ1+.5);
  for(let k=0;k<4;k++){const y=4.3+k*.62,hw=5.2-k*1.3;for(let x=Math.ceil(XM-hw);x<=XM+hw;x++)for(let z=PZ0-1;z<=PZ1+1;z++){if(Math.abs(x-XM)>hw-1.4||k===3||z===PZ0-1||z===PZ1+1)blk('roof-teal',x,y,z,1,.62,1);}}
  plane(tiled('spruce',8,10),8,10,XM,4.02,ZM,0,HP);
  const pix=sign({w:1024,h:180,draw(g,w,h){g.fillStyle='#3a200e';g.fillRect(0,0,w,h);g.fillStyle='#b8722f';g.fillRect(10,10,w-20,h-20);g.fillStyle='#74421c';g.fillRect(20,20,w-40,h-40);g.textAlign='center';g.textBaseline='middle';g.font='64px '+PF;g.fillStyle='#2a1607';g.fillText("LET'S CONNECT",w/2+5,h/2+8);g.fillStyle='#fbe8c0';g.fillText("LET'S CONNECT",w/2,h/2+3);}});
  cube('#3a200e',PX1+.45,4.62,ZM,.1,1.3,7.2);plane(pix,7,1.23,PX1+.51,4.62,ZM,HP);
  const tiles=sign({w:768,h:256,draw(g,w,h){g.fillStyle='#4a2a12';g.fillRect(0,0,w,h);[['in','#1f62b3'],['</>','#2a2d33'],['✉','#d8342a']].forEach(([s,col],i)=>{const x=40+i*246;g.fillStyle='#7a4a22';g.fillRect(x,28,200,200);g.fillStyle=col;g.fillRect(x+16,44,168,168);g.fillStyle='#fff';g.font='800 80px '+HF;g.textAlign='center';g.textBaseline='middle';g.fillText(s,x+100,132);});}});
  plane(tiles,6,2,PX0-.18,2.5,ZM,HP);
  lantern(XM,3.4,c-6,true);lantern(XM,3.4,c,true);
  // résumé lectern
  const lect=F(-12.2,ZM,HP);lect.cube('#6b4423',0,.55,0,.5,1.1,.4);lect.cube('#8a5a2a',0,1.15,.05,.9,.08,.7,0,.35);lect.cube('#f6f3ea',0,1.2,.06,.7,.04,.5,0,.35);solid(-12.2,ZM,.8,.9);
  const resT=sign({w:256,h:160,draw(g,w,h){g.fillStyle='#fbfaf5';g.fillRect(0,0,w,h);g.fillStyle='#2a1607';g.font='800 34px '+HF;g.fillText('RÉSUMÉ',20,48);g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<5;k++)g.fillRect(20,70+k*16,180-k*18,7);}});
  lect.plane(resT,.66,.42,0,1.235,.07,0,-HP+.35);
  interact({x:-11.5,z:ZM,y:1.4,my:2.5,r:3.6,marker:false,verb:'Open',label:'my résumé',color:'#ffd65a',act:()=>K.openLink(pf.resume,'the résumé')});
  // LinkedIn board + mailbox, either side of the campfire
  const li=F(-5.4,c-6.4,HP*.55);li.cube('#6b4423',-.9,1.1,0,.14,2.2,.14);li.cube('#6b4423',.9,1.1,0,.14,2.2,.14);li.cube('#1f62b3',0,1.6,0,2.1,1.3,.1);
  const liT=sign({w:512,h:320,draw(g,w,h){g.fillStyle='#1f62b3';g.fillRect(0,0,w,h);g.fillStyle='#fff';rr(g,40,60,140,140,22);g.fill();g.fillStyle='#1f62b3';g.font='800 100px '+HF;g.textAlign='center';g.fillText('in',110,170);g.textAlign='left';g.fillStyle='#fff';g.font='800 46px '+HF;g.fillText('Connect',210,120);g.fillText('on LinkedIn',210,176);g.font='600 22px '+SYS;g.fillStyle='rgba(255,255,255,.8)';g.fillText('Nishant J. Dixit',44,262);}});
  li.plane(liT,2,1.22,0,1.6,.06,0);solid(-5.4,c-6.4,1.6,1.6);
  interact({x:-4.8,z:c-5.8,y:1.6,my:2.8,r:3.6,marker:false,verb:'Connect on',label:'LinkedIn',color:'#5aa2ff',act:()=>K.openLink(pf.linkedin,'LinkedIn')});
  const mb=F(7.2,c-6.4,-HP*.55);mb.cube('#4a2e18',0,.55,0,.14,1.1,.14);mb.cube('#d8342a',0,1.35,0,.62,.5,.9);mb.cube('#b52a20',0,1.62,0,.62,.12,.9);mb.cube('#1b1d22',0,1.35,.46,.4,.06,.02);solid(7.2,c-6.4,1,1);
  const fl=mb.W(.36,0);const flag=grp(fl[0],1.4,fl[1]);flag.rotation.y=-HP*.55;const fm=new Merge();fm.box('#ffd65a',0,.25,0,.04,.5,.04);fm.box('#ffd65a',0,.42,.1,.04,.16,.22);flag.add(fm.mesh());
  anim(t=>{flag.rotation.x=-.6*Math.max(0,sin(t*1.5));});
  interact({x:6.6,z:c-5.8,y:1.4,my:2.4,r:3.6,marker:false,verb:'Send',label:'me an email',color:'#ff8a80',act:()=>K.openMail()});
  // bobbing badges over the three ways to get in touch, so it's clear they can be clicked
  const badge=(kind,col,x,y,z)=>{const sp=spr((g,w,h)=>{rr(g,8,8,w-16,w-16,26);g.fillStyle=col;g.fill();g.strokeStyle='rgba(255,255,255,.92)';g.lineWidth=6;g.stroke();g.fillStyle='#fff';
      if(kind==='in'){g.font='800 70px '+HF;g.textAlign='center';g.textBaseline='middle';g.fillText('in',w/2,w/2+4);}
      else if(kind==='cv'){g.fillRect(40,28,48,66);g.fillStyle=col;for(let k=0;k<4;k++)g.fillRect(48,42+k*12,32-(k%2)*10,5);}
      else{g.fillRect(26,40,76,50);g.strokeStyle=col;g.lineWidth=6;g.beginPath();g.moveTo(28,42);g.lineTo(64,70);g.lineTo(100,42);g.stroke();}
      g.fillStyle=col;g.beginPath();g.moveTo(w/2-18,w-8);g.lineTo(w/2+18,w-8);g.lineTo(w/2,h-6);g.closePath();g.fill();},128,160,.8,x,y,z);sp.userData.y=y;return sp;};
  const badges=[badge('in','#1f62b3',-5.4,3.05,c-6.4),badge('cv','#d9a42b',-12.2,2.35,ZM),badge('mail','#d8342a',7.2,2.6,c-6.4)];
  anim(t=>{badges.forEach((b,i)=>{b.position.y=b.userData.y+.16*sin(t*2.6+i*1.3);});});
  // campfire, with the rider from Normal Mode waiting by it
  const fx=0,fz=c-2;for(let i=0;i<10;i++){const a=i*PI/5;blk('cobble',fx+sin(a)*.95,.15,fz+cos(a)*.95,.45,.3,.45);}cube('#5a3a1e',fx,.2,fz,1.1,.18,.2,.5);cube('#5a3a1e',fx,.2,fz,1.1,.18,.2,-.6);solid(fx,fz,1.6,1.6);
  const flames=[];for(let i=0;i<7;i++){const m=box(i%2?'#ffb02e':'#ff6a1a',true);m.position.set(fx+(rnd()-.5)*.5,.5,fz+(rnd()-.5)*.5);K.group.add(m);flames.push(m);}
  const fire=new THREE.PointLight('#ff9a4a',2.2,13,2);fire.position.set(fx,1.2,fz);K.group.add(fire);
  const EN=24,emb=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.05,.05),new THREE.MeshBasicMaterial({color:'#ffb35a'}),EN);emb.frustumCulled=false;K.group.add(emb);const ep=[...Array(EN)].map(()=>({x:(rnd()-.5)*.6,z:(rnd()-.5)*.6,y:rnd()*3,s:.6+rnd()*.8}));const _o=new THREE.Object3D();
  anim((t,dt)=>{flames.forEach((m,i)=>{const s=.25+.18*Math.abs(sin(t*7+i*1.7));m.scale.set(s,s*2.2,s);m.position.y=.35+s;});fire.intensity=2+.5*sin(t*13)+.3*sin(t*7.3);
    ep.forEach((e,i)=>{e.y+=dt*e.s;if(e.y>3.2)e.y=.3;_o.position.set(fx+e.x+sin(t*2+i)*.2*e.y,e.y,fz+e.z);_o.scale.setScalar(1-e.y/3.4);_o.updateMatrix();emb.setMatrixAt(i,_o.matrix);});emb.instanceMatrix.needsUpdate=true;});
  for(const a of[PI*.75,PI*1.25,PI*1.75]){const x=fx+sin(a)*2.6,z=fz+cos(a)*2.6;cube('#6b4423',x,.3,z,1.8,.5,.55,a+HP);solid(x,z,1.4,1.4);}
  const ha=PI*.75,host=person({pose:'sit',seat:.55,x:fx+sin(ha)*2.6,z:fz+cos(ha)*2.6,ry:ha+PI,shirt:'#2aa85a',pants:'#30354a',shoe:'#3a2e28',cap:'#f6c01e',skin:'#e3ab7c',hair:'#2a1b12'});
  let waveT=-9;anim(t=>{const near=Math.hypot(K.player.x-host.g.position.x,K.player.z-host.g.position.z)<7;const w=near||t-waveT<3;host.armR.rotation.x=w?-2.8:-.6;host.armR.rotation.z=w?.3*sin(t*9):0;host.head.rotation.y=.25*sin(t*.6);});
  interact({x:host.g.position.x,z:host.g.position.z,y:1.2,my:2.6,r:3.4,verb:'Say hi to',label:'Nishant',color:'#2aa85a',act:()=>{waveT=K.t;K.toast('Thanks for walking through my work. Let’s build something together!');}});
  for(const z of[c+4,c-1])bench(11.5,z,-HP);bush(13.4,c+6.5,1);bush(13.4,c-3.5,1);flowersAround(9,c+8,14,c-6,24);
  // overlook: fence at the cliff edge, benches facing the sea, thank-you sign
  for(let x=-24;x<=24;x+=1.5)cube('#9a6a3a',x,.55,CLIFF+.25,.16,1.1,.16);for(const h of[.45,.85])cube('#a8763f',0,h,CLIFF+.25,48,.09,.07);
  const ty=woodSign('THANKS FOR EXPLORING',{sub:'NISHANT J. DIXIT · PRODUCT DESIGNER'});cube('#6b4423',-8.5,1.3,CLIFF+1.5,.16,2.6,.16);cube('#6b4423',-4.5,1.3,CLIFF+1.5,.16,2.6,.16);cube('#3b2414',-6.5,2.2,CLIFF+1.5,4.3,1.1,.08);plane(ty,4.1,1.02,-6.5,2.2,CLIFF+1.55,0);solidBox(-8.7,CLIFF+1.3,-4.3,CLIFF+1.7);
  for(const x of[-14,9,13,17])bench(x,CLIFF+3.2,PI);
  for(const[x,z,k]of[[-20,c+12,'cherry'],[20,c+12,'oak'],[-22,c-2,'birch'],[22,c-4,'cherry'],[18,c-11,'spruce'],[-19,c-11,'birch']])tree(x,z,k,5,2);
  flowersAround(15.5,c+10,24,CLIFF+2,30);flowersAround(-24,c+10,-15.5,CLIFF+2,30);
}

// ===================================================================
// build everything, then register zones and the light along the path
// ===================================================================
// grass tufts and wildflower patches on the open ground along the walk (never on paths, floors or inside anything solid)
function buildMeadow(){
  chunk('meadow',ZMAX+60,CLIFF-10);const W=50,Z0=ZMAX,NZm=Math.ceil(ZMAX-CLIFF)+2,blockd=new Uint8Array(W*NZm);
  const mark=(x0,z0,x1,z1)=>{for(let gz=Math.max(0,Math.floor(Z0-z1-.4));gz<=Math.min(NZm-1,Math.floor(Z0-z0+.4));gz++)for(let gx=Math.max(0,Math.floor(x0+25-.4));gx<=Math.min(W-1,Math.floor(x1+25+.4));gx++)blockd[gz*W+gx]=1;};
  for(const f of K.floors)if(!/^(grassTop|moss|podzol)$/.test(f[4]))mark(f[0],f[1],f[2],f[3]);
  for(const q of K.solids)if(q[2]-q[0]<40&&q[3]-q[1]<40)mark(q[0],q[1],q[2],q[3]);
  const quad=new THREE.BufferGeometry();quad.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0,0,0,-.5,0,0,.5,0,1,.5,0,1,-.5],3));
  quad.setAttribute('normal',new THREE.Float32BufferAttribute(Array(24).fill(0).map((_,i)=>i%3===1?1:0),3));quad.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],2));quad.setIndex([0,1,2,0,2,3,0,2,1,0,3,2,4,5,6,4,6,7,4,6,5,4,7,6]);
  const tex=draw=>{const c=document.createElement('canvas');c.width=c.height=64;draw(c.getContext('2d'));return new THREE.CanvasTexture(c);};
  const blades=(g,n,base)=>{for(let i=0;i<n;i++){const x=6+rnd()*52,h=20+rnd()*40,l=(rnd()-.5)*16;g.strokeStyle=`rgb(${base[0]+rnd()*50|0},${base[1]+rnd()*50|0},${base[2]+rnd()*30|0})`;g.lineWidth=2+rnd()*2.2;g.beginPath();g.moveTo(x,64);g.quadraticCurveTo(x+l*.3,64-h*.6,x+l,64-h);g.stroke();}};
  const grassT=tex(g=>blades(g,28,[96,140,42]));
  const flowerT=col=>tex(g=>{blades(g,10,[80,128,40]);for(let i=0;i<5;i++){const x=12+rnd()*40,y=10+rnd()*22;g.fillStyle='rgba(60,110,30,1)';g.fillRect(x-1,y,2,64-y);g.fillStyle=col;for(let k=0;k<5;k++){g.beginPath();g.arc(x+Math.cos(k*1.26)*3.2,y+Math.sin(k*1.26)*3.2,3,0,7);g.fill();}g.fillStyle='#ffe27a';g.beginPath();g.arc(x,y,1.8,0,7);g.fill();}});
  const mk=(t,n)=>{const m=new THREE.InstancedMesh(quad,new THREE.MeshLambertMaterial({map:t,alphaTest:.5}),n);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);m.count=0;m.castShadow=false;m.receiveShadow=true;m.frustumCulled=false;K.group.add(m);return m;};
  const LOWQ=matchMedia('(hover: none) and (pointer: coarse)').matches||(navigator.hardwareConcurrency||8)<=4,NG=LOWQ?1800:5000,NF=LOWQ?220:520;
  const grass=mk(grassT,NG),flowers=['#5b7bff','#ffd23a','#f6f4ee','#b67cff','#ff8fb3'].map(c=>mk(flowerT(c),NF));
  const _m4=new THREE.Matrix4(),_q4=new THREE.Quaternion(),_e4=new THREE.Euler(),_p4=new THREE.Vector3(),_s4=new THREE.Vector3(),_c4=new THREE.Color();
  const put=(m,x,z,sc,h)=>{_e4.set(0,rnd()*PI,0);_q4.setFromEuler(_e4);_m4.compose(_p4.set(x,0,z),_q4,_s4.set(sc,sc*h,sc));m.setMatrixAt(m.count,_m4);m.setColorAt(m.count,_c4.setScalar(.82+rnd()*.3));m.count++;};
  const fn=(x,z)=>Math.sin(x*.21+z*.07)*Math.sin(z*.17-x*.05);
  for(let gz=0;gz<NZm;gz++){const z=Z0-gz-.5;if(z<EA&&z>EB)continue;if(z<CLIFF+1)break;
    for(let gx=0;gx<W;gx++){if(blockd[gz*W+gx])continue;const x=gx-25+.5;if(Math.abs(x)<3.4||Math.abs(x)>24.4)continue;
      if(grass.count<NG&&rnd()<.5)put(grass,x+(rnd()-.5)*.9,z+(rnd()-.5)*.9,.5+rnd()*.45,.8+rnd()*.6);
      const pz=fn(x,z);if(pz>.35&&rnd()<.5){const m=flowers[((x*3+z*7)%5+5)%5|0];if(m.count<NF)put(m,x+(rnd()-.5)*.9,z+(rnd()-.5)*.9,.55+rnd()*.3,1);}}}
  for(const m of[grass,...flowers]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
}
buildGlobal();buildStart();buildArivihan();buildPeakmind();buildEdme();buildDepot();buildCanyon();buildArrival();buildWorks();buildConnect();buildMeadow();

const S=(id,num,name,kicker,sub,blurb,c,z0,z1)=>zone({id,num,name,kicker,sub,blurb,accent:AC[id],station:!!num,z:c,z0,z1,spawn:{x:0,z:c+(num?12:5),yaw:0,pitch:-.05}});
S('start','','Welcome','Start','','Where the journey begins',C.start,ZMAX+4,-12);
S('arivihan','01','Arivihan','EdTech · AI learning','A school with live classes on your left · a self-study library on your right','A live-class school and a self-study library',C.arivihan,C.arivihan+16,C.arivihan-22);
S('peakmind','02','Peakmind','Student wellness','A meditation class on your left · students in their own nooks on your right','A meditation class and personal wellness nooks',C.peakmind,C.peakmind+18,C.peakmind-22);
S('edme','03','EDME Insurance','Insurance · Enterprise','An insurance office and a customer care centre','Insurance office, dashboards and customer care',C.edme,C.edme+18,C.edme-22);
S('works','04','Other Works','Motion · Design · Web · Code','Motion and designs on your left · Framer and vibecoding on your right','Motion, more designs, Framer and vibecoding',C.works,C.works+18,C.works-28);
zone({id:'connect',num:'',name:"Let's Connect",kicker:'The end of the line',sub:'Résumé, LinkedIn and email, and the sea at the end of the line',blurb:'Résumé, LinkedIn and email',accent:AC.connect,station:true,z:C.connect,z0:C.connect+18,z1:CLIFF-10,spawn:{x:0,z:C.connect+13,yaw:0,pitch:-.05}});

// light along the path: sun direction (sd), sky (top/hor/bot), fog, hemisphere (hs/hg/hi), sun colour/intensity (sc/si)
const base={top:'#5a9be3',hor:'#f1dcc2',bot:'#bba98a',fog:'#e9dcc4',near:28,far:100,hs:'#e7f0ff',hg:'#7a6a4c',hi:.74,sc:'#fff0d6',si:.9,sd:[.55,.62,.5]};
const A=(z,o)=>Object.assign({},base,o,{z});
const TUN={top:'#3f86e0',hor:'#d9e7f1',bot:'#a4b6c2',fog:'#e4edf2',near:6,far:60,hs:'#a08468',hg:'#4a3624',hi:.62,sc:'#ffb36b',si:.2,sd:[.55,.62,.5]};
const CANYON={top:'#3f86e0',hor:'#d9e7f1',bot:'#a4b6c2',fog:'#d3e2ec',near:110,far:640,hs:'#eef6ff',hg:'#7a7458',hi:1.05,sc:'#fff4dc',si:1,sd:[.55,.62,.5]};
ambience([
  A(C.start,{}),
  A(C.arivihan,{top:'#4f95e6',hor:'#e8eef2',fog:'#e4e9ea',hs:'#eef5ff',sc:'#fff6e6',si:.94}),
  A(C.peakmind,{top:'#6fa8c9',hor:'#d6eadb',bot:'#8fa886',fog:'#cfe3d3',near:18,far:85,hs:'#e4f6e8',hg:'#5a6a46',hi:.86,sc:'#fff3d9',si:.78,sd:[.35,.7,.6]}),
  A(C.edme,{top:'#4d86d6',hor:'#dfe7f1',fog:'#dde5ee',hs:'#eaf1ff',hg:'#6f6a60',sc:'#f6fbff',si:.9,hi:.7,sd:[.6,.68,.42]}),
  A(-175,CANYON),A(TZ0+3,CANYON),A(TZ0-1,TUN),A(TZ1+1,TUN),A(TZ1-3,CANYON),A(EB-4,CANYON),
  A(C.works,{top:'#5a8fd8',hor:'#f6dcb4',fog:'#f0dcbc',hs:'#fff1dc',hg:'#806a4a',sc:'#ffe4b8',si:.95,sd:[.5,.45,.25]}),
  A(C.connect+20,{top:'#4a63a8',hor:'#ffc39a',bot:'#c98a6a',fog:'#f2bd98',near:30,far:110,hs:'#ffe2c8',hg:'#5a4636',hi:.75,sc:'#ffb36b',si:.9,sd:[-.08,.16,-1]}),
  A(C.connect-30,{top:'#3d55a0',hor:'#ffb07a',bot:'#c07a5a',fog:'#f4b48c',near:34,far:130,hs:'#ffd9b8',hg:'#4a3a2e',hi:.72,sc:'#ffa860',si:.88,sd:[-.08,.13,-1]})
]);
};
