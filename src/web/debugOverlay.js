// Mode de diagnosi (junior): afegir ?debug=1 (o #debug) a qualsevol pagina.
// Mostra en pantalla els errors de JavaScript i l'estat basic del navegador,
// util en dispositius sense consola (iPad). Es recorda durant la sessio.
const KEY = 'blocsjunior-debug';

function enabled () {
  try {
    if (/[?&]debug=1/.test(location.search) || location.hash === '#debug') {
      sessionStorage.setItem(KEY, '1');
    }
    return sessionStorage.getItem(KEY) === '1';
  } catch (e) {
    return /[?&]debug=1/.test(location.search);
  }
}

export const debugMode = enabled();

if (debugMode) {
  const lines = [];
  let box = null;
  const render = () => {
    if (!document.body) return;
    if (!box) {
      box = document.createElement('pre');
      box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;margin:0;' +
        'padding:8px;z-index:2147483647;background:rgba(0,0,0,.85);color:#7CFC00;font:12px/1.35 monospace;' +
        'white-space:pre-wrap;pointer-events:auto';
      document.body.appendChild(box);
    }
    box.textContent = lines.join('\n');
  };
  const log = (msg) => {
    lines.push(new Date().toISOString().slice(11, 19) + ' ' + msg);
    render();
  };
  window.__juniorLog = log;
  window.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t !== window && (t.src || t.href)) {
      log('RESOURCE ' + (t.src || t.href));
    } else {
      log('ERROR ' + e.message + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno + ':' + e.colno);
    }
  }, true);
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    log('REJECT ' + (r && (r.stack || r.message) ? (r.message + ' ' + (r.stack || '')) : String(r)));
  });
  const origErr = console.error;
  console.error = function (...args) {
    log('console.error ' + args.map((a) => (a && a.message) || String(a)).join(' '));
    return origErr.apply(this, args);
  };
  const info = () => {
    const sw = navigator.serviceWorker;
    log('page ' + location.pathname + location.search);
    log('ua ' + navigator.userAgent);
    log('size ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio + ' touch ' + navigator.maxTouchPoints);
    log('sw ' + (sw ? (sw.controller ? 'controlled' : 'not controlled') : 'n/a'));
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      if (window.__blocsJuniorReady) {
        log('db ready after ~' + (n * 250) + 'ms');
        clearInterval(t);
      } else if (n === 40) {
        log('db NOT ready after 10s');
        clearInterval(t);
      }
    }, 250);
  };
  if (document.body) info(); else document.addEventListener('DOMContentLoaded', info);
}
