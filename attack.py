"""
attack.py — The Critical Strike.
Adds a B-Tree index on the 'city' column in the users table.
Run this ONCE. Then benchmark again and watch the latency collapse.
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv
import time

load_dotenv()

# Parse the DATABASE_URL from SQLAlchemy async format back to raw format for asyncpg
RAW_URL = os.getenv("DATABASE_URL")
if not RAW_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

# asyncpg expects postgres:// or postgresql://
if RAW_URL.startswith("postgresql+asyncpg://"):
    RAW_URL = RAW_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
# Some providers use "postgres://" in DATABASE_URL, which is fine for asyncpg

async def apply_index():
    print("=" * 50)
    print("  RajatBuilds — Critical Strike: Applying Index")
    print("=" * 50)

    conn = await asyncpg.connect(RAW_URL)

    # Check if index already exists
    exists = await conn.fetchval(
        "SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE tablename='users' AND indexname='idx_users_city')"
    )
    if exists:
        print("\n[!] Index already exists. Boss is already weakened.")
        await conn.close()
        return

    print("\n[*] Applying B-Tree index on 'city' column...")
    start = time.perf_counter()
    await conn.execute("CREATE INDEX idx_users_city ON users(city);")
    duration = (time.perf_counter() - start) * 1000

    await conn.close()
    print(f"[✓] Index created in {round(duration, 2)}ms")
    print("\n[!] The Boss is now vulnerable. Run bench.py to confirm the kill.")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(apply_index())
