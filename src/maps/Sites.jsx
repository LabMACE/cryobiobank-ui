import {
    Link,
    useCreatePath,
    Loading,
    useGetList,
    useRecordContext,
} from 'react-admin';
import {
    MapContainer,
    Tooltip,
    Marker,
    Popup,
} from 'react-leaflet';
import { BaseLayers } from './Layers';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useMemo } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
    getMarkerIcon,
    clusterIconCreate,
    FitBounds,
    FitToRecord,
    FitToArea,
    ZoomablePolygon,
    MapLegend,
    SWISS_BOUNDS,
} from './mapUtils.jsx';

const ALL_PAGES = { page: 1, perPage: 9999 };

export const SitesMap = ({
    height = "500px",
    labels = true,
}) => {
    const createPath = useCreatePath();
    const record = useRecordContext();
    const { data: sites, isPending: isPendingSites } = useGetList('sites', { pagination: ALL_PAGES });
    const { data: areas, isPending: isPendingAreas } = useGetList('areas', { pagination: ALL_PAGES });
    const { data: fieldRecords, isPending: isPendingFieldRecords } = useGetList('field_records', { pagination: ALL_PAGES });

    // Union of replicate sample_types per site (sample_type lives on the replicate after Phase A)
    const siteTypesMap = useMemo(() => {
        const map = new Map();
        if (!fieldRecords) return map;
        for (const rep of fieldRecords) {
            if (!rep.sample_type) continue;
            const existing = map.get(rep.site_id) || new Set();
            existing.add(rep.sample_type);
            map.set(rep.site_id, existing);
        }
        for (const [key, val] of map) {
            map.set(key, [...val]);
        }
        return map;
    }, [fieldRecords]);

    // Per-site counts: replicates + aggregated isolate/sample/DNA totals.
    // Admin view uses unfiltered raw totals (unlike public which filters by is_available).
    const siteCountsMap = useMemo(() => {
        const map = new Map();
        if (!fieldRecords) return map;
        for (const rep of fieldRecords) {
            const cur = map.get(rep.site_id) || { replicates: 0, isolates: 0, samples: 0, dna: 0 };
            cur.replicates += 1;
            cur.isolates += (rep.isolates || []).length;
            cur.samples += (rep.samples || []).length;
            cur.dna += (rep.dna || []).length;
            map.set(rep.site_id, cur);
        }
        return map;
    }, [fieldRecords]);

    if (isPendingSites || isPendingAreas || isPendingFieldRecords) {
        return <Loading />;
    }

    if (!sites || sites.length === 0) {
        return (
            <MapContainer
                style={{ width: '100%', height }}
                bounds={SWISS_BOUNDS}
                maxBounds={SWISS_BOUNDS}
                minZoom={9}
                scrollWheelZoom={true}
            >
                <BaseLayers />
            </MapContainer>
        );
    }

    // Determine what kind of record context we're in
    const isSiteRecord = record && record.latitude_4326 != null && record.longitude_4326 != null;
    const isAreaRecord = record && record.colour !== undefined && !isSiteRecord;

    // For area pages, get the matching area from the list (which has geom populated)
    const areaFromList = isAreaRecord
        ? (areas || []).find(a => a.id === record.id)
        : null;

    // For area pages, show only that area's sites and polygon
    const visibleSites = isAreaRecord
        ? sites.filter(s => s.area_id === record.id)
        : sites;

    const visibleAreas = areaFromList
        ? [areaFromList]
        : isAreaRecord ? [] : (areas || []);

    return (
        <MapContainer
            style={{ width: '100%', height }}
            bounds={SWISS_BOUNDS}
            maxBounds={SWISS_BOUNDS}
            minZoom={9}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {isSiteRecord ? (
                <FitToRecord latitude={record.latitude_4326} longitude={record.longitude_4326} />
            ) : areaFromList ? (
                <FitToArea area={areaFromList} />
            ) : (
                <FitBounds sites={sites} areas={areas || []} />
            )}
            <MapLegend />

            <MarkerClusterGroup
                maxClusterRadius={25}
                chunkedLoading
                iconCreateFunction={clusterIconCreate}
            >
                {visibleSites.map(site => {
                    const siteTypes = siteTypesMap.get(site.id) || [];
                    const counts = siteCountsMap.get(site.id) || { replicates: 0, isolates: 0, samples: 0, dna: 0 };
                    const opacity = !record ? 1 : (site.id === record.id ? 1.0 : 0.6);
                    return (
                        <Marker
                            key={site.id}
                            position={[site.latitude_4326, site.longitude_4326]}
                            icon={getMarkerIcon(siteTypes)}
                            sampleTypes={siteTypes}
                            opacity={opacity}
                        >
                            {labels && <Tooltip>{site.name}</Tooltip>}
                            <Popup>
                                <b>{site.name}</b>
                                <br />
                                Elevation: {site.elevation_metres} m
                                <br />
                                Field Records: {counts.replicates}
                                <br />
                                Isolates: {counts.isolates} · Samples: {counts.samples} · DNA: {counts.dna}
                                <br /><br />
                                <Link to={createPath({ type: 'show', resource: 'sites', id: site.id })}>
                                    Go to Site
                                </Link>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>

            {visibleAreas
                .filter(area => area.geom?.coordinates?.[0])
                .map(area => (
                    <ZoomablePolygon key={area.id} area={area}>
                        <Link
                            to={createPath({ type: 'show', resource: 'areas', id: area.id })}
                            style={{ color: '#fff', textDecoration: 'none' }}
                        >
                            {area.name}
                        </Link>
                    </ZoomablePolygon>
                ))}
        </MapContainer>
    );
};

export default SitesMap;
