"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeCardProps {
  url: string;
  logo?: string;
}

export function QRCodeCard({ url, logo = "/icon.png" }: QRCodeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const qr = new QRCodeStyling({
      width: 200,
      height: 200,
      type: "svg",
      data: url,
      image: logo,
      dotsOptions: { color: "#101826", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { crossOrigin: "anonymous", margin: 4 },
      cornersSquareOptions: { color: "#2F5DFF", type: "extra-rounded" },
      cornersDotOptions: { color: "#2F5DFF", type: "dot" },
    });

    qrRef.current = qr;
    el.innerHTML = "";
    qr.append(el);

    return () => {
      if (el) el.innerHTML = "";
    };
  }, [url, logo]);

  const handleDownload = () => {
    qrRef.current?.download({ name: `motionu-route-${Date.now()}`, extension: "png" });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="bg-white p-2 rounded-lg"
      />
      <button
        onClick={handleDownload}
        className="board-btn w-full bg-route hover:bg-route-dark text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Download code</span>
      </button>
    </div>
  );
}
