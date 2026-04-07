// Types shared across the frontend, mirroring the FastAPI response schema

export interface TestRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  concurrent: number;
  timeout: number;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface PercentileStats {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface StatusBreakdown {
  success: number;
  redirect: number;
  client_error: number;
  server_error: number;
  timeout: number;
  connection_error: number;
}

export interface TestResult {
  status: string;
  target_url: string;
  method: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  percentiles: PercentileStats;
  total_duration_ms: number;
  requests_per_second: number;
  status_breakdown: StatusBreakdown;
  errors: string[];
}

export type BossState = "DEFEATED" | "WEAKENED" | "ALERT" | "RAGING" | "COMPROMISED" | "IDLE";

export function getBossState(result: TestResult | null): BossState {
  if (!result) return "IDLE";
  if (result.status_breakdown.server_error > 0) return "COMPROMISED";
  const avg = result.avg_latency_ms;
  if (avg < 50) return "DEFEATED";
  if (avg < 200) return "WEAKENED";
  if (avg < 500) return "ALERT";
  return "RAGING";
}

export function getBossHP(result: TestResult | null): number {
  if (!result) return 0;
  // Map latency to HP: >1000ms = 100HP, 0ms = 0HP
  return Math.min(100, Math.round((result.avg_latency_ms / 1000) * 100));
}

export const BOSS_CONFIG: Record<BossState, {
  label: string;
  color: string;
  glow: string;
  barColor: string;
  textColor: string;
  animate: boolean;
}> = {
  IDLE:        { label: "AWAITING TARGET",    color: "#4a6fa5", glow: "",           barColor: "#4a6fa5", textColor: "#4a6fa5", animate: false },
  DEFEATED:    { label: "☠ BOSS DEFEATED",    color: "#00ff88", glow: "glow-green", barColor: "#00ff88", textColor: "#00ff88", animate: false },
  WEAKENED:    { label: "⚡ WEAKENED",         color: "#ffaa00", glow: "",           barColor: "#ffaa00", textColor: "#ffaa00", animate: false },
  ALERT:       { label: "⚠ ALERT",            color: "#ff6600", glow: "",           barColor: "#ff6600", textColor: "#ff6600", animate: true  },
  RAGING:      { label: "🔴 RAGING",          color: "#ff3366", glow: "glow-red",   barColor: "#ff3366", textColor: "#ff3366", animate: true  },
  COMPROMISED: { label: "⛔ SYSTEM COMPROMISED", color: "#ff0044", glow: "glow-red", barColor: "#ff0044", textColor: "#ff0044", animate: true },
};
