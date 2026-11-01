import { useState } from "react";
import { addActivity, errorMessage } from "../api.js";

const empty = { name: "", activity: "", hours: "" };

export default function ActivityForm({ onAdded }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Basic client-side validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter the student's name.";
    if (!form.activity.trim()) e.activity = "Enter the activity.";
    const h = Number(form.hours);
    if (form.hours === "" || isNaN(h) || h <= 0) e.hours = "Hours must be more than 0.";
    else if (h > 24) e.hours = "Hours can't be more than 24.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setServerError("");
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await addActivity({
        name: form.name.trim(),
        activity: form.activity.trim(),
        hours: Number(form.hours),
      });
      setForm(empty);
      onAdded(); // tell App to refresh list + summary
    } catch (err) {
      setServerError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Add activity</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Student name
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Anjali" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label>
          Activity
          <input name="activity" value={form.activity} onChange={handleChange} placeholder="e.g. Football practice" />
          {errors.activity && <span className="field-error">{errors.activity}</span>}
        </label>

        <label>
          Hours
          <input name="hours" type="number" step="0.25" value={form.hours} onChange={handleChange} placeholder="e.g. 1.5" />
          {errors.hours && <span className="field-error">{errors.hours}</span>}
        </label>

        {serverError && <div className="banner error">{serverError}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save activity"}
        </button>
      </form>
    </section>
  );
}
