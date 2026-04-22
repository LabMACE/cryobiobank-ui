export default function EmptyState({ variant }) {
  if (variant === 'loading') {
    return <div className="isodir-empty">Loading…</div>;
  }
  if (variant === 'no-data') {
    return <div className="isodir-empty"><p>No public isolates yet.</p></div>;
  }
  return <div className="isodir-empty"><p>No isolates match your search.</p></div>;
}
