"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BossState, BOSS_CONFIG, TestResult, getBossHP } from "@/lib/types";

const BOSS_AVATARS: Record<BossState, string> = {
  IDLE:        "◈",
  DEFEATED:    "☠",
  WEAKENED:    "◐",
  ALERT:       "◉",
  RAGING:      "⬡",
  COMPROMISED: "✖",
};

interface BossHPBarProps {
  result: TestResult | null;
  bossState: BossState;
  isLoading: boolean;
}

export default function BossHPBar({ result, bossState, isLoading }: BossHPBarProps) {
  const config = BOSS_CONFIG[bossState];
  const hp = getBossHP(result);
  const bossName = result
    ? (() => { try { return new URL(result.target_url).hostname.toUpperCase(); } catch { return "UNKNOWN"; } })()
    : "AWAITING TARGET";

  return (
    <div
      className="glass-card p-6 relative overflow-hidden"
      style={{ border: `1px solid ${config.color}20` }}
    >
      {/* Animated scan line for intense states */}
      {(bossState === "RAGING" || bossState === "COMPROMISED") && (
        <div
          className="absolute left-0 right-0 h-px opacity-20 pointer-events-none"
          style={{ background: config.color, animation: "scan 2s linear infinite" }}
        />
      )}

      {/* Top row: Avatar + Boss name + HP */}
      <div className="flex items-start gap-4 mb-5">

        {/* Boss Avatar — large animated symbol */}
        <motion.div
          animate={config.animate ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.7, 1],
          } : { scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black"
          style={{
            background: `${config.color}10`,
            border: `2px solid ${config.color}40`,
            color: config.color,
            textShadow: `0 0 20px ${config.color}`,
            boxShadow: `0 0 30px ${config.color}15, inset 0 0 20px ${config.color}05`,
            filter: bossState === "RAGING" ? "drop-shadow(0 0 8px " + config.color + ")" : "none",
          }}
        >
          <span className={config.animate ? "glitch" : ""}>{BOSS_AVATARS[bossState]}</span>
        </motion.div>

        {/* Boss identity */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            BOSS
          </div>
          <div className="text-sm font-bold truncate mb-2" style={{ color: "var(--text-primary)" }}>
            {bossName}
          </div>
          {/* State badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest"
            style={{
              background: `${config.color}10`,
              border: `1px solid ${config.color}30`,
              color: config.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: config.color,
                animation: config.animate ? "pulse-red 0.4s ease-in-out infinite" : "none",
                boxShadow: `0 0 6px ${config.color}`,
              }}
            />
            {isLoading ? "ANALYZING..." : config.label}
          </div>
        </div>

        {/* HP percentage */}
        <div className="text-right">
          <div className="text-[10px] tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>HP</div>
          <motion.div
            key={hp}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black"
            style={{ color: config.color, fontVariantNumeric: "tabular-nums" }}
          >
            {isLoading ? "??" : hp}
            <span className="text-xs font-normal opacity-60">%</span>
          </motion.div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-5">
        <div
          className="w-full h-5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${config.color}20` }}
        >
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            initial={{ width: "0%" }}
            animate={{ width: isLoading ? "25%" : `${hp}%` }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            style={{ background: `linear-gradient(90deg, ${config.color}80, ${config.color})` }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                width: "50%",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* MIN / AVG / MAX */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "MIN LATENCY", value: result.min_latency_ms, sub: "best case" },
              { label: "AVG LATENCY", value: result.avg_latency_ms, sub: "typical" },
              { label: "MAX LATENCY", value: result.max_latency_ms, sub: "worst case" },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl"
                style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${config.color}15` }}
              >
                <div className="text-[9px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                  {label}
                </div>
                <div className="text-xl font-black" style={{ color: config.color, fontVariantNumeric: "tabular-nums" }}>
                  {value.toFixed(0)}
                  <span className="text-[10px] font-normal opacity-60">ms</span>
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEFEATED overlay */}
      <AnimatePresence>
        {bossState === "DEFEATED" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl pointer-events-none gap-2"
            style={{ background: "rgba(0, 255, 136, 0.04)", border: "1px solid #00ff8840" }}
          >
            <div className="text-4xl">☠</div>
            <span
              className="text-xl font-black tracking-[0.3em]"
              style={{ color: "#00ff88", textShadow: "0 0 30px #00ff88, 0 0 60px #00ff8880" }}
            >
              BOSS DEFEATED
            </span>
            <span className="text-xs tracking-widest" style={{ color: "#00ff8880" }}>
              Sub-50ms achieved
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
