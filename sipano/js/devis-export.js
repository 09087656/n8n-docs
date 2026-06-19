/* ============================================================
   SIPANO — devis-export.js
   Export CSV des demandes de découpe (compatible OptiCoupe)
   ============================================================ */

'use strict';

function normaliseMateriau(panelType) {
  return panelType
    .replace(/\s+/g, '_')
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/[^A-Za-z0-9_\-]/g, '');
}

/**
 * Génère le contenu CSV multi-blocs.
 * Header : materiau,longueur_mm,largeur_mm,quantite,chant_gauche,chant_droite,chant_haut,chant_bas
 *
 * @param {{ blocs: Array<{materiau: string, pieces: Array}>, contact: object }} state
 * @returns {string}
 */
function generateCsv(state) {
  var rows = ['materiau,longueur_mm,largeur_mm,quantite,chant_gauche,chant_droite,chant_haut,chant_bas'];

  state.blocs.forEach(function (bloc) {
    var materiau = normaliseMateriau(bloc.materiau || 'inconnu');
    bloc.pieces.forEach(function (piece) {
      var chants = piece.chants || { gauche: false, droite: false, haut: false, bas: false };
      rows.push([
        materiau,
        parseInt(piece.longueur, 10),
        parseInt(piece.largeur, 10),
        parseInt(piece.quantite, 10),
        chants.gauche ? 1 : 0,
        chants.droite ? 1 : 0,
        chants.haut ? 1 : 0,
        chants.bas ? 1 : 0
      ].join(','));
    });
  });

  return rows.join('\r\n');
}

/**
 * Déclenche le téléchargement du fichier CSV dans le navigateur.
 */
function downloadCsv(csvString, filename) {
  var bom = '﻿';
  var blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'devis-sipano.csv');
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

var EMAILJS_SERVICE_ID  = 'service_jkj355v';
var EMAILJS_TEMPLATE_ID = 'template_yxrdrtt';
var EMAILJS_PUBLIC_KEY  = 'PIX_-B8-F5N7tip3N';

var DESTINATAIRE = 'romanfilipciuc2006@mail.ru';

function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

/**
 * Construit un résumé texte des blocs groupés par matériau.
 * @param {Array} blocs
 * @returns {string}
 */
function buildBlocsResume(blocs) {
  return blocs.map(function (bloc) {
    var mat = bloc.materiau || '(inconnu)';
    var lignes = bloc.pieces.map(function (p) {
      var chants = [];
      var c = p.chants || {};
      if (c.gauche) chants.push('Gauche');
      if (c.droite) chants.push('Droite');
      if (c.haut) chants.push('Haut');
      if (c.bas) chants.push('Bas');
      return '  ' + p.longueur + 'x' + p.largeur + 'mm x' + p.quantite +
        (chants.length ? ' [Chants: ' + chants.join(', ') + ']' : '');
    }).join('\n');
    return '--- ' + mat + ' ---\n' + (lignes || '  (aucune pièce)');
  }).join('\n\n');
}

/**
 * Envoie le CSV par email via EmailJS.
 * @param {string} csvString
 * @param {{ nom, entreprise, telephone, email, adresse, message }} contactInfo
 * @param {Array} blocs
 * @returns {Promise<void>}
 */
function sendDevisByEmail(csvString, contactInfo, blocs) {
  if (
    EMAILJS_SERVICE_ID  === 'VOTRE_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'VOTRE_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY  === 'VOTRE_PUBLIC_KEY'
  ) {
    console.warn('[SIPANO] EmailJS non configuré.');
    return Promise.resolve();
  }

  if (typeof emailjs === 'undefined') {
    console.error('[SIPANO] SDK EmailJS introuvable.');
    return Promise.resolve();
  }

  var now = new Date();
  var dateStr = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  var slug = (contactInfo.nom || 'client').replace(/\s+/g, '-').toLowerCase();
  var materiauLabel = (blocs || []).map(function (b) { return b.materiau; }).filter(Boolean).join(', ') || '—';

  var templateParams = {
    to_email:           DESTINATAIRE,
    date:               dateStr,
    client_nom:         contactInfo.nom        || '—',
    client_entreprise:  contactInfo.entreprise || '—',
    client_telephone:   contactInfo.telephone  || '—',
    client_email:       contactInfo.email      || '—',
    client_adresse:     contactInfo.adresse    || '—',
    client_message:     contactInfo.message    || '—',
    materiau:           materiauLabel,
    csv_contenu:        buildBlocsResume(blocs || []),
    csv_base64:         toBase64('﻿' + csvString),
    csv_filename:       'devis-sipano-' + slug + '-' + now.toISOString().slice(0, 10) + '.csv'
  };

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function () {
      console.info('[SIPANO] Devis envoyé avec succès à ' + DESTINATAIRE);
    })
    .catch(function (err) {
      console.error('[SIPANO] Échec envoi email :', err);
    });
}

/**
 * Alias pour l'appel dans main.js.
 */
function sendCsvToBackend(csvString, contactInfo, blocs) {
  return sendDevisByEmail(csvString, contactInfo, blocs);
}

window.DevisExport = {
  generateCsv: generateCsv,
  downloadCsv: downloadCsv,
  sendCsvToBackend: sendCsvToBackend
};
