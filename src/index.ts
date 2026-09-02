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
    "name": "bank_getByHostname",
    "description": "This endpoint allows you to retrieve banks by hostname. It will return up to one bank per country that matches the provided hostname. The hostname is normalized (www. prefix removed if present) and matched against both the primary hostname and alternative hostnames.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "hostname": {
          "type": "string",
          "description": "The hostname to search for (e.g., \"fidelity.com\" or \"www.fidelity.com\")."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`, `country`"
        },
        "pageTitle": {
          "type": "string",
          "description": "The title of the web page."
        }
      },
      "required": [
        "hostname"
      ]
    }
  },
  {
    "name": "bank_get",
    "description": "This endpoint allows you to retrieve a paginated list of all banks. By default, a maximum of ten banks are shown per page. You can search banks by name, filter by country, sort them by various fields, and include related data like scores and country information.",
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
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`, `country`, `meta`, `stocks`"
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
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `scores`, `country`, `stocks`"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "bank_semanticSearch",
    "description": "Search for banks by describing what you are looking for in natural language. This searches across bank descriptions including services offered, history, location, unique features, and institution type. Use this when the user asks about banks with specific characteristics, services, or qualities.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "A detailed, specific natural language sentence describing what the user is looking for. Combine all relevant context: location, institution type, user occupation or eligibility, services needed, and any preferences. Write a full descriptive sentence, NOT a keyword list."
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of bank results to return.",
          "default": 10
        },
        "countryCode": {
          "type": "string",
          "description": "Filter results to banks in this country (ISO 3166-1 code)."
        }
      },
      "required": [
        "query"
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
    "name": "bankProduct_list",
    "description": "This endpoint allows you to retrieve a paginated list of published bank products across all banks, so you can compare rates and terms between institutions. Filter by bank, country, category, type, currency, and rate, and sort by rate to find the most competitive offers. Products are supplied and maintained by each bank's own verified representatives. Every product includes the name of the bank that offers it.",
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
          "description": "Filter by the id of the bank that offers the product."
        },
        "countryCode": {
          "type": "string",
          "description": "Filter by the ISO country code of the bank offering the product."
        },
        "categories": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `ACCOUNT`, `CARD`, `LOAN`, `INVESTMENT`, `INSURANCE`, `SERVICE`, `OTHER`"
        },
        "types": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `CHECKING_ACCOUNT`, `SAVINGS_ACCOUNT`, `MONEY_MARKET_ACCOUNT`, `CERTIFICATE_OF_DEPOSIT`, `BUSINESS_CHECKING_ACCOUNT`, `BUSINESS_SAVINGS_ACCOUNT`, `YOUTH_ACCOUNT`, `CREDIT_CARD`, `DEBIT_CARD`, `BUSINESS_CREDIT_CARD`, `SECURED_CREDIT_CARD`, `PREPAID_CARD`, `PERSONAL_LOAN`, `AUTO_LOAN`, `MORTGAGE`, `HOME_EQUITY_LOAN`, `HOME_EQUITY_LINE_OF_CREDIT`, `STUDENT_LOAN`, `BUSINESS_LOAN`, `LINE_OF_CREDIT`, `CONSTRUCTION_LOAN`, `BROKERAGE_ACCOUNT`, `RETIREMENT_ACCOUNT`, `WEALTH_MANAGEMENT`, `INSURANCE`, `WIRE_TRANSFER`, `FOREIGN_EXCHANGE`, `MERCHANT_SERVICES`, `TREASURY_MANAGEMENT`, `SAFE_DEPOSIT_BOX`, `ONLINE_BANKING`, `MOBILE_BANKING`, `CRYPTO_SERVICE`, `OTHER`"
        },
        "currency": {
          "type": "string",
          "description": "Filter by the ISO 4217 currency code the product is denominated in."
        },
        "search": {
          "type": "string",
          "description": "Search products by name."
        },
        "minRatePercent": {
          "type": "number",
          "description": "Only return products whose rate reaches at least this percentage. A product matches on either its headline rate or the top of its rate range."
        },
        "maxRatePercent": {
          "type": "number",
          "description": "Only return products whose rate is no higher than this percentage. A product matches on either its headline rate or the bottom of its rate range."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by. Products that leave the sorted field empty are always returned last.",
          "enum": [
            "ratePercent",
            "name",
            "effectiveDate",
            "createdAt",
            "updatedAt"
          ],
          "default": "ratePercent"
        },
        "sortOrder": {
          "type": "string",
          "description": "Sort order. Either ascending or descending.",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "desc"
        }
      }
    }
  },
  {
    "name": "bankProduct_listByBank",
    "description": "This endpoint allows you to retrieve the products and services a bank publishes on its Moon Banking profile, such as deposit accounts, loans, and credit cards. Products are supplied and maintained by the bank's own verified representatives. Only published products are returned; drafts, archived entries, and anything removed by the Moon Banking team are excluded.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        }
      },
      "required": [
        "bankId"
      ]
    }
  },
  {
    "name": "bankProduct_create",
    "description": "This endpoint allows a bank's verified representatives to add a product to the bank's profile. Products default to published and appear on the bank's public page immediately. Pass `status` as `DRAFT` to stage a product without publishing it. You must be an approved representative of the bank.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "category": {
          "type": "string",
          "description": "The broad category the product belongs to. Drives how the product is grouped on the bank's page.",
          "enum": [
            "ACCOUNT",
            "CARD",
            "LOAN",
            "INVESTMENT",
            "INSURANCE",
            "SERVICE",
            "OTHER"
          ]
        },
        "type": {
          "type": "string",
          "description": "The specific kind of product.",
          "enum": [
            "CHECKING_ACCOUNT",
            "SAVINGS_ACCOUNT",
            "MONEY_MARKET_ACCOUNT",
            "CERTIFICATE_OF_DEPOSIT",
            "BUSINESS_CHECKING_ACCOUNT",
            "BUSINESS_SAVINGS_ACCOUNT",
            "YOUTH_ACCOUNT",
            "CREDIT_CARD",
            "DEBIT_CARD",
            "BUSINESS_CREDIT_CARD",
            "SECURED_CREDIT_CARD",
            "PREPAID_CARD",
            "PERSONAL_LOAN",
            "AUTO_LOAN",
            "MORTGAGE",
            "HOME_EQUITY_LOAN",
            "HOME_EQUITY_LINE_OF_CREDIT",
            "STUDENT_LOAN",
            "BUSINESS_LOAN",
            "LINE_OF_CREDIT",
            "CONSTRUCTION_LOAN",
            "BROKERAGE_ACCOUNT",
            "RETIREMENT_ACCOUNT",
            "WEALTH_MANAGEMENT",
            "INSURANCE",
            "WIRE_TRANSFER",
            "FOREIGN_EXCHANGE",
            "MERCHANT_SERVICES",
            "TREASURY_MANAGEMENT",
            "SAFE_DEPOSIT_BOX",
            "ONLINE_BANKING",
            "MOBILE_BANKING",
            "CRYPTO_SERVICE",
            "OTHER"
          ]
        },
        "name": {
          "type": "string",
          "description": "The product's marketing name."
        },
        "summary": {
          "type": "string"
        },
        "details": {
          "type": "string"
        },
        "url": {
          "type": "string"
        },
        "currency": {
          "type": "string"
        },
        "status": {
          "type": "string",
          "description": "Whether the product is a draft, published to the bank's page, or archived.",
          "enum": [
            "DRAFT",
            "PUBLISHED",
            "ARCHIVED"
          ]
        },
        "rateType": {
          "type": "string",
          "description": "How the rate on this product should be read.",
          "enum": [
            "APY",
            "APR",
            "INTRO_APR",
            "VARIABLE_APR",
            "INTEREST_RATE"
          ]
        },
        "ratePercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateMinPercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateMaxPercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateNote": {
          "type": "string"
        },
        "monthlyFeeCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "annualFeeCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "minimumOpeningDepositCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "minimumBalanceCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "termMonths": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1200
        },
        "termNote": {
          "type": "string"
        },
        "features": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "attributes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string",
                "description": "The name of the attribute."
              },
              "value": {
                "type": "string",
                "description": "The value of the attribute."
              }
            },
            "required": [
              "label",
              "value"
            ]
          }
        },
        "effectiveDate": {
          "type": "string",
          "description": "ISO 8601 date-time string",
          "format": "date-time"
        },
        "displayOrder": {
          "type": "integer",
          "minimum": 0,
          "maximum": 999
        }
      },
      "required": [
        "bankId",
        "category",
        "type",
        "name"
      ]
    }
  },
  {
    "name": "bankProduct_listForOwnedBank",
    "description": "This endpoint allows a bank's verified representatives to retrieve every product on the bank's profile, including drafts and archived entries that the public list omits. Use it to reconcile your own catalog against Moon Banking before syncing changes. You must be an approved representative of the bank.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        }
      },
      "required": [
        "bankId"
      ]
    }
  },
  {
    "name": "bankProduct_update",
    "description": "This endpoint allows a bank's verified representatives to replace a product's details. Every writable field is overwritten, so send the product's full state rather than only the fields that changed. This is the endpoint to call when rates or fees move. You must be an approved representative of the bank.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "id": {
          "type": "string",
          "description": "The product's auto-generated unique identifier."
        },
        "category": {
          "type": "string",
          "description": "The broad category the product belongs to. Drives how the product is grouped on the bank's page.",
          "enum": [
            "ACCOUNT",
            "CARD",
            "LOAN",
            "INVESTMENT",
            "INSURANCE",
            "SERVICE",
            "OTHER"
          ]
        },
        "type": {
          "type": "string",
          "description": "The specific kind of product.",
          "enum": [
            "CHECKING_ACCOUNT",
            "SAVINGS_ACCOUNT",
            "MONEY_MARKET_ACCOUNT",
            "CERTIFICATE_OF_DEPOSIT",
            "BUSINESS_CHECKING_ACCOUNT",
            "BUSINESS_SAVINGS_ACCOUNT",
            "YOUTH_ACCOUNT",
            "CREDIT_CARD",
            "DEBIT_CARD",
            "BUSINESS_CREDIT_CARD",
            "SECURED_CREDIT_CARD",
            "PREPAID_CARD",
            "PERSONAL_LOAN",
            "AUTO_LOAN",
            "MORTGAGE",
            "HOME_EQUITY_LOAN",
            "HOME_EQUITY_LINE_OF_CREDIT",
            "STUDENT_LOAN",
            "BUSINESS_LOAN",
            "LINE_OF_CREDIT",
            "CONSTRUCTION_LOAN",
            "BROKERAGE_ACCOUNT",
            "RETIREMENT_ACCOUNT",
            "WEALTH_MANAGEMENT",
            "INSURANCE",
            "WIRE_TRANSFER",
            "FOREIGN_EXCHANGE",
            "MERCHANT_SERVICES",
            "TREASURY_MANAGEMENT",
            "SAFE_DEPOSIT_BOX",
            "ONLINE_BANKING",
            "MOBILE_BANKING",
            "CRYPTO_SERVICE",
            "OTHER"
          ]
        },
        "name": {
          "type": "string",
          "description": "The product's marketing name."
        },
        "summary": {
          "type": "string"
        },
        "details": {
          "type": "string"
        },
        "url": {
          "type": "string"
        },
        "currency": {
          "type": "string"
        },
        "status": {
          "type": "string",
          "description": "Whether the product is a draft, published to the bank's page, or archived.",
          "enum": [
            "DRAFT",
            "PUBLISHED",
            "ARCHIVED"
          ]
        },
        "rateType": {
          "type": "string",
          "description": "How the rate on this product should be read.",
          "enum": [
            "APY",
            "APR",
            "INTRO_APR",
            "VARIABLE_APR",
            "INTEREST_RATE"
          ]
        },
        "ratePercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateMinPercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateMaxPercent": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000
        },
        "rateNote": {
          "type": "string"
        },
        "monthlyFeeCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "annualFeeCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "minimumOpeningDepositCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "minimumBalanceCents": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "termMonths": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1200
        },
        "termNote": {
          "type": "string"
        },
        "features": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "attributes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string",
                "description": "The name of the attribute."
              },
              "value": {
                "type": "string",
                "description": "The value of the attribute."
              }
            },
            "required": [
              "label",
              "value"
            ]
          }
        },
        "effectiveDate": {
          "type": "string",
          "description": "ISO 8601 date-time string",
          "format": "date-time"
        },
        "displayOrder": {
          "type": "integer",
          "minimum": 0,
          "maximum": 999
        }
      },
      "required": [
        "bankId",
        "id",
        "category",
        "type",
        "name"
      ]
    }
  },
  {
    "name": "bankProduct_delete",
    "description": "This endpoint allows a bank's verified representatives to permanently remove a product from the bank's profile. This cannot be undone. To retire a product while keeping its record, set its status to `ARCHIVED` instead. You must be an approved representative of the bank.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "id": {
          "type": "string",
          "description": "The product's auto-generated unique identifier."
        }
      },
      "required": [
        "bankId",
        "id"
      ]
    }
  },
  {
    "name": "bankProduct_setStatus",
    "description": "This endpoint allows a bank's verified representatives to move a product between draft, published, and archived without resubmitting its details. Archiving is the reversible way to retire a product you may bring back; deleting is permanent. You must be an approved representative of the bank.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "bankId": {
          "type": "string",
          "description": "The bank's auto-generated unique identifier."
        },
        "id": {
          "type": "string",
          "description": "The product's auto-generated unique identifier."
        },
        "status": {
          "type": "string",
          "description": "Whether the product is a draft, published to the bank's page, or archived.",
          "enum": [
            "DRAFT",
            "PUBLISHED",
            "ARCHIVED"
          ]
        }
      },
      "required": [
        "bankId",
        "id",
        "status"
      ]
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
  },
  {
    "name": "market_get",
    "description": "This endpoint allows you to retrieve a paginated list of markets (e.g. stock exchanges). You can search by name or code, filter by exact code, country, or market type, and sort the results.",
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
          "description": "Search markets by name or code."
        },
        "code": {
          "type": "string",
          "description": "Filter by exact market code (case sensitive)."
        },
        "countryCode": {
          "type": "string",
          "description": "Filter by 2-letter ISO country code."
        },
        "type": {
          "type": "string",
          "description": "Filter by market type.",
          "enum": [
            "STOCK"
          ]
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "name",
            "code",
            "createdAt"
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
        }
      }
    }
  },
  {
    "name": "market_getById",
    "description": "This endpoint allows you to retrieve a specific market (e.g. stock exchange) by providing the market id.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The stock exchange's auto-generated unique identifier."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "stock_get",
    "description": "This endpoint allows you to retrieve a paginated list of stock listings. You can search by ticker symbol, filter by exact symbol, market, bank, or primary-listing status, and sort the results.",
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
          "description": "Search stocks by ticker symbol."
        },
        "symbol": {
          "type": "string",
          "description": "Filter by exact ticker symbol (case sensitive)."
        },
        "marketId": {
          "type": "string",
          "description": "Filter by the id of the market this stock trades on."
        },
        "bankId": {
          "type": "string",
          "description": "Filter by the id of the bank this stock belongs to."
        },
        "isPrimary": {
          "type": "boolean",
          "description": "Filter by whether the listing is the bank's primary stock."
        },
        "sortBy": {
          "type": "string",
          "description": "Field to sort by.",
          "enum": [
            "symbol",
            "createdAt"
          ],
          "default": "symbol"
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
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `market`, `bank`"
        }
      }
    }
  },
  {
    "name": "stock_getById",
    "description": "This endpoint allows you to retrieve a specific stock listing by providing the stock id. You can optionally include the associated `market` and/or `bank` as nested objects.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The stock's auto-generated unique identifier."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `market`, `bank`"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "search_get",
    "description": "Search across banks, countries, stories, and stocks. You can specify which entities to search using the include parameter. If no include value is provided, all entities will be searched. Banks are also matched on the ticker symbol of their stock listings, so searching `BAC` returns Bank of America.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Search query string."
        },
        "include": {
          "type": "string",
          "description": "An optional  comma-separated list of fields to include in the response. Possible values: `banks`, `countries`, `stories`, `stocks`"
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of results to return per entity type.",
          "default": 10
        }
      },
      "required": [
        "q"
      ]
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
      case 'bank_getByHostname': {
        const result = await apiCall(
          'GET',
          `/banks/by-hostname`,
          {
            params: {
              hostname: args.hostname,
              include: args.include,
              pageTitle: args.pageTitle,
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

      case 'bank_semanticSearch': {
        const result = await apiCall(
          'GET',
          `/banks/semantic-search`,
          {
            params: {
              query: args.query,
              limit: args.limit,
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

      case 'bankProduct_list': {
        const result = await apiCall(
          'GET',
          `/bank-products`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              bankId: args.bankId,
              countryCode: args.countryCode,
              categories: args.categories,
              types: args.types,
              currency: args.currency,
              search: args.search,
              minRatePercent: args.minRatePercent,
              maxRatePercent: args.maxRatePercent,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
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

      case 'bankProduct_listByBank': {
        const result = await apiCall(
          'GET',
          `/banks/${args.bankId}/products`,
          {


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

      case 'bankProduct_create': {
        const result = await apiCall(
          'POST',
          `/banks/${args.bankId}/products`,
          {

            body: {
              category: args.category,
              type: args.type,
              name: args.name,
              summary: args.summary,
              details: args.details,
              url: args.url,
              currency: args.currency,
              status: args.status,
              rateType: args.rateType,
              ratePercent: args.ratePercent,
              rateMinPercent: args.rateMinPercent,
              rateMaxPercent: args.rateMaxPercent,
              rateNote: args.rateNote,
              monthlyFeeCents: args.monthlyFeeCents,
              annualFeeCents: args.annualFeeCents,
              minimumOpeningDepositCents: args.minimumOpeningDepositCents,
              minimumBalanceCents: args.minimumBalanceCents,
              termMonths: args.termMonths,
              termNote: args.termNote,
              features: args.features,
              attributes: args.attributes,
              effectiveDate: args.effectiveDate,
              displayOrder: args.displayOrder,
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

      case 'bankProduct_listForOwnedBank': {
        const result = await apiCall(
          'GET',
          `/banks/${args.bankId}/managed-products`,
          {


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

      case 'bankProduct_update': {
        const result = await apiCall(
          'PUT',
          `/banks/${args.bankId}/products/${args.id}`,
          {

            body: {
              category: args.category,
              type: args.type,
              name: args.name,
              summary: args.summary,
              details: args.details,
              url: args.url,
              currency: args.currency,
              status: args.status,
              rateType: args.rateType,
              ratePercent: args.ratePercent,
              rateMinPercent: args.rateMinPercent,
              rateMaxPercent: args.rateMaxPercent,
              rateNote: args.rateNote,
              monthlyFeeCents: args.monthlyFeeCents,
              annualFeeCents: args.annualFeeCents,
              minimumOpeningDepositCents: args.minimumOpeningDepositCents,
              minimumBalanceCents: args.minimumBalanceCents,
              termMonths: args.termMonths,
              termNote: args.termNote,
              features: args.features,
              attributes: args.attributes,
              effectiveDate: args.effectiveDate,
              displayOrder: args.displayOrder,
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

      case 'bankProduct_delete': {
        const result = await apiCall(
          'DELETE',
          `/banks/${args.bankId}/products/${args.id}`,
          {


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

      case 'bankProduct_setStatus': {
        const result = await apiCall(
          'PUT',
          `/banks/${args.bankId}/products/${args.id}/status`,
          {

            body: {
              status: args.status,
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

      case 'market_get': {
        const result = await apiCall(
          'GET',
          `/markets`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              search: args.search,
              code: args.code,
              countryCode: args.countryCode,
              type: args.type,
              sortBy: args.sortBy,
              sortOrder: args.sortOrder,
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

      case 'market_getById': {
        const result = await apiCall(
          'GET',
          `/markets/${args.id}`,
          {


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

      case 'stock_get': {
        const result = await apiCall(
          'GET',
          `/stocks`,
          {
            params: {
              limit: args.limit,
              starting_after: args.starting_after,
              ending_before: args.ending_before,
              search: args.search,
              symbol: args.symbol,
              marketId: args.marketId,
              bankId: args.bankId,
              isPrimary: args.isPrimary,
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

      case 'stock_getById': {
        const result = await apiCall(
          'GET',
          `/stocks/${args.id}`,
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

      case 'search_get': {
        const result = await apiCall(
          'GET',
          `/search`,
          {
            params: {
              q: args.q,
              include: args.include,
              limit: args.limit,
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
