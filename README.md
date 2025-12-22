# @moonbanking/mcp-server

# Welcome to the Moon Banking API!

Enjoy the documentation and happy coding. Share this spec with your LLM of choice to speed up your development, or take a look at our MCP server and various SDKs.

### More information

For more information about the Moon Banking API, please visit the [Moon Banking Documentation](https://docs.moonbanking.com).

This MCP server provides tools to interact with the Moon Banking API API based on OpenAPI specification version 2025-07-11.

## Installation

```bash
npm install @moonbanking/mcp-server
```

Or use with npx:

```bash
npx @moonbanking/mcp-server
```

## Configuration

### Required Environment Variables

- `MOON_BANKING_API_KEY`: Your API key for authentication

### Optional Environment Variables

- `MOON_BANKING_INTERNAL_BASE_URL`: Custom base URL (defaults to https://api.moonbanking.com/v1)

## Usage

### With MCP Client

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": ["-y", "@moonbanking/mcp-server"],
      "env": {
        "MOON_BANKING_API_KEY": "your-api-key-here",
        "MOON_BANKING_INTERNAL_BASE_URL": "https://api.moonbanking.com/v1"
      }
    }
  }
}
```

### Filter Specific Tools

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
