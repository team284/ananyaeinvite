/* Wedding invite app. Edit couple details in js/config.js, not here. */
/* ---------------- helpers ---------------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const IST={timeZone:'Asia/Kolkata'};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const gcal=(t,iso,h,loc)=>{const s=new Date(iso),e=new Date(s.getTime()+h*36e5);return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:t,dates:`${utc(s)}/${utc(e)}`,location:loc,details:`${CONFIG.bride} & ${CONFIG.groom}'s wedding`});};
const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(CONFIG.mapsQuery);
const fmt=(iso,o)=>new Date(iso).toLocaleString('en-IN',{...IST,...o});
let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;

/* ---------------- textures (canvas → data URL) ---------------- */
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);return c.toDataURL();}
(function(){
  const r=document.documentElement.style;
  r.setProperty('--noise',`url(${tex(220,220,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()*16;}x.putImageData(d,0,0);})})`);
  r.setProperty('--paper-tex',`url(${tex(240,240,(x,w,h)=>{for(let i=0;i<2600;i++){x.fillStyle=`rgba(${Math.random()>.5?'120,80,30':'255,255,255'},${Math.random()*.08})`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1);}x.strokeStyle='rgba(102,25,33,.05)';for(let i=0;i<40;i++){x.beginPath();const a=Math.random()*w,b=Math.random()*h;x.moveTo(a,b);x.quadraticCurveTo(a+Math.random()*30,b+Math.random()*10,a+Math.random()*40,b+Math.random()*20);x.stroke();}})})`);
  r.setProperty('--wood-tex',`url(${tex(120,300,(x,w,h)=>{x.fillStyle='#4a1218';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){const X=Math.random()*w,amp=2+Math.random()*5,f=.01+Math.random()*.03,dark=Math.random()>.45;x.strokeStyle=dark?`rgba(30,10,2,${.15+Math.random()*.3})`:`rgba(190,110,50,${.08+Math.random()*.16})`;x.lineWidth=.6+Math.random()*1.6;x.beginPath();for(let y=0;y<=h;y+=6){const xx=X+Math.sin(y*f+i)*amp;y?x.lineTo(xx,y):x.moveTo(xx,y);}x.stroke();}})})`);
  r.setProperty('--stone-tex',`url(${tex(160,160,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<d.data.length;i+=4){const v=Math.random()>.5?255:60;d.data[i]=v;d.data[i+1]=v*.8;d.data[i+2]=v*.6;d.data[i+3]=Math.random()*26;}x.putImageData(d,0,0);})})`);
  r.setProperty('--marble-tex',`url(${tex(200,220,(x,w,h)=>{x.strokeStyle='rgba(177,150,82,.18)';for(let i=0;i<7;i++){x.lineWidth=.5+Math.random()*1.2;x.beginPath();let X=Math.random()*w,Y=0;x.moveTo(X,Y);while(Y<h){X+=(Math.random()-.5)*26;Y+=12+Math.random()*16;x.lineTo(X,Y);}x.stroke();}})})`);
  const dm=`<svg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'><g fill='none' stroke='%23d9a845' stroke-opacity='.10' stroke-width='1'><path d='M42 14c8 6 8 18 0 24c-8-6-8-18 0-24z'/><path d='M42 38c-6 4-14 4-18-2M42 38c6 4 14 4 18-2'/><circle cx='42' cy='44' r='2'/><path d='M0 0c6 4 6 10 0 14M84 0c-6 4-6 10 0 14M0 70c6 4 6 10 0 14M84 70c-6 4-6 10 0 14'/></g><g fill='%23d9a845' fill-opacity='.10'><circle cx='0' cy='42' r='1.6'/><circle cx='84' cy='42' r='1.6'/><circle cx='42' cy='0' r='1.6'/><circle cx='42' cy='84' r='1.6'/></g></svg>`;
  r.setProperty('--damask',`url("data:image/svg+xml,${dm.replace(/#/g,'%23').replace(/</g,'%3C').replace(/>/g,'%3E').replace(/"/g,"'")}")`);
})();

/* ---------------- FX canvas (sparkles / petals / embers) ---------------- */
const fx=$('fx'),fctx=fx.getContext('2d');let parts=[],fxOn=false;
function sizeFx(){const d=Math.min(2,devicePixelRatio||1);fx.width=innerWidth*d;fx.height=innerHeight*d;fctx.setTransform(d,0,0,d,0,0);}
sizeFx();addEventListener('resize',sizeFx);
function burst(x,y,n,kind){
  if(RM)return;
  const gold=['#edddb5','#c9b788','#b89f61','#fff6d8'],pet=['#b79e5e','#b9a163','#c4af7b','#c1303e','#da7c6e'];
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=kind==='rain'?0:(1.5+Math.random()*4.5);
    parts.push({x:kind==='rain'?Math.random()*innerWidth:x,y:kind==='rain'?-20-Math.random()*innerHeight*.5:y,vx:Math.cos(a)*s,vy:kind==='rain'?1.2+Math.random()*2.2:Math.sin(a)*s-2,
      g:kind==='rain'?0:.08,life:0,max:kind==='rain'?260:90+Math.random()*50,r:kind==='spark'?1+Math.random()*2.2:3+Math.random()*4,
      rot:Math.random()*6,vr:(Math.random()-.5)*.15,c:(kind==='spark'?gold:pet)[Math.random()*5|0]||gold[0],k:kind,sw:Math.random()*6});}
  if(!fxOn){fxOn=true;requestAnimationFrame(fxLoop);}
}
function fxLoop(){
  fctx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life<p.max&&p.y<innerHeight+30);
  for(const p of parts){p.life++;p.vy+=p.g;p.vx*=.985;if(p.k==='rain'){p.sw+=.04;p.x+=Math.sin(p.sw)*.8;}p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;
    const a=Math.min(1,(p.max-p.life)/30);fctx.save();fctx.globalAlpha=a;fctx.translate(p.x,p.y);fctx.rotate(p.rot);fctx.fillStyle=p.c;
    if(p.k==='spark'){fctx.shadowColor=p.c;fctx.shadowBlur=8;fctx.beginPath();const r=p.r*2.2;fctx.moveTo(0,-r);fctx.quadraticCurveTo(0,0,r,0);fctx.quadraticCurveTo(0,0,0,r);fctx.quadraticCurveTo(0,0,-r,0);fctx.quadraticCurveTo(0,0,0,-r);fctx.fill();}
    else{fctx.beginPath();fctx.ellipse(0,0,p.r,p.r*.55,0,0,6.283);fctx.fill();fctx.globalAlpha=a*.35;fctx.fillStyle='#000';fctx.beginPath();fctx.ellipse(p.r*.2,0,p.r*.5,p.r*.12,0,0,6.283);fctx.fill();}
    fctx.restore();}
  if(parts.length)requestAnimationFrame(fxLoop);else{fxOn=false;fctx.clearRect(0,0,innerWidth,innerHeight);}
}
const centerOf=el=>{const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2];};

