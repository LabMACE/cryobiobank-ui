import { useCallback, useEffect, useMemo } from 'react';
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

// Zoom level a site is brought to when it isn't already closer than this.
const SITE_FOCUS_ZOOM = 15;

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

  // Bring a site into view without ever pulling the map back out: picking a site you
  // already zoomed in on — one from a spiderfied cluster, say — should keep the detail
  // you zoomed in for, and re-clustering it would put the sites back out of reach.
  // Pan rather than fly once close enough, because flyTo animates the zoom even when
  // the level doesn't change, and markercluster collapses a spiderfied cluster on any
  // zoom event.
  const focusSite = useCallback((site) => {
    const target = [site.latitude_4326, site.longitude_4326];
    if (map.getZoom() >= SITE_FOCUS_ZOOM) {
      map.panTo(target, { duration: 1 });
    } else {
      map.flyTo(target, SITE_FOCUS_ZOOM, { duration: 1 });
    }
  }, [map]);

  // Fly to active site
  useEffect(() => {
    if (!activeSiteId) return;
    const site = sites.find(s => s.id === activeSiteId);
    if (site) focusSite(site);
  }, [activeSiteId, sites, focusSite]);

  // Zoom to site when clicked from sidebar
  useEffect(() => {
    if (!zoomToSiteId) return;
    const site = sites.find(s => s.id === zoomToSiteId);
    if (site) focusSite(site);
    setZoomToSiteId(null);
  }, [zoomToSiteId, sites, focusSite, setZoomToSiteId]);

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

  // react-leaflet calls setLatLng whenever the position prop differs by reference, and
  // markercluster treats a moved child as a re-cluster — which collapses an open
  // spiderfy and rebuilds every marker. Hold one array per site so a re-render (opening
  // a site panel, say) doesn't read as all the markers having moved.
  const positions = useMemo(
    () => new Map(sites.map(s => [s.id, [s.latitude_4326, s.longitude_4326]])),
    [sites]
  );

  const filteredAreas = areas.filter(a => sites.some(s => s.area_id === a.id));

  return (
    <>
      <BaseLayers defaultLayer="SwissTopo Aerial" />
      <FitBounds sites={sites} areas={areas} />
      <MapLegend />

      {/* Some sites sit under a metre apart, so they stay clustered even at max zoom.
          Without spiderfy, clicking such a cluster can only try to zoom further and
          the sites underneath become unreachable. */}
      <MarkerClusterGroup
        maxClusterRadius={40}
        chunkedLoading
        iconCreateFunction={clusterIconCreate}
        spiderfyOnMaxZoom={true}
        zoomToBoundsOnClick={true}
      >
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={positions.get(site.id)}
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
                {site.matching_field_record_count ?? site.field_record_count} field record{(site.matching_field_record_count ?? site.field_record_count) === 1 ? '' : 's'}
                {site.elevation_metres != null && ` · ${Math.round(site.elevation_metres)} m`}
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
