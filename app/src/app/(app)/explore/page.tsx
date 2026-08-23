import { Column } from "@/components/column";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <Column className="py-6">
      <h1 className="text-2xl font-semibold mb-8">Explore</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
          <Compass size={28} className="text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-ink mb-1">
          Explore is on its way
        </h2>
        <p className="text-sm text-muted max-w-[280px]">
          Discover trip ideas and itineraries shared by other travellers.
          Stay tuned.
        </p>
      </div>
    </Column>
  );
}
