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
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import * as L from 'leaflet';
import { useEffect, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster'


export const SitesMap = (
    {
        height = "500px",
        labels = true,
    }
) => {
    const [bounds, setBounds] = useState(null);
    const [markers, setMarkers] = useState(null);
    const createPath = useCreatePath();
    const record = useRecordContext();  // If loaded from a record page, this will be the record
    const { data: sites, isPending: isPendingGetList } = useGetList('sites', {});

    useEffect(() => {
        if (sites) {
            if (sites.length > 0) {
                if (record) {
                    setBounds(L.latLngBounds([[record.latitude_4326, record.longitude_4326], [record.latitude_4326, record.longitude_4326]]).pad(5000));
                } else {
                    setBounds(L.latLngBounds(sites.map(site => [site.latitude_4326, site.longitude_4326])).pad(0.6));
                }
                setMarkers(sites.map(site => {
                    const opacity = !record ? 1 : (site.id === record.id ? 1.0 : 0.6);
                    return (
                        <Marker
                            key={site.id}
                            position={[site.latitude_4326, site.longitude_4326]}
                            icon={L.AwesomeMarkers.icon({
                                icon: 'trowel',
                                iconColor: 'black',
                                prefix: 'fa',
                                markerColor: 'green',
                            })}
                            opacity={opacity}
                        >
                            {labels ? <Tooltip permanent>{site.name}</Tooltip> : null}
                            <Popup>
                                <b>{site.name}</b>
                                <br />
                                Elevation: {site.elevation_metres}
                                <br />
                                Replicates: {site.replicates.length}
                                <br /><br />
                                <Link to={createPath({ type: 'show', resource: 'sites', id: site['id'] })}>
                                    Go to Site
                                </Link>
                            </Popup>
                        </Marker>
                    );
                }));
            } else {
                setBounds(L.latLngBounds([[46.8, 6.0], [46.8, 10.5]]));
            }
        }
    }, [sites, createPath, record]);

    if (!bounds || isPendingGetList) {
        return <Loading />;
    }

    return (
        <MapContainer
            style={{ width: '100%', height: height }}
            bounds={bounds}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            <MarkerClusterGroup maxClusterRadius={25} chunkedLoading >
                {markers}
            </MarkerClusterGroup>
        </MapContainer>
    );
};
