const DEFAULT_BASE_URL = 'https://mytradebuddy.com/api';
/**
 * Typed error thrown by the TradeBuddy SDK when an API request fails
 * or returns an unsuccessful response.
 */
export class TradeBuddyError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = 'TradeBuddyError';
        this.status = status;
        this.body = body;
        // Maintain proper prototype chain for instanceof checks.
        Object.setPrototypeOf(this, new.target.prototype);
    }
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
export class TradeBuddy {
    constructor(config = {}) {
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
        this.token = config.token ?? null;
    }
    // ---------------------------------------------------------------------------
    // Auth
    // ---------------------------------------------------------------------------
    /**
     * Create a new account.
     *
     * The bearer token is stored internally so subsequent authenticated
     * calls work automatically.
     */
    async signUp(input) {
        const data = await this.request('/auth.php?action=signup', {
            method: 'POST',
            body: input,
        });
        this.token = data.token;
        return { user: data.user, token: data.token };
    }
    /**
     * Sign in to an existing account.
     *
     * The bearer token is stored internally so subsequent authenticated
     * calls work automatically.
     */
    async signIn(input) {
        const data = await this.request('/auth.php?action=login', {
            method: 'POST',
            body: input,
        });
        this.token = data.token;
        return { user: data.user, token: data.token };
    }
    /**
     * Sign out of the current session.
     *
     * Clears the internally stored token.
     */
    async signOut() {
        this.requireAuth();
        await this.request('/auth.php?action=logout', {
            method: 'POST',
            auth: true,
        });
        this.token = null;
    }
    /**
     * Permanently delete the authenticated user's account.
     *
     * Clears the internally stored token.
     */
    async deleteAccount() {
        this.requireAuth();
        await this.request('/account.php?action=delete', {
            method: 'POST',
            auth: true,
        });
        this.token = null;
    }
    // ---------------------------------------------------------------------------
    // Listings
    // ---------------------------------------------------------------------------
    /** Fetch all public listings. No authentication required. */
    async getListings() {
        const data = await this.request('/listings.php', {
            method: 'GET',
        });
        return data.listings;
    }
    /** Create a new listing. Requires authentication. */
    async createListing(input) {
        this.requireAuth();
        const data = await this.request('/listings.php', {
            method: 'POST',
            body: input,
            auth: true,
        });
        return data.id;
    }
    // ---------------------------------------------------------------------------
    // Token helpers
    // ---------------------------------------------------------------------------
    /** Returns the current bearer token, or `null` if not authenticated. */
    getToken() {
        return this.token;
    }
    /** Manually set the bearer token (e.g. to restore a previous session). */
    setToken(token) {
        this.token = token;
    }
    /** Returns `true` if a bearer token is currently stored. */
    isAuthenticated() {
        return this.token !== null;
    }
    // ---------------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------------
    requireAuth() {
        if (!this.token) {
            throw new TradeBuddyError('Authentication required. Call signIn() or signUp() first.');
        }
    }
    async request(path, options) {
        const url = `${this.baseUrl}${path}`;
        const headers = {};
        if (options.auth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        let fetchInit;
        if (options.method === 'GET') {
            fetchInit = { method: 'GET', headers };
        }
        else {
            headers['Content-Type'] = 'application/json';
            fetchInit = {
                method: 'POST',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            };
        }
        let res;
        try {
            res = await fetch(url, fetchInit);
        }
        catch (err) {
            throw new TradeBuddyError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
        }
        let json;
        try {
            json = await res.json();
        }
        catch {
            throw new TradeBuddyError('Invalid JSON response from server', res.status);
        }
        if (!res.ok ||
            (typeof json === 'object' &&
                json !== null &&
                'success' in json &&
                !json.success)) {
            const message = (typeof json === 'object' &&
                json !== null &&
                'message' in json &&
                typeof json.message === 'string'
                ? json.message
                : undefined) ?? `Request failed with status ${res.status}`;
            throw new TradeBuddyError(message, res.status, json);
        }
        return json;
    }
}
//# sourceMappingURL=client.js.map