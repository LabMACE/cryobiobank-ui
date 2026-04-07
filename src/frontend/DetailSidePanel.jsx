import { useState, useEffect } from 'react';

const fieldConfigs = {
  isolates: {
    label: 'Isolate',
    fields: [
      { key: 'taxonomy', label: 'Taxonomy', italic: true },
      { key: 'sample_type', label: 'Sample Type', chip: true },
      { key: 'temperature_of_isolation', label: 'Temperature of Isolation', suffix: ' \u00b0C' },
      { key: 'media_used_for_isolation', label: 'Media Used' },
      { key: 'storage_location', label: 'Storage Location' },
      { key: 'genome_url', label: 'Genome', link: true },
    ],
  },
  samples: {
    label: 'Sample',
    fields: [
      { key: 'sample_type', label: 'Sample Type', chip: true },
      { key: 'storage_location', label: 'Storage Location' },
      { key: 'description', label: 'Description' },
    ],
  },
  dna: {
    label: 'DNA',
    fields: [
      { key: 'extraction_method', label: 'Extraction Method', chip: true },
      { key: 'description', label: 'Description' },
    ],
  },
};

export default function DetailSidePanel({ type, itemId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId || !type) return;
    setLoading(true);
    fetch(`/api/public/${type}/${itemId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch((err) => {
        console.error('Error fetching detail:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [type, itemId]);

  const config = fieldConfigs[type];
  if (!config) return null;

  return (
    <div className="detail-side-panel">
      <button className="detail-side-panel-close" onClick={onClose}>
        &times;
      </button>
      {loading ? (
        <p className="detail-side-panel-loading">Loading...</p>
      ) : data ? (
        <>
          <div className="detail-side-panel-header">
            <span className="detail-side-panel-type">{config.label}</span>
            <h3 className="detail-side-panel-name">{data.name}</h3>
          </div>
          <div className="detail-side-panel-fields">
            {config.fields.map((field) => {
              const value = data[field.key];
              if (value == null || value === '') return null;
              return (
                <div className="detail-field" key={field.key}>
                  <span className="detail-field-label">{field.label}</span>
                  <span
                    className={`detail-field-value${field.italic ? ' italic' : ''}${field.chip ? ' chip' : ''}`}
                  >
                    {field.link ? (
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        Link
                      </a>
                    ) : field.suffix ? (
                      `${value}${field.suffix}`
                    ) : (
                      value
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="detail-side-panel-loading">Not found</p>
      )}
    </div>
  );
}
