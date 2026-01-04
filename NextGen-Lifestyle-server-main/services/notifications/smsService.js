const NotificationLog = require("../../models/NotificationLog");
const { sendSms } = require("./providers/smsNetBdProvider");
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
      lastError: "Invalid BD phone number. Must be 017XXXXXXXX or +88017XXXXXXXX or 88017XXXXXXXX",
      nextRetryAt: null,
      $push: {
        attemptLogs: {
          attempt: 1,
          at: new Date(),
          status: "failed",
          error: "invalid_number",
        },
      },
    });
    return { ok: false, reason: "invalid_number" };
  }

  // Attempt send now
  return sendSmsWithRetry(log._id);
}

async function sendSmsWithRetry(logId) {
  const log = await NotificationLog.findById(logId);
  if (!log) return { ok: false, reason: "log_not_found" };

  const attemptNo = (log.attempts || 0) + 1;

  try {
    const requestId = await sendSms({ to: log.to, body: log.message });

    await NotificationLog.findByIdAndUpdate(log._id, {
      $set: {
        status: "sent",
        attempts: attemptNo,
        lastError: "",
        nextRetryAt: null,
      },
      $push: {
        attemptLogs: {
          attempt: attemptNo,
          at: new Date(),
          status: "sent",
          providerRequestId: requestId ? String(requestId) : "",
        },
      },
    });

    return { ok: true, requestId };
  } catch (err) {
    const nextAttempts = attemptNo;

    const updates = {
      status: "failed",
      attempts: nextAttempts,
      lastError: err.message || "SMS send failed",
      nextRetryAt: nextAttempts < MAX_SMS_ATTEMPTS ? computeNextRetry(nextAttempts) : null,
    };

    await NotificationLog.findByIdAndUpdate(log._id, {
      $set: updates,
      $push: {
        attemptLogs: {
          attempt: nextAttempts,
          at: new Date(),
          status: "failed",
          error: updates.lastError,
        },
      },
    });

    return { ok: false, reason: "sms_failed", attempts: nextAttempts };
  }
}

module.exports = { trySendSms, sendSmsWithRetry, MAX_SMS_ATTEMPTS };
