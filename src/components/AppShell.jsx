import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FolderOpen,
  Award,
  Radio,
  Settings,
  ExternalLink,
  Code,
  Check,
  AlertTriangle,
  X,
  Info,
  BarChart2,
  Clock,
} from "lucide-react";
import { useSafezyStore } from "../store/safezyStore.jsx";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES & BREADCRUMBS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PAGES = {
  analyze: { id: "analyze", label: "Analyze", breadcrumb: "App / Upload & Analyze" },
  reports: { id: "reports", label: "My Reports", breadcrumb: "App / My Reports" },
  certificates: { id: "certificates", label: "Certificates", breadcrumb: "App / Certificates" },
  live: { id: "live", label: "Live Guardian", breadcrumb: "App / Live Guardian" },
  settings: { id: "settings", label: "Settings", breadcrumb: "App / Settings" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOAST CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AppShell");
  return ctx;
}

const TOAST_ICONS = {
  success: Check,
  warning: AlertTriangle,
  error: X,
  info: Info,
};

const TOAST_STYLES = {
  success: { border: "1px solid rgba(16,185,129,0.5)", icon: COLORS.green },
  warning: { border: "1px solid rgba(245,158,11,0.5)", icon: COLORS.amber },
  error: { border: "1px solid rgba(239,68,68,0.5)", icon: COLORS.red },
  info: { border: "1px solid rgba(0,229,255,0.5)", icon: COLORS.cyan },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFEZY LOGO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SafezyLogo = ({ className = "", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 outline-none cursor-pointer bg-transparent border-none ${className}`}
  >
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path
        d="M14 2L24 8V20L14 26L4 20V8L14 2Z"
        stroke={COLORS.cyan}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M14 6L20 9V17L14 20L8 17V9L14 6Z"
        stroke={COLORS.cyan}
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      <rect
        x="11"
        y="8"
        width="2"
        height="10"
        fill={COLORS.cyan}
        className="appshell-scan-shield"
      />
    </svg>
    <span
      className="font-bold text-white text-xl tracking-[0.08em]"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      SAFEZY
    </span>
  </button>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL BACKGROUND (ORB + DOT GRID)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AppBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: COLORS.void }}>
    <div
      className="absolute -top-[150px] -right-[150px] w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[150px] appshell-orb-1"
      style={{ backgroundColor: COLORS.cyan }}
    />
    <div
      className="absolute -bottom-[100px] -left-[100px] w-[500px] h-[500px] rounded-full opacity-[0.10] blur-[120px] appshell-orb-2"
      style={{ backgroundColor: COLORS.violet }}
    />
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOP BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TopBar = ({ breadcrumb, onNewAnalysis, onLogoClick, backendConnected }) => (
  <header
    className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6"
    style={{
      background: "rgba(3,3,10,0.9)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="w-60 flex-shrink-0">
      <SafezyLogo onClick={onLogoClick} />
    </div>
    <div className="flex-1 flex justify-center">
      <span
        className="text-xs text-gray-500 font-mono"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        {breadcrumb}
      </span>
    </div>
    <div className="w-60 flex-shrink-0 flex items-center justify-end gap-4">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: backendConnected ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: backendConnected ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <span
          className={`w-2 h-2 rounded-full ${backendConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          style={backendConnected ? { animationDuration: "2s" } : {}}
        />
        <span
          className="text-xs"
          style={{
            fontFamily: "Inter",
            color: backendConnected ? COLORS.green : COLORS.red,
          }}
        >
          {backendConnected ? "All Systems Operational" : "Backend Offline"}
        </span>
      </div>
      <div className="w-px h-5 bg-white/10" />
      <button
        type="button"
        onClick={onNewAnalysis}
        className="relative overflow-hidden flex items-center px-5 py-2 rounded-lg cta-new-analysis cursor-pointer"
        style={{
          background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(139,92,246,0.12))",
          border: "1px solid rgba(0,229,255,0.3)",
          color: COLORS.cyan,
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <span className="absolute inset-0 shimmer-overlay" />
        <span className="relative z-10">New Analysis</span>
      </button>
    </div>
  </header>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USE COUNT UP HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useCountUp = (end, duration = 1500, trigger = true) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) requestAnimationFrame(update);
    };
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [end, duration, trigger]);
  return value;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDEBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Sidebar = ({ currentPage, onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const { state } = useSafezyStore();
  useEffect(() => setMounted(true), []);
  const filesCount = useCountUp(state.analyses.length, 1200, mounted);
  const threatsCount = useCountUp(
    state.analyses.filter((a) => a.verdict === "High Risk").length || 0,
    1200,
    mounted,
  );
  const avgTime = useCountUp(12.4, 1200, mounted);

  const analysesCount = state.analyses.length;
  const certsCount = state.settings.autoSaveCerts
    ? state.analyses.filter((a) => a.certificate).length
    : 0;

  const navItems = [
    { id: "analyze", icon: Shield, label: "Analyze", badge: null },
    {
      id: "shield",
      icon: Shield,
      label: "SAFEZY SHIELD",
      badge: "NEW",
      badgeColor: "#FF6B9D",
    },
    { id: "reports", icon: FolderOpen, label: "My Reports", badge: analysesCount || null },
    { id: "certificates", icon: Award, label: "Certificates", badge: certsCount || null },
    {
      id: "live",
      icon: Radio,
      label: "Live Guardian",
      badge: state.liveQueue.length || null,
      badgeColor: COLORS.amber,
    },
    { id: "settings", icon: Settings, label: "Settings", badge: null },
  ];

  return (
    <aside
      className="fixed left-0 top-14 bottom-7 w-[220px] hidden md:block overflow-y-auto"
      style={{
        background: "rgba(7,7,15,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="p-5 pb-4">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})` }}
        />
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-white" style={{ fontFamily: "Inter" }}>
            Analyst
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: "rgba(0,229,255,0.15)",
              color: COLORS.cyan,
              fontFamily: "Inter",
            }}
          >
            PRO
          </span>
        </div>
      </div>

      <div className="px-2 py-2">
        <div
          className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-3"
          style={{ fontFamily: "Inter" }}
        >
          NAVIGATION
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="w-full h-11 rounded-[10px] px-3 flex items-center gap-3 mb-1 transition-all duration-150 cursor-pointer"
              style={{
                background: isActive ? "rgba(0,229,255,0.08)" : "transparent",
                borderLeft: isActive ? `3px solid ${COLORS.cyan}` : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <item.icon
                size={18}
                style={{ color: isActive ? COLORS.cyan : COLORS.gray, flexShrink: 0 }}
              />
              <span
                className="flex-1 text-left text-sm"
                style={{
                  fontFamily: "Inter",
                  color: isActive ? COLORS.white : COLORS.gray,
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: item.badgeColor
                      ? `${item.badgeColor}30`
                      : "rgba(0,229,255,0.2)",
                    color: item.badgeColor || COLORS.cyan,
                    fontFamily: "Inter",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-2 py-4">
        <div
          className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-3"
          style={{ fontFamily: "Inter" }}
        >
          TODAY&apos;S ACTIVITY
        </div>
        <div className="space-y-2 px-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-500">
              <BarChart2 size={14} />
              Files Analyzed Today
            </span>
            <span className="text-white font-medium tabular-nums">
              {Math.round(filesCount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-500">
              <Shield size={14} />
              Threats Caught
            </span>
            <span className="text-white font-medium tabular-nums">
              {Math.round(threatsCount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-500">
              <Clock size={14} />
              Avg Scan Time
            </span>
            <span className="text-white font-medium tabular-nums">{avgTime.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      <div
        className="mx-4 border-t border-white/5 my-4"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      />
      <div className="px-4 space-y-2">
        <a
          href="#"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <ExternalLink size={12} />
          Documentation
        </a>
        <a
          href="#"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <Code size={12} />
          API Reference
        </a>
      </div>
    </aside>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOTTOM TAB BAR (MOBILE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MobileTabBar = ({ currentPage, onNavigate }) => {
  const tabs = [
    { id: "analyze", icon: Shield, label: "Analyze" },
    { id: "reports", icon: FolderOpen, label: "Reports" },
    { id: "certificates", icon: Award, label: "Certs" },
    { id: "live", icon: Radio, label: "Live" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-7 left-0 right-0 h-16 z-50 flex items-center justify-around px-2"
      style={{
        background: "rgba(7,7,15,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all cursor-pointer"
            style={{ color: isActive ? COLORS.cyan : COLORS.gray }}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium" style={{ fontFamily: "Inter" }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOTTOM STATUS BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BottomBar = ({ backendConnected, statusBarOverride }) => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        }) + " UTC"
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-4"
      style={{
        background: "rgba(3,3,10,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        className="text-[11px] text-gray-600"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        SAFEZY v1.0.0
      </span>
      <div className="flex items-center gap-2">
        {statusBarOverride ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span
              className="text-[11px] text-green-500"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {statusBarOverride}
            </span>
          </>
        ) : (
          <>
            <span
              className={`w-1.5 h-1.5 rounded-full ${backendConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className="text-[11px] text-gray-500"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Backend: localhost:8000
            </span>
          </>
        )}
      </div>
      <span
        className="text-[11px] text-gray-500 tabular-nums"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        {time || "—:—:— UTC"}
      </span>
    </footer>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOAST ITEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Toast = ({ id, type, message, onDismiss }) => {
  const Icon = TOAST_ICONS[type] || Info;
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="rounded-xl p-4 flex items-start gap-3"
      style={{
        background: COLORS.elevated,
        border: style.border,
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        width: 320,
      }}
    >
      <Icon size={18} style={{ color: style.icon, flexShrink: 0, marginTop: 2 }} />
      <p className="flex-1 text-sm text-white" style={{ fontFamily: "Inter" }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-gray-500 hover:text-white transition-colors p-0.5"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEYBOARD SHORTCUTS MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ShortcutsModal = ({ onClose }) => {
  useEffect(() => {
    const handle = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const shortcuts = [
    { key: "U", desc: "New Analysis" },
    { key: "R", desc: "View Reports" },
    { key: "C", desc: "Certificates" },
    { key: "L", desc: "Live Guardian" },
    { key: "ESC", desc: "Close panels / go back" },
    { key: "?", desc: "This menu" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="rounded-2xl p-8 max-w-md w-full"
        style={{
          background: COLORS.elevated,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">{s.desc}</span>
              <kbd
                className="px-2.5 py-1 rounded text-xs font-mono"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: COLORS.white,
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP SHELL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AppShell({
  currentPage = "analyze",
  onNavigate,
  onLogoClick,
  onNewAnalysis,
  demoMode = false,
  statusBarOverride = null,
  children,
}) {
  const [backendConnected, setBackendConnected] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const setPage = useCallback(
    (page) => {
      onNavigate?.(page);
    },
    [onNavigate]
  );

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    return () => setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const toastContext = useMemo(
    () => ({
      success: (msg) => addToast("success", msg),
      warning: (msg) => addToast("warning", msg),
      error: (msg) => addToast("error", msg),
      info: (msg) => addToast("info", msg),
    }),
    [addToast]
  );

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch("http://localhost:8000/docs", { method: "HEAD", mode: "cors" });
        setBackendConnected(r.ok);
      } catch {
        setBackendConnected(false);
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

      const k = (e.key || "").toLowerCase();
      if (k === "u") {
        e.preventDefault();
        onNewAnalysis?.();
      } else if (k === "r") {
        e.preventDefault();
        setPage("reports");
      } else if (k === "c") {
        e.preventDefault();
        setPage("certificates");
      } else if (k === "l") {
        e.preventDefault();
        setPage("live");
      } else if (k === "escape") {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onNewAnalysis, setPage]);

  const page = PAGES[currentPage] || PAGES.analyze;
  const breadcrumb = page.breadcrumb;

  return (
    <ToastContext.Provider value={toastContext}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .appshell-scan-shield { animation: appshell-scan 3s ease-in-out infinite; }
        @keyframes appshell-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        @keyframes appshell-orb-1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-20px,30px); }
        }
        @keyframes appshell-orb-2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,-20px); }
        }
        .appshell-orb-1 { animation: appshell-orb-1 25s ease-in-out infinite; }
        .appshell-orb-2 { animation: appshell-orb-2 30s ease-in-out infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .cta-new-analysis:hover .shimmer-overlay { animation: shimmer 0.6s ease-out forwards; }
        .shimmer-overlay { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); width: 50%; pointer-events: none; position: absolute; inset: 0; }
      `}</style>

      <AppBackground />

      {demoMode && (
        <div
          className="fixed top-4 right-4 z-[60] px-3 py-1.5 rounded font-bold"
          style={{
            background: COLORS.amber,
            color: "#000",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
          }}
        >
          DEMO MODE
        </div>
      )}

      <TopBar
        breadcrumb={breadcrumb}
        onNewAnalysis={onNewAnalysis}
        onLogoClick={onLogoClick}
        backendConnected={backendConnected}
      />

      <Sidebar currentPage={currentPage} onNavigate={setPage} />
      <MobileTabBar currentPage={currentPage} onNavigate={setPage} />

      <main
        className="pt-14 pb-24 md:pb-7 md:pl-[220px] min-h-screen"
        style={{ minHeight: "calc(100vh - 84px)" }}
      >
        <div className="p-8 min-h-[calc(100vh-84px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                enter: { duration: 0.2, ease: "easeOut" },
                exit: { duration: 0.15, ease: "easeIn" },
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomBar backendConnected={backendConnected} statusBarOverride={statusBarOverride} />

      <div className="fixed bottom-28 right-4 md:bottom-12 md:right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.slice(-3).map((t) => (
            <Toast
              key={t.id}
              id={t.id}
              type={t.type}
              message={t.message}
              onDismiss={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {shortcutsOpen && (
        <ShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}
    </ToastContext.Provider>
  );
}
