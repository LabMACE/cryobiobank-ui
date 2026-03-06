export default function DataPanel({ replicateData, onClose, loading }) {
  const isolates = replicateData?.isolates || [];
  const samples = replicateData?.samples || [];

  return (
    <div className="overlay-chart data-panel">
      <button className="data-panel-close" onClick={onClose}>&times;</button>
      <div className="data-panel-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="data-panel-columns">
            <div className="data-panel-column">
              <div className="data-panel-column-header">
                Isolates <span className="data-panel-count-badge">{isolates.length}</span>
              </div>
              {isolates.length === 0 ? (
                <p className="data-panel-empty">No isolates</p>
              ) : (
                <table className="data-panel-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Taxonomy</th>
                      <th>Storage</th>
                      <th>Genome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isolates.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.taxonomy || '—'}</td>
                        <td>{item.storage_location || '—'}</td>
                        <td>
                          {item.genome_url ? (
                            <a href={item.genome_url} target="_blank" rel="noopener noreferrer">
                              Link
                            </a>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="data-panel-column">
              <div className="data-panel-column-header">
                Samples <span className="data-panel-count-badge">{samples.length}</span>
              </div>
              {samples.length === 0 ? (
                <p className="data-panel-empty">No samples</p>
              ) : (
                <table className="data-panel-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Storage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.sample_type || '—'}</td>
                        <td>{item.storage_location || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
