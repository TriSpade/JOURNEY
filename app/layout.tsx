import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Our Journey — Dimas & Anita", description: "Ruang kecil untuk kisah, kenangan, dan perjalanan Dimas dan Anita." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body>{children}</body></html>;
}
