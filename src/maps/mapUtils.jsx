import { useEffect, useRef } from 'react';
import { useMap, Polygon, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';

export const SNOW_COLOR = '#4A90D9';
export const SOIL_COLOR = '#8B6914';
export const BOTH_GRADIENT = `linear-gradient(to right, ${SNOW_COLOR} 50%, ${SOIL_COLOR} 50%)`;

export const createCircleIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const createSplitIcon = () => L.divIcon({
  className: '',
  html: `<div style="background:${BOTH_GRADIENT};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const snowIcon = createCircleIcon(SNOW_COLOR);
export const soilIcon = createCircleIcon(SOIL_COLOR);
export const bothIcon = createSplitIcon();
export const defaultIcon = createCircleIcon('#888');

export function getMarkerIcon(sampleTypes) {
  const types = sampleTypes || [];
  if (types.length === 0) return defaultIcon;
  const hasSnow = types.includes('Snow');
  const hasSoil = types.includes('Soil');
  if (hasSnow && hasSoil) return bothIcon;
  if (hasSnow) return snowIcon;
  if (hasSoil) return soilIcon;
  return defaultIcon;
}

export function clusterIconCreate(cluster) {
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
export function FitBounds({ sites, areas }) {
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

// Center on a specific point (for single-record views)
export function FitToRecord({ latitude, longitude, zoom = 14 }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (fittedRef.current) return;
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], zoom);
      fittedRef.current = true;
    }
  }, [latitude, longitude, zoom, map]);

  return null;
}

// Fit map to an area polygon's bounds
export function FitToArea({ area }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (fittedRef.current) return;
    if (!area?.geom?.coordinates?.[0]) return;

    const positions = area.geom.coordinates[0].map(c => [c[1], c[0]]);
    const lats = positions.map(p => p[0]);
    const lngs = positions.map(p => p[1]);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [30, 30] });
    fittedRef.current = true;
  }, [area, map]);

  return null;
}

// Polygon that zooms to fit on click
export function ZoomablePolygon({ area, onAreaClick, children }) {
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
        {children || (
          <span onClick={handleClick} style={{ cursor: 'pointer' }}>
            {area.name}
          </span>
        )}
      </Tooltip>
    </Polygon>
  );
}

// Map legend control
export function MapLegend() {
  const map = useMap();
  const legendRef = useRef(null);

  useEffect(() => {
    if (legendRef.current) return;

    const legend = L.control({ position: 'topright' });
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

export const SWISS_BOUNDS = [[45.398181, 5.140242], [47.808455, 10.492294]];
