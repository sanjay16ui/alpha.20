import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeFile } from "../utils/api.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileVideo,
  Image as ImageIcon,
  AudioWaveform,
  Eye,
  Radio,
  Database,
  Heart,
  Cpu,
  Zap,
  ScanEye,
  Waves,
  Clock,
  Check,
} from "lucide-react";

const COLORS = {
  void: "#03030A",
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#F8FAFF",
  gray: "#64748B",
};

const DURATION_MS = 15000;
const CIRCUMFERENCE_340 = 2 * Math.PI * 170; // ~1068

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const fileKind = (file) => {
  if (!file) return "unknown";
  const t = (file.type || "").toLowerCase();
  const n = (file.name || "").toLowerCase();
  if (t.startsWith("video/") || n.endsWith(".mp4") || n.endsWith(".mov")) return "video";
  if (t.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(n)) return "image";
  if (t.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg)$/i.test(n)) return "audio";
  return "unknown";
};

const kindMeta = (kind) => {
  if (kind === "video") return { icon: FileVideo, color: COLORS.violet };
  if (kind === "image") return { icon: ImageIcon, color: COLORS.cyan };
  if (kind === "audio") return { icon: AudioWaveform, color: COLORS.green };
  return { icon: FileVideo, color: COLORS.gray };
};

const demoData = {
  trust_score: 23,
  verdict: "High Risk",
  flags: ["no_heartbeat", "synthetic_voice", "no_camera_signature"],
  explanation: "This media shows strong indicators of synthetic generation.",
  file_hash: "a3f9c2b8d4e167",
};

const ENGINE_NODES = [
  { id: "face", icon: Eye, label: "Face" },
  { id: "voice", icon: Radio, label: "Voice" },
  { id: "metadata", icon: Database, label: "Metadata" },
  { id: "blood", icon: Heart, label: "Blood Flow" },
  { id: "compression", icon: Cpu, label: "Compression" },
  { id: "lipsync", icon: Zap, label: "Lip Sync" },
  { id: "corneal", icon: ScanEye, label: "Corneal" },
  { id: "echo", icon: Waves, label: "Room Echo" },
  { id: "blink", icon: Clock, label: "Blink Rate" },
];

const getTerminalLines = (fileName, fileSize) => [
  { t: 0.1, text: "Initializing SAFEZY forensic engine v1.0", type: "normal" },
  { t: 0.3, text: `File received: ${fileName || "file"} (${fileSize || "—"})`, type: "normal" },
  { t: 0.4, text: "SHA-256: a3f9c2b8d4e167... computed", type: "normal" },
  { t: 0.8, text: "Loading detection models...", type: "normal" },
  { t: 1.0, text: "✓ Metadata forensics engine ready", type: "success" },
  { t: 1.4, text: "Extracting EXIF data from file...", type: "normal" },
  { t: 1.7, text: "WARNING: No camera device signature found", type: "warning" },
  { t: 2.1, text: "WARNING: Missing GPS metadata", type: "warning" },
  { t: 2.8, text: "✓ Face detection engine initialized", type: "success" },
  { t: 3.2, text: "Detected: 1 face, 47 landmark points", type: "normal" },
  { t: 4.0, text: "Running blink pattern analysis...", type: "normal" },
  { t: 4.8, text: "WARNING: Irregular blink timing detected", type: "warning" },
  { t: 5.5, text: "Initiating rPPG blood flow analysis...", type: "normal" },
  { t: 7.2, text: "WARNING: No cardiovascular signal present", type: "warning" },
  { t: 9.0, text: "Analyzing voice frequency spectrum...", type: "normal" },
  { t: 11.3, text: "WARNING: Frequency gaps at 4,200-7,800Hz", type: "warning" },
  { t: 13.1, text: "Computing corneal reflection geometry...", type: "normal" },
  { t: 14.0, text: "WARNING: Light source mismatch detected", type: "warning" },
  { t: 14.4, text: "Calculating weighted trust score...", type: "normal" },
  { t: 14.8, text: "Analysis complete. Trust Score: 23%", type: "success" },
  { t: 15.0, text: "HIGH RISK — Generating forensic report...", type: "normal" },
];

