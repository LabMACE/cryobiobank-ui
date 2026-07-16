const col = (key, label, type, required, extra = {}) => ({
    key,
    label,
    type,
    required,
    ...extra,
});

const fk = (key, label, fkResource, fkKey, required = true, extra = {}) => ({
    key,
    label,
    type: 'string',
    required,
    fkResource,
    fkKey,
    ...extra,
});

export const IMPORT_CONFIGS = {
    areas: {
        resource: 'areas',
        label: 'Areas',
        templateFilename: 'areas_template.csv',
        instructions:
            'Each row creates one geographic area. Area names must be unique. Colour is a hex code (e.g. #1565c0).',
        columns: [
            col('name', 'Name', 'string', true),
            col('description', 'Description', 'string', false),
            col('colour', 'Colour (hex)', 'string', true, {
                synonyms: ['color', 'hex', 'hex colour', 'hex color'],
            }),
        ],
    },
    sites: {
        resource: 'sites',
        label: 'Sites',
        templateFilename: 'sites_template.csv',
        instructions:
            'Each row creates one collection site. Site names must be unique. Link to an area by typing the existing area name (optional). Leave elevation blank to fill it automatically from SwissTopo.',
        columns: [
            fk('area_name', 'Area Name', 'areas', 'area_id', false, {
                synonyms: ['area'],
            }),
            col('name', 'Name', 'string', true),
            col('latitude_4326', 'Latitude', 'number', true, {
                min: -90,
                max: 90,
                synonyms: ['latitude', 'lat'],
            }),
            col('longitude_4326', 'Longitude', 'number', true, {
                min: -180,
                max: 180,
                synonyms: ['longitude', 'lon', 'lng', 'long'],
            }),
            col('elevation_metres', 'Elevation (m)', 'number', false, {
                synonyms: ['elevation', 'elevation m', 'altitude'],
            }),
        ],
    },
    field_records: {
        resource: 'field_records',
        label: 'Field Records',
        templateFilename: 'field_records_template.csv',
        instructions:
            'Each row creates one field record (a sampling point). Names must be unique. Link to a site by typing the existing site name.',
        columns: [
            fk('site_name', 'Site Name', 'sites', 'site_id', true, {
                synonyms: ['site'],
            }),
            col('name', 'Name', 'string', true),
            col('sample_type', 'Sample Type', 'enum', true, {
                enumValues: ['Snow', 'Soil'],
                synonyms: ['type'],
            }),
            col('sampling_date', 'Sampling Date', 'date', true, {
                synonyms: ['date', 'sampling date'],
            }),
            col('sample_depth_cm', 'Sample Depth (cm)', 'number', false),
            col('snow_depth_cm', 'Snow Depth (cm)', 'number', false),
            col('air_temperature_celsius', 'Air Temp (°C)', 'number', false),
            col('snow_temperature_celsius', 'Snow Temp (°C)', 'number', false),
            col(
                'photosynthetic_active_radiation',
                'PAR',
                'integer',
                false
            ),
            col('bacterial_abundance', 'Bacterial Abundance', 'integer', false),
            col('cfu_count_r2a', 'CFU Count R2A', 'integer', false),
            col('cfu_count_another', 'CFU Count Another', 'integer', false),
            col('ph', 'pH', 'number', false),
            col('ions_fluoride', 'Ions Fluoride', 'number', false),
            col('ions_chloride', 'Ions Chloride', 'number', false),
            col('ions_nitrite', 'Ions Nitrite', 'number', false),
            col('ions_nitrate', 'Ions Nitrate', 'number', false),
            col('ions_bromide', 'Ions Bromide', 'number', false),
            col('ions_sulfate', 'Ions Sulfate', 'number', false),
            col('ions_phosphate', 'Ions Phosphate', 'number', false),
            col('ions_sodium', 'Ions Sodium', 'number', false),
            col('ions_ammonium', 'Ions Ammonium', 'number', false),
            col('ions_potassium', 'Ions Potassium', 'number', false),
            col('ions_magnesium', 'Ions Magnesium', 'number', false),
            col('ions_calcium', 'Ions Calcium', 'number', false),
            col(
                'organic_acids_formate',
                'Organic Acids Formate',
                'number',
                false
            ),
            col(
                'organic_acids_malate',
                'Organic Acids Malate',
                'number',
                false
            ),
            col(
                'organic_acids_propionate',
                'Organic Acids Propionate',
                'number',
                false
            ),
            col(
                'organic_acids_citrate',
                'Organic Acids Citrate',
                'number',
                false
            ),
            col(
                'organic_acids_lactate',
                'Organic Acids Lactate',
                'number',
                false
            ),
            col(
                'organic_acids_butyrate',
                'Organic Acids Butyrate',
                'number',
                false
            ),
            col(
                'organic_acids_oxalate',
                'Organic Acids Oxalate',
                'number',
                false
            ),
            col(
                'organic_acids_acetate',
                'Organic Acids Acetate',
                'number',
                false
            ),
            col('metagenome_url', 'Metagenome URL', 'string', false),
        ],
    },
    samples: {
        resource: 'samples',
        label: 'Samples',
        templateFilename: 'samples_template.csv',
        instructions:
            'Each row creates one sample. Sample names must be unique. Link to a field record by typing its existing name.',
        columns: [
            fk(
                'field_record_name',
                'Field Record Name',
                'field_records',
                'field_record_id',
                true,
                { synonyms: ['field record', 'fieldrecord', 'record'] }
            ),
            col('name', 'Name', 'string', true),
            col('is_available', 'Available', 'boolean', false, {
                defaultValue: true,
                synonyms: ['available'],
            }),
            col('description', 'Description', 'string', false),
            col('storage_location', 'Storage Location', 'string', false, {
                synonyms: ['storage', 'location'],
            }),
        ],
    },
    isolates: {
        resource: 'isolates',
        label: 'Isolates',
        templateFilename: 'isolates_template.csv',
        instructions:
            'Each row creates one isolate. Isolate names must be unique. Link to a field record by typing its existing name. Photos cannot be imported via CSV.',
        columns: [
            fk(
                'field_record_name',
                'Field Record Name',
                'field_records',
                'field_record_id',
                true,
                { synonyms: ['field record', 'fieldrecord', 'record'] }
            ),
            col('name', 'Name', 'string', true),
            col('taxonomy', 'Taxonomy', 'string', false),
            col(
                'temperature_of_isolation',
                'Isolation Temp (°C)',
                'number',
                false
            ),
            col(
                'media_used_for_isolation',
                'Media Used',
                'string',
                false
            ),
            col('storage_location', 'Storage Location', 'string', false),
            col('description', 'Description', 'string', false),
            col('genome_url', 'Genome URL', 'string', false),
        ],
    },
    dna: {
        resource: 'dna',
        label: 'DNA',
        templateFilename: 'dna_template.csv',
        instructions:
            'Each row creates one DNA extraction. Names must be unique. Link to a field record by typing its existing name.',
        columns: [
            fk(
                'field_record_name',
                'Field Record Name',
                'field_records',
                'field_record_id',
                true,
                { synonyms: ['field record', 'fieldrecord', 'record'] }
            ),
            col('name', 'Name', 'string', true),
            col('extraction_method', 'Extraction Method', 'string', false, {
                synonyms: ['extraction', 'method'],
            }),
            col('description', 'Description', 'string', false),
        ],
    },
};

