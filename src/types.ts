/** Configuration for the TradeBuddy client. */
export interface TradeBuddyConfig {
  /** Base URL of the Trade Buddy API. Defaults to https://mytradebuddy.com/api */
  baseUrl?: string;
  /** Optional bearer token to restore a previous session. */
  token?: string;
  /** Optional API key for authentication instead of email/password. */
  apiKey?: string;
}

/** A Trade Buddy user. */
export interface User {
  id: string;
  name: string;
  email: string;
}

/** Session returned after successful authentication. */
export interface Session {
  user: User;
  token: string;
}

/** Listing type: selling, donating, or wanted. */
export type ListingType = 'Sell' | 'Donate' | 'Wanted';

/** Available listing categories. */
export type Category =
  | 'Books'
  | 'Electronics'
  | 'Clothing & Accessories'
  | 'School Uniform'
  | 'Sports Equipment'
  | 'Toys'
  | 'Video Games'
  | 'Board Games'
  | 'Furniture'
  | 'Kitchen Items'
  | 'Household Items'
  | 'Jewelry & Watches';

/** Condition of the listed item. */
export type Condition = 'New' | 'Like New' | 'Good' | 'Fair';

/** A listing on Trade Buddy. */
export interface Listing {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  category: Category;
  condition: Condition;
  description: string;
  [key: string]: unknown;
}

/** Input for creating a new listing. */
export interface CreateListingInput {
  title: string;
  type: ListingType;
  price: number;
  category: Category;
  condition: Condition;
  description: string;
}

/** Shape of a successful API response. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  [key: string]: T | boolean | undefined;
}

/** API response for authentication endpoints. */
export interface AuthResponse extends ApiResponse {
  user: User;
  token: string;
}

/** API response for sign-out and delete-account endpoints. */
export interface SuccessResponse extends ApiResponse {
  success: boolean;
}

/** API response for fetching listings. */
export interface ListingsResponse extends ApiResponse {
  listings: Listing[];
}

/** API response for creating a listing. */
export interface CreateListingResponse extends ApiResponse {
  id: string;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

/** Supported webhook event types. */
export type WebhookEvent =
  | 'listing.created'
  | 'listing.sold'
  | 'listing.deleted'
  | 'user.created'
  | 'user.deleted';

/** Input for creating a webhook subscription. */
export interface CreateWebhookInput {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

/** A webhook subscription. */
export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  createdAt: number;
}

/** API response for creating a webhook. */
export interface CreateWebhookResponse extends ApiResponse {
  webhook: Webhook;
}

/** API response for listing webhooks. */
export interface ListWebhooksResponse extends ApiResponse {
  webhooks: Webhook[];
}

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

/** API key type. */
export type ApiKeyType = 'secret' | 'public';

/** Available API key scopes. */
export type ApiKeyScope =
  | 'listings:read'
  | 'listings:write'
  | 'users:read'
  | 'users:write'
  | 'webhooks:manage'
  | 'analytics:read';

/** Input for creating an API key. */
export interface CreateApiKeyInput {
  name: string;
  type: ApiKeyType;
  scopes: ApiKeyScope[];
}

/** An API key. */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: ApiKeyType;
  scopes: ApiKeyScope[];
  lastUsed: string | null;
  requests: number;
  createdAt: number;
}

/** API response for creating an API key. */
export interface CreateApiKeyResponse extends ApiResponse {
  apiKey: ApiKey;
}

/** API response for listing API keys. */
export interface ListApiKeysResponse extends ApiResponse {
  apiKeys: ApiKey[];
}
