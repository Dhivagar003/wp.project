import { NextResponse } from "next/server";
import { getSession, saveSettings, saveRates, setOrderStatus, updateCustom, deleteProduct } from "@/lib/db";
import { ORDER_STATUSES, CUSTOM_STATUSES } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await getSession()).isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  try {
    switch (b.action) {
      case "settings": await saveSettings({ paymentsEnabled: !!b.paymentsEnabled }); break;
      case "rates": {
        const r = { "22K": Number(b.rates?.["22K"]), "18K": Number(b.rates?.["18K"]), "925": Number(b.rates?.["925"]) };
        if (Object.values(r).some((v) => !(v > 0))) return NextResponse.json({ error: "Rates must be positive numbers." }, { status: 400 });
        await saveRates(r); break;
      }
      case "orderStatus":
        if (!ORDER_STATUSES.includes(b.status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });
        await setOrderStatus(String(b.id), b.status); break;
      case "custom": {
        if (!CUSTOM_STATUSES.includes(b.status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });
        const quote = b.quote ? Number(b.quote) : null;
        await updateCustom(String(b.id), { quote, status: quote && b.status === "submitted" ? "quoted" : b.status, admin_note: b.note ? String(b.note).slice(0, 1000) : null });
        break;
      }
      case "deleteProduct": await deleteProduct(String(b.id)); break;
      default: return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
