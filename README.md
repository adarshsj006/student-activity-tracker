# Student Activity Tracker

Full-stack mini project: **React (Vite) + FastAPI + SQLite**.

## Features
- Add a student activity (name, activity, hours) with client and server validation
- List all activities, with a delete option
- Summary: total entries, total hours, most active student
- Loading states and error messages

## API
| Method | Endpoint | Description | Success code |
|---|---|---|---|
| POST | /activities | Add activity | 201 |
| GET | /activities | List activities | 200 |
| DELETE | /activities/{id} | Delete activity | 200 (404 if missing) |
| GET | /summary | Totals + most active user | 200 |

Invalid input returns 422 with details. Interactive docs: http://localhost:8000/docs

## Run the backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Tests (optional)
```bash
cd backend
pip install pytest httpx
python -m pytest
```

## Notes
- Data is stored in `backend/activities.db` (SQLite, created automatically on first run).
- Hours must be greater than 0 and at most 24.
- "Most active user" groups names case-insensitively (Anjali = anjali).
