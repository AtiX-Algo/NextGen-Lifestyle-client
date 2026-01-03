const twilio = require("twilio");

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error("Twilio credentials missing: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN");
  }
  return twilio(sid, token);
}

async function sendSms({ to, body }) {
  const from = process.env.TWILIO_FROM; // e.g. +1xxxx or a sender id where supported
  if (!from) throw new Error("TWILIO_FROM is missing");

  const client = getTwilioClient();
  const msg = await client.messages.create({ from, to, body });
  return msg.sid;
}

module.exports = { sendSms };
