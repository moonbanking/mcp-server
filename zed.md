# Moon Banking MCP for Zed

> Connect the Zed editor to the Moon Banking MCP server via Context Servers.

Zed's AI assistant is fast and stays out of your way — exactly what you want when you're moving through code. Connecting the Moon Banking MCP gives that assistant live access to the Moon Banking dataset: every bank, country, community-rated score across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, lending, …), vote, and user story. Questions about real banks come back with real data, with no perceptible latency hit on the rest of your workflow.

Useful for scaffolding fintech projects, generating realistic test data, or just pulling up *"the five highest-rated business banks in Canada"* or *"which European banks have the best digital experience scores?"* without leaving the editor.

Zed exposes MCP servers to its built-in AI assistant as **Context Servers**. Configure them in `~/.config/zed/settings.json` (or **Zed → Settings → Open settings**).

## Recommended: hosted (OAuth)

```json
{
  "context_servers": {
    "moonbanking": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.moonbanking.com/mcp"]
    }
  }
}
```

Zed's Context Servers currently expect a stdio command, so we wrap the hosted endpoint with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) — a tiny bridge that proxies stdio to remote Streamable HTTP and handles the OAuth flow in a browser tab.

After saving, restart Zed. The first request to a Moon Banking tool opens a browser window for sign-in.

## Alternative: self-hosted (API key)

```json
{
  "context_servers": {
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

Open the Zed AI panel. The **Context Servers** section in the side panel should list `moonbanking` along with its tool count. Then ask:

> Using Moon Banking, what are the most highly-rated banks in Brazil?

## Troubleshooting

- **`mcp-remote` is slow on first run.** It downloads on first invocation. Subsequent runs are cached.
- **Auth never completes.** Confirm that `localhost` is reachable from your browser — `mcp-remote` uses a local callback port (`http://127.0.0.1:6274` by default).


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
