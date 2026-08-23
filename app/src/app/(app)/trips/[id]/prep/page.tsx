import { Column } from "@/components/column";
import { getChecklists } from "@/lib/actions/checklist";
import { getIdeas } from "@/lib/actions/idea";
import { getMyRole } from "@/lib/actions/trip";
import { ChecklistSection } from "@/components/prep/checklist-section";
import { IdeasSection } from "@/components/prep/ideas-section";

export default async function PrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [checklists, ideas, myRole] = await Promise.all([
    getChecklists(id),
    getIdeas(id),
    getMyRole(id),
  ]);

  const isPlanner = myRole === "planner";

  return (
    <Column className="py-4 pb-8 space-y-6">
      {/* Checklists */}
      <ChecklistSection checklists={checklists} tripId={id} isPlanner={isPlanner} />

      {/* Ideas */}
      <IdeasSection ideas={ideas} tripId={id} isPlanner={isPlanner} />
    </Column>
  );
}
