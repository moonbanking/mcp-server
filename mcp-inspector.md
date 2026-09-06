# Moon Banking MCP for MCP Inspector

> Test the Moon Banking MCP server with Anthropic's MCP Inspector before wiring it into a client.

MCP Inspector is the sanity check before plugging Moon Banking into Claude, Cursor, Grok, ChatGPT, or anywhere else. Point it at the hosted endpoint and you can see the full Moon Banking tool surface (11 tools across banks, countries, votes, stories, semantic search, and global overview), invoke each one with real arguments, and verify the OAuth flow works end-to-end — all before you commit a single line to a real client's config.

It's also the easiest way to confirm a new MCP client implementation you're building yourself supports Streamable HTTP plus OAuth with Dynamic Client Registration correctly: if Moon Banking works in the Inspector but not in your client, the difference is on your end, not the server's.

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the official debugger for MCP servers. Use it when you're integrating Moon Banking into a new client and want to verify that the OAuth flow and tool surface behave as expected.

## Run the inspector

```bash
npx @modelcontextprotocol/inspector
```

A browser window opens at [http://localhost:6274](http://localhost:6274).

## Connect to the hosted server

1. **Transport:** `Streamable HTTP`
2. **Server URL:** `https://mcp.moonbanking.com/mcp`
3. Click **Connect**. The inspector will detect that the server requires OAuth, open a browser tab to authenticate with Moon Banking, and bring you back once you approve.
4. In the **Tools** tab, you should see every Moon Banking tool. Click any of them, fill in arguments, and invoke them live.

## Connect to the self-hosted stdio server

If you're testing the API-key package, run the inspector against the local stdio process:

```bash
MOON_BANKING_API_KEY="Bearer mb_sk_..." \
  npx @modelcontextprotocol/inspector npx -y @moonbanking/mcp-server
```

## What to look for

- **Tools tab populated** — confirms the server is serving the tool list.
- **Successful tool call** — confirms upstream API auth is working.
- **Resources / Prompts tabs empty** — expected; Moon Banking exposes tools only.

If the inspector shows `401 Unauthorized` or `403 Forbidden`, refer to the troubleshooting sections of the client-specific pages; the root cause is usually a stale OAuth token in the inspector's cache (clear it with the **Disconnect** button), or an account that isn't on the Pro plan calling one of the Pro-only tools.


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
