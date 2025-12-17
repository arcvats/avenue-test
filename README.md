# Avebu - START Validation Module

A production-ready SaaS platform for validating startup ideas using a deterministic, data-driven framework.

## Overview

The START module is a comprehensive validation layer that guides founders through a gated sequential workflow:

1. **Idea Intake** - Problem statement, target customer, and founder-market fit
2. **Market Check** - Competitive analysis and market sizing
3. **ICP Builder** - Ideal Customer Profile definition
4. **Validation Tests** - Evidence collection and demand signals
5. **Positioning** - Value proposition and messaging
6. **Final Summary** - Deterministic score, recommendation, and validation memo

## Key Features

### Deterministic Scoring
- **Formula-based scoring** with full transparency
- Six weighted dimensions:
  - Problem Clarity (20%)
  - ICP Clarity (20%)
  - Market Saturation (15%)
  - Demand Signals (25%)
  - Founder-Market Fit (10%)
  - Evidence Completeness (10%)
- Confidence levels (Low/Medium/High) based on evidence volume and diversity
- Clear recommendations: Go, Conditional Go, or No-Go

### AI Coach (Not AI Scorer)
- Uses Claude 3.5 Sonnet for guidance and critique
- **Never fabricates** evidence, market data, or metrics
- Grounded in user input only
- Helps founders think critically, doesn't make decisions

### Multi-Tenancy & Collaboration
- Workspace-based multi-tenancy
- RBAC: Owner, Collaborator, Viewer roles
- Version control with pivot support
- Override logging for transparency

### Professional Artifacts
- Problem & Assumptions Brief
- Market & Competition Snapshot
- ICP & Buying Map
- Validation Log
- Positioning Page
- Final Validation Memo (with score + recommendation)
- PDF export (paid tier)
- Password-protected sharing

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5
- **Styling**: TailwindCSS + shadcn/ui
- **AI**: Anthropic Claude API
- **PDF**: Puppeteer

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key (optional, for AI coach)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string (currently: postgresql://postgres:postgres@localhost:5432/avebu)
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (optional)

3. Run database migrations:
```bash
npm run db:migrate
```

4. Seed the database with demo data:
```bash
npm run db:seed
```

This creates a demo account:
- Email: `demo@avebu.com`
- Password: `password123`

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
avebu/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── app/                  # Authenticated app pages
│   ├── auth/                 # Authentication pages
│   ├── share/                # Public share pages
│   └── page.tsx              # Landing page
├── components/               # React components
│   └── ui/                   # shadcn/ui components
├── lib/                      # Core libraries
│   ├── services/             # Business logic services
│   │   ├── ai-coach.ts       # AI coaching service
│   │   ├── analytics.ts      # Analytics tracking
│   │   ├── gating.ts         # Gate enforcement logic
│   │   ├── pdf.ts            # PDF generation
│   │   ├── scoring.ts        # Deterministic scoring engine
│   │   └── sharing.ts        # Share link management
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client singleton
│   ├── rbac.ts               # Role-based access control
│   └── validations.ts        # Zod schemas
├── prisma/
│   ├── migrations/           # Database migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── README.md                 # This file
```

## Scoring System

### How Scoring Works

The scoring engine is **100% deterministic** and formula-based. Same inputs always produce the same score.

### Recommendations

- **Go**: Score ≥ 75 AND confidence not Low
- **Conditional Go**: Score 55-74 OR (Score ≥ 75 AND confidence Low)
- **No-Go**: Score < 55

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run test         # Run tests
```

### Testing

Run unit tests:
```bash
npm test
```

Tests cover:
- Scoring engine determinism
- Gate enforcement logic
- RBAC permissions

## Demo Credentials

After seeding the database:
- Email: demo@avebu.com
- Password: password123

## Architecture Highlights

- **Deterministic scoring**: No AI-generated scores, only formula-based calculations
- **AI as coach**: Claude helps users think, never fabricates data
- **Gated workflow**: Sequential steps with clear requirements
- **RBAC enforcement**: Server-side permission checks
- **Multi-tenancy**: Workspace-scoped data isolation
- **Version control**: Track pivots and iterations
- **Share links**: Password-protected artifact sharing

---

Built with Next.js, Prisma, and Claude
