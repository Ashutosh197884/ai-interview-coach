import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from claude import generate_question, evaluate_answer
from database import save_session, get_history

load_dotenv()
app = FastAPI()

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


class EvaluateRequest(BaseModel):
    question: str
    answer: str
    role: str
    difficulty: str
    question_type: str = "Mixed"


class SaveRequest(BaseModel):
    name: str
    role: str
    difficulty: str
    question_type: str = "Mixed"
    overall_score: float
    questions: list[str]
    answers: list[str]
    scores: list[float]


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Interview Coach API"}


@app.post("/get-question")
def get_question(req: QuestionRequest):
    try:
        question = generate_question(
            req.role,
            req.difficulty,
            req.question_type,
            req.previous_questions,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to generate question") from exc
    return {"question": question}


@app.post("/evaluate")
def evaluate(req: EvaluateRequest):
    try:
        result = evaluate_answer(
            req.question,
            req.answer,
            req.role,
            req.difficulty,
            req.question_type,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to evaluate answer") from exc
    return result


@app.post("/save-session")
def save(req: SaveRequest):
    try:
        session_id = save_session(
            req.name.strip(),
            req.role,
            req.difficulty,
            req.question_type,
            req.overall_score,
            req.questions,
            req.answers,
            req.scores,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to save session") from exc
    return {"status": "saved", "id": session_id}


@app.get("/history/{name}")
def history(name: str):
    try:
        return get_history(name)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to load history") from exc
