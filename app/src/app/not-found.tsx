import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ground flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xs">
        <p className="text-5xl mb-4">🗺️</p>
        <h1 className="text-xl font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-sm text-muted mb-6">
          This page doesn&apos;t exist — it might have been moved or deleted.
        </p>
        <Link
          href="/trips"
          className="inline-block px-4 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          Go to My Trips
        </Link>
      </div>
    </div>
  );
}
