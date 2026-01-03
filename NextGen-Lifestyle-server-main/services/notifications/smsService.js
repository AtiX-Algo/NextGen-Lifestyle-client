const NotificationLog = require("../../models/NotificationLog");
const { sendSms } = require("./providers/twilioProvider");
const { isValidBdNumber, normalizeBdNumber, computeNextRetry } = require("./utils");

const MAX_SMS_ATTEMPTS = 3;

async function trySendSms({ userId, eventType, phoneNumber, message }) {
  const to = normalizeBdNumber(phoneNumber);

  // Create log
  const log = await NotificationLog.create({
    userId,
    eventType,
    channel: "sms",
    to,
    message,
    status: "pending",
    attempts: 0,
  });

  // Validate BD number
  if (!isValidBdNumber(to)) {
    await NotificationLog.findByIdAndUpdate(log._id, {
      status: "failed",
      attempts: 1,
      lastError: "Invalid BD phone number. Must be +8801XXXXXXXXX",
      nextRetryAt: null,
    });
    return { ok: false, reason: "invalid_number" };
  }

  // Attempt send now
  return sendSmsWithRetry(log._id);
}

async function sendSmsWithRetry(logId) {
  const log = await NotificationLog.findById(logId);
  if (!log) return { ok: false, reason: "log_not_found" };

  try {
    const sid = await sendSms({ to: log.to, body: log.message });

    await NotificationLog.findByIdAndUpdate(log._id, {
      status: "sent",
      attempts: log.attempts + 1,
      lastError: "",
      nextRetryAt: null,
    });

    return { ok: true, sid };
  } catch (err) {
    const nextAttempts = log.attempts + 1;

    const updates = {
      status: "failed",
      attempts: nextAttempts,
      lastError: err.message || "SMS send failed",
      nextRetryAt: nextAttempts < MAX_SMS_ATTEMPTS ? computeNextRetry(nextAttempts) : null,
    };

    await NotificationLog.findByIdAndUpdate(log._id, updates);

    return { ok: false, reason: "sms_failed", attempts: nextAttempts };
  }
}

module.exports = { trySendSms, sendSmsWithRetry, MAX_SMS_ATTEMPTS };
