"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FlowStep {
  id: string;
  label: string;
  description: string;
  icon: typeof FileText;
  status: "completed" | "active" | "pending";
  assignee?: string;
}

interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  color: string;
  steps: FlowStep[];
  progress: number;
}

const processFlows: ProcessFlow[] = [
  {
    id: "flow-1",
    name: "Payment Certificate Generation",
    description: "End-to-end workflow for generating, reviewing, and approving payment certificates",
    color: "amber",
    progress: 75,
    steps: [
      { id: "s1", label: "PO Data Extraction", description: "Extract purchase order details and supplier information", icon: FileText, status: "completed", assignee: "AI Agent" },
      { id: "s2", label: "Document Collection", description: "Gather WIR, delivery notes, and quality certificates", icon: FileText, status: "completed", assignee: "Operations Team" },
      { id: "s3", label: "AI Validation", description: "Validate all documents and cross-check data", icon: Bot, status: "active", assignee: "Payment Cert AI" },
      { id: "s4", label: "Manager Review", description: "Operations manager reviews and approves", icon: Users, status: "pending", assignee: "Operations Director" },
      { id: "s5", label: "CEO Approval", description: "Final sign-off from CEO", icon: CheckCircle2, status: "pending", assignee: "CEO" },
    ],
  },
  {
    id: "flow-2",
    name: "Supplier Quotation Analysis",
    description: "Process for comparing supplier quotes and making procurement decisions",
    color: "sky",
    progress: 60,
    steps: [
      { id: "s6", label: "Quote Upload", description: "Upload supplier quotation documents", icon: FileText, status: "completed", assignee: "Procurement Team" },
      { id: "s7", label: "AI Extraction", description: "Extract pricing and terms from quotations", icon: Bot, status: "completed", assignee: "Supplier Analysis AI" },
      { id: "s8", label: "Comparison Report", description: "Generate side-by-side comparison report", icon: Bot, status: "active", assignee: "Supplier Analysis AI" },
      { id: "s9", label: "Procurement Decision", description: "Final supplier selection and PO issuance", icon: Users, status: "pending", assignee: "Procurement Manager" },
    ],
  },
  {
    id: "flow-3",
    name: "Document Validation",
    description: "Quality assurance workflow for verifying construction documents",
    color: "emerald",
    progress: 40,
    steps: [
      { id: "s10", label: "Document Upload", description: "Upload documents for validation", icon: FileText, status: "completed", assignee: "Site Engineer" },
      { id: "s11", label: "Format Check", description: "Verify document format and completeness", icon: Bot, status: "active", assignee: "Document Validator AI" },
      { id: "s12", label: "Content Validation", description: "Validate document content against standards", icon: Bot, status: "pending", assignee: "Document Validator AI" },
      { id: "s13", label: "QA Review", description: "Quality assurance final review", icon: Users, status: "pending", assignee: "QA Manager" },
      { id: "s14", label: "Approval", description: "Document approved and archived", icon: CheckCircle2, status: "pending", assignee: "Project Manager" },
    ],
  },
  {
    id: "flow-4",
    name: "VAT Compliance Check",
    description: "Automated VAT validation for invoices and tax documents",
    color: "purple",
    progress: 100,
    steps: [
      { id: "s15", label: "Invoice Collection", description: "Gather all invoices for the period", icon: FileText, status: "completed", assignee: "Finance Team" },
      { id: "s16", label: "VAT Number Verification", description: "Validate supplier VAT numbers with FTA", icon: Bot, status: "completed", assignee: "VAT Checker AI" },
      { id: "s17", label: "Tax Calculation", description: "Verify tax amounts and calculations", icon: Bot, status: "completed", assignee: "VAT Checker AI" },
      { id: "s18", label: "Compliance Report", description: "Generate compliance report", icon: CheckCircle2, status: "completed", assignee: "Finance Manager" },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; barBg: string }> = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", barBg: "bg-amber-500" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400", barBg: "bg-sky-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", barBg: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", barBg: "bg-purple-500" },
};

export default function ProcessFlowsSection() {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <GitBranch className="size-6 text-purple-400" /> Process Flows
        </h1>
        <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">Workflow diagrams and process tracking for all operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Flows", value: "4", color: "amber" },
          { label: "Steps Completed", value: "12", color: "emerald" },
          { label: "In Progress", value: "5", color: "sky" },
          { label: "Pending Review", value: "8", color: "purple" },
        ].map((item, i) => {
          const c = colorMap[item.color];
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <Card className={`py-4 shadow-sm ${c.bg} border ${c.border}`}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${c.text}`}>{item.value}</p>
                  <p className="text-[10px] text-[oklch(0.55_0.01_260)] mt-1">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processFlows.map((flow, flowIdx) => {
          const c = colorMap[flow.color];
          const isExpanded = selectedFlow === flow.id;
          return (
            <motion.div key={flow.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + flowIdx * 0.1, duration: 0.4 }}>
              <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                      <GitBranch className={`size-4 ${c.text}`} /> {flow.name}
                    </CardTitle>
                    <Badge className={`text-[10px] ${flow.progress === 100 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : `${c.bg} ${c.text} ${c.border}`}`}>
                      {flow.progress === 100 ? "Complete" : `${flow.progress}%`}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-[oklch(0.5_0.01_260)] mt-1">{flow.description}</p>
                  {/* Progress Bar */}
                  <div className="mt-3 w-full h-1.5 rounded-full bg-[oklch(0.20_0.005_260)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${flow.progress}%` }}
                      transition={{ delay: 0.5 + flowIdx * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${c.barBg}`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <button
                    onClick={() => setSelectedFlow(isExpanded ? null : flow.id)}
                    className="text-[10px] text-[oklch(0.6_0.01_260)] hover:text-white transition-colors"
                  >
                    {isExpanded ? "Collapse" : "View Steps"}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-0"
                    >
                      {flow.steps.map((step, stepIdx) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.id} className="flex gap-3">
                            {/* Timeline */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                step.status === "completed" ? `${c.bg} border ${c.border}` :
                                step.status === "active" ? "bg-amber-500/20 border-2 border-amber-400" :
                                "bg-[oklch(0.20_0.005_260)] border border-[oklch(0.30_0.005_260)]"
                              }`}>
                                {step.status === "completed" ? (
                                  <CheckCircle2 className={`size-4 ${c.text}`} />
                                ) : step.status === "active" ? (
                                  <Clock className="size-4 text-amber-400 animate-pulse" />
                                ) : (
                                  <Circle className="size-4 text-[oklch(0.4_0.01_260)]" />
                                )}
                              </div>
                              {stepIdx < flow.steps.length - 1 && (
                                <div className={`w-0.5 h-8 ${
                                  step.status === "completed" ? `${c.barBg}/30` : "bg-[oklch(0.20_0.005_260)]"
                                }`} />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`pb-4 ${stepIdx === flow.steps.length - 1 ? "pb-0" : ""}`}>
                              <div className="flex items-center gap-2">
                                <p className={`text-xs font-medium ${
                                  step.status === "completed" ? c.text :
                                  step.status === "active" ? "text-white" :
                                  "text-[oklch(0.5_0.01_260)]"
                                }`}>{step.label}</p>
                                {step.status === "active" && (
                                  <Badge className="text-[9px] bg-amber-500/20 text-amber-300 border-amber-500/30">Active</Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-[oklch(0.45_0.01_260)] mt-0.5">{step.description}</p>
                              {step.assignee && (
                                <p className="text-[9px] text-[oklch(0.4_0.01_260)] mt-1">
                                  Assignee: <span className="text-[oklch(0.55_0.01_260)]">{step.assignee}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
