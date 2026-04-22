import os
import json
import re
import pdfplumber
from io import BytesIO
from groq import Groq
from dotenv import load_dotenv
from models import ExtractedFields

load_dotenv()

# ── Groq client ───────────────────────────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# ── Mandatory fields (from the brief) ────────────────────────────────────────
MANDATORY_FIELDS = [
    "policy_number", "policyholder_name", "effective_dates",
    "incident_date", "incident_time", "incident_location",
    "incident_description", "claimant_name", "contact_details",
    "asset_type", "asset_id", "estimated_damage",
    "claim_type", "initial_estimate"
]

# ── Fraud keywords (from the brief) ──────────────────────────────────────────
FRAUD_KEYWORDS = ["fraud", "inconsistent", "staged", "fake", "fabricated"]


# ── Extract text from PDF or TXT ─────────────────────────────────────────────
def extract_text(file_bytes: bytes, content_type: str) -> str:
    if content_type == "application/pdf":
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    return file_bytes.decode("utf-8")


# ── STEP 1: Extract fields using Groq ────────────────────────────────────────
def extract_fields(text: str) -> ExtractedFields:
    prompt = f"""You are an expert insurance claims analyst.

Extract all fields from the FNOL document below and return ONLY a valid JSON object.
No explanation, no markdown, just raw JSON.

Extract these fields (use null if not found):
{{
  "policy_number": string | null,
  "policyholder_name": string | null,
  "effective_dates": string | null,
  "incident_date": string | null,
  "incident_time": string | null,
  "incident_location": string | null,
  "incident_description": string | null,
  "claimant_name": string | null,
  "third_parties": list of strings | null,
  "contact_details": string | null,
  "asset_type": string | null,
  "asset_id": string | null,
  "estimated_damage": number | null,
  "claim_type": string | null,
  "attachments": list of strings | null,
  "initial_estimate": number | null
}}

FNOL Document:
{text}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    data = json.loads(raw)
    return ExtractedFields(**data)


# ── STEP 2: Find missing fields ───────────────────────────────────────────────
def find_missing_fields(fields: ExtractedFields) -> list:
    data = fields.model_dump()
    return [f for f in MANDATORY_FIELDS if not data.get(f)]


# ── STEPS 3 & 4: Route + explain ─────────────────────────────────────────────
def route_claim(fields: ExtractedFields, missing: list) -> tuple:

    # Rule 1: Fraud keywords → Investigation Flag (highest priority)
    desc = (fields.incident_description or "").lower()
    if any(kw in desc for kw in FRAUD_KEYWORDS):
        found = [kw for kw in FRAUD_KEYWORDS if kw in desc]
        return (
            "Investigation Flag",
            f"Incident description contains suspicious keyword(s): {', '.join(found)}. "
            "Claim flagged for investigation before further processing."
        )

    # Rule 2: Missing fields → Manual Review
    if missing:
        return (
            "Manual Review",
            f"Missing mandatory fields: {', '.join(missing)}. "
            "Claim cannot be processed until all required information is provided."
        )

    # Rule 3: Claim type = injury → Specialist Queue
    if (fields.claim_type or "").lower() == "injury":
        return (
            "Specialist Queue",
            "Claim type is 'injury'. Requires medical and legal assessment "
            "by a specialist team before settlement."
        )

    # Rule 4: Damage < 25,000 → Fast-track
    damage = fields.estimated_damage or fields.initial_estimate or 0
    if damage < 25000:
        return (
            "Fast-track",
            f"Estimated damage of ₹{damage:,.0f} is below the ₹25,000 threshold. "
            "All mandatory fields present. Approved for fast-track processing."
        )

    # Default: Standard Review
    return (
        "Standard Review",
        f"Complete claim with estimated damage of ₹{damage:,.0f}, "
        "exceeding the fast-track threshold. Routed for standard review."
    )


# ── Full pipeline ─────────────────────────────────────────────────────────────
def analyze(file_bytes: bytes, content_type: str) -> dict:
    print("📄 Extracting text from document...")
    text = extract_text(file_bytes, content_type)

    print("🔍 Step 1: Extracting fields with Groq...")
    fields = extract_fields(text)

    print("✅ Step 2: Checking for missing fields...")
    missing = find_missing_fields(fields)

    print("🔀 Steps 3 & 4: Routing and explaining...")
    route, reasoning = route_claim(fields, missing)

    return {
        "extractedFields": fields.model_dump(exclude_none=True),
        "missingFields": missing,
        "recommendedRoute": route,
        "reasoning": reasoning
    }