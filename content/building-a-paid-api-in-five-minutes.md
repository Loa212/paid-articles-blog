---
title: "Building a Paid API in Five Minutes"
date: "2026-01-05"
price: "$0.05"
excerpt: "You built an API. People want to use it. You want to get paid. Here's how to go from free API to paid API in under five minutes using Tollbooth."
---

You built an API. People want to use it. You want to get paid. Here's how to go from free API to paid API in under five minutes using Tollbooth.

## Prerequisites

You need three things:

1. A running API (any language, any framework)
2. A USDC wallet address on Base (or Base Sepolia for testing)
3. Tollbooth installed (`npx tollbooth` or the Docker image)

## Step 1: Write Your Config (1 minute)

Create `tollbooth.config.yaml`:

```yaml
gateway:
  port: 3000

wallets:
  base-sepolia: "0xYourWalletAddress"

accepts:
  - network: base-sepolia
    asset: USDC

upstreams:
  api:
    url: "http://localhost:8080"

routes:
  "GET /health":
    upstream: api
    free: true
  "POST /generate":
    upstream: api
    price: "$0.05"
```

That's it. Free health check, $0.05 per generation.

## Step 2: Start Tollbooth (30 seconds)

```bash
npx tollbooth
```

Tollbooth reads your config file, starts a reverse proxy on port 3000, and begins intercepting requests. Your upstream API continues running as-is on port 8080.

## Step 3: Test It (30 seconds)

Try hitting the paid endpoint without payment:

```bash
curl -i http://localhost:3000/generate -X POST
```

You'll get back:

```
HTTP/1.1 402 Payment Required
payment-required: eyJ4NDAy...
```

The `payment-required` header contains everything a client needs to make a payment: the price, your wallet address, the accepted network, and the timeout.

## Step 4: Accept a Real Payment (1 minute)

To test the full payment flow, you need an x402-compatible client. The simplest option is the `x402-fetch` library:

```typescript
import { wrapFetch } from "x402-fetch";

const paidFetch = wrapFetch(fetch, wallet);
const response = await paidFetch("http://localhost:3000/generate", {
  method: "POST",
  body: JSON.stringify({ prompt: "Hello, world!" }),
});
```

The wrapped fetch automatically handles the 402 → sign → retry flow. Your client code looks almost identical to a normal fetch call.

## What Just Happened?

In five minutes, you:

1. Created a config file mapping routes to prices
2. Started a reverse proxy
3. Received a real USDC payment for an API call

Your upstream API didn't change at all. It doesn't know about payments, wallets, or x402. Tollbooth handles everything.

## Going Further

### Dynamic Pricing

Instead of fixed prices, you can price based on request content:

```yaml
routes:
  "POST /generate":
    upstream: api
    match:
      - where:
          body.model: "gpt-4o"
        price: "$0.10"
      - where:
          body.model: "gpt-4o-mini"
        price: "$0.01"
    fallback: "$0.05"
```

### Multiple Upstreams

Route different paths to different services:

```yaml
upstreams:
  openai:
    url: "https://api.openai.com"
    headers:
      Authorization: "Bearer ${OPENAI_API_KEY}"
  anthropic:
    url: "https://api.anthropic.com"
    headers:
      x-api-key: "${ANTHROPIC_API_KEY}"

routes:
  "POST /openai/*":
    upstream: openai
    price: "$0.05"
  "POST /anthropic/*":
    upstream: anthropic
    price: "$0.05"
```

### Production Deployment

For production, switch from `base-sepolia` to `base` and deploy Tollbooth alongside your API. The docs cover deployment guides for Fly.io, Railway, and VPS setups.

## The Point

Monetizing an API used to mean integrating Stripe, building a billing system, managing API keys, and handling subscription tiers. Now it means writing a YAML file. The complexity didn't disappear — it moved into the protocol layer where it belongs.
