const { getBlobStore } = require("./_blobs");
const { corsHeaders, verifyAdminToken } = require("./_security");

exports.handler = async (event) => {
  const CORS = corsHeaders(event, "Content-Type, Authorization");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!verifyAdminToken(event.headers.authorization)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const feedbackStore = getBlobStore("feedback");
    const donationStore = getBlobStore("donations");

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
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Failed to load admin data" }) };
  }
};
