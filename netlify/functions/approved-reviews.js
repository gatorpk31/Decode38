const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { getStore } = require("@netlify/blobs");
    const store = getStore("feedback");
    const list = await store.list();

    const approved = [];
    for (const blob of list.blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data && data.approved) {
        approved.push({
          name: data.name,
          rating: data.rating,
          message: data.message,
          date: data.date,
        });
      }
    }

    approved.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: { ...CORS, "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ reviews: approved.slice(0, 20) }),
    };
  } catch (err) {
    console.error("Reviews error:", err.message);
    // Return empty list — don't crash the page
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reviews: [] }),
    };
  }
};
