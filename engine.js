/* =====================================================================
   The Covenant Chronicles — reader engine
   Views: LANDING -> LIBRARY -> READER -> LIBRARY
   Data: books.json (series + books[]). Layout/scene constants are the
   tuned values carried over from reader_reference.html — do not regress.
   ===================================================================== */

const PAGE_A = 0.74;       // page-inner width/height ratio target for justification
const GUTTER = 9;          // px gutter between panels (and rows)
const DEFAULT_EMBER = '#a8352a';
// Bump when any panel/background/cover file is re-cut under an existing name.
// Appended to every asset URL so browsers (and returning visitors) fetch fresh.
const ASSET_V = '20260622e';
const av = url => url ? url + (url.includes('?') ? '&' : '?') + 'v=' + ASSET_V : url;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const bg = document.getElementById('bg');
const views = {
  landing: document.getElementById('landing'),
  library: document.getElementById('library'),
  reader:  document.getElementById('reader'),
};
const backbar = document.getElementById('backbar');
const backBtn = document.getElementById('backBtn');
const toolbar = document.getElementById('toolbar');
const shareBtn = document.getElementById('shareBtn');
const helpBtn = document.getElementById('helpBtn');
const helpEl = document.getElementById('help');
const toastEl = document.getElementById('toast');
const zoomBtn = document.getElementById('zoomBtn');
const soundBtn = document.getElementById('soundBtn');
const theme = document.getElementById('theme');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const player = document.getElementById('player');
const playlistEl = document.getElementById('playlist');
const npTitle = document.getElementById('npTitle');
const playTrkBtn = document.getElementById('playTrk');
const volEl = document.getElementById('vol');
const seekEl = document.getElementById('seek');
const tCurEl = document.getElementById('tCur');
const tDurEl = document.getElementById('tDur');

/* per-book accent theming */
function setAccent(c){document.documentElement.style.setProperty('--ember', c || DEFAULT_EMBER);}

let DATA = null;           // { series, books[] }
let view = 'landing';

