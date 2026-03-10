export const getBackendUrl = async () => {
  try {
    const res = await fetch("http://localhost:5001/port");
    if (!res.ok) {
      throw new Error("Port endpoint not reachable");
    }
    const data = await res.json();
    if (!data || !data.port) {
      throw new Error("Invalid port response");
    }
    return `http://localhost:${data.port}`;
  } catch {
    for (let port = 5001; port <= 5100; port++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 500);
        const r = await fetch(`http://localhost:${port}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (r.ok) {
          return `http://localhost:${port}`;
        }
      } catch {
        // continue scanning other ports
      }
    }
    return null; // Backend offline — use demo data
  }
};

