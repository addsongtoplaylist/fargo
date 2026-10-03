/**
 * Trip cover photos (P10). Files live in the public `trip-covers` bucket at
 * "<trip id>/<random>.jpg"; `trips.cover_path` holds that path (null = no
 * photo → colour + country code). See supabase/migrations/20261002_trip_cover_photo.sql.
 */
export const COVER_BUCKET = "trip-covers";

/** Public web address of a cover, or null when the trip has none. */
export function coverUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${path}`;
}
