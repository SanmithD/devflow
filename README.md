````md
# DevFlow Agent

> AI-Powered DevOps Assistant with RAG, Document Parsing, Context-Aware Search, and Redis Caching.

## 🚀 Live Demo

https://devflowagent.netlify.app

---

# 📖 Overview

DevFlow Agent is an AI-powered DevOps assistant designed to help developers, DevOps engineers, and technical teams solve infrastructure and development challenges faster.

The platform combines:

- OpenAI LLMs
- Retrieval-Augmented Generation (RAG)
- Document Intelligence
- Vector Search
- Redis Caching
- Context-Aware Conversations

to deliver accurate, relevant, and production-ready responses.

The system can parse documents, retrieve relevant information from knowledge bases, and generate intelligent answers based on both uploaded documents and AI reasoning.

---

# ✨ Features

## 🤖 AI DevOps Assistant

Get expert assistance for:

- Kubernetes
- Docker
- Terraform
- AWS
- Azure
- Google Cloud Platform (GCP)
- CI/CD Pipelines
- GitHub Actions
- Jenkins
- Linux Administration
- Monitoring & Observability
- Infrastructure Automation

---

## 📚 Retrieval-Augmented Generation (RAG)

DevFlow Agent uses a RAG pipeline to provide context-aware answers.

### Workflow

1. Upload documents
2. Extract text
3. Chunk content
4. Generate embeddings
5. Store vectors
6. Retrieve relevant context
7. Generate accurate AI responses

### Benefits

- Reduced hallucinations
- Higher answer accuracy
- Domain-specific knowledge
- Context-aware responses
- Private knowledge retrieval

---

## 📄 Document Parsing

Supported formats:

| Format | Supported |
|----------|------------|
| PDF | ✅ |
| DOCX | ✅ |
| PPT/PPTX | ✅ |
| CSV | ✅ |
| TXT | ✅ |
| Markdown | ✅ |

### Capabilities

- Text extraction
- Document chunking
- Metadata processing
- Embedding generation
- Knowledge indexing

---

## 🔍 Semantic Search

Search uploaded knowledge bases using vector similarity search.

Features:

- Semantic matching
- Context retrieval
- Relevant chunk ranking
- Knowledge discovery

Powered by:

- Pinecone Vector Database
- OpenAI Embeddings

---

## 💬 Context-Aware Conversations

The AI maintains conversational context by using:

- Previous messages
- Session history
- Retrieved documents
- User interactions

This enables:

- Follow-up questions
- Multi-step problem solving
- Better contextual understanding

---

## ⚡ Redis Caching

Integrated Redis caching improves performance by storing:

- AI responses
- Frequently requested data
- Session-related information

Benefits:

- Reduced latency
- Faster responses
- Lower OpenAI costs
- Improved scalability

Powered by:

- Upstash Redis
- ioredis

---

## 🔐 Authentication

Authentication is implemented using NextAuth.

Supported providers:

- Google OAuth
- GitHub OAuth
- JWT Authentication

Features:

- User registration
- Secure login
- Session management
- Protected routes

---

## 📧 Email Integration

Email services are used for:

- Account verification
- Notifications
- Password recovery
- User communication

Powered by:

- Nodemailer
- SMTP
- Resend

---

## ☁️ Cloud Storage

Cloudinary integration provides:

- Media storage
- Asset management
- File uploads
- Optimized delivery

---

## 💳 Subscription & Payments

Integrated with Razorpay.

Supports:

- Monthly subscriptions
- Pro plans
- Enterprise plans
- Webhook verification

---

# 🏗️ System Architecture

```text
┌──────────────────────┐
│      Frontend        │
│   Next.js + React    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      API Layer       │
│    Next.js Server    │
└──────────┬───────────┘
           │
 ┌─────────┼──────────┐
 ▼         ▼          ▼

PostgreSQL  Redis    OpenAI
 Prisma    Cache      LLM

    ▼
Pinecone Vector DB

    ▼
RAG Retrieval Layer

    ▼
Context-Aware Response
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Query
- Recharts

## Backend

- Next.js API Routes
- Node.js
- Prisma ORM
- PostgreSQL

## AI & LLM

- OpenAI
- LangChain
- LangGraph
- LlamaIndex
- Transformers.js

## Vector Database

- Pinecone

## Cache

- Upstash Redis
- ioredis

## Authentication

- NextAuth
- JWT
- OAuth

## Storage

- Cloudinary

## Payments

- Razorpay

---

# 📁 Project Structure

```bash
devflow/
│
├── app/
│   ├── api/
│   │   ├── ai/                 # AI agent APIs and LLM interactions
│   │   ├── auth/               # Authentication APIs
│   │   ├── billing/            # Razorpay billing and subscriptions
│   │   ├── contact/            # Contact form APIs
│   │   ├── projects/           # Project management APIs
│   │   ├── protected/          # Protected/private endpoints
│   │   ├── system/             # System information and monitoring APIs
│   │   ├── test-redis/         # Redis connectivity testing
│   │   ├── upload/             # File upload APIs
│   │   └── webhooks/           # Razorpay and external webhooks
│   │
│   ├── auth/                   # Authentication pages
│   ├── controllers/            # Request controllers
│   ├── dashboard/              # Main dashboard pages
│   ├── generated/              # Auto-generated files
│   ├── repository/             # Database repository layer
│   ├── services/               # Business logic and services
│   ├── src/                    # Shared application source code
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
├── prisma/                     # Prisma schema and migrations
├── public/                     # Static assets
├── components/                 # Shared React components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
├── types/                      # TypeScript types
├── middleware.ts               # Route protection and middleware
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# 🏛 Architecture Overview

