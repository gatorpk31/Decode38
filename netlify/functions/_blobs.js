/**
 * Shared helper to get a Netlify Blobs store.
 * Uses explicit siteID + token when NETLIFY_BLOBS_CONTEXT is not auto-injected
 * (older Netlify infrastructure / V1 Lambda functions).
 */
const { getStore } = require("@netlify/blobs");

function getBlobStore(name) {
  // Auto-injected context (newer Netlify infra) — use as-is
  if (process.env.NETLIFY_BLOBS_CONTEXT) {
    return getStore(name);
  }

  // Explicit credentials (required for older Netlify infrastructure)
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;

  if (!siteID || !token) {
    throw new Error(
      "Netlify Blobs not configured. Set NETLIFY_SITE_ID and NETLIFY_ACCESS_TOKEN " +
      "in Netlify > Site settings > Environment variables. " +
      "Find your Site ID in Site settings > General. " +
      "Create an access token at app.netlify.com/user/applications."
    );
  }

  return getStore({ name, siteID, token });
}

module.exports = { getBlobStore };
