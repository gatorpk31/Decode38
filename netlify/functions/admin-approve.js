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
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { key, action } = JSON.parse(event.body);

    if (!key) {
      return { statusCode: 400, body: JSON.stringify({ error: "Key is required" }) };
    }

    const store = getStore("feedback");

    if (action === "delete") {
      await store.delete(key);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, message: "Feedback deleted" }),
      };
    }

    // Default: toggle approval
    const feedback = await store.get(key, { type: "json" });
    if (!feedback) {
      return { statusCode: 404, body: JSON.stringify({ error: "Feedback not found" }) };
    }

    feedback.approved = !feedback.approved;
    await store.setJSON(key, feedback);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, approved: feedback.approved }),
    };
  } catch (err) {
    console.error("Approve error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to update feedback" }) };
  }
};
