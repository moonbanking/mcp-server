# Moon Banking MCP for Grok

> Add the Moon Banking MCP server to Grok (xAI) as a custom connector.

Grok is built around live, current information — and the Moon Banking MCP fits that wheelhouse cleanly. Once added as a connector, Grok can query the Moon Banking dataset on demand — every bank, country, community-rated score across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, security & trust, lending, transparency, …), vote, and user story — and combine it with the real-time signal Grok already pulls from X and the open web.

Try *"which European banks rank highest on crypto friendliness right now, and what are people saying about them on X?"*, *"compare digital-experience scores across the top five US online banks"*, or *"what are users saying about Revolut's fees lately?"* — Grok will weave Moon Banking's structured data together with whatever it finds in the wild.

Grok supports remote MCP servers via **Connectors**, available in the xAI Console and inside grok.com for Grok 4 and newer.

## Recommended: hosted (OAuth)

1. Go to [grok.com](https://grok.com) (or the xAI Console) and open **Settings → Connectors**.
2. Choose **Add custom connector** (or **Add MCP server**, depending on your build).
3. Enter:
   - **Name:** `Moon Banking`
   - **URL:** `https://mcp.moonbanking.com/mcp`
4. Approve the OAuth prompt that opens in your browser.
5. In any chat, enable the Moon Banking connector from the input toolbar.

## Alternative: stdio bridge

For environments without a Connectors UI (eg. local Grok-compatible agents, self-hosted setups, or API-key-based access), use the stdio package or wrap the hosted URL with `mcp-remote`:

```json
{
  "mcpServers": {
    "moonbanking": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.moonbanking.com/mcp"]
    },
    "moonbanking-apikey": {
      "command": "npx",
      "args": ["-y", "@moonbanking/mcp-server"],
      "env": {
        "MOON_BANKING_API_KEY": "Bearer mb_sk_..."
      }
    }
  }
}
```

## Verify the connection

In Grok, prompt:

> Using the Moon Banking connector, list five banks in the US that rank highly on customer service.

## Troubleshooting

- **Connectors panel is missing.** Custom MCP connectors are a Grok 4 / SuperGrok feature. Older Grok versions don't support them.
- **OAuth fails silently.** Try the flow in a private/incognito window; some browser extensions interfere with OAuth callbacks.


## Available tools

The Moon Banking MCP server exposes the following tools (identical across every client):

- `bank_getByHostname`
- `bank_get`
- `bank_getById`
- `bank_semanticSearch`
- `bankVote_get`
- `country_get`
- `country_getByCountryCode`
- `story_get`
- `story_getById`
- `world_getOverview`
- `market_get`
- `market_getById`
- `stock_get`
- `stock_getById`
- `search_get`

Full descriptions live on the [main MCP page](./README.md).
