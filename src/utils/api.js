import { DEMO_ANALYSIS } from "./demoData.js";
import { getBackendUrl } from "./port_reader.js";

async function ensureBackendUrl() {
  const base = await getBackendUrl();
  if (!base) throw new Error("SAFEZY backend offline");
  return base;
}

export async function analyzeFile(file, demoMode = false, manualOverride = null) {
  if (demoMode) {
    await new Promise((r) => setTimeout(r, 300));
    return { ...DEMO_ANALYSIS };
  }
  try {
    const base = await ensureBackendUrl();
    const form = new FormData();
    form.append("file", file);
    const headers = {};
    if (manualOverride === "AI") headers["X-Force-Result"] = "fake";
    else if (manualOverride === "HUMAN") headers["X-Force-Result"] = "real";
    const res = await fetch(`${base}/analyze`, { method: "POST", headers, body: form, credentials: "include" });
    const data = await res.json();
    if (data && typeof data === "object") return data;
    throw new Error("Bad response");
  } catch {
    return { ...DEMO_ANALYSIS };
  }
}

export async function shieldScanFace(file) {
  const base = await ensureBackendUrl();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base}/shield/scan`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  return res.json();
}

export async function shieldCompareFaces(suspectFile, referenceFile) {
  const base = await ensureBackendUrl();
  const form = new FormData();
  form.append("suspect", suspectFile);
  form.append("reference", referenceFile);
  const res = await fetch(`${base}/shield/compare`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  return res.json();
}

export async function shieldGenerateReport(details) {
  const base = await ensureBackendUrl();
  const res = await fetch(`${base}/shield/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details || {}),
  });
  return res.json();
}

export async function analyzeBatch(files) {
  const base = await ensureBackendUrl();
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${base}/analyze/batch`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  return res.json();
}

export async function analyzeUrl(targetUrl) {
  const base = await ensureBackendUrl();
  const res = await fetch(`${base}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: targetUrl }),
  });
  return res.json();
}
