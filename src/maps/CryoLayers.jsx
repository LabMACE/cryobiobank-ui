import { useEffect } from 'react';
import { useMap, Marker, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import { BaseLayers } from './Layers';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  getMarkerIcon,
  clusterIconCreate,
  FitBounds,
  ZoomablePolygon,
  MapLegend,
} from './mapUtils.jsx';

export default function CryoLayers({
  sites,
  areas,
  activeSiteId,
  activeAreaId,
  onSiteClick,
  onAreaClick,
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

  // Fly to active site
  useEffect(() => {
    if (!activeSiteId) return;
    const site = sites.find(s => s.id === activeSiteId);
    if (site) {
      map.flyTo([site.latitude_4326, site.longitude_4326], 15, { duration: 1 });
    }
  }, [activeSiteId, sites, map]);

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

  const filteredAreas = areas.filter(a => sites.some(s => s.area_id === a.id));

  return (
    <>
      <BaseLayers defaultLayer="SwissTopo Aerial" />
      <FitBounds sites={sites} areas={areas} />
      <MapLegend />

      <MarkerClusterGroup
        maxClusterRadius={40}
        chunkedLoading
        iconCreateFunction={clusterIconCreate}
        spiderfyOnMaxZoom={false}
        zoomToBoundsOnClick={true}
      >
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude_4326, site.longitude_4326]}
            icon={getMarkerIcon(site.sample_types)}
            sampleTypes={site.sample_types}
            eventHandlers={{
              click: () => onSiteClick(site.id),
            }}
          >
            <Tooltip>
              <strong>{site.name}</strong>
              <br />
              <span style={{ fontSize: '0.85em', opacity: 0.85 }}>
                {site.matching_replicate_count ?? site.replicate_count} field record{(site.matching_replicate_count ?? site.replicate_count) === 1 ? '' : 's'}
              </span>
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {filteredAreas.map((area) => (
        <ZoomablePolygon key={area.id} area={area} onAreaClick={onAreaClick} />
      ))}

    </>
  );
}