/* ---------------- shapes ---------------- */
function archPath(cx,w,spring,bottom,n=5,k=.62){
  const xl=cx-w/2,xr=cx+w/2,r=w,pts=[];
  for(let i=0;i<=n;i++){const a=Math.PI-(Math.PI/3)*(i/n);pts.push([xr+r*Math.cos(a),spring-r*Math.sin(a)]);}
  for(let i=1;i<=n;i++){const a=Math.PI/3-(Math.PI/3)*(i/n);pts.push([xl+r*Math.cos(a),spring-r*Math.sin(a)]);}
  let d=`M${xl} ${bottom} L${xl} ${spring}`;
  for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i];const cr=Math.hypot(x1-x0,y1-y0)*k;d+=` A${cr.toFixed(2)} ${cr.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;}
  return d+` L${xr} ${bottom} Z`;
}
function flamePath(x,y,h,w){return `M${x} ${y-h} C${x+w*.55} ${y-h*.62} ${x+w*.62} ${y-h*.22} ${x} ${y} C${x-w*.62} ${y-h*.22} ${x-w*.55} ${y-h*.62} ${x} ${y-h}Z`;}
function waxSeal(svg,initials,id){
  let d='';const N=28;for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,r=44+(Math.sin(i*2.7)+Math.sin(i*5.3))*1.6;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);}
  svg.innerHTML=`<defs><radialGradient id="${id}w" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#cf404e"/><stop offset=".45" stop-color="#8c232d"/><stop offset="1" stop-color="#411015"/></radialGradient>
  <radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#6c1a23"/><stop offset="1" stop-color="#af2b38"/></radialGradient></defs>
  <path d="${d}Z" fill="url(#${id}w)"/>
  <circle cx="50" cy="50" r="31" fill="url(#${id}r)"/>
  <circle cx="50" cy="50" r="31" fill="none" stroke="#4e1319" stroke-width="1.6"/>
  <circle cx="50.8" cy="50.8" r="27" fill="none" stroke="rgba(235,186,179,.25)" stroke-width="1"/>
  ${Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2;return `<circle cx="${(50+Math.cos(a)*36.5).toFixed(1)}" cy="${(50+Math.sin(a)*36.5).toFixed(1)}" r="1.3" fill="#5c171e"/>`}).join('')}
  <text x="51" y="58.6" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="21" fill="rgba(237,193,187,.35)">${esc(initials)}</text>
  <text x="50" y="58" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="21" fill="#50141a">${esc(initials)}</text>
  <ellipse cx="36" cy="30" rx="13" ry="7" fill="#fff" opacity=".18" transform="rotate(-30 36 30)"/>`;
}

/* ================= 1 · SCENE ================= */
/* On wide screens the scene widens to fill the screen; the 400-unit-wide arch stays in the middle. */
const SCENE=(()=>{const wide=innerWidth>=900;const W=wide?Math.max(400,Math.min(1400,Math.round(700*innerWidth/innerHeight/20)*20)):400;return {W,E:(W-400)/2};})();
(function(){
  const svg=$('sceneSvg');let k=0,niches='';
  const W=SCENE.W,E=SCENE.E;
  const CW=E>60?Math.round(Math.min(196+E*.95,620)):196,HC=CW/2,PX=HC+60;
  const archWide=(w)=>{const a=w/2,top=170-(w-CW)*.866,b=340-top,pts=[],n=9;
    for(let i=0;i<=n;i++){const t=i/n*Math.PI/2;pts.push([200-a*Math.cos(t),340-b*Math.sin(t)-(i===n?6:0)]);}
    for(let i=n-1;i>=0;i--){const t=i/n*Math.PI/2;pts.push([200+a*Math.cos(t),340-b*Math.sin(t)]);}
    let d=`M${200-a} 620 L${200-a} 340`;
    for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i];const cr=Math.hypot(x1-x0,y1-y0)*.62;d+=` A${cr.toFixed(2)} ${cr.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;}
    return d+` L${200+a} 620 Z`;};
  const A=w=>E>60?archWide(CW+(w-196)):archPath(200,w,340,620,6);svg.setAttribute('viewBox',`${-E} 0 ${W} 700`);$('scene').style.aspectRatio=`${W} / 700`;
  const niche=(x,y)=>{const dl=(.45+Math.hypot(x-259,(y-600)*.6)/260).toFixed(2);const fd=(k*.23%1.4).toFixed(2);k++;
    return `<path class="t f-niche" d="M${x-8} ${y+13} L${x-8} ${y-1} Q${x-8} ${y-12} ${x} ${y-16} Q${x+8} ${y-12} ${x+8} ${y-1} L${x+8} ${y+13} Z"/>
    <path d="M${x-8} ${y+13} L${x-8} ${y-1} Q${x-8} ${y-12} ${x} ${y-16}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>
    <path d="M${x} ${y-16} Q${x+8} ${y-12} ${x+8} ${y-1} L${x+8} ${y+13}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>
    <g class="nl" style="transition-delay:${dl}s"><circle cx="${x}" cy="${y+3}" r="15" fill="url(#ng)"/>
      <ellipse cx="${x}" cy="${y+11}" rx="5" ry="1.8" fill="#a98e4b"/><ellipse cx="${x}" cy="${y+10.4}" rx="3.6" ry="1" fill="#421015"/>
      <path class="nl-f" style="animation-delay:-${fd}s" d="${flamePath(x+2.4,y+9.6,11,4.6)}" fill="url(#flg)"/></g>`;};
  for(let y=150;y<=590;y+=40){niches+=niche(200-PX,y)+niche(200+PX,y);}
  for(let x=40-Math.floor(E/40)*40;x<=360+E;x+=40){niches+=niche(x,674);}
  const bevel=(d,w)=>`<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${w+1}" transform="translate(1.6 1.8)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="${w}" transform="translate(-1 -1)"/><path class="t s-carve" d="${d}" stroke-width="${w}"/>`;
  const rosette=(x,y)=>`<g>${bevel(`M${x} ${y} m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0`,1.2)}${Array.from({length:8},(_,i)=>`<path class="t s-carve" stroke-width="1" d="M${x} ${y} L${(x+Math.cos(i*Math.PI/4)*12).toFixed(1)} ${(y+Math.sin(i*Math.PI/4)*12).toFixed(1)}"/>`).join('')}<circle class="t s-carve" cx="${x}" cy="${y}" r="4" stroke-width="1"/></g>`;
  // wide screens: a carved jharokha (balcony window) on each side, light glowing through its jaali when lit
  let side='';
  // wide screens: palace wings (mahal) stretching out from the main arch, windows glow when lit
  const win=(cx,w,spring,bottom,jaali)=>{const d=archPath(cx,w,spring,bottom,3);return `<path d="${d}" fill="#14040a"/><path class="lightwash" d="${d}" fill="url(#jglow)"/>${jaali?`<path d="${d}" fill="url(#jaali)"/>`:''}${bevel(d,.9)}`;};
  const chhatri=cx=>`<rect class="t f-wall2" x="${cx-22}" y="196" width="44" height="6"/>${bevel(`M${cx-22} 196 H${cx+22} V202 H${cx-22} Z`,.7)}
    ${[-16,16].map(d=>`<rect class="t f-wall2" x="${cx+d-2}" y="176" width="4" height="20"/>`).join('')}<path d="${archPath(cx,22,190,196,2)}" fill="#14040a"/><path class="lightwash" d="${archPath(cx,22,190,196,2)}" fill="url(#jglow)"/>
    <rect class="t f-wall2" x="${cx-25}" y="170" width="50" height="6"/>${bevel(`M${cx-25} 170 H${cx+25} V176 H${cx-25} Z`,.7)}
    <path class="t f-wall2" d="M${cx-17} 170 Q${cx-17} 150 ${cx} 146 Q${cx+17} 150 ${cx+17} 170 Z"/>${bevel(`M${cx-17} 170 Q${cx-17} 150 ${cx} 146 Q${cx+17} 150 ${cx+17} 170 Z`,.8)}
    <path class="t s-carve" d="M${cx} 146 V136 M${cx-3} 140 H${cx+3}" stroke-width="1.1"/>`;
  const wing=(xa,xb)=>{const w=xb-xa;if(w<90)return '';let s='';
    s+=`<rect class="t f-wall2" x="${xa}" y="208" width="${w}" height="412"/><rect x="${xa}" y="208" width="${w}" height="412" fill="url(#petal)" opacity=".35"/>${bevel(`M${xa} 208 H${xb} V620 H${xa} Z`,1)}`;
    // parapet with merlons
    s+=`<rect class="t f-wall2" x="${xa}" y="202" width="${w}" height="8"/>${bevel(`M${xa} 202 H${xb} V210 H${xa} Z`,.8)}`;
    for(let x=xa+4;x<xb-6;x+=14)s+=`<path class="t f-wall2" d="M${x} 202 V197 Q${x+4} 193 ${x+8} 197 V202 Z"/>`;
    const nc=Math.max(1,Math.round(w/170));for(let i=0;i<nc;i++)s+=chhatri(xa+w*(i+.5)/nc);
    // upper floor: small jaali windows
    const nu=Math.max(2,Math.floor(w/52));for(let i=0;i<nu;i++){const cx=xa+w*(i+.5)/nu;s+=win(cx,30,282,334,true)+`<rect class="t f-wall2" x="${cx-20}" y="334" width="40" height="5"/>`;}
    // cornice with dentils
    s+=`<rect class="t f-wall2" x="${xa}" y="352" width="${w}" height="9"/>${bevel(`M${xa} 352 H${xb} V361 H${xa} Z`,.9)}`;
    for(let x=xa+3;x<xb-4;x+=9)s+=`<rect class="t f-wall2" x="${x}" y="361" width="5" height="5"/>`;
    // lower floor: larger arched openings with a balustrade
    const nl=Math.max(2,Math.floor(w/74));for(let i=0;i<nl;i++){const cx=xa+w*(i+.5)/nl;s+=win(cx,46,448,546,false);
      s+=`<rect class="t f-wall2" x="${cx-28}" y="546" width="56" height="7"/>${bevel(`M${cx-28} 546 H${cx+28} V553 H${cx-28} Z`,.7)}`;
      for(let k=-2;k<=2;k++)s+=`<rect class="t f-wall2" x="${cx+k*10-1.5}" y="530" width="3" height="16"/>`;}
    // plinth
    s+=`<path class="t s-carve" d="M${xa} 578 H${xb} M${xa} 584 H${xb}" stroke-width=".8"/>`;
    return s;};
  if(E>60){side+=wing(-E+18,200-PX-34)+wing(200+PX+34,400+E-18);}
  // diya on the ledge (clay)
  const dots=Array.from({length:13},(_,i)=>{const t=i/12;const x=158+t*76;const y=607+Math.sin(t*Math.PI)*9;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="#d3c49d"/>`;}).join('');
  const petals=Array.from({length:6},(_,i)=>{const x=166+i*12;const y=614+Math.sin((i+.5)/6*Math.PI)*7;return `<path d="M${x} ${y} q3 -4 6 0 q-3 4 -6 0z" fill="#f0e2c0" opacity=".85"/>`;}).join('');
  svg.innerHTML=`<defs>
    <pattern id="jali" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle class="t s-carve" cx="10" cy="10" r="6.5" stroke-width=".8" opacity=".5"/>
      <path class="t s-carve" d="M10 3.5 Q13 10 10 16.5 Q7 10 10 3.5Z" stroke-width=".6" opacity=".4"/>
      <circle class="t s-carve" cx="0" cy="0" r="3" stroke-width=".8" opacity=".45"/><circle class="t s-carve" cx="20" cy="0" r="3" stroke-width=".8" opacity=".45"/>
      <circle class="t s-carve" cx="0" cy="20" r="3" stroke-width=".8" opacity=".45"/><circle class="t s-carve" cx="20" cy="20" r="3" stroke-width=".8" opacity=".45"/>
    </pattern>
    <pattern id="petal" width="12" height="12" patternUnits="userSpaceOnUse"><path class="t s-carve" d="M6 0 Q10 6 6 12 Q2 6 6 0Z" stroke-width=".8" opacity=".85"/></pattern>
    <pattern id="grain" width="160" height="160" patternUnits="userSpaceOnUse"><image href="${getComputedStyle(document.documentElement).getPropertyValue('--stone-tex').slice(4,-1).replace(/"/g,'')}" width="160" height="160"/></pattern>
    <pattern id="jaali" width="12" height="12" patternUnits="userSpaceOnUse">
      <path class="t s-carve" d="M6 0 L12 6 L6 12 L0 6 Z M6 3 L9 6 L6 9 L3 6 Z" stroke-width=".9"/>
      <circle class="t s-carve" cx="0" cy="0" r="1.6" stroke-width=".7"/><circle class="t s-carve" cx="12" cy="12" r="1.6" stroke-width=".7"/>
    </pattern>
    <radialGradient id="jglow" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".55" stop-color="#ff9a3a" stop-opacity=".55"/><stop offset="1" stop-color="#8c2a34" stop-opacity=".25"/></radialGradient>
    <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1"><stop class="t st1" offset="0"/><stop class="t st2" offset="1"/></linearGradient>
    <radialGradient id="ng"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset=".4" stop-color="#ff9a3a" stop-opacity=".3"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
    <linearGradient id="flg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7a8cff" stop-opacity=".7"/><stop offset=".12" stop-color="#ffb347"/><stop offset=".45" stop-color="#ffe08a"/><stop offset=".8" stop-color="#ff9a2a"/><stop offset="1" stop-color="#ff5a0a" stop-opacity="0"/></linearGradient>
    <radialGradient id="wash" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb04a" stop-opacity=".6"/><stop offset=".35" stop-color="#ff8a2a" stop-opacity=".25"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></radialGradient>
    <radialGradient id="clay" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#c2ad77"/><stop offset=".35" stop-color="#bc2f3d"/><stop offset=".75" stop-color="#711c24"/><stop offset="1" stop-color="#380e12"/></radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d34f5c"/><stop offset="1" stop-color="#81202a"/></linearGradient>
    <radialGradient id="oil" cx=".55" cy=".4" r=".7"><stop offset="0" stop-color="#c4b07d"/><stop offset=".5" stop-color="#741d26"/><stop offset="1" stop-color="#2a0a0d"/></radialGradient>
    <radialGradient id="fo" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".95"/><stop offset=".45" stop-color="#ff8a2a" stop-opacity=".45"/><stop offset="1" stop-color="#ff5a0a" stop-opacity="0"/></radialGradient>
    <linearGradient id="fb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3a5cff" stop-opacity=".85"/><stop offset=".1" stop-color="#ff9a2e"/><stop offset=".35" stop-color="#ffc54d"/><stop offset=".7" stop-color="#ff8a1e"/><stop offset="1" stop-color="#ff4a00" stop-opacity="0"/></linearGradient>
    <linearGradient id="fc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".3" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></linearGradient>
    <linearGradient id="lit" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffb35a" stop-opacity=".55"/><stop offset=".6" stop-color="#ff8a2a" stop-opacity="0"/></linearGradient>
    <linearGradient id="gtext" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset=".35" stop-color="#e6cf98"/><stop offset=".6" stop-color="#fff2d0"/><stop offset="1" stop-color="#b8996a"/></linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7"/></filter>
    <filter id="big" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <clipPath id="opn"><path d="${A(196)}"/></clipPath>
  </defs>
  <rect class="t f-wall" x="${-E}" width="${W}" height="700"/>
  <rect x="${-E}" width="${W}" height="700" fill="url(#jali)"/>
  <rect x="${-E}" width="${W}" height="700" fill="url(#grain)" style="mix-blend-mode:overlay"/>
  ${side}
  <rect x="${200-PX-20}" y="104" width="40" height="516" class="t f-wall2"/><rect x="${200+PX-20}" y="104" width="40" height="516" class="t f-wall2"/>
  ${bevel(`M${200-PX-20} 104 H${200-PX+20} V620 H${200-PX-20} Z`,1.2)}${bevel(`M${200+PX-20} 104 H${200+PX+20} V620 H${200+PX-20} Z`,1.2)}
  ${rosette(200-HC-22,128)}${rosette(200+HC+22,128)}
  <path class="t f-wall2" d="${A(236)}"/>
  <path d="${A(236)}" fill="url(#petal)"/>
  ${bevel(A(236),1.8)}
  ${bevel(A(218),1)}
  <path d="${A(196)}" fill="url(#inner)"/>
  <g clip-path="url(#opn)"><path d="${A(196)}" fill="none" stroke="#000" stroke-opacity=".75" stroke-width="26" filter="url(#big)"/></g>
  ${bevel(A(196),1.6)}
  <circle id="wash" class="lightwash" cx="259" cy="560" r="230" fill="url(#wash)"/>
  ${niches}
  <rect class="t f-marble" x="${-E}" y="620" width="${W}" height="16"/>
  <path d="M0 626 C60 622 90 632 150 627 S300 622 400 628" stroke="#a88e4b" stroke-opacity=".25" fill="none"/>
  <rect class="t f-marble2" x="${-E}" y="636" width="${W}" height="5"/>
  <rect x="${-E}" y="641" width="${W}" height="59" fill="#000" opacity=".25"/>
  <rect x="${-E}" width="${W}" height="700" fill="url(#vig)" pointer-events="none"/>

  <g class="pre">
    <text x="200" y="62" text-anchor="middle" font-family="Pinyon Script,cursive" font-size="36" fill="url(#gtext)">You're invited</text>
    <text x="200" y="86" text-anchor="middle" font-family="Cinzel,serif" font-size="8.5" letter-spacing="3" fill="#efe1be">TO A WEDDING IN ${esc(CONFIG.city.toUpperCase())}</text>
  </g>
  <g transform="translate(200 410) scale(${E>60?Math.min(1.45,1+E/900).toFixed(3):1}) translate(-200 -410)">
  <g class="wel" style="transition-delay:1.2s">
    <text x="200" y="318" text-anchor="middle" font-family="Cinzel,serif" font-size="8" letter-spacing="2.6" fill="#efe1be">THE FAMILIES</text>
    <text x="200" y="332" text-anchor="middle" font-family="Cinzel,serif" font-size="8" letter-spacing="2.6" fill="#efe1be">INVITE YOU TO</text>
    <text x="200" y="384" text-anchor="middle" font-family="Tiro Devanagari Hindi,serif" font-size="34" fill="url(#gtext)">शुभ विवाह</text>
  </g>
  <g class="wel" style="transition-delay:1.8s;color:#cfbe94">
    <use href="#ornament" x="145" y="398" width="110" height="16"/>
    <text x="200" y="440" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="13" fill="#f2e6c7">a celebration of love,</text>
    <text x="200" y="457" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="13" fill="#f2e6c7">by the lake in ${esc(CONFIG.city)}</text>
    <text x="200" y="494" text-anchor="middle" font-family="Cinzel,serif" font-size="8.5" letter-spacing="3" fill="#cfbe94">FEBRUARY ${esc(CONFIG.mainDate.year)}</text>
  </g>

  <!-- after lighting: a bandhanwar of roses with swinging bells, and a welcome -->
  <g class="wel bandh" style="transition-delay:.5s">${(()=>{
    let s=`<defs>
      <radialGradient id="rsA" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#e98a93"/><stop offset=".55" stop-color="#8c2a34"/><stop offset="1" stop-color="#3a0b12"/></radialGradient>
      <radialGradient id="rsB" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff0ec"/><stop offset=".55" stop-color="#ecbcb4"/><stop offset="1" stop-color="#b9787a"/></radialGradient>
      <linearGradient id="bell" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c8050"/><stop offset=".45" stop-color="#fff6dc"/><stop offset=".7" stop-color="#e6cf98"/><stop offset="1" stop-color="#8a7046"/></linearGradient></defs>`;
    const rose=(x,y,r,k)=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#rs${k})"/><path d="M${(x-r*.5).toFixed(1)} ${(y-r*.1).toFixed(1)} q${(r*.5).toFixed(1)} ${(-r*.6).toFixed(1)} ${r.toFixed(1)} 0 M${(x-r*.35).toFixed(1)} ${(y+r*.25).toFixed(1)} q${(r*.35).toFixed(1)} ${(-r*.4).toFixed(1)} ${(r*.7).toFixed(1)} 0" stroke="${k==='A'?'#3a0b12':'#b9787a'}" stroke-opacity=".55" stroke-width=".7" fill="none"/>`;
    const leaf=(x,y,a)=>`<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 q5 7 0 16 q-5 -9 0 -16z" fill="#5b6b2c" stroke="#3e4a1c" stroke-width=".5"/>`;
    const pts=[];for(let x=-Math.ceil(E/100)*100;x<=400+Math.ceil(E/100)*100;x+=100)pts.push(x);
    // swags of roses between the hanging points
    for(let i=0;i<pts.length-1;i++){const x0=pts[i],x1=pts[i+1];for(let k=0;k<=13;k++){const t=k/13,x=x0+(x1-x0)*t,y=8+Math.sin(t*Math.PI)*34;s+=rose(x,y,5.4,k%2?'A':'B');}}
    // leaf clusters and hanging strands with bells
    pts.forEach((x,i)=>{s+=leaf(x-6,4,-40)+leaf(x+6,4,40)+leaf(x,6,0);
      const len=x===200?2:(x<=0||x>=400)?5:4,xx=x===-E?x+8:x;
      s+=`<g class="bell" style="transform-origin:${xx}px 10px;animation-delay:-${(i*.37).toFixed(2)}s">
        <line x1="${xx}" y1="10" x2="${xx}" y2="${16+len*10}" stroke="#cdb27c" stroke-width=".8"/>`;
      for(let k=0;k<len;k++)s+=rose(xx,18+k*10,3.8,k%2?'B':'A');
      const by=18+len*10;
      s+=`<path d="M${xx-5} ${by+9} Q${xx-5} ${by} ${xx} ${by} Q${xx+5} ${by} ${xx+5} ${by+9} Z" fill="url(#bell)"/><rect x="${xx-6}" y="${by+8.5}" width="12" height="1.6" rx=".8" fill="#cdb27c"/><circle cx="${xx}" cy="${by+11.5}" r="1.5" fill="#e6cf98"/></g>`;});
    return s;})()}
    <ellipse cx="200" cy="108" rx="96" ry="26" fill="#24080e" opacity=".55" filter="url(#big)"/>
    <text x="200" y="106" text-anchor="middle" font-family="Tiro Devanagari Hindi,serif" font-size="22" fill="url(#gtext)">॥ स्वागतम् ॥</text>
    <text x="200" y="124" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="12.5" fill="#f2e6c7">thank you for your blessings</text>
  </g>

  </g>
  <!-- the scroll: tells guests to light the diya -->
  <g class="scrollp" id="scrollp">
    <defs>
      <linearGradient id="parch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9bd85"/><stop offset=".12" stop-color="#f6e3b4"/><stop offset=".5" stop-color="#fbf0d2"/><stop offset=".88" stop-color="#f6e3b4"/><stop offset="1" stop-color="#d2b47a"/></linearGradient>
      <linearGradient id="rod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset=".45" stop-color="#e6cf98"/><stop offset="1" stop-color="#9c8050"/></linearGradient>
      <radialGradient id="knob" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff6dc"/><stop offset=".5" stop-color="#cdb27c"/><stop offset="1" stop-color="#6e5530"/></radialGradient>
    </defs>
    <g class="unfurl">
      <rect x="136" y="340" width="128" height="150" fill="url(#parch)"/>
      <rect x="136" y="340" width="128" height="150" fill="url(#grain)" opacity=".5" style="mix-blend-mode:multiply"/>
      <path d="M142 346 H258 V484 H142 Z" fill="none" stroke="#8c2a34" stroke-opacity=".45" stroke-width=".8"/>
      <text x="200" y="372" text-anchor="middle" font-family="Pinyon Script,cursive" font-size="15" fill="#5c1520">With your blessings</text>
      <use href="#ornament" x="165" y="378" width="70" height="10" style="color:#8c2a34"/>
      <text x="200" y="403" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="10.5" fill="#3a0b12">Light this diya in the name</text>
      <text x="200" y="417" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="10.5" fill="#3a0b12">of ${esc(CONFIG.bride)} &amp; ${esc(CONFIG.groom)},</text>
      <text x="200" y="431" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="10.5" fill="#3a0b12">and send the couple</text>
      <text x="200" y="445" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="10.5" fill="#3a0b12">your blessings.</text>
      <text x="200" y="468" text-anchor="middle" font-family="Cinzel,serif" font-size="6.5" letter-spacing="2" fill="#8c2a34">TAP TO BLESS</text>
      <path d="M196 474 L200 480 L204 474" fill="none" stroke="#8c2a34" stroke-width="1"/>
    </g>
    <g class="rod-b"><rect x="128" y="486" width="144" height="11" rx="5.5" fill="url(#rod)"/><circle cx="126" cy="491.5" r="6.5" fill="url(#knob)"/><circle cx="274" cy="491.5" r="6.5" fill="url(#knob)"/></g>
    <rect x="128" y="331" width="144" height="11" rx="5.5" fill="url(#rod)"/><circle cx="126" cy="336.5" r="6.5" fill="url(#knob)"/><circle cx="274" cy="336.5" r="6.5" fill="url(#knob)"/>
  </g>

  <!-- the diya -->
  <ellipse cx="200" cy="622" rx="58" ry="5" fill="#000" opacity=".35" filter="url(#soft)"/>
  <ellipse class="lightwash" cx="235" cy="622" rx="90" ry="8" fill="#ffb35a" opacity=".5" filter="url(#soft)"/>
  <path d="M150 596 C150 613 170 627 196 627 C216 627 232 619 241 607 L264 591 C254 589 242 592 233 595 Z" fill="url(#clay)"/>
  <path class="lightwash" d="M150 596 C150 613 170 627 196 627 C216 627 232 619 241 607 L264 591 C254 589 242 592 233 595 Z" fill="url(#lit)"/>
  <path d="M158 604 C163 615 176 622 192 623" stroke="#ffd2a8" stroke-opacity=".35" stroke-width="2.2" fill="none" stroke-linecap="round" filter="url(#soft)"/>
  <path d="M156 606 C170 619 214 622 236 605" stroke="#c9b686" stroke-width=".9" fill="none" opacity=".9"/>
  ${dots}${petals}
  <ellipse cx="192" cy="596" rx="42" ry="6.5" fill="url(#rim)"/>
  <ellipse cx="191.5" cy="596.8" rx="36" ry="4.6" fill="url(#oil)"/>
  <ellipse cx="183" cy="595.6" rx="10" ry="1.2" fill="#fff6d8" opacity=".45"/>
  <path d="M233 595 L264 591 L240 598 Z" fill="#9f2733"/>
  <path d="M222 597.5 Q244 595 258 590.6" stroke="#f4ead0" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M222 597.5 Q244 595 258 590.6" stroke="#c6b281" stroke-width="1" fill="none" stroke-linecap="round" opacity=".6"/>
  <circle cx="258.6" cy="590.3" r="1.8" fill="#23080b"/>
  <g id="flame">
    <ellipse cx="259" cy="572" rx="34" ry="44" fill="url(#fo)" opacity=".9"/>
    <g id="flameShape">
      <path d="${flamePath(259,591,50,15)}" fill="url(#fb)" filter="url(#soft)"/>
      <path d="${flamePath(259,590,30,8)}" fill="url(#fc)"/>
      <ellipse cx="259" cy="587" rx="3.4" ry="4.2" fill="#4a6aff" opacity=".55" filter="url(#soft)"/>
    </g>
  </g>
  <!-- the matchstick -->
  <g id="match" opacity="0">
    <defs>
      <linearGradient id="stick" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9a86a"/><stop offset=".5" stop-color="#f3dfb2"/><stop offset="1" stop-color="#b8935a"/></linearGradient>
      <radialGradient id="mhead" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#d4606a"/><stop offset=".5" stop-color="#8c2a34"/><stop offset="1" stop-color="#3a0b12"/></radialGradient>
    </defs>
    <rect x="-2.3" y="3" width="4.6" height="150" rx="1.4" fill="url(#stick)"/>
    <ellipse id="mHead" cx="0" cy="0" rx="4.8" ry="6.2" fill="url(#mhead)"/>
    <g id="mFlame" opacity="0">
      <ellipse cx="0" cy="-12" rx="16" ry="22" fill="url(#fo)" opacity=".8"/>
      <g id="mFlameShape"><path d="${flamePath(0,-1,26,9)}" fill="url(#fb)" filter="url(#soft)"/><path d="${flamePath(0,-2,14,4.5)}" fill="url(#fc)"/></g>
    </g>
  </g>`;
})();
/* lighting the diya: scroll is locked until a matchstick lights the wick */
(function(){
  const fs=$('flameShape'),wash=$('wash'),sc=$('scene'),match=$('match'),mFlame=$('mFlame'),mfs=$('mFlameShape'),mHead=$('mHead');
  let t=0,lit=false,busy=false,matchLit=false;
  const root=document.documentElement;
  const stopScroll=e=>{if(!lit)e.preventDefault();};
  const keys=e=>{if(!lit&&['ArrowDown','PageDown',' ','End','ArrowUp','PageUp','Home'].includes(e.key)&&e.target.id!=='tap')e.preventDefault();};
  function lock(){root.classList.add('locked');addEventListener('touchmove',stopScroll,{passive:false});addEventListener('wheel',stopScroll,{passive:false});addEventListener('keydown',keys);scrollTo(0,0);}
  function unlock(){root.classList.remove('locked');removeEventListener('touchmove',stopScroll);removeEventListener('wheel',stopScroll);removeEventListener('keydown',keys);}
  lock();
  const tween=(ms,fn)=>new Promise(res=>{const t0=performance.now();const f=n=>{const k=Math.min(1,(n-t0)/ms);fn(k);k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});
  const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  let mx=380,my=720,rot=-48;
  const place=()=>match.setAttribute('transform',`translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${rot.toFixed(1)})`);
  const moveTo=(x,y,ms,r)=>{const x0=mx,y0=my,r0=rot,r1=r==null?rot:r;return tween(ms,k=>{const e=ease(k);mx=x0+(x-x0)*e;my=y0+(y-y0)*e;rot=r0+(r1-r0)*e;place();});};
  const toScreen=(x,y)=>{const r=sc.getBoundingClientRect();return[r.left+(x+SCENE.E)/SCENE.W*r.width,r.top+y/700*r.height];};
  function lightDiya(){
    sc.classList.add('lit');lit=true;$('pill').innerHTML='Blessings received · Scroll <span>⌄</span>';
    const[x,y]=toScreen(259,580);burst(x,y,26,'spark');unlock();
  }
  async function strike(){
    if(busy||lit)return;busy=true;
    if(RM){lightDiya();return;}
    sc.classList.add('striking');
    place();match.setAttribute('opacity','1');
    await moveTo(332,652,520,-52);                 // match comes in, beside the ledge
    await moveTo(306,628,150,-44);                 // a quick strike
    matchLit=true;mFlame.setAttribute('opacity','1');
    {const[x,y]=toScreen(306,622);burst(x,y,14,'spark');}
    await tween(260,k=>{mFlame.setAttribute('transform',`scale(${(.3+k*.7).toFixed(2)})`);});
    await moveTo(262,601,620,-46);                 // flame to the wick
    await tween(240,()=>{});
    lightDiya();
    await tween(320,()=>{});
    await moveTo(330,660,600,-56);                 // pull the match away
    await tween(380,k=>{mFlame.setAttribute('transform',`scale(${(1-k).toFixed(2)})`);mFlame.setAttribute('opacity',(1-k).toFixed(2));});
    matchLit=false;mHead.setAttribute('fill','#2b1a14');
    await tween(450,k=>{match.setAttribute('opacity',(1-k).toFixed(2));});
  }
  $('tap').addEventListener('click',strike);
  function f(){t+=.016;
    if(!RM){
      if(lit){const n=Math.sin(t*9.1)*.5+Math.sin(t*13.7+1)*.3+Math.sin(t*23.3+2)*.2+(Math.random()-.5)*.35;
        const sy=1+n*.07,sx=1-n*.04,sk=Math.sin(t*5.3)*3+Math.sin(t*11.1)*1.5;
        fs.setAttribute('transform',`translate(259 591) skewX(${sk.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-259 -591)`);
        wash.setAttribute('opacity',(.86+n*.1).toFixed(3));}
      if(matchLit){const m=Math.sin(t*14)*.08+(Math.random()-.5)*.1;mfs.setAttribute('transform',`skewX(${(Math.sin(t*7)*4).toFixed(2)}) scale(${(1-m*.5).toFixed(3)} ${(1+m).toFixed(3)})`);}
    }
    requestAnimationFrame(f);}
  requestAnimationFrame(f);
})();
/* ================= 2 · ENVELOPE ================= */
let guest='';try{const h=decodeURIComponent(location.hash.slice(1));if(h)guest=h.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}catch(e){}
if(guest)$('addr').textContent=guest;
const ini=`${CONFIG.bride[0]}${CONFIG.groom[0]}`;
waxSeal($('sealSvg'),ini,'s1');waxSeal($('sealEnd'),ini,'s2');
function openEnvelope(){
  const env=$('env');if(env.classList.contains('open'))return;
  const [sx,sy]=centerOf($('seal'));burst(sx,sy,18,'petal');
  env.classList.add('open');$('envHint').hidden=true;
  setTimeout(()=>{
    $('envStage').classList.add('done');
    setTimeout(()=>{
      $('envStage').hidden=true;
      const nm=(s,d)=>esc(s);
      const card=$('namesCard');card.hidden=false;
      card.innerHTML=`<p class="ga fadein" style="margin-top:30px">॥ श्री गणेशाय नमः ॥</p>
        <p class="lede fadein" style="animation-delay:.3s">With the blessings of our elders, we request the pleasure of your company at the wedding of</p>
        <p class="nm" style="animation-delay:.7s">${nm(CONFIG.bride,.7)}</p>
        <p class="rel fadein" style="animation-delay:1.4s">Daughter of</p><p class="par fadein" style="animation-delay:1.5s">${esc(CONFIG.brideParents)}</p>
        <p class="amp fadein" style="animation-delay:1.8s">संग</p>
        <p class="nm" style="animation-delay:2.1s">${nm(CONFIG.groom,2.1)}</p>
        <p class="rel fadein" style="animation-delay:2.7s">Son of</p><p class="par fadein" style="animation-delay:2.8s">${esc(CONFIG.groomParents)}</p>`;
      const [cx,cy]=centerOf(card);burst(cx,cy-40,60,'spark');
    },650);
  },2100);
}
$('seal').addEventListener('click',openEnvelope);

/* ================= 3 · DATE ================= */
const dparts=[["Day",CONFIG.mainDate.day],["Month",CONFIG.mainDate.month],["Year",CONFIG.mainDate.year]];
$('tiles').innerHTML=dparts.map(([l,v])=>`<div class="tile"><div class="tile-in"><span class="v${v.length>4?' sm':''}">${esc(v)}</span><canvas tabindex="0" aria-label="Scratch to reveal the ${l.toLowerCase()}, or press Enter"></canvas></div><span class="tile-cap">${l.toUpperCase()}</span></div>`).join('');
const mainEv=CONFIG.events[CONFIG.events.length-1];
$('whenLine').textContent=CONFIG.mainDate.line;$('whenSub').textContent=CONFIG.mainDate.sub;
$('whenCal').href=gcal(`${CONFIG.bride} & ${CONFIG.groom}: ${mainEv.en}`,mainEv.start,mainEv.hours,CONFIG.venue);
let revealed=0;
function foil(cv){
  const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=Math.max(1,r.width*d);cv.height=Math.max(1,r.height*d);
  const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);const w=r.width,h=r.height;
  const g=x.createLinearGradient(0,0,w,h);[[0,'#ecdbb0'],[.22,'#ab904c'],[.42,'#f3e8cd'],[.6,'#998145'],[.8,'#d6c8a4'],[1,'#7a1e27']].forEach(s=>g.addColorStop(...s));
  x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<w*h/10;i++){x.fillStyle=`rgba(${Math.random()>.5?'255,250,230':'90,55,5'},${Math.random()*.16})`;x.fillRect(Math.random()*w,Math.random()*h,1,1);}
  x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=1;for(let i=-h;i<w;i+=7){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();}
  x.strokeStyle='rgba(81,20,26,.55)';x.strokeRect(6.5,6.5,w-13,h-13);
  x.fillStyle='rgba(81,20,26,.6)';x.font=`600 ${Math.round(w*.12)}px Cinzel, serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('✦',w/2,h/2);
  cv.dataset.w=w;
}
function scratched(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let c=0,t=0;for(let i=3;i<d.length;i+=80){t++;if(d[i]<20)c++;}return c/t;}
function tileDone(cv){if(cv.classList.contains('done'))return;cv.classList.add('done');revealed++;const[x,y]=centerOf(cv);burst(x,y,16,'spark');
  if(revealed===3){$('when').hidden=false;$('dateHint').hidden=true;}}
