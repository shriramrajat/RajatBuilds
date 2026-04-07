"""
schemas.py — Pydantic models for the Load Tester API.
Defines the shape of every request and response.
"""

from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Dict
from enum import Enum


class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"


class TestRequest(BaseModel):
    url: str = Field(..., description="Target API endpoint to test")
    method: HttpMethod = Field(default=HttpMethod.GET, description="HTTP method")
    concurrent: int = Field(default=10, ge=1, le=100, description="Concurrent requests (max 100)")
    headers: Optional[Dict[str, str]] = Field(default=None, description="Custom headers")
    body: Optional[Dict] = Field(default=None, description="Request body (for POST/PUT)")
    timeout: int = Field(default=10, ge=1, le=30, description="Timeout per request in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://api.example.com/users",
                "method": "GET",
                "concurrent": 50,
                "timeout": 10
            }
        }


class StatusBreakdown(BaseModel):
    success: int      # 2xx
    redirect: int     # 3xx
    client_error: int # 4xx
    server_error: int # 5xx
    timeout: int      # Timed out
    connection_error: int


class PercentileStats(BaseModel):
    p50: float
    p75: float
    p90: float
    p95: float
    p99: float


class TestResult(BaseModel):
    status: str
    target_url: str
    method: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    success_rate: float

    # Latency (ms)
    avg_latency_ms: float
    min_latency_ms: float
    max_latency_ms: float
    percentiles: PercentileStats

    # Throughput
    total_duration_ms: float
    requests_per_second: float

    # Status breakdown
    status_breakdown: StatusBreakdown

    # Metadata
    errors: list[str]
