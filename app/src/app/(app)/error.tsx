"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Column } from "@/components/column";
import { Empty } from "@/components/ui/empty";
import { Button, buttonClasses } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <Column className="min-h-[80dvh] flex flex-col justify-center">
      <Empty
        size="page"
        icon={CircleAlert}
        title="Something went wrong"
        message="An unexpected error occurred. This might be a temporary issue — try again or go back to your trips."
        action={
          <div className="flex flex-col items-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <Link href="/trips?noauto=1" className={buttonClasses("quiet", "md")}>
              Back to My trips
            </Link>
          </div>
        }
      />
    </Column>
  );
}