document.querySelectorAll('.tile canvas').forEach(cv=>{
  foil(cv);let down=false,last=null,m=0;
  const pt=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
  const sc=p=>{const x=cv.getContext('2d');x.globalCompositeOperation='destination-out';x.lineCap='round';x.lineWidth=Math.max(20,+cv.dataset.w*.24);x.beginPath();x.moveTo(...(last||p));x.lineTo(...p);x.stroke();x.globalCompositeOperation='source-over';last=p;if(++m%6===0&&scratched(cv)>.45)tileDone(cv);};
  cv.addEventListener('pointerdown',e=>{down=true;last=null;cv.setPointerCapture(e.pointerId);sc(pt(e));});
  cv.addEventListener('pointermove',e=>{if(down)sc(pt(e));});
  ['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{down=false;last=null;if(scratched(cv)>.3)tileDone(cv);}));
  cv.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tileDone(cv);}});
});
addEventListener('resize',()=>document.querySelectorAll('.tile canvas:not(.done)').forEach(foil));

/* ================= 4 · STORY POSTCARDS ================= */
const ART={
  delhi:()=>`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#50141a"/><stop offset=".55" stop-color="#a22834"/><stop offset="1" stop-color="#c9b686"/></linearGradient>
    <linearGradient id="dst" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9a165"/><stop offset=".5" stop-color="#d4c59f"/><stop offset="1" stop-color="#9b8346"/></linearGradient>
    <radialGradient id="dfire"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient></defs>
    <rect width="320" height="200" fill="url(#dsky)"/>
    ${Array.from({length:20},()=>`<circle cx="${rnd()*320}" cy="${rnd()*80}" r="${rnd()*.9+.3}" fill="#fff" opacity="${.3+rnd()*.5}"/>`).join('')}
    <rect y="168" width="320" height="32" fill="#2a1a2a"/>
    <path d="M0 172 L320 172" stroke="#c9b686" stroke-opacity=".4"/>
    <g><rect x="110" y="160" width="100" height="10" fill="#82202a"/>
      <rect x="118" y="72" width="84" height="90" fill="url(#dst)"/>
      <path d="M140 162 V112 A20 20 0 0 1 180 112 V162 Z" fill="#5c171e"/>
      <path d="M140 112 A20 20 0 0 1 180 112" fill="none" stroke="#6c1b23" stroke-width="2"/>
      <rect x="114" y="60" width="92" height="14" fill="#cab789"/><rect x="114" y="60" width="92" height="2" fill="#eddcb3"/>
      <rect x="126" y="50" width="68" height="10" fill="#c3ae79"/>
      <path d="M140 50 Q160 34 180 50 Z" fill="#bba367"/>
      <text x="160" y="69.5" text-anchor="middle" font-family="Cinzel,serif" font-size="5.6" fill="#6c1b23" letter-spacing="1">INDIA</text>
      <rect x="122" y="82" width="12" height="70" fill="#000" opacity=".06"/><rect x="186" y="82" width="12" height="70" fill="#000" opacity=".1"/></g>
    ${[40,280].map(x=>`<line x1="${x}" y1="170" x2="${x}" y2="120" stroke="#1b1020" stroke-width="2"/><circle cx="${x}" cy="118" r="9" fill="url(#dfire)"/><circle cx="${x}" cy="118" r="2.4" fill="#fff2c4"/>`).join('')}
    <circle cx="70" cy="168" r="30" fill="url(#dfire)"/>
    <path d="M58 172 L82 172 L76 166 L64 166Z" fill="#2e0b0f"/>
    <path d="${flamePath(66,168,20,9)}" fill="#ff8a2a"/><path d="${flamePath(73,169,26,10)}" fill="#ffb347"/><path d="${flamePath(71,169,14,5)}" fill="#fff0b0"/>
    ${Array.from({length:8},(_,i)=>`<circle cx="${62+rnd()*18}" cy="${130-rnd()*30}" r="1" fill="#ffd27a" opacity="${.4+rnd()*.5}"/>`).join('')}
    </svg>`,
  mumbai:()=>`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#300c0f"/><stop offset=".65" stop-color="#7e1f29"/><stop offset="1" stop-color="#d24b59"/></linearGradient>
    <linearGradient id="msea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d171e"/><stop offset="1" stop-color="#24080b"/></linearGradient>
    <linearGradient id="mst" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bda76e"/><stop offset=".5" stop-color="#e9d4a1"/><stop offset="1" stop-color="#a08747"/></linearGradient></defs>
    <rect width="320" height="200" fill="url(#msky)"/>
    <circle cx="262" cy="40" r="13" fill="#f5edd7"/><circle cx="268" cy="36" r="12" fill="#58161c" opacity=".9"/>
    ${Array.from({length:22},()=>`<circle cx="${rnd()*320}" cy="${rnd()*90}" r="${rnd()*.9+.3}" fill="#fff" opacity="${.3+rnd()*.6}"/>`).join('')}
    <rect y="146" width="320" height="54" fill="url(#msea)"/>
    <g><rect x="96" y="80" width="128" height="68" fill="url(#mst)"/>
      <path d="M140 148 V108 Q160 86 180 108 V148Z" fill="#711c24"/>
      <path d="M108 148 V124 Q116 114 124 124 V148Z" fill="#711c24"/><path d="M196 148 V124 Q204 114 212 124 V148Z" fill="#711c24"/>
      <rect x="96" y="76" width="128" height="6" fill="#d3c49e"/>
      ${[96,128,180,212].map(x=>`<rect x="${x}" y="52" width="12" height="28" fill="#cbb98c"/><path d="M${x-1} 52 Q${x+6} 38 ${x+13} 52Z" fill="#d3c49e"/><line x1="${x+6}" y1="42" x2="${x+6}" y2="36" stroke="#d3c49e"/>`).join('')}
      <rect x="140" y="64" width="40" height="12" fill="#cfbf95"/>
      ${Array.from({length:9},(_,i)=>`<rect x="${142+i*4.2}" y="67" width="2" height="7" fill="#82202a"/>`).join('')}
      ${Array.from({length:12},(_,i)=>`<circle cx="${100+i*11}" cy="79" r="1.2" fill="#ffe3a0"/>`).join('')}</g>
    <g opacity=".35" transform="translate(0 296) scale(1 -1)"><rect x="96" y="148" width="128" height="10" fill="#e9d4a1"/></g>
    <path d="M0 150 Q160 138 320 150" stroke="none" fill="none"/>
    ${Array.from({length:30},(_,i)=>{const x=i*11;const y=150-Math.sin(i/29*Math.PI)*4;return `<circle cx="${x}" cy="${y}" r="1.1" fill="#ffd98a"/>`;}).join('')}
    ${Array.from({length:12},(_,i)=>`<rect x="${10+i*26+rnd()*8}" y="${158+(i%4)*9}" width="${10+rnd()*12}" height="1" fill="#ffd98a" opacity=".45"/>`).join('')}
    <path d="M40 176 L74 176 L68 182 L46 182Z" fill="#26090c"/><line x1="57" y1="176" x2="57" y2="160" stroke="#26090c"/><circle cx="57" cy="163" r="2" fill="#ffcf6a"/>
    </svg>`,
  udaipur:()=>`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="usky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#83202a"/><stop offset=".5" stop-color="#d87566"/><stop offset="1" stop-color="#ffd08a"/></linearGradient>
    <linearGradient id="ulake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b687"/><stop offset=".4" stop-color="#9c2732"/><stop offset="1" stop-color="#4c1318"/></linearGradient>
    <radialGradient id="usun"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff9a5a" stop-opacity="0"/></radialGradient></defs>
    <rect width="320" height="200" fill="url(#usky)"/>
    <circle cx="210" cy="128" r="40" fill="url(#usun)"/><circle cx="210" cy="128" r="14" fill="#fff4cf"/>
    <path d="M0 132 L40 110 L80 124 L130 102 L180 120 L230 106 L280 120 L320 108 L320 136 L0 136Z" fill="#6e1b23" opacity=".55"/>
    <rect y="134" width="320" height="66" fill="url(#ulake)"/>
    <g fill="#f3e8cc"><rect x="8" y="92" width="120" height="44"/><rect x="40" y="78" width="56" height="16"/>
      ${[16,40,64,88,112].map(x=>`<rect x="${x}" y="82" width="10" height="10"/><path d="M${x-2} 82 Q${x+5} 72 ${x+12} 82Z"/>`).join('')}
      <path d="M58 78 Q68 60 78 78Z"/></g>
    ${Array.from({length:3},(_,r)=>Array.from({length:10},(_,i)=>`<path d="M${14+i*11} ${106+r*10} v-4 a2.5 2.5 0 0 1 5 0 v4z" fill="#c4b07c"/>`).join('')).join('')}
    <g opacity=".35"><rect x="8" y="136" width="120" height="22" fill="#f3e8cc"/></g>
    ${Array.from({length:8},(_,i)=>`<rect x="${190+rnd()*40}" y="${140+i*7}" width="${10+rnd()*24}" height="1.2" fill="#fff2c4" opacity="${.7-i*.07}"/>`).join('')}
    <g transform="translate(150 158)"><path d="M-30 0 Q0 10 30 0 L24 6 Q0 13 -24 6Z" fill="#310c10"/><path d="M-22 0 L-22 -14 Q0 -24 22 -14 L22 0" fill="none" stroke="#310c10" stroke-width="1.5"/>
      <circle cx="-6" cy="-10" r="3.4" fill="#310c10"/><path d="M-10 0 Q-6 -8 -2 0Z" fill="#310c10"/>
      <circle cx="6" cy="-11" r="3.4" fill="#310c10"/><path d="M2 0 Q6 -9 10 0Z" fill="#310c10"/>
      <path d="M0 -24 l2 4 4 1 -4 1 -2 4 -2 -4 -4 -1 4 -1z" fill="#fff4cf"/></g>
    </svg>`
};
function postmark(city,yr){return `<svg class="pmark" viewBox="0 0 80 80" aria-hidden="true"><defs><path id="pm${city}" d="M40 40 m-27 0 a27 27 0 1 1 54 0 a27 27 0 1 1 -54 0"/></defs>
  <circle cx="40" cy="40" r="34" fill="none" stroke="#59161d" stroke-width="1.4"/><circle cx="40" cy="40" r="20" fill="none" stroke="#59161d" stroke-width="1"/>
  <text font-family="Cinzel,serif" font-size="8" letter-spacing="2" fill="#59161d"><textPath href="#pm${city}">${esc(city.toUpperCase())} · ${esc(city.toUpperCase())} ·</textPath></text>
  <text x="40" y="44" text-anchor="middle" font-family="Cinzel,serif" font-size="9" fill="#59161d">${esc(yr)}</text>
  ${[0,1,2,3].map(i=>`<path d="M74 ${30+i*6} q8 -3 16 0 t16 0" stroke="#59161d" fill="none" stroke-width="1"/>`).join('')}</svg>`;}
