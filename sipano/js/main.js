/* ============================================================
   SIPANO — JavaScript principal
   ============================================================ */

/* ── SCROLL ANIMATIONS ──────────────────────────────────── */
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── HEADER SHADOW ON SCROLL ────────────────────────────── */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (header) header.style.boxShadow = window.scrollY > 10 ? '0 4px 30px rgba(44,26,14,.18)' : '0 2px 20px rgba(44,26,14,.1)';
});

/* ── HAMBURGER MOBILE MENU ──────────────────────────────── */
const hamburger  = document.querySelector('.hamburger');
const mobileNav  = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
}

/* ── ACTIVE NAV LINK ────────────────────────────────────── */
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1600;
  const step     = target / (duration / 16);
  let current    = 0;

  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current < target) requestAnimationFrame(tick);
  };
  tick();
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ── PRODUCT FILTER TABS ────────────────────────────────── */
const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card[data-cat]');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const cat = tab.dataset.filter;
    productCards.forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.style.display = '';
        card.style.animation = 'fadeIn .4s ease';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* ── MULTI-STEP CONFIGURATEUR ───────────────────────────── */
const stepDots    = document.querySelectorAll('.step-dot');
const stepPanels  = document.querySelectorAll('.step-content');
const btnNext     = document.querySelectorAll('.btn-next');
const btnPrev     = document.querySelectorAll('.btn-prev');
let currentStep   = 1;
let selectedPanel = '';
const pieces       = [];

function goToStep(n) {
  if (n < 1 || n > 4) return;
  stepDots.forEach((d, i) => {
    d.classList.remove('active', 'done');
    if (i + 1 < n) d.classList.add('done');
    if (i + 1 === n) d.classList.add('active');
  });
  stepPanels.forEach((p, i) => {
    p.classList.toggle('active', i + 1 === n);
  });

  if (n === 4) buildSummary();
  currentStep = n;
}

function buildSummary() {
  const box = document.getElementById('summary-content');
  if (!box) return;
  const name  = document.getElementById('info-name')?.value || '—';
  const email = document.getElementById('info-email')?.value || '—';
  box.innerHTML = `
    <div class="summary-row"><span>Panneau sélectionné</span><strong>${selectedPanel || '—'}</strong></div>
    <div class="summary-row"><span>Nombre de pièces</span><strong>${pieces.length}</strong></div>
    <div class="summary-row"><span>Contact</span><strong>${name}</strong></div>
    <div class="summary-row"><span>Email</span><strong>${email}</strong></div>
  `;
}

btnNext.forEach(btn => btn.addEventListener('click', () => goToStep(currentStep + 1)));
btnPrev.forEach(btn => btn.addEventListener('click', () => goToStep(currentStep - 1)));

/* Panel selection */
document.querySelectorAll('.panel-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.panel-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedPanel = opt.textContent.trim();
  });
});

/* Add piece */
const addPieceBtn = document.getElementById('add-piece');
const piecesList  = document.getElementById('pieces-list');
if (addPieceBtn && piecesList) {
  addPieceBtn.addEventListener('click', () => {
    const l = document.getElementById('dim-l')?.value;
    const w = document.getElementById('dim-w')?.value;
    const q = document.getElementById('dim-q')?.value;
    if (!l || !w || !q) return;
    pieces.push({ l, w, q });
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `<span>Pièce ${pieces.length}</span><strong>${l}×${w}mm — Qté: ${q}</strong>`;
    piecesList.appendChild(row);
    ['dim-l','dim-w','dim-q'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  });
}

/* Submit */
const submitBtn = document.getElementById('submit-devis');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    submitBtn.textContent = 'Devis envoyé ! Merci ✓';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '.7';
  });
}
