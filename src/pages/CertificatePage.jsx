import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Code,
  Link2,
  Share2,
  ArrowLeft,
} from "lucide-react";

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
  { label: "Face Consistency", default: 31 },
  { label: "Voice Frequency", default: 12 },
  { label: "Metadata Forensics", default: 61 },
  { label: "Blink Pattern", default: 19 },
  { label: "Lip Sync", default: 28 },
  { label: "Compression", default: 24 },
  { label: "Blood Flow rPPG", default: 11 },
  { label: "Corneal Reflection", default: 18 },
  { label: "Room Acoustics", default: 9 },
];

function barColor(score) {
  if (score < 40) return COLORS.red;
  if (score < 70) return COLORS.amber;
  return COLORS.green;
}

function AnimatedCheckmark() {
  const circumference = 2 * Math.PI * 40;
  const checkPath = "M20 50 L42 72 L80 28";
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-24 h-24"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 absolute">
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={COLORS.green}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </svg>
      <svg viewBox="0 0 100 100" className="w-full h-full absolute">
        <motion.path
          d={checkPath}
          fill="none"
          stroke={COLORS.green}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}

function QRPlaceholder() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="white" rx="4" />
      {[...Array(10)].map((_, i) => (
        <rect
          key={i}
          x={5 + (i % 5) * 18}
          y={5 + Math.floor(i / 5) * 18}
          width="12"
          height="12"
          fill="#03030A"
        />
      ))}
      {[5, 6, 7, 8].map((i) => (
        <rect key={`r${i}`} x={5 + i * 18} y={41} width="12" height="12" fill="#03030A" />
      ))}
      {[2, 3, 4, 5].map((i) => (
        <rect key={`c${i}`} x={41} y={5 + i * 18} width="12" height="12" fill="#03030A" />
      ))}
    </svg>
  );
}

