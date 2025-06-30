export async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader || !secret) {
    throw new Error("Missing Stripe signature or secret");
  }

  const encoder = new TextEncoder();
  const parts = sigHeader.split(",");
  const timestamp = parts[0]?.split("=")[1];
  const signature = parts[1]?.split("=")[1];

  if (!timestamp || !signature) {
    throw new Error("Invalid Stripe signature header format");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const computedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedSig !== signature) {
    throw new Error("Invalid Stripe signature");
  }

  return JSON.parse(payload);
}