/* ---------- data ---------- */
async function loadData(){
  try{
    const res = await fetch('books.json?v='+ASSET_V, {cache:'no-cache'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){
    document.body.insertAdjacentHTML('beforeend',
      '<div style="position:fixed;inset:0;z-index:99;display:grid;place-items:center;'+
      'background:#040507;color:#cfc9bc;font-family:monospace;text-align:center;padding:30px;line-height:1.8">'+
      '<div><div style="color:#a8352a;letter-spacing:.3em;text-transform:uppercase;margin-bottom:14px">Cannot load books.json</div>'+
      'Open over a local server, not file://<br><br>'+
      '<code style="color:#efe9dc">python -m http.server</code><br>then visit '+
      '<code style="color:#efe9dc">http://localhost:8000</code></div></div>');
    throw err;
  }
}

/* ---------- scene background per view ---------- */
function setSceneBg(url){
  if(url) bg.style.backgroundImage = `url("${av(url)}")`;
}

/* ---------- view switching ----------
   Only the active view is painted: inactive views fade out, then get .hidden
   (display:none) so they leave the compositor. Keeps one blur layer on screen. */
const hideTimers={};
function show(name){
  view = name;
  for(const k in views){
    const el=views[k];
    clearTimeout(hideTimers[k]);
    if(k===name){
      el.classList.remove('hidden');     // mount before fading in
      void el.offsetWidth;               // reflow so opacity transition runs from 0
      el.classList.add('active');
    }else if(el.classList.contains('active')||!el.classList.contains('hidden')){
      el.classList.remove('active');     // fade out, then drop from render
      hideTimers[k]=setTimeout(()=>{ if(view!==k) el.classList.add('hidden'); },420);
    }else{
      el.classList.add('hidden');
    }
  }
  backbar.hidden = (name === 'landing');
  backBtn.innerHTML = (name === 'reader') ? '&lsaquo; Library' : '&lsaquo; Home';
  toolbar.hidden = false;                 // sound + help available everywhere
  shareBtn.hidden = (name !== 'reader');
  zoomBtn.hidden  = (name !== 'reader');
  if(name!=='reader') setZoom(false);     // leave magnify mode when leaving reader
}

/* ===================================================================
   SCRAMBLE (decode text reveal)
   =================================================================== */
function runScramble(scope){
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/*<>{}0123456789';
  scope.querySelectorAll('.scramble').forEach((el,i)=>{
    const final=el.getAttribute('data-final');let frame=0;const total=final.length;
    clearInterval(el._iv);
    setTimeout(()=>{el._iv=setInterval(()=>{
      let out='';for(let k=0;k<total;k++){out+=(k<frame)?final[k]:chars[Math.floor(Math.random()*chars.length)];}
      el.textContent=out;frame+=0.5;if(frame>total){clearInterval(el._iv);el.textContent=final;}
    },28);},i*120);
  });
}
function settleScramble(scope){
  scope.querySelectorAll('.scramble').forEach(e=>e.textContent=e.getAttribute('data-final'));
}
// split a title into <span> scramble lines, mark the middle word red
function titleLines(title){
  const words=title.toUpperCase().split(/\s+/).filter(Boolean);
  const mid=words.length>1?1:-1;
  return words.map((w,i)=>
    `<span class="ln${i===mid?' red':''} scramble" data-final="${w}"></span>`).join('');
}
function acronym(s){return s.split(/\s+/).filter(Boolean).map(w=>w[0]).join('').toUpperCase();}

/* ===================================================================
   LANDING
   =================================================================== */
function buildLanding(){
  const s=DATA.series;
  views.landing.innerHTML=
    '<div class="tags stagger"><span>'+acronym(s.tagline)+'</span><span>Chronicle</span><span>Year Zero</span></div>'+
    '<h1 class="title glitch stagger">'+titleLines(s.title)+'</h1>'+
    '<div class="tagline stagger">'+s.tagline+'</div>'+
    '<div class="rule stagger r"></div>'+
    '<div class="bio stagger">'+s.bio+'</div>'+
    (s.preface?'<button class="cta story-btn stagger" id="storyBtn">Story so far &#9662;</button>'+
      '<div class="preface" id="preface" hidden>'+s.preface+'</div>':'')+
    '<button class="cta stagger" id="enterBtn">Enter &rsaquo;</button>';
  // staged delays
  const order=views.landing.querySelectorAll('.stagger');
  const delays=[.05,.18,.5,.62,.78,.92,1.05];
  order.forEach((el,i)=>el.style.animationDelay=(delays[i]||0)+'s');
  document.getElementById('enterBtn').onclick=()=>nav('#library');
  const sb=document.getElementById('storyBtn');
  if(sb) sb.onclick=()=>{const p=document.getElementById('preface');const open=p.hidden;
    p.hidden=!open; sb.innerHTML=open?'Story so far &#9652;':'Story so far &#9662;';};

  if(reduce){ views.landing.classList.remove('intro'); settleScramble(views.landing); }
  else{ views.landing.classList.add('intro'); runScramble(views.landing); }
}
function renderLanding(){
  setAccent(DATA.series.accent);
  setSceneBg(DATA.books[0] && DATA.books[0].background);
  buildLanding();
  show('landing');
}

/* ===================================================================
   LIBRARY
   =================================================================== */
function buildLibrary(){
  document.getElementById('libTitle').textContent=DATA.series.title;
  document.getElementById('libSub').textContent=DATA.series.tagline;
  const shelf=document.getElementById('shelf');shelf.innerHTML='';
  DATA.books.forEach((b,i)=>{
    const card=document.createElement('button');
    card.className='bookcard';card.type='button';
    card.setAttribute('aria-label',b.title+' — '+b.chapter);
    card.innerHTML=
      '<div class="cover-img" style="background-image:url(\''+av(b.cover||b.background)+'\')"></div>'+
      '<div class="veil"></div>'+
      '<div class="meta">'+
        '<div class="chap">'+b.chapter+'</div>'+
        '<div class="bt">'+b.title+'</div>'+
        (b.subtitle?'<div class="bsub">'+b.subtitle+'</div>':'')+
      '</div>';
    card.onclick=()=>nav('#read/'+b.id);
    shelf.appendChild(card);
  });
}
function renderLibrary(){
  setAccent(DATA.series.accent);
  setSceneBg(DATA.books[0] && DATA.books[0].background);
  buildLibrary();
  show('library');
}

/* ===================================================================
   READER  (per-book flipbook)
   =================================================================== */
let ROWS=[];               // pages -> panel arrays
let book, zones;
let idx=0, busy=false, TOTAL=0, currentBook=null;

// partition panels (in order) into rows: even sizes, balanced, block fits page
function bestPartition(panels){
  const n=panels.length, A=PAGE_A;
  if(n===1) return [panels];
  let best=null,bestCost=1e9;
  for(let mask=0;mask<(1<<(n-1));mask++){
    const rows=[]; let cur=[panels[0]];
    for(let i=1;i<n;i++){ if(mask&(1<<(i-1))){rows.push(cur);cur=[];} cur.push(panels[i]); }
    rows.push(cur);
    let cost=0;
    for(const r of rows) if(r.length>3) cost+=0.6*(r.length-3);     // cap ~3 per row
    const lens=rows.map(r=>r.length);
    cost+=0.08*(Math.max(...lens)-Math.min(...lens));                // balanced rows
    const a=[]; for(const r of rows){const sa=r.reduce((x,p)=>x+p.ar,0); for(const p of r) a.push(p.ar/(sa*sa));}
    const mean=a.reduce((x,y)=>x+y,0)/a.length;
    const cv=Math.sqrt(a.reduce((x,y)=>x+(y-mean)**2,0)/a.length)/mean;
    cost+=0.9*cv;                                                    // even panel sizes
    const S=rows.reduce((x,r)=>x+1/r.reduce((u,p)=>u+p.ar,0),0);
    cost+=0.7*Math.abs(Math.log((1/S)/A));                           // block shaped like the page
    if(cost<bestCost){bestCost=cost;best=rows;}
  }
  return best;
}

function makePage(i,cls){
  const p=document.createElement('div');p.className='page '+cls;
  const inner=document.createElement('div');inner.className='page-inner';
  const sheet=document.createElement('div');sheet.className='sheet';
  bestPartition(ROWS[i]).forEach(r=>{
    const sumAr=r.reduce((a,o)=>a+o.ar,0);
    const prow=document.createElement('div');prow.className='prow';prow.dataset.sa=sumAr;
    r.forEach(o=>{const img=document.createElement('img');img.src=av(o.src);img.draggable=false;img.alt='';
      img.style.flex=o.ar.toFixed(4)+' 1 0';prow.appendChild(img);});
    sheet.appendChild(prow);
  });
  inner.appendChild(sheet);
  const foot=document.createElement('div');foot.className='page-foot';foot.textContent='PAGE '+(i+1);
  const glare=document.createElement('div');glare.className='glare';
  p.appendChild(inner);p.appendChild(foot);p.appendChild(glare);
  return p;
}
function fitPage(pageEl){
  const inner=pageEl.querySelector('.page-inner'),sheet=pageEl.querySelector('.sheet');
  if(!inner||!sheet) return;
  const cs=getComputedStyle(inner);
  const availW=inner.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const availH=inner.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  if(availW<=0||availH<=0) return;
  const g=GUTTER,prows=[...sheet.querySelectorAll('.prow')];
  const sas=prows.map(p=>parseFloat(p.dataset.sa)),ns=prows.map(p=>p.children.length);
  let W=availW;
  let rh=sas.map((sa,k)=>(W-(ns[k]-1)*g)/sa);
  let total=rh.reduce((a,b)=>a+b,0)+(prows.length-1)*g;
  if(total>availH){const k=availH/total;W*=k;rh=rh.map(h=>h*k);}
  sheet.style.width=W+'px';
  prows.forEach((p,k)=>{p.style.height=rh[k]+'px';p.style.flex='none';});
}
function fitAll(){if(book) book.querySelectorAll('.page').forEach(fitPage);}

function buildDots(){
  const pr=document.getElementById('progress');pr.innerHTML='';
  for(let k=0;k<TOTAL;k++){const d=document.createElement('i');
    d.title='Page '+(k+1);d.onclick=()=>{if(k!==idx&&!busy){idx=k;render();saveProgress();}};pr.appendChild(d);}
}
function paintDots(){document.querySelectorAll('#progress i').forEach((d,k)=>d.classList.toggle('on',k===idx));}

function render(){
  book.querySelectorAll('.page').forEach(n=>n.remove());
  const pg=makePage(idx,'pg-base');book.insertBefore(pg,zones);
  document.getElementById('counter').textContent='PAGE '+String(idx+1).padStart(2,'0')+' / '+String(ROWS.length).padStart(2,'0');
  document.getElementById('prev').disabled=idx===0;
  document.getElementById('next').disabled=idx===TOTAL-1;
  paintDots();
  // keep URL in sync with the current page (no new history entry, no reroute)
  if(view==='reader'&&currentBook){try{history.replaceState(null,'','#read/'+currentBook.id+'/'+idx);}catch(e){}}
  requestAnimationFrame(fitAll);
}
function doFlash(){const f=document.getElementById('flash');if(!f||reduce)return;f.classList.remove('go');void f.offsetWidth;f.classList.add('go');}
function turn(dir){
  if(busy||view!=='reader')return;const target=idx+dir;if(target<0||target>=TOTAL)return;busy=true;
  if(reduce){idx=target;render();busy=false;saveProgress();return;}
  doFlash();
  const base=makePage(target,'pg-base');const flip=makePage(dir>0?idx:target,'pg-flip');
  book.querySelectorAll('.page').forEach(n=>n.remove());
  book.insertBefore(base,zones);book.insertBefore(flip,zones);
  fitPage(base);fitPage(flip);
  flip.style.transform=dir>0?'rotateY(0deg)':'rotateY(-178deg)';flip.offsetWidth;
  flip.classList.add('turning','curl');
  requestAnimationFrame(()=>{flip.style.transform=dir>0?'rotateY(-178deg)':'rotateY(0deg)';});
  flip.addEventListener('transitionend',()=>{idx=target;render();busy=false;saveProgress();},{once:true});
}

/* last-page memory (no-op inside sandboxed artifacts; works on a deployed site) */
function saveProgress(){try{localStorage.setItem('cc:last:'+currentBook.id, idx);}catch(e){}}
function loadProgress(id){try{const v=localStorage.getItem('cc:last:'+id);return v==null?0:Math.max(0,parseInt(v,10)||0);}catch(e){return 0;}}

function renderReader(i, page){
  currentBook=DATA.books[i];
  ROWS=currentBook.pages.map(p=>p.panels);
  TOTAL=ROWS.length;
  const want = (page==null) ? 0 : page;   // always open on page 1 (deep links may pass a page)
  idx=Math.max(0,Math.min(want,TOTAL-1));
  busy=false;
  setAccent(currentBook.accent || DATA.series.accent);
  setSceneBg(currentBook.background);
  document.getElementById('rMark').innerHTML=
    currentBook.title.replace(/(\S+)\s*$/,'<b>$1</b>'); // last word emphasised
  document.getElementById('rSub').textContent=
    [currentBook.chapter, currentBook.subtitle].filter(Boolean).join(' · ');
  show('reader');
  buildDots();render();
}

/* ---------- reader controls (bound once) ---------- */
function bindReader(){
  book=document.getElementById('book');
  zones=book.querySelector('.zones');
  document.getElementById('next').onclick=()=>turn(1);
  document.getElementById('prev').onclick=()=>turn(-1);
  document.getElementById('zNext').onclick=()=>turn(1);
  document.getElementById('zPrev').onclick=()=>turn(-1);
  addEventListener('keydown',e=>{
    if(view!=='reader')return;
    if(e.key==='ArrowRight'||e.key===' ')turn(1);
    if(e.key==='ArrowLeft')turn(-1);
  });
  ['zNext','zPrev'].forEach(id=>document.getElementById(id)
    .addEventListener('keydown',e=>{if(e.key==='Enter')turn(id==='zNext'?1:-1);}));
  let sx=null;
  book.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  book.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)turn(dx<0?1:-1);sx=null;},{passive:true});
  // magnify mode: tap a panel to open it in the zoom lightbox
  book.addEventListener('click',e=>{ if(!zoomOn) return;
    const t=e.target; if(t.tagName==='IMG'&&t.closest('.prow')) openLightbox(t.src); });
}

