import { useEffect, useRef } from 'react';

const locks = new Set();
const dialogs = [];

export function useScrollLock(open) {
  const token = useRef(Symbol('scroll-lock'));
  useEffect(() => {
    if (!open) return undefined;
    const id = token.current;
    locks.add(id);
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    return () => {
      locks.delete(id);
      if (!locks.size) {
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
      }
    };
  }, [open]);
}

/* Keep focus and scrolling inside the active sheet, then return to its trigger. */
export default function useDialog(open, onClose, initialFocus) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const token = Symbol('dialog');
    dialogs.push(token);
    const previous = document.activeElement;
    const controls = () => [...(ref.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') || [])]
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
    const frame = requestAnimationFrame(() => {
      (initialFocus?.current || controls()[0] || ref.current)?.focus({ preventScroll: true });
    });
    const onKey = event => {
      if (dialogs[dialogs.length - 1] !== token) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const list = controls();
      if (!list.length) { event.preventDefault(); ref.current?.focus(); return; }
      const first = list[0], last = list[list.length - 1];
      if (event.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      dialogs.splice(dialogs.indexOf(token), 1);
      if (previous?.isConnected && !dialogs.length) previous.focus({ preventScroll: true });
    };
  }, [open, initialFocus]);
  return ref;
}
