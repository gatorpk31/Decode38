const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return { statusCode: 500, body: "Webhook not configured" };
  }

  const sig = event.headers["stripe-signature"];

  // Netlify may base64-encode the raw body — decode before verifying
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const donation = {
      id: session.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      email: session.customer_details?.email || "anonymous",
      name: session.customer_details?.name || "Anonymous",
      date: new Date().toISOString(),
    };

    // Store donation — best effort (don't fail webhook if storage fails)
    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("donations");
      const key = `donation_${Date.now()}_${session.id.slice(-8)}`;
      await store.setJSON(key, donation);
      console.log("Donation stored:", key, donation.amount);
    } catch (err) {
      // Log but don't fail — Stripe only retries on non-2xx
      console.error("Failed to store donation (Blobs unavailable?):", err.message);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
