# AI Chat Sales System
AI chat sales assistant that qualifies CreatorJoy leads, scores them, and routes hot prospects to a booking flow.

## Tech Stack
- React + Vite (frontend)
- FastAPI (backend)
- Google Gemini 1.5 Flash (AI)
- SQLite (leads storage)
- Tailwind CSS (styling)

## Live Demo
- Add your Vercel link here.

## Screenshot
- Add a screenshot of the chat UI here.

## Local Setup
```bash
# backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# set env
copy .env.example .env
# edit .env and add your GEMINI_API_KEY

# run backend
uvicorn main:app --reload
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

## API Endpoints
- `POST /chat` -> Gemini-powered response
- `POST /leads` -> score and store lead
- `GET /leads` -> list captured leads

## Why I Built This
CreatorJoy's three core services are chat sales systems, viral content strategy, and high-ticket offer creation. This project directly implements the first pillar — an AI-powered chat bot that qualifies incoming leads, scores them based on fit, and routes hot prospects to a booking call. The lead scoring algorithm prioritizes audience size, niche clarity, and commitment signals, which are the same filters a human sales rep would use.

## Notes
Render free tier sleeps after 15 minutes. The UI shows a wake-up notice on the first chat message so users know to wait.
