/* ============================================================
   SIPANO — devis-export.js
   Export CSV des demandes de découpe (compatible OptiCoupe)
   ============================================================ */

'use strict';

/**
 * Normalise le nom du matériau en identifiant sans accent ni espace.
 * Adapter cette fonction lorsque le format exact d'OptiCoupe sera connu.
 *
 * Exemple : "MDF 19mm" → "MDF_19mm"
 *
 * @param {string} panelType - Valeur brute issue du configurateur
 * @returns {string}
 */
function normaliseMateriau(panelType) {
  return panelType
    .replace(/\s+/g, '_')          // espaces → underscores
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/[^A-Za-z0-9_\-]/g, ''); // retire tout caractère spécial restant
}

/**
 * Génère le contenu CSV à partir de l'état du configurateur.
 *
 * Format attendu (une ligne par morceau) :
 *   materiau,longueur_mm,largeur_mm,quantite
 *
 * TODO: ajuster les noms de colonnes et l'ordre des champs
 *       lorsque le format exact d'OptiCoupe sera communiqué.
 *
 * @param {{ panelType: string, pieces: Array<{longueur: string, largeur: string, qte: string}>, contact: object }} state
 * @returns {string} Contenu CSV (UTF-8, séparateur virgule)
 */
function generateCsv(state) {
  var rows = ['materiau,longueur_mm,largeur_mm,quantite'];
  var materiau = normaliseMateriau(state.panelType || 'inconnu');

  state.pieces.forEach(function (piece) {
    rows.push([
      materiau,
      parseInt(piece.longueur, 10),
      parseInt(piece.largeur, 10),
      parseInt(piece.qte, 10)
    ].join(','));
  });

  return rows.join('\r\n');
}

/**
 * Déclenche le téléchargement du fichier CSV dans le navigateur.
 *
 * @param {string} csvString  - Contenu CSV renvoyé par generateCsv()
 * @param {string} [filename] - Nom du fichier téléchargé (optionnel)
 */
function downloadCsv(csvString, filename) {
  // Préfixe BOM UTF-8 pour Excel (Windows)
  var bom = '﻿';
  var blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'devis-sipano.csv');
  document.body.appendChild(link);
  link.click();

  // Nettoyage immédiat
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Envoie le CSV au serveur (stub — à remplacer par l'intégration réelle).
 *
 * TODO: remplacer l'URL et la logique d'envoi lorsque le backend
 *       (ou OptiCoupe) sera disponible. Deux approches possibles :
 *         1. POST multipart/form-data avec le fichier en pièce jointe
 *         2. POST application/json avec le CSV encodé en base64
 *
 * @param {string} csvString  - Contenu CSV
 * @param {{ nom: string, entreprise: string, telephone: string, email: string, adresse: string }} contactInfo
 * @returns {Promise<void>}
 */
function sendCsvToBackend(csvString, contactInfo) {
  // TODO: remplacer par l'URL de votre endpoint
  var ENDPOINT = '/api/devis';

  var formData = new FormData();
  var csvBlob = new Blob(['﻿' + csvString], { type: 'text/csv;charset=utf-8;' });
  formData.append('fichier_csv', csvBlob, 'devis-sipano.csv');
  formData.append('nom',        contactInfo.nom        || '');
  formData.append('entreprise', contactInfo.entreprise || '');
  formData.append('telephone',  contactInfo.telephone  || '');
  formData.append('email',      contactInfo.email      || '');
  formData.append('adresse',    contactInfo.adresse    || '');
  formData.append('message',    contactInfo.message    || '');

  // Stub : logge le payload en console (aucune requête réelle)
  console.info('[SIPANO] devis-export — sendCsvToBackend() stub appelé.');
  console.info('  Endpoint prévu :', ENDPOINT);
  console.info('  Contact :', JSON.stringify(contactInfo));
  console.info('  CSV preview :\n', csvString);

  /* Décommenter le bloc ci-dessous pour activer l'envoi réel :
  return fetch(ENDPOINT, {
    method: 'POST',
    body: formData
  })
    .then(function (response) {
      if (!response.ok) throw new Error('Erreur serveur : ' + response.status);
      console.info('[SIPANO] Devis envoyé avec succès.');
    })
    .catch(function (err) {
      console.error('[SIPANO] Échec de l\'envoi du devis :', err);
    });
  */

  return Promise.resolve();
}

/* Export vers l'espace global (pas de module bundler) */
window.DevisExport = {
  generateCsv: generateCsv,
  downloadCsv: downloadCsv,
  sendCsvToBackend: sendCsvToBackend
};
