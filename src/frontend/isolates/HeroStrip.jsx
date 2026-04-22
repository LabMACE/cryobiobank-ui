export default function HeroStrip({ total }) {
  return (
    <header className="isodir-header">
      <h1 className="isodir-title">Isolates</h1>
      {total != null && (
        <span className="isodir-header-count">
          <strong>{total}</strong> total
        </span>
      )}
    </header>
  );
}
