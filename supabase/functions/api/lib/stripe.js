const res = await fetch("https://api.stripe.com/v1/customers", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    email: "test@example.com",
  }),
});
