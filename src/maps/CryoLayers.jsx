import { useEffect } from 'react';
import { useMap, Marker, Popup, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import { BaseLayers } from './Layers';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  getMarkerIcon,
  defaultIcon,
  clusterIconCreate,
  FitBounds,
  ZoomablePolygon,
  MapLegend,
} from './mapUtils.jsx';

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

  // Filter sites by checking if any of their replicates have the matching sample type
  const filteredSites = sampleTypeFilter === 'All'
    ? sites
    : sites.filter(s => replicates.some(r =>
        r.site_id === s.id && (r.sample_types || []).includes(sampleTypeFilter)
      ));

  const filteredAreas = sampleTypeFilter === 'All'
    ? areas
    : areas.filter(a => filteredSites.some(s => s.area_id === a.id));

  // Sites that have no visible replicate markers — show as gray dots
  const replicateSiteIds = new Set(filteredReplicates.map(r => r.site_id));
  const sitesWithoutMarkers = filteredSites.filter(s => !replicateSiteIds.has(s.id));

  return (
    <>
      <BaseLayers defaultLayer="SwissTopo Aerial" />
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
