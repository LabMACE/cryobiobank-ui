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


export const SiteMap = ({ sites }) => {
    const redirect = useRedirect();
    const createPath = useCreatePath();
    // // const { data: areas, isPending } = useListContext();

    // if (isPending) return <Loading />;

    // if (!areas || (areas && areas.length === 0)) {
    //     return <Typography variant="body1">No areas found</Typography>;
    // }

    // if (!areas.some(area => area["geom"] && area["geom"]["coordinates"])) {
    //     return <Typography variant="body">Add records to an area to display the map</Typography>;
    // }

    // const flipCoordinates = (coords) => {
    //     return coords.map(coord => [coord[1], coord[0]]);
    // };

    // const flipPolygonCoordinates = (polygon) => {
    //     return polygon.map(ring => flipCoordinates(ring));
    // };

    // const validAreas = areas.filter(area => area["geom"] && area["geom"]["coordinates"]);
    // const allCoordinates = validAreas.flatMap(area => flipPolygonCoordinates(area["geom"]["coordinates"])[0]);
    // const bounds = L.latLngBounds(allCoordinates).pad(0.6);
    const validAreas = [];
    console.log("SITES", sites);
    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            // bounds={
            //     [[46.5, 6.0], [47.5, 9.0]]  // Tighter bounds for Switzerland
            // }
            bounds={L.latLngBounds(sites.map(site => [site.y, site.x])).pad(0.6)}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {sites.map((site, index) => (
                <Marker
                    key={index}
                    position={[site["y"], site["x"]]}
                    icon={L.AwesomeMarkers.icon({
                        icon: 'trowel',
                        iconColor: 'black',
                        prefix: 'fa',
                        markerColor: 'green'
                    })}
                >
                    <Tooltip permanent>{site["name"]}</Tooltip>
                    <Popup>
                        <b>{site["name"]}</b>
                        <br />
                        {site["description"]}
                        <br /><br />
                        <Link to={createPath({ type: 'show', resource: 'sites', id: site['id'] })}>
                            Go to Site
                        </Link>
                    </Popup>
                </Marker>
            ))}
            {/* {validAreas.map((area) => (
                <Polygon
                    key={area.id}  // Use area.id instead of index
                    pathOptions={{ fillOpacity: 0.25, color: area.project.color }}
                    eventHandlers={{
                        click: () => {
                            redirect('show', 'areas', area['id']);
                        }
                    }}
                // positions={flipPolygonCoordinates(area["geom"]['coordinates'])}
                >
                    <Tooltip permanent interactive={true}>
                        <Link to={createPath({ type: 'show', resource: 'areas', id: area['id'] })}>
                            {area.name}
                        </Link>
                    </Tooltip>
                </Polygon>
            ))} */}
        </MapContainer>
    );
};
