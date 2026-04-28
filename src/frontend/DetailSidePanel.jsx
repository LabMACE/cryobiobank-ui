import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const fieldConfigs = {
  isolates: {
    label: 'Isolate',
    fields: [
      { key: 'taxonomy', label: 'Taxonomy', italic: true },
      { key: 'site_name', label: 'Site' },
      { key: 'area_name', label: 'Area' },
      { key: 'elevation_metres', label: 'Elevation', render: (v) => `${Math.round(v)} m` },
      { key: 'temperature_of_isolation', label: 'Temperature', suffix: ' °C' },
      { key: 'media_used_for_isolation', label: 'Media' },
      { key: 'description', label: 'Description' },
      { key: 'genome_url', label: 'Genome', link: true },
    ],
  },
  samples: {
    label: 'Sample',
    fields: [
      { key: 'is_available', label: 'Availability', render: v => v ? 'In stock' : 'Depleted' },
      { key: 'description', label: 'Description' },
    ],
  },
  dna: {
    label: 'DNA',
    fields: [
      { key: 'extraction_method', label: 'Extraction method' },
      { key: 'description', label: 'Description' },
    ],
  },
  field_records: {
    label: 'Field record',
    sections: [
      {
        title: 'Collection',
        fields: [
          { key: 'sampling_date', label: 'Date' },
          { key: 'metagenome_url', label: 'Metagenome', link: true },
        ],
      },
      {
        title: 'Physical conditions',
        fields: [
          { key: 'sample_depth_cm', label: 'Sample depth', suffix: ' cm' },
          { key: 'snow_depth_cm', label: 'Snow depth', suffix: ' cm' },
          { key: 'air_temperature_celsius', label: 'Air temp', suffix: ' °C' },
          { key: 'snow_temperature_celsius', label: 'Snow temp', suffix: ' °C' },
          { key: 'ph', label: 'pH' },
          { key: 'bacterial_abundance', label: 'Bacterial abundance' },
          { key: 'cfu_count_r2a', label: 'CFU (R2A)' },
          { key: 'cfu_count_another', label: 'CFU (other)' },
          { key: 'photosynthetic_active_radiation', label: 'PAR' },
        ],
      },
      {
        title: 'Ions (mg/L)',
        compact: true,
        fields: [
          { key: 'ions_fluoride', label: 'F⁻' },
          { key: 'ions_chloride', label: 'Cl⁻' },
          { key: 'ions_nitrite', label: 'NO₂⁻' },
          { key: 'ions_nitrate', label: 'NO₃⁻' },
          { key: 'ions_bromide', label: 'Br⁻' },
          { key: 'ions_sulfate', label: 'SO₄²⁻' },
          { key: 'ions_phosphate', label: 'PO₄³⁻' },
          { key: 'ions_sodium', label: 'Na⁺' },
          { key: 'ions_ammonium', label: 'NH₄⁺' },
          { key: 'ions_potassium', label: 'K⁺' },
          { key: 'ions_magnesium', label: 'Mg²⁺' },
          { key: 'ions_calcium', label: 'Ca²⁺' },
        ],
      },
      {
        title: 'Organic acids (mg/L)',
        compact: true,
        fields: [
          { key: 'organic_acids_formate', label: 'Formate' },
          { key: 'organic_acids_malate', label: 'Malate' },
          { key: 'organic_acids_propionate', label: 'Propionate' },
          { key: 'organic_acids_citrate', label: 'Citrate' },
          { key: 'organic_acids_lactate', label: 'Lactate' },
          { key: 'organic_acids_butyrate', label: 'Butyrate' },
          { key: 'organic_acids_oxalate', label: 'Oxalate' },
          { key: 'organic_acids_acetate', label: 'Acetate' },
        ],
      },
    ],
  },
};

const apiResource = {
  isolates: 'isolates',
  samples: 'samples',
  dna: 'dna',
  field_records: 'field_records',
};

export default function DetailSidePanel({ type, itemId, onClose, contextSampleType, parentFieldRecord, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId || !type) return;
    setLoading(true);
    const resource = apiResource[type] || type;
    fetch(`/api/${resource}/${itemId}`)
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

  // Isolates and samples don't carry Snow/Soil on the record itself — it's on the
  // parent field record, so the caller passes it in. Field records have it on data directly.
  const displayType = type === 'field_records' ? data?.sample_type : contextSampleType;

  const renderField = (field) => {
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
          ) : field.render ? (
            field.render(value)
          ) : field.suffix ? (
            `${value}${field.suffix}`
          ) : (
            value
          )}
        </span>
      </div>
    );
  };

  const hasSectionValues = (section) =>
    section.fields.some((f) => data[f.key] != null && data[f.key] !== '');

  const showBack = parentFieldRecord && type !== 'field_records';
  const habitat = (displayType || 'unknown').toLowerCase();

  return (
    <div className={`detail-side-panel habitat-${habitat}`}>
      {showBack ? (
        <button className="detail-side-panel-back" onClick={onBack}>
          ← Back to Field Record {parentFieldRecord.name}
        </button>
      ) : (
        <button className="detail-side-panel-close" onClick={onClose}>
          &times;
        </button>
      )}
      {loading ? (
        <p className="detail-side-panel-loading">Loading...</p>
      ) : data ? (
        <>
          <div className="detail-side-panel-header">
            <span className="detail-side-panel-type">{config.label}</span>
            <h3 className="detail-side-panel-name">{data.name}</h3>
            {displayType && (
              <span className="detail-side-panel-chip">{displayType}</span>
            )}
          </div>
          {config.sections ? (
            config.sections.map((section) =>
              hasSectionValues(section) ? (
                <div
                  key={section.title}
                  className={`detail-section${section.compact ? ' detail-section-compact' : ''}`}
                >
                  <h4 className="detail-section-title">{section.title}</h4>
                  <div className="detail-side-panel-fields">
                    {section.fields.map(renderField)}
                  </div>
                </div>
              ) : null
            )
          ) : (
            <div className="detail-side-panel-fields">
              {config.fields.map(renderField)}
            </div>
          )}
          {type === 'isolates' && data.photo && (
            <div className="detail-side-panel-photo">
              <img src={data.photo} alt={data.name} />
            </div>
          )}
          {type === 'isolates' && data.site_id && (
            <div className="detail-side-panel-foot">
              <Link
                to={buildIsolateMapLink(data)}
                className="detail-side-panel-mapbtn"
              >
                Map →
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="detail-side-panel-loading">Not found</p>
      )}
    </div>
  );
}

function buildIsolateMapLink(iso) {
  const q = new URLSearchParams();
  q.set('focus_site', iso.site_id);
  if (iso.field_record_id) q.set('field_record', iso.field_record_id);
  q.set('isolate', iso.id);
  q.set('from', 'isolates');
  return `/?${q.toString()}`;
}