const stack=$('stack');let order=CONFIG.story.map((_,i)=>i);
stack.innerHTML=CONFIG.story.map((s,i)=>`<article class="pc" data-i="${i}" tabindex="0" aria-label="${esc(s.city)}, ${esc(s.when)}.${i<CONFIG.story.length-1?' Tap for the next postcard.':''}">
  <div class="pc-art">${ART[s.art]()}</div>
  <div class="stamp"><div style="background:${s.stamp}"><b>${esc(s.city[0])}</b>${esc(s.city.toUpperCase())}<br>${esc(s.when.match(/\d{4}/)[0])}</div></div>
  ${postmark(s.city,s.when.match(/\d{4}/)[0])}
  <div class="pc-body"><p class="pc-yr">${esc(s.when)}</p><p class="pc-city">${esc(s.city)}</p><p class="txt">${esc(s.text)}</p></div>
  <div class="pc-foot"><span>Chapter ${i+1} of ${CONFIG.story.length}</span><span>${i<CONFIG.story.length-1?'Next →':'The story continues…'}</span></div></article>`).join('');
$('route').innerHTML=CONFIG.story.map((s,i)=>`${i?'<span class="leg" aria-hidden="true"></span>':''}<button type="button" data-i="${i}" aria-label="Show ${esc(s.city)}"><i></i>${esc(s.city.toUpperCase())}</button>`).join('');
function layout(){const cards=[...stack.children];order.forEach((ci,p)=>{const c=cards[ci];c.style.zIndex=10-p;c.style.transform=`translateY(${p*12}px) scale(${1-p*.05}) rotate(${[0,-3,3][p]||0}deg)`;c.style.opacity=p>2?0:1;c.style.pointerEvents=p?'none':'auto';});
  document.querySelectorAll('#route button').forEach(b=>b.classList.toggle('on',+b.dataset.i===order[0]));}
