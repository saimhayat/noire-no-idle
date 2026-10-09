import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { SIZE_COLS, chartFor, sizeRows } from '../data/sizes.js';
import useDialog from '../hooks/useDialog.js';

/* The default chart is the shirt one — every other department passes its own, so
   a boot never gets a chest measurement. The table stays a table: this is
   genuinely tabular information. */
const DEFAULT_CHART = { cols: SIZE_COLS, rows: sizeRows, caption: 'Centimetres, measured flat on the garment', notes: [] };

export function SizeTable({ chart = DEFAULT_CHART }) {
  return (
    <>
    <div className="table-scroll" role="region" aria-label={chart.title || 'Size measurements'} tabIndex={0}>
    <table className="specs specs--size">
      <caption className="specs__caption">{chart.caption}</caption>
      <thead>
        <tr>
          <th scope="col">Size</th>
          {chart.cols.map((c) => <th key={c} scope="col">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {chart.rows.map((r) => (
          <tr key={r.size}>
            <th scope="row">{r.size}</th>
            {chart.cols.map((c) => <td key={c} className="specs__num">{r[c]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    <p className="table-scroll__hint">Swipe sideways to see all measurements.</p>
    </>
  );
}

function Notes({ notes }) {
  if (!notes?.length) return null;
  return (
    <dl className="facts facts--tight">
      {notes.map((f) => (
        <div className="facts__row" key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>
      ))}
    </dl>
  );
}

/* The chart as a sheet, opened from a product page so the fit question is
   answered where it is asked. */
export default function SizeGuide({ open, onClose, chart, department }) {
  const still = useReducedMotion();
  const table = chart || chartFor(department) || DEFAULT_CHART;

  const dialog = useDialog(open, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" data-lenis-prevent onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={dialog}
            tabIndex={-1}
            data-lenis-prevent
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={table.title || 'Size guide'}
            initial={still ? false : { opacity: 0, y: '-45%', x: '-50%' }}
            animate={{ opacity: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, y: '-45%', x: '-50%' }}
            transition={{ duration: still ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="sheet__head">
              <h2 className="sheet__title">{table.title || 'Size guide'}</h2>
              <button type="button" onClick={onClose} aria-label="Close size guide">Close</button>
            </header>
            <div className="sheet__body">
              <SizeTable chart={table} />
              <Notes notes={table.notes} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>, document.body
  );
}
