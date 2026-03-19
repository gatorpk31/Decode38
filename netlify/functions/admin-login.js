const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { password } = JSON.parse(event.body);

    if (!process.env.ADMIN_PASSWORD) {
      return { statusCode: 500, body: JSON.stringify({ error: "Admin password not configured" }) };
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: "Invalid password" }) };
    }

    // Generate a session token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    const payload = JSON.stringify({ token, expires });
    const hmac = crypto
      .createHmac("sha256", process.env.ADMIN_PASSWORD)
      .update(payload)
      .digest("hex");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: `${Buffer.from(payload).toString("base64")}.${hmac}` }),
    };
  } catch (err) {
    console.error("Login error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Login failed" }) };
  }
};
