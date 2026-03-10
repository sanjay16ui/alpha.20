import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "SAFEZY";

export default function LoadingScreen({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 0);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 1000);
    const t4 = setTimeout(() => setStep(4), 1400);
    const t5 = setTimeout(() => setStep(5), 1800);
    const t6 = setTimeout(() => setStep(6), 2200);
    const t7 = setTimeout(() => onComplete?.(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onComplete]);

  const hexPath = "M14 2L24 8V20L14 26L4 20V8L14 2Z";
  const shieldPath = "M14 6L20 9V17L14 20L8 17V9L14 6Z";
  const hexLen = 84;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: step >= 6 ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex flex-col items-center">
        <svg width="56" height="56" viewBox="0 0 28 28" className="mb-4">
          <motion.path
            d={hexPath}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray={hexLen}
            initial={{ strokeDashoffset: hexLen }}
            animate={{ strokeDashoffset: step >= 1 ? 0 : hexLen }}
            transition={{ duration: 0.6 }}
          />
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <path
              d={shieldPath}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1"
              strokeOpacity="0.8"
            />
            <motion.rect
              x="11"
              y="6"
              width="2"
              height="12"
              fill="#00E5FF"
              initial={{ y: -2 }}
              animate={{ y: step >= 2 ? 14 : -2 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </motion.g>
        </svg>

        <div className="flex gap-0.5 mb-6">
          {LETTERS.split("").map((c, i) => (
            <motion.span
              key={`${c}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: step >= 3 ? 1 : 0,
                y: step >= 3 ? 0 : 10,
              }}
              transition={{ duration: 0.3, delay: step >= 3 ? i * 0.06 : 0 }}
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.1em" }}
            >
              {c}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 4 ? 1 : 0 }}
          className="text-xs font-mono mb-4"
          style={{ color: "#00E5FF" }}
        >
          <TypewriterText text="INITIALIZING FORENSIC SYSTEMS..." delay={step >= 4 ? 0 : 9999} />
        </motion.div>

        <motion.div
          className="w-48 h-0.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#00E5FF" }}
            initial={{ width: "0%" }}
            animate={{ width: step >= 5 ? "100%" : "0%" }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function TypewriterText({ text, delay }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (delay > 1000) return;
    let i = 0;
    const iv = setInterval(() => {
      if (i >= text.length) {
        clearInterval(iv);
        return;
      }
      setDisplayed(text.slice(0, i + 1));
      i++;
    }, 30);
    return () => clearInterval(iv);
  }, [text, delay]);
  return <span>{displayed}</span>;
}
