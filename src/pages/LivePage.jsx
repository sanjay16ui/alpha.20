import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useSafezyStore } from "../store/safezyStore.jsx";
import { PlayCircle, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const COLORS = {
  surface: "#0C0C1A",
  border: "rgba(255,255,255,0.06)",
  cyan: "#00E5FF",
  red: "#EF4444",
  green: "#10B981",
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function timeAgo(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function LivePage() {
  const { state } = useSafezyStore();
  const { liveQueue, analyses } = state;

  const feedItems = useMemo(
    () => [...analyses].slice().reverse(),
    [analyses],
  );

  const sessionStats = useMemo(() => {
    const total = analyses.length;
    const fakes = analyses.filter((a) => a.verdict === "High Risk").length;
    const real = analyses.filter((a) => a.verdict === "Verified").length;
    const first = analyses[0]?.timestamp ? new Date(analyses[0].timestamp) : null;
    const sessionDuration =
      first != null
        ? Math.max(0, Math.round((Date.now() - first.getTime()) / 1000))
        : 0;
    return { total, fakes, real, sessionDuration };
  }, [analyses]);

  const barData = [
    { name: "High Risk", value: sessionStats.fakes },
    { name: "Verified", value: sessionStats.real },
  ];

  if (!analyses.length && !liveQueue.length) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-[calc(100vh-84px)] flex items-center justify-center"
      >
        <div
          className="rounded-2xl p-10 text-center max-w-md"
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <div className="mb-4 flex justify-center">
            <div
              className="w-16 h-16 rounded-full border border-cyan-500/40 flex items-center justify-center"
              style={{
                boxShadow: "0 0 40px rgba(8,47,73,0.9)",
              }}
            >
              <div className="w-10 h-10 rounded-full border border-cyan-500/60 animate-pulse" />
            </div>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "Space Grotesk", color: "white" }}
          >
            SAFEZY is monitoring...
          </h2>
          <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: "Inter" }}>
            Upload a file to begin live analysis and see activity here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      {/* Active queue */}
      <section
        className="rounded-2xl p-5"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs uppercase tracking-[0.18em] text-gray-400"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            ACTIVE QUEUE
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span
              className={`w-2 h-2 rounded-full ${
                liveQueue.length ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {liveQueue.length ? `${liveQueue.length} running` : "IDLE — No active analyses"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {liveQueue.map((q) => (
            <div
              key={q.id}
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{
                background: "rgba(15,23,42,0.96)",
                border: "1px solid rgba(148,163,184,0.5)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlayCircle className="text-cyan-400 animate-spin-slow" size={18} />
                  <span
                    className="text-sm text-slate-100"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {q.filename}
                  </span>
                </div>
                <span
                  className="text-xs text-amber-300"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  ANALYZING...
                </span>
              </div>
              <div
                className="text-[11px] text-slate-400"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                Started: {q.started_at}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(56,189,248,1), rgba(129,140,248,1))",
                    width: `${q.progress ?? 10}%`,
                  }}
                  animate={{ width: ["10%", "90%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Activity size={12} />
                <span>Running multi-engine forensic analysis...</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live feed */}
      <section
        className="rounded-2xl p-5"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          LIVE ACTIVITY FEED
        </div>
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {feedItems.map((a) => {
            const isHigh = a.verdict === "High Risk";
            return (
              <div
                key={a.id}
                className="rounded-xl p-3 flex gap-3"
                style={{
                  background: "rgba(15,23,42,0.96)",
                  borderLeft: `4px solid ${isHigh ? COLORS.red : COLORS.green}`,
                  borderTop: `1px solid rgba(148,163,184,0.5)`,
                  borderRight: `1px solid rgba(148,163,184,0.5)`,
                  borderBottom: `1px solid rgba(148,163,184,0.5)`,
                }}
              >
                <div className="flex flex-col justify-between">
                  <span
                    className="text-[11px] text-slate-400"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    ● {timeAgo(a.timestamp)}
                  </span>
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm text-slate-100"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {a.filename} analyzed
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Result:{" "}
                    <span style={{ color: isHigh ? COLORS.red : COLORS.green }}>
                      {a.verdict} ({a.trust_score ?? 0}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Critical signals flagged:{" "}
                    {Object.values(a.engine_scores || {}).filter((v) => Number(v) < 40).length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Session stats */}
      <section
        className="rounded-2xl p-5"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="Files analyzed this session" value={sessionStats.total} />
          <Stat label="Fakes caught" value={sessionStats.fakes} />
          <Stat label="Real verified" value={sessionStats.real} />
          <Stat
            label="Session duration"
            value={`${Math.floor(sessionStats.sessionDuration / 60)}m`}
          />
        </div>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" allowDecimals={false} />
              <Bar dataKey="value">
                <Cell key="fake" fill={COLORS.red} />
                <Cell key="real" fill={COLORS.green} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "rgba(15,23,42,0.96)", border: `1px solid ${COLORS.border}` }}
    >
      <div
        className="text-[11px] text-slate-400 mb-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-bold text-slate-50"
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
      >
        {value}
      </div>
    </div>
  );
}

