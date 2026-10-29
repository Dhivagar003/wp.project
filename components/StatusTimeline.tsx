const PAID = ["paid", "crafting", "shipped", "delivered"];
const BOOKED = ["booked", "confirmed", "crafting", "ready", "delivered"];

// Bookings (no online payment) follow a call-to-confirm track; paid orders follow the shipping track.
export default function StatusTimeline({ status, booked = false }: { status: string; booked?: boolean }) {
  if (status === "cancelled" || status === "pending") return <span className="text-xs uppercase tracking-[0.3em] text-white/50">{status === "pending" ? "Awaiting payment" : "Cancelled"}</span>;
  const steps = booked ? BOOKED : PAID;
  const at = steps.indexOf(status);
  return (
    <ol className="flex items-center">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <span className={`flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.2em] ${i <= at ? "text-gold" : "text-white/30"}`}>
            <span className={`h-3 w-3 rotate-45 border ${i <= at ? "border-gold bg-gold" : "border-white/30"}`} />{s}
          </span>
          {i < steps.length - 1 && <span className={`mx-2 mb-5 h-px flex-1 ${i < at ? "bg-gold" : "bg-white/15"}`} />}
        </li>
      ))}
    </ol>
  );
}
