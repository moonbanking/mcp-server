# Moon Banking MCP for Devin Desktop

> Connect Devin Desktop (formerly Windsurf) to the Moon Banking MCP server.

Devin Desktop is the new name for Windsurf. Cognition shipped the rename as an over-the-air update on June 2, 2026 — the IDE, your settings, your extensions, and your existing MCP configuration all carried over automatically. The Agent Command Center is now the default surface (multi-agent Kanban view, Spaces, ACP-based third-party agents), with the classic editor still one click away. The local coding agent has been renamed from **Cascade** to **Devin Local** — same MCP plumbing, ~30% better token efficiency, subagent support, and sandboxing. Cascade itself is end-of-life on July 1, 2026, so new MCP setup should target Devin Local; the configuration below works for both.

Devin Local is built for long-running, multi-file agentic coding tasks — exactly where having reliable external data matters. Wire in the Moon Banking MCP and Devin Local gains live access to the entire Moon Banking dataset (banks, countries, community-rated scores across 14 categories, votes, user stories), so when your agent needs to know about a real bank — its hostname, country rank, crypto-friendliness score, or what users say about its fees — it asks instead of guessing.

Useful for building banking-aware features, generating realistic test fixtures across an entire repo, or simply prompting *"find a crypto-friendly digital bank in Portugal and scaffold a project that integrates with its public services"* while Devin Local does the heavy lifting.

Devin Desktop reads MCP servers from a single global `mcp_config.json` file shared with the legacy Windsurf install. Both remote (HTTP) and stdio transports work, and the same file is picked up by Devin Local *and* Cascade (until Cascade's July 1, 2026 sunset).

## Recommended: hosted (OAuth)

Edit (or create) the global config at `~/.codeium/mcp_config.json`:

```json
{
  "mcpServers": {
    "moonbanking": {
      "serverUrl": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

Restart Devin Desktop. The first request to a Moon Banking tool will trigger an OAuth flow in your browser. After approval, the tools become available to Devin Local (and to Cascade, while it remains).

## Alternative: self-hosted (API key)

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

Open Devin Desktop, switch to the **Devin Local** agent (or Cascade, if you have not migrated yet), and head to **Settings → Tools** — `moonbanking` should appear with its tool count. Then ask:

> List the top five banks in Japan by user rating.

## Troubleshooting

- **Server not detected.** Confirm Devin Desktop is reading the right config file: open **Settings → Tools** and use **View Raw Config** to verify the path. The file is `~/.codeium/mcp_config.json` — no `windsurf/` subfolder.
- **Auth window won't open.** Some Linux distributions require a default browser to be configured (`xdg-settings set default-web-browser ...`).
- **Still on legacy Windsurf 2.0?** The same `~/.codeium/mcp_config.json` works — Cascade reads it directly, and Devin Desktop will pick it up automatically when the OTA update lands.


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
