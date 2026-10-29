// Emails the shop via Web3Forms (the inbox the original site used). Never throws: a failed
// notification must not lose the customer's booking, which is already saved.
export async function notifyShop(subject: string, fields: Record<string, unknown>) {
  const KEY = process.env.WEB3FORMS_KEY;
  if (!KEY) return console.warn("notifyShop skipped: WEB3FORMS_KEY is not set");
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ access_key: KEY, subject, from_name: "WP Ornaments website", ...fields }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyShop failed", res.status);
  } catch (e) {
    console.error("notifyShop error", (e as Error).message);
  }
}
