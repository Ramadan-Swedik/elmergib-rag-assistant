# 👨‍💻 Ramadan's Task Guide: UI Domain & Leadership

**Domain:** `src/ui/`
**Branch Prefix:** `feature/ramadan/...`

## 🎯 Job Description
Deliver a working, interactive React chat interface and FastAPI server calling `answer_question()`, and coordinate the team to ensure a stable 14-day sprint.
You are strictly restricted to the `src/ui/` directory and presentation deliverables.

## 🛠️ Tools & Tech Stack
- `React` (Vite, Tailwind CSS)
- `FastAPI` (Backend server)

## 📅 Workflow (14-Day Sprint)
- **Day 1-8:** Coordinate the team (branch reviews, PR approvals, unblocking dependencies) while designing the UI mockup/wireframe.
- **Day 9:** Once Amymah's `answer_question()` has a first working stub, build the React chat UI and FastAPI backend against it.
- **Day 10:** Display full citation (chunk text + source URL + retrieval date)—not just the answer. Add the required disclaimer banner.
- **Day 11:** Visually distinguish abstention responses (e.g., error blocks) from normal answers.
- **Day 12-13:** Polish UI, test with real users (team members), fix UX issues.
- **Day 14:** Support final presentation prep.

## ✅ Expected Outcomes
1. `src/ui/server.py` (FastAPI backend) and `src/ui/frontend/` (React UI)
2. Screenshots and demo recording for the final presentation.
3. A stable, merged `main` branch acting as the single source of truth.

**⚠️ Conflict Prevention:** Do not modify backend code in `src/database/` or `src/rag/`. Treat `answer_question()` as a black box. If you need a new field in the returned dictionary, you must request it from Amymah and agree on the change before she commits it.
