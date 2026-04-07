"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Settings2, ChevronRight } from "lucide-react";
import { TestRequest } from "@/lib/types";

interface ConfigPanelProps {
  onFire: (req: TestRequest) => void;
  isLoading: boolean;
  onPinBaseline?: () => void;
  hasResult?: boolean;
}

export default function ConfigPanel({ onFire, isLoading, onPinBaseline, hasResult }: ConfigPanelProps) {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [concurrent, setConcurrent] = useState(20);
  const [timeout, setTimeoutVal] = useState(10);
  const [error, setError] = useState("");
  const [fired, setFired] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleFire = () => {
    setError("");
    if (!url.startsWith("http")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setFired(true);
    globalThis.setTimeout(() => setFired(false), 600);
    onFire({ url, method, concurrent, timeout });
  };


  const methods = ["GET", "POST", "PUT", "DELETE"] as const;
  const methodColors: Record<string, string> = {
    GET: "#00ff88", POST: "#00d4ff", PUT: "#ffaa00", DELETE: "#ff3366"
  };

  return (
    <div className="glass-card p-5 h-full flex flex-col gap-4" style={{ border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings2 size={13} style={{ color: "var(--accent-primary)" }} />
        <span className="text-[11px] tracking-widest uppercase font-bold" style={{ color: "var(--text-muted)" }}>
          Target Configuration
        </span>
      </div>

      {/* URL Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-secondary)" }}>
          Target URL
        </label>
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{
            border: `1px solid ${error ? "var(--accent-red)" : "var(--border)"}`,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <span
            className="px-3 text-[10px] border-r py-3 font-bold flex-shrink-0"
            style={{ color: "var(--accent-primary)", borderColor: "var(--border)", background: "rgba(0,255,136,0.05)" }}
          >
            URL
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 bg-transparent px-3 py-3 text-xs outline-none placeholder:opacity-30 min-w-0"
            style={{ color: "var(--text-primary)", fontFamily: "JetBrains Mono" }}
          />
        </div>
        {error && <span className="text-[10px]" style={{ color: "var(--accent-red)" }}>⛔ {error}</span>}
      </div>

      {/* Method Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-secondary)" }}>
          HTTP Method
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className="py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-200"
              style={{
                background: method === m ? `${methodColors[m]}15` : "rgba(0,0,0,0.3)",
                border: `1px solid ${method === m ? methodColors[m] : "var(--border)"}`,
                color: method === m ? methodColors[m] : "var(--text-muted)",
                boxShadow: method === m ? `0 0 12px ${methodColors[m]}25` : "none",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Concurrent Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-secondary)" }}>
            Concurrent Requests
          </label>
          <span className="text-sm font-black" style={{ color: "var(--accent-primary)" }}>{concurrent}</span>
        </div>
        <input
          type="range" min={1} max={100} value={concurrent}
          onChange={(e) => setConcurrent(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--accent-primary) ${concurrent}%, rgba(0,255,136,0.08) ${concurrent}%)` }}
        />
        <div className="flex justify-between text-[9px]" style={{ color: "var(--text-muted)" }}>
          <span>1</span><span>50</span><span>100</span>
        </div>
      </div>

      {/* Timeout Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-secondary)" }}>
            Timeout
          </label>
          <span className="text-sm font-black" style={{ color: "var(--accent-primary)" }}>{timeout}s</span>
        </div>
        <input
          type="range" min={1} max={30} value={timeout}
          onChange={(e) => setTimeoutVal(Number(e.target.value))}

          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--accent-primary) ${(timeout / 30) * 100}%, rgba(0,255,136,0.08) ${(timeout / 30) * 100}%)` }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pin Baseline Button */}
      {hasResult && onPinBaseline && (
        <button
          onClick={onPinBaseline}
          className="w-full py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all duration-200 hover:opacity-80"
          style={{
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.2)",
            color: "var(--accent-blue)",
          }}
        >
          <ChevronRight size={11} />
          PIN AS BASELINE
        </button>
      )}

      {/* FIRE Button — with recoil animation */}
      <motion.button
        ref={btnRef}
        onClick={handleFire}
        disabled={isLoading}
        animate={fired ? {
          y: [0, -6, 3, -2, 0],
          scale: [1, 0.94, 1.02, 0.98, 1],
        } : {}}
        transition={{ duration: 0.4 }}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        className="w-full py-4 rounded-xl font-black text-base tracking-[0.3em] uppercase flex items-center justify-center gap-2 relative overflow-hidden"
        style={{
          background: isLoading
            ? "rgba(0,255,136,0.04)"
            : "linear-gradient(135deg, rgba(0,255,136,0.18), rgba(0,255,136,0.06))",
          border: `1px solid ${isLoading ? "var(--border)" : "var(--accent-primary)"}`,
          color: isLoading ? "var(--text-muted)" : "var(--accent-primary)",
          boxShadow: isLoading ? "none" : "0 0 30px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,255,136,0.03)",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {/* Animated border glow on idle */}
        {!isLoading && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ boxShadow: "inset 0 0 20px rgba(0,255,136,0.06)" }}
          />
        )}

        {isLoading ? (
          <>
            <motion.div
              className="w-3.5 h-3.5 rounded-full border-2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }}
            />
            ANALYZING
          </>
        ) : (
          <>
            <Zap size={16} fill="currentColor" />
            FIRE
          </>
        )}
      </motion.button>
    </div>
  );
}
