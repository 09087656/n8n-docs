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

/* ============================================================
   Configuration EmailJS
   ——————————————————————————————————————————————————————————————
   1. Créez un compte gratuit sur https://www.emailjs.com
   2. Ajoutez un "Email Service" (Gmail, Outlook, ou SMTP custom)
      → notez votre SERVICE_ID
   3. Créez un "Email Template" avec les variables ci-dessous
      (voir README dans les commentaires de sendDevisByEmail)
      → notez votre TEMPLATE_ID
   4. Copiez votre "Public Key" depuis Account → API Keys
      → notez votre PUBLIC_KEY
   5. Remplacez les trois valeurs EMAILJS_* ci-dessous
   ============================================================ */

var EMAILJS_SERVICE_ID  = 'service_jkj355v';
var EMAILJS_TEMPLATE_ID = 'template_yxrdrtt';
var EMAILJS_PUBLIC_KEY  = 'PIX_-B8-F5N7tip3N';

/** Adresse qui recevra tous les devis (modifiable ici) */
var DESTINATAIRE = 'romanfilipciuc2006@mail.ru';

/**
 * Encode une chaîne UTF-8 en base64 (pour la pièce jointe EmailJS).
 * @param {string} str
 * @returns {string}
 */
function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

/**
 * Envoie le CSV par email via EmailJS.
 *
 * ——— Template EmailJS à créer ———
 * Sujet    : Nouveau devis SIPANO — {{client_nom}}
 * Corps    :
 *   Bonjour,
 *
 *   Nouvelle demande de découpe reçue le {{date}}.
 *
 *   Client   : {{client_nom}}
 *   Entreprise: {{client_entreprise}}
 *   Téléphone: {{client_telephone}}
 *   Email    : {{client_email}}
 *   Adresse  : {{client_adresse}}
 *
 *   Message  : {{client_message}}
 *
 *   ——— Détail de la découpe ———
 *   Matériau : {{materiau}}
 *   {{csv_contenu}}
 *
 *   Le fichier CSV est joint à cet email.
 *
 * Pièce jointe (onglet "Attachments" dans EmailJS) :
 *   Name    : devis-sipano-{{client_nom}}.csv
 *   Data    : {{csv_base64}}
 *   Mime    : text/csv
 * ———————————————————————————————
 *
 * @param {string} csvString  - Contenu CSV généré par generateCsv()
 * @param {{ nom, entreprise, telephone, email, adresse, message }} contactInfo
 * @param {string} materiau   - Type de panneau sélectionné
 * @returns {Promise<void>}
 */
function sendDevisByEmail(csvString, contactInfo, materiau) {
  if (
    EMAILJS_SERVICE_ID  === 'VOTRE_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'VOTRE_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY  === 'VOTRE_PUBLIC_KEY'
  ) {
    console.warn('[SIPANO] EmailJS non configuré. Renseignez les constantes dans devis-export.js.');
    return Promise.resolve();
  }

  if (typeof emailjs === 'undefined') {
    console.error('[SIPANO] SDK EmailJS introuvable. Vérifiez la balise <script> dans contact.html.');
    return Promise.resolve();
  }

  var now = new Date();
  var dateStr = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  var slug = (contactInfo.nom || 'client').replace(/\s+/g, '-').toLowerCase();

  var templateParams = {
    to_email:           DESTINATAIRE,
    date:               dateStr,
    client_nom:         contactInfo.nom        || '—',
    client_entreprise:  contactInfo.entreprise || '—',
    client_telephone:   contactInfo.telephone  || '—',
    client_email:       contactInfo.email      || '—',
    client_adresse:     contactInfo.adresse    || '—',
    client_message:     contactInfo.message    || '—',
    materiau:           materiau               || '—',
    csv_contenu:        csvString,
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
 * Alias rétrocompatible pour l'appel dans main.js.
 * Conserve la même signature que le stub original.
 */
function sendCsvToBackend(csvString, contactInfo) {
  return sendDevisByEmail(csvString, contactInfo, contactInfo._materiau || '');
}

/* Export vers l'espace global (pas de module bundler) */
window.DevisExport = {
  generateCsv: generateCsv,
  downloadCsv: downloadCsv,
  sendCsvToBackend: sendCsvToBackend
};
