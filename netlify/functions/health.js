const { getBlobStore } = require("./_blobs");

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
    netlify_site_id: !!process.env.NETLIFY_SITE_ID,
    netlify_access_token: !!process.env.NETLIFY_ACCESS_TOKEN,
    site_url: process.env.URL || "(not set)",
  };

  let blobsOk = false;
  let blobsError = null;
  try {
    const store = getBlobStore("health-check");
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

  const nextSteps = [];
  if (!checks.stripe_secret_key) nextSteps.push("Set STRIPE_SECRET_KEY in Netlify > Site settings > Environment variables");
  if (!checks.stripe_webhook_secret) nextSteps.push("Set STRIPE_WEBHOOK_SECRET in Netlify > Site settings > Environment variables");
  if (!checks.admin_password) nextSteps.push("Set ADMIN_PASSWORD in Netlify > Site settings > Environment variables");
  if (!blobsOk) {
    if (!checks.netlify_blobs_context && !checks.netlify_site_id) {
      nextSteps.push("Blobs needs credentials: set NETLIFY_SITE_ID (from Site settings > General) and NETLIFY_ACCESS_TOKEN (from app.netlify.com/user/applications) in environment variables");
    } else {
      nextSteps.push("Blobs error: " + blobsError);
    }
  }

  return {
    statusCode: allGood ? 200 : 503,
    headers: CORS,
    body: JSON.stringify({
      status: allGood ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      env_vars: checks,
      blobs: { ok: blobsOk, error: blobsError },
      next_steps: allGood ? ["All systems go."] : nextSteps,
    }, null, 2),
  };
};
