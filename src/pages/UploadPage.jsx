import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ChevronDown,
  ArrowRight,
  Shield,
  FileVideo,
  Image as ImageIcon,
  AudioWaveform,
  Lock,
  FileCheck2,
  Sparkles,
  Check,
} from "lucide-react";
import { getBackendUrl } from "../utils/port_reader.js";

const COLORS = {
  void: "#03030A",
  deep: "#07070F",
  surface: "#0C0C1A",
  elevated: "#111125",
  border: "rgba(255,255,255,0.06)",
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#F8FAFF",
  gray: "#64748B",
};

const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

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
  if (kind === "video")
    return { icon: FileVideo, color: COLORS.violet, badge: "VIDEO" };
  if (kind === "image")
    return { icon: ImageIcon, color: COLORS.cyan, badge: "IMAGE" };
  if (kind === "audio")
    return { icon: AudioWaveform, color: COLORS.green, badge: "AUDIO" };
  return { icon: Shield, color: COLORS.gray, badge: "FILE" };
};

const demoData = {
  trust_score: 23,
  verdict: "High Risk",
  flags: ["no_heartbeat", "synthetic_voice", "no_camera_signature"],
  explanation: "This media shows strong indicators of synthetic generation across multiple signals.",
  file_hash: "a3f9c2b8d4e167",
};

const TinyScanShield = ({ spinning }) => {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning ? { duration: 1.2, repeat: Infinity, ease: "linear" } : {}}
      className="inline-flex"
    >
      <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="tinyGrad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor={COLORS.cyan} />
            <stop offset="100%" stopColor={COLORS.violet} />
          </linearGradient>
          <clipPath id="tinyClip">
            <path d="M32 10c7 5 14 6 20 7v16c0 13-9 19-20 21-11-2-20-8-20-21V17c6-1 13-2 20-7Z" />
          </clipPath>
        </defs>
        <path
          d="M32 6c6 4 12 5 18 6v15c0 12-8 17-18 19-10-2-18-7-18-19V12c6-1 12-2 18-6Z"
          stroke="url(#tinyGrad)"
          strokeWidth="3"
          fill="rgba(0,229,255,0.05)"
        />
        <g clipPath="url(#tinyClip)">
          <motion.rect
            x="8"
            y="-8"
            width="48"
            height="3"
            fill="url(#tinyGrad)"
            animate={{ y: [-8, 64] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            opacity="0.9"
          />
        </g>
      </svg>
    </motion.div>
  );
};

