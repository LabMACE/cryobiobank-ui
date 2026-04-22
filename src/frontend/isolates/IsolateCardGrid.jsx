import IsolateCard from './IsolateCard';

export default function IsolateCardGrid({ isolates, enrichment, total, pageSize, page, onPageChange, onOpen }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;

  return (
    <div className="isodir-results isodir-results-cards">
      <div className="isodir-card-grid">
        {isolates.map(iso => (
          <IsolateCard key={iso.id} isolate={iso} enrichment={enrichment} onOpen={onOpen} />
        ))}
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
