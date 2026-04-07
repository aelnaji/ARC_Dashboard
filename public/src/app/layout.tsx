import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARC Command Centre",
  description: "Al Ryum Contracting & General Transport LLC — Command Centre Dashboard. AI-powered payment certificate management, supplier comparison, and document processing for construction operations in Abu Dhabi, UAE.",
  keywords: ["ARC", "Al Ryum", "Command Centre", "Payment Certificate", "Construction", "Abu Dhabi", "UAE"],
  authors: [{ name: "Al Ryum Contracting & General Transport LLC" }],
  icons: {
    icon: "/arc-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
