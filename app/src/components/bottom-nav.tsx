"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Compass, User } from "lucide-react";

const navItems = [
  { href: "/trips?noauto=1", label: "My trips", icon: Plane },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
      <div className="mx-auto max-w-[var(--max-width-column)] flex items-center justify-around h-14">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Strip query params for matching; /trips?noauto=1 should match /trips/*
          const basePath = href.split("?")[0];
          const isActive =
            pathname === basePath || pathname.startsWith(`${basePath}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors ${
                isActive
                  ? "text-accent font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
