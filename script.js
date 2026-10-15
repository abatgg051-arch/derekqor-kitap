(function(){
const B=window.BOOK,$=s=>document.querySelector(s),book=$('#book');
let P=[],leaves=[],flipped=0,max=0,mobile=null,muted=false,ac,tm;

function build(keepIdx){
  mobile=innerWidth<720;
  const toc='<div class="pg toc"><h2>Мазмұны</h2><ol>'+B.pages.map((p,i)=>
    `<li><a href="#${i+2}">${p.title}</a><span>${i+2}</span></li>`).join('')+'</ol></div>';
  P=[`<div class="cover"><h3>${B.university}</h3><h1>${B.title}</h1><h2>${B.subtitle}</h2><p>${B.author}</p></div>`,toc+'<span class="num">1</span>'];
  B.pages.forEach((p,i)=>P.push(`<div class="pg"><h2>${p.title}</h2>${p.html}</div><span class="num">${i+2}</span>`));
  if(!mobile&&P.length%2)P.push('');
  P.push('<div class="cover"><h3>'+B.university+'</h3><p>Соңы</p></div>');
  const n=mobile?P.length:P.length/2;
  max=mobile?n-1:n;
  book.className='book'+(mobile?' m':'');
  book.innerHTML='';leaves=[];
  for(let k=0;k<n;k++){
    const f=mobile?P[k]:P[2*k],b=mobile?'':P[2*k+1];
    const l=document.createElement('div');l.className='leaf';
    l.innerHTML=`<div class="face f">${f}</div><div class="face b">${b}</div>`;
    book.appendChild(l);leaves.push(l);
  }
  flipped=Math.min(max,keepIdx?pageToFlip(keepIdx):0);
  leaves.forEach((l,i)=>{l.classList.toggle('on',i<flipped);l.style.zIndex=i<flipped?i:n-i});
  render(false);
}
const pageToFlip=i=>mobile?i:Math.ceil(i/2);
const cur=()=>mobile?flipped:flipped*2;

function render(sound){
  const n=leaves.length;
  leaves.forEach((l,i)=>{
    const on=i<flipped;
    if(l.classList.contains('on')!==on){
      l.classList.toggle('on',on);l.style.zIndex=100;
      setTimeout(()=>l.style.zIndex=on?i:n-i,450);
      if(sound)snd();
    }
  });
  book.classList.toggle('start',flipped===0&&!mobile);
  book.classList.toggle('end',flipped===max&&!mobile);
  const idx=cur();
  $('#count').textContent=idx+' / '+(P.length-1);
  history.replaceState(null,'','#'+idx);
}
function go(t){
  clearInterval(tm);t=Math.max(0,Math.min(max,t));
  const step=()=>{if(flipped===t){clearInterval(tm);return}flipped+=Math.sign(t-flipped);render(true)};
  step();tm=setInterval(step,170);
}
const goPage=i=>go(pageToFlip(Math.max(0,Math.min(P.length-1,i))));

function snd(){
  if(muted)return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    const n=ac.sampleRate*.45|0,buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++){const t=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.2)*Math.min(1,t*14)}
    const s=ac.createBufferSource();s.buffer=buf;
    const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=2200+Math.random()*900;f.Q.value=.5;
    const g=ac.createGain();g.gain.value=.55;
    s.connect(f);f.connect(g);g.connect(ac.destination);s.start();
  }catch(e){}
}

book.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(a){e.preventDefault();goPage(+a.getAttribute('href').slice(1));return}
  if(e.target.closest('pre,table'))return;
  const r=book.getBoundingClientRect(),x=e.clientX-r.left;
  x>r.width/2?go(flipped+1):go(flipped-1);
});
$('#next').onclick=()=>go(flipped+1);
$('#prev').onclick=()=>go(flipped-1);
$('#toc').onclick=()=>goPage(1);
$('#sound').onclick=e=>{muted=!muted;e.target.textContent='Дыбыс: '+(muted?'өшірулі':'қосулы')};
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight')go(flipped+1);
  if(e.key==='ArrowLeft')go(flipped-1);
});
let sx=0;
addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60)go(flipped+(dx<0?1:-1))},{passive:true});
addEventListener('resize',()=>{if((innerWidth<720)!==mobile)build(cur())});
addEventListener('hashchange',()=>{const i=+location.hash.slice(1);if(!isNaN(i)&&i!==cur())goPage(i)});

build(+location.hash.slice(1)||0);
})();
