import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
