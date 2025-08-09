// background particles + mist (canvas) - mobile friendly
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

// particles
let particles = [];
function rand(min,max){ return Math.random()*(max-min)+min; }
function init(){
  particles = [];
  const count = Math.max(12, Math.floor(Math.min(W*H/90000, 80)));
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0,W), y: rand(0,H),
      vx: rand(-0.2,0.2), vy: rand(-0.2,0.2),
      r: rand(0.8,2.6), a: rand(0.02,0.12)
    });
  }
}
init();

function step(){
  ctx.clearRect(0,0,W,H);
  // dark gradient
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, 'rgba(5,4,5,1)');
  g.addColorStop(1, 'rgba(10,6,8,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // moving mist
  ctx.globalCompositeOperation = 'lighter';
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = W + 20;
    if(p.x > W + 20) p.x = -20;
    if(p.y < -20) p.y = H + 20;
    if(p.y > H + 20) p.y = -20;

    ctx.beginPath();
    const rad = p.r * 6;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
    gradient.addColorStop(0, `rgba(255,0,79,${p.a*0.22})`);
    gradient.addColorStop(0.5, `rgba(255,0,79,${p.a*0.06})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.arc(p.x, p.y, rad, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // faint connecting lines
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(122,0,31,${(1 - d/120)*0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}
requestAnimationFrame(step);

// logo subtle pulse
const logo = document.querySelector('.logo');
if(logo){
  let scale = 1;
  setInterval(()=>{ logo.style.transform = `rotate(${Math.sin(Date.now()/2400)*1.2}deg) scale(${1+Math.abs(Math.sin(Date.now()/2000))*0.008})`; }, 60);
}

// monologue (type)
const mono = document.querySelector('.monologue');
const lines = [
  "You found the page.",
  "Not everyone is meant to stay.",
  "Hold presence. Command the room.",
];
let li = 0, ch = 0;
function typeLoop(){
  if(!mono) return;
  const line = lines[li];
  if(ch < line.length){ mono.textContent += line.charAt(ch); ch++; setTimeout(typeLoop, 28 + Math.random()*30); }
  else{ ch = 0; li = (li+1) % lines.length; setTimeout(()=>{ mono.textContent = ''; typeLoop(); }, 2200); }
}
setTimeout(typeLoop, 900);

// ambience: play on user gesture, M toggles
const amb = document.getElementById('amb');
let audioPlaying = false;
document.addEventListener('click', ()=> {
  if(!audioPlaying){
    amb.volume = 0.26;
    amb.play().catch(()=>{});
    audioPlaying = true;
    showToast('Ambience ON');
  }
});
document.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 'm'){
    if(amb.paused){ amb.play().catch(()=>{}); showToast('Ambience ON'); }
    else{ amb.pause(); showToast('Ambience OFF'); }
  }
});

// toast helper
const toastEl = document.getElementById('toast');
function showToast(text){
  if(!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastEl._h);
  toastEl._h = setTimeout(()=> toastEl.classList.remove('show'), 2200);
}

// accessibility: stop heavy canvas on reduced-motion
try{
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    canvas.style.display = 'none';
  }
}catch(e){}
