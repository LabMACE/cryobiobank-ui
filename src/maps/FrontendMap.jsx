import React, { useState, useEffect } from 'react';
import { MapContainer, useMap, useMapEvents, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BaseLayers } from './Layers';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';

// Component for handling map zoom events
const MapEvents = ({ setZoomLevel }) => {
    const map = useMap();
    useMapEvents({
        zoomend() {
            setZoomLevel(map.getZoom());
        },
    });
    return null;
};

// Helper component for rendering a polygon that zooms in when its label is clicked
const ZoomablePolygon = ({ area }) => {
    const map = useMap();
    // Convert coordinates from [lng, lat] to [lat, lng]
    const positions = area.geom.coordinates[0].map(coord => [coord[1], coord[0]]);

    // Compute the centroid of the polygon
    const center = positions.reduce(
        (acc, pos) => [acc[0] + pos[0], acc[1] + pos[1]],
        [0, 0]
    );
    const centerPos = [center[0] / positions.length, center[1] / positions.length];

    // Handler to zoom the map to level 15 and center on the polygon's centroid
    const handleZoom = () => {
        map.setView(centerPos, 15);
    };

    return (
        <Polygon
            positions={positions}
            color={area.colour}
            eventHandlers={{ click: handleZoom }}
        >
            <Tooltip permanent interactive={true}>
                {/* Add the click handler to the label text */}
                <span onClick={handleZoom} style={{ cursor: 'pointer' }}>
                    {area.name}
                </span>
            </Tooltip>
        </Polygon>
    );
};

const FrontendMap = ({ height = "400px" }) => {
    const [sites, setSites] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bounds, setBounds] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(13); // Default zoom level

    useEffect(() => {
        Promise.all([
            fetch('/api/sites').then((res) => res.json()),
            fetch('/api/areas').then((res) => res.json())
        ])
        .then(([sitesData, areasData]) => {
            setSites(sitesData);
            setAreas(areasData);
            if (sitesData && sitesData.length > 0) {
                const siteBounds = L.latLngBounds(
                    sitesData.map(site => [site.latitude_4326, site.longitude_4326])
                );
                setBounds(siteBounds);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <MapContainer
            bounds={bounds || [[45.398181, 5.140242], [47.808455, 10.492294]]}
            scrollWheelZoom={true}
            style={{ height: height, width: '100%' }}
            minZoom={8}
        >
            <MapEvents setZoomLevel={setZoomLevel} />
            <BaseLayers />
            {zoomLevel >= 15 && (
                <MarkerClusterGroup maxClusterRadius={25} chunkedLoading>
                    {sites.map(site => (
                        <Marker
                            key={site.id}
                            position={[site.latitude_4326, site.longitude_4326]}
                            icon={L.AwesomeMarkers.icon({
                                icon: 'trowel',
                                iconColor: 'black',
                                prefix: 'fa',
                                markerColor: 'green',
                            })}
                        >
                            <Popup>
                                <strong>{site.name}</strong>
                                <br />
                                Elevation: {site.elevation_metres}
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            )}
            {areas.map(area => (
                <ZoomablePolygon key={area.id} area={area} />
            ))}
        </MapContainer>
    );
};

export default FrontendMap;
