"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.005_260)] flex items-center justify-center p-4">
      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.8_0.01_260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8_0.01_260) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="relative w-20 h-20">
            <Image
              src="/arc-logo.png"
              alt="ARC Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-xl tracking-tight">
              Al Ryum Command Centre
            </h1>
            <p className="text-[oklch(0.5_0.01_260)] text-xs mt-1">
              Sign in to access the dashboard
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.25_0.005_260)] rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium text-[oklch(0.65_0.01_260)] block"
              >
                Username
              </label>
              <input
                id="username"
                ref={usernameRef}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full h-10 px-3 rounded-lg bg-[oklch(0.14_0.005_260)] border border-[oklch(0.30_0.005_260)] text-white text-sm placeholder:text-[oklch(0.4_0.01_260)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-[oklch(0.65_0.01_260)] block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 pr-10 rounded-lg bg-[oklch(0.14_0.005_260)] border border-[oklch(0.30_0.005_260)] text-white text-sm placeholder:text-[oklch(0.4_0.01_260)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.5_0.01_260)] hover:text-[oklch(0.7_0.01_260)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[oklch(0.4_0.01_260)] text-[10px] mt-6">
          Al Ryum Contracting & General Transport LLC · Abu Dhabi, UAE
        </p>
      </motion.div>
    </div>
  );
}
