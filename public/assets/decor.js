// Black & Beauty — Décorations animées partagées

// SVG ROSE GOTHIQUE — utilisé en coin de section
window.GOTHIC_ROSE_SVG = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="rosePetal" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#5a0510"/>
      <stop offset="40%" stop-color="#1a0408"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <radialGradient id="roseHighlight" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#A10B1B" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0510"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
  </defs>
  <!-- feuilles -->
  <path d="M 30 100 Q 10 70 40 50 Q 60 60 50 90 Z" fill="url(#leaf)" opacity="0.7"/>
  <path d="M 160 90 Q 190 60 170 30 Q 140 50 150 90 Z" fill="url(#leaf)" opacity="0.7"/>
  <path d="M 40 160 Q 20 180 50 195 Q 70 180 60 160 Z" fill="url(#leaf)" opacity="0.6"/>
  <!-- pétales extérieurs -->
  <path d="M 100 30 Q 50 50 60 110 Q 80 160 100 170 Q 120 160 140 110 Q 150 50 100 30 Z" fill="url(#rosePetal)"/>
  <!-- pétales moyens -->
  <ellipse cx="100" cy="100" rx="40" ry="48" fill="url(#rosePetal)"/>
  <path d="M 70 90 Q 80 70 100 75 Q 120 70 130 90 Q 130 120 100 130 Q 70 120 70 90 Z" fill="#0a0408" stroke="#3a0810" stroke-width="0.8"/>
  <!-- pétales intérieurs avec reflets rouge -->
  <path d="M 85 95 Q 95 85 100 88 Q 108 82 115 95 Q 115 110 100 115 Q 85 110 85 95 Z" fill="#1a0510"/>
  <ellipse cx="100" cy="100" rx="10" ry="12" fill="#0a0408"/>
  <!-- reflets rouges (gouttelettes) -->
  <ellipse cx="92" cy="80" rx="3" ry="6" fill="#A10B1B" opacity="0.7"/>
  <ellipse cx="108" cy="105" rx="2" ry="4" fill="#A10B1B" opacity="0.6"/>
  <ellipse cx="78" cy="115" rx="2" ry="3" fill="#6b0510" opacity="0.5"/>
  <!-- glow général -->
  <ellipse cx="100" cy="100" rx="60" ry="60" fill="url(#roseHighlight)" opacity="0.4"/>
</svg>`;

// CROIX GOTHIQUE GEMME — séparateur
window.GOTHIC_CROSS_SVG = `
<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crossMetal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f4d4dd"/>
      <stop offset="50%" stop-color="#E2A9B3"/>
      <stop offset="100%" stop-color="#6b3540"/>
    </linearGradient>
  </defs>
  <path d="M 12 0 L 14 8 L 22 10 L 22 14 L 14 16 L 14 32 L 12 36 L 10 32 L 10 16 L 2 14 L 2 10 L 10 8 Z" fill="url(#crossMetal)"/>
  <circle cx="12" cy="12" r="2" fill="#A10B1B"/>
</svg>`;

// COURONNE en filigrane
window.CROWN_SVG = `
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crownMetal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E2A9B3"/>
      <stop offset="100%" stop-color="#6b3540"/>
    </linearGradient>
  </defs>
  <path d="M 30 80 L 30 40 L 50 60 L 70 25 L 90 50 L 100 15 L 110 50 L 130 25 L 150 60 L 170 40 L 170 80 Z"
        fill="none" stroke="url(#crownMetal)" stroke-width="1.2" opacity="0.6"/>
  <circle cx="70" cy="25" r="2" fill="#A10B1B"/>
  <circle cx="100" cy="15" r="2.5" fill="#A10B1B"/>
  <circle cx="130" cy="25" r="2" fill="#A10B1B"/>
</svg>`;

// CHAÎNE fine décorative (border)
window.CHAIN_SVG = `
<svg viewBox="0 0 600 12" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <g fill="none" stroke="#6b3540" stroke-width="1.2" opacity="0.5">
    ${Array.from({length: 30}, (_, i) => `<ellipse cx="${i * 20 + 10}" cy="6" rx="6" ry="4"/>`).join('')}
  </g>
</svg>`;

// Fonction qui sème scintillements + smoke dans un conteneur
window.seedAmbiance = function(container, opts = {}) {
  const { sparkles = 12, smokes = 4 } = opts;
  for (let i = 0; i < sparkles; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.animationDuration = (2 + Math.random() * 4) + 's';
    container.appendChild(s);
  }
  for (let i = 0; i < smokes; i++) {
    const s = document.createElement('div');
    s.className = 'smoke ' + (i % 2 ? 'smoke-purple' : 'smoke-red');
    const size = 200 + Math.random() * 300;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = -Math.random() * 18 + 's';
    s.style.animationDuration = (14 + Math.random() * 12) + 's';
    container.appendChild(s);
  }
};

// Reveal au scroll
window.initFadeUps = function() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
};

// Nav active
window.setActiveNav = function(page) {
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
};

// Menu mobile — construit à partir de .nav-links existant (aucune modif du HTML/nav requise)
window.initMobileNav = function() {
  const nav = document.querySelector('.nav');
  if (!nav || nav.querySelector('.nav-toggle')) return;
  const links = nav.querySelector('.nav-links');
  if (!links) return;

  // Bouton hamburger
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(toggle);

  // Panneau plein écran cloné depuis les liens existants
  const panel = document.createElement('div');
  panel.className = 'mobile-menu';
  const list = document.createElement('ul');
  links.querySelectorAll('a').forEach(a => {
    const li = document.createElement('li');
    li.appendChild(a.cloneNode(true));
    list.appendChild(li);
  });
  panel.appendChild(list);
  document.body.appendChild(panel);

  const close = () => {
    panel.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  };
  const open = () => {
    panel.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
  };
  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? close() : open();
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
};

// Liens légaux ajoutés au bas de page (toutes les pages, sans modifier chaque footer)
window.initLegalFooterLinks = function() {
  const bottom = document.querySelector('.footer-bottom');
  if (!bottom || bottom.querySelector('.legal-links')) return;
  const wrap = document.createElement('div');
  wrap.className = 'legal-links';
  wrap.innerHTML =
    '<a href="/politique-confidentialite">Confidentialité</a>' +
    '<span aria-hidden="true">✠</span>' +
    '<a href="/politique-securite">Sécurité</a>';
  bottom.appendChild(wrap);
};

// Auto-initialisation sur chaque page
window.initSiteChrome = function() {
  window.initMobileNav();
  window.initLegalFooterLinks();
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initSiteChrome);
} else {
  window.initSiteChrome();
}
