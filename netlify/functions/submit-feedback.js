const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { name, email, rating, message } = JSON.parse(event.body);

    if (!message || message.trim().length < 5) {
      return { statusCode: 400, body: JSON.stringify({ error: "Message is required (min 5 characters)" }) };
    }
    if (!rating || rating < 1 || rating > 5) {
      return { statusCode: 400, body: JSON.stringify({ error: "Rating must be 1-5" }) };
    }
    if (message.length > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Message too long (max 2000 characters)" }) };
    }

    const feedback = {
      name: (name || "Anonymous").substring(0, 100),
      email: (email || "").substring(0, 200),
      rating: Math.round(Number(rating)),
      message: message.trim().substring(0, 2000),
      date: new Date().toISOString(),
      approved: false,
    };

    const store = getStore("feedback");
    const key = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, feedback);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Thank you for your feedback!" }),
    };
  } catch (err) {
    console.error("Feedback error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to submit feedback" }) };
  }
};
