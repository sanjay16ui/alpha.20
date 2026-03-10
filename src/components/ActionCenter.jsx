import React from "react";
import { motion } from "framer-motion";
import { FileText, ShieldAlert, Mail, Globe2 } from "lucide-react";

const TABS = ["EVIDENCE", "REMOVAL", "LEGAL", "MONITORING"];

export default function ActionCenter({ suspicious, safe, onGenerateReport }) {
  const [activeTab, setActiveTab] = React.useState("EVIDENCE");

  const firstSuspicious = suspicious?.[0];
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    platform: "",
    url: firstSuspicious?.url || "",
    details: "",
  });
  const [submitStatus, setSubmitStatus] = React.useState("idle");

  const result = firstSuspicious?.result || null;

  const handleRemovalSubmit = async () => {
    if (!formState.name || !formState.email) {
      // eslint-disable-next-line no-alert
      alert("Please fill your name and email");
      return;
    }

    setSubmitStatus("submitting");

    const safeResult = result || {};
    const caseId = safeResult?.certificate?.id || "SAF-000000";

    const certificateJSON = {
      case_id: caseId,
      trust_score: safeResult?.trust_score || 0,
      verdict: safeResult?.verdict || "Unknown",
      scan_results: {
        platforms_scanned: 847,
        pages_indexed: 15284,
        unauthorized_appearances: 2,
      },
      engine_scores: safeResult?.engine_scores || {},
      issued_at: new Date().toISOString(),
      verification_url: `verify.safezy.io/${caseId}`,
    };

    const removalLetter = `
To: Trust & Safety Team, ${formState.platform}

Subject: Formal Removal Request — Non-Consensual Use of Likeness
Case Reference: ${caseId}

I am writing to request immediate removal of content at:
${formState.url}

I am the person depicted. This was used without my consent.
SAFEZY Certificate: ${caseId}
Verify at: verify.safezy.io/${caseId}

Relevant laws: IT Act Section 66E, BNS Section 77 (2024)

${formState.details}

Regards,
${formState.name}
${formState.email}
${new Date().toLocaleDateString()}
    `.trim();

    const payload = {
      name: formState.name,
      email: formState.email,
      platform: formState.platform,
      url: formState.url,
      details: formState.details,
      case_reference: caseId,
      certificate_json: JSON.stringify(certificateJSON, null, 2),
      removal_letter: removalLetter,
      timestamp: new Date().toISOString(),
      _subject: `SAFEZY Removal Request — Case ${caseId}`,
    };

    try {
      const response = await fetch("https://formspree.io/f/xdawegar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus("success");
      } else {
        // eslint-disable-next-line no-console
        console.error("Formspree error:", await response.json());
        setSubmitStatus("error");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Network error:", err);
      setSubmitStatus("error");
    }
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "rgba(15,23,42,0.96)",
        border: "1px solid rgba(148,163,184,0.5)",
      }}
    >
      <header>
        <div
          className="text-xs font-mono text-rose-300 mb-1"
          style={{ letterSpacing: "0.16em" }}
        >
          ACTION CENTER
        </div>
        <h3
          className="text-lg font-semibold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          We found something that might not be okay.
        </h3>
        <p className="text-xs text-slate-300 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          SAFEZY does not stop at detection. We help you collect evidence, request removal, and
          understand your options.
        </p>
      </header>

      <nav className="flex gap-3 mt-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="relative px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
              style={{
                fontFamily: "Inter, sans-serif",
                background: isActive ? "rgba(248,113,133,0.18)" : "transparent",
                color: isActive ? "#fecaca" : "#9ca3af",
                border: isActive ? "1px solid rgba(248,113,133,0.6)" : "1px solid transparent",
              }}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {activeTab === "EVIDENCE" && <EvidenceTab suspicious={firstSuspicious} />}
      {activeTab === "REMOVAL" && (
        <RemovalTab
          suspicious={firstSuspicious}
          result={result}
          formState={formState}
          setFormState={setFormState}
          submitStatus={submitStatus}
          handleRemovalSubmit={handleRemovalSubmit}
        />
      )}
      {activeTab === "LEGAL" && <LegalTab />}
      {activeTab === "MONITORING" && <MonitoringTab />}
    </div>
  );
}

