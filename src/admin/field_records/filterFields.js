export const sampleTypeChoices = [
    { id: 'Snow', name: 'Snow' },
    { id: 'Soil', name: 'Soil' },
];

// Numeric measurement columns, grouped to mirror the Create form. The group only
// prefixes the "Add filter" menu label so related measurements cluster together;
// it carries no behaviour. Each entry expands to a `_gte`/`_lte` range pair, so a
// new measurement field is a single line here.
export const NUMERIC_FIELDS = [
    { group: 'Physical', source: 'sample_depth_cm', label: 'Sample depth (cm)' },
    { group: 'Physical', source: 'snow_depth_cm', label: 'Snow depth (cm)' },
    { group: 'Physical', source: 'air_temperature_celsius', label: 'Air temp (°C)' },
    { group: 'Physical', source: 'snow_temperature_celsius', label: 'Snow temp (°C)' },
    { group: 'Physical', source: 'photosynthetic_active_radiation', label: 'PAR' },
    { group: 'Chemical', source: 'bacterial_abundance', label: 'Bacterial abundance' },
    { group: 'Chemical', source: 'cfu_count_r2a', label: 'CFU count R2A' },
    { group: 'Chemical', source: 'cfu_count_another', label: 'CFU count another' },
    { group: 'Chemical', source: 'ph', label: 'pH' },
    { group: 'Ions', source: 'ions_fluoride', label: 'Fluoride' },
    { group: 'Ions', source: 'ions_chloride', label: 'Chloride' },
    { group: 'Ions', source: 'ions_nitrite', label: 'Nitrite' },
    { group: 'Ions', source: 'ions_nitrate', label: 'Nitrate' },
    { group: 'Ions', source: 'ions_bromide', label: 'Bromide' },
    { group: 'Ions', source: 'ions_sulfate', label: 'Sulfate' },
    { group: 'Ions', source: 'ions_phosphate', label: 'Phosphate' },
    { group: 'Ions', source: 'ions_sodium', label: 'Sodium' },
    { group: 'Ions', source: 'ions_ammonium', label: 'Ammonium' },
    { group: 'Ions', source: 'ions_potassium', label: 'Potassium' },
    { group: 'Ions', source: 'ions_magnesium', label: 'Magnesium' },
    { group: 'Ions', source: 'ions_calcium', label: 'Calcium' },
    { group: 'Organic acids', source: 'organic_acids_formate', label: 'Formate' },
    { group: 'Organic acids', source: 'organic_acids_malate', label: 'Malate' },
    { group: 'Organic acids', source: 'organic_acids_propionate', label: 'Propionate' },
    { group: 'Organic acids', source: 'organic_acids_citrate', label: 'Citrate' },
    { group: 'Organic acids', source: 'organic_acids_lactate', label: 'Lactate' },
    { group: 'Organic acids', source: 'organic_acids_butyrate', label: 'Butyrate' },
    { group: 'Organic acids', source: 'organic_acids_oxalate', label: 'Oxalate' },
    { group: 'Organic acids', source: 'organic_acids_acetate', label: 'Acetate' },
];

// The crudcrate backend reads `_gte`/`_lte` suffixes on filter keys, and the data
// provider forwards them untouched, so a range is just two suffixed sources.
export const rangeSources = ({ source }) => [`${source}_gte`, `${source}_lte`];

export const numericRangeSources = NUMERIC_FIELDS.flatMap(rangeSources);
