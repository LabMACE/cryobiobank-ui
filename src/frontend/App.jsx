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
  const [productFilter, setProductFilter] = useState('All');
  const [view, setView] = useState(null);
  const [activeSiteId, setActiveSiteId] = useState(null);
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

  // Enrich sites with replicate list, aggregated sample types, and child counts.
  // Drop sites with no replicates (per "no empty data" rule).
  const enrichedSites = useMemo(() => {
    return sites
      .map(site => {
        const siteReps = replicates.filter(r => r.site_id === site.id);
        const sampleTypes = [...new Set(siteReps.map(r => r.sample_type).filter(Boolean))];
        return {
          ...site,
          replicates: siteReps,
          sample_types: sampleTypes,
          replicate_count: siteReps.length,
        };
      })
      .filter(s => s.replicate_count > 0);
  }, [sites, replicates]);

  // Apply Snow/Soil and Product filters, recomputing per-type counts so downstream
  // views (sidebar badges, panel header) reflect exactly what's visible.
  const filteredSites = useMemo(() => {
    return enrichedSites
      .map(s => {
        const matchingReps = sampleTypeFilter === 'All'
          ? s.replicates
          : s.replicates.filter(r => r.sample_type === sampleTypeFilter);
        const product_counts = matchingReps.reduce(
          (acc, r) => ({
            isolates: acc.isolates + (r.isolates?.length || 0),
            samples: acc.samples + (r.samples?.filter(x => x.is_available).length || 0),
            dna: acc.dna + (r.dna?.length || 0),
          }),
          { isolates: 0, samples: 0, dna: 0 }
        );
        return {
          ...s,
          matching_replicate_count: matchingReps.length,
          product_counts,
        };
      })
      .filter(s => {
        if (s.matching_replicate_count === 0) return false;
        if (productFilter !== 'All') {
          const key = productFilter.toLowerCase();
          if ((s.product_counts[key] || 0) === 0) return false;
        }
        return true;
      });
  }, [enrichedSites, sampleTypeFilter, productFilter]);

  // Area stats derived from filtered sites
  const areaStats = useMemo(() => {
    return areas
      .map(area => {
        const areaSites = filteredSites.filter(s => s.area_id === area.id);
        const sampleTypes = [...new Set(areaSites.flatMap(s => s.sample_types))];
        return {
          ...area,
          siteCount: areaSites.length,
          replicateCount: areaSites.reduce((sum, s) => sum + s.matching_replicate_count, 0),
          sampleTypes,
          sites: areaSites,
        };
      })
      .filter(a => a.siteCount > 0);
  }, [areas, filteredSites]);

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

  // Fetch a selected replicate's children when drilling in
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

  const handleSiteClick = (siteId) => {
    setActiveSiteId(siteId);
    setActiveReplicateId(null);
    setReplicateData(null);
    setSelectedItem(null);
    setView('site');
    setZoomToSiteId(siteId);
  };

  const handleReplicateClick = (replicateId) => {
    setActiveReplicateId(replicateId);
    setSelectedItem(null);
    setView('replicate');
  };

  const handleBackToSite = () => {
    setActiveReplicateId(null);
    setReplicateData(null);
    setSelectedItem(null);
    setView('site');
  };

  const handleAreaClick = (areaId) => {
    setActiveAreaId(areaId);
    setActiveSiteId(null);
    setActiveReplicateId(null);
    setReplicateData(null);
    setView(null);
  };

  const handleClosePanel = () => {
    setActiveSiteId(null);
    setActiveReplicateId(null);
    setReplicateData(null);
    setSelectedItem(null);
    setView(null);
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
      // Stop page snap-scroll when wheeling over map chrome. For the data
      // and detail panels we only stop propagation (not preventDefault) so
      // their internal content can still scroll natively.
      if (event.target.closest('.data-panel, .detail-side-panel')) {
        event.stopPropagation();
        return;
      }
      if (event.target.closest(
        '.leaflet-popup, .leaflet-control, .leaflet-tooltip, .map-legend'
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

  const activeSite = view ? filteredSites.find(s => s.id === activeSiteId) : null;

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
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        areaStats={areaStats}
        activeAreaId={activeAreaId}
        setActiveAreaId={setActiveAreaId}
        onSiteClick={handleSiteClick}
      />

      <main className="sections">
        <Cover sectionsRef={sectionsRef} />
        <MapSection
          sites={filteredSites}
          areas={areas}
          activeSiteId={activeSiteId}
          activeAreaId={activeAreaId}
          onSiteClick={handleSiteClick}
          onAreaClick={handleAreaClick}
          view={view}
          activeSite={activeSite}
          activeReplicateId={activeReplicateId}
          onReplicateClick={handleReplicateClick}
          onBackToSite={handleBackToSite}
          sampleTypeFilter={sampleTypeFilter}
          productFilter={productFilter}
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
