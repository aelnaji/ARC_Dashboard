"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DocumentItem {
  name: string;
  content?: string;
}

interface DocCheck {
  name: string;
  status: "valid" | "warning" | "error";
  notes: string[];
}

interface CheckResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
  documentChecks: DocCheck[];
  documentCount: number;
  checkedAt: string;
  aiEnhanced: boolean;
}

interface DocumentCheckPanelProps {
  documents: DocumentItem[];
}

export default function DocumentCheckPanel({
  documents,
}: DocumentCheckPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (documents.length === 0) {
      setError("No documents to check. Please upload files first.");
      return;
    }
    setError("");
    setIsChecking(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setResult(data as CheckResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setIsChecking(false);
    }
  };

  const statusIcon = result
    ? result.valid
      ? <ShieldCheck className="size-4 text-emerald-400" />
      : <ShieldAlert className="size-4 text-red-400" />
    : <FileSearch className="size-4 text-amber-400" />;

  const statusBadge = result
    ? result.valid
      ? <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">All Clear</Badge>
      : <Badge className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">{result.issues.length} Issue{result.issues.length !== 1 ? "s" : ""}</Badge>
    : null;

  return (
    <Card className="bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <CardTitle className="text-sm font-semibold text-white">
              AI Document Validation
            </CardTitle>
            <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
              Optional
            </Badge>
            {statusBadge}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCheck}
              disabled={isChecking || documents.length === 0}
              className="h-8 text-xs gap-2 bg-amber-600 hover:bg-amber-500 text-white px-3"
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  Check Documents ({documents.length})
                </>
              )}
            </Button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.6_0.01_260)] transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-[oklch(0.5_0.01_260)] mt-1">
          Validates Trade License, TRN, Invoices and document completeness for
          payment certificates.
        </p>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <CardContent className="pt-0 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {!result && !isChecking && (
                <p className="text-xs text-[oklch(0.5_0.01_260)] text-center py-4">
                  Click &ldquo;Check Documents&rdquo; to validate uploaded files.
                </p>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Issues */}
                  {result.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                        Issues Found
                      </p>
                      {result.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/15"
                        >
                          <XCircle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{issue}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        Suggestions
                      </p>
                      {result.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15"
                        >
                          <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-300">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Per-document results */}
                  {result.documentChecks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[oklch(0.7_0.01_260)] uppercase tracking-wider">
                        Per-Document Results
                      </p>
                      {result.documentChecks.map((doc, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[oklch(0.14_0.005_260)] border border-[oklch(0.22_0.005_260)]"
                        >
                          {doc.status === "valid" && (
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {doc.status === "warning" && (
                            <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          {doc.status === "error" && (
                            <XCircle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {doc.name}
                            </p>
                            {doc.notes.map((note, j) => (
                              <p
                                key={j}
                                className="text-[11px] text-[oklch(0.55_0.01_260)] mt-0.5"
                              >
                                {note}
                              </p>
                            ))}
                          </div>
                          <Badge
                            className={`text-[10px] ml-auto shrink-0 ${
                              doc.status === "valid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : doc.status === "warning"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[oklch(0.22_0.005_260)]">
                    <p className="text-[11px] text-[oklch(0.45_0.01_260)]">
                      Checked {result.documentCount} file
                      {result.documentCount !== 1 ? "s" : ""} &middot;{" "}
                      {new Date(result.checkedAt).toLocaleTimeString("en-AE")}
                      {result.aiEnhanced && " · AI-enhanced"}
                    </p>
                    {result.valid ? (
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        ✔ Documents Valid
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                        ⚠ Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
