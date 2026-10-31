import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Our Journey — D & You", description: "Ruang kecil untuk kisah, kenangan, dan perjalanan kita berdua." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body>{children}</body></html>;
}
