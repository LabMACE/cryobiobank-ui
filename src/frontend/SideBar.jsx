import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const sampleTypeOptions = ['All', 'Snow', 'Soil'];
const productOptions = ['All', 'Isolates', 'Samples', 'DNA'];

export default function SideBar({
  sectionsRef,
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  setActiveSection,
  sampleTypeFilter,
  setSampleTypeFilter,
  productFilter,
  setProductFilter,
  areaStats,
  activeAreaId,
  setActiveAreaId,
  onSiteClick,
}) {
  const menuItems = [
    { key: 'cover', label: 'Home' },
    { key: 'map', label: 'Map' },
    { key: 'isolates', label: 'Isolates' },
    { key: 'about', label: 'About' },
  ];

  const btnRefs = useRef({});
  const productBtnRefs = useRef({});
  const [thumbStyle, setThumbStyle] = useState({ left: 0, width: 0 });
  const [productThumbStyle, setProductThumbStyle] = useState({ left: 0, width: 0 });

  const scrollTo = (key) => {
    const idx = menuItems.findIndex(i => i.key === key);
    sectionsRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  // IntersectionObserver for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.section);
          }
        });
      },
      { threshold: 0.6 }
    );
    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionsRef, setActiveSection]);

  // Auto-open when scrolling past Cover
  useEffect(() => {
    if (activeSection !== 'cover') {
      setSidebarOpen(true);
    }
  }, [activeSection, setSidebarOpen]);

  useLayoutEffect(() => {
    const updateThumb = () => {
      const ref = btnRefs.current[sampleTypeFilter];
      if (ref) {
        const { offsetLeft, offsetWidth } = ref;
        setThumbStyle({ left: offsetLeft, width: offsetWidth });
      }
      const pref = productBtnRefs.current[productFilter];
      if (pref) {
        setProductThumbStyle({ left: pref.offsetLeft, width: pref.offsetWidth });
      }
    };
    updateThumb();
    window.addEventListener('resize', updateThumb);
    return () => window.removeEventListener('resize', updateThumb);
  }, [sampleTypeFilter, productFilter, sidebarOpen]);

  const selectedArea = activeAreaId
    ? (areaStats || []).find(a => a.id === activeAreaId)
    : null;

  const areaSites = selectedArea?.sites || [];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div
        className="grabber"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      />
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon fontSize="large" />
        ) : (
          <ChevronRightIcon fontSize="large" />
        )}
      </button>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className="menu-btn"
                onClick={() => scrollTo(item.key)}
              >
                {activeSection === item.key ? (
                  <strong>{item.label}</strong>
                ) : (
                  item.label
                )}
              </button>
            </li>
          ))}

          {/* Data section — visible when on map */}
          {activeSection === 'map' && (
            <li>
              <hr style={{ width: '90%', margin: '1rem 0', marginLeft: 0 }} />

              {/* Sample type toggle: All / Snow / Soil */}
              <div className="mode-switch">
                <div
                  className="mode-switch-thumb"
                  style={{ left: thumbStyle.left, width: thumbStyle.width }}
                />
                {sampleTypeOptions.map((opt) => (
                  <button
                    key={opt}
                    ref={(el) => (btnRefs.current[opt] = el)}
                    className={`mode-btn ${sampleTypeFilter === opt ? 'active' : ''}`}
                    onClick={() => setSampleTypeFilter(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Product toggle: All / Isolates / Samples / DNA */}
              <div className="mode-switch" style={{ marginTop: '0.5rem' }}>
                <div
                  className="mode-switch-thumb"
                  style={{ left: productThumbStyle.left, width: productThumbStyle.width }}
                />
                {productOptions.map((opt) => (
                  <button
                    key={opt}
                    ref={(el) => (productBtnRefs.current[opt] = el)}
                    className={`mode-btn ${productFilter === opt ? 'active' : ''}`}
                    onClick={() => setProductFilter(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <hr style={{ width: '90%', margin: '1rem 0', marginLeft: 0 }} />

              {/* Area navigation */}
              {!activeAreaId ? (
                <div className="area-list">
                  <div className="area-list-header">Areas</div>
                  {(areaStats || []).length === 0 ? (
                    <div className="area-list-empty">No areas match</div>
                  ) : (
                    (areaStats || []).map((area) => (
                      <button
                        key={area.id}
                        className="area-item"
                        onClick={() => setActiveAreaId(area.id)}
                      >
                        <span
                          className="area-color-dot"
                          style={{ backgroundColor: area.colour || '#888' }}
                        />
                        <span className="area-item-name">{area.name}</span>
                        <span className="area-item-badge">{area.siteCount}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="area-drilldown">
                  <button
                    className="area-back-btn"
                    onClick={() => setActiveAreaId(null)}
                  >
                    <ArrowBackIcon fontSize="small" />
                    Back to areas
                  </button>
                  {selectedArea && (
                    <>
                      <div className="area-drilldown-header">
                        <span
                          className="area-color-dot"
                          style={{ backgroundColor: selectedArea.colour || '#888' }}
                        />
                        {selectedArea.name}
                      </div>
                      <div className="area-drilldown-stats">
                        {selectedArea.siteCount} site{selectedArea.siteCount !== 1 ? 's' : ''}
                        {' · '}
                        {selectedArea.fieldRecordCount} field record{selectedArea.fieldRecordCount !== 1 ? 's' : ''}
                      </div>
                      <div className="area-sites-list">
                        {areaSites.map((site) => (
                          <button
                            key={site.id}
                            className="area-site-item"
                            onClick={() => onSiteClick(site.id)}
                          >
                            <span className="area-site-name">{site.name}</span>
                            <span className="area-site-types">
                              {(site.sample_types || []).join(', ')}
                            </span>
                            <span className="area-item-badge">
                              {site.matching_field_record_count ?? site.field_record_count ?? 0}
                            </span>
                          </button>
                        ))}
                        {areaSites.length === 0 && (
                          <div className="area-list-empty">No matching sites</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
