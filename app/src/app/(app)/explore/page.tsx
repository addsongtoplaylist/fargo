import { Compass } from "lucide-react";
import { Column } from "@/components/column";
import { Empty } from "@/components/ui/empty";

export default function ExplorePage() {
  return (
    <Column className="pt-12 pb-8">
      <h1 className="text-[30px] font-bold text-fg tracking-[-0.5px] mb-6">Explore</h1>
      <div className="bg-surface rounded-card">
        <Empty
          size="page"
          icon={Compass}
          title="Explore is on its way"
          message="Discover trip ideas and itineraries shared by other travellers. Stay tuned."
        />
      </div>
    </Column>
  );
}
