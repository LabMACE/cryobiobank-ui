import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DetailSidePanel from './DetailSidePanel';

const typeOptions = ['All', 'Snow', 'Soil'];

export default function IsolatesPage() {
  const [isolates, setIsolates] = useState([]);
  const [replicates, setReplicates] = useState([]);
  const [sites, setSites] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [hasGenomeOnly, setHasGenomeOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/isolates?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch('/api/site_replicates?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch('/api/sites?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch('/api/areas?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([isoData, repData, siteData, areaData]) => {
        setIsolates(Array.isArray(isoData) ? isoData : []);
        setReplicates(Array.isArray(repData) ? repData : []);
        setSites(Array.isArray(siteData) ? siteData : []);
        setAreas(Array.isArray(areaData) ? areaData : []);
      })
      .catch((err) => console.error('Failed to load isolates page data:', err))
      .finally(() => setLoading(false));
  }, []);

  const replicateMap = useMemo(
    () => Object.fromEntries(replicates.map(r => [r.id, r])),
    [replicates]
  );
  const siteMap = useMemo(
    () => Object.fromEntries(sites.map(s => [s.id, s])),
    [sites]
  );
  const areaMap = useMemo(
    () => Object.fromEntries(areas.map(a => [a.id, a])),
    [areas]
  );

  const enriched = useMemo(() => isolates.map(iso => {
    const rep = replicateMap[iso.site_replicate_id];
    const site = rep ? siteMap[rep.site_id] : null;
    const area = site?.area_id ? areaMap[site.area_id] : null;
    return {
      ...iso,
      sample_type: rep?.sample_type ?? null,
      site_name: site?.name ?? null,
      area_name: area?.name ?? null,
    };
  }), [isolates, replicateMap, siteMap, areaMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(iso => {
      if (typeFilter !== 'All' && iso.sample_type !== typeFilter) return false;
      if (hasGenomeOnly && !iso.genome_url) return false;
      if (q) {
        const haystack = [
          iso.name,
          iso.taxonomy,
          iso.media_used_for_isolation,
          iso.site_name,
          iso.area_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, search, typeFilter, hasGenomeOnly]);

  const handleRowClick = (iso) => {
    setSelectedItem({ id: iso.id, sample_type: iso.sample_type });
  };

  return (
    <div className="isolates-page">
      <header className="isolates-page-header">
        <Link to="/" className="isolates-back-link">← Back to Map</Link>
        <h1>Isolate Browser</h1>
      </header>

      <section className="isolates-page-intro">
        <p>
          Microbial strains isolated from Alpine snow and soil samples. Click a row
          to see details, filter by environment, search by taxonomy or media, or
          narrow the list to strains with a sequenced genome.
        </p>
      </section>

      <section className="isolates-page-controls">
        <input
          type="search"
          className="isolates-search"
          placeholder="Search name, taxonomy, media, site, area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search isolates"
        />
        <div className="mode-switch isolates-type-switch">
          {typeOptions.map(opt => (
            <button
              key={opt}
              type="button"
              className={`mode-btn ${typeFilter === opt ? 'active' : ''}`}
              onClick={() => setTypeFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <label className="isolates-toggle">
          <input
            type="checkbox"
            checked={hasGenomeOnly}
            onChange={(e) => setHasGenomeOnly(e.target.checked)}
          />
          <span>Has genome only</span>
        </label>
      </section>

      <div className="isolates-page-meta">
        {loading
          ? 'Loading…'
          : `${filtered.length} isolate${filtered.length === 1 ? '' : 's'}${filtered.length !== enriched.length ? ` of ${enriched.length}` : ''}`}
      </div>

      <div className="isolates-table-wrapper">
        <table className="isolates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Taxonomy</th>
              <th>Type</th>
              <th>Site</th>
              <th>Area</th>
              <th>Temp (°C)</th>
              <th>Media</th>
              <th>Genome</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(iso => (
              <tr
                key={iso.id}
                onClick={() => handleRowClick(iso)}
                className={selectedItem?.id === iso.id ? 'selected' : ''}
              >
                <td>{iso.name}</td>
                <td className="taxonomy">{iso.taxonomy || '—'}</td>
                <td>{iso.sample_type || '—'}</td>
                <td>{iso.site_name || '—'}</td>
                <td>{iso.area_name || '—'}</td>
                <td>{iso.temperature_of_isolation ?? '—'}</td>
                <td>{iso.media_used_for_isolation || '—'}</td>
                <td>
                  {iso.genome_url ? (
                    <a
                      href={iso.genome_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Link
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="isolates-empty">No isolates match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <DetailSidePanel
          type="isolates"
          itemId={selectedItem.id}
          contextSampleType={selectedItem.sample_type}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
