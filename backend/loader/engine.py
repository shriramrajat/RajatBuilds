"""
engine.py — The Core Load Testing Engine.
This is the most important file in the project.

What it does:
- Fires N truly concurrent HTTP requests using asyncio + httpx
- Measures wall-clock latency per request
- Calculates percentiles (p50, p75, p90, p95, p99)
- Tracks status code distribution
- Handles timeouts and connection errors gracefully
- Returns a complete TestResult object
"""

import asyncio
import httpx
import time
import statistics
from typing import Dict, Optional, List
from .schemas import TestRequest, TestResult, StatusBreakdown, PercentileStats


def _calculate_percentile(latencies: List[float], percentile: float) -> float:
    """Calculate a specific percentile from a list of latencies."""
    if not latencies:
        return 0.0
    sorted_lats = sorted(latencies)
    index = int(len(sorted_lats) * percentile / 100)
    index = min(index, len(sorted_lats) - 1)
    return round(sorted_lats[index], 2)


async def _fire_single_request(
    client: httpx.AsyncClient,
    req: TestRequest,
) -> Dict:
    """
    Fire a single HTTP request and return the result.
    This is the atomic unit of the load tester.
    """
    start = time.perf_counter()
    result = {
        "latency_ms": None,
        "status_code": None,
        "error": None,
        "category": "success"
    }

    try:
        response = await client.request(
            method=req.method.value,
            url=req.url,
            headers=req.headers or {},
            json=req.body if req.body else None,
            timeout=req.timeout
        )
        latency_ms = (time.perf_counter() - start) * 1000
        result["latency_ms"] = round(latency_ms, 2)
        result["status_code"] = response.status_code

        if 200 <= response.status_code < 300:
            result["category"] = "success"
        elif 300 <= response.status_code < 400:
            result["category"] = "redirect"
        elif 400 <= response.status_code < 500:
            result["category"] = "client_error"
        else:
            result["category"] = "server_error"

    except httpx.TimeoutException:
        result["category"] = "timeout"
        result["error"] = f"Request timed out after {req.timeout}s"

    except httpx.ConnectError as e:
        result["category"] = "connection_error"
        result["error"] = f"Connection error: {str(e)[:100]}"

    except Exception as e:
        result["category"] = "connection_error"
        result["error"] = f"Unexpected error: {str(e)[:100]}"

    return result


async def run_load_test(req: TestRequest) -> TestResult:
    """
    Main entry point. Fires all concurrent requests and assembles the result.
    """
    wall_start = time.perf_counter()

    # Fire all requests concurrently
    async with httpx.AsyncClient(follow_redirects=True) as client:
        tasks = [_fire_single_request(client, req) for _ in range(req.concurrent)]
        raw_results = await asyncio.gather(*tasks)

    wall_end = time.perf_counter()
    total_duration_ms = (wall_end - wall_start) * 1000

    # Separate successful latencies for stats
    latencies = [r["latency_ms"] for r in raw_results if r["latency_ms"] is not None]
    errors = [r["error"] for r in raw_results if r["error"] is not None]

    # Count status categories
    breakdown = StatusBreakdown(
        success=sum(1 for r in raw_results if r["category"] == "success"),
        redirect=sum(1 for r in raw_results if r["category"] == "redirect"),
        client_error=sum(1 for r in raw_results if r["category"] == "client_error"),
        server_error=sum(1 for r in raw_results if r["category"] == "server_error"),
        timeout=sum(1 for r in raw_results if r["category"] == "timeout"),
        connection_error=sum(1 for r in raw_results if r["category"] == "connection_error"),
    )

    # Compute latency stats
    avg_lat = round(statistics.mean(latencies), 2) if latencies else 0.0
    min_lat = round(min(latencies), 2) if latencies else 0.0
    max_lat = round(max(latencies), 2) if latencies else 0.0

    percentiles = PercentileStats(
        p50=_calculate_percentile(latencies, 50),
        p75=_calculate_percentile(latencies, 75),
        p90=_calculate_percentile(latencies, 90),
        p95=_calculate_percentile(latencies, 95),
        p99=_calculate_percentile(latencies, 99),
    )

    successful = breakdown.success
    failed = req.concurrent - successful
    success_rate = round((successful / req.concurrent) * 100, 1)
    rps = round((req.concurrent / total_duration_ms) * 1000, 2) if total_duration_ms > 0 else 0

    return TestResult(
        status="COMPLETED",
        target_url=req.url,
        method=req.method.value,
        total_requests=req.concurrent,
        successful_requests=successful,
        failed_requests=failed,
        success_rate=success_rate,
        avg_latency_ms=avg_lat,
        min_latency_ms=min_lat,
        max_latency_ms=max_lat,
        percentiles=percentiles,
        total_duration_ms=round(total_duration_ms, 2),
        requests_per_second=rps,
        status_breakdown=breakdown,
        errors=list(set(errors))[:5],  # Deduplicate, limit to 5
    )
