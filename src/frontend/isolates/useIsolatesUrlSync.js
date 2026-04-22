import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Minimal state for the simplified isolate directory:
// - q: free-text search (maps to crudcrate `filter={"q":"…"}`)
// - sortField, sortOrder: maps to crudcrate `sort=[field, order]`
// - view: cards | table
// - page: 1-indexed
// - focus: optional isolate id for the detail side panel
export const DEFAULT_SORT = Object.freeze({ field: 'name', order: 'ASC' });

export function useIsolatesUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const rawHabitat = searchParams.get('habitat');
    const habitat = rawHabitat === 'Snow' || rawHabitat === 'Soil' ? rawHabitat : 'All';
    return {
      q: searchParams.get('q') ?? '',
      habitat,
      sortField: searchParams.get('sort_field') ?? DEFAULT_SORT.field,
      sortOrder: (searchParams.get('sort_order') === 'DESC' ? 'DESC' : 'ASC'),
      view: searchParams.get('view') === 'table' ? 'table' : 'cards',
      page: Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1),
    };
  }, [searchParams]);

  const focus = searchParams.get('focus') || null;

  const writeParams = useCallback((next, resetPage) => {
    setSearchParams((prev) => {
      const out = new URLSearchParams(prev);
      const set = (key, value, def) => {
        if (value === def || value == null || value === '') out.delete(key);
        else out.set(key, value);
      };
      const s = { ...state, ...next };
      if (resetPage) s.page = 1;
      set('q', s.q, '');
      set('habitat', s.habitat === 'All' ? '' : s.habitat, '');
      set('sort_field', s.sortField === DEFAULT_SORT.field ? '' : s.sortField, '');
      set('sort_order', s.sortOrder === DEFAULT_SORT.order ? '' : s.sortOrder, '');
      set('view', s.view === 'cards' ? '' : s.view, '');
      set('page', s.page === 1 ? '' : String(s.page), '');
      // focus is managed separately so filter changes don't clear it.
      return out;
    });
  }, [setSearchParams, state]);

  const setQ = useCallback((q) => writeParams({ q }, true), [writeParams]);
  const setHabitat = useCallback((habitat) => writeParams({ habitat }, true), [writeParams]);
  const setSort = useCallback((field, order) => writeParams({ sortField: field, sortOrder: order }, true), [writeParams]);
  const setView = useCallback((view) => writeParams({ view }), [writeParams]);
  const setPage = useCallback((page) => writeParams({ page }), [writeParams]);

  const setFocus = useCallback((id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set('focus', id);
      else next.delete('focus');
      return next;
    });
  }, [setSearchParams]);

  return { state, focus, setQ, setHabitat, setSort, setView, setPage, setFocus };
}
