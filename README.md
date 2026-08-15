# Moon Banking MCP Server

Moon Banking is a global directory of consumer and business banks with structured, community-rated scores across 14 categories — customer service, fees & pricing, digital experience, crypto friendliness, security & trust, lending, business banking, international banking, transparency, and more. The Moon Banking MCP server exposes that entire dataset — every bank, country, score, vote, and user story — as live tools your AI agent can call, so answers about real-world banking are grounded in fresh Moon Banking data instead of stale training-set guesses.

Once connected, you can ask questions like *"which crypto-friendly banks operate in Brazil?"*, *"compare digital-experience scores for the top US challenger banks"*, or *"summarize recent user stories about fees at HSBC UK"* and get tool-grounded, citable answers backed by the same data that powers [moonbanking.com](https://moonbanking.com).

The server is generated from the public [OpenAPI specification](https://github.com/moonbanking/moonbanking-openapi) and ships as both a hosted OAuth endpoint at `https://mcp.moonbanking.com/mcp` and a stdio npm package (`@moonbanking/mcp-server`) — so you can connect it to Claude, Cursor, Grok, ChatGPT, VS Code, Devin Desktop (formerly Windsurf), Zed, and any other [Model Context Protocol](https://modelcontextprotocol.io) client.

## Client-specific setup guides

If you just want to wire Moon Banking up to a specific client, jump straight to its guide. Each one covers both the hosted OAuth setup and the self-hosted stdio fallback.

| Client | Guide |
| --- | --- |
| Claude (Desktop & web) | [claude](./claude.md) |
| Claude Code | [claude-code](./claude-code.md) |
| Cursor | [cursor](./cursor.md) |
| Devin Desktop (formerly Windsurf) | [devin-desktop](./devin-desktop.md) |
| VS Code (GitHub Copilot) | [vscode](./vscode.md) |
| Zed | [zed](./zed.md) |
| ChatGPT | [chatgpt](./chatgpt.md) |
| Grok (xAI) | [grok](./grok.md) |
| MCP Inspector (testing) | [mcp-inspector](./mcp-inspector.md) |

The rest of this README covers the underlying authentication options and configuration shapes.

## Authentication

You can connect to Moon Banking over MCP using **either** of two auth methods:

| Method | Best for | API key required? |
| --- | --- | --- |
| **Hosted OAuth server** (recommended) | Claude, Cursor, Grok, ChatGPT, and any MCP client that supports remote/streamable HTTP MCP. Users sign in to Moon Banking in a browser — no key handling. | No |
| **Self-hosted stdio package** (this npm package) | Local scripts, agents, or clients that only support stdio MCP. | Yes |

Both methods expose the same tool surface; pick whichever matches your client.

## Hosted MCP server (OAuth)

URL: `https://mcp.moonbanking.com/mcp` (Streamable HTTP, OAuth 2.0 with Dynamic Client Registration).

Most modern MCP clients can connect by simply pointing at the URL — they will pop a browser window for the user to sign in to Moon Banking and obtain an access token automatically. No API key is exchanged or stored on the client side.

```json
{
  "mcpServers": {
    "moonbanking": {
      "url": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

For clients that don't yet speak remote MCP natively (eg. older ChatGPT configurations), the [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) bridge can wrap the hosted endpoint as a stdio command:

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

## Self-hosted (API key)

If you prefer to run the MCP server locally as a stdio process — for example to embed it in an automation that doesn't have a browser available for OAuth — install this npm package and authenticate with a Moon Banking API key.

### Direct invocation

You can run the MCP Server directly via `npx`:

```sh
export MOON_BANKING_API_KEY="Bearer mb_sk_..."
npx -y @moonbanking/mcp-server
```

### Via MCP Client

There is a partial list of existing clients at [modelcontextprotocol.io](https://modelcontextprotocol.io/clients). If you already
have a client, consult their documentation to install the MCP server.

For clients with a configuration JSON, it might look something like this:

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

## Filter Specific Tools

You can limit which tools are exposed by using the `--tool` flag:

```bash
npx @moonbanking/mcp-server --tool=tool1 --tool=tool2
```

## Available Tools

- `bank_getByHostname`: This endpoint allows you to retrieve banks by hostname. It will return up to one bank per country that matches the provided hostname. The hostname is normalized (www. prefix removed if present) and matched against both the primary hostname and alternative hostnames.
- `bank_get`: This endpoint allows you to retrieve a paginated list of all banks. By default, a maximum of ten banks are shown per page. You can search banks by name, filter by country, sort them by various fields, and include related data like scores and country information.
- `bank_getById`: This endpoint allows you to retrieve a specific bank by providing the bank ID. You can include related data like scores and country information in the response.
- `bank_semanticSearch`: Search for banks by describing what you are looking for in natural language. This searches across bank descriptions including services offered, history, location, unique features, and institution type. Use this when the user asks about banks with specific characteristics, services, or qualities.
- `bankVote_get`: This endpoint allows you to retrieve a paginated list of bank votes. You can filter by bank ID, category, country, vote type (upvote or downvote), and other parameters.
- `country_get`: This endpoint allows you to retrieve a paginated list of all countries. By default, a maximum of ten countries are shown per page. You can search countries by name or 2-letter code, sort them by various fields, and include related data like scores.
- `country_getByCountryCode`: This endpoint allows you to retrieve a specific country by providing the 2-letter ISO country code. You can include related data like scores in the response.
- `story_get`: This endpoint allows you to retrieve a paginated list of all stories. By default, a maximum of ten stories are shown per page. You can search stories by text content, filter by bank ID, sort them by various fields, and include related data like bank and country information.
- `story_getById`: This endpoint allows you to retrieve a specific story by providing the story ID. You can include related data like bank and country information in the response.
- `world_getOverview`: This endpoint allows you to retrieve global overview data that aggregates banks votes, stories and other data across all banks in all countries. You can include related data like scores in the response.
- `market_get`: This endpoint allows you to retrieve a paginated list of markets (e.g. stock exchanges). You can search by name or code, filter by exact code, country, or market type, and sort the results.
- `market_getById`: This endpoint allows you to retrieve a specific market (e.g. stock exchange) by providing the market id.
- `stock_get`: This endpoint allows you to retrieve a paginated list of stock listings. You can search by ticker symbol, filter by exact symbol, market, bank, or primary-listing status, and sort the results.
- `stock_getById`: This endpoint allows you to retrieve a specific stock listing by providing the stock id. You can optionally include the associated `market` and/or `bank` as nested objects.
- `search_get`: Search across banks, countries, stories, and stocks. You can specify which entities to search using the include parameter. If no include value is provided, all entities will be searched. Banks are also matched on the ticker symbol of their stock listings, so searching `BAC` returns Bank of America.

## License

MIT
