import type { LinkRecord } from "@/lib/types";

interface LinksTableProps {
  links: LinkRecord[];
  baseUrl: string;
}

export function LinksTable({ links, baseUrl }: LinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          No routes issued yet
        </p>
        <p className="font-body text-sm text-muted mt-2">
          Create your first link above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-line-paper">
            <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted pb-3 pr-4">
              Route
            </th>
            <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted pb-3 pr-4 hidden sm:table-cell">
              Destination
            </th>
            <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted pb-3 text-right">
              Boardings
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr
              key={link.slug}
              className="border-b border-line-paper/50 last:border-b-0"
            >
              <td className="py-3 pr-4">
                <a
                  href={`${baseUrl}/r/${link.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-route hover:text-route-dark transition-colors"
                >
                  /r/{link.slug}
                </a>
              </td>
              <td className="py-3 pr-4 hidden sm:table-cell">
                <span className="font-mono text-sm text-muted truncate block max-w-[260px]">
                  {link.destination_url}
                </span>
              </td>
              <td className="py-3 text-right">
                <span className="font-mono text-sm tabular-nums">
                  {link.clicks}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