/* ---------- hash routing (deep / shareable links) ---------- */
function nav(hash){ if(location.hash===hash){route();} else {location.hash=hash;} }
function route(){
  const h=location.hash.replace(/^#\/?/,'');
  if(!h){renderLanding();return;}
  const parts=h.split('/');
  if(parts[0]==='library'){renderLibrary();return;}
  if(parts[0]==='read'){
    const id=parts[1];
    const page=parts[2]!=null?parseInt(parts[2],10):null;
    const i=DATA.books.findIndex(b=>b.id===id);
    if(i>=0){renderReader(i, page!=null&&!isNaN(page)?page:null);return;}
  }
  renderLanding();
}
addEventListener('hashchange',route);

/* back button: reader -> library, library -> landing */
backBtn.onclick=()=>{ if(view==='reader') nav('#library'); else nav('#'); };

/* ---------- help overlay ---------- */
function toggleHelp(force){
  const open = force!=null ? force : helpEl.hidden;
  helpEl.hidden = !open;
}
helpBtn.onclick=()=>toggleHelp();
document.getElementById('helpClose').onclick=()=>toggleHelp(false);
helpEl.addEventListener('click',e=>{if(e.target===helpEl)toggleHelp(false);});

/* ---------- share link ---------- */
let toastTimer=null;
function toast(msg){
  toastEl.hidden=false;toastEl.textContent=msg;
  requestAnimationFrame(()=>toastEl.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toastEl.classList.remove('show');
    setTimeout(()=>{toastEl.hidden=true;},300);},1800);
}
shareBtn.onclick=async()=>{
  const url=location.href;
  try{ await navigator.clipboard.writeText(url); toast('Link copied'); }
  catch(e){ toast(url); }
};

