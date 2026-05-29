from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


class LeadCreate(BaseModel):
    name: str
    email: str
    niche: Optional[str] = None
    audience_size: Optional[str] = None
    current_income: Optional[str] = None
    pain_point: Optional[str] = None
    commitment_signal: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    niche: Optional[str] = None
    audience_size: Optional[str] = None
    current_income: Optional[str] = None
    score: int
    tier: str
    recommendation: str
