const { getBlobStore } = require("./_blobs");
const { corsHeaders, verifyAdminToken } = require("./_security");

exports.handler = async (event) => {
  const CORS = corsHeaders(event, "Content-Type, Authorization");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!verifyAdminToken(event.headers.authorization)) {
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
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Failed to update review" }) };
  }
};
