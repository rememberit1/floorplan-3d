(function(){
const S=0.06, OX=75, OY=210, H=9, T=0.4;           // ft per plan pixel, origin, ceiling, wall thickness
const P=(x,y)=>[(x-OX)*S,(y-OY)*S];
// wall segments in plan px: [x1,y1,x2,y2, opts]; win:[a,b] window span along segment (px), h: height
const W=[
 [75,210,75,685],[75,210,135,210],[135,210,135,280],[135,320,135,335],[75,335,160,335],[260,335,290,335],
 [135,240,270,240,{h:3.4,rail:1}],[270,240,270,335],
 [270,250,425,250,{win:[300,400]}],[425,250,615,250,{win:[465,580]}],[615,250,615,430,{win:[285,370]}],
 [425,250,425,355],[425,395,425,400],[425,400,470,400],
 [470,430,725,430],[725,430,725,685,{win:[455,560]}],[470,430,470,535],
 [75,585,100,585],[210,585,240,585],[330,585,410,585],[445,585,600,585],[640,585,725,585],
 [75,685,245,685],[300,685,725,685],[235,585,235,685],[335,585,335,685],[580,585,580,685]
];
const ROOMS=[ // x1,y1,x2,y2,name,material
 [75,210,135,335,'Mechanical','tile'],[135,240,270,335,'Balcony','deck'],
 [75,335,300,585,'Living Room','wood'],[270,250,425,390,'Dining','wood'],[300,390,470,585,'Kitchen','wood'],
 [425,250,615,430,'Bedroom 1','carpet'],[470,430,725,585,'Bedroom 2','carpet'],
 [75,585,235,685,'Laundry','tile'],[235,585,335,685,'Entry','tile'],[335,585,580,685,'Bath','tile'],[580,585,725,685,'Walk-in Closet','carpet'],
 [290,335,300,390,'','wood']
];
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
r.setPixelRatio(Math.min(devicePixelRatio,2));r.setSize(innerWidth,innerHeight);
r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputEncoding=THREE.sRGBEncoding;
r.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(r.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xbfd8ee);scene.fog=new THREE.Fog(0xbfd8ee,80,200);
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,500);
scene.add(new THREE.HemisphereLight(0xffffff,0x8a7a66,0.55));
const sun=new THREE.DirectionalLight(0xfff1dd,0.9);sun.position.set(-20,45,-15);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:120});
sun.shadow.radius=4;sun.shadow.bias=-0.0005;sun.target.position.set(20,0,15);scene.add(sun,sun.target);
// procedural textures
function tex(kind){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 const f={wood:['#8a6a4a',(i)=>{for(let y=0;y<256;y+=32){g.fillStyle=`hsl(28,${30+Math.random()*15}%,${32+Math.random()*10}%)`;g.fillRect(0,y,256,31);
   for(let k=0;k<20;k++){g.strokeStyle='rgba(0,0,0,.08)';g.beginPath();const yy=y+Math.random()*31;g.moveTo(0,yy);g.lineTo(256,yy+Math.random()*4-2);g.stroke();}
   g.fillStyle='rgba(0,0,0,.35)';g.fillRect((y*37)%256,y,2,31);}}],
  tile:['#ddd',()=>{g.fillStyle='#e6e3dc';g.fillRect(0,0,256,256);g.strokeStyle='#b8b3a8';g.lineWidth=3;for(let i=0;i<=256;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.moveTo(0,i);g.lineTo(256,i);g.stroke();}}],
  carpet:['#999',()=>{g.fillStyle='#a9a294';g.fillRect(0,0,256,256);for(let k=0;k<6000;k++){g.fillStyle=`rgba(${Math.random()>.5?255:0},${Math.random()>.5?255:0},${Math.random()>.5?255:0},.05)`;g.fillRect(Math.random()*256,Math.random()*256,2,2);}}],
  deck:['#777',()=>{for(let x=0;x<256;x+=21){g.fillStyle=`hsl(30,15%,${38+Math.random()*8}%)`;g.fillRect(x,0,19,256);}}]}[kind];
 f[1]();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t;}
