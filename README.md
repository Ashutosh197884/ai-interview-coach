# AI Interview Coach

A professional AI-powered mock interview platform with intelligent question generation, real-time evaluation, and comprehensive performance analytics. Built with React, FastAPI, and Claude AI.

## Features

✨ **Comprehensive Interview Experience**
- Role-specific interview questions (Technical, HR, Mixed)
- 3 difficulty levels (Fresher, Mid-level, Senior)
- 8 professional career paths (Frontend Dev, Backend Dev, Full Stack, Data Analyst, ML Engineer, Product Manager, UI/UX Designer, Business Analyst)
- Voice input support with browser speech recognition
- Real-time answer evaluation and scoring

📊 **Performance Tracking**
- Session history with detailed analytics
- Average score and best score tracking
- Question-by-question feedback
- Downloadable session reports
- Performance metrics dashboard

🛡️ **Enterprise-Grade Features**
- Input validation and sanitization
- Comprehensive error handling
- Database persistence with SQLite
- CORS support for multiple origins
- Detailed logging for debugging
- Fallback mechanisms for API failures

## Project Structure

```
.
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Configuration
│   │   └── main.jsx
│   └── package.json
│
├── backend/                  # FastAPI + Claude AI
│   ├── main.py              # API endpoints & request validation
│   ├── claude.py            # Claude integration & response parsing
│   ├── database.py          # SQLite persistence layer
│   ├── requirements.txt
│   └── interviews.db        # Session storage
│
├── docker-compose.yml       # Local development setup
└── README.md
```

## Quick Start

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment (`backend/.env`):**
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ALLOWED_ORIGINS=http://localhost:5173
INTERVIEW_DB_PATH=interviews.db
```

3. **Run the API server:**
```bash
python -m uvicorn main:app --reload
```
Server runs on `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:8000
```

3. **Start development server:**
```bash
npm run dev
```
Application runs on `http://localhost:5173`

## API Reference

All requests and responses include comprehensive validation and error handling.

### Health Check
```
GET /
```
Response:
```json
{
  "status": "ok",
  "service": "AI Interview Coach API",
  "version": "1.0.0"
}
```

### Generate Question
```
POST /get-question
```
Request:
```json
{
  "role": "Backend Developer",
  "difficulty": "Mid-level",
  "question_type": "Technical",
  "previous_questions": []
}
```
Response:
```json
{
  "question": "Explain how you would design a scalable architecture..."
}
```

### Evaluate Answer
```
POST /evaluate
```
Request:
```json
{
  "question": "...",
  "answer": "...",
  "role": "Backend Developer",
  "difficulty": "Mid-level",
  "question_type": "Technical"
}
```
Response:
```json
{
  "overall_score": 7.5,
  "clarity_score": 8.0,
  "depth_score": 7.0,
  "communication_score": 7.5,
  "strengths": ["Clear structure", "Good examples"],
  "improvements": ["Add metrics", "Discuss trade-offs"],
  "ideal_answer_hint": "A strong answer includes..."
}
```

### Save Session
```
POST /save-session
```
Request:
```json
{
  "name": "John Doe",
  "role": "Backend Developer",
  "difficulty": "Mid-level",
  "question_type": "Technical",
  "overall_score": 7.5,
  "questions": ["..."],
  "answers": ["..."],
  "scores": [7.5]
}
```
Response:
```json
{
  "status": "saved",
  "id": 1
}
```

### Get History
```
GET /history/{name}
```
Response:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "role": "Backend Developer",
    "difficulty": "Mid-level",
    "question_type": "Technical",
    "overall_score": 7.5,
    "created_at": "2025-04-07T10:30:00Z"
  }
]
```

## Frontend Components

- **Setup** - Interview configuration and candidate profile
- **Dashboard** - Session history and performance metrics
- **InterviewRoom** - Question display, answer input, and voice recording
- **FeedbackCard** - Detailed feedback with scoring and tips
- **SessionReport** - Summary report with analytics

## Technology Stack

**Frontend:**
- React 18+ with Hooks
- Vite for fast development
- Tailwind CSS for styling
- Axios for API requests
- Lucide React for icons

**Backend:**
- FastAPI for REST API
- Pydantic for data validation
- Anthropic Claude for AI
- SQLite for data persistence
- Python-dotenv for configuration

## Features & Improvements

### Latest Enhancements (v1.0.0)

✅ **Input Validation**
- Pydantic validators for all API endpoints
- Frontend form validation with error messages
- Length and format constraints on user inputs
- Sanitized database queries

✅ **Error Handling**
- Comprehensive exception handling in backend
- User-friendly error messages in frontend
- Fallback mechanisms when Claude API unavailable
- Detailed logging for debugging

✅ **Performance Optimizations**
- Answer length tracking with visual feedback
- Minimum/maximum word count validation
- Optimized database queries
- Efficient voice recognition handling

✅ **User Experience**
- Real-time answer word count display
- Progress bar showing interview completion
- Loading states for all async operations
- Accessibility improvements (aria labels, keyboard support)
- Mobile-responsive design

✅ **Code Quality**
- Comprehensive docstrings on all functions
- Consistent error handling patterns
- Type hints throughout codebase
- Structured logging for monitoring

## Development

### Run with Docker
```bash
docker-compose up
```

### Run Tests
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

### Build for Production
```bash
# Frontend
cd frontend && npm run build

# Backend is production-ready as-is
```

## Deployment

The project includes configuration for easy deployment:

- **Frontend**: Deploy to Vercel (see `frontend/vercel.json`)
- **Backend**: Deploy to Render (see `backend/render.yaml`)
- **CI/CD**: GitHub Actions workflow (see `.github/workflows/deploy.yml`)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Notes

- Session data persists in `backend/interviews.db` (SQLite)
- Voice input requires HTTPS in production (browser API requirement)
- If Anthropic API is unavailable, backend automatically uses fallback scoring
- Each interview session includes 5 questions by default (configurable)
- Questions are generated fresh for each session (no question caching across users)

## License

Created with ❤️ for interview preparation and skill development.