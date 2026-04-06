# AI Mock Interview Coach

A two-part project with a React frontend and a FastAPI backend for generating interview questions, evaluating answers, and tracking practice sessions.

## Project structure

- `frontend/` — React + Vite app
- `backend/` — FastAPI server with Claude/Anthropic integration and SQLite persistence

## Setup

### Frontend

```bash
cd "c:\Users\ashut\OneDrive\Documents\AI MOCK INTERVIEWER\ai-interview-coach\frontend"
npm install
npm run dev
```

### Backend

```bash
cd "c:\Users\ashut\OneDrive\Documents\AI MOCK INTERVIEWER\ai-interview-coach\backend"
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
uvicorn main:app --reload
```

## API Endpoints

- `POST /get-question`
- `POST /evaluate`
- `POST /save-session`
- `GET /history/{name}`

## Notes

- The frontend is configured to call `http://localhost:8000`
- You can customize the Tailwind setup in `frontend/vite.config.js`
- Use `.env.example` as a template for your actual API key
