import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv
from claude import generate_question, evaluate_answer
from database import save_session, get_history, init_db

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-interview-coach")

load_dotenv()

# Initialize database on startup
init_db()

app = FastAPI(
    title="AI Interview Coach API",
    description="AI-powered mock interview platform with Claude integration",
    version="1.0.0"
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)



class QuestionRequest(BaseModel):
    role: str
    difficulty: str
    question_type: str = "Mixed"
    previous_questions: list[str] = Field(default_factory=list)

    @validator('role', 'difficulty')
    def validate_required_fields(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        if len(v) > 100:
            raise ValueError('Field cannot exceed 100 characters')
        return v.strip()

    @validator('question_type')
    def validate_question_type(cls, v):
        valid_types = ["Technical", "HR", "Mixed"]
        if v not in valid_types:
            return "Mixed"  # Default to Mixed for invalid types
        return v

    @validator('previous_questions')
    def validate_previous_questions(cls, v):
        if not isinstance(v, list):
            return []
        return [q.strip() for q in v if isinstance(q, str) and q.strip()][:5]


class EvaluateRequest(BaseModel):
    question: str
    answer: str
    role: str
    difficulty: str
    question_type: str = "Mixed"

    @validator('question', 'answer', 'role', 'difficulty')
    def validate_required_fields(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        if len(v) > 5000:
            raise ValueError('Field exceeds maximum length')
        return v.strip()

    @validator('question_type')
    def validate_question_type(cls, v):
        valid_types = ["Technical", "HR", "Mixed"]
        return v if v in valid_types else "Mixed"


class SaveRequest(BaseModel):
    name: str
    role: str
    difficulty: str
    question_type: str = "Mixed"
    overall_score: float
    questions: list[str]
    answers: list[str]
    scores: list[float]

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        if len(v.strip()) > 100:
            raise ValueError('Name cannot exceed 100 characters')
        return v.strip()

    @validator('role', 'difficulty')
    def validate_fields(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

    @validator('overall_score')
    def validate_score(cls, v):
        if not 0 <= v <= 10:
            raise ValueError('Overall score must be between 0 and 10')
        return v

    @validator('questions', 'answers', 'scores')
    def validate_lists(cls, v):
        if not isinstance(v, list) or len(v) == 0:
            raise ValueError('Lists cannot be empty')
        if len(v) > 50:
            raise ValueError('Too many items in list')
        return v



@app.get("/")
def root():
    """Health check endpoint."""
    logger.info("Health check requested")
    return {
        "status": "ok",
        "service": "AI Interview Coach API",
        "version": "1.0.0"
    }


@app.post("/get-question")
def get_question(req: QuestionRequest):
    """Generate a new interview question based on role and difficulty."""
    try:
        logger.info(
            f"Generating question for role={req.role}, difficulty={req.difficulty}"
        )
        question = generate_question(
            req.role,
            req.difficulty,
            req.question_type,
            req.previous_questions,
        )
        if not question or not question.strip():
            logger.warning("Generated empty question, using fallback")
            raise ValueError("Failed to generate question")
        logger.info("Question generated successfully")
        return {"question": question}
    except Exception as exc:
        logger.error(f"Question generation failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate question. Please try again."
        ) from exc


@app.post("/evaluate")
def evaluate(req: EvaluateRequest):
    """Evaluate a candidate's answer to an interview question."""
    try:
        logger.info(f"Evaluating answer for role={req.role}")
        result = evaluate_answer(
            req.question,
            req.answer,
            req.role,
            req.difficulty,
            req.question_type,
        )
        if not result or not isinstance(result, dict):
            logger.warning("Invalid evaluation result structure")
            raise ValueError("Invalid evaluation result")
        logger.info("Answer evaluated successfully")
        return result
    except Exception as exc:
        logger.error(f"Evaluation failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate answer. Please try again."
        ) from exc


@app.post("/save-session")
def save(req: SaveRequest):
    """Save a completed interview session."""
    try:
        logger.info(f"Saving session for {req.name}")
        if len(req.questions) != len(req.answers) or len(req.questions) != len(req.scores):
            logger.error("Mismatched question/answer/score counts")
            raise ValueError("Question, answer, and score counts must match")
        
        session_id = save_session(
            req.name,
            req.role,
            req.difficulty,
            req.question_type,
            req.overall_score,
            req.questions,
            req.answers,
            req.scores,
        )
        logger.info(f"Session saved successfully with id={session_id}")
        return {"status": "saved", "id": session_id}
    except Exception as exc:
        logger.error(f"Session save failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to save session. Please try again."
        ) from exc


@app.get("/history/{name}")
def history(name: str):
    """Retrieve interview history for a candidate."""
    try:
        if not name.strip():
            logger.warning("Empty name provided for history request")
            return []
        logger.info(f"Retrieving history for {name}")
        result = get_history(name.strip())
        logger.info(f"Retrieved {len(result)} sessions")
        return result
    except Exception as exc:
        logger.error(f"History retrieval failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to load history. Please try again."
        ) from exc
