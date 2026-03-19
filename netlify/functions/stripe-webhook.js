const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
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
      const store = getStore("donations");
      const key = `donation_${Date.now()}_${session.id.slice(-8)}`;
      await store.setJSON(key, donation);
    } catch (err) {
      console.error("Failed to store donation:", err.message);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
