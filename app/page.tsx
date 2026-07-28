"use client";

import { useEffect, useState, useRef } from "react";
import { LiveDot } from "@/app/components/live-dot";
import { QRCodeCard } from "@/app/components/qr-code";
import { Dashboard } from "@/app/components/dashboard";
import type { LinkRecord } from "@/lib/types";

export default function HomePage() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generator" | "analytics">("generator");
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedSource, setCopiedSource] = useState<string | null>(null);

  // ─── Data ───
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const res = await fetch(`${window.location.protocol}//${window.location.host}/api/links/`);
        if (res.ok) {
          const data = await res.json();
          setLinks(data);
        }
      } catch { /* silent */ }
    })();
  }, []);

  // ─── Session ───
  useEffect(() => {
    const stored = localStorage.getItem("motionu_session");
    if (stored) {
      // Use microtask to avoid react-hooks/set-state-in-effect rule
      queueMicrotask(() => {
        try {
          setSession(JSON.parse(stored));
        } catch { /* ignore */ }
      });
    }
  }, []);

  // ─── Link creation ───
  const handleCreate = async (url: string, customSlug?: string) => {
    setLoading(true);
    setError(null);
    setSelectedLink(null);

    try {
      const body: Record<string, string> = { destination_url: url };
      if (customSlug) body.slug = customSlug;

      const res = await fetch(
        `${window.location.protocol}//${window.location.host}/api/links/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail?.[0]?.msg || "Failed to create link");
        return;
      }

      const link: LinkRecord = await res.json();
      setSelectedLink(link);
      // Refresh links for dashboard
      const listRes = await fetch(
        `${window.location.protocol}//${window.location.host}/api/links/`
      );
      if (listRes.ok) setLinks(await listRes.json());
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ─── Dashboard actions ───
  const handleTestHit = async (link: LinkRecord) => {
    const params = new URLSearchParams();
    const referrer = document.referrer || "";
    if (referrer) params.set("referrer", referrer);
    const utmSource = new URL(window.location.href).searchParams.get("utm_source") || "";
    if (utmSource) params.set("utm_source", utmSource);
    const qs = params.toString();

    await fetch(
      `${window.location.protocol}//${window.location.host}/api/r/${link.slug}${qs ? `?${qs}` : ""}`,
      { redirect: "manual" }
    );
    // Refresh
    const res = await fetch(
      `${window.location.protocol}//${window.location.host}/api/links/`
    );
    if (res.ok) setLinks(await res.json());
    window.open(link.destination_url, "_blank");
  };

  const handleDelete = async (slug: string) => {
    // Remove from UI — no DELETE endpoint on API yet
    setLinks((prev) => prev.filter((l) => l.slug !== slug));
    setSelectedLink((prev) => (prev?.slug === slug ? null : prev));
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const shortUrl = selectedLink
    ? `${window.location.protocol}//${window.location.host}/${selectedLink.slug}`
    : null;

  // ─── Share tracking ───
  const shareTargets = [
    { id: "whatsapp", label: "WhatsApp" },
    { id: "telegram", label: "Telegram" },
    { id: "instagram", label: "Instagram" },
    { id: "twitter", label: "Twitter / X" },
    { id: "facebook", label: "Facebook" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  const platformDotColors: Record<string, string> = {
    whatsapp: "bg-[#25D366]",
    telegram: "bg-[#0088cc]",
    instagram: "bg-[#E4405F]",
    twitter: "bg-[#1DA1F2]",
    facebook: "bg-[#1877F2]",
    linkedin: "bg-[#0A66C2]",
  };

  const getShareUrl = (source: string) => {
    if (!shortUrl) return "";
    if (source === "general") return shortUrl;
    return `${shortUrl}?utm_source=${source}`;
  };

  const handleCopyShare = (source: string) => {
    const url = getShareUrl(source);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSource(source);
      setTimeout(() => setCopiedSource(null), 1500);
    });
  };

  const handleCopyAll = () => {
    const lines = [
      ...shareTargets.map((t) => `${t.label}: ${getShareUrl(t.id)}`),
      `General: ${shortUrl}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopiedSource("all");
      setTimeout(() => setCopiedSource(null), 2000);
    });
  };

  // ─── Auth ───
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (authMode === "signup") {
      const users = JSON.parse(localStorage.getItem("motionu_users") || "[]");
      if (users.some((u: { email: string }) => u.email === email)) {
        setAuthError("An account with that email already exists.");
        return;
      }
      users.push({ email, password });
      localStorage.setItem("motionu_users", JSON.stringify(users));
    } else {
      const users = JSON.parse(localStorage.getItem("motionu_users") || "[]");
      const match = users.find(
        (u: { email: string; password: string }) =>
          u.email === email && u.password === password
      );
      if (!match) {
        setAuthError("Email or password not recognized.");
        return;
      }
    }

    const sess = { email };
    localStorage.setItem("motionu_session", JSON.stringify(sess));
    setSession(sess);
    setShowAuth(false);
    setAuthEmail("");
    setAuthPassword("");
    setAuthError(null);
    setActiveTab("analytics");
  };

  const handleLogout = () => {
    localStorage.removeItem("motionu_session");
    setSession(null);
    setActiveTab("generator");
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
    setAuthError(null);
  };

  // ─── Nav classes ───
  const navActive = "font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-ink-soft transition-colors";
  const navIdle =
    "font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md text-muted hover:bg-ink-soft transition-colors flex items-center gap-2";

  return (
    <>
      {/* ─── HEADER ─── */}
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
              <button
                onClick={() => setActiveTab("generator")}
                className={activeTab === "generator" ? navActive : navIdle}
              >
                Routes
              </button>
              <button
                disabled
                className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md text-muted opacity-50 cursor-not-allowed flex items-center gap-2"
                title="Coming soon"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Dashboard
              </button>
              <div className="w-px h-6 bg-line-dark mx-2" />
              <div>
                {session ? (
                  <div className="flex items-center gap-3 pl-1">
                    <span className="font-mono text-xs text-muted hidden sm:inline">
                      {session.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-md hover:bg-ink-soft"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openAuth("login")}
                    className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-route hover:bg-route-dark"
                  >
                    Log in
                  </button>
                )}
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
            Turn any link into a routed, trackable, branded stop.
          </h1>
          <p className="text-muted mt-3 max-w-lg text-sm">
            Paste a destination, name the route, and Motion-U issues a short
            link with a scannable branded code attached.
          </p>

          {/* Route line SVG */}
          <div className="mt-8 hidden sm:block">
            <svg viewBox="0 0 640 60" className="w-full max-w-xl h-[52px]">
              <line
                x1="20"
                y1="30"
                x2="620"
                y2="30"
                stroke="var(--color-line-dark)"
                strokeWidth="2"
                className="station-line"
              />
              <g>
                <circle cx="20" cy="30" r="7" fill="var(--color-route)" />
                <text
                  x="20"
                  y="52"
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="1"
                >
                  ORIGIN
                </text>
              </g>
              <g>
                <circle cx="320" cy="30" r="7" fill="var(--color-route)" />
                <text
                  x="320"
                  y="52"
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="1"
                >
                  ROUTE
                </text>
              </g>
              <g>
                <circle
                  id="station-signal"
                  cx="620"
                  cy="30"
                  r="7"
                  fill={selectedLink ? "var(--color-route)" : "var(--color-ink-soft)"}
                  stroke={selectedLink ? "none" : "var(--color-muted)"}
                  strokeWidth="1.5"
                />
                <text
                  x="605"
                  y="52"
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="1"
                >
                  SIGNAL
                </text>
              </g>
            </svg>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-5 sm:px-8 py-10">
        {/* GENERATOR TAB */}
        {activeTab === "generator" && (
          <section className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form */}
              <div className="lg:col-span-3 bg-white/70 rounded-xl border border-line-paper p-6 sm:p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg">
                    Issue a new route
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Form 01
                  </span>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const url = formData.get("long-url") as string;
                    const alias = (formData.get("custom-alias") as string) || undefined;
                    await handleCreate(url, alias);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-2">
                      Destination URL
                    </label>
                    <div className="flex items-center gap-2 border border-line-paper rounded-lg bg-white px-3 transition-all focus-within:border-route focus-within:shadow-[0_0_0_3px_rgba(255,90,46,0.12)]">
                      <svg
                        className="w-4 h-4 text-muted shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                      <input
                        type="url"
                        name="long-url"
                        id="long-url"
                        required
                        placeholder="https://example.com/campaign/summer"
                        className="w-full py-3 text-sm bg-transparent placeholder:text-muted/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-2">
                        Domain
                      </label>
                      <div className="px-3 py-3 rounded-lg bg-paper-dim text-sm font-mono text-muted">
                        {typeof window !== "undefined"
                          ? window.location.host
                          : "motionu.link"}
                        /
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-2">
                        Custom slug{" "}
                        <span className="normal-case font-normal text-muted/60">
                          (optional)
                        </span>
                      </label>
                      <div className="border border-line-paper rounded-lg bg-white px-3 transition-all focus-within:border-route focus-within:shadow-[0_0_0_3px_rgba(255,90,46,0.12)]">
                        <input
                          type="text"
                          name="custom-alias"
                          id="custom-alias"
                          placeholder="summer-2026"
                          maxLength={20}
                          className="w-full py-3 text-sm bg-transparent font-mono placeholder:text-muted/60 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="board-btn w-full bg-ink hover:bg-ink-soft disabled:opacity-50 disabled:cursor-not-allowed text-paper font-medium py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span>{loading ? "Routing…" : "Issue route + QR"}</span>
                  </button>
                </form>

                {error && (
                  <p className="mt-3 font-mono text-xs text-route-dark">
                    {error}
                  </p>
                )}

                <div className="mt-6 pt-5 dash-rule flex items-start gap-2 text-xs text-muted">
                  <svg
                    className="w-4 h-4 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>
                    Every code carries a Motion-U authentication mark, so scans
                    can be told apart from copies.
                  </span>
                </div>
              </div>

              {/* Result: boarding-pass ticket */}
              <div className="lg:col-span-2 rounded-xl border border-line-paper overflow-hidden bg-white/70 flex flex-col min-h-[380px]">
                {!selectedLink ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-paper-dim flex items-center justify-center text-lg text-muted">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-display font-semibold text-sm">
                      No route issued yet
                    </h3>
                    <p className="text-xs text-muted max-w-[220px]">
                      Fill in a destination on the left — your ticket prints
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col flex-grow">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                          Ticket
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          #{selectedLink.slug.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-paper-dim rounded-lg px-3 py-3">
                        <span
                          id="result-short-url"
                          className="font-mono text-sm font-medium text-route-dark truncate pr-2"
                        >
                          {shortUrl}
                        </span>
                        <button
                          onClick={() => {
                            if (!shortUrl) return;
                            navigator.clipboard.writeText(shortUrl).then(() => {
                              const btn = document.getElementById("copy-btn");
                              if (btn) {
                                btn.innerHTML = `
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                `;
                                setTimeout(() => {
                                  btn.innerHTML = `
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                  `;
                                }, 1800);
                              }
                            });
                          }}
                          id="copy-btn"
                          className="text-muted hover:text-ink p-1.5 transition-colors"
                          title="Copy link"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="perforation perforation-ink" />

                    <div className="bg-ink text-paper p-6 flex flex-col items-center justify-center gap-4 min-h-[180px]">
                      <QRCodeCard url={shortUrl!} />
                    </div>

                    {/* ─── Share with tracking ─── */}
                    <div className="p-5 space-y-4">
                      <div className="dash-rule" />
                      <div className="space-y-1.5">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">
                          Share with tracking
                        </h3>
                        <p className="text-[11px] text-muted leading-relaxed">
                          Pick where you&apos;re sharing this link &mdash; each link gets a
                          <code className="font-mono text-route-dark"> utm_source </code>
                          tag so you can see exactly where clicks come from in analytics.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {shareTargets.map((t) => {
                          const justCopied = copiedSource === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => handleCopyShare(t.id)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-mono transition-all text-left ${
                                justCopied
                                  ? "border-signal bg-signal/5 text-signal"
                                  : "border-line-paper bg-white hover:border-route hover:text-route-dark"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full shrink-0 ${platformDotColors[t.id] || "bg-muted"}`} />
                              <span>{t.label}</span>
                              {justCopied && (
                                <span className="ml-auto text-[10px] tracking-wider uppercase">Copied</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <button
                          onClick={() => handleCopyShare("general")}
                          className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                            copiedSource === "general"
                              ? "border-signal bg-signal/5 text-signal"
                              : "border-line-paper bg-white hover:border-route hover:text-route-dark"
                          }`}
                        >
                          {copiedSource === "general" ? "Copied!" : "General link (no tag)"}
                        </button>
                        <button
                          onClick={handleCopyAll}
                          className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                            copiedSource === "all"
                              ? "bg-signal text-white"
                              : "bg-ink text-paper hover:bg-ink-soft"
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copiedSource === "all" ? "Copied all!" : "Copy all"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <section className="space-y-6">
            {!session ? (
              <div className="max-w-md mx-auto text-center rounded-xl border border-line-paper bg-white/70 p-10">
                <div className="w-12 h-12 rounded-full bg-paper-dim flex items-center justify-center mx-auto mb-4 text-muted">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Dashboard access required
                </h3>
                <p className="text-sm text-muted mb-6">
                  Log in or create a free account to see route performance and
                  click data.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => openAuth("login")}
                    className="board-btn px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="board-btn px-5 py-2.5 rounded-lg border border-ink text-sm font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            ) : (
              <Dashboard
                links={links}
                onTestHit={handleTestHit}
                onDelete={handleDelete}
                totalClicks={totalClicks}
              />
            )}
          </section>
        )}
      </main>

      {/* ─── AUTH MODAL ─── */}
      {showAuth && (
        <div
          id="auth-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          style={{ backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-line-paper bg-white/70 overflow-hidden">
            {/* Header */}
            <div className="bg-ink text-paper px-6 py-4">
              <h3 className="font-display font-semibold text-sm">
                {authMode === "login" ? "Log in" : "Create account"}
              </h3>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-line-paper">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  authMode === "login"
                    ? "bg-white text-ink"
                    : "text-muted"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  authMode === "signup"
                    ? "bg-white text-ink"
                    : "text-muted"
                }`}
              >
                Sign up
              </button>
            </div>
            {/* Form */}
            <form
              onSubmit={handleAuthSubmit}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full border border-line-paper rounded-lg bg-white px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full border border-line-paper rounded-lg bg-white px-3 py-2.5 text-sm"
                />
              </div>
              {authError && (
                <p className="font-mono text-xs text-route-dark">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-route hover:bg-route-dark text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {authMode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
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
