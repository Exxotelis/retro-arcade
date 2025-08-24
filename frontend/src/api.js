const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, ""); // χωρίς trailing /

function url(path) {
  return BASE ? `${BASE}${path}` : path; // relative όταν είναι ίδιο domain
}

export async function getScores() {
  const r = await fetch(url("/api/scores/"));
  if (!r.ok) throw new Error("Failed to fetch scores");
  return r.json();
}

export async function postScore(payload) {
  const r = await fetch(url("/api/scores/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // αν είσαι στο ίδιο domain με Django και θες CSRF:
      // "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
    credentials: "include", // κράτα cookies όταν είσαι same-origin
  });
  if (!r.ok) throw new Error("Failed to post score");
  return r.json();
}
