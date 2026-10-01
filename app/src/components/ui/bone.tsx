/** v0.8 skeleton block for loading screens. */
export function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden style={style} className={`animate-pulse rounded-lg bg-skeleton ${className}`} />;
}
