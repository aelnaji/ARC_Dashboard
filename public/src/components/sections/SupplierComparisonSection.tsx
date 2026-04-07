"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChartColumn,
  TrendingUp,
  Send,
  Loader2,
  Plus,
  X,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/store";

interface Supplier {
  id: string;
  name: string;
  material: string;
  unitPrice: string;
  deliveryTime: string;
  rating: string;
  status: "active" | "pending";
}

export default function SupplierComparisonSection() {
  const { settings } = useAppStore();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [error, setError] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "s1", name: "Al Fardan Electromechanical", material: "HVAC Systems", unitPrice: "AED 185,000", deliveryTime: "3 weeks", rating: "4.8/5.0", status: "active" },
    { id: "s2", name: "Gulf Piling Contracting", material: "Steel Piles", unitPrice: "AED 420,000", deliveryTime: "5 weeks", rating: "4.5/5.0", status: "active" },
    { id: "s3", name: "Abu Dhabi Concreting Co.", material: "Ready-Mix Concrete", unitPrice: "AED 285/m³", deliveryTime: "1 week", rating: "4.9/5.0", status: "active" },
    { id: "s4", name: "National Crane Services", material: "Crane Rental", unitPrice: "AED 45,000/mo", deliveryTime: "2 weeks", rating: "4.2/5.0", status: "active" },
    { id: "s5", name: "Ready Mix Abu Dhabi", material: "Ready-Mix Concrete", unitPrice: "AED 295/m³", deliveryTime: "1 week", rating: "4.6/5.0", status: "active" },
    { id: "s6", name: "Emirates Electrical Engineering", material: "Cable & Wiring", unitPrice: "AED 92,000", deliveryTime: "4 weeks", rating: "4.7/5.0", status: "active" },
  ]);

  const handleAnalyze = async () => {
    if (!settings.nvidiaApiKey) {
      setError("NVIDIA API key is not configured. Please go to Settings to add your API key.");
      return;
    }
    if (!query.trim()) {
      setError("Please describe what you want to compare.");
      return;
    }

    setError("");
    setIsLoading(true);
    setAiAnalysis("");

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
              content: "You are an AI procurement analyst for Al Ryum Contracting & General Transport LLC in Abu Dhabi, UAE. You compare supplier quotations, analyze pricing, delivery timelines, quality ratings, and provide recommendations. Be concise and structured.",
            },
            {
              role: "user",
              content: `Analyze the following supplier comparison request:\n\n${query}\n\nCurrent suppliers on file:\n${suppliers.map((s) => `${s.name} - ${s.material}: ${s.unitPrice}, Delivery: ${s.deliveryTime}, Rating: ${s.rating}`).join("\n")}\n\nProvide a comparison analysis with recommendations.`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAiAnalysis(data.choices?.[0]?.message?.content || "Analysis complete.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ChartColumn className="size-6 text-sky-400" /> Supplier Comparison
        </h1>
        <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">AI-powered quotation analysis and supplier comparison</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analysis Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-2">
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                <BarChart3 className="size-4 text-sky-400" /> AI Quotation Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-[oklch(0.65_0.01_260)]">What do you want to compare?</Label>
                <Textarea
                  placeholder="e.g. Compare ready-mix concrete suppliers by price and delivery time..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="bg-sky-600 hover:bg-sky-500 text-white h-9 text-xs gap-2"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
                  {isLoading ? "Analyzing..." : "Run AI Analysis"}
                </Button>
                {aiAnalysis && (
                  <Button variant="outline" onClick={() => setAiAnalysis("")} className="h-9 text-xs border-[oklch(0.30_0.005_260)] text-[oklch(0.6_0.01_260)] hover:bg-[oklch(0.18_0.01_260)]">
                    Clear
                  </Button>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <X className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {aiAnalysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-[oklch(0.14_0.005_260)] border border-sky-500/20">
                  <p className="text-[10px] text-sky-400 font-medium mb-2">AI Analysis Result</p>
                  <div className="text-xs text-[oklch(0.75_0.005_260)] leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Supplier Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold text-base text-white">Suppliers</CardTitle>
                <Badge className="text-[10px] bg-sky-500/10 text-sky-400 border-sky-500/20">
                  {suppliers.length} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[oklch(0.25_0.005_260)] hover:bg-transparent">
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Supplier</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Price</TableHead>
                      <TableHead className="text-[10px] text-[oklch(0.55_0.01_260)]">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((s) => (
                      <TableRow key={s.id} className="border-[oklch(0.20_0.005_260)] hover:bg-[oklch(0.19_0.005_260)]">
                        <TableCell>
                          <div>
                            <p className="text-xs text-white font-medium">{s.name}</p>
                            <p className="text-[10px] text-[oklch(0.5_0.01_260)]">{s.material}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[oklch(0.7_0.01_260)]">{s.unitPrice}</TableCell>
                        <TableCell>
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s.rating}</Badge>
                        </TableCell>
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
