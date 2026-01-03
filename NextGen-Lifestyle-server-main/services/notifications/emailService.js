const { google } = require("googleapis");

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail OAuth env missing: GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN");
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return oAuth2Client;
}

function makeRawEmail({ from, to, subject, text }) {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
  ];
  const message = messageParts.join("\n");

  // base64url encode
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail({ to, subject, text }) {
  const from = process.env.GMAIL_SENDER;
  if (!from) throw new Error("GMAIL_SENDER is missing (example: your@gmail.com)");

  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const raw = makeRawEmail({ from, to, subject, text });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return res.data.id;
}

module.exports = { sendEmail };
