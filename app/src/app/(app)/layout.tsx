import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Bottom space so the last item clears the floating bar (66px + 22px gap) */}
      <main className="flex-1 pb-[calc(8rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
