import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Column } from "@/components/column";
import { getMyDefaultChecklists } from "@/lib/actions/checklist";
import { ChecklistSection } from "@/components/prep/checklist-section";

/** Profile → My checklists: your default lists, copied into each trip's Prep once. */
export default async function MyChecklistsPage() {
  const defaults = await getMyDefaultChecklists();

  return (
    <Column className="pt-4 pb-8">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Back to Profile"
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-fg shrink-0"
        >
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="text-xl font-bold text-fg">My checklists</h1>
      </div>

      <div className="mt-6">
        <ChecklistSection checklists={defaults} tripId={null} />
      </div>
    </Column>
  );
}
