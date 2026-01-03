import { useEffect, useState } from "react";
import { getPreferences, savePreferences } from "../services/notificationApi";

function normalizeBdPhone(phone) {
  // Remove all non-digit characters
  let p = String(phone || "").replace(/\D/g, "");
  
  // Handle different formats:
  // - 017xxxxxxxx (11 digits) -> +88017xxxxxxxx
  // - 88017xxxxxxxx (13 digits) -> +88017xxxxxxxx
  // - +88017xxxxxxxx -> +88017xxxxxxxx
  if (p.startsWith("01") && p.length === 11) {
    return "+880" + p.substring(1);
  } else if (p.startsWith("880") && p.length === 13) {
    return "+" + p;
  } else if (p.startsWith("1") && p.length === 10) {
    // Handle case where user enters 1xxxxxxxxx (without leading 0)
    return "+880" + p;
  } else if (p.startsWith("01") && p.length > 11) {
    // Handle case where user enters 01xxxxxxxxx with extra digits
    return "+880" + p.substring(1, 11);
  } else if (p.startsWith("880") && p.length === 13) {
    return "+" + p;
  } else if (p.startsWith("+")) {
    return p; // Already in correct format
  }
  return "";
}

function isValidBdPhone(phone) {
  if (!phone) return false;
  const p = normalizeBdPhone(phone);
  // Match +880 + operator code (1, 3-9) + 8 digits (14 characters total with +)
  return /^\+8801[3-9]\d{8}$/.test(p);
}

export default function NotificationPreferencesPage() {
  // For your project: use a fixed userId for now
  // Later, replace with logged-in user id
  const userId = "USER001";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [smsOptIn, setSmsOptIn] = useState(true);
  const [emailOptIn, setEmailOptIn] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getPreferences(userId)
      .then((pref) => {
        setPhone(pref.phone || "");
        setEmail(pref.email || "");
        setSmsOptIn(Boolean(pref.smsOptIn));
        setEmailOptIn(Boolean(pref.emailOptIn));
      })
      .catch(() => {
        // If not created yet, just keep defaults
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSave() {
    setMessage("");
    setError("");

    const normalizedPhone = normalizeBdPhone(phone);

    if (smsOptIn && normalizedPhone && !isValidBdPhone(normalizedPhone)) {
      setError("Invalid BD phone. Use 017xxxxxxxx or +88017xxxxxxxx.");
      return;
    }

    setSaving(true);
    try {
      await savePreferences(userId, {
        phone: normalizedPhone,
        email,
        smsOptIn,
        emailOptIn,
      });
      setMessage("Preferences saved successfully ✅");
    } catch (e) {
      setError(e.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notification Preferences</h1>

      {message && <div className="alert alert-success mb-4">{message}</div>}
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Bangladesh Phone Number</span>
              <span className="label-text-alt text-gray-500">
                Format: 01XXXXXXXXX (11 digits) or +8801XXXXXXXXX (14 digits with +)
              </span>
            </label>
            <input
              className="input input-bordered w-full"
              placeholder="017xxxxxxxx or +88017xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              If SMS is enabled, phone should be BD format.
            </p>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Email Address</span>
            </label>
            <input
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for fallback if SMS fails or SMS is disabled.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">SMS Opt-in</p>
              <p className="text-xs text-gray-500">If off, system will not send SMS.</p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Email Opt-in</p>
              <p className="text-xs text-gray-500">If on, system can send email notifications.</p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}