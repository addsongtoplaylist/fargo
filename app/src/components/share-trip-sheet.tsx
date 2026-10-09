"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const STYLES = [
  { key: "light", label: "White text" },
  { key: "dark", label: "Dark text" },
  { key: "card", label: "Pass card" },
] as const;
type StyleKey = (typeof STYLES)[number]["key"];

/** Grey checkerboard = "this part is see-through" (like an image editor). */
const CHECKERBOARD = {
  backgroundColor: "#3a3a3a",
  backgroundImage:
    "linear-gradient(45deg,#4a4a4a 25%,transparent 25%,transparent 75%,#4a4a4a 75%),linear-gradient(45deg,#4a4a4a 25%,transparent 25%,transparent 75%,#4a4a4a 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 8px 8px",
};

/**
 * Share trip (v0.5.7): swipe between overlay styles (transparent PNGs, plus
 * the white pass card), then Instagram story — save the overlay to Photos via
 * the phone's share sheet and open Instagram, where it's added with Sticker →
 * Photo — or Save overlay. Images are fetched when the sheet opens so the
 * share runs straight from the tap (phones require that).
 */
export function ShareTripSheet({ tripId, tripName, onClose }: { tripId: string; tripName: string; onClose: () => void }) {
  const { toast } = useToast();
  const [stamp] = useState(() => Date.now());
  const [blobs, setBlobs] = useState<Partial<Record<StyleKey, Blob>>>({});
  const [previews, setPreviews] = useState<Partial<Record<StyleKey, string>>>({});
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const current = STYLES[index].key;
  const blob = blobs[current];
  const fileName = `${tripName.replace(/[^\w\- ]+/g, "").trim() || "trip"} - Fargo ${STYLES[index].label.toLowerCase()}.png`;

  useEffect(() => {
    let live = true;
    const urls: string[] = [];
    for (const { key } of STYLES) {
      fetch(`/api/trips/${tripId}/pass?style=${key}&t=${stamp}`)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`${r.status}`))))
        .then((b) => {
          if (!live) return;
          const url = URL.createObjectURL(b);
          urls.push(url);
          setBlobs((prev) => ({ ...prev, [key]: b }));
          setPreviews((prev) => ({ ...prev, [key]: url }));
        })
        .catch(() => live && setFailed(true));
    }
    return () => {
      live = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [tripId, stamp]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    setIndex(Math.max(0, Math.min(STYLES.length - 1, Math.round(el.scrollLeft / el.clientWidth))));
  }

  function goTo(i: number) {
    scroller.current?.scrollTo({ left: i * scroller.current.clientWidth, behavior: "smooth" });
  }

  const file = blob ? new File([blob], fileName, { type: "image/png" }) : null;
  const canShareFiles = !!file && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] });

  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Phone: share sheet (→ Save Image puts it in Photos). Computer: download. Returns true when saved/shared. */
  async function save(): Promise<boolean> {
    if (!file) return false;
    if (!canShareFiles) {
      download();
      return true;
    }
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast("Couldn't open sharing. Please try again.", "error");
      return false;
    }
  }

  async function handleInstagram() {
    setShowSteps(true);
    const saved = await save();
    if (saved && canShareFiles) {
      // Opens Instagram's story camera when the app is installed
      window.location.href = "instagram://story-camera";
    }
  }

  async function handleSave() {
    if (await save()) toast("Overlay ready — find it in your Photos", "success");
  }

  return (
    <Sheet
      open
      title="Share trip"
      onClose={onClose}
      footer={
        <div className="flex gap-2.5">
          <Button size="lg" onClick={handleInstagram} disabled={!blob} className="flex-1">
            Instagram story
          </Button>
          <Button variant="soft" size="lg" icon={Download} onClick={handleSave} disabled={!blob} className="flex-1">
            Save overlay
          </Button>
        </div>
      }
    >
      {/* Styles — swipe */}
      <div
        ref={scroller}
        onScroll={onScroll}
        data-swipe-ignore
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-1"
      >
        {STYLES.map(({ key, label }) => (
          <div key={key} className="snap-center shrink-0 w-full px-1">
            <div className="rounded-[18px] aspect-square flex items-center justify-center p-4" style={CHECKERBOARD}>
              {failed && !previews[key] ? (
                <p className="text-sm text-white/80">Couldn&apos;t make the overlay. Please try again.</p>
              ) : previews[key] ? (
                // eslint-disable-next-line @next/next/no-img-element -- generated PNG (blob URL)
                <img src={previews[key]} alt={`${label} overlay for ${tripName}`} className="w-full h-auto" />
              ) : (
                <Loader2 size={22} className="text-white/70 animate-spin" aria-label="Making your overlay" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dots + style name */}
      <div className="flex flex-col items-center mt-3">
        <div className="flex gap-1.5">
          {STYLES.map(({ key, label }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={label}
              aria-current={i === index}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-fg" : "bg-line"}`}
            />
          ))}
        </div>
        <p className="text-xs text-fg-muted mt-1.5">{STYLES[index].label}</p>
      </div>

      {/* How it goes on Instagram */}
      {showSteps && (
        <ol className="mt-4 bg-page rounded-card p-4 space-y-2.5 text-[13px] text-fg">
          {[
            "Tap Save Image so the overlay goes to your Photos",
            "In Instagram, pick your photo or video for the story",
            "Tap the sticker icon → Photo → choose the Fargo overlay",
          ].map((text, i) => (
            <li key={text} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-soft text-brand text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      )}
    </Sheet>
  );
}
