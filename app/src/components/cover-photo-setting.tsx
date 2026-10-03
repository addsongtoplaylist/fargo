"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { TripCover } from "@/components/trip-cover";
import { TextButton } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { resizeImage, uploadTripCover, removeTripCover } from "@/lib/cover-upload";

/**
 * Trip settings → Cover photo (P10, planner only): thumbnail + Add / Change /
 * Remove. The photo is shrunk on the phone before upload.
 */
export function CoverPhotoSetting({
  tripId,
  destination,
  coverPath,
}: {
  tripId: string;
  destination: string;
  coverPath: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(coverPath);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);

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
      <TripCover tripId={tripId} destination={destination} coverPath={path} size={56} radius={14} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-fg">Cover photo</p>
        <p className="text-xs text-fg-muted mt-0.5">
          {busy === "upload" ? "Uploading…" : busy === "remove" ? "Removing…" : path ? "Shown on cards and Overview" : "No photo — uses the trip colour"}
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
    </div>
  );
}
