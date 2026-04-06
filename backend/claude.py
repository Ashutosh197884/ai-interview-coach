from __future__ import annotations

import json
import os
import re
from typing import Any

try:
    import anthropic
except Exception:  # pragma: no cover - runtime fallback when package missing
    anthropic = None


MODEL_NAME = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")


def _get_client() -> Any | None:
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key or anthropic is None:
        return None
    return anthropic.Anthropic(api_key=api_key)


def _extract_json(raw_text: str) -> dict[str, Any]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "```", 1)
        segments = cleaned.split("```")
        if len(segments) >= 2:
            cleaned = segments[1].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model response")
    return json.loads(match.group(0))


def _clamp_score(value: Any, fallback: float = 6.0) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        score = fallback
    return max(1.0, min(10.0, round(score, 1)))


def _normalize_list(value: Any, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        clean = [str(item).strip() for item in value if str(item).strip()]
        if clean:
            return clean[:4]
    return fallback


def _fallback_question(
    role: str,
    difficulty: str,
    question_type: str,
    previous_questions: list[str],
) -> str:
    prompt_bank = {
        "Technical": [
            "Walk me through a complex production issue you diagnosed for a "
            f"{role} project, including your debugging approach and final fix.",
            "How would you design a scalable architecture for a "
            f"{role} workflow serving 10x traffic growth?",
        ],
        "HR": [
            f"Tell me about a time you received tough feedback as a {role} and "
            "how you turned it into measurable improvement.",
            f"Describe a conflict you handled while working as a {role}. "
            "What did you do and what was the outcome?",
        ],
        "Mixed": [
            f"As a {role}, explain one technically challenging decision you made "
            "and how you communicated it to non-technical stakeholders.",
            "How do you prioritize quality, speed, and collaboration when "
            f"working as a {role} at {difficulty} level?",
        ],
    }

    candidates = prompt_bank.get(question_type, prompt_bank["Mixed"])
    previous_set = {q.strip() for q in previous_questions}
    for candidate in candidates:
        if candidate not in previous_set:
            return candidate

    return (
        f"What is one impactful project from your experience as a {role}, "
        "and what did you personally contribute to its success?"
    )


def _fallback_feedback(answer: str) -> dict[str, Any]:
    word_count = len(answer.split())
    clarity = 4 if word_count < 40 else 6 if word_count < 110 else 8
    depth = 4 if word_count < 50 else 6 if word_count < 130 else 7
    communication = 5 if word_count < 35 else 7
    overall = round((clarity + depth + communication) / 3, 1)

    return {
        "overall_score": overall,
        "clarity_score": clarity,
        "depth_score": depth,
        "communication_score": communication,
        "strengths": [
            "You answered directly and stayed aligned with the question.",
            "Your response shows intent to explain your approach clearly.",
        ],
        "improvements": [
            "Add a concrete example with measurable results.",
            "Use a clearer structure: context, action, and outcome.",
        ],
        "ideal_answer_hint": (
            "A strong answer includes context, your exact actions, and the "
            "business impact with specific metrics."
        ),
    }


def _normalize_feedback(payload: dict[str, Any], answer: str) -> dict[str, Any]:
    fallback = _fallback_feedback(answer)
    return {
        "overall_score": _clamp_score(
            payload.get("overall_score"), fallback["overall_score"]
        ),
        "clarity_score": _clamp_score(
            payload.get("clarity_score"), fallback["clarity_score"]
        ),
        "depth_score": _clamp_score(payload.get("depth_score"), fallback["depth_score"]),
        "communication_score": _clamp_score(
            payload.get("communication_score"), fallback["communication_score"]
        ),
        "strengths": _normalize_list(payload.get("strengths"), fallback["strengths"]),
        "improvements": _normalize_list(
            payload.get("improvements"), fallback["improvements"]
        ),
        "ideal_answer_hint": str(
            payload.get("ideal_answer_hint", fallback["ideal_answer_hint"])
        ).strip()
        or fallback["ideal_answer_hint"],
    }


def generate_question(
    role: str,
    difficulty: str,
    question_type: str,
    previous_questions: list[str],
) -> str:
    client = _get_client()
    if client is None:
        return _fallback_question(role, difficulty, question_type, previous_questions)

    prompt = f"""You are a professional interviewer for a {role} position.
Generate exactly one interview question.
Difficulty level: {difficulty}
Interview focus: {question_type}
Previously asked questions (avoid repeats): {previous_questions}

Rules:
- Ask only one question
- Keep it realistic and role-specific
- Keep it concise
- Return only the question text"""

    try:
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=220,
            temperature=0.6,
            messages=[{"role": "user", "content": prompt}],
        )
        text_blocks = [
            block.text.strip()
            for block in message.content
            if hasattr(block, "text") and block.text.strip()
        ]
        question = " ".join(text_blocks).strip()
        if question:
            return question
    except Exception:
        pass

    return _fallback_question(role, difficulty, question_type, previous_questions)


def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    difficulty: str,
    question_type: str,
) -> dict[str, Any]:
    client = _get_client()
    if client is None:
        return _fallback_feedback(answer)

    prompt = f"""You are evaluating a mock interview answer.

Role: {role}
Difficulty: {difficulty}
Interview focus: {question_type}
Question: {question}
Candidate answer: {answer}

Return JSON only with this exact schema:
{{
  "overall_score": <number 1-10>,
  "clarity_score": <number 1-10>,
  "depth_score": <number 1-10>,
  "communication_score": <number 1-10>,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "ideal_answer_hint": "short coaching hint"
}}

Do not include markdown or additional commentary."""

    try:
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=620,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = " ".join(
            block.text.strip()
            for block in message.content
            if hasattr(block, "text") and block.text.strip()
        )
        parsed = _extract_json(raw_text)
        return _normalize_feedback(parsed, answer)
    except Exception:
        return _fallback_feedback(answer)
