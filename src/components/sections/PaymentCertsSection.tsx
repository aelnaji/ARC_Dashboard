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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppStore, SavedCert } from "@/lib/store";
import PaymentCertForm from "./PaymentCertForm";

function createClientId(): string {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type ViewMode = "list" | "form";

export default function PaymentCertsSection() {
  const { settings, savedCerts, createCert, updateCert, deleteCert } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [formKey, setFormKey] = useState(0);
  const [activeCertId, setActiveCertId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);

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
    const newId = createClientId();
    const certNumber = `IPA-${String(savedCerts.length + 1).padStart(2, "0")}`;

    createCert({
      id: newId,
      supplier: supplierName.trim(),
      poNumber: poNumber.trim(),
      certNumber,
      amount: "Calculating...",
      status: "generating",
    });

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
              content:
                "You are an AI assistant for Al Ryum Contracting & General Transport LLC in Abu Dhabi, UAE. You help generate payment certificates for construction operations.",
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
      updateCert(newId, {
        status: "completed",
        aiResponse: aiText,
        amount: "AED " + (Math.floor(Math.random() * 900000) + 100000).toLocaleString(),
      });
      setSupplierName("");
      setPoNumber("");
      setCertDescription("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      updateCert(newId, { status: "failed", aiResponse: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCert = (cert: SavedCert) => {
    setActiveCertId(cert.id);
    setInitialData({
      vendorName: cert.supplier,
      scOrderNo: cert.poNumber,
      certNo: cert.certNumber.replace("IPA-", ""),
      notes: cert.aiResponse || "",
      ...(cert.formData || {}),
    });
    setFormKey((k) => k + 1);
    setViewMode("form");
  };

  const handleNewEmpty = () => {
    setActiveCertId(null);
    setInitialData(null);
    setFormKey((k) => k + 1);
    setViewMode("form");
  };

  const handleOpenEditor = () => {
    setActiveCertId(null);
    setInitialData(null);
    setViewMode("form");
  };

  const handleSaveFromForm = (formData: Record<string, unknown>) => {
    const supplier = String(formData.vendorName || formData.supplier || "Draft");
    const poNum = String(formData.scOrderNo || formData.poNumber || "");
    const certNo = formData.certNo ? `IPA-${formData.certNo}` : `IPA-${String(savedCerts.length + 1).padStart(2, "0")}`;
    const amount = formData.contractValue ? `AED ${formData.contractValue}` : "AED —";

    if (activeCertId) {
      updateCert(activeCertId, {
        supplier,
        poNumber: poNum,
        certNumber: certNo,
        amount,
        status: "completed",
        formData,
      });
    } else {
      const newId = createClientId();
      setActiveCertId(newId);
      createCert({
        id: newId,
        supplier,
        poNumber: poNum,
        certNumber: certNo,
        amount,
        status: "completed",
        formData,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="size-6 text-amber-400" /> Payment Certificates
          </h1>
          <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">
            AI-powered payment certificate generation and management
          </p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PaymentCertForm
            key={formKey}
            initialData={initialData}
            onSave={handleSaveFromForm}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Certificate Quick-Gen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold text-base text-white">Certificate History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {savedCerts.length} certificates
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
                {savedCerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="size-10 text-[oklch(0.35_0.01_260)] mb-3" />
                    <p className="text-sm text-[oklch(0.55_0.01_260)]">No saved certificates yet.</p>
                    <p className="text-xs text-[oklch(0.4_0.01_260)] mt-1">Generate one above or open the certificate editor.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                    {savedCerts.map((cert, i) => (
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
                            {cert.status === "draft" && <Pencil className="size-4 text-blue-400 shrink-0" />}
                            <div>
                              <p className="text-xs text-white font-medium">{cert.supplier}</p>
                              <p className="text-[10px] text-[oklch(0.5_0.01_260)]">
                                {cert.poNumber} &middot; {cert.certNumber} &middot; {cert.amount}
                              </p>
                              <p className="text-[10px] text-[oklch(0.4_0.01_260)]">
                                {new Date(cert.updatedAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewCert(cert)}
                              className="h-7 text-[10px] gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
                            >
                              <Eye className="size-3" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => deleteCert(cert.id)}
                              className="h-7 text-[10px] gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                            <Badge
                              className={`text-[10px] shrink-0 ${
                                cert.status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : cert.status === "failed"
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : cert.status === "draft"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {cert.status === "generating" ? "Generating..." : cert.status}
                            </Badge>
                          </div>
                        </div>
                        {cert.aiResponse && (
                          <p className="text-[11px] text-[oklch(0.6_0.01_260)] leading-relaxed pl-6">
                            {cert.aiResponse}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
