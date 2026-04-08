"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Clock, Bot, Users, Activity, Zap, Plus,
  TrendingUp, TrendingDown, CircleCheck, TriangleAlert,
  ArrowRight, Upload, RefreshCw, Building2, DollarSign,
  BarChart3, ShieldCheck,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

// ─── Data ────────────────────────────────────────────────────────────────────

const kpiCards = [
  {
    label: "Total Certified Value",
    value: "AED 187.4M",
    sub: "+AED 14.2M this month",
    trend: "+8.2%",
    up: true,
    color: "amber",
    icon: DollarSign,
    spark: [142, 155, 161, 168, 173, 187],
  },
  {
    label: "Pending Approvals",
    value: "23",
    sub: "7 urgent · 16 in review",
    trend: "+5 today",
    up: false,
    color: "orange",
    icon: Clock,
    spark: [12, 18, 14, 21, 19, 23],
  },
  {
    label: "Payment Certificates",
    value: "312",
    sub: "~100 / month · 6 packages",
    trend: "+94 this month",
    up: true,
    color: "emerald",
    icon: FileText,
    spark: [68, 74, 89, 95, 102, 94],
  },
  {
    label: "Active Suppliers",
    value: "287",
    sub: "14 new · 3 under review",
    trend: "+14 this month",
    up: true,
    color: "sky",
    icon: Users,
    spark: [241, 255, 263, 271, 278, 287],
  },
];

// Supplier quote comparison trend — last 6 months
const supplierTrendData = [
  { month: "Nov", "Al Fardan EM": 4.2,  "Gulf Piling":  3.8, "National Crane": 5.1, "Emirates Elect": 3.4 },
  { month: "Dec", "Al Fardan EM": 4.5,  "Gulf Piling":  3.6, "National Crane": 5.3, "Emirates Elect": 3.6 },
  { month: "Jan", "Al Fardan EM": 4.3,  "Gulf Piling":  3.9, "National Crane": 4.9, "Emirates Elect": 3.5 },
  { month: "Feb", "Al Fardan EM": 4.8,  "Gulf Piling":  4.1, "National Crane": 5.2, "Emirates Elect": 3.8 },
  { month: "Mar", "Al Fardan EM": 5.1,  "Gulf Piling":  3.7, "National Crane": 5.5, "Emirates Elect": 4.0 },
  { month: "Apr", "Al Fardan EM": 4.9,  "Gulf Piling":  4.3, "National Crane": 5.0, "Emirates Elect": 4.2 },
];

const SUPPLIER_LINES = [
  { key: "Al Fardan EM",    color: "#f59e0b" },
  { key: "Gulf Piling",     color: "#38bdf8" },
  { key: "National Crane",  color: "#f97316" },
  { key: "Emirates Elect",  color: "#34d399" },
];

// Projects
const projects = [
  { name: "MBZ Package 05 — Civil Works",       contract: "AED 142.0M", certified: "AED 94.3M",  pct: 66, color: "amber" },
  { name: "Abu Dhabi Ring Road — Drainage",     contract: "AED 87.5M",  certified: "AED 52.1M",  pct: 60, color: "sky" },
  { name: "Mussafah Industrial — MEP Package",  contract: "AED 61.2M",  certified: "AED 41.0M",  pct: 67, color: "emerald" },
];

