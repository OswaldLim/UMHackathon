import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DecideAI — Decision Intelligence for Malaysian Businesses",
  description:
    "AI-powered decision intelligence for SMEs and individuals. Get insights, recommendations, and predictions grounded in real Malaysian economic data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}