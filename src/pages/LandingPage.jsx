import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  DollarSign,
  Vote,
  User,
  CloudUpload,
  Cpu,
  Award,
  Activity,
  Lock,
  FileCheck,
  Radio,
  LayoutGrid,
  Code,
  Camera,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const COLORS = {
  void: "#03030A",
  deep: "#07070F",
  surface: "#0C0C1A",
  elevated: "#111125",
  border: "rgba(255,255,255,0.06)",
  borderLit: "rgba(0,229,255,0.25)",
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#F8FAFF",
  gray: "#64748B",
};

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
];

const tickerText =
  "$25M STOLEN VIA DEEPFAKE VIDEO CALL  ●  DEEPFAKE ELECTION VIDEOS AFFECTING MILLIONS  ●  AI VOICE CLONES BYPASSING BANK SECURITY  ●  SYNTHETIC MEDIA CRIMES UP 900% SINCE 2023  ●";

const incidentCards = [
  {
    color: COLORS.red,
    icon: DollarSign,
    amount: "$25,000,000",
    title: "Stolen in one deepfake video call.",
    desc: "Hong Kong, 2024. CFO's face cloned. Employee transferred funds.",
    source: "Reuters, Feb 2024",
  },
  {
    color: COLORS.amber,
    icon: Vote,
    amount: "3 Elections",
    title: "Affected by AI-generated audio",
    desc: "of political candidates in 2024. Millions of voters misled.",
    source: "MIT Technology Review",
  },
  {
    color: COLORS.violet,
    icon: User,
    amount: "96,000+",
    title: "Women victimized by deepfake",
    desc: "intimate imagery. No tool existed to prove the media was fake.",
    source: "Sensity AI Report",
  },
];

const steps = [
  {
    num: "01",
    icon: CloudUpload,
    color: COLORS.cyan,
    title: "Upload Your File",
    desc: "Drop any video, image, or audio. MP4, MOV, JPG, PNG, MP3 supported. Max 500MB. Processed locally.",
  },
  {
    num: "02",
    icon: Cpu,
    color: COLORS.violet,
    title: "9 Engines Analyze It",
    desc: "Face geometry, voice frequencies, blood flow patterns, metadata forensics, physics laws — all checked simultaneously.",
  },
  {
    num: "03",
    icon: Award,
    color: COLORS.green,
    title: "Get Your Truth Report",
    desc: "Trust score, AI explanation in plain English, court-ready certificate. Know exactly what is real.",
  },
];

const featureCards = [
  {
    icon: Activity,
    title: "Heartbeat Detection",
    body: "Detects if a human heartbeat is present in facial tissue. AI faces have no pulse.",
    badge: "EXCLUSIVE",
    borderColor: "from-[#00E5FF] to-[#8B5CF6]",
  },
  {
    icon: Lock,
    title: "Runs Completely Offline",
    body: "Ollama Mistral runs on your machine. Zero data transmitted. Your files never leave your device.",
    badge: "PRIVATE",
    borderColor: "from-[#10B981] to-[#00E5FF]",
  },
  {
    icon: FileCheck,
    title: "Court-Ready Certificates",
    body: "RFC 3161 legal timestamping. Already accepted in EU and US courts as supporting evidence.",
    badge: "LEGAL",
    borderColor: "from-[#10B981] to-[#8B5CF6]",
  },
  {
    icon: Radio,
    title: "Live Call Guardian",
    body: "Monitors video calls in real-time. Flags synthetic voices within 3 seconds of speaking.",
    badge: "REAL-TIME",
    borderColor: "from-[#00E5FF] to-[#10B981]",
  },
  {
    icon: LayoutGrid,
    title: "9 Simultaneous Signals",
    body: "Not just face detection. Voice, metadata, compression, physics — full forensic sweep.",
    badge: "ACCURATE",
    borderColor: "from-[#8B5CF6] to-[#00E5FF]",
  },
  {
    icon: Code,
    title: "Developer API",
    body: "Three lines of code to integrate. RESTful JSON API. Connect your app to truth infrastructure.",
    badge: "API",
    borderColor: "from-[#64748B] to-[#00E5FF]",
  },
];

