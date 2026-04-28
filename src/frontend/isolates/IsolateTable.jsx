import { Link } from 'react-router-dom';
import { DnaIcon, MapIcon } from './illustrations';
import PhotoHoverIcon from './PhotoHoverIcon';

// Only crudcrate-sortable flat columns show a sort affordance.
// Widths are explicit so the table doesn't reflow when the sort changes.
const COLUMNS = [
  { key: 'name',                      label: 'Name',     sortable: true,  width: '18%'  },
  { key: 'taxonomy',                  label: 'Taxonomy', sortable: true,  width: '22%'  },
  { key: 'habitat',                   label: 'Habitat',  sortable: false, width: '10%'  },
  { key: 'site',                      label: 'Site',     sortable: false, width: '22%'  },
  { key: 'temperature_of_isolation',  label: 'T°C',      sortable: true,  width: '7%'   },
  { key: 'media_used_for_isolation',  label: 'Media',    sortable: true,  width: '13%'  },
  { key: 'flags',                     label: '',         sortable: false, width: '112px' },
];

export default function IsolateTable({ isolates, enrichment, onOpen, sortField, sortOrder, onSort, total, pageSize, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  return (
    <div className="isodir-results isodir-results-table">
    <div className="isodir-table-wrap">
      <table className="isodir-table">
        <colgroup>
          {COLUMNS.map(col => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(col => {
              const isSorted = col.sortable && sortField === col.key;
              const nextOrder = isSorted && sortOrder === 'ASC' ? 'DESC' : 'ASC';
              return (
                <th key={col.key} className={isSorted ? 'is-sorted' : ''}>
                  {col.sortable ? (
                    <button
                      type="button"
                      className="isodir-table-sort"
                      onClick={() => onSort(col.key, nextOrder)}
                    >
                      {col.label}
                      {isSorted ? (sortOrder === 'ASC' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isolates.map(iso => {
            const rep = enrichment.fieldRecords[iso.field_record_id];
            const site = rep ? enrichment.sites[rep.site_id] : null;
            const area = site?.area_id ? enrichment.areas[site.area_id] : null;
            return (
              <tr
                key={iso.id}
                onClick={() => onOpen(iso)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen(iso); } }}
              >
                <td className="isodir-table-name" title={iso.name}>{iso.name}</td>
                <td className="isodir-table-tax" title={iso.taxonomy || ''}>
                  {iso.taxonomy || <span className="isodir-muted">Unidentified</span>}
                </td>
                <td>{rep?.sample_type || '—'}</td>
                <td title={site?.name ? `${site.name}${area?.name ? ' · ' + area.name : ''}` : ''}>
                  {site?.name ? (
                    <>
                      {site.name}
                      {area?.name && <span className="isodir-muted"> · {area.name}</span>}
                    </>
                  ) : '—'}
                </td>
                <td>{iso.temperature_of_isolation ?? '—'}</td>
                <td title={iso.media_used_for_isolation || ''}>{iso.media_used_for_isolation || '—'}</td>
                <td className="isodir-table-flags">
                  <PhotoHoverIcon isolate={iso} size={15} />
                  {iso.genome_url && (
                    <a href={iso.genome_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Genome">
                      <DnaIcon size={15} />
                    </a>
                  )}
                  {site?.id && (
                    <Link
                      to={`/?focus_site=${site.id}&field_record=${rep.id}&isolate=${iso.id}&from=isolates`}
                      className="isodir-table-mapbtn"
                      onClick={(e) => e.stopPropagation()}
                      title="View on map"
                      aria-label="View on map"
                    >
                      <MapIcon size={15} />
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {total > pageSize && (
      <div className="isodir-pager">
        <button type="button" className="isodir-pager-btn" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>← Prev</button>
        <span className="isodir-pager-info">{start + 1}–{start + isolates.length} of {total}</span>
        <button type="button" className="isodir-pager-btn" disabled={current >= totalPages} onClick={() => onPageChange(current + 1)}>Next →</button>
      </div>
    )}
    </div>
  );
}
