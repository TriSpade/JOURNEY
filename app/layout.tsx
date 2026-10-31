import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = { title: "Our Journey — Dimas & Anita", description: "Ruang kecil untuk kisah, kenangan, dan perjalanan Dimas dan Anita." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  const imageStyle = { "--hero-image": `url("${basePath}/hero-bandung.webp")` } as CSSProperties;
  return <html lang="id" style={imageStyle}><body>{children}</body></html>;
}
