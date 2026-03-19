const crypto = require("crypto");
const { getBlobStore } = require("./_blobs");

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
    const expected = crypto.createHmac("sha256", process.env.ADMIN_PASSWORD).update(payload).digest("hex");
    if (hmac !== expected) return false;
    const { expires } = JSON.parse(payload);
    return Date.now() <= expires;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { key, action } = JSON.parse(event.body || "{}");
    if (!key) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Key is required" }) };
    }

    const store = getBlobStore("feedback");

    if (action === "delete") {
      await store.delete(key);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, message: "Feedback deleted" }) };
    }

    const feedback = await store.get(key, { type: "json" });
    if (!feedback) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Feedback not found" }) };
    }

    feedback.approved = !feedback.approved;
    await store.setJSON(key, feedback);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, approved: feedback.approved }) };
  } catch (err) {
    console.error("Approve error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
