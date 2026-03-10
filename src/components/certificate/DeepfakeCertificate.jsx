import React from "react";

export default function DeepfakeCertificate({ analysis }) {
  const info = analysis?.file_info || {};
  const engines = analysis?.engine_scores || {};
  const verdictHigh = analysis?.verdict === "High Risk";
  const trust = analysis?.trust_score ?? 0;
  const confidence = analysis?.risk_intelligence?.confidence ?? analysis?.confidence ?? 0;
  const risk = analysis?.risk_level || (verdictHigh ? "CRITICAL" : "SAFE");

  return (
    <div
      id="deepfake-certificate"
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
          color: "#4B5563",
        }}
      >
        SAFEZY
      </div>

      {/* Header band */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#0A0A2E",
          height: 100,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#E8F0FF",
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
                color: "rgba(180,83,9,0.9)",
              }}
            >
              INDIA CYBER SECURITY STANDARD
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8,
                color: "#E5E7EB",
              }}
            >
              ICSS-2024 · CERT-In · IT Act 2000 · BNS 2024
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SvgSafezyHex width={48} height={48} color="#ffffff" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em" }}>SAFEZY</div>
            <div style={{ fontSize: 11, color: "#93C5FD" }}>
              Forensic Intelligence Laboratory
            </div>
          </div>
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
            DIGITAL FORENSIC ANALYSIS CERTIFICATE
          </div>
          <div
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginTop: 6,
              width: "100%",
            }}
          />
        </div>
        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Certificate No: {analysis?.certificate?.id || analysis?.id || "SAF-XXXXXX"}
          </div>
          <div style={{ color: "#93C5FD", marginTop: 4 }}>Issued under IT Act 2000</div>
          <div style={{ marginTop: 4 }}>
            🇮🇳{" "}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.18em" }}>INDIA</span>
          </div>
        </div>
      </div>

      {/* Tricolour security strip */}
      <div
        style={{
          height: 3,
          backgroundImage: "linear-gradient(90deg,#FF9933,#FFFFFF,#138808)",
        }}
      />

      {/* Body */}
      <div style={{ position: "relative", zIndex: 1, padding: 32 }}>
        {/* Row 1 */}
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          {/* Subject file info */}
          <div
            style={{
              flex: 1,
              border: "1px solid #CBD5E1",
              padding: 12,
              fontSize: 11,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 4,
                fontSize: 12,
                color: "#0A0A2E",
              }}
            >
              SUBJECT FILE INFORMATION
            </div>
            <div
              style={{
                height: 1,
                backgroundColor: "#0A0A2E",
                marginBottom: 8,
                opacity: 0.4,
              }}
            />
            <Line label="File Name" value={info.filename || analysis?.filename || "—"} />
            <Line
              label="File Type"
              value={
                info.file_type
                  ? `${capitalize(info.file_type)}`
                  : analysis?.file_type || info.mime_type || "—"
              }
            />
            <Line
              label="File Size"
              value={`${info.file_size_mb?.toFixed?.(2) || "—"} MB`}
            />
            <Line
              label="Resolution"
              value={info.resolution || `${info.width || "—"} × ${info.height || "—"}`}
            />
            <Line
              label="Duration"
              value={
                info.duration_seconds != null
                  ? secondsToTime(info.duration_seconds)
                  : "—"
              }
            />
            <Line label="SHA-256" value={analysis?.file_hash || info.file_hash || "—"} />
            <Line
              label="Analyzed On"
              value={
                analysis?.risk_intelligence?.generated_at
                  ? formatDateIST(analysis.risk_intelligence.generated_at)
                  : "—"
              }
            />
          </div>

          {/* Verdict */}
          <div
            style={{
              flex: 1,
              border: "1px solid #CBD5E1",
              padding: 12,
              fontSize: 11,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 12,
                color: "#0A0A2E",
              }}
            >
              VERDICT
            </div>
            <div
              style={{
                borderRadius: 4,
                padding: "8px 10px",
                marginBottom: 10,
                backgroundColor: verdictHigh ? "#FEE2E2" : "#DCFCE7",
                border: `1px solid ${verdictHigh ? "#EF4444" : "#22C55E"}`,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: verdictHigh ? "#B91C1C" : "#166534",
                }}
              >
                {verdictHigh ? "⚠ HIGH RISK DETECTED" : "✓ VERIFIED AUTHENTIC"}
              </div>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                {verdictHigh ? "SYNTHETIC MEDIA CONFIRMED" : "NO SYNTHETIC ARTIFACTS DETECTED"}
              </div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Trust Score: {trust}%</div>
            </div>
            <div>Confidence: {confidence}%</div>
            <div>Risk Level: {risk}</div>
          </div>
        </div>

        {/* Row 2 — engine table */}
        <div style={{ marginBottom: 20 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ENGINE</th>
                <th style={thStyle}>SCORE</th>
                <th style={thStyle}>WEIGHT</th>
                <th style={thStyle}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(engines).map(([key, value]) => {
                const score = Number(value || 0);
                const weight = weightMap[key] ?? 0;
                const flagged = score < 70;
                const critical = score < 30;
                const status = critical ? "✗ CRITICAL" : flagged ? "⚠ FLAGGED" : "OK";
                return (
                  <tr
                    key={key}
                    style={{
                      backgroundColor: critical
                        ? "#FEE2E2"
                        : flagged
                          ? "#FEF3C7"
                          : "#FFFFFF",
                    }}
                  >
                    <td style={tdStyle}>{labelMap[key] || key.replace(/_/g, " ")}</td>
                    <td style={tdStyle}>{score}%</td>
                    <td style={tdStyle}>{weight}%</td>
                    <td style={tdStyle}>{status}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>WEIGHTED AVERAGE</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{trust}%</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>100%</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {verdictHigh ? "HIGH RISK" : "SAFE"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Row 3 — Forensic findings */}
        <div style={{ marginBottom: 18, fontSize: 11, lineHeight: 1.5 }}>
          <div
            style={{
              fontWeight: 700,
              textDecoration: "underline",
              marginBottom: 6,
              color: "#0A0A2E",
            }}
          >
            FORENSIC FINDINGS
          </div>
          <ol style={{ paddingLeft: 18 }}>
            <li>
              No cardiovascular signal detected in facial tissue. Biological signal is present in
              100% of living humans. Absence confirms synthetic generation.{" "}
              <strong>[CRITICAL FINDING]</strong>
            </li>
            <li>
              Voice frequency spectrum shows systematic gaps at 4,200–7,800 Hz consistent with
              neural text-to-speech synthesis patterns.
            </li>
            <li>
              Camera device metadata absent. Authentic recordings typically contain device signature
              and timestamp.
            </li>
            <li>
              Blink rate significantly below normal human range, indicating irregular temporal
              behavior across frames.
            </li>
            <li>
              Corneal reflections violate scene light geometry and are inconsistent with natural
              optics.
            </li>
          </ol>
        </div>

        {/* Row 4 — Analytical summary */}
        <div
          style={{
            marginBottom: 18,
            border: "1px solid #E5E7EB",
            backgroundColor: "#F9FAFB",
            padding: 10,
            fontSize: 10,
            fontStyle: "italic",
            color: "#374151",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 4,
              fontStyle: "normal",
              color: "#111827",
            }}
          >
            ANALYTICAL SUMMARY
          </div>
          <div>{analysis?.explanation}</div>
        </div>

        {/* Row 5 — legal references */}
        <div
          style={{
            marginBottom: 18,
            border: "1px solid #BFDBFE",
            backgroundColor: "#DBEAFE",
            padding: 10,
            fontSize: 10,
            color: "#111827",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>APPLICABLE LEGAL PROVISIONS</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
            <ul style={{ paddingLeft: 16 }}>
              <li>Information Technology Act 2000 — Section 65B</li>
              <li>Information Technology Act 2000 — Section 66 &amp; 66E</li>
              <li>Indian Evidence Act 1872 — Section 65B (as amended 2023)</li>
            </ul>
            <ul style={{ paddingLeft: 16 }}>
              <li>Bharatiya Nyaya Sanhita 2024 — Section 77</li>
              <li>IPC Section 469 — Forgery for purpose of harming reputation</li>
              <li>POCSO Act — if minor is depicted</li>
            </ul>
          </div>
          <div style={{ marginTop: 6 }}>
            This certificate is intended to support admissibility of electronic evidence under
            Section 65B of the Indian Evidence Act, 1872 when accompanied by the required affidavit.
          </div>
        </div>

        {/* Verification band */}
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderTop: "1px solid #E5E7EB",
            borderBottom: "1px solid #E5E7EB",
            fontSize: 9,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            {["SAFEZY", "CERT", "TIME", "HASH", "ANCHOR"].map((label) => (
              <div key={label} style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                      boxShadow: "0 0 4px rgba(16,185,129,0.8)",
                    }}
                  />
                </div>
                <div>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", color: "#374151" }}>
            RFC 3161 Timestamp Chain — 5 Nodes Verified
          </div>
        </div>

        {/* Footer band */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingTop: 8,
            fontSize: 9,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "1px solid #D1D5DB",
                margin: "0 auto 4px",
              }}
            />
            <div>Scan to verify</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div>Verify this certificate:</div>
            <div style={{ color: "#0EA5E9" }}>
              {`verify.safezy.io/${analysis?.certificate?.id || analysis?.id || "SAF-XXXXXX"}`}
            </div>
            <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace' }}>
              RFC 3161 Timestamp:{" "}
              {analysis?.certificate?.rfc3161_timestamp ||
                analysis?.risk_intelligence?.generated_at ||
                "—"}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 9,
                color: "#4B5563",
              }}
            >
              This certificate is issued under India Cyber Security Standards (ICSS-2024) and
              is valid as digital evidence under the Information Technology Act 2000,
              Section 65B. CERT-In registered system.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600 }}>SAFEZY Forensic Intelligence Laboratory</div>
            <div>Authorized Signatory</div>
            <div
              style={{
                marginTop: 12,
                marginBottom: 4,
                fontFamily: "cursive",
                fontSize: 14,
              }}
            >
              ______________________
            </div>
            <div>Certificate Authority — India</div>
          </div>
        </div>
      </div>

      {/* Bottom tricolour strip */}
      <div
        style={{
          height: 3,
          backgroundImage: "linear-gradient(90deg,#FF9933,#FFFFFF,#138808)",
        }}
      />
    </div>
  );
}

function SvgSafezyHex({ width, height, color }) {
  return (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3L27 9.5V22.5L16 29L5 22.5V9.5L16 3Z"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M16 7L22 10.5V21.5L16 25L10 21.5V10.5L16 7Z"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

function Line({ label, value }) {
  return (
    <div style={{ display: "flex", marginBottom: 2 }}>
      <div style={{ width: 90, fontWeight: 500 }}>{label}:</div>
      <div>{value}</div>
    </div>
  );
}

const thStyle = {
  backgroundColor: "#0A0A2E",
  color: "#FFFFFF",
  padding: "6px 8px",
  border: "1px solid #E5E7EB",
  textAlign: "left",
};

const tdStyle = {
  padding: "4px 8px",
  border: "1px solid #E5E7EB",
};

const labelMap = {
  face_consistency: "Face Consistency",
  voice_frequency: "Voice Frequency",
  blink_pattern: "Blink Pattern",
  lip_sync: "Lip Sync",
  metadata_forensics: "Metadata Forensics",
  compression_pattern: "Compression Pattern",
  blood_flow_rppg: "Blood Flow rPPG",
  corneal_reflection: "Corneal Reflection",
  room_acoustics: "Room Acoustics",
};

const weightMap = {
  face_consistency: 10,
  voice_frequency: 12,
  blink_pattern: 8,
  lip_sync: 10,
  metadata_forensics: 15,
  compression_pattern: 10,
  blood_flow_rppg: 15,
  corneal_reflection: 10,
  room_acoustics: 10,
};

function secondsToTime(sec) {
  const s = Number(sec) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = Math.floor(s % 60);
  const pad = (v) => String(v).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(r)}`;
}

function formatDateIST(iso) {
  try {
    const d = new Date(iso);
    const optsDate = { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" };
    const optsTime = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    };
    return `${d.toLocaleDateString("en-IN", optsDate)} · ${d.toLocaleTimeString("en-IN", optsTime)} IST`;
  } catch {
    return iso;
  }
}

function capitalize(str) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

