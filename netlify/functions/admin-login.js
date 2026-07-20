const crypto = require("crypto");
const { corsHeaders, safeEqual, rateLimitAllow } = require("./_security");

exports.handler = async (event) => {
  const CORS = corsHeaders(event);
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Admin login is not configured." }) };
  }

  // 5 attempts per IP per 15 minutes — the admin password is a single shared
  // secret, so brute-force protection is essential.
  const allowed = await rateLimitAllow("adminlogin", event, 5, 15 * 60 * 1000);
  if (!allowed) {
    return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: "Too many attempts. Try again in 15 minutes." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { password } = body;

    if (!password) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Password is required" }) };
    }

    if (!safeEqual(password, process.env.ADMIN_PASSWORD)) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Invalid password" }) };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    const payload = JSON.stringify({ token, expires });
    const hmac = crypto
      .createHmac("sha256", process.env.ADMIN_PASSWORD)
      .update(payload)
      .digest("hex");

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ token: `${Buffer.from(payload).toString("base64")}.${hmac}` }),
    };
  } catch (err) {
    console.error("Login error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Login failed" }) };
  }
};
