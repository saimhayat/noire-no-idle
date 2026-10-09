import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
const ShalwarKameezCanvas = lazy(() => import('./ShalwarKameezCanvas.jsx'));

class PreviewBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function HomepageGarmentPreview() {
  const root = useRef(null);
  const drag = useRef(null);
  const model = useRef({ rotationY: 0, autoRotate: false, active: false });
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 721px)').matches);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playing, setPlaying] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const el = root.current;
    const screen = matchMedia('(min-width: 721px)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onScreen = () => setDesktop(screen.matches);
    const onMotion = () => { setReduced(motion.matches); if (motion.matches) setPlaying(false); };
    const onVisibility = () => setPageVisible(!document.hidden);
    screen.addEventListener('change', onScreen);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    const syncDock = () => setDocked(el.classList.contains('is-active'));
    const mutation = new MutationObserver(syncDock);
    mutation.observe(el, { attributes: true, attributeFilter: ['class'] });
    syncDock();
    let loadObserver, viewObserver;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); setVisible(true); }
    else {
      loadObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setNear(true); loadObserver.disconnect(); }
      }, { rootMargin: '200px' });
      viewObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .1), { threshold: [0, .1] });
      loadObserver.observe(el); viewObserver.observe(el);
    }
    return () => {
      screen.removeEventListener('change', onScreen); motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      mutation.disconnect(); loadObserver?.disconnect(); viewObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    model.current.active = visible && pageVisible && (!desktop || reduced || docked) && !failed;
    model.current.autoRotate = playing;
    model.current.immediate = reduced;
    model.current.wake?.();
  }, [visible, pageVisible, desktop, reduced, docked, playing, failed]);

  const stop = () => { model.current.autoRotate = false; setPlaying(false); };
  const turn = (degrees) => { stop(); model.current.rotationY += degrees; model.current.wake?.(); };
  const reset = () => { stop(); model.current.rotationY = 360 * Math.round(model.current.rotationY / 360); model.current.wake?.(); };
  const down = (event) => {
    if (!ready || failed || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: model.current.rotationY, turning: event.pointerType === 'mouse' };
    if (drag.current.turning) { stop(); event.currentTarget.setPointerCapture(event.pointerId); }
  };
  const move = (event) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (!start.turning) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
      start.turning = true; stop(); event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    model.current.rotationY = start.angle + dx * .65;
    model.current.wake?.();
  };
  const end = (event) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const fallback = <div className="garment-preview__fallback"><img src="/garments/shalwar-kameez-mobile.webp" alt="Shalwar kameez preview image" /><p>3D is unavailable on this device. A still preview is shown.</p></div>;

  return (
    <div ref={root} className={`promo__garment-dock garment-preview ${!desktop || reduced ? 'is-active' : ''}`} data-garment-dock="true">
      <p className="garment-preview__badge">NOIRÉ / 360°</p>
      <div className="garment-preview__stage" data-garment-stage="true" onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { drag.current = null; }}>
        {failed ? fallback : near && <PreviewBoundary onError={onError} fallback={fallback}><Suspense fallback={null}><ShalwarKameezCanvas stateRef={model} onReady={onReady} onError={onError} fallback={fallback} className="promo__garment-canvas" /></Suspense></PreviewBoundary>}
        {!ready && !failed && <p className="garment-preview__loading" role="status">Loading the 3D garment…</p>}
      </div>
      {!failed && <div className="garment-preview__tools">
        <p>Drag sideways to turn · Swipe up to scroll</p>
        <div className="garment-preview__buttons">
          <button type="button" onClick={() => turn(-90)} disabled={!ready} aria-label="Turn garment left">↶</button>
          <button type="button" onClick={() => setPlaying((value) => !value)} disabled={!ready} aria-pressed={playing}>{playing ? 'Pause turn' : 'Start turn'}</button>
          <button type="button" onClick={reset} disabled={!ready}>Reset</button>
          <button type="button" onClick={() => turn(90)} disabled={!ready} aria-label="Turn garment right">↷</button>
        </div>
      </div>}
    </div>
  );
}
