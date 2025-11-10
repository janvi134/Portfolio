/* ===== tiny helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===== typing animation ===== */
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
const ioOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries, o) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      // fill skills inside this entry
      const fills = entry.target.querySelectorAll?.('.skill-fill') || [];
      fills.forEach(f => { f.style.width = (f.dataset.fill || 80) + '%'; });
      o.unobserve(entry.target);
    }
  });
}, ioOptions);

/* Observe common reveal targets */
$$('.fade-up').forEach(el => observer.observe(el));
$$('section').forEach(s => observer.observe(s));

/* Also ensure skill-fill observers (in case they are outside) */
$$('.skill-fill').forEach(f => {
  const parentSect = f.closest('section') || document.body;
  observer.observe(parentSect);
});

/* ===== Scroll to top button ===== */
const scrollTopBtn = $('#scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.style.display = window.scrollY > 560 ? 'block' : 'none';
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Dark mode toggle (persist) ===== */
const themeToggle = $('#themeToggle');
function setTheme(dark) {
  document.body.classList.toggle('dark', !!dark);
  localStorage.setItem('darkMode', dark ? '1' : '0');
}
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
setTheme(localStorage.getItem('darkMode') === '1');

/* ===== Particles background (soft floating circles) ===== */
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

/* ===== Set footer year ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== Resume button fallback =====
 If resume.pdf missing, open print-friendly resume.html
*/
const resumeBtn = $('#resumeBtn');
fetch('resume.pdf', { method: 'HEAD' })
  .then(res => {
    if (!res.ok) {
      resumeBtn.setAttribute('href', 'resume.html');
      resumeBtn.setAttribute('target', '_blank');
    }
  })
  .catch(_ => {
    resumeBtn.setAttribute('href', 'resume.html');
    resumeBtn.setAttribute('target', '_blank');
  });

/* ===== Contact form: client-side mailto fallback ===== */

// contact-form

const form = document.getElementById('contactForm');
const submitBtn = form.querySelector('button[type="submit"]');
const statusEl = document.getElementById('cf-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;
  statusEl.textContent = "";

  try {
    const res = await fetch(form.action, { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      statusEl.textContent = "✅ Success! Your message has been sent.";
      form.reset();
    } else {
      statusEl.textContent = "❌ Error: " + (data.message || "Unknown error");
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Something went wrong. Check network or access key.";
  } finally {
    submitBtn.textContent = "Send Message";
    submitBtn.disabled = false;
  }
});


const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalImg = document.getElementById('modalImg');

$$('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3').textContent;
    const desc = card.querySelector('p').textContent;
    const imgSrc = card.querySelector('img').src;

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalImg.src = imgSrc;

    modal.style.display = 'flex';
  });
});

document.querySelector('.modal-close').addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close on click outside modal content
modal.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});





