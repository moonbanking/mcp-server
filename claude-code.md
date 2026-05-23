# Moon Banking MCP for Claude Code

> Add the Moon Banking MCP server to the Claude Code CLI for use in terminal-driven coding sessions.

Claude Code is the right tool when you're scripting against APIs, automating data work, or hacking on a fintech backend without leaving your terminal. Adding the Moon Banking MCP gives the CLI agent live access to the entire Moon Banking dataset — banks, countries, community-rated scores across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, lending, transparency, …), user votes, user stories, and global rankings — over either the hosted OAuth endpoint or a local stdio process.

Typical uses: seeding a fintech database with realistic bank records, generating evaluation datasets that need real institutions, prototyping "find me a bank that…" features, or pausing mid-script to ask *"which US banks have the highest customer-service scores?"* without context-switching to a browser.

Claude Code is Anthropic's terminal CLI. It supports both **remote** (HTTP/Streamable HTTP) and **stdio** MCP transports.

## Recommended: hosted (OAuth)

Run this once in any directory:

```bash
claude mcp add --transport http moonbanking https://mcp.moonbanking.com/mcp
```

The first time you invoke a Moon Banking tool, Claude Code will print a one-time URL and ask you to authenticate in your browser. The resulting OAuth token is cached on disk and reused across sessions.

To install only for the current project (instead of globally), pass `--scope project`:

```bash
claude mcp add --transport http --scope project moonbanking https://mcp.moonbanking.com/mcp
```

The project-scoped config lives in `.claude.json` at the project root and can be committed to source control if you want every developer on the team to share it.

## Alternative: self-hosted (API key)

```bash
claude mcp add --transport stdio moonbanking \
  --env MOON_BANKING_API_KEY="Bearer mb_sk_..." \
  -- npx -y @moonbanking/mcp-server
```

This launches a local stdio MCP server that authenticates with your API key on every call.

## Verify the connection

```bash
claude mcp list
```

You should see `moonbanking` listed with a connection status of `connected`. Then start a session and try:

```
> Find the highest-rated bank in Switzerland for crypto users.
```

## Troubleshooting

- **`Failed to authenticate`** Run `claude mcp remove moonbanking` and re-add to clear the cached token.
- **No tools available.** Run `claude mcp list` — if the server appears with a red status, run `claude mcp logs moonbanking` to inspect the error.
- **Pro plan required.** The MCP API rejects non-Pro Moon Banking accounts; [upgrade to Pro](https://moonbanking.com/pro).


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
