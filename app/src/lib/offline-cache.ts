/**
 * The service worker (public/sw.js) saves visited pages for offline use, trip pages included.
 * On sign-out we remove them so the next person on a shared phone can't open them offline.
 * App code (/_next/static), icons and the offline page hold nothing personal and stay.
 */

const KEEP = new Set(["/offline.html", "/icon-192x192.png", "/icon-512x512.png"]);

export async function clearSavedPages() {
  try {
    if (!("caches" in window)) return;
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const { pathname } = new URL(request.url);
        if (!pathname.startsWith("/_next/static/") && !KEEP.has(pathname)) await cache.delete(request);
      }
    }
  } catch {
    // Storage blocked or unavailable: nothing was saved, nothing to clear.
  }
}
