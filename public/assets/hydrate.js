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

  // ---------------------------------------------------------
  // Sanitizer HTML : tags/attributs autorises pour data-cms-html
  // Seule cette liste peut apparaitre dans le HTML rendu.
  // ---------------------------------------------------------
  var HTML_ALLOWED_TAGS = {
    p: 1, br: 1, span: 1, div: 1,
    strong: 1, em: 1, b: 1, i: 1, u: 1,
    a: 1,
    ul: 1, ol: 1, li: 1,
    h2: 1, h3: 1, h4: 1, h5: 1, h6: 1
  };
  var HTML_ALLOWED_ATTRS = {
    a:   ['href', 'target', 'rel', 'class'],
    p:   ['class'],
    div: ['class'],
    span:['class'],
    ul:  ['class'],
    ol:  ['class'],
    li:  ['class'],
    h2:  ['class'],
    h3:  ['class'],
    h4:  ['class'],
    h5:  ['class'],
    h6:  ['class']
  };
  // Longueur max d'une valeur d'attribut class (evite abus)
  var MAX_CLASS_LEN = 200;

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
        var ct = (res.headers.get('content-type') || '').toLowerCase();
        // Accepte uniquement application/json (Vercel sert bien les .json avec
        // ce Content-Type) ou application/octet-stream (fallback rare).
        // Retire text/plain et text/* (trop laxiste — accepterait une page
        // d'erreur HTML ou du texte quelconque).
        if (ct.indexOf('application/json') === -1 &&
            ct.indexOf('application/octet-stream') === -1) return null;
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

  // Convertit #RGB / #RRGGBB / #RRGGBBAA -> triple "R, G, B" (canaux RGB, alpha ignore).
  // Retourne null si la chaine n'est pas un hex color valide.
  function hexToRgbTriple(hex) {
    if (typeof hex !== 'string') return null;
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex);
    if (!m) return null;
    var h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return r + ', ' + g + ', ' + b;
  }

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
      // Pour toute couleur hex, derive automatiquement la variable -rgb
      // (permet rgba(var(--x-rgb), alpha) dans le CSS).
      var rgb = hexToRgbTriple(value);
      if (rgb !== null) {
        root.setProperty(key + '-rgb', rgb);
      }
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

  // --- Rendu de listes ------------------------------------
  // Un element avec [data-cms-list="a.b"] repete son PREMIER
  // enfant elementaire pour chaque item du tableau a.b.
  // Le premier enfant sert de template. Dans ce template :
  //   [data-cms-item="field"]        -> textContent = item[field]
  //   [data-cms-item-attr="a:field"] -> setAttribute(a, item[field])
  // Progressive enhancement : sans JS, le template original reste
  // visible; avec JS, il est remplace par les items rendus.

  function hydrateListItem(root, item) {
    if (!root || !item || typeof item !== 'object') return;
    var candidates = root.querySelectorAll('[data-cms-item], [data-cms-item-attr]');
    var i, j, node, field, spec, pairs, pair, attr, val;

    // Le root lui-meme peut porter les attributs
    var all = [];
    if (root.hasAttribute && (root.hasAttribute('data-cms-item') || root.hasAttribute('data-cms-item-attr'))) {
      all.push(root);
    }
    for (i = 0; i < candidates.length; i++) all.push(candidates[i]);

    for (i = 0; i < all.length; i++) {
      node = all[i];

      // Texte
      field = node.getAttribute('data-cms-item');
      if (field && PATH_REGEX.test(field)) {
        val = item[field];
        if (typeof val === 'string' || typeof val === 'number') {
          node.textContent = String(val);
        }
      }

      // Attributs
      spec = node.getAttribute('data-cms-item-attr');
      if (spec && spec.length <= 500) {
        pairs = spec.split(',');
        for (j = 0; j < pairs.length; j++) {
          pair = pairs[j].split(':');
          if (pair.length !== 2) continue;
          attr = pair[0].trim();
          field = pair[1].trim();
          if (!SAFE_ATTRS[attr]) continue;
          if (!PATH_REGEX.test(field)) continue;
          val = item[field];
          if (typeof val !== 'string') continue;
          if ((attr === 'href' || attr === 'src') && !isSafeUrl(val)) continue;
          node.setAttribute(attr, val);
        }
      }
    }
  }

  function fillLists(scope) {
    var containers = document.querySelectorAll('[data-cms-list]');
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      var path = container.getAttribute('data-cms-list');
      if (!path || !PATH_REGEX.test(path)) continue;
      var list = getPath(scope, path);
      if (!Array.isArray(list)) continue;
      // Cap raisonnable pour eviter DoS via JSON malicieux
      if (list.length > 500) continue;

      // Premier enfant elementaire = template
      var template = null;
      for (var j = 0; j < container.children.length; j++) {
        if (container.children[j].nodeType === 1) { template = container.children[j]; break; }
      }
      if (!template) continue;

      // Vide le container et re-rend
      while (container.firstChild) container.removeChild(container.firstChild);
      for (var k = 0; k < list.length; k++) {
        var clone = template.cloneNode(true);
        hydrateListItem(clone, list[k]);
        container.appendChild(clone);
      }
    }
  }

  // --- Rendu HTML sanitize --------------------------------
  // Un element avec [data-cms-html="a.b"] recoit le HTML de a.b
  // apres passage par un sanitizer strict (whitelist tags + attrs).
  // Le rendu utilise createElement/appendChild uniquement — jamais
  // innerHTML sur le contenu externe.

  function sanitizeInto(rawStr, targetEl) {
    if (typeof rawStr !== 'string' || rawStr.length > 100000) return;
    if (!targetEl) return;
    // Vide la cible
    while (targetEl.firstChild) targetEl.removeChild(targetEl.firstChild);
    // Parse le HTML dans un document isole (aucun script n'est execute par DOMParser)
    var doc;
    try {
      doc = new DOMParser().parseFromString(rawStr, 'text/html');
    } catch (e) { return; }
    if (!doc || !doc.body) return;
    copyAllowed(doc.body, targetEl);
  }

  function copyAllowed(source, dest) {
    var children = source.childNodes;
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      if (node.nodeType === 3) {
        // Text node
        dest.appendChild(document.createTextNode(node.data));
      } else if (node.nodeType === 1) {
        // Element
        var tag = node.tagName.toLowerCase();
        if (!HTML_ALLOWED_TAGS[tag]) {
          // Tag interdit : on garde le contenu textuel des enfants (flatten)
          copyAllowed(node, dest);
          continue;
        }
        var newEl = document.createElement(tag);
        var allowed = HTML_ALLOWED_ATTRS[tag] || [];
        var attrs = node.attributes;
        for (var j = 0; j < attrs.length; j++) {
          var a = attrs[j];
          var name = a.name.toLowerCase();
          // Refuse handlers d'evenements meme si un jour listes par erreur
          if (name.indexOf('on') === 0) continue;
          if (allowed.indexOf(name) === -1) continue;
          var val = a.value;
          if (name === 'class' && val.length > MAX_CLASS_LEN) continue;
          if ((name === 'href' || name === 'src') && !isSafeUrl(val)) continue;
          newEl.setAttribute(name, val);
        }
        // Force rel="noopener noreferrer" sur les liens target="_blank"
        if (tag === 'a' && newEl.getAttribute('target') === '_blank') {
          newEl.setAttribute('rel', 'noopener noreferrer');
        }
        dest.appendChild(newEl);
        copyAllowed(node, newEl);
      }
      // Commentaires et autres nodeTypes -> ignores
    }
  }

  function fillHtmls(scope) {
    var nodes = document.querySelectorAll('[data-cms-html]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var path = node.getAttribute('data-cms-html');
      if (!path || !PATH_REGEX.test(path)) continue;
      var value = getPath(scope, path);
      if (typeof value === 'string') {
        sanitizeInto(value, node);
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

      // Ordre important :
      // 1. Listes en premier (elles reconstruisent le DOM) — sinon
      //    fillTexts/fillAttrs matcheraient les templates originaux.
      // 2. Puis textes et attrs simples.
      // 3. Puis HTML sanitize (fait un replace du contenu enfant).
      fillLists(scope);
      fillTexts(scope);
      fillAttrs(scope);
      fillHtmls(scope);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
