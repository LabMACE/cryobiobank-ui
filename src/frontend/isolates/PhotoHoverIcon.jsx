import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CameraIcon } from './illustrations';

// Per-session in-memory cache of fetched photos, keyed by isolate id. Prevents
// re-fetching on re-hover and lets the preview feel instant after the first load.
const photoCache = new Map();

const GAP = 8;
const EDGE_MARGIN = 8;

export default function PhotoHoverIcon({ isolate, size = 15 }) {
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [photo, setPhoto] = useState(() => photoCache.get(isolate.id) ?? null);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(null);
  const fetchedRef = useRef(photoCache.has(isolate.id));
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const measure = useCallback(() => {
    const trig = triggerRef.current?.getBoundingClientRect();
    const pop = popupRef.current?.getBoundingClientRect();
    if (!trig || !pop) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer above center
    let top = trig.top - pop.height - GAP;
    if (top < EDGE_MARGIN) top = trig.bottom + GAP;
    if (top + pop.height > vh - EDGE_MARGIN) {
      top = Math.max(EDGE_MARGIN, vh - EDGE_MARGIN - pop.height);
    }

    let left = trig.left + trig.width / 2 - pop.width / 2;
    if (left < EDGE_MARGIN) left = EDGE_MARGIN;
    if (left + pop.width > vw - EDGE_MARGIN) {
      left = vw - EDGE_MARGIN - pop.width;
    }

    setPos({ top, left });
  }, []);

  // Position the popup in viewport space. Re-run on hover, on photo load
  // (image changes the popup size), on resize, and on any scroll event in
  // the tree (capture phase catches nested scroll containers like the
  // isolates body and the table wrap).
  useLayoutEffect(() => {
    if (!hover || !triggerRef.current || !popupRef.current) return;
    measure();
    // ResizeObserver re-measures when the popup itself grows (image load
    // adds intrinsic dimensions that getBoundingClientRect reflects on the
    // next frame).
    const ro = new ResizeObserver(() => measure());
    ro.observe(popupRef.current);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [hover, photo, loading, measure]);

  if (!isolate?.has_photo) return null;

  const startFetch = () => {
    if (fetchedRef.current || loading) return;
    fetchedRef.current = true;
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    fetch(`/api/isolates/${isolate.id}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const p = data?.photo ?? null;
        if (p) photoCache.set(isolate.id, p);
        setPhoto(p);
      })
      .catch(() => { fetchedRef.current = false; })
      .finally(() => setLoading(false));
  };

  // Hidden (visibility + opacity 0) for first render so we can measure size,
  // then the useLayoutEffect sets `pos` and we flip to visible.
  const popupStyle = pos
    ? { top: `${pos.top}px`, left: `${pos.left}px`, visibility: 'visible', opacity: 1 }
    : { top: 0, left: 0, visibility: 'hidden', opacity: 0 };

  return (
    <span
      className="isodir-photo-hover"
      ref={triggerRef}
      onMouseEnter={(e) => { e.stopPropagation(); setHover(true); startFetch(); }}
      onMouseLeave={() => { setHover(false); setPos(null); }}
    >
      <span className="isodir-flag" title="Photo available">
        <CameraIcon size={size} />
      </span>

      {hover && (
        <span
          ref={popupRef}
          className="isodir-photo-hover-pop"
          role="img"
          aria-label={`Photo of ${isolate.name}`}
          style={popupStyle}
        >
          {loading && !photo ? (
            <span className="isodir-photo-hover-spinner" aria-hidden="true" />
          ) : photo ? (
            <img src={photo} alt={isolate.name} onLoad={measure} />
          ) : null}
        </span>
      )}
    </span>
  );
}