const FT={wood:4,tile:4,carpet:6,deck:4};
const matCache={};function floorMat(k){if(!matCache[k])matCache[k]=new THREE.MeshStandardMaterial({map:tex(k),roughness:k=='tile'?0.35:0.8});return matCache[k];}
const labels=[];
ROOMS.forEach(([x1,y1,x2,y2,n,m])=>{const [a,b]=P(x1,y1),[c,d]=P(x2,y2);const w=c-a,h=d-b;
 const t=floorMat(m).map.clone();t.needsUpdate=true;t.repeat.set(w/FT[m],h/FT[m]);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:m=='tile'?.35:.8}));
 mesh.rotation.x=-Math.PI/2;mesh.position.set(a+w/2,0.01,b+h/2);mesh.receiveShadow=true;scene.add(mesh);
 if(n){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const g=cv.getContext('2d');g.font='bold 54px system-ui,sans-serif';g.textAlign='center';
  g.fillStyle='rgba(20,20,30,.75)';const tw=g.measureText(n).width+40;g.beginPath();g.roundRect?g.roundRect(256-tw/2,20,tw,88,20):g.rect(256-tw/2,20,tw,88);g.fill();
  g.fillStyle='#fff';g.fillText(n,256,82);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));
  sp.scale.set(6,1.5,1);sp.position.set(a+w/2,10.5,b+h/2);sp.renderOrder=10;scene.add(sp);labels.push({sp,n,x:a+w/2,z:b+h/2,ft:`${w.toFixed(0)}' × ${h.toFixed(0)}'`});}});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x7d9a6a,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.05;ground.receiveShadow=true;scene.add(ground);
// walls
const wallMat=new THREE.MeshStandardMaterial({color:0xf2efe9,roughness:.9});const glass=new THREE.MeshStandardMaterial({color:0x9fd0ff,transparent:true,opacity:.25,roughness:.05,metalness:.2});
const railMat=new THREE.MeshStandardMaterial({color:0x333333,metalness:.6,roughness:.4});
const segs=[];const wallGroup=new THREE.Group();scene.add(wallGroup);
function box(len,h,y0,a,b,ang,mat,th=T){const m=new THREE.Mesh(new THREE.BoxGeometry(len,h,th),mat);m.position.set(a,y0+h/2,b);m.rotation.y=-ang;m.castShadow=m.receiveShadow=true;wallGroup.add(m);return m;}
W.forEach(([x1,y1,x2,y2,o={}])=>{const [a,b]=P(x1,y1),[c,d]=P(x2,y2);const L=Math.hypot(c-a,d-b),ang=Math.atan2(d-b,c-a);
 segs.push([a,b,c,d]);const at=(t0,t1)=>[(a+(c-a)*(t0+t1)/2/L),(b+(d-b)*(t0+t1)/2/L)];
 const hh=o.h||H,mat=o.rail?railMat:wallMat;
 if(o.rail){const [m1,m2]=at(0,L);box(L,0.15,3.3,m1,m2,ang,railMat,0.2);for(let s=0;s<=L;s+=0.5){const q=[a+(c-a)*s/L,b+(d-b)*s/L];box(0.08,3.3,0,q[0],q[1],ang,railMat,0.08);}return;}
 if(o.win){const s0=Math.abs((x1!=x2)?o.win[0]-x1:o.win[0]-y1)*S,s1=Math.abs((x1!=x2)?o.win[1]-x1:o.win[1]-y1)*S;
  let p=at(0,s0);box(s0,hh,0,p[0],p[1],ang,mat);p=at(s1,L);box(L-s1,hh,0,p[0],p[1],ang,mat);
  p=at(s0,s1);box(s1-s0,2.6,0,p[0],p[1],ang,mat);box(s1-s0,1.2,7.8,p[0],p[1],ang,mat);box(s1-s0,5.2,2.6,p[0],p[1],ang,glass,0.08);
 }else{const p=at(0,L);box(L+T,hh,0,p[0],p[1],ang,mat);}});
// door headers over openings (visual), simple
// furniture
const fur=new THREE.Group();scene.add(fur);
function F(x1,y1,x2,y2,h,color,y0=0,opt={}){const [a,b]=P(x1,y1),[c,d]=P(x2,y2);const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(c-a),h,Math.abs(d-b)),
 new THREE.MeshStandardMaterial({color,roughness:opt.r??.7,metalness:opt.m??0}));m.position.set((a+c)/2,y0+h/2,(b+d)/2);m.castShadow=m.receiveShadow=true;fur.add(m);if(opt.solid!==false&&y0<2.5)segsBox(a,b,c,d);return m;}