/* ---------- magnify mode + lightbox ---------- */
let zoomOn=false;
function setZoom(on){ zoomOn=on; zoomBtn.classList.toggle('on',on); zoomBtn.setAttribute('aria-pressed',on);
  if(book) book.classList.toggle('zoom',on); }
zoomBtn.onclick=()=>setZoom(!zoomOn);

let lbScale=1, lbX=0, lbY=0, lbDrag=null;
function lbApply(){ lbImg.style.transform=`translate(${lbX}px,${lbY}px) scale(${lbScale})`; }
function openLightbox(src){
  lbImg.src=src; lbScale=1; lbX=0; lbY=0; lbApply();
  lightbox.hidden=false;
}
function closeLightbox(){ lightbox.hidden=true; lbImg.src=''; }
document.getElementById('lbClose').onclick=closeLightbox;
lightbox.addEventListener('click',e=>{ if(e.target===lightbox) closeLightbox(); });
lightbox.addEventListener('wheel',e=>{ e.preventDefault();
  const f=e.deltaY<0?1.15:1/1.15; lbScale=Math.min(8,Math.max(1,lbScale*f));
  if(lbScale===1){lbX=0;lbY=0;} lbApply(); },{passive:false});
function toggleZoom(){ if(lbScale>1){lbScale=1;lbX=0;lbY=0;} else {lbScale=2.5;} lbApply(); }
let downPt=null, lbMoved=false;
lbImg.addEventListener('mousedown',e=>{ e.preventDefault(); downPt={x:e.clientX,y:e.clientY}; lbMoved=false;
  if(lbScale>1){ lbDrag={x:e.clientX-lbX,y:e.clientY-lbY}; lbImg.classList.add('grabbing'); } });
