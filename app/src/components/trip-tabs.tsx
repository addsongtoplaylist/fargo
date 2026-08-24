"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const tabs = [
  { slug: "overview", label: "Overview" },
  { slug: "schedule", label: "Schedule" },
  { slug: "money", label: "Money" },
  { slug: "prep", label: "Prep" },
  { slug: "people", label: "People" },
] as const;

export function TripTabs() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const basePath = `/trips/${params.id}`;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40" data-swipe-ignore>
      <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map(({ slug, label }) => {
          const href = `${basePath}/${slug}`;
          const isActive = pathname === href;

          return (
            <Link
              key={slug}
              href={href}
              className={`relative px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? "text-accent font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