function segsBox(a,b,c,d){segs.push([a,b,c,b],[c,b,c,d],[c,d,a,d],[a,d,a,b]);}
function cyl(x,y,rad,h,color,y0=0){const [a,b]=P(x,y);const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,h,24),new THREE.MeshStandardMaterial({color,roughness:.6}));m.position.set(a,y0+h/2,b);m.castShadow=m.receiveShadow=true;fur.add(m);return m;}
// living
F(235,395,275,480,1.4,0x5f8a6e);F(262,395,278,480,2.6,0x557d63);       // sofa + back
F(175,405,230,470,1.2,0xf3efe6);                                        // coffee table/rug
F(92,405,108,470,1.6,0x3b3b3b);F(78,410,84,465,2.6,0x111111,3);          // TV stand + TV
cyl(195,380,1.1,1.6,0x6c9a7a);cyl(195,490,1.1,1.6,0x6c9a7a);           // chairs
F(160,395,280,485,0.03,0xd8d2c4,0,{solid:false});                        // rug
cyl(130,555,0.9,1.4,0x8b5a2b);cyl(130,555,1.2,1.8,0x3f7d3a,1.4);         // plant
// dining
cyl(353,320,1.6,0.12,0x222222,2.4);cyl(353,320,0.2,2.4,0x222222);
[[335,300],[371,300],[335,342],[371,342]].forEach(([x,y])=>cyl(x,y,0.6,1.5,0xeeeeee));
F(315,290,395,350,0.03,0x9b9478,0,{solid:false});
// kitchen island + L counter
F(302,392,352,535,3,0xd9d3c4);F(302,392,352,535,0.15,0xe9e4da,3,{solid:false});F(305,470,350,510,0.02,0xd2691e,3.16,{solid:false});
F(425,402,468,535,3,0x2d2d2d);F(420,402,470,535,0.15,0xd47014,3,{solid:false});F(428,402,468,470,6,0x444444,0,{solid:false}).position.y=3+0.15+3; // upper cabinets
F(430,440,460,465,0.05,0x111111,3.16,{solid:false}); // cooktop
// bedroom 1
F(475,305,565,375,2,0x3e6fa0);F(565,300,580,380,3.6,0x4a3a2a);F(540,310,563,370,2.15,0xffffff);
F(570,282,590,302,2,0x5a4636);F(570,380,590,398,2,0x5a4636);
F(475,404,612,428,7,0xdcd6cc);  // closet shelving
// bedroom 2
F(478,455,555,520,2,0x9a9a9a);F(472,450,482,525,3.6,0x4a3a2a);F(482,462,500,512,2.15,0xffffff);
F(650,495,680,555,2.6,0x4a3a2a);F(622,440,672,472,1.6,0xa89a8a);
// laundry
F(110,592,145,622,3,0xf5f5f5);F(160,592,195,622,3,0xf5f5f5);
// entry closet
F(290,590,332,620,8,0xcfc8bb);
// bath
F(338,590,408,630,1.8,0xfafafa);F(415,618,440,640,1.4,0xfdfdfd);F(415,640,440,652,2.6,0xfdfdfd);
F(450,640,575,680,2.9,0x6b5a46);F(450,640,575,680,0.12,0xe8e1d5,2.9,{solid:false});F(452,682,573,684,3.5,0xc9e3f2,4,{solid:false});
// walk-in closet shelving
F(585,640,720,682,6,0xdcd6cc);F(680,595,722,640,6,0xdcd6cc);
// ceilings (hidden in dollhouse)
const ceil=new THREE.Mesh(new THREE.PlaneGeometry(45,40),new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide}));
ceil.rotation.x=Math.PI/2;ceil.position.set(20,H,15);scene.add(ceil);
// interior lights
[[180,450],[350,450],[520,330],[600,510],[450,640],[150,640]].forEach(([x,y])=>{const [a,b]=P(x,y);const l=new THREE.PointLight(0xffe2b8,0.35,22,2);l.position.set(a,H-0.6,b);scene.add(l);});
// ---------- controls ----------
const [sx,sz]=location.hash=='#living'?P(140,520):P(270,640);const pl={x:sx,z:sz,yaw:location.hash=='#living'?-1.0:0,pitch:-0.05};let mode=location.hash=='#orbit'?'orbit':'walk';
const orb={th:0.35,ph:0.7,d:55,tx:20,tz:14};
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='KeyO'||e.code=='Tab'){e.preventDefault();toggle();}if(e.code=='KeyH')document.getElementById('help').classList.toggle('hide');if(e.code=='KeyL')labels.forEach(l=>l.sp.visible=!l.sp.visible);});
addEventListener('keyup',e=>keys[e.code]=0);
const cv=r.domElement;cv.addEventListener('click',()=>{if(mode=='walk'&&!isTouch)cv.requestPointerLock&&cv.requestPointerLock();});
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){pl.yaw-=e.movementX*0.0025;pl.pitch=Math.max(-1.4,Math.min(1.4,pl.pitch-e.movementY*0.0025));}
 else if(mode=='orbit'&&e.buttons){orb.th-=e.movementX*0.006;orb.ph=Math.max(0.15,Math.min(1.5,orb.ph-e.movementY*0.006));}});
