"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

const kpiCards = [
  {
    label: "Total Payment Certificates",
    value: "47",
    sub: "+5 this month",
    color: "amber",
    icon: FileText,
  },
  {
    label: "Pending Approvals",
    value: "8",
    sub: "3 urgent",
    color: "orange",
    icon: Clock,
  },
  {
    label: "AI Documents Processed",
    value: "312",
    sub: "98.4% accuracy",
    color: "emerald",
    icon: Bot,
  },
  {
    label: "Active Suppliers",
    value: "56",
    sub: "+2 new",
    color: "sky",
    icon: Users,
  },
];

const recentActivity = [
  {
    icon: CircleCheck,
    color: "text-emerald-400",
    title: "Payment Certificate IPA-08 generated",
    desc: "Al Fardan Electromechanical",
    time: "15 min ago",
  },
  {
    icon: Bot,
    color: "text-amber-400",
    title: "AI extraction completed",
    desc: "Abu Dhabi Concreting Co.",
    time: "32 min ago",
  },
  {
    icon: Activity,
    color: "text-sky-400",
    title: "Supplier comparison exported",
    desc: "Steel Frame Suppliers",
    time: "1 hour ago",
  },
  {
    icon: CircleCheck,
    color: "text-emerald-400",
    title: "Certificate approved by Operations Director",
    desc: "Gulf Piling Contracting",
    time: "2 hours ago",
  },
  {
    icon: TriangleAlert,
    color: "text-orange-400",
    title: "Document validation failed - missing WIR",
    desc: "National Crane Services",
    time: "3 hours ago",
  },
  {
    icon: Activity,
    color: "text-sky-400",
    title: "New supplier quotation uploaded",
    desc: "Ready Mix Abu Dhabi",
    time: "4 hours ago",
  },
  {
    icon: CircleCheck,
    color: "text-emerald-400",
    title: "CEO approval obtained",
    desc: "Al Hamra Construction",
    time: "5 hours ago",
  },
  {
    icon: Bot,
    color: "text-amber-400",
    title: "VAT validation completed",
    desc: "Emirates Electrical Engineering",
    time: "6 hours ago",
  },
];

const quickActions = [
  { label: "New Payment Certificate", icon: Plus, color: "amber", section: "payment-certs" as const },
  { label: "Supplier Comparison", icon: TrendingUp, color: "sky", section: "supplier-comparison" as const },
  { label: "Check Documents", icon: CircleCheck, color: "emerald", section: "agent-monitor" as const },
  { label: "View Process Flows", icon: Activity, color: "purple", section: "process-flows" as const },
];

const aiAgents = [
  { name: "Payment Cert AI", status: "Active", color: "emerald" },
  { name: "Supplier Analysis", status: "Active", color: "sky" },
  { name: "Document Validator", status: "Standby", color: "amber" },
  { name: "VAT Checker", status: "Active", color: "emerald" },
];

const colorMap: Record<string, { bg: string; border: string; text: string; btnBg: string; btnHover: string }> = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", btnBg: "bg-amber-600", btnHover: "hover:bg-amber-500" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", btnBg: "bg-orange-600", btnHover: "hover:bg-orange-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", btnBg: "bg-emerald-600", btnHover: "hover:bg-emerald-500" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400", btnBg: "bg-sky-600", btnHover: "hover:bg-sky-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", btnBg: "bg-purple-600", btnHover: "hover:bg-purple-500" },
};

export default function DashboardSection() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Command Centre</h1>
        <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">
          Al Ryum Contracting &amp; General Transport LLC — Abu Dhabi, UAE
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <Card className={`py-6 shadow-sm ${c.bg} border ${c.border} border`}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="lg:col-span-2">
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                    <Activity className="size-4 text-amber-400" /> Recent Activity
                  </CardTitle>
                  <p className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Latest operations across all modules</p>
                </div>
                <Badge className="text-[10px] text-[oklch(0.5_0.01_260)] border-[oklch(0.30_0.005_260)] bg-transparent">Last 24h</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {recentActivity.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }} className="flex items-start gap-3 p-2.5 rounded-lg bg-[oklch(0.14_0.005_260)] hover:bg-[oklch(0.19_0.005_260)] transition-colors">
                      <Icon className={`size-4 ${item.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-[oklch(0.5_0.01_260)] truncate">{item.desc}</p>
                      </div>
                      <span className="text-[10px] text-[oklch(0.45_0.01_260)] shrink-0 whitespace-nowrap">{item.time}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="space-y-6">
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
                  <Button key={action.label} onClick={() => setActiveSection(action.section)} className={`w-full justify-start gap-2 text-xs ${c.btnBg} ${c.btnHover} text-white border-0 hover:text-white h-9 px-4 py-2`}>
                    <Icon className="size-4" />
                    {action.label}
                    <ArrowRight className="size-3 ml-auto" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>

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
                  <motion.div key={agent.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }} className={`flex items-center justify-between p-2.5 rounded-lg ${isActive ? `${c.bg} border ${c.border}` : "bg-[oklch(0.14_0.005_260)]"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.text} ${isActive ? "animate-pulse" : ""}`} />
                      <span className={`text-xs font-medium ${isActive ? c.text : "text-[oklch(0.7_0.01_260)]"}`}>{agent.name}</span>
                    </div>
                    <Badge className={`text-[10px] ${isActive ? `${c.bg} ${c.text} ${c.border}` : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>{agent.status}</Badge>
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
