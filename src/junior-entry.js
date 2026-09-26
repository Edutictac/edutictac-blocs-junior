// Punt d'entrada web d'EduTicTac Blocs Junior (junior).
// 1) instal·la la interficie web (window.tablet)
// 2) carrega l'entry original de ScratchJr, que despatxa per window.scratchJrPage
import './web/tabletInterface.js';
import './app/appEntry.js';
import brand from './web/brand/brand.js';

document.title = brand.name;

// El service worker nomes es registra quan no estem en desenvolupament local.
const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
if ('serviceWorker' in navigator && !isLocal) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
