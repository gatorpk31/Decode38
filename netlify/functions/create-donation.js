const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { amount } = JSON.parse(event.body);
    const cents = Math.round(Number(amount) * 100);

    if (!cents || cents < 100 || cents > 100000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Amount must be between $1 and $1,000" }) };
    }

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
      success_url: `${process.env.URL || "https://decode38.com"}?donation=success`,
      cancel_url: `${process.env.URL || "https://decode38.com"}?donation=cancelled`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to create checkout session" }) };
  }
};
