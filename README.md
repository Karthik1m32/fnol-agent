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

## Features

### Dashboard
- Drag & drop FNOL document upload (.txt or .pdf)
- AI extracts all mandatory fields instantly
- Colour-coded route decision with confidence score
- Completeness progress bar
- Routing reasoning explanation
- Raw JSON response viewer with copy button
- Download extracted data as Excel

### Analytics
- Total claims processed
- Average and total damage exposure
- Fraud flag count
- Claims by route (pie chart)
- Claims by type (bar chart)
- Average claim value by route (bar chart)
- Most frequently missing fields (progress bars)
- Clear all data button

### History
- Full audit log of all processed claims
- Click any claim to expand full details
- Download individual claim as Excel
- Download all claims as Excel report

## Tech Stack

**Backend:** Python, FastAPI, Groq (LLaMA 3.3 70B), pdfplumber, SQLAlchemy, SQLite

**Frontend:** React, Vite, Tailwind CSS, Recharts, SheetJS (xlsx)

**Theme:** Synapx brand colours (Purple #5B2D8E + Teal #00B4AE)

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
├── start.bat            # One-click launcher
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

Then start:
```bash
npm run dev
```

- UI runs at: http://localhost:5173

### One-Click Launch
Double-click `start.bat` to start both servers and open browser tabs automatically.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/claims/upload` | Upload FNOL document (.txt or .pdf) |
| GET | `/claims/history` | View all processed claims |
| DELETE | `/claims/clear` | Clear all claims data |
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
