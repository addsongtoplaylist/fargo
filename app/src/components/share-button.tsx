"use client";

import { useState } from "react";
import { Share2, Check, Link } from "lucide-react";
import { getOrCreateShareCode } from "@/lib/actions/trip";

export function ShareButton({ tripId }: { tripId: string }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const code = await getOrCreateShareCode(tripId);
      const url = `${window.location.origin}/s/${code}`;

      // Try native share first (mobile), fall back to clipboard
      if (navigator.share) {
        await navigator.share({ title: "Check out my trip on Fargo", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60"
    >
      {copied ? (
        <>
          <Check size={16} />
          Link copied!
        </>
      ) : loading ? (
        <>
          <span className="w-4 h-4 border-2 border-accent-on/40 border-t-accent-on rounded-full animate-spin" />
          Generating link…
        </>
      ) : (
        <>
          <Share2 size={16} />
          Share trip
        </>
      )}
    </button>
  );
}