cv.addEventListener('wheel',e=>{if(mode=='orbit')orb.d=Math.max(12,Math.min(110,orb.d*(1+e.deltaY*0.001)));},{passive:true});
function toggle(){mode=mode=='walk'?'orbit':'walk';if(mode=='orbit'&&document.exitPointerLock)document.exitPointerLock();applyMode();}
function applyMode(){const o=mode=='orbit';ceil.visible=!o;labels.forEach(l=>l.sp.position.y=o?10.5:7.6);document.getElementById('modeBtn').textContent=o?'🚶 Walk mode':'🏠 Dollhouse';document.getElementById('mode').textContent=o?'Dollhouse view':'Walk mode';}
document.getElementById('modeBtn').onclick=toggle;
// touch
const isTouch='ontouchstart' in window;const joy={x:0,y:0};
if(isTouch){document.getElementById('touch').style.display='block';const st=document.getElementById('stick'),kn=document.getElementById('knob');let sid=null,lid=null,lx=0,ly=0,c0;
 st.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sid=t.identifier;c0=st.getBoundingClientRect();e.preventDefault();},{passive:false});
 addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===sid){let dx=t.clientX-(c0.left+c0.width/2),dy=t.clientY-(c0.top+c0.height/2);const m=Math.hypot(dx,dy),R=50;if(m>R){dx*=R/m;dy*=R/m;}joy.x=dx/R;joy.y=dy/R;kn.style.transform=`translate(${dx}px,${dy}px)`;}
  else if(t.identifier===lid){const dx=t.clientX-lx,dy=t.clientY-ly;lx=t.clientX;ly=t.clientY;if(mode=='walk'){pl.yaw-=dx*.005;pl.pitch=Math.max(-1.4,Math.min(1.4,pl.pitch-dy*.005));}else{orb.th-=dx*.008;orb.ph=Math.max(.15,Math.min(1.5,orb.ph-dy*.008));}}}},{passive:false});
 cv.addEventListener('touchstart',e=>{const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY;},{passive:true});
 addEventListener('touchend',e=>{for(const t of e.changedTouches){if(t.identifier===sid){sid=null;joy.x=joy.y=0;kn.style.transform='';}if(t.identifier===lid)lid=null;}});}
// collision
const RAD=0.9;function collide(x,z){for(let it=0;it<3;it++)for(const [a,b,c,d] of segs){const dx=c-a,dz=d-b,l2=dx*dx+dz*dz||1;let t=((x-a)*dx+(z-b)*dz)/l2;t=Math.max(0,Math.min(1,t));
 const px=a+dx*t,pz=b+dz*t;let ex=x-px,ez=z-pz;const dd=Math.hypot(ex,ez),min=RAD+T/2;if(dd<min){if(dd<1e-6){ex=1;ez=0;}else{ex/=dd;ez/=dd;}x=px+ex*min;z=pz+ez*min;}}return [x,z];}
