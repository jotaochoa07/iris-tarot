import { listRecurringGuests } from "@/lib/actions/readings";
import { NewReadingFlow } from "./NewReadingFlow";

export const dynamic = "force-dynamic";

export default async function NuevaTiradaPage() {
  const guests = await listRecurringGuests();
  return <NewReadingFlow recurringGuests={guests} />;
}
