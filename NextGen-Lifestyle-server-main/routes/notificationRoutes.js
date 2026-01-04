const express = require("express");
const NotificationPreference = require("../models/NotificationPreference");
const { normalizeBdNumber } = require("../services/notifications/utils");
const { notifyUser } = require("../services/notifications/notificationService");

const router = express.Router();

/**
 * GET /api/notifications/preferences/:userId
 */
router.get("/preferences/:userId", async (req, res) => {
  try {
    const pref = await NotificationPreference.findOne({
      userId: req.params.userId,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json(pref || null);
  } catch (e) {
    res.status(500).json({ message: "Failed to load preferences" });
  }
});

/**
 * GET /api/notifications/preferences/:userId/history
 * Returns all saved preference versions for a user (newest first)
 */
router.get("/preferences/:userId/history", async (req, res) => {
  try {
    const prefs = await NotificationPreference.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(prefs);
  } catch (e) {
    res.status(500).json({ message: "Failed to load preferences history" });
  }
});

/**
 * PUT /api/notifications/preferences/:userId
 * Body: { smsOptIn, emailOptIn, phoneNumber, email }
 */
router.put("/preferences/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId || "").trim();
    if (!userId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const rawPhone = req.body.phoneNumber ?? req.body.phone ?? "";
    const payload = {
      smsOptIn: !!req.body.smsOptIn,
      emailOptIn: req.body.emailOptIn !== false,
      phoneNumber: normalizeBdNumber(rawPhone),
      email: String(req.body.email || "").trim(),
    };

    // Deactivate previous active preference(s) and create a new version
    // Note: some existing DBs may still have an old UNIQUE index on userId.
    // In that case, creating multiple versions will throw duplicate key.
    let pref;
    try {
      await NotificationPreference.updateMany(
        { userId, isActive: true },
        { $set: { isActive: false } }
      );
      pref = await NotificationPreference.create({ userId, isActive: true, ...payload });
    } catch (e) {
      // Fallback: if unique index exists, behave like single-record preferences
      if (e && (e.code === 11000 || String(e.message || "").includes("E11000"))) {
        pref = await NotificationPreference.findOneAndUpdate(
          { userId },
          { ...payload, isActive: true },
          { upsert: true, new: true }
        );
      } else {
        throw e;
      }
    }

    res.json(pref);
  } catch (e) {
    res.status(500).json({
      message: "Failed to update preferences",
      error: e.message,
      code: e.code,
    });
  }
});

/**
 * POST /api/notifications/otp
 * Body: { userId, otp, minutes }
 */
router.post("/otp", async (req, res) => {
  try {
    const { userId, otp, minutes } = req.body || {};
    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp are required" });
    }

    try {
      await notifyUser({ userId, eventType: "OTP", data: { otp, minutes } });
    } catch (e) {
      // never block
      console.log("⚠️ OTP notification failed but flow continues:", e.message);
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: true });
  }
});

/**
 * POST /api/notifications/password-reset
 * Body: { userId, code, minutes }
 */
router.post("/password-reset", async (req, res) => {
  try {
    const { userId, code, minutes } = req.body || {};
    if (!userId || !code) {
      return res.status(400).json({ message: "userId and code are required" });
    }

    try {
      await notifyUser({ userId, eventType: "PASSWORD_RESET", data: { code, minutes } });
    } catch (e) {
      console.log("⚠️ Password reset notification failed but flow continues:", e.message);
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: true });
  }
});

module.exports = router;
