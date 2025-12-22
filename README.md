# Moon Banking MCP Server

The Moon Banking MCP server is generated from the [OpenAPI specification](https://github.com/moonbanking/moonbanking-openapi).

## Installation

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
    "moonbanking_api": {
      "command": "npx",
      "args": ["-y", "@moonbanking/mcp-server"],
      "env": {
        "MOON_BANKING_API_KEY": "Bearer mb_sk_..."
      }
    }
  }
}
```

### Cursor

If you use Cursor, you can install the MCP server by using the button below. You will need to set your environment variables
in Cursor's `mcp.json`, which can be found in Cursor Settings > Tools & MCP > New MCP Server.

[![Add to Cursor](https://cursor.com/en-US/install-mcp?name=moonbanking-mcp&config=eyJlbnYiOnsiTU9PTl9CQU5LSU5HX0FQSV9LRVkiOiJTZXQgeW91ciBNT09OX0JBTktJTkdfQVBJX0tFWSBoZXJlLiJ9LCJjb21tYW5kIjoibnB4IC15IEBtb29uYmFua2luZy9tY3Atc2VydmVyIn0%3D)

### Claude Code

If you use Claude Code, you can install the MCP server by running the command below in your terminal. You will need to set your
environment variables in Claude Code's `claude.json`, which can be found in your home directory.

```
claude mcp add --transport stdio moonbanking_api --env MOON_BANKING_API_KEY="Your MOON_BANKING_API_KEY here." -- npx -y @moonbanking/mcp-server
```

## Filter Specific Tools

You can limit which tools are exposed by using the `--tool` flag:

```bash
npx @moonbanking/mcp-server --tool=tool1 --tool=tool2
```

## Available Tools

- `bank-get`: This endpoint allows you to retrieve a paginated list of all banks. By default, a maximum of ten banks are shown per page. You can search banks by name, filter by country and description (including null/not_null status or semantic content search using vector embeddings), sort them by various fields, and include related data like scores and country information. When searching description content, results are ordered by semantic similarity.
- `bank-getById`: This endpoint allows you to retrieve a specific bank by providing the bank ID. You can include related data like scores and country information in the response.
- `bankVote-get`: This endpoint allows you to retrieve a paginated list of bank votes. You can filter by bank ID, category, country, vote type (upvote or downvote), and other parameters.
- `country-get`: This endpoint allows you to retrieve a paginated list of all countries. By default, a maximum of ten countries are shown per page. You can search countries by name or 2-letter code, sort them by various fields, and include related data like scores.
- `country-getByCountryCode`: This endpoint allows you to retrieve a specific country by providing the 2-letter ISO country code. You can include related data like scores in the response.
- `story-get`: This endpoint allows you to retrieve a paginated list of all stories. By default, a maximum of ten stories are shown per page. You can search stories by text content, filter by bank ID, sort them by various fields, and include related data like bank and country information.
- `story-getById`: This endpoint allows you to retrieve a specific story by providing the story ID. You can include related data like bank and country information in the response.
- `world-getOverview`: This endpoint allows you to retrieve global overview data that aggregates banks votes, stories and other data across all banks in all countries. You can include related data like scores in the response.

## License

MIT
