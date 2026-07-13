export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full bg-signal live-dot ${className}`}
      role="status"
      aria-label="System online"
    />
  );
}
