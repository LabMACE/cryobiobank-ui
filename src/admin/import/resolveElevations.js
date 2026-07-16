import proj4 from 'proj4';

// Swiss LV95 projection, matching the definition used across the maps/sites code
// (e.g. CoordinateEntry.tsx, sites/List.jsx).
proj4.defs(
    'EPSG:2056',
    '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs'
);

const HEIGHT_ENDPOINT = 'https://api3.geo.admin.ch/rest/services/height';
const CONCURRENCY = 5;

function isBlank(value) {
    return value === undefined || value === null || value === '';
}

function toCoord(value) {
    const n = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

// Look up the SwissTopo terrain height for a WGS84 lon/lat, mirroring the manual
// site form (CoordinateEntry.tsx). The height API only accepts Swiss projections,
// so project WGS84 -> LV95 (EPSG:2056) first.
async function fetchElevation(lon, lat) {
    const [easting, northing] = proj4('EPSG:4326', 'EPSG:2056', [lon, lat]);
    const url = `${HEIGHT_ENDPOINT}?easting=${easting}&northing=${northing}&sr=2056&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data?.success === false || data?.height == null) {
        throw new Error(data?.error?.message || 'SwissTopo returned no elevation');
    }
    return parseFloat(data.height);
}

// For site rows missing an elevation, auto-fill it from SwissTopo using the row's
// coordinates, so bulk import matches the manual-create behaviour. Rows whose
// lookup fails are left untouched (the API then reports the missing value on
// submit). Mutates and returns the same array.
export async function resolveSiteElevations(rows) {
    const pending = rows.filter(
        (row) =>
            isBlank(row.elevation_metres) &&
            toCoord(row.longitude_4326) !== null &&
            toCoord(row.latitude_4326) !== null
    );

    for (let i = 0; i < pending.length; i += CONCURRENCY) {
        const slice = pending.slice(i, i + CONCURRENCY);
        await Promise.all(
            slice.map(async (row) => {
                try {
                    row.elevation_metres = await fetchElevation(
                        toCoord(row.longitude_4326),
                        toCoord(row.latitude_4326)
                    );
                } catch {
                    // Leave blank; surfaced as a row error on submit.
                }
            })
        );
    }

    return rows;
}
