"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useTheme, type ThemeDef } from "@/hooks/useTheme";

export default function ThemeSwitcher() {
  const { activeThemeDef, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="h-8 px-3 rounded-lg flex items-center gap-2 text-xs
          bg-white/[0.04] border border-white/[0.08]
          hover:bg-white/[0.07] transition-colors"
        style={{ color: "var(--arc-text-muted)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: activeThemeDef.accent }}
        />
        <span className="hidden sm:inline max-w-[90px] truncate">{activeThemeDef.name}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 z-[60] w-[248px] rounded-xl p-3 space-y-1"
            style={{
              background: "rgba(11,14,20,0.98)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            }}
          >
            <p className="text-[10px] tracking-widest uppercase px-1 mb-2"
               style={{ color: "rgba(255,255,255,0.25)" }}>
              SELECT THEME
            </p>

            {themes.map((theme: ThemeDef) => {
              const isActive = theme.id === activeThemeDef.id;
              return (
                <motion.button
                  key={theme.id}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-left transition-colors"
                  style={{
                    background: isActive ? `${theme.accent}18` : "transparent",
                    border: isActive ? `1px solid ${theme.accent}30` : "1px solid transparent",
                  }}
                >
                  {/* Mini preview */}
                  <div
                    className="w-10 h-7 rounded-md shrink-0 overflow-hidden relative border border-white/10"
                    style={{ background: theme.bgPage }}
                  >
                    {/* Sidebar strip */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[10px]"
                      style={{ background: theme.bgSidebar }}
                    />
                    {/* Accent bar */}
                    <div
                      className="absolute left-[10px] top-0 bottom-0 w-[2px]"
                      style={{ background: theme.accent }}
                    />
                    {/* Content bars */}
                    <div
                      className="absolute top-[6px] left-[15px] right-2 h-[3px] rounded-sm"
                      style={{ background: `${theme.accent}55` }}
                    />
                    <div
                      className="absolute top-[12px] left-[15px] right-4 h-[2px] rounded-sm"
                      style={{ background: `${theme.accent}30` }}
                    />
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#F1F5F9" }}>
                      {theme.name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(241,245,249,0.40)" }}>
                      {theme.subtitle}
                    </p>
                  </div>

                  {/* Dot + check */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: theme.accent }}
                    />
                    {isActive && <Check className="w-3 h-3" style={{ color: theme.accent }} />}
                  </div>
                </motion.button>
              );
            })}

            <div className="border-t border-white/[0.07] pt-2 mt-1">
              <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.20)" }}>
                Saved across sessions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
