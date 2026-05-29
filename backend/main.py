from __future__ import annotations

from typing import List

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google.genai import errors as genai_errors

from chat import get_ai_reply
from database import Lead, SessionLocal, create_tables
from models import ChatRequest, ChatResponse, LeadCreate, LeadResponse
from scoring import score_lead

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

app = FastAPI(title="CreatorJoy AI Chat Sales API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_tables()


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    history = [
        {"role": "user" if msg.role == "user" else "model", "parts": [msg.text]}
        for msg in request.conversation_history
    ]
    try:
        reply = get_ai_reply(request.message, history)
        return ChatResponse(reply=reply)
    except genai_errors.ClientError as exc:
        status_code = getattr(exc, "status_code", None)
        message = str(exc)
        if status_code == 429 or "RESOURCE_EXHAUSTED" in message or "rate limit" in message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini rate limit reached. Please wait a minute and try again.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini service error. Please try again shortly.",
        ) from exc


@app.post("/leads", response_model=LeadResponse)
def create_lead(payload: LeadCreate) -> LeadResponse:
    scoring = score_lead(
        payload.niche,
        payload.audience_size,
        payload.current_income,
        payload.commitment_signal,
    )

    db = SessionLocal()
    lead = Lead(
        name=payload.name,
        email=payload.email,
        niche=payload.niche,
        audience_size=payload.audience_size,
        current_income=payload.current_income,
        score=scoring["score"],
        tier=scoring["tier"],
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    db.close()

    return LeadResponse(
        id=lead.id,
        name=lead.name,
        email=lead.email,
        niche=lead.niche,
        audience_size=lead.audience_size,
        current_income=lead.current_income,
        score=scoring["score"],
        tier=scoring["tier"],
        recommendation=scoring["recommendation"],
    )


@app.get("/leads", response_model=List[LeadResponse])
def list_leads() -> List[LeadResponse]:
    db = SessionLocal()
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    db.close()

    response: List[LeadResponse] = []
    for lead in leads:
        response.append(
            LeadResponse(
                id=lead.id,
                name=lead.name,
                email=lead.email,
                niche=lead.niche,
                audience_size=lead.audience_size,
                current_income=lead.current_income,
                score=lead.score,
                tier=lead.tier,
                recommendation="",
            )
        )
    return response
