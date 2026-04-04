# ARC Command Centrer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Bun-1.3-FFFFFF?style=flat-square&logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/NVIDIA-NIM-76B900?style=flat-square&logo=nvidia" alt="NVIDIA NIM">
  <img src="https://img.shields.io/badge/License-GPL--3.0-orange?style=flat-square" alt="License">
</p>

## Overview

**ARC Command Centre** is a sophisticated operational dashboard designed for **Al Ryum Contracting & General Transport LLC** (Abu Dhabi, UAE). Built with cutting-edge technologies like Next.js, Bun, and NVIDIA NIM, it serves as a centralized hub for managing construction operations, AI-powered document processing, and intelligent agent monitoring.

The platform leverages advanced AI capabilities to streamline payment certificate generation, supplier quotation analysis, and document validation—critical workflows for construction contracting operations in the UAE region.

---

## Core Features

### 1. Dashboard Overview
- **KPI Cards**: Real-time metrics and performance indicators
- **Activity Feed**: Recent operations and system events
- **Quick Actions**: Rapid access to common tasks
- **AI Agent Status**: Live monitoring of AI service health

### 2. AI Payment Certificates
- **Multi-format Document Upload**: Support for PDF, Excel, DOCX, and images
- **OCR Processing**: NVIDIA Vision models for scanned document extraction
- **LLM-powered Data Extraction**: Intelligent parsing of certificate data
- **Multi-tab Editor**: Certificate, Internal Request, Appendices A-E, Approval, Documents
- **Excel Export**: Generate standardized payment certificates using templates

### 3. Supplier Comparison
- **AI Quotation Analysis**: Automated parsing of supplier quotes
- **Comparative Analysis**: Side-by-side supplier evaluation
- **Recommendations**: AI-driven supplier selection suggestions

### 4. Agent Monitor
- **Real-time Monitoring**: Track AI agent activities and performance
- **Interactive Testing**: Test AI capabilities directly from the dashboard
- **Activity Logs**: Comprehensive logging of all AI interactions

### 5. Process Flows
- **Workflow Visualization**: Visual diagrams for certificate generation
- **Document Validation**: Document processing and verification flows
- **VAT Compliance**: VAT calculation and compliance workflows

### 6. System Settings
- **NVIDIA API Configuration**: API key, base URL, and model selection
- **UI Preferences**: Theme and display settings
- **Application State**: Persistent configuration management

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16.1 | React framework with App Router |
| React 19 | UI library |
| Tailwind CSS 4 | Styling with OKLCH color space |
| shadcn/ui | Radix UI component library (50+ components) |
| Framer Motion | UI animations and transitions |
| Recharts | Data visualization |

### Backend & API
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Backend endpoints |
| Prisma | Database ORM (configured) |
| xlsx | Excel file generation |
| pdf-parse | PDF text extraction |

### AI & Intelligence
| Technology | Purpose |
|------------|---------|
| NVIDIA NIM API | LLM and Vision models |
| Llama 3.1/3.2 | Language model for data extraction |

### State & Forms
| Technology | Purpose |
|------------|---------|
| Zustand | State management with localStorage persistence |
| react-hook-form | Form handling |
| Zod | Schema validation |

### Development
| Technology | Purpose |
|------------|---------|
| Bun | JavaScript runtime and package manager |
| TypeScript | Type-safe development |
| ESLint | Code linting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Zustand   │  │ React Hook   │  │  TanStack       │   │
│  │   Store     │  │   Forms      │  │  Query          │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                │                   │             │
│  ┌──────┴────────────────┴───────────────────┴──────────┐ │
│  │              Components / Sections                     │ │
│  │  Dashboard | Payment Certs | Suppliers | Agent Monitor │ │
│  │  Process Flows | Settings                             │ │
│  └───────────────────────────┬────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  /api/nvidia    │  │ /api/extract-cert│                  │
│  │  (LLM Proxy)    │  │ (Document OCR)   │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                   │                            │
│  ┌────────┴────────┐  ┌───────┴────────┐                   │
│  │ /api/export-cert│  │  /api/         │                   │
│  │ (Excel Export)  │  │  (Static)      │                   │
│  └─────────────────┘  └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ NVIDIA NIM API  │  │  Local Files   │                  │
│  │ (LLM + Vision)  │  │ (PDF/Excel)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Interaction**: User interacts with UI components (Payment Certificate upload, settings update, etc.)
2. **State Management**: Zustand stores application state and persists settings to localStorage
3. **API Request**: Form data or files sent to Next.js API routes
4. **AI Processing**: API routes forward requests to NVIDIA NIM for LLM/Vision processing
5. **Response Processing**: AI response parsed and stored in state
6. **Export**: Certificate data exported to Excel template

---

## Prerequisites

- **Bun** 1.3+ (recommended) or Node.js 18+
- **NVIDIA NIM API Key** (required for AI features)
- **Database** (optional - Prisma schema available)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ARC_Command_Centre
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# NVIDIA NIM API Configuration
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Database (optional - currently using localStorage)
DATABASE_URL=postgresql://user:password@localhost:5432/arc_db
```

### 4. Initialize Database (Optional)

If using Prisma for persistence:
```bash
bun run db:generate
bun run db:push
```

### 5. Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### 6. Build for Production

```bash
bun run build
bun run start
```

---

## NVIDIA API Setup

The ARC Command Centre requires a valid NVIDIA NIM API key to enable AI features:

1. **Obtain API Key**: Sign up at [NVIDIA NGC](https://ngc.nvidia.com/) or [NVIDIA Build](https://build.nvidia.com/)
2. **Configure Key**: Enter the API key in the dashboard's **Settings** section
3. **Select Model**: Choose from available models (Llama 3.1, Llama 3.2, etc.)

> **Note**: AI features (OCR, data extraction, agent testing) will not function without a valid NVIDIA API key.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

---

## Project Structure

```
ARC_Command_Centre/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── nvidia/    # NVIDIA NIM proxy
│   │   │   ├── extract-cert/  # Document extraction
│   │   │   └── export-cert/   # Excel export
│   │   ├── page.tsx      # Main dashboard
│   │   └── layout.tsx     # Root layout
│   ├── components/
│   │   ├── sections/      # Feature modules
│   │   └── ui/            # shadcn/ui components
│   └── lib/
│       ├── store.ts       # Zustand store
│       └── db.ts          # Prisma client
├── upload/                # File uploads directory
├── public/                # Static assets
├── prisma/                # Database schema
└── package.json
```

---

## Business Context

Built specifically for **Al Ryum Contracting & General Transport LLC**, a leading construction company in Abu Dhabi, UAE. The dashboard addresses:

- **Payment Certificate Management**: Streamlined generation and approval of contractor payment certificates
- **Supplier Quotation Analysis**: AI-powered comparison and recommendation for material suppliers
- **Document Validation**: Automated OCR and extraction from scanned documents
- **VAT Compliance**: Integrated VAT calculations for UAE regulations

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the [LICENSE](LICENSE) file for full license details.

---

## Support

For issues or feature requests, please open a GitHub issue or contact the development team.

---

<p align="center">Built with Next.js, React, and NVIDIA NIM</p>
