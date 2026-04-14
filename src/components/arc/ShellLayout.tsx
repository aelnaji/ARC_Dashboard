"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AIIntelligencePanel from "./AIIntelligencePanel";

interface ShellLayoutProps {
  children: React.ReactNode;
}

export default function ShellLayout({ children }: ShellLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div
      className="min-h-screen arc-hex-bg"
      style={{ background: "var(--arc-bg-page)" }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        onOpenChat={() => setChatOpen(true)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Top Bar */}
      <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-y-auto"
        style={{
          marginLeft: 240,
          paddingTop: 56,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>

      {/* AI Intelligence Panel */}
      <AIIntelligencePanel />
    </div>
  );
}
