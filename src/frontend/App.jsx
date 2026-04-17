import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import Cover from './Cover';
import MapSection from './MapSection';
import About from './About';
import SideBar from './SideBar';

export default function FrontendApp() {
  const [sites, setSites] = useState([]);
  const [areas, setAreas] = useState([]);
  const [replicates, setReplicates] = useState([]);
  const [sampleTypeFilter, setSampleTypeFilter] = useState('All');
  const [activeReplicateId, setActiveReplicateId] = useState(null);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [replicateData, setReplicateData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [zoomToSiteId, setZoomToSiteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const sectionsRef = useRef([]);

  // Compute area stats from already-fetched sites and replicates data
  const areaStats = useMemo(() => {
    return areas.map(area => {
      const areaSites = sites
        .filter(s => s.area_id === area.id)
        .map(site => {
          const siteReps = replicates.filter(r => r.site_id === site.id);
          const siteSampleTypes = new Set(siteReps.flatMap(r => [
            ...(r.samples || []).map(s => s.sample_type),
            ...(r.isolates || []).map(i => i.sample_type),
          ]));
          return {
            ...site,
            sample_types: [...siteSampleTypes],
            replicate_ids: siteReps.map(r => r.id),
          };
        });
      const areaSiteIds = new Set(areaSites.map(s => s.id));
      const areaReps = replicates.filter(r => areaSiteIds.has(r.site_id));
      const sampleTypes = new Set(areaReps.flatMap(r => [
        ...(r.samples || []).map(s => s.sample_type),
        ...(r.isolates || []).map(i => i.sample_type),
      ]));
      return {
        ...area,
        siteCount: areaSites.length,
        replicateCount: areaReps.length,
        sampleTypes: [...sampleTypes],
        sites: areaSites,
      };
    });
  }, [areas, sites, replicates]);

  // Enrich replicates with parent site info and derive sample_types from joined children
  const enrichedReplicates = useMemo(() => {
    return replicates.map(rep => {
      const site = sites.find(s => s.id === rep.site_id);
      const types = new Set([
        ...(rep.samples || []).map(s => s.sample_type),
        ...(rep.isolates || []).map(i => i.sample_type),
      ]);
      return {
        ...rep,
        latitude_4326: site?.latitude_4326,
        longitude_4326: site?.longitude_4326,
        site_name: site?.name,
        sample_types: [...types],
        elevation_metres: site?.elevation_metres,
      };
    }).filter(rep => rep.latitude_4326 != null && rep.longitude_4326 != null);
  }, [replicates, sites]);

  // Fetch sites, areas, and replicates on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/sites?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch('/api/areas?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch('/api/site_replicates?range=[0,9999]').then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([sitesData, areasData, replicatesData]) => {
        setSites(Array.isArray(sitesData) ? sitesData : []);
        setAreas(Array.isArray(areasData) ? areasData : []);
        setReplicates(Array.isArray(replicatesData) ? replicatesData : []);
      })
      .catch(console.error);
  }, []);

  // Fetch isolates/samples when a replicate is selected
  useEffect(() => {
    if (!activeReplicateId) {
      setReplicateData(null);
      return;
    }

    const fetchReplicateData = async () => {
      setLoading(true);
      try {
        const [isolates, samples, dna] = await Promise.all(
          ['isolates', 'samples', 'dna'].map(async (entity) => {
            const res = await fetch(
              `/api/${entity}?filter=${encodeURIComponent(JSON.stringify({ site_replicate_id: activeReplicateId }))}&range=[0,9999]`
            );
            if (res.ok) return res.json();
            return [];
          })
        );
        const activeRep = replicates.find(r => r.id === activeReplicateId);
        setReplicateData({
          isolates,
          samples,
          dna,
          metagenome_url: activeRep?.metagenome_url ?? null,
        });
      } catch (err) {
        console.error('Error fetching replicate data:', err);
        setReplicateData({ isolates: [], samples: [], dna: [], metagenome_url: null });
      } finally {
        setLoading(false);
      }
    };

    fetchReplicateData();
  }, [activeReplicateId, replicates]);

  const handleReplicateClick = (replicateId) => {
    setActiveReplicateId(replicateId);
    setSelectedItem(null);
  };

  const handleSiteClick = (siteId) => {
    // Zoom to site but don't select a replicate
    setActiveReplicateId(null);
    setReplicateData(null);
    setZoomToSiteId(siteId);
  };

  const handleAreaClick = (areaId) => {
    setActiveAreaId(areaId);
    setActiveReplicateId(null);
    setReplicateData(null);
  };

  const handleClosePanel = () => {
    setActiveReplicateId(null);
    setReplicateData(null);
    setSelectedItem(null);
  };

  const handleItemClick = (type, id) => {
    setSelectedItem({ type, id });
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Prevent scroll events on map overlay elements from triggering section
  // snap-scroll.
  useEffect(() => {
    const handleWheel = (event) => {
      if (event.target.closest(
        '.leaflet-popup, .leaflet-control, .leaflet-tooltip, .map-legend, .data-panel, .detail-side-panel'
      )) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    document.addEventListener('touchmove', handleWheel, { capture: true, passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('touchmove', handleWheel, { capture: true });
    };
  }, []);

  return (
    <div className="App">
      <SideBar
        sectionsRef={sectionsRef}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sampleTypeFilter={sampleTypeFilter}
        setSampleTypeFilter={setSampleTypeFilter}
        areaStats={areaStats}
        activeAreaId={activeAreaId}
        setActiveAreaId={setActiveAreaId}
        onSiteClick={handleSiteClick}
        sites={sites}
      />

      <main className="sections">
        <Cover sectionsRef={sectionsRef} />
        <MapSection
          sites={sites}
          areas={areas}
          replicates={enrichedReplicates}
          activeReplicateId={activeReplicateId}
          activeAreaId={activeAreaId}
          onReplicateClick={handleReplicateClick}
          onSiteClick={handleSiteClick}
          onAreaClick={handleAreaClick}
          sampleTypeFilter={sampleTypeFilter}
          replicateData={replicateData}
          onClosePanel={handleClosePanel}
          loading={loading}
          onItemClick={handleItemClick}
          selectedItem={selectedItem}
          onCloseDetail={handleCloseDetail}
          shouldRecenter={shouldRecenter}
          setShouldRecenter={setShouldRecenter}
          zoomToSiteId={zoomToSiteId}
          setZoomToSiteId={setZoomToSiteId}
          sectionsRef={sectionsRef}
        />
        <About sectionsRef={sectionsRef} />
      </main>
    </div>
  );
}
