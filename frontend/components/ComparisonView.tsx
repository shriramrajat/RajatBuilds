"use client";

import { motion } from "framer-motion";
import { TestResult } from "@/lib/types";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface ComparisonViewProps {
  baseline: TestResult;
  current: TestResult;
}

function Delta({ base, curr, lowerIsBetter = true }: { base: number; curr: number; lowerIsBetter?: boolean }) {
  const diff = curr - base;
  const pct = base !== 0 ? ((diff / base) * 100).toFixed(1) : "0";
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const neutral = Math.abs(diff) < 0.5;

  if (neutral) {
    return <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}><Minus size={9} /> NC</span>;
  }

  return (
    <span
      className="text-[10px] font-bold flex items-center gap-0.5"
      style={{ color: improved ? "#00ff88" : "#ff3366" }}
    >
      {improved ? <ArrowDown size={9} /> : <ArrowUp size={9} />}
      {Math.abs(Number(pct))}%
    </span>
  );
}

function StatCard({
  label, baseVal, currVal, unit = "ms", lowerIsBetter = true,
}: {
  label: string; baseVal: number; currVal: number; unit?: string; lowerIsBetter?: boolean;
}) {
  const diff = currVal - baseVal;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;

  return (
    <div
      className="rounded-xl p-3 relative overflow-hidden"
      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)" }}
    >
      <div className="text-[9px] tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="flex items-end justify-between gap-2">
        {/* Baseline */}
        <div>
          <div className="text-[8px] mb-0.5" style={{ color: "var(--accent-blue)" }}>BASELINE</div>
          <div className="text-sm font-black" style={{ color: "var(--accent-blue)", fontVariantNumeric: "tabular-nums" }}>
            {baseVal.toFixed(0)}<span className="text-[9px] font-normal opacity-60">{unit}</span>
          </div>
        </div>

        {/* Delta arrow */}
        <div className="flex flex-col items-center gap-0.5">
          <Delta base={baseVal} curr={currVal} lowerIsBetter={lowerIsBetter} />
          <div className="w-px h-4" style={{ background: "var(--border)" }} />
        </div>

        {/* Current */}
        <div className="text-right">
          <div className="text-[8px] mb-0.5" style={{ color: "var(--accent-primary)" }}>CURRENT</div>
          <div
            className="text-sm font-black"
            style={{ color: improved ? "#00ff88" : "#ff3366", fontVariantNumeric: "tabular-nums" }}
          >
            {currVal.toFixed(0)}<span className="text-[9px] font-normal opacity-60">{unit}</span>
          </div>
        </div>
      </div>

      {/* Improvement bar */}
      {improved && (
        <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(0,255,136,0.1)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.abs(((baseVal - currVal) / baseVal) * 100))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--accent-primary)" }}
          />
        </div>
      )}
    </div>
  );
}

export default function ComparisonView({ baseline, current }: ComparisonViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
      style={{ border: "1px solid rgba(0,212,255,0.2)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase font-bold" style={{ color: "var(--accent-blue)" }}>
            📊 Before vs After
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-blue)" }} />
            <span style={{ color: "var(--text-muted)" }}>Baseline</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
            <span style={{ color: "var(--text-muted)" }}>Current</span>
          </span>
        </div>
      </div>

      {/* Comparison grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard label="AVG LATENCY" baseVal={baseline.avg_latency_ms} currVal={current.avg_latency_ms} />
        <StatCard label="P95 LATENCY" baseVal={baseline.percentiles.p95} currVal={current.percentiles.p95} />
        <StatCard label="MAX LATENCY" baseVal={baseline.max_latency_ms} currVal={current.max_latency_ms} />
        <StatCard label="THROUGHPUT" baseVal={baseline.requests_per_second} currVal={current.requests_per_second} unit=" rps" lowerIsBetter={false} />
      </div>

      {/* p50/p75/p90 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="P50" baseVal={baseline.percentiles.p50} currVal={current.percentiles.p50} />
        <StatCard label="P75" baseVal={baseline.percentiles.p75} currVal={current.percentiles.p75} />
        <StatCard label="P90" baseVal={baseline.percentiles.p90} currVal={current.percentiles.p90} />
      </div>
    </motion.div>
  );
}
