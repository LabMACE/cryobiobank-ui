import { useEffect, useRef } from 'react';
import { useMap, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import { BaseLayers } from './Layers';
import MarkerClusterGroup from 'react-leaflet-cluster';

const SNOW_COLOR = '#4A90D9';
const SOIL_COLOR = '#8B6914';
const BOTH_GRADIENT = `linear-gradient(to right, ${SNOW_COLOR} 50%, ${SOIL_COLOR} 50%)`;

const createCircleIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const createSplitIcon = () => L.divIcon({
  className: '',
  html: `<div style="background:${BOTH_GRADIENT};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const snowIcon = createCircleIcon(SNOW_COLOR);
const soilIcon = createCircleIcon(SOIL_COLOR);
const bothIcon = createSplitIcon();
const defaultIcon = createCircleIcon('#888');

function getMarkerIcon(sampleTypes) {
  const types = sampleTypes || [];
  if (types.length === 0) return defaultIcon;
  const hasSnow = types.includes('Snow');
  const hasSoil = types.includes('Soil');
  if (hasSnow && hasSoil) return bothIcon;
  if (hasSnow) return snowIcon;
  if (hasSoil) return soilIcon;
  return defaultIcon;
}

function clusterIconCreate(cluster) {
  const children = cluster.getAllChildMarkers();
  const total = children.length;
  let snow = 0;
  let soil = 0;
  let noData = 0;
  for (const m of children) {
    const types = m.options.sampleTypes || [];
    const hasSnow = types.includes('Snow');
    const hasSoil = types.includes('Soil');
    if (hasSnow) snow++;
    if (hasSoil) soil++;
    if (!hasSnow && !hasSoil) noData++;
  }

  const size = total < 10 ? 36 : total < 50 ? 44 : 52;

  // Build conic-gradient segments for all present types
  const segments = [];
  if (snow > 0) segments.push({ color: SNOW_COLOR, count: snow });
  if (soil > 0) segments.push({ color: SOIL_COLOR, count: soil });
  if (noData > 0) segments.push({ color: '#888', count: noData });

  let bg;
  if (segments.length <= 1) {
    bg = segments.length === 1 ? segments[0].color : '#888';
  } else {
    const sum = segments.reduce((s, seg) => s + seg.count, 0);
    const stops = [];
    let cursor = 0;
    for (const seg of segments) {
      const pct = Math.round((seg.count / sum) * 100);
      stops.push(`${seg.color} ${cursor}% ${cursor + pct}%`);
      cursor += pct;
    }
    bg = `conic-gradient(${stops.join(', ')})`;
  }

  // Build label showing counts for each present type
  let label;
  if (segments.length <= 1) {
    label = `${total}`;
  } else {
    const parts = [];
    if (snow > 0) parts.push(`<span style="color:#b0d4f1">${snow}</span>`);
    if (soil > 0) parts.push(`<span style="color:#d4b86a">${soil}</span>`);
    if (noData > 0) parts.push(`<span style="color:#ccc">${noData}</span>`);
    label = parts.join('/');
  }

  return L.divIcon({
    className: '',
    html: `<div class="cluster-icon" style="width:${size}px;height:${size}px;background:${bg}">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Auto-fit bounds on initial load
function FitBounds({ sites, areas }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (fittedRef.current) return;

    const siteBounds = sites.length > 0
      ? L.latLngBounds(sites.map(s => [s.latitude_4326, s.longitude_4326]))
      : null;

    let areaBounds = null;
    if (areas.length > 0) {
      const coords = areas
        .filter(a => a.geom?.coordinates?.[0])
        .flatMap(a => a.geom.coordinates[0].map(c => [c[1], c[0]]));
      if (coords.length > 0) areaBounds = L.latLngBounds(coords);
    }

    const combined = siteBounds && areaBounds
      ? siteBounds.extend(areaBounds)
      : siteBounds || areaBounds;

    if (combined) {
      map.fitBounds(combined);
      fittedRef.current = true;
    }
  }, [sites, areas, map]);

  return null;
}

// Polygon that zooms to fit on click
function ZoomablePolygon({ area, onAreaClick }) {
  const map = useMap();

  if (!area.geom?.coordinates?.[0]) return null;

  const positions = area.geom.coordinates[0].map(c => [c[1], c[0]]);

  const handleClick = () => {
    const lats = positions.map(p => p[0]);
    const lngs = positions.map(p => p[1]);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [20, 20] });
    if (onAreaClick) onAreaClick(area.id);
  };

  return (
    <Polygon positions={positions} color={area.colour} eventHandlers={{ click: handleClick }}>
      <Tooltip permanent interactive offset={[0, -15]}>
        <span onClick={handleClick} style={{ cursor: 'pointer' }}>
          {area.name}
        </span>
      </Tooltip>
    </Polygon>
  );
}

// Map legend control
function MapLegend() {
  const map = useMap();
  const legendRef = useRef(null);

  useEffect(() => {
    if (legendRef.current) return;

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="background:${SNOW_COLOR};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0"></div>
            <span>Snow</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="background:${SOIL_COLOR};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0"></div>
            <span>Soil</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="background:${BOTH_GRADIENT};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0"></div>
            <span>Both</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="background:#888;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0"></div>
            <span>No data</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    legendRef.current = legend;

    return () => {
      legend.remove();
      legendRef.current = null;
    };
  }, [map]);

  return null;
}

function formatValue(val, unit) {
  if (val == null) return null;
  return `${val}${unit}`;
}

