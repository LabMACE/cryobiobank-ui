import { describe, it, expect } from 'vitest';
import {
    IMPORT_CONFIGS,
    validateRow,
    transformRow,
} from '../csvImportConfig';

// New field record and DNA import columns (July 2026).

const keysOf = (config) => config.columns.map((c) => c.key);

describe('field_records import — new fields', () => {
    const config = IMPORT_CONFIGS.field_records;

    it('exposes Treatment and Campaign columns', () => {
        expect(keysOf(config)).toEqual(
            expect.arrayContaining(['treatment', 'campaign'])
        );
    });

    it('exposes Water content and the elemental-content trio (TC/TOC/TN)', () => {
        expect(keysOf(config)).toEqual(
            expect.arrayContaining([
                'water_content',
                'total_carbon',
                'total_organic_carbon',
                'total_nitrogen',
            ])
        );
    });

    it('keeps pH, Ions and Organic acids (regrouped under Chemical properties)', () => {
        expect(keysOf(config)).toEqual(
            expect.arrayContaining(['ph', 'ions_chloride', 'organic_acids_acetate'])
        );
    });

    it('transforms the new numeric fields, accepting a European decimal comma', () => {
        const row = {
            site_name: 'Seed Site',
            name: 'FR-1',
            sample_type: 'Soil',
            sampling_date: '2026-06-01',
            treatment: 'control',
            campaign: 'Summer 2026',
            water_content: '34,2',
            total_carbon: '5.1',
            total_organic_carbon: '4.7',
            total_nitrogen: '0.42',
        };
        const fkLookups = { sites: new Map([['seed site', 'site-uuid']]) };
        expect(validateRow(row, config, fkLookups, new Set())).toEqual({});
        const out = transformRow(row, config, fkLookups);
        expect(out.treatment).toBe('control');
        expect(out.campaign).toBe('Summer 2026');
        expect(out.water_content).toBe(34.2);
        expect(out.total_carbon).toBe(5.1);
        expect(out.total_organic_carbon).toBe(4.7);
        expect(out.total_nitrogen).toBe(0.42);
    });
});

describe('dna import — new fields', () => {
    const config = IMPORT_CONFIGS.dna;

    it('exposes Volume and Concentration columns', () => {
        expect(keysOf(config)).toEqual(
            expect.arrayContaining(['volume', 'concentration'])
        );
    });

    // The metagenome URL is not stored on DNA; it lives on the parent field record
    // and DNA only displays it (inherited), so it is intentionally not an import column.
    it('does not expose a Metagenome URL column', () => {
        expect(keysOf(config)).not.toContain('metagenome_url');
    });

    it('transforms numeric volume/concentration, accepting a European decimal comma', () => {
        const row = {
            field_record_name: 'FR-1',
            name: 'DNA-1',
            volume: '25',
            concentration: '12,8',
        };
        const fkLookups = { field_records: new Map([['fr-1', 'fr-uuid']]) };
        expect(validateRow(row, config, fkLookups, new Set())).toEqual({});
        const out = transformRow(row, config, fkLookups);
        expect(out.volume).toBe(25);
        expect(out.concentration).toBe(12.8);
    });
});
