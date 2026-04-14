import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/arc-themes.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARC Command Centre",
  description:
    "Al Ryum Contracting & General Transport LLC \u2014 Command Centre Dashboard. AI-powered payment certificate management, supplier comparison, and document processing for construction operations in Abu Dhabi, UAE.",
  keywords: ["ARC", "Al Ryum", "Command Centre", "Payment Certificate", "Construction", "Abu Dhabi", "UAE"],
  authors: [{ name: "Al Ryum Contracting & General Transport LLC" }],
  icons: { icon: "/arc-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-arc-green" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ background: "var(--arc-bg-page)", color: "var(--arc-text)" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
