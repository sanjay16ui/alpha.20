import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X, Send, Lock } from "lucide-react";

const COLORS = {
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  green: "#10B981",
  white: "#F8FAFF",
  gray: "#64748B",
};

const QUICK_REPLIES = [
  "Explain to a judge",
  "What should I do?",
  "How confident are you?",
  "Explain heartbeat check",
];

const AI_GREETING =
  "I've analyzed this file. The trust score of 23% indicates strong synthetic media signals. I can explain any finding in detail, help you prepare for legal proceedings, or clarify the technical evidence. What would you like to know?";

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: COLORS.cyan }}
          animate={{ scale: [0.6, 1, 0.6] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel({ open, onClose, data }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const scrollRef = useRef(null);
  const score = data?.trust_score ?? 23;
  const isHighRisk = score < 60;

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setIsTyping(true);
    setShowQuickReplies(false);
    const t = setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          role: "ai",
          text: AI_GREETING.replace("23%", `${score}%`),
        },
      ]);
      setShowQuickReplies(true);
    }, 1800);
    return () => clearTimeout(t);
  }, [open, score]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text: text.trim() }]);
    setInput("");
    setShowQuickReplies(false);
    setIsTyping(true);
    setTimeout(() => {
      const reply = `Based on the forensic analysis, ${text} — The ${score}% trust score suggests ${isHighRisk ? "significant synthetic indicators. I recommend verifying critical details independently." : "authentic media with minor anomalies."}`;
      setIsTyping(false);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      <AnimatePresence>
        {open && (
        <motion.div
          key="chat-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute right-0 top-0 bottom-0 w-[400px] flex flex-col"
            style={{
              background: "rgba(7,7,15,0.98)",
              borderLeft: "1px solid rgba(0,229,255,0.12)",
              backdropFilter: "blur(20px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 h-[72px] flex items-center justify-between px-4"
              style={{
                background: "rgba(12,12,26,0.9)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})`,
                    }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2"
                    style={{ borderColor: "rgba(7,7,15,0.98)" }}
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white" style={{ fontFamily: "Inter" }}>
                    SAFEZY AI
                  </div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "Inter" }}>
                    Forensic Expert
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <Minus size={18} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Status strip */}
            <div
              className="flex-shrink-0 px-4 py-2 flex items-center gap-2"
              style={{ background: "transparent" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span
                className="text-[11px]"
                style={{ fontFamily: "JetBrains Mono, monospace", color: COLORS.cyan }}
              >
                Running locally — Ollama Mistral
              </span>
            </div>

            {/* Chat area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[88%] px-4 py-3.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      fontFamily: "Inter",
                      background: msg.role === "ai"
                        ? "rgba(17,17,37,0.9)"
                        : "rgba(0,229,255,0.08)",
                      border: msg.role === "ai"
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(0,229,255,0.2)",
                      borderRadius: msg.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      background: "rgba(17,17,37,0.9)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "4px 16px 16px 16px",
                    }}
                  >
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              {/* Quick reply chips */}
              {showQuickReplies && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {QUICK_REPLIES.map((q, i) => (
                    <motion.button
                      key={q}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => send(q)}
                      className="px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors"
                      style={{
                        fontFamily: "Inter",
                        border: "1px solid rgba(0,229,255,0.25)",
                        color: COLORS.cyan,
                        background: "rgba(0,229,255,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,229,255,0.12)";
                        e.currentTarget.style.borderColor = "rgba(0,229,255,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,229,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(0,229,255,0.25)";
                      }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div
              className="flex-shrink-0 p-4"
              style={{
                background: "rgba(12,12,26,0.9)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask anything about this file..."
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  style={{
                    fontFamily: "Inter",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <motion.button
                  type="button"
                  onClick={() => send(input)}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: COLORS.cyan,
                    color: "white",
                  }}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 24px rgba(0,229,255,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Lock size={10} style={{ color: COLORS.green }} />
                <span
                  className="text-[10px] text-gray-500"
                  style={{ fontFamily: "Inter" }}
                >
                  AI analysis is probabilistic. Verify critical decisions independently.
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
