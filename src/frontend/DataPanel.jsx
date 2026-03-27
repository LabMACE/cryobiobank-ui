import { useState, useEffect } from 'react';

const tabs = [
  {
    key: 'isolates',
    label: 'Isolates',
    columns: ['Name', 'Taxonomy', 'Storage', 'Genome'],
    row: (item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.taxonomy || '—'}</td>
        <td>{item.storage_location || '—'}</td>
        <td>
          {item.genome_url ? (
            <a href={item.genome_url} target="_blank" rel="noopener noreferrer">Link</a>
          ) : '—'}
        </td>
      </tr>
    ),
  },
  {
    key: 'samples',
    label: 'Samples',
    columns: ['Name', 'Type', 'Storage'],
    row: (item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.sample_type || '—'}</td>
        <td>{item.storage_location || '—'}</td>
      </tr>
    ),
  },
  {
    key: 'dna',
    label: 'DNA',
    columns: ['Name', 'Description', 'Extraction method'],
    row: (item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.description || '—'}</td>
        <td>{item.extraction_method || '—'}</td>
      </tr>
    ),
  },
];

export default function DataPanel({ replicateData, onClose, loading }) {
  const [activeTab, setActiveTab] = useState('isolates');

  // Auto-select first tab with data when data changes
  useEffect(() => {
    if (!replicateData) return;
    const firstWithData = tabs.find(t => (replicateData[t.key] || []).length > 0);
    if (firstWithData) {
      setActiveTab(firstWithData.key);
    } else {
      setActiveTab('isolates');
    }
  }, [replicateData]);

  const activeTabDef = tabs.find(t => t.key === activeTab);
  const items = replicateData?.[activeTab] || [];

  return (
    <div className="overlay-chart data-panel">
      <button className="data-panel-close" onClick={onClose}>&times;</button>
      <div className="data-panel-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="data-panel-tabs">
              {tabs.map((tab) => {
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
            {items.length === 0 ? (
              <p className="data-panel-empty">No {activeTabDef?.label.toLowerCase()}</p>
            ) : (
              <table className="data-panel-table">
                <thead>
                  <tr>
                    {activeTabDef.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(activeTabDef.row)}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
