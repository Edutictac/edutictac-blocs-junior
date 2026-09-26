// Adaptacio a la mida de pantalla (junior).
// La interficie de ScratchJr es horitzontal i calcula les mesures (scaleMultiplier, css_vh/css_vw)
// una sola vegada en carregar. Aquest modul:
// 1) mostra un avis "Gira el dispositiu" quan la finestra es vertical;
// 2) quan la finestra canvia prou de mida (gir, redimensionat), desa el projecte i recarrega.
import ScratchJr from '../app/src/editor/ScratchJr.js';

const DESIGN_W = 1024;
const DESIGN_H = 768;
const SCALE_CHANGE = 0.08; // canvi relatiu d'escala que justifica recarregar
const DEBOUNCE_MS = 500;

const TEXTS = {
  ca: { title: 'Gira el dispositiu', body: 'Blocs Junior funciona en horitzontal. Si estàs en un ordinador, fes la finestra més ampla.' },
  es: { title: 'Gira el dispositivo', body: 'Blocs Junior funciona en horizontal. Si estás en un ordenador, haz la ventana más ancha.' }
};

function scaleFor (w, h) {
  return Math.min(h / DESIGN_H, w / DESIGN_W);
}

function isPortrait () {
  return window.innerHeight > window.innerWidth;
}

function currentLang () {
  const m = /(?:^|;\s*)localization=([^;]*)/.exec(document.cookie);
  const loc = m ? decodeURIComponent(m[1]) : (navigator.language || 'ca');
  return loc.toLowerCase().startsWith('es') ? 'es' : 'ca';
}

function buildOverlay () {
  const t = TEXTS[currentLang()];
  const el = document.createElement('div');
  el.id = 'junior-rotate';
  el.setAttribute('role', 'alert');
  el.innerHTML =
    '<style>' +
    '#junior-rotate{position:fixed;inset:0;z-index:2147483647;display:none;flex-direction:column;' +
    'align-items:center;justify-content:center;gap:24px;padding:32px;box-sizing:border-box;' +
    'background:#f5f2f7;color:#1f3d2b;font-family:"DejaVu Sans",sans-serif;text-align:center}' +
    '#junior-rotate.show{display:flex}' +
    '#junior-rotate h1{margin:0;font-size:28px;color:#2b8a3e}' +
    '#junior-rotate p{margin:0;font-size:18px;line-height:1.4;max-width:24em}' +
    '#junior-rotate svg{width:120px;height:120px;animation:junior-rot 2.4s ease-in-out infinite}' +
    '@keyframes junior-rot{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}' +
    '@media (prefers-reduced-motion:reduce){#junior-rotate svg{animation:none;transform:rotate(-90deg)}}' +
    '</style>' +
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<rect x="18" y="6" width="28" height="52" rx="5" fill="#fff" stroke="#2b8a3e" stroke-width="4"/>' +
    '<circle cx="32" cy="50" r="2.5" fill="#2b8a3e"/>' +
    '<rect x="24" y="14" width="16" height="28" rx="2" fill="#f59f00" opacity=".35"/>' +
    '</svg>' +
    '<h1></h1><p></p>';
  el.querySelector('h1').textContent = t.title;
  el.querySelector('p').textContent = t.body;
  return el;
}

// Hi ha un editor modal obert (pintura o biblioteca)? Recarregar ara perdria el treball.
function modalOpen () {
  const paint = document.getElementById('paintframe');
  const lib = document.getElementById('libframe');
  return !!((paint && /\bappear\b/.test(paint.className)) || (lib && /\bappear\b/.test(lib.className)));
}

export function installViewportGuard () {
  // Les pagines d'ajuda (inapp) es carreguen dins d'iframes: nomes actua la finestra principal.
  if (window.top !== window) return;

  const loaded = { w: window.innerWidth, h: window.innerHeight, portrait: isPortrait() };
  let overlay = null;
  let timer = null;
  let reloading = false;

  function showOverlay (show) {
    if (!overlay) {
      if (!show) return;
      overlay = buildOverlay();
      document.body.appendChild(overlay);
    }
    overlay.classList.toggle('show', show);
  }

  function needsReload () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (loaded.portrait) return true; // s'ha carregat en vertical: el layout es incorrecte
    // En mobils, la barra del navegador fa variar l'alt uns pocs pixels: si l'ample no canvia
    // i l'alt varia poc, no recarreguem.
    if (w === loaded.w && Math.abs(h - loaded.h) / loaded.h < 0.2) return false;
    const before = scaleFor(loaded.w, loaded.h);
    return Math.abs(scaleFor(w, h) - before) / before > SCALE_CHANGE;
  }

  function reload () {
    if (reloading) return;
    reloading = true;
    if (window.scratchJrPage === 'editor') {
      ScratchJr.saveProject(null, () => window.location.reload());
    } else {
      window.location.reload();
    }
  }

  function check () {
    const portrait = isPortrait();
    showOverlay(portrait);
    if (portrait || reloading || !needsReload()) return;
    if (modalOpen()) {
      // Esperem que es tanque l'editor de pintura o la biblioteca.
      timer = setTimeout(check, 2000);
      return;
    }
    reload();
  }

  function schedule () {
    clearTimeout(timer);
    timer = setTimeout(check, DEBOUNCE_MS);
  }

  const start = () => showOverlay(isPortrait());
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
}
