# AI Study Buddy — MERN Full Stack (React + Vite + Tailwind, Express, MongoDB, Hugging Face)

This repo contains a full MERN implementation of the AI Study Buddy flashcard generator with:
- React frontend (Vite + Tailwind)
- Express backend (Node + Mongoose)
- Advanced Hugging Face generator integration
- Full CRUD for flashcards (create, read, update, delete)
- Docker + docker-compose for local development
- Deployment instructions (Render, Vercel, Railway)

## Structure
```
ai-study-buddy-mern-full/
├─ backend/          # Express + Mongoose API
├─ frontend/         # Vite React + Tailwind app (build served by nginx in Docker)
├─ docker-compose.yml
└─ README.md
```

## Quick local (dev) run (no Docker)
1. Backend
```bash
cd backend
cp .env.example .env
# set HF_API_TOKEN in .env and adjust MONGODB_URI if needed (mongodb://localhost:27017/studybuddy)
npm install
npm run dev
```
2. Frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000 (Vite proxy sends /api to backend at port 5000)
```

## Quick local with Docker (recommended to replicate production)
Make sure Docker is installed.
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 (API root /api)
- MongoDB: mongodb://localhost:27017

Edit `backend/.env.example` to provide your `HF_API_TOKEN` (the compose uses env_file; copy to backend/.env and set values).

## Hugging Face note
- Set `HF_API_TOKEN` in backend env. Use an instruction-tuned text generation model you have access to (e.g., `google/flan-t5-large`) or another LLM. Some models cost money—check your account.

## Deployment notes
### Render (backend)
- Create a new Web Service on Render, connect repo, set build command `npm install && npm run build` (or `npm install`) and start command `node server.js`. Add environment variables: `MONGODB_URI`, `HF_API_TOKEN`, `HF_MODEL_ID`.
- For MongoDB use an external DB provider (MongoDB Atlas) and supply the connection string in `MONGODB_URI`.

### Vercel (frontend)
- Deploy the `frontend` directory to Vercel (import project). Set `Build Command` to `npm run build` and `Output Directory` to `dist`.
- In Vercel project settings, set environment variable `VITE_API_BASE` if needed; otherwise use full backend URL in the frontend axios calls or set up a proxy/rewrite.

### Railway
- Railway supports both services; create a project, add MongoDB plugin for DB, deploy backend with environment variables, deploy frontend or use the built static site served elsewhere.

## Extensibility suggestions
- Add authentication (JWT + refresh tokens) and user-specific decks.
- Add spaced-repetition scheduling (SM-2) for reviews.
- Add logging, rate-limiting, and request quotas for `/api/generate` to control HF usage.
- Add server-side caching of generated cards for identical notes to save API calls.

---
If you want, I can:
- create a downloadable ZIP of the entire project (backend + frontend + docker-compose), or
- push this structure to a GitHub repo and open a PR,
- add CI/CD config for Render/Vercel/GitHub Actions.

Tell me which you'd like next.
