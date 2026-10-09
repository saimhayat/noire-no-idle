import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LINK, STACK } from '../lib/motion.js';
import { DEPARTMENTS, bestSellers, products } from '../data/products.js';
import { clothByKey } from '../data/cloth.js';
import { money } from '../lib/format.js';
import useDialog from '../hooks/useDialog.js';

const HINTS = ['Kurta', 'Kameez & Trouser', 'Juttis', 'Bags', 'Under Rs. 5,000'];
const SUGGESTED = bestSellers(4);

/* Search, as a sheet rather than a field in the corner: results need a page,
   and a shop of this size does not need a page of its own for it.
   Opens from the nav, from `/` anywhere on the site, and takes the arrow keys
   from there. */
export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const field = useRef(null);
  const still = useReducedMotion();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const dialog = useDialog(open, onClose, field);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        const cloth = p.cloth ? clothByKey(p.cloth).label : p.material;
        return [p.name, p.brand, p.category, p.department, cloth].join(' ').toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(0, Math.min(results.length - 1, c + (e.key === 'ArrowDown' ? 1 : -1))));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, onClose]);

  const go = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const pickHint = (h) => {
    if (h === 'Under Rs. 5,000') { onClose(); navigate('/shop?max=5000'); return; }
    setQuery(h === '' ? '' : h);
    setCursor(0);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" data-lenis-prevent onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={dialog}
            tabIndex={-1}
            data-lenis-prevent
            className="search"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={still ? false : { opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: still ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="search__bar">
              <label className="search__label" htmlFor="site-search">Search the collection</label>
              <input
                id="site-search"
                ref={field}
                className="search__input"
                type="search"
                value={query}
                autoComplete="off"
                onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results[cursor]) go(results[cursor].slug);
                }}
                placeholder="Try “lawn”, “kurta”, “juttis”, “women”…"
              />
              <button type="button" className="search__close" onClick={onClose} aria-label="Close search">Close</button>
            </div>

            {results.length > 0 && (
              <motion.ul
                className="search__results"
                variants={STACK(0.03, 0.02)}
                initial="hidden"
                animate="show"
              >
                {results.map((p, i) => (
                  <motion.li key={p.id} variants={LINK}>
                    <button
                      type="button"
                      className={`hit ${i === cursor ? 'is-cursor' : ''}`}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(p.slug)}
                    >
                      <img src={p.image} alt="" width="72" height="90" loading="lazy" />
                      <span className="hit__name">{p.name}</span>
                      <span className="hit__meta">{p.brand} · {p.category}</span>
                      <span className="hit__price">{money(p.price)}</span>
                      {/* the plate the arrow keys move: it slides from row to row
                          rather than blinking between them. The `.is-cursor`
                          background underneath is what a reduced-motion visitor
                          sees, so the row is marked either way. */}
                      {!still && i === cursor && (
                        <motion.span
                          className="hit__cursor"
                          layoutId="search-cursor"
                          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {query.trim() === '' && (
              <div className="search__empty">
                <p className="search__hint">Popular</p>
                <div className="search__hints">
                  {HINTS.map((h) => (
                    <button key={h} type="button" className="chip" onClick={() => pickHint(h)}>{h}</button>
                  ))}
                </div>
                <p className="search__hint">Or shop by department</p>
                <div className="search__hints">
                  {DEPARTMENTS.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      className="chip"
                      onClick={() => { onClose(); navigate(d.to); }}
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
                <p className="search__hint">Explore the edit</p>
                <div className="search__hints">
                  {SUGGESTED.map((p) => (
                    <button key={p.id} type="button" className="chip" onClick={() => go(p.slug)}>{p.brand}</button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() !== '' && results.length === 0 && (
              <p className="drawer__empty">Nothing matches “{query.trim()}”. Try a cloth — lawn, khaddar, velvet — or a house, or a department.</p>
            )}

            <p className="search__foot"><span className="search__foot-keys">Enter to open · ↑↓ to move · Esc to close</span><span className="search__foot-touch">Tap a result to view the piece.</span></p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
