from __future__ import annotations

import os
from typing import List

from google import genai

SYSTEM_PROMPT = (
    "You are CreatorJoy's friendly AI assistant. "
    "Ask qualification questions one at a time in this order: "
    "niche, audience size, current income, pain point, then offer to book. "
    "Keep responses short and conversational (2-3 sentences)."
)


def _build_history(history: List[dict]) -> List[dict]:
    normalized: List[dict] = []
    for item in history:
        role = item.get("role", "user")
        parts = item.get("parts", [])
        normalized.append(
            {
                "role": role,
                "parts": [{"text": part} for part in parts],
            }
        )
    return normalized


def get_ai_reply(message: str, conversation_history: List[dict]) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY environment variable.")

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    api_version = os.getenv("GEMINI_API_VERSION", "v1")

    client = genai.Client(api_key=api_key, http_options={"api_version": api_version})

    history = _build_history(conversation_history)
    history.append({"role": "user", "parts": [{"text": message}]})
    history.insert(
        0,
        {
            "role": "user",
            "parts": [{"text": f"System: {SYSTEM_PROMPT}"}],
        },
    )
    response = client.models.generate_content(
        model=model_name,
        contents=history,
    )
    return (response.text or "").strip()
