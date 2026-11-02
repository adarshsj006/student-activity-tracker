# Student Activity Tracker

A small full-stack web app for logging student activities and viewing a summary. Users can add an activity (student name, activity, hours), see all activities in a table, delete entries, and view the totals and the most active student.

Built as the machine test for the **Python Internship** at Aifer Education Pvt. Ltd.

**Tech stack:** React (Vite) + Axios on the frontend, Python FastAPI + SQLite on the backend.

---

## Features

- Add an activity with **name, activity and hours**
- View all activities in a table (newest first)
- **Summary section:** total entries, total hours, most active student
- **Delete** an activity
- Validation on both the frontend and the backend
- Loading states and clear error messages (including when the server is unreachable)
- Data is saved in **SQLite**, so it survives server restarts
- Automated API tests with pytest

---

## Project structure

```
student-activity-tracker/
├── README.md
├── package.json              # optional: run both servers with one command
├── backend/
│   ├── main.py               # FastAPI app, routes, validation, SQLite
│   ├── test_api.py           # automated API tests
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx          # entry point
        ├── App.jsx           # state, data loading, layout
        ├── api.js            # all Axios calls + error messages
        ├── index.css         # styles
        └── components/
            ├── ActivityForm.jsx
            ├── ActivityTable.jsx
            └── Summary.jsx
```

---

## Getting started

### Prerequisites

- Python 3.9 or newer
- Node.js (LTS) and npm

### 1. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at **http://localhost:8000**.
Interactive API docs (Swagger): **http://localhost:8000/docs**

The SQLite file `activities.db` is created automatically in the `backend` folder on first run.

### 2. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

> Both servers must be running at the same time.

### Optional: start both with one command

Activate the backend virtual environment first, then from the project root:

```bash
npm install
npm run setup
npm run dev
```

---

## API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/activities` | Add a new activity | `201 Created` | `422` invalid input |
| GET | `/activities` | List all activities (newest first) | `200 OK` | |
| DELETE | `/activities/{id}` | Delete an activity | `200 OK` | `404` not found |
| GET | `/summary` | Totals and most active user | `200 OK` | |

### Examples

**Add an activity**

```http
POST /activities
Content-Type: application/json

{ "name": "Anjali", "activity": "Football", "hours": 2 }
```

Response `201`:

```json
{ "id": 1, "name": "Anjali", "activity": "Football", "hours": 2.0 }
```

**Invalid input**

```http
POST /activities
Content-Type: application/json

{ "name": "", "activity": "Chess", "hours": -1 }
```

Response `422`:

```json
{
  "detail": [
    { "loc": ["body", "name"], "msg": "Value error, must not be empty" },
    { "loc": ["body", "hours"], "msg": "Value error, must be greater than 0" }
  ]
}
```

**Get the summary**

```http
GET /summary
```

Response `200`:

```json
{ "total_entries": 3, "total_hours": 4.5, "most_active_user": "Anjali" }
```

When there are no entries:

```json
{ "total_entries": 0, "total_hours": 0, "most_active_user": null }
```

**Delete an activity**

```http
DELETE /activities/1
```

Response `200`: `{ "message": "Deleted" }`
If the id does not exist, response `404`: `{ "detail": "Activity not found" }`

---

## Validation rules

| Field | Rule |
|---|---|
| `name` | Required, not blank (leading/trailing spaces are trimmed) |
| `activity` | Required, not blank (leading/trailing spaces are trimmed) |
| `hours` | Required number, greater than 0 and at most 24 |

The frontend checks these before sending, and the backend checks them again, since the API can be called directly (Postman, curl) without the UI.

---

## How it works

1. The form keeps its values in React state (`useState`) and validates them on submit.
2. `api.js` sends the request with Axios (`POST /activities`).
3. FastAPI validates the body with a Pydantic model, saves the row in SQLite, and returns `201`.
4. After a successful save, `App.jsx` reloads the list and summary (`GET /activities` and `GET /summary` run in parallel with `Promise.all`).
5. `useEffect` loads the data once when the page first opens.
6. The **most active student** is found with SQL: group by name (case-insensitive, so "Anjali" and "anjali" count as one person), sum the hours, and take the highest total.
7. If there are no entries, the summary returns `0` totals and `null` for the most active user, and the UI shows "None yet".

**Ties:** if two students have exactly the same total hours, the database returns one of them (not guaranteed which). See *Possible improvements*.

**CORS** is enabled for `http://localhost:5173` and `http://localhost:3000` so the frontend can call the backend on port 8000.

---

## Testing

### Automated backend tests

```bash
cd backend
pip install pytest httpx
python -m pytest
```

Each test runs against a temporary database, so your real data is never touched. The tests cover:

- Adding and listing activities
- Validation: empty name, negative hours, hours over 24, and a non-numeric value (all return `422`)
- Summary calculation, including case-insensitive names
- Empty summary
- Deleting an activity, and `404` when deleting it again

### Manual testing

Use the Swagger page at http://localhost:8000/docs or Postman against `http://localhost:8000`.

---

## Design decisions

- **FastAPI** for automatic request validation and built-in API docs.
- **SQLite** so data persists without any setup.
- **Parameterised SQL queries** (`?` placeholders) to prevent SQL injection.
- **A separate `api.js`** keeps all network calls and error handling in one place.
- **Hours limited to 24 per entry** to keep the data realistic.
- **Validation on both sides:** the frontend for quick feedback, the backend for real protection.

---

## Possible improvements

- Deterministic tie-break for the most active student (e.g. alphabetical order)
- Maximum length for name and activity, and rejecting `NaN`/`Infinity` for hours
- Edit an existing activity
- Confirmation before deleting
- Pagination and search
- Date field and filtering by student
- API URL from an environment variable instead of being hardcoded in `api.js`
- Docker setup and a hosted demo

---

## Author


[GitHub](https://github.com/adarshsj006)
