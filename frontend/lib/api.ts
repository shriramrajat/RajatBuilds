import { TestRequest, TestResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log("Performance Arena: Using API at", API_BASE);

export async function runLoadTest(req: TestRequest): Promise<TestResult> {
  const response = await fetch(`${API_BASE}/api/v1/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}
