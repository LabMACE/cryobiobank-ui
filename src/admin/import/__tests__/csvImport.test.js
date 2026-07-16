import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import {
    IMPORT_CONFIGS,
    generateTemplate,
    validateHeaders,
    validateRow,
    checkDuplicateNames,
    transformRow,
    chunkArray,
    normalizeHeader,
    autoMatchColumns,
    applyMapping,
    isMappingComplete,
    buildReferenceTree,
    countReferenceNames,
    referenceResources,
    decodeCsvBytes,
} from '../csvImportConfig';

const parseCsv = (text) =>
    Papa.parse(text, { header: true, skipEmptyLines: true });

describe('decodeCsvBytes', () => {
    it('decodes UTF-8 bytes with diacritics', () => {
        const utf8 = new TextEncoder().encode('name\nZürich,Genève\n');
        expect(decodeCsvBytes(utf8.buffer)).toBe('name\nZürich,Genève\n');
    });

    it('falls back to Windows-1252 when the bytes are not valid UTF-8', () => {
        // "Zürich" encoded as Windows-1252 (ü = 0xFC), which is invalid UTF-8.
        const win1252 = new Uint8Array([0x5a, 0xfc, 0x72, 0x69, 0x63, 0x68]);
        expect(decodeCsvBytes(win1252.buffer)).toBe('Zürich');
    });
});

describe('generateTemplate', () => {
    it('generates correct header row for each entity', () => {
        for (const [resource, config] of Object.entries(IMPORT_CONFIGS)) {
            const template = generateTemplate(config);
            const headers = template.trim().split(',');
            const expectedKeys = config.columns.map((c) => c.key);
            expect(headers, `template for ${resource}`).toEqual(expectedKeys);
        }
    });
});

describe('validateHeaders', () => {
    it('accepts valid headers', () => {
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(['name', 'description', 'colour'], config);
        expect(result.valid).toBe(true);
        expect(result.missing).toEqual([]);
        expect(result.extra).toEqual([]);
    });

    it('accepts case-insensitive headers', () => {
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(['Name', 'Description', 'Colour'], config);
        expect(result.valid).toBe(true);
    });

    it('rejects missing required columns', () => {
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(['name'], config);
        expect(result.valid).toBe(false);
        expect(result.missing).toContain('colour');
    });

    it('allows omitting optional columns', () => {
        // areas: name + colour are required, description is optional
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(['name', 'colour'], config);
        expect(result.valid).toBe(true);
        expect(result.missing).toEqual([]);
    });

    it('rejects a misspelled optional column as unrecognized', () => {
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(['name', 'colour', 'descripton'], config);
        expect(result.valid).toBe(false);
        expect(result.extra).toContain('descripton');
    });

    it('rejects unrecognized columns', () => {
        const config = IMPORT_CONFIGS.areas;
        const result = validateHeaders(
            ['name', 'description', 'colour', 'unknown_col'],
            config
        );
        expect(result.valid).toBe(false);
        expect(result.extra).toContain('unknown_col');
    });
});

