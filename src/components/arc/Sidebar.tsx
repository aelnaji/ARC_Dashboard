"use client";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, ChartColumn, Bot,
  GitBranch, Settings, Package, BarChart3, BrainCircuit, X
} from "lucide-react";
import { useAppStore, type Section } from "@/lib/store";

interface NavItem {
  key: Section | "reports";
  icon: typeof LayoutDashboard;
  label: string;
  badge?: { text: string; type: "amber" | "red" | "emerald" };
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",            icon: LayoutDashboard, label: "Overview" },
  { key: "payment-certs",        icon: FileText,         label: "Finance",       badge: { text: "9", type: "amber" } },
  { key: "supplier-comparison",  icon: Package,          label: "Procurement",   badge: { text: "4", type: "amber" } },
  { key: "agent-monitor",        icon: Bot,              label: "AI Hub",        badge: { text: "1", type: "red" } },
  { key: "process-flows",        icon: GitBranch,        label: "Process Flows" },
  { key: "settings",             icon: Settings,         label: "Settings" },
  { key: "reports",              icon: BarChart3,         label: "Reports",      comingSoon: true },
];

const BADGE_STYLES = {
  amber: {
    background: "rgba(245,158,11,0.12)",
    color: "#F59E0B",
    border: "1px solid rgba(245,158,11,0.25)",
  },
  red: {
    background: "rgba(239,68,68,0.12)",
    color: "#EF4444",
    border: "1px solid rgba(239,68,68,0.25)",
  },
  emerald: {
    background: "rgba(16,185,129,0.12)",
    color: "#10B981",
    border: "1px solid rgba(16,185,129,0.25)",
  },
};

interface SidebarProps {
  onOpenChat: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ onOpenChat, mobileOpen, onMobileClose }: SidebarProps) {
  const { activeSection, setActiveSection } = useAppStore();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.aside
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 z-50 h-full flex flex-col lg:translate-x-0 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 240,
          background: "var(--arc-bg-sidebar)",
          borderRight: "1px solid var(--arc-sidebar-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 pt-6 pb-5 shrink-0"
        >
          {/* Hexagon logo */}
          <div className="relative shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <polygon
                points="17,2 31,9.5 31,24.5 17,32 3,24.5 3,9.5"
                fill="var(--arc-accent-muted)"
                stroke="var(--arc-accent)"
                strokeWidth="1.5"
              />
              <text
                x="17" y="21"
                textAnchor="middle"
                fontSize="11"
                fontWeight="900"
                fill="var(--arc-accent)"
                fontFamily="Inter, sans-serif"
              >
                ARC
              </text>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight" style={{ color: "var(--arc-accent)" }}>
              Command Centre
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase mt-0.5"
               style={{ color: "var(--arc-text-muted)" }}>
              Al Ryum Contracting
            </p>
          </div>
          <button
            className="lg:hidden ml-auto p-1 rounded-md transition-colors"
            style={{ color: "var(--arc-text-muted)" }}
            onClick={onMobileClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar pb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (!item.comingSoon) {
                    setActiveSection(item.key as Section);
                    onMobileClose();
                  }
                }}
                className="w-full h-9 flex items-center gap-3 px-3 rounded-lg text-left transition-colors relative"
                style={{
                  background: isActive ? "var(--arc-accent-muted)" : "transparent",
                  color: isActive ? "var(--arc-accent)" : "rgba(241,245,249,0.55)",
                  borderLeft: isActive ? "2px solid var(--arc-accent)" : "2px solid transparent",
                  marginLeft: "-1px",
                  cursor: item.comingSoon ? "default" : "pointer",
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? "var(--arc-accent)" : "rgba(241,245,249,0.35)" }}
                />
                <span className="text-sm flex-1 truncate">{item.label}</span>

                {item.comingSoon && (
                  <span
                    className="text-[9px] rounded-full px-1.5 py-0.5"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(241,245,249,0.35)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    Soon
                  </span>
                )}

                {item.badge && !item.comingSoon && (
                  <span
                    className="text-[10px] rounded-full px-2 py-0.5 font-medium"
                    style={BADGE_STYLES[item.badge.type]}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Bottom: user + AI button */}
        <div className="px-4 pb-5 pt-3 shrink-0 space-y-3">
          {/* User row */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{
                background: "var(--arc-accent-muted)",
                border: "1px solid var(--arc-accent)",
                color: "var(--arc-accent)",
                opacity: 0.9,
              }}
            >
              AE
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: "var(--arc-text)" }}>
                Abdullah El Naji
              </p>
              <span
                className="text-[10px] rounded-full px-2 inline-block mt-0.5"
                style={{
                  background: "var(--arc-accent-muted)",
                  color: "var(--arc-accent)",
                }}
              >
                IT Director
              </span>
            </div>
          </div>

          {/* AI Intelligence button */}
          <button
            onClick={onOpenChat}
            className="w-full h-9 flex items-center gap-2 px-3 rounded-lg arc-ai-btn-pulse transition-colors"
            style={{
              background: "rgba(0,212,255,0.07)",
              border: "1px solid rgba(0,212,255,0.22)",
            }}
          >
            <BrainCircuit className="w-4 h-4 shrink-0" style={{ color: "#00D4FF", opacity: 0.8 }} />
            <span className="text-xs" style={{ color: "#00D4FF", opacity: 0.75 }}>
              ARC Intelligence
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
