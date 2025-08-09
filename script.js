/* lightweight pro background + parallax + particles
   - mobile-friendly: caps particle count
   - pointer/touch parallax
   - optional ambience: plays after user click
   - toast helper
*/

const pointer = { x: 0.5, y: 0.5 };
let last = 0;
function updatePointer(e){
  const now = performance.now();
  if(now - last < 12) return; // throttle ~80fps
  last = now;
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) || innerWidth/2;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) || innerHeight/2;
  pointer.x = cx / innerWidth;
  pointer.y = cy / innerHeight;
}
window.addEventListener('pointermove', updatePointer, { passive: true });
window.addEventListener('touchmove', updatePointer, { passive: true });

// fog parallax (CSS transforms)
const fogA = document.querySelector('.fog-a');
const fogB = document.querySelector('.fog-b');
const logo = document.querySelector('.logo');
function parallaxLoop(){
  const nx = (pointer.x - 0.5) * 2; // -1..1
  const ny = (pointer.y - 0.5) * 2;
  if(fogA) fogA.style.transform = `translate3d(${nx * 2}%, ${ny * 2}%, 0)`;
  if(fogB) fogB.style.transform = `translate3d(${nx * -3}%, ${ny * -3}%, 0)`;
  if(logo) logo.style.transform = `translate3d(${nx * 1.2}px, ${ny * 1.2}px, 0) rotate(${nx * 0.7}deg)`;
  requestAnimationFrame(parallaxLoop);
}
requestAnimationFrame(parallaxLoop);

// canvas: particles + soft glow + grain
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; initParticles(); });

// particles
let particles = [];
function rand(min,max){ return Math.random() * (max - min) + min; }
function initParticles(){
  particles = [];
  const area = W * H;
  const count = Math.max(6, Math.floor(Math.min(area / 140000, 30))); // cap for mobile
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.08, 0.08), vy: rand(-0.06, 0.06),
      r: rand(18, 90), a: rand(0.02, 0.08), phase: rand(0, Math.PI*2)
    });
  }
}
initParticles();

let lastTick = performance.now();
function draw(){
  const t = performance.now();
  const dt = (t - lastTick) / 1000;
  lastTick = t;

  ctx.clearRect(0,0,W,H);

  // soft radial glow centered slightly above
  const cx = W * 0.52 + (pointer.x - 0.5) * W * 0.06;
  const cy = H * 0.46 + (pointer.y - 0.5) * H * 0.04;
  const maxR = Math.max(W, H) * 0.6;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(255,10,40,0.035)');
  grad.addColorStop(0.35, 'rgba(255,10,40,0.01)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  // particles = soft drifting ember/mist blobs
  ctx.globalCompositeOperation = 'lighter';
  for(const p of particles){
    p.x += p.vx + Math.sin(t * 0.0002 + p.phase) * 0.04;
    p.y += p.vy + Math.cos(t * 0.00015 + p.phase) * 0.02;
    if(p.x < -p.r) p.x = W + p.r;
    if(p.x > W + p.r) p.x = -p.r;
    if(p.y < -p.r) p.y = H + p.r;
    if(p.y > H + p.r) p.y = -p.r;

    const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    const alpha = p.a * (0.6 + 0.4 * Math.abs(Math.sin((t * 0.001) + p.phase)));
    rg.addColorStop(0, `rgba(255,40,80,${alpha})`);
    rg.addColorStop(0.5, `rgba(255,40,80,${Math.max(0.02, alpha*0.12)})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // subtle grain overlay
  const grainCount = Math.floor(W * H * 0.00006);
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for(let i=0;i<grainCount;i++){
    const gx = Math.random() * W;
    const gy = Math.random() * H;
    ctx.fillRect(gx, gy, 1, 1);
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// toast helper
const toastEl = document.getElementById('toast');
function showToast(txt, time = 1800){
  if(!toastEl) return;
  toastEl.textContent = txt;
  toastEl.classList.add('show');
  clearTimeout(toastEl._h);
  toastEl._h = setTimeout(()=> toastEl.classList.remove('show'), time);
}

// ambience: only after a click (no autoplay)
const amb = document.getElementById('amb');
let audioStarted = false;
function startAudioOnFirstGesture(){
  if(audioStarted) return;
  audioStarted = true;
  amb.volume = 0.22;
  amb.play().catch(()=>{}); // browsers may block until gesture; this is called on click/tap
  showToast('Ambience enabled');
}
// start audio after any tap/click
window.addEventListener('pointerdown', startAudioOnFirstGesture, { once: true, passive: true });

// reduced-motion handling
try{
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    // stop heavy animations
    if(canvas) canvas.style.display = 'none';
    if(fogA) fogA.style.animation = 'none';
    if(fogB) fogB.style.animation = 'none';
  }
}catch(e){}

// accessibility: announce social link on focus
document.querySelectorAll('.social').forEach(el=>{
  el.addEventListener('focus', ()=> showToast(el.getAttribute('aria-label'), 1200));
});

// quick performance safety: pause rendering if page hidden
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    // stop animation loop by not drawing; easiest is to set canvas display none (light)
    if(canvas) canvas.style.display = 'none';
  } else {
    if(canvas) canvas.style.display = 'block';
    // reset sizes in case
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
});