const ACTIVITY_FEED = [
  { icon: CircleCheck,   color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Certificate IPA-08 generated — AED 2.14M",     desc: "Al Fardan Electromechanical · MBZ Pkg 05",     time: "8 min ago" },
  { icon: Bot,           color: "text-amber-400",   bg: "bg-amber-500/10",   title: "AI extraction completed — 47 line items",     desc: "Abu Dhabi Concreting Co. · Ring Road",         time: "31 min ago" },
  { icon: TrendingUp,    color: "text-sky-400",     bg: "bg-sky-500/10",     title: "Supplier comparison: Gulf Piling lowest bid",  desc: "Steel Frame Package · Saving: AED 380K",       time: "1 hr ago" },
  { icon: CircleCheck,   color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Cert IPA-07 approved by Operations Director",  desc: "Gulf Piling Contracting · AED 3.87M",         time: "2 hrs ago" },
  { icon: TriangleAlert, color: "text-orange-400",  bg: "bg-orange-500/10",  title: "Validation failed — WIR missing (Ref 34-C)",  desc: "National Crane Services · Mussafah MEP",      time: "3 hrs ago" },
  { icon: Upload,        color: "text-purple-400",  bg: "bg-purple-500/10",  title: "12 documents uploaded via drag & drop",       desc: "Emirates Electrical Engineering",             time: "3.5 hrs ago" },
  { icon: ShieldCheck,   color: "text-sky-400",     bg: "bg-sky-500/10",     title: "TRN & Trade License verified",                desc: "Ready Mix Abu Dhabi · Supplier onboarding",   time: "4 hrs ago" },
  { icon: CircleCheck,   color: "text-emerald-400", bg: "bg-emerald-500/10", title: "CEO approval obtained — AED 5.20M cert",      desc: "Al Hamra Construction · Ring Road Pkg",       time: "5 hrs ago" },
  { icon: Bot,           color: "text-amber-400",   bg: "bg-amber-500/10",   title: "VAT 5% validation passed — AED 107K",         desc: "Emirates Electrical Engineering",             time: "6 hrs ago" },
  { icon: CircleCheck,   color: "text-emerald-400", bg: "bg-emerald-500/10", title: "ExcelJS 4-sheet workbook exported",            desc: "MBZ Package 05 — Cert No. 12",               time: "7 hrs ago" },
  { icon: Bot,           color: "text-amber-400",   bg: "bg-amber-500/10",   title: "Appendix D: 3 items flagged over tolerance",  desc: "Al Fardan Electromechanical · Qty check",     time: "8 hrs ago" },
  { icon: TriangleAlert, color: "text-orange-400",  bg: "bg-orange-500/10",  title: "New supplier registered — pending review",    desc: "Al Masaood Engineering · Abu Dhabi",          time: "9 hrs ago" },
];

const quickActions = [
  { label: "New Payment Certificate", desc: "Generate AI-powered cert",   icon: Plus,        color: "amber",   section: "payment-certs"       as const },
  { label: "Supplier Comparison",     desc: "Analyse & score quotations",  icon: TrendingUp,  color: "sky",     section: "supplier-comparison" as const },
  { label: "Check Documents",         desc: "TRN, license & WIR check",   icon: ShieldCheck, color: "emerald", section: "agent-monitor"       as const },
  { label: "View Process Flows",      desc: "Workflow & approval chains",  icon: Activity,    color: "purple",  section: "process-flows"       as const },
];

const aiAgents = [
  { name: "Payment Cert AI",    model: "Llama 3.1 405B",  status: "Active",  color: "emerald", uptime: "99.8%",  certs: 312 },
  { name: "Supplier Analysis",  model: "Mixtral 8×22B",   status: "Active",  color: "sky",     uptime: "99.2%",  certs: 287 },
  { name: "Document Validator", model: "Llama 3.2 Vision",status: "Standby", color: "amber",   uptime: "—",      certs: 189 },
  { name: "VAT Checker",        model: "Nemotron 340B",   status: "Active",  color: "emerald", uptime: "100%",   certs: 312 },
];

const colorMap: Record<string, { bg: string; border: string; text: string; btnBg: string; btnHover: string; bar: string }> = {
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  btnBg: "bg-amber-600",  btnHover: "hover:bg-amber-500",  bar: "bg-amber-400" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", btnBg: "bg-orange-600", btnHover: "hover:bg-orange-500", bar: "bg-orange-400" },
  emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",btnBg: "bg-emerald-600",btnHover: "hover:bg-emerald-500",bar: "bg-emerald-400" },
  sky:    { bg: "bg-sky-500/10",    border: "border-sky-500/20",    text: "text-sky-400",    btnBg: "bg-sky-600",    btnHover: "hover:bg-sky-500",    bar: "bg-sky-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", btnBg: "bg-purple-600", btnHover: "hover:bg-purple-500", bar: "bg-purple-400" },
};

// ─── Sparkline component ──────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64; const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SPARK_COLORS: Record<string, string> = {
  amber: "#f59e0b", orange: "#f97316", emerald: "#34d399", sky: "#38bdf8",
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.30_0.005_260)] rounded-lg p-3 shadow-xl text-xs">
      <p className="text-[oklch(0.6_0.01_260)] mb-2 font-medium">{label} 2026</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[oklch(0.75_0.01_260)]">{p.name}:</span>
          <span className="text-white font-semibold">AED {p.value}M</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardSection() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const [visibleCount, setVisibleCount] = useState(6);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState("");

  useEffect(() => {
    const fmt = () => new Date().toLocaleString("en-AE", {
      weekday: "short", day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: true,
      timeZone: "Asia/Dubai",
    });
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Centre</h1>
          <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">
            Al Ryum Contracting &amp; General Transport LLC
            <span className="mx-2 opacity-30">·</span>
            <span className="text-amber-400/80">Abu Dhabi, UAE</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[oklch(0.5_0.01_260)] bg-[oklch(0.17_0.005_260)] border border-[oklch(0.25_0.005_260)] rounded-lg px-3 py-1.5">
            <Building2 className="size-3.5 text-amber-500/60" />
            <span>{now}</span>
          </div>
          <button onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.01_260)] hover:text-amber-400 transition-colors bg-[oklch(0.17_0.005_260)] border border-[oklch(0.25_0.005_260)] rounded-lg px-3 py-1.5">
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}>
              <Card className={`py-0 shadow-md bg-[oklch(0.17_0.005_260)] border ${c.border} hover:border-opacity-60 transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${c.bg}`}>
                      <Icon className={`size-4 ${c.text}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      card.up
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {card.up
                        ? <TrendingUp className="size-2.5" />
                        : <TrendingDown className="size-2.5" />}
                      {card.trend}
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${c.text} leading-tight`}>{card.value}</p>
                  <p className="text-[10px] text-[oklch(0.5_0.01_260)] mt-0.5 mb-3">{card.sub}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-[9px] text-[oklch(0.45_0.01_260)] uppercase tracking-widest">{card.label}</p>
                    <Sparkline data={card.spark} color={SPARK_COLORS[card.color]} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Project Summary ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <Card className="py-0 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="font-semibold text-sm text-white flex items-center gap-2">
              <BarChart3 className="size-4 text-amber-400" /> Active Contracts
              <Badge className="ml-auto text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/5">3 packages</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-3">
              {projects.map((p) => {
                const c = colorMap[p.color];
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.bar}`} />
                        <span className="text-xs text-white font-medium">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[oklch(0.5_0.01_260)]">
                        <span>Contract: <span className="text-white">{p.contract}</span></span>
                        <span>Certified: <span className={c.text}>{p.certified}</span></span>
                        <span className={`font-bold ${c.text}`}>{p.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[oklch(0.22_0.005_260)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${c.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Supplier Quote Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }} className="lg:col-span-2">
          <Card className="py-0 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-semibold text-sm text-white flex items-center gap-2">
                    <TrendingUp className="size-4 text-sky-400" /> Supplier Quote Trend
                  </CardTitle>
                  <p className="text-[10px] text-[oklch(0.5_0.01_260)] mt-0.5">Monthly quote value (AED M) — Top 4 suppliers · Nov 2025 – Apr 2026</p>
                </div>
                <Badge className="text-[10px] text-sky-400 border-sky-500/30 bg-sky-500/5">6 months</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-2">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={supplierTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "oklch(0.5 0.01 260)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.5 0.01 260)", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}M`} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                    formatter={(value) => <span style={{ color: "oklch(0.65 0.01 260)" }}>{value}</span>}
                  />
                  {SUPPLIER_LINES.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color}
                      strokeWidth={2} dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }} className="space-y-5">

          {/* Quick Actions */}
          <Card className="py-0 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="font-semibold text-sm text-white flex items-center gap-2">
                <Zap className="size-4 text-amber-400" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const c = colorMap[action.color];
                return (
                  <button key={action.label} onClick={() => setActiveSection(action.section)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${c.bg} border ${c.border} hover:opacity-80 transition-all text-left group`}>
                    <div className={`p-1.5 rounded-md bg-[oklch(0.13_0.005_260)]`}>
                      <Icon className={`size-3.5 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${c.text}`}>{action.label}</p>
                      <p className="text-[10px] text-[oklch(0.5_0.01_260)]">{action.desc}</p>
                    </div>
                    <ArrowRight className={`size-3.5 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Agent Status */}
          <Card className="py-0 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="font-semibold text-sm text-white flex items-center gap-2">
                <Bot className="size-4 text-emerald-400" /> AI Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3 space-y-2">
              {aiAgents.map((agent, i) => {
                const c = colorMap[agent.color];
                const isActive = agent.status === "Active";
                return (
                  <motion.div key={agent.name}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      isActive ? `${c.bg} ${c.border}` : "bg-[oklch(0.14_0.005_260)] border-[oklch(0.22_0.005_260)]"
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive ? `${c.bar} animate-pulse` : "bg-[oklch(0.4_0.01_260)]"
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          isActive ? c.text : "text-[oklch(0.6_0.01_260)]"
                        }`}>{agent.name}</p>
                        <p className="text-[9px] text-[oklch(0.4_0.01_260)] truncate">{agent.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {agent.uptime !== "—" && (
                        <span className="text-[9px] text-[oklch(0.45_0.01_260)]">{agent.uptime}</span>
                      )}
                      <Badge className={`text-[9px] ${
                        isActive
                          ? `${c.bg} ${c.text} ${c.border}`
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>{agent.status}</Badge>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Activity Feed ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4 }}>
        <Card className="py-0 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-semibold text-sm text-white flex items-center gap-2">
                  <Activity className="size-4 text-amber-400" /> Real-Time Activity
                </CardTitle>
                <p className="text-[10px] text-[oklch(0.5_0.01_260)] mt-0.5">Live operations across all modules — today</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-[oklch(0.45_0.01_260)]">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <AnimatePresence>
                {ACTIVITY_FEED.slice(0, visibleCount).map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[oklch(0.14_0.005_260)] hover:bg-[oklch(0.19_0.005_260)] transition-colors">
                      <div className={`p-1.5 rounded-md ${item.bg} shrink-0 mt-0.5`}>
                        <Icon className={`size-3 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-[oklch(0.5_0.01_260)] truncate">{item.desc}</p>
                      </div>
                      <span className="text-[10px] text-[oklch(0.4_0.01_260)] shrink-0 whitespace-nowrap">{item.time}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[oklch(0.22_0.005_260)]">
              <span className="text-[10px] text-[oklch(0.4_0.01_260)]">
                Showing {Math.min(visibleCount, ACTIVITY_FEED.length)} of {ACTIVITY_FEED.length} events
              </span>
              <div className="flex gap-3">
                {visibleCount < ACTIVITY_FEED.length && (
                  <button onClick={() => setVisibleCount(v => Math.min(v + 4, ACTIVITY_FEED.length))}
                    className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">Show more ↓</button>
                )}
                {visibleCount > 6 && (
                  <button onClick={() => setVisibleCount(6)}
                    className="text-[10px] text-[oklch(0.5_0.01_260)] hover:text-white transition-colors">Collapse ↑</button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
