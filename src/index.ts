#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Configuration
const DEFAULT_BASE_URL = 'https://api.moonbanking.com/v1';
const BASE_URL = process.env.MOON_BANKING_INTERNAL_BASE_URL || DEFAULT_BASE_URL;
const API_KEY = process.env.MOON_BANKING_API_KEY;

if (!API_KEY) {
  console.error('Error: MOON_BANKING_API_KEY environment variable is required');
  process.exit(1);
}

// API client helper
const apiCall = async (
  method: string,
  path: string,
  options: {
    params?: Record<string, unknown>;
    body?: unknown;
  } = {},
): Promise<unknown> => {
  try {
    // Build URL with query parameters
    const url = new URL(`${BASE_URL}${path}`);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const fetchOptions: Parameters<typeof fetch>[1] = {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    if (options.body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Tool definitions
const tools = [
  {
    "name": "bank_get",
    "description": "This endpoint allows you to retrieve a paginated list of all banks. By default, a maximum of ten banks are shown per page. You can search banks by name, filter by country and description (including null/not_null status or semantic content search using vector embeddings), sort them by various fields, and include related data like scores and country information. When searching description content, results are ordered by semantic similarity.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Number of items to return.",
          "default": 10
        },
        "starting_after": {
          "type": "string",
          "description": "Cursor for forward pagination. Use the id of the last item from the previous page to get the next page."
        },
        "ending_before": {
          "type": "string",
          "description": "Cursor for backward pagination. Use the id of the first item from the current page to get the previous page."
        },
        "search": {
          "type": "string",
          "description": "Search banks by name."
        },
        "description": {
          "type": "string",
          "description": "Filter banks by description. Under the hood, this is a semantic search that uses vector embeddings, so you may get better results if you use general language. Besides a full text search, you can use \"null\" to return banks without descriptions or \"not_null\" to return banks with descriptions."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "name",
            "rank",
            "countryRank",
            "storiesCount",
            "countryId",
            "overall_score",
            "overall_total",
            "overall_up",
            "overall_down",
            "cryptoFriendly_score",
            "cryptoFriendly_total",
            "cryptoFriendly_up",
            "cryptoFriendly_down",
            "customerService_score",
            "customerService_total",
            "customerService_up",
            "customerService_down",
            "feesPricing_score",
            "feesPricing_total",
            "feesPricing_up",
            "feesPricing_down",
            "digitalExperience_score",
            "digitalExperience_total",
            "digitalExperience_up",
            "digitalExperience_down",
            "securityTrust_score",
            "securityTrust_total",
            "securityTrust_up",
            "securityTrust_down",
            "accountFeatures_score",
            "accountFeatures_total",
            "accountFeatures_up",
            "accountFeatures_down",
            "branchAtmAccess_score",
            "branchAtmAccess_total",
            "branchAtmAccess_up",
            "branchAtmAccess_down",
            "internationalBanking_score",
            "internationalBanking_total",
            "internationalBanking_up",
            "internationalBanking_down",
            "businessBanking_score",
            "businessBanking_total",
            "businessBanking_up",
            "businessBanking_down",
            "processingSpeed_score",
            "processingSpeed_total",
            "processingSpeed_up",
            "processingSpeed_down",
            "transparency_score",
            "transparency_total",
            "transparency_up",
            "transparency_down",
            "innovation_score",
            "innovation_total",
            "innovation_up",
            "innovation_down",
            "investmentServices_score",
            "investmentServices_total",
            "investmentServices_up",
            "investmentServices_down",
            "lending_score",
            "lending_total",
            "lending_up",
            "lending_down"
          ],
          "default": "name"
        },
        "sortOrder": {
          "type": "string",
          "description": "Sort order. Either ascending or descending.",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`, `country`, `meta`"
        },
        "countryId": {
          "type": "string",
          "description": "Only return banks in the specified country. A country's ID is Moon Banking's unique identifier for the country."
        },
        "countryCode": {
          "type": "string",
          "description": "Only return banks in the specified country. A country's code is the ISO 3166-1 code for the country. If both `countryId` and `countryCode` are provided, `countryId` will be used."
        }
      }
    }
  },
  {
    "name": "bank_getById",
    "description": "This endpoint allows you to retrieve a specific bank by providing the bank ID. You can include related data like scores and country information in the response.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`, `country`"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "bankVote_get",
    "description": "This endpoint allows you to retrieve a paginated list of bank votes. You can filter by bank ID, category, country, vote type (upvote or downvote), and other parameters.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Number of items to return.",
          "default": 10
        },
        "starting_after": {
          "type": "string",
          "description": "Cursor for forward pagination. Use the id of the last item from the previous page to get the next page."
        },
        "ending_before": {
          "type": "string",
          "description": "Cursor for backward pagination. Use the id of the first item from the current page to get the previous page."
        },
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "categories": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `CRYPTO_FRIENDLY`, `CUSTOMER_SERVICE`, `FEES_PRICING`, `DIGITAL_EXPERIENCE`, `SECURITY_TRUST`, `ACCOUNT_FEATURES`, `BRANCH_ATM_ACCESS`, `INTERNATIONAL_BANKING`, `BUSINESS_BANKING`, `PROCESSING_SPEED`, `TRANSPARENCY`, `INNOVATION`, `INVESTMENT_SERVICES`, `LENDING`"
        },
        "isUp": {
          "type": "boolean",
          "description": "Whether to filter for upvotes (true) or downvotes (false)."
        },
        "countryCode": {
          "type": "string",
          "description": "The country's ISO 3166-1 code (2 characters)."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "createdAt"
          ],
          "default": "createdAt"
        },
        "sortOrder": {
          "type": "string",
          "description": "Sort order. Either ascending or descending.",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "desc"
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `bank`, `country`"
        }
      }
    }
  },
  {
    "name": "country_get",
    "description": "This endpoint allows you to retrieve a paginated list of all countries. By default, a maximum of ten countries are shown per page. You can search countries by name or 2-letter code, sort them by various fields, and include related data like scores.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Number of items to return.",
          "default": 10
        },
        "starting_after": {
          "type": "string",
          "description": "Cursor for forward pagination. Use the id of the last item from the previous page to get the next page."
        },
        "ending_before": {
          "type": "string",
          "description": "Cursor for backward pagination. Use the id of the first item from the current page to get the previous page."
        },
        "search": {
          "type": "string",
          "description": "Search countries by name or 2-letter code."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "name",
            "code",
            "rank",
            "banksCount",
            "storiesCount",
            "overall_score",
            "overall_total",
            "overall_up",
            "overall_down",
            "cryptoFriendly_score",
            "cryptoFriendly_total",
            "cryptoFriendly_up",
            "cryptoFriendly_down",
            "customerService_score",
            "customerService_total",
            "customerService_up",
            "customerService_down",
            "feesPricing_score",
            "feesPricing_total",
            "feesPricing_up",
            "feesPricing_down",
            "digitalExperience_score",
            "digitalExperience_total",
            "digitalExperience_up",
            "digitalExperience_down",
            "securityTrust_score",
            "securityTrust_total",
            "securityTrust_up",
            "securityTrust_down",
            "accountFeatures_score",
            "accountFeatures_total",
            "accountFeatures_up",
            "accountFeatures_down",
            "branchAtmAccess_score",
            "branchAtmAccess_total",
            "branchAtmAccess_up",
            "branchAtmAccess_down",
            "internationalBanking_score",
            "internationalBanking_total",
            "internationalBanking_up",
            "internationalBanking_down",
            "businessBanking_score",
            "businessBanking_total",
            "businessBanking_up",
            "businessBanking_down",
            "processingSpeed_score",
            "processingSpeed_total",
            "processingSpeed_up",
            "processingSpeed_down",
            "transparency_score",
            "transparency_total",
            "transparency_up",
            "transparency_down",
            "innovation_score",
            "innovation_total",
            "innovation_up",
            "innovation_down",
            "investmentServices_score",
            "investmentServices_total",
            "investmentServices_up",
            "investmentServices_down",
            "lending_score",
            "lending_total",
            "lending_up",
            "lending_down"
          ],
          "default": "name"
        },
        "sortOrder": {
          "type": "string",
          "description": "Sort order. Either ascending or descending.",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`"
        }
      }
    }
  },
  {
    "name": "country_getByCountryCode",
    "description": "This endpoint allows you to retrieve a specific country by providing the 2-letter ISO country code. You can include related data like scores in the response.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string",
          "description": "The country's ISO 3166-1 code (2 characters)."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`"
        }
      },
      "required": [
        "code"
      ]
    }
  },
  {
    "name": "story_get",
    "description": "This endpoint allows you to retrieve a paginated list of all stories. By default, a maximum of ten stories are shown per page. You can search stories by text content, filter by bank ID, sort them by various fields, and include related data like bank and country information.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Number of items to return.",
          "default": 10
        },
        "starting_after": {
          "type": "string",
          "description": "Cursor for forward pagination. Use the id of the last item from the previous page to get the next page."
        },
        "ending_before": {
          "type": "string",
          "description": "Cursor for backward pagination. Use the id of the first item from the current page to get the previous page."
        },
        "search": {
          "type": "string",
          "description": "Search stories by text content."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "createdAt",
            "thumbsUpCount"
          ],
          "default": "createdAt"
        },
        "sortOrder": {
          "type": "string",
          "description": "Sort order. Either ascending or descending.",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `bank`, `country`"
        },
        "countryCode": {
          "type": "string",
          "description": "The country's ISO 3166-1 code (2 characters)."
        },
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "tags": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `CRYPTO_FRIENDLY`, `CUSTOMER_SERVICE`, `FEES_PRICING`, `DIGITAL_EXPERIENCE`, `SECURITY_TRUST`, `ACCOUNT_FEATURES`, `BRANCH_ATM_ACCESS`, `INTERNATIONAL_BANKING`, `BUSINESS_BANKING`, `PROCESSING_SPEED`, `TRANSPARENCY`, `INNOVATION`, `INVESTMENT_SERVICES`, `LENDING`"
        }
      }
    }
  },
  {
    "name": "story_getById",
    "description": "This endpoint allows you to retrieve a specific story by providing the story ID. You can include related data like bank and country information in the response.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The story's auto-generated unique identifier."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `bank`, `country`"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "world_getOverview",
    "description": "This endpoint allows you to retrieve global overview data that aggregates banks votes, stories and other data across all banks in all countries. You can include related data like scores in the response.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`"
        }
      }
    }
  }
];

