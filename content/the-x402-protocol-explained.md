---
title: "The x402 Protocol Explained"
date: "2025-12-15"
price: "$0.02"
excerpt: "HTTP status 402 has been 'reserved for future use' since 1997. Nearly three decades later, the x402 protocol finally gives it a purpose: native payments on the web."
---

HTTP status 402 has been "reserved for future use" since 1997. Nearly three decades later, the x402 protocol finally gives it a purpose: native payments on the web.

## A Brief History of 402

When the HTTP/1.1 spec was written, the authors had the foresight to reserve status code 402 for payments. The idea was that one day, the web would need a standard way to say "this resource costs money."

That day took a while to arrive. For decades, 402 sat unused while the web developed ad-supported and subscription-based business models instead.

## How x402 Works

The x402 protocol defines a simple, standards-based flow for paying for HTTP resources using stablecoins.

### The Four Participants

1. **Client** — the application making the request (browser, CLI tool, AI agent)
2. **Gateway** — a reverse proxy (like Tollbooth) that handles payment logic
3. **Facilitator** — a service that verifies signatures and settles payments on-chain
4. **Upstream** — your actual API or content server, completely unaware of payments

### The Request Flow

**Step 1: Initial Request**

The client makes a normal HTTP request:

```
GET /articles/x402-explained HTTP/1.1
Host: blog.example.com
```

**Step 2: 402 Response**

The gateway intercepts the request, sees it matches a paid route, and returns:

```
HTTP/1.1 402 Payment Required
payment-required: eyJ4NDAyVmVyc2lvbiI6Mn0=
```

The `payment-required` header contains base64-encoded JSON with payment details: amount, recipient wallet, accepted networks, and timeout.

**Step 3: Client Signs Payment**

The client decodes the requirements and signs an EIP-3009 `transferWithAuthorization` message. This is an off-chain signature — no gas fees, no wallet popup, no on-chain transaction yet.

**Step 4: Request with Payment**

The client resends the original request with the signed payment attached:

```
GET /articles/x402-explained HTTP/1.1
Host: blog.example.com
payment-signature: eyJzaWduYXR1cmUiOiIweCJ9
```

**Step 5: Settlement**

The gateway forwards the signature to the facilitator, which:
- Verifies the EIP-712 typed-data signature
- Validates the amount matches the requirement
- Submits the USDC transfer on-chain
- Returns the transaction hash

**Step 6: Response**

The gateway proxies the upstream response back to the client with a receipt:

```
HTTP/1.1 200 OK
payment-response: eyJ0eEhhc2giOiIweCJ9
```

### Why EIP-3009?

The protocol uses EIP-3009 (`transferWithAuthorization`) because it enables gasless USDC transfers. The payer signs a message off-chain, and the facilitator submits the actual transaction, covering gas fees. This means:

- Clients don't need ETH for gas
- No wallet popups or confirmations
- Sub-second payment experience
- Works with any EVM-compatible wallet

## Discovery

The x402 protocol includes a discovery mechanism. Gateways expose a `GET /.well-known/x402` endpoint that returns metadata about all paid routes, including prices, accepted payment methods, and network information.

This lets clients programmatically discover what resources cost before making requests — particularly useful for AI agents and automated systems.

## Why This Matters

The x402 protocol makes payments a first-class citizen of HTTP. Just like `401 Unauthorized` standardized authentication, `402 Payment Required` standardizes payments. Any HTTP client that understands x402 can pay for any x402-enabled resource, regardless of the server implementation.

No accounts. No API keys. No subscriptions. Just pay and access.
