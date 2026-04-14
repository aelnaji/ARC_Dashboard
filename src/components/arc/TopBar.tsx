"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAppStore, type Section } from "@/lib/store";

const SECTION_LABELS: Record<string, string> = {
  dashboard:            "Overview",
  "payment-certs":      "Finance",
  "supplier-comparison":"Procurement",
  "agent-monitor":      "AI Hub",
  "process-flows":      "Process Flows",
  settings:             "Settings",
};

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export default function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const { activeSection } = useAppStore();
  const clock = useClock();
  const [searchFocused, setSearchFocused] = useState(false);

  const sectionLabel = SECTION_LABELS[activeSection] ?? "Overview";

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="fixed top-0 right-0 z-40 flex items-center gap-4 px-6"
      style={{
        left: 240,
        height: 56,
        background: "rgba(8,10,15,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-1.5 rounded-md transition-colors"
        style={{ color: "var(--arc-text-muted)" }}
        onClick={onMobileMenuOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1 text-xs shrink-0">
        <span style={{ color: "var(--arc-text-muted)" }}>ARC Platform</span>
        <span className="mx-1.5" style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span className="font-medium" style={{ color: "var(--arc-text)", opacity: 0.75 }}>
          {sectionLabel}
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-[340px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.25)" }}
          />
          <input
            type="text"
            placeholder="Search modules, records, actions..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-14 text-sm rounded-xl outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: searchFocused
                ? "1px solid var(--arc-accent)"
                : "1px solid rgba(255,255,255,0.08)",
              boxShadow: searchFocused ? "0 0 0 3px var(--arc-accent-glow)" : "none",
              color: "var(--arc-text)",
            }}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] rounded px-1.5 py-0.5 pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.30)",
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Clock */}
        {clock && (
          <span
            className="hidden md:block text-[11px] font-mono whitespace-nowrap"
            style={{ color: "var(--arc-text-muted)" }}
          >
            {clock}
          </span>
        )}

        <ThemeSwitcher />

        {/* Bell */}
        <button className="relative p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]">
          <Bell className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} />
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#EF4444" }}
          >
            3
          </span>
        </button>

        {/* + New */}
        <button
          className="h-8 px-4 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--arc-accent)", color: "#000" }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </motion.header>
  );
}
