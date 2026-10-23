import { redirect } from "next/navigation";

/** Your expenses moved onto the Money tab (v0.6.5); old links land there. */
export default async function ExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/trips/${id}/money`);
}
