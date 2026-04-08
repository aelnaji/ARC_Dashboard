"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  ChartColumn,
  Bot,
  GitBranch,
  Settings,
  Building2,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore, type Section } from "@/lib/store";
import DashboardSection from "@/components/sections/DashboardSection";
import PaymentCertsSection from "@/components/sections/PaymentCertsSection";
import SupplierComparisonSection from "@/components/sections/SupplierComparisonSection";
import AgentMonitorSection from "@/components/sections/AgentMonitorSection";
import ProcessFlowsSection from "@/components/sections/ProcessFlowsSection";
import SettingsSection from "@/components/sections/SettingsSection";
import LogoutButton from "@/components/LogoutButton";

const navItems: { key: Section; icon: typeof LayoutDashboard; label: string; desc: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard Overview", desc: "Main dashboard" },
  { key: "payment-certs", icon: FileText, label: "Payment Certificates", desc: "AI-powered cert generation" },
  { key: "supplier-comparison", icon: ChartColumn, label: "Supplier Comparison", desc: "Quotation analysis" },
  { key: "agent-monitor", icon: Bot, label: "Agent Monitor", desc: "AI agent status" },
  { key: "process-flows", icon: GitBranch, label: "Process Flows", desc: "Workflow diagrams" },
  { key: "settings", icon: Settings, label: "Settings", desc: "Configuration" },
];

const sectionComponents: Record<Section, React.FC> = {
  dashboard: DashboardSection,
  "payment-certs": PaymentCertsSection,
  "supplier-comparison": SupplierComparisonSection,
  "agent-monitor": AgentMonitorSection,
  "process-flows": ProcessFlowsSection,
  settings: SettingsSection,
};

export default function CommandCentre() {
  const { activeSection, setActiveSection } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleNavClick = (key: Section) => {
    setActiveSection(key);
    setSidebarOpen(false);
  };

  const SectionComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.005_260)] text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[oklch(0.11_0.005_260)] border-r border-[oklch(0.25_0.005_260)] flex flex-col transition-all duration-300 lg:z-30 ${
          sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        } -translate-x-full lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : ""}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[oklch(0.25_0.005_260)] shrink-0">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <img src="/arc-logo.png" alt="ARC Logo" className="w-full h-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-400 text-sm leading-tight truncate">ARC Command</p>
              <p className="text-[10px] text-[oklch(0.55_0.01_260)] leading-tight truncate">Centre</p>
            </div>
          )}
          <button
            className="lg:hidden ml-auto p-1 rounded-md hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.6_0.01_260)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 group ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 shadow-sm"
                    : "text-[oklch(0.65_0.01_260)] hover:bg-[oklch(0.18_0.01_260)] hover:text-[oklch(0.85_0.005_260)]"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-amber-400" : "text-[oklch(0.5_0.01_260)] group-hover:text-[oklch(0.7_0.01_260)]"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-[10px] text-[oklch(0.5_0.01_260)] truncate">{item.desc}</p>
                  </div>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Company Info */}
        {!sidebarCollapsed && (
          <div className="border-t border-[oklch(0.25_0.005_260)] p-3 shrink-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5 text-amber-500/60 shrink-0" />
                <p className="text-[10px] text-[oklch(0.5_0.01_260)] truncate">
                  Al Ryum Contracting &amp; General Transport LLC
                </p>
              </div>
              <p className="text-[10px] text-[oklch(0.4_0.01_260)] pl-5">Abu Dhabi, UAE</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[oklch(0.20_0.005_260)] border border-[oklch(0.30_0.005_260)] items-center justify-center text-[oklch(0.6_0.01_260)] hover:text-amber-400 hover:border-amber-500/50 transition-colors z-10"
        >
          <ChevronLeft className={`size-3 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[oklch(0.13_0.005_260)]/95 backdrop-blur-md border-b border-[oklch(0.25_0.005_260)]">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)] transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <nav className="flex items-center gap-1.5 text-xs">
                <span className="text-[oklch(0.5_0.01_260)]">
                  <span className="text-[oklch(0.80_0.005_260)] font-medium">
                    {navItems.find((n) => n.key === activeSection)?.label || "Dashboard"}
                  </span>
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-[oklch(0.5_0.01_260)]">
                <Building2 className="size-3.5 text-amber-500/60" />
                <span className="hidden md:inline">Al Ryum Contracting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <Badge className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                  Online
                </Badge>
              </div>
              <div className="h-4 w-px bg-[oklch(0.25_0.005_260)]" />
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Section Content */}
        <main className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          {mounted && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <SectionComponent />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
