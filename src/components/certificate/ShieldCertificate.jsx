import React from "react";

export default function ShieldCertificate({ scan, caseId }) {
  const suspicious = scan?.suspicious_appearances || [];
  const darkScore = scan?.dark_web_score ?? 0;
  const certId = caseId || scan?.certificate_id || "SAF-XXXXXX";

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        margin: "0 auto",
        backgroundColor: "#ffffff",
        color: "#000000",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: 0.05,
          fontSize: 120,
          fontWeight: 700,
          transform: "rotate(-35deg)",
          color: "#7F1D1D",
        }}
      >
        SAFEZY SHIELD
      </div>

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#8B0000",
          height: 100,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#F9FAFB",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            backgroundColor: "rgba(255,153,0,0.08)",
            borderRadius: 6,
            border: "1px solid rgba(255,153,0,0.2)",
          }}
        >
          <span style={{ fontSize: 16 }}>🇮🇳</span>
          <div>
            <div
              style={{
                fontFamily: '"Orbitron", monospace',
                fontSize: 9,
                letterSpacing: "0.12em",
                color: "rgba(254,215,170,0.95)",
              }}
            >
              INDIA CYBER SECURITY STANDARD
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8,
                color: "#FEE2E2",
              }}
            >
              ICSS-2024 · CERT-In · IT Act 2000 · BNS 2024
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em" }}>SAFEZY</div>
          <div style={{ fontSize: 11 }}>Victim Protection Desk</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            VICTIM PROTECTION CERTIFICATE
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            NON-CONSENSUAL IMAGERY — FORENSIC EVIDENCE
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace' }}>Case Reference: {certId}</div>
          <div style={{ marginTop: 4 }}>Jurisdiction: INDIA 🇮🇳</div>
        </div>
      </div>

      {/* Tricolour */}
      <div
        style={{
          height: 3,
          backgroundImage: "linear-gradient(90deg,#FF9933,#FFFFFF,#138808)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: 32 }}>
        {/* Summary table */}
        <div
          style={{
            border: "1px solid #FCA5A5",
            backgroundColor: "#FEE2E2",
            padding: 12,
            fontSize: 11,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              color: "#7F1D1D",
            }}
          >
            UNAUTHORIZED USE OF LIKENESS CONFIRMED
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={cellL}>Face Match</td>
                <td style={cellR}>
                  {suspicious[0]?.match_confidence ?? "—"}% — CONFIRMED MATCH
                </td>
              </tr>
              <tr>
                <td style={cellL}>Platforms Scanned</td>
                <td style={cellR}>{scan?.total_platforms_scanned ?? "—"} platforms</td>
              </tr>
              <tr>
                <td style={cellL}>Pages Indexed</td>
                <td style={cellR}>
                  {(scan?.total_pages_indexed ?? 0).toLocaleString()} pages
                </td>
              </tr>
              <tr>
                <td style={cellL}>Unauthorized</td>
                <td style={cellR}>{suspicious.length} appearances found</td>
              </tr>
              <tr>
                <td style={cellL}>Deepfake Risk</td>
                <td style={cellR}>
                  {suspicious[0]?.deepfake_probability ?? "—"}% — SYNTHETIC LIKELY
                </td>
              </tr>
              <tr>
                <td style={cellL}>Scan Duration</td>
                <td style={cellR}>{(scan?.scan_duration_seconds || 0).toFixed(1)} seconds</td>
              </tr>
              <tr>
                <td style={cellL}>Dark Web Exposure</td>
                <td style={cellR}>
                  {darkScore} / 100 —{" "}
                  {darkScore >= 66 ? "HIGH RISK" : darkScore >= 31 ? "ELEVATED" : "LOW"}
                </td>
              </tr>
              <tr>
                <td style={cellL}>Case Reference</td>
                <td style={cellR}>{certId}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Appearances */}
        <div style={{ marginBottom: 18, fontSize: 11 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: "#111827" }}>
            UNAUTHORIZED APPEARANCES
          </div>
          <ul style={{ paddingLeft: 16 }}>
            {suspicious.map((s, i) => (
              <li key={i}>
                <strong>{s.platform}</strong> — {s.context} (First seen: {s.first_seen}, Match:{" "}
                {s.match_confidence}%, Deepfake risk: {s.deepfake_probability}%).
              </li>
            ))}
          </ul>
        </div>

        {/* Legal box */}
        <div
          style={{
            marginBottom: 18,
            border: "1px solid #FECACA",
            backgroundColor: "#FEF2F2",
            padding: 10,
            fontSize: 10,
            color: "#7F1D1D",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>APPLICABLE LEGAL PROVISIONS</div>
          <p>
            The subject of this certificate has the right to immediate content removal under Indian
            law. Non-consensual use of likeness and deepfake imagery may attract offences under:
          </p>
          <ul style={{ paddingLeft: 16 }}>
            <li>Information Technology Act 2000 — Section 66E (violation of privacy)</li>
            <li>Bharatiya Nyaya Sanhita 2024 — provisions on voyeurism and cyber offences</li>
            <li>POCSO Act — if minor is depicted</li>
            <li>IT Rules 2021 — due diligence by intermediaries</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 10,
            color: "#7F1D1D",
          }}
        >
          This certificate is issued under India Cyber Security Standards (ICSS-2024) and is
          intended as digital evidence under the Information Technology Act 2000, Section 65B.
          CERT-In aligned victim protection system.
        </div>
      </div>

      {/* Bottom tricolour */}
      <div
        style={{
          height: 3,
          backgroundImage: "linear-gradient(90deg,#FF9933,#FFFFFF,#138808)",
        }}
      />
    </div>
  );
}

const cellL = {
  padding: "3px 6px",
  border: "1px solid #FCA5A5",
  fontWeight: 600,
};

const cellR = {
  padding: "3px 6px",
  border: "1px solid #FCA5A5",
};

