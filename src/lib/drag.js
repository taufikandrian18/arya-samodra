// Drag / swipe on an element. Touch uses touch events with a non-passive
// touchmove, because iOS Safari only stops the page from panning when
// touchmove is cancelled (pointer events + touch-action alone aren't
// reliable there). Mouse and pen use pointer events. A drag under
// `threshold` px stays a tap, so the element's click still fires; the click
// that follows a real mouse drag is swallowed.
//
// Handlers get (dx, dy, g) where g = { axis: 'x'|'y', vx, vy } (px/ms).
// `enabled(kind)` ('touch'|'mouse') can turn the gesture off, e.g. to let a
// zoomed image scroll natively.
export function attachDrag(el, { start, move, end, enabled = () => true, threshold = 8 }) {
  if (!el) return () => {};
  let g = null;

  const begin = (x, y, t, kind) => {
    if (!enabled(kind)) return;
    g = { x, y, lx: x, ly: y, lt: t, vx: 0, vy: 0, moved: false, axis: null, kind };
    start?.(g);
  };
  const step = (x, y, t) => {
    if (!g) return false;
    const dx = x - g.x;
    const dy = y - g.y;
    if (!g.moved) {
      if (Math.hypot(dx, dy) < threshold) return false;
      g.moved = true;
      g.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }
    const dt = t - g.lt;
    if (dt > 0) {
      g.vx = (x - g.lx) / dt;
      g.vy = (y - g.ly) / dt;
    }
    g.lx = x;
    g.ly = y;
    g.lt = t;
    move?.(dx, dy, g);
    return true;
  };
  const finish = () => {
    const s = g;
    g = null;
    if (s?.moved) end?.(s.lx - s.x, s.ly - s.y, s);
    return !!s?.moved;
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) {
      g = null;
      return;
    }
    const p = e.touches[0];
    begin(p.clientX, p.clientY, e.timeStamp, 'touch');
  };
  const onTouchMove = (e) => {
    if (!g) return;
    if (e.touches.length !== 1) {
      g = null; // a second finger: let the browser pinch
      return;
    }
    const p = e.touches[0];
    step(p.clientX, p.clientY, e.timeStamp);
    if (e.cancelable) e.preventDefault();
  };
  const onTouchEnd = () => finish();

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch' || e.button > 0) return;
    begin(e.clientX, e.clientY, e.timeStamp, 'mouse');
  };
  const onPointerMove = (e) => {
    if (e.pointerType === 'touch' || !g || g.kind !== 'mouse') return;
    if (step(e.clientX, e.clientY, e.timeStamp)) el.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e) => {
    if (e.pointerType === 'touch' || !g || g.kind !== 'mouse') return;
    if (!finish()) return;
    const stop = (ev) => ev.stopPropagation();
    window.addEventListener('click', stop, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
  };

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd);
  el.addEventListener('touchcancel', onTouchEnd);
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  return () => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchEnd);
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
  };
}
