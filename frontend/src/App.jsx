import { useState, useEffect, useCallback } from "react";
import ActivityForm from "./components/ActivityForm.jsx";
import ActivityTable from "./components/ActivityTable.jsx";
import Summary from "./components/Summary.jsx";
import { getActivities, getSummary, deleteActivity, errorMessage } from "./api.js";

export default function App() {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch both the list and the summary from the backend
  const loadData = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([getActivities(), getSummary()]);
      setActivities(a.data);
      setSummary(s.data);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs once when the page loads
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="page">
      <header>
        <h1>Student Activity Tracker</h1>
        <p>Log what students do and see who puts in the most hours.</p>
      </header>

      {error && <div className="banner error">{error}</div>}

      <Summary summary={summary} loading={loading} />

      <div className="grid">
        <ActivityForm onAdded={loadData} />
        <ActivityTable activities={activities} loading={loading} onDelete={handleDelete} />
      </div>
    </div>
  );
}
