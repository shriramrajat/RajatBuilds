"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TestResult } from "@/lib/types";

interface StatsGridProps {
  result: TestResult;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p style={{ color: "var(--text-muted)" }}>{label}</p>
        <p style={{ color: "var(--accent-blue)" }}>{payload[0].value.toFixed(1)}ms</p>
      </div>
    );
  }
  return null;
};

export default function StatsGrid({ result }: StatsGridProps) {
  const percentileData = [
    { name: "p50", value: result.percentiles.p50, color: "#00ff88" },
    { name: "p75", value: result.percentiles.p75, color: "#00d4ff" },
    { name: "p90", value: result.percentiles.p90, color: "#ffaa00" },
    { name: "p95", value: result.percentiles.p95, color: "#ff6600" },
    { name: "p99", value: result.percentiles.p99, color: "#ff3366" },
  ];

  const successRate = result.success_rate;
  const isHealthy = successRate === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Success Rate */}
        <div className="glass-card p-4">
          <div className="text-[11px] tracking-widest mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
            SUCCESS RATE
          </div>
          <div
            className="text-4xl font-black stat-number"
            style={{ color: isHealthy ? "var(--accent-primary)" : "var(--accent-red)" }}
          >
            {successRate}
            <span className="text-sm font-normal opacity-70">%</span>
          </div>
          <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
            {result.successful_requests}/{result.total_requests} requests
          </div>
        </div>

        {/* Throughput */}
        <div className="glass-card p-4">
          <div className="text-[11px] tracking-widest mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
            THROUGHPUT
          </div>
          <div className="text-4xl font-black stat-number" style={{ color: "var(--accent-blue)" }}>
            {result.requests_per_second}
            <span className="text-sm font-normal opacity-70"> rps</span>
          </div>
          <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
            in {(result.total_duration_ms / 1000).toFixed(2)}s total
          </div>
        </div>

      </div>

      {/* Percentile Chart */}
      <div className="glass-card p-4">
        <div className="text-[10px] tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          LATENCY PERCENTILES
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={percentileData} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#4a6fa5", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {percentileData.map((entry, index) => (
                <Cell key={index} fill={entry.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Percentile values text */}
        <div className="grid grid-cols-5 gap-1 mt-2">
          {percentileData.map(({ name, value, color }) => (
            <div key={name} className="text-center">
              <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{name}</div>
              <div className="text-xs font-bold stat-number" style={{ color }}>{value.toFixed(0)}ms</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="glass-card p-4">
        <div className="text-[10px] tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          STATUS CODE BREAKDOWN
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "2xx OK",    value: result.status_breakdown.success,          color: "#00ff88" },
            { label: "3xx",       value: result.status_breakdown.redirect,          color: "#00d4ff" },
            { label: "4xx",       value: result.status_breakdown.client_error,      color: "#ffaa00" },
            { label: "5xx ERR",   value: result.status_breakdown.server_error,      color: "#ff3366" },
            { label: "TIMEOUT",   value: result.status_breakdown.timeout,           color: "#ff6600" },
            { label: "CONN ERR",  value: result.status_breakdown.connection_error,  color: "#ff0044" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="text-center p-2 rounded-lg"
              style={{ background: value > 0 ? `${color}10` : "transparent", border: `1px solid ${value > 0 ? color + "30" : "transparent"}` }}
            >
              <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{label}</div>
              <div className="text-base font-bold stat-number" style={{ color: value > 0 ? color : "var(--text-muted)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="glass-card p-4 border-red-500/20">
          <div className="text-[10px] tracking-widest mb-2" style={{ color: "#ff3366" }}>
            ⛔ ERRORS DETECTED
          </div>
          {result.errors.map((err, i) => (
            <div key={i} className="text-[10px] py-1 border-b border-red-500/10 last:border-0" style={{ color: "#ff6666" }}>
              {err}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
