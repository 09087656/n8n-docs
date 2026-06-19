/* ============================================================
   SIPANO — main.js
   ============================================================ */

'use strict';

/* ============================================================
   Header scroll state
   ============================================================ */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   Active nav link
   ============================================================ */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (
      href === page ||
      (page === '' && href === 'index.html') ||
      (page === 'index.html' && href === 'index.html')
    ) {
      a.classList.add('active');
    }
  });
})();

/* ============================================================
   Mobile hamburger menu
   ============================================================ */
(function () {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', function () {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================================
   IntersectionObserver — scroll animations
   ============================================================ */
(function () {
  const elements = document.querySelectorAll('.fade-in-up');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   Animated counter
   ============================================================ */
(function () {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutCubic(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (c) { animateCounter(c); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (c) { observer.observe(c); });
})();

/* ============================================================
   Product filter tabs
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  const cards = document.querySelectorAll('.product-card[data-category]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(function (card) {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        if (match) {
          card.classList.remove('hidden');
          // small fade-in re-trigger
          card.style.animation = 'none';
          requestAnimationFrame(function () {
            card.style.animation = '';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ============================================================
   Multi-step Configurateur
   ============================================================ */
(function () {
  const config = document.querySelector('.configurateur');
  if (!config) return;

  let currentStep = 1;
  const totalSteps = 4;

  // State
  const state = {
    panelType: '',
    pieces: [],
    contact: { nom: '', entreprise: '', telephone: '', email: '', adresse: '', message: '' },
  };

  /* — Step indicators — */
  function updateSteps() {
    config.querySelectorAll('.config-step').forEach(function (step) {
      const num = parseInt(step.getAttribute('data-step'), 10);
      step.classList.remove('active', 'completed');
      if (num === currentStep) step.classList.add('active');
      else if (num < currentStep) step.classList.add('completed');
    });
  }

  /* — Panels — */
  function showPanel(n) {
    config.querySelectorAll('.config-panel').forEach(function (p) {
      p.classList.remove('active');
    });
    const target = config.querySelector('[data-panel="' + n + '"]');
    if (target) target.classList.add('active');
    updateSteps();
    updateNavButtons();
  }

  /* — Nav buttons — */
  const btnPrev = config.querySelector('#btn-prev');
  const btnNext = config.querySelector('#btn-next');
  const btnSubmit = config.querySelector('#btn-submit');

  function updateNavButtons() {
    if (btnPrev) btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    if (btnNext) btnNext.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    if (btnSubmit) btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }

  /* — Panel type selection — */
  config.querySelectorAll('.panel-type').forEach(function (pt) {
    pt.addEventListener('click', function () {
      config.querySelectorAll('.panel-type').forEach(function (p) {
        p.classList.remove('selected');
      });
      pt.classList.add('selected');
      state.panelType = pt.getAttribute('data-type');
    });
  });

  /* — Pieces (step 2) — */
  const piecesList = config.querySelector('#pieces-list');
  const btnAddPiece = config.querySelector('#btn-add-piece');
  const inputLongueur = config.querySelector('#p-longueur');
  const inputLargeur = config.querySelector('#p-largeur');
  const inputQte = config.querySelector('#p-qte');

  function renderPieces() {
    if (!piecesList) return;
    piecesList.innerHTML = '';
    state.pieces.forEach(function (piece, idx) {
      const div = document.createElement('div');
      div.className = 'piece-item';
      div.innerHTML =
        '<span>' + piece.longueur + ' mm × ' + piece.largeur + ' mm — Qté: ' + piece.qte + '</span>' +
        '<button class="piece-remove" data-idx="' + idx + '" title="Supprimer">✕</button>';
      piecesList.appendChild(div);
    });

    piecesList.querySelectorAll('.piece-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.pieces.splice(parseInt(btn.getAttribute('data-idx'), 10), 1);
        renderPieces();
      });
    });
  }

  if (btnAddPiece) {
    btnAddPiece.addEventListener('click', function () {
      const l = inputLongueur ? inputLongueur.value.trim() : '';
      const w = inputLargeur ? inputLargeur.value.trim() : '';
      const q = inputQte ? inputQte.value.trim() : '1';
      if (!l || !w) {
        alert('Veuillez saisir la longueur et la largeur.');
        return;
      }
      state.pieces.push({ longueur: l, largeur: w, qte: q || '1' });
      if (inputLongueur) inputLongueur.value = '';
      if (inputLargeur) inputLargeur.value = '';
      if (inputQte) inputQte.value = '1';
      renderPieces();
    });
  }

  /* — Contact fields (step 3) — */
  ['nom', 'entreprise', 'telephone', 'email', 'adresse', 'message'].forEach(function (field) {
    const input = config.querySelector('#c-' + field);
    if (input) {
      input.addEventListener('input', function () {
        state.contact[field] = input.value;
      });
    }
  });

  /* — Summary (step 4) — */
  function buildSummary() {
    const summaryPanel = config.querySelector('[data-panel="4"]');
    if (!summaryPanel) return;

    const panelRow = summaryPanel.querySelector('#summary-panel');
    const piecesRow = summaryPanel.querySelector('#summary-pieces');
    const contactRow = summaryPanel.querySelector('#summary-contact');

    if (panelRow) panelRow.textContent = state.panelType || '—';
    if (piecesRow) {
      piecesRow.textContent =
        state.pieces.length
          ? state.pieces
              .map(function (p) { return p.longueur + '×' + p.largeur + ' (×' + p.qte + ')'; })
              .join(', ')
          : '—';
    }
    if (contactRow) {
      contactRow.textContent = [state.contact.nom, state.contact.email]
        .filter(Boolean)
        .join(' — ') || '—';
    }
  }

  /* — Validation — */
  function validateStep(step) {
    if (step === 1) {
      if (!state.panelType) {
        alert('Veuillez sélectionner un type de panneau.');
        return false;
      }
    }
    if (step === 2) {
      if (!state.pieces.length) {
        alert('Veuillez ajouter au moins un morceau.');
        return false;
      }
    }
    if (step === 3) {
      const nom = config.querySelector('#c-nom');
      const email = config.querySelector('#c-email');
      if (nom && !nom.value.trim()) {
        alert('Veuillez saisir votre nom.');
        nom.focus();
        return false;
      }
      if (email && !email.value.trim()) {
        alert('Veuillez saisir votre email.');
        email.focus();
        return false;
      }
    }
    return true;
  }

  /* — Navigation — */
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps) {
        currentStep++;
        if (currentStep === 4) buildSummary();
        showPanel(currentStep);
        config.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      if (currentStep > 1) {
        currentStep--;
        showPanel(currentStep);
        config.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* — Submit — */
  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () {
      // Sync textarea message (not covered by input event for all browsers)
      const msgEl = config.querySelector('#c-message');
      if (msgEl) state.contact.message = msgEl.value;

      // 1. Générer le CSV
      var csvString = window.DevisExport
        ? window.DevisExport.generateCsv(state)
        : null;

      // 2. Téléchargement côté client
      if (csvString && window.DevisExport) {
        var date = new Date().toISOString().slice(0, 10);
        var slug = (state.contact.nom || 'client').replace(/\s+/g, '-').toLowerCase();
        window.DevisExport.downloadCsv(csvString, 'devis-sipano-' + slug + '-' + date + '.csv');
      }

      // 3. Envoi par email via EmailJS
      if (csvString && window.DevisExport) {
        // On transporte le matériau dans contactInfo pour que sendDevisByEmail y ait accès
        var contactWithMat = Object.assign({}, state.contact, { _materiau: state.panelType });
        window.DevisExport.sendCsvToBackend(csvString, contactWithMat);
      }

      // 4. Afficher le message de succès
      const successMsg = config.querySelector('#config-success');
      config.querySelector('.config-progress').style.display = 'none';
      config.querySelector('.config-body').style.display = 'none';
      if (successMsg) successMsg.style.display = 'flex';
    });
  }

  /* — Init — */
  showPanel(1);
  renderPieces();
})();

/* ============================================================
   Smooth scroll for anchor links
   ============================================================ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const headerH = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
