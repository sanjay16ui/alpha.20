import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LiveGuardianPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [threatCount, setThreatCount] = useState(0);
  const [feed, setFeed] = useState([]);
  const [liveScore, setLiveScore] = useState(94);
  const [heartRate, setHeartRate] = useState(72);
  const [graphData, setGraphData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      t: i,
      score: 88 + Math.random() * 10 - 5
    }))
  );

  // Simulate live scanning when active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Update score with slight variation
      setLiveScore(prev => {
        const next = prev + (Math.random() * 6 - 3);
        return Math.max(60, Math.min(99, Math.round(next)));
      });

      // Update heart rate
      setHeartRate(prev => {
        const next = prev + (Math.random() * 4 - 2);
        return Math.max(60, Math.min(90, Math.round(next)));
      });

      // Update scan count
      setScanCount(prev => prev + 1);

      // Update graph
      setGraphData(prev => {
        const next = [...prev.slice(1), {
          t: prev[prev.length - 1].t + 1,
          score: 85 + Math.random() * 13
        }];
        return next;
      });

      // Occasionally add feed events
      if (Math.random() > 0.6) {
        const events = [
          { type: 'safe', msg: 'Face geometry stable — all 47 landmarks consistent' },
          { type: 'safe', msg: 'Heartbeat signal confirmed — 72 BPM detected' },
          { type: 'safe', msg: 'Voice spectrum continuous — no synthetic gaps' },
          { type: 'safe', msg: 'Corneal reflections verified — physics consistent' },
          { type: 'warning', msg: 'Micro-expression anomaly — monitoring...' },
          { type: 'safe', msg: 'Blink pattern normal — 16 blinks/min' },
          { type: 'safe', msg: 'Lip sync verified — 38ms offset detected' },
          { type: 'safe', msg: 'Room acoustics matched — reverb consistent' },
        ];
        const ev = events[Math.floor(Math.random() * events.length)];
        setFeed(prev => [{
          ...ev,
          time: new Date().toLocaleTimeString('en-IN'),
          id: Date.now()
        }, ...prev.slice(0, 14)]);

        if (ev.type === 'threat') {
          setThreatCount(p => p + 1);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '24px',
        minHeight: '100vh',
        background: '#00000F'
      }}
    >

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{
            fontFamily: 'Orbitron,monospace',
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '0.05em'
          }}>
            LIVE GUARDIAN
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: '10px',
            color: 'rgba(0,229,255,0.5)',
            marginTop: '4px'
          }}>
            Real-time deepfake monitoring
            during live video calls
          </div>
        </div>

        {/* ON/OFF toggle */}
        <button
          onClick={() => {
            setIsActive(p => !p);
            if (!isActive) {
              setFeed([]);
              setScanCount(0);
            }
          }}
          style={{
            padding: '12px 28px',
            borderRadius: '8px',
            border: isActive
              ? '1px solid rgba(255,45,85,0.4)'
              : '1px solid rgba(0,255,136,0.4)',
            background: isActive
              ? 'rgba(255,45,85,0.10)'
              : 'rgba(0,255,136,0.10)',
            color: isActive ? '#FF2D55' : '#00FF88',
            fontFamily: 'Orbitron,monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
        >
          {isActive ? '■ STOP GUARDIAN' : '▶ START GUARDIAN'}
        </button>
      </div>

      {/* 4 stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          {
            label: 'LIVE TRUST SCORE',
            value: isActive ? `${liveScore}%` : '--',
            color: liveScore > 70 ? '#00FF88' : '#FF2D55',
            glow: liveScore > 70
              ? '0 0 20px rgba(0,255,136,0.3)'
              : '0 0 20px rgba(255,45,85,0.3)'
          },
          {
            label: 'HEART RATE',
            value: isActive ? `${heartRate} BPM` : '--',
            color: '#00E5FF',
            glow: '0 0 20px rgba(0,229,255,0.2)'
          },
          {
            label: 'FRAMES SCANNED',
            value: isActive
              ? (scanCount * 30).toLocaleString()
              : '0',
            color: 'white',
            glow: 'none'
          },
          {
            label: 'THREATS',
            value: threatCount.toString(),
            color: threatCount > 0 ? '#FF2D55' : '#00FF88',
            glow: threatCount > 0
              ? '0 0 20px rgba(255,45,85,0.4)'
              : 'none'
          }
        ].map((card, i) => (
          <div key={i} style={{
            padding: '20px',
            background: 'rgba(8,8,24,0.8)',
            border: '1px solid rgba(0,229,255,0.08)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '20px', height: '20px',
              borderTop: '2px solid rgba(0,229,255,0.3)',
              borderLeft: '2px solid rgba(0,229,255,0.3)',
              borderTopLeftRadius: '12px'
            }} />
            <div style={{
              fontFamily: 'Orbitron,monospace',
              fontSize: '8px',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '10px'
            }}>
              {card.label}
            </div>
            <div style={{
              fontFamily: 'Orbitron,monospace',
              fontSize: '28px',
              fontWeight: '700',
              color: card.color,
              textShadow: card.glow
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main content — two columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>

        {/* LEFT — Live score graph */}
        <div style={{
          padding: '20px',
          background: 'rgba(8,8,24,0.8)',
          border: '1px solid rgba(0,229,255,0.08)',
          borderRadius: '12px'
        }}>
          <div style={{
            fontFamily: 'Orbitron,monospace',
            fontSize: '9px',
            letterSpacing: '0.15em',
            color: 'rgba(0,229,255,0.6)',
            marginBottom: '16px'
          }}>
            LIVE TRUST SCORE TIMELINE
          </div>

          {/* Simple SVG line chart */}
          <svg width="100%" height="140"
            viewBox="0 0 300 140"
            preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 35, 70, 105, 140].map(y => (
              <line key={y} x1="0" y1={y}
                x2="300" y2={y}
                stroke="rgba(0,229,255,0.05)"
                strokeWidth="1" />
            ))}
            {/* Safe threshold line */}
            <line x1="0" y1="42" x2="300" y2="42"
              stroke="rgba(0,229,255,0.2)"
              strokeWidth="1"
              strokeDasharray="4 4" />
            <text x="4" y="38"
              fill="rgba(0,229,255,0.4)"
              fontSize="8"
              fontFamily="monospace">
              SAFE 70%
            </text>
            {/* Score line */}
            {isActive && graphData.length > 1 && (
              <polyline
                points={graphData.map((d, i) =>
                  `${(i / (graphData.length - 1)) * 300},${140 - (d.score / 100) * 140}`
                ).join(' ')}
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            )}
            {/* Area fill */}
            {isActive && graphData.length > 1 && (
              <polygon
                points={[
                  ...graphData.map((d, i) =>
                    `${(i / (graphData.length - 1)) * 300},${140 - (d.score / 100) * 140}`
                  ),
                  '300,140', '0,140'
                ].join(' ')}
                fill="rgba(0,229,255,0.05)"
              />
            )}
            {!isActive && (
              <text x="150" y="75"
                fill="rgba(255,255,255,0.2)"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle">
                Start Guardian to see live data
              </text>
            )}
          </svg>
        </div>

        {/* RIGHT — Engine status grid */}
        <div style={{
          padding: '20px',
          background: 'rgba(8,8,24,0.8)',
          border: '1px solid rgba(0,229,255,0.08)',
          borderRadius: '12px'
        }}>
          <div style={{
            fontFamily: 'Orbitron,monospace',
            fontSize: '9px',
            letterSpacing: '0.15em',
            color: 'rgba(0,229,255,0.6)',
            marginBottom: '16px'
          }}>
            ENGINE STATUS — LIVE
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px'
          }}>
            {[
              { name: 'FACE', icon: '👤', key: 'face_consistency' },
              { name: 'VOICE', icon: '🎵', key: 'voice_frequency' },
              { name: 'BLINK', icon: '👁', key: 'blink_pattern' },
              { name: 'LIPS', icon: '💬', key: 'lip_sync' },
              { name: 'META', icon: '📋', key: 'metadata' },
              { name: 'rPPG', icon: '💓', key: 'blood_flow' },
              { name: 'CORN', icon: '🔍', key: 'corneal' },
              { name: 'AUDIO', icon: '🔊', key: 'room_acoustics' },
              { name: 'COMP', icon: '🗜', key: 'compression' }
            ].map((eng, i) => {
              const score = isActive
                ? Math.round(85 + Math.random() * 13)
                : 0;
              const ok = score > 70;
              return (
                <div key={i} style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isActive
                    ? ok
                      ? 'rgba(0,255,136,0.06)'
                      : 'rgba(255,45,85,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${!isActive
                      ? 'rgba(255,255,255,0.05)'
                      : ok
                        ? 'rgba(0,255,136,0.2)'
                        : 'rgba(255,45,85,0.2)'
                    }`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px' }}>
                    {eng.icon}
                  </div>
                  <div style={{
                    fontFamily: 'Orbitron,monospace',
                    fontSize: '7px',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                    marginTop: '4px'
                  }}>
                    {eng.name}
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: '10px',
                    color: !isActive
                      ? 'rgba(255,255,255,0.2)'
                      : ok ? '#00FF88' : '#FF2D55',
                    marginTop: '3px',
                    fontWeight: '600'
                  }}>
                    {isActive
                      ? (ok ? '✓ OK' : '⚠ FLAG')
                      : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom — Live feed */}
      <div style={{
        padding: '20px',
        background: 'rgba(8,8,24,0.8)',
        border: '1px solid rgba(0,229,255,0.08)',
        borderRadius: '12px'
      }}>
        <div style={{
          fontFamily: 'Orbitron,monospace',
          fontSize: '9px',
          letterSpacing: '0.15em',
          color: 'rgba(0,229,255,0.6)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isActive && (
            <div style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 8px #00FF88',
              animation: 'pulse 1.5s infinite'
            }} />
          )}
          FORENSIC EVENT LOG
        </div>

        <div style={{
          height: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {!isActive && (
            <div style={{
              fontFamily: 'JetBrains Mono,monospace',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              marginTop: '50px'
            }}>
              Press START GUARDIAN to begin monitoring
            </div>
          )}
          {feed.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 12px',
              borderRadius: '6px',
              borderLeft: `3px solid ${item.type === 'threat'
                  ? '#FF2D55'
                  : item.type === 'warning'
                    ? '#FFB800'
                    : '#00FF88'
                }`,
              background: item.type === 'threat'
                ? 'rgba(255,45,85,0.05)'
                : 'rgba(0,255,136,0.03)'
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono,monospace',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap'
              }}>
                {item.time}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono,monospace',
                fontSize: '10px',
                color: item.type === 'threat'
                  ? '#FF2D55'
                  : item.type === 'warning'
                    ? '#FFB800'
                    : 'rgba(255,255,255,0.6)'
              }}>
                {item.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default LiveGuardianPage;

