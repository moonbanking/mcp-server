# Moon Banking MCP for VS Code

> Connect VS Code (with GitHub Copilot Chat MCP support) to the Moon Banking MCP server.

GitHub Copilot's MCP support turns VS Code into a coding agent that can talk to live external data — not just whatever was in its training set. With the Moon Banking MCP plugged in, Copilot can answer questions about specific banks while you code: names, hostnames, country rank, community-rated scores across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, lending, …), and the user stories behind those scores.

Useful when you're integrating with a bank's API, validating hostnames in code, shipping a feature that displays real bank ratings, or just asking *"which banks in Mexico score highest on digital experience?"* in the middle of a session — Copilot will route the question through the MCP server and reply with citable data.

Recent versions of VS Code expose MCP servers to GitHub Copilot Chat via an `mcp.json` configuration. Both remote HTTP and stdio transports are supported.

## Recommended: hosted (OAuth)

Create `.vscode/mcp.json` in your workspace (or the user-level equivalent) and add:

```json
{
  "servers": {
    "moonbanking": {
      "type": "http",
      "url": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

Reload the window. The first time Copilot Chat invokes a Moon Banking tool, VS Code will pop a notification asking you to authenticate in your browser. After approval, the connection is reused for the rest of the session.

## Alternative: self-hosted (API key)

```json
{
  "servers": {
    "moonbanking-mcp": {
      "type": "stdio",
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

Open Copilot Chat and ask:

> @workspace Using the Moon Banking MCP, find me three banks in France that score highly on digital experience.

If the tools are connected, Copilot will reply with tool-call traces visible in the chat view.

## Troubleshooting

- **VS Code doesn't see the config.** Confirm you are on a recent version of VS Code (MCP support shipped in late 2025 / 2026). Older versions don't honor `mcp.json`.
- **Auth never completes.** Make sure VS Code is allowed to open external URLs (`window.openUrl` setting). Corporate proxies may block the OAuth callback.


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
