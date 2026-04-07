"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  Bot,
  Users,
  Activity,
  Zap,
  Plus,
  TrendingUp,
  CircleCheck,
  TriangleAlert,
  ArrowRight,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

const kpiCards = [
  { label: "Total Payment Certificates", value: "47", sub: "+5 this month",  color: "amber",   icon: FileText },
  { label: "Pending Approvals",          value: "8",  sub: "3 urgent",       color: "orange",  icon: Clock },
  { label: "AI Documents Processed",     value: "312",sub: "98.4% accuracy", color: "emerald", icon: Bot },
  { label: "Active Suppliers",           value: "56", sub: "+2 new",         color: "sky",     icon: Users },
];

const ACTIVITY_FEED = [
  { icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Payment Certificate IPA-08 generated",        desc: "Al Fardan Electromechanical",    time: "15 min ago" },
  { icon: Bot,         color: "text-amber-400",   bg: "bg-amber-500/10",   title: "AI extraction completed",                   desc: "Abu Dhabi Concreting Co.",        time: "32 min ago" },
  { icon: Activity,    color: "text-sky-400",     bg: "bg-sky-500/10",     title: "Supplier comparison exported",               desc: "Steel Frame Suppliers",          time: "1 hour ago" },
  { icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Certificate approved by Operations Director", desc: "Gulf Piling Contracting",        time: "2 hours ago" },
  { icon: TriangleAlert,color:"text-orange-400",  bg: "bg-orange-500/10",  title: "Document validation failed — missing WIR",   desc: "National Crane Services",       time: "3 hours ago" },
  { icon: Upload,      color: "text-purple-400",  bg: "bg-purple-500/10",  title: "New documents uploaded via drag & drop",     desc: "Emirates Electrical Engineering",time: "3.5 hours ago" },
  { icon: Activity,    color: "text-sky-400",     bg: "bg-sky-500/10",     title: "New supplier quotation uploaded",             desc: "Ready Mix Abu Dhabi",           time: "4 hours ago" },
  { icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "CEO approval obtained",                      desc: "Al Hamra Construction",          time: "5 hours ago" },
  { icon: Bot,         color: "text-amber-400",   bg: "bg-amber-500/10",   title: "VAT validation completed",                   desc: "Emirates Electrical Engineering",time: "6 hours ago" },
  { icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "ExcelJS 4-sheet workbook exported",           desc: "MBZ Package 05 — Cert No. 2",  time: "7 hours ago" },
  { icon: Bot,         color: "text-amber-400",   bg: "bg-amber-500/10",   title: "Document check: TRN & license verified",      desc: "Gulf Piling Contracting",        time: "8 hours ago" },
  { icon: TriangleAlert,color:"text-orange-400",  bg: "bg-orange-500/10",  title: "Appendix D — 3 line items flagged",          desc: "Al Fardan Electromechanical",   time: "9 hours ago" },
];

const quickActions = [
  { label: "New Payment Certificate", icon: Plus,        color: "amber",   section: "payment-certs"       as const },
  { label: "Supplier Comparison",     icon: TrendingUp,  color: "sky",     section: "supplier-comparison" as const },
  { label: "Check Documents",         icon: CircleCheck, color: "emerald", section: "agent-monitor"       as const },
  { label: "View Process Flows",      icon: Activity,    color: "purple",  section: "process-flows"       as const },
];

const aiAgents = [
  { name: "Payment Cert AI",    status: "Active",  color: "emerald", uptime: "99.8%" },
  { name: "Supplier Analysis",  status: "Active",  color: "sky",     uptime: "99.2%" },
  { name: "Document Validator", status: "Standby", color: "amber",   uptime: "—" },
  { name: "VAT Checker",        status: "Active",  color: "emerald", uptime: "100%" },
];

const colorMap: Record<string, { bg: string; border: string; text: string; btnBg: string; btnHover: string }> = {
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  btnBg: "bg-amber-600",  btnHover: "hover:bg-amber-500" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", btnBg: "bg-orange-600", btnHover: "hover:bg-orange-500" },
  emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",btnBg: "bg-emerald-600",btnHover: "hover:bg-emerald-500" },
  sky:    { bg: "bg-sky-500/10",    border: "border-sky-500/20",    text: "text-sky-400",    btnBg: "bg-sky-600",    btnHover: "hover:bg-sky-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", btnBg: "bg-purple-600", btnHover: "hover:bg-purple-500" },
};

export default function DashboardSection() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const [visibleCount, setVisibleCount] = useState(6);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");

  // Simulate live refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed(prev => {
        const mins = parseInt(prev) || 0;
        return prev === "Just now" ? "1 min ago" : `${mins + 1} min ago`;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed("Just now");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Centre</h1>
          <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">
            Al Ryum Contracting &amp; General Transport LLC — Abu Dhabi, UAE
          </p>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.01_260)] hover:text-white transition-colors mt-1">
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : lastRefreshed}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <Card className={`py-6 shadow-sm ${c.bg} border ${c.border}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-[oklch(0.55_0.01_260)] font-medium uppercase tracking-wide">{card.label}</p>
                      <p className={`text-2xl font-bold ${c.text}`}>{card.value}</p>
                      <p className="text-xs text-[oklch(0.5_0.01_260)]">{card.sub}</p>
                    </div>
                    <div className={`${c.bg} p-2 rounded-lg`}>
                      <Icon className={`size-5 ${c.text}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed — expandable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="lg:col-span-2">
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                    <Activity className="size-4 text-amber-400" /> Real-Time Activity
                  </CardTitle>
                  <p className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Live operations across all modules</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Badge className="text-[10px] text-[oklch(0.5_0.01_260)] border-[oklch(0.30_0.005_260)] bg-transparent">Last 24h</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                <AnimatePresence>
                  {ACTIVITY_FEED.slice(0, visibleCount).map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-[oklch(0.14_0.005_260)] hover:bg-[oklch(0.19_0.005_260)] transition-colors">
                        <div className={`p-1.5 rounded-md ${item.bg} shrink-0 mt-0.5`}>
                          <Icon className={`size-3 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">{item.title}</p>
                          <p className="text-[10px] text-[oklch(0.5_0.01_260)] truncate">{item.desc}</p>
                        </div>
                        <span className="text-[10px] text-[oklch(0.45_0.01_260)] shrink-0 whitespace-nowrap">{item.time}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              {/* Show more / less */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[oklch(0.22_0.005_260)]">
                <span className="text-[10px] text-[oklch(0.45_0.01_260)]">
                  Showing {Math.min(visibleCount, ACTIVITY_FEED.length)} of {ACTIVITY_FEED.length} events
                </span>
                <div className="flex gap-2">
                  {visibleCount < ACTIVITY_FEED.length && (
                    <button onClick={() => setVisibleCount(v => Math.min(v + 4, ACTIVITY_FEED.length))}
                      className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                      Show more ↓
                    </button>
                  )}
                  {visibleCount > 6 && (
                    <button onClick={() => setVisibleCount(6)}
                      className="text-[10px] text-[oklch(0.5_0.01_260)] hover:text-white transition-colors">
                      Collapse ↑
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="space-y-6">

          {/* Quick Actions */}
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                <Zap className="size-4 text-amber-400" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const c = colorMap[action.color];
                return (
                  <Button key={action.label} onClick={() => setActiveSection(action.section)}
                    className={`w-full justify-start gap-2 text-xs ${c.btnBg} ${c.btnHover} text-white border-0 hover:text-white h-9 px-4 py-2`}>
                    <Icon className="size-4" />
                    {action.label}
                    <ArrowRight className="size-3 ml-auto" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Agent Status */}
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                <Bot className="size-4 text-emerald-400" /> AI Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {aiAgents.map((agent, i) => {
                const c = colorMap[agent.color];
                const isActive = agent.status === "Active";
                return (
                  <motion.div key={agent.name}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                    className={`flex items-center justify-between p-2.5 rounded-lg ${
                      isActive ? `${c.bg} border ${c.border}` : "bg-[oklch(0.14_0.005_260)]"
                    }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.text.replace("text-", "bg-")} ${isActive ? "animate-pulse" : "opacity-40"}`} />
                      <span className={`text-xs font-medium ${isActive ? c.text : "text-[oklch(0.7_0.01_260)]"}`}>{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.uptime !== "—" && <span className="text-[10px] text-[oklch(0.45_0.01_260)]">{agent.uptime}</span>}
                      <Badge className={`text-[10px] ${
                        isActive ? `${c.bg} ${c.text} ${c.border}` : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>{agent.status}</Badge>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
