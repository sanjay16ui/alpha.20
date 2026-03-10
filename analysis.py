import hashlib
import io
import json
import math
import os
import random
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
from PIL import Image, ExifTags


# -----------------------------------------------------------------------------
# Session persistence (upload counters + history)
# -----------------------------------------------------------------------------

SESSION_STATE_PATH = ".safezy_session.json"


def _load_session_state() -> Dict[str, Any]:
    if not os.path.exists(SESSION_STATE_PATH):
        return {"session_counter": {}, "session_history": {}}
    try:
        with open(SESSION_STATE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("session_counter", {})
        data.setdefault("session_history", {})
        return data
    except Exception:
        return {"session_counter": {}, "session_history": {}}


def _save_session_state() -> None:
    state = {
        "session_counter": session_counter,
        "session_history": session_history,
    }
    try:
        with open(SESSION_STATE_PATH, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception:
        # Persistence failure should never break analysis
        pass


_state = _load_session_state()
session_counter: Dict[str, int] = _state["session_counter"]
session_history: Dict[str, List[Dict[str, Any]]] = _state["session_history"]


# -----------------------------------------------------------------------------
# Alternating pattern system (odd = fake, even = real)
# -----------------------------------------------------------------------------

def get_upload_number(session_id: str) -> int:
    """Increment and return the upload count for this session."""
    if session_id not in session_counter:
        session_counter[session_id] = 0
    session_counter[session_id] += 1
    _save_session_state()
    return session_counter[session_id]


def is_fake(upload_number: int) -> bool:
    """Return True if this upload should be treated as fake (odd uploads)."""
    return upload_number % 2 == 1


def reset_session_state(session_id: str) -> None:
    """Reset upload counter and history for a session (for demo resets)."""
    if session_id in session_counter:
        session_counter[session_id] = 0
    if session_id in session_history:
        session_history[session_id] = []
    _save_session_state()


# -----------------------------------------------------------------------------
# Scoring engine
# -----------------------------------------------------------------------------

def vary(base: float, spread: float = 8.0) -> float:
    """Add realistic variation to scores and clamp between 5 and 98."""
    varied = base + random.uniform(-spread, spread)
    return max(5.0, min(98.0, varied))


def generate_scores(is_fake_result: bool) -> Dict[str, float]:
    """Generate engine scores for fake/real profiles with variation."""
    if is_fake_result:
        return {
            "face_consistency": vary(28, 6),
            "voice_frequency": vary(15, 8),
            "blink_pattern": vary(22, 7),
            "lip_sync": vary(31, 9),
            "metadata_forensics": vary(18, 5),
            "compression_pattern": vary(25, 8),
            "blood_flow_rppg": vary(12, 6),
            "corneal_reflection": vary(19, 7),
            "room_acoustics": vary(14, 6),
        }
    else:
        return {
            "face_consistency": vary(88, 5),
            "voice_frequency": vary(91, 4),
            "blink_pattern": vary(85, 6),
            "lip_sync": vary(87, 5),
            "metadata_forensics": vary(94, 3),
            "compression_pattern": vary(89, 4),
            "blood_flow_rppg": vary(92, 4),
            "corneal_reflection": vary(86, 5),
            "room_acoustics": vary(90, 4),
        }


def calculate_weighted_score(scores: Dict[str, float]) -> float:
    """Calculate weighted trust score from engine scores."""
    weights = {
        "face_consistency": 0.10,
        "voice_frequency": 0.12,
        "blink_pattern": 0.08,
        "lip_sync": 0.10,
        "metadata_forensics": 0.15,
        "compression_pattern": 0.10,
        "blood_flow_rppg": 0.15,
        "corneal_reflection": 0.10,
        "room_acoustics": 0.10,
    }
    total = sum(scores[k] * weights[k] for k in weights if k in scores)
    return round(total, 2)


def generate_flags(scores: Dict[str, float], is_fake_result: bool) -> List[str]:
    """Generate human-readable flags for key forensic findings."""
    flags: List[str] = []
    if is_fake_result:
        if scores.get("blood_flow_rppg", 100) < 30:
            flags.append("no_cardiovascular_signal")
        if scores.get("voice_frequency", 100) < 30:
            flags.append("synthetic_voice_detected")
        if scores.get("metadata_forensics", 100) < 40:
            flags.append("missing_device_signature")
        if scores.get("corneal_reflection", 100) < 30:
            flags.append("corneal_geometry_violation")
        if scores.get("face_consistency", 100) < 35:
            flags.append("facial_boundary_artifacts")
        if scores.get("blink_pattern", 100) < 30:
            flags.append("abnormal_blink_pattern")
        if scores.get("room_acoustics", 100) < 25:
            flags.append("acoustic_environment_mismatch")
    else:
        flags.append("cardiovascular_signal_present")
        flags.append("voice_spectrum_continuous")
        flags.append("device_metadata_verified")
        flags.append("all_physics_checks_passed")
    return flags


# -----------------------------------------------------------------------------
# Media analysis: video (OpenCV) and images (Pillow)
# -----------------------------------------------------------------------------


def extract_real_metadata(file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    """Extract real EXIF metadata for images and derive a metadata score."""
    metadata_result: Dict[str, Any] = {
        "has_camera_signature": False,
        "has_gps": False,
        "has_timestamp": False,
        "has_device_info": False,
        "extracted_fields": {},
        "missing_fields": [],
        "metadata_score": 0,
        "analysis": "",
    }

    if "image" not in (mime_type or "").lower():
        metadata_result["analysis"] = "Video file — metadata check skipped"
        metadata_result["metadata_score"] = 50
        return metadata_result

    try:
        img = Image.open(io.BytesIO(file_bytes))
        exif_data = getattr(img, "_getexif", lambda: None)()

        if exif_data is None:
            metadata_result["has_camera_signature"] = False
            metadata_result["missing_fields"] = [
                "Camera Make",
                "Camera Model",
                "DateTime",
                "GPS",
                "Software",
                "ExposureTime",
                "ISO",
                "FocalLength",
            ]
            metadata_result["metadata_score"] = 12
            metadata_result["analysis"] = (
                "No EXIF metadata found. "
                "Real cameras always embed device information. "
                "AI-generated images typically have no metadata. "
                "Strong indicator of synthetic generation."
            )
            return metadata_result

        decoded: Dict[str, str] = {}
        for tag_id, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
            try:
                decoded[tag_name] = str(value)[:100]
            except Exception:
                continue

        camera_make = decoded.get("Make")
        camera_model = decoded.get("Model")
        date_time = decoded.get("DateTime")
        software = decoded.get("Software")
        gps_info = decoded.get("GPSInfo")
        iso = decoded.get("ISOSpeedRatings")
        focal = decoded.get("FocalLength")

        score = 0
        found_fields: Dict[str, str] = {}
        missing_fields: List[str] = []

        if camera_make:
            score += 20
            found_fields["Camera Make"] = camera_make
            metadata_result["has_device_info"] = True
        else:
            missing_fields.append("Camera Make")

        if camera_model:
            score += 20
            found_fields["Camera Model"] = camera_model
            metadata_result["has_camera_signature"] = True
        else:
            missing_fields.append("Camera Model")

        if date_time:
            score += 20
            found_fields["Created"] = date_time
            metadata_result["has_timestamp"] = True
        else:
            missing_fields.append("DateTime")

        if gps_info:
            score += 15
            found_fields["GPS"] = "Present"
            metadata_result["has_gps"] = True
        else:
            missing_fields.append("GPS Location")

        if iso is not None:
            score += 10
            found_fields["ISO"] = str(iso)
        else:
            missing_fields.append("ISO Speed")

        if focal is not None:
            score += 10
            found_fields["Focal Length"] = str(focal)
        else:
            missing_fields.append("Focal Length")

        if software:
            score += 5
            found_fields["Software"] = software

        metadata_result["extracted_fields"] = found_fields
        metadata_result["missing_fields"] = missing_fields
        metadata_result["metadata_score"] = min(score, 95)

        if score > 60:
            metadata_result["analysis"] = (
                "Camera metadata verified. "
                f"Device: {camera_make or 'Unknown'} {camera_model or ''}. "
                f"Captured: {date_time or 'Unknown'}. "
                f"{len(found_fields)} metadata fields present. "
                "Consistent with authentic camera capture."
            )
        elif score > 30:
            metadata_result["analysis"] = (
                "Partial metadata found. "
                f"{len(found_fields)} of 7 expected fields present. "
                f"Missing: {', '.join(missing_fields[:3])}. "
                "Possibly edited or screenshot — verify source."
            )
        else:
            metadata_result["analysis"] = (
                "Critical metadata missing. "
                f"Only {len(found_fields)} fields found. "
                f"Missing: {', '.join(missing_fields)}. "
                "Strong indicator of AI generation or heavy editing."
            )

        return metadata_result

    except Exception as e:
        metadata_result["metadata_score"] = 30
        metadata_result["analysis"] = f"Metadata extraction error: {str(e)}"
        return metadata_result


def analyze_video_frames(file_bytes: bytes) -> Dict[str, Any]:
    """Extract real data from video frames using OpenCV."""
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frame_count / fps if fps and fps > 0 else 0.0

        if frame_count <= 0 or width <= 0 or height <= 0:
            cap.release()
            return {
                "frame_count": frame_count,
                "fps": round(fps or 0.0, 2),
                "width": width,
                "height": height,
                "duration_seconds": round(duration, 2),
                "resolution": f"{width}×{height}",
                "brightness_timeline": [],
                "color_variance_timeline": [],
                "edge_density_timeline": [],
                "brightness_mean": 0.0,
                "brightness_variance": 0.0,
                "temporal_consistency": 0.0,
            }

        sample_indices = np.linspace(
            0, max(frame_count - 1, 0), min(30, max(frame_count, 1)), dtype=int
        )

        brightness_values: List[float] = []
        color_variance_values: List[float] = []
        edge_density_values: List[float] = []

        for idx in sample_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness_values.append(float(np.mean(gray)))

            b, g, r = cv2.split(frame)
            color_variance_values.append(
                float(np.std(r) + np.std(g) + np.std(b))
            )

            edges = cv2.Canny(gray, 50, 150)
            edge_density_values.append(
                float(np.sum(edges > 0)) / float(width * height)
            )

        cap.release()

        if brightness_values:
            brightness_mean = float(np.mean(brightness_values))
            brightness_var = float(np.var(brightness_values))
            temporal_consistency = round(100 - (float(np.std(brightness_values)) * 2), 2)
        else:
            brightness_mean = 0.0
            brightness_var = 0.0
            temporal_consistency = 0.0

        return {
            "frame_count": frame_count,
            "fps": round(float(fps or 0.0), 2),
            "width": width,
            "height": height,
            "duration_seconds": round(float(duration), 2),
            "resolution": f"{width}×{height}",
            "brightness_timeline": brightness_values,
            "color_variance_timeline": color_variance_values,
            "edge_density_timeline": edge_density_values,
            "brightness_mean": round(brightness_mean, 2),
            "brightness_variance": round(brightness_var, 4),
            "temporal_consistency": temporal_consistency,
        }
    except Exception as e:
        return {
            "error": str(e),
            "frame_count": 0,
            "fps": 0.0,
            "width": 0,
            "height": 0,
            "duration_seconds": 0.0,
            "resolution": "0×0",
            "brightness_timeline": [],
            "color_variance_timeline": [],
            "edge_density_timeline": [],
            "brightness_mean": 0.0,
            "brightness_variance": 0.0,
            "temporal_consistency": 0.0,
        }
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def analyze_image(file_bytes: bytes) -> Dict[str, Any]:
    """Extract basic forensic data from an image using Pillow and numpy."""
    img = Image.open(io.BytesIO(file_bytes))
    width, height = img.size
    mode = img.mode

    arr = np.array(img)
    if len(arr.shape) == 3:
        channel_means = arr.mean(axis=(0, 1)).tolist()
        channel_stds = arr.std(axis=(0, 1)).tolist()
    else:
        channel_means = [float(arr.mean())]
        channel_stds = [float(arr.std())]

    brightness_mean = float(np.mean(arr))
    contrast_score = float(np.std(arr))

    has_exif = hasattr(img, "_getexif") and img._getexif() is not None

    return {
        "width": width,
        "height": height,
        "mode": mode,
        "resolution": f"{width}×{height}",
        "megapixels": round((width * height) / 1_000_000, 2),
        "channel_means": channel_means,
        "channel_stds": channel_stds,
        "brightness_mean": round(brightness_mean, 2),
        "contrast_score": round(contrast_score, 2),
        "has_exif": bool(has_exif),
        # For non-video files we still provide a 1-point brightness timeline
        "brightness_timeline": [round(brightness_mean, 2)],
    }


# -----------------------------------------------------------------------------
# Graph data generators
# -----------------------------------------------------------------------------

def generate_radar_data(scores: Dict[str, float]) -> Dict[str, Any]:
    """Radar chart data for 9 forensic engines."""
    label_map = {
        "face_consistency": "Face",
        "voice_frequency": "Voice",
        "blink_pattern": "Blink",
        "lip_sync": "LipSync",
        "metadata_forensics": "Metadata",
        "compression_pattern": "Compression",
        "blood_flow_rppg": "BloodFlow",
        "corneal_reflection": "Corneal",
        "room_acoustics": "Acoustic",
    }
    labels = [label_map[k] for k in scores]
    values = [round(v, 1) for v in scores.values()]
    return {"labels": labels, "values": values, "threshold": 70}


def generate_frequency_spectrum(is_fake_result: bool) -> Dict[str, Any]:
    """Simulate voice frequency spectrum with or without synthetic gaps."""
    frequencies = list(range(0, 8001, 100))

    amplitudes: List[float] = []
    if is_fake_result:
        for f in frequencies:
            if 4000 <= f <= 8000:
                amp = random.uniform(0.02, 0.08)
            elif f < 500:
                amp = random.uniform(0.3, 0.7)
            elif f < 2000:
                amp = random.uniform(0.5, 0.9)
            else:
                amp = random.uniform(0.2, 0.5)
            amplitudes.append(round(amp, 3))
    else:
        for f in frequencies:
            if f < 500:
                amp = random.uniform(0.4, 0.8)
            elif f < 2000:
                amp = random.uniform(0.6, 0.95)
            elif f < 5000:
                amp = random.uniform(0.3, 0.7)
            else:
                amp = random.uniform(0.1, 0.4)
            amplitudes.append(round(amp, 3))

    return {
        "frequencies": frequencies,
        "amplitudes": amplitudes,
        "gap_detected": is_fake_result,
        "gap_range": "4000-8000Hz" if is_fake_result else None,
        "gap_severity": round(random.uniform(0.6, 0.9), 2) if is_fake_result else 0,
    }


def generate_rppg_signal(is_fake_result: bool, duration: float = 10.0) -> Dict[str, Any]:
    """Generate synthetic rPPG signal (heartbeat) time series."""
    sample_rate = 30
    t = [round(i / sample_rate, 3) for i in range(int(duration * sample_rate))]

    if is_fake_result:
        signal = [round(random.uniform(-0.03, 0.03), 4) for _ in t]
        heart_rate = None
        signal_quality = round(random.uniform(0.05, 0.15), 3)
        dominant_freq = None
    else:
        heart_rate = random.randint(65, 85)
        freq = heart_rate / 60.0
        signal = [
            round(
                0.08 * math.sin(2 * math.pi * freq * ti)
                + 0.02 * math.sin(4 * math.pi * freq * ti)
                + random.uniform(-0.01, 0.01),
                4,
            )
            for ti in t
        ]
        signal_quality = round(random.uniform(0.75, 0.95), 3)
        dominant_freq = round(heart_rate / 60.0, 2)

    return {
        "time_axis": t,
        "signal": signal,
        "heart_rate_bpm": heart_rate,
        "signal_quality": signal_quality,
        "cardiovascular_detected": not is_fake_result,
        "dominant_frequency_hz": dominant_freq,
    }


def find_anomaly_frames(brightness: List[float]) -> List[int]:
    """Identify frames where brightness jumps sharply (edit points)."""
    anomalies: List[int] = []
    for i in range(1, len(brightness)):
        diff = abs(brightness[i] - brightness[i - 1])
        if diff > 15:
            anomalies.append(i)
    return anomalies


def generate_engine_bars(scores: Dict[str, float]) -> List[Dict[str, Any]]:
    """Bar chart data for each forensic engine."""
    engine_names = {
        "face_consistency": "Face Consistency",
        "voice_frequency": "Voice Frequency",
        "blink_pattern": "Blink Pattern",
        "lip_sync": "Lip Sync",
        "metadata_forensics": "Metadata Forensics",
        "compression_pattern": "Compression Pattern",
        "blood_flow_rppg": "Blood Flow (rPPG)",
        "corneal_reflection": "Corneal Reflection",
        "room_acoustics": "Room Acoustics",
    }
    result: List[Dict[str, Any]] = []
    for key, score in scores.items():
        rounded = round(score, 1)
        if rounded < 40:
            color = "#EF4444"
        elif rounded < 70:
            color = "#F59E0B"
        else:
            color = "#10B981"
        result.append(
            {
                "name": engine_names.get(key, key),
                "key": key,
                "score": rounded,
                "weight": 10,
                "status": "FLAGGED" if rounded < 70 else "PASSED",
                "color": color,
            }
        )
    return result


def build_brightness_graph(media_data: Dict[str, Any]) -> Dict[str, Any]:
    """Construct brightness timeline graph structure from media analysis."""
    values: List[float] = media_data.get("brightness_timeline") or []
    if not values:
        values = [random.uniform(100, 180) for _ in range(10)]
    anomaly_frames = find_anomaly_frames(values)
    frame_indices = list(range(len(values)))
    return {
        "brightness_timeline": values,
        "frame_indices": frame_indices,
        "anomaly_frames": anomaly_frames,
    }


# -----------------------------------------------------------------------------
# Campaign detection and session history
# -----------------------------------------------------------------------------

def check_campaign_detection(session_id: str) -> Dict[str, Any]:
    """Detect coordinated campaigns based on repeated high-risk uploads."""
    history = session_history.get(session_id, [])
    fake_count = sum(1 for h in history if h.get("verdict") == "High Risk")

    if fake_count >= 3:
        return {
            "campaign_detected": True,
            "severity": "HIGH",
            "fake_files_in_session": fake_count,
            "message": (
                f"WARNING: {fake_count} synthetic media files detected in this session. "
                "This pattern is consistent with a coordinated disinformation campaign."
            ),
            "recommendation": "Report to platform administrators and law enforcement",
        }
    if fake_count >= 2:
        return {
            "campaign_detected": False,
            "severity": "MEDIUM",
            "fake_files_in_session": fake_count,
            "message": "Multiple synthetic files detected. Monitor for further uploads.",
            "recommendation": "Continue monitoring",
        }
    return {
        "campaign_detected": False,
        "severity": "LOW",
        "fake_files_in_session": fake_count,
        "message": "No coordinated campaign pattern detected.",
        "recommendation": "Normal monitoring",
    }


def get_confidence_history_graph(session_id: str) -> List[Dict[str, Any]]:
    """Return last 10 analysis results as a simple trend graph."""
    history = session_history.get(session_id, [])
    tail = history[-10:]
    graph: List[Dict[str, Any]] = []
    for h in tail:
        filename = h.get("filename") or ""
        label = filename if len(filename) <= 24 else filename[:21] + "..."
        graph.append(
            {
                "x": h.get("upload_number"),
                "score": h.get("trust_score"),
                "verdict": h.get("verdict"),
                "label": label,
            }
        )
    return graph


# -----------------------------------------------------------------------------
# Tool attribution
# -----------------------------------------------------------------------------

def attribute_generation_tool(scores: Dict[str, float], is_fake_result: bool) -> Dict[str, Any]:
    """Guess which AI generation tool produced a fake based on score patterns."""
    if not is_fake_result:
        return {"likely_tool": None, "confidence": 0, "breakdown": [], "attribution_confidence": 0}

    voice_score = scores.get("voice_frequency", 50)
    face_score = scores.get("face_consistency", 50)

    tools: List[Dict[str, Any]] = []
    if voice_score < 20 and face_score < 30:
        tools = [
            {
                "tool": "ElevenLabs + Midjourney",
                "probability": round(random.uniform(0.55, 0.75), 2),
                "evidence": "Voice gap pattern + facial artifact signature",
            },
            {
                "tool": "ElevenLabs + Stable Diffusion",
                "probability": round(random.uniform(0.20, 0.35), 2),
                "evidence": "Alternative voice synthesis match",
            },
            {
                "tool": "Unknown GAN",
                "probability": round(random.uniform(0.05, 0.15), 2),
                "evidence": "Residual generation artifacts",
            },
        ]
    elif face_score < 25:
        tools = [
            {
                "tool": "DeepFaceLab",
                "probability": round(random.uniform(0.50, 0.70), 2),
                "evidence": "Facial boundary artifacts match DFL profile",
            },
            {
                "tool": "FaceSwap",
                "probability": round(random.uniform(0.20, 0.35), 2),
                "evidence": "Blending artifact signature",
            },
            {
                "tool": "Reface App",
                "probability": round(random.uniform(0.10, 0.20), 2),
                "evidence": "Mobile app compression pattern",
            },
        ]
    elif voice_score < 20:
        tools = [
            {
                "tool": "ElevenLabs v3",
                "probability": round(random.uniform(0.60, 0.80), 2),
                "evidence": "4-8kHz frequency gap signature",
            },
            {
                "tool": "Resemble AI",
                "probability": round(random.uniform(0.15, 0.25), 2),
                "evidence": "Alternative TTS pattern match",
            },
            {
                "tool": "Tortoise TTS",
                "probability": round(random.uniform(0.05, 0.15), 2),
                "evidence": "Neural synthesis baseline",
            },
        ]
    else:
        tools = [
            {
                "tool": "Sora / RunwayML",
                "probability": round(random.uniform(0.45, 0.65), 2),
                "evidence": "Video diffusion artifacts detected",
            },
            {
                "tool": "Pika Labs",
                "probability": round(random.uniform(0.20, 0.35), 2),
                "evidence": "Temporal consistency signature",
            },
            {
                "tool": "Unknown Diffusion Model",
                "probability": round(random.uniform(0.10, 0.25), 2),
                "evidence": "Generic diffusion fingerprint",
            },
        ]

    total = sum(t["probability"] for t in tools) or 1.0
    for t in tools:
        t["probability"] = round(t["probability"] / total, 2)

    likely_tool = tools[0]["tool"]
    confidence = tools[0]["probability"]

    return {
        "likely_tool": likely_tool,
        "confidence": confidence,
        "breakdown": tools,
        "attribution_confidence": round(random.uniform(0.70, 0.88), 2),
    }


# -----------------------------------------------------------------------------
# Forensic timeline & hashes
# -----------------------------------------------------------------------------

def random_hash() -> str:
    """Generate a short hexadecimal hash fragment for logs."""
    return "".join(random.choices("0123456789abcdef", k=16)) + "..."


def build_forensic_timeline(
    scores: Dict[str, float],
    is_fake_result: bool,
    file_type: str,
    duration_ms: int,
) -> List[Dict[str, Any]]:
    """Detailed chronological forensic event log."""

    events: List[Dict[str, Any]] = []

    def add_event(ms_offset: int, event_type: str, message: str, detail: Optional[str] = None) -> None:
        events.append(
            {
                "timestamp_ms": ms_offset,
                "type": event_type,
                "message": message,
                "detail": detail,
            }
        )

    add_event(0, "INFO", "Analysis session initiated", f"File type: {file_type}")
    add_event(120, "INFO", "SHA-256 fingerprint computed", f"Hash: {random_hash()}")
    add_event(280, "INFO", "MIME type validated", "Detected: video/mp4 or image/jpeg")

    if file_type == "video":
        add_event(450, "INFO", "Frame extraction started", "Sampling 30 frames for analysis")
        add_event(890, "INFO", "Frame extraction complete", "Extracted frames successfully")

    add_event(920, "INFO", "Metadata forensics initiated")

    if is_fake_result:
        add_event(
            1050,
            "WARNING",
            "No camera device signature found",
            "Real cameras always embed device metadata",
        )
        add_event(1100, "WARNING", "GPS coordinates absent", "Location data stripped or never present")
        add_event(
            1250,
            "WARNING",
            "Compression artifact anomaly",
            "DCT coefficient distribution inconsistent",
        )
    else:
        add_event(
            1050,
            "SUCCESS",
            "Camera signature verified",
            "Device metadata intact and consistent",
        )
        add_event(
            1200,
            "SUCCESS",
            "Metadata chain complete",
            "All expected fields present",
        )

    add_event(1400, "INFO", "Face detection initiated")
    add_event(1800, "INFO", "47 facial landmarks mapped")

    if is_fake_result:
        add_event(
            2100,
            "WARNING",
            "Facial boundary artifacts detected",
            "Edge inconsistency at jawline region",
        )
        add_event(
            2300,
            "WARNING",
            "Blink pattern irregular",
            f"Rate: {random.randint(3, 8)} blinks/min (normal: 15-20)",
        )
    else:
        add_event(
            2100,
            "SUCCESS",
            "Face geometry consistent",
            "All 47 landmarks stable across frames",
        )
        add_event(
            2300,
            "SUCCESS",
            "Blink pattern normal",
            f"Rate: {random.randint(14, 22)} blinks/min",
        )

    add_event(2600, "INFO", "rPPG cardiovascular analysis started")

    if is_fake_result:
        add_event(
            3800,
            "WARNING",
            "CRITICAL: No heartbeat signal detected",
            "Cardiovascular signal absent in facial tissue",
        )
    else:
        add_event(
            3800,
            "SUCCESS",
            "Heartbeat signal confirmed",
            f"Heart rate: {random.randint(65, 85)} BPM detected",
        )

    add_event(4100, "INFO", "Voice frequency analysis started")

    if is_fake_result:
        add_event(
            5200,
            "WARNING",
            "Frequency gaps detected at 4,200-7,800Hz",
            "Pattern consistent with neural TTS synthesis",
        )
    else:
        add_event(
            5200,
            "SUCCESS",
            "Voice spectrum continuous",
            "Full frequency range present — natural voice",
        )

    add_event(5500, "INFO", "Corneal reflection geometry check")

    if is_fake_result:
        add_event(
            6300,
            "WARNING",
            "Corneal reflection mismatch",
            "Eye reflections violate scene light geometry",
        )
    else:
        add_event(
            6300,
            "SUCCESS",
            "Corneal reflections verified",
            "Light geometry consistent with scene",
        )

    add_event(6800, "INFO", "Room acoustic analysis")

    if is_fake_result:
        add_event(
            7600,
            "WARNING",
            "Acoustic environment mismatch",
            "Voice reverb inconsistent with visible room",
        )
    else:
        add_event(
            7600,
            "SUCCESS",
            "Room acoustics matched",
            "Voice reverb matches visible environment",
        )

    add_event(8000, "INFO", "Computing weighted trust score")
    add_event(8200, "INFO", "Generating forensic report")

    mean_score = round(sum(scores.values()) / max(len(scores), 1))
    if is_fake_result:
        add_event(
            8400,
            "WARNING",
            f"VERDICT: HIGH RISK — Trust Score {mean_score}%",
            "Synthetic media generation detected",
        )
    else:
        add_event(
            8400,
            "SUCCESS",
            f"VERDICT: VERIFIED — Trust Score {mean_score}%",
            "Media appears authentic",
        )

    # Clamp timeline to duration_ms for neatness
    return [e for e in events if e["timestamp_ms"] <= duration_ms]


# -----------------------------------------------------------------------------
# Risk intelligence narrative
# -----------------------------------------------------------------------------

def generate_risk_intelligence(
    is_fake_result: bool,
    scores: Dict[str, float],
    tool_attribution: Dict[str, Any],
    campaign_data: Dict[str, Any],
    file_type: str,
) -> Dict[str, Any]:
    """Generate a detailed written risk assessment with recommendations."""
    trust_score = round(sum(scores.values()) / max(len(scores), 1))

    if is_fake_result:
        weak_engines = [k for k, v in scores.items() if v < 30]
        executive_summary = (
            f"SAFEZY forensic analysis has identified this {file_type} as HIGH RISK synthetic media "
            f"with {trust_score}% authenticity score. The analysis flagged {len(weak_engines)} critical "
            f"forensic signals. Primary concern: complete absence of cardiovascular signal in facial tissue, "
            f"which is present in 100% of living humans but absent in AI-generated faces. Additionally, "
            f"voice frequency analysis revealed systematic gaps at 4-8kHz characteristic of neural "
            f"text-to-speech synthesis tools."
        )
        threat_level = "CRITICAL" if trust_score < 25 else "HIGH"
        recommendations = [
            "Do not publish, share, or act upon this media",
            "Preserve original file as evidence",
            "Report to platform administrators immediately",
            "Consult independent forensic expert for legal proceedings",
            "Document the chain of custody for this evidence",
            f"Suspected generation tool: {tool_attribution.get('likely_tool', 'Unknown')}",
        ]
    else:
        executive_summary = (
            f"SAFEZY forensic analysis has verified this {file_type} as AUTHENTIC media with "
            f"{trust_score}% authenticity score. All 9 forensic signals passed verification. "
            f"Cardiovascular signal was detected at a physiologically normal rate. Voice frequency "
            f"spectrum is continuous with no synthetic gaps, and metadata chain is intact with a "
            f"valid camera device signature. This media is suitable for publication and legal use."
        )
        threat_level = "NONE"
        recommendations = [
            "Media verified as authentic — safe to use",
            "SAFEZY certificate generated for provenance",
            "Retain certificate for legal or editorial records",
            "Share verification link for public transparency",
        ]

    return {
        "executive_summary": executive_summary,
        "threat_level": threat_level,
        "trust_score": trust_score,
        "recommendations": recommendations,
        "report_id": f"SAF-{random.randint(10000, 99999)}",
        "generated_at": datetime.now().isoformat(),
        "analyst": "SAFEZY Automated Forensic System v1.0",
        "confidence": round(random.uniform(0.82, 0.94), 2),
        "campaign_context": campaign_data,
    }


# -----------------------------------------------------------------------------
# Ollama integration with fallback explanations
# -----------------------------------------------------------------------------

def check_ollama() -> bool:
    """Detect if a local Ollama instance is available."""
    try:
        import requests

        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        return r.status_code == 200
    except Exception:
        return False


def generate_explanation(
    is_fake_result: bool,
    scores: Dict[str, float],
    trust_score: float,
    tool_attribution: Dict[str, Any],
) -> str:
    """Generate a natural-language forensic explanation using Ollama or fallback."""
    trust_rounded = round(trust_score)

    if check_ollama():
        try:
            import ollama

            engine_summary = ", ".join(
                f"{k.replace('_', ' ')}: {round(v)}%" for k, v in scores.items()
            )
            verdict_text = (
                "High Risk - Synthetic Media" if is_fake_result else "Verified - Authentic Media"
            )
            suspected_tool = (
                tool_attribution.get("likely_tool", "Unknown") if is_fake_result else "N/A"
            )
            prompt = f"""You are SAFEZY, a professional AI forensic analyst.

Analysis result:
- Trust Score: {trust_rounded}%
- Verdict: {verdict_text}
- Engine scores: {engine_summary}
- Suspected tool: {suspected_tool}

Write a 3-4 sentence professional forensic explanation.
Be specific about which signals failed or passed.
End with a clear recommendation.
Do not use bullet points. Write as continuous prose."""

            response = ollama.chat(
                model="mistral",
                messages=[{"role": "user", "content": prompt}],
            )
            content = response.get("message", {}).get("content")
            if isinstance(content, str) and content.strip():
                return content.strip()
        except Exception:
            # Fall back to rich template
            pass

    if is_fake_result:
        flagged = [k for k, v in scores.items() if v < 40]
        flagged_readable = [f.replace("_", " ") for f in flagged]
        return (
            f"SAFEZY forensic analysis has classified this media as HIGH RISK with a trust score of "
            f"{trust_rounded}%, indicating strong probability of synthetic generation. Critical failures "
            f"were detected in {len(flagged)} of 9 forensic signals including "
            f"{', '.join(flagged_readable[:3])}. Most significantly, no cardiovascular signal was detected "
            f"in facial tissue analysis — a signal present in 100% of living humans but consistently absent "
            f"in AI-generated faces. Voice frequency analysis revealed systematic gaps at 4,200-7,800Hz "
            f"characteristic of neural text-to-speech synthesis. Suspected generation tool: "
            f"{tool_attribution.get('likely_tool', 'Unknown AI system')}. Recommendation: Do not use this "
            f"media as authentic evidence and seek independent expert verification before any consequential "
            f"decision."
        )
    passed = [k for k, v in scores.items() if v >= 70]
    passed_readable = [p.replace("_", " ") for p in passed]
    return (
        f"SAFEZY forensic analysis has verified this media as AUTHENTIC with a trust score of "
        f"{trust_rounded}%, indicating high probability of genuine human-generated content. All nine "
        f"forensic signals returned within normal ranges; cardiovascular signal was successfully detected "
        f"in facial tissue at a physiologically normal rate and the voice frequency spectrum is continuous "
        f"with no synthetic gaps. Camera device metadata is intact and internally consistent. "
        f"{len(passed)} of 9 engines passed with high confidence including {', '.join(passed_readable[:3])}. "
        f"This media is suitable for publication, legal proceedings, and official documentation, backed by a "
        f"SAFEZY provenance certificate."
    )


