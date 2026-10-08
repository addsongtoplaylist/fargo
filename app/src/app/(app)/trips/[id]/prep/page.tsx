import { Column } from "@/components/column";
import { getChecklists, getMyDefaultChecklists } from "@/lib/actions/checklist";
import { getIdeas } from "@/lib/actions/idea";
import { getMyRole } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { ChecklistSection } from "@/components/prep/checklist-section";
import { IdeasSection } from "@/components/prep/ideas-section";

export default async function PrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [checklists, defaults, ideas, myRole, account] = await Promise.all([
    getChecklists(id),
    getMyDefaultChecklists(),
    getIdeas(id),
    getMyRole(id),
    getOrCreateAccount(),
  ]);

  const isPlanner = myRole === "planner";

  return (
    <Column className="py-4 pb-8 space-y-6">
      {/* My checklists — personal, only you see them */}
      <ChecklistSection checklists={checklists} tripId={id} defaultNames={defaults.map((l) => l.name)} />

      {/* Ideas — everyone suggests, the planner schedules */}
      <IdeasSection ideas={ideas} tripId={id} isPlanner={isPlanner} myAccountId={account?.id ?? null} />
    </Column>
  );
}
