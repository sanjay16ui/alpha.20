import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafezyStore } from "../store/safezyStore.jsx";
import { ShieldAlert, ShieldCheck, Vault, X } from "lucide-react";
import DeepfakeCertificate from "../components/certificate/DeepfakeCertificate.jsx";
import { downloadElementAsPdf } from "../utils/certDownload.js";

const COLORS = {
  bg: "#03030A",
  surface: "#0C0C1A",
  border: "rgba(255,255,255,0.06)",
  green: "#10B981",
  red: "#EF4444",
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function CertsPage() {
  const { state } = useSafezyStore();
  const { analyses, settings } = state;
  const [activeCert, setActiveCert] = useState(null);
  const certRef = useRef(null);

  const certs = useMemo(() => {
    if (!settings.autoSaveCerts) return [];
    return analyses.filter((a) => a.certificate);
  }, [analyses, settings.autoSaveCerts]);

  const stats = {
    total: certs.length,
    verified: certs.filter((c) => c.verdict === "Verified").length,
  };

  const demoCerts =
    certs.length > 0
      ? []
      : [
          {
            id: "SAF-248391",
            filename: "ceo_press_clip.mp4",
            verdict: "High Risk",
            trust_score: 21,
            certificate: {
              id: "SAF-248391",
              issued_at: new Date().toISOString(),
              hash: "c4f8a13bc92e4a8f9a431b72c92e1a44",
            },
          },
          {
            id: "SAF-903712",
            filename: "id_photo_selfie.jpg",
            verdict: "Verified",
            trust_score: 92,
            certificate: {
              id: "SAF-903712",
              issued_at: new Date().toISOString(),
              hash: "d7b0e51f2c98ab3471f0e7f3c5a0b921",
            },
          },
        ];

  const displayCerts = certs.length ? certs : demoCerts;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}
          >
            Certificate Vault
          </h1>
          <p className="text-sm text-slate-400" style={{ fontFamily: "Inter" }}>
            {stats.total} certificates issued · {stats.verified} verified
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCerts.map((a) => {
          const isHigh = a.verdict === "High Risk";
          const bandColor = isHigh ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)";
          const borderColor = isHigh ? COLORS.red : COLORS.green;
          return (
            <div
              key={a.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: COLORS.surface,
                border: `1px solid ${borderColor}55`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.7)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  background: "rgba(255,153,0,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ fontSize: 14 }}>🇮🇳</span>
                <div>
                  <div
                    style={{
                      fontFamily: "Orbitron,monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: "rgba(255,153,0,0.9)",
                    }}
                  >
                    ICSS-2024 | CERT-In
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 8,
                      color: "rgba(148,163,184,0.9)",
                    }}
                  >
                    IT Act 2000 · BNS 2024
                  </div>
                </div>
              </div>
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ background: bandColor }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {isHigh ? (
                    <ShieldAlert size={16} style={{ color: COLORS.red }} />
                  ) : (
                    <ShieldCheck size={16} style={{ color: COLORS.green }} />
                  )}
                  <span style={{ fontFamily: "Inter", color: "white" }}>
                    {isHigh ? "HIGH RISK DETECTED" : "VERIFIED"}
                  </span>
                </div>
              </div>
              <div className="flex-1 px-4 py-3 space-y-1 text-sm" style={{ fontFamily: "Inter" }}>
                <div className="text-slate-100 truncate" title={a.filename}>
                  {a.filename}
                </div>
                <div className="text-[11px] text-slate-400">Case: {a.id}</div>
                <div className="text-[11px] text-slate-400">
                  Score: {a.trust_score ?? 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Issued:{" "}
                  {a.certificate?.issued_at
                    ? new Date(a.certificate.issued_at).toLocaleString()
                    : "-"}
                </div>
                <div className="text-[11px] text-slate-500">
                  Hash: {(a.certificate?.hash || "").slice(0, 12)}...
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCert(a)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 text-slate-100"
                  style={{ fontFamily: "Inter" }}
                >
                  View Full
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 text-slate-100"
                  style={{ fontFamily: "Inter" }}
                  onClick={async () => {
                    setActiveCert(a);
                    setTimeout(() => {
                      if (certRef.current) {
                        downloadElementAsPdf(
                          certRef.current,
                          `SAFEZY-Certificate-${a.id || "SAF"}.pdf`,
                        );
                      }
                    }, 50);
                  }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeCert && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-3xl w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl"
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => setActiveCert(null)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-10 pb-10">
                <div ref={certRef}>
                  <DeepfakeCertificate analysis={activeCert} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