let busy=false;
const LAST=CONFIG.story.length-1;
function storyEnd(){const h=$('storyHint');if(h)h.textContent=order[0]===LAST?`The next chapter begins in ${CONFIG.story[LAST].city}`:'Tap or swipe the postcard';}
function nextCard(){if(busy)return;
  if(order[0]===LAST){const top=stack.children[LAST];top.classList.remove('nope');void top.offsetWidth;top.classList.add('nope');const[x,y]=centerOf(top);burst(x,y,18,'spark');return;}
  busy=true;const top=stack.children[order[0]];top.classList.add('fly');
  setTimeout(()=>{order.push(order.shift());top.style.transition='none';top.classList.remove('fly');layout();storyEnd();requestAnimationFrame(()=>requestAnimationFrame(()=>{top.style.transition='';busy=false;}));},420);}
function goTo(i){if(order[0]===i)return;order=[...CONFIG.story.keys()].slice(i).concat([...CONFIG.story.keys()].slice(0,i));layout();storyEnd();}
[...stack.children].forEach(c=>{let x0=null;
  c.addEventListener('pointerdown',e=>{x0=e.clientX;});
  c.addEventListener('pointerup',e=>{if(x0===null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>30||Math.abs(dx)<8)nextCard();});
  c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nextCard();}});
});
$('route').addEventListener('click',e=>{const b=e.target.closest('button');if(b)goTo(+b.dataset.i);});
layout();

