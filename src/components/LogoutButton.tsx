"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Sign out"
      aria-label="Sign out"
      className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.01_260)] hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" />
      )}
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
