import { useEffect, useRef, useState } from 'react';

// Lookup tables for client-side enrichment (site name, area name, map link
// target). Fetched once on mount from the existing crudcrate endpoints.
// The Snow/Soil filter resolves to a server-side `site_replicate_id IN (…)`
// filter using these replicates — crudcrate handles the pagination natively.
export function useEnrichmentLookups() {
  const [replicates, setReplicates] = useState({});
  const [sites, setSites] = useState({});
  const [areas, setAreas] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/site_replicates?range=[0,9999]').then(r => r.ok ? r.json() : []),
      fetch('/api/sites?range=[0,9999]').then(r => r.ok ? r.json() : []),
      fetch('/api/areas?range=[0,9999]').then(r => r.ok ? r.json() : []),
    ])
      .then(([rep, site, area]) => {
        setReplicates(Object.fromEntries((rep || []).map(r => [r.id, r])));
        setSites(Object.fromEntries((site || []).map(s => [s.id, s])));
        setAreas(Object.fromEntries((area || []).map(a => [a.id, a])));
      })
      .catch(() => { /* non-fatal — cards just lack site/area labels */ })
      .finally(() => setLoaded(true));
  }, []);

  return { replicates, sites, areas, loaded };
}

// Parse "isolates 0-23/456" → 456.
function parseContentRange(header) {
  if (!header) return null;
  const match = /\w+\s+(\d+)-(\d+)\/(\d+)/.exec(header);
  if (!match) return null;
  return +match[3];
}

// Build the crudcrate-native query string (range=, sort=, filter=).
function buildQueryString({ q, sort, page, pageSize, replicateIds }) {
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize - 1;

  const filter = {};
  if (q) filter.q = q;
  if (replicateIds && replicateIds.length > 0) {
    filter.site_replicate_id = replicateIds;
  }

  const params = new URLSearchParams({
    filter: JSON.stringify(filter),
    range: JSON.stringify([start, end]),
    sort: JSON.stringify(sort),
  });
  return params.toString();
}

export function useIsolatesList({ q, sort, page, pageSize, replicateIds, skip }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const queryKey = buildQueryString({ q, sort, page, pageSize, replicateIds });
  // crudcrate omits the Content-Range header when no Range request header is
  // provided; pass it explicitly so we get a usable total.
  const rangeHeader = `isolates=${(page - 1) * pageSize}-${(page - 1) * pageSize + pageSize - 1}`;

  useEffect(() => {
    if (skip) {
      setLoading(false);
      setItems([]);
      setTotal(0);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    fetch(`/api/isolates?${queryKey}`, {
      signal: ctrl.signal,
      headers: { Range: rangeHeader },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const totalFromHeader = parseContentRange(r.headers.get('Content-Range'));
        setItems(Array.isArray(data) ? data : []);
        setTotal(totalFromHeader ?? (Array.isArray(data) ? data.length : 0));
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err); })
      .finally(() => { if (abortRef.current === ctrl) setLoading(false); });

    return () => ctrl.abort();
  }, [queryKey, rangeHeader, skip]);

  return { items, total, loading, error };
}
