"use client";

import { useState } from "react";
import type { LinkRecord, LinkStats } from "@/lib/types";

interface DashboardProps {
  links: LinkRecord[];
  onTestHit: (link: LinkRecord) => void;
  onDelete: (slug: string) => void;
  onUpdate: (slug: string, update: { destination_url?: string; slug?: string }) => Promise<boolean>;
  totalClicks: number;
}

export function Dashboard({
  links,
  onTestHit,
  onDelete,
  onUpdate,
  totalClicks,
}: DashboardProps) {
  const [statsModal, setStatsModal] = useState<{
    slug: string;
    data: LinkStats | null;
    loading: boolean;
  } | null>(null);
  const [editModal, setEditModal] = useState<{
    link: LinkRecord;
    destinationUrl: string;
    slug: string;
    saving: boolean;
    error: string | null;
  } | null>(null);

  const openEdit = (link: LinkRecord) => {
    setEditModal({
      link,
      destinationUrl: link.destination_url,
      slug: link.slug,
      saving: false,
      error: null,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;

    setEditModal((m) => (m ? { ...m, saving: true, error: null } : m));

    const update: { destination_url?: string; slug?: string } = {};
    if (editModal.destinationUrl.trim() !== editModal.link.destination_url) {
      update.destination_url = editModal.destinationUrl.trim();
    }
    if (editModal.slug.trim() !== editModal.link.slug) {
      update.slug = editModal.slug.trim();
    }

    if (Object.keys(update).length === 0) {
      setEditModal(null);
      return;
    }

    const ok = await onUpdate(editModal.link.slug, update);
    if (ok) {
      setEditModal(null);
    } else {
      setEditModal((m) => (m ? { ...m, saving: false, error: "Could not update route. Slug may already be taken." } : m));
    }
  };

  const handleViewStats = async (slug: string) => {
    setStatsModal({ slug, data: null, loading: true });
    try {
      const res = await fetch(`/api/links/${slug}/stats`);
      if (res.ok) {
        const data: LinkStats = await res.json();
        setStatsModal({ slug, data, loading: false });
      } else {
        setStatsModal({ slug, data: null, loading: false });
      }
    } catch {
      setStatsModal({ slug, data: null, loading: false });
    }
  };

  const platformColors: Record<string, string> = {
    instagram: "bg-[#E4405F]",
    whatsapp: "bg-[#25D366]",
    twitter: "bg-[#1DA1F2]",
    direct: "bg-[#6B7280]",
  };

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
                      onClick={() => handleViewStats(link.slug)}
                      className="text-xs border border-line-paper hover:border-signal hover:text-[#0F8A7B] px-3 py-1.5 rounded-md transition-colors"
                    >
                      Stats
                    </button>
                    <button
                      onClick={() => openEdit(link)}
                      className="text-xs border border-line-paper hover:border-route hover:text-route-dark px-3 py-1.5 rounded-md transition-colors"
                    >
                      Edit
                    </button>
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

      {/* Stats modal */}
      {statsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          style={{ backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setStatsModal(null);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-line-paper bg-white overflow-hidden">
            <div className="bg-ink text-paper px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">
                Stats — /{statsModal.slug}
              </h3>
              <button
                onClick={() => setStatsModal(null)}
                className="text-muted hover:text-paper transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {statsModal.loading ? (
                <p className="text-sm text-muted text-center py-8 font-mono">Loading stats...</p>
              ) : statsModal.data ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
                      Total clicks
                    </p>
                    <p className="font-display text-4xl font-semibold">
                      {statsModal.data.total_clicks}
                    </p>
                  </div>
                  <div className="dash-rule" />
                  <div className="space-y-3">
                    {Object.entries(statsModal.data.by_source).map(([source, count]) => {
                      const total = statsModal.data!.total_clicks;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const color = platformColors[source] || "bg-[#8B5CF6]";
                      return (
                        <div key={source} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="capitalize">{source}</span>
                            <span className="text-muted">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-paper-dim rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-8 font-mono">Failed to load stats.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          style={{ backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModal(null);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-line-paper bg-white overflow-hidden">
            <div className="bg-ink text-paper px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">
                Edit route — /{editModal.link.slug}
              </h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-muted hover:text-paper transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={editModal.destinationUrl}
                  onChange={(e) =>
                    setEditModal((m) =>
                      m ? { ...m, destinationUrl: e.target.value } : m
                    )
                  }
                  className="w-full border border-line-paper rounded-lg bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-route focus:ring-2 focus:ring-route/15"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={editModal.slug}
                  onChange={(e) =>
                    setEditModal((m) =>
                      m ? { ...m, slug: e.target.value } : m
                    )
                  }
                  className="w-full border border-line-paper rounded-lg bg-white px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-route focus:ring-2 focus:ring-route/15"
                />
              </div>
              {editModal.error && (
                <p className="font-mono text-xs text-route-dark">{editModal.error}</p>
              )}
              <button
                type="submit"
                disabled={editModal.saving}
                className="w-full bg-route hover:bg-route-dark disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {editModal.saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
