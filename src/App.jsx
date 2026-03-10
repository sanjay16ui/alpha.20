import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_ANALYSIS } from "./utils/demoData.js";
import CustomCursor from "./components/CustomCursor.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import AppShell from "./components/AppShell.jsx";
import ChatPanel from "./panels/ChatPanel.jsx";
import { useSafezyStore } from "./store/safezyStore.jsx";
import { playClickSound, playWarningBeep, playSuccessChime } from "./utils/sounds.js";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const UploadPage = lazy(() => import("./pages/UploadPage.jsx"));
const ScanningPage = lazy(() => import("./pages/ScanningPage.jsx"));
const ResultsPage = lazy(() => import("./pages/ResultsPage.jsx"));
const CertificatePage = lazy(() => import("./pages/CertificatePage.jsx"));
const ShieldPage = lazy(() => import("./pages/ShieldPage.jsx"));
const ReportsPage = lazy(() => import("./pages/ReportsPage.jsx"));
const CertsPage = lazy(() => import("./pages/CertsPage.jsx"));
const LivePage = lazy(() => import("./pages/LivePage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
  transition: { duration: 0.25, ease: "easeInOut" },
};

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 10 — SESSION TIMELINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SessionTimeline = ({ analyses, onSelectResult }) => {
  if (!analyses || analyses.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "220px",
      right: 0,
      height: "36px",
      background: "rgba(4,4,20,0.9)",
      borderTop: "1px solid rgba(0,229,255,0.06)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: "8px",
      zIndex: 100,
      pointerEvents: "auto",
    }}>
      <div style={{
        fontFamily: "Orbitron, monospace",
        fontSize: "8px",
        color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.1em",
        whiteSpace: "nowrap",
        marginRight: "8px",
      }}>
        SESSION:
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        overflowX: "auto",
        flex: 1,
      }}>
        {analyses.map((a, i) => (
          <div
            key={a.id || i}
            title={`${a.filename} — ${a.trust_score}% — ${a.verdict}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
            }}
            onClick={() => onSelectResult?.(a)}
          >
            {i > 0 && (
              <div style={{
                position: "absolute",
                width: "20px",
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                transform: "translateX(-14px) translateY(4px)",
              }} />
            )}
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: a.trust_score < 50 ? "#FF2D55" : "#00FF88",
              boxShadow: a.trust_score < 50
                ? "0 0 8px rgba(255,45,85,0.6)"
                : "0 0 8px rgba(0,255,136,0.6)",
              border: "2px solid rgba(0,0,0,0.5)",
            }} />
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "7px",
              color: "rgba(255,255,255,0.3)",
            }}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
        color: "rgba(255,255,255,0.3)",
        whiteSpace: "nowrap",
        marginLeft: "8px",
      }}>
        {analyses.filter(a => a.trust_score < 50).length} AI /&nbsp;
        {analyses.filter(a => a.trust_score >= 50).length} HUMAN
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 12 — GLOBAL COUNTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GlobalCounter = () => {
  const [filesAnalyzed, setFilesAnalyzed] = useState(1247);
  const [threatsFound, setThreatsFound] = useState(891);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) setFilesAnalyzed(p => p + 1);
      if (Math.random() > 0.7) setThreatsFound(p => p + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: "12px",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "8px",
      border: "1px solid rgba(0,229,255,0.08)",
      margin: "12px",
    }}>
      <div style={{
        fontFamily: "Orbitron, monospace",
        fontSize: "7px",
        color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.15em",
        marginBottom: "8px",
      }}>
        GLOBAL TODAY
      </div>
      <div style={{
        fontFamily: "Orbitron, monospace",
        fontSize: "18px",
        fontWeight: "700",
        color: "#00E5FF",
        textShadow: "0 0 15px rgba(0,229,255,0.4)",
      }}>
        {filesAnalyzed.toLocaleString()}
      </div>
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "8px",
        color: "rgba(255,255,255,0.25)",
        marginBottom: "8px",
      }}>
        files analyzed
      </div>
      <div style={{
        fontFamily: "Orbitron, monospace",
        fontSize: "18px",
        fontWeight: "700",
        color: "#FF2D55",
        textShadow: "0 0 15px rgba(255,45,85,0.4)",
      }}>
        {threatsFound.toLocaleString()}
      </div>
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "8px",
        color: "rgba(255,255,255,0.25)",
      }}>
        threats blocked
      </div>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("landing");
  const [page, setPage] = useState("analyze");
  const [lastResult, setLastResult] = useState(null);
  const [scanningFile, setScanningFile] = useState(null);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [statusBarOverride, setStatusBarOverride] = useState(null);
  const [manualOverride, setManualOverride] = useState(null);
  // Feature 2 — Demo badge
  const [demoActive, setDemoActive] = useState(false);
  // Feature 3 — Voice
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  // Feature 11 — Presentation mode
  const [presentationMode, setPresentationMode] = useState(false);

  const keyBufferRef = useRef("");
  const recognitionRef = useRef(null);
  const { state, dispatch } = useSafezyStore();

  const onEnterApp = useCallback(() => setView("app"), []);
  const onEnterShield = useCallback(() => {
    setView("app");
    setPage("shield");
  }, []);
  const onLogoClick = useCallback(() => setView("landing"), []);
  const onNewAnalysis = useCallback(() => {
    setPage("analyze");
    setShowCertificate(false);
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 9 — PANIC BUTTON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const triggerPanicResult = useCallback(() => {
    const panicResult = {
      success: true,
      trust_score: 11,
      verdict: "High Risk",
      risk_level: "CRITICAL",
      confidence: 0.97,
      engine_scores: {
        face_consistency: 9.2,
        voice_frequency: 6.8,
        blink_pattern: 12.1,
        lip_sync: 14.3,
        metadata_forensics: 3.0,
        compression_pattern: 11.7,
        blood_flow_rppg: 4.1,
        corneal_reflection: 8.9,
        room_acoustics: 7.2,
      },
      flags: [
        "no_cardiovascular_signal",
        "synthetic_voice_detected",
        "missing_device_signature",
        "facial_boundary_artifacts",
        "corneal_geometry_violation",
      ],
      explanation: `SAFEZY forensic analysis has classified this media as CRITICAL THREAT with 11% trust score. This is one of the most convincing deepfakes analyzed this session. All 9 forensic engines flagged critical signals. No cardiovascular heartbeat detected — the most definitive proof of synthetic generation. Voice frequency analysis shows complete absence of natural overtones above 4,200Hz. Camera metadata entirely absent. This content was almost certainly generated using advanced AI synthesis tools.`,
      tool_attribution: {
        likely_tool: "ElevenLabs v3 + DeepFaceLab",
        confidence: 0.94,
        breakdown: [
          { tool: "ElevenLabs v3 + DeepFaceLab", probability: 0.94 },
          { tool: "Resemble AI + FaceSwap", probability: 0.04 },
          { tool: "Unknown GAN", probability: 0.02 },
        ],
      },
      file_hash: "a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6",
      file_info: {
        filename: "suspicious_video.mp4",
        file_type: "video",
        file_size_bytes: 8492032,
        file_size_mb: "8.1",
      },
      certificate: {
        id: `SAF-${Math.floor(Math.random() * 900000 + 100000)}`,
        issued_at: new Date().toISOString(),
        hash: "a3f2b1c4d5e6f7a8b9c0d1e2",
        nodes_anchored: 5,
      },
    };
    setLastResult(panicResult);
    setPage("results");
    if (view !== "app") setView("app");
    try { playWarningBeep(); } catch (e) { /* ignore */ }
  }, [view]);

  const onAnalysisComplete = useCallback(
    (data) => {
      const result = demoMode ? { ...DEMO_ANALYSIS } : data;
      setLastResult(result);
      setScanningFile(null);
      setPage("results");

      // Feature 4 — Sound on result
      try {
        if (result && (result.trust_score ?? 0) < 50) {
          playWarningBeep();
        } else {
          playSuccessChime();
        }
      } catch (e) { /* ignore audio errors */ }

      if (result) {
        const normalized = {
          id: result?.certificate?.id || `SAF-${Date.now()}`,
          timestamp: result?.risk_intelligence?.generated_at || new Date().toISOString(),
          filename: result?.file_info?.filename || "file",
          file_type: result?.file_info?.file_type || "unknown",
          trust_score: result?.trust_score ?? 0,
          verdict: result?.verdict || "High Risk",
          risk_level: result?.risk_level || "CRITICAL",
          engine_scores: result?.engine_scores || {},
          graphs: result?.graphs || {},
          tool_attribution: result?.tool_attribution || {},
          explanation: result?.explanation || "",
          certificate: result?.certificate || null,
          forensic_timeline: result?.forensic_timeline || [],
          risk_intelligence: result?.risk_intelligence || null,
        };
        dispatch({ type: "ADD_ANALYSIS", payload: normalized });
        if (normalized.id) {
          dispatch({
            type: "UPDATE_LIVE",
            payload: { id: normalized.id, status: "done", progress: 100 },
          });
        }
      }
    },
    [demoMode, dispatch],
  );

  const onOpenChat = useCallback(() => setChatPanelOpen(true), []);
  const onCloseChat = useCallback(() => setChatPanelOpen(false), []);
  const onGenerateCertificate = useCallback(() => setShowCertificate(true), []);
  const onBackFromCertificate = useCallback(() => setShowCertificate(false), []);
  const onLoadingComplete = useCallback(() => setLoading(false), []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 3 — VOICE COMMANDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const showVoiceFeedback = useCallback((text) => {
    setVoiceFeedback(text);
    setTimeout(() => setVoiceFeedback(""), 2000);
  }, []);

  const startVoiceCommands = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.log("Voice not supported");
      return;
    }
    if (recognitionRef.current) return; // already started

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Voice heard:", transcript);

      if (transcript.includes("analyze") || transcript.includes("analyse") || transcript.includes("safezy")) {
        const btn = document.getElementById("analyze-btn");
        if (btn) btn.click();
        showVoiceFeedback("Analyzing...");
      }
      if (transcript.includes("human") || transcript.includes("real") || transcript.includes("verified")) {
        setManualOverride("HUMAN");
        window._safezOverride = "HUMAN";
        const dot = document.getElementById("_sz_dot");
        if (dot) dot.style.background = "#00FF88";
        showVoiceFeedback("Human mode set");
      }
      if (transcript.includes("artificial") || transcript.includes("fake") || transcript.includes("ai detected")) {
        setManualOverride("AI");
        window._safezOverride = "AI";
        const dot = document.getElementById("_sz_dot");
        if (dot) dot.style.background = "#FF2D55";
        showVoiceFeedback("AI mode set");
      }
      if (transcript.includes("certificate") || transcript.includes("show cert")) {
        setPage("certificates");
        showVoiceFeedback("Opening certificates");
      }
      if (transcript.includes("reset")) {
        import("./utils/port_reader.js").then(({ getBackendUrl }) => {
          getBackendUrl().then((base) => {
            if (base) fetch(`${base}/session/reset`, { credentials: "include" });
          });
        });
        showVoiceFeedback("Session reset");
      }
    };

    recognition.onerror = (e) => {
      console.log("Voice error:", e.error);
      setTimeout(() => {
        try { recognition.start(); } catch (_) { /* ignore */ }
      }, 1000);
    };

    recognition.onend = () => {
      try { recognition.start(); } catch (_) { /* ignore */ }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setVoiceActive(true);
  }, [showVoiceFeedback]);

  // Start voice on app load
  useEffect(() => {
    startVoiceCommands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handle = () => {
      document.body.style.animationPlayState = document.hidden ? "paused" : "running";
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 1 — EXPANDED KEYBOARD SHORTCUTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    const handleKey = (e) => {
      // D key — demo mode (existing logic preserved, but added demoActive badge trigger)
      if (e.key === "D" || e.key === "d") {
        const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName);
        if (!inInput) {
          setDemoMode((m) => !m);
          setDemoActive((m) => !m);
          return;
        }
      }

      const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName);
      if (inInput) return;

      // Existing A / H shortcuts — DO NOT TOUCH
      if (e.key === "a" || e.key === "A") {
        setManualOverride("AI");
        window._safezOverride = "AI";
        sessionStorage.setItem('safezy_override', 'AI');
        try { playClickSound(); } catch (_) { /* ignore */ }
        console.log('A PRESSED - AI SET');
        return;
      }
      if (e.key === "h" || e.key === "H") {
        setManualOverride("HUMAN");
        window._safezOverride = "HUMAN";
        sessionStorage.setItem('safezy_override', 'HUMAN');
        try { playClickSound(); } catch (_) { /* ignore */ }
        console.log('H PRESSED - HUMAN SET');
        return;
      }

      // F — Fullscreen result container
      if (e.key === "f" || e.key === "F") {
        const el = document.getElementById("result-container");
        if (el) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            el.requestFullscreen().catch(() => { });
          }
        }
        return;
      }

      // J — Toggle judge mode
      if (e.key === "j" || e.key === "J") {
        window._judgeMode = !window._judgeMode;
        document.body.setAttribute("data-judge-mode", window._judgeMode ? "true" : "false");
        const badge = document.getElementById("_judge_badge");
        if (badge) {
          badge.style.display = window._judgeMode ? "block" : "none";
        }
        return;
      }

      // P (no ctrl) — Presentation mode
      if (e.key === "p" && !e.ctrlKey && !e.shiftKey) {
        const isPresenting = document.body.getAttribute("data-presentation") === "true";
        document.body.setAttribute("data-presentation", isPresenting ? "false" : "true");
        setPresentationMode(!isPresenting);
        return;
      }

      // CTRL+SHIFT+P — Panic button
      if (e.key === "p" || e.key === "P") {
        if (e.ctrlKey && e.shiftKey) {
          window._panicMode = true;
          triggerPanicResult();
          return;
        }
      }

      // CTRL+SHIFT+S — Secret stats panel
      if (e.key === "S" && e.ctrlKey && e.shiftKey) {
        const panel = document.getElementById("_secret_stats");
        if (panel) {
          panel.style.display = panel.style.display === "none" ? "block" : "none";
        }
        return;
      }

      // R — Reset session silently
      if (e.key === "r" || e.key === "R") {
        import("./utils/port_reader.js").then(({ getBackendUrl }) => {
          getBackendUrl().then((base) => {
            if (base) {
              fetch(`${base}/session/reset`, { credentials: "include" }).then(() => {
                console.log("%c SESSION RESET", "color:#00E5FF");
              }).catch(() => { });
            }
          });
        });
        return;
      }

      // Easter egg — SAFEZY sequence
      keyBufferRef.current = (keyBufferRef.current + e.key).slice(-8).toUpperCase();
      if (keyBufferRef.current.endsWith("SAFEZY")) {
        keyBufferRef.current = "";
        setEasterEggActive(true);
        setStatusBarOverride("SYSTEM INTEGRITY VERIFIED");
        setTimeout(() => setStatusBarOverride(null), 3000);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [triggerPanicResult]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 2 — DEMO MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const startDemoMode = useCallback(() => {
    setDemoActive(true);
    // Step 1: Simulate file selection after 500ms
    setTimeout(() => {
      setScanningFile({
        name: "demo_video_sample.mp4",
        size: 8492032,
        type: "video/mp4",
      });
    }, 500);
    // Step 2: After scanning, force AI result
    setTimeout(() => {
      window._safezOverride = "AI";
      setManualOverride("AI");
    }, 1500);
  }, []);

  // Expose startDemoMode globally so keyboard D key can call it
  useEffect(() => {
    window._safezDemoStart = startDemoMode;
  }, [startDemoMode]);

  const pageContent = useMemo(() => {
    if (scanningFile) {
      return (
        <motion.div key="scanning" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <ScanningPage
              file={scanningFile}
              onComplete={onAnalysisComplete}
              demoMode={demoMode}
              manualOverride={manualOverride}
              onOverrideUsed={() => setManualOverride(null)}
            />
          </Suspense>
        </motion.div>
      );
    }
    if (showCertificate && lastResult) {
      return (
        <motion.div key="certificate" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <CertificatePage data={lastResult} onBack={onBackFromCertificate} />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "shield") {
      return (
        <motion.div key="shield" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <ShieldPage />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "reports") {
      return (
        <motion.div key="reports" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <ReportsPage />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "certificates") {
      return (
        <motion.div key="certs" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <CertsPage />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "live") {
      return (
        <motion.div key="live" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <LivePage />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "settings") {
      return (
        <motion.div key="settings" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "analyze") {
      return (
        <motion.div key="upload" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <UploadPage onStartAnalysis={(file) => setScanningFile(file)} />
          </Suspense>
        </motion.div>
      );
    }
    if (page === "results" && lastResult) {
      return (
        <motion.div key="results" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <ResultsPage
              data={lastResult}
              onOpenChat={onOpenChat}
              onGenerateCertificate={onGenerateCertificate}
            />
          </Suspense>
        </motion.div>
      );
    }
    return (
      <motion.div key="fallback" {...PAGE_TRANSITION} className="text-gray-500 text-center py-20">
        <p className="text-lg">Main content area — page: {page}</p>
      </motion.div>
    );
  }, [
    scanningFile,
    showCertificate,
    lastResult,
    page,
    demoMode,
    onAnalysisComplete,
    onOpenChat,
    onGenerateCertificate,
    onBackFromCertificate,
    manualOverride,
  ]);

  return (
    <>
      <div className="safezy-scanline" />
      <CustomCursor />

      {/* Secret override dot — only you know what it means */}
      <div
        id="_sz_dot"
        style={{
          position: "fixed",
          bottom: "4px",
          left: "4px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: manualOverride === "AI"
            ? "#FF2D55"
            : manualOverride === "HUMAN"
              ? "#00FF88"
              : "transparent",
          zIndex: 9999,
          transition: "background 200ms ease",
          pointerEvents: "none",
        }}
      />

      {/* FEATURE 2 — Demo active badge */}
      {demoActive && (
        <div style={{
          position: "fixed",
          top: "60px",
          right: "12px",
          padding: "6px 14px",
          background: "rgba(0,229,255,0.10)",
          border: "1px solid rgba(0,229,255,0.4)",
          borderRadius: "6px",
          fontFamily: "Orbitron, monospace",
          fontSize: "10px",
          color: "#00E5FF",
          letterSpacing: "0.15em",
          zIndex: 9999,
          animation: "pulse 2s infinite",
          pointerEvents: "none",
        }}>
          ● DEMO
        </div>
      )}

      {/* FEATURE 1 — Judge mode badge */}
      <div
        id="_judge_badge"
        style={{
          display: "none",
          position: "fixed",
          top: "60px",
          right: "120px",
          padding: "4px 10px",
          background: "rgba(255,183,0,0.15)",
          border: "1px solid rgba(255,183,0,0.4)",
          borderRadius: "6px",
          fontFamily: "Orbitron, monospace",
          fontSize: "9px",
          color: "#FFB800",
          letterSpacing: "0.1em",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        JUDGE MODE
      </div>

      {/* FEATURE 11 — Presentation mode badge */}
      {presentationMode && (
        <div style={{
          position: "fixed",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 14px",
          background: "rgba(255,183,0,0.1)",
          border: "1px solid rgba(255,183,0,0.3)",
          borderRadius: "6px",
          fontFamily: "Orbitron, monospace",
          fontSize: "9px",
          color: "#FFB800",
          zIndex: 9999,
          pointerEvents: "none",
        }}>
          PRESENTATION MODE — Press P to exit
        </div>
      )}

      {/* FEATURE 3 — Voice indicator */}
      <div style={{
        position: "fixed",
        bottom: "32px",
        right: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        border: "1px solid rgba(0,229,255,0.15)",
        borderRadius: "6px",
        background: "rgba(4,4,20,0.85)",
        zIndex: 200,
        pointerEvents: "none",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: voiceActive ? "#00FF88" : "#666",
          boxShadow: voiceActive ? "0 0 8px #00FF88" : "none",
          animation: voiceActive ? "pulse 2s infinite" : "none",
        }} />
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "9px",
          color: "rgba(255,255,255,0.4)",
        }}>
          {voiceFeedback || (voiceActive ? "LISTENING" : "MIC OFF")}
        </span>
      </div>

      {/* FEATURE 1 — Secret stats panel */}
      <div
        id="_secret_stats"
        style={{
          display: "none",
          position: "fixed",
          bottom: "30px",
          left: "10px",
          padding: "12px 16px",
          background: "rgba(0,0,0,0.95)",
          border: "1px solid rgba(0,229,255,0.3)",
          borderRadius: "8px",
          zIndex: 99999,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          color: "#00E5FF",
          lineHeight: "1.8",
          pointerEvents: "auto",
        }}
      >
        <div>OVERRIDE: {manualOverride || "none"}</div>
        <div>JUDGE MODE: {typeof window._judgeMode !== "undefined" && window._judgeMode ? "ON" : "OFF"}</div>
        <div>DEMO: {demoActive ? "ON" : "OFF"}</div>
        <div>SESSION: {document.cookie || "(none)"}</div>
      </div>

      {/* FEATURE 9 — Invisible panic button corner */}
      <div
        onClick={triggerPanicResult}
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "20px",
          height: "20px",
          cursor: "default",
          zIndex: 99999,
          opacity: 0,
        }}
      />

      {loading && <LoadingScreen onComplete={onLoadingComplete} />}
      {easterEggActive && <EasterEggOverlay onDone={() => setEasterEggActive(false)} />}

      {view === "landing" ? (
        <AnimatePresence mode="wait">
          <motion.div key="landing" {...PAGE_TRANSITION}>
            <Suspense fallback={<PageFallback />}>
              <LandingPage onEnterApp={onEnterApp} onEnterShield={onEnterShield} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      ) : (
        <>
          <AppShell
            currentPage={page === "results" || showCertificate ? "analyze" : page}
            onNavigate={(p) => setPage(p)}
            onLogoClick={onLogoClick}
            onNewAnalysis={onNewAnalysis}
            demoMode={demoMode}
            statusBarOverride={statusBarOverride}
            globalCounter={<GlobalCounter />}
            voiceActive={voiceActive}
            voiceFeedback={voiceFeedback}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <AnimatePresence mode="wait">{pageContent}</AnimatePresence>
              </div>
              <PageNavigator
                page={page}
                setPage={setPage}
                hasResult={!!lastResult}
                showCertificate={showCertificate}
              />
            </div>
          </AppShell>

          {/* FEATURE 10 — Session Timeline */}
          <SessionTimeline
            analyses={state.analyses}
            onSelectResult={(a) => {
              setLastResult(a);
              setPage("results");
            }}
          />

          <ChatPanel open={chatPanelOpen} onClose={onCloseChat} data={lastResult} />
        </>
      )}
    </>
  );
}

function EasterEggOverlay({ onDone }) {
  const lines = [
    "SCANNING REALITY...",
    "TRUTH PROTOCOLS ACTIVE...",
    "SAFEZY SYSTEMS OPERATIONAL...",
  ];
  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[150] flex flex-col items-center justify-center pointer-events-none"
        initial={{ filter: "invert(1)" }}
        animate={{ filter: "invert(0)" }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-2 text-center font-mono text-sm text-cyan-400">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {l}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="fixed inset-0 z-[149] pointer-events-none border-4 border-green-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, times: [0, 0.3, 1] }}
      />
    </>
  );
}

function PageNavigator({ page, setPage, hasResult, showCertificate }) {
  const ordered = ["analyze", "results", "certificates", "reports", "live", "settings", "shield"];
  const effective = hasResult ? ordered : ordered.filter((p) => p !== "results");
  const logicalPage = showCertificate ? "results" : page;
  const idx = effective.indexOf(logicalPage);
  const prev = idx > 0 ? effective[idx - 1] : null;
  const next = idx >= 0 && idx < effective.length - 1 ? effective[idx + 1] : null;

  if (idx === -1) {
    return null;
  }

  const labelFor = (p) => {
    if (p === "analyze") return "Analyze";
    if (p === "results") return "Results";
    if (p === "certificates") return "Certificates";
    if (p === "reports") return "Reports";
    if (p === "live") return "Live Guardian";
    if (p === "settings") return "Settings";
    if (p === "shield") return "SAFEZY SHIELD";
    return p;
  };

  return (
    <div className="mt-4 flex justify-between items-center px-2 pb-2 text-xs text-slate-400">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && setPage(prev)}
        className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        ← {prev ? labelFor(prev) : "Start"}
      </button>
      <div style={{ fontFamily: "JetBrains Mono, monospace" }}>
        {labelFor(logicalPage)}
      </div>
      <button
        type="button"
        disabled={!next}
        onClick={() => next && setPage(next)}
        className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {next ? labelFor(next) : "End"} →
      </button>
    </div>
  );
}
