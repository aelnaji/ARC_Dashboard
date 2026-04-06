"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Pencil,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import PaymentCertForm from "./PaymentCertForm";

interface CertRecord {
  id: string;
  supplier: string;
  poNumber: string;
  certNumber: string;
  amount: string;
  status: "generating" | "completed" | "failed";
  aiResponse?: string;
  createdAt: string;
}

type ViewMode = "list" | "form";

export default function PaymentCertsSection() {
  const { settings } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [formKey, setFormKey] = useState(0);
  const [supplierName, setSupplierName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<any>(null);
  const [certs, setCerts] = useState<CertRecord[]>([
    {
      id: "cert-001",
      supplier: "Dhilal Al Qamar Tents & Shades Ind LLC",
      poNumber: "RCT24PORS08050",
      certNumber: "IPA-02",
      amount: "AED 23,625.00",
      status: "completed",
      aiResponse: "Payment certificate generated successfully with all supporting documents validated.",
      createdAt: "2026-03-28T10:30:00Z",
    },
    {
      id: "cert-002",
      supplier: "Gulf Piling Contracting",
      poNumber: "PO-2025-0038",
      certNumber: "IPA-07",
      amount: "AED 1,250,000",
      status: "completed",
      aiResponse: "Approved by Operations Director. Ready for CEO sign-off.",
      createdAt: "2026-03-27T14:15:00Z",
    },
    {
      id: "cert-003",
      supplier: "Abu Dhabi Concreting Co.",
      poNumber: "PO-2025-0051",
      certNumber: "IPA-09",
      amount: "AED 423,200",
      status: "completed",
      aiResponse: "VAT validation passed. All quantities verified against delivery notes.",
      createdAt: "2026-03-25T09:00:00Z",
    },
  ]);

  const handleGenerate = async () => {
    if (!settings.nvidiaApiKey) {
      setError("NVIDIA API key is not configured. Please go to Settings to add your API key.");
      return;
    }
    if (!supplierName.trim() || !poNumber.trim()) {
      setError("Please fill in supplier name and PO number.");
      return;
    }

    setError("");
    setIsLoading(true);
    const newCertId = `cert-${Date.now()}`;

    const newCert: CertRecord = {
      id: newCertId,
      supplier: supplierName.trim(),
      poNumber: poNumber.trim(),
      certNumber: `IPA-${String(certs.length + 1).padStart(2, "0")}`,
      amount: "Calculating...",
      status: "generating",
      createdAt: new Date().toISOString(),
    };
    setCerts((prev) => [newCert, ...prev]);

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
              content: "You are an AI assistant for Al Ryum Contracting & General Transport LLC in Abu Dhabi, UAE. You help generate payment certificates for construction operations.",
            },
            {
              role: "user",
              content: `Generate a payment certificate for:\nSupplier: ${supplierName.trim()}\nPO Number: ${poNumber.trim()}\nDescription: ${certDescription.trim() || "Standard payment certificate generation"}`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate certificate");
      const aiText = data.choices?.[0]?.message?.content || "Certificate generated successfully.";
      setCerts((prev) =>
        prev.map((c) =>
          c.id === newCertId
            ? { ...c, status: "completed" as const, aiResponse: aiText, amount: "AED " + (Math.floor(Math.random() * 900000) + 100000).toLocaleString() }
            : c
        )
      );
      setSupplierName("");
      setPoNumber("");
      setCertDescription("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setCerts((prev) =>
        prev.map((c) =>
          c.id === newCertId ? { ...c, status: "failed" as const, aiResponse: message } : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open a cert record in the form editor, seeding it with its data
  const handleViewCert = (cert: CertRecord) => {
    setInitialData({
      vendorName: cert.supplier,
      scOrderNo: cert.poNumber,
      certNo: cert.certNumber.replace("IPA-", ""),
      notes: cert.aiResponse || "",
    });
    setFormKey((k) => k + 1);
    setViewMode("form");
  };

  // Open a blank new cert
  const handleNewEmpty = () => {
    setInitialData(null);
    setFormKey((k) => k + 1);
    setViewMode("form");
  };

  // Open editor without resetting (keeps last form state)
  const handleOpenEditor = () => {
    setInitialData(null);
    setViewMode("form");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="size-6 text-amber-400" /> Payment Certificates
          </h1>
          <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">AI-powered payment certificate generation and management</p>
        </div>
        {viewMode === "form" && (
          <Button
            variant="outline"
            onClick={() => setViewMode("list")}
            className="h-9 text-xs gap-2 border-[oklch(0.30_0.005_260)] text-[oklch(0.65_0.01_260)] hover:bg-[oklch(0.18_0.01_260)] hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to List
          </Button>
        )}
      </div>

      {viewMode === "form" ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <PaymentCertForm key={formKey} initialData={initialData} />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
              <CardHeader className="pb-3">
                <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                  <Plus className="size-4 text-amber-400" /> New Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-[oklch(0.65_0.01_260)]">Supplier Name *</Label>
                  <Input
                    placeholder="e.g. Al Fardan Electromechanical"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[oklch(0.65_0.01_260)]">PO Number *</Label>
                  <Input
                    placeholder="e.g. PO-2025-0042"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[oklch(0.65_0.01_260)]">Description / Notes</Label>
                  <Textarea
                    placeholder="Additional details for cert generation..."
                    value={certDescription}
                    onChange={(e) => setCertDescription(e.target.value)}
                    rows={3}
                    className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white h-9 text-xs gap-2"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isLoading ? "Generating with AI..." : "Generate Certificate"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Certificate List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="lg:col-span-2">
            <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold text-base text-white">Certificate History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {certs.length} certificates
                    </Badge>
                    <Button
                      onClick={handleNewEmpty}
                      className="h-8 text-[10px] gap-1.5 bg-green-700 hover:bg-green-600 text-white px-2.5"
                    >
                      <FilePlus className="size-3" /> New Empty Certificate
                    </Button>
                    <Button
                      onClick={handleOpenEditor}
                      className="h-8 text-[10px] gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5"
                    >
                      <Pencil className="size-3" /> Open Certificate Editor
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                  {certs.map((cert, i) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                      className="p-4 rounded-lg bg-[oklch(0.14_0.005_260)] hover:bg-[oklch(0.19_0.005_260)] transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {cert.status === "completed" && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
                          {cert.status === "failed" && <AlertCircle className="size-4 text-red-400 shrink-0" />}
                          {cert.status === "generating" && <Loader2 className="size-4 text-amber-400 shrink-0 animate-spin" />}
                          <div>
                            <p className="text-xs text-white font-medium">{cert.supplier}</p>
                            <p className="text-[10px] text-[oklch(0.5_0.01_260)]">
                              {cert.poNumber} &middot; {cert.certNumber} &middot; {cert.amount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {cert.status === "completed" && (
                            <Button
                              variant="ghost"
                              onClick={() => handleViewCert(cert)}
                              className="h-7 text-[10px] gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
                            >
                              <Eye className="size-3" /> View
                            </Button>
                          )}
                          <Badge
                            className={`text-[10px] shrink-0 ${
                              cert.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : cert.status === "failed"
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {cert.status === "generating" ? "Generating..." : cert.status}
                          </Badge>
                        </div>
                      </div>
                      {cert.aiResponse && (
                        <p className="text-[11px] text-[oklch(0.6_0.01_260)] leading-relaxed pl-6">{cert.aiResponse}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
