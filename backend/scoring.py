from __future__ import annotations

import re
from typing import Optional


def _normalize(value: Optional[str]) -> str:
    return (value or "").strip().lower()


def _score_audience(audience_size: Optional[str]) -> int:
    text = _normalize(audience_size)
    if not text:
        return 0

    numbers = [int(match) for match in re.findall(r"\d+", text)]
    if numbers:
        max_value = max(numbers)
        if "k" in text or "thousand" in text:
            max_value *= 1000
        if max_value >= 10000:
            return 40
        if max_value >= 1000:
            return 25
        return 10

    if "10k" in text or "10,000" in text:
        return 40
    if "1k" in text or "1,000" in text:
        return 25
    if "small" in text or "starting" in text:
        return 10
    return 0


def _score_income(current_income: Optional[str]) -> int:
    text = _normalize(current_income)
    if any(keyword in text for keyword in ["yes", "already", "earning", "revenue", "income"]):
        return 20
    return 0


def _score_niche(niche: Optional[str]) -> int:
    text = _normalize(niche)
    if not text:
        return 0

    educational_keywords = ["education", "tutorial", "teach", "course", "how to", "guide"]
    if any(keyword in text for keyword in educational_keywords):
        return 20
    return 5


def _score_commitment(commitment_signal: Optional[str]) -> int:
    text = _normalize(commitment_signal)
    if "ready to start" in text or "ready" in text or "book" in text:
        return 20
    return 0


def score_lead(
    niche: Optional[str],
    audience_size: Optional[str],
    current_income: Optional[str],
    commitment_signal: Optional[str],
) -> dict:
    score = 0
    score += _score_audience(audience_size)
    score += _score_income(current_income)
    score += _score_niche(niche)
    score += _score_commitment(commitment_signal)

    if score >= 70:
        tier = "Hot"
        recommendation = "Book a call immediately."
    elif score >= 40:
        tier = "Warm"
        recommendation = "Nurture with a short email sequence."
    else:
        tier = "Cold"
        recommendation = "Share free resources and follow up later."

    return {"score": score, "tier": tier, "recommendation": recommendation}
