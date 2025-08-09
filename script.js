/* final pro background:
 - canvas: drifting glow blobs + sparks + occasional lightning flash
 - parallax based on pointer/touch
 - logo micro-motion
 - toast helper
 - reduced-motion handling
*/

// pointer tracking (throttled)
const pointer = { x: 0.5, y: 0.5 };
let lastMove = 0;
function onPointer(e){
  const now = performance.now();
  if(now - lastMove < 12) return;
  lastMove = now;
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) || innerWidth/2;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) || innerHeight/2;
  pointer.x = cx / innerWidth;
  pointer.y = cy / innerHeight;
}
window.addEventListener('pointermove', onPointer, { passive: true });
window.addEventListener('touchmove', onPointer, { passive: true });

// parallax fog + logo
const fogA = document.querySelector('.fog-a');
const fogB = document.querySelector('.fog-b');
const logo = document.querySelector('.logo');
function parallax(){
  const nx = (pointer.x - 0.5) * 2; // -1..1
  const ny = (pointer.y - 0.5) * 2;
  if(fogA) fogA.style.transform = `translate3d(${nx * 2}%, ${ny * 2}%, 0)`;
  if(fogB) fogB.style.transform = `translate3d(${nx * -3}%, ${ny * -3}%, 0)`;
  if(logo) logo.style.transform = `translate3d(${nx * 1.5}px, ${ny * 1.5}px, 0) rotate(${nx * 0.6}deg)`;
  requestAnimationFrame(parallax);
}
requestAnimationFrame(parallax);

// canvas visual: blobs + sparks + lightning
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

// particles (glow blobs)
let blobs = [];
let sparks = [];
function rand(min,max){ return Math.random() * (max - min) + min; }
function init(){
  blobs = [];
  sparks = [];
  const area = W * H;
  const blobCount = Math.max(6, Math.floor(Math.min(area / 120000, 30)));
  for(let i=0;i<blobCount;i++){
    blobs.push({
      x: rand(0,W), y: rand(0,H),
      vx: rand(-0.05,0.05), vy: rand(-0.03,0.03),
      r: rand(Math.min(W,H)*0.02, Math.min(W,H)*0.12),
      a: rand(0.02, 0.08), phase: rand(0, Math.PI*2)
    });
  }
}
init();

let lastTime = performance.now();
let lightningTimer = 0;
function draw(){
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  ctx.clearRect(0,0,W,H);

  // dynamic radial glow behind content
  const cx = W * (0.5 + (pointer.x - 0.5) * 0.04);
  const cy = H * (0.45 + (pointer.y - 0.5) * 0.04);
  const rg = Math.max(W,H) * 0.6;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rg);
  g.addColorStop(0, 'rgba(255,20,60,0.035)');
  g.addColorStop(0.35, 'rgba(255,20,60,0.01)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // blobs (soft)
  ctx.globalCompositeOperation = 'lighter';
  for(const b of blobs){
    b.x += b.vx + Math.sin(now * 0.0002 + b.phase) * 0.02;
    b.y += b.vy + Math.cos(now * 0.00015 + b.phase) * 0.01;
    if(b.x < -b.r) b.x = W + b.r;
    if(b.x > W + b.r) b.x = -b.r;
    if(b.y < -b.r) b.y = H + b.r;
    if(b.y > H + b.r) b.y = -b.r;

    const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    const alpha = b.a * (0.6 + 0.4 * Math.abs(Math.sin((now * 0.001) + b.phase)));
    gradient.addColorStop(0, `rgba(255,40,80,${alpha})`);
    gradient.addColorStop(0.5, `rgba(255,40,80,${Math.max(0.02, alpha*0.14)})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';

  // sparks (small bright particles)
  if(Math.random() < 0.06) {
    sparks.push({
      x: rand(0, W), y: rand(0, H * 0.75),
      vx: rand(-0.6, 0.6), vy: rand(-0.6, 0.6),
      life: rand(300, 1200), r: rand(0.6, 2.2), t: now
    });
  }
  for(let i = sparks.length - 1; i >= 0; i--){
    const s = sparks[i];
    const age = now - s.t;
    if(age > s.life) { sparks.splice(i,1); continue; }
    const p = age / s.life;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,220,200,${1 - p})`;
    ctx.arc(s.x + s.vx * p * 5, s.y + s.vy * p * 5, s.r * (1 - p*0.6), 0, Math.PI*2);
    ctx.fill();
  }

  // random lightning flash (rare)
  lightningTimer -= dt;
  if(lightningTimer <= 0 && Math.random() < 0.008){
    lightningTimer = 0.8 + Math.random() * 3.5;
    flashLightning();
  }

  // subtle grain overlay
  const grainCount = Math.floor(W * H * 0.00005);
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for(let i=0;i<grainCount;i++){
    const gx = Math.random() * W;
    const gy = Math.random() * H;
    ctx.fillRect(gx, gy, 1, 1);
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// lightning effect (white quick flash + thin lines)
function flashLightning(){
  // brief white flash
  const flashAlphaStart = 0.35;
  let t0 = performance.now();
  const dur = 220; // ms
  function step(){
    const t = performance.now();
    const p = (t - t0) / dur;
    if(p >= 1) return;
    const a = flashAlphaStart * (1 - p);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(0,0,W,H);
    // overlay quick jagged lines
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - p)})`;
    ctx.lineWidth = 1.4;
    for(let i=0;i<3;i++){
      ctx.beginPath();
      const sx = rand(W*0.2, W*0.8);
      let sy = rand(H*0.05, H*0.3);
      ctx.moveTo(sx, sy);
      for(let j=0;j<8;j++){
        sy += rand(10, 60);
        const nx = sx + rand(-80, 80);
        ctx.lineTo(nx, sy);
      }
      ctx.stroke();
    }
    requestAnimationFrame(step);
  }
  step();
}

// toast helper
const toastEl = document.getElementById('toast');
function showToast(txt, t = 1400){
  if(!toastEl) return;
  toastEl.textContent = txt;
  toastEl.classList.add('show');
  clearTimeout(toastEl._h);
  toastEl._h = setTimeout(()=> toastEl.classList.remove('show'), t);
}

// reduced motion handling
try{
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    if(canvas) canvas.style.display = 'none';
    if(fogA) fogA.style.animation = 'none';
    if(fogB) fogB.style.animation = 'none';
  }
}catch(e){}

// performance safety: pause visuals if hidden
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    if(canvas) canvas.style.display = 'none';
  } else {
    if(canvas) canvas.style.display = 'block';
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
});

// accessibility: focus social toasts
document.querySelectorAll('.social').forEach(el=>{
  el.addEventListener('focus', ()=> showToast(el.getAttribute('aria-label')));
});
