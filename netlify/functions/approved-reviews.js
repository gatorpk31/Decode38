const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
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
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ reviews: approved.slice(0, 20) }),
    };
  } catch (err) {
    console.error("Reviews error:", err.message);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviews: [] }) };
  }
};
