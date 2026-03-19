const { getBlobStore } = require("./_blobs");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, rating, message } = body;

    if (!message || message.trim().length < 5) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Message is required (min 5 characters)" }) };
    }
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Rating must be 1-5" }) };
    }
    if (message.length > 2000) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Message too long (max 2000 characters)" }) };
    }

    const feedback = {
      name: (name || "Anonymous").substring(0, 100),
      email: (email || "").substring(0, 200),
      rating: Math.round(Number(rating)),
      message: message.trim().substring(0, 2000),
      date: new Date().toISOString(),
      approved: false,
    };

    try {
      const store = getBlobStore("feedback");
      const key = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await store.setJSON(key, feedback);
    } catch (blobErr) {
      console.error("Blobs error:", blobErr.message);
      console.log("FEEDBACK_FALLBACK:", JSON.stringify(feedback));
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, message: "Thank you for your feedback!" }),
    };
  } catch (err) {
    console.error("Feedback error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Failed to submit feedback" }) };
  }
};
