# ARIA — AI Receptionist

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DigitalOcean Gradient](https://img.shields.io/badge/Powered%20by-DigitalOcean%20Gradient-0069ff)](https://www.digitalocean.com/products/gradient)

> Paste your website URL. ARIA learns your business in 60 seconds and handles every customer inquiry 24/7.

Built for the **DigitalOcean Gradient™ AI Hackathon 2026** — Best AI Agent Persona category.

## What It Does

ARIA is a self-configuring AI receptionist for small businesses. Enter your business name and website URL — ARIA crawls your site, builds a knowledge base, and deploys a fully-trained AI agent that can:

- Answer customer questions using your actual business content
- Capture leads (name, phone, email)
- Help customers book appointments
- Handle inquiries 24/7 without human intervention

## How It Works

1. **Onboarding** — Enter business name + website URL
2. **Knowledge Base** — DigitalOcean Gradient crawls your website and indexes it automatically
3. **Agent Creation** — ARIA agent is created with Claude via Gradient, trained on your KB
4. **Chat** — Customers chat with ARIA; she answers from your real business data

## Tech Stack

- **DigitalOcean Gradient** — Knowledge bases, agent creation, Claude inference
- **Next.js 14** — Frontend + API routes
- **DigitalOcean App Platform** — Deployment

## Setup

```bash
git clone https://github.com/850Media/aria-receptionist
cd aria-receptionist
npm install
cp .env.example .env.local
# Add your DO_API_TOKEN to .env.local
npm run dev
```

## Environment Variables

```
DO_API_TOKEN=your_digitalocean_api_token
DO_REGION=tor1
NEXT_PUBLIC_APP_URL=https://your-app.ondigitalocean.app
```

## Built By

[FieldMatrix.ai](https://fieldmatrix.ai) — AI tools for field service businesses.
