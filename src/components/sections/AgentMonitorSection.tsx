"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Activity,
  Cpu,
  Send,
  Loader2,
  Zap,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/store";

interface AgentLog {
  id: string;
  agent: string;
  action: string;
  status: "success" | "error" | "processing";
  timestamp: string;
  duration: string;
}

const agents = [
  {
    name: "Payment Cert AI",
    status: "active",
    color: "emerald",
    description: "Generates and validates payment certificates using AI analysis of PO data, delivery notes, and WIR documents.",
    totalProcessed: 47,
    successRate: "98.4%",
    avgResponseTime: "2.3s",
  },
  {
    name: "Supplier Analysis",
    status: "active",
    color: "sky",
    description: "Analyzes supplier quotations, compares pricing, and provides procurement recommendations.",
    totalProcessed: 128,
    successRate: "97.1%",
    avgResponseTime: "3.1s",
  },
  {
    name: "Document Validator",
    status: "standby",
    color: "amber",
    description: "Validates construction documents including WIR, delivery notes, and quality certificates.",
    totalProcessed: 89,
    successRate: "99.2%",
    avgResponseTime: "1.8s",
  },
  {
    name: "VAT Checker",
    status: "active",
    color: "emerald",
    description: "Validates VAT numbers, tax invoices, and ensures compliance with UAE FTA regulations.",
    totalProcessed: 48,
    successRate: "100%",
    avgResponseTime: "1.2s",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
};

export default function AgentMonitorSection() {
  const { settings } = useAppStore();
  const [testQuery, setTestQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Payment Cert AI");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [error, setError] = useState("");

  const [logs, setLogs] = useState<AgentLog[]>([
    { id: "l1", agent: "Payment Cert AI", action: "Certificate IPA-08 generated", status: "success", timestamp: "15 min ago", duration: "2.1s" },
    { id: "l2", agent: "Supplier Analysis", action: "Quotation comparison for Steel Frame", status: "success", timestamp: "32 min ago", duration: "3.4s" },
    { id: "l3", agent: "Document Validator", action: "WIR validation - failed (missing doc)", status: "error", timestamp: "1 hour ago", duration: "1.8s" },
    { id: "l4", agent: "VAT Checker", action: "VAT number validation completed", status: "success", timestamp: "2 hours ago", duration: "0.9s" },
    { id: "l5", agent: "Payment Cert AI", action: "Certificate IPA-07 approved", status: "success", timestamp: "3 hours ago", duration: "1.5s" },
    { id: "l6", agent: "Supplier Analysis", action: "Ready-mix concrete analysis", status: "success", timestamp: "4 hours ago", duration: "2.8s" },
  ]);

  const handleTestAgent = async () => {
    if (!settings.nvidiaApiKey) {
      setError("NVIDIA API key is not configured. Please go to Settings to add your API key.");
      return;
    }
    if (!testQuery.trim()) {
      setError("Enter a test query for the agent.");
      return;
    }

    setError("");
    setIsLoading(true);
    setTestResult("");

    try {
      const res = await fetch("/api/nvidia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: settings.nvidiaApiKey,
          baseUrl: settings.nvidiaBaseUrl,
          model: settings.nvidiaModel,
          messages: [
            {
              role: "system",
              content: `You are the "${selectedAgent}" agent for Al Ryum Contracting & General Transport LLC. Respond to test queries as this agent would in production.`,
            },
            { role: "user", content: testQuery },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      setTestResult(data.choices?.[0]?.message?.content || "Agent responded successfully.");
      setLogs((prev) => [
        { id: `l-${Date.now()}`, agent: selectedAgent, action: `Test: ${testQuery.slice(0, 50)}...`, status: "success", timestamp: "Just now", duration: "—" },
        ...prev,
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setLogs((prev) => [
        { id: `l-${Date.now()}`, agent: selectedAgent, action: `Test failed: ${message.slice(0, 50)}`, status: "error", timestamp: "Just now", duration: "—" },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bot className="size-6 text-emerald-400" /> Agent Monitor
        </h1>
        <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">Monitor and test AI agents in real-time</p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {agents.map((agent, i) => {
          const c = colorMap[agent.color];
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card
                className={`py-4 shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedAgent === agent.name ? `${c.bg} border-2 ${c.border}` : "bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)] hover:border-[oklch(0.35_0.005_260)]"
                }`}
                onClick={() => setSelectedAgent(agent.name)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${c.text} ${agent.status === "active" ? "animate-pulse" : ""}`} />
                      <span className="text-xs font-medium text-white">{agent.name}</span>
                    </div>
                    <Badge className={`text-[10px] ${agent.status === "active" ? `${c.bg} ${c.text} ${c.border}` : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-[oklch(0.55_0.01_260)] leading-relaxed">{agent.description}</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center">
                      <p className={`text-sm font-bold ${c.text}`}>{agent.totalProcessed}</p>
                      <p className="text-[9px] text-[oklch(0.45_0.01_260)]">Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{agent.successRate}</p>
                      <p className="text-[9px] text-[oklch(0.45_0.01_260)]">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{agent.avgResponseTime}</p>
                      <p className="text-[9px] text-[oklch(0.45_0.01_260)]">Avg Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Agent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                <Cpu className="size-4 text-amber-400" /> Test Agent
              </CardTitle>
              <p className="text-xs text-[oklch(0.5_0.01_260)]">
                Testing: <span className="text-amber-400 font-medium">{selectedAgent}</span>
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-[oklch(0.65_0.01_260)]">Test Query</Label>
                <Textarea
                  placeholder="e.g. Generate a payment certificate for supplier ABC..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  rows={3}
                  className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs resize-none"
                />
              </div>
              <Button
                onClick={handleTestAgent}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs gap-2"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                {isLoading ? "Running Test..." : "Run Test"}
              </Button>
              {error && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-[10px] text-red-300">{error}</p>
                </div>
              )}
              {testResult && (
                <div className="p-3 rounded-lg bg-[oklch(0.14_0.005_260)] border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-medium mb-1">Response</p>
                  <p className="text-[11px] text-[oklch(0.7_0.005_260)] leading-relaxed whitespace-pre-wrap">{testResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Logs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="lg:col-span-2">
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                <Activity className="size-4 text-amber-400" /> Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[oklch(0.25_0.005_260)] hover:bg-transparent">
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Agent</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Action</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Status</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Time</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-[oklch(0.20_0.005_260)] hover:bg-[oklch(0.19_0.005_260)]">
                        <TableCell className="text-xs text-white font-medium">{log.agent}</TableCell>
                        <TableCell className="text-xs text-[oklch(0.6_0.01_260)] max-w-[200px] truncate">{log.action}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${log.status === "success" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : log.status === "error" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[oklch(0.5_0.01_260)]">{log.timestamp}</TableCell>
                        <TableCell className="text-xs text-[oklch(0.5_0.01_260)]">{log.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