addEventListener('mousemove',e=>{ if(!downPt) return;
  if(Math.hypot(e.clientX-downPt.x,e.clientY-downPt.y)>4) lbMoved=true;
  if(lbDrag){ lbX=e.clientX-lbDrag.x; lbY=e.clientY-lbDrag.y; lbApply(); } });
addEventListener('mouseup',()=>{ if(downPt&&!lbMoved) toggleZoom();   // click (no drag) = zoom in / out
  downPt=null; if(lbDrag){lbDrag=null; lbImg.classList.remove('grabbing');} });
// touch pinch + pan
let pinch=null, pan=null;
lbImg.addEventListener('touchstart',e=>{
  if(e.touches.length===2){const[a,b]=e.touches;pinch={d:Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY),s:lbScale};}
  else if(e.touches.length===1){pan={x:e.touches[0].clientX-lbX,y:e.touches[0].clientY-lbY};}
},{passive:false});
lbImg.addEventListener('touchmove',e=>{ e.preventDefault();
  if(pinch&&e.touches.length===2){const[a,b]=e.touches;const d=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
    lbScale=Math.min(8,Math.max(1,pinch.s*d/pinch.d)); if(lbScale===1){lbX=0;lbY=0;} lbApply();}
  else if(pan&&e.touches.length===1){lbX=e.touches[0].clientX-pan.x;lbY=e.touches[0].clientY-pan.y;lbApply();}
},{passive:false});
lbImg.addEventListener('touchend',()=>{pinch=null;pan=null;});

