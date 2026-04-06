from __future__ import annotations

import json
import os
import re
from typing import Any
from difflib import SequenceMatcher

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


def _calculate_similarity(str1: str, str2: str) -> float:
    """Calculate similarity between two strings (0.0 to 1.0)."""
    if not str1 or not str2:
        return 0.0
    str1_lower = str1.lower()
    str2_lower = str2.lower()
    return SequenceMatcher(None, str1_lower, str2_lower).ratio()


def _is_duplicate_question(question: str, previous_questions: list[str], threshold: float = 0.7) -> bool:
    """Check if a question is too similar to any previous question."""
    if not question or not previous_questions:
        return False
    
    for prev in previous_questions:
        if not prev or not prev.strip():
            continue
        similarity = _calculate_similarity(question, prev)
        if similarity >= threshold:
            return True
    return False


def _get_fallback_question_bank() -> dict[str, dict[str, list[str]]]:
    """Return a comprehensive question bank organized by type and difficulty."""
    return {
        "Technical": {
            "Fresher": [
                "Explain a technical challenge you faced in your first project and how you resolved it.",
                "Describe a bug you found and the debugging process you used to fix it.",
                "How would you optimize a slow database query?",
                "Explain the difference between SQL and NoSQL databases with examples.",
                "Walk through your approach to writing unit tests for a function.",
                "How do you handle error handling and exceptions in your code?",
                "Describe a time you had to learn a new technology quickly for a project.",
                "How would you approach refactoring legacy code?",
                "Explain the concept of API versioning and why it matters.",
                "Describe your experience with version control systems like Git.",
            ],
            "Mid-level": [
                "Design a caching strategy for a high-traffic web application.",
                "Explain how you would implement a distributed system for user notifications.",
                "Describe a time you had to optimize application performance under pressure.",
                "How would you approach microservices architecture for a growing product?",
                "Explain your experience implementing CI/CD pipelines.",
                "Describe how you would handle data consistency in a distributed system.",
                "Walk me through your approach to system design for a scalable service.",
                "How do you ensure code quality and maintainability in large codebases?",
                "Explain your experience with message queues and asynchronous processing.",
                "Describe a complex technical decision you made and its trade-offs.",
            ],
            "Senior": [
                "How would you architect a system serving millions of concurrent users?",
                "Describe your approach to leading technical design for major features.",
                "Explain how you make technology stack decisions at an organizational level.",
                "Walk me through your experience scaling systems from startup to enterprise.",
                "How do you mentor junior engineers on complex technical problems?",
                "Describe your approach to technical debt management in large systems.",
                "Explain your experience with disaster recovery and system resilience.",
                "How do you balance innovation with stability in technical decisions?",
                "Describe a major architectural refactor you led and its impact.",
                "How would you approach building a platform for thousands of developers?",
            ],
        },
        "HR": {
            "Fresher": [
                "Tell me about a time you worked in a team with conflicting personalities.",
                "Describe a situation where you had to meet a tight deadline with limited resources.",
                "How do you handle constructive criticism about your work?",
                "Tell me about your greatest professional achievement so far.",
                "Describe a time you took initiative on a project without being asked.",
                "How do you prioritize tasks when everything seems urgent?",
                "Tell me about a time you failed and what you learned from it.",
                "How do you approach learning new skills outside your comfort zone?",
                "Describe a time you had to communicate bad news to stakeholders.",
                "How do you stay motivated when facing a challenging long-term project?",
            ],
            "Mid-level": [
                "Describe your experience leading a cross-functional project.",
                "Tell me about a time you disagreed with a manager and how you handled it.",
                "How do you build trust and relationships with team members?",
                "Describe a time you had to adapt your communication style for different audiences.",
                "Tell me about your proudest professional accomplishment.",
                "How do you handle working with difficult stakeholders or clients?",
                "Describe a time you mentored someone and the outcome.",
                "Tell me about a major challenge you overcame in your career.",
                "How do you approach building psychological safety in teams?",
                "Describe your experience with remote team collaboration.",
            ],
            "Senior": [
                "Describe your approach to building and developing high-performing teams.",
                "Tell me about a time you navigated significant organizational change.",
                "How do you approach strategic planning and long-term vision?",
                "Describe your experience building culture in engineering organizations.",
                "Tell me about a time you had to make a difficult people decision.",
                "How do you approach diversity and inclusion in your leadership?",
                "Describe your experience with stakeholder management at executive levels.",
                "Tell me about a transformational project you led and its impact.",
                "How do you balance empathy with business outcomes in decision-making?",
                "Describe your approach to succession planning and leadership development.",
            ],
        },
        "Mixed": {
            "Fresher": [
                "Tell me about a project that combined technical and interpersonal skills.",
                "Describe a time when you had to explain a technical concept to non-technical people.",
                "How do you approach balancing technical excellence with delivery timelines?",
                "Tell me about a time you had to work with others to solve a complex problem.",
                "Describe your experience collaborating with product and design teams.",
                "How do you communicate technical challenges to project managers?",
                "Tell me about a time when business requirements changed mid-project.",
                "Describe how you approach continuous learning and skill development.",
                "How do you balance individual contribution with team collaboration?",
                "Tell me about a time you advocated for a technical solution to a business problem.",
            ],
            "Mid-level": [
                "Describe how you translate business requirements into technical solutions.",
                "Tell me about a time you led technical discussions with non-technical stakeholders.",
                "How do you approach balancing technical debt with feature delivery?",
                "Describe your experience with technical leadership and mentoring.",
                "Tell me about a time you improved team processes or efficiency.",
                "How do you approach evaluating new technologies for adoption?",
                "Describe your experience with crisis management and incident response.",
                "Tell me about a successful collaboration with another team or department.",
                "How do you approach building scalable and maintainable systems?",
                "Describe your experience with product roadmap planning and execution.",
            ],
            "Senior": [
                "How do you drive technical strategy aligned with business objectives?",
                "Describe your approach to building engineering excellence at scale.",
                "Tell me about a time you transformed an underperforming team.",
                "How do you approach innovation while maintaining system stability?",
                "Describe your experience with M&A integration or major reorganizations.",
                "Tell me about a significant technical or organizational transformation you led.",
                "How do you approach reducing time-to-market without sacrificing quality?",
                "Describe your experience building partnerships with other organizations.",
                "How do you approach talent acquisition and retention strategies?",
                "Tell me about how you've shaped technical culture in your organization.",
            ],
        },
    }