describe('CSV parsing (Papa)', () => {
    it('parses a header row into keyed objects', () => {
        const csv = 'name,description,colour\nAlps West,,#ff0000\n';
        const { data, meta } = parseCsv(csv);
        expect(meta.fields).toEqual(['name', 'description', 'colour']);
        expect(data).toHaveLength(1);
        expect(data[0]).toEqual({
            name: 'Alps West',
            description: '',
            colour: '#ff0000',
        });
    });

    it('skips blank lines', () => {
        const csv = 'name,description,colour\nA,,#111\n\n\nB,,#222\n';
        const { data } = parseCsv(csv);
        expect(data).toHaveLength(2);
        expect(data.map((r) => r.name)).toEqual(['A', 'B']);
    });

    it('round-trips the generated template through the parser', () => {
        const config = IMPORT_CONFIGS.sites;
        const template = generateTemplate(config);
        const { meta } = parseCsv(
            template + 'Alps West,My Site,46.5,7.3,1500\n'
        );
        expect(validateHeaders(meta.fields, config).valid).toBe(true);
    });

    it('drives the full pipeline from a CSV string', () => {
        const config = IMPORT_CONFIGS.field_records;
        const csv =
            'site_name,name,sample_type,sampling_date,ph\n' +
            'Glacier Peak,FR-001,Snow,2025-03-15,6.2\n' +
            'Glacier Peak,FR-002,Soil,15/07/2025,5.8\n';
        const { data, meta } = parseCsv(csv);

        expect(validateHeaders(meta.fields, config).valid).toBe(true);

        const fkLookups = { sites: new Map([['glacier peak', 'uuid-site-1']]) };
        const allNames = data.map((r) => r.name.toLowerCase());
        const errors = data.map((r) => validateRow(r, config, fkLookups, allNames));
        expect(errors.every((e) => Object.keys(e).length === 0)).toBe(true);
        expect(checkDuplicateNames(data).size).toBe(0);

        const transformed = data.map((r) => transformRow(r, config, fkLookups));
        expect(transformed[0]).toMatchObject({
            site_id: 'uuid-site-1',
            name: 'FR-001',
            sample_type: 'Snow',
            sampling_date: '2025-03-15',
            ph: 6.2,
        });
        expect(transformed[1].sampling_date).toBe('2025-07-15');
    });
});

