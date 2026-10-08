"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Move } from "lucide-react";
import { TripCover } from "@/components/trip-cover";
import { TextButton } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { resizeImage, uploadTripCover, removeTripCover } from "@/lib/cover-upload";
import { coverUrl } from "@/lib/cover";
import { setTripCoverPosition } from "@/lib/actions/trip";
import { CoverRepositionSheet } from "@/components/cover-reposition-sheet";

/**
 * Trip settings → Cover photo (P10, planner only): thumbnail + Add / Change /
 * Remove. The photo is shrunk on the phone before upload. Tap the photo to
 * reposition it up or down (v0.5.5).
 */
export function CoverPhotoSetting({
  tripId,
  destination,
  coverPath,
  coverPosition,
}: {
  tripId: string;
  destination: string;
  coverPath: string | null;
  coverPosition: number | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(coverPath);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [position, setPosition] = useState(coverPosition ?? 50);
  const [repositioning, setRepositioning] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);
  const url = coverUrl(path);

  async function handleSavePosition(next: number) {
    setSavingPosition(true);
    const result = await setTripCoverPosition(tripId, next);
    setSavingPosition(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    setPosition(next);
    setRepositioning(false);
    toast("Cover repositioned", "success");
    router.refresh();
  }

  async function handlePick(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    try {
      const photo = await resizeImage(file);
      const result = await uploadTripCover(tripId, photo, path);
      if (result.error) {
        toast(result.error, "error");
      } else {
        setPath(result.path ?? null);
        setPosition(50); // a new photo starts centred
        toast("Cover photo updated", "success");
        router.refresh();
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add the photo", "error");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!path) return;
    setBusy("remove");
    const result = await removeTripCover(tripId, path);
    setBusy(null);
    if (result.error) {
      toast(result.error, "error");
    } else {
      setPath(null);
      toast("Cover photo removed", "success");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3.5">
      {url && !busy ? (
        <button
          type="button"
          onClick={() => setRepositioning(true)}
          aria-label="Reposition cover photo"
          className="relative shrink-0 rounded-[14px]"
        >
          <TripCover tripId={tripId} destination={destination} coverPath={path} coverPosition={position} size={56} radius={14} />
          <span aria-hidden className="absolute right-1 bottom-1 w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center">
            <Move size={11} strokeWidth={2.2} />
          </span>
        </button>
      ) : (
        <TripCover tripId={tripId} destination={destination} coverPath={path} coverPosition={position} size={56} radius={14} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-fg">Cover photo</p>
        <p className="text-xs text-fg-muted mt-0.5">
          {busy === "upload" ? "Uploading…" : busy === "remove" ? "Removing…" : path ? "Tap the photo to reposition" : "No photo — uses the trip colour"}
        </p>
      </div>
      {busy ? (
        <Loader2 size={18} className="text-fg-muted animate-spin shrink-0" aria-label="Working" />
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          {path && (
            <TextButton tone="danger" onClick={handleRemove}>
              Remove
            </TextButton>
          )}
          <TextButton icon={path ? undefined : ImagePlus} onClick={() => inputRef.current?.click()}>
            {path ? "Change" : "Add"}
          </TextButton>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Choose a cover photo"
        onChange={(e) => handlePick(e.target.files?.[0])}
      />
      {repositioning && url && (
        <CoverRepositionSheet
          url={url}
          initialPosition={position}
          saving={savingPosition}
          onSave={handleSavePosition}
          onClose={() => setRepositioning(false)}
        />
      )}
    </div>
  );
}