def _fallback_question(
    role: str,
    difficulty: str,
    question_type: str,
    previous_questions: list[str],
) -> str:
    """Generate a unique fallback question that hasn't been asked before."""
    question_bank = _get_fallback_question_bank()
    
    # Clean and normalize previous questions for comparison
    previous_set = {q.strip().lower() for q in previous_questions if q.strip()}
    
    # Try to get questions for the specific question type and difficulty
    candidates = []
    if question_type in question_bank and difficulty in question_bank[question_type]:
        candidates = question_bank[question_type][difficulty]
    elif question_type in question_bank:
        # Fallback to all difficulties for this type if exact match not found
        for diff_questions in question_bank[question_type].values():
            candidates.extend(diff_questions)
    else:
        # Fallback to Mixed type if question_type not found
        for diff_questions in question_bank.get("Mixed", {}).values():
            candidates.extend(diff_questions)
    
    # Find the first candidate that hasn't been asked and isn't a duplicate
    for candidate in candidates:
        candidate_lower = candidate.strip().lower()
        
        # Skip if exact match exists in previous questions
        if candidate_lower in previous_set:
            continue
        
        # Skip if too similar to a previous question
        if _is_duplicate_question(candidate, previous_questions, threshold=0.75):
            continue
        
        return candidate
    
    # If all candidates are exhausted, return a generic fallback that's unique
    return (
        f"Share an example of how you've contributed to your team's success "
        f"as a {role} at the {difficulty} level, focusing on both technical "
        f"and interpersonal aspects of your work."
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
    """Generate a unique interview question.
    
    Attempts to use Claude for creative questions first, then falls back to
    a comprehensive question bank if Claude is unavailable or generates
    a duplicate.
    
    Args:
        role: Job role for the interview
        difficulty: Difficulty level (Fresher/Mid-level/Senior)
        question_type: Type of questions (Technical/HR/Mixed)
        previous_questions: List of questions already asked in this session
        
    Returns:
        A unique interview question not in previous_questions
    """
    client = _get_client()
    
    # Format previous questions for the prompt
    prev_questions_text = ""
    if previous_questions:
        prev_list = "\n".join(f"- {q}" for q in previous_questions[:10])
        prev_questions_text = f"Previously asked questions:\n{prev_list}\n\nIMPORTANT: Generate a completely different question, NOT similar to any above."
    
    prompt = f"""You are a professional interviewer conducting a {question_type} interview.

Role: {role}
Difficulty Level: {difficulty}

{prev_questions_text}

Generate exactly ONE fresh, unique interview question that:
- Is specific to the {role} position
- Matches the {difficulty} difficulty level
- Is about {question_type} topics
- Is creative and not generic
- Has NOT been asked before (based on the list above)
- Is realistic and commonly asked in interviews
- Is concise (under 20 words ideally)

Return ONLY the question text, nothing else."""

    if client is not None:
        try:
            message = client.messages.create(
                model=MODEL_NAME,
                max_tokens=250,
                temperature=0.8,
                messages=[{"role": "user", "content": prompt}],
            )
            text_blocks = [
                block.text.strip()
                for block in message.content
                if hasattr(block, "text") and block.text.strip()
            ]
            question = " ".join(text_blocks).strip()
            
            # Validate the generated question
            if question and len(question) > 10:
                # Check if it's a duplicate
                if not _is_duplicate_question(question, previous_questions, threshold=0.75):
                    return question
                # If Claude generated a duplicate, continue to fallback
        except Exception:
            pass
    
    # Use fallback if Claude unavailable or generated a duplicate
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
