import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShieldCheck } from "lucide-react";

export default function FaceUpload({ onFaceSelected, accentColor = "#FF6B9D" }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScanning(true);
    onFaceSelected?.(file);
    setTimeout(() => setScanning(false), 3200);
  };

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="relative">
        <div
          className="w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden"
          style={{
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 30px ${accentColor}55`,
            background: "rgba(15,23,42,0.9)",
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Face preview"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.1)" }}
              />
              <AnimatePresence>
                {scanning && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border"
                        style={{ borderColor: `${accentColor}66` }}
                        initial={{ scale: 0.6, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(15,23,42,0.9)" }}
              >
                <User size={28} style={{ color: accentColor }} />
              </div>
              <div className="text-center">
                <div
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Upload a clear photo of your face
                </div>
                <div
                  className="text-xs text-gray-400 mt-1 max-w-[200px]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  This photo never leaves your device. It is used only to search.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.5)",
            fontFamily: "Inter, sans-serif",
            color: "#e2e8f0",
          }}
        >
          <ShieldCheck size={14} style={{ color: accentColor }} />
          Local-only processing · image deleted after analysis
        </div>
        <p className="text-xs text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
          SAFEZY converts your face into a private mathematical representation. We only store a
          secure hash of that vector to look for matches. The original photo is discarded
          immediately after processing.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            background: "transparent",
            border: `1px solid ${accentColor}`,
            color: accentColor,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Choose a photo
        </button>
      </div>
    </div>
  );
}

