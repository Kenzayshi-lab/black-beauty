/* =========================================================
   BLACK & BEAUTY STUDIO — HYDRATATION DU CONTENU
   ---------------------------------------------------------
   Charge les fichiers /content/*.json et remplit les zones
   marquees `data-cms="chemin.vers.champ"` du HTML.

   Principes de securite :
   - Progressive enhancement : le site fonctionne sans ce script.
   - textContent uniquement, JAMAIS innerHTML avec du contenu externe.
   - Whitelist stricte des noms de chemins et des attributs.
   - Blocage des URLs javascript: et data: dans href/src.
   - Timeout et credentials:omit sur tous les fetch.
   - Aucune fuite dans le scope global (IIFE + strict mode).
   ========================================================= */

(function () {
  'use strict';

  var CONTENT_BASE = '/content/';
  var FETCH_TIMEOUT_MS = 5000;

  // Cache-bust horaire (fin de journee : la valeur change au maximum une fois par heure)
  var CACHE_KEY = new Date().toISOString().slice(0, 13);

  // Whitelist stricte des noms de champs autorises dans data-cms
  var PATH_REGEX = /^[a-z0-9_.-]+$/i;

  // Whitelist des attributs que le CMS peut modifier
  var SAFE_ATTRS = { href: 1, src: 1, alt: 1, title: 1 };

  // Whitelist des variables CSS que le theme peut piloter
  var THEME_VARS = [
    '--noir-profond', '--noir-velours', '--noir-marbre',
    '--rouge-rubis', '--rouge-sang',
    '--rose-metal', '--rose-poudre',
    '--argent-givre', '--argent-doux',
    '--titre', '--titre-deco', '--script', '--corps',
    '--r-sm', '--r-md', '--r-lg'
  ];

  // --- Utilitaires ----------------------------------------

  function getPath(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current === null || typeof current !== 'object') return undefined;
      if (!Object.prototype.hasOwnProperty.call(current, parts[i])) return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  function isSafeUrl(value) {
    if (typeof value !== 'string' || value.length > 2000) return false;
    // rejette explicitement javascript:, data: (sauf images embarquees limitees), vbscript:
    if (/^\s*(javascript|vbscript|data):/i.test(value)) return false;
    // accepte http(s), racine, mailto, tel, ancres, chemins relatifs simples
    return /^(https?:\/\/|\/|mailto:|tel:|#|\.\/|[a-z0-9][a-z0-9/_.-]*)/i.test(value);
  }

  function fetchJson(name) {
    if (!/^[a-z0-9_-]+$/i.test(name)) return Promise.resolve(null);
    var url = CONTENT_BASE + encodeURIComponent(name) + '.json?v=' + CACHE_KEY;
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS) : null;
    var opts = {
      credentials: 'omit',
      cache: 'default',
      redirect: 'error'
    };
    if (controller) opts.signal = controller.signal;
    return fetch(url, opts)
      .then(function (res) {
        if (!res.ok) return null;
        var ct = res.headers.get('content-type') || '';
        // accepte application/json (ideal) ou text/plain (Vercel sert parfois les .json en text)
        if (ct.indexOf('json') === -1 && ct.indexOf('text/plain') === -1 && ct.indexOf('text/') === -1) return null;
        return res.text();
      })
      .then(function (text) {
        if (!text) return null;
        var trimmed = text.trim();
        // Refuse tout ce qui n'est pas un objet ou tableau JSON
        if (trimmed.charAt(0) !== '{' && trimmed.charAt(0) !== '[') return null;
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return null;
        }
      })
      .catch(function () { return null; })
      .then(function (result) {
        if (timeoutId) clearTimeout(timeoutId);
        return result;
      });
  }

  // --- Application du theme -------------------------------

  function applyTheme(theme) {
    if (!theme || typeof theme !== 'object') return;
    var root = document.documentElement.style;
    for (var i = 0; i < THEME_VARS.length; i++) {
      var key = THEME_VARS[i];
      var value = theme[key];
      if (typeof value !== 'string') continue;
      if (value.length > 200) continue;
      // Refuse les valeurs contenant des caracteres qui pourraient casser une declaration CSS
      if (/[<>{};]/.test(value)) continue;
      root.setProperty(key, value);
    }
  }

  // --- Remplissage du texte -------------------------------

  function fillTexts(scope) {
    var nodes = document.querySelectorAll('[data-cms]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var path = node.getAttribute('data-cms');
      if (!path || !PATH_REGEX.test(path)) continue;
      var value = getPath(scope, path);
      if (typeof value === 'string' || typeof value === 'number') {
        node.textContent = String(value);
      }
    }
  }

  // --- Remplissage des attributs --------------------------

  function fillAttrs(scope) {
    var nodes = document.querySelectorAll('[data-cms-attr]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var spec = node.getAttribute('data-cms-attr');
      if (!spec || spec.length > 500) continue;
      var pairs = spec.split(',');
      for (var j = 0; j < pairs.length; j++) {
        var pair = pairs[j].split(':');
        if (pair.length !== 2) continue;
        var attr = pair[0].trim();
        var path = pair[1].trim();
        if (!SAFE_ATTRS[attr]) continue;
        if (!PATH_REGEX.test(path)) continue;
        var value = getPath(scope, path);
        if (typeof value !== 'string') continue;
        if ((attr === 'href' || attr === 'src') && !isSafeUrl(value)) continue;
        node.setAttribute(attr, value);
      }
    }
  }

  // --- Initialisation -------------------------------------

  function init() {
    var page = document.body ? document.body.getAttribute('data-page') : null;
    var jobs = [fetchJson('site'), fetchJson('theme')];
    if (page && /^[a-z0-9_-]+$/i.test(page)) {
      jobs.push(fetchJson(page));
    }
    Promise.all(jobs).then(function (results) {
      var site = results[0];
      var theme = results[1];
      var pageContent = results[2] || null;

      if (theme) applyTheme(theme);

      var scope = { site: site || {}, theme: theme || {} };
      if (page && pageContent) scope[page] = pageContent;

      fillTexts(scope);
      fillAttrs(scope);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
