import { LayersControl, TileLayer } from 'react-leaflet';

type BaseLayersProps = {
    defaultLayer?: 'SwissTopo' | 'SwissTopo Aerial' | 'swissALTI3D Relief';
};

export const BaseLayers = ({ defaultLayer = 'SwissTopo' }: BaseLayersProps) => {
    const { BaseLayer } = LayersControl;
    return (
        <LayersControl collapsed={false}>
            <BaseLayer checked={defaultLayer === 'SwissTopo'} name="SwissTopo">
                <TileLayer
                    attribution='&copy; <a href="https://www.swisstopo.admin.ch/">SwissTopo</a>'
                    url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
                />
            </BaseLayer>
            <BaseLayer checked={defaultLayer === 'SwissTopo Aerial'} name="SwissTopo Aerial">
                <TileLayer
                    attribution='&copy; <a href="https://www.swisstopo.admin.ch/">SwissTopo</a>'
                    url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"
                />
            </BaseLayer>
            <BaseLayer checked={defaultLayer === 'swissALTI3D Relief'} name="swissALTI3D Relief">
                <TileLayer
                    attribution='&copy; <a href="https://www.swisstopo.admin.ch/">SwissTopo swissALTI3D</a>'
                    url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.swissalti3d-reliefschattierung/default/current/3857/{z}/{x}/{y}.png"
                />
            </BaseLayer>
        </LayersControl>
    );
};
