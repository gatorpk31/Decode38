/**
 * Shared security helpers for Netlify functions:
 * origin-restricted CORS, constant-time comparisons, admin token
 * verification, and a blob-backed rate limiter.
 */
const crypto = require("crypto");
const { getBlobStore } = require("./_blobs");

const ALLOWED_ORIGINS = [
  "https://decode38.com",
  "https://www.decode38.com",
];

/** CORS headers restricted to the production origins (plus localhost in dev). */
function corsHeaders(event, extraAllowHeaders) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+--decode38\.netlify\.app$/.test(origin) ||
    /^http:\/\/localhost(:\d+)?$/.test(origin);
  const headers = {
    "Access-Control-Allow-Headers": extraAllowHeaders || "Content-Type",
    "Content-Type": "application/json",
  };
  if (allowed) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

/** Constant-time string equality (pads to equal length first). */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Compare against self to keep timing uniform, then fail
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Verify the admin session token issued by admin-login. */
function verifyAdminToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  if (!process.env.ADMIN_PASSWORD) return false;
  const token = authHeader.slice(7);
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payloadB64 = token.slice(0, dotIdx);
  const hmac = token.slice(dotIdx + 1);
  try {
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto
      .createHmac("sha256", process.env.ADMIN_PASSWORD)
      .update(payload)
      .digest("hex");
    if (!safeEqual(hmac, expected)) return false;
    const { expires } = JSON.parse(payload);
    return Date.now() <= expires;
  } catch {
    return false;
  }
}

/**
 * Blob-backed fixed-window rate limiter.
 * Returns true when the request is ALLOWED. Fails open on storage errors so
 * a Blobs outage cannot take user-facing features down with it.
 */
async function rateLimitAllow(scope, event, maxAttempts, windowMs) {
  const ip =
    (event.headers &&
      (event.headers["x-nf-client-connection-ip"] ||
        (event.headers["x-forwarded-for"] || "").split(",")[0].trim())) ||
    "unknown";
  const key = `rl_${scope}_${ip.replace(/[^a-zA-Z0-9_.:-]/g, "")}`;
  try {
    const store = getBlobStore("ratelimits");
    const now = Date.now();
    const rec = (await store.get(key, { type: "json" })) || null;
    if (rec && now < rec.resetAt) {
      if (rec.count >= maxAttempts) return false;
      await store.setJSON(key, { count: rec.count + 1, resetAt: rec.resetAt });
      return true;
    }
    await store.setJSON(key, { count: 1, resetAt: now + windowMs });
    return true;
  } catch (err) {
    console.error("Rate limiter storage error (failing open):", err.message);
    return true;
  }
}

module.exports = { corsHeaders, safeEqual, verifyAdminToken, rateLimitAllow };
