import { Bone } from "@/components/ui/bone";

/**
 * Shows inside the layout (after header + tabs are real)
 * while the page content is still loading.
 */
export default function TripLoading() {
  return (
    <div className="mx-auto max-w-[var(--max-width-column)] px-4 py-4 space-y-3">
      <Bone className="h-10 w-full rounded-lg" />
      <Bone className="h-24 w-full rounded-lg" />
      <Bone className="h-24 w-full rounded-lg" />
    </div>
  );
}
