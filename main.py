"""
main.py — RajatBuilds Backend
Phase 1: PostgreSQL Performance Case Study (Index optimization)
Phase 2: Real API Load Tester Engine
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models import User
from routers.test import router as load_test_router
import time
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

app = FastAPI(
    title="RajatBuilds — Backend Performance Arena",
    description="""
## Built by Rajat. Proof over promises.

### Phase 1: PostgreSQL Performance Case Study
A real benchmark: 100k row full-table scan optimized via B-Tree indexing.
**Result: 98.5% latency reduction (200ms → 2.91ms)**

### Phase 2: API Load Tester
Fire real concurrent HTTP requests at any public API.
Get back latency stats, throughput, and error breakdowns.
    """,
    version="2.0.0",
    docs_url="/docs",
)

# CORS — allow the Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the Load Tester router (Phase 2)
app.include_router(load_test_router)


# ─────────────────────────────────────────────
# Phase 1: PostgreSQL Case Study Endpoints
# ─────────────────────────────────────────────

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@app.get("/api/users/find", tags=["Phase 1 — DB Case Study"])
async def find_users(city: str, db: AsyncSession = Depends(get_db)):
    """
    Unoptimized (before index) → Optimized (after index) case study endpoint.
    Measures real DB query latency on a 100k row PostgreSQL table.
    """
    start_time = time.perf_counter()
    result = await db.execute(select(User).filter(User.city == city))
    users = result.scalars().all()
    end_time = time.perf_counter()
    duration_ms = (end_time - start_time) * 1000

    return {
        "status": "OPTIMIZED" if duration_ms < 10 else "UNOPTIMIZED",
        "latency_ms": round(duration_ms, 2),
        "count": len(users),
        "data": [
            {"name": u.name, "city": u.city, "job_title": u.job_title}
            for u in users[:5]
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
