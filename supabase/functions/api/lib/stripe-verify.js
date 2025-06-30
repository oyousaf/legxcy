// Deno-compatible HMAC-SHA256 signature verification
export async function verifyStripeSignature(payload, sigHeader, secret) {
  const encoder = new TextEncoder();
  const timestamp = sigHeader.split(",")[0].split("=")[1];
  const signature = sigHeader.split(",")[1].split("=")[1];

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
