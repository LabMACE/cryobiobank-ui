import React, { useState, useEffect, useCallback } from 'react';
import { DebounceInput } from 'react-debounce-input';

// A component to show a single isolate with toggle-able details.
const IsolateCard = ({ isolate }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <li className="isolate-card">
      <div className="isolate-header" onClick={toggleExpand}>
        <h3>{isolate.name}</h3>
        {isolate.taxonomy}
        <span className="arrow">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="isolate-details">
          <p>
            <strong>Taxonomy:</strong> {isolate.taxonomy || 'N/A'}
          </p>
          <p>
            <strong>Media:</strong> {isolate.media_used_for_isolation}
          </p>
          <p>
            <strong>Storage:</strong> {isolate.storage_location}
          </p>
        </div>
      )}
    </li>
  );
};

const Isolates = () => {
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (filter.trim() === '') {
        // Default load: get initial 10 isolates
        url = `/api/isolates?range=[0,10]`;
      } else {
        url = `/api/isolates?filter={"q":"${encodeURIComponent(filter)}"}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch data on mount and whenever the filter changes.
  useEffect(() => {
    handleSearch();
  }, [filter, handleSearch]);

  return (
    <div className="isolates-component">
      <h2>Isolates</h2>
      <div className="query-container">
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Enter filter parameter"
          className="query-input"
        />
        <button onClick={handleSearch} className="query-button">
          Search
        </button>
      </div>
      <div className="results-container">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && results.length > 0 && (
          <ul className="isolates-results">
            {results.map((item) => (
              <IsolateCard key={item.id} isolate={item} />
            ))}
          </ul>
        )}
        {!loading && !error && results.length === 0 && <p>No results found.</p>}
      </div>
    </div>
  );
};

export default Isolates;
