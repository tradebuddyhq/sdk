import type { TradeBuddyConfig, Session, Listing, CreateListingInput, CreateWebhookInput, Webhook, CreateApiKeyInput, ApiKey } from './types.js';
/**
 * Typed error thrown by the TradeBuddy SDK when an API request fails
 * or returns an unsuccessful response.
 */
export declare class TradeBuddyError extends Error {
    /** HTTP status code, if the error originated from a network response. */
    readonly status: number | undefined;
    /** Raw response body, when available. */
    readonly body: unknown;
    constructor(message: string, status?: number, body?: unknown);
}
/**
 * Trade Buddy API client.
 *
 * ```ts
 * const client = new TradeBuddy();
 * const session = await client.signIn({ email: 'a@b.com', password: 'secret' });
 * const listings = await client.getListings();
 * ```
 */
export declare class TradeBuddy {
    private readonly baseUrl;
    private token;
    private readonly apiKey;
    constructor(config?: TradeBuddyConfig);
    /**
     * Create a new account.
     *
     * The bearer token is stored internally so subsequent authenticated
     * calls work automatically.
     */
    signUp(input: {
        name: string;
        email: string;
        password: string;
    }): Promise<Session>;
    /**
     * Sign in to an existing account.
     *
     * The bearer token is stored internally so subsequent authenticated
     * calls work automatically.
     */
    signIn(input: {
        email: string;
        password: string;
    }): Promise<Session>;
    /**
     * Sign out of the current session.
     *
     * Clears the internally stored token.
     */
    signOut(): Promise<void>;
    /**
     * Permanently delete the authenticated user's account.
     *
     * Clears the internally stored token.
     */
    deleteAccount(): Promise<void>;
    /** Fetch all public listings. No authentication required. */
    getListings(): Promise<Listing[]>;
    /** Create a new listing. Requires authentication. */
    createListing(input: CreateListingInput): Promise<string>;
    /** Create a new webhook subscription. Requires authentication. */
    createWebhook(input: CreateWebhookInput): Promise<Webhook>;
    /** List all webhook subscriptions. Requires authentication. */
    listWebhooks(): Promise<Webhook[]>;
    /** Delete a webhook subscription. Requires authentication. */
    deleteWebhook(webhookId: string): Promise<void>;
    /** Create a new API key. Requires authentication. */
    createApiKey(input: CreateApiKeyInput): Promise<ApiKey>;
    /** List all API keys for the authenticated user. */
    listApiKeys(): Promise<ApiKey[]>;
    /** Revoke an API key. Requires authentication. */
    revokeApiKey(keyId: string): Promise<void>;
    /** Returns the current bearer token, or `null` if not authenticated. */
    getToken(): string | null;
    /** Manually set the bearer token (e.g. to restore a previous session). */
    setToken(token: string): void;
    /** Returns `true` if a bearer token is currently stored. */
    isAuthenticated(): boolean;
    private requireAuth;
    private request;
}
//# sourceMappingURL=client.d.ts.map