import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
export const metadata: Metadata = {
  title: "Delta — Every store. One place.",
  description:
    "Discover independent stores, shop their collections, and manage your business with Delta Commerce.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
