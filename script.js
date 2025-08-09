/* Professional animated background + subtle interaction
   - canvas: animated grain + subtle glow pulses
   - fog layers: parallax transform based on pointer
   - gentle logo motion
   - toast helper
*/

// throttled pointer tracking
const pointer = { x: 0.5, y: 0.5 };
let lastMove = 0;
function onPointer(e){
  const now = performance.now();
  if(now - lastMove < 16) return; // ~60fps cap
  lastMove = now;
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) || (innerWidth/2);
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) || (innerHeight/2);
  pointer.x = cx / innerWidth;
  pointer.y = cy / innerHeight;
}
window.addEventListener('pointermove', onPointer, { passive: true });
window.addEventListener('touchmove', onPointer, { passive: true });

// fog parallax
const fogA = document.querySelector('.fog-a');
const fogB = document.querySelector('.fog-b');
const logo = document.querySelector('.logo');

function updateParallax(){
  // map pointer [0..1] to -1..1
  const nx = (pointer.x - 0.5) * 2;
  const ny = (pointer.y - 0.5) * 2;
  // subtle transforms
  if(fogA) fogA.style.transform = `translate3d(${nx*2}%, ${ny*2}%, 0)`;
  if(fogB) fogB.style.transform = `translate3d(${nx*-3}%, ${ny*-3}%, 0)`;
  if(logo) logo.style.transform = `translate3d(${nx*1.2}px, ${ny*1.2}px, 0) rotate(${nx*0.6}deg)`;
  requestAnimationFrame(updateParallax);
}
requestAnimationFrame(updateParallax);

// canvas: grain + pulse
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

// simple animated grain + soft radial glow that pulses
let t0 = performance.now();
function draw(){
  const t = performance.now();
  const dt = (t - t0) / 1000;
  t0 = t;

  // clear
  ctx.clearRect(0,0,W,H);

  // subtle radial glow centered slightly above center
  const gx = W * 0.5 + (pointer.x - 0.5) * W * 0.06;
  const gy = H * 0.45 + (pointer.y - 0.5) * H * 0.04;
  const rg = Math.max(W, H) * 0.6;
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rg);
  g.addColorStop(0, 'rgba(255,10,40,0.035)');
  g.addColorStop(0.35, 'rgba(255,10,40,0.01)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // soft moving noise circles (like drifting coals)
  const count = Math.max(6, Math.floor((W*H)/200000));
  for(let i=0;i<count;i++){
    const seed = i * 0.123 + t*0.0002;
    const x = (Math.sin(seed*1.7 + t*0.0001*i)*0.5 + 0.5) * W;
    const y = (Math.cos(seed*1.1 - t*0.0002*i)*0.5 + 0.5) * H;
    const r = Math.max(40, Math.min(W,H) * 0.06) * (0.6 + Math.sin(seed*3.1)*0.4);
    const a = 0.02 + 0.02*Math.abs(Math.sin(seed*2.7 + t*0.0003));
    const grad = ctx.createRadialGradient(x,y,0,x,y,r);
    grad.addColorStop(0, `rgba(255,30,70,${a})`);
    grad.addColorStop(0.6, `rgba(255,30,70,${a*0.18})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }

  // animated film grain overlay (very subtle)
  const grainDensity = 0.0018; // lower = cheaper
  const pixels = Math.floor(W * H * grainDensity);
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for(let i=0;i<pixels;i++){
    const gx = Math.random() * W;
    const gy = Math.random() * H;
    const s = Math.random() * 1.6;
    ctx.fillRect(gx, gy, s, s);
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// small UX: toast (reusable)
const toast = document.getElementById('toast');
function showToast(text, time = 1800){
  if(!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(()=> toast.classList.remove('show'), time);
}

// disable heavy visuals on reduced motion preference
try{
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    // remove animations: hide canvas & stabilize fog
    if(canvas) canvas.style.display = 'none';
    if(fogA) fogA.style.animation = 'none';
    if(fogB) fogB.style.animation = 'none';
  }
}catch(e){}

// accessibility: keyboard focus outlines for social links
const socials = document.querySelectorAll('.social');
socials.forEach(s => s.addEventListener('focus', () => showToast(s.getAttribute('aria-label'))));
