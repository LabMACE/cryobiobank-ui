import React, { useState, useRef, useEffect } from 'react';
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

// Helper component for rendering a polygon that fits to bounds when clicked
const ZoomablePolygon = ({ area }) => {
    const map = useMap();
    
    // Check if area has valid geometry data
    if (!area.geom || !area.geom.coordinates || !Array.isArray(area.geom.coordinates[0])) {
        console.warn(`Area "${area.name}" has no valid geometry data`);
        return null; // Don't render anything for areas without geometry
    }

    // Convert coordinates from [lng, lat] to [lat, lng]
    const positions = area.geom.coordinates[0].map(coord => [coord[1], coord[0]]);

    // Handler to fit the map view to show the entire polygon
    const handleZoom = () => {
        // Calculate the bounding box of the polygon
        const lats = positions.map(pos => pos[0]);
        const lngs = positions.map(pos => pos[1]);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        // Create bounds and fit the map to show the entire polygon
        const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
        map.fitBounds(bounds, { padding: [20, 20] }); // Add some padding around the polygon
    };

    return (
        <Polygon
            positions={positions}
            color={area.colour}
            eventHandlers={{ click: handleZoom }}
        >
            <Tooltip permanent interactive={true}>
                {/* Click handler fits map to show entire polygon */}
                <span onClick={handleZoom} style={{ cursor: 'pointer' }}>
                    {area.name}
                </span>
            </Tooltip>
        </Polygon>
    );
};

const FrontendMap = ({ height = "60%", width = "80%" }) => {
    const [sites, setSites] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bounds, setBounds] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(13); // Default zoom level
    const fittedRef = useRef(false);  // Control refitting of the bounds at zoom

    useEffect(() => {
        Promise.all([
            fetch('/api/public/sites').then((res) => {
                if (!res.ok) throw new Error(`Sites API error: ${res.status}`);
                return res.json();
            }),
            fetch('/api/public/areas').then((res) => {
                if (!res.ok) throw new Error(`Areas API error: ${res.status}`);
                return res.json();
            })
        ])
        .then(([sitesData, areasData]) => {
            setSites(Array.isArray(sitesData) ? sitesData : []);
            setAreas(Array.isArray(areasData) ? areasData : []);

            // Calculate bounds for sites
            const siteBounds = sitesData && sitesData.length > 0 ? L.latLngBounds(
                sitesData.map(site => [site.latitude_4326, site.longitude_4326])
            ) : null;

            // Calculate bounds for areas (safely handle missing geometry)
            let areaBounds = null;
            if (areasData && areasData.length > 0) {
                const areaCoords = areasData
                    .filter(area => area.geom && area.geom.coordinates && area.geom.coordinates[0])
                    .flatMap(area => area.geom.coordinates[0].map(coord => [coord[1], coord[0]]));
                
                if (areaCoords.length > 0) {
                    areaBounds = L.latLngBounds(areaCoords);
                }
            }

            // Combine bounds
            const combinedBounds = siteBounds && areaBounds ? siteBounds.extend(areaBounds) : siteBounds || areaBounds;

            setBounds(combinedBounds);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Set empty arrays so the map still renders
            setSites([]);
            setAreas([]);
        });
    }, []);


    // Component to update map view when bounds change
    const FitBounds = ({ bounds }) => {
        const map = useMap();

        useEffect(() => {
            if (bounds && !fittedRef.current) {
                map.fitBounds(bounds);
                fittedRef.current = true;
            }
            
        }, [bounds, map, fittedRef]);

        return null;
    };

    return (
        <MapContainer
            bounds={bounds || [[45.398181, 5.140242], [47.808455, 10.492294]]}
            scrollWheelZoom={true}
            style={{ 
                height: height, 
                width: width
            }}
            maxBounds={[
                [45.398181, 5.140242],
                [47.808455, 10.492294]
            ]}
            minZoom={9}
        >
            <MapEvents setZoomLevel={setZoomLevel} />
            <BaseLayers />
            <FitBounds bounds={bounds} />
            {zoomLevel >= 12 && (
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
