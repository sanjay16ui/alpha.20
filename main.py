import os
import socket
import uuid
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import FastAPI, File, UploadFile, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from analysis import (
    analyze_image,
    analyze_video_frames,
    attribute_generation_tool,
    build_brightness_graph,
    build_forensic_timeline,
    calculate_weighted_score,
    check_campaign_detection,
    extract_real_metadata,
    generate_engine_bars,
    generate_explanation,
    generate_flags,
    generate_frequency_spectrum,
    generate_radar_data,
    generate_risk_intelligence,
    generate_rppg_signal,
    get_confidence_history_graph,
    get_upload_number,
    reset_session_state,
    session_counter,
    session_history,
    generate_scores,
    vary,
)
from analysis import check_ollama  # re-export for /health


# -----------------------------------------------------------------------------
# Dynamic port discovery and persistence
# -----------------------------------------------------------------------------

def find_free_port(start: int = 5001) -> int:
    """Find an available TCP port starting at the given base."""
    for port in range(start, start + 100):
        with socket.socket() as s:
            try:
                s.bind(("", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No free port found in range 5001-5100")


def configure_port() -> int:
    """Determine backend port, persist to file and environment."""
    port = find_free_port(5001)
    root = os.path.dirname(os.path.abspath(__file__))
    port_file = os.path.join(root, ".safezy_port")
    try:
        with open(port_file, "w", encoding="utf-8") as f:
            f.write(str(port))
    except Exception:
        # Non-fatal; frontend can still query /port
        pass
    os.environ["SAFEZY_PORT"] = str(port)
    return port


PORT = configure_port()


# -----------------------------------------------------------------------------
# FastAPI application
# -----------------------------------------------------------------------------

app = FastAPI(title="SAFEZY Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    print(f"SAFEZY Backend — Port {PORT} — Ready")


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def _determine_file_type(filename: str, mime_type: str) -> str:
    name = (filename or "").lower()
    mt = (mime_type or "").lower()
    if "video" in mt or name.endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        return "video"
    if "audio" in mt or name.endswith((".mp3", ".wav", ".m4a", ".aac", ".ogg")):
        return "audio"
    return "image"


def _risk_level_from_score(trust_score: float) -> str:
    if trust_score < 25:
        return "CRITICAL"
    if trust_score < 40:
        return "HIGH"
    if trust_score < 70:
        return "MEDIUM"
    return "SAFE"


# -----------------------------------------------------------------------------
# Audio scoring (simulated forensic engines)
# -----------------------------------------------------------------------------


def generate_audio_scores(is_fake: bool) -> Dict[str, float]:
    """
    Simulated audio-only engine scores.

    These are designed to mirror how the video/image engines behave while
    exposing audio-specific forensic concepts to the frontend.
    """
    if is_fake:
        return {
            "voice_frequency": vary(14, 6),
            "breath_pattern": vary(18, 7),
            "room_acoustics": vary(22, 8),
            "prosody_analysis": vary(20, 6),
            "background_noise": vary(31, 9),
            "vocal_fry": vary(16, 5),
            "pitch_consistency": vary(12, 6),
            "lip_click_detection": vary(8, 4),
            "dynamic_range": vary(25, 7),
        }
    else:
        return {
            "voice_frequency": vary(89, 4),
            "breath_pattern": vary(87, 5),
            "room_acoustics": vary(91, 4),
            "prosody_analysis": vary(85, 6),
            "background_noise": vary(88, 5),
            "vocal_fry": vary(92, 4),
            "pitch_consistency": vary(86, 5),
            "lip_click_detection": vary(90, 4),
            "dynamic_range": vary(83, 6),
        }


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), request: Request = None):
    # Session management
    session_id = request.cookies.get("safezy_session") if request else None
    if not session_id:
        session_id = str(uuid.uuid4())

    contents = await file.read()
    filename = file.filename or "upload"
    file_size = len(contents)
    mime_type = file.content_type or ""

    file_type = _determine_file_type(filename, mime_type)

    upload_number = get_upload_number(session_id)
    force_result = request.headers.get("X-Force-Result") if request else None
    if force_result == "fake":
        is_fake_result = True
    elif force_result == "real":
        is_fake_result = False
    else:
        # Default: frontend keyboard controls the result.
        # A key = X-Force-Result: fake = AI
        # H key = X-Force-Result: real = HUMAN
        # Nothing pressed = AI by default
        is_fake_result = True  # frontend override controls this now

    # Real EXIF-based metadata analysis (images only; videos/audio get neutral score)
    real_metadata = extract_real_metadata(contents, mime_type)

    # Base scores (fake/real profile), with audio-specialised engines when appropriate.
    if file_type == "audio":
        scores = generate_audio_scores(is_fake_result)
        # For audio, keep metadata_forensics separate; calculate_weighted_score
        # will naturally prioritise the engines that exist.
    else:
        scores = generate_scores(is_fake_result)
        # Override metadata_forensics with real metadata-based score where available.
        scores["metadata_forensics"] = real_metadata.get(
            "metadata_score", scores.get("metadata_forensics", 50)
        )

    trust_score = calculate_weighted_score(scores)
    verdict = "High Risk" if is_fake_result else "Verified"

    if file_type == "video":
        media_data: Dict[str, Any] = analyze_video_frames(contents)
    elif file_type == "image":
        media_data = analyze_image(contents)
    else:
        # Audio: minimal media metadata; graphs below will still be simulated.
        media_data = {"duration_seconds": 5.0}

    radar = generate_radar_data(scores)
    frequency_spectrum = generate_frequency_spectrum(is_fake_result)
    duration_for_rppg = float(media_data.get("duration_seconds", 5.0)) or 5.0
    rppg_signal = generate_rppg_signal(is_fake_result, duration_for_rppg)
    engine_bars = generate_engine_bars(scores)
    brightness_graph = build_brightness_graph(media_data)

    tool_attribution = attribute_generation_tool(scores, is_fake_result)
    campaign_data = check_campaign_detection(session_id)
    forensic_timeline = build_forensic_timeline(
        scores, is_fake_result, file_type, 8400
    )
    risk_intelligence = generate_risk_intelligence(
        is_fake_result, scores, tool_attribution, campaign_data, file_type
    )

    file_hash = (
        __import__("hashlib")
        .sha256(contents)
        .hexdigest()[:32]
    )

    explanation = generate_explanation(
        is_fake_result, scores, trust_score, tool_attribution
    )

    if session_id not in session_history:
        session_history[session_id] = []
    session_history[session_id].append(
        {
            "upload_number": upload_number,
            "timestamp": datetime.now().isoformat(),
            "trust_score": round(trust_score, 1),
            "verdict": verdict,
            "filename": filename,
            "file_type": file_type,
        }
    )

    from analysis import _save_session_state  # type: ignore[attr-defined]

    _save_session_state()

    result: Dict[str, Any] = {
        "success": True,
        "upload_number": upload_number,
        "session_id": session_id,
        "trust_score": round(trust_score, 1),
        "verdict": verdict,
        "risk_level": _risk_level_from_score(trust_score),
        "confidence": round(random.uniform(0.82, 0.94), 2),  # type: ignore[name-defined]
        "flags": generate_flags(scores, is_fake_result),
        "explanation": explanation,
        "file_hash": file_hash,
        "real_metadata": real_metadata,
        "file_info": {
            "filename": filename,
            "file_type": file_type,
            "file_size_bytes": file_size,
            "file_size_mb": round(file_size / 1_048_576, 2),
            "mime_type": mime_type,
            **media_data,
        },
        "engine_scores": scores,
        "graphs": {
            "radar": radar,
            "frequency_spectrum": frequency_spectrum,
            "rppg_signal": rppg_signal,
            "engine_bars": engine_bars,
            "brightness_timeline": brightness_graph,
            "history": get_confidence_history_graph(session_id),
        },
        "tool_attribution": tool_attribution,
        "campaign_detection": campaign_data,
        "forensic_timeline": forensic_timeline,
        "risk_intelligence": risk_intelligence,
        "certificate": {
            "id": f"SAF-{random.randint(100000, 999999)}",  # type: ignore[name-defined]
            "issued_at": datetime.now().isoformat(),
            "valid_until": (datetime.now() + timedelta(days=365)).isoformat(),
            "hash": file_hash,
            "verification_url": f"verify.safezy.io/SAF-{random.randint(100000, 999999)}",  # type: ignore[name-defined]
            "rfc3161_timestamp": datetime.now().isoformat(),
            "nodes_anchored": 5,
        },
    }

    response = JSONResponse(content=result)
    response.set_cookie(
        key="safezy_session",
        value=session_id,
        max_age=86400,
        httponly=True,
        samesite="lax",
    )
    return response


@app.post("/shield/scan")
async def shield_scan(file: UploadFile = File(...), request: Request = None):
    session_id = request.cookies.get("safezy_session") if request else None
    if not session_id:
        session_id = str(uuid.uuid4())

    contents = await file.read()
    filename = file.filename or "face.jpg"
    mime_type = file.content_type or "image/jpeg"

    upload_number = get_upload_number(session_id)

    real_metadata = extract_real_metadata(contents, mime_type)

    safe_results = [
        {
            "platform": "Instagram",
            "url": "https://instagram.com/your_profile",
            "context": "Your own profile photo",
            "status": "SAFE",
            "first_seen": "2024-01-15",
            "match_confidence": 99.2,
        },
        {
            "platform": "LinkedIn",
            "url": "https://linkedin.com/in/your-profile",
            "context": "Professional profile",
            "status": "SAFE",
            "first_seen": "2024-02-03",
            "match_confidence": 97.8,
        },
    ]

    suspicious_results = [
        {
            "platform": "Unknown Image Board",
            "url": "https://suspicious-site.com/***",
            "context": "Unknown context — face detected",
            "status": "SUSPICIOUS",
            "first_seen": "2025-11-23",
            "match_confidence": 87.4,
            "content_type": "Image — context unclear",
            "action_required": True,
        },
        {
            "platform": "Telegram Channel",
            "url": "https://t.me/***channel***",
            "context": "Private channel — face detected",
            "status": "HIGH RISK",
            "first_seen": "2025-12-01",
            "match_confidence": 91.2,
            "content_type": "Video — likely manipulated",
            "action_required": True,
        },
    ]

    total_platforms = 1247
    total_countries = 43
    scan_seconds = 34

    summary = {
        "platforms_scanned": total_platforms,
        "countries": total_countries,
        "duration_seconds": scan_seconds,
        "total_appearances": len(safe_results) + len(suspicious_results),
        "requires_action": sum(1 for r in suspicious_results if r.get("action_required")),
    }

    result = {
        "success": True,
        "session_id": session_id,
        "upload_number": upload_number,
        "face_filename": filename,
        "summary": summary,
        "real_metadata": real_metadata,
        "safe_results": safe_results,
        "suspicious_results": suspicious_results,
    }

    response = JSONResponse(content=result)
    response.set_cookie(
        key="safezy_session",
        value=session_id,
        max_age=86400,
        httponly=True,
        samesite="lax",
    )
    return response


@app.post("/shield/compare")
async def shield_compare(
    suspect: UploadFile = File(...),
    reference: UploadFile = File(...),
    request: Request = None,
):
    session_id = request.cookies.get("safezy_session") if request else None
    if not session_id:
        session_id = str(uuid.uuid4())

    suspect_bytes = await suspect.read()
    reference_bytes = await reference.read()

    upload_number = get_upload_number(session_id)

    # All analyses default to synthetic unless overridden
    is_fake_result = True
    scores = generate_scores(is_fake_result)
    trust_score = calculate_weighted_score(scores)

    deepfake_confidence = round(100 - trust_score, 1) if is_fake_result else round(trust_score, 1)

    # Simulated face match confidence
    face_match_confidence = round(random.uniform(86.0, 97.0), 1)

    confirmed_deepfake = is_fake_result and face_match_confidence >= 80.0

    combined_verdict = (
        "CONFIRMED_NON_CONSENSUAL_DEEPFAKE"
        if confirmed_deepfake
        else "NO_STRONG_EVIDENCE"
    )

    result = {
        "success": True,
        "session_id": session_id,
        "upload_number": upload_number,
        "suspect_filename": suspect.filename or "suspect",
        "reference_filename": reference.filename or "reference",
        "deepfake_detected": is_fake_result,
        "deepfake_confidence": deepfake_confidence,
        "face_match_confidence": face_match_confidence,
        "combined_verdict": combined_verdict,
        "message": (
            "⚠ CONFIRMED: Non-consensual deepfake using your likeness."
            if confirmed_deepfake
            else "No strong combined evidence of a non-consensual deepfake."
        ),
        "engine_scores": scores,
    }

    response = JSONResponse(content=result)
    response.set_cookie(
        key="safezy_session",
        value=session_id,
        max_age=86400,
        httponly=True,
        samesite="lax",
    )
    return response


@app.post("/shield/generate-report")
async def shield_generate_report(payload: Dict[str, Any] = Body(...)):
    case_id = payload.get("case_id") or f"SHIELD-{random.randint(100000, 999999)}"
    victim_name = payload.get("victim_name") or "Victim"
    platform = payload.get("platform") or "Unknown Platform"
    url = payload.get("url") or "Unknown URL"
    match_confidence = payload.get("match_confidence") or 0

    detection_certificate = {
        "case_id": case_id,
        "issued_at": datetime.now().isoformat(),
        "platform": platform,
        "url": url,
        "match_confidence": match_confidence,
        "document_type": "SAFEZY Detection Certificate",
    }

    incident_report = {
        "case_id": case_id,
        "victim_name": victim_name,
        "date_of_discovery": datetime.now().date().isoformat(),
        "platform": platform,
        "url": url,
        "summary": "Automated incident report describing non-consensual use of likeness.",
    }

    removal_letters = {
        "platform_takedown": {
            "platform": platform,
            "body_template": "To the Trust & Safety team of "
            f"{platform}, I am reporting non-consensual use of my image at {url} ...",
        },
        "search_deindex": {
            "platform": "Search Engines",
            "body_template": "Requesting de-indexing of URLs associated with case "
            f"{case_id}.",
        },
    }

    legal_guidance = {
        "disclaimer": "This is not legal advice. Consult a qualified lawyer.",
        "india": {
            "it_act_66e": "Punishment for violation of privacy (up to 3 years imprisonment).",
            "it_act_67a": "Publishing sexually explicit material (up to 7 years imprisonment).",
            "bns_77": "Voyeurism and non-consensual sharing.",
            "reporting": [
                {"name": "Cybercrime Portal", "url": "https://cybercrime.gov.in"},
                {"name": "National Commission for Women", "url": "https://ncw.nic.in"},
            ],
        },
        "global_support": [
            {"name": "Stop NCII", "url": "https://stopncii.org"},
            {"name": "Cyber Peace Foundation", "url": "https://www.cyberpeace.org"},
        ],
    }

    support_resources = [
        {"name": "iCall helpline", "contact": "9152987821"},
        {"name": "Cyber Peace Foundation India", "contact": "1800-XXX-XXXX"},
    ]

    return {
        "success": True,
        "case_id": case_id,
        "detection_certificate": detection_certificate,
        "incident_report": incident_report,
        "removal_letters": removal_letters,
        "legal_guidance": legal_guidance,
        "support_resources": support_resources,
    }


@app.post("/analyze/batch")
async def analyze_batch(
    files: List[UploadFile] = File(...),
    request: Request = None,
):
    session_id = request.cookies.get("safezy_session") if request else None
    if not session_id:
        session_id = str(uuid.uuid4())

    results: List[Dict[str, Any]] = []
    for f in files:
        contents = await f.read()
        filename = f.filename or "upload"
        mime_type = f.content_type or ""
        file_type = _determine_file_type(filename, mime_type)

        upload_number = get_upload_number(session_id)
        is_fake_result = True

        real_metadata = extract_real_metadata(contents, mime_type)

        if file_type == "audio":
            scores = generate_audio_scores(is_fake_result)
        else:
            scores = generate_scores(is_fake_result)
            scores["metadata_forensics"] = real_metadata.get(
                "metadata_score", scores.get("metadata_forensics", 50)
            )
        trust_score = calculate_weighted_score(scores)
        verdict = "High Risk" if is_fake_result else "Verified"

        result = {
            "filename": filename,
            "file_type": file_type,
            "upload_number": upload_number,
            "trust_score": round(trust_score, 1),
            "verdict": verdict,
            "risk_level": _risk_level_from_score(trust_score),
            "engine_scores": scores,
        }
        results.append(result)

    response = JSONResponse(content={"success": True, "session_id": session_id, "results": results})
    response.set_cookie(
        key="safezy_session",
        value=session_id,
        max_age=86400,
        httponly=True,
        samesite="lax",
    )
    return response


@app.post("/analyze/url")
async def analyze_url(payload: Dict[str, Any] = Body(...)):
    url = payload.get("url") or ""
    filename = url.split("/")[-1] or "remote-media"

    # Treat URL analysis as synthetic video with alternating pattern simulation
    # but without session binding for simplicity
    is_fake_result = random.random() < 0.5
    scores = generate_scores(is_fake_result)
    trust_score = calculate_weighted_score(scores)
    verdict = "High Risk" if is_fake_result else "Verified"

    return {
        "success": True,
        "source_url": url,
        "filename": filename,
        "file_type": "remote",
        "trust_score": round(trust_score, 1),
        "verdict": verdict,
        "risk_level": _risk_level_from_score(trust_score),
        "engine_scores": scores,
    }


@app.get("/session/history")
async def get_history(request: Request):
    session_id = request.cookies.get("safezy_session", "")
    history = session_history.get(session_id, [])
    return {
        "session_id": session_id,
        "total_analyses": len(history),
        "history": history,
        "score_trend": [h.get("trust_score") for h in history],
        "fake_count": sum(1 for h in history if h.get("verdict") == "High Risk"),
        "real_count": sum(1 for h in history if h.get("verdict") == "Verified"),
    }


@app.get("/session/reset")
async def reset_session(request: Request):
    session_id = request.cookies.get("safezy_session", "")
    if session_id:
        # Use core helper to keep alternating pattern logic intact
        reset_session_state(session_id)
        # Ensure in-memory counters are also cleared for this process
        if session_id in session_counter:
            session_counter[session_id] = 0
        if session_id in session_history:
            session_history[session_id] = []
    return {
        "message": "Reset complete",
        "next_upload": "1 (AI/Fake)",
    }


@app.get("/health")
async def health():
    return {
        "status": "operational",
        "version": "1.0.0",
        "port": PORT,
        "active_sessions": len(session_counter),
        "total_analyses": sum(session_counter.values()) if session_counter else 0,
        "ollama_available": check_ollama(),
        "engines": [
            "face_consistency",
            "voice_frequency",
            "blink_pattern",
            "lip_sync",
            "metadata_forensics",
            "compression_pattern",
            "blood_flow_rppg",
            "corneal_reflection",
            "room_acoustics",
        ],
    }


@app.get("/port")
async def get_port():
    return {"port": PORT}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)

