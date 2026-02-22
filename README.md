# Paid Articles Blog

A simple blog where individual articles are paywalled via [x402](https://www.x402.org/) and [Tollbooth](https://docs.tollbooth.loa212.com). Free previews, paid full content. Each author sets their own price per article.

## How It Works

```
Client ──► Tollbooth (:3000) ──► Blog Server (:4000)
              │
              ├── GET /                        → free (article list)
              ├── GET /articles/:slug/meta      → free (metadata + price)
              ├── GET /articles/:slug/preview   → free (first ~200 words)
              └── GET /articles/:slug           → paid (author-set price)
```

Tollbooth sits in front of the blog server as a reverse proxy. Free routes pass through. Paid routes return `402 Payment Required` until the client provides a signed USDC payment.

### Dynamic Pricing

Each article sets its own price in the frontmatter. Tollbooth resolves prices at request time by calling a [pricing function](./pricing/article-price.ts) that fetches the article's metadata from the blog backend:

```
1. Client requests  GET /articles/my-post
2. Tollbooth calls  pricing/article-price.ts
3. Pricing fn calls GET /articles/my-post/meta  → { price: "$0.05" }
4. Tollbooth returns 402 with the author's price
```

This uses Tollbooth's `price.fn` feature — instead of hardcoding a price in the config, you point to a function that returns the price dynamically.

**Simple alternative:** If all articles cost the same, replace the pricing function with a static price:

```yaml
# tollbooth.config.yaml
routes:
  "GET /articles/*":
    upstream: blog
    price: "$0.01"  # flat rate for all articles
```

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
WALLET_ADDRESS=0xYourWalletAddress npx tollbooth@0.4.3
```

Tollbooth runs on `http://localhost:3000` and proxies to the blog server.

### 4. Try it out

```bash
# Free — list all articles (includes prices)
curl http://localhost:3000/

# Free — get article metadata
curl http://localhost:3000/articles/the-x402-protocol-explained/meta

# Free — get an article preview
curl http://localhost:3000/articles/the-x402-protocol-explained/preview

# Paid — returns 402 with the author's price ($0.02)
curl -i http://localhost:3000/articles/the-x402-protocol-explained
```

To complete a paid request, use an x402-compatible client like [`x402-fetch`](https://www.npmjs.com/package/x402-fetch).

## Project Structure

```
├── src/
│   ├── index.ts            # Hono server
│   └── articles.ts         # Markdown loader
├── pricing/
│   └── article-price.ts    # Tollbooth pricing function
├── content/
│   ├── why-micropayments-will-save-journalism.md   ($0.01)
│   ├── the-x402-protocol-explained.md              ($0.02)
│   └── building-a-paid-api-in-five-minutes.md      ($0.05)
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
price: "$0.05"
excerpt: "A short description shown in the article list."
---

Your full article content here...
```

The `price` field is what readers pay to access the full article. Tollbooth reads it at request time via the pricing function. If omitted, defaults to `$0.01`.

Restart the server and the article is available at `/articles/your-article-title`.

## API

| Endpoint | Price | Description |
|---|---|---|
| `GET /` | Free | List all articles with title, date, price, excerpt |
| `GET /articles/:slug/meta` | Free | Article metadata including author-set price |
| `GET /articles/:slug/preview` | Free | First ~200 words + metadata |
| `GET /articles/:slug` | Author-set | Full article content |

## Scripts

```bash
bun dev        # Start with watch mode
bun start      # Start without watch
bun run check  # Lint and format check
bun run format # Auto-fix lint and format
```
