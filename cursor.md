# Moon Banking MCP for Cursor

> Connect Cursor to the Moon Banking MCP server so the AI can query banks, countries, votes, and stories with one-click OAuth.

Cursor's agent is excellent at writing code but has no built-in knowledge of specific banks, their hostnames, fee structures, or how real customers rate them. Wiring in the Moon Banking MCP closes that gap: Cursor gains live access to every bank Moon Banking tracks — name, country, primary hostname, rank, community-rated scores across 14 categories (customer service, fees & pricing, digital experience, crypto friendliness, security & trust, lending, and more) — plus the user-submitted stories backing those scores.

Useful when you're scaffolding a fintech project, validating bank hostnames you see in code, generating realistic test fixtures, or just prompting *"find me a crypto-friendly business bank in Singapore and stub out a client for its public API"* mid-session. Answers are grounded in fresh Moon Banking data — not whatever your model memorized last year.

Cursor speaks remote MCP natively over Streamable HTTP. The fastest setup is to point Cursor at the hosted endpoint — Cursor handles the OAuth flow in a browser tab automatically.

## Recommended: hosted (OAuth)

### Option A — Click to install

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=moonbanking&config=eyJ1cmwiOiJodHRwczovL21jcC5tb29uYmFua2luZy5jb20vbWNwIn0%3D)

### Option B — Edit `mcp.json` directly

Open Cursor and go to **Settings → Tools & MCP → New MCP Server**, or edit your global config at `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "moonbanking": {
      "url": "https://mcp.moonbanking.com/mcp"
    }
  }
}
```

For project-scoped install instead, drop the same JSON at `.cursor/mcp.json` inside your repository.

The first time Cursor connects, it will open a browser window asking you to sign in to Moon Banking. After that, the connection persists across restarts.

## Alternative: self-hosted (API key)

If you would rather run the MCP server locally as a stdio process (eg. you are on a machine without a browser, or you want to use a service API key), Cursor can spawn the published npm package.

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

Generate an API key at [moonbanking.com/settings/api/manage-api-keys](https://moonbanking.com/settings/api/manage-api-keys).

## Verify the connection

Open the Cursor chat panel and look for the **MCP** indicator beside the model picker — it should show `moonbanking` with a green dot and the tool count. You can also ask the agent something like:

> What are the top three banks in Germany right now?

If it responds using the `bank_get` and `country_get` tools, the connection is working.

## Troubleshooting

- **Tools list is empty.** Cursor may have cached an unauthenticated session. Remove the entry from `mcp.json`, restart Cursor, and re-add it. If the issue persists, run `npx @modelcontextprotocol/inspector` against `https://mcp.moonbanking.com/mcp` to confirm the server is reachable from your network.
- **OAuth window closes immediately.** Make sure your default browser is signed in to Moon Banking, or sign in first at [moonbanking.com](https://moonbanking.com) and retry.
- **403 errors after sign-in.** Your Moon Banking account must be on a Pro plan to use the MCP API. [Upgrade to Pro](https://moonbanking.com/pro).


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