/* ================= 5 · JHAROKHA WINDOWS ================= */
function bokeh(h1,h2){return tex(300,430,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,`hsl(${h2} 45% 16%)`);g.addColorStop(.6,`hsl(${h1} 45% 34%)`);g.addColorStop(1,`hsl(354 60% 12%)`);x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<46;i++){const r=6+Math.random()*30,X=Math.random()*w,Y=Math.random()*h*.8;const c=x.createRadialGradient(X,Y,0,X,Y,r);const hh=Math.random()>.5?8:43;c.addColorStop(0,`hsla(${hh} 70% 82% / ${.25+Math.random()*.35})`);c.addColorStop(.75,`hsla(${hh} 65% 78% / ${.12+Math.random()*.15})`);c.addColorStop(1,`hsla(${hh} 65% 78% / 0)`);x.fillStyle=c;x.beginPath();x.arc(X,Y,r,0,7);x.fill();}
  x.fillStyle='rgba(20,6,4,.75)';x.beginPath();x.ellipse(w*.42,h*.78,w*.13,h*.26,0,0,7);x.fill();x.beginPath();x.arc(w*.42,h*.48,w*.075,0,7);x.fill();
  x.beginPath();x.ellipse(w*.6,h*.8,w*.14,h*.26,0,0,7);x.fill();x.beginPath();x.arc(w*.6,h*.5,w*.078,0,7);x.fill();});}
$('wins').innerHTML=CONFIG.photos.map((p,i)=>`<div class="win" id="w${i}">
  <button class="win-btn" type="button" aria-label="Open the window: ${esc(p.cap)}">
    <div class="opening">
      <div class="ph" style="background-image:url(${p.src?esc(p.src):bokeh(p.hue[0],p.hue[1])})">${p.src?'':`<span class="ph-tag">YOUR PHOTO HERE</span>`}</div>
      <p class="ph-cap">${esc(p.cap)}</p>
      <div class="shut l"><i></i><i></i></div><div class="shut r"><i></i><i></i></div>
    </div>
  </button><div class="sill" aria-hidden="true"></div></div>`).join('');
document.querySelectorAll('.win').forEach(w=>w.querySelector('.win-btn').addEventListener('click',()=>{const o=!w.classList.contains('open');w.classList.toggle('open',o);if(o){const[x,y]=centerOf(w);burst(x,y-40,14,'petal');}}));

/* ================= 6 · ACTS ================= */
let toranN=0;function toran(colA,colB){let s='';const W=1600;const u=++toranN;
  s+=`<path d="M0 8 Q100 18 200 8 ${Array.from({length:7},(_,i)=>`T${400+i*200} 8`).join(' ')}" stroke="#5a692b" stroke-width="2" fill="none"/>`;
  for(let x=8;x<W;x+=20){const len=3+((x/20)%3===0?3:(x/20)%2?1:2);const yb=8+Math.sin(x/400*Math.PI*2)*5+5;
    s+=`<line x1="${x}" y1="${yb}" x2="${x}" y2="${yb+len*9}" stroke="#6f1b24" stroke-width=".6"/>`;
    for(let j=0;j<len;j++){const c=j%2?colB:colA;s+=`<circle cx="${x}" cy="${yb+5+j*9}" r="5" fill="url(#mg${c===colA?'a':'b'}${u})"/>`;}
    s+=`<path d="M${x+10} ${yb-2} q6 10 0 22 q-6 -12 0 -22z" fill="#657730" stroke="#485522" stroke-width=".5"/>`;}
  return `<svg class="toran" viewBox="0 0 1600 70" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><defs>
    <radialGradient id="mga${u}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffd36a"/><stop offset=".6" stop-color="${colA}"/><stop offset="1" stop-color="#61181f"/></radialGradient>
    <radialGradient id="mgb${u}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff0a0"/><stop offset=".6" stop-color="${colB}"/><stop offset="1" stop-color="#6c1b23"/></radialGradient></defs>${s}</svg>`;}
