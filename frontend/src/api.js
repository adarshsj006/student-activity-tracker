import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

export const getActivities = () => api.get("/activities");
export const addActivity = (data) => api.post("/activities", data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
export const getSummary = () => api.get("/summary");

// Turns any API/network error into a readable message
export function errorMessage(err) {
  if (!err.response) return "Cannot reach the server. Is the backend running?";
  const detail = err.response.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors: [{loc: [...], msg: "..."}]
    return detail.map((d) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ");
  }
  return detail || "Something went wrong.";
}
