// api.js
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const url = (p) => (BASE ? `${BASE}${p}` : p);

export async function getScores() {
  const r = await fetch(url("/api/highscores/")); // ✅
  if (!r.ok) throw new Error("Failed to fetch highscores");
  return r.json();
}

export async function postScore(payload) {
  const r = await fetch(url("/api/highscores/"), { // ✅
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!r.ok) throw new Error("Failed to post score");
  return r.json();
}