/* ---------- Event scenes: illustrated images with interactive layers on top ---------- */
/* Positions are percentages of the illustration (1136×1408), so they hold at every screen size. */
function sceneFrame(key,layers){
  const s=CONFIG.scenes[key];
  return `<div class="scene-frame"><figure class="scene-fig" id="sc-${key}" style="aspect-ratio:${s.w}/${s.h}">
    <img src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.w}" height="${s.h}" decoding="async">
    ${layers}</figure></div>`;
}
function mehendiLayers(){
  const k=CONFIG.groom[0];
  // a fresh henna stroke that keeps being drawn just behind the cone tip (viewBox matches the image)
  return `<svg class="sc-svg" viewBox="0 0 1100 1063" preserveAspectRatio="none" aria-hidden="true">
      <path class="fresh" pathLength="1" d="M628 566 C640 552 652 556 650 566 C648 576 636 574 640 562 C646 548 662 544 671 537"/>
    </svg>
    <span class="glint" style="left:61%;top:50.5%"></span>
    <span class="game-badge" aria-hidden="true">Find the ${esc(k)}</span>
    <span class="lens" id="lens" aria-hidden="true"></span>
    <button class="kspot" id="kSpot" type="button" style="left:48%;top:62%" aria-label="The hidden initial"><span>${esc(k)}</span></button>`;
}
function sangeetLayers(){
  return `<span class="lights" aria-hidden="true"></span>
    <button class="sc-hit" id="dhol" type="button" aria-label="Play the dhol"></button>
    <span class="ripple" id="ripple" style="left:18%;top:86%" aria-hidden="true"></span>`;
}
function vivahLayers(){
  return `<canvas class="agni-cv" id="agniCv" style="left:34%;top:50%;width:26%;height:24%" aria-hidden="true"></canvas>
    <span class="fireglow" id="fireGlow" style="left:47%;top:66%" aria-hidden="true"></span>
    <button class="sc-hit" id="agni" type="button" aria-label="Tap the sacred fire to take a phera"></button>`;
}

$('acts').innerHTML=CONFIG.events.map((e,i)=>{
  const day=fmt(e.start,{weekday:'long',day:'numeric',month:'long'});
  const tm=fmt(e.start,{hour:'numeric',minute:'2-digit',hour12:true}).toUpperCase();
  const cal=gcal(`${CONFIG.bride} & ${CONFIG.groom}: ${e.en}`,e.start,e.hours,`${e.place}, ${CONFIG.venue}`);
  let art='',note='';
  if(e.key==='mehendi'){art=`<div class="game-card" id="gameCard">
      <p class="gc-eyebrow"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5.5 5.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>The Mehendi Game</p>
      <p class="gc-title">Find the hidden <b>${esc(CONFIG.groom[0])}</b></p>
      <p class="gc-rule">By tradition, the groom's initial is hidden in the bride's mehendi. Can you spot <b>${esc(CONFIG.groom)}'s "${esc(CONFIG.groom[0])}"</b> in ${esc(CONFIG.bride)}'s palm? Tap or hover to look closer, then tap the letter.</p>
      <div class="gc-row"><span id="gcTries">Tries: 0</span><button type="button" class="gc-hint" id="gcHint">Need a hint?</button></div>
    </div>`+sceneFrame('mehendi',mehendiLayers());note=`Legend says the groom's initial hides in the bride's mehendi. Can you find ${esc(CONFIG.groom)}'s "${esc(CONFIG.groom[0])}" in her palm?`;}
  if(e.key==='sangeet'){art=sceneFrame('sangeet',sangeetLayers());note='Tap the dhol to start the night. Turn your sound on.';}
  if(e.key==='vivah'){art=sceneFrame('vivah',vivahLayers())+`<div class="diyas" id="diyas" aria-hidden="true"></div><p class="phera-count" id="pc">PHERA 0 OF 7</p>`;note='Tap the sacred fire to walk the seven pheras with them.';}
  return `<section class="act act-${e.key}" aria-label="${esc(e.en)}">${toran(e.key==='vivah'?'#8c2a34':'#b8404c',e.key==='vivah'?'#ecbcb4':'#f4cfc7')}
   <div class="inner">
    <div class="act-head">
    <p class="act-no">${esc(e.act)} · ${esc(day.toUpperCase())}</p>
    <p class="act-hi foil">${esc(e.hi)}</p>
    <p class="act-en">${esc(e.en.toUpperCase())}</p>
    <p class="act-tag">${esc(e.tag)}</p>
    <div class="act-when"><b>${esc(tm)} ONWARDS</b><span>${esc(e.place)}, ${esc(CONFIG.venue.split(',')[0])}</span></div>
    <p class="act-copy">${esc(e.copy)}</p>
    </div>
    <div class="act-visual">
    ${art}
    <p class="play-note" id="note-${e.key}" aria-live="polite">${note}</p>
    </div>
    <div class="act-meta">
    <div class="dress"><div><small>DRESS CODE</small><p>${esc(e.dress)}</p></div><span class="dots">${e.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span></div>
    <a class="btn" href="${cal}" target="_blank" rel="noopener">Add to calendar</a>
    </div>
   </div></section>`;
}).join('');

/* mehendi game: find the groom's initial hidden in the bride's mehendi */
(function(){
  const fig=$('sc-mehendi');if(!fig)return;
  const spot=$('kSpot'),note=$('note-mehendi'),lens=$('lens'),img=fig.querySelector('img'),card=$('gameCard');
  let found=false,tries=0,hints=0;
  const setTries=()=>{$('gcTries').textContent=`Tries: ${tries}`;};
  if('IntersectionObserver' in window&&!RM){const io=new IntersectionObserver(es=>{es.forEach(en=>{fig.classList.toggle('live',en.isIntersecting);});},{threshold:.3});io.observe(fig);}else fig.classList.add('live');
  // magnifying glass: follows the finger or mouse over the picture
  const ZOOM=2.6;
  function moveLens(cx,cy){const r=fig.getBoundingClientRect(),x=cx-r.left,y=cy-r.top;if(x<0||y<0||x>r.width||y>r.height){lens.classList.remove('on');return;}
    const L=lens.offsetWidth/2;lens.style.left=x+'px';lens.style.top=y+'px';lens.style.backgroundImage=`url(${img.currentSrc||img.src})`;
    lens.style.backgroundSize=`${r.width*ZOOM}px ${r.height*ZOOM}px`;lens.style.backgroundPosition=`${-(x*ZOOM-L)}px ${-(y*ZOOM-L)}px`;lens.classList.add('on');}
  fig.addEventListener('pointermove',e=>{if(!found)moveLens(e.clientX,e.clientY);});
  fig.addEventListener('pointerdown',e=>{if(!found)moveLens(e.clientX,e.clientY);});
  fig.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')lens.classList.remove('on');});
  let hideT=0;fig.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){clearTimeout(hideT);hideT=setTimeout(()=>lens.classList.remove('on'),1400);}});
  function win(){found=true;fig.classList.add('found');lens.classList.remove('on');card.classList.add('won');
    $('gcTries').textContent=tries<=1?'Found on the first try!':`Found in ${tries} tries`;$('gcHint').hidden=true;
    note.textContent=`You found it. ${CONFIG.bride}'s mehendi hides ${CONFIG.groom}'s initial, just like the old tradition.`;
    const[x,y]=centerOf(spot);burst(x,y,50,'spark');burst(0,0,60,'rain');}
  spot.addEventListener('click',ev=>{ev.stopPropagation();if(found)return;tries++;win();});
  fig.addEventListener('click',()=>{if(found)return;tries++;setTries();fig.classList.remove('nope');void fig.offsetWidth;fig.classList.add('nope');
    note.textContent=tries<3?'Not there. Keep looking in the mehendi on her palm.':'Still hiding! Tap "Need a hint?" if you are stuck.';});
  $('gcHint').addEventListener('click',()=>{if(found)return;hints++;
    if(hints===1)note.textContent='Hint: it is in the middle of her palm, below the two big flowers.';
    else{note.textContent='Here it is, glowing. Tap it!';spot.classList.add('hint');}});
})();

/* sangeet: tap the dhol */
(function(){
  const b=$('dhol');if(!b)return;const fig=$('sc-sangeet'),rip=$('ripple');let ac=null,hits=0;
  const ctx=()=>{if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();}if(ac.state==='suspended')ac.resume();return ac;};
  function bass(a,t){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(46,t+.3);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.9,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+.5);o.connect(g).connect(a.destination);o.start(t);o.stop(t+.55);}
  function slap(a,t){const n=a.sampleRate*.14,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
    const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=1.4;const g=a.createGain();g.gain.value=.55;s.connect(f).connect(g).connect(a.destination);s.start(t);
    const o=a.createOscillator(),og=a.createGain();o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(260,t+.08);og.gain.setValueAtTime(.25,t);og.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(og).connect(a.destination);o.start(t);o.stop(t+.12);}
  const beat=[[0,'b'],[.15,'s'],[.3,'s'],[.45,'b'],[.6,'s'],[.68,'b'],[.83,'s']];
  b.addEventListener('click',()=>{
    hits++;
    try{const a=ctx();if(a){const t=a.currentTime+.02;beat.forEach(([d,k])=>k==='b'?bass(a,t+d):slap(a,t+d));}}catch(e){}
    beat.forEach(([d,k])=>setTimeout(()=>{fig.classList.remove('boom','boom2');void fig.offsetWidth;fig.classList.add(k==='b'?'boom':'boom2');
      if(k==='b'){rip.classList.remove('go');void rip.offsetWidth;rip.classList.add('go');}},d*1000));
    const[x,y]=centerOf(rip);burst(x,y-20,26,'spark');
    $('note-sangeet').textContent=hits<3?'Dha, ge, na, ti! Again?':hits<6?'The baraat would be proud.':`${hits} beats. You are officially on the Sangeet list.`;
  });
})();

