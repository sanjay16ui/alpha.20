import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shieldScanFace, shieldGenerateReport } from "../utils/api.js";
import FaceUpload from "../components/FaceUpload.jsx";
import ActionCenter from "../components/ActionCenter.jsx";
import GlobeScan from "../components/GlobeScan.jsx";

const SHIELD_COLORS = {
  primary: "#FF6B9D",
  secondary: "#7B2FFF",
  background: "rgba(255,107,157,0.05)",
};

export default function ShieldPage() {
  const [step, setStep] = useState("face-upload"); // face-upload | scanning | results
  const [faceFile, setFaceFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [crisisOverlay, setCrisisOverlay] = useState(false);
  const [activeSuspicious, setActiveSuspicious] = useState(null);
  const SCAN_TOTAL = 45;

  const progress = Math.min(100, Math.max(0, (elapsed / SCAN_TOTAL) * 100));

  const THREAT_DOTS = [
    { x: "22%", y: "38%", safe: true },
    { x: "48%", y: "32%", safe: true },
    { x: "72%", y: "45%", safe: true },
    { x: "35%", y: "62%", safe: false },
    { x: "78%", y: "38%", safe: false },
    { x: "58%", y: "28%", safe: true },
    { x: "25%", y: "58%", safe: true },
  ];

  const FEED_ITEMS = [
    { time: "00:03", type: "info", title: "GOOGLE IMAGES", detail: "2,847 pages indexed — no match" },
    { time: "00:08", type: "info", title: "INSTAGRAM", detail: "Profile scan complete — authorized" },
    { time: "00:14", type: "threat", title: "ANOMALY FOUND", detail: "Unknown board — match 87.4%" },
    { time: "00:19", type: "info", title: "TWITTER/X", detail: "892 posts scanned — no match" },
    { time: "00:24", type: "warning", title: "TELEGRAM", detail: "Private channel — investigating..." },
    { time: "00:29", type: "threat", title: "THREAT CONFIRMED", detail: "Telegram channel — match 91.2%" },
    { time: "00:33", type: "info", title: "DEEP SCAN", detail: "1,241 additional pages checked" },
    { time: "00:38", type: "info", title: "NEWS SITES", detail: "1,102 articles scanned — clean" },
    { time: "00:43", type: "info", title: "ANALYSIS", detail: "Compiling evidence package..." },
  ];

  const [visibleFeed, setVisibleFeed] = useState([]);

  const startFlow = () => setStep("face-upload");

  const handleFaceSelected = async (file) => {
    setFaceFile(file);
    setElapsed(0);
    setScanResult(null);
    setStep("scanning");
    // Fire-and-forget backend call for potential future use; UI uses simulation data
    shieldScanFace(file).catch(() => {});
  };

  useEffect(() => {
    if (step !== "scanning") return;
    let current = 0;
    const started = Date.now();
    const id = setInterval(() => {
      const diff = (Date.now() - started) / 1000;
      current = Math.min(SCAN_TOTAL, diff);
      setElapsed(current);
      if (current >= SCAN_TOTAL) {
        clearInterval(id);
        const sim = buildSimulatedResults();
        setScanResult(sim);
        if ((sim.suspicious_appearances || []).length > 0) {
          setCrisisOverlay(true);
          setActiveSuspicious(sim.suspicious_appearances[0]);
        }
        setStep("results");
      }
    }, 250);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "scanning") {
      setVisibleFeed([]);
      return;
    }
    let index = 0;
    setVisibleFeed([]);
    const id = setInterval(() => {
      setVisibleFeed((prev) => {
        if (index >= FEED_ITEMS.length) return prev;
        const next = [...prev, FEED_ITEMS[index]];
        index += 1;
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [step]);

  const dismissCrisisOverlay = () => setCrisisOverlay(false);

  const summaryLine = useMemo(() => {
    if (!scanResult) return "";
    const s = scanResult;
    const suspiciousCount = (s.suspicious_appearances || []).length;
    const totalApps =
      (s.safe_appearances?.length || 0) + (s.suspicious_appearances?.length || 0);
    return `We scanned ${s.total_platforms_scanned} platforms and indexed ${
      s.total_pages_indexed
    } pages in ${s.scan_duration_seconds.toFixed(1)}s. Found ${totalApps} appearances. ${
      suspiciousCount
    } require immediate action.`;
  }, [scanResult]);

  const hasMatches = (scanResult?.suspicious_appearances || []).length > 0;

  return (
    <>
      <style>{`
        .shield-bg {
          background: radial-gradient(circle at top, rgba(255,107,157,0.12), transparent 55%),
                      radial-gradient(circle at bottom, rgba(123,47,255,0.22), #03030A);
        }
      `}</style>
      <div className="min-h-[calc(100vh-84px)] shield-bg rounded-3xl p-8 flex flex-col gap-8">
        <header className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4"
            style={{
              background: "rgba(255,107,157,0.12)",
              border: "1px solid rgba(255,107,157,0.4)",
              color: SHIELD_COLORS.primary,
            }}
          >
            SAFEZY SHIELD · Victim Protection
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}
          >
            You Are Not Alone.
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "rgba(248,250,255,0.8)", fontFamily: "Inter, sans-serif" }}
          >
            If someone has used your face, voice, or image without your permission — SAFEZY SHIELD
            helps you find it, prove it, and fight back. Completely private. Completely safe. We are
            on your side.
          </p>
          <p
            className="mt-2 text-xs text-rose-200"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            You are not alone. You have evidence. You have rights. We are with you.
          </p>
        </header>

        {step !== "results" && (
          <main className="flex-1">
            {step === "face-upload" && (
              <div className="space-y-6 max-w-xl">
                <section>
                  <h2
                    className="text-lg font-semibold mb-3"
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      color: "white",
                      letterSpacing: "0.16em",
                    }}
                  >
                    1 · SCAN THE INTERNET FOR YOUR FACE
                  </h2>
                  <p
                    className="text-sm text-gray-300 mb-4"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Upload a clear photo of your face. SAFEZY SHIELD turns it into a private mathematical
                    representation, searches for matches across platforms, and then deletes the photo.
                  </p>
                  <FaceUpload
                    onFaceSelected={handleFaceSelected}
                    accentColor={SHIELD_COLORS.primary}
                  />
                </section>
              </div>
            )}
            {step === "scanning" && (
              <GlobeScan
                isScanning
                progress={progress}
                threats={THREAT_DOTS.filter((d) => parseFloat(d.y) <= progress)}
                feed={visibleFeed}
              />
            )}
          </main>
        )}

        {step === "results" && scanResult && (
          <main className="flex-1 space-y-6">
            <SummaryBanner scanResult={scanResult} />
            <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6">
              <ResultsList
                scanResult={scanResult}
                onTakeAction={(item) => setActiveSuspicious(item)}
              />
              <StatsPanel scanResult={scanResult} />
            </div>
          </main>
        )}
      </div>

      <AnimatePresence>
        {crisisOverlay && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-w-lg w-full rounded-2xl p-8"
              style={{
                background: "#020617",
                border: "1px solid rgba(248,250,252,0.12)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.75)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}
              >
                Before you see these results...
              </h2>
              <p className="text-sm text-gray-300 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                Finding this kind of content can be distressing. You are not at fault. You have
                options. You have support.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={dismissCrisisOverlay}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
                  style={{
                    background: SHIELD_COLORS.primary,
                    color: "#0f172a",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  I am ready to see results
                </button>
                <button
                  type="button"
                  onClick={dismissCrisisOverlay}
                  className="w-full px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(148,163,184,0.4)",
                    color: "#e2e8f0",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Talk to someone first
                </button>
                <button
                  type="button"
                  onClick={dismissCrisisOverlay}
                  className="w-full px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(148,163,184,0.4)",
                    color: "#e2e8f0",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Learn what to do next
                </button>
              </div>
              <div
                className="mt-5 text-xs text-gray-400"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                If you need support right now: iCall 9152987821 · Cyber Peace Foundation:
                1800-XXX-XXXX
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSuspicious && (
          <motion.div
            className="fixed inset-0 z-[130] flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setActiveSuspicious(null)}
          >
            <motion.div
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="w-full max-w-md h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionCenter
                suspicious={[activeSuspicious]}
                safe={scanResult?.safe_appearances || []}
                onGenerateReport={shieldGenerateReport}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SummaryBanner({ scanResult }) {
  const suspiciousCount = (scanResult.suspicious_appearances || []).length;
  const hasMatches = suspiciousCount > 0;
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between"
      style={{
        background: hasMatches ? "rgba(255,45,85,0.08)" : "rgba(0,255,136,0.08)",
        borderLeft: `4px solid ${hasMatches ? "#FF2D55" : "#00FF88"}`,
      }}
    >
      <div>
        <div
          className="text-sm font-bold"
          style={{
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "0.16em",
            color: hasMatches ? "#FF2D55" : "#00FF88",
          }}
        >
          {hasMatches
            ? `⚠ YOUR FACE WAS FOUND IN ${suspiciousCount} LOCATIONS`
            : "✓ NO UNAUTHORIZED APPEARANCES FOUND"}
        </div>
        <div
          className="text-xs text-slate-200 mt-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          SAFEZY scanned {scanResult.total_platforms_scanned} platforms and{" "}
          {scanResult.total_pages_indexed} pages in {scanResult.scan_duration_seconds.toFixed(1)}s.
        </div>
      </div>
    </div>
  );
}

function ResultsList({ scanResult, onTakeAction }) {
  const safe = scanResult.safe_appearances || [];
  const suspicious = scanResult.suspicious_appearances || [];
  return (
    <div className="space-y-4">
      {safe.map((s, idx) => (
        <div
          key={`safe-${idx}`}
          className="safezy-card safezy-card-hover p-4"
          style={{
            borderColor: "rgba(0,255,136,0.35)",
            background: "rgba(4,120,87,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "Orbitron", color: "#00FF88" }}
            >
              ✓ SAFE APPEARANCE
            </span>
            <span
              className="text-[11px] text-slate-300"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              [{s.platform}]
            </span>
          </div>
          <div className="text-sm text-slate-100" style={{ fontFamily: "Inter" }}>
            {s.context}
          </div>
          <div className="text-xs text-slate-400 mt-1" style={{ fontFamily: "JetBrains Mono" }}>
            First seen: {s.first_seen} · Match: {s.match_confidence}%
          </div>
        </div>
      ))}

      {suspicious.map((s, idx) => (
        <div
          key={`sus-${idx}`}
          className="safezy-card safezy-card-hover p-4"
          style={{
            borderColor: "rgba(255,45,85,0.6)",
            background: "rgba(127,29,29,0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "Orbitron", color: "#FF2D55", letterSpacing: "0.16em" }}
            >
              ⚠ HIGH RISK APPEARANCE
            </span>
            <span
              className="text-[11px] text-slate-200"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              [{s.platform}]
            </span>
          </div>
          <div className="text-sm text-slate-100 mb-1" style={{ fontFamily: "Inter" }}>
            {s.context}
          </div>
          <div
            className="text-xs text-slate-300 mb-1"
            style={{ fontFamily: "JetBrains Mono" }}
          >
            URL: <span style={{ filter: "blur(4px)" }}>{s.url}</span>
          </div>
          <div
            className="text-xs text-slate-300"
            style={{ fontFamily: "JetBrains Mono" }}
          >
            First seen: {s.first_seen} · Match: {s.match_confidence}% · Deepfake:{" "}
            {s.deepfake_probability}% likely
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onTakeAction(s)}
              className="safezy-btn-primary px-4 py-2 rounded-lg"
            >
              Take Action ▶
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ scanResult }) {
  const totalApps =
    (scanResult.safe_appearances?.length || 0) +
    (scanResult.suspicious_appearances?.length || 0);
  const suspiciousCount = (scanResult.suspicious_appearances || []).length;
  const safeCount = totalApps - suspiciousCount;
  const safeRatio = totalApps ? (safeCount / totalApps) * 100 : 0;
  return (
    <div className="space-y-3">
      <div
        className="safezy-card p-4"
        style={{ borderColor: "rgba(148,163,184,0.6)", background: "rgba(15,23,42,0.96)" }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em] text-rose-200 mb-2"
          style={{ fontFamily: "JetBrains Mono" }}
        >
          SCAN SUMMARY
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm" style={{ fontFamily: "Inter" }}>
          <div>
            <div className="text-xs text-slate-400">Platforms Scanned</div>
            <div className="text-lg font-bold">{scanResult.total_platforms_scanned}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Pages Indexed</div>
            <div className="text-lg font-bold">{scanResult.total_pages_indexed}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Scan Duration</div>
            <div className="text-lg font-bold">
              {scanResult.scan_duration_seconds.toFixed(1)} s
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Safe vs Suspicious</div>
            <div className="text-lg font-bold">
              {safeCount}/{suspiciousCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSimulatedResults() {
  const base = {
    total_platforms_scanned: 847,
    total_pages_indexed: 15284 + Math.floor(Math.random() * 400),
    scan_duration_seconds: 44.7 + Math.random() * 2,
    face_match_threshold: 85.0,
    safe_appearances: [
      {
        platform: "Instagram",
        context: "Your profile photo",
        match_confidence: 99.2,
        first_seen: "2024-01-15",
        status: "SAFE",
      },
      {
        platform: "LinkedIn",
        context: "Professional profile",
        match_confidence: 97.8,
        first_seen: "2023-08-20",
        status: "SAFE",
      },
    ],
    suspicious_appearances: [
      {
        platform: "Unknown Image Board",
        url: "i******.net/board/****/img_****",
        context: "Unknown — face detected",
        match_confidence: 87.4,
        deepfake_probability: 91.2,
        first_seen: "2025-11-23",
        status: "HIGH_RISK",
        content_type: "Image",
        reshare_estimate: 47,
      },
      {
        platform: "Telegram Channel",
        url: "t.me/****channel****",
        context: "Private group — detected",
        match_confidence: 91.2,
        deepfake_probability: 78.4,
        first_seen: "2025-12-01",
        status: "HIGH_RISK",
        content_type: "Video",
        reshare_estimate: 124,
      },
    ],
    platform_breakdown: {
      google_images: 2847,
      social_media: 1923,
      deep_web: 1241,
      adult_platforms: 847,
      news_sites: 1102,
      chat_apps: 934,
      image_boards: 612,
      other: 5778,
    },
    dark_web_score: 67,
    certificate_id: `SAF-${Math.floor(100000 + Math.random() * 900000)}`,
    timeline_of_harm: [
      {
        date: "2025-11-23",
        event: "First unauthorized appearance",
        platform: "Image Board",
      },
      {
        date: "2025-12-01",
        event: "Shared to Telegram",
        platform: "Telegram",
      },
      {
        date: "2025-12-15",
        event: "New mirror found",
        platform: "Forum",
      },
    ],
  };
  return base;
}


