/* ===== helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

/* ===== typing ===== */
const typedEl = $('#typed');
const phrases = [
  "Game & AI/ML Developer",
  "Creative Technologist",
  "Unreal Engine & ML enthusiast"
];
let tIdx = 0, cIdx = 0, deleting = false;
function typingTick() {
  const current = phrases[tIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === current.length) { deleting = true; setTimeout(typingTick, 1200); return; }
  } else {
    typedEl.textContent = current.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) { deleting = false; tIdx = (tIdx + 1) % phrases.length; }
  }
  setTimeout(typingTick, deleting ? 45 : 70);
}
typingTick();

/* ===== Intersection Observer: reveals + skill fills ===== */
const ioOptions = { threshold: 0.18 };
const observer = new IntersectionObserver((entries, o) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      const fills = entry.target.querySelectorAll?.('.skill-fill') || [];
      fills.forEach(f => f.style.width = (f.dataset.fill || 80) + '%');
      o.unobserve(entry.target);
    }
  });
}, ioOptions);

$$('.fade-up').forEach(el => observer.observe(el));
$$('.section').forEach(el => observer.observe(el));

/* ensure skill fills are handled too */
$$('.skill-fill').forEach(el => {
  const parent = el.closest('section') || document.body;
  observer.observe(parent);
});

/* ===== scroll to top ===== */
const scrollTopBtn = $('#scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.style.display = window.scrollY > 600 ? 'block' : 'none';
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

/* ===== dark mode toggle (persist) ===== */
const themeToggle = $('#themeToggle');
function setTheme(dark) {
  document.body.classList.toggle('dark', !!dark);
  localStorage.setItem('darkMode', dark ? '1' : '0');
}
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
setTheme(localStorage.getItem('darkMode') === '1');

/* ===== particles background ===== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

const particles = [];
const PARTICLE_COUNT = Math.max(8, Math.floor((W*H) / 120000));
function rand(min, max){ return Math.random()*(max-min)+min; }
for (let i=0;i<PARTICLE_COUNT;i++){
  particles.push({
    x: rand(0,W), y: rand(0,H),
    r: rand(20,80), vx: rand(-0.15,0.15), vy: rand(-0.03,0.03),
    hue: rand(320,350), alpha: rand(0.06,0.18)
  });
}
function draw(){
  ctx.clearRect(0,0,W,H);
  for (const p of particles){
    p.x += p.vx; p.y += p.vy;
    if (p.x < -p.r) p.x = W + p.r;
    if (p.x > W + p.r) p.x = -p.r;
    if (p.y < -p.r) p.y = H + p.r;
    if (p.y > H + p.r) p.y = -p.r;

    const g = ctx.createRadialGradient(p.x, p.y, p.r*0.1, p.x, p.y, p.r);
    if (document.body.classList.contains('dark')) {
      g.addColorStop(0, `hsla(${p.hue},70%,70%,${p.alpha})`);
      g.addColorStop(1, `hsla(${p.hue},60%,10%,0)`);
    } else {
      g.addColorStop(0, `hsla(${p.hue},80%,70%,${p.alpha})`);
      g.addColorStop(1, `hsla(${p.hue},80%,95%,0)`);
    }
    ctx.beginPath(); ctx.fillStyle = g; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();

/* ===== set year ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== resume button behavior =====
 - If resume.pdf exists in folder the <a href="resume.pdf" download> will download directly.
 - If not, we open resume.html in new tab (print-friendly), and automatically call print there.
*/
const resumeBtn = $('#resumeBtn');
fetch('resume.pdf', { method: 'HEAD' })
  .then(res => {
    if (!res.ok) {
      // no resume.pdf — change link to resume.html
      resumeBtn.setAttribute('href', 'resume.html');
      resumeBtn.setAttribute('target', '_blank');
      // clicking will open resume.html where user can print/save to PDF
    }
  })
  .catch(_ => {
    resumeBtn.setAttribute('href', 'resume.html');
    resumeBtn.setAttribute('target', '_blank');
  });

/* accessibility focus outlines */
document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('show-focus'); });
