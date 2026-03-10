import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanningWorld({ active }) {
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col"
      style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(148,163,184,0.4)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-xs uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          GLOBAL SCAN
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span
            className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
          />
          <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {active ? "Scan in progress" : "Ready"}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
        <div className="relative overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
          <WorldMap active={active} />
        </div>
        <div className="flex flex-col gap-3">
          <Terminal active={active} />
          <ProgressFooter active={active} />
        </div>
      </div>
    </div>
  );
}

function WorldMap({ active }) {
  const pulses = Array.from({ length: 10 });
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ opacity: 0.75, filter: "drop-shadow(0 0 12px rgba(15,23,42,0.8))" }}
      >
        <rect width="800" height="400" fill="#020617" />
        <path
          d="M98 147 Q160 120 210 130 T310 120 T390 140 T460 135 T520 150 T600 140 T680 160 T740 150
             Q730 190 700 210 T630 230 T560 225 T500 240 T430 230 T360 220 T300 215 T250 210 T190 205 T130 190 Z"
          fill="#0b1220"
          stroke="#1f2937"
          strokeWidth="1"
        />
        <circle cx="220" cy="155" r="3" fill="#22c55e" />
        <circle cx="310" cy="180" r="3" fill="#22c55e" />
        <circle cx="430" cy="160" r="3" fill="#22c55e" />
        <circle cx="540" cy="175" r="3" fill="#22c55e" />
        <circle cx="650" cy="165" r="3" fill="#22c55e" />
      </svg>
      <AnimatePresence>
        {active &&
          pulses.map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-rose-400"
              style={{
                left: `${20 + (i * 7) % 60}%`,
                top: `${35 + (i * 11) % 30}%`,
                boxShadow: "0 0 18px rgba(251,113,133,0.7)",
              }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeOut",
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

function Terminal({ active }) {
  const lines = [
    "[Scanning Google Images...]",
    "[Scanning Reddit...]",
    "[Scanning Twitter/X...]",
    "[Scanning Telegram channels...]",
    "[Scanning adult content platforms...]",
    "[Scanning news sites...]",
    "[Scanning social media...]",
    "[Checking face matches...]",
  ];
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden flex flex-col"
      style={{ background: "rgba(15,23,42,1)", border: "1px solid rgba(30,64,175,0.7)" }}
    >
      <div
        className="h-7 flex items-center gap-2 px-3"
        style={{
          background: "rgba(15,23,42,0.9)",
          borderBottom: "1px solid rgba(30,64,175,0.8)",
        }}
      >
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span
          className="text-[11px] text-slate-400"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          shield@safezy — internet-scan
        </span>
      </div>
      <div
        className="flex-1 px-3 py-2 text-[11px] leading-relaxed overflow-hidden"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#e5e7eb" }}
      >
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: active ? i * 0.2 : 0 }}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
        {active && (
          <motion.div
            className="mt-1 inline-block w-2 h-3 bg-emerald-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}

function ProgressFooter({ active }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[11px] text-slate-400"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          Scanning 847 platforms across 43 countries
        </span>
        <span
          className="text-[11px] text-slate-300"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          Scan in progress: {active ? "00:23" : "00:00"}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,#FF6B9D,#7B2FFF)",
            boxShadow: "0 0 12px rgba(251,113,133,0.8)",
          }}
          animate={active ? { width: ["5%", "100%"] } : { width: "0%" }}
          transition={{ duration: 3, repeat: active ? Infinity : 0, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

