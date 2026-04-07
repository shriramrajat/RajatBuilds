"""
routers/test.py — The Load Test API Router.
Exposes the load tester engine as a REST endpoint.
"""

from fastapi import APIRouter, HTTPException
from loader.schemas import TestRequest, TestResult
from loader.engine import run_load_test

router = APIRouter(prefix="/api/v1", tags=["Load Tester"])

# Blocklist — prevent testing localhost internals or private IPs maliciously
BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1"]


def _is_blocked(url: str) -> bool:
    """Prevent users from using the tool to attack internal infrastructure."""
    for host in BLOCKED_HOSTS:
        if host in url:
            return True
    return False


@router.post("/test", response_model=TestResult, summary="Run a Load Test")
async def run_test(req: TestRequest):
    """
    ## RajatBuilds — API Load Tester

    Fire N concurrent HTTP requests at any public API endpoint and get back:
    - **Latency stats** (avg, min, max, p50/p75/p90/p95/p99)
    - **Throughput** (requests/second)
    - **Success rate** and status code breakdown
    - **Error details** if any requests fail

    **Limits:**
    - Max 100 concurrent requests per test
    - Max timeout of 30 seconds per request
    - Private/localhost URLs are blocked
    """
    if _is_blocked(req.url):
        raise HTTPException(
            status_code=400,
            detail="Testing localhost or private IPs is not allowed. Use a public URL."
        )

    result = await run_load_test(req)
    return result


@router.get("/health", summary="Health Check")
async def health():
    return {"status": "operational", "service": "RajatBuilds Load Tester"}
