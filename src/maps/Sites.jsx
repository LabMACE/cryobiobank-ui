import {
    useRedirect,
    Link,
    useCreatePath,
    Loading,
    useListContext,
} from 'react-admin';
import {
    MapContainer,
    Polygon,
    Tooltip,
    Marker,
    Popup, Polyline
} from 'react-leaflet';
import { BaseLayers } from './Layers';
import { Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import * as L from 'leaflet';
import { useEffect, useState } from 'react';

export const SiteMap = ({ sites }) => {
    const [bounds, setBounds] = useState(null);
    const [markers, setMarkers] = useState(null);
    const createPath = useCreatePath();    

    useEffect(() => {
        if (sites &&(sites && sites.length > 0)) {
            console.log("SITES", sites);
            setBounds(L.latLngBounds(sites.map(site => [site.y, site.x])).pad(0.6));
            setMarkers(sites.map(site => {
                return (
                    <Marker
                        key={site.id}
                        position={[site.y, site.x]}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'trowel',
                            iconColor: 'black',
                            prefix: 'fa',
                            markerColor: 'green'
                        })}
                    >
                        <Tooltip permanent>{site.name}</Tooltip>
                        <Popup>
                            <b>{site.name}</b>
                            <br />
                            {site.description}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'sites', id: site['id'] })}>
                                Go to Site
                            </Link>
                        </Popup>
                    </Marker>
                );
            }));
        } else {
            setBounds(L.latLngBounds([[45.817993, 6.955911], [47.808455, 9.492294]]));
        }
    }, [sites, createPath]);
    
    if (!bounds) {
        return <Loading />;
    }

    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            bounds={bounds}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {markers}
        </MapContainer>
    );
};
