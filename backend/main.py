import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
import json
from dotenv import load_dotenv
from agent import analyze

load_dotenv()

# ── Database setup ────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./claims.db")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ClaimLog(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=True)
    recommended_route = Column(String)
    reasoning = Column(Text)
    extracted_fields = Column(Text)
    missing_fields = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FNOL Agent API",
    description="Autonomous Insurance Claims Processing Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "FNOL Agent API",
        "status": "running",
        "endpoints": {
            "analyze": "POST /claims/upload",
            "history": "GET /claims/history",
            "health": "GET /health",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/claims/upload")
async def upload_claim(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith((".txt", ".pdf")):
        raise HTTPException(status_code=415, detail="Only .txt and .pdf files supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Run agent pipeline
    try:
        result = analyze(file_bytes, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    # Save to audit log
    try:
        async with AsyncSessionLocal() as session:
            log = ClaimLog(
                filename=file.filename,
                recommended_route=result["recommendedRoute"],
                reasoning=result["reasoning"],
                extracted_fields=json.dumps(result["extractedFields"]),
                missing_fields=json.dumps(result["missingFields"]),
            )
            session.add(log)
            await session.commit()
    except Exception as e:
        print(f"⚠️ Audit log error: {e}")

    return JSONResponse(content=result)


@app.get("/claims/history")
async def get_history():
    try:
        from sqlalchemy import select
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ClaimLog).order_by(ClaimLog.created_at.desc())
            )
            claims = result.scalars().all()
            return [
                {
                    "id": c.id,
                    "filename": c.filename,
                    "recommendedRoute": c.recommended_route,
                    "reasoning": c.reasoning,
                    "extractedFields": json.loads(c.extracted_fields),
                    "missingFields": json.loads(c.missing_fields),
                    "createdAt": c.created_at.isoformat(),
                }
                for c in claims
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)