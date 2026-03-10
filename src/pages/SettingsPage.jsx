import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSafezyStore } from "../store/safezyStore.jsx";

const COLORS = {
  surface: "#0C0C1A",
  border: "rgba(255,255,255,0.06)",
  cyan: "#00E5FF",
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "analysis", label: "Analysis" },
  { id: "export", label: "Export" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "data", label: "Data" },
  { id: "about", label: "About" },
];

export default function SettingsPage() {
  const { state, dispatch } = useSafezyStore();
  const [active, setActive] = useState("general");

  const updateSettings = (partial) =>
    dispatch({ type: "UPDATE_SETTINGS", payload: partial });

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6"
    >
      <aside
        className="rounded-2xl p-4 h-fit"
        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          SETTINGS
        </div>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const activeCat = active === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActive(cat.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: activeCat ? "rgba(0,229,255,0.12)" : "transparent",
                  color: activeCat ? COLORS.cyan : "#e5e7eb",
                  border: activeCat ? `1px solid ${COLORS.cyan}` : "1px solid transparent",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-4">
        {active === "general" && (
          <SettingsCard title="General">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-100 mb-1">Theme</div>
                <div className="flex gap-2">
                  {["dark", "light", "system"].map((opt) => {
                    const activeOpt = state.settings.theme === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateSettings({ theme: opt })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        style={{
                          fontFamily: "Inter",
                          background: activeOpt ? "rgba(0,229,255,0.12)" : "transparent",
                          border: activeOpt
                            ? `1px solid ${COLORS.cyan}`
                            : "1px solid rgba(148,163,184,0.4)",
                          color: activeOpt ? COLORS.cyan : "#e5e7eb",
                        }}
                      >
                        {opt[0].toUpperCase() + opt.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-100 mb-1">Language</div>
                <select
                  value={state.settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  style={{ fontFamily: "Inter" }}
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
              <ToggleRow
                label="Reset counter on browser close"
                checked={state.settings.sessionResetOnClose}
                onChange={(v) => updateSettings({ sessionResetOnClose: v })}
              />
            </div>
          </SettingsCard>
        )}

        {active === "analysis" && (
          <SettingsCard title="Analysis">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-100 mb-1">Analysis Mode</div>
                <div className="flex gap-2">
                  {[
                    ["quick", "Quick"],
                    ["standard", "Standard"],
                    ["deep", "Deep"],
                  ].map(([id, label]) => {
                    const activeMode = state.settings.analysisMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateSettings({ analysisMode: id })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        style={{
                          fontFamily: "Inter",
                          background: activeMode
                            ? "rgba(0,229,255,0.12)"
                            : "transparent",
                          border: activeMode
                            ? `1px solid ${COLORS.cyan}`
                            : "1px solid rgba(148,163,184,0.4)",
                          color: activeMode ? COLORS.cyan : "#e5e7eb",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ToggleRow
                label="Auto-generate certificate"
                checked={state.settings.autoSaveCerts}
                onChange={(v) => updateSettings({ autoSaveCerts: v })}
              />
              <ToggleRow
                label="Show confidence percentage"
                checked={state.settings.notifications}
                onChange={(v) => updateSettings({ notifications: v })}
              />
            </div>
          </SettingsCard>
        )}

        {active === "export" && (
          <SettingsCard title="Export">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-100 mb-1">Default Export Format</div>
                <div className="flex gap-2">
                  {["pdf", "json", "both"].map((fmt) => {
                    const activeFmt = state.settings.exportFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => updateSettings({ exportFormat: fmt })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        style={{
                          fontFamily: "Inter",
                          background: activeFmt
                            ? "rgba(0,229,255,0.12)"
                            : "transparent",
                          border: activeFmt
                            ? `1px solid ${COLORS.cyan}`
                            : "1px solid rgba(148,163,184,0.4)",
                          color: activeFmt ? COLORS.cyan : "#e5e7eb",
                        }}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SettingsCard>
        )}

        {active === "notifications" && (
          <SettingsCard title="Notifications">
            <div className="space-y-3">
              <ToggleRow
                label="Enable browser alerts when analysis completes"
                checked={state.settings.notifications}
                onChange={(v) => updateSettings({ notifications: v })}
              />
            </div>
          </SettingsCard>
        )}

        {active === "privacy" && (
          <SettingsCard title="Privacy">
            <div className="space-y-4 text-sm text-slate-200">
              <div>
                <div className="font-semibold mb-1">File Storage</div>
                <p className="text-slate-400">
                  Uploaded files are processed locally and never stored permanently.
                </p>
              </div>
              <ToggleRow
                label="Store analysis history locally"
                checked
                disabled
                onChange={() => {}}
              />
              <div>
                <div className="font-semibold mb-1">Face Data (SHIELD)</div>
                <p className="text-slate-400">
                  Face scan data is processed in memory and immediately discarded.
                </p>
              </div>
            </div>
          </SettingsCard>
        )}

        {active === "data" && (
          <SettingsCard title="Data">
            <div className="space-y-4 text-sm text-slate-200">
              <div>
                Stored analyses: {state.analyses.length} · Storage used: ~
                {Math.min(5000, state.analyses.length * 4)} KB of 5000 KB
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: COLORS.cyan,
                    width: `${Math.min(100, (state.analyses.length / 50) * 100)}%`,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "CLEAR_HISTORY" })}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-red-500 text-red-400"
                style={{ fontFamily: "Inter" }}
              >
                Clear Analysis History
              </button>
            </div>
          </SettingsCard>
        )}

        {active === "about" && (
          <SettingsCard title="About">
            <div className="space-y-2 text-sm text-slate-200">
              <div className="text-xl font-bold" style={{ fontFamily: "Space Grotesk" }}>
                SAFEZY
              </div>
              <div>Version: 1.0.0</div>
              <div>Truth In Every Pixel</div>
            </div>
          </SettingsCard>
        )}
      </section>
    </motion.div>
  );
}

function SettingsCard({ title, children }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div
        className="text-sm font-semibold text-slate-100 mb-3"
        style={{ fontFamily: "Space Grotesk" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-slate-100" style={{ fontFamily: "Inter" }}>
        {label}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="w-10 h-5 rounded-full flex items-center px-1 cursor-pointer"
        style={{
          background: checked ? "rgba(34,197,94,0.2)" : "rgba(15,23,42,0.9)",
          border: checked
            ? "1px solid rgba(34,197,94,0.8)"
            : "1px solid rgba(148,163,184,0.7)",
        }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full bg-white"
          style={{
            transform: `translateX(${checked ? "14px" : "0px"})`,
            transition: "transform 0.15s ease-out",
          }}
        />
      </button>
    </div>
  );
}

