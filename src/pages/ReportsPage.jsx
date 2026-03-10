import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { FileText, PlayCircle, Image as ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSafezyStore } from "../store/safezyStore.jsx";

const COLORS = {
  bg: "#03030A",
  surface: "#0C0C1A",
  border: "rgba(255,255,255,0.06)",
  cyan: "#00E5FF",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
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

function getFileIcon(type) {
  if (type === "video") return PlayCircle;
  if (type === "image") return ImageIcon;
  return FileText;
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function ReportsPage() {
  const { state } = useSafezyStore();
  const { analyses } = state;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let list = analyses;
    if (filter === "high") list = list.filter((a) => a.verdict === "High Risk");
    if (filter === "verified") list = list.filter((a) => a.verdict === "Verified");
    if (filter === "video") list = list.filter((a) => a.file_type === "video");
    if (filter === "image") list = list.filter((a) => a.file_type === "image");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => (a.filename || "").toLowerCase().includes(q));
    }
    return list;
  }, [analyses, filter, search]);

  const stats = useMemo(() => {
    const total = analyses.length;
    const fakes = analyses.filter((a) => a.verdict === "High Risk").length;
    const real = analyses.filter((a) => a.verdict === "Verified").length;
    const avg =
      total === 0
        ? 0
        : analyses.reduce((sum, a) => sum + (a.trust_score || 0), 0) / total;
    return { total, fakes, real, avg: Number(avg.toFixed(1)) };
  }, [analyses]);

  const lineData = analyses.map((a, idx) => ({
    index: idx + 1,
    score: a.trust_score ?? 0,
    verdict: a.verdict,
    filename: a.filename,
    timestamp: a.timestamp,
  }));

  const pieData = [
    { name: "High Risk", value: stats.fakes, color: COLORS.red },
    { name: "Verified", value: stats.real, color: COLORS.green },
  ];

  const engineAverages = useMemo(() => {
    if (!analyses.length) return [];
    const agg = {};
    analyses.forEach((a) => {
      const es = a.engine_scores || {};
      Object.entries(es).forEach(([k, v]) => {
        if (!agg[k]) agg[k] = { key: k, total: 0, count: 0 };
        agg[k].total += Number(v || 0);
        agg[k].count += 1;
      });
    });
    return Object.values(agg).map((e) => ({
      name: e.key.replace(/_/g, " "),
      score: Number((e.total / e.count).toFixed(1)),
    }));
  }, [analyses]);

  if (!analyses.length) {
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
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(15,23,42,0.9)" }}
            >
              <AlertTriangle size={26} className="text-slate-400" />
            </div>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "Space Grotesk", color: "white" }}
          >
            No analyses yet
          </h2>
          <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: "Inter" }}>
            Run your first analysis to see full forensic reports here.
          </p>
          {/* Navigation button handled by parent via sidebar */}
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
      className="space-y-6"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Analyses" value={stats.total} color={COLORS.cyan} />
        <StatCard label="Fakes Detected" value={stats.fakes} color={COLORS.red} />
        <StatCard label="Verified Real" value={stats.real} color={COLORS.green} />
        <StatCard label="Average Score" value={`${stats.avg}%`} color={COLORS.cyan} />
      </div>

      {/* Trend graph */}
      <div
        className="rounded-2xl p-5"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          TRUST SCORE TREND
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <XAxis dataKey="index" stroke="#64748B" />
              <YAxis domain={[0, 100]} stroke="#64748B" />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #1f2937" }}
                labelFormatter={(i) => `Analysis #${i}`}
                formatter={(value, name, props) => [
                  value,
                  name === "score"
                    ? `${props.payload.filename} — ${props.payload.verdict}`
                    : name,
                ]}
              />
              <ReferenceLine
                y={70}
                stroke={COLORS.cyan}
                strokeDasharray="4 4"
                label={{
                  value: "SAFE THRESHOLD",
                  position: "insideTopRight",
                  fill: COLORS.cyan,
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={COLORS.cyan}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => {
                  const color =
                    props.payload.verdict === "High Risk" ? COLORS.red : COLORS.green;
                  return <circle {...props} r={5} fill={color} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut + engine bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <div
            className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            FAKE VS REAL
          </div>
          <div className="flex items-center">
            <div style={{ width: "60%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div
                className="text-xs uppercase tracking-[0.18em] text-gray-400"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                FAKE RATE
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ fontFamily: "Space Grotesk", color: "white" }}
              >
                {stats.total ? Math.round((stats.fakes / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <div
            className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            ENGINE PERFORMANCE OVERVIEW
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={engineAverages}>
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #1f2937" }}
                />
                <Legend />
                <Bar
                  dataKey="score"
                  name="Avg Score"
                  radius={[4, 4, 0, 0]}
                  minPointSize={2}
                >
                  {engineAverages.map((entry, index) => {
                    const v = entry.score;
                    const color = v < 40 ? COLORS.red : v < 70 ? COLORS.amber : COLORS.green;
                    return <Cell key={`bar-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters and list */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["high", "High Risk"],
              ["verified", "Verified"],
              ["video", "Video"],
              ["image", "Image"],
            ].map(([val, label]) => {
              const active = filter === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFilter(val)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    background: active ? "rgba(0,229,255,0.12)" : "transparent",
                    border: active ? `1px solid ${COLORS.cyan}` : "1px solid rgba(148,163,184,0.4)",
                    color: active ? COLORS.cyan : "#e5e7eb",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="px-3 py-2 rounded-lg text-xs bg-slate-950 border border-slate-700 text-slate-100 outline-none"
            style={{ fontFamily: "Inter, sans-serif", minWidth: 200 }}
          />
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {filtered.map((a) => {
            const Icon = getFileIcon(a.file_type);
            const isHigh = a.verdict === "High Risk";
            const engines = a.engine_scores || {};
            const flagged = Object.entries(engines)
              .filter(([, v]) => Number(v) < 40)
              .map(([k]) => k.replace(/_/g, " "));
            return (
              <div
                key={a.id}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(15,23,42,0.95)",
                  border: `1px solid rgba(148,163,184,0.4)`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(15,23,42,1)" }}
                    >
                      <Icon
                        size={18}
                        style={{ color: isHigh ? COLORS.red : COLORS.green }}
                      />
                    </div>
                    <div>
                      <div
                        className="text-sm text-white truncate max-w-[180px]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                        title={a.filename}
                      >
                        {a.filename}
                      </div>
                      <div
                        className="text-[11px] text-gray-400"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        ID: {a.id} · {timeAgo(a.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="px-2 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        background: isHigh
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(16,185,129,0.15)",
                        color: isHigh ? COLORS.red : COLORS.green,
                      }}
                    >
                      {a.verdict}
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: isHigh ? COLORS.red : COLORS.green,
                      }}
                    >
                      {a.trust_score ?? 0}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === a.id ? null : a.id))}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-600 text-slate-200"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      View
                    </button>
                  </div>
                </div>
                {flagged.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {flagged.slice(0, 4).map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          background: "rgba(239,68,68,0.1)",
                          color: COLORS.red,
                          border: "1px solid rgba(239,68,68,0.4)",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {expandedId === a.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 border-t border-slate-700 pt-3 grid md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1">
                        {Object.entries(engines).map(([k, v]) => {
                          const val = Number(v || 0);
                          const color =
                            val < 40 ? COLORS.red : val < 70 ? COLORS.amber : COLORS.green;
                          return (
                            <div key={k}>
                              <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                                <span>{k.replace(/_/g, " ")}</span>
                                <span>{val}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: color, width: `${val}%` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-2 text-xs text-slate-300">
                        <div
                          className="max-h-32 overflow-y-auto border border-slate-800 rounded-lg p-2"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {(a.forensic_timeline || []).slice(0, 40).map((e, idx) => (
                            <div key={idx}>
                              [{(e.timestamp_ms / 1000).toFixed(1)}s] {e.type}: {e.message}
                            </div>
                          ))}
                        </div>
                        <div
                          className="max-h-24 overflow-y-auto border border-slate-800 rounded-lg p-2"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {a.explanation}
                        </div>
                        {a.tool_attribution?.likely_tool && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-300">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            Suspected tool: {a.tool_attribution.likely_tool} (
                            {Math.round((a.tool_attribution.confidence || 0) * 100) / 100})
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: `0 18px 40px rgba(0,0,0,0.6)`,
      }}
    >
      <div
        className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-1"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        {label}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold"
        style={{ fontFamily: "Space Grotesk, sans-serif", color: color }}
      >
        {value}
      </motion.div>
    </div>
  );
}

