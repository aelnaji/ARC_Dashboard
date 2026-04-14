"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type Section } from "@/lib/store";
import ShellLayout from "@/components/arc/ShellLayout";

// ── Existing Section Components (untouched) ──────────────────────────────────
import DashboardSection from "@/components/sections/DashboardSection";
import PaymentCertsSection from "@/components/sections/PaymentCertsSection";
import SupplierComparisonSection from "@/components/sections/SupplierComparisonSection";
import AgentMonitorSection from "@/components/sections/AgentMonitorSection";
import ProcessFlowsSection from "@/components/sections/ProcessFlowsSection";
import SettingsSection from "@/components/sections/SettingsSection";

const SECTION_COMPONENTS: Record<Section, React.FC> = {
  dashboard:             DashboardSection,
  "payment-certs":       PaymentCertsSection,
  "supplier-comparison": SupplierComparisonSection,
  "agent-monitor":       AgentMonitorSection,
  "process-flows":       ProcessFlowsSection,
  settings:              SettingsSection,
};

export default function CommandCentre() {
  const { activeSection } = useAppStore();

  // Prevent hydration mismatch — render section only on client
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const SectionComponent = SECTION_COMPONENTS[activeSection];

  return (
    <ShellLayout>
      {mounted && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <SectionComponent />
          </motion.div>
        </AnimatePresence>
      )}
    </ShellLayout>
  );
}
