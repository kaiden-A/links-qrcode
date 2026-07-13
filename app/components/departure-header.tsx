import { LiveDot } from "./live-dot";

export function DepartureHeader() {
  return (
    <header className="bg-ink text-paper">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold tracking-tight">
            Motion-U
          </span>
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Link Router
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            System Online
          </span>
        </div>
      </div>

      <div className="border-t border-line-dark" />

      {/* Status bar */}
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-4 text-muted font-mono text-[11px] uppercase tracking-[0.2em]">
        <span>Route: /</span>
        <span className="hidden sm:inline">Status: Active</span>
        <span className="hidden md:inline">Protocol: HTTPS</span>
      </div>
    </header>
  );
}