describe('validateRow', () => {
    const fkLookups = {
        areas: new Map([['alps west', 'uuid-area-1']]),
        sites: new Map([
            ['glacier peak', 'uuid-site-1'],
            ['snow basin', 'uuid-site-2'],
        ]),
        field_records: new Map([
            ['fr-gp-001', 'uuid-fr-1'],
            ['fr-sb-001', 'uuid-fr-2'],
        ]),
    };

    it('passes a valid areas row', () => {
        const errors = validateRow(
            { name: 'Test Area', description: '', colour: '#ff0000' },
            IMPORT_CONFIGS.areas,
            fkLookups,
            ['test area']
        );
        expect(errors).toEqual({});
    });

    it('flags missing required fields', () => {
        const errors = validateRow(
            { name: '', description: '', colour: '#ff0000' },
            IMPORT_CONFIGS.areas,
            fkLookups,
            ['']
        );
        expect(errors.name).toBe('Required');
    });

    it('validates number ranges for latitude', () => {
        const errors = validateRow(
            {
                area_name: '',
                name: 'Site',
                latitude_4326: '95',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups,
            ['site']
        );
        expect(errors.latitude_4326).toBe('Must be between -90 and 90');
    });

    it('validates longitude range', () => {
        const errors = validateRow(
            {
                area_name: '',
                name: 'Site',
                latitude_4326: '46.5',
                longitude_4326: '-200',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups,
            ['site']
        );
        expect(errors.longitude_4326).toBe('Must be between -180 and 180');
    });

    it('validates non-numeric input for number fields', () => {
        const errors = validateRow(
            {
                area_name: '',
                name: 'Site',
                latitude_4326: 'not-a-number',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups,
            ['site']
        );
        expect(errors.latitude_4326).toBe('Must be a number');
    });

    it('validates date format YYYY-MM-DD', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: '2025-03-15',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.sampling_date).toBeUndefined();
    });

    it('validates date format DD/MM/YYYY', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: '15/03/2025',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.sampling_date).toBeUndefined();
    });

    it('rejects invalid date', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: 'not-a-date',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.sampling_date).toContain('Invalid date');
    });

    it('validates enum values case-insensitively', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'snow',
                sampling_date: '2025-03-15',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.sample_type).toBeUndefined();
    });

    it('rejects invalid enum values', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Ice',
                sampling_date: '2025-03-15',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.sample_type).toContain('Must be one of');
    });

    it('validates boolean values', () => {
        const good = ['true', 'false', 'yes', 'no', '1', '0'];
        for (const val of good) {
            const errors = validateRow(
                {
                    field_record_name: 'FR-GP-001',
                    name: `S-${val}`,
                    is_available: val,
                    description: '',
                    storage_location: '',
                },
                IMPORT_CONFIGS.samples,
                fkLookups,
                [`s-${val}`]
            );
            expect(errors.is_available, `boolean value "${val}"`).toBeUndefined();
        }

        const errors = validateRow(
            {
                field_record_name: 'FR-GP-001',
                name: 'S-bad',
                is_available: 'maybe',
                description: '',
                storage_location: '',
            },
            IMPORT_CONFIGS.samples,
            fkLookups,
            ['s-bad']
        );
        expect(errors.is_available).toContain('Must be');
    });

    it('flags unresolvable FK references', () => {
        const errors = validateRow(
            {
                area_name: 'Nonexistent Area',
                name: 'Site',
                latitude_4326: '46.5',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups,
            ['site']
        );
        expect(errors.area_name).toContain('No area named');
    });

    it('allows empty optional FK', () => {
        const errors = validateRow(
            {
                area_name: '',
                name: 'Site',
                latitude_4326: '46.5',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups,
            ['site']
        );
        expect(errors.area_name).toBeUndefined();
    });

    it('flags missing required FK', () => {
        const errors = validateRow(
            {
                field_record_name: '',
                name: 'Sample-001',
                is_available: '',
                description: '',
                storage_location: '',
            },
            IMPORT_CONFIGS.samples,
            fkLookups,
            ['sample-001']
        );
        expect(errors.field_record_name).toBe('Required');
    });

    it('validates integer fields reject decimals', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: '2025-03-15',
                photosynthetic_active_radiation: '3.5',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups,
            ['fr-001']
        );
        expect(errors.photosynthetic_active_radiation).toBe('Must be a whole number');
    });

    it('accepts a European decimal comma in number fields', () => {
        const errors = validateRow(
            {
                area_name: '',
                name: 'Site',
                latitude_4326: '46,5',
                longitude_4326: '7,3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups
        );
        expect(errors.latitude_4326).toBeUndefined();
        expect(errors.longitude_4326).toBeUndefined();
    });

    it('accepts a dotted European date DD.MM.YYYY', () => {
        const errors = validateRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: '15.03.2025',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups
        );
        expect(errors.sampling_date).toBeUndefined();
    });

    it('uses a readable singular noun in FK errors', () => {
        const errors = validateRow(
            {
                site_name: 'Nowhere',
                name: 'FR-001',
                sample_type: 'Snow',
                sampling_date: '2025-03-15',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups
        );
        expect(errors.site_name).toBe('No site named "Nowhere"');
    });

    it('flags a name that already exists in the database', () => {
        const existing = new Set(['glacier peak']);
        const errors = validateRow(
            { name: 'Glacier Peak', description: '', colour: '#ff0000' },
            IMPORT_CONFIGS.areas,
            {},
            existing
        );
        expect(errors.name).toBe('Already exists in the database');
    });

    it('accepts a new name not present in the database', () => {
        const existing = new Set(['glacier peak']);
        const errors = validateRow(
            { name: 'Brand New', description: '', colour: '#ff0000' },
            IMPORT_CONFIGS.areas,
            {},
            existing
        );
        expect(errors.name).toBeUndefined();
    });
});

describe('checkDuplicateNames', () => {
    it('detects duplicate names', () => {
        const rows = [
            { name: 'Alpha' },
            { name: 'Beta' },
            { name: 'alpha' },
        ];
        const dups = checkDuplicateNames(rows);
        expect(dups.has(0)).toBe(true);
        expect(dups.has(2)).toBe(true);
        expect(dups.has(1)).toBe(false);
    });

    it('returns empty set for unique names', () => {
        const rows = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
        const dups = checkDuplicateNames(rows);
        expect(dups.size).toBe(0);
    });

    it('ignores empty names', () => {
        const rows = [{ name: '' }, { name: '' }];
        const dups = checkDuplicateNames(rows);
        expect(dups.size).toBe(0);
    });
});

