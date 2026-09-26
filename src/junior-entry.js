// Punt d'entrada web d'EduTicTac Blocs Junior (junior).
// 0) mode de diagnosi opcional (?debug=1)
// 1) instal·la la interficie web (window.tablet)
// 2) carrega l'entry original de ScratchJr, que despatxa per window.scratchJrPage
import { debugMode } from './web/debugOverlay.js';
import './web/tabletInterface.js';
import './app/appEntry.js';
import brand from './web/brand/brand.js';
import { installTouchShim } from './web/touchShim.js';
import { installViewportGuard } from './web/viewport.js';

installTouchShim();
// En mode diagnosi no tapem la pantalla amb l'avis de girar.
if (!debugMode) installViewportGuard();

document.title = brand.name;

// Precarrega les fonts web: si no, el primer bocadillo de "diu" es mesura amb la
// font de reserva i el text acaba eixint-se'n quan arriba la definitiva.
if (document.fonts && document.fonts.load) {
  ['bold 14px Verdana', '14px Verdana'].forEach((f) => document.fonts.load(f).catch(() => {}));
}

// El service worker nomes es registra quan no estem en desenvolupament local.
const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
if ('serviceWorker' in navigator && !isLocal) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
