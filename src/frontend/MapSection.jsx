import { MapContainer } from 'react-leaflet';
import CryoLayers from '../maps/CryoLayers';
import DataPanel from './DataPanel';

export default function MapSection({
  sites,
  areas,
  replicates,
  activeReplicateId,
  activeAreaId,
  onReplicateClick,
  onSiteClick,
  onAreaClick,
  sampleTypeFilter,
  replicateData,
  onClosePanel,
  loading,
  shouldRecenter,
  setShouldRecenter,
  zoomToSiteId,
  setZoomToSiteId,
  sectionsRef,
}) {
  return (
    <section
      className="section"
      data-section="map"
      ref={(el) => (sectionsRef.current[1] = el)}
    >
      <div className="map-wrapper">
        <div className="map-with-chart">
          <MapContainer
            bounds={[[45.398181, 5.140242], [47.808455, 10.492294]]}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            maxBounds={[
              [45.398181, 5.140242],
              [47.808455, 10.492294],
            ]}
            minZoom={9}
          >
            <CryoLayers
              sites={sites}
              areas={areas}
              replicates={replicates}
              activeReplicateId={activeReplicateId}
              activeAreaId={activeAreaId}
              onReplicateClick={onReplicateClick}
              onSiteClick={onSiteClick}
              onAreaClick={onAreaClick}
              sampleTypeFilter={sampleTypeFilter}
              shouldRecenter={shouldRecenter}
              setShouldRecenter={setShouldRecenter}
              zoomToSiteId={zoomToSiteId}
              setZoomToSiteId={setZoomToSiteId}
            />
          </MapContainer>
          {replicateData && (
            <DataPanel
              replicateData={replicateData}
              onClose={onClosePanel}
              loading={loading}
            />
          )}
        </div>
      </div>
    </section>
  );
}