describe('transformRow', () => {
    const fkLookups = {
        areas: new Map([['alps west', 'uuid-area-1']]),
        sites: new Map([['glacier peak', 'uuid-site-1']]),
        field_records: new Map([['fr-gp-001', 'uuid-fr-1']]),
    };

    it('transforms a sites row with FK resolution', () => {
        const result = transformRow(
            {
                area_name: 'Alps West',
                name: 'New Site',
                latitude_4326: '46.5',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups
        );
        expect(result).toEqual({
            area_id: 'uuid-area-1',
            name: 'New Site',
            latitude_4326: 46.5,
            longitude_4326: 7.3,
            elevation_metres: 1500,
        });
    });

    it('transforms optional FK to null when empty', () => {
        const result = transformRow(
            {
                area_name: '',
                name: 'No Area Site',
                latitude_4326: '46.5',
                longitude_4326: '7.3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups
        );
        expect(result.area_id).toBeNull();
    });

    it('transforms European decimal commas to numbers', () => {
        const result = transformRow(
            {
                area_name: '',
                name: 'Comma Site',
                latitude_4326: '46,5',
                longitude_4326: '7,3',
                elevation_metres: '1500',
            },
            IMPORT_CONFIGS.sites,
            fkLookups
        );
        expect(result.latitude_4326).toBe(46.5);
        expect(result.longitude_4326).toBe(7.3);
    });

    it('transforms integers consistently with validation (no parseInt truncation)', () => {
        // "3e2" is a valid integer (300) under Number(); a parseInt() transform
        // would have silently stored 3. Validation and transform must agree.
        const config = IMPORT_CONFIGS.field_records;
        const row = {
            site_name: 'Glacier Peak',
            name: 'FR-INT',
            sample_type: 'Snow',
            sampling_date: '2025-03-15',
            photosynthetic_active_radiation: '3e2',
        };
        const errors = validateRow(row, config, fkLookups);
        expect(errors.photosynthetic_active_radiation).toBeUndefined();
        const result = transformRow(row, config, fkLookups);
        expect(result.photosynthetic_active_radiation).toBe(300);
    });

    it('transforms a field record with date and enum', () => {
        const result = transformRow(
            {
                site_name: 'Glacier Peak',
                name: 'FR-001',
                sample_type: 'snow',
                sampling_date: '15/03/2025',
                ph: '6.2',
                ions_chloride: '0.15',
            },
            IMPORT_CONFIGS.field_records,
            fkLookups
        );
        expect(result.site_id).toBe('uuid-site-1');
        expect(result.sample_type).toBe('Snow');
        expect(result.sampling_date).toBe('2025-03-15');
        expect(result.ph).toBe(6.2);
        expect(result.ions_chloride).toBe(0.15);
    });

    it('transforms a samples row with boolean default', () => {
        const result = transformRow(
            {
                field_record_name: 'FR-GP-001',
                name: 'Sample-001',
                is_available: '',
                description: 'Test',
                storage_location: '',
            },
            IMPORT_CONFIGS.samples,
            fkLookups
        );
        expect(result.field_record_id).toBe('uuid-fr-1');
        expect(result.is_available).toBe(true);
        expect(result.description).toBe('Test');
        expect(result.storage_location).toBeNull();
    });

    it('transforms boolean yes/no/1/0', () => {
        for (const [input, expected] of [
            ['true', true],
            ['false', false],
            ['yes', true],
            ['no', false],
            ['1', true],
            ['0', false],
        ]) {
            const result = transformRow(
                {
                    field_record_name: 'FR-GP-001',
                    name: 'S',
                    is_available: input,
                    description: '',
                    storage_location: '',
                },
                IMPORT_CONFIGS.samples,
                fkLookups
            );
            expect(result.is_available, `boolean "${input}"`).toBe(expected);
        }
    });

    it('transforms an isolates row', () => {
        const result = transformRow(
            {
                field_record_name: 'FR-GP-001',
                name: 'ISO-001',
                taxonomy: 'Pseudomonas sp.',
                temperature_of_isolation: '4.0',
                media_used_for_isolation: 'R2A',
                storage_location: '',
                description: '',
                genome_url: '',
            },
            IMPORT_CONFIGS.isolates,
            fkLookups
        );
        expect(result.field_record_id).toBe('uuid-fr-1');
        expect(result.name).toBe('ISO-001');
        expect(result.taxonomy).toBe('Pseudomonas sp.');
        expect(result.temperature_of_isolation).toBe(4.0);
        expect(result.media_used_for_isolation).toBe('R2A');
    });

    it('transforms a DNA row', () => {
        const result = transformRow(
            {
                field_record_name: 'FR-GP-001',
                name: 'DNA-001',
                extraction_method: 'PowerSoil Kit',
                description: '16S amplicon',
            },
            IMPORT_CONFIGS.dna,
            fkLookups
        );
        expect(result.field_record_id).toBe('uuid-fr-1');
        expect(result.name).toBe('DNA-001');
        expect(result.extraction_method).toBe('PowerSoil Kit');
        expect(result.description).toBe('16S amplicon');
    });

    it('transforms an areas row', () => {
        const result = transformRow(
            { name: 'New Area', description: 'A region', colour: '#abcdef' },
            IMPORT_CONFIGS.areas,
            fkLookups
        );
        expect(result).toEqual({
            name: 'New Area',
            description: 'A region',
            colour: '#abcdef',
        });
    });
});

describe('chunkArray', () => {
    it('splits into correct chunks', () => {
        const arr = Array.from({ length: 250 }, (_, i) => i);
        const chunks = chunkArray(arr);
        expect(chunks.length).toBe(3);
        expect(chunks[0].length).toBe(100);
        expect(chunks[1].length).toBe(100);
        expect(chunks[2].length).toBe(50);
    });

    it('handles arrays smaller than chunk size', () => {
        const chunks = chunkArray([1, 2, 3]);
        expect(chunks.length).toBe(1);
        expect(chunks[0]).toEqual([1, 2, 3]);
    });

    it('handles empty array', () => {
        expect(chunkArray([])).toEqual([]);
    });

    it('handles exact chunk size', () => {
        const chunks = chunkArray(Array.from({ length: 100 }, (_, i) => i));
        expect(chunks.length).toBe(1);
    });
});

describe('normalizeHeader', () => {
    it('collapses case, spaces, underscores and punctuation', () => {
        expect(normalizeHeader('Field Record')).toBe('fieldrecord');
        expect(normalizeHeader('field_record')).toBe('fieldrecord');
        expect(normalizeHeader('FieldRecord')).toBe('fieldrecord');
        expect(normalizeHeader('Latitude (°)')).toBe('latitude');
    });
});

describe('autoMatchColumns', () => {
    it('matches an exact key', () => {
        const m = autoMatchColumns(['name', 'colour'], IMPORT_CONFIGS.areas);
        expect(m).toEqual({ name: 'name', colour: 'colour' });
    });

    it('matches by label, case and spacing differences', () => {
        const m = autoMatchColumns(
            ['Field Record Name', 'Name', 'Available'],
            IMPORT_CONFIGS.samples
        );
        expect(m['Field Record Name']).toBe('field_record_name');
        expect(m['Name']).toBe('name');
        expect(m['Available']).toBe('is_available');
    });

    it('matches by synonym', () => {
        const m = autoMatchColumns(
            ['lat', 'lon', 'area', 'elevation'],
            IMPORT_CONFIGS.sites
        );
        expect(m['lat']).toBe('latitude_4326');
        expect(m['lon']).toBe('longitude_4326');
        expect(m['area']).toBe('area_name');
        expect(m['elevation']).toBe('elevation_metres');
    });

    it('leaves an unrecognized header unmapped', () => {
        const m = autoMatchColumns(['whatever'], IMPORT_CONFIGS.areas);
        expect(m['whatever']).toBeNull();
    });

    it('never assigns the same target to two headers', () => {
        const m = autoMatchColumns(['name', 'Name'], IMPORT_CONFIGS.areas);
        const targets = Object.values(m).filter(Boolean);
        expect(targets).toEqual(['name']);
    });
});

describe('applyMapping', () => {
    it('rebuilds a canonical row keyed by target field', () => {
        const raw = {
            'Field Record': 'Test FR',
            'Sample Name': 'S-001',
            ignore: 'x',
        };
        const mapping = {
            'Field Record': 'field_record_name',
            'Sample Name': 'name',
            ignore: null,
        };
        expect(applyMapping(raw, mapping)).toEqual({
            field_record_name: 'Test FR',
            name: 'S-001',
        });
    });

    it('feeds the existing validate/transform pipeline after mapping', () => {
        const config = IMPORT_CONFIGS.sites;
        const raw = {
            Area: 'Alps West',
            Name: 'New Site',
            lat: '46.5',
            lon: '7.3',
            'elevation m': '1500',
        };
        const mapping = autoMatchColumns(Object.keys(raw), config);
        const canonical = applyMapping(raw, mapping);
        const fkLookups = { areas: new Map([['alps west', 'uuid-area-1']]) };
        const errors = validateRow(canonical, config, fkLookups, ['new site']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(canonical, config, fkLookups);
        expect(transformed.area_id).toBe('uuid-area-1');
        expect(transformed.latitude_4326).toBe(46.5);
    });
});

describe('isMappingComplete', () => {
    it('is true when all required fields are mapped without duplicates', () => {
        const mapping = autoMatchColumns(
            ['field_record_name', 'name', 'taxonomy'],
            IMPORT_CONFIGS.isolates
        );
        expect(isMappingComplete(mapping, IMPORT_CONFIGS.isolates)).toBe(true);
    });

    it('is false when a required field is unmapped', () => {
        const mapping = autoMatchColumns(['name'], IMPORT_CONFIGS.isolates);
        expect(isMappingComplete(mapping, IMPORT_CONFIGS.isolates)).toBe(false);
    });

    it('is false when two headers map to the same field', () => {
        const mapping = {
            name: 'name',
            colour: 'colour',
            'second name': 'name',
        };
        expect(isMappingComplete(mapping, IMPORT_CONFIGS.areas)).toBe(false);
    });

    it('confirms a downloaded template auto-maps cleanly for every entity', () => {
        for (const [resource, config] of Object.entries(IMPORT_CONFIGS)) {
            const headers = generateTemplate(config).trim().split(',');
            const mapping = autoMatchColumns(headers, config);
            expect(
                isMappingComplete(mapping, config),
                `template for ${resource}`
            ).toBe(true);
        }
    });
});

describe('referenceResources', () => {
    it('includes the FK resource and its ancestors', () => {
        expect(referenceResources(IMPORT_CONFIGS.isolates).sort()).toEqual(
            ['areas', 'field_records', 'sites'].sort()
        );
        expect(referenceResources(IMPORT_CONFIGS.field_records).sort()).toEqual(
            ['areas', 'sites'].sort()
        );
        expect(referenceResources(IMPORT_CONFIGS.sites)).toEqual(['areas']);
        expect(referenceResources(IMPORT_CONFIGS.areas)).toEqual([]);
    });
});

describe('buildReferenceTree', () => {
    const byResource = {
        areas: [
            { id: 'a1', name: 'Alps' },
            { id: 'a2', name: 'Jura' },
        ],
        sites: [
            { id: 's1', name: 'Glacier Peak', area_id: 'a1' },
            { id: 's2', name: 'Snow Basin', area_id: 'a1' },
            { id: 's3', name: 'Lone Site', area_id: null },
        ],
        field_records: [
            { id: 'f1', name: 'FR-001', site_id: 's1' },
            { id: 'f2', name: 'FR-002', site_id: 's1' },
            { id: 'f3', name: 'FR-003', site_id: 's2' },
            { id: 'f4', name: 'FR-004', site_id: 's3' },
        ],
    };

    it('groups field records under Area > Site', () => {
        const tree = buildReferenceTree('field_records', byResource);
        expect(countReferenceNames(tree)).toBe(4);
        const alps = tree.children.find((c) => c.title === 'Alps');
        expect(alps.children.map((c) => c.title)).toEqual([
            'Glacier Peak',
            'Snow Basin',
        ]);
        const glacier = alps.children.find((c) => c.title === 'Glacier Peak');
        expect(glacier.names).toEqual(['FR-001', 'FR-002']);
    });

    it('buckets records whose ancestor is missing', () => {
        const tree = buildReferenceTree('field_records', byResource);
        const noArea = tree.children.find((c) => c.title === '(no area)');
        expect(noArea).toBeTruthy();
        const loneSite = noArea.children.find((c) => c.title === 'Lone Site');
        expect(loneSite.names).toEqual(['FR-004']);
    });

    it('groups sites under their area (single level)', () => {
        const tree = buildReferenceTree('sites', byResource);
        const alps = tree.children.find((c) => c.title === 'Alps');
        expect(alps.names).toEqual(['Glacier Peak', 'Snow Basin']);
    });

    it('puts areas (no parent) directly in root names', () => {
        const tree = buildReferenceTree('areas', byResource);
        expect(tree.names).toEqual(['Alps', 'Jura']);
        expect(tree.children).toEqual([]);
    });
});

describe('full round-trip per entity', () => {
    const fkLookups = {
        areas: new Map([['test area', 'uuid-area']]),
        sites: new Map([['test site', 'uuid-site']]),
        field_records: new Map([['test fr', 'uuid-fr']]),
    };

    it('areas: parse → validate → transform', () => {
        const row = { name: 'New Area', description: '', colour: '#ff0000' };
        const errors = validateRow(row, IMPORT_CONFIGS.areas, fkLookups, ['new area']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.areas, fkLookups);
        expect(transformed.name).toBe('New Area');
        expect(transformed.colour).toBe('#ff0000');
    });

    it('sites: parse → validate → transform', () => {
        const row = {
            area_name: 'Test Area',
            name: 'New Site',
            latitude_4326: '46.5',
            longitude_4326: '7.3',
            elevation_metres: '1500',
        };
        const errors = validateRow(row, IMPORT_CONFIGS.sites, fkLookups, ['new site']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.sites, fkLookups);
        expect(transformed.area_id).toBe('uuid-area');
        expect(transformed.latitude_4326).toBe(46.5);
    });

    it('field_records: parse → validate → transform', () => {
        const row = {
            site_name: 'Test Site',
            name: 'FR-001',
            sample_type: 'Soil',
            sampling_date: '2025-08-01',
            ph: '5.5',
            ions_calcium: '0.12',
        };
        const errors = validateRow(row, IMPORT_CONFIGS.field_records, fkLookups, ['fr-001']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.field_records, fkLookups);
        expect(transformed.site_id).toBe('uuid-site');
        expect(transformed.sample_type).toBe('Soil');
        expect(transformed.ph).toBe(5.5);
    });

    it('samples: parse → validate → transform', () => {
        const row = {
            field_record_name: 'Test FR',
            name: 'S-001',
            is_available: 'yes',
            description: 'Snow sample',
            storage_location: 'Freezer A',
        };
        const errors = validateRow(row, IMPORT_CONFIGS.samples, fkLookups, ['s-001']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.samples, fkLookups);
        expect(transformed.field_record_id).toBe('uuid-fr');
        expect(transformed.is_available).toBe(true);
    });

    it('isolates: parse → validate → transform', () => {
        const row = {
            field_record_name: 'Test FR',
            name: 'ISO-001',
            taxonomy: 'Bacillus',
            temperature_of_isolation: '15',
            media_used_for_isolation: 'R2A',
            storage_location: '',
            description: '',
            genome_url: '',
        };
        const errors = validateRow(row, IMPORT_CONFIGS.isolates, fkLookups, ['iso-001']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.isolates, fkLookups);
        expect(transformed.field_record_id).toBe('uuid-fr');
        expect(transformed.temperature_of_isolation).toBe(15);
    });

    it('dna: parse → validate → transform', () => {
        const row = {
            field_record_name: 'Test FR',
            name: 'DNA-001',
            extraction_method: 'DNeasy',
            description: '',
        };
        const errors = validateRow(row, IMPORT_CONFIGS.dna, fkLookups, ['dna-001']);
        expect(Object.keys(errors)).toHaveLength(0);
        const transformed = transformRow(row, IMPORT_CONFIGS.dna, fkLookups);
        expect(transformed.field_record_id).toBe('uuid-fr');
        expect(transformed.extraction_method).toBe('DNeasy');
    });
});