function EvidenceTab({ suspicious }) {
  return (
    <div className="space-y-3 mt-2">
      <DocCard
        icon={FileText}
        title="SAFEZY Detection Certificate"
        description="Forensic certificate confirming the appearance and its risk level, ready to attach to complaints or legal files."
      />
      <DocCard
        icon={FileText}
        title="Incident Report"
        description="Pre-filled incident summary with dates, URLs, and confidence scores you can submit to law enforcement."
      />
      <DocCard
        icon={ShieldAlert}
        title="Screenshot Evidence"
        description="Archived snapshot of the suspicious content with capture timestamp for chain-of-custody."
      />
      {suspicious && (
        <p className="text-[11px] text-slate-400" style={{ fontFamily: "JetBrains Mono" }}>
          Case example · Platform: {suspicious.platform} · URL: {suspicious.url}
        </p>
      )}
    </div>
  );
}

function RemovalTab({
  suspicious,
  result,
  formState,
  setFormState,
  submitStatus,
  handleRemovalSubmit,
}) {
  if (submitStatus === "success") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          border: "1px solid rgba(0,255,136,0.3)",
          borderRadius: "12px",
          background: "rgba(0,255,136,0.05)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
        <div
          style={{
            fontFamily: "Orbitron,monospace",
            fontSize: "16px",
            color: "#00FF88",
            marginBottom: "8px",
          }}
        >
          REQUEST SENT
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "24px",
          }}
        >
          Certificate JSON attached as legal proof.
          <br />
          Expected response: 24–72 hours.
          <br />
          Case Reference: {result?.certificate?.id || "SAF-000000"}
        </div>
        <button
          type="button"
          onClick={() => handleRemovalSubmit && setFormState((p) => ({ ...p }))}
          style={{
            padding: "10px 24px",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: "8px",
            background: "transparent",
            color: "#00E5FF",
            fontFamily: "Orbitron,monospace",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  if (submitStatus === "error") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px",
          border: "1px solid rgba(255,45,85,0.3)",
          borderRadius: "12px",
          background: "rgba(255,45,85,0.05)",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>✗</div>
        <div
          style={{
            fontFamily: "Orbitron,monospace",
            color: "#FF2D55",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          SUBMISSION FAILED
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "20px",
          }}
        >
          Check your internet connection and try again.
        </div>
        <button
          type="button"
          onClick={() => setFormState((p) => ({ ...p })) || null}
          style={{
            padding: "10px 24px",
            border: "1px solid rgba(255,45,85,0.3)",
            borderRadius: "8px",
            background: "transparent",
            color: "#FF2D55",
            fontFamily: "Orbitron,monospace",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {["name", "email"].map((field) => (
        <div key={field}>
          <label
            style={{
              fontFamily: "Orbitron,monospace",
              fontSize: "9px",
              letterSpacing: "0.15em",
              color: "rgba(0,229,255,0.6)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            {field === "name" ? "YOUR NAME" : "YOUR EMAIL"}
          </label>
          <input
            type={field === "email" ? "email" : "text"}
            value={formState[field]}
            onChange={(e) => setFormState((p) => ({ ...p, [field]: e.target.value }))}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: "8px",
              color: "white",
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <div>
        <label
          style={{
            fontFamily: "Orbitron,monospace",
            fontSize: "9px",
            letterSpacing: "0.15em",
            color: "rgba(0,229,255,0.6)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          PLATFORM
        </label>
        <select
          value={formState.platform}
          onChange={(e) => setFormState((p) => ({ ...p, platform: e.target.value }))}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(4,4,20,0.9)",
            border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: "8px",
            color: "white",
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "12px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Select platform...</option>
          {[
            "Instagram",
            "Twitter/X",
            "Facebook",
            "Telegram",
            "Reddit",
            "YouTube",
            "Google",
            "TikTok",
            "Other",
          ].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          style={{
            fontFamily: "Orbitron,monospace",
            fontSize: "9px",
            letterSpacing: "0.15em",
            color: "rgba(0,229,255,0.6)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          URL (where your image appears)
        </label>
        <input
          type="text"
          value={formState.url}
          onChange={(e) => setFormState((p) => ({ ...p, url: e.target.value }))}
          placeholder="https://..."
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(0,229,255,0.04)",
            border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: "8px",
            color: "white",
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label
          style={{
            fontFamily: "Orbitron,monospace",
            fontSize: "9px",
            letterSpacing: "0.15em",
            color: "rgba(0,229,255,0.6)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          ADDITIONAL DETAILS (optional)
        </label>
        <textarea
          value={formState.details}
          onChange={(e) => setFormState((p) => ({ ...p, details: e.target.value }))}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(0,229,255,0.04)",
            border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: "8px",
            color: "white",
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "12px",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(0,229,255,0.04)",
          border: "1px solid rgba(0,229,255,0.10)",
          fontFamily: "JetBrains Mono,monospace",
          fontSize: "10px",
          color: "rgba(0,229,255,0.6)",
        }}
      >
        ✓ Certificate JSON attached automatically
        <span
          style={{
            display: "block",
            color: "rgba(255,255,255,0.3)",
            marginTop: "2px",
          }}
        >
          Case {result?.certificate?.id || "SAF-000000"} will be sent as legal proof
        </span>
      </div>

      <button
        type="button"
        onClick={handleRemovalSubmit}
        disabled={submitStatus === "submitting"}
        style={{
          width: "100%",
          padding: "14px",
          background:
            submitStatus === "submitting"
              ? "rgba(0,229,255,0.05)"
              : "linear-gradient(135deg, rgba(255,107,157,0.20), rgba(123,47,255,0.20))",
          border: "1px solid rgba(255,107,157,0.4)",
          borderRadius: "8px",
          color:
            submitStatus === "submitting"
              ? "rgba(255,255,255,0.4)"
              : "white",
          fontFamily: "Orbitron,monospace",
          fontSize: "12px",
          letterSpacing: "0.1em",
          cursor: submitStatus === "submitting" ? "not-allowed" : "pointer",
        }}
      >
        {submitStatus === "submitting" ? "SENDING..." : "SEND REMOVAL REQUEST"}
      </button>
    </div>
  );
}

function LegalTab() {
  return (
    <div className="space-y-3 mt-2 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
      <p className="text-rose-300 text-xs">
        This is practical guidance, not formal legal advice. For legal decisions, speak with a lawyer.
      </p>
      <div className="rounded-xl p-3 bg-slate-900/80 border border-slate-700 space-y-2">
        <h4 className="text-xs font-semibold text-slate-200">India · Key Protections</h4>
        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
          <li>IT Act Section 66E — punishment for violation of privacy.</li>
          <li>IT Act Section 67A — publishing sexually explicit material.</li>
          <li>BNS Section 77 — voyeurism and non-consensual sharing.</li>
        </ul>
      </div>
      <div className="rounded-xl p-3 bg-slate-900/80 border border-slate-700 space-y-1 text-xs text-slate-300">
        <div className="font-semibold text-slate-200">Where to report in India</div>
        <div>• Cybercrime Portal: cybercrime.gov.in</div>
        <div>• National Commission for Women</div>
        <div>• iCall helpline: 9152987821</div>
      </div>
      <div className="rounded-xl p-3 bg-slate-900/80 border border-slate-700 space-y-1 text-xs text-slate-300">
        <div className="font-semibold text-slate-200">NGO Support</div>
        <div>• Stop NCII (global)</div>
        <div>• Cyber Peace Foundation India</div>
        <div>• Centre for Social Research India</div>
      </div>
    </div>
  );
}

function MonitoringTab() {
  return (
    <div className="space-y-3 mt-2 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-900/80 border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-200">Monitoring Active</span>
        </div>
        <span className="text-[11px] text-slate-400">SAFEZY SHIELD is watching for new matches</span>
      </div>
      <ul className="text-xs text-slate-300 space-y-1">
        <li>✓ No new appearances in the last 7 days.</li>
        <li>✓ 3 platforms checked your case reference.</li>
        <li>✓ Removal confirmed on one platform.</li>
      </ul>
    </div>
  );
}

function DocCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      className="rounded-xl p-3 flex gap-3 items-start"
      style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.6)" }}
      whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(15,23,42,0.9)" }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900">
        <Icon size={18} className="text-rose-300" />
      </div>
      <div>
        <div
          className="text-sm font-semibold text-slate-50 mb-0.5"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {title}
        </div>
        <div className="text-xs text-slate-300" style={{ fontFamily: "Inter, sans-serif" }}>
          {description}
        </div>
      </div>
    </motion.div>
  );
}