function useProgress(elapsed) {
  return Math.min(100, (elapsed / DURATION_MS) * 100);
}

function useEngineStates(elapsed) {
  const states = ENGINE_NODES.map((_, i) => {
    const startMs = i * 1500;
    if (elapsed < startMs) return "queued";
    if (elapsed < startMs + 1200) return "running";
    return "complete";
  });
  return states;
}

function useTerminalLines(elapsed, fileName, fileSize) {
  const lines = useMemo(
    () => getTerminalLines(fileName, fileSize),
    [fileName, fileSize]
  );
  const elapsedSec = elapsed / 1000;
  return lines.filter((l) => l.t <= elapsedSec);
}

export default function ScanningPage({ file, onComplete, demoMode = false }) {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("scanning"); // scanning | completing
  const [result, setResult] = useState(null);
  const startRef = useRef(Date.now());
  const rafRef = useRef(null);
  const meta = kindMeta(fileKind(file));
  const FileIcon = meta.icon;

  useEffect(() => {
    let cancelled = false;
    analyzeFile(file, demoMode).then((d) => {
      if (!cancelled && d) setResult(d);
    });
    return () => { cancelled = true; };
  }, [file, demoMode]);

  useEffect(() => {
    const tick = () => {
      const e = Date.now() - startRef.current;
      setElapsed(e);
      if (e >= DURATION_MS && phase === "scanning") {
        setPhase("completing");
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "completing") return;
    const t = setTimeout(() => {
      onComplete?.(result || demoData);
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, result, onComplete]);

  const progress = useProgress(elapsed);
  const engineStates = useEngineStates(elapsed);
  const terminalLines = useTerminalLines(elapsed, file?.name, formatBytes(file?.size));
  const completionElapsed = phase === "completing" ? elapsed - DURATION_MS : 0;
  const showCompleteText = completionElapsed >= 800;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .scan-ring-2 { animation: scan-rotate-cw 30s linear infinite; transform-origin: center; }
        .scan-ring-3 { animation: scan-rotate-ccw 20s linear infinite; transform-origin: center; }
        .scan-dot { animation: scan-dot-orbit 4s linear infinite; transform-origin: 250px 250px; }
        .scan-dot-1 { animation-delay: 0s; }
        .scan-dot-2 { animation-delay: 1s; }
        .scan-dot-3 { animation-delay: 2s; }
        .scan-dot-4 { animation-delay: 3s; }
        @keyframes scan-rotate-cw { to { transform: rotate(360deg); } }
        @keyframes scan-rotate-ccw { to { transform: rotate(-360deg); } }
        @keyframes scan-dot-orbit { to { transform: rotate(360deg); } }
        .scan-center-scanline { animation: scan-line-v 2s linear infinite; }
        @keyframes scan-line-v {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(220px); }
        }
        .scan-node-spin { animation: scan-node-spin 1s linear infinite; }
        @keyframes scan-node-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="min-h-[calc(100vh-84px)] flex flex-col items-center justify-center py-8 px-4"
        style={{ background: COLORS.void }}
      >
        {/* File info strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full mb-10"
          style={{
            background: "rgba(12,12,26,0.8)",
            border: "1px solid rgba(0,229,255,0.15)",
          }}
        >
          <FileIcon size={16} style={{ color: meta.color }} />
          <span className="text-[13px] text-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {file?.name || "file"}
          </span>
          <span className="text-gray-500">·</span>
          <span className="text-[12px] text-gray-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {formatBytes(file?.size)}
          </span>
          <span className="text-gray-500">·</span>
          <span
            className="text-[12px] animate-pulse"
            style={{ fontFamily: "JetBrains Mono, monospace", color: COLORS.amber }}
          >
            ANALYZING...
          </span>
        </motion.div>

        {/* Central rings + nodes */}
        <div className="relative w-[500px] h-[500px] flex items-center justify-center mb-8">
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full absolute"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={COLORS.cyan} />
                <stop offset="100%" stopColor={COLORS.violet} />
              </linearGradient>
            </defs>

            {/* Ring 1 — 480px static */}
            <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Ring 2 — 440px dashed, clockwise */}
            <g className="scan-ring-2" style={{ transformOrigin: "250px 250px" }}>
              <circle
                cx="250"
                cy="250"
                r="220"
                fill="none"
                stroke="rgba(0,229,255,0.15)"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
            </g>

            {/* Ring 3 — 390px dashed, counter */}
            <g className="scan-ring-3" style={{ transformOrigin: "250px 250px" }}>
              <circle
                cx="250"
                cy="250"
                r="195"
                fill="none"
                stroke="rgba(139,92,246,0.2)"
                strokeWidth="1.5"
                strokeDasharray="20 10"
              />
            </g>

            {/* Ring 4 — progress ring */}
            <circle
              cx="250"
              cy="250"
              r="170"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="250"
              cy="250"
              r="170"
              fill="none"
              stroke="url(#scanGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE_340}
              strokeDashoffset={CIRCUMFERENCE_340 - (progress / 100) * CIRCUMFERENCE_340}
              transform="rotate(-90 250 250)"
              style={{
                filter: "drop-shadow(0 0 8px #00E5FF)",
                transition: "stroke-dashoffset 0.15s linear",
              }}
            />
            {/* Bright dot at progress end — approximate position */}
            {progress > 0 && progress < 100 && (
              <g transform={`rotate(${-90 + (progress / 100) * 360} 250 250)`}>
                <circle
                  cx="250"
                  cy="80"
                  r="4"
                  fill={COLORS.cyan}
                  style={{ filter: "drop-shadow(0 0 8px #00E5FF)" }}
                />
              </g>
            )}

            {/* Ring 5 — 280px, 4 orbiting dots */}
            <circle
              cx="250"
              cy="250"
              r="140"
              fill="none"
              stroke="rgba(0,229,255,0.08)"
              strokeWidth="1"
            />
            {[0, 1, 2, 3].map((i) => (
              <g key={i} className={`scan-dot scan-dot-${i + 1}`}>
                <circle cx="250" cy="110" r="6" fill={COLORS.cyan} />
              </g>
            ))}
          </svg>

          {/* 9 orbital nodes */}
          {ENGINE_NODES.map((node, i) => {
            const angle = (i * 40 - 90) * (Math.PI / 180);
            const cx = 250 + 170 * Math.cos(angle);
            const cy = 250 + 170 * Math.sin(angle);
            const state = engineStates[i];
            const Icon = node.icon;

            return (
              <motion.div
                key={node.id}
                className="absolute w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  left: cx - 18,
                  top: cy - 18,
                  background:
                    state === "complete"
                      ? "rgba(16,185,129,0.1)"
                      : state === "running"
                        ? "rgba(0,229,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                  border:
                    state === "complete"
                      ? "1px solid rgba(16,185,129,0.4)"
                      : state === "running"
                        ? "1px solid rgba(0,229,255,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: state === "running" ? "0 0 20px rgba(0,229,255,0.15)" : "none",
                }}
                initial={false}
                animate={
                  completionElapsed >= 0 && completionElapsed < 500
                    ? { scale: [1, 1.15, 1], boxShadow: "0 0 24px rgba(16,185,129,0.4)" }
                    : state === "complete"
                      ? { scale: 1 }
                      : {}
                }
                transition={
                  completionElapsed >= 0
                    ? { duration: 0.4, ease: "easeOut" }
                    : state === "complete"
                      ? { duration: 0.3, ease: "backOut" }
                      : {}
                }
              >
                {state === "complete" ? (
                  <Check size={18} style={{ color: COLORS.green }} />
                ) : state === "running" ? (
                  <>
                    <div
                      className="absolute inset-0 rounded-full scan-node-spin border-2 border-transparent"
                      style={{ borderTopColor: COLORS.cyan }}
                    />
                    <Icon size={14} style={{ color: COLORS.cyan, position: "relative", zIndex: 1 }} />
                  </>
                ) : (
                  <Icon size={14} style={{ color: COLORS.gray }} />
                )}
                <span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px]"
                  style={{ color: COLORS.gray, fontFamily: "Inter" }}
                >
                  {node.label}
                </span>
              </motion.div>
            );
          })}

          {/* Center circle 220px */}
          <motion.div
            className="absolute w-[220px] h-[220px] rounded-full overflow-hidden"
            style={{
              background: "rgba(12,12,26,0.9)",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
            animate={
              completionElapsed >= 600
                ? { scale: [1, 1.08, 1], boxShadow: ["none", "0 0 40px rgba(0,229,255,0.3)", "none"] }
                : {}
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {file && fileKind(file) === "image" ? (
              <CenterImagePreview file={file} />
            ) : (
              <NeuralPattern />
            )}
          </motion.div>
        </div>

        {/* Live terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[600px] h-[180px] rounded-xl overflow-hidden mb-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(0,229,255,0.1)",
          }}
        >
          <div
            className="h-8 flex items-center gap-3 px-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-[11px] text-gray-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              safezy@localhost — forensic-scan
            </span>
          </div>
          <div
            className="h-[140px] overflow-hidden p-3 px-4 flex flex-col justify-end"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.8 }}
          >
            {terminalLines.slice(-7).map((line, i) => (
              <TerminalLine key={`${line.t}-${line.text}`} line={line} elapsed={elapsed} />
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-[600px] mb-2"
        >
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-gray-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              FORENSIC ANALYSIS
            </span>
            <span className="text-[11px] tabular-nums" style={{ fontFamily: "JetBrains Mono, monospace", color: COLORS.cyan }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00E5FF, #8B5CF6)",
                boxShadow: "0 0 12px rgba(0,229,255,0.4)",
                filter: "blur(0px)",
              }}
              animate={
                completionElapsed >= 300 && completionElapsed < 700
                  ? { opacity: [1, 0.3, 1] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Analysis complete text */}
        <AnimatePresence>
          {showCompleteText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-2xl font-bold"
              style={{ fontFamily: "Space Grotesk", color: COLORS.cyan }}
            >
              ANALYSIS COMPLETE
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function TerminalLine({ line, elapsed }) {
  const elapsedSec = elapsed / 1000;
  const visibleAt = line.t;
  const delay = Math.max(0, elapsedSec - visibleAt);
  const chars = line.text.length;
  const msPerChar = 30;
  const shownChars = Math.min(chars, Math.floor((delay * 1000) / msPerChar));
  const displayed = line.text.slice(0, shownChars);
  const isLast = line.t >= 14.8;

  const color =
    line.type === "success"
      ? COLORS.green
      : line.type === "warning"
        ? COLORS.amber
        : line.type === "error"
          ? COLORS.red
          : "rgba(255,255,255,0.7)";

  const timestamp = `[00:${String(Math.floor(line.t)).padStart(2, "0")}.${String(Math.round((line.t % 1) * 10)).padStart(1, "0")}]`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <span style={{ color: "rgba(0,229,255,0.5)", flexShrink: 0 }}>{timestamp}</span>
      <span style={{ color: isLast ? COLORS.cyan : color }}>{displayed}</span>
    </motion.div>
  );
}

function CenterImagePreview({ file }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return <NeuralPattern />;
  return (
    <>
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        style={{ filter: "saturate(0.7)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none scan-center-scanline"
        style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent)",
        }}
      />
    </>
  );
}

function NeuralPattern() {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      arr.push({ x: 110 + 90 * Math.cos(a), y: 110 + 90 * Math.sin(a) });
    }
    return arr;
  }, []);

  return (
    <svg className="w-full h-full" viewBox="0 0 220 220">
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          {pts.slice(i + 1).map((q, j) => (
            <line
              key={`${i}-${j}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={COLORS.cyan}
              strokeWidth="0.5"
              opacity="0.12"
            />
          ))}
        </React.Fragment>
      ))}
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill={COLORS.cyan}
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 1.8, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
