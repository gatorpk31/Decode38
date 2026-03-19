/**
 * GET /api/health
 * Diagnostic endpoint — shows which environment variables are configured
 * and whether Netlify Blobs is accessible.
 * Returns safe info only (no secret values).
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const checks = {
    stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
    admin_password: !!process.env.ADMIN_PASSWORD,
    netlify_blobs_context: !!process.env.NETLIFY_BLOBS_CONTEXT,
    site_url: process.env.URL || "(not set — will default to https://decode38.com)",
  };

  // Test Blobs connectivity
  let blobsOk = false;
  let blobsError = null;
  try {
    const { getStore } = require("@netlify/blobs");
    const store = getStore("health-check");
    await store.set("ping", "pong");
    const val = await store.get("ping");
    blobsOk = val === "pong";
    await store.delete("ping");
  } catch (err) {
    blobsError = err.message;
  }

  const allGood =
    checks.stripe_secret_key &&
    checks.stripe_webhook_secret &&
    checks.admin_password &&
    blobsOk;

  return {
    statusCode: allGood ? 200 : 503,
    headers: CORS,
    body: JSON.stringify({
      status: allGood ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      env_vars: checks,
      blobs: { ok: blobsOk, error: blobsError },
      next_steps: allGood
        ? "All systems go."
        : [
            !checks.stripe_secret_key && "Set STRIPE_SECRET_KEY in Netlify > Site settings > Environment variables",
            !checks.stripe_webhook_secret && "Set STRIPE_WEBHOOK_SECRET in Netlify > Site settings > Environment variables",
            !checks.admin_password && "Set ADMIN_PASSWORD in Netlify > Site settings > Environment variables",
            !blobsOk && "Netlify Blobs not available: " + blobsError,
          ].filter(Boolean),
    }, null, 2),
  };
};
