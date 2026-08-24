"use client";

import { TabError } from "@/components/tab-error";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <TabError {...props} />;
}
