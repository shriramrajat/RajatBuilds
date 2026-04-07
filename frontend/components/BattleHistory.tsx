"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TestResult } from "@/lib/types";
import { Clock, Target, Pin } from "lucide-react";

interface BattleHistoryProps {
  history: TestResult[];
  baselineIndex?: number | null;
  onPin?: (idx: number) => void;
}

function LatencyBadge({ ms }: { ms: number }) {
  const color =
    ms < 50 ? "#00ff88" :
    ms < 200 ? "#00d4ff" :
    ms < 500 ? "#ffaa00" :
    ms < 1000 ? "#ff6600" : "#ff3366";
  return (
    <span className="font-black stat-number text-sm" style={{ color, fontVariantNumeric: "tabular-nums" }}>
      {ms.toFixed(0)}<span className="text-[9px] font-normal opacity-60">ms</span>
    </span>
  );
}

export default function BattleHistory({ history, baselineIndex, onPin }: BattleHistoryProps) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock size={12} style={{ color: "var(--accent-primary)" }} />
        <span className="text-[11px] tracking-widest uppercase font-bold" style={{ color: "var(--text-muted)" }}>
          Battle History
        </span>
        <span
          className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(0,255,136,0.08)", border: "1px solid var(--border)", color: "var(--accent-primary)" }}
        >
          {history.length} runs
        </span>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[28px_1fr_60px_70px_60px_60px_52px_44px] gap-2 items-center px-3 mb-1">
        {["#", "TARGET", "×REQ", "AVG", "P95", "MAX", "RPS", "OK%"].map(h => (
          <div key={h} className="text-[9px] tracking-widest" style={{ color: "var(--text-muted)" }}>{h}</div>
        ))}
      </div>

      <div className="space-y-1.5">
        <AnimatePresence>
          {[...history].reverse().map((result, i) => {
            const globalIdx = history.length - 1 - i;
            const isBaseline = baselineIndex === globalIdx;

            return (
              <motion.div
                key={globalIdx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[28px_1fr_60px_70px_60px_60px_52px_44px] gap-2 items-center py-2.5 px-3 rounded-xl group cursor-default"
                style={{
                  background: isBaseline ? "rgba(0,212,255,0.06)" : "rgba(0,0,0,0.25)",
                  border: `1px solid ${isBaseline ? "rgba(0,212,255,0.25)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}
              >
                {/* Run # */}
                <div className="text-[11px] font-black" style={{ color: isBaseline ? "var(--accent-blue)" : "var(--text-muted)" }}>
                  {isBaseline ? "📌" : `#${history.length - i}`}
                </div>

                {/* Target */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <Target size={9} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {(() => { try { return new URL(result.target_url).hostname; } catch { return result.target_url; } })()}
                  </span>
                </div>

                {/* Concurrent */}
                <div className="text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>
                  ×{result.total_requests}
                </div>

                {/* Avg */}
                <LatencyBadge ms={result.avg_latency_ms} />

                {/* p95 */}
                <LatencyBadge ms={result.percentiles.p95} />

                {/* Max */}
                <LatencyBadge ms={result.max_latency_ms} />

                {/* RPS */}
                <span className="text-[11px] font-bold" style={{ color: "var(--accent-blue)" }}>
                  {result.requests_per_second.toFixed(1)}
                </span>

                {/* Success % */}
                <span
                  className="text-[11px] font-black"
                  style={{ color: result.success_rate === 100 ? "#00ff88" : "#ff3366" }}
                >
                  {result.success_rate}%
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
