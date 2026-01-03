const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getPreferences(userId) {
  const res = await fetch(`${API_BASE}/api/notifications/preferences/${userId}`);
  if (!res.ok) throw new Error("Failed to load preferences");
  return res.json();
}

export async function savePreferences(userId, payload) {
  const res = await fetch(`${API_BASE}/api/notifications/preferences/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save preferences");
  }
  return res.json();
}