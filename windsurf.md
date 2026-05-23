# Moon Banking MCP for Windsurf

> Connect Windsurf (Codeium Cascade) to the Moon Banking MCP server.

Windsurf's Cascade agent is built for long-running, multi-file coding tasks — exactly where having reliable external data matters. Wire in the Moon Banking MCP and Cascade gains live access to the entire Moon Banking dataset (banks, countries, community-rated scores across 14 categories, votes, user stories), so when your agent needs to know about a real bank — its hostname, country rank, crypto-friendliness score, or what users say about its fees — it asks instead of guessing.

Useful for building banking-aware features, generating realistic test fixtures across an entire repo, or simply prompting *"find a crypto-friendly digital bank in Portugal and scaffold a project that integrates with its public services"* while Cascade does the heavy lifting.

Windsurf's Cascade agent supports MCP via its `mcp_config.json` file. Both remote (HTTP) and stdio transports work.

## Recommended: hosted (OAuth)

Edit (or create) the global Windsurf config at `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "moonbanking": {
      "serverUrl": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

Restart Windsurf. The first request to a Moon Banking tool will trigger an OAuth flow in your browser. After approval, the tools become available to Cascade.

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

Open Cascade and click the MCP toolbar icon — `moonbanking` should appear in the list along with its tools. Then ask:

> List the top five banks in Japan by user rating.

## Troubleshooting

- **Server not detected.** Confirm Windsurf is reading the right config file: open **Cascade Settings → MCP** and verify the path it shows.
- **Auth window won't open.** Some Linux distributions require a default browser to be configured (`xdg-settings set default-web-browser ...`).


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
- `search_get`

Full descriptions live on the [main MCP page](./README.md).