// minimap
const mm=document.getElementById('mm'),mg=mm.getContext('2d');const MS=180/45;
function drawMM(){mg.clearRect(0,0,mm.width,mm.height);mg.fillStyle='rgba(15,18,28,.8)';mg.fillRect(0,0,mm.width,mm.height);const o=8;
 ROOMS.forEach(([x1,y1,x2,y2,n,m])=>{const [a,b]=P(x1,y1),[c,d]=P(x2,y2);mg.fillStyle={wood:'#7a5c40',tile:'#9c988f',carpet:'#6f6a60',deck:'#56504a'}[m];mg.fillRect(o+a*MS,o+b*MS,(c-a)*MS,(d-b)*MS);});
 mg.strokeStyle='#fff';mg.lineWidth=2;W.forEach(([x1,y1,x2,y2])=>{const [a,b]=P(x1,y1),[c,d]=P(x2,y2);mg.beginPath();mg.moveTo(o+a*MS,o+b*MS);mg.lineTo(o+c*MS,o+d*MS);mg.stroke();});
 let px,pz,yaw;if(mode=='walk'){px=pl.x;pz=pl.z;yaw=pl.yaw;}else{px=orb.tx;pz=orb.tz;yaw=orb.th+Math.PI;}
 mg.save();mg.translate(o+px*MS,o+pz*MS);mg.rotate(-yaw);mg.fillStyle='rgba(255,80,80,.35)';mg.beginPath();mg.moveTo(0,0);mg.arc(0,0,22,-Math.PI/2-0.6-Math.PI/2+Math.PI/2- Math.PI/2+Math.PI/2,0);mg.restore();
 mg.save();mg.translate(o+px*MS,o+pz*MS);mg.rotate(-yaw);mg.fillStyle='rgba(255,90,90,.35)';mg.beginPath();mg.moveTo(0,0);mg.arc(0,0,24,Math.PI/2-0.55-Math.PI/2+ -Math.PI/2+Math.PI,Math.PI/2+0.55-Math.PI/2- Math.PI/2+Math.PI);mg.closePath();mg.fill();
 mg.fillStyle='#ff4d4d';mg.beginPath();mg.arc(0,0,4,0,7);mg.fill();mg.restore();
 // room name under player
 let room='';ROOMS.forEach(([x1,y1,x2,y2,n])=>{const [a,b]=P(x1,y1),[c,d]=P(x2,y2);if(n&&px>=a&&px<=c&&pz>=b&&pz<=d)room=n;});document.getElementById('room').textContent=room;}
// loop
const clock=new THREE.Clock();
function frame(){const dt=Math.min(clock.getDelta(),0.05);
 if(mode=='walk'){let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y,s=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;
  if(keys.ArrowLeft)pl.yaw+=1.8*dt;if(keys.ArrowRight)pl.yaw-=1.8*dt;
  const sp=(keys.ShiftLeft||keys.ShiftRight?11:6)*dt,fx=-Math.sin(pl.yaw),fz=-Math.cos(pl.yaw);
  let nx=pl.x+(fx*f-fz*s)*sp,nz=pl.z+(fz*f+fx*s)*sp;[pl.x,pl.z]=collide(nx,nz);
  cam.position.set(pl.x,5.4,pl.z);cam.rotation.set(pl.pitch,pl.yaw,0,'YXZ');cam.fov=70;}
 else{const v=14*dt;if(keys.KeyW||keys.ArrowUp){orb.tx-=Math.sin(orb.th)*v;orb.tz-=Math.cos(orb.th)*v;}if(keys.KeyS||keys.ArrowDown){orb.tx+=Math.sin(orb.th)*v;orb.tz+=Math.cos(orb.th)*v;}
  if(keys.KeyA||keys.ArrowLeft)orb.th+=1.2*dt;if(keys.KeyD||keys.ArrowRight)orb.th-=1.2*dt;
  cam.position.set(orb.tx+orb.d*Math.sin(orb.ph)*Math.sin(orb.th),orb.d*Math.cos(orb.ph),orb.tz+orb.d*Math.sin(orb.ph)*Math.cos(orb.th));cam.lookAt(orb.tx,0,orb.tz);cam.fov=50;}
 cam.updateProjectionMatrix();drawMM();r.render(scene,cam);requestAnimationFrame(frame);}
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;r.setSize(innerWidth,innerHeight);});
applyMode();frame();window.__ready=true;console.log('floorplan ready, area(ft2) approx',(ROOMS.filter(r=>r[4]!='Balcony').reduce((s,[a,b,c,d])=>s+(c-a)*(d-b)*S*S,0)).toFixed(0));
})();
