// ── Nav scroll effect ──
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile burger menu ──
const burger = document.querySelector('.nav__burger');
const navLinks = document.querySelector('.nav__links');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.card, .service, .stat, .hero__content, .about__text, .about__stats, .section__title, .form');
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ── Animated counters ──
const counters = document.querySelectorAll('.stat__num[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (target >= 100 ? '+' : '');
      if (current >= target) clearInterval(timer);
    }, 16);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

// ── Card tilt effect ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sent ✓';
  btn.style.background = 'linear-gradient(135deg, #43e97b, #38f9d7)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
});

// ── Theme Switcher ──
const themes = {
  default: { '--bg':'#0a0a0f', '--bg2':'#111118', '--surface':'#1a1a24', '--text':'#f0f0f5', '--muted':'#888899', '--accent':'#6c63ff', '--accent2':'#ff6584' },
  ocean:   { '--bg':'#020d1a', '--bg2':'#041525', '--surface':'#072035', '--text':'#e0f2fe', '--muted':'#7ab8d4', '--accent':'#0ea5e9', '--accent2':'#06b6d4' },
  forest:  { '--bg':'#030d05', '--bg2':'#071a0a', '--surface':'#0d2b12', '--text':'#dcfce7', '--muted':'#6aad7a', '--accent':'#22c55e', '--accent2':'#84cc16' },
  sunset:  { '--bg':'#110508', '--bg2':'#1c0a0f', '--surface':'#2a1018', '--text':'#fff1f2', '--muted':'#c47a8a', '--accent':'#f97316', '--accent2':'#ec4899' },
  mono:    { '--bg':'#0f0f0f', '--bg2':'#1a1a1a', '--surface':'#262626', '--text':'#f1f5f9', '--muted':'#64748b', '--accent':'#e2e8f0', '--accent2':'#94a3b8' },
};

function applyTheme(name) {
  const vars = themes[name];
  if (!vars) return;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === name));
  localStorage.setItem('cd-theme', name);
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

// Restore saved theme
applyTheme(localStorage.getItem('cd-theme') || 'default');
