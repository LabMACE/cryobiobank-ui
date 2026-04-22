import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.css';
import 'leaflet/dist/leaflet.css';
import Cover from './Cover';
import MapSection from './MapSection';
import IsolatesSection from './isolates/IsolatesSection';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [cameFromIsolates, setCameFromIsolates] = useState(false);
  const pendingIsolateSelectRef = useRef(null);

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
          sample_type: activeRep?.sample_type ?? null,
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

  const handleReplicateInfo = (id) => {
    setSelectedItem({ type: 'replicates', id });
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Respond to ?focus_site=<id>[&replicate=<id>&isolate=<id>&from=isolates] —
  // zoom to the site, optionally drill into a replicate and pre-select an
  // isolate, then scroll to map. Strip params afterwards.
  useEffect(() => {
    const focusSite = searchParams.get('focus_site');
    if (!focusSite) return;
    if (sites.length === 0) return;
    const replicateId = searchParams.get('replicate');
    const isolateId = searchParams.get('isolate');
    const from = searchParams.get('from');

    setActiveSiteId(focusSite);
    setReplicateData(null);
    setSelectedItem(null);
    setZoomToSiteId(focusSite);
    setCameFromIsolates(from === 'isolates');

    if (replicateId) {
      setActiveReplicateId(replicateId);
      setView('replicate');
      pendingIsolateSelectRef.current = isolateId
        ? { type: 'isolates', id: isolateId, replicateId }
        : null;
    } else {
      setActiveReplicateId(null);
      setView('site');
      pendingIsolateSelectRef.current = null;
    }

    sectionsRef.current[1]?.scrollIntoView({ behavior: 'smooth' });

    const next = new URLSearchParams(searchParams);
    next.delete('focus_site');
    next.delete('replicate');
    next.delete('isolate');
    next.delete('from');
    setSearchParams(next, { replace: true });
  }, [sites, searchParams, setSearchParams]);

  // Once replicate data has loaded for a pending deep-link, open the isolate
  // detail side panel.
  useEffect(() => {
    const pending = pendingIsolateSelectRef.current;
    if (!pending) return;
    if (!replicateData) return;
    if (activeReplicateId !== pending.replicateId) return;
    setSelectedItem({ type: pending.type, id: pending.id });
    pendingIsolateSelectRef.current = null;
  }, [replicateData, activeReplicateId]);

  // Respond to ?section=<cover|map|isolates|about> — scroll to that section on
  // mount, then strip the param. Used when landing from the /isolates alias.
  useEffect(() => {
    const section = searchParams.get('section');
    if (!section) return;
    const index = { cover: 0, map: 1, isolates: 2, about: 3 }[section];
    if (index == null) return;
    const target = sectionsRef.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
    const next = new URLSearchParams(searchParams);
    next.delete('section');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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
          onReplicateInfo={handleReplicateInfo}
          selectedItem={selectedItem}
          onCloseDetail={handleCloseDetail}
          shouldRecenter={shouldRecenter}
          setShouldRecenter={setShouldRecenter}
          zoomToSiteId={zoomToSiteId}
          setZoomToSiteId={setZoomToSiteId}
          sectionsRef={sectionsRef}
        />
        <IsolatesSection sectionsRef={sectionsRef} index={2} />
        <About sectionsRef={sectionsRef} />

        {cameFromIsolates && (
          <button
            type="button"
            className="back-to-isolates"
            onClick={() => {
              sectionsRef.current[2]?.scrollIntoView({ behavior: 'smooth' });
              setCameFromIsolates(false);
            }}
          >
            ← Back to isolates
          </button>
        )}
      </main>
    </div>
  );
}