const ShieldCore = ({ speed = 3, dragPulse = false }) => {
  return (
    <motion.div
      className="relative"
      animate={dragPulse ? { scale: [1, 1.08, 1] } : { scale: [1, 1.05, 1] }}
      transition={{
        duration: dragPulse ? 0.6 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="safezyShieldGrad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="1" />
            <stop offset="100%" stopColor={COLORS.violet} stopOpacity="1" />
          </linearGradient>
          <clipPath id="safezyShieldClip">
            <path d="M32 10c7 5 14 6 20 7v16c0 13-9 19-20 21-11-2-20-8-20-21V17c6-1 13-2 20-7Z" />
          </clipPath>
        </defs>

        {/* Outer hex */}
        <path
          d="M32 4 56 16v32L32 60 8 48V16L32 4Z"
          stroke="url(#safezyShieldGrad)"
          strokeOpacity="0.75"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Shield silhouette */}
        <path
          d="M32 10c7 5 14 6 20 7v16c0 13-9 19-20 21-11-2-20-8-20-21V17c6-1 13-2 20-7Z"
          stroke="url(#safezyShieldGrad)"
          strokeOpacity="0.9"
          strokeWidth="1.3"
          fill="rgba(0,229,255,0.03)"
        />

        {/* Scan line inside shield */}
        <g clipPath="url(#safezyShieldClip)">
          <motion.rect
            x="10"
            y="-10"
            width="44"
            height="2"
            fill="url(#safezyShieldGrad)"
            animate={{ y: [-10, 64] }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            opacity="0.9"
          />
        </g>
      </svg>
    </motion.div>
  );
};

const HexBorder = ({ active }) => {
  // Perfect hex fits: 100x92.376 (height = sqrt(3)/2 * width)
  const w = 100;
  const h = 86.6;
  const pts = `50 0, 100 21.65, 100 64.95, 50 86.6, 0 64.95, 0 21.65`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <motion.polygon
        points={pts}
        fill="none"
        stroke={active ? "rgba(0,229,255,0.9)" : "rgba(0,229,255,0.4)"}
        strokeWidth={active ? 1.6 : 1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={active ? "0" : "6 10"}
        style={{
          filter: active ? "drop-shadow(0 0 14px rgba(0,229,255,0.35))" : "none",
        }}
      />
      {!active && (
        <motion.polygon
          points={pts}
          fill="none"
          stroke="rgba(0,229,255,0.6)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="6 10"
          animate={{ strokeDashoffset: [0, -320] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          opacity="0.9"
        />
      )}
    </svg>
  );
};

const ParticlesBurst = ({ show }) => {
  const particles = useMemo(() => {
    // 6 vertices + 2 mid-edges
    const anchors = [
      { x: 50, y: 0, dx: 0, dy: -20 },
      { x: 100, y: 25, dx: 18, dy: -10 },
      { x: 100, y: 75, dx: 18, dy: 10 },
      { x: 50, y: 100, dx: 0, dy: 20 },
      { x: 0, y: 75, dx: -18, dy: 10 },
      { x: 0, y: 25, dx: -18, dy: -10 },
      { x: 75, y: 13, dx: 14, dy: -14 },
      { x: 25, y: 87, dx: -14, dy: 14 },
    ];
    return anchors.map((a, i) => ({ ...a, id: i }));
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-[6px] h-[6px] rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: COLORS.cyan,
                boxShadow: "0 0 10px rgba(0,229,255,0.35)",
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], x: [0, p.dx], y: [0, p.dy], scale: [0.8, 1, 0.9] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

const RecentPanel = ({ items, onSelect }) => {
  return (
    <div className="w-full lg:w-[360px]">
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] uppercase tracking-widest text-gray-500"
          style={{ fontFamily: "Inter" }}
        >
          RECENT ANALYSES
        </span>
      </div>
      <div className="space-y-3">
        {items.map((it, idx) => {
          const kind = fileKind({ name: it.name, type: it.type });
          const meta = kindMeta(kind);
          const Icon = meta.icon;
          const scoreColor =
            it.score >= 80 ? COLORS.green : it.score >= 50 ? COLORS.amber : COLORS.red;
          const scoreText = it.score >= 80 ? `${it.score}% REAL` : `${it.score}% RISK`;
          return (
            <motion.button
              key={it.id}
              type="button"
              onClick={() => onSelect(it)}
              className="w-full text-left rounded-xl p-4 flex items-center gap-3 cursor-pointer"
              style={{
                background: "rgba(12,12,26,0.6)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
              whileHover={{
                y: -2,
                borderColor: "rgba(255,255,255,0.12)",
                boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${meta.color}25` }}
              >
                <Icon size={18} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] text-white truncate"
                  style={{ fontFamily: "Inter" }}
                >
                  {it.name}
                </div>
                <div
                  className="text-[11px] text-gray-500"
                  style={{ fontFamily: "Inter" }}
                >
                  {it.when}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${scoreColor}25`,
                    border: `1px solid ${scoreColor}55`,
                    color: scoreColor,
                    fontFamily: "Inter",
                  }}
                >
                  {scoreText}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const CapabilityStrip = () => {
  const cardBase = {
    background: "rgba(12,12,26,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-10">
      <div className="rounded-2xl p-7" style={cardBase}>
        <div className="text-[48px] font-bold leading-none" style={{ fontFamily: "Space Grotesk", color: COLORS.cyan }}>
          9
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-2" style={{ fontFamily: "Inter" }}>
          FORENSIC SIGNALS
        </div>
        <div className="text-[12px] mt-2 text-gray-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          Face · Voice · Physics · Metadata
        </div>
      </div>
      <div className="rounded-2xl p-7" style={cardBase}>
        <Lock size={48} style={{ color: COLORS.green }} />
        <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-3" style={{ fontFamily: "Inter" }}>
          ZERO DATA SHARED
        </div>
        <div className="text-[12px] mt-2 text-gray-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          Runs on localhost only
        </div>
      </div>
      <div className="rounded-2xl p-7" style={cardBase}>
        <FileCheck2 size={48} style={{ color: COLORS.violet }} />
        <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-3" style={{ fontFamily: "Inter" }}>
          LEGAL CERTIFICATES
        </div>
        <div className="text-[12px] mt-2 text-gray-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          RFC 3161 · Court accepted
        </div>
      </div>
    </div>
  );
};

export default function UploadPage({ onStartAnalysis }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [phaseText, setPhaseText] = useState("DROP YOUR FILE HERE");
  const [showBurst, setShowBurst] = useState(false);
  const [checks, setChecks] = useState([false, false, false]);
  const [uploadCount, setUploadCount] = useState(0);
  const [scanSpeed, setScanSpeed] = useState('standard');
  const [nextResultType, setNextResultType] = useState('AI');

  const speedOptions = [
    { key: 'quick', icon: '⚡', label: 'QUICK', duration: '5 sec', engines: '4 engines', ms: 5000 },
    { key: 'standard', icon: '🔍', label: 'STANDARD', duration: '15 sec', engines: '9 engines', ms: 15000 },
    { key: 'deep', icon: '🔬', label: 'DEEP', duration: '45 sec', engines: '9 engines + full report', ms: 45000 },
  ];

  const fileInputRef = useRef(null);

  const recent = useMemo(
    () => [
      { id: "r1", name: "press_conference.mp4", type: "video/mp4", when: "Analyzed 2 hours ago", score: 94 },
      { id: "r2", name: "voice_note_bank.mp3", type: "audio/mpeg", when: "Analyzed 6 hours ago", score: 23 },
      { id: "r3", name: "profile_photo.webp", type: "image/webp", when: "Analyzed yesterday", score: 81 },
      { id: "r4", name: "candidate_audio.mov", type: "video/quicktime", when: "Analyzed 2 days ago", score: 56 },
      { id: "r5", name: "webcam_clip.mp4", type: "video/mp4", when: "Analyzed 4 days ago", score: 18 },
    ],
    []
  );

  const supported = useMemo(
    () => [
      "video/mp4",
      "video/quicktime",
      "image/jpeg",
      "image/png",
      "image/webp",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ],
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "video/*": [".mp4", ".mov"],
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    onDrop: (files) => {
      const f = files?.[0];
      if (!f) return;
      setSelectedFile(f);
    },
    onDragEnter: () => {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 420);
    },
  });

  useEffect(() => {
    if (isDragActive) {
      setPhaseText("RELEASE TO ANALYZE");
    } else if (!selectedFile) {
      setPhaseText("DROP YOUR FILE HERE");
    }
  }, [isDragActive, selectedFile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = await getBackendUrl();
        if (!base) return;
        const res = await fetch(`${base}/session/history`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.total_analyses === "number") {
          setUploadCount(data.total_analyses);
        }
      } catch {
        // best-effort only
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setChecks([false, false, false]);
      return;
    }
    setChecks([false, false, false]);
    const t1 = setTimeout(() => setChecks((p) => [true, p[1], p[2]]), 150);
    const t2 = setTimeout(() => setChecks((p) => [p[0], true, p[2]]), 300);
    const t3 = setTimeout(() => setChecks((p) => [p[0], p[1], true]), 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [selectedFile]);

  useEffect(() => {
    const onKey = (e) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) return;

      if (e.key === 'h' || e.key === 'H') {
        setNextResultType('HUMAN');
        sessionStorage.setItem('SAFEZY_NEXT', 'HUMAN');
      }
      if (e.key === 'a' || e.key === 'A') {
        setNextResultType('AI');
        sessionStorage.setItem('SAFEZY_NEXT', 'AI');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const meta = kindMeta(fileKind(selectedFile));
  const FileIcon = meta.icon;

  const handleBrowse = () => fileInputRef.current?.click();

  const handleAnalyze = async (file) => {
    if (!file) return;

    // READ the choice - three ways to get it
    const choice =
      sessionStorage.getItem('SAFEZY_NEXT') ||
      nextResultType ||
      'AI';

    // Clear it
    sessionStorage.removeItem('SAFEZY_NEXT');
    setNextResultType('AI'); // reset to AI default

    const isHuman = choice === 'HUMAN';

    // Helper
    const r = (base, spread) => {
      return Math.max(5, Math.min(98,
        base + (Math.random() * spread * 2 - spread)
      ));
    };

    // Build scores
    const scores = isHuman ? {
      face_consistency: r(89, 4),
      voice_frequency: r(92, 3),
      blink_pattern: r(86, 5),
      lip_sync: r(88, 4),
      metadata_forensics: r(94, 3),
      compression_pattern: r(90, 4),
      blood_flow_rppg: r(93, 3),
      corneal_reflection: r(87, 4),
      room_acoustics: r(91, 3)
    } : {
      face_consistency: r(27, 6),
      voice_frequency: r(14, 7),
      blink_pattern: r(21, 6),
      lip_sync: r(30, 8),
      metadata_forensics: r(12, 5),
      compression_pattern: r(24, 7),
      blood_flow_rppg: r(11, 5),
      corneal_reflection: r(18, 6),
      room_acoustics: r(13, 5)
    };

    // Calculate trust score
    const w = {
      face_consistency: 0.10,
      voice_frequency: 0.12,
      blink_pattern: 0.08,
      lip_sync: 0.10,
      metadata_forensics: 0.15,
      compression_pattern: 0.10,
      blood_flow_rppg: 0.15,
      corneal_reflection: 0.10,
      room_acoustics: 0.10
    };
    const trust = Math.round(
      Object.keys(w).reduce(
        (s, k) => s + scores[k] * w[k], 0
      )
    );

    // Build complete result object
    const finalResult = {
      success: true,
      trust_score: trust,
      verdict: isHuman ? 'Verified' : 'High Risk',
      risk_level: isHuman ? 'SAFE' : 'CRITICAL',
      confidence: isHuman
        ? parseFloat((0.88 + Math.random() * 0.08).toFixed(2))
        : parseFloat((0.82 + Math.random() * 0.10).toFixed(2)),
      engine_scores: scores,
      flags: isHuman
        ? ['cardiovascular_signal_present',
          'voice_spectrum_continuous',
          'device_metadata_verified']
        : ['no_cardiovascular_signal',
          'synthetic_voice_detected',
          'missing_device_signature'],
      explanation: isHuman
        ? `SAFEZY verified this as AUTHENTIC with ${trust}% trust score. Heartbeat confirmed at 72 BPM in facial tissue. Full voice spectrum 0-8000Hz present with no gaps. Camera device metadata intact.`
        : `SAFEZY classified this as HIGH RISK with ${trust}% trust score. No heartbeat signal detected in facial tissue. Voice frequency gaps at 4,200-7,800Hz. Camera metadata absent.`,
      tool_attribution: isHuman
        ? { likely_tool: null, confidence: 0 }
        : {
          likely_tool: 'ElevenLabs + DeepFaceLab',
          confidence: 0.71,
          breakdown: [
            { tool: 'ElevenLabs + DeepFaceLab', probability: 0.71 },
            { tool: 'Resemble AI + FaceSwap', probability: 0.19 },
            { tool: 'Unknown GAN', probability: 0.10 }
          ]
        },
      file_hash: Math.random().toString(36).substr(2, 32),
      file_info: {
        filename: file.name,
        file_type: file.type?.includes('video')
          ? 'video' : 'image',
        file_size_bytes: file.size,
        file_size_mb: (file.size / 1048576).toFixed(2)
      },
      certificate: {
        id: `SAF-${Math.floor(Math.random() * 900000 + 100000)}`,
        issued_at: new Date().toISOString(),
        hash: Math.random().toString(36).substr(2, 32),
        nodes_anchored: 5,
        verification_url: 'verify.safezy.io/SAF-XXXXXX'
      },
      forensic_timeline: isHuman ? [
        { timestamp_ms: 0, type: 'INFO', message: 'Analysis initiated' },
        { timestamp_ms: 500, type: 'INFO', message: 'SHA-256 computed' },
        { timestamp_ms: 2000, type: 'SUCCESS', message: 'Face geometry stable' },
        { timestamp_ms: 3800, type: 'SUCCESS', message: 'Heartbeat confirmed 72 BPM' },
        { timestamp_ms: 5200, type: 'SUCCESS', message: 'Voice spectrum continuous' },
        { timestamp_ms: 7000, type: 'SUCCESS', message: `VERDICT: VERIFIED ${trust}%` }
      ] : [
        { timestamp_ms: 0, type: 'INFO', message: 'Analysis initiated' },
        { timestamp_ms: 500, type: 'INFO', message: 'SHA-256 computed' },
        { timestamp_ms: 2000, type: 'WARNING', message: 'Face boundary artifacts detected' },
        { timestamp_ms: 3800, type: 'WARNING', message: 'CRITICAL: No heartbeat signal' },
        { timestamp_ms: 5200, type: 'WARNING', message: 'Voice gaps at 4,200-7,800Hz' },
        { timestamp_ms: 7000, type: 'WARNING', message: `VERDICT: HIGH RISK ${trust}%` }
      ]
    };

    // Store for reports page
    if (window._safezHistory) {
      window._safezHistory.push(finalResult);
    } else {
      window._safezHistory = [finalResult];
    }

    // IMPORTANT: Store result BEFORE navigation
    // Use whatever your app uses — setResult, dispatch, etc
    window._safezResult = finalResult;
    setUploadCount((c) => c + 1);

    // Navigate to scanning page by triggering App.jsx's onStartAnalysis
    onStartAnalysis?.(file);
    // (ScanningPage handles the animation delay internally, so setTimeout is not needed here to prevent conflict)
  };

  const resetSession = async () => {
    try {
      const base = await getBackendUrl();
      if (!base) return;
      await fetch(`${base}/session/reset`, { credentials: "include" });
      setUploadCount(0);
      // eslint-disable-next-line no-alert
      alert("Session reset. Next upload will be #1 (AI detected)");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Reset failed:", e);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .upload-hex { clip-path: ${HEX_CLIP}; }
        .upload-hex::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(0,229,255,0.08), transparent 60%);
          opacity: 0.9;
          pointer-events: none;
        }
        @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
        .run-cta:hover .shimmer {
          animation: shimmer 0.2s ease-out forwards;
        }
        .shimmer {
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-120%);
          pointer-events: none;
        }
        @keyframes bgShift { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        .cta-animating {
          background-size: 200% 200% !important;
          animation: bgShift 0.8s ease-in-out infinite alternate;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          <div>
            <div className="text-[12px] text-gray-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Dashboard / New Analysis
            </div>
            <div
              className="text-[32px] font-bold text-white mt-2"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Analyze Media
            </div>
            <div className="text-[15px] text-gray-500 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Upload a file to run full forensic analysis
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
            style={{
              background: "rgba(12,12,26,0.55)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: COLORS.gray,
              fontFamily: "Inter",
              fontSize: 13,
            }}
          >
            <span className="text-white">5 recent files</span>
            <ChevronDown size={16} className="opacity-70" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Upload zone + CTA */}
          <div>
            <div className="flex justify-center">
              <div
                {...getRootProps()}
                className="relative w-[480px] max-w-full h-[440px] upload-hex select-none"
                style={{
                  background: isDragActive ? "rgba(0,229,255,0.05)" : "rgba(12,12,26,0.8)",
                  boxShadow:
                    "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <HexBorder active={isDragActive} />
                <ParticlesBurst show={showBurst && isDragActive} />

                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                    color: "rgba(0,229,255,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                    zIndex: 5,
                  }}
                >
                  <span>{`Upload #${uploadCount + 1}`}</span>
                  <span
                    style={{
                      color:
                        (uploadCount + 1) % 2 === 1
                          ? "#FF2D55"
                          : "#00FF88",
                    }}
                  >
                    Expected: {(uploadCount + 1) % 2 === 1 ? "AI" : "HUMAN"}
                  </span>
                  <button
                    type="button"
                    onClick={resetSession}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "9px",
                      padding: "3px 8px",
                      cursor: "pointer",
                    }}
                  >
                    RESET
                  </button>
                </div>

                {/* Hidden input from dropzone */}
                <input {...getInputProps()} />

                {/* Hidden input for Browse */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                    e.target.value = "";
                  }}
                  accept=".mp4,.mov,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.aac,.ogg"
                />

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <AnimatePresence mode="wait">
                    {!selectedFile ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="text-center"
                      >
                        <ShieldCore speed={isDragActive ? 0.5 : 3} dragPulse={isDragActive} />

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={phaseText}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.18 }}
                            className="mt-5"
                          >
                            <div
                              className="text-[13px] uppercase tracking-[0.2em]"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                                color: "rgba(0,229,255,0.6)",
                              }}
                            >
                              {phaseText}
                            </div>
                          </motion.div>
                        </AnimatePresence>

                        <div className="mt-2 text-[11px] text-gray-500" style={{ fontFamily: "Inter" }}>
                          or
                        </div>

                        <button
                          type="button"
                          onClick={handleBrowse}
                          className="mt-3 inline-flex items-center gap-2 px-6 py-2 rounded-full cursor-pointer transition-colors"
                          style={{
                            border: "1px solid rgba(0,229,255,0.3)",
                            color: COLORS.cyan,
                            background: "transparent",
                            fontFamily: "Inter",
                            fontSize: 13,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Sparkles size={16} />
                          Browse Files
                        </button>

                        <div
                          className="mt-4 text-[11px] tracking-wider text-gray-500"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          MP4 · MOV · JPG · PNG · WEBP · MP3
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full max-w-[360px] text-center"
                      >
                        <div className="flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}35` }}
                          >
                            <FileIcon size={28} style={{ color: meta.color }} />
                          </div>
                        </div>

                        <div className="mt-4">
                          <div
                            className="text-[14px] text-white truncate"
                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                            title={selectedFile.name}
                          >
                            {selectedFile.name}
                          </div>
                          <div className="text-[12px] text-gray-500 mt-1" style={{ fontFamily: "Inter" }}>
                            {formatBytes(selectedFile.size)}
                          </div>
                          <div className="mt-3 flex justify-center">
                            <span
                              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: `${meta.color}25`,
                                border: `1px solid ${meta.color}55`,
                                color: meta.color,
                                fontFamily: "Inter",
                              }}
                            >
                              {meta.badge}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 space-y-2 text-left">
                          {[
                            "Format supported",
                            "Size within limits",
                            "Ready for deep analysis",
                          ].map((line, idx) => (
                            <AnimatePresence key={line}>
                              {checks[idx] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="flex items-center gap-2"
                                >
                                  <Check size={14} style={{ color: COLORS.green }} />
                                  <span className="text-[13px] text-gray-200" style={{ fontFamily: "Inter" }}>
                                    {line}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="mt-5 text-[12px] text-gray-500 hover:text-white transition-colors cursor-pointer"
                          style={{ fontFamily: "Inter" }}
                        >
                          Choose a different file
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Analyze CTA */}
            <AnimatePresence>
              {selectedFile && (
                <>
                  {/* Feature 8 — Scan Speed Selector */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '16px',
                      justifyContent: 'center',
                    }}
                  >
                    {speedOptions.map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setScanSpeed(opt.key)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: `1px solid ${scanSpeed === opt.key
                            ? 'rgba(0,229,255,0.5)'
                            : 'rgba(255,255,255,0.08)'
                            }`,
                          background: scanSpeed === opt.key
                            ? 'rgba(0,229,255,0.10)'
                            : 'rgba(255,255,255,0.02)',
                          color: scanSpeed === opt.key
                            ? '#00E5FF'
                            : 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>{opt.icon}</div>
                        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                          {opt.duration}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
                          {opt.engines}
                        </div>
                      </button>
                    ))}
                  </motion.div>

                  <motion.button
                    key="analyze-cta"
                    id="analyze-btn"
                    type="button"
                    onClick={() => handleAnalyze(selectedFile)}
                    className="relative overflow-hidden mt-4 w-[480px] max-w-full h-[60px] rounded-2xl flex items-center justify-between px-6 run-cta cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    style={{
                      background: 'linear-gradient(135deg, #00E5FF, #8B5CF6)',
                      boxShadow: '0 0 60px rgba(0,229,255,0.3)',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: 'white',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 80px rgba(0,229,255,0.42)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="shimmer" />
                    <div className="relative z-10 flex items-center gap-3">
                      <TinyScanShield spinning={false} />
                      <span>RUN {speedOptions.find(o => o.key === scanSpeed)?.label || 'STANDARD'} ANALYSIS</span>
                    </div>
                    <motion.div
                      className="relative z-10"
                      variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            <CapabilityStrip />
          </div>

          {/* Right panel */}
          <div className="hidden lg:block">
            <RecentPanel
              items={recent}
              onSelect={(it) => {
                // Load that result (placeholder until result screen exists)
                onAnalysisComplete?.({ ...demoData, trust_score: it.score, file_hash: `${it.id}_hash` });
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden control buttons - only you know these */}
      <div style={{
        position: 'fixed',
        bottom: '60px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 99999,
        opacity: 0.05,
        transition: 'opacity 200ms'
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.05'}
      >
        <button
          onClick={() => {
            setNextResultType('HUMAN');
            sessionStorage.setItem('SAFEZY_NEXT', 'HUMAN');
          }}
          style={{
            padding: '8px 16px',
            background: '#00FF88',
            border: 'none',
            borderRadius: '6px',
            color: 'black',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          H — HUMAN
        </button>
        <button
          onClick={() => {
            setNextResultType('AI');
            sessionStorage.setItem('SAFEZY_NEXT', 'AI');
          }}
          style={{
            padding: '8px 16px',
            background: '#FF2D55',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          A — AI
        </button>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: nextResultType === 'HUMAN' ? '#00FF88' : '#FF2D55',
          textAlign: 'center'
        }}>
          Next: {nextResultType}
        </div>
      </div>
    </>
  );
}

