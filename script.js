// core interactions
let vanta;
function startVanta(){
  try{
    if(window.VANTA && !vanta){
      vanta = VANTA.NET({
        el: '#vanta-bg',
        color: 0xff004f,
        backgroundColor: 0x050405,
        points: 9.0,
        maxDistance: 22.0,
        spacing: 18.0
      });
    }
  }catch(e){}
}
startVanta();

// type monologue
const lines = [
  "You arrived. Good.",
  "Presence is everything. Command it.",
  "This isn't a page. It's a presence.",
  "Remember the name."
];
let li = 0, ch = 0;
const mono = document.getElementById('monologue');
function type(){
  if(li >= lines.length){ li = 0; setTimeout(()=>{ mono.textContent=''; }, 3200); return; }
  const line = lines[li];
  if(ch < line.length){ mono.textContent += line.charAt(ch); ch++; setTimeout(type, 28 + Math.random()*40); }
  else{ ch = 0; li++; setTimeout(()=>{ mono.textContent=''; type(); }, 2200); }
}
setTimeout(type,800);

// copy discord
document.getElementById('copy-discord').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText('@tenseroid'); toast('Discord copied: @tenseroid'); document.getElementById('tick').play().catch(()=>{}); }
  catch(e){ toast('Copy failed: @tenseroid'); }
});

// vcard
document.getElementById('download-vcard').addEventListener('click', ()=>{
  const v = `BEGIN:VCARD\nVERSION:3.0\nFN:TENSEROID\nORG:TENSEROID\nTITLE:Presence\nNOTE:Discord: @tenseroid | IG: instagram.com/tenseroid\nEND:VCARD`;
  const b = new Blob([v], {type:'text/vcard'});
  const url = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href = url; a.download = 'tenseroid.vcf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  toast('vCard downloaded');
});

// toast helper
function toast(t){ const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._h); el._h = setTimeout(()=> el.classList.remove('show'), 2400); }

// ambience
const amb = document.getElementById('amb'); amb.volume = 0.26; let playing = false;
document.addEventListener('click', ()=>{ if(!playing){ amb.play().then(()=>{ playing = true }).catch(()=>{}); document.getElementById('tick').play().catch(()=>{}); } });

// keybinds
let illusion = false, god = false;
document.addEventListener('keydown', (e)=>{
  const k = e.key.toLowerCase();
  if(k === 'i'){ illusion = !illusion; document.documentElement.style.setProperty('--accent', illusion? '#ffb0c8' : '#ff004f'); toast(illusion? 'Skin: WARM' : 'Skin: COLD'); }
  if(k === 'g'){ god = !god; toast(god? 'GOD MODE' : 'GOD OFF'); document.querySelector('.panel').style.boxShadow = god? '0 60px 180px rgba(255,0,79,0.16)' : '0 30px 90px rgba(0,0,0,0.7)'; }
  if(k === 'm'){ if(amb.paused){ amb.play().catch(()=>{}); toast('Audio ON'); } else { amb.pause(); toast('Audio OFF'); } }
  if(k === 'b'){ li = 0; ch = 0; mono.textContent = ''; type(); toast('Monologue'); }
});

// clean up on reduced motion
try{
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches && vanta){ vanta.destroy(); vanta = null; document.getElementById('vanta-bg').style.display='none'; }
}catch(e){}
