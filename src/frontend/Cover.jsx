export default function Cover({ sectionsRef }) {
  const sectionOrder = ['cover', 'map', 'about'];

  const scrollTo = (key) => {
    const idx = sectionOrder.indexOf(key);
    if (idx !== -1 && sectionsRef.current[idx]) {
      sectionsRef.current[idx].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="section cover"
      data-section="cover"
      ref={(el) => (sectionsRef.current[0] = el)}
    >
      <div className="cover-content">
        <h1>
          CryoBioBank
        </h1>
        <p className="cover-subtitle">Swiss alpine cryosphere sampling</p>
      </div>
      <button
        className="down-arrow"
        onClick={() => scrollTo('map')}
        aria-label="Scroll down"
      >
        ↓
      </button>
      <div className="attribution">
        <a
          href="https://www.epfl.ch"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/epfl.png"
            alt="EPFL Logo"
            style={{ height: '2rem', marginRight: '1rem' }}
          />
        </a>
      </div>
    </section>
  );
}
