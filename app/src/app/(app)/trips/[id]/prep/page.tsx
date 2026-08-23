import { Column } from "@/components/column";
import { getChecklists } from "@/lib/actions/checklist";
import { getIdeas } from "@/lib/actions/idea";
import { ChecklistSection } from "@/components/prep/checklist-section";
import { IdeasSection } from "@/components/prep/ideas-section";

export default async function PrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [checklists, ideas] = await Promise.all([
    getChecklists(id),
    getIdeas(id),
  ]);

  return (
    <Column className="py-4 pb-8 space-y-6">
      {/* Bookings — placeholder until Phase 3 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-ink">Bookings</h3>
        </div>
        <div className="bg-card rounded-lg border border-border px-3 py-4">
          <p className="text-sm text-muted text-center">
            Bookings coming in Phase 3.
          </p>
        </div>
      </div>

      {/* Checklists */}
      <ChecklistSection checklists={checklists} tripId={id} />

      {/* Ideas */}
      <IdeasSection ideas={ideas} tripId={id} />
    </Column>
  );
}
