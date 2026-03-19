const crypto = require("crypto");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  if (!process.env.ADMIN_PASSWORD) return false;
  const token = authHeader.slice(7);
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payloadB64 = token.slice(0, dotIdx);
  const hmac = token.slice(dotIdx + 1);

  try {
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto
      .createHmac("sha256", process.env.ADMIN_PASSWORD)
      .update(payload)
      .digest("hex");
    if (hmac !== expected) return false;
    const { expires } = JSON.parse(payload);
    if (Date.now() > expires) return false;
    return true;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { getStore } = require("@netlify/blobs");
    const feedbackStore = getStore("feedback");
    const donationStore = getStore("donations");

    const [feedbackList, donationList] = await Promise.all([
      feedbackStore.list(),
      donationStore.list(),
    ]);

    const feedback = await Promise.all(
      feedbackList.blobs.map(async (blob) => {
        const data = await feedbackStore.get(blob.key, { type: "json" });
        return { key: blob.key, ...(data || {}) };
      })
    );

    const donations = await Promise.all(
      donationList.blobs.map(async (blob) => {
        const data = await donationStore.get(blob.key, { type: "json" });
        return { key: blob.key, ...(data || {}) };
      })
    );

    feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
    donations.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ feedback, donations }),
    };
  } catch (err) {
    console.error("Admin data error:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Failed to fetch data: " + err.message }),
    };
  }
};