```text
Frontend (Next.js App Router)
            │
            ▼
      API Routes
            │
    ┌───────┼────────┐
    ▼       ▼        ▼

 OpenAI   Redis   PostgreSQL
   LLM   Cache      Prisma

    ▼
 Pinecone Vector DB

    ▼
   RAG Engine

    ▼
 Context-Aware AI Responses
```

---

# 📂 Core Directories

| Directory | Purpose |
|------------|----------|
| `app/api/ai` | AI Agent and OpenAI integrations |
| `app/api/auth` | Authentication APIs |
| `app/api/billing` | Razorpay subscriptions and payments |
| `app/api/upload` | File upload and processing |
| `app/api/webhooks` | External service webhooks |
| `app/repository` | Database access layer |
| `app/services` | Business logic implementation |
| `app/controllers` | Request handling layer |
| `app/dashboard` | Dashboard UI |
| `prisma` | Database schema and migrations |
| `components` | Shared UI components |
| `hooks` | Reusable React hooks |
| `lib` | Utilities and helper functions |
| `public` | Static assets |

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

EMAIL_USER=
EMAIL_PASS=

JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_TOKEN=

NEXTAUTH_URL=
NEXTAUTH_SECRET=

RESEND_API_KEY=

OPENAI_API_KEY=
OPENAI_BASE_URL=

RAPID_API_KEY=
RAPID_BASE_URL=

TAVILY_SEARCH_API_KEY=
EXA_SEARCH_API_KEY=

NEXT_PUBLIC_CLOUDINARY_URL=
NEXT_PUBLIC_CLOUDINARY_PRESET_NAME=
NEXT_PUBLIC_CLOUDINARY_NAME=

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PINECONE_API_KEY=
PINECONE_INDEX_NAME=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

NEXT_PUBLIC_APP_URL=

RAZORPAY_PRO_PLAN_ID=
RAZORPAY_ENTERPRISE_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/SanmithD/devflow.git

cd devflow
```

## Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

---

# 🗄️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 💻 Running Locally

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📦 Production Build

Build application:

```bash
npm run build
```

Start production server:

```bash
npm run dev
```

---

# 🌐 Deployment

## Netlify

This project is optimized for Netlify deployment.

Build command:

```bash
npm run build
```

Plugin:

```json
"@netlify/plugin-nextjs"
```

---

# 🔒 Security Features

- JWT Authentication
- OAuth Authentication
- Protected APIs
- Rate Limiting
- Secure Sessions
- Environment Variable Protection
- Razorpay Webhook Validation

---

# ⚡ Performance Optimizations

- Redis Response Caching
- Vector Search Retrieval
- React Query Caching
- Optimized API Calls
- Efficient Context Retrieval
- Reduced OpenAI Requests

---

# 🎯 Use Cases

- DevOps Troubleshooting
- Infrastructure Support
- Internal Knowledge Base Search
- Documentation Chatbot
- Engineering Assistant
- Team Knowledge Management
- AI-Powered Technical Support

---

# 🛣️ Future Roadmap

- Multi-Agent Architecture
- GitHub Repository Analysis
- Kubernetes Cluster Monitoring
- Terraform Automation
- Slack Integration
- Microsoft Teams Integration
- Advanced Analytics Dashboard
- Self-Healing Infrastructure Suggestions

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push changes

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📜 License

MIT License

---

# 👨‍💻 Author

### DevFlow Agent

AI-Powered DevOps Assistant built with:

- Next.js
- OpenAI
- LangChain
- LangGraph
- Pinecone
- Prisma
- Redis
- PostgreSQL

Built for developers who want intelligent DevOps assistance powered by modern AI technologies.

Built By Sanmith Devadiga
````
