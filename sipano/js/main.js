/* ============================================================
   SIPANO — main.js
   ============================================================ */

'use strict';

/* ============================================================
   Header scroll state
   ============================================================ */
(function () {
  var header = document.querySelector('.site-header');
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
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(function (a) {
    var href = a.getAttribute('href');
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
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', function () {
    var open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

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
  var elements = document.querySelectorAll('.fade-in-up');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(
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
  var counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    var duration = 1800;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = Math.round(easeOutCubic(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (c) { animateCounter(c); });
    return;
  }

  var observer = new IntersectionObserver(
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
  var tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  var cards = document.querySelectorAll('.product-card[data-category]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var filter = tab.getAttribute('data-filter');

      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          requestAnimationFrame(function () { card.style.animation = ''; });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ============================================================
   Multi-step Configurateur (multi-blocs)
   ============================================================ */
(function () {
  var config = document.querySelector('.configurateur');
  if (!config) return;

  var MATERIAUX = ['MDF 19mm', 'MDF Hydro', 'Mélaminé Blanc', 'Mélaminé Décor', 'Egger', 'Contreplaqué', 'OSB'];

  var currentStep = 1;
  var totalSteps = 3;

  var state = {
    blocs: [{ materiau: '', pieces: [] }],
    contact: { nom: '', entreprise: '', telephone: '', email: '', adresse: '', message: '' }
  };

  /* — Step indicators — */
  function updateSteps() {
    config.querySelectorAll('.config-step').forEach(function (step) {
      var num = parseInt(step.getAttribute('data-step'), 10);
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
    var target = config.querySelector('[data-panel="' + n + '"]');
    if (target) target.classList.add('active');
    updateSteps();
    updateNavButtons();
  }

  /* — Nav buttons — */
  var btnPrev = config.querySelector('#btn-prev');
  var btnNext = config.querySelector('#btn-next');
  var btnSubmit = config.querySelector('#btn-submit');

  function updateNavButtons() {
    if (btnPrev) btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    if (btnNext) btnNext.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    if (btnSubmit) btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }

  /* — Build select options — */
  function buildSelectOptions(selectedValue) {
    var opts = '<option value="">— Choisir un matériau —</option>';
    MATERIAUX.forEach(function (m) {
      opts += '<option value="' + m + '"' + (m === selectedValue ? ' selected' : '') + '>' + m + '</option>';
    });
    return opts;
  }

  /* — Render one bloc — */
  function renderBloc(blocIdx) {
    var bloc = state.blocs[blocIdx];
    var div = document.createElement('div');
    div.className = 'bloc-materiau';
    div.setAttribute('data-bloc', blocIdx);

    var headerHtml = '<div class="bloc-materiau__header">' +
      '<span class="bloc-materiau__title">Matériau ' + (blocIdx + 1) + '</span>' +
      (blocIdx > 0 ? '<button type="button" class="btn-remove-bloc" data-bloc="' + blocIdx + '">✕ Supprimer ce matériau</button>' : '') +
      '</div>';

    var selectHtml = '<select class="form-input bloc-select" data-bloc="' + blocIdx + '">' +
      buildSelectOptions(bloc.materiau) +
      '</select>';

    var piecesHtml = '<div class="pieces-list" id="pieces-list-' + blocIdx + '">';
    bloc.pieces.forEach(function (piece, pIdx) {
      piecesHtml += renderPieceItem(piece, blocIdx, pIdx);
    });
    piecesHtml += '</div>';

    if (!bloc.pieces.length) {
      piecesHtml += '<p class="pieces-empty" id="pieces-empty-' + blocIdx + '">Aucune pièce ajoutée. Saisissez les dimensions ci-dessous.</p>';
    }

    var addPieceHtml = '<div class="form-row" style="margin-top:1rem;">' +
      '<div class="form-group"><label class="form-label">Longueur (mm)</label>' +
      '<input type="number" class="form-input piece-lon" data-bloc="' + blocIdx + '" placeholder="ex: 600" min="1" max="3000"></div>' +
      '<div class="form-group"><label class="form-label">Largeur (mm)</label>' +
      '<input type="number" class="form-input piece-lar" data-bloc="' + blocIdx + '" placeholder="ex: 400" min="1" max="2100"></div>' +
      '<div class="form-group"><label class="form-label">Quantité</label>' +
      '<div style="display:flex; gap:.5rem; align-items:stretch;">' +
      '<input type="number" class="form-input piece-qte" data-bloc="' + blocIdx + '" value="1" min="1" max="999" style="flex:1;">' +
      '<button type="button" class="btn btn-primary btn-sm btn-add-piece-bloc" data-bloc="' + blocIdx + '" style="border-radius:var(--radius-sm); white-space:nowrap;">+ Ajouter</button>' +
      '</div></div></div>' +
      '<div style="margin-top:.25rem; font-size:.82rem; color:var(--color-gray);">Chants à plaquer :' +
      ' <label style="margin-left:.5rem;"><input type="checkbox" class="new-chant" data-side="gauche" data-bloc="' + blocIdx + '"> Gauche</label>' +
      ' <label style="margin-left:.5rem;"><input type="checkbox" class="new-chant" data-side="droite" data-bloc="' + blocIdx + '"> Droite</label>' +
      ' <label style="margin-left:.5rem;"><input type="checkbox" class="new-chant" data-side="haut" data-bloc="' + blocIdx + '"> Haut</label>' +
      ' <label style="margin-left:.5rem;"><input type="checkbox" class="new-chant" data-side="bas" data-bloc="' + blocIdx + '"> Bas</label>' +
      '</div>';

    div.innerHTML = headerHtml + selectHtml + piecesHtml + addPieceHtml;
    return div;
  }

  /* — Render one piece item — */
  function renderPieceItem(piece, blocIdx, pIdx) {
    var chantsStr = [];
    if (piece.chants.gauche) chantsStr.push('G');
    if (piece.chants.droite) chantsStr.push('D');
    if (piece.chants.haut) chantsStr.push('H');
    if (piece.chants.bas) chantsStr.push('B');
    var chantsLabel = chantsStr.length ? ' — Chants: ' + chantsStr.join('+') : '';
    return '<div class="piece-item" data-bloc="' + blocIdx + '" data-piece="' + pIdx + '">' +
      '<span>' + piece.longueur + ' mm × ' + piece.largeur + ' mm — Qté: ' + piece.quantite + chantsLabel + '</span>' +
      '<button class="piece-remove" data-bloc="' + blocIdx + '" data-idx="' + pIdx + '" title="Supprimer">✕</button>' +
      '</div>';
  }

  /* — Render all blocs — */
  function renderBlocs() {
    var container = config.querySelector('#blocs-container');
    if (!container) return;
    container.innerHTML = '';
    state.blocs.forEach(function (bloc, idx) {
      container.appendChild(renderBloc(idx));
    });
    bindBlocEvents();
  }

  /* — Bind events on dynamically rendered blocs — */
  function bindBlocEvents() {
    var container = config.querySelector('#blocs-container');
    if (!container) return;

    container.querySelectorAll('.bloc-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = parseInt(sel.getAttribute('data-bloc'), 10);
        state.blocs[idx].materiau = sel.value;
      });
    });

    container.querySelectorAll('.btn-remove-bloc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-bloc'), 10);
        state.blocs.splice(idx, 1);
        renderBlocs();
      });
    });

    container.querySelectorAll('.btn-add-piece-bloc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-bloc'), 10);
        var row = container.querySelector('[data-bloc="' + idx + '"].bloc-materiau');
        if (!row) return;

        var lonInput = row.querySelector('.piece-lon');
        var larInput = row.querySelector('.piece-lar');
        var qteInput = row.querySelector('.piece-qte');

        var l = lonInput ? lonInput.value.trim() : '';
        var w = larInput ? larInput.value.trim() : '';
        var q = qteInput ? qteInput.value.trim() : '1';

        if (!l || !w) {
          alert('Veuillez saisir la longueur et la largeur.');
          return;
        }

        var chants = { gauche: false, droite: false, haut: false, bas: false };
        row.querySelectorAll('.new-chant').forEach(function (cb) {
          chants[cb.getAttribute('data-side')] = cb.checked;
        });

        state.blocs[idx].pieces.push({
          longueur: parseInt(l, 10),
          largeur: parseInt(w, 10),
          quantite: parseInt(q, 10) || 1,
          chants: chants
        });

        if (lonInput) lonInput.value = '';
        if (larInput) larInput.value = '';
        if (qteInput) qteInput.value = '1';
        row.querySelectorAll('.new-chant').forEach(function (cb) { cb.checked = false; });

        var listEl = row.querySelector('.pieces-list');
        var emptyEl = row.querySelector('.pieces-empty');
        if (listEl) {
          var pieces = state.blocs[idx].pieces;
          listEl.innerHTML = '';
          pieces.forEach(function (piece, pIdx) {
            listEl.insertAdjacentHTML('beforeend', renderPieceItem(piece, idx, pIdx));
          });
          listEl.querySelectorAll('.piece-remove').forEach(function (rmBtn) {
            rmBtn.addEventListener('click', function () {
              var bIdx = parseInt(rmBtn.getAttribute('data-bloc'), 10);
              var pIdx = parseInt(rmBtn.getAttribute('data-idx'), 10);
              state.blocs[bIdx].pieces.splice(pIdx, 1);
              renderBlocs();
            });
          });
        }
        if (emptyEl) emptyEl.remove();
      });
    });

    container.querySelectorAll('.piece-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bIdx = parseInt(btn.getAttribute('data-bloc'), 10);
        var pIdx = parseInt(btn.getAttribute('data-idx'), 10);
        state.blocs[bIdx].pieces.splice(pIdx, 1);
        renderBlocs();
      });
    });
  }

  /* — Add matériau button — */
  var btnAddMateriau = config.querySelector('#btn-add-materiau');
  if (btnAddMateriau) {
    btnAddMateriau.addEventListener('click', function () {
      state.blocs.push({ materiau: '', pieces: [] });
      renderBlocs();
    });
  }

  /* — Contact fields — */
  ['nom', 'entreprise', 'telephone', 'email', 'adresse', 'message'].forEach(function (field) {
    var input = config.querySelector('#c-' + field);
    if (input) {
      input.addEventListener('input', function () {
        state.contact[field] = input.value;
      });
    }
  });

  /* — Summary (step 3) — */
  function buildSummary() {
    var summaryBlocs = config.querySelector('#summary-blocs');
    var summaryContact = config.querySelector('#summary-contact');

    if (summaryBlocs) {
      var parts = state.blocs.map(function (bloc) {
        var mat = bloc.materiau || '(matériau non défini)';
        var count = bloc.pieces.length;
        return mat + ' — ' + count + ' pièce' + (count > 1 ? 's' : '');
      });
      summaryBlocs.textContent = parts.join(' | ') || '—';
    }

    if (summaryContact) {
      summaryContact.textContent = [state.contact.nom, state.contact.email]
        .filter(Boolean).join(' — ') || '—';
    }
  }

  /* — Validation — */
  function validateStep(step) {
    if (step === 1) {
      var hasMateriau = state.blocs.some(function (b) { return b.materiau; });
      if (!hasMateriau) {
        alert('Veuillez sélectionner au moins un matériau.');
        return false;
      }
      var hasPieces = state.blocs.some(function (b) { return b.pieces.length > 0; });
      if (!hasPieces) {
        alert('Veuillez ajouter au moins une pièce.');
        return false;
      }
    }
    if (step === 2) {
      var nom = config.querySelector('#c-nom');
      var email = config.querySelector('#c-email');
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
        if (currentStep === totalSteps) buildSummary();
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
      var msgEl = config.querySelector('#c-message');
      if (msgEl) state.contact.message = msgEl.value;

      var csvString = window.DevisExport ? window.DevisExport.generateCsv(state) : null;

      if (csvString && window.DevisExport) {
        var date = new Date().toISOString().slice(0, 10);
        var slug = (state.contact.nom || 'client').replace(/\s+/g, '-').toLowerCase();
        window.DevisExport.downloadCsv(csvString, 'devis-sipano-' + slug + '-' + date + '.csv');
      }

      if (csvString && window.DevisExport) {
        window.DevisExport.sendCsvToBackend(csvString, state.contact, state.blocs);
      }

      var successMsg = config.querySelector('#config-success');
      config.querySelector('.config-progress').style.display = 'none';
      config.querySelector('.config-body').style.display = 'none';
      if (successMsg) successMsg.style.display = 'flex';
    });
  }

  /* — Init — */
  renderBlocs();
  showPanel(1);
})();

/* ============================================================
   Smooth scroll for anchor links
   ============================================================ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var headerH = 72;
        var top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
