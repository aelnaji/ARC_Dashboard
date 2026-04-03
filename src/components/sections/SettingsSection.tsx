"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Key,
  Globe,
  Cpu,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ScanLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";

export default function SettingsSection() {
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    try {
      const res = await fetch("/api/nvidia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: localSettings.nvidiaApiKey,
          baseUrl: localSettings.nvidiaBaseUrl,
          model: localSettings.nvidiaModel,
          messages: [
            { role: "user", content: "Say 'Connection successful!' in one sentence." },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      return data.choices?.[0]?.message?.content || "Connection successful!";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      throw new Error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="size-6 text-amber-400" /> Settings
        </h1>
        <p className="text-sm text-[oklch(0.6_0.01_260)] mt-1">Configure AI model, API keys, and application settings</p>
      </div>

      {/* NVIDIA API Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="py-6 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-semibold text-base text-white flex items-center gap-2">
                  <Key className="size-4 text-amber-400" /> NVIDIA API Configuration
                </CardTitle>
                <p className="text-xs text-[oklch(0.5_0.01_260)] mt-1">
                  Configure your NVIDIA NIM API credentials for AI-powered features
                </p>
              </div>
              <Badge className={`${localSettings.nvidiaApiKey ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"} text-[10px]`}>
                {localSettings.nvidiaApiKey ? "Configured" : "Not Set"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* API Key */}
            <div className="space-y-2">
              <Label className="text-xs text-[oklch(0.65_0.01_260)] flex items-center gap-2">
                <Key className="size-3" /> API Key *
              </Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="nvapi-xxxxxxxxxxxxxxxxxxxx"
                  value={localSettings.nvidiaApiKey}
                  onChange={(e) => setLocalSettings((s) => ({ ...s, nvidiaApiKey: e.target.value }))}
                  className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.5_0.01_260)] hover:text-[oklch(0.7_0.01_260)] transition-colors"
                >
                  {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[oklch(0.45_0.01_260)]">
                Your NVIDIA NIM API key. Get one from{" "}
                <span className="text-amber-400">build.nvidia.com</span>
              </p>
            </div>

            <Separator className="bg-[oklch(0.25_0.005_260)]" />

            {/* Base URL */}
            <div className="space-y-2">
              <Label className="text-xs text-[oklch(0.65_0.01_260)] flex items-center gap-2">
                <Globe className="size-3" /> Base URL
              </Label>
              <Input
                type="text"
                placeholder="https://integrate.api.nvidia.com/v1"
                value={localSettings.nvidiaBaseUrl}
                onChange={(e) => setLocalSettings((s) => ({ ...s, nvidiaBaseUrl: e.target.value }))}
                className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-10"
              />
              <p className="text-[10px] text-[oklch(0.45_0.01_260)]">
                The base URL for the NVIDIA API endpoint. Default is the official NVIDIA NIM endpoint.
              </p>
            </div>

            <Separator className="bg-[oklch(0.25_0.005_260)]" />

            {/* Model */}
            <div className="space-y-2">
              <Label className="text-xs text-[oklch(0.65_0.01_260)] flex items-center gap-2">
                <Cpu className="size-3" /> Model
              </Label>
              <Input
                type="text"
                placeholder="meta/llama-3.1-405b-instruct"
                value={localSettings.nvidiaModel}
                onChange={(e) => setLocalSettings((s) => ({ ...s, nvidiaModel: e.target.value }))}
                className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-10"
              />
              <p className="text-[10px] text-[oklch(0.45_0.01_260)]">
                The model identifier to use. Popular options: meta/llama-3.1-405b-instruct, mistralai/mixtral-8x22b-instruct-v0.1, nvidia/nemotron-4-340b-instruct
              </p>
            </div>

            <Separator className="bg-[oklch(0.25_0.005_260)]" />

            {/* Vision Model (OCR) */}
            <div className="space-y-2">
              <Label className="text-xs text-[oklch(0.65_0.01_260)] flex items-center gap-2">
                <ScanLine className="size-3" /> Vision Model (OCR)
              </Label>
              <Input
                type="text"
                placeholder="meta/llama-3.2-11b-vision-instruct"
                value={localSettings.visionModel || ""}
                onChange={(e) => setLocalSettings((s) => ({ ...s, visionModel: e.target.value }))}
                className="bg-[oklch(0.14_0.005_260)] border-[oklch(0.30_0.005_260)] text-white placeholder:text-[oklch(0.45_0.01_260)] text-xs h-10"
              />
              <p className="text-[10px] text-[oklch(0.45_0.01_260)]">
                Vision model for OCR — reads images and scanned PDFs to extract text. Must support multimodal input. Recommended: meta/llama-3.2-11b-vision-instruct or meta/llama-3.2-90b-vision-instruct
              </p>
            </div>

            <Separator className="bg-[oklch(0.25_0.005_260)]" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                onClick={handleSave}
                className={`h-10 text-xs gap-2 ${saved ? "bg-emerald-600 hover:bg-emerald-500" : "bg-amber-600 hover:bg-amber-500"} text-white`}
              >
                {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                {saved ? "Saved!" : "Save Settings"}
              </Button>
              <TestConnectionButton
                apiKey={localSettings.nvidiaApiKey}
                onTest={handleTestConnection}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Payment Certificates",
            description: "Uses AI to generate and validate payment certificates with smart data extraction.",
            icon: "📄",
          },
          {
            title: "Supplier Comparison",
            description: "AI analyzes supplier quotations and provides comparison reports with recommendations.",
            icon: "📊",
          },
          {
            title: "Agent Monitor",
            description: "Test and monitor all AI agents in real-time with detailed performance metrics.",
            icon: "🤖",
          },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}>
            <Card className="py-5 shadow-sm bg-[oklch(0.17_0.005_260)] border-[oklch(0.25_0.005_260)]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{card.icon}</span>
                  <div>
                    <p className="text-xs text-white font-medium">{card.title}</p>
                    <p className="text-[10px] text-[oklch(0.5_0.01_260)] mt-1 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TestConnectionButton({ apiKey, onTest }: { apiKey: string; onTest: () => Promise<string> }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!apiKey) {
      setResult({ success: false, message: "API key is required to test connection." });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const msg = await onTest();
      setResult({ success: true, message: msg });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setResult({ success: false, message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1">
      <Button
        onClick={handleTest}
        disabled={testing}
        variant="outline"
        className="h-10 text-xs gap-2 border-[oklch(0.30_0.005_260)] text-[oklch(0.65_0.01_260)] hover:bg-[oklch(0.18_0.01_260)] hover:text-white"
      >
        <RefreshCw className={`size-4 ${testing ? "animate-spin" : ""}`} />
        {testing ? "Testing..." : "Test Connection"}
      </Button>
      {result && (
        <div className={`flex items-start gap-2 p-2 rounded-lg text-[10px] ${result.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          <Info className={`size-3 shrink-0 mt-0.5 ${result.success ? "text-emerald-400" : "text-red-400"}`} />
          <span className={result.success ? "text-emerald-300" : "text-red-300"}>{result.message}</span>
        </div>
      )}
    </div>
  );
}
