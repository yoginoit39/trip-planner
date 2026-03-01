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
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

app = FastAPI(title="AI Trip Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_limit_reset_at: float = 0

# Supabase client (optional — gracefully skipped if not configured)
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    from supabase import create_client
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: str
    styles: List[str]
    travelers: int
    dietary: List[str] = []


class VisitRequest(BaseModel):
    visitor_id: str


@app.get("/")
def root():
    return {"message": "AI Trip Planner API"}


@app.post("/visit")
def record_visit(req: VisitRequest):
    if not supabase_client:
        return {"unique_visitors": 0, "is_new": False}

    existing = supabase_client.table("visitors").select("visitor_id").eq("visitor_id", req.visitor_id).execute()
    is_new = len(existing.data) == 0

    if is_new:
        supabase_client.table("visitors").insert({"visitor_id": req.visitor_id}).execute()

    count_result = supabase_client.table("visitors").select("visitor_id", count="exact").execute()
    return {"unique_visitors": count_result.count, "is_new": is_new}


@app.get("/stats")
def get_stats():
    if not supabase_client:
        return {"unique_visitors": 0}
    result = supabase_client.table("visitors").select("visitor_id", count="exact").execute()
    return {"unique_visitors": result.count}


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
