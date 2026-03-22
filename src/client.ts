import type {
  TradeBuddyConfig,
  Session,
  Listing,
  CreateListingInput,
  AuthResponse,
  SuccessResponse,
  ListingsResponse,
  CreateListingResponse,
} from './types.js';

const DEFAULT_BASE_URL = 'https://mytradebuddy.com/api';

/**
 * Typed error thrown by the TradeBuddy SDK when an API request fails
 * or returns an unsuccessful response.
 */
export class TradeBuddyError extends Error {
  /** HTTP status code, if the error originated from a network response. */
  public readonly status: number | undefined;
  /** Raw response body, when available. */
  public readonly body: unknown;

  constructor(message: string, status?: number, body?: unknown) {
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
  private readonly baseUrl: string;
  private token: string | null;

  constructor(config: TradeBuddyConfig = {}) {
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
  async signUp(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<Session> {
    const data = await this.request<AuthResponse>(
      '/auth.php?action=signup',
      {
        method: 'POST',
        body: input,
      },
    );

    this.token = data.token;
    return { user: data.user, token: data.token };
  }

  /**
   * Sign in to an existing account.
   *
   * The bearer token is stored internally so subsequent authenticated
   * calls work automatically.
   */
  async signIn(input: {
    email: string;
    password: string;
  }): Promise<Session> {
    const data = await this.request<AuthResponse>(
      '/auth.php?action=login',
      {
        method: 'POST',
        body: input,
      },
    );

    this.token = data.token;
    return { user: data.user, token: data.token };
  }

  /**
   * Sign out of the current session.
   *
   * Clears the internally stored token.
   */
  async signOut(): Promise<void> {
    this.requireAuth();
    await this.request<SuccessResponse>('/auth.php?action=logout', {
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
  async deleteAccount(): Promise<void> {
    this.requireAuth();
    await this.request<SuccessResponse>('/account.php?action=delete', {
      method: 'POST',
      auth: true,
    });
    this.token = null;
  }

  // ---------------------------------------------------------------------------
  // Listings
  // ---------------------------------------------------------------------------

  /** Fetch all public listings. No authentication required. */
  async getListings(): Promise<Listing[]> {
    const data = await this.request<ListingsResponse>('/listings.php', {
      method: 'GET',
    });
    return data.listings;
  }

  /** Create a new listing. Requires authentication. */
  async createListing(input: CreateListingInput): Promise<string> {
    this.requireAuth();
    const data = await this.request<CreateListingResponse>('/listings.php', {
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
  getToken(): string | null {
    return this.token;
  }

  /** Manually set the bearer token (e.g. to restore a previous session). */
  setToken(token: string): void {
    this.token = token;
  }

  /** Returns `true` if a bearer token is currently stored. */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private requireAuth(): void {
    if (!this.token) {
      throw new TradeBuddyError(
        'Authentication required. Call signIn() or signUp() first.',
      );
    }
  }

  private async request<T>(
    path: string,
    options: {
      method: 'GET' | 'POST';
      body?: object;
      auth?: boolean;
    },
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {};

    if (options.auth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let fetchInit: RequestInit;

    if (options.method === 'GET') {
      fetchInit = { method: 'GET', headers };
    } else {
      headers['Content-Type'] = 'application/json';
      fetchInit = {
        method: 'POST',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      };
    }

    let res: Response;
    try {
      res = await fetch(url, fetchInit);
    } catch (err) {
      throw new TradeBuddyError(
        `Network error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new TradeBuddyError(
        'Invalid JSON response from server',
        res.status,
      );
    }

    if (
      !res.ok ||
      (typeof json === 'object' &&
        json !== null &&
        'success' in json &&
        !(json as Record<string, unknown>).success)
    ) {
      const message =
        (typeof json === 'object' &&
          json !== null &&
          'message' in json &&
          typeof (json as Record<string, unknown>).message === 'string'
          ? (json as Record<string, string>).message
          : undefined) ?? `Request failed with status ${res.status}`;

      throw new TradeBuddyError(message, res.status, json);
    }

    return json as T;
  }
}
