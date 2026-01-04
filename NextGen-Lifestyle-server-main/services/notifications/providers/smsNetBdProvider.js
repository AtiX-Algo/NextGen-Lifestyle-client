const https = require("https");

function getEnv() {
  const apiKey = process.env.SMS_NET_BD_API_KEY;
  const senderId = process.env.SMS_NET_BD_SENDER_ID;

  if (!apiKey) {
    throw new Error("sms.net.bd api key missing: SMS_NET_BD_API_KEY");
  }

  return { apiKey, senderId };
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode || 0, json });
          } catch (e) {
            reject(new Error("Invalid JSON response from sms.net.bd"));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

async function sendSms({ to, body }) {
  const { apiKey, senderId } = getEnv();

  const url = new URL("https://api.sms.net.bd/sendsms");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("msg", body);
  url.searchParams.set("to", to);
  if (senderId) url.searchParams.set("sender_id", senderId);

  const { statusCode, json } = await httpsGetJson(url);

  if (!json || typeof json.error === "undefined") {
    throw new Error("sms.net.bd unknown response");
  }

  if (Number(json.error) !== 0) {
    const msg = json.msg || "sms.net.bd send failed";
    throw new Error(`${msg} (http ${statusCode || "?"}, error ${json.error})`);
  }

  const requestId = json?.data?.request_id;
  return requestId;
}

module.exports = { sendSms };
