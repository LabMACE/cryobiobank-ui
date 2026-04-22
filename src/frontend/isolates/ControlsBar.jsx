import { SnowflakeIcon, SoilIcon } from './illustrations';

const HABITAT_OPTIONS = [
  { value: 'All',  label: 'All',  icon: null },
  { value: 'Snow', label: 'Snow', icon: <SnowflakeIcon size={12} /> },
  { value: 'Soil', label: 'Soil', icon: <SoilIcon size={12} /> },
];

// Chips whose direction toggles on repeated click (default ASC on activation).
const TOGGLE_SORTS = [
  { field: 'name',                     label: 'Name' },
  { field: 'taxonomy',                 label: 'Taxonomy' },
  { field: 'temperature_of_isolation', label: 'Temperature' },
];

export default function ControlsBar({
  q,
  onChangeQ,
  habitat,
  onChangeHabitat,
  sortField,
  sortOrder,
  onChangeSort,
  view,
  onChangeView,
}) {
  return (
    <div className="isodir-controls">
      <input
        type="search"
        className="isodir-search-input"
        placeholder="Search name, taxonomy, media…"
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
        aria-label="Search isolates"
      />

      <div className="isodir-sort-chips" role="radiogroup" aria-label="Habitat">
        {HABITAT_OPTIONS.map(opt => {
          const active = habitat === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`isodir-chip ${active ? 'is-active' : ''}`}
              onClick={() => onChangeHabitat(opt.value)}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>

      <span className="isodir-control-divider" aria-hidden="true" />

      <div className="isodir-sort-chips" role="radiogroup" aria-label="Sort">
        {TOGGLE_SORTS.map(opt => {
          const active = opt.field === sortField;
          const nextOrder = active && sortOrder === 'ASC' ? 'DESC' : 'ASC';
          const arrow = active ? (sortOrder === 'ASC' ? '↑' : '↓') : '';
          return (
            <button
              key={opt.field}
              type="button"
              role="radio"
              aria-checked={active}
              className={`isodir-chip ${active ? 'is-active' : ''}`}
              onClick={() => onChangeSort(opt.field, nextOrder)}
              title={active ? `Sorted ${sortOrder === 'ASC' ? 'ascending' : 'descending'} — click to reverse` : `Sort by ${opt.label}`}
            >
              {opt.label}{arrow ? ` ${arrow}` : ''}
            </button>
          );
        })}
      </div>

      <div className="isodir-view-chips" role="radiogroup" aria-label="View">
        <button
          type="button"
          role="radio"
          aria-checked={view === 'cards'}
          className={`isodir-chip ${view === 'cards' ? 'is-active' : ''}`}
          onClick={() => onChangeView('cards')}
        >
          Cards
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={view === 'table'}
          className={`isodir-chip ${view === 'table' ? 'is-active' : ''}`}
          onClick={() => onChangeView('table')}
        >
          Table
        </button>
      </div>
    </div>
  );
}
