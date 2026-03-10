import React from "react";

const GlobeScan = ({ isScanning, progress, threats, feed }) => {
  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : 0;
  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "flex-start",
          width: "100%",
          padding: "32px",
        }}
      >
        {/* LEFT — GLOBE */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Globe container */}
          <div
            style={{
              position: "relative",
              width: "320px",
              height: "320px",
            }}
          >
            {/* Outer glow */}
            <div
              style={{
                position: "absolute",
                inset: "-20px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
                animation: "pulse 3s ease-in-out infinite",
              }}
            />

            {/* Globe circle */}
            <div
              style={{
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                border: "1px solid rgba(0,229,255,0.25)",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(0,229,255,0.06) 0%, rgba(0,0,15,0.95) 70%)",
                position: "relative",
                overflow: "hidden",
                boxShadow:
                  "0 0 60px rgba(0,229,255,0.12), inset 0 0 60px rgba(0,0,30,0.8)",
              }}
            >
              {/* Latitude lines */}
              {[20, 35, 50, 65, 80].map((top, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "10%",
                    right: "10%",
                    top: `${top}%`,
                    height: "1px",
                    background: "rgba(0,229,255,0.10)",
                    borderRadius: "50%",
                  }}
                />
              ))}

              {/* Longitude lines */}
              {[20, 35, 50, 65, 80].map((left, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "5%",
                    bottom: "5%",
                    left: `${left}%`,
                    width: "1px",
                    background: "rgba(0,229,255,0.08)",
                  }}
                />
              ))}

              {/* Scan beam */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,229,255,0.8), transparent)",
                  boxShadow: "0 0 8px rgba(0,229,255,0.6)",
                  top: `${pct}%`,
                  transition: "top 0.5s linear",
                }}
              />

              {/* Face thumbnail center */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "2px solid rgba(0,229,255,0.5)",
                  background: "rgba(0,229,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 2s ease-in-out infinite",
                  boxShadow: "0 0 20px rgba(0,229,255,0.3)",
                }}
              >
                <span style={{ fontSize: "24px" }}>👤</span>
              </div>

              {/* Threat dots */}
              {threats &&
                threats.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: t.y,
                      left: t.x,
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: t.safe ? "#00FF88" : "#FF2D55",
                      boxShadow: t.safe
                        ? "0 0 12px #00FF88"
                        : "0 0 12px #FF2D55",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
            </div>

            {/* Rotating rings */}
            <div
              style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "50%",
                border: "1px dashed rgba(0,229,255,0.20)",
                animation: "spin 12s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-24px",
                borderRadius: "50%",
                border: "1px dashed rgba(123,47,255,0.15)",
                animation: "spinReverse 18s linear infinite",
              }}
            />
          </div>

          {/* Phase cards */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "Face Encode", done: pct > 10 },
              { label: "Surface Web", done: pct > 30 },
              { label: "Social Media", done: pct > 50 },
              { label: "Deep Scan", done: pct > 70 },
              { label: "Analysis", done: pct > 90 },
            ].map((phase, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${
                    phase.done
                      ? "rgba(0,255,136,0.4)"
                      : "rgba(0,229,255,0.15)"
                  }`,
                  background: phase.done
                    ? "rgba(0,255,136,0.08)"
                    : "rgba(0,229,255,0.03)",
                  color: phase.done
                    ? "#00FF88"
                    : "rgba(0,229,255,0.5)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {phase.done ? "✓" : "○"} {phase.label}
              </div>
            ))}
          </div>

          {/* Counter row */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              textAlign: "center",
            }}
          >
            {[
              { label: "PLATFORMS", value: Math.floor((pct / 100) * 847) },
              { label: "PAGES", value: Math.floor((pct / 100) * 15284) },
              {
                label: "THREATS",
                value: threats ? threats.filter((t) => !t.safe).length : 0,
              },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: "Orbitron, monospace",
                    fontSize: "24px",
                    fontWeight: 700,
                    color:
                      i === 2 && stat.value > 0 ? "#FF2D55" : "#00E5FF",
                    textShadow: `0 0 20px ${
                      i === 2 && stat.value > 0 ? "#FF2D55" : "#00E5FF"
                    }`,
                  }}
                >
                  {stat.value.toLocaleString()}
                </div>
                <div
                  style={{
                    fontFamily: "Orbitron, monospace",
                    fontSize: "8px",
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.15em",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — INTELLIGENCE FEED */}
        <div
          style={{
            width: "340px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: "rgba(0,229,255,0.6)",
              marginBottom: "12px",
            }}
          >
            INTELLIGENCE FEED
          </div>

          <div
            style={{
              background: "rgba(4,4,20,0.9)",
              border: "1px solid rgba(0,229,255,0.12)",
              borderRadius: "8px",
              height: "400px",
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {feed &&
              feed.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    borderLeft: `3px solid ${
                      item.type === "threat"
                        ? "#FF2D55"
                        : item.type === "warning"
                          ? "#FFB800"
                          : "#00E5FF"
                    }`,
                    background:
                      item.type === "threat"
                        ? "rgba(255,45,85,0.06)"
                        : "rgba(0,229,255,0.03)",
                    animation: "slideInRight 0.3s ease-out",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Orbitron, monospace",
                      fontSize: "9px",
                      color:
                        item.type === "threat" ? "#FF2D55" : "#00E5FF",
                      letterSpacing: "0.1em",
                      marginBottom: "4px",
                    }}
                  >
                    {item.type === "threat" ? "⚠" : "●"} {item.time} —{" "}
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              ))}

            {(!feed || feed.length === 0) && (
              <div
                style={{
                  color: "rgba(0,229,255,0.3)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  textAlign: "center",
                  marginTop: "40px",
                }}
              >
                Awaiting scan initiation...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobeScan;

