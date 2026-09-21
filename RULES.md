# 📋 Team Byte AI — Engineering Rules & Collaboration Protocol
To deliver a stable Proof-of-Concept within our 14-day sprint, all team members must follow these workflow rules.
---
## 1. The Main Branch Rule
* **Direct pushes to `main` are strictly prohibited.**
* The `main` branch must remain deployable at all times.
* All development work must occur on dedicated feature branches.
---
## 2. Branch Naming Standards
Create your branch from an updated `main` branch using these prefixes:
* `feature/[name]/[short-description]` (e.g., `feature/ramadan/streamlit-citation-ui`)
* `data/[name]/[short-description]` (e.g., `data/mohammed/pypdf-chunking-pipeline`)
* `eval/[name]/[short-description]` (e.g., `eval/qa/ragas-benchmark-suite`)
* `fix/[name]/[short-description]` (e.g., `fix/backend/rrf-fusion-score-fix`)
---
## 3. Commit Message Standards
Write atomic, descriptive commits in English using standard conventional prefixes:
* `FEAT:` Introducing a new component or function.
* `FIX:` Fixing an edge-case, syntax error, or pipeline bug.
* `REFACTOR:` Restructuring code without changing functionality.
* `DOCS:` Updating documentation, slides, or inline comments.
* `CHORE:` Updating dependencies, configs, or `.gitignore`.
*Example:* `FEAT: Add Abstention Gate threshold check in answer_question()`
---
## 4. Pull Requests (PR) & Code Review
1. Open a Pull Request into `main` once your module or subtask is complete and tested locally.
2. Link the PR to the relevant task on the project board.
3. Every PR requires **at least one approving review** from another team member before merging.
4. Select **"Squash and merge"** to keep git history clean and legible.
---
## 5. Domain Boundaries & File Ownership
To prevent git merge conflicts, respect component boundaries:
* **Person 1:** Restricted to `src/database/` and raw text cleaning in `data/`.
* **Person 2:** Restricted to `src/rag/` (retrieval logic, Ollama calls, and abstention).
* **Person 3 (UI):** Restricted to `src/ui/` and presentation deliverables.
* **Person 4:** Restricted to `eval/` and reporting outputs.
Any change that crosses module interfaces (e.g., modifying `answer_question()` inputs or outputs) must be agreed upon by both owners before committing.
---
## 6. Hygiene & Secrets
* **Never commit vector database files or indexes:** `chroma_db/` folders must remain in `.gitignore`.
* **Never commit environment variables:** Keep API keys or local file paths in `.env` (use `.env.example` as a template).
* Run `git status` before every `git add` to avoid staging temporary cache files (`__pycache__`, `.DS_Store`).
