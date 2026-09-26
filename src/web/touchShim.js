// junior: pont tactil per a iOS Safari.
//
// El codi hereditat de ScratchJr escolta events de ratoli (onmousedown /
// onmousemove / onmouseup). A iOS Safari els events de ratoli sintetitzats no
// s'emeten de manera fiable sobre elements que no siguen enllacos/botons, de
// manera que la interficie no respon al toc. Este modul tradueix els gestos
// d'un sol dit a events de ratoli equivalents.
//
// Dos modes:
//  - "drag"  (editor, dialegs): traduccio en temps real (mousedown/move/up) i
//            preventDefault, perque l'arrossegament de blocs funcione.
//  - "scroll" (contenidors amb overflow): el gest es deixa passar perque
//     l'scroll natiu funcione; nomes si es un toc net es sintetitza un tap
//     complet (mousedown/mouseup/click) al final.
//
// Els gestos de dos dits es deixen passar perque la logica de pinch de
// Events.js els maneja directament.

function hasMouseHandler(el) {
  let node = el;
  let depth = 0;
  while (node && node !== document && depth < 12) {
    if (node.onmousedown || node.onmouseup || node.onclick) return true;
    node = node.parentNode;
    depth += 1;
  }
  return false;
}

function isTextInput(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function hasScrollableAncestor(el) {
  let node = el;
  while (node && node !== document) {
    if (node.nodeType === 1) {
      const style = window.getComputedStyle(node);
      const overflowY = style ? style.overflowY : '';
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1) {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

function dispatchMouse(target, type, touch) {
  const init = {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1,
    button: 0,
    buttons: type === 'mouseup' ? 0 : 1,
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY
  };
  let event;
  try {
    event = new MouseEvent(type, init);
  } catch (e) {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent(type, true, true, window, 1, touch.screenX, touch.screenY,
      touch.clientX, touch.clientY, false, false, false, false, 0, null);
  }
  target.dispatchEvent(event);
}

function isIOSSafari() {
  const ua = navigator.userAgent;
  const iOS = /iP(hone|od|ad)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webkit = /AppleWebKit/.test(ua);
  return iOS && webkit;
}

export function installTouchShim() {
  const forced = window.__forceTouchShim ||
    (typeof location !== 'undefined' && /[?&]touchshim=1/.test(location.search));
  if (!forced && !isIOSSafari()) return false;
  if (!('ontouchstart' in window) && !forced) return false;

  let active = null;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const target = e.target;
    if (!target || isTextInput(target) || !hasMouseHandler(target)) return;
    const touch = e.touches[0];
    active = {
      target,
      mode: hasScrollableAncestor(target) ? 'scroll' : 'drag',
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false
    };
    if (active.mode === 'drag') {
      e.preventDefault();
      dispatchMouse(target, 'mousedown', touch);
    }
  }, { capture: true, passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!active || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - active.startX;
    const dy = touch.clientY - active.startY;
    if (Math.sqrt((dx * dx) + (dy * dy)) > 10) active.moved = true;
    if (active.mode === 'drag') {
      e.preventDefault();
      dispatchMouse(document, 'mousemove', touch);
    }
    // mode scroll: deixem passar l'scroll natiu
  }, { capture: true, passive: false });

  function endGesture(e) {
    if (!active) return;
    const state = active;
    active = null;
    const touch = e.changedTouches[0];
    if (!touch) return;
    if (state.mode === 'drag') {
      e.preventDefault();
      dispatchMouse(document, 'mousemove', touch);
      dispatchMouse(state.target, 'mouseup', touch);
      if (!state.moved) dispatchMouse(state.target, 'click', touch);
    } else if (!state.moved) {
      // toc net: sintetitzem un tap complet
      dispatchMouse(state.target, 'mousedown', touch);
      dispatchMouse(state.target, 'mouseup', touch);
      dispatchMouse(state.target, 'click', touch);
    }
  }

  document.addEventListener('touchend', endGesture, { capture: true, passive: false });
  document.addEventListener('touchcancel', endGesture, { capture: true, passive: false });

  window.__touchShimInstalled = true;
  return true;
}
