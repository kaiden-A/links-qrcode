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

  const handleDownload = async () => {
    const qr = qrRef.current;
    if (!qr) return;

    // Get SVG at its original vector quality
    const svgBlob = await qr.getRawData("svg");
    if (!svgBlob) return;

    // Browser-only: getRawData returns Blob in the browser
    if (!(svgBlob instanceof Blob)) return;

    const svgUrl = URL.createObjectURL(svgBlob);

    // Load the SVG into an off-screen Image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Failed to load QR SVG for download"));
      };
      img.src = svgUrl;
    });

    // Render the vector SVG onto a high-res canvas (10× = 2000×2000)
    const scale = 10;
    const width = 200 * scale;
    const height = 200 * scale;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(svgUrl);
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(svgUrl);

    // Trigger download of the high-res PNG
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `motionu-route-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