/* vivah: living fire and the seven pheras */
(function(){
  const btn=$('agni');if(!btn)return;
  const cv=$('agniCv'),x=cv.getContext('2d'),fig=$('sc-vivah');let W=0,H=0,flames=[],boost=0,n=0,on=false;
  const vows=['For nourishment, and a home that is never short of food.','For strength, in body and in mind.','For prosperity, earned honestly and shared.','For love and respect for each other’s families.','For children, and the joy they bring.','For health, and a long life together.','For friendship and loyalty, forever.'];
  const diyas=$('diyas');diyas.innerHTML=Array.from({length:7},(_,i)=>`<i title="Phera ${i+1}"></i>`).join('');
  function size(){const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0);}
  size();addEventListener('resize',size);
  function spawn(){const s=1+boost;flames.push({x:W*(.3+Math.random()*.4),y:H*.86,vx:(Math.random()-.5)*.5,vy:-(1.2+Math.random()*1.6)*s,r:(H*.06+Math.random()*H*.07)*(.8+boost*.5),life:0,max:28+Math.random()*24});}
  function frame(){
    if(!on)return;
    x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
    const k=3+Math.round(boost*4);for(let i=0;i<k;i++)spawn();
    flames=flames.filter(f=>f.life<f.max);
    for(const f of flames){f.life++;f.x+=f.vx+Math.sin((f.life+f.x)*.2)*.4;f.y+=f.vy;const t=f.life/f.max,r=f.r*(1-t*.7);
      const g=x.createRadialGradient(f.x,f.y,0,f.x,f.y,r);
      g.addColorStop(0,`rgba(255,${240-t*120|0},${170-t*150|0},${.55*(1-t)})`);g.addColorStop(.5,`rgba(255,${150-t*80|0},40,${.28*(1-t)})`);g.addColorStop(1,'rgba(255,80,20,0)');
      x.fillStyle=g;x.beginPath();x.arc(f.x,f.y,r,0,6.283);x.fill();}
    x.globalCompositeOperation='source-over';boost*=.96;requestAnimationFrame(frame);
  }
  if('IntersectionObserver' in window&&!RM){const io=new IntersectionObserver(es=>{es.forEach(en=>{const was=on;on=en.isIntersecting;if(on&&!was){size();requestAnimationFrame(frame);}});},{threshold:.2});io.observe(cv);}
  btn.addEventListener('click',()=>{
    if(n>=7){n=0;[...diyas.children].forEach(d=>d.classList.remove('lit'));$('pc').textContent='PHERA 0 OF 7';$('note-vivah').textContent='Tap the sacred fire to walk the seven pheras with them.';return;}
    n++;boost=1.2;fig.classList.remove('flare');void fig.offsetWidth;fig.classList.add('flare');
    diyas.children[n-1].classList.add('lit');$('pc').textContent=`PHERA ${n} OF 7`;
    $('note-vivah').textContent=n<7?`${['First','Second','Third','Fourth','Fifth','Sixth'][n-1]} phera. ${vows[n-1]}`:`Seventh phera. ${vows[6]} Saat phere complete.`;
    const[px,py]=centerOf($('fireGlow'));burst(px,py,n<7?12:30,'spark');if(n===7)burst(0,0,150,'rain');
  });
})();

/* ================= 7 · COUNTDOWN ================= */
const first=CONFIG.events[0],T=new Date(first.start).getTime();
$('cdUntil').textContent=`until the ${first.en}, on ${fmt(first.start,{weekday:'long',day:'numeric',month:'long'})}`;
function tick(){const s=Math.max(0,Math.floor((T-Date.now())/1000));$('cdD').textContent=Math.floor(s/86400);$('cdH').textContent=String(Math.floor(s%86400/3600)).padStart(2,'0');$('cdM').textContent=String(Math.floor(s%3600/60)).padStart(2,'0');$('cdS').textContent=String(s%60).padStart(2,'0');}
tick();setInterval(tick,1000);

/* ================= 8 · VENUE ================= */
(function(){
  const wl=200;let win='',dom='',lights='';
  const blocks=[[36,146,100],[136,112,128],[264,146,100]];
  blocks.forEach(([bx,by,bw],bi)=>{
    for(let row=by+14;row<wl-10;row+=24){for(let x=bx+9;x<bx+bw-8;x+=15){win+=`<path d="M${x} ${row+13}V${row+5}a3.6 3.6 0 0 1 7.2 0V${row+13}Z" fill="url(#vw)" opacity="${.7+rnd()*.3}"/>`;}}
    const n=bi===1?3:2;for(let k=0;k<n;k++){const cx=bx+bw*(k+1)/(n+1);dom+=`<rect x="${cx-9}" y="${by-14}" width="18" height="14" fill="#ecdcb2"/><path d="M${cx-11} ${by-14}a11 11 0 0 1 22 0Z" fill="#f2e6c9"/><line x1="${cx}" y1="${by-25}" x2="${cx}" y2="${by-32}" stroke="#f2e6c9" stroke-width="1.4"/>`;}
    for(let x=bx;x<=bx+bw;x+=5)lights+=`<circle cx="${x}" cy="${by+1}" r="1.1" fill="#ffe1a0"/>`;
  });
  const b=`<g>${blocks.map(([bx,by,bw])=>`<rect x="${bx}" y="${by}" width="${bw}" height="${wl-by}" fill="url(#vs)"/>`).join('')}${dom}${win}${lights}</g>`;
  $('palace').innerHTML=`<defs>
    <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24090b"/><stop offset=".7" stop-color="#53141b"/><stop offset="1" stop-color="#90232e"/></linearGradient>
    <linearGradient id="vlake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#431015"/><stop offset="1" stop-color="#07050f"/></linearGradient>
    <linearGradient id="vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe0bb"/><stop offset="1" stop-color="#bba469"/></linearGradient>
    <linearGradient id="vw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset="1" stop-color="#bda76e"/></linearGradient>
    <radialGradient id="vmoon"><stop offset="0" stop-color="#fff8e0"/><stop offset=".3" stop-color="#fff2c8" stop-opacity=".5"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></radialGradient>
    <filter id="vb"><feGaussianBlur stdDeviation="1.4 3"/></filter></defs>
    <rect width="400" height="${wl}" fill="url(#vsky)"/>
    ${Array.from({length:60},()=>`<circle cx="${rnd()*400}" cy="${rnd()*120}" r="${rnd()*.9+.2}" fill="#fff" opacity="${.3+rnd()*.6}"/>`).join('')}
    <circle cx="320" cy="52" r="40" fill="url(#vmoon)"/><circle cx="320" cy="52" r="11" fill="#fff8e6"/>
    <path d="M0 200 L0 160 L50 138 L100 156 L160 128 L220 150 L280 132 L340 152 L400 140 L400 200Z" fill="#340c10"/>
    <rect y="${wl}" width="400" height="100" fill="url(#vlake)"/>
    ${b}
    <g transform="translate(0 ${wl*2}) scale(1 -1)" opacity=".45" filter="url(#vb)">${b}</g>
    ${Array.from({length:16},(_,i)=>`<rect class="shimmer" style="animation-delay:-${(rnd()*3).toFixed(2)}s" x="${30+rnd()*340}" y="${wl+6+rnd()*80}" width="${8+rnd()*22}" height="1.2" fill="#ffd98a"/>`).join('')}
    <g transform="translate(90 262)"><path d="M-26 0 Q0 8 26 0 L20 6 Q0 11 -20 6Z" fill="#0d0814"/><line x1="0" y1="0" x2="0" y2="-14" stroke="#0d0814" stroke-width="1.2"/><circle cx="0" cy="-15" r="2.4" fill="#ffd27a"/><circle cx="0" cy="-15" r="8" fill="#ffd27a" opacity=".2"/></g>`;
})();
$('city').textContent=CONFIG.city;$('vname').textContent=CONFIG.venue;$('vaddr').textContent=CONFIG.address;$('mapBtn').href=maps;
const ICON={plane:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 18l24-8-3 4-9 3-3 8-2 1 1-7-6 1z"/><path d="M4 18l3 3"/></svg>',
  train:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="8" y="4" width="16" height="19" rx="4"/><path d="M8 14h16M12 27l-3 3M20 27l3 3M12 19h.01M20 19h.01"/><path d="M11 23l-1 4h12l-1-4"/></svg>',
  stay:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 28V12q10-10 20 0v16"/><path d="M12 28v-8a4 4 0 0 1 8 0v8M3 28h26"/><circle cx="16" cy="11" r="1.2"/></svg>'};
$('travel').innerHTML=CONFIG.travel.map(([k,h,t])=>`<div>${ICON[k]}<p><b>${esc(h)}</b>${esc(t)}</p></div>`).join('');

/* ================= 9 · FAMILIES / RSVP / END ================= */
$('elders').innerHTML=CONFIG.elders.map(n=>`<p>${esc(n)}</p>`).join('')+`<p style="font-family:var(--f-body);font-style:italic;letter-spacing:0;font-size:1.05rem;color:var(--muted);margin-top:10px">and the whole Kapoor and Malhotra parivaar, eager to see you</p>`;
$('families').textContent=CONFIG.families;$('sign').textContent=`${CONFIG.bride} & ${CONFIG.groom}`;
$('rsvpBy').textContent=CONFIG.rsvpBy;if(guest)$('famName').value=guest;
const counts=CONFIG.events.map(()=>2);
$('ctrs').innerHTML=CONFIG.events.map((e,i)=>`<div class="ctr"><div><b>${esc(e.en)}</b><span>${esc(fmt(e.start,{weekday:'short',day:'numeric',month:'short'}))}</span></div>
  <div class="stp"><button type="button" data-i="${i}" data-d="-1" aria-label="One fewer for ${esc(e.en)}">−</button><output id="o${i}">2</output><button type="button" data-i="${i}" data-d="1" aria-label="One more for ${esc(e.en)}">+</button></div></div>`).join('');
$('ctrs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;counts[i]=Math.max(0,Math.min(20,counts[i]+ +b.dataset.d));$('o'+i).textContent=counts[i];upd();});
const reply=()=>{const f=$('famName').value.trim()||'Our family',n=$('note').value.trim();return `Namaste! RSVP for ${CONFIG.bride} & ${CONFIG.groom}'s wedding\nFamily: ${f}\n\n${CONFIG.events.map((e,i)=>`${e.en}: ${counts[i]?counts[i]+' coming':'Sorry, can\'t make it'}`).join('\n')}${n?`\n\nNote: ${n}`:''}`;};
function upd(){$('wa').href=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(reply())}`;}
['famName','note'].forEach(id=>$(id).addEventListener('input',upd));upd();
$('rsvpForm').addEventListener('submit',e=>e.preventDefault());
$('copy').addEventListener('click',()=>{const t=reply();const ok=()=>{$('copied').hidden=false;setTimeout(()=>$('copied').hidden=true,3000);};
  const fb=()=>{$('note').value=t;$('note').select();$('copied').textContent='Reply placed in the note box and selected. Copy it from there.';ok();};
  try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}});

/* ================= APP: install + offline ================= */
(function(){
  const box=$('install'),btn=$('installBtn'),tip=$('installTip');
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(standalone||!box)return;
  let deferred=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;box.hidden=false;btn.hidden=false;});
  btn&&btn.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice;}catch(e){}deferred=null;box.hidden=true;});
  addEventListener('appinstalled',()=>{box.hidden=true;});
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
  if(ios){box.hidden=false;tip.textContent='To keep this invite on your phone, tap Share, then "Add to Home Screen".';}
})();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});});
  // When a newer version of the invite takes over, reload once so the guest sees it straight away.
  let reloaded=false;const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloaded)return;reloaded=true;location.reload();});
}