/* ---------- music player (playlist of mp3s from assets/audio/tracks.json) ---------- */
let tracks=[], tIdx=0, playing=false, vol=0.15;   // start quiet — background music
function setVolume(v, save){ vol=Math.min(1,Math.max(0,v)); theme.volume=vol;
  volEl.value=Math.round(vol*100); volEl.style.setProperty('--vp',Math.round(vol*100)+'%');
  if(save){ try{ localStorage.setItem('cc:vol',vol.toFixed(2)); }catch(e){} } }
try{ const sv=localStorage.getItem('cc:vol'); if(sv!=null) vol=parseFloat(sv)||vol; }catch(e){}
volEl.addEventListener('input',()=>setVolume(volEl.value/100,true));
setVolume(vol);   // sync slider + fill to current volume
async function loadTracks(){
  try{ const r=await fetch('assets/audio/tracks.json?v='+ASSET_V,{cache:'no-cache'});
    if(r.ok) tracks=await r.json(); }catch(e){}
  try{ tIdx=Math.min(tracks.length-1,Math.max(0,parseInt(localStorage.getItem('cc:trk')||'0',10)||0)); }catch(e){}
  renderPlaylist();
  if(tracks.length){ loadTrack(tIdx,false); }
}
function renderPlaylist(){
  playlistEl.innerHTML='';
  if(!tracks.length){ const li=document.createElement('li'); li.className='empty';
    li.textContent='No tracks. Drop mp3s in assets/audio/ and list them in assets/audio/tracks.json.';
    playlistEl.appendChild(li); return; }
  tracks.forEach((t,i)=>{ const li=document.createElement('li'); li.textContent=t.title||('Track '+(i+1));
    li.classList.toggle('on',i===tIdx); li.onclick=()=>loadTrack(i,true); playlistEl.appendChild(li); });
}
function updatePlayBtn(){ playTrkBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
  player.classList.toggle('playing',playing); }
function loadTrack(i,autoplay){ if(!tracks.length) return;
  tIdx=(i+tracks.length)%tracks.length;
  theme.src=av(tracks[tIdx].file); theme.volume=vol;
  npTitle.textContent=tracks[tIdx].title||('Track '+(tIdx+1));
  renderPlaylist();
  try{ localStorage.setItem('cc:trk',tIdx); }catch(e){}
  if(autoplay) playTrack(); else updatePlayBtn();
}
function playTrack(){ if(!tracks.length) return;
  theme.play().then(()=>{playing=true;updatePlayBtn();persistPlay();}).catch(()=>{playing=false;updatePlayBtn();}); }
function pauseTrack(){ theme.pause(); playing=false; updatePlayBtn(); persistPlay(); }
function persistPlay(){ try{ localStorage.setItem('cc:playing', playing?'1':'0'); }catch(e){} }
theme.addEventListener('ended',()=>loadTrack(tIdx+1,true));   // advance / loop playlist

