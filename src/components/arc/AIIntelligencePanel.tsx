"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, Minus, X, SendHorizontal,
  ArrowRight, Download, Check
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  type?: "text" | "summary" | "table" | "actions";
  tableData?: { module: string; type: string; priority: string }[];
  deepLink?: string;
  downloadLabel?: string;
  showApprove?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1", role: "ai", type: "text",
    content: "Good evening, Abdullah. The platform currently has 14 pending actions across all modules. 2 modules require immediate attention.",
    deepLink: "View Action Queue",
  },
  {
    id: "2", role: "user", type: "text",
    content: "What needs my approval?",
  },
  {
    id: "3", role: "ai", type: "table",
    content: "You have 3 approvals pending across Finance and Procurement.",
    tableData: [
      { module: "Finance",     type: "Certificate", priority: "🔴 High" },
      { module: "Finance",     type: "Document",     priority: "🟡 Medium" },
      { module: "Procurement", type: "PO Sign-off",  priority: "🔴 High" },
    ],
    showApprove: true,
  },
];

const CANNED_RESPONSES: Record<string, Message> = {
  default: {
    id: "", role: "ai", type: "text",
    content: "I've received your request. This is a demo shell — connect your API to enable live responses.",
    deepLink: "Configure AI in Settings",
  },
  "system status": {
    id: "", role: "ai", type: "summary",
    content: "Platform Status: 6/8 modules operational. 14 actions pending. AI Hub has 1 failed job. Compliance score: 94%.",
    deepLink: "View Full Status",
  },
  "generate report": {
    id: "", role: "ai", type: "text",
    content: "Generating platform activity report for April 2026...",
    downloadLabel: "Platform Report — April 2026 — Download PDF",
  },
};

const QUICK_PROMPTS = [
  "What needs my approval?",
  "System status",
  "What failed in AI Hub?",
  "Generate report",
  "Take me to Finance",
];

const MODULE_COLORS: Record<string, string> = {
  Finance:     "rgba(59,130,246,0.15)",
  Procurement: "rgba(168,85,247,0.15)",
  "AI Hub":    "rgba(0,212,255,0.15)",
  Documents:   "rgba(99,102,241,0.15)",
};

export default function AIIntelligencePanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", type: "text", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const key = Object.keys(CANNED_RESPONSES).find((k) =>
        text.toLowerCase().includes(k)
      ) ?? "default";
      const response = { ...CANNED_RESPONSES[key], id: (Date.now() + 1).toString() };
      setMessages((prev) => [...prev, response]);
      setThinking(false);
    }, 1200);
  }

  return (
    <>
      {/* Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Ping ring */}
        <span
          className="arc-ping absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(0,212,255,0.20)" }}
        />
        <button
          onClick={() => setOpen(true)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
          style={{
            background: "rgba(0,212,255,0.12)",
            border: "2px solid rgba(0,212,255,0.35)",
          }}
          aria-label="Open ARC Intelligence"
        >
          <BrainCircuit className="w-6 h-6" style={{ color: "#00D4FF" }} />
          {/* Badge */}
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#EF4444" }}
          >
            3
          </span>
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width: 420,
              height: 600,
              background: "rgba(8,10,15,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "2px solid #00D4FF",
              borderRadius: 20,
              boxShadow: "0 0 50px rgba(0,212,255,0.07), 0 24px 60px rgba(0,0,0,0.60)",
            }}
          >
            {/* Header */}
            <div
              className="h-12 px-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" style={{ color: "#00D4FF", opacity: 0.9 }} />
                <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                  ARC Intelligence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] rounded-full px-2 py-0.5"
                  style={{
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.18)",
                    color: "rgba(0,212,255,0.65)",
                  }}
                >
                  NVIDIA Llama 3.1
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-white/[0.08]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-white/[0.08]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(0,212,255,0.12)",
                        border: "1px solid rgba(0,212,255,0.25)",
                      }}
                    >
                      <BrainCircuit className="w-3 h-3" style={{ color: "#00D4FF" }} />
                    </div>
                  )}
                  <div
                    className="max-w-[85%] rounded-2xl p-3 text-sm"
                    style={{
                      background: msg.role === "ai"
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(245,158,11,0.09)",
                      border: msg.role === "ai"
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "1px solid rgba(245,158,11,0.18)",
                      borderLeft: msg.role === "ai" ? "2px solid rgba(0,212,255,0.55)" : undefined,
                      borderRadius: msg.role === "ai" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                      color: "rgba(241,245,249,0.85)",
                    }}
                  >
                    <p>{msg.content}</p>

                    {/* Table */}
                    {msg.tableData && (
                      <div
                        className="mt-3 rounded-xl overflow-hidden"
                        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              {["Module", "Type", "Priority"].map((h) => (
                                <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.30)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.tableData.map((row, i) => (
                              <tr key={i} style={{ borderBottom: i < msg.tableData!.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                <td className="px-3 py-2">
                                  <span className="text-[10px] rounded-full px-2 py-0.5"
                                    style={{
                                      background: MODULE_COLORS[row.module] ?? "rgba(255,255,255,0.08)",
                                      color: "rgba(241,245,249,0.75)",
                                    }}>
                                    {row.module}
                                  </span>
                                </td>
                                <td className="px-3 py-2" style={{ color: "rgba(241,245,249,0.65)" }}>{row.type}</td>
                                <td className="px-3 py-2" style={{ color: "rgba(241,245,249,0.65)" }}>{row.priority}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Deep link */}
                    {msg.deepLink && (
                      <button
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] rounded-full px-3 py-1 transition-colors"
                        style={{
                          background: "var(--arc-accent-muted)",
                          border: "1px solid var(--arc-accent)",
                          color: "var(--arc-accent)",
                        }}
                      >
                        <ArrowRight className="w-3 h-3" />
                        {msg.deepLink}
                      </button>
                    )}

                    {/* Download */}
                    {msg.downloadLabel && (
                      <button
                        className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "rgba(241,245,249,0.75)",
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {msg.downloadLabel}
                      </button>
                    )}

                    {/* Approve/Reject */}
                    {msg.showApprove && (
                      <div className="flex gap-2 mt-3">
                        <button
                          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs transition-colors"
                          style={{
                            background: "rgba(16,185,129,0.10)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            color: "#10B981",
                          }}
                        >
                          <Check className="w-3 h-3" /> Approve All
                        </button>
                        <button
                          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs transition-colors"
                          style={{
                            background: "rgba(239,68,68,0.10)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#EF4444",
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Thinking */}
              {thinking && (
                <div className="flex items-end gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}
                  >
                    <BrainCircuit className="w-3 h-3" style={{ color: "#00D4FF" }} />
                  </div>
                  <div
                    className="rounded-2xl p-3 flex gap-1.5 items-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: "2px solid rgba(0,212,255,0.55)",
                    }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#00D4FF", animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div
              className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-[11px] rounded-full px-3 py-1 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(241,245,249,0.45)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div
              className="px-3 pb-3 pt-2 flex gap-2 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask ARC Intelligence..."
                className="flex-1 h-10 rounded-xl px-4 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F1F5F9",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(0,212,255,0.14)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  color: "#00D4FF",
                }}
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
