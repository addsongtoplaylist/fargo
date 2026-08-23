export function Column({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[var(--max-width-column)] px-4 ${className}`}>
      {children}
    </div>
  );
}
