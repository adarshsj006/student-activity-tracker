export default function ActivityTable({ activities, loading, onDelete }) {
  return (
    <section className="card">
      <h2>Activities</h2>
      {loading ? (
        <p className="muted">Loading activities...</p>
      ) : activities.length === 0 ? (
        <p className="muted">No activities yet. Add the first one using the form.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Activity</th>
                <th className="num">Hours</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.activity}</td>
                  <td className="num">{a.hours}</td>
                  <td>
                    <button className="link-danger" onClick={() => onDelete(a.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