export function generateTemplate(config) {
    return config.columns.map((c) => c.key).join(',') + '\n';
}

// Excel on Windows exports CSVs as Windows-1252, not UTF-8, so characters with
// diacritics (ä ö ü é) arrive as invalid UTF-8. Decode as UTF-8 first and fall
// back to Windows-1252 when the bytes aren't valid UTF-8, so both encodings
// import correctly. `buffer` is an ArrayBuffer of the raw file bytes.
export function decodeCsvBytes(buffer) {
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
        return new TextDecoder('windows-1252').decode(buffer);
    }
}

// Lowercase and strip spaces/underscores/punctuation so "Field Record",
// "field_record" and "fieldrecord" all collapse to the same key for matching.
export function normalizeHeader(s) {
    return (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Suggest a target field for each uploaded CSV header. Returns
// { [csvHeader]: targetKey | null }. Match priority, all case-insensitive and
// without fuzzy matching: exact key -> normalized key -> normalized label ->
// normalized synonym. A target is never suggested for two headers at once.
export function autoMatchColumns(csvHeaders, config) {
    const byKey = new Map();
    const byNormalized = new Map();
    for (const c of config.columns) {
        byKey.set(c.key.toLowerCase(), c.key);
        byNormalized.set(normalizeHeader(c.key), c.key);
        byNormalized.set(normalizeHeader(c.label), c.key);
        for (const syn of c.synonyms || []) {
            byNormalized.set(normalizeHeader(syn), c.key);
        }
    }

    const mapping = {};
    const taken = new Set();
    for (const header of csvHeaders) {
        const exact = byKey.get((header ?? '').trim().toLowerCase());
        const normalized = byNormalized.get(normalizeHeader(header));
        const target = exact || normalized || null;
        if (target && !taken.has(target)) {
            mapping[header] = target;
            taken.add(target);
        } else {
            mapping[header] = null;
        }
    }
    return mapping;
}

// Rebuild a row keyed by config field keys from a raw CSV row using the
// header->targetKey mapping, so validateRow/transformRow run on canonical rows.
export function applyMapping(rawRow, mapping) {
    const canonical = {};
    for (const [header, target] of Object.entries(mapping)) {
        if (target) canonical[target] = rawRow[header];
    }
    return canonical;
}

// Auto-mapping is "clean" when every required field is matched to exactly one
// header — the templated case — so we can skip the manual mapping step.
export function isMappingComplete(mapping, config) {
    const targets = Object.values(mapping).filter(Boolean);
    const hasDuplicate = targets.length !== new Set(targets).size;
    const requiredMet = config.columns
        .filter((c) => c.required)
        .every((c) => targets.includes(c.key));
    return requiredMet && !hasDuplicate;
}

// Parent resource each entity hangs off, used to group reference values in the
// UI by their ancestors (a field record under its site under its area).
export const PARENT_OF = {
    field_records: { resource: 'sites', fk: 'site_id', label: 'site' },
    sites: { resource: 'areas', fk: 'area_id', label: 'area' },
};

// All resources whose records are needed to resolve and group a config's
// references: each FK resource plus its chain of ancestors.
export function referenceResources(config) {
    const set = new Set();
    for (const c of config.columns) {
        if (!c.fkResource) continue;
        let p = { resource: c.fkResource };
        while (p) {
            set.add(p.resource);
            p = PARENT_OF[p.resource];
        }
    }
    return [...set];
}

// Group the records of fkResource into a nested tree keyed by their ancestor
// names (top ancestor outermost), e.g. Area > Site > [field record names].
// Returns a root node { names: string[], children: node[] }; areas (no parent)
// land directly in root.names.
export function buildReferenceTree(fkResource, byResource) {
    const items = byResource[fkResource] || [];

    const idMaps = {};
    for (let p = PARENT_OF[fkResource]; p; p = PARENT_OF[p.resource]) {
        idMaps[p.resource] = new Map(
            (byResource[p.resource] || []).map((r) => [r.id, r])
        );
    }

    const root = { title: null, names: [], children: new Map() };
    for (const item of items) {
        const path = [];
        let cur = item;
        for (let p = PARENT_OF[fkResource]; p; p = PARENT_OF[p.resource]) {
            const rec = cur ? idMaps[p.resource].get(cur[p.fk]) : null;
            path.push(rec ? rec.name : `(no ${p.label})`);
            cur = rec;
        }
        path.reverse(); // top ancestor first

        let node = root;
        for (const title of path) {
            if (!node.children.has(title)) {
                node.children.set(title, {
                    title,
                    names: [],
                    children: new Map(),
                });
            }
            node = node.children.get(title);
        }
        node.names.push(item.name);
    }

    const finalize = (node) => ({
        title: node.title,
        names: node.names.sort((a, b) => a.localeCompare(b)),
        children: [...node.children.values()]
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(finalize),
    });
    return finalize(root);
}

export function countReferenceNames(node) {
    return (
        node.names.length +
        node.children.reduce((sum, c) => sum + countReferenceNames(c), 0)
    );
}

export function validateHeaders(csvHeaders, config) {
    const normalizedCsv = csvHeaders.map((h) => h.trim().toLowerCase());
    const configKeys = config.columns.map((c) => c.key.toLowerCase());

    // Required columns must be present. Optional columns may be omitted — but any
    // header that isn't a known column is rejected (this is what catches typos,
    // including a misspelled optional column name).
    const missing = config.columns
        .filter((c) => c.required && !normalizedCsv.includes(c.key.toLowerCase()))
        .map((c) => c.key);

    const extra = csvHeaders.filter(
        (h) => !configKeys.includes(h.trim().toLowerCase())
    );

    return { missing, extra, valid: missing.length === 0 && extra.length === 0 };
}

export function validateRow(row, config, fkLookups, existingNames) {
    const errors = {};

    for (const col of config.columns) {
        const raw = (row[col.key] ?? '').trim();

        if (col.required && raw === '') {
            errors[col.key] = 'Required';
            continue;
        }
        if (raw === '') continue;

        if (
            col.key === 'name' &&
            existingNames instanceof Set &&
            existingNames.has(raw.toLowerCase())
        ) {
            errors[col.key] = 'Already exists in the database';
            continue;
        }

        if (col.fkResource) {
            const lookup = fkLookups[col.fkResource];
            if (lookup && !lookup.has(raw.toLowerCase())) {
                errors[col.key] = `No ${singularize(col.fkResource)} named "${raw}"`;
            }
            continue;
        }

        switch (col.type) {
            case 'number': {
                const n = toNumber(raw);
                if (!Number.isFinite(n)) {
                    errors[col.key] = 'Must be a number';
                } else if (
                    col.min !== undefined &&
                    col.max !== undefined &&
                    (n < col.min || n > col.max)
                ) {
                    errors[col.key] = `Must be between ${col.min} and ${col.max}`;
                } else if (col.min !== undefined && n < col.min) {
                    errors[col.key] = `Must be ≥ ${col.min}`;
                } else if (col.max !== undefined && n > col.max) {
                    errors[col.key] = `Must be ≤ ${col.max}`;
                }
                break;
            }
            case 'integer': {
                const n = toNumber(raw);
                if (!Number.isFinite(n) || !Number.isInteger(n)) {
                    errors[col.key] = 'Must be a whole number';
                }
                break;
            }
            case 'date': {
                if (!parseDate(raw)) {
                    errors[col.key] =
                        'Invalid date — use YYYY-MM-DD, DD/MM/YYYY or DD.MM.YYYY';
                }
                break;
            }
            case 'boolean': {
                if (!['true', 'false', 'yes', 'no', '1', '0'].includes(raw.toLowerCase())) {
                    errors[col.key] = 'Must be true/false, yes/no, or 1/0';
                }
                break;
            }
            case 'enum': {
                const allowed = (col.enumValues || []).map((v) => v.toLowerCase());
                if (!allowed.includes(raw.toLowerCase())) {
                    errors[col.key] = `Must be one of: ${col.enumValues.join(', ')}`;
                }
                break;
            }
        }
    }

    return errors;
}

export function checkDuplicateNames(rows) {
    const seen = new Map();
    const duplicates = new Set();
    rows.forEach((row, i) => {
        const name = (row.name ?? '').trim().toLowerCase();
        if (name === '') return;
        if (seen.has(name)) {
            duplicates.add(seen.get(name));
            duplicates.add(i);
        } else {
            seen.set(name, i);
        }
    });
    return duplicates;
}

export function transformRow(row, config, fkLookups) {
    const result = {};

    for (const col of config.columns) {
        const raw = (row[col.key] ?? '').trim();

        if (col.fkResource) {
            if (raw === '') {
                if (!col.required) result[col.fkKey] = null;
            } else {
                const lookup = fkLookups[col.fkResource];
                result[col.fkKey] = lookup.get(raw.toLowerCase());
            }
            continue;
        }

        if (raw === '' && !col.required) {
            if (col.defaultValue !== undefined) {
                result[col.key] = col.defaultValue;
            } else {
                result[col.key] = null;
            }
            continue;
        }

        switch (col.type) {
            case 'number':
                result[col.key] = toNumber(raw);
                break;
            case 'integer':
                result[col.key] = Math.trunc(toNumber(raw));
                break;
            case 'date':
                result[col.key] = parseDate(raw);
                break;
            case 'boolean':
                result[col.key] = ['true', 'yes', '1'].includes(
                    raw.toLowerCase()
                );
                break;
            case 'enum': {
                const match = col.enumValues.find(
                    (v) => v.toLowerCase() === raw.toLowerCase()
                );
                result[col.key] = match;
                break;
            }
            default:
                result[col.key] = raw;
        }
    }

    return result;
}

// Parse a numeric cell, accepting a European decimal comma ("6,2" -> 6.2). Only a
// lone comma between digits is treated as a decimal separator; anything else is
// left for Number() to reject. Used by both validation and transformation so they
// never disagree on what a value parses to.
function toNumber(raw) {
    const normalized = /^-?\d+,\d+$/.test(raw) ? raw.replace(',', '.') : raw;
    return Number(normalized);
}

// "sites" -> "site", "field_records" -> "field record" for readable FK errors.
function singularize(resource) {
    return resource.replace(/s$/, '').replace('_', ' ');
}

function parseDate(raw) {
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const [, y, m, d] = isoMatch;
        if (isValidDate(+y, +m, +d)) return raw;
    }

    const dmy = raw.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
    if (dmy) {
        const [, d, m, y] = dmy;
        if (isValidDate(+y, +m, +d))
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    return null;
}

function isValidDate(y, m, d) {
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const date = new Date(y, m - 1, d);
    return (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
    );
}

export const BATCH_SIZE = 100;

export function chunkArray(arr, size = BATCH_SIZE) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
