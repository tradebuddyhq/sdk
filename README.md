# sdk

TypeScript SDK for the [Trade Buddy](https://mytradebuddy.com) API

## Installation

```bash
npm install @tradebuddyhq/sdk
```

> Requires Node.js 18+ 

## Quick Start

```ts
import { TradeBuddy } from '@tradebuddyhq/sdk';

const client = new TradeBuddy();

// Create an account
const session = await client.signUp({
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'supersecret',
});

console.log(session.user); // { id, name, email }
console.log(session.token); // bearer token (also stored internally)

// Browse listings (no auth needed)
const listings = await client.getListings();
```

## API Reference

### Constructor

```ts
const client = new TradeBuddy(config?: TradeBuddyConfig);
```

| Option    | Type     | Default                          | Description                          |
| --------- | -------- | -------------------------------- | ------------------------------------ |
| `baseUrl` | `string` | `https://mytradebuddy.com/api`   | API base URL                         |
| `token`   | `string` | -                                | Restore a previously saved token     |

### Authentication

#### `signUp(input): Promise<Session>`

```ts
const session = await client.signUp({
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'supersecret',
});
```

Creates a new account. The token is stored internally for subsequent calls

#### `signIn(input): Promise<Session>`

```ts
const session = await client.signIn({
  email: 'jane@example.com',
  password: 'supersecret',
});
```

Signs in to an existing account. The token is stored internally

#### `signOut(): Promise<void>`

```ts
await client.signOut();
```

Signs out and clears the stored token. Requires authentication

#### `deleteAccount(): Promise<void>`

```ts
await client.deleteAccount();
```

Permanently deletes the authenticated user's account. Requires authentication

### Listings

#### `getListings(): Promise<Listing[]>`

```ts
const listings = await client.getListings();

for (const listing of listings) {
  console.log(`${listing.title} - $${listing.price}`);
}
```

Fetches all public listings. No authentication required

#### `createListing(input): Promise<string>`

```ts
const listingId = await client.createListing({
  title: 'Calculus Textbook',
  type: 'Sell',
  price: 25,
  category: 'Books',
  condition: 'Good',
  description: 'Used for one semester, minor highlighting.',
});

console.log(`Created listing: ${listingId}`);
```

Creates a new listing. Requires authentication. Returns the new listing ID

### Token Management

```ts
client.getToken();          // string | null
client.setToken('abc123');  // manually set a token
client.isAuthenticated();   // boolean
```

### Error Handling

All errors are thrown as `TradeBuddyError`:

```ts
import { TradeBuddy, TradeBuddyError } from '@tradebuddyhq/sdk';

try {
  await client.signIn({ email: 'bad@example.com', password: 'wrong' });
} catch (err) {
  if (err instanceof TradeBuddyError) {
    console.error(err.message); // human-readable message
    console.error(err.status);  // HTTP status code (if available)
    console.error(err.body);    // raw response body (if available)
  }
}
```

## Types

```ts
type ListingType = 'Sell' | 'Donate' | 'Wanted';

type Category =
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

type Condition = 'New' | 'Like New' | 'Good' | 'Fair';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Session {
  user: User;
  token: string;
}

interface Listing {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  category: Category;
  condition: Condition;
  description: string;
}

interface CreateListingInput {
  title: string;
  type: ListingType;
  price: number;
  category: Category;
  condition: Condition;
  description: string;
}
```