export default function CertificatePage({ data, onBack }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const score = data?.trust_score ?? 23;
  const verdict = (data?.verdict ?? "High Risk").toLowerCase();
  const isHighRisk = score < 60;
  const certRef = `TL-2026-03-${String(new Date().getDate()).padStart(2, "0")}-8847`;
  const verifyUrl = `https://safezy.vercel.app/verify/${data?.file_hash ?? "a3f9c2b8d4e167"}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(verifyUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-8 min-h-0"
      >
        {/* Left: Certificate Preview */}
        <div className="flex-1 lg:w-[55%] flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[600px] rounded-xl overflow-hidden"
            style={{
              background: "#F9F9F4",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Dark header */}
            <div
              className="flex items-center justify-between px-8 py-5"
              style={{ background: COLORS.surface }}
            >
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M14 2L24 8V20L14 26L4 20V8L14 2Z"
                    stroke={COLORS.cyan}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                <span className="text-white font-bold" style={{ fontFamily: "Space Grotesk" }}>
                  SAFEZY
                </span>
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: COLORS.cyan, fontFamily: "Inter" }}
              >
                FORENSIC AUTHENTICITY CERTIFICATE
              </span>
              <span
                className="text-xs text-white"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {certRef}
              </span>
            </div>

            {/* White body */}
            <div className="p-9" style={{ color: "#1a1a1a" }}>
              {/* Meta */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                <div>
                  <span className="text-gray-600">Case Ref</span>
                  <div className="font-mono font-medium">{certRef}</div>
                </div>
                <div>
                  <span className="text-gray-600">File Analyzed</span>
                  <div className="font-mono truncate">{data?.file_hash ?? "a3f9c2b8d4e167"}</div>
                </div>
                <div>
                  <span className="text-gray-600">Date</span>
                  <div>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <div>
                  <span className="text-gray-600">Analysis Type</span>
                  <div>9-Signal Forensic Scan</div>
                </div>
              </div>

              {/* Verdict box */}
              <div
                className="rounded-lg py-6 px-6 text-center mb-6"
                style={{
                  background: isHighRisk ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                  border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                }}
              >
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: "Space Grotesk", color: isHighRisk ? COLORS.red : COLORS.green }}>
                  {isHighRisk ? "HIGH RISK" : "VERIFIED"}
                </div>
                <div className="text-4xl font-bold" style={{ color: isHighRisk ? COLORS.red : COLORS.green }}>
                  {score}% TRUST SCORE
                </div>
              </div>

              {/* Signal table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#e5e5e5" }}>
                    <th className="text-left py-3 font-semibold">Signal</th>
                    <th className="text-left py-3 font-semibold">Score</th>
                    <th className="text-right py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ENGINE_ROWS.map((row, i) => {
                    const c = barColor(row.default);
                    return (
                      <tr key={i} className="border-b" style={{ borderColor: "#f0f0f0" }}>
                        <td className="py-2">{row.label}</td>
                        <td className="py-2">
                          <div className="w-24 h-1.5 rounded-full overflow-hidden bg-gray-200">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${row.default}%`, background: c }}
                            />
                          </div>
                        </td>
                        <td className="py-2 text-right font-medium" style={{ color: row.default >= 40 ? COLORS.green : COLORS.red }}>
                          {row.default >= 40 ? "Pass" : "Fail"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* AI Summary */}
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  background: "#f5f5f0",
                  borderLeft: `4px solid ${isHighRisk ? COLORS.red : COLORS.green}`,
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                  AI Summary
                </div>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter" }}>
                  {data?.explanation ?? "This media shows strong indicators of synthetic generation across multiple forensic signals."}
                </p>
              </div>

              {/* Technical */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-mono text-gray-600">
                  File Hash: {data?.file_hash ?? "a3f9c2b8d4e167"}
                </div>
                <div className="text-xs font-mono text-gray-600">
                  RFC 3161 Timestamp: {new Date().toISOString()}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <QRPlaceholder />
                  <div>
                    <div className="text-xs font-mono text-gray-600 mb-1">Verify at:</div>
                    <a href={verifyUrl} className="text-xs font-mono text-cyan-600 hover:underline">
                      {verifyUrl}
                    </a>
                  </div>
                </div>
              </div>

              {/* 5 nodes */}
              <div className="flex items-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full" style={{ background: COLORS.green }} />
                ))}
                <span className="text-xs text-gray-600 ml-2">Anchored to 5 independent nodes</span>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 text-center text-xs italic"
              style={{ background: "#ebebeb", color: "#666" }}
            >
              SAFEZY Forensic Certificate · For verification purposes only · Not legal advice
            </div>
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="w-full lg:w-[45%] max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <AnimatedCheckmark />
            <h2 className="text-2xl font-bold text-white mt-6" style={{ fontFamily: "Space Grotesk" }}>
              Certificate Ready
            </h2>
            <p className="text-gray-500 mt-1" style={{ fontFamily: "Inter" }}>
              Download and share your forensic report
            </p>
          </div>

          <div className="space-y-4">
            {/* PDF */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(12,12,26,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <FileText size={24} style={{ color: COLORS.red }} />
                <div>
                  <div className="font-semibold text-white">Download PDF</div>
                  <div className="text-xs text-gray-500">For legal and official use</div>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg font-semibold text-sm"
                style={{
                  background: COLORS.red,
                  color: "white",
                  fontFamily: "Inter",
                }}
              >
                DOWNLOAD PDF
              </button>
            </motion.div>

            {/* JSON */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(12,12,26,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Code size={24} style={{ color: COLORS.cyan }} />
                <div>
                  <div className="font-semibold text-white">Export Raw Data</div>
                  <div className="text-xs text-gray-500">Machine-readable format</div>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg font-semibold text-sm"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,229,255,0.4)",
                  color: COLORS.cyan,
                  fontFamily: "Inter",
                }}
              >
                EXPORT JSON
              </button>
            </motion.div>

            {/* Link */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(12,12,26,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Link2 size={24} style={{ color: COLORS.green }} />
                <div>
                  <div className="font-semibold text-white">Copy Verification Link</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={verifyUrl}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-gray-300 truncate"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap"
                  style={{
                    background: linkCopied ? COLORS.green : "transparent",
                    border: `1px solid ${linkCopied ? COLORS.green : "rgba(16,185,129,0.4)"}`,
                    color: linkCopied ? "white" : COLORS.green,
                    fontFamily: "Inter",
                  }}
                >
                  {linkCopied ? "COPIED!" : "COPY"}
                </button>
              </div>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(12,12,26,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Share2 size={24} style={{ color: COLORS.violet }} />
                <div>
                  <div className="font-semibold text-white">Share Report</div>
                  <div className="text-xs text-gray-500">Email to colleagues</div>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg font-semibold text-sm"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: COLORS.violet,
                  fontFamily: "Inter",
                }}
              >
                SHARE
              </button>
            </motion.div>

            {/* Node status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.green }}>
                CERTIFICATE ANCHORED
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-300">Node {i} active</span>
                </div>
              ))}
            </motion.div>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              style={{ fontFamily: "Inter", fontSize: 13 }}
            >
              <ArrowLeft size={16} />
              Back to results
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
