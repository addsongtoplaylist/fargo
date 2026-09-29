import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-page flex flex-col items-center justify-center px-4">
      <Empty
        size="page"
        icon={MapPinOff}
        title="Page not found"
        message="This page doesn't exist — it might have been moved or deleted."
        action={
          <Link href="/trips?noauto=1" className={buttonClasses("primary", "md")}>
            Go to My trips
          </Link>
        }
      />
    </div>
  );
}
