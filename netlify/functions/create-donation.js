const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set");
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Payment system not configured. Contact support." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const amount = body.amount;
    const cents = Math.round(Number(amount) * 100);

    if (!cents || cents < 100 || cents > 100000) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Amount must be between $1 and $1,000" }) };
    }

    const siteUrl = process.env.URL || "https://decode38.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support Decode38",
              description: "Voluntary donation to keep Decode38 free for veterans",
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/?donation=success`,
      cancel_url: `${siteUrl}/?donation=cancelled`,
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Failed to create checkout session: " + err.message }),
    };
  }
};
