import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Measurements arrive at full stored precision (water content 5.906593407, chloride
// 0.030228869) and trace ions run as low as 5e-05, so a fixed number of decimals would
// print a real reading as "0". Round to decimals above 1 and to significant figures
// below it, where the leading zeros carry no information. Whole numbers stay bare.
function formatNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value;
  if (Number.isInteger(value)) return String(value);
  const magnitude = Math.abs(value);
  if (magnitude >= 10) return String(Number(value.toFixed(1)));
  if (magnitude >= 1) return String(Number(value.toFixed(2)));
  return String(Number(value.toPrecision(3)));
}

const fieldConfigs = {
  isolates: {
    label: 'Isolate',
    sections: [
      {
        title: 'Origin',
        fields: [
          { key: 'site_name', label: 'Site' },
          { key: 'area_name', label: 'Area' },
          { key: 'elevation_metres', label: 'Elevation', render: (v) => `${Math.round(v)} m` },
        ],
      },
      {
        title: 'Isolation',
        fields: [
          { key: 'taxonomy', label: 'Taxonomy', italic: true },
          { key: 'temperature_of_isolation', label: 'Temperature', suffix: ' °C' },
          { key: 'media_used_for_isolation', label: 'Media' },
          { key: 'genome_url', label: 'Genome', link: true },
        ],
      },
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
    sections: [
      {
        title: 'Extraction',
        fields: [
          { key: 'extraction_method', label: 'Extraction method' },
          { key: 'description', label: 'Description' },
        ],
      },
      {
        title: 'Quantity',
        rows: true,
        fields: [
          { key: 'volume', label: 'Volume' },
          { key: 'concentration', label: 'Concentration' },
        ],
      },
    ],
  },
  field_records: {
    label: 'Field record',
    sections: [
      {
        title: 'Collection',
        fields: [
          { key: 'sampling_date', label: 'Date' },
          { key: 'campaign', label: 'Campaign', wrap: true },
          { key: 'treatment', label: 'Treatment', chip: true },
          { key: 'metagenome_url', label: 'Metagenome', link: true },
        ],
      },
      {
        title: 'Physical properties',
        rows: true,
        fields: [
          { key: 'water_content', label: 'Water content', suffix: ' %' },
          { key: 'sample_depth_cm', label: 'Sample depth', suffix: ' cm' },
          { key: 'snow_depth_cm', label: 'Snow depth', suffix: ' cm' },
          { key: 'air_temperature_celsius', label: 'Air temp', suffix: ' °C' },
          { key: 'snow_temperature_celsius', label: 'Snow temp', suffix: ' °C' },
          { key: 'soil_temperature_celsius', label: 'Soil temp', suffix: ' °C' },
          { key: 'photosynthetic_active_radiation', label: 'PAR' },
        ],
      },
      {
        title: 'Cell quantification',
        rows: true,
        fields: [
          { key: 'flow_cytometry_cell_number', label: 'Flow cytometry cells' },
          { key: 'cfu_count_r2a', label: 'CFU (R2A)' },
          { key: 'cfu_count_another', label: 'CFU (other)' },
        ],
      },
      {
        title: 'Chemical properties',
        rows: true,
        fields: [
          { key: 'ph', label: 'pH' },
          { key: 'total_carbon', label: 'Total carbon', suffix: ' %' },
          { key: 'total_organic_carbon', label: 'Total organic carbon', suffix: ' %' },
          { key: 'total_nitrogen', label: 'Total nitrogen', suffix: ' %' },
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

export default function DetailSidePanel({ type, itemId, onClose, contextSampleType, parentFieldRecord, onBack, enrichment }) {
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

  // Site, area and elevation live on the parent chain, not on the isolate, so resolve
  // them from the lookups the caller already loaded. Same walk as IsolateCard.
  const record = data ? { ...data, ...resolveOrigin(data, enrichment) } : null;

  const renderField = (field) => {
    const value = record[field.key];
    if (value == null || value === '') return null;
    const display = field.render
      ? field.render(value)
      : `${formatNumber(value)}${field.suffix || ''}`;
    return (
      <div className="detail-field" key={field.key}>
        <span className="detail-field-label">{field.label}</span>
        <span
          className={`detail-field-value${field.italic ? ' italic' : ''}${field.chip ? ' chip' : ''}${field.wrap ? ' wrap' : ''}`}
        >
          {field.link ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          ) : (
            display
          )}
        </span>
      </div>
    );
  };

  const hasSectionValues = (section) =>
    section.fields.some((f) => record[f.key] != null && record[f.key] !== '');

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
      ) : record ? (
        <>
          <div className="detail-side-panel-header">
            <span className="detail-side-panel-type">{config.label}</span>
            <h3 className="detail-side-panel-name">{record.name}</h3>
            {displayType && (
              <span className="detail-side-panel-chip">{displayType}</span>
            )}
          </div>
          {config.sections ? (
            config.sections.map((section) =>
              hasSectionValues(section) ? (
                <div
                  key={section.title}
                  className={`detail-section${section.compact ? ' detail-section-compact' : ''}${section.rows ? ' detail-section-compact detail-section-rows' : ''}`}
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
          {type === 'isolates' && record.photo && (
            <div className="detail-side-panel-photo">
              <img src={record.photo} alt={record.name} />
            </div>
          )}
          {type === 'isolates' && record.site_id && (
            <div className="detail-side-panel-foot">
              <Link
                to={buildIsolateMapLink(record)}
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

// The isolates endpoint returns field_record_id only, so walk field record -> site ->
// area through the caller's lookups to recover the provenance the panel displays.
function resolveOrigin(data, enrichment) {
  if (!enrichment || !data?.field_record_id) return {};
  const fieldRecord = enrichment.fieldRecords?.[data.field_record_id];
  const site = fieldRecord ? enrichment.sites?.[fieldRecord.site_id] : null;
  if (!site) return {};
  const area = site.area_id ? enrichment.areas?.[site.area_id] : null;
  return {
    site_id: site.id,
    site_name: site.name,
    area_name: area?.name,
    elevation_metres: site.elevation_metres,
  };
}

function buildIsolateMapLink(iso) {
  const q = new URLSearchParams();
  q.set('focus_site', iso.site_id);
  if (iso.field_record_id) q.set('field_record', iso.field_record_id);
  q.set('isolate', iso.id);
  q.set('from', 'isolates');
  return `/?${q.toString()}`;
}
