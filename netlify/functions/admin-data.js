const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const [payloadB64, hmac] = token.split(".");
  if (!payloadB64 || !hmac) return false;

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
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const feedbackStore = getStore("feedback");
    const donationStore = getStore("donations");

    const [feedbackList, donationList] = await Promise.all([
      feedbackStore.list(),
      donationStore.list(),
    ]);

    const feedback = await Promise.all(
      feedbackList.blobs.map(async (blob) => {
        const data = await feedbackStore.get(blob.key, { type: "json" });
        return { key: blob.key, ...data };
      })
    );

    const donations = await Promise.all(
      donationList.blobs.map(async (blob) => {
        const data = await donationStore.get(blob.key, { type: "json" });
        return { key: blob.key, ...data };
      })
    );

    // Sort by date descending
    feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
    donations.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, donations }),
    };
  } catch (err) {
    console.error("Admin data error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch data" }) };
  }
};
