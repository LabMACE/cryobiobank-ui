import { useState, useCallback } from 'react';
import { useDataProvider } from 'react-admin';
import { chunkArray, BATCH_SIZE } from './csvImportConfig';

// Collect succeeded/failed out of a BatchResult body, mapping the chunk-relative
// index the API reports back to the 1-based row number in the original CSV.
function collectBatchResult(body, offset, succeeded, failed) {
    if (Array.isArray(body?.succeeded)) {
        succeeded.push(...body.succeeded);
    }
    if (Array.isArray(body?.failed)) {
        body.failed.forEach((f) => {
            failed.push({ row: offset + f.index + 1, error: f.error });
        });
    }
}

export function useBatchSubmit(resource) {
    const dataProvider = useDataProvider();
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [result, setResult] = useState(null);

    const submit = useCallback(
        async (rows) => {
            setSubmitting(true);
            const chunks = chunkArray(rows);
            setProgress({ current: 0, total: chunks.length });

            const succeeded = [];
            const failed = [];

            for (let i = 0; i < chunks.length; i++) {
                const offset = i * BATCH_SIZE;
                try {
                    const { data } = await dataProvider.createMany(resource, {
                        data: chunks[i],
                    });

                    if (data && (data.succeeded || data.failed)) {
                        collectBatchResult(data, offset, succeeded, failed);
                    } else if (Array.isArray(data)) {
                        // Plain array response (non-partial mode) — all succeeded.
                        succeeded.push(...data);
                    }
                } catch (err) {
                    // A 4xx with a BatchResult body (e.g. every row in the chunk
                    // was a duplicate) rejects, but still carries per-row errors.
                    if (err?.body && (err.body.succeeded || err.body.failed)) {
                        collectBatchResult(err.body, offset, succeeded, failed);
                    } else {
                        chunks[i].forEach((_, j) => {
                            failed.push({
                                row: offset + j + 1,
                                error: err.message || 'Request failed',
                            });
                        });
                    }
                }

                setProgress({ current: i + 1, total: chunks.length });
            }

            const summary = { succeeded: succeeded.length, failed };
            setResult(summary);
            setSubmitting(false);
            return summary;
        },
        [dataProvider, resource]
    );

    return { submit, submitting, progress, result };
}
