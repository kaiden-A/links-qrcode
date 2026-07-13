import type { LinkRecord } from "@/lib/types";

interface DashboardProps {
  links: LinkRecord[];
  onTestHit: (link: LinkRecord) => void;
  onDelete: (slug: string) => void;
  totalClicks: number;
}

export function Dashboard({
  links,
  onTestHit,
  onDelete,
  totalClicks,
}: DashboardProps) {
  if (links.length === 0) {
    return (
      <div id="table-empty-state" className="px-6 py-16 text-center">
        <p className="f-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          No routes issued yet
        </p>
        <p className="text-sm text-muted mt-2">
          Create a route in the generator tab to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-xl border border-line-paper bg-white/70 overflow-hidden">
          <div className="perforation" />
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
              Routes issued
            </p>
            <p id="metric-total-links" className="font-display text-3xl font-semibold">
              {links.length}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-line-paper bg-white/70 overflow-hidden">
          <div className="perforation" />
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
              Total clicks
            </p>
            <p id="metric-total-clicks" className="font-display text-3xl font-semibold">
              {totalClicks}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-line-paper bg-white/70 overflow-hidden">
          <div className="perforation" />
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
              QR engagement
            </p>
            <p id="metric-qr-ratio" className="font-display text-3xl font-semibold">
              {links.length > 0
                ? `${Math.round((links.filter((l) => l.clicks > 0).length / links.length) * 100)}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-line-paper bg-white/70 overflow-hidden">
        <div className="px-6 py-4 bg-ink text-paper flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm">Departure board</h2>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
            {links.length} route{links.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line-paper">
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted px-6 py-3">
                  Route
                </th>
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted px-6 py-3 hidden md:table-cell">
                  Destination
                </th>
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted px-6 py-3">
                  Hits
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody id="analytics-table-body">
              {links.map((link) => (
                <tr
                  key={link.slug}
                  className="border-b border-line-paper/50 last:border-b-0"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-route-dark font-medium">
                    /{link.slug}
                  </td>
                  <td
                    className="px-6 py-4 max-w-xs truncate text-muted hidden md:table-cell"
                    title={link.destination_url}
                  >
                    {link.destination_url}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs ${
                        link.clicks > 0
                          ? "bg-signal/15 text-[#0F8A7B]"
                          : "bg-paper-dim text-muted"
                      }`}
                    >
                      {link.clicks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => onTestHit(link)}
                      className="text-xs border border-line-paper hover:border-route hover:text-route-dark px-3 py-1.5 rounded-md transition-colors"
                    >
                      Test hit
                    </button>
                    <button
                      onClick={() => onDelete(link.slug)}
                      className="text-xs text-route-dark hover:bg-paper-dim p-1.5 rounded-md transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
