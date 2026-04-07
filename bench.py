"""
bench.py — The Load Tester.
Sends N concurrent requests to the API and measures latency stats.
Run BEFORE attack.py to record "Before" numbers.
Run AFTER attack.py to record "After" numbers.
"""

import asyncio
import httpx
import time
import sys

BASE_URL = "http://localhost:8000"
CITY = "East Michael"  # Top city in seeded data (~82 matches)
CONCURRENT = 50       # Number of concurrent requests


async def single_request(client: httpx.AsyncClient, city: str):
    start = time.perf_counter()
    try:
        resp = await client.get(f"{BASE_URL}/api/users/find", params={"city": city}, timeout=30)
        latency = (time.perf_counter() - start) * 1000
        return {"latency_ms": round(latency, 2), "status": resp.status_code}
    except Exception as e:
        return {"latency_ms": None, "status": "ERROR", "error": str(e)}

async def benchmark(label: str):
    print("=" * 55)
    print(f"  RajatBuilds — Benchmark: [{label}]")
    print(f"  Target City: {CITY} | Concurrent Requests: {CONCURRENT}")
    print("=" * 55)
    print(f"\n[*] Firing {CONCURRENT} concurrent requests...\n")

    async with httpx.AsyncClient() as client:
        tasks = [single_request(client, CITY) for _ in range(CONCURRENT)]
        results = await asyncio.gather(*tasks)

    latencies = [r["latency_ms"] for r in results if r["latency_ms"] is not None]
    errors = [r for r in results if r["latency_ms"] is None]

    avg = round(sum(latencies) / len(latencies), 2)
    min_l = round(min(latencies), 2)
    max_l = round(max(latencies), 2)
    success_rate = round((len(latencies) / CONCURRENT) * 100, 1)

    print(f"  ✅ Successful Requests : {len(latencies)}/{CONCURRENT}")
    print(f"  ❌ Errors              : {len(errors)}")
    print(f"  📊 Avg Latency         : {avg}ms")
    print(f"  ⚡ Min Latency         : {min_l}ms")
    print(f"  🔥 Max Latency         : {max_l}ms")
    print(f"  🎯 Success Rate        : {success_rate}%")
    print("\n" + "=" * 55)
    return avg

if __name__ == "__main__":
    label = sys.argv[1] if len(sys.argv) > 1 else "BEFORE"
    asyncio.run(benchmark(label))
