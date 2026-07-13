"use client";

import { FormEvent, useState } from "react";

interface LinkFormProps {
  onSubmit: (url: string, customSlug?: string) => Promise<void>;
  loading: boolean;
}

export function LinkForm({ onSubmit, loading }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    await onSubmit(url.trim(), customSlug.trim() || undefined);
    setUrl("");
    setCustomSlug("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="destination-url"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted block mb-1.5"
        >
          Destination URL
        </label>
        <input
          id="destination-url"
          type="url"
          required
          placeholder="https://example.com/long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-line-paper rounded-lg bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-route focus:ring-2 focus:ring-route/15 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="custom-slug"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted block mb-1.5"
        >
          Custom Slug <span className="text-muted/60">(optional)</span>
        </label>
        <input
          id="custom-slug"
          type="text"
          placeholder="my-custom-link"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          className="w-full border border-line-paper rounded-lg bg-white px-4 py-2.5 font-mono text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-route focus:ring-2 focus:ring-route/15 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-route hover:bg-route-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-6 py-2.5 transition-colors transition-transform active:scale-[.97] font-body text-sm"
      >
        {loading ? "Routing…" : "Route Link"}
      </button>
    </form>
  );
}
