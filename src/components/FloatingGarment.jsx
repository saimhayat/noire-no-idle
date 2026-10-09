import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ShalwarKameezCanvas, { getModelPixelHeight } from './ShalwarKameezCanvas.jsx';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const smoothStep = (value) => value * value * (3 - 2 * value);
const interpolate = (from, to, progress) => from + (to - from) * progress;

function getCenter(rect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

/* Centre of an element in DOCUMENT coordinates from its layout boxes. Unlike
   getBoundingClientRect this ignores transforms, so the hero plate's scroll
   parallax / settle-scale and the route's fade-up can never leak into the
   measurement. (Measured mid-scroll, those offset the start point, which is why
   the garment sat lower or larger when you came back up to the hero.) */
function layoutCenter(el) {
  let x = 0;
  let y = 0;
  for (let n = el; n; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

export default function FloatingGarment() {
  const garmentRef = useRef(null);
  const modelStateRef = useRef({ rotationY: 0 });
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 721px)').matches
  ));

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 721px)');
    const onChange = (event) => setIsDesktop(event.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const garmentEl = garmentRef.current;
    const heroPlate = document.querySelector('.hero__plate');
    const garmentTarget = document.querySelector('[data-garment-target="true"]');
    const dockEl = document.querySelector('[data-garment-dock="true"]');

    if (!garmentEl || !heroPlate || !garmentTarget || !dockEl) {
      return undefined;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 721px)');
    let metrics = null;
    let docked = false;

    const baseEl = garmentEl.parentElement; // .home__garment (fixed, never transformed by GSAP)

    const readMetrics = () => {
      const baseRect = baseEl.getBoundingClientRect(); // fixed, never transformed by scroll

      // Where the garment actually rests (not "the middle of the viewport":
      // the CSS parks it at 52% of the height).
      const baseCenter = getCenter(baseRect);
      const heroCenterDoc = layoutCenter(heroPlate);
      const targetCenterDoc = layoutCenter(garmentTarget);

      // Size the garment at the dock so the hand-over is pixel for pixel: the
      // 3D camera frames the model by container size, so a differently sized
      // dock would otherwise show it suddenly bigger or smaller.
      let endScale = 1;
      if (desktop.matches) {
        const cs = getComputedStyle(dockEl);
        const dockW = dockEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const dockH = dockEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const floatPx = getModelPixelHeight(baseEl.offsetWidth, baseEl.offsetHeight);
        if (dockW > 0 && dockH > 0 && floatPx > 0) {
          endScale = getModelPixelHeight(dockW, dockH) / floatPx;
        }
      }

      metrics = {
        endScroll: Math.max(targetCenterDoc.y - baseCenter.y, 0),
        startX: heroCenterDoc.x - baseCenter.x,
        startY: heroCenterDoc.y - baseCenter.y,
        endX: targetCenterDoc.x - baseCenter.x,
        endY: 0,
        startScale: desktop.matches ? 1 : 0.92,
        endScale: desktop.matches ? endScale : 0.92,
        startRotation: 0,
        endRotation: 0,
        startRotationY: 0,
        endRotationY: 360,
        startOpacity: 0.96,
        endOpacity: 1
      };
    };

    // Position and size follow the (already smoothed) scroll exactly. Easing
    // them a second time made the garment lag behind the page and slide in
    // size as the user scrolled; only opacity is eased.
    const quick = {
      x: (v) => gsap.set(garmentEl, { x: v }),
      y: (v) => gsap.set(garmentEl, { y: v }),
      rotation: (v) => gsap.set(garmentEl, { rotation: v }),
      scale: (v) => gsap.set(garmentEl, { scale: v }),
      opacity: gsap.quickTo(garmentEl, 'opacity', { duration: 0.12, ease: 'power2.out' })
    };

    const setDocked = (value) => {
      docked = value;
      dockEl.classList.toggle('is-active', value);
      garmentEl.classList.toggle('is-docked-hidden', value);
      modelStateRef.current.rotationY = value ? 360 : 0;
    };

    const render = () => {
      if (!metrics) readMetrics();

      const scrollY = window.scrollY || window.pageYOffset || 0;

      if (scrollY >= metrics.endScroll) {
        if (!docked) {
          setDocked(true);
          quick.opacity(0);
        }
        return;
      }

      if (docked && scrollY < metrics.endScroll - 48) {
        setDocked(false);
        quick.opacity(metrics.startOpacity);
      }

      if (docked) return;

      const rawProgress = metrics.endScroll <= 0 ? 1 : clamp(scrollY / metrics.endScroll, 0, 1);
      const progress = smoothStep(rawProgress);

      quick.x(interpolate(metrics.startX, metrics.endX, progress));
      quick.y(interpolate(metrics.startY, metrics.endY, progress));
      quick.rotation(interpolate(metrics.startRotation, metrics.endRotation, progress));
      quick.scale(interpolate(metrics.startScale, metrics.endScale, progress));
      quick.opacity(interpolate(metrics.startOpacity, metrics.endOpacity, progress));
      modelStateRef.current.rotationY = interpolate(metrics.startRotationY, metrics.endRotationY, progress);
    };

    // Run synchronously inside the scroll event: Lenis fires it from the gsap
    // ticker, so the DOM transform lands in the same frame as the page itself.
    const requestRender = () => {
      render();
      modelStateRef.current.wake?.();
    };

    // first frames after mount, in case no scroll event arrives yet
    let warm = 6;
    const wakeOnce = () => {
      modelStateRef.current.wake?.();
      if (--warm <= 0) gsap.ticker.remove(wakeOnce);
    };

    const onResize = () => {
      readMetrics();
      requestRender();
    };

    readMetrics();

    let lastHeight = document.documentElement.scrollHeight;
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          const h = document.documentElement.scrollHeight;
          if (h === lastHeight) return;
          lastHeight = h;
          readMetrics();
          requestRender();
        });
    resizeObserver?.observe(document.body);

    if (reduced.matches) {
      quick.x(metrics.startX);
      quick.y(metrics.startY);
      quick.rotation(0);
      quick.scale(metrics.startScale);
      quick.opacity(0.95);
      modelStateRef.current.rotationY = 0;
    } else {
      window.addEventListener('scroll', requestRender, { passive: true });
      gsap.ticker.add(wakeOnce);
      window.addEventListener('resize', onResize, { passive: true });
      desktop.addEventListener('change', onResize);
      render();
    }

    return () => {
      window.removeEventListener('scroll', requestRender);
      gsap.ticker.remove(wakeOnce);
      window.removeEventListener('resize', onResize);
      desktop.removeEventListener('change', onResize);
      resizeObserver?.disconnect();
    };
  }, [isDesktop]);

  return (
    <div className="home__garment" aria-hidden="true">
      <div className="home__garment-float" ref={garmentRef}>
        <div className="home__garment-pointer">
          <div className="home__garment-visual">
            {isDesktop ? (
              <ShalwarKameezCanvas stateRef={modelStateRef} className="home__garment-canvas" />
            ) : (
              <picture className="home__garment-picture">
                <source media="(max-width: 720px)" srcSet="/garments/shalwar-kameez-mobile.webp" />
                <img
                  className="home__garment-image"
                  src="/garments/shalwar-kameez.webp"
                  alt=""
                  width="984"
                  height="1492"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
