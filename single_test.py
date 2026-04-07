import asyncio
import httpx
import time

async def single():
    times = []
    db_times = []
    async with httpx.AsyncClient() as client:
        for i in range(10):
            start = time.perf_counter()
            r = await client.get(
                "http://localhost:8000/api/users/find",
                params={"city": "East Michael"},
                timeout=30
            )
            ms = (time.perf_counter() - start) * 1000
            data = r.json()
            times.append(ms)
            db_times.append(data["latency_ms"])
            print(f"Request {i+1}: Round-trip={round(ms,2)}ms | DB only={data['latency_ms']}ms")

    print("-" * 50)
    print(f"Avg Round-trip : {round(sum(times)/len(times), 2)}ms")
    print(f"Avg DB-only    : {round(sum(db_times)/len(db_times), 2)}ms")

asyncio.run(single())
