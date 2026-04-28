import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import DetailSidePanel from '../DetailSidePanel';
import HeroStrip from './HeroStrip';
import ControlsBar from './ControlsBar';
import IsolateCardGrid from './IsolateCardGrid';
import IsolateTable from './IsolateTable';
import EmptyState from './EmptyState';
import { useIsolatesList, useEnrichmentLookups } from './useIsolatesData';
import { useIsolatesUrlSync } from './useIsolatesUrlSync';
import './isolates.css';

// Cards: minmax(260px, 1fr) + 0.75rem (12px) gap → each column occupies
// ~272px of horizontal space. Card visual height (head + tax + meta + foot
// + padding) ≈ 200px with a 12px row gap.
const CARD_COLUMN_STRIDE = 272;
const CARD_ROW_STRIDE = 212;

// Table: thead + body rows. Budgets are a touch larger than the actual
// rendered rows to leave a small gap; previous rounds landed 2 under or 2
// over — this pair sits between them.
const TABLE_HEADER_HEIGHT = 30;
const TABLE_ROW_HEIGHT = 36;

// Reserved for pager + top/bottom padding of the body.
const PAGER_RESERVE = 72;

const MIN_PAGE_SIZE = 4;
const MAX_PAGE_SIZE = 60;

export default function IsolatesSection({ sectionsRef, index }) {
  const { state, focus, setQ, setHabitat, setSort, setView, setPage, setFocus } = useIsolatesUrlSync();

  // Debounced q for the crudcrate filter query
  const [qDraft, setQDraft] = useState(state.q);
  const qDebounceRef = useRef(null);
  useEffect(() => { setQDraft(state.q); }, [state.q]);

  // Dynamic page size: recompute from the body's rendered dimensions so cards
  // / table rows always fit in one page without the body having to scroll.
  const bodyRef = useRef(null);
  const [pageSize, setPageSize] = useState(24);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const computeSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      const usableH = Math.max(0, h - PAGER_RESERVE);
      let next;
      if (state.view === 'table') {
        const rows = Math.floor((usableH - TABLE_HEADER_HEIGHT) / TABLE_ROW_HEIGHT);
        next = Math.max(MIN_PAGE_SIZE, rows);
      } else {
        const cols = Math.max(1, Math.floor(w / CARD_COLUMN_STRIDE));
        const rows = Math.max(1, Math.floor(usableH / CARD_ROW_STRIDE));
        next = cols * rows;
      }
      next = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, next));
      setPageSize((prev) => (prev === next ? prev : next));
    };
    computeSize();
    const ro = new ResizeObserver(computeSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.view]);

  const handleChangeQ = useCallback((value) => {
    setQDraft(value);
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current);
    qDebounceRef.current = setTimeout(() => setQ(value), 220);
  }, [setQ]);

  const enrichment = useEnrichmentLookups();

  // Translate habitat chip → server-side `field_record_id IN (…)` filter via
  // the loaded field records lookup. Hold off on the list fetch until lookups land
  // to avoid a flash of unfiltered results when the user arrives with
  // ?habitat=Snow in the URL.
  const fieldRecordIds = useMemo(() => {
    if (state.habitat === 'All') return undefined;
    return Object.values(enrichment.fieldRecords)
      .filter(r => r.sample_type === state.habitat)
      .map(r => r.id);
  }, [state.habitat, enrichment.fieldRecords]);

  const waitingForHabitat = state.habitat !== 'All' && !enrichment.loaded;

  const { items, total, loading, error } = useIsolatesList({
    q: state.q,
    sort: [state.sortField, state.sortOrder],
    page: state.page,
    pageSize,
    fieldRecordIds,
    skip: waitingForHabitat,
  });

  const handleOpen = useCallback((iso) => setFocus(iso.id), [setFocus]);
  const handleCloseDetail = useCallback(() => setFocus(null), [setFocus]);

  const focused = useMemo(
    () => (focus ? items.find(i => i.id === focus) : null),
    [focus, items]
  );
  const focusedHabitat = focused && enrichment.fieldRecords[focused.field_record_id]?.sample_type;

  return (
    <section
      className="section isolates-section"
      data-section="isolates"
      ref={(el) => (sectionsRef.current[index] = el)}
    >
      <div className="isodir-main">
        <HeroStrip total={loading ? null : total} />

        <div className="isodir-toolbar">
          <ControlsBar
            q={qDraft}
            onChangeQ={handleChangeQ}
            habitat={state.habitat}
            onChangeHabitat={setHabitat}
            sortField={state.sortField}
            sortOrder={state.sortOrder}
            onChangeSort={setSort}
            view={state.view}
            onChangeView={setView}
          />
        </div>

        <div className="isodir-body" ref={bodyRef}>
          {error && <div className="isodir-error" role="alert">Could not load isolates.</div>}
          {loading && items.length === 0 ? (
            <EmptyState variant="loading" />
          ) : total === 0 && !state.q ? (
            <EmptyState variant="no-data" />
          ) : items.length === 0 ? (
            <EmptyState variant="filtered" />
          ) : state.view === 'table' ? (
            <IsolateTable
              isolates={items}
              enrichment={enrichment}
              onOpen={handleOpen}
              sortField={state.sortField}
              sortOrder={state.sortOrder}
              onSort={setSort}
              total={total}
              pageSize={pageSize}
              page={state.page}
              onPageChange={setPage}
            />
          ) : (
            <IsolateCardGrid
              isolates={items}
              enrichment={enrichment}
              total={total}
              pageSize={pageSize}
              page={state.page}
              onPageChange={setPage}
              onOpen={handleOpen}
            />
          )}
        </div>
      </div>

      {focus && (
        <DetailSidePanel
          type="isolates"
          itemId={focus}
          contextSampleType={focusedHabitat}
          onClose={handleCloseDetail}
        />
      )}
    </section>
  );
}