/* elapsed time + seek */
function fmt(s){ if(!isFinite(s)||s<0) s=0; const m=Math.floor(s/60),x=Math.floor(s%60); return m+':'+String(x).padStart(2,'0'); }
let seeking=false;
theme.addEventListener('loadedmetadata',()=>{ tDurEl.textContent=fmt(theme.duration); });
theme.addEventListener('timeupdate',()=>{ if(seeking) return;
  const d=theme.duration||0; tCurEl.textContent=fmt(theme.currentTime);
  const p=d?theme.currentTime/d*1000:0; seekEl.value=p; seekEl.style.setProperty('--vp',(p/10)+'%'); });
seekEl.addEventListener('input',()=>{ seeking=true; seekEl.style.setProperty('--vp',(seekEl.value/10)+'%');
  if(theme.duration) tCurEl.textContent=fmt(seekEl.value/1000*theme.duration); });
seekEl.addEventListener('change',()=>{ if(theme.duration) theme.currentTime=seekEl.value/1000*theme.duration; seeking=false; });

playTrkBtn.onclick=()=>{ playing?pauseTrack():playTrack(); };
document.getElementById('prevTrk').onclick=()=>loadTrack(tIdx-1,true);
document.getElementById('nextTrk').onclick=()=>loadTrack(tIdx+1,true);
document.getElementById('listTrk').onclick=()=>{ playlistEl.hidden=!playlistEl.hidden; };
soundBtn.onclick=()=>{ const open=player.hidden; player.hidden=!open; soundBtn.classList.toggle('on',open);
  soundBtn.innerHTML = open ? '&#9835;' : '&#9835;'; };

/* global keys: ? = help, Esc = close lightbox/help then navigate up */
addEventListener('keydown',e=>{
  if(e.key==='?'){toggleHelp();return;}
  if(e.key==='Escape'){
    if(!lightbox.hidden){closeLightbox();return;}
    if(!helpEl.hidden){toggleHelp(false);return;}
    if(view==='reader') nav('#library'); else if(view==='library') nav('#');
  }
});

/* ---------- live clock ---------- */
(function tick(){const c=document.getElementById('clock');if(c){const d=new Date();
  c.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':');}setTimeout(tick,1000);})();

/* ===================================================================
   SCENE ENGINE: ash, parallax camera
   (rain-on-glass removed — canvas droplets couldn't match photoreal
   refraction; revisit only as a WebGL glass-refraction shader)
   =================================================================== */
const ash=document.getElementById('ash'),actx=ash.getContext('2d');
const motes=[];for(let i=0;i<70;i++)motes.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+.5,vx:(Math.random()-.5)*.3,vy:Math.random()*.4+.1});

function resize(){ash.width=innerWidth;ash.height=innerHeight;fitAll();}
addEventListener('resize',resize);resize();

if(!reduce){
  (function drawAsh(){actx.clearRect(0,0,ash.width,ash.height);
    for(const p of motes){actx.beginPath();actx.arc(p.x,p.y,p.r,0,Math.PI*2);actx.fillStyle='rgba(210,210,210,.14)';actx.fill();p.x+=p.vx;p.y+=p.vy;if(p.y>innerHeight){p.y=-10;p.x=Math.random()*innerWidth;}}requestAnimationFrame(drawAsh);})();
}
let mx=0,my=0;
addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5)*20;my=(e.clientY/innerHeight-.5)*20;});
if(!reduce){(function camera(){const t=Date.now()*0.0002;const dx=Math.sin(t)*8,dy=Math.cos(t*.8)*6,z=1.12+Math.sin(t*.5)*0.012;
  bg.style.transform=`scale(${z}) translate(${mx*0.3+dx}px,${my*0.3+dy}px)`;requestAnimationFrame(camera);})();}

/* ===================================================================
   BOOT
   =================================================================== */
(async function boot(){
  DATA = await loadData();
  bindReader();
  for(const k in views) views[k].classList.add('hidden');  // none composited until routed
  route();   // honor deep link in the URL hash (else lands on series intro)
  await loadTracks();
  // autostart the theme (quiet). Browsers block sound autoplay, so also arm a
  // one-shot start on the first interaction as a fallback.
  if(tracks.length){
    playTrack();
    const go=()=>{ if(!playing) playTrack(); removeEventListener('pointerdown',go); removeEventListener('keydown',go); };
    addEventListener('pointerdown',go,{once:true}); addEventListener('keydown',go,{once:true});
  }
})();
