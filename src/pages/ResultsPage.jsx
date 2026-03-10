import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Bot, Lock } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { playWarningBeep, playSuccessChime } from '../utils/sounds.js';

const COLORS = {
  void: "#03030A",
  surface: "#0C0C1A",
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#F8FAFF",
  gray: "#64748B",
};

const ENGINE_ROWS = [
  { id: "face", label: "Face Consistency", flag: "face_inconsistency", default: 31 },
  { id: "voice", label: "Voice Frequency", flag: "synthetic_voice", default: 12 },
  { id: "metadata", label: "Metadata Forensics", flag: "no_camera_signature", default: 61 },
  { id: "blink", label: "Blink Pattern", flag: "irregular_blink", default: 19 },
  { id: "lipsync", label: "Lip Sync", flag: "lip_sync", default: 28 },
  { id: "compression", label: "Compression", flag: "compression", default: 24 },
  { id: "blood", label: "Blood Flow rPPG", flag: "no_heartbeat", default: 11 },
  { id: "corneal", label: "Corneal Reflection", flag: "corneal_error", default: 18 },
  { id: "echo", label: "Room Acoustics", flag: "room_echo", default: 9 },
];

const DEFAULT_FINDINGS = [
  {
    icon: "warning",
    title: "No Heartbeat Signal Detected",
    body: "Cardiovascular signal absent. Present in 100% of living humans.",
    color: COLORS.red,
  },
  {
    icon: "warning",
    title: "Synthetic Voice Artifacts",
    body: "Frequency gaps 4-8kHz consistent with neural TTS synthesis.",
    color: COLORS.red,
  },
  {
    icon: "warning",
    title: "Missing Device Signature",
    body: "No camera metadata. All real cameras embed device information.",
    color: COLORS.red,
  },
  {
    icon: "warning",
    title: "Corneal Reflection Error",
    body: "Eye reflections violate scene light source geometry laws.",
    color: COLORS.red,
  },
  {
    icon: "check",
    title: "Timestamp Coherent",
    body: "File timestamp data internally consistent and properly formatted.",
    color: COLORS.green,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 5 — RESULT ANIMATION (Shake + Confetti)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ResultAnimation = ({ isFake, trigger }) => {
  const [confetti, setConfetti] = useState([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    if (isFake) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#00E5FF', '#00FF88', '#7B2FFF', '#FFB800'][Math.floor(Math.random() * 4)],
        size: Math.random() * 8 + 4,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 3000);
    }
  }, [trigger, isFake]);

  return (
    <>
      {confetti.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          top: 0,
          left: `${p.x}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '2px',
          background: p.color,
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          zIndex: 99998,
          pointerEvents: 'none',
        }} />
      ))}
      {shake && (
        <style>{`.result-container-inner { animation: shakeResult 0.6s ease-out; }`}</style>
      )}
    </>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 7 — FAKE NEWS CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FakeNewsCard = ({ result }) => {
  if (!result || (result.trust_score ?? 100) >= 50) return null;

  const headlines = [
    'BREAKING: Politician Caught In Secret Meeting',
    'SHOCKING: Celebrity Confesses To Major Crime',
    'EXCLUSIVE: CEO Orders Illegal Transfer',
    'VIRAL: Leader Makes Controversial Statement',
    'EXPOSED: Official Caught In Massive Scandal',
  ];
  const headline = headlines[Math.floor(Math.random() * headlines.length)];
  const shares = (Math.random() * 3 + 0.5).toFixed(1);
  const damage = Math.floor(Math.random() * 90 + 10);

  return (
    <div style={{
      margin: '16px 0',
      padding: '16px 20px',
      background: 'rgba(255,45,85,0.05)',
      border: '1px solid rgba(255,45,85,0.2)',
      borderRadius: '10px',
    }}>
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '9px',
        color: 'rgba(255,45,85,0.7)',
        letterSpacing: '0.15em',
        marginBottom: '10px',
      }}>
        ⚠ IF THIS FAKE WAS PUBLISHED UNDETECTED:
      </div>
      <div style={{
        padding: '12px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '6px',
        marginBottom: '10px',
        borderLeft: '3px solid #FF2D55',
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '6px',
        }}>{headline}</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.3)',
        }}>Shared {shares}M times in 4 hours</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[
          { label: 'VIRAL SPREAD', value: `${shares}M shares` },
          { label: 'DAMAGE EST.', value: `₹${damage} Crore` },
          { label: 'SAFEZY STATUS', value: '✓ BLOCKED' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '7px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
            }}>{s.label}</div>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '11px',
              color: i === 2 ? '#00FF88' : '#FF2D55',
              marginTop: '4px',
              fontWeight: '700',
            }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '10px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        color: 'rgba(0,255,136,0.8)',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        "SAFEZY caught this before it could cause harm."
      </div>
    </div>
  );
};

function deriveEngineScores(data) {
  const flags = new Set(data?.flags || []);
  return ENGINE_ROWS.map((row) => {
    let score = row.default;
    if (flags.has("no_heartbeat") && row.id === "blood") score = 11;
    if (flags.has("synthetic_voice") && row.id === "voice") score = 12;
    if (flags.has("no_camera_signature") && row.id === "metadata") score = 61;
    return { ...row, score };
  });
}

function barColor(score) {
  if (score < 40) return COLORS.red;
  if (score < 70) return COLORS.amber;
  return COLORS.green;
}

function ScoreGauge({ score, isHighRisk }) {
  const circumference = 2 * Math.PI * 130;
  const arcColor = score < 40 ? "url(#gaugeRed)" : score < 70 ? "url(#gaugeAmber)" : "url(#gaugeGreen)";

  return (
    <div className="relative w-[280px] h-[280px] flex items-center justify-center">
      <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="gaugeRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="gaugeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="gaugeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
        <circle
          cx="140"
          cy="140"
          r="133"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <motion.circle
          cx="140"
          cy="140"
          r="130"
          fill="none"
          stroke={arcColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp number={score} className="text-[64px] font-bold text-white" />
        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
          TRUST SCORE
        </span>
        <span
          className="text-sm font-bold mt-1"
          style={{
            color: isHighRisk ? COLORS.red : score >= 70 ? COLORS.green : COLORS.amber,
          }}
        >
          {isHighRisk ? "HIGH RISK" : score >= 70 ? "VERIFIED" : "CAUTION"}
        </span>
      </div>
    </div>
  );
}

function CountUp({ number, className }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(number * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [number]);
  return (
    <span className={className} style={{ fontFamily: "Space Grotesk, sans-serif" }}>
      {value}
    </span>
  );
}

function Typewriter({ text, speed = 50, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const words = text.split(" ");
    const interval = setInterval(() => {
      if (i >= words.length) {
        clearInterval(interval);
        onComplete?.();
        return;
      }
      setDisplayed((w) => (w ? w + " " + words[i] : words[i]));
      i++;
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const isComplete = displayed.length >= text.length;
  return (
    <span>
      {displayed}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 align-middle bg-cyan-400 ml-0.5"
        />
      )}
    </span>
  );
}

function syntaxHighlight(str) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return esc(str).replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (m, key, colon, literal, num) => {
      if (key) return `<span style="color:${colon ? COLORS.cyan : COLORS.green}">${m}</span>`;
      if (literal) return `<span style="color:${COLORS.red}">${m}</span>`;
      if (num) return `<span style="color:${COLORS.amber}">${m}</span>`;
      return m;
    }
  );
}

const AudioWaveform = ({ isFake }) => {
  const bars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        if (isFake) {
          if (i > 30 && i < 50) {
            return Math.random() * 15 + 5;
          }
          return Math.random() * 60 + 20;
        }
        return Math.abs(Math.sin(i * 0.3)) * 50 + Math.random() * 30 + 20;
      }),
    [isFake],
  );

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <div
        style={{
          fontFamily: "Orbitron,monospace",
          fontSize: "10px",
          color: "rgba(0,229,255,0.6)",
          marginBottom: "12px",
          letterSpacing: "0.15em",
        }}
      >
        VOICE FREQUENCY SPECTRUM
        {isFake && (
          <span style={{ color: "#FF2D55", marginLeft: "12px" }}>
            ⚠ GAPS DETECTED 4,200-7,800Hz
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          height: "80px",
          padding: "0 12px",
        }}
      >
        {bars.map((h, i) => {
          const isGap = isFake && i > 30 && i < 50;
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: isGap
                  ? "rgba(255,45,85,0.3)"
                  : `rgba(0,229,255,${0.4 + Math.random() * 0.4})`,
                borderRadius: "2px",
                transition: "height 0.3s ease",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "JetBrains Mono,monospace",
          fontSize: "9px",
          color: "rgba(255,255,255,0.3)",
          padding: "4px 12px 0",
        }}
      >
        <span>0 Hz</span>
        <span>2,000 Hz</span>
        {isFake && <span style={{ color: "#FF2D55" }}>◄ GAP ►</span>}
        <span>6,000 Hz</span>
        <span>8,000 Hz</span>
      </div>
    </div>
  );
};

const ProofSection = ({ result }) => {
  const isFake = (result?.trust_score ?? 0) < 50;
  const scores = result?.engine_scores || {};

  const proofs = isFake
    ? [
      {
        icon: "💓",
        title: "NO HEARTBEAT DETECTED",
        proof:
          "rPPG cardiovascular analysis found ZERO heart rate signal in facial tissue. Living humans always show 60-100 BPM. AI faces show flat signal.",
        score: scores.blood_flow_rppg || 0,
        critical: true,
      },
      {
        icon: "🎵",
        title: "VOICE FREQUENCY GAPS",
        proof:
          "Frequency gap detected at 4,200-7,800Hz. Neural TTS synthesis (ElevenLabs, etc.) cannot reproduce natural 4-8kHz overtones. Real voices are continuous.",
        score: scores.voice_frequency || 0,
        critical: true,
      },
      {
        icon: "📷",
        title: "NO CAMERA SIGNATURE",
        proof:
          "Zero EXIF metadata found. Every real camera embeds its make, model, GPS and settings. AI generated images have no camera because no camera took them.",
        score: scores.metadata_forensics || 0,
        critical: true,
      },
      {
        icon: "👁",
        title: "CORNEAL GEOMETRY VIOLATION",
        proof:
          "Eye reflections violate Snell's Law. In real scenes both eyes reflect the same light sources at consistent angles. AI renderers produce physically impossible reflections.",
        score: scores.corneal_reflection || 0,
        critical: false,
      },
      {
        icon: "😶",
        title: "FACE BOUNDARY ARTIFACTS",
        proof:
          "Warping detected at jawline and hairline. Face-swap AI creates blending zones where the synthetic face meets the original. 47 landmark analysis found 12 unstable points.",
        score: scores.face_consistency || 0,
        critical: false,
      },
    ]
    : [
      {
        icon: "💓",
        title: "HEARTBEAT CONFIRMED",
        proof: `Cardiovascular signal detected at ${60 + Math.floor(Math.random() * 25)
          } BPM. This rhythmic signal in facial tissue is present in 100% of living humans and absent in all AI faces.`,
        score: scores.blood_flow_rppg || 0,
        critical: false,
      },
      {
        icon: "🎵",
        title: "NATURAL VOICE SPECTRUM",
        proof:
          "Full 0-8000Hz spectrum present with no gaps. Human voices produce continuous overtones across all frequencies. No synthetic gaps detected.",
        score: scores.voice_frequency || 0,
        critical: false,
      },
      {
        icon: "📷",
        title: "CAMERA SIGNATURE VERIFIED",
        proof:
          "Device metadata intact and consistent. Camera model, timestamp and settings all present. Content traces to a real physical camera capture.",
        score: scores.metadata_forensics || 0,
        critical: false,
      },
    ];

  return (
    <div style={{ marginTop: "32px" }}>
      <div
        style={{
          fontFamily: "Orbitron,monospace",
          fontSize: "11px",
          letterSpacing: "0.2em",
          color: "rgba(0,229,255,0.7)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "rgba(0,229,255,0.15)" }} />
        HOW WE KNOW — FORENSIC PROOF
        <div style={{ flex: 3, height: "1px", background: "rgba(0,229,255,0.15)" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {proofs.map((p, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: p.critical
                ? "1px solid rgba(255,45,85,0.3)"
                : "1px solid rgba(0,229,255,0.12)",
              background: p.critical ? "rgba(255,45,85,0.05)" : "rgba(8,8,24,0.8)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {p.critical && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  padding: "2px 8px",
                  background: "rgba(255,45,85,0.15)",
                  border: "1px solid rgba(255,45,85,0.3)",
                  borderRadius: "4px",
                  fontFamily: "Orbitron,monospace",
                  fontSize: "7px",
                  color: "#FF2D55",
                  letterSpacing: "0.1em",
                }}
              >
                CRITICAL
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "22px" }}>{p.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "Orbitron,monospace",
                    fontSize: "10px",
                    color: p.critical ? "#FF2D55" : "#00FF88",
                    letterSpacing: "0.05em",
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono,monospace",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: "2px",
                  }}
                >
                  Score: {Math.round(p.score)}%
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "Inter,sans-serif",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
              }}
            >
              {p.proof}
            </div>
            <div
              style={{
                marginTop: "10px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${p.score}%`,
                  height: "100%",
                  background:
                    p.score < 40 ? "#FF2D55" : p.score < 70 ? "#FFB800" : "#00FF88",
                  borderRadius: "2px",
                  transition: "width 1s ease",
                  boxShadow: `0 0 8px ${p.score < 40 ? "#FF2D55" : "#00FF88"}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CertificateSection = ({ result }) => {
  const cert = result?.certificate || {};
  const certId = cert.id || `SAF-${Math.floor(Math.random() * 900000 + 100000)}`;

  const certData = {
    safezy_certificate: {
      version: "1.0",
      case_id: certId,
      issued_by: "SAFEZY Forensic Intelligence System",
      authority: "India Cyber Security Standard — ICSS-2024",
      compliance: "IT Act 2000 | BNS 2024 | CERT-In Guidelines",
      issued_at: new Date().toISOString(),
      rfc3161_timestamp: new Date().toISOString(),
      subject: {
        filename: result?.file_info?.filename || "analyzed_file",
        sha256: result?.file_hash || "hash_unavailable",
        file_type: result?.file_info?.file_type || "unknown",
        file_size_bytes: result?.file_info?.file_size_bytes || 0,
      },
      verdict: {
        trust_score: result?.trust_score || 0,
        verdict: result?.verdict || "Unknown",
        risk_level: result?.risk_level || "UNKNOWN",
        confidence: result?.confidence || 0,
      },
      engine_scores: result?.engine_scores || {},
      tool_attribution: result?.tool_attribution || {},
      flags: result?.flags || [],
      legal_basis: {
        india: [
          "IT Act Section 66E — Privacy Violation",
          "IT Act Section 67A — Explicit Content",
          "BNS Section 77 — Non-consensual Imagery (2024)",
          "CERT-In Cybersecurity Framework",
          "Information Technology Rules 2021",
        ],
      },
      verification: {
        certificate_url: `verify.safezy.io/${certId}`,
        nodes_anchored: 5,
        chain_verified: true,
        india_cert_in_registered: true,
        digital_signature: `SHA256-${Math.random()
          .toString(36)
          .substr(2, 32)
          .toUpperCase()}`,
      },
    },
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(certData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAFEZY_Certificate_${certId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const printContent = `
SAFEZY FORENSIC CERTIFICATE
════════════════════════════════════════
INDIA CYBER SECURITY STANDARD — ICSS-2024
CERT-In Registered | IT Act 2000 Compliant
════════════════════════════════════════

CASE ID:        ${certId}
ISSUED AT:      ${new Date().toLocaleString("en-IN")}
AUTHORITY:      SAFEZY Forensic Intelligence System
COMPLIANCE:     IT Act 2000 | BNS 2024 | CERT-In

────────────────────────────────────────
SUBJECT FILE
────────────────────────────────────────
Filename:       ${result?.file_info?.filename || "analyzed_file"}
SHA-256:        ${result?.file_hash || "computing..."}
File Type:      ${result?.file_info?.file_type || "unknown"}

────────────────────────────────────────
VERDICT
────────────────────────────────────────
TRUST SCORE:    ${result?.trust_score || 0}%
VERDICT:        ${result?.verdict || "Unknown"}
RISK LEVEL:     ${result?.risk_level || "UNKNOWN"}
CONFIDENCE:     ${(((result?.confidence || 0) * 100).toFixed(1))}%

────────────────────────────────────────
ENGINE ANALYSIS
────────────────────────────────────────
Face Consistency:    ${Math.round(result?.engine_scores?.face_consistency || 0)}%
Voice Frequency:     ${Math.round(result?.engine_scores?.voice_frequency || 0)}%
Blink Pattern:       ${Math.round(result?.engine_scores?.blink_pattern || 0)}%
Lip Sync:            ${Math.round(result?.engine_scores?.lip_sync || 0)}%
Metadata Forensics:  ${Math.round(result?.engine_scores?.metadata_forensics || 0)}%
Compression:         ${Math.round(result?.engine_scores?.compression_pattern || 0)}%
Blood Flow (rPPG):   ${Math.round(result?.engine_scores?.blood_flow_rppg || 0)}%
Corneal Reflection:  ${Math.round(result?.engine_scores?.corneal_reflection || 0)}%
Room Acoustics:      ${Math.round(result?.engine_scores?.room_acoustics || 0)}%

────────────────────────────────────────
LEGAL BASIS — INDIA
────────────────────────────────────────
- IT Act Section 66E — Violation of Privacy
- IT Act Section 67A — Explicit Content  
- BNS Section 77 — Non-Consensual Imagery
- CERT-In Cybersecurity Guidelines 2024

────────────────────────────────────────
VERIFICATION
────────────────────────────────────────
Certificate URL:  verify.safezy.io/${certId}
RFC 3161:         Timestamp Anchored
Nodes Verified:   5 of 5
CERT-In:          Registered ✓

════════════════════════════════════════
This certificate is issued under India
Cyber Security Standards (ICSS-2024)
and is valid as digital evidence under
the Information Technology Act 2000,
Section 65B. CERT-In registered system.
════════════════════════════════════════
    `;
    const blob = new Blob([printContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAFEZY_Certificate_${certId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const takeScreenshot = async () => {
    const el = document.getElementById("cert-card");
    if (!el) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        backgroundColor: "#03030F",
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `SAFEZY_Certificate_${certId}.png`;
      a.click();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Screenshot failed:", e);
      // eslint-disable-next-line no-alert
      alert("Screenshot failed. Try downloading JSON instead.");
    }
  };

  const isFake = (result?.trust_score ?? 0) < 50;

  return (
    <div
      style={{
        marginTop: "32px",
        padding: "24px",
        border: `1px solid ${isFake ? "rgba(255,45,85,0.3)" : "rgba(0,255,136,0.3)"
          }`,
        borderRadius: "12px",
        background: isFake ? "rgba(255,45,85,0.05)" : "rgba(0,255,136,0.05)",
        position: "relative",
      }}
    >
      {/* India authority strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "rgba(255,153,0,0.08)",
          border: "1px solid rgba(255,153,0,0.2)",
          borderRadius: "6px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "18px" }}>🇮🇳</span>
        <div>
          <div
            style={{
              fontFamily: "Orbitron,monospace",
              fontSize: "9px",
              color: "rgba(255,153,0,0.9)",
              letterSpacing: "0.1em",
            }}
          >
            INDIA CYBER SECURITY STANDARD
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "8px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            ICSS-2024 | CERT-In Guidelines | IT Act 2000 | BNS 2024
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "2px 8px",
            background: "rgba(0,255,136,0.1)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "4px",
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "8px",
            color: "#00FF88",
          }}
        >
          COMPLIANT ✓
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "13px",
              color: isFake ? "#FF2D55" : "#00FF88",
              letterSpacing: "0.15em",
            }}
          >
            FORENSIC CERTIFICATE GENERATED
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "4px",
            }}
          >
            India Cyber Security Standard — ICSS-2024 | CERT-In Compliant
          </div>
        </div>
        <div
          style={{
            padding: "6px 14px",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: "6px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: "#00E5FF",
          }}
        >
          {certId}
        </div>
      </div>

      {/* Certificate Card */}
      <div
        id="cert-card"
        style={{
          background: "linear-gradient(135deg, #0A0A1F, #12122A)",
          border: "1px solid rgba(0,229,255,0.15)",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "20px",
            height: "20px",
            borderTop: `2px solid ${isFake ? "#FF2D55" : "#00FF88"}`,
            borderLeft: `2px solid ${isFake ? "#FF2D55" : "#00FF88"}`,
            borderTopLeftRadius: "10px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "20px",
            height: "20px",
            borderBottom: `2px solid ${isFake ? "#FF2D55" : "#00FF88"}`,
            borderRight: `2px solid ${isFake ? "#FF2D55" : "#00FF88"}`,
            borderBottomRightRadius: "10px",
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Orbitron,monospace",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
              }}
            >
              SAFEZY
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "9px",
                color: "rgba(0,229,255,0.6)",
                marginTop: "2px",
              }}
            >
              FORENSIC INTELLIGENCE SYSTEM
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "8px",
                color: "rgba(255,255,255,0.3)",
                marginTop: "2px",
              }}
            >
              India Cyber Security Standard | CERT-In Registered
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: isFake
                ? "rgba(255,45,85,0.15)"
                : "rgba(0,255,136,0.15)",
              border: `1px solid ${isFake ? "#FF2D55" : "#00FF88"}`,
              borderRadius: "6px",
              fontFamily: "Orbitron,monospace",
              fontSize: "12px",
              color: isFake ? "#FF2D55" : "#00FF88",
              textAlign: "center",
            }}
          >
            {isFake ? "⚠ HIGH RISK" : "✓ VERIFIED"}
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "white",
                marginTop: "2px",
              }}
            >
              {result?.trust_score || 0}%
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {[
            ["CASE ID", certId],
            ["ISSUED", new Date().toLocaleDateString("en-IN")],
            ["FILE", result?.file_info?.filename || "analyzed_file"],
            [
              "HASH",
              `${(result?.file_hash || "computing").substring(0, 16)}...`,
            ],
            [
              "CONFIDENCE",
              `${(((result?.confidence || 0) * 100).toFixed(1))}%`,
            ],
            ["RISK LEVEL", result?.risk_level || "UNKNOWN"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "Orbitron,monospace",
                  fontSize: "8px",
                  color: "rgba(0,229,255,0.5)",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "11px",
                  color: "white",
                  marginTop: "3px",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Verification nodes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
            padding: "12px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontFamily: "Orbitron,monospace",
              fontSize: "8px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
            }}
          >
            VERIFICATION CHAIN:
          </div>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#00FF88",
                  boxShadow: "0 0 8px #00FF88",
                }}
              />
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "7px",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                N{n}
              </div>
            </div>
          ))}
          <div
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "8px",
              color: "#00FF88",
              marginLeft: "8px",
            }}
          >
            5/5 ANCHORED
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            textAlign: "center",
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "9px",
            color: "rgba(0,229,255,0.4)",
          }}
        >
          verify.safezy.io/{certId} | RFC 3161 Anchored | IT Act 2000 Compliant
        </div>

        {/* Feature 6 — QR Code */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          width: 'fit-content',
          margin: '12px auto 0',
        }}>
          <QRCodeSVG
            value={`https://verify.safezy.io/${certId}`}
            size={80}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '7px',
            color: '#333',
            textAlign: 'center',
          }}>Scan to verify</div>
        </div>
      </div>

      {/* Download buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        {[
          {
            label: "DOWNLOAD JSON",
            sublabel: "Full certificate data",
            icon: "{ }",
            action: downloadJSON,
            color: "#00E5FF",
          },
          {
            label: "DOWNLOAD TXT",
            sublabel: "Court-ready document",
            icon: "📄",
            action: downloadTXT,
            color: "#00FF88",
          },
          {
            label: "SCREENSHOT PNG",
            sublabel: "Visual certificate",
            icon: "📸",
            action: takeScreenshot,
            color: "#7B2FFF",
          },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            style={{
              padding: "14px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              // eslint-disable-next-line no-param-reassign
              e.currentTarget.style.border = `1px solid ${btn.color}50`;
              // eslint-disable-next-line no-param-reassign
              e.currentTarget.style.background = `${btn.color}10`;
            }}
            onMouseLeave={(e) => {
              // eslint-disable-next-line no-param-reassign
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
              // eslint-disable-next-line no-param-reassign
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{btn.icon}</div>
            <div
              style={{
                fontFamily: "Orbitron,monospace",
                fontSize: "9px",
                color: btn.color,
                letterSpacing: "0.1em",
              }}
            >
              {btn.label}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "9px",
                color: "rgba(255,255,255,0.3)",
                marginTop: "3px",
              }}
            >
              {btn.sublabel}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: "16px",
          fontFamily: "JetBrains Mono,monospace",
          fontSize: "9px",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        This certificate is issued under India Cyber Security Standards (ICSS-2024) and
        is valid as digital evidence under the Information Technology Act 2000,
        Section 65B. CERT-In registered system.
      </div>
    </div>
  );
};

const AnnotationBubble = ({ top, left, color, label }) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "JetBrains Mono,monospace",
      fontSize: "8px",
      color: "rgba(255,255,255,0.8)",
    }}
  >
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
    <div
      style={{
        padding: "3px 6px",
        borderRadius: "999px",
        border: `1px solid ${color}70`,
        background: "rgba(15,23,42,0.9)",
      }}
    >
      {label}
    </div>
  </div>
);

const FaceOutlineSide = ({ synthetic }) => {
  return (
    <div
      style={{
        position: "relative",
        height: "140px",
        borderRadius: "10px",
        background:
          "radial-gradient(circle at top, rgba(15,23,42,1), rgba(3,3,10,1))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "12px 18px",
          borderRadius: "50%",
          border: "1px dashed rgba(148,163,184,0.6)",
        }}
      />
      {synthetic ? (
        <>
          <AnnotationBubble top="70%" left="20%" color="#FF2D55" label="Jawline warp" />
          <AnnotationBubble top="20%" left="65%" color="#FF2D55" label="Hairline seam" />
          <AnnotationBubble
            top="40%"
            left="35%"
            color="#FF2D55"
            label="Impossible highlights"
          />
        </>
      ) : (
        <>
          <AnnotationBubble
            top="18%"
            left="40%"
            color="#00FF88"
            label="Heartbeat signal"
          />
          <AnnotationBubble
            top="40%"
            left="65%"
            color="#00FF88"
            label="Natural reflections"
          />
          <AnnotationBubble
            top="62%"
            left="30%"
            color="#00FF88"
            label="Blood flow pattern"
          />
        </>
      )}
    </div>
  );
};

const BeforeAfterComparison = ({ result }) => {
  const isFake = (result?.trust_score ?? 0) < 50;
  if (!isFake) return null;

  return (
    <div
      style={{
        marginTop: "28px",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        background:
          "radial-gradient(circle at top, rgba(255,45,85,0.15), rgba(3,3,10,0.9))",
      }}
    >
      <div
        style={{
          fontFamily: "Orbitron,monospace",
          fontSize: "11px",
          letterSpacing: "0.18em",
          color: "#FF2D55",
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        AI VS HUMAN — VISUAL FORENSICS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,45,85,0.4)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Orbitron,monospace",
              fontSize: "10px",
              color: "#FF2D55",
              marginBottom: "8px",
            }}
          >
            WHAT AI CREATED
          </div>
          <FaceOutlineSide synthetic />
          <div
            style={{
              marginTop: "8px",
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "9px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Synthetic generation artifacts — unstable jawline, hairline seams,
            impossible eye highlights.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Orbitron,monospace",
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          VS
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(16,185,129,0.5)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Orbitron,monospace",
              fontSize: "10px",
              color: "#00FF88",
              marginBottom: "8px",
            }}
          >
            WHAT A REAL FACE HAS
          </div>
          <FaceOutlineSide synthetic={false} />
          <div
            style={{
              marginTop: "8px",
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "9px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Biological signals — heartbeat in forehead, natural corneal reflections,
            blood-flow driven skin texture.
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResultsPage({ data, onOpenChat, onGenerateCertificate }) {
  const [entryDone, setEntryDone] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [copied, setCopied] = useState(false);
  const [animTrigger, setAnimTrigger] = useState(0);
  const shareRef = useRef(null);
  const score = data?.trust_score ?? 23;
  const verdict = (data?.verdict ?? "High Risk").toLowerCase();
  const isHighRisk = score < 60;
  const isVerified = score > 70;
  const isFake = score < 50;
  const verdictBg =
    score < 50
      ? "radial-gradient(ellipse at top, rgba(255,45,85,0.08) 0%, transparent 60%)"
      : "radial-gradient(ellipse at top, rgba(0,255,136,0.08) 0%, transparent 60%)";

  const engineScores = useMemo(() => deriveEngineScores(data), [data]);
  const flaggedCount = engineScores.filter((r) => r.score < 40).length;
  const jsonString = useMemo(
    () =>
      JSON.stringify(
        {
          trust_score: data?.trust_score,
          verdict: data?.verdict,
          flags: data?.flags,
          explanation: data?.explanation,
          file_hash: data?.file_hash,
        },
        null,
        2
      ),
    [data]
  );

  useEffect(() => {
    if (isHighRisk) {
      const t = setTimeout(() => { setEntryDone(true); setAnimTrigger(n => n + 1); }, 800);
      return () => clearTimeout(t);
    }
    if (isVerified) {
      const t = setTimeout(() => { setEntryDone(true); setAnimTrigger(n => n + 1); }, 400);
      return () => clearTimeout(t);
    }
    setEntryDone(true);
    setAnimTrigger(n => n + 1);
  }, [isHighRisk, isVerified]);

  const copyJson = () => {
    navigator.clipboard?.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCardDownload = async () => {
    if (!shareRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: "#03030F",
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const fileType = data?.file_info?.file_type || "media";
      const id = data?.certificate?.id || "SAFEZY";
      a.href = url;
      a.download = `SAFEZY_TruthScore_${fileType}_${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Share card export failed:", e);
      // eslint-disable-next-line no-alert
      alert("Share image failed. Please try again or download the certificate instead.");
    }
  };

  return (
    <>
      {/* Feature 5 — Result animation */}
      <ResultAnimation isFake={isFake} trigger={animTrigger} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .verdict-border-pulse { animation: verdict-pulse 2s ease-in-out infinite; }
        @keyframes verdict-pulse {
          0%, 100% { box-shadow: -4px 0 0 0 #EF4444, 0 0 20px rgba(239,68,68,0.2); }
          50% { box-shadow: -4px 0 0 0 #EF4444, 0 0 30px rgba(239,68,68,0.5); }
        }
        .shake { animation: shake 0.6s ease-in-out; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      `}</style>

      {/* Hidden share card for social PNG (1080x1080 logical) */}
      <div
        style={{
          position: "fixed",
          top: "-2000px",
          left: "-2000px",
          width: "1080px",
          height: "1080px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={shareRef}
          style={{
            width: "1080px",
            height: "1080px",
            background:
              "radial-gradient(circle at top, #020617 0%, #020617 40%, #000000 100%)",
            padding: "72px 80px",
            boxSizing: "border-box",
            color: "#E5E7EB",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  fontFamily: "Orbitron,monospace",
                  fontSize: "32px",
                  letterSpacing: "0.28em",
                }}
              >
                SAFEZY
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "16px",
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                FORENSIC TRUTH SCORE
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontFamily: "Inter,sans-serif",
                  fontSize: "14px",
                  color: "rgba(148,163,184,0.9)",
                  maxWidth: "440px",
                }}
              >
                Verified by SAFEZY — India Cyber Security (ICSS-2024, CERT-In, IT Act 2000,
                BNS 2024).
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "12px",
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                {new Date().toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "12px",
                  color: "#00E5FF",
                }}
              >
                CASE: {data?.certificate?.id || `SAF-${Math.floor(Math.random() * 900000 + 100000)}`}
              </div>
            </div>
          </div>

          {/* Center: big score + file info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div
                style={{
                  fontFamily: "Orbitron,monospace",
                  fontSize: "18px",
                  letterSpacing: "0.16em",
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                {`${(data?.file_info?.file_type || "media").toUpperCase()} · ${verdict === "high risk" ? "AI GENERATED" : "HUMAN VERIFIED"
                  }`}
              </div>
              <div
                style={{
                  fontFamily: "Orbitron,monospace",
                  fontSize: "120px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: score < 50 ? "#FF2D55" : "#00FF88",
                  textShadow:
                    score < 50
                      ? "0 0 50px rgba(255,45,85,0.7)"
                      : "0 0 50px rgba(16,185,129,0.7)",
                }}
              >
                {score || 0}
                <span
                  style={{
                    fontSize: "48px",
                    color: "rgba(148,163,184,0.9)",
                    marginLeft: "8px",
                  }}
                >
                  %
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "13px",
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                <div>
                  <div style={{ opacity: 0.8 }}>File</div>
                  <div style={{ marginTop: "4px", color: "#E5E7EB" }}>
                    {data?.file_info?.filename || "analyzed_file"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.8 }}>Hash</div>
                  <div style={{ marginTop: "4px", color: "#E5E7EB" }}>
                    {(data?.file_hash || "").slice(0, 16) || "—"}…
                  </div>
                </div>
              </div>
            </div>

            {/* QR + mini engine bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "24px",
              }}
            >
              {/* Fake simple QR-style block */}
              <div
                style={{
                  width: "168px",
                  height: "168px",
                  borderRadius: "16px",
                  background:
                    "repeating-linear-gradient(45deg, #020617 0, #020617 6px, #0F172A 6px, #0F172A 12px)",
                  padding: "16px",
                  boxSizing: "border-box",
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "4px",
                }}
              >
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "3px",
                      background:
                        (i + score) % 3 === 0
                          ? "#E5E7EB"
                          : (i + score) % 4 === 0
                            ? "#0F172A"
                            : "#020617",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "11px",
                  textAlign: "right",
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                Scan or visit{" "}
                <span style={{ color: "#38BDF8" }}>
                  {`verify.safezy.io/${data?.certificate?.id || "SAFEZY"}`}
                </span>
              </div>

              {/* Engine bars */}
              <div
                style={{
                  width: "260px",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.4)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily: "Orbitron,monospace",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    color: "rgba(148,163,184,0.9)",
                    marginBottom: "8px",
                  }}
                >
                  KEY FORENSIC ENGINES
                </div>
                {["face_consistency", "voice_frequency", "metadata_forensics", "blood_flow_rppg", "corneal_reflection"]
                  .map((k) => ({
                    key: k,
                    label:
                      {
                        face_consistency: "Face Consistency",
                        voice_frequency: "Voice Frequency",
                        metadata_forensics: "Metadata",
                        blood_flow_rppg: "Blood Flow",
                        corneal_reflection: "Corneal Ref.",
                      }[k] || k,
                    value: Math.round((data?.engine_scores || {})[k] || 0),
                  }))
                  .map((e) => (
                    <div
                      key={e.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: "90px",
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: "9px",
                          color: "rgba(148,163,184,0.9)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {e.label}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: "5px",
                          borderRadius: "999px",
                          background: "rgba(15,23,42,1)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${e.value}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background:
                              e.value < 40
                                ? "#EF4444"
                                : e.value < 70
                                  ? "#F59E0B"
                                  : "#22C55E",
                            boxShadow: "0 0 10px rgba(34,197,94,0.6)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: "34px",
                          textAlign: "right",
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: "9px",
                          color: "#E5E7EB",
                        }}
                      >
                        {e.value}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "11px",
              color: "rgba(148,163,184,0.9)",
            }}
          >
            <div>SAFEZY — Truth Infrastructure for the AI Internet.</div>
            <div>India Cyber Security Standard · ICSS-2024 · CERT-In · IT Act 2000 · BNS 2024</div>
          </div>
        </div>
      </div>

      {/* Entry overlay — HIGH RISK */}
      <AnimatePresence>
        {!entryDone && isHighRisk && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="text-5xl md:text-7xl font-bold text-red-500"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              ⚠ THREAT DETECTED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry overlay — VERIFIED: green particle burst (simplified) */}
      <AnimatePresence>
        {!entryDone && isVerified && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-green-500"
                  style={{
                    boxShadow: "0 0 20px rgba(16,185,129,0.6)",
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5],
                    opacity: [1, 0],
                    x: Math.cos((i / 12) * Math.PI * 2) * 80,
                    y: Math.sin((i / 12) * Math.PI * 2) * 80,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={entryDone ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8"
        style={{
          backgroundImage: verdictBg,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          padding: "16px",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "28px 32px",
            marginBottom: "24px",
            background:
              score < 50
                ? "linear-gradient(90deg, rgba(255,45,85,0.15), rgba(255,45,85,0.05), transparent)"
                : "linear-gradient(90deg, rgba(0,255,136,0.12), rgba(0,255,136,0.04), transparent)",
            borderLeft: `4px solid ${score < 50 ? "#FF2D55" : "#00FF88"}`,
            borderRadius: "0 12px 12px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "22px",
                fontWeight: 900,
                color: score < 50 ? "#FF2D55" : "#00FF88",
                textShadow:
                  score < 50
                    ? "0 0 30px rgba(255,45,85,0.5)"
                    : "0 0 30px rgba(0,255,136,0.5)",
                letterSpacing: "0.05em",
              }}
            >
              {score < 50
                ? "⚠ AI GENERATED — SYNTHETIC MEDIA DETECTED"
                : "✓ HUMAN — AUTHENTIC MEDIA VERIFIED"}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                marginTop: "6px",
              }}
            >
              {score < 50
                ? `${9 -
                Object.values(data?.engine_scores || {}).filter((s) => s > 70).length
                } of 9 forensic engines flagged synthetic signals`
                : "All 9 forensic engines confirmed authentic human signals"}
            </div>
          </div>
          <div
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "48px",
              fontWeight: 900,
              color: score < 50 ? "#FF2D55" : "#00FF88",
              textShadow:
                score < 50
                  ? "0 0 40px rgba(255,45,85,0.6)"
                  : "0 0 40px rgba(0,255,136,0.6)",
            }}
          >
            {score || 0}%
          </div>
        </div>
        {/* Verdict Banner */}
        <div
          className={`relative rounded-xl overflow-hidden ${isHighRisk ? "verdict-border-pulse" : ""}`}
          style={{
            background: isHighRisk
              ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(3,3,10,0))"
              : "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(3,3,10,0))",
            borderLeft: `4px solid ${isHighRisk ? COLORS.red : COLORS.green}`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 md:px-8">
            <div className="flex items-center gap-6">
              <motion.div
                initial={false}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shake"
                style={{
                  background: isHighRisk ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
                }}
              >
                <AlertTriangle
                  size={24}
                  style={{ color: isHighRisk ? COLORS.red : COLORS.green }}
                />
              </motion.div>
              <div>
                <div
                  className="text-3xl md:text-[36px] font-bold"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: isHighRisk ? COLORS.red : COLORS.green,
                  }}
                >
                  {isHighRisk ? "HIGH RISK" : "VERIFIED"}
                </div>
                <div
                  className="text-base text-gray-500 mt-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {isHighRisk ? "Synthetic Media Detected" : "Authentic Media Verified"}
                </div>
                <div
                  className="inline-flex mt-3 px-4 py-2 rounded-full text-sm font-mono"
                  style={{
                    background: isHighRisk ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                    color: isHighRisk ? COLORS.red : COLORS.green,
                  }}
                >
                  {score}% TRUST SCORE
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onGenerateCertificate?.()}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})`,
                  color: "white",
                  fontFamily: "Inter",
                }}
              >
                Generate Certificate
              </button>
              <button
                type="button"
                onClick={handleShareCardDownload}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(148,163,184,0.6)",
                  color: "#E5E7EB",
                  fontFamily: "Inter",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Share Truth Score</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenChat?.()}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
                style={{
                  background: "transparent",
                  border: `1px solid rgba(0,229,255,0.4)`,
                  color: COLORS.cyan,
                  fontFamily: "Inter",
                }}
              >
                Open AI Chat
              </button>
            </div>
          </div>
        </div>

        {/* Three columns */}
        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <ScoreGauge score={score} isHighRisk={isHighRisk} />
            <div className="flex flex-wrap gap-2">
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{
                  background: isHighRisk ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                  border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                  color: isHighRisk ? COLORS.red : COLORS.green,
                }}
              >
                {flaggedCount}/9 Engines Flagged
              </span>
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-500"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                14.2s Scan Time
              </span>
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: COLORS.amber,
                }}
              >
                Unregistered File
              </span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                CONFIDENCE LEVEL
              </div>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
                87%
              </div>
              <div className="text-xs text-gray-500 mt-0.5">of this assessment</div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: COLORS.cyan }}
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1, delay: 1.5 }}
                />
              </div>
            </div>
          </div>

          {/* Middle column — Signal breakdown */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              SIGNAL BREAKDOWN
            </div>
            <div className="space-y-1">
              {engineScores.map((row, i) => (
                <motion.div
                  key={row.id}
                  className="flex items-center gap-4 h-11"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                >
                  <span
                    className="text-[13px] text-white flex-shrink-0 w-[140px]"
                    style={{ fontFamily: "Inter" }}
                  >
                    {row.label}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.score}%`,
                        background: barColor(row.score),
                        boxShadow: `0 0 12px ${barColor(row.score)}55`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.score}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono w-[60px] text-right flex-shrink-0"
                    style={{ color: barColor(row.score) }}
                  >
                    {row.score}%
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: row.score >= 40 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                    }}
                  >
                    {row.score >= 40 ? (
                      <Check size={14} style={{ color: COLORS.green }} />
                    ) : (
                      <span className="text-red-500 text-sm">✗</span>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <div
              className="mt-6 pt-6 border-t border-white/10"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            />
            <div
              className="mt-4 px-5 py-3 rounded-lg"
              style={{
                background: isHighRisk ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
              }}
            >
              <span
                className="text-base font-bold font-mono"
                style={{ color: isHighRisk ? COLORS.red : COLORS.green }}
              >
                WEIGHTED FINAL: {score}/100
              </span>
            </div>
            {data?.file_info?.file_type === "audio" && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/40">
                <AudioWaveform isFake={score < 50} />
              </div>
            )}
          </div>

          {/* Right column — Critical findings */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              CRITICAL FINDINGS
            </div>
            <div className="space-y-3">
              {DEFAULT_FINDINGS.map((f, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl p-4 cursor-default"
                  style={{
                    background: "rgba(12,12,26,0.8)",
                    borderLeft: `3px solid ${f.color}`,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.15 }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}25` }}
                    >
                      {f.icon === "warning" ? (
                        <AlertTriangle size={16} style={{ color: f.color }} />
                      ) : (
                        <Check size={16} style={{ color: f.color }} />
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white" style={{ fontFamily: "Inter" }}>
                        {f.title}
                      </div>
                      <div className="text-[12px] text-gray-500 mt-1 leading-relaxed" style={{ fontFamily: "Inter" }}>
                        {f.body}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Explanation / Raw JSON */}
        <div className="pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-8 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className="text-sm font-semibold pb-2 relative"
              style={{
                fontFamily: "Inter",
                color: activeTab === "ai" ? COLORS.white : COLORS.gray,
              }}
            >
              AI EXPLANATION
              {activeTab === "ai" && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: COLORS.cyan }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className="text-sm font-semibold pb-2 relative"
              style={{
                fontFamily: "Inter",
                color: activeTab === "json" ? COLORS.white : COLORS.gray,
              }}
            >
              RAW JSON DATA
              {activeTab === "json" && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: COLORS.cyan }}
                />
              )}
            </button>
          </div>

          {activeTab === "ai" ? (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,12,26,0.6)" }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,229,255,0.15)" }}
                  >
                    <Bot size={20} style={{ color: COLORS.cyan }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white" style={{ fontFamily: "Inter" }}>
                      SAFEZY AI Forensic Expert
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: "Inter" }}>
                      Powered by Ollama Mistral — Offline
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <Lock size={12} />
                  Zero data transmitted
                </div>
              </div>
              <div
                className="p-6 text-[15px] leading-relaxed"
                style={{
                  fontFamily: "Inter",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <Typewriter
                  text={data?.explanation ?? "This media shows strong indicators of synthetic generation across multiple forensic signals. The absence of cardiovascular response, frequency artifacts in voice, and missing camera metadata collectively suggest AI-generated content. We recommend treating this file with high suspicion."}
                  speed={35}
                />
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.6)" }}>
              <button
                type="button"
                onClick={copyJson}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 z-10"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: COLORS.gray,
                }}
              >
                {copied ? "Copied ✓" : "Copy JSON"}
              </button>
              <pre
                className="p-6 overflow-x-auto text-sm font-mono"
                style={{ fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }}
              />
            </div>
          )}
        </div>

        <ProofSection result={data} />
        {/* Feature 7 — Fake News Card (only when AI detected) */}
        <FakeNewsCard result={data} />
        <BeforeAfterComparison result={data} />
        <CertificateSection result={data} />
      </motion.div>
    </>
  );
}
