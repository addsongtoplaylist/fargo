"use client";

import { createClient } from "@/lib/supabase/client";
import { setTripCover } from "@/lib/actions/trip";
import { COVER_BUCKET } from "@/lib/cover";

const MAX_SIDE = 1600;
const QUALITY = 0.85;

/**
 * Shrink a picked photo on the phone before upload: long side ≤ 1600px,
 * JPEG ~85% (usually 200–400 KB). iPhone HEIC photos arrive as JPEG when
 * picked through the browser; anything the browser can't decode is refused.
 */
export async function resizeImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo format isn't supported. Try a JPEG or PNG.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't prepare the photo. Please try again.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob) throw new Error("Couldn't prepare the photo. Please try again.");
  return blob;
}

/**
 * Upload a cover for a trip (planner only — storage rules refuse anyone
 * else), save it on the trip, then remove the previous file. If saving
 * fails, the just-uploaded file is removed again.
 */
export async function uploadTripCover(
  tripId: string,
  photo: Blob,
  previousPath?: string | null
): Promise<{ path?: string; error?: string }> {
  const supabase = createClient();
  const path = `${tripId}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, photo, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (uploadError) {
    console.error("Cover upload failed:", uploadError);
    return { error: "Couldn't upload the photo. Please try again." };
  }

  const saved = await setTripCover(tripId, path);
  if (saved.error) {
    await supabase.storage.from(COVER_BUCKET).remove([path]);
    return { error: saved.error };
  }

  if (previousPath) await supabase.storage.from(COVER_BUCKET).remove([previousPath]);
  return { path };
}

/** Remove a trip's cover: clear it on the trip, then delete the file. */
export async function removeTripCover(tripId: string, path: string): Promise<{ error?: string }> {
  const saved = await setTripCover(tripId, null);
  if (saved.error) return { error: saved.error };
  const supabase = createClient();
  await supabase.storage.from(COVER_BUCKET).remove([path]);
  return {};
}
