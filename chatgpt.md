# Moon Banking MCP for ChatGPT

> Add the Moon Banking MCP server to ChatGPT via Custom Connectors or a Custom GPT.

ChatGPT is great at fluent answers and weaker on fresh, structured facts about specific institutions. Adding the Moon Banking MCP as a Custom Connector gives ChatGPT live, tool-grounded access to every bank, country, community-rated score across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, security & trust, lending, transparency, and more), vote, and user story Moon Banking tracks.

Use it for everything from *"which crypto-friendly banks operate in Argentina?"* to *"compare the top three US challenger banks on fees and digital experience"* to *"summarize what users are saying about Wells Fargo's customer service this year"* — and get citable, data-grounded answers instead of generic summaries.

ChatGPT supports MCP through two distinct surfaces, and the right choice depends on your plan.

## Recommended: hosted (OAuth) via Custom Connectors

ChatGPT Plus, Pro, Team, Enterprise, and Edu users can add the Moon Banking server as a **Custom Connector** (the same mechanism that powers the official Notion, Gmail, etc. connectors).

1. Open ChatGPT → **Settings → Connectors → Custom Connectors → Add custom connector**.
2. Enter:
   - **Name:** `Moon Banking`
   - **URL:** `https://mcp.moonbanking.com/mcp`
3. Save. ChatGPT will open a browser tab to authenticate with Moon Banking. Approve.
4. In any chat, click the **+** button and enable the Moon Banking connector.

> Custom Connectors require a paid plan with Connectors enabled for your region. Availability may vary; check [help.openai.com](https://help.openai.com) for current rollout status.

## Alternative: stdio bridge for Custom GPTs / older setups

If your plan doesn't expose Custom Connectors, you can wrap the hosted endpoint with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) for any tooling that accepts stdio MCP (eg. a self-hosted ChatGPT-compatible agent):

```json
{
  "mcpServers": {
    "moonbanking": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.moonbanking.com/mcp"]
    }
  }
}
```

You can also run the stdio-only API-key package directly:

```json
{
  "mcpServers": {
    "moonbanking-mcp": {
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

Start a new chat and prompt:

> Use the Moon Banking connector to find banks in Singapore with strong fees and pricing scores.

## Troubleshooting

- **Connector option is missing.** Custom Connectors are gated by plan and region. Try the `mcp-remote` stdio bridge instead.
- **OAuth returns to a 404.** Make sure your ChatGPT browser session is logged in and that pop-ups are allowed for chatgpt.com.


## Available tools

The Moon Banking MCP server exposes the following tools (identical across every client):

- `bank_getByHostname`
- `bank_get`
- `bank_getById`
- `bank_semanticSearch`
- `bankVote_get`
- `bankProduct_list`
- `bankProduct_listByBank`
- `bankProduct_create`
- `bankProduct_listForOwnedBank`
- `bankProduct_update`
- `bankProduct_delete`
- `bankProduct_setStatus`
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
