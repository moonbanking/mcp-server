# Moon Banking MCP for Claude

> Add the Moon Banking MCP server to Claude Desktop and claude.ai as a custom connector.

Claude is one of the strongest models for nuanced research and writing, and one of its biggest weak points is fresh, structured data about specific institutions. The Moon Banking MCP gives Claude live access to every bank, country, community-rated score across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, security & trust, lending, transparency, and more), vote, and user story in the Moon Banking database — so questions about real-world banks come back with citable, tool-grounded facts instead of generic training-data summaries.

Try *"draft a comparison of the three highest-rated digital banks in Germany, then tell me which has the best reviews on fees"*, *"summarize what users are saying about HSBC's customer service this year"*, or *"which banks in Brazil rank highest on crypto friendliness?"* — Claude will pull the data on demand and reason over it in-line.

Claude Desktop and claude.ai both support remote MCP servers as **custom connectors**. The hosted Moon Banking endpoint uses Streamable HTTP with OAuth, which both clients handle out of the box.

## Recommended: hosted (OAuth)

### Claude Desktop

1. Open **Settings → Connectors** (or **Settings → Developer → Add custom connector**, depending on your version).
2. Choose **Add custom connector**.
3. Set:
   - **Name:** `Moon Banking`
   - **URL:** `https://mcp.moonbanking.com/mcp`
4. Click **Add**. Claude will open a browser window asking you to sign in to Moon Banking. Approve the connection.
5. Back in Claude, toggle the **Moon Banking** connector on in any chat.

If you prefer to edit the config file directly, on macOS it lives at `~/Library/Application Support/Claude/claude_desktop_config.json`. On Windows it's `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moonbanking": {
      "url": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

Restart Claude Desktop after editing.

### claude.ai (web)

1. Sign in at [claude.ai](https://claude.ai) on a Pro, Team, or Enterprise plan (custom connectors require a paid plan).
2. Go to **Settings → Connectors → Add custom connector**.
3. Paste `https://mcp.moonbanking.com/mcp` and confirm.
4. Approve the OAuth prompt that opens.

## Alternative: self-hosted (API key)

If you need a stdio connection (eg. air-gapped use or a service account), Claude Desktop can spawn the published npm package locally. Add this to `claude_desktop_config.json`:

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

Generate the API key at [moonbanking.com/settings/api/manage-api-keys](https://moonbanking.com/settings/api/manage-api-keys) and restart Claude.

## Verify the connection

Start a new conversation in Claude and ask:

> Using the Moon Banking connector, find banks in Brazil that are known for being crypto-friendly.

Claude should call tools like `bank_semanticSearch` or `country_getByCountryCode` and reply with real Moon Banking data.

## Troubleshooting

- **Connector shows as disconnected.** Click the connector in Settings and re-run the auth flow. If your access token expired Claude will need to re-authenticate.
- **`Tool list is empty`** Re-run the auth flow so the connector picks up a valid token. Every tool is listed regardless of your plan, so a plan problem surfaces as a 403 when a tool is called rather than as an empty list.
- **Cannot add connector.** Claude.ai's custom connectors are gated to paid plans. Claude Desktop has fewer restrictions.


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
