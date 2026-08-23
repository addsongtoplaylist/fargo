import { Column } from "@/components/column";

export default function OverviewPage() {
  return (
    <Column className="py-4">
      <div className="bg-card rounded-md border border-border p-3">
        <h2 className="text-base font-semibold mb-2">Overview</h2>
        <p className="text-sm text-muted">
          Trip dates, travellers, and budget summary will appear here.
        </p>
      </div>
    </Column>
  );
}
