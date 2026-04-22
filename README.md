# 🛡️ FNOL Claims Agent

> Upload a claim document. Get a routing decision in seconds.

## What It Does

An AI agent that reads FNOL (First Notice of Loss) insurance documents and:
- **Extracts** key fields automatically
- **Validates** for missing or incomplete data
- **Classifies** the claim type
- **Routes** to the correct workflow with a plain-English explanation

## Routing Rules

| Condition | Route |
|---|---|
| Fraud keywords in description | 🚨 Investigation Flag |
| Any mandatory field missing | 📋 Manual Review |
| Claim type = injury | 🏥 Specialist Queue |
| Estimated damage < ₹25,000 | ⚡ Fast-track |
| Complete claim, damage ≥ ₹25,000 | 📁 Standard Review |

## Tech Stack

**Backend:** Python, FastAPI, Groq (LLaMA 3.3 70B), pdfplumber, SQLAlchemy, SQLite

**Frontend:** React, Vite, Tailwind CSS, Axios

## Project Structure

```
fnol_agent/
├── backend/
│   ├── main.py          # FastAPI app + SQLite audit log
│   ├── agent.py         # AI extraction + routing logic
│   ├── models.py        # Pydantic schemas
│   ├── sample_docs/     # 5 test FNOL documents
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── App.jsx      # React UI
└── README.md
```

## How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=sqlite+aiosqlite:///./claims.db
```

Then start the server:
```bash
python main.py
```

- API runs at: http://localhost:8000
- Swagger UI at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```
VITE_API_URL=http://localhost:8000
```

Then start the dev server:
```bash
npm run dev
```

- UI runs at: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/claims/upload` | Upload FNOL document (.txt or .pdf) |
| GET | `/claims/history` | View all processed claims |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |

## Output Format

```json
{
  "extractedFields": {
    "policy_number": "POL-2024-001",
    "policyholder_name": "Ravi Kumar",
    "incident_date": "10-04-2026",
    "claim_type": "auto",
    "estimated_damage": 18000
  },
  "missingFields": [],
  "recommendedRoute": "Fast-track",
  "reasoning": "Estimated damage of ₹18,000 is below the ₹25,000 threshold. All mandatory fields present. Approved for fast-track processing."
}
```

## Sample Test Documents

| File | Expected Route |
|---|---|
| `fnol_fasttrack.txt` | ⚡ Fast-track |
| `fnol_injury.txt` | 🏥 Specialist Queue |
| `fnol_fraud.txt` | 🚨 Investigation Flag |
| `fnol_missing.txt` | 📋 Manual Review |
| `fnol_property.txt` | 📁 Standard Review |