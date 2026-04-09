"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Wifi } from "lucide-react";
import { runLoadTest } from "@/lib/api";
import { TestRequest, TestResult, getBossState } from "@/lib/types";
import BossHPBar from "@/components/BossHPBar";
import StatsGrid from "@/components/StatsGrid";
import ConfigPanel from "@/components/ConfigPanel";
import BattleHistory from "@/components/BattleHistory";
import ComparisonView from "@/components/ComparisonView";

export default function ArenaDashboard() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem("arena_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [baseline, setBaseline] = useState<TestResult | null>(() => {
    try {
      const saved = localStorage.getItem("arena_baseline");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const bossState = getBossState(result);

  const handleFire = async (req: TestRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await runLoadTest(req);
      setResult(data);
      setHistory((prev) => {
        const updated = [...prev.slice(-9), data];
        try { localStorage.setItem("arena_history", JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "Connection failed. Is the backend running on :8000?");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinBaseline = () => {
    if (result) {
      setBaseline(result);
      try { localStorage.setItem("arena_baseline", JSON.stringify(result)); } catch {}
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setBaseline(null);
    try {
      localStorage.removeItem("arena_history");
      localStorage.removeItem("arena_baseline");
    } catch {}
  };

  return (
    <div className="min-h-screen relative z-10 p-4 md:p-6 max-w-7xl mx-auto">

      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,255,136,0.1)", border: "1px solid var(--border)" }}
            >
              <Shield size={18} style={{ color: "var(--accent-primary)" }} />
            </div>
            <div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: "var(--accent-primary)", boxShadow: "0 0 8px var(--accent-primary)", animation: "pulse-blue 2s infinite" }}
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: "var(--text-primary)" }}>
              Rajat<span style={{ color: "var(--accent-primary)" }}>Builds</span>
            </h1>
            <p className="text-[10px] tracking-widest" style={{ color: "var(--text-muted)" }}>
              Performance Arena · v2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
            <span className="text-[10px] tracking-widest" style={{ color: "var(--text-muted)" }}>OPERATIONAL</span>
          </div>
          <a
            href="https://github.com/shriramrajat/RajatBuilds"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] tracking-widest transition-opacity hover:opacity-70 px-3 py-1.5 rounded-lg"
            style={{
              color: "var(--accent-primary)",
              border: "1px solid var(--border)",
              background: "rgba(0,255,136,0.04)",
            }}
          >
            ↗ GITHUB
          </a>
        </div>
      </header>

      {/* Tagline */}
      <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
        Fire real concurrent HTTP requests at any public API.{" "}
        <span style={{ color: "var(--text-secondary)" }}>Expose bottlenecks. Prove performance.</span>
      </p>

      {/* ─── MAIN GRID: Boss+Stats (LEFT) | Config (RIGHT) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">

        {/* LEFT: Boss + Stats */}
        <div className="flex flex-col gap-4">

          {/* Boss HP Bar */}
          <BossHPBar result={result} bossState={bossState} isLoading={isLoading} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card px-4 py-3 text-xs"
                style={{ borderColor: "rgba(255,51,102,0.3)", color: "#ff8888" }}
              >
                ⛔ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading animation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 flex flex-col items-center gap-4"
              >
                <div className="flex gap-1.5 items-end">
                  {[0,1,2,3,4,5,6].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                      animate={{ height: ["8px", "32px", "8px"] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.1, ease: "easeInOut" }}
                    />
                  ))}
                </div>
                <span className="text-[11px] tracking-[0.3em] cursor" style={{ color: "var(--text-muted)" }}>
                  FIRING REQUESTS
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <AnimatePresence>
            {result && !isLoading && <StatsGrid result={result} />}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(0,255,136,0.06)", border: "1px solid var(--border)" }}
              >
                ◈
              </div>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Arena is ready
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Configure a target on the right and hit{" "}
                  <span style={{ color: "var(--accent-primary)" }}>FIRE</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Config Panel */}
        <ConfigPanel
          onFire={handleFire}
          isLoading={isLoading}
          hasResult={!!result}
          onPinBaseline={handlePinBaseline}
        />
      </div>

      {/* ─── COMPARISON VIEW ─── */}
      <AnimatePresence>
        {baseline && result && result !== baseline && !isLoading && (
          <div className="mb-4">
            <ComparisonView baseline={baseline} current={result} />
          </div>
        )}
      </AnimatePresence>

      {/* ─── BATTLE HISTORY ─── */}
      <BattleHistory
        history={history}
        baselineIndex={baseline ? history.indexOf(baseline) : null}
        onClear={handleClearHistory}
      />

      {/* ─── FOOTER ─── */}
      <footer className="mt-6 text-center text-[10px] tracking-widest" style={{ color: "var(--text-muted)" }}>
        Built by{" "}
        <a
          href="https://github.com/shriramrajat"
          target="_blank"
          rel="noreferrer"
          className="hover:opacity-70 transition-opacity"
          style={{ color: "var(--accent-primary)" }}
        >
          Rajat
        </a>
        {" "} · Phase 2 of 5 · FastAPI + PostgreSQL
      </footer>
    </div>
  );
}
