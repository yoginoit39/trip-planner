# AI Trip Planner

A full-stack AI-powered travel itinerary generator. Enter your destination, trip length, budget, and travel style — get a detailed day-by-day plan streamed in real time.

**Live demo:** [trip-planner-9w5v7nj8k-yoginoit39s-projects.vercel.app](https://trip-planner-9w5v7nj8k-yoginoit39s-projects.vercel.app)

---

## Features

- Real-time streaming itinerary generation
- Day-by-day schedule with morning, afternoon, and evening activities
- Restaurant recommendations with dietary filter support
- Budget breakdown, hotel suggestions, transport tips, and local tips
- Quick links to search flights (Google Flights), hotels (Booking.com), and stays (Airbnb)
- Destination hero image after generation
- Copy itinerary to clipboard

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| AI | Groq API (Llama 3.3 70B) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Project Structure

```
ai-trip-planner/
├── backend/
│   ├── main.py          # FastAPI app, streaming endpoint
│   ├── planner.py       # Groq prompt builder and streamer
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
└── render.yaml          # Render deployment config
```

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key
```

Start the server:

```bash
uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` to `http://localhost:8000` in dev mode via `vite.config.js`.

## Deployment

### Backend → Render

- Runtime: Python
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variable: `GROQ_API_KEY`

### Frontend → Vercel

- Root directory: `frontend`
- Framework: Vite (auto-detected)
- Environment variable: `VITE_API_URL` → your Render backend URL

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | Render | Groq API key for LLM access |
| `VITE_API_URL` | Vercel | Backend URL (e.g. `https://your-app.onrender.com`) |
