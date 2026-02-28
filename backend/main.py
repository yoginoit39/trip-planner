import os
import time
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import RateLimitError

from planner import stream_itinerary

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="AI Trip Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_limit_reset_at: float = 0


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: str
    styles: List[str]
    travelers: int
    dietary: List[str] = []


@app.get("/")
def root():
    return {"message": "AI Trip Planner API"}


@app.get("/rate-limit-status")
def rate_limit_status():
    global _rate_limit_reset_at
    now = time.time()
    if _rate_limit_reset_at > now:
        return {"rate_limited": True, "retry_after": int(_rate_limit_reset_at - now)}
    return {"rate_limited": False, "retry_after": 0}


@app.post("/plan")
def plan_trip(req: TripRequest):
    global _rate_limit_reset_at

    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set.")

    now = time.time()
    if _rate_limit_reset_at > now:
        retry_after = int(_rate_limit_reset_at - now)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit active. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    if not req.destination.strip():
        raise HTTPException(status_code=400, detail="Destination is required.")

    if req.days < 1 or req.days > 14:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 14.")

    def generate():
        try:
            for token in stream_itinerary(
                req.destination, req.days, req.budget, req.styles, req.travelers, req.dietary, GROQ_API_KEY
            ):
                yield token
        except RateLimitError:
            _rate_limit_reset_at = time.time() + 60
            yield "\n\n⚠️ Rate limit reached. Please wait 60 seconds and try again."

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")
