import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Delta — Find your next great thing",
  description:
    "Discover, sell, and connect. A community marketplace for things with a next chapter.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
