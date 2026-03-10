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
  const keyBufferRef = useRef("");
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

  const onAnalysisComplete = useCallback(
    (data) => {
      const result = demoMode ? { ...DEMO_ANALYSIS } : data;
      setLastResult(result);
      setScanningFile(null);
      setPage("results");

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

  useEffect(() => {
    const handle = () => {
      document.body.style.animationPlayState = document.hidden ? "paused" : "running";
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "D" || e.key === "d") {
        setDemoMode((m) => !m);
        return;
      }
      const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName);
      if (inInput) return;
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
  }, []);

  const pageContent = useMemo(() => {
    if (scanningFile) {
      return (
        <motion.div key="scanning" {...PAGE_TRANSITION}>
          <Suspense fallback={<PageFallback />}>
            <ScanningPage
              file={scanningFile}
              onComplete={onAnalysisComplete}
              demoMode={demoMode}
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
  ]);

  return (
    <>
      <div className="safezy-scanline" />
      <CustomCursor />
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
          >
            <AnimatePresence mode="wait">{pageContent}</AnimatePresence>
          </AppShell>
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
