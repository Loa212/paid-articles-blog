# Paid Articles Blog

A simple blog where individual articles are paywalled via [x402](https://www.x402.org/) and [Tollbooth](https://docs.tollbooth.loa212.com). Free previews, paid full content. One article = one $0.01 USDC payment.

## How It Works

```
Client ──► Tollbooth (:3000) ──► Blog Server (:4000)
              │
              ├── GET /                        → free (article list)
              ├── GET /articles/:slug/preview   → free (first ~200 words)
              └── GET /articles/:slug           → $0.01 (full article)
```

Tollbooth sits in front of the blog server as a reverse proxy. Free routes pass through. Paid routes return `402 Payment Required` until the client provides a signed USDC payment.

## Stack

- **Bun** — runtime
- **Hono** — HTTP framework
- **Markdown** — article content (no database)
- **Tollbooth** — x402 payment gateway
- **Biome** — linting and formatting

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Start the blog server

```bash
bun dev
```

The blog server runs on `http://localhost:4000`.

### 3. Start Tollbooth

In a second terminal:

```bash
WALLET_ADDRESS=0xYourWalletAddress npx tollbooth
```

Tollbooth runs on `http://localhost:3000` and proxies to the blog server.

### 4. Try it out

```bash
# Free — list all articles
curl http://localhost:3000/

# Free — get an article preview
curl http://localhost:3000/articles/the-x402-protocol-explained/preview

# Paid — returns 402 Payment Required
curl -i http://localhost:3000/articles/the-x402-protocol-explained
```

To complete a paid request, use an x402-compatible client like [`x402-fetch`](https://www.npmjs.com/package/x402-fetch).

## Project Structure

```
├── src/
│   ├── index.ts            # Hono server
│   └── articles.ts         # Markdown loader
├── content/
│   ├── why-micropayments-will-save-journalism.md
│   ├── the-x402-protocol-explained.md
│   └── building-a-paid-api-in-five-minutes.md
├── tollbooth.config.yaml   # Tollbooth configuration
├── biome.json
├── package.json
└── tsconfig.json
```

## Adding Articles

Drop a markdown file in `content/` with frontmatter:

```markdown
---
title: "Your Article Title"
date: "2025-01-15"
excerpt: "A short description shown in the article list."
---

Your full article content here...
```

Restart the server and the article is available at `/articles/your-article-title`.

## API

| Endpoint | Price | Description |
|---|---|---|
| `GET /` | Free | List all articles with title, date, excerpt |
| `GET /articles/:slug/preview` | Free | First ~200 words + metadata |
| `GET /articles/:slug` | $0.01 | Full article content |

## Scripts

```bash
bun dev        # Start with watch mode
bun start      # Start without watch
bun run check  # Lint and format check
bun run format # Auto-fix lint and format
```
