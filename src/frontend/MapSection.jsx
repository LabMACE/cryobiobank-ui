import { MapContainer } from 'react-leaflet';
import CryoLayers from '../maps/CryoLayers';
import DataPanel from './DataPanel';
import DetailSidePanel from './DetailSidePanel';

export default function MapSection({
  sites,
  areas,
  activeSiteId,
  activeAreaId,
  onSiteClick,
  onAreaClick,
  view,
  activeSite,
  activeFieldRecordId,
  onFieldRecordClick,
  onBackToSite,
  sampleTypeFilter,
  productFilter,
  fieldRecordData,
  onClosePanel,
  loading,
  onItemClick,
  onFieldRecordInfo,
  selectedItem,
  onCloseDetail,
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
              activeSiteId={activeSiteId}
              activeAreaId={activeAreaId}
              onSiteClick={onSiteClick}
              onAreaClick={onAreaClick}
              shouldRecenter={shouldRecenter}
              setShouldRecenter={setShouldRecenter}
              zoomToSiteId={zoomToSiteId}
              setZoomToSiteId={setZoomToSiteId}
            />
          </MapContainer>
          {selectedItem && (() => {
            const activeFieldRecord = activeSite?.field_records?.find(r => r.id === activeFieldRecordId);
            return (
              <DetailSidePanel
                type={selectedItem.type}
                itemId={selectedItem.id}
                onClose={onCloseDetail}
                contextSampleType={fieldRecordData?.sample_type}
                parentFieldRecord={activeFieldRecord || null}
                onBack={() => activeFieldRecord && onFieldRecordInfo(activeFieldRecord.id)}
              />
            );
          })()}
          {view && (
            <DataPanel
              view={view}
              activeSite={activeSite}
              activeFieldRecordId={activeFieldRecordId}
              fieldRecordData={fieldRecordData}
              sampleTypeFilter={sampleTypeFilter}
              productFilter={productFilter}
              onFieldRecordClick={onFieldRecordClick}
              onFieldRecordInfo={onFieldRecordInfo}
              onBackToSite={onBackToSite}
              onClose={onClosePanel}
              loading={loading}
              onItemClick={onItemClick}
              selectedItemId={selectedItem?.id}
            />
          )}
        </div>
      </div>
    </section>
  );
}