const engineBars = [
  { label: "Face Check", value: 31 },
  { label: "Voice Analysis", value: 12 },
  { label: "Metadata", value: 61 },
  { label: "Blink Pattern", value: 19 },
  { label: "rPPG", value: 8 },
  { label: "Compression", value: 54 },
  { label: "Physics", value: 22 },
  { label: "Lip Sync", value: 11 },
  { label: "Audio Freq", value: 67 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED BACKGROUND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const HeroBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Layer 1: Void base */}
    <div className="absolute inset-0 bg-[#03030A]" />

    {/* Layer 2: Aurora orbs */}
    <div
      className="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[120px] animate-aurora-orb-a"
      style={{ backgroundColor: COLORS.cyan }}
    />
    <div
      className="absolute -bottom-[150px] -left-[150px] w-[600px] h-[600px] rounded-full opacity-[0.10] blur-[100px] animate-aurora-orb-b"
      style={{ backgroundColor: COLORS.violet }}
    />

    {/* Layer 3: Particle field */}
    <div className="absolute inset-0">
      {Array.from({ length: 60 }, (_, i) => {
        const left = ((i * 17) % 97) + 1;
        const top = ((i * 23) % 93) + 2;
        const opacity = 0.2 + ((i % 5) / 5) * 0.4;
        const drift = (i % 6) + 1;
        const duration = 15 + (i % 20);
        return (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              opacity,
              animation: `particle-drift-${drift} ${duration}s linear infinite`,
            }}
          />
        );
      })}
    </div>

    {/* Layer 4: Grid overlay */}
    <div
      className="absolute inset-0 opacity-100"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }}
    />

    {/* Layer 5: Scan line — 1px horizontal line, gradient, animates top to bottom */}
    <div
      className="absolute left-0 right-0 top-0 h-px opacity-[0.15] pointer-events-none scan-line"
      style={{
        background: "linear-gradient(90deg, transparent, #00E5FF 50%, transparent)",
      }}
    />
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG LOGO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SafezyLogo = ({ className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
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
        className="animate-scan-shield"
      />
    </svg>
    <span
      className="font-bold text-white text-xl tracking-[0.08em]"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      SAFEZY
    </span>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUNT UP HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useCountUp = (end, duration = 2000, startOnView = true) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startOnView || inView) {
      let start = 0;
      const endVal = typeof end === "string" ? parseFloat(end.replace(/[^0-9.]/g, "")) : end;
      const suffix = typeof end === "string" ? end.replace(/[0-9.]/g, "") : "";
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (endVal - start) * eased;
        setValue(current);
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }
  }, [end, duration, inView, startOnView]);

  return { ref, value };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO CARD (with looping animation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DemoCard = () => {
  const [phase, setPhase] = useState(0);
  const [trustScore, setTrustScore] = useState(0);
  const barsAnimated = useRef(false);
  const gaugeAnimated = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % 2);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let v = 0;
      const iv = setInterval(() => {
        v += 1;
        setTrustScore(v);
        if (v >= 23) {
          clearInterval(iv);
          barsAnimated.current = true;
          gaugeAnimated.current = true;
        }
      }, 50);
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 1) {
      setTrustScore(0);
      barsAnimated.current = false;
      gaugeAnimated.current = false;
      const timer = setTimeout(() => {
        let v = 0;
        const iv = setInterval(() => {
          v += 1;
          setTrustScore(v);
          if (v >= 23) clearInterval(iv);
        }, 50);
      }, 1000);
    }
  }, [phase]);

  return (
    <motion.div
      className="relative w-[340px] flex-shrink-0 rounded-[20px] p-6 overflow-hidden"
      style={{
        background: "rgba(12,12,26,0.9)",
        border: "1px solid rgba(0,229,255,0.15)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
      }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Traffic lights */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-[10px] text-gray-500 font-mono">safezy — analysis</span>
      </div>

      {/* File info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <Camera size={14} />
        <span className="font-mono">deepfake_sample.mp4</span>
        <span className="text-gray-500 text-xs">24.7MB</span>
      </div>

      {/* Gauge */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (23 / 100) * 283 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
            {trustScore}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Trust Score</span>
        </div>
      </div>

      {/* Engine bars */}
      <div className="space-y-2 mb-4">
        {engineBars.slice(0, 5).map((bar, i) => (
          <div key={bar.label} className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-24 truncate">{bar.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${bar.value}%`,
                  background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.violet})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
              />
            </div>
            <span className="text-gray-400 w-8 text-right">{bar.value}%</span>
          </div>
        ))}
      </div>

      {/* Verdict pill */}
      <motion.div
        className="flex justify-center"
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium"
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: COLORS.red,
          }}
        >
          ⚠ HIGH RISK — DEEPFAKE
        </span>
      </motion.div>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LandingPage({ onEnterApp }) {
  const stat1 = useCountUp("2.8", 1500);
  const stat2 = useCountUp("91.2", 1500);
  const stat3 = useCountUp("2.1", 1500);

  const problemRef = useRef(null);
  const problemInView = useInView(problemRef, { once: true, amount: 0.2 });
  const howRef = useRef(null);
  const howInView = useInView(howRef, { once: true, amount: 0.2 });
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --void: #03030A;
          --deep: #07070F;
          --surface: #0C0C1A;
          --elevated: #111125;
          --border: rgba(255,255,255,0.06);
          --border-lit: rgba(0,229,255,0.25);
          --cyan: #00E5FF;
          --violet: #8B5CF6;
          --green: #10B981;
          --amber: #F59E0B;
          --red: #EF4444;
          --white: #F8FAFF;
          --gray: #64748B;
        }

        html { scroll-behavior: smooth; }

        @keyframes aurora-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, 40px) scale(1.05); }
          50% { transform: translate(20px, -30px) scale(0.95); }
          75% { transform: translate(-20px, -40px) scale(1.02); }
        }
        @keyframes aurora-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.03); }
          66% { transform: translate(-40px, 30px) scale(0.97); }
        }
        .animate-aurora-orb-a { animation: aurora-orb-a 20s ease-in-out infinite; will-change: transform; }
        .animate-aurora-orb-b { animation: aurora-orb-b 25s ease-in-out infinite; will-change: transform; }

        @keyframes particle-drift-1 { 0% { transform: translate(0,0); } 100% { transform: translate(20px,-30px); } }
        @keyframes particle-drift-2 { 0% { transform: translate(0,0); } 100% { transform: translate(-15px,25px); } }
        @keyframes particle-drift-3 { 0% { transform: translate(0,0); } 100% { transform: translate(25px,15px); } }
        @keyframes particle-drift-4 { 0% { transform: translate(0,0); } 100% { transform: translate(-25px,-20px); } }
        @keyframes particle-drift-5 { 0% { transform: translate(0,0); } 100% { transform: translate(10px,35px); } }
        @keyframes particle-drift-6 { 0% { transform: translate(0,0); } 100% { transform: translate(-30px,10px); } }

        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .scan-line {
          animation: scan-line 8s linear infinite;
        }
        @keyframes scan-shield {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        .animate-scan-shield { animation: scan-shield 3s ease-in-out infinite; }

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .cta-primary:hover .shimmer-overlay {
          animation: shimmer 0.6s ease-out forwards;
        }
        .shimmer-overlay {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          width: 50%;
          pointer-events: none;
        }
      `}</style>

      <HeroBackground />

      {/* ━━━ NAVBAR ━━━ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-8 md:px-12"
        style={{
          background: "rgba(3,3,10,0.7)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <a href="#home" className="flex items-center">
          <SafezyLogo />
        </a>
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onEnterApp?.()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: "transparent",
            border: "1px solid rgba(0,229,255,0.4)",
            color: COLORS.cyan,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.cyan;
            e.currentTarget.style.color = "#03030A";
            e.currentTarget.style.boxShadow = "0 0 24px rgba(0,229,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = COLORS.cyan;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Try It Free
        </button>
      </nav>

      {/* ━━━ SECTION 1: HERO ━━━ */}
      <section
        id="home"
        className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 relative"
      >
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Step 1: Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"
                style={{ animationDuration: "1.5s" }}
              />
              <span
                className="text-[11px] tracking-[0.15em] uppercase"
                style={{ fontFamily: "JetBrains Mono, monospace", color: COLORS.cyan }}
              >
                DEEPFAKE DETECTION TECHNOLOGY
              </span>
            </motion.div>

            {/* Step 2: Headlines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6"
            >
              <h1
                className="text-5xl md:text-6xl lg:text-[72px] font-bold leading-tight"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <span style={{ color: COLORS.gray }}>The Internet</span>
                <br />
                <span style={{ color: COLORS.white }}>
                  Is{" "}
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="inline-block"
                    style={{ color: COLORS.cyan }}
                  >
                    <motion.span
                      animate={{ x: [0, -3, 3, 0] }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      Lying
                    </motion.span>
                  </motion.span>{" "}
                  To You.
                </span>
              </h1>
            </motion.div>

            {/* Step 3: Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-lg md:text-xl max-w-[560px] leading-relaxed mb-8"
              style={{ color: COLORS.gray, fontFamily: "Inter, sans-serif" }}
            >
              SAFEZY detects deepfakes, fake images, and synthetic voices with forensic precision.
              Upload anything. Know the truth in 15 seconds.
            </motion.p>

            {/* Step 4: CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12"
            >
              <motion.button
                type="button"
                onClick={() => onEnterApp?.()}
                className="relative overflow-hidden px-9 py-4 rounded-xl font-bold text-base text-white flex items-center gap-2 cta-primary"
                style={{
                  background: "linear-gradient(135deg, #00E5FF, #8B5CF6)",
                  boxShadow: "0 0 40px rgba(0,229,255,0.3)",
                  fontFamily: "Inter, sans-serif",
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 60px rgba(0,229,255,0.4)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 shimmer-overlay" />
                <span className="relative z-10">Analyze Media Now →</span>
              </motion.button>
              <motion.a
                href="#how-it-works"
                className="px-9 py-4 rounded-xl font-semibold text-base text-white flex items-center gap-2"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontFamily: "Inter, sans-serif",
                }}
                whileHover={{
                  borderColor: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Watch Demo ▶
              </motion.a>
            </motion.div>

            {/* Step 5: Trust stats */}
            <motion.div
              ref={stat1.ref}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.6 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start"
            >
              <div>
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: "Space Grotesk", color: COLORS.cyan }}
                >
                  {stat1.value.toFixed(1)}M+
                </div>
                <div className="text-sm text-gray-500">Files Analyzed</div>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div>
                <div
                  className="text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {stat2.value.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Detection Accuracy</div>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div>
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: "Space Grotesk", color: COLORS.violet }}
                >
                  ${stat3.value.toFixed(1)}B
                </div>
                <div className="text-sm text-gray-500">Fraud Prevented</div>
              </div>
            </motion.div>
          </div>

          {/* Demo card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="hidden lg:block"
          >
            <DemoCard />
          </motion.div>
        </div>

        {/* Mobile demo card below */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 lg:hidden"
        >
          <DemoCard />
        </motion.div>
      </section>

      {/* ━━━ SECTION 2: PROBLEM TICKER + CARDS ━━━ */}
      <section id="problem">
        <div
          className="h-12 flex items-center overflow-hidden"
          style={{ background: COLORS.cyan }}
        >
          <div
            className="flex whitespace-nowrap text-white text-[13px] font-mono animate-[ticker-scroll_25s_linear_infinite]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            <span className="pr-16">{tickerText}</span>
            <span className="pr-16">{tickerText}</span>
          </div>
        </div>

        <div
          ref={problemRef}
          className="py-[120px] px-6"
          style={{ background: COLORS.deep }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {incidentCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="rounded-2xl p-8 relative group cursor-default"
                style={{
                  background: COLORS.surface,
                  border: "1px solid var(--border)",
                  borderTop: `3px solid ${card.color}`,
                }}
                whileHover={{ y: -4, boxShadow: `0 0 0 1px ${card.color}40` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${card.color}20` }}
                >
                  <card.icon size={24} style={{ color: card.color }} />
                </div>
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "Space Grotesk", color: card.color }}
                >
                  {card.amount}
                </div>
                <div className="text-white font-medium mb-1">{card.title}</div>
                <div className="text-gray-500 text-sm mb-4">{card.desc}</div>
                <div className="text-xs text-gray-600">Source: {card.source}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 3: HOW IT WORKS ━━━ */}
      <section
        id="how-it-works"
        ref={howRef}
        className="py-[120px] px-6"
        style={{ background: COLORS.void }}
      >
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
          >
            <span className="text-[11px] tracking-[0.15em] font-mono" style={{ color: COLORS.cyan }}>
              HOW SAFEZY WORKS
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Three Steps to Truth
          </motion.h2>
        </div>

        <div className="max-w-5xl mx-auto space-y-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              animate={howInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="flex-1 relative">
                <span
                  className="absolute -top-4 left-0 text-[200px] font-bold opacity-[0.04]"
                  style={{ fontFamily: "Space Grotesk", color: "white" }}
                >
                  {step.num}
                </span>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${step.color}20` }}
                >
                  <step.icon size={28} style={{ color: step.color }} />
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block w-24 border-t-2 border-dashed border-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━ SECTION 4: FEATURES ━━━ */}
      <section
        id="features"
        ref={featuresRef}
        className="py-[120px] px-6"
        style={{ background: COLORS.deep }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
            style={{ fontFamily: "Space Grotesk" }}
          >
            What Makes SAFEZY Different
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 relative group cursor-default"
                style={{
                  background: COLORS.surface,
                  border: "1px solid var(--border)",
                }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <span
                  className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${card.borderColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <span
                  className="absolute top-4 right-4 text-[10px] font-mono tracking-wider opacity-60"
                  style={{ color: COLORS.cyan }}
                >
                  {card.badge}
                </span>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5">
                  <card.icon size={24} style={{ color: COLORS.cyan }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>
                  {card.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 5: FINAL CTA ━━━ */}
      <section
        id="demo"
        className="py-[120px] px-6 text-center"
        style={{ background: COLORS.surface }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ fontFamily: "Space Grotesk" }}
        >
          <span style={{ color: COLORS.white }}>Stop Guessing.</span>
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold mb-6"
          style={{ fontFamily: "Space Grotesk", color: COLORS.cyan }}
        >
          Start Knowing.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-lg max-w-xl mx-auto mb-10"
          style={{ fontFamily: "Inter" }}
        >
          Join thousands of journalists, lawyers, and security professionals who verify before they
          trust.
        </motion.p>
        <motion.button
          type="button"
          onClick={() => onEnterApp?.()}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden px-12 py-5 rounded-xl font-bold text-lg text-white cta-primary"
          style={{
            background: "linear-gradient(135deg, #00E5FF, #8B5CF6)",
            boxShadow: "0 0 40px rgba(0,229,255,0.3)",
            fontFamily: "Inter",
          }}
          whileHover={{ scale: 1.03, boxShadow: "0 0 60px rgba(0,229,255,0.4)" }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 shimmer-overlay" />
          <span className="relative z-10">Analyze Your First File — Free</span>
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-gray-600 text-sm"
        >
          No account required · Results in 15 seconds · Completely private
        </motion.p>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer
        className="py-12 px-8 border-t"
        style={{ background: COLORS.void, borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <SafezyLogo />
            <span className="text-gray-600 text-sm hidden sm:inline">
              Truth In Every Pixel
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">© 2026 SAFEZY</span>
            <div className="flex gap-3">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
