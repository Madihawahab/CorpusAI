# CorpusAI — Premium Multi-Agent OS Command Center & Governance Lab

[![Built with enter.pro](https://img.shields.io/badge/Build%20with-Enter.pro-FC5776?style=for-the-badge&labelColor=1F1F1F)](https://enter.pro)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square)](https://supabase.com/)

CorpusAI is a premium, multi-agent enterprise operating system and command-center dashboard. It provides a visual interface to monitor, audit, and interact with autonomous AI agents (Marketing, Finance, Engineering, and Orchestrator) executing corporate initiatives. 

The project consists of two core components:
1. **Core Command-Center Dashboard**: Links to a live, external Multi-Agent backend via WebSockets/REST APIs to track live initiatives, state transitions, agent negotiations, and resource lineages.
2. **Governance & Security Lab Subsystem**: A premium sandbox simulation environment backed by Supabase (Postgres, Edge Functions, and LLM orchestration) built to model policy verification, self-amending constitutions, Nash bargaining, adversarial red-teaming, boardroom escalation, and time-travel debugging.

---

## 🚀 Key Features

### 1. Core Command-Center
- **Command Deck**: Kickoff new campaigns and track active initiatives through an animated Orchestrator FSM timeline (Marketing $\rightarrow$ Finance $\rightarrow$ Sign-off $\rightarrow$ Ratified).
- **Interactive Lineage Graph**: A force-directed D3 network graph mapping communications, data flow, and lineage relationships between sub-agents.
- **Negotiation Hub**: Observe real-time agent-to-agent negotiations with collapsible "Agent Thoughts" cards highlighting underlying reasoning.
- **Activity Terminal**: Monospace activity feed tracking system execution logs.
- **Autonomy Gauge & Analytics**: Telemetry cards and Recharts analytics displaying resource spending, token usage, and system autonomy percentages.

### 2. Governance & Security Lab (`/lab`)
- **Policy Sandbox**: Adjust constitutional bounds (spending caps, strict mode, variance tolerance) in real-time.
- **Nash Bargaining Kernel**: Runs mathematical budget resolution between Marketing and Finance, plotting converging offers and tracking bargaining efficiency.
- **Adversarial Immune System**: Launches red-team attacks using term-frequency (TF) cosine similarity vectors to filter and block injections, dynamically learning from breaches to shrink the future attack surface.
- **Boardroom Debate Escalation**: Triggers three-persona boardroom discussions (Optimist, Auditor, Safety Advocate) when expenditures exceed safety limits.
- **Time-Travel Debugger**: A history scrubber allowing operators to rollback the entire dashboard state to inspect rules, blocklist versions, and decisions at any historical timestamp.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, D3.js, framer-motion.
- **Backend & Database**: Supabase PostgreSQL, Deno-based Edge Functions, and Gemini / OpenAI-compatible Chat Completions API.
- **Localization**: Built-in browser-side i18n support utilizing `i18next` and `react-i18next`.

---

## ⚙️ Local Development Setup

To clone, set up, and run the project locally, follow these steps:

### 1. Install Dependencies
Make sure you have Node.js and `pnpm` installed.
```bash
# Clone the repository
git clone https://github.com/Madihawahab/CorpusAI.git
cd CorpusAI

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase variables for the Governance Lab:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Deploy Database Migrations & Edge Functions
If you are modifying the Governance Lab database tables or Deno Edge Functions, configure them using the Supabase CLI:
```bash
# Link to your Supabase project
supabase link --project-ref your-project-id

# Push migrations to Postgres
supabase db push

# Set LLM API Key on Supabase Edge Function Secrets
supabase secrets set LLM_API_KEY=sk-proj-...
# Optional: Set custom model / API endpoint base
supabase secrets set LLM_MODEL=gpt-4o-mini
supabase secrets set LLM_API_BASE=https://api.openai.com/v1

# Deploy Edge Functions
supabase functions deploy
```

### 4. Run Locally
Start the local Vite development server:
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Codebase Folder Structure

```
enter_CorpusAI/
├── .enter/                  # Enter project configurations and auto-plans
├── public/                  # Static assets and i18n locale files
├── src/                     # Core React codebase
│   ├── components/          # Reusable UI widgets
│   │   ├── corpus/          # Core operational dashboard widgets
│   │   ├── lab/             # Governance Lab widgets
│   │   └── ui/              # Restyled shadcn/ui primitives
│   ├── context/             # Global state contexts (Corpus, Lab)
│   ├── lib/                 # Core API connectors and algorithms
│   │   ├── corpus/          # Core dashboard typings and fetch clients
│   │   └── lab/             # Supabase client wrapper and API methods
│   ├── pages/               # Page entry points (CommandDeck, GovernanceLab, etc.)
│   ├── App.tsx              # Root component wrapping routing and clients
│   └── index.css            # Custom CSS styling tokens and glassmorphism styling
├── supabase/                # Local Supabase project files
│   ├── functions/           # Deno Edge Functions
│   │   ├── _shared/         # Math, LLM, CORS, and Database clients
│   │   ├── lab-bargain/     # Nash bargaining orchestrator
│   │   ├── lab-verify/      # Policy compliance verifier
│   │   ├── lab-redteam/     # Red-team vector similarity checks
│   │   └── ... (others)     # Boardroom, Watch, History, and Demo functions
│   └── migrations/          # SQL database migrations
└── package.json             # Build script configurations and dependencies
```

---

## 📡 Live APIs

- **Live Command-Center API**: `https://corpusai-2ftb.onrender.com`
- **Live Command-Center WebSockets**: `wss://corpusai-2ftb.onrender.com`
- **Governance Lab Subsystem**: Serverless endpoints hosted on your configured Supabase project.

---

## 📖 Complete Documentation
For an E2E architect-level breakdown of the database schemas, mathematical equations, security classification, user flows, and state management, please refer to the **[Technical System Architecture & Documentation Guide](C:/Users/madih/.gemini/antigravity-ide/brain/7029651f-1565-48bd-9f9d-dd49cb8cb333/technical_system_architecture_doc.md)**.
