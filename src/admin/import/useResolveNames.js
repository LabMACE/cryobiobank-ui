import { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import { referenceResources, buildReferenceTree } from './csvImportConfig';

// Cap on how many parent/existing records we pull to resolve names. If a resource
// exceeds this we can't resolve reliably, so we surface an error rather than
// silently flagging valid references as "not found".
const FETCH_LIMIT = 10000;

export function useResolveNames(config, enabled = true) {
    const dataProvider = useDataProvider();
    const [lookups, setLookups] = useState({});
    const [existingNames, setExistingNames] = useState(new Set());
    const [referenceTrees, setReferenceTrees] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        const fkResources = [
            ...new Set(
                config.columns.filter((c) => c.fkResource).map((c) => c.fkResource)
            ),
        ];
        // The target resource itself: used to flag names that already exist in the
        // DB during preview, before the user submits.
        const targetResource = config.resource;
        // FK resources plus their ancestors, so reference values can be grouped
        // by site and area in the upload step.
        const ancestry = referenceResources(config);

        const targets = [...new Set([...ancestry, targetResource].filter(Boolean))];

        if (targets.length === 0) {
            setLookups({});
            setExistingNames(new Set());
            setReferenceTrees({});
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const fetchNames = (resource) =>
            dataProvider
                .getList(resource, {
                    pagination: { page: 1, perPage: FETCH_LIMIT },
                    sort: { field: 'name', order: 'ASC' },
                    filter: {},
                })
                .then(({ data, total }) => {
                    if (total > data.length) {
                        throw new Error(
                            `Too many ${resource.replace('_', ' ')} (${total}) to resolve names reliably. Import is limited to ${FETCH_LIMIT}.`
                        );
                    }
                    return { resource, data };
                });

        Promise.all(targets.map(fetchNames))
            .then((results) => {
                if (cancelled) return;
                const byResource = {};
                const nextLookups = {};
                let nextExisting = new Set();
                results.forEach(({ resource, data }) => {
                    byResource[resource] = data;
                    if (fkResources.includes(resource)) {
                        const map = new Map();
                        data.forEach((item) =>
                            map.set(item.name.toLowerCase(), item.id)
                        );
                        nextLookups[resource] = map;
                    }
                    if (resource === targetResource) {
                        nextExisting = new Set(
                            data.map((item) => item.name.toLowerCase())
                        );
                    }
                });
                const nextTrees = {};
                fkResources.forEach((resource) => {
                    nextTrees[resource] = buildReferenceTree(resource, byResource);
                });
                setLookups(nextLookups);
                setExistingNames(nextExisting);
                setReferenceTrees(nextTrees);
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [config, enabled, dataProvider]);

    return { lookups, existingNames, referenceTrees, loading, error };
}
