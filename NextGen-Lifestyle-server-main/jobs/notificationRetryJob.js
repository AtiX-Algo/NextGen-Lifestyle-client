const NotificationLog = require("../models/NotificationLog");
const { sendSmsWithRetry, MAX_SMS_ATTEMPTS } = require("../services/notifications/smsService");

async function runNotificationRetryOnce() {
  const now = new Date();

  const pending = await NotificationLog.find({
    channel: "sms",
    status: "failed",
    nextRetryAt: { $ne: null, $lte: now },
    attempts: { $lt: MAX_SMS_ATTEMPTS },
  }).limit(50);

  for (const log of pending) {
    await sendSmsWithRetry(log._id);
  }
}

function startNotificationRetryLoop() {
  // Simple loop every 30 seconds (no extra dependency)
  setInterval(() => {
    runNotificationRetryOnce().catch((e) => console.error("Retry loop error:", e));
  }, 30_000);
}

module.exports = { startNotificationRetryLoop };
