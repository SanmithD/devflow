# DevFlow — AI DevOps Agent System

> A multi-agent DevOps reasoning pipeline with tool orchestration, memory, and streaming response system.

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI-orange?style=flat)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Memory System](#memory-system)
- [Tools System](#tools-system)
- [Database Architecture](#database-architecture)
- [Tech Stack](#tech-stack)
- [Agent Runtime Flow](#agent-runtime-flow)
- [Authentication Flow](#authentication-flow)
- [Observability & Logging](#observability--logging)
- [Subscription System](#subscription-system)
- [Setup Guide](#setup-guide)
- [Design Principles](#design-principles)

---

## Overview

DevFlow is an AI-powered DevOps assistant that reasons, plans, uses tools, and generates streaming responses to solve infrastructure, deployment, and engineering problems interactively.

**Key capabilities:**

- **Tool-augmented reasoning** — Calls external APIs and internal tools as part of problem solving
- **Real-time streaming** — Token-by-token responses via WebSockets or SSE
- **Memory-aware conversations** — Short-term, long-term, and summarized memory
- **DevOps integrations** — GitHub, StackOverflow, search tools, and more
- **Persistent chat history** — With bookmarks, archives, and project scoping

---

## System Architecture

### High-Level Flow

```
User Input
   ↓
Context Builder (Memory + Chat History + DB Context)
   ↓
Planner Model (Decides steps & tools)
   ↓
Decision Layer (Tool vs Direct Answer)
   ↓
Tool Executor (if required)
   ↓
Reasoning Model (Deep analysis)
   ↓
Synthesizer Model (Final structured response)
   ↓
Streaming Engine (Token-by-token output)
   ↓
Client UI
```

### Key Components

| Component | Responsibility |
|---|---|
| **Context Builder** | Aggregates chat history, user memory, project context, and DB records |
| **Planner Model** | Breaks down queries, identifies required tools, creates execution steps |
| **Decision Layer (Router)** | Outputs `FINAL_ANSWER` or `TOOL_CALL` via structured JSON / function calling |
| **Tool Executor** | Executes external/internal tools (Search, GitHub, Weather, Calculator, etc.) |
| **Reasoning Model** | Performs deep technical reasoning and DevOps troubleshooting |
| **Synthesizer Model** | Combines tool results, reasoning output, and context into a final response |
| **Streaming Engine** | Streams tokens in real time via WebSockets or SSE |

---

## Memory System

DevFlow uses a three-tier memory model:

| Type | Description | Storage |
|---|---|---|
| **Short-Term** | Active chat context, last N messages | In-memory |
| **Long-Term** | User preferences, past issues, frequently used commands | PostgreSQL |
| **Chat Summarization** | Periodic summarization for token optimization | PostgreSQL |

---

## Tools System

### Tool Categories

**System Tools**
- Calculator
- Date & Time
- System Configuration
- User Details

**Search Tools**
- Exa Search
- Tavily Search
- Web Search

**Developer Tools**
- GitHub Search
- StackExchange API

**Utility Tools**
- Weather API

### Tool Interface

```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  execute(input: any): Promise<any>;
}
```

### Tool Execution Flow

```
Planner → Tool Selection → Execution → Response Injection → Synthesizer
```

---

## Database Architecture

### Core Entities

| Entity | Purpose |
|---|---|
| **User** | Authentication identity, subscription status |
| **Project** | User workspace container |
| **Account** | OAuth / login provider info |
| **AI Log** | Each LLM request/response cycle |
| **Archive** | Archived chats |
| **Bookmark** | Saved messages or chats |
| **User Audit** | User activity tracking |
| **Agent Audit** | Tool usage and agent decisions |
| **Mail Record** | OTP and email logs |

### Entity Relationships

```
User ──< Projects
User ──< AI Logs
User ──< Bookmarks
Project ──< Chats
Chat ──< Messages
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, TailwindCSS, React Hot Toast, Lucide React |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL (Neon DB), Redis Cloud |
| **AI / LLM** | Groq API (OpenAI-compatible), LangChain |
| **Auth & Email** | NextAuth, JWT, Resend |
| **Integrations** | Exa Search API, StackExchange API, Weather API, GitHub API |
| **Infrastructure** | Vercel, Docker, GitHub |

---

## Agent Runtime Flow

```
1. Authentication       User logs in via NextAuth + JWT
2. Request Received     Query sent to /api/agent
3. Context Building     Load chat history, memory, and project context
4. Planner Model        Break query into steps + identify tool requirements
5. Decision Layer       Route to direct answer OR tool execution
6. Tool Execution       Execute external APIs (if needed)
7. Reasoning Model      Perform deep DevOps analysis
8. Synthesizer Model    Combine reasoning output + tool results + context
9. Streaming Response   Stream final response to UI
10. Logging & Storage   Store AI logs, audits, and chat history updates
```

---

## Authentication Flow

```
User Signup
   ↓
OTP sent via Resend
   ↓
OTP Verification
   ↓
JWT Session Creation
   ↓
Protected API Access
```

---

## Observability & Logging

DevFlow provides full observability across its agent pipeline:

**Stored Events**
- AI request logs
- Tool execution logs
- User activity logs
- Agent decision logs
- Error logs

**Purpose**
- Debugging agent behavior
- Improving prompt design
- Tracking usage analytics

---

## Subscription System

| Tier | Description |
|---|---|
| **Free** | Limited requests / tokens |
| **Paid** | Token-based or request-based expanded limits |

Rate limiting is enforced via Redis. Usage is tracked per user through subscription status and token usage counters.

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/SanmithD/devflow.git
```

### 2. Navigate to the Project

```bash
cd devflow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
RESEND_API_KEY=
GROQ_API_KEY=
EXA_API_KEY=
WEATHER_API_KEY=
GITHUB_TOKEN=
REDIS_URL=
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

---

## Design Principles

- **Tool-first reasoning** — Tools are first-class citizens in the agent pipeline
- **Stateless LLM execution** — Each LLM call is self-contained with full context
- **Structured agent pipeline** — Clear separation of planning, reasoning, and synthesis
- **Memory-aware interactions** — Context is preserved and optimized across sessions
- **Fully observable system** — Every agent decision and tool call is logged
- **Streaming-first UX** — Responses are streamed token-by-token for low perceived latency

---

<div align="center">
  Built for DevOps engineers who demand more from their tooling.
</div>