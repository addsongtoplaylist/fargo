/** v0.8 skeleton block for loading screens. */
export function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-skeleton ${className}`} />;
}
