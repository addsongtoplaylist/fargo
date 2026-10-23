import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";
import { TimeFormatProvider } from "@/components/time-format-provider";
import { getTimeFormat } from "@/lib/time-format-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const timeFormat = await getTimeFormat();
  return (
    <TimeFormatProvider value={timeFormat}>
      <div className="flex flex-col min-h-full">
        {/* Bottom space so the last item clears the floating bar (66px + 22px gap) */}
        <main className="flex-1 pb-[calc(8rem+env(safe-area-inset-bottom))]">{children}</main>
        <BottomNav />
        <InstallPrompt />
      </div>
    </TimeFormatProvider>
  );
}