export default function CryoLayers({
  sites,
  areas,
  replicates,
  activeReplicateId,
  activeAreaId,
  onReplicateClick,
  onSiteClick,
  onAreaClick,
  sampleTypeFilter,
  shouldRecenter,
  setShouldRecenter,
  zoomToSiteId,
  setZoomToSiteId,
}) {
  const map = useMap();

  // Recenter when requested
  useEffect(() => {
    if (shouldRecenter && sites.length > 0) {
      const bounds = L.latLngBounds(sites.map(s => [s.latitude_4326, s.longitude_4326]));
      map.fitBounds(bounds, { padding: [20, 20] });
      setShouldRecenter(false);
    }
  }, [shouldRecenter, sites, map, setShouldRecenter]);

  // Fly to active replicate's site location
  useEffect(() => {
    if (!activeReplicateId || !replicates) return;
    const rep = replicates.find(r => r.id === activeReplicateId);
    if (rep) {
      map.flyTo([rep.latitude_4326, rep.longitude_4326], 16, { duration: 1 });
    }
  }, [activeReplicateId, replicates, map]);

  // Zoom to site when clicked from sidebar
  useEffect(() => {
    if (!zoomToSiteId) return;
    const site = sites.find(s => s.id === zoomToSiteId);
    if (site) {
      map.flyTo([site.latitude_4326, site.longitude_4326], 15, { duration: 1 });
    }
    setZoomToSiteId(null);
  }, [zoomToSiteId, sites, map, setZoomToSiteId]);

  // Fly to active area polygon bounds
  useEffect(() => {
    if (!activeAreaId) return;
    const area = areas.find(a => a.id === activeAreaId);
    if (area?.geom?.coordinates?.[0]) {
      const positions = area.geom.coordinates[0].map(c => [c[1], c[0]]);
      const lats = positions.map(p => p[0]);
      const lngs = positions.map(p => p[1]);
      const bounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [activeAreaId, areas, map]);

  // Filter replicates by sample type (inherited from parent site)
  const filteredReplicates = sampleTypeFilter === 'All'
    ? replicates
    : replicates.filter(r => (r.sample_types || []).includes(sampleTypeFilter));

  // Filter areas to only show those containing matching sites
  const filteredSites = sampleTypeFilter === 'All'
    ? sites
    : sites.filter(s => (s.sample_types || []).includes(sampleTypeFilter));

  const filteredAreas = sampleTypeFilter === 'All'
    ? areas
    : areas.filter(a => filteredSites.some(s => s.area_id === a.id));

  // Sites that have no visible replicate markers — show as gray dots
  const replicateSiteIds = new Set(filteredReplicates.map(r => r.site_id));
  const sitesWithoutMarkers = filteredSites.filter(s => !replicateSiteIds.has(s.id));

  return (
    <>
      <BaseLayers />
      <FitBounds sites={sites} areas={areas} />
      <MapLegend />

      <MarkerClusterGroup
        maxClusterRadius={40}
        chunkedLoading
        iconCreateFunction={clusterIconCreate}
        spiderfyOnMaxZoom={true}
      >
        {filteredReplicates.map((rep) => {
          const envLines = [
            formatValue(rep.air_temperature_celsius, ' °C') && `Air: ${rep.air_temperature_celsius} °C`,
            formatValue(rep.snow_temperature_celsius, ' °C') && `Snow: ${rep.snow_temperature_celsius} °C`,
            formatValue(rep.snow_depth_cm, ' cm') && `Snow depth: ${rep.snow_depth_cm} cm`,
            formatValue(rep.sample_depth_cm, ' cm') && `Sample depth: ${rep.sample_depth_cm} cm`,
          ].filter(Boolean);

          return (
            <Marker
              key={rep.id}
              position={[rep.latitude_4326, rep.longitude_4326]}
              icon={getMarkerIcon(rep.sample_types)}
              sampleTypes={rep.sample_types}
              eventHandlers={{
                click: () => onReplicateClick(rep.id),
              }}
            >
              <Tooltip>
                <strong>{rep.site_name}</strong>
                <br />
                <span style={{ fontSize: '0.85em', opacity: 0.85 }}>
                  {rep.name}{rep.sampling_date ? ` · ${rep.sampling_date}` : ''}
                </span>
              </Tooltip>
              <Popup>
                <strong>{rep.site_name}</strong>
                <br />
                <span style={{ fontWeight: 500 }}>{rep.name}</span>
                {rep.sampling_date && <><br />Date: {rep.sampling_date}</>}
                {rep.elevation_metres != null && <><br />Elevation: {rep.elevation_metres} m</>}
                {envLines.length > 0 && (
                  <>
                    <br /><br />
                    {envLines.map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
        {sitesWithoutMarkers.map((site) => (
          <Marker
            key={`site-${site.id}`}
            position={[site.latitude_4326, site.longitude_4326]}
            icon={defaultIcon}
            sampleTypes={[]}
          >
            <Tooltip>
              <strong>{site.name}</strong>
              <br />
              <span style={{ fontSize: '0.85em', opacity: 0.85 }}>No replicates</span>
            </Tooltip>
            <Popup>
              <strong>{site.name}</strong>
              {site.elevation_metres != null && <><br />Elevation: {site.elevation_metres} m</>}
              <br /><em>No replicates yet</em>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {filteredAreas.map((area) => (
        <ZoomablePolygon key={area.id} area={area} onAreaClick={onAreaClick} />
      ))}

    </>
  );
}
