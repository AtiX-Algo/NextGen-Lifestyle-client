const NotificationPreference = require("../../models/NotificationPreference");
const NotificationLog = require("../../models/NotificationLog");
const { trySendSms } = require("./smsService");
const { sendEmail } = require("./emailService");
const { renderTemplate, emailSubject } = require("./templates");

async function notifyUser({ userId, eventType, data }) {
  const pref = await NotificationPreference.findOne({ userId });

  // If no pref exists, treat as opted-out of SMS and opted-in email
  const smsOptIn = pref?.smsOptIn === true;
  const emailOptIn = pref?.emailOptIn !== false;

  const phone = pref?.phoneNumber || "";
  const email = pref?.email || "";

  const message = renderTemplate(eventType, data);

  // 1) SMS if opted in
  if (smsOptIn && phone) {
    const smsRes = await trySendSms({ userId, eventType, phoneNumber: phone, message });
    if (smsRes.ok) return { sms: "sent", email: "skipped" };
    // fallback to email if enabled
    if (emailOptIn && email) {
      await sendEmail({ to: email, subject: emailSubject(eventType), text: message });
      await NotificationLog.create({
        userId,
        eventType,
        channel: "email",
        to: email,
        message,
        status: "sent",
        attempts: 1,
      });
      return { sms: "failed", email: "sent" };
    }
    return { sms: "failed", email: "skipped" };
  }

  // 2) No SMS (opted out or no phone): email fallback
  if (emailOptIn && email) {
    await sendEmail({ to: email, subject: emailSubject(eventType), text: message });
    await NotificationLog.create({
      userId,
      eventType,
      channel: "email",
      to: email,
      message,
      status: "sent",
      attempts: 1,
    });
    return { sms: "skipped", email: "sent" };
  }

  return { sms: "skipped", email: "skipped" };
}

module.exports = { notifyUser };
