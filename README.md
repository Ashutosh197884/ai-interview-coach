# AI Interview Coach

AI-powered mock interview application with a React frontend and a FastAPI backend.

## Project Structure

- `frontend/` - Vite + React + Tailwind UI
- `backend/` - FastAPI API with Anthropic integration and SQLite persistence

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example` and set your key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ALLOWED_ORIGINS=http://localhost:5173
```

Run backend:

```bash
uvicorn main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Endpoints

- `GET /` - health check
- `POST /get-question` - generate a role-specific interview question
- `POST /evaluate` - evaluate a candidate answer and return scores/feedback
- `POST /save-session` - persist completed session
- `GET /history/{name}` - list previous sessions by candidate name

## Notes

- Session data is stored in `backend/interviews.db`.
- Voice input uses browser speech recognition APIs.
- If Anthropic is unavailable, the backend automatically falls back to deterministic local prompts and scoring.