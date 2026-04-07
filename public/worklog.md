---
## Task ID: 1 - main-agent
### Work Task
Build comprehensive ARC Command Centre Dashboard - a full-featured Next.js 16 App Router single-page application for Al Ryum Contracting & General Transport LLC.

### Work Summary

#### Files Created (16 total):

**Layout & Styling:**
1. `/src/app/layout.tsx` — Root layout with "ARC Command Centre" title, dark theme, Geist fonts, Toaster
2. `/src/app/globals.css` — Custom dark theme (slate/zinc palette), amber/orange accents, custom scrollbar, animations
3. `/src/app/page.tsx` — Main shell with sidebar navigation, header breadcrumbs, client-side view switching

**Command Centre Components:**
4. `/src/components/command-centre/sidebar.tsx` — Dark sidebar with ARC logo, 6 nav items (Dashboard, Payment Certs, Supplier Comparison, Agent Monitor, Process Flows, Settings), collapsible on mobile/desktop
5. `/src/components/command-centre/dashboard-overview.tsx` — Stats cards (47 certs, 8 pending, 312 AI docs, 56 suppliers), recent activity feed, quick actions, AI agent status panel
6. `/src/components/command-centre/payment-cert-generator.tsx` — Main component adapted from user's uploaded code with 5 tabs:
   - Tab 1: Upload Documents (drag & drop, file list, supported doc types)
   - Tab 2: AI Extraction (calls /api/extract, live log, progress indicators)
   - Tab 3: Certificate Form (vendor type, vendor details, project info, payment schedule with all calculations, notes, summary)
   - Tab 4: Appendices (Appendix D measurement sheets, Appendix E payment tracking, add/remove rows)
   - Tab 5: Approve & Export (summary, 3 signatories with status toggle, download XLS, AI document check)
7. `/src/components/command-centre/supplier-comparison.tsx` — Upload area, mock comparison table, best value recommendation, export button
8. `/src/components/command-centre/agent-monitor.tsx` — 3 AI agents with status/stats, summary metrics, real-time activity log
9. `/src/components/command-centre/process-flow.tsx` — Visual flow diagrams for Payment Cert and Supplier Comparison processes
10. `/src/components/command-centre/settings.tsx` — Settings panel with 6 configuration cards

**API Routes:**
11. `/src/app/api/extract/route.ts` — POST endpoint using z-ai-web-dev-sdk for AI document extraction with construction-specific prompt
12. `/src/app/api/generate-xls/route.ts` — POST endpoint using exceljs to create 4-sheet XLS workbook (Certificate, Appendix D, Appendix E, Approvals)
13. `/src/app/api/check-documents/route.ts` — POST endpoint using z-ai-web-dev-sdk for document validation (TRN, license, completeness)

**Assets:**
14. `/public/arc-logo.png` — AI-generated company logo

#### Key Implementation Details:
- All calculations (gross total, net total, VAT, total payment due) match the original payment_cert_dashboard.tsx exactly
- AED formatting: `(parseFloat(v)||0).toLocaleString("en-AE",{minimumFractionDigits:2,maximumFractionDigits:2})`
- Dark theme using oklch color space with slate/zinc backgrounds and amber/orange accents
- z-ai-web-dev-sdk used ONLY in backend API routes (not on client)
- Responsive design with mobile sidebar overlay
- ESLint passes with no errors
- Dev server compiles and serves correctly
