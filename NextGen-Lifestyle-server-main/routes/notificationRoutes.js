const express = require("express");
const NotificationPreference = require("../models/NotificationPreference");
const { normalizeBdNumber } = require("../services/notifications/utils");

const router = express.Router();

/**
 * GET /api/notifications/preferences/:userId
 */
router.get("/preferences/:userId", async (req, res) => {
  try {
    const pref = await NotificationPreference.findOne({ userId: req.params.userId });
    res.json(pref || null);
  } catch (e) {
    res.status(500).json({ message: "Failed to load preferences" });
  }
});

/**
 * PUT /api/notifications/preferences/:userId
 * Body: { smsOptIn, emailOptIn, phoneNumber, email }
 */
router.put("/preferences/:userId", async (req, res) => {
  try {
    const payload = {
      smsOptIn: !!req.body.smsOptIn,
      emailOptIn: req.body.emailOptIn !== false,
      phoneNumber: normalizeBdNumber(req.body.phoneNumber || ""),
      email: String(req.body.email || "").trim(),
    };

    const pref = await NotificationPreference.findOneAndUpdate(
      { userId: req.params.userId },
      payload,
      { upsert: true, new: true }
    );

    res.json(pref);
  } catch (e) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

module.exports = router;
