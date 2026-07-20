const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getBlobStore } = require("./_blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return { statusCode: 500, body: "Webhook not configured" };
  }

  const sig = event.headers["stripe-signature"];
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

    try {
      const store = getBlobStore("donations");
      // Idempotent key: Stripe retries deliver the same session.id, which
      // overwrites the same record instead of duplicating it.
      const key = `donation_${session.id}`;
      await store.setJSON(key, donation);
      console.log("Donation stored:", key, donation.amount);
    } catch (err) {
      // Return 500 so Stripe retries the webhook — otherwise the donation
      // record is silently lost while Stripe believes delivery succeeded.
      console.error("Failed to store donation:", err.message);
      return { statusCode: 500, body: "Storage failure — retry" };
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
