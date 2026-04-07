from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models import User
import time
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,         # Realistic concurrent DB connections for local Postgres
    max_overflow=10,      # Allow 10 extra connections in burst
    pool_pre_ping=True,   # Health-check connections before using them
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

app = FastAPI(title="RajatBuilds - Performance Arena")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/api/users/find")
async def find_users(city: str, db: AsyncSession = Depends(get_db)):
    start_time = time.perf_counter()
    
    # This is a full table scan because there is no index on 'city'
    result = await db.execute(select(User).filter(User.city == city))
    users = result.scalars().all()
    
    end_time = time.perf_counter()
    duration_ms = (end_time - start_time) * 1000
    
    return {
        "status": "UNOPTIMIZED",
        "latency_ms": round(duration_ms, 2),
        "count": len(users),
        "data": users[:5], # Return samples for the "game" view
        "hint": "Add a PostgreSQL index to the 'city' column to win."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
