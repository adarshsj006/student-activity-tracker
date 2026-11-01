export default function Summary({ summary, loading }) {
  const show = (v) => (loading || !summary ? "..." : v);

  return (
    <section className="summary">
      <div>
        <span className="label">Total entries</span>
        <strong>{show(summary?.total_entries)}</strong>
      </div>
      <div>
        <span className="label">Total hours</span>
        <strong>{show(summary?.total_hours)}</strong>
      </div>
      <div>
        <span className="label">Most active student</span>
        <strong>{show(summary?.most_active_user ?? "None yet")}</strong>
      </div>
    </section>
  );
}
