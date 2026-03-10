import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const PLATFORM_AXES = [
  "Google",
  "Social Media",
  "Deep Web",
  "Adult Platforms",
  "News Media",
  "Chat Apps",
];

export default function ShieldScanGraphs({ elapsed, total }) {
  const progress = Math.min(1, Math.max(0, elapsed / total));

  const radarData = useMemo(() => {
    const coverage = PLATFORM_AXES.map((name, idx) => {
      const phase = (idx + 1) / PLATFORM_AXES.length;
      const v = Math.max(0, Math.min(1, (progress - phase * 0.2) / 0.8));
      return { subject: name, coverage: Math.round(v * 100) };
    });
    return coverage;
  }, [progress]);

  const timelineData = useMemo(() => {
    const points = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = (total / steps) * i;
      let base = Math.max(0, Math.min(1, t / total)) * 80;
      if (t > total * 0.5) {
        base += 10 * Math.random();
      }
      if (t > total * 0.65) {
        base += 10;
      }
      points.push({
        t: Math.round(t),
        confidence: Math.min(100, Number(base.toFixed(1))),
      });
    }
    return points;
  }, [total]);

  const barData = useMemo(
    () => [
      { name: "Google Images", value: 2847 },
      { name: "Social Media", value: 1923 },
      { name: "Deep Web", value: 1241 },
      { name: "Adult Platforms", value: 847 },
      { name: "News Sites", value: 1102 },
      { name: "Chat Apps", value: 934 },
    ],
    [],
  );

  const activeCount = Math.floor(barData.length * progress);

  return (
    <div className="safezy-card p-4 space-y-4">
      <StatusTicker elapsed={elapsed} />
      <div style={{ width: "100%", height: 160 }}>
        <SectionHeader label="PLATFORM COVERAGE" />
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(148,163,184,0.4)" />
            <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 9 }} />
            <Radar
              name="Coverage"
              dataKey="coverage"
              stroke="#FF6B9D"
              fill="#FF6B9D"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: "100%", height: 140 }}>
        <SectionHeader label="FACE MATCH CONFIDENCE" />
        <ResponsiveContainer>
          <LineChart data={timelineData}>
            <XAxis dataKey="t" stroke="#64748B" tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #1f2937",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#FF6B9D"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: "100%", height: 170 }}>
        <SectionHeader label="PLATFORM BREAKDOWN" />
        <ResponsiveContainer>
          <BarChart data={barData} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" stroke="#64748B" tick={{ fontSize: 9 }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748B"
              tick={{ fontSize: 9 }}
              width={80}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} minPointSize={2}>
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill="url(#shieldBarGradient)"
                  opacity={index < activeCount ? 1 : 0.2}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="shieldBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6B9D" />
                <stop offset="50%" stopColor="#7B2FFF" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <TimelineBar elapsed={elapsed} total={total} />
    </div>
  );
}

function StatusTicker({ elapsed }) {
  const messages = [
    "Scanning Google Images...",
    "2,847 pages indexed...",
    "Checking Social Media platforms...",
    "Cross-referencing face vector...",
    "MATCH DETECTED — confidence 87%",
    "Scanning deep web sources...",
  ];
  const index = Math.min(messages.length - 1, Math.floor((elapsed / 45) * messages.length));
  const now = new Date();
  const ts = now.toTimeString().slice(0, 8);
  const msg = messages[index];
  const isMatch = msg.includes("MATCH DETECTED");
  return (
    <div
      className="rounded-lg px-3 py-2 mb-1"
      style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.5)" }}
    >
      <span
        className="text-[11px]"
        style={{
          fontFamily: "JetBrains Mono, monospace",
          color: isMatch ? "#FF2D55" : "#E5E7EB",
        }}
      >
        [{ts}] {msg}
      </span>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, rgba(248,113,133,0.4), transparent)" }}
      />
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-rose-200"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: "linear-gradient(to left, rgba(248,113,133,0.4), transparent)" }}
      />
    </div>
  );
}

function TimelineBar({ elapsed, total }) {
  const progress = Math.min(1, Math.max(0, elapsed / total));
  const phases = [
    { id: "face", label: "Face Extract", span: 0.15 },
    { id: "google", label: "Google", span: 0.2 },
    { id: "social", label: "Social", span: 0.2 },
    { id: "deep", label: "DeepWeb", span: 0.15 },
    { id: "analysis", label: "Analysis", span: 0.15 },
    { id: "report", label: "Report", span: 0.15 },
  ];
  let acc = 0;
  const segments = phases.map((p) => {
    const start = acc;
    const end = acc + p.span;
    acc = end;
    const active = progress >= start && progress <= end;
    return { ...p, start, end, active };
  });
  return (
    <div className="mt-2">
      <div
        className="w-full h-1.5 rounded-full overflow-hidden bg-slate-900"
        style={{ border: "1px solid rgba(148,163,184,0.5)" }}
      >
        <div className="flex w-full h-full">
          {segments.map((s) => (
            <div
              key={s.id}
              className="h-full"
              style={{
                width: `${s.span * 100}%`,
                background: s.active
                  ? "linear-gradient(90deg,#FF6B9D,#7B2FFF)"
                  : "rgba(30,64,175,0.7)",
                boxShadow: s.active ? "0 0 12px rgba(248,113,133,0.8)" : "none",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1">
        {segments.map((s) => (
          <span
            key={s.id}
            className="text-[9px] text-slate-400"
            style={{ fontFamily: "JetBrains Mono" }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

