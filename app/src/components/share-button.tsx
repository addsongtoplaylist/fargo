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

      // Use native share on mobile (touch devices), clipboard on desktop
      const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      let shared = false;
      if (isMobile && navigator.share) {
        try {
          await navigator.share({ title: "Check out my trip on Fargo", url });
          shared = true;
        } catch {
          // Native share cancelled — fall through to clipboard
        }
      }
      if (!shared) {
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // Fallback for insecure contexts (e.g. localhost without HTTPS)
          const textarea = document.createElement("textarea");
          textarea.value = url;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
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