// Parse command line arguments for tool filtering
const args = process.argv.slice(2);
const selectedTools = new Set<string>();

args.forEach(arg => {
  if (arg.startsWith('--tool=')) {
    selectedTools.add(arg.substring('--tool='.length));
  }
});

// Filter tools if specific ones were requested
const availableTools = selectedTools.size > 0
  ? tools.filter(tool => selectedTools.has(tool.name))
  : tools;

// Create MCP server
const server = new Server(
  {
    name: 'moon banking api-mcp',
    version: '2025-07-11',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: availableTools,
}));

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'bank_get': {
        const result = await apiCall(
          'GET',
          `/banks`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              search: args.search,
              description: args.description,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
              include: args.include,
              countryId: args.countryId,
              countryCode: args.countryCode,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'bank_getById': {
        const result = await apiCall(
          'GET',
          `/banks/${args.id}`,
          {
            params: {
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'bankVote_get': {
        const result = await apiCall(
          'GET',
          `/bank-votes`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              bankId: args.bankId,
              categories: args.categories,
              isUp: args.isUp,
              countryCode: args.countryCode,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'country_get': {
        const result = await apiCall(
          'GET',
          `/countries`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              search: args.search,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'country_getByCountryCode': {
        const result = await apiCall(
          'GET',
          `/countries/${args.code}`,
          {
            params: {
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'story_get': {
        const result = await apiCall(
          'GET',
          `/stories`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              search: args.search,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
              include: args.include,
              countryCode: args.countryCode,
              bankId: args.bankId,
              tags: args.tags,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'story_getById': {
        const result = await apiCall(
          'GET',
          `/stories/${args.id}`,
          {
            params: {
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'world_getOverview': {
        const result = await apiCall(
          'GET',
          `/world`,
          {
            params: {
              include: args.include,
            },

          },
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
const main = async (): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Moon Banking API MCP server running on stdio');
  console.error(`Base URL: ${BASE_URL}`);
  console.error(`Available tools: ${availableTools.length}`);
};

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
