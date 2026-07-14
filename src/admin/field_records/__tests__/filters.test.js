import { describe, it, expect } from 'vitest';
import { NUMERIC_FIELDS, numericRangeSources, rangeSources } from '../filterFields';

describe('field record numeric range filters', () => {
    it('expands every numeric field into a _gte/_lte pair', () => {
        expect(numericRangeSources).toHaveLength(NUMERIC_FIELDS.length * 2);
    });

    it('produces both bounds for each source', () => {
        for (const field of NUMERIC_FIELDS) {
            const [gte, lte] = rangeSources(field);
            expect(gte).toBe(`${field.source}_gte`);
            expect(lte).toBe(`${field.source}_lte`);
            expect(numericRangeSources).toContain(gte);
            expect(numericRangeSources).toContain(lte);
        }
    });

    it('has a unique source per numeric field and no duplicate range keys', () => {
        const sources = NUMERIC_FIELDS.map((f) => f.source);
        expect(new Set(sources).size).toBe(sources.length);
        expect(new Set(numericRangeSources).size).toBe(numericRangeSources.length);
    });
});
