export const DEMO_ANALYSIS = {
  trust_score: 23,
  verdict: "High Risk",
  flags: [
    "no_heartbeat_signal",
    "synthetic_voice_detected",
    "missing_camera_signature",
    "corneal_reflection_mismatch",
  ],
  explanation:
    "This media file scores 23% on the SAFEZY authenticity scale, indicating high probability of synthetic manipulation. Eight of nine forensic signals returned anomalous results. Most significant finding: complete absence of cardiovascular signal in facial tissue — present in 100% of living humans but absent in AI-generated faces. Voice track shows systematic frequency gaps at 4,200-7,800Hz consistent with neural text-to-speech synthesis. Recommendation: Do not use as authentic evidence without independent expert verification.",
  file_hash: "a3f9c2b8d4e167f2",
};
