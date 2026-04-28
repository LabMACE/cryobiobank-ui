import { useState, useEffect, useMemo } from 'react';

const productTabs = [
  {
    key: 'isolates',
    label: 'Isolates',
    columns: ['Name', 'Taxonomy', 'Type', 'Temp (°C)', 'Media', 'Genome'],
    row: (item, onItemClick, selectedItemId, contextType) => (
      <tr key={item.id} onClick={() => onItemClick?.('isolates', item.id)} className={item.id === selectedItemId ? 'selected' : ''}>
        <td>{item.name}</td>
        <td className="taxonomy">{item.taxonomy || '—'}</td>
        <td>{contextType || '—'}</td>
        <td>{item.temperature_of_isolation ?? '—'}</td>
        <td>{item.media_used_for_isolation || '—'}</td>
        <td>
          {item.genome_url ? (
            <a href={item.genome_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Link</a>
          ) : '—'}
        </td>
      </tr>
    ),
  },
  {
    key: 'samples',
    label: 'Samples',
    columns: ['Name', 'Type', 'Availability'],
    row: (item, onItemClick, selectedItemId, contextType) => (
      <tr key={item.id} onClick={() => onItemClick?.('samples', item.id)} className={item.id === selectedItemId ? 'selected' : ''}>
        <td>{item.name}</td>
        <td>{contextType || '—'}</td>
        <td>{item.is_available ? 'In stock' : 'Depleted'}</td>
      </tr>
    ),
  },
  {
    key: 'dna',
    label: 'DNA',
    columns: ['Name', 'Type', 'Description'],
    row: (item, onItemClick, selectedItemId, contextType) => (
      <tr key={item.id} onClick={() => onItemClick?.('dna', item.id)} className={item.id === selectedItemId ? 'selected' : ''}>
        <td>{item.name}</td>
        <td>{contextType || '—'}</td>
        <td>{item.description || '—'}</td>
      </tr>
    ),
  },
];

function productCount(rep, product) {
  if (product === 'samples') {
    return (rep.samples || []).filter(s => s.is_available).length;
  }
  return (rep[product] || []).length;
}

function byDateDesc(a, b) {
  const da = a.sampling_date || '';
  const db = b.sampling_date || '';
  if (da === db) return 0;
  return db.localeCompare(da);
}

function FieldRecordList({ site, sampleTypeFilter, productFilter, onReplicateClick, onReplicateInfo }) {
  const typeActive = sampleTypeFilter !== 'All';
  const productActive = productFilter !== 'All';
  const productKey = productActive ? productFilter.toLowerCase() : null;

  const replicates = useMemo(() => {
    const reps = [...(site?.replicates || [])];
    return reps.sort((a, b) => {
      // Type match wins first when sample_type filter is active
      if (typeActive) {
        const ma = a.sample_type === sampleTypeFilter ? 0 : 1;
        const mb = b.sample_type === sampleTypeFilter ? 0 : 1;
        if (ma !== mb) return ma - mb;
      }
      // Then product count desc when product filter is active
      if (productActive) {
        const delta = productCount(b, productKey) - productCount(a, productKey);
        if (delta !== 0) return delta;
      }
      // Tie-break on date desc
      return byDateDesc(a, b);
    });
  }, [site, sampleTypeFilter, productFilter, typeActive, productActive, productKey]);

  if (!replicates.length) return <p className="data-panel-empty">No field records.</p>;

  const colType = typeActive ? 'highlight' : '';
  const colIso = productKey === 'isolates' ? 'highlight' : '';
  const colSam = productKey === 'samples' ? 'highlight' : '';
  const colDna = productKey === 'dna' ? 'highlight' : '';

  return (
    <table className="data-panel-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
          <th className={colType}>Type</th>
          <th className={colIso}>Isolates</th>
          <th className={colSam}>Samples</th>
          <th className={colDna}>DNA</th>
        </tr>
      </thead>
      <tbody>
        {replicates.map(rep => {
          const typeMismatch = typeActive && rep.sample_type !== sampleTypeFilter;
          const productMismatch = productActive && productCount(rep, productKey) === 0;
          const dim = typeMismatch || productMismatch;
          return (
            <tr
              key={rep.id}
              onClick={() => {
                onReplicateClick(rep.id);
                onReplicateInfo?.(rep.id);
              }}
              className={dim ? 'dim' : ''}
            >
              <td>{rep.name}</td>
              <td>{rep.sampling_date || '—'}</td>
              <td className={colType}>{rep.sample_type || '—'}</td>
              <td className={colIso}>{(rep.isolates || []).length}</td>
              <td className={colSam}>
                {(rep.samples || []).filter(s => s.is_available).length}
              </td>
              <td className={colDna}>{(rep.dna || []).length}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ReplicateProducts({ replicateData, onItemClick, selectedItemId }) {
  const [activeTab, setActiveTab] = useState('isolates');

  useEffect(() => {
    if (!replicateData) return;
    const firstWithData = productTabs.find(t => (replicateData[t.key] || []).length > 0);
    setActiveTab(firstWithData ? firstWithData.key : 'isolates');
  }, [replicateData]);

  const activeTabDef = productTabs.find(t => t.key === activeTab);
  const items = replicateData?.[activeTab] || [];
  const metagenomeUrl = replicateData?.metagenome_url;

  return (
    <>
      <div className="data-panel-tabs">
        {productTabs.map((tab) => {
          const count = (replicateData?.[tab.key] || []).length;
          return (
            <button
              key={tab.key}
              className={`data-panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} <span className="data-panel-count-badge">{count}</span>
            </button>
          );
        })}
      </div>
      {activeTab === 'dna' && metagenomeUrl && (
        <div className="data-panel-tab-header">
          <span>Metagenome:</span>{' '}
          <a href={metagenomeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {metagenomeUrl}
          </a>
        </div>
      )}
      <div className="data-panel-body">
        {items.length === 0 ? (
          <p className="data-panel-empty">No {activeTabDef?.key === 'dna' ? 'DNA' : activeTabDef?.label.toLowerCase()}</p>
        ) : (
          <table className="data-panel-table">
            <thead>
              <tr>
                {activeTabDef.columns.map((col) => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => activeTabDef.row(item, onItemClick, selectedItemId, replicateData?.sample_type))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function DataPanel({
  view,
  activeSite,
  activeReplicateId,
  replicateData,
  sampleTypeFilter,
  productFilter,
  onReplicateClick,
  onReplicateInfo,
  onBackToSite,
  onClose,
  loading,
  onItemClick,
  selectedItemId,
}) {
  const activeReplicate = activeSite?.replicates?.find(r => r.id === activeReplicateId);

  return (
    <div className="overlay-chart data-panel">
      <button className="data-panel-close" onClick={onClose}>&times;</button>
      <div className="data-panel-content">
        {view === 'site' && activeSite && (() => {
          const total = activeSite.replicates.length;
          const matching = activeSite.replicates.filter(r => {
            if (sampleTypeFilter !== 'All' && r.sample_type !== sampleTypeFilter) return false;
            if (productFilter !== 'All') {
              const key = productFilter.toLowerCase();
              if (key === 'samples') {
                if (!(r.samples || []).some(s => s.is_available)) return false;
              } else if (((r[key] || []).length) === 0) return false;
            }
            return true;
          }).length;
          const filterActive = sampleTypeFilter !== 'All' || productFilter !== 'All';
          return (
            <>
              <div className="data-panel-heading">
                <h3>{activeSite.name}</h3>
                <span className="data-panel-subtle">
                  {filterActive
                    ? `${matching} matching / ${total} total`
                    : `${total} field record${total === 1 ? '' : 's'}`}
                </span>
              </div>
              <div className="data-panel-body">
                <FieldRecordList
                  site={activeSite}
                  sampleTypeFilter={sampleTypeFilter}
                  productFilter={productFilter}
                  onReplicateClick={onReplicateClick}
                  onReplicateInfo={onReplicateInfo}
                />
              </div>
            </>
          );
        })()}

        {view === 'replicate' && (
          <>
            <div className="data-panel-heading">
              <button className="data-panel-back" onClick={onBackToSite}>
                ← {activeSite?.name || 'site'}
              </button>
              <h3>{activeReplicate?.name || 'Field Record'}</h3>
              {activeReplicate?.sampling_date && (
                <span className="data-panel-subtle">{activeReplicate.sampling_date}</span>
              )}
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ReplicateProducts
                replicateData={replicateData}
                onItemClick={onItemClick}
                selectedItemId={selectedItemId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
