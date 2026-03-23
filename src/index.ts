// src/index.ts
import { TeachableV1 } from './v1';

/**
 * @module TeachableClient
 * @description The main entry point for the Teachable API client.
 * Initialises and exposes versioned API interfaces.
 */

/**
 * The root client for interacting with the Teachable API.
 * Instantiating this class automatically sets up all versioned sub-clients.
 *
 * @example
 * import { TeachableClient } from './src';
 *
 * const client = new TeachableClient('your-api-key');
 * const users = await client.v1.users.getList();
 */
export class TeachableClient {

    /**
     * Provides access to all Teachable v1 API resources,
     * including users, transactions, and courses.
     */
    public v1: TeachableV1;

    /**
     * Creates a new TeachableClient instance and initialises the v1 sub-client.
     * @param apiKey - Your Teachable API key, used to authenticate all requests.
     */
    constructor(apiKey: string) {
        // Automatically initialise V1 when the main client is created
        this.v1 = new TeachableV1(apiKey);
    }
}

/**
 * Re-exports all Zod schemas and inferred TypeScript types from the v1 schema definitions,
 * so consuming applications can use them for validation and type safety without
 * importing directly from internal paths.
 */
export * from './v1/schemas';