"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiveDot } from "@/app/components/live-dot";
import { Dashboard } from "@/app/components/dashboard";
import { useCurrentUser } from "@/lib/use-current-user";
import type { LinkRecord } from "@/lib/types";

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const { user: session, loading: sessionLoading } = useCurrentUser();

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!session || fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/links/");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (res.ok) setLinks(await res.json());
      } catch { /* silent */ }
    })();
  }, [session]);

  const refreshLinks = async () => {
    const res = await fetch("/api/links/");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) setLinks(await res.json());
  };

  const handleTestHit = async (link: LinkRecord) => {
    const params = new URLSearchParams();
    const referrer = document.referrer || "";
    if (referrer) params.set("referrer", referrer);
    const utmSource = new URL(window.location.href).searchParams.get("utm_source") || "";
    if (utmSource) params.set("utm_source", utmSource);
    const qs = params.toString();

    await fetch(`/api/r/${link.slug}${qs ? `?${qs}` : ""}`, {
      redirect: "manual",
    });
    await refreshLinks();
    window.open(link.destination_url, "_blank");
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/links/${slug}`, { method: "DELETE" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok && res.status !== 404) return;
      setLinks((prev) => prev.filter((l) => l.slug !== slug));
    } catch { /* keep list as-is */ }
  };

  const handleUpdate = async (
    slug: string,
    update: { destination_url?: string; slug?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/links/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return false;
      }
      if (!res.ok) return false;
      await refreshLinks();
      return true;
    } catch {
      return false;
    }
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  if (sessionLoading) {
    return (
      <main className="flex-grow max-w-6xl w-full mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs text-muted">Checking access…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-grow max-w-6xl w-full mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs text-muted">
          Redirecting to sign in…
        </p>
      </main>
    );
  }

  return (
    <>
      <header className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Motion-U" className="w-9 h-9 rounded-md" />
              <div className="leading-none">
                <div className="font-display font-semibold text-lg tracking-tight">
                  Motion-U
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase mt-1">
                  Route Control
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md text-muted hover:bg-ink-soft transition-colors"
              >
                Routes
              </Link>
              <span className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-ink-soft transition-colors">
                Dashboard
              </span>
              <div className="w-px h-6 bg-line-dark mx-2" />
              <div className="flex items-center gap-3 pl-1">
                <span className="font-mono text-xs text-muted hidden sm:inline">
                  {session.email}
                </span>
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/logout";
                  }}
                  className="font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-md hover:bg-ink-soft"
                >
                  Log out
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 pt-2">
          <div className="flex items-center gap-2 mb-4">
            <LiveDot />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
              System online
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold max-w-2xl leading-tight">
            Route performance board.
          </h1>
          <p className="text-muted mt-3 max-w-lg text-sm">
            Live clicks, source breakdowns, and management for every issued
            route.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-5 sm:px-8 py-10">
        <Dashboard
          links={links}
          onTestHit={handleTestHit}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          totalClicks={totalClicks}
        />
      </main>

      <footer className="bg-ink text-paper mt-auto">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 text-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
            Powered by Motion-U, Develop and Maintain by Kaiden-A
          </span>
        </div>
      </footer>
    </>
  );
}
